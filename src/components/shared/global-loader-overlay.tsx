"use client";

import { BrandLoaderEmblem } from "@/components/shared/brand-loader-emblem";

type GlobalLoaderOverlayProps = {
  message: string;
};

/**
 * Full-viewport blocking loader. Pointer events cover the page so users
 * cannot click through while a service call is in flight.
 */
export function GlobalLoaderOverlay({ message }: GlobalLoaderOverlayProps) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      role="alertdialog"
      aria-modal="true"
      aria-busy="true"
      aria-live="assertive"
      aria-label={message}
    >
      <div
        className="absolute inset-0 bg-ink/70 backdrop-blur-[3px]"
        aria-hidden
      />

      <div className="relative flex flex-col items-center gap-5 px-6">
        <BrandLoaderEmblem alt="" />

        <p className="max-w-xs text-center text-sm font-medium tracking-wide text-gold-light/90">
          {message}
        </p>
      </div>
    </div>
  );
}
