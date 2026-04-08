import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import UrlInput from './UrlInput.jsx';

describe('UrlInput Component - Basic Verification', () => {
  it('renders input and submit button', () => {
    const mockOnSubmit = vi.fn();
    render(<UrlInput onSubmit={mockOnSubmit} loading={false} />);
    
    expect(screen.getByPlaceholderText(/Paste a URL to check/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Check/i })).toBeInTheDocument();
  });

  it('shows "URL required" error when submitting empty input', () => {
    const mockOnSubmit = vi.fn();
    render(<UrlInput onSubmit={mockOnSubmit} loading={false} />);
    
    const submitButton = screen.getByRole('button', { name: /Check/i });
    fireEvent.click(submitButton);
    
    expect(screen.getByText('URL required')).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('shows format error for invalid URL', () => {
    const mockOnSubmit = vi.fn();
    render(<UrlInput onSubmit={mockOnSubmit} loading={false} />);
    
    const input = screen.getByPlaceholderText(/Paste a URL to check/i);
    fireEvent.change(input, { target: { value: 'not-a-valid-url' } });
    
    const submitButton = screen.getByRole('button', { name: /Check/i });
    fireEvent.click(submitButton);
    
    expect(screen.getByText(/Invalid URL format/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('trims whitespace and calls onSubmit with valid URL', () => {
    const mockOnSubmit = vi.fn();
    render(<UrlInput onSubmit={mockOnSubmit} loading={false} />);
    
    const input = screen.getByPlaceholderText(/Paste a URL to check/i);
    fireEvent.change(input, { target: { value: '  https://example.com  ' } });
    
    const submitButton = screen.getByRole('button', { name: /Check/i });
    fireEvent.click(submitButton);
    
    expect(mockOnSubmit).toHaveBeenCalledWith('https://example.com');
  });

  it('disables input and button when loading', () => {
    const mockOnSubmit = vi.fn();
    render(<UrlInput onSubmit={mockOnSubmit} loading={true} />);
    
    const input = screen.getByPlaceholderText(/Paste a URL to check/i);
    const submitButton = screen.getByRole('button', { name: /Check/i });
    
    expect(input).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });

  it('enforces max length of 2048 characters', () => {
    const mockOnSubmit = vi.fn();
    render(<UrlInput onSubmit={mockOnSubmit} loading={false} />);
    
    const input = screen.getByPlaceholderText(/Paste a URL to check/i);
    expect(input).toHaveAttribute('maxLength', '2048');
  });
});
