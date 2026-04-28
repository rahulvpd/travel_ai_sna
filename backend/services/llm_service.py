import httpx
import os
import sys
import logging
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

GROQ_API_KEY = os.getenv("VITE_GROQ_API_KEY")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

async def summarize_itinerary(destination: str, days: int, activities: list) -> str:
    """
    Generate a natural language summary of the itinerary using Groq.
    """
    if not GROQ_API_KEY:
        return f"A wonderful {days}-day trip to {destination} featuring amazing local attractions."

    prompt = f"Summarize this {days}-day travel plan to {destination} in 2 sentences. Focus on the vibes and top highlights: {activities}"

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                GROQ_URL,
                headers={"Authorization": f"Bearer {GROQ_API_KEY}"},
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": 150
                },
                timeout=10.0
            )
            if response.status_code == 200:
                result = response.json()
                return result["choices"][0]["message"]["content"]
    except Exception as e:
        logger.error(f"LLM Error: {e}")

    return f"Explore the best of {destination} with this curated {days}-day itinerary."
