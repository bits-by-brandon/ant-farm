export default class Vector implements VectorPair {
  public x: number;
  public y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  static fromPolar(theta: number) {
    return new Vector(Math.cos(theta), Math.sin(theta)).normalize();
  }

  toPolar(): number {
    return Math.atan2(this.y, this.x);
  }

  copy() {
    return new Vector(this.x, this.y);
  }

  add(operand: VectorPair) {
    this.x += operand.x;
    this.y += operand.y;
    return this;
  }

  sub(operand: VectorPair) {
    this.x -= operand.x;
    this.y -= operand.y;
    return this;
  }

  normalize() {
    if (this.mag() !== 0) this.mult(1 / this.mag());
    return this;
  }

  mag() {
    return Math.sqrt(this.magSq());
  }

  magSq() {
    return this.x * this.x + this.y * this.y;
  }

  mult(operand: VectorPair | number) {
    if (typeof operand === "number") {
      this.x *= operand;
      this.y *= operand;
    } else {
      this.x *= operand.x;
      this.y *= operand.y;
    }
    return this;
  }

  reflect(surfaceNormal: Vector) {
    surfaceNormal.normalize();
    return this.sub(surfaceNormal.mult(2 * this.dot(surfaceNormal)));
  }

  dot(operand: VectorPair) {
    return this.x * (operand.x || 0) + this.y * (operand.y || 0);
  }

  dist(target: Vector) {
    return target.copy().sub(this).mag();
  }
}
