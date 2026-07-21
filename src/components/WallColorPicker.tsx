import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Palette, X } from 'lucide-react';
import { WALL_COLORS } from '../constants';

interface WallColorPickerProps {
  activeWall: string;
  onActiveWallChange: (color: string) => void;
}

export const WallColorPicker: React.FC<WallColorPickerProps> = React.memo(({ activeWall, onActiveWallChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const closePicker = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleSelectColor = useCallback(
    (hex: string) => {
      onActiveWallChange(hex);
    },
    [onActiveWallChange]
  );

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Featured 5 quick swatches for rapid access
  const quickSwatches = WALL_COLORS.slice(0, 5);

  return (
    <div className="relative flex items-center shrink-0" ref={containerRef}>
      <span className="text-zinc-500 text-[9px] tracking-[0.2em] font-bold mt-0.5 hidden sm:block mr-2">
        WALL
      </span>

      {/* Quick Swatches Bar */}
      <div className="flex items-center gap-1.5 md:gap-2">
        {quickSwatches.map((col) => {
          const isSelected = activeWall.toLowerCase() === col.hex.toLowerCase();
          return (
            <button
              key={col.hex}
              onClick={() => handleSelectColor(col.hex)}
              title={col.name}
              aria-label={`Select ${col.name} wall color`}
              className={`w-4 h-4 md:w-5 md:h-5 rounded-full border-2 transition-transform cursor-pointer focus:outline-none focus:ring-1 focus:ring-zinc-400 ${
                isSelected ? 'border-zinc-200 scale-125 z-10' : 'border-zinc-800 hover:border-zinc-500 hover:scale-110'
              }`}
              style={{ backgroundColor: col.hex }}
            />
          );
        })}

        {/* Palette Toggle Button */}
        <button
          onClick={toggleOpen}
          aria-expanded={isOpen}
          aria-label="Open full wall color palette"
          title="Full Color Palette (24+ colors)"
          className={`w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
            isOpen
              ? 'bg-zinc-200 text-black border-zinc-200 shadow-[0_0_10px_rgba(255,255,255,0.3)]'
              : 'bg-zinc-900/80 text-zinc-400 border-zinc-700/80 hover:text-zinc-200 hover:bg-zinc-800'
          }`}
        >
          <Palette size={11} />
        </button>
      </div>

      {/* Floating 24-Color Popover Menu */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Wall color selector"
          className="absolute bottom-10 left-1/2 -translate-x-1/2 mb-2 w-72 sm:w-80 p-3.5 bg-[#0d0d0f]/95 border border-zinc-700/80 rounded-2xl shadow-2xl backdrop-blur-xl z-50 animate-in fade-in slide-in-from-bottom-2 duration-150"
        >
          <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-zinc-800/80">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-zinc-200 tracking-[0.2em] uppercase">
                Wall Color Palette
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-semibold">
                {WALL_COLORS.length} Colors
              </span>
            </div>
            <button
              onClick={closePicker}
              aria-label="Close color palette"
              className="text-zinc-500 hover:text-zinc-200 transition-colors p-1 rounded-full hover:bg-zinc-800/60"
            >
              <X size={12} />
            </button>
          </div>

          {/* Color Grid */}
          <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1 no-scrollbar">
            {WALL_COLORS.map((col) => {
              const isSelected = activeWall.toLowerCase() === col.hex.toLowerCase();
              return (
                <button
                  key={col.hex}
                  onClick={() => {
                    handleSelectColor(col.hex);
                  }}
                  title={`${col.name} (${col.hex})`}
                  aria-label={`Select wall color ${col.name}`}
                  className={`group relative flex flex-col items-center justify-center aspect-square rounded-xl border-2 transition-all cursor-pointer hover:scale-110 focus:outline-none ${
                    isSelected
                      ? 'border-zinc-100 ring-2 ring-zinc-400 scale-105 shadow-md'
                      : 'border-zinc-800/80 hover:border-zinc-500'
                  }`}
                  style={{ backgroundColor: col.hex }}
                >
                  {isSelected && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Custom Color Input */}
          <div className="pt-2.5 mt-2 border-t border-zinc-800/80 flex items-center justify-between">
            <label htmlFor="custom-wall-color" className="text-[9px] text-zinc-400 font-medium tracking-wider uppercase">
              Custom Hex Color:
            </label>
            <div className="flex items-center gap-2">
              <input
                id="custom-wall-color"
                type="color"
                value={activeWall.startsWith('#') ? activeWall : '#050000'}
                onChange={(e) => handleSelectColor(e.target.value)}
                aria-label="Pick custom wall color"
                className="w-6 h-6 rounded-md bg-transparent border-0 cursor-pointer p-0"
              />
              <span className="text-[10px] font-mono text-zinc-300 font-bold bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                {activeWall.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

WallColorPicker.displayName = 'WallColorPicker';
