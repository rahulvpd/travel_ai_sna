"""
Travel AI Tamil Nadu — Route Service
Provides route planning between locations using haversine distance.
"""
from services.optimizer import haversine_km, optimize_route


def plan_route(waypoints: list, mode: str = "auto") -> dict:
    """
    Plan an optimized route through a list of waypoints.
    Each waypoint should have 'lat', 'lng', and optionally 'name' and 'avgDuration'.
    """
    if not waypoints:
        return {"route": [], "totalDistance": 0, "totalDuration": 0, "segments": []}

    optimized = optimize_route(waypoints, mode=mode)

    # Build segment details
    segments = []
    places = optimized["places"]
    for i in range(len(places) - 1):
        dist = haversine_km(
            places[i]["lat"], places[i]["lng"],
            places[i + 1]["lat"], places[i + 1]["lng"]
        )
        segments.append({
            "from": places[i].get("name", f"Point {i}"),
            "to": places[i + 1].get("name", f"Point {i + 1}"),
            "distance_km": round(dist, 1),
            "estimated_travel_min": round((dist / 30) * 60),  # 30 km/h avg
        })

    return {
        "route": places,
        "totalDistance": optimized["totalDistance"],
        "totalDuration": optimized["totalDuration"],
        "segments": segments,
    }
