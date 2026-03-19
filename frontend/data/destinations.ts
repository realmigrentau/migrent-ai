// Sydney & Melbourne destinations for True Cost Calculator
// Includes universities, CBDs, and major work hubs

export interface Destination {
  name: string;
  shortName: string;
  lat: number;
  lng: number;
  city: "Sydney" | "Melbourne";
  type: "university" | "cbd" | "hub";
}

export const DESTINATIONS: Destination[] = [
  // Sydney Universities
  { name: "University of Technology Sydney", shortName: "UTS", lat: -33.8833, lng: 151.2004, city: "Sydney", type: "university" },
  { name: "University of Sydney", shortName: "USYD", lat: -33.8886, lng: 151.1873, city: "Sydney", type: "university" },
  { name: "UNSW Sydney", shortName: "UNSW", lat: -33.9173, lng: 151.2313, city: "Sydney", type: "university" },
  { name: "Macquarie University", shortName: "MQ", lat: -33.7738, lng: 151.1126, city: "Sydney", type: "university" },
  { name: "Western Sydney University (Parramatta)", shortName: "WSU Parra", lat: -33.8131, lng: 151.0054, city: "Sydney", type: "university" },
  { name: "Western Sydney University (Penrith)", shortName: "WSU Penrith", lat: -33.7563, lng: 150.6746, city: "Sydney", type: "university" },
  { name: "University of Wollongong", shortName: "UOW", lat: -34.4054, lng: 150.8784, city: "Sydney", type: "university" },
  { name: "Australian Catholic University (North Sydney)", shortName: "ACU", lat: -33.8389, lng: 151.2070, city: "Sydney", type: "university" },
  { name: "University of Notre Dame (Broadway)", shortName: "UNDA", lat: -33.8842, lng: 151.1957, city: "Sydney", type: "university" },
  { name: "Torrens University (Ultimo)", shortName: "Torrens", lat: -33.8795, lng: 151.1997, city: "Sydney", type: "university" },

  // Sydney CBDs & Work Hubs
  { name: "Sydney CBD (Town Hall)", shortName: "Sydney CBD", lat: -33.8731, lng: 151.2065, city: "Sydney", type: "cbd" },
  { name: "Parramatta CBD", shortName: "Parra CBD", lat: -33.8151, lng: 151.0011, city: "Sydney", type: "cbd" },
  { name: "North Sydney", shortName: "Nth Sydney", lat: -33.8396, lng: 151.2073, city: "Sydney", type: "cbd" },
  { name: "Chatswood", shortName: "Chatswood", lat: -33.7969, lng: 151.1831, city: "Sydney", type: "hub" },
  { name: "Macquarie Park", shortName: "Mac Park", lat: -33.7766, lng: 151.1237, city: "Sydney", type: "hub" },

  // Melbourne Universities
  { name: "University of Melbourne", shortName: "UniMelb", lat: -37.7963, lng: 144.9614, city: "Melbourne", type: "university" },
  { name: "RMIT University", shortName: "RMIT", lat: -37.8087, lng: 144.9632, city: "Melbourne", type: "university" },
  { name: "Monash University (Clayton)", shortName: "Monash", lat: -37.9105, lng: 145.1362, city: "Melbourne", type: "university" },
  { name: "Deakin University (Burwood)", shortName: "Deakin", lat: -37.8482, lng: 145.1153, city: "Melbourne", type: "university" },

  // Melbourne CBDs
  { name: "Melbourne CBD (Flinders St)", shortName: "Melb CBD", lat: -37.8183, lng: 144.9671, city: "Melbourne", type: "cbd" },
];

// Transport cost rates (weekly, AUD)
export const TRANSPORT_RATES = {
  walk: { label: "Walk / Cycle", cost: 0, icon: "walk" },
  bus: { label: "Bus", cost: 25, icon: "bus" },
  train_0_10: { label: "Train (0-10km)", cost: 35, icon: "train" },
  train_10_20: { label: "Train (10-20km)", cost: 45, icon: "train" },
  train_20_plus: { label: "Train (20km+)", cost: 55, icon: "train" },
} as const;

// Default bills estimate range
export const BILLS_RANGE = { min: 30, max: 70, default: 50 };

// Haversine distance calculation (km)
export function getDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Get transport mode and cost based on distance
export function getTransportCost(distanceKm: number): {
  mode: string;
  weeklyCost: number;
  label: string;
} {
  if (distanceKm <= 2) {
    return { mode: "walk", weeklyCost: 0, label: "Walkable" };
  } else if (distanceKm <= 5) {
    return { mode: "bus", weeklyCost: 25, label: "Bus ~$25/wk" };
  } else if (distanceKm <= 10) {
    return { mode: "train_0_10", weeklyCost: 35, label: "Train ~$35/wk" };
  } else if (distanceKm <= 20) {
    return { mode: "train_10_20", weeklyCost: 45, label: "Train ~$45/wk" };
  } else {
    return { mode: "train_20_plus", weeklyCost: 55, label: "Train ~$55/wk" };
  }
}

// Calculate true weekly cost
export function calculateTrueCost(params: {
  weeklyRent: number;
  billsIncluded: boolean;
  billsEstimate: number;
  listingLat?: number;
  listingLng?: number;
  destinationLat?: number;
  destinationLng?: number;
  transportOverride?: number;
}): {
  trueCost: number;
  rent: number;
  bills: number;
  transport: number;
  distanceKm: number | null;
} {
  const rent = params.weeklyRent;
  const bills = params.billsIncluded ? 0 : params.billsEstimate;

  let transport = 0;
  let distanceKm: number | null = null;

  if (
    params.listingLat &&
    params.listingLng &&
    params.destinationLat &&
    params.destinationLng
  ) {
    distanceKm = getDistanceKm(
      params.listingLat,
      params.listingLng,
      params.destinationLat,
      params.destinationLng
    );
    transport =
      params.transportOverride !== undefined
        ? params.transportOverride
        : getTransportCost(distanceKm).weeklyCost;
  }

  return {
    trueCost: rent + bills + transport,
    rent,
    bills,
    transport,
    distanceKm,
  };
}
