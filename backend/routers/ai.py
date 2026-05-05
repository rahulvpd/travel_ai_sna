import os
from typing import Any

import httpx
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

load_dotenv()

router = APIRouter(prefix='/ai', tags=['ai'])

from services.llm_service import query_ai, get_place_history, get_place_uniqueness, get_trending_places, get_hidden_gems, translate_to_tamil, estimate_budget
from typing import Optional

NVIDIA_ENDPOINT = 'https://integrate.api.nvidia.com/v1/chat/completions'
DEFAULT_MODEL = 'nvidia/nemotron-3-nano-30b-a3b'


class AIQueryRequest(BaseModel):
    prompt: str
    action: Optional[str] = None


class PlaceHistoryRequest(BaseModel):
    place_name: str


class PlaceUniquenessRequest(BaseModel):
    place_name: str


class HiddenGemsRequest(BaseModel):
    district_name: str


class TamilTranslateRequest(BaseModel):
    phrases: list[str]


class BudgetEstimateRequest(BaseModel):
    destination: str
    duration: int
    travelers: int
    budget_level: str


@router.post("/query")
async def ai_query(request: AIQueryRequest):
    try:
        result = await query_ai(request.prompt)
        return result
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))


@router.post("/place-history")
async def ai_place_history(request: PlaceHistoryRequest):
    try:
        result = await get_place_history(request.place_name)
        return result
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))


@router.post("/place-uniqueness")
async def ai_place_uniqueness(request: PlaceUniquenessRequest):
    try:
        result = await get_place_uniqueness(request.place_name)
        return result
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))


@router.get("/trending-places")
async def ai_trending_places():
    try:
        result = await get_trending_places()
        return {"places": result}
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))


@router.post("/hidden-gems")
async def ai_hidden_gems(request: HiddenGemsRequest):
    try:
        result = await get_hidden_gems(request.district_name)
        return {"gems": result}
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))


@router.post("/translate-tamil")
async def ai_translate_tamil(request: TamilTranslateRequest):
    try:
        result = await translate_to_tamil(request.phrases)
        return {"translations": result}
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))


@router.post("/budget-estimate")
async def ai_budget_estimate(request: BudgetEstimateRequest):
    try:
        result = await estimate_budget(request.destination, request.duration, request.travelers, request.budget_level)
        return result
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))


class NvidiaChatRequest(BaseModel):
    prompt: str | None = None
    messages: list[dict[str, Any]] | None = None
    model: str = DEFAULT_MODEL
    temperature: float = 0.3
    top_p: float = 1.0
    max_tokens: int = 2048
    reasoning_budget: int | None = None
    enable_thinking: bool = False
    extra_body: dict[str, Any] = Field(default_factory=dict)


def _get_nvidia_key() -> str | None:
    return os.getenv('NVIDIA_API_KEY') or os.getenv('VITE_NVIDIA_API_KEY')


@router.post('/nvidia/chat')
async def nvidia_chat(request: NvidiaChatRequest):
    api_key = _get_nvidia_key()
    if not api_key:
        raise HTTPException(status_code=503, detail='NVIDIA API key is not configured on the server.')

    messages = request.messages or []
    if not messages and request.prompt:
        messages = [{'role': 'user', 'content': request.prompt}]

    if not messages:
        raise HTTPException(status_code=400, detail='Either prompt or messages is required.')

    payload: dict[str, Any] = {
        'model': request.model or DEFAULT_MODEL,
        'messages': messages,
        'temperature': request.temperature,
        'top_p': request.top_p,
        'max_tokens': request.max_tokens,
        'stream': False,
    }

    extra_body = dict(request.extra_body or {})
    if request.reasoning_budget is not None:
        extra_body['reasoning_budget'] = request.reasoning_budget
    if request.enable_thinking:
        template_kwargs = dict(extra_body.get('chat_template_kwargs') or {})
        template_kwargs['enable_thinking'] = True
        extra_body['chat_template_kwargs'] = template_kwargs
    if extra_body:
        payload['extra_body'] = extra_body

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                NVIDIA_ENDPOINT,
                headers={
                    'Content-Type': 'application/json',
                    'Authorization': f'Bearer {api_key}',
                },
                json=payload,
            )
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail=f'NVIDIA request failed: {exc}') from exc

    if response.status_code != 200:
        detail = response.text
        raise HTTPException(status_code=response.status_code, detail=detail)

    data = response.json()
    message = data.get('choices', [{}])[0].get('message', {})
    content = message.get('content') or message.get('reasoning_content') or message.get('reasoning') or ''

    return {
        'text': content,
        'model': payload['model'],
        'provider': 'nvidia',
        'usage': data.get('usage'),
        'finish_reason': data.get('choices', [{}])[0].get('finish_reason'),
    }


# ─── Place Details Proxy (secures Gemini key on backend) ──────────────────

class PlaceDetailsRequest(BaseModel):
    place_name: str
    user_api_key: Optional[str] = None


@router.post("/place-details")
async def ai_place_details(request: PlaceDetailsRequest):
    """
    Generate rich place details using the backend AI orchestrator.
    This replaces the frontend's direct Gemini SDK call in PlaceDataService.js,
    keeping the API key server-side.
    """
    prompt = f"""You are a Tamil Nadu tourism expert and cultural historian.
Provide REAL, ACCURATE data for "{request.place_name}" in Tamil Nadu, India.
Frame descriptions highlighting its role in Tamil Nadu's living civilisation.

Return ONLY valid JSON:
{{
  "name": "{request.place_name}",
  "civilisationalTagline": "A powerful 4-7 word tagline reflecting its living heritage",
  "description": "2-3 sentence rich description framing the place as part of Tamil Nadu's 2500-year living civilisation.",
  "highlights": ["Top attraction 1", "Top attraction 2", "Experience 3"],
  "bestTimeToVisit": "Month - Month",
  "averageTemp": "25°C",
  "nearestAirport": "Airport name (distance km)",
  "hotels": [{{"name": "Real Hotel Name", "rating": 4.5, "priceRange": "₹2000-5000/night", "type": "Mid-Range"}}],
  "restaurants": [{{"name": "Real Restaurant", "cuisine": "South Indian", "rating": 4.3, "mustTry": "Signature dish", "priceRange": "₹150-400/person"}}],
  "attractions": [{{"name": "Real Place", "type": "Temple", "rating": 4.6, "entryFee": "Free", "timings": "6 AM - 8 PM", "description": "Historical context"}}],
  "mustTryFood": ["Dish 1", "Dish 2"],
  "safetyTips": ["Tip 1"],
  "travelTip": "Practical tip",
  "festivals": [{{"name": "Festival", "description": "Significance", "month": "Month"}}],
  "culturalInsights": ["Fact 1", "Fact 2"]
}}

Return ONLY the JSON."""

    try:
        result = await query_ai(prompt)
        text = result.get("text", "")
        # Try to parse as JSON
        import re as _re
        import json as _json
        cleaned = _re.sub(r'```json\s*', '', text, flags=_re.IGNORECASE)
        cleaned = _re.sub(r'```\s*', '', cleaned, flags=_re.IGNORECASE).strip()
        json_match = _re.search(r'\{[\s\S]*\}', cleaned)
        if json_match:
            data = _json.loads(json_match.group(0))
            return data
        return {"name": request.place_name, "error": "Could not parse AI response", "raw": text[:500]}
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))


# ─── Gemini Content Proxy (secures Gemini key on backend) ─────────────────

class GeminiContentRequest(BaseModel):
    messages: list[str]
    model: Optional[str] = "gemini-2.0-flash"


@router.post("/gemini/generate")
async def gemini_generate(request: GeminiContentRequest):
    """
    Proxy for Gemini content generation.
    Replaces the frontend's direct Gemini API call in lib/gemini.js.
    """
    combined_prompt = "\n".join(request.messages)
    try:
        result = await query_ai(combined_prompt)
        return result
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))


# ─── ML Prediction Endpoints ─────────────────────────────────────────────

class VisitorPredictionRequest(BaseModel):
    place_name: str
    temperature: float = 30.0
    weather: str = "clear"
    capacity: int = 1000
    hours_ahead: Optional[int] = None


@router.post("/predict/visitors")
async def predict_visitors(request: VisitorPredictionRequest):
    """Predict visitor flow at a heritage site using the ML model."""
    try:
        from services.visitor_predictor import get_visitor_predictor
        predictor = get_visitor_predictor()

        if request.hours_ahead:
            predictions = predictor.predict_range(
                request.place_name,
                hours_ahead=request.hours_ahead,
                temperature=request.temperature,
                weather=request.weather,
                capacity=request.capacity,
            )
            return {"predictions": predictions}
        else:
            prediction = predictor.predict(
                request.place_name,
                temperature=request.temperature,
                weather=request.weather,
                capacity=request.capacity,
            )
            return prediction
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))


@router.get("/predict/network")
async def predict_network_evolution(years: int = 5):
    """Predict how the heritage tourism network evolves over time."""
    try:
        from services.visitor_predictor import get_network_predictor
        predictor = get_network_predictor()
        return predictor.predict_evolution(years_ahead=years)
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))


# ─── Dynamic Pricing Endpoints ───────────────────────────────────────────

class TransportPriceRequest(BaseModel):
    mode: str = "auto_rickshaw"
    distance_km: float = 5.0
    crowd_percentage: float = 50.0


class TicketPriceRequest(BaseModel):
    attraction_name: str
    tier: str = "moderate"
    is_foreign: bool = False
    crowd_percentage: float = 50.0


class BudgetBreakdownRequest(BaseModel):
    destination: str
    days: int
    travelers: int = 1
    budget_level: str = "moderate"


@router.post("/pricing/transport")
async def get_transport_pricing(request: TransportPriceRequest):
    """Get dynamic transport pricing based on crowd and time."""
    try:
        from services.dynamic_pricing import get_pricing_engine
        engine = get_pricing_engine()
        return engine.get_transport_price(
            request.mode, request.distance_km, request.crowd_percentage
        )
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))


@router.post("/pricing/ticket")
async def get_ticket_pricing(request: TicketPriceRequest):
    """Get dynamic ticket pricing for an attraction."""
    try:
        from services.dynamic_pricing import get_pricing_engine
        engine = get_pricing_engine()
        return engine.get_ticket_price(
            request.attraction_name, request.tier, request.is_foreign,
            request.crowd_percentage
        )
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))


@router.post("/pricing/budget")
async def get_budget_breakdown(request: BudgetBreakdownRequest):
    """Get a full AI-powered budget breakdown for a trip."""
    try:
        from services.dynamic_pricing import get_pricing_engine
        engine = get_pricing_engine()
        return engine.get_budget_breakdown(
            request.destination, request.days, request.travelers,
            request.budget_level
        )
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))


# ─── Language & Translation (Sarvam AI) ──────────────────────────────────

class TranslateRequest(BaseModel):
    text: str
    target_lang: str = "ta-IN"

class TTSRequest(BaseModel):
    text: str
    lang_code: str = "ta-IN"

class TransliterateRequest(BaseModel):
    text: str

@router.post("/sarvam/translate")
async def sarvam_translate(request: TranslateRequest):
    try:
        from services.sarvam_service import translate_text
        return await translate_text(request.text, request.target_lang)
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))

@router.post("/sarvam/tts")
async def sarvam_tts(request: TTSRequest):
    try:
        from services.sarvam_service import text_to_speech
        audio_data = await text_to_speech(request.text, request.lang_code)
        if not audio_data:
            raise HTTPException(status_code=500, detail="TTS generation failed")
        return {"audio_url": audio_data}
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))

@router.post("/sarvam/transliterate")
async def sarvam_transliterate(request: TransliterateRequest):
    try:
        from services.sarvam_service import transliterate_roman
        result = await transliterate_roman(request.text)
        return {"transliterated_text": result}
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))
