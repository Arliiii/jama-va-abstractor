@echo off
echo.
echo 🧪 JAMA VA Abstractor Backend Test
echo ====================================
echo.

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python 3.8+ and try again
    pause
    exit /b 1
)

REM Check if requests library is available
python -c "import requests" 2>nul
if errorlevel 1 (
    echo ⚠️ Installing requests library for testing...
    pip install requests
    if errorlevel 1 (
        echo ❌ Failed to install requests library
        pause
        exit /b 1
    )
)

echo Running backend test suite...
echo.

python test_backend.py

echo.
echo Test completed. Press any key to exit...
pause >nul