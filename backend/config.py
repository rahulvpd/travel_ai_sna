"""
Travel AI Tamil Nadu — Application Configuration
Centralized settings loaded from environment variables.
"""
import os
from dotenv import load_dotenv

load_dotenv()

# ── Database ────────────────────────────────────────────────────
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./tourism.db")

# ── Security / JWT ──────────────────────────────────────────────
SECRET_KEY = os.getenv("SECRET_KEY", "travel-ai-tamil-nadu-secret-key-2026-change-in-production")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# ── AI Engine Keys ──────────────────────────────────────────────
GEMINI_API_KEY = os.getenv("VITE_GEMINI_API_KEY") or os.getenv("GEMINI_API_KEY", "")
GROQ_API_KEY = os.getenv("VITE_GROQ_API_KEY") or os.getenv("GROQ_API_KEY", "")
NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY") or os.getenv("VITE_NVIDIA_API_KEY", "")
MISTRAL_API_KEY = os.getenv("VITE_MISTRAL_API_KEY", "")
OPENROUTER_API_KEY = os.getenv("VITE_OPENROUTER_API_KEY", "")
TOGETHER_API_KEY = os.getenv("VITE_TOGETHER_API_KEY", "")
COHERE_API_KEY = os.getenv("VITE_COHERE_API_KEY", "")

# ── Neo4j ───────────────────────────────────────────────────────
NEO4J_URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "password")
NEO4J_AUTH_ENABLED = os.getenv("NEO4J_AUTH_ENABLED", "true").lower() == "true"

# ── CORS ────────────────────────────────────────────────────────
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")
