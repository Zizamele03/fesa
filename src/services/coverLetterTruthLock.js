import { getProfileTextSources } from './truthLock.js';
import {
  collectKnownEntities,
  buildTrustedTerms,
  validateTextAgainstSource,
  splitIntoSentences,
} from './claimExtraction.js';

function validateProseField(
  text,
  sourceText,
  knownEntities,
  trustedTerms,
  fieldName,
  violations,
) {
  if (!text || typeof text !== 'string') return '';

  const sentences = splitIntoSentences(text);
  const valid = [];

  for (const sentence of sentences) {
    const { supported, missing } = validateTextAgainstSource(
      sentence,
      sourceText,
      knownEntities,
      trustedTerms,
    );
    if (supported) {
      valid.push(sentence);
    } else {
      violations.push({
        field: fieldName,
        claim: sentence,
        reason: `Removed sentence with unsupported terms: ${missing.join(', ')}`,
      });
    }
  }

  return valid.join(' ');
}

export function validateCoverLetterAgainstProfile(
  profile,
  coverLetter,
  context = {},
) {
  if (!profile || typeof profile !== 'object') {
    throw new Error('Career Profile is required for truth validation.');
  }
  if (!coverLetter || typeof coverLetter !== 'object') {
    throw new Error('Cover letter is required for truth validation.');
  }

  const knownEntities = collectKnownEntities(profile);
  const trustedTerms = buildTrustedTerms(context);

  // Also add context terms to knownEntities so they are extracted as terms
  // and then skipped via trustedTerms.
  for (const term of trustedTerms) knownEntities.add(term);

  const sourceText = getProfileTextSources(profile)
    .map((s) => s.text)
    .join(' ');
  const violations = [];

  const validated = {
    schemaVersion: 1,
    greeting: coverLetter.greeting || 'Dear Hiring Manager,',
    opening: validateProseField(
      coverLetter.opening,
      sourceText,
      knownEntities,
      trustedTerms,
      'opening',
      violations,
    ),
    body: (coverLetter.body || [])
      .map((paragraph, index) =>
        validateProseField(
          paragraph,
          sourceText,
          knownEntities,
          trustedTerms,
          `body[${index}]`,
          violations,
        ),
      )
      .filter(Boolean),
    closing: validateProseField(
      coverLetter.closing,
      sourceText,
      knownEntities,
      trustedTerms,
      'closing',
      violations,
    ),
    signoff: coverLetter.signoff || '',
  };

  const hasContent =
    validated.opening || validated.body.length > 0 || validated.closing;

  if (!hasContent) {
    throw new Error(
      'The generated letter could not be verified against your Career Profile.',
    );
  }

  return {
    coverLetter: validated,
    violations,
    stats: {
      violationCount: violations.length,
      cleaned: violations.length > 0,
    },
  };
}