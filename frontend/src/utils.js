// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  ENDPOINTS: {
    DETECT_EMOTION: '/detect_emotion'
  },
  TIMEOUT: 60000 // 60 seconds for initial model loading
};

// Emotion configuration with colors and icons
export const EMOTION_COLORS = {
  happy: '#10B981',
  sad: '#3B82F6', 
  angry: '#EF4444',
  surprise: '#F59E0B',
  fear: '#8B5CF6',
  disgust: '#6B7280',
  neutral: '#6B7280'
};

// Helper function to convert base64 to blob
export const base64ToBlob = (base64, mimeType) => {
  const byteCharacters = atob(base64.split(',')[1]);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
};

// Helper function to format confidence percentage
export const formatConfidence = (confidence) => {
  return Math.round(confidence * 100);
};

// Helper function to format price
export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0
  }).format(price);
};

// Helper function to generate user ID
export const generateUserId = () => {
  return `frontend_user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Helper function to check if webcam is supported
export const isWebcamSupported = () => {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
};

// Helper function to handle API errors
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    return error.response.data?.message || `Server error: ${error.response.status}`;
  } else if (error.request) {
    // Request was made but no response received
    return 'Network error: Unable to connect to server. Please check your connection.';
  } else {
    // Something else happened
    return error.message || 'An unexpected error occurred';
  }
};

// Helper function to validate image data
export const validateImageData = (imageData) => {
  if (!imageData) {
    throw new Error('No image data provided');
  }
  
  if (!imageData.startsWith('data:image/')) {
    throw new Error('Invalid image format');
  }
  
  // Check if base64 data exists
  const base64Data = imageData.split(',')[1];
  if (!base64Data || base64Data.length === 0) {
    throw new Error('Invalid base64 image data');
  }
  
  return true;
};

// Helper function to compress image if needed
export const compressImage = async (imageData, maxWidth = 640, quality = 0.8) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    
    img.src = imageData;
  });
};

// Debounce function for API calls
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Function to get emotion emoji
export const getEmotionEmoji = (emotion) => {
  const emojiMap = {
    happy: '😊',
    sad: '😢',
    angry: '😠',
    surprise: '😮',
    fear: '😰',
    disgust: '🤢',
    neutral: '😐'
  };
  return emojiMap[emotion] || '😐';
};

// Function to get wellness suggestions based on emotion
export const getLocalWellnessTip = (emotion) => {
  const tips = {
    sad: [
      "Take a few deep breaths and remember that this feeling will pass.",
      "Consider reaching out to a friend or family member.",
      "Try some gentle exercise or a short walk outside."
    ],
    angry: [
      "Take a moment to pause and count to ten.",
      "Try some deep breathing exercises to calm down.",
      "Consider what's really bothering you and how to address it constructively."
    ],
    fear: [
      "Ground yourself by focusing on what you can see, hear, and feel right now.",
      "Remember that most of our fears never actually happen.",
      "Break down what you're worried about into smaller, manageable pieces."
    ],
    neutral: [
      "This is a great time to set some positive intentions for your day.",
      "Consider trying something new or creative today.",
      "Take a moment to appreciate the calm you're feeling right now."
    ]
  };
  
  const emotionTips = tips[emotion] || tips.neutral;
  return emotionTips[Math.floor(Math.random() * emotionTips.length)];
};
