export default function CoverLetterPreview({
  candidate,
  company,
  jobTitle,
  paragraphs,
}) {
  return (
    <article
      className="cover-letter-preview document-preview"
      aria-label={`Cover letter for ${jobTitle} at ${company}`}
    >
      <header className="cover-letter-header">
        <h2>Cover Letter</h2>
        <p>{candidate.fullName}</p>
        <p>
          {candidate.email} · {candidate.phone}
        </p>
      </header>

      <div className="cover-letter-body">
        <p>Dear Hiring Manager,</p>
        {paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
        <p>
          Sincerely,
          <br />
          {candidate.fullName}
        </p>
      </div>
    </article>
  );
}