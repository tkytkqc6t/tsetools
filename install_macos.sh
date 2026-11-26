#!/bin/bash
set -e

REPO_URL="https://github.com/tkytkqc6t/tsetools.git"
REPO_NAME="tsetools"
if [ ! -d "$REPO_NAME" ]; then git clone "$REPO_URL"; fi
cd "$REPO_NAME"
if [ ! -d "venv" ]; then python3 -m venv venv; fi
source venv/bin/activate
python -m pip install --no-cache-dir -r requirements.txt

if command -v npm >/dev/null 2>&1; then
    (cd frontend && npm install && npm run build)
else
    echo "npm was not found; the legacy UI will be available at /."
fi

venv/bin/python -m uvicorn fastapi_server:app --host 127.0.0.1 --port 8000 &
SERVER_PID=$!
sleep 3
if [ -d "frontend/dist" ]; then URL="http://127.0.0.1:8000/large/"; else URL="http://127.0.0.1:8000/"; fi
open "$URL"
wait "$SERVER_PID"
