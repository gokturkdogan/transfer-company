"use client";

import { useEffect, useRef } from "react";

import { useBookingFlow } from "@/features/booking/context/booking-flow-context";
import {
  buildDevReviewSnapshot,
  createDevReviewSnapshotFromState,
  isDevReviewMockEnabled,
  readDevReviewSnapshot,
  shouldActivateDevReviewMock,
  writeDevReviewSnapshot,
} from "@/features/booking/lib/dev-review-mock";

/**
 * Development-only hydration for the review step.
 * Use `/booking?mock=review` once, then refresh keeps the snapshot in sessionStorage.
 */
export function BookingDevReviewHydration() {
  const { state, dispatch, airports, cities, districts } = useBookingFlow();
  const hydrated = useRef(false);

  useEffect(() => {
    if (!isDevReviewMockEnabled() || hydrated.current) {
      return;
    }

    if (!shouldActivateDevReviewMock()) {
      return;
    }

    hydrated.current = true;

    const storedSnapshot = readDevReviewSnapshot();
    const snapshot =
      storedSnapshot ??
      buildDevReviewSnapshot({ airports, cities, districts });

    writeDevReviewSnapshot(snapshot);

    dispatch({
      type: "RESTORE_SEARCH_DRAFT",
      snapshot,
    });
  }, [airports, cities, dispatch, districts]);

  useEffect(() => {
    if (!isDevReviewMockEnabled()) {
      return;
    }

    const snapshot = createDevReviewSnapshotFromState(state);

    if (snapshot) {
      writeDevReviewSnapshot(snapshot);
    }
  }, [state]);

  return null;
}
