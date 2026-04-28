from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict
import random
import asyncio
import json
import models, database
from database import engine
from routers import ai
from routers import itinerary
from routers import auth
from services import sna_service

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
    return sna_service.get_graph_insights()

@app.get("/api/visitor-stats")
async def get_visitor_stats():
    stats = {}
    for place, data in VISITOR_DATA.items():
        stats[place] = {
            "current": data["current"],
            "capacity": data["capacity"],
            "percentage": int((data["current"] / data["capacity"]) * 100),
            "trend": data["trend"]
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
                "trend": data["trend"]
            }
    raise HTTPException(status_code=404, detail="Place not found")

@app.websocket("/ws/visitors")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await asyncio.sleep(5)
            updated_data = {}
            for place, data in VISITOR_DATA.items():
                change = random.randint(-10, 15)
                data["current"] = max(10, min(data["capacity"], data["current"] + change))
                data["trend"] = "up" if change > 5 else ("down" if change < -5 else "stable")
                updated_data[place] = {
                    "current": data["current"],
                    "percentage": int((data["current"] / data["capacity"]) * 100),
                    "trend": data["trend"]
                }

            await websocket.send_json({
                "type": "visitor_update",
                "data": updated_data,
                "timestamp": asyncio.get_event_loop().time()
            })
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
                        "Food recommendations"
                    ]
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