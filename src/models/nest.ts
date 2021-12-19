import Entity from "./entity";
import Vector from "./vector";
import World from "./world";

interface NestConstructor {
  x: number;
  y: number;
  id: number;
  world: World;
  noise: Noise;
}

export default class Nest extends Entity {
  static type = "Nest";

  public readonly id: number;

  constructor(args: NestConstructor) {
    const { x, y, id, world, noise } = args;
    super(new Vector(x, y), world, noise);
    this.id = id;
  }
}
