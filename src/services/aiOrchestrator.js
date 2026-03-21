/**
 * Travel AI — Multi-AI Orchestrator Service
 * 7-Engine Chain: Gemini → Groq/Llama 4 Scout → Mistral → OpenRouter → Together AI → Cohere → HuggingFace
 * All results cached in localStorage for 24 hours.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_MODEL = import.meta.env.VITE_GROQ_MODEL || 'meta-llama/llama-4-scout-17b-16e-instruct';
// Added meta-llama/Meta-Llama-3-8B-Instruct as an alternative open-source model focus
const HF_API_URL = import.meta.env.VITE_HF_API_URL || 'https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct';

// ────────── CACHE LAYER ──────────
const getCache = (key) => {
    try {
        const raw = localStorage.getItem(`travelai_${key}`);
        if (raw) {
            const { value, ts } = JSON.parse(raw);
            if (Date.now() - ts < 24 * 60 * 60 * 1000) return value;
        }
    } catch (e) { console.error('Cache ignored', e); }
    return null;
};

const setCache = (key, value) => {
    try {
        localStorage.setItem(`travelai_${key}`, JSON.stringify({ value, ts: Date.now() }));
    } catch (e) { console.error('Cache set ignored', e); }
};

// ────────── ENGINE 1: GEMINI (Primary) ──────────
const queryGemini = async (prompt) => {
    if (!GEMINI_API_KEY) throw new Error('No Gemini API key');
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    return result.response.text();
};

// ────────── ENGINE 2: GROQ + LLAMA 4 SCOUT (Secondary) ──────────
const queryGroq = async (prompt) => {
    if (!GROQ_API_KEY) throw new Error('No Groq API key');
    const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
            model: GROQ_MODEL,
            messages: [
                {
                    role: 'system',
                    content: 'You are Travel AI, an expert Tamil Nadu tourism assistant. Always respond with accurate, real-world data. When asked for JSON, return ONLY valid JSON with no extra text.'
                },
                { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 2048,
        }),
    });
    if (!resp.ok) {
        const err = await resp.text();
        throw new Error(`Groq API error ${resp.status}: ${err}`);
    }
    const data = await resp.json();
    return data.choices?.[0]?.message?.content || '';
};

// ────────── ENGINE 3: HUGGINGFACE (Last-resort fallback) ──────────
const queryHuggingFace = async (prompt) => {
    const resp = await fetch(HF_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            inputs: `<s>[INST] ${prompt} [/INST]`,
            parameters: { max_new_tokens: 1024, temperature: 0.7 }
        }),
    });
    if (!resp.ok) throw new Error(`HuggingFace API error: ${resp.status}`);
    const data = await resp.json();
    return data[0]?.generated_text?.replace(/^<s>\[INST\].*?\[\/INST\]\s*/s, '') || '';
};

// ────────── ENGINE 4: MISTRAL AI (NEW) ──────────
const queryMistral = async (prompt) => {
    const key = import.meta.env.VITE_MISTRAL_API_KEY;
    if (!key || key.includes('your_') || key.trim() === '') throw new Error('Mistral key not configured');
    const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
        body: JSON.stringify({
            model: 'mistral-small-latest',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 1500
        })
    });
    if (!res.ok) throw new Error(`Mistral ${res.status}`);
    return (await res.json()).choices[0].message.content;
};

// ────────── ENGINE 5: OPENROUTER (NEW) ──────────
const queryOpenRouter = async (prompt) => {
    const key = import.meta.env.VITE_OPENROUTER_API_KEY;
    if (!key || key.includes('your_') || key.trim() === '') throw new Error('OpenRouter key not configured');
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`,
            'HTTP-Referer': 'https://travelai-tamilnadu.vercel.app',
            'X-Title': 'TravelAI Tamil Nadu'
        },
        body: JSON.stringify({
            model: import.meta.env.VITE_OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct:free',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 1500
        })
    });
    if (!res.ok) throw new Error(`OpenRouter ${res.status}`);
    return (await res.json()).choices[0].message.content;
};

// ────────── ENGINE 6: TOGETHER AI (NEW) ──────────
const queryTogether = async (prompt) => {
    const key = import.meta.env.VITE_TOGETHER_API_KEY;
    if (!key || key.includes('your_') || key.trim() === '') throw new Error('Together key not configured');
    const res = await fetch('https://api.together.xyz/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
        body: JSON.stringify({
            model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 1500,
            temperature: 0.7
        })
    });
    if (!res.ok) throw new Error(`Together ${res.status}`);
    return (await res.json()).choices[0].message.content;
};

// ────────── ENGINE 7: COHERE COMMAND R+ (NEW) ──────────
const queryCohere = async (prompt) => {
    const key = import.meta.env.VITE_COHERE_API_KEY;
    if (!key || key.includes('your_') || key.trim() === '') throw new Error('Cohere key not configured');
    const res = await fetch('https://api.cohere.com/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
        body: JSON.stringify({
            model: 'command-r-plus',
            message: prompt,
            max_tokens: 1500,
            temperature: 0.7
        })
    });
    if (!res.ok) throw new Error(`Cohere ${res.status}`);
    return (await res.json()).text;
};

// ────────── 7-ENGINE ORCHESTRATOR ──────────
/**
 * Queries AI using a 7-engine fallback chain:
 * Gemini → Groq/Llama 4 → Mistral → OpenRouter → Together AI → Cohere → HuggingFace
 * Returns: { text, engine } — the response and which engine answered
 */
export const queryAI = async (prompt) => {
    const engines = [
        { fn: queryGemini, name: 'Gemini 2.0 Flash' },
        { fn: queryGroq, name: 'Groq/Llama 4 Scout' },
        { fn: queryMistral, name: 'Mistral Small' },
        { fn: queryOpenRouter, name: 'OpenRouter/Llama 3.3 70B' },
        { fn: queryTogether, name: 'Together/Llama 3.3 70B' },
        { fn: queryCohere, name: 'Cohere Command R+' },
        { fn: queryHuggingFace, name: 'HuggingFace/Llama-3' },
    ];

    for (const engine of engines) {
        try {
            const result = await engine.fn(prompt);
            if (result && result.trim().length > 10) {
                console.log(`✅ AI Response from: ${engine.name}`);
                return { text: result, engine: engine.name };
            }
        } catch (err) {
            console.warn(`⚠️ [AI] ${engine.name} failed:`, err.message);
        }
    }

    throw new Error('All 7 AI engines are currently unavailable. Please try again.');
};

// ────────── MULTI-AI CONSENSUS (for critical decisions) ──────────
/**
 * Queries multiple engines and combines results for higher accuracy.
 * Used for critical data like safety info, pricing, etc.
 */
export const queryMultiAI = async (prompt) => {
    const results = [];

    // Try all engines in parallel
    const [geminiResult, groqResult] = await Promise.allSettled([
        queryGemini(prompt).catch(() => null),
        queryGroq(prompt).catch(() => null),
    ]);

    if (geminiResult.status === 'fulfilled' && geminiResult.value) {
        results.push({ text: geminiResult.value, engine: 'Gemini' });
    }
    if (groqResult.status === 'fulfilled' && groqResult.value) {
        results.push({ text: groqResult.value, engine: 'Groq/Llama 4' });
    }

    if (results.length === 0) {
        // Fallback to single engine
        return queryAI(prompt);
    }

    // Return the first valid result, with metadata about consensus
    return {
        text: results[0].text,
        engine: results.map(r => r.engine).join(' + '),
        consensus: results.length > 1,
        allResults: results,
    };
};

// ────────── SAFE JSON PARSER ──────────
const parseAIJSON = (text) => {
    if (!text) return null;
    try {
        let cleaned = typeof text === 'string' ? text : String(text);
        // Strip markdown code fences
        cleaned = cleaned.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
        // Try direct parse first (already clean JSON)
        try { return JSON.parse(cleaned); } catch { /* fall through */ }
        // Greedy match for the largest JSON structure
        const arrMatch = cleaned.match(/\[[\s\S]*\]/);
        const objMatch = cleaned.match(/\{[\s\S]*\}/);
        // Prefer array if function expects array (heuristic: if array found first)
        const arr = arrMatch ? arrMatch[0] : null;
        const obj = objMatch ? objMatch[0] : null;
        if (arr && (!obj || cleaned.indexOf('[') < cleaned.indexOf('{'))) {
            try { return JSON.parse(arr); } catch { /* fall through */ }
        }
        if (obj) {
            try { return JSON.parse(obj); } catch { /* fall through */ }
        }
        if (arr) {
            try { return JSON.parse(arr); } catch { /* fall through */ }
        }
    } catch { /* all attempts failed */ }
    return null;
};

// ══════════════════════════════════════════════
//  TAMIL NADU — LIVING CIVILISATION CONTEXT
//  Sources: tn.gov.in | tamilnaduarchives.tn.gov.in | britannica.com/place/Tamil-Nadu
//           Established fact: Tamil Nadu is one of the world's oldest living civilisations.
//           The Tamil language has 2,500+ years of continuous literary tradition.
// ══════════════════════════════════════════════
const TN_CIVILISATION_CONTEXT = `
Tamil Nadu is not just a state — it is one of Earth's oldest LIVING civilisations, with an unbroken cultural heritage spanning over 2,500 years.

KEY HISTORICAL FACTS (use these for accuracy):
- Three great ancient dynasties shaped Tamil Nadu: the Chera, Chola, and Pandya kingdoms (referenced in Greek literature 4th century BCE)
- The Chola Empire (300 BCE – 1279 CE) was one of the longest-ruling empires in world history and sent naval expeditions to Southeast Asia
- Tamil is one of the world's oldest classical languages, with a literary tradition beginning around 300 BCE (Sangam period)
- Tamil Nadu covers 130,058 sq km (50,216 sq miles), bounded by Andhra Pradesh (N), Karnataka (NW), Kerala (W), and the Bay of Bengal (E)
- Population composition: predominantly Tamil-speaking Dravidians, descendants of pre-Aryan inhabitants of India
- UNESCO World Heritage Sites: Great Living Chola Temples (Brihadeeswarar, Gangaikonda Cholapuram, Airavatesvara), and Group of Monuments at Mahabalipuram
- Climate: Tropical. Chennai peaks ~38°C (May-June); Nilgiris as cool as 5°C (Jan). Monsoon Oct-Dec
- Major rivers: Kaveri (Cauvery), Vaigai, Palar, Tambraparni, Ponnaiyar
- Official government reference: https://www.tn.gov.in
- Archives reference: https://tamilnaduarchives.tn.gov.in
- District URLs: https://[district].nic.in (e.g. chennai.nic.in, madurai.nic.in)

NARRATIVE TONE: "Tamil Nadu is a living civilisation" — temples built 1000 years ago still receive daily worshippers, classical art forms like Bharatanatyam and Carnatic music are still composed and performed, and ancient languages like Tamil are still spoken by 75 million people.
`;

// ══════════════════════════════════════════════
//  CHENNAI TOURISM CONTEXT
// ══════════════════════════════════════════════
const CHENNAI_TOURISM_CONTEXT = `
Chennai (formerly Madras, founded 1639) is the cultural capital of South India. It is a city where 2000-year-old Tamil traditions coexist with colonial history and modern metropolitan life.

MANDATORY DATA REQUIREMENTS:
1. ACCURACY FIRST: All historical dates, architectural details, and cultural facts MUST be 100% accurate. Do not hallucinate dates or facts.
2. BRIEF & IMPACTFUL EXPLANATIONS: Keep explanations of places and history brief but highly informative. Focus on the core historical reason for significance (e.g., "Madras High Court: Built 1892, 2nd largest judicial complex in the world").

KEY TOURISM FACTS (use these as ground truth):
- History: Kapaleeshwarar Temple (Pallava origins, 7th century), Fort St. George (First British fort in India, 1644), Royapuram Station (Oldest operational in India, 1856). 
- Major Festivals: Pongal (January - Tamil harvest festival), Margazhi Music Season (World's largest classical music festival, mid-Nov to mid-Jan).
- Key Heritage Sites: San Thome Basilica (Built over tomb of an Apostle), Government Museum (World's greatest Chola Bronze collection, est 1851), Armenian Church (1712).
- Beaches: Marina Beach (13km long, second-longest urban beach globally).
- Cultural Hubs: Kalakshetra Foundation (Bharatanatyam academy), DakshinaChitra (Living history museum of South Indian architecture).
- Culinary Scene: Authentic Filter Coffee served in dabarah, Ghee Podi Idli, expansive street food scenes at Sowcarpet and Marina.

IMPORTANT: Strictly focus on providing rich, historically accurate, and brief insights into Chennai's tourism, culture, places, and festivals. Avoid generic itineraries; deliver deep knowledge.
`;

// ══════════════════════════════════════════════
//  PUBLIC API — AI-Powered Features
// ══════════════════════════════════════════════

/**
 * Get rich historical narration for a Tamil Nadu place
 */
export const getPlaceHistory = async (placeName) => {
    const cacheKey = `history_v2_${placeName.toLowerCase().replace(/\s+/g, '_')}`;
    const cached = getCache(cacheKey);
    if (cached) return cached;

    const prompt = `${TN_CIVILISATION_CONTEXT}

You are a Tamil Nadu historian and archaeologist. Using the verified facts above and your knowledge of Tamil Nadu's living civilisation, write a compelling, FACTUALLY ACCURATE history of "${placeName}".

Your narrative must:
- Reference the relevant dynasty (Chola, Pandya, Pallava, Chera, Nayak, Vijayanagara, British colonial) with correct dates
- Frame this place as part of Tamil Nadu's UNBROKEN civilisational continuum — not as a dead relic but as a living heritage
- Include how this place is still culturally/spiritually active today
- Cite verifiable numeric facts (year built, height in feet, area in acres, visitor count per year, number of sculptures, etc.)
- Reference official source if available: https://${placeName.toLowerCase().split(' ')[0]}.nic.in or https://tamilnaduarchives.tn.gov.in

Return ONLY valid JSON:
{
  "title": "The Living History of ${placeName}",
  "era": "Approximate founding era (e.g. '7th century CE, Pallava Dynasty')",
  "dynasties": ["Chola", "Pandya"],
  "civilisationalSignificance": "One sentence on why this place matters to Tamil civilisation today",
  "timeline": [
    { "year": "300 BCE", "event": "Specific verifiable event" },
    { "year": "1010 CE", "event": "Another specific event" },
    { "year": "Present", "event": "How it lives on today" }
  ],
  "narrative": "4 richly written paragraphs framing ${placeName} as a living civilisation site — its origins, peak glory, colonial encounter, and vibrant present",
  "funFact": "One astonishing, verifiable fact most visitors don't know",
  "livingTradition": "What ancient tradition or practice is STILL alive here today",
  "numberInsights": [
    { "label": "Year Founded", "value": 800, "prefix": "", "suffix": " CE" },
    { "label": "Height", "value": 216, "prefix": "", "suffix": " ft" },
    { "label": "Annual Pilgrims", "value": 15000, "prefix": "", "suffix": "K+" }
  ]
}`;

    try {
        const { text } = await queryAI(prompt);
        const data = parseAIJSON(text);
        if (data) {
            setCache(cacheKey, data);
            return data;
        }
    } catch (err) {
        console.warn('AI Error in getPlaceHistory:', err.message);
    }
    return { title: `The Living History of ${placeName}`, narrative: "Information temporarily unavailable due to API limits. Please try again later.", timeline: [], dynasties: [], funFact: '', livingTradition: '', numberInsights: [] };
};

/**
 * Get unique selling points and hidden facts about a place
 */
export const getPlaceUniqueness = async (placeName) => {
    const cacheKey = `unique_v2_${placeName.toLowerCase().replace(/\s+/g, '_')}`;
    const cached = getCache(cacheKey);
    if (cached) return cached;

    const prompt = `${TN_CIVILISATION_CONTEXT}

You are a Tamil Nadu cultural anthropologist and travel writer. Describe what makes "${placeName}" absolutely UNIQUE as part of Tamil Nadu's living civilisation.

Go beyond surface tourism. Explore:
- What makes this place irreplaceable in Tamil civilisational identity?
- What living traditions, crafts, music, or rituals are unique to this place and nowhere else?
- What architectural, ecological, or geological fact makes it extraordinary?
- What does a LOCAL experience here that a tourist never sees?
- What food, language dialect, or folk art is specific to this place?

Return ONLY valid JSON:
{
  "tagline": "A powerful one-liner capturing the soul of ${placeName}",
  "civilisationalRole": "This place's unique role in Tamil Nadu's 2500-year civilisation",
  "uniqueFeatures": [
    { "title": "Feature name", "description": "Deep, specific reason it's unique to Tamil culture", "icon": "relevant emoji" }
  ],
  "livingCulture": "A specific tradition, craft, or ritual still practiced here that has survived 500+ years",
  "bestKeptSecrets": ["Specific verifiable local secret 1", "Secret 2", "Secret 3"],
  "photographySpots": ["Specific spot with description", "Another spot"],
  "bestExperience": "The single most transformative experience only possible at ${placeName}",
  "localTip": "Hyper-specific insider tip known only to locals",
  "whatBooksWontTellYou": "A fascinating fact about ${placeName} not found in regular travel guides"
}`;

    try {
        const { text } = await queryAI(prompt);
        const data = parseAIJSON(text);
        if (data) {
            setCache(cacheKey, data);
            return data;
        }
    } catch (err) {
        console.warn('AI Error in getPlaceUniqueness:', err.message);
    }
    return { tagline: `Discover ${placeName}`, uniqueFeatures: [], bestKeptSecrets: [], photographySpots: [], bestExperience: '', localTip: '', livingCulture: '', whatBooksWontTellYou: '' };
};

/**
 * Get AI-curated trending places across Tamil Nadu
 */
export const getTrendingPlaces = async () => {
    const cacheKey = 'trending_places_v4';
    const cached = getCache(cacheKey);
    if (cached) return cached;

    const month = new Date().toLocaleString('en-US', { month: 'long' });
    const prompt = `${TN_CIVILISATION_CONTEXT}

You are a Tamil Nadu tourism analyst and cultural expert. It is currently ${month} 2026. Identify the TOP 12 TRENDING travel destinations across Tamil Nadu right now — places where ancient civilisation and modern travel energy intersect.

For each place, consider:
- Current season alignment (Tamil Nadu climate zones vary greatly)
- Active festivals or temple events in ${month} (Pongal, Panguni Uthiram, Chithirai, etc.)
- Living civilisation angle — what ancient tradition is happening RIGHT NOW at this place?
- Social media buzz from Tamil Nadu travel communities
- UNESCO or government heritage significance
Only include REAL Tamil Nadu places. Reference district NIC sites for accuracy.

Return ONLY valid JSON array:
[
  {
    "name": "Specific place name (not just district)",
    "district": "District Name",
    "region": "North|South|Central|West|East",
    "trendReason": "Specific reason grounded in ${month} 2026 — festival, season, or cultural event",
    "category": "Festival|Nature|Heritage|Beach|Hill Station|Spiritual|Adventure",
    "civilisationalAngle": "What ancient living tradition is active here right now",
    "summary": "2 evocative sentences about this place as a living civilisation site",
    "bestFor": "Who should visit and why",
    "rating": 4.5
  }
]`;

    try {
        const { text } = await queryAI(prompt);
        const data = parseAIJSON(text);
        if (data && Array.isArray(data)) {
            setCache(cacheKey, data);
            return data;
        }
    } catch (err) {
        console.warn('AI Error in getTrendingPlaces:', err.message);
    }
    return [];
};

/**
 * Get hidden gems for a specific district
 */
export const getHiddenGems = async (districtName) => {
    const cacheKey = `gems_v2_${districtName.toLowerCase().replace(/\s+/g, '_')}`;
    const cached = getCache(cacheKey);
    if (cached) return cached;

    const districtNicUrl = `https://${districtName.toLowerCase().replace(/\s+/g, '')}.nic.in/tourism/`;

    const prompt = `${TN_CIVILISATION_CONTEXT}

You are a Tamil Nadu local historian and off-beat travel expert. Uncover 6 HIDDEN GEM locations in "${districtName}" district — places that reveal Tamil Nadu's living civilisation but are off every tourist trail.

Official district reference URL for accuracy: ${districtNicUrl}

Your gems must include a MIX of:
- At least 1 forgotten/lesser-known historical site (inscription, fort ruin, cave, etc.)
- At least 1 nature spot (waterfall, forest trail, lake)
- At least 1 living cultural experience (village craft, local festival, ancient ritual still practiced)
- At least 1 food/market experience unique to ${districtName}

Only include REAL, VERIFIABLE places. No fabrication. Cross-reference with Tamil Nadu Archives (tamilnaduarchives.tn.gov.in) for historical sites.

Return ONLY valid JSON array:
[
  {
    "name": "Real verified place name",
    "type": "Inscription|Fort|Waterfall|Temple|Viewpoint|Village|Lake|Cave|Forest|Beach|Market|Festival",
    "description": "Why this place is a window into Tamil Nadu's living civilisation",
    "historicalNote": "Brief historical/cultural context if applicable",
    "howToReach": "Specific directions from ${districtName} town",
    "bestTime": "Best month/time to visit and why",
    "crowd": "Low|Medium|High",
    "tip": "Hyper-local insider tip that changes the experience"
  }
]`;

    try {
        const { text } = await queryAI(prompt);
        const data = parseAIJSON(text);
        if (data && Array.isArray(data)) {
            setCache(cacheKey, data);
            return data;
        }
    } catch (err) {
        console.warn('AI Error in getHiddenGems:', err.message);
    }
    return [];
};

/**
 * Real-time weather data using Open-Meteo (free, no API key needed)
 */
export const getWeather = async (lat, lng) => {
    const cacheKey = `weather_${lat}_${lng}`;
    const cached = getCache(cacheKey);
    if (cached) return cached;

    try {
        const resp = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=Asia/Kolkata&forecast_days=5`
        );
        const data = await resp.json();
        const result = {
            current: {
                temp: Math.round(data.current?.temperature_2m || 28),
                humidity: data.current?.relative_humidity_2m || 60,
                windSpeed: Math.round(data.current?.wind_speed_10m || 10),
                code: data.current?.weather_code || 0,
                condition: weatherCodeToText(data.current?.weather_code || 0),
            },
            forecast: (data.daily?.time || []).map((date, i) => ({
                date,
                maxTemp: Math.round(data.daily.temperature_2m_max[i]),
                minTemp: Math.round(data.daily.temperature_2m_min[i]),
                condition: weatherCodeToText(data.daily.weather_code[i]),
            })),
        };
        setCache(cacheKey, result);
        return result;
    } catch {
        return { current: { temp: 28, humidity: 60, condition: 'Sunny', windSpeed: 10 }, forecast: [] };
    }
};

const weatherCodeToText = (code) => {
    if (code <= 1) return 'Clear ☀️';
    if (code <= 3) return 'Cloudy ⛅';
    if (code <= 48) return 'Foggy 🌫️';
    if (code <= 57) return 'Drizzle 🌦️';
    if (code <= 67) return 'Rainy 🌧️';
    if (code <= 77) return 'Snowy ❄️';
    if (code <= 82) return 'Showers 🌧️';
    if (code <= 99) return 'Thunderstorm ⛈️';
    return 'Clear ☀️';
};

/**
 * AI-powered smart packing list based on destination + duration + season
 */
export const getSmartPackingList = async (destination, duration, month) => {
    const cacheKey = `packing_${destination}_${duration}_${month}`;
    const cached = getCache(cacheKey);
    if (cached) return cached;

    const prompt = `Generate a practical packing list for a ${duration}-day trip to ${destination}, Tamil Nadu in ${month}.

Consider the weather, local culture (temple dress codes), activities, and terrain.

Return ONLY valid JSON:
{
  "essentials": ["Item 1", "Item 2"],
  "clothing": ["Item 1", "Item 2"],
  "electronics": ["Item 1", "Item 2"],
  "health": ["Item 1", "Item 2"],
  "culturalEtiquette": ["Tip 1", "Tip 2"],
  "doNotForget": ["Critical item 1", "Critical item 2"]
}`;

    try {
        const { text } = await queryAI(prompt);
        const data = parseAIJSON(text);
        if (data) {
            setCache(cacheKey, data);
            return data;
        }
    } catch (err) {
        console.warn('AI Error in getSmartPackingList:', err.message);
    }
    return {
        essentials: ['Passport/ID', 'Cash & Cards', 'Phone charger'],
        clothing: ['Light cotton clothes', 'Comfortable shoes', 'Scarf for temples'],
        electronics: ['Phone', 'Power bank', 'Camera'],
        health: ['Sunscreen', 'Water bottle', 'First aid kit'],
        culturalEtiquette: ['Cover shoulders in temples', 'Remove shoes before entering'],
        doNotForget: ['Travel insurance', 'Copies of documents']
    };
};

/**
 * AI-powered budget estimator
 */
export const estimateBudget = async (destination, duration, travelers, budgetLevel) => {
    const cacheKey = `budget_${destination}_${duration}_${travelers}_${budgetLevel}`;
    const cached = getCache(cacheKey);
    if (cached) return cached;

    const prompt = `Estimate a realistic travel budget for ${travelers} person(s) visiting ${destination}, Tamil Nadu for ${duration} days on a ${budgetLevel} budget.

Use REAL prices for Tamil Nadu in INR (₹). Include accommodation, food, transport, entry fees, and shopping.

Return ONLY valid JSON:
{
  "totalEstimate": "₹X,XXX - ₹X,XXX",
  "perDay": "₹X,XXX",
  "breakdown": {
    "accommodation": { "amount": "₹X,XXX/night", "suggestion": "Hotel name or type" },
    "food": { "amount": "₹XXX-XXX/day", "suggestion": "Where to eat" },
    "transport": { "amount": "₹X,XXX", "suggestion": "How to get around" },
    "activities": { "amount": "₹XXX", "suggestion": "Entry fees and tours" },
    "shopping": { "amount": "₹X,XXX", "suggestion": "What to buy" }
  },
  "moneySavingTips": ["Tip 1", "Tip 2", "Tip 3"]
}`;

    try {
        const { text } = await queryAI(prompt);
        const data = parseAIJSON(text);
        if (data) {
            setCache(cacheKey, data);
            return data;
        }
    } catch (err) {
        console.warn('AI Error in estimateBudget:', err.message);
    }
    return null;
};

/**
 * Tamil phrase translator for common travel phrases
 */
export const translateToTamil = async (phrases) => {
    const cacheKey = `tamil_${phrases.join('_').substring(0, 50)}`;
    const cached = getCache(cacheKey);
    if (cached) return cached;

    const prompt = `Translate these common travel phrases to Tamil with pronunciation guide:
${phrases.map((p, i) => `${i + 1}. ${p}`).join('\n')}

Return ONLY valid JSON array:
[
  { "english": "Hello", "tamil": "வணக்கம்", "pronunciation": "Vanakkam", "usage": "Greeting anyone" }
]`;

    try {
        const { text } = await queryAI(prompt);
        const data = parseAIJSON(text);
        if (data && Array.isArray(data)) {
            setCache(cacheKey, data);
            return data;
        }
    } catch (err) {
        console.warn('AI Error in translateToTamil:', err.message);
    }
    return phrases.map(p => ({ english: p, tamil: '', pronunciation: '', usage: '' }));
};

/**
 * Get highly specific Chennai tourism insights (Culture, Places, Festivals)
 */
export const getChennaiTourismInsights = async (focusArea = 'culture') => {
    const cacheKey = `chennai_insights_${focusArea}`;
    const cached = getCache(cacheKey);
    if (cached) return cached;

    const prompt = `${CHENNAI_TOURISM_CONTEXT}

You are an expert guide to Chennai tourism and history. Provide rich, highly accurate insights about Chennai focusing specifically on "${focusArea}".
Do not provide a day-by-day itinerary or budget. Focus purely on accurate locations, cultural significance, and history.

Return ONLY valid JSON:
{
  "focus": "${focusArea}",
  "title": "A captivating title about Chennai ${focusArea}",
  "highlights": [
    { "name": "Exact Name of Place/Festival/Food", "description": "Brief but highly accurate historical/cultural explanation (max 2 sentences)", "type": "Temple|Architecture|Festival|Food|Art" }
  ],
  "localSecret": "A rigorously accurate lesser-known historical fact or hidden gem",
  "bestTimeToExperience": "Specific month or time of day"
}`;

    try {
        const { text } = await queryAI(prompt);
        const data = parseAIJSON(text);
        if (data) {
            setCache(cacheKey, data);
            return data;
        }
    } catch (err) {
        console.warn('AI Error in getChennaiTourismInsights:', err.message);
    }
    return null;
};

export default {
    queryAI,
    queryMultiAI,
    getPlaceHistory,
    getPlaceUniqueness,
    getTrendingPlaces,
    getHiddenGems,
    getWeather,
    getSmartPackingList,
    estimateBudget,
    translateToTamil,
    getChennaiTourismInsights,
};
