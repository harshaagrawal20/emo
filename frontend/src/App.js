import React, { useEffect } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaHeart, 
  FaSadTear, 
  FaAngry, 
  FaSurprise, 
  FaExclamationTriangle, 
  FaFrown, 
  FaMeh,
  FaCamera,
  FaSpinner,
  FaRedo
} from 'react-icons/fa';
import './App.css';
import { useEmotionDetection } from './useEmotionDetection';
import { formatConfidence, isWebcamSupported } from './utils';

// Emotion to emoji/icon mapping
const emotionConfig = {
  happy: { emoji: '😊', icon: FaHeart, color: '#10B981', label: 'Happy' },
  sad: { emoji: '😢', icon: FaSadTear, color: '#3B82F6', label: 'Sad' },
  angry: { emoji: '😠', icon: FaAngry, color: '#EF4444', label: 'Angry' },
  surprise: { emoji: '😮', icon: FaSurprise, color: '#F59E0B', label: 'Surprised' },
  fear: { emoji: '😰', icon: FaExclamationTriangle, color: '#8B5CF6', label: 'Fearful' },
  disgust: { emoji: '🤢', icon: FaFrown, color: '#6B7280', label: 'Disgusted' },
  neutral: { emoji: '😐', icon: FaMeh, color: '#6B7280', label: 'Neutral' }
};

function App() {
  const {
    currentEmotion,
    confidence,
    isLoading,
    recommendation,
    isWellnessMode,
    error,
    captureStatus,
    lastCaptureTime,
    webcamRef,
    captureAndAnalyze,
    reset,
    clearError
  } = useEmotionDetection();

  // Check webcam support
  const webcamSupported = isWebcamSupported();

  // Auto-capture every 8 seconds (increased from 5 for better UX)
  useEffect(() => {
    if (!webcamSupported) return;

    const interval = setInterval(() => {
      if (!isLoading) {
        captureAndAnalyze().catch(console.error);
      }
    }, 8000);

    // Initial capture after 3 seconds
    const initialTimeout = setTimeout(() => {
      captureAndAnalyze().catch(console.error);
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(initialTimeout);
    };
  }, [captureAndAnalyze, isLoading, webcamSupported]);

  // Webcam constraints
  const videoConstraints = {
    width: 320,
    height: 240,
    facingMode: "user"
  };

  // Show error if webcam is not supported
  if (!webcamSupported) {
    return (
      <div className="app">
        <div className="error-container">
          <h2>📷 Webcam Required</h2>
          <p>This application requires webcam access to detect emotions. Please ensure your device has a camera and grant permission when prompted.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <h1>🎭 Emotion-Aware Shopping</h1>
        <p>AI-powered recommendations based on your emotions</p>
      </header>

      {/* Main Content Grid */}
      <div className="main-grid">
        
        {/* Webcam Section */}
        <div className="webcam-section">
          <div className="webcam-container">
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              className="webcam"
            />
            <div className="webcam-overlay">
              <FaCamera className="camera-icon" />
              <span className="capture-status">{captureStatus}</span>
            </div>
          </div>
          
          {/* Manual Capture Button */}
          <div className="capture-controls">
            <button 
              className="capture-btn"
              onClick={() => captureAndAnalyze()}
              disabled={isLoading}
            >
              {isLoading ? <FaSpinner className="spinning" /> : <FaCamera />}
              {isLoading ? 'Analyzing...' : 'Analyze Now'}
            </button>
            
            {error && (
              <button 
                className="reset-btn"
                onClick={reset}
                title="Reset and clear error"
              >
                <FaRedo />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Emotion Display */}
        <div className="emotion-section">
          <AnimatePresence mode="wait">
            {currentEmotion && (
              <motion.div
                key={currentEmotion}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5 }}
                className="emotion-display"
              >
                <div 
                  className="emotion-badge"
                  style={{ borderColor: emotionConfig[currentEmotion]?.color }}
                >
                  <span className="emotion-emoji">
                    {emotionConfig[currentEmotion]?.emoji}
                  </span>
                  <div className="emotion-info">
                    <span className="emotion-label">
                      {emotionConfig[currentEmotion]?.label}
                    </span>
                    <span className="emotion-confidence">
                      {formatConfidence(confidence)}% confident
                    </span>
                  </div>
                </div>
                
                {lastCaptureTime && (
                  <div className="last-update">
                    Last updated: {lastCaptureTime.toLocaleTimeString()}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading State */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="loading-state"
            >
              <FaSpinner className="spinning large-spinner" />
              <p>Analyzing your emotion...</p>
            </motion.div>
          )}

          {/* Error State */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="error-state"
            >
              <p>❌ {error}</p>
              <div className="error-actions">
                <button onClick={() => captureAndAnalyze()} className="retry-btn">
                  <FaRedo />
                  Try Again
                </button>
                <button onClick={clearError} className="dismiss-btn">
                  Dismiss
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Recommendation Section */}
        <div className="recommendation-section">
          <AnimatePresence mode="wait">
            {recommendation && (
              <motion.div
                key={recommendation.type}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.6 }}
              >
                {isWellnessMode ? (
                  <WellnessCard recommendation={recommendation} />
                ) : (
                  <ProductCard recommendation={recommendation} />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// Wellness Mode Component
const WellnessCard = ({ recommendation }) => {
  const wellness = recommendation.wellness || {};
  
  return (
    <div className="wellness-card">
      <div className="wellness-header">
        <h2>🧘‍♀️ Wellness Mode</h2>
        <p className="wellness-message">{recommendation.message}</p>
      </div>

      <div className="wellness-content">
        {/* Motivational Quote */}
        {wellness.quote && (
          <div className="wellness-item quote-item">
            <h3>💭 Daily Inspiration</h3>
            <blockquote>{wellness.quote}</blockquote>
          </div>
        )}

        {/* Journal App */}
        {wellness.journalApp && (
          <div className="wellness-item journal-item">
            <h3>📝 Journaling</h3>
            <div className="app-recommendation">
              <strong>{wellness.journalApp.name}</strong>
              <p>{wellness.journalApp.description}</p>
              {wellness.journalApp.url && (
                <a 
                  href={wellness.journalApp.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="wellness-link"
                >
                  Try {wellness.journalApp.name}
                </a>
              )}
            </div>
          </div>
        )}

        {/* Calming Content */}
        {wellness.calmingContent && (
          <div className="wellness-item calming-item">
            <h3>🎵 Relax & Unwind</h3>
            <div className="app-recommendation">
              <strong>{wellness.calmingContent.name}</strong>
              <p>{wellness.calmingContent.content}</p>
              {wellness.calmingContent.url && (
                <a 
                  href={wellness.calmingContent.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="wellness-link"
                >
                  Listen Now
                </a>
              )}
            </div>
          </div>
        )}

        {/* Breathing GIF */}
        <div className="wellness-item breathing-item">
          <h3>🌸 Take a Deep Breath</h3>
          <div className="breathing-animation">
            <div className="breathing-circle"></div>
            <p>Breathe in... Breathe out...</p>
          </div>
        </div>
      </div>

      <div className="wellness-footer">
        <p>💚 Remember: Your wellbeing is more important than any purchase</p>
      </div>
    </div>
  );
};

// Product Recommendation Component
const ProductCard = ({ recommendation }) => {
  const renderProducts = () => {
    if (recommendation.type === 'cheaper_alternative' && recommendation.bestAlternative) {
      const product = recommendation.bestAlternative;
      return (
        <div className="product-grid">
          <div className="product-card alternative">
            <div className="product-header">
              <h3>{product.name}</h3>
              <div className="price-info">
                <span className="current-price">₹{product.price?.toLocaleString()}</span>
                {product.savings && (
                  <span className="savings">Save ₹{product.savings?.toLocaleString()}</span>
                )}
              </div>
            </div>
            <div className="product-body">
              <p>{product.description}</p>
              {product.features && (
                <div className="features">
                  <strong>Features:</strong> {product.features}
                </div>
              )}
              <div className="rating">
                ⭐ {product.rating}/5
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (recommendation.type === 'premium_recommendation' && recommendation.recommendations?.all) {
      return (
        <div className="product-grid">
          {recommendation.recommendations.all.slice(0, 2).map((product, index) => (
            <div key={index} className="product-card premium">
              <div className="product-header">
                <h3>{product.name}</h3>
                <div className="price-info">
                  <span className="current-price">₹{product.price?.toLocaleString()}</span>
                  <span className="premium-badge">Premium</span>
                </div>
              </div>
              <div className="product-body">
                <p>{product.description}</p>
                {product.features && (
                  <div className="features">
                    <strong>Features:</strong> {product.features}
                  </div>
                )}
                <div className="rating">
                  ⭐ {product.rating}/5
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="no-products">
        <p>No specific product recommendations available</p>
      </div>
    );
  };

  return (
    <div className="product-recommendation">
      <div className="recommendation-header">
        <h2>
          {recommendation.type === 'cheaper_alternative' && '💰 Budget-Friendly Alternative'}
          {recommendation.type === 'premium_recommendation' && '✨ Premium Recommendations'}
          {recommendation.type === 'standard_response' && '🛍️ Product Suggestions'}
        </h2>
        <p className="recommendation-message">{recommendation.message}</p>
      </div>

      {renderProducts()}

      {recommendation.supportMessage && (
        <div className="support-message">
          <p>💡 {recommendation.supportMessage}</p>
        </div>
      )}
    </div>
  );
};

export default App;
