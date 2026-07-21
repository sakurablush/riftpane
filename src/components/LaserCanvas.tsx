import React, { useEffect, useRef, useCallback } from 'react';
import { SimulationConfig, WAVELENGTHS } from '../types';
import { hexToRgbVec3 } from '../utils';
import { getVertexShaderSource, getFragmentShaderSource } from '../shaders';
import { generateFontAtlas, ATLAS_INFO } from '../utils/fontAtlas';
import { ATLAS_UNIFORM_VALUES, FONT_ATLAS_UNIFORMS, UI_CONSTANTS, FULLSCREEN_QUAD_VERTICES, MILLISECONDS_TO_SECONDS } from '../constants';

interface LaserCanvasProps {
  config: SimulationConfig;
  wallColor: string;
  onZDepthChange: (z: number) => void;
}

export const LaserCanvas: React.FC<LaserCanvasProps> = React.memo(({ config, wallColor, onZDepthChange }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const lookRef = useRef({ x: 0, y: 0 });
  const zoomRef = useRef(1.5);
  const isDownRef = useRef(false);
  const lastMRef = useRef({ x: 0, y: 0 });
  const timeRef = useRef(0);

  // Use refs to avoid recreating the WebGL program on every config / wall color change
  const configRef = useRef(config);
  const wallColorRef = useRef(wallColor);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  useEffect(() => {
    wallColorRef.current = wallColor;
  }, [wallColor]);

  // Event handlers
  const handleMouseDown = useCallback((e: MouseEvent) => {
    isDownRef.current = true;
    lastMRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseUp = useCallback(() => {
    isDownRef.current = false;
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDownRef.current) {
      lookRef.current.x += (e.clientX - lastMRef.current.x) * UI_CONSTANTS.mouseLookSensitivity;
      lookRef.current.y -= (e.clientY - lastMRef.current.y) * UI_CONSTANTS.mouseLookSensitivity;
      lastMRef.current = { x: e.clientX, y: e.clientY };
    }
  }, []);

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      zoomRef.current *= 1.0 + e.deltaY * UI_CONSTANTS.zoomSensitivity;
      zoomRef.current = Math.max(UI_CONSTANTS.zoomMin, Math.min(UI_CONSTANTS.zoomMax, zoomRef.current));
      onZDepthChange(zoomRef.current);
    },
    [onZDepthChange]
  );

  // Event listener setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [handleMouseDown, handleMouseUp, handleMouseMove, handleWheel]);

  // WebGL Renderer setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) return;

    // Generate and upload font atlas texture
    let atlasTexture: WebGLTexture | null = null;
    let atlasReady = false;

    const uploadFontAtlas = async () => {
      try {
        const atlasCanvas = await generateFontAtlas();
        atlasTexture = gl.createTexture() ?? null;
        if (!atlasTexture) return;

        gl.bindTexture(gl.TEXTURE_2D, atlasTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlasCanvas);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        atlasReady = true;
      } catch (error) {
        console.error('Failed to generate font atlas:', error);
      }
    };

    uploadFontAtlas();

    // Handle canvas dimensions on resize rather than every animation frame
    const handleResize = () => {
      if (!canvas) return;
      const width = window.innerWidth || 800;
      const height = window.innerHeight || 600;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const vsSource = getVertexShaderSource();
    const fsSource = getFragmentShaderSource(config.shaderVersion);

    const compileShader = (type: number, source: string) => {
      const sh = gl.createShader(type);
      if (!sh) return null;
      gl.shaderSource(sh, source);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(sh));
      }
      return sh;
    };

    const vertShader = compileShader(gl.VERTEX_SHADER, vsSource);
    const fragShader = compileShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vertShader || !fragShader) return;

    const prog = gl.createProgram();
    if (!prog) return;

    gl.attachShader(prog, vertShader);
    gl.attachShader(prog, fragShader);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(FULLSCREEN_QUAD_VERTICES),
      gl.STATIC_DRAW
    );

    const attr = gl.getAttribLocation(prog, 'pos');
    gl.enableVertexAttribArray(attr);
    gl.vertexAttribPointer(attr, 2, gl.FLOAT, false, 0, 0);

    // Cache all uniform locations once
    const uniforms = {
      uTime: gl.getUniformLocation(prog, 'time'),
      uRes: gl.getUniformLocation(prog, 'res'),
      uLook: gl.getUniformLocation(prog, 'look'),
      uZoom: gl.getUniformLocation(prog, 'zoom'),
      uLCol: gl.getUniformLocation(prog, 'lCol'),
      uWCol: gl.getUniformLocation(prog, 'wCol'),
      uSteps: gl.getUniformLocation(prog, 'uSteps'),
      uMaxDist: gl.getUniformLocation(prog, 'uMaxDist'),
      uSnow: gl.getUniformLocation(prog, 'uSnow'),
      uSparkle: gl.getUniformLocation(prog, 'uSparkle'),
      uFontAtlas: gl.getUniformLocation(prog, FONT_ATLAS_UNIFORMS.uFontAtlas),
      uAtlasGrid: gl.getUniformLocation(prog, FONT_ATLAS_UNIFORMS.uAtlasGrid),
      uMappedCharCount: gl.getUniformLocation(prog, FONT_ATLAS_UNIFORMS.uMappedCharCount),
      uKatakanaCount: gl.getUniformLocation(prog, FONT_ATLAS_UNIFORMS.uKatakanaCount),
    };

    let anim: number;
    let lastTime = performance.now();

    const render = (now: number) => {
      if (!canvasRef.current) return;
      const currentConfig = configRef.current;

      const dt = now - lastTime;
      lastTime = now;
      timeRef.current += dt * MILLISECONDS_TO_SECONDS;

      if (atlasReady && atlasTexture) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, atlasTexture);
        gl.uniform1i(uniforms.uFontAtlas, 0);
        gl.uniform2f(uniforms.uAtlasGrid, ATLAS_UNIFORM_VALUES.grid[0], ATLAS_UNIFORM_VALUES.grid[1]);
        gl.uniform1f(uniforms.uMappedCharCount, ATLAS_UNIFORM_VALUES.mappedCount);
        gl.uniform1f(uniforms.uKatakanaCount, ATLAS_UNIFORM_VALUES.katakanaCount);
      }

      gl.uniform1f(uniforms.uTime, timeRef.current);
      gl.uniform2f(uniforms.uRes, canvas.width, canvas.height);
      gl.uniform2f(uniforms.uLook, lookRef.current.x, lookRef.current.y);
      gl.uniform1f(uniforms.uZoom, zoomRef.current);

      gl.uniform1i(uniforms.uSteps, currentConfig.raymarchSteps);
      gl.uniform1f(uniforms.uMaxDist, currentConfig.raymarchDistance);
      gl.uniform1f(uniforms.uSnow, currentConfig.snowIntensity);
      gl.uniform1f(uniforms.uSparkle, currentConfig.sparkleIntensity);

      const preset = WAVELENGTHS[currentConfig.wavelength] || WAVELENGTHS[650];
      const lc = [preset.baseRgb[0] / 255.0, preset.baseRgb[1] / 255.0, preset.baseRgb[2] / 255.0];
      gl.uniform3f(uniforms.uLCol, lc[0], lc[1], lc[2]);

      const wc = hexToRgbVec3(wallColorRef.current);
      gl.uniform3f(uniforms.uWCol, wc[0], wc[1], wc[2]);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      anim = requestAnimationFrame(render);
    };

    anim = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(anim);
      window.removeEventListener('resize', handleResize);
      if (prog) gl.deleteProgram(prog);
      if (atlasTexture) gl.deleteTexture(atlasTexture);
    };
  }, [config.shaderVersion]);

  return (
    <canvas
      ref={canvasRef}
      data-testid="laser-canvas"
      className="absolute inset-0 w-full h-full block z-10 cursor-grab"
    />
  );
});

LaserCanvas.displayName = 'LaserCanvas';
