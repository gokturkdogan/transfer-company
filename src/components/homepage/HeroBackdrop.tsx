/**
 * Decorative depth layers for the hero: cinematic ink wash, drifting gold
 * aurora, a futuristic grid and a warm horizon glow. Pure CSS so it stays a
 * server component and costs no client JS.
 */
export function HeroBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Ink wash — keeps text legible without flattening the photograph */}
      <div className="absolute inset-0 bg-gradient-to-b from-ink/92 via-ink/72 to-ink/94 lg:from-ink/88 lg:via-ink/58" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/70 via-transparent to-ink/45" />

      {/* Warm overhead spotlight */}
      <div className="absolute inset-0 bg-[radial-gradient(78%_58%_at_50%_-8%,rgb(200_164_93/0.28),transparent_68%)]" />

      {/* Drifting gold aurora */}
      <div className="absolute -top-40 -start-24 h-[38rem] w-[38rem] animate-aurora rounded-full bg-gold/22 blur-[150px]" />
      <div
        className="absolute -bottom-56 end-[-6rem] h-[34rem] w-[34rem] animate-aurora rounded-full bg-gold-light/18 blur-[160px]"
        style={{ animationDelay: "-8s" }}
      />
      <div
        className="absolute bottom-1/4 start-1/3 h-64 w-64 animate-float-slow rounded-full bg-white/8 blur-[120px]"
        style={{ animationDelay: "-4s" }}
      />

      {/* Futuristic grid, faded toward the edges */}
      <div className="absolute inset-0 animate-grid-drift futuristic-grid [mask-image:radial-gradient(62%_58%_at_50%_38%,#000,transparent)]" />

      {/* Vertical light beams */}
      <div className="absolute inset-y-0 start-[18%] w-px animate-glow-pulse bg-gradient-to-b from-transparent via-gold/35 to-transparent" />
      <div
        className="absolute inset-y-0 end-[24%] w-px animate-glow-pulse bg-gradient-to-b from-transparent via-white/22 to-transparent"
        style={{ animationDelay: "-2s" }}
      />

      {/* Gold horizon that hands off to the next section */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
    </div>
  );
}
