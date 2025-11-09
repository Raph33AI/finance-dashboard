// ============================================
// ADVANCED FINANCIAL ANALYTICS
// Real Market Data Integration
// ============================================

class FinancialAnalytics {
    constructor(config) {
        this.config = config;
        this.finnhubApiKey = config.api.finnhub.apiKey;
        this.finnhubEndpoint = config.api.finnhub.endpoint;
        this.twelveDataApiKey = config.api.twelveData.apiKey;
        this.twelveDataEndpoint = config.api.twelveData.endpoint;
        
        this.cache = new Map();
        this.cacheTimeout = 60000; // 1 minute cache
        
        this.requestTimestamps = [];
        this.maxRequestsPerMinute = 30;
    }

    // ============================================
    // GET REAL-TIME STOCK DATA
    // ============================================
    async getStockData(symbol) {
        try {
            console.log(`📊 Fetching real data for ${symbol}...`);
            
            const cacheKey = `stock_${symbol}`;
            const cached = this.getFromCache(cacheKey);
            if (cached) {
                console.log(`✅ Using cached data for ${symbol}`);
                return cached;
            }

            // Fetch from Finnhub
            const [quote, profile, metrics] = await Promise.all([
                this.getQuote(symbol),
                this.getCompanyProfile(symbol),
                this.getBasicFinancials(symbol)
            ]);

            if (!quote || quote.c === 0) {
                console.warn(`⚠️ No quote data for ${symbol}`);
                return null;
            }

            const stockData = {
                symbol: symbol,
                quote: {
                    current: quote.c,
                    previousClose: quote.pc,
                    change: quote.c - quote.pc,
                    changePercent: ((quote.c - quote.pc) / quote.pc * 100).toFixed(2),
                    high: quote.h,
                    low: quote.l,
                    open: quote.o,
                    volume: quote.v,
                    timestamp: quote.t
                },
                profile: profile ? {
                    name: profile.name,
                    ticker: profile.ticker,
                    exchange: profile.exchange,
                    industry: profile.finnhubIndustry,
                    sector: profile.finnhubIndustry,
                    marketCap: profile.marketCapitalization,
                    country: profile.country,
                    currency: profile.currency,
                    ipo: profile.ipo,
                    logo: profile.logo,
                    phone: profile.phone,
                    weburl: profile.weburl
                } : null,
                metrics: metrics ? {
                    peRatio: metrics.peNormalizedAnnual,
                    eps: metrics.epsBasicTTM,
                    beta: metrics.beta,
                    week52High: metrics['52WeekHigh'],
                    week52Low: metrics['52WeekLow'],
                    marketCap: metrics.marketCapitalization,
                    dividendYield: metrics.dividendYieldIndicatedAnnual,
                    revenueGrowth: metrics.revenueGrowthTTMYoy,
                    profitMargin: metrics.netProfitMarginTTM,
                    roe: metrics.roeTTM,
                    roa: metrics.roaTTM,
                    debtToEquity: metrics.totalDebt2EquityAnnual,
                    currentRatio: metrics.currentRatioAnnual,
                    priceToBook: metrics.pbAnnual,
                    priceToSales: metrics.psTTM
                } : null,
                timestamp: Date.now(),
                dataSource: 'Finnhub Real-Time'
            };

            this.saveToCache(cacheKey, stockData);
            console.log(`✅ Real data fetched for ${symbol}:`, stockData.quote.current);
            
            return stockData;

        } catch (error) {
            console.error(`❌ Error fetching stock data for ${symbol}:`, error);
            return null;
        }
    }

    // ============================================
    // GET MARKET OVERVIEW
    // ============================================
    async getMarketOverview() {
        try {
            console.log('📊 Fetching market overview...');
            
            const cacheKey = 'market_overview';
            const cached = this.getFromCache(cacheKey);
            if (cached) return cached;

            const [sp500, nasdaq, dow] = await Promise.all([
                this.getQuote('SPY'),
                this.getQuote('QQQ'),
                this.getQuote('DIA')
            ]);

            const overview = {
                sp500: this.formatIndexData(sp500, 'S&P 500', 'SPY'),
                nasdaq: this.formatIndexData(nasdaq, 'NASDAQ', 'QQQ'),
                dow: this.formatIndexData(dow, 'Dow Jones', 'DIA'),
                timestamp: Date.now(),
                dataSource: 'Finnhub Real-Time'
            };

            this.saveToCache(cacheKey, overview);
            console.log('✅ Market overview fetched');
            
            return overview;

        } catch (error) {
            console.error('❌ Market overview error:', error);
            return null;
        }
    }

    // ============================================
    // GET TIME SERIES DATA (for charts)
    // ============================================
    async getTimeSeries(symbol, interval = '1day', outputsize = 30) {
        try {
            console.log(`\n📈 ═══ FETCHING TIME SERIES ═══`);
            console.log(`   Symbol: ${symbol}`);
            console.log(`   Interval: ${interval}`);
            console.log(`   Output size: ${outputsize}`);
            
            const cacheKey = `timeseries_${symbol}_${interval}_${outputsize}`;
            const cached = this.getFromCache(cacheKey);
            if (cached) {
                console.log(`   ✅ Using cached data (${cached.data.length} points)`);
                return cached;
            }

            const limitedSize = Math.min(outputsize, 5000);

            if (!this.twelveDataApiKey || this.twelveDataApiKey === 'TA_CLE_TWELVE_DATA_ICI') {
                console.warn('   ⚠️ Twelve Data API key not configured');
                console.log('   ℹ️  Add your key in chatbot-config.js');
                console.log('   ℹ️  Get free key at: https://twelvedata.com/');
                return this.generateMockTimeSeries(symbol, limitedSize);
            }

            const url = `${this.twelveDataEndpoint}/time_series?symbol=${symbol}&interval=${interval}&outputsize=${limitedSize}&apikey=${this.twelveDataApiKey}`;
            
            console.log(`   📡 Calling API...`);
            console.log(`   URL: ${url.substring(0, 80)}...`);
            
            const response = await fetch(url);
            const data = await response.json();

            console.log(`   📥 API Response:`, {
                status: data.status,
                hasValues: !!data.values,
                valueCount: data.values?.length || 0,
                message: data.message
            });

            if (data.status === 'error' || !data.values) {
                console.warn(`   ⚠️ API Error: ${data.message || 'No values'}`);
                if (data.code === 429) {
                    console.warn('   ⚠️ Rate limit exceeded - using mock data');
                }
                return this.generateMockTimeSeries(symbol, limitedSize);
            }

            const timeSeries = {
                symbol: symbol,
                interval: interval,
                data: data.values.map(item => ({
                    datetime: item.datetime,
                    timestamp: new Date(item.datetime).getTime(),
                    open: parseFloat(item.open),
                    high: parseFloat(item.high),
                    low: parseFloat(item.low),
                    close: parseFloat(item.close),
                    volume: parseInt(item.volume || 0)
                })).reverse(),
                timestamp: Date.now(),
                dataSource: 'Twelve Data Real-Time'
            };

            this.saveToCache(cacheKey, timeSeries);
            
            console.log(`   ✅ SUCCESS!`);
            console.log(`   Data points: ${timeSeries.data.length}`);
            console.log(`   First date: ${timeSeries.data[0]?.datetime}`);
            console.log(`   Last date: ${timeSeries.data[timeSeries.data.length - 1]?.datetime}`);
            console.log(`   First price: $${timeSeries.data[0]?.close}`);
            console.log(`   Last price: $${timeSeries.data[timeSeries.data.length - 1]?.close}`);
            console.log(`═══════════════════════════════\n`);
            
            return timeSeries;

        } catch (error) {
            console.error(`   ❌ FETCH ERROR:`, error);
            console.log(`═══════════════════════════════\n`);
            return this.generateMockTimeSeries(symbol, outputsize);
        }
    }

    // ============================================
    // FINNHUB API CALLS
    // ============================================
    async getQuote(symbol) {
        if (!this.finnhubApiKey || this.finnhubApiKey === 'TA_CLE_FINNHUB_ICI') {
            console.warn(`⚠️ Finnhub API key not configured`);
            return null;
        }

        try {
            await this.enforceRateLimit();
            
            const url = `${this.finnhubEndpoint}/quote?symbol=${symbol}&token=${this.finnhubApiKey}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Finnhub API error: ${response.status}`);
            }
            
            const data = await response.json();
            this.trackRequest();
            
            return data;
            
        } catch (error) {
            console.error(`Quote error for ${symbol}:`, error);
            return null;
        }
    }

    async getCompanyProfile(symbol) {
        if (!this.finnhubApiKey || this.finnhubApiKey === 'TA_CLE_FINNHUB_ICI') {
            return null;
        }

        try {
            await this.enforceRateLimit();
            
            const url = `${this.finnhubEndpoint}/stock/profile2?symbol=${symbol}&token=${this.finnhubApiKey}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Finnhub API error: ${response.status}`);
            }
            
            const data = await response.json();
            this.trackRequest();
            
            return data;
            
        } catch (error) {
            console.error(`Profile error for ${symbol}:`, error);
            return null;
        }
    }

    async getBasicFinancials(symbol) {
        if (!this.finnhubApiKey || this.finnhubApiKey === 'TA_CLE_FINNHUB_ICI') {
            return null;
        }

        try {
            await this.enforceRateLimit();
            
            const url = `${this.finnhubEndpoint}/stock/metric?symbol=${symbol}&metric=all&token=${this.finnhubApiKey}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Finnhub API error: ${response.status}`);
            }
            
            const data = await response.json();
            this.trackRequest();
            
            return data?.metric || null;
            
        } catch (error) {
            console.error(`Financials error for ${symbol}:`, error);
            return null;
        }
    }

    // ============================================
    // HELPER METHODS
    // ============================================
    formatIndexData(quote, name, symbol) {
        if (!quote) return null;
        
        const change = quote.c - quote.pc;
        const changePercent = (change / quote.pc * 100).toFixed(2);
        
        return {
            name: name,
            symbol: symbol,
            price: quote.c.toFixed(2),
            change: change.toFixed(2),
            changePercent: changePercent,
            high: quote.h.toFixed(2),
            low: quote.l.toFixed(2),
            open: quote.o.toFixed(2),
            volume: quote.v
        };
    }

    async enforceRateLimit() {
        const now = Date.now();
        const oneMinuteAgo = now - 60000;
        
        this.requestTimestamps = this.requestTimestamps.filter(
            timestamp => timestamp > oneMinuteAgo
        );
        
        if (this.requestTimestamps.length >= this.maxRequestsPerMinute) {
            const waitTime = 60000 - (now - this.requestTimestamps[0]);
            if (waitTime > 0) {
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }
    }

    trackRequest() {
        this.requestTimestamps.push(Date.now());
    }

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
        
        if (this.cache.size > 100) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
    }

    clearCache() {
        this.cache.clear();
    }

    // ============================================
    // MOCK DATA (FALLBACK UNIQUEMENT)
    // ============================================
    generateMockTimeSeries(symbol, count) {
        console.warn(`⚠️ Generating mock time series for ${symbol}`);
        
        const data = [];
        let basePrice = 100 + Math.random() * 100;
        const now = Date.now();
        const dayMs = 86400000;
        
        for (let i = count - 1; i >= 0; i--) {
            const timestamp = now - (i * dayMs);
            const date = new Date(timestamp);
            
            const open = basePrice;
            const close = open + (Math.random() - 0.5) * 10;
            const high = Math.max(open, close) + Math.random() * 5;
            const low = Math.min(open, close) - Math.random() * 5;
            
            data.push({
                datetime: date.toISOString().split('T')[0],
                timestamp: timestamp,
                open: parseFloat(open.toFixed(2)),
                high: parseFloat(high.toFixed(2)),
                low: parseFloat(low.toFixed(2)),
                close: parseFloat(close.toFixed(2)),
                volume: Math.floor(Math.random() * 10000000)
            });
            
            basePrice = close;
        }
        
        return {
            symbol: symbol,
            interval: '1day',
            data: data,
            timestamp: Date.now(),
            dataSource: 'Mock Data (Fallback)'
        };
    }
}

// ============================================
// EXPORT
// ============================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FinancialAnalytics;
}