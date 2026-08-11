"use client";

import { useEffect } from "react";

import { cn } from "@/lib/utils";

/** Dial-code territories that ship as subdivision assets in `flag-icons`. */
const FLAG_ASSET_OVERRIDES: Record<string, string> = {
  AC: "sh-ac",
  TA: "sh-ta",
};

const FALLBACK_FLAG_ASSET = "xx";

export function getFlagAssetCode(iso2: string): string {
  const code = iso2.trim().toUpperCase();

  if (FLAG_ASSET_OVERRIDES[code]) {
    return FLAG_ASSET_OVERRIDES[code];
  }

  return /^[A-Z]{2}$/.test(code) ? code.toLowerCase() : FALLBACK_FLAG_ASSET;
}

type FlagIconProps = {
  iso2: string;
  /** Accessible name; omit to keep the flag decorative. */
  label?: string;
  className?: string;
};

/**
 * Renders a country flag as an SVG asset (`flag-icons`) instead of an emoji,
 * because regional-indicator emoji do not render on Windows or many Androids.
 * Size follows the current font-size (width 1.333em / height 1em).
 * CSS is loaded once on mount to keep the critical layout CSS lean.
 */
export function FlagIcon({ iso2, label, className }: FlagIconProps) {
  useEffect(() => {
    void import("flag-icons/css/flag-icons.min.css");
  }, []);

  return (
    <span
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn(
        "fi shrink-0 rounded-[2px] bg-muted/40 shadow-[inset_0_0_0_1px_rgb(0_0_0/0.1)]",
        `fi-${getFlagAssetCode(iso2)}`,
        className,
      )}
    />
  );
}
