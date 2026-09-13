/**
 * Public API for Phase 7 (AI generation) to validate every factual claim
 * before it is shown to the user.
 *
 * Usage:
 *   import { validateClaims, validateTextAgainstProfile } from './claimValidator.js';
 *
 *   const result = validateClaims(profile, [
 *     { id: '1', text: 'Developed REST APIs using Node.js' },
 *   ]);
 *
 *   if (!result.allSupported) { // reject or flag the content }
 *
 * Rules enforced:
 *   - No evidence, no claim.
 *   - Every supported claim carries structured evidence.
 *   - Unsupported skill mentions are surfaced so the caller can reject them.
 */

import { canonicalizeSkill, SKILL_ALIASES } from './aliasMap.js';
import {
  getCanonicalSkillSet,
  getProfileTextSources,
  validateClaimAgainstProfile,
  normalizeText,
  containsPhrase,
} from './truthLock.js';

function buildAliasIndex() {
  const index = new Map();
  for (const [alias, canonical] of Object.entries(SKILL_ALIASES)) {
    if (!index.has(canonical)) index.set(canonical, new Set());
    index.get(canonical).add(alias);
  }
  return index;
}

const ALIAS_INDEX = buildAliasIndex();

export function extractSkillMentionsFromText(text, profile) {
  const knownSkills = getCanonicalSkillSet(profile);
  const lowered = String(text || '').toLowerCase();
  const found = new Set();

  for (const canonical of knownSkills) {
    const aliases = ALIAS_INDEX.get(canonical);
    const candidates = [canonical, ...(aliases ? Array.from(aliases) : [])];

    for (const candidate of candidates) {
      if (candidate && containsPhrase(lowered, candidate)) {
        found.add(canonical);
        break;
      }
    }
  }

  return Array.from(found);
}

export function validateClaim(profile, claim) {
  const text = typeof claim === 'string' ? claim : claim?.text || '';
  const id = typeof claim === 'object' ? claim.id : undefined;

  const base = validateClaimAgainstProfile(profile, text);
  const mentionedSkills = extractSkillMentionsFromText(text, profile);

  const unsupportedSkillMentions = mentionedSkills.filter((skill) => {
    const canonical = canonicalizeSkill(skill);
    return !base.evidence.some(
      (item) => canonicalizeSkill(item.text || '') === canonical,
    );
  });

  return {
    id,
    text,
    supported: base.supported,
    evidence: base.evidence,
    mentionedSkills,
    unsupportedSkillMentions,
    reason: base.reason,
  };
}

export function validateClaims(profile, claims) {
  const results = (claims || []).map((claim) => validateClaim(profile, claim));
  return {
    results,
    allSupported: results.every((item) => item.supported),
    anyUnsupported: results.some((item) => !item.supported),
  };
}

/**
 * Lightweight text-level scanner. Useful when a Phase 7 output is free text
 * (for example, a paragraph of cover letter) and you want to flag skills that
 * are mentioned but not backed by the profile.
 */
export function validateTextAgainstProfile(profile, text) {
  const mentions = extractSkillMentionsFromText(text, profile);
  const supported = [];
  const unsupported = [];

  for (const skill of mentions) {
    const result = validateClaimAgainstProfile(profile, skill);
    if (result.supported) supported.push(skill);
    else unsupported.push(skill);
  }

  return {
    mentions,
    supported,
    unsupported,
    safe: unsupported.length === 0,
    normalizedText: normalizeText(text),
  };
}