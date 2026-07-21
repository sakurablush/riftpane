import '@testing-library/jest-dom';
import { vi, afterEach } from 'vitest';

// Mock WebGLRenderingContext for jsdom environment
function createMockWebGLContext() {
  const dummyShader = {};
  const dummyProgram = {};
  const dummyBuffer = {};
  const dummyLocation = {};
  const dummyTexture = {};

  return {
    VERTEX_SHADER: 35633,
    FRAGMENT_SHADER: 35632,
    ARRAY_BUFFER: 34962,
    STATIC_DRAW: 35044,
    FLOAT: 5126,
    TRIANGLES: 4,
    COMPILE_STATUS: 35713,
    LINK_STATUS: 35714,
    TEXTURE_2D: 3553,
    TEXTURE_WRAP_S: 10242,
    TEXTURE_WRAP_T: 10243,
    TEXTURE_MIN_FILTER: 10241,
    TEXTURE_MAG_FILTER: 10240,
    CLAMP_TO_EDGE: 33071,
    LINEAR: 9729,
    TEXTURE0: 33984,

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

    createTexture: vi.fn(() => dummyTexture),
    bindTexture: vi.fn(),
    texImage2D: vi.fn(),
    texParameteri: vi.fn(),
    activeTexture: vi.fn(),
    deleteTexture: vi.fn(),

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

// Mock CanvasRenderingContext2D for jsdom (fonts atlas rendering in tests)
function createMock2DContext(): Partial<CanvasRenderingContext2D> {
  const pixels = new Map<string, number>();
  return {
    font: '',
    fillStyle: '',
    textAlign: 'start',
    textBaseline: 'alphabetic',
    clearRect: vi.fn(),
    fillText: vi.fn((_text: string, _x: number, _y: number) => {
      const key = `${_x},${_y}`;
      pixels.set(key, 255);
    }),
    getImageData: vi.fn((_x: number, _y: number, _w: number, _h: number) => {
      const data = new Uint8ClampedArray(_w * _h * 4);
      // Full-canvas request (transparency check) → return transparent
      const isFullCanvasRequest = _x === 0 && _y === 0 && _w > 1000 && _h > 1000;
      const isSinglePixel = _w === 1 && _h === 1;
      const key = `${_x},${_y}`;
      const val = pixels.get(key) ?? 0;

      for (let i = 0; i < data.length; i += 4) {
        if (isFullCanvasRequest) {
          data[i + 3] = 0;
        } else if (val > 0) {
          data[i] = val;
          data[i + 1] = val;
          data[i + 2] = val;
          data[i + 3] = val;
        }
      }
      return { data } as ImageData;
    }),
    createImageData: vi.fn(() => ({ data: new Uint8ClampedArray(0) }) as unknown as ImageData),
  };
}

// Override getContext on HTMLCanvasElement prototype
const canvasContexts = new WeakMap<HTMLCanvasElement, CanvasRenderingContext2D>();

HTMLCanvasElement.prototype.getContext = vi.fn((contextId: string) => {
  if (contextId === 'webgl' || contextId === 'experimental-webgl') {
    return createMockWebGLContext() as unknown as WebGLRenderingContext;
  }
  if (contextId === '2d') {
    const existing = canvasContexts.get(this as HTMLCanvasElement);
    if (existing) return existing;
    const ctx = createMock2DContext() as unknown as CanvasRenderingContext2D;
    canvasContexts.set(this as HTMLCanvasElement, ctx);
    return ctx;
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

// Mock document.fonts for jsdom – some environments leave fonts.ready pending forever.
if (typeof document !== 'undefined') {
  const mockFonts = {
    ready: Promise.resolve(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    load: vi.fn(),
    faces: [],
  };
  Object.defineProperty(document, 'fonts', {
    value: mockFonts,
    writable: true,
    configurable: true,
  });
}

// Clean up any leftover fixed-position dropdowns or listeners between tests
afterEach(() => {
  document.body.innerHTML = '';
});
