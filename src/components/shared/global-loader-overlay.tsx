"use client";

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
        className="absolute inset-0 bg-ink/55 backdrop-blur-[2px]"
        aria-hidden
      />

      <div className="relative flex flex-col items-center gap-4 px-6">
        <div className="relative h-12 w-12" aria-hidden>
          <span className="absolute inset-0 rounded-full border-2 border-white/15" />
          <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-gold border-r-gold/50" />
          <span className="absolute inset-[5px] rounded-full bg-ink/40 shadow-gold" />
        </div>

        <p className="max-w-xs text-center text-sm font-medium tracking-wide text-white/90">
          {message}
        </p>
      </div>
    </div>
  );
}
