// ============================================
// ADVANCED FINANCIAL ANALYTICS v4.0 - FULL FINNHUB EDITION
// Tous les endpoints gratuits de Finnhub intégrés
// Compatible avec ChatbotConfig &amp; Worker Cloudflare
// ============================================

class FinancialAnalytics {
    constructor(config) {
        this.config = config;
        
        // ✅ Configuration Worker URL (multi-sources)
        this.workerBaseUrl = 
            config?.api?.worker?.baseUrl ||
            config?.API_BASE_URL ||
            window.ChatbotConfig?.api?.worker?.baseUrl ||
            window.CONFIG?.API_BASE_URL ||
            'https://finance-hub-api.raphnardone.workers.dev';
        
        this.cache = new Map();
        this.cacheTimeout = 60000; // 1 minute cache
        
        this.requestTimestamps = [];
        this.maxRequestsPerMinute = 30;
        
        console.log('📊 FinancialAnalytics v4.0 - FULL FINNHUB EDITION');
        console.log('🌐 Worker URL:', this.workerBaseUrl);
        console.log('✅ Available endpoints: Quote, Profile, Financials, News, Sentiment, Recommendations, Earnings, IPO, Peers, Price Target, Upgrades/Downgrades');
    }

    // ============================================
    // CORE STOCK DATA (Quote + Profile + Metrics)
    // ============================================
    
    async getStockData(symbol) {
        try {
            console.log(`\n📊 ═══ FETCHING COMPLETE STOCK DATA ═══`);
            console.log(`   Symbol: ${symbol}`);
            
            const cacheKey = `stock_complete_${symbol}`;
            const cached = this.getFromCache(cacheKey);
            if (cached) {
                console.log(`   ✅ Using cached data`);
                return cached;
            }

            console.log(`   📡 Calling multiple APIs...`);
            
            // ✅ Parallel fetch : Quote (Twelve Data) + Profile (Finnhub) + Financials (Finnhub)
            const [quote, profile, metrics] = await Promise.all([
                this.getQuote(symbol),
                this.getCompanyProfile(symbol),
                this.getBasicFinancials(symbol)
            ]);

            if (!quote) {
                console.warn(`   ⚠ No quote data for ${symbol}`);
                return null;
            }

            const stockData = {
                symbol: symbol,
                quote: {
                    current: parseFloat(quote.close || quote.price || quote.c || 0),
                    previousClose: parseFloat(quote.previous_close || quote.pc || 0),
                    change: parseFloat(quote.change || 0),
                    changePercent: parseFloat(quote.percent_change || 0),
                    high: parseFloat(quote.high || quote.h || 0),
                    low: parseFloat(quote.low || quote.l || 0),
                    open: parseFloat(quote.open || quote.o || 0),
                    volume: parseInt(quote.volume || quote.v || 0),
                    timestamp: quote.timestamp || Date.now()
                },
                profile: profile ? {
                    name: profile.name || symbol,
                    ticker: profile.ticker || profile.symbol || symbol,
                    exchange: profile.exchange || 'N/A',
                    industry: profile.finnhubIndustry || profile.sector || 'N/A',
                    sector: profile.finnhubIndustry || profile.sector || 'N/A',
                    marketCap: profile.marketCapitalization || 0,
                    country: profile.country || 'N/A',
                    currency: profile.currency || 'USD',
                    ipo: profile.ipo || 'N/A',
                    logo: profile.logo || '',
                    phone: profile.phone || 'N/A',
                    weburl: profile.weburl || '',
                    shareOutstanding: profile.shareOutstanding || 0
                } : null,
                metrics: metrics ? {
                    peRatio: parseFloat(metrics.peNormalizedAnnual || metrics['peBasicExclExtraTTM'] || 0),
                    eps: parseFloat(metrics.epsBasicTTM || metrics['epsBasicExclExtraItemsAnnual'] || 0),
                    beta: parseFloat(metrics.beta || 0),
                    week52High: parseFloat(metrics['52WeekHigh'] || 0),
                    week52Low: parseFloat(metrics['52WeekLow'] || 0),
                    marketCap: parseFloat(metrics.marketCapitalization || 0),
                    dividendYield: parseFloat(metrics.dividendYieldIndicatedAnnual || 0),
                    revenueGrowth: parseFloat(metrics.revenueGrowthTTMYoy || 0),
                    profitMargin: parseFloat(metrics.netProfitMarginTTM || metrics.netProfitMarginAnnual || 0),
                    roe: parseFloat(metrics.roeTTM || 0),
                    roa: parseFloat(metrics.roaTTM || 0),
                    debtToEquity: parseFloat(metrics.totalDebt2EquityAnnual || 0),
                    currentRatio: parseFloat(metrics.currentRatioAnnual || 0),
                    priceToBook: parseFloat(metrics.pbAnnual || 0),
                    priceToSales: parseFloat(metrics.psTTM || 0),
                    grossMargin: parseFloat(metrics.grossMarginAnnual || 0),
                    operatingMargin: parseFloat(metrics.operatingMarginAnnual || 0),
                    week52Return: parseFloat(metrics['52WeekPriceReturnDaily'] || 0)
                } : null,
                timestamp: Date.now(),
                dataSource: 'Twelve Data + Finnhub via Worker'
            };

            this.saveToCache(cacheKey, stockData);
            
            console.log(`   ✅ SUCCESS!`);
            console.log(`   💰 Price: $${stockData.quote.current}`);
            console.log(`   📊 Change: ${stockData.quote.changePercent}%`);
            console.log(`   🏢 Company: ${stockData.profile?.name || 'N/A'}`);
            console.log(`   📈 P/E: ${stockData.metrics?.peRatio || 'N/A'}`);
            console.log(`═══════════════════════════════\n`);
            
            return stockData;

        } catch (error) {
            console.error(`   ❌ ERROR:`, error);
            console.log(`═══════════════════════════════\n`);
            return null;
        }
    }

    // ============================================
    // NEWS ENDPOINTS
    // ============================================
    
    /**
     * Get Market News by Category
     * @param {string} category - general, forex, crypto, merger
     * @returns {Array} News articles
     */
    async getMarketNews(category = 'general') {
        try {
            console.log(`📰 Fetching market news: ${category}`);
            
            const cacheKey = `market_news_${category}`;
            const cached = this.getFromCache(cacheKey);
            if (cached) return cached;

            const url = `${this.workerBaseUrl}/api/news?category=${category}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                console.error(`Market news API error: ${response.status}`);
                return [];
            }
            
            const data = await response.json();
            const newsArray = Array.isArray(data) ? data : (data.news || data.data || []);
            
            const transformedNews = newsArray.map(item => ({
                id: item.id || `${item.datetime || Date.now()}_${Math.random()}`,
                category: item.category || category,
                headline: item.headline || 'No headline',
                summary: item.summary || '',
                source: item.source || 'Finnhub',
                url: item.url || '#',
                image: item.image || '',
                datetime: new Date(item.datetime * 1000),
                timestamp: item.datetime * 1000,
                related: item.related || []
            }));
            
            this.saveToCache(cacheKey, transformedNews);
            
            console.log(`✅ Loaded ${transformedNews.length} market news articles`);
            return transformedNews;
            
        } catch (error) {
            console.error('Market news error:', error);
            return [];
        }
    }

    /**
     * Get Company-Specific News
     * @param {string} symbol - Stock symbol
     * @param {string} from - Start date (YYYY-MM-DD)
     * @param {string} to - End date (YYYY-MM-DD)
     * @returns {Array} News articles
     */
    async getCompanyNews(symbol, from = null, to = null) {
        try {
            if (!to) {
                to = new Date().toISOString().split('T')[0];
            }
            if (!from) {
                const fromDate = new Date();
                fromDate.setDate(fromDate.getDate() - 7);
                from = fromDate.toISOString().split('T')[0];
            }
            
            console.log(`📰 Fetching company news: ${symbol} (${from} to ${to})`);
            
            const cacheKey = `company_news_${symbol}_${from}_${to}`;
            const cached = this.getFromCache(cacheKey);
            if (cached) return cached;

            const url = `${this.workerBaseUrl}/api/company-news?symbol=${symbol}&amp;from=${from}&amp;to=${to}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                console.error(`Company news API error: ${response.status}`);
                return [];
            }
            
            const data = await response.json();
            const newsArray = Array.isArray(data) ? data : (data.news || data.data || []);
            
            const transformedNews = newsArray.map(item => ({
                id: item.id || `${item.datetime || Date.now()}_${Math.random()}`,
                symbol: symbol,
                headline: item.headline || 'No headline',
                summary: item.summary || '',
                source: item.source || 'Finnhub',
                url: item.url || '#',
                image: item.image || '',
                datetime: new Date(item.datetime * 1000),
                timestamp: item.datetime * 1000,
                related: item.related || []
            }));
            
            this.saveToCache(cacheKey, transformedNews);
            
            console.log(`✅ Loaded ${transformedNews.length} company news articles`);
            return transformedNews;
            
        } catch (error) {
            console.error('Company news error:', error);
            return [];
        }
    }

    /**
     * Analyze News Sentiment (Custom AI Analysis)
     * @param {string} symbol - Stock symbol
     * @returns {Object} Sentiment analysis
     */
    async analyzeNewsImpact(symbol) {
        try {
            console.log(`🤖 Analyzing news sentiment for ${symbol}`);
            
            // Fetch recent news
            const news = await this.getCompanyNews(symbol);
            
            if (news.length === 0) {
                return {
                    overallSentiment: { sentiment: 0, label: 'Neutral' },
                    shortTermImpact: { direction: 'Neutral', confidence: 'Low' },
                    longTermImpact: { direction: 'Neutral', confidence: 'Low' },
                    recommendation: 'Insufficient data for analysis'
                };
            }
            
            // Simple sentiment analysis
            const positiveWords = ['gain', 'profit', 'growth', 'surge', 'rally', 'bullish', 'upgrade', 'strong', 'positive', 'beat', 'outperform', 'rise', 'jump', 'soar', 'record', 'high', 'success', 'boost'];
            const negativeWords = ['loss', 'decline', 'fall', 'drop', 'bearish', 'downgrade', 'weak', 'negative', 'miss', 'underperform', 'plunge', 'crash', 'sink', 'concern', 'risk', 'warning'];
            
            let totalSentiment = 0;
            news.forEach(item => {
                const text = (item.headline + ' ' + item.summary).toLowerCase();
                let score = 0;
                
                positiveWords.forEach(word => {
                    if (text.includes(word)) score += 0.1;
                });
                
                negativeWords.forEach(word => {
                    if (text.includes(word)) score -= 0.1;
                });
                
                totalSentiment += score;
            });
            
            const avgSentiment = totalSentiment / news.length;
            
            let sentimentLabel = 'Neutral';
            let shortTermDirection = 'Neutral';
            let longTermDirection = 'Neutral';
            let recommendation = 'Hold - Monitor for changes';
            
            if (avgSentiment > 0.05) {
                sentimentLabel = 'Positive';
                shortTermDirection = 'Positive';
                longTermDirection = 'Positive';
                recommendation = 'Consider buying - Positive sentiment detected';
            } else if (avgSentiment < -0.05) {
                sentimentLabel = 'Negative';
                shortTermDirection = 'Negative';
                longTermDirection = 'Negative';
                recommendation = 'Exercise caution - Negative sentiment detected';
            }
            
            return {
                overallSentiment: {
                    sentiment: avgSentiment,
                    label: sentimentLabel
                },
                shortTermImpact: {
                    direction: shortTermDirection,
                    confidence: news.length > 10 ? 'High' : news.length > 5 ? 'Medium' : 'Low'
                },
                longTermImpact: {
                    direction: longTermDirection,
                    confidence: news.length > 10 ? 'Medium' : 'Low'
                },
                recommendation: recommendation,
                newsCount: news.length
            };
            
        } catch (error) {
            console.error('News sentiment analysis error:', error);
            return {
                overallSentiment: { sentiment: 0, label: 'Error' },
                shortTermImpact: { direction: 'Unknown', confidence: 'Low' },
                longTermImpact: { direction: 'Unknown', confidence: 'Low' },
                recommendation: 'Unable to analyze sentiment'
            };
        }
    }

    // ============================================
    // ANALYST RECOMMENDATIONS
    // ============================================
    
    /**
     * Get Analyst Recommendations
     * @param {string} symbol - Stock symbol
     * @returns {Array} Recommendation trends
     */
    async getRecommendationTrends(symbol) {
        try {
            console.log(`👥 Fetching analyst recommendations for ${symbol}`);
            
            const cacheKey = `recommendations_${symbol}`;
            const cached = this.getFromCache(cacheKey);
            if (cached) return cached;

            const url = `${this.workerBaseUrl}/api/recommendation-trends?symbol=${symbol}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                console.error(`Recommendations API error: ${response.status}`);
                return [];
            }
            
            const data = await response.json();
            const recommendations = Array.isArray(data) ? data : (data.data || []);
            
            this.saveToCache(cacheKey, recommendations);
            
            console.log(`✅ Loaded ${recommendations.length} recommendation periods`);
            return recommendations;
            
        } catch (error) {
            console.error('Recommendations error:', error);
            return [];
        }
    }

    /**
     * Get Price Target
     * @param {string} symbol - Stock symbol
     * @returns {Object} Price target data
     */
    async getPriceTarget(symbol) {
        try {
            console.log(`🎯 Fetching price target for ${symbol}`);
            
            const cacheKey = `price_target_${symbol}`;
            const cached = this.getFromCache(cacheKey);
            if (cached) return cached;

            const url = `${this.workerBaseUrl}/api/price-target?symbol=${symbol}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                console.error(`Price target API error: ${response.status}`);
                return null;
            }
            
            const data = await response.json();
            
            this.saveToCache(cacheKey, data);
            
            console.log(`✅ Price target loaded: $${data.targetMean}`);
            return data;
            
        } catch (error) {
            console.error('Price target error:', error);
            return null;
        }
    }

    /**
     * Get Upgrade/Downgrade History
     * @param {string} symbol - Stock symbol (optional)
     * @param {string} from - Start date (optional)
     * @param {string} to - End date (optional)
     * @returns {Array} Upgrade/downgrade events
     */
    async getUpgradeDowngrade(symbol = null, from = null, to = null) {
        try {
            console.log(`📊 Fetching upgrade/downgrade data`);
            
            const params = new URLSearchParams();
            if (symbol) params.append('symbol', symbol);
            if (from) params.append('from', from);
            if (to) params.append('to', to);
            
            const cacheKey = `upgrades_${symbol || 'all'}_${from || ''}_${to || ''}`;
            const cached = this.getFromCache(cacheKey);
            if (cached) return cached;

            const url = `${this.workerBaseUrl}/api/upgrade-downgrade?${params.toString()}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                console.error(`Upgrade/downgrade API error: ${response.status}`);
                return [];
            }
            
            const data = await response.json();
            const changes = Array.isArray(data) ? data : (data.data || []);
            
            this.saveToCache(cacheKey, changes);
            
            console.log(`✅ Loaded ${changes.length} upgrade/downgrade events`);
            return changes;
            
        } catch (error) {
            console.error('Upgrade/downgrade error:', error);
            return [];
        }
    }

    // ============================================
    // EARNINGS &amp; FINANCIALS
    // ============================================
    
    /**
     * Get Earnings Calendar
     * @param {string} from - Start date (YYYY-MM-DD)
     * @param {string} to - End date (YYYY-MM-DD)
     * @param {string} symbol - Stock symbol (optional)
     * @returns {Array} Earnings events
     */
    async getEarningsCalendar(from = null, to = null, symbol = null) {
        try {
            if (!to) {
                to = new Date().toISOString().split('T')[0];
            }
            if (!from) {
                const fromDate = new Date();
                fromDate.setDate(fromDate.getDate() - 7);
                from = fromDate.toISOString().split('T')[0];
            }
            
            console.log(`📅 Fetching earnings calendar (${from} to ${to})`);
            
            const params = new URLSearchParams({ from, to });
            if (symbol) params.append('symbol', symbol);
            
            const cacheKey = `earnings_calendar_${from}_${to}_${symbol || 'all'}`;
            const cached = this.getFromCache(cacheKey);
            if (cached) return cached;

            const url = `${this.workerBaseUrl}/api/earnings-calendar?${params.toString()}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                console.error(`Earnings calendar API error: ${response.status}`);
                return [];
            }
            
            const data = await response.json();
            const events = data.earningsCalendar || data.data || [];
            
            this.saveToCache(cacheKey, events);
            
            console.log(`✅ Loaded ${events.length} earnings events`);
            return events;
            
        } catch (error) {
            console.error('Earnings calendar error:', error);
            return [];
        }
    }

    /**
     * Get Historical Earnings
     * @param {string} symbol - Stock symbol
     * @returns {Array} Historical earnings
     */
    async getEarnings(symbol) {
        try {
            console.log(`💰 Fetching historical earnings for ${symbol}`);
            
            const cacheKey = `earnings_${symbol}`;
            const cached = this.getFromCache(cacheKey);
            if (cached) return cached;

            const url = `${this.workerBaseUrl}/api/earnings-surprises?symbol=${symbol}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                console.error(`Earnings API error: ${response.status}`);
                return [];
            }
            
            const data = await response.json();
            const earnings = Array.isArray(data) ? data : (data.data || []);
            
            this.saveToCache(cacheKey, earnings);
            
            console.log(`✅ Loaded ${earnings.length} earnings reports`);
            return earnings;
            
        } catch (error) {
            console.error('Earnings error:', error);
            return [];
        }
    }

    /**
     * Get Revenue Estimates
     * @param {string} symbol - Stock symbol
     * @param {string} freq - Frequency (quarterly or annual)
     * @returns {Array} Revenue estimates
     */
    async getRevenueEstimates(symbol, freq = 'quarterly') {
        try {
            console.log(`💵 Fetching revenue estimates for ${symbol} (${freq})`);
            
            const cacheKey = `revenue_${symbol}_${freq}`;
            const cached = this.getFromCache(cacheKey);
            if (cached) return cached;

            const url = `${this.workerBaseUrl}/api/revenue-estimates?symbol=${symbol}&amp;freq=${freq}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                console.error(`Revenue estimates API error: ${response.status}`);
                return [];
            }
            
            const data = await response.json();
            const estimates = Array.isArray(data) ? data : (data.data || []);
            
            this.saveToCache(cacheKey, estimates);
            
            console.log(`✅ Loaded ${estimates.length} revenue estimates`);
            return estimates;
            
        } catch (error) {
            console.error('Revenue estimates error:', error);
            return [];
        }
    }

    /**
     * Get EPS Estimates
     * @param {string} symbol - Stock symbol
     * @param {string} freq - Frequency (quarterly or annual)
     * @returns {Array} EPS estimates
     */
    async getEPSEstimates(symbol, freq = 'quarterly') {
        try {
            console.log(`📊 Fetching EPS estimates for ${symbol} (${freq})`);
            
            const cacheKey = `eps_${symbol}_${freq}`;
            const cached = this.getFromCache(cacheKey);
            if (cached) return cached;

            const url = `${this.workerBaseUrl}/api/eps-estimates?symbol=${symbol}&amp;freq=${freq}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                console.error(`EPS estimates API error: ${response.status}`);
                return [];
            }
            
            const data = await response.json();
            const estimates = Array.isArray(data) ? data : (data.data || []);
            
            this.saveToCache(cacheKey, estimates);
            
            console.log(`✅ Loaded ${estimates.length} EPS estimates`);
            return estimates;
            
        } catch (error) {
            console.error('EPS estimates error:', error);
            return [];
        }
    }

    // ============================================
    // IPO &amp; PEERS
    // ============================================
    
    /**
     * Get IPO Calendar
     * @param {string} from - Start date (YYYY-MM-DD)
     * @param {string} to - End date (YYYY-MM-DD)
     * @returns {Array} IPO events
     */
    async getIPOCalendar(from = null, to = null) {
        try {
            if (!to) {
                to = new Date().toISOString().split('T')[0];
            }
            if (!from) {
                const fromDate = new Date();
                fromDate.setDate(fromDate.getDate() - 30);
                from = fromDate.toISOString().split('T')[0];
            }
            
            console.log(`🚀 Fetching IPO calendar (${from} to ${to})`);
            
            const cacheKey = `ipo_calendar_${from}_${to}`;
            const cached = this.getFromCache(cacheKey);
            if (cached) return cached;

            const url = `${this.workerBaseUrl}/api/ipo-calendar?from=${from}&amp;to=${to}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                console.error(`IPO calendar API error: ${response.status}`);
                return [];
            }
            
            const data = await response.json();
            const ipos = data.ipoCalendar || data.data || [];
            
            this.saveToCache(cacheKey, ipos);
            
            console.log(`✅ Loaded ${ipos.length} IPO events`);
            return ipos;
            
        } catch (error) {
            console.error('IPO calendar error:', error);
            return [];
        }
    }

    /**
     * Get Company Peers
     * @param {string} symbol - Stock symbol
     * @returns {Array} Peer symbols
     */
    async getPeers(symbol) {
        try {
            console.log(`🔗 Fetching peers for ${symbol}`);
            
            const cacheKey = `peers_${symbol}`;
            const cached = this.getFromCache(cacheKey);
            if (cached) return cached;

            const url = `${this.workerBaseUrl}/api/peers?symbol=${symbol}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                console.error(`Peers API error: ${response.status}`);
                return [];
            }
            
            const data = await response.json();
            const peers = Array.isArray(data) ? data : (data.peers || data.data || []);
            
            this.saveToCache(cacheKey, peers);
            
            console.log(`✅ Loaded ${peers.length} peers`);
            return peers;
            
        } catch (error) {
            console.error('Peers error:', error);
            return [];
        }
    }

    // ============================================
    // TIME SERIES &amp; MARKET DATA
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

            const url = `${this.workerBaseUrl}/api/time-series?symbol=${symbol}&amp;interval=${interval}&amp;outputsize=${limitedSize}`;
            
            console.log(`   📡 Calling API...`);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                console.warn(`   ⚠ API error: ${response.status}`);
                return this.generateMockTimeSeries(symbol, limitedSize);
            }
            
            const data = await response.json();

            let values = data.data || data.values;
            
            if (!values || values.length === 0) {
                console.warn(`   ⚠ No time series data from API`);
                return this.generateMockTimeSeries(symbol, limitedSize);
            }

            const timeSeries = {
                symbol: symbol,
                interval: interval,
                data: values.map(item => {
                    if (item.timestamp) {
                        return item;
                    }
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

            if (timeSeries.data.length > 1) {
                const firstTimestamp = timeSeries.data[0].timestamp;
                const lastTimestamp = timeSeries.data[timeSeries.data.length - 1].timestamp;
                
                if (firstTimestamp > lastTimestamp) {
                    timeSeries.data.reverse();
                }
            }

            this.saveToCache(cacheKey, timeSeries);
            
            console.log(`   ✅ SUCCESS!`);
            console.log(`   Data points: ${timeSeries.data.length}`);
            console.log(`═══════════════════════════════\n`);
            
            return timeSeries;

        } catch (error) {
            console.error(`   ❌ FETCH ERROR:`, error);
            console.log(`═══════════════════════════════\n`);
            return this.generateMockTimeSeries(symbol, outputsize);
        }
    }

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
                sp500: this.formatIndexData(sp500, 'S&amp;P 500', 'SPY'),
                nasdaq: this.formatIndexData(nasdaq, 'NASDAQ', 'QQQ'),
                dow: this.formatIndexData(dow, 'Dow Jones', 'DIA'),
                timestamp: Date.now(),
                dataSource: 'Twelve Data via Worker'
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
    // WORKER API CALLS (BASE METHODS)
    // ============================================
    
    async getQuote(symbol) {
        try {
            await this.enforceRateLimit();
            
            const url = `${this.workerBaseUrl}/api/quote?symbol=${symbol}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                console.error(`Worker API error for quote ${symbol}: ${response.status}`);
                return null;
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
        try {
            await this.enforceRateLimit();
            
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
            
            const url = `${this.workerBaseUrl}/api/finnhub/basic-financials?symbol=${symbol}&amp;metric=all`;
            const response = await fetch(url);
            
            if (!response.ok) {
                console.error(`Worker API error for financials ${symbol}: ${response.status}`);
                return null;
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
        
        const current = parseFloat(quote.close || quote.price || quote.c || 0);
        const previousClose = parseFloat(quote.previous_close || quote.pc || 0);
        const change = current - previousClose;
        const changePercent = previousClose > 0 ? (change / previousClose * 100) : 0;
        
        return {
            name: name,
            symbol: symbol,
            price: current.toFixed(2),
            change: change.toFixed(2),
            changePercent: changePercent.toFixed(2),
            high: parseFloat(quote.high || quote.h || 0).toFixed(2),
            low: parseFloat(quote.low || quote.l || 0).toFixed(2),
            open: parseFloat(quote.open || quote.o || 0).toFixed(2),
            volume: parseInt(quote.volume || quote.v || 0)
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
                console.log(`⏳ Rate limit: waiting ${waitTime}ms...`);
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

window.FinancialAnalytics = FinancialAnalytics;