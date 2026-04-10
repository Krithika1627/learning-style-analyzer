@echo off
REM Setup and run the backend
cd /d "%~dp0"

echo Checking Python installation...
where python.exe >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Python not found in PATH
    echo Please install Python from: https://www.python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation
    pause
    exit /b 1
)

echo.
echo Installing dependencies...
pip install -r requirements.txt --quiet

if %ERRORLEVEL% NEQ 0 (
    echo Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Starting backend server...
python -m uvicorn api:app --reload --host 0.0.0.0 --port 8000

pause
