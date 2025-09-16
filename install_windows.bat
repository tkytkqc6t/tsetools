@echo off
setlocal

set REPO_URL=https://github.com/tkytkqc6t/tsetools.git
set REPO_NAME=tsetools

REM 1. Clone repo if not exists
if not exist %REPO_NAME% (
    echo Cloning repository...
    git clone %REPO_URL%
)

cd %REPO_NAME%

REM 2. Create virtual environment if not exists
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)

REM 3. Activate venv
call venv\Scripts\activate.bat

REM 4. Install dependencies
echo Installing dependencies...
pip install -r requirements.txt

REM 5. Run server
echo Starting server...
start "" python server.py

REM 6. Open browser
timeout /t 3 >nul
start http://127.0.0.1:5000

endlocal
