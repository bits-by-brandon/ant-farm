import Entity from "../models/entity";
import { Rectangle } from "./quadtree";

export interface EntityStorage {
  insert(point: Entity): boolean;
  remove(target: Entity): Entity | false;
  clear(): void;
  query(range: Rectangle, found: Entity[]): Entity[];
}
