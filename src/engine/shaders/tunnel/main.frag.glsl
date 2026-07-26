// Complete main fragment shader - tunnel framing + beam + raymarched scene
// All uniforms and functions in one file for vite-plugin-glsl compatibility
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
uniform sampler2D uFontAtlas;
uniform vec2 uAtlasGrid; // columns, rows

// Foveated quality based on eccentricity
float foveatedQuality(vec2 uv01) {
  vec2 d = uv01 - uGaze;
  float ecc = length(d) * 2.0;
  return 1.0 - ecc * 0.45;
}

// Hash function for procedural noise
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453;
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

// Tunnel slit - bottom edges slant inward
float getSlit(vec2 q) {
  return mix(0.7, 1.0, q.y);
}

// Laser beam lines with diffraction
float getLaserBeam(vec2 uv, float slitMul) {
  float dx = abs(uv.x);
  float dy = abs(uv.y);
  float slitWidth = max(uSlitWidth, 0.1);

  float laserLines = min(abs(dx - 0.012 * slitMul), min(abs(dx), abs(dx + 0.012 * slitMul)));
  float fringe = (dx < dy) ? sin(uv.y * 2000.0) : sin(uv.x * 2000.0);
  float laserMask = smoothstep(0.005 * slitMul, 0.0, laserLines);

  float glowDist = min(dx, dy);
  float glow = 0.002 / max(glowDist + 0.0004, 0.0004);

  float sparkleNoise = hash(uv * 600.0 + sin(time * 0.2)) * hash(uv * 300.0 - cos(time * 0.1));
  float sparkleMask = exp(-glowDist * 15.0);
  float sparkle = pow(sparkleNoise, 5.0) * 1.5 * sparkleMask;

  return (laserMask * 8.0 + glow + sparkle * uSpark) * (0.7 + 0.3 * (fringe * 0.5 + 0.5));
}

// TV static / snow layer
float getSnow(vec2 uv) {
  return hash(uv * 750.0 + vec2(0.0, time * 20.0));
}

// Crack opening into the scene
float getCrack(vec2 uv, float slitMul) {
  float dx = abs(uv.x), dy = abs(uv.y);
  float crack = smoothstep(0.18 * slitMul, 0.14 * slitMul, dx) + smoothstep(0.18 * slitMul, 0.14 * slitMul, dy);
  return clamp(crack, 0.0, 1.0);
}

// World geometry - selected by uWorldIdx
float getWorldDistance(vec3 p) {
  if (uWorldIdx == 0) {
    // Classic Cavern - pyramids + obelisk
    vec3 p1 = p; p1.x = mod(p1.x + 1.2, 2.4) - 1.2; p1.y += 1.8; p1.z = mod(p1.z + 1.0, 2.0) - 1.0;
    float d1 = max(p1.x + p1.z, p1.y) - 0.6; // pyramid
    vec3 p2 = p; p2.x = mod(p2.x + 5.0, 10.0) - 5.0; p2.z = mod(p2.z + 8.0, 16.0) - 8.0;
    float d2 = abs(max(abs(p2.x) - 0.12, abs(p2.y)) - 0.002); // obelisk
    float d3 = length(vec3(p.x, p.y - 1.2, p.z) - vec3(cos(p.z * 1.5), sin(p.z * 1.5), 0.0) * 0.2) - 0.02; // wing
    return min(d1, min(d2, d3));
  } else if (uWorldIdx == 1) {
    // Islands
    vec3 pI = p;
    pI.x = mod(pI.x + 2.5, 5.0) - 2.5;
    pI.z = mod(pI.z + 3.0, 6.0) - 3.0;
    return abs(length(pI) - 0.8) - 0.003;
  } else if (uWorldIdx == 2) {
    // Spires
    vec3 pS = p;
    pS.xz = mod(pS.xz + 2.0, 4.0) - 2.0;
    float col = max(pS.x, pS.z);
    return abs(col) - 0.003;
  } else if (uWorldIdx == 3) {
    // Membranes
    vec3 pM = p;
    pM.z = mod(pM.z + 4.0, 8.0) - 4.0;
    return abs(pM.z) - 0.01;
  } else {
    // Tunnel
    vec3 pT = p;
    pT.z = mod(pT.z + 2.0, 4.0) - 1.0;
    return max(length(pT.xy) - 1.8, abs(pT.z)) - 0.03;
  }
}

vec3 marchScene(vec3 ro, vec3 rd) {
  float t = 0.0;
  for(int i = 0; i < 80; i++) {
    if(i >= uSteps) break;
    vec3 p = ro + rd * t;
    p.z += time * 0.1;

    float d = getWorldDistance(p);
    if(d < 0.001) {
      float glyphs = getKatakana(p.xy * 25.0, 1.23) + getKatakana(p.yz * 25.0, 4.56);
      float pulse = 0.7 + 0.3 * sin(time * 5.0 + p.z * 10.0);
      return lCol * glyphs * fastExpNeg(t * 0.1) * 6.0 * pulse;
    }
    t += max(d, 0.01);
    if(t > uMaxDist) break;
  }
  return vec3(0.0);
}

void main() {
  vec2 q = gl_FragCoord.xy / max(res.xy, vec2(1.0));
  float slant = getSlit(q);
  vec2 uv = (gl_FragCoord.xy - 0.5 * res.xy) / min(max(res.y, 1.0), max(res.x, 1.0));
  uv.x /= slant;

  vec3 ro = vec3(look.x * 3.0, look.y * 3.0, -zoom);
  vec3 rd = normalize(vec3(uv, 1.3));

  float tSurf = -ro.z / max(rd.z, 0.001);
  vec3 col = vec3(0.005, 0.0, 0.015) + wCol * 0.5;

  float slitMultiplier = max(uSlitWidth, 0.1);
  float laserBeam = getLaserBeam(uv, slitMultiplier);
  float wallSnow = getSnow(uv) * uSnow;

  float crack = getCrack(uv, slitMultiplier);

  vec3 deepScene = vec3(0.0);
  if(crack > 0.001) {
    vec3 rdDeep = normalize(vec3(uv + look * 0.2, 1.2));
    deepScene = marchScene(ro, rdDeep);
  }

  col = mix(col + wCol * wallSnow, deepScene, crack) + lCol * laserBeam * uLaserEnabled;
  col += lCol * (1.0 - q.y) * 0.06;
  col *= 1.1;

  gl_FragColor = vec4(pow(max(col, vec3(0.0)), vec3(0.85)), 1.0);
}