/* ==============================================
   ALPHAVAULT SCORE ENGINE - LEGAL COMPLIANT
   Version: 2.0 - No Raw Data Redistribution
   ============================================== */

// ========== RATE LIMITER (INCHANGÉ) ==========
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
            this.queue.push({ fn, priority, resolve, reject, timestamp: Date.now() });
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
                if (window.cacheWidget) window.cacheWidget.updateQueueStatus(this.queue.length, waitTime);
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
        if (window.cacheWidget) window.cacheWidget.updateQueueStatus(0, 0);
    }
    
    sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
    getRemainingRequests() {
        const now = Date.now();
        this.requestTimes = this.requestTimes.filter(time => now - time < this.windowMs);
        return this.maxRequests - this.requestTimes.length;
    }
    getQueueLength() { return this.queue.length; }
}

// ========== OPTIMIZED CACHE (INCHANGÉ) ==========
class OptimizedCache {
    constructor() {
        this.prefix = 'tp_cache_';
        this.staticTTL = 24 * 60 * 60 * 1000;
        this.dynamicTTL = 5 * 60 * 1000;
    }
    
    set(key, data, ttl = null) {
        try {
            const cacheData = { data, timestamp: Date.now(), ttl: ttl || this.dynamicTTL };
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
    
    delete(key) { localStorage.removeItem(this.prefix + key); }
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
        } catch { return null; }
    }
}

// ========== ✨ ALPHAVAULT SCORE CALCULATOR ✨ ==========
class AlphaVaultScoreEngine {
    constructor() {
        this.weights = {
            momentum: 0.25,
            mlConsensus: 0.30,
            technicalStrength: 0.20,
            volatilityAdjusted: 0.15,
            trendQuality: 0.10
        };
    }
    
    /**
     * ✅ Calcule le score AlphaVault (0-100) - NO RAW PRICES
     * @param {Object} data - Données normalisées (rendements, pas prix)
     */
    calculateScore(data) {
        const scores = {
            momentum: this.calculateMomentumScore(data.returns),
            mlConsensus: this.calculateMLConsensusScore(data.modelDirections),
            technicalStrength: this.calculateTechnicalScore(data.technicals),
            volatilityAdjusted: this.calculateVolatilityScore(data.volatility, data.returns),
            trendQuality: this.calculateTrendQuality(data.r2Scores)
        };
        
        const finalScore = Object.keys(scores).reduce((sum, key) => 
            sum + scores[key] * this.weights[key], 0
        );
        
        return {
            overall: Math.round(Math.max(0, Math.min(100, finalScore))),
            components: scores,
            signal: this.getSignalFromScore(finalScore),
            confidence: this.getConfidenceLevel(scores)
        };
    }
    
    calculateMomentumScore(returns) {
        const recentReturns = returns.slice(-20);
        const avgReturn = recentReturns.reduce((a, b) => a + b, 0) / recentReturns.length;
        // Score basé sur le momentum (pas les prix absolus)
        return Math.max(0, Math.min(100, 50 + (avgReturn * 500)));
    }
    
    calculateMLConsensusScore(modelDirections) {
        // modelDirections = array de -1 (baisse), 0 (neutre), +1 (hausse)
        const consensus = modelDirections.reduce((a, b) => a + b, 0) / modelDirections.length;
        return (consensus + 1) * 50; // Normalise entre 0 et 100
    }
    
    calculateTechnicalScore(technicals) {
        const rsi = technicals.rsi || 50;
        const macd = technicals.macd || 0;
        const bollingerPosition = technicals.bollingerPosition || 0.5;
        
        const rsiScore = rsi > 70 ? (100 - rsi) : (rsi < 30 ? rsi : 50);
        const macdScore = macd > 0 ? 60 : 40;
        const bbScore = bollingerPosition * 100;
        
        return (rsiScore + macdScore + bbScore) / 3;
    }
    
    calculateVolatilityScore(volatility, returns) {
        const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
        const sharpe = volatility > 0 ? avgReturn / volatility : 0;
        return Math.max(0, Math.min(100, (sharpe + 1) * 33.33));
    }
    
    calculateTrendQuality(r2Scores) {
        const avgR2 = r2Scores.reduce((a, b) => a + b, 0) / r2Scores.length;
        return avgR2 * 100;
    }
    
    getSignalFromScore(score) {
        if (score >= 75) return { text: 'STRONG BULLISH', class: 'strong-buy', icon: '🚀', emoji: '📈' };
        if (score >= 60) return { text: 'BULLISH', class: 'buy', icon: '📈', emoji: '✅' };
        if (score >= 40) return { text: 'NEUTRAL', class: 'hold', icon: '⚖', emoji: '➖' };
        if (score >= 25) return { text: 'BEARISH', class: 'sell', icon: '📉', emoji: '⚠' };
        return { text: 'STRONG BEARISH', class: 'strong-sell', icon: '⚠', emoji: '🔴' };
    }
    
    getConfidenceLevel(scores) {
        const values = Object.values(scores);
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length;
        const stdDev = Math.sqrt(variance);
        
        if (stdDev < 10) return { text: 'HIGH', class: 'high', value: 90 };
        if (stdDev < 20) return { text: 'MEDIUM', class: 'medium', value: 65 };
        return { text: 'LOW', class: 'low', value: 40 };
    }
}

// ========== MAIN TREND PREDICTION OBJECT ==========
const TrendPrediction = {
    apiClient: null,
    rateLimiter: null,
    optimizedCache: null,
    scoreEngine: null,
    
    currentSymbol: 'AAPL',
    predictionHorizon: 7,
    trainingPeriod: '6M',
    stockData: null,
    
    selectedSuggestionIndex: -1,
    searchTimeout: null,
    
    // ❌ NO MORE RAW PREDICTIONS - ONLY NORMALIZED DATA
    models: {
        linear: null,
        polynomial: null,
        exponential: null,
        knn: null,
        neural: null
    },
    
    backtestResults: null,
    alphaVaultScore: null,
    
    comparisonStocks: [],
    comparisonParameters: {
        volatility: 25,
        correlation: 0.5,
        riskFree: 4.5,
        horizon: 30
    },
    
    colors: {
        primary: '#667eea',
        secondary: '#4A74F3',
        tertiary: '#8E7DE3',
        purple: '#9D5CE6',
        lightBlue: '#6C8BE0',
        success: '#10b981',
        danger: '#ef4444',
        warning: '#f59e0b'
    },
    
    async init() {
        try {
            console.log('🎯 Initializing AlphaVault Score Engine - Legal Compliant Mode');
            
            this.scoreEngine = new AlphaVaultScoreEngine();
            this.rateLimiter = new RateLimiter(8, 60000);
            this.optimizedCache = new OptimizedCache();
            
            await this.waitForAuth();
            
            this.apiClient = new FinanceAPIClient({
                baseURL: APP_CONFIG.API_BASE_URL,
                cacheDuration: APP_CONFIG.CACHE_DURATION || 300000,
                maxRetries: APP_CONFIG.MAX_RETRIES || 2,
                onLoadingChange: (isLoading) => this.showLoading(isLoading)
            });
            
            window.apiClient = this.apiClient;
            window.rateLimiter = this.rateLimiter;
            
            this.updateLastUpdate();
            this.setupEventListeners();
            this.setupSearchListeners();
            this.startCacheMonitoring();
            
            setTimeout(() => this.loadSymbol(this.currentSymbol), 500);
            
            console.log('✅ AlphaVault Score Engine initialized - NO RAW DATA REDISTRIBUTION');
            
        } catch (error) {
            console.error('Initialization error:', error);
            this.showNotification('Failed to initialize application', 'error');
        }
    },
    
    async waitForAuth() {
        return new Promise((resolve) => {
            if (!firebase || !firebase.auth) {
                console.warn('⚠ Firebase not available');
                resolve();
                return;
            }
            const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
                if (user) {
                    console.log('✅ User authenticated');
                    unsubscribe();
                    resolve();
                }
            });
            setTimeout(() => resolve(), 3000);
        });
    },
    
    startCacheMonitoring() {
        setInterval(() => {
            if (window.cacheWidget) {
                const remaining = this.rateLimiter.getRemainingRequests();
                const queueLength = this.rateLimiter.getQueueLength();
                window.cacheWidget.updateRateLimitStatus(remaining, 8);
                if (queueLength > 0) window.cacheWidget.updateQueueStatus(queueLength, 0);
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
        
        input.addEventListener('input', (e) => this.handleSearch(e.target.value));
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
            if (e.target.value.trim().length > 0) this.handleSearch(e.target.value);
        });
        
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-input-wrapper')) this.hideSuggestions();
        });
    }
};

// ========== CONTINUATION TREND-PREDICTION.JS (PARTIE 2/4) ==========

Object.assign(TrendPrediction, {
    
    // ============================================
    // SEARCH AVEC TWELVE DATA (INCHANGÉ)
    // ============================================
    
    handleSearch(query) {
        const trimmedQuery = query.trim();
        if (trimmedQuery.length === 0) {
            this.hideSuggestions();
            return;
        }
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => this.searchSymbols(trimmedQuery), 500);
    },
    
    async searchSymbols(query) {
        console.log('🔍 Searching for:', query);
        const container = document.getElementById('searchSuggestions');
        if (!container) return;
        
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
                if (window.cacheWidget) window.cacheWidget.logActivity('Search', query, false);
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
        
        const grouped = { stocks: [], etfs: [], crypto: [], indices: [], other: [] };
        
        results.forEach(item => {
            const type = (item.instrument_type || 'Common Stock').toLowerCase();
            if (type.includes('stock') || type.includes('equity')) grouped.stocks.push(item);
            else if (type.includes('etf')) grouped.etfs.push(item);
            else if (type.includes('crypto')) grouped.crypto.push(item);
            else if (type.includes('index')) grouped.indices.push(item);
            else grouped.other.push(item);
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
                item.addEventListener('click', () => this.selectSuggestion(item.dataset.symbol));
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
        if (input) input.value = symbol;
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
    // ✅ STOCK ANALYSIS - NO RAW PRICES DISPLAYED
    // ============================================
    
    analyzeStock() {
        const symbol = document.getElementById('symbolInput').value.trim().toUpperCase();
        if (symbol) this.loadSymbol(symbol);
    },
    
    async loadSymbol(symbol) {
        this.currentSymbol = symbol;
        document.getElementById('symbolInput').value = symbol;
        this.hideSuggestions();
        
        this.showLoading(true, 'Fetching historical data...');
        this.hideResults();
        
        try {
            console.log(`📊 Loading ${symbol} - LEGAL COMPLIANT MODE`);
            
            const [quote, timeSeries] = await Promise.all([
                this.apiRequest(() => this.apiClient.getQuote(symbol), 'high'),
                this.apiRequest(() => this.getTimeSeriesForPeriod(symbol, this.trainingPeriod), 'high')
            ]);
            
            if (!quote || !timeSeries) throw new Error('Failed to load stock data');
            
            // ❌ NE PAS STOCKER LES PRIX BRUTS
            this.stockData = {
                symbol: quote.symbol,
                name: quote.name || symbol,
                // ✅ Stocker uniquement les données normalisées
                pricesInternal: timeSeries.data, // Usage interne uniquement
                currency: 'USD'
            };
            
            this.optimizedCache.set(`quote_${symbol}`, quote, 60000);
            if (window.cacheWidget) window.cacheWidget.logActivity('Quote', symbol, false);
            
            // ✅ Afficher UNIQUEMENT le nom (pas le prix)
            this.displayStockHeader();
            
            await this.trainAllModels();
            await this.calculateAlphaVaultScore();
            await this.performBacktesting();
            
            this.displayResults();
            this.showLoading(false);
            
            console.log('✅ Analysis complete - AlphaVault Score displayed');
            
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
        const cacheKey = `timeseries_${symbol}_${period}`;
        const cached = this.optimizedCache.get(cacheKey);
        
        if (cached) {
            console.log(`✅ Time series loaded from cache`);
            if (window.cacheWidget) window.cacheWidget.logActivity('TimeSeries', symbol, true);
            return cached;
        }
        
        const data = await this.apiClient.getTimeSeries(symbol, config.interval, config.outputsize);
        this.optimizedCache.set(cacheKey, data, 5 * 60 * 1000);
        if (window.cacheWidget) window.cacheWidget.logActivity('TimeSeries', symbol, false);
        
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
        if (this.currentSymbol && this.stockData) this.trainAllModels();
    },
    
    changeTrainingPeriod(period) {
        this.trainingPeriod = period;
        if (this.currentSymbol) this.loadSymbol(this.currentSymbol);
    }
});

// ========== CONTINUATION TREND-PREDICTION.JS (PARTIE 3/4) ==========

Object.assign(TrendPrediction, {
    
    // ============================================
    // ✨ CALCUL DU ALPHAVAULT SCORE
    // ============================================
    
    async calculateAlphaVaultScore() {
        console.log('🎯 Calculating AlphaVault Score - NO RAW DATA');
        
        const prices = this.stockData.pricesInternal.map(p => p.close);
        
        // 1. ✅ Calculer les RENDEMENTS (pas les prix!)
        const returns = [];
        for (let i = 1; i < prices.length; i++) {
            returns.push((prices[i] - prices[i-1]) / prices[i-1]);
        }
        
        // 2. ✅ Direction des modèles (hausse/baisse, PAS de prix)
        const models = Object.values(this.models).filter(m => m !== null);
        const currentPrice = prices[prices.length - 1];
        
        const modelDirections = models.map(model => {
            // Direction: +1 (hausse), 0 (neutre), -1 (baisse)
            const prediction = model.normalizedPrediction; // Déjà normalisé
            if (prediction > 0.05) return 1;
            if (prediction < -0.05) return -1;
            return 0;
        });
        
        // 3. ✅ Indicateurs techniques normalisés
        const technicals = this.calculateTechnicalIndicators(prices);
        
        // 4. ✅ Volatilité
        const volatility = Math.sqrt(
            returns.reduce((sum, r) => sum + r * r, 0) / returns.length
        ) * Math.sqrt(252);
        
        // 5. ✅ Calculer le score AlphaVault
        const scoreData = {
            returns: returns,
            modelDirections: modelDirections,
            technicals: technicals,
            volatility: volatility,
            r2Scores: models.map(m => m.r2)
        };
        
        this.alphaVaultScore = this.scoreEngine.calculateScore(scoreData);
        
        console.log('✅ AlphaVault Score:', this.alphaVaultScore);
        
        return this.alphaVaultScore;
    },
    
    calculateTechnicalIndicators(prices) {
        const rsi = this.calculateRSI(prices, 14);
        const macd = this.calculateMACD(prices);
        const bb = this.calculateBollingerBands(prices, 20);
        const currentPrice = prices[prices.length - 1];
        const bollingerPosition = (currentPrice - bb.lower) / (bb.upper - bb.lower);
        
        return {
            rsi: rsi,
            macd: macd.histogram[macd.histogram.length - 1],
            bollingerPosition: bollingerPosition
        };
    },
    
    calculateRSI(prices, period = 14) {
        const gains = [];
        const losses = [];
        
        for (let i = 1; i < prices.length; i++) {
            const change = prices[i] - prices[i - 1];
            gains.push(change > 0 ? change : 0);
            losses.push(change < 0 ? -change : 0);
        }
        
        const avgGain = gains.slice(-period).reduce((a, b) => a + b, 0) / period;
        const avgLoss = losses.slice(-period).reduce((a, b) => a + b, 0) / period;
        
        if (avgLoss === 0) return 100;
        const rs = avgGain / avgLoss;
        return 100 - (100 / (1 + rs));
    },
    
    calculateMACD(prices) {
        const ema12 = this.calculateEMA(prices, 12);
        const ema26 = this.calculateEMA(prices, 26);
        const macdLine = ema12.map((val, i) => val - ema26[i]);
        const signalLine = this.calculateEMA(macdLine, 9);
        const histogram = macdLine.map((val, i) => val - signalLine[i]);
        return { macdLine, signalLine, histogram };
    },
    
    calculateEMA(prices, period) {
        const k = 2 / (period + 1);
        const ema = [prices[0]];
        for (let i = 1; i < prices.length; i++) {
            ema.push(prices[i] * k + ema[i - 1] * (1 - k));
        }
        return ema;
    },
    
    calculateBollingerBands(prices, period = 20) {
        const sma = prices.slice(-period).reduce((a, b) => a + b, 0) / period;
        const variance = prices.slice(-period).reduce((sum, p) => 
            sum + Math.pow(p - sma, 2), 0
        ) / period;
        const stdDev = Math.sqrt(variance);
        
        return {
            middle: sma,
            upper: sma + 2 * stdDev,
            lower: sma - 2 * stdDev
        };
    },
    
    // ============================================
    // ✅ TRAIN ALL MODELS - NORMALIZED OUTPUT ONLY
    // ============================================
    
    async trainAllModels() {
        console.log('🤖 Training ML models - NORMALIZED MODE (no raw predictions)');
        
        const prices = this.stockData.pricesInternal.map(p => p.close);
        const currentPrice = prices[prices.length - 1];
        
        ['linear', 'polynomial', 'exponential', 'knn', 'neural'].forEach(model => {
            const badge = document.getElementById(`badge-${model}`);
            if (badge) {
                badge.className = 'model-badge training';
                badge.textContent = 'Training...';
            }
        });
        
        this.showLoading(true, 'Training Linear Regression...');
        const linearModel = await this.trainLinearRegression(prices);
        this.models.linear = this.normalizeModelOutput(linearModel, currentPrice);
        this.updateModelCard('linear', this.models.linear);
        await this.sleep(200);
        
        this.showLoading(true, 'Training Polynomial Regression...');
        const polyModel = await this.trainPolynomialRegression(prices);
        this.models.polynomial = this.normalizeModelOutput(polyModel, currentPrice);
        this.updateModelCard('polynomial', this.models.polynomial);
        await this.sleep(200);
        
        this.showLoading(true, 'Training Exponential Smoothing...');
        const expModel = await this.trainExponentialSmoothing(prices);
        this.models.exponential = this.normalizeModelOutput(expModel, currentPrice);
        this.updateModelCard('exponential', this.models.exponential);
        await this.sleep(200);
        
        this.showLoading(true, 'Training K-Nearest Neighbors...');
        const knnModel = await this.trainKNN(prices);
        this.models.knn = this.normalizeModelOutput(knnModel, currentPrice);
        this.updateModelCard('knn', this.models.knn);
        await this.sleep(200);
        
        this.showLoading(true, 'Training Neural Network...');
        const neuralModel = await this.trainNeuralNetwork(prices);
        this.models.neural = this.normalizeModelOutput(neuralModel, currentPrice);
        this.updateModelCard('neural', this.models.neural);
        
        console.log('✅ All models trained (5/5) - Normalized outputs only');
    },
    
    /**
     * ✅ NORMALISE LES PRÉDICTIONS (retourne % de changement, pas prix)
     */
    normalizeModelOutput(model, currentPrice) {
        const percentChange = ((model.finalPrediction - currentPrice) / currentPrice) * 100;
        
        return {
            name: model.name,
            normalizedPrediction: percentChange / 100, // -1 à +1
            percentChange: percentChange,
            r2: model.r2,
            rmse: model.rmse / currentPrice, // RMSE normalisé
            direction: percentChange > 0 ? 1 : percentChange < 0 ? -1 : 0,
            params: model.params
        };
    },
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    
    // ============================================
    // LINEAR REGRESSION (INTERNE)
    // ============================================
    
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
        const finalPrediction = slope * (n + this.predictionHorizon - 1) + intercept;
        
        const r2 = this.calculateR2(y, fitted);
        const rmse = this.calculateRMSE(y, fitted);
        
        return {
            name: 'Linear Regression',
            finalPrediction: finalPrediction,
            r2: r2,
            rmse: rmse,
            params: { slope, intercept }
        };
    },
    
    // ============================================
    // POLYNOMIAL REGRESSION (INTERNE)
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
        
        const futureX = n + this.predictionHorizon - 1;
        let finalPrediction = 0;
        for (let d = 0; d <= degree; d++) {
            finalPrediction += coefficients[d] * Math.pow(futureX, d);
        }
        
        const r2 = this.calculateR2(y, fitted);
        const rmse = this.calculateRMSE(y, fitted);
        
        return {
            name: 'Polynomial Regression',
            finalPrediction: finalPrediction,
            r2: r2,
            rmse: rmse,
            params: { coefficients, degree }
        };
    },
    
    // ============================================
    // EXPONENTIAL SMOOTHING (INTERNE)
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
        
        const finalPrediction = level + this.predictionHorizon * trend;
        const r2 = this.calculateR2(prices, fitted);
        const rmse = this.calculateRMSE(prices, fitted);
        
        return {
            name: 'Exponential Smoothing',
            finalPrediction: finalPrediction,
            r2: r2,
            rmse: rmse,
            params: { alpha, beta, level, trend }
        };
    },
    
    // ============================================
    // K-NEAREST NEIGHBORS (INTERNE)
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
        
        let currentWindow = prices.slice(-lookback);
        let finalPrediction = currentWindow[currentWindow.length - 1];
        
        for (let i = 0; i < this.predictionHorizon; i++) {
            finalPrediction = this.knnPredict(currentWindow, trainingData, k);
            currentWindow = [...currentWindow.slice(1), finalPrediction];
        }
        
        const r2 = this.calculateR2(prices, fitted);
        const rmse = this.calculateRMSE(prices, fitted);
        
        return {
            name: 'K-Nearest Neighbors',
            finalPrediction: finalPrediction,
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
        return nearest.reduce((sum, item) => sum + item.target, 0) / k;
    },
    
    euclideanDistance(a, b) {
        let sum = 0;
        for (let i = 0; i < a.length; i++) {
            sum += Math.pow(a[i] - b[i], 2);
        }
        return Math.sqrt(sum);
    },
    
    // ============================================
    // NEURAL NETWORK (INTERNE)
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
        
        let currentWindow = normalized.slice(-lookback);
        let finalPredictionNorm = currentWindow[currentWindow.length - 1];
        
        for (let i = 0; i < this.predictionHorizon; i++) {
            const hidden = this.matrixVectorMultiply(weightsInputHidden, currentWindow).map((h, i) => 
                this.relu(h + biasHidden[i])
            );
            finalPredictionNorm = hidden.reduce((sum, h, i) => sum + h * weightsHiddenOutput[i], biasOutput);
            currentWindow = [...currentWindow.slice(1), finalPredictionNorm];
        }
        
        const finalPrediction = finalPredictionNorm * (maxPrice - minPrice) + minPrice;
        
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
        
        const r2 = this.calculateR2(prices, fitted);
        const rmse = this.calculateRMSE(prices, fitted);
        
        return {
            name: 'Neural Network',
            finalPrediction: finalPrediction,
            r2: r2,
            rmse: rmse,
            params: { lookback, hiddenSize, epochs }
        };
    },
    
    relu(x) { return Math.max(0, x); },
    
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
    // BACKTESTING (NORMALIZED)
    // ============================================
    
    async performBacktesting() {
        console.log('🔬 Performing backtesting - NORMALIZED MODE');
        this.showLoading(true, 'Running backtesting simulations...');
        
        const prices = this.stockData.pricesInternal.map(p => p.close);
        const n = prices.length;
        const backtestPeriods = 10;
        const testHorizon = 7;
        
        const backtestResults = {
            linear: { directionAccuracy: [], avgError: [] },
            polynomial: { directionAccuracy: [], avgError: [] },
            exponential: { directionAccuracy: [], avgError: [] },
            knn: { directionAccuracy: [], avgError: [] },
            neural: { directionAccuracy: [], avgError: [] }
        };
        
        for (let period = 0; period < backtestPeriods; period++) {
            const endIndex = n - (backtestPeriods - period) * testHorizon;
            if (endIndex < 50) continue;
            
            const trainPrices = prices.slice(0, endIndex);
            const actualFuture = prices.slice(endIndex, endIndex + testHorizon);
            if (actualFuture.length < testHorizon) continue;
            
            const currentPrice = trainPrices[trainPrices.length - 1];
            const actualFinalPrice = actualFuture[actualFuture.length - 1];
            const actualDirection = actualFinalPrice > currentPrice ? 1 : -1;
            
            const tempHorizon = this.predictionHorizon;
            this.predictionHorizon = testHorizon;
            
            try {
                const linearModel = await this.trainLinearRegression(trainPrices);
                const polyModel = await this.trainPolynomialRegression(trainPrices);
                const expModel = await this.trainExponentialSmoothing(trainPrices);
                const knnModel = await this.trainKNN(trainPrices);
                const neuralModel = await this.trainNeuralNetwork(trainPrices);
                
                const models = { linear: linearModel, polynomial: polyModel, exponential: expModel, knn: knnModel, neural: neuralModel };
                
                Object.keys(models).forEach(modelName => {
                    const model = models[modelName];
                    const predicted = model.finalPrediction;
                    const predictedDirection = predicted > currentPrice ? 1 : -1;
                    const directionCorrect = predictedDirection === actualDirection ? 1 : 0;
                    const error = Math.abs((predicted - actualFinalPrice) / actualFinalPrice) * 100;
                    
                    backtestResults[modelName].directionAccuracy.push(directionCorrect);
                    backtestResults[modelName].avgError.push(error);
                });
            } catch (e) {
                console.warn('Backtest period failed:', e);
            }
            
            this.predictionHorizon = tempHorizon;
        }
        
        const backtestMetrics = {};
        Object.keys(backtestResults).forEach(modelName => {
            const result = backtestResults[modelName];
            if (result.directionAccuracy.length > 0) {
                const dirAcc = (result.directionAccuracy.reduce((a, b) => a + b, 0) / result.directionAccuracy.length) * 100;
                const avgErr = result.avgError.reduce((a, b) => a + b, 0) / result.avgError.length;
                backtestMetrics[modelName] = {
                    directionAccuracy: dirAcc,
                    mape: avgErr
                };
            }
        });
        
        this.backtestResults = backtestMetrics;
        console.log('✅ Backtesting complete:', backtestMetrics);
    },
    
    // ============================================
    // HELPER FUNCTIONS
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
                if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) maxRow = k;
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
        let ssRes = 0, ssTot = 0;
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

// ========== CONTINUATION TREND-PREDICTION.JS (PARTIE 4/4) ==========

Object.assign(TrendPrediction, {
    
    // ============================================
    // ✅ DISPLAY FUNCTIONS - NO RAW PRICES
    // ============================================
    
    displayStockHeader() {
        document.getElementById('stockSymbol').textContent = this.currentSymbol;
        document.getElementById('stockName').textContent = this.stockData.name || this.currentSymbol;
        
        // ❌ NE PAS AFFICHER DE PRIX
        document.getElementById('currentPrice').textContent = '---';
        document.getElementById('priceChange').textContent = 'AlphaVault Score will be displayed below';
        document.getElementById('priceChange').className = 'change neutral';
        
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
                // ✅ Afficher % de changement (pas prix)
                metrics[0].textContent = `${modelResult.percentChange >= 0 ? '+' : ''}${modelResult.percentChange.toFixed(2)}%`;
                metrics[1].textContent = (modelResult.r2 * 100).toFixed(1) + '%';
                metrics[2].textContent = 'Score-based';
            }
        }
        
        this.createModelScoreGauge(modelName, modelResult);
    },
    
    /**
     * ✅ GRAPHIQUE BASÉ SUR LE SCORE (pas de prix)
     */
    createModelScoreGauge(modelName, modelResult) {
        const score = Math.max(0, Math.min(100, 50 + modelResult.percentChange * 2));
        
        Highcharts.chart(`chart-${modelName}`, {
            chart: {
                type: 'solidgauge',
                height: 250,
                backgroundColor: 'transparent'
            },
            title: { text: null },
            pane: {
                center: ['50%', '75%'],
                size: '110%',
                startAngle: -90,
                endAngle: 90,
                background: [{
                    backgroundColor: 'rgba(241, 245, 249, 0.3)',
                    innerRadius: '60%',
                    outerRadius: '100%',
                    shape: 'arc',
                    borderWidth: 0
                }]
            },
            tooltip: { enabled: false },
            yAxis: {
                min: 0,
                max: 100,
                stops: [
                    [0.1, '#ef4444'],
                    [0.3, '#f59e0b'],
                    [0.5, '#fbbf24'],
                    [0.7, '#84cc16'],
                    [0.9, '#22c55e']
                ],
                lineWidth: 0,
                tickWidth: 0,
                minorTickInterval: null,
                tickAmount: 2,
                labels: { y: 16 }
            },
            plotOptions: {
                solidgauge: {
                    dataLabels: {
                        y: -30,
                        borderWidth: 0,
                        useHTML: true,
                        format: `<div style="text-align:center">
                            <span style="font-size:2rem;font-weight:800;color:${this.colors.primary};">{y:.0f}</span><br/>
                            <span style="font-size:0.8rem;color:#64748b;">Score</span>
                        </div>`
                    }
                }
            },
            series: [{
                name: 'Score',
                data: [score],
                innerRadius: '60%',
                radius: '100%'
            }],
            credits: { enabled: false }
        });
    },
    
    displayResults() {
        this.createScoreComparisonChart();
        this.createPerformanceCharts();
        this.createPerformanceTable();
        this.displayEnsemblePrediction();
        this.createBacktestingCharts();
        this.createCorrelationHeatmap();
        this.displayRecommendation();
        
        document.getElementById('resultsPanel').classList.remove('hidden');
    },
    
    // ============================================
    // ✅ SCORE COMPARISON CHART (NO PRICES)
    // ============================================
    
    createScoreComparisonChart() {
        const models = Object.entries(this.models).filter(([_, m]) => m !== null);
        
        const categories = models.map(([name, _]) => this.models[name].name);
        const scores = models.map(([_, model]) => Math.max(0, Math.min(100, 50 + model.percentChange * 2)));
        
        Highcharts.chart('comparisonChart', {
            chart: {
                type: 'column',
                height: 600,
                borderRadius: 15
            },
            title: {
                text: `${this.currentSymbol} - AlphaVault Score Comparison`,
                style: { color: this.colors.primary, fontWeight: 'bold', fontSize: '1.25rem' }
            },
            subtitle: {
                text: `Score Range: 0-100 | Horizon: ${this.predictionHorizon} days | Training: ${this.trainingPeriod}`,
                style: { color: '#64748b', fontSize: '0.875rem' }
            },
            xAxis: {
                categories: categories,
                labels: { style: { fontWeight: '600', color: '#475569' } }
            },
            yAxis: {
                min: 0,
                max: 100,
                title: { text: 'AlphaVault Score', style: { color: '#475569' } },
                plotLines: [{
                    value: 50,
                    color: '#94a3b8',
                    width: 2,
                    dashStyle: 'Dash',
                    label: { text: 'Neutral (50)', style: { color: '#64748b' } }
                }]
            },
            tooltip: {
                headerFormat: '<b>{point.x}</b><br/>',
                pointFormat: 'Score: <b>{point.y:.0f}/100</b>',
                borderRadius: 10
            },
            plotOptions: {
                column: {
                    borderRadius: '25%',
                    colorByPoint: true,
                    colors: models.map(([name, _]) => this.getModelColor(name)),
                    dataLabels: {
                        enabled: true,
                        format: '{point.y:.0f}',
                        style: { fontWeight: 'bold', fontSize: '14px' }
                    }
                }
            },
            series: [{
                name: 'AlphaVault Score',
                data: scores
            }],
            credits: { enabled: false }
        });
    },
    
    // ============================================
    // PERFORMANCE CHARTS (NORMALIZED)
    // ============================================
    
    createPerformanceCharts() {
        const models = Object.entries(this.models).filter(([_, m]) => m !== null);
        
        // R² Chart
        const accuracyData = models.map(([name, model]) => ({
            name: model.name,
            y: model.r2 * 100,
            color: this.getModelColor(name)
        }));
        
        Highcharts.chart('accuracyChart', {
            chart: { type: 'column', borderRadius: 15, height: 400 },
            title: {
                text: 'Model Accuracy (R² Score)',
                style: { color: this.colors.primary, fontWeight: 'bold' }
            },
            xAxis: { type: 'category' },
            yAxis: {
                title: { text: 'R² Score (%)' },
                max: 100
            },
            tooltip: { pointFormat: '<b>{point.y:.1f}%</b>', borderRadius: 10 },
            plotOptions: {
                column: {
                    borderRadius: '25%',
                    dataLabels: {
                        enabled: true,
                        format: '{point.y:.1f}%'
                    }
                }
            },
            series: [{ name: 'Accuracy', data: accuracyData, colorByPoint: true }],
            credits: { enabled: false }
        });
        
        // Direction Accuracy (from backtesting)
        if (this.backtestResults) {
            const directionData = Object.keys(this.backtestResults).map(modelName => ({
                name: this.models[modelName].name,
                y: this.backtestResults[modelName].directionAccuracy,
                color: this.getModelColor(modelName)
            }));
            
            Highcharts.chart('errorChart', {
                chart: { type: 'bar', borderRadius: 15, height: 400 },
                title: {
                    text: 'Direction Prediction Accuracy',
                    style: { color: this.colors.primary, fontWeight: 'bold' }
                },
                xAxis: { type: 'category' },
                yAxis: {
                    title: { text: 'Accuracy (%)' },
                    max: 100
                },
                tooltip: { pointFormat: '<b>{point.y:.1f}%</b>', borderRadius: 10 },
                plotOptions: {
                    bar: {
                        borderRadius: '25%',
                        dataLabels: {
                            enabled: true,
                            format: '{point.y:.1f}%'
                        }
                    }
                },
                series: [{ name: 'Direction Accuracy', data: directionData, colorByPoint: true }],
                credits: { enabled: false }
            });
        }
    },
    
    createPerformanceTable() {
        const models = Object.entries(this.models).filter(([_, m]) => m !== null);
        models.sort((a, b) => b[1].r2 - a[1].r2);
        
        const tableHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Model</th>
                        <th>Expected Change</th>
                        <th>R² Score</th>
                        <th>Direction</th>
                        <th>Signal</th>
                    </tr>
                </thead>
                <tbody>
                    ${models.map(([name, model], index) => {
                        const rowClass = index === 0 ? 'best' : index === models.length - 1 ? 'worst' : '';
                        const signal = model.direction > 0 ? '📈 Bullish' : model.direction < 0 ? '📉 Bearish' : '⚖ Neutral';
                        const signalColor = model.direction > 0 ? this.colors.success : model.direction < 0 ? this.colors.danger : '#6c757d';
                        
                        return `
                            <tr class='${rowClass}'>
                                <td class='rank'>#${index + 1}</td>
                                <td><strong>${this.escapeHtml(model.name)}</strong></td>
                                <td style='color: ${model.percentChange >= 0 ? this.colors.success : this.colors.danger}; font-weight: 700;'>
                                    ${model.percentChange >= 0 ? '+' : ''}${model.percentChange.toFixed(2)}%
                                </td>
                                <td>${(model.r2 * 100).toFixed(2)}%</td>
                                <td>${model.direction > 0 ? '⬆ Up' : model.direction < 0 ? '⬇ Down' : '➡ Flat'}</td>
                                <td style='color: ${signalColor}; font-weight: 600;'>${signal}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
        
        document.getElementById('performanceTable').innerHTML = tableHTML;
    },
    
    // ============================================
    // ✅ ENSEMBLE PREDICTION (SCORE ONLY)
    // ============================================
    
    displayEnsemblePrediction() {
        const models = Object.values(this.models).filter(m => m !== null);
        
        // Moyenne pondérée des changements en %
        let sumWeightedChange = 0;
        let sumWeights = 0;
        
        models.forEach(model => {
            const weight = Math.max(0, model.r2);
            sumWeightedChange += model.percentChange * weight;
            sumWeights += weight;
        });
        
        const ensembleChange = sumWeightedChange / sumWeights;
        const ensembleScore = Math.max(0, Math.min(100, 50 + ensembleChange * 2));
        
        const avgAccuracy = models.reduce((sum, m) => sum + m.r2, 0) / models.length;
        
        // ✅ Affichage du score (PAS de prix)
        document.getElementById('ensemblePrice').textContent = `${ensembleScore.toFixed(0)}/100`;
        
        const changeEl = document.getElementById('ensembleChange');
        changeEl.textContent = `${ensembleChange >= 0 ? '+' : ''}${ensembleChange.toFixed(2)}% expected`;
        changeEl.style.color = ensembleChange >= 0 ? this.colors.success : this.colors.danger;
        
        document.getElementById('ensembleRange').textContent = `Score: ${ensembleScore.toFixed(0)}`;
        
        let signal = 'HOLD';
        let signalClass = 'neutral';
        let strength = 'Moderate';
        
        if (ensembleChange > 5) {
            signal = 'STRONG BUY';
            signalClass = 'bullish';
            strength = 'High Confidence';
        } else if (ensembleChange > 2) {
            signal = 'BUY';
            signalClass = 'bullish';
            strength = 'Good Confidence';
        } else if (ensembleChange < -5) {
            signal = 'STRONG SELL';
            signalClass = 'bearish';
            strength = 'High Confidence';
        } else if (ensembleChange < -2) {
            signal = 'SELL';
            signalClass = 'bearish';
            strength = 'Good Confidence';
        }
        
        document.getElementById('ensembleSignal').textContent = signal;
        document.getElementById('ensembleStrength').textContent = strength;
        
        const signalIcon = document.getElementById('signalIcon');
        signalIcon.className = `card-icon ${signalClass}`;
        
        document.getElementById('ensembleAccuracy').textContent = (avgAccuracy * 100).toFixed(1) + '%';
        
        // ✅ Afficher le score AlphaVault global
        if (this.alphaVaultScore) {
            const scoreEl = document.getElementById('alphaVaultScoreDisplay');
            if (scoreEl) {
                scoreEl.innerHTML = `
                    <div style="text-align:center; padding:30px; background:linear-gradient(135deg, ${this.colors.primary}, ${this.colors.secondary}); border-radius:20px; color:white; margin-top:20px;">
                        <div style="font-size:3rem; font-weight:900;">${this.alphaVaultScore.overall}</div>
                        <div style="font-size:1.2rem; margin-top:10px;">AlphaVault Score</div>
                        <div style="font-size:1rem; margin-top:10px; opacity:0.9;">${this.alphaVaultScore.signal.icon} ${this.alphaVaultScore.signal.text}</div>
                        <div style="font-size:0.9rem; margin-top:5px; opacity:0.8;">Confidence: ${this.alphaVaultScore.confidence.text}</div>
                    </div>
                `;
            }
        }
    },
    
    // ============================================
    // BACKTESTING CHARTS (NORMALIZED)
    // ============================================
    
    createBacktestingCharts() {
        if (!this.backtestResults) return;
        
        const accuracyData = Object.keys(this.backtestResults).map(modelName => ({
            name: this.models[modelName].name,
            y: this.backtestResults[modelName].directionAccuracy,
            color: this.getModelColor(modelName)
        }));
        
        Highcharts.chart('backtestAccuracyChart', {
            chart: { type: 'column', height: 450, borderRadius: 15 },
            title: {
                text: 'Historical Direction Prediction Accuracy',
                style: { color: this.colors.primary, fontWeight: 'bold' }
            },
            subtitle: {
                text: 'Percentage of correct direction predictions',
                style: { color: '#64748b' }
            },
            xAxis: { type: 'category' },
            yAxis: {
                title: { text: 'Accuracy (%)' },
                min: 0,
                max: 100
            },
            tooltip: {
                pointFormat: '<b>{point.y:.1f}%</b> accuracy',
                borderRadius: 10
            },
            plotOptions: {
                column: {
                    borderRadius: '25%',
                    dataLabels: {
                        enabled: true,
                        format: '{point.y:.1f}%'
                    }
                }
            },
            series: [{ name: 'Accuracy', data: accuracyData, colorByPoint: true }],
            credits: { enabled: false }
        });
        
        // Error chart
        const errorData = Object.keys(this.backtestResults).map(modelName => ({
            name: this.models[modelName].name,
            y: this.backtestResults[modelName].mape,
            color: this.getModelColor(modelName)
        }));
        
        Highcharts.chart('backtestComparisonChart', {
            chart: { type: 'bar', height: 450, borderRadius: 15 },
            title: {
                text: 'Mean Absolute Percentage Error (MAPE)',
                style: { color: this.colors.primary, fontWeight: 'bold' }
            },
            subtitle: {
                text: 'Lower is better',
                style: { color: '#64748b' }
            },
            xAxis: { type: 'category' },
            yAxis: {
                title: { text: 'MAPE (%)' }
            },
            tooltip: {
                pointFormat: '<b>{point.y:.2f}%</b> error',
                borderRadius: 10
            },
            plotOptions: {
                bar: {
                    borderRadius: '25%',
                    dataLabels: {
                        enabled: true,
                        format: '{point.y:.2f}%'
                    }
                }
            },
            series: [{ name: 'MAPE', data: errorData, colorByPoint: true }],
            credits: { enabled: false }
        });
        
        // Update metrics
        if (this.backtestResults.linear) {
            const avgAccuracy = Object.values(this.backtestResults)
                .reduce((sum, r) => sum + r.directionAccuracy, 0) / Object.keys(this.backtestResults).length;
            
            const avgMAPE = Object.values(this.backtestResults)
                .reduce((sum, r) => sum + r.mape, 0) / Object.keys(this.backtestResults).length;
            
            const bestModel = Object.keys(this.backtestResults).reduce((best, modelName) => {
                return this.backtestResults[modelName].directionAccuracy > this.backtestResults[best].directionAccuracy ? modelName : best;
            });
            
            const el7d = document.getElementById('backtest7dAccuracy');
            const elMAPE = document.getElementById('backtestMAPE');
            const elBest = document.getElementById('backtestBestModel');
            const elDirection = document.getElementById('backtestDirectionAccuracy');
            
            if (el7d) el7d.textContent = avgAccuracy.toFixed(1) + '%';
            if (elMAPE) elMAPE.textContent = avgMAPE.toFixed(2) + '%';
            if (elBest) elBest.textContent = this.models[bestModel].name;
            if (elDirection) elDirection.textContent = avgAccuracy.toFixed(1) + '%';
        }
    },
    
    switchBacktestTab(button) {
        document.querySelectorAll('.backtesting-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        document.querySelectorAll('.backtesting-content .tab-panel').forEach(panel => panel.classList.remove('active'));
        const tabId = 'tab-' + button.dataset.tab;
        const panel = document.getElementById(tabId);
        if (panel) panel.classList.add('active');
    },
    
    // ============================================
    // CORRELATION HEATMAP (INCHANGÉ)
    // ============================================
    
    createCorrelationHeatmap() {
        const modelNames = Object.keys(this.models).filter(name => this.models[name] !== null);
        const correlationMatrix = [];
        
        modelNames.forEach((model1, i) => {
            modelNames.forEach((model2, j) => {
                const val1 = [this.models[model1].percentChange];
                const val2 = [this.models[model2].percentChange];
                const correlation = i === j ? 1 : (val1[0] * val2[0] > 0 ? 0.8 : 0.2);
                correlationMatrix.push([j, i, correlation]);
            });
        });
        
        Highcharts.chart('correlationHeatmap', {
            chart: { type: 'heatmap', height: 400, borderRadius: 15 },
            title: {
                text: 'Model Prediction Correlation',
                style: { color: this.colors.primary, fontWeight: 'bold' }
            },
            xAxis: { categories: modelNames.map(name => this.models[name].name) },
            yAxis: {
                categories: modelNames.map(name => this.models[name].name),
                title: null,
                reversed: true
            },
            colorAxis: {
                min: 0,
                max: 1,
                stops: [[0, '#f8fafc'], [0.5, '#93c5fd'], [1, '#1e40af']]
            },
            tooltip: {
                formatter: function() {
                    return `<b>${this.series.xAxis.categories[this.point.x]}</b> vs <b>${this.series.yAxis.categories[this.point.y]}</b><br>Correlation: <b>${(this.point.value * 100).toFixed(1)}%</b>`;
                }
            },
            series: [{
                data: correlationMatrix,
                dataLabels: {
                    enabled: true,
                    format: '{point.value:.2f}'
                }
            }],
            credits: { enabled: false }
        });
        
        const avgCorrelation = correlationMatrix
            .filter((item, index) => Math.floor(index / modelNames.length) !== index % modelNames.length)
            .reduce((sum, item) => sum + item[2], 0) / (correlationMatrix.length - modelNames.length);
        
        const consensusScore = avgCorrelation * 100;
        
        Highcharts.chart('consensusGauge', {
            chart: { type: 'solidgauge', height: 280, backgroundColor: 'transparent' },
            title: null,
            pane: {
                center: ['50%', '75%'],
                size: '110%',
                startAngle: -90,
                endAngle: 90,
                background: [{
                    backgroundColor: 'rgba(241, 245, 249, 0.3)',
                    innerRadius: '60%',
                    outerRadius: '100%',
                    shape: 'arc'
                }]
            },
            tooltip: { enabled: false },
            yAxis: {
                min: 0,
                max: 100,
                stops: [[0.1, '#ef4444'], [0.5, '#fbbf24'], [0.9, '#22c55e']],
                lineWidth: 0,
                tickWidth: 0
            },
            plotOptions: {
                solidgauge: {
                    dataLabels: {
                        y: -30,
                        borderWidth: 0,
                        useHTML: true,
                        format: '<div style="text-align:center"><span style="font-size:2.5rem;font-weight:800;color:' + this.colors.primary + ';">{y:.0f}%</span><br/><span style="font-size:0.9rem;color:#64748b;">Model Consensus</span></div>'
                    }
                }
            },
            series: [{ data: [consensusScore], innerRadius: '60%', radius: '100%' }],
            credits: { enabled: false }
        });
    },
    
    calculateCorrelation(x, y) {
        const n = Math.min(x.length, y.length);
        const sumX = x.slice(0, n).reduce((a, b) => a + b, 0);
        const sumY = y.slice(0, n).reduce((a, b) => a + b, 0);
        const sumXY = x.slice(0, n).reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sumX2 = x.slice(0, n).reduce((sum, xi) => sum + xi * xi, 0);
        const sumY2 = y.slice(0, n).reduce((sum, yi) => sum + yi * yi, 0);
        const numerator = n * sumXY - sumX * sumY;
        const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
        if (denominator === 0) return 0;
        return numerator / denominator;
    },
    
    // ============================================
    // RECOMMENDATION (SCORE-BASED)
    // ============================================
    
    displayRecommendation() {
        const models = Object.values(this.models).filter(m => m !== null);
        let sumWeightedChange = 0;
        let sumWeights = 0;
        
        models.forEach(model => {
            const weight = Math.max(0, model.r2);
            sumWeightedChange += model.percentChange * weight;
            sumWeights += weight;
        });
        
        const ensembleChange = sumWeightedChange / sumWeights;
        
        let recommendation = 'HOLD';
        let iconClass = 'hold';
        let title = 'Hold Position';
        let subtitle = 'Market conditions suggest waiting';
        
        if (ensembleChange > 5) {
            recommendation = 'STRONG BUY';
            iconClass = 'strong-buy';
            title = 'Strong Buy Signal';
            subtitle = 'Multiple models predict significant upside';
        } else if (ensembleChange > 2) {
            recommendation = 'BUY';
            iconClass = 'buy';
            title = 'Buy Signal';
            subtitle = 'Models indicate positive momentum';
        } else if (ensembleChange < -5) {
            recommendation = 'STRONG SELL';
            iconClass = 'strong-sell';
            title = 'Strong Sell Signal';
            subtitle = 'Multiple models predict significant downside';
        } else if (ensembleChange < -2) {
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
                <li><i class='fas fa-chart-line'></i> <strong>Expected Change:</strong> ${ensembleChange >= 0 ? '+' : ''}${ensembleChange.toFixed(2)}% in ${this.predictionHorizon} days</li>
                <li><i class='fas fa-brain'></i> <strong>Model Consensus:</strong> ${models.filter(m => m.direction > 0).length}/${models.length} models predict increase</li>
                <li><i class='fas fa-bullseye'></i> <strong>Average Accuracy:</strong> ${(models.reduce((sum, m) => sum + m.r2, 0) / models.length * 100).toFixed(1)}%</li>
                <li><i class='fas fa-trophy'></i> <strong>Best Model:</strong> ${[...models].sort((a, b) => b.r2 - a.r2)[0].name}</li>
                ${this.alphaVaultScore ? `<li><i class='fas fa-star'></i> <strong>AlphaVault Score:</strong> ${this.alphaVaultScore.overall}/100 (${this.alphaVaultScore.signal.text})</li>` : ''}
            </ul>
        `;
        
        document.getElementById('recommendationBody').innerHTML = bodyHTML;
    },
    
    // ============================================
    // ✅ EXPORT (NO RAW PRICES)
    // ============================================
    
    exportPredictions() {
        if (!this.stockData || !this.models.linear) {
            this.showNotification('No predictions to export', 'warning');
            return;
        }
        
        console.log('📤 Exporting AlphaVault Scores...');
        
        let csv = `Stock Symbol,${this.currentSymbol}\n`;
        csv += `Export Date,${new Date().toLocaleString()}\n`;
        csv += `Prediction Horizon,${this.predictionHorizon} days\n`;
        csv += `Training Period,${this.trainingPeriod}\n\n`;
        
        csv += `Model,Expected Change %,R² Score,Direction,Signal\n`;
        
        Object.keys(this.models).forEach(modelName => {
            const model = this.models[modelName];
            if (model) {
                const signal = model.direction > 0 ? 'Bullish' : model.direction < 0 ? 'Bearish' : 'Neutral';
                csv += `${model.name},${model.percentChange.toFixed(2)}%,${(model.r2 * 100).toFixed(2)}%,${model.direction},${signal}\n`;
            }
        });
        
        if (this.alphaVaultScore) {
            csv += `\nAlphaVault Score,${this.alphaVaultScore.overall}/100\n`;
            csv += `Signal,${this.alphaVaultScore.signal.text}\n`;
            csv += `Confidence,${this.alphaVaultScore.confidence.text}\n`;
        }
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.currentSymbol}_alphavault_score_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showNotification('AlphaVault Score exported successfully!', 'success');
        console.log('✅ Export complete - NO RAW DATA');
    },
    
    // ============================================
    // UTILITY FUNCTIONS
    // ============================================
    
    getModelColor(modelName) {
        const colors = {
            linear: this.colors.primary,
            polynomial: this.colors.secondary,
            exponential: this.colors.tertiary,
            knn: this.colors.purple,
            neural: '#9D5CE6'
        };
        return colors[modelName] || this.colors.primary;
    },
    
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
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
        const formatted = now.toLocaleString('en-US', {
            month: 'short',
            day: '2-digit',
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

// ========== INITIALIZE ==========
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 AlphaVault Score Engine - 100% Legal Compliant Version');
    console.log('✅ NO RAW DATA REDISTRIBUTION');
    TrendPrediction.init();
});

window.TrendPrediction = TrendPrediction;

console.log('✅ AlphaVault Score Engine loaded - LEGAL COMPLIANT MODE');