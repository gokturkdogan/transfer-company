export type DistrictStartingPriceDto = {
  id: string;
  name: string;
  code: string;
  imageKey: string;
  startingFromMinor: number;
  currency: string;
};

export type FleetVehicleDto = {
  id: string;
  name: string;
  code: string;
  passengerCapacity: number;
  largeLuggageCapacity: number;
  cabinLuggageCapacity: number;
  imageKey: string | null;
  startingFromMinor: number;
  currency: string;
};

export type FleetVehicleDetailDto = FleetVehicleDto & {
  brand: string;
  model: string;
  shortDescription: string | null;
  description: string | null;
  features: string[];
  galleryImageKeys: string[];
};

export type StaticDestinationDto = {
  code: string;
  name: string;
  startingFromMinor?: number;
  currency?: string;
};
