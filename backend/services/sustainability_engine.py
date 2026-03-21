from typing import Dict, List
import math

# Carbon emission factors (g CO2 per km)
EMISSION_FACTORS = {
    "walking": 0,
    "bicycle": 0,
    "bus": 25,
    "train": 15,
    "car": 120,
    "auto_rickshaw": 45
}

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate Haversine distance between two points in kilometers.
    """
    R = 6371.0 # Radius of the Earth in km
    
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * \
        math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c

def get_sustainability_score(activities: List[Dict], travel_style: str = "balanced") -> Dict:
    """
    Estimate the carbon footprint of the itinerary.
    """
    total_distance = 0.0
    for i in range(len(activities) - 1):
        total_distance += calculate_distance(
            activities[i]["latitude"], activities[i]["longitude"],
            activities[i+1]["latitude"], activities[i+1]["longitude"]
        )
        
    # Default travel mode based on style
    mode = "car" if travel_style == "luxury" else "bus"
    carbon_footprint = total_distance * EMISSION_FACTORS.get(mode, 100) / 1000.0 # in kg
    
    # Calculate a score out of 100
    # Average trip is ~50km/day, so 50kg CO2/day is a baseline
    score = max(0, 100 - (carbon_footprint * 2)) 
    
    return {
        "carbon_kg": round(carbon_footprint, 2),
        "green_score": round(score, 0),
        "total_distance_km": round(total_distance, 2)
    }
