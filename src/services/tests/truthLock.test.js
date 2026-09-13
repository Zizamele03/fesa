import { describe, it, expect } from 'vitest';
import {
  getCanonicalSkillSet,
  findEvidenceForSkill,
  validateClaimAgainstProfile,
  validateClaims,
} from '../truthLock.js';

function profile() {
  return {
    schemaVersion: 1,
    professionalSummary: 'Backend engineer with cloud experience.',
    education: [],
    experience: [
      {
        id: 'exp-1',
        position: 'Developer',
        company: 'Acme',
        description: 'Built REST APIs using Node.js.',
        responsibilities: ['Deployed services on AWS.'],
        achievements: [],
        technologies: ['Node.js', 'AWS'],
      },
    ],
    projects: [
      {
        id: 'p-1',
        name: 'Job Board',
        description: 'A React frontend for browsing jobs.',
        technologies: ['React', 'JavaScript'],
        achievements: [],
      },
    ],
    skills: {
      technical: ['JavaScript', 'Node.js', 'SQL'],
      soft: [],
      tools: [],
      languages: [],
      frameworks: [],
      databases: [],
      cloud: ['AWS'],
    },
    certifications: [],
    achievements: [],
  };
}

describe('Truth Lock — canonical skill set', () => {
  it('collects skills from all sources', () => {
    const set = getCanonicalSkillSet(profile());
    expect(set.has('javascript')).toBe(true);
    expect(set.has('node.js')).toBe(true);
    expect(set.has('sql')).toBe(true);
    expect(set.has('aws')).toBe(true);
    expect(set.has('react')).toBe(true);
  });
});

describe('Truth Lock — evidence lookup', () => {
  it('returns evidence for a known skill', () => {
    const evidence = findEvidenceForSkill(profile(), 'AWS');
    expect(evidence.length).toBeGreaterThan(0);
    expect(evidence[0].sourceType).toBeTruthy();
  });

  it('returns no evidence for unknown skill', () => {
    const evidence = findEvidenceForSkill(profile(), 'Kubernetes');
    expect(evidence).toEqual([]);
  });
});

describe('Truth Lock — claim validation', () => {
  it('marks a supported claim as supported', () => {
    const result = validateClaimAgainstProfile(profile(), 'Node.js');
    expect(result.supported).toBe(true);
  });

  it('marks an unsupported claim as unsupported', () => {
    const result = validateClaimAgainstProfile(profile(), 'Kubernetes');
    expect(result.supported).toBe(false);
  });

  it('supports batch validation', () => {
    const results = validateClaims(profile(), ['Node.js', 'Kubernetes', 'AWS']);
    expect(results[0].supported).toBe(true);
    expect(results[1].supported).toBe(false);
    expect(results[2].supported).toBe(true);
  });
});