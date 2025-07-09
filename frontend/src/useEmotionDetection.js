import { useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { 
  API_CONFIG, 
  handleApiError, 
  validateImageData, 
  generateUserId,
  compressImage 
} from './utils';

export const useEmotionDetection = () => {
  const [currentEmotion, setCurrentEmotion] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [isWellnessMode, setIsWellnessMode] = useState(false);
  const [error, setError] = useState(null);
  const [captureStatus, setCaptureStatus] = useState('Ready');
  const [lastCaptureTime, setLastCaptureTime] = useState(null);
  
  const webcamRef = useRef(null);
  const userIdRef = useRef(generateUserId());

  const captureAndAnalyze = useCallback(async (options = {}) => {
    if (!webcamRef.current) {
      setError('Webcam not available');
      return;
    }

    try {
      setIsLoading(true);
      setCaptureStatus('Capturing...');
      setError(null);

      // Capture image as base64
      const imageSrc = webcamRef.current.getScreenshot();
      
      if (!imageSrc) {
        throw new Error('Failed to capture image from webcam');
      }

      // Validate image data
      validateImageData(imageSrc);

      setCaptureStatus('Processing...');

      // Compress image if it's too large
      const compressedImage = await compressImage(imageSrc);

      setCaptureStatus('Analyzing emotion...');

      // Prepare request payload
      const payload = {
        image: compressedImage,
        userId: userIdRef.current,
        productId: options.productId || 'demo_product_001',
        price: options.price || 75000,
        category: options.category || 'Electronics',
        timestamp: new Date().toISOString()
      };

      // Send to Flask API
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DETECT_EMOTION}`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 60000  // Increased to 60 seconds for first-time model loading
        }
      );

      const data = response.data;
      
      if (!data.emotion) {
        throw new Error('No emotion detected in response');
      }

      // Update emotion state
      setCurrentEmotion(data.emotion);
      setConfidence(data.confidence || 0);
      setLastCaptureTime(new Date());

      // Handle recommendation from N8N
      if (data.recommendation) {
        setRecommendation(data.recommendation);
        setIsWellnessMode(data.recommendation.type === 'wellness');
      } else {
        // Clear previous recommendation if none received
        setRecommendation(null);
        setIsWellnessMode(false);
      }

      setCaptureStatus('Complete');

      return {
        emotion: data.emotion,
        confidence: data.confidence,
        recommendation: data.recommendation
      };

    } catch (error) {
      console.error('Error analyzing emotion:', error);
      const errorMessage = handleApiError(error);
      setError(errorMessage);
      setCaptureStatus('Error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setCurrentEmotion(null);
    setConfidence(0);
    setRecommendation(null);
    setIsWellnessMode(false);
    setError(null);
    setCaptureStatus('Ready');
    setLastCaptureTime(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    currentEmotion,
    confidence,
    isLoading,
    recommendation,
    isWellnessMode,
    error,
    captureStatus,
    lastCaptureTime,
    
    // Refs
    webcamRef,
    
    // Actions
    captureAndAnalyze,
    reset,
    clearError
  };
};
