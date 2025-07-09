/**
 * EmotiShop - AI-Powered E-Commerce with Emotion Detection
 * Complete shopping experience with facial expression analysis
 */

class EmotiShop {
    constructor() {
        // DOM elements
        this.video = document.getElementById('video');
        this.overlay = document.getElementById('overlay');
        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.analyzeBtn = document.getElementById('analyzeBtn');
        this.status = document.getElementById('status');
        this.emotionDisplay = document.getElementById('emotionDisplay');
        this.navEmotion = document.getElementById('navEmotion');
        this.productsGrid = document.getElementById('productsGrid');
        this.productsTitle = document.getElementById('productsTitle');
        
        // Settings
        this.baseIdInput = document.getElementById('baseId');
        this.apiKeyInput = document.getElementById('apiKey');
        this.tableNameInput = document.getElementById('tableName');
        this.aiToggle = document.getElementById('aiToggle');
        this.sortSelect = document.getElementById('sortSelect');
        
        // Filter elements
        this.filterBtn = document.getElementById('filterBtn');
        this.filtersPanel = document.getElementById('filtersPanel');
        this.categoryFilter = document.getElementById('categoryFilter');
        this.genderFilter = document.getElementById('genderFilter');
        this.articleFilter = document.getElementById('articleFilter');
        this.seasonFilter = document.getElementById('seasonFilter');
        this.priceFilter = document.getElementById('priceFilter');
        this.colorFilter = document.getElementById('colorFilter');
        this.clearFilters = document.getElementById('clearFilters');
        this.applyFilters = document.getElementById('applyFilters');
        this.activeFilters = document.getElementById('activeFilters');
        this.categoryStats = document.getElementById('categoryStats');
        
        // Cart elements
        this.cartToggle = document.getElementById('cartToggle');
        this.cartSidebar = document.getElementById('cartSidebar');
        this.cartClose = document.getElementById('cartClose');
        this.cartItems = document.getElementById('cartItems');
        this.cartCount = document.getElementById('cartCount');
        this.cartTotal = document.getElementById('cartTotal');
        this.checkoutBtn = document.getElementById('checkoutBtn');
        
        // Modal elements
        this.quickViewModal = document.getElementById('quickViewModal');
        this.modalContent = document.getElementById('modalContent');
        this.modalClose = document.getElementById('modalClose');
        
        // State
        this.isModelLoaded = false;
        this.isCameraActive = false;
        this.currentEmotion = null;
        this.detectionInterval = null;
        this.stream = null;
        this.allProducts = [];
        this.filteredProducts = [];
        this.cart = JSON.parse(localStorage.getItem('emotiShopCart')) || [];
        this.currentFilters = {
            category: '',
            gender: '',
            article: '',
            season: '',
            price: '',
            color: ''
        };
        
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

        // Enhanced emotion-based product preferences
        this.emotionPreferences = {
            happy: {
                categories: ['Accessories', 'Footwear', 'Apparel'],
                colors: ['Bright', 'Yellow', 'Orange', 'Pink', 'Red'],
                usage: ['Party', 'Formal', 'Special'],
                priceRange: 'premium',
                keywords: ['party', 'celebration', 'formal', 'special'],
                sortBy: 'price_desc'
            },
            sad: {
                categories: ['Apparel', 'Personal Care'],
                colors: ['Blue', 'Grey', 'Neutral', 'Soft'],
                usage: ['Casual', 'Comfort'],
                priceRange: 'budget',
                keywords: ['comfort', 'soft', 'casual'],
                sortBy: 'price_asc'
            },
            angry: {
                categories: ['Sports', 'Fitness', 'Apparel'],
                colors: ['Red', 'Black', 'Dark'],
                usage: ['Sports', 'Active', 'Gym'],
                priceRange: 'mid',
                keywords: ['sports', 'active', 'gym', 'fitness'],
                sortBy: 'price_asc'
            },
            surprised: {
                categories: ['Accessories', 'Footwear'],
                colors: ['Bright', 'Unique', 'Colorful'],
                usage: ['Party', 'Casual'],
                priceRange: 'premium',
                keywords: ['unique', 'special', 'standout'],
                sortBy: 'price_desc'
            },
            fearful: {
                categories: ['Apparel'],
                colors: ['Neutral', 'Calm', 'Soft', 'Pastel'],
                usage: ['Casual', 'Comfort'],
                priceRange: 'budget',
                keywords: ['comfort', 'soft', 'safe'],
                sortBy: 'price_asc'
            },
            disgusted: {
                categories: ['Personal Care', 'Health'],
                colors: ['Clean', 'Fresh', 'Light', 'White'],
                usage: ['Clean', 'Fresh'],
                priceRange: 'budget',
                keywords: ['clean', 'fresh', 'pure'],
                sortBy: 'price_asc'
            },
            neutral: {
                categories: ['Apparel', 'Accessories'],
                colors: ['Any'],
                usage: ['Casual', 'Everyday'],
                priceRange: 'mid',
                keywords: ['everyday', 'classic'],
                sortBy: 'rating_desc'
            }
        };
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadModels();
        this.loadSettings();
        this.updateCartDisplay();
        await this.loadAllProducts();
    }

    setupEventListeners() {
        // Camera controls
        this.startBtn.addEventListener('click', () => this.startCamera());
        this.stopBtn.addEventListener('click', () => this.stopCamera());
        this.analyzeBtn.addEventListener('click', () => this.analyzeEmotion());
        
        // Settings
        [this.baseIdInput, this.apiKeyInput, this.tableNameInput].forEach(input => {
            input.addEventListener('change', () => this.saveSettings());
        });
        
        // AI toggle
        this.aiToggle.addEventListener('change', () => this.filterProducts());
        
        // Sort
        this.sortSelect.addEventListener('change', () => this.sortProducts());
        
        // Filters
        this.filterBtn.addEventListener('click', () => this.toggleFiltersPanel());
        this.clearFilters.addEventListener('click', () => this.clearAllFilters());
        this.applyFilters.addEventListener('click', () => this.applyCurrentFilters());
        
        // Filter dropdowns
        [this.categoryFilter, this.genderFilter, this.articleFilter, 
         this.seasonFilter, this.priceFilter, this.colorFilter].forEach(filter => {
            filter.addEventListener('change', () => this.updateCurrentFilters());
        });
        
        // Cart
        this.cartToggle.addEventListener('click', () => this.toggleCart());
        this.cartClose.addEventListener('click', () => this.toggleCart());
        this.checkoutBtn.addEventListener('click', () => this.checkout());
        
        // Modal
        this.modalClose.addEventListener('click', () => this.closeModal());
        this.quickViewModal.addEventListener('click', (e) => {
            if (e.target === this.quickViewModal) this.closeModal();
        });
        
        // Close cart when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.cartSidebar.contains(e.target) && !this.cartToggle.contains(e.target)) {
                this.cartSidebar.classList.remove('open');
            }
        });
    }

    async loadModels() {
        try {
            this.updateStatus('🤖 Loading AI models...', 'info');
            
            await faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights');
            await faceapi.nets.faceExpressionNet.loadFromUri('https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights');
            
            this.isModelLoaded = true;
            this.updateStatus('✅ AI models loaded! Start camera for emotion-based recommendations.', 'success');
            
        } catch (error) {
            console.error('Error loading models:', error);
            this.updateStatus('❌ Failed to load AI models. Refresh to try again.', 'warning');
        }
    }

    async startCamera() {
        if (!this.isModelLoaded) {
            this.updateStatus('⚠️ AI models still loading. Please wait...', 'warning');
            return;
        }

        try {
            this.updateStatus('📹 Starting camera...', 'info');
            
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
                this.updateStatus('✅ Camera active! AI is analyzing your emotions...', 'success');
                
                // Start automatic emotion detection
                this.detectionInterval = setInterval(() => {
                    this.analyzeEmotion();
                }, 3000);
            };
            
        } catch (error) {
            console.error('Error starting camera:', error);
            this.updateStatus('❌ Camera access denied. Please allow camera permissions.', 'warning');
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
        
        const ctx = this.overlay.getContext('2d');
        ctx.clearRect(0, 0, this.overlay.width, this.overlay.height);
        
        // Reset emotion display
        this.showEmotionDisplay(null);
        this.navEmotion.innerHTML = '<i class="fas fa-smile"></i><span>Stopped</span>';
        
        this.updateStatus('📷 Camera stopped. Products showing all items.', 'info');
        this.filterProducts();
    }

    setupCanvas() {
        this.overlay.width = this.video.videoWidth;
        this.overlay.height = this.video.videoHeight;
        this.overlay.style.width = '100%';
        this.overlay.style.height = '100%';
    }

    async analyzeEmotion() {
        if (!this.isCameraActive || !this.isModelLoaded) return;

        try {
            const detections = await faceapi
                .detectAllFaces(this.video, new faceapi.TinyFaceDetectorOptions())
                .withFaceExpressions();

            const ctx = this.overlay.getContext('2d');
            ctx.clearRect(0, 0, this.overlay.width, this.overlay.height);

            if (detections.length === 0) {
                this.showEmotionDisplay(null);
                this.navEmotion.innerHTML = '<i class="fas fa-user-slash"></i><span>No face</span>';
                return;
            }

            const detection = detections[0];
            const expressions = detection.expressions;
            
            const dominantEmotion = Object.keys(expressions).reduce((a, b) => 
                expressions[a] > expressions[b] ? a : b
            );
            
            const confidence = expressions[dominantEmotion];

            this.drawFaceDetection(ctx, detection.detection.box, dominantEmotion, confidence);

            this.currentEmotion = {
                emotion: dominantEmotion,
                confidence: confidence,
                allEmotions: expressions,
                timestamp: new Date()
            };

            this.showEmotionDisplay(this.currentEmotion);
            this.updateNavEmotion(dominantEmotion, confidence);
            
            // Filter products based on emotion if AI toggle is on
            if (this.aiToggle.checked) {
                this.filterProducts();
            }

        } catch (error) {
            console.error('Error analyzing emotion:', error);
        }
    }

    drawFaceDetection(ctx, box, emotion, confidence) {
        const { x, y, width, height } = box;
        const color = this.emotionColors[emotion] || '#4facfe';
        
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.fillStyle = color;
        ctx.font = '14px Inter';
        
        ctx.strokeRect(x, y, width, height);
        
        const label = `${emotion} (${(confidence * 100).toFixed(1)}%)`;
        const textWidth = ctx.measureText(label).width;
        
        ctx.fillRect(x, y - 20, textWidth + 10, 20);
        ctx.fillStyle = 'white';
        ctx.fillText(label, x + 5, y - 5);
    }

    showEmotionDisplay(emotionData) {
        if (!emotionData) {
            this.emotionDisplay.innerHTML = `
                <span class="emotion-emoji">🎭</span>
                <div class="emotion-name">No face detected</div>
                <div class="emotion-confidence">Position face in camera</div>
            `;
            return;
        }

        const { emotion, confidence } = emotionData;
        const emoji = this.emotionEmojis[emotion] || '😐';
        const color = this.emotionColors[emotion] || '#6B7280';

        this.emotionDisplay.innerHTML = `
            <span class="emotion-emoji">${emoji}</span>
            <div class="emotion-name" style="color: ${color}">
                ${emotion.charAt(0).toUpperCase() + emotion.slice(1)}
            </div>
            <div class="emotion-confidence">${(confidence * 100).toFixed(1)}% confident</div>
        `;
    }

    updateNavEmotion(emotion, confidence) {
        const emoji = this.emotionEmojis[emotion] || '😐';
        this.navEmotion.innerHTML = `
            <span>${emoji}</span>
            <span>${emotion} (${(confidence * 100).toFixed(1)}%)</span>
        `;
    }

    async loadAllProducts() {
        const baseId = this.baseIdInput.value.trim();
        const apiKey = this.apiKeyInput.value.trim();
        const tableName = this.tableNameInput.value.trim() || 'productss';

        if (!baseId || !apiKey) {
            this.updateStatus('⚠️ Please configure Airtable credentials in settings.', 'warning');
            this.showProducts([]);
            return;
        }

        try {
            this.updateStatus('🔄 Connecting to Airtable and loading all products...', 'info');
            
            // Show skeleton loader immediately
            this.showSkeletonLoader(12);

            const url = `https://api.airtable.com/v0/${baseId}/${tableName}`;
            let allRecords = [];
            let offset = null;

            // Enhanced pagination with better progress and performance
            let batchCount = 0;
            let retryCount = 0;
            const maxRetries = 3;
            
            console.log('🔍 Starting product fetch from Airtable...');
            console.log('📍 Base ID:', baseId);
            console.log('📍 Table Name:', tableName);
            console.log('📍 API URL:', url);
            
            do {
                batchCount++;
                let success = false;
                
                while (!success && retryCount < maxRetries) {
                    try {
                        const params = { 
                            pageSize: 100,
                        };
                        if (offset) {
                            params.offset = offset;
                            console.log(`🔄 Using offset for batch ${batchCount}:`, offset);
                        }

                        // Update progress with animation
                        this.updateLoadingProgress(allRecords.length, Math.max(allRecords.length * 2, 40000), batchCount);
                        console.log(`📥 Fetching batch ${batchCount} with params:`, params);

                        const response = await axios.get(url, {
                            headers: {
                                'Authorization': `Bearer ${apiKey}`,
                                'Content-Type': 'application/json'
                            },
                            params: params,
                            timeout: 45000
                        });

                        console.log(`✅ Batch ${batchCount} response:`, {
                            recordsCount: response.data.records?.length || 0,
                            hasOffset: !!response.data.offset,
                            offset: response.data.offset,
                            totalSoFar: allRecords.length + (response.data.records?.length || 0)
                        });

                        if (response.data && response.data.records) {
                            const newRecords = response.data.records;
                            allRecords = allRecords.concat(newRecords);
                            offset = response.data.offset;
                            success = true;
                            retryCount = 0;
                            
                            console.log(`📊 Batch ${batchCount} complete: ${newRecords.length} records added, ${allRecords.length} total, offset: ${offset || 'none'}`);
                            
                            // Progressive rendering for better UX
                            if (batchCount === 1) {
                                this.processAndShowFirstBatch(newRecords);
                            }
                            
                            // Respect rate limits
                            if (offset) {
                                await new Promise(resolve => setTimeout(resolve, 250));
                            }
                        } else {
                            console.log(`⚠️ Batch ${batchCount} returned no data or invalid structure`);
                            console.log('Response data:', response.data);
                            break;
                        }
                    } catch (batchError) {
                        retryCount++;
                        console.error(`❌ Batch ${batchCount} error (attempt ${retryCount}):`, batchError);
                        
                        if (batchError.response) {
                            console.log('Error response status:', batchError.response.status);
                            console.log('Error response data:', batchError.response.data);
                            
                            if (batchError.response.status === 422) {
                                console.log('🚫 422 Error - This might indicate a view filter, permission issue, or invalid table name');
                            }
                        }
                        
                        if (retryCount < maxRetries) {
                            this.updateStatus(`⚠️ Batch ${batchCount} failed, retrying (${retryCount}/${maxRetries})... Error: ${batchError.message}`, 'warning');
                            await new Promise(resolve => setTimeout(resolve, 2000 * retryCount));
                        } else {
                            throw batchError;
                        }
                    }
                }
                
                if (!success) {
                    throw new Error(`Failed to load batch ${batchCount} after ${maxRetries} retries`);
                }
                
            } while (offset);

            console.log(`🎉 Final result: ${allRecords.length} total records loaded in ${batchCount} batches`);

            // Enhanced debugging for the issue
            if (allRecords.length === 100) {
                console.log('🚨 DEBUGGING: Only 100 records loaded - this suggests a limitation');
                console.log('🔍 Possible causes:');
                console.log('1. View filter in Airtable limiting results');
                console.log('2. Table permissions or API key limitations');
                console.log('3. Airtable base configuration issue');
                console.log('📝 First record sample:', allRecords[0]);
                console.log('📝 Last record sample:', allRecords[allRecords.length - 1]);
            }

            // Process all products with better performance
            this.allProducts = allRecords.map(record => ({
                id: record.fields.id || record.id,
                name: record.fields.productDisplayName || 'Unnamed Product',
                price: record.fields.price || 0,
                category: record.fields.masterCategory || 'Unknown',
                subCategory: record.fields.subCategory || '',
                articleType: record.fields.articleType || '',
                gender: record.fields.gender || 'Unisex',
                color: record.fields.baseColour || 'N/A',
                season: record.fields.season || 'All Season',
                usage: record.fields.usage || 'General',
                image: record.fields.link || 'https://via.placeholder.com/300x200?text=No+Image'
            }));

            console.log('🔍 Field analysis:');
            console.log('Categories found:', [...new Set(this.allProducts.map(p => p.category))]);
            console.log('Sample product:', this.allProducts[0]);

            this.filteredProducts = [...this.allProducts];
            this.populateFilterOptions();
            this.updateCategoryStats();
            
            // Update status with success message
            if (allRecords.length === 100) {
                this.updateStatus(`⚠️ Loaded ${this.allProducts.length} products (exactly 100 - may be limited by view filters). Check console for debugging info.`, 'warning');
            } else {
                this.updateStatus(`✅ Successfully loaded ALL ${this.allProducts.length} products from Airtable! 🎉`, 'success');
            }
            
            // Show breakdown by category
            const categories = [...new Set(this.allProducts.map(p => p.category))].filter(c => c && c !== 'Unknown');
            const categoryBreakdown = categories.map(cat => {
                const count = this.allProducts.filter(p => p.category === cat).length;
                return `${cat}: ${count}`;
            }).join(', ');
            
            setTimeout(() => {
                this.updateStatus(`📊 Product breakdown: ${categoryBreakdown}`, 'info');
            }, 3000);
            
            this.filterProducts();

        } catch (error) {
            console.error('Error loading products:', error);
            this.updateStatus('❌ Failed to load products. Check Airtable configuration.', 'warning');
            this.showProducts([]);
        }
    }

    processAndShowFirstBatch(records) {
        // Process first batch for immediate display
        const firstBatchProducts = records.map(record => ({
            id: record.fields.id || record.id,
            name: record.fields.productDisplayName || 'Unnamed Product',
            price: record.fields.price || 0,
            category: record.fields.masterCategory || 'Unknown',
            subCategory: record.fields.subCategory || '',
            articleType: record.fields.articleType || '',
            gender: record.fields.gender || 'Unisex',
            color: record.fields.baseColour || 'N/A',
            season: record.fields.season || 'All Season',
            usage: record.fields.usage || 'General',
            image: record.fields.link || 'https://via.placeholder.com/300x200?text=No+Image'
        }));
        
        // Show first batch immediately for better perceived performance
        this.showProducts(firstBatchProducts);
        this.updateStatus(`📦 Showing first ${firstBatchProducts.length} products, loading more...`, 'info');
    }

    updateLoadingProgress(loaded, estimated, batch) {
        const percentage = Math.min((loaded / estimated) * 100, 95);
        
        // Create or update progress bar
        let progressContainer = document.querySelector('.loading-progress');
        if (!progressContainer) {
            progressContainer = document.createElement('div');
            progressContainer.className = 'loading-progress';
            progressContainer.innerHTML = `
                <div class="progress-container">
                    <div class="progress-bar"></div>
                </div>
                <div class="progress-text">Loading products...</div>
            `;
            this.productsGrid.parentNode.insertBefore(progressContainer, this.productsGrid);
        }
        
        const progressBar = progressContainer.querySelector('.progress-bar');
        const progressText = progressContainer.querySelector('.progress-text');
        
        progressBar.style.width = `${percentage}%`;
        progressText.textContent = `Loading batch ${batch}... (${loaded} products loaded)`;
        
        // Remove progress bar when done
        if (percentage >= 95) {
            setTimeout(() => {
                progressContainer.remove();
            }, 1000);
        }
    }

    populateFilterOptions() {
        // Get unique values for each filter
        const categories = [...new Set(this.allProducts.map(p => p.category))].filter(c => c && c !== 'Unknown').sort();
        const articles = [...new Set(this.allProducts.map(p => p.articleType))].filter(a => a).sort();
        const colors = [...new Set(this.allProducts.map(p => p.color))].filter(c => c && c !== 'N/A').sort();
        
        // Populate category filter
        this.categoryFilter.innerHTML = '<option value="">All Categories</option>' +
            categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
        
        // Populate article type filter
        this.articleFilter.innerHTML = '<option value="">All Types</option>' +
            articles.map(art => `<option value="${art}">${art}</option>`).join('');
        
        // Populate color filter
        this.colorFilter.innerHTML = '<option value="">All Colors</option>' +
            colors.map(col => `<option value="${col}">${col}</option>`).join('');
    }

    updateCategoryStats() {
        const stats = {};
        
        // Count products by category
        this.allProducts.forEach(product => {
            const category = product.category;
            if (category && category !== 'Unknown') {
                stats[category] = (stats[category] || 0) + 1;
            }
        });

        // Display stats
        this.categoryStats.innerHTML = Object.entries(stats)
            .sort(([,a], [,b]) => b - a)
            .map(([category, count]) => `
                <div class="stat-card">
                    <div class="stat-number">${count}</div>
                    <div class="stat-label">${category}</div>
                </div>
            `).join('');
        
        this.categoryStats.style.display = Object.keys(stats).length > 0 ? 'grid' : 'none';
    }

    toggleFiltersPanel() {
        this.filtersPanel.classList.toggle('show');
        const isVisible = this.filtersPanel.classList.contains('show');
        this.filterBtn.innerHTML = isVisible ? 
            '<i class="fas fa-times"></i> Hide Filters' : 
            '<i class="fas fa-filter"></i> Show Filters';
    }

    updateCurrentFilters() {
        this.currentFilters = {
            category: this.categoryFilter.value,
            gender: this.genderFilter.value,
            article: this.articleFilter.value,
            season: this.seasonFilter.value,
            price: this.priceFilter.value,
            color: this.colorFilter.value
        };
        this.updateActiveFiltersDisplay();
    }

    updateActiveFiltersDisplay() {
        const activeFilters = [];
        
        Object.entries(this.currentFilters).forEach(([key, value]) => {
            if (value) {
                const label = {
                    category: 'Category',
                    gender: 'Gender',
                    article: 'Type',
                    season: 'Season',
                    price: 'Price',
                    color: 'Color'
                }[key];
                
                activeFilters.push({
                    key,
                    label,
                    value: value
                });
            }
        });

        this.activeFilters.innerHTML = activeFilters.map(filter => `
            <div class="filter-tag">
                ${filter.label}: ${filter.value}
                <span class="remove" onclick="emotiShop.removeFilter('${filter.key}')">&times;</span>
            </div>
        `).join('');
    }

    removeFilter(filterKey) {
        this.currentFilters[filterKey] = '';
        
        // Update the corresponding dropdown
        const filterElement = {
            category: this.categoryFilter,
            gender: this.genderFilter,
            article: this.articleFilter,
            season: this.seasonFilter,
            price: this.priceFilter,
            color: this.colorFilter
        }[filterKey];
        
        if (filterElement) {
            filterElement.value = '';
        }
        
        this.updateActiveFiltersDisplay();
        this.applyCurrentFilters();
    }

    clearAllFilters() {
        this.currentFilters = {
            category: '',
            gender: '',
            article: '',
            season: '',
            price: '',
            color: ''
        };
        
        // Reset all dropdowns
        this.categoryFilter.value = '';
        this.genderFilter.value = '';
        this.articleFilter.value = '';
        this.seasonFilter.value = '';
        this.priceFilter.value = '';
        this.colorFilter.value = '';
        
        this.updateActiveFiltersDisplay();
        this.applyCurrentFilters();
    }

    applyCurrentFilters() {
        this.filterProducts();
        this.updateStatus(`🔍 Applied filters. Showing ${this.filteredProducts.length} products.`, 'info');
    }

    showLoadingProgress(current, estimated) {
        const progressHtml = `
            <div class="loading">
                <div class="spinner"></div>
                <div>
                    <div>Loading products...</div>
                    <div class="progress-container">
                        <div class="progress-bar" style="width: ${Math.min((current / estimated) * 100, 100)}%"></div>
                    </div>
                    <div class="progress-text">${current} products loaded${estimated ? ` of ~${estimated}` : ''}</div>
                </div>
            </div>
        `;
        this.productsGrid.innerHTML = progressHtml;
    }

    filterProducts() {
        let products = [...this.allProducts];

        // Apply manual filters first
        products = products.filter(product => {
            // Category filter
            if (this.currentFilters.category && 
                !product.category.toLowerCase().includes(this.currentFilters.category.toLowerCase())) {
                return false;
            }
            
            // Gender filter
            if (this.currentFilters.gender && 
                !product.gender.toLowerCase().includes(this.currentFilters.gender.toLowerCase())) {
                return false;
            }
            
            // Article type filter
            if (this.currentFilters.article && 
                !product.articleType.toLowerCase().includes(this.currentFilters.article.toLowerCase())) {
                return false;
            }
            
            // Season filter
            if (this.currentFilters.season && 
                !product.season.toLowerCase().includes(this.currentFilters.season.toLowerCase())) {
                return false;
            }
            
            // Color filter
            if (this.currentFilters.color && 
                !product.color.toLowerCase().includes(this.currentFilters.color.toLowerCase())) {
                return false;
            }
            
            // Price filter
            if (this.currentFilters.price) {
                const [min, max] = this.parsePriceRange(this.currentFilters.price);
                if (product.price < min || (max && product.price > max)) {
                    return false;
                }
            }
            
            return true;
        });

        // Apply emotion-based filtering if AI toggle is on
        if (this.aiToggle.checked && this.currentEmotion) {
            const emotion = this.currentEmotion.emotion;
            const preferences = this.emotionPreferences[emotion];
            
            if (preferences) {
                // Score products based on emotion preferences
                products = products.map(product => {
                    let score = 0;
                    
                    // Category matching (highest weight)
                    if (preferences.categories.some(cat => 
                        product.category.toLowerCase().includes(cat.toLowerCase()) ||
                        product.subCategory.toLowerCase().includes(cat.toLowerCase()) ||
                        product.articleType.toLowerCase().includes(cat.toLowerCase())
                    )) {
                        score += 3;
                    }

                    // Color matching
                    if (preferences.colors.includes('Any') || 
                        preferences.colors.some(col => 
                            product.color.toLowerCase().includes(col.toLowerCase())
                        )) {
                        score += 2;
                    }

                    // Usage matching
                    if (preferences.usage.some(use => 
                        product.usage.toLowerCase().includes(use.toLowerCase())
                    )) {
                        score += 1;
                    }

                    return { ...product, emotionScore: score };
                }).filter(product => product.emotionScore > 0); // Only show products with some match

                this.productsTitle.textContent = `${emotion.charAt(0).toUpperCase() + emotion.slice(1)} Mood Products`;
            }
        } else {
            this.productsTitle.textContent = this.getActiveFiltersTitle();
        }

        this.filteredProducts = products;
        this.sortProducts();
    }

    parsePriceRange(priceRange) {
        switch (priceRange) {
            case '0-500': return [0, 500];
            case '500-1000': return [500, 1000];
            case '1000-2000': return [1000, 2000];
            case '2000-5000': return [2000, 5000];
            case '5000+': return [5000, null];
            default: return [0, null];
        }
    }

    getActiveFiltersTitle() {
        const activeFilters = Object.values(this.currentFilters).filter(f => f).length;
        if (activeFilters > 0) {
            return `Filtered Products (${activeFilters} filter${activeFilters > 1 ? 's' : ''})`;
        }
        return 'All Products';
    }

    sortProducts() {
        const sortBy = this.sortSelect.value;
        let products = [...this.filteredProducts];

        switch (sortBy) {
            case 'price_asc':
                products.sort((a, b) => a.price - b.price);
                break;
            case 'price_desc':
                products.sort((a, b) => b.price - a.price);
                break;
            case 'name':
                products.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'emotion':
                if (this.currentEmotion && this.aiToggle.checked) {
                    // Sort by emotion score first, then by preferences
                    products.sort((a, b) => {
                        if (a.emotionScore && b.emotionScore) {
                            if (a.emotionScore !== b.emotionScore) {
                                return b.emotionScore - a.emotionScore; // Higher score first
                            }
                        }
                        
                        // Secondary sort by price based on emotion preferences
                        const preferences = this.emotionPreferences[this.currentEmotion.emotion];
                        if (preferences && preferences.sortBy) {
                            const sortOrder = preferences.sortBy;
                            if (sortOrder === 'price_asc') {
                                return a.price - b.price;
                            } else if (sortOrder === 'price_desc') {
                                return b.price - a.price;
                            }
                        }
                        
                        return a.name.localeCompare(b.name);
                    });
                } else {
                    // Default to name sorting if no emotion
                    products.sort((a, b) => a.name.localeCompare(b.name));
                }
                break;
        }

        this.showProducts(products);
    }

    showSkeletonLoader(count = 8) {
        const skeletons = Array(count).fill(0).map((_, index) => `
            <div class="skeleton-card" style="animation-delay: ${index * 0.1}s;">
                <div class="skeleton-image"></div>
                <div class="skeleton-content">
                    <div class="skeleton-line medium"></div>
                    <div class="skeleton-line short"></div>
                    <div class="skeleton-line long"></div>
                    <div class="skeleton-line medium"></div>
                </div>
            </div>
        `).join('');
        
        this.productsGrid.innerHTML = skeletons;
    }

    showProducts(products) {
        if (!products || products.length === 0) {
            this.productsGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #666; animation: cardAppear 0.5s ease-out;">
                    <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 20px; opacity: 0.5;"></i>
                    <h3>No products found</h3>
                    <p>Try adjusting your filters or emotion detection</p>
                </div>
            `;
            return;
        }

        // Use DocumentFragment for better performance
        const fragment = document.createDocumentFragment();
        const tempDiv = document.createElement('div');
        
        // Create all product cards
        tempDiv.innerHTML = products.map((product, index) => 
            this.createProductCard(product, index)
        ).join('');
        
        // Move elements to fragment
        while (tempDiv.firstChild) {
            fragment.appendChild(tempDiv.firstChild);
        }
        
        // Clear and append in one operation
        this.productsGrid.innerHTML = '';
        this.productsGrid.appendChild(fragment);

        // Set up event listeners and lazy loading
        this.setupProductEventListeners();
        this.setupLazyLoading();
        
        // Trigger staggered animations
        requestAnimationFrame(() => {
            const cards = this.productsGrid.querySelectorAll('.product-card');
            cards.forEach((card, index) => {
                setTimeout(() => {
                    card.style.animationPlayState = 'running';
                }, index * 50); // 50ms stagger
            });
        });
    }

    createProductCard(product, index = 0) {
        const price = product.price ? `₹${product.price.toLocaleString()}` : 'Price N/A';
        const emotionBadge = this.currentEmotion && this.aiToggle.checked ? 
            `<div class="emotion-badge">${this.emotionEmojis[this.currentEmotion.emotion]} Match</div>` : '';
        
        const animationDelay = Math.min(index * 0.05, 1);
        
        return `
            <div class="product-card" data-product-id="${product.id}" 
                 style="animation-delay: ${animationDelay}s; animation-play-state: paused;">
                ${emotionBadge}
                <img src="${product.image}" alt="${product.name}" class="product-image" 
                     onerror="this.src='https://via.placeholder.com/300x200?text=Image+Not+Found'"
                     loading="lazy" data-src="${product.image}">
                <div class="product-info">
                    <div class="product-name">${product.name}</div>
                    <div class="product-price">${price}</div>
                    <div class="product-meta">
                        <span class="meta-tag product-category">${product.category}</span>
                        <span class="meta-tag product-gender">${product.gender}</span>
                        <span class="meta-tag">${product.articleType || product.subCategory}</span>
                    </div>
                    <div class="product-meta">
                        <span class="meta-tag">${product.color}</span>
                        <span class="meta-tag">${product.usage}</span>
                        <span class="meta-tag">${product.season}</span>
                    </div>
                    <div class="product-actions">
                        <button class="add-to-cart" data-product-id="${product.id}">
                            <i class="fas fa-cart-plus"></i> Add to Cart
                        </button>
                        <button class="quick-view" data-product-id="${product.id}">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    setupLazyLoading() {
        const images = this.productsGrid.querySelectorAll('img[data-src]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        
                        img.addEventListener('load', () => {
                            img.classList.add('loaded');
                        });
                        
                        if (img.complete) {
                            img.classList.add('loaded');
                        }
                        
                        observer.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.1
            });

            images.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback for browsers without IntersectionObserver
            images.forEach(img => {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                img.addEventListener('load', () => img.classList.add('loaded'));
                if (img.complete) img.classList.add('loaded');
            });
        }
    }

    setupProductEventListeners() {
        // Add to cart buttons
        document.querySelectorAll('.add-to-cart').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.target.dataset.productId;
                this.addToCart(productId);
            });
        });

        // Quick view buttons
        document.querySelectorAll('.quick-view').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.target.dataset.productId;
                this.showQuickView(productId);
            });
        });
    }

    addToCart(productId) {
        const product = this.allProducts.find(p => p.id == productId);
        if (!product) return;

        const existingItem = this.cart.find(item => item.id == productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                ...product,
                quantity: 1
            });
        }

        this.updateCartDisplay();
        this.saveCart();
        
        // Show success message
        this.updateStatus(`✅ Added "${product.name}" to cart!`, 'success');
        setTimeout(() => {
            this.updateStatus('🛍️ Continue shopping or view your cart', 'info');
        }, 2000);
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id != productId);
        this.updateCartDisplay();
        this.saveCart();
    }

    updateQuantity(productId, change) {
        const item = this.cart.find(item => item.id == productId);
        if (!item) return;

        item.quantity += change;
        
        if (item.quantity <= 0) {
            this.removeFromCart(productId);
        } else {
            this.updateCartDisplay();
            this.saveCart();
        }
    }

    updateCartDisplay() {
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Animate cart count update
        this.animateCartCount(totalItems);
        this.cartTotal.textContent = `₹${totalPrice.toLocaleString()}`;

        if (this.cart.length === 0) {
            this.cartItems.innerHTML = `
                <div style="text-align: center; color: #9ca3af; padding: 40px 20px; animation: cardAppear 0.5s ease-out;">
                    <i class="fas fa-shopping-cart" style="font-size: 2rem; margin-bottom: 10px; display: block; opacity: 0.5;"></i>
                    <h3 style="margin: 10px 0; font-size: 1.1rem;">Your cart is empty</h3>
                    <p style="margin: 0; opacity: 0.7;">Add some products to get started!</p>
                </div>
            `;
        } else {
            // Use DocumentFragment for better performance
            const fragment = document.createDocumentFragment();
            const tempDiv = document.createElement('div');
            
            tempDiv.innerHTML = this.cart.map((item, index) => `
                <div class="cart-item" style="animation: cardAppear 0.4s ease-out ${index * 0.05}s both;">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image"
                         onerror="this.src='https://via.placeholder.com/60x60?text=No+Image'"
                         loading="lazy">
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">₹${item.price.toLocaleString()}</div>
                        <div class="quantity-controls">
                            <button class="qty-btn" onclick="emotiShop.updateQuantity('${item.id}', -1)">
                                <i class="fas fa-minus"></i>
                            </button>
                            <span style="margin: 0 10px; font-weight: 600; min-width: 20px; text-align: center;">${item.quantity}</span>
                            <button class="qty-btn" onclick="emotiShop.updateQuantity('${item.id}', 1)">
                                <i class="fas fa-plus"></i>
                            </button>
                            <button class="qty-btn" onclick="emotiShop.removeFromCart('${item.id}')" 
                                    style="margin-left: 10px; color: #ef4444;" title="Remove item">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
            
            while (tempDiv.firstChild) {
                fragment.appendChild(tempDiv.firstChild);
            }
            
            this.cartItems.innerHTML = '';
            this.cartItems.appendChild(fragment);
        }
    }

    animateCartCount(newCount) {
        const currentCount = parseInt(this.cartCount.textContent) || 0;
        
        if (newCount !== currentCount) {
            // Add bounce animation
            this.cartCount.style.transform = 'scale(1.3)';
            this.cartCount.style.transition = 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            
            setTimeout(() => {
                this.cartCount.textContent = newCount;
                this.cartCount.style.transform = 'scale(1)';
                
                // Add success pulse for additions
                if (newCount > currentCount) {
                    this.cartCount.style.background = '#10b981';
                    setTimeout(() => {
                        this.cartCount.style.background = '#e11900';
                    }, 500);
                }
            }, 150);
        }
    }

    showQuickView(productId) {
        const product = this.allProducts.find(p => p.id == productId);
        if (!product) return;

        const emotionMatch = this.currentEmotion && this.aiToggle.checked ? 
            `<div style="background: ${this.emotionColors[this.currentEmotion.emotion]}; color: white; padding: 10px; border-radius: 10px; margin-bottom: 20px; text-align: center;">
                <i class="fas fa-brain"></i> ${this.emotionEmojis[this.currentEmotion.emotion]} 
                Recommended for your ${this.currentEmotion.emotion} mood
            </div>` : '';

        this.modalContent.innerHTML = `
            <button class="modal-close" onclick="emotiShop.closeModal()">&times;</button>
            <div style="padding: 30px;">
                ${emotionMatch}
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; align-items: start;">
                    <div>
                        <img src="${product.image}" alt="${product.name}" 
                             style="width: 100%; border-radius: 15px;"
                             onerror="this.src='https://via.placeholder.com/400x300?text=Image+Not+Found'">
                    </div>
                    <div>
                        <h2 style="font-size: 1.5rem; margin-bottom: 15px; color: #2d3748;">${product.name}</h2>
                        <div style="font-size: 1.8rem; font-weight: 700; color: #667eea; margin-bottom: 20px;">
                            ₹${product.price.toLocaleString()}
                        </div>
                        
                        <div style="margin-bottom: 20px;">
                            <h4 style="margin-bottom: 10px; color: #4a5568;">Product Details:</h4>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                                <div><strong>Category:</strong> ${product.category}</div>
                                <div><strong>Gender:</strong> ${product.gender}</div>
                                <div><strong>Type:</strong> ${product.articleType || product.subCategory}</div>
                                <div><strong>Color:</strong> ${product.color}</div>
                                <div><strong>Season:</strong> ${product.season}</div>
                                <div><strong>Usage:</strong> ${product.usage}</div>
                            </div>
                        </div>
                        
                        <button onclick="emotiShop.addToCart('${product.id}'); emotiShop.closeModal();" 
                                style="width: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                       color: white; border: none; padding: 15px; border-radius: 15px; 
                                       font-size: 1.1rem; font-weight: 600; cursor: pointer;">
                            <i class="fas fa-cart-plus"></i> Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.quickViewModal.classList.add('show');
    }

    closeModal() {
        this.quickViewModal.classList.remove('show');
    }

    toggleCart() {
        this.cartSidebar.classList.toggle('open');
    }

    checkout() {
        if (this.cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }

        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const itemCount = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        
        // Simulate checkout process
        const confirmed = confirm(
            `Proceed to checkout?\n\n` +
            `Items: ${itemCount}\n` +
            `Total: ₹${total.toLocaleString()}\n\n` +
            `This is a demo - no actual payment will be processed.`
        );

        if (confirmed) {
            // Clear cart and show success
            this.cart = [];
            this.updateCartDisplay();
            this.saveCart();
            this.toggleCart();
            
            this.updateStatus('🎉 Order placed successfully! Thank you for shopping with EmotiShop!', 'success');
            
            setTimeout(() => {
                this.updateStatus('🛍️ Continue shopping for more AI-powered recommendations!', 'info');
            }, 4000);
        }
    }

    saveCart() {
        localStorage.setItem('emotiShopCart', JSON.stringify(this.cart));
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
        localStorage.setItem('emotiShopSettings', JSON.stringify(settings));
    }

    loadSettings() {
        const saved = localStorage.getItem('emotiShopSettings');
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

// Initialize the app
let emotiShop;
document.addEventListener('DOMContentLoaded', () => {
    emotiShop = new EmotiShop();
});

// Make instance globally available for onclick handlers
window.emotiShop = emotiShop;

// Global function for testing Airtable API directly
window.testAirtableAPI = async function() {
    const baseId = document.getElementById('baseId').value.trim();
    const apiKey = document.getElementById('apiKey').value.trim();
    const tableName = document.getElementById('tableName').value.trim() || 'productss';
    
    if (!baseId || !apiKey) {
        alert('Please enter Base ID and API Key first!');
        return;
    }
    
    console.log('🧪 DIRECT API TEST STARTING...');
    console.log('Base ID:', baseId);
    console.log('Table Name:', tableName);
    
    try {
        // Test 1: Get first batch with detailed logging
        console.log('🧪 Test 1: First batch...');
        const url1 = `https://api.airtable.com/v0/${baseId}/${tableName}?pageSize=100`;
        console.log('URL:', url1);
        
        const response1 = await axios.get(url1, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ First batch response:', {
            recordsCount: response1.data.records?.length,
            hasOffset: !!response1.data.offset,
            offset: response1.data.offset,
            fields: Object.keys(response1.data.records?.[0]?.fields || {}),
            sampleRecord: response1.data.records?.[0]
        });
        
        // Test 2: If there's an offset, try the second batch
        if (response1.data.offset) {
            console.log('🧪 Test 2: Second batch with offset...');
            const url2 = `https://api.airtable.com/v0/${baseId}/${tableName}?pageSize=100&offset=${response1.data.offset}`;
            console.log('URL with offset:', url2);
            
            const response2 = await axios.get(url2, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('✅ Second batch response:', {
                recordsCount: response2.data.records?.length,
                hasOffset: !!response2.data.offset,
                offset: response2.data.offset
            });
            
            if (response2.data.offset) {
                console.log('🎉 SUCCESS: Multiple batches available - pagination should work!');
                alert('✅ API Test Success! Multiple batches detected. Check console for details.');
            } else {
                console.log('⚠️ Only 2 batches available (200 records total)');
                alert('⚠️ API working but limited to ~200 records. Check Airtable view filters.');
            }
        } else {
            console.log('❌ ISSUE: No offset in first response - limited to 100 records');
            console.log('💡 This suggests your Airtable view/table has exactly 100 records or a filter is applied');
            alert('❌ Issue found: No pagination available. Your table/view seems limited to 100 records. Check Airtable view filters!');
        }
        
        // Test 3: Try alternative URL patterns
        console.log('🧪 Test 3: Alternative URL patterns...');
        
        // Try with explicit view (Grid view)
        try {
            const urlWithView = `https://api.airtable.com/v0/${baseId}/${tableName}/Grid%20view?pageSize=10`;
            const viewResponse = await axios.get(urlWithView, {
                headers: { 'Authorization': `Bearer ${apiKey}` }
            });
            console.log('✅ Grid view response:', viewResponse.data.records?.length, 'records');
        } catch (viewError) {
            console.log('❌ Grid view test failed:', viewError.response?.status, viewError.response?.data?.error);
        }
        
    } catch (error) {
        console.error('❌ API Test failed:', error);
        if (error.response) {
            console.log('Error details:', error.response.status, error.response.data);
            alert(`❌ API Error: ${error.response.status} - ${error.response.data?.error?.message || 'Unknown error'}`);
        } else {
            alert(`❌ Network Error: ${error.message}`);
        }
    }
};