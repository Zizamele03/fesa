import { describe, it, expect } from 'vitest';
import { validateResumeAgainstProfile } from '../resumeTruthLock.js';

function profile(overrides = {}) {
  return {
    schemaVersion: 1,
    personal: {
      fullName: 'Alex Doe',
      email: 'a@b.com',
      phone: '555-0100',
      location: 'Remote',
      linkedin: '',
      github: '',
      portfolio: '',
    },
    professionalSummary: 'Frontend engineer.',
    education: [],
    experience: [
      {
        id: 1,
        company: 'Acme',
        position: 'Engineer',
        location: '',
        startDate: '2020',
        endDate: '',
        current: true,
        description: 'Built web applications with JavaScript.',
        responsibilities: ['Built web applications with JavaScript.'],
        achievements: [],
        technologies: ['JavaScript', 'React'],
      },
    ],
    projects: [],
    skills: {
      technical: ['JavaScript', 'React'],
      soft: [],
      tools: [],
      languages: [],
      queryLanguages: [],
      humanLanguages: [],
      frameworks: [],
      databases: [],
      cloud: [],
      uncertain: [],
    },
    certifications: [],
    achievements: [],
    references: [],
    ...overrides,
  };
}

function emptyResume(overrides = {}) {
  return {
    schemaVersion: 1,
    contact: {},
    summary: '',
    skillGroups: [],
    experience: [],
    projects: [],
    education: [],
    certifications: [],
    achievements: [],
    ...overrides,
  };
}

describe('Resume Truth Lock — summary preservation', () => {
  it('keeps a summary that references profile-verified content', () => {
    const resume = emptyResume({
      summary: 'Frontend engineer with JavaScript and React experience.',
    });
    const result = validateResumeAgainstProfile(profile(), resume);
    expect(result.resume.summary).not.toBe('');
    expect(result.resume.summary).toContain('JavaScript');
  });

  it('falls back to profile.professionalSummary when AI summary is empty', () => {
    const resume = emptyResume({ summary: '' });
    const result = validateResumeAgainstProfile(profile(), resume);
    expect(result.resume.summary).toBe('Frontend engineer.');
  });

  it('drops only the offending sentence, keeps the rest', () => {
    const resume = emptyResume({
      summary:
        'Frontend engineer with JavaScript experience. Kubernetes specialist with deep Azure expertise.',
    });
    const result = validateResumeAgainstProfile(profile(), resume);
    // First sentence survives; second is dropped.
    expect(result.resume.summary).toContain('JavaScript');
    expect(result.resume.summary).not.toContain('Kubernetes');
    expect(result.resume.summary).not.toContain('Azure');
    expect(result.violations.length).toBeGreaterThan(0);
  });

  it('falls back to profile summary if all sentences are stripped', () => {
    const resume = emptyResume({
      summary: 'Kubernetes specialist. Terraform expert. Azure architect.',
    });
    const result = validateResumeAgainstProfile(profile(), resume);
    expect(result.resume.summary).toBe('Frontend engineer.');
    expect(result.violations.length).toBeGreaterThan(0);
  });

  it('leaves summary empty when profile has none and AI summary is stripped', () => {
    const empty = profile({ professionalSummary: '' });
    const resume = emptyResume({
      summary: 'Kubernetes specialist. Terraform expert.',
    });
    const result = validateResumeAgainstProfile(empty, resume);
    expect(result.resume.summary).toBe('');
  });
});

describe('Resume Truth Lock — references', () => {
  it('does not include references from AI output, only from profile', () => {
    const p = profile({
      references: [
        {
          name: 'Jane Smith',
          title: 'CTO',
          organization: 'Acme',
          relationship: 'Former manager',
          email: 'jane@acme.com',
          phone: '555-0200',
          notes: '',
        },
      ],
    });
    const resume = emptyResume({
      // Even if AI tried to sneak in a reference, it is discarded.
      references: [{ name: 'Fake Reference' }],
    });
    const result = validateResumeAgainstProfile(p, resume, {
      referencesIncluded: true,
    });
    expect(result.resume.references).toHaveLength(1);
    expect(result.resume.references[0].name).toBe('Jane Smith');
    expect(result.resume.referencesIncluded).toBe(true);
  });

  it('sets referencesIncluded false when profile has none', () => {
    const resume = emptyResume({});
    const result = validateResumeAgainstProfile(profile(), resume, {
      referencesIncluded: true,
    });
    expect(result.resume.referencesIncluded).toBe(false);
  });

  it('defaults referencesIncluded to false when not passed', () => {
    const p = profile({
      references: [
        {
          name: 'Jane Smith',
          title: '',
          organization: '',
          relationship: '',
          email: '',
          phone: '',
          notes: '',
        },
      ],
    });
    const resume = emptyResume({});
    const result = validateResumeAgainstProfile(p, resume);
    expect(result.resume.referencesIncluded).toBe(false);
    // Reference data is still stored so it can be included via the editor.
    expect(result.resume.references).toHaveLength(1);
  });
});