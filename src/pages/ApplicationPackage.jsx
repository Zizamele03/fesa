import { useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import LoadingState from '../components/LoadingState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import EmptyState from '../components/EmptyState.jsx';
import GeneratedResume from '../components/GeneratedResume.jsx';
import { loadProfile } from '../services/careerProfileStore.js';
import {
  getApplication,
  listApplications,
  updateApplication,
} from '../services/applicationStore.js';
import { generateResume } from '../services/resumeApi.js';
import { validateResumeAgainstProfile } from '../services/resumeTruthLock.js';

export default function ApplicationPackage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [application, setApplication] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [violations, setViolations] = useState([]);

  const applicationId =
    searchParams.get('applicationId') || location.state?.applicationId;

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const [profileResult, applications] = await Promise.all([
          loadProfile(),
          listApplications(),
        ]);

        if (!mounted) return;

        setProfile(profileResult || null);

        let target = null;
        if (applicationId) {
          try {
            target = await getApplication(applicationId);
          } catch {
            target = null;
          }
        }
        if (!target && applications.length > 0) {
          target = applications[0];
        }

        if (mounted) setApplication(target || null);
      } catch (err) {
        console.warn('Failed to load application package data:', err);
        if (mounted) setError('Could not load application data.');
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [applicationId]);

  async function handleGenerate() {
    if (!profile || !application) return;

    setIsGenerating(true);
    setError('');
    setViolations([]);

    try {
      const rawResume = await generateResume({
        profile,
        jobAnalysis: application.jobAnalysis,
        matchAnalysis: application.matchAnalysis || null,
      });

      const { resume: validatedResume, violations: found } =
        validateResumeAgainstProfile(profile, rawResume);

      setViolations(found);

      const updated = {
        ...application,
        generatedResume: validatedResume,
      };

      try {
        await updateApplication(application.id, {
          generatedResume: validatedResume,
        });
      } catch (persistError) {
        console.warn('Could not save generated resume:', persistError);
      }

      setApplication(updated);
    } catch (err) {
      console.error('Resume generation error:', err);
      setError(err.message || 'Could not generate resume. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Application Package" />
        <LoadingState message="Loading application..." />
      </div>
    );
  }

  if (!application) {
    return (
      <div>
        <PageHeader
          title="Application Package"
          description="Generate a tailored resume from your Career Profile and a job analysis."
        />
        <EmptyState
          title="No application available"
          description="Create an application and analyze a job description first."
          actionLabel="Create Application"
          actionTo="/new-application"
        />
      </div>
    );
  }

  if (!profile) {
    return (
      <div>
        <PageHeader title="Application Package" />
        <EmptyState
          title="Build your Career Profile first"
          description="The tailored resume is generated from your Career Profile."
          actionLabel="Go to Career Profile"
          actionTo="/career-profile"
        />
      </div>
    );
  }

  if (!application.jobAnalysis) {
    return (
      <div>
        <PageHeader title="Application Package" />
        <EmptyState
          title="No job analysis for this application"
          description="Analyze the job description before generating a resume."
          actionLabel="Create Application"
          actionTo="/new-application"
        />
      </div>
    );
  }

  const generated = application.generatedResume;

  return (
    <div>
      <PageHeader
        title="Application Package"
        description={`${application.jobTitle} at ${application.company}`}
        actions={
          <Button onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating
              ? 'Generating...'
              : generated
              ? 'Regenerate Resume'
              : 'Generate Resume'}
          </Button>
        }
      />

      {error && (
        <div className="profile-status">
          <ErrorState title="Resume generation failed" message={error} />
        </div>
      )}

      {violations.length > 0 && (
        <div className="profile-status">
          <Card>
            <h3>Content adjusted for accuracy</h3>
            <p>
              {violations.length} item
              {violations.length === 1 ? '' : 's'} were removed or adjusted because
              they could not be verified against your Career Profile.
            </p>
            <ul>
              {violations.slice(0, 5).map((v, i) => (
                <li key={i}>{v.reason}</li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {isGenerating && (
        <div className="profile-status">
          <LoadingState message="Generating tailored resume..." />
        </div>
      )}

      {!isGenerating && !generated && (
        <EmptyState
          title="No tailored resume yet"
          description="Click Generate Resume to create a tailored resume from your Career Profile and this job analysis."
          actionLabel="Generate Resume"
          onAction={handleGenerate}
        />
      )}

      {!isGenerating && generated && (
        <section className="page-section">
          <h2>Tailored Resume</h2>
          <GeneratedResume resume={generated} />
        </section>
      )}
    </div>
  );
}