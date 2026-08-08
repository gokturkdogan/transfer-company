export type BookingRequestStatus = "draft" | "submitted";

export type BookingDraft = {
  status: BookingRequestStatus;
};
