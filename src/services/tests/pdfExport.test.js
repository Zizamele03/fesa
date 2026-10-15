import { describe, it, expect } from 'vitest';
import { sanitizeFilenamePart, buildFilename } from '../pdfExport.js';

describe('sanitizeFilenamePart', () => {
  it('replaces spaces with underscores', () => {
    expect(sanitizeFilenamePart('Frontend Engineer')).toBe('Frontend_Engineer');
  });

  it('strips unsafe characters', () => {
    expect(sanitizeFilenamePart('ACME/Corp. Ltd')).toBe('ACMECorp_Ltd');
  });

  it('collapses runs of underscores', () => {
    expect(sanitizeFilenamePart('A   B___C')).toBe('A_B_C');
  });

  it('returns fallback for empty input', () => {
    expect(sanitizeFilenamePart('', 'Fallback')).toBe('Fallback');
    expect(sanitizeFilenamePart('///', 'Fallback')).toBe('Fallback');
    expect(sanitizeFilenamePart(null, 'Fallback')).toBe('Fallback');
  });

  it('truncates long values', () => {
    const long = 'A'.repeat(200);
    expect(sanitizeFilenamePart(long).length).toBeLessThanOrEqual(60);
  });
});

describe('buildFilename', () => {
  it('produces an expected filename', () => {
    expect(buildFilename('Northwind Labs', 'Frontend Engineer', 'Resume')).toBe(
      'Northwind_Labs_Frontend_Engineer_Resume.pdf',
    );
  });

  it('falls back for missing values', () => {
    expect(buildFilename('', '', 'Resume')).toBe(
      'Company_Position_Resume.pdf',
    );
  });

  it('sanitizes unsafe characters in company and title', () => {
    expect(buildFilename('ACME / Inc', 'Sr. Dev: Lead', 'Cover_Letter')).toBe(
      'ACME_Inc_Sr_Dev_Lead_Cover_Letter.pdf',
    );
  });

  it('always produces a .pdf extension', () => {
    expect(buildFilename('X', 'Y', 'Z')).toMatch(/\.pdf$/);
  });
});