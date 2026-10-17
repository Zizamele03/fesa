import {
  createEmptyAchievement,
  createEmptyCertification,
  createEmptyEducation,
  createEmptyExperience,
  createEmptyProfile,
  createEmptyProject,
  createEmptyReference,
} from '../data/careerProfileSchema.js';

function asString(value, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function asObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

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
  const source = asObject(personal);
  return {
    fullName: asString(source.fullName),
    email: asString(source.email),
    phone: asString(source.phone),
    location: asString(source.location),
    linkedin: asString(source.linkedin),
    github: asString(source.github),
    portfolio: asString(source.portfolio),
  };
}

function normalizeEducation(education) {
  return asArray(education).map((item) => {
    const source = asObject(item);
    const empty = createEmptyEducation();
    return {
      institution: asString(source.institution, empty.institution),
      qualification: asString(source.qualification, empty.qualification),
      fieldOfStudy: asString(source.fieldOfStudy, empty.fieldOfStudy),
      startDate: asString(source.startDate, empty.startDate),
      endDate: asString(source.endDate, empty.endDate),
      description: asString(source.description, empty.description),
    };
  });
}

function normalizeExperience(experience) {
  return asArray(experience).map((item) => {
    const source = asObject(item);
    const empty = createEmptyExperience();
    return {
      company: asString(source.company, empty.company),
      position: asString(source.position, empty.position),
      location: asString(source.location, empty.location),
      startDate: asString(source.startDate, empty.startDate),
      endDate: asString(source.endDate, empty.endDate),
      current:
        typeof source.current === 'boolean' ? source.current : empty.current,
      description: asString(source.description, empty.description),
      responsibilities: dedupeStrings(asArray(source.responsibilities)),
      achievements: dedupeStrings(asArray(source.achievements)),
      technologies: dedupeStrings(asArray(source.technologies)),
    };
  });
}

function normalizeProjects(projects) {
  return asArray(projects).map((item) => {
    const source = asObject(item);
    const empty = createEmptyProject();
    return {
      name: asString(source.name, empty.name),
      description: asString(source.description, empty.description),
      technologies: dedupeStrings(asArray(source.technologies)),
      url: asString(source.url, empty.url),
      role: asString(source.role, empty.role),
      achievements: dedupeStrings(asArray(source.achievements)),
    };
  });
}

function normalizeSkills(skills) {
  const source = asObject(skills);
  const norm = (value) => dedupeStrings(asArray(value));
  return {
    technical: norm(source.technical),
    soft: norm(source.soft),
    tools: norm(source.tools),
    languages: norm(source.languages),
    queryLanguages: norm(source.queryLanguages),
    humanLanguages: norm(source.humanLanguages),
    frameworks: norm(source.frameworks),
    databases: norm(source.databases),
    cloud: norm(source.cloud),
    uncertain: norm(source.uncertain),
  };
}

function normalizeCertifications(certifications) {
  return asArray(certifications).map((item) => {
    const source = asObject(item);
    const empty = createEmptyCertification();
    return {
      name: asString(source.name, empty.name),
      issuer: asString(source.issuer, empty.issuer),
      date: asString(source.date, empty.date),
      credentialId: asString(source.credentialId, empty.credentialId),
      url: asString(source.url, empty.url),
    };
  });
}

function normalizeAchievements(achievements) {
  return asArray(achievements).map((item) => {
    const source = asObject(item);
    const empty = createEmptyAchievement();
    return {
      title: asString(source.title, empty.title),
      description: asString(source.description, empty.description),
      date: asString(source.date, empty.date),
    };
  });
}

function normalizeReferences(references) {
  return asArray(references).map((item) => {
    const source = asObject(item);
    const empty = createEmptyReference();
    return {
      name: asString(source.name, empty.name),
      title: asString(source.title, empty.title),
      organization: asString(source.organization, empty.organization),
      relationship: asString(source.relationship, empty.relationship),
      email: asString(source.email, empty.email),
      phone: asString(source.phone, empty.phone),
      notes: asString(source.notes, empty.notes),
    };
  });
}

export function normalizeImportedProfile(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('Imported data must be a JSON object.');
  }

  const candidate =
    input.profile &&
    typeof input.profile === 'object' &&
    !Array.isArray(input.profile)
      ? input.profile
      : input;

  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) {
    throw new Error('Imported Career Profile data is invalid.');
  }

  const schemaVersion =
    candidate.schemaVersion !== undefined
      ? candidate.schemaVersion
      : input.schemaVersion;

  if (schemaVersion !== 1) {
    throw new Error('Unsupported Career Profile schema version.');
  }

  const empty = createEmptyProfile();

  return {
    schemaVersion: 1,
    personal: normalizePersonal(candidate.personal || empty.personal),
    professionalSummary: asString(
      candidate.professionalSummary,
      empty.professionalSummary,
    ),
    education: normalizeEducation(candidate.education || empty.education),
    experience: normalizeExperience(candidate.experience || empty.experience),
    projects: normalizeProjects(candidate.projects || empty.projects),
    skills: normalizeSkills(candidate.skills || empty.skills),
    certifications: normalizeCertifications(
      candidate.certifications || empty.certifications,
    ),
    achievements: normalizeAchievements(
      candidate.achievements || empty.achievements,
    ),
    references: normalizeReferences(candidate.references || empty.references),
  };
}