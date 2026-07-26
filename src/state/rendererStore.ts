// Renderer Store — laser, wall, shader settings
import { create } from 'zustand';
import { hexToRgb } from '../utils/color';
import { DEFAULT_SETTINGS, WALL_COLORS, DEFAULT_LASER_NM, DEFAULT_WALL_HEX, LASER_PRESETS } from '../utils/constants';
import type { RenderShaderSettings } from '../types';

interface RendererState extends RenderShaderSettings {
  laserNm: number;
  laserHex: string;
  laserRgb: readonly [number, number, number];
  wallHex: string;
  wallRgb: readonly [number, number, number];
  activeVersionIdx: number;
  fps: number;
  setLaserNm: (v: number) => void;
  setSlitWidth: (v: number) => void;
  setSteps: (v: number) => void;
  setMaxDist: (v: number) => void;
  setSnowDensity: (v: number) => void;
  setDiffractionIntensity: (v: number) => void;
  setWall: (hex: string, rgb: readonly [number, number, number]) => void;
  setWallHex: (hex: string) => void;
  setVersionIdx: (v: number) => void;
  setFps: (v: number) => void;
  resetSettings: () => void;
}

const defaultLaser = LASER_PRESETS[DEFAULT_LASER_NM];
const defaultWall = WALL_COLORS.find((c) => c.hex === DEFAULT_WALL_HEX) ?? WALL_COLORS[0];
const defaultWallRgb = hexToRgb(defaultWall.hex);

export const useRendererStore = create<RendererState>()((set) => ({
  ...DEFAULT_SETTINGS,
  laserNm: DEFAULT_LASER_NM,
  laserHex: defaultLaser.hex,
  laserRgb: defaultLaser.color,
  wallHex: defaultWall.hex,
  wallRgb: defaultWallRgb,
  activeVersionIdx: 0,
  fps: 60,
  setLaserNm: (v) => {
    const preset = LASER_PRESETS[v];
    if (!preset) return;
    set({ laserNm: v, laserHex: preset.hex, laserRgb: preset.color });
  },
  setSlitWidth: (v) => set({ slitWidth: v }),
  setSteps: (v) => set({ steps: v }),
  setMaxDist: (v) => set({ maxDist: v }),
  setSnowDensity: (v) => set({ snowDensity: v }),
  setDiffractionIntensity: (v) => set({ diffractionIntensity: v }),
  setWall: (hex, rgb) => set({ wallHex: hex, wallRgb: rgb }),
  setWallHex: (hex) => set((s) => ({ wallHex: hex })),
  setVersionIdx: (v) => set({ activeVersionIdx: v }),
  setFps: (v) => set({ fps: v }),
  resetSettings: () => set({
    ...DEFAULT_SETTINGS,
    laserNm: DEFAULT_LASER_NM,
    laserHex: defaultLaser.hex,
    laserRgb: defaultLaser.color,
    wallHex: defaultWall.hex,
    wallRgb: defaultWallRgb,
  }),
}));