// UI Theme Constants
export const UI_THEME = {
  sakura: {
    50: '#fff5f7',
    100: '#ffe0e6',
    200: '#ffc2d1',
    300: '#ff9db5',
    400: '#ff7096',
    500: '#ff477e',
    600: '#e82560',
    700: '#c81e4f',
    800: '#a31840',
    900: '#86153a',
  },
  surface: {
    glass: 'rgba(20, 8, 16, 0.55)',
    glassHover: 'rgba(40, 16, 28, 0.65)',
    border: 'rgba(255, 116, 150, 0.18)',
    borderActive: 'rgba(255, 116, 150, 0.55)',
    divider: 'rgba(255, 116, 150, 0.12)',
  },
} as const;

// Camera Constants
export const ZOOM_MIN = -30.0;
export const ZOOM_MAX = 30.0;
export const ZOOM_SENSITIVITY = 0.008;
export const LOOK_SENSITIVITY = 0.005;

// Code of Reality Font Constants
export const MAPPED_CHARS = 'abcdef12';
export const VERSION_LABELS = ['a', 'b', 'c', 'd', 'e', 'f', '1', '2'] as const;
export const APP_FONT_FAMILY = "'CodeOfReality', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";

export interface LaserPreset {
  nm: number;
  name: string;
  color: [number, number, number];
  hex: string;
  complementary: string;
}

// Laser Presets (from PoC)
export const LASER_PRESETS = {
  650: { nm: 650, name: '650nm', color: [1.0, 0.0, 0.0], hex: '#ff1e27', complementary: '#ff6600' },
  532: { nm: 532, name: '532nm', color: [0.0, 1.0, 0.0], hex: '#10ff51', complementary: '#ff00ea' },
  488: { nm: 488, name: '488nm', color: [0.0, 1.0, 1.0], hex: '#00f0ff', complementary: '#ff6600' },
  450: { nm: 450, name: '450nm', color: [0.0, 0.2, 1.0], hex: '#1e51ff', complementary: '#ffe600' },
  405: { nm: 405, name: '405nm', color: [0.6, 0.0, 1.0], hex: '#b01eff', complementary: '#66ff00' },
} as const;

export const DEFAULT_LASER_NM = 532 as const;

// Render Settings Defaults (tuned per user request)
export const DEFAULT_SETTINGS = {
  slitWidth: 1.0,
  steps: 64,
  maxDist: 80.0,
  snowDensity: 0.01,
  diffractionIntensity: 5.0,
} as const;

// Slider constraints
export const SLIT_MIN = 0.0;
export const SLIT_MAX = 20.0;
export const DIST_MIN = 10.0;
export const DIST_MAX = 120.0;
export const STEPS_MIN = 1.0;
export const STEPS_MAX = 500.0;
export const MOUSE_LOOK_SENSITIVITY = 0.003;
export const GLITCH_BASE_SPEED = 0.04;

// Wall Colors (90+ curated colors from commit 906a144)
export const WALL_COLORS: Array<{ name: string; hex: string }> = [
  { name: 'Sakura Indigo', hex: '#2633d0' },
  { name: 'Sakura Pink', hex: '#FADADD' },
  { name: 'Magnolia', hex: '#F2EFE9' },
  { name: 'Ecru White', hex: '#F0EAD6' },
  { name: 'Snow White', hex: '#FFFAFA' },
  { name: 'Ivory', hex: '#FFFFF0' },
  { name: 'Pearl White', hex: '#F5F5F0' },
  { name: 'Almond White', hex: '#EFEBE0' },
  { name: 'Cotton White', hex: '#F7F2E9' },
  { name: 'Cream White', hex: '#FFF8E7' },
  { name: 'Alabaster', hex: '#F2F0E6' },
  { name: 'Jasmine White', hex: '#F8F4E9' },
  { name: 'Linen White', hex: '#EDE6D6' },
  { name: 'Cornsilk', hex: '#FFFDD0' },
  { name: 'Opal White', hex: '#EAE6E1' },
  { name: 'Muslin White', hex: '#F1EDE4' },
  { name: 'Rice White', hex: '#F8F5EF' },
  { name: 'Sandy Beige', hex: '#E8DCC5' },
  { name: 'Café au Lait', hex: '#D8C3A5' },
  { name: 'Cappuccino', hex: '#C9A87C' },
  { name: 'Caramel Beige', hex: '#D2A679' },
  { name: 'Taupe', hex: '#B8A99A' },
  { name: 'Greige', hex: '#CABFB1' },
  { name: 'Mocha Beige', hex: '#A9856A' },
  { name: 'Vanilla Beige', hex: '#F3E5AB' },
  { name: 'Walnut Beige', hex: '#C2A878' },
  { name: 'Light Terracotta', hex: '#D89B79' },
  { name: 'Powder Pink', hex: '#F7CACA' },
  { name: 'Pearl Pink', hex: '#F4D9D0' },
  { name: 'Peach Pink', hex: '#FBCEB1' },
  { name: 'Baby Pink', hex: '#F9C9D6' },
  { name: 'Antique Pink', hex: '#DEB8B2' },
  { name: 'Dusty Pink', hex: '#E8C4C4' },
  { name: 'Pastel Pink', hex: '#F6DDE0' },
  { name: 'Heather Pink', hex: '#D8A7B1' },
  { name: 'Muslin Pink', hex: '#F3D9DA' },
  { name: 'Coral Pastel', hex: '#F7C6C0' },
  { name: 'Quartz Pink', hex: '#F1D4D4' },
  { name: 'Magnolia Pink', hex: '#EED9D3' },
  { name: 'Misty Pink', hex: '#F4E1E1' },
  { name: 'Rose Pink', hex: '#E8B4B8' },
  { name: 'Deeper Powder Pink', hex: '#E3B7B1' },
  { name: 'Vanilla Pink', hex: '#F5E0D3' },
  { name: 'Lilac Pink', hex: '#E0BFD4' },
  { name: 'Summer Pink', hex: '#F8D7DA' },
  { name: 'Light Violet Pink', hex: '#E6D7E8' },
  { name: 'Sage Green', hex: '#B2C2B3' },
  { name: 'Mint Green', hex: '#C7E6D7' },
  { name: 'Pistachio Green', hex: '#D3E4CD' },
  { name: 'Light Olive Green', hex: '#B7B18C' },
  { name: 'Eucalyptus Green', hex: '#A9BCA5' },
  { name: 'Bottle Green', hex: '#2E4E3F' },
  { name: 'Laurel Green', hex: '#789262' },
  { name: 'Sea Green Pastel', hex: '#A8D8C9' },
  { name: 'Light Lime Green', hex: '#D9E8B8' },
  { name: 'Moss Green', hex: '#8A9A5B' },
  { name: 'Fir Green', hex: '#4B6455' },
  { name: 'Deep Olive Green', hex: '#6B6E3A' },
  { name: 'Bamboo Green', hex: '#A3B899' },
  { name: 'Celadon Green', hex: '#C9E4CA' },
  { name: 'Spring Green', hex: '#D6E8C8' },
  { name: 'Juniper Green', hex: '#7C9473' },
  { name: 'Camphor Green', hex: '#B9CBB2' },
  { name: 'Muted Emerald', hex: '#4F7A6A' },
  { name: 'Grass Green Pastel', hex: '#C6D9A6' },
  { name: 'Melissa Green', hex: '#DDE8D0' },
  { name: 'Powder Blue', hex: '#C4D9E0' },
  { name: 'Lavender Blue', hex: '#D6E0F0' },
  { name: 'Light Sea Blue', hex: '#A9CBD0' },
  { name: 'Sky Blue', hex: '#BFDDE8' },
  { name: 'Light Cornflower Blue', hex: '#A6C6E0' },
  { name: 'Denim Pastel', hex: '#B0C4D8' },
  { name: 'Mint Blue', hex: '#C0E0DE' },
  { name: 'Grey Blue', hex: '#B8C6CE' },
  { name: 'Muted Navy', hex: '#3B4A5A' },
  { name: 'Ice Blue', hex: '#DCEBF0' },
  { name: 'Cloud Blue', hex: '#D3E3EC' },
  { name: 'Light Parisian Blue', hex: '#A2BFDB' },
  { name: 'Aquamarine', hex: '#B0DDD8' },
  { name: 'Velvet Blue', hex: '#6B8CA3' },
  { name: 'Muted Sapphire', hex: '#4A6C8C' },
  { name: 'Pearl Grey', hex: '#D6D6D2' },
  { name: 'Dove Grey', hex: '#C3C3BC' },
  { name: 'Mist Grey', hex: '#DADAD5' },
  { name: 'Concrete Grey', hex: '#B5B5AE' },
  { name: 'Light Anthracite', hex: '#7D7D78' },
  { name: 'Warm Grey', hex: '#CFCAC1' },
  { name: 'Silver Grey', hex: '#C7C7C7' },
  { name: 'Beige Grey', hex: '#D3CDC2' },
  { name: 'Smoky Grey', hex: '#A9A9A4' },
  { name: 'Stone Grey', hex: '#B8B3A9' },
  { name: 'Vanilla Yellow', hex: '#F7E7A1' },
  { name: 'Butter Yellow', hex: '#F5E1A4' },
  { name: 'Sandy Yellow', hex: '#E8D5A3' },
  { name: 'Lemon Pastel', hex: '#F5EEB8' },
  { name: 'Honey Yellow', hex: '#E6C079' },
  { name: 'Straw Yellow', hex: '#E8DBA0' },
  { name: 'Pastel Lavender', hex: '#D9CCE3' },
  { name: 'Heather Violet', hex: '#C6B3CE' },
  { name: 'Muted Plum', hex: '#8C6B7E' },
  { name: 'Misty Violet', hex: '#E2D9E8' },
];

export const DEFAULT_WALL_HEX = '#2633d0';

// Scene versions (CodeOfReality glyph set)
export const SCENE_VERSIONS = [
  { symbol: 'a', name: 'Veil Void Islands' },
  { symbol: 'b', name: 'City of Columns & Pyramids' },
  { symbol: 'c', name: 'Speckle Lattice Spires' },
  { symbol: 'd', name: 'Membrane Rift Panes' },
  { symbol: 'e', name: 'Hollow Obelisks & Wing Hooks' },
  { symbol: 'f', name: 'Wing Hook Nexus' },
  { symbol: '1', name: 'Pixel Sea' },
  { symbol: '2', name: 'Crystalline Void Glyphs' },
] as const;