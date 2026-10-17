import { describe, it, expect } from 'vitest';
import { createEmptyProfile } from '../../data/careerProfileSchema.js';
import { normalizeImportedProfile } from '../../utils/importedProfileValidator.js';

describe('References — profile normalization', () => {
  it('empty profile includes a references array', () => {
    const empty = createEmptyProfile();
    expect(Array.isArray(empty.references)).toBe(true);
    expect(empty.references).toHaveLength(0);
  });

  it('imports references cleanly', () => {
    const imported = {
      schemaVersion: 1,
      personal: {},
      professionalSummary: '',
      education: [],
      experience: [],
      projects: [],
      skills: {},
      certifications: [],
      achievements: [],
      references: [
        {
          name: 'Jane Smith',
          title: 'CTO',
          organization: 'Acme',
          relationship: 'Former manager',
          email: 'jane@acme.com',
          phone: '555-0200',
          notes: 'Speak to about backend work.',
        },
      ],
    };
    const result = normalizeImportedProfile(imported);
    expect(result.references).toHaveLength(1);
    expect(result.references[0].name).toBe('Jane Smith');
    expect(result.references[0].email).toBe('jane@acme.com');
  });

  it('handles old exports with no references field', () => {
    const imported = {
      schemaVersion: 1,
      personal: {},
      professionalSummary: '',
      education: [],
      experience: [],
      projects: [],
      skills: {},
      certifications: [],
      achievements: [],
    };
    const result = normalizeImportedProfile(imported);
    expect(result.references).toEqual([]);
  });

  it('coerces invalid reference items to safe defaults', () => {
    const imported = {
      schemaVersion: 1,
      personal: {},
      professionalSummary: '',
      education: [],
      experience: [],
      projects: [],
      skills: {},
      certifications: [],
      achievements: [],
      references: [
        {
          name: 123,
          title: null,
          organization: undefined,
        },
      ],
    };
    const result = normalizeImportedProfile(imported);
    expect(result.references).toHaveLength(1);
    expect(result.references[0].name).toBe('');
    expect(result.references[0].title).toBe('');
    expect(result.references[0].organization).toBe('');
  });
});