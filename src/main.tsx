import React from "react";
import ReactDOM from "react-dom";
import "./styles/style.css";
import "./styles/typography.css";

// import Simulation from "./models/simulation";
// import ImageHelper from "./lib/image-helper";
// import UiController from "./lib/ui-controller";
import App from "./components/app";

// const uploadButton = document.getElementById(
//   "map-upload-input"
// ) as HTMLInputElement;

// uploadButton.addEventListener("change", (event) => {
//   const input = event.target as HTMLInputElement;
//   if (!input.files) return;
//
//   const reader = new FileReader();
//   reader.onload = () => handleOnload(reader.result);
//   reader.readAsDataURL(input.files[0]);
// });

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
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
