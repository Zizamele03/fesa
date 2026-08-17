export async function extractCareerProfile(resumeText) {
  const response = await fetch('/api/career-profile/extract', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ resumeText }),
  });

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error('Received an invalid response from the server.');
  }

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to build Career Profile.');
  }

  return data.profile;
}