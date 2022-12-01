import { State } from "../../state";
import Ant from "../index";
import Pheromone, { PheromoneType } from "../../pheromone";

export class Returning implements State {
  private parent: Ant;
  private foodStrength: number;

  constructor(parent: Ant) {
    this.parent = parent;
    this.foodStrength = Pheromone.maxStrength;
  }

  enter() {
    // turn around
    this.parent.dropPheromone(PheromoneType.Food, Pheromone.maxStrength);
    this.parent.desiredRotation += Math.PI;
    this.foodStrength = Pheromone.maxStrength;
  }
  exit() {}

  update(step: number) {
    // begin foraging if nothing is held
    if (!this.parent.held) {
      this.parent.state = this.parent.states.foraging;
      return;
    }

    this.foodStrength -= Pheromone.evaporationRate - 0.04;
    const foundPheromone = this.parent.followPheromone(PheromoneType.Home);
    if (!foundPheromone) {
      this.parent.turnRandomDirection();
      this.parent.wiggle(step);
    }
    this.turnToNest();
    this.parent.updatePosition();
    this.parent.terrainCollide();
    this.parent.mapEdgeCollide();
    this.parent.updateSensorRects();
    this.parent.updatePheromone(() => {
      this.parent.dropPheromone(PheromoneType.Food, this.foodStrength);
    });
    this.parent.updateGridPosition();

    if (this.parent.nest.boundary.contains(this.parent.pos)) {
      this.parent.desiredRotation += Math.PI;
      this.parent.held = false;
      this.parent.state = this.parent.states.foraging;
      return;
    }
  }

  turnToNest() {
    const nest = this.parent.nest;
    if (nest.pos.dist(this.parent.pos) < 50) {
      this.parent.desiredRotation = nest.pos
        .copy()
        .sub(this.parent.pos)
        .toPolar();
    }
  }
}
