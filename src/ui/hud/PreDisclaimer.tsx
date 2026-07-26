import React, { useEffect } from 'react';
import { getMusicAudio, playMusic } from '../../utils/musicManager';

interface PreDisclaimerProps {
  onContinue: () => void;
}

export const PreDisclaimer = React.memo<PreDisclaimerProps>(({ onContinue }) => {
  useEffect(() => {
    // Preload audio in background without playing
    const audio = getMusicAudio('./audio/riftpane.mp3');
    const handleCanPlay = () => {};
    audio.addEventListener('canplay', handleCanPlay);
    return () => audio.removeEventListener('canplay', handleCanPlay);
  }, []);

  const handleContinue = () => {
    playMusic('./audio/riftpane.mp3');
    onContinue();
  };

  const handleDialogWheel = (e: React.WheelEvent) => {
    const target = e.currentTarget;
    const atTop = target.scrollTop <= 0;
    const atBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 1;
    if ((atTop && e.deltaY < 0) || (atBottom && e.deltaY > 0)) {
      e.stopPropagation();
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
      <div
        onWheel={handleDialogWheel}
        className="bg-[#120a1f] border border-pink-500/30 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl text-slate-200 text-sm leading-relaxed"
      >
        <h2 className="text-lg font-bold text-white tracking-wider text-center" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}>
          Welcome to Riftpane
        </h2>

        <div className="space-y-3 text-xs">
          <p>
            This experience includes optional background music that plays automatically once you enter. If you prefer silence, you can mute it anytime — use the music button in the top menu, or your browser/system audio controls.
          </p>
          <p>
            We recommend wearing headphones for the best immersive experience.
          </p>
          <p>
            Take a deep breath, get comfortable, and enjoy the visual journey.
          </p>
        </div>

        <div className="pt-2 flex flex-col items-center gap-3">
          <button
            onClick={handleContinue}
            className="px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-500 text-white font-bold rounded-lg transition shadow-[0_0_12px_rgba(255,42,75,0.6)] hover:shadow-[0_0_20px_rgba(255,42,75,0.9)]"
            style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}
          >
            Continue
          </button>
          <span
            className="text-[9px] font-bold tracking-wider"
            style={{
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              color: 'rgba(255, 71, 126, 0.75)',
              textShadow: '0 0 10px rgba(255, 42, 75, 0.5), 0 2px 4px rgba(0,0,0,0.8)',
            }}
          >
            with love from sakurablush
          </span>
        </div>
      </div>
    </div>
  );
});
