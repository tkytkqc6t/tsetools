@echo off
setlocal
if exist "venv\Scripts\python.exe" (
    venv\Scripts\python.exe -m uvicorn fastapi_server:app --host 127.0.0.1 --port 8000
) else (
    python -m uvicorn fastapi_server:app --host 127.0.0.1 --port 8000
)
