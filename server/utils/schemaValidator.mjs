export const MAX_RESUME_TEXT_LENGTH = 50000;

export function validateResumeText(rawText) {
  if (typeof rawText !== 'string') {
    return { valid: false, error: 'Resume text must be a string.' };
  }

  const text = rawText.trim();

  if (!text) {
    return {
      valid: false,
      error: 'Resume text is empty. Please extract text from your resume first.',
    };
  }

  if (text.length > MAX_RESUME_TEXT_LENGTH) {
    return {
      valid: false,
      error: `Resume text is too long. Maximum ${MAX_RESUME_TEXT_LENGTH} characters allowed.`,
    };
  }

  return { valid: true, text };
}

function asString(value, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function asObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

/**
 * Deduplicates an array of strings case-insensitively, preserving the
 * original casing of the first occurrence.
 */
function dedupeStrings(list) {
  const seen = new Set();
  const out = [];

  for (const item of list) {
    const str = asString(item).trim();
    if (!str) continue;
    const key = str.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(str);
  }

  return out;
}

function normalizePersonal(personal) {
  const p = asObject(personal);
  return {
    fullName: asString(p.fullName),
    email: asString(p.email),
    phone: asString(p.phone),
    location: asString(p.location),
    linkedin: asString(p.linkedin),
    github: asString(p.github),
    portfolio: asString(p.portfolio),
  };
}

function normalizeEducation(education) {
  return asArray(education).map((item) => {
    const e = asObject(item);
    return {
      institution: asString(e.institution),
      qualification: asString(e.qualification),
      fieldOfStudy: asString(e.fieldOfStudy),
      startDate: asString(e.startDate),
      endDate: asString(e.endDate),
      description: asString(e.description),
    };
  });
}

function normalizeExperience(experience) {
  return asArray(experience).map((item) => {
    const e = asObject(item);
    return {
      company: asString(e.company),
      position: asString(e.position),
      location: asString(e.location),
      startDate: asString(e.startDate),
      endDate: asString(e.endDate),
      current: typeof e.current === 'boolean' ? e.current : false,
      description: asString(e.description),
      responsibilities: dedupeStrings(asArray(e.responsibilities)),
      achievements: dedupeStrings(asArray(e.achievements)),
      technologies: dedupeStrings(asArray(e.technologies)),
    };
  });
}

function normalizeProjects(projects) {
  return asArray(projects).map((item) => {
    const p = asObject(item);
    return {
      name: asString(p.name),
      description: asString(p.description),
      technologies: dedupeStrings(asArray(p.technologies)),
      url: asString(p.url),
      role: asString(p.role),
      achievements: dedupeStrings(asArray(p.achievements)),
    };
  });
}

function normalizeSkills(skills) {
  const s = asObject(skills);
  const norm = (value) => dedupeStrings(asArray(value));

  return {
    technical: norm(s.technical),
    soft: norm(s.soft),
    tools: norm(s.tools),
    languages: norm(s.languages),
    queryLanguages: norm(s.queryLanguages),
    humanLanguages: norm(s.humanLanguages),
    frameworks: norm(s.frameworks),
    databases: norm(s.databases),
    cloud: norm(s.cloud),
    uncertain: norm(s.uncertain),
  };
}

function normalizeCertifications(certifications) {
  return asArray(certifications).map((item) => {
    const c = asObject(item);
    return {
      name: asString(c.name),
      issuer: asString(c.issuer),
      date: asString(c.date),
      credentialId: asString(c.credentialId),
      url: asString(c.url),
    };
  });
}

function normalizeAchievements(achievements) {
  return asArray(achievements).map((item) => {
    const a = asObject(item);
    return {
      title: asString(a.title),
      description: asString(a.description),
      date: asString(a.date),
    };
  });
}

export function normalizeProfile(rawProfile) {
  if (
    !rawProfile ||
    typeof rawProfile !== 'object' ||
    Array.isArray(rawProfile)
  ) {
    throw new Error('Invalid profile object returned from AI.');
  }

  const profile = asObject(rawProfile);

  if (
    profile.schemaVersion !== undefined &&
    typeof profile.schemaVersion !== 'number'
  ) {
    throw new Error('Invalid schemaVersion in AI profile.');
  }

  const normalized = {
    schemaVersion: profile.schemaVersion || 1,
    personal: normalizePersonal(profile.personal),
    professionalSummary: asString(profile.professionalSummary),
    education: normalizeEducation(profile.education),
    experience: normalizeExperience(profile.experience),
    projects: normalizeProjects(profile.projects),
    skills: normalizeSkills(profile.skills),
    certifications: normalizeCertifications(profile.certifications),
    achievements: normalizeAchievements(profile.achievements),
  };

  const hasContent =
    normalized.personal.fullName ||
    normalized.professionalSummary ||
    normalized.education.length > 0 ||
    normalized.experience.length > 0 ||
    normalized.projects.length > 0 ||
    Object.values(normalized.skills).some((list) => list.length > 0) ||
    normalized.certifications.length > 0 ||
    normalized.achievements.length > 0;

  if (!hasContent) {
    throw new Error('AI returned an empty profile with no meaningful data.');
  }

  return normalized;
}