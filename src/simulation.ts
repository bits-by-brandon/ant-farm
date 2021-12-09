import { makeNoise2D } from "fast-simplex-noise";

import World from "./models/world";
import { AntFactory } from "./models/ant";
import { ENTITY_TYPE } from "./models/entity";
import Nest from "./models/nest";
import Food from "./models/food";
import { Rectangle } from "./models/quadtree";

const mouseRect = new Rectangle(0, 0, 200, 200);

document.addEventListener("mousemove", (e) => {
  mouseRect.x = e.x;
  mouseRect.y = e.y;
});

export function start(worldBuffer?: ArrayBuffer) {
  const canvasWidth = 1500;
  const canvasHeight = 1500;
  // const scale = 2;

  // canvas setup
  const canvas = document.getElementById("main-canvas") as HTMLCanvasElement;
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  canvas.style.width = `${canvasWidth}px`;
  canvas.style.height = `${canvasWidth}px`;

  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  if (!ctx) throw new Error("No 2d canvas context available");
  // const canvasData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
  // const canvasBuffer = new Uint32Array(canvasData.data.buffer);
  // ctx.scale(scale, scale);

  // Init world
  const world = new World(canvasWidth, canvasHeight, [], worldBuffer);

  // Init perlin noise
  const noise: Noise = makeNoise2D();

  // Create the initial nest
  const nest = new Nest({
    x: world.width / 2,
    y: world.height / 2,
    id: 0,
    noise,
    world,
  });

  // Create our initial batch of ants
  const antCount = 500;
  const antFactory = new AntFactory(world, noise);
  for (let i = 0; i < antCount; i++) {
    antFactory.create({ x: nest.pos.x, y: nest.pos.y, nest: nest });
  }

  getFood(world, noise);

  function update(delta: number, step: number) {
    world.update();

    for (const entity of world.entities) {
      entity.update(delta, step);
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    // for (const entity of world.entities) {
    //   entity.draw(ctx);
    // }
    world.qtree.draw(ctx);

    ctx.strokeStyle = "#0f0";
    ctx.strokeRect(
      mouseRect.x - mouseRect.width,
      mouseRect.y - mouseRect.height,
      mouseRect.width * 2,
      mouseRect.height * 2
    );
    const entities = world.qtree.query(mouseRect);
    for (const entity of entities) {
      entity.draw(ctx);
    }
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

function getFood(world: World, noise: Noise) {
  for (let x = 0; x < world.width; x++) {
    for (let y = 0; y < world.height; y++) {
      const [entityType] = world.getTile(x, y);
      if (entityType === ENTITY_TYPE.FOOD) {
        let food = new Food({ x, y, world, noise });
        world.insert(food);
      }
    }
  }
}
