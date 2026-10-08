const DEFAULT_ENDPOINT = 'https://api.openai.com/v1';
const DEFAULT_MODEL = 'gpt-4o-mini';

const MAX_RETRIES_429 = 2;
const MAX_RETRIES_5XX = 3;
const BASE_DELAY_429_MS = 15000;
const BASE_DELAY_5XX_MS = 1500;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isGeminiEndpoint(endpoint) {
  return endpoint.includes('generativelanguage.googleapis.com');
}

async function callProvider({ endpoint, apiKey, model, messages, maxTokens }) {
  const requestBody = {
    model,
    messages,
    temperature: 0,
    max_tokens: maxTokens,
  };

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
    const error = new Error(
      `AI provider responded with status ${response.status}`,
    );
    error.status = response.status;
    error.body = errorText;
    error.retryAfter = response.headers.get('retry-after');
    throw error;
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;

  if (!content || typeof content !== 'string') {
    throw new Error('AI provider returned no usable content.');
  }

  return content;
}

async function callWithRetries({ endpoint, apiKey, model, messages, maxTokens }) {
  let attempt429 = 0;
  let attempt5xx = 0;

  while (true) {
    try {
      return await callProvider({
        endpoint,
        apiKey,
        model,
        messages,
        maxTokens,
      });
    } catch (error) {
      // 429 — quota/rate-limit
      if (error.status === 429) {
        attempt429 += 1;

        // Log the FULL reason ONCE so the user can see what happened.
        if (attempt429 === 1) {
          console.error('--- 429 QUOTA ERROR FROM PROVIDER ---');
          console.error('Body:', error.body);
          console.error('Retry-After:', error.retryAfter || 'not provided');
          console.error('-------------------------------------');
        }

        if (attempt429 > MAX_RETRIES_429) throw error;

        const retryAfter = Number(error.retryAfter) * 1000;
        const delay = retryAfter > 0
          ? retryAfter
          : BASE_DELAY_429_MS * attempt429;

        console.warn(
          `Quota/rate limit hit (attempt ${attempt429}/${MAX_RETRIES_429}). Waiting ${delay}ms...`,
        );
        await sleep(delay);
        continue;
      }

      // 5xx — transient
      if (error.status >= 500 && error.status < 600) {
        attempt5xx += 1;
        if (attempt5xx > MAX_RETRIES_5XX) throw error;

        const delay = BASE_DELAY_5XX_MS * 2 ** (attempt5xx - 1);
        console.warn(
          `Provider error ${error.status} (attempt ${attempt5xx}/${MAX_RETRIES_5XX}). Retrying in ${delay}ms...`,
        );
        await sleep(delay);
        continue;
      }

      throw error;
    }
  }
}

export async function chatCompletion({ messages, maxTokens = 4000 }) {
  const apiKey = process.env.AI_API_KEY;
  const rawEndpoint = process.env.AI_API_ENDPOINT || DEFAULT_ENDPOINT;
  const model = process.env.AI_MODEL || DEFAULT_MODEL;
  const fallbackModel = process.env.AI_FALLBACK_MODEL || '';

  if (!apiKey) {
    throw new Error('AI_API_KEY is not configured on the server.');
  }

  const endpoint = rawEndpoint.replace(/\/$/, '');

  try {
    return await callWithRetries({
      endpoint,
      apiKey,
      model,
      messages,
      maxTokens,
    });
  } catch (primaryError) {
    if (fallbackModel && primaryError.status === 429) {
      console.warn(`Primary model ${model} hit 429. Trying fallback ${fallbackModel}...`);
      try {
        return await callWithRetries({
          endpoint,
          apiKey,
          model: fallbackModel,
          messages,
          maxTokens,
        });
      } catch (fallbackError) {
        const wrapped = new Error('AI provider is temporarily unavailable.');
        wrapped.status = fallbackError.status;
        throw wrapped;
      }
    }
    const wrapped = new Error('AI provider is temporarily unavailable.');
    wrapped.status = primaryError.status;
    throw wrapped;
  }
}