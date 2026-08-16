export default function ResumePreview({ profile, company, jobTitle }) {
  const {
    personalInformation,
    professionalSummary,
    workExperience,
    education,
    projects,
    skills,
  } = profile;

  return (
    <article
      className="resume-preview document-preview"
      aria-label={`Tailored resume for ${jobTitle} at ${company}`}
    >
      <header className="resume-header">
        <h2>{personalInformation.fullName}</h2>
        <p className="resume-contact">
          {personalInformation.location} · {personalInformation.email} ·{' '}
          {personalInformation.phone}
          {personalInformation.linkedin ? ` · ${personalInformation.linkedin}` : ''}
        </p>
      </header>

      <section className="resume-section">
        <h3>Professional Summary</h3>
        <p>{professionalSummary}</p>
      </section>

      <section className="resume-section">
        <h3>Skills</h3>
        <div className="resume-skills">
          {skills.technical.map((skill) => (
            <span key={skill}>{skill}</span>
          ))}
        </div>
      </section>

      <section className="resume-section">
        <h3>Experience</h3>
        {workExperience.map((job) => (
          <div key={job.id}>
            <h4>
              {job.title} · {job.company}
            </h4>
            <p className="resume-muted">
              {job.location} | {job.dates}
            </p>
            <ul>
              {job.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="resume-section">
        <h3>Education</h3>
        {education.map((edu) => (
          <div key={edu.id}>
            <h4>
              {edu.degree} — {edu.institution}
            </h4>
            <p className="resume-muted">
              {edu.location} | {edu.year}
            </p>
            {edu.details && <p>{edu.details}</p>}
          </div>
        ))}
      </section>

      <section className="resume-section">
        <h3>Projects</h3>
        {projects.map((project) => (
          <div key={project.id}>
            <h4>{project.name}</h4>
            <p>{project.description}</p>
            <p className="resume-muted">{project.technologies.join(', ')}</p>
          </div>
        ))}
      </section>
    </article>
  );
}