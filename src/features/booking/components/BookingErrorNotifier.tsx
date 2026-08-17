"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";

import { useAppToast } from "@/components/shared/app-toast";
import { useBookingFlow } from "@/features/booking/context/booking-flow-context";

export function BookingErrorNotifier() {
  const t = useTranslations("booking");
  const { state, dispatch } = useBookingFlow();
  const toast = useAppToast();

  useEffect(() => {
    if (!state.errorKey) {
      return;
    }

    toast.show({
      variant: "error",
      title: t("errors.toastTitle"),
      description: t(state.errorKey),
    });

    dispatch({ type: "CLEAR_ERROR" });
  }, [dispatch, state.errorKey, t, toast]);

  return null;
}
