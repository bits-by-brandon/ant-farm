import { makeNoise2D } from "fast-simplex-noise";

import World from "./models/world";
import Ant, { AntFactory } from "./models/ant";
import {ENTITY_TYPE} from "./models/entity";

export function start(worldBuffer?: ArrayBuffer) {
  const canvasWidth = 1500;
  const canvasHeight = 1500;
  const scale = 2;

  // canvas setup
  const canvas = document.getElementById("main-canvas") as HTMLCanvasElement;
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  canvas.style.width = `${canvasWidth / 2}px`;
  canvas.style.height = `${canvasWidth / 2}px`;

  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  if (!ctx) throw new Error("No 2d canvas context available");
  const canvasData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
  const canvasBuffer = new Uint32Array(canvasData.data.buffer);
  ctx.scale(scale, scale);

  // Init world
  const world = new World(canvasWidth, canvasHeight, worldBuffer);

  // Init perlin noise
  const noise: Noise = makeNoise2D();

  const antFactory = new AntFactory(world, noise);

  // Init ants
  const antCount = 1000;
  const ants: Ant[] = [];
  for (let i = 0; i < antCount; i++) {
    ants.push(antFactory.create(world.width / 2, world.height / 2));
  }

  function update(delta: number, step: number) {
    for (const ant of ants) {
      ant.update(delta, step);
    }
  }

  function draw() {
    for (let x = 0; x < world.width; x++) {
      for (let y = 0; y < world.height; y++) {
        const [entityType, _entityId, terrain] = world.getTile(x, y);
        if (terrain > 0) {
          canvasBuffer[x + y * world.width] = 0x0000ffff;
        } else if (entityType === ENTITY_TYPE.ANT) {
          canvasBuffer[x + y * world.width] = 0xff000000;
        } else {
          canvasBuffer[x + y * world.width] = 0xffffffff;
        }
      }
    }
    ctx.putImageData(canvasData, 0, 0);

    // ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    // for (let ant of ants) {
    //   ctx.fillRect(ant.pos.x / 2, ant.pos.y / 2, 2, 2);
    // }
  }

  // Step function
  let lastStamp: number = 0;
  let stepCount = 0;
  function step(timestamp: number) {
    const delta = timestamp - lastStamp;

    update(delta, stepCount);
    draw();

    lastStamp = timestamp;
    stepCount++;
    requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}
