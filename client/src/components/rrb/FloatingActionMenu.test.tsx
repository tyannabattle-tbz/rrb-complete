import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FloatingActionMenu } from './FloatingActionMenu';
import { Music, MessageSquare } from 'lucide-react';

describe('FloatingActionMenu', () => {
  it('renders the main toggle button', () => {
    const mockItems = [
      {
        id: 'test',
        icon: <Music className="w-6 h-6" />,
        label: 'Test Item',
        onClick: vi.fn(),
      },
    ];

    render(<FloatingActionMenu items={mockItems} />);
    
    const toggleButton = screen.getByTitle('Menu');
    expect(toggleButton).toBeInTheDocument();
  });

  it('shows menu items when button is clicked', () => {
    const mockItems = [
      {
        id: 'test1',
        icon: <Music className="w-6 h-6" />,
        label: 'Frequency',
        onClick: vi.fn(),
      },
      {
        id: 'test2',
        icon: <MessageSquare className="w-6 h-6" />,
        label: 'Messages',
        onClick: vi.fn(),
      },
    ];

    render(<FloatingActionMenu items={mockItems} />);
    
    const toggleButton = screen.getByTitle('Menu');
    fireEvent.click(toggleButton);
    
    expect(screen.getByText('Frequency')).toBeInTheDocument();
    expect(screen.getByText('Messages')).toBeInTheDocument();
  });

  it('calls onClick when menu item is clicked', () => {
    const mockOnClick = vi.fn();
    const mockItems = [
      {
        id: 'test',
        icon: <Music className="w-6 h-6" />,
        label: 'Test Item',
        onClick: mockOnClick,
      },
    ];

    render(<FloatingActionMenu items={mockItems} />);
    
    const toggleButton = screen.getByTitle('Menu');
    fireEvent.click(toggleButton);
    
    const itemButton = screen.getByTitle('Test Item');
    fireEvent.click(itemButton);
    
    expect(mockOnClick).toHaveBeenCalled();
  });

  it('closes menu after item is clicked', () => {
    const mockItems = [
      {
        id: 'test',
        icon: <Music className="w-6 h-6" />,
        label: 'Test Item',
        onClick: vi.fn(),
      },
    ];

    render(<FloatingActionMenu items={mockItems} />);
    
    const toggleButton = screen.getByTitle('Menu');
    fireEvent.click(toggleButton);
    
    expect(screen.getByText('Test Item')).toBeInTheDocument();
    
    const itemButton = screen.getByTitle('Test Item');
    fireEvent.click(itemButton);
    
    expect(screen.queryByText('Test Item')).not.toBeInTheDocument();
  });

  it('applies custom colors to menu items', () => {
    const mockItems = [
      {
        id: 'test',
        icon: <Music className="w-6 h-6" />,
        label: 'Test Item',
        onClick: vi.fn(),
        color: 'bg-blue-500 hover:bg-blue-600',
      },
    ];

    render(<FloatingActionMenu items={mockItems} />);
    
    const toggleButton = screen.getByTitle('Menu');
    fireEvent.click(toggleButton);
    
    const itemButton = screen.getByTitle('Test Item');
    expect(itemButton).toHaveClass('bg-blue-500');
  });

  it('uses custom primary icon and label', () => {
    const mockItems = [
      {
        id: 'test',
        icon: <Music className="w-6 h-6" />,
        label: 'Test',
        onClick: vi.fn(),
      },
    ];

    render(
      <FloatingActionMenu
        items={mockItems}
        primaryIcon={<MessageSquare className="w-6 h-6" />}
        primaryLabel="Custom Label"
      />
    );
    
    const toggleButton = screen.getByTitle('Custom Label');
    expect(toggleButton).toBeInTheDocument();
  });
});
