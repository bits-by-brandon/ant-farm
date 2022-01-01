import { ChangeEvent } from "react";
import "./style.css";

export interface SliderInputProps {
  label: string;
  id: string;
  min: number;
  max: number;
  step: number;
  disabled?: boolean;
  value: number;
  onChange: (newValue: number) => void;
}

export default function Index({
  label,
  id,
  value,
  step,
  min,
  max,
  onChange,
  disabled = false,
}: SliderInputProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(parseFloat(event.target.value));
  };

  return (
    <div className="control__container control__container--slider">
      <div className="control__details">
        <label className="control__label" htmlFor={id}>
          {label}
        </label>
        <input
          type="tel"
          className="control__value"
          value={value}
          onChange={handleChange}
        />
      </div>
      <input
        id={id}
        disabled={disabled}
        type="range"
        value={value}
        step={step.toString()}
        min={min.toString()}
        max={max.toString()}
        onChange={handleChange}
      />
    </div>
  );
}
