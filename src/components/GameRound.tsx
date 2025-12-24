import React, { useState, useEffect } from 'react';
import type { GameState } from '../types';
import type { SoundType } from '../hooks/useSound';
import { GameMap } from './GameMap';
import { PostcardModal } from './PostcardModal';
import { Scoreboard } from './Scoreboard';
import { TOTAL_ROUNDS } from '../utils/constants';
import { calculateScore } from '../utils/scoring';
import './GameRound.css';

interface GameRoundProps {
  state: GameState;
  onPlacePin: (lat: number, lon: number) => void;
  onLockGuess: () => void;
  onStartReveal: () => void;
  onNextRound: () => void;
  playSound: (sound: SoundType) => void;
}

export function GameRound({
  state,
  onPlacePin,
  onLockGuess,
  onStartReveal,
  onNextRound,
  playSound,
}: GameRoundProps) {
  const [showPostcard, setShowPostcard] = useState(true);
  const [showScoreboard, setShowScoreboard] = useState(false);

  const currentLocation = state.locations[state.currentRound - 1];
  const currentPlayer = state.players[state.currentPlayerIndex];
  const isRevealing = state.phase === 'reveal';

  // Find current player's guess
  const currentGuess = state.roundGuesses.find((g) => g.playerId === currentPlayer.id);
  const hasUnlockedGuess = currentGuess && !currentGuess.locked;

  // Trigger reveal phase when all players have guessed
  useEffect(() => {
    const allLocked = state.roundGuesses.length === state.players.length &&
      state.roundGuesses.every((g) => g.locked);
    
    if (allLocked && state.phase === 'playing') {
      // Small delay before reveal
      const timer = setTimeout(() => {
        playSound('reveal');
        onStartReveal();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [state.roundGuesses, state.players.length, state.phase, onStartReveal, playSound]);

  // Show postcard at the start of each round (track round changes)
  const prevRoundRef = React.useRef(state.currentRound);
  useEffect(() => {
    if (state.phase === 'playing' && state.currentRound !== prevRoundRef.current) {
      prevRoundRef.current = state.currentRound;
      // Use setTimeout to avoid synchronous setState in effect
      setTimeout(() => setShowPostcard(true), 0);
    }
  }, [state.currentRound, state.phase]);

  // Calculate scores for reveal
  const revealScores = isRevealing
    ? state.roundGuesses.map((guess) => {
        const player = state.players.find((p) => p.id === guess.playerId)!;
        const { score, distanceMiles } = calculateScore(
          guess.lat,
          guess.lon,
          currentLocation.lat,
          currentLocation.lon
        );
        return { player, score, distanceMiles };
      }).sort((a, b) => b.score - a.score)
    : [];

  const handlePlacePin = (lat: number, lon: number) => {
    playSound('pin-place');
    onPlacePin(lat, lon);
  };

  const handleLockGuess = () => {
    playSound('lock-guess');
    onLockGuess();
  };

  const handleNextRound = () => {
    playSound('round-complete');
    setShowPostcard(true);
    onNextRound();
  };

  return (
    <div className="game-round">
      {/* Header */}
      <header className="round-header">
        <div className="round-info">
          <span className="round-number">Round {state.currentRound}/{TOTAL_ROUNDS}</span>
          <span className="location-hint">Where is Dad?</span>
        </div>

        {!isRevealing && (
          <div className="turn-indicator">
            <span className="turn-avatar">{currentPlayer.avatar}</span>
            <span className="turn-name" style={{ color: currentPlayer.color }}>
              {currentPlayer.name}'s turn
            </span>
          </div>
        )}

        <div className="header-actions">
          <button 
            className="scoreboard-toggle"
            onClick={() => setShowScoreboard(!showScoreboard)}
          >
            📊 Scores
          </button>
          {!isRevealing && (
            <button 
              className="view-postcard-btn"
              onClick={() => setShowPostcard(true)}
            >
              📮 View Postcard
            </button>
          )}
        </div>
      </header>

      {/* Main map area */}
      <div className="map-area">
        <GameMap
          players={state.players}
          roundGuesses={state.roundGuesses}
          currentPlayerId={currentPlayer.id}
          isRevealing={isRevealing}
          actualLocation={isRevealing ? currentLocation : undefined}
          onPlacePin={handlePlacePin}
        />

        {/* Lock in button */}
        {!isRevealing && hasUnlockedGuess && (
          <div className="lock-in-container">
            <button className="lock-in-button" onClick={handleLockGuess}>
              ✓ Lock In Guess
            </button>
          </div>
        )}

        {/* Reveal results overlay */}
        {isRevealing && (
          <div className="reveal-panel">
            <h3 className="reveal-title">
              📍 {currentLocation.name}
            </h3>
            
            <div className="reveal-scores">
              {revealScores.map(({ player, score, distanceMiles }, index) => (
                <div 
                  key={player.id} 
                  className="reveal-score-row"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <span className="reveal-rank">#{index + 1}</span>
                  <span className="reveal-avatar">{player.avatar}</span>
                  <span className="reveal-name">{player.name}</span>
                  <span className="reveal-distance">
                    {Math.round(distanceMiles).toLocaleString()} mi
                  </span>
                  <span className="reveal-points" style={{ color: player.color }}>
                    +{score}
                  </span>
                </div>
              ))}
            </div>

            <button className="next-round-button" onClick={handleNextRound}>
              {state.currentRound < TOTAL_ROUNDS ? 'Next Round →' : 'See Final Results 🏆'}
            </button>
          </div>
        )}
      </div>

      {/* Scoreboard sidebar */}
      {showScoreboard && (
        <Scoreboard 
          players={state.players}
          currentRound={state.currentRound}
          onClose={() => setShowScoreboard(false)}
        />
      )}

      {/* Postcard modal */}
      {showPostcard && !isRevealing && (
        <PostcardModal
          location={currentLocation}
          roundNumber={state.currentRound}
          totalRounds={TOTAL_ROUNDS}
          onDismiss={() => setShowPostcard(false)}
        />
      )}
    </div>
  );
}

