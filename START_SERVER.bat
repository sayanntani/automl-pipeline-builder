@echo off
REM AutoML Pipeline - Setup Script for Windows

echo.
echo ========================================
echo    AutoML Pipeline Setup
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://www.python.org/
    echo Make sure to check "Add Python to PATH" during installation
    pause
    exit /b 1
)

echo [1/5] Python found. Creating virtual environment...
cd backend
if exist venv (
    echo Virtual environment already exists, skipping creation
) else (
    python -m venv venv
    if %errorlevel% neq 0 (
        echo ERROR: Failed to create virtual environment
        pause
        exit /b 1
    )
)

echo [2/5] Activating virtual environment...
call venv\Scripts\activate.bat
if %errorlevel% neq 0 (
    echo ERROR: Failed to activate virtual environment
    pause
    exit /b 1
)

echo [3/5] Installing Python dependencies...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo [4/5] Setup complete!
echo.
echo ========================================
echo    Starting AutoML Pipeline Server
echo ========================================
echo.
echo The Flask server will start on http://localhost:5000
echo.
echo Next steps:
echo   1. The Flask server will start below
echo   2. Keep this window open
echo   3. Open the file: ..\frontend\index.html in your web browser
echo   4. Upload your CSV or Excel file to get started
echo.
echo To stop the server, press Ctrl+C
echo.
pause

echo [5/5] Starting Flask server...
python app.py
