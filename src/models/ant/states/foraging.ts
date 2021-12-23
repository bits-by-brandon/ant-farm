import { State } from "../../state";
import Ant from "../index";
import map from "../../../util/map";
import Food from "../../food";
import { PheromoneType } from "../../pheromone";
import { Rectangle } from "../../../lib/rectangle";

export class Foraging implements State {
  private parent: Ant;

  constructor(parent: Ant) {
    this.parent = parent;
  }

  enter() {}
  exit() {
    // No op
  }

  update(step: number) {
    this.turnRandomDirection(step);
    this.parent.updatePosition();
    this.parent.terrainCollide();
    this.parent.mapEdgeCollide();
    this.parent.updateGridPosition();
    this.parent.updateSensorRects();
    this.parent.followPheromone(PheromoneType.Food);

    this.parent.updatePheromone(() => {
      this.parent.dropPheromone(PheromoneType.Home);
    });

    // Check if food shares tile with ant, if so:
    const food = this.checkForFood();
    if (food) {
      // turn around
      this.parent.desiredRotation += Math.PI;
      food.take();
      this.parent.held = true;
      // start returning with the food
      this.parent.setState(this.parent.states.returning);
    }
  }

  checkForFood(): Food | null {
    const food = this.parent.world.query(
      new Rectangle(
        this.parent.pos.x,
        this.parent.pos.y,
        this.parent.foodDetectionRange,
        this.parent.foodDetectionRange
      ),
      "Food"
    ) as Food[];

    return food[0] || null;
  }

  turnRandomDirection(step: number) {
    // scalar function applied to the current step to reduce scale of noise steps;
    const steerStep = step * this.parent.wiggleVariance;

    if (Math.random() <= this.parent.turnChance) {
      this.parent.desiredRotation += map(
        Math.random(),
        0,
        1,
        -this.parent.turnRange,
        this.parent.turnRange
      );
    }

    // TODO: Update random walk to levy flight walk
    this.parent.desiredRotation += map(
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
