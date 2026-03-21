import httpx
from typing import List, Dict
import os
from dotenv import load_dotenv

load_dotenv()

OVERPASS_URL = "https://overpass-api.de/api/interpreter"

async def fetch_attractions(district: str) -> List[Dict]:
    """
    Fetch attractions for a given district using Overpass API (OSM).
    """
    # Simple query for tourist attractions in a district (represented as a bounding box or area)
    # For Tamil Nadu districts, we can search by name
    query = f"""
    [out:json][timeout:25];
    area["name"="{district}"]["admin_level"~"4|5|6"]->.searchArea;
    (
      node["tourism"="attraction"](area.searchArea);
      way["tourism"="attraction"](area.searchArea);
      node["historic"="monument"](area.searchArea);
      node["heritage"](area.searchArea);
    );
    out body;
    >;
    out skel qt;
    """
    
    async with httpx.AsyncClient() as client:
        response = await client.post(OVERPASS_URL, data={"data": query})
        if response.status_code != 200:
            return []
        
        data = response.json()
        elements = data.get("elements", [])
        
        attractions = []
        for el in elements:
            if el.get("type") == "node" and "tags" in el:
                tags = el["tags"]
                attractions.append({
                    "name": tags.get("name", "Unknown Attraction"),
                    "latitude": el.get("lat"),
                    "longitude": el.get("lon"),
                    "category": tags.get("tourism", tags.get("historic", "Other")),
                    "description": tags.get("description", f"A beautiful {tags.get('tourism', 'site')} in {district}"),
                    "address": tags.get("addr:full", tags.get("addr:street", "Tamil Nadu")),
                    "opening_hours": tags.get("opening_hours", "Not specified"),
                    "district": district
                })
        
        return attractions[:20] # Limit for now
