/**
 * Phase E — AI-assisted Match Analysis.
 *
 * This module:
 *  1. Builds the AI request from the deterministic match result and profile.
 *  2. Builds the evidence map so we can validate AI suggestions.
 *  3. Validates AI suggestions strictly.
 *  4. Merges valid suggestions into the deterministic match result.
 *
 * Invariants enforced here (never trusted from AI):
 *  - AI cannot upgrade a requirement to "matched".
 *  - AI cannot change required/preferred importance.
 *  - AI cannot reference requirements or evidence that were not sent.
 *  - AI cannot suggest more than one relationship per requirement.
 */

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function computeRequirementId(req) {
  const category = String(req.category || '').toLowerCase();
  const importance = String(req.importance || '').toLowerCase();
  const text = String(req.requirement || '').trim().toLowerCase();
  return `${category}|${importance}|${text}`;
}

function computeEvidenceId(sourceType, sourceId, text) {
  return `${sourceType}|${sourceId}|${String(text || '').trim().toLowerCase()}`;
}

export function buildEvidenceMap(profile) {
  const evidence = new Map();

  const add = (sourceType, sourceId, sourceTitle, text) => {
    const cleanText = String(text || '').trim();
    if (!cleanText) return;
    const id = computeEvidenceId(sourceType, sourceId, cleanText);
    if (evidence.has(id)) return;
    evidence.set(id, {
      id,
      sourceType,
      sourceId,
      sourceTitle: String(sourceTitle || ''),
      text: cleanText,
    });
  };

  const skillGroups = profile?.skills || {};
  for (const [category, list] of Object.entries(skillGroups)) {
    if (category === 'uncertain') continue; // not confirmed evidence
    for (const skill of asArray(list)) {
      add('skill', category, `${category} skill`, skill);
    }
  }

  for (const job of asArray(profile?.experience)) {
    const sourceId = job.id || `${job.company || ''}|${job.position || ''}`;
    const sourceTitle =
      `${job.position || 'Role'} at ${job.company || 'Company'}`.trim();
    for (const tech of asArray(job.technologies)) {
      add('experience', sourceId, sourceTitle, tech);
    }
  }

  for (const project of asArray(profile?.projects)) {
    const sourceId = project.id || project.name || '';
    const sourceTitle = project.name || 'Project';
    for (const tech of asArray(project.technologies)) {
      add('project', sourceId, sourceTitle, tech);
    }
  }

  return evidence;
}

/**
 * Extract the subset of requirements the AI might legitimately help with:
 * only requirements currently marked missing. Requirements that already
 * matched or are partial should not be re-evaluated by AI.
 *
 * Also returns the full evidence map (for sourceTitle lookup) plus the
 * `evidence` list that was actually sent (for validation).
 */
export function buildAiRequest(baseMatch, profile) {
  const evidenceMap = buildEvidenceMap(profile);

  const requirements = asArray(baseMatch?.requirements)
    .filter((r) => r.status === 'missing')
    .map((r) => ({
      id: computeRequirementId(r),
      text: r.requirement,
      type: r.category || 'skill',
      importance: r.importance || 'required',
    }));

  const evidence = Array.from(evidenceMap.values())
    .map((e) => ({
      id: e.id,
      text: e.text,
      sourceType: e.sourceType,
    }))
    .slice(0, 60);

  return { requirements, evidence, evidenceMap };
}

/**
 * Validate and apply AI suggestions on top of the deterministic match result.
 *
 * Returns a new match result. Never mutates `baseMatch`.
 */
export function mergeAiSuggestions(baseMatch, rawSuggestions, profile) {
  const { evidence: aiEvidence, evidenceMap } = buildAiRequest(baseMatch, profile);

  // Only evidence that was actually sent to the AI can be referenced.
  const sentEvidenceIds = new Set(aiEvidence.map((e) => e.id));

  // Build a lookup for requirement IDs the AI was allowed to reference.
  const allowedRequirements = new Map();
  for (const req of asArray(baseMatch?.requirements)) {
    if (req.status === 'missing') {
      allowedRequirements.set(computeRequirementId(req), req);
    }
  }

  const acceptedByRequirement = new Map();

  for (const raw of asArray(rawSuggestions)) {
    if (!raw || typeof raw !== 'object') continue;

    const requirementId = String(raw.requirementId || '').trim();
    const evidenceId = String(raw.evidenceId || '').trim();
    const relationship = String(raw.relationship || '').trim().toLowerCase();
    const explanation = String(raw.explanation || '').trim();

    // 1. AI may only ever propose "related".
    if (relationship !== 'related') continue;

    // 2. Requirement must be one we actually asked about.
    if (!allowedRequirements.has(requirementId)) continue;

    // 3. Evidence must be one we actually sent to the AI.
    if (!sentEvidenceIds.has(evidenceId)) continue;

    // 4. Explanation is required and bounded.
    if (!explanation || explanation.length > 400) continue;

    // 5. One suggestion per requirement.
    if (acceptedByRequirement.has(requirementId)) continue;

    acceptedByRequirement.set(requirementId, {
      requirementId,
      evidenceId,
      explanation,
    });
  }

  const updatedRequirements = asArray(baseMatch?.requirements).map((req) => {
    const reqId = computeRequirementId(req);
    const suggestion = acceptedByRequirement.get(reqId);
    if (!suggestion) return req;

    const evidence = evidenceMap.get(suggestion.evidenceId);
    if (!evidence) return req;

    // Deterministic upgrade: missing → partial + RELATED_BUT_DIFFERENT.
    // Importance is preserved verbatim (we never touch req.importance).
    return {
      ...req,
      status: 'partial',
      relationship: 'RELATED_BUT_DIFFERENT',
      score: 30,
      evidence: [
        {
          sourceType: evidence.sourceType,
          sourceId: evidence.sourceId,
          sourceTitle: evidence.sourceTitle,
          text: evidence.text,
        },
      ],
      aiAssisted: true,
      explanation: suggestion.explanation,
    };
  });

  const relatedOrTransferable = updatedRequirements.filter(
    (item) =>
      item.relationship === 'RELATED_BUT_DIFFERENT' ||
      item.relationship === 'TRANSFERABLE',
  );

  const missingRequirements = updatedRequirements.filter(
    (item) => item.status === 'missing' && item.importance === 'required',
  );

  const partialMatches = updatedRequirements.filter(
    (item) =>
      item.status === 'partial' &&
      item.relationship !== 'RELATED_BUT_DIFFERENT' &&
      item.relationship !== 'TRANSFERABLE',
  );

  const unverifiedRequirements = updatedRequirements.filter(
    (item) => item.status === 'unverified',
  );

  return {
    ...baseMatch,
    requirements: updatedRequirements,
    relatedOrTransferable,
    missingRequirements,
    partialMatches,
    unverifiedRequirements,
    aiAssisted: acceptedByRequirement.size > 0,
    aiAssistedCount: acceptedByRequirement.size,
  };
}