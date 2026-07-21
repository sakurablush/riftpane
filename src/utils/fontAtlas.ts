import {
  MAPPED_CHARS,
  KATAKANA_CHARS,
  ATLAS_COLS,
  ATLAS_ROWS,
  CHAR_CELL_SIZE,
  MAPPED_CHAR_COUNT,
  KATAKANA_CHAR_COUNT,
  TOTAL_CHAR_COUNT,
} from '../constants';

const CHAR_SIZE = 48;
const ATLAS_CHAR_FONT = `${CHAR_SIZE}px 'CodeOfReality'`;
const KATAKANA_FONT = `${CHAR_SIZE}px 'Noto Sans JP'`;
const ATLAS_FILL = '#ffffff';

export interface FontAtlasInfo {
  cols: number;
  rows: number;
  mappedCount: number;
  katakanaCount: number;
  totalCount: number;
  charSize: number;
  cellSize: number;
}

export const ATLAS_INFO: FontAtlasInfo = {
  cols: ATLAS_COLS,
  rows: ATLAS_ROWS,
  mappedCount: MAPPED_CHAR_COUNT,
  katakanaCount: KATAKANA_CHAR_COUNT,
  totalCount: TOTAL_CHAR_COUNT,
  charSize: CHAR_SIZE,
  cellSize: CHAR_CELL_SIZE,
};

export async function generateFontAtlas(): Promise<HTMLCanvasElement> {
  if (typeof document !== 'undefined' && document.fonts) {
    await document.fonts.ready;
  }

  const canvas = document.createElement('canvas');
  canvas.width = ATLAS_COLS * CHAR_CELL_SIZE;
  canvas.height = ATLAS_ROWS * CHAR_CELL_SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to acquire 2D canvas context for font atlas generation');
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const drawChar = (
    char: string,
    col: number,
    row: number,
    font: string
  ): void => {
    ctx.font = font;
    ctx.fillStyle = ATLAS_FILL;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const x = col * CHAR_CELL_SIZE + CHAR_CELL_SIZE / 2;
    const y = row * CHAR_CELL_SIZE + CHAR_CELL_SIZE / 2;
    ctx.fillText(char, x, y);
  };

  for (let i = 0; i < MAPPED_CHAR_COUNT; i++) {
    drawChar(MAPPED_CHARS[i], i % ATLAS_COLS, Math.floor(i / ATLAS_COLS), ATLAS_CHAR_FONT);
  }

  for (let i = 0; i < KATAKANA_CHAR_COUNT; i++) {
    const idx = MAPPED_CHAR_COUNT + i;
    drawChar(
      KATAKANA_CHARS[i],
      idx % ATLAS_COLS,
      Math.floor(idx / ATLAS_COLS),
      KATAKANA_FONT
    );
  }

  return canvas;
}
