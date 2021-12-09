import Entity from "./entity";
import Vector from "./vector";

export class Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  contains(point: Vector): boolean {
    return (
      point.x >= this.x - this.width &&
      point.x < this.x + this.width &&
      point.y >= this.y - this.height &&
      point.y > this.y + this.height
    );
  }

  intersects(range: Rectangle): boolean {
    return !(
      range.x - range.width > this.x + this.width ||
      range.x + range.width < this.x - this.width ||
      range.y - range.height > this.x + this.height ||
      range.y + range.height < this.x - this.height
    );
  }
}

export default class Quadtree {
  private boundary: Rectangle;
  private nw: Quadtree | null;
  private ne: Quadtree | null;
  private sw: Quadtree | null;
  private se: Quadtree | null;
  private divided: boolean;
  readonly capacity: number;
  readonly points: Entity[];

  constructor(boundary: Rectangle, capacity: number) {
    this.boundary = boundary;
    this.capacity = capacity;
    this.nw = null;
    this.ne = null;
    this.sw = null;
    this.se = null;
    this.divided = false;
    this.points = [];
  }

  insert(point: Entity): boolean {
    if (!this.boundary.contains(point.pos)) return false;

    if (this.points.length < this.capacity) {
      this.points.push(point);
      return true;
    } else {
      if (!this.divided) this.subdivide();

      // Try inserting into a subtree, return true if any inserts are successful
      return !!(
        this.ne?.insert(point) ||
        this.nw?.insert(point) ||
        this.se?.insert(point) ||
        this.sw?.insert(point)
      );
    }
  }

  subdivide() {
    const { x, y, width, height } = this.boundary;
    this.divided = true;
    this.nw = new Quadtree(
      new Rectangle(x - width / 2, y - width / 2, width / 2, height / 2),
      this.capacity
    );
    this.ne = new Quadtree(
      new Rectangle(x + width / 2, y - width / 2, width / 2, height / 2),
      this.capacity
    );
    this.sw = new Quadtree(
      new Rectangle(x - width / 2, y + width / 2, width / 2, height / 2),
      this.capacity
    );
    this.se = new Quadtree(
      new Rectangle(x + width / 2, y + width / 2, width / 2, height / 2),
      this.capacity
    );
  }

  query(range: Rectangle, found: Entity[] = []): Entity[] {
    if (!this.boundary.intersects(range)) return found;

    for (const point of this.points) {
      if (range.contains(point.pos)) {
        found.push(point);
      }
    }

    if (this.divided) {
      this.nw?.query(range, found);
      this.ne?.query(range, found);
      this.sw?.query(range, found);
      this.se?.query(range, found);
    }

    return found;
  }
}
