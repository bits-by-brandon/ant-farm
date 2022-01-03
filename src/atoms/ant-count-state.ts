import { atom } from "recoil";

const antCountState = atom<number>({
  key: "antCount",
  default: 200,
});

export default antCountState;
