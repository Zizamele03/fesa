import express from 'express';
import { generateCoverLetter } from '../services/coverLetterGenerator.mjs';
import { validateCoverLetterRequest } from '../utils/coverLetterValidator.mjs';

const router = express.Router();

const MAX_PAYLOAD_BYTES = 200000;

router.post('/generate', async (req, res) => {
  try {
    const validation = validateCoverLetterRequest(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error,
      });
    }

    const payloadSize = JSON.stringify(req.body || {}).length;
    if (payloadSize > MAX_PAYLOAD_BYTES) {
      return res.status(413).json({
        success: false,
        error: 'Request payload is too large.',
      });
    }

    const coverLetter = await generateCoverLetter(validation.values);

    return res.status(200).json({
      success: true,
      coverLetter,
    });
  } catch (error) {
    console.error('Cover letter route error:', error.message || error);

    if (error.status === 503 || error.status === 429) {
      return res.status(503).json({
        success: false,
        error: 'The AI service is currently busy. Please wait a moment and try again.',
        retryable: true,
      });
    }

    if (error.status === 504 || error.status === 500) {
      return res.status(504).json({
        success: false,
        error: 'The AI service is temporarily unavailable. Please try again in a moment.',
        retryable: true,
      });
    }

    return res.status(500).json({
      success: false,
      error: 'We could not generate your cover letter. Please try again.',
    });
  }
});

export default router;