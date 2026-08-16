export default function SectionCard({ title, action, className = '', children }) {
  return (
    <section className={`section-card ${className}`.trim()}>
      <div className="section-card-header">
        <h2>{title}</h2>
        {action}
      </div>
      <div className="section-card-body">{children}</div>
    </section>
  );
}