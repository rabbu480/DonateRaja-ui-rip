@echo off
cls
echo =============================================
echo   ShareHeart - Windows Development Setup
echo =============================================
echo.

REM Check if node is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js found: 
node --version
echo.

REM Install dependencies if needed
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if %ERRORLEVEL% NEQ 0 (
        echo Failed to install dependencies
        pause
        exit /b 1
    )
    echo.
)

REM Create .env if it doesn't exist
if not exist ".env" (
    echo Creating .env file...
    echo VITE_API_BASE_URL=http://localhost:8080 > .env
    echo Environment file created
    echo.
)

echo Starting frontend development server...
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:8080 (make sure Spring Boot is running)
echo.
echo Press Ctrl+C to stop
echo =============================================

npx vite