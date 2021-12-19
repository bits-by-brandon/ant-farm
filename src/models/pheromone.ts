import Entity from "./entity";
import Vector from "./vector";
import World from "./world";

export enum PheromoneType {
  Food = "FOOD",
  Home = "HOME",
}

export default class Pheromone extends Entity {
  strength: number;
  type: PheromoneType;

  static maxStrength = 100;
  static decayRate = 1;

  constructor(type: PheromoneType, pos: Vector, world: World, noise: Noise) {
    super(pos, world, noise);
    this.strength = Pheromone.maxStrength;
    this.type = type;
  }

  update(delta: number) {
    this.strength -= Pheromone.decayRate * delta;

    if (this.strength <= 0) {
      this.world.remove(this);
    }
  }
}
