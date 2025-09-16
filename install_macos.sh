#!/bin/bash
set -e  # exit on error

REPO_URL="https://github.com/tkytkqc6t/tsetools.git"
REPO_NAME="tsetools"

# 1. Clone repo if not exists
if [ ! -d "$REPO_NAME" ]; then
    echo "Cloning repository..."
    git clone "$REPO_URL"
fi

cd "$REPO_NAME"

# 2. Create virtual environment if not exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate venv
echo "Activating virtual environment..."
source venv/bin/activate

# 3. Install dependencies
echo "Installing dependencies..."
pip3 install --no-cache-dir -r requirements.txt

# 4. Run server in background
echo "Starting server..."
python3 server.py &

# Give server a few seconds to start
sleep 3

# 5. Open browser (macOS only)
URL="http://127.0.0.1:5000"
echo "Opening browser at $URL..."
open "$URL"

# Keep script alive so server doesn’t exit
wait
