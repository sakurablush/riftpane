import React, { useCallback } from 'react';
import { SimulationConfig, WAVELENGTHS } from '../types';
import { LASER_WAVELENGTHS, UI_THEME } from '../constants';
import { WallColorPicker } from './WallColorPicker';

export interface BottomControlsProps {
  config: SimulationConfig;
  onUpdateConfig: (updates: Partial<SimulationConfig>) => void;
  activeWall: string;
  onActiveWallChange: (wall: string) => void;
  zDepth: number;
}

export const BottomControls: React.FC<BottomControlsProps> = React.memo(({
  config,
  onUpdateConfig,
  activeWall,
  onActiveWallChange,
  zDepth,
}) => {
  const handleWavelengthChange = useCallback(
    (nm: number) => {
      onUpdateConfig({ wavelength: nm });
    },
    [onUpdateConfig]
  );

  return (
    <div className="absolute bottom-3 md:bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto z-50 w-full max-w-6xl px-3 md:px-4 flex justify-center">
      <div
        className="flex items-center gap-1.5 md:gap-2 rounded-full py-1.5 px-2 md:px-3 shadow-2xl backdrop-blur-md max-w-full"
        style={{
          background: UI_THEME.surface.glass,
          border: `1px solid ${UI_THEME.surface.border}`,
        }}
      >
        {/* Laser Wavelength Selector */}
        <div className="flex items-center gap-1">
          <span className="text-[8px] text-sakura-300 font-bold tracking-[0.2em] uppercase hidden sm:block mr-1">LASER</span>
          <div className="flex items-center gap-0.5 md:gap-1">
            {LASER_WAVELENGTHS.map((nm) => {
              const preset = WAVELENGTHS[nm];
              const isActive = config.wavelength === nm;
              return (
                <button
                  key={nm}
                  onClick={() => handleWavelengthChange(nm)}
                  aria-label={`Select Laser Wavelength ${nm} nanometers`}
                  className={`inline-flex items-center justify-center gap-1 px-1.5 py-1 md:px-2.5 md:py-1.5 rounded-full text-[7px] md:text-[8px] font-bold tracking-wider transition-all duration-200 cursor-pointer border ${
                    isActive ? 'text-black' : ''
                  }`}
                  style={{
                    background: isActive ? preset.color : UI_THEME.surface.glassHover,
                    color: isActive ? '#000' : UI_THEME.sakura[200],
                    borderColor: isActive ? preset.color : UI_THEME.surface.border,
                    boxShadow: isActive ? `0 0 10px ${preset.glowColor}` : 'none',
                  }}
                >
                  <span
                    className="w-0.5 h-2 md:w-1 md:h-3 rounded-full shrink-0"
                    style={{ background: preset.color }}
                  />
                  <span className="leading-none">{nm}nm</span>
                </button>
              );
            })}
          </div>
        </div>

        <div
          className="w-px h-4 md:h-5 mx-0.5 md:mx-1 shrink-0"
          style={{ background: UI_THEME.surface.divider }}
        />

        {/* Wall Colors */}
        <WallColorPicker activeWall={activeWall} onActiveWallChange={onActiveWallChange} />

        <div
          className="w-px h-4 md:h-5 mx-0.5 md:mx-1 shrink-0 hidden sm:block"
          style={{ background: UI_THEME.surface.divider }}
        />

        {/* Info / Z-Depth */}
        <div className="hidden sm:flex items-center gap-2">
          <span
            className="text-[7px] md:text-[8px] tracking-[0.15em] uppercase leading-none"
            style={{ color: UI_THEME.sakura[400] }}
          >
            Z-DEPTH: {zDepth.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
});

BottomControls.displayName = 'BottomControls';
