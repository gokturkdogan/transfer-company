"use client";

import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import Image from "next/image";
import { useId, useRef, useState } from "react";

import { BLOG_COVER_ASPECT_RATIO } from "@/config/blog-cover";
import { Button } from "@/components/ui/button";
import { VehicleImageCropDialog } from "@/features/admin/components/VehicleImageCropDialog";
import { adminCopy, translateAdminError } from "@/features/admin/copy";
import { readImageFileAsDataUrl } from "@/features/admin/lib/crop-image";
import { uploadBlogCoverImageAction } from "@/features/admin/server/blog-cover-image-actions";
import { cn } from "@/lib/utils";

const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/png,image/webp";

type BlogCoverImageUploadFieldProps = {
  label: string;
  hint?: string;
  value: string;
  slug: string;
  onChange: (value: string) => void;
  className?: string;
};

export function BlogCoverImageUploadField({
  label,
  hint,
  value,
  slug,
  onChange,
  className,
}: BlogCoverImageUploadFieldProps) {
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

    if (!slug.trim()) {
      setError(adminCopy.guides.form.slugRequiredForUpload);
      return;
    }

    try {
      const dataUrl = await readImageFileAsDataUrl(file);
      setCropSource(dataUrl);
      setCropOpen(true);
    } catch {
      setError(adminCopy.guides.form.uploadFailed);
    }
  };

  const handleCroppedUpload = async (croppedDataUrl: string) => {
    setIsUploading(true);
    setError(null);

    try {
      const result = await uploadBlogCoverImageAction({
        imageDataUrl: croppedDataUrl,
        slug: slug.trim(),
      });

      if (!result.success) {
        setError(translateAdminError(result.error.message));
        return;
      }

      onChange(result.data.imageUrl);
      setCropOpen(false);
      setCropSource(null);
    } catch {
      setError(adminCopy.guides.form.uploadFailed);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor={inputId}
          className="cursor-pointer text-sm font-medium text-slate-700"
        >
          {label}
        </label>
        {value ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 cursor-pointer px-2 text-red-600 hover:text-red-700"
            onClick={() => onChange("")}
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden />
            {adminCopy.guides.form.removeImage}
          </Button>
        ) : null}
      </div>

      <div className="max-w-xs overflow-hidden rounded-lg border border-dashed border-slate-300 bg-slate-50/70 sm:max-w-sm">
        <button
          type="button"
          disabled={isUploading}
          onClick={openFilePicker}
          className={cn(
            "relative block w-full cursor-pointer disabled:cursor-not-allowed disabled:opacity-60",
            value ? "bg-slate-100" : "bg-transparent",
          )}
        >
          {value ? (
            <div className="relative aspect-[16/10] w-full">
              <Image
                src={value}
                alt={label}
                fill
                className="object-cover"
                sizes="384px"
              />
            </div>
          ) : (
            <div className="flex aspect-[16/10] flex-col items-center justify-center gap-2 px-4 py-6 text-center">
              <ImagePlus className="h-7 w-7 text-slate-400" aria-hidden />
              <p className="text-xs text-slate-500">
                {adminCopy.guides.form.uploadPlaceholder}
              </p>
            </div>
          )}
        </button>

        <div className="flex flex-wrap gap-2 border-t border-slate-200 bg-white p-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="cursor-pointer"
            onClick={openFilePicker}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                {adminCopy.guides.form.uploading}
              </>
            ) : value ? (
              adminCopy.guides.form.replaceImage
            ) : (
              adminCopy.guides.form.uploadImage
            )}
          </Button>
        </div>
      </div>

      {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}

      <input
        ref={fileInputRef}
        id={inputId}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES}
        className="sr-only"
        onChange={(event) => {
          void handleFileSelected(event.target.files?.[0]);
          event.target.value = "";
        }}
      />

      {cropSource ? (
        <VehicleImageCropDialog
          key={cropSource}
          open={cropOpen}
          imageSrc={cropSource}
          title={adminCopy.guides.form.cropTitle}
          hint={adminCopy.guides.form.cropHint}
          aspectRatio={BLOG_COVER_ASPECT_RATIO}
          isUploading={isUploading}
          onClose={() => {
            if (isUploading) {
              return;
            }

            setCropOpen(false);
            setCropSource(null);
          }}
          onConfirm={(croppedDataUrl) => {
            void handleCroppedUpload(croppedDataUrl);
          }}
        />
      ) : null}
    </div>
  );
}
