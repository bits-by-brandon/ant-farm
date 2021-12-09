import Entity from "./entity";

type Tile = number;

export default class World {
  readonly width: number;
  readonly height: number;
  readonly data: ArrayBuffer;
  readonly grid: Uint32Array;
  readonly entities: Entity[];

  constructor(
    width: number,
    height: number,
    entities?: Entity[],
    worldData?: ArrayBuffer
  ) {
    this.width = width;
    this.height = height;
    this.entities = entities || [];

    // The expected number of bytes in the generated wordData buffer
    const byteLength = width * height * 4;

    // Initialize the worldData
    if (worldData) {
      if (worldData.byteLength !== byteLength) {
        throw new Error(
          "Provided buffer is not the right size. Provide a buffer of size"
        );
      }
      this.data = worldData;
    } else {
      this.data = new ArrayBuffer(byteLength);
    }

    // Create the Uint32Array to access the data buffer
    this.grid = new Uint32Array(this.data);
  }

  getTileRaw(x: number, y: number): Tile {
    return this.grid[y * this.width + x];
  }

  getTileProp(x: number, y: number, property: keyof typeof World.bitScheme) {
    return World.getBitValue(this.getTileRaw(x, y), property);
  }

  getTile(x: number, y: number) {
    const tile = this.getTileRaw(x, y);
    const { bitScheme } = World;
    return [
      (tile & bitScheme.entityType.mask) >>> bitScheme.entityType.offset, //entityType
      (tile & bitScheme.entityId.mask) >>> bitScheme.entityId.offset, //entityId
      (tile & bitScheme.terrain.mask) >>> bitScheme.terrain.offset, //terrain
      (tile & bitScheme.homeTrail.mask) >>> bitScheme.homeTrail.offset, //homeTrail
      (tile & bitScheme.foodTrail.mask) >>> bitScheme.foodTrail.offset, //foodTrail
    ];
  }

  setTileProp(
    x: number,
    y: number,
    property: keyof typeof World.bitScheme,
    value: number
  ) {
    const tile = this.getTileRaw(x, y);
    this.setTileRaw(x, y, World.setBitValue(tile, property, value));
  }

  setTileRaw(x: number, y: number, value: number) {
    this.grid[y * this.width + x] = value;
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

  static bitScheme = {
    entityType: { length: 4, offset: 0, mask: 0xf }, // 1111
    entityId: { length: 12, offset: 4, mask: 0xfff0 }, // 111111111111-0000
    terrain: { length: 2, offset: 16, mask: 0x30000 }, // 11-000000000000-0000
    homeTrail: { length: 3, offset: 18, mask: 0x1c0000 }, // 111-00-000000000000-0000
    foodTrail: { length: 3, offset: 21, mask: 0xe00000 }, // 111-000-00-000000000000-0000
  } as const;
}

export enum TILE_PROPS {
  "ENTITY_TYPE" = 0,
  "ENTITY_ID" = 1,
  "TERRAIN" = 2,
  "HOME_TRAIL" = 3,
  "FOOD_TRAIL" = 4,
}
