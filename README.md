<div align="center">

# Riftpane

### A Volumetric Laser-Speckle Cavern, Rendered in Real Time

*An interactive WebGL tribute to the layered red-laser visions described by the Code of Reality community*

[![WebGL](https://img.shields.io/badge/WebGL-GLSL%20Fragment%20Shaders-b91c1c?style=for-the-badge&logo=webgl&logoColor=white)](https://github.com/sakurablush/riftpane)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vitest](https://img.shields.io/badge/Tested%20with-Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-2ea44f?style=for-the-badge)](./LICENSE)

[**Open Riftpane**](https://sakurablush.github.io/riftpane) · [**Report a Bug**](https://github.com/sakurablush/riftpane/issues) · [**Join Discord Community**](https://discord.gg/invite/codeofreality)

</div>

---

## Before Anything Else: A Note on Personal Safety

This project is a tribute to a description — not an invitation to reproduce the experience behind it.

Introducing foreign compounds into the body carries serious, often irreversible risks: cardiovascular damage, neurological harm, psychological destabilization, and severe criminal liability in most jurisdictions. These are not theoretical concerns. As the author of this project, I explicitly discourage any practice that exposes you to permanent damage or long-term suffering.

None of that puts the underlying testimony off-limits to think about. The description this project is built on has been discussed openly and thoughtfully, for years, by a community engaged in honest reflection and research. It's entirely possible to read that testimony, take it seriously, and even build art from it, without ever using the substances it describes. That's the spirit Riftpane was made in.

---

> **Canonical Repository Notice**
>
> This is the official upstream repository for **Riftpane**.
> - **Main Source Code:** [https://github.com/sakurablush/riftpane](https://github.com/sakurablush/riftpane)
> - **Production:** [https://sakurablush.github.io/riftpane](https://sakurablush.github.io/riftpane)
> - **Contributions & Issues:** Please submit all pull requests, feature requests, and bug reports to the [upstream repository](https://github.com/sakurablush/riftpane).
>
> *If you are viewing a fork or mirror, please visit the canonical repository link above for official updates, releases, and discussions.*

---

## What is this?

Riftpane is a real-time WebGL renderer that treats a specific piece of shared visual testimony as an art brief. The Code of Reality community has spent years describing, in detail, the layered scene a diffracted red laser reveals — most recently in a long-form [interview on the Close Encounter Club YouTube channel](https://youtu.be/I4JGLyrV7cQ). This project takes one facet of that shared description — an eye-level tunnel lined with hollow pyramids, a distant obelisk, curling wing-hooks, and a glyph-covered floor — and reconstructs it as a raymarched shader piece.

The exact prompts used to build these shaders are documented in [`docs/vision-prompts.md`](./docs/vision-prompts.md).

It's built the way a demoscene or generative-art project is built: signed distance fields, procedural noise, and a lot of tuning by eye. It's not a scientific instrument, and it doesn't try to be one.

---

## Typography

The `CodeOfRealityV1.otf` font used for glyph rendering was provided by the Discord channel administrator of the Code of Reality community and used here with their direct permission. It is **not** open-source software, and the MIT license below does not apply to it.

That permission was granted specifically to this canonical repository and its production build — not to "Riftpane" as a general idea, and not automatically to any fork, clone, download, or mirror. **If you fork or otherwise copy this repository, that permission does not come with it.** Before you publish, deploy, or redistribute your own copy, either remove the font file (and anything that embeds it), or contact the original author directly for your own separate, written permission.

Full terms — including what happens on a fork — are in [`assets/fonts/FONT-LICENSE.md`](./assets/fonts/FONT-LICENSE.md).

## Music

Riftpane includes optional background music:
- **`public/audio/riftpane.mp3`** — lightweight looped track bundled with the web build and played lazily via the music button in the top bar. It is served as part of the site assets.
- **`assets/audio/riftpane_full.mp3`** — higher-quality version kept in the repository for reference and redistribution under the same MIT license as the rest of the source code. You can download it directly from the repo.

Both tracks are original compositions created for this project and are released under the same MIT license as the code. No separate music license is required.

### VirusTotal Scans
- [CodeOfRealityV1.otf scan](https://www.virustotal.com/gui/file/d1f6a0ccb08c3863a0e05d07dc5efabd19b863f97b56f0646309088e116ae81a)
- [riftpane_full.mp3 scan](https://www.virustotal.com/gui/file/6e10b9a856f6dcadf5caa065be8e1fde7aa471ad59a4f481523edf4c1222defb)
- [riftpane_full.mp3 scan](https://www.virustotal.com/gui/file/b855f92b5356be219cd39ca10889383db0883ea00dc9de9d7f3218e43688c363)

---

## A Tribute — Mostly to the Community

This project was born from fascination with a phenomenon described by the Code of Reality Discord community — a group of people who share ideas openly, listen carefully, and treat each other with genuine kindness. Their willingness to keep these conversations public is what made this art piece possible.

Special thanks to **[Danny Goler](https://dannygoler.com/)**, whose work with **[Code of Reality](https://codeofreality.org)** and **[Project Veilbreak](https://veilbreak.ai)** created the space where this testimony was shared so openly. I'm not part of those teams — I'm simply someone who read the description, watched the interview, and wanted to see whether it could be rendered in real time. That's the whole origin story.

Riftpane is **not** affiliated with, endorsed by, or built in partnership with Code of Reality or Project Veilbreak. It's a fan-made art piece, made with love for the community and gratitude for the testimony they chose to share publicly.

> If anyone from Code of Reality or Project Veilbreak would rather this project be described, linked, or credited differently, please [open an issue](https://github.com/sakurablush/riftpane/issues) — it will be fixed immediately, no questions asked. You can also find me on the [Code of Reality Discord](https://discord.gg/invite/codeofreality).

### What this project deliberately does not claim

- It does **not** claim to render, prove, or approximate an actual "code of reality," a simulation, or any objective structure underlying physical reality.
- It does **not** claim scientific, clinical, or philosophical validity for any hypothesis about consciousness, perception, or physics.
- It does **not** promote, encourage, or depict as safe the use of any controlled substance, in any jurisdiction — see the note at the top of this document.
- The shader math below describes *how the pixels on your screen are computed* — it is documentation of a rendering technique, not a theory about consciousness or reality.

This is art inspired by shared human testimony, full stop.

---

## The Scene

This first release offers eight artistic interpretations of the shared description — each one a different read on the same source material, rendered in real time with distinct shader worlds.

| # | Name | What You'll See |
|:-:|:-----|:-----------------|
| 1 | **Classic Cavern** | An eye-level tunnel lined with hollow pyramids, a distant obelisk, curling wing-hooks, and a glyph-covered floor. |
| 2 | **Veil Void Islands** | Organic island shapes floating on a rippling sea of descending pixels, seen from a bird's-eye angle. |
| 3 | **Speckle Lattice Spires** | Sharp, repeating spires forming a lattice of diffracted light and procedural noise. |
| 4 | **Membrane Rift Panes** | A translucent soap-bubble layer warping massive glowing structures behind it. |
| 5 | **Hollow Obelisks & Wing Hooks** | Twin-lined obelisks with hollow peaks, wing-like hooks curling outward then snapping back. |
| 6 | **Wing Hook Nexus** | Dense clusters of curved hook forms suggestive of wings, orbiting in a dark void. |
| 7 | **Pixel Sea** | An ocean of gently rounded landmasses on a wavy, rippling pixel sea, seen from above. |
| 8 | **Crystalline Void Glyphs** | Abstract crystalline structures with embedded randomly sampled glyphs, fading into the void. |

---

## How It Works

The visual style comes from combining two real, well-established rendering techniques — used here purely for aesthetic effect.

### 1. Laser Speckle & Diffraction Look
Coherent light reflecting off a rough surface produces a granular, high-contrast interference pattern known as **speckle**. We approximate that look with:
- A multi-Gaussian falloff for the central beam plus its diffracted side-orders, and
- High-frequency procedural noise standing in for the random phase interference that gives speckle its grainy texture.

### 2. Volumetric SDF Raymarching
The cavern geometry — pyramids, obelisks, wings, terrain — is built entirely from **signed distance functions** and rendered with raymarching, the same family of techniques used in demoscene shader art:
- Analytic SDF primitives (hollow pyramids, obelisks, ridges, organic islands)
- Distance-based light attenuation and thin-membrane refraction for the volumetric fog and "soap bubble" layer
- A dense procedural glyph grid (Code of Reality font characters) layered into surfaces and animated as falling "code rain"

None of the above models any claim about the physiology of altered states — it's the same toolbox any generative-art or VJ shader uses to build an atmosphere.

---

## Interactive Controls

- **Laser wavelength presets** — switch the beam color across the visible spectrum: `650nm` red · `532nm` green · `488nm` cyan · `450nm` blue · `405nm` violet
- **90+ curated wall palettes** — from Sakura Pink to Cosmic Indigo, plus a custom hex picker
- **Free camera** — click-drag to orbit, scroll to push through the depth of the scene
- **Live performance tuning** — raymarch steps (1–500), max render distance (10–500), diffraction intensity, and laser slit width, all adjustable in real time

---

## Architecture Notes

Built for optimized real-time interaction, not just a one-off shader piece:

- **Stable WebGL context** — the canvas and context are created once; per-frame updates only touch shader uniforms (`uTime`, `uLook`, `uZoom`, `uLCol`, `uWCol`)
- **Memoized React tree** — controls and canvas wrapper use `React.memo` / `useCallback` to keep UI state changes from ever touching the render loop
- **LRU color caching** — `hexToRgbVec3` caches parsed colors so the hot path never re-parses a hex string per frame

---

## Testing

```bash
npm run test              # run the full unit test suite (Vitest)
npm run test:coverage     # run with v8 coverage report
npm run lint              # TypeScript / ESLint checks
```

Dependencies are pinned via `package-lock.json`. Run `npm ci` for reproducible installs.

---

## Getting Started

**Requirements:** Node.js >= 18, npm >= 9

```bash
git clone https://github.com/sakurablush/riftpane.git
cd riftpane
npm ci
npm run dev        # -> http://localhost:3000
```

```bash
npm run build      # production bundle
npm run preview    # preview the production build locally
```

---

## Contributing

Contributions are welcome — new shader scenes, performance improvements, accessibility fixes, or documentation cleanups all count. Please open an issue before large changes so we can talk direction first, and keep PRs focused on one thing at a time.

Because this project rests on someone else's testimony and a community's trust, please keep contributions in that same spirit: respectful of the source material, and free of anything that treats the use of external substances as something to encourage or make light of.

By contributing, you agree that your work will be released under this project's MIT license.

---

## License

The Riftpane source code is MIT — free to use, fork, and build on, for artistic, technical, or educational purposes.

**The one exception is the `CodeOfRealityV1.otf` font.** It is not covered by this license, it is not open source, and forking or copying this repository does not grant any right to keep or use it. See [Typography](#typography) above and [`assets/fonts/FONT-LICENSE.md`](./assets/fonts/FONT-LICENSE.md) for its actual terms.

---

<div align="center">

*Made with fascination for the phenomenon described by the Code of Reality community and with love for their Discord community.*

</div>