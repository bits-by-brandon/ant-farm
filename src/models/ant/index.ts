import Entity, { ENTITY_TYPE } from "../entity";
import World, { TILE_PROPS } from "../world";
import Nest from "../nest";
import Vector from "../vector";
import { State, StateMachine } from "../state";
import { Foraging } from "./states/foraging";
import getRandomNumber from "../../util/get-random-number";
import { clamp } from "../../util/clamp";
import {
  EAST,
  NORTH,
  NORTH_EAST,
  NORTH_WEST,
  SOUTH,
  SOUTH_EAST,
  SOUTH_WEST,
  WEST,
} from "../../util/unit-circle";
import { Returning } from "./states/returning";

export type Theta = number;
export type SearchSpace = [
  [Theta, ENTITY_TYPE],
  [Theta, ENTITY_TYPE],
  [Theta, ENTITY_TYPE],
  [Theta, ENTITY_TYPE],
  [Theta, ENTITY_TYPE],
  [Theta, ENTITY_TYPE],
  [Theta, ENTITY_TYPE],
  [Theta, ENTITY_TYPE]
];

interface AntFactoryCreateArgs {
  x: number;
  y: number;
  nest: Nest;
}

export default class Ant extends Entity implements StateMachine {
  readonly id: number;
  readonly nest: Nest;
  held: Entity | null;
  state: State;
  states: { [key: string]: State };
  posDirtyBit: boolean;
  lastPos: Vector;
  lastGridPosition: VectorPair;
  gridPosition: VectorPair;
  speed: number;
  steerAngle: number;
  wiggleRange: number;
  wiggleVariance: number;
  turnChance: number;
  turnRange: number;
  foodDetectionRange: number;

  constructor(
    x: number,
    y: number,
    id: number,
    nest: Nest,
    world: World,
    noise: Noise
  ) {
    super(new Vector(x, y), world, noise);
    this.id = id;
    this.speed = 0.5;
    this.nest = nest;
    this.held = null;
    this.lastPos = new Vector(x, y);
    this.gridPosition = { x, y } as VectorPair;
    this.lastGridPosition = { x, y } as VectorPair;
    // Set this to true if the position grid has changed and we need to update the world position
    this.posDirtyBit = false;

    this.steerAngle = getRandomNumber(0, 2 * Math.PI); // in radians
    this.wiggleRange = 0.003;
    this.wiggleVariance = 0.0001;
    this.turnChance = 0.01; // normalized percentage, once per step
    this.turnRange = 1;
    this.foodDetectionRange = 2;

    this.states = {
      foraging: new Foraging(this),
      returning: new Returning(this),
    } as const;
    this.state = this.states.foraging;
  }

  setState(state: State) {
    this.state.exit();
    this.state = state;
    this.state.enter();
  }

  update(delta: number, step: number) {
    this.state.update(delta, step);
    // Use any new calculated grid positions from update() and reflect changes in the world grid
    this.updateWorldPos();
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.held ? "#f00" : "#000";
    ctx.fillRect(this.pos.x / 2, this.pos.y / 2, 2, 2);
  }

  updatePosition() {
    const vel = Vector.fromPolar(this.steerAngle).mult(this.speed);
    this.lastPos.x = this.pos.x;
    this.lastPos.y = this.pos.y;
    this.pos.x += vel.x;
    this.pos.y += vel.y;
  }

  updateGridPosition() {
    const newX = Math.floor(this.pos.x);
    const newY = Math.floor(this.pos.y);

    if (this.gridPosition.x !== newX || this.gridPosition.y !== newY) {
      this.lastGridPosition.x = this.gridPosition.x;
      this.lastGridPosition.y = this.gridPosition.y;
      this.gridPosition.x = newX;
      this.gridPosition.y = newY;
      this.posDirtyBit = true;
    }
  }

  updateWorldPos() {
    // If the ant is in a new grid position
    if (this.posDirtyBit) {
      // set the old tile to empty
      this.world.setTileProp(
        this.lastGridPosition.x,
        this.lastGridPosition.y,
        "entityType",
        ENTITY_TYPE.EMPTY
      );

      // set the new tile to contain the ant
      this.world.setTileProp(
        this.gridPosition.x,
        this.gridPosition.y,
        "entityType",
        ENTITY_TYPE.ANT
      );

      this.posDirtyBit = false;
    }
  }

  /**
   * Clamps ants to the edge of the map and reflects their direction
   */
  mapEdgeCollide() {
    if (
      this.pos.y > this.world.height ||
      this.pos.x > this.world.width ||
      this.pos.x < 0 ||
      this.pos.y < 0
    ) {
      this.steerAngle *= Math.PI;
    }
    this.pos.x = clamp(this.pos.x, 0, this.world.width);
    this.pos.y = clamp(this.pos.y, 0, this.world.height);
  }

  /**
   * Terrain detection
   */
  terrainCollide() {
    const tile = this.world.getTile(
      Math.floor(this.pos.x),
      Math.floor(this.pos.y)
    );

    if (tile[TILE_PROPS.TERRAIN] > 0) {
      this.pos.x = this.lastPos.x;
      this.pos.y = this.lastPos.y;
      this.steerAngle *= Math.PI;
    }
  }

  /**
   * Return an array of [theta, entityType] tuples of all surrounding world tiles starting from the north west block.
   */
  search(): SearchSpace {
    // create array of search tiles relative to current position
    return [
      [NORTH_WEST, -1, -1],
      [NORTH, 0, -1],
      [NORTH_EAST, 1, -1],
      [WEST, -1, 0],
      [EAST, 1, 0],
      [SOUTH_WEST, -1, 1],
      [SOUTH, 0, 1],
      [SOUTH_EAST, 1, 1],
    ].map(([theta, xOffset, yOffset]) => {
      return [
        this.world.getTileProp(
          this.gridPosition.x + xOffset,
          this.gridPosition.y + yOffset,
          "entityType"
        ),
        theta,
      ];
    }) as SearchSpace;
  }
}

export class AntFactory {
  readonly noise: Noise;
  readonly world: World;
  private index: number;

  constructor(world: World, noise: Noise) {
    this.world = world;
    this.noise = noise;
    this.index = 1;
  }

  create(args: AntFactoryCreateArgs) {
    const { x, y, nest } = args;
    const ant = new Ant(x, y, this.index, nest, this.world, this.noise);
    this.world.entities.push(ant);
    this.index++;
    return ant;
  }
}
