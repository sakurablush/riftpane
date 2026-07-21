import React, { useCallback, useState } from 'react';
import { Settings2, Github, Globe, RotateCcw, Home, Heart, Eye, EyeOff } from 'lucide-react';
import { SimulationConfig, WAVELENGTHS } from '../types';
import { LASER_WAVELENGTHS, VERSION_LABELS, VERSION_NAMES, UI_THEME } from '../constants';
import { WallColorPicker } from './WallColorPicker';

interface ControlsProps {
  config: SimulationConfig;
  onUpdateConfig: (updates: Partial<SimulationConfig>) => void;
  activeWall: string;
  onActiveWallChange: (wall: string) => void;
  zDepth: number;
  hudVisible?: boolean;
  onToggleHud?: () => void;
  onResetPerf?: () => void;
  onResetCamera?: () => void;
}

// Compact single-line layout for all screens
export const TopControls: React.FC<Pick<ControlsProps, 'config' | 'onUpdateConfig' | 'hudVisible' | 'onToggleHud' | 'onResetPerf' | 'onResetCamera'>> = React.memo(({ config, onUpdateConfig, hudVisible = true, onToggleHud, onResetPerf, onResetCamera }) => {
  const handleShaderVersionChange = useCallback(
    (version: number) => {
      onUpdateConfig({ shaderVersion: version });
    },
    [onUpdateConfig]
  );

  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 pointer-events-auto z-50 w-full max-w-6xl px-3 md:px-4">
      <div
        className={`flex items-center gap-1.5 md:gap-2 rounded-full py-1.5 px-2 md:px-3 shadow-2xl backdrop-blur-md transition-all duration-300 ${
          hudVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
        style={{
          background: UI_THEME.surface.glass,
          border: `1px solid ${UI_THEME.surface.border}`,
        }}
      >
        {/* Version */}
        <div className="flex items-center gap-1 md:gap-1.5">
          <span className="text-[8px] text-sakura-300 font-bold tracking-[0.2em] uppercase hidden sm:block mr-1">Version</span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((v) => (
              <button
                key={v}
                onClick={() => handleShaderVersionChange(v)}
                aria-label={`Select Scene ${VERSION_LABELS[v - 1]}: ${VERSION_NAMES[v]}`}
                className={`w-7 h-7 md:w-8 md:h-8 rounded-full text-xs md:text-sm font-bold transition-all duration-200 cursor-pointer border ${
                  config.shaderVersion === v
                    ? 'text-black border-transparent scale-105'
                    : 'border-transparent hover:scale-110'
                }`}
                style={{
                  fontFamily: "'CodeOfReality', sans-serif",
                  background: config.shaderVersion === v
                    ? UI_THEME.sakura[400]
                    : UI_THEME.surface.glassHover,
                  color: config.shaderVersion === v
                    ? '#000'
                    : UI_THEME.sakura[200],
                  boxShadow: config.shaderVersion === v
                    ? `0 0 14px ${UI_THEME.sakura[500]}`
                    : 'none',
                }}
              >
                {VERSION_LABELS[v - 1]}
              </button>
            ))}
          </div>
        </div>

        <div
          className="w-px h-4 md:h-5 mx-1 shrink-0 hidden sm:block"
          style={{ background: UI_THEME.surface.divider }}
        />

        {/* Perf sliders - hidden on mobile */}
        <div className="hidden md:flex items-center gap-1.5">
          <PerfSlider
            label="Steps"
            min={10}
            max={600}
            step={5}
            value={config.raymarchSteps}
            onChange={useCallback((v: number) => onUpdateConfig({ raymarchSteps: v }), [onUpdateConfig])}
          />
          <PerfSlider
            label="Dist"
            min={10}
            max={120}
            step={1}
            value={config.raymarchDistance}
            onChange={useCallback((v: number) => onUpdateConfig({ raymarchDistance: v }), [onUpdateConfig])}
          />
          <PerfSlider
            label="Snow"
            min={0}
            max={3}
            step={0.1}
            value={config.snowIntensity}
            onChange={useCallback((v: number) => onUpdateConfig({ snowIntensity: v }), [onUpdateConfig])}
          />
          <PerfSlider
            label="Spark"
            min={0}
            max={3}
            step={0.1}
            value={config.sparkleIntensity}
            onChange={useCallback((v: number) => onUpdateConfig({ sparkleIntensity: v }), [onUpdateConfig])}
          />
        </div>

        <div
          className="w-px h-4 md:h-5 mx-1 shrink-0 hidden md:block"
          style={{ background: UI_THEME.surface.divider }}
        />

        {/* HUD + Resets */}
        <div className="flex items-center gap-1">
          {onToggleHud && (
            <button
              onClick={onToggleHud}
              aria-label={hudVisible ? 'Hide HUD' : 'Show HUD'}
              title={hudVisible ? 'Hide HUD' : 'Show HUD'}
              className="flex items-center justify-center w-6 h-6 rounded-full border cursor-pointer transition-all duration-200 hover:scale-110"
              style={{
                background: UI_THEME.surface.glassHover,
                color: UI_THEME.sakura[200],
                borderColor: UI_THEME.surface.border,
              }}
            >
              {hudVisible ? <Eye size={10} /> : <EyeOff size={10} />}
            </button>
          )}
          {onResetPerf && (
            <button
              onClick={onResetPerf}
              aria-label="Reset performance"
              title="Reset performance"
              className="flex items-center justify-center w-6 h-6 rounded-full border cursor-pointer transition-all duration-200 hover:scale-110"
              style={{
                background: UI_THEME.surface.glassHover,
                color: UI_THEME.sakura[200],
                borderColor: UI_THEME.surface.border,
              }}
            >
              <RotateCcw size={10} />
            </button>
          )}
          {onResetCamera && (
            <button
              onClick={onResetCamera}
              aria-label="Reset camera"
              title="Reset camera"
              className="flex items-center justify-center w-6 h-6 rounded-full border cursor-pointer transition-all duration-200 hover:scale-110"
              style={{
                background: UI_THEME.surface.glassHover,
                color: UI_THEME.sakura[200],
                borderColor: UI_THEME.surface.border,
              }}
            >
              <Home size={10} />
            </button>
          )}
        </div>

        {/* Tribute Links */}
        <div className="flex items-center gap-1 ml-auto">
          <a
            href="https://github.com/sakurablush/riftpane"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Riftpane on GitHub"
            className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-full text-[9px] md:text-[10px] font-medium transition-all duration-200 hover:scale-105"
            style={{
              background: UI_THEME.surface.glassHover,
              color: UI_THEME.sakura[200],
              border: `1px solid ${UI_THEME.surface.border}`,
            }}
          >
            <Github size={10} />
            <span>GitHub</span>
          </a>
          <a
            href="https://codeofreality.org/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Code of Reality community website"
            className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-full text-[9px] md:text-[10px] font-medium transition-all duration-200 hover:scale-105"
            style={{
              background: UI_THEME.surface.glassHover,
              color: UI_THEME.sakura[200],
              border: `1px solid ${UI_THEME.surface.border}`,
            }}
          >
            <Globe size={10} />
            <span>CoR</span>
          </a>
          <a
            href="https://discord.gg/invite/codeofreality"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Join Code of Reality Discord"
            title="Join CoR Discord"
            className="flex items-center justify-center w-7 h-7 rounded-full border cursor-pointer transition-all duration-200 hover:scale-110"
            style={{
              background: UI_THEME.surface.glassHover,
              color: UI_THEME.sakura[200],
              borderColor: UI_THEME.surface.border,
            }}
          >
            <Heart size={10} />
          </a>
        </div>
      </div>
    </div>
  );
});

TopControls.displayName = 'TopControls';

const PerfSlider = React.memo(({
  label,
  min,
  max,
  step,
  value,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
}) => (
  <div
    className="flex items-center gap-1 px-2 py-1 rounded-full"
    style={{ background: UI_THEME.surface.glassHover }}
  >
    <span
      className="text-[8px] tracking-widest uppercase font-bold w-6 text-right"
      style={{ color: UI_THEME.sakura[300] }}
    >
      {label}
    </span>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      aria-label={`Performance parameter ${label}`}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-8 lg:w-10 h-1 cursor-pointer accent-pink-400"
    />
  </div>
));

PerfSlider.displayName = 'PerfSlider';

export const BottomControls: React.FC<ControlsProps> = React.memo(({
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
        <div className="flex items-center gap-1 md:gap-1.5">
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
