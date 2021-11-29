import Entity, { ENTITY_TYPE } from "./entity";
import World from "./world";
import Vector from "./vector";
import getRandomNumber from "../util/get-random-number";
import map from "../util/map";
import { clamp } from "../util/clamp";

export default class Ant extends Entity {
  public speed: number;
  public steerAngle: number;
  readonly id: number;
  private wiggleRange: number;
  private wiggleVariance: number;
  private turnChance: number;
  private turnRange: number;

  constructor(x: number, y: number, id: number, world: World, noise: Noise) {
    super(x, y, world, noise);
    this.id = id;
    this.speed = 0.5;

    this.steerAngle = getRandomNumber(0, 2 * Math.PI); // in radians
    this.wiggleRange = 0.003;
    this.wiggleVariance = 0.0001;
    this.turnChance = 0.01; // normalized percentage, once per step
    this.turnRange = 1;
  }

  updateWorldPos() {
    const { pos, lastPos, world } = this;
    world.setTileProp(
      Math.round(lastPos.x),
      Math.round(lastPos.y),
      "entityType",
      ENTITY_TYPE.EMPTY
    );
    world.setTileProp(
      Math.round(pos.x),
      Math.round(pos.y),
      "entityType",
      ENTITY_TYPE.ANT
    );
  }

  update(delta: number, step: number) {
    // scalar function applied to delta to reduce scale of noise steps;
    const steerStep = delta * step * this.wiggleVariance;

    if (Math.random() <= this.turnChance) {
      this.steerAngle += map(
        Math.random(),
        0,
        1,
        -this.turnRange,
        this.turnRange
      );
    }

    // TODO: Update random walk to levy flight walk
    this.steerAngle += map(
      this.noise(steerStep + 100 * this.id, steerStep + 200 * this.id),
      -1,
      1,
      -this.wiggleRange,
      this.wiggleRange
    );

    const vel = Vector.fromPolar(this.steerAngle).mult(this.speed);
    this.lastPos.x = this.pos.x;
    this.lastPos.y = this.pos.y;
    this.pos.x += vel.x;
    this.pos.y += vel.y;

    // Edge of screen detection
    this.pos.x = clamp(this.pos.x, 0, this.world.width);
    this.pos.y = clamp(this.pos.y, 0, this.world.height);

    if (
      this.pos.y >= this.world.height ||
      this.pos.x >= this.world.width ||
      this.pos.x <= 0 ||
      this.pos.y <= 0
    ) {
      this.steerAngle *= Math.PI;
    }

    this.updateWorldPos();
  }
}

export class AntFactory {
  private noise: Noise;
  private world: World;
  private index: number;

  constructor(world: World, noise: Noise) {
    this.world = world;
    this.noise = noise;
    this.index = 1;
  }

  create(x: number, y: number) {
    const ant = new Ant(x, y, this.index, this.world, this.noise);
    this.index++;
    return ant;
  }
}
