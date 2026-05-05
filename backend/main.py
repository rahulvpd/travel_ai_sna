from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict
import random
import asyncio
import json
import math
from datetime import datetime
import models, database
from database import engine
from routers import ai
from routers import itinerary
from routers import auth
from routers import places as places_router
from services import sna_service
from services import neo4j_service
from neo4j_driver import neo4j_conn

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Travel AI Tamil Nadu API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(itinerary.router)
app.include_router(ai.router)
app.include_router(auth.router)
app.include_router(places_router.router)


class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                pass


manager = ConnectionManager()

VISITOR_DATA = {
    "Marina Beach": {"current": 245, "capacity": 500, "trend": "up"},
    "Meenakshi Temple": {"current": 890, "capacity": 2000, "trend": "stable"},
    "Brihadeeswarar Temple": {"current": 420, "capacity": 1000, "trend": "down"},
    "Mahabalipuram": {"current": 567, "capacity": 800, "trend": "up"},
    "Vivekananda House": {"current": 178, "capacity": 300, "trend": "stable"},
    "Fort St. George": {"current": 156, "capacity": 400, "trend": "down"},
    "Kapaleeshwarar Temple": {"current": 634, "capacity": 1500, "trend": "up"},
    "San Thome Basilica": {"current": 289, "capacity": 600, "trend": "stable"},
    "Apollo Hospital": {"current": 45, "capacity": 100, "trend": "stable"},
    "TIDEL Park": {"current": 312, "capacity": 500, "trend": "down"},
}


@app.get("/")
def read_root():
    return {"message": "Welcome to Travel AI Tamil Nadu API", "version": "2.0.0"}


@app.get("/api/graph")
def get_heritage_graph():
    return neo4j_service.get_neo4j_insights()


@app.post("/api/graph/init")
def init_heritage_graph():
    neo4j_service.initialize_heritage_graph()
    return {"message": "Heritage graph initialized in Neo4j"}


@app.get("/api/graph/centrality")
def get_centrality():
    return neo4j_service.calculate_centrality()


@app.get("/api/graph/communities")
def get_communities():
    return neo4j_service.find_communities()


@app.get("/api/graph/districts")
def get_district_connections():
    return neo4j_service.get_district_connections()


@app.get("/api/neo4j/status")
def get_neo4j_status():
    try:
        neo4j_conn.driver.verify_connectivity()
        return {"status": "connected", "message": "Neo4j is running"}
    except Exception as e:
        return {"status": "disconnected", "message": str(e)}


@app.get("/api/visitor-stats")
async def get_visitor_stats():
    stats = {}
    for place, data in VISITOR_DATA.items():
        stats[place] = {
            "current": data["current"],
            "capacity": data["capacity"],
            "percentage": int((data["current"] / data["capacity"]) * 100),
            "trend": data["trend"],
        }
    return stats


@app.get("/api/visitor-stats/{place_name}")
async def get_place_visitor_stats(place_name: str):
    for place, data in VISITOR_DATA.items():
        if place.lower().replace(" ", "_") == place_name.lower().replace(" ", "_"):
            return {
                "place": place,
                "current": data["current"],
                "capacity": data["capacity"],
                "percentage": int((data["current"] / data["capacity"]) * 100),
                "trend": data["trend"],
            }
    raise HTTPException(status_code=404, detail="Place not found")


def _time_based_multiplier() -> float:
    """Return a multiplier based on time of day (simulates real visitor patterns)."""
    hour = datetime.now().hour
    # Peak hours: 10-12, 16-18; Low: 0-6, 22-24
    if 10 <= hour <= 12 or 16 <= hour <= 18:
        return 1.2 + random.uniform(0, 0.3)  # Peak
    elif 6 <= hour <= 9 or 13 <= hour <= 15:
        return 0.8 + random.uniform(0, 0.2)  # Moderate
    elif 19 <= hour <= 21:
        return 0.6 + random.uniform(0, 0.2)  # Evening decline
    else:
        return 0.1 + random.uniform(0, 0.1)  # Night (near zero)


def _get_db_visitor_baseline():
    """Query the database for attraction data to seed visitor baselines."""
    try:
        db = database.SessionLocal()
        attractions = db.query(models.Attraction).limit(20).all()
        db.close()
        if attractions:
            baselines = {}
            for a in attractions:
                capacity = 500 + hash(a.name) % 2000  # Deterministic capacity
                baselines[a.name] = {
                    "current": int(capacity * 0.4),
                    "capacity": capacity,
                    "trend": "stable",
                    "district": a.district or "Unknown",
                    "category": a.category or "General",
                }
            return baselines
    except Exception:
        pass
    return None


@app.websocket("/ws/visitors")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Try to seed from database first, fall back to hardcoded data
        db_data = _get_db_visitor_baseline()
        live_data = db_data if db_data else dict(VISITOR_DATA)

        while True:
            await asyncio.sleep(5)
            multiplier = _time_based_multiplier()
            updated_data = {}

            for place, data in live_data.items():
                # Time-based fluctuation (not purely random)
                base_change = random.gauss(0, 5)  # Gaussian noise
                change = int(base_change * multiplier)
                prev = data["current"]
                data["current"] = max(
                    5, min(data["capacity"], data["current"] + change)
                )

                # Trend based on rolling direction
                delta = data["current"] - prev
                data["trend"] = (
                    "up" if delta > 3 else ("down" if delta < -3 else "stable")
                )

                updated_data[place] = {
                    "current": data["current"],
                    "capacity": data["capacity"],
                    "percentage": int((data["current"] / data["capacity"]) * 100),
                    "trend": data["trend"],
                    "district": data.get("district", ""),
                    "category": data.get("category", ""),
                }

            await websocket.send_json(
                {
                    "type": "visitor_update",
                    "data": updated_data,
                    "timestamp": datetime.now().isoformat(),
                    "source": "database" if db_data else "simulation",
                }
            )
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)


@app.websocket("/ws/chat")
async def chat_websocket(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)

            if message.get("type") == "chat":
                response = {
                    "type": "ai_response",
                    "message": f"You asked about {message.get('topic', 'Tamil Nadu tourism')}. Our AI is processing your query...",
                    "suggestions": [
                        "Tell me about Chennai heritage sites",
                        "Best places for temple tourism",
                        "Hidden gems in Tamil Nadu",
                        "Food recommendations",
                    ],
                }
                await websocket.send_json(response)
            else:
                await websocket.send_json({"type": "echo", "data": message})
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
