import React, { useEffect, useRef, useState } from 'react';
import { APP_FONT_FAMILY } from '../../utils/constants';
import { GlitchText } from '../../GlitchText';

const DISPLAY_DURATION = 15000;
const CONTROLS_DELAY = 2000;
const FADE_OUT_DURATION = 2500;

interface RelaxBreatheProps {
  showControls?: boolean;
}

export const RelaxBreathe = React.memo<RelaxBreatheProps>(({ showControls = false }) => {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const [controlsReady, setControlsReady] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadingOutRef = useRef(false);

  useEffect(() => {
    setMounted(true);

    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);

    if (showControls) {
      setFadingOut(false);
      setVisible(true);
      setControlsReady(false);
      controlsTimerRef.current = setTimeout(() => setControlsReady(true), CONTROLS_DELAY);
    } else if (visible) {
      setFadingOut(true);
      fadingOutRef.current = true;
      hideTimerRef.current = setTimeout(() => {
        setVisible(false);
        setFadingOut(false);
        setControlsReady(false);
        fadingOutRef.current = false;
      }, FADE_OUT_DURATION);
    }

    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    };
  }, [showControls]);

  useEffect(() => {
    const handleInteract = () => {
      if (visible && !fadingOutRef.current) {
        setFadingOut(true);
        fadingOutRef.current = true;
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
        hideTimerRef.current = setTimeout(() => {
          setVisible(false);
          setFadingOut(false);
          setControlsReady(false);
          fadingOutRef.current = false;
        }, FADE_OUT_DURATION);
      }
    };
    window.addEventListener('riftpane:user-interact', handleInteract);
    return () => window.removeEventListener('riftpane:user-interact', handleInteract);
  }, [visible]);

  if (!mounted || !visible) return null;

  const containerClass = fadingOut ? 'relax-fade-out' : 'relax-fade-in';

  return (
    <div className={`absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-10 select-none ${containerClass}`}>
      <div
        className="flex flex-col items-center gap-4 text-white/80 tracking-[0.5em] font-light text-2xl sm:text-3xl uppercase"
        style={{
          fontFamily: APP_FONT_FAMILY,
          textShadow: '0 0 20px rgba(255, 42, 75, 0.5)',
          animation: 'fontMorph 3s ease-in-out infinite',
        }}
      >
        <GlitchText text="relax" speed={0.08} />
        <GlitchText text="breathe" speed={0.08} />
      </div>
      <div
        className="flex flex-col items-center gap-3 mt-6"
        style={{
          opacity: controlsReady ? 1 : 0,
          transform: controlsReady ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
        }}
      >
        <span
          className="text-[11px] text-pink-200/80 uppercase tracking-[0.5em] font-bold"
          style={{
            fontFamily: APP_FONT_FAMILY,
            textShadow: '0 0 10px rgba(255, 42, 75, 0.8), 0 0 20px rgba(255, 42, 75, 0.4), 0 2px 4px rgba(0,0,0,0.8)',
            animation: 'fontMorph 2s ease-in-out infinite, pulse 1.5s ease-in-out infinite',
          }}
        >
          drag to look
        </span>
        <span
          className="text-[11px] text-pink-200/80 uppercase tracking-[0.5em] font-bold"
          style={{
            fontFamily: APP_FONT_FAMILY,
            textShadow: '0 0 10px rgba(255, 42, 75, 0.8), 0 0 20px rgba(255, 42, 75, 0.4), 0 2px 4px rgba(0,0,0,0.8)',
            animation: 'fontMorph 2s ease-in-out infinite 0.3s, pulse 1.5s ease-in-out infinite 0.3s',
          }}
        >
          scroll to zoom
        </span>
      </div>
    </div>
  );
});
