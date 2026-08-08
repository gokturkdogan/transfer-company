import type { ReactNode } from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type AdminFieldProps = {
  label: string;
  htmlFor?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
};

export function AdminField({
  label,
  htmlFor,
  hint,
  required,
  children,
  className,
}: AdminFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={htmlFor} className="text-slate-700">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </Label>
      {children}
      {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}
