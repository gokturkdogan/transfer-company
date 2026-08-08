"use client";

import type { ReactNode } from "react";

import { Alert } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

type AdminFormShellProps = {
  children: ReactNode;
  actions: ReactNode;
  error?: string | null;
  className?: string;
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
};

export function AdminFormShell({
  children,
  actions,
  error,
  className,
  onSubmit,
}: AdminFormShellProps) {
  return (
    <form
      className={cn("mx-auto w-full max-w-6xl space-y-4", className)}
      onSubmit={onSubmit}
    >
      {error ? <Alert variant="destructive">{error}</Alert> : null}

      <div className="space-y-4">{children}</div>

      <div className="sticky bottom-4 z-10 flex flex-wrap gap-3 rounded-xl border border-slate-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-white/90">
        {actions}
      </div>
    </form>
  );
}
