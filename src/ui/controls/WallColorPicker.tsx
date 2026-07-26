import React, { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import { Pipette } from 'lucide-react';
import { hexToRgb } from '../../utils/color';
import { WALL_COLORS } from '../../utils/constants';

export const WallColorPicker = React.memo(({ wallHex, onSelect }: { wallHex: string; onSelect: (hex: string, rgb: readonly [number, number, number]) => void }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const paletteRef = useRef<HTMLDivElement | null>(null);

  const handleColorChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const hex = e.target.value;
      onSelect(hex, hexToRgb(hex));
      setOpen(false);
    },
    [onSelect]
  );

  const presetColors = useMemo(() => WALL_COLORS.map(w => ({ ...w, rgb: hexToRgb(w.hex) })), []);

  const handlePreset = useCallback(
    (hex: string) => {
      onSelect(hex, hexToRgb(hex));
      setOpen(false);
    },
    [onSelect]
  );

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleWheel = (e: WheelEvent) => {
      if (paletteRef.current && paletteRef.current.contains(e.target as Node)) {
        e.preventDefault();
        e.stopPropagation();
        paletteRef.current.scrollTop += e.deltaY * 0.5;
      }
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('wheel', handleWheel);
    };
  }, [open]);

  return (
    <div className="flex items-center gap-2" ref={containerRef}>
      <span className="text-[10px] text-pink-200/60 font-bold tracking-wider hidden sm:inline">WALL</span>
      <div className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1.5 px-2 py-1 rounded-full border border-white/10 bg-black/40 hover:border-pink-400/60 transition"
          title="Wall Color"
        >
          <span className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: wallHex }} />
          <span className="text-[10px] text-pink-200/70 font-bold hidden sm:inline">PALETTE</span>
        </button>
        {open && (
          <div
            ref={paletteRef}
            className="sakura-scrollbar absolute bottom-full mb-3 left-0 z-50 bg-[#120a1f]/95 backdrop-blur-md border border-pink-500/30 rounded-xl p-2 shadow-[0_0_20px_rgba(255,42,75,0.25),0_4px_12px_rgba(0,0,0,0.5)] w-64 max-h-48 overflow-y-auto"
          >
            <div className="grid grid-cols-6 gap-1">
              {presetColors.map((w) => (
                <button
                  key={w.name}
                  onClick={() => handlePreset(w.hex)}
                  className={`w-6 h-6 rounded-full border transition hover:scale-110 ${
                    wallHex === w.hex ? 'border-pink-400 shadow-[0_0_6px_rgba(255,42,75,0.8)]' : 'border-white/20 opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: w.hex }}
                  title={w.name}
                />
              ))}
            </div>
            <div className="mt-2 pt-2 border-t border-pink-500/20 flex items-center gap-2">
              <label className="flex items-center gap-1.5 cursor-pointer text-[10px] text-pink-200/70 hover:text-white transition">
                <Pipette className="w-3 h-3" />
                <span>Custom</span>
                <input type="color" value={wallHex} onChange={handleColorChange} className="opacity-0 absolute w-0 h-0" />
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});