export default function PageHeader({ title, description, actions, children }) {
  return (
    <header className="page-header">
      <h1>{title}</h1>
      {description && <p>{description}</p>}
      {actions && <div className="page-header-actions">{actions}</div>}
      {children}
    </header>
  );
}