import { atomFamily } from "recoil";
import Ant from "../models/ant";
import antInitialProps from "../models/ant/props";
import getPropInitialValue from "../util/get-prop";

const antPropFamily = atomFamily<UiProp<Ant>["initialValue"], keyof Ant>({
  key: "antProp",
  default: (key) => getPropInitialValue<Ant>(key, antInitialProps),
});

export default antPropFamily;
