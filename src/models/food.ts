import Entity from "./entity";
import Vector from "./vector";
import World from "./world";
import map from "../util/map";

interface FoodConstructor {
  x: number;
  y: number;
  world: World;
  noise: Noise;
  quantity?: number;
}

export default class Food extends Entity {
  static type = "Food";
  quantity: number;

  constructor(args: FoodConstructor) {
    const { x, y, world, noise } = args;
    super(new Vector(x, y), world, noise);
    this.quantity = args.quantity || 4;
  }

  take() {
    this.quantity -= 1;
    if (this.quantity <= 0) {
      this.world.remove(this);
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    const alpha = map(this.quantity, 0, 4, 0, 1);
    ctx.fillStyle = `rgba(10, 148, 24, ${alpha})`;
    ctx.fillRect(this.pos.x, this.pos.y, 2, 2);
  }
}

export class FoodFactory {
  readonly noise: Noise;
  readonly world: World;

  constructor(world: World, noise: Noise) {
    this.world = world;
    this.noise = noise;
  }

  create(pos: VectorPair, quantity: number) {
    const food = new Food({
      x: pos.x,
      y: pos.y,
      world: this.world,
      noise: this.noise,
      quantity,
    });
    this.world.insert(food, "Food");
    return food;
  }
}
