import { useState } from 'react';
import type { Location } from '../types';
import './PostcardModal.css';

interface PostcardModalProps {
  location: Location;
  roundNumber: number;
  totalRounds: number;
  onDismiss: () => void;
}

export function PostcardModal({ location, roundNumber, totalRounds, onDismiss }: PostcardModalProps) {
  const imageUrl = `/images/${location.image}`;
  const [imageLoaded, setImageLoaded] = useState(false);
  
  return (
    <div className="postcard-overlay" onClick={onDismiss}>
      <div className="postcard" onClick={(e) => e.stopPropagation()}>
        <div className="postcard-image-frame">
          <div className="postcard-image-container">
            {!imageLoaded && (
              <div className="postcard-loading">
                <span className="loading-globe">🌍</span>
              </div>
            )}
            <img 
              key={imageUrl}
              src={imageUrl}
              alt="Where is Dad?"
              className={`postcard-image ${imageLoaded ? 'loaded' : ''}`}
              onLoad={() => setImageLoaded(true)}
            />
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
