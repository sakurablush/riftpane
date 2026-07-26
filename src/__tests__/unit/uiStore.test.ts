import { describe, it, expect, beforeEach } from 'vitest';
import { useUiStore } from '../../state/uiStore';

describe('uiStore', () => {
  beforeEach(() => {
    useUiStore.setState({ hudVisible: true, showDisclaimer: false, crtGlitch: true });
  });

  it('hudVisible defaults to true', () => {
    expect(useUiStore.getState().hudVisible).toBe(true);
  });

  it('toggleHud flips visibility', () => {
    useUiStore.getState().toggleHud();
    expect(useUiStore.getState().hudVisible).toBe(false);
    useUiStore.getState().toggleHud();
    expect(useUiStore.getState().hudVisible).toBe(true);
  });

  it('toggleCrtGlitch flips scanlines', () => {
    useUiStore.getState().toggleCrtGlitch();
    expect(useUiStore.getState().crtGlitch).toBe(false);
  });

  it('setShowDisclaimer updates modal state', () => {
    useUiStore.getState().setShowDisclaimer(true);
    expect(useUiStore.getState().showDisclaimer).toBe(true);
    useUiStore.getState().setShowDisclaimer(false);
    expect(useUiStore.getState().showDisclaimer).toBe(false);
  });
});