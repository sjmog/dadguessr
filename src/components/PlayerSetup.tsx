import type { Player } from '../types';
import { AVATARS } from '../utils/constants';
import './PlayerSetup.css';

interface PlayerSetupProps {
  players: Player[];
  onSetPlayerInfo: (playerId: number, name: string, avatar: string) => void;
  onBeginJourney: () => void;
  onBack: () => void;
}

export function PlayerSetup({ players, onSetPlayerInfo, onBeginJourney, onBack }: PlayerSetupProps) {
  const allPlayersConfigured = players.every((p) => p.name.trim() && p.avatar);
  const usedAvatars = players.map((p) => p.avatar).filter(Boolean);

  return (
    <div className="player-setup">
      <div className="setup-card setup-card-wide">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
        <h2 className="setup-title">Meet the travelers</h2>
        <p className="setup-subtitle">Enter names and pick avatars for {players.length} players</p>

        <div className="players-grid">
          {players.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              usedAvatars={usedAvatars}
              onUpdate={(name, avatar) => onSetPlayerInfo(player.id, name, avatar)}
            />
          ))}
        </div>

        <button
          className="begin-button"
          onClick={onBeginJourney}
          disabled={!allPlayersConfigured}
        >
          <span className="button-icon">🌍</span>
          Begin Journey
        </button>
      </div>
    </div>
  );
}

interface PlayerCardProps {
  player: Player;
  usedAvatars: string[];
  onUpdate: (name: string, avatar: string) => void;
}

function PlayerCard({ player, usedAvatars, onUpdate }: PlayerCardProps) {
  // Use player props directly instead of local state to avoid sync issues
  const handleNameChange = (newName: string) => {
    onUpdate(newName, player.avatar);
  };

  const handleAvatarSelect = (newAvatar: string) => {
    onUpdate(player.name, newAvatar);
  };

  return (
    <div className="player-card" style={{ borderColor: player.color }}>
      <div className="player-header">
        <span className="player-number" style={{ background: player.color }}>
          P{player.id + 1}
        </span>
        <input
          type="text"
          className="player-name-input"
          placeholder="Enter name..."
          value={player.name}
          onChange={(e) => handleNameChange(e.target.value)}
          maxLength={15}
        />
      </div>

      <div className="avatar-grid">
        {AVATARS.map((av) => {
          const isUsed = usedAvatars.includes(av.emoji) && av.emoji !== player.avatar;
          return (
            <button
              key={av.id}
              className={`avatar-button ${player.avatar === av.emoji ? 'selected' : ''} ${isUsed ? 'used' : ''}`}
              onClick={() => !isUsed && handleAvatarSelect(av.emoji)}
              disabled={isUsed}
              title={av.label}
            >
              {av.emoji}
            </button>
          );
        })}
      </div>
    </div>
  );
}

