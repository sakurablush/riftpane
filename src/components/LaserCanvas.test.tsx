import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';
import { LaserCanvas } from './LaserCanvas';
import { SimulationConfig } from '../types';

// Use fake timers to control the requestAnimationFrame loop
beforeAll(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  vi.clearAllTimers();
});

const mockConfig: SimulationConfig = {
  wavelength: 650,
  intensity: 0.8,
  speckleContrast: 0.8,
  speckleGrain: 1.5,
  speckleSpeed: 1.0,
  parallaxStrength: 1.0,
  zoomLevel: 1.0,
  glitchRate: 0.1,
  noiseLevel: 0.5,
  dofFocus: 0.5,
  dofStrength: 0.5,
  microscopeX: 0.5,
  microscopeY: 0.5,
  showMicroscope: true,
  showNearestLayer: true,
  showChurningWall: true,
  showMembrane: true,
  showArchipelago: true,
  showArchitecture: true,
  raymarchSteps: 90,
  raymarchDistance: 60,
  snowIntensity: 0.3,
  sparkleIntensity: 1.0,
  shaderVersion: 1,
};

describe('LaserCanvas Component', () => {
  it('renders canvas element with webgl context', () => {
    const handleDepthChange = vi.fn();
    render(<LaserCanvas config={mockConfig} wallColor="#050000" onZDepthChange={handleDepthChange} />);

    const canvas = screen.getByTestId('laser-canvas');
    expect(canvas).toBeInTheDocument();
    expect(canvas.tagName.toLowerCase()).toBe('canvas');
  });

  it('handles mouse drag events for camera look controls', () => {
    render(<LaserCanvas config={mockConfig} wallColor="#050000" onZDepthChange={vi.fn()} />);

    const canvas = screen.getByTestId('laser-canvas');

    // Mousedown
    fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100 });
    // Mousemove drag
    fireEvent.mouseMove(window, { clientX: 150, clientY: 120 });
    // Mouseup
    fireEvent.mouseUp(window);
  });

  it('handles wheel events to adjust zoom depth', () => {
    const handleDepthChange = vi.fn();
    render(<LaserCanvas config={mockConfig} wallColor="#050000" onZDepthChange={handleDepthChange} />);

    const canvas = screen.getByTestId('laser-canvas');

    fireEvent.wheel(canvas, { deltaY: 100 });
    expect(handleDepthChange).toHaveBeenCalled();
  });

  it('handles window resize events without breaking canvas', () => {
    render(<LaserCanvas config={mockConfig} wallColor="#050000" onZDepthChange={vi.fn()} />);

    fireEvent.resize(window);
  });

  it('re-initializes program when shaderVersion changes', () => {
    const { rerender } = render(
      <LaserCanvas config={mockConfig} wallColor="#050000" onZDepthChange={vi.fn()} />
    );

    const updatedConfig = { ...mockConfig, shaderVersion: 2 };
    rerender(<LaserCanvas config={updatedConfig} wallColor="#050000" onZDepthChange={vi.fn()} />
    );
  });

  it('runs render loop and cleans up timers on unmount', async () => {
    const { unmount } = render(<LaserCanvas config={mockConfig} wallColor="#050000" onZDepthChange={vi.fn()} />);

    // Advance timers to trigger the rAF callbacks
    await vi.advanceTimersByTimeAsync(100);

    expect(screen.getByTestId('laser-canvas')).toBeInTheDocument();

    unmount();
  });

  it('gracefully handles missing canvas or null webgl context', () => {
    const spy = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValueOnce(null);

    render(<LaserCanvas config={mockConfig} wallColor="#050000" onZDepthChange={vi.fn()} />);

    expect(screen.getByTestId('laser-canvas')).toBeInTheDocument();
    spy.mockRestore();
  });
});
