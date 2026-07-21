<div align="center">

# 🔺 Riftpane

### A Volumetric Laser-Speckle Cavern, Rendered in Real Time

*An interactive WebGL tribute to the layered red-laser visions described by the Code of Reality community*

[![WebGL](https://img.shields.io/badge/WebGL-GLSL%20Fragment%20Shaders-b91c1c?style=for-the-badge&logo=webgl&logoColor=white)](https://github.com/riftpane/riftpane)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vitest](https://img.shields.io/badge/Tested%20with-Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-2ea44f?style=for-the-badge)](./LICENSE)

[**Live Demo**](https://ais-pre-auqo7cetqehwxjrbjhvjfu-594288125821.europe-west1.run.app) · [**Report a Bug**](https://github.com/riftpane/riftpane/issues) · [**Discord**](https://discord.gg/invite/codeofreality)

</div>

---

> 📍 **Canonical Repository Notice**
> 
> This is the official upstream repository for **Riftpane**.
> - **Main Source Code:** [https://github.com/riftpane/riftpane](https://github.com/riftpane/riftpane)
> - **Live App:** [https://ais-pre-auqo7cetqehwxjrbjhvjfu-594288125821.europe-west1.run.app](https://ais-pre-auqo7cetqehwxjrbjhvjfu-594288125821.europe-west1.run.app)
> - **Contributions & Issues:** Please submit all pull requests, feature requests, and bug reports to the [upstream repository](https://github.com/riftpane/riftpane).
>
> *If you are viewing a fork or mirror, please visit the canonical repository link above for official updates, releases, and discussions.*

---

## What is this?

Riftpane is a real-time WebGL renderer that reconstructs, as an art piece, the layered visual world reported by people who've looked into a diffracted red laser under DMT — a phenomenon documented for years by the **Code of Reality** community. Five hand-tuned shader "versions" explore different parts of that shared description: the raw split beam up close, a churning static wall behind it, a translucent membrane, a bird's-eye archipelago, and a distant skyline of glowing hollow architecture.

It's built the way a demoscene or generative-art project is built: raymarched signed distance fields, procedural noise, and a lot of tuning by eye — not a scientific instrument, and not trying to be one.

---

## 🙏 A Tribute to Code of Reality

This project exists because of the work of **[Danny Goler](https://x.com/golerdanny)**, founder of **[Code of Reality](https://codeofreality.org)**, and the **[Project Veilbreak](https://veilbreak.ai)** team, who have spent years building the open protocols and infrastructure that let thousands of people compare notes on what they see. Whatever your own view on what that phenomenon *is*, the amount of careful documentation, community-building, and open data work behind it deserves real respect — and this project is a small, independent way of saying so.

Riftpane is **not** affiliated with, endorsed by, or built in partnership with Code of Reality or Project Veilbreak. It's a fan-made art piece, made by someone outside the community, as a visual love letter to the descriptions the community has shared publicly.

> If anyone from Code of Reality or Project Veilbreak would rather this project be described, linked, or credited differently, please [open an issue](https://github.com/riftpane/riftpane/issues) — it'll be fixed immediately, no questions asked.

### What this project deliberately does *not* claim

- It does **not** claim to render, prove, or approximate an actual "code of reality," a simulation, or any objective structure underlying physical reality.
- It does **not** claim scientific or clinical validity for any visual, neurological, or metaphysical hypothesis.
- It does **not** promote, depict as safe, or encourage the use of DMT or any controlled substance, in any jurisdiction.
- The shader math below describes *how the pixels on your screen are computed* — it is documentation of a rendering technique, not a theory about consciousness or physics.

This is art inspired by shared human testimony, full stop.

---

## 🎨 The Five Scenes

Each version is an independent artistic read of the same shared description — not five attempts at "accuracy," just five compositions.

| # | Name | What you'll see |
| :-: | :--- | :--- |
| **V1** | Classic Cavern | Eye-level tunnel lined with hollow pyramids, a distant obelisk, curling wing-hooks, and a glyph-covered floor. |
| **V2** | Monolithic Teeth | Rows of pyramid "teeth" flanking a central aisle, angled obelisks overhead, a sawtooth horizon, and drifting glass-pane slices catching the light. |
| **V3** | Drone Archipelago | A steep bird's-eye view over organic floating islands, riding a rippling sea of falling light. |
| **V4** | Soap-Bubble Membrane | A translucent membrane hovering mid-scene, refracting the architecture behind it, wrapped in dense vertical glyph-rain. |
| **V5** | Winged Void | Volumetric red/orange fog, towering hollow columns, and wing-forms that hook sharply backward into the dark. |

---

## ⚙️ How It Works

The visual style comes from combining two real, well-established rendering techniques — used here purely for aesthetic effect.

### 1. Laser Speckle & Diffraction Look
Coherent light reflecting off a rough surface produces a granular, high-contrast interference pattern known as **speckle**. We approximate that look with:
- A multi-Gaussian falloff for the central beam plus its diffracted side-orders, and
- High-frequency procedural noise standing in for the random phase interference that gives speckle its grainy texture.

### 2. Volumetric SDF Raymarching
The cavern geometry — pyramids, obelisks, wings, terrain — is built entirely from **signed distance functions** and rendered with raymarching, the same family of techniques used in demoscene shader art:
- Analytic SDF primitives (hollow pyramids, obelisks, ridges, organic islands)
- Distance-based light attenuation and thin-membrane refraction for the volumetric fog and "soap bubble" layer
- A dense procedural glyph grid (Katakana-style characters) layered into surfaces and animated as falling "code rain"

None of the above models any claim about the physiology of altered states — it's the same toolbox any generative-art or VJ shader uses to build an atmosphere.

---

## 🕹️ Interactive Controls

- **Laser wavelength presets** — switch the beam color across the visible spectrum: `650nm` red · `532nm` green · `488nm` cyan · `450nm` blue · `405nm` violet
- **24+ background palettes** — from *Obsidian Black* to *Cosmic Indigo*, plus a custom hex picker
- **Free camera** — click-drag to orbit, scroll to push through the depth of the scene
- **Live performance tuning** — raymarch steps (10–600), max render distance, speckle sparkle intensity, and CRT-snow density, all adjustable in real time

---

## 🏗️ Architecture Notes

Built for smooth 60 FPS interaction, not just a one-off shader demo:

- **Stable WebGL context** — the canvas and context are created once; per-frame updates only touch shader uniforms (`uTime`, `uLook`, `uZoom`, `uLCol`, `uWCol`)
- **Memoized React tree** — controls and canvas wrapper use `React.memo` / `useCallback` to keep UI state changes from ever touching the render loop
- **LRU color caching** — `hexToRgbVec3` caches parsed colors so the hot path never re-parses a hex string per frame

---

## 🧪 Testing

```bash
npm run test              # run the full unit test suite (Vitest)
npm run test:coverage     # run with v8 coverage report
npm run lint              # TypeScript / ESLint checks
```

| Module | Statements | Branches | Functions |
| :--- | :--: | :--: | :--: |
| `src/utils.ts` | 93.3% | 90.0% | 100.0% |
| `src/constants.ts` | 100.0% | 100.0% | 100.0% |
| `src/shaders.ts` | 100.0% | 100.0% | 100.0% |
| `src/components/Controls.tsx` | 100.0% | 100.0% | 100.0% |
| `src/components/WallColorPicker.tsx` | 100.0% | 85.0% | 100.0% |
| `src/components/LaserCanvas.tsx` | 76.5% | 55.9% | 92.8% |

---

## 🚀 Getting Started

**Requirements:** Node.js ≥ 18, npm ≥ 9

```bash
git clone https://github.com/riftpane/riftpane.git
cd riftpane
npm install
npm run dev        # → http://localhost:3000
```

```bash
npm run build      # production bundle
npm run preview    # preview the production build locally
```

---

## 🤝 Contributing

Contributions are welcome — new shader scenes, performance improvements, accessibility fixes, or documentation cleanups all count. Please open an issue before large changes so we can talk direction first, and keep PRs focused on one thing at a time.

By contributing, you agree that your work will be released under this project's MIT license.

---

## 📜 License

MIT — free to use, fork, and build on, for artistic, technical, or educational purposes.

---

<div align="center">

*Made with respect for the people who looked into the light and told the rest of us what they saw.*

</div>
