@echo off
title Tamil Nadu Tourism AI - Development Server
color 0A
echo.
echo ========================================
echo   Tamil Nadu Tourism AI
echo   Version: 3.0 Complete
echo ========================================
echo.
echo Stopping any existing servers...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Starting development server...
echo.
cd /d C:\Users\HP\Desktop\tourism
start "" npm run dev

echo Waiting for server to start...
timeout /t 5 /nobreak >nul

echo.
echo Opening browser...
start http://localhost:5173

echo.
echo ========================================
echo   SERVER RUNNING
echo ========================================
echo.
echo   Main Site:  http://localhost:5173
echo   Chennai:    http://localhost:5173/destinations/chn
echo   Planner:    http://localhost:5173/planner
echo.
echo   Press Ctrl+C to stop
echo ========================================
echo.
pause
