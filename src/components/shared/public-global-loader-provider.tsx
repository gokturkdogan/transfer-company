"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { GlobalLoaderProvider } from "@/components/shared/global-loader-provider";

/**
 * Dev preview: keep the loader overlay on screen.
 * Set back to `false` when done reviewing the animation.
 */
const FORCE_LOADER_VISIBLE = true;

export function PublicGlobalLoaderProvider({
  children,
}: {
  children: ReactNode;
}) {
  const t = useTranslations("common");

  return (
    <GlobalLoaderProvider
      defaultMessage={t("loading")}
      forceVisible={FORCE_LOADER_VISIBLE}
    >
      {children}
    </GlobalLoaderProvider>
  );
}
