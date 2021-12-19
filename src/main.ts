import "./styles/style.css";

import Simulation from "./simulation";
import ImageHelper from "./lib/image-helper";

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
    antCount: 500,
    width,
    height,
  });

  simulation.start();
}
