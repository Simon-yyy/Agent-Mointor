@echo off
cd /d "%~dp0"
title Blog Backend Service
echo ====================================================
echo  Starting Blog Backend Service (Port 8080)...
echo.
echo  Home Page:   http://localhost:8080/
echo  Admin Page:  http://localhost:8080/admin/login
echo  API Health:  http://localhost:8080/api/hello
echo.
echo  Keep this window open to run the server.
echo  Press Ctrl+C to stop.
echo ====================================================
if not defined JAVA_HOME (
    set "JAVA_HOME=D:\Java"
)
"%JAVA_HOME%\bin\java.exe" -jar "%~dp0backend\target\backend-0.0.1-SNAPSHOT.jar"
pause
