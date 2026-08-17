"use client";

import { AlertCircle, CheckCircle2, X } from "lucide-react";
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

import { cn } from "@/lib/utils";

type ToastVariant = "error" | "success";

type ToastInput = {
  title: string;
  description?: string;
  variant?: ToastVariant;
  durationMs?: number;
};

type ToastRecord = ToastInput & {
  id: string;
  variant: ToastVariant;
};

type AppToastContextValue = {
  show: (toast: ToastInput) => void;
};

const AppToastContext = createContext<AppToastContextValue | null>(null);

const DEFAULT_DURATION_MS = 5200;

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastRecord;
  onDismiss: (id: string) => void;
}) {
  const isError = toast.variant === "error";

  return (
    <div
      role="status"
      className={cn(
        "pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-float backdrop-blur-md",
        "animate-[toast-in_220ms_ease-out]",
        isError
          ? "border-red-300/35 bg-ink/95 text-white"
          : "border-gold/30 bg-ink/95 text-white",
      )}
    >
      {isError ? (
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-gold-light" aria-hidden />
      ) : (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold-light" aria-hidden />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-snug">{toast.title}</p>
        {toast.description ? (
          <p className="mt-1 text-xs leading-relaxed text-white/72">
            {toast.description}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="cursor-pointer rounded-md p-1 text-white/55 transition-colors hover:bg-white/10 hover:text-white"
        aria-label="Close"
      >
        <X className="h-3.5 w-3.5" aria-hidden />
      </button>
    </div>
  );
}

export function AppToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    const timer = timersRef.current.get(id);

    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }

    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(
    (input: ToastInput) => {
      const id = crypto.randomUUID();
      const toast: ToastRecord = {
        id,
        title: input.title,
        description: input.description,
        variant: input.variant ?? "error",
        durationMs: input.durationMs ?? DEFAULT_DURATION_MS,
      };

      setToasts((current) => [...current, toast]);

      const timer = setTimeout(() => dismiss(id), toast.durationMs);
      timersRef.current.set(id, timer);
    },
    [dismiss],
  );

  useEffect(() => {
    const timers = timersRef.current;

    return () => {
      for (const timer of timers.values()) {
        clearTimeout(timer);
      }
      timers.clear();
    };
  }, []);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <AppToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-4 bottom-24 z-[92] flex flex-col gap-2 md:inset-x-auto md:bottom-8 md:right-8 md:w-[min(100vw-2rem,22rem)]"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>
    </AppToastContext.Provider>
  );
}

export function useAppToast() {
  const context = useContext(AppToastContext);

  if (!context) {
    throw new Error("useAppToast must be used within AppToastProvider");
  }

  return context;
}
