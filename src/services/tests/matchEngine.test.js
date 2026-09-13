import { describe, it, expect } from 'vitest';
import { computeMatch } from '../matchEngine.js';

function buildProfile(overrides = {}) {
  return {
    schemaVersion: 1,
    personal: {},
    professionalSummary: '',
    education: [],
    experience: [],
    projects: [],
    skills: {
      technical: [],
      soft: [],
      tools: [],
      languages: [],
      frameworks: [],
      databases: [],
      cloud: [],
    },
    certifications: [],
    achievements: [],
    ...overrides,
  };
}

function buildJobAnalysis(skills = {}, extra = {}) {
  return {
    schemaVersion: 1,
    job: { company: 'Test', title: 'Test' },
    summary: '',
    educationRequirements: [],
    experienceRequirements: [],
    requiredQualifications: [],
    preferredQualifications: [],
    requiredSkills: {
      technical: skills.requiredTechnical || [],
      soft: [],
      tools: [],
      frameworks: [],
      languages: [],
      databases: [],
      cloudTechnologies: [],
    },
    preferredSkills: {
      technical: skills.preferredTechnical || [],
      soft: [],
      tools: [],
      frameworks: [],
      languages: [],
      databases: [],
      cloudTechnologies: [],
    },
    responsibilities: [],
    certifications: [],
    keywords: [],
    ...extra,
  };
}

function findRequirement(result, name) {
  return result.requirements.find(
    (r) => r.requirement.toLowerCase() === name.toLowerCase(),
  );
}

describe('Match Engine — false positive prevention', () => {
  it('does not match JavaScript against Java', () => {
    const profile = buildProfile({
      skills: { technical: ['JavaScript'], soft: [], tools: [], languages: [], frameworks: [], databases: [], cloud: [] },
    });
    const job = buildJobAnalysis({ requiredTechnical: ['Java'] });
    const result = computeMatch(profile, job);
    const item = findRequirement(result, 'Java');
    expect(item).toBeTruthy();
    expect(item.status).toBe('missing');
    expect(item.relationship).toBe('MISSING');
  });

  it('does not match AWS as Azure but marks them as related', () => {
    const profile = buildProfile({
      skills: { technical: [], soft: [], tools: [], languages: [], frameworks: [], databases: [], cloud: ['AWS'] },
    });
    const job = buildJobAnalysis({ requiredTechnical: ['Azure'] });
    const result = computeMatch(profile, job);
    const item = findRequirement(result, 'Azure');
    expect(item).toBeTruthy();
    expect(item.status).toBe('partial');
    expect(['RELATED_BUT_DIFFERENT', 'TRANSFERABLE']).toContain(item.relationship);
  });

  it('does not treat Docker as Kubernetes', () => {
    const profile = buildProfile({
      skills: { technical: [], soft: [], tools: ['Docker'], languages: [], frameworks: [], databases: [], cloud: [] },
    });
    const job = buildJobAnalysis({ requiredTechnical: ['Kubernetes'] });
    const result = computeMatch(profile, job);
    const item = findRequirement(result, 'Kubernetes');
    expect(item).toBeTruthy();
    expect(item.status).toBe('partial');
    expect(item.relationship).toBe('RELATED_BUT_DIFFERENT');
  });

  it('does not auto-match PostgreSQL against SQL as exact', () => {
    const profile = buildProfile({
      skills: { technical: [], soft: [], tools: [], languages: [], frameworks: [], databases: ['PostgreSQL'], cloud: [] },
    });
    const job = buildJobAnalysis({ requiredTechnical: ['SQL'] });
    const result = computeMatch(profile, job);
    const item = findRequirement(result, 'SQL');
    expect(item).toBeTruthy();
    expect(item.status).not.toBe('matched');
    expect(['TRANSFERABLE', 'RELATED_BUT_DIFFERENT', 'PARTIAL_MATCH']).toContain(item.relationship);
  });
});

describe('Match Engine — positive matches', () => {
  it('matches exact skills', () => {
    const profile = buildProfile({
      skills: { technical: ['JavaScript', 'Node.js', 'SQL'], soft: [], tools: [], languages: [], frameworks: [], databases: [], cloud: ['AWS'] },
    });
    const job = buildJobAnalysis({ requiredTechnical: ['JavaScript', 'Node.js', 'SQL', 'AWS'] });
    const result = computeMatch(profile, job);
    ['JavaScript', 'Node.js', 'SQL', 'AWS'].forEach((skill) => {
      const item = findRequirement(result, skill);
      expect(item.status).toBe('matched');
      expect(item.relationship).toBe('EXACT_MATCH');
    });
  });

  it('matches aliases (JS → JavaScript)', () => {
    const profile = buildProfile({
      skills: { technical: ['JS'], soft: [], tools: [], languages: [], frameworks: [], databases: [], cloud: [] },
    });
    const job = buildJobAnalysis({ requiredTechnical: ['JavaScript'] });
    const result = computeMatch(profile, job);
    const item = findRequirement(result, 'JavaScript');
    expect(item.status).toBe('matched');
    expect(['ALIAS_MATCH', 'EXACT_MATCH']).toContain(item.relationship);
  });

  it('matches contextual experience evidence', () => {
    const profile = buildProfile({
      experience: [
        {
          id: 1,
          position: 'Software Developer',
          company: 'Acme',
          description: 'Developed REST APIs using Node.js and JavaScript.',
          responsibilities: [],
          achievements: [],
          technologies: [],
        },
      ],
    });
    const job = buildJobAnalysis({ requiredTechnical: ['REST API'] });
    const result = computeMatch(profile, job);
    const item = findRequirement(result, 'REST API');
    expect(item.status).toBe('matched');
    expect(item.relationship).toBe('STRONG_CONTEXT_MATCH');
  });
});

describe('Match Engine — difficult scenario (Phase 6 spec)', () => {
  it('rejects Kubernetes / Terraform / Azure / Java against a Node-heavy profile', () => {
    const profile = buildProfile({
      skills: { technical: ['Node.js', 'JavaScript', 'SQL'], soft: [], tools: [], languages: [], frameworks: [], databases: [], cloud: ['AWS'] },
    });
    const job = buildJobAnalysis({
      requiredTechnical: ['Kubernetes', 'Terraform', 'Azure', 'Java'],
    });
    const result = computeMatch(profile, job);

    const k8s = findRequirement(result, 'Kubernetes');
    const tf = findRequirement(result, 'Terraform');
    const az = findRequirement(result, 'Azure');
    const java = findRequirement(result, 'Java');

    expect(k8s.status).not.toBe('matched');
    expect(tf.status).not.toBe('matched');
    expect(az.status).not.toBe('matched');
    expect(java.status).not.toBe('matched');

    expect(java.relationship).toBe('MISSING');
    expect(k8s.relationship).not.toBe('EXACT_MATCH');
    expect(az.relationship).not.toBe('EXACT_MATCH');
  });

  it('produces a reproducible score for identical inputs', () => {
    const profile = buildProfile({
      skills: { technical: ['JavaScript'], soft: [], tools: [], languages: [], frameworks: [], databases: [], cloud: [] },
    });
    const job = buildJobAnalysis({ requiredTechnical: ['JavaScript', 'Java'] });
    const a = computeMatch(profile, job);
    const b = computeMatch(profile, job);
    expect(a.overallScore).toBe(b.overallScore);
  });
});