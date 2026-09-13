import { canonicalizeSkill, STOP_WORDS } from './aliasMap.js';
import { classifyRelationship } from './relatedTechnologies.js';
import {
  getCanonicalSkillSet,
  getProfileTextSources,
  findEvidenceForSkill,
  findEvidenceForAnySkill,
  normalizeText,
  containsPhrase,
} from './truthLock.js';

const WEIGHTS = {
  skills: 0.35,
  education: 0.15,
  experience: 0.2,
  projects: 0.15,
  keywords: 0.1,
};

function tokenize(value = '') {
  return normalizeText(value)
    .split(' ')
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function asObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function matchSkillRequirement(requirement, profile, importance, profileSkills) {
  const rawRequirement = String(requirement).trim();
  if (!rawRequirement) return null;

  // Step 1: direct evidence (exact or alias)
  const directEvidence = findEvidenceForSkill(profile, rawRequirement, profileSkills);
  if (directEvidence.length > 0) {
    const rawCanonical = canonicalizeSkill(rawRequirement);
    const isAlias = directEvidence.some(
      (ev) =>
        canonicalizeSkill(ev.text) === rawCanonical &&
        normalizeText(ev.text) !== rawCanonical,
    );
    return {
      requirement: rawRequirement,
      category: 'skills',
      importance,
      status: 'matched',
      relationship: isAlias ? 'ALIAS_MATCH' : 'EXACT_MATCH',
      score: 100,
      evidence: directEvidence,
    };
  }

  // Step 2: contextual match (all significant tokens of the requirement appear
  // in a profile text source).
  const textSources = getProfileTextSources(profile);
  const requirementTokens = tokenize(rawRequirement);

  if (requirementTokens.length > 0) {
    const contextEvidence = [];
    for (const source of textSources) {
      const allPresent = requirementTokens.every((token) =>
        containsPhrase(source.text, token),
      );
      if (allPresent) {
        contextEvidence.push({
          sourceType: source.sourceType,
          sourceId: source.sourceId,
          sourceTitle: source.sourceTitle,
          text: source.text,
        });
      }
    }

    if (contextEvidence.length > 0) {
      return {
        requirement: rawRequirement,
        category: 'skills',
        importance,
        status: 'matched',
        relationship: 'STRONG_CONTEXT_MATCH',
        score: 80,
        evidence: contextEvidence.slice(0, 3),
      };
    }
  }

  // Step 3: related or transferable
  const relatedSkillNames = [];
  let bestRelationship = null;

  for (const profileSkill of profileSkills) {
    const rel = classifyRelationship(profileSkill, rawRequirement);
    if (rel === 'TRANSFERABLE') {
      relatedSkillNames.push(profileSkill);
      bestRelationship = 'TRANSFERABLE';
    } else if (rel === 'RELATED_BUT_DIFFERENT' && bestRelationship !== 'TRANSFERABLE') {
      relatedSkillNames.push(profileSkill);
      bestRelationship = 'RELATED_BUT_DIFFERENT';
    }
  }

  if (bestRelationship) {
    const relatedEvidence = findEvidenceForAnySkill(
      profile,
      relatedSkillNames,
      profileSkills,
    );
    return {
      requirement: rawRequirement,
      category: 'skills',
      importance,
      status: 'partial',
      relationship: bestRelationship,
      score: bestRelationship === 'TRANSFERABLE' ? 55 : 30,
      evidence: relatedEvidence,
    };
  }

  return {
    requirement: rawRequirement,
    category: 'skills',
    importance,
    status: 'missing',
    relationship: 'MISSING',
    score: 0,
    evidence: [],
  };
}

function matchSkillsObject(skills, profile, importance, profileSkills) {
  const results = [];

  for (const [category, list] of Object.entries(asObject(skills))) {
    asArray(list).forEach((skill) => {
      const result = matchSkillRequirement(skill, profile, importance, profileSkills);
      if (result) {
        results.push({ ...result, category: `skills.${category}` });
      }
    });
  }

  return results;
}

function getEducationLevel(text) {
  const normalized = normalizeText(text);
  if (normalized.includes('phd') || normalized.includes('doctor')) return 'doctorate';
  if (normalized.includes('master')) return 'master';
  if (
    normalized.includes('bachelor') ||
    normalized.includes('bsc') ||
    normalized.includes('b.a') ||
    normalized.includes('ba ')
  ) {
    return 'bachelor';
  }
  if (normalized.includes('associate')) return 'associate';
  if (normalized.includes('high school')) return 'highschool';
  return '';
}

function getEducationField(text) {
  const normalized = normalizeText(text);
  const fields = [
    'computer science',
    'software engineering',
    'information systems',
    'information technology',
    'computer engineering',
    'electrical engineering',
    'engineering',
    'business',
    'data science',
    'nursing',
    'accounting',
    'finance',
    'marketing',
    'law',
    'medicine',
    'education',
    'psychology',
    'biology',
    'chemistry',
    'physics',
    'mathematics',
  ];
  return fields.find((field) => normalized.includes(field)) || '';
}

function matchEducationRequirement(requirement, profile) {
  const rawRequirement = String(requirement).trim();
  const requiredLevel = getEducationLevel(rawRequirement);
  const requiredField = getEducationField(rawRequirement);

  const evidence = [];
  let matched = false;
  let partial = false;

  asArray(profile.education).forEach((edu, index) => {
    const itemText = normalizeText(
      `${edu.qualification || ''} ${edu.fieldOfStudy || ''} ${edu.institution || ''}`,
    );
    const itemLevel = getEducationLevel(itemText);
    const itemField = getEducationField(itemText);

    const levelMatch = requiredLevel && itemLevel === requiredLevel;
    const fieldMatch = requiredField && itemField === requiredField;

    if (levelMatch && fieldMatch) matched = true;
    else if (levelMatch || fieldMatch) partial = true;

    if (matched || partial) {
      evidence.push({
        sourceType: 'education',
        sourceId: edu.id || `education-${index}`,
        sourceTitle: `${edu.qualification || ''} ${edu.fieldOfStudy || ''}`.trim(),
        text: `${edu.qualification || ''} ${edu.fieldOfStudy || ''} - ${edu.institution || ''}`.trim(),
      });
    }
  });

  if (matched) {
    return {
      requirement: rawRequirement,
      category: 'education',
      importance: 'required',
      status: 'matched',
      relationship: 'EXACT_MATCH',
      score: 100,
      evidence: evidence.slice(0, 1),
    };
  }

  if (partial) {
    return {
      requirement: rawRequirement,
      category: 'education',
      importance: 'required',
      status: 'partial',
      relationship: 'PARTIAL_MATCH',
      score: 50,
      evidence: evidence.slice(0, 1),
    };
  }

  return {
    requirement: rawRequirement,
    category: 'education',
    importance: 'required',
    status: 'missing',
    relationship: 'MISSING',
    score: 0,
    evidence: [],
  };
}

function buildExperienceText(experienceItem) {
  return [
    experienceItem.description,
    ...asArray(experienceItem.responsibilities),
    ...asArray(experienceItem.achievements),
    ...asArray(experienceItem.technologies),
  ]
    .filter(Boolean)
    .join(' ');
}

function matchExperienceRequirement(requirement, profile) {
  const rawRequirement = String(requirement).trim();
  const requirementTokens = tokenize(rawRequirement).filter(
    (token) => token.length > 2 && !STOP_WORDS.has(token),
  );

  if (requirementTokens.length === 0) {
    return {
      requirement: rawRequirement,
      category: 'experience',
      importance: 'required',
      status: 'unverified',
      relationship: 'UNVERIFIED',
      score: 0,
      evidence: [],
    };
  }

  let bestRatio = 0;
  let bestEvidence = [];

  asArray(profile.experience).forEach((job, index) => {
    const text = buildExperienceText(job);
    const matchedTokens = requirementTokens.filter((token) =>
      containsPhrase(text, token),
    );
    const ratio = matchedTokens.length / requirementTokens.length;

    if (ratio > bestRatio) {
      bestRatio = ratio;
      bestEvidence = [
        {
          sourceType: 'experience',
          sourceId: job.id || `experience-${index}`,
          sourceTitle: `${job.position || 'Role'} at ${job.company || 'Company'}`,
          text: job.description || `${job.position || 'Role'} at ${job.company || 'Company'}`,
        },
      ];
    }
  });

  if (bestRatio >= 0.6) {
    return {
      requirement: rawRequirement,
      category: 'experience',
      importance: 'required',
      status: 'matched',
      relationship: 'STRONG_CONTEXT_MATCH',
      score: Math.round(bestRatio * 100),
      evidence: bestEvidence,
    };
  }

  if (bestRatio >= 0.35) {
    return {
      requirement: rawRequirement,
      category: 'experience',
      importance: 'required',
      status: 'partial',
      relationship: 'PARTIAL_MATCH',
      score: Math.round(bestRatio * 100),
      evidence: bestEvidence,
    };
  }

  return {
    requirement: rawRequirement,
    category: 'experience',
    importance: 'required',
    status: 'missing',
    relationship: 'MISSING',
    score: 0,
    evidence: [],
  };
}

function buildProjectText(project) {
  return [
    project.description,
    ...asArray(project.technologies),
    ...asArray(project.achievements),
  ]
    .filter(Boolean)
    .join(' ');
}

function matchProjectRequirement(requirement, profile) {
  const rawRequirement = String(requirement).trim();
  const requirementTokens = tokenize(rawRequirement).filter(
    (token) => token.length > 2 && !STOP_WORDS.has(token),
  );

  if (requirementTokens.length === 0) {
    return {
      requirement: rawRequirement,
      category: 'projects',
      importance: 'preferred',
      status: 'unverified',
      relationship: 'UNVERIFIED',
      score: 0,
      evidence: [],
    };
  }

  let bestRatio = 0;
  let bestEvidence = [];

  asArray(profile.projects).forEach((project, index) => {
    const text = buildProjectText(project);
    const matchedTokens = requirementTokens.filter((token) =>
      containsPhrase(text, token),
    );
    const ratio = matchedTokens.length / requirementTokens.length;

    if (ratio > bestRatio) {
      bestRatio = ratio;
      bestEvidence = [
        {
          sourceType: 'project',
          sourceId: project.id || `project-${index}`,
          sourceTitle: project.name || 'Project',
          text: project.description || project.name || 'Project',
        },
      ];
    }
  });

  if (bestRatio >= 0.5) {
    return {
      requirement: rawRequirement,
      category: 'projects',
      importance: 'preferred',
      status: 'matched',
      relationship: 'STRONG_CONTEXT_MATCH',
      score: Math.round(bestRatio * 100),
      evidence: bestEvidence,
    };
  }

  return {
    requirement: rawRequirement,
    category: 'projects',
    importance: 'preferred',
    status: 'missing',
    relationship: 'MISSING',
    score: 0,
    evidence: [],
  };
}

function matchKeywordList(keywords, profile) {
  const keywordList = asArray(keywords).map((k) => String(k).trim()).filter(Boolean);
  if (keywordList.length === 0) return { score: 100, matches: [] };

  const sourceTexts = getProfileTextSources(profile).map((source) => source.text);

  const matches = [];

  keywordList.forEach((keyword) => {
    const tokens = tokenize(keyword);
    if (tokens.length === 0) return;

    const exactPresent = sourceTexts.some((text) => containsPhrase(text, keyword));
    const presentTokens = tokens.filter((token) =>
      sourceTexts.some((text) => containsPhrase(text, token)),
    );
    const partialRatio = presentTokens.length / tokens.length;

    let status = 'missing';
    let relationship = 'MISSING';
    let score = 0;

    if (exactPresent) {
      status = 'matched';
      relationship = 'EXACT_MATCH';
      score = 100;
    } else if (partialRatio >= 0.6) {
      status = 'partial';
      relationship = 'PARTIAL_MATCH';
      score = Math.round(partialRatio * 100);
    }

    if (status !== 'missing') {
      matches.push({
        requirement: keyword,
        category: 'keywords',
        importance: 'preferred',
        status,
        relationship,
        score,
        evidence: [],
      });
    }
  });

  return {
    score: Math.round((matches.length / keywordList.length) * 100),
    matches,
  };
}

function calculateSkills(profile, jobAnalysis, profileSkills) {
  const requiredResults = matchSkillsObject(
    jobAnalysis.requiredSkills,
    profile,
    'required',
    profileSkills,
  );
  const preferredResults = matchSkillsObject(
    jobAnalysis.preferredSkills,
    profile,
    'preferred',
    profileSkills,
  );

  const requiredTotal = requiredResults.length;
  const preferredTotal = preferredResults.length;

  const requiredMatched = requiredResults.filter((r) => r.status === 'matched').length;
  const preferredMatched = preferredResults.filter((r) => r.status === 'matched').length;

  const requiredScore = requiredTotal > 0 ? (requiredMatched / requiredTotal) * 100 : 100;
  const preferredScore = preferredTotal > 0 ? (preferredMatched / preferredTotal) * 100 : 100;

  let score;
  if (requiredTotal > 0 && preferredTotal > 0) {
    score = requiredScore * 0.8 + preferredScore * 0.2;
  } else if (requiredTotal > 0) {
    score = requiredScore;
  } else if (preferredTotal > 0) {
    score = preferredScore;
  } else {
    score = 100;
  }

  return {
    score: Math.round(score),
    results: [...requiredResults, ...preferredResults],
  };
}

function calculateEducation(profile, jobAnalysis) {
  const requirements = asArray(jobAnalysis.educationRequirements)
    .map((item) => String(item).trim())
    .filter(Boolean);

  if (requirements.length === 0) return { score: 100, results: [] };

  const results = requirements.map((requirement) =>
    matchEducationRequirement(requirement, profile),
  );

  const matchedCount = results.filter((r) => r.status === 'matched').length;
  const partialCount = results.filter((r) => r.status === 'partial').length;
  const score = ((matchedCount + partialCount * 0.5) / requirements.length) * 100;

  return { score: Math.round(score), results };
}

function calculateExperience(profile, jobAnalysis) {
  const requirements = asArray(jobAnalysis.experienceRequirements)
    .map((item) => String(item).trim())
    .filter(Boolean);

  if (requirements.length === 0) return { score: 100, results: [] };

  const results = requirements.map((requirement) =>
    matchExperienceRequirement(requirement, profile),
  );

  const totalScore = results.reduce((sum, r) => sum + r.score, 0);
  return { score: Math.round(totalScore / requirements.length), results };
}

function calculateProjects(profile, jobAnalysis) {
  const projectRequirements = [
    ...asArray(jobAnalysis.requiredSkills?.technical),
    ...asArray(jobAnalysis.preferredSkills?.technical),
    ...asArray(jobAnalysis.experienceRequirements),
    ...asArray(jobAnalysis.keywords),
  ]
    .map((item) => String(item).trim())
    .filter(Boolean);

  const uniqueRequirements = [...new Set(projectRequirements)];
  if (uniqueRequirements.length === 0) return { score: 100, results: [] };

  const results = uniqueRequirements.map((requirement) =>
    matchProjectRequirement(requirement, profile),
  );

  const totalScore = results.reduce((sum, r) => sum + r.score, 0);
  return {
    score: Math.round((totalScore / (uniqueRequirements.length * 100)) * 100),
    results,
  };
}

function validateProfile(profile) {
  if (!profile || typeof profile !== 'object') {
    throw new Error('Career Profile is invalid or missing.');
  }
}

function validateJobAnalysis(jobAnalysis) {
  if (!jobAnalysis || typeof jobAnalysis !== 'object') {
    throw new Error('Job Analysis is invalid or missing.');
  }
  if (!jobAnalysis.requiredSkills || !jobAnalysis.preferredSkills) {
    throw new Error('Job Analysis is missing required skills data.');
  }
}

export function computeMatch(profile, jobAnalysis) {
  validateProfile(profile);
  validateJobAnalysis(jobAnalysis);

  const profileSkills = getCanonicalSkillSet(profile);

  const skills = calculateSkills(profile, jobAnalysis, profileSkills);
  const education = calculateEducation(profile, jobAnalysis);
  const experience = calculateExperience(profile, jobAnalysis);
  const projects = calculateProjects(profile, jobAnalysis);
  const keywords = matchKeywordList(jobAnalysis.keywords, profile);

  const overallScore = Math.round(
    skills.score * WEIGHTS.skills +
      education.score * WEIGHTS.education +
      experience.score * WEIGHTS.experience +
      projects.score * WEIGHTS.projects +
      keywords.score * WEIGHTS.keywords,
  );

  const requirements = [
    ...skills.results,
    ...education.results,
    ...experience.results,
    ...projects.results,
    ...keywords.matches,
  ];

  const strongMatches = requirements
    .filter((item) => item.status === 'matched' && item.score >= 80)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  const missingRequirements = requirements.filter(
    (item) => item.status === 'missing' && item.importance === 'required',
  );

  const partialMatches = requirements.filter(
    (item) =>
      item.status === 'partial' &&
      item.relationship !== 'RELATED_BUT_DIFFERENT' &&
      item.relationship !== 'TRANSFERABLE',
  );

  const relatedOrTransferable = requirements.filter(
    (item) =>
      item.relationship === 'RELATED_BUT_DIFFERENT' ||
      item.relationship === 'TRANSFERABLE',
  );

  const unverifiedRequirements = requirements.filter(
    (item) => item.status === 'unverified',
  );

  return {
    schemaVersion: 1,
    overallScore,
    breakdown: {
      skills: skills.score,
      education: education.score,
      experience: experience.score,
      projects: projects.score,
      keywords: keywords.score,
    },
    strongMatches,
    requirements,
    missingRequirements,
    partialMatches,
    relatedOrTransferable,
    unverifiedRequirements,
  };
}

export const MATCH_RELATIONSHIPS = Object.freeze({
  EXACT_MATCH: 'EXACT_MATCH',
  ALIAS_MATCH: 'ALIAS_MATCH',
  STRONG_CONTEXT_MATCH: 'STRONG_CONTEXT_MATCH',
  PARTIAL_MATCH: 'PARTIAL_MATCH',
  TRANSFERABLE: 'TRANSFERABLE',
  RELATED_BUT_DIFFERENT: 'RELATED_BUT_DIFFERENT',
  MISSING: 'MISSING',
  UNVERIFIED: 'UNVERIFIED',
});