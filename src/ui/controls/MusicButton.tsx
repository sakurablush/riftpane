import React, { useState, useCallback, useEffect } from 'react';
import { getMusicAudio, isMusicPlaying, toggleMusic } from '../../utils/musicManager';

interface MusicButtonProps {
  src?: string;
}

export const MusicButton = React.memo<MusicButtonProps>(({ src = './audio/riftpane.mp3' }) => {
  const [playing, setPlaying] = useState(() => isMusicPlaying());

  useEffect(() => {
    const audio = getMusicAudio(src);
    const update = () => setPlaying(!audio.paused);
    audio.addEventListener('play', update);
    audio.addEventListener('pause', update);
    setPlaying(!audio.paused);
    return () => {
      audio.removeEventListener('play', update);
      audio.removeEventListener('pause', update);
    };
  }, [src]);

  const toggle = useCallback(() => {
    setPlaying(toggleMusic(src));
  }, [src]);

  return (
    <button
      onClick={toggle}
      title={playing ? 'Pause music' : 'Play music'}
      className="p-1 rounded-full bg-white/5 hover:bg-white/20 transition hover:scale-110 active:scale-95"
      style={{ color: '#ff7080' }}
    >
      {playing ? (
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="5.5" cy="17.5" r="2.5" />
          <circle cx="17.5" cy="15.5" r="2.5" />
          <path d="M8 17.5V5l12-2v12" />
          <line x1="2" y1="22" x2="22" y2="2" />
        </svg>
      ) : (
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="5.5" cy="17.5" r="2.5" />
          <circle cx="17.5" cy="15.5" r="2.5" />
          <path d="M8 17.5V5l12-2v12" />
        </svg>
      )}
    </button>
  );
});
