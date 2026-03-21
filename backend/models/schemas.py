from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime

class UserBase(BaseModel):
    email: str
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class ItineraryRequest(BaseModel):
    destination: str
    travelers: int
    budget: str
    interests: list[str]
    duration: int

class ItineraryResponse(BaseModel):
    id: int
    destination: str
    duration_days: int
    plan_data: Any # JSON structure containing days, items, metrics
    llm_summary: Optional[str] = None
    
    # Extracted Metrics
    esi_score: Optional[int]
    eco_score: Optional[str]
    fatigue_index: Optional[int]
    
    class Config:
        from_attributes = True

class PlaceBase(BaseModel):
    name: str
    district: Optional[str] = None
    description: Optional[str] = None
    historical_significance: Optional[str] = None
    images: Optional[list[str]] = None
    number_insights: Optional[dict] = None

class PlaceCreate(PlaceBase):
    pass

class PlaceResponse(PlaceBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True
