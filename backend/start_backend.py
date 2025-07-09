#!/usr/bin/env python3
"""
Simple starter script for the emotion detection backend
This script installs required dependencies and starts the Flask server
"""

import subprocess
import sys
import os

def install_package(package):
    """Install a package using pip"""
    try:
        subprocess.check_call([sys.executable, '-m', 'pip', 'install', package])
        return True
    except subprocess.CalledProcessError:
        return False

def check_and_install_dependencies():
    """Check and install required dependencies"""
    required_packages = [
        'flask',
        'flask-cors', 
        'opencv-python',
        'deepface',
        'pillow',
        'requests',
        'numpy'
    ]
    
    print("🔍 Checking dependencies...")
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
            print(f"✅ {package} is installed")
        except ImportError:
            print(f"📦 Installing {package}...")
            if install_package(package):
                print(f"✅ {package} installed successfully")
            else:
                print(f"❌ Failed to install {package}")
                return False
    
    # Optional Redis package
    try:
        import redis
        print("✅ redis is available (optional)")
    except ImportError:
        print("⚠️ redis not installed (optional - caching will be disabled)")
    
    return True

def start_server():
    """Start the Flask development server"""
    print("\n🎭 Starting Emotion Detection API...")
    print("📡 Server will be available at: http://localhost:5000")
    print("🔗 Emotion Detection: POST /detect_emotion")
    print("💓 Health Check: GET /health")
    print("📋 API Info: GET /")
    print("\n⚠️ Note: First emotion detection may take 30-60 seconds to load the AI model")
    print("🚀 Starting server...\n")
    
    try:
        # Import and run the Flask app
        from app import app
        app.run(debug=True, host='0.0.0.0', port=5000)
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        return False
    
    return True

def main():
    print("🎭 Emotion Detection Backend Starter")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not os.path.exists('app.py'):
        print("❌ Error: app.py not found!")
        print("Please run this script from the backend directory:")
        print("cd backend && python start_backend.py")
        return
    
    # Install dependencies
    if not check_and_install_dependencies():
        print("❌ Failed to install dependencies")
        return
    
    print("\n" + "=" * 50)
    
    # Start the server
    start_server()

if __name__ == "__main__":
    main()
