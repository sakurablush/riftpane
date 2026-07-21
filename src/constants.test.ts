import { describe, it, expect } from 'vitest';
import { LASER_WAVELENGTHS, WALL_COLORS, DEFAULT_PERF_CONFIG, DEFAULT_Z_DEPTH } from './constants';

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
      snowIntensity: 1.0,
      sparkleIntensity: 1.0,
    });
  });
});
