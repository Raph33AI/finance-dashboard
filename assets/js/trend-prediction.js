/* ==============================================
   TREND-PREDICTION.JS - ML STOCK PREDICTION
   Version avec Twelve Data API + Rate Limiting + Cache Optimisé
   ============================================== */

// ========== RATE LIMITER (IDENTIQUE À MARKET DATA) ==========
class RateLimiter {
    constructor(maxRequests = 8, windowMs = 60000) {
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
        this.queue = [];
        this.requestTimes = [];
        this.processing = false;
    }
    
    async execute(fn, priority = 'normal') {
        return new Promise((resolve, reject) => {
            this.queue.push({
                fn,
                priority,
                resolve,
                reject,
                timestamp: Date.now()
            });
            
            this.queue.sort((a, b) => {
                const priorities = { high: 3, normal: 2, low: 1 };
                return (priorities[b.priority] || 2) - (priorities[a.priority] || 2);
            });
            
            this.processQueue();
        });
    }
    
    async processQueue() {
        if (this.processing || this.queue.length === 0) return;
        
        this.processing = true;
        
        while (this.queue.length > 0) {
            const now = Date.now();
            this.requestTimes = this.requestTimes.filter(time => now - time < this.windowMs);
            
            if (this.requestTimes.length >= this.maxRequests) {
                const oldestRequest = Math.min(...this.requestTimes);
                const waitTime = this.windowMs - (now - oldestRequest) + 100;
                
                console.log(`⏳ Rate limit reached. Waiting ${Math.ceil(waitTime/1000)}s...`);
                
                if (window.cacheWidget) {
                    window.cacheWidget.updateQueueStatus(this.queue.length, waitTime);
                }
                
                await this.sleep(waitTime);
                continue;
            }
            
            const item = this.queue.shift();
            this.requestTimes.push(Date.now());
            
            try {
                const result = await item.fn();
                item.resolve(result);
            } catch (error) {
                item.reject(error);
            }
            
            await this.sleep(100);
        }
        
        this.processing = false;
        
        if (window.cacheWidget) {
            window.cacheWidget.updateQueueStatus(0, 0);
        }
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    getRemainingRequests() {
        const now = Date.now();
        this.requestTimes = this.requestTimes.filter(time => now - time < this.windowMs);
        return this.maxRequests - this.requestTimes.length;
    }
    
    getQueueLength() {
        return this.queue.length;
    }
}

// ========== CACHE OPTIMISÉ (IDENTIQUE À MARKET DATA) ==========
class OptimizedCache {
    constructor() {
        this.prefix = 'tp_cache_'; // trend prediction cache
        this.staticTTL = 24 * 60 * 60 * 1000; // 24h
        this.dynamicTTL = 5 * 60 * 1000; // 5min
    }
    
    set(key, data, ttl = null) {
        try {
            const cacheData = {
                data,
                timestamp: Date.now(),
                ttl: ttl || this.dynamicTTL
            };
            localStorage.setItem(this.prefix + key, JSON.stringify(cacheData));
            return true;
        } catch (error) {
            console.warn('Cache storage error:', error);
            return false;
        }
    }
    
    get(key) {
        try {
            const cached = localStorage.getItem(this.prefix + key);
            if (!cached) return null;
            
            const cacheData = JSON.parse(cached);
            const now = Date.now();
            
            if (now - cacheData.timestamp > cacheData.ttl) {
                this.delete(key);
                return null;
            }
            
            return cacheData.data;
        } catch (error) {
            console.warn('Cache retrieval error:', error);
            return null;
        }
    }
    
    delete(key) {
        localStorage.removeItem(this.prefix + key);
    }
    
    clear() {
        Object.keys(localStorage)
            .filter(key => key.startsWith(this.prefix))
            .forEach(key => localStorage.removeItem(key));
    }
    
    getAge(key) {
        try {
            const cached = localStorage.getItem(this.prefix + key);
            if (!cached) return null;
            
            const cacheData = JSON.parse(cached);
            return Date.now() - cacheData.timestamp;
        } catch {
            return null;
        }
    }
}

// ========== MAIN TREND PREDICTION OBJECT ==========
const TrendPrediction = {
    // API Client & Cache
    apiClient: null,
    rateLimiter: null,
    optimizedCache: null,
    
    // Current State
    currentSymbol: 'AAPL',
    predictionHorizon: 7,
    trainingPeriod: '6M',
    stockData: null,
    
    // Search functionality
    selectedSuggestionIndex: -1,
    searchTimeout: null,
    
    // Model results
    models: {
        linear: null,
        polynomial: null,
        exponential: null,
        knn: null,
        neural: null,
        arima: null
    },
    
    // Colors
    colors: {
        primary: '#2649B2',
        secondary: '#4A74F3',
        tertiary: '#8E7DE3',
        purple: '#9D5CE6',
        lightBlue: '#6C8BE0',
        success: '#28a745',
        danger: '#dc3545',
        warning: '#ffc107'
    },
    
    // ============================================
    // INITIALIZATION
    // ============================================
    
    async init() {
        try {
            console.log('🤖 Initializing ML Trend Prediction with Rate Limiting...');
            
            // Initialiser le rate limiter (8 req/min)
            this.rateLimiter = new RateLimiter(8, 60000);
            this.optimizedCache = new OptimizedCache();
            
            // Attendre l'authentification
            await this.waitForAuth();
            
            // Initialiser le client API
            this.apiClient = new FinanceAPIClient({
                baseURL: APP_CONFIG.API_BASE_URL,
                cacheDuration: APP_CONFIG.CACHE_DURATION || 300000,
                maxRetries: APP_CONFIG.MAX_RETRIES || 2,
                onLoadingChange: (isLoading) => {
                    this.showLoading(isLoading);
                }
            });
            
            // Rendre accessible globalement
            window.apiClient = this.apiClient;
            window.rateLimiter = this.rateLimiter;
            
            this.updateLastUpdate();
            this.setupEventListeners();
            this.setupSearchListeners();
            this.startCacheMonitoring();
            
            // Auto-load default symbol
            setTimeout(() => {
                this.loadSymbol(this.currentSymbol);
            }, 500);
            
            console.log('✅ ML Trend Prediction initialized with rate limiting');
            
        } catch (error) {
            console.error('Initialization error:', error);
            this.showNotification('Failed to initialize application', 'error');
        }
    },
    
    async waitForAuth() {
        return new Promise((resolve) => {
            if (!firebase || !firebase.auth) {
                console.warn('⚠️ Firebase not available');
                resolve();
                return;
            }
            
            const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
                if (user) {
                    console.log('✅ User authenticated for ML Trend Prediction');
                    unsubscribe();
                    resolve();
                }
            });
            
            setTimeout(() => {
                resolve();
            }, 3000);
        });
    },
    
    startCacheMonitoring() {
        setInterval(() => {
            if (window.cacheWidget) {
                const remaining = this.rateLimiter.getRemainingRequests();
                const queueLength = this.rateLimiter.getQueueLength();
                
                window.cacheWidget.updateRateLimitStatus(remaining, 8);
                
                if (queueLength > 0) {
                    window.cacheWidget.updateQueueStatus(queueLength, 0);
                }
            }
        }, 1000);
    },
    
    async apiRequest(fn, priority = 'normal') {
        return await this.rateLimiter.execute(fn, priority);
    },
    
    setupEventListeners() {
        const input = document.getElementById('symbolInput');
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.analyzeStock();
                }
            });
        }
    },
    
    setupSearchListeners() {
        const input = document.getElementById('symbolInput');
        if (!input) return;
        
        input.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });
        
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (this.selectedSuggestionIndex >= 0) {
                    const suggestions = document.querySelectorAll('.suggestion-item');
                    if (suggestions[this.selectedSuggestionIndex]) {
                        const symbol = suggestions[this.selectedSuggestionIndex].dataset.symbol;
                        this.selectSuggestion(symbol);
                    }
                } else {
                    this.analyzeStock();
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.navigateSuggestions('down');
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.navigateSuggestions('up');
            } else if (e.key === 'Escape') {
                this.hideSuggestions();
            }
        });
        
        input.addEventListener('focus', (e) => {
            if (e.target.value.trim().length > 0) {
                this.handleSearch(e.target.value);
            }
        });
        
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-input-wrapper')) {
                this.hideSuggestions();
            }
        });
    },
    
    // ============================================
    // SEARCH WITH TWELVE DATA API
    // ============================================
    
    handleSearch(query) {
        const trimmedQuery = query.trim();
        
        if (trimmedQuery.length === 0) {
            this.hideSuggestions();
            return;
        }
        
        clearTimeout(this.searchTimeout);
        
        this.searchTimeout = setTimeout(() => {
            this.searchSymbols(trimmedQuery);
        }, 500);
    },
    
    async searchSymbols(query) {
        console.log('🔍 Searching for:', query);
        
        const container = document.getElementById('searchSuggestions');
        if (!container) return;
        
        // Vérifier le cache
        const cacheKey = `search_${query.toUpperCase()}`;
        const cached = this.optimizedCache.get(cacheKey);
        
        if (cached) {
            console.log('✅ Search results from cache');
            this.displaySearchResults(cached, query);
            return;
        }
        
        container.innerHTML = '<div class="suggestion-loading"><i class="fas fa-spinner fa-spin"></i> Searching...</div>';
        container.classList.add('active');
        
        try {
            const results = await this.apiRequest(() => this.apiClient.searchSymbol(query), 'low');
            
            if (results.data && results.data.length > 0) {
                this.optimizedCache.set(cacheKey, results.data, 60 * 60 * 1000);
                this.displaySearchResults(results.data, query);
                
                if (window.cacheWidget) {
                    window.cacheWidget.logActivity('Search', query, false);
                }
            } else {
                this.displayNoResults();
            }
            
        } catch (error) {
            console.error('Search failed:', error);
            this.displaySearchError();
        }
    },
    
    displaySearchResults(results, query) {
        const container = document.getElementById('searchSuggestions');
        if (!container) return;
        
        const grouped = {
            stocks: [],
            etfs: [],
            crypto: [],
            indices: [],
            other: []
        };
        
        results.forEach(item => {
            const type = (item.instrument_type || 'Common Stock').toLowerCase();
            
            if (type.includes('stock') || type.includes('equity')) {
                grouped.stocks.push(item);
            } else if (type.includes('etf')) {
                grouped.etfs.push(item);
            } else if (type.includes('crypto') || type.includes('digital currency')) {
                grouped.crypto.push(item);
            } else if (type.includes('index')) {
                grouped.indices.push(item);
            } else {
                grouped.other.push(item);
            }
        });
        
        let html = '';
        if (grouped.stocks.length > 0) html += this.buildCategoryHTML('Stocks', grouped.stocks, query);
        if (grouped.etfs.length > 0) html += this.buildCategoryHTML('ETFs', grouped.etfs, query);
        if (grouped.crypto.length > 0) html += this.buildCategoryHTML('Cryptocurrencies', grouped.crypto, query);
        if (grouped.indices.length > 0) html += this.buildCategoryHTML('Indices', grouped.indices, query);
        if (grouped.other.length > 0) html += this.buildCategoryHTML('Other', grouped.other, query);
        
        if (html === '') {
            this.displayNoResults();
        } else {
            container.innerHTML = html;
            container.classList.add('active');
            this.selectedSuggestionIndex = -1;
            
            container.querySelectorAll('.suggestion-item').forEach((item) => {
                item.addEventListener('click', () => {
                    this.selectSuggestion(item.dataset.symbol);
                });
            });
        }
    },
    
    buildCategoryHTML(categoryName, items, query) {
        const iconMap = {
            'Stocks': 'chart-line',
            'ETFs': 'layer-group',
            'Cryptocurrencies': 'coins',
            'Indices': 'chart-bar',
            'Other': 'folder'
        };
        
        const sectorMap = {
            'Stocks': 'tech',
            'ETFs': 'etf',
            'Cryptocurrencies': 'crypto',
            'Indices': 'finance',
            'Other': 'industrial'
        };
        
        let html = `<div class="suggestion-category">
            <i class="fas fa-${iconMap[categoryName] || 'folder'}"></i> ${categoryName}
        </div>`;
        
        items.slice(0, 10).forEach(item => {
            const highlightedSymbol = this.highlightMatch(item.symbol, query);
            const highlightedName = this.highlightMatch(item.instrument_name, query);
            
            html += `
                <div class="suggestion-item" data-symbol="${this.escapeHtml(item.symbol)}">
                    <div class="suggestion-icon ${sectorMap[categoryName] || 'tech'}">
                        ${this.escapeHtml(item.symbol.substring(0, 2))}
                    </div>
                    <div class="suggestion-info">
                        <div class="suggestion-symbol">${highlightedSymbol}</div>
                        <div class="suggestion-name">${highlightedName}</div>
                    </div>
                    ${item.exchange ? `<div class="suggestion-exchange">${this.escapeHtml(item.exchange)}</div>` : ''}
                </div>
            `;
        });
        
        return html;
    },
    
    highlightMatch(text, query) {
        if (!text || !query) return this.escapeHtml(text);
        const escapedText = this.escapeHtml(text);
        const escapedQuery = this.escapeHtml(query);
        const regex = new RegExp(`(${escapedQuery})`, 'gi');
        return escapedText.replace(regex, '<span class="suggestion-match">$1</span>');
    },
    
    displayNoResults() {
        const container = document.getElementById('searchSuggestions');
        if (!container) return;
        
        container.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <p><strong>No results found</strong></p>
                <p>Try searching by ticker symbol or company name</p>
            </div>
        `;
        container.classList.add('active');
    },
    
    displaySearchError() {
        const container = document.getElementById('searchSuggestions');
        if (!container) return;
        
        container.innerHTML = `
            <div class="no-results">
                <i class="fas fa-exclamation-triangle"></i>
                <p><strong>Search temporarily unavailable</strong></p>
                <p>Please enter a ticker symbol directly</p>
            </div>
        `;
        container.classList.add('active');
    },
    
    selectSuggestion(symbol) {
        const input = document.getElementById('symbolInput');
        if (input) {
            input.value = symbol;
        }
        this.hideSuggestions();
        this.loadSymbol(symbol);
    },
    
    hideSuggestions() {
        const container = document.getElementById('searchSuggestions');
        if (!container) return;
        
        container.classList.remove('active');
        this.selectedSuggestionIndex = -1;
    },
    
    navigateSuggestions(direction) {
        const suggestions = document.querySelectorAll('.suggestion-item');
        if (suggestions.length === 0) return;
        
        if (this.selectedSuggestionIndex >= 0) {
            suggestions[this.selectedSuggestionIndex].classList.remove('selected');
        }
        
        if (direction === 'down') {
            this.selectedSuggestionIndex = (this.selectedSuggestionIndex + 1) % suggestions.length;
        } else {
            this.selectedSuggestionIndex = this.selectedSuggestionIndex <= 0 
                ? suggestions.length - 1 
                : this.selectedSuggestionIndex - 1;
        }
        
        suggestions[this.selectedSuggestionIndex].classList.add('selected');
        suggestions[this.selectedSuggestionIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    },
    
    // ============================================
    // STOCK ANALYSIS WITH TWELVE DATA
    // ============================================
    
    analyzeStock() {
        const symbol = document.getElementById('symbolInput').value.trim().toUpperCase();
        if (symbol) {
            this.loadSymbol(symbol);
        }
    },
    
    async loadSymbol(symbol) {
        this.currentSymbol = symbol;
        document.getElementById('symbolInput').value = symbol;
        this.hideSuggestions();
        
        this.showLoading(true, 'Fetching historical data from Twelve Data...');
        this.hideResults();
        
        try {
            console.log(`📊 Loading ${symbol} with Twelve Data API...`);
            
            // Charger depuis le cache d'abord
            const cachedQuote = this.optimizedCache.get(`quote_${symbol}`);
            
            // Données critiques avec rate limiting
            const [quote, timeSeries] = await Promise.all([
                this.apiRequest(() => this.apiClient.getQuote(symbol), 'high'),
                this.apiRequest(() => this.getTimeSeriesForPeriod(symbol, this.trainingPeriod), 'high')
            ]);
            
            if (!quote || !timeSeries) {
                throw new Error('Failed to load stock data');
            }
            
            this.stockData = {
                symbol: quote.symbol,
                prices: timeSeries.data,
                quote: quote,
                currency: 'USD'
            };
            
            // Cache le quote
            this.optimizedCache.set(`quote_${symbol}`, quote, 60000);
            
            if (window.cacheWidget) {
                window.cacheWidget.logActivity('Quote', symbol, false);
            }
            
            this.displayStockHeader();
            
            await this.trainAllModels();
            this.displayResults();
            
            this.showLoading(false);
            
            console.log('✅ Stock data loaded and models trained');
            
        } catch (error) {
            console.error('Error loading stock data:', error);
            this.showNotification(error.message || 'Failed to load stock data', 'error');
            this.showLoading(false);
        }
    },
    
    async getTimeSeriesForPeriod(symbol, period) {
        const periodMap = {
            '3M': { interval: '1day', outputsize: 90 },
            '6M': { interval: '1day', outputsize: 180 },
            '1Y': { interval: '1day', outputsize: 252 },
            '2Y': { interval: '1day', outputsize: 504 }
        };
        
        const config = periodMap[period] || periodMap['6M'];
        
        // Vérifier le cache
        const cacheKey = `timeseries_${symbol}_${period}`;
        const cached = this.optimizedCache.get(cacheKey);
        
        if (cached) {
            console.log(`✅ Time series for ${symbol} loaded from cache`);
            if (window.cacheWidget) {
                window.cacheWidget.logActivity('TimeSeries', symbol, true);
            }
            return cached;
        }
        
        const data = await this.apiClient.getTimeSeries(symbol, config.interval, config.outputsize);
        
        // Cache pour 5 minutes
        this.optimizedCache.set(cacheKey, data, 5 * 60 * 1000);
        
        if (window.cacheWidget) {
            window.cacheWidget.logActivity('TimeSeries', symbol, false);
        }
        
        return data;
    },
    
    changeHorizon(days) {
        this.predictionHorizon = days;
        
        document.querySelectorAll('.horizon-btn').forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
        });
        
        const activeBtn = document.querySelector(`[data-days="${days}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
            activeBtn.setAttribute('aria-pressed', 'true');
        }
        
        if (this.currentSymbol && this.stockData) {
            this.trainAllModels();
        }
    },
    
    changeTrainingPeriod(period) {
        this.trainingPeriod = period;
        
        if (this.currentSymbol) {
            this.loadSymbol(this.currentSymbol);
        }
    },
    
    // ============================================
    // TRAIN ALL MODELS
    // ============================================
    
    async trainAllModels() {
        console.log('🤖 Training all ML models...');
        
        const prices = this.stockData.prices.map(p => p.close);
        
        ['linear', 'polynomial', 'exponential', 'knn', 'neural', 'arima'].forEach(model => {
            const badge = document.getElementById(`badge-${model}`);
            if (badge) {
                badge.className = 'model-badge training';
                badge.textContent = 'Training...';
            }
        });
        
        this.showLoading(true, 'Training Linear Regression...');
        this.models.linear = await this.trainLinearRegression(prices);
        this.updateModelCard('linear', this.models.linear);
        await this.sleep(300);
        
        this.showLoading(true, 'Training Polynomial Regression...');
        this.models.polynomial = await this.trainPolynomialRegression(prices);
        this.updateModelCard('polynomial', this.models.polynomial);
        await this.sleep(300);
        
        this.showLoading(true, 'Training Exponential Smoothing...');
        this.models.exponential = await this.trainExponentialSmoothing(prices);
        this.updateModelCard('exponential', this.models.exponential);
        await this.sleep(300);
        
        this.showLoading(true, 'Training K-Nearest Neighbors...');
        this.models.knn = await this.trainKNN(prices);
        this.updateModelCard('knn', this.models.knn);
        await this.sleep(300);
        
        this.showLoading(true, 'Training Neural Network...');
        this.models.neural = await this.trainNeuralNetwork(prices);
        this.updateModelCard('neural', this.models.neural);
        await this.sleep(300);
        
        this.showLoading(true, 'Training ARIMA...');
        this.models.arima = await this.trainARIMA(prices);
        this.updateModelCard('arima', this.models.arima);
        
        console.log('✅ All models trained');
    },
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

// ========== CONTINUATION DE TREND-PREDICTION.JS ==========

// ============================================
// LINEAR REGRESSION
// ============================================

Object.assign(TrendPrediction, {
    
    async trainLinearRegression(prices) {
        const n = prices.length;
        const x = Array.from({ length: n }, (_, i) => i);
        const y = prices;
        
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        
        const fitted = x.map(xi => slope * xi + intercept);
        
        const predictions = [];
        for (let i = 0; i < this.predictionHorizon; i++) {
            const futureX = n + i;
            predictions.push(slope * futureX + intercept);
        }
        
        const r2 = this.calculateR2(y, fitted);
        const rmse = this.calculateRMSE(y, fitted);
        
        return {
            name: 'Linear Regression',
            predictions: predictions,
            fitted: fitted,
            finalPrediction: predictions[predictions.length - 1],
            r2: r2,
            rmse: rmse,
            params: { slope, intercept }
        };
    },
    
    // ============================================
    // POLYNOMIAL REGRESSION
    // ============================================
    
    async trainPolynomialRegression(prices, degree = 3) {
        const n = prices.length;
        const x = Array.from({ length: n }, (_, i) => i);
        const y = prices;
        
        const X = x.map(xi => {
            const row = [];
            for (let d = 0; d <= degree; d++) {
                row.push(Math.pow(xi, d));
            }
            return row;
        });
        
        const coefficients = this.solveLinearSystem(X, y);
        
        const fitted = x.map(xi => {
            let sum = 0;
            for (let d = 0; d <= degree; d++) {
                sum += coefficients[d] * Math.pow(xi, d);
            }
            return sum;
        });
        
        const predictions = [];
        for (let i = 0; i < this.predictionHorizon; i++) {
            const futureX = n + i;
            let sum = 0;
            for (let d = 0; d <= degree; d++) {
                sum += coefficients[d] * Math.pow(futureX, d);
            }
            predictions.push(sum);
        }
        
        const r2 = this.calculateR2(y, fitted);
        const rmse = this.calculateRMSE(y, fitted);
        
        return {
            name: 'Polynomial Regression',
            predictions: predictions,
            fitted: fitted,
            finalPrediction: predictions[predictions.length - 1],
            r2: r2,
            rmse: rmse,
            params: { coefficients, degree }
        };
    },
    
    // ============================================
    // EXPONENTIAL SMOOTHING
    // ============================================
    
    async trainExponentialSmoothing(prices, alpha = 0.3, beta = 0.1) {
        const n = prices.length;
        
        let level = prices[0];
        let trend = prices[1] - prices[0];
        const fitted = [prices[0]];
        
        for (let i = 1; i < n; i++) {
            const prevLevel = level;
            const prevTrend = trend;
            
            level = alpha * prices[i] + (1 - alpha) * (prevLevel + prevTrend);
            trend = beta * (level - prevLevel) + (1 - beta) * prevTrend;
            
            fitted.push(prevLevel + prevTrend);
        }
        
        const predictions = [];
        for (let i = 1; i <= this.predictionHorizon; i++) {
            predictions.push(level + i * trend);
        }
        
        const r2 = this.calculateR2(prices, fitted);
        const rmse = this.calculateRMSE(prices, fitted);
        
        return {
            name: 'Exponential Smoothing',
            predictions: predictions,
            fitted: fitted,
            finalPrediction: predictions[predictions.length - 1],
            r2: r2,
            rmse: rmse,
            params: { alpha, beta, level, trend }
        };
    },
    
    // ============================================
    // K-NEAREST NEIGHBORS
    // ============================================
    
    async trainKNN(prices, k = 5, lookback = 5) {
        const n = prices.length;
        const fitted = [];
        
        const trainingData = [];
        for (let i = lookback; i < n - 1; i++) {
            const features = prices.slice(i - lookback, i);
            const target = prices[i];
            trainingData.push({ features, target });
        }
        
        for (let i = lookback; i < n; i++) {
            const query = prices.slice(i - lookback, i);
            const prediction = this.knnPredict(query, trainingData, k);
            fitted.push(prediction);
        }
        
        for (let i = 0; i < lookback; i++) {
            fitted.unshift(prices[i]);
        }
        
        const predictions = [];
        let currentWindow = prices.slice(-lookback);
        
        for (let i = 0; i < this.predictionHorizon; i++) {
            const prediction = this.knnPredict(currentWindow, trainingData, k);
            predictions.push(prediction);
            currentWindow = [...currentWindow.slice(1), prediction];
        }
        
        const r2 = this.calculateR2(prices, fitted);
        const rmse = this.calculateRMSE(prices, fitted);
        
        return {
            name: 'K-Nearest Neighbors',
            predictions: predictions,
            fitted: fitted,
            finalPrediction: predictions[predictions.length - 1],
            r2: r2,
            rmse: rmse,
            params: { k, lookback }
        };
    },
    
    knnPredict(query, trainingData, k) {
        const distances = trainingData.map(item => ({
            distance: this.euclideanDistance(query, item.features),
            target: item.target
        }));
        
        distances.sort((a, b) => a.distance - b.distance);
        const nearest = distances.slice(0, k);
        const prediction = nearest.reduce((sum, item) => sum + item.target, 0) / k;
        
        return prediction;
    },
    
    euclideanDistance(a, b) {
        let sum = 0;
        for (let i = 0; i < a.length; i++) {
            sum += Math.pow(a[i] - b[i], 2);
        }
        return Math.sqrt(sum);
    },
    
    // ============================================
    // NEURAL NETWORK
    // ============================================
    
    async trainNeuralNetwork(prices, lookback = 10) {
        const learningRate = 0.01;
        const epochs = 100;
        const hiddenSize = 10;
        
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const normalized = prices.map(p => (p - minPrice) / (maxPrice - minPrice));
        
        const trainingData = [];
        for (let i = lookback; i < normalized.length; i++) {
            const input = normalized.slice(i - lookback, i);
            const target = normalized[i];
            trainingData.push({ input, target });
        }
        
        let weightsInputHidden = this.randomMatrix(lookback, hiddenSize);
        let weightsHiddenOutput = this.randomArray(hiddenSize);
        let biasHidden = this.randomArray(hiddenSize);
        let biasOutput = Math.random() - 0.5;
        
        for (let epoch = 0; epoch < epochs; epoch++) {
            for (const { input, target } of trainingData) {
                const hidden = this.matrixVectorMultiply(weightsInputHidden, input).map((h, i) => 
                    this.relu(h + biasHidden[i])
                );
                
                const output = hidden.reduce((sum, h, i) => sum + h * weightsHiddenOutput[i], biasOutput);
                const outputError = output - target;
                
                for (let i = 0; i < hiddenSize; i++) {
                    weightsHiddenOutput[i] -= learningRate * outputError * hidden[i];
                }
                biasOutput -= learningRate * outputError;
            }
        }
        
        const fitted = [];
        for (let i = 0; i < lookback; i++) {
            fitted.push(prices[i]);
        }
        
        for (let i = lookback; i < prices.length; i++) {
            const input = normalized.slice(i - lookback, i);
            const hidden = this.matrixVectorMultiply(weightsInputHidden, input).map((h, i) => 
                this.relu(h + biasHidden[i])
            );
            const output = hidden.reduce((sum, h, i) => sum + h * weightsHiddenOutput[i], biasOutput);
            const denormalized = output * (maxPrice - minPrice) + minPrice;
            fitted.push(denormalized);
        }
        
        const predictions = [];
        let currentWindow = normalized.slice(-lookback);
        
        for (let i = 0; i < this.predictionHorizon; i++) {
            const hidden = this.matrixVectorMultiply(weightsInputHidden, currentWindow).map((h, i) => 
                this.relu(h + biasHidden[i])
            );
            const output = hidden.reduce((sum, h, i) => sum + h * weightsHiddenOutput[i], biasOutput);
            const denormalized = output * (maxPrice - minPrice) + minPrice;
            predictions.push(denormalized);
            
            currentWindow = [...currentWindow.slice(1), output];
        }
        
        const r2 = this.calculateR2(prices, fitted);
        const rmse = this.calculateRMSE(prices, fitted);
        
        return {
            name: 'Neural Network',
            predictions: predictions,
            fitted: fitted,
            finalPrediction: predictions[predictions.length - 1],
            r2: r2,
            rmse: rmse,
            params: { lookback, hiddenSize, epochs }
        };
    },
    
    relu(x) {
        return Math.max(0, x);
    },
    
    randomMatrix(rows, cols) {
        const matrix = [];
        for (let i = 0; i < rows; i++) {
            const row = [];
            for (let j = 0; j < cols; j++) {
                row.push((Math.random() - 0.5) * 0.5);
            }
            matrix.push(row);
        }
        return matrix;
    },
    
    randomArray(size) {
        return Array.from({ length: size }, () => (Math.random() - 0.5) * 0.5);
    },
    
    matrixVectorMultiply(matrix, vector) {
        return matrix.map(row => 
            row.reduce((sum, val, i) => sum + val * vector[i], 0)
        );
    },
    
    // ============================================
    // ARIMA
    // ============================================
    
    async trainARIMA(prices, p = 5, d = 1, q = 2) {
        let diffPrices = prices;
        for (let i = 0; i < d; i++) {
            const temp = [];
            for (let j = 1; j < diffPrices.length; j++) {
                temp.push(diffPrices[j] - diffPrices[j - 1]);
            }
            diffPrices = temp;
        }
        
        const n = diffPrices.length;
        const arCoeffs = [];
        
        for (let lag = 1; lag <= p; lag++) {
            let sumXY = 0;
            let sumX2 = 0;
            for (let i = lag; i < n; i++) {
                sumXY += diffPrices[i] * diffPrices[i - lag];
                sumX2 += diffPrices[i - lag] * diffPrices[i - lag];
            }
            arCoeffs.push(sumX2 !== 0 ? sumXY / sumX2 : 0);
        }
        
        const fitted = [];
        for (let i = 0; i < p; i++) {
            fitted.push(prices[i]);
        }
        
        for (let i = p; i < prices.length; i++) {
            let prediction = 0;
            for (let lag = 1; lag <= p; lag++) {
                if (i - lag >= 0) {
                    prediction += arCoeffs[lag - 1] * (fitted[i - lag] - (i - lag > 0 ? fitted[i - lag - 1] : prices[0]));
                }
            }
            fitted.push(fitted[i - 1] + prediction);
        }
        
        const predictions = [];
        let lastValue = prices[prices.length - 1];
        let recentDiffs = [];
        
        for (let i = 0; i < p; i++) {
            if (prices.length - 1 - i >= 0) {
                recentDiffs.unshift(prices[prices.length - 1 - i] - (prices.length - 2 - i >= 0 ? prices[prices.length - 2 - i] : prices[0]));
            }
        }
        
        for (let i = 0; i < this.predictionHorizon; i++) {
            let prediction = 0;
            for (let lag = 0; lag < Math.min(p, recentDiffs.length); lag++) {
                prediction += arCoeffs[lag] * recentDiffs[recentDiffs.length - 1 - lag];
            }
            
            lastValue = lastValue + prediction;
            predictions.push(lastValue);
            recentDiffs.push(prediction);
            if (recentDiffs.length > p) {
                recentDiffs.shift();
            }
        }
        
        const r2 = this.calculateR2(prices, fitted);
        const rmse = this.calculateRMSE(prices, fitted);
        
        return {
            name: 'ARIMA',
            predictions: predictions,
            fitted: fitted,
            finalPrediction: predictions[predictions.length - 1],
            r2: r2,
            rmse: rmse,
            params: { p, d, q, arCoeffs }
        };
    },
    
    // ============================================
    // HELPER FUNCTIONS FOR ML
    // ============================================
    
    solveLinearSystem(X, y) {
        const XT = this.transpose(X);
        const XTX = this.matrixMultiply(XT, X);
        const XTy = this.matrixVectorMultiply2(XT, y);
        
        const n = XTX.length;
        const augmented = XTX.map((row, i) => [...row, XTy[i]]);
        
        for (let i = 0; i < n; i++) {
            let maxRow = i;
            for (let k = i + 1; k < n; k++) {
                if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
                    maxRow = k;
                }
            }
            [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];
            
            for (let k = i + 1; k < n; k++) {
                const factor = augmented[k][i] / augmented[i][i];
                for (let j = i; j <= n; j++) {
                    augmented[k][j] -= factor * augmented[i][j];
                }
            }
        }
        
        const solution = new Array(n);
        for (let i = n - 1; i >= 0; i--) {
            solution[i] = augmented[i][n];
            for (let j = i + 1; j < n; j++) {
                solution[i] -= augmented[i][j] * solution[j];
            }
            solution[i] /= augmented[i][i];
        }
        
        return solution;
    },
    
    transpose(matrix) {
        return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
    },
    
    matrixMultiply(A, B) {
        const result = [];
        for (let i = 0; i < A.length; i++) {
            result[i] = [];
            for (let j = 0; j < B[0].length; j++) {
                let sum = 0;
                for (let k = 0; k < A[0].length; k++) {
                    sum += A[i][k] * B[k][j];
                }
                result[i][j] = sum;
            }
        }
        return result;
    },
    
    matrixVectorMultiply2(matrix, vector) {
        return matrix.map(row => 
            row.reduce((sum, val, i) => sum + val * vector[i], 0)
        );
    },
    
    calculateR2(actual, predicted) {
        const meanActual = actual.reduce((a, b) => a + b, 0) / actual.length;
        
        let ssRes = 0;
        let ssTot = 0;
        
        for (let i = 0; i < actual.length; i++) {
            ssRes += Math.pow(actual[i] - predicted[i], 2);
            ssTot += Math.pow(actual[i] - meanActual, 2);
        }
        
        return 1 - (ssRes / ssTot);
    },
    
    calculateRMSE(actual, predicted) {
        let sum = 0;
        for (let i = 0; i < actual.length; i++) {
            sum += Math.pow(actual[i] - predicted[i], 2);
        }
        return Math.sqrt(sum / actual.length);
    }
    
});

// ========== CONTINUATION ET FIN DE TREND-PREDICTION.JS ==========

// ============================================
// DISPLAY FUNCTIONS
// ============================================

Object.assign(TrendPrediction, {
    
    displayStockHeader() {
        const quote = this.stockData.quote;
        
        document.getElementById('stockSymbol').textContent = quote.symbol || this.currentSymbol;
        document.getElementById('stockName').textContent = quote.name || this.currentSymbol;
        
        const price = quote.price || 0;
        const change = quote.change || 0;
        const changePercent = quote.percentChange || 0;
        
        document.getElementById('currentPrice').textContent = this.formatCurrency(price);
        
        const changeEl = document.getElementById('priceChange');
        const changeText = `${change >= 0 ? '+' : ''}${this.formatCurrency(change)} (${change >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)`;
        changeEl.textContent = changeText;
        changeEl.className = change >= 0 ? 'change positive' : 'change negative';
        
        document.getElementById('stockHeader').classList.remove('hidden');
    },
    
    updateModelCard(modelName, modelResult) {
        const badge = document.getElementById(`badge-${modelName}`);
        if (badge) {
            badge.className = 'model-badge completed';
            badge.textContent = 'Completed ✓';
        }
        
        const metricsContainer = document.getElementById(`metrics-${modelName}`);
        if (metricsContainer) {
            const metrics = metricsContainer.querySelectorAll('.metric strong');
            if (metrics.length >= 3) {
                metrics[0].textContent = this.formatCurrency(modelResult.finalPrediction);
                metrics[1].textContent = (modelResult.r2 * 100).toFixed(1) + '%';
                metrics[2].textContent = modelResult.rmse.toFixed(2);
            }
        }
        
        this.createModelChart(modelName, modelResult);
    },
    
    createModelChart(modelName, modelResult) {
        const prices = this.stockData.prices;
        const historical = prices.map((p, i) => [p.timestamp, p.close]);
        
        const lastTimestamp = prices[prices.length - 1].timestamp;
        const dayMs = 24 * 60 * 60 * 1000;
        
        const predictions = modelResult.predictions.map((pred, i) => [
            lastTimestamp + (i + 1) * dayMs,
            pred
        ]);
        
        Highcharts.chart(`chart-${modelName}`, {
            chart: {
                height: 250,
                backgroundColor: 'transparent'
            },
            title: { text: null },
            xAxis: {
                type: 'datetime',
                labels: { enabled: false },
                lineWidth: 0,
                tickWidth: 0
            },
            yAxis: {
                title: { text: null },
                gridLineWidth: 1,
                gridLineColor: '#f0f0f0'
            },
            legend: { enabled: false },
            tooltip: {
                shared: true,
                crosshairs: true,
                borderRadius: 10,
                valueDecimals: 2,
                valuePrefix: '$'
            },
            plotOptions: {
                series: {
                    marker: { enabled: false }
                }
            },
            series: [{
                name: 'Historical',
                data: historical,
                color: '#6c757d',
                lineWidth: 2,
                zIndex: 1
            }, {
                name: 'Prediction',
                data: predictions,
                color: this.colors.primary,
                lineWidth: 3,
                dashStyle: 'Dash',
                zIndex: 2
            }],
            credits: { enabled: false }
        });
    },
    
    displayResults() {
        this.createComparisonChart();
        this.createPerformanceCharts();
        this.createPerformanceTable();
        this.displayEnsemblePrediction();
        this.displayRecommendation();
        
        document.getElementById('resultsPanel').classList.remove('hidden');
    },
    
    // ============================================
    // COMPARISON CHART
    // ============================================
    
    createComparisonChart() {
        const prices = this.stockData.prices;
        const historical = prices.map(p => [p.timestamp, p.close]);
        
        const lastTimestamp = prices[prices.length - 1].timestamp;
        const dayMs = 24 * 60 * 60 * 1000;
        
        const series = [{
            name: 'Historical Price',
            data: historical,
            color: '#6c757d',
            lineWidth: 3,
            zIndex: 10
        }];
        
        const modelColors = {
            linear: this.colors.primary,
            polynomial: this.colors.secondary,
            exponential: this.colors.tertiary,
            knn: this.colors.purple,
            neural: '#9D5CE6',
            arima: this.colors.lightBlue
        };
        
        Object.entries(this.models).forEach(([name, model]) => {
            if (model && model.predictions) {
                const predictions = model.predictions.map((pred, i) => [
                    lastTimestamp + (i + 1) * dayMs,
                    pred
                ]);
                
                series.push({
                    name: model.name,
                    data: predictions,
                    color: modelColors[name],
                    lineWidth: 2,
                    dashStyle: 'Dash'
                });
            }
        });
        
        Highcharts.stockChart('comparisonChart', {
            chart: {
                height: 600,
                borderRadius: 15
            },
            title: {
                text: `${this.currentSymbol} - ML Model Predictions Comparison`,
                style: { 
                    color: this.colors.primary, 
                    fontWeight: 'bold',
                    fontSize: '1.25rem'
                }
            },
            subtitle: {
                text: `Prediction Horizon: ${this.predictionHorizon} days | Training Period: ${this.trainingPeriod}`,
                style: { 
                    color: '#64748b',
                    fontSize: '0.875rem'
                }
            },
            rangeSelector: { enabled: false },
            navigator: { enabled: false },
            scrollbar: { enabled: false },
            xAxis: {
                type: 'datetime',
                plotLines: [{
                    value: lastTimestamp,
                    color: '#dc3545',
                    dashStyle: 'Dash',
                    width: 2,
                    label: {
                        text: 'Prediction Start',
                        style: { 
                            color: '#dc3545', 
                            fontWeight: 'bold' 
                        }
                    },
                    zIndex: 5
                }]
            },
            yAxis: {
                title: { 
                    text: 'Price (USD)',
                    style: { color: '#475569' }
                },
                labels: {
                    formatter: function() {
                        return '$' + this.value.toFixed(2);
                    }
                }
            },
            tooltip: {
                shared: true,
                crosshairs: true,
                borderRadius: 10,
                valueDecimals: 2,
                valuePrefix: '$'
            },
            legend: {
                enabled: true,
                align: 'center',
                verticalAlign: 'bottom',
                itemStyle: {
                    color: '#475569',
                    fontWeight: '500'
                }
            },
            series: series,
            credits: { enabled: false }
        });
    },
    
    // ============================================
    // PERFORMANCE CHARTS
    // ============================================
    
    createPerformanceCharts() {
        const models = Object.entries(this.models).filter(([_, m]) => m !== null);
        
        // Accuracy Chart
        const accuracyData = models.map(([name, model]) => ({
            name: model.name,
            y: model.r2 * 100,
            color: this.getModelColor(name)
        }));
        
        Highcharts.chart('accuracyChart', {
            chart: {
                type: 'column',
                borderRadius: 15,
                height: 400
            },
            title: {
                text: 'Model Accuracy (R² Score)',
                style: { 
                    color: this.colors.primary, 
                    fontWeight: 'bold',
                    fontSize: '1.125rem'
                }
            },
            xAxis: {
                type: 'category',
                labels: {
                    style: { 
                        color: '#475569',
                        fontWeight: '500'
                    }
                }
            },
            yAxis: {
                title: { 
                    text: 'R² Score (%)',
                    style: { color: '#475569' }
                },
                max: 100,
                gridLineColor: '#f1f5f9'
            },
            legend: { enabled: false },
            tooltip: {
                pointFormat: '<b>{point.y:.1f}%</b>',
                borderRadius: 10
            },
            plotOptions: {
                column: {
                    borderRadius: '25%',
                    dataLabels: {
                        enabled: true,
                        format: '{point.y:.1f}%',
                        style: {
                            fontWeight: 'bold',
                            color: '#475569'
                        }
                    }
                }
            },
            series: [{
                name: 'Accuracy',
                data: accuracyData,
                colorByPoint: true
            }],
            credits: { enabled: false }
        });
        
        // Error Chart
        const errorData = models.map(([name, model]) => ({
            name: model.name,
            y: model.rmse,
            color: this.getModelColor(name)
        }));
        
        Highcharts.chart('errorChart', {
            chart: {
                type: 'bar',
                borderRadius: 15,
                height: 400
            },
            title: {
                text: 'Model Error (RMSE)',
                style: { 
                    color: this.colors.primary, 
                    fontWeight: 'bold',
                    fontSize: '1.125rem'
                }
            },
            xAxis: {
                type: 'category',
                labels: {
                    style: { 
                        color: '#475569',
                        fontWeight: '500'
                    }
                }
            },
            yAxis: {
                title: { 
                    text: 'RMSE (Lower is Better)',
                    style: { color: '#475569' }
                },
                gridLineColor: '#f1f5f9'
            },
            legend: { enabled: false },
            tooltip: {
                pointFormat: '<b>{point.y:.2f}</b>',
                borderRadius: 10
            },
            plotOptions: {
                bar: {
                    borderRadius: '25%',
                    dataLabels: {
                        enabled: true,
                        format: '{point.y:.2f}',
                        style: {
                            fontWeight: 'bold',
                            color: '#475569'
                        }
                    }
                }
            },
            series: [{
                name: 'RMSE',
                data: errorData,
                colorByPoint: true
            }],
            credits: { enabled: false }
        });
    },
    
    // ============================================
    // PERFORMANCE TABLE
    // ============================================
    
    createPerformanceTable() {
        const models = Object.entries(this.models).filter(([_, m]) => m !== null);
        models.sort((a, b) => b[1].r2 - a[1].r2);
        
        const currentPrice = this.stockData.quote.price;
        
        const tableHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Model</th>
                        <th>Prediction (${this.predictionHorizon}d)</th>
                        <th>R² Score</th>
                        <th>RMSE</th>
                        <th>Change vs Current</th>
                    </tr>
                </thead>
                <tbody>
                    ${models.map(([name, model], index) => {
                        const change = ((model.finalPrediction - currentPrice) / currentPrice) * 100;
                        const rowClass = index === 0 ? 'best' : index === models.length - 1 ? 'worst' : '';
                        
                        return `
                            <tr class='${rowClass}'>
                                <td class='rank'>#${index + 1}</td>
                                <td><strong>${this.escapeHtml(model.name)}</strong></td>
                                <td>${this.formatCurrency(model.finalPrediction)}</td>
                                <td>${(model.r2 * 100).toFixed(2)}%</td>
                                <td>${model.rmse.toFixed(2)}</td>
                                <td style='color: ${change >= 0 ? this.colors.success : this.colors.danger}; font-weight: 600;'>
                                    ${change >= 0 ? '+' : ''}${change.toFixed(2)}%
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
        
        document.getElementById('performanceTable').innerHTML = tableHTML;
    },
    
    // ============================================
    // ENSEMBLE PREDICTION
    // ============================================
    
    displayEnsemblePrediction() {
        const models = Object.values(this.models).filter(m => m !== null);
        
        // Weighted average based on R² scores
        let sumWeightedPrediction = 0;
        let sumWeights = 0;
        
        models.forEach(model => {
            const weight = Math.max(0, model.r2);
            sumWeightedPrediction += model.finalPrediction * weight;
            sumWeights += weight;
        });
        
        const ensemblePrediction = sumWeightedPrediction / sumWeights;
        
        // Calculate confidence range
        const predictions = models.map(m => m.finalPrediction);
        const mean = predictions.reduce((a, b) => a + b) / predictions.length;
        const variance = predictions.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / predictions.length;
        const stdDev = Math.sqrt(variance);
        
        const lower = ensemblePrediction - 1.96 * stdDev;
        const upper = ensemblePrediction + 1.96 * stdDev;
        
        const avgAccuracy = models.reduce((sum, m) => sum + m.r2, 0) / models.length;
        
        const currentPrice = this.stockData.quote.price;
        const change = ensemblePrediction - currentPrice;
        const changePercent = (change / currentPrice) * 100;
        
        // Update UI
        document.getElementById('ensemblePrice').textContent = this.formatCurrency(ensemblePrediction);
        
        const changeEl = document.getElementById('ensembleChange');
        changeEl.textContent = `${change >= 0 ? '+' : ''}${this.formatCurrency(change)} (${change >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)`;
        changeEl.style.color = change >= 0 ? this.colors.success : this.colors.danger;
        
        document.getElementById('ensembleRange').textContent = `${this.formatCurrency(lower)} - ${this.formatCurrency(upper)}`;
        
        // Trading Signal
        let signal = 'HOLD';
        let signalClass = 'neutral';
        let strength = 'Moderate';
        
        if (changePercent > 5) {
            signal = 'STRONG BUY';
            signalClass = 'bullish';
            strength = 'High Confidence';
        } else if (changePercent > 2) {
            signal = 'BUY';
            signalClass = 'bullish';
            strength = 'Good Confidence';
        } else if (changePercent < -5) {
            signal = 'STRONG SELL';
            signalClass = 'bearish';
            strength = 'High Confidence';
        } else if (changePercent < -2) {
            signal = 'SELL';
            signalClass = 'bearish';
            strength = 'Good Confidence';
        }
        
        document.getElementById('ensembleSignal').textContent = signal;
        document.getElementById('ensembleStrength').textContent = strength;
        
        const signalIcon = document.getElementById('signalIcon');
        signalIcon.className = `card-icon ${signalClass}`;
        
        document.getElementById('ensembleAccuracy').textContent = (avgAccuracy * 100).toFixed(1) + '%';
    },
    
    // ============================================
    // RECOMMENDATION
    // ============================================
    
    displayRecommendation() {
        const models = Object.values(this.models).filter(m => m !== null);
        
        let sumWeightedPrediction = 0;
        let sumWeights = 0;
        
        models.forEach(model => {
            const weight = Math.max(0, model.r2);
            sumWeightedPrediction += model.finalPrediction * weight;
            sumWeights += weight;
        });
        
        const ensemblePrediction = sumWeightedPrediction / sumWeights;
        const currentPrice = this.stockData.quote.price;
        const change = ensemblePrediction - currentPrice;
        const changePercent = (change / currentPrice) * 100;
        
        let recommendation = 'HOLD';
        let iconClass = 'hold';
        let title = 'Hold Position';
        let subtitle = 'Market conditions suggest waiting';
        
        if (changePercent > 5) {
            recommendation = 'STRONG BUY';
            iconClass = 'strong-buy';
            title = 'Strong Buy Signal';
            subtitle = 'Multiple models predict significant upside';
        } else if (changePercent > 2) {
            recommendation = 'BUY';
            iconClass = 'buy';
            title = 'Buy Signal';
            subtitle = 'Models indicate positive momentum';
        } else if (changePercent < -5) {
            recommendation = 'STRONG SELL';
            iconClass = 'strong-sell';
            title = 'Strong Sell Signal';
            subtitle = 'Multiple models predict significant downside';
        } else if (changePercent < -2) {
            recommendation = 'SELL';
            iconClass = 'sell';
            title = 'Sell Signal';
            subtitle = 'Models indicate negative momentum';
        }
        
        const icon = document.getElementById('recommendationIcon');
        icon.className = `recommendation-icon ${iconClass}`;
        
        document.getElementById('recommendationTitle').textContent = title;
        document.getElementById('recommendationSubtitle').textContent = subtitle;
        
        const bodyHTML = `
            <h4>Key Insights</h4>
            <ul>
                <li>
                    <i class='fas fa-chart-line'></i>
                    <strong>Ensemble Prediction:</strong> ${this.formatCurrency(ensemblePrediction)} 
                    (${change >= 0 ? '+' : ''}${changePercent.toFixed(2)}% in ${this.predictionHorizon} days)
                </li>
                <li>
                    <i class='fas fa-brain'></i>
                    <strong>Model Consensus:</strong> ${models.filter(m => m.finalPrediction > currentPrice).length}/${models.length} models predict price increase
                </li>
                <li>
                    <i class='fas fa-bullseye'></i>
                    <strong>Average Model Accuracy:</strong> ${(models.reduce((sum, m) => sum + m.r2, 0) / models.length * 100).toFixed(1)}%
                </li>
                <li>
                    <i class='fas fa-trophy'></i>
                    <strong>Best Performing Model:</strong> ${[...models].sort((a, b) => b.r2 - a.r2)[0].name}
                </li>
                <li>
                    <i class='fas fa-${changePercent > 0 ? 'arrow-up' : 'arrow-down'}'></i>
                    <strong>Expected Movement:</strong> ${Math.abs(change).toFixed(2)} USD (${Math.abs(changePercent).toFixed(2)}%)
                </li>
            </ul>
            
            <h4>Risk Assessment</h4>
            <ul>
                <li>
                    <i class='fas fa-chart-area'></i>
                    <strong>Prediction Spread:</strong> ${this.calculatePredictionSpread(models).toFixed(2)}% 
                    (${this.calculatePredictionSpread(models) < 5 ? 'Low variance - High consensus' : 'High variance - Mixed signals'})
                </li>
                <li>
                    <i class='fas fa-exclamation-triangle'></i>
                    <strong>Recommendation:</strong> ${this.getRiskRecommendation(changePercent, this.calculatePredictionSpread(models))}
                </li>
            </ul>
        `;
        
        document.getElementById('recommendationBody').innerHTML = bodyHTML;
    },
    
    calculatePredictionSpread(models) {
        const predictions = models.map(m => m.finalPrediction);
        const mean = predictions.reduce((a, b) => a + b) / predictions.length;
        const variance = predictions.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / predictions.length;
        const stdDev = Math.sqrt(variance);
        return (stdDev / mean) * 100;
    },
    
    getRiskRecommendation(changePercent, spread) {
        if (spread < 3) {
            if (Math.abs(changePercent) > 5) {
                return 'Strong consensus among models. Consider acting on this signal.';
            } else {
                return 'Low volatility expected. Safe to maintain current position.';
            }
        } else if (spread < 7) {
            return 'Moderate disagreement between models. Consider waiting for clearer signals.';
        } else {
            return 'High variance in predictions. Exercise caution and consider additional research.';
        }
    },
    
    getModelColor(modelName) {
        const colors = {
            linear: this.colors.primary,
            polynomial: this.colors.secondary,
            exponential: this.colors.tertiary,
            knn: this.colors.purple,
            neural: '#9D5CE6',
            arima: this.colors.lightBlue
        };
        return colors[modelName] || this.colors.primary;
    },
    
    // ============================================
    // UTILITY FUNCTIONS
    // ============================================
    
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    formatCurrency(value) {
        if (!value && value !== 0) return 'N/A';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: this.stockData?.currency || 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    },
    
    showLoading(show, text = 'Loading...') {
        const loader = document.getElementById('loadingIndicator');
        const loadingText = document.getElementById('loadingText');
        
        if (loader && loadingText) {
            if (show) {
                loader.classList.remove('hidden');
                loadingText.textContent = text;
            } else {
                loader.classList.add('hidden');
            }
        }
    },
    
    hideResults() {
        document.getElementById('stockHeader').classList.add('hidden');
        document.getElementById('resultsPanel').classList.add('hidden');
    },
    
    updateLastUpdate() {
        const now = new Date();
        const formatted = now.toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const updateElement = document.getElementById('lastUpdate');
        if (updateElement) {
            updateElement.textContent = `Last update: ${formatted}`;
        }
    },
    
    showNotification(message, type = 'info') {
        if (window.FinanceDashboard && window.FinanceDashboard.showNotification) {
            window.FinanceDashboard.showNotification(message, type);
        } else {
            console.log(`[${type.toUpperCase()}]`, message);
        }
    }
    
});

// ========== INITIALIZE WHEN DOM IS LOADED ==========

document.addEventListener('DOMContentLoaded', () => {
    console.log('🤖 ML Trend Prediction - Starting initialization...');
    TrendPrediction.init();
});

// ========== EXPOSITION GLOBALE ==========
window.TrendPrediction = TrendPrediction;

console.log('✅ ML Trend Prediction script loaded - COMPLETE VERSION with Twelve Data API + Rate Limiting + Cache');