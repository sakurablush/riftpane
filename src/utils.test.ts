import { describe, it, expect } from 'vitest';
import { hexToRgbVec3 } from './utils';

describe('utils: hexToRgbVec3', () => {
  it('converts valid 6-character hex code to normalized RGB vec3', () => {
    const result = hexToRgbVec3('#ffffff');
    expect(result).toEqual([1.0, 1.0, 1.0]);

    const black = hexToRgbVec3('#000000');
    expect(black).toEqual([0.0, 0.0, 0.0]);

    const red = hexToRgbVec3('#ff0000');
    expect(red[0]).toBeCloseTo(1.0);
    expect(red[1]).toBeCloseTo(0.0);
    expect(red[2]).toBeCloseTo(0.0);
  });

  it('handles hex without # prefix', () => {
    const blue = hexToRgbVec3('0000ff');
    expect(blue[0]).toBeCloseTo(0.0);
    expect(blue[1]).toBeCloseTo(0.0);
    expect(blue[2]).toBeCloseTo(1.0);
  });

  it('handles uppercase hex strings and whitespace', () => {
    const green = hexToRgbVec3(' #00FF00 ');
    expect(green[0]).toBeCloseTo(0.0);
    expect(green[1]).toBeCloseTo(1.0);
    expect(green[2]).toBeCloseTo(0.0);
  });

  it('returns fallback value for invalid hex string or empty string', () => {
    const invalid = hexToRgbVec3('invalid');
    expect(invalid).toEqual([0.02, 0.0, 0.0]);

    const empty = hexToRgbVec3('');
    expect(empty).toEqual([0.02, 0.0, 0.0]);

    const nullInput = hexToRgbVec3(null as unknown as string);
    expect(nullInput).toEqual([0.02, 0.0, 0.0]);
  });

  it('caches results for performance', () => {
    const res1 = hexToRgbVec3('#123456');
    const res2 = hexToRgbVec3('#123456');
    expect(res1).toBe(res2); // Referentially equal due to caching
  });

  it('clears cache when size exceeds limit to prevent memory growth', () => {
    // Fill cache beyond limit
    for (let i = 0; i < 101; i++) {
      hexToRgbVec3(`#${i.toString(16).padStart(6, '0')}`);
    }
    // After overflow, lookup of original should still work (cache was cleared, re-computed)
    const result = hexToRgbVec3('#123456');
    expect(result).toEqual([0x12 / 255, 0x34 / 255, 0x56 / 255]);
  });
});
