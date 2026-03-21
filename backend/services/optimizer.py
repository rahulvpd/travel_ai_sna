import math
from typing import List, Dict

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Simple Euclidean distance for clustering."""
    return math.sqrt((lat1 - lat2)**2 + (lon1 - lon2)**2)

def cluster_activities(activities: List[Dict], days: int) -> List[List[Dict]]:
    """
    Manual clustering approach to avoid scikit-learn dependency.
    Uses a simple greedy approach to group nearby activities.
    """
    if not activities:
        return [[] for _ in range(days)]
    
    if len(activities) <= days:
        result = [[] for _ in range(days)]
        for i, act in enumerate(activities):
            result[i].append(act)
        return result

    # Simple greedy clustering:
    # 1. Start with 'days' furthest apart points as centroids (simplified)
    # For this demo, we'll just distribute them round-robin after sorting by lat
    sorted_acts = sorted(activities, key=lambda x: (x["latitude"], x["longitude"]))
    
    day_groups = [[] for _ in range(days)]
    for i, act in enumerate(sorted_acts):
        day_groups[i % days].append(act)
        
    return day_groups

def optimize_route(day_activities: List[Dict]) -> List[Dict]:
    """
    Simple Nearest Neighbor TSP approach to order activities within a day.
    """
    if len(day_activities) <= 2:
        return day_activities
    
    unvisited = day_activities.copy()
    optimized = [unvisited.pop(0)] 
    
    while unvisited:
        last = optimized[-1]
        nearest_idx = 0
        min_dist = float('inf')
        
        for i, current in enumerate(unvisited):
            dist = calculate_distance(
                last["latitude"], last["longitude"],
                current["latitude"], current["longitude"]
            )
            if dist < min_dist:
                min_dist = dist
                nearest_idx = i
        
        optimized.append(unvisited.pop(nearest_idx))
        
    return optimized
