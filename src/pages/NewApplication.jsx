import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import PageHeader from '../components/PageHeader.jsx';
import FormField from '../components/FormField.jsx';
import ErrorState from '../components/ErrorState.jsx';
import LoadingState from '../components/LoadingState.jsx';
import { analyzeJobDescription } from '../services/jobAnalysisApi.js';
import { createApplication } from '../services/applicationStore.js';

export default function NewApplication() {
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !companyName.trim() ||
      !jobTitle.trim() ||
      !jobDescription.trim()
    ) {
      setErrorMessage(
        'Please provide company name, job title, and job description.',
      );
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage('');

    try {
      const analysis = await analyzeJobDescription({
        company: companyName.trim(),
        title: jobTitle.trim(),
        jobDescription: jobDescription.trim(),
      });

      try {
        await createApplication({
          company: companyName.trim(),
          jobTitle: jobTitle.trim(),
          jobDescription: jobDescription.trim(),
          jobAnalysis: analysis,
        });
      } catch (persistError) {
        // The analysis succeeded; persistence should not block navigation.
        console.warn('Could not save application:', persistError);
      }

      navigate('/job-analysis', { state: { analysis } });
    } catch (error) {
      console.error('Job analysis error:', error);
      setErrorMessage(
        error.message || 'Unable to analyze job description. Please try again.',
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="New Application"
        description="Enter the job details you want to analyze. Fesa will later compare this analysis to your Career Profile."
      />

      <Card className="form-card">
        {isAnalyzing ? (
          <LoadingState message="Analyzing job description..." />
        ) : (
          <form onSubmit={handleSubmit}>
            <FormField label="Company Name" htmlFor="companyName" required>
              <input
                id="companyName"
                name="companyName"
                type="text"
                value={companyName}
                onChange={(event) => setCompanyName(event.target.value)}
                placeholder="e.g. Northwind Labs"
                autoComplete="organization"
                disabled={isAnalyzing}
                required
              />
            </FormField>

            <FormField label="Job Title" htmlFor="jobTitle" required>
              <input
                id="jobTitle"
                name="jobTitle"
                type="text"
                value={jobTitle}
                onChange={(event) => setJobTitle(event.target.value)}
                placeholder="e.g. Frontend Engineer"
                autoComplete="off"
                disabled={isAnalyzing}
                required
              />
            </FormField>

            <FormField
              label="Job Description"
              htmlFor="jobDescription"
              required
              hint="Paste the full job description. Fesa will analyze the requirements and responsibilities."
            >
              <textarea
                id="jobDescription"
                name="jobDescription"
                rows={12}
                value={jobDescription}
                onChange={(event) => setJobDescription(event.target.value)}
                placeholder="Paste job description here..."
                disabled={isAnalyzing}
                required
              />
            </FormField>

            {errorMessage && (
              <div className="form-error">
                <ErrorState
                  title="Unable to analyze job description"
                  message={errorMessage}
                />
              </div>
            )}

            <div className="form-actions">
              <Button type="submit" size="lg" disabled={isAnalyzing}>
                {isAnalyzing ? 'Analyzing...' : 'Analyze Job'}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}