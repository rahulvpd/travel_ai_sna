from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models, schemas, database
from database import get_db
from services.place_service import fetch_attractions
from services.recommendation_engine import rank_attractions
from services.llm_service import summarize_itinerary
from services.optimizer import cluster_activities, optimize_route
from services.weather_service import get_forecast
from services.sustainability_engine import get_sustainability_score
import datetime

router = APIRouter(prefix="/itinerary", tags=["itinerary"])

@router.post("/generate", response_model=schemas.Itinerary)
async def generate_itinerary_plan(request: schemas.PlanRequest, db: Session = Depends(get_db)):
    # 1. Fetch Real Attractions
    places = db.query(models.Attraction).filter(models.Attraction.district == request.destination).all()
    if not places:
        external_places = await fetch_attractions(request.destination)
        for p in external_places:
            db_place = models.Attraction(**p)
            db.add(db_place)
        db.commit()
        places = db.query(models.Attraction).filter(models.Attraction.district == request.destination).all()
    
    if not places:
        raise HTTPException(status_code=404, detail="No attractions found for this destination")

    # 2. Convert to Dict for ranking and services
    places_list = []
    for p in places:
        places_list.append({
            "id": p.id, 
            "name": p.name, 
            "category": p.category, 
            "rating": p.rating, 
            "description": p.description,
            "latitude": p.latitude,
            "longitude": p.longitude
        })
    
    # 3. Rank by Interests
    ranked_places = rank_attractions(places_list, request.interests)
    
    # 4. Limit to what we can actually fit (max 3 per day)
    top_places = ranked_places[:request.days * 3]
    
    # 5. Cluster by Area
    day_clusters = cluster_activities(top_places, request.days)
    
    # 6. Create Itinerary Object
    new_itinerary = models.Itinerary(
        title=f"AI Trip to {request.destination}",
        destination=request.destination,
        start_date=datetime.datetime.now(),
        end_date=datetime.datetime.now() + datetime.timedelta(days=request.days),
        user_id=1
    )
    db.add(new_itinerary)
    db.commit()
    db.refresh(new_itinerary)
    
    # 7. Final items list for summary/sustainability
    final_items_data = []

    # 8. Optimize each day and add to DB
    for day_idx, cluster in enumerate(day_clusters):
        day_num = day_idx + 1
        optimized_day = optimize_route(cluster)
        
        for i, place in enumerate(optimized_day):
            time_slots = ["Morning", "Afternoon", "Evening"]
            time_of_day = time_slots[i] if i < 3 else "Evening"
            
            item = models.ItineraryItem(
                itinerary_id=new_itinerary.id,
                day=day_num,
                time_of_day=time_of_day,
                attraction_id=place["id"],
                activity_name=f"Visit {place['name']}",
                notes=place["description"][:200],
                latitude=place["latitude"],
                longitude=place["longitude"]
            )
            db.add(item)
            final_items_data.append(place)
    
    # 9. Enrich with specialized services
    # Sustainability
    sust = get_sustainability_score(final_items_data, request.travel_style)
    new_itinerary.green_score = sust["green_score"]
    
    # Weather (from the first location)
    if final_items_data:
        weather = await get_forecast(final_items_data[0]["latitude"], final_items_data[0]["longitude"])
        weather_text = f"Expected weather: {weather['summary']} ({weather['temp']}°C)"
    else:
        weather_text = ""

    # LLM Summary
    activities_names = [p["name"] for p in final_items_data]
    summary = await summarize_itinerary(request.destination, request.days, activities_names[:6])
    new_itinerary.summary = f"{summary} {weather_text}"
    
    # Estimated Cost (Simple heuristic)
    daily_cost = 1000 if request.budget == "low" else (3000 if request.budget == "moderate" else 7000)
    new_itinerary.total_cost = f"₹{daily_cost * request.days}"

    db.commit()
    db.refresh(new_itinerary)
    return new_itinerary

@router.get("/list", response_model=list[schemas.Itinerary])
def get_itineraries(db: Session = Depends(get_db)):
    return db.query(models.Itinerary).all()
