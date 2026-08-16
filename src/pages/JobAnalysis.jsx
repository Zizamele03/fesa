import { useNavigate } from 'react-router-dom';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import Badge from '../components/Badge.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { jobAnalysis } from '../data/demoData.js';

export default function JobAnalysis() {
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader
        title="Job Analysis"
        description={`${jobAnalysis.jobTitle} · ${jobAnalysis.company}`}
        actions={
          <Button onClick={() => navigate('/application-package')} size="lg">
            Generate Application
          </Button>
        }
      />

      <div className="demo-notice" role="note">
        Demonstration data only. Real analysis will appear here after Fesa’s AI
        analysis phase is implemented.
      </div>

      <div className="analysis-overview">
        <Card>
          <p className="stat-label">Overall match</p>
          <p className="match-value">{jobAnalysis.overallMatch}%</p>
          <div className="match-track">
            <div
              className="match-fill"
              style={{ width: `${jobAnalysis.overallMatch}%` }}
            />
          </div>
        </Card>
      </div>

      <div className="analysis-grid">
        <Card>
          <h2>Key Requirements</h2>
          <ul className="check-list">
            {jobAnalysis.keyRequirements.map((requirement) => (
              <li key={requirement}>{requirement}</li>
            ))}
          </ul>
        </Card>

        <Card>
          <h2>Matching Skills</h2>
          <div className="skill-badges">
            {jobAnalysis.matchingSkills.map((skill) => (
              <Badge key={skill} tone="success">
                {skill}
              </Badge>
            ))}
          </div>
        </Card>
      </div>

      <div className="analysis-grid">
        <Card>
          <h2>Missing or Unverified Requirements</h2>
          <ul className="warning-list">
            {jobAnalysis.missingOrUnverified.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Card>

        <Card>
          <h2>Relevant Experience</h2>
          {jobAnalysis.relevantExperience.map((item) => (
            <div className="experience-match" key={item.id}>
              <h3>{item.title}</h3>
              <p>{item.match}</p>
            </div>
          ))}
        </Card>
      </div>

      <Card>
        <h2>Important Keywords</h2>
        <div className="skill-badges">
          {jobAnalysis.importantKeywords.map((keyword) => (
            <Badge key={keyword} tone="info">
              {keyword}
            </Badge>
          ))}
        </div>
      </Card>
    </div>
  );
}