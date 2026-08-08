type BookingStepHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
};

export function BookingStepHeader({
  eyebrow,
  title,
  subtitle,
}: BookingStepHeaderProps) {
  return (
    <header className="mb-6 space-y-2">
      {eyebrow && (
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold">
          {eyebrow}
        </p>
      )}
      <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-[1.65rem]">
        {title}
      </h2>
      {subtitle && (
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          {subtitle}
        </p>
      )}
    </header>
  );
}
