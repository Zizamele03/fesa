import {
  createEmptyAchievement,
  createEmptyCertification,
  createEmptyEducation,
  createEmptyExperience,
  createEmptyProfile,
  createEmptyProject,
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
      current: typeof source.current === 'boolean' ? source.current : empty.current,
      description: asString(source.description, empty.description),
      responsibilities: asArray(source.responsibilities).map((entry) =>
        asString(entry),
      ),
      achievements: asArray(source.achievements).map((entry) => asString(entry)),
      technologies: asArray(source.technologies).map((entry) => asString(entry)),
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
      technologies: asArray(source.technologies).map((entry) => asString(entry)),
      url: asString(source.url, empty.url),
      role: asString(source.role, empty.role),
      achievements: asArray(source.achievements).map((entry) => asString(entry)),
    };
  });
}

function normalizeSkills(skills) {
  const source = asObject(skills);
  const normalize = (value) => asArray(value).map((entry) => asString(entry));

  return {
    technical: normalize(source.technical),
    soft: normalize(source.soft),
    tools: normalize(source.tools),
    languages: normalize(source.languages),
    frameworks: normalize(source.frameworks),
    databases: normalize(source.databases),
    cloud: normalize(source.cloud),
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

export function normalizeImportedProfile(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('Imported data must be a JSON object.');
  }

  const candidate =
    input.profile && typeof input.profile === 'object' && !Array.isArray(input.profile)
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
  };
}