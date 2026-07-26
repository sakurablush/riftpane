// Laser Preset Interface
export interface LaserPreset {
  nm: number;
  name: string;
  color: [number, number, number];
  hex: string;
  complementary: string;
}

// Wall Color Interface
export interface WallColor {
  name: string;
  color: [number, number, number];
  hex: string;
}

// Render Shader Settings Interface
export interface RenderShaderSettings {
  slitWidth: number;
  steps: number;
  maxDist: number;
  snowDensity: number;
  diffractionIntensity: number;
}

// App State Interface
export interface AppState {
  laserNm: number;
  wallHex: string;
  wallRgb: [number, number, number];
  hudVisible: boolean;
  showDisclaimer: boolean;
  activeVersionIdx: number;
  crtGlitch: boolean;
}