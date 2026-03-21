from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import models, database
from database import engine
from routers import itinerary
from services import sna_service

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Travel AI Tamil Nadu API")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(itinerary.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Travel AI Tamil Nadu API", "version": "1.0.0"}

@app.get("/api/graph")
def get_heritage_graph():
    return sna_service.get_graph_insights()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
