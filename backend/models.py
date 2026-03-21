from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, Boolean, DateTime
from sqlalchemy.orm import relationship
from database import Base
import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    is_active = Column(Boolean, default=True)

    itineraries = relationship("Itinerary", back_populates="owner")

class Attraction(Base):
    __tablename__ = "attractions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    latitude = Column(Float)
    longitude = Column(Float)
    category = Column(String)
    rating = Column(Float, nullable=True)
    description = Column(Text)
    address = Column(String, nullable=True)
    opening_hours = Column(String, nullable=True)
    district = Column(String, index=True)

class Itinerary(Base):
    __tablename__ = "itineraries"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    destination = Column(String)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"))
    summary = Column(Text, nullable=True)
    green_score = Column(Float, nullable=True)
    total_cost = Column(String, nullable=True)

    owner = relationship("User", back_populates="itineraries")
    items = relationship("ItineraryItem", back_populates="itinerary")

class ItineraryItem(Base):
    __tablename__ = "itinerary_items"

    id = Column(Integer, primary_key=True, index=True)
    itinerary_id = Column(Integer, ForeignKey("itineraries.id"))
    day = Column(Integer)
    time_of_day = Column(String) # Morning, Afternoon, Evening
    attraction_id = Column(Integer, ForeignKey("attractions.id"))
    activity_name = Column(String)
    notes = Column(Text, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    itinerary = relationship("Itinerary", back_populates="items")
