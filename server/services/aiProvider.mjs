const DEFAULT_ENDPOINT = 'https://api.openai.com/v1';
const DEFAULT_MODEL = 'gpt-4o-mini';

function isGeminiEndpoint(endpoint) {
  return endpoint.includes('generativelanguage.googleapis.com');
}

export async function chatCompletion({ messages, maxTokens = 16000 }) {
  const apiKey = process.env.AI_API_KEY;
  const rawEndpoint = process.env.AI_API_ENDPOINT || DEFAULT_ENDPOINT;
  const model = process.env.AI_MODEL || DEFAULT_MODEL;

  if (!apiKey) {
    throw new Error('AI_API_KEY is not configured on the server.');
  }

  // Remove trailing slash from the endpoint to avoid double slashes.
  const endpoint = rawEndpoint.replace(/\/$/, '');

  const requestBody = {
    model,
    messages,
    temperature: 0,
    max_tokens: maxTokens,
  };

  // Gemini’s OpenAI-compatible endpoint sometimes ignores or mishandles
  // response_format, which can cause the model to return bullet lists.
  if (!isGeminiEndpoint(endpoint)) {
    requestBody.response_format = { type: 'json_object' };
  }

  const response = await fetch(`${endpoint}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(
      `AI provider responded with status ${response.status}: ${errorText.slice(0, 200)}`,
    );
    throw new Error(`AI provider responded with status ${response.status}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;

  if (!content || typeof content !== 'string') {
    throw new Error('AI provider returned no usable content.');
  }

  return content;
}