import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SectionVariant = "default" | "muted" | "dark" | "ink";

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
  ink: "surface-ink text-white",
};

export function Section({
  children,
  variant = "default",
  className,
  id,
}: SectionProps) {
  const isInk = variant === "ink";

  return (
    <section
      id={id}
      className={cn(
        "relative scroll-mt-20 py-20 md:py-28",
        variantClasses[variant],
        isInk && "isolate overflow-hidden",
        className,
      )}
    >
      {isInk && (
        <>
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -top-32 end-1/4 h-[28rem] w-[28rem] animate-aurora rounded-full bg-gold/12 blur-[150px]"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 futuristic-grid [mask-image:radial-gradient(58%_54%_at_50%_46%,#000,transparent)]"
          />
        </>
      )}
      <div className="relative">{children}</div>
    </section>
  );
}
