import React, { useState, useEffect } from 'react';
import type { GameState } from '../types';
import type { SoundType } from '../hooks/useSound';
import { GameMap } from './GameMap';
import { PostcardModal } from './PostcardModal';
import { Scoreboard } from './Scoreboard';
import { TOTAL_ROUNDS } from '../utils/constants';
import { calculateScore, type ScoreResult } from '../utils/scoring';
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
  const [hoveredPlayerId, setHoveredPlayerId] = useState<number | null>(null);

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
  const revealScores: Array<{ player: typeof state.players[0]; scoreResult: ScoreResult }> = isRevealing
    ? state.roundGuesses.map((guess) => {
        const player = state.players.find((p) => p.id === guess.playerId)!;
        const scoreResult = calculateScore(
          guess.lat,
          guess.lon,
          currentLocation.lat,
          currentLocation.lon
        );
        return { player, scoreResult };
      }).sort((a, b) => b.scoreResult.score - a.scoreResult.score)
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
      {/* Floating controls - top right */}
      <div className="floating-controls">
        <span className="round-badge-floating">Round {state.currentRound}/{TOTAL_ROUNDS}</span>
        <button 
          className="floating-btn"
          onClick={() => setShowScoreboard(!showScoreboard)}
        >
          📊 Scores
        </button>
        {!isRevealing && (
          <button 
            className="floating-btn"
            onClick={() => setShowPostcard(true)}
          >
            ✉️ Postcard
          </button>
        )}
      </div>

      {/* Full-screen map area */}
      <div className="map-area">
        <GameMap
          players={state.players}
          roundGuesses={state.roundGuesses}
          currentPlayerId={currentPlayer.id}
          isRevealing={isRevealing}
          actualLocation={isRevealing ? currentLocation : undefined}
          onPlacePin={handlePlacePin}
          hoveredPlayerId={hoveredPlayerId}
          onPlayerHover={setHoveredPlayerId}
        />

        {/* Hint to place pin with turn indicator */}
        {!isRevealing && !currentGuess && (
          <div className="bottom-hint-container">
            <div className="turn-indicator" style={{ backgroundColor: currentPlayer.color }}>
              <span className="turn-avatar">{currentPlayer.avatar}</span>
              <span className="turn-name">
                {currentPlayer.name}'s turn
              </span>
            </div>
            <div className="pin-hint-chip">
              👆 Click on the map to place a pin
            </div>
          </div>
        )}

        {/* Lock in button with player styling */}
        {!isRevealing && hasUnlockedGuess && (
          <div className="lock-in-container">
            <button 
              className="lock-in-button" 
              onClick={handleLockGuess}
              style={{ backgroundColor: currentPlayer.color }}
            >
              <span className="lock-in-avatar">{currentPlayer.avatar}</span>
              <span>✓ Lock In Guess</span>
            </button>
          </div>
        )}

        {/* Reveal results overlay */}
        {isRevealing && (
          <div className="reveal-container">
            {/* Location title at top */}
            <div className="reveal-location-banner">
              <div className="reveal-location-chip">
                <span className="reveal-location-icon">📍</span>
                <span className="reveal-location-name">{currentLocation.name}</span>
              </div>
            </div>

            {/* Score chips at bottom */}
            <div className="reveal-bottom-bar">
              <div className="reveal-chips">
                {revealScores.map(({ player, scoreResult }, index) => (
                  <div 
                    key={player.id} 
                    className={`reveal-chip ${hoveredPlayerId === player.id ? 'highlighted' : ''}`}
                    style={{ 
                      animationDelay: `${index * 0.1}s`,
                      borderColor: player.color,
                    }}
                    onMouseEnter={() => setHoveredPlayerId(player.id)}
                    onMouseLeave={() => setHoveredPlayerId(null)}
                  >
                    <div className="chip-main">
                      <span className="chip-rank">#{index + 1}</span>
                      <span className="chip-avatar">{player.avatar}</span>
                      <span className="chip-name">{player.name}</span>
                      <span className="chip-score" style={{ color: player.color }}>
                        +{scoreResult.score}
                      </span>
                    </div>
                    <div className="chip-details">
                      <span className="chip-distance">
                        {Math.round(scoreResult.distanceMiles).toLocaleString()} mi
                      </span>
                      <span className="chip-calc">
                        {scoreResult.baseScore}
                        {scoreResult.bonuses.within1000 > 0 && <span className="mini-bonus green">+{scoreResult.bonuses.within1000}</span>}
                        {scoreResult.bonuses.within500 > 0 && <span className="mini-bonus orange">+{scoreResult.bonuses.within500}</span>}
                        {scoreResult.bonuses.within100 > 0 && <span className="mini-bonus pink">+{scoreResult.bonuses.within100}</span>}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <button className="next-round-button" onClick={handleNextRound}>
                {state.currentRound < TOTAL_ROUNDS ? 'Next Round →' : 'See Final Results 🏆'}
              </button>
            </div>
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

