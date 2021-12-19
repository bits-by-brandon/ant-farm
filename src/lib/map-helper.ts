export default abstract class MapHelper {
  /**
   * Splits a single TypedArray into multiple TypedArrays, with each being a mask of individual colors
   * in the layerColors argument. Mapped layers will be passed in the order provided in layerColors.
   *
   * @param imgData - TypedArray to split into layers
   * @param layerColors - (0xRGBA) Colors to be mapped to new layers
   */
  static mapWorldDataToLayers(imgData: Uint8Array, layerColors: number[]) {
    const output: Uint8Array[] = [];

    for (const color of layerColors) {
      const mapLayer = imgData.map((pixel) => (pixel === color ? 0xff : 0));
      output.push(mapLayer);
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
        uint8clamped[i] = 20; // R
        uint8clamped[i + 1] = 20; // G
        uint8clamped[i + 2] = 20; // B
        uint8clamped[i + 3] = 255; // A
      } else {
        uint8clamped[i] = 100; // R
        uint8clamped[i + 1] = 100; // G
        uint8clamped[i + 2] = 100; // B
        uint8clamped[i + 3] = 255; // A
      }
    }
    const imageData = new ImageData(uint8clamped, width, height);
    return createImageBitmap(imageData);
  }
}
