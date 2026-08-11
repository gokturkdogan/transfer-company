export type ReservationEmailLineItem = {
  type: "TRANSFER_VEHICLE" | "EXTRA_SERVICE";
  name: string;
  quantity: number;
  totalPriceMinor: number;
  imageUrl?: string;
  passengerCapacity?: number;
  largeLuggageCapacity?: number;
  cabinLuggageCapacity?: number;
};

export type ReservationNotificationPayload = {
  reservationId: string;
  reference: string;
  locale: string;
  tripType: "ONE_WAY" | "ROUND_TRIP";
  outboundAt: Date;
  returnAt?: Date | null;
  snapshotRouteLabel: string;
  snapshotDropoffLabel?: string;
  passengerCount: number;
  infantCount: number;
  largeLuggageCount: number;
  cabinLuggageCount: number;
  outboundFlightNumber?: string;
  returnFlightNumber?: string;
  items: ReservationEmailLineItem[];
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    whatsappPhone?: string;
  };
  subtotalMinor: number;
  totalMinor: number;
  currency: string;
  notes?: string;
};

export type NotificationService = {
  sendReservationReceived(
    payload: ReservationNotificationPayload,
  ): Promise<void>;
  sendNewReservationToAdmin(
    payload: ReservationNotificationPayload,
  ): Promise<void>;
};
