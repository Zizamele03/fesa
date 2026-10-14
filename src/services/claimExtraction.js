import { getCanonicalSkillSet, containsPhrase } from './truthLock.js';

const GENERAL_STOPWORDS = new Set([
  'the','and','for','with','using','from','into','that','this','which',
  'our','their','they','was','were','has','have','had','did','done',
  'doing','will','would','should','could','can','may','might','must',
  'about','across','within','during','after','before','between','under',
  'over','through','also','plus','or','but','not','all','any','some',
  'more','most','such','only','just','very','well','into','onto',
  'upon','than','then','when','where','why','how','what','who','whom',
  'these','those','them','its','it','is','are','am','be','been','being',
  'do','does','to','of','in','on','at','by','so','if','as','an','a',
  'i','me','my','we','us','you','your','new','current','various',
  'several','multiple','other','another','same','each','every',
]);

export function collectKnownEntities(profile) {
  const entities = new Set();

  const add = (value) => {
    const str = String(value || '').trim();
    if (str.length >= 3 && !GENERAL_STOPWORDS.has(str.toLowerCase())) {
      entities.add(str.toLowerCase());
    }
  };

  const skills = getCanonicalSkillSet(profile);
  for (const skill of skills) add(skill);

  for (const list of Object.values(profile.skills || {})) {
    for (const skill of Array.isArray(list) ? list : []) add(skill);
  }

  for (const job of profile.experience || []) {
    add(job.company);
    add(job.position);
    for (const tech of job.technologies || []) add(tech);
  }

  for (const project of profile.projects || []) {
    add(project.name);
    for (const tech of project.technologies || []) add(tech);
  }

  for (const edu of profile.education || []) {
    add(edu.institution);
  }

  for (const cert of profile.certifications || []) {
    add(cert.name);
    add(cert.issuer);
  }

  return entities;
}

/**
 * Builds a set of terms that are allowed to appear in generated text even
 * though they are not present in the Career Profile. Used for user-supplied
 * context such as the target company name and job title.
 *
 * Entries here are treated as trusted and skip the source-text check.
 */
export function buildTrustedTerms(context = {}) {
  const trusted = new Set();

  const add = (value) => {
    const str = String(value || '').trim();
    if (!str) return;

    // Full phrase
    trusted.add(str.toLowerCase());

    // Individual words of length >= 3
    for (const word of str.split(/\s+/)) {
      const clean = word.replace(/[^A-Za-z0-9+#.\-]/g, '');
      if (clean.length >= 3) trusted.add(clean.toLowerCase());
    }
  };

  add(context.company);
  add(context.jobTitle);

  return trusted;
}

export function extractKeyTerms(text, knownEntities) {
  const terms = new Set();
  const raw = String(text || '');

  const numbers = raw.match(/\d+[%+kKmM]?/g) || [];
  for (const n of numbers) terms.add(n.toLowerCase());

  for (const entity of knownEntities) {
    if (containsPhrase(raw, entity)) terms.add(entity);
  }

  const words = raw.split(/\s+/);
  for (let i = 0; i < words.length; i += 1) {
    if (i === 0) continue;

    const cleaned = words[i]
      .replace(/[^A-Za-z0-9+#.\-]/g, '')
      .replace(/^\.+|\.+$/g, '');

    if (!cleaned || cleaned.length < 2) continue;
    if (/^[A-Z]/.test(cleaned) && !GENERAL_STOPWORDS.has(cleaned.toLowerCase())) {
      terms.add(cleaned.toLowerCase());
    }
  }

  return terms;
}

/**
 * Validates whether the terms in `text` are supported by `sourceText`.
 *
 * `trustedTerms` (optional) is a set of terms that are always considered
 * supported, even if they do not appear in the source. Used for user-supplied
 * context like the target company name and job title.
 */
export function validateTextAgainstSource(
  text,
  sourceText,
  knownEntities,
  trustedTerms = null,
) {
  const terms = extractKeyTerms(text, knownEntities);
  const missing = [];

  for (const term of terms) {
    if (trustedTerms && trustedTerms.has(term)) continue;
    if (!containsPhrase(sourceText, term)) missing.push(term);
  }

  return { supported: missing.length === 0, missing };
}

export function splitIntoSentences(text) {
  const raw = String(text || '').trim();
  if (!raw) return [];
  return raw
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}