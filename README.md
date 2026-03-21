# Travel AI Tamil Nadu — Fully Functional Product

A full-stack AI-powered tourism platform for Tamil Nadu, built with React 19, Vite 7, and FastAPI.

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- Python (3.9+)
- Groq/Gemini API Key (for AI summarization)

### 2. Backend Setup (FastAPI)
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Set up environment variables in `backend/.env`:
   ```env
   DATABASE_URL=sqlite:///./tourism.db
   VITE_GROQ_API_KEY=your_groq_key
   VITE_GEMINI_API_KEY=your_gemini_key
   ```
4. Run the server:
   ```bash
   python main.py
   ```
   The API will be available at `http://localhost:8000`.

### 3. Frontend Setup (React + Vite)
1. Navigate to the root directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

## ✨ Features
- **Smart Wizard:** 5-step interactive trip planner.
- **AI Orchestration:** Backend-driven itinerary generation based on interests, budget, and real-world attraction data.
- **Real-World Data:** Fetches live data from OpenStreetMap (Overpass API) for all 38 districts of Tamil Nadu.
- **Interactive Maps:** Visualizes routes and attractions using Leaflet/MapLibre.
- **Production Ready:** Zero linting errors and optimized production builds.

## 🛠️ Tech Stack
- **Frontend:** React 19, Tailwind CSS, Framer Motion, Lucide Icons, Vite.
- **Backend:** FastAPI, SQLAlchemy, SQLite (default), Pydantic.
- **Data:** Overpass API (OSM), Groq LLM (Llama 3.3).

---
*Created by Gemini CLI*
