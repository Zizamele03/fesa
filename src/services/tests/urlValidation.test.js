import { describe, it, expect } from 'vitest';
import { validateProfileUrl, getSafeHttpsUrl } from '../../utils/urlValidation.js';

describe('validateProfileUrl', () => {
  it('accepts a valid HTTPS URL', () => {
    const result = validateProfileUrl('https://example.com/cert/abc123');
    expect(result.valid).toBe(true);
    expect(result.error).toBeNull();
    expect(result.normalizedUrl).toBe('https://example.com/cert/abc123');
  });

  it('trims surrounding whitespace', () => {
    const result = validateProfileUrl('  https://example.com/  ');
    expect(result.valid).toBe(true);
  });

  it('rejects HTTP URLs', () => {
    const result = validateProfileUrl('http://example.com/cert');
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('rejects javascript: scheme', () => {
    expect(validateProfileUrl('javascript:alert(1)').valid).toBe(false);
  });

  it('rejects data: scheme', () => {
    expect(
      validateProfileUrl('data:text/html,<script>alert(1)</script>').valid,
    ).toBe(false);
  });

  it('rejects file: scheme', () => {
    expect(validateProfileUrl('file:///etc/passwd').valid).toBe(false);
  });

  it('rejects ftp: scheme', () => {
    expect(validateProfileUrl('ftp://example.com/file').valid).toBe(false);
  });

  it('rejects URLs with embedded credentials', () => {
    const result = validateProfileUrl('https://user:pass@example.com/');
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/credentials/i);
  });

  it('rejects garbage input', () => {
    expect(validateProfileUrl('not a url').valid).toBe(false);
  });

  it('rejects URLs without a scheme', () => {
    expect(validateProfileUrl('example.com/cert').valid).toBe(false);
  });

  it('treats empty input as empty, not as an error', () => {
    const result = validateProfileUrl('');
    expect(result.valid).toBe(false);
    expect(result.empty).toBe(true);
    expect(result.error).toBeNull();
  });

  it('treats whitespace-only input as empty', () => {
    expect(validateProfileUrl('   ').empty).toBe(true);
  });

  it('treats non-string input as empty', () => {
    expect(validateProfileUrl(null).empty).toBe(true);
    expect(validateProfileUrl(undefined).empty).toBe(true);
    expect(validateProfileUrl(123).empty).toBe(true);
  });

  it('accepts URLs with query parameters', () => {
    expect(
      validateProfileUrl('https://example.com/cert?id=123&view=full').valid,
    ).toBe(true);
  });

  it('accepts URLs with an explicit port', () => {
    expect(validateProfileUrl('https://example.com:8443/cert').valid).toBe(
      true,
    );
  });

  it('accepts URLs with a path, hash, and query', () => {
    expect(
      validateProfileUrl('https://example.com/a/b?c=d#section').valid,
    ).toBe(true);
  });
});

describe('getSafeHttpsUrl', () => {
  it('returns a normalized URL for valid input', () => {
    expect(getSafeHttpsUrl('https://example.com/')).toBe(
      'https://example.com/',
    );
  });

  it('returns null for invalid input', () => {
    expect(getSafeHttpsUrl('http://example.com/')).toBeNull();
    expect(getSafeHttpsUrl('javascript:alert(1)')).toBeNull();
    expect(getSafeHttpsUrl('data:text/plain,hi')).toBeNull();
    expect(getSafeHttpsUrl('')).toBeNull();
    expect(getSafeHttpsUrl(null)).toBeNull();
  });

  it('does not double-slash', () => {
    expect(getSafeHttpsUrl('https://example.com//path')).toBe(
      'https://example.com//path',
    );
  });
});