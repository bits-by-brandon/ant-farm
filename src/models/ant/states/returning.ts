import { State } from "../../state";
import Ant from "../index";
import { PheromoneType } from "../../pheromone";

export class Returning implements State {
  private parent: Ant;

  constructor(parent: Ant) {
    this.parent = parent;
  }

  enter() {}
  exit() {}

  update() {
    // begin foraging if nothing is held
    if (!this.parent.held) {
      this.parent.setState(this.parent.states.foraging);
      return;
    }

    this.parent.updatePosition();
    this.parent.terrainCollide();
    this.parent.mapEdgeCollide();
    this.parent.updateSensorRects();
    this.parent.followPheromone(PheromoneType.Home);
    this.parent.updatePheromone(() => {
      this.parent.dropPheromone(PheromoneType.Food);
    });
    this.parent.updateGridPosition();

    if (this.parent.nest.boundary.contains(this.parent.pos)) {
      this.parent.desiredRotation += Math.PI;
      this.parent.held = false;
      this.parent.setState(this.parent.states.foraging);
      return;
    }
  }
}
