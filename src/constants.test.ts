import { describe, it, expect } from 'vitest';
import {
  LASER_WAVELENGTHS,
  WALL_COLORS,
  DEFAULT_PERF_CONFIG,
  DEFAULT_Z_DEPTH,
  MAPPED_CHARS,
  KATAKANA_CHARS,
  ATLAS_COLS,
  ATLAS_ROWS,
  CHAR_CELL_SIZE,
  MAPPED_CHAR_COUNT,
  KATAKANA_CHAR_COUNT,
  TOTAL_CHAR_COUNT,
  FONT_ATLAS_UNIFORMS,
  ATLAS_UNIFORM_VALUES,
} from './constants';

describe('constants', () => {
  it('defines 5 laser wavelengths', () => {
    expect(LASER_WAVELENGTHS).toEqual([650, 532, 488, 450, 405]);
  });

  it('defines at least 20 wall color options with hex and name', () => {
    expect(WALL_COLORS.length).toBeGreaterThanOrEqual(20);
    WALL_COLORS.forEach((color) => {
      expect(color.hex).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(color.name).toBeTruthy();
    });
  });

  it('defines default depth and performance configuration', () => {
    expect(DEFAULT_Z_DEPTH).toBe(1.5);
    expect(DEFAULT_PERF_CONFIG).toEqual({
      raymarchSteps: 90,
      raymarchDistance: 60,
      snowIntensity: 0.3,
      sparkleIntensity: 1.0,
    });
  });

  it('defines mapped characters for the custom font', () => {
    expect(MAPPED_CHARS).toBe('abcdefghijklmnopqrstuvwxyz1234');
    expect(MAPPED_CHAR_COUNT).toBe(30);
    expect(new Set(MAPPED_CHARS).size).toBe(30);
  });

  it('defines katakana fallback characters', () => {
    expect(KATAKANA_CHARS.length).toBeGreaterThan(0);
    expect(KATAKANA_CHAR_COUNT).toBe(KATAKANA_CHARS.length);
    expect(TOTAL_CHAR_COUNT).toBe(MAPPED_CHAR_COUNT + KATAKANA_CHAR_COUNT);
  });

  it('defines atlas layout constants', () => {
    expect(ATLAS_COLS).toBeGreaterThan(0);
    expect(ATLAS_ROWS).toBeGreaterThan(0);
    expect(CHAR_CELL_SIZE).toBeGreaterThan(0);
    expect(ATLAS_COLS * ATLAS_ROWS).toBeGreaterThanOrEqual(TOTAL_CHAR_COUNT);
  });

  it('defines font atlas uniform names consistently', () => {
    expect(FONT_ATLAS_UNIFORMS.uFontAtlas).toBe('uFontAtlas');
    expect(FONT_ATLAS_UNIFORMS.uAtlasGrid).toBe('uAtlasGrid');
    expect(FONT_ATLAS_UNIFORMS.uMappedCharCount).toBe('uMappedCharCount');
    expect(FONT_ATLAS_UNIFORMS.uKatakanaCount).toBe('uKatakanaCount');
  });

  it('defines atlas uniform values matching constants', () => {
    expect(ATLAS_UNIFORM_VALUES.grid).toEqual([ATLAS_COLS, ATLAS_ROWS]);
    expect(ATLAS_UNIFORM_VALUES.mappedCount).toBe(MAPPED_CHAR_COUNT);
    expect(ATLAS_UNIFORM_VALUES.katakanaCount).toBe(KATAKANA_CHAR_COUNT);
  });
});
