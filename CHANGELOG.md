# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-07-22

### The First Breath

This is where it begins. Riftpane exists because of the people of the **Code of Reality** community — the ones who looked into the light, described what they saw, and trusted that someone might try to build it. This first release is that attempt: a single, hand-tuned shader world, rendered in real time, built as a love letter to their testimony.

### What's Inside

- **Real-time WebGL renderer** — a live, interactive laser-speckle cavern built entirely in GLSL fragment shaders
- **V1: Classic Cavern** — eye-level tunnel of hollow pyramids, distant obelisks, curling wing-hooks, and a glyph-covered floor
- **Laser wavelength selector** — five coherent-light presets across the visible spectrum: `650nm` red · `532nm` green · `488nm` cyan · `450nm` blue · `405nm` violet
- **Wall color palette** — 24+ hand-picked backgrounds from *Obsidian Black* to *Cosmic Indigo*, plus a custom hex picker and native color input
- **Free camera** — click-drag to orbit through the scene, scroll to push through depth, with dedicated reset buttons
- **Performance tuning** — live sliders for raymarch steps (10–600), render distance, speckle sparkle, and CRT snow density
- **HUD controls** — toggle the interface on/off; a dedicated button appears when the HUD is hidden so you can always get back
- **Katakana & glyph atlas** — procedural font atlas generation for the code-rain and surface glyphs

### How It's Built

- **Raymarched SDFs** — every piece of geometry is a signed distance function: hollow pyramids, obelisks, wings, sawtooth ridges, organic terrain
- **Procedural atmosphere** — volumetric fog, laser speckle interference, diffraction patterns, dynamic glow, and falling glyph rain, all computed per-pixel
- **Memoized React shell** — `React.memo` and `useCallback` keep the UI from ever touching the render loop; state changes only update shader uniforms
- **Named shader constants** — every tuning value in the GLSL is a `#define` with a descriptive name, not a magic number
- **LRU color cache** — hex-to-RGB parsing is cached so the hot path never re-parses strings per frame

### Gratitude

This project stands on the testimony of the **Code of Reality** community.
Special thanks to **Danny Goler** for founding CoR, to the **Project Veilbreak** team,
and to the Discord channel administrator who provided the `CodeOfRealityV1.otf` font.

Riftpane is not affiliated with, endorsed by, or built in partnership with Code of Reality
or Project Veilbreak. It is a fan-made art piece, made outside the community, as a visual
love letter to the descriptions shared publicly by its members.

If anyone from Code of Reality or Project Veilbreak would prefer this project to be
described, linked, or credited differently, please open an issue — it will be fixed
immediately, no questions asked.

---

*Made with respect for the people who looked into the light and told the rest of us what they saw.*
