import { State } from "../../state";
import Ant from "../index";
import map from "../../../util/map";
import Food from "../../food";
import { PheromoneType } from "../../pheromone";

export class Foraging implements State {
  private parent: Ant;

  constructor(parent: Ant) {
    this.parent = parent;
  }

  enter() {

  }
  exit() {
    // No op
  }

  update(delta: number, step: number) {
    this.turnRandomDirection(delta, step);
    this.parent.updatePosition();
    this.parent.terrainCollide();
    this.parent.mapEdgeCollide();
    this.parent.updateGridPosition();
    this.parent.updatePheromone(delta, () => {
      this.parent.dropPheromone(PheromoneType.Home);
    });

    // Check if food shares tile with ant, if so:
    const food = this.checkForFood();
    if (food) {
      // turn around
      this.parent.steerAngle += Math.PI;
      food.take();
      this.parent.held = true;
      // start returning with the food
      this.parent.setState(this.parent.states.returning);
    }
  }

  checkForFood(): Food | null {
    const food = this.parent.world.nearby(
      this.parent,
      this.parent.foodDetectionRange,
      "Food"
    ) as Food[];

    return food[0] || null;
  }

  turnRandomDirection(delta: number, step: number) {
    // scalar function applied to delta to reduce scale of noise steps;
    const steerStep = delta * step * this.parent.wiggleVariance;

    if (Math.random() <= this.parent.turnChance) {
      this.parent.steerAngle += map(
        Math.random(),
        0,
        1,
        -this.parent.turnRange,
        this.parent.turnRange
      );
    }

    // TODO: Update random walk to levy flight walk
    this.parent.steerAngle += map(
      this.parent.noise(
        steerStep + 100 * this.parent.id,
        steerStep + 200 * this.parent.id
      ),
      -1,
      1,
      -this.parent.wiggleRange,
      this.parent.wiggleRange
    );
  }
}
