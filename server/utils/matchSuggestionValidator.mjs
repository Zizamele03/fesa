const ALLOWED_RELATIONSHIPS = new Set(['related']);

function asString(value, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

/**
 * Validate and normalize AI-returned relationship suggestions.
 *
 * Enforces:
 *  - suggestions is an array
 *  - each suggestion has requirementId, evidenceId, relationship, explanation
 *  - relationship is exactly "related" (never matched, never partial)
 *  - explanation is a short, non-empty string
 *
 * Rejects every malformed item silently. Returns only the valid ones.
 * The frontend will do a second validation pass to ensure IDs exist.
 */
export function validateMatchSuggestions(rawResponse) {
  if (!rawResponse || typeof rawResponse !== 'object') {
    return { valid: false, suggestions: [] };
  }

  const raw = Array.isArray(rawResponse.suggestions)
    ? rawResponse.suggestions
    : [];

  const suggestions = [];

  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;

    const requirementId = asString(item.requirementId).trim();
    const evidenceId = asString(item.evidenceId).trim();
    const relationship = asString(item.relationship).trim();
    const explanation = asString(item.explanation).trim();

    if (!requirementId || !evidenceId) continue;
    if (!ALLOWED_RELATIONSHIPS.has(relationship)) continue;
    if (!explanation || explanation.length > 400) continue;

    suggestions.push({
      requirementId,
      evidenceId,
      relationship: 'related',
      explanation,
    });
  }

  return { valid: true, suggestions };
}