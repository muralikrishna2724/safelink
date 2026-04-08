import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ResultCard from './ResultCard.jsx';

describe('ResultCard', () => {
  const mockUrl = 'https://example.com';

  describe('SAFE verdict', () => {
    it('renders green treatment with checkmark icon', () => {
      const result = {
        verdict: 'SAFE',
        sources: [
          { safe: true, source: 'GSB' },
          { safe: true, source: 'URLhaus' }
        ]
      };

      const { container } = render(<ResultCard result={result} url={mockUrl} />);
      
      // Check for green styling
      const cardElement = container.querySelector('.bg-emerald-50');
      expect(cardElement).toBeInTheDocument();
      
      // Check verdict text
      expect(screen.getByText('SAFE')).toBeInTheDocument();
      
      // Check URL is displayed
      expect(screen.getByText(mockUrl)).toBeInTheDocument();
    });

    it('shows partial data indicator when partial flag is true', () => {
      const result = {
        verdict: 'SAFE',
        partial: true,
        sources: [
          { safe: true, source: 'GSB' },
          { safe: false, error: true, source: 'URLhaus' }
        ]
      };

      render(<ResultCard result={result} url={mockUrl} />);
      
      expect(screen.getByText(/partial data/i)).toBeInTheDocument();
    });
  });

  describe('UNSAFE verdict', () => {
    it('renders red treatment with alert icon', () => {
      const result = {
        verdict: 'UNSAFE',
        threatType: 'MALWARE',
        sources: [
          { safe: false, threatType: 'MALWARE', source: 'GSB' },
          { safe: true, source: 'URLhaus' }
        ]
      };

      const { container } = render(<ResultCard result={result} url={mockUrl} />);
      
      // Check for red styling
      const cardElement = container.querySelector('.bg-red-50');
      expect(cardElement).toBeInTheDocument();
      
      // Check verdict text
      expect(screen.getByText('UNSAFE')).toBeInTheDocument();
      
      // Check URL is displayed
      expect(screen.getByText(mockUrl)).toBeInTheDocument();
    });

    it('displays threat category badges for each flagging source', () => {
      const result = {
        verdict: 'UNSAFE',
        threatType: 'MALWARE',
        sources: [
          { safe: false, threatType: 'MALWARE', source: 'GSB' },
          { safe: false, threatType: 'PHISHING', source: 'URLhaus' }
        ]
      };

      render(<ResultCard result={result} url={mockUrl} />);
      
      // Check for threat badges
      expect(screen.getByText(/GSB: MALWARE/i)).toBeInTheDocument();
      expect(screen.getByText(/URLhaus: PHISHING/i)).toBeInTheDocument();
    });
  });

  describe('UNKNOWN verdict', () => {
    it('renders neutral treatment with info icon', () => {
      const result = {
        verdict: 'UNKNOWN',
        sources: [
          { safe: false, error: true, source: 'GSB' },
          { safe: false, error: true, source: 'URLhaus' }
        ]
      };

      const { container } = render(<ResultCard result={result} url={mockUrl} />);
      
      // Check for yellow/neutral styling
      const cardElement = container.querySelector('.bg-yellow-50');
      expect(cardElement).toBeInTheDocument();
      
      // Check verdict text
      expect(screen.getByText('UNKNOWN')).toBeInTheDocument();
      
      // Check URL is displayed
      expect(screen.getByText(mockUrl)).toBeInTheDocument();
    });
  });

  describe('Copy functionality', () => {
    beforeEach(() => {
      // Mock clipboard API
      Object.assign(navigator, {
        clipboard: {
          writeText: vi.fn()
        }
      });
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('renders copy button when result exists', () => {
      const result = {
        verdict: 'SAFE',
        sources: [{ safe: true, source: 'GSB' }]
      };

      render(<ResultCard result={result} url={mockUrl} />);
      
      expect(screen.getByText('Copy Result')).toBeInTheDocument();
    });

    it('copies verdict and URL to clipboard on button click', async () => {
      const result = {
        verdict: 'SAFE',
        sources: [{ safe: true, source: 'GSB' }]
      };

      navigator.clipboard.writeText.mockResolvedValue();

      render(<ResultCard result={result} url={mockUrl} />);
      
      const copyButton = screen.getByText('Copy Result');
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(`SAFE: ${mockUrl}`);
      });
    });

    it('shows confirmation for 2 seconds after successful copy', async () => {
      const result = {
        verdict: 'UNSAFE',
        sources: [{ safe: false, threatType: 'MALWARE', source: 'GSB' }]
      };

      navigator.clipboard.writeText.mockResolvedValue();

      render(<ResultCard result={result} url={mockUrl} />);
      
      const copyButton = screen.getByText('Copy Result');
      fireEvent.click(copyButton);

      // Check confirmation appears
      await waitFor(() => {
        expect(screen.getByText('Copied!')).toBeInTheDocument();
      });

      // Wait for confirmation to disappear (2 seconds + buffer)
      await waitFor(() => {
        expect(screen.queryByText('Copied!')).not.toBeInTheDocument();
      }, { timeout: 2500 });
    });

    it('shows inline error when clipboard API is unavailable', async () => {
      const result = {
        verdict: 'SAFE',
        sources: [{ safe: true, source: 'GSB' }]
      };

      // Remove clipboard API
      Object.assign(navigator, {
        clipboard: undefined
      });

      render(<ResultCard result={result} url={mockUrl} />);
      
      const copyButton = screen.getByText('Copy Result');
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(screen.getByText('Unable to copy to clipboard')).toBeInTheDocument();
      });
    });

    it('shows inline error when clipboard write fails', async () => {
      const result = {
        verdict: 'SAFE',
        sources: [{ safe: true, source: 'GSB' }]
      };

      navigator.clipboard.writeText.mockRejectedValue(new Error('Permission denied'));

      render(<ResultCard result={result} url={mockUrl} />);
      
      const copyButton = screen.getByText('Copy Result');
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(screen.getByText('Unable to copy to clipboard')).toBeInTheDocument();
      });
    });
  });

  describe('URL display', () => {
    it('always displays the checked URL', () => {
      const testCases = [
        {
          verdict: 'SAFE',
          sources: [{ safe: true, source: 'GSB' }]
        },
        {
          verdict: 'UNSAFE',
          threatType: 'MALWARE',
          sources: [{ safe: false, threatType: 'MALWARE', source: 'GSB' }]
        },
        {
          verdict: 'UNKNOWN',
          sources: [{ safe: false, error: true, source: 'GSB' }]
        }
      ];

      testCases.forEach((result) => {
        const { unmount } = render(<ResultCard result={result} url={mockUrl} />);
        expect(screen.getByText(mockUrl)).toBeInTheDocument();
        unmount();
      });
    });
  });
});
