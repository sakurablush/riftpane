import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Palette, X, Heart } from 'lucide-react';
import { WALL_COLORS } from '../constants';
import { UI_CONSTANTS } from '../constants';

interface WallColorPickerProps {
  activeWall: string;
  onActiveWallChange: (color: string) => void;
}

export const WallColorPicker: React.FC<WallColorPickerProps> = React.memo(({ activeWall, onActiveWallChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customHex, setCustomHex] = useState((activeWall || WALL_COLORS[0].hex).replace('#', ''));
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);

  const defaultWallColor = WALL_COLORS[0].hex;

  const closeWithAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    animationRef.current = requestAnimationFrame(() => {
      setIsOpen(false);
    });
  }, []);

  const openPicker = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const closePicker = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleSelectColor = useCallback(
    (hex: string) => {
      onActiveWallChange(hex);
      setCustomHex(hex.replace('#', ''));
    },
    [onActiveWallChange]
  );

  const handleCustomHexChange = useCallback(
    (value: string) => {
      const cleaned = value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6);
      setCustomHex(cleaned);
      if (cleaned.length === 6) {
        onActiveWallChange(`#${cleaned}`);
      }
    },
    [onActiveWallChange]
  );

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) {
        return;
      }
      closePicker();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closePicker();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closePicker]);

  // Prevent body scroll when dropdown is open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  return (
    <div className="relative flex items-center shrink-0">
      <span className="text-zinc-500 text-[9px] tracking-[0.2em] font-bold mt-0.5 hidden sm:block mr-2">
        WALL
      </span>

      {/* Quick Swatches Bar */}
      <div className="flex items-center gap-1.5 md:gap-2">
        {WALL_COLORS.slice(0, 5).map((col) => {
          const isSelected = activeWall.toLowerCase() === col.hex.toLowerCase();
          return (
            <button
              key={col.hex}
              onClick={() => handleSelectColor(col.hex)}
              title={col.name}
              aria-label={`Select ${col.name} wall color`}
              className={`w-4 h-4 md:w-5 md:h-5 rounded-full border transition-all duration-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-zinc-400 ${
                isSelected ? 'border-zinc-200 scale-125 z-10 shadow-[0_0_6px_rgba(255,255,255,0.3)]' : 'border-zinc-800 hover:border-zinc-500 hover:scale-110'
              }`}
              style={{ backgroundColor: col.hex }}
            />
          );
        })}

        {/* Palette Toggle Button */}
        <button
          ref={triggerRef}
          onClick={openPicker}
          aria-expanded={isOpen}
          aria-label="Open full wall color palette"
          title="Full Color Palette"
          className={`w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center border transition-all duration-200 cursor-pointer ${
            isOpen
              ? 'bg-zinc-200 text-black border-zinc-200 shadow-[0_0_10px_rgba(255,255,255,0.3)]'
              : 'bg-zinc-900/80 text-zinc-400 border-zinc-700/80 hover:text-zinc-200 hover:bg-zinc-800'
          }`}
        >
          <Palette size={11} />
        </button>
      </div>

      {/* Overlay + Dropdown */}
      {isOpen && (
        <div className="fixed inset-0 z-[9998]" onClick={closePicker}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            ref={dropdownRef}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Wall color selector"
            className="absolute left-1/2 -translate-x-1/2 top-20 md:top-24 w-[calc(100%-2rem)] max-w-sm p-4 bg-[#0d0d0f]/95 border border-zinc-700/80 rounded-2xl shadow-2xl backdrop-blur-xl z-[9999] animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-zinc-800/80">
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
            <div className="grid grid-cols-6 gap-2 max-h-64 overflow-y-auto p-1 no-scrollbar">
              {WALL_COLORS.map((col) => {
                const isSelected = activeWall.toLowerCase() === col.hex.toLowerCase();
                return (
                  <button
                    key={col.hex}
                    onClick={() => handleSelectColor(col.hex)}
                    title={`${col.name} (${col.hex})`}
                    aria-label={`Select wall color ${col.name}`}
                    className={`group relative flex flex-col items-center justify-center aspect-square rounded-xl border-2 transition-all duration-200 cursor-pointer hover:scale-110 focus:outline-none ${
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
            <div className="pt-3 mt-3 border-t border-zinc-800/80">
              <div className="flex items-center gap-2">
                <label htmlFor="custom-wall-color-hex" className="text-[9px] text-zinc-400 font-medium tracking-wider uppercase whitespace-nowrap">
                  Custom:
                </label>
                <input
                  id="custom-wall-color-hex"
                  type="text"
                  value={customHex}
                  onChange={(e) => handleCustomHexChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCustomHexChange(customHex);
                      closePicker();
                    }
                  }}
                  placeholder="RRGGBB"
                  maxLength={6}
                  aria-label="Enter custom hex color"
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-md px-2 py-1 text-[10px] font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 uppercase"
                />
                <input
                  id="custom-wall-color-picker"
                  type="color"
                  value={activeWall.startsWith('#') ? activeWall : defaultWallColor}
                  onChange={(e) => handleSelectColor(e.target.value)}
                  aria-label="Pick custom wall color"
                  className="w-8 h-8 rounded-md bg-transparent border-0 cursor-pointer p-0"
                />
              </div>
              <div className="mt-1.5 flex items-center justify-between">
                <span className="text-[9px] text-zinc-500 font-mono">
                  {activeWall.toUpperCase()}
                </span>
                {customHex.length === 6 && /^[0-9a-fA-F]{6}$/.test(customHex) && (
                  <span className="text-[9px] text-emerald-400 font-medium">Valid</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

WallColorPicker.displayName = 'WallColorPicker';
