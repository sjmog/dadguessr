import { useState, useMemo } from 'react';
import './TitleScreen.css';

interface TitleScreenProps {
  onStart: (playerCount: number) => void;
}

const PLAYER_COUNTS = [1, 2, 3, 4, 5, 6];

// Pre-generate snowflake styles to avoid Math.random during render
function generateSnowflakeStyles(count: number) {
  return Array.from({ length: count }, () => ({
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 5}s`,
    animationDuration: `${5 + Math.random() * 5}s`,
  }));
}

export function TitleScreen({ onStart }: TitleScreenProps) {
  const [selectedCount, setSelectedCount] = useState(2);
  const snowflakeStyles = useMemo(() => generateSnowflakeStyles(20), []);

  return (
    <div className="title-screen">
      <div className="title-content">
        <div className="title-decoration">✈️</div>
        <h1 className="title-logo">
          <span className="title-dad">Dad</span>
          <span className="title-guessr">Guessr</span>
        </h1>
        <p className="title-tagline">Where in the world is Dad having a beer?</p>
        
        <div className="title-stamps">
          <span className="stamp">🎄</span>
          <span className="stamp">🎅</span>
          <span className="stamp">⛄</span>
        </div>

        <div className="player-count-selector">
          <p className="count-label">How many players?</p>
          <div className="count-buttons">
            {PLAYER_COUNTS.map((count) => (
              <button
                key={count}
                className={`count-btn ${selectedCount === count ? 'selected' : ''}`}
                onClick={() => setSelectedCount(count)}
              >
                {count}
              </button>
            ))}
          </div>
        </div>

        <button className="start-button" onClick={() => onStart(selectedCount)}>
          <span className="button-icon">🗺️</span>
          Start Journey
        </button>

        <div className="title-footer">
          <span>A Christmas Travel Adventure</span>
        </div>
      </div>

      <div className="snowflakes" aria-hidden="true">
        {snowflakeStyles.map((style, i) => (
          <div key={i} className="snowflake" style={style}>❄</div>
        ))}
      </div>
    </div>
  );
}

