import httpx
import os
import logging
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

WEATHER_API_KEY = os.getenv("VITE_WEATHER_API_KEY")
BASE_URL = "https://api.openweathermap.org/data/2.5/forecast"

async def get_forecast(lat: float, lon: float) -> dict:
    """
    Get 5-day weather forecast for a location.
    """
    if not WEATHER_API_KEY:
        # Return mock data if no API key
        return {
            "summary": "Clear skies and pleasant weather expected.",
            "temp": 28.5,
            "condition": "Sunny"
        }

    try:
        async with httpx.AsyncClient() as client:
            params = {
                "lat": lat,
                "lon": lon,
                "appid": WEATHER_API_KEY,
                "units": "metric"
            }
            response = await client.get(BASE_URL, params=params)
            if response.status_code == 200:
                data = response.json()
                # Simplified for demo
                first_forecast = data["list"][0]
                return {
                    "summary": f"Weather will be {first_forecast['weather'][0]['description']}.",
                    "temp": first_forecast["main"]["temp"],
                    "condition": first_forecast["weather"][0]["main"]
                }
    except Exception as e:
        logger.error(f"Weather API error: {e}")

    return {"summary": "Weather info unavailable.", "temp": None, "condition": "Unknown"}
