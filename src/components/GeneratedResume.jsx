import { getSafeHttpsUrl } from '../utils/urlValidation.js';
import './GeneratedResume.css';

function Section({ title, children }) {
  return (
    <section className="generated-resume-section">
      <h3>{title}</h3>
      {children}
    </section>
  );
}

export default function GeneratedResume({ resume }) {
  if (!resume) return null;

  const {
    contact,
    summary,
    skillGroups,
    experience,
    projects,
    education,
    certifications,
    achievements,
  } = resume;

  const linkLine = contact.links.filter(Boolean).join(' · ');

  return (
    <article className="generated-resume" aria-label="Tailored resume preview">
      <header className="generated-resume-header">
        <h2>{contact.fullName}</h2>
        <p className="generated-resume-contact">
          {[contact.email, contact.phone, contact.location].filter(Boolean).join(' · ')}
        </p>
        {linkLine && <p className="generated-resume-contact">{linkLine}</p>}
      </header>

      {summary && (
        <Section title="Professional Summary">
          <p>{summary}</p>
        </Section>
      )}

      {skillGroups.length > 0 && (
        <Section title="Skills">
          {skillGroups.map((group) => (
            <div key={group.label} className="generated-resume-skill-group">
              <h4>{group.label}</h4>
              <p>{group.items.join(' · ')}</p>
            </div>
          ))}
        </Section>
      )}

      {experience.length > 0 && (
        <Section title="Professional Experience">
          {experience.map((job, index) => (
            <div key={`${job.company}-${job.position}-${index}`} className="generated-resume-entry">
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
      )}

      {projects.length > 0 && (
        <Section title="Projects">
          {projects.map((project, index) => {
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
      )}

      {education.length > 0 && (
        <Section title="Education">
          {education.map((edu, index) => (
            <div key={`${edu.institution}-${index}`} className="generated-resume-entry">
              <div className="generated-resume-entry-header">
                <h4>
                  {[edu.qualification, edu.fieldOfStudy].filter(Boolean).join(', ')}
                </h4>
                <span className="generated-resume-dates">{edu.dates}</span>
              </div>
              <p className="generated-resume-subheader">
                {[edu.institution, edu.location].filter(Boolean).join(' · ')}
              </p>
              {edu.description && <p>{edu.description}</p>}
            </div>
          ))}
        </Section>
      )}

      {certifications.length > 0 && (
        <Section title="Certifications">
          <ul>
            {certifications.map((cert, index) => {
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
      )}

      {achievements.length > 0 && (
        <Section title="Achievements">
          {achievements.map((achievement, index) => (
            <div key={`${achievement.title}-${index}`} className="generated-resume-entry">
              <h4>{achievement.title}</h4>
              {achievement.description && <p>{achievement.description}</p>}
              {achievement.date && (
                <p className="generated-resume-muted">{achievement.date}</p>
              )}
            </div>
          ))}
        </Section>
      )}
    </article>
  );
}