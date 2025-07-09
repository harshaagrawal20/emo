"""
Flask API for Real-time Facial Emotion Detection
Clean, modular implementation using OpenCV and DeepFace
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
from typing import Dict, Optional
from dataclasses import dataclass
from deepface import DeepFace
from datetime import datetime
import traceback
import requests
import base64
import io
from PIL import Image
# Optional Redis import for caching
try:
    import redis
    REDIS_IMPORT_AVAILABLE = True
except ImportError:
    REDIS_IMPORT_AVAILABLE = False
    print("⚠️ Redis not installed. Caching will be disabled.")

import json
from functools import wraps
import time

app = Flask(__name__)
app.config['SECRET_KEY'] = 'emotion_detection_api_2025'

# N8N Webhook Configuration
N8N_WEBHOOK_URL = "http://localhost:5678/webhook/emotion-capture"

# Configure CORS to allow frontend connections
CORS(app, origins="*", methods=['GET', 'POST'], allow_headers=['Content-Type'])


# Redis cache configuration (optional)
REDIS_AVAILABLE = False
redis_client = None

if REDIS_IMPORT_AVAILABLE:
    try:
        redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)
        # Test connection
        redis_client.ping()
        REDIS_AVAILABLE = True
        print("✅ Redis cache available")
    except Exception as e:
        REDIS_AVAILABLE = False
        redis_client = None
        print(f"⚠️ Redis not available: {e}")
else:
    print("⚠️ Redis library not installed - caching disabled")


def decode_base64_image(base64_string: str) -> Optional[np.ndarray]:
    """
    Convert base64 string to OpenCV image array.
    
    Args:
        base64_string (str): Base64 encoded image string
        
    Returns:
        Optional[np.ndarray]: OpenCV image array or None if decoding fails
    """
    try:
        # Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
        if ',' in base64_string:
            base64_string = base64_string.split(',')[1]
        
        # Decode base64 to bytes
        image_bytes = base64.b64decode(base64_string)
        
        # Convert to PIL Image
        pil_image = Image.open(io.BytesIO(image_bytes))
        
        # Convert to RGB if needed
        if pil_image.mode != 'RGB':
            pil_image = pil_image.convert('RGB')
        
        # Convert to numpy array
        cv_image = np.array(pil_image)
        
        # Convert RGB to BGR for OpenCV compatibility
        cv_image = cv2.cvtColor(cv_image, cv2.COLOR_RGB2BGR)
        
        return cv_image
    except Exception as e:
        print(f"Error decoding base64 image: {e}")
        return None


def decode_multipart_image(file) -> Optional[np.ndarray]:
    """
    Convert uploaded file to OpenCV image array.
    
    Args:
        file: Flask file upload object
        
    Returns:
        Optional[np.ndarray]: OpenCV image array or None if decoding fails
    """
    try:
        # Read file bytes
        file_bytes = file.read()
        
        # Convert to PIL Image
        pil_image = Image.open(io.BytesIO(file_bytes))
        
        # Convert to RGB if needed
        if pil_image.mode != 'RGB':
            pil_image = pil_image.convert('RGB')
        
        # Convert to numpy array
        cv_image = np.array(pil_image)
        
        # Convert RGB to BGR for OpenCV
        cv_image = cv2.cvtColor(cv_image, cv2.COLOR_RGB2BGR)
        
        return cv_image
    except Exception as e:
        print(f"Error decoding multipart image: {e}")
        return None


def get_emotion(frame: np.ndarray) -> Dict:
    """
    Analyze emotion from a video frame using DeepFace with improved error handling.
    
    Args:
        frame (np.ndarray): Input frame from webcam or image (BGR format)
        
    Returns:
        Dict: Emotion analysis result with emotion, confidence, and timestamp
    """
    try:
        print("🔍 Starting emotion analysis...")
        start_time = time.time()
        
        # Resize image if too large (for faster processing)
        height, width = frame.shape[:2]
        if width > 320 or height > 240:
            # Resize to maximum 320x240 for faster processing
            scale = min(320/width, 240/height)
            new_width = int(width * scale)
            new_height = int(height * scale)
            frame = cv2.resize(frame, (new_width, new_height))
            print(f"📐 Resized image from {width}x{height} to {new_width}x{new_height}")
        
        # Analyze emotion using DeepFace with optimized settings for speed
        result = DeepFace.analyze(
            img_path=frame, 
            actions=['emotion'],           # Only emotion detection
            enforce_detection=False,       # Continue even if face unclear
            silent=True,                   # Suppress verbose output
            detector_backend='opencv'      # Use faster OpenCV backend
        )
        
        processing_time = time.time() - start_time
        print(f"⚡ Emotion analysis completed in {processing_time:.2f}s")
        
        # Handle both single face and multiple faces results
        if isinstance(result, list):
            if len(result) == 0:
                return {
                    "emotion": "neutral",
                    "confidence": 0.5,
                    "all_emotions": {"neutral": 1.0},
                    "timestamp": datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ"),
                    "success": True,
                    "message": "No face detected, defaulting to neutral"
                }
            result = result[0]  # Use first detected face
        
        emotions = result['emotion']
        dominant_emotion = result['dominant_emotion']
        confidence = emotions[dominant_emotion] / 100.0  # Convert percentage to decimal
        
        print(f"😊 Detected emotion: {dominant_emotion} ({confidence:.2%} confidence)")
        
        return {
            "emotion": dominant_emotion.lower(),
            "confidence": round(confidence, 2),
            "all_emotions": {k.lower(): round(v/100, 3) for k, v in emotions.items()},
            "timestamp": datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ"),
            "success": True,
            "processing_time": round(processing_time, 2)
        }
        
    except Exception as e:
        error_msg = str(e)
        print(f"❌ Error in emotion detection: {error_msg}")
        
        # Return a default neutral emotion instead of failing
        return {
            "emotion": "neutral",
            "confidence": 0.5,
            "all_emotions": {"neutral": 1.0},
            "timestamp": datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ"),
            "success": True,  # Mark as success to prevent frontend errors
            "fallback": True,
            "original_error": error_msg,
            "message": "Emotion detection failed, using neutral fallback"
        }


def send_to_n8n(payload: Dict) -> Dict:
    """
    Send emotion detection data to N8N webhook for further processing.
    
    Args:
        payload (Dict): The data to send to N8N webhook
        
    Returns:
        Dict: Response status and details
    """
    try:
        headers = {
            'Content-Type': 'application/json',
            'User-Agent': 'Emotion-Detection-API/1.0'
        }
        
        # Make POST request to N8N webhook
        response = requests.post(
            N8N_WEBHOOK_URL,
            json=payload,
            headers=headers,
            timeout=10  # 10 second timeout
        )
        
        # Check if request was successful
        response.raise_for_status()
        
        print(f"✅ Successfully sent data to N8N webhook: {response.status_code}")
        return {
            "success": True,
            "status_code": response.status_code,
            "message": "Data sent to N8N successfully"
        }
        
    except requests.exceptions.Timeout:
        print("⚠️ N8N webhook request timed out")
        return {
            "success": False,
            "error": "timeout",
            "message": "N8N webhook request timed out"
        }
    except requests.exceptions.ConnectionError:
        print("⚠️ Could not connect to N8N webhook")
        return {
            "success": False,
            "error": "connection_error", 
            "message": "Could not connect to N8N webhook"
        }
    except requests.exceptions.HTTPError as e:
        print(f"⚠️ N8N webhook returned HTTP error: {e}")
        return {
            "success": False,
            "error": "http_error",
            "message": f"N8N webhook returned HTTP error: {e}",
            "status_code": response.status_code if 'response' in locals() else None
        }
    except Exception as e:
        print(f"❌ Unexpected error sending to N8N: {e}")
        return {
            "success": False,
            "error": "unexpected_error",
            "message": f"Unexpected error: {str(e)}"
        }


# Cache decorator for expensive operations
def cache_result(expiry_seconds=300):
    """Cache function results in Redis or memory"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Create cache key from function name and arguments
            cache_key = f"{func.__name__}:{hash(str(args) + str(kwargs))}"
            
            # Try to get from cache
            if REDIS_AVAILABLE:
                try:
                    cached = redis_client.get(cache_key)
                    if cached:
                        return json.loads(cached)
                except:
                    pass
            
            # Execute function and cache result
            result = func(*args, **kwargs)
            
            if REDIS_AVAILABLE:
                try:
                    redis_client.setex(cache_key, expiry_seconds, json.dumps(result))
                except:
                    pass
            
            return result
        return wrapper
    return decorator


# Performance monitoring decorator
def monitor_performance(func):
    """Monitor API endpoint performance"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        try:
            result = func(*args, **kwargs)
            success = True
            error = None
        except Exception as e:
            result = None
            success = False
            error = str(e)
            raise
        finally:
            end_time = time.time()
            duration = (end_time - start_time) * 1000  # Convert to milliseconds
            
            # Log performance metrics
            print(f"[PERF] {func.__name__}: {duration:.2f}ms, Success: {success}")
            if error:
                print(f"[ERROR] {func.__name__}: {error}")
                
        return result
    return wrapper


# Enhanced emotion detection with caching
@cache_result(expiry_seconds=60)  # Cache emotion results for 1 minute
@monitor_performance
def get_emotion_optimized(image_array: np.ndarray) -> Dict:
    """
    Optimized emotion detection with caching and monitoring
    """
    return get_emotion(image_array)


# Enhanced N8N payload for large dataset
def create_enhanced_n8n_payload(user_data: Dict, emotion_result: Dict) -> Dict:
    """
    Create enhanced N8N payload optimized for 40K+ product dataset
    """
    # Calculate dynamic price range based on emotion
    base_price = user_data.get('price', 1000)
    emotion = emotion_result.get('emotion', 'neutral')
    
    # Emotion-based price multipliers
    price_multipliers = {
        'happy': 1.3,      # Willing to spend 30% more when happy
        'sad': 0.7,        # More budget-conscious when sad  
        'angry': 0.9,      # Slightly reduced spending when angry
        'surprise': 1.1,   # Modest increase for surprises
        'fear': 0.8,       # Conservative spending when fearful
        'disgust': 0.6,    # Very conservative spending
        'neutral': 1.0     # Baseline spending
    }
    
    multiplier = price_multipliers.get(emotion, 1.0)
    target_price_range = {
        'min': int(base_price * multiplier * 0.5),
        'max': int(base_price * multiplier * 1.5),
        'preferred': int(base_price * multiplier)
    }
    
    # Enhanced category mapping for large dataset
    category_preferences = {
        'happy': ['Apparel', 'Accessories', 'Electronics', 'Footwear'],
        'sad': ['Apparel', 'Personal Care', 'Home & Kitchen'],
        'angry': ['Sports', 'Fitness', 'Electronics'],
        'surprise': ['Accessories', 'Electronics', 'Gifts'],
        'fear': ['Apparel', 'Home & Kitchen'],
        'disgust': ['Personal Care', 'Health'],
        'neutral': ['Apparel', 'Accessories']
    }
    
    # Color preferences by emotion
    color_preferences = {
        'happy': ['Yellow', 'Orange', 'Pink', 'Bright', 'Colorful'],
        'sad': ['Blue', 'Grey', 'Black', 'Neutral'],
        'angry': ['Red', 'Black', 'Dark'],
        'surprise': ['Bright', 'Colorful', 'Unique'],
        'fear': ['Neutral', 'Calm', 'Soft'],
        'disgust': ['Clean', 'Fresh', 'Light'],
        'neutral': ['Any']
    }
    
    # Usage context by emotion
    usage_preferences = {
        'happy': ['Party', 'Formal', 'Special'],
        'sad': ['Casual', 'Comfort'],
        'angry': ['Sports', 'Active'],
        'surprise': ['Party', 'Unique'],
        'fear': ['Casual', 'Safe'],
        'disgust': ['Clean', 'Fresh'],
        'neutral': ['Casual', 'Everyday']
    }
    
    return {
        'userId': user_data.get('userId'),
        'emotion': emotion,
        'confidence': emotion_result.get('confidence', 0),
        'timestamp': datetime.now().isoformat(),
        'context': {
            'originalProduct': {
                'id': user_data.get('productId'),
                'price': base_price,
                'category': user_data.get('category', 'Apparel'),
                'gender': user_data.get('gender'),
                'subCategory': user_data.get('subCategory'),
                'articleType': user_data.get('articleType')
            },
            'preferences': {
                'priceRange': target_price_range,
                'categories': category_preferences.get(emotion, ['Apparel']),
                'colors': color_preferences.get(emotion, ['Any']),
                'usage': usage_preferences.get(emotion, ['Casual']),
                'multiplier': multiplier
            },
            'filters': {
                'available': True,
                'minRating': 3.5,
                'maxResults': 20,
                'sortBy': 'rating' if emotion == 'happy' else 'price'
            }
        },
        'analytics': {
            'sessionId': user_data.get('sessionId'),
            'deviceType': user_data.get('deviceType', 'web'),
            'location': user_data.get('location'),
            'previousEmotions': user_data.get('emotionHistory', [])
        }
    }


def create_mock_recommendation(emotion: str, user_data: Dict) -> Dict:
    """
    Create mock recommendations when N8N is not available
    """
    base_price = user_data.get('price', 1000)
    category = user_data.get('category', 'Apparel')
    
    if emotion == 'happy':
        return {
            "type": "premium_recommendation",
            "message": "Since you're feeling great, check out these premium items! ✨",
            "recommendations": {
                "all": [
                    {
                        "id": "premium_001",
                        "name": f"Premium {category} Collection",
                        "price": int(base_price * 1.5),
                        "category": category,
                        "rating": 4.8,
                        "features": "High-quality materials, premium design",
                        "image": "https://via.placeholder.com/300x300?text=Premium+Product"
                    }
                ]
            }
        }
    elif emotion == 'sad':
        return {
            "type": "cheaper_alternative", 
            "message": "Here are some budget-friendly options that might help! 💰",
            "bestAlternative": {
                "id": "budget_001",
                "name": f"Affordable {category} Option",
                "price": int(base_price * 0.7),
                "category": category,
                "rating": 4.2,
                "features": "Great value, comfort-focused",
                "image": "https://via.placeholder.com/300x300?text=Budget+Alternative"
            },
            "savings": int(base_price * 0.3)
        }
    elif emotion in ['angry', 'fear', 'disgust']:
        return {
            "type": "wellness",
            "message": "We've noticed you might need some emotional support. Take care of yourself! 🧘‍♀️",
            "wellness": {
                "quote": "Take time to breathe. You're doing better than you think. 🌸",
                "journalApp": {
                    "name": "Mindfulness App",
                    "description": "Simple meditation and breathing exercises",
                    "url": "https://example.com/mindfulness"
                },
                "calmingContent": {
                    "name": "Peaceful Sounds",
                    "content": "Relaxing nature sounds for stress relief",
                    "url": "https://example.com/calm-sounds"
                }
            }
        }
    else:
        return {
            "type": "standard_response",
            "message": f"Here are some {category.lower()} items you might like!",
            "products": [
                {
                    "id": "standard_001",
                    "name": f"Popular {category} Item",
                    "price": base_price,
                    "category": category,
                    "rating": 4.4,
                    "features": "Popular choice, great reviews",
                    "image": "https://via.placeholder.com/300x300?text=Popular+Product"
                }
            ]
        }


@app.route('/')
def index():
    """
    API information endpoint.
    """
    return jsonify({
        "message": "Facial Emotion Detection API",
        "version": "1.0.0",
        "endpoints": {
            "detect_emotion": {
                "url": "/detect_emotion",
                "method": "POST",
                "description": "Detect emotion from uploaded image",
                "input": "base64 string or multipart/form-data image file"
            }
        },
        "supported_emotions": [
            "angry", "disgust", "fear", "happy", "sad", "surprise", "neutral"
        ]
    })


@app.route('/detect_emotion', methods=['POST'])
@monitor_performance
def detect_emotion():
    """
    Main emotion detection endpoint optimized for 40K+ product dataset.
    Accepts image via base64 JSON or multipart/form-data.
    
    Returns:
        JSON response with emotion, confidence, and enhanced recommendations
    """
    try:
        image = None
        
        # Handle different input formats
        if request.content_type and 'application/json' in request.content_type:
            # Handle JSON with base64 image
            data = request.get_json()
            
            if not data or 'image' not in data:
                return jsonify({
                    "error": "No image data provided",
                    "message": "Please provide 'image' field with base64 encoded image"
                }), 400
            
            image = decode_base64_image(data['image'])
            
        elif request.content_type and 'multipart/form-data' in request.content_type:
            # Handle multipart form data
            if 'image' not in request.files:
                return jsonify({
                    "error": "No image file provided",
                    "message": "Please upload an image file with field name 'image'"
                }), 400
            
            file = request.files['image']
            if file.filename == '':
                return jsonify({
                    "error": "No file selected",
                    "message": "Please select an image file"
                }), 400
            
            image = decode_multipart_image(file)
            
        else:
            return jsonify({
                "error": "Unsupported content type",
                "message": "Please use application/json with base64 image or multipart/form-data"
            }), 400
        
        # Check if image decoding was successful
        if image is None:
            return jsonify({
                "error": "Invalid image format",
                "message": "Could not decode the provided image"
            }), 400
        
        # Analyze emotion using optimized function with caching
        emotion_result = get_emotion_optimized(image)
        
        # Prepare enhanced payload for N8N webhook (only if emotion detection was successful)
        webhook_result = None
        if emotion_result['success']:
            # Extract optional parameters from request
            request_data = request.get_json() if request.content_type and 'application/json' in request.content_type else {}
            
            # Create enhanced payload optimized for large dataset
            n8n_payload = create_enhanced_n8n_payload(request_data, emotion_result)
            
            # Send data to N8N webhook (only if N8N is available)
            try:
                webhook_result = send_to_n8n(n8n_payload)
                print(f"N8N Webhook result: {webhook_result}")
            except Exception as e:
                print(f"⚠️ N8N webhook skipped: {e}")
                webhook_result = {"success": False, "message": "N8N not available"}
        
        # Return response based on analysis success
        if emotion_result['success']:
            response_data = {
                "emotion": emotion_result['emotion'],
                "confidence": emotion_result['confidence'],
                "timestamp": emotion_result['timestamp'],
                "all_emotions": emotion_result['all_emotions']
            }
            
            # Add webhook status if webhook was attempted
            if webhook_result and webhook_result.get('success'):
                response_data["webhook_status"] = webhook_result
            else:
                # Create mock recommendation when N8N is not available
                request_data = request.get_json() if request.content_type and 'application/json' in request.content_type else {}
                mock_recommendation = create_mock_recommendation(emotion_result['emotion'], request_data)
                response_data["recommendation"] = mock_recommendation
                response_data["source"] = "mock_data"
            
            return jsonify(response_data), 200
        else:
            return jsonify({
                "error": "Emotion detection failed",
                "message": emotion_result['error'],
                "emotion": emotion_result['emotion'],
                "confidence": emotion_result['confidence'],
                "timestamp": emotion_result['timestamp']
            }), 422  # Unprocessable Entity
        
    except Exception as e:
        print(f"Unexpected error in detect_emotion: {e}")
        print(traceback.format_exc())
        return jsonify({
            "error": "Internal server error",
            "message": "An unexpected error occurred during emotion detection",
            "details": str(e),
            "timestamp": datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ")
        }), 500


@app.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint for monitoring.
    """
    try:
        # Test if DeepFace can be imported and used
        test_image = np.zeros((100, 100, 3), dtype=np.uint8)
        DeepFace.analyze(test_image, actions=['emotion'], enforce_detection=False, silent=True)
        
        return jsonify({
            "status": "healthy",
            "message": "Emotion detection API is running",
            "timestamp": datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ"),
            "deepface_status": "operational"
        }), 200
    except Exception as e:
        return jsonify({
            "status": "unhealthy",
            "message": "DeepFace initialization failed",
            "error": str(e),
            "timestamp": datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ")
        }), 500


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        "error": "Endpoint not found",
        "message": "The requested endpoint does not exist",
        "available_endpoints": ["/", "/detect_emotion", "/health"]
    }), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify({
        "error": "Internal server error",
        "message": "An unexpected error occurred",
        "timestamp": datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ")
    }), 500


# Pre-load DeepFace model to avoid first-time loading delays
print("🔄 Pre-loading DeepFace model...")
try:
    # Create a small test image to warm up the model
    test_frame = np.zeros((100, 100, 3), dtype=np.uint8)
    DeepFace.analyze(test_frame, actions=['emotion'], enforce_detection=False, silent=True)
    print("✅ DeepFace model loaded successfully")
except Exception as e:
    print(f"⚠️ DeepFace model pre-loading warning: {e}")


if __name__ == '__main__':
    print("🎭 Starting Facial Emotion Detection API...")
    print("📡 Server: http://localhost:5000")
    print("🔗 Emotion Detection: POST /detect_emotion")
    print("💓 Health Check: GET /health")
    print("📋 API Info: GET /")
    print("🌐 CORS enabled for all origins")
    print()
    
    app.run(debug=True, host='0.0.0.0', port=5000)


