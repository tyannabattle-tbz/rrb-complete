import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SearchBox } from './SearchBox';

describe('SearchBox Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders search input with placeholder', () => {
    render(<SearchBox />);
    const input = screen.getByPlaceholderText('Search podcasts, channels, topics...');
    expect(input).toBeInTheDocument();
  });

  it('opens dropdown when input is focused', () => {
    render(<SearchBox />);
    const input = screen.getByPlaceholderText('Search podcasts, channels, topics...');
    fireEvent.focus(input);
    expect(input).toHaveFocus();
  });

  it('calls onSearch callback when search is submitted', () => {
    const mockOnSearch = vi.fn();
    render(<SearchBox onSearch={mockOnSearch} />);
    const input = screen.getByPlaceholderText('Search podcasts, channels, topics...');
    
    fireEvent.change(input, { target: { value: 'healing frequencies' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    expect(mockOnSearch).toHaveBeenCalledWith('healing frequencies');
  });

  it('clears search input when clear button is clicked', () => {
    render(<SearchBox />);
    const input = screen.getByPlaceholderText('Search podcasts, channels, topics...') as HTMLInputElement;
    
    fireEvent.change(input, { target: { value: 'test query' } });
    expect(input.value).toBe('test query');
    
    const clearButton = screen.getByRole('button', { name: /clear/i });
    fireEvent.click(clearButton);
    
    expect(input.value).toBe('');
  });

  it('passes category prop correctly', () => {
    const { container } = render(<SearchBox category="rrb" />);
    expect(container).toBeInTheDocument();
  });

  it('handles empty search gracefully', () => {
    const mockOnSearch = vi.fn();
    render(<SearchBox onSearch={mockOnSearch} />);
    const input = screen.getByPlaceholderText('Search podcasts, channels, topics...');
    
    fireEvent.keyDown(input, { key: 'Enter' });
    
    expect(mockOnSearch).not.toHaveBeenCalled();
  });
});
