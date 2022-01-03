import { atom } from "recoil";

const simulationPlayState = atom<"playing" | "paused">({
  key: "simulationPlayState",
  default: "playing",
});

export default simulationPlayState;
