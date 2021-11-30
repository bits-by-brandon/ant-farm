import "./styles/style.css";

import { start } from "./simulation";

const uploadButton = document.getElementById(
  "map-upload-input"
) as HTMLInputElement;

uploadButton.addEventListener("change", (event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files) return;

  const reader = new FileReader();
  reader.onload = function () {
    imageUrlToBuffer(reader.result as string).then((buffer) => {
      start(buffer);
    });
  };

  reader.readAsDataURL(input.files[0]);
});

function imageUrlToBuffer(url: string) {
  return new Promise<ArrayBufferLike>((resolve) => {
    const image = new Image();
    image.src = url;
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
      const body = document.getElementsByTagName("body")[0];
      canvas.width = image.width;
      canvas.height = image.height;
      body.appendChild(canvas);

      ctx.drawImage(image, 0, 0);
      const buffer = ctx.getImageData(0, 0, canvas.width, canvas.height).data
        .buffer;
      body.removeChild(canvas);
      resolve(buffer);
    };
  });
}
