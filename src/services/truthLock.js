import { canonicalizeSkill, SKILL_ALIASES } from './aliasMap.js';

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function asObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

export function normalizeText(value = '') {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9+#. ]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function stemToken(token) {
  if (token.length < 4) return token;
  if (token.endsWith('ss')) return token;
  if (token.endsWith('ies') && token.length > 4) {
    return `${token.slice(0, -3)}y`;
  }
  if (token.endsWith('s')) return token.slice(0, -1);
  return token;
}

function tokenizeForMatching(text) {
  return normalizeText(text)
    .split(' ')
    .filter((token) => token.length > 0)
    .map(stemToken);
}

export function containsPhrase(haystack, needle) {
  const haystackTokens = tokenizeForMatching(haystack);
  const needleTokens = tokenizeForMatching(needle);

  if (needleTokens.length === 0) return false;
  if (haystackTokens.length === 0) return false;

  if (needleTokens.length === 1) {
    return haystackTokens.includes(needleTokens[0]);
  }

  for (let i = 0; i <= haystackTokens.length - needleTokens.length; i += 1) {
    let allMatch = true;
    for (let j = 0; j < needleTokens.length; j += 1) {
      if (haystackTokens[i + j] !== needleTokens[j]) {
        allMatch = false;
        break;
      }
    }
    if (allMatch) return true;
  }

  return false;
}

function getAliasesForCanonical(canonical) {
  const aliases = [];
  for (const [alias, value] of Object.entries(SKILL_ALIASES)) {
    if (value === canonical && alias !== canonical) aliases.push(alias);
  }
  return aliases;
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
      job.company,
      job.position,
      job.location,
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
      project.name,
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
      `${edu.qualification || ''} ${edu.fieldOfStudy || ''} ${edu.institution || ''}`.trim(),
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

  asArray(profile.certifications).forEach((cert, index) => {
    const text = [cert.name, cert.issuer].filter(Boolean).join(' ');
    if (text) {
      sources.push({
        sourceType: 'certification',
        sourceId: cert.id || `certification-${index}`,
        sourceTitle: cert.name || 'Certification',
        text,
      });
    }
  });

  asArray(profile.achievements).forEach((achievement, index) => {
    const text = [achievement.title, achievement.description]
      .filter(Boolean)
      .join(' ');
    if (text) {
      sources.push({
        sourceType: 'achievement',
        sourceId: achievement.id || `achievement-${index}`,
        sourceTitle: achievement.title || 'Achievement',
        text,
      });
    }
  });

  // Include all listed skills, so a skill declared in the profile but not
  // repeated in any experience/project is still treated as evidence.
  const allSkills = [];
  for (const list of Object.values(asObject(profile.skills))) {
    for (const skill of asArray(list)) {
      const str = String(skill || '').trim();
      if (str) allSkills.push(str);
    }
  }
  if (allSkills.length > 0) {
    sources.push({
      sourceType: 'skill',
      sourceId: 'skills',
      sourceTitle: 'Skills',
      text: allSkills.join(' '),
    });
  }

  return sources;
}

export function findEvidenceForSkill(profile, skillName, canonicalSet) {
  const knownSkills = canonicalSet || getCanonicalSkillSet(profile);
  const canonical = canonicalizeSkill(skillName);
  if (!canonical || !knownSkills.has(canonical)) return [];

  const aliases = [canonical, skillName, ...getAliasesForCanonical(canonical)];
  const sources = getProfileTextSources(profile);
  const evidence = [];

  for (const source of sources) {
    const matched = aliases.some((alias) => containsPhrase(source.text, alias));
    if (matched) {
      evidence.push({
        sourceType: source.sourceType,
        sourceId: source.sourceId,
        sourceTitle: source.sourceTitle,
        text: skillName,
      });
    }
  }

  if (evidence.length === 0) {
    evidence.push({
      sourceType: 'skill',
      sourceId: `skill-${canonical}`,
      sourceTitle: 'Career Profile Skill',
      text: skillName,
    });
  }

  return evidence.slice(0, 3);
}

export function findEvidenceForAnySkill(profile, skillNames, canonicalSet) {
  const seen = new Set();
  const evidence = [];

  for (const name of skillNames) {
    const items = findEvidenceForSkill(profile, name, canonicalSet);
    for (const item of items) {
      const key = `${item.sourceType}:${item.sourceId}`;
      if (!seen.has(key)) {
        seen.add(key);
        evidence.push(item);
      }
    }
  }

  return evidence.slice(0, 4);
}

export function validateClaimAgainstProfile(profile, claim) {
  const knownSkills = getCanonicalSkillSet(profile);
  const normalizedClaim = normalizeText(claim);

  if (!normalizedClaim) {
    return {
      claim,
      supported: false,
      evidence: [],
      reason: 'Empty claim',
    };
  }

  const canonical = canonicalizeSkill(claim);
  const hasSkill = knownSkills.has(canonical);

  const sources = getProfileTextSources(profile);
  const hasText = sources.some((source) => containsPhrase(source.text, claim));

  const supported = hasSkill || hasText;

  return {
    claim,
    supported,
    evidence: supported ? findEvidenceForSkill(profile, claim, knownSkills) : [],
    reason: supported
      ? 'Evidence found in Career Profile'
      : 'No supporting evidence in Career Profile',
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