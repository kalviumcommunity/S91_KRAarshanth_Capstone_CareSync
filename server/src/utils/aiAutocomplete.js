import { ApiError } from './apiError.js';

const systemInstruction = 'Write concise hospital department directory specialty text, at most 18 words. Complete the provided unfinished phrase when one exists; otherwise write a complete phrase. Describe services only, not diagnoses, treatment recommendations, or patient advice. Return only the suggested text.';

export async function completeDepartmentSpecialty({ departmentName, prefix }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new ApiError(503, 'AI autocomplete is not configured. Set GEMINI_API_KEY on the server.');
  }

  const model = process.env.GEMINI_MODEL || 'gemini-flash-latest';
  let response;
  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents: [{
            parts: [{
              text: `Department: ${departmentName}\nCurrent specialty text: ${prefix || '(empty)'}`,
            }],
          }],
          generationConfig: { maxOutputTokens: 80, temperature: 0.3 },
        }),
        signal: AbortSignal.timeout(20000),
      },
    );
  } catch (error) {
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      throw new ApiError(504, 'The AI suggestion request timed out. Please try again.');
    }
    throw new ApiError(502, 'Could not reach the Gemini suggestion provider.');
  }

  if (!response.ok) {
    let providerError;
    try {
      providerError = (await response.json()).error;
    } catch {
      providerError = undefined;
    }
    const providerMessage = typeof providerError?.message === 'string'
      ? providerError.message.toLowerCase()
      : '';
    const providerStatus = providerError?.status;

    if (
      [400, 401, 403].includes(response.status)
      && (providerMessage.includes('api key') || providerStatus === 'API_KEY_INVALID')
    ) {
      throw new ApiError(502, 'Gemini rejected the server API key. Check GEMINI_API_KEY in Render.');
    }
    if (response.status === 403) {
      throw new ApiError(502, 'Gemini denied access. Check that the Generative Language API is enabled and the key is allowed to use it.');
    }
    if (response.status === 429) {
      throw new ApiError(502, 'Gemini quota or rate limit reached. Check the project quota and try again later.');
    }
    if (response.status === 404) {
      throw new ApiError(502, 'The configured Gemini model is unavailable. Check GEMINI_MODEL in Render.');
    }
    throw new ApiError(502, 'The Gemini suggestion provider rejected the request.');
  }

  let result;
  try {
    result = await response.json();
  } catch {
    throw new ApiError(502, 'The Gemini suggestion provider returned an invalid response.');
  }

  const parts = result.candidates?.[0]?.content?.parts;
  const suggestion = Array.isArray(parts) ? parts
    .map((part) => part.text)
    .filter((text) => typeof text === 'string')
    .join('')
    .trim() : '';
  if (!suggestion || suggestion.length > 300) {
    throw new ApiError(502, 'The Gemini suggestion provider returned no usable suggestion.');
  }

  return suggestion;
}
