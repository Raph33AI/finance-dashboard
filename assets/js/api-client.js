/* ==============================================
   API-CLIENT.JS - Twelve Data API Client avec Cache
   Version corrigée pour la vraie structure API
   ============================================== */

class FinanceAPIClient {
    constructor(config = {}) {
        this.baseURL = config.baseURL || '';
        this.cacheDuration = config.cacheDuration || 300000; // 5 min par défaut
        this.maxRetries = config.maxRetries || 3;
        this.onLoadingChange = config.onLoadingChange || (() => {});
        
        // Compteur de requêtes API
        this.requestCount = parseInt(localStorage.getItem('api_request_count') || '0');
        this.lastResetDate = localStorage.getItem('api_counter_reset_date') || new Date().toDateString();
        this.checkAndResetCounter();
    }
    
    checkAndResetCounter() {
        const today = new Date().toDateString();
        if (this.lastResetDate !== today) {
            this.requestCount = 0;
            localStorage.setItem('api_request_count', '0');
            localStorage.setItem('api_counter_reset_date', today);
            this.lastResetDate = today;
            console.log('🔄 API counter reset for new day');
        }
    }
    
    incrementRequestCount() {
        this.requestCount++;
        localStorage.setItem('api_request_count', this.requestCount.toString());
        console.log(`📊 API Requests today: ${this.requestCount}/800`);
        
        if (this.requestCount >= 800) {
            console.warn('⚠️ Daily API limit (800) reached!');
        }
    }
    
    // ============================================
    // CACHE MANAGEMENT
    // ============================================
    
    getCacheKey(endpoint, params) {
        const paramString = JSON.stringify(params);
        return `api_cache:${endpoint}:${paramString}`;
    }
    
    getFromCache(key) {
        try {
            const cached = localStorage.getItem(key);
            if (!cached) return null;
            
            const { data, timestamp } = JSON.parse(cached);
            const age = Date.now() - timestamp;
            
            if (age < this.cacheDuration) {
                console.log(`✅ Cache HIT for ${key} (age: ${Math.round(age/1000)}s)`);
                return data;
            } else {
                console.log(`⏰ Cache EXPIRED for ${key}`);
                localStorage.removeItem(key);
                return null;
            }
        } catch (error) {
            console.error('Cache read error:', error);
            return null;
        }
    }
    
    saveToCache(key, data) {
        try {
            const cacheData = {
                data: data,
                timestamp: Date.now()
            };
            localStorage.setItem(key, JSON.stringify(cacheData));
            console.log(`💾 Saved to cache: ${key}`);
        } catch (error) {
            console.error('Cache write error:', error);
            if (error.name === 'QuotaExceededError') {
                this.clearOldestCache();
                this.saveToCache(key, data);
            }
        }
    }
    
    clearOldestCache() {
        const keys = Object.keys(localStorage);
        const cacheKeys = keys.filter(k => k.startsWith('api_cache:'));
        
        if (cacheKeys.length === 0) return;
        
        const cacheEntries = cacheKeys.map(key => {
            try {
                const { timestamp } = JSON.parse(localStorage.getItem(key));
                return { key, timestamp };
            } catch {
                return { key, timestamp: 0 };
            }
        });
        
        cacheEntries.sort((a, b) => a.timestamp - b.timestamp);
        
        const toRemove = cacheEntries.slice(0, Math.ceil(cacheEntries.length * 0.2));
        toRemove.forEach(entry => {
            localStorage.removeItem(entry.key);
            console.log(`🗑️ Removed old cache: ${entry.key}`);
        });
    }
    
    clearCache() {
        const keys = Object.keys(localStorage);
        const cacheKeys = keys.filter(k => k.startsWith('api_cache:'));
        cacheKeys.forEach(key => localStorage.removeItem(key));
        console.log(`🗑️ Cleared ${cacheKeys.length} cache entries`);
    }
    
    getCacheStats() {
        const keys = Object.keys(localStorage);
        const cacheKeys = keys.filter(k => k.startsWith('api_cache:'));
        return {
            entries: cacheKeys.length,
            requestsToday: this.requestCount
        };
    }
    
    // ============================================
    // API REQUEST HANDLER
    // ============================================
    
    async makeRequest(endpoint, params = {}, retryCount = 0) {
        const cacheKey = this.getCacheKey(endpoint, params);
        
        // Vérifier le cache d'abord
        const cachedData = this.getFromCache(cacheKey);
        if (cachedData) {
            return cachedData;
        }
        
        // Vérifier la limite quotidienne
        if (this.requestCount >= 800) {
            throw new Error('Daily API limit reached (800/800). Please try again tomorrow.');
        }
        
        this.onLoadingChange(true);
        
        const queryString = new URLSearchParams(params).toString();
        const url = `${this.baseURL}/${endpoint}?${queryString}`;
        
        try {
            console.log(`🌐 API Request: ${endpoint}`, params);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                if (response.status === 429 && retryCount < this.maxRetries) {
                    const waitTime = Math.pow(2, retryCount) * 1000;
                    console.warn(`⏳ Rate limited. Retrying in ${waitTime}ms...`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                    return this.makeRequest(endpoint, params, retryCount + 1);
                }
                
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `API Error: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Vérifier si l'API retourne une erreur dans les données
            if (data.status === 'error') {
                throw new Error(data.message || 'API returned an error');
            }
            
            this.incrementRequestCount();
            this.saveToCache(cacheKey, data);
            
            return data;
            
        } catch (error) {
            console.error(`❌ API Error (${endpoint}):`, error);
            throw error;
        } finally {
            this.onLoadingChange(false);
        }
    }
    
    // ============================================
    // HELPER METHODS
    // ============================================
    
    parseNumber(value) {
        if (value === null || value === undefined || value === '') return 0;
        if (typeof value === 'number') return value;
        const parsed = parseFloat(value);
        return isNaN(parsed) ? 0 : parsed;
    }
    
    safeGet(obj, path, defaultValue = null) {
        try {
            const keys = path.split('.');
            let result = obj;
            for (const key of keys) {
                if (result && typeof result === 'object' && key in result) {
                    result = result[key];
                } else {
                    return defaultValue;
                }
            }
            return result !== undefined ? result : defaultValue;
        } catch {
            return defaultValue;
        }
    }
    
    // ============================================
    // API ENDPOINTS
    // ============================================
    
    /**
     * 🔍 Recherche de symboles
     */
    async searchSymbol(query) {
        const data = await this.makeRequest('symbol_search', {
            symbol: query,
            outputsize: 30
        });
        
        return {
            data: data.data || [],
            status: data.status || 'ok'
        };
    }
    
    /**
     * 💰 Quote en temps réel (CORRIGÉ !)
     */
    async getQuote(symbol) {
        const data = await this.makeRequest('quote', { symbol });
        
        console.log('📦 Quote data received:', data);
        
        // Twelve Data peut retourner soit un objet direct, soit dans data.quote
        const quote = data.quote || data;
        
        return {
            symbol: this.safeGet(quote, 'symbol', symbol),
            name: this.safeGet(quote, 'name', symbol),
            exchange: this.safeGet(quote, 'exchange', ''),
            currency: this.safeGet(quote, 'currency', 'USD'),
            price: this.parseNumber(this.safeGet(quote, 'close')),
            open: this.parseNumber(this.safeGet(quote, 'open')),
            high: this.parseNumber(this.safeGet(quote, 'high')),
            low: this.parseNumber(this.safeGet(quote, 'low')),
            volume: parseInt(this.safeGet(quote, 'volume', 0)),
            previousClose: this.parseNumber(this.safeGet(quote, 'previous_close')),
            change: this.parseNumber(this.safeGet(quote, 'change')),
            percentChange: this.parseNumber(this.safeGet(quote, 'percent_change')),
            fiftyTwoWeekHigh: this.parseNumber(this.safeGet(quote, 'fifty_two_week.high')),
            fiftyTwoWeekLow: this.parseNumber(this.safeGet(quote, 'fifty_two_week.low')),
            averageVolume: parseInt(this.safeGet(quote, 'average_volume', 0)),
            timestamp: this.safeGet(quote, 'timestamp', Date.now())
        };
    }
    
    /**
     * 📊 Séries temporelles (données historiques)
     */
    async getTimeSeries(symbol, interval = '1day', outputsize = 30) {
        try {
            const data = await this.makeRequest('time_series', {
                symbol,
                interval,
                outputsize
            });
            
            console.log('📦 Time series data received:', data);
            
            const values = data.values || data.data || [];
            
            if (values.length === 0) {
                throw new Error('No time series data available for this symbol');
            }
            
            return {
                symbol: this.safeGet(data, 'meta.symbol', symbol),
                interval: this.safeGet(data, 'meta.interval', interval),
                currency: this.safeGet(data, 'meta.currency', 'USD'),
                exchange: this.safeGet(data, 'meta.exchange', ''),
                data: values.map(item => ({
                    datetime: item.datetime,
                    timestamp: new Date(item.datetime).getTime(),
                    open: this.parseNumber(item.open),
                    high: this.parseNumber(item.high),
                    low: this.parseNumber(item.low),
                    close: this.parseNumber(item.close),
                    volume: parseInt(item.volume) || 0
                })).reverse() // Inverser pour avoir l'ordre chronologique
            };
        } catch (error) {
            console.error('Time series error:', error);
            throw error;
        }
    }
    
    /**
     * 🏢 Profil de l'entreprise
     */
    async getProfile(symbol) {
        try {
            const data = await this.makeRequest('profile', { symbol });
            
            console.log('📦 Profile data received:', data);
            
            // Vérifier si des données sont retournées
            if (!data || data.status === 'error') {
                console.warn('Profile data not available for', symbol);
                return null;
            }
            
            return {
                symbol: this.safeGet(data, 'symbol', symbol),
                name: this.safeGet(data, 'name', symbol),
                sector: this.safeGet(data, 'sector', 'N/A'),
                industry: this.safeGet(data, 'industry', 'N/A'),
                country: this.safeGet(data, 'country', 'N/A'),
                website: this.safeGet(data, 'website', ''),
                description: this.safeGet(data, 'description', 'No description available'),
                ceo: this.safeGet(data, 'ceo', 'N/A'),
                employees: this.safeGet(data, 'employees', 'N/A'),
                address: this.safeGet(data, 'address', 'N/A'),
                phone: this.safeGet(data, 'phone', 'N/A'),
                founded: this.safeGet(data, 'founded', 'N/A')
            };
        } catch (error) {
            console.warn('Profile endpoint not accessible:', error.message);
            return null;
        }
    }
    
    /**
     * 📈 Statistiques fondamentales
     */
    async getStatistics(symbol) {
        try {
            const data = await this.makeRequest('statistics', { symbol });
            
            console.log('📦 Statistics data received:', data);
            
            // Vérifier si des données sont retournées
            if (!data || data.status === 'error') {
                console.warn('Statistics data not available for', symbol);
                return null;
            }
            
            return {
                // Valuation Metrics
                marketCap: this.parseNumber(this.safeGet(data, 'valuations_metrics.market_capitalization')),
                enterpriseValue: this.parseNumber(this.safeGet(data, 'valuations_metrics.enterprise_value')),
                trailingPE: this.parseNumber(this.safeGet(data, 'valuations_metrics.trailing_pe')),
                forwardPE: this.parseNumber(this.safeGet(data, 'valuations_metrics.forward_pe')),
                pegRatio: this.parseNumber(this.safeGet(data, 'valuations_metrics.peg_ratio')),
                priceToSales: this.parseNumber(this.safeGet(data, 'valuations_metrics.price_to_sales_ttm')),
                priceToBook: this.parseNumber(this.safeGet(data, 'valuations_metrics.price_to_book_mrq')),
                evToRevenue: this.parseNumber(this.safeGet(data, 'valuations_metrics.enterprise_to_revenue')),
                evToEbitda: this.parseNumber(this.safeGet(data, 'valuations_metrics.enterprise_to_ebitda')),
                
                // Financial Highlights
                profitMargin: this.parseNumber(this.safeGet(data, 'financials_highlights.profit_margin')),
                operatingMargin: this.parseNumber(this.safeGet(data, 'financials_highlights.operating_margin')),
                returnOnAssets: this.parseNumber(this.safeGet(data, 'financials_highlights.return_on_assets_ttm')),
                returnOnEquity: this.parseNumber(this.safeGet(data, 'financials_highlights.return_on_equity_ttm')),
                revenue: this.parseNumber(this.safeGet(data, 'financials_highlights.revenue_ttm')),
                revenuePerShare: this.parseNumber(this.safeGet(data, 'financials_highlights.revenue_per_share_ttm')),
                grossProfit: this.parseNumber(this.safeGet(data, 'financials_highlights.gross_profit_ttm')),
                ebitda: this.parseNumber(this.safeGet(data, 'financials_highlights.ebitda')),
                netIncome: this.parseNumber(this.safeGet(data, 'financials_highlights.net_income_to_common_ttm')),
                eps: this.parseNumber(this.safeGet(data, 'financials_highlights.diluted_eps_ttm')),
                
                // Stock Statistics
                beta: this.parseNumber(this.safeGet(data, 'statistics.beta')),
                fiftyTwoWeekChange: this.parseNumber(this.safeGet(data, 'statistics.52_week_change')),
                sharesOutstanding: this.parseNumber(this.safeGet(data, 'statistics.shares_outstanding')),
                sharesFloat: this.parseNumber(this.safeGet(data, 'statistics.shares_float')),
                sharesShort: this.parseNumber(this.safeGet(data, 'statistics.shares_short')),
                shortRatio: this.parseNumber(this.safeGet(data, 'statistics.short_ratio')),
                shortPercentOfFloat: this.parseNumber(this.safeGet(data, 'statistics.short_percent_of_float')),
                
                // Dividends
                dividendRate: this.parseNumber(this.safeGet(data, 'dividends_and_splits.forward_annual_dividend_rate')),
                dividendYield: this.parseNumber(this.safeGet(data, 'dividends_and_splits.forward_annual_dividend_yield')),
                payoutRatio: this.parseNumber(this.safeGet(data, 'dividends_and_splits.payout_ratio')),
                exDividendDate: this.safeGet(data, 'dividends_and_splits.ex_dividend_date', ''),
                lastSplitDate: this.safeGet(data, 'dividends_and_splits.last_split_date', ''),
                lastSplitFactor: this.safeGet(data, 'dividends_and_splits.last_split_factor', '')
            };
        } catch (error) {
            console.warn('Statistics endpoint not accessible:', error.message);
            return null;
        }
    }
    
    /**
     * 🎨 Logo de l'entreprise
     */
    async getLogo(symbol) {
        try {
            const data = await this.makeRequest('logo', { symbol });
            
            console.log('📦 Logo data received:', data);
            
            if (!data || data.status === 'error' || !data.url) {
                console.warn('Logo not available for', symbol);
                return '';
            }
            
            return data.url;
        } catch (error) {
            console.warn('Logo endpoint not accessible:', error.message);
            return '';
        }
    }
    
    /**
     * 🔄 Taux de change (pour crypto et forex)
     */
    async getExchangeRate(symbol1, symbol2) {
        try {
            const data = await this.makeRequest('exchange_rate', {
                symbol: `${symbol1}/${symbol2}`
            });
            
            return {
                rate: this.parseNumber(data.rate),
                timestamp: data.timestamp
            };
        } catch (error) {
            console.warn('Exchange rate not available:', error.message);
            return null;
        }
    }
}