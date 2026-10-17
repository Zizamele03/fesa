import { getCanonicalSkillSet, containsPhrase } from './truthLock.js';

const GENERAL_STOPWORDS = new Set([
  // Articles, pronouns, prepositions, conjunctions, auxiliary verbs
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

  // Common sentence-starting polite / formal words
  'thank','thanks','please','dear','kind','regards','sincerely','best',
  'warm','yours','hello','hi','hey','good','great','excellent',
  'wonderful','amazing','awesome',

  // Common verbs often used at sentence start
  'using','utilizing','leveraging','applying','employing',
  'working','developing','building','creating','designing','implementing',
  'delivering','managing','leading','coordinating','executing','performing',
  'achieving','accomplishing','completing','finishing','finalizing',
  'bringing','taking','giving','making','doing','having','being',

  // Transition / discourse markers
  'however','therefore','thus','hence','meanwhile','otherwise',
  'consequently','accordingly','nevertheless','nonetheless',
  'also','additionally','furthermore','moreover','besides','further',

  // Time markers
  'recently','currently','presently','finally','initially',
  'originally','previously','formerly','now','soon','later',
  'eventually','subsequently',

  // Subordinating conjunctions / participial openers
  'although','though','whereas','while','whilst','because','since',
  'unless','whether','given','considering','regarding','concerning',
  'following','including','excluding','provided','assuming','supposing',
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
  for (const edu of profile.education || []) add(edu.institution);
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
 */
export function buildTrustedTerms(context = {}) {
  const trusted = new Set();

  const add = (value) => {
    const str = String(value || '').trim();
    if (!str) return;
    trusted.add(str.toLowerCase());
    for (const word of str.split(/\s+/)) {
      const clean = word.replace(/[^A-Za-z0-9+#.-]/g, '');
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

  // Extract capitalized words (potential proper nouns / technical terms).
  // Position 0 is included on purpose — otherwise sentences like
  // "Kubernetes specialist." would pass validation despite the invented skill.
  // Common English words that start sentences are filtered via stopwords.
  const words = raw.split(/\s+/);
  for (let i = 0; i < words.length; i += 1) {
    const cleaned = words[i]
      .replace(/[^A-Za-z0-9+#.-]/g, '')
      .replace(/^\.+|\.+$/g, '');

    if (!cleaned || cleaned.length < 2) continue;
    if (/^[A-Z]/.test(cleaned) && !GENERAL_STOPWORDS.has(cleaned.toLowerCase())) {
      terms.add(cleaned.toLowerCase());
    }
  }

  return terms;
}

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