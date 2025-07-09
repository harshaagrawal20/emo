/**
 * Emotion-Aware Shopping with Face-API.js and Airtable Integration
 * Detects facial expressions and recommends products from Airtable
 */

class EmotionShoppingApp {
    constructor() {
        // DOM elements
        this.video = document.getElementById('video');
        this.overlay = document.getElementById('overlay');
        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.analyzeBtn = document.getElementById('analyzeBtn');
        this.status = document.getElementById('status');
        this.emotionDisplay = document.getElementById('emotionDisplay');
        this.productsDisplay = document.getElementById('productsDisplay');
        
        // Settings
        this.baseIdInput = document.getElementById('baseId');
        this.apiKeyInput = document.getElementById('apiKey');
        this.tableNameInput = document.getElementById('tableName');
        
        // State
        this.isModelLoaded = false;
        this.isCameraActive = false;
        this.currentEmotion = null;
        this.detectionInterval = null;
        this.stream = null;
        
        // Emotion mappings
        this.emotionEmojis = {
            neutral: '😐',
            happy: '😊',
            sad: '😢',
            angry: '😠',
            fearful: '😰',
            disgusted: '🤢',
            surprised: '😮'
        };

        this.emotionColors = {
            neutral: '#6B7280',
            happy: '#10B981',
            sad: '#3B82F6',
            angry: '#EF4444',
            fearful: '#8B5CF6',
            disgusted: '#6B7280',
            surprised: '#F59E0B'
        };

        // Emotion-based product filtering
        this.emotionPreferences = {
            happy: {
                priceMultiplier: 1.3,
                categories: ['Apparel', 'Accessories', 'Footwear'],
                colors: ['Bright', 'Colorful', 'Yellow', 'Orange', 'Pink'],
                usage: ['Party', 'Formal', 'Special'],
                sortBy: 'price_desc' // Premium items
            },
            sad: {
                priceMultiplier: 0.7,
                categories: ['Apparel', 'Personal Care'],
                colors: ['Neutral', 'Soft', 'Blue', 'Grey'],
                usage: ['Casual', 'Comfort'],
                sortBy: 'price_asc' // Budget-friendly
            },
            angry: {
                priceMultiplier: 0.9,
                categories: ['Sports', 'Fitness', 'Apparel'],
                colors: ['Red', 'Black', 'Dark'],
                usage: ['Sports', 'Active'],
                sortBy: 'price_asc'
            },
            surprised: {
                priceMultiplier: 1.1,
                categories: ['Accessories', 'Footwear'],
                colors: ['Bright', 'Unique', 'Colorful'],
                usage: ['Party', 'Casual'],
                sortBy: 'price_desc'
            },
            fearful: {
                priceMultiplier: 0.8,
                categories: ['Apparel'],
                colors: ['Neutral', 'Calm', 'Soft'],
                usage: ['Casual', 'Comfort'],
                sortBy: 'price_asc'
            },
            disgusted: {
                priceMultiplier: 0.6,
                categories: ['Personal Care', 'Health'],
                colors: ['Clean', 'Fresh', 'Light'],
                usage: ['Clean', 'Fresh'],
                sortBy: 'price_asc'
            },
            neutral: {
                priceMultiplier: 1.0,
                categories: ['Apparel', 'Accessories'],
                colors: ['Any'],
                usage: ['Casual', 'Everyday'],
                sortBy: 'rating_desc'
            }
        };
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadModels();
        this.loadSettings();
    }

    setupEventListeners() {
        this.startBtn.addEventListener('click', () => this.startCamera());
        this.stopBtn.addEventListener('click', () => this.stopCamera());
        this.analyzeBtn.addEventListener('click', () => this.analyzeEmotion());
        
        // Save settings when changed
        [this.baseIdInput, this.apiKeyInput, this.tableNameInput].forEach(input => {
            input.addEventListener('change', () => this.saveSettings());
        });
    }

    async loadModels() {
        try {
            this.updateStatus('Loading AI models...', 'info');
            
            // Load face-api.js models
            await faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights');
            await faceapi.nets.faceExpressionNet.loadFromUri('https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights');
            
            this.isModelLoaded = true;
            this.updateStatus('✅ AI models loaded successfully! Click "Start Camera" to begin.', 'success');
            
        } catch (error) {
            console.error('Error loading models:', error);
            this.updateStatus('❌ Failed to load AI models. Please refresh the page.', 'warning');
        }
    }

    async startCamera() {
        if (!this.isModelLoaded) {
            this.updateStatus('⚠️ AI models are still loading. Please wait...', 'warning');
            return;
        }

        try {
            this.updateStatus('Starting camera...', 'info');
            
            this.stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                } 
            });
            
            this.video.srcObject = this.stream;
            this.video.onloadedmetadata = () => {
                this.setupCanvas();
                this.isCameraActive = true;
                this.startBtn.disabled = true;
                this.stopBtn.disabled = false;
                this.analyzeBtn.disabled = false;
                this.updateStatus('✅ Camera active! Click "Analyze Emotion" or wait for auto-detection.', 'success');
                
                // Start automatic emotion detection every 5 seconds
                this.detectionInterval = setInterval(() => {
                    this.analyzeEmotion();
                }, 5000);
            };
            
        } catch (error) {
            console.error('Error starting camera:', error);
            this.updateStatus('❌ Failed to access camera. Please grant camera permissions.', 'warning');
        }
    }

    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        
        if (this.detectionInterval) {
            clearInterval(this.detectionInterval);
            this.detectionInterval = null;
        }
        
        this.video.srcObject = null;
        this.isCameraActive = false;
        this.startBtn.disabled = false;
        this.stopBtn.disabled = true;
        this.analyzeBtn.disabled = true;
        
        // Clear canvas
        const ctx = this.overlay.getContext('2d');
        ctx.clearRect(0, 0, this.overlay.width, this.overlay.height);
        
        this.updateStatus('Camera stopped. Click "Start Camera" to resume.', 'info');
    }

    setupCanvas() {
        const rect = this.video.getBoundingClientRect();
        this.overlay.width = this.video.videoWidth;
        this.overlay.height = this.video.videoHeight;
        this.overlay.style.width = '100%';
        this.overlay.style.height = 'auto';
    }

    async analyzeEmotion() {
        if (!this.isCameraActive || !this.isModelLoaded) {
            return;
        }

        try {
            this.updateStatus('🔍 Analyzing facial expression...', 'info');
            
            // Detect faces and expressions
            const detections = await faceapi
                .detectAllFaces(this.video, new faceapi.TinyFaceDetectorOptions())
                .withFaceExpressions();

            // Clear previous drawings
            const ctx = this.overlay.getContext('2d');
            ctx.clearRect(0, 0, this.overlay.width, this.overlay.height);

            if (detections.length === 0) {
                this.updateStatus('⚠️ No face detected. Please position your face in the camera.', 'warning');
                this.showEmotionDisplay(null);
                return;
            }

            // Use the first detected face
            const detection = detections[0];
            const expressions = detection.expressions;
            
            // Find dominant emotion
            const emotions = Object.keys(expressions);
            let dominantEmotion = emotions.reduce((a, b) => 
                expressions[a] > expressions[b] ? a : b
            );
            
            const confidence = expressions[dominantEmotion];

            // Draw face detection box
            this.drawFaceDetection(ctx, detection.detection.box, dominantEmotion, confidence);

            // Update emotion display
            this.currentEmotion = {
                emotion: dominantEmotion,
                confidence: confidence,
                allEmotions: expressions,
                timestamp: new Date()
            };

            this.showEmotionDisplay(this.currentEmotion);
            
            // Fetch and display products based on emotion
            await this.fetchEmotionBasedProducts(dominantEmotion, confidence);
            
            this.updateStatus(`✅ Detected: ${dominantEmotion} (${(confidence * 100).toFixed(1)}% confidence)`, 'success');

        } catch (error) {
            console.error('Error analyzing emotion:', error);
            this.updateStatus('❌ Error analyzing emotion. Please try again.', 'warning');
        }
    }

    drawFaceDetection(ctx, box, emotion, confidence) {
        const { x, y, width, height } = box;
        
        // Set drawing style based on emotion
        const color = this.emotionColors[emotion] || '#4facfe';
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.fillStyle = color;
        ctx.font = '16px Inter, Arial, sans-serif';
        
        // Draw face box
        ctx.strokeRect(x, y, width, height);
        
        // Draw emotion label
        const label = `${emotion} (${(confidence * 100).toFixed(1)}%)`;
        const textWidth = ctx.measureText(label).width;
        const textHeight = 20;
        
        // Background for text
        ctx.fillRect(x, y - textHeight - 5, textWidth + 10, textHeight + 5);
        
        // Text
        ctx.fillStyle = 'white';
        ctx.fillText(label, x + 5, y - 8);
    }

    showEmotionDisplay(emotionData) {
        if (!emotionData) {
            this.emotionDisplay.innerHTML = `
                <div class="loading">
                    <p>No face detected</p>
                </div>
            `;
            return;
        }

        const { emotion, confidence, allEmotions, timestamp } = emotionData;
        const emoji = this.emotionEmojis[emotion] || '😐';
        const color = this.emotionColors[emotion] || '#6B7280';

        // Sort all emotions by confidence
        const sortedEmotions = Object.entries(allEmotions)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3);

        this.emotionDisplay.innerHTML = `
            <div class="emotion-display">
                <span class="emotion-emoji">${emoji}</span>
                <div class="emotion-name" style="color: ${color}">${emotion.charAt(0).toUpperCase() + emotion.slice(1)}</div>
                <div class="emotion-confidence">${(confidence * 100).toFixed(1)}% confident</div>
                <div class="emotion-details">
                    <strong>All emotions:</strong><br>
                    ${sortedEmotions.map(([emo, conf]) => 
                        `${emo}: ${(conf * 100).toFixed(1)}%`
                    ).join('<br>')}
                </div>
                <div class="emotion-details" style="margin-top: 10px;">
                    Last updated: ${timestamp.toLocaleTimeString()}
                </div>
            </div>
        `;
    }

    async fetchEmotionBasedProducts(emotion, confidence) {
        const baseId = this.baseIdInput.value.trim();
        const apiKey = this.apiKeyInput.value.trim();
        const tableName = this.tableNameInput.value.trim() || 'productss';

        if (!baseId || !apiKey) {
            this.showProductsDisplay([]);
            this.updateStatus('⚠️ Please configure Airtable Base ID and API Key in settings.', 'warning');
            return;
        }

        try {
            this.updateStatus('🛍️ Fetching personalized product recommendations...', 'info');

            const preferences = this.emotionPreferences[emotion] || this.emotionPreferences.neutral;
            
            // Build Airtable filter formula
            const filters = [];
            
            // Category filter
            if (preferences.categories.length > 0) {
                const categoryFilter = preferences.categories
                    .map(cat => `{masterCategory} = "${cat}"`)
                    .join(', ');
                filters.push(`OR(${categoryFilter})`);
            }

            // Price range filter (optional - if you want to filter by price)
            // filters.push(`{price} > 0`); // Only products with valid prices

            const filterFormula = filters.length > 0 ? `AND(${filters.join(', ')})` : '';
            
            // Determine sort order
            let sortField, sortDirection;
            switch (preferences.sortBy) {
                case 'price_asc':
                    sortField = 'price';
                    sortDirection = 'asc';
                    break;
                case 'price_desc':
                    sortField = 'price';
                    sortDirection = 'desc';
                    break;
                default:
                    sortField = 'id';
                    sortDirection = 'asc';
            }

            // Airtable API request
            const url = `https://api.airtable.com/v0/${baseId}/${tableName}`;
            const params = {
                maxRecords: 20,
                sort: [{ field: sortField, direction: sortDirection }]
            };

            if (filterFormula) {
                params.filterByFormula = filterFormula;
            }

            const response = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                params: params
            });

            if (response.data && response.data.records) {
                const products = response.data.records.map(record => ({
                    id: record.fields.id,
                    name: record.fields.productDisplayName,
                    price: record.fields.price,
                    category: record.fields.masterCategory,
                    subCategory: record.fields.subCategory,
                    articleType: record.fields.articleType,
                    gender: record.fields.gender,
                    color: record.fields.baseColour,
                    season: record.fields.season,
                    usage: record.fields.usage,
                    image: record.fields.link
                }));

                this.showProductsDisplay(products, emotion, preferences);
                this.updateStatus(`✅ Found ${products.length} products matching your ${emotion} mood!`, 'success');
            } else {
                throw new Error('No products returned from Airtable');
            }

        } catch (error) {
            console.error('Error fetching products:', error);
            this.showProductsDisplay([]);
            
            let errorMessage = '❌ Failed to fetch products. ';
            if (error.response?.status === 401) {
                errorMessage += 'Please check your Airtable API key.';
            } else if (error.response?.status === 404) {
                errorMessage += 'Please check your Base ID and table name.';
            } else {
                errorMessage += 'Please check your Airtable configuration.';
            }
            
            this.updateStatus(errorMessage, 'warning');
        }
    }

    showProductsDisplay(products, emotion = null, preferences = null) {
        if (!products || products.length === 0) {
            this.productsDisplay.innerHTML = `
                <div class="loading">
                    <p>No products found. Please check your Airtable configuration.</p>
                </div>
            `;
            return;
        }

        const emotionInfo = emotion ? `
            <div class="status-message status-info">
                <strong>🎯 ${emotion.charAt(0).toUpperCase() + emotion.slice(1)} Mood Detected!</strong><br>
                Showing products that match your current emotional state.
                ${preferences ? `<br><small>Focus: ${preferences.categories.join(', ')} • Sort: ${preferences.sortBy.replace('_', ' ')}</small>` : ''}
            </div>
        ` : '';

        this.productsDisplay.innerHTML = `
            ${emotionInfo}
            <div class="products-grid">
                ${products.slice(0, 10).map(product => this.createProductCard(product)).join('')}
            </div>
        `;
    }

    createProductCard(product) {
        const price = product.price ? `₹${product.price.toLocaleString()}` : 'Price not available';
        const image = product.image || 'https://via.placeholder.com/300x200?text=No+Image';
        
        return `
            <div class="product-card">
                <img src="${image}" alt="${product.name}" class="product-image" 
                     onerror="this.src='https://via.placeholder.com/300x200?text=Image+Not+Found'">
                <div class="product-name">${product.name || 'Unnamed Product'}</div>
                <div class="product-price">${price}</div>
                <div class="product-meta">
                    <span class="meta-tag product-category">${product.category || 'Unknown'}</span>
                    <span class="meta-tag product-gender">${product.gender || 'Unisex'}</span>
                    <span class="meta-tag">${product.articleType || product.subCategory || 'Item'}</span>
                </div>
                <div class="product-meta">
                    <span class="meta-tag">${product.color || 'Color N/A'}</span>
                    <span class="meta-tag">${product.usage || 'General'}</span>
                    <span class="meta-tag">${product.season || 'All Season'}</span>
                </div>
            </div>
        `;
    }

    updateStatus(message, type = 'info') {
        this.status.className = `status-message status-${type}`;
        this.status.textContent = message;
    }

    saveSettings() {
        const settings = {
            baseId: this.baseIdInput.value,
            apiKey: this.apiKeyInput.value,
            tableName: this.tableNameInput.value
        };
        localStorage.setItem('emotionShoppingSettings', JSON.stringify(settings));
    }

    loadSettings() {
        const saved = localStorage.getItem('emotionShoppingSettings');
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                this.baseIdInput.value = settings.baseId || '';
                this.apiKeyInput.value = settings.apiKey || '';
                this.tableNameInput.value = settings.tableName || 'productss';
            } catch (error) {
                console.error('Error loading saved settings:', error);
            }
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new EmotionShoppingApp();
});
