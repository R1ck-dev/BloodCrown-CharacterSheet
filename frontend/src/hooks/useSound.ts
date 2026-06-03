/**
 * useSound — expõe as preferências de áudio (mudo/volume) de forma reativa,
 * espelhando o store de [lib/sound.ts] via useSyncExternalStore. Usado pelo
 * SoundToggle no header. A reprodução em si é `playSound()` (não-React).
 */
import { useSyncExternalStore } from 'react';
import { getSoundPrefs, setSoundPrefs, subscribeSound, type SoundPrefs } from '@/lib/sound';

export interface UseSound extends SoundPrefs {
  setMuted: (muted: boolean) => void;
  toggleMuted: () => void;
  setVolume: (volume: number) => void;
}

export function useSound(): UseSound {
  const prefs = useSyncExternalStore(subscribeSound, getSoundPrefs, getSoundPrefs);
  return {
    muted: prefs.muted,
    volume: prefs.volume,
    setMuted: (muted) => setSoundPrefs({ muted }),
    toggleMuted: () => setSoundPrefs({ muted: !prefs.muted }),
    setVolume: (volume) => setSoundPrefs({ volume }),
  };
}
