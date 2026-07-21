import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock WebGLRenderingContext for jsdom environment
function createMockWebGLContext() {
  const dummyShader = {};
  const dummyProgram = {};
  const dummyBuffer = {};
  const dummyLocation = {};

  return {
    VERTEX_SHADER: 35633,
    FRAGMENT_SHADER: 35632,
    ARRAY_BUFFER: 34962,
    STATIC_DRAW: 35044,
    FLOAT: 5126,
    TRIANGLES: 4,
    COMPILE_STATUS: 35713,
    LINK_STATUS: 35714,

    createShader: vi.fn(() => dummyShader),
    shaderSource: vi.fn(),
    compileShader: vi.fn(),
    getShaderParameter: vi.fn(() => true),
    getShaderInfoLog: vi.fn(() => ''),

    createProgram: vi.fn(() => dummyProgram),
    attachShader: vi.fn(),
    linkProgram: vi.fn(),
    useProgram: vi.fn(),
    deleteProgram: vi.fn(),

    createBuffer: vi.fn(() => dummyBuffer),
    bindBuffer: vi.fn(),
    bufferData: vi.fn(),

    getAttribLocation: vi.fn(() => 0),
    enableVertexAttribArray: vi.fn(),
    vertexAttribPointer: vi.fn(),

    getUniformLocation: vi.fn(() => dummyLocation),
    uniform1f: vi.fn(),
    uniform2f: vi.fn(),
    uniform3f: vi.fn(),
    uniform1i: vi.fn(),

    viewport: vi.fn(),
    drawArrays: vi.fn(),
  };
}

// Override getContext on HTMLCanvasElement prototype
HTMLCanvasElement.prototype.getContext = vi.fn((contextId: string) => {
  if (contextId === 'webgl' || contextId === 'experimental-webgl') {
    return createMockWebGLContext() as unknown as WebGLRenderingContext;
  }
  return null;
}) as unknown as typeof HTMLCanvasElement.prototype.getContext;

// Mock window.requestAnimationFrame and cancelAnimationFrame
if (typeof window !== 'undefined') {
  window.requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
    return setTimeout(() => callback(performance.now()), 16) as unknown as number;
  });
  window.cancelAnimationFrame = vi.fn((id: number) => {
    clearTimeout(id);
  });
}
