import Entity from "./entity";
import getRandomNumber from "../util/get-random-number";

export default class Ant extends Entity {
  public vel: Vector;

  constructor(x: number, y: number) {
    super(x, y);
    this.vel = { x: 0, y: 0 };
    this.changeDirection();
  }

  changeDirection() {
    this.vel.x = getRandomNumber(-1, 2);
    this.vel.y = getRandomNumber(-1, 2);

    setTimeout(this.changeDirection.bind(this), 500);
  }

  update() {}
}
