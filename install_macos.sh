#!/bin/bash
set -e

REPO_URL="https://github.com/tkytkqc6t/tsetools.git"
REPO_BRANCH="main"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "$SCRIPT_DIR/server.py" ] && [ -f "$SCRIPT_DIR/requirements.txt" ]; then REPO_DIR="$SCRIPT_DIR"; else
    REPO_DIR="$SCRIPT_DIR/tsetools"
    [ -d "$REPO_DIR/.git" ] || git clone --branch "$REPO_BRANCH" --single-branch "$REPO_URL" "$REPO_DIR"
fi
cd "$REPO_DIR"
if [ -d .git ]; then
    git fetch origin "$REPO_BRANCH"
    git checkout "$REPO_BRANCH" 2>/dev/null || git checkout -b "$REPO_BRANCH" "origin/$REPO_BRANCH"
    git pull --ff-only origin "$REPO_BRANCH" || echo "Warning: could not fast-forward the local checkout; continuing with its current files."
fi
[ -x venv/bin/python ] || python3 -m venv venv
venv/bin/python -m pip install --upgrade pip
venv/bin/python -m pip install --no-cache-dir -r requirements.txt
if command -v npm >/dev/null 2>&1 && [ -f frontend/package.json ]; then (cd frontend && npm install && npm run build); else echo "npm was not found; the legacy UI will be available at /."; fi
TS_TOOLS_PORT=8000 venv/bin/python server.py &
SERVER_PID=$!
trap 'kill "$SERVER_PID" 2>/dev/null || true' EXIT
for _ in {1..30}; do curl --silent --fail http://127.0.0.1:8000/api/v1/health >/dev/null && break; sleep 1; done
curl --silent --fail http://127.0.0.1:8000/api/v1/health >/dev/null || { echo "The server did not become ready." >&2; exit 1; }
URL="http://127.0.0.1:8000"
open "$URL"
wait "$SERVER_PID"
