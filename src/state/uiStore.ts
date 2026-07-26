import { create } from 'zustand';

interface UiState {
  hudVisible: boolean;
  showDisclaimer: boolean;
  crtGlitch: boolean;
  toggleHud: () => void;
  setShowDisclaimer: (v: boolean) => void;
  toggleCrtGlitch: () => void;
}

export const useUiStore = create<UiState>()((set) => ({
  hudVisible: true,
  showDisclaimer: false,
  crtGlitch: true,
  toggleHud: () => set((s) => ({ hudVisible: !s.hudVisible })),
  setShowDisclaimer: (v) => set({ showDisclaimer: v }),
  toggleCrtGlitch: () => set((s) => ({ crtGlitch: !s.crtGlitch })),
}));
