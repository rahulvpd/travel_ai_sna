from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, DateTime, Text, JSON
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    itineraries = relationship("Itinerary", back_populates="owner")


class Itinerary(Base):
    __tablename__ = "itineraries"

    id = Column(Integer, primary_key=True, index=True)
    destination = Column(String, index=True)
    duration_days = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Travel AI Metrics
    esi_score = Column(Integer, nullable=True)
    eco_score = Column(String, nullable=True)
    fatigue_index = Column(Integer, nullable=True)
    
    # Store the complex generated data structure
    plan_data = Column(JSON, nullable=True)
    llm_summary = Column(Text, nullable=True)

    owner = relationship("User", back_populates="itineraries")

class Place(Base):
    __tablename__ = "places"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    district = Column(String, index=True, nullable=True)
    description = Column(Text, nullable=True)
    
    # New fields for TN Tourism Scraping
    historical_significance = Column(Text, nullable=True)
    images = Column(JSON, nullable=True) # Array of Image URLs
    number_insights = Column(JSON, nullable=True) # Dynamic key-value metrics
    
    created_at = Column(DateTime, default=datetime.utcnow)
