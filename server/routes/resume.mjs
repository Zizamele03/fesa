import express from 'express';
import { generateTailoredResume } from '../services/resumeGenerator.mjs';

const router = express.Router();

const MAX_PROFILE_BYTES = 200000;

router.post('/generate', async (req, res) => {
  try {
    const { profile, jobAnalysis, matchAnalysis } = req.body || {};

    if (!profile || typeof profile !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Career Profile is required.',
      });
    }

    if (!jobAnalysis || typeof jobAnalysis !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Job Analysis is required.',
      });
    }

    const payloadSize = JSON.stringify(req.body || {}).length;
    if (payloadSize > MAX_PROFILE_BYTES) {
      return res.status(413).json({
        success: false,
        error: 'Request payload is too large.',
      });
    }

    const resume = await generateTailoredResume({
      profile,
      jobAnalysis,
      matchAnalysis: matchAnalysis || null,
    });

    return res.status(200).json({
      success: true,
      resume,
    });
  } catch (error) {
    console.error('Resume generation route error:', error.message || error);

    if (error.status === 503 || error.status === 429) {
      return res.status(503).json({
        success: false,
        error:
          'The AI service is currently busy. Please wait a moment and try again.',
        retryable: true,
      });
    }

    if (error.status === 504 || error.status === 500) {
      return res.status(504).json({
        success: false,
        error:
          'The AI service is temporarily unavailable. Please try again in a moment.',
        retryable: true,
      });
    }

    return res.status(500).json({
      success: false,
      error: 'We could not generate your resume. Please try again.',
    });
  }
});

export default router;