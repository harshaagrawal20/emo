# Quick N8N Setup for Emotion-Aware Recommendations

## Option 1: N8N Cloud (Recommended for Testing)

1. **Sign up for N8N Cloud:**
   - Go to https://n8n.cloud/
   - Create a free account
   - Create a new workflow

2. **Import the Workflow:**
   - Copy the content from `n8n-emotion-workflow.json`
   - In N8N Cloud, click "Import from file" and paste the JSON

3. **Update Webhook URL:**
   - Your webhook URL will be: `https://[your-instance].app.n8n.cloud/webhook/emotion-capture`
   - Update the backend app.py with your actual URL

## Option 2: Local N8N Installation

### Install N8N locally:

**Using npm:**
```bash
npm install -g n8n
```

**Using Docker:**
```bash
docker run -it --rm --name n8n -p 5678:5678 n8nio/n8n
```

### Start N8N:
```bash
# Using npm
n8n start

# Using Docker (already running from above command)
```

### Access N8N:
- Open http://localhost:5678
- Create an account/login
- Import the workflow from `n8n-emotion-workflow.json`

## Quick Test Without N8N

Your system is already working! Even without N8N, you'll get:
- ✅ Emotion detection from webcam
- ✅ Mock product recommendations based on emotions
- ✅ Wellness mode for negative emotions

To test right now:
1. Keep your Flask backend running
2. Open your React frontend at http://localhost:3000
3. Allow camera access
4. Smile, frown, or make different expressions to see recommendations!

## Current Status

✅ **Flask Backend:** Running with optimized emotion detection  
✅ **React Frontend:** Ready with 40K product support  
⚠️ **N8N:** Optional - mock recommendations work without it  
✅ **Airtable:** Your 40K products are ready for N8N integration  

## Next Steps

1. **Test the current system** (it works without N8N!)
2. **Set up N8N** using Option 1 or 2 above
3. **Configure Airtable credentials** in N8N
4. **Update webhook URL** in backend if using N8N Cloud

Your emotion-aware recommendation system is ready to go! 🚀
