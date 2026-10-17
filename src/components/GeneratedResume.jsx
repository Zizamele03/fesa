import { getSafeHttpsUrl } from '../utils/urlValidation.js';
import { getOrderedSections, getSectionLabel } from '../utils/resumeSectionOrder.js';
import './GeneratedResume.css';

function Section({ title, children }) {
  return (
    <section className="generated-resume-section">
      <h3>{title}</h3>
      {children}
    </section>
  );
}

function SummarySection({ resume }) {
  return (
    <Section title={getSectionLabel('summary')}>
      <p>{resume.summary}</p>
    </Section>
  );
}

function SkillsSection({ resume }) {
  return (
    <Section title={getSectionLabel('skills')}>
      {resume.skillGroups.map((group) => (
        <div key={group.label} className="generated-resume-skill-group">
          <h4>{group.label}</h4>
          <p>{group.items.join(' · ')}</p>
        </div>
      ))}
    </Section>
  );
}

function ExperienceSection({ resume }) {
  return (
    <Section title={getSectionLabel('experience')}>
      {resume.experience.map((job, index) => (
        <div
          key={`${job.company}-${job.position}-${index}`}
          className="generated-resume-entry"
        >
          <div className="generated-resume-entry-header">
            <h4>{job.position}</h4>
            <span className="generated-resume-dates">{job.dates}</span>
          </div>
          <p className="generated-resume-subheader">
            {[job.company, job.location].filter(Boolean).join(' · ')}
          </p>
          {job.bullets.length > 0 && (
            <ul>
              {job.bullets.map((bullet, i) => (
                <li key={i}>{bullet}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </Section>
  );
}

function EducationSection({ resume }) {
  return (
    <Section title={getSectionLabel('education')}>
      {resume.education.map((edu, index) => (
        <div key={`${edu.institution}-${index}`} className="generated-resume-entry">
          <div className="generated-resume-entry-header">
            <h4>{[edu.qualification, edu.fieldOfStudy].filter(Boolean).join(', ')}</h4>
            <span className="generated-resume-dates">{edu.dates}</span>
          </div>
          <p className="generated-resume-subheader">
            {[edu.institution, edu.location].filter(Boolean).join(' · ')}
          </p>
          {edu.description && <p>{edu.description}</p>}
        </div>
      ))}
    </Section>
  );
}

function ProjectsSection({ resume }) {
  return (
    <Section title={getSectionLabel('projects')}>
      {resume.projects.map((project, index) => {
        const safeUrl = getSafeHttpsUrl(project.url);
        return (
          <div key={`${project.name}-${index}`} className="generated-resume-entry">
            <h4>{project.name}</h4>
            {project.description && <p>{project.description}</p>}
            {project.technologies.length > 0 && (
              <p className="generated-resume-muted">
                {project.technologies.join(' · ')}
              </p>
            )}
            {safeUrl && (
              <p className="generated-resume-muted">
                <a
                  href={safeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="generated-resume-link"
                >
                  {safeUrl}
                </a>
              </p>
            )}
            {!safeUrl && project.url && (
              <p className="generated-resume-muted">{project.url}</p>
            )}
          </div>
        );
      })}
    </Section>
  );
}

function CertificationsSection({ resume }) {
  return (
    <Section title={getSectionLabel('certifications')}>
      <ul>
        {resume.certifications.map((cert, index) => {
          const safeUrl = getSafeHttpsUrl(cert.url);
          return (
            <li key={`${cert.name}-${index}`}>
              {safeUrl ? (
                <a
                  href={safeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="generated-resume-link"
                >
                  {cert.name}
                </a>
              ) : (
                cert.name
              )}
              {cert.issuer ? ` — ${cert.issuer}` : ''}
              {cert.date ? ` (${cert.date})` : ''}
            </li>
          );
        })}
      </ul>
    </Section>
  );
}

function AchievementsSection({ resume }) {
  return (
    <Section title={getSectionLabel('achievements')}>
      {resume.achievements.map((achievement, index) => (
        <div key={`${achievement.title}-${index}`} className="generated-resume-entry">
          <h4>{achievement.title}</h4>
          {achievement.description && <p>{achievement.description}</p>}
          {achievement.date && (
            <p className="generated-resume-muted">{achievement.date}</p>
          )}
        </div>
      ))}
    </Section>
  );
}

function ReferencesSection({ resume }) {
  return (
    <Section title={getSectionLabel('references')}>
      {resume.references.map((ref, index) => (
        <div key={`${ref.name}-${index}`} className="generated-resume-entry">
          <h4>{ref.name}</h4>
          {(ref.title || ref.organization) && (
            <p className="generated-resume-subheader">
              {[ref.title, ref.organization].filter(Boolean).join(' · ')}
            </p>
          )}
          {ref.relationship && (
            <p className="generated-resume-muted">
              Relationship: {ref.relationship}
            </p>
          )}
          {ref.email && (
            <p className="generated-resume-muted">Email: {ref.email}</p>
          )}
          {ref.phone && (
            <p className="generated-resume-muted">Phone: {ref.phone}</p>
          )}
          {ref.notes && (
            <p className="generated-resume-muted">{ref.notes}</p>
          )}
        </div>
      ))}
    </Section>
  );
}

const SECTION_RENDERERS = {
  summary: SummarySection,
  skills: SkillsSection,
  experience: ExperienceSection,
  education: EducationSection,
  projects: ProjectsSection,
  certifications: CertificationsSection,
  achievements: AchievementsSection,
  references: ReferencesSection,
};

export default function GeneratedResume({ resume, profile }) {
  if (!resume) return null;

  const { contact } = resume;
  const orderedSections = getOrderedSections(resume, profile);
  const linkLine = (contact.links || []).filter(Boolean).join(' · ');

  return (
    <article className="generated-resume" aria-label="Tailored resume preview">
      <header className="generated-resume-header">
        <h2>{contact.fullName}</h2>
        <p className="generated-resume-contact">
          {[contact.email, contact.phone, contact.location]
            .filter(Boolean)
            .join(' · ')}
        </p>
        {linkLine && <p className="generated-resume-contact">{linkLine}</p>}
      </header>

      {orderedSections.map((section) => {
        const Renderer = SECTION_RENDERERS[section];
        return Renderer ? <Renderer key={section} resume={resume} /> : null;
      })}
    </article>
  );
}