/* ==============================================
   API-CLIENT.JS - Twelve Data API Client avec Cache
   Compatible avec ton Cloudflare Worker existant
   VERSION SANS LIMITATION D'API + NEWS
   ============================================== */

class FinanceAPIClient {
    constructor(config = {}) {
        this.baseURL = config.baseURL || '';
        this.cacheDuration = config.cacheDuration || 3600000; // 1h par défaut
        this.maxRetries = config.maxRetries || 3;
        this.onLoadingChange = config.onLoadingChange || (() => {});
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
            entries: cacheKeys.length
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
                throw new Error(errorData.error || errorData.message || `API Error: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Vérifier si l'API retourne une erreur dans les données
            if (data.status === 'error' || data.error) {
                throw new Error(data.error || data.message || 'API returned an error');
            }
            
            // Sauvegarder dans le cache
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
    // API ENDPOINTS (Adaptés à ton Worker)
    // ============================================
    
    /**
     * 🔍 Recherche de symboles
     * Ton Worker utilise : /api/search avec paramètre "query"
     */
    async searchSymbol(query) {
        const data = await this.makeRequest('search', { query });
        
        return {
            data: data.results || [],
            status: 'ok'
        };
    }
    
    /**
     * 💰 Quote en temps réel
     * Ton Worker transforme déjà les données !
     */
    async getQuote(symbol) {
        const data = await this.makeRequest('quote', { symbol });
        
        console.log('📦 Quote data received:', data);
        
        // Ton Worker retourne déjà les données transformées
        return {
            symbol: data.symbol || symbol,
            name: data.name || symbol,
            exchange: data.exchange || '',
            currency: data.currency || 'USD',
            price: this.parseNumber(data.price),
            open: this.parseNumber(data.open),
            high: this.parseNumber(data.high),
            low: this.parseNumber(data.low),
            volume: parseInt(data.volume) || 0,
            previousClose: this.parseNumber(data.previousClose),
            change: this.parseNumber(data.change),
            percentChange: this.parseNumber(data.percentChange),
            fiftyTwoWeekHigh: 0,
            fiftyTwoWeekLow: 0,
            averageVolume: 0,
            timestamp: data.timestamp || Date.now()
        };
    }
    
    /**
     * 📊 Séries temporelles (données historiques)
     * Ton Worker utilise : /api/time-series (avec tiret !)
     */
    async getTimeSeries(symbol, interval = '1day', outputsize = 30) {
        try {
            const data = await this.makeRequest('time-series', {
                symbol,
                interval,
                outputsize
            });
            
            console.log('📦 Time series data received:', data);
            
            if (!data.data || data.data.length === 0) {
                throw new Error('No time series data available for this symbol');
            }
            
            return {
                symbol: data.symbol || symbol,
                interval: data.interval || interval,
                currency: 'USD',
                exchange: '',
                data: data.data.map(item => ({
                    datetime: item.datetime,
                    timestamp: new Date(item.datetime).getTime(),
                    open: this.parseNumber(item.open),
                    high: this.parseNumber(item.high),
                    low: this.parseNumber(item.low),
                    close: this.parseNumber(item.close),
                    volume: parseInt(item.volume) || 0
                }))
            };
        } catch (error) {
            console.error('Time series error:', error);
            throw error;
        }
    }
    
    /**
     * 🏢 Profil de l'entreprise
     * Ton Worker utilise : /api/profile
     */
    async getProfile(symbol) {
        try {
            const data = await this.makeRequest('profile', { symbol });
            
            console.log('📦 Profile data received:', data);
            
            if (!data || data.status === 'error' || data.error) {
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
            console.warn('Profile endpoint error:', error.message);
            return null;
        }
    }
    
    /**
     * 📈 Statistiques fondamentales
     * Ton Worker utilise : /api/statistics
     */
    async getStatistics(symbol) {
        try {
            const data = await this.makeRequest('statistics', { symbol });
            
            console.log('📦 Statistics data received:', data);
            
            if (!data || data.status === 'error' || data.error) {
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
            console.warn('Statistics endpoint error:', error.message);
            return null;
        }
    }
    
    /**
     * 🎨 Logo de l'entreprise
     * Ton Worker ne supporte pas cet endpoint, on retourne vide
     */
    async getLogo(symbol) {
        console.warn('Logo endpoint not available in Worker');
        return '';
    }
    
    /**
     * 📊 Indicateurs techniques
     * Ton Worker utilise : /api/technical-indicators
     */
    async getTechnicalIndicator(symbol, indicator, interval = '1day', timePeriod = 14) {
        try {
            const data = await this.makeRequest('technical-indicators', {
                symbol,
                indicator,
                interval,
                time_period: timePeriod
            });
            
            return data;
        } catch (error) {
            console.warn(`Technical indicator ${indicator} error:`, error.message);
            return null;
        }
    }
    
    /**
     * 📰 Financial News by Category
     * Ton Worker utilise : /api/news
     * @param {string} category - News category (general, forex, crypto, merger)
     * @param {number} limit - Maximum number of news items (default: 50)
     * @returns {Promise<Object>} News data with array of articles
     */
    async getNews(category = 'general', limit = 50) {
        try {
            console.log(`📰 Fetching news for category: ${category}`);
            
            const data = await this.makeRequest('news', {
                category,
                limit
            });
            
            console.log('📦 News data received:', data);
            
            // Vérifier si des données sont retournées
            if (!data || data.status === 'error' || data.error) {
                console.warn('News data not available');
                return {
                    data: [],
                    category: category,
                    count: 0,
                    status: 'error',
                    error: data?.error || 'No news data available'
                };
            }
            
            // Ton Worker peut retourner soit data.news soit data.data ou directement data comme array
            let newsArray = [];
            
            if (Array.isArray(data)) {
                newsArray = data;
            } else if (data.news && Array.isArray(data.news)) {
                newsArray = data.news;
            } else if (data.data && Array.isArray(data.data)) {
                newsArray = data.data;
            } else if (data.results && Array.isArray(data.results)) {
                newsArray = data.results;
            }
            
            // Transformer et normaliser les données
            const transformedNews = newsArray.map(item => {
                return {
                    id: item.id || item.uuid || `${Date.now()}_${Math.random()}`,
                    category: item.category || category,
                    headline: item.headline || item.title || 'No headline',
                    summary: item.summary || item.description || '',
                    source: item.source || 'Unknown',
                    url: item.url || item.link || '#',
                    image: item.image || item.imageUrl || item.thumbnail || '',
                    datetime: this.parseDateTime(item.datetime || item.publishedAt || item.date),
                    timestamp: this.parseTimestamp(item.datetime || item.publishedAt || item.date),
                    related: this.parseRelatedSymbols(item.related || item.symbols || item.tickers)
                };
            });
            
            return {
                data: transformedNews,
                category: category,
                count: transformedNews.length,
                status: 'ok'
            };
            
        } catch (error) {
            console.error('❌ News endpoint error:', error);
            
            // Retourner un objet vide au lieu de throw pour éviter de casser l'UI
            return {
                data: [],
                category: category,
                count: 0,
                status: 'error',
                error: error.message
            };
        }
    }
    
    /**
     * 🕐 Parse datetime from various formats
     * @param {string|number} datetime - DateTime in various formats
     * @returns {Date} Parsed date object
     */
    parseDateTime(datetime) {
        if (!datetime) return new Date();
        
        // Si c'est déjà un timestamp Unix (en secondes)
        if (typeof datetime === 'number' && datetime < 10000000000) {
            return new Date(datetime * 1000);
        }
        
        // Si c'est un timestamp en millisecondes
        if (typeof datetime === 'number') {
            return new Date(datetime);
        }
        
        // Si c'est une string ISO
        if (typeof datetime === 'string') {
            return new Date(datetime);
        }
        
        return new Date();
    }
    
    /**
     * 🕐 Parse timestamp to milliseconds
     * @param {string|number} datetime - DateTime in various formats
     * @returns {number} Timestamp in milliseconds
     */
    parseTimestamp(datetime) {
        if (!datetime) return Date.now();
        
        // Si c'est déjà un timestamp Unix (en secondes)
        if (typeof datetime === 'number' && datetime < 10000000000) {
            return datetime * 1000;
        }
        
        // Si c'est un timestamp en millisecondes
        if (typeof datetime === 'number') {
            return datetime;
        }
        
        // Si c'est une string ISO
        if (typeof datetime === 'string') {
            return new Date(datetime).getTime();
        }
        
        return Date.now();
    }
    
    /**
     * 🏷️ Parse related symbols from various formats
     * @param {string|Array} related - Related symbols (comma-separated string or array)
     * @returns {Array<string>} Array of symbols
     */
    parseRelatedSymbols(related) {
        if (!related) return [];
        
        // Si c'est déjà un array
        if (Array.isArray(related)) {
            return related.slice(0, 5); // Limiter à 5 symboles max
        }
        
        // Si c'est une string séparée par des virgules
        if (typeof related === 'string') {
            return related.split(',').map(s => s.trim()).filter(s => s).slice(0, 5);
        }
        
        return [];
    }
}