// ============================================
// FINANCE HUB - API CLIENT
// Client avec cache LocalStorage + SessionStorage
// ============================================

class FinanceAPIClient {
    constructor(config = {}) {
        this.baseURL = config.baseURL || APP_CONFIG.API_BASE_URL;
        this.cacheDuration = config.cacheDuration || APP_CONFIG.CACHE_DURATION;
        this.maxRetries = config.maxRetries || APP_CONFIG.MAX_RETRIES;
        this.retryDelay = config.retryDelay || APP_CONFIG.RETRY_DELAY;
        
        this.pendingRequests = 0;
        this.onLoadingChange = config.onLoadingChange || null;
        
        // Rate limiting
        this.rateLimitDelay = 200; // 200ms entre requêtes
        this.lastRequestTime = 0;
        
        // Compteur de requêtes (pour debugging quota)
        this.requestCount = parseInt(localStorage.getItem('api_request_count') || '0');
        this.resetCounterIfNeeded();
    }

    resetCounterIfNeeded() {
        const lastReset = localStorage.getItem('api_counter_reset_date');
        const today = new Date().toDateString();
        
        if (lastReset !== today) {
            this.requestCount = 0;
            localStorage.setItem('api_request_count', '0');
            localStorage.setItem('api_counter_reset_date', today);
            console.log('📊 Compteur de requêtes API réinitialisé pour aujourd\'hui');
        }
    }

    incrementRequestCount() {
        this.requestCount++;
        localStorage.setItem('api_request_count', this.requestCount.toString());
        console.log(`📡 Requêtes API aujourd'hui : ${this.requestCount}/800`);
        
        if (this.requestCount > 700) {
            console.warn('⚠️ ATTENTION : Proche de la limite quotidienne (800 req/jour)');
        }
    }

    // ============================================
    // CACHE MANAGEMENT (LocalStorage)
    // ============================================
    
    _getCacheKey(endpoint, params) {
        const sortedParams = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join('&');
        return `api_cache:${endpoint}:${sortedParams}`;
    }
    
    _getFromCache(cacheKey, maxAge) {
        try {
            const cached = localStorage.getItem(cacheKey);
            if (!cached) return null;
            
            const { data, timestamp } = JSON.parse(cached);
            const age = Date.now() - timestamp;
            
            if (age > maxAge) {
                localStorage.removeItem(cacheKey);
                return null;
            }
            
            console.log(`💾 LocalStorage Cache HIT: ${cacheKey} (age: ${Math.round(age/1000)}s)`);
            return data;
        } catch (e) {
            console.error('Cache read error:', e);
            return null;
        }
    }
    
    _setCache(cacheKey, data) {
        try {
            const cacheData = {
                data: data,
                timestamp: Date.now()
            };
            localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        } catch (e) {
            // Quota dépassé - supprimer les vieux caches
            console.warn('Cache quota exceeded, cleaning old entries');
            this._cleanOldCache();
            try {
                localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }));
            } catch (e2) {
                console.error('Cannot save to cache:', e2);
            }
        }
    }
    
    _cleanOldCache() {
        const keys = Object.keys(localStorage);
        const cacheKeys = keys.filter(k => k.startsWith('api_cache:'));
        
        // Trier par timestamp et supprimer les 50% les plus vieux
        const entries = cacheKeys.map(key => {
            try {
                const { timestamp } = JSON.parse(localStorage.getItem(key));
                return { key, timestamp };
            } catch {
                return { key, timestamp: 0 };
            }
        }).sort((a, b) => a.timestamp - b.timestamp);
        
        const toDelete = entries.slice(0, Math.floor(entries.length / 2));
        toDelete.forEach(entry => localStorage.removeItem(entry.key));
        
        console.log(`🗑️ Cleaned ${toDelete.length} old cache entries`);
    }

    // ============================================
    // CORE REQUEST METHOD
    // ============================================
    
    async _waitForRateLimit() {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        const delayNeeded = this.rateLimitDelay - timeSinceLastRequest;
        
        if (delayNeeded > 0) {
            await new Promise(resolve => setTimeout(resolve, delayNeeded));
        }
        
        this.lastRequestTime = Date.now();
    }
    
    _updateLoadingState() {
        if (this.onLoadingChange) {
            this.onLoadingChange(this.pendingRequests > 0);
        }
    }
    
    async _fetchWithRetry(endpoint, params = {}, cacheType = 'quote') {
        const cacheDuration = this.cacheDuration[cacheType] || this.cacheDuration.quote;
        const cacheKey = this._getCacheKey(endpoint, params);
        
        // Check cache first
        const cached = this._getFromCache(cacheKey, cacheDuration);
        if (cached) return cached;
        
        // Rate limiting
        await this._waitForRateLimit();
        
        // Update loading state
        this.pendingRequests++;
        this._updateLoadingState();
        
        let lastError = null;
        
        try {
            for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
                try {
                    // Build URL
                    const url = new URL(`${this.baseURL}/${endpoint}`);
                    Object.keys(params).forEach(key => {
                        url.searchParams.append(key, params[key]);
                    });
                    
                    console.log(`🌐 API Request (${attempt}/${this.maxRetries}): ${endpoint}`);
                    
                    const response = await fetch(url.toString());
                    
                    // Incrémenter le compteur SEULEMENT si la requête arrive au serveur
                    this.incrementRequestCount();
                    
                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        throw new Error(errorData.error || `HTTP ${response.status}`);
                    }
                    
                    const data = await response.json();
                    
                    // Save to cache
                    this._setCache(cacheKey, data);
                    
                    return data;
                    
                } catch (error) {
                    lastError = error;
                    
                    const isRetryable = error.message.includes('NetworkError') || 
                                      error.message.includes('Failed to fetch') ||
                                      error.message.includes('HTTP 5');
                    
                    if (attempt < this.maxRetries && isRetryable) {
                        const delay = this.retryDelay * Math.pow(2, attempt - 1);
                        console.warn(`⚠️ Retry in ${delay}ms...`);
                        await new Promise(resolve => setTimeout(resolve, delay));
                    } else {
                        throw this._createUserFriendlyError(error);
                    }
                }
            }
            
            throw this._createUserFriendlyError(lastError);
            
        } finally {
            this.pendingRequests--;
            this._updateLoadingState();
        }
    }
    
    _createUserFriendlyError(error) {
        console.error('❌ API Error:', error);
        
        let userMessage = 'Une erreur inattendue est survenue.';
        
        if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
            userMessage = 'Erreur réseau. Vérifiez votre connexion.';
        } else if (error.message.includes('429')) {
            userMessage = 'Limite de requêtes atteinte. Réessayez dans quelques minutes.';
        } else if (error.message.includes('404')) {
            userMessage = 'Symbole introuvable. Vérifiez le ticker.';
        } else if (error.message.includes('401')) {
            userMessage = 'Erreur d\'authentification API.';
        } else if (error.message) {
            userMessage = error.message;
        }
        
        const friendlyError = new Error(userMessage);
        friendlyError.originalError = error;
        return friendlyError;
    }

    // ============================================
    // PUBLIC API METHODS
    // ============================================
    
    async getQuote(symbol) {
        if (!symbol) throw new Error('Symbol requis');
        return await this._fetchWithRetry('quote', { symbol: symbol.toUpperCase() }, 'quote');
    }
    
    async getTimeSeries(symbol, interval = '1day', outputsize = 100) {
        if (!symbol) throw new Error('Symbol requis');
        return await this._fetchWithRetry('time-series', {
            symbol: symbol.toUpperCase(),
            interval: interval,
            outputsize: outputsize
        }, 'timeSeries');
    }
    
    async getTechnicalIndicator(symbol, indicator, interval = '1day', timePeriod = 14) {
        if (!symbol || !indicator) throw new Error('Symbol et indicator requis');
        return await this._fetchWithRetry('technical-indicators', {
            symbol: symbol.toUpperCase(),
            indicator: indicator.toLowerCase(),
            interval: interval,
            time_period: timePeriod
        }, 'indicators');
    }
    
    async searchSymbol(query) {
        if (!query) throw new Error('Query requis');
        return await this._fetchWithRetry('search', { query: query }, 'search');
    }
    
    async getStatistics(symbol) {
        if (!symbol) throw new Error('Symbol requis');
        return await this._fetchWithRetry('statistics', { symbol: symbol.toUpperCase() }, 'statistics');
    }
    
    async getProfile(symbol) {
        if (!symbol) throw new Error('Symbol requis');
        return await this._fetchWithRetry('profile', { symbol: symbol.toUpperCase() }, 'profile');
    }
    
    async getBatchIndicators(symbol, indicators, interval = '1day') {
        const requests = indicators.map(indicator => 
            this.getTechnicalIndicator(symbol, indicator, interval)
                .then(data => ({ indicator, data }))
                .catch(error => ({ indicator, error }))
        );
        
        const results = await Promise.all(requests);
        
        return results.reduce((acc, result) => {
            acc[result.indicator] = result.error ? { error: result.error.message } : result.data;
            return acc;
        }, {});
    }
    
    clearCache() {
        const keys = Object.keys(localStorage);
        const cacheKeys = keys.filter(k => k.startsWith('api_cache:'));
        cacheKeys.forEach(k => localStorage.removeItem(k));
        console.log(`🗑️ ${cacheKeys.length} entrées de cache supprimées`);
    }
    
    getCacheStats() {
        const keys = Object.keys(localStorage);
        const cacheKeys = keys.filter(k => k.startsWith('api_cache:'));
        return {
            entries: cacheKeys.length,
            requestsToday: this.requestCount,
            quotaRemaining: 800 - this.requestCount
        };
    }
}