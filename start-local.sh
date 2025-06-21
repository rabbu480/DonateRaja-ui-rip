#!/bin/bash

echo "🚀 Starting ShareHeart Local Development"
echo "======================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found. Make sure you're in the correct directory."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
else
    echo "✅ Dependencies already installed"
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "🔧 Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created. Please update it with your backend URL if needed."
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🎯 Backend Integration Checklist:"
echo "  □ Spring Boot backend running on port 8080"
echo "  □ CORS enabled for http://localhost:5173"
echo "  □ Authentication endpoints available"
echo ""

# Start the development server
echo "🌟 Starting frontend development server..."
echo "📱 Frontend will be available at: http://localhost:5173"
echo "🔧 Make sure your Spring Boot backend is running on port 8080"
echo ""
echo "Press Ctrl+C to stop the server"
echo "======================================="

npm run dev