@echo off
setlocal enabledelayedexpansion

echo 🎭 Starting Emotion-Aware Shopping Frontend...

REM Check if we're in the frontend directory
if not exist "package.json" (
    echo ❌ Error: Please run this script from the frontend directory
    echo Usage: cd frontend && start.bat
    pause
    exit /b 1
)

REM Check if Node.js is installed
where node >nul 2>nul
if !errorlevel! neq 0 (
    echo ❌ Error: Node.js is not installed
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is installed
where npm >nul 2>nul
if !errorlevel! neq 0 (
    echo ❌ Error: npm is not installed
    echo Please install npm usually comes with Node.js
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i

echo ✅ Node.js version: !NODE_VERSION!
echo ✅ npm version: !NPM_VERSION!

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call npm install
    
    if !errorlevel! neq 0 (
        echo ❌ Error: Failed to install dependencies
        pause
        exit /b 1
    )
    
    echo ✅ Dependencies installed successfully
) else (
    echo ✅ Dependencies already installed
)

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo ⚙️ Creating .env file from .env.example...
    copy ".env.example" ".env" >nul
    echo ✅ .env file created
)

REM Check if backend is running
echo 🔍 Checking if backend is running...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:5000' -TimeoutSec 5 -UseBasicParsing; exit 0 } catch { exit 1 }" >nul 2>nul
if !errorlevel! equ 0 (
    echo ✅ Backend is running on http://localhost:5000
) else (
    echo ⚠️  Warning: Backend doesn't appear to be running
    echo    Make sure to start the Flask backend first:
    echo    cd ..\backend ^&^& python app.py
)

echo.
echo 🚀 Starting React development server...
echo 📱 The app will open in your browser at http://localhost:3000
echo 🎥 Make sure to allow camera access when prompted
echo.

REM Start the React development server
call npm start

pause
