export const LASER_WAVELENGTHS = [650, 532, 488, 450, 405];

export interface WallColorOption {
  hex: string;
  name: string;
}

export const WALL_COLORS: WallColorOption[] = [
  { hex: '#050000', name: 'Obsidian Black' },
  { hex: '#111111', name: 'Charcoal Matte' },
  { hex: '#1a1010', name: 'Dark Crimson' },
  { hex: '#2a0800', name: 'Burnt Copper' },
  { hex: '#1e110a', name: 'Sepia Dark' },
  { hex: '#221500', name: 'Amber Gold' },
  { hex: '#0a1a10', name: 'Forest Shadow' },
  { hex: '#0f2027', name: 'Deep Emerald' },
  { hex: '#101a1a', name: 'Dark Teal' },
  { hex: '#050510', name: 'Abyssal Blue' },
  { hex: '#090a1e', name: 'Midnight Navy' },
  { hex: '#1a1a2e', name: 'Cosmic Indigo' },
  { hex: '#201030', name: 'Deep Violet' },
  { hex: '#301020', name: 'Dark Amethyst' },
  { hex: '#200510', name: 'Maroon Shadow' },
  { hex: '#18181b', name: 'Zinc Oxide' },
  { hex: '#1f2937', name: 'Slate Grey' },
  { hex: '#2d3748', name: 'Steel Blue' },
  { hex: '#1c1917', name: 'Warm Granite' },
  { hex: '#2e1065', name: 'Nebula Purple' },
  { hex: '#064e3b', name: 'Deep Cypress' },
  { hex: '#7c2d12', name: 'Rust Red' },
  { hex: '#0f172a', name: 'Night Sky' },
  { hex: '#262626', name: 'Neutral Dark' },
];

export const DEFAULT_Z_DEPTH = 1.5;

export const UI_CONSTANTS = {
  wallColorDropdownOffset: 8,
  wallColorDropdownZIndex: 100,
  zoomMin: 0.1,
  zoomMax: 30.0,
  zoomSensitivity: 0.002,
  mouseLookSensitivity: 0.005,
} as const;

export const DEFAULT_FALLBACK_COLOR: [number, number, number] = [0.02, 0.0, 0.0];
export const MILLISECONDS_TO_SECONDS = 0.001;

export const FULLSCREEN_QUAD_VERTICES = [
  -1, -1,
   1, -1,
  -1,  1,
  -1,  1,
   1, -1,
   1,  1,
] as const;

export const DEFAULT_PERF_CONFIG = {
  raymarchSteps: 90,
  raymarchDistance: 60,
  snowIntensity: 0.3,
  sparkleIntensity: 1.0,
};

export const MAPPED_CHARS = 'abcdefghijklmnopqrstuvwxyz1234';
export const KATAKANA_CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';

export const ATLAS_COLS = 8;
export const ATLAS_ROWS = 10;
export const CHAR_CELL_SIZE = 64;
export const MAPPED_CHAR_COUNT = MAPPED_CHARS.length;
export const KATAKANA_CHAR_COUNT = KATAKANA_CHARS.length;
export const TOTAL_CHAR_COUNT = MAPPED_CHAR_COUNT + KATAKANA_CHAR_COUNT;

export const FONT_ATLAS_UNIFORMS = {
  uFontAtlas: 'uFontAtlas',
  uAtlasGrid: 'uAtlasGrid',
  uMappedCharCount: 'uMappedCharCount',
  uKatakanaCount: 'uKatakanaCount',
} as const;

export const ATLAS_UNIFORM_VALUES = {
  grid: [ATLAS_COLS, ATLAS_ROWS] as [number, number],
  mappedCount: MAPPED_CHAR_COUNT,
  katakanaCount: KATAKANA_CHAR_COUNT,
} as const;
