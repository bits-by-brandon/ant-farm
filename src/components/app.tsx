import { useState } from "react";

import ControlList from "./control-list";
import antInitialProps from "../models/ant/props";
import Simulation from "../models/simulation";
import MapUploadInput from "./map-upload-input";
import SliderInput from "./slider-input";
import Ant from "../models/ant";

function createMutablePropList<T>(props: UiProp<T>[]): MutableUiProp<T>[] {
  // @ts-ignore TS is not smart enough to know that initialValue will be the same type as value for each type
  return props.map((prop) => ({ ...prop, value: prop.initialValue }));
}

export default function App() {
  const [antCount, setAntCount] = useState<number>(400);
  const [simulation, setSimulation] = useState<Simulation | null>(null);

  const [antProps, setAntProps] = useState<MutableUiProp<Ant>[]>(
    createMutablePropList<Ant>(antInitialProps)
  );

  function handleAntChange(key: keyof Ant, value: boolean | number) {
    // @ts-ignore
    setAntProps((prevProps) => {
      return prevProps.map((prevProp) =>
        prevProp.propKey === key ? { ...prevProp, value: value } : prevProp
      );
    });
  }

  async function handleOnUpload(
    mapBuffer: ArrayBuffer,
    width: number,
    height: number
  ) {
    const simulation = await Simulation.create(mapBuffer, {
      antCount,
      width,
      height,
    });

    setSimulation(simulation);
  }

  return (
    <>
      <img src="" alt="" id="img-map" />
      <main>
        <canvas id="main-canvas" style={{ border: "1px #333 solid" }} />

        <div className="controls">
          <h1>Ant Simulator</h1>

          <SliderInput
            label="Number of ants"
            id="ant-count"
            min={1}
            max={2000}
            step={1}
            value={antCount}
            disabled={!!simulation}
            onChange={(count) => setAntCount(count)}
          />

          <MapUploadInput
            id="map-input"
            label="Upload Ant Map"
            disabled={!!simulation}
            onUpload={handleOnUpload}
          />

          <ControlList
            entityProps={antProps}
            onChange={handleAntChange}
            name="Ants"
          />
        </div>
      </main>
    </>
  );
}
