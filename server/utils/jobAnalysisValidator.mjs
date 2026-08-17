export const MAX_COMPANY_LENGTH = 200;
export const MAX_TITLE_LENGTH = 200;
export const MAX_JOB_DESCRIPTION_LENGTH = 50000;

function asString(value, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function asObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function normalizeSkillsObject(skills) {
  const s = asObject(skills);
  const normalize = (value) => asArray(value).map((item) => asString(item));

  return {
    technical: normalize(s.technical),
    soft: normalize(s.soft),
    tools: normalize(s.tools),
    frameworks: normalize(s.frameworks),
    languages: normalize(s.languages),
    databases: normalize(s.databases),
    cloudTechnologies: normalize(s.cloudTechnologies),
  };
}

export function validateJobAnalysisRequest({ company, title, jobDescription }) {
  if (typeof company !== 'string') {
    return {
      valid: false,
      error: 'Company name must be a string.',
    };
  }

  if (typeof title !== 'string') {
    return {
      valid: false,
      error: 'Job title must be a string.',
    };
  }

  if (typeof jobDescription !== 'string') {
    return {
      valid: false,
      error: 'Job description must be a string.',
    };
  }

  const trimmedCompany = company.trim();
  const trimmedTitle = title.trim();
  const trimmedDescription = jobDescription.trim();

  if (!trimmedCompany) {
    return {
      valid: false,
      error: 'Company name is required.',
    };
  }

  if (!trimmedTitle) {
    return {
      valid: false,
      error: 'Job title is required.',
    };
  }

  if (!trimmedDescription) {
    return {
      valid: false,
      error: 'Job description is required.',
    };
  }

  if (trimmedCompany.length > MAX_COMPANY_LENGTH) {
    return {
      valid: false,
      error: `Company name is too long. Maximum ${MAX_COMPANY_LENGTH} characters allowed.`,
    };
  }

  if (trimmedTitle.length > MAX_TITLE_LENGTH) {
    return {
      valid: false,
      error: `Job title is too long. Maximum ${MAX_TITLE_LENGTH} characters allowed.`,
    };
  }

  if (trimmedDescription.length > MAX_JOB_DESCRIPTION_LENGTH) {
    return {
      valid: false,
      error: `Job description is too long. Maximum ${MAX_JOB_DESCRIPTION_LENGTH} characters allowed.`,
    };
  }

  return {
    valid: true,
    values: {
      company: trimmedCompany,
      title: trimmedTitle,
      jobDescription: trimmedDescription,
    },
  };
}

export function normalizeJobAnalysis(rawAnalysis) {
  if (
    !rawAnalysis ||
    typeof rawAnalysis !== 'object' ||
    Array.isArray(rawAnalysis)
  ) {
    throw new Error('Invalid job analysis object returned from AI.');
  }

  const analysis = asObject(rawAnalysis);

  if (
    analysis.schemaVersion !== undefined &&
    typeof analysis.schemaVersion !== 'number'
  ) {
    throw new Error('Invalid schemaVersion in AI job analysis.');
  }

  const job = asObject(analysis.job);

  const normalized = {
    schemaVersion: analysis.schemaVersion || 1,
    job: {
      company: asString(job.company),
      title: asString(job.title),
      location: asString(job.location),
      employmentType: asString(job.employmentType),
    },
    summary: asString(analysis.summary),
    educationRequirements: asArray(analysis.educationRequirements).map((item) =>
      asString(item),
    ),
    experienceRequirements: asArray(analysis.experienceRequirements).map((item) =>
      asString(item),
    ),
    requiredQualifications: asArray(analysis.requiredQualifications).map((item) =>
      asString(item),
    ),
    preferredQualifications: asArray(analysis.preferredQualifications).map((item) =>
      asString(item),
    ),
    requiredSkills: normalizeSkillsObject(analysis.requiredSkills),
    preferredSkills: normalizeSkillsObject(analysis.preferredSkills),
    responsibilities: asArray(analysis.responsibilities).map((item) =>
      asString(item),
    ),
    certifications: asArray(analysis.certifications).map((item) => asString(item)),
    keywords: asArray(analysis.keywords).map((item) => asString(item)),
  };

  const hasContent =
    normalized.job.title ||
    normalized.job.company ||
    normalized.summary ||
    normalized.educationRequirements.length > 0 ||
    normalized.experienceRequirements.length > 0 ||
    normalized.requiredQualifications.length > 0 ||
    normalized.preferredQualifications.length > 0 ||
    normalized.requiredSkills.technical.length > 0 ||
    normalized.requiredSkills.soft.length > 0 ||
    normalized.preferredSkills.technical.length > 0 ||
    normalized.preferredSkills.soft.length > 0 ||
    normalized.responsibilities.length > 0 ||
    normalized.certifications.length > 0 ||
    normalized.keywords.length > 0;

  if (!hasContent) {
    throw new Error('AI returned an empty job analysis with no meaningful data.');
  }

  return normalized;
}