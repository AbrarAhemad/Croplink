/**
 * Distance Calculation Abstraction using Haversine formula and approximate routing.
 * Ensures farmer exact private coordinates are never leaked to public industry view.
 */

export interface Coordinates {
  lat: number;
  lng: number;
}

// Known regional hubs and districts in India for fallback calculation
const REGIONAL_COORDINATES: Record<string, Coordinates> = {
  'Sangli': { lat: 16.8524, lng: 74.5815 },
  'Nashik': { lat: 19.9975, lng: 73.7898 },
  'Pune': { lat: 18.5204, lng: 73.8567 },
  'Solapur': { lat: 17.6599, lng: 75.9064 },
  'Kolhapur': { lat: 16.7050, lng: 74.2433 },
  'Mumbai': { lat: 19.0760, lng: 72.8777 },
  'Latur': { lat: 18.4088, lng: 76.5604 },
  'Nagpur': { lat: 21.1458, lng: 79.0882 },
  'Ahmedabad': { lat: 23.0225, lng: 72.5714 },
  'Hyderabad': { lat: 17.3850, lng: 78.4867 },
  'Bangalore': { lat: 12.9716, lng: 77.5946 },
};

export function calculateDistanceKm(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371; // Earth radius in km
  const dLat = (coord2.lat - coord1.lat) * (Math.PI / 180);
  const dLng = (coord2.lng - coord1.lng) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coord1.lat * (Math.PI / 180)) *
      Math.cos(coord2.lat * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightDistance = R * c;

  // Road factor multiplier ~ 1.25 for highway network curvature
  return Math.round(straightDistance * 1.25);
}

export function getApproximateDistanceBetweenLocations(farmLocationArea: string, industryCity: string): number {
  const farmDistrict = Object.keys(REGIONAL_COORDINATES).find(key => 
    farmLocationArea.toLowerCase().includes(key.toLowerCase())
  ) || 'Sangli';

  const buyerCity = Object.keys(REGIONAL_COORDINATES).find(key => 
    industryCity.toLowerCase().includes(key.toLowerCase())
  ) || 'Mumbai';

  const c1 = REGIONAL_COORDINATES[farmDistrict];
  const c2 = REGIONAL_COORDINATES[buyerCity];

  return calculateDistanceKm(c1, c2);
}
