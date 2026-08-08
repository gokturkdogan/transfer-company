import { Check } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Container } from "@/components/layout/Container";

const trustKeys = [
  "fixedPrice",
  "flightTracking",
  "meetGreet",
  "support",
  "luxuryFleet",
] as const;

export async function TrustBar() {
  const t = await getTranslations("home.trustBar");

  return (
    <section className="border-y border-border bg-card py-6">
      <Container>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {trustKeys.map((key) => (
            <li
              key={key}
              className="flex items-center gap-3 text-sm font-medium text-foreground"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                <Check className="h-4 w-4" />
              </span>
              {t(key)}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
