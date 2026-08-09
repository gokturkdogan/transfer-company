import { Clock, Gem, ShieldCheck, Sparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { FeatureCard } from "@/components/marketing/marketing-cards";
import { Reveal } from "@/components/motion/Reveal";
import type { FleetVehicleDetailDto } from "@/features/marketing/types";

const PARAGRAPH_KEYS = ["0", "1"] as const;
const PROMISE_KEYS = ["0", "1", "2", "3"] as const;
const PROMISE_ICONS = [ShieldCheck, Clock, Sparkles, Gem] as const;

type VehicleDetailPremiumBandProps = {
  vehicle: FleetVehicleDetailDto;
};

export async function VehicleDetailPremiumBand({
  vehicle,
}: VehicleDetailPremiumBandProps) {
  const t = await getTranslations("fleet.vehicleDetail");

  return (
    <Section variant="muted">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start lg:gap-14">
          <Reveal className="space-y-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gold">
              {t("idealForTitle")}
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {t("idealForHeading", { name: vehicle.name })}
            </h2>
            <div className="space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {PARAGRAPH_KEYS.map((key) => (
                <p key={key}>
                  {t(`idealForParagraphs.${key}`, {
                    name: vehicle.name,
                    code: vehicle.code,
                  })}
                </p>
              ))}
            </div>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2">
            {PROMISE_KEYS.map((key, index) => {
              const Icon = PROMISE_ICONS[index]!;

              return (
                <Reveal key={key} delay={index * 70} className="h-full">
                  <FeatureCard
                    icon={<Icon className="h-6 w-6" />}
                    title={t(`promises.${key}.title`)}
                    description={t(`promises.${key}.description`)}
                  />
                </Reveal>
              );
            })}
          </div>
        </div>
      </Container>
    </Section>
  );
}
