type ColorArray = [number, number, number, number];

export default class Color {
  private colorValues: ColorArray;

  constructor(r: number, g: number, b: number, a: number) {
    this.colorValues = [r, g, b, a];
  }

  set colorArray(value: ColorArray) {
    this.colorValues = value;
  }

  get colorArray() {
    return this.colorValues;
  }

  get r() {
    return this.colorValues[0];
  }

  set r(value: number) {
    this.colorValues[0] = value;
  }

  get g() {
    return this.colorValues[1];
  }

  set g(value: number) {
    this.colorValues[1] = value;
  }

  get b() {
    return this.colorValues[2];
  }

  set b(value: number) {
    this.colorValues[2] = value;
  }

  get a() {
    return this.colorValues[3];
  }

  set a(value: number) {
    this.colorValues[3] = value;
  }

  checkEqual(color: Color) {
    return (
      color.r === this.r &&
      color.g === this.g &&
      color.b === this.b &&
      color.a === this.a
    );
  }
}
