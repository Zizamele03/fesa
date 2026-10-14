import 'dotenv/config';
import express from 'express';
import careerProfileRoutes from './routes/careerProfile.mjs';
import jobAnalysisRoutes from './routes/jobAnalysis.mjs';
import resumeRoutes from './routes/resume.mjs';
import coverLetterRoutes from './routes/coverLetter.mjs';

const app = express();
const PORT = process.env.PORT || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

app.use(express.json({ limit: '1mb' }));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', CORS_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use('/api/career-profile', careerProfileRoutes);
app.use('/api/job-analysis', jobAnalysisRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/cover-letter', coverLetterRoutes);

app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Fesa backend listening on port ${PORT}`);
});