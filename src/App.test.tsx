import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App Component Integration', () => {
  it('renders full application with controls and canvas', () => {
    render(<App />);

    expect(screen.getByTestId('laser-canvas')).toBeInTheDocument();
    expect(screen.getByText('Version')).toBeInTheDocument();
    expect(screen.getByText('LASER')).toBeInTheDocument();
    expect(screen.getByText('WALL')).toBeInTheDocument();
  });

  it('allows switching shader versions, laser wavelengths, and wall colors', () => {
    render(<App />);

    // Switch shader version to V2
    const v2Btn = screen.getByLabelText(/Select Shader Version 2/);
    fireEvent.click(v2Btn);
    expect(v2Btn.className).toContain('bg-zinc-200');

    // Switch laser wavelength to 532nm
    const laser532 = screen.getByLabelText('Select Laser Wavelength 532 nanometers');
    fireEvent.click(laser532);
    expect(laser532.className).toContain('bg-zinc-200');

    // Open wall color palette and choose another color
    const paletteBtn = screen.getByLabelText('Open full wall color palette');
    fireEvent.click(paletteBtn);

    const abssalBlueBtn = screen.getByLabelText('Select wall color Abyssal Blue');
    fireEvent.click(abssalBlueBtn);
  });
});
