import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import Badge from '../components/Badge.jsx';
import PageHeader from '../components/PageHeader.jsx';
import {
  dashboardStats,
  recentApplications,
  careerProfile,
} from '../data/demoData.js';

export default function Dashboard() {
  const firstName = careerProfile.personalInformation.fullName.split(' ')[0];

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="Track your applications, keep your Career Profile ready, and create tailored application packages for the jobs you want."
        actions={
          <>
            <Button to="/new-application" size="lg">
              Create Application
            </Button>
            <Button to="/career-profile" variant="secondary" size="lg">
              Career Profile
            </Button>
          </>
        }
      />

      <section className="page-section">
        <div className="dashboard-grid">
          <Card>
            <p className="stat-label">Career Profile completion</p>
            <p className="stat-value">{dashboardStats.careerProfileCompletion}%</p>
          </Card>
          <Card>
            <p className="stat-label">Applications created</p>
            <p className="stat-value">{dashboardStats.applicationsCreated}</p>
          </Card>
          <Card>
            <p className="stat-label">Recent applications</p>
            <p className="stat-value">{dashboardStats.recentApplicationsCount}</p>
          </Card>
        </div>
      </section>

      <section className="page-section">
        <h2>How Fesa Works</h2>
        <ol className="how-it-works">
          <li className="step">
            <h3>Build your Career Profile</h3>
            <p>
              Keep one reusable profile with your real experience, education,
              skills, and achievements.
            </p>
          </li>
          <li className="step">
            <h3>Paste a job description</h3>
            <p>Provide the role and job description you want to apply for.</p>
          </li>
          <li className="step">
            <h3>Get a tailored application</h3>
            <p>
              Receive a tailored resume and cover letter grounded in your Career
              Profile.
            </p>
          </li>
        </ol>
      </section>

      <section className="page-section">
        <h2>Recent Applications</h2>
        <div className="recent-list">
          {recentApplications.map((application) => (
            <div className="recent-item" key={application.id}>
              <div>
                <p className="recent-title">{application.jobTitle}</p>
                <p className="recent-meta">
                  {application.company} · {application.updatedAt}
                </p>
              </div>
              <Badge tone={application.statusTone}>{application.status}</Badge>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}