import Button from '../components/Button.jsx';
import SectionCard from '../components/SectionCard.jsx';
import Badge from '../components/Badge.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { careerProfile } from '../data/demoData.js';

export default function CareerProfile() {
  const {
    personalInformation,
    professionalSummary,
    education,
    workExperience,
    projects,
    skills,
    certifications,
    achievements,
  } = careerProfile;

  return (
    <div>
      <PageHeader
        title="Career Profile"
        description="Your reusable professional profile. Fesa uses only the information you provide to tailor resumes and cover letters."
      />

      <div className="upload-area">
        <div>
          <h2>Upload Resume</h2>
          <p>Use an existing resume to quickly populate your Career Profile.</p>
        </div>
        <Button variant="secondary">Browse Files</Button>
      </div>

      <SectionCard
        title="Personal Information"
        action={
          <Button variant="ghost" size="sm">
            Edit
          </Button>
        }
      >
        <dl className="profile-details">
          <div>
            <dt>Full name</dt>
            <dd>{personalInformation.fullName}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{personalInformation.email}</dd>
          </div>
          <div>
            <dt>Phone</dt>
            <dd>{personalInformation.phone}</dd>
          </div>
          <div>
            <dt>Location</dt>
            <dd>{personalInformation.location}</dd>
          </div>
          <div>
            <dt>LinkedIn</dt>
            <dd>{personalInformation.linkedin}</dd>
          </div>
        </dl>
      </SectionCard>

      <SectionCard
        title="Professional Summary"
        action={
          <Button variant="ghost" size="sm">
            Edit
          </Button>
        }
      >
        <p>{professionalSummary}</p>
      </SectionCard>

      <SectionCard
        title="Education"
        action={
          <Button variant="ghost" size="sm">
            Edit
          </Button>
        }
      >
        {education.map((edu) => (
          <div key={edu.id} className="section-item">
            <h3>
              {edu.degree} — {edu.institution}
            </h3>
            <p>
              {edu.location} | {edu.year}
            </p>
            {edu.details && <p>{edu.details}</p>}
          </div>
        ))}
      </SectionCard>

      <SectionCard
        title="Work Experience"
        action={
          <Button variant="ghost" size="sm">
            Edit
          </Button>
        }
      >
        {workExperience.map((job) => (
          <div key={job.id} className="section-item">
            <h3>
              {job.title} · {job.company}
            </h3>
            <p>
              {job.location} | {job.dates}
            </p>
            <ul>
              {job.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </div>
        ))}
      </SectionCard>

      <SectionCard
        title="Projects"
        action={
          <Button variant="ghost" size="sm">
            Edit
          </Button>
        }
      >
        {projects.map((project) => (
          <div key={project.id} className="section-item">
            <h3>{project.name}</h3>
            <p>{project.description}</p>
            <p className="section-muted">{project.technologies.join(', ')}</p>
          </div>
        ))}
      </SectionCard>

      <SectionCard
        title="Skills"
        action={
          <Button variant="ghost" size="sm">
            Edit
          </Button>
        }
      >
        <div className="skill-group">
          <h3>Technical</h3>
          <div className="skill-badges">
            {skills.technical.map((skill) => (
              <Badge key={skill} tone="info">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
        <div className="skill-group">
          <h3>Soft Skills</h3>
          <div className="skill-badges">
            {skills.soft.map((skill) => (
              <Badge key={skill} tone="neutral">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Certifications"
        action={
          <Button variant="ghost" size="sm">
            Edit
          </Button>
        }
      >
        {certifications.map((cert) => (
          <div key={cert.id} className="section-item">
            <h3>{cert.name}</h3>
            <p>
              {cert.issuer} · {cert.year}
            </p>
          </div>
        ))}
      </SectionCard>

      <SectionCard
        title="Achievements"
        action={
          <Button variant="ghost" size="sm">
            Edit
          </Button>
        }
      >
        {achievements.map((achievement) => (
          <div key={achievement.id} className="section-item">
            <h3>{achievement.title}</h3>
            <p>{achievement.description}</p>
            <p className="section-muted">{achievement.year}</p>
          </div>
        ))}
      </SectionCard>
    </div>
  );
}