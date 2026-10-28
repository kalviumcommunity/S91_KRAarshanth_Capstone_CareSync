import { ApiError } from './apiError.js';

export async function completeDepartmentSpecialty({ departmentName, prefix }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new ApiError(503, 'AI autocomplete is not configured. Set OPENAI_API_KEY on the server.');
  }

  let response;
  try {
    response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Write concise hospital department directory specialty text, at most 18 words. Complete the provided unfinished phrase when one exists; otherwise write a complete phrase. Describe services only, not diagnoses, treatment recommendations, or patient advice. Return only the suggested text.',
          },
          {
            role: 'user',
            content: `Department: ${departmentName}\nCurrent specialty text: ${prefix || '(empty)'}`,
          },
        ],
        max_tokens: 80,
        temperature: 0.3,
      }),
      signal: AbortSignal.timeout(20000),
    });
  } catch (error) {
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      throw new ApiError(504, 'The AI suggestion request timed out. Please try again.');
    }
    throw new ApiError(502, 'Could not reach the AI suggestion provider.');
  }

  if (!response.ok) {
    throw new ApiError(502, 'The AI suggestion provider rejected the request.');
  }

  let result;
  try {
    result = await response.json();
  } catch {
    throw new ApiError(502, 'The AI suggestion provider returned an invalid response.');
  }

  const suggestion = result.choices?.[0]?.message?.content?.trim();
  if (!suggestion || suggestion.length > 300) {
    throw new ApiError(502, 'The AI suggestion provider returned no usable suggestion.');
  }

  return suggestion;
}
