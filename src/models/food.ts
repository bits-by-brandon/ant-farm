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
    ctx.fillStyle = "#0ff";
    ctx.fillRect(this.pos.x, this.pos.y, 1, 1);
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
