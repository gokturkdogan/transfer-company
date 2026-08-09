"use client";

import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import Image from "next/image";
import { useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { VehicleImageCropDialog } from "@/features/admin/components/VehicleImageCropDialog";
import { adminCopy, translateAdminError } from "@/features/admin/copy";
import { readImageFileAsDataUrl } from "@/features/admin/lib/crop-image";
import { uploadDestinationImageAction } from "@/features/admin/server/destination-image-actions";
import { cn } from "@/lib/utils";

const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/png,image/webp";

type DistrictImageUploadFieldProps = {
  value: string;
  getDistrictCode: () => string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
};

export function DistrictImageUploadField({
  value,
  getDistrictCode,
  onChange,
  required = false,
  className,
}: DistrictImageUploadFieldProps) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [cropSource, setCropSource] = useState<string | null>(null);
  const [cropOpen, setCropOpen] = useState(false);

  const openFilePicker = () => {
    setError(null);
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (file: File | undefined) => {
    if (!file) {
      return;
    }

    const code = getDistrictCode().trim();

    if (!code) {
      setError(adminCopy.locationForm.featured.codeRequiredForImage);
      return;
    }

    try {
      const dataUrl = await readImageFileAsDataUrl(file);
      setCropSource(dataUrl);
      setCropOpen(true);
    } catch {
      setError(adminCopy.locationForm.featured.uploadFailed);
    }
  };

  const handleCroppedUpload = async (croppedDataUrl: string) => {
    const code = getDistrictCode().trim();

    if (!code) {
      setError(adminCopy.locationForm.featured.codeRequiredForImage);
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const result = await uploadDestinationImageAction({
        imageDataUrl: croppedDataUrl,
        code,
      });

      if (!result.success) {
        setError(translateAdminError(result.error.message));
        return;
      }

      onChange(result.data.imageUrl);
      setCropOpen(false);
      setCropSource(null);
    } catch {
      setError(adminCopy.locationForm.featured.uploadFailed);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap items-start gap-3">
        <div className="relative aspect-square w-32 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          {value ? (
            <Image
              src={value}
              alt=""
              fill
              className="object-cover"
              sizes="8rem"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-400">
              <ImagePlus className="h-8 w-8" aria-hidden />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <input
            id={inputId}
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_IMAGE_TYPES}
            className="sr-only"
            onChange={(event) => {
              void handleFileSelected(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
          <Button type="button" variant="outline" size="sm" onClick={openFilePicker}>
            {value
              ? adminCopy.locationForm.featured.changeImage
              : adminCopy.locationForm.featured.uploadImage}
          </Button>
          {value ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="justify-start text-red-600 hover:text-red-700"
              onClick={() => onChange("")}
            >
              <Trash2 className="h-4 w-4" aria-hidden />
              {adminCopy.locationForm.featured.removeImage}
            </Button>
          ) : null}
          {required ? (
            <p className="text-xs text-slate-500">
              {adminCopy.locationForm.featured.imageRequiredHint}
            </p>
          ) : null}
        </div>
      </div>

      {error ? <p className="text-xs text-red-600">{error}</p> : null}

      {cropSource ? (
        <VehicleImageCropDialog
          open={cropOpen}
          imageSrc={cropSource}
          title={adminCopy.locationForm.featured.cropTitle}
          hint={adminCopy.locationForm.featured.cropHint}
          aspectRatio={1}
          isUploading={isUploading}
          onClose={() => {
            if (isUploading) {
              return;
            }

            setCropOpen(false);
            setCropSource(null);
          }}
          onConfirm={handleCroppedUpload}
        />
      ) : null}
    </div>
  );
}
