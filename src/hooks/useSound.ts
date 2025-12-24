import { useCallback, useRef, useState } from 'react';

// Sound effect types
export type SoundType = 
  | 'pin-place'
  | 'lock-guess'
  | 'reveal'
  | 'score-tick'
  | 'round-complete'
  | 'victory';

// For now, we'll use simple placeholder sounds
// These can be replaced with actual audio files later
const SOUND_URLS: Record<SoundType, string | null> = {
  'pin-place': null,
  'lock-guess': null,
  'reveal': null,
  'score-tick': null,
  'round-complete': null,
  'victory': null,
};

export function useSound() {
  const [muted, setMuted] = useState(false);
  const audioRefs = useRef<Map<SoundType, HTMLAudioElement>>(new Map());

  const play = useCallback((sound: SoundType) => {
    if (muted) return;
    
    const url = SOUND_URLS[sound];
    if (!url) {
      // Placeholder: log when sound would play
      console.log(`🔊 Sound: ${sound}`);
      return;
    }

    let audio = audioRefs.current.get(sound);
    if (!audio) {
      audio = new Audio(url);
      audioRefs.current.set(sound, audio);
    }
    
    audio.currentTime = 0;
    audio.play().catch(() => {
      // Ignore autoplay errors
    });
  }, [muted]);

  const toggleMute = useCallback(() => {
    setMuted((m) => !m);
  }, []);

  return { play, muted, toggleMute };
}

