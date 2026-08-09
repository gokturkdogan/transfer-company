"use client";

import { BookingMobileSearchSummary } from "@/features/booking/components/BookingMobileSearchSummary";
import { HeroSearchBar } from "@/features/booking/components/hero-search/HeroSearchBar";
import { useBookingFlow } from "@/features/booking/context/booking-flow-context";
import { buildBookingSearchParams } from "@/features/booking/lib/booking-search-params";
import { useRouter } from "@/i18n/navigation";

export function BookingInlineSearchBar() {
  const router = useRouter();
  const { state, requestQuote } = useBookingFlow();
  const useMobileSummary =
    state.step === "vehicle" ||
    state.step === "customer" ||
    state.step === "review";

  const handleSubmit = () => {
    const params = buildBookingSearchParams(state.search);
    router.replace(`/booking?${params.toString()}`, { scroll: false });
    void requestQuote(undefined, {
      preserveStep:
        state.step === "vehicle" ||
        state.step === "customer" ||
        state.step === "review",
    });
  };

  return (
    <>
      <div className="lg:hidden">
        {useMobileSummary ? (
          <BookingMobileSearchSummary onSubmit={handleSubmit} />
        ) : (
          <HeroSearchBar onSubmit={handleSubmit} />
        )}
      </div>

      <div className="hidden lg:block">
        <HeroSearchBar onSubmit={handleSubmit} />
      </div>
    </>
  );
}
