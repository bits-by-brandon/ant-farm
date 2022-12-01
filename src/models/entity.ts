import World from "./world";
import Vector from "./vector";

export default abstract class Entity implements Updatable {
  static type = "GenericEntity";

  readonly world: World;
  noise: NoiseFunc;
  pos: Vector;

  protected constructor(pos: Vector, world: World, noise: NoiseFunc) {
    this.pos = pos;
    this.world = world;
    this.noise = noise;
  }

  update(_step: number) {}
  draw(_ctx: CanvasRenderingContext2D) {}
}
