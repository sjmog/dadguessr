import { useReducer, useCallback } from 'react';
import type { GameState, GameAction, Player, RoundGuess } from '../types';
import { locations } from '../data/locations';
import { shuffle } from '../utils/shuffle';
import { calculateScore } from '../utils/scoring';
import { PLAYER_COLORS, TOTAL_ROUNDS } from '../utils/constants';

const initialState: GameState = {
  phase: 'title',
  players: [],
  currentPlayerIndex: 0,
  currentRound: 1,
  locations: [],
  roundGuesses: [],
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_SETUP': {
      const players: Player[] = Array.from({ length: action.playerCount }, (_, i) => ({
        id: i,
        name: '',
        avatar: '',
        color: PLAYER_COLORS[i],
        totalScore: 0,
        guesses: [],
      }));
      return {
        ...state,
        phase: 'setup',
        players,
      };
    }

    case 'SET_PLAYER_INFO': {
      const players = state.players.map((p) =>
        p.id === action.playerId
          ? { ...p, name: action.name, avatar: action.avatar }
          : p
      );
      return { ...state, players };
    }

    case 'BEGIN_JOURNEY': {
      return {
        ...state,
        phase: 'playing',
        currentRound: 1,
        currentPlayerIndex: 0,
        locations: shuffle(locations).slice(0, TOTAL_ROUNDS),
        roundGuesses: [],
      };
    }

    case 'PLACE_PIN': {
      const currentPlayerId = state.players[state.currentPlayerIndex].id;
      const existingGuessIndex = state.roundGuesses.findIndex(
        (g) => g.playerId === currentPlayerId
      );

      let roundGuesses: RoundGuess[];
      if (existingGuessIndex >= 0) {
        // Update existing guess
        roundGuesses = state.roundGuesses.map((g, i) =>
          i === existingGuessIndex
            ? { ...g, lat: action.lat, lon: action.lon }
            : g
        );
      } else {
        // Add new guess
        roundGuesses = [
          ...state.roundGuesses,
          { playerId: currentPlayerId, lat: action.lat, lon: action.lon, locked: false },
        ];
      }

      return { ...state, roundGuesses };
    }

    case 'LOCK_GUESS': {
      const currentPlayerId = state.players[state.currentPlayerIndex].id;
      const roundGuesses = state.roundGuesses.map((g) =>
        g.playerId === currentPlayerId ? { ...g, locked: true } : g
      );

      const nextPlayerIndex = state.currentPlayerIndex + 1;
      const allPlayersGuessed = nextPlayerIndex >= state.players.length;

      return {
        ...state,
        roundGuesses,
        currentPlayerIndex: allPlayersGuessed ? 0 : nextPlayerIndex,
        phase: allPlayersGuessed ? 'reveal' : 'playing',
      };
    }

    case 'START_REVEAL': {
      // Calculate scores for all guesses
      const currentLocation = state.locations[state.currentRound - 1];
      const players = state.players.map((player) => {
        const guess = state.roundGuesses.find((g) => g.playerId === player.id);
        if (!guess) return player;

        const { score, distanceMiles } = calculateScore(
          guess.lat,
          guess.lon,
          currentLocation.lat,
          currentLocation.lon
        );

        return {
          ...player,
          totalScore: player.totalScore + score,
          guesses: [...player.guesses, { lat: guess.lat, lon: guess.lon, score, distanceMiles }],
        };
      });

      return { ...state, players, phase: 'reveal' };
    }

    case 'NEXT_ROUND': {
      const nextRound = state.currentRound + 1;
      if (nextRound > TOTAL_ROUNDS) {
        return { ...state, phase: 'final' };
      }
      return {
        ...state,
        phase: 'playing',
        currentRound: nextRound,
        currentPlayerIndex: 0,
        roundGuesses: [],
      };
    }

    case 'SHOW_FINAL': {
      return { ...state, phase: 'final' };
    }

    case 'PLAY_AGAIN': {
      return {
        ...initialState,
        phase: 'setup',
        players: state.players.map((p) => ({
          ...p,
          totalScore: 0,
          guesses: [],
        })),
      };
    }

    case 'GO_TO_TITLE': {
      return initialState;
    }

    default:
      return state;
  }
}

export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const actions = {
    startSetup: useCallback((playerCount: number) => {
      dispatch({ type: 'START_SETUP', playerCount });
    }, []),

    setPlayerInfo: useCallback((playerId: number, name: string, avatar: string) => {
      dispatch({ type: 'SET_PLAYER_INFO', playerId, name, avatar });
    }, []),

    beginJourney: useCallback(() => {
      dispatch({ type: 'BEGIN_JOURNEY' });
    }, []),

    placePin: useCallback((lat: number, lon: number) => {
      dispatch({ type: 'PLACE_PIN', lat, lon });
    }, []),

    lockGuess: useCallback(() => {
      dispatch({ type: 'LOCK_GUESS' });
    }, []),

    startReveal: useCallback(() => {
      dispatch({ type: 'START_REVEAL' });
    }, []),

    nextRound: useCallback(() => {
      dispatch({ type: 'NEXT_ROUND' });
    }, []),

    showFinal: useCallback(() => {
      dispatch({ type: 'SHOW_FINAL' });
    }, []),

    playAgain: useCallback(() => {
      dispatch({ type: 'PLAY_AGAIN' });
    }, []),

    goToTitle: useCallback(() => {
      dispatch({ type: 'GO_TO_TITLE' });
    }, []),
  };

  return { state, actions };
}

