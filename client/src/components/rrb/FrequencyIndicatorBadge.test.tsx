import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FrequencyIndicatorBadge } from './FrequencyIndicatorBadge';

describe('FrequencyIndicatorBadge', () => {
  it('renders frequency badge with music note', () => {
    render(<FrequencyIndicatorBadge frequency={528} />);

    expect(screen.getByText('🎵')).toBeInTheDocument();
    expect(screen.getByText('528 Hz')).toBeInTheDocument();
  });

  it('displays healing property by default', () => {
    render(<FrequencyIndicatorBadge frequency={528} />);

    expect(screen.getByText(/Love & DNA Repair/)).toBeInTheDocument();
  });

  it('hides healing property when showHealingProperty is false', () => {
    render(
      <FrequencyIndicatorBadge 
        frequency={528} 
        showHealingProperty={false}
      />
    );

    expect(screen.getByText('528 Hz')).toBeInTheDocument();
    expect(screen.queryByText(/Love & DNA Repair/)).not.toBeInTheDocument();
  });

  it('renders all Solfeggio frequencies correctly', () => {
    const frequencies = [174, 285, 396, 417, 528, 639, 741, 852, 432, 440];

    frequencies.forEach(freq => {
      const { unmount } = render(<FrequencyIndicatorBadge frequency={freq} />);
      
      expect(screen.getByText(`${freq} Hz`)).toBeInTheDocument();
      
      unmount();
    });
  });

  it('uses default frequency when none provided', () => {
    render(<FrequencyIndicatorBadge />);

    expect(screen.getByText('440 Hz')).toBeInTheDocument();
  });

  it('returns null for invalid frequency', () => {
    const { container } = render(
      <FrequencyIndicatorBadge frequency={999} />
    );

    expect(container.firstChild).toBeNull();
  });
});
