@echo off
echo ========================================
echo TravelAI Tamil Nadu - Launching System
echo ========================================
echo.
echo 1. Starting FastAPI Backend Server...
cd /d C:\Users\HP\Desktop\tourism\backend
start "TravelAI Backend" cmd /k "python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

echo.
echo 2. Starting Vite Frontend Server...
cd /d C:\Users\HP\Desktop\tourism
start "" http://localhost:5173
start "TravelAI Frontend" cmd /k "npm run dev"
