import Entity from "./entity";
import Quadtree from "../lib/quadtree";
import {Rectangle} from "../lib/rectangle";

type EntityLayer = {
  entities: Set<Entity>;
  qtree: Quadtree;
  isDynamic: boolean;
};
type MapDataLayer = Uint8Array;
export type visibilityLayerName =
  | "sensor"
  | "antQTree"
  | "pheromoneQTree"
  | "foodPheromone"
  | "homePheromone";
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
  readonly visibilityLayers: Map<visibilityLayerName, boolean>;
  public entityLayers: Map<string, EntityLayer>;

  constructor({ width, height, entities, terrainData }: ConstructorParams) {
    this.width = width;
    this.height = height;
    this.entities = entities || [];
    this.entityLayers = new Map<string, EntityLayer>();
    this.visibilityLayers = new Map([
      ["sensor", false],
      ["antQTree", false],
      ["pheromoneQTree", false],
      ["foodPheromone", true],
      ["homePheromone", true],
    ]);

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

      layer = { entities, qtree, isDynamic };
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
  query<T extends Entity = Entity>(range: Rectangle, layerId = DEFAULT_LAYER_ID): T[] {
    if (layerId === "ALL") {
      const found: T[] = [];
      for (const layer of this.entityLayers.values()) {
        found.push(...layer.qtree.query(range) as T[]);
      }
      return found;
    }

    const layer = this.entityLayers.get(layerId);
    return layer?.qtree.query(range) as T[] || [];
  }

  getTerrainValue(x: number, y: number) {
    return this.terrainData[y * (this.width * 4) + x * 4];
  }
}
