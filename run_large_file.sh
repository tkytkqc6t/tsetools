#!/bin/bash
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"
if [ -x "venv/bin/python" ]; then PYTHON="venv/bin/python"; else PYTHON="python3"; fi
exec "$PYTHON" -m uvicorn fastapi_server:app --host 127.0.0.1 --port 8000
