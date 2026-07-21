
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

${shaderVersion === 1 ? `
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
` : shaderVersion === 2 ? `
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
` : shaderVersion === 3 ? `
      // V3 LOGIC
      vec3 marchDimension(vec3 ro, vec3 rd, vec3 color) {
        float t = 0.0;
        vec3 finalColor = vec3(0.0);
        
        for(int i = 0; i < 150; i++) {
          if (i >= uSteps) break;
          vec3 p = ro + rd * t;
          p.z += time * 0.2; // movement
          
          // 1. Obelisks: twin lines converging
          vec3 pOb = p; pOb.x = mod(pOb.x + 8.0, 16.0) - 8.0; pOb.z = mod(pOb.z + 10.0, 20.0) - 10.0;
          float obelisk = sdHollowObelisk(pOb.xzy);

          // 2. Pyramids lined up like teeth
          vec3 pPyr = p; pPyr.x = mod(pPyr.x + 3.0, 6.0) - 3.0; pPyr.z = mod(pPyr.z + 5.0, 10.0) - 5.0;
          float pyramids = sdHollowPyramid(pPyr, 1.2);

          // 3. Sawtooth ridges
          float sawtooth = p.y + 5.0 + abs(fract(p.x * 0.3) - 0.5) * 3.0 + abs(fract(p.z * 0.2) - 0.5) * 2.0;

          // 4. Hook/Wing forms
          float wings = sdWing(p + vec3(0.0, -2.0, 0.0));

          // 5. Islands on rippling pixel sea
          float seaRipple = sin(p.x * 2.0 + time) * sin(p.z * 2.0 - time) * 0.5;
          float islands = p.y + 6.0 + seaRipple;

          // Combine geometry
          float d = min(obelisk, min(pyramids, min(sawtooth, min(wings, islands))));
          
          if(d < 0.002) {
            // Surface hit: resolve Katakana swarms
            float glyphs = getKatakana(p.xy * 30.0, 1.0) + getKatakana(p.yz * 30.0, 2.0);
            
            // Highlight star shape if near intersections
            float starCluster = exp(-length(fract(p.xz) - 0.5) * 20.0) * 2.0;
            
            float pulse = 0.7 + 0.5 * sin(time * 2.0 + p.z * 3.0);
            vec3 hitColor = color * max(0.2, glyphs + starCluster * 0.5) * exp(-t * 0.05) * 6.0 * pulse;
            finalColor += hitColor * 0.2; // Accumulate instead of break for glass layers
            t += 0.01; // Step through slightly
          } else {
            t += d * 0.75;
          }
          if(t > uMaxDist) break;
        }
        return finalColor;
      }

      void main() {
        vec2 q = gl_FragCoord.xy / res.xy;
        // Slant bottom inward, top flat
        float slant = mix(0.6, 1.0, q.y);
        vec2 uv = (gl_FragCoord.xy - 0.5 * res.xy) / min(res.y, res.x);
        uv.x /= slant;

        vec3 ro = vec3(look.x * 4.0, look.y * 4.0, -zoom);
        vec3 rd = normalize(vec3(uv, 1.5)); // Narrower FOV / deeper look

        float tSurf = -ro.z / rd.z;
        vec3 col = vec3(0.0);

        if (tSurf > 0.0) {
          vec3 pW = ro + rd * tSurf;
          float dx = abs(pW.x), dy = abs(pW.y);
          float beamDist = length(pW.xy);
          
          // 1. Raw diffracted laser: 3 parallel lines
          float dryBrush = noise(uv * vec2(800.0, 50.0)) * 0.5 + 0.5;
          float l1 = exp(-abs(dy - 0.03) * 1000.0) * dryBrush;
          float l2 = exp(-abs(dy) * 1200.0) * dryBrush * 1.5;
          float l3 = exp(-abs(dy + 0.03) * 1000.0) * dryBrush;
          
          float threads = noise(pW.xy * 800.0 + time * 2.0) * exp(-beamDist * 15.0) * uSparkle;
          vec3 laserBeam = lCol * (l1 + l2 + l3 + threads * 3.0);

          // 2. Cascading CRT Snow
          vec2 snowUv = uv * vec2(100.0, 800.0) + vec2(sin(time * 0.2), time * 20.0);
          float snow = hash(floor(snowUv)) * pow(hash(uv * 1000.0), 3.0); // More granular pixels
          vec3 tvSnow = lCol * snow * 0.8 * uSnow;

          // 3. Soap bubble membrane (warps depth)
          float crack = smoothstep(0.3, 0.2, dx) + smoothstep(0.3, 0.2, dy);
          crack = clamp(crack, 0.0, 1.0);
          
          float membraneWarp = noise(uv * 5.0 + time * 0.4) * 0.1;
          float silhouette = noise(uv * 3.0 - time * 0.2); // Faint shapes surfacing
          
          vec3 rdDeep = normalize(vec3(uv + look * 0.4 + membraneWarp * crack, 1.5));
          
          // March into the massive cavern
          vec3 deepScene = marchDimension(ro, rdDeep, lCol);

          // Warm orange glow bleeding through
          vec3 orangeBleed = vec3(1.0, 0.35, 0.0) * exp(-beamDist * 4.0) * (0.5 + 0.5 * silhouette);

          vec3 wallSurface = wCol * 0.2 + tvSnow;
          
          col = mix(wallSurface, deepScene + orangeBleed, crack);
          col += laserBeam * smoothstep(0.0, 0.5, zoom); // Fade laser when zoomed out
        } else {
          col = marchDimension(ro, rd, lCol);
        }

        // Endless ceiling brightening as it recedes
        col += lCol * (1.0 - q.y) * 0.25;
        
        // Glitch instability at edges
        float edgeGlitch = smoothstep(0.3, 0.5, length(uv)) * noise(vec2(time * 10.0, uv.y * 50.0));
        col += lCol * edgeGlitch * 0.2;

        col *= 1.4; 
        gl_FragColor = vec4(pow(col, vec3(0.85)), 1.0);
      }
` : shaderVersion === 4 ? `
      // V4 LOGIC: Deep Cavern with Cascading Light-Code Curtain
      vec3 marchDimension(vec3 ro, vec3 rd, vec3 color) {
        float t = 0.0;
        vec3 finalColor = vec3(0.0);
        for(int i = 0; i < 150; i++) {
          if (i >= uSteps) break;
          vec3 p = ro + rd * t;
          p.z += time * 0.3; // faster movement
          
          vec3 p1 = p; p1.x = mod(p1.x + 4.0, 8.0) - 4.0; p1.z = mod(p1.z + 4.0, 8.0) - 4.0;
          float d1 = sdHollowPyramid(p1, 2.0);
          
          float seaRipple = sin(p.x * 3.0 + time * 2.0) * sin(p.z * 3.0 - time * 2.0) * 0.3;
          float islands = p.y + 3.0 + seaRipple;

          float d = min(d1, islands);
          
          if(d < 0.002) {
             float glyphs = getKatakana(p.xy * 50.0, 1.0) + getKatakana(p.yz * 50.0, 2.0);
             finalColor += color * max(0.2, glyphs) * exp(-t * 0.06) * 3.0;
             t += 0.05; // glass layering
          } else {
             t += d * 0.8;
          }
          if(t > uMaxDist) break;
        }
        return finalColor;
      }
      
      void main() {
        vec2 q = gl_FragCoord.xy / res.xy;
        float slant = mix(0.5, 1.0, q.y);
        vec2 uv = (gl_FragCoord.xy - 0.5 * res.xy) / min(res.y, res.x);
        uv.x /= slant;

        vec3 ro = vec3(look.x * 2.0, look.y * 2.0, -zoom * 1.5);
        vec3 rd = normalize(vec3(uv, 1.8));

        float tSurf = -ro.z / rd.z;
        vec3 col = vec3(0.0);

        if (tSurf > 0.0) {
          vec3 pW = ro + rd * tSurf;
          float dx = abs(pW.x), dy = abs(pW.y);
          
          // Curtain of falling light-code
          vec2 snowUv = uv * vec2(150.0, 1000.0) + vec2(0.0, time * 25.0);
          float snow = hash(floor(snowUv)) * pow(hash(uv * 1200.0), 4.0);
          vec3 curtain = lCol * snow * 1.5 * uSnow;

          // Crack opening
          float crack = smoothstep(0.15, 0.05, dx) + smoothstep(0.15, 0.05, dy);
          crack = clamp(crack, 0.0, 1.0);
          
          vec3 rdDeep = normalize(vec3(uv + look * 0.5, 2.0));
          vec3 deepScene = marchDimension(ro, rdDeep, lCol);

          vec3 orangeBleed = vec3(1.0, 0.4, 0.0) * exp(-length(pW.xy) * 3.0) * 1.2;

          col = mix(curtain + wCol * 0.1, deepScene + orangeBleed, crack);
          
          // Add some laser edges around the crack
          float edge = exp(-abs(dx - 0.1) * 200.0) + exp(-abs(dy - 0.1) * 200.0);
          col += lCol * edge * 2.0;

        } else {
          col = marchDimension(ro, rd, lCol);
        }

        col += lCol * (1.0 - q.y) * 0.3;
        col *= 1.5; 
        gl_FragColor = vec4(pow(col, vec3(0.85)), 1.0);
      }
` : `
      // V5 LOGIC: Extreme Macro / Vertiginous Fractal Structures
      vec3 marchDimension(vec3 ro, vec3 rd, vec3 color) {
        float t = 0.0;
        vec3 finalColor = vec3(0.0);
        for(int i = 0; i < 120; i++) {
          if (i >= uSteps) break;
          vec3 p = ro + rd * t;
          p.z += time * 0.1; 
          
          // Dense forest of structures
          vec3 pOb = p; pOb.x = mod(pOb.x + 2.0, 4.0) - 2.0; pOb.z = mod(pOb.z + 2.0, 4.0) - 2.0;
          float obelisk = sdHollowObelisk(pOb.xzy * 2.0) / 2.0;

          float d = obelisk;
          
          if(d < 0.005) {
             float glyphs = getKatakana(p.xy * 80.0, 1.0) + getKatakana(p.yz * 80.0, 2.0);
             float starCluster = exp(-length(fract(p.xz * 2.0) - 0.5) * 40.0) * 4.0;
             finalColor += color * max(0.1, glyphs + starCluster) * exp(-t * 0.1) * 2.0;
             t += 0.05; 
          } else {
             t += d * 0.5;
          }
          if(t > uMaxDist) break;
        }
        return finalColor;
      }
      
      void main() {
        vec2 q = gl_FragCoord.xy / res.xy;
        float slant = mix(0.8, 1.0, q.y);
        vec2 uv = (gl_FragCoord.xy - 0.5 * res.xy) / min(res.y, res.x);
        uv.x /= slant;

        vec3 ro = vec3(look.x * 0.5, look.y * 0.5, -zoom * 0.2 - 0.5);
        vec3 rd = normalize(vec3(uv, 1.0));

        float tSurf = -ro.z / rd.z;
        vec3 col = vec3(0.0);

        if (tSurf > 0.0) {
          vec3 pW = ro + rd * tSurf;
          float dx = abs(pW.x), dy = abs(pW.y);
          
          // Make the crack span almost the entire view, only slight vignetting/wall at extreme edges
          float crack = smoothstep(0.8, 0.3, max(dx, dy));
          
          // Soap bubble warp
          float membraneWarp = noise(uv * 10.0 + time * 0.5) * 0.1;
          vec3 rdDeep = normalize(vec3(uv + membraneWarp, 1.0));
          vec3 deepScene = marchDimension(ro, rdDeep, lCol);

          vec3 orangeBleed = vec3(1.0, 0.4, 0.0) * exp(-length(pW.xy) * 1.5) * noise(uv * 5.0 - time);

          // Foreground macro glitch elements
          float glitch = step(0.99, hash(uv * 100.0 + time)) * exp(-length(pW.xy) * 5.0) * uSparkle;
          vec3 tvSnow = lCol * hash(uv * 500.0 + time * 10.0) * 0.2 * uSnow;

          vec3 wallSurface = wCol * 0.3 + tvSnow;
          
          col = mix(wallSurface, deepScene + orangeBleed, crack);
          col += lCol * glitch;

        } else {
          col = marchDimension(ro, rd, lCol);
        }

        col *= 1.3; 
        gl_FragColor = vec4(pow(col, vec3(0.85)), 1.0);
      }
`}
    `;
  