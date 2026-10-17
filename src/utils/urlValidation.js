const HTTPS_ONLY_MESSAGE =
  'Enter a valid HTTPS URL, for example https://example.com/certificate.';

/**
 * Validate a user-supplied URL for use as a certification or project link.
 *
 * Rules:
 *  - Whitespace is trimmed.
 *  - Empty input is reported as `empty: true` (not an error — the field is
 *    optional).
 *  - Only HTTPS is accepted. HTTP, javascript:, data:, file:, ftp:, and all
 *    other non-HTTPS schemes are rejected.
 *  - URLs containing embedded credentials (user:pass@host) are rejected.
 *  - The hostname must be present.
 *
 * This function only checks syntax. It does NOT verify that the URL is
 * reachable or that a credential is genuine.
 */
export function validateProfileUrl(raw) {
  const trimmed = typeof raw === 'string' ? raw.trim() : '';

  if (!trimmed) {
    return { valid: false, empty: true, error: null, normalizedUrl: '' };
  }

  let parsed;

  try {
    parsed = new URL(trimmed);
  } catch {
    return {
      valid: false,
      empty: false,
      error: HTTPS_ONLY_MESSAGE,
      normalizedUrl: '',
    };
  }

  if (parsed.protocol !== 'https:') {
    return {
      valid: false,
      empty: false,
      error: HTTPS_ONLY_MESSAGE,
      normalizedUrl: '',
    };
  }

  if (!parsed.hostname) {
    return {
      valid: false,
      empty: false,
      error: HTTPS_ONLY_MESSAGE,
      normalizedUrl: '',
    };
  }

  if (parsed.username || parsed.password) {
    return {
      valid: false,
      empty: false,
      error: 'URLs with embedded credentials are not allowed.',
      normalizedUrl: '',
    };
  }

  return {
    valid: true,
    empty: false,
    error: null,
    normalizedUrl: parsed.href,
  };
}

/**
 * Returns the normalized HTTPS URL if valid, otherwise null.
 * Used at render time to decide whether to emit a clickable link.
 */
export function getSafeHttpsUrl(raw) {
  const result = validateProfileUrl(raw);
  return result.valid ? result.normalizedUrl : null;
}