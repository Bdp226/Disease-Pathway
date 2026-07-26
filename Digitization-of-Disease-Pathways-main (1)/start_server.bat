@echo off
echo ==============================================
echo FAANG Disease Pathways - FULL SYSTEM STARTUP
echo ==============================================

echo [1/4] Checking Python installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in your PATH.
    echo Please install Python from https://www.python.org/downloads/ and check Add Python to PATH.
    pause
    exit /b
)

echo [2/4] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in your PATH.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b
)

echo [3/4] Installing dependencies (Backend and Frontend)...
echo -- Installing Backend (Python) dependencies...
python -m pip install -r requirements.txt

echo -- Installing Frontend (React) dependencies...
cd frontend\disease-pathways
call npm install
cd ..\..

echo [4/4] Starting the Servers...
echo -- Starting FastAPI Backend (Port 8000)...
start cmd /k "title Backend Server && python -m uvicorn main:app --reload"

echo -- Starting React Frontend (Vite)...
start cmd /k "title Frontend Server && cd frontend\disease-pathways && npm run dev"

echo.
echo ==============================================
echo SUCCESS! 
echo Both servers are launching in separate windows.
echo - Backend API: http://127.0.0.1:8000/docs
echo - Frontend UI: Look for the 'Local:' URL in the Frontend terminal window!
echo ==============================================
pause
