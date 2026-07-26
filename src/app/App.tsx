import React, { useState } from 'react';
import { Eye } from 'lucide-react';
import { CanvasSetup } from '../engine/renderer/CanvasSetup';
import { TopBar } from '../ui/hud/TopBar';
import { BottomBar } from '../ui/hud/BottomBar';
import { RelaxBreathe } from '../ui/ambient/RelaxBreathe';
import { Scanlines } from '../ui/ambient/Scanlines';
import { DisclaimerModal } from '../ui/hud/DisclaimerModal';
import { PreDisclaimer } from '../ui/hud/PreDisclaimer';
import { PhotosensitiveDisclaimer } from '../ui/hud/PhotosensitiveDisclaimer';
import { DecodeText } from '../DecodeText';
import { APP_FONT_FAMILY } from '../utils/constants';
import { useUiStore } from '../state/uiStore';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

export default function App() {
  const hudVisible = useUiStore((s) => s.hudVisible);
  const toggleHud = useUiStore((s) => s.toggleHud);
  const [preAccepted, setPreAccepted] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  const dialogsLocked = !preAccepted || !disclaimerAccepted;
  useBodyScrollLock(dialogsLocked);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black text-slate-100 font-mono select-none">
      <div className="absolute inset-0 z-0">
        <CanvasSetup locked={dialogsLocked} />
      </div>

      {!hudVisible && (
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-50 flex items-center gap-2">
          <span
            className="text-[10px] font-bold tracking-wider pointer-events-none"
            style={{
              fontFamily: APP_FONT_FAMILY,
              color: 'rgba(255, 71, 126, 0.5)',
              textShadow: '0 0 10px rgba(255, 42, 75, 0.5), 0 2px 4px rgba(0,0,0,0.8)',
            }}
          >
            <DecodeText text="with love from sakurablush" speed={0.02} />
          </span>
          <button
            onClick={toggleHud}
            aria-label="Show HUD"
            title="Show HUD"
            className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full border cursor-pointer transition-all duration-200 hover:scale-110"
            style={{
              background: 'rgba(18, 10, 31, 0.9)',
              color: '#ff7080',
              borderColor: 'rgba(255, 112, 150, 0.2)',
              boxShadow: '0 0 20px rgba(255, 112, 150, 0.3)',
            }}
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      )}

      {hudVisible && (
        <div className="absolute inset-x-0 top-0 bottom-0 z-20 flex flex-col pointer-events-none">
          <div className="w-full pointer-events-auto">
            <TopBar />
          </div>
          <div className="w-full flex justify-end px-2 sm:px-3 pointer-events-none shrink-0">
            <span
              className="text-[10px] font-bold tracking-wider pointer-events-none"
              style={{
                fontFamily: APP_FONT_FAMILY,
                color: 'rgba(255, 71, 126, 0.5)',
                textShadow: '0 0 10px rgba(255, 42, 75, 0.5), 0 2px 4px rgba(0,0,0,0.8)',
              }}
            >
              <DecodeText text="with love from sakurablush" speed={0.02} />
            </span>
          </div>
          <div className="w-full pointer-events-auto mt-auto">
            <BottomBar />
          </div>
        </div>
      )}

      <RelaxBreathe showControls={disclaimerAccepted} />

      {!preAccepted && (
        <PreDisclaimer onContinue={() => setPreAccepted(true)} />
      )}

      {preAccepted && !disclaimerAccepted && (
        <PhotosensitiveDisclaimer onClose={() => setDisclaimerAccepted(true)} />
      )}

      <Scanlines />
      <DisclaimerModal />
    </div>
  );
}
