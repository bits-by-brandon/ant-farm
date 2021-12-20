import Entity from "./entity";
import Quadtree, { Rectangle } from "./quadtree";

type Tile = number;
type EntityLayer = {
  entities: Set<Entity>;
  qtree: Quadtree;
  isDynamic: boolean;
};
type MapDataLayer = Uint8Array;

const quadtreeCapacity = 4;
const DEFAULT_LAYER_ID = "DEFAULT";

interface ConstructorParams {
  width: number;
  height: number;
  entities?: Entity[];
  terrainData: MapDataLayer;
}

export default class World {
  readonly width: number;
  readonly height: number;
  readonly entities: Entity[];
  readonly terrainData: MapDataLayer;
  public entityLayers: Map<string, EntityLayer>;

  constructor({ width, height, entities, terrainData }: ConstructorParams) {
    this.width = width;
    this.height = height;
    this.entities = entities || [];
    this.entityLayers = new Map<string, EntityLayer>();

    this.validateMapLayer(terrainData);
    this.terrainData = terrainData;
  }

  validateMapLayer(layer: MapDataLayer) {
    // The expected number of bytes in the generated wordData buffer
    const byteLength = this.width * this.height * 4;
    if (layer.byteLength !== byteLength) {
      throw new Error(
        "Provided buffer is not the right size. Provide a buffer of size"
      );
    }
  }

  /**
   * Insert an entity into the world layer system.
   * If no layerId is provided, the entity will be placed in the default layer.
   * If the given layerId does not match any existing layer, a new layer will be created.
   *
   * @param entity - Entity to be inserted into a layer
   * @param layerId - [optional] ID of layer to insert
   * @param isDynamic - [optional] If true, will update the quadtree every frame. If the entities in this layer
   *                   do not move, keep isDynamic false for performance gains.
   */
  insert(entity: Entity, layerId = DEFAULT_LAYER_ID, isDynamic = false) {
    let layer = this.entityLayers.get(layerId);
    if (!layer) {
      // If no existing layer is found, initialize a new layer
      const entities: Set<Entity> = new Set<Entity>();
      const qtree = new Quadtree(
        new Rectangle(
          this.width / 2,
          this.height / 2,
          this.width / 2,
          this.height / 2
        ),
        quadtreeCapacity
      );

      layer = { entities, qtree, isDynamic: isDynamic };
      this.entityLayers.set(layerId, layer);
    }

    layer.entities.add(entity);
    layer.qtree.insert(entity);
    this.entities.push(entity);
  }

  remove(entity: Entity, layerId = DEFAULT_LAYER_ID): Entity | null {
    // Remove the entry from the full entity list
    const index = this.entities.indexOf(entity);
    if (index > -1) {
      this.entities.splice(index, 1);
    }

    // Remove the entry from the qtree layers
    const layer = this.entityLayers.get(layerId);
    if (!layer) return null;

    layer.qtree.remove(entity);
    layer.entities.delete(entity);
    return entity;
  }

  update() {
    for (const layer of this.entityLayers.values()) {
      // Static layers do not need to be cleared every frame
      if (!layer.isDynamic) continue;

      layer.qtree.clear();
      for (const entity of layer.entities) {
        layer.qtree.insert(entity);
      }
    }
  }

  /**
   *  Each layer contains a set of all entities in that layer, and a
   *  quadtree spacial map for quick querying.
   * @param range
   * @param layerId
   */
  query(range: Rectangle, layerId = DEFAULT_LAYER_ID) {
    if (layerId === "ALL") {
      const found: Entity[] = [];
      for (const layer of this.entityLayers.values()) {
        found.push(...layer.qtree.query(range));
      }
      return found;
    }

    const layer = this.entityLayers.get(layerId);
    return layer?.qtree.query(range) || [];
  }

  nearby(entity: Entity, radius: number, layerId = DEFAULT_LAYER_ID): Entity[] {
    return this.query(
      new Rectangle(entity.pos.x, entity.pos.y, radius, radius),
      layerId
    );
  }

  getTerrainValue(x: number, y: number) {
    return this.terrainData[y * (this.width * 4) + x * 4];
  }

  /**
   * Uses the bitScheme to parse out the given property from the 32 bit data chunk
   */
  static getBitValue(tile: Tile, property: keyof typeof World.bitScheme) {
    const { offset, mask } = World.bitScheme[property];
    // (Left side of >>>) bitwise & to mask out all irrelevant bits
    // (>>> and operand) shift bits by the offset to isolate value
    return (tile & mask) >>> offset;
  }

  /**
   * Uses the bitScheme to set given property to the 32 bit data chunk
   */
  static setBitValue(
    tile: Tile,
    property: keyof typeof World.bitScheme,
    value: number
  ) {
    const { mask, offset } = World.bitScheme[property];
    // (Right side of OR) empty the mask subsection of the tile
    // (Left side of OR) shift the new value into the right spot
    // apply the shifted value to the tile
    return (value << offset) | (tile & ~mask);
  }

  // prettier-ignore
  static bitScheme = {
    entityType: { length: 4,  offset: 0,  mask: 0b00000000000000000000000000001111 },
    entityId:   { length: 12, offset: 4,  mask: 0b00000000000000001111111111110000 },
    terrain:    { length: 2,  offset: 16, mask: 0b00000000000000110000000000000000 },
    homeTrail:  { length: 3,  offset: 18, mask: 0b00000000000111000000000000000000 },
    foodTrail:  { length: 3,  offset: 21, mask: 0b00000000111000000000000000000000 },
  } as const;
}

export enum TILE_PROPS {
  "ENTITY_TYPE" = 0,
  "ENTITY_ID" = 1,
  "TERRAIN" = 2,
  "HOME_TRAIL" = 3,
  "FOOD_TRAIL" = 4,
}
