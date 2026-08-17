import express from 'express';
import { extractJobAnalysis } from '../services/jobAnalysisExtractor.mjs';
import { validateJobAnalysisRequest } from '../utils/jobAnalysisValidator.mjs';

const router = express.Router();

router.post('/analyze', async (req, res) => {
  try {
    const { company, title, jobDescription } = req.body || {};
    const validation = validateJobAnalysisRequest({
      company,
      title,
      jobDescription,
    });

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error,
      });
    }

    const analysis = await extractJobAnalysis(validation.values);

    return res.status(200).json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error('Job analysis route error:', error.message || error);
    return res.status(500).json({
      success: false,
      error: 'We could not analyze this job description. Please try again.',
    });
  }
});

export default router;