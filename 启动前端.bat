@echo off
cd /d "%~dp0frontend"
title Blog Frontend Service
echo ====================================================
echo  Starting Frontend Dev Server (Port 5180)...
echo.
echo  Local URL:   http://localhost:5180/
echo  Proxy Target: http://localhost:8080/api
echo.
echo  Keep this window open for live development.
echo  Press Ctrl+C to stop.
echo ====================================================
call npm.cmd run dev
pause
