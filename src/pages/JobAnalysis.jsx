import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import Badge from '../components/Badge.jsx';
import PageHeader from '../components/PageHeader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import LoadingState from '../components/LoadingState.jsx';
import { loadProfile } from '../services/careerProfileStore.js';
import { updateApplication } from '../services/applicationStore.js';
import { computeMatch } from '../services/matchEngine.js';
import { buildAiRequest, mergeAiSuggestions } from '../services/aiMatchMerge.js';
import { fetchAiMatchSuggestions } from '../services/matchSuggestionApi.js';

function SkillGroup({ title, skills }) {
  const hasSkills =
    skills.technical.length > 0 ||
    skills.soft.length > 0 ||
    skills.tools.length > 0 ||
    skills.frameworks.length > 0 ||
    skills.languages.length > 0 ||
    skills.databases.length > 0 ||
    skills.cloudTechnologies.length > 0;

  if (!hasSkills) return null;

  const renderBadges = (label, items) => {
    if (!items?.length) return null;
    return (
      <div className="skill-subgroup">
        <h4>{label}</h4>
        <div className="skill-badges">
          {items.map((item) => (
            <Badge key={item} tone="info">
              {item}
            </Badge>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="skill-editor-group">
      <h3>{title}</h3>
      {renderBadges('Technical', skills.technical)}
      {renderBadges('Soft Skills', skills.soft)}
      {renderBadges('Tools', skills.tools)}
      {renderBadges('Frameworks', skills.frameworks)}
      {renderBadges('Languages', skills.languages)}
      {renderBadges('Databases', skills.databases)}
      {renderBadges('Cloud Technologies', skills.cloudTechnologies)}
    </div>
  );
}

function JobAnalysis() {
  const location = useLocation();
  const navigate = useNavigate();

  const analysis = location.state?.analysis;
  const applicationId = location.state?.applicationId;

  const [isMatching, setIsMatching] = useState(false);
  const [matchError, setMatchError] = useState('');

  if (!analysis) {
    return (
      <div>
        <PageHeader
          title="Job Analysis"
          description="View structured requirements from a job description."
        />
        <EmptyState
          title="No job analysis available yet"
          description="Start a new application and analyze a job description to see its requirements here."
          actionLabel="Create Application"
          actionTo="/new-application"
        />
      </div>
    );
  }

  const { job, summary } = analysis;

  const handleMatch = async () => {
    setIsMatching(true);
    setMatchError('');

    try {
      const profile = await loadProfile();

      if (!profile) {
        setMatchError(
          'Build your Career Profile first before running a match analysis.',
        );
        return;
      }

      // 1. Deterministic match — always runs first.
      const baseMatch = computeMatch(profile, analysis);

      // 2. Try AI assistance for requirements still marked missing.
      let finalMatch = baseMatch;
      let aiStatus = 'skipped';
      let aiCount = 0;

      const { requirements: aiReqs, evidence: aiEvidence } = buildAiRequest(
        baseMatch,
        profile,
      );

      if (aiReqs.length > 0 && aiEvidence.length > 0) {
        try {
          const { suggestions } = await fetchAiMatchSuggestions({
            requirements: aiReqs,
            evidence: aiEvidence,
          });

          if (suggestions.length > 0) {
            finalMatch = mergeAiSuggestions(baseMatch, suggestions, profile);
            aiCount = finalMatch.aiAssistedCount || 0;
            aiStatus = aiCount > 0 ? 'used' : 'no_improvement';
          } else {
            aiStatus = 'no_improvement';
          }
        } catch (aiError) {
          console.warn('AI match assistance unavailable:', aiError);
          aiStatus = 'unavailable';
        }
      }

      const savedMatch = {
        ...finalMatch,
        aiStatus,
        aiAssistedCount: aiCount,
      };

      if (applicationId) {
        try {
          await updateApplication(applicationId, { matchAnalysis: savedMatch });
        } catch (persistError) {
          console.warn('Could not save match analysis:', persistError);
        }
      }

      navigate('/match-analysis', {
        state: { matchAnalysis: savedMatch, jobAnalysis: analysis, applicationId },
      });
    } catch (error) {
      console.error('Match analysis error:', error);
      setMatchError(
        error.message || 'Unable to run match analysis. Please try again.',
      );
    } finally {
      setIsMatching(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Job Analysis"
        description={`${job.title} · ${job.company}`}
        actions={
          <Button onClick={handleMatch} disabled={isMatching}>
            {isMatching ? 'Analyzing Match...' : 'Analyze My Match'}
          </Button>
        }
      />

      {matchError && (
        <div className="profile-status">
          <ErrorState title="Match Analysis Error" message={matchError} />
        </div>
      )}

      {isMatching && (
        <div className="profile-status">
          <LoadingState message="Running Match Analysis..." />
        </div>
      )}

      <div className="analysis-overview">
        <Card>
          <p className="stat-label">Summary</p>
          <p>{summary}</p>
        </Card>
      </div>

      <div className="analysis-grid">
        <Card>
          <h2>Job Information</h2>
          <dl className="profile-details">
            <div>
              <dt>Company</dt>
              <dd>{job.company || 'Not provided'}</dd>
            </div>
            <div>
              <dt>Job Title</dt>
              <dd>{job.title || 'Not provided'}</dd>
            </div>
            <div>
              <dt>Location</dt>
              <dd>{job.location || 'Not provided'}</dd>
            </div>
            <div>
              <dt>Employment Type</dt>
              <dd>{job.employmentType || 'Not provided'}</dd>
            </div>
          </dl>
        </Card>

        <Card>
          <h2>Education Requirements</h2>
          {analysis.educationRequirements.length === 0 ? (
            <p className="section-empty">No education requirements extracted.</p>
          ) : (
            <ul className="check-list">
              {analysis.educationRequirements.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="analysis-grid">
        <Card>
          <h2>Experience Requirements</h2>
          {analysis.experienceRequirements.length === 0 ? (
            <p className="section-empty">No experience requirements extracted.</p>
          ) : (
            <ul className="check-list">
              {analysis.experienceRequirements.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2>Required Qualifications</h2>
          {analysis.requiredQualifications.length === 0 ? (
            <p className="section-empty">No required qualifications extracted.</p>
          ) : (
            <ul className="check-list">
              {analysis.requiredQualifications.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="analysis-grid">
        <Card>
          <h2>Preferred Qualifications</h2>
          {analysis.preferredQualifications.length === 0 ? (
            <p className="section-empty">No preferred qualifications extracted.</p>
          ) : (
            <ul className="check-list">
              {analysis.preferredQualifications.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2>Certifications</h2>
          {analysis.certifications.length === 0 ? (
            <p className="section-empty">No certifications extracted.</p>
          ) : (
            <ul className="check-list">
              {analysis.certifications.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card>
        <h2>Skills</h2>
        <SkillGroup title="Required Skills" skills={analysis.requiredSkills} />
        <SkillGroup title="Preferred Skills" skills={analysis.preferredSkills} />
      </Card>

      <div className="analysis-grid">
        <Card>
          <h2>Responsibilities</h2>
          {analysis.responsibilities.length === 0 ? (
            <p className="section-empty">No responsibilities extracted.</p>
          ) : (
            <ul className="check-list">
              {analysis.responsibilities.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2>Keywords</h2>
          {analysis.keywords.length === 0 ? (
            <p className="section-empty">No keywords extracted.</p>
          ) : (
            <div className="skill-badges">
              {analysis.keywords.map((item) => (
                <Badge key={item} tone="info">
                  {item}
                </Badge>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="page-section">
        <Button to="/new-application" variant="secondary" size="sm">
          Analyze Another Job
        </Button>
      </div>
    </div>
  );
}

export default JobAnalysis;