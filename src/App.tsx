import React, { useState, useCallback } from 'react';
import { LaserCanvas } from './components/LaserCanvas';
import { TopControls } from './components/TopControls';
import { BottomControls } from './components/BottomControls';
import { SimulationConfig } from './types';
import { Eye, EyeOff } from 'lucide-react';
import { DEFAULT_PERF_CONFIG, DEFAULT_Z_DEPTH, DEFAULT_WALL_COLOR, WALL_COLORS, UI_THEME } from './constants';

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
  const [resetKey, setResetKey] = useState(0);
  const [hudVisible, setHudVisible] = useState(true);

  const handleUpdateConfig = useCallback((updates: Partial<SimulationConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleActiveWallChange = useCallback((wallHex: string) => {
    setActiveWall(wallHex);
  }, []);

  const handleZDepthChange = useCallback((depth: number) => {
    setZDepth(depth);
  }, []);

  const handleResetPerf = useCallback(() => {
    setConfig((prev) => ({ ...prev, ...DEFAULT_PERF_CONFIG }));
  }, []);

  const handleResetCamera = useCallback(() => {
    setResetKey((k) => k + 1);
  }, []);

  const handleToggleHud = useCallback(() => {
    setHudVisible((prev) => !prev);
  }, []);

  return (
    <div className="w-screen h-screen bg-black overflow-hidden font-mono select-none">
      <LaserCanvas
        config={config}
        wallColor={activeWall}
        onZDepthChange={handleZDepthChange}
        resetKey={resetKey}
      />
      {hudVisible && (
        <>
          <TopControls
            config={config}
            onUpdateConfig={handleUpdateConfig}
            onResetPerf={handleResetPerf}
            onResetCamera={handleResetCamera}
            hudVisible={hudVisible}
            onToggleHud={handleToggleHud}
          />
          <BottomControls
            config={config}
            onUpdateConfig={handleUpdateConfig}
            activeWall={activeWall}
            onActiveWallChange={handleActiveWallChange}
            zDepth={zDepth}
          />
        </>
      )}
      {/* HUD Toggle Button - always visible when HUD is hidden */}
      {!hudVisible && (
        <button
          onClick={handleToggleHud}
          aria-label="Show HUD"
          title="Show HUD"
          className="absolute top-3 right-3 z-50 flex items-center justify-center w-10 h-10 rounded-full border cursor-pointer transition-all duration-200 hover:scale-110"
          style={{
            background: UI_THEME.surface.glass,
            color: UI_THEME.sakura[200],
            borderColor: UI_THEME.surface.border,
            boxShadow: '0 0 20px rgba(255, 112, 150, 0.3)',
          }}
        >
          <Eye size={16} />
        </button>
      )}
      {/* Soft overlay vignette / blend */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.9)]" />
    </div>
  );
}
