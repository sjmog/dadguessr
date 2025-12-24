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
        {/* Left side: Polaroid photo */}
        <div className="postcard-photo-side">
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
        </div>

        {/* Right side: Message area */}
        <div className="postcard-message-side">
          {/* Top area with round and stamp */}
          <div className="postcard-header">
            <div className="round-badge">
              Round {roundNumber}/{totalRounds}
            </div>
            <div className="postage-stamp">
              <div className="stamp-inner">
                <span className="stamp-icon">✈️</span>
                <span className="stamp-text">AIR MAIL</span>
              </div>
            </div>
          </div>
          
          {/* Center message */}
          <div className="postcard-content">
            <p className="postcard-message">Wish you were here!</p>
          </div>

          {/* Bottom button */}
          <div className="postcard-footer">
            <button className="postcard-button" onClick={onDismiss}>
              🗺️ Find Me on the Map!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
