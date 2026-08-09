import type { Area } from "react-easy-crop";

const OUTPUT_MIME_TYPE = "image/jpeg";
const OUTPUT_QUALITY = 0.92;

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", () => reject(new Error("IMAGE_LOAD_FAILED")));
    image.crossOrigin = "anonymous";
    image.src = url;
  });
}

async function canvasToDataUrl(canvas: HTMLCanvasElement): Promise<string> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("CROP_FAILED"));
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result !== "string") {
            reject(new Error("CROP_FAILED"));
            return;
          }

          resolve(reader.result);
        };
        reader.onerror = () => reject(new Error("CROP_FAILED"));
        reader.readAsDataURL(blob);
      },
      OUTPUT_MIME_TYPE,
      OUTPUT_QUALITY,
    );
  });
}

export async function getCroppedImageDataUrl(
  imageSrc: string,
  pixelCrop: Area,
): Promise<string> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("CROP_FAILED");
  }

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  context.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  return canvasToDataUrl(canvas);
}

export async function readImageFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("FILE_READ_FAILED"));
        return;
      }

      resolve(reader.result);
    };
    reader.onerror = () => reject(new Error("FILE_READ_FAILED"));
    reader.readAsDataURL(file);
  });
}
