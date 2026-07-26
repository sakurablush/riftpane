import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MAPPED_CHARS } from './utils/constants';

interface DecodeTextProps {
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

export const DecodeText = React.memo<DecodeTextProps>(({ text, speed = 0.02, className }) => {
  const [display, setDisplay] = useState(() => text.split('').map(() => ''));
  const frameRef = useRef(0);
  const textRef = useRef(text);
  textRef.current = text;

  const decodeTimes = useMemo(() => text.split('').map((_, i, arr) => {
    const h = (i * 7 + arr.length * 13) % 100;
    const baseDelay = 0.3 + (h / 100) * 1.5;
    return baseDelay + i * 0.08;
  }), [text]);

  useEffect(() => {
    let raf: number;
    const tick = () => {
      frameRef.current += speed;
      setDisplay(textRef.current.split('').map((ch, i) => {
        if (ch === ' ') return ' ';
        const isSpace = ch === ' ';
        const decodeTime = decodeTimes[i];
        if (frameRef.current < decodeTime) {
          const poolIdx = glyphIndex(frameRef.current, i, GLYPH_POOL.length);
          return GLYPH_POOL[poolIdx] ?? ch;
        }
        return ch;
      }));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [speed, decodeTimes]);

  const decoded = text.split('').map((ch, i) => (ch === ' ' ? ' ' : display[i] ?? ch));

  return (
    <span className={className} aria-label={text}>
      {decoded.join('')}
    </span>
  );
});