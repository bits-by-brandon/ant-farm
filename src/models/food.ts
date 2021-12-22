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
  static type = "Food";

  constructor(args: FoodConstructor) {
    const { x, y, world, noise } = args;
    super(new Vector(x, y), world, noise);
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "#61da00";
    // ctx.strokeStyle = "#183a01";
    ctx.fillRect(this.pos.x, this.pos.y, 1, 1);
    // ctx.beginPath();
    // ctx.arc(this.pos.x, this.pos.y, 2, 0, Math.PI * 2);
    // ctx.fill();
    // ctx.stroke();
  }
}

export class FoodFactory {
  readonly noise: Noise;
  readonly world: World;

  constructor(world: World, noise: Noise) {
    this.world = world;
    this.noise = noise;
  }

  create(pos: VectorPair) {
    const food = new Food({
      x: pos.x,
      y: pos.y,
      world: this.world,
      noise: this.noise,
    });
    this.world.insert(food, "Food");
    return food;
  }
}
