import EntitySliderInput from "./entity-slider-input";

export interface ControlListProps<T> {
  entityProps: MutableUiProp<T>[];
  onChange: (key: keyof T, value: number) => void;
  name: string;
}

export default function ControlList<T>({
  entityProps,
  onChange,
  name,
}: ControlListProps<T>) {
  return (
    <div className="controls__control-list">
      <h3>{name}</h3>
      {entityProps.map((entityProp) => {
        switch (entityProp.type) {
          case "range":
            return (
              <EntitySliderInput
                {...entityProp}
                key={entityProp.propKey.toString()}
                value={entityProp.value}
                onChange={(newValue) => onChange(entityProp.propKey, newValue)}
              />
            );
          case "boolean":
          default:
            return null;
        }
      })}
    </div>
  );
}
