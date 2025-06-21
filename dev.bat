@echo off
echo Starting ShareHeart Frontend for Windows...
echo.
echo Make sure your Spring Boot backend is running on port 8080
echo Frontend will be available at: http://localhost:5173
echo.

REM Start the frontend development server
npx vite --host 0.0.0.0