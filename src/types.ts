// Core game types

export interface Coordinates {
  lat: number;
  lon: number;
}

export interface Location {
  id: number;
  name: string;
  lat: number;
  lon: number;
  image: string;
}

export interface Guess extends Coordinates {
  score: number;
  distanceMiles: number;
}

export interface Player {
  id: number;
  name: string;
  avatar: string;      // emoji character
  color: string;       // hex color for map markers
  totalScore: number;
  guesses: Guess[];    // one per completed round
}

export type GamePhase = 'title' | 'setup' | 'playing' | 'reveal' | 'final';

export interface RoundGuess extends Coordinates {
  playerId: number;
  locked: boolean;
}

export interface GameState {
  phase: GamePhase;
  players: Player[];
  currentPlayerIndex: number;
  currentRound: number;           // 1-12
  locations: Location[];          // shuffled at game start
  roundGuesses: RoundGuess[];     // current round only, reset each round
}

// Action types for reducer
export type GameAction =
  | { type: 'START_SETUP'; playerCount: number }
  | { type: 'SET_PLAYER_INFO'; playerId: number; name: string; avatar: string }
  | { type: 'BEGIN_JOURNEY' }
  | { type: 'PLACE_PIN'; lat: number; lon: number }
  | { type: 'LOCK_GUESS' }
  | { type: 'START_REVEAL' }
  | { type: 'NEXT_ROUND' }
  | { type: 'SHOW_FINAL' }
  | { type: 'PLAY_AGAIN' }
  | { type: 'GO_TO_TITLE' };

