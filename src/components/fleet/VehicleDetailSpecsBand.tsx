import type { ReactNode } from "react";
import { Briefcase, Check, Luggage, Users } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import type { FleetVehicleDetailDto } from "@/features/marketing/types";

const INCLUDED_KEYS = ["0", "1", "2", "3"] as const;

type VehicleDetailSpecsBandProps = {
  vehicle: FleetVehicleDetailDto;
};

export async function VehicleDetailSpecsBand({
  vehicle,
}: VehicleDetailSpecsBandProps) {
  const t = await getTranslations("fleet.vehicleDetail");

  return (
    <Section variant="ink">
      <Container>
        <SectionHeading
          dark
          eyebrow={t("specsTitle")}
          title={t("specsBandTitle", { name: vehicle.name })}
          subtitle={t("specsBandSubtitle")}
        />

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-8">
          <div className="grid gap-4 sm:grid-cols-3">
            <SpecTile
              delay={0}
              icon={<Users className="h-5 w-5" aria-hidden />}
              value={String(vehicle.passengerCapacity)}
              label={t("specPassengers")}
            />
            <SpecTile
              delay={70}
              icon={<Luggage className="h-5 w-5" aria-hidden />}
              value={String(vehicle.largeLuggageCapacity)}
              label={t("specLargeLuggage")}
            />
            <SpecTile
              delay={140}
              icon={<Briefcase className="h-5 w-5" aria-hidden />}
              value={String(vehicle.cabinLuggageCapacity)}
              label={t("specCabinLuggage")}
            />
          </div>

          <Reveal delay={120}>
            <div className="h-full rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-6 backdrop-blur-md">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gold">
                {t("includedTitle")}
              </p>
              <ul className="mt-4 grid gap-3">
                {INCLUDED_KEYS.map((key) => (
                  <li
                    key={key}
                    className="flex items-center gap-3 text-sm text-white/80"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold/14 text-gold-light">
                      <Check className="h-3.5 w-3.5" aria-hidden />
                    </span>
                    {t(`includedItems.${key}`)}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}

function SpecTile({
  icon,
  value,
  label,
  delay,
}: {
  icon: ReactNode;
  value: string;
  label: string;
  delay: number;
}) {
  return (
    <Reveal delay={delay} className="h-full">
      <div className="group relative h-full overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-6 backdrop-blur-md transition-all duration-500 hover:-translate-y-1.5 hover:border-gold/40 hover:bg-white/[0.07]">
        <span
          aria-hidden
          className="pointer-events-none absolute -top-14 -end-14 h-36 w-36 rounded-full bg-gold/16 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />
        <div className="relative">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-gold/12 text-gold transition-all duration-500 group-hover:bg-gold-gradient group-hover:text-ink">
            {icon}
          </div>
          <p className="text-3xl font-bold tracking-tight text-white">{value}</p>
          <p className="mt-1 text-sm text-white/60">{label}</p>
        </div>
      </div>
    </Reveal>
  );
}
