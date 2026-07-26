// Color utility functions
export const hexToRgb = (hex: string): [number, number, number] => {
  const sanitized = hex.replace('#', '');
  const fullHex = sanitized.length === 3
    ? sanitized.split('').map(c => c + c).join('')
    : sanitized;
  const num = parseInt(fullHex, 16);
  return [
    ((num >> 16) & 255) / 255,
    ((num >> 8) & 255) / 255,
    (num & 255) / 255,
  ];
};

export const hexToThreeColor = (hex: string): { r: number; g: number; b: number } => {
  const [r, g, b] = hexToRgb(hex);
  return { r, g, b };
};