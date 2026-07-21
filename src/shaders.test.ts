import { describe, it, expect } from 'vitest';
import { getVertexShaderSource, getFragmentShaderSource } from './shaders';

describe('shaders', () => {
  it('returns vertex shader GLSL source', () => {
    const vs = getVertexShaderSource();
    expect(vs).toContain('attribute vec2 pos;');
    expect(vs).toContain('gl_Position');
  });

  it('returns V1 fragment shader GLSL source for version 1', () => {
    const fs = getFragmentShaderSource(1);
    expect(fs).toContain('precision highp float;');
    expect(fs).toContain('uniform float time;');
    expect(fs).toContain('uniform vec2 res;');
    expect(fs).toContain('void main()');
    expect(fs).toContain('V1: Raymarched Cavern');
    expect(fs).toContain('#define MAX_STEPS 150');
    expect(fs).toContain('#define GLYPH_SCALE 25.0');
  });

  it('falls back to V1 for unknown shader versions', () => {
    const fs = getFragmentShaderSource(99);
    expect(fs).toContain('Unknown shader version: fallback to V1');
    expect(fs).toContain('#define MAX_STEPS 150');
  });
});
