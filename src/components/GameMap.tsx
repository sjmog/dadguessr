import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Player, RoundGuess, Location } from '../types';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '../utils/constants';
import 'leaflet/dist/leaflet.css';
import './GameMap.css';

interface GameMapProps {
  players: Player[];
  roundGuesses: RoundGuess[];
  currentPlayerId: number;
  isRevealing: boolean;
  actualLocation?: Location;
  onPlacePin: (lat: number, lon: number) => void;
  hoveredPlayerId?: number | null;
  onPlayerHover?: (playerId: number | null) => void;
}

// Create custom marker icons for players
function createPlayerIcon(avatar: string, color: string, isCurrentPlayer: boolean, isHighlighted: boolean): L.DivIcon {
  const classes = ['marker-pin'];
  if (isCurrentPlayer) classes.push('current');
  if (isHighlighted) classes.push('highlighted');
  
  return L.divIcon({
    className: 'player-marker',
    html: `
      <div class="${classes.join(' ')}" style="--player-color: ${color}">
        <span class="marker-avatar">${avatar}</span>
      </div>
    `,
    iconSize: [50, 60],
    iconAnchor: [25, 60],
  });
}

// Actual location marker - created once and reused
const ACTUAL_LOCATION_ICON = L.divIcon({
  className: 'actual-marker',
  html: `<div class="actual-pin">📍</div>`,
  iconSize: [40, 50],
  iconAnchor: [20, 50],
});

// Component to handle map clicks
function MapClickHandler({ onPlacePin, disabled }: { onPlacePin: (lat: number, lon: number) => void; disabled: boolean }) {
  useMapEvents({
    click(e) {
      if (!disabled) {
        onPlacePin(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

// Component to reset map view
function MapResetter({ shouldReset }: { shouldReset: boolean }) {
  const map = useMap();
  
  useEffect(() => {
    if (shouldReset) {
      map.setView(DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM);
    }
  }, [shouldReset, map]);
  
  return null;
}

// Component to fit map bounds to all points during reveal
function MapBoundsFitter({ 
  isRevealing, 
  guessPositions, 
  actualPosition,
  onAnimationComplete,
}: { 
  isRevealing: boolean; 
  guessPositions: [number, number][]; 
  actualPosition?: [number, number];
  onAnimationComplete?: () => void;
}) {
  const map = useMap();
  
  useEffect(() => {
    if (isRevealing && guessPositions.length > 0) {
      // Collect all points to fit in bounds
      const allPoints: [number, number][] = [...guessPositions];
      if (actualPosition) {
        allPoints.push(actualPosition);
      }
      
      // Create bounds from all points
      const bounds = L.latLngBounds(allPoints.map(([lat, lon]) => [lat, lon]));
      
      // Small delay to let reveal animation start, then smoothly fit bounds
      // Extra bottom padding for the score chips bar
      const startTimer = setTimeout(() => {
        map.fitBounds(bounds, {
          paddingTopLeft: [50, 100],
          paddingBottomRight: [50, 200],
          maxZoom: 8,
          animate: true,
          duration: 1.5,
        });
      }, 300);
      
      // Call onAnimationComplete shortly after animation starts settling
      const completeTimer = setTimeout(() => {
        onAnimationComplete?.();
      }, 1200); // Show lines while map is still settling
      
      return () => {
        clearTimeout(startTimer);
        clearTimeout(completeTimer);
      };
    }
  }, [isRevealing, guessPositions, actualPosition, map, onAnimationComplete]);
  
  return null;
}

// Individual player marker component to properly memoize icons
function PlayerMarker({
  guess,
  players,
  currentPlayerId,
  hoveredPlayerId,
  isRevealing,
  onPlayerHover,
}: {
  guess: RoundGuess;
  players: Player[];
  currentPlayerId: number;
  hoveredPlayerId?: number | null;
  isRevealing: boolean;
  onPlayerHover?: (playerId: number | null) => void;
}) {
  const player = players.find((p) => p.id === guess.playerId);
  
  const isCurrentPlayer = player?.id === currentPlayerId;
  const isHighlighted = hoveredPlayerId === player?.id;
  
  // Memoize icon to prevent unnecessary recreations
  const icon = useMemo(() => {
    if (!player) return null;
    return createPlayerIcon(player.avatar, player.color, isCurrentPlayer && !guess.locked, isHighlighted);
  }, [player, isCurrentPlayer, guess.locked, isHighlighted]);
  
  if (!player || !icon) return null;
  
  return (
    <Marker
      position={[guess.lat, guess.lon]}
      icon={icon}
      eventHandlers={isRevealing && onPlayerHover ? {
        mouseover: () => onPlayerHover(player.id),
        mouseout: () => onPlayerHover(null),
      } : undefined}
    />
  );
}

export function GameMap({
  players,
  roundGuesses,
  currentPlayerId,
  isRevealing,
  actualLocation,
  onPlacePin,
  hoveredPlayerId,
  onPlayerHover,
}: GameMapProps) {
  // Simple state: just track when to show lines (after fitBounds starts settling)
  const [showLines, setShowLines] = useState(false);

  // Reset when leaving reveal phase
  useEffect(() => {
    if (!isRevealing) {
      // Use timeout to avoid synchronous setState in effect
      const timer = setTimeout(() => setShowLines(false), 0);
      return () => clearTimeout(timer);
    }
  }, [isRevealing]);

  // Prepare positions for bounds fitting
  const guessPositions: [number, number][] = roundGuesses.map(g => [g.lat, g.lon]);
  const actualPosition: [number, number] | undefined = actualLocation 
    ? [actualLocation.lat, actualLocation.lon] 
    : undefined;

  return (
    <div className="game-map-container">
      <MapContainer
        center={DEFAULT_MAP_CENTER}
        zoom={DEFAULT_MAP_ZOOM}
        className="game-map"
        worldCopyJump={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapClickHandler onPlacePin={onPlacePin} disabled={isRevealing} />
        <MapResetter shouldReset={!isRevealing && roundGuesses.length === 0} />
        <MapBoundsFitter 
          isRevealing={isRevealing} 
          guessPositions={guessPositions}
          actualPosition={actualPosition}
          onAnimationComplete={() => setShowLines(true)}
        />

        {/* Render all player guesses */}
        {roundGuesses.map((guess) => (
          <PlayerMarker
            key={guess.playerId}
            guess={guess}
            players={players}
            currentPlayerId={currentPlayerId}
            hoveredPlayerId={hoveredPlayerId}
            isRevealing={isRevealing}
            onPlayerHover={onPlayerHover}
          />
        ))}

        {/* Reveal phase: actual location and lines */}
        {isRevealing && actualLocation && (
          <>
            <Marker
              position={[actualLocation.lat, actualLocation.lon]}
              icon={ACTUAL_LOCATION_ICON}
            />
            
            {/* Lines from guesses to actual location - shown after map animation completes */}
            {showLines && roundGuesses.map((guess, index) => {
              const player = players.find((p) => p.id === guess.playerId);
              if (!player) return null;
              
              return (
                <Polyline
                  key={`line-${player.id}`}
                  positions={[
                    [guess.lat, guess.lon],
                    [actualLocation.lat, actualLocation.lon],
                  ]}
                  pathOptions={{
                    color: player.color,
                    weight: 3,
                    dashArray: '12, 8',
                    className: `guess-line guess-line-${index}`,
                  }}
                />
              );
            })}
          </>
        )}
      </MapContainer>
    </div>
  );
}

