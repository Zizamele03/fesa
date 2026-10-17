import { describe, it, expect } from 'vitest';
import { createEmptyProfile } from '../../data/careerProfileSchema.js';
import { normalizeImportedProfile } from '../../utils/importedProfileValidator.js';
import { getCanonicalSkillSet } from '../truthLock.js';

describe('Phase B — profile schema includes language categories', () => {
  it('empty profile has all skill categories including new ones', () => {
    const empty = createEmptyProfile();
    expect(empty.skills).toHaveProperty('languages');
    expect(empty.skills).toHaveProperty('queryLanguages');
    expect(empty.skills).toHaveProperty('humanLanguages');
    expect(empty.skills).toHaveProperty('uncertain');
    expect(empty.skills).toHaveProperty('technical');
    expect(empty.skills).toHaveProperty('frameworks');
    expect(empty.skills).toHaveProperty('databases');
    expect(empty.skills).toHaveProperty('cloud');
    expect(empty.skills).toHaveProperty('tools');
    expect(empty.skills).toHaveProperty('soft');
  });

  it('all skill categories start empty', () => {
    const empty = createEmptyProfile();
    for (const list of Object.values(empty.skills)) {
      expect(Array.isArray(list)).toBe(true);
      expect(list).toHaveLength(0);
    }
  });
});

describe('Phase B — imported profile normalization', () => {
  it('preserves new skill categories from imported JSON', () => {
    const imported = {
      schemaVersion: 1,
      personal: {},
      professionalSummary: '',
      education: [],
      experience: [],
      projects: [],
      skills: {
        languages: ['JavaScript', 'Python'],
        queryLanguages: ['SQL'],
        humanLanguages: ['English', 'Spanish'],
        frameworks: ['React'],
        databases: ['PostgreSQL'],
        cloud: ['AWS'],
        tools: ['Docker'],
        technical: ['REST APIs'],
        soft: ['Communication'],
        uncertain: ['Spark (ambiguous)'],
      },
      certifications: [],
      achievements: [],
    };

    const result = normalizeImportedProfile(imported);

    expect(result.skills.languages).toEqual(['JavaScript', 'Python']);
    expect(result.skills.queryLanguages).toEqual(['SQL']);
    expect(result.skills.humanLanguages).toEqual(['English', 'Spanish']);
    expect(result.skills.frameworks).toEqual(['React']);
    expect(result.skills.databases).toEqual(['PostgreSQL']);
    expect(result.skills.cloud).toEqual(['AWS']);
    expect(result.skills.tools).toEqual(['Docker']);
    expect(result.skills.technical).toEqual(['REST APIs']);
    expect(result.skills.soft).toEqual(['Communication']);
    expect(result.skills.uncertain).toEqual(['Spark (ambiguous)']);
  });

  it('handles missing new fields gracefully (old exports)', () => {
    const imported = {
      schemaVersion: 1,
      personal: {},
      professionalSummary: '',
      education: [],
      experience: [],
      projects: [],
      skills: {
        technical: ['JavaScript'],
      },
      certifications: [],
      achievements: [],
    };

    const result = normalizeImportedProfile(imported);

    expect(result.skills.technical).toEqual(['JavaScript']);
    expect(result.skills.queryLanguages).toEqual([]);
    expect(result.skills.humanLanguages).toEqual([]);
    expect(result.skills.uncertain).toEqual([]);
  });

  it('deduplicates skill entries case-insensitively', () => {
    const imported = {
      schemaVersion: 1,
      personal: {},
      professionalSummary: '',
      education: [],
      experience: [],
      projects: [],
      skills: {
        languages: ['JavaScript', 'javascript', 'JAVASCRIPT', 'Python'],
      },
      certifications: [],
      achievements: [],
    };

    const result = normalizeImportedProfile(imported);
    expect(result.skills.languages).toEqual(['JavaScript', 'Python']);
  });
});

describe('Phase B — truth lock excludes uncertain skills', () => {
  it('does not include uncertain items in the canonical skill set', () => {
    const profile = {
      schemaVersion: 1,
      personal: {},
      professionalSummary: '',
      education: [],
      experience: [],
      projects: [],
      skills: {
        languages: ['JavaScript'],
        uncertain: ['Spark (ambiguous)'],
      },
      certifications: [],
      achievements: [],
    };

    const canonical = getCanonicalSkillSet(profile);
    expect(canonical.has('javascript')).toBe(true);
    expect([...canonical].some((s) => s.includes('spark'))).toBe(false);
  });

  it('treats uncertain items as not-usable evidence', () => {
    const profile = {
      schemaVersion: 1,
      personal: {},
      professionalSummary: '',
      education: [],
      experience: [],
      projects: [],
      skills: {
        languages: ['JavaScript'],
        uncertain: ['Spark (ambiguous)'],
      },
      certifications: [],
      achievements: [],
    };

    const canonical = getCanonicalSkillSet(profile);
    expect(canonical.has('javascript')).toBe(true);
    // No canonical form of the uncertain item should exist.
    expect(canonical.size).toBe(1);
  });
});