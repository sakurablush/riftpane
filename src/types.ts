export interface WavelengthPreset {
  nm: number;
  name: string;
  color: string; // Primary CSS color
  glowColor: string; // Secondary/Complementary glow color
  baseRgb: [number, number, number]; // RGB representation
  glowRgb: [number, number, number]; // RGB representation of glow
  grainSize: number; // Speckle grain size based on wavelength (longer = larger)
  frequencyFactor: number; // Modulator for sound hum pitch
}

export interface SimulationConfig {
  wavelength: number; // 650, 532, 488, 450, 405
  intensity: number; // 0.1 to 1.0
  speckleContrast: number; // 0 to 1
  speckleSpeed: number; // 0 to 2
  speckleGrain: number; // multiplier
  parallaxStrength: number; // 0 to 2
  zoomLevel: number; // 0.5 to 3.0
  glitchRate: number; // 0 to 1
  noiseLevel: number; // 0 to 1
  dofFocus: number; // Depth of field focus plane (0 to 1)
  dofStrength: number; // Depth of field blur amount
  showNearestLayer: boolean;
  showChurningWall: boolean;
  showMembrane: boolean;
  showArchipelago: boolean;
  showArchitecture: boolean;
  showMicroscope: boolean; // Hover magnifying glass to see Katakana glyphs
  microscopeX: number;
  microscopeY: number;
  audioVolume: boolean;
  audioVolumeLevel: number; // 0 to 1
  audioType: 'coherent' | 'ambient' | 'pulsing';
  // Graphics & Performance settings
  raymarchSteps: number; // 10 to 120 (default 90)
  raymarchDistance: number; // 10 to 100 (default 60)
  snowIntensity: number; // 0.0 to 1.0 (default 1.0)
  sparkleIntensity: number; // 0.0 to 1.0 (default 1.0)
  shaderVersion: number; // 1 or 2
}

export const WAVELENGTHS: Record<number, WavelengthPreset> = {
  650: {
    nm: 650,
    name: 'Red',
    color: 'rgb(255, 0, 40)',
    glowColor: 'rgb(255, 90, 0)', // Warm orange
    baseRgb: [255, 0, 40],
    glowRgb: [255, 90, 0],
    grainSize: 3.5, // Red has larger physical speckle size
    frequencyFactor: 1.0, // Low bass hum
  },
  532: {
    nm: 532,
    name: 'Green',
    color: 'rgb(0, 255, 70)',
    glowColor: 'rgb(210, 255, 0)', // Yellowish gold
    baseRgb: [0, 255, 70],
    glowRgb: [210, 255, 0],
    grainSize: 2.9,
    frequencyFactor: 1.3,
  },
  488: {
    nm: 488,
    name: 'Cyan',
    color: 'rgb(0, 235, 255)',
    glowColor: 'rgb(0, 255, 140)', // Ice blue/teal glow
    baseRgb: [0, 235, 255],
    glowRgb: [0, 255, 140],
    grainSize: 2.6,
    frequencyFactor: 1.5,
  },
  450: {
    nm: 450,
    name: 'Blue',
    color: 'rgb(0, 70, 255)',
    glowColor: 'rgb(180, 0, 255)', // Royal blue with violet/magenta glow
    baseRgb: [0, 70, 255],
    glowRgb: [180, 0, 255],
    grainSize: 2.3,
    frequencyFactor: 1.8,
  },
  405: {
    nm: 405,
    name: 'Violet (Near UV)',
    color: 'rgb(130, 0, 255)',
    glowColor: 'rgb(240, 220, 255)', // Eerie lavender/white glow
    baseRgb: [130, 0, 255],
    glowRgb: [240, 220, 255],
    grainSize: 1.9, // Violet has tiny physical speckle size
    frequencyFactor: 2.2, // High frequency hum
  },
};

export interface LaserPreset {
  name: string;
  description: string;
  config: Partial<SimulationConfig>;
}

export const SIM_PRESETS: Record<string, LaserPreset> = {
  coherent: {
    name: 'Coherent Beam',
    description: 'Perfect focus on the raw diffracted cross and sharp physical speckles.',
    config: {
      intensity: 0.9,
      speckleContrast: 0.9,
      speckleSpeed: 0.4,
      parallaxStrength: 0.5,
      zoomLevel: 1.0,
      glitchRate: 0.1,
      dofFocus: 0.1, // Focus on nearest layer
      dofStrength: 2,
    },
  },
  cavern: {
    name: 'Cavern Explorer',
    description: 'Breathe in the vastness of the hollow obelisks and floating island massifs.',
    config: {
      intensity: 0.7,
      speckleContrast: 0.6,
      speckleSpeed: 0.8,
      parallaxStrength: 1.5,
      zoomLevel: 0.8,
      glitchRate: 0.2,
      dofFocus: 0.8, // Focus on deepest layer
      dofStrength: 4,
    },
  },
  quantum: {
    name: 'Quantum Glitch',
    description: 'Unstable reality grid with high-speed static and chromatic decay.',
    config: {
      intensity: 0.8,
      speckleContrast: 0.8,
      speckleSpeed: 1.8,
      parallaxStrength: 0.8,
      zoomLevel: 1.2,
      glitchRate: 0.8,
      dofFocus: 0.5,
      dofStrength: 6,
    },
  },
  microscope: {
    name: 'Macro Microscope',
    description: 'Densely packed, receding katakana glyph fields in ultra-high zoom.',
    config: {
      intensity: 0.85,
      speckleContrast: 0.5,
      speckleSpeed: 0.2,
      parallaxStrength: 0.3,
      zoomLevel: 2.2,
      glitchRate: 0.1,
      dofFocus: 0.3,
      dofStrength: 1,
    },
  },
  hypnotic: {
    name: 'Soap Membrane',
    description: 'Focused on the warping soap bubble membrane and shifting silhouette shapes.',
    config: {
      intensity: 0.75,
      speckleContrast: 0.4,
      speckleSpeed: 1.2,
      parallaxStrength: 1.0,
      zoomLevel: 1.0,
      glitchRate: 0.05,
      dofFocus: 0.4,
      dofStrength: 3,
    },
  },
};
