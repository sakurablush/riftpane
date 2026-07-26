import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { PreDisclaimer } from '../../ui/hud/PreDisclaimer';

describe('PreDisclaimer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders welcome title and continue button', () => {
    const onContinue = vi.fn();
    render(<PreDisclaimer onContinue={onContinue} />);
    expect(screen.getByText('Welcome to Riftpane')).toBeDefined();
    expect(screen.getByText('Continue')).toBeDefined();
  });

  it('calls onContinue when continue button is clicked', () => {
    const onContinue = vi.fn();
    render(<PreDisclaimer onContinue={onContinue} />);
    const button = screen.getByText('Continue');
    act(() => {
      button.click();
    });
    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  it('displays music recommendation text', () => {
    const onContinue = vi.fn();
    render(<PreDisclaimer onContinue={onContinue} />);
    expect(screen.getByText(/optional background music/i)).toBeDefined();
    expect(screen.getByText(/wearing headphones/i)).toBeDefined();
  });
});
