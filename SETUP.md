# Quick Setup Guide for ShareHeart

## Prerequisites

1. **Node.js** (v18+) - Download from [nodejs.org](https://nodejs.org/)
2. **Spring Boot Backend** - Make sure it's running on port 8080
3. **Git** - For cloning the repository

## Step-by-Step Setup

### 1. Download the Code

Option A: Clone with Git
```bash
git clone <repository-url>
cd shareheart
```

Option B: Download ZIP
1. Download the ZIP file from the repository
2. Extract it to your desired folder
3. Open terminal/command prompt in that folder

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages (React, TypeScript, Tailwind CSS, etc.)

### 3. Configure Environment

Create a `.env` file in the root folder:

```bash
# Copy the example file
cp .env.example .env
```

Edit the `.env` file with your backend URL:
```env
VITE_API_BASE_URL=http://localhost:8080
```

### 4. Start Your Backend

Make sure your Spring Boot application is running on port 8080.

### 5. Start the Frontend

```bash
npm run dev
```

Open your browser and go to: `http://localhost:5173`

## Backend Integration Checklist

Ensure your Spring Boot backend has:

- [ ] CORS enabled for `http://localhost:5173`
- [ ] JWT authentication endpoints:
  - `POST /auth/login`
  - `POST /auth/register`
  - `GET /users/me`
- [ ] Item management endpoints
- [ ] Running on port 8080

## Troubleshooting

### Issue: "npm: command not found"
**Solution**: Install Node.js from [nodejs.org](https://nodejs.org/)

### Issue: "Backend connection failed"
**Solutions**:
1. Check if Spring Boot is running on port 8080
2. Verify CORS configuration in backend
3. Check `.env` file has correct API URL

### Issue: "Login not working"
**Solutions**:
1. Check backend `/auth/login` endpoint
2. Verify JWT token response format
3. Check browser console for error messages

### Issue: Port 5173 already in use
**Solution**: 
```bash
# Kill the process using the port
npx kill-port 5173
# Or use a different port
npm run dev -- --port 3000
```

## File Structure

```
shareheart/
├── client/src/
│   ├── components/    # UI components
│   ├── pages/        # Page components  
│   ├── hooks/        # Custom hooks
│   ├── lib/          # API client & utilities
│   └── index.css     # Styling
├── package.json      # Dependencies
├── .env              # Environment config
└── README.md         # Documentation
```

## Next Steps

1. **Test Authentication**: Try logging in with your backend credentials
2. **Explore Features**: Browse items, create posts, check dashboard
3. **Customize**: Update colors, branding, or features as needed
4. **Deploy**: When ready, run `npm run build` for production

## Need Help?

1. Check the browser console for error messages
2. Verify your backend API endpoints with Swagger documentation
3. Ensure all environment variables are set correctly
4. Check that your backend accepts the expected request formats

Happy coding! 🚀