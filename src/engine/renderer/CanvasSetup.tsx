import { useEffect, useRef, useCallback } from 'react';
import { useRendererStore } from '../../state/rendererStore';
import { useCameraStore } from '../../state/cameraStore';
import { MAPPED_CHARS } from '../../utils/constants';

const GLYPH_POOL = MAPPED_CHARS.split('');

const VS_SOURCE = `
attribute vec2 pos;
void main() {
  gl_Position = vec4(pos, 0.0, 1.0);
}`;

const FS_SOURCE = `
precision highp float;
uniform float time;
uniform vec2 res;
uniform vec2 look;
uniform float zoom;
uniform vec3 lCol;
uniform vec3 wCol;
uniform float uSlitWidth;
uniform int uSteps;
uniform float uMaxDist;
uniform float uSnow;
uniform float uDiffraction;
uniform int uWorldIdx;
uniform sampler2D uGlyphs;
uniform float uAspect;

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float getRandomGlyph(vec2 uv, vec2 seed, float layer) {
  // Cell-based hash for per-segment diversity — each cell shows a DIFFERENT glyph
  vec2 cellUv = fract(uv);
  vec2 cellId = floor(uv);

  float h = hash(
    cellId * 3.7
    + seed
    + vec2(layer * 17.3, layer * 31.7)
    + vec2(zoom * 2.0, zoom * 1.5)
    + sin(cellId * 5.5 + time * (0.5 + layer * 0.35)) * 1.8
  );
  float charIdx = floor(h * 8.0);
  float col = mod(charIdx, 4.0);
  float row = floor(charIdx / 4.0);
  vec2 glyphUv = vec2(
    (col + cellUv.x * 0.88 + 0.06) / 4.0,
    (row + cellUv.y * 0.88 + 0.06) / 2.0
  );
  vec4 tex = texture2D(uGlyphs, glyphUv);
  float brightness = tex.r;
  float depth = layer / 3.0;
  float chromaticShift = layer * 0.02;
  return brightness * (1.0 - depth * 0.55) + chromaticShift;
}

float sdIslands(vec3 p) {
  vec3 pI = p;
  pI.x = mod(pI.x + 2.5, 5.0) - 2.5;
  pI.z = mod(pI.z + 3.0, 6.0) - 3.0;
  return abs(length(pI) - 0.8) - 0.003;
}

float sdSpires(vec3 p) {
  vec3 pS = p;
  pS.xz = mod(pS.xz + 2.0, 4.0) - 2.0;
  float col = max(pS.x, pS.z);
  return abs(col) - 0.003;
}

float sdMembranes(vec3 p) {
  vec3 pM = p;
  pM.z = mod(pM.z + 4.0, 8.0) - 4.0;
  return abs(pM.z) - 0.01;
}

float sdObelisks(vec3 p) {
  vec3 pO = p;
  pO.xz = mod(pO.xz + 3.0, 6.0) - 3.0;
  float outer = max(abs(pO.x) + abs(pO.z) - 0.55, abs(pO.y + 0.9) - 0.55);
  float inner = max(abs(pO.x) + abs(pO.z) - 0.25, abs(pO.y + 0.9) - 0.55);
  return max(outer, -inner);
}

float sdCityscape(vec3 p) {
  vec3 pC = p;
  float id = floor((pC.x + 2.0) / 4.0) + floor((pC.z + 2.0) / 4.0) * 7.0;
  float h = 0.3 + 0.7 * fract(sin(id) * 0.5);
  
  // Tapered pillar: wider at base, narrower at top
  float relY = clamp(-pC.y / max(h, 0.001), 0.0, 1.0);
  float taper = mix(0.6, 1.0, relY);
  float w = 0.35 * taper;
  float pillar = max(abs(pC.x) - w, max(abs(pC.z) - w, abs(pC.y + h * 0.5) - h * 0.5));
  
  // Wider base platform
  float baseW = w + 0.18;
  float base = max(abs(pC.x) - baseW, max(abs(pC.z) - baseW, abs(pC.y + h * 0.88) - h * 0.12));
  
  // Horizontal beam at mid-height for selected pillars
  float beamId = mod(id, 3.0);
  float beam = 100.0;
  if (beamId < 1.0 || beamId > 2.5) {
    float beamY = abs(pC.y + h * 0.35) - 0.012;
    float beamW = max(abs(pC.x) - 0.9, abs(pC.z) - 0.05);
    beam = max(beamY, beamW);
  }
  
  // Ground
  float ground = abs(pC.y + 0.1) - 0.012;
  
  float d = min(pillar, ground);
  d = min(d, base);
  d = min(d, beam);
  return d;
}

// Delicate city accent on the laser-cut surface — neon rim + tiny window lights
vec3 cityGlow(vec3 p, vec3 rd, vec3 lCol) {
  vec3 pC = p;
  float id = floor((pC.x + 2.0) / 4.0) + floor((pC.z + 2.0) / 4.0) * 7.0;
  float h = 0.3 + 0.7 * fract(sin(id) * 0.5);
  float relY = clamp(-pC.y / max(h, 0.001), 0.0, 1.0);
  float taper = mix(0.6, 1.0, relY);
  float w = 0.35 * taper;
  float faceDist = min(abs(pC.x), abs(pC.z)) - w;

  // Soft neon rim on pillar edges
  float edgeDist = abs(pC.y + h * 0.5) - h * 0.5;
  float edgeGlow = smoothstep(0.05, 0.0, edgeDist) * 0.25;

  // Subtle animated window lights
  float wx = floor(pC.x * 10.0);
  float wz = floor(pC.z * 10.0);
  float wy = floor(-pC.y * 6.0);
  float winHash = fract(sin(id * 127.1 + wx * 311.7 + wz * 183.3 + wy * 74.7) * 43758.5453);
  float winFlicker = 0.5 + 0.5 * sin(time * 1.8 + winHash * 6.28);
  float winOn = step(0.7, winHash) * step(0.35, relY) * step(relY, 0.8);
  float winGlow = winOn * smoothstep(0.08, 0.0, faceDist) * smoothstep(0.1, 0.02, abs(edgeDist)) * winFlicker * 0.35;

  return lCol * (edgeGlow + winGlow);
}

float sdWingHooks(vec3 p) {
  vec3 pW = p;
  pW.xz = mod(pW.xz + 2.5, 5.0) - 2.5;
  float angle = atan(pW.z, pW.x);
  float radius = length(pW.xz);
  float hook = sin(angle * 3.0 + time * 0.5) * 0.3;
  float cylinder = abs(radius - 0.6) - 0.05;
  float curve = abs(pW.y - hook) - 0.02;
  return max(cylinder, curve);
}

float sdPixelSea(vec3 p) {
  vec3 pP = p;
  pP.xz = mod(pP.xz + 1.0, 2.0) - 1.0;
  float wave = sin(p.x * 3.0 + time) * sin(p.z * 3.0 + time) * 0.1;
  return abs(pP.y + wave) - 0.02;
}

float sdCrystalline(vec3 p) {
  vec3 pC = p;
  pC.xz = mod(pC.xz + 1.5, 3.0) - 1.5;
  float d = abs(pC.x) + abs(pC.z) + abs(pC.y) - 0.4;
  return abs(d) - 0.01;
}

float sdVoidGlyphs(vec3 p) {
  float d = 100.0;
  for(int i = 0; i < 3; i++) {
    vec3 pV = p;
    pV += vec3(
      sin(float(i) * 1.3) * 2.0,
      cos(float(i) * 2.1) * 1.5,
      float(i) * 3.0 - 3.0
    );
    float g = getRandomGlyph(pV.xy * 5.0, vec2(float(i), time * 0.1), float(i));
    d = min(d, abs(length(pV) - 0.5) - 0.01);
  }
  return d;
}

vec3 marchDeep(vec3 ro, vec3 rd, vec3 color) {
  float t = 0.0;
  for(int i = 0; i < 48; i++) {
    if (i >= uSteps) break;
    vec3 p = ro + rd * t;
    float d = 100.0;
    if (uWorldIdx == 0) {
      d = sdIslands(p);
    } else if (uWorldIdx == 1) {
      d = sdCityscape(p);
    } else if (uWorldIdx == 2) {
      d = sdMembranes(p);
    } else if (uWorldIdx == 3) {
      d = sdObelisks(p);
    } else if (uWorldIdx == 4) {
      d = sdWingHooks(p);
    } else if (uWorldIdx == 5) {
      d = sdPixelSea(p);
    } else if (uWorldIdx == 6) {
      d = sdCrystalline(p);
    } else if (uWorldIdx == 7) {
      d = sdVoidGlyphs(p);
    }
    if (d < 0.001) {
      vec3 glyphCol = vec3(0.0);
      for (int layer = 0; layer < 3; layer++) {
        float flayer = float(layer);

        // Each layer: DIFFERENT scale, rotation, AND spatial offset — true hologram
        float scale = 1.0 + flayer * 1.8;
        float angle = flayer * 2.094;
        float ca = cos(angle), sa = sin(angle);
        vec2 layerUv = vec2(
          p.x * ca - p.y * sa,
          p.x * sa + p.y * ca
        ) * 25.0 * scale;

        vec3 pLayer = p + vec3(
          sin(flayer * 2.1 + 0.5) * 0.12,
          cos(flayer * 1.7 + 0.3) * 0.12,
          flayer * 0.18
        );

        // Completely different glyph set per layer
        vec2 layerSeed = vec2(time * 0.08 + flayer * 5.3, flayer * 11.7);
        float g = getRandomGlyph(layerUv, layerSeed, flayer);

        float layerAlpha = 1.0 - flayer * 0.32;
        float alpha = layerAlpha * (1.0 / (t * 0.05 + 1.0)) * 6.0;
        float pulse = 0.75 + 0.25 * sin(time * 4.8 + flayer * 2.1);
        vec3 layerColor = color;
        if (flayer > 0.5) {
          layerColor = mix(color, vec3(0.0, 0.9, 1.0), 0.28);
        }
        if (flayer > 1.5) {
          layerColor = mix(layerColor, vec3(0.5, 0.0, 1.0), 0.22);
        }
        glyphCol += layerColor * g * alpha * pulse;
      }
      return glyphCol;
    }
    t += max(d, 0.01);
    if (t > uMaxDist) break;
  }
  return vec3(0.0);
}

vec3 worldAtmosphere(vec3 col, vec3 rd, vec3 ro, vec3 pW) {
  float t = (pW.z - ro.z) / max(-rd.z, 0.001);
  vec3 pHit = ro + rd * t;
  
  if (uWorldIdx == 0) {
    col += vec3(0.0, 0.12, 0.18) * exp(-t * 0.06) * 0.5;
  } else if (uWorldIdx == 1) {
    col += vec3(0.15, 0.08, 0.02) * exp(-t * 0.08) * 0.4;
  } else if (uWorldIdx == 2) {
    col += vec3(0.12, 0.0, 0.18) * exp(-t * 0.07) * 0.45;
  } else if (uWorldIdx == 3) {
    col += vec3(0.18, 0.04, 0.08) * exp(-t * 0.05) * 0.35;
  } else if (uWorldIdx == 4) {
    col += vec3(0.18, 0.14, 0.02) * exp(-t * 0.09) * 0.4;
  } else if (uWorldIdx == 5) {
    col += vec3(0.0, 0.14, 0.14) * exp(-t * 0.06) * 0.5;
  } else if (uWorldIdx == 6) {
    col += vec3(0.02, 0.1, 0.22) * exp(-t * 0.07) * 0.45;
  } else if (uWorldIdx == 7) {
    col += vec3(0.08, 0.04, 0.2) * exp(-t * 0.05) * 0.55;
  }
  return col;
}

void main() {
  vec2 q = gl_FragCoord.xy / max(res.xy, vec2(1.0));
  float slant = mix(0.7, 1.0, q.y);
  vec2 uv = (gl_FragCoord.xy - 0.5 * res.xy) / min(max(res.y, 1.0), max(res.x, 16.0));
  uv.x /= slant;

  float viewAspect = res.x / max(res.y, 1.0);
  if (viewAspect > uAspect) {
    float excess = (viewAspect - uAspect) / viewAspect;
    uv.x *= 1.0 + excess;
  } else if (viewAspect < uAspect) {
    float excess = (uAspect - viewAspect) / uAspect;
    uv.y *= 1.0 + excess;
  }

  vec3 ro = vec3(look.x * 3.0, look.y * 3.0, -zoom);
  vec3 rd = normalize(vec3(uv, 1.3));

  float tSurf = -ro.z / max(rd.z, 0.001);
  vec3 col = vec3(0.005, 0.0, 0.015);
  float slitMul = max(uSlitWidth, 0.1);

  if (tSurf > 0.0) {
    vec3 pW = ro + rd * tSurf;
    float dx = abs(pW.x), dy = abs(pW.y);

    // Symmetric cross on every screen: aspect-correct distances
    float viewAspect = res.x / max(res.y, 1.0);
    float aspectK = viewAspect / max(uAspect, 0.001);
    float dxA = (aspectK >= 1.0) ? dx / aspectK : dx;
    float dyA = (aspectK <= 1.0) ? dy * aspectK : dy;

    float coreWidth = 0.008 + uSlitWidth * 0.022;
    float beamSigma = coreWidth * 2.5;
    float beamX = exp(-dxA * dxA / (2.0 * beamSigma * beamSigma));
    float beamY = exp(-dyA * dyA / (2.0 * beamSigma * beamSigma));
    float centralBeam = max(beamX, beamY);

    float fringeAmp = uDiffraction * 0.18 / (uSlitWidth + 0.25);
    float fringeFreq = 7.0 / (uSlitWidth + 0.15);
    float fringeEnvX = exp(-dxA * dxA / (coreWidth * coreWidth * 3.5));
    float fringeEnvY = exp(-dyA * dyA / (coreWidth * coreWidth * 3.5));
    float fringesX = sin(dxA * fringeFreq + time * 0.2) * fringeEnvX * fringeAmp;
    float fringesY = sin(dyA * fringeFreq + time * 0.15) * fringeEnvY * fringeAmp;
    float fringes = max(fringesX, fringesY);
    fringes = max(fringes, 0.0);

    // Outer glow: ~12% wider than core for "beam creates slit" bloom
    float glowSigma = beamSigma * 1.12;
    float glowX = exp(-dxA * dxA / (2.0 * glowSigma * glowSigma));
    float glowY = exp(-dyA * dyA / (2.0 * glowSigma * glowSigma));
    float outerGlow = max(glowX, glowY) * 0.25;

    float beam = centralBeam + fringes + outerGlow;

    float sparkleNoise = hash(uv * 350.0 + vec2(sin(time * 0.25)));
    float sparkle = pow(sparkleNoise, 12.0) * centralBeam * 0.12 * uDiffraction;

    vec3 wallLaser = lCol * (beam * 0.55 + sparkle);
    float snow = hash(uv * 600.0 + vec2(0.0, time * 15.0));
    vec3 snowLayer = lCol * snow * uSnow;
    float crack = smoothstep(0.18 * slitMul, 0.14 * slitMul, dx) + smoothstep(0.18 * slitMul, 0.14 * slitMul, dy);
    crack = clamp(crack, 0.0, 1.0);
    vec3 codeDim = vec3(0.0);
    if (crack > 0.001) {
      vec3 rdDeep = normalize(vec3(uv + look * 0.2, 1.2));
      codeDim = marchDeep(ro, rdDeep, lCol);
    }
    vec3 wallSurface = wCol * 0.5 + snowLayer;

    float dist = length(pW - ro);
    float fog = 1.0 - smoothstep(5.0, 60.0, dist);

    col = mix(wallSurface, codeDim, crack);
    codeDim *= fog;
    col += wallLaser * smoothstep(0.0, 0.4, zoom) * 0.6;
    col += lCol * fog * 0.01;

    col = worldAtmosphere(col, rd, ro, pW);
    if (uWorldIdx == 1 && crack > 0.01) {
      col += cityGlow(pW, rd, lCol) * crack;
    }
  } else {
    vec3 deepCol = marchDeep(ro, rd, lCol);
    col = deepCol;
  }

  vec3 particleCol = vec3(0.0);
  for(int i = 0; i < 3; i++) {
    float fi = float(i);
    vec3 pCenter = vec3(
      sin(time * 0.12 + fi * 1.7) * 4.0,
      cos(time * 0.1 + fi * 2.1) * 3.0,
      -1.5 - fract(time * 0.04 + fi * 0.37) * 4.0
    );
    float tHit = (pCenter.z - ro.z) / max(rd.z, 0.001);
    if (tHit > 0.0) {
      vec3 pHit = ro + rd * tHit;
      float d = length(pHit.xy - pCenter.xy);
      float size = 0.35 + 0.15 * sin(time * 2.0 + fi);
      if (d < size) {
        float alpha = smoothstep(size, 0.0, d);
        float g = getRandomGlyph(pHit.xy * 4.0 + time * 0.08, vec2(fi, time * 0.02), fi);
        particleCol += lCol * g * alpha * 2.0;
      }
    }
  }
  col += particleCol;

  float vignette = 1.0 - smoothstep(0.3, 1.2, length(uv));
  col *= vignette;
  col += lCol * (1.0 - q.y) * 0.06;
  col *= 1.1;
  gl_FragColor = vec4(pow(max(col, vec3(0.0)), vec3(0.85)), 1.0);
}`;

export function CanvasSetup({ locked = false }: { locked?: boolean } = {}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const textureRef = useRef<WebGLTexture | null>(null);
  const lockedRef = useRef(locked);

  useEffect(() => {
    lockedRef.current = locked;
  }, [locked]);

  const slitWidth = useRendererStore((s) => s.slitWidth);
  const steps = useRendererStore((s) => s.steps);
  const maxDist = useRendererStore((s) => s.maxDist);
  const snowDensity = useRendererStore((s) => s.snowDensity);
  const diffractionIntensity = useRendererStore((s) => s.diffractionIntensity);
  const laserNm = useRendererStore((s) => s.laserNm);
  const wallRgb = useRendererStore((s) => s.wallRgb);
  const activeVersionIdx = useRendererStore((s) => s.activeVersionIdx);

  const setFps = useRendererStore((s) => s.setFps);
  const setZoom = useCameraStore((s) => s.setZoom);
  const setLook = useCameraStore((s) => s.setLook);
  const resetCamera = useCameraStore((s) => s.resetCamera);

  const initCamera = useCameraStore.getState();
  const lookRef = useRef({ x: initCamera.lookX, y: initCamera.lookY });
  const targetLookRef = useRef({ x: initCamera.lookX, y: initCamera.lookY });
  const zoomRef = useRef(initCamera.zoom);
  const targetZoomRef = useRef(initCamera.zoom);

  const createGlyphTexture = useCallback(async (gl: WebGLRenderingContext) => {
    const cols = 4;
    const cellSize = 128;
    const fontSize = 96;
    
    // Ensure font is loaded before drawing glyphs
    try {
      await document.fonts.load(`${fontSize}px "CodeOfReality"`);
    } catch {
      // proceed with fallback
    }
    
    const canvas = document.createElement('canvas');
    canvas.width = cols * cellSize;
    canvas.height = Math.ceil(GLYPH_POOL.length / cols) * cellSize;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.font = `${fontSize}px "CodeOfReality", ui-monospace, monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < GLYPH_POOL.length; i++) {
      const x = (i % cols) * cellSize + cellSize / 2;
      const y = Math.floor(i / cols) * cellSize + cellSize / 2;
      ctx.fillText(GLYPH_POOL[i], x, y);
    }

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, gl.LUMINANCE, gl.UNSIGNED_BYTE, canvas);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    return texture;
  }, []);

  useEffect(() => {
    const cancelRef = { current: () => {} };

    (async () => {
      await document.fonts.ready;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const gl = canvas.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'high-performance' });
      if (!gl) return;
      glRef.current = gl;

      const resize = () => {
        const w = window.innerWidth || 1920;
        const h = window.innerHeight || 1080;
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      };
      resize();

      const compileShader = (type: number, source: string) => {
        const sh = gl.createShader(type)!;
        gl.shaderSource(sh, source);
        gl.compileShader(sh);
        if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
          console.error('Shader compile error:', gl.getShaderInfoLog(sh));
        }
        return sh;
      };

      const vs = compileShader(gl.VERTEX_SHADER, VS_SOURCE);
      const fs = compileShader(gl.FRAGMENT_SHADER, FS_SOURCE);
      const prog = gl.createProgram()!;
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        console.error('Program link error:', gl.getProgramInfoLog(prog));
        return;
      }
      gl.useProgram(prog);
      programRef.current = prog;

      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
      const posAttr = gl.getAttribLocation(prog, 'pos');
      gl.enableVertexAttribArray(posAttr);
      gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

      const uTime = gl.getUniformLocation(prog, 'time');
      const uRes = gl.getUniformLocation(prog, 'res');
      const uLook = gl.getUniformLocation(prog, 'look');
      const uZoom = gl.getUniformLocation(prog, 'zoom');
      const uLCol = gl.getUniformLocation(prog, 'lCol');
      const uWCol = gl.getUniformLocation(prog, 'wCol');
      const uSlitWidth = gl.getUniformLocation(prog, 'uSlitWidth');
      const uSteps = gl.getUniformLocation(prog, 'uSteps');
      const uMaxDist = gl.getUniformLocation(prog, 'uMaxDist');
      const uSnow = gl.getUniformLocation(prog, 'uSnow');
      const uDiffraction = gl.getUniformLocation(prog, 'uDiffraction');
      const uWorldIdx = gl.getUniformLocation(prog, 'uWorldIdx');
      const uGlyphs = gl.getUniformLocation(prog, 'uGlyphs');
      const uAspect = gl.getUniformLocation(prog, 'uAspect');

      const glyphTexture = await createGlyphTexture(gl);
      if (!glyphTexture) return;
      textureRef.current = glyphTexture;
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, glyphTexture);
      gl.uniform1i(uGlyphs, 0);

      const presetRGB: Record<number, [number, number, number]> = {
        650: [1.0, 0.0, 0.0],
        532: [0.0, 1.0, 0.0],
        488: [0.0, 1.0, 1.0],
        450: [0.0, 0.2, 1.0],
        405: [0.6, 0.0, 1.0],
      };

      const isInteractiveTarget = (target: EventTarget | null): boolean => {
        if (!target || !(target instanceof HTMLElement)) return false;
        if (target.closest('button')) return true;
        if (target.closest('input')) return true;
        if (target.closest('select')) return true;
        if (target.closest('textarea')) return true;
        if (target.closest('a')) return true;
        if (target.closest('[role="button"]')) return true;
        if (target.closest('label')) return true;
        const overflowY = target.closest('[style*="overflow-y"]')?.getAttribute('style') || '';
        if (overflowY.includes('overflow-y') && (overflowY.includes('auto') || overflowY.includes('scroll'))) return true;
        return false;
      };

      const handleMouseDown = (e: MouseEvent) => {
        if (isInteractiveTarget(e.target)) return;
        if (lockedRef.current) return;
        isDraggingRef.current = true;
        prevMouseRef.current = { x: e.clientX, y: e.clientY };
        window.dispatchEvent(new CustomEvent('riftpane:user-interact'));
      };
      const handleMouseMove = (e: MouseEvent) => {
        if (!isDraggingRef.current) return;
        if (lockedRef.current) return;
        targetLookRef.current.x += (e.clientX - prevMouseRef.current.x) * 0.003;
        targetLookRef.current.y -= (e.clientY - prevMouseRef.current.y) * 0.003;
        prevMouseRef.current = { x: e.clientX, y: e.clientY };
        setLook(targetLookRef.current.x, targetLookRef.current.y);
        window.dispatchEvent(new CustomEvent('riftpane:user-interact'));
      };
      const handleMouseUp = () => { 
        isDraggingRef.current = false; 
        window.dispatchEvent(new CustomEvent('riftpane:user-interact'));
      };
      const handleWheel = (e: WheelEvent) => {
        if (isInteractiveTarget(e.target)) return;
        if (lockedRef.current) return;
        e.preventDefault();
        const factor = e.deltaY > 0 ? -0.45 : 0.45;
        targetZoomRef.current = Math.max(-30.0, Math.min(30.0, targetZoomRef.current + factor));
        setZoom(targetZoomRef.current);
        window.dispatchEvent(new CustomEvent('riftpane:user-interact'));
      };

      // Touch handlers for mobile
      const handleTouchStart = (e: TouchEvent) => {
        if (isInteractiveTarget(e.target)) return;
        if (lockedRef.current) return;
        if (e.touches.length === 1) {
          isDraggingRef.current = true;
          prevMouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        } else if (e.touches.length === 2) {
          isDraggingRef.current = false;
          const dx = e.touches[0].clientX - e.touches[1].clientX;
          const dy = e.touches[0].clientY - e.touches[1].clientY;
          prevPinchRef.current = Math.sqrt(dx * dx + dy * dy);
        }
        window.dispatchEvent(new CustomEvent('riftpane:user-interact'));
      };
      const handleTouchMove = (e: TouchEvent) => {
        if (isInteractiveTarget(e.target)) return;
        if (lockedRef.current) return;
        e.preventDefault();
        if (e.touches.length === 1 && isDraggingRef.current) {
          targetLookRef.current.x += (e.touches[0].clientX - prevMouseRef.current.x) * 0.003;
          targetLookRef.current.y -= (e.touches[0].clientY - prevMouseRef.current.y) * 0.003;
          prevMouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
          setLook(targetLookRef.current.x, targetLookRef.current.y);
          window.dispatchEvent(new CustomEvent('riftpane:user-interact'));
        } else if (e.touches.length === 2) {
          const dx = e.touches[0].clientX - e.touches[1].clientX;
          const dy = e.touches[0].clientY - e.touches[1].clientY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (prevPinchRef.current > 0) {
            const factor = (dist - prevPinchRef.current) * 0.01;
            targetZoomRef.current = Math.max(-30.0, Math.min(30.0, targetZoomRef.current + factor));
            setZoom(targetZoomRef.current);
          }
          prevPinchRef.current = dist;
          window.dispatchEvent(new CustomEvent('riftpane:user-interact'));
        }
      };
      const handleTouchEnd = () => {
        isDraggingRef.current = false;
        prevPinchRef.current = 0;
        window.dispatchEvent(new CustomEvent('riftpane:user-interact'));
      };

      const resetCamListener = () => {
        resetCamera();
        const state = useCameraStore.getState();
        lookRef.current = { x: state.lookX, y: state.lookY };
        targetLookRef.current = { x: state.lookX, y: state.lookY };
        zoomRef.current = state.zoom;
        targetZoomRef.current = state.zoom;
      };

      const isDraggingRef = { current: false as boolean };
      const prevMouseRef = { current: { x: 0, y: 0 } as { x: number; y: number } };
      const prevPinchRef = { current: 0 };

      window.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('wheel', handleWheel, { passive: false });
      window.addEventListener('touchstart', handleTouchStart, { passive: false });
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
      window.addEventListener('riftpane:reset-camera', resetCamListener);

      let frameCount = 0;
      let lastTime = performance.now();
      const startTime = performance.now();
      const render = () => {
        animationFrameId = requestAnimationFrame(render);
        const now = performance.now();
        const timeAcc = (now - startTime) / 1000;

        const lerpFactor = 0.12;
        lookRef.current.x += (targetLookRef.current.x - lookRef.current.x) * lerpFactor;
        lookRef.current.y += (targetLookRef.current.y - lookRef.current.y) * lerpFactor;
        zoomRef.current += (targetZoomRef.current - zoomRef.current) * lerpFactor;

        const sLaser = useRendererStore.getState().laserNm;
        const sSlitWidth = useRendererStore.getState().slitWidth;
        const sSteps = useRendererStore.getState().steps;
        const sMaxDist = useRendererStore.getState().maxDist;
        const sSnow = useRendererStore.getState().snowDensity;
        const sSpark = useRendererStore.getState().diffractionIntensity;
        const sWorldIdx = useRendererStore.getState().activeVersionIdx;
        const sWallRgb = useRendererStore.getState().wallRgb;
        const preset = presetRGB[sLaser] || presetRGB[650];
        const safeWallRgb = sWallRgb ?? [0.15, 0.2, 0.82];

        gl.uniform1f(uTime, timeAcc);
        gl.uniform2f(uRes, canvas.width, canvas.height);
        gl.uniform2f(uLook, lookRef.current.x, lookRef.current.y);
        gl.uniform1f(uZoom, zoomRef.current);
        gl.uniform3f(uLCol, preset[0], preset[1], preset[2]);
        gl.uniform3f(uWCol, safeWallRgb[0], safeWallRgb[1], safeWallRgb[2]);
        gl.uniform1f(uSlitWidth, sSlitWidth);
        gl.uniform1i(uSteps, sSteps);
        gl.uniform1f(uMaxDist, sMaxDist);
        gl.uniform1f(uSnow, sSnow);
        gl.uniform1f(uDiffraction, sSpark);
        gl.uniform1i(uWorldIdx, sWorldIdx);
        gl.uniform1f(uAspect, 16.0 / 9.0);
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        frameCount++;
        if (now - lastTime >= 500) {
          const fps = Math.round((frameCount * 1000) / (now - lastTime));
          frameCount = 0;
          lastTime = now;
          setFps(fps);
        }
      };

      let animationFrameId = 0;
      const startRender = () => {
        render();
      };
      startRender();

      cancelRef.current = () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('wheel', handleWheel);
        window.removeEventListener('touchstart', handleTouchStart);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
        window.removeEventListener('riftpane:reset-camera', resetCamListener);
        if (textureRef.current) {
          gl.deleteTexture(textureRef.current);
          textureRef.current = null;
        }
      };
    })();

    return () => {
      cancelRef.current();
    };
  }, [createGlyphTexture, resetCamera, setFps, setLook, setZoom]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing z-0 touch-none"
    />
  );
}