import httpx
import os
import re
import logging
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

class AIOrchestrator:
    GEMINI_API_KEY = os.getenv("VITE_GEMINI_API_KEY") or os.getenv("GEMINI_API_KEY")
    GROQ_API_KEY = os.getenv("VITE_GROQ_API_KEY") or os.getenv("GROQ_API_KEY")
    GROQ_MODEL = os.getenv("VITE_GROQ_MODEL", "meta-llama/llama-4-scout-17b-16e-instruct")
    MISTRAL_API_KEY = os.getenv("VITE_MISTRAL_API_KEY", "")
    OPENROUTER_API_KEY = os.getenv("VITE_OPENROUTER_API_KEY", "")
    OPENROUTER_MODEL = os.getenv("VITE_OPENROUTER_MODEL", "meta-llama/llama-3.3-70b-instruct:free")
    TOGETHER_API_KEY = os.getenv("VITE_TOGETHER_API_KEY", "")
    COHERE_API_KEY = os.getenv("VITE_COHERE_API_KEY", "")
    HF_API_URL = os.getenv("VITE_HF_API_URL", "https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct")

    TN_CONTEXT = """
Tamil Nadu is not just a state — it is one of Earth's oldest LIVING civilisations, with an unbroken cultural heritage spanning over 2,500 years.

KEY HISTORICAL FACTS:
- Three great ancient dynasties: Chera, Chola, and Pandya kingdoms
- The Chola Empire (300 BCE – 1279 CE) was one of the longest-ruling empires
- Tamil is one of the world's oldest classical languages
- Tamil Nadu covers 130,058 sq km
- UNESCO World Heritage Sites: Great Living Chola Temples, Group of Monuments at Mahabalipuram
- Climate: Tropical. Chennai peaks ~38°C (May-June); Nilgiris as cool as 5°C (Jan)
- Major rivers: Kaveri, Vaigai, Palar, Tambraparni, Ponnaiyar
"""

    async def query_gemini(self, prompt: str) -> str:
        if not self.GEMINI_API_KEY:
            raise Exception("No Gemini API key")
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={self.GEMINI_API_KEY}",
                    json={
                        "contents": [{"parts": [{"text": f"{self.TN_CONTEXT}\n\n{prompt}"}]}],
                        "generationConfig": {"temperature": 0.7, "maxOutputTokens": 2048}
                    }
                )
                if response.status_code == 200:
                    data = response.json()
                    return data["candidates"][0]["content"]["parts"][0]["text"]
                raise Exception(f"Gemini error: {response.status_code}")
        except Exception as e:
            logger.warning(f"Gemini failed: {e}")
            raise

    async def query_groq(self, prompt: str) -> str:
        if not self.GROQ_API_KEY:
            raise Exception("No Groq API key")
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.GROQ_API_KEY}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": self.GROQ_MODEL,
                        "messages": [
                            {"role": "system", "content": "You are Travel AI, an expert Tamil Nadu tourism assistant. Always respond with accurate, real-world data. When asked for JSON, return ONLY valid JSON."},
                            {"role": "user", "content": prompt}
                        ],
                        "temperature": 0.7,
                        "max_tokens": 2048
                    }
                )
                if response.status_code == 200:
                    data = response.json()
                    return data["choices"][0]["message"]["content"]
                raise Exception(f"Groq error: {response.status_code}")
        except Exception as e:
            logger.warning(f"Groq failed: {e}")
            raise

    async def query_mistral(self, prompt: str) -> str:
        if not self.MISTRAL_API_KEY or not self.MISTRAL_API_KEY.strip():
            raise Exception("Mistral key not configured")
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    "https://api.mistral.ai/v1/chat/completions",
                    headers={"Authorization": f"Bearer {self.MISTRAL_API_KEY}", "Content-Type": "application/json"},
                    json={"model": "mistral-small-latest", "messages": [{"role": "user", "content": prompt}], "max_tokens": 1500}
                )
                if response.status_code == 200:
                    return response.json()["choices"][0]["message"]["content"]
                raise Exception(f"Mistral error: {response.status_code}")
        except Exception as e:
            logger.warning(f"Mistral failed: {e}")
            raise

    async def query_openrouter(self, prompt: str) -> str:
        if not self.OPENROUTER_API_KEY or not self.OPENROUTER_API_KEY.strip():
            raise Exception("OpenRouter key not configured")
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.OPENROUTER_API_KEY}",
                        "Content-Type": "application/json",
                        "HTTP-Referer": "https://travelai-tamilnadu.vercel.app",
                        "X-Title": "TravelAI Tamil Nadu"
                    },
                    json={
                        "model": self.OPENROUTER_MODEL,
                        "messages": [{"role": "user", "content": prompt}],
                        "max_tokens": 1500
                    }
                )
                if response.status_code == 200:
                    return response.json()["choices"][0]["message"]["content"]
                raise Exception(f"OpenRouter error: {response.status_code}")
        except Exception as e:
            logger.warning(f"OpenRouter failed: {e}")
            raise

    async def query_together(self, prompt: str) -> str:
        if not self.TOGETHER_API_KEY or not self.TOGETHER_API_KEY.strip():
            raise Exception("Together key not configured")
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    "https://api.together.xyz/v1/chat/completions",
                    headers={"Authorization": f"Bearer {self.TOGETHER_API_KEY}", "Content-Type": "application/json"},
                    json={
                        "model": "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
                        "messages": [{"role": "user", "content": prompt}],
                        "max_tokens": 1500,
                        "temperature": 0.7
                    }
                )
                if response.status_code == 200:
                    return response.json()["choices"][0]["message"]["content"]
                raise Exception(f"Together error: {response.status_code}")
        except Exception as e:
            logger.warning(f"Together failed: {e}")
            raise

    async def query_cohere(self, prompt: str) -> str:
        if not self.COHERE_API_KEY or not self.COHERE_API_KEY.strip():
            raise Exception("Cohere key not configured")
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    "https://api.cohere.com/v1/chat",
                    headers={"Authorization": f"Bearer {self.COHERE_API_KEY}", "Content-Type": "application/json"},
                    json={"model": "command-r-plus", "message": prompt, "max_tokens": 1500, "temperature": 0.7}
                )
                if response.status_code == 200:
                    return response.json()["text"]
                raise Exception(f"Cohere error: {response.status_code}")
        except Exception as e:
            logger.warning(f"Cohere failed: {e}")
            raise

    async def query_huggingface(self, prompt: str) -> str:
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    self.HF_API_URL,
                    headers={"Content-Type": "application/json"},
                    json={"inputs": f"<s>[INST] {prompt} [/INST]", "parameters": {"max_new_tokens": 1024, "temperature": 0.7}}
                )
                if response.status_code == 200:
                    data = response.json()
                    return re.sub(r'^<s>\[INST\].*?\[/INST\]\s*', '', data[0]["generated_text"], flags=re.DOTALL)
                raise Exception(f"HuggingFace error: {response.status_code}")
        except Exception as e:
            logger.warning(f"HuggingFace failed: {e}")
            raise

    async def query_ai(self, prompt: str) -> dict:
        engines = [
            (self.query_gemini, "Gemini 2.0 Flash"),
            (self.query_groq, "Groq/Llama 4 Scout"),
            (self.query_mistral, "Mistral Small"),
            (self.query_openrouter, "OpenRouter/Llama 3.3 70B"),
            (self.query_together, "Together/Llama 3.3 70B"),
            (self.query_cohere, "Cohere Command R+"),
            (self.query_huggingface, "HuggingFace/Llama-3"),
        ]

        for engine_fn, engine_name in engines:
            try:
                result = await engine_fn(prompt)
                if result and result.strip():
                    logger.info(f"AI Response from: {engine_name}")
                    return {"text": result, "engine": engine_name}
            except Exception as e:
                logger.warning(f"[AI] {engine_name} failed: {e}")

        raise Exception("All 7 AI engines are currently unavailable.")

    def parse_json_response(self, text: str):
        if not text:
            return None
        import json
        try:
            cleaned = re.sub(r'```json\s*', '', text, flags=re.IGNORECASE)
            cleaned = re.sub(r'```\s*', '', cleaned, flags=re.IGNORECASE).strip()
            return json.loads(cleaned)
        except Exception:
            arr_match = re.search(r'\[[\s\S]*\]', cleaned)
            obj_match = re.search(r'\{[\s\S]*\}', cleaned)
            arr = arr_match.group(0) if arr_match else None
            obj = obj_match.group(0) if obj_match else None
            if arr:
                try:
                    return json.loads(arr)
                except: pass
            if obj:
                try:
                    return json.loads(obj)
                except: pass
        return None


orchestrator = AIOrchestrator()


async def query_ai(prompt: str) -> dict:
    return await orchestrator.query_ai(prompt)


async def get_place_history(place_name: str) -> dict:
    prompt = f"""{orchestrator.TN_CONTEXT}

You are a Tamil Nadu historian. Write a FACTUALLY ACCURATE history of "{place_name}".

Return ONLY valid JSON:
{{
  "title": "The Living History of {place_name}",
  "era": "Approximate founding era",
  "dynasties": [" dynasty names"],
  "civilisationalSignificance": "One sentence on why this place matters",
  "timeline": [
    {{"year": "300 BCE", "event": "Specific event"}}
  ],
  "narrative": "4 paragraphs about this place",
  "funFact": "One astonishing fact",
  "livingTradition": "What ancient tradition is STILL alive here today"
}}"""

    try:
        result = await orchestrator.query_ai(prompt)
        data = orchestrator.parse_json_response(result["text"])
        if data:
            return data
    except Exception as e:
        logger.error(f"AI Error in get_place_history: {e}")

    return {"title": f"The Living History of {place_name}", "narrative": "Information temporarily unavailable. Please try again later.", "timeline": [], "dynasties": [], "funFact": "", "livingTradition": ""}


async def get_place_uniqueness(place_name: str) -> dict:
    prompt = f"""{orchestrator.TN_CONTEXT}

You are a Tamil Nadu cultural anthropologist. Describe what makes "{place_name}" absolutely UNIQUE.

Return ONLY valid JSON:
{{
  "tagline": "A powerful one-liner",
  "uniqueFeatures": [{{"title": "Feature", "description": "Deep reason", "icon": "emoji"}}],
  "bestKeptSecrets": ["Secret 1", "Secret 2", "Secret 3"],
  "localTip": "Hyper-specific insider tip"
}}"""

    try:
        result = await orchestrator.query_ai(prompt)
        data = orchestrator.parse_json_response(result["text"])
        if data:
            return data
    except Exception as e:
        logger.error(f"AI Error in get_place_uniqueness: {e}")

    return {"tagline": f"Discover {place_name}", "uniqueFeatures": [], "bestKeptSecrets": [], "localTip": ""}


async def get_trending_places() -> list:
    from datetime import datetime
    month = datetime.now().strftime("%B")
    prompt = f"""{orchestrator.TN_CONTEXT}

It is currently {month} 2026. Identify the TOP 12 TRENDING travel destinations across Tamil Nadu.

Return ONLY valid JSON array:
[
  {{
    "name": "Place name",
    "district": "District",
    "region": "North|South|Central|West|East",
    "trendReason": "Specific reason",
    "category": "Festival|Nature|Heritage|Beach|Hill Station|Spiritual",
    "summary": "2 sentences",
    "rating": 4.5
  }}
]"""

    try:
        result = await orchestrator.query_ai(prompt)
        data = orchestrator.parse_json_response(result["text"])
        if data and isinstance(data, list):
            return data
    except Exception as e:
        logger.error(f"AI Error in get_trending_places: {e}")

    return []


async def get_hidden_gems(district_name: str) -> list:
    prompt = f"""{orchestrator.TN_CONTEXT}

Uncover 6 HIDDEN GEM locations in "{district_name}" district.

Return ONLY valid JSON array:
[
  {{
    "name": "Real place name",
    "type": "Temple|Waterfall|Viewpoint|Village|Lake|Cave|Forest|Beach|Market",
    "description": "Why this reveals Tamil Nadu's living civilisation",
    "howToReach": "Directions",
    "bestTime": "Best time to visit",
    "crowd": "Low|Medium|High",
    "tip": "Hyper-local insider tip"
  }}
]"""

    try:
        result = await orchestrator.query_ai(prompt)
        data = orchestrator.parse_json_response(result["text"])
        if data and isinstance(data, list):
            return data
    except Exception as e:
        logger.error(f"AI Error in get_hidden_gems: {e}")

    return []


async def translate_to_tamil(phrases: list) -> list:
    prompt = f"""Translate these phrases to Tamil with pronunciation:
{chr(10).join(f"{i+1}. {p}" for i, p in enumerate(phrases))}

Return ONLY valid JSON array:
[
  {{"english": "Hello", "tamil": "வணக்கம்", "pronunciation": "Vanakkam", "usage": "Greeting"}}
]"""

    try:
        result = await orchestrator.query_ai(prompt)
        data = orchestrator.parse_json_response(result["text"])
        if data and isinstance(data, list):
            return data
    except Exception as e:
        logger.error(f"AI Error in translate_to_tamil: {e}")

    return [{"english": p, "tamil": "", "pronunciation": "", "usage": ""} for p in phrases]


async def estimate_budget(destination: str, duration: int, travelers: int, budget_level: str) -> dict:
    prompt = f"""Estimate a realistic travel budget for {travelers} person(s) visiting {destination}, Tamil Nadu for {duration} days on a {budget_level} budget.

Use REAL prices in INR (₹).

Return ONLY valid JSON:
{{
  "totalEstimate": "₹X,XXX - ₹X,XXX",
  "perDay": "₹X,XXX",
  "breakdown": {{
    "accommodation": {{"amount": "₹X,XXX/night", "suggestion": "Hotel type"}},
    "food": {{"amount": "₹XXX/day", "suggestion": "Where to eat"}},
    "transport": {{"amount": "₹X,XXX", "suggestion": "How to get around"}},
    "activities": {{"amount": "₹XXX", "suggestion": "Entry fees"}}
  }},
  "moneySavingTips": ["Tip 1", "Tip 2", "Tip 3"]
}}"""

    try:
        result = await orchestrator.query_ai(prompt)
        data = orchestrator.parse_json_response(result["text"])
        if data:
            return data
    except Exception as e:
        logger.error(f"AI Error in estimate_budget: {e}")

    return {"totalEstimate": "₹X,XXX - ₹X,XXX", "perDay": "₹X,XXX", "breakdown": {}, "moneySavingTips": []}


async def summarize_itinerary(destination: str, days: int, activities: list) -> str:
    """Generate an AI summary for an itinerary."""
    activities_str = ", ".join(activities[:6])
    prompt = f"""Summarize this {days}-day travel itinerary to {destination}, Tamil Nadu in 2-3 sentences.
Activities include: {activities_str}.
Focus on the cultural and historical significance. Keep it concise and exciting."""

    try:
        result = await orchestrator.query_ai(prompt)
        return result.get("text", f"A curated {days}-day exploration of {destination}'s heritage and culture.")
    except Exception as e:
        logger.error(f"AI Error in summarize_itinerary: {e}")

    return f"A curated {days}-day exploration of {destination}, featuring {len(activities)} carefully selected attractions spanning Tamil Nadu's 2,500-year living civilisation."


async def extract_number_insights(historical_text: str) -> dict:
    """Extract key numerical facts (dates, measurements, statistics) from historical text.
    Used by the scraper pipeline to enrich place data with quantifiable heritage facts."""
    prompt = f"""Analyze this historical text about a Tamil Nadu heritage site and extract all important numerical insights.

TEXT:
{historical_text[:2000]}

Return ONLY valid JSON:
{{
  "dates": [
    {{"year": "300 BCE", "event": "Foundation of the temple", "significance": "Marks the beginning of Pandya patronage"}}
  ],
  "measurements": [
    {{"value": "170 feet", "description": "Height of the main gopuram"}}
  ],
  "statistics": [
    {{"fact": "33,000 sculptures", "context": "Number of sculptures adorning the temple complex"}}
  ],
  "eras": [
    {{"period": "Pandya Dynasty", "span": "300 BCE - 1345 CE", "contribution": "Original construction and major expansions"}}
  ],
  "funFacts": [
    "The temple tank holds 2.5 million litres of water"
  ]
}}

Return ONLY the JSON."""

    try:
        result = await orchestrator.query_ai(prompt)
        text = result.get("text", "")
        parsed = orchestrator.parse_json_response(text)
        if parsed:
            return parsed
    except Exception as e:
        logger.error(f"AI Error in extract_number_insights: {e}")

    # Fallback: regex-based extraction
    insights = {"dates": [], "measurements": [], "statistics": [], "eras": [], "funFacts": []}

    # Extract years
    year_pattern = re.compile(r'(\d{3,4})\s*(BCE|CE|AD|BC)', re.IGNORECASE)
    for match in year_pattern.finditer(historical_text):
        year_str = f"{match.group(1)} {match.group(2).upper()}"
        context_start = max(0, match.start() - 50)
        context_end = min(len(historical_text), match.end() + 80)
        context = historical_text[context_start:context_end].strip()
        insights["dates"].append({"year": year_str, "event": context, "significance": ""})

    # Extract measurements
    measure_pattern = re.compile(r'(\d+(?:\.\d+)?)\s*(feet|metres|meters|km|acres|hectares|sq\s*km)', re.IGNORECASE)
    for match in measure_pattern.finditer(historical_text):
        value = f"{match.group(1)} {match.group(2)}"
        context_start = max(0, match.start() - 40)
        context_end = min(len(historical_text), match.end() + 60)
        context = historical_text[context_start:context_end].strip()
        insights["measurements"].append({"value": value, "description": context})

    # Extract large numbers (likely statistics)
    stat_pattern = re.compile(r'(\d{1,3}(?:,\d{3})+|\d+(?:\.\d+)?\s*(?:million|billion|thousand|lakh|crore))', re.IGNORECASE)
    for match in stat_pattern.finditer(historical_text):
        context_start = max(0, match.start() - 40)
        context_end = min(len(historical_text), match.end() + 60)
        context = historical_text[context_start:context_end].strip()
        insights["statistics"].append({"fact": match.group(0), "context": context})

    return insights