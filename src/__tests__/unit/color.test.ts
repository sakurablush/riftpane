import { describe, it, expect } from 'vitest';
import { hexToRgb } from '../../utils/color';

describe('hexToRgb', () => {
  it('converts standard 6-digit hex', () => {
    expect(hexToRgb('#ff0000')).toEqual([1, 0, 0]);
    expect(hexToRgb('#00ff00')).toEqual([0, 1, 0]);
    expect(hexToRgb('#0000ff')).toEqual([0, 0, 1]);
  });

  it('converts shorthand 3-digit hex', () => {
    expect(hexToRgb('#f00')).toEqual([1, 0, 0]);
    expect(hexToRgb('#0f0')).toEqual([0, 1, 0]);
    expect(hexToRgb('#00f')).toEqual([0, 0, 1]);
  });

  it('handles lowercase and uppercase', () => {
    const expectedOrangeLow = 0x88 / 255;
    expect(hexToRgb('#FF8800')).toEqual([1, expectedOrangeLow, 0]);
    expect(hexToRgb('#ff8800')).toEqual([1, expectedOrangeLow, 0]);
  });

  it('handles pure black and white', () => {
    expect(hexToRgb('#000000')).toEqual([0, 0, 0]);
    expect(hexToRgb('#ffffff')).toEqual([1, 1, 1]);
  });

  it('returns 0/1 clamped values', () => {
    const [r, g, b] = hexToRgb('#05000c');
    expect(r).toBeGreaterThanOrEqual(0);
    expect(g).toBeGreaterThanOrEqual(0);
    expect(b).toBeGreaterThanOrEqual(0);
    expect(r).toBeLessThanOrEqual(1);
    expect(g).toBeLessThanOrEqual(1);
    expect(b).toBeLessThanOrEqual(1);
  });
});