export type AnalyticsEvent =
  | { name: "booking_search"; payload?: Record<string, string | number> }
  | { name: "vehicle_selected"; payload?: { vehicleCategoryId: string } }
  | { name: "extra_selected"; payload?: { extraServiceId: string; quantity: number } }
  | { name: "booking_review"; payload?: Record<string, never> }
  | { name: "booking_submitted"; payload?: Record<string, never> }
  | { name: "booking_success"; payload?: { reference: string } };

type AnalyticsSink = (event: AnalyticsEvent) => void;

let sink: AnalyticsSink = () => undefined;

export function setAnalyticsSink(nextSink: AnalyticsSink): void {
  sink = nextSink;
}

export function track(event: AnalyticsEvent): void {
  try {
    sink(event);
  } catch {
    // Analytics must never block user interaction
  }
}
