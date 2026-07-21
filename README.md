# Riftpane — Laser Speckle & Volumetric Cavern Simulator

An interactive, high-performance **WebGL (GLSL)** application simulating optical coherent laser diffraction, granular speckle interference phenomena, and multi-layered volumetric raymarched geometries across distinct spatial configurations.

![WebGL](https://img.shields.io/badge/WebGL-GLSL%20Fragment%20Shaders-red) ![React](https://img.shields.io/badge/React-18.3-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue) ![Vitest](https://img.shields.io/badge/Testing-Vitest%20%2B%20Coverage-brightgreen) ![License](https://img.shields.io/badge/License-MIT-green)

> 📍 **Canonical Repository Notice**
> 
> This is the official upstream repository for **Riftpane**.
> - **Main Source Code:** [https://github.com/riftpane/riftpane](https://github.com/riftpane/riftpane)
> - **Live App:** [https://ais-pre-auqo7cetqehwxjrbjhvjfu-594288125821.europe-west1.run.app](https://ais-pre-auqo7cetqehwxjrbjhvjfu-594288125821.europe-west1.run.app)
> - **Contributions & Issues:** Please submit all pull requests, feature requests, and bug reports to the [upstream repository](https://github.com/riftpane/riftpane).
>
> *If you are viewing a fork or mirror, please visit the canonical repository link above for official updates, releases, and discussions.*

---

## 🌌 Visual Tribute to Code of Reality

> **In Short:** **Riftpane** is an artistic, interactive web experience that visually reconstructs what hundreds of individuals in the **Code of Reality** community describe when observing diffracted red laser light under DMT—a layered, structured, "constructed" space glimpsed as if through a narrow rift in reality.

### About the Project
Riftpane is neither a scientific experiment nor an attempt to prove or disprove any hypothesis—it is a purely artistic interpretation. Taking descriptions documented over years by the Code of Reality community, it translates these subjective accounts into a multi-layered, parallax WebGL visualization: from the foreground split laser beam, through a shimmering noise wall and translucent membrane, across pixel archipelagos, to distant glowing outline architectures—with each layer revealing swarming Katakana-like glyphs upon close inspection.

### Acknowledgments
This project is created out of deep respect and as a tribute to the work of **Danny Goler**, founder of **Code of Reality** ([codeofreality.org](https://codeofreality.org)), and the **Project Veilbreak** team, who have spent years documenting and standardizing these reports under open research protocols. Riftpane is an independent, fan-made artistic interpretation and is not officially affiliated with Code of Reality or Project Veilbreak.

### Disclaimer
*This project does not promote, condone, or encourage the use of illegal or controlled substances in any jurisdiction. It does not evaluate the validity of simulation hypotheses or the "code of reality"—it is strictly a visual and artistic exploration of reported phenomena, not a scientific statement.*

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
  - **Raymarch Steps** (10 → 600 iterations)
  - **Raymarch Max Distance** (10 → 120 units)
  - **CRT Snow Intensity** (0.0 → 8.0)
  - **Speckle Sparkle Intensity** (0.0 → 8.0)

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
# Clone the canonical repository
git clone https://github.com/riftpane/riftpane.git
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
