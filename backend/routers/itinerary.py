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
from auth import get_current_user
import datetime

router = APIRouter(prefix="/api/itinerary", tags=["itinerary"])


@router.post("/generate", response_model=schemas.Itinerary)
async def generate_itinerary_plan(
    request: schemas.PlanRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
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

    ranked_places = rank_attractions(places_list, request.interests)
    top_places = ranked_places[:request.days * 3]
    day_clusters = cluster_activities(top_places, request.days)

    new_itinerary = models.Itinerary(
        title=f"AI Trip to {request.destination}",
        destination=request.destination,
        start_date=datetime.datetime.now(),
        end_date=datetime.datetime.now() + datetime.timedelta(days=request.days),
        user_id=current_user.id
    )
    db.add(new_itinerary)
    db.commit()
    db.refresh(new_itinerary)

    final_items_data = []

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

    sust = get_sustainability_score(final_items_data, request.travel_style)
    new_itinerary.green_score = sust["green_score"]

    if final_items_data:
        weather = await get_forecast(final_items_data[0]["latitude"], final_items_data[0]["longitude"])
        weather_text = f"Expected weather: {weather['summary']} ({weather['temp']}°C)"
    else:
        weather_text = ""

    activities_names = [p["name"] for p in final_items_data]
    summary = await summarize_itinerary(request.destination, request.days, activities_names[:6])
    new_itinerary.summary = f"{summary} {weather_text}"

    daily_cost = 1000 if request.budget == "low" else (3000 if request.budget == "moderate" else 7000)
    new_itinerary.total_cost = f"₹{daily_cost * request.days}"

    db.commit()
    db.refresh(new_itinerary)
    return new_itinerary


@router.get("/list", response_model=list[schemas.Itinerary])
def get_user_itineraries(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return db.query(models.Itinerary).filter(models.Itinerary.user_id == current_user.id).order_by(models.Itinerary.created_at.desc()).all()


@router.get("/{itinerary_id}", response_model=schemas.Itinerary)
def get_itinerary(
    itinerary_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    itinerary = db.query(models.Itinerary).filter(
        models.Itinerary.id == itinerary_id,
        models.Itinerary.user_id == current_user.id
    ).first()
    if not itinerary:
        raise HTTPException(status_code=404, detail="Itinerary not found")
    return itinerary


@router.put("/{itinerary_id}", response_model=schemas.Itinerary)
def update_itinerary(
    itinerary_id: int,
    itinerary_data: schemas.ItineraryCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    itinerary = db.query(models.Itinerary).filter(
        models.Itinerary.id == itinerary_id,
        models.Itinerary.user_id == current_user.id
    ).first()
    if not itinerary:
        raise HTTPException(status_code=404, detail="Itinerary not found")

    itinerary.title = itinerary_data.title
    itinerary.destination = itinerary_data.destination
    itinerary.start_date = itinerary_data.start_date
    itinerary.end_date = itinerary_data.end_date
    if itinerary_data.summary:
        itinerary.summary = itinerary_data.summary

    db.query(models.ItineraryItem).filter(
        models.ItineraryItem.itinerary_id == itinerary_id
    ).delete()

    for item_data in itinerary_data.items:
        item = models.ItineraryItem(
            itinerary_id=itinerary_id,
            **item_data.model_dump()
        )
        db.add(item)

    db.commit()
    db.refresh(itinerary)
    return itinerary


@router.delete("/{itinerary_id}")
def delete_itinerary(
    itinerary_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    itinerary = db.query(models.Itinerary).filter(
        models.Itinerary.id == itinerary_id,
        models.Itinerary.user_id == current_user.id
    ).first()
    if not itinerary:
        raise HTTPException(status_code=404, detail="Itinerary not found")

    db.query(models.ItineraryItem).filter(
        models.ItineraryItem.itinerary_id == itinerary_id
    ).delete()

    db.delete(itinerary)
    db.commit()
    return {"message": "Itinerary deleted successfully"}


@router.post("/save", response_model=schemas.Itinerary)
def save_itinerary(
    itinerary_data: schemas.ItineraryCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    new_itinerary = models.Itinerary(
        title=itinerary_data.title,
        destination=itinerary_data.destination,
        start_date=itinerary_data.start_date,
        end_date=itinerary_data.end_date,
        user_id=current_user.id
    )
    db.add(new_itinerary)
    db.commit()
    db.refresh(new_itinerary)

    for item_data in itinerary_data.items:
        item = models.ItineraryItem(
            itinerary_id=new_itinerary.id,
            **item_data.model_dump()
        )
        db.add(item)

    db.commit()
    db.refresh(new_itinerary)
    return new_itinerary