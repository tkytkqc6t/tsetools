@echo off
setlocal

set REPO_NAME=tsetools

if not exist %REPO_NAME% (
    echo Repository %REPO_NAME% not found! Run install_windows.bat first.
    exit /b 1
)

cd %REPO_NAME%

REM Pull latest code from main
echo Pulling latest changes from main...
git checkout main
git pull origin main

REM Activate venv
call venv\Scripts\activate.bat

REM Run server
echo Starting server...
start "" python server.py

REM Open browser
timeout /t 3 >nul
start http://127.0.0.1:5000

endlocal
