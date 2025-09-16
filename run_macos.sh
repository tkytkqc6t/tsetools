#!/bin/bash
set -e  # exit on error

REPO_NAME="tsetools"
URL="http://127.0.0.1:5000"

# Go into repo folder
cd "$REPO_NAME" || { echo "Repository $REPO_NAME not found! Run install_macos.sh first."; exit 1; }

# Pull latest code from main
echo "Pulling latest changes from main..."
git checkout main
git pull origin main

# Activate venv
echo "Activating virtual environment..."
source venv/bin/activate

# Run server in background
echo "Starting server..."
python3 server.py &

# Give server a few seconds to start
sleep 3

# Open browser (macOS only)
echo "Opening browser at $URL..."
open "$URL"

# Keep script alive so server doesn’t exit
wait
