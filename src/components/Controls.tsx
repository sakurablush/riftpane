import React from 'react';
import { Settings2 } from 'lucide-react';
import { SimulationConfig } from '../types';
import { LASER_WAVELENGTHS, WALL_COLORS } from '../constants';

interface ControlsProps {
  config: SimulationConfig;
  onUpdateConfig: (updates: Partial<SimulationConfig>) => void;
  activeWall: string;
  onActiveWallChange: (wall: string) => void;
  zDepth: number;
}

export const TopControls: React.FC<Pick<ControlsProps, 'config' | 'onUpdateConfig'>> = ({ config, onUpdateConfig }) => {
  return (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 pointer-events-auto z-50 w-full max-w-6xl px-4 md:px-6">
      <div className="bg-[#0a0a0a]/40 border border-zinc-800/60 rounded-full py-2 px-2 md:px-3 flex items-center justify-between shadow-2xl backdrop-blur-md">
        {/* Left: Versions */}
        <div className="flex items-center gap-2 pl-2 md:pl-4">
          <span className="text-zinc-400 text-[9px] md:text-[10px] tracking-[0.2em] font-bold uppercase hidden sm:block mr-2">Version</span>
          <div className="flex items-center gap-1.5 md:gap-2">
            {[1, 2, 3, 4, 5].map((v) => (
              <button
                key={v}
                onClick={() => onUpdateConfig({ shaderVersion: v })}
                className={`w-7 h-7 md:w-8 md:h-8 rounded-full text-[9px] md:text-[10px] font-bold transition-all ${
                  config.shaderVersion === v
                    ? 'bg-zinc-200 text-black'
                    : 'bg-zinc-800/80 text-zinc-400 hover:bg-zinc-700'
                }`}
              >
                V{v}
              </button>
            ))}
          </div>
        </div>
        <div className="w-px h-6 bg-zinc-700/50 mx-2 hidden lg:block" />
        {/* Center: Performance Controls */}
        <div className="hidden lg:flex items-center justify-center flex-1 gap-2 xl:gap-4">
          <div className="flex items-center gap-1.5 mr-2">
            <Settings2 size={12} className="text-zinc-400" />
            <span className="text-zinc-100 text-[9px] font-bold tracking-[0.2em]">PERF</span>
          </div>
          <PerfSlider label="Steps" min={10} max={600} step={5} value={config.raymarchSteps} onChange={(v) => onUpdateConfig({ raymarchSteps: v })} />
          <PerfSlider label="Dist" min={10} max={120} step={1} value={config.raymarchDistance} onChange={(v) => onUpdateConfig({ raymarchDistance: v })} />
          <PerfSlider label="Snow" min={0} max={8} step={0.1} value={config.snowIntensity} onChange={(v) => onUpdateConfig({ snowIntensity: v })} />
          <PerfSlider label="Spark" min={0} max={8} step={0.1} value={config.sparkleIntensity} onChange={(v) => onUpdateConfig({ sparkleIntensity: v })} />
        </div>
        <div className="w-px h-6 bg-zinc-700/50 mx-2 hidden lg:block" />
      </div>
    </div>
  );
};

const PerfSlider = ({ label, min, max, step, value, onChange }: { label: string, min: number, max: number, step: number, value: number, onChange: (v: number) => void }) => (
  <div className="flex items-center gap-2 bg-zinc-900/40 px-3 py-1.5 rounded-full">
    <span className="text-zinc-400 text-[9px] tracking-widest uppercase font-bold w-10 text-right">{label}</span>
    <input 
      type="range" min={min} max={max} step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-12 xl:w-16 accent-zinc-300 h-1"
    />
  </div>
);

export const BottomControls: React.FC<ControlsProps> = ({ config, onUpdateConfig, activeWall, onActiveWallChange, zDepth }) => {
  return (
    <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 pointer-events-auto z-50 w-full max-w-6xl px-4 md:px-6 flex justify-center">
      <div className="bg-[#0a0a0a]/40 border border-zinc-800/60 rounded-full p-2 flex items-center shadow-2xl backdrop-blur-md overflow-x-auto no-scrollbar max-w-full">
        <div className="flex items-center gap-2 md:gap-3 pl-2 md:pl-4 shrink-0">
          <span className="text-zinc-500 text-[9px] tracking-[0.2em] font-bold mt-0.5 hidden sm:block">LASER</span>
          <div className="flex items-center gap-1 md:gap-1.5">
            {LASER_WAVELENGTHS.map(nm => (
              <button
                key={nm}
                onClick={() => onUpdateConfig({ wavelength: nm })}
                className={`px-2 py-1 md:px-3 md:py-1.5 rounded-full text-[8px] md:text-[9px] font-bold tracking-widest transition-all cursor-pointer ${
                  config.wavelength === nm 
                    ? 'bg-zinc-200 text-black shadow-[0_0_10px_rgba(255,255,255,0.2)]' 
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                }`}
              >
                {nm}nm
              </button>
            ))}
          </div>
        </div>
        <div className="w-px h-5 md:h-6 bg-zinc-700/50 mx-3 md:mx-4 shrink-0" />
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          <span className="text-zinc-500 text-[9px] tracking-[0.2em] font-bold mt-0.5 hidden sm:block">WALL</span>
          <div className="flex items-center gap-1.5 md:gap-2">
            {WALL_COLORS.map(color => (
              <button
                key={color}
                onClick={() => onActiveWallChange(color)}
                className={`w-4 h-4 md:w-5 md:h-5 rounded-full border-2 transition-all cursor-pointer ${
                  activeWall === color ? 'border-zinc-300 scale-110' : 'border-zinc-800 hover:border-zinc-600'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
        <div className="w-px h-5 md:h-6 bg-zinc-700/50 mx-3 md:mx-4 shrink-0 hidden lg:block" />
        <div className="hidden lg:flex items-center pr-4 shrink-0">
          <div className="flex flex-col items-end justify-center gap-0.5">
            <span className="text-zinc-500 text-[7px] md:text-[8px] tracking-[0.2em] uppercase leading-none">HOLD CLICK TO LOOK // SCROLL TO ZOOM</span>
            <span className="text-zinc-400 text-[7px] md:text-[8px] tracking-[0.2em] uppercase font-bold leading-none mt-1">Z-DEPTH: {zDepth.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
