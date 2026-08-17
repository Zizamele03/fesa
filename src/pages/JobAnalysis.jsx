import { useLocation } from 'react-router-dom';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import Badge from '../components/Badge.jsx';
import PageHeader from '../components/PageHeader.jsx';
import EmptyState from '../components/EmptyState.jsx';

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
  const analysis = location.state?.analysis;

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

  return (
    <div>
      <PageHeader
        title="Job Analysis"
        description={`${job.title} · ${job.company}`}
      />

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