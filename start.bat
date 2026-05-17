@echo off
setlocal
set ROOT=%~dp0

echo.
echo  ================================
echo   Ringo — Starting all services
echo  ================================
echo.

REM ── Backend (Flask on :5000) ─────────────────────────────────────────────
echo [1/2] Starting backend  (http://localhost:5000)
start "Ringo  Backend" cmd /k "cd /d %ROOT%backend && (if exist venv\Scripts\activate.bat (call venv\Scripts\activate) else (call .venv\Scripts\activate)) && python run.py"

REM Give Flask a moment to boot before Next.js tries API calls
timeout /t 3 /nobreak > nul

REM ── Frontend (Next.js on :3000) ──────────────────────────────────────────
echo [2/2] Starting frontend (http://localhost:3000)
start "Ringo  Frontend" cmd /k "cd /d %ROOT% && npm run dev"

echo.
echo  Both windows are opening...
echo  Backend  -^>  http://localhost:5000
echo  Frontend -^>  http://localhost:3000
echo.
echo  Wait ~10 seconds, then open your browser at:
echo  http://localhost:3000
echo.
echo  (Close the two terminal windows to stop the servers.)
echo.
pause
