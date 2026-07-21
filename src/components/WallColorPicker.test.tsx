import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { WallColorPicker } from './WallColorPicker';
import { WALL_COLORS } from '../constants';

describe('WallColorPicker Component', () => {
  it('renders quick swatches and palette toggle button', () => {
    const handleChange = vi.fn();
    render(<WallColorPicker activeWall="#050000" onActiveWallChange={handleChange} />);

    expect(screen.getByText('WALL')).toBeInTheDocument();
    expect(screen.getByLabelText('Open full wall color palette')).toBeInTheDocument();

    // Check quick swatches
    const quick1 = screen.getByLabelText(`Select ${WALL_COLORS[0].name} wall color`);
    expect(quick1).toBeInTheDocument();

    fireEvent.click(quick1);
    expect(handleChange).toHaveBeenCalledWith(WALL_COLORS[0].hex);
  });

  it('opens floating popover palette when palette button is clicked', () => {
    const handleChange = vi.fn();
    render(<WallColorPicker activeWall="#050000" onActiveWallChange={handleChange} />);

    const toggleBtn = screen.getByLabelText('Open full wall color palette');
    fireEvent.click(toggleBtn);

    expect(screen.getByRole('dialog', { name: 'Wall color selector' })).toBeInTheDocument();
    expect(screen.getByText(`${WALL_COLORS.length} Colors`)).toBeInTheDocument();

    // Select a color from full palette
    const targetColor = WALL_COLORS[10];
    const colorBtn = screen.getByLabelText(`Select wall color ${targetColor.name}`);
    fireEvent.click(colorBtn);

    expect(handleChange).toHaveBeenCalledWith(targetColor.hex);
  });

  it('allows picking custom color via color input', () => {
    const handleChange = vi.fn();
    render(<WallColorPicker activeWall="#050000" onActiveWallChange={handleChange} />);

    fireEvent.click(screen.getByLabelText('Open full wall color palette'));

    const customInput = screen.getByLabelText('Pick custom wall color');
    fireEvent.change(customInput, { target: { value: '#ff0055' } });

    expect(handleChange).toHaveBeenCalledWith('#ff0055');
  });

  it('closes palette popover when close button or Escape key is pressed', () => {
    const handleChange = vi.fn();
    render(<WallColorPicker activeWall="#050000" onActiveWallChange={handleChange} />);

    // Open
    fireEvent.click(screen.getByLabelText('Open full wall color palette'));
    expect(screen.getByRole('dialog', { name: 'Wall color selector' })).toBeInTheDocument();

    // Close via close button
    const closeBtn = screen.getByLabelText('Close color palette');
    fireEvent.click(closeBtn);
    expect(screen.queryByRole('dialog', { name: 'Wall color selector' })).not.toBeInTheDocument();

    // Open again
    fireEvent.click(screen.getByLabelText('Open full wall color palette'));
    expect(screen.getByRole('dialog', { name: 'Wall color selector' })).toBeInTheDocument();

    // Close via Escape key
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog', { name: 'Wall color selector' })).not.toBeInTheDocument();
  });

  it('closes palette popover when clicking outside container', () => {
    const handleChange = vi.fn();
    render(
      <div>
        <WallColorPicker activeWall="#050000" onActiveWallChange={handleChange} />
        <button data-testid="outside-button">Outside</button>
      </div>
    );

    fireEvent.click(screen.getByLabelText('Open full wall color palette'));
    expect(screen.getByRole('dialog', { name: 'Wall color selector' })).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByTestId('outside-button'));
    expect(screen.queryByRole('dialog', { name: 'Wall color selector' })).not.toBeInTheDocument();
  });
});
