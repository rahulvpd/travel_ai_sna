// Gemini API utility for making requests
// You need to set your Gemini API key in an environment variable or config file

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export async function generateGeminiContent(messages) {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not set. Please add VITE_GEMINI_API_KEY to your .env file.');
  }

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: messages.map((msg) => ({ text: msg }))
        }
      ]
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch from Gemini API');
  }

  const data = await response.json();
  return data;
}
