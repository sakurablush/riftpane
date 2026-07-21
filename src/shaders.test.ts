import { describe, it, expect } from 'vitest';
import { getVertexShaderSource, getFragmentShaderSource } from './shaders';

describe('shaders', () => {
  it('returns vertex shader GLSL source', () => {
    const vs = getVertexShaderSource();
    expect(vs).toContain('attribute vec2 pos;');
    expect(vs).toContain('gl_Position');
  });

  it('returns fragment shader GLSL source for versions 1 to 5', () => {
    [1, 2, 3, 4, 5].forEach((version) => {
      const fs = getFragmentShaderSource(version);
      expect(fs).toContain('precision highp float;');
      expect(fs).toContain('uniform float time;');
      expect(fs).toContain('uniform vec2 res;');
      expect(fs).toContain('void main()');
      expect(fs).toContain(`V${version} LOGIC`);
    });
  });

  it('defaults to V5 for unknown shader versions', () => {
    const fs = getFragmentShaderSource(99);
    expect(fs).toContain('V5 LOGIC');
  });
});
