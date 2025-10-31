/* ==============================================
   API-CLIENT.JS - Twelve Data API Client avec Cache
   Version optimisée pour le plan Basic
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
    // API ENDPOINTS
    // ============================================
    
    /**
     * 🔍 Recherche de symboles
     */
    async searchSymbol(query) {
        return await this.makeRequest('symbol_search', {
            symbol: query,
            outputsize: 30
        });
    }
    
    /**
     * 💰 Quote en temps réel
     */
    async getQuote(symbol) {
        const data = await this.makeRequest('quote', { symbol });
        
        return {
            symbol: data.symbol,
            name: data.name || symbol,
            exchange: data.exchange,
            currency: data.currency,
            price: parseFloat(data.close) || 0,
            open: parseFloat(data.open) || 0,
            high: parseFloat(data.high) || 0,
            low: parseFloat(data.low) || 0,
            volume: parseInt(data.volume) || 0,
            previousClose: parseFloat(data.previous_close) || 0,
            change: parseFloat(data.change) || 0,
            percentChange: parseFloat(data.percent_change) || 0,
            fiftyTwoWeekHigh: parseFloat(data.fifty_two_week.high) || 0,
            fiftyTwoWeekLow: parseFloat(data.fifty_two_week.low) || 0,
            averageVolume: parseInt(data.average_volume) || 0,
            timestamp: data.timestamp
        };
    }
    
    /**
     * 📊 Séries temporelles (données historiques)
     */
    async getTimeSeries(symbol, interval = '1day', outputsize = 30) {
        const data = await this.makeRequest('time_series', {
            symbol,
            interval,
            outputsize
        });
        
        if (!data.values || data.values.length === 0) {
            throw new Error('No time series data available for this symbol');
        }
        
        return {
            symbol: data.meta?.symbol || symbol,
            interval: data.meta?.interval || interval,
            currency: data.meta?.currency,
            exchange: data.meta?.exchange,
            data: data.values.map(item => ({
                datetime: item.datetime,
                timestamp: new Date(item.datetime).getTime(),
                open: parseFloat(item.open),
                high: parseFloat(item.high),
                low: parseFloat(item.low),
                close: parseFloat(item.close),
                volume: parseInt(item.volume) || 0
            })).reverse() // Inverser pour avoir l'ordre chronologique
        };
    }
    
    /**
     * 🏢 Profil de l'entreprise (NOUVEAU !)
     */
    async getProfile(symbol) {
        try {
            const data = await this.makeRequest('profile', { symbol });
            
            // Vérifier si des données sont retournées
            if (!data || data.status === 'error') {
                console.warn('Profile data not available for', symbol);
                return null;
            }
            
            return {
                symbol: data.symbol || symbol,
                name: data.name || symbol,
                sector: data.sector || 'N/A',
                industry: data.industry || 'N/A',
                country: data.country || 'N/A',
                website: data.website || '',
                description: data.description || 'No description available',
                ceo: data.ceo || 'N/A',
                employees: data.employees || 'N/A',
                address: data.address || 'N/A',
                phone: data.phone || 'N/A',
                founded: data.founded || 'N/A'
            };
        } catch (error) {
            console.warn('Profile endpoint not accessible:', error.message);
            return null;
        }
    }

    /**
     * 📈 Statistiques fondamentales (NOUVEAU !)
     */
    async getStatistics(symbol) {
        try {
            const data = await this.makeRequest('statistics', { symbol });
            
            // Vérifier si des données sont retournées
            if (!data || data.status === 'error') {
                console.warn('Statistics data not available for', symbol);
                return null;
            }
            
            return {
                // Valuation Metrics
                marketCap: this.parseNumber(data.valuations_metrics?.market_capitalization),
                enterpriseValue: this.parseNumber(data.valuations_metrics?.enterprise_value),
                trailingPE: this.parseNumber(data.valuations_metrics?.trailing_pe),
                forwardPE: this.parseNumber(data.valuations_metrics?.forward_pe),
                pegRatio: this.parseNumber(data.valuations_metrics?.peg_ratio),
                priceToSales: this.parseNumber(data.valuations_metrics?.price_to_sales_ttm),
                priceToBook: this.parseNumber(data.valuations_metrics?.price_to_book_mrq),
                evToRevenue: this.parseNumber(data.valuations_metrics?.enterprise_to_revenue),
                evToEbitda: this.parseNumber(data.valuations_metrics?.enterprise_to_ebitda),
                
                // Financial Highlights
                profitMargin: this.parseNumber(data.financials_highlights?.profit_margin),
                operatingMargin: this.parseNumber(data.financials_highlights?.operating_margin),
                returnOnAssets: this.parseNumber(data.financials_highlights?.return_on_assets_ttm),
                returnOnEquity: this.parseNumber(data.financials_highlights?.return_on_equity_ttm),
                revenue: this.parseNumber(data.financials_highlights?.revenue_ttm),
                revenuePerShare: this.parseNumber(data.financials_highlights?.revenue_per_share_ttm),
                grossProfit: this.parseNumber(data.financials_highlights?.gross_profit_ttm),
                ebitda: this.parseNumber(data.financials_highlights?.ebitda),
                netIncome: this.parseNumber(data.financials_highlights?.net_income_to_common_ttm),
                eps: this.parseNumber(data.financials_highlights?.diluted_eps_ttm),
                
                // Stock Statistics
                beta: this.parseNumber(data.statistics?.beta),
                fiftyTwoWeekChange: this.parseNumber(data.statistics?.['52_week_change']),
                sharesOutstanding: this.parseNumber(data.statistics?.shares_outstanding),
                sharesFloat: this.parseNumber(data.statistics?.shares_float),
                sharesShort: this.parseNumber(data.statistics?.shares_short),
                shortRatio: this.parseNumber(data.statistics?.short_ratio),
                shortPercentOfFloat: this.parseNumber(data.statistics?.short_percent_of_float),
                
                // Dividends
                dividendRate: this.parseNumber(data.dividends_and_splits?.forward_annual_dividend_rate),
                dividendYield: this.parseNumber(data.dividends_and_splits?.forward_annual_dividend_yield),
                payoutRatio: this.parseNumber(data.dividends_and_splits?.payout_ratio),
                exDividendDate: data.dividends_and_splits?.ex_dividend_date || '',
                lastSplitDate: data.dividends_and_splits?.last_split_date || '',
                lastSplitFactor: data.dividends_and_splits?.last_split_factor || ''
            };
        } catch (error) {
            console.warn('Statistics endpoint not accessible:', error.message);
            return null;
        }
    }

    /**
     * 🎨 Logo de l'entreprise (NOUVEAU !)
     */
    async getLogo(symbol) {
        try {
            const data = await this.makeRequest('logo', { symbol });
            
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
     * Helper: Parse number safely
     */
    parseNumber(value) {
        if (value === null || value === undefined || value === '') return 0;
        if (typeof value === 'number') return value;
        const parsed = parseFloat(value);
        return isNaN(parsed) ? 0 : parsed;
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
                rate: parseFloat(data.rate),
                timestamp: data.timestamp
            };
        } catch (error) {
            console.warn('Exchange rate not available:', error.message);
            return null;
        }
    }
}