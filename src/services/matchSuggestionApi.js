export async function fetchAiMatchSuggestions({ requirements, evidence }) {
  let response;
  try {
    response = await fetch('/api/match/suggest-relationships', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requirements, evidence }),
    });
  } catch {
    const err = new Error('Could not reach the server.');
    err.retryable = true;
    throw err;
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error('Invalid response from server.');
  }

  if (!response.ok) {
    throw new Error(data.error || 'Match assistance request failed.');
  }

  return {
    suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
    aiAvailable: data.aiAvailable !== false,
  };
}