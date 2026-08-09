import "server-only";

import { v2 as cloudinary } from "cloudinary";

import { serverEnv } from "@/config/env";
import { buildVehicleImageFolderPath } from "@/lib/cloudinary/vehicle-folder";
import { DomainRuleError } from "@/server/errors";

const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

let configured = false;

function ensureCloudinaryConfigured(): void {
  if (configured) {
    return;
  }

  cloudinary.config({
    cloud_name: serverEnv.CLOUDINARY_CLOUD_NAME,
    api_key: serverEnv.CLOUDINARY_API_KEY,
    api_secret: serverEnv.CLOUDINARY_API_SECRET,
    secure: true,
  });

  configured = true;
}

function parseDataUrl(dataUrl: string): { mimeType: string; buffer: Buffer } {
  const match = /^data:(image\/[a-z0-9.+-]+);base64,(.+)$/i.exec(dataUrl);

  if (!match) {
    throw new DomainRuleError("INVALID_IMAGE_DATA");
  }

  const mimeType = match[1]!.toLowerCase();

  if (!ALLOWED_IMAGE_MIME_TYPES.has(mimeType)) {
    throw new DomainRuleError("UNSUPPORTED_IMAGE_TYPE");
  }

  const buffer = Buffer.from(match[2]!, "base64");

  if (buffer.byteLength === 0) {
    throw new DomainRuleError("EMPTY_IMAGE");
  }

  if (buffer.byteLength > MAX_IMAGE_BYTES) {
    throw new DomainRuleError("IMAGE_TOO_LARGE");
  }

  return { mimeType, buffer };
}

export type UploadVehicleImageInput = {
  imageDataUrl: string;
  code: string;
  brand: string;
  model: string;
  assetName: string;
};

export type UploadVehicleImageResult = {
  secureUrl: string;
  publicId: string;
  folder: string;
};

export async function uploadVehicleImageToCloudinary(
  input: UploadVehicleImageInput,
): Promise<UploadVehicleImageResult> {
  ensureCloudinaryConfigured();

  const { buffer } = parseDataUrl(input.imageDataUrl);
  const folder = buildVehicleImageFolderPath(
    input.code,
    input.brand,
    input.model,
  );

  const result = await cloudinary.uploader.upload(
    `data:image/jpeg;base64,${buffer.toString("base64")}`,
    {
      folder,
      public_id: input.assetName,
      overwrite: true,
      invalidate: true,
      resource_type: "image",
      format: "jpg",
    },
  );

  return {
    secureUrl: result.secure_url,
    publicId: result.public_id,
    folder,
  };
}
