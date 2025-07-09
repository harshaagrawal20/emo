# Demo Script for React Frontend

This script will help you run and test the React frontend for the emotion-aware recommendation system.

## Prerequisites

Before running the frontend, ensure you have:

1. **Node.js installed** (version 14 or higher)
   ```bash
   node --version
   npm --version
   ```

2. **Backend Flask API running** on `http://localhost:5000`
   - Navigate to the backend folder: `cd backend`
   - Install Python dependencies: `pip install -r ../requirements.txt`
   - Run the Flask app: `python app.py`

3. **n8n workflow running** (optional for full functionality)
   - Follow the setup guide in `n8n-setup-guide.md`

## Setup and Installation

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install npm dependencies:**
   ```bash
   npm install
   ```

3. **Verify all dependencies are installed:**
   ```bash
   npm list
   ```

## Running the Application

### Development Mode
```bash
npm start
```

This will:
- Start the React development server on `http://localhost:3000`
- Open your default browser automatically
- Enable hot-reloading for development

### Production Build
```bash
npm run build
npm install -g serve
serve -s build
```

## Testing the Frontend

### 1. Webcam Access
- Grant camera permissions when prompted
- Verify that your webcam feed appears in the left panel
- Check that the capture status shows "Ready"

### 2. Manual Testing
- Click the "Analyze Now" button to manually trigger emotion detection
- Watch for the loading states and status updates
- Verify that detected emotions appear with confidence levels

### 3. Auto-Capture Testing
- Wait for automatic captures every 8 seconds
- Test different facial expressions:
  - 😊 Happy: Smile broadly
  - 😢 Sad: Frown or look down
  - 😠 Angry: Furrow brows, tense face
  - 😮 Surprised: Open mouth, raise eyebrows
  - 😐 Neutral: Relaxed, normal expression

### 4. API Integration Testing
- Verify that API calls are made to `http://localhost:5000/detect_emotion`
- Check browser developer tools (F12) for network requests
- Confirm that recommendations appear when the backend is connected

### 5. Error Handling Testing
- Disconnect from internet to test network error handling
- Stop the backend server to test connection failures
- Cover webcam to test "no face detected" scenarios

## Troubleshooting

### Common Issues

**1. Webcam Not Working**
- Check browser permissions for camera access
- Try a different browser (Chrome/Firefox recommended)
- Ensure no other applications are using the camera

**2. API Connection Issues**
- Verify Flask backend is running on port 5000
- Check CORS settings in the backend
- Ensure firewall isn't blocking localhost connections

**3. Build Errors**
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version compatibility

**4. Performance Issues**
- Reduce capture frequency by modifying the interval in `App.js`
- Check browser developer tools for console errors
- Monitor network tab for slow API responses

### Development Tools

**React Developer Tools:**
- Install the React DevTools browser extension
- Inspect component state and props
- Monitor re-renders and performance

**Network Debugging:**
- Open browser DevTools (F12)
- Go to Network tab
- Filter by "XHR" to see API calls
- Check request/response details

## Environment Variables

Create a `.env` file in the frontend directory for custom configuration:

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_DEBUG=true
```

## Available Scripts

- `npm start` - Development server
- `npm test` - Run test suite
- `npm run build` - Production build
- `npm run eject` - Eject from Create React App (not recommended)

## Browser Compatibility

Recommended browsers:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Note: Webcam features require HTTPS in production environments.

## Demo Scenarios

### Scenario 1: Happy Shopping
1. Smile at the camera
2. Wait for "Happy" emotion detection
3. Expect premium product recommendations

### Scenario 2: Sad Response
1. Make a sad expression multiple times
2. Watch for wellness mode activation
3. Verify motivational content appears

### Scenario 3: Budget-Conscious Shopping
1. Show sadness while viewing expensive items
2. Expect cheaper alternative suggestions
3. Check for budget-friendly recommendations

## Next Steps

After testing the frontend:
1. Connect to your actual product database
2. Customize emotion thresholds and recommendations
3. Add user authentication and profiles
4. Implement analytics and tracking
5. Deploy to production environment

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify all services are running correctly
3. Review the network requests in developer tools
4. Test with different browsers and devices
