"use client";

import { HeroSearchBar } from "@/features/booking/components/hero-search/HeroSearchBar";
import { useBookingFlow } from "@/features/booking/context/booking-flow-context";
import { buildBookingSearchParams } from "@/features/booking/lib/booking-search-params";
import { useRouter } from "@/i18n/navigation";

export function BookingInlineSearchBar() {
  const router = useRouter();
  const { state, requestQuote } = useBookingFlow();

  const handleSubmit = () => {
    const params = buildBookingSearchParams(state.search);
    router.replace(`/booking?${params.toString()}`, { scroll: false });
    void requestQuote();
  };

  return <HeroSearchBar onSubmit={handleSubmit} />;
}
