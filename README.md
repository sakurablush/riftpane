# Riftpane — Laser Speckle & Volumetric Cavern Simulator

An interactive, high-performance **WebGL (GLSL)** application simulating optical coherent laser diffraction, granular speckle interference phenomena, and multi-layered volumetric raymarched geometries across distinct spatial configurations.

![Project Banner](https://img.shields.io/badge/WebGL-GLSL%20Fragment%20Shaders-red) ![React](https://img.shields.io/badge/React-18.3-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue) ![Vitest](https://img.shields.io/badge/Testing-Vitest%20%2B%20Coverage-brightgreen)

---

## 🔬 Scientific & Technical Overview

When coherent laser light reflects off an optically rough surface, wave fronts with randomized relative phase delays interfere constructively and destructively. This produces a granular, highly detailed spatial intensity distribution known as a **laser speckle pattern**.

This simulator combines optical wave physics with real-time **Signed Distance Function (SDF) Raymarching** to model a multidimensional cavern structure viewed through a narrow spatial rift.

### Key Simulation Principles

1. **Coherent Laser Diffraction & Speckle Modeling**
   - **Zero-Order Main Beam & Diffracted Higher Orders**: Multi-Gaussian dispersion equations model central zero-order intensity alongside orthogonal grid diffraction spots.
   - **Phase Interference Speckle Noise**: High-frequency procedural pseudo-random noise models granulate surface intensity according to physical optical roughness parameters.

2. **Volumetric SDF Raymarching**
   - **Signed Distance Fields (SDFs)**: Analytic raymarching primitives including hollow converging pyramids, square hollow obelisks, curved backward wings, jagged sawtooth ridges, and smooth procedural terrain islands.
   - **Volumetric Translucent Transport**: Light attenuation over distance ($e^{-\alpha t}$), refraction through thin soap-bubble membranes, and transparency slicing across discrete Z-axis glass panes.
   - **Katakana Matrix Rain Fields**: High-density procedural glyph generators ($20\times20$ tile grids) rendering dynamic pixel rain embedded within surface textures.

---

## 🏛️ Shader Architectures (Versions V1 – V5)

The application provides **5 distinct mathematical interpretations** of the volumetric cavern geometry:

| Version | Name | Description & Spatial Geometry |
| :--- | :--- | :--- |
| **V1** | **Classic Raymarched Cavern** | Standard eye-level perspective into an infinite tunnel lined with hollow pyramids, distant obelisks, wing hooks, and a glyph-covered floor. |
| **V2** | **Monolithic Teeth & Glass Slices** | Parallel rows of hollow pyramid "teeth" forming a central aisle, angled overhead obelisks, jagged sawtooth ground, and Z-axis glass pane slice planes with static glints. |
| **V3** | **Drone Archipelago & Wavy Sea** | High-angle elevated drone camera overlooking organic floating islands drifting on a rippling, wavy ocean of glowing light particles. |
| **V4** | **Soap Bubble Membrane & Katakana Rain** | Centered translucent soap-bubble membrane with refractive warps over background obelisks, surrounded by high-density vertical CRT Katakana pixel rain. |
| **V5** | **Curved Winged Void & Volumetric Cavern** | Volumetric light scattering within a deep void, featuring sharply hooking backward wing structures, towering hollow pyramid columns, and volumetric red/orange fog accumulation. |

---

## 🎨 Interactive Capabilities

- **Spectral Wavelength Selection**: Switch between physical laser wavelengths:
  - `650nm` (Deep Red Laser)
  - `532nm` (Emerald Green Laser)
  - `488nm` (Cyan Argon Laser)
  - `450nm` (Deep Blue Laser)
  - `405nm` (Violet Diode Laser)
- **24+ Wall Color Palette**: Floating popover modal with 24 custom wall background materials (e.g., *Obsidian Black*, *Charcoal Matte*, *Dark Crimson*, *Abyssal Blue*, *Cosmic Indigo*) and custom HTML5 Hex color input.
- **Dynamic Camera Controls**: Click and drag across the WebGL canvas to rotate the camera orientation (`look.x`, `look.y`); scroll to adjust viewport depth (`zoom`).
- **Real-Time Performance Tuning**:
  - **Raymarch Steps** ($10 \rightarrow 600$ iterations)
  - **Raymarch Max Distance** ($10 \rightarrow 120$ units)
  - **CRT Snow Intensity** ($0.0 \rightarrow 8.0$)
  - **Speckle Sparkle Intensity** ($0.0 \rightarrow 8.0$)

---

## 🛠️ Architecture & React Optimization

The codebase adheres strictly to high-performance React and WebGL best practices:

- **Animation Loop Optimization**: WebGL context initialization occurs once; animation frames update uniform vectors (`uTime`, `uLook`, `uZoom`, `uLCol`, `uWCol`) without destroying or recreating shaders on state changes.
- **Memoized Callbacks & Components**: All controls and canvas wrappers utilize `React.memo` and `useCallback` to eliminate unnecessary UI re-renders during 60 FPS animation loops.
- **LRU Hex Color Caching**: `hexToRgbVec3` caches parsed RGB float vectors to eliminate regex evaluation on every render loop.

---

## 🧪 Testing & Code Coverage

Unit tests are implemented using **Vitest** and **React Testing Library** with a mock WebGL context runner and `v8` code coverage.

### Running Tests

```bash
# Run all unit tests
npm run test

# Run tests with V8 coverage report
npm run test:coverage

# Run TypeScript linter
npm run lint
```

### Coverage Overview

| Module | Statement % | Branch % | Functions % |
| :--- | :--- | :--- | :--- |
| `src/utils.ts` | **93.3%** | **90.0%** | **100.0%** |
| `src/constants.ts` | **100.0%** | **100.0%** | **100.0%** |
| `src/shaders.ts` | **100.0%** | **100.0%** | **100.0%** |
| `src/components/Controls.tsx` | **100.0%** | **100.0%** | **100.0%** |
| `src/components/WallColorPicker.tsx` | **100.0%** | **85.0%** | **100.0%** |
| `src/components/LaserCanvas.tsx` | **76.5%** | **55.9%** | **92.8%** |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.0
- **npm** >= 9.0

### Installation

```bash
# Clone repository
git clone https://github.com/your-username/riftpane.git
cd riftpane

# Install dependencies
npm install

# Start Vite development server on port 3000
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your web browser.

### Production Build

```bash
# Compile bundle
npm run build

# Preview build locally
npm run preview
```

---

## 📜 License

MIT License. Open source for academic, artistic, and technical research.
