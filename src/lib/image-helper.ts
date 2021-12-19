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
}
