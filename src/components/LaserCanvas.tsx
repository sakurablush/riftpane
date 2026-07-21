import React, { useEffect, useRef } from 'react';
import { SimulationConfig, WAVELENGTHS } from '../types';
import { hexToRgbVec3 } from '../utils';
import { getVertexShaderSource, getFragmentShaderSource } from '../shaders';

interface LaserCanvasProps {
  config: SimulationConfig;
  wallColor: string;
  onZDepthChange: (z: number) => void;
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

    const vsSource = getVertexShaderSource();
    const fsSource = getFragmentShaderSource(config.shaderVersion);

    const shader = (t: number, s: string) => {
      const sh = gl.createShader(t)!;
      gl.shaderSource(sh, s);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(sh));
      }
      return sh;
    };

    const prog = gl.createProgram()!;
    gl.attachShader(prog, shader(gl.VERTEX_SHADER, vsSource));
    gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, fsSource));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,  1, -1,  -1, 1,
      -1,  1,  1, -1,   1, 1
    ]), gl.STATIC_DRAW);

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
      timeRef.current += dt * 0.001;

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
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full block z-10" 
      style={{ cursor: 'grab' }} 
    />
  );
};
