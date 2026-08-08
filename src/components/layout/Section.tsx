import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SectionVariant = "default" | "muted" | "dark";

type SectionProps = {
  children: ReactNode;
  variant?: SectionVariant;
  className?: string;
  id?: string;
};

const variantClasses: Record<SectionVariant, string> = {
  default: "bg-background",
  muted: "bg-muted",
  dark: "bg-dark text-white",
};

export function Section({
  children,
  variant = "default",
  className,
  id,
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn("py-20 md:py-28", variantClasses[variant], className)}
    >
      {children}
    </section>
  );
}
