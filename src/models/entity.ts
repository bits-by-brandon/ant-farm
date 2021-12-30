import World from "./world";
import Vector from "./vector";

export default abstract class Entity implements Updatable {
  readonly world: World;
  propDescriptions?: UiPropList<Entity>;
  noise: Noise;
  pos: Vector;

  protected constructor(pos: Vector, world: World, noise: Noise) {
    this.pos = pos;
    this.world = world;
    this.noise = noise;
  }

  static type = "GenericEntity";

  update(_step: number) {}
  draw(_ctx: CanvasRenderingContext2D) {}
}
