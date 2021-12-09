import Entity from "./entity";
import Vector from "./vector";
import World from "./world";

interface FoodConstructor {
  x: number;
  y: number;
  world: World;
  noise: Noise;
}

export default class Food extends Entity {
  constructor(args: FoodConstructor) {
    const { x, y, world, noise } = args;
    super(new Vector(x, y), world, noise);
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "#0f0";
    ctx.fillRect(this.pos.x / 2, this.pos.y / 2, 2, 2);
  }
}
