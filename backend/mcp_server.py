"""
Tamil Nadu Tourism MCP Server
Exposes tourism tools via Model Context Protocol for Claude Desktop, Cursor, and other MCP clients.

Run with: python mcp_server.py
Or configure in Claude Desktop/Cursor config.
"""

import sys
import logging
from typing import Any

logging.basicConfig(level=logging.INFO, stream=sys.stderr)
logger = logging.getLogger(__name__)

from mcp.server.fastmcp import FastMCP

import database
import models
from services.sna_service import get_graph_insights
from services.place_service import fetch_attractions
from services.recommendation_engine import rank_attractions
from services.optimizer import cluster_activities, optimize_route
from services.weather_service import get_forecast
from services.sustainability_engine import get_sustainability_score
from services.llm_service import summarize_itinerary

mcp = FastMCP("Tamil Nadu Tourism")


@mcp.tool()
def get_heritage_graph() -> dict[str, Any]:
    """
    Get the Tamil Nadu heritage site network graph with SNA metrics.
    
    Returns nodes (heritage sites), edges (connections), centrality scores,
    community groupings, and PageRank for influence analysis.
    
    Useful for understanding heritage site relationships and planning
    cultural tourism routes across Chola, Pallava, Pandya, and Colonial sites.
    """
    logger.info("Fetching heritage graph")
    return get_graph_insights()


@mcp.tool()
def list_itineraries(limit: int = 10) -> list[dict[str, Any]]:
    """
    List all saved itineraries from the database.
    
    Args:
        limit: Maximum number of itineraries to return (default 10)
    
    Returns a list of itinerary records with destination, dates,
    summary, green score, and cost estimates.
    """
    logger.info(f"Listing itineraries (limit={limit})")
    db = database.SessionLocal()
    try:
        itineraries = db.query(models.Itinerary).limit(limit).all()
        result = []
        for it in itineraries:
            result.append({
                "id": it.id,
                "title": it.title,
                "destination": it.destination,
                "start_date": str(it.start_date),
                "end_date": str(it.end_date),
                "summary": it.summary,
                "green_score": it.green_score,
                "total_cost": it.total_cost,
                "created_at": str(it.created_at),
            })
        return result
    finally:
        db.close()


@mcp.tool()
def search_attractions(district: str, category: str | None = None) -> list[dict[str, Any]]:
    """
    Search for attractions in a specific Tamil Nadu district.
    
    Args:
        district: District name (e.g., "Chennai", "Madurai", "Thanjavur")
        category: Optional category filter (e.g., "temple", "monument", "beach")
    
    Returns attraction details including name, location, category, rating,
    description, and opening hours. Fetches from database first, then from
    OpenStreetMap Overpass API if not found locally.
    """
    logger.info(f"Searching attractions: district={district}, category={category}")
    db = database.SessionLocal()
    try:
        query = db.query(models.Attraction).filter(models.Attraction.district == district)
        if category:
            query = query.filter(models.Attraction.category.ilike(f"%{category}%"))
        
        attractions = query.all()
        
        if not attractions:
            import asyncio
            attractions_data = asyncio.run(fetch_attractions(district))
            for data in attractions_data:
                if category and category.lower() not in data.get("category", "").lower():
                    continue
                db_place = models.Attraction(**data)
                db.add(db_place)
            db.commit()
            attractions = db.query(models.Attraction).filter(
                models.Attraction.district == district
            ).all()
        
        result = []
        for a in attractions:
            result.append({
                "id": a.id,
                "name": a.name,
                "latitude": a.latitude,
                "longitude": a.longitude,
                "category": a.category,
                "rating": a.rating,
                "description": a.description,
                "address": a.address,
                "opening_hours": a.opening_hours,
                "district": a.district,
            })
        return result
    finally:
        db.close()


@mcp.tool()
def get_top_attractions(district: str, interests: list[str], limit: int = 10) -> list[dict[str, Any]]:
    """
    Get top attractions ranked by user interests.
    
    Args:
        district: District name to search in
        interests: List of interest categories (e.g., ["temple", "beach", "heritage"])
        limit: Maximum number of attractions to return
    
    Returns attractions ranked by relevance to the specified interests,
    useful for personalized trip planning.
    """
    logger.info(f"Getting top attractions: district={district}, interests={interests}")
    db = database.SessionLocal()
    try:
        attractions = db.query(models.Attraction).filter(
            models.Attraction.district == district
        ).all()
        
        if not attractions:
            import asyncio
            attractions_data = asyncio.run(fetch_attractions(district))
            for data in attractions_data:
                db_place = models.Attraction(**data)
                db.add(db_place)
            db.commit()
            attractions = db.query(models.Attraction).filter(
                models.Attraction.district == district
            ).all()
        
        places_list = []
        for a in attractions:
            places_list.append({
                "id": a.id,
                "name": a.name,
                "category": a.category,
                "rating": a.rating,
                "description": a.description,
                "latitude": a.latitude,
                "longitude": a.longitude,
            })
        
        ranked = rank_attractions(places_list, interests)
        return ranked[:limit]
    finally:
        db.close()


@mcp.tool()
def plan_trip_preview(
    destination: str,
    days: int,
    interests: list[str],
    budget: str = "moderate",
    travel_style: str = "balanced",
) -> dict[str, Any]:
    """
    Preview a trip plan without saving to database.
    
    Args:
        destination: District or city name
        days: Number of days for the trip
        interests: List of interest categories
        budget: Budget level ("low", "moderate", "luxury")
        travel_style: Travel style ("relaxed", "balanced", "intensive")
    
    Returns a complete itinerary preview with daily activities, routes,
    sustainability score, and cost estimate. Does NOT persist to database.
    Use save_itinerary to save a plan.
    """
    logger.info(f"Planning trip preview: {destination} for {days} days")
    db = database.SessionLocal()
    try:
        attractions = db.query(models.Attraction).filter(
            models.Attraction.district == destination
        ).all()
        
        if not attractions:
            import asyncio
            attractions_data = asyncio.run(fetch_attractions(destination))
            for data in attractions_data:
                db_place = models.Attraction(**data)
                db.add(db_place)
            db.commit()
            attractions = db.query(models.Attraction).filter(
                models.Attraction.district == destination
            ).all()
        
        if not attractions:
            return {"error": f"No attractions found for {destination}"}
        
        places_list = []
        for a in attractions:
            places_list.append({
                "id": a.id,
                "name": a.name,
                "category": a.category,
                "rating": a.rating,
                "description": a.description,
                "latitude": a.latitude,
                "longitude": a.longitude,
            })
        
        ranked_places = rank_attractions(places_list, interests)
        top_places = ranked_places[:days * 3]
        day_clusters = cluster_activities(top_places, days)
        
        itinerary_days = []
        for day_idx, cluster in enumerate(day_clusters):
            day_num = day_idx + 1
            optimized_day = optimize_route(cluster)
            activities = []
            for i, place in enumerate(optimized_day):
                time_slots = ["Morning", "Afternoon", "Evening"]
                activities.append({
                    "name": place["name"],
                    "time_of_day": time_slots[i] if i < 3 else "Evening",
                    "latitude": place["latitude"],
                    "longitude": place["longitude"],
                    "category": place.get("category"),
                    "description": place.get("description", "")[:200],
                })
            itinerary_days.append({
                "day": day_num,
                "activities": activities,
            })
        
        sust = get_sustainability_score(top_places, travel_style)
        daily_cost = 1000 if budget == "low" else (3000 if budget == "moderate" else 7000)
        
        return {
            "destination": destination,
            "days": days,
            "itinerary": itinerary_days,
            "green_score": sust["green_score"],
            "total_cost": f"₹{daily_cost * days}",
            "budget": budget,
            "travel_style": travel_style,
        }
    finally:
        db.close()


@mcp.tool()
async def get_weather_forecast(latitude: float, longitude: float) -> dict[str, Any]:
    """
    Get weather forecast for a specific location.
    
    Args:
        latitude: Latitude coordinate
        longitude: Longitude coordinate
    
    Returns weather summary, temperature, and conditions for trip planning.
    """
    logger.info(f"Getting weather for lat={latitude}, lon={longitude}")
    forecast = await get_forecast(latitude, longitude)
    return forecast


@mcp.tool()
def list_districts() -> list[str]:
    """
    List all available Tamil Nadu districts for tourism.
    
    Returns a list of district names that can be used as destinations
    in other tools like search_attractions and plan_trip_preview.
    """
    districts = [
        "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore",
        "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kanchipuram",
        "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai",
        "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai",
        "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi",
        "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli",
        "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur",
        "Vellore", "Viluppuram", "Virudhunagar",
    ]
    return districts


@mcp.tool()
def get_heritage_by_dynasty(dynasty: str) -> list[dict[str, Any]]:
    """
    Get heritage sites filtered by dynasty.
    
    Args:
        dynasty: Dynasty name ("Chola", "Pallava", "Pandya", "British Colonial", "Modern")
    
    Returns heritage sites from the specified dynasty with location and style information.
    """
    logger.info(f"Getting heritage sites for dynasty: {dynasty}")
    graph_data = get_graph_insights()
    
    dynasty_nodes = []
    for node in graph_data["nodes"]:
        if dynasty.lower() in node.get("dynasty", "").lower():
            dynasty_nodes.append({
                "name": node["id"],
                "dynasty": node.get("dynasty"),
                "district": node.get("district"),
                "group": node.get("group"),
            })
    
    return dynasty_nodes


@mcp.resource("itinerary://{itinerary_id}")
def get_itinerary_resource(itinerary_id: int) -> str:
    """
    Get full itinerary details as a resource.
    
    Args:
        itinerary_id: The ID of the itinerary to retrieve
    """
    logger.info(f"Fetching itinerary resource: {itinerary_id}")
    db = database.SessionLocal()
    try:
        itinerary = db.query(models.Itinerary).filter(
            models.Itinerary.id == itinerary_id
        ).first()
        
        if not itinerary:
            return f"Itinerary {itinerary_id} not found"
        
        items = db.query(models.ItineraryItem).filter(
            models.ItineraryItem.itinerary_id == itinerary_id
        ).all()
        
        result = f"# {itinerary.title}\n\n"
        result += f"**Destination:** {itinerary.destination}\n"
        result += f"**Dates:** {itinerary.start_date} to {itinerary.end_date}\n"
        result += f"**Cost:** {itinerary.total_cost}\n"
        result += f"**Green Score:** {itinerary.green_score}%\n\n"
        result += f"## Summary\n{itinerary.summary}\n\n"
        result += "## Daily Itinerary\n\n"
        
        for item in items:
            result += f"### Day {item.day} - {item.time_of_day}\n"
            result += f"- {item.activity_name}\n"
            if item.notes:
                result += f"  - {item.notes}\n"
        
        return result
    finally:
        db.close()


@mcp.prompt()
def plan_tamil_nadu_trip(
    destination: str,
    duration_days: int = 3,
    interests: str = "heritage, temples",
    budget: str = "moderate",
) -> str:
    """
    Generate a prompt for planning a Tamil Nadu trip.
    
    Use this prompt template to get comprehensive trip planning assistance
    from the AI assistant.
    """
    return f"""Help me plan a {duration_days}-day trip to {destination} in Tamil Nadu.

My interests include: {interests}
Budget preference: {budget}

Please:
1. Use search_attractions to find places matching my interests
2. Use get_top_attractions to rank them by relevance
3. Use plan_trip_preview to create a detailed itinerary
4. Use get_weather_forecast for the destination weather
5. Provide recommendations for the best time to visit

Consider heritage sites from different dynasties (Chola, Pallava, Pandya, Colonial)
and suggest a route that minimizes travel time between attractions."""


@mcp.prompt()
def explore_heritage_sites(dynasty: str = "Chola") -> str:
    """
    Generate a prompt for exploring Tamil Nadu heritage sites by dynasty.
    
    Args:
        dynasty: Dynasty to explore (Chola, Pallava, Pandya, British Colonial, Modern)
    """
    return f"""I want to explore {dynasty} dynasty heritage sites in Tamil Nadu.

Please:
1. Use get_heritage_by_dynasty to find sites from this dynasty
2. Use get_heritage_graph to understand connections between sites
3. Suggest an optimal route to visit multiple sites
4. Provide historical context for each site

Focus on the architectural style, historical significance, and practical
information like location and visiting hours."""


def main():
    mcp.run(transport="stdio")


if __name__ == "__main__":
    main()
