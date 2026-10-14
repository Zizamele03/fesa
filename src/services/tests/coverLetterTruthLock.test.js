import { describe, it, expect } from 'vitest';
import { validateCoverLetterAgainstProfile } from '../coverLetterTruthLock.js';

function profile() {
  return {
    schemaVersion: 1,
    personal: {
      fullName: 'Jordan Blake',
      email: 'jordan@example.com',
      phone: '555-0100',
      location: 'Austin, TX',
      linkedin: 'linkedin.com/in/jordan',
      github: '',
      portfolio: '',
    },
    professionalSummary: 'Frontend engineer.',
    education: [
      {
        id: 1,
        qualification: 'B.S. Computer Science',
        fieldOfStudy: 'Computer Science',
        institution: 'Texas State University',
        location: 'San Marcos, TX',
        startDate: '2017',
        endDate: '2021',
        description: '',
      },
    ],
    experience: [
      {
        id: 1,
        company: 'Brightpath Software',
        position: 'Frontend Engineer',
        location: 'Austin, TX',
        startDate: '2021',
        endDate: '',
        current: true,
        description: 'Built web applications.',
        responsibilities: [
          'Developed REST APIs using Node.js and JavaScript.',
          'Reduced page load time by 34% through code splitting.',
        ],
        achievements: [],
        technologies: ['JavaScript', 'Node.js', 'React', 'AWS'],
      },
    ],
    projects: [
      {
        id: 1,
        name: 'Job Board UI',
        description: 'Accessible job board interface.',
        technologies: ['React', 'CSS'],
        url: '',
        role: '',
        achievements: [],
      },
    ],
    skills: {
      technical: ['JavaScript', 'Node.js', 'SQL', 'AWS'],
      soft: [],
      tools: [],
      languages: [],
      frameworks: [],
      databases: [],
      cloud: [],
    },
    certifications: [
      { id: 1, name: 'Scrum Master', issuer: 'Scrum.org', date: '2023' },
    ],
    achievements: [],
  };
}

function emptyLetter(overrides = {}) {
  return {
    schemaVersion: 1,
    greeting: 'Dear Hiring Manager,',
    opening: '',
    body: [],
    closing: '',
    signoff: 'Sincerely,\nJordan Blake',
    ...overrides,
  };
}

describe('Cover Letter Truth Lock', () => {
  it('keeps supported sentences', () => {
    const letter = emptyLetter({
      opening:
        'I am writing to express my interest in the Frontend Engineer position.',
      body: [
        'I have experience developing REST APIs using Node.js and JavaScript at Brightpath Software.',
      ],
    });
    const result = validateCoverLetterAgainstProfile(profile(), letter);
    expect(result.coverLetter.opening).toBeTruthy();
    expect(result.coverLetter.body.length).toBe(1);
    expect(result.violations).toHaveLength(0);
  });

  it('keeps opening and closing when company and title are supplied as context', () => {
    const letter = emptyLetter({
      opening:
        'I am writing to apply for the Frontend Engineer position at Northwind Labs.',
      closing:
        'Thank you for considering my application for the Frontend Engineer role at Northwind Labs.',
    });
    const result = validateCoverLetterAgainstProfile(profile(), letter, {
      company: 'Northwind Labs',
      jobTitle: 'Frontend Engineer',
    });
    expect(result.coverLetter.opening).not.toBe('');
    expect(result.coverLetter.closing).not.toBe('');
  });

  it('still strips fabricated company facts even with context', () => {
    const letter = emptyLetter({
      opening:
        'I am writing to apply for the Frontend Engineer position at Northwind Labs.',
      closing:
        'I admire your innovative mission in Africa and hope to join.',
    });
    const result = validateCoverLetterAgainstProfile(profile(), letter, {
      company: 'Northwind Labs',
      jobTitle: 'Frontend Engineer',
    });
    expect(result.coverLetter.opening).not.toBe('');
    // "innovative mission in Africa" is not in profile or context → stripped.
    expect(result.coverLetter.closing).toBe('');
  });

  it('removes sentences that invent a skill', () => {
    const letter = emptyLetter({
      body: [
        'I have extensive experience with Kubernetes and Terraform.',
        'I also worked with JavaScript and Node.js.',
      ],
    });
    const result = validateCoverLetterAgainstProfile(profile(), letter);
    const joined = result.coverLetter.body.join(' ');
    expect(joined).not.toContain('Kubernetes');
    expect(joined).not.toContain('Terraform');
    expect(joined).toContain('JavaScript');
    expect(result.violations.length).toBeGreaterThan(0);
  });

  it('removes fabricated metrics while keeping supported content', () => {
    const letter = emptyLetter({
      body: [
        'I reduced page load time by 99% through code splitting.',
        'I have experience with JavaScript.',
      ],
    });
    const result = validateCoverLetterAgainstProfile(profile(), letter);
    const joined = result.coverLetter.body.join(' ');
    expect(joined).not.toContain('99%');
    expect(joined).toContain('JavaScript');
  });

  it('keeps legitimate metrics that exist in the profile', () => {
    const letter = emptyLetter({
      body: ['I reduced page load time by 34% through code splitting.'],
    });
    const result = validateCoverLetterAgainstProfile(profile(), letter);
    const joined = result.coverLetter.body.join(' ');
    expect(joined).toContain('34%');
  });

  it('rejects letter if all content is stripped', () => {
    const letter = emptyLetter({
      opening: 'I have Kubernetes experience.',
      body: ['I built systems with Terraform.'],
      closing: 'I have Azure certifications.',
    });
    expect(() =>
      validateCoverLetterAgainstProfile(profile(), letter),
    ).toThrow();
  });

  it('preserves greeting and signoff without validation', () => {
    const letter = emptyLetter({
      greeting: 'Dear Ms. Smith,',
      signoff: 'Kind regards,\nJordan Blake',
      opening: 'I have JavaScript experience.',
    });
    const result = validateCoverLetterAgainstProfile(profile(), letter);
    expect(result.coverLetter.greeting).toBe('Dear Ms. Smith,');
    expect(result.coverLetter.signoff).toContain('Jordan Blake');
  });

  it('does not invent company facts', () => {
    const letter = emptyLetter({
      opening:
        'I admire Northwind Labs for its innovative mission in Africa.',
      body: ['I have experience with JavaScript.'],
    });
    const result = validateCoverLetterAgainstProfile(profile(), letter, {
      company: 'Northwind Labs',
      jobTitle: 'Frontend Engineer',
    });
    expect(result.coverLetter.opening).toBe('');
    expect(result.coverLetter.body.length).toBe(1);
    expect(result.violations.some((v) => v.field === 'opening')).toBe(true);
  });
});