import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PodcastFrequencyFilter, SOLFEGGIO_FREQUENCIES } from './PodcastFrequencyFilter';

describe('PodcastFrequencyFilter Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all Solfeggio frequencies', () => {
    render(<PodcastFrequencyFilter />);
    
    SOLFEGGIO_FREQUENCIES.forEach((freq) => {
      expect(screen.getByText(`${freq.hz} Hz`)).toBeInTheDocument();
      expect(screen.getByText(freq.name)).toBeInTheDocument();
    });
  });

  it('displays correct frequency descriptions', () => {
    render(<PodcastFrequencyFilter />);
    
    expect(screen.getByText('Foundation & Grounding')).toBeInTheDocument();
    expect(screen.getByText('Creativity & Sexuality')).toBeInTheDocument();
    expect(screen.getByText('Love & Healing')).toBeInTheDocument();
  });

  it('calls onFrequencyChange when frequency is selected', () => {
    const mockOnChange = vi.fn();
    render(<PodcastFrequencyFilter onFrequencyChange={mockOnChange} />);
    
    const frequencyButton = screen.getByText('174 Hz').closest('button');
    fireEvent.click(frequencyButton!);
    
    expect(mockOnChange).toHaveBeenCalledWith([174]);
  });

  it('toggles frequency selection on click', () => {
    const mockOnChange = vi.fn();
    render(<PodcastFrequencyFilter onFrequencyChange={mockOnChange} />);
    
    const frequencyButton = screen.getByText('174 Hz').closest('button');
    
    // First click - select
    fireEvent.click(frequencyButton!);
    expect(mockOnChange).toHaveBeenCalledWith([174]);
    
    // Second click - deselect
    fireEvent.click(frequencyButton!);
    expect(mockOnChange).toHaveBeenCalledWith([]);
  });

  it('allows multiple frequency selection', () => {
    const mockOnChange = vi.fn();
    render(<PodcastFrequencyFilter onFrequencyChange={mockOnChange} />);
    
    const freq174 = screen.getByText('174 Hz').closest('button');
    const freq528 = screen.getByText('528 Hz').closest('button');
    
    fireEvent.click(freq174!);
    fireEvent.click(freq528!);
    
    expect(mockOnChange).toHaveBeenLastCalledWith([174, 528]);
  });

  it('shows Clear All button when frequencies are selected', () => {
    const { rerender } = render(<PodcastFrequencyFilter selectedFrequencies={[174, 528]} />);
    
    const clearButton = screen.getByRole('button', { name: /clear all/i });
    expect(clearButton).toBeInTheDocument();
  });

  it('clears all selections when Clear All is clicked', () => {
    const mockOnChange = vi.fn();
    render(
      <PodcastFrequencyFilter
        selectedFrequencies={[174, 528]}
        onFrequencyChange={mockOnChange}
      />
    );
    
    const clearButton = screen.getByRole('button', { name: /clear all/i });
    fireEvent.click(clearButton);
    
    expect(mockOnChange).toHaveBeenCalledWith([]);
  });

  it('displays selected frequencies in badge section', () => {
    render(<PodcastFrequencyFilter selectedFrequencies={[174, 528]} />);
    
    expect(screen.getByText('174 Hz - Root Chakra')).toBeInTheDocument();
    expect(screen.getByText('528 Hz - Throat Chakra')).toBeInTheDocument();
  });
});
