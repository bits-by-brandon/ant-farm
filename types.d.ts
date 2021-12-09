interface Updatable {
  update(delta: number, step: number): void;
}

type VectorPair = {
  x: number;
  y: number;
};

type Noise = (x: number, y: number) => number;
