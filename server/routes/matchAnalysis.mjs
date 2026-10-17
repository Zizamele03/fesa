import express from 'express';
import { suggestRelatedRequirements } from '../services/matchSuggestionExtractor.mjs';

const router = express.Router();

const MAX_REQUIREMENTS = 40;
const MAX_EVIDENCE = 60;
const MAX_TEXT_LENGTH = 400;
const MAX_PAYLOAD_BYTES = 60000;

function sanitizeList(items, max, idPrefix) {
  if (!Array.isArray(items)) return [];
  const out = [];
  const seenIds = new Set();

  for (const item of items) {
    if (!item || typeof item !== 'object') continue;
    const id = typeof item.id === 'string' ? item.id.trim() : '';
    const text = typeof item.text === 'string' ? item.text.trim() : '';

    if (!id || !text) continue;
    if (id.length > 200 || text.length > MAX_TEXT_LENGTH) continue;
    if (seenIds.has(id)) continue;
    seenIds.add(id);

    out.push(item);
    if (out.length >= max) break;
  }

  return out;
}

router.post('/suggest-relationships', async (req, res) => {
  try {
    const { requirements, evidence } = req.body || {};

    const payloadSize = JSON.stringify(req.body || {}).length;
    if (payloadSize > MAX_PAYLOAD_BYTES) {
      return res.status(413).json({
        success: false,
        error: 'Request payload is too large.',
        suggestions: [],
      });
    }

    const cleanRequirements = sanitizeList(requirements, MAX_REQUIREMENTS, 'req');
    const cleanEvidence = sanitizeList(evidence, MAX_EVIDENCE, 'ev');

    if (cleanRequirements.length === 0 || cleanEvidence.length === 0) {
      return res.status(200).json({
        success: true,
        suggestions: [],
      });
    }

    const { suggestions } = await suggestRelatedRequirements({
      requirements: cleanRequirements,
      evidence: cleanEvidence,
    });

    return res.status(200).json({
      success: true,
      suggestions,
    });
  } catch (error) {
    // Deterministic matching on the frontend must not be interrupted by AI failure.
    // Return a 200 with empty suggestions and a flag so the frontend can decide
    // how to communicate status to the user.
    console.warn('Match suggestion route error:', error.message || error);
    return res.status(200).json({
      success: true,
      suggestions: [],
      aiAvailable: false,
    });
  }
});

export default router;