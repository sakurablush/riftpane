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

      float sdSawtooth(vec3 p) {
        float tooth = abs(fract(p.x * 0.5) - 0.5) * 2.0 + abs(fract(p.z * 0.3) - 0.5) * 1.5;
        return p.y + 3.0 + tooth;
      }

${shaderVersion === 1 ? `
      // V1 LOGIC (Original Unchanged)
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
` : shaderVersion === 2 ? `
      // V2 LOGIC: "Infinite Monolithic Teeth & Glass Pane Depth"
      vec3 marchDimension(vec3 ro, vec3 rd, vec3 color) {
        float t = 0.0;
        vec3 accum = vec3(0.0);

        for(int i = 0; i < 180; i++) {
          if (i >= uSteps) break;
          vec3 p = ro + rd * t;
          p.z += time * 0.25;

          // Parallel rows of hollow pyramid teeth lining the left and right aisle
          vec3 pTeethL = p; pTeethL.x += 2.2; pTeethL.x = mod(pTeethL.x + 0.8, 1.6) - 0.8; pTeethL.z = mod(pTeethL.z + 1.2, 2.4) - 1.2; pTeethL.y += 1.0;
          vec3 pTeethR = p; pTeethR.x -= 2.2; pTeethR.x = mod(pTeethR.x + 0.8, 1.6) - 0.8; pTeethR.z = mod(pTeethR.z + 1.2, 2.4) - 1.2; pTeethR.y += 1.0;
          float teeth = min(sdHollowPyramid(pTeethL, 1.5), sdHollowPyramid(pTeethR, 1.5));

          // Converging Obelisk pillars overhead
          vec3 pOb = p; pOb.x = mod(pOb.x + 8.0, 16.0) - 8.0; pOb.z = mod(pOb.z + 6.0, 12.0) - 6.0;
          pOb.xy *= mat2(cos(0.25), -sin(0.25), sin(0.25), cos(0.25));
          float obelisks = sdHollowObelisk(pOb.xzy);

          // Jagged sawtooth floor
          float sawtooth = sdSawtooth(p);

          float d = min(teeth, min(obelisks, sawtooth));

          // Transparent glass pane slices along Z
          float zSlice = abs(fract(p.z * 0.4) - 0.5);
          if (zSlice < 0.02) {
            float glassGlint = getKatakana(p.xy * 30.0, floor(p.z * 0.4));
            accum += color * glassGlint * 0.12 * exp(-t * 0.04);
          }

          if(d < 0.0015) {
            float glyphs = getKatakana(p.xy * 28.0, 2.0) + getKatakana(p.yz * 28.0, 4.0);
            float edgeGlow = exp(-d * 120.0);
            vec3 warmOrange = vec3(1.0, 0.45, 0.08);
            vec3 hitCol = mix(color, warmOrange, 0.35) * (glyphs * 1.6 + edgeGlow) * exp(-t * 0.05) * 4.5;
            return accum + hitCol;
          }
          t += d * 0.65;
          if(t > uMaxDist) break;
        }
        return accum;
      }

      void main() {
        vec2 q = gl_FragCoord.xy / res.xy;
        float slant = mix(0.7, 1.0, q.y);
        vec2 uv = (gl_FragCoord.xy - 0.5 * res.xy) / min(res.y, res.x);
        uv.x /= slant;

        vec3 ro = vec3(look.x * 2.5, look.y * 2.0, -zoom - 0.5);
        vec3 rd = normalize(vec3(uv, 1.4));

        float tSurf = -ro.z / rd.z;
        vec3 col = vec3(0.0);

        if (tSurf > 0.0) {
          vec3 pW = ro + rd * tSurf;
          float dx = abs(pW.x), dy = abs(pW.y);
          float beamDist = length(pW.xy);

          float dryBrush = noise(uv * vec2(600.0, 60.0)) * 0.5 + 0.5;
          float l1 = exp(-abs(dy - 0.02) * 900.0) * dryBrush;
          float l2 = exp(-abs(dy) * 1100.0) * dryBrush * 1.5;
          float l3 = exp(-abs(dy + 0.02) * 900.0) * dryBrush;
          
          float threads = noise(pW.xy * 600.0 + time * 1.5) * exp(-beamDist * 18.0) * uSparkle;
          vec3 laserV2 = lCol * (l1 + l2 + l3 + threads * 2.5);

          // Glass pane stack static
          float snow = hash(uv * 900.0 + vec2(0.0, time * 20.0));
          vec3 snowLayer = lCol * snow * 0.2 * uSnow;

          float crack = smoothstep(0.28, 0.20, dx) + smoothstep(0.28, 0.20, dy);
          crack = clamp(crack, 0.0, 1.0);

          vec3 rdDeep = normalize(vec3(uv + look * 0.2, 1.4));
          vec3 deepScene = marchDimension(ro, rdDeep, lCol);

          vec3 orangeGlow = vec3(1.0, 0.4, 0.05) * exp(-beamDist * 4.5) * 0.7;
          vec3 wallSurface = wCol * 0.4 + snowLayer;

          col = mix(wallSurface, deepScene + orangeGlow, crack);
          col += laserV2 * smoothstep(0.0, 0.3, zoom);
        } else {
          col = marchDimension(ro, rd, lCol);
        }

        col += lCol * (1.0 - q.y) * 0.12;
        col *= 1.3;
        gl_FragColor = vec4(pow(col, vec3(0.85)), 1.0);
      }
` : shaderVersion === 3 ? `
      // V3 LOGIC: "Drone Archipelago & Wavy Particle Ocean"
      vec3 marchDimension(vec3 ro, vec3 rd, vec3 color) {
        float t = 0.0;
        for(int i = 0; i < 180; i++) {
          if (i >= uSteps) break;
          vec3 p = ro + rd * t;
          p.z += time * 0.2;

          // Organic floating island landmasses
          float islandTerrain = noise(p.xz * 0.35 + vec2(0.0, time * 0.03));
          float islands = p.y + 2.0 + islandTerrain * 2.8;

          // Wavy rippling particle ocean
          float wave = sin(p.x * 2.2 + time * 1.8) * sin(p.z * 1.8 - time * 1.2) * 0.6;
          float sea = p.y + 4.8 + wave;

          // Distant wing-like hooks surrounding the ocean basin
          vec3 pWing = p; pWing.x = mod(pWing.x + 10.0, 20.0) - 10.0;
          float wings = sdWing(pWing + vec3(0.0, -1.0, 0.0));

          float d = min(islands, min(sea, wings));

          if(d < 0.002) {
            float glyphs = getKatakana(p.xz * 22.0 + time * 0.5, 3.14);
            float foam = noise(p.xz * 15.0 + time);
            vec3 warmCore = vec3(1.0, 0.32, 0.04);

            if (d == sea) {
              // Glowing ocean particle waves
              float particleSparkle = pow(hash(floor(p.xz * 35.0) + floor(time * 12.0)), 4.0);
              return mix(color, warmCore, 0.45) * (particleSparkle * 8.0 + glyphs * 0.9) * exp(-t * 0.045) * uSparkle;
            } else {
              // Floating island terraces
              float pulse = 0.8 + 0.4 * sin(p.x * 2.5 + p.z * 2.5 + time * 2.0);
              return color * (glyphs * 2.2 + foam * 0.6) * exp(-t * 0.055) * 4.8 * pulse;
            }
          }
          t += d * 0.7;
          if(t > uMaxDist) break;
        }
        return vec3(0.0);
      }

      void main() {
        vec2 q = gl_FragCoord.xy / res.xy;
        float slant = mix(0.65, 1.0, q.y);
        vec2 uv = (gl_FragCoord.xy - 0.5 * res.xy) / min(res.y, res.x);
        uv.x /= slant;

        // High elevated drone perspective
        vec3 ro = vec3(look.x * 4.5, 4.5 + look.y * 2.5, -zoom - 1.5);
        vec3 rd = normalize(vec3(uv.x, uv.y - 0.35, 1.35));

        float tSurf = -ro.z / rd.z;
        vec3 col = vec3(0.0);

        if (tSurf > 0.0) {
          vec3 pW = ro + rd * tSurf;
          float dx = abs(pW.x), dy = abs(pW.y);
          float beamDist = length(pW.xy);

          float snow = hash(uv * 700.0 + vec2(sin(time * 0.4), time * 18.0));
          vec3 tvSnow = lCol * snow * 0.3 * uSnow;

          float crack = smoothstep(0.32, 0.22, dx) + smoothstep(0.32, 0.22, dy);
          crack = clamp(crack, 0.0, 1.0);

          vec3 rdDeep = normalize(vec3(uv.x + look.x * 0.3, uv.y - 0.35 + look.y * 0.3, 1.35));
          vec3 deepScene = marchDimension(ro, rdDeep, lCol);

          vec3 orangeBleed = vec3(1.0, 0.35, 0.0) * exp(-beamDist * 3.5) * 0.9;
          vec3 wallSurface = wCol * 0.3 + tvSnow;

          col = mix(wallSurface, deepScene + orangeBleed, crack);
        } else {
          col = marchDimension(ro, rd, lCol);
        }

        col += lCol * (1.0 - q.y) * 0.2;
        col *= 1.35;
        gl_FragColor = vec4(pow(col, vec3(0.85)), 1.0);
      }
` : shaderVersion === 4 ? `
      // V4 LOGIC: "Soap-Bubble Membrane & Katakana Rain Matrix"
      vec3 marchDimension(vec3 ro, vec3 rd, vec3 color) {
        float t = 0.0;
        for(int i = 0; i < 180; i++) {
          if (i >= uSteps) break;
          vec3 p = ro + rd * t;
          p.z += time * 0.25;

          // Distant obelisk structure
          vec3 pOb = p; pOb.x = mod(pOb.x + 6.0, 12.0) - 6.0; pOb.z = mod(pOb.z + 8.0, 16.0) - 8.0;
          float obelisks = sdHollowObelisk(pOb.xzy);

          // Tooth-like pyramids
          vec3 pPyr = p; pPyr.x = mod(pPyr.x + 3.0, 6.0) - 3.0; pPyr.z = mod(pPyr.z + 3.0, 6.0) - 3.0;
          float pyramids = sdHollowPyramid(pPyr, 1.4);

          float d = min(obelisks, pyramids);

          if(d < 0.002) {
            float codeField = getKatakana(p.xy * 38.0 + vec2(0.0, time * 1.5), 5.5);
            vec3 warmOrange = vec3(1.0, 0.38, 0.02);
            return mix(color, warmOrange, 0.5) * max(0.2, codeField * 2.8) * exp(-t * 0.05) * 5.2;
          }
          t += d * 0.7;
          if(t > uMaxDist) break;
        }
        return vec3(0.0);
      }

      void main() {
        vec2 q = gl_FragCoord.xy / res.xy;
        float slant = mix(0.75, 1.0, q.y);
        vec2 uv = (gl_FragCoord.xy - 0.5 * res.xy) / min(res.y, res.x);
        uv.x /= slant;

        vec3 ro = vec3(look.x * 2.0, look.y * 2.0, -zoom - 0.8);
        vec3 rd = normalize(vec3(uv, 1.4));

        // Soap bubble membrane hovering in center view
        vec3 pMem = vec3(uv * 2.0, 0.0);
        float bubbleDist = length(uv) - 0.45 + noise(uv * 10.0 + time * 0.8) * 0.08;
        float membraneRefract = noise(uv * 15.0 - time * 0.5) * 0.12;

        // Microscopic Katakana CRT pixel rain
        vec2 rainUv = uv * vec2(120.0, 800.0) + vec2(0.0, time * 22.0);
        float katakanaRain = hash(floor(rainUv)) * getKatakana(uv * 50.0 + vec2(0.0, time * 3.0), 8.1);
        vec3 rainCode = lCol * katakanaRain * 2.0 * uSnow;

        float tSurf = -ro.z / rd.z;
        vec3 col = vec3(0.0);

        if (tSurf > 0.0) {
          vec3 pW = ro + rd * tSurf;
          float dx = abs(pW.x), dy = abs(pW.y);
          float beamDist = length(pW.xy);

          float crack = smoothstep(0.35, 0.25, dx) + smoothstep(0.35, 0.25, dy);
          crack = clamp(crack, 0.0, 1.0);

          vec3 rdWarped = normalize(vec3(uv + look * 0.3 + vec2(membraneRefract), 1.4));
          vec3 deepScene = marchDimension(ro, rdWarped, lCol);

          // Soap bubble translucent shimmer and warm orange glow
          float bubbleShimmer = smoothstep(0.08, 0.0, abs(bubbleDist));
          vec3 warmOrange = vec3(1.0, 0.42, 0.05);
          vec3 membraneGlow = mix(lCol, warmOrange, 0.6) * bubbleShimmer * 2.5;

          vec3 wallSurface = wCol * 0.2 + rainCode;
          col = mix(wallSurface, deepScene + membraneGlow + warmOrange * exp(-beamDist * 3.0) * 0.8, crack);
        } else {
          col = marchDimension(ro, rd, lCol);
        }

        col += rainCode * 0.3;
        col += lCol * (1.0 - q.y) * 0.15;
        col *= 1.4;
        gl_FragColor = vec4(pow(col, vec3(0.85)), 1.0);
      }
` : `
      // V5 LOGIC: "Curved Winged Void & Volumetric Cavern Architecture"
      vec3 marchDimension(vec3 ro, vec3 rd, vec3 color) {
        float t = 0.0;
        vec3 accum = vec3(0.0);

        for(int i = 0; i < 180; i++) {
          if (i >= uSteps) break;
          vec3 p = ro + rd * t;
          p.z += time * 0.2;

          // Curved wing-like forms hooking sharply backward
          vec3 pWing = p; pWing.x = mod(pWing.x + 5.0, 10.0) - 5.0; pWing.z = mod(pWing.z + 6.0, 12.0) - 6.0;
          float wings = sdWing(pWing);

          // Towering hollow pyramids lined up like teeth
          vec3 pPyr = p; pPyr.x = mod(pPyr.x + 3.0, 6.0) - 3.0; pPyr.z = mod(pPyr.z + 4.0, 8.0) - 4.0; pPyr.y += 1.5;
          float pyramids = sdHollowPyramid(pPyr, 1.6);

          // Deep floor with sawtooth ridges
          float floorSaw = sdSawtooth(p);

          float d = min(wings, min(pyramids, floorSaw));

          // Volumetric red/orange fog accumulation piercing through dark space
          float volGlow = exp(-d * 7.0) * 0.09;
          vec3 warmOrange = vec3(1.0, 0.35, 0.02);
          accum += mix(color, warmOrange, sin(p.z * 0.25) * 0.5 + 0.5) * volGlow * exp(-t * 0.045);

          if(d < 0.0015) {
            float katakanaCode = getKatakana(p.xy * 35.0, 7.89);
            float rimLight = pow(1.0 - abs(dot(rd, vec3(0.0, 1.0, 0.0))), 3.0);
            vec3 surfaceCol = mix(color, warmOrange, 0.6) * (katakanaCode * 2.2 + rimLight * 1.8) * exp(-t * 0.05) * 6.0;
            return accum + surfaceCol;
          }
          t += d * 0.65;
          if(t > uMaxDist) break;
        }
        return accum;
      }

      void main() {
        vec2 q = gl_FragCoord.xy / res.xy;
        float slant = mix(0.7, 1.0, q.y);
        vec2 uv = (gl_FragCoord.xy - 0.5 * res.xy) / min(res.y, res.x);
        uv.x /= slant;

        vec3 ro = vec3(look.x * 3.0, look.y * 2.5, -zoom - 1.0);
        vec3 rd = normalize(vec3(uv, 1.3));

        float tSurf = -ro.z / rd.z;
        vec3 col = vec3(0.0);

        if (tSurf > 0.0) {
          vec3 pW = ro + rd * tSurf;
          float dx = abs(pW.x), dy = abs(pW.y);
          float beamDist = length(pW.xy);

          float crack = smoothstep(0.3, 0.2, dx) + smoothstep(0.3, 0.2, dy);
          crack = clamp(crack, 0.0, 1.0);

          vec3 rdDeep = normalize(vec3(uv + look * 0.3, 1.3));
          vec3 deepScene = marchDimension(ro, rdDeep, lCol);

          float tvSnow = hash(uv * 850.0 + vec2(0.0, time * 24.0));
          vec3 snowLayer = lCol * tvSnow * 0.2 * uSnow;

          vec3 warmOrange = vec3(1.0, 0.35, 0.02);
          vec3 orangeBleed = warmOrange * exp(-beamDist * 3.2) * 1.0;

          vec3 wallSurface = wCol * 0.35 + snowLayer;

          col = mix(wallSurface, deepScene + orangeBleed, crack);
        } else {
          col = marchDimension(ro, rd, lCol);
        }

        col += lCol * (1.0 - q.y) * 0.18;
        col *= 1.35;
        gl_FragColor = vec4(pow(col, vec3(0.85)), 1.0);
      }
`}
    `;
