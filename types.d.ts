interface Updatable {
  update(step: number): void;
}

interface UiPropBase<T> {
  key: keyof T;
  name: string;
  description?: string;
  group?: string;
}

interface UiRangeProp<T> extends UiPropBase<T> {
  type: "range";
  min: number;
  max: number;
  increment: number;
  initialValue: number;
}

interface UiBooleanProp<T> extends UiPropBase<T> {
  type: "boolean";
  initialValue: boolean;
}

type UiProp<T> = UiRangeProp<T> | UiBooleanProp<T>;

type UiPropList<T> = UiProp<T>[];

type VectorPair = {
  x: number;
  y: number;
};

type Noise = (x: number, y: number) => number;
