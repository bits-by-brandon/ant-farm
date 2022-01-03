import World from "./world";
import Vector from "./vector";

export default abstract class Entity implements Updatable {
  static type = "GenericEntity";

  readonly world: World;
  noise: Noise;
  pos: Vector;

  protected constructor(pos: Vector, world: World, noise: Noise) {
    this.pos = pos;
    this.world = world;
    this.noise = noise;
  }

  update(_step: number) {}
  draw(_ctx: CanvasRenderingContext2D) {}
}
