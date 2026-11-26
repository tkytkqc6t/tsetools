@echo off
setlocal
set REPO_URL=https://github.com/tkytkqc6t/tsetools.git
set REPO_NAME=tsetools
if not exist %REPO_NAME% git clone %REPO_URL%
cd %REPO_NAME%
if not exist venv python -m venv venv
call venv\Scripts\activate.bat
python -m pip install -r requirements.txt

where npm >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    pushd frontend
    call npm install
    call npm run build
    popd
) else echo npm was not found; the legacy UI will be available at /.

start "TSETools FastAPI" cmd /k "venv\Scripts\python.exe -m uvicorn fastapi_server:app --host 127.0.0.1 --port 8000"
timeout /t 3 >nul
if exist frontend\dist (start http://127.0.0.1:8000/large/) else (start http://127.0.0.1:8000/)
endlocal
