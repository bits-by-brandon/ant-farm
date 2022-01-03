import { RecoilState } from "recoil";
import { useContext } from "react";

import EntitySliderInput from "./entity-slider-input";
import { SimulationContext } from "./simulation-context";

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
  const { simulationState } = useContext(SimulationContext);

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
                disabled={simulationState === "uninitialized"}
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
