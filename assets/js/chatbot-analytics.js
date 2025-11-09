// ============================================
// ADVANCED FINANCIAL ANALYTICS
// Market Data & Stock Analysis
// ============================================

class FinancialAnalytics {
    constructor(config) {
        this.config = config;
        this.finnhubApiKey = config.api.finnhub.apiKey;
        this.finnhubEndpoint = config.api.finnhub.endpoint;
        
        // Cache for API responses
        this.cache = new Map();
        this.cacheTimeout = 300000; // 5 minutes
        
        // Rate limiting
        this.requestQueue = [];
        this.isProcessingQueue = false;
        this.maxRequestsPerMinute = 30;
        this.requestTimestamps = [];
    }

    // ============================================
    // MARKET OVERVIEW
    // ============================================
    async getMarketOverview() {
        try {
            const cacheKey = 'market_overview';
            const cached = this.getFromCache(cacheKey);
            if (cached) return cached;

            // Fetch major indices
            const [sp500, nasdaq, dow, vix] = await Promise.all([
                this.getQuote('SPY'),  // S&P 500 ETF
                this.getQuote('QQQ'),  // NASDAQ ETF
                this.getQuote('DIA'),  // Dow Jones ETF
                this.getQuote('VIX')   // Volatility Index
            ]);

            const overview = {
                sp500: this.formatQuoteData(sp500, 'S&P 500'),
                nasdaq: this.formatQuoteData(nasdaq, 'NASDAQ'),
                dow: this.formatQuoteData(dow, 'Dow Jones'),
                vix: this.formatQuoteData(vix, 'VIX'),
                sentiment: this.calculateMarketSentiment(sp500, vix),
                timestamp: Date.now()
            };

            this.saveToCache(cacheKey, overview);
            return overview;

        } catch (error) {
            console.error('Market overview error:', error);
            return this.getMockMarketData();
        }
    }

    // ============================================
    // GET STOCK DATA
    // ============================================
    async getStockData(symbol) {
        try {
            const cacheKey = `stock_${symbol}`;
            const cached = this.getFromCache(cacheKey);
            if (cached) return cached;

            const [quote, profile, metrics] = await Promise.all([
                this.getQuote(symbol),
                this.getCompanyProfile(symbol),
                this.getBasicFinancials(symbol)
            ]);

            const stockData = {
                symbol: symbol,
                quote: quote,
                profile: profile,
                metrics: metrics,
                analysis: this.analyzeStock(quote, metrics),
                timestamp: Date.now()
            };

            this.saveToCache(cacheKey, stockData);
            return stockData;

        } catch (error) {
            console.error('Stock data error:', error);
            throw error;
        }
    }

    // ============================================
    // GET QUOTE
    // ============================================
    async getQuote(symbol) {
        try {
            const data = await this.makeRequest(`/quote?symbol=${symbol}`);
            return data;
        } catch (error) {
            console.error(`Quote error for ${symbol}:`, error);
            return null;
        }
    }

    // ============================================
    // GET COMPANY PROFILE
    // ============================================
    async getCompanyProfile(symbol) {
        try {
            const data = await this.makeRequest(`/stock/profile2?symbol=${symbol}`);
            return data;
        } catch (error) {
            console.error(`Profile error for ${symbol}:`, error);
            return null;
        }
    }

    // ============================================
    // GET BASIC FINANCIALS
    // ============================================
    async getBasicFinancials(symbol) {
        try {
            const data = await this.makeRequest(`/stock/metric?symbol=${symbol}&metric=all`);
            return data?.metric || null;
        } catch (error) {
            console.error(`Financials error for ${symbol}:`, error);
            return null;
        }
    }

    // ============================================
    // GET HISTORICAL DATA
    // ============================================
    async getHistoricalData(symbol, from, to) {
        try {
            const fromTimestamp = Math.floor(new Date(from).getTime() / 1000);
            const toTimestamp = Math.floor(new Date(to).getTime() / 1000);
            
            const data = await this.makeRequest(
                `/stock/candle?symbol=${symbol}&resolution=D&from=${fromTimestamp}&to=${toTimestamp}`
            );
            
            return this.formatHistoricalData(data);
        } catch (error) {
            console.error(`Historical data error for ${symbol}:`, error);
            return null;
        }
    }

    // ============================================
    // GET IPO CALENDAR
    // ============================================
    async getIPOCalendar(from, to) {
        try {
            const data = await this.makeRequest(
                `/calendar/ipo?from=${from}&to=${to}`
            );
            return data?.ipoCalendar || [];
        } catch (error) {
            console.error('IPO calendar error:', error);
            return [];
        }
    }

    // ============================================
    // MAKE API REQUEST
    // ============================================
    async makeRequest(endpoint) {
        // Check rate limit
        await this.enforceRateLimit();

        const url = `${this.finnhubEndpoint}${endpoint}&token=${this.finnhubApiKey}`;
        
        try {
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Track request
            this.requestTimestamps.push(Date.now());
            
            return data;
            
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // ============================================
    // RATE LIMITING
    // ============================================
    async enforceRateLimit() {
        const now = Date.now();
        const oneMinuteAgo = now - 60000;
        
        // Clean old timestamps
        this.requestTimestamps = this.requestTimestamps.filter(
            timestamp => timestamp > oneMinuteAgo
        );
        
        // Check if limit reached
        if (this.requestTimestamps.length >= this.maxRequestsPerMinute) {
            const oldestRequest = this.requestTimestamps[0];
            const waitTime = 60000 - (now - oldestRequest);
            
            if (waitTime > 0) {
                console.log(`⏳ Rate limit: waiting ${waitTime}ms`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }
    }

    // ============================================
    // FORMAT QUOTE DATA
    // ============================================
    formatQuoteData(quote, name) {
        if (!quote) return null;
        
        const change = quote.c - quote.pc;
        const changePercent = (change / quote.pc) * 100;
        
        return {
            name: name,
            price: quote.c,
            previousClose: quote.pc,
            change: change,
            changePercent: changePercent,
            high: quote.h,
            low: quote.l,
            open: quote.o,
            volume: quote.v
        };
    }

    // ============================================
    // FORMAT HISTORICAL DATA
    // ============================================
    formatHistoricalData(data) {
        if (!data || data.s !== 'ok') return null;
        
        const formatted = [];
        for (let i = 0; i < data.t.length; i++) {
            formatted.push({
                timestamp: data.t[i] * 1000,
                date: new Date(data.t[i] * 1000),
                open: data.o[i],
                high: data.h[i],
                low: data.l[i],
                close: data.c[i],
                volume: data.v[i]
            });
        }
        
        return formatted;
    }

    // ============================================
    // ANALYZE STOCK
    // ============================================
    analyzeStock(quote, metrics) {
        if (!quote || !metrics) return null;
        
        const analysis = {
            momentum: this.analyzeMomentum(quote),
            valuation: this.analyzeValuation(metrics),
            fundamentals: this.analyzeFundamentals(metrics),
            signals: []
        };
        
        // Generate signals
        if (analysis.momentum === 'bullish') {
            analysis.signals.push('Strong upward momentum');
        }
        if (metrics.peNormalizedAnnual < 15) {
            analysis.signals.push('Undervalued based on P/E');
        }
        if (metrics.revenueGrowthTTMYoy > 20) {
            analysis.signals.push('Strong revenue growth');
        }
        
        return analysis;
    }

    // ============================================
    // ANALYZE MOMENTUM
    // ============================================
    analyzeMomentum(quote) {
        if (!quote) return 'neutral';
        
        const changePercent = ((quote.c - quote.pc) / quote.pc) * 100;
        
        if (changePercent > 2) return 'bullish';
        if (changePercent < -2) return 'bearish';
        return 'neutral';
    }

    // ============================================
    // ANALYZE VALUATION
    // ============================================
    analyzeValuation(metrics) {
        if (!metrics) return 'neutral';
        
        const pe = metrics.peNormalizedAnnual;
        
        if (!pe) return 'unknown';
        if (pe < 15) return 'undervalued';
        if (pe > 30) return 'overvalued';
        return 'fair';
    }

    // ============================================
    // ANALYZE FUNDAMENTALS
    // ============================================
    analyzeFundamentals(metrics) {
        if (!metrics) return 'neutral';
        
        const score = {
            growth: 0,
            profitability: 0,
            financial_health: 0
        };
        
        // Growth
        if (metrics.revenueGrowthTTMYoy > 20) score.growth = 2;
        else if (metrics.revenueGrowthTTMYoy > 10) score.growth = 1;
        
        // Profitability
        if (metrics.netProfitMarginTTM > 20) score.profitability = 2;
        else if (metrics.netProfitMarginTTM > 10) score.profitability = 1;
        
        // Financial health
        if (metrics.currentRatioAnnual > 2) score.financial_health = 2;
        else if (metrics.currentRatioAnnual > 1) score.financial_health = 1;
        
        const totalScore = score.growth + score.profitability + score.financial_health;
        
        if (totalScore >= 5) return 'strong';
        if (totalScore >= 3) return 'good';
        if (totalScore >= 1) return 'fair';
        return 'weak';
    }

    // ============================================
    // CALCULATE MARKET SENTIMENT
    // ============================================
    calculateMarketSentiment(sp500, vix) {
        if (!sp500 || !vix) return 'Neutral';
        
        const sp500Change = ((sp500.c - sp500.pc) / sp500.pc) * 100;
        const vixLevel = vix.c;
        
        if (sp500Change > 1 && vixLevel < 15) return 'Very Bullish';
        if (sp500Change > 0 && vixLevel < 20) return 'Bullish';
        if (sp500Change < -1 && vixLevel > 25) return 'Very Bearish';
        if (sp500Change < 0 && vixLevel > 20) return 'Bearish';
        
        return 'Neutral';
    }

    // ============================================
    // CACHE MANAGEMENT
    // ============================================
    getFromCache(key) {
        const cached = this.cache.get(key);
        
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }
        
        return null;
    }

    saveToCache(key, data) {
        this.cache.set(key, {
            data: data,
            timestamp: Date.now()
        });
        
        // Cleanup old entries
        if (this.cache.size > 50) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
    }

    clearCache() {
        this.cache.clear();
    }

    // ============================================
    // MOCK DATA (Fallback)
    // ============================================
    getMockMarketData() {
        return {
            sp500: {
                name: 'S&P 500',
                price: 4500,
                change: 25.5,
                changePercent: 0.57
            },
            nasdaq: {
                name: 'NASDAQ',
                price: 14200,
                change: 85.2,
                changePercent: 0.60
            },
            dow: {
                name: 'Dow Jones',
                price: 35000,
                change: 150.0,
                changePercent: 0.43
            },
            vix: {
                name: 'VIX',
                price: 16.5,
                change: -0.8,
                changePercent: -4.62
            },
            sentiment: 'Bullish',
            timestamp: Date.now()
        };
    }
}

// ============================================
// EXPORT
// ============================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FinancialAnalytics;
}