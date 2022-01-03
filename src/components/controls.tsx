import { useRecoilState } from "recoil";
import { useContext } from "react";

import antCountState from "../atoms/ant-count-state";
import antPropFamily from "../atoms/ant-prop-family";
import antProps from "../models/ant/props";

import Ant from "../models/ant";
import SliderInput from "./slider-input";
import MapUploadInput from "./map-upload-input";
import ControlList from "./control-list";
import { SimulationContext } from "./simulation-context";

export default function Controls() {
  const [antCount, setAntCount] = useRecoilState(antCountState);
  const { simulation, setSimulationProps } = useContext(SimulationContext);

  async function handleOnUpload(
    mapBuffer: ArrayBuffer,
    width: number,
    height: number
  ) {
    setSimulationProps({ antCount, mapBuffer, width, height });
  }

  return (
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

      <ControlList<Ant>
        name="Ants"
        entityProps={antProps}
        atomFamily={antPropFamily}
      />
    </div>
  );
}
