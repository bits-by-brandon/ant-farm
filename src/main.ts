import "./styles/style.css";
import "./styles/typography.css";

import Simulation from "./simulation";
import ImageHelper from "./lib/image-helper";
import Ant from "./models/ant";
import UiController from "./ui-controller";

const uploadButton = document.getElementById(
  "map-upload-input"
) as HTMLInputElement;

uploadButton.addEventListener("change", (event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files) return;

  const reader = new FileReader();
  reader.onload = () => handleOnload(reader.result);
  reader.readAsDataURL(input.files[0]);
});

async function handleOnload(imageSrc: any) {
  if (typeof imageSrc !== "string") throw new Error("No map file found");
  const { buffer, width, height } = await ImageHelper.imageUrlToBuffer(
    imageSrc
  );

  const simulation = await Simulation.create(buffer, {
    antCount: 200,
    width,
    height,
  });

  const uiController = new UiController(simulation);

  uiController.bindVisibilityLayerToggle("show-sensor", "sensor");
  uiController.bindVisibilityLayerToggle("show-ant-quadtree", "antQTree");
  uiController.bindVisibilityLayerToggle("show-food-pheromone", "foodPheromone");
  uiController.bindVisibilityLayerToggle("show-home-pheromone", "homePheromone");
  uiController.bindVisibilityLayerToggle( "show-pheromone-quadtree", "pheromoneQTree" );

  uiController.bindPropertySlider<Ant>( "pheromone-steer-angle", "Ant", "pheromoneSteerAngle");
  uiController.bindPropertySlider<Ant>( "pheromone-sensor-distance", "Ant", "pheromoneSensorDistance");
  uiController.bindPropertySlider<Ant>( "pheromone-sensor-radius", "Ant", "pheromoneSensorRadius");
  uiController.hideMapInput("map-upload-input")

  uiController.bindPlayPause("play-pause")

  simulation.start();
}
