import { LocationCoordinates, Technician, ServiceType } from '../types';

/**
 * Calculates distance between two lat/lng points in kilometers using Haversine formula
 */
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Ranks technicians by distance and availability for a specific emergency service
 */
export function rankNearbyTechnicians(
  clientCoords: { lat: number; lng: number },
  techs: Technician[],
  serviceType: ServiceType
) {
  return techs
    .filter((t) => t.specialties.includes(serviceType) && t.verificationStatus === 'verified')
    .map((tech) => {
      const distance = calculateDistanceKm(
        clientCoords.lat,
        clientCoords.lng,
        tech.currentLocation.lat,
        tech.currentLocation.lng
      );
      const estimatedArrivalMinutes = Math.max(10, Math.round(distance * 3 + 8));
      return {
        tech,
        distanceKm: distance,
        estimatedArrivalMinutes,
        score: (5 - distance) * 0.4 + tech.rating * 0.6
      };
    })
    .sort((a, b) => {
      // Available first, then by distance/rating score
      if (a.tech.status === 'available' && b.tech.status !== 'available') return -1;
      if (a.tech.status !== 'available' && b.tech.status === 'available') return 1;
      return b.score - a.score;
    });
}

// Barcelona Center Default fallback coordinates
export const BARCELONA_CENTER = {
  lat: 41.3879,
  lng: 2.1699,
  address: 'Plaça de Catalunya, Barcelona',
  neighborhood: 'Ciutat Vella / Eixample, Barcelona'
};

// Preset locations for quick selection in the Emergency Form
export const BARCELONA_PRESET_LOCATIONS: LocationCoordinates[] = [
  {
    lat: 41.3925,
    lng: 2.1642,
    address: 'Carrer de Valencia 312',
    neighborhood: 'Eixample Dreta, Barcelona'
  },
  {
    lat: 41.4051,
    lng: 2.158,
    address: 'Carrer de Verdi 84',
    neighborhood: 'Gràcia, Barcelona'
  },
  {
    lat: 41.3785,
    lng: 2.1902,
    address: 'Carrer de Ramon Turró 140',
    neighborhood: 'Poblenou, Barcelona'
  },
  {
    lat: 41.3721,
    lng: 2.1388,
    address: 'Carrer de Sants 95',
    neighborhood: 'Sants-Montjuïc, Barcelona'
  },
  {
    lat: 41.3688,
    lng: 2.1189,
    address: 'Avinguda Isabel la Catòlica 22',
    neighborhood: 'L\'Hospitalet de Llobregat'
  },
  {
    lat: 41.4489,
    lng: 2.2472,
    address: 'Avinguda Martí Pujol 112',
    neighborhood: 'Badalona'
  },
  {
    lat: 41.4923,
    lng: 2.1086,
    address: 'Rambla del Celler 30',
    neighborhood: 'Sant Cugat del Vallès'
  },
  {
    lat: 41.5463,
    lng: 2.1086,
    address: 'Rambla de Sabadell 104',
    neighborhood: 'Sabadell'
  }
];
