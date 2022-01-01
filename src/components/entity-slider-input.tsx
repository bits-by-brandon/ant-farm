import Index, { SliderInputProps } from "./slider-input";

export interface EntitySliderInputProps<T>
  extends Omit<SliderInputProps, "label" | "id" | "step">,
    UiRangeProp<T> {}

export default function EntitySliderInput<T>({
  propKey,
  name,
  value,
  increment,
  min,
  max,
  disabled,
  onChange,
}: EntitySliderInputProps<T>) {
  const id = propKey.toString();

  return (
    <Index
      label={name}
      id={id}
      min={min}
      max={max}
      step={increment}
      disabled={disabled}
      value={value}
      onChange={onChange}
    />
  );
}
