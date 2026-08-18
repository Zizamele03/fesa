import { useEffect, useState } from 'react';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import Badge from '../components/Badge.jsx';
import PageHeader from '../components/PageHeader.jsx';
import LoadingState from '../components/LoadingState.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { loadProfile } from '../services/careerProfileStore.js';
import { listApplications } from '../services/applicationStore.js';

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [storageError, setStorageError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadDashboardData = async () => {
      const [profileResult, applicationsResult] = await Promise.allSettled([
        loadProfile(),
        listApplications(),
      ]);

      if (!isMounted) return;

      setProfile(profileResult.status === 'fulfilled' ? profileResult.value : null);
      setApplications(
        applicationsResult.status === 'fulfilled' ? applicationsResult.value : [],
      );

      if (
        profileResult.status === 'rejected' ||
        applicationsResult.status === 'rejected'
      ) {
        setStorageError('Some saved data could not be loaded.');
      }

      setIsLoading(false);
    };

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div>
        <PageHeader
          title="Dashboard"
          description="Track your applications, keep your Career Profile ready, and create tailored application packages."
        />
        <LoadingState message="Loading Dashboard..." />
      </div>
    );
  }

  const firstName = profile?.personal?.fullName?.trim().split(' ')[0] || 'there';
  const careerProfileCompletion = profile ? 100 : 0;
  const applicationsCreated = applications.length;
  const recentApplicationsCount = Math.min(applications.length, 5);

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

      {storageError && <p className="form-error">{storageError}</p>}

      <section className="page-section">
        <div className="dashboard-grid">
          <Card>
            <p className="stat-label">Career Profile completion</p>
            <p className="stat-value">{careerProfileCompletion}%</p>
          </Card>
          <Card>
            <p className="stat-label">Applications created</p>
            <p className="stat-value">{applicationsCreated}</p>
          </Card>
          <Card>
            <p className="stat-label">Recent applications</p>
            <p className="stat-value">{recentApplicationsCount}</p>
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
        {applications.length === 0 ? (
          <EmptyState
            title="No applications yet"
            description="Create an application and analyze a job description to see it here."
            actionLabel="Create Application"
            actionTo="/new-application"
          />
        ) : (
          <div className="recent-list">
            {applications.slice(0, 5).map((application) => (
              <div className="recent-item" key={application.id}>
                <div>
                  <p className="recent-title">
                    {application.jobTitle || 'Untitled role'}
                  </p>
                  <p className="recent-meta">
                    {application.company || 'Unknown company'} ·{' '}
                    {new Date(application.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge tone={application.jobAnalysis ? 'success' : 'neutral'}>
                  {application.jobAnalysis ? 'Analyzed' : 'Created'}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}