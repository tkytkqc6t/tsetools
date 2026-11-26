#!/bin/bash
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"
if [ -x "venv/bin/python" ]; then PYTHON="venv/bin/python"; else PYTHON="python3"; fi
"$PYTHON" -m uvicorn fastapi_server:app --host 127.0.0.1 --port 8000 &
SERVER_PID=$!
sleep 3
if [ -d "frontend/dist" ]; then URL="http://127.0.0.1:8000/large/"; else URL="http://127.0.0.1:8000/"; fi
open "$URL"
wait "$SERVER_PID"
