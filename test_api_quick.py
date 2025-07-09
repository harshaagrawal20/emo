#!/usr/bin/env python3
"""
Quick test for the emotion detection API with mock recommendations
"""

import requests
import json
import base64
import io
from PIL import Image

def create_test_image():
    """Create a simple test image"""
    # Create a 200x200 RGB image with a blue background
    img = Image.new('RGB', (200, 200), color='lightblue')
    
    # Convert to base64
    img_buffer = io.BytesIO()
    img.save(img_buffer, format='JPEG')
    img_str = base64.b64encode(img_buffer.getvalue()).decode()
    
    return f"data:image/jpeg;base64,{img_str}"

def test_api():
    """Test the emotion detection API"""
    url = "http://localhost:5000/detect_emotion"
    
    # Test data with product context for recommendations
    test_data = {
        "image": create_test_image(),
        "userId": "test_user_001",
        "productId": "15970",
        "price": 1000,
        "category": "Apparel",
        "subCategory": "Topwear",
        "articleType": "Shirts",
        "gender": "Men"
    }
    
    try:
        print("🧪 Testing emotion detection API...")
        response = requests.post(url, json=test_data, timeout=15)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ API Response Success!")
            print(f"😊 Emotion: {data.get('emotion')}")
            print(f"🎯 Confidence: {data.get('confidence', 0):.1%}")
            
            if 'recommendation' in data:
                rec = data['recommendation']
                print(f"🎁 Recommendation Type: {rec.get('type')}")
                print(f"💬 Message: {rec.get('message')}")
                print(f"📊 Source: {data.get('source', 'n8n')}")
                
                # Show specific recommendation details
                if rec.get('type') == 'premium_recommendation':
                    products = rec.get('recommendations', {}).get('all', [])
                    if products:
                        product = products[0]
                        print(f"🌟 Recommended: {product.get('name')} - ₹{product.get('price')}")
                
                elif rec.get('type') == 'cheaper_alternative':
                    alt = rec.get('bestAlternative')
                    if alt:
                        print(f"💰 Alternative: {alt.get('name')} - ₹{alt.get('price')}")
                        print(f"💸 Savings: ₹{rec.get('savings', 0)}")
                
                elif rec.get('type') == 'wellness':
                    wellness = rec.get('wellness', {})
                    print(f"🧘 Wellness Mode Activated")
                    if wellness.get('quote'):
                        print(f"💭 Quote: {wellness['quote']}")
            
            print("\n🎉 Test completed successfully!")
            return True
            
        else:
            print(f"❌ API Error: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print("⏱️ Request timed out")
        return False
    except requests.exceptions.ConnectionError:
        print("🔌 Could not connect to API. Make sure backend is running on localhost:5000")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_health():
    """Test health endpoint"""
    try:
        response = requests.get("http://localhost:5000/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"💓 Health Status: {data.get('status')}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except:
        print("❌ Health check failed - API not reachable")
        return False

if __name__ == "__main__":
    print("🎭 Emotion-Aware Shopping API Test")
    print("=" * 40)
    
    # Test health first
    if test_health():
        # Test emotion detection
        test_api()
    else:
        print("\n💡 Make sure to start the backend first:")
        print("cd backend && python app.py")
