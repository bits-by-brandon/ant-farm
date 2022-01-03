import React from "react";
import ReactDOM from "react-dom";
import { RecoilRoot } from "recoil";
import "./styles/style.css";
import "./styles/typography.css";

import App from "./components/app";
import { SimulationContextProvider } from "./components/simulation-context";

// async function handleOnload(imageSrc: any) {
//   if (typeof imageSrc !== "string") throw new Error("No map file found");
//   const { buffer, width, height } = await ImageHelper.imageUrlToBuffer(
//     imageSrc
//   );
//
//   const simulationProps = { antCount: 200, width, height };
//   const simulation = await Simulation.create(buffer, simulationProps);
//   const uiController = new UiController(simulation);
//
//   uiController.bindVisibilityLayerToggle("show-sensor", "sensor");
//   uiController.bindVisibilityLayerToggle("show-ant-quadtree", "antQTree");
//   uiController.bindVisibilityLayerToggle(
//     "show-food-pheromone",
//     "foodPheromone"
//   );
//   uiController.bindVisibilityLayerToggle(
//     "show-home-pheromone",
//     "homePheromone"
//   );
//   uiController.bindVisibilityLayerToggle(
//     "show-pheromone-quadtree",
//     "pheromoneQTree"
//   );
//
//   uiController.bindAllPropertySliders();
//   uiController.hideMapInput();
//   uiController.bindPlayPause();
//   uiController.bindStep();
//
//   simulation.draw();
// }

ReactDOM.render(
  <React.StrictMode>
    <RecoilRoot>
      <SimulationContextProvider>
        <App />
      </SimulationContextProvider>
    </RecoilRoot>
  </React.StrictMode>,
  document.getElementById("root")
);
