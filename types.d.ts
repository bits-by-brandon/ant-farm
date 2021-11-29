interface Renderable {
  update(delta?: number): void;
  draw(): void;
}

type VectorPair = {
  x: number;
  y: number;
};

type Noise = (x: number, y: number) => number;
