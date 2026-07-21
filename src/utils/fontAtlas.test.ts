import { describe, it, expect, vi } from 'vitest';
import { generateFontAtlas, ATLAS_INFO } from './fontAtlas';
import {
  ATLAS_COLS,
  ATLAS_ROWS,
  CHAR_CELL_SIZE,
  MAPPED_CHAR_COUNT,
  KATAKANA_CHAR_COUNT,
  TOTAL_CHAR_COUNT,
} from '../constants';

describe('fontAtlas', () => {
  it('exports atlas metadata matching constants', () => {
    expect(ATLAS_INFO.cols).toBe(ATLAS_COLS);
    expect(ATLAS_INFO.rows).toBe(ATLAS_ROWS);
    expect(ATLAS_INFO.mappedCount).toBe(MAPPED_CHAR_COUNT);
    expect(ATLAS_INFO.katakanaCount).toBe(KATAKANA_CHAR_COUNT);
    expect(ATLAS_INFO.totalCount).toBe(TOTAL_CHAR_COUNT);
    expect(ATLAS_INFO.charSize).toBeLessThanOrEqual(ATLAS_INFO.cellSize);
    expect(ATLAS_INFO.cellSize).toBe(CHAR_CELL_SIZE);
  });

  it('generates a canvas with correct atlas dimensions', async () => {
    const canvas = await generateFontAtlas();
    expect(canvas.width).toBe(ATLAS_COLS * CHAR_CELL_SIZE);
    expect(canvas.height).toBe(ATLAS_ROWS * CHAR_CELL_SIZE);
  });

  it('generates a canvas with transparent background', async () => {
    const canvas = await generateFontAtlas();
    const ctx = canvas.getContext('2d');
    expect(ctx).not.toBeNull();
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    // Check corners for transparency (alpha = 0)
    const topLeft = imageData.data[3];
    const bottomRight = imageData.data[
      ((canvas.height - 1) * canvas.width + (canvas.width - 1)) * 4 + 3
    ];
    expect(topLeft).toBe(0);
    expect(bottomRight).toBe(0);
  });

  it('renders all mapped characters within the canvas bounds', async () => {
    const canvas = await generateFontAtlas();
    const ctx = canvas.getContext('2d');
    expect(ctx).not.toBeNull();
    if (!ctx) return;

    // Verify the expected number of cells are filled for mapped chars
    let fillCount = 0;
    for (let i = 0; i < MAPPED_CHAR_COUNT; i++) {
      const col = i % ATLAS_COLS;
      const row = Math.floor(i / ATLAS_COLS);
      const cx = col * CHAR_CELL_SIZE + CHAR_CELL_SIZE / 2;
      const cy = row * CHAR_CELL_SIZE + CHAR_CELL_SIZE / 2;

      const pixel = ctx.getImageData(cx, cy, 1, 1).data;
      const hasGlyph = pixel[0] > 0 || pixel[1] > 0 || pixel[2] > 0;
      if (hasGlyph) fillCount++;
    }

    expect(fillCount).toBe(MAPPED_CHAR_COUNT);
  });

  it('renders all katakana characters within the canvas bounds', async () => {
    const canvas = await generateFontAtlas();
    const ctx = canvas.getContext('2d');
    expect(ctx).not.toBeNull();
    if (!ctx) return;

    let fillCount = 0;
    for (let i = 0; i < KATAKANA_CHAR_COUNT; i++) {
      const idx = MAPPED_CHAR_COUNT + i;
      const col = idx % ATLAS_COLS;
      const row = Math.floor(idx / ATLAS_COLS);
      const cx = col * CHAR_CELL_SIZE + CHAR_CELL_SIZE / 2;
      const cy = row * CHAR_CELL_SIZE + CHAR_CELL_SIZE / 2;

      const pixel = ctx.getImageData(cx, cy, 1, 1).data;
      const hasGlyph = pixel[0] > 0 || pixel[1] > 0 || pixel[2] > 0;
      if (hasGlyph) fillCount++;
    }

    expect(fillCount).toBe(KATAKANA_CHAR_COUNT);
  });

  it('handles font loading failure gracefully', async () => {
    const mockReady = Promise.reject(new Error('Font load failed'));
    const originalFonts = (document as unknown as { fonts?: { ready: Promise<void> } }).fonts;

    Object.defineProperty(document, 'fonts', {
      value: { ready: mockReady },
      writable: true,
      configurable: true,
    });

    await expect(generateFontAtlas()).rejects.toThrow('Font load failed');

    if (originalFonts) {
      Object.defineProperty(document, 'fonts', {
        value: originalFonts,
        writable: true,
        configurable: true,
      });
    }
  });
});
