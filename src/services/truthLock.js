import { canonicalizeSkill } from './aliasMap.js';

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function asObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function normalizeText(value = '') {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9+#. ]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getCanonicalSkillSet(profile) {
  if (!profile || typeof profile !== 'object') return new Set();

  const skills = new Set();

  const add = (value) => {
    const canonical = canonicalizeSkill(value);
    if (canonical) skills.add(canonical);
  };

  const skillGroups = asObject(profile.skills);
  for (const list of Object.values(skillGroups)) {
    asArray(list).forEach(add);
  }

  asArray(profile.projects).forEach((project) => {
    asArray(project.technologies).forEach(add);
  });

  asArray(profile.experience).forEach((job) => {
    asArray(job.technologies).forEach(add);
  });

  return skills;
}

export function getProfileTextSources(profile) {
  const sources = [];

  if (profile.professionalSummary) {
    sources.push({
      sourceType: 'career_profile',
      sourceId: 'summary',
      sourceTitle: 'Professional Summary',
      text: String(profile.professionalSummary),
    });
  }

  asArray(profile.experience).forEach((job, index) => {
    const text = [
      job.description,
      ...asArray(job.responsibilities),
      ...asArray(job.achievements),
      ...asArray(job.technologies),
    ]
      .filter(Boolean)
      .join(' ');
    if (text) {
      sources.push({
        sourceType: 'experience',
        sourceId: job.id || `experience-${index}`,
        sourceTitle: `${job.position || 'Role'} at ${job.company || 'Company'}`,
        text,
      });
    }
  });

  asArray(profile.projects).forEach((project, index) => {
    const text = [
      project.description,
      ...asArray(project.technologies),
      ...asArray(project.achievements),
    ]
      .filter(Boolean)
      .join(' ');
    if (text) {
      sources.push({
        sourceType: 'project',
        sourceId: project.id || `project-${index}`,
        sourceTitle: project.name || 'Project',
        text,
      });
    }
  });

  const educationText = asArray(profile.education)
    .map((edu) =>
      normalizeText(
        `${edu.qualification || ''} ${edu.fieldOfStudy || ''} ${edu.institution || ''}`,
      ),
    )
    .filter(Boolean)
    .join(' ');
  if (educationText) {
    sources.push({
      sourceType: 'education',
      sourceId: 'education',
      sourceTitle: 'Education',
      text: educationText,
    });
  }

  return sources;
}

export function findEvidenceForRequirement(profile, requirement, knownSkills) {
  const canonicalRequirement = canonicalizeSkill(requirement);
  const directSkills = knownSkills || getCanonicalSkillSet(profile);
  const evidence = [];

  if (directSkills.has(canonicalRequirement)) {
    const sources = getProfileTextSources(profile);

    for (const source of sources) {
      const normalizedSource = normalizeText(source.text);
      if (normalizedSource.includes(canonicalRequirement)) {
        evidence.push({
          sourceType: source.sourceType,
          sourceId: source.sourceId,
          sourceTitle: source.sourceTitle,
          text: requirement,
        });
      }
    }

    if (evidence.length === 0) {
      evidence.push({
        sourceType: 'skill',
        sourceId: `skill-${canonicalRequirement}`,
        sourceTitle: 'Career Profile Skill',
        text: requirement,
      });
    }
  }

  return evidence.slice(0, 3);
}

export function validateClaimAgainstProfile(profile, claim) {
  const canonicalClaim = normalizeText(claim);
  const knownSkills = getCanonicalSkillSet(profile);
  const sourceTexts = getProfileTextSources(profile).map((source) =>
    normalizeText(source.text),
  );

  const hasTextEvidence = sourceTexts.some((text) =>
    text.includes(canonicalClaim),
  );

  const hasSkillEvidence = knownSkills.has(canonicalizeSkill(claim));

  const supported = Boolean(hasTextEvidence || hasSkillEvidence);

  let evidence = [];

  if (supported) {
    evidence = findEvidenceForRequirement(profile, claim, knownSkills);
  }

  return {
    claim,
    supported,
    evidence,
  };
}

export function validateClaims(profile, claims) {
  return claims.map((claim) => validateClaimAgainstProfile(profile, claim));
}

export const TRUTH_LOCK_RULES = Object.freeze({
  NO_EVIDENCE_NO_CLAIM: true,
  SEMANTIC_SIMILARITY_IS_NOT_PROOF: true,
  AI_CANNOT_CREATE_EVIDENCE: true,
  GENERATED_CLAIMS_MUST_BE_TRACEABLE: true,
  UNSUPPORTED_SKILLS_MUST_BE_FLAGGED: true,
  DO_NOT_UPGRADE_RELATED_SKILLS: true,
  PRESERVE_UNCERTAINTY: true,
  NO_HALLUCINATED_EXPERIENCE: true,
  NO_FALSE_QUALIFICATION_CLAIMS: true,
  MISSING_REQUIREMENTS_REMAIN_VISIBLE: true,
});