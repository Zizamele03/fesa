const WEIGHTS = {
  skills: 0.35,
  education: 0.15,
  experience: 0.20,
  projects: 0.15,
  keywords: 0.10,
};

function normalizeText(value = '') {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9+#. ]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(value = '') {
  return normalizeText(value)
    .split(' ')
    .filter((token) => token.length > 1);
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function asObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function collectSkillEntries(skills) {
  const entries = [];
  const source = asObject(skills);

  for (const [category, list] of Object.entries(source)) {
    asArray(list).forEach((skill, index) => {
      if (String(skill).trim()) {
        entries.push({
          value: String(skill).trim(),
          sourceType: 'skill',
          sourceId: `skill-${category}-${index}`,
          sourceTitle: `${category[0].toUpperCase()}${category.slice(1)} Skill`,
        });
      }
    });
  }

  return entries;
}

function collectProjectTechnologyEntries(projects) {
  const entries = [];

  asArray(projects).forEach((project, projectIndex) => {
    const technologies = asArray(project.technologies);
    technologies.forEach((tech, techIndex) => {
      if (String(tech).trim()) {
        entries.push({
          value: String(tech).trim(),
          sourceType: 'project',
          sourceId: `project-${project.id || projectIndex}-tech-${techIndex}`,
          sourceTitle: project.name || 'Project',
        });
      }
    });
  });

  return entries;
}

function collectExperienceTechnologyEntries(experience) {
  const entries = [];

  asArray(experience).forEach((job, jobIndex) => {
    const technologies = asArray(job.technologies);
    technologies.forEach((tech, techIndex) => {
      if (String(tech).trim()) {
        entries.push({
          value: String(tech).trim(),
          sourceType: 'experience',
          sourceId: `experience-${job.id || jobIndex}-tech-${techIndex}`,
          sourceTitle: `${job.position || 'Role'} at ${job.company || 'Company'}`,
        });
      }
    });
  });

  return entries;
}

function findEvidenceForSkill(skill, profile) {
  const target = normalizeText(skill);
  const evidence = [];

  collectSkillEntries(profile.skills).forEach((entry) => {
    if (normalizeText(entry.value) === target) {
      evidence.push({
        sourceType: entry.sourceType,
        sourceId: entry.sourceId,
        sourceTitle: entry.sourceTitle,
        text: entry.value,
      });
    }
  });

  collectProjectTechnologyEntries(profile.projects).forEach((entry) => {
    if (normalizeText(entry.value) === target) {
      evidence.push({
        sourceType: entry.sourceType,
        sourceId: entry.sourceId,
        sourceTitle: entry.sourceTitle,
        text: entry.value,
      });
    }
  });

  collectExperienceTechnologyEntries(profile.experience).forEach((entry) => {
    if (normalizeText(entry.value) === target) {
      evidence.push({
        sourceType: entry.sourceType,
        sourceId: entry.sourceId,
        sourceTitle: entry.sourceTitle,
        text: entry.value,
      });
    }
  });

  return evidence.slice(0, 3);
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
  ];

  return fields.find((field) => normalized.includes(field)) || '';
}

function matchEducationRequirement(requirement, education) {
  const normalizedRequirement = normalizeText(requirement);
  const requiredLevel = getEducationLevel(normalizedRequirement);
  const requiredField = getEducationField(normalizedRequirement);

  const evidence = [];
  let matched = false;
  let partial = false;

  asArray(education).forEach((edu, index) => {
    const itemText = normalizeText(
      `${edu.qualification || ''} ${edu.fieldOfStudy || ''} ${edu.institution || ''}`,
    );
    const itemLevel = getEducationLevel(itemText);
    const itemField = getEducationField(itemText);

    const levelMatch = requiredLevel && itemLevel === requiredLevel;
    const fieldMatch = requiredField && itemField === requiredField;

    if (levelMatch && fieldMatch) {
      matched = true;
    } else if (levelMatch || fieldMatch) {
      partial = true;
    }

    if (matched || partial) {
      evidence.push({
        sourceType: 'education',
        sourceId: `education-${edu.id || index}`,
        sourceTitle: `${edu.qualification || ''} ${edu.fieldOfStudy || ''}`.trim(),
        text: `${edu.qualification || ''} ${edu.fieldOfStudy || ''} - ${edu.institution || ''}`.trim(),
      });
    }
  });

  if (matched) {
    return { status: 'matched', score: 100, evidence: evidence.slice(0, 1) };
  }

  if (partial) {
    return { status: 'partial', score: 50, evidence: evidence.slice(0, 1) };
  }

  return { status: 'missing', score: 0, evidence: [] };
}

function buildExperienceText(experienceItem) {
  return normalizeText(
    [
      experienceItem.description,
      ...(asArray(experienceItem.responsibilities)),
      ...(asArray(experienceItem.achievements)),
      ...(asArray(experienceItem.technologies)),
    ].join(' '),
  );
}

function buildProjectText(project) {
  return normalizeText(
    [
      project.description,
      ...(asArray(project.technologies)),
      ...(asArray(project.achievements)),
    ].join(' '),
  );
}

function matchExperienceRequirement(requirement, experience) {
  const tokens = tokenize(requirement).filter((token) => token.length > 2);
  if (tokens.length === 0) {
    return { status: 'unverified', score: 0, evidence: [] };
  }

  const evidence = [];
  let bestRatio = 0;

  asArray(experience).forEach((job, index) => {
    const text = buildExperienceText(job);
    const matchedTokens = tokens.filter((token) => text.includes(token));
    const ratio = matchedTokens.length / tokens.length;

    if (ratio > bestRatio) {
      bestRatio = ratio;
      evidence.length = 0;
      evidence.push({
        sourceType: 'experience',
        sourceId: `experience-${job.id || index}`,
        sourceTitle: `${job.position || 'Role'} at ${job.company || 'Company'}`,
        text: job.description || `${job.position || 'Role'} at ${job.company || 'Company'}`,
      });
    }
  });

  if (bestRatio >= 0.6) {
    return { status: 'matched', score: Math.round(bestRatio * 100), evidence };
  }

  if (bestRatio >= 0.35) {
    return { status: 'partial', score: Math.round(bestRatio * 100), evidence };
  }

  return { status: 'missing', score: 0, evidence: [] };
}

function matchProjectRequirement(requirement, projects) {
  const tokens = tokenize(requirement).filter((token) => token.length > 2);
  if (tokens.length === 0) {
    return { status: 'unverified', score: 0, evidence: [] };
  }

  const evidence = [];
  let bestRatio = 0;

  asArray(projects).forEach((project, index) => {
    const text = buildProjectText(project);
    const matchedTokens = tokens.filter((token) => text.includes(token));
    const ratio = matchedTokens.length / tokens.length;

    if (ratio > bestRatio) {
      bestRatio = ratio;
      evidence.length = 0;
      evidence.push({
        sourceType: 'project',
        sourceId: `project-${project.id || index}`,
        sourceTitle: project.name || 'Project',
        text: project.description || project.name || 'Project',
      });
    }
  });

  if (bestRatio >= 0.5) {
    return { status: 'matched', score: Math.round(bestRatio * 100), evidence };
  }

  return { status: 'missing', score: 0, evidence: [] };
}

function matchSkills(skills, profile, importance) {
  const results = [];

  for (const [category, list] of Object.entries(asObject(skills))) {
    asArray(list).forEach((skill) => {
      const normalizedSkill = String(skill).trim();
      if (!normalizedSkill) return;

      const evidence = findEvidenceForSkill(normalizedSkill, profile);
      const status = evidence.length > 0 ? 'matched' : 'missing';
      const score = status === 'matched' ? 100 : 0;

      results.push({
        requirement: normalizedSkill,
        category: `skills.${category}`,
        importance,
        status,
        score,
        evidence,
      });
    });
  }

  return results;
}

function collectAllProfileText(profile) {
  const skillText = Object.values(asObject(profile.skills))
    .flatMap((list) => asArray(list))
    .join(' ');

  const experienceText = asArray(profile.experience)
    .map((job) => buildExperienceText(job))
    .join(' ');

  const projectText = asArray(profile.projects)
    .map((project) => buildProjectText(project))
    .join(' ');

  const educationText = asArray(profile.education)
    .map((edu) =>
      normalizeText(
        `${edu.qualification || ''} ${edu.fieldOfStudy || ''} ${edu.institution || ''}`,
      ),
    )
    .join(' ');

  return normalizeText(
    `${profile.professionalSummary || ''} ${skillText} ${experienceText} ${projectText} ${educationText}`,
  );
}

function matchKeywords(keywords, profile) {
  const profileText = collectAllProfileText(profile);
  const keywordList = asArray(keywords).map((k) => String(k).trim()).filter(Boolean);

  if (keywordList.length === 0) return { score: 100, matched: [] };

  const matched = [];
  keywordList.forEach((keyword) => {
    if (profileText.includes(normalizeText(keyword))) {
      matched.push(keyword);
    }
  });

  return {
    score: Math.round((matched.length / keywordList.length) * 100),
    matched,
  };
}

function calculateSkillsScore(profile, jobAnalysis) {
  const requiredResults = matchSkills(jobAnalysis.requiredSkills, profile, 'required');
  const preferredResults = matchSkills(jobAnalysis.preferredSkills, profile, 'preferred');

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

function calculateEducationScore(profile, jobAnalysis) {
  const requirements = asArray(jobAnalysis.educationRequirements).map((r) =>
    String(r).trim(),
  ).filter(Boolean);

  if (requirements.length === 0) {
    return { score: 100, results: [] };
  }

  const results = requirements.map((requirement) => {
    const match = matchEducationRequirement(requirement, profile.education);
    return {
      requirement,
      category: 'education',
      importance: 'required',
      status: match.status,
      score: match.score,
      evidence: match.evidence,
    };
  });

  const matchedCount = results.filter((r) => r.status === 'matched').length;
  const partialCount = results.filter((r) => r.status === 'partial').length;
  const score =
    ((matchedCount + partialCount * 0.5) / requirements.length) * 100;

  return { score: Math.round(score), results };
}

function calculateExperienceScore(profile, jobAnalysis) {
  const requirements = asArray(jobAnalysis.experienceRequirements).map((r) =>
    String(r).trim(),
  ).filter(Boolean);

  if (requirements.length === 0) {
    return { score: 100, results: [] };
  }

  const results = requirements.map((requirement) => {
    const match = matchExperienceRequirement(requirement, profile.experience);
    return {
      requirement,
      category: 'experience',
      importance: 'required',
      status: match.status,
      score: match.score,
      evidence: match.evidence,
    };
  });

  const totalScore = results.reduce((sum, r) => sum + r.score, 0);
  return {
    score: Math.round(totalScore / requirements.length),
    results,
  };
}

function calculateProjectScore(profile, jobAnalysis) {
  const jobRequirements = [
    ...asArray(jobAnalysis.requiredSkills?.technical),
    ...asArray(jobAnalysis.preferredSkills?.technical),
    ...asArray(jobAnalysis.experienceRequirements),
    ...asArray(jobAnalysis.keywords),
  ]
    .map((item) => String(item).trim())
    .filter(Boolean);

  if (jobRequirements.length === 0) {
    return { score: 100, results: [] };
  }

  const uniqueRequirements = [...new Set(jobRequirements)];
  const results = uniqueRequirements.map((requirement) => {
    const match = matchProjectRequirement(requirement, profile.projects);
    return {
      requirement,
      category: 'projects',
      importance: 'preferred',
      status: match.status,
      score: match.score,
      evidence: match.evidence,
    };
  });

  const matchedScore = results.filter((r) => r.status === 'matched').reduce(
    (sum, r) => sum + r.score,
    0,
  );
  const totalPossible = uniqueRequirements.length * 100;

  return {
    score: Math.round((matchedScore / totalPossible) * 100),
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

  const skills = calculateSkillsScore(profile, jobAnalysis);
  const education = calculateEducationScore(profile, jobAnalysis);
  const experience = calculateExperienceScore(profile, jobAnalysis);
  const projects = calculateProjectScore(profile, jobAnalysis);
  const keywords = matchKeywords(jobAnalysis.keywords, profile);

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
  ];

  const strongMatches = requirements
    .filter((item) => item.status === 'matched' && item.score >= 80)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  const missingRequirements = requirements.filter(
    (item) => item.status === 'missing' && item.importance === 'required',
  );

  const partialMatches = requirements.filter(
    (item) => item.status === 'partial',
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
    unverifiedRequirements,
  };
}