@echo off
setlocal
pushd "%~dp0"

if exist "venv\Scripts\python.exe" (
    set "PYTHON=venv\Scripts\python.exe"
) else (
    set "PYTHON=python"
)

"%PYTHON%" run_test_suite.py unit
set "RESULT=%ERRORLEVEL%"
popd
exit /b %RESULT%
