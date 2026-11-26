#!/bin/bash
set -e

REPO_URL="https://github.com/tkytkqc6t/tsetools.git"
REPO_BRANCH="main"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "$SCRIPT_DIR/fastapi_server.py" ] && [ -f "$SCRIPT_DIR/requirements.txt" ]; then REPO_DIR="$SCRIPT_DIR"; else
    REPO_DIR="$SCRIPT_DIR/tsetools"
    [ -d "$REPO_DIR/.git" ] || git clone --branch "$REPO_BRANCH" --single-branch "$REPO_URL" "$REPO_DIR"
fi
cd "$REPO_DIR"
[ -x venv/bin/python ] || python3 -m venv venv
venv/bin/python -m pip install -r requirements.txt
if command -v npm >/dev/null 2>&1 && [ -f frontend/package.json ]; then (cd frontend && npm install && npm run build); fi
venv/bin/python -m uvicorn fastapi_server:app --host 127.0.0.1 --port 8000 &
SERVER_PID=$!
trap 'kill "$SERVER_PID" 2>/dev/null || true' EXIT
for _ in {1..30}; do curl --silent --fail http://127.0.0.1:8000/api/v1/health >/dev/null && break; sleep 1; done
curl --silent --fail http://127.0.0.1:8000/api/v1/health >/dev/null || { echo "The server did not become ready." >&2; exit 1; }
[ -d frontend/dist ] && URL="http://127.0.0.1:8000/large/" || URL="http://127.0.0.1:8000/"
open "$URL"
wait "$SERVER_PID"
