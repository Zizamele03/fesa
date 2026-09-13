import { useLocation } from 'react-router-dom';
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

function RequirementItem({ item }) {
  return (
    <div className="requirement-item">
      <div className="requirement-item-header">
        <div>
          <span className="requirement-text">{item.requirement}</span>
          <div className="requirement-meta">
            {item.relationship && (
              <Badge tone={relationshipTone(item.relationship)}>
                {item.relationship.replace(/_/g, ' ').toLowerCase()}
              </Badge>
            )}
            {item.importance && (
              <span>
                {item.importance === 'required' ? 'Required' : 'Preferred'}
              </span>
            )}
            {item.category && <span>{item.category}</span>}
          </div>
        </div>
        <span className="requirement-score">{item.score}%</span>
      </div>

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

export default function MatchAnalysis() {
  const location = useLocation();
  const matchAnalysis = location.state?.matchAnalysis;
  const jobAnalysis = location.state?.jobAnalysis;

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

  return (
    <div>
      <PageHeader
        title="Match Analysis"
        description={`${jobAnalysis.job.title || 'Job'} at ${jobAnalysis.job.company || 'Company'}`}
      />

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
        {matchAnalysis.strongMatches.length === 0 ? (
          <p className="section-empty">No strong matches identified.</p>
        ) : (
          <div className="match-list">
            {matchAnalysis.strongMatches.map((item, index) => (
              <Card key={`strong-${item.requirement}-${index}`}>
                <RequirementItem item={item} />
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="page-section">
        <h2>Requirements</h2>
        {matchAnalysis.requirements.length === 0 ? (
          <p className="section-empty">No requirements found.</p>
        ) : (
          <div className="match-list">
            {matchAnalysis.requirements.map((item, index) => (
              <Card key={`req-${item.requirement}-${index}`}>
                <RequirementItem item={item} />
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="analysis-grid">
        <Card>
          <h2>Missing Requirements</h2>
          {matchAnalysis.missingRequirements.length === 0 ? (
            <p className="section-empty">No missing requirements.</p>
          ) : (
            <div className="match-list">
              {matchAnalysis.missingRequirements.map((item, index) => (
                <RequirementItem key={`missing-${item.requirement}-${index}`} item={item} />
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h2>Partial Matches</h2>
          {matchAnalysis.partialMatches.length === 0 ? (
            <p className="section-empty">No partial matches.</p>
          ) : (
            <div className="match-list">
              {matchAnalysis.partialMatches.map((item, index) => (
                <RequirementItem key={`partial-${item.requirement}-${index}`} item={item} />
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="page-section">
        <h2>Unverified Requirements</h2>
        {matchAnalysis.unverifiedRequirements.length === 0 ? (
          <p className="section-empty">No unverified requirements.</p>
        ) : (
          <div className="match-list">
            {matchAnalysis.unverifiedRequirements.map((item, index) => (
              <RequirementItem key={`unverified-${item.requirement}-${index}`} item={item} />
            ))}
          </div>
        )}
      </div>

      <div className="page-section">
        <Button to="/job-analysis" variant="secondary" size="sm">
          Back to Job Analysis
        </Button>
      </div>
    </div>
  );
}