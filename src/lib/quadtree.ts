import Entity from "../models/entity";
import { EntityStorage } from "./entity-storage";

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

  contains(point: VectorPair): boolean {
    return (
      point.x >= this.x - this.width &&
      point.x <= this.x + this.width &&
      point.y >= this.y - this.height &&
      point.y <= this.y + this.height
    );
  }

  intersects(range: Rectangle): boolean {
    return !(
      range.x - range.width > this.x + this.width ||
      range.x + range.width < this.x - this.width ||
      range.y - range.height > this.y + this.height ||
      range.y + range.height < this.y - this.height
    );
  }
}

export default class Quadtree implements EntityStorage {
  private boundary: Rectangle;
  private points: Entity[];
  private nw: Quadtree | null;
  private ne: Quadtree | null;
  private sw: Quadtree | null;
  private se: Quadtree | null;
  private divided: boolean;
  readonly capacity: number;

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
    }

    if (!this.divided) this.subdivide();

    // Try inserting into a subtree, return true if any inserts are successful
    return (
      this.sw!.insert(point) ||
      this.se!.insert(point) ||
      this.ne!.insert(point) ||
      this.nw!.insert(point)
    );
  }

  remove(target: Entity): Entity | false {
    // Base case - return false if point doesn't fall under boundary
    if (!this.boundary.contains(target.pos)) return false;

    // Base case - return target if point falls in boundary and is contained in this quadtree node
    const index = this.points.indexOf(target);
    if (index !== -1) {
      // Remove point from points array if found
      this.points.splice(index, 1);
      return target;
    }

    let childPointRemoved = false;
    for (const quadrant of [this.sw, this.se, this.nw, this.ne]) {
      if (quadrant && quadrant.remove(target)) {
        childPointRemoved = true;
        break;
      }
    }

    if (childPointRemoved) {
      this.unify();
      return target;
    } else {
      return false;
    }
  }

  unify() {
    let empty = true;
    for (const quadrant of [this.sw, this.se, this.nw, this.ne]) {
      if (!quadrant || quadrant.points.length > 0) {
        empty = false;
      }
    }

    if (empty) {
      this.sw = null;
      this.se = null;
      this.nw = null;
      this.ne = null;
      this.divided = false;
    }
  }

  subdivide() {
    const { x, y, width, height } = this.boundary;
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
    this.divided = true;
  }

  clear(): void {
    this.nw = null;
    this.ne = null;
    this.sw = null;
    this.se = null;
    this.points = [];
    this.divided = false;
  }

  query(range: Rectangle, found: Entity[] = []): Entity[] {
    if (!this.boundary.intersects(range)) return found;

    for (const point of this.points) {
      if (range.contains(point.pos)) {
        found.push(point);
      }
    }

    if (this.divided) {
      this.nw!.query(range, found);
      this.ne!.query(range, found);
      this.sw!.query(range, found);
      this.se!.query(range, found);
    }

    return found;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const { x, y, width, height } = this.boundary;
    ctx.strokeStyle = "#666";
    ctx.strokeRect(x - width, y - height, width * 2, height * 2);
    if (this.nw) this.nw.draw(ctx);
    if (this.ne) this.ne.draw(ctx);
    if (this.sw) this.sw.draw(ctx);
    if (this.se) this.se.draw(ctx);
  }
}
