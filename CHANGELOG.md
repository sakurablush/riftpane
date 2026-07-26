# Changelog

## 0.1.0 — 2026-07-26

### Added
- Initial public release of Riftpane.
- Real-time WebGL raymarched cavern renderer with 8 unique shader worlds.
- Laser wavelength presets (650nm, 532nm, 488nm, 450nm, 405nm).
- 90+ curated wall color palettes with custom hex picker.
- Free camera orbit (drag) and zoom (scroll).
- Live performance tuning: raymarch steps, max distance, diffraction intensity, slit width.
- Photosensitive disclaimer flow with locked input during dialogs.
- Background music support with lazy-loaded lightweight track.
- CoR glyph atlas rendered via WebGL texture with async font loading.
- VirusTotal scan references for font and audio assets.

### Changed
- Default camera Y raised to 0.2 for top-down perspective.
- Default laser set to 488nm cyan.
- Reset sliders no longer changes laser color.
- Music button defaults to ON with muted fallback if autoplay is blocked.
- HUD bars use 50% opacity, 85% on hover.

### Fixed
- Canvas zoom/drag disabled during PreDisclaimer and PhotosensitiveDisclaimer.
- RelaxBreathe controls fade only on explicit user interaction.
- Credit positioning always visible under TopBar or next to unhide button.
- Shader performance optimizations: reduced marchDeep iterations, removed expensive branches.
- Glyph atlas orientation fixed with UNPACK_FLIP_Y_WEBGL.
