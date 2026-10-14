import { useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import LoadingState from '../components/LoadingState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import EmptyState from '../components/EmptyState.jsx';
import FormField from '../components/FormField.jsx';
import GeneratedResume from '../components/GeneratedResume.jsx';
import GeneratedCoverLetter from '../components/GeneratedCoverLetter.jsx';
import { loadProfile } from '../services/careerProfileStore.js';
import {
  getApplication,
  listApplications,
  updateApplication,
} from '../services/applicationStore.js';
import { generateResume } from '../services/resumeApi.js';
import { validateResumeAgainstProfile } from '../services/resumeTruthLock.js';
import { generateCoverLetter } from '../services/coverLetterApi.js';
import { validateCoverLetterAgainstProfile } from '../services/coverLetterTruthLock.js';

const TONE_OPTIONS = [
  { value: 'professional', label: 'Professional' },
  { value: 'confident', label: 'Confident' },
  { value: 'conversational', label: 'Conversational' },
];

const LENGTH_OPTIONS = [
  { value: 'short', label: 'Short' },
  { value: 'standard', label: 'Standard' },
  { value: 'detailed', label: 'Detailed' },
];

export default function ApplicationPackage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [application, setApplication] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isGeneratingResume, setIsGeneratingResume] = useState(false);
  const [resumeError, setResumeError] = useState('');
  const [resumeViolations, setResumeViolations] = useState([]);

  const [isGeneratingLetter, setIsGeneratingLetter] = useState(false);
  const [letterError, setLetterError] = useState('');
  const [letterViolations, setLetterViolations] = useState([]);
  const [letterTone, setLetterTone] = useState('professional');
  const [letterLength, setLetterLength] = useState('standard');
  const [isEditingLetter, setIsEditingLetter] = useState(false);
  const [letterDraft, setLetterDraft] = useState(null);

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
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [applicationId]);

  async function handleGenerateResume() {
    if (!profile || !application) return;

    setIsGeneratingResume(true);
    setResumeError('');
    setResumeViolations([]);

    try {
      const rawResume = await generateResume({
        profile,
        jobAnalysis: application.jobAnalysis,
        matchAnalysis: application.matchAnalysis || null,
      });

      const { resume: validatedResume, violations: found } =
        validateResumeAgainstProfile(profile, rawResume);

      setResumeViolations(found);

      try {
        await updateApplication(application.id, {
          generatedResume: validatedResume,
        });
      } catch (persistError) {
        console.warn('Could not save generated resume:', persistError);
      }

      setApplication({ ...application, generatedResume: validatedResume });
    } catch (err) {
      console.error('Resume generation error:', err);
      setResumeError(err.message || 'Could not generate resume. Please try again.');
    } finally {
      setIsGeneratingResume(false);
    }
  }

  async function handleGenerateLetter() {
    if (!profile || !application) return;

    setIsGeneratingLetter(true);
    setLetterError('');
    setLetterViolations([]);

    try {
      const rawLetter = await generateCoverLetter({
        profile,
        jobAnalysis: application.jobAnalysis,
        matchAnalysis: application.matchAnalysis || null,
        company: application.company,
        jobTitle: application.jobTitle,
        tone: letterTone,
        length: letterLength,
      });

      const { coverLetter: validatedLetter, violations: found } =
        validateCoverLetterAgainstProfile(profile, rawLetter, {
          company: application.company,
          jobTitle: application.jobTitle,
        });

      setLetterViolations(found);

      try {
        await updateApplication(application.id, {
          coverLetter: validatedLetter,
        });
      } catch (persistError) {
        console.warn('Could not save generated cover letter:', persistError);
      }

      setApplication({ ...application, coverLetter: validatedLetter });
    } catch (err) {
      console.error('Cover letter generation error:', err);
      setLetterError(
        err.message || 'Could not generate cover letter. Please try again.',
      );
    } finally {
      setIsGeneratingLetter(false);
    }
  }

  function handleEditLetter() {
    const letter = application?.coverLetter;
    if (!letter) return;
    setLetterDraft({
      greeting: letter.greeting || '',
      opening: letter.opening || '',
      body: (letter.body || []).slice(),
      closing: letter.closing || '',
      signoff: letter.signoff || '',
    });
    setIsEditingLetter(true);
  }

  async function handleSaveLetter() {
    if (!letterDraft || !application) return;

    const updated = {
      schemaVersion: 1,
      greeting: letterDraft.greeting,
      opening: letterDraft.opening,
      body: letterDraft.body.filter(Boolean),
      closing: letterDraft.closing,
      signoff: letterDraft.signoff,
    };

    try {
      await updateApplication(application.id, { coverLetter: updated });
    } catch (persistError) {
      console.warn('Could not save edited cover letter:', persistError);
    }

    setApplication({ ...application, coverLetter: updated });
    setIsEditingLetter(false);
    setLetterDraft(null);
  }

  function handleCancelEdit() {
    setIsEditingLetter(false);
    setLetterDraft(null);
  }

  function updateDraftField(field, value) {
    setLetterDraft((prev) => ({ ...prev, [field]: value }));
  }

  function updateDraftBody(index, value) {
    setLetterDraft((prev) => ({
      ...prev,
      body: prev.body.map((p, i) => (i === index ? value : p)),
    }));
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
          description="Generate a tailored resume and cover letter."
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
          description="The tailored resume and cover letter are generated from your Career Profile."
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
          description="Analyze the job description before generating an application package."
          actionLabel="Create Application"
          actionTo="/new-application"
        />
      </div>
    );
  }

  const resume = application.generatedResume;
  const letter = application.coverLetter;

  return (
    <div>
      <PageHeader
        title="Application Package"
        description={`${application.jobTitle} at ${application.company}`}
      />

      <section className="page-section">
        <div className="section-header-row">
          <h2>Tailored Resume</h2>
          <Button onClick={handleGenerateResume} disabled={isGeneratingResume}>
            {isGeneratingResume
              ? 'Generating...'
              : resume
              ? 'Regenerate Resume'
              : 'Generate Resume'}
          </Button>
        </div>

        {resumeError && (
          <div className="profile-status">
            <ErrorState title="Resume generation failed" message={resumeError} />
          </div>
        )}

        {resumeViolations.length > 0 && (
          <div className="profile-status">
            <Card>
              <h3>Content adjusted for accuracy</h3>
              <p>
                {resumeViolations.length} item
                {resumeViolations.length === 1 ? '' : 's'} removed because they
                could not be verified against your Career Profile.
              </p>
            </Card>
          </div>
        )}

        {isGeneratingResume && (
          <div className="profile-status">
            <LoadingState message="Generating tailored resume..." />
          </div>
        )}

        {!isGeneratingResume && !resume && (
          <EmptyState
            title="No tailored resume yet"
            description="Click Generate Resume to create a tailored resume from your Career Profile and this job analysis."
            actionLabel="Generate Resume"
            onAction={handleGenerateResume}
          />
        )}

        {!isGeneratingResume && resume && <GeneratedResume resume={resume} />}
      </section>

      <section className="page-section">
        <div className="section-header-row">
          <h2>Cover Letter</h2>
          {!isEditingLetter && (
            <div className="button-row">
              {letter && (
                <Button variant="secondary" onClick={handleEditLetter}>
                  Edit
                </Button>
              )}
              <Button
                onClick={handleGenerateLetter}
                disabled={isGeneratingLetter}
              >
                {isGeneratingLetter
                  ? 'Generating...'
                  : letter
                  ? 'Regenerate Letter'
                  : 'Generate Cover Letter'}
              </Button>
            </div>
          )}
        </div>

        <Card className="letter-preferences">
          <div className="letter-preferences-row">
            <FormField label="Tone" htmlFor="letterTone">
              <select
                id="letterTone"
                value={letterTone}
                onChange={(e) => setLetterTone(e.target.value)}
                disabled={isGeneratingLetter || isEditingLetter}
              >
                {TONE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Length" htmlFor="letterLength">
              <select
                id="letterLength"
                value={letterLength}
                onChange={(e) => setLetterLength(e.target.value)}
                disabled={isGeneratingLetter || isEditingLetter}
              >
                {LENGTH_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
          <p className="letter-preferences-hint">
            Tone and length affect style, not facts. All candidate information is
            validated against your Career Profile.
          </p>
        </Card>

        {letterError && (
          <div className="profile-status">
            <ErrorState title="Cover letter generation failed" message={letterError} />
          </div>
        )}

        {letterViolations.length > 0 && (
          <div className="profile-status">
            <Card>
              <h3>Content adjusted for accuracy</h3>
              <p>
                {letterViolations.length} sentence
                {letterViolations.length === 1 ? '' : 's'} removed because they
                could not be verified against your Career Profile.
              </p>
            </Card>
          </div>
        )}

        {isGeneratingLetter && (
          <div className="profile-status">
            <LoadingState message="Generating cover letter..." />
          </div>
        )}

        {!isGeneratingLetter && !letter && !isEditingLetter && (
          <EmptyState
            title="No cover letter yet"
            description="Choose a tone and length, then click Generate Cover Letter."
            actionLabel="Generate Cover Letter"
            onAction={handleGenerateLetter}
          />
        )}

        {!isGeneratingLetter && letter && !isEditingLetter && (
          <GeneratedCoverLetter letter={letter} />
        )}

        {isEditingLetter && letterDraft && (
          <Card>
            <h3>Edit Cover Letter</h3>

            <FormField label="Greeting" htmlFor="editGreeting">
              <input
                id="editGreeting"
                value={letterDraft.greeting}
                onChange={(e) => updateDraftField('greeting', e.target.value)}
              />
            </FormField>

            <FormField label="Opening" htmlFor="editOpening">
              <textarea
                id="editOpening"
                rows={3}
                value={letterDraft.opening}
                onChange={(e) => updateDraftField('opening', e.target.value)}
              />
            </FormField>

            {letterDraft.body.map((paragraph, index) => (
              <FormField
                key={index}
                label={`Body Paragraph ${index + 1}`}
                htmlFor={`editBody-${index}`}
              >
                <textarea
                  id={`editBody-${index}`}
                  rows={3}
                  value={paragraph}
                  onChange={(e) => updateDraftBody(index, e.target.value)}
                />
              </FormField>
            ))}

            <FormField label="Closing" htmlFor="editClosing">
              <textarea
                id="editClosing"
                rows={3}
                value={letterDraft.closing}
                onChange={(e) => updateDraftField('closing', e.target.value)}
              />
            </FormField>

            <FormField label="Sign-off" htmlFor="editSignoff">
              <textarea
                id="editSignoff"
                rows={2}
                value={letterDraft.signoff}
                onChange={(e) => updateDraftField('signoff', e.target.value)}
              />
            </FormField>

            <div className="button-row">
              <Button onClick={handleSaveLetter}>Save</Button>
              <Button variant="secondary" onClick={handleCancelEdit}>
                Cancel
              </Button>
            </div>

            <p className="letter-preferences-hint">
              Edits are saved as-is. Manual edits are not re-validated against
              your Career Profile.
            </p>
          </Card>
        )}
      </section>
    </div>
  );
}