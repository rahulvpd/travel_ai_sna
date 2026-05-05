# TravelAI Tamil Nadu — AI-Native Tourism Platform & SNA

**Version:** 5.0 (Production Ready) | **Date:** May 2026 | **Platform:** React 19 + Vite 7 + FastAPI + Neo4j

---

## 1. Executive Summary

**TravelAI Tamil Nadu** is a state-of-the-art, AI-native tourism intelligence platform. It serves as a high-fidelity digital twin and guide to the 38 districts of Tamil Nadu. The project distinguishes itself through a **7-engine AI orchestration pipeline**, a massive curated knowledge base of over 2,500 years of civilisational history, and a modern, high-performance UI built on React 19.

The platform provides personalized trip planning, real-time cultural insights, social network analysis (SNA) of heritage sites, and specialized modules for food, festivals, and travel tools. With a backend powered by **FastAPI** and a **Neo4j Graph Database**, the system computes complex relationships between historical dynasties, architectural styles, and geographic circuits.

## 2. Key Features & Innovations

- **7-Engine AI Fallback**: Ensures 100% uptime for AI features using a cascade pattern (Gemini 2.0 Flash → Groq Llama 4 Scout → Mistral/OpenRouter → HuggingFace).
- **Indic Language Intelligence**: First-of-its-kind integration with **Sarvam AI** for native Tamil translation in a tourism context.
- **Smart Mobility Planner**: Not just a list of places, but an optimized sequence of travel based on real-world geography and durations using the Haversine Distance formula.
- **Heritage SNA (Social Network Analysis)**: Visualizes historical connections using 3D graph networks (`react-force-graph-3d`).
- **Infrastructure Dashboard**: Real-time access to hospitals, petrol pumps, and transport hubs for every district.
- **Interactive Maps:** Visualizes routes and attractions using a hybrid mapping system (Ola Maps & Leaflet).

## 3. Technical Architecture

### 3.1 Frontend (React 19 SPA)
- **Framework**: React 19.2.0 (concurrent rendering) & Vite 7.2.4.
- **Animations & Styling**: Framer Motion 12.34.0, Tailwind CSS 3.4.17 (Dark Glassmorphism aesthetic).
- **Key Modules**: Particle movement backgrounds, text glows, real-time filtering, custom map overlays.

### 3.2 Backend (FastAPI Knowledge Engine)
- **API Framework**: FastAPI (Python 3.13) providing asynchronous endpoints.
- **Graph Database**: **Neo4j** used for modeling "Heritage Site Bonds" and complex relationship queries (Dynasty → Architecture → Location).
- **Relational Database**: **PostgreSQL** / **SQLite** (`tourism.db`) for user data and persistent static data.
- **AI/LLM Services**: Caching mechanisms, multi-tier LLM routing, and sustainability engines.

## 4. Setup and Execution Steps

### 4.1 Prerequisites
- **Node.js** (v18+)
- **Python** (3.9+)
- **Neo4j** (Optional, for graph database visualizer)
- API Keys: Google Gemini, Groq, Sarvam AI (optional but recommended)

### 4.2 Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment (optional but recommended):
   ```bash
   python -m venv .venv
   # Windows
   .venv\Scripts\activate
   # Mac/Linux
   source .venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up environment variables by copying `.env.example` to `.env` (or create a new `.env` file):
   ```env
   DATABASE_URL=sqlite:///./tourism.db
   NEO4J_URI=bolt://localhost:7687
   NEO4J_USER=neo4j
   NEO4J_PASSWORD=your_password
   ```
5. Run the server:
   ```bash
   python main.py
   # or
   uvicorn main:app --reload
   ```
   *The API will be available at `http://localhost:8000`.*

### 4.3 Frontend Setup
1. Open a new terminal and navigate to the root project directory.
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Set up frontend environment variables (create a `.env` file in the root):
   ```env
   VITE_GEMINI_API_KEY=your_gemini_key
   VITE_GROQ_API_KEY=your_groq_key
   VITE_SARVAM_API_KEY=your_sarvam_key
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
   *The application will be available at `http://localhost:5173`.*

### 4.4 Automated Startup (Windows)
A `START_SERVER.bat` file is provided for Windows users to launch both the frontend and backend simultaneously in one click.

## 5. Directory Structure
```text
tourism/
├── backend/                  # FastAPI Application
│   ├── services/             # Logic (AI, Maps, Optimization, Neo4j)
│   ├── routers/              # API Endpoints
│   └── neo4j_driver.py       # Graph DB Integration
├── src/                      # React Frontend
│   ├── components/           # UI, layout, and Chennai-exclusive modules
│   ├── pages/                # 14 Major application routes
│   ├── services/             # Frontend logic (AI, Translation, Data)
│   └── data/                 # Curated knowledge base
├── public/                   # Static assets & backgrounds
└── package.json              # Project metadata and dependencies
```
