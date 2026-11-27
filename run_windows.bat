@echo off
setlocal EnableExtensions EnableDelayedExpansion
set "REPO_URL=https://github.com/tkytkqc6t/tsetools.git"
set "REPO_BRANCH=main"
set "SCRIPT_DIR=%~dp0"
if exist "%SCRIPT_DIR%fastapi_server.py" (set "REPO_DIR=%SCRIPT_DIR%") else (
    set "REPO_DIR=%SCRIPT_DIR%tsetools"
    if not exist "!REPO_DIR!\.git" git clone --branch %REPO_BRANCH% --single-branch "%REPO_URL%" "!REPO_DIR!"
)
if not exist "%REPO_DIR%\.git" exit /b 1
pushd "%REPO_DIR%"
git fetch origin %REPO_BRANCH%
git checkout %REPO_BRANCH% >nul 2>nul
if errorlevel 1 git checkout -b %REPO_BRANCH% origin/%REPO_BRANCH%
git pull --ff-only origin %REPO_BRANCH% >nul 2>nul
if errorlevel 1 echo Warning: could not fast-forward the local checkout; continuing with its current files.
if not exist "venv\Scripts\python.exe" python -m venv venv
call venv\Scripts\activate.bat
python -m pip install -r requirements.txt
where npm >nul 2>nul
if %ERRORLEVEL% EQU 0 if exist frontend\package.json (
    pushd frontend
    call npm install
    call npm run build
    popd
)
start "TSETools FastAPI" cmd /c "venv\Scripts\python.exe -m uvicorn fastapi_server:app --host 127.0.0.1 --port 8000"
for /l %%i in (1,1,30) do (
    curl --silent --fail http://127.0.0.1:8000/api/v1/health >nul 2>nul
    if not errorlevel 1 goto ready
    timeout /t 1 /nobreak >nul
)
echo The server did not become ready.
popd
exit /b 1
:ready
start "" http://127.0.0.1:8000
popd
endlocal
