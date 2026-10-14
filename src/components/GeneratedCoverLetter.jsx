import './GeneratedCoverLetter.css';

export default function GeneratedCoverLetter({ letter }) {
  if (!letter) return null;

  const { greeting, opening, body, closing, signoff } = letter;

  return (
    <article className="generated-cover-letter" aria-label="Cover letter preview">
      {greeting && <p className="cover-letter-greeting">{greeting}</p>}

      {opening && <p className="cover-letter-paragraph">{opening}</p>}

      {body.map((paragraph, index) => (
        <p key={index} className="cover-letter-paragraph">
          {paragraph}
        </p>
      ))}

      {closing && <p className="cover-letter-paragraph">{closing}</p>}

      {signoff && (
        <p className="cover-letter-signoff">
          {signoff.split('\n').map((line, i) => (
            <span key={i}>
              {line}
              {i < signoff.split('\n').length - 1 && <br />}
            </span>
          ))}
        </p>
      )}
    </article>
  );
}