import AntProps from "./props";
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
import { Rectangle } from "../../lib/rectangle";
import lerp from "../../util/lerp";
import getPropInitialValue from "../../util/get-prop";

interface AntFactoryCreateArgs {
  x: number;
  y: number;
  nest: Nest;
}

export default class Ant extends Entity implements StateMachine {
  readonly id: number;
  readonly nest: Nest;
  readonly states: { [key: string]: State };
  protected _state: State;
  protected posDirtyBit: boolean;
  protected lastPos: Vector;
  protected lastGridPosition: VectorPair;
  protected gridPosition: VectorPair;
  held: boolean;
  speed: number;
  wiggleRange: number;
  wiggleVariance: number;
  turnChance: number;
  turnRange: number;
  foodDetectionRange: number;
  pheromoneSensorRadius: number;
  pheromoneCountdown: number;
  pheromoneTimePeriod: number;
  pheromoneSensorAngle: number;
  pheromoneSensorDistance: number;
  pheromoneSteerAngle: number;
  sensorRects: [Rectangle, Rectangle, Rectangle];
  rotation: number;
  _desiredRotation: number;
  steerStrength: number;

  constructor(
    x: number,
    y: number,
    id: number,
    nest: Nest,
    world: World,
    noise: Noise
  ) {
    super(new Vector(x, y), world, noise);
    // Internal state values
    this.id = id;
    this.nest = nest;
    this.held = false;
    this.lastPos = new Vector(x, y);
    this.gridPosition = { x, y } as VectorPair;
    this.lastGridPosition = { x, y } as VectorPair;
    this.posDirtyBit = false; // Set this to true if the position grid has changed and we need to update the world position
    this._desiredRotation = getRandomNumber(0, 2 * Math.PI);
    this.rotation = this._desiredRotation;
    this.sensorRects = [
      new Rectangle(0, 0, 0, 0),
      new Rectangle(0, 0, 0, 0),
      new Rectangle(0, 0, 0, 0),
    ];
    this.states = {
      foraging: new Foraging(this),
      returning: new Returning(this),
    } as const;
    this._state = this.states.foraging;

    // UI public properties
    this.speed = getPropInitialValue<Ant>("speed", AntProps);
    this.wiggleRange = getPropInitialValue<Ant>("wiggleRange", AntProps);
    this.wiggleVariance = getPropInitialValue<Ant>("wiggleVariance", AntProps);
    this.turnChance = getPropInitialValue<Ant>("turnChance", AntProps);
    this.turnRange = getPropInitialValue<Ant>("turnRange", AntProps);
    this.steerStrength = getPropInitialValue<Ant>("steerStrength", AntProps);
    this.foodDetectionRange = getPropInitialValue<Ant>(
      "foodDetectionRange",
      AntProps
    );
    this.pheromoneTimePeriod = getPropInitialValue<Ant>(
      "pheromoneTimePeriod",
      AntProps
    );
    this.pheromoneCountdown = this.pheromoneTimePeriod;
    this.pheromoneSensorRadius = getPropInitialValue<Ant>(
      "pheromoneSensorRadius",
      AntProps
    );
    this.pheromoneSensorDistance = getPropInitialValue<Ant>(
      "pheromoneSensorDistance",
      AntProps
    );
    this.pheromoneSensorAngle = getPropInitialValue<Ant>(
      "pheromoneSensorAngle",
      AntProps
    );
    this.pheromoneSteerAngle = getPropInitialValue<Ant>(
      "pheromoneSteerAngle",
      AntProps
    );
  }

  set state(state: State) {
    this._state.exit();
    this._state = state;
    this._state.enter();
  }

  update(step: number) {
    this._state.update(step);
  }

  draw(ctx: CanvasRenderingContext2D) {
    // ctx.fillStyle = this.held ? "#f00" : "#000";
    ctx.fillStyle = "#151515";
    ctx.fillRect(this.pos.x, this.pos.y, 1, 1);

    if (this.world.visibilityLayers.get("sensor")) {
      ctx.fillStyle = "rgba(209, 24, 250, 0.43)";
      for (const rect of this.sensorRects) {
        ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
      }
    }
  }

  set desiredRotation(value: number) {
    this._desiredRotation = value % (Math.PI * 2);
  }

  get desiredRotation() {
    return this._desiredRotation;
  }

  updatePosition() {
    const vel = Vector.fromPolar(this.rotation).mult(this.speed);
    this.lastPos.x = this.pos.x;
    this.lastPos.y = this.pos.y;
    this.pos.x += vel.x;
    this.pos.y += vel.y;

    this.rotation = lerp(
      this.rotation,
      this.desiredRotation,
      this.steerStrength
    );
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

  updatePheromone(callback: () => void) {
    this.pheromoneCountdown--;
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
      this.desiredRotation *= Math.PI;
      this.rotation *= Math.PI;
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
      this.rotation += Math.PI;
      this.desiredRotation = this.rotation;
    }
  }

  dropPheromone(type: PheromoneType, strength?: number) {
    const pheromone = new Pheromone(
      type,
      this.pos.copy(),
      this.world,
      this.noise,
      strength
    );
    this.world.insert(pheromone, "Pheromone");
  }

  updateSensorRects() {
    const thetas = [
      // Left sensor
      this.pheromoneSensorAngle,
      // Front sensor
      0,
      // Right sensor
      Math.PI * 2 - this.pheromoneSensorAngle,
    ] as const;

    this.sensorRects = thetas.map((theta) => {
      const sensorPosition = Vector.fromPolar(
        theta + this.rotation
        // theta + this.rotation
      )
        .mult(this.pheromoneSensorDistance)
        .add(this.pos.copy());

      return new Rectangle(
        sensorPosition.x,
        sensorPosition.y,
        this.pheromoneSensorRadius / 2,
        this.pheromoneSensorRadius / 2
      );
    }) as [Rectangle, Rectangle, Rectangle];
  }

  detectPheromone(type: PheromoneType): [number, number, number] {
    return this.sensorRects.map((sensorRect) => {
      const pheromones = this.world
        .query<Pheromone>(
          new Rectangle(
            sensorRect.x,
            sensorRect.y,
            this.pheromoneSensorRadius / 2,
            this.pheromoneSensorRadius / 2
          ),
          "Pheromone"
        )
        .filter((p) => p.type === type);

      // Add up all the strength values of detected pheromones
      return pheromones.reduce(
        (sensorStrength, pheromone) => sensorStrength + pheromone.strength,
        0
      );
    }) as [number, number, number];
  }

  followPheromone(type: PheromoneType) {
    const [left, front, right] = this.detectPheromone(type);
    if (front > left && front > right) {
      // go straight
    } else if (front < left && front < right) {
      this.desiredRotation +=
        left < right ? this.pheromoneSteerAngle : -this.pheromoneSteerAngle;
    } else if (left < right) {
      this.desiredRotation -= this.pheromoneSteerAngle;
    } else if (right < left) {
      this.desiredRotation += this.pheromoneSteerAngle;
    }
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
