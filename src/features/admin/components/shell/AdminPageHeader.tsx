import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type AdminPageHeaderProps = {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  actions?: ReactNode;
  className?: string;
};

export function AdminPageHeader({
  title,
  subtitle,
  icon: Icon,
  actions,
  className,
}: AdminPageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/25">
          <Icon className="h-6 w-6" aria-hidden />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {title}
          </h1>
          {subtitle ? (
            <p className="max-w-2xl text-sm text-slate-500">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}
