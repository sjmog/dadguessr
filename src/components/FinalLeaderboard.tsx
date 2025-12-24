import { useEffect, useState, useMemo } from 'react';
import type { Player } from '../types';
import type { SoundType } from '../hooks/useSound';
import './FinalLeaderboard.css';

interface FinalLeaderboardProps {
  players: Player[];
  onPlayAgain: () => void;
  playSound: (sound: SoundType) => void;
}

// Pre-generate confetti styles
const CONFETTI_COLORS = ['#C41E3A', '#165B33', '#D4AF37', '#FF6B6B', '#1E90FF'];

function generateConfettiStyles(count: number) {
  return Array.from({ length: count }, () => ({
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 2}s`,
    backgroundColor: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
  }));
}

export function FinalLeaderboard({ players, onPlayAgain, playSound }: FinalLeaderboardProps) {
  const [showConfetti, setShowConfetti] = useState(true);
  const confettiStyles = useMemo(() => generateConfettiStyles(50), []);

  // Play victory sound on mount
  useEffect(() => {
    playSound('victory');
  }, [playSound]);

  // Sort players by score and handle ties
  const sortedPlayers = [...players].sort((a, b) => b.totalScore - a.totalScore);
  
  // Assign ranks with tie handling
  const rankedPlayers = sortedPlayers.map((player, index) => {
    let rank = 1;
    for (let i = 0; i < index; i++) {
      if (sortedPlayers[i].totalScore > player.totalScore) {
        rank = i + 2;
      }
    }
    // If same score as previous player, use same rank
    if (index > 0 && sortedPlayers[index - 1].totalScore === player.totalScore) {
      rank = rankedPlayers[index - 1].rank;
    }
    return { ...player, rank };
  });

  const winners = rankedPlayers.filter((p) => p.rank === 1);
  const others = rankedPlayers.filter((p) => p.rank !== 1);

  useEffect(() => {
    // Hide confetti after animation
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="final-leaderboard">
      {/* Confetti */}
      {showConfetti && (
        <div className="confetti-container" aria-hidden="true">
          {confettiStyles.map((style, i) => (
            <div key={i} className="confetti" style={style} />
          ))}
        </div>
      )}

      <div className="final-content">
        <h1 className="final-title">🏆 Journey Complete! 🏆</h1>

        {/* Winner section */}
        <div className="winners-section">
          {winners.length === 1 ? (
            <div className="winner-card">
              <div className="winner-crown">👑</div>
              <div className="winner-avatar">{winners[0].avatar}</div>
              <div className="winner-name">{winners[0].name}</div>
              <div className="winner-score">{winners[0].totalScore.toLocaleString()} points</div>
            </div>
          ) : (
            <div className="tied-winners">
              <h2 className="tie-title">It's a tie!</h2>
              <div className="winners-row">
                {winners.map((winner) => (
                  <div key={winner.id} className="winner-card winner-card-tied">
                    <div className="winner-crown">👑</div>
                    <div className="winner-avatar">{winner.avatar}</div>
                    <div className="winner-name">{winner.name}</div>
                    <div className="winner-score">{winner.totalScore.toLocaleString()} pts</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Other players */}
        {others.length > 0 && (
          <div className="others-section">
            <h3 className="others-title">Final Standings</h3>
            <div className="others-list">
              {others.map((player) => (
                <div key={player.id} className="others-row" style={{ borderLeftColor: player.color }}>
                  <span className="others-rank">#{player.rank}</span>
                  <span className="others-avatar">{player.avatar}</span>
                  <span className="others-name">{player.name}</span>
                  <span className="others-score">{player.totalScore.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Play again */}
        <button className="play-again-button" onClick={onPlayAgain}>
          <span className="button-icon">🔄</span>
          Play Again
        </button>
      </div>

      {/* Background decorations */}
      <div className="final-decorations">
        <span className="deco deco-1">🎄</span>
        <span className="deco deco-2">⭐</span>
        <span className="deco deco-3">🎅</span>
        <span className="deco deco-4">🎁</span>
        <span className="deco deco-5">❄️</span>
      </div>
    </div>
  );
}

