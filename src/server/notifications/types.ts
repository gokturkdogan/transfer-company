export type ReservationNotificationPayload = {
  reservationId: string;
  reference: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    whatsappPhone?: string;
  };
  totalMinor: number;
  currency: string;
};

export type NotificationService = {
  sendReservationReceived(
    payload: ReservationNotificationPayload,
  ): Promise<void>;
  sendNewReservationToAdmin(
    payload: ReservationNotificationPayload,
  ): Promise<void>;
};
