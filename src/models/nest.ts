import Entity from "./entity";
import Vector from "./vector";
import World from "./world";
import { Rectangle } from "../lib/rectangle";

interface NestConstructor {
  x: number;
  y: number;
  id: number;
  world: World;
  noise: NoiseFunc;
}

export default class Nest extends Entity {
  static type = "Nest";

  public readonly id: number;
  readonly boundary: Rectangle;

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "#333";
    ctx.fillRect(this.pos.x - 10, this.pos.y - 10, 20, 20);
  }

  constructor(args: NestConstructor) {
    const { x, y, id, world, noise } = args;
    super(new Vector(x, y), world, noise);
    this.id = id;
    this.boundary = new Rectangle(x, y, 10, 10);
  }
}
