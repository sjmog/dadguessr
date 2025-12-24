import type { Location } from '../types';
import './PostcardModal.css';

interface PostcardModalProps {
  location: Location;
  roundNumber: number;
  totalRounds: number;
  onDismiss: () => void;
}

export function PostcardModal({ location, roundNumber, totalRounds, onDismiss }: PostcardModalProps) {
  // Use a placeholder image for now - we'll add real images later
  const imageUrl = `/images/${location.image}`;
  
  return (
    <div className="postcard-overlay" onClick={onDismiss}>
      <div className="postcard" onClick={(e) => e.stopPropagation()}>
        <div className="postcard-image-frame">
          <div 
            className="postcard-image"
            style={{ 
              backgroundImage: `url(${imageUrl})`,
              backgroundColor: '#ddd'
            }}
          >
            <div className="postcard-placeholder">
              <span className="placeholder-icon">🎉</span>
              <span className="placeholder-text">Dad is somewhere...</span>
            </div>
          </div>
        </div>
        
        <div className="postcard-content">
          <p className="postcard-message">Wish you were here!</p>
          
          <div className="postcard-stamps">
            <div className="stamp stamp-round">
              Round {roundNumber}/{totalRounds}
            </div>
            <div className="stamp stamp-postage">
              ✈️ AIRMAIL
            </div>
          </div>

          <button className="postcard-button" onClick={onDismiss}>
            Find Me on the Map! 🗺️
          </button>
        </div>

        <div className="postcard-decoration postcard-decoration-1">🎄</div>
        <div className="postcard-decoration postcard-decoration-2">⭐</div>
      </div>
    </div>
  );
}

