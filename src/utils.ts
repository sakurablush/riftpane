const hexCache = new Map<string, [number, number, number]>();

export function hexToRgbVec3(hex: string): [number, number, number] {
  if (!hex || typeof hex !== 'string') {
    return [0.02, 0.0, 0.0];
  }
  
  const normalized = hex.trim().toLowerCase();
  const cached = hexCache.get(normalized);
  if (cached) return cached;

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(normalized);
  if (result) {
    const rgb: [number, number, number] = [
      parseInt(result[1], 16) / 255,
      parseInt(result[2], 16) / 255,
      parseInt(result[3], 16) / 255,
    ];
    // Limit cache size to prevent unbounded memory growth if user picks custom colors rapidly
    if (hexCache.size > 100) {
      hexCache.clear();
    }
    hexCache.set(normalized, rgb);
    return rgb;
  }

  return [0.02, 0.0, 0.0];
}
