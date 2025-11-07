/* ==============================================
   API-CLIENT.JS v5.0 - Finnhub API Client
   Compatible avec Cloudflare Worker v5.0
   TOUS LES ENDPOINTS GRATUITS FINNHUB
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
        const url = `${this.baseURL}/api/${endpoint}?${queryString}`;
        
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
    
    parseDateTime(datetime) {
        if (!datetime) return new Date();
        
        if (typeof datetime === 'number' && datetime < 10000000000) {
            return new Date(datetime * 1000);
        }
        
        if (typeof datetime === 'number') {
            return new Date(datetime);
        }
        
        if (typeof datetime === 'string') {
            return new Date(datetime);
        }
        
        return new Date();
    }
    
    parseTimestamp(datetime) {
        if (!datetime) return Date.now();
        
        if (typeof datetime === 'number' && datetime < 10000000000) {
            return datetime * 1000;
        }
        
        if (typeof datetime === 'number') {
            return datetime;
        }
        
        if (typeof datetime === 'string') {
            return new Date(datetime).getTime();
        }
        
        return Date.now();
    }
    
    parseRelatedSymbols(related) {
        if (!related) return [];
        
        if (Array.isArray(related)) {
            return related.slice(0, 5);
        }
        
        if (typeof related === 'string') {
            return related.split(',').map(s => s.trim()).filter(s => s).slice(0, 5);
        }
        
        return [];
    }
    
    // ============================================
    // MARKET DATA ENDPOINTS
    // ============================================
    
    /**
     * 🔍 Recherche de symboles
     * GET /api/search?query=apple
     */
    async searchSymbol(query) {
        try {
            const data = await this.makeRequest('search', { query });
            
            // Finnhub retourne { data: [...], count: X }
            return {
                data: data.data || [],
                count: data.count || 0,
                status: 'ok'
            };
        } catch (error) {
            console.error('Search error:', error);
            return {
                data: [],
                count: 0,
                status: 'error',
                error: error.message
            };
        }
    }
    
    /**
     * 💰 Quote en temps réel
     * GET /api/quote?symbol=AAPL
     */
    async getQuote(symbol) {
        const data = await this.makeRequest('quote', { symbol });
        
        console.log('📦 Quote data received:', data);
        
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
            timestamp: data.timestamp || Date.now()
        };
    }
    
    /**
     * 📊 Séries temporelles (données historiques)
     * GET /api/time-series?symbol=AAPL&interval=1day&outputsize=100
     */
    async getTimeSeries(symbol, interval = '1day', outputsize = 100) {
        try {
            const data = await this.makeRequest('time-series', {
                symbol,
                interval,
                outputsize
            });
            
            console.log('📦 Time series data received:', data);
            
            // Finnhub retourne { meta: {...}, values: [...], status: 'ok' }
            if (!data.values || data.values.length === 0) {
                throw new Error('No time series data available');
            }
            
            return {
                symbol: data.meta?.symbol || symbol,
                interval: data.meta?.interval || interval,
                currency: 'USD',
                exchange: '',
                data: data.values.map(item => ({
                    datetime: item.datetime,
                    timestamp: item.timestamp || new Date(item.datetime).getTime(),
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
     * GET /api/profile?symbol=AAPL
     */
    async getProfile(symbol) {
        try {
            const data = await this.makeRequest('profile', { symbol });
            
            console.log('📦 Profile data received:', data);
            
            if (!data || data.error) {
                console.warn('Profile data not available for', symbol);
                return null;
            }
            
            return {
                symbol: data.symbol || data.ticker || symbol,
                name: data.name || symbol,
                country: data.country || 'N/A',
                currency: data.currency || 'USD',
                exchange: data.exchange || '',
                ipo: data.ipo || 'N/A',
                marketCapitalization: data.marketCapitalization || 0,
                phone: data.phone || 'N/A',
                shareOutstanding: data.shareOutstanding || 0,
                ticker: data.ticker || symbol,
                weburl: data.weburl || '',
                logo: data.logo || '',
                finnhubIndustry: data.finnhubIndustry || 'N/A',
                // Mappings pour compatibilité
                sector: data.finnhubIndustry || 'N/A',
                industry: data.finnhubIndustry || 'N/A',
                website: data.weburl || '',
                description: `${data.name || symbol} is listed on ${data.exchange || 'N/A'}`,
                ceo: 'N/A',
                employees: 'N/A',
                address: 'N/A',
                founded: data.ipo || 'N/A'
            };
        } catch (error) {
            console.warn('Profile error:', error.message);
            return null;
        }
    }
    
    /**
     * 🤝 Entreprises similaires/concurrentes
     * GET /api/peers?symbol=AAPL
     */
    async getPeers(symbol) {
        try {
            const data = await this.makeRequest('peers', { symbol });
            
            console.log('📦 Peers data received:', data);
            
            return {
                symbol: data.symbol || symbol,
                peers: data.peers || [],
                status: 'ok'
            };
        } catch (error) {
            console.error('Peers error:', error);
            return {
                symbol: symbol,
                peers: [],
                status: 'error',
                error: error.message
            };
        }
    }
    
    /**
     * 📋 Liste des symboles par exchange
     * GET /api/symbols?exchange=US
     */
    async getSymbols(exchange = 'US') {
        try {
            const data = await this.makeRequest('symbols', { exchange });
            
            console.log('📦 Symbols data received for exchange:', exchange);
            
            return {
                exchange: data.exchange || exchange,
                symbols: data.symbols || [],
                count: (data.symbols || []).length,
                status: 'ok'
            };
        } catch (error) {
            console.error('Symbols error:', error);
            return {
                exchange: exchange,
                symbols: [],
                count: 0,
                status: 'error',
                error: error.message
            };
        }
    }
    
    /**
     * 🕐 Statut des marchés
     * GET /api/market-status?exchange=US
     */
    async getMarketStatus(exchange = 'US') {
        try {
            const data = await this.makeRequest('market-status', { exchange });
            
            console.log('📦 Market status received:', data);
            
            return {
                exchange: data.exchange || exchange,
                timezone: data.timezone || 'America/New_York',
                isOpen: data.isOpen || false,
                session: data.session || 'closed',
                status: 'ok'
            };
        } catch (error) {
            console.error('Market status error:', error);
            return {
                exchange: exchange,
                isOpen: false,
                session: 'closed',
                status: 'error',
                error: error.message
            };
        }
    }
    
    /**
     * 🎨 Logo de l'entreprise (via profile)
     */
    async getLogo(symbol) {
        try {
            const profile = await this.getProfile(symbol);
            return profile?.logo || '';
        } catch (error) {
            console.warn('Logo not available:', error.message);
            return '';
        }
    }
    
    // ============================================
    // NEWS ENDPOINTS
    // ============================================
    
    /**
     * 📰 Actualités du marché par catégorie
     * GET /api/news?category=general
     * Catégories: general, forex, crypto, merger
     */
    async getNews(category = 'general', limit = 50) {
        try {
            console.log(`📰 Fetching news for category: ${category}`);
            
            // Finnhub retourne directement un array
            const data = await this.makeRequest('news', { category });
            
            console.log('📦 News data received:', data);
            
            let newsArray = [];
            
            if (Array.isArray(data)) {
                newsArray = data;
            } else if (data.news && Array.isArray(data.news)) {
                newsArray = data.news;
            } else if (data.data && Array.isArray(data.data)) {
                newsArray = data.data;
            }
            
            // Limiter au nombre demandé
            newsArray = newsArray.slice(0, limit);
            
            // Transformer les données Finnhub
            const transformedNews = newsArray.map(item => ({
                id: item.id || `${item.datetime || Date.now()}_${Math.random()}`,
                category: item.category || category,
                headline: item.headline || 'No headline',
                summary: item.summary || '',
                source: item.source || 'Finnhub',
                url: item.url || '#',
                image: item.image || '',
                datetime: this.parseDateTime(item.datetime),
                timestamp: this.parseTimestamp(item.datetime),
                related: this.parseRelatedSymbols(item.related)
            }));
            
            return {
                data: transformedNews,
                category: category,
                count: transformedNews.length,
                status: 'ok'
            };
            
        } catch (error) {
            console.error('News error:', error);
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
     * ✨ 📰 Actualités spécifiques à une entreprise
     * GET /api/company-news?symbol=AAPL&from=2024-01-01&to=2024-12-31
     */
    async getCompanyNews(symbol, from = null, to = null) {
        try {
            const params = { symbol };
            
            // Dates par défaut : 7 derniers jours
            if (!to) {
                to = new Date().toISOString().split('T')[0];
            }
            if (!from) {
                const fromDate = new Date();
                fromDate.setDate(fromDate.getDate() - 7);
                from = fromDate.toISOString().split('T')[0];
            }
            
            params.from = from;
            params.to = to;
            
            console.log(`📰 Fetching company news for ${symbol} (${from} to ${to})`);
            
            const data = await this.makeRequest('company-news', params);
            
            console.log('📦 Company news received:', data);
            
            let newsArray = [];
            
            if (Array.isArray(data)) {
                newsArray = data;
            } else if (data.news && Array.isArray(data.news)) {
                newsArray = data.news;
            } else if (data.data && Array.isArray(data.data)) {
                newsArray = data.data;
            }
            
            const transformedNews = newsArray.map(item => ({
                id: item.id || `${item.datetime || Date.now()}_${Math.random()}`,
                symbol: symbol,
                headline: item.headline || 'No headline',
                summary: item.summary || '',
                source: item.source || 'Finnhub',
                url: item.url || '#',
                image: item.image || '',
                datetime: this.parseDateTime(item.datetime),
                timestamp: this.parseTimestamp(item.datetime),
                related: this.parseRelatedSymbols(item.related)
            }));
            
            return {
                data: transformedNews,
                symbol: symbol,
                from: from,
                to: to,
                count: transformedNews.length,
                status: 'ok'
            };
            
        } catch (error) {
            console.error('Company news error:', error);
            return {
                data: [],
                symbol: symbol,
                count: 0,
                status: 'error',
                error: error.message
            };
        }
    }
    
    /**
     * ✨ 📊 Sentiment des actualités
     * GET /api/news-sentiment?symbol=AAPL
     */
    async getNewsSentiment(symbol) {
        try {
            console.log(`📊 Fetching news sentiment for ${symbol}`);
            
            const data = await this.makeRequest('news-sentiment', { symbol });
            
            console.log('📦 News sentiment received:', data);
            
            return {
                symbol: symbol,
                buzz: {
                    articlesInLastWeek: data.buzz?.articlesInLastWeek || 0,
                    buzz: data.buzz?.buzz || 0,
                    weeklyAverage: data.buzz?.weeklyAverage || 0
                },
                companyNewsScore: data.companyNewsScore || 0,
                sectorAverageBullishPercent: data.sectorAverageBullishPercent || 0,
                sectorAverageNewsScore: data.sectorAverageNewsScore || 0,
                sentiment: {
                    bearishPercent: data.sentiment?.bearishPercent || 0,
                    bullishPercent: data.sentiment?.bullishPercent || 0
                },
                symbol: data.symbol || symbol,
                status: 'ok'
            };
            
        } catch (error) {
            console.error('News sentiment error:', error);
            return {
                symbol: symbol,
                status: 'error',
                error: error.message
            };
        }
    }
    
    // ============================================
    // ANALYSIS ENDPOINTS
    // ============================================
    
    /**
     * ✨ 📈 Tendances des recommandations d'analystes
     * GET /api/recommendation-trends?symbol=AAPL
     */
    async getRecommendationTrends(symbol) {
        try {
            console.log(`📈 Fetching recommendation trends for ${symbol}`);
            
            const data = await this.makeRequest('recommendation-trends', { symbol });
            
            console.log('📦 Recommendation trends received:', data);
            
            // Finnhub retourne un array de périodes
            if (!Array.isArray(data)) {
                return {
                    symbol: symbol,
                    data: [],
                    status: 'error',
                    error: 'Invalid data format'
                };
            }
            
            return {
                symbol: symbol,
                data: data.map(item => ({
                    period: item.period,
                    strongBuy: item.strongBuy || 0,
                    buy: item.buy || 0,
                    hold: item.hold || 0,
                    sell: item.sell || 0,
                    strongSell: item.strongSell || 0
                })),
                status: 'ok'
            };
            
        } catch (error) {
            console.error('Recommendation trends error:', error);
            return {
                symbol: symbol,
                data: [],
                status: 'error',
                error: error.message
            };
        }
    }
    
    /**
     * ✨ 🎯 Objectifs de prix des analystes
     * GET /api/price-target?symbol=AAPL
     */
    async getPriceTarget(symbol) {
        try {
            console.log(`🎯 Fetching price target for ${symbol}`);
            
            const data = await this.makeRequest('price-target', { symbol });
            
            console.log('📦 Price target received:', data);
            
            return {
                symbol: data.symbol || symbol,
                targetHigh: data.targetHigh || 0,
                targetLow: data.targetLow || 0,
                targetMean: data.targetMean || 0,
                targetMedian: data.targetMedian || 0,
                lastUpdated: data.lastUpdated || new Date().toISOString().split('T')[0],
                status: 'ok'
            };
            
        } catch (error) {
            console.error('Price target error:', error);
            return {
                symbol: symbol,
                status: 'error',
                error: error.message
            };
        }
    }
    
    /**
     * ✨ 📊 Changements de recommandations (Upgrades/Downgrades)
     * GET /api/upgrade-downgrade?symbol=AAPL&from=2024-01-01&to=2024-12-31
     */
    async getUpgradeDowngrade(symbol = null, from = null, to = null) {
        try {
            const params = {};
            
            if (symbol) {
                params.symbol = symbol;
            }
            if (from) {
                params.from = from;
            }
            if (to) {
                params.to = to;
            }
            
            console.log(`📊 Fetching upgrade/downgrade changes:`, params);
            
            const data = await this.makeRequest('upgrade-downgrade', params);
            
            console.log('📦 Upgrade/downgrade data received:', data);
            
            let changesArray = [];
            
            if (Array.isArray(data)) {
                changesArray = data;
            } else if (data.data && Array.isArray(data.data)) {
                changesArray = data.data;
            }
            
            return {
                symbol: symbol || 'all',
                data: changesArray.map(item => ({
                    company: item.company || 'Unknown',
                    fromGrade: item.fromGrade || '',
                    toGrade: item.toGrade || '',
                    action: item.action || '',
                    symbol: item.symbol || symbol,
                    gradeTime: item.gradeTime || new Date().toISOString()
                })),
                count: changesArray.length,
                status: 'ok'
            };
            
        } catch (error) {
            console.error('Upgrade/downgrade error:', error);
            return {
                symbol: symbol || 'all',
                data: [],
                count: 0,
                status: 'error',
                error: error.message
            };
        }
    }
    
    /**
     * ✨ 💰 Résultats vs estimations (Earnings Surprises)
     * GET /api/earnings-surprises?symbol=AAPL
     */
    async getEarningsSurprises(symbol) {
        try {
            console.log(`💰 Fetching earnings surprises for ${symbol}`);
            
            const data = await this.makeRequest('earnings-surprises', { symbol });
            
            console.log('📦 Earnings surprises received:', data);
            
            let earningsArray = [];
            
            if (Array.isArray(data)) {
                earningsArray = data;
            } else if (data.data && Array.isArray(data.data)) {
                earningsArray = data.data;
            }
            
            return {
                symbol: symbol,
                data: earningsArray.map(item => ({
                    period: item.period,
                    actual: item.actual || 0,
                    estimate: item.estimate || 0,
                    surprise: item.surprise || 0,
                    surprisePercent: item.surprisePercent || 0
                })),
                status: 'ok'
            };
            
        } catch (error) {
            console.error('Earnings surprises error:', error);
            return {
                symbol: symbol,
                data: [],
                status: 'error',
                error: error.message
            };
        }
    }
    
    /**
     * ✨ 💵 Estimations de revenus
     * GET /api/revenue-estimates?symbol=AAPL&freq=quarterly
     */
    async getRevenueEstimates(symbol, freq = 'quarterly') {
        try {
            console.log(`💵 Fetching revenue estimates for ${symbol} (${freq})`);
            
            const data = await this.makeRequest('revenue-estimates', { symbol, freq });
            
            console.log('📦 Revenue estimates received:', data);
            
            let estimatesArray = [];
            
            if (Array.isArray(data)) {
                estimatesArray = data;
            } else if (data.data && Array.isArray(data.data)) {
                estimatesArray = data.data;
            }
            
            return {
                symbol: data.symbol || symbol,
                freq: data.freq || freq,
                data: estimatesArray.map(item => ({
                    period: item.period,
                    revenueAvg: item.revenueAvg || 0,
                    revenueHigh: item.revenueHigh || 0,
                    revenueLow: item.revenueLow || 0,
                    numberAnalysts: item.numberAnalysts || 0
                })),
                status: 'ok'
            };
            
        } catch (error) {
            console.error('Revenue estimates error:', error);
            return {
                symbol: symbol,
                freq: freq,
                data: [],
                status: 'error',
                error: error.message
            };
        }
    }
    
    /**
     * ✨ 📊 Estimations de bénéfices par action (EPS)
     * GET /api/eps-estimates?symbol=AAPL&freq=quarterly
     */
    async getEPSEstimates(symbol, freq = 'quarterly') {
        try {
            console.log(`📊 Fetching EPS estimates for ${symbol} (${freq})`);
            
            const data = await this.makeRequest('eps-estimates', { symbol, freq });
            
            console.log('📦 EPS estimates received:', data);
            
            let estimatesArray = [];
            
            if (Array.isArray(data)) {
                estimatesArray = data;
            } else if (data.data && Array.isArray(data.data)) {
                estimatesArray = data.data;
            }
            
            return {
                symbol: data.symbol || symbol,
                freq: data.freq || freq,
                data: estimatesArray.map(item => ({
                    period: item.period,
                    epsAvg: item.epsAvg || 0,
                    epsHigh: item.epsHigh || 0,
                    epsLow: item.epsLow || 0,
                    numberAnalysts: item.numberAnalysts || 0
                })),
                status: 'ok'
            };
            
        } catch (error) {
            console.error('EPS estimates error:', error);
            return {
                symbol: symbol,
                freq: freq,
                data: [],
                status: 'error',
                error: error.message
            };
        }
    }
    
    // ============================================
    // CALENDAR ENDPOINTS
    // ============================================
    
    /**
     * 📅 Calendrier des résultats financiers
     * GET /api/earnings-calendar?from=2024-01-01&to=2024-12-31&symbol=AAPL
     */
    async getEarningsCalendar(from = null, to = null, symbol = null) {
        try {
            const params = {};
            
            // Dates par défaut : 7 prochains jours
            if (!to) {
                to = new Date().toISOString().split('T')[0];
            }
            if (!from) {
                const fromDate = new Date();
                fromDate.setDate(fromDate.getDate() - 7);
                from = fromDate.toISOString().split('T')[0];
            }
            
            params.from = from;
            params.to = to;
            
            if (symbol) {
                params.symbol = symbol;
            }
            
            console.log(`📅 Fetching earnings calendar:`, params);
            
            const data = await this.makeRequest('earnings-calendar', params);
            
            console.log('📦 Earnings calendar received:', data);
            
            // Finnhub retourne { earningsCalendar: [...] }
            let eventsArray = [];
            
            if (data.earningsCalendar && Array.isArray(data.earningsCalendar)) {
                eventsArray = data.earningsCalendar;
            } else if (Array.isArray(data)) {
                eventsArray = data;
            }
            
            return {
                from: from,
                to: to,
                symbol: symbol || 'all',
                data: eventsArray.map(item => ({
                    date: item.date,
                    symbol: item.symbol,
                    epsActual: item.epsActual || null,
                    epsEstimate: item.epsEstimate || null,
                    revenueActual: item.revenueActual || null,
                    revenueEstimate: item.revenueEstimate || null,
                    hour: item.hour || 'Unknown',
                    quarter: item.quarter || null,
                    year: item.year || null
                })),
                count: eventsArray.length,
                status: 'ok'
            };
            
        } catch (error) {
            console.error('Earnings calendar error:', error);
            return {
                from: from,
                to: to,
                symbol: symbol || 'all',
                data: [],
                count: 0,
                status: 'error',
                error: error.message
            };
        }
    }
    
    /**
     * 🚀 Calendrier des IPO
     * GET /api/ipo-calendar?from=2024-01-01&to=2024-12-31
     */
    async getIPOCalendar(from = null, to = null) {
        try {
            const params = {};
            
            // Dates par défaut : 30 prochains jours
            if (!to) {
                to = new Date().toISOString().split('T')[0];
            }
            if (!from) {
                const fromDate = new Date();
                fromDate.setDate(fromDate.getDate() - 30);
                from = fromDate.toISOString().split('T')[0];
            }
            
            params.from = from;
            params.to = to;
            
            console.log(`🚀 Fetching IPO calendar:`, params);
            
            const data = await this.makeRequest('ipo-calendar', params);
            
            console.log('📦 IPO calendar received:', data);
            
            // Finnhub retourne { ipoCalendar: [...] }
            let ipoArray = [];
            
            if (data.ipoCalendar && Array.isArray(data.ipoCalendar)) {
                ipoArray = data.ipoCalendar;
            } else if (Array.isArray(data)) {
                ipoArray = data;
            }
            
            return {
                from: from,
                to: to,
                data: ipoArray.map(item => ({
                    date: item.date,
                    symbol: item.symbol,
                    name: item.name,
                    exchange: item.exchange,
                    price: item.price || 'TBD',
                    numberOfShares: item.numberOfShares || 0,
                    totalSharesValue: item.totalSharesValue || 0,
                    status: item.status
                })),
                count: ipoArray.length,
                status: 'ok'
            };
            
        } catch (error) {
            console.error('IPO calendar error:', error);
            return {
                from: from,
                to: to,
                data: [],
                count: 0,
                status: 'error',
                error: error.message
            };
        }
    }
    
    // ============================================
    // LEGACY / DEPRECATED METHODS (Pour compatibilité)
    // ============================================
    
    /**
     * ❌ DEPRECATED - Technical indicators (PREMIUM)
     * Conservé pour compatibilité mais retourne null
     */
    async getTechnicalIndicator(symbol, indicator, interval = '1day', timePeriod = 14) {
        console.warn('⚠️ Technical indicators endpoint is not available (PREMIUM feature)');
        return null;
    }
    
    /**
     * ❌ DEPRECATED - Statistics (PREMIUM)
     * Conservé pour compatibilité mais retourne null
     */
    async getStatistics(symbol) {
        console.warn('⚠️ Statistics endpoint is not available (PREMIUM feature)');
        return null;
    }
}

// Export pour utilisation dans les modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FinanceAPIClient;
}