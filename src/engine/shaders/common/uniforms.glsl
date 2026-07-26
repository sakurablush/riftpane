// Common GLSL utilities shared across all shaders
precision highp float;

uniform float time;
uniform vec2 res;
uniform vec2 look;
uniform float zoom;
uniform vec3 lCol; // laser color
uniform vec3 wCol; // wall color
uniform float uSlitWidth; // crack/slit width multiplier
uniform int uSteps; // raymarch step count
uniform float uMaxDist; // max raymarch distance
uniform float uSnow; // TV snow density
uniform float uSpark; // sparkle intensity
uniform int uWorldIdx; // scene version
uniform float uLaserEnabled; // laser on/off
uniform vec2 uGaze; // foveated gaze point

// Foveated quality based on eccentricity
float foveatedQuality(vec2 uv01) {
  vec2 d = uv01 - uGaze;
  float ecc = length(d) * 2.0;
  return 1.0 - ecc * 0.45;
}

// Hash function for procedural noise
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

// Noise with smooth interpolation
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

// Fast exponential approximation
float fastExpNeg(float x) {
  return 1.0 / (x + 1.0);
}

// Katakana glyph sampler (requires font atlas texture)
uniform sampler2D uFontAtlas;
uniform vec2 uAtlasGrid; // columns, rows

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
