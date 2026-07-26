// Camera Store — look, zoom, reset
import { create } from 'zustand';

interface CameraState {
  lookX: number;
  lookY: number;
  zoom: number;
  setLook: (x: number, y: number) => void;
  updateLook: (dx: number, dy: number) => void;
  setZoom: (v: number) => void;
  zoomBy: (factor: number) => void;
  resetCamera: () => void;
}

const INITIAL_ZOOM = 5.0;
const ZOOM_MIN = -30.0;
const ZOOM_MAX = 30.0;
const INITIAL_LOOK_Y = 0.2;

export const useCameraStore = create<CameraState>()((set) => ({
  lookX: 0,
  lookY: INITIAL_LOOK_Y,
  zoom: INITIAL_ZOOM,
  setLook: (x, y) => set({ lookX: x, lookY: y }),
  updateLook: (dx, dy) => set((s) => ({
    lookX: s.lookX + dx,
    lookY: s.lookY + dy,
  })),
  setZoom: (v) => set({ zoom: Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, v)) }),
  zoomBy: (factor) => set((s) => ({
    zoom: Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, s.zoom * factor)),
  })),
  resetCamera: () => set({ lookX: 0, lookY: INITIAL_LOOK_Y, zoom: INITIAL_ZOOM }),
}));