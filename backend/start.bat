@echo off
echo Starting JAMA VA Abstractor Backend...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ and try again
    pause
    exit /b 1
)

REM Check if we're in the backend directory
if not exist "requirements.txt" (
    echo ERROR: requirements.txt not found
    echo Please run this script from the backend directory
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist ".env" (
    echo Creating .env file from template...
    copy ".env.example" ".env"
    echo.
    echo IMPORTANT: Please edit .env file and add your OpenAI API key
    echo Press any key to open .env file in notepad...
    pause >nul
    notepad .env
)

REM Install dependencies
echo Installing Python dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

REM Create necessary directories
if not exist "uploads" mkdir uploads
if not exist "output" mkdir output

echo.
echo Backend setup complete!
echo Starting server on http://localhost:8000
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the server
uvicorn main:app --reload --host 127.0.0.1 --port 8000