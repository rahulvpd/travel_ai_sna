// src/services/sarvam.js — Expanded v2.0 (Secured Proxy Version)
// Sarvam AI — India's native Indic language AI
// Backward compatible: signatures unchanged, but routes through backend

import { sarvamService } from './api';

export const SUPPORTED_LANGUAGES = {
    'ta-IN': { name: 'Tamil', native: 'தமிழ்', script: 'Tamil' },
    'hi-IN': { name: 'Hindi', native: 'हिन्दी', script: 'Devanagari' },
    'te-IN': { name: 'Telugu', native: 'తెలుగు', script: 'Telugu' },
    'kn-IN': { name: 'Kannada', native: 'ಕನ್ನಡ', script: 'Kannada' },
    'ml-IN': { name: 'Malayalam', native: 'മലയാളം', script: 'Malayalam' },
    'bn-IN': { name: 'Bengali', native: 'বাংলা', script: 'Bengali' },
    'mr-IN': { name: 'Marathi', native: 'मराठी', script: 'Devanagari' },
    'gu-IN': { name: 'Gujarati', native: 'ગુજરાતી', script: 'Gujarati' },
};

// ── EXISTING FUNCTION — signature unchanged ───────────────────────────────
export async function translateWithSarvam(text, targetLang = 'ta-IN') {
    try {
        const response = await sarvamService.translate(text, targetLang);
        return response.data?.translated || null;
    } catch {
        return null;
    }
}

// ── NEW: Translate with transliteration ──────────────────────────────────
export async function translateWithTransliteration(text) {
    try {
        const response = await sarvamService.translate(text, 'ta-IN');
        return {
            tamil: response.data?.translated || null,
            transliteration: response.data?.transliteration || null
        };
    } catch {
        return { tamil: null, transliteration: null };
    }
}

// ── NEW: Text-to-Speech (Audio Guide) ────────────────────────────────────
export async function textToSpeechTamil(text) {
    try {
        const response = await sarvamService.textToSpeech(text, 'ta-IN');
        return response.data?.audio_url || null;
    } catch {
        return null;
    }
}

// ── NEW: Transliterate Tamil name to Roman ────────────────────────────────
export async function transliterateToRoman(tamilText) {
    try {
        const response = await sarvamService.transliterate(tamilText);
        return response.data?.transliterated_text || null;
    } catch {
        return null;
    }
}

// ── NEW: Batch translate place names array ───────────────────────────────
export async function batchTranslatePlaceNames(names) {
    const results = await Promise.allSettled(names.map(n => translateWithTransliteration(n)));
    return names.reduce((acc, name, i) => {
        acc[name] = results[i].status === 'fulfilled'
            ? results[i].value
            : { tamil: null, transliteration: null };
        return acc;
    }, {});
}

// ── MULTI-LANGUAGE EXPANSION ─────────────────────────────────────────────

/**
 * Translate text to any supported Indic language.
 * @param {string} text - English text to translate
 * @param {string} targetLang - Language code (e.g., 'hi-IN', 'te-IN')
 * @returns {Promise<{translated: string|null, transliteration: string|null}>}
 */
export async function translateToLanguage(text, targetLang = 'ta-IN') {
    if (!SUPPORTED_LANGUAGES[targetLang]) {
        console.warn(`Unsupported language: ${targetLang}`);
        return { translated: null, transliteration: null };
    }

    try {
        const response = await sarvamService.translate(text, targetLang);
        return {
            translated: response.data?.translated || null,
            transliteration: response.data?.transliteration || null
        };
    } catch {
        return { translated: null, transliteration: null };
    }
}

/**
 * Text-to-Speech for any supported language.
 * @param {string} text - Text to speak
 * @param {string} langCode - Language code
 * @returns {Promise<string|null>} - Base64 audio data URL
 */
export async function textToSpeechMultiLang(text, langCode = 'ta-IN') {
    try {
        const response = await sarvamService.textToSpeech(text, langCode);
        return response.data?.audio_url || null;
    } catch {
        return null;
    }
}

/**
 * Batch translate an array of texts to multiple languages at once.
 * @param {string[]} texts - Array of English texts
 * @param {string[]} languages - Array of target language codes
 * @returns {Promise<Object>} - { 'hi-IN': { 'text1': 'translated', ... }, ... }
 */
export async function batchMultiLangTranslate(texts, languages = ['ta-IN', 'hi-IN']) {
    const result = {};
    for (const lang of languages) {
        const translations = await Promise.allSettled(
            texts.map(t => translateToLanguage(t, lang))
        );
        result[lang] = {};
        texts.forEach((text, i) => {
            result[lang][text] = translations[i].status === 'fulfilled'
                ? translations[i].value
                : { translated: null, transliteration: null };
        });
    }
    return result;
}
