# Windows Setup Guide for ShareHeart

## Quick Start for Windows

### Option 1: Use the Frontend-Only Script (Recommended)
```cmd
start-frontend.bat
```

### Option 2: Manual Commands
```cmd
# Install dependencies
npm install

# Start frontend only (since you have Spring Boot backend)
npx vite
```

### Option 3: Using PowerShell
```powershell
# Set environment variable and start
$env:NODE_ENV="development"
npx vite
```

## What Each Command Does

- `npx vite` - Starts only the React frontend on port 5173
- Your Spring Boot backend should run separately on port 8080
- The frontend will proxy API calls to your backend

## Backend Integration

Make sure your Spring Boot application:

1. **Runs on port 8080**
2. **Has CORS enabled** for `http://localhost:5173`
3. **Provides these endpoints:**
   - `POST /auth/login`
   - `POST /auth/register` 
   - `GET /users/me`
   - Other endpoints from your Swagger documentation

## Environment Configuration

Create `.env` file:
```env
VITE_API_BASE_URL=http://localhost:8080
```

## Troubleshooting Windows Issues

### Issue: 'NODE_ENV' is not recognized
**Solution**: Use `npx vite` instead of `npm run dev`

### Issue: Permission denied
**Solution**: Run Command Prompt as Administrator

### Issue: Port already in use
**Solution**: 
```cmd
# Kill process on port 5173
netstat -ano | findstr :5173
taskkill /PID <PID_NUMBER> /F
```

### Issue: Cannot find module
**Solution**:
```cmd
# Clear cache and reinstall
rmdir /s node_modules
del package-lock.json
npm install
```

## Architecture

```
Frontend (React) - Port 5173
    ↓ API calls
Backend (Spring Boot) - Port 8080
    ↓
Database (PostgreSQL)
```

The frontend is designed to work with your existing Spring Boot backend, so you only need to run the React development server.

## Next Steps

1. Start your Spring Boot backend on port 8080
2. Run `start-frontend.bat` or `npx vite`
3. Open http://localhost:5173 in your browser
4. Test the authentication with your backend API

The frontend will handle all the UI while your Spring Boot backend manages the business logic and data.