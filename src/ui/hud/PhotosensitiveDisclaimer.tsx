import React, { useState } from 'react';
import { playMusic } from '../../utils/musicManager';

interface PhotosensitiveDisclaimerProps {
  onClose?: () => void;
}

export const PhotosensitiveDisclaimer = React.memo<PhotosensitiveDisclaimerProps>(({ onClose }) => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const handleClose = () => {
    playMusic('./audio/riftpane.mp3');
    setVisible(false);
    if (onClose) {
      onClose();
    }
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
          Before You Continue
        </h2>

        <div className="space-y-3 text-xs">
          <p>
            Riftpane uses rapid flashes of light, flickering patterns, and high-contrast strobe-like effects as part of its visual design.
          </p>
          <p>
            A small percentage of people are photosensitive, and exposure to flashing or rapidly changing light patterns can, in rare cases, trigger a seizure — even in individuals with no prior history of one. If you or anyone in your household has a personal or family history of epilepsy or seizures, please consult a doctor before proceeding.
          </p>
          <p>
            Should you experience dizziness, altered vision, eye or muscle twitching, disorientation, or any involuntary movement at any point while using this application, please stop immediately and seek medical attention if symptoms persist.
          </p>
        </div>

        <div className="pt-2 flex justify-center">
          <button
            onClick={handleClose}
            className="px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-500 text-white font-bold rounded-lg transition shadow-[0_0_12px_rgba(255,42,75,0.6)] hover:shadow-[0_0_20px_rgba(255,42,75,0.9)]"
            style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}
          >
            I Understand — Continue
          </button>
        </div>
      </div>
    </div>
  );
});