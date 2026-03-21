from typing import List, Dict
import math

def calculate_score(attraction: Dict, user_interests: List[str]) -> float:
    """
    Calculate a recommendation score based on:
    - Interest match (40%)
    - Rating (30%)
    - Popularity/Category (30%)
    """
    score = 0.0
    
    # 1. Interest Match
    category = attraction.get("category", "").lower()
    interest_match = any(interest.lower() in category for interest in user_interests)
    if interest_match:
        score += 4.0
    
    # 2. Rating
    rating = attraction.get("rating") or 4.0 # Default if missing
    score += (rating / 5.0) * 3.0
    
    # 3. Category weighting
    if category in ["temple", "monument", "historic"]:
        score += 3.0
    elif category in ["nature", "park", "beach"]:
        score += 2.5
    else:
        score += 1.5
        
    return score

def rank_attractions(attractions: List[Dict], user_interests: List[str]) -> List[Dict]:
    for attraction in attractions:
        attraction["score"] = calculate_score(attraction, user_interests)
    
    return sorted(attractions, key=lambda x: x["score"], reverse=True)
