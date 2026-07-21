import React, { useEffect, useRef } from 'react';
import { SimulationConfig, WAVELENGTHS } from '../types';
import { audio } from './AudioEngine';

interface LaserCanvasProps {
  config: SimulationConfig;
  wallColor: string;
  onZDepthChange: (z: number) => void;
}

function hexToRgbVec3(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16) / 255,
        parseInt(result[2], 16) / 255,
        parseInt(result[3], 16) / 255
    ] : [1.0, 0.0, 0.0];
}

export const LaserCanvas: React.FC<LaserCanvasProps> = ({ config, wallColor, onZDepthChange }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const lookRef = useRef({ x: 0, y: 0 });
  const zoomRef = useRef(1.5);
  const isDownRef = useRef(false);
  const lastMRef = useRef({ x: 0, y: 0 });
  const timeRef = useRef(0);
  
  // Use refs to avoid recreating the WebGL program on every config change
  const configRef = useRef(config);
  const wallColorRef = useRef(wallColor);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  useEffect(() => {
    wallColorRef.current = wallColor;
  }, [wallColor]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onDown = (e: MouseEvent) => {
      isDownRef.current = true;
      lastMRef.current = { x: e.clientX, y: e.clientY };
      if (configRef.current.audioVolume) audio.resume();
    };
    const onUp = () => isDownRef.current = false;
    const onMove = (e: MouseEvent) => {
      if (isDownRef.current) {
        lookRef.current.x += (e.clientX - lastMRef.current.x) * 0.005;
        lookRef.current.y -= (e.clientY - lastMRef.current.y) * 0.005;
        lastMRef.current = { x: e.clientX, y: e.clientY };
      }
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomRef.current *= (1.0 + e.deltaY * 0.002);
      zoomRef.current = Math.max(0.1, Math.min(30.0, zoomRef.current));
      onZDepthChange(zoomRef.current);
      if (configRef.current.audioVolume) audio.resume();
    };

    canvas.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("mousemove", onMove);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      canvas.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("wheel", onWheel);
    };
  }, [onZDepthChange]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl");
    if (!gl) return;

    const vsSource = `
      attribute vec2 pos;
      void main() { gl_Position = vec4(pos, 0.0, 1.0); }
    `;

    const fsSource = `
      precision highp float;
      uniform float time;
      uniform vec2 res;
      uniform vec2 look;
      uniform float zoom;
      uniform vec3 lCol;
      uniform vec3 wCol;
      uniform int uSteps;
      uniform float uMaxDist;
      uniform float uSnow;
      uniform float uSparkle;

      float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      float noise(vec2 p) {
        vec2 i = floor(p); vec2 f = fract(p);
        float a = hash(i); float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0)); float d = hash(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
      }

      // Katakana - denser and crisper
      float getKatakana(vec2 uv, float seed) {
        vec2 g = fract(uv * 2.0);
        vec2 id = floor(uv * 2.0);
        float h = hash(id + seed);
        float s = 0.0;
        if (h > 0.85) s = step(0.1, abs(g.x - 0.5)) * step(0.7, g.y); 
        else if (h > 0.7) s = step(0.8, g.x) + step(0.1, abs(g.y - 0.45)) * step(0.4, g.x);
        else if (h > 0.55) s = step(abs(g.x - g.y), 0.06) + step(abs(g.x + g.y - 1.0), 0.06);
        else if (h > 0.4) s = step(0.1, abs(g.x - 0.35)) * step(0.8, g.y);
        else s = step(0.8, g.x) * step(0.2, g.y) + step(0.8, g.y) * step(0.2, g.x);
        return s * step(0.02, g.x) * step(g.x, 0.98) * step(0.02, g.y) * step(g.y, 0.98);
      }

      float sdHollowPyramid(vec3 p, float h) {
        vec2 q = abs(p.xz);
        float d = max(q.x + q.y, p.y) - h;
        return abs(d) - 0.002;
      }
      float sdHollowObelisk(vec3 p) {
        vec2 d = abs(p.xy) - 0.12;
        float pillar = length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
        return abs(pillar) - 0.002;
      }
      float sdWing(vec3 p) {
        p.x = abs(p.x) - 0.6;
        float hook = length(p.xy + vec2(sin(p.z * 1.5), cos(p.z * 1.5)) * 0.2) - 0.02;
        return hook;
      }

${config.shaderVersion === 1 ? `
      // V1 LOGIC
      vec3 marchDimension(vec3 ro, vec3 rd, vec3 color) {
        float t = 0.0;
        for(int i = 0; i < 150; i++) {
          if (i >= uSteps) break;
          vec3 p = ro + rd * t;
          p.z += time * 0.15; // move forward
          
          vec3 p1 = p; p1.x = mod(p1.x + 1.5, 3.0) - 1.5; p1.y += 2.0; p1.z = mod(p1.z + 1.0, 2.0) - 1.0;
          float d1 = sdHollowPyramid(p1, 0.8);
          
          vec3 p2 = p; p2.x = mod(p2.x + 6.0, 12.0) - 6.0; p2.z = mod(p2.z + 8.0, 16.0) - 8.0;
          float d2 = sdHollowObelisk(p2.xzy);
          
          float d3 = sdWing(p + vec3(0.0, -1.5, 0.0));

          // A procedural ocean floor of points
          float dFloor = p.y + 4.0 + sin(p.x) * sin(p.z) * 1.0;
          dFloor = max(dFloor, 0.01);
          
          float d = min(d1, min(d2, min(d3, dFloor)));
          if(d < 0.001) {
            float glyphs = getKatakana(p.xy * 25.0, 1.23) + getKatakana(p.yz * 25.0, 4.56);
            if (d == dFloor) {
                glyphs += noise(p.xz * 10.0); // speckle the floor
            }
            float pulse = 0.8 + 0.4 * sin(time * 3.0 + p.z * 5.0);
            return color * max(0.2, glyphs) * exp(-t * 0.08) * 5.0 * pulse;
          }
          t += d * 0.7; // slight understep to catch thin geometry
          if(t > uMaxDist) break;
        }
        return vec3(0.0);
      }

      void main() {
        vec2 q = gl_FragCoord.xy / res.xy;
        float slant = mix(0.8, 1.0, q.y);
        vec2 uv = (gl_FragCoord.xy - 0.5 * res.xy) / min(res.y, res.x);
        uv.x /= slant;

        // Camera Setup
        vec3 ro = vec3(look.x * 3.0, look.y * 3.0, -zoom);
        vec3 rd = normalize(vec3(uv, 1.3));

        // Background / Wall surface
        float tSurf = -ro.z / rd.z;
        vec3 col = vec3(0.0);

        if (tSurf > 0.0) {
          vec3 pW = ro + rd * tSurf;
          float dx = abs(pW.x), dy = abs(pW.y);
          float beamDist = length(pW.xy);
          
          // Zero order beam
          float zeroOrder = exp(-beamDist * 600.0) * 4.0;
          zeroOrder += exp(-beamDist * 150.0) * 1.0;

          // Diffracted spots
          float freq = 150.0;
          float dotSharpness = 40.0;
          float spotFade = 3.0;
          float axisTightness = 1500.0;

          float dotsX = pow(max(0.0, cos(pW.x * freq)), dotSharpness) * exp(-dy * axisTightness) * exp(-dx * spotFade);
          float dotsY = pow(max(0.0, cos(pW.y * freq)), dotSharpness) * exp(-dx * axisTightness) * exp(-dy * spotFade);
          
          // Faint solid line connecting them
          float lineX = exp(-dy * 800.0) * exp(-dx * 2.0);
          float lineY = exp(-dx * 800.0) * exp(-dy * 2.0);
          float crossLines = (lineX + lineY) * 0.2;

          // Global ambient glow for the laser
          float glow = 0.002 / (beamDist + 0.01) + 0.0005 / (min(dx, dy) + 0.01);

          // Laser speckle (grainy interference pattern)
          float speckleNoise = hash(uv * 1200.0 + time * 1.5) * hash(uv * 800.0 - time * 0.8);
          float speckleIntensity = exp(-beamDist * 8.0) * uSparkle;
          float speckle = pow(speckleNoise, 3.0) * 4.0 * speckleIntensity;

          float laserIntensity = zeroOrder + (dotsX + dotsY) * 3.0 + crossLines + glow + speckle;
          vec3 wallLaser = lCol * laserIntensity;
          
          // TV Snow (Cascading pixels)
          float snow = hash(uv * 800.0 + vec2(0.0, time * 25.0));
          vec3 snowLayer = lCol * snow * 0.15 * uSnow;

          // The Portal crack
          float crack = smoothstep(0.18, 0.16, dx) + smoothstep(0.18, 0.16, dy);
          crack = clamp(crack, 0.0, 1.0);

          vec3 codeDim = vec3(0.0);
          if (crack > 0.001) {
            vec3 rdDeep = normalize(vec3(uv + look * 0.3, 1.2));
            codeDim = marchDimension(ro, rdDeep, lCol);
          }

          vec3 wallSurface = wCol * 0.6 + snowLayer;
          col = mix(wallSurface, codeDim, crack);
          col += wallLaser * smoothstep(0.0, 0.3, zoom);
          
        } else {
          // Passed entirely through the portal
          col = marchDimension(ro, rd, lCol);
        }

        col += lCol * (1.0 - q.y) * 0.08;
        col *= 1.2; 
        
        gl_FragColor = vec4(pow(col, vec3(0.85)), 1.0);
      }
` : `
      // V2 LOGIC
      vec3 marchDimension(vec3 ro, vec3 rd, vec3 color) {
        float t = 0.0;
        for(int i = 0; i < 150; i++) {
          if (i >= uSteps) break;
          vec3 p = ro + rd * t;
          p.z += time * 0.15; // move forward
          
          vec3 p1 = p; p1.x = mod(p1.x + 1.5, 3.0) - 1.5; p1.y += 2.0; p1.z = mod(p1.z + 1.0, 2.0) - 1.0;
          float d1 = sdHollowPyramid(p1, 0.8);
          
          vec3 p2 = p; p2.x = mod(p2.x + 6.0, 12.0) - 6.0; p2.z = mod(p2.z + 8.0, 16.0) - 8.0;
          float d2 = sdHollowObelisk(p2.xzy);
          
          float d3 = sdWing(p + vec3(0.0, -1.5, 0.0));

          // Sawtooth ridges
          float sawtooth = p.y + 3.0 + abs(fract(p.x * 0.5) - 0.5) * 2.0;
          
          // Archipelago / Floating landmasses
          float archipelago = p.y + 4.0 + sin(p.x * 0.5) * sin(p.z * 0.5) * 1.5;
          archipelago = max(archipelago, 0.01);

          float d = min(d1, min(d2, min(d3, min(sawtooth, archipelago))));
          
          if(d < 0.001) {
            float glyphs = getKatakana(p.xy * 25.0, 1.23) + getKatakana(p.yz * 25.0, 4.56);
            if (d == archipelago) {
                glyphs += noise(p.xz * 10.0); // rippling sea
            }
            float pulse = 0.8 + 0.4 * sin(time * 3.0 + p.z * 5.0);
            return color * max(0.2, glyphs) * exp(-t * 0.08) * 5.0 * pulse;
          }
          t += d * 0.7;
          if(t > uMaxDist) break;
        }
        return vec3(0.0);
      }

      void main() {
        vec2 q = gl_FragCoord.xy / res.xy;
        // The bottom edges of the whole field slant subtly inward while the top stays flat
        float slant = mix(0.7, 1.0, q.y);
        vec2 uv = (gl_FragCoord.xy - 0.5 * res.xy) / min(res.y, res.x);
        uv.x /= slant;

        // Camera Setup
        vec3 ro = vec3(look.x * 3.0, look.y * 3.0, -zoom);
        vec3 rd = normalize(vec3(uv, 1.3));

        float tSurf = -ro.z / rd.z;
        vec3 col = vec3(0.0);

        if (tSurf > 0.0) {
          vec3 pW = ro + rd * tSurf;
          float dx = abs(pW.x), dy = abs(pW.y);
          float beamDist = length(pW.xy);
          
          // 1. Nearest layer: 3 thin parallel lines, radiating threads (dry paintbrush)
          float lineX1 = exp(-abs(dy - 0.02) * 800.0);
          float lineX2 = exp(-abs(dy) * 800.0);
          float lineX3 = exp(-abs(dy + 0.02) * 800.0);
          
          float lineY1 = exp(-abs(dx - 0.02) * 800.0);
          float lineY2 = exp(-abs(dx) * 800.0);
          float lineY3 = exp(-abs(dx + 0.02) * 800.0);
          
          float threads = noise(pW.xy * 500.0 + time) * exp(-beamDist * 20.0);
          
          vec3 laserV2 = lCol * (lineX1 + lineX2 + lineX3 + lineY1 + lineY2 + lineY3 + threads * 2.0) * uSparkle;
          
          // 2. Back wall: television snow, drifting and cascading
          float snow = hash(uv * 800.0 + vec2(sin(time * 0.5), time * 15.0));
          vec3 snowLayer = lCol * snow * 0.25 * uSnow;

          // 3. Middle: semi-transparent membrane, soap bubble warping, orange light glow
          float crack = smoothstep(0.25, 0.20, dx) + smoothstep(0.25, 0.20, dy);
          crack = clamp(crack, 0.0, 1.0);
          
          float membraneWarp = noise(uv * 10.0 + time * 0.5) * 0.05;
          vec3 rdDeep = normalize(vec3(uv + look * 0.3 + membraneWarp, 1.2));
          vec3 codeDim = marchDimension(ro, rdDeep, lCol);
          
          // Membrane adds warm orange glow
          vec3 orangeGlow = vec3(1.0, 0.4, 0.0) * exp(-beamDist * 5.0) * 0.8;

          vec3 wallSurface = wCol * 0.4 + snowLayer;
          
          // Combine
          col = mix(wallSurface, codeDim + orangeGlow, crack);
          col += laserV2 * smoothstep(0.0, 0.3, zoom);
          
        } else {
          // Passed entirely through the portal
          col = marchDimension(ro, rd, lCol);
        }

        // Ceiling never resolves, brightening as it recedes
        col += lCol * (1.0 - q.y) * 0.15;
        col *= 1.3; 
        
        gl_FragColor = vec4(pow(col, vec3(0.85)), 1.0);
      }
`}
    `;

    const shader = (t: number, s: string) => {
      const sh = gl.createShader(t)!;
      gl.shaderSource(sh, s);
      gl.compileShader(sh);
      return sh;
    };

    const prog = gl.createProgram()!;
    gl.attachShader(prog, shader(gl.VERTEX_SHADER, vsSource));
    gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, fsSource));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
    const attr = gl.getAttribLocation(prog, "pos");
    gl.enableVertexAttribArray(attr);
    gl.vertexAttribPointer(attr, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, "time");
    const uRes = gl.getUniformLocation(prog, "res");
    const uLook = gl.getUniformLocation(prog, "look");
    const uZoom = gl.getUniformLocation(prog, "zoom");
    const uLCol = gl.getUniformLocation(prog, "lCol");
    const uWCol = gl.getUniformLocation(prog, "wCol");
    const uStepsLoc = gl.getUniformLocation(prog, "uSteps");
    const uMaxDistLoc = gl.getUniformLocation(prog, "uMaxDist");
    const uSnowLoc = gl.getUniformLocation(prog, "uSnow");
    const uSparkleLoc = gl.getUniformLocation(prog, "uSparkle");

    let anim: number;
    let lastTime = performance.now();

    const render = (now: number) => {
      if (!canvasRef.current) return;
      const currentConfig = configRef.current;
      
      const dt = now - lastTime;
      lastTime = now;
      if (currentConfig.audioVolume) {
          timeRef.current += dt * 0.001;
      }

      audio.update(currentConfig, false); // Update our synth

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform1f(uTime, timeRef.current);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform2f(uLook, lookRef.current.x, lookRef.current.y);
      gl.uniform1f(uZoom, zoomRef.current);
      gl.uniform1i(uStepsLoc, currentConfig.raymarchSteps);
      gl.uniform1f(uMaxDistLoc, currentConfig.raymarchDistance);
      gl.uniform1f(uSnowLoc, currentConfig.snowIntensity);
      gl.uniform1f(uSparkleLoc, currentConfig.sparkleIntensity);
      
      const preset = WAVELENGTHS[currentConfig.wavelength] || WAVELENGTHS[650];
      const lc = [preset.baseRgb[0] / 255.0, preset.baseRgb[1] / 255.0, preset.baseRgb[2] / 255.0];
      gl.uniform3f(uLCol, lc[0], lc[1], lc[2]);
      
      const wc = hexToRgbVec3(wallColorRef.current);
      gl.uniform3f(uWCol, wc[0], wc[1], wc[2]);
      
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      anim = requestAnimationFrame(render);
    };
    anim = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(anim);
      if (prog) gl.deleteProgram(prog);
    };
  }, [config.shaderVersion]);

  return (
    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block z-10" style={{ cursor: 'grab' }} />
  );
};
