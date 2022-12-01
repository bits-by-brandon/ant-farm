import { makeNoise2D } from "fast-simplex-noise";

import World, { visibilityLayerName } from "./world";
import Nest from "./nest";
import { AntFactory } from "./ant";
import { FoodFactory } from "./food";
import MapHelper from "../lib/map-helper";
import { imageColorMap } from "../config";
import Observable from "./observable";

type SimulationState = "playing" | "paused";

export interface SimulationCreateProps {
  mapBuffer: ArrayBuffer;
  antCount: number;
  width: number;
  height: number;
}

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

export interface SimulationProps extends Omit<SimulationCreateProps, "mapBuffer" | "width" | "height"> {
  world: World;
  noise: NoiseFunc;
  terrainBitmap: ImageBitmap;
}

export default class Simulation extends Observable {
  readonly antCount: number;
  readonly ctx: CanvasRenderingContext2D;
  readonly terrainBitmap: ImageBitmap;
  readonly world: World;
  readonly noise: NoiseFunc;
  readonly viewport: Viewport;
  width = 100;
  height = 100;
  lastStamp = 0;
  stepCount = 0;
  raf = 0;
  state: SimulationState = "paused";

  constructor(props: SimulationProps) {
    super();
    this.antCount = props.antCount;
    this.ctx = this.getCanvasContext();
    this.terrainBitmap = props.terrainBitmap;
    this.world = props.world;
    this.noise = props.noise;
    this.viewport = { x: props.world.width / 2, y: props.world.height / 2, zoom: 1 };
  }

  setVisibilityLayer(layerName: visibilityLayerName, value: boolean) {
    this.world.visibilityLayers.set(layerName, value);
    if (this.state === "paused") this.draw();
  }

  getCanvasContext(): CanvasRenderingContext2D {
    // canvas setup
    const canvas = document.getElementById("main-canvas") as HTMLCanvasElement;
    const { width, height } = canvas.getBoundingClientRect();
    this.width = width;
    this.height = height;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    if (!ctx) throw new Error("No 2d canvas context available");
    // turn off antialiasing
    ctx.imageSmoothingEnabled = false;
    return ctx;
  }

  createNest(): Nest {
    const nest = new Nest({
      x: this.world.width / 2,
      y: this.world.height / 2,
      id: 0,
      noise: this.noise,
      world: this.world,
    });

    this.world.insert(nest, "Nest");
    return nest;
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

    for (let x = 0; x < this.world.width; x += 2) {
      for (let y = 0; y < this.world.height; y += 2) {
        let quantity = 0;
        const allPixels = [
          [x, y],
          [x + 1, y],
          [x, y + 1],
          [x + 1, y + 1],
        ];
        for (const [x, y] of allPixels) {
          quantity += foodData[y * (this.world.width * 4) + x * 4] > 0 ? 1 : 0;
        }
        if (quantity > 1) foodFactory.create({ x, y }, quantity);
      }
    }
  }

  setProp<T>(layerId: string, propKey: keyof T, value: any) {
    return this.world.setProp<T>(layerId, propKey, value);
  }

  zoom(amount: number) {
    this.viewport.zoom += amount;
  }

  moveViewport(x: number, y: number) {
    this.viewport.x += x;
    this.viewport.y += y;
  }

  update(step: number) {
    this.world.update();

    for (const entity of this.world.entities) {
      entity.update(step);
    }
  }

  draw() {
    // Clear the screen
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.ctx.save();
    this.ctx.translate(this.viewport.x, this.viewport.y);
    this.ctx.scale(this.viewport.zoom, this.viewport.zoom);

    // Draw the terrain
    this.ctx.drawImage(this.terrainBitmap, 0, 0, this.world.width, this.world.height);

    for (const entity of this.world.entities) {
      entity.draw(this.ctx);
    }

    if (this.world.visibilityLayers.get("antQTree")) {
      const antLayer = this.world.entityLayers.get("Ant");
      if (antLayer) antLayer.qtree.draw(this.ctx);
    }

    if (this.world.visibilityLayers.get("pheromoneQTree")) {
      const pheromoneLayer = this.world.entityLayers.get("Pheromone");
      if (pheromoneLayer) pheromoneLayer.qtree.draw(this.ctx);
    }
    this.ctx.restore();
  }

  step() {
    this.update(this.stepCount);
    this.draw();

    this.stepCount++;
    if (this.state === "playing") {
      this.raf = requestAnimationFrame(this.step.bind(this));
    }
  }

  /**
   * Starts the simulation. Attempts to runs a per animation frame
   */
  start() {
    this.state = "playing";
    this.emit("start", () => {});
    this.raf = requestAnimationFrame(this.step.bind(this));
  }

  /**
   * Stops the simulation. Run start() to restart simulation
   */
  stop() {
    this.state = "paused";
    this.emit("stop", () => {});
    cancelAnimationFrame(this.raf);
  }

  subscribe(event: "start", callback: (details: undefined) => void): () => boolean;
  subscribe(event: "stop", callback: (details: undefined) => void): () => boolean;
  subscribe(event: any, callback: (details?: any) => void): () => boolean {
    return super.subscribe(event, callback);
  }

  /**
   * Creates and initializes a new Simulation object
   */
  static async create({ mapBuffer, width, height, antCount }: SimulationCreateProps): Promise<Simulation> {
    const mapData = new Uint8Array(mapBuffer);
    const [terrainData, foodData] = MapHelper.mapWorldDataToLayers(mapData, [imageColorMap.Wall, imageColorMap.Food]);

    // Create the terrainBitmap as the draw layer
    const terrainBitmap = await MapHelper.terrainDataToBitmap(terrainData, width, height);

    // Init world
    const world = new World({ width, height, entities: [], terrainData });

    // Init perlin noise
    const noise: NoiseFunc = makeNoise2D();

    // Create the simulation
    const simulation = new Simulation({
      antCount,
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
