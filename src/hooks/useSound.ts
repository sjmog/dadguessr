import { useCallback, useRef, useState } from 'react';

// Sound effect types
export type SoundType = 
  | 'pin-place'
  | 'lock-guess'
  | 'reveal'
  | 'score-tick'
  | 'round-complete'
  | 'victory';

// Sound file URLs (in public/sounds/)
const SOUND_URLS: Record<SoundType, string | null> = {
  'pin-place': '/sounds/pin-place.wav',
  'lock-guess': '/sounds/lock-guess.wav',
  'reveal': '/sounds/reveal.wav',
  'score-tick': null, // No file for this one
  'round-complete': '/sounds/round-complete.wav',
  'victory': '/sounds/victory.wav',
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

