import { MAX_SCORE_PER_ROUND } from './constants';

/**
 * Calculate the great-circle distance between two points using the Haversine formula.
 * @returns Distance in miles
 */
export function haversineDistanceMiles(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3958.8; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate the score for a guess.
 * Score = max(0, 1000 - ceil(distance_in_miles))
 */
export function calculateScore(
  guessLat: number,
  guessLon: number,
  actualLat: number,
  actualLon: number
): { score: number; distanceMiles: number } {
  const distanceMiles = haversineDistanceMiles(guessLat, guessLon, actualLat, actualLon);
  const roundedDistance = Math.ceil(distanceMiles);
  const score = Math.max(0, MAX_SCORE_PER_ROUND - roundedDistance);
  return { score, distanceMiles };
}

