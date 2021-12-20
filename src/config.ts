import Color from "./lib/color";

export const imageColorMap = {
  Wall: new Color(255, 0, 0, 255), // red
  Food: new Color(0, 255, 0, 255), // green
  Empty: new Color(255, 255, 255, 255), // white
} as const;
