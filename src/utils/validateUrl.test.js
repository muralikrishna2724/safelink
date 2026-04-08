import { describe, it, expect } from 'vitest';
import { isValidUrl } from './validateUrl.js';

describe('validateUrl - basic smoke tests', () => {
  it('should return true for valid http URL', () => {
    expect(isValidUrl('http://example.com')).toBe(true);
  });

  it('should return true for valid https URL', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
  });

  it('should return false for URL without protocol', () => {
    expect(isValidUrl('example.com')).toBe(false);
  });

  it('should return false for invalid protocol', () => {
    expect(isValidUrl('ftp://example.com')).toBe(false);
  });

  it('should return false for empty string', () => {
    expect(isValidUrl('')).toBe(false);
  });

  it('should return false for non-URL string', () => {
    expect(isValidUrl('not a url')).toBe(false);
  });
});
