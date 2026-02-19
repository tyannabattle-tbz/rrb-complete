import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FrequencyPresetButtons } from './FrequencyPresetButtons';

describe('FrequencyPresetButtons', () => {
  const mockOnFrequencySelect = vi.fn();

  it('renders all frequency preset buttons', () => {
    render(
      <FrequencyPresetButtons
        selectedFrequency={440}
        onFrequencySelect={mockOnFrequencySelect}
      />
    );

    expect(screen.getByText(/174 Hz/)).toBeInTheDocument();
    expect(screen.getByText(/528 Hz/)).toBeInTheDocument();
    expect(screen.getByText(/852 Hz/)).toBeInTheDocument();
  });

  it('calls onFrequencySelect when button is clicked', () => {
    render(
      <FrequencyPresetButtons
        selectedFrequency={440}
        onFrequencySelect={mockOnFrequencySelect}
      />
    );

    const button528 = screen.getByText(/528 Hz/);
    fireEvent.click(button528);

    expect(mockOnFrequencySelect).toHaveBeenCalledWith(528);
  });

  it('renders with different sizes', () => {
    const { container: containerSm } = render(
      <FrequencyPresetButtons
        selectedFrequency={440}
        onFrequencySelect={mockOnFrequencySelect}
        size="sm"
      />
    );

    expect(containerSm).toBeInTheDocument();
  });

  it('displays frequency with music note emoji', () => {
    render(
      <FrequencyPresetButtons
        selectedFrequency={440}
        onFrequencySelect={mockOnFrequencySelect}
      />
    );

    const buttons = screen.getAllByText(/🎵/);
    expect(buttons.length).toBeGreaterThan(0);
  });
});
