// Hugging Face Inference API utility for text generation
// No API key required for some public models, but rate limits apply

const HF_API_URL = 'https://api-inference.huggingface.co/models/gpt2';

export async function generateHuggingFaceContent(messages) {
  // Combine messages into a single prompt
  const prompt = messages.join('\n');

  const response = await fetch(HF_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer YOUR_HF_API_KEY`, // Optional for higher limits
    },
    body: JSON.stringify({ inputs: prompt }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch from Hugging Face API');
  }

  const data = await response.json();
  // gpt2 returns [{ generated_text: ... }]
  return data[0]?.generated_text || 'No response from Hugging Face.';
}
