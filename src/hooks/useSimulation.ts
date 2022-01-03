import { useContext } from "react";
import { SimulationContext } from "../components/simulation-context";

export default function useSimulation() {
  return useContext(SimulationContext);
}
