@echo off
title Budapest 2026 Local Server
echo ========================================================
echo   Budapest 2026 Travel App
echo ========================================================
echo.
echo Starting local web server at http://localhost:8000 ...
echo Browser opening automatically...
echo.
start http://localhost:8000
python -m http.server 8000
if %errorlevel% neq 0 (
    echo Python not found, trying npx serve...
    npx -y serve -l 8000 .
)
pause
