import Entity from "../entity";
import World from "../world";
import Nest from "../nest";
import Vector from "../vector";
import { State, StateMachine } from "../state";
import { Foraging } from "./states/foraging";
import getRandomNumber from "../../util/get-random-number";
import { clamp } from "../../util/clamp";
import { Returning } from "./states/returning";
import Pheromone, { PheromoneType } from "../pheromone";

interface AntFactoryCreateArgs {
  x: number;
  y: number;
  nest: Nest;
}

export default class Ant extends Entity implements StateMachine {
  static type = "Ant";

  readonly id: number;
  readonly nest: Nest;
  held: boolean;
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
  pheromoneCountdown: number;
  pheromoneTimePeriod: number;

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
    this.held = false;
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

    this.pheromoneTimePeriod = 400; // in milliseconds
    this.pheromoneCountdown = this.pheromoneTimePeriod;

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
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.held ? "#f00" : "#000";
    ctx.fillRect(this.pos.x, this.pos.y, 1, 1);
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

  updatePheromone(delta: number, callback: () => void) {
    this.pheromoneCountdown -= delta;
    if (this.pheromoneCountdown <= 0) {
      callback();

      // reset the countdown
      this.pheromoneCountdown = this.pheromoneTimePeriod;
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
    const terrainValue = this.world.getTerrainValue(
      Math.floor(this.pos.x),
      Math.floor(this.pos.y)
    );

    if (terrainValue > 0) {
      this.pos.x = this.lastPos.x;
      this.pos.y = this.lastPos.y;
      this.steerAngle *= Math.PI;
    }
  }

  dropPheromone(type: PheromoneType) {
    const pheromone = new Pheromone(
      type,
      this.pos.copy(),
      this.world,
      this.noise
    );
    this.world.insert(pheromone, "Pheromone");
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
    this.world.insert(ant, "Ant", true);
    this.index++;
    return ant;
  }
}
