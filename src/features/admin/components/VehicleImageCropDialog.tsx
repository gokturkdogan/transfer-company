"use client";

import { Loader2, ZoomIn, ZoomOut } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";

import { Button } from "@/components/ui/button";
import { getCroppedImageDataUrl } from "@/features/admin/lib/crop-image";
import { adminCopy } from "@/features/admin/copy";

const ASPECT_RATIO = 16 / 9;

type VehicleImageCropDialogProps = {
  open: boolean;
  imageSrc: string;
  title: string;
  isUploading: boolean;
  aspectRatio?: number;
  hint?: string;
  onClose: () => void;
  onConfirm: (croppedDataUrl: string) => void;
};

export function VehicleImageCropDialog({
  open,
  imageSrc,
  title,
  isUploading,
  aspectRatio = ASPECT_RATIO,
  hint = adminCopy.vehicles.form.cropHint,
  onClose,
  onConfirm,
}: VehicleImageCropDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isCropping, setIsCropping] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) {
      return;
    }

    setIsCropping(true);

    try {
      const croppedDataUrl = await getCroppedImageDataUrl(
        imageSrc,
        croppedAreaPixels,
      );
      onConfirm(croppedDataUrl);
    } finally {
      setIsCropping(false);
    }
  };

  if (!open) {
    return null;
  }

  const busy = isCropping || isUploading;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="vehicle-image-crop-title"
    >
      <div className="flex w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2
            id="vehicle-image-crop-title"
            className="text-sm font-semibold text-slate-900"
          >
            {title}
          </h2>
          <p className="mt-1 text-xs text-slate-500">{hint}</p>
        </div>

        <div key={imageSrc} className="relative h-[min(52vh,24rem)] bg-slate-950">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            objectFit="contain"
            classes={{
              containerClassName: "rounded-none",
            }}
          />
        </div>

        <div className="space-y-3 border-t border-slate-200 px-4 py-4">
          <div className="flex items-center gap-3">
            <ZoomOut className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
              className="h-1.5 w-full cursor-pointer accent-slate-900"
              aria-label={adminCopy.vehicles.form.cropZoom}
            />
            <ZoomIn className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={busy}>
              {adminCopy.vehicles.form.cancel}
            </Button>
            <Button type="button" onClick={handleConfirm} disabled={busy}>
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  {isUploading
                    ? adminCopy.vehicles.form.uploading
                    : adminCopy.vehicles.form.cropping}
                </>
              ) : (
                adminCopy.vehicles.form.cropConfirm
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
