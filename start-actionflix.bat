@echo off
REM ActionFlix Desktop App - Windows Startup Script
REM ==============================================

echo.
echo  💥 ActionFlix - Transform Rom-Coms Into Action! 💥
echo  ==================================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo  ❌ Node.js is not installed!
    echo  Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM Navigate to electron-app directory
cd /d "%~dp0electron-app"

REM Check if node_modules exists
if not exist "node_modules" (
    echo  📦 Installing dependencies...
    echo.
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo  ❌ Failed to install dependencies!
        pause
        exit /b 1
    )
    echo.
)

echo  🚀 Starting ActionFlix...
echo.

REM Start the app
call npm start

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo  ❌ Failed to start ActionFlix!
    pause
    exit /b 1
)
