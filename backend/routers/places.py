"""
Travel AI Tamil Nadu — Places Router
Serves district and attraction data from the database.
Replaces the static districts.js frontend import for production.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
import models
from database import get_db

router = APIRouter(prefix="/api/places", tags=["places"])


@router.get("/districts")
def get_all_districts(db: Session = Depends(get_db)):
    """Return all unique districts with their attraction counts."""
    results = (
        db.query(
            models.Attraction.district,
            models.Attraction.category,
        )
        .all()
    )

    districts = {}
    for row in results:
        d = row.district
        if d not in districts:
            districts[d] = {"name": d, "attractionCount": 0, "categories": set()}
        districts[d]["attractionCount"] += 1
        if row.category:
            districts[d]["categories"].add(row.category)

    # Convert sets to lists for JSON serialization
    for d in districts.values():
        d["categories"] = list(d["categories"])

    return list(districts.values())


@router.get("/districts/{district_name}")
def get_district_attractions(
    district_name: str,
    category: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    """Return all attractions in a given district, optionally filtered by category."""
    query = db.query(models.Attraction).filter(
        models.Attraction.district.ilike(f"%{district_name}%")
    )
    if category:
        query = query.filter(models.Attraction.category.ilike(f"%{category}%"))

    attractions = query.offset(skip).limit(limit).all()

    return [
        {
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
        }
        for a in attractions
    ]


@router.get("/search")
def search_attractions(
    q: str = Query(..., min_length=2),
    db: Session = Depends(get_db),
):
    """Search attractions by name (case-insensitive partial match)."""
    results = (
        db.query(models.Attraction)
        .filter(models.Attraction.name.ilike(f"%{q}%"))
        .limit(20)
        .all()
    )

    return [
        {
            "id": a.id,
            "name": a.name,
            "latitude": a.latitude,
            "longitude": a.longitude,
            "category": a.category,
            "rating": a.rating,
            "description": a.description,
            "district": a.district,
        }
        for a in results
    ]


@router.get("/{place_id}")
def get_attraction_detail(place_id: int, db: Session = Depends(get_db)):
    """Return a single attraction by its ID."""
    attraction = db.query(models.Attraction).filter(models.Attraction.id == place_id).first()
    if not attraction:
        raise HTTPException(status_code=404, detail="Attraction not found")

    return {
        "id": attraction.id,
        "name": attraction.name,
        "latitude": attraction.latitude,
        "longitude": attraction.longitude,
        "category": attraction.category,
        "rating": attraction.rating,
        "description": attraction.description,
        "address": attraction.address,
        "opening_hours": attraction.opening_hours,
        "district": attraction.district,
    }
