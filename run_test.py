import asyncio
import json
from backend.services.scraper_service import get_rich_place_data
from backend.services.llm_service import extract_number_insights

async def test():
    print("Fetching place data for Meenakshi Temple, Madurai...")
    rich_data = get_rich_place_data("Meenakshi Amman Temple", "Madurai")
    
    print("\n--- Scraped History Snippet ---")
    print(rich_data["historical_significance"][:500] if rich_data["historical_significance"] else "None found")
    
    print(f"\n--- Images Found: {len(rich_data['images'])} ---")
    for img in rich_data["images"][:3]:
        print(img)
        
    print("\n--- Extracting Number Insights ---")
    if rich_data["historical_significance"]:
        insights = await extract_number_insights(rich_data["historical_significance"])
        print(json.dumps(insights, indent=2))
    else:
        print("No history to extract from.")

if __name__ == "__main__":
    asyncio.run(test())
