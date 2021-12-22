import { State } from "../../state";
import Ant from "../index";
import {PheromoneType} from "../../pheromone";

export class Returning implements State {
  private parent: Ant;

  constructor(parent: Ant) {
    this.parent = parent;
  }

  enter() {}
  exit() {}

  update(delta: number) {
    // begin foraging if nothing is held
    if (!this.parent.held) {
      this.parent.setState(this.parent.states.foraging);
      return;
    }

    this.parent.updatePosition();
    this.parent.terrainCollide();
    this.parent.mapEdgeCollide();
    this.parent.updateSensorRects();
    this.parent.updatePheromone(delta, () => {
      this.parent.dropPheromone(PheromoneType.Food);
    });
    this.parent.updateGridPosition();
  }
}
