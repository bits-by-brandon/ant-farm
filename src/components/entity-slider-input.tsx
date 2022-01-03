import { RecoilState, useRecoilState } from "recoil";
import SliderInput, { SliderInputProps } from "./slider-input";
import { useContext, useEffect } from "react";
import { SimulationContext } from "./simulation-context";

export interface EntitySliderInputProps<T>
  extends Pick<SliderInputProps, "disabled">,
    UiRangeProp<T> {
  layerId: string;
  atomFamily: (param: keyof T) => RecoilState<number | boolean>;
}

export default function EntitySliderInput<T>({
  propKey,
  layerId,
  name,
  increment,
  min,
  max,
  disabled,
  atomFamily,
}: EntitySliderInputProps<T>) {
  const [value, setValue] = useRecoilState(atomFamily(propKey));
  const { simulation } = useContext(SimulationContext);
  const id = propKey.toString();

  if (typeof value !== "number") {
    throw new Error(`Type mismatch for given prop. Prop ${propKey} is expected to be a number, but instead is a ${typeof value}.
Check the value of the props.ts file, or pass the prop to a different
`);
  }

  useEffect(() => {
    if (!simulation) return;
    if (!simulation.setProp(layerId, propKey, value)) {
      throw new Error(
        `Setting prop ${propKey} in layer ${layerId} to ${value} was unsuccessful.`
      );
    }
  }, [value]);

  return (
    <SliderInput
      label={name}
      id={id}
      min={min}
      max={max}
      step={increment}
      disabled={disabled}
      value={value}
      onChange={(newValue) => setValue(newValue)}
    />
  );
}
