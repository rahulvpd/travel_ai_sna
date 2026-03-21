// src/services/sarvam.js — Expanded v2.0
// Sarvam AI — India's native Indic language AI
// Backward compatible: translateWithSarvam() signature unchanged

const SARVAM_BASE = 'https://api.sarvam.ai';
const getKey = () => import.meta.env.VITE_SARVAM_API_KEY;
const isKeyValid = () => {
    const k = getKey();
    return k && !k.includes('your_') && !k.toLowerCase().includes('placeholder');
};

// ── EXISTING FUNCTION — signature unchanged ───────────────────────────────
export async function translateWithSarvam(text, targetLang = 'ta-IN') {
    if (!isKeyValid()) return null;
    try {
        const res = await fetch(`${SARVAM_BASE}/translate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-subscription-key': getKey()
            },
            body: JSON.stringify({
                input: text,
                source_language_code: 'en-IN',
                target_language_code: targetLang,
                speaker_gender: 'Female',
                mode: 'formal',
                model: 'mayura:v1',
                enable_preprocessing: true
            })
        });
        if (!res.ok) return null;
        const data = await res.json();
        return data.translated_text || null;
    } catch { return null; }
}

// ── NEW: Translate with transliteration ──────────────────────────────────
export async function translateWithTransliteration(text) {
    if (!isKeyValid()) return { tamil: null, transliteration: null };
    try {
        const res = await fetch(`${SARVAM_BASE}/translate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-subscription-key': getKey()
            },
            body: JSON.stringify({
                input: text,
                source_language_code: 'en-IN',
                target_language_code: 'ta-IN',
                speaker_gender: 'Female',
                mode: 'formal',
                model: 'mayura:v1',
                enable_preprocessing: true
            })
        });
        if (!res.ok) return { tamil: null, transliteration: null };
        const data = await res.json();
        return {
            tamil: data.translated_text || null,
            transliteration: data.transliterated_text || null
        };
    } catch { return { tamil: null, transliteration: null }; }
}

// ── NEW: Text-to-Speech (Audio Guide) ────────────────────────────────────
export async function textToSpeechTamil(text) {
    if (!isKeyValid()) return null;
    try {
        const res = await fetch(`${SARVAM_BASE}/text-to-speech`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-subscription-key': getKey()
            },
            body: JSON.stringify({
                inputs: [text.slice(0, 500)], // Sarvam TTS 500-char limit per segment
                target_language_code: 'ta-IN',
                speaker: 'meera',             // Natural Chennai Tamil female voice
                pitch: 0,
                pace: 1.0,
                loudness: 1.5,
                speech_sample_rate: 22050,
                enable_preprocessing: true,
                model: 'bulbul:v1'
            })
        });
        if (!res.ok) return null;
        const data = await res.json();
        return data.audios?.[0] ? `data:audio/wav;base64,${data.audios[0]}` : null;
    } catch { return null; }
}

// ── NEW: Transliterate Tamil name to Roman ────────────────────────────────
export async function transliterateToRoman(tamilText) {
    if (!isKeyValid()) return null;
    try {
        const res = await fetch(`${SARVAM_BASE}/transliterate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-subscription-key': getKey()
            },
            body: JSON.stringify({
                input: tamilText,
                source_language_code: 'tam-Taml-IN',
                target_language_code: 'en-IN'
            })
        });
        if (!res.ok) return null;
        return (await res.json()).transliterated_text || null;
    } catch { return null; }
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
