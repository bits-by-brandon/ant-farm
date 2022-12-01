import { State } from "../../state";
import Ant from "../index";
import Food from "../../food";
import Pheromone, { PheromoneType } from "../../pheromone";
import { Rectangle } from "../../../lib/rectangle";

export class Foraging implements State {
  private parent: Ant;
  private homeStrength: number;

  constructor(parent: Ant) {
    this.parent = parent;
    this.homeStrength = Pheromone.maxStrength;
  }

  enter() {
    this.homeStrength = Pheromone.maxStrength;
  }
  exit() {}

  update(step: number) {
    this.homeStrength -= Pheromone.evaporationRate - 0.04;

    const foundFood = this.parent.followFood();
    if (!foundFood) {
      this.parent.followPheromone(PheromoneType.Food);
    }
    this.parent.turnRandomDirection();
    this.parent.wiggle(step);
    this.parent.updatePosition();
    this.parent.terrainCollide();
    this.parent.mapEdgeCollide();
    this.parent.updateGridPosition();
    this.parent.updateSensorRects();
    this.parent.updatePheromone(() => {
      this.parent.dropPheromone(PheromoneType.Home, this.homeStrength);
    });

    // Check if food shares tile with ant, if so:
    const food = this.checkForFood();
    if (food) {
      food.take();
      this.parent.held = true;
      // start returning with the food
      this.parent.state = this.parent.states.returning;
    }
  }

  checkForFood(): Food | null {
    const food = this.parent.world.query<Food>(
      new Rectangle(
        this.parent.pos.x,
        this.parent.pos.y,
        this.parent.foodDetectionRange,
        this.parent.foodDetectionRange
      ),
      "Food"
    );

    return food[0] || null;
  }
}
