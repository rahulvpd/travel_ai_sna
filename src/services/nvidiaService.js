/**
 * NVIDIA Nemotron Service
 * Dedicated interface for SNA analysis using Llama-3.1-Nemotron-70B-Instruct.
 * Strictly for graph analysis, historical insights, and structured JSON output.
 */

import { aiService } from './api';
import { queryAI } from './aiOrchestrator'; // Fallback if NVIDIA key missing/fails

const NVIDIA_MODEL = import.meta.env.VITE_NVIDIA_MODEL || 'nvidia/nemotron-3-nano-30b-a3b';

/**
 * Direct query to NVIDIA Nemotron for unstructured text analysis
 * @param {string} prompt - The analysis prompt
 * @param {string} model - Optional model override
 * @param {Object} options - Optional request overrides
 * @returns {Promise<string>} - The generated text response
 */
export const queryNvidia = async (prompt, model = NVIDIA_MODEL, options = {}) => {
    try {
        const response = await aiService.nvidiaChat({
            prompt,
            model,
            temperature: options.temperature ?? 0.2,
            top_p: options.top_p ?? 1,
            max_tokens: options.max_tokens ?? 1024,
            reasoning_budget: options.reasoning_budget ?? 1024,
            enable_thinking: options.enable_thinking ?? true,
            extra_body: options.extra_body || {},
        });

        return response.data?.text || 'Analysis unavailable.';

    } catch (error) {
        console.error('❌ NVIDIA Service Failed:', error);
        const fallback = await queryAI(prompt + " (Analysis requested via fallback)");
        return fallback.text;
    }
};

/**
 * Structured query to NVIDIA Nemotron for JSON output
 * @param {string} prompt - The prompt requesting specific JSON schema
 * @param {string} model - Optional model override
 * @param {Object} options - Optional request overrides
 * @returns {Promise<Object>} - Parsed JSON response
 */
export const queryNvidiaJSON = async (prompt, model = NVIDIA_MODEL, options = {}) => {
    // Helper to extract JSON from markdown code blocks if present
    const cleanJSON = (text) => {
        try {
            // Remove markdown code blocks ```json ... ```
            const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
            const jsonString = jsonMatch ? jsonMatch[1] : text;
            return JSON.parse(jsonString);
        } catch (e) {
            console.error("JSON Parse Error:", e);
            return null;
        }
    };

    const jsonPrompt = `${prompt}\n\nIMPORTANT: Return ONLY valid JSON. No markdown formatting, no explanation text.`;

    try {
        const content = await queryNvidia(jsonPrompt, model, {
            temperature: options.temperature ?? 0.1,
            top_p: options.top_p ?? 1,
            max_tokens: options.max_tokens ?? 2048,
            reasoning_budget: options.reasoning_budget,
            enable_thinking: options.enable_thinking ?? false,
            extra_body: options.extra_body,
        });

        const parsed = cleanJSON(content);
        if (!parsed) throw new Error("Failed to parse JSON from NVIDIA response");

        return parsed;

    } catch (error) {
        console.error('❌ NVIDIA JSON Service Failed:', error);
        const fallback = await queryAI(jsonPrompt);
        return cleanJSON(fallback.text);
    }
};
