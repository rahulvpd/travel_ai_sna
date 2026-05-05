// Gemini API utility — completely proxied through the backend for security
// API key is stored server-side, not in the browser.

import { aiService } from '../services/api';

export async function generateGeminiContent(messages) {
  // All AI generation now flows through the secure backend proxy
  try {
    const response = await aiService.geminiGenerate(messages);
    if (response.data && response.data.text) {
      return {
        candidates: [{
          content: {
            parts: [{ text: response.data.text }]
          }
        }]
      };
    }
    throw new Error('Invalid response from AI backend');
  } catch (backendError) {
    console.error('AI Service Error:', backendError.message);
    throw new Error('AI service is currently unavailable. Please try again later.');
  }
}
