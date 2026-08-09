"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { PublicContactChannels } from "@/features/contact/types/public-contact";

const PublicContactContext = createContext<PublicContactChannels | null>(null);

type PublicContactProviderProps = {
  channels: PublicContactChannels;
  children: ReactNode;
};

export function PublicContactProvider({
  channels,
  children,
}: PublicContactProviderProps) {
  return (
    <PublicContactContext.Provider value={channels}>
      {children}
    </PublicContactContext.Provider>
  );
}

export function usePublicContactChannels(): PublicContactChannels {
  const channels = useContext(PublicContactContext);

  if (!channels) {
    throw new Error(
      "usePublicContactChannels must be used within PublicContactProvider",
    );
  }

  return channels;
}
