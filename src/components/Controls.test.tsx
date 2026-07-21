import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TopControls, BottomControls } from './Controls';
import { SimulationConfig } from '../types';
import { LASER_WAVELENGTHS } from '../constants';

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

describe('TopControls Component', () => {
  it('renders version buttons with CodeOfReality font letters and updates on click', () => {
    const handleUpdate = vi.fn();
    render(<TopControls config={mockConfig} onUpdateConfig={handleUpdate} onResetPerf={vi.fn()} onResetCamera={vi.fn()} />);

    expect(screen.getByText('Version')).toBeInTheDocument();

    const sceneB = screen.getByLabelText(/Select Scene b/);
    expect(sceneB).toBeInTheDocument();
    expect(sceneB).toHaveTextContent('b');

    fireEvent.click(sceneB);
    expect(handleUpdate).toHaveBeenCalledWith({ shaderVersion: 2 });
  });

  it('renders performance sliders and handles slider changes', () => {
    const handleUpdate = vi.fn();
    render(<TopControls config={mockConfig} onUpdateConfig={handleUpdate} onResetPerf={vi.fn()} onResetCamera={vi.fn()} />);

    const stepsSlider = screen.getByLabelText('Performance parameter Steps');
    const distSlider = screen.getByLabelText('Performance parameter Dist');
    const snowSlider = screen.getByLabelText('Performance parameter Snow');
    const sparkSlider = screen.getByLabelText('Performance parameter Spark');

    fireEvent.change(stepsSlider, { target: { value: '150' } });
    expect(handleUpdate).toHaveBeenCalledWith({ raymarchSteps: 150 });

    fireEvent.change(distSlider, { target: { value: '80' } });
    expect(handleUpdate).toHaveBeenCalledWith({ raymarchDistance: 80 });

    fireEvent.change(snowSlider, { target: { value: '2.5' } });
    expect(handleUpdate).toHaveBeenCalledWith({ snowIntensity: 2.5 });

    fireEvent.change(sparkSlider, { target: { value: '3.0' } });
    expect(handleUpdate).toHaveBeenCalledWith({ sparkleIntensity: 3.0 });
  });

  it('renders reset buttons and tribute links', () => {
    const handleUpdate = vi.fn();
    render(<TopControls config={mockConfig} onUpdateConfig={handleUpdate} onResetPerf={vi.fn()} onResetCamera={vi.fn()} />);

    expect(screen.getByLabelText('Reset performance settings')).toBeInTheDocument();
    expect(screen.getByLabelText('Reset camera position')).toBeInTheDocument();

    const githubLink = screen.getByLabelText('Riftpane on GitHub');
    expect(githubLink).toBeInTheDocument();
    expect(githubLink).toHaveAttribute('href', 'https://github.com/sakurablush/riftpane');

    const corLink = screen.getByLabelText('Code of Reality community website');
    expect(corLink).toBeInTheDocument();
    expect(corLink).toHaveAttribute('href', 'https://codeofreality.org/');
  });
});

describe('BottomControls Component', () => {
  it('renders laser wavelength buttons with color indicators and updates wavelength on click', () => {
    const handleUpdate = vi.fn();
    const handleWallChange = vi.fn();

    render(
      <BottomControls
        config={mockConfig}
        onUpdateConfig={handleUpdate}
        activeWall="#2633d0"
        onActiveWallChange={handleWallChange}
        zDepth={1.5}
      />
    );

    expect(screen.getByText('LASER')).toBeInTheDocument();

    LASER_WAVELENGTHS.forEach((nm) => {
      expect(screen.getByLabelText(`Select Laser Wavelength ${nm} nanometers`)).toBeInTheDocument();
    });

    const greenLaserBtn = screen.getByLabelText('Select Laser Wavelength 532 nanometers');
    fireEvent.click(greenLaserBtn);

    expect(handleUpdate).toHaveBeenCalledWith({ wavelength: 532 });
  });

  it('displays Z-depth metric formatted to 2 decimal places', () => {
    render(
      <BottomControls
        config={mockConfig}
        onUpdateConfig={vi.fn()}
        activeWall="#2633d0"
        onActiveWallChange={vi.fn()}
        zDepth={2.4567}
      />
    );

    expect(screen.getByText('Z-DEPTH: 2.46')).toBeInTheDocument();
  });
});
