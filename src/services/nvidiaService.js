/**
 * NVIDIA Nemotron Service
 * Dedicated interface for SNA analysis using Llama-3.1-Nemotron-70B-Instruct.
 * Strictly for graph analysis, historical insights, and structured JSON output.
 */

import { queryAI } from './aiOrchestrator'; // Fallback if NVIDIA key missing/fails

const NVIDIA_API_KEY = import.meta.env.VITE_NVIDIA_API_KEY;
const NVIDIA_MODEL = import.meta.env.VITE_NVIDIA_MODEL || 'nvidia/llama-3.1-nemotron-70b-instruct';
const NVIDIA_ENDPOINT = 'https://integrate.api.nvidia.com/v1/chat/completions';

/**
 * Direct query to NVIDIA Nemotron for unstructured text analysis
 * @param {string} prompt - The analysis prompt
 * @param {string} model - Optional model override
 * @returns {Promise<string>} - The generated text response
 */
export const queryNvidia = async (prompt, model = NVIDIA_MODEL) => {
    // 1. Fallback Check: If no key, route to general AI orchestrator
    if (!NVIDIA_API_KEY) {
        console.warn('⚠️ NVIDIA API Key missing. Fallback to General AI.');
        const fallback = await queryAI(prompt);
        return fallback.text;
    }

    try {
        // 2. Direct API Call
        const response = await fetch(NVIDIA_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${NVIDIA_API_KEY}`
            },
            body: JSON.stringify({
                model: model,
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.2, // Low temp for analytical precision
                top_p: 1,
                max_tokens: 1024,
            })
        });

        if (!response.ok) {
            throw new Error(`NVIDIA API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || "Analysis unavailable.";

    } catch (error) {
        console.error('❌ NVIDIA Service Failed:', error);
        // 3. Fallback on Failure
        const fallback = await queryAI(prompt + " (Analysis requested via fallback)");
        return fallback.text;
    }
};

/**
 * Structured query to NVIDIA Nemotron for JSON output
 * @param {string} prompt - The prompt requesting specific JSON schema
 * @param {string} model - Optional model override
 * @returns {Promise<Object>} - Parsed JSON response
 */
export const queryNvidiaJSON = async (prompt, model = NVIDIA_MODEL) => {
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

    // 1. Fallback Check
    if (!NVIDIA_API_KEY) {
        console.warn('⚠️ NVIDIA API Key missing for JSON. Fallback to General AI.');
        const fallback = await queryAI(jsonPrompt);
        return cleanJSON(fallback.text);
    }

    try {
        // 2. Direct API Call
        const response = await fetch(NVIDIA_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${NVIDIA_API_KEY}`
            },
            body: JSON.stringify({
                model: model,
                messages: [{ role: 'user', content: jsonPrompt }],
                temperature: 0.1, // Very low temp for strict JSON
                top_p: 1,
                max_tokens: 2048,
            })
        });

        if (!response.ok) {
            throw new Error(`NVIDIA API JSON Error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;
        
        const parsed = cleanJSON(content);
        if (!parsed) throw new Error("Failed to parse JSON from NVIDIA response");
        
        return parsed;

    } catch (error) {
        console.error('❌ NVIDIA JSON Service Failed:', error);
        // 3. Fallback
        const fallback = await queryAI(jsonPrompt);
        return cleanJSON(fallback.text);
    }
};
