import { describe, it, expect, beforeEach } from 'vitest';
import { useRendererStore } from '../../state/rendererStore';

describe('rendererStore', () => {
  beforeEach(() => {
    useRendererStore.getState().setWallHex('#05000c');
    useRendererStore.getState().setLaserNm(532);
    useRendererStore.setState({ activeVersionIdx: 0, fps: 60 });
  });

  it('initializes with default quality values', () => {
    const state = useRendererStore.getState();
    expect(state.slitWidth).toBe(1.0);
    expect(state.steps).toBe(64);
    expect(state.maxDist).toBe(80.0);
    expect(state.snowDensity).toBe(0.01);
    expect(state.diffractionIntensity).toBe(5.0);
  });

  it('updates quality values', () => {
    useRendererStore.getState().setSlitWidth(2.5);
    useRendererStore.getState().setSteps(32);
    useRendererStore.getState().setMaxDist(120);
    useRendererStore.getState().setSnowDensity(0.1);
    useRendererStore.getState().setDiffractionIntensity(3.0);
    const state = useRendererStore.getState();
    expect(state.slitWidth).toBe(2.5);
    expect(state.steps).toBe(32);
    expect(state.maxDist).toBe(120);
    expect(state.snowDensity).toBe(0.1);
    expect(state.diffractionIntensity).toBe(3.0);
  });

  it('resets quality settings and laser to defaults', () => {
    useRendererStore.getState().setSlitWidth(5.0);
    useRendererStore.getState().setSteps(80);
    useRendererStore.getState().setDiffractionIntensity(0.0);
    useRendererStore.getState().setLaserNm(650);
    useRendererStore.getState().resetSettings();
    const state = useRendererStore.getState();
    expect(state.slitWidth).toBe(1.0);
    expect(state.steps).toBe(64);
    expect(state.maxDist).toBe(80.0);
    expect(state.snowDensity).toBe(0.01);
    expect(state.diffractionIntensity).toBe(5.0);
    expect(state.laserNm).toBe(532);
    expect(state.laserHex).toBe('#10ff51');
  });

  it('changes version index', () => {
    useRendererStore.getState().setVersionIdx(3);
    expect(useRendererStore.getState().activeVersionIdx).toBe(3);
  });

  it('changes laser nm', () => {
    useRendererStore.getState().setLaserNm(532);
    expect(useRendererStore.getState().laserNm).toBe(532);
    expect(useRendererStore.getState().laserHex).toBe('#10ff51');
  });

  it('ignores invalid laser nm', () => {
    useRendererStore.getState().setLaserNm(9999);
    expect(useRendererStore.getState().laserNm).toBe(532);
  });

  it('changes wall color', () => {
    useRendererStore.getState().setWall('#2633d0', [0.15, 0.2, 0.82]);
    const state = useRendererStore.getState();
    expect(state.wallHex).toBe('#2633d0');
    expect(state.wallRgb).toEqual([0.15, 0.2, 0.82]);
  });

  it('updates fps', () => {
    useRendererStore.getState().setFps(60);
    expect(useRendererStore.getState().fps).toBe(60);
  });
});