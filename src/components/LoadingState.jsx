export default function LoadingState({
  message = 'Loading...',
  skeleton = false,
  skeletonRows = 4,
}) {
  if (skeleton) {
    return (
      <div className="loading-skeleton" role="status" aria-live="polite">
        {Array.from({ length: skeletonRows }).map((_, index) => (
          <div className="skeleton-line" key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="loading-state" role="status" aria-live="polite">
      <span className="loading-spinner" aria-hidden="true" />
      {message && <p>{message}</p>}
    </div>
  );
}