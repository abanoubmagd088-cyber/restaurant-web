import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Volume1 } from 'lucide-react';
import type { AudioController } from '@/audio/audioController';

type Props = {
  audio: AudioController | null;
};

export default function AmbientPlayer({ audio }: Props) {
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [showSlider, setShowSlider] = useState(false);
  const hideTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (hideTimer.current !== null) window.clearTimeout(hideTimer.current);
    };
  }, []);

  const handleMute = () => {
    if (!audio) return;
    const nowMuted = audio.toggleMute();
    setMuted(nowMuted);
  };

  const handleVolume = (value: number) => {
    setVolume(value);
    audio?.setMasterVolume(value);
    if (value > 0 && muted) {
      setMuted(false);
      audio?.setMuted(false);
    }
  };

  const reveal = () => {
    setShowSlider(true);
    if (hideTimer.current !== null) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setShowSlider(false), 2600);
  };

  const keepOpen = () => {
    if (hideTimer.current !== null) window.clearTimeout(hideTimer.current);
  };

  const Icon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div
      className="fixed bottom-6 right-6 z-40 flex items-center gap-3"
      onMouseEnter={reveal}
      onMouseLeave={() => setShowSlider(false)}
    >
      <div
        className={`transition-all duration-500 ease-out ${
          showSlider
            ? 'opacity-100 translate-x-0 w-32'
            : 'opacity-0 translate-x-4 w-0 pointer-events-none'
        }`}
        onMouseEnter={keepOpen}
      >
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={muted ? 0 : volume}
          onChange={(e) => handleVolume(Number(e.target.value))}
          aria-label="Ambient music volume"
          className="ambient-slider w-full h-1.5 appearance-none rounded-full bg-white/20 backdrop-blur-md"
        />
      </div>

      <button
        onClick={handleMute}
        onMouseEnter={reveal}
        aria-label={muted ? 'Unmute ambient music' : 'Mute ambient music'}
        className="group relative flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/5 backdrop-blur-xl text-white/90 shadow-[0_8px_32px_rgba(0,0,0,0.35)] transition-all duration-300 hover:border-white/30 hover:bg-white/10 hover:scale-105 active:scale-95"
      >
        <span className="absolute inset-0 rounded-full bg-cyan-300/10 opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-100" />
        <Icon
          className={`relative h-5 w-5 transition-transform duration-300 ${
            muted ? 'opacity-60' : 'opacity-100'
          }`}
          strokeWidth={1.6}
        />
      </button>
    </div>
  );
}
