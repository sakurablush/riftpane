import React, { useState } from 'react';
import { Play, Pause, Settings2 } from 'lucide-react';
import { LaserCanvas } from './components/LaserCanvas';
import { WAVELENGTHS, SimulationConfig } from './types';

const DEFAULT_CONFIG: SimulationConfig = {
  wavelength: 650,
  intensity: 0.8,
  speckleContrast: 0.8,
  speckleGrain: 1.5,
  speckleSpeed: 1.0,
  parallaxStrength: 1.0,
  zoomLevel: 1.0,
  glitchRate: 0.1,
  audioVolume: true,
  audioVolumeLevel: 0.5,
  audioType: 'ambient',
  showMicroscope: true,
  showNearestLayer: true,
  showChurningWall: true,
  showMembrane: true,
  showArchipelago: true,
  showArchitecture: true,
  raymarchSteps: 90,
  raymarchDistance: 60.0,
  snowIntensity: 1.0,
  sparkleIntensity: 1.0,
  shaderVersion: 1,
};

export default function App() {
  const [config, setConfig] = useState<SimulationConfig>(DEFAULT_CONFIG);
  const [activeWall, setActiveWall] = useState('#050000');
  const [zDepth, setZDepth] = useState(0.5);

  const lasers = [650, 532, 488, 450, 405];
  const walls = ['#050000', '#1a1a2e', '#0f2027', '#2a0800', '#0a1a10', '#301020', '#111111', '#1f2937'];

  const handleUpdateConfig = (updates: Partial<SimulationConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const preset = WAVELENGTHS[config.wavelength] || WAVELENGTHS[650];

  return (
    <div className="w-screen h-screen bg-black overflow-hidden font-mono select-none">
      <LaserCanvas 
        config={config} 
        wallColor={activeWall} 
        onZDepthChange={setZDepth}
      />
      
      {/* Top Center Performance Pill */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 pointer-events-auto z-50">
        <div className="bg-[#0a0a0a]/40 border border-zinc-800/60 rounded-full py-2.5 px-6 flex items-center gap-5 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-2 mr-2">
            <Settings2 size={14} className="text-zinc-400" />
            <span className="text-zinc-100 text-[10px] font-bold tracking-[0.2em]">PERF</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-zinc-400 text-[9px] tracking-widest uppercase font-bold w-16 text-right">Steps: {config.raymarchSteps}</span>
            <input 
              type="range" min="10" max="600" step="5"
              value={config.raymarchSteps}
              onChange={(e) => handleUpdateConfig({ raymarchSteps: parseInt(e.target.value) })}
              className="w-16 accent-zinc-300 h-1"
            />
          </div>

          <div className="w-px h-4 bg-zinc-700/50" />

          <div className="flex items-center gap-2">
            <span className="text-zinc-400 text-[9px] tracking-widest uppercase font-bold w-16 text-right">Dist: {Math.round((config.raymarchDistance / 60) * 100)}%</span>
            <input 
              type="range" min="10" max="120" step="1"
              value={config.raymarchDistance}
              onChange={(e) => handleUpdateConfig({ raymarchDistance: parseInt(e.target.value) })}
              className="w-16 accent-zinc-300 h-1"
            />
          </div>

          <div className="w-px h-4 bg-zinc-700/50" />

          <div className="flex items-center gap-2">
            <span className="text-zinc-400 text-[9px] tracking-widest uppercase font-bold w-16 text-right">Snow: {Math.round(config.snowIntensity * 100)}%</span>
            <input 
              type="range" min="0" max="8" step="0.1"
              value={config.snowIntensity}
              onChange={(e) => handleUpdateConfig({ snowIntensity: parseFloat(e.target.value) })}
              className="w-16 accent-zinc-300 h-1"
            />
          </div>

          <div className="w-px h-4 bg-zinc-700/50" />

          <div className="flex items-center gap-2">
            <span className="text-zinc-400 text-[9px] tracking-widest uppercase font-bold w-16 text-right">Spark: {Math.round(config.sparkleIntensity * 100)}%</span>
            <input 
              type="range" min="0" max="8" step="0.1"
              value={config.sparkleIntensity}
              onChange={(e) => handleUpdateConfig({ sparkleIntensity: parseFloat(e.target.value) })}
              className="w-16 accent-zinc-300 h-1"
            />
          </div>
        </div>
      </div>

      {/* Top Center Version Pill */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 pointer-events-auto z-50">
        <div className="bg-[#0a0a0a]/40 border border-zinc-800/60 rounded-full py-2 px-6 flex items-center gap-4 shadow-2xl backdrop-blur-md">
          <span className="text-zinc-400 text-[10px] tracking-[0.2em] font-bold uppercase">Version</span>
          <div className="flex items-center gap-2">
            {[1, 2].map((v) => (
              <button
                key={v}
                onClick={() => handleUpdateConfig({ shaderVersion: v })}
                className={`w-8 h-8 rounded-full text-[10px] font-bold transition-all ${
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
      </div>

      {/* Top Right HUD */}
      <div className="absolute top-6 right-6 flex flex-col items-end gap-3 pointer-events-none z-50">
        <div className="pointer-events-auto bg-[#0a0a0a]/40 border border-zinc-800/60 rounded-full p-2 flex items-center shadow-2xl backdrop-blur-md transition-colors">
          <button 
            onClick={() => handleUpdateConfig({ audioVolume: !config.audioVolume })}
            className="w-12 h-12 rounded-full bg-zinc-800/80 flex items-center justify-center hover:bg-zinc-700 transition-colors cursor-pointer group"
          >
            {config.audioVolume ? (
              <Pause size={18} className="text-zinc-200 group-hover:scale-110 transition-transform" fill="currentColor" />
            ) : (
              <Play size={18} className="text-zinc-200 group-hover:scale-110 transition-transform ml-1" fill="currentColor" />
            )}
          </button>
        </div>

        <div className="pointer-events-auto bg-[#0a0a0a]/40 border border-zinc-800/60 rounded-xl py-3 px-5 flex flex-col items-end gap-2 shadow-xl backdrop-blur-md">
          <span className="text-zinc-500 text-[8px] tracking-[0.2em] uppercase">HOLD CLICK TO LOOK // SCROLL TO ZOOM</span>
          <span className="text-zinc-400 text-[8px] tracking-[0.2em] uppercase font-bold">Z-DEPTH: {zDepth.toFixed(2)}</span>
        </div>
      </div>

      {/* Bottom Center Pill Controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-auto z-50">
        <div className="bg-[#0a0a0a]/40 border border-zinc-800/60 rounded-full p-2 flex items-center gap-6 shadow-2xl backdrop-blur-md">
          
          <div className="flex items-center gap-3 pl-4">
            <span className="text-zinc-500 text-[9px] tracking-[0.2em] font-bold mt-0.5">LASER</span>
            <div className="flex items-center gap-1.5">
              {lasers.map(nm => (
                <button
                  key={nm}
                  onClick={() => handleUpdateConfig({ wavelength: nm })}
                  className={`px-3 py-1.5 rounded-full text-[9px] font-bold tracking-widest transition-all cursor-pointer ${
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

          <div className="w-px h-5 bg-zinc-800" />

          <div className="flex items-center gap-3 pr-4">
            <span className="text-zinc-500 text-[9px] tracking-[0.2em] font-bold mt-0.5">WALL</span>
            <div className="flex items-center gap-2">
              {walls.map(color => (
                <button
                  key={color}
                  onClick={() => setActiveWall(color)}
                  className={`w-5 h-5 rounded-full border-2 transition-all cursor-pointer ${
                    activeWall === color ? 'border-zinc-300 scale-110' : 'border-zinc-800 hover:border-zinc-600'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

        </div>
      </div>
      
      {/* Soft overlay vignette / blend */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.9)]" />
    </div>
  );
}
