function asString(value, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function asObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

const ALLOWED_TONES = new Set(['professional', 'confident', 'conversational']);
const ALLOWED_LENGTHS = new Set(['short', 'standard', 'detailed']);

export function validateCoverLetterRequest(body) {
  const { profile, jobAnalysis, matchAnalysis, company, jobTitle, tone, length } =
    body || {};

  if (!profile || typeof profile !== 'object') {
    return { valid: false, error: 'Career Profile is required.' };
  }

  if (!jobAnalysis || typeof jobAnalysis !== 'object') {
    return { valid: false, error: 'Job Analysis is required.' };
  }

  if (typeof company !== 'string' || !company.trim()) {
    return { valid: false, error: 'Company name is required.' };
  }

  if (typeof jobTitle !== 'string' || !jobTitle.trim()) {
    return { valid: false, error: 'Job title is required.' };
  }

  const normalizedTone = ALLOWED_TONES.has(tone) ? tone : 'professional';
  const normalizedLength = ALLOWED_LENGTHS.has(length) ? length : 'standard';

  return {
    valid: true,
    values: {
      profile,
      jobAnalysis,
      matchAnalysis: matchAnalysis || null,
      company: company.trim(),
      jobTitle: jobTitle.trim(),
      tone: normalizedTone,
      length: normalizedLength,
    },
  };
}

export function normalizeGeneratedCoverLetter(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error('Invalid cover letter object returned from AI.');
  }

  const obj = asObject(raw);

  const normalized = {
    schemaVersion: 1,
    greeting: asString(obj.greeting),
    opening: asString(obj.opening),
    body: asArray(obj.body).map((p) => asString(p)).filter(Boolean),
    closing: asString(obj.closing),
    signoff: asString(obj.signoff),
  };

  const hasContent =
    normalized.greeting ||
    normalized.opening ||
    normalized.body.length > 0 ||
    normalized.closing;

  if (!hasContent) {
    throw new Error('AI returned an empty cover letter.');
  }

  return normalized;
}