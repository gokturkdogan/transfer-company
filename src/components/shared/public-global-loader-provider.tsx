"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { GlobalLoaderProvider } from "@/components/shared/global-loader-provider";

export function PublicGlobalLoaderProvider({
  children,
}: {
  children: ReactNode;
}) {
  const t = useTranslations("common");

  return (
    <GlobalLoaderProvider defaultMessage={t("loading")}>
      {children}
    </GlobalLoaderProvider>
  );
}
