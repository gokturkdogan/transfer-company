export type PassengerKind = "adult" | "child" | "infant";

export type PassengerDetails = {
  kind: PassengerKind;
  index: number;
  fullName: string;
  idDocument: string;
};

export function passengerSlotKey(passenger: Pick<PassengerDetails, "kind" | "index">) {
  return `${passenger.kind}-${passenger.index}`;
}

export function buildPassengerSlots(
  adultCount: number,
  childCount: number,
  infantCount = 0,
): PassengerDetails[] {
  const passengers: PassengerDetails[] = [];

  for (let index = 1; index <= adultCount; index += 1) {
    passengers.push({
      kind: "adult",
      index,
      fullName: "",
      idDocument: "",
    });
  }

  for (let index = 1; index <= childCount; index += 1) {
    passengers.push({
      kind: "child",
      index,
      fullName: "",
      idDocument: "",
    });
  }

  for (let index = 1; index <= infantCount; index += 1) {
    passengers.push({
      kind: "infant",
      index,
      fullName: "",
      idDocument: "",
    });
  }

  return passengers;
}

export function syncPassengersWithSearch(
  current: PassengerDetails[],
  adultCount: number,
  childCount: number,
  infantCount = 0,
): PassengerDetails[] {
  const nextSlots = buildPassengerSlots(adultCount, childCount, infantCount);
  const currentByKey = new Map(
    current.map((passenger) => [passengerSlotKey(passenger), passenger]),
  );

  return nextSlots.map((slot) => {
    const existing = currentByKey.get(passengerSlotKey(slot));

    if (!existing) {
      return slot;
    }

    return {
      ...slot,
      fullName: existing.fullName,
      idDocument: existing.idDocument,
    };
  });
}

export function arePassengerDetailsValid(passengers: PassengerDetails[]): boolean {
  return (
    passengers.length > 0 &&
    passengers.every((passenger) => passenger.fullName.trim().length > 0)
  );
}

export type ReservationPassengerSnapshot = {
  kind: PassengerKind;
  index: number;
  fullName: string;
  idDocument?: string;
};

export function toReservationPassengerSnapshots(
  passengers: PassengerDetails[],
): ReservationPassengerSnapshot[] {
  return passengers
    .filter((passenger) => passenger.fullName.trim().length > 0)
    .map((passenger) => {
      const idDocument = passenger.idDocument.trim();

      return {
        kind: passenger.kind,
        index: passenger.index,
        fullName: passenger.fullName.trim(),
        ...(idDocument ? { idDocument } : {}),
      };
    });
}

export function formatPassengerDisplayLine(
  passenger: Pick<ReservationPassengerSnapshot, "fullName" | "idDocument">,
  kindLabel: string,
): string {
  const idDocument = passenger.idDocument?.trim();

  return idDocument
    ? `${kindLabel}: ${passenger.fullName} (${idDocument})`
    : `${kindLabel}: ${passenger.fullName}`;
}

export function resolvePassengerKindLabel(
  passenger: Pick<PassengerDetails, "kind" | "index">,
  labels: {
    adult: (index: number) => string;
    child: (index: number) => string;
    infant: (index: number) => string;
  },
): string {
  switch (passenger.kind) {
    case "adult":
      return labels.adult(passenger.index);
    case "child":
      return labels.child(passenger.index);
    case "infant":
      return labels.infant(passenger.index);
    default:
      return labels.adult(passenger.index);
  }
}
