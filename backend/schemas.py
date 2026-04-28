from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class UserLoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict

class AttractionBase(BaseModel):
    name: str
    latitude: float
    longitude: float
    category: str
    rating: Optional[float] = None
    description: str
    address: Optional[str] = None
    opening_hours: Optional[str] = None
    district: str

class Attraction(AttractionBase):
    id: int

    class Config:
        from_attributes = True

class ItineraryItemBase(BaseModel):
    day: int
    time_of_day: str
    activity_name: str
    notes: Optional[str] = None
    attraction_id: Optional[int] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class ItineraryItemCreate(ItineraryItemBase):
    pass

class ItineraryItem(ItineraryItemBase):
    id: int
    itinerary_id: int

    class Config:
        from_attributes = True

class ItineraryBase(BaseModel):
    title: str
    destination: str
    start_date: datetime
    end_date: datetime
    summary: Optional[str] = None
    green_score: Optional[float] = None
    total_cost: Optional[str] = None

class ItineraryCreate(ItineraryBase):
    items: List[ItineraryItemCreate]

class Itinerary(ItineraryBase):
    id: int
    user_id: int
    created_at: datetime
    items: List[ItineraryItem]

    class Config:
        from_attributes = True

class PlanRequest(BaseModel):
    destination: str
    days: int
    interests: List[str]
    budget: Optional[str] = "moderate"
    travel_style: Optional[str] = "balanced"
