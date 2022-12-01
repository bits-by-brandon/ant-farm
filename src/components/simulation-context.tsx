import React, { ReactNode, useEffect, useRef, useState } from "react";
import Simulation, { SimulationCreateProps } from "../models/simulation";

export interface SimulationContextProviderProps {
  children: ReactNode;
}

export type SimulationState = "playing" | "paused" | "uninitialized";

export interface ISimulationContext {
  simulation: Simulation | null;
  simulationState: SimulationState;
  stop: () => void;
  start: () => void;
  setZoom: (zoom: number) => void;
  moveViewport: (x: number, y: number) => void;
  setSimulationProps: React.Dispatch<React.SetStateAction<SimulationCreateProps | null>>;
}

class SimulationContextInitError extends Error {
  constructor(method: string) {
    super(`${method} called before context has been fully initialized.`);
  }
}

export const SimulationContext = React.createContext<ISimulationContext>({
  simulation: null,
  simulationState: "uninitialized",
  stop: () => {
    throw new SimulationContextInitError("stop");
  },
  start: () => {
    throw new SimulationContextInitError("start");
  },
  setZoom: () => {
    throw new SimulationContextInitError("setZoom");
  },
  moveViewport: () => {
    throw new SimulationContextInitError("setZoom");
  },
  setSimulationProps: () => {
    throw new SimulationContextInitError("setSimulationProps");
  },
});

export function SimulationContextProvider({ children }: SimulationContextProviderProps) {
  const simulationRef = useRef<Simulation | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);
  const [simulationState, setSimulationState] = useState<SimulationState>("uninitialized");
  const [simulationProps, setSimulationProps] = useState<SimulationCreateProps | null>(null);

  function stop() {
    if (initialized && simulationRef.current && simulationState === "playing") {
      simulationRef.current.stop();
      setSimulationState("paused");
    }
  }

  function start() {
    if (initialized && simulationRef.current && simulationState === "paused") {
      simulationRef.current.start();
      setSimulationState("playing");
    }
  }

  function handleSimulationStop() {
    if (!simulationRef.current) return;
    console.log("Paused");
    setSimulationState("paused");
  }

  function handleSimulationStart() {
    if (!simulationRef.current) return;
    console.log("Started");
    setSimulationState("playing");
  }

  function setZoom(zoom: number) {
    if (!simulationRef.current) return;
    simulationRef.current.zoom(zoom);
  }

  function moveViewport(x: number, y: number) {
    if (!simulationRef.current) return;
    simulationRef.current.moveViewport(x, y);
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
        simulationState,
        setZoom,
        moveViewport,
        stop,
        start,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
}
