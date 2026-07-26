import { describe, it, expect, beforeEach } from 'vitest';
import { useCameraStore } from '../../state/cameraStore';

describe('cameraStore', () => {
  beforeEach(() => {
    useCameraStore.setState({ lookX: 0, lookY: 0.2, zoom: 5.0 });
  });

  it('starts with default values', () => {
    const state = useCameraStore.getState();
    expect(state.lookX).toBe(0);
    expect(state.lookY).toBe(0.2);
    expect(state.zoom).toBe(5.0);
  });

  it('setLook updates both axes', () => {
    useCameraStore.getState().setLook(1.0, 2.0);
    const state = useCameraStore.getState();
    expect(state.lookX).toBe(1.0);
    expect(state.lookY).toBe(2.0);
  });

  it('updateLook mutates by delta', () => {
    useCameraStore.getState().updateLook(0.5, -0.5);
    const state = useCameraStore.getState();
    expect(state.lookX).toBeCloseTo(0.5);
    expect(state.lookY).toBeCloseTo(-0.3);
  });

  it('zoomBy scales zoom', () => {
    useCameraStore.getState().zoomBy(2.0);
    expect(useCameraStore.getState().zoom).toBe(10.0);
  });

  it('setZoom clamps zoom to valid range', () => {
    useCameraStore.getState().setZoom(99);
    expect(useCameraStore.getState().zoom).toBe(30);
    useCameraStore.getState().setZoom(-99);
    expect(useCameraStore.getState().zoom).toBe(-30);
  });

  it('resetCamera restores defaults', () => {
    useCameraStore.getState().setLook(10, 10);
    useCameraStore.getState().setZoom(20);
    useCameraStore.getState().resetCamera();
    const state = useCameraStore.getState();
    expect(state.lookX).toBe(0);
    expect(state.lookY).toBe(0.2);
    expect(state.zoom).toBe(5.0);
  });
});