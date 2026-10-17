import { describe, it, expect } from 'vitest';
import { validateResumeAgainstProfile } from '../resumeTruthLock.js';

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
      queryLanguages: [],
      humanLanguages: [],
      frameworks: [],
      databases: [],
      cloud: [],
      uncertain: [],
    },
    certifications: [
      { id: 1, name: 'Scrum Master', issuer: 'Scrum.org', date: '2023' },
    ],
    achievements: [],
    references: [],
  };
}

function emptyResume(overrides = {}) {
  return {
    schemaVersion: 1,
    contact: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      links: [],
    },
    summary: '',
    skillGroups: [],
    experience: [],
    projects: [],
    education: [],
    certifications: [],
    achievements: [],
    references: [],
    referencesIncluded: false,
    userEdited: false,
    ...overrides,
  };
}

describe('Resume Truth Lock', () => {
  it('keeps skills that exist in profile', () => {
    const resume = emptyResume({
      skillGroups: [{ label: 'Technical', items: ['JavaScript', 'Node.js'] }],
    });
    const result = validateResumeAgainstProfile(profile(), resume);
    expect(result.resume.skillGroups[0].items).toEqual(['JavaScript', 'Node.js']);
    expect(result.violations).toHaveLength(0);
  });

  it('removes skills not in profile', () => {
    const resume = emptyResume({
      skillGroups: [{ label: 'Technical', items: ['JavaScript', 'Kubernetes'] }],
    });
    const result = validateResumeAgainstProfile(profile(), resume);
    expect(result.resume.skillGroups[0].items).toEqual(['JavaScript']);
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0].claim).toBe('Kubernetes');
  });

  it('drops experience entries not in profile', () => {
    const resume = emptyResume({
      experience: [
        {
          company: 'Fake Corp',
          position: 'Senior Engineer',
          location: '',
          dates: '',
          bullets: ['Led the team.'],
        },
      ],
    });
    const result = validateResumeAgainstProfile(profile(), resume);
    expect(result.resume.experience).toHaveLength(0);
    expect(result.violations).toHaveLength(1);
  });

  it('keeps legitimate bullets that rewrite profile content', () => {
    const resume = emptyResume({
      experience: [
        {
          company: 'Brightpath Software',
          position: 'Frontend Engineer',
          location: '',
          dates: '',
          bullets: ['Built and maintained REST APIs using Node.js and JavaScript.'],
        },
      ],
    });
    const result = validateResumeAgainstProfile(profile(), resume);
    expect(result.resume.experience).toHaveLength(1);
    expect(result.resume.experience[0].bullets.length).toBeGreaterThan(0);
  });

  it('rejects bullets that fabricate a metric', () => {
    const resume = emptyResume({
      experience: [
        {
          company: 'Brightpath Software',
          position: 'Frontend Engineer',
          location: '',
          dates: '',
          bullets: ['Reduced page load time by 99% through code splitting.'],
        },
      ],
    });
    const result = validateResumeAgainstProfile(profile(), resume);
    const has99 = result.resume.experience[0].bullets.some((b) => b.includes('99%'));
    expect(has99).toBe(false);
  });

  it('rejects summary that invents a skill and falls back to profile summary', () => {
    const resume = emptyResume({
      summary: 'Kubernetes specialist. Terraform expert. Azure architect.',
    });
    const result = validateResumeAgainstProfile(profile(), resume);
    // Invented skills must not appear.
    expect(result.resume.summary).not.toContain('Kubernetes');
    expect(result.resume.summary).not.toContain('Terraform');
    expect(result.resume.summary).not.toContain('Azure');
    // Fallback preserves the profile's own summary.
    expect(result.resume.summary).toBe('Frontend engineer.');
    // Violations are recorded.
    expect(result.violations.some((v) => v.field === 'summary')).toBe(true);
  });

  it('drops certifications not in profile', () => {
    const resume = emptyResume({
      certifications: [
        { name: 'Scrum Master', issuer: 'Scrum.org', date: '2023' },
        { name: 'AWS Solutions Architect', issuer: 'AWS', date: '2024' },
      ],
    });
    const result = validateResumeAgainstProfile(profile(), resume);
    expect(result.resume.certifications).toHaveLength(1);
    expect(result.resume.certifications[0].name).toBe('Scrum Master');
  });

  it('keeps projects that exist in profile', () => {
    const resume = emptyResume({
      projects: [{ name: 'Job Board UI', description: '', technologies: [], url: '' }],
    });
    const result = validateResumeAgainstProfile(profile(), resume);
    expect(result.resume.projects).toHaveLength(1);
  });

  it('uses profile contact values regardless of AI output', () => {
    const resume = emptyResume({
      contact: {
        fullName: 'Fake Name',
        email: 'fake@fake.com',
        phone: '000',
        location: 'Nowhere',
        links: [],
      },
    });
    const result = validateResumeAgainstProfile(profile(), resume);
    expect(result.resume.contact.fullName).toBe('Jordan Blake');
    expect(result.resume.contact.email).toBe('jordan@example.com');
  });
});