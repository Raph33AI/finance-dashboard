// ============================================
// ADVANCED FINANCIAL ANALYTICS
// Version Worker - Finance Hub API
// ============================================

class FinancialAnalytics {
    constructor(config) {
        this.config = config;
        
        // ✅ CORRECTION : Utiliser le Worker au lieu des clés API directes
        this.workerBaseUrl = config.api.worker.baseUrl;
        
        this.cache = new Map();
        this.cacheTimeout = 60000; // 1 minute cache
        
        this.requestTimestamps = [];
        this.maxRequestsPerMinute = 30;
        
        console.log('📊 FinancialAnalytics initialized');
        console.log('🌐 Worker URL:', this.workerBaseUrl);
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

            // ✅ Fetch via Worker (Finnhub endpoints)
            const [quote, profile, metrics] = await Promise.all([
                this.getQuote(symbol),
                this.getCompanyProfile(symbol),
                this.getBasicFinancials(symbol)
            ]);

            if (!quote || quote.c === 0) {
                console.warn(`⚠ No quote data for ${symbol}`);
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
                dataSource: 'Finnhub via Worker'
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

            // ✅ Fetch major indices via Worker
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
                dataSource: 'Finnhub via Worker'
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

            // ✅ CORRECTION : Appel via Worker (pas besoin de vérifier la clé API)
            const url = `${this.workerBaseUrl}/api/time-series?symbol=${symbol}&interval=${interval}&outputsize=${limitedSize}`;
            
            console.log(`   📡 Calling Worker API...`);
            console.log(`   URL: ${url}`);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                console.warn(`   ⚠ Worker API error: ${response.status}`);
                return this.generateMockTimeSeries(symbol, limitedSize);
            }
            
            const data = await response.json();

            console.log(`   📥 Worker Response:`, {
                hasData: !!data.data,
                hasValues: !!data.values,
                dataCount: data.data?.length || data.values?.length || 0
            });

            // ✅ Le Worker peut retourner soit data.data (transformé) soit data.values (raw)
            let values = data.data || data.values;
            
            if (!values || values.length === 0) {
                console.warn(`   ⚠ No time series data from Worker`);
                return this.generateMockTimeSeries(symbol, limitedSize);
            }

            // ✅ Transformer les données si nécessaire
            const timeSeries = {
                symbol: symbol,
                interval: interval,
                data: values.map(item => {
                    // Si les données sont déjà transformées (ont un timestamp)
                    if (item.timestamp) {
                        return item;
                    }
                    // Sinon, transformer depuis le format raw Twelve Data
                    return {
                        datetime: item.datetime,
                        timestamp: new Date(item.datetime).getTime(),
                        open: parseFloat(item.open),
                        high: parseFloat(item.high),
                        low: parseFloat(item.low),
                        close: parseFloat(item.close),
                        volume: parseInt(item.volume || 0)
                    };
                }),
                timestamp: Date.now(),
                dataSource: 'Twelve Data via Worker'
            };

            // ✅ S'assurer que les données sont dans le bon ordre (les plus anciennes en premier)
            if (timeSeries.data.length > 1) {
                const firstTimestamp = timeSeries.data[0].timestamp;
                const lastTimestamp = timeSeries.data[timeSeries.data.length - 1].timestamp;
                
                // Si les données sont dans l'ordre inverse, les inverser
                if (firstTimestamp > lastTimestamp) {
                    timeSeries.data.reverse();
                }
            }

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
    // WORKER API CALLS (Finnhub endpoints)
    // ============================================
    async getQuote(symbol) {
        try {
            await this.enforceRateLimit();
            
            // ✅ CORRECTION : Appel via Worker
            const url = `${this.workerBaseUrl}/api/quote?symbol=${symbol}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                console.error(`Worker API error for quote ${symbol}: ${response.status}`);
                return null;
            }
            
            const data = await response.json();
            
            // ✅ Le Worker peut retourner directement les données ou les wrapper
            // Si le Worker retourne { c, pc, h, l, o, v, t }, c'est bon
            // Si le Worker retourne { data: { c, pc, ... } }, extraire data
            const quote = data.c !== undefined ? data : data.data;
            
            this.trackRequest();
            
            return quote;
            
        } catch (error) {
            console.error(`Quote error for ${symbol}:`, error);
            return null;
        }
    }

    async getCompanyProfile(symbol) {
        try {
            await this.enforceRateLimit();
            
            // ✅ CORRECTION : Appel via Worker Finnhub
            const url = `${this.workerBaseUrl}/api/finnhub/company-profile?symbol=${symbol}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                console.error(`Worker API error for profile ${symbol}: ${response.status}`);
                return null;
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
        try {
            await this.enforceRateLimit();
            
            // ✅ CORRECTION : Appel via Worker Finnhub
            const url = `${this.workerBaseUrl}/api/finnhub/basic-financials?symbol=${symbol}&metric=all`;
            const response = await fetch(url);
            
            if (!response.ok) {
                console.error(`Worker API error for financials ${symbol}: ${response.status}`);
                return null;
            }
            
            const data = await response.json();
            
            this.trackRequest();
            
            // Le Worker Finnhub retourne { metric: {...} }
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
        console.warn(`⚠ Generating mock time series for ${symbol}`);
        
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