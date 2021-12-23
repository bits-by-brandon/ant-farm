import Vector from "../../src/models/vector";
import {Rectangle} from "../../src/lib/rectangle";

describe("Rectangle", () => {
  it("returns true if a point is contained within it's bounds", () => {
    const rect = new Rectangle(20, 20, 5, 5);
    const vec = new Vector(18, 18);
    expect(rect.contains(vec)).toBe(true);
  });

  it("returns false if a point is not contained within it's bounds", () => {
    const rect = new Rectangle(20, 20, 5, 5);
    const vec = new Vector(10, 10);
    expect(rect.contains(vec)).toBe(false);
  });

  it("returns true if a rectangle intersects", () => {
    const rect1 = new Rectangle(20, 20, 5, 5);
    const rect2 = new Rectangle(23, 23, 5, 5);
    expect(rect1.intersects(rect2)).toBe(true);
  });

  it("returns false if a rectangle doesn't intersect", () => {
    const rect1 = new Rectangle(20, 20, 5, 5);
    const rect2 = new Rectangle(31, 31, 5, 5);
    expect(rect1.intersects(rect2)).toBe(false);
  });
});
