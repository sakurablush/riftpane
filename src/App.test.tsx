import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App Component Integration', () => {
  it('renders full application with controls and canvas', () => {
    render(<App />);

    expect(screen.getByTestId('laser-canvas')).toBeInTheDocument();
    expect(screen.getAllByText('Version').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('LASER').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('WALL').length).toBeGreaterThanOrEqual(1);
  });

  it('switches shader versions, laser wavelengths, and wall colors', () => {
    render(<App />);

    const v2Btn = screen.getByLabelText(/Select Shader Version 2/);
    fireEvent.click(v2Btn);
    expect(v2Btn.className).toContain('bg-zinc-200');

    const laser532 = screen.getByLabelText('Select Laser Wavelength 532 nanometers');
    fireEvent.click(laser532);
    expect(laser532.className).toContain('bg-zinc-200');

    const paletteBtns = screen.getAllByLabelText('Open full wall color palette');
    fireEvent.click(paletteBtns[0]);

    const abyssalBlueBtn = screen.getByLabelText('Select wall color Abyssal Blue');
    fireEvent.click(abyssalBlueBtn);
  });

  it('updates z-depth via wheel interaction', () => {
    render(<App />);
    const canvas = screen.getByTestId('laser-canvas');
    const initialDepthText = screen.getByText(/Z-DEPTH:/).textContent;

    fireEvent.wheel(canvas, { deltaY: 100 });

    expect(screen.getByText(/Z-DEPTH:/)).toBeInTheDocument();
    expect(screen.getByText(/Z-DEPTH:/).textContent).not.toBe(initialDepthText);
  });
});
