import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MAPPED_CHARS } from './utils/constants';

interface GlitchTextProps {
  text: string;
  speed?: number;
  className?: string;
}

const GLYPH_POOL = MAPPED_CHARS.split('');

const glyphIndex = (frame: number, i: number, poolLength: number) => {
  const raw = Math.sin(frame * 127.1 + i * 311.7) * 43758.5453
            + Math.cos(frame * 269.5 + i * 183.3) * 12345.6789;
  return Math.abs(Math.floor(raw)) % poolLength;
};

export const GlitchText = React.memo<GlitchTextProps>(({ text, speed = 0.04, className }) => {
  const [display, setDisplay] = useState(() => text.split('').map(() => ''));
  const frameRef = useRef(0);
  const textRef = useRef(text);
  textRef.current = text;

  const stable = useMemo(() => text.split('').map((_, i, arr) => {
    const h = (i * 7 + arr.length * 13) % 100;
    const stableRatio = Math.max(0.2, 0.6 - arr.length * 0.02);
    return h < stableRatio * 100;
  }), [text]);

  useEffect(() => {
    let raf: number;
    const tick = () => {
      frameRef.current += speed;
      setDisplay(textRef.current.split('').map((ch, i) => {
        if (ch === ' ') return ' ';
        const stableLocal = stable[i];
        if (stableLocal) return ch;
        const roll = Math.sin(frameRef.current + i * 1.7);
        if (roll > 0.05) {
          const poolIdx = glyphIndex(frameRef.current, i, GLYPH_POOL.length);
          return GLYPH_POOL[poolIdx] ?? ch;
        }
        return ch;
      }));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [speed, stable]);

  const decoded = text.split('').map((ch, i) => (ch === ' ' ? ' ' : display[i] ?? ch));

  return (
    <span className={className} aria-label={text}>
      {decoded.join('')}
    </span>
  );
});