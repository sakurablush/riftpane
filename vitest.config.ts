import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    testTimeout: 60000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/main.tsx',
        'src/**/*.test.{ts,tsx}',
        'src/engine/renderer/CanvasSetup.tsx',
        'src/DecodeText.tsx',
        'src/GlitchText.tsx',
        'src/ui/ambient/RelaxBreathe.tsx',
        'src/ui/ambient/Scanlines.tsx',
      ],
    },
  },
});