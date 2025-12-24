import { useEffect } from 'react';
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
}

// Create custom marker icons for players
function createPlayerIcon(avatar: string, color: string, isCurrentPlayer: boolean): L.DivIcon {
  return L.divIcon({
    className: 'player-marker',
    html: `
      <div class="marker-pin ${isCurrentPlayer ? 'current' : ''}" style="--player-color: ${color}">
        <span class="marker-avatar">${avatar}</span>
      </div>
    `,
    iconSize: [50, 60],
    iconAnchor: [25, 60],
  });
}

// Actual location marker
function createActualLocationIcon(): L.DivIcon {
  return L.divIcon({
    className: 'actual-marker',
    html: `<div class="actual-pin">📍</div>`,
    iconSize: [40, 50],
    iconAnchor: [20, 50],
  });
}

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
  actualPosition 
}: { 
  isRevealing: boolean; 
  guessPositions: [number, number][]; 
  actualPosition?: [number, number];
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
      const timer = setTimeout(() => {
        map.fitBounds(bounds, {
          padding: [80, 80],
          maxZoom: 8,
          animate: true,
          duration: 1.5,
        });
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [isRevealing, guessPositions, actualPosition, map]);
  
  return null;
}

export function GameMap({
  players,
  roundGuesses,
  currentPlayerId,
  isRevealing,
  actualLocation,
  onPlacePin,
}: GameMapProps) {
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
        />

        {/* Render all player guesses */}
        {roundGuesses.map((guess) => {
          const player = players.find((p) => p.id === guess.playerId);
          if (!player) return null;
          
          const isCurrentPlayer = player.id === currentPlayerId;
          const icon = createPlayerIcon(player.avatar, player.color, isCurrentPlayer && !guess.locked);
          
          return (
            <Marker
              key={player.id}
              position={[guess.lat, guess.lon]}
              icon={icon}
            />
          );
        })}

        {/* Reveal phase: actual location and lines */}
        {isRevealing && actualLocation && (
          <>
            <Marker
              position={[actualLocation.lat, actualLocation.lon]}
              icon={createActualLocationIcon()}
            />
            
            {/* Lines from guesses to actual location */}
            {roundGuesses.map((guess) => {
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
                    dashArray: '10, 10',
                    opacity: 0.8,
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

