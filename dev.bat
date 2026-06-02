@echo off
SETLOCAL EnableDelayedExpansion

echo =============================================================
echo  TEB Prototype - Ultimate Launch Script
echo =============================================================

:: Check if packages are installed
if not exist "packages\db\node_modules" (
    echo [!] Shared packages not installed. Running installation...
    pnpm install
)

:: Start Backend
echo [*] Starting Backend...
start "TEB Backend" cmd /k "cd backend && pnpm dev"

:: Start Frontend
echo [*] Starting Frontend...
start "TEB Frontend" cmd /k "cd front && pnpm dev"

echo.
echo =============================================================
echo  Ecosystem is launching! 
echo  Backend: http://localhost:8080
echo  Frontend: http://localhost:5173 (check console for port)
echo =============================================================
pause
