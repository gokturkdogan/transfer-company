"use client";

import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { adminCopy, translateAdminError } from "@/features/admin/copy";
import { readImageFileAsDataUrl } from "@/features/admin/lib/crop-image";
import { uploadVehicleImageAction } from "@/features/admin/server/vehicle-image-actions";
import { cn } from "@/lib/utils";

const VehicleImageCropDialog = dynamic(
  () =>
    import("@/features/admin/components/VehicleImageCropDialog").then(
      (module) => module.VehicleImageCropDialog,
    ),
  { ssr: false },
);

const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/png,image/webp";

export type VehicleImageAssetName = "cover" | `gallery-${number}`;

type VehicleImageUploadFieldProps = {
  label: string;
  hint?: string;
  value: string;
  assetName: VehicleImageAssetName;
  getVehicleIdentity: () => {
    code: string;
    brand: string;
    model: string;
  };
  onChange: (value: string) => void;
  showInBookingPreview?: boolean;
  onShowInBookingPreviewChange?: (checked: boolean) => void;
  bookingPreviewDisabled?: boolean;
  className?: string;
  compact?: boolean;
};

export function VehicleImageUploadField({
  label,
  hint,
  value,
  assetName,
  getVehicleIdentity,
  onChange,
  showInBookingPreview = false,
  onShowInBookingPreviewChange,
  bookingPreviewDisabled = false,
  className,
  compact = false,
}: VehicleImageUploadFieldProps) {
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

    const identity = getVehicleIdentity();

    if (!identity.code.trim() || !identity.brand.trim() || !identity.model.trim()) {
      setError(adminCopy.vehicles.form.identityRequiredForUpload);
      return;
    }

    try {
      const dataUrl = await readImageFileAsDataUrl(file);
      setCropSource(dataUrl);
      setCropOpen(true);
    } catch {
      setError(adminCopy.vehicles.form.uploadFailed);
    }
  };

  const handleCroppedUpload = async (croppedDataUrl: string) => {
    const identity = getVehicleIdentity();
    setIsUploading(true);
    setError(null);

    try {
      const result = await uploadVehicleImageAction({
        imageDataUrl: croppedDataUrl,
        code: identity.code.trim(),
        brand: identity.brand.trim(),
        model: identity.model.trim(),
        assetName,
      });

      if (!result.success) {
        setError(translateAdminError(result.error.message));
        return;
      }

      onChange(result.data.imageUrl);
      setCropOpen(false);
      setCropSource(null);
    } catch {
      setError(adminCopy.vehicles.form.uploadFailed);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor={inputId}
          className={cn(
            "cursor-pointer font-medium text-slate-700",
            compact ? "text-xs" : "text-sm",
          )}
        >
          {label}
        </label>
        {value ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              "cursor-pointer px-2 text-red-600 hover:text-red-700",
              compact ? "h-6" : "h-7",
            )}
            onClick={() => {
              onChange("");
              onShowInBookingPreviewChange?.(false);
            }}
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden />
            {!compact ? adminCopy.vehicles.form.removeImage : null}
          </Button>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-lg border border-dashed border-slate-300 bg-slate-50/70">
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
            <div className="relative aspect-video w-full">
              <Image
                src={value}
                alt={label}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 320px"
              />
              {onShowInBookingPreviewChange ? (
                <label
                  className="absolute start-2 top-2 z-10 flex cursor-pointer items-center gap-2 rounded-full border border-white/20 bg-ink/80 px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-lg backdrop-blur-sm"
                  onClick={(event) => event.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    className="h-3.5 w-3.5 rounded border-white/30"
                    checked={showInBookingPreview}
                    disabled={bookingPreviewDisabled && !showInBookingPreview}
                    onChange={(event) =>
                      onShowInBookingPreviewChange(event.target.checked)
                    }
                  />
                  {adminCopy.vehicles.form.showInBookingPreview}
                </label>
              ) : null}
            </div>
          ) : (
            <div
              className={cn(
                "flex aspect-video flex-col items-center justify-center gap-2 text-center",
                compact ? "px-2" : "px-4",
              )}
            >
              <ImagePlus
                className={cn("text-slate-400", compact ? "h-6 w-6" : "h-8 w-8")}
                aria-hidden
              />
              {!compact ? (
                <p className="text-xs text-slate-500">
                  {adminCopy.vehicles.form.uploadPlaceholder}
                </p>
              ) : null}
            </div>
          )}
        </button>

        <div
          className={cn(
            "flex flex-wrap gap-2 border-t border-slate-200 bg-white",
            compact ? "p-2" : "p-3",
          )}
        >
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn("cursor-pointer", compact && "h-8 w-full text-xs")}
            onClick={openFilePicker}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                {adminCopy.vehicles.form.uploading}
              </>
            ) : value ? (
              adminCopy.vehicles.form.replaceImage
            ) : (
              adminCopy.vehicles.form.uploadImage
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
          title={adminCopy.vehicles.form.cropTitle}
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
