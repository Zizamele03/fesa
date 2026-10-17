import { describe, it, expect } from 'vitest';
import { buildAiRequest, mergeAiSuggestions, buildEvidenceMap } from '../aiMatchMerge.js';

function profile() {
  return {
    schemaVersion: 1,
    personal: {},
    professionalSummary: '',
    education: [],
    experience: [
      {
        id: 'exp-1',
        company: 'Acme',
        position: 'Engineer',
        technologies: ['AWS', 'Node.js'],
      },
    ],
    projects: [
      {
        id: 'proj-1',
        name: 'Job Board',
        technologies: ['React'],
      },
    ],
    skills: {
      technical: ['JavaScript', 'SQL'],
      soft: [],
      tools: [],
      languages: ['Python'],
      queryLanguages: ['SQL'],
      humanLanguages: ['English'],
      frameworks: ['React'],
      databases: ['PostgreSQL'],
      cloud: ['AWS'],
      uncertain: ['Spark (ambiguous)'],
    },
    certifications: [],
    achievements: [],
    references: [],
  };
}

function baseMatch() {
  return {
    schemaVersion: 1,
    overallScore: 40,
    breakdown: { skills: 30, education: 100, experience: 40, projects: 30, keywords: 50 },
    strongMatches: [],
    requirements: [
      {
        requirement: 'Azure',
        category: 'skills.cloud',
        importance: 'required',
        status: 'missing',
        relationship: 'MISSING',
        score: 0,
        evidence: [],
      },
      {
        requirement: 'JavaScript',
        category: 'skills.languages',
        importance: 'required',
        status: 'matched',
        relationship: 'EXACT_MATCH',
        score: 100,
        evidence: [],
      },
      {
        requirement: 'Kubernetes',
        category: 'skills.tools',
        importance: 'preferred',
        status: 'missing',
        relationship: 'MISSING',
        score: 0,
        evidence: [],
      },
    ],
    missingRequirements: [],
    partialMatches: [],
    relatedOrTransferable: [],
    unverifiedRequirements: [],
  };
}

describe('Phase E — buildEvidenceMap', () => {
  it('includes skills, experience technologies and project technologies', () => {
    const map = buildEvidenceMap(profile());
    const sources = Array.from(map.values()).map((e) => e.sourceType);
    expect(sources).toContain('skill');
    expect(sources).toContain('experience');
    expect(sources).toContain('project');
  });

  it('excludes uncertain skill items', () => {
    const map = buildEvidenceMap(profile());
    const uncertain = Array.from(map.values()).filter(
      (e) => e.sourceType === 'skill' && e.sourceId === 'uncertain',
    );
    expect(uncertain).toHaveLength(0);
  });
});

describe('Phase E — buildAiRequest', () => {
  it('only includes requirements still marked missing', () => {
    const { requirements } = buildAiRequest(baseMatch(), profile());
    expect(requirements.length).toBe(2);
    const texts = requirements.map((r) => r.text);
    expect(texts).toContain('Azure');
    expect(texts).toContain('Kubernetes');
    expect(texts).not.toContain('JavaScript');
  });

  it('preserves importance for each requirement', () => {
    const { requirements } = buildAiRequest(baseMatch(), profile());
    const byText = Object.fromEntries(requirements.map((r) => [r.text, r]));
    expect(byText.Azure.importance).toBe('required');
    expect(byText.Kubernetes.importance).toBe('preferred');
  });

  it('returns evidence ids that match buildEvidenceMap', () => {
    const { evidence } = buildAiRequest(baseMatch(), profile());
    const map = buildEvidenceMap(profile());
    for (const e of evidence) {
      expect(map.has(e.id)).toBe(true);
    }
  });
});

describe('Phase E — mergeAiSuggestions validation', () => {
  it('accepts a valid related suggestion and upgrades Missing → Related', () => {
    const base = baseMatch();
    const { requirements, evidence } = buildAiRequest(base, profile());

    const azure = requirements.find((r) => r.text === 'Azure');
    const awsEvidence = evidence.find((e) => e.text === 'AWS');
    expect(azure).toBeTruthy();
    expect(awsEvidence).toBeTruthy();

    const merged = mergeAiSuggestions(
      base,
      [
        {
          requirementId: azure.id,
          evidenceId: awsEvidence.id,
          relationship: 'related',
          explanation: 'AWS and Azure are both cloud platforms but not equivalent.',
        },
      ],
      profile(),
    );

    const azureResult = merged.requirements.find((r) => r.requirement === 'Azure');
    expect(azureResult.status).toBe('partial');
    expect(azureResult.relationship).toBe('RELATED_BUT_DIFFERENT');
    expect(azureResult.aiAssisted).toBe(true);
    expect(azureResult.explanation).toContain('AWS');
    expect(azureResult.importance).toBe('required');
    expect(merged.aiAssisted).toBe(true);
    expect(merged.aiAssistedCount).toBe(1);
  });

  it('rejects suggestions that claim "matched"', () => {
    const base = baseMatch();
    const { requirements, evidence } = buildAiRequest(base, profile());
    const azure = requirements.find((r) => r.text === 'Azure');
    const awsEvidence = evidence.find((e) => e.text === 'AWS');

    const merged = mergeAiSuggestions(
      base,
      [
        {
          requirementId: azure.id,
          evidenceId: awsEvidence.id,
          relationship: 'matched',
          explanation: 'Pretend this is a match.',
        },
      ],
      profile(),
    );

    const azureResult = merged.requirements.find((r) => r.requirement === 'Azure');
    expect(azureResult.status).toBe('missing');
    expect(azureResult.aiAssisted).toBeUndefined();
    expect(merged.aiAssistedCount).toBe(0);
  });

  it('rejects suggestions that reference unknown requirementId', () => {
    const base = baseMatch();
    const { evidence } = buildAiRequest(base, profile());
    const awsEvidence = evidence.find((e) => e.text === 'AWS');

    const merged = mergeAiSuggestions(
      base,
      [
        {
          requirementId: 'nonexistent|id',
          evidenceId: awsEvidence.id,
          relationship: 'related',
          explanation: 'Fake suggestion.',
        },
      ],
      profile(),
    );

    expect(merged.aiAssistedCount).toBe(0);
    expect(
      merged.requirements.every((r) => r.aiAssisted !== true),
    ).toBe(true);
  });

  it('rejects suggestions that reference unknown evidenceId', () => {
    const base = baseMatch();
    const { requirements } = buildAiRequest(base, profile());
    const azure = requirements.find((r) => r.text === 'Azure');

    const merged = mergeAiSuggestions(
      base,
      [
        {
          requirementId: azure.id,
          evidenceId: 'fake|evidence|id',
          relationship: 'related',
          explanation: 'Fake evidence.',
        },
      ],
      profile(),
    );

    expect(merged.aiAssistedCount).toBe(0);
  });

  it('rejects suggestions with empty explanation', () => {
    const base = baseMatch();
    const { requirements, evidence } = buildAiRequest(base, profile());
    const azure = requirements.find((r) => r.text === 'Azure');
    const awsEvidence = evidence.find((e) => e.text === 'AWS');

    const merged = mergeAiSuggestions(
      base,
      [
        {
          requirementId: azure.id,
          evidenceId: awsEvidence.id,
          relationship: 'related',
          explanation: '',
        },
      ],
      profile(),
    );

    expect(merged.aiAssistedCount).toBe(0);
  });

  it('accepts only one suggestion per requirement', () => {
    const base = baseMatch();
    const { requirements, evidence } = buildAiRequest(base, profile());
    const azure = requirements.find((r) => r.text === 'Azure');
    const awsEvidence = evidence.find((e) => e.text === 'AWS');
    const reactEvidence = evidence.find((e) => e.text === 'React');

    const merged = mergeAiSuggestions(
      base,
      [
        {
          requirementId: azure.id,
          evidenceId: awsEvidence.id,
          relationship: 'related',
          explanation: 'First suggestion.',
        },
        {
          requirementId: azure.id,
          evidenceId: reactEvidence.id,
          relationship: 'related',
          explanation: 'Second suggestion for same req.',
        },
      ],
      profile(),
    );

    expect(merged.aiAssistedCount).toBe(1);
    const azureResult = merged.requirements.find((r) => r.requirement === 'Azure');
    expect(azureResult.explanation).toBe('First suggestion.');
  });

  it('does not change required/preferred importance', () => {
    const base = baseMatch();
    const { requirements, evidence } = buildAiRequest(base, profile());
    const k8s = requirements.find((r) => r.text === 'Kubernetes');
    const awsEvidence = evidence.find((e) => e.text === 'AWS');

    const merged = mergeAiSuggestions(
      base,
      [
        {
          requirementId: k8s.id,
          evidenceId: awsEvidence.id,
          relationship: 'related',
          explanation: 'Both cloud-related but not equivalent.',
        },
      ],
      profile(),
    );

    const k8sResult = merged.requirements.find((r) => r.requirement === 'Kubernetes');
    expect(k8sResult.importance).toBe('preferred');
  });

  it('never upgrades a matched requirement', () => {
    const base = baseMatch();
    const merged = mergeAiSuggestions(
      base,
      [
        {
          requirementId: 'skills.languages|required|javascript',
          evidenceId: 'skill|languages|javascript',
          relationship: 'related',
          explanation: 'Fake.',
        },
      ],
      profile(),
    );

    const js = merged.requirements.find((r) => r.requirement === 'JavaScript');
    expect(js.status).toBe('matched');
    expect(js.aiAssisted).toBeUndefined();
  });

  it('recomputes related/missing lists after merge', () => {
    const base = baseMatch();
    base.missingRequirements = base.requirements.filter(
      (r) => r.status === 'missing' && r.importance === 'required',
    );
    const { requirements, evidence } = buildAiRequest(base, profile());
    const azure = requirements.find((r) => r.text === 'Azure');
    const awsEvidence = evidence.find((e) => e.text === 'AWS');

    const merged = mergeAiSuggestions(
      base,
      [
        {
          requirementId: azure.id,
          evidenceId: awsEvidence.id,
          relationship: 'related',
          explanation: 'AWS is related to Azure but not equivalent.',
        },
      ],
      profile(),
    );

    expect(
      merged.missingRequirements.some((r) => r.requirement === 'Azure'),
    ).toBe(false);
    expect(
      merged.relatedOrTransferable.some((r) => r.requirement === 'Azure'),
    ).toBe(true);
  });

  it('returns base result unchanged when suggestions are malformed', () => {
    const base = baseMatch();
    const merged = mergeAiSuggestions(base, [null, 42, 'bad', {}], profile());
    expect(merged.aiAssistedCount).toBe(0);
    expect(merged.requirements.map((r) => r.status)).toEqual(
      base.requirements.map((r) => r.status),
    );
  });

  // NEW: validates against sent evidence, not the full map
  it('rejects evidence IDs that exist in the profile but were NOT sent to AI', () => {
    // Create a profile with more than 60 evidence items so some are cut from
    // the sent list but remain in the full evidence map.
    const bigProfile = profile();
    bigProfile.skills.technical = [];
    for (let i = 0; i < 100; i += 1) {
      bigProfile.skills.technical.push(`Skill${i}`);
    }

    const base = baseMatch();
    const { evidence: sentEvidence, evidenceMap: fullMap } = buildAiRequest(
      base,
      bigProfile,
    );

    // Confirm the map is bigger than the sent list.
    expect(fullMap.size).toBeGreaterThan(sentEvidence.length);

    // Pick an evidence ID that is in the full map but NOT in the sent list.
    const sentIds = new Set(sentEvidence.map((e) => e.id));
    const unsentEntry = Array.from(fullMap.values()).find(
      (e) => !sentIds.has(e.id),
    );
    expect(unsentEntry).toBeTruthy();

    // const azure = base.requirements.find((r) => r.requirement === 'Azure');
    const { requirements: reqs } = buildAiRequest(base, bigProfile);
    const azureReq = reqs.find((r) => r.text === 'Azure');

    const merged = mergeAiSuggestions(
      base,
      [
        {
          requirementId: azureReq.id,
          evidenceId: unsentEntry.id,
          relationship: 'related',
          explanation: 'AI somehow guessed an unsent evidence ID.',
        },
      ],
      bigProfile,
    );

    // Suggestion must be rejected: the evidence was never sent.
    expect(merged.aiAssistedCount).toBe(0);
  });
});