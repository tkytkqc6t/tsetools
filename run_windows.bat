@echo off
setlocal
pushd "%~dp0"
if not exist "venv\Scripts\python.exe" (
    echo Virtual environment not found. Run install_windows.bat first.
    popd
    exit /b 1
)
start "TSETools FastAPI" cmd /k "venv\Scripts\python.exe -m uvicorn fastapi_server:app --host 127.0.0.1 --port 8000"
timeout /t 3 >nul
if exist frontend\dist (start http://127.0.0.1:8000/large/) else (start http://127.0.0.1:8000/)
popd
