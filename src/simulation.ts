import { makeNoise2D } from "fast-simplex-noise";

import World from "./models/world";
import { AntFactory } from "./models/ant";
import { ENTITY_TYPE } from "./models/entity";
import Nest from "./models/nest";
import Food from "./models/food";
import ImageHelper from "./lib/image-helper";

interface SimulationCreateProps {
  antCount: number;
  width: number;
  height: number;
}

interface SimulationProps extends SimulationCreateProps {
  world: World;
  noise: Noise;
}

export default class Simulation {
  readonly antCount: number;
  readonly ctx: CanvasRenderingContext2D;
  readonly width: number;
  readonly height: number;
  readonly world: World;
  readonly noise: Noise;
  lastStamp: number;
  stepCount: number;
  raf: number;

  constructor(props: SimulationProps) {
    this.antCount = props.antCount;
    this.width = props.width;
    this.height = props.height;
    this.ctx = this.getCanvasContext(this.width, this.height);
    this.world = props.world;
    this.noise = props.noise;
    // Step function
    this.lastStamp = 0;
    this.stepCount = 0;
    this.raf = 0;
  }

  getCanvasContext(width: number, height: number): CanvasRenderingContext2D {
    // canvas setup
    const canvas = document.getElementById("main-canvas") as HTMLCanvasElement;
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    if (!ctx) throw new Error("No 2d canvas context available");
    return ctx;
  }

  createNest(): Nest {
    return new Nest({
      x: this.world.width / 2,
      y: this.world.height / 2,
      id: 0,
      noise: this.noise,
      world: this.world,
    });
  }

  initializeAnts(nest: Nest): void {
    // Create our initial batch of ants
    const antFactory = new AntFactory(this.world, this.noise);
    for (let i = 0; i < this.antCount; i++) {
      antFactory.create({ x: nest.pos.x, y: nest.pos.y, nest: nest });
    }
  }

  initializeFood() {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        const [entityType] = this.world.getTile(x, y);
        if (entityType === ENTITY_TYPE.FOOD) {
          this.world.insert(
            new Food({ x, y, world: this.world, noise: this.noise }),
            "Food"
          );
        }
      }
    }
  }

  _update(delta: number, step: number) {
    this.world.update();

    for (const entity of this.world.entities) {
      entity.update(delta, step);
    }
  }

  _draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    for (const entity of this.world.entities) {
      entity.draw(this.ctx);
    }
  }

  step(timestamp: number) {
    const delta = timestamp - this.lastStamp;

    this._update(delta, this.stepCount);
    this._draw();

    this.lastStamp = timestamp;
    this.stepCount++;
    this.raf = requestAnimationFrame(this.step.bind(this));
  }

  start() {
    this.raf = requestAnimationFrame(this.step.bind(this));
  }

  stop() {
    cancelAnimationFrame(this.raf);
  }

  static async create(
    mapBuffer: ArrayBuffer,
    props: SimulationCreateProps
  ): Promise<Simulation> {
    // Create the world buffer
    const colorMap = new Map<number, number>([
      [0xff0000ff, 0x30000], // red -> wall
      [0xff00ff00, 0x00002], // green -> food
      [0xffffffff, 0], // white -> empty
    ]);
    const worldBuffer = await ImageHelper.mapImageBuffer(mapBuffer, colorMap);

    // Init world
    const world = new World(props.width, props.height, [], worldBuffer);

    // Init perlin noise
    const noise: Noise = makeNoise2D();

    // Create the simulation
    const simulation = new Simulation({
      antCount: props.antCount,
      width: props.width,
      height: props.height,
      world,
      noise,
    });

    // Initialize simulation
    const nest = simulation.createNest();
    simulation.initializeAnts(nest);
    simulation.initializeFood();

    return simulation;
  }
}
