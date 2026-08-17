export async function analyzeJobDescription({ company, title, jobDescription }) {
  const response = await fetch('/api/job-analysis/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ company, title, jobDescription }),
  });

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error('Received an invalid response from the server.');
  }

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to analyze job description.');
  }

  return data.analysis;
}