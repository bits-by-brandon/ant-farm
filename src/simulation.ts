import { makeNoise2D } from "fast-simplex-noise";

import World from "./models/world";
import Nest from "./models/nest";
import { AntFactory } from "./models/ant";
import { FoodFactory } from "./models/food";
import MapHelper from "./lib/map-helper";
import { imageColorMap } from "./config";

interface SimulationCreateProps {
  antCount: number;
  width: number;
  height: number;
}

interface SimulationProps extends SimulationCreateProps {
  world: World;
  noise: Noise;
  terrainBitmap: ImageBitmap;
}

export default class Simulation {
  readonly antCount: number;
  readonly ctx: CanvasRenderingContext2D;
  readonly terrainBitmap: ImageBitmap;
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
    this.ctx = this.getCanvasContext();
    this.terrainBitmap = props.terrainBitmap;
    this.world = props.world;
    this.noise = props.noise;
    this.lastStamp = 0;
    this.stepCount = 0;
    this.raf = 0;
  }

  getCanvasContext(): CanvasRenderingContext2D {
    // canvas setup
    const canvas = document.getElementById("main-canvas") as HTMLCanvasElement;
    canvas.width = this.width;
    canvas.height = this.height;
    canvas.style.width = `${this.width}px`;
    canvas.style.height = `${this.height}px`;

    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    if (!ctx) throw new Error("No 2d canvas context available");
    return ctx;
  }

  getTerrainCanvas(): ImageBitmapRenderingContext {
    if (window.OffscreenCanvas) {
      const canvas = new OffscreenCanvas(this.width, this.height);
      const context = canvas.getContext("bitmaprenderer");
      if (!context) {
        throw new Error(
          "Error while creating the bitmaprenderer context from OffscreenCanvas"
        );
      }
      return context;
    } else {
      const canvas = document.getElementById(
        "main-canvas"
      ) as HTMLCanvasElement;
      canvas.width = this.width;
      canvas.height = this.height;
      const context = canvas.getContext("bitmaprenderer");
      if (!context) {
        throw new Error(
          "Error while creating the bitmaprenderer context from Canvas"
        );
      }
      return context;
    }
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

  /**
   * Create an initial batch of ants and insert them into the world
   */
  initializeAnts(nest: Nest): void {
    const antFactory = new AntFactory(this.world, this.noise);
    for (let i = 0; i < this.antCount; i++) {
      antFactory.create({ x: nest.pos.x, y: nest.pos.y, nest: nest });
    }
  }

  /**
   * Create an initial batch of food based on the provided foodData buffer and insert them into the world
   */
  initializeFood(foodData: Uint8Array) {
    const foodFactory = new FoodFactory(this.world, this.noise);

    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        const foodValue = foodData[y * (this.width * 4) + x * 4];
        if (foodValue > 1) foodFactory.create({ x, y });
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

    // Draw the terrain
    this.ctx.drawImage(this.terrainBitmap, 0, 0, this.width, this.height);

    // Draw the quadtree for the ants
    const antLayer = this.world.entityLayers.get("Pheromone");
    if (antLayer) antLayer.qtree.draw(this.ctx);

    for (const entity of this.world.entities) {
      entity.draw(this.ctx);
    }
  }

  step(timestamp: DOMHighResTimeStamp) {
    const delta = timestamp - this.lastStamp;

    this._update(delta, this.stepCount);
    this._draw();

    this.lastStamp = timestamp;
    this.stepCount++;
    this.raf = requestAnimationFrame(this.step.bind(this));
  }

  /**
   * Starts the simulation. Attempts to runs a per animation frame
   */
  start() {
    this.raf = requestAnimationFrame(this.step.bind(this));
  }

  /**
   * Stops the simulation. Run start() to restart simulation
   */
  stop() {
    cancelAnimationFrame(this.raf);
  }

  /**
   * Creates and initializes a new Simulation object
   */
  static async create(
    mapBuffer: ArrayBuffer,
    props: SimulationCreateProps
  ): Promise<Simulation> {
    // TODO: Something went weird after converting the Uint32Array to Uint8Array
    const mapData = new Uint8Array(mapBuffer);
    const [terrainData, foodData] = MapHelper.mapWorldDataToLayers(mapData, [
      imageColorMap.Wall,
      imageColorMap.Food,
    ]);

    // Create the terrainBitmap as the draw layer
    const terrainBitmap = await MapHelper.terrainDataToBitmap(
      terrainData,
      props.width,
      props.height
    );

    // Init world
    const world = new World({
      width: props.width,
      height: props.height,
      entities: [],
      terrainData,
    });

    // Init perlin noise
    const noise: Noise = makeNoise2D();

    // Create the simulation
    const simulation = new Simulation({
      antCount: props.antCount,
      width: props.width,
      height: props.height,
      world,
      noise,
      terrainBitmap,
    });

    // Initialize simulation
    const nest = simulation.createNest();
    simulation.initializeAnts(nest);
    simulation.initializeFood(foodData);

    return simulation;
  }
}
