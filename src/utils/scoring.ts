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

// Scoring constants
const MAX_BASE_SCORE = 1000;
const MAX_RADIUS_MILES = 3000;

// Bonus thresholds
const BONUS_1000_MILES = 100;  // +100 for within 1000 miles
const BONUS_500_MILES = 200;   // +200 additional for within 500 miles
const BONUS_100_MILES = 200;   // +200 additional for within 100 miles

export interface ScoreResult {
  score: number;           // Total score including bonuses
  baseScore: number;       // Linear score (0-1000)
  distanceMiles: number;
  bonuses: {
    within1000: number;    // +100 if within 1000 miles
    within500: number;     // +200 if within 500 miles  
    within100: number;     // +200 if within 100 miles
    total: number;         // Sum of all bonuses
  };
}

/**
 * Calculate the score for a guess.
 * 
 * Base score: Linear scale from 1000 (0 miles) to 0 (3000+ miles)
 * 
 * Bonuses (cumulative):
 * - Within 1000 miles: +100
 * - Within 500 miles: +200 additional (300 total bonus)
 * - Within 100 miles: +200 additional (500 total bonus)
 */
export function calculateScore(
  guessLat: number,
  guessLon: number,
  actualLat: number,
  actualLon: number
): ScoreResult {
  const distanceMiles = haversineDistanceMiles(guessLat, guessLon, actualLat, actualLon);
  
  // Base score: linear from 1000 at 0 miles to 0 at 3000 miles
  const baseScore = Math.max(0, Math.round(MAX_BASE_SCORE * (1 - distanceMiles / MAX_RADIUS_MILES)));
  
  // Calculate bonuses
  const within1000 = distanceMiles <= 1000 ? BONUS_1000_MILES : 0;
  const within500 = distanceMiles <= 500 ? BONUS_500_MILES : 0;
  const within100 = distanceMiles <= 100 ? BONUS_100_MILES : 0;
  const totalBonus = within1000 + within500 + within100;
  
  return {
    score: baseScore + totalBonus,
    baseScore,
    distanceMiles,
    bonuses: {
      within1000,
      within500,
      within100,
      total: totalBonus,
    },
  };
}
