import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type AdminFormSectionProps = {
  title: string;
  description?: string;
  icon?: LucideIcon | ComponentType<{ className?: string }>;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  compact?: boolean;
};

export function AdminFormSection({
  title,
  description,
  icon: Icon,
  children,
  className,
  contentClassName,
  compact = false,
}: AdminFormSectionProps) {
  return (
    <section
      className={cn(
        "admin-form-section rounded-xl border",
        compact ? "p-4" : "p-4 sm:p-5",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-start gap-3 border-b border-slate-100",
          compact ? "mb-3 pb-3" : "mb-4 pb-3",
        )}
      >
        {Icon ? (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Icon className="h-4 w-4" aria-hidden />
          </div>
        ) : null}
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      <div className={cn("space-y-4", contentClassName)}>{children}</div>
    </section>
  );
}
