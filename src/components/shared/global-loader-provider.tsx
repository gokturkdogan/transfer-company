"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { GlobalLoaderOverlay } from "@/components/shared/global-loader-overlay";

type GlobalLoaderContextValue = {
  isActive: boolean;
  show: (message?: string) => void;
  hide: () => void;
  withLoader: <T>(
    work: () => Promise<T>,
    message?: string,
  ) => Promise<T>;
};

const GlobalLoaderContext = createContext<GlobalLoaderContextValue | null>(
  null,
);

type GlobalLoaderProviderProps = {
  children: ReactNode;
  /** Fallback label when callers do not pass a message. */
  defaultMessage?: string;
};

export function GlobalLoaderProvider({
  children,
  defaultMessage = "Loading...",
}: GlobalLoaderProviderProps) {
  const [depth, setDepth] = useState(0);
  const [message, setMessage] = useState(defaultMessage);
  const defaultMessageRef = useRef(defaultMessage);

  useEffect(() => {
    defaultMessageRef.current = defaultMessage;
  }, [defaultMessage]);

  const isActive = depth > 0;

  useEffect(() => {
    if (!isActive) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isActive]);

  const show = useCallback((nextMessage?: string) => {
    setMessage(nextMessage?.trim() || defaultMessageRef.current);
    setDepth((current) => current + 1);
  }, []);

  const hide = useCallback(() => {
    setDepth((current) => Math.max(0, current - 1));
  }, []);

  const withLoader = useCallback(
    async <T,>(work: () => Promise<T>, nextMessage?: string): Promise<T> => {
      show(nextMessage);
      try {
        return await work();
      } finally {
        hide();
      }
    },
    [hide, show],
  );

  const value = useMemo(
    () => ({
      isActive,
      show,
      hide,
      withLoader,
    }),
    [hide, isActive, show, withLoader],
  );

  return (
    <GlobalLoaderContext.Provider value={value}>
      {children}
      {isActive ? <GlobalLoaderOverlay message={message} /> : null}
    </GlobalLoaderContext.Provider>
  );
}

export function useGlobalLoader(): GlobalLoaderContextValue {
  const context = useContext(GlobalLoaderContext);

  if (!context) {
    throw new Error("useGlobalLoader must be used within GlobalLoaderProvider");
  }

  return context;
}

/**
 * Keeps the global overlay in sync with an external busy flag
 * (e.g. booking quote / submit reducer state).
 * No-ops when rendered outside GlobalLoaderProvider (tests / isolated trees).
 */
export function useGlobalLoaderSync(
  active: boolean,
  message?: string,
): void {
  const context = useContext(GlobalLoaderContext);

  useEffect(() => {
    if (!context || !active) {
      return;
    }

    context.show(message);
    return () => {
      context.hide();
    };
  }, [active, context, message]);
}
