import Button from './Button.jsx';

export default function ErrorState({
  title = 'Something went wrong',
  message,
  retryLabel = 'Try again',
  onRetry,
}) {
  return (
    <div className="error-state" role="alert">
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  );
}