export async function generateCoverLetter({
  profile,
  jobAnalysis,
  matchAnalysis,
  company,
  jobTitle,
  tone,
  length,
}) {
  let response;
  try {
    response = await fetch('/api/cover-letter/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profile,
        jobAnalysis,
        matchAnalysis,
        company,
        jobTitle,
        tone,
        length,
      }),
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
    const error = new Error(data.error || 'Failed to generate cover letter.');
    error.retryable = Boolean(data.retryable);
    error.status = response.status;
    throw error;
  }

  return data.coverLetter;
}