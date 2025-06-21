@echo off
echo 🚀 Starting ShareHeart Local Development
echo =======================================

REM Check if Node.js is installed
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js detected

REM Check if package.json exists
if not exist "package.json" (
    echo ❌ package.json not found. Make sure you're in the correct directory.
    pause
    exit /b 1
)

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
) else (
    echo ✅ Dependencies already installed
)

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo 🔧 Creating .env file...
    copy .env.example .env
    echo ✅ .env file created. Please update it with your backend URL if needed.
) else (
    echo ✅ .env file already exists
)

echo.
echo 🎯 Backend Integration Checklist:
echo   □ Spring Boot backend running on port 8080
echo   □ CORS enabled for http://localhost:5173
echo   □ Authentication endpoints available
echo.

REM Start the development server
echo 🌟 Starting frontend development server...
echo 📱 Frontend will be available at: http://localhost:5173
echo 🔧 Make sure your Spring Boot backend is running on port 8080
echo.
echo Press Ctrl+C to stop the server
echo =======================================

npm run dev
pause