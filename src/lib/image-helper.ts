type imageUrlToBufferReturn = {
  buffer: ArrayBuffer;
  width: number;
  height: number;
};

export default abstract class ImageHelper {
  static imageUrlToBuffer(url: string): Promise<imageUrlToBufferReturn> {
    return new Promise<imageUrlToBufferReturn>((resolve) => {
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

        resolve({
          buffer,
          width: image.width,
          height: image.height,
        });
      };
    });
  }

  /**
   * Maps image buffer data from one set of colors to another based on provided imageMap
   */
  static mapImageBuffer(imgBuff: ArrayBuffer, valueMap: Map<number, number>) {
    // initialize TypedArrays for image buffer and new empty buffer of the same length
    const imageArray = new Uint32Array(imgBuff);
    const worldArray = new Uint32Array(new ArrayBuffer(imgBuff.byteLength));

    // iterate through all pixels, mapping image to map hex values
    for (let i = 0; i < imageArray.length; i++) {
      worldArray[i] = valueMap.get(imageArray[i]) || 0;
    }

    return worldArray.buffer;
  }
}
