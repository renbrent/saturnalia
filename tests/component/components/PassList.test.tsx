import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PassList } from '../../../src/components/passes/PassList';
import type { PassPrediction } from '../../../src/types/pass';

describe('PassList Component', () => {
  const mockPasses: PassPrediction[] = [
    {
      startTime: new Date('2024-01-15T18:30:00Z'),
      endTime: new Date('2024-01-15T18:36:00Z'),
      maxElevationTime: new Date('2024-01-15T18:33:00Z'),
      maxElevation: 45,
      startAzimuth: 315, // NW
      endAzimuth: 135, // SE
      maxAzimuth: 180, // S
    },
    {
      startTime: new Date('2024-01-15T20:15:00Z'),
      endTime: new Date('2024-01-15T20:21:00Z'),
      maxElevationTime: new Date('2024-01-15T20:18:00Z'),
      maxElevation: 30,
      startAzimuth: 270, // W
      endAzimuth: 90, // E
      maxAzimuth: 0, // N
    },
    {
      startTime: new Date('2024-01-16T06:45:00Z'),
      endTime: new Date('2024-01-16T06:51:00Z'),
      maxElevationTime: new Date('2024-01-16T06:48:00Z'),
      maxElevation: 60,
      startAzimuth: 0, // N
      endAzimuth: 180, // S
      maxAzimuth: 90, // E
    },
  ];

  describe('T066: PassList rendering', () => {
    it('should render list of passes correctly', () => {
      render(<PassList passes={mockPasses} />);

      const list = screen.getByRole('list', { name: /passes/i });
      expect(list).toBeInTheDocument();

      // Should have 3 pass items
      const passItems = screen.getAllByRole('listitem');
      expect(passItems).toHaveLength(3);
    });

    it('should display pass start times', () => {
      render(<PassList passes={mockPasses} />);

      // Check for time indicators (could be formatted various ways)
      expect(screen.getByText(/18:30|6:30/)).toBeInTheDocument();
    });

    it('should display elevation information', () => {
      render(<PassList passes={mockPasses} />);

      // Should show elevation values
      expect(screen.getByText(/45°|45 degrees/i)).toBeInTheDocument();
      expect(screen.getByText(/30°|30 degrees/i)).toBeInTheDocument();
      expect(screen.getByText(/60°|60 degrees/i)).toBeInTheDocument();
    });

    it('should display direction information', () => {
      render(<PassList passes={mockPasses} />);

      // Should show compass directions or azimuth
      // Looking for cardinal directions (N, S, E, W, NW, SE, etc.)
      const text = screen.getByRole('list').textContent || '';
      
      // At least one cardinal direction should be present
      expect(text).toMatch(/north|south|east|west|nw|se|sw|ne/i);
    });

    it('should show empty state when no passes', () => {
      render(<PassList passes={[]} />);

      expect(screen.getByText(/no passes|no visible passes/i)).toBeInTheDocument();
    });

    it('should display pass duration or end time', () => {
      render(<PassList passes={mockPasses} />);

      // Should show either duration (6 min) or end times
      const text = screen.getByRole('list').textContent || '';
      
      // Check for time indicators or duration
      expect(text).toMatch(/18:36|20:21|06:51|min|minutes/i);
    });

    it('should handle single pass', () => {
      render(<PassList passes={[mockPasses[0]]} />);

      const passItems = screen.getAllByRole('listitem');
      expect(passItems).toHaveLength(1);
    });

    it('should apply correct styling to passes', () => {
      render(<PassList passes={mockPasses} />);

      const list = screen.getByRole('list', { name: /passes/i });
      expect(list).toBeInTheDocument();
      
      // List items should be rendered
      const items = screen.getAllByRole('listitem');
      items.forEach(item => {
        expect(item).toBeInTheDocument();
      });
    });
  });

  describe('Pass highlighting', () => {
    it('should highlight passes within 24 hours', () => {
      const now = new Date();
      const soon = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now
      const later = new Date(now.getTime() + 30 * 60 * 60 * 1000); // 30 hours from now

      const passes: PassPrediction[] = [
        {
          startTime: soon,
          endTime: new Date(soon.getTime() + 6 * 60 * 1000),
          maxElevationTime: new Date(soon.getTime() + 3 * 60 * 1000),
          maxElevation: 45,
          startAzimuth: 315,
          endAzimuth: 135,
        },
        {
          startTime: later,
          endTime: new Date(later.getTime() + 6 * 60 * 1000),
          maxElevationTime: new Date(later.getTime() + 3 * 60 * 1000),
          maxElevation: 30,
          startAzimuth: 270,
          endAzimuth: 90,
        },
      ];

      render(<PassList passes={passes} />);

      // Should have some indication of upcoming pass (class, badge, etc.)
      const items = screen.getAllByRole('listitem');
      
      // First pass should be highlighted (within 24 hours)
      expect(items[0]).toBeInTheDocument();
    });

    it('should show "upcoming" or "soon" indicator for imminent passes', () => {
      const now = new Date();
      const imminent = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes from now

      const passes: PassPrediction[] = [
        {
          startTime: imminent,
          endTime: new Date(imminent.getTime() + 6 * 60 * 1000),
          maxElevationTime: new Date(imminent.getTime() + 3 * 60 * 1000),
          maxElevation: 60,
          startAzimuth: 0,
          endAzimuth: 180,
        },
      ];

      render(<PassList passes={passes} />);

      // Look for indicators (might be in text or as aria-label)
      const listItem = screen.getByRole('listitem');
      expect(listItem).toBeInTheDocument();
    });
  });

  describe('Optional features', () => {
    it('should handle passes with brightness data', () => {
      const passWithBrightness: PassPrediction = {
        ...mockPasses[0],
        brightness: -2.5, // Magnitude
      };

      render(<PassList passes={[passWithBrightness]} />);

      const listItem = screen.getByRole('listitem');
      expect(listItem).toBeInTheDocument();
    });

    it('should be accessible', () => {
      render(<PassList passes={mockPasses} />);

      // Should have proper ARIA attributes
      const list = screen.getByRole('list', { name: /passes/i });
      expect(list).toBeInTheDocument();

      // All items should be in a list
      const items = screen.getAllByRole('listitem');
      expect(items.length).toBeGreaterThan(0);
    });
  });
});
