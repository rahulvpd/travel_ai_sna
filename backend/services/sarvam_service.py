import httpx
import os
import logging
from typing import Optional, Dict

logger = logging.getLogger(__name__)

SARVAM_BASE = "https://api.sarvam.ai"
SARVAM_API_KEY = os.getenv("VITE_SARVAM_API_KEY") or os.getenv("SARVAM_API_KEY")

async def translate_text(text: str, target_lang: str = "ta-IN") -> Dict:
    if not SARVAM_API_KEY:
        return {"translated": None, "transliteration": None}
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                f"{SARVAM_BASE}/translate",
                headers={
                    "Content-Type": "application/json",
                    "api-subscription-key": SARVAM_API_KEY
                },
                json={
                    "input": text,
                    "source_language_code": "en-IN",
                    "target_language_code": target_lang,
                    "speaker_gender": "Female",
                    "mode": "formal",
                    "model": "mayura:v1",
                    "enable_preprocessing": True
                }
            )
            if response.status_code == 200:
                data = response.json()
                return {
                    "translated": data.get("translated_text"),
                    "transliteration": data.get("transliterated_text")
                }
    except Exception as e:
        logger.error(f"Sarvam translate error: {e}")
    return {"translated": None, "transliteration": None}

async def text_to_speech(text: str, lang_code: str = "ta-IN") -> Optional[str]:
    if not SARVAM_API_KEY:
        return None
    
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(
                f"{SARVAM_BASE}/text-to-speech",
                headers={
                    "Content-Type": "application/json",
                    "api-subscription-key": SARVAM_API_KEY
                },
                json={
                    "inputs": [text[:500]],
                    "target_language_code": lang_code,
                    "speaker": "meera",
                    "pitch": 0,
                    "pace": 1.0,
                    "loudness": 1.5,
                    "speech_sample_rate": 22050,
                    "enable_preprocessing": True,
                    "model": "bulbul:v1"
                }
            )
            if response.status_code == 200:
                data = response.json()
                audios = data.get("audios")
                if audios and len(audios) > 0:
                    return f"data:audio/wav;base64,{audios[0]}"
    except Exception as e:
        logger.error(f"Sarvam TTS error: {e}")
    return None

async def transliterate_roman(text: str) -> Optional[str]:
    if not SARVAM_API_KEY:
        return None
        
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                f"{SARVAM_BASE}/transliterate",
                headers={
                    "Content-Type": "application/json",
                    "api-subscription-key": SARVAM_API_KEY
                },
                json={
                    "input": text,
                    "source_language_code": "tam-Taml-IN",
                    "target_language_code": "en-IN"
                }
            )
            if response.status_code == 200:
                data = response.json()
                return data.get("transliterated_text")
    except Exception as e:
        logger.error(f"Sarvam transliterate error: {e}")
    return None
