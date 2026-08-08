import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type AdminContentCardProps = {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  flush?: boolean;
};

export function AdminContentCard({
  title,
  description,
  action,
  children,
  className,
  contentClassName,
  flush = false,
}: AdminContentCardProps) {
  return (
    <div
      className={cn(
        "admin-content-card overflow-hidden rounded-xl border",
        className,
      )}
    >
      {title || action ? (
        <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {title ? (
              <h2 className="text-base font-semibold text-slate-900">{title}</h2>
            ) : null}
            {description ? (
              <p className="mt-0.5 text-xs text-slate-500">{description}</p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      ) : null}
      <div className={cn(flush ? "p-0" : "p-5", contentClassName)}>
        {children}
      </div>
    </div>
  );
}
