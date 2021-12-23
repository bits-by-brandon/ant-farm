interface Updatable {
  update(step: number): void;
}

type VectorPair = {
  x: number;
  y: number;
};

type Noise = (x: number, y: number) => number;
