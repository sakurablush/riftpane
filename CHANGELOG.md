# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-07-22

### Added
- Initial public release of Riftpane
- Real-time WebGL volumetric laser-speckle cavern renderer
- V1 shader: "Classic Cavern" — hollow pyramids, obelisks, wing-hooks, glyph-covered floor
- Interactive controls: version picker, laser wavelength selector, wall color palette
- Performance sliders: raymarch steps, distance, snow intensity, sparkle intensity
- Camera controls: click-drag orbit, scroll zoom, reset buttons
- HUD toggle with always-visible show-HUD button when hidden
- 24+ wall color presets with custom hex and color picker inputs
- Font atlas generation for Katakana and mapped glyph rendering
- Full test suite with Vitest (46 tests, ~96.9% coverage)

### Changed
- Removed all Gemini/IE dependencies and references
- Updated metadata schema to standard browser/WebGL capability declaration
- Unified UI theme under sakura color palette with Tailwind @theme variables
- Split monolithic Controls component into TopControls and BottomControls
- Replaced text-based tribute links with icon-only buttons (GitHub, CoR, Discord)
- Reordered icon buttons: Perf Reset | Camera Reset | HUD Toggle

### Fixed
- Vite config mojibake comment restored to ASCII
- Unused Heart import removed from WallColorPicker
- All magic numbers in shaders replaced with named GLSL constants
