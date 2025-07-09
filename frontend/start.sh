#!/bin/bash

# Startup script for Emotion-Aware Shopping Frontend
echo "🎭 Starting Emotion-Aware Shopping Frontend..."

# Check if we're in the frontend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the frontend directory"
    echo "Usage: cd frontend && ./start.sh"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed"
    echo "Please install npm (usually comes with Node.js)"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    
    if [ $? -ne 0 ]; then
        echo "❌ Error: Failed to install dependencies"
        exit 1
    fi
    
    echo "✅ Dependencies installed successfully"
else
    echo "✅ Dependencies already installed"
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "⚙️ Creating .env file from .env.example..."
    cp .env.example .env
    echo "✅ .env file created"
fi

# Check if backend is running
echo "🔍 Checking if backend is running..."
if curl -s http://localhost:5000 > /dev/null; then
    echo "✅ Backend is running on http://localhost:5000"
else
    echo "⚠️  Warning: Backend doesn't appear to be running"
    echo "   Make sure to start the Flask backend first:"
    echo "   cd ../backend && python app.py"
fi

echo ""
echo "🚀 Starting React development server..."
echo "📱 The app will open in your browser at http://localhost:3000"
echo "🎥 Make sure to allow camera access when prompted"
echo ""

# Start the React development server
npm start
