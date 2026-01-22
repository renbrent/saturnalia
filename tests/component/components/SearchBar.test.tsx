import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBar } from '../../../src/components/search/SearchBar';

// Mock the celestrak service
vi.mock('../../../src/services/celestrak', () => ({
  searchByName: vi.fn(),
}));

import { searchByName } from '../../../src/services/celestrak';

const mockSearchByName = vi.mocked(searchByName);

describe('SearchBar', () => {
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchByName.mockResolvedValue([]);
  });

  it('renders search input', () => {
    render(<SearchBar onSelect={mockOnSelect} />);
    
    expect(screen.getByTestId('search-input')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search satellites/i)).toBeInTheDocument();
  });

  it('calls searchByName on input with debounce', async () => {
    const user = userEvent.setup();
    mockSearchByName.mockResolvedValue([
      { noradId: '20580', name: 'HUBBLE SPACE TELESCOPE' },
    ]);

    render(<SearchBar onSelect={mockOnSelect} />);
    
    const input = screen.getByTestId('search-input');
    await user.type(input, 'hubble');

    // Should debounce - not called immediately
    expect(mockSearchByName).not.toHaveBeenCalled();

    // Wait for debounce
    await waitFor(() => {
      expect(mockSearchByName).toHaveBeenCalledWith('hubble', expect.any(AbortSignal));
    }, { timeout: 500 });
  });

  it('shows search results when results are returned', async () => {
    const user = userEvent.setup();
    mockSearchByName.mockResolvedValue([
      { noradId: '20580', name: 'HUBBLE SPACE TELESCOPE' },
      { noradId: '25544', name: 'ISS (ZARYA)' },
    ]);

    render(<SearchBar onSelect={mockOnSelect} />);
    
    const input = screen.getByTestId('search-input');
    await user.type(input, 'hub');

    await waitFor(() => {
      expect(screen.getByTestId('search-results')).toBeInTheDocument();
    });

    expect(screen.getByText('HUBBLE SPACE TELESCOPE')).toBeInTheDocument();
  });

  it('calls onSelect when a result is clicked', async () => {
    const user = userEvent.setup();
    const mockSatellite = { noradId: '20580', name: 'HUBBLE SPACE TELESCOPE' };
    mockSearchByName.mockResolvedValue([mockSatellite]);

    render(<SearchBar onSelect={mockOnSelect} />);
    
    const input = screen.getByTestId('search-input');
    await user.type(input, 'hubble');

    await waitFor(() => {
      expect(screen.getByText('HUBBLE SPACE TELESCOPE')).toBeInTheDocument();
    });

    await user.click(screen.getByText('HUBBLE SPACE TELESCOPE'));

    expect(mockOnSelect).toHaveBeenCalledWith(mockSatellite);
  });

  it('shows no results message when search returns empty', async () => {
    const user = userEvent.setup();
    mockSearchByName.mockResolvedValue([]);

    render(<SearchBar onSelect={mockOnSelect} />);
    
    const input = screen.getByTestId('search-input');
    await user.type(input, 'nonexistent');

    await waitFor(() => {
      expect(screen.getByTestId('no-results-message')).toBeInTheDocument();
    });
  });

  it('clears results when input is cleared', async () => {
    const user = userEvent.setup();
    mockSearchByName.mockResolvedValue([
      { noradId: '20580', name: 'HUBBLE SPACE TELESCOPE' },
    ]);

    render(<SearchBar onSelect={mockOnSelect} />);
    
    const input = screen.getByTestId('search-input');
    await user.type(input, 'hubble');

    await waitFor(() => {
      expect(screen.getByTestId('search-results')).toBeInTheDocument();
    });

    await user.clear(input);

    await waitFor(() => {
      expect(screen.queryByTestId('search-results')).not.toBeInTheDocument();
    });
  });

  it('shows loading state while searching', async () => {
    const user = userEvent.setup();
    // Delay the response
    mockSearchByName.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve([]), 100))
    );

    render(<SearchBar onSelect={mockOnSelect} />);
    
    const input = screen.getByTestId('search-input');
    await user.type(input, 'test');

    await waitFor(() => {
      expect(screen.getByTestId('search-loading')).toBeInTheDocument();
    });
  });
});
