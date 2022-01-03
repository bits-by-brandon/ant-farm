import EntitySliderInput from "./entity-slider-input";
import { RecoilState } from "recoil";

export interface ControlListProps<T> {
  entityProps: UiProp<T>[];
  name: string;
  atomFamily: (param: keyof T) => RecoilState<number | boolean>;
}

export default function ControlList<T>({
  entityProps,
  name,
  atomFamily,
}: ControlListProps<T>) {
  return (
    <div className="controls__control-list">
      <h3>{name}</h3>
      {entityProps.map((entityProp) => {
        switch (entityProp.type) {
          case "range":
            return (
              <EntitySliderInput<T>
                {...entityProp}
                layerId="Ant"
                atomFamily={atomFamily}
                key={entityProp.propKey.toString()}
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
