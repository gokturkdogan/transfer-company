import {
  Gem,
  Headphones,
  PlaneLanding,
  ShieldCheck,
  UserCheck,
  type LucideIcon,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

const trustItems: ReadonlyArray<{ key: string; icon: LucideIcon }> = [
  { key: "fixedPrice", icon: ShieldCheck },
  { key: "flightTracking", icon: PlaneLanding },
  { key: "meetGreet", icon: UserCheck },
  { key: "support", icon: Headphones },
  { key: "luxuryFleet", icon: Gem },
];

/**
 * Continuous marquee band directly under the hero. The item list is rendered
 * twice so the -50% translation loops without a visible seam.
 */
export async function TrustBar() {
  const t = await getTranslations("home.trustBar");

  return (
    <section className="relative overflow-hidden border-y border-white/8 bg-ink py-5">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_120%_at_50%_50%,rgb(200_164_93/0.12),transparent_70%)]"
      />

      <div className="relative [mask-image:linear-gradient(90deg,transparent,#000_9%,#000_91%,transparent)]">
        <div className="flex w-max animate-marquee">
          {[0, 1].map((copy) => (
            <ul
              key={copy}
              aria-hidden={copy === 1}
              className="flex shrink-0 items-center"
            >
              {trustItems.map(({ key, icon: Icon }) => (
                <li
                  key={key}
                  className="flex items-center gap-2.5 px-7 text-sm font-semibold whitespace-nowrap text-white/75"
                >
                  <Icon className="h-4 w-4 shrink-0 text-gold" aria-hidden />
                  {t(key)}
                  <span
                    aria-hidden
                    className="ms-5 h-1 w-1 rounded-full bg-gold/60"
                  />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
