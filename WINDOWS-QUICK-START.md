# Windows Quick Start

## For Windows Users (Command Prompt/PowerShell)

### Step 1: Install Dependencies
```cmd
npm install
```

### Step 2: Start Frontend Only
```cmd
npx vite
```

OR use the batch file:
```cmd
dev.bat
```

### Step 3: Setup Environment
Create `.env` file:
```env
VITE_API_BASE_URL=http://localhost:8080
```

## What This Does

- Starts React frontend on `http://localhost:5173`
- Connects to your Spring Boot backend on port 8080
- No need to run the Express server (you have Spring Boot)

## Backend Requirements

Your Spring Boot backend needs:
1. Running on port 8080
2. CORS enabled for `http://localhost:5173`
3. JWT authentication endpoints

## Troubleshooting

**Issue**: `'NODE_ENV' is not recognized`
**Solution**: Use `npx vite` instead of `npm run dev`

**Issue**: Cannot connect to backend
**Solution**: Ensure Spring Boot is running and CORS is configured