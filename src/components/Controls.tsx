import React, { useCallback } from 'react';
import { Settings2, Github, Globe, RotateCcw, Home } from 'lucide-react';
import { SimulationConfig, WAVELENGTHS } from '../types';
import { LASER_WAVELENGTHS, VERSION_LABELS, VERSION_NAMES, UI_THEME, DEFAULT_PERF_CONFIG } from '../constants';
import { WallColorPicker } from './WallColorPicker';

interface ControlsProps {
  config: SimulationConfig;
  onUpdateConfig: (updates: Partial<SimulationConfig>) => void;
  activeWall: string;
  onActiveWallChange: (wall: string) => void;
  zDepth: number;
  onResetPerf?: () => void;
  onResetCamera?: () => void;
}

export const TopControls: React.FC<Pick<ControlsProps, 'config' | 'onUpdateConfig' | 'onResetPerf' | 'onResetCamera'>> = React.memo(({ config, onUpdateConfig, onResetPerf, onResetCamera }) => {
  const handleShaderVersionChange = useCallback(
    (version: number) => {
      onUpdateConfig({ shaderVersion: version });
    },
    [onUpdateConfig]
  );

  return (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 pointer-events-auto z-50 w-full max-w-6xl px-4 md:px-6">
      <div
        className="flex items-center shadow-2xl backdrop-blur-md rounded-full py-2 px-2.5 md:px-3"
        style={{
          background: UI_THEME.surface.glass,
          border: `1px solid ${UI_THEME.surface.border}`,
        }}
      >
        {/* Left: Version Selector with CodeOfReality font letters */}
        <div className="flex items-center gap-2 pl-1 md:pl-2">
          <span
            className="text-[9px] md:text-[10px] tracking-[0.2em] font-bold uppercase hidden sm:block mr-1"
            style={{ color: UI_THEME.sakura[300] }}
          >
            Version
          </span>
          <div className="flex items-center gap-1.5 md:gap-2">
            {[1, 2, 3, 4, 5].map((v) => (
              <button
                key={v}
                onClick={() => handleShaderVersionChange(v)}
                aria-label={`Select Scene ${VERSION_LABELS[v - 1]}: ${VERSION_NAMES[v]}`}
                className={`w-8 h-8 md:w-9 md:h-9 rounded-full text-sm md:text-base font-bold transition-all duration-200 cursor-pointer border ${
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
                    ? `0 0 16px ${UI_THEME.sakura[500]}`
                    : 'none',
                }}
              >
                {VERSION_LABELS[v - 1]}
              </button>
            ))}
          </div>
        </div>

        <div
          className="w-px h-5 md:h-6 mx-2 md:mx-3 shrink-0 hidden md:block"
          style={{ background: UI_THEME.surface.divider }}
        />

        {/* Center: Performance Controls */}
        <div className="hidden md:flex items-center gap-2 lg:gap-3">
          <div className="flex items-center gap-1.5">
            <Settings2 size={12} style={{ color: UI_THEME.sakura[400] }} />
            <span
              className="text-[9px] font-bold tracking-[0.2em]"
              style={{ color: UI_THEME.sakura[200] }}
            >
              PERF
            </span>
          </div>
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

        <div className="w-px h-5 md:h-6 mx-2 md:mx-3 shrink-0 hidden md:block" style={{ background: UI_THEME.surface.divider }} />

        {/* Right: Resets + Tribute Links */}
        <div className="hidden md:flex items-center gap-2 ml-auto pl-2">
          <div className="flex items-center gap-1">
            <button
              onClick={onResetPerf}
              aria-label="Reset performance settings"
              title="Reset performance"
              className="flex items-center justify-center w-7 h-7 rounded-full border cursor-pointer transition-all duration-200 hover:scale-110"
              style={{
                background: UI_THEME.surface.glassHover,
                color: UI_THEME.sakura[200],
                borderColor: UI_THEME.surface.border,
              }}
            >
              <RotateCcw size={10} />
            </button>
            <button
              onClick={onResetCamera}
              aria-label="Reset camera position"
              title="Reset camera"
              className="flex items-center justify-center w-7 h-7 rounded-full border cursor-pointer transition-all duration-200 hover:scale-110"
              style={{
                background: UI_THEME.surface.glassHover,
                color: UI_THEME.sakura[200],
                borderColor: UI_THEME.surface.border,
              }}
            >
              <Home size={10} />
            </button>
          </div>
          <a
            href="https://github.com/sakurablush/riftpane"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Riftpane on GitHub"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-medium transition-all duration-200 hover:scale-105"
            style={{
              background: UI_THEME.surface.glassHover,
              color: UI_THEME.sakura[200],
              border: `1px solid ${UI_THEME.surface.border}`,
            }}
          >
            <Github size={12} />
            <span>GitHub</span>
          </a>
          <a
            href="https://codeofreality.org/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Code of Reality community website"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-medium transition-all duration-200 hover:scale-105"
            style={{
              background: UI_THEME.surface.glassHover,
              color: UI_THEME.sakura[200],
              border: `1px solid ${UI_THEME.surface.border}`,
            }}
          >
            <Globe size={12} />
            <span>CoR</span>
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
    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full"
    style={{ background: UI_THEME.surface.glassHover }}
  >
    <span
      className="text-[9px] tracking-widest uppercase font-bold w-8 text-right"
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
      className="w-10 lg:w-14 h-1 cursor-pointer accent-pink-400"
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
    <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 pointer-events-auto z-50 w-full max-w-6xl px-4 md:px-6 flex justify-center">
      <div
        className="flex items-center shadow-2xl backdrop-blur-md rounded-full py-2 px-2.5 md:px-3 max-w-full"
        style={{
          background: UI_THEME.surface.glass,
          border: `1px solid ${UI_THEME.surface.border}`,
        }}
      >
        {/* Left: Laser Wavelength Selector with color indicators */}
        <div className="flex items-center gap-2 md:gap-3 pl-1 md:pl-2">
          <span
            className="text-[9px] tracking-[0.2em] font-bold mt-0.5 hidden sm:block"
            style={{ color: UI_THEME.sakura[300] }}
          >
            LASER
          </span>
          <div className="flex items-center gap-1 md:gap-1.5">
            {LASER_WAVELENGTHS.map((nm) => {
              const preset = WAVELENGTHS[nm];
              const isActive = config.wavelength === nm;
              return (
                <button
                  key={nm}
                  onClick={() => handleWavelengthChange(nm)}
                  aria-label={`Select Laser Wavelength ${nm} nanometers`}
                  className={`relative inline-flex items-center justify-center gap-1.5 px-2 py-1 md:px-3 md:py-1.5 rounded-full text-[8px] md:text-[9px] font-bold tracking-widest transition-all duration-200 cursor-pointer border ${
                    isActive ? 'text-black' : ''
                  }`}
                  style={{
                    background: isActive ? preset.color : UI_THEME.surface.glassHover,
                    color: isActive ? '#000' : UI_THEME.sakura[200],
                    borderColor: isActive ? preset.color : UI_THEME.surface.border,
                    boxShadow: isActive ? `0 0 12px ${preset.glowColor}` : 'none',
                  }}
                >
                  <span
                    className="w-1 h-3 md:w-1.5 md:h-4 rounded-full shrink-0"
                    style={{ background: preset.color }}
                  />
                  <span className="leading-none">{nm}nm</span>
                </button>
              );
            })}
          </div>
        </div>

        <div
          className="w-px h-5 md:h-6 mx-2 md:mx-3 shrink-0"
          style={{ background: UI_THEME.surface.divider }}
        />

        {/* Center: Wall Colors */}
        <WallColorPicker activeWall={activeWall} onActiveWallChange={onActiveWallChange} />

        <div
          className="w-px h-5 md:h-6 mx-2 md:mx-3 shrink-0 hidden sm:block"
          style={{ background: UI_THEME.surface.divider }}
        />

        {/* Right: Info / Z-Depth */}
        <div className="hidden sm:flex items-center pr-1 md:pr-2">
          <div className="flex flex-col items-end justify-center gap-0.5">
            <span
              className="text-[7px] md:text-[8px] tracking-[0.2em] uppercase leading-none"
              style={{ color: UI_THEME.sakura[400] }}
            >
              HOLD CLICK TO LOOK // SCROLL TO ZOOM
            </span>
            <span
              className="text-[7px] md:text-[8px] tracking-[0.2em] uppercase font-bold leading-none mt-1"
              style={{ color: UI_THEME.sakura[200] }}
            >
              Z-DEPTH: {zDepth.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

BottomControls.displayName = 'BottomControls';
