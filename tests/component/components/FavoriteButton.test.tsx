import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FavoriteButton } from '../../../src/components/favorites/FavoriteButton';

describe('FavoriteButton', () => {
  const mockSatellite = {
    noradId: '25544',
    name: 'ISS (ZARYA)',
    intlDesignator: '1998-067A'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('T055: should render unfavorited state by default', () => {
    const onToggle = vi.fn();
    render(<FavoriteButton satellite={mockSatellite} isFavorited={false} onToggle={onToggle} />);

    const button = screen.getByRole('button', { name: /add to favorites/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('should render favorited state', () => {
    const onToggle = vi.fn();
    render(<FavoriteButton satellite={mockSatellite} isFavorited={true} onToggle={onToggle} />);

    const button = screen.getByRole('button', { name: /remove from favorites/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('should call onToggle when clicked', () => {
    const onToggle = vi.fn();
    render(<FavoriteButton satellite={mockSatellite} isFavorited={false} onToggle={onToggle} />);

    const button = screen.getByRole('button', { name: /add to favorites/i });
    fireEvent.click(button);

    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenCalledWith(mockSatellite);
  });

  it('should toggle state correctly', () => {
    const onToggle = vi.fn();
    const { rerender } = render(
      <FavoriteButton satellite={mockSatellite} isFavorited={false} onToggle={onToggle} />
    );

    const button = screen.getByRole('button', { name: /add to favorites/i });
    fireEvent.click(button);

    // Simulate parent component updating state
    rerender(<FavoriteButton satellite={mockSatellite} isFavorited={true} onToggle={onToggle} />);

    const updatedButton = screen.getByRole('button', { name: /remove from favorites/i });
    expect(updatedButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('should be keyboard accessible', () => {
    const onToggle = vi.fn();
    render(<FavoriteButton satellite={mockSatellite} isFavorited={false} onToggle={onToggle} />);

    const button = screen.getByRole('button', { name: /add to favorites/i });
    
    // Simulate Enter key press
    fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
    
    expect(onToggle).toHaveBeenCalled();
  });

  it('should show correct icon for unfavorited state', () => {
    const onToggle = vi.fn();
    render(<FavoriteButton satellite={mockSatellite} isFavorited={false} onToggle={onToggle} />);

    // Icon should indicate "add to favorites" action
    const button = screen.getByRole('button', { name: /add to favorites/i });
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  it('should show correct icon for favorited state', () => {
    const onToggle = vi.fn();
    render(<FavoriteButton satellite={mockSatellite} isFavorited={true} onToggle={onToggle} />);

    // Icon should indicate "remove from favorites" action
    const button = screen.getByRole('button', { name: /remove from favorites/i });
    expect(button.querySelector('svg')).toBeInTheDocument();
  });
});
