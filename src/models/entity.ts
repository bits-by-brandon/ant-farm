import World from "./world";
import Vector from "./vector";

export default abstract class Entity {
  public lastPos: Vector;
  public pos: Vector;
  protected world: World;
  protected noise: Noise;

  constructor(x: number, y: number, world: World, noise: Noise) {
    this.pos = new Vector(x, y);
    this.lastPos = new Vector(x, y);
    this.world = world;
    this.noise = noise;
  }

  update(_delta: number, _step: number) {}
}

export enum ENTITY_TYPE {
  EMPTY = 0,
  ANT = 1,
}
