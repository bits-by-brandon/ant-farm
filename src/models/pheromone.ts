import Entity from "./entity";
import Vector from "./vector";
import World from "./world";
import map from "../util/map";

export enum PheromoneType {
  Food = "FOOD",
  Home = "HOME",
}

export default class Pheromone extends Entity {
  strength: number;
  type: PheromoneType;

  static maxStrength = 100;
  static decayRate = 0.15;

  constructor(type: PheromoneType, pos: Vector, world: World, noise: Noise) {
    super(pos, world, noise);
    this.strength = Pheromone.maxStrength;
    this.type = type;
  }

  update() {
    this.strength -= Pheromone.decayRate;

    if (this.strength <= 0) this.world.remove(this, "Pheromone");
  }

  draw(ctx: CanvasRenderingContext2D) {
    const alphaValue = map(this.strength, 0, 100, 0, 1);

    switch (this.type) {
      case PheromoneType.Food:
        if (!this.world.visibilityLayers.get("foodPheromone")) return;
        ctx.fillStyle = `rgba(255, 0, 0, ${alphaValue})`;
        break;
      case PheromoneType.Home:
      default:
        if (!this.world.visibilityLayers.get("homePheromone")) return;
        ctx.fillStyle = `rgba(0, 0, 255, ${alphaValue})`;
    }

    ctx.fillRect(this.pos.x, this.pos.y, 1, 1);
  }
}
