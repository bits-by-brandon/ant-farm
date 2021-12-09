import World from "./world";
import Vector from "./vector";

export default abstract class Entity implements Updatable {
  readonly world: World;
  noise: Noise;
  pos: Vector;

  protected constructor(pos: Vector, world: World, noise: Noise) {
    this.pos = pos;
    this.world = world;
    this.noise = noise;
  }

  update(_delta: number, _step: number) {}
  draw(_ctx: CanvasRenderingContext2D) {}
}

export enum ENTITY_TYPE {
  EMPTY = 0,
  ANT = 1,
  FOOD = 2,
  NEST = 3,
}
