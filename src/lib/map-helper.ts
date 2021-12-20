import Color from "./color";

export default abstract class MapHelper {
  /**
   * Splits a single TypedArray into multiple TypedArrays, with each being a mask of individual colors
   * in the layerColors argument. Mapped layers will be passed in the order provided in layerColors.
   *
   * @param imgData - TypedArray of the map image to be split into layers
   * @param layerColors - Colors to be mapped to new layers
   */
  static mapWorldDataToLayers(imgData: Uint8Array, layerColors: Color[]) {
    const output: Uint8Array[] = [];

    for (const layerColor of layerColors) {
      const layerBuffer = MapHelper.copyTypedArrayToBuffer(imgData);
      const layerArray = new Uint8Array(layerBuffer);

      for (let i = 0; i < layerArray.byteLength; i += 4) {
        // Create color class from current pixel in the TypedArray
        const currentPixel = new Color(
          layerArray[i],
          layerArray[i + 1],
          layerArray[i + 2],
          layerArray[i + 3]
        );

        if (currentPixel.checkEqual(layerColor)) {
          // If currentPixel matches provided color, set the pixel color to white
          layerArray[i] = 255; // R
          layerArray[i + 1] = 255; // G
          layerArray[i + 2] = 255; // B
          layerArray[i + 3] = 255; // A
        } else {
          // If currentPixel does not match provided color, set the pixel color to black
          layerArray[i] = 0; // R
          layerArray[i + 1] = 0; // G
          layerArray[i + 2] = 0; // B
          layerArray[i + 3] = 0; // A
        }
      }

      output.push(layerArray);
    }

    return output;
  }

  static terrainDataToBitmap(
    terrainData: Uint8Array | Uint8ClampedArray,
    width: number,
    height: number
  ) {
    const buffer = new ArrayBuffer(terrainData.byteLength);
    const uint8clamped = new Uint8ClampedArray(buffer);
    uint8clamped.set(terrainData);

    for (let i = 0; i < uint8clamped.byteLength; i += 4) {
      if (uint8clamped[i] > 0) {
        // Walls
        uint8clamped[i] = 50; // R
        uint8clamped[i + 1] = 50; // G
        uint8clamped[i + 2] = 50; // B
        uint8clamped[i + 3] = 255; // A
      } else {
        // Empty floor
        uint8clamped[i] = 200; // R
        uint8clamped[i + 1] = 200; // G
        uint8clamped[i + 2] = 200; // B
        uint8clamped[i + 3] = 255; // A
      }
    }
    const imageData = new ImageData(uint8clamped, width, height);
    return createImageBitmap(imageData);
  }

  static copyTypedArrayToBuffer(buffer: Uint8Array | Uint8ClampedArray) {
    const newBuffer = new ArrayBuffer(buffer.byteLength);
    const uint8clamped = new Uint8ClampedArray(newBuffer);
    uint8clamped.set(buffer);
    return newBuffer;
  }
}
