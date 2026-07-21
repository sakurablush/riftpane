import React, { useState, useCallback } from 'react';
import { LaserCanvas } from './components/LaserCanvas';
import { TopControls, BottomControls } from './components/Controls';
import { SimulationConfig } from './types';
import { DEFAULT_PERF_CONFIG, DEFAULT_Z_DEPTH, DEFAULT_WALL_COLOR, WALL_COLORS } from './constants';

const DEFAULT_CONFIG: SimulationConfig = {
  wavelength: 650,
  intensity: 0.8,
  speckleContrast: 0.8,
  speckleGrain: 1.5,
  speckleSpeed: 1.0,
  parallaxStrength: 1.0,
  zoomLevel: 1.0,
  glitchRate: 0.1,
  noiseLevel: 0.5,
  dofFocus: 0.5,
  dofStrength: 0.5,
  microscopeX: 0.5,
  microscopeY: 0.5,
  showMicroscope: true,
  showNearestLayer: true,
  showChurningWall: true,
  showMembrane: true,
  showArchipelago: true,
  showArchitecture: true,
  ...DEFAULT_PERF_CONFIG,
  shaderVersion: 1,
};

export default function App() {
  const [config, setConfig] = useState<SimulationConfig>(DEFAULT_CONFIG);
  const [activeWall, setActiveWall] = useState<string>(DEFAULT_WALL_COLOR);
  const [zDepth, setZDepth] = useState<number>(DEFAULT_Z_DEPTH);

  const handleUpdateConfig = useCallback((updates: Partial<SimulationConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleActiveWallChange = useCallback((wallHex: string) => {
    setActiveWall(wallHex);
  }, []);

  const handleZDepthChange = useCallback((depth: number) => {
    setZDepth(depth);
  }, []);

  return (
    <div className="w-screen h-screen bg-black overflow-hidden font-mono select-none">
      <LaserCanvas
        config={config}
        wallColor={activeWall}
        onZDepthChange={handleZDepthChange}
      />
      <TopControls config={config} onUpdateConfig={handleUpdateConfig} />
      <BottomControls
        config={config}
        onUpdateConfig={handleUpdateConfig}
        activeWall={activeWall}
        onActiveWallChange={handleActiveWallChange}
        zDepth={zDepth}
      />
      {/* Soft overlay vignette / blend */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.9)]" />
    </div>
  );
}
