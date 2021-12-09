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
    imageUrlToBuffer(reader.result as string)
      .then(mapImageBufferToWorld)
      .then(start);
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

/**
 * Converts image buffer data from image format to worldMap format
 */
function mapImageBufferToWorld(imgBuff: ArrayBuffer) {
  // map the rgba color hex value to the map hex value
  const colorMap = new Map<number, number>([
    [0xff0000ff, 0x30000], // red -> wall
    [0xff00ff00, 0x00002], // green -> food
    [0xffffffff, 0], // white -> empty
  ]);

  // initialize TypedArrays for image buffer and new empty buffer of the same length
  const imageArray = new Uint32Array(imgBuff);
  const worldArray = new Uint32Array(new ArrayBuffer(imgBuff.byteLength));

  // iterate through all pixels, mapping image to map hex values
  for (let i = 0; i < imageArray.length; i++) {
    worldArray[i] = colorMap.get(imageArray[i]) || 0;
  }

  return worldArray.buffer;
}
