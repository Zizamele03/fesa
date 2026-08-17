import express from 'express';
import { extractCareerProfile } from '../services/careerProfileExtractor.mjs';
import { validateResumeText } from '../utils/schemaValidator.mjs';

const router = express.Router();

router.post('/extract', async (req, res) => {
  try {
    const resumeText = req.body?.resumeText;
    const validation = validateResumeText(resumeText);

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error,
      });
    }

    const profile = await extractCareerProfile(validation.text);

    return res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    // Do not log raw resume text or full profile.
    console.error('Extraction route error:', error.message || error);
    return res.status(500).json({
      success: false,
      error: 'We could not build your Career Profile. Please try again.',
    });
  }
});

export default router;