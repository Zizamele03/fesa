import Button from './Button.jsx';

export default function EmptyState({
  title,
  description,
  actionLabel,
  actionTo,
  onAction,
}) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {actionLabel &&
        (actionTo ? (
          <Button to={actionTo} variant="secondary" size="sm">
            {actionLabel}
          </Button>
        ) : (
          <Button onClick={onAction} variant="secondary" size="sm">
            {actionLabel}
          </Button>
        ))}
    </div>
  );
}