export async function generateResume({ profile, jobAnalysis, matchAnalysis }) {
  let response;

  try {
    response = await fetch('/api/resume/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile, jobAnalysis, matchAnalysis }),
    });
  } catch {
    const networkError = new Error(
      'Could not reach the server. Please check your connection and try again.',
    );
    networkError.retryable = true;
    throw networkError;
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error('Received an invalid response from the server.');
  }

  if (!response.ok || !data.success) {
    const error = new Error(
      data.error || 'Failed to generate resume.',
    );
    error.retryable = Boolean(data.retryable);
    error.status = response.status;
    throw error;
  }

  return data.resume;
}