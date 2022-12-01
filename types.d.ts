interface Updatable {
  update(step: number): void;
}

interface UiPropBase<T> {
  propKey: keyof T;
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

interface MutableUiRangeProp<T> extends UiRangeProp<T> {
  value: number;
}

interface UiBooleanProp<T> extends UiPropBase<T> {
  type: "boolean";
  initialValue: boolean;
}

interface MutableUiBooleanProp<T> extends UiBooleanProp<T> {
  value: boolean;
}

type UiProp<T> = UiRangeProp<T> | UiBooleanProp<T>;
type MutableUiProp<T> = MutableUiRangeProp<T> | MutableUiBooleanProp<T>;

type UiPropList<T> = UiProp<T>[];

type VectorPair = {
  x: number;
  y: number;
};

type NoiseFunc = (x: number, y: number) => number;
