import React, { ReactNode, useEffect, useRef, useState } from "react";
import Simulation, { SimulationCreateProps } from "../models/simulation";

export interface SimulationContextProviderProps {
  children: ReactNode;
}

export interface ISimulationContext {
  simulation: Simulation | null;
  stop: () => void;
  start: () => void;
  setSimulationProps: React.Dispatch<
    React.SetStateAction<SimulationCreateProps | null>
  >;
}

class SimulationContextInitError extends Error {
  constructor(method: string) {
    super(`${method} called before context has been fully initialized.`);
  }
}

export const SimulationContext = React.createContext<ISimulationContext>({
  simulation: null,
  stop: () => {
    throw new SimulationContextInitError("stop");
  },
  start: () => {
    throw new SimulationContextInitError("start");
  },
  setSimulationProps: () => {
    throw new SimulationContextInitError("setSimulationProps");
  },
});

export function SimulationContextProvider({
  children,
}: SimulationContextProviderProps) {
  const simulationRef = useRef<Simulation | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);
  const [simulationState, setSimulationState] = useState<
    "playing" | "paused" | "uninitialized"
  >("uninitialized");
  // const [mapBuffer, setMapBuffer] = useState<ArrayBuffer | null>(null);
  const [simulationProps, setSimulationProps] =
    useState<SimulationCreateProps | null>(null);

  function stop() {
    if (initialized && simulationRef.current && simulationState === "playing") {
      simulationRef.current.stop();
    }
  }

  function start() {
    if (initialized && simulationRef.current && simulationState === "paused") {
      simulationRef.current.start();
    }
  }

  function handleSimulationStop() {
    if (!simulationRef.current) return;
    setSimulationState("paused");
  }

  function handleSimulationStart() {
    if (!simulationRef.current) return;
    setSimulationState("playing");
  }

  async function initializeSimulation(props: SimulationCreateProps) {
    const simulation = await Simulation.create(props);
    simulation.subscribe("start", handleSimulationStart);
    simulation.subscribe("stop", handleSimulationStop);
    return simulation;
  }

  useEffect(() => {
    if (!initialized && simulationProps) {
      initializeSimulation(simulationProps).then((simulation) => {
        simulation.draw();
        simulationRef.current = simulation;
        setSimulationState("paused");
        setInitialized(true);
      });
    }
  }, [simulationProps]);

  return (
    <SimulationContext.Provider
      value={{
        simulation: simulationRef.current,
        setSimulationProps,
        stop,
        start,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
}
