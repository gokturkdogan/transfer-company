"use client";

import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import Image from "next/image";
import { useId, useRef, useState, type Dispatch, type SetStateAction } from "react";

import { Button } from "@/components/ui/button";
import { VehicleImageCropDialog } from "@/features/admin/components/VehicleImageCropDialog";
import type { VehicleImageAssetName } from "@/features/admin/components/VehicleImageUploadField";
import { AdminFormGrid } from "@/features/admin/components/shell/AdminFormLayout";
import { adminCopy, translateAdminError } from "@/features/admin/copy";
import { readImageFileAsDataUrl } from "@/features/admin/lib/crop-image";
import { uploadVehicleImageAction } from "@/features/admin/server/vehicle-image-actions";
import {
  MAX_VEHICLE_BOOKING_PREVIEW_IMAGES,
  MAX_VEHICLE_GALLERY_IMAGES,
} from "@/features/vehicles/domain/constants";

const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/png,image/webp";

export type GalleryImageState = {
  clientId: string;
  imageKey: string;
  showInBookingPreview: boolean;
};

type PendingCropItem = {
  id: string;
  dataUrl: string;
  slotIndex: number;
};

type VehicleGallerySectionProps = {
  galleryImages: GalleryImageState[];
  onGalleryImagesChange: Dispatch<SetStateAction<GalleryImageState[]>>;
  getVehicleIdentity: () => {
    code: string;
    brand: string;
    model: string;
  };
  bookingPreviewCount: number;
  bookingPreviewLimitReached: boolean;
};

function createClientId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()}`;
}

function toGalleryAssetName(index: number): VehicleImageAssetName {
  return `gallery-${index + 1}` as VehicleImageAssetName;
}

export function VehicleGallerySection({
  galleryImages,
  onGalleryImagesChange,
  getVehicleIdentity,
  bookingPreviewCount,
  bookingPreviewLimitReached,
}: VehicleGallerySectionProps) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [cropQueue, setCropQueue] = useState<PendingCropItem[]>([]);
  const [activeCrop, setActiveCrop] = useState<PendingCropItem | null>(null);
  const [uploadedInBatch, setUploadedInBatch] = useState(0);

  const remainingSlots = MAX_VEHICLE_GALLERY_IMAGES - galleryImages.length;
  const canUploadMore = remainingSlots > 0;
  const cropProgress = activeCrop ? uploadedInBatch + 1 : uploadedInBatch;
  const cropDialogTotal = uploadedInBatch + cropQueue.length + (activeCrop ? 1 : 0);

  const openFilePicker = () => {
    setError(null);
    fileInputRef.current?.click();
  };

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) {
      return;
    }

    const identity = getVehicleIdentity();

    if (!identity.code.trim() || !identity.brand.trim() || !identity.model.trim()) {
      setError(adminCopy.vehicles.form.identityRequiredForUpload);
      return;
    }

    const selectedFiles = Array.from(files).slice(0, remainingSlots);

    if (selectedFiles.length === 0) {
      return;
    }

    try {
      const pendingItems: PendingCropItem[] = [];

      for (const [offset, file] of selectedFiles.entries()) {
        const dataUrl = await readImageFileAsDataUrl(file);
        pendingItems.push({
          id: createClientId(),
          dataUrl,
          slotIndex: galleryImages.length + offset,
        });
      }

      setUploadedInBatch(0);
      setCropQueue(pendingItems.slice(1));
      setActiveCrop(pendingItems[0] ?? null);
    } catch {
      setError(adminCopy.vehicles.form.uploadFailed);
    }
  };

  const closeCropFlow = () => {
    if (isUploading) {
      return;
    }

    setCropQueue([]);
    setActiveCrop(null);
    setUploadedInBatch(0);
  };

  const handleCroppedUpload = async (croppedDataUrl: string) => {
    if (!activeCrop) {
      return;
    }

    const identity = getVehicleIdentity();
    setIsUploading(true);
    setError(null);

    try {
      const result = await uploadVehicleImageAction({
        imageDataUrl: croppedDataUrl,
        code: identity.code.trim(),
        brand: identity.brand.trim(),
        model: identity.model.trim(),
        assetName: toGalleryAssetName(activeCrop.slotIndex),
      });

      if (!result.success) {
        setError(translateAdminError(result.error.message));
        return;
      }

      onGalleryImagesChange((current) => [
        ...current,
        {
          clientId: createClientId(),
          imageKey: result.data.imageUrl,
          showInBookingPreview: false,
        },
      ]);

      setUploadedInBatch((current) => current + 1);
      setCropQueue((current) => {
        const next = current[0] ?? null;
        setActiveCrop(next);

        if (!next) {
          setUploadedInBatch(0);
        }

        return current.slice(1);
      });
    } catch {
      setError(adminCopy.vehicles.form.uploadFailed);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-xs text-slate-500">
          {adminCopy.vehicles.form.gallerySlotsUsed(
            galleryImages.length,
            MAX_VEHICLE_GALLERY_IMAGES,
          )}
        </p>
        <p className="text-xs text-slate-500">
          {adminCopy.vehicles.form.bookingPreviewLimit(
            bookingPreviewCount,
            MAX_VEHICLE_BOOKING_PREVIEW_IMAGES,
          )}
        </p>
      </div>

      {canUploadMore ? (
        <div className="overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50/70">
          <button
            type="button"
            disabled={isUploading}
            onClick={openFilePicker}
            className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 px-4 py-8 text-center disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isUploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" aria-hidden />
            ) : (
              <ImagePlus className="h-8 w-8 text-slate-400" aria-hidden />
            )}
            <span className="text-sm font-semibold text-slate-700">
              {adminCopy.vehicles.form.bulkUploadGallery}
            </span>
            <span className="text-xs text-slate-500">
              {adminCopy.vehicles.form.bulkUploadGalleryHint(remainingSlots)}
            </span>
          </button>
        </div>
      ) : null}

      <input
        id={inputId}
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES}
        multiple
        className="sr-only"
        onChange={(event) => {
          void handleFilesSelected(event.target.files);
          event.target.value = "";
        }}
      />

      {galleryImages.length > 0 ? (
        <AdminFormGrid cols={3} className="sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {galleryImages.map((image, index) => (
            <div
              key={image.clientId}
              className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
            >
              <div className="relative aspect-video bg-slate-100">
                <Image
                  src={image.imageKey}
                  alt={adminCopy.vehicles.form.galleryImageLabel(index + 1)}
                  fill
                  className="object-cover"
                  sizes="240px"
                />
                <label className="absolute start-2 top-2 z-10 flex cursor-pointer items-center gap-2 rounded-full border border-white/20 bg-ink/80 px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-lg backdrop-blur-sm">
                  <input
                    type="checkbox"
                    className="h-3.5 w-3.5 rounded border-white/30"
                    checked={image.showInBookingPreview}
                    disabled={bookingPreviewLimitReached && !image.showInBookingPreview}
                    onChange={(event) =>
                      onGalleryImagesChange(
                        galleryImages.map((item) =>
                          item.clientId === image.clientId
                            ? {
                                ...item,
                                showInBookingPreview: event.target.checked,
                              }
                            : item,
                        ),
                      )
                    }
                  />
                  {adminCopy.vehicles.form.showInBookingPreview}
                </label>
              </div>
              <div className="flex items-center justify-between gap-2 border-t border-slate-200 px-3 py-2">
                <span className="text-xs font-medium text-slate-600">
                  {adminCopy.vehicles.form.galleryImageLabel(index + 1)}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-red-600 hover:text-red-700"
                  onClick={() =>
                    onGalleryImagesChange(
                      galleryImages.filter((item) => item.clientId !== image.clientId),
                    )
                  }
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  {adminCopy.vehicles.form.removeImage}
                </Button>
              </div>
            </div>
          ))}
        </AdminFormGrid>
      ) : (
        <p className="text-sm text-slate-500">
          {adminCopy.vehicles.form.uploadPlaceholder}
        </p>
      )}

      {error ? <p className="text-xs text-red-600">{error}</p> : null}

      {activeCrop ? (
        <VehicleImageCropDialog
          key={activeCrop.id}
          open
          imageSrc={activeCrop.dataUrl}
          title={
            cropDialogTotal > 1
              ? adminCopy.vehicles.form.cropProgress(cropProgress, cropDialogTotal)
              : adminCopy.vehicles.form.cropTitle
          }
          isUploading={isUploading}
          onClose={closeCropFlow}
          onConfirm={(croppedDataUrl) => {
            void handleCroppedUpload(croppedDataUrl);
          }}
        />
      ) : null}
    </div>
  );
}
