import { State } from "../../state";
import Ant from "../index";

export class Returning implements State {
  private parent: Ant;

  constructor(parent: Ant) {
    this.parent = parent;
  }

  enter() {
    console.log("returning home");
  }
  exit() {}

  update(_delta: number, _step: number) {
    // begin foraging if nothing is held
    if (!this.parent.held) {
      this.parent.setState(this.parent.states.foraging);
      return;
    }

    this.parent.updatePosition();
    this.parent.mapEdgeCollide();
    this.parent.updateGridPosition();
  }
}
