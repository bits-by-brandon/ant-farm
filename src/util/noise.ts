import { makeNoise2D } from "fast-simplex-noise";
import map from "./map";
// import map from "./map";

const MAX_32_BIT = 2147483647;

class NoiseUninitializedBeforeUseError extends Error {
  constructor(method: string) {
    const message = `Noise.${method} called before init. Initialize Noise function before calling get.`;
    super(message);
  }
}

export class Noise {
  private noise: NoiseFunc | null;
  private hash: (() => number) | null;
  private seed: string | null;

  constructor() {
    this.noise = null;
    this.hash = null;
    this.seed = null;
  }

  init(seed = "f23p9fuh") {
    this.seed = seed;
    this.hash = Noise.createHasher(this.seed);
    this.noise = makeNoise2D(this.hash);
  }

  get(x: number, y: number) {
    if (!this.noise || !this.hash) {
      throw new NoiseUninitializedBeforeUseError("get");
    }
    return this.noise(x, y);
  }

  static createHasher(seed: string) {
    for (var i = 0, h = 1779033703 ^ seed.length; i < seed.length; i++) {
      h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return function () {
      h = Math.imul(h ^ (h >>> 16), 2246822507);
      h = Math.imul(h ^ (h >>> 13), 3266489909);
      return (h ^= h >>> 16) >>> 0;
    };
  }

  static mulberry32(a: number) {
    return function () {
      let t = (a += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  randomNumber(step: number, min = 0, max = 1): number {
    if (!this.noise || !this.hash || !this.seed) {
      throw new NoiseUninitializedBeforeUseError("randomNumber");
    }

    const hash = Noise.createHasher(step.toString() + this.seed)();
    return map(Noise.mulberry32(hash)(), 0, MAX_32_BIT, min, max);
  }
}

export default new Noise();
