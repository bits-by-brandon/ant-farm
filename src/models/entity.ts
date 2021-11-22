export default abstract class Entity {
  public pos: Vector;

  constructor(x: number, y: number) {
    this.pos = { x, y };
  }

  update(_delta: number) {}
}
