import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import Badge from '../components/Badge.jsx';
import PageHeader from '../components/PageHeader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import './MatchAnalysis.css';

function relationshipTone(relationship) {
  const map = {
    EXACT_MATCH: 'success',
    ALIAS_MATCH: 'success',
    STRONG_CONTEXT_MATCH: 'success',
    PARTIAL_MATCH: 'warning',
    TRANSFERABLE: 'warning',
    RELATED_BUT_DIFFERENT: 'warning',
    MISSING: 'danger',
    UNVERIFIED: 'neutral',
  };
  return map[relationship] || 'neutral';
}

function labelize(value) {
  return String(value || '').replace(/_/g, ' ').toLowerCase();
}

function RequirementItem({ item }) {
  return (
    <div className="requirement-item">
      <div className="requirement-item-header">
        <div>
          <span className="requirement-text">{item.requirement}</span>
          <div className="requirement-meta">
            {item.relationship && (
              <Badge tone={relationshipTone(item.relationship)}>
                {labelize(item.relationship)}
              </Badge>
            )}
            {item.importance && (
              <span>
                {item.importance === 'required' ? 'Required' : 'Preferred'}
              </span>
            )}
            {item.category && <span>{item.category}</span>}
            {item.aiAssisted && <Badge tone="info">AI-assisted</Badge>}
          </div>
        </div>
        <span className="requirement-score">{item.score}%</span>
      </div>

      {item.explanation && (
        <p className="requirement-explanation">{item.explanation}</p>
      )}

      {item.evidence?.length > 0 && (
        <div className="requirement-evidence">
          {item.evidence.map((evidence, index) => (
            <div key={`${evidence.sourceId}-${index}`} className="evidence-item">
              <strong>{evidence.sourceTitle}</strong>
              <p>{evidence.text}</p>
              <span className="evidence-source">Source: {evidence.sourceType}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RequirementList({ items, emptyText = 'Nothing to show.' }) {
  if (!items || items.length === 0) {
    return <p className="section-empty">{emptyText}</p>;
  }
  return (
    <div className="match-list">
      {items.map((item, index) => (
        <Card key={`${item.requirement}-${index}`}>
          <RequirementItem item={item} />
        </Card>
      ))}
    </div>
  );
}

function AiStatusBanner({ matchAnalysis }) {
  const status = matchAnalysis.aiStatus;
  if (!status) return null;

  if (status === 'used') {
    return (
      <div className="profile-status">
        <Card>
          <p>
            AI-assisted terminology matching was applied to{' '}
            {matchAnalysis.aiAssistedCount} requirement
            {matchAnalysis.aiAssistedCount === 1 ? '' : 's'}. These are
            additional <em>related</em> relationships, not confirmed matches.
            All underlying evidence comes from your Career Profile.
          </p>
        </Card>
      </div>
    );
  }

  if (status === 'unavailable') {
    return (
      <div className="profile-status">
        <Card>
          <p>
            AI-assisted terminology matching was unavailable. The results below
            are the deterministic evidence-based comparison of your Career
            Profile against the job requirements.
          </p>
        </Card>
      </div>
    );
  }

  if (status === 'no_improvement') {
    return (
      <div className="profile-status">
        <Card>
          <p>
            AI-assisted terminology matching found no additional related
            relationships beyond what deterministic matching already identified.
          </p>
        </Card>
      </div>
    );
  }

  return null;
}

export default function MatchAnalysis() {
  const location = useLocation();
  const navigate = useNavigate();
  const matchAnalysis = location.state?.matchAnalysis;
  const jobAnalysis = location.state?.jobAnalysis;
  const applicationId = location.state?.applicationId;

  if (!matchAnalysis || !jobAnalysis) {
    return (
      <div>
        <PageHeader
          title="Match Analysis"
          description="Compare your Career Profile with a Job Analysis."
        />
        <EmptyState
          title="No match analysis available"
          description="Run a match from the Job Analysis page first."
          actionLabel="Create Application"
          actionTo="/new-application"
        />
      </div>
    );
  }

  const handleGeneratePackage = () => {
    const url = applicationId
      ? `/application-package?applicationId=${applicationId}`
      : '/application-package';
    navigate(url);
  };

  return (
    <div>
      <PageHeader
        title="Match Analysis"
        description={`${jobAnalysis.job.title || 'Job'} at ${jobAnalysis.job.company || 'Company'}`}
        actions={
          <Button onClick={handleGeneratePackage} size="lg">
            Generate Application Package
          </Button>
        }
      />

      <AiStatusBanner matchAnalysis={matchAnalysis} />

      <div className="analysis-overview">
        <Card>
          <p className="stat-label">Overall Match</p>
          <p className="match-value">{matchAnalysis.overallScore}%</p>
          <div className="match-track">
            <div
              className="match-fill"
              style={{ width: `${matchAnalysis.overallScore}%` }}
            />
          </div>
        </Card>
      </div>

      <div className="analysis-grid">
        <Card>
          <h2>Breakdown</h2>
          <div className="breakdown-list">
            {Object.entries(matchAnalysis.breakdown).map(([key, value]) => (
              <div className="breakdown-item" key={key}>
                <span>{key}</span>
                <span>{value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="page-section">
        <h2>Strong Matches</h2>
        <RequirementList items={matchAnalysis.strongMatches} />
      </div>

      <div className="page-section">
        <h2>Related &amp; Transferable</h2>
        <RequirementList items={matchAnalysis.relatedOrTransferable || []} />
      </div>

      <div className="page-section">
        <h2>All Requirements</h2>
        <RequirementList items={matchAnalysis.requirements} />
      </div>

      <div className="analysis-grid">
        <Card>
          <h2>Missing Requirements</h2>
          <RequirementList items={matchAnalysis.missingRequirements} />
        </Card>

        <Card>
          <h2>Partial Matches</h2>
          <RequirementList items={matchAnalysis.partialMatches} />
        </Card>
      </div>

      <div className="page-section">
        <h2>Unverified Requirements</h2>
        <RequirementList items={matchAnalysis.unverifiedRequirements} />
      </div>

      <div className="page-section">
        <Button to="/job-analysis" variant="secondary" size="sm">
          Back to Job Analysis
        </Button>
      </div>
    </div>
  );
}