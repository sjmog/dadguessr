import type { Player } from '../types';
import { TOTAL_ROUNDS } from '../utils/constants';
import './Scoreboard.css';

interface ScoreboardProps {
  players: Player[];
  currentRound: number;
  onClose: () => void;
}

export function Scoreboard({ players, currentRound, onClose }: ScoreboardProps) {
  // Sort players by score
  const sortedPlayers = [...players].sort((a, b) => b.totalScore - a.totalScore);

  return (
    <div className="scoreboard-overlay" onClick={onClose}>
      <div className="scoreboard" onClick={(e) => e.stopPropagation()}>
        <button className="scoreboard-close" onClick={onClose}>×</button>
        
        <h2 className="scoreboard-title">🏆 Leaderboard</h2>
        <p className="scoreboard-round">After Round {currentRound - 1} of {TOTAL_ROUNDS}</p>

        <div className="scoreboard-list">
          {sortedPlayers.map((player, index) => (
            <div 
              key={player.id} 
              className="scoreboard-row"
              style={{ borderLeftColor: player.color }}
            >
              <span className="scoreboard-rank">{index + 1}</span>
              <span className="scoreboard-avatar">{player.avatar}</span>
              <span className="scoreboard-name">{player.name}</span>
              <span className="scoreboard-score">{player.totalScore.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

