#!/bin/bash

# AutoML Pipeline - Setup Script for macOS/Linux

echo ""
echo "========================================"
echo "    AutoML Pipeline Setup"
echo "========================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed"
    echo "Please install Python 3.8+ from https://www.python.org/"
    exit 1
fi

python3 --version

echo "[1/5] Python found. Creating virtual environment..."
cd backend

if [ -d "venv" ]; then
    echo "Virtual environment already exists, skipping creation"
else
    python3 -m venv venv
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to create virtual environment"
        exit 1
    fi
fi

echo "[2/5] Activating virtual environment..."
source venv/bin/activate
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to activate virtual environment"
    exit 1
fi

echo "[3/5] Installing Python dependencies..."
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies"
    exit 1
fi

echo "[4/5] Setup complete!"
echo ""
echo "========================================"
echo "    Starting AutoML Pipeline Server"
echo "========================================"
echo ""
echo "The Flask server will start on http://localhost:5000"
echo ""
echo "Next steps:"
echo "  1. The Flask server will start below"
echo "  2. Keep this window open"
echo "  3. Open the file: ../frontend/index.html in your web browser"
echo "  4. Upload your CSV or Excel file to get started"
echo ""
echo "To stop the server, press Ctrl+C"
echo ""
read -p "Press Enter to continue..."

echo "[5/5] Starting Flask server..."
python3 app.py
