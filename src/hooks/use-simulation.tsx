import { useEffect, useState } from "react";
import Simulation, { SimulationCreateProps } from "../models/simulation";

export default function useSimulation(
  mapBuffer?: ArrayBuffer,
  simulationProps?: SimulationCreateProps
): Simulation | null {
  const [simulation, setSimulation] = useState<Simulation | null>(null);

  useEffect(() => {
    if (!mapBuffer || !simulationProps) {
      setSimulation(null);
    } else {
      Simulation.create(mapBuffer, simulationProps).then((simulation) => {
        setSimulation(simulation);
      });
    }
  }, [mapBuffer, simulationProps]);

  return simulation;
}
