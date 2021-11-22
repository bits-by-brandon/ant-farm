interface Renderable {
  update(delta?: number): void;
  draw(): void;
}

type Vector = {
  x: number;
  y: number;
};
