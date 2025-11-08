/* ==============================================
   MARKET-DATA.JS - Market Data & Technical Analysis
   Version Cloud avec RATE LIMITING et CACHE OPTIMISÉ - COMPLET
   ============================================== */

// ========== RATE LIMITER ==========
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
            
            // Trier par priorité (high > normal > low)
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
            // Nettoyer les anciennes requêtes
            const now = Date.now();
            this.requestTimes = this.requestTimes.filter(time => now - time < this.windowMs);
            
            // Vérifier si on peut faire une requête
            if (this.requestTimes.length >= this.maxRequests) {
                const oldestRequest = Math.min(...this.requestTimes);
                const waitTime = this.windowMs - (now - oldestRequest) + 100;
                
                console.log(`⏳ Rate limit reached. Waiting ${Math.ceil(waitTime/1000)}s...`);
                
                // Mettre à jour l'indicateur de cache
                if (window.cacheWidget) {
                    window.cacheWidget.updateQueueStatus(this.queue.length, waitTime);
                }
                
                await this.sleep(waitTime);
                continue;
            }
            
            // Exécuter la prochaine requête
            const item = this.queue.shift();
            this.requestTimes.push(Date.now());
            
            try {
                const result = await item.fn();
                item.resolve(result);
            } catch (error) {
                item.reject(error);
            }
            
            // Petit délai entre les requêtes
            await this.sleep(100);
        }
        
        this.processing = false;
        
        // Mettre à jour l'indicateur
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

// ========== CACHE OPTIMISÉ ==========
class OptimizedCache {
    constructor() {
        this.prefix = 'md_cache_';
        this.staticTTL = 24 * 60 * 60 * 1000; // 24h pour données statiques
        this.dynamicTTL = 5 * 60 * 1000; // 5min pour données dynamiques
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
            
            // Vérifier expiration
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

const MarketData = {
    // API Client
    apiClient: null,
    rateLimiter: null,
    optimizedCache: null,
    
    // Current State
    currentSymbol: '',
    currentPeriod: '1M',
    stockData: null,
    profileData: null,
    statisticsData: null,
    logoUrl: '',
    
    // Search functionality
    selectedSuggestionIndex: -1,
    searchTimeout: null,
    
    // Watchlist & Alerts
    watchlist: [],
    alerts: [],
    watchlistRefreshInterval: null,
    notificationPermission: false,
    lastWatchlistRefresh: 0,
    
    // Comparison
    comparisonSymbols: [],
    comparisonData: {},
    comparisonColors: ['#1e5eeb', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'],
    
    // Charts instances
    charts: {
        price: null,
        rsi: null,
        macd: null,
        comparison: null
    },
    
    // ========== INITIALIZATION ==========
    
    async init() {
        try {
            console.log('🚀 Initializing Market Data with Rate Limiting...');
            
            // Initialiser le rate limiter (8 req/min)
            this.rateLimiter = new RateLimiter(8, 60000);
            this.optimizedCache = new OptimizedCache();
            
            // Attendre que l'utilisateur soit authentifié
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
            
            await this.loadCurrentPortfolio();
            
            this.requestNotificationPermission();
            this.startWatchlistAutoRefresh();
            
            // Auto-load a default symbol
            setTimeout(() => {
                this.loadSymbol('AAPL');
            }, 500);
            
            console.log('✅ Market Data initialized with rate limiting');
            
        } catch (error) {
            console.error('Initialization error:', error);
            this.showNotification('Failed to initialize application', 'error');
        }
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
    
    async waitForAuth() {
        return new Promise((resolve) => {
            if (!firebase || !firebase.auth) {
                console.warn('⚠️ Firebase not available');
                resolve();
                return;
            }
            
            const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
                if (user) {
                    console.log('✅ User authenticated for Market Data');
                    unsubscribe();
                    resolve();
                }
            });
            
            setTimeout(() => {
                resolve();
            }, 3000);
        });
    },
    
    // ========== LOAD SYMBOL (OPTIMISÉ) ==========
    
    async loadSymbol(symbol) {
        this.currentSymbol = symbol;
        
        const input = document.getElementById('symbolInput');
        if (input) {
            input.value = symbol;
        }
        
        this.showLoading(true);
        this.hideResults();
        this.hideSuggestions();
        
        try {
            console.log(`📊 Loading ${symbol} with optimized cache...`);
            
            // Charger d'abord depuis le cache local
            const cachedProfile = this.optimizedCache.get(`profile_${symbol}`);
            const cachedLogo = this.optimizedCache.get(`logo_${symbol}`);
            const cachedStats = this.optimizedCache.get(`stats_${symbol}`);
            
            // Données critiques avec rate limiting (priorité haute)
            const [quote, timeSeries] = await Promise.all([
                this.apiRequest(() => this.apiClient.getQuote(symbol), 'high'),
                this.apiRequest(() => this.getTimeSeriesForPeriod(symbol, this.currentPeriod), 'high')
            ]);
            
            if (!quote || !timeSeries) {
                throw new Error('Failed to load stock data');
            }
            
            this.stockData = {
                symbol: quote.symbol,
                prices: timeSeries.data,
                quote: quote
            };
            
            // Afficher immédiatement les données critiques
            this.displayStockOverview();
            this.displayResults();
            this.updateAddToWatchlistButton();
            
            // Utiliser le cache pour les données statiques
            this.profileData = cachedProfile;
            this.statisticsData = cachedStats;
            this.logoUrl = cachedLogo || '';
            
            if (cachedProfile || cachedStats) {
                this.displayCompanyProfile();
                console.log('✅ Loaded profile/stats from cache');
            }
            
            // Charger les données statiques en arrière-plan
            this.loadStaticDataInBackground(symbol);
            
        } catch (error) {
            console.error('Error loading stock data:', error);
            this.showNotification(error.message || 'Failed to load stock data', 'error');
        } finally {
            this.showLoading(false);
        }
    },
    
    async loadStaticDataInBackground(symbol) {
        try {
            const [profile, statistics, logo] = await Promise.allSettled([
                this.apiRequest(() => this.apiClient.getProfile(symbol), 'low'),
                this.apiRequest(() => this.apiClient.getStatistics(symbol), 'low'),
                this.apiRequest(() => this.apiClient.getLogo(symbol), 'low')
            ]);
            
            let updated = false;
            
            if (profile.status === 'fulfilled' && profile.value) {
                this.profileData = profile.value;
                this.optimizedCache.set(`profile_${symbol}`, profile.value, this.optimizedCache.staticTTL);
                updated = true;
            }
            
            if (statistics.status === 'fulfilled' && statistics.value) {
                this.statisticsData = statistics.value;
                this.optimizedCache.set(`stats_${symbol}`, statistics.value, this.optimizedCache.staticTTL);
                updated = true;
            }
            
            if (logo.status === 'fulfilled' && logo.value) {
                this.logoUrl = logo.value;
                this.optimizedCache.set(`logo_${symbol}`, logo.value, this.optimizedCache.staticTTL);
                updated = true;
            }
            
            if (updated) {
                this.displayCompanyProfile();
                console.log('✅ Updated static data in background');
            }
            
        } catch (error) {
            console.warn('Background data load failed:', error);
        }
    },
    
    async getTimeSeriesForPeriod(symbol, period) {
        const periodMap = {
            '1M': { interval: '1day', outputsize: 30 },
            '3M': { interval: '1day', outputsize: 90 },
            '6M': { interval: '1day', outputsize: 180 },
            '1Y': { interval: '1day', outputsize: 252 },
            '5Y': { interval: '1week', outputsize: 260 },
            'MAX': { interval: '1month', outputsize: 300 }
        };
        
        const config = periodMap[period] || periodMap['6M'];
        return await this.apiClient.getTimeSeries(symbol, config.interval, config.outputsize);
    },
    
    changePeriod(period) {
        this.currentPeriod = period;
        
        document.querySelectorAll('.period-btn').forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
        });
        
        const activeBtn = document.querySelector(`[data-period="${period}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
            activeBtn.setAttribute('aria-pressed', 'true');
        }
        
        if (this.currentSymbol) {
            this.loadSymbol(this.currentSymbol);
        }
        
        if (this.comparisonSymbols.length > 0) {
            this.loadComparisonFromSymbols(this.comparisonSymbols);
        }
    },
    
    updateChart() {
        if (this.stockData) {
            this.createPriceChart();
        }
    },
    
    toggleAccordion(headerElement) {
        const content = headerElement.nextElementSibling;
        const isActive = headerElement.classList.contains('active');
        
        document.querySelectorAll('.accordion-header.active').forEach(h => {
            h.classList.remove('active');
            h.nextElementSibling.classList.remove('active');
        });
        
        if (!isActive) {
            headerElement.classList.add('active');
            content.classList.add('active');
        }
    },
    
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
};

// ========== WATCHLIST FUNCTIONS (OPTIMISÉ) ==========

Object.assign(MarketData, {
    
    loadWatchlistFromStorage() {
        const saved = localStorage.getItem('market_watchlist');
        if (saved) {
            try {
                this.watchlist = JSON.parse(saved);
                this.renderWatchlist();
            } catch (error) {
                console.error('Error loading watchlist:', error);
                this.watchlist = [];
            }
        }
    },
    
    saveWatchlistToStorage() {
        try {
            localStorage.setItem('market_watchlist', JSON.stringify(this.watchlist));
        } catch (error) {
            console.error('Error saving watchlist:', error);
        }
    },
    
    addCurrentToWatchlist() {
        if (!this.currentSymbol) {
            alert('Please search for a stock first');
            return;
        }
        
        if (this.watchlist.some(item => item.symbol === this.currentSymbol)) {
            alert(`${this.currentSymbol} is already in your watchlist`);
            return;
        }
        
        const watchlistItem = {
            symbol: this.currentSymbol,
            name: this.stockData.quote.name || this.currentSymbol,
            addedAt: Date.now()
        };
        
        this.watchlist.push(watchlistItem);
        
        this.saveWatchlistToStorage();
        this.autoSave();
        
        this.renderWatchlist();
        this.refreshSingleWatchlistItem(this.currentSymbol);
        this.updateAddToWatchlistButton();
        
        this.showNotification(`✅ ${this.currentSymbol} added to watchlist`, 'success');
    },
    
    removeFromWatchlist(symbol) {
        if (confirm(`Remove ${symbol} from watchlist?`)) {
            this.watchlist = this.watchlist.filter(item => item.symbol !== symbol);
            
            this.saveWatchlistToStorage();
            this.autoSave();
            
            this.renderWatchlist();
            this.updateAddToWatchlistButton();
            this.showNotification(`${symbol} removed from watchlist`, 'info');
        }
    },
    
    clearWatchlist() {
        if (this.watchlist.length === 0) {
            alert('Watchlist is already empty');
            return;
        }
        
        if (confirm(`Clear all ${this.watchlist.length} stocks from watchlist?`)) {
            this.watchlist = [];
            
            this.saveWatchlistToStorage();
            this.autoSave();
            
            this.renderWatchlist();
            this.updateAddToWatchlistButton();
            this.showNotification('Watchlist cleared', 'info');
        }
    },
    
    renderWatchlist() {
        const container = document.getElementById('watchlistContainer');
        if (!container) return;
        
        if (this.watchlist.length === 0) {
            container.innerHTML = `
                <div class='watchlist-empty'>
                    <i class='fas fa-star-half-alt'></i>
                    <p>Your watchlist is empty</p>
                    <p class='hint'>Search for a stock and click "Add to Watchlist" to start tracking</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.watchlist.map(item => `
            <div class='watchlist-card' id='watchlist-${item.symbol}' onclick='MarketData.loadSymbol("${item.symbol}")'>
                <div class='watchlist-card-header'>
                    <div>
                        <div class='watchlist-symbol'>${this.escapeHtml(item.symbol)}</div>
                        <div class='watchlist-name'>${this.escapeHtml(item.name)}</div>
                    </div>
                    <button class='watchlist-remove' onclick='event.stopPropagation(); MarketData.removeFromWatchlist("${item.symbol}")' aria-label='Remove ${item.symbol} from watchlist'>
                        <i class='fas fa-times'></i>
                    </button>
                </div>
                <div class='watchlist-price'>--</div>
                <div class='watchlist-change'>
                    <i class='fas fa-minus'></i>
                    <span>--</span>
                </div>
                <div class='watchlist-stats'>
                    <div class='watchlist-stat'>
                        <span class='watchlist-stat-label'>Open</span>
                        <span class='watchlist-stat-value'>--</span>
                    </div>
                    <div class='watchlist-stat'>
                        <span class='watchlist-stat-label'>Volume</span>
                        <span class='watchlist-stat-value'>--</span>
                    </div>
                </div>
            </div>
        `).join('');
    },
    
    async refreshWatchlist() {
        if (this.watchlist.length === 0) {
            return;
        }
        
        // THROTTLING : Ne pas rafraîchir plus d'une fois toutes les 5 minutes
        const now = Date.now();
        const minInterval = 5 * 60 * 1000;
        
        if (now - this.lastWatchlistRefresh < minInterval) {
            const remaining = Math.ceil((minInterval - (now - this.lastWatchlistRefresh)) / 1000);
            this.showNotification(`Watchlist refreshed ${Math.ceil((now - this.lastWatchlistRefresh) / 1000)}s ago. Wait ${remaining}s`, 'info');
            return;
        }
        
        this.lastWatchlistRefresh = now;
        
        // Charger d'abord depuis le cache
        let cacheHits = 0;
        for (const item of this.watchlist) {
            const cached = this.optimizedCache.get(`quote_${item.symbol}`);
            if (cached && this.optimizedCache.getAge(`quote_${item.symbol}`) < 60000) {
                this.updateWatchlistCard(item.symbol, cached);
                cacheHits++;
            }
        }
        
        if (cacheHits > 0) {
            console.log(`✅ Loaded ${cacheHits}/${this.watchlist.length} from cache`);
        }
        
        // RATE LIMITING : Refresh par batch de 5 max
        const batchSize = 5;
        const symbolsToRefresh = this.watchlist.map(item => item.symbol);
        
        this.showNotification(`Refreshing ${symbolsToRefresh.length} stocks...`, 'info');
        
        for (let i = 0; i < symbolsToRefresh.length; i += batchSize) {
            const batch = symbolsToRefresh.slice(i, i + batchSize);
            
            await Promise.all(
                batch.map(symbol => this.refreshSingleWatchlistItem(symbol))
            );
            
            if (i + batchSize < symbolsToRefresh.length) {
                console.log(`⏳ Batch ${Math.ceil((i + batchSize) / batchSize)} completed, waiting...`);
                await this.rateLimiter.sleep(2000);
            }
        }
        
        this.updateLastUpdate();
        this.checkAlerts();
        this.showNotification('✅ Watchlist refreshed!', 'success');
    },
    
    async refreshSingleWatchlistItem(symbol) {
        const card = document.getElementById(`watchlist-${symbol}`);
        if (!card) return;
        
        card.classList.add('watchlist-loading');
        
        try {
            const quote = await this.apiRequest(() => this.apiClient.getQuote(symbol), 'normal');
            
            this.optimizedCache.set(`quote_${symbol}`, quote, 60000);
            
            this.updateWatchlistCard(symbol, quote);
            
            const watchlistItem = this.watchlist.find(w => w.symbol === symbol);
            if (watchlistItem) {
                watchlistItem.currentPrice = quote.price;
                watchlistItem.change = quote.change;
                watchlistItem.changePercent = quote.percentChange;
            }
            
        } catch (error) {
            console.error(`Error refreshing ${symbol}:`, error);
            
            const cached = this.optimizedCache.get(`quote_${symbol}`);
            if (cached) {
                this.updateWatchlistCard(symbol, cached);
                console.log(`✅ Using cached data for ${symbol}`);
            }
        } finally {
            card.classList.remove('watchlist-loading');
        }
    },
    
    updateWatchlistCard(symbol, quote) {
        const card = document.getElementById(`watchlist-${symbol}`);
        if (!card) return;
        
        const price = quote.price;
        const change = quote.change;
        const changePercent = quote.percentChange;
        const open = quote.open;
        const volume = quote.volume;
        
        card.querySelector('.watchlist-price').textContent = this.formatCurrency(price);
        
        const changeEl = card.querySelector('.watchlist-change');
        const icon = change >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';
        const changeClass = change >= 0 ? 'positive' : 'negative';
        changeEl.className = `watchlist-change ${changeClass}`;
        changeEl.innerHTML = `
            <i class='fas ${icon}'></i>
            <span>${change >= 0 ? '+' : ''}${this.formatCurrency(change)} (${change >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)</span>
        `;
        
        const stats = card.querySelectorAll('.watchlist-stat-value');
        stats[0].textContent = this.formatCurrency(open);
        stats[1].textContent = this.formatVolume(volume);
        
        const cacheAge = this.optimizedCache.getAge(`quote_${symbol}`);
        if (cacheAge && cacheAge > 0) {
            const ageSeconds = Math.floor(cacheAge / 1000);
            if (ageSeconds < 60) {
                card.setAttribute('title', `Updated ${ageSeconds}s ago (from cache)`);
            }
        }
    },
    
    startWatchlistAutoRefresh() {
        if (this.watchlistRefreshInterval) {
            clearInterval(this.watchlistRefreshInterval);
        }
        
        this.watchlistRefreshInterval = setInterval(() => {
            if (this.watchlist.length > 0) {
                console.log('⏰ Auto-refresh triggered');
                this.refreshWatchlist();
            }
        }, 2 * 60 * 60 * 1000); // 2 heures
    },
    
    updateAddToWatchlistButton() {
        const btn = document.getElementById('btnAddCurrent');
        if (!btn) return;
        
        if (this.currentSymbol && !this.watchlist.some(w => w.symbol === this.currentSymbol)) {
            btn.disabled = false;
            btn.innerHTML = `<i class='fas fa-plus'></i> Add ${this.currentSymbol} to Watchlist`;
        } else if (this.currentSymbol) {
            btn.disabled = true;
            btn.innerHTML = `<i class='fas fa-check'></i> Already in Watchlist`;
        } else {
            btn.disabled = true;
            btn.innerHTML = `<i class='fas fa-plus'></i> Add Current Stock`;
        }
    }
    
});

// ========== SEARCH FUNCTIONS (OPTIMISÉ) ==========

Object.assign(MarketData, {
    
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
                    this.searchStock();
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
        
        // Vérifier le cache d'abord
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
    
    searchStock() {
        const input = document.getElementById('symbolInput');
        if (!input) return;
        
        const symbol = input.value.trim().toUpperCase();
        if (symbol) {
            this.loadSymbol(symbol);
        }
    }
    
});

// ========== ALERTS FUNCTIONS ==========

Object.assign(MarketData, {
    
    loadAlertsFromStorage() {
        const saved = localStorage.getItem('market_alerts');
        if (saved) {
            try {
                this.alerts = JSON.parse(saved);
                this.renderAlerts();
            } catch (error) {
                console.error('Error loading alerts:', error);
                this.alerts = [];
            }
        }
    },
    
    saveAlertsToStorage() {
        try {
            localStorage.setItem('market_alerts', JSON.stringify(this.alerts));
        } catch (error) {
            console.error('Error saving alerts:', error);
        }
    },
    
    openAlertModal() {
        const modal = document.getElementById('modalCreateAlert');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Empêcher le scroll
        }
        
        if (this.currentSymbol) {
            const input = document.getElementById('alertSymbol');
            if (input) {
                input.value = this.currentSymbol;
            }
        }
    },
    
    closeAlertModal() {
        const modal = document.getElementById('modalCreateAlert');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = ''; // Réactiver le scroll
        }
        
        const symbolInput = document.getElementById('alertSymbol');
        const priceInput = document.getElementById('alertPrice');
        const typeInput = document.getElementById('alertType');
        const noteInput = document.getElementById('alertNote');
        
        if (symbolInput) symbolInput.value = '';
        if (priceInput) priceInput.value = '';
        if (typeInput) typeInput.value = 'above';
        if (noteInput) noteInput.value = '';
    },
    
    createAlert() {
        const symbol = document.getElementById('alertSymbol').value.trim().toUpperCase();
        const price = parseFloat(document.getElementById('alertPrice').value);
        const type = document.getElementById('alertType').value;
        const note = document.getElementById('alertNote').value.trim();
        
        if (!symbol) {
            alert('Please enter a stock symbol');
            return;
        }
        
        if (!price || price <= 0) {
            alert('Please enter a valid target price');
            return;
        }
        
        const alert = {
            id: Date.now(),
            symbol: symbol,
            targetPrice: price,
            type: type,
            note: note,
            triggered: false,
            createdAt: Date.now()
        };
        
        this.alerts.push(alert);
        
        this.saveAlertsToStorage();
        this.autoSave();
        
        this.renderAlerts();
        this.closeAlertModal();
        
        this.showNotification(`✅ Alert created for ${symbol}`, 'success');
        
        if (!this.watchlist.some(w => w.symbol === symbol)) {
            this.watchlist.push({
                symbol: symbol,
                name: symbol,
                addedAt: Date.now()
            });
            this.saveWatchlistToStorage();
            this.autoSave();
            this.renderWatchlist();
            this.refreshSingleWatchlistItem(symbol);
        }
    },
    
    deleteAlert(alertId) {
        if (confirm('Delete this alert?')) {
            this.alerts = this.alerts.filter(a => a.id !== alertId);
            
            this.saveAlertsToStorage();
            this.autoSave();
            
            this.renderAlerts();
            this.showNotification('Alert deleted', 'info');
        }
    },
    
    renderAlerts() {
        const container = document.getElementById('alertsContainer');
        if (!container) return;
        
        if (this.alerts.length === 0) {
            container.innerHTML = `
                <div class='alerts-empty'>
                    <i class='fas fa-bell-slash'></i>
                    <p>No active alerts</p>
                    <p class='hint'>Create price alerts to get notified when a stock reaches your target</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.alerts.map(alert => {
            const statusClass = alert.triggered ? 'triggered' : 'active';
            const statusText = alert.triggered ? 'Triggered ✓' : 'Active';
            const conditionText = alert.type === 'above' ? 'above' : 'below';
            
            return `
                <div class='alert-card ${statusClass}'>
                    <div class='alert-info'>
                        <div class='alert-symbol'>${this.escapeHtml(alert.symbol)}</div>
                        <div class='alert-condition'>
                            Alert when price goes <strong>${conditionText}</strong> 
                            <span class='price'>${this.formatCurrency(alert.targetPrice)}</span>
                        </div>
                        ${alert.note ? `<div class='alert-note'>${this.escapeHtml(alert.note)}</div>` : ''}
                    </div>
                    <span class='alert-status ${statusClass}'>${statusText}</span>
                    <button class='alert-delete' onclick='MarketData.deleteAlert(${alert.id})' aria-label='Delete alert'>
                        <i class='fas fa-trash'></i>
                    </button>
                </div>
            `;
        }).join('');
    },
    
    checkAlerts() {
        let triggeredCount = 0;
        
        this.alerts.forEach(alert => {
            if (alert.triggered) return;
            
            const watchlistItem = this.watchlist.find(w => w.symbol === alert.symbol);
            if (!watchlistItem || !watchlistItem.currentPrice) return;
            
            const currentPrice = watchlistItem.currentPrice;
            let shouldTrigger = false;
            
            if (alert.type === 'above' && currentPrice >= alert.targetPrice) {
                shouldTrigger = true;
            } else if (alert.type === 'below' && currentPrice <= alert.targetPrice) {
                shouldTrigger = true;
            }
            
            if (shouldTrigger) {
                alert.triggered = true;
                triggeredCount++;
                
                const message = `🔔 ${alert.symbol} is now ${alert.type} ${this.formatCurrency(alert.targetPrice)}! Current: ${this.formatCurrency(currentPrice)}`;
                this.showNotification(message, 'warning', true);
            }
        });
        
        if (triggeredCount > 0) {
            this.saveAlertsToStorage();
            this.autoSave();
            this.renderAlerts();
        }
    },
    
    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                this.notificationPermission = permission === 'granted';
            });
        } else if ('Notification' in window && Notification.permission === 'granted') {
            this.notificationPermission = true;
        }
    }
    
});

// ========== COMPARISON FUNCTIONS (OPTIMISÉ) ==========

Object.assign(MarketData, {
    
    openComparisonModal() {
        const modal = document.getElementById('modalAddComparison');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    },
    
    closeComparisonModal() {
        const modal = document.getElementById('modalAddComparison');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
        
        const input = document.getElementById('comparisonSymbols');
        if (input) {
            input.value = '';
        }
    },
    
    async loadComparison() {
        const input = document.getElementById('comparisonSymbols');
        if (!input) return;
        
        const symbols = input.value.split(',')
            .map(s => s.trim().toUpperCase())
            .filter(s => s.length > 0);
        
        if (symbols.length < 2) {
            alert('Please enter at least 2 symbols to compare');
            return;
        }
        
        if (symbols.length > 5) {
            alert('Maximum 5 symbols allowed');
            return;
        }
        
        this.closeComparisonModal();
        this.comparisonSymbols = symbols;
        this.comparisonData = {};
        
        this.autoSave();
        
        this.showNotification(`Loading ${symbols.length} stocks for comparison...`, 'info');
        
        const results = [];
        for (const symbol of symbols) {
            try {
                await this.fetchComparisonData(symbol);
                results.push({ status: 'fulfilled' });
            } catch (error) {
                console.error(`Failed to load ${symbol}:`, error);
                results.push({ status: 'rejected' });
            }
        }
        
        const successCount = results.filter(r => r.status === 'fulfilled').length;
        
        if (successCount < 2) {
            alert('Failed to load enough stocks for comparison. Please try again.');
            return;
        }
        
        this.displayComparison();
        this.showNotification(`✅ Comparison loaded for ${successCount} stocks`, 'success');
    },
    
    async loadComparisonFromSymbols(symbols) {
        if (!symbols || symbols.length < 2) return;
        
        this.comparisonSymbols = symbols;
        this.comparisonData = {};
        
        this.showNotification(`Loading comparison...`, 'info');
        
        const results = [];
        for (const symbol of symbols) {
            try {
                await this.fetchComparisonData(symbol);
                results.push({ status: 'fulfilled' });
            } catch (error) {
                console.error(`Failed to load ${symbol}:`, error);
                results.push({ status: 'rejected' });
            }
        }
        
        const successCount = results.filter(r => r.status === 'fulfilled').length;
        
        if (successCount >= 2) {
            this.displayComparison();
        }
    },
    
    async fetchComparisonData(symbol) {
        const timeSeries = await this.apiRequest(() => this.getTimeSeriesForPeriod(symbol, this.currentPeriod), 'normal');
        const quote = await this.apiRequest(() => this.apiClient.getQuote(symbol), 'normal');
        
        this.comparisonData[symbol] = {
            prices: timeSeries.data,
            quote: quote
        };
    },
    
    displayComparison() {
        const emptyEl = document.getElementById('comparisonEmpty');
        const containerEl = document.getElementById('comparisonContainer');
        
        if (emptyEl) emptyEl.classList.add('hidden');
        if (containerEl) containerEl.classList.remove('hidden');
        
        this.renderComparisonChips();
        this.createComparisonChart();
        this.createComparisonTable();
    },
    
    renderComparisonChips() {
        const container = document.getElementById('comparisonStocks');
        if (!container) return;
        
        container.innerHTML = this.comparisonSymbols.map((symbol, index) => {
            const data = this.comparisonData[symbol];
            if (!data) return '';
            
            const prices = data.prices;
            const firstPrice = prices[0].close;
            const lastPrice = prices[prices.length - 1].close;
            const performance = ((lastPrice - firstPrice) / firstPrice) * 100;
            const perfClass = performance >= 0 ? 'positive' : 'negative';
            const perfSign = performance >= 0 ? '+' : '';
            
            return `
                <div class='comparison-stock-chip' style='border-color: ${this.comparisonColors[index]}'>
                    <span class='symbol'>${this.escapeHtml(symbol)}</span>
                    <span class='performance ${perfClass}'>${perfSign}${performance.toFixed(2)}%</span>
                    <button class='remove' onclick='MarketData.removeFromComparison("${symbol}")' aria-label='Remove ${symbol}'>
                        <i class='fas fa-times'></i>
                    </button>
                </div>
            `;
        }).join('');
    },
    
    removeFromComparison(symbol) {
        this.comparisonSymbols = this.comparisonSymbols.filter(s => s !== symbol);
        delete this.comparisonData[symbol];
        
        this.autoSave();
        
        if (this.comparisonSymbols.length < 2) {
            this.clearComparison();
        } else {
            this.displayComparison();
        }
    },
    
    clearComparison() {
        if (this.comparisonSymbols.length > 0 && !confirm('Clear comparison?')) {
            return;
        }
        
        this.comparisonSymbols = [];
        this.comparisonData = {};
        
        this.autoSave();
        
        const emptyEl = document.getElementById('comparisonEmpty');
        const containerEl = document.getElementById('comparisonContainer');
        
        if (emptyEl) emptyEl.classList.remove('hidden');
        if (containerEl) containerEl.classList.add('hidden');
        
        if (this.charts.comparison) {
            this.charts.comparison.destroy();
            this.charts.comparison = null;
        }
    },
    
    calculateMaxDrawdown(prices) {
        let maxDrawdown = 0;
        let peak = prices[0];
        
        for (let i = 1; i < prices.length; i++) {
            if (prices[i] > peak) {
                peak = prices[i];
            }
            const drawdown = ((peak - prices[i]) / peak) * 100;
            if (drawdown > maxDrawdown) {
                maxDrawdown = drawdown;
            }
        }
        
        return maxDrawdown;
    },
    
    calculateVolatilityFromPrices(prices) {
        const returns = [];
        for (let i = 1; i < prices.length; i++) {
            const ret = (prices[i] - prices[i - 1]) / prices[i - 1];
            returns.push(ret);
        }
        
        const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
        const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
        const stdDev = Math.sqrt(variance);
        
        return stdDev * Math.sqrt(252) * 100;
    }
    
});

// ========== PORTFOLIO MANAGEMENT (CLOUD) ==========

Object.assign(MarketData, {
    
    async loadCurrentPortfolio() {
        console.log('📥 Loading current portfolio...');
        
        const currentPortfolioName = window.PortfolioManager 
            ? window.PortfolioManager.getCurrentPortfolio() 
            : 'default';
        
        let loadedFromCloud = false;
        
        if (window.PortfolioManager) {
            const portfolioData = await window.PortfolioManager.loadFromCloud(currentPortfolioName);
            
            if (portfolioData) {
                console.log('✅ Loaded portfolio from cloud');
                this.loadPortfolioData(portfolioData);
                loadedFromCloud = true;
            }
        }
        
        if (!loadedFromCloud) {
            console.log('⚠️ Loading from localStorage (fallback)');
            this.loadWatchlistFromStorage();
            this.loadAlertsFromStorage();
        }
        
        if (this.watchlist.length > 0) {
            this.renderWatchlist();
            this.refreshWatchlist();
        }
        
        if (this.alerts.length > 0) {
            this.renderAlerts();
        }
    },
    
    loadPortfolioData(portfolioData) {
        if (!portfolioData) return;
        
        console.log('📥 Loading portfolio data...');
        
        this.watchlist = portfolioData.watchlist || [];
        this.alerts = portfolioData.alerts || [];
        this.comparisonSymbols = portfolioData.comparisonSymbols || [];
        
        this.renderWatchlist();
        this.renderAlerts();
        
        if (this.comparisonSymbols.length >= 2) {
            this.loadComparisonFromSymbols(this.comparisonSymbols);
        }
        
        this.showNotification('Portfolio loaded successfully!', 'success');
    },
    
    getCurrentPortfolioData() {
        return {
            watchlist: this.watchlist,
            alerts: this.alerts,
            comparisonSymbols: this.comparisonSymbols,
            timestamp: Date.now()
        };
    },
    
    async saveCurrentPortfolio() {
        const portfolioData = this.getCurrentPortfolioData();
        
        const currentPortfolioName = window.PortfolioManager 
            ? window.PortfolioManager.getCurrentPortfolio() 
            : 'default';
        
        if (window.PortfolioManager) {
            const success = await window.PortfolioManager.saveToCloud(currentPortfolioName, portfolioData);
            
            if (!success) {
                this.saveWatchlistToStorage();
                this.saveAlertsToStorage();
                this.showNotification('Saved locally (cloud save failed)', 'warning');
            }
        } else {
            this.saveWatchlistToStorage();
            this.saveAlertsToStorage();
            this.showNotification('Portfolio saved locally!', 'success');
        }
    },
    
    autoSave: (() => {
        let timeout;
        return function() {
            clearTimeout(timeout);
            timeout = setTimeout(async () => {
                await MarketData.saveCurrentPortfolio();
            }, 2000);
        };
    })(),
    
    exportPortfolioJSON() {
        const portfolioData = this.getCurrentPortfolioData();
        
        const exportData = {
            portfolioName: window.PortfolioManager 
                ? window.PortfolioManager.getCurrentPortfolio() 
                : 'default',
            exportDate: new Date().toISOString(),
            data: portfolioData
        };
        
        const json = JSON.stringify(exportData, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `market_portfolio_${exportData.portfolioName}_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showNotification('Portfolio exported successfully!', 'success');
    },
    
    importPortfolioJSON() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const imported = JSON.parse(event.target.result);
                    
                    let portfolioData;
                    if (imported.data) {
                        portfolioData = imported.data;
                    } else {
                        portfolioData = imported;
                    }
                    
                    this.loadPortfolioData(portfolioData);
                    await this.saveCurrentPortfolio();
                    
                    this.showNotification('Portfolio imported successfully!', 'success');
                    
                } catch (err) {
                    console.error('Import error:', err);
                    this.showNotification('Import error: ' + err.message, 'error');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    },
    
    async refreshPortfoliosList() {
        console.log('🔄 Refreshing portfolios list...');
        
        const container = document.getElementById('portfoliosListContainer');
        if (!container) {
            console.error('❌ portfoliosListContainer not found');
            return;
        }
        
        container.innerHTML = `
            <div class="loading-simulations">
                <i class="fas fa-spinner fa-spin"></i> Loading portfolios...
            </div>
        `;
        
        try {
            const portfolios = await PortfolioManager.listPortfolios();
            const currentPortfolio = PortfolioManager.getCurrentPortfolio();
            
            console.log('📋 Portfolios loaded:', portfolios.length);
            
            if (portfolios.length === 0) {
                container.innerHTML = `
                    <div class="no-portfolios">
                        <i class="fas fa-folder-open"></i>
                        <p>No portfolios found</p>
                        <p class="hint">Click "New Portfolio" to create one</p>
                    </div>
                `;
                return;
            }
            
            const portfoliosList = portfolios.map(portfolio => {
                const isActive = portfolio.name === currentPortfolio;
                const createdDate = portfolio.createdAt 
                    ? (typeof portfolio.createdAt === 'string' 
                        ? new Date(portfolio.createdAt).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        })
                        : portfolio.createdAt.toDate 
                            ? portfolio.createdAt.toDate().toLocaleDateString('fr-FR', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            })
                            : 'N/A')
                    : 'N/A';
                
                return `
                    <div class="simulation-item ${isActive ? 'active' : ''}" data-portfolio="${portfolio.name}">
                        <div class="simulation-info">
                            <div class="simulation-name">
                                <i class="fas fa-folder"></i>
                                ${this.escapeHtml(portfolio.name)}
                                ${portfolio.name === 'default' ? '<span class="badge-default">DEFAULT</span>' : ''}
                            </div>
                            <div class="simulation-meta">
                                <span class="creation-date">
                                    <i class="far fa-calendar"></i>
                                    Created: ${createdDate}
                                </span>
                                <span>
                                    <i class="fas fa-star"></i>
                                    ${portfolio.watchlist?.length || 0} stocks
                                </span>
                                <span>
                                    <i class="fas fa-bell"></i>
                                    ${portfolio.alerts?.length || 0} alerts
                                </span>
                            </div>
                        </div>
                        <div class="simulation-actions">
                            ${!isActive ? `
                                <button class="btn-sm btn-primary" onclick="MarketData.loadPortfolioFromModal('${portfolio.name}')">
                                    <i class="fas fa-folder-open"></i> Load
                                </button>
                            ` : `
                                <button class="btn-sm btn-success" disabled>
                                    <i class="fas fa-check"></i> Active
                                </button>
                            `}
                            ${portfolio.name !== 'default' ? `
                                <button class="btn-sm btn-secondary" onclick="MarketData.renamePortfolio('${portfolio.name}')">
                                    <i class="fas fa-edit"></i> Rename
                                </button>
                                <button class="btn-sm btn-danger" onclick="MarketData.deletePortfolioFromModal('${portfolio.name}')">
                                    <i class="fas fa-trash"></i> Delete
                                </button>
                            ` : ''}
                        </div>
                    </div>
                `;
            }).join('');
            
            container.innerHTML = `
                <div class="simulations-list">
                    ${portfoliosList}
                </div>
            `;
            
            console.log('✅ Portfolios list displayed');
            
        } catch (error) {
            console.error('❌ Error loading portfolios:', error);
            container.innerHTML = `
                <div class="no-portfolios">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error loading portfolios</p>
                    <p class="hint">${this.escapeHtml(error.message)}</p>
                </div>
            `;
        }
    },
    
    async loadPortfolioFromModal(portfolioName) {
        console.log(`📂 Loading portfolio "${portfolioName}" from modal...`);
        
        try {
            await PortfolioManager.switchPortfolio(portfolioName);
            await this.loadCurrentPortfolio();
            await this.refreshPortfoliosList();
            
            this.showNotification(`Portfolio "${portfolioName}" loaded!`, 'success');
            
        } catch (error) {
            console.error('❌ Error loading portfolio:', error);
            this.showNotification('Error loading portfolio: ' + error.message, 'error');
        }
    },
    
    async deletePortfolioFromModal(portfolioName) {
        if (!confirm(`Are you sure you want to delete portfolio "${portfolioName}"?`)) {
            return;
        }
        
        console.log(`🗑️ Deleting portfolio "${portfolioName}"...`);
        
        try {
            await PortfolioManager.deletePortfolio(portfolioName);
            await this.refreshPortfoliosList();
            
            this.showNotification(`Portfolio "${portfolioName}" deleted`, 'success');
            
        } catch (error) {
            console.error('❌ Error deleting portfolio:', error);
            this.showNotification('Error deleting portfolio: ' + error.message, 'error');
        }
    },
    
    async renamePortfolio(oldName) {
        const newName = prompt(`Rename portfolio "${oldName}" to:`, oldName);
        
        if (!newName || newName.trim() === '' || newName === oldName) {
            return;
        }
        
        console.log(`✏️ Renaming portfolio "${oldName}" to "${newName}"...`);
        
        try {
            const data = await PortfolioManager.loadFromCloud(oldName);
            data.name = newName;
            await PortfolioManager.saveToCloud(newName, data);
            await PortfolioManager.deletePortfolio(oldName);
            
            if (PortfolioManager.getCurrentPortfolio() === oldName) {
                await PortfolioManager.switchPortfolio(newName);
            }
            
            await this.refreshPortfoliosList();
            
            this.showNotification(`Portfolio renamed to "${newName}"`, 'success');
            
        } catch (error) {
            console.error('❌ Error renaming portfolio:', error);
            this.showNotification('Error renaming portfolio: ' + error.message, 'error');
        }
    },
    
    async openPortfoliosModal() {
        console.log('📂 Opening portfolios modal...');
        
        const modal = document.getElementById('portfoliosModal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            await this.refreshPortfoliosList();
        } else {
            console.error('❌ portfoliosModal not found');
        }
    }
    
});

// ========== EVENT LISTENERS ==========

Object.assign(MarketData, {
    
    setupEventListeners() {
        const input = document.getElementById('symbolInput');
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.searchStock();
                }
            });
        }
        
        const updateChart = () => this.updateChart();
        
        document.getElementById('toggleSMA')?.addEventListener('change', updateChart);
        document.getElementById('toggleEMA')?.addEventListener('change', updateChart);
        document.getElementById('toggleBB')?.addEventListener('change', updateChart);
        document.getElementById('toggleVolume')?.addEventListener('change', updateChart);
    }
    
});

// ========== DISPLAY STOCK OVERVIEW ==========

Object.assign(MarketData, {
    
    displayStockOverview() {
        const quote = this.stockData.quote;
        
        document.getElementById('stockName').textContent = quote.name || this.currentSymbol;
        document.getElementById('stockSymbol').textContent = quote.symbol || this.currentSymbol;
        
        const price = quote.price;
        const change = quote.change;
        const changePercent = quote.percentChange;
        
        document.getElementById('currentPrice').textContent = this.formatCurrency(price);
        
        const priceChangeEl = document.getElementById('priceChange');
        const changeText = `${change >= 0 ? '+' : ''}${this.formatCurrency(change)} (${change >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)`;
        priceChangeEl.textContent = changeText;
        priceChangeEl.className = change >= 0 ? 'price-change positive' : 'price-change negative';
        
        document.getElementById('statOpen').textContent = this.formatCurrency(quote.open);
        document.getElementById('statHigh').textContent = this.formatCurrency(quote.high);
        document.getElementById('statLow').textContent = this.formatCurrency(quote.low);
        document.getElementById('statVolume').textContent = this.formatVolume(quote.volume);
        
        if (this.statisticsData) {
            document.getElementById('statMarketCap').textContent = this.formatLargeNumber(this.statisticsData.marketCap);
            document.getElementById('statPE').textContent = this.formatRatio(this.statisticsData.trailingPE);
        } else {
            document.getElementById('statMarketCap').textContent = 'N/A';
            document.getElementById('statPE').textContent = 'N/A';
        }
        
        document.getElementById('stockOverview').classList.remove('hidden');
    },
    
    displayCompanyProfile() {
        let profileSection = document.getElementById('companyProfileSection');
        
        if (!profileSection) {
            const stockOverview = document.getElementById('stockOverview');
            if (!stockOverview) return;
            
            profileSection = document.createElement('section');
            profileSection.id = 'companyProfileSection';
            profileSection.className = 'company-profile-section card hidden';
            stockOverview.insertAdjacentElement('afterend', profileSection);
        }
        
        if (!this.profileData && !this.statisticsData) {
            profileSection.classList.add('hidden');
            return;
        }
        
        let html = `
            <div class='card-header'>
                <h2 class='card-title'>
                    <i class='fas fa-building'></i> Company Information & Statistics
                </h2>
            </div>
            <div class='card-body'>
        `;
        
        if (this.profileData || this.logoUrl) {
            html += `
                <div class='company-accordion'>
                    <div class='accordion-header' onclick='MarketData.toggleAccordion(this)'>
                        <span><i class='fas fa-building'></i> Company Information</span>
                        <i class='fas fa-chevron-down'></i>
                    </div>
                    <div class='accordion-content'>
                        <div class='accordion-body'>
            `;

            // Logo désactivé pour économiser l'espace
            // if (this.logoUrl) {
            //     html += `
            //         <div class='company-logo'>
            //             <img src='${this.escapeHtml(this.logoUrl)}' alt='${this.escapeHtml(this.currentSymbol)} logo' onerror='this.style.display="none"'>
            //         </div>
            //     `;
            // }
            
            if (this.profileData) {
                html += `<div class='company-info-grid'>`;
                
                if (this.profileData.sector) {
                    html += `
                        <div class='info-item'>
                            <span class='info-label'><i class='fas fa-industry'></i> Sector</span>
                            <span class='info-value'>${this.escapeHtml(this.profileData.sector)}</span>
                        </div>`;
                }
                
                if (this.profileData.industry) {
                    html += `
                        <div class='info-item'>
                            <span class='info-label'><i class='fas fa-cogs'></i> Industry</span>
                            <span class='info-value'>${this.escapeHtml(this.profileData.industry)}</span>
                        </div>`;
                }
                
                if (this.profileData.country) {
                    html += `
                        <div class='info-item'>
                            <span class='info-label'><i class='fas fa-globe'></i> Country</span>
                            <span class='info-value'>${this.escapeHtml(this.profileData.country)}</span>
                        </div>`;
                }
                
                if (this.profileData.employees) {
                    html += `
                        <div class='info-item'>
                            <span class='info-label'><i class='fas fa-users'></i> Employees</span>
                            <span class='info-value'>${this.formatNumber(this.profileData.employees)}</span>
                        </div>`;
                }
                
                html += `</div>`;
                
                if (this.profileData.description && this.profileData.description !== 'No description available') {
                    html += `
                        <div class='company-description'>
                            <h4><i class='fas fa-info-circle'></i> About</h4>
                            <p>${this.escapeHtml(this.profileData.description)}</p>
                        </div>
                    `;
                }
            }
            
            html += `
                        </div>
                    </div>
                </div>
            `;
        }
        
        if (this.statisticsData) {
            html += `
                <div class='company-accordion'>
                    <div class='accordion-header' onclick='MarketData.toggleAccordion(this)'>
                        <span><i class='fas fa-chart-bar'></i> Fundamental Statistics</span>
                        <i class='fas fa-chevron-down'></i>
                    </div>
                    <div class='accordion-content'>
                        <div class='accordion-body'>
                            <div class='stats-category'>
                                <h4>Valuation Metrics</h4>
                                <div class='stats-grid'>
                                    ${this.createStatItem('Market Cap', this.formatLargeNumber(this.statisticsData.marketCap))}
                                    ${this.createStatItem('P/E Ratio', this.formatRatio(this.statisticsData.trailingPE))}
                                    ${this.createStatItem('Price/Book', this.formatRatio(this.statisticsData.priceToBook))}
                                    ${this.createStatItem('EV/Revenue', this.formatRatio(this.statisticsData.evToRevenue))}
                                </div>
                            </div>
                            
                            <div class='stats-category'>
                                <h4>Profitability</h4>
                                <div class='stats-grid'>
                                    ${this.createStatItem('Profit Margin', this.formatPercent(this.statisticsData.profitMargin))}
                                    ${this.createStatItem('ROE', this.formatPercent(this.statisticsData.returnOnEquity))}
                                    ${this.createStatItem('Revenue', this.formatLargeNumber(this.statisticsData.revenue))}
                                    ${this.createStatItem('EPS', this.formatCurrency(this.statisticsData.eps))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        html += `</div>`;
        
        profileSection.innerHTML = html;
        profileSection.classList.remove('hidden');
    },
    
    createStatItem(label, value) {
        if (!value || value === 'N/A' || value === '$0' || value === '0' || value === '0%') {
            return '';
        }
        return `
            <div class='stat-box'>
                <div class='label'>${this.escapeHtml(label)}</div>
                <div class='value'>${value}</div>
            </div>
        `;
    },
    
    displayResults() {
        this.createPriceChart();
        this.createRSIChart();
        this.createMACDChart();
        this.displayTradingSignals();
        this.displayKeyStatistics();
        
        document.getElementById('resultsPanel').classList.remove('hidden');
    }
    
});

// ========== CHARTS - PRICE CHART ==========

Object.assign(MarketData, {
    
    createPriceChart() {
        const prices = this.stockData.prices;
        const ohlc = prices.map(p => [p.timestamp, p.open, p.high, p.low, p.close]);
        const volume = prices.map(p => [p.timestamp, p.volume]);
        
        const showSMA = document.getElementById('toggleSMA')?.checked !== false;
        const showEMA = document.getElementById('toggleEMA')?.checked || false;
        const showBB = document.getElementById('toggleBB')?.checked !== false;
        const showVolume = document.getElementById('toggleVolume')?.checked !== false;
        
        const series = [
            {
                type: 'candlestick',
                name: this.currentSymbol,
                data: ohlc,
                id: 'price',
                color: '#ef4444',
                upColor: '#10b981'
            }
        ];
        
        if (showSMA) {
            series.push({
                type: 'sma',
                linkedTo: 'price',
                params: { period: 20 },
                color: '#1e5eeb',
                lineWidth: 2,
                name: 'SMA 20'
            });
            series.push({
                type: 'sma',
                linkedTo: 'price',
                params: { period: 50 },
                color: '#8b5cf6',
                lineWidth: 2,
                name: 'SMA 50'
            });
        }
        
        if (showEMA) {
            series.push({
                type: 'ema',
                linkedTo: 'price',
                params: { period: 12 },
                color: '#06b6d4',
                lineWidth: 2,
                name: 'EMA 12'
            });
            series.push({
                type: 'ema',
                linkedTo: 'price',
                params: { period: 26 },
                color: '#14b8a6',
                lineWidth: 2,
                name: 'EMA 26'
            });
        }
        
        if (showBB) {
            series.push({
                type: 'bb',
                linkedTo: 'price',
                color: '#64748b',
                fillOpacity: 0.05,
                lineWidth: 1,
                name: 'Bollinger Bands'
            });
        }
        
        if (showVolume) {
            series.push({
                type: 'column',
                name: 'Volume',
                data: volume,
                yAxis: 1,
                color: '#cbd5e1'
            });
        }
        
        if (this.charts.price) {
            this.charts.price.destroy();
        }
        
        this.charts.price = Highcharts.stockChart('priceChart', {
            chart: {
                height: 600,
                borderRadius: 12,
                style: {
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
                }
            },
            title: {
                text: `${this.currentSymbol} Price Chart`,
                style: { 
                    color: '#0f172a',
                    fontWeight: '600',
                    fontSize: '1.25rem'
                }
            },
            rangeSelector: {
                selected: 1,
                buttonTheme: {
                    fill: 'white',
                    stroke: '#e2e8f0',
                    'stroke-width': 1,
                    r: 6,
                    style: {
                        color: '#475569',
                        fontWeight: '500'
                    },
                    states: {
                        hover: {
                            fill: '#f1f5f9'
                        },
                        select: {
                            fill: '#1e5eeb',
                            style: {
                                color: 'white'
                            }
                        }
                    }
                }
            },
            yAxis: [{
                labels: {
                    align: 'right',
                    x: -3,
                    style: {
                        color: '#475569'
                    }
                },
                title: {
                    text: 'Price',
                    style: {
                        color: '#475569'
                    }
                },
                height: '75%',
                lineWidth: 1,
                gridLineColor: '#f1f5f9'
            }, {
                labels: {
                    align: 'right',
                    x: -3,
                    style: {
                        color: '#475569'
                    }
                },
                title: {
                    text: 'Volume',
                    style: {
                        color: '#475569'
                    }
                },
                top: '80%',
                height: '20%',
                offset: 0,
                lineWidth: 1,
                gridLineColor: '#f1f5f9'
            }],
            xAxis: {
                gridLineColor: '#f1f5f9'
            },
            tooltip: {
                split: true,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#e2e8f0',
                backgroundColor: 'white',
                shadow: {
                    color: 'rgba(0, 0, 0, 0.1)',
                    offsetX: 0,
                    offsetY: 2,
                    width: 4
                }
            },
            series: series,
            credits: { enabled: false }
        });
    },
    
    createRSIChart() {
        const prices = this.stockData.prices;
        const rsiData = this.calculateRSIArray(prices, 14);
        
        if (this.charts.rsi) {
            this.charts.rsi.destroy();
        }
        
        this.charts.rsi = Highcharts.chart('rsiChart', {
            chart: {
                borderRadius: 12,
                height: 400,
                style: {
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
                }
            },
            title: {
                text: 'RSI Indicator',
                style: { 
                    color: '#0f172a',
                    fontWeight: '600',
                    fontSize: '1.125rem'
                }
            },
            xAxis: {
                type: 'datetime',
                crosshair: true,
                gridLineColor: '#f1f5f9'
            },
            yAxis: {
                title: { 
                    text: 'RSI',
                    style: { color: '#475569' }
                },
                plotLines: [{
                    value: 70,
                    color: '#ef4444',
                    dashStyle: 'Dash',
                    width: 2,
                    label: {
                        text: 'Overbought (70)',
                        align: 'right',
                        style: { color: '#ef4444', fontWeight: '600' }
                    }
                }, {
                    value: 30,
                    color: '#10b981',
                    dashStyle: 'Dash',
                    width: 2,
                    label: {
                        text: 'Oversold (30)',
                        align: 'right',
                        style: { color: '#10b981', fontWeight: '600' }
                    }
                }, {
                    value: 50,
                    color: '#94a3b8',
                    dashStyle: 'Dot',
                    width: 1,
                    label: {
                        text: 'Neutral (50)',
                        align: 'right',
                        style: { color: '#94a3b8' }
                    }
                }],
                min: 0,
                max: 100,
                gridLineColor: '#f1f5f9'
            },
            tooltip: {
                borderRadius: 8,
                crosshairs: true,
                shared: true,
                valueDecimals: 2
            },
            plotOptions: {
                area: {
                    fillColor: {
                        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                        stops: [
                            [0, 'rgba(30, 94, 235, 0.3)'],
                            [1, 'rgba(30, 94, 235, 0.05)']
                        ]
                    },
                    lineWidth: 2,
                    marker: {
                        enabled: false
                    },
                    threshold: null
                }
            },
            series: [{
                type: 'area',
                name: 'RSI (14)',
                data: rsiData,
                color: '#1e5eeb',
                zones: [{
                    value: 30,
                    color: '#10b981'
                }, {
                    value: 70,
                    color: '#f59e0b'
                }, {
                    color: '#ef4444'
                }]
            }],
            credits: { enabled: false }
        });
    },
    
    createMACDChart() {
        const prices = this.stockData.prices;
        const macdData = this.calculateMACDArray(prices);
        
        if (this.charts.macd) {
            this.charts.macd.destroy();
        }
        
        this.charts.macd = Highcharts.chart('macdChart', {
            chart: {
                borderRadius: 12,
                height: 400,
                style: {
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
                }
            },
            title: {
                text: 'MACD Indicator',
                style: { 
                    color: '#0f172a',
                    fontWeight: '600',
                    fontSize: '1.125rem'
                }
            },
            xAxis: {
                type: 'datetime',
                crosshair: true,
                gridLineColor: '#f1f5f9'
            },
            yAxis: {
                title: { 
                    text: 'MACD',
                    style: { color: '#475569' }
                },
                plotLines: [{
                    value: 0,
                    color: '#94a3b8',
                    dashStyle: 'Dash',
                    width: 2,
                    label: {
                        text: 'Zero Line',
                        align: 'right',
                        style: { color: '#94a3b8' }
                    }
                }],
                gridLineColor: '#f1f5f9'
            },
            tooltip: {
                borderRadius: 8,
                crosshairs: true,
                shared: true,
                valueDecimals: 2
            },
            plotOptions: {
                column: {
                    borderRadius: '25%'
                }
            },
            series: [{
                type: 'line',
                name: 'MACD Line',
                data: macdData.macd,
                color: '#1e5eeb',
                lineWidth: 2,
                marker: {
                    enabled: false
                }
            }, {
                type: 'line',
                name: 'Signal Line',
                data: macdData.signal,
                color: '#8b5cf6',
                lineWidth: 2,
                marker: {
                    enabled: false
                }
            }, {
                type: 'column',
                name: 'Histogram',
                data: macdData.histogram,
                color: '#64748b',
                pointWidth: 3
            }],
            credits: { enabled: false }
        });
    },
    
    createComparisonChart() {
        const series = [];
        
        this.comparisonSymbols.forEach((symbol, index) => {
            const data = this.comparisonData[symbol];
            if (!data) return;
            
            const firstPrice = data.prices[0].close;
            const normalizedData = data.prices.map(p => [
                p.timestamp,
                (p.close / firstPrice) * 100
            ]);
            
            series.push({
                name: symbol,
                data: normalizedData,
                color: this.comparisonColors[index],
                lineWidth: 2,
                marker: {
                    enabled: false,
                    radius: 3
                }
            });
        });
        
        if (this.charts.comparison) {
            this.charts.comparison.destroy();
        }
        
        this.charts.comparison = Highcharts.stockChart('comparisonChart', {
            chart: {
                height: 500,
                borderRadius: 12,
                style: {
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
                }
            },
            title: {
                text: 'Stock Performance Comparison (Normalized)',
                style: { 
                    color: '#0f172a',
                    fontWeight: '600',
                    fontSize: '1.25rem'
                }
            },
            subtitle: {
                text: 'All stocks start at 100 for easy comparison',
                style: { 
                    color: '#64748b',
                    fontSize: '0.875rem'
                }
            },
            rangeSelector: {
                selected: 1,
                buttonTheme: {
                    fill: 'white',
                    stroke: '#e2e8f0',
                    'stroke-width': 1,
                    r: 6,
                    style: {
                        color: '#475569',
                        fontWeight: '500'
                    },
                    states: {
                        hover: {
                            fill: '#f1f5f9'
                        },
                        select: {
                            fill: '#1e5eeb',
                            style: {
                                color: 'white'
                            }
                        }
                    }
                }
            },
            yAxis: {
                title: {
                    text: 'Performance (Base 100)',
                    style: { color: '#475569' }
                },
                plotLines: [{
                    value: 100,
                    color: '#94a3b8',
                    dashStyle: 'Dash',
                    width: 1,
                    label: {
                        text: 'Start (100)',
                        align: 'right',
                        style: { color: '#94a3b8' }
                    }
                }],
                gridLineColor: '#f1f5f9'
            },
            xAxis: {
                gridLineColor: '#f1f5f9'
            },
            tooltip: {
                shared: true,
                crosshairs: true,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#e2e8f0',
                backgroundColor: 'white',
                shadow: {
                    color: 'rgba(0, 0, 0, 0.1)',
                    offsetX: 0,
                    offsetY: 2,
                    width: 4
                },
                valueDecimals: 2,
                pointFormatter: function() {
                    const change = this.y - 100;
                    const changeSign = change >= 0 ? '+' : '';
                    const color = change >= 0 ? '#10b981' : '#ef4444';
                    return `<span style="color:${this.color}">●</span> ${this.series.name}: <b>${this.y.toFixed(2)}</b> (<span style="color:${color}">${changeSign}${change.toFixed(2)}%</span>)<br/>`;
                }
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
    
    createComparisonTable() {
        const metrics = [];
        
        this.comparisonSymbols.forEach(symbol => {
            const data = this.comparisonData[symbol];
            if (!data) return;
            
            const prices = data.prices.map(p => p.close);
            const firstPrice = prices[0];
            const lastPrice = prices[prices.length - 1];
            
            const totalReturn = ((lastPrice - firstPrice) / firstPrice) * 100;
            const volatility = this.calculateVolatilityFromPrices(prices);
            const maxPrice = Math.max(...prices);
            const minPrice = Math.min(...prices);
            const maxDrawdown = this.calculateMaxDrawdown(prices);
            const sharpeRatio = volatility > 0 ? totalReturn / volatility : 0;
            
            metrics.push({
                symbol: symbol,
                name: data.quote.name || symbol,
                currentPrice: data.quote.price,
                totalReturn: totalReturn,
                volatility: volatility,
                maxPrice: maxPrice,
                minPrice: minPrice,
                maxDrawdown: maxDrawdown,
                sharpeRatio: sharpeRatio
            });
        });
        
        const bestReturn = Math.max(...metrics.map(m => m.totalReturn));
        const worstReturn = Math.min(...metrics.map(m => m.totalReturn));
        const lowestVol = Math.min(...metrics.map(m => m.volatility));
        const bestSharpe = Math.max(...metrics.map(m => m.sharpeRatio));
        
        const tableHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Symbol</th>
                        <th>Current Price</th>
                        <th>Total Return</th>
                        <th>Volatility</th>
                        <th>Max Drawdown</th>
                        <th>Sharpe Ratio</th>
                    </tr>
                </thead>
                <tbody>
                    ${metrics.map(m => `
                        <tr>
                            <td class='metric-label'>${this.escapeHtml(m.symbol)}</td>
                            <td>${this.formatCurrency(m.currentPrice)}</td>
                            <td class='${m.totalReturn === bestReturn ? 'best-value' : m.totalReturn === worstReturn ? 'worst-value' : ''} ${m.totalReturn >= 0 ? 'value-positive' : 'value-negative'}'>
                                ${m.totalReturn >= 0 ? '+' : ''}${m.totalReturn.toFixed(2)}%
                            </td>
                            <td class='${m.volatility === lowestVol ? 'best-value' : ''} value-neutral'>
                                ${m.volatility.toFixed(2)}%
                            </td>
                            <td class='value-negative'>
                                -${m.maxDrawdown.toFixed(2)}%
                            </td>
                            <td class='${m.sharpeRatio === bestSharpe ? 'best-value' : ''} value-neutral'>
                                ${m.sharpeRatio.toFixed(2)}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
        const tableContainer = document.getElementById('comparisonTable');
        if (tableContainer) {
            tableContainer.innerHTML = tableHTML;
        }
    }
    
});

// ========== TECHNICAL INDICATORS CALCULATIONS ==========

Object.assign(MarketData, {
    
    calculateRSIArray(prices, period = 14) {
        const rsiData = [];
        
        if (prices.length < period + 1) {
            return rsiData;
        }
        
        let gains = 0;
        let losses = 0;
        
        for (let i = 1; i <= period; i++) {
            const change = prices[i].close - prices[i - 1].close;
            if (change > 0) gains += change;
            else losses += Math.abs(change);
        }
        
        let avgGain = gains / period;
        let avgLoss = losses / period;
        
        const rs = avgGain / avgLoss;
        const rsi = 100 - (100 / (1 + rs));
        rsiData.push([prices[period].timestamp, rsi]);
        
        for (let i = period + 1; i < prices.length; i++) {
            const change = prices[i].close - prices[i - 1].close;
            
            if (change > 0) {
                avgGain = ((avgGain * (period - 1)) + change) / period;
                avgLoss = (avgLoss * (period - 1)) / period;
            } else {
                avgGain = (avgGain * (period - 1)) / period;
                avgLoss = ((avgLoss * (period - 1)) + Math.abs(change)) / period;
            }
            
            const currentRS = avgGain / avgLoss;
            const currentRSI = 100 - (100 / (1 + currentRS));
            rsiData.push([prices[i].timestamp, currentRSI]);
        }
        
        return rsiData;
    },
    
    calculateRSI(prices, period = 14) {
        if (prices.length < period + 1) return null;
        
        let gains = 0;
        let losses = 0;
        
        for (let i = 1; i <= period; i++) {
            const change = prices[i].close - prices[i - 1].close;
            if (change > 0) gains += change;
            else losses += Math.abs(change);
        }
        
        let avgGain = gains / period;
        let avgLoss = losses / period;
        
        for (let i = period + 1; i < prices.length; i++) {
            const change = prices[i].close - prices[i - 1].close;
            if (change > 0) {
                avgGain = ((avgGain * (period - 1)) + change) / period;
                avgLoss = (avgLoss * (period - 1)) / period;
            } else {
                avgGain = (avgGain * (period - 1)) / period;
                avgLoss = ((avgLoss * (period - 1)) + Math.abs(change)) / period;
            }
        }
        
        const rs = avgGain / avgLoss;
        const rsi = 100 - (100 / (1 + rs));
        
        return rsi;
    },
    
    calculateMACDArray(prices, shortPeriod = 12, longPeriod = 26, signalPeriod = 9) {
        const closePrices = prices.map(p => p.close);
        
        const emaShort = this.calculateEMAArray(closePrices, shortPeriod);
        const emaLong = this.calculateEMAArray(closePrices, longPeriod);
        
        const macdLine = [];
        for (let i = longPeriod - 1; i < prices.length; i++) {
            const macdValue = emaShort[i] - emaLong[i];
            macdLine.push(macdValue);
        }
        
        const signalLine = this.calculateEMAArray(macdLine, signalPeriod);
        
        const macdData = [];
        const signalData = [];
        const histogramData = [];
        
        const startIndex = longPeriod - 1 + signalPeriod - 1;
        
        for (let i = startIndex; i < prices.length; i++) {
            const timestamp = prices[i].timestamp;
            const macdIndex = i - (longPeriod - 1);
            const signalIndex = macdIndex - (signalPeriod - 1);
            
            if (signalIndex >= 0 && signalIndex < signalLine.length) {
                const macdVal = macdLine[macdIndex];
                const signalVal = signalLine[signalIndex];
                const histogramVal = macdVal - signalVal;
                
                macdData.push([timestamp, macdVal]);
                signalData.push([timestamp, signalVal]);
                histogramData.push([timestamp, histogramVal]);
            }
        }
        
        return {
            macd: macdData,
            signal: signalData,
            histogram: histogramData
        };
    },
    
    calculateEMAArray(data, period) {
        const k = 2 / (period + 1);
        const emaArray = [];
        
        for (let i = 0; i < period - 1; i++) {
            emaArray[i] = undefined;
        }
        
        let sum = 0;
        for (let i = 0; i < period; i++) {
            sum += data[i];
        }
        emaArray[period - 1] = sum / period;
        
        for (let i = period; i < data.length; i++) {
            const ema = data[i] * k + emaArray[i - 1] * (1 - k);
            emaArray[i] = ema;
        }
        
        return emaArray;
    },
    
    displayTradingSignals() {
        const prices = this.stockData.prices;
        const currentPrice = prices[prices.length - 1].close;
        const rsi = this.calculateRSI(prices);
        
        const sma20 = this.calculateSMA(prices, 20);
        const sma50 = this.calculateSMA(prices, 50);
        
        const signals = [];
        
        let rsiSignal = 'neutral';
        let rsiStatus = 'Neutral';
        if (rsi < 30) {
            rsiSignal = 'bullish';
            rsiStatus = 'Oversold - Buy Signal';
        } else if (rsi > 70) {
            rsiSignal = 'bearish';
            rsiStatus = 'Overbought - Sell Signal';
        }
        
        signals.push({
            title: 'RSI Signal',
            value: rsi.toFixed(2),
            status: rsiStatus,
            type: rsiSignal
        });
        
        let maSignal = 'neutral';
        let maStatus = 'Neutral';
        if (currentPrice > sma20 && sma20 > sma50) {
            maSignal = 'bullish';
            maStatus = 'Bullish Trend';
        } else if (currentPrice < sma20 && sma20 < sma50) {
            maSignal = 'bearish';
            maStatus = 'Bearish Trend';
        }
        
        signals.push({
            title: 'Moving Average',
            value: currentPrice > sma20 ? 'Above SMA' : 'Below SMA',
            status: maStatus,
            type: maSignal
        });
        
        const priceChange = ((currentPrice - prices[0].close) / prices[0].close) * 100;
        signals.push({
            title: 'Overall Trend',
            value: `${priceChange > 0 ? '+' : ''}${priceChange.toFixed(2)}%`,
            status: priceChange > 5 ? 'Strong Uptrend' : priceChange < -5 ? 'Strong Downtrend' : 'Sideways',
            type: priceChange > 0 ? 'bullish' : priceChange < 0 ? 'bearish' : 'neutral'
        });
        
        const volatility = this.calculateVolatility(prices);
        signals.push({
            title: 'Volatility',
            value: `${volatility.toFixed(2)}%`,
            status: volatility > 3 ? 'High' : volatility > 1.5 ? 'Moderate' : 'Low',
            type: 'neutral'
        });
        
        const container = document.getElementById('tradingSignals');
        container.innerHTML = signals.map(signal => `
            <div class='signal-card ${signal.type}'>
                <div class='signal-title'>${this.escapeHtml(signal.title)}</div>
                <div class='signal-value'>${this.escapeHtml(signal.value)}</div>
                <div class='signal-status'>${this.escapeHtml(signal.status)}</div>
            </div>
        `).join('');
    },
    
    displayKeyStatistics() {
        const prices = this.stockData.prices;
        const quote = this.stockData.quote;
        
        const stats = [];
        
        const high52w = quote.fiftyTwoWeekHigh || Math.max(...prices.map(p => p.high));
        const low52w = quote.fiftyTwoWeekLow || Math.min(...prices.map(p => p.low));
        
        stats.push({ label: '52W High', value: this.formatCurrency(high52w) });
        stats.push({ label: '52W Low', value: this.formatCurrency(low52w) });
        
        const avgVolume = quote.averageVolume || (prices.reduce((sum, p) => sum + p.volume, 0) / prices.length);
        stats.push({ label: 'Avg Volume', value: this.formatVolume(avgVolume) });
        
        const volatility = this.calculateVolatility(prices);
        stats.push({ label: 'Volatility', value: `${volatility.toFixed(2)}%` });
        
        if (this.statisticsData && this.statisticsData.beta) {
            stats.push({ label: 'Beta', value: this.formatRatio(this.statisticsData.beta) });
        } else {
            stats.push({ label: 'Beta', value: 'N/A' });
        }
        
        const returns = [];
        for (let i = 1; i < prices.length; i++) {
            returns.push((prices[i].close - prices[i-1].close) / prices[i-1].close);
        }
        const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
        const annualizedReturn = avgReturn * 252 * 100;
        const sharpeRatio = volatility > 0 ? (annualizedReturn / volatility) : 0;
        
        stats.push({ label: 'Sharpe Ratio', value: sharpeRatio.toFixed(2) });
        
        const container = document.getElementById('keyStats');
        container.innerHTML = stats.map(stat => `
            <div class='stat-box'>
                <div class='label'>${this.escapeHtml(stat.label)}</div>
                <div class='value'>${this.escapeHtml(stat.value)}</div>
            </div>
        `).join('');
    },
    
    calculateSMA(prices, period) {
        if (prices.length < period) return 0;
        const sum = prices.slice(-period).reduce((acc, p) => acc + p.close, 0);
        return sum / period;
    },
    
    calculateVolatility(prices) {
        const returns = [];
        for (let i = 1; i < prices.length; i++) {
            const ret = (prices[i].close - prices[i - 1].close) / prices[i - 1].close;
            returns.push(ret);
        }
        
        const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
        const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
        const stdDev = Math.sqrt(variance);
        
        return stdDev * Math.sqrt(252) * 100;
    }
    
});

// ========== UTILITY FUNCTIONS ==========

Object.assign(MarketData, {
    
    formatCurrency(value) {
        if (!value && value !== 0) return 'N/A';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    },
    
    formatVolume(value) {
        if (!value) return 'N/A';
        if (value >= 1e9) return (value / 1e9).toFixed(2) + 'B';
        if (value >= 1e6) return (value / 1e6).toFixed(2) + 'M';
        if (value >= 1e3) return (value / 1e3).toFixed(2) + 'K';
        return value.toFixed(0);
    },
    
    formatLargeNumber(value) {
        if (!value) return 'N/A';
        if (value >= 1e12) return '$' + (value / 1e12).toFixed(2) + 'T';
        if (value >= 1e9) return '$' + (value / 1e9).toFixed(2) + 'B';
        if (value >= 1e6) return '$' + (value / 1e6).toFixed(2) + 'M';
        if (value >= 1e3) return '$' + (value / 1e3).toFixed(2) + 'K';
        return '$' + value.toFixed(0);
    },
    
    formatNumber(value) {
        if (!value || value === 'N/A') return 'N/A';
        if (typeof value === 'string') value = parseInt(value);
        return new Intl.NumberFormat('en-US').format(value);
    },
    
    formatPercent(value) {
        if (!value && value !== 0) return 'N/A';
        return (value * 100).toFixed(2) + '%';
    },
    
    formatRatio(value) {
        if (!value && value !== 0) return 'N/A';
        return value.toFixed(2);
    },
    
    showLoading(show) {
        const loader = document.getElementById('loadingIndicator');
        if (loader) {
            if (show) {
                loader.classList.remove('hidden');
            } else {
                loader.classList.add('hidden');
            }
        }
    },
    
    hideResults() {
        const overview = document.getElementById('stockOverview');
        const results = document.getElementById('resultsPanel');
        const profile = document.getElementById('companyProfileSection');
        
        if (overview) overview.classList.add('hidden');
        if (results) results.classList.add('hidden');
        if (profile) profile.classList.add('hidden');
    },
    
    updateLastUpdate() {
        const el = document.getElementById('lastUpdate');
        if (!el) return;
        
        const now = new Date();
        const formatted = now.toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        el.textContent = `Last update: ${formatted}`;
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
    MarketData.init();
});

// ========== EXPOSITION GLOBALE ==========
window.MarketData = MarketData;

console.log('✅ Market Data script loaded - OPTIMIZED with Rate Limiting & Cache - COMPLETE VERSION');