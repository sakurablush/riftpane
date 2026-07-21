export const getVertexShaderSource = () => `
  attribute vec2 pos;
  void main() { gl_Position = vec4(pos, 0.0, 1.0); }
`;

export const getFragmentShaderSource = (shaderVersion: number) => `
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

  #define GAMMA 0.85

  // --- Noise / helpers ---
  float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    float a = hash(i); float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0)); float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  uniform sampler2D uFontAtlas;
  uniform vec2 uAtlasGrid;
  uniform float uMappedCharCount;
  uniform float uKatakanaCount;

  float sampleFont(vec2 uv, float charIndex) {
    vec2 cellSize = 1.0 / uAtlasGrid;
    vec2 cellPos = vec2(
      mod(charIndex, uAtlasGrid.x),
      floor(charIndex / uAtlasGrid.x)
    ) * cellSize;
    vec2 localUv = fract(uv);
    vec2 atlasUv = cellPos + localUv * cellSize;
    return texture2D(uFontAtlas, atlasUv).r;
  }

  float getCodeGlyph(vec2 uv, float seed) {
    vec2 g = fract(uv * 2.0);
    vec2 id = floor(uv * 2.0);
    float h2 = hash(id + seed + 99.0);
    float h3 = hash(id + seed + 199.0);
    float charIndex = h2 < 0.3
      ? floor(h3 * uMappedCharCount)
      : uMappedCharCount + floor(h3 * uKatakanaCount);
    return sampleFont(g, charIndex);
  }

  // --- SDF primitives ---
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

  float sdSawtooth(vec3 p) {
    float tooth = abs(fract(p.x * 0.5) - 0.5) * 2.0 + abs(fract(p.z * 0.3) - 0.5) * 1.5;
    return p.y + 3.0 + tooth;
  }

${shaderVersion === 1 ? `
  // ===== V1: Raymarched Cavern =====
  #define MAX_STEPS 150
  #define HIT_EPS 0.001
  #define STEP_FACTOR 0.7
  #define SPEED 0.15

  #define PYRAMID_A 1.5
  #define PYRAMID_B 3.0
  #define PYRAMID_H 0.8
  #define OBELISK_A 6.0
  #define OBELISK_B 12.0
  #define OBELISK_C 8.0
  #define OBELISK_D 16.0
  #define WING_OFFSET -1.5
  #define FLOOR_HEIGHT 4.0
  #define FLOOR_WAVE 1.0
  #define FLOOR_EPS 0.01

  #define GLYPH_SCALE 25.0
  #define GLYPH_SEED_A 1.23
  #define GLYPH_SEED_B 4.56
  #define GLYPH_NOISE_SCALE 10.0
  #define FOG_DECAY 0.08
  #define PULSE_INTENSITY 5.0
  #define PULSE_SPEED 3.0
  #define PULSE_FREQ 5.0

  #define CAMERA_LOOK 3.0
  #define FOV 1.3

  #define BEAM_ZERO_NEAR 600.0
  #define BEAM_ZERO_FAR 150.0
  #define BEAM_ZERO_INT_NEAR 4.0
  #define BEAM_ZERO_INT_FAR 1.0
  #define DIFFRACTION_FREQ 150.0
  #define DOT_SHARPNESS 40.0
  #define SPOT_FADE 3.0
  #define AXIS_TIGHTNESS 1500.0
  #define LINE_FALLOFF 800.0
  #define LINE_WIDTH 2.0
  #define LINE_INTENSITY 0.2
  #define GLOW_NEAR 0.002
  #define GLOW_FAR 0.0005
  #define GLOW_DIST 0.01
  #define SPECKLE_FREQ_A 1200.0
  #define SPECKLE_FREQ_B 800.0
  #define SPECKLE_TIME_A 1.5
  #define SPECKLE_TIME_B 0.8
  #define SPECKLE_FALLOFF 8.0
  #define SPECKLE_POWER 3.0
  #define SPECKLE_SCALE 4.0
  #define SNOW_FREQ 800.0
  #define SNOW_TIME 25.0
  #define SNOW_INTENSITY 0.15
  #define CRACK_EDGE 0.18
  #define CRACK_SMOOTH 0.16
  #define PORTAL_LOOK 0.3
  #define PORTAL_FOV 1.2
  #define PORTAL_THRESHOLD 0.001
  #define WALL_SURFACE 0.6
  #define BEAM_ZOOM_THRESHOLD 0.3
  #define FOG_GLOW 0.08
  #define FOG_EXPOSURE 1.2

  vec3 marchDimension(vec3 ro, vec3 rd, vec3 color) {
    float t = 0.0;
    for(int i = 0; i < MAX_STEPS; i++) {
      if (i >= uSteps) break;
      vec3 p = ro + rd * t;
      p.z += time * SPEED;

      vec3 p1 = p; p1.x = mod(p1.x + PYRAMID_A, PYRAMID_B) - PYRAMID_B * 0.5; p1.y += 2.0; p1.z = mod(p1.z + 1.0, 2.0) - 1.0;
      float d1 = sdHollowPyramid(p1, PYRAMID_H);

      vec3 p2 = p; p2.x = mod(p2.x + OBELISK_A, OBELISK_B) - OBELISK_B * 0.5; p2.z = mod(p2.z + OBELISK_C, OBELISK_D) - OBELISK_D * 0.5;
      float d2 = sdHollowObelisk(p2.xzy);

      float d3 = sdWing(p + vec3(0.0, WING_OFFSET, 0.0));

      float dFloor = p.y + FLOOR_HEIGHT + sin(p.x) * sin(p.z) * FLOOR_WAVE;
      dFloor = max(dFloor, FLOOR_EPS);

      float d = min(d1, min(d2, min(d3, dFloor)));
      if(d < HIT_EPS) {
        float glyphs = getCodeGlyph(p.xy * GLYPH_SCALE, GLYPH_SEED_A) + getCodeGlyph(p.yz * GLYPH_SCALE, GLYPH_SEED_B);
        if (d == dFloor) {
          glyphs += noise(p.xz * GLYPH_NOISE_SCALE);
        }
        float pulse = 0.8 + 0.4 * sin(time * PULSE_SPEED + p.z * PULSE_FREQ);
        return color * max(0.2, glyphs) * exp(-t * FOG_DECAY) * PULSE_INTENSITY * pulse;
      }
      t += d * STEP_FACTOR;
      if(t > uMaxDist) break;
    }
    return vec3(0.0);
  }

  void main() {
    vec2 q = gl_FragCoord.xy / res.xy;
    float slant = mix(0.8, 1.0, q.y);
    vec2 uv = (gl_FragCoord.xy - 0.5 * res.xy) / min(res.y, res.x);
    uv.x /= slant;

    vec3 ro = vec3(look.x * CAMERA_LOOK, look.y * CAMERA_LOOK, -zoom);
    vec3 rd = normalize(vec3(uv, FOV));

    float tSurf = -ro.z / rd.z;
    vec3 col = vec3(0.0);

    if (tSurf > 0.0) {
      vec3 pW = ro + rd * tSurf;
      float dx = abs(pW.x), dy = abs(pW.y);
      float beamDist = length(pW.xy);

      float zeroOrder = exp(-beamDist * BEAM_ZERO_NEAR) * BEAM_ZERO_INT_NEAR;
      zeroOrder += exp(-beamDist * BEAM_ZERO_FAR) * BEAM_ZERO_INT_FAR;

      float dotsX = pow(max(0.0, cos(pW.x * DIFFRACTION_FREQ)), DOT_SHARPNESS) * exp(-dy * AXIS_TIGHTNESS) * exp(-dx * SPOT_FADE);
      float dotsY = pow(max(0.0, cos(pW.y * DIFFRACTION_FREQ)), DOT_SHARPNESS) * exp(-dx * AXIS_TIGHTNESS) * exp(-dy * SPOT_FADE);

      float lineX = exp(-dy * LINE_FALLOFF) * exp(-dx * LINE_WIDTH);
      float lineY = exp(-dx * LINE_FALLOFF) * exp(-dy * LINE_WIDTH);
      float crossLines = (lineX + lineY) * LINE_INTENSITY;

      float glow = GLOW_NEAR / (beamDist + GLOW_DIST) + GLOW_FAR / (min(dx, dy) + GLOW_DIST);

      float speckleNoise = hash(uv * SPECKLE_FREQ_A + time * SPECKLE_TIME_A) * hash(uv * SPECKLE_FREQ_B - time * SPECKLE_TIME_B);
      float speckleIntensity = exp(-beamDist * SPECKLE_FALLOFF) * uSparkle;
      float speckle = pow(speckleNoise, SPECKLE_POWER) * SPECKLE_SCALE * speckleIntensity;

      float laserIntensity = zeroOrder + (dotsX + dotsY) * 3.0 + crossLines + glow + speckle;
      vec3 wallLaser = lCol * laserIntensity;

      float snow = hash(uv * SNOW_FREQ + vec2(0.0, time * SNOW_TIME));
      vec3 snowLayer = lCol * snow * SNOW_INTENSITY * uSnow;

      float crack = smoothstep(CRACK_EDGE, CRACK_SMOOTH, dx) + smoothstep(CRACK_EDGE, CRACK_SMOOTH, dy);
      crack = clamp(crack, 0.0, 1.0);

      vec3 codeDim = vec3(0.0);
      if (crack > PORTAL_THRESHOLD) {
        vec3 rdDeep = normalize(vec3(uv + look * PORTAL_LOOK, PORTAL_FOV));
        codeDim = marchDimension(ro, rdDeep, lCol);
      }

      vec3 wallSurface = wCol * WALL_SURFACE + snowLayer;
      col = mix(wallSurface, codeDim, crack);
      col += wallLaser * smoothstep(0.0, BEAM_ZOOM_THRESHOLD, zoom);

    } else {
      col = marchDimension(ro, rd, lCol);
    }

    col += lCol * (1.0 - q.y) * FOG_GLOW;
    col *= FOG_EXPOSURE;
    gl_FragColor = vec4(pow(col, vec3(GAMMA)), 1.0);
  }
` : `
  // ===== Unknown shader version: fallback to V1 =====
  #define MAX_STEPS 150
  #define HIT_EPS 0.001
  #define STEP_FACTOR 0.7
  #define SPEED 0.15

  #define PYRAMID_A 1.5
  #define PYRAMID_B 3.0
  #define PYRAMID_H 0.8
  #define OBELISK_A 6.0
  #define OBELISK_B 12.0
  #define OBELISK_C 8.0
  #define OBELISK_D 16.0
  #define WING_OFFSET -1.5
  #define FLOOR_HEIGHT 4.0
  #define FLOOR_WAVE 1.0
  #define FLOOR_EPS 0.01

  #define GLYPH_SCALE 25.0
  #define GLYPH_SEED_A 1.23
  #define GLYPH_SEED_B 4.56
  #define GLYPH_NOISE_SCALE 10.0
  #define FOG_DECAY 0.08
  #define PULSE_INTENSITY 5.0
  #define PULSE_SPEED 3.0
  #define PULSE_FREQ 5.0

  #define CAMERA_LOOK 3.0
  #define FOV 1.3

  #define BEAM_ZERO_NEAR 600.0
  #define BEAM_ZERO_FAR 150.0
  #define BEAM_ZERO_INT_NEAR 4.0
  #define BEAM_ZERO_INT_FAR 1.0
  #define DIFFRACTION_FREQ 150.0
  #define DOT_SHARPNESS 40.0
  #define SPOT_FADE 3.0
  #define AXIS_TIGHTNESS 1500.0
  #define LINE_FALLOFF 800.0
  #define LINE_WIDTH 2.0
  #define LINE_INTENSITY 0.2
  #define GLOW_NEAR 0.002
  #define GLOW_FAR 0.0005
  #define GLOW_DIST 0.01
  #define SPECKLE_FREQ_A 1200.0
  #define SPECKLE_FREQ_B 800.0
  #define SPECKLE_TIME_A 1.5
  #define SPECKLE_TIME_B 0.8
  #define SPECKLE_FALLOFF 8.0
  #define SPECKLE_POWER 3.0
  #define SPECKLE_SCALE 4.0
  #define SNOW_FREQ 800.0
  #define SNOW_TIME 25.0
  #define SNOW_INTENSITY 0.15
  #define CRACK_EDGE 0.18
  #define CRACK_SMOOTH 0.16
  #define PORTAL_LOOK 0.3
  #define PORTAL_FOV 1.2
  #define PORTAL_THRESHOLD 0.001
  #define WALL_SURFACE 0.6
  #define BEAM_ZOOM_THRESHOLD 0.3
  #define FOG_GLOW 0.08
  #define FOG_EXPOSURE 1.2

  vec3 marchDimension(vec3 ro, vec3 rd, vec3 color) {
    float t = 0.0;
    for(int i = 0; i < MAX_STEPS; i++) {
      if (i >= uSteps) break;
      vec3 p = ro + rd * t;
      p.z += time * SPEED;

      vec3 p1 = p; p1.x = mod(p1.x + PYRAMID_A, PYRAMID_B) - PYRAMID_B * 0.5; p1.y += 2.0; p1.z = mod(p1.z + 1.0, 2.0) - 1.0;
      float d1 = sdHollowPyramid(p1, PYRAMID_H);

      vec3 p2 = p; p2.x = mod(p2.x + OBELISK_A, OBELISK_B) - OBELISK_B * 0.5; p2.z = mod(p2.z + OBELISK_C, OBELISK_D) - OBELISK_D * 0.5;
      float d2 = sdHollowObelisk(p2.xzy);

      float d3 = sdWing(p + vec3(0.0, WING_OFFSET, 0.0));

      float dFloor = p.y + FLOOR_HEIGHT + sin(p.x) * sin(p.z) * FLOOR_WAVE;
      dFloor = max(dFloor, FLOOR_EPS);

      float d = min(d1, min(d2, min(d3, dFloor)));
      if(d < HIT_EPS) {
        float glyphs = getCodeGlyph(p.xy * GLYPH_SCALE, GLYPH_SEED_A) + getCodeGlyph(p.yz * GLYPH_SCALE, GLYPH_SEED_B);
        if (d == dFloor) {
          glyphs += noise(p.xz * GLYPH_NOISE_SCALE);
        }
        float pulse = 0.8 + 0.4 * sin(time * PULSE_SPEED + p.z * PULSE_FREQ);
        return color * max(0.2, glyphs) * exp(-t * FOG_DECAY) * PULSE_INTENSITY * pulse;
      }
      t += d * STEP_FACTOR;
      if(t > uMaxDist) break;
    }
    return vec3(0.0);
  }

  void main() {
    vec2 q = gl_FragCoord.xy / res.xy;
    float slant = mix(0.8, 1.0, q.y);
    vec2 uv = (gl_FragCoord.xy - 0.5 * res.xy) / min(res.y, res.x);
    uv.x /= slant;

    vec3 ro = vec3(look.x * CAMERA_LOOK, look.y * CAMERA_LOOK, -zoom);
    vec3 rd = normalize(vec3(uv, FOV));

    float tSurf = -ro.z / rd.z;
    vec3 col = vec3(0.0);

    if (tSurf > 0.0) {
      vec3 pW = ro + rd * tSurf;
      float dx = abs(pW.x), dy = abs(pW.y);
      float beamDist = length(pW.xy);

      float zeroOrder = exp(-beamDist * BEAM_ZERO_NEAR) * BEAM_ZERO_INT_NEAR;
      zeroOrder += exp(-beamDist * BEAM_ZERO_FAR) * BEAM_ZERO_INT_FAR;

      float dotsX = pow(max(0.0, cos(pW.x * DIFFRACTION_FREQ)), DOT_SHARPNESS) * exp(-dy * AXIS_TIGHTNESS) * exp(-dx * SPOT_FADE);
      float dotsY = pow(max(0.0, cos(pW.y * DIFFRACTION_FREQ)), DOT_SHARPNESS) * exp(-dx * AXIS_TIGHTNESS) * exp(-dy * SPOT_FADE);

      float lineX = exp(-dy * LINE_FALLOFF) * exp(-dx * LINE_WIDTH);
      float lineY = exp(-dx * LINE_FALLOFF) * exp(-dy * LINE_WIDTH);
      float crossLines = (lineX + lineY) * LINE_INTENSITY;

      float glow = GLOW_NEAR / (beamDist + GLOW_DIST) + GLOW_FAR / (min(dx, dy) + GLOW_DIST);

      float speckleNoise = hash(uv * SPECKLE_FREQ_A + time * SPECKLE_TIME_A) * hash(uv * SPECKLE_FREQ_B - time * SPECKLE_TIME_B);
      float speckleIntensity = exp(-beamDist * SPECKLE_FALLOFF) * uSparkle;
      float speckle = pow(speckleNoise, SPECKLE_POWER) * SPECKLE_SCALE * speckleIntensity;

      float laserIntensity = zeroOrder + (dotsX + dotsY) * 3.0 + crossLines + glow + speckle;
      vec3 wallLaser = lCol * laserIntensity;

      float snow = hash(uv * SNOW_FREQ + vec2(0.0, time * SNOW_TIME));
      vec3 snowLayer = lCol * snow * SNOW_INTENSITY * uSnow;

      float crack = smoothstep(CRACK_EDGE, CRACK_SMOOTH, dx) + smoothstep(CRACK_EDGE, CRACK_SMOOTH, dy);
      crack = clamp(crack, 0.0, 1.0);

      vec3 codeDim = vec3(0.0);
      if (crack > PORTAL_THRESHOLD) {
        vec3 rdDeep = normalize(vec3(uv + look * PORTAL_LOOK, PORTAL_FOV));
        codeDim = marchDimension(ro, rdDeep, lCol);
      }

      vec3 wallSurface = wCol * WALL_SURFACE + snowLayer;
      col = mix(wallSurface, codeDim, crack);
      col += wallLaser * smoothstep(0.0, BEAM_ZOOM_THRESHOLD, zoom);

    } else {
      col = marchDimension(ro, rd, lCol);
    }

    col += lCol * (1.0 - q.y) * FOG_GLOW;
    col *= FOG_EXPOSURE;
    gl_FragColor = vec4(pow(col, vec3(GAMMA)), 1.0);
  }
`}
    `;
