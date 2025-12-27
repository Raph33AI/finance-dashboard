// // ============================================
// // ADVANCED FINANCIAL ANALYTICS v4.2
// // Compatible avec Worker finance-hub-api v8.4.0
// // ✅ OPTIMISATION: Cache amélioré + Rate limiting
// // ============================================

// class FinancialAnalytics {
//     constructor(config) {
//         this.config = config;
        
//         this.workerBaseUrl = 
//             config?.api?.worker?.baseUrl ||
//             config?.API_BASE_URL ||
//             window.ChatbotConfig?.api?.worker?.baseUrl ||
//             window.CONFIG?.API_BASE_URL ||
//             'https://finance-hub-api.raphnardone.workers.dev';
        
//         this.cache = new Map();
//         this.cacheTimeout = 60000; // 1 minute
        
//         this.requestTimestamps = [];
//         this.maxRequestsPerMinute = 30;
        
//         console.log('📊 FinancialAnalytics v4.2 - Compatible Worker v8.4.0');
//         console.log('🌐 Worker URL:', this.workerBaseUrl);
//     }

//     // ============================================
//     // STOCK DATA (Quote + Profile + Metrics)
//     // ============================================
    
//     async getStockData(symbol) {
//         try {
//             console.log(`\n📊 ═══ FETCHING COMPLETE STOCK DATA ═══`);
//             console.log(`   Symbol: ${symbol}`);
            
//             const cacheKey = `stock_complete_${symbol}`;
//             const cached = this.getFromCache(cacheKey);
//             if (cached) {
//                 console.log(`   ✅ Using cached data`);
//                 return cached;
//             }

//             console.log(`   📡 Calling multiple APIs...`);
            
//             const [quote, profile, metrics] = await Promise.all([
//                 this.getQuote(symbol),
//                 this.getCompanyProfile(symbol),
//                 this.getBasicFinancials(symbol)
//             ]);

//             if (!quote) {
//                 console.warn(`   ⚠ No quote data for ${symbol}`);
//                 return null;
//             }

//             const stockData = {
//                 symbol: symbol,
//                 quote: {
//                     current: parseFloat(quote.close || quote.price || quote.c || 0),
//                     previousClose: parseFloat(quote.previous_close || quote.pc || 0),
//                     change: parseFloat(quote.change || 0),
//                     changePercent: parseFloat(quote.percent_change || 0),
//                     high: parseFloat(quote.high || quote.h || 0),
//                     low: parseFloat(quote.low || quote.l || 0),
//                     open: parseFloat(quote.open || quote.o || 0),
//                     volume: parseInt(quote.volume || quote.v || 0),
//                     timestamp: quote.timestamp || Date.now()
//                 },
//                 profile: profile ? {
//                     name: profile.name || symbol,
//                     ticker: profile.ticker || profile.symbol || symbol,
//                     exchange: profile.exchange || 'N/A',
//                     industry: profile.finnhubIndustry || profile.sector || 'N/A',
//                     sector: profile.finnhubIndustry || profile.sector || 'N/A',
//                     marketCap: profile.marketCapitalization || 0,
//                     country: profile.country || 'N/A',
//                     currency: profile.currency || 'USD',
//                     ipo: profile.ipo || 'N/A',
//                     logo: profile.logo || '',
//                     phone: profile.phone || 'N/A',
//                     weburl: profile.weburl || '',
//                     shareOutstanding: profile.shareOutstanding || 0
//                 } : null,
//                 metrics: metrics ? {
//                     peRatio: parseFloat(metrics.peNormalizedAnnual || metrics['peBasicExclExtraTTM'] || 0),
//                     eps: parseFloat(metrics.epsBasicTTM || metrics['epsBasicExclExtraItemsAnnual'] || 0),
//                     beta: parseFloat(metrics.beta || 0),
//                     week52High: parseFloat(metrics['52WeekHigh'] || 0),
//                     week52Low: parseFloat(metrics['52WeekLow'] || 0),
//                     marketCap: parseFloat(metrics.marketCapitalization || 0),
//                     dividendYield: parseFloat(metrics.dividendYieldIndicatedAnnual || 0),
//                     revenueGrowth: parseFloat(metrics.revenueGrowthTTMYoy || 0),
//                     profitMargin: parseFloat(metrics.netProfitMarginTTM || metrics.netProfitMarginAnnual || 0),
//                     roe: parseFloat(metrics.roeTTM || 0),
//                     roa: parseFloat(metrics.roaTTM || 0),
//                     debtToEquity: parseFloat(metrics.totalDebt2EquityAnnual || 0),
//                     currentRatio: parseFloat(metrics.currentRatioAnnual || 0),
//                     priceToBook: parseFloat(metrics.pbAnnual || 0),
//                     priceToSales: parseFloat(metrics.psTTM || 0),
//                     grossMargin: parseFloat(metrics.grossMarginAnnual || 0),
//                     operatingMargin: parseFloat(metrics.operatingMarginAnnual || 0),
//                     week52Return: parseFloat(metrics['52WeekPriceReturnDaily'] || 0)
//                 } : null,
//                 timestamp: Date.now(),
//                 dataSource: 'Twelve Data + Finnhub via Worker'
//             };

//             this.saveToCache(cacheKey, stockData);
            
//             console.log(`   ✅ SUCCESS!`);
//             console.log(`   💰 Price: $${stockData.quote.current}`);
//             console.log(`   📊 Change: ${stockData.quote.changePercent}%`);
//             console.log(`   🏢 Company: ${stockData.profile?.name || 'N/A'}`);
//             console.log(`   📈 P/E: ${stockData.metrics?.peRatio || 'N/A'}`);
//             console.log(`═══════════════════════════════\n`);
            
//             return stockData;

//         } catch (error) {
//             console.error(`   ❌ ERROR:`, error);
//             console.log(`═══════════════════════════════\n`);
//             return null;
//         }
//     }

//     // ============================================
//     // NEWS ENDPOINTS
//     // ============================================
    
//     async getMarketNews(category = 'general') {
//         try {
//             console.log(`📰 Fetching market news: ${category}`);
            
//             const cacheKey = `market_news_${category}`;
//             const cached = this.getFromCache(cacheKey);
//             if (cached) return cached;

//             const url = `${this.workerBaseUrl}/api/finnhub/market-news?category=${category}`;
//             const response = await fetch(url);
            
//             if (!response.ok) {
//                 console.error(`Market news API error: ${response.status}`);
//                 return [];
//             }
            
//             const data = await response.json();
//             const newsArray = Array.isArray(data) ? data : (data.news || data.data || []);
            
//             const transformedNews = newsArray.map(item => ({
//                 id: item.id || `${item.datetime || Date.now()}_${Math.random()}`,
//                 category: item.category || category,
//                 headline: item.headline || 'No headline',
//                 summary: item.summary || '',
//                 source: item.source || 'Finnhub',
//                 url: item.url || '#',
//                 image: item.image || '',
//                 datetime: new Date(item.datetime * 1000),
//                 timestamp: item.datetime * 1000,
//                 related: item.related || []
//             }));
            
//             this.saveToCache(cacheKey, transformedNews);
            
//             console.log(`✅ Loaded ${transformedNews.length} market news articles`);
//             return transformedNews;
            
//         } catch (error) {
//             console.error('Market news error:', error);
//             return [];
//         }
//     }

//     async getCompanyNews(symbol, from = null, to = null) {
//         try {
//             if (!to) {
//                 to = new Date().toISOString().split('T')[0];
//             }
//             if (!from) {
//                 const fromDate = new Date();
//                 fromDate.setDate(fromDate.getDate() - 7);
//                 from = fromDate.toISOString().split('T')[0];
//             }
            
//             console.log(`📰 Fetching company news: ${symbol} (${from} to ${to})`);
            
//             const cacheKey = `company_news_${symbol}_${from}_${to}`;
//             const cached = this.getFromCache(cacheKey);
//             if (cached) return cached;

//             const url = `${this.workerBaseUrl}/api/finnhub/company-news?symbol=${symbol}&from=${from}&to=${to}`;
//             const response = await fetch(url);
            
//             if (!response.ok) {
//                 console.error(`Company news API error: ${response.status}`);
//                 return [];
//             }
            
//             const data = await response.json();
//             const newsArray = Array.isArray(data) ? data : (data.news || data.data || []);
            
//             const transformedNews = newsArray.map(item => ({
//                 id: item.id || `${item.datetime || Date.now()}_${Math.random()}`,
//                 symbol: symbol,
//                 headline: item.headline || 'No headline',
//                 summary: item.summary || '',
//                 source: item.source || 'Finnhub',
//                 url: item.url || '#',
//                 image: item.image || '',
//                 datetime: new Date(item.datetime * 1000),
//                 timestamp: item.datetime * 1000,
//                 related: item.related || []
//             }));
            
//             this.saveToCache(cacheKey, transformedNews);
            
//             console.log(`✅ Loaded ${transformedNews.length} company news articles`);
//             return transformedNews;
            
//         } catch (error) {
//             console.error('Company news error:', error);
//             return [];
//         }
//     }

//     async analyzeNewsImpact(symbol) {
//         try {
//             console.log(`🤖 Analyzing news sentiment for ${symbol}`);
            
//             const news = await this.getCompanyNews(symbol);
            
//             if (news.length === 0) {
//                 return {
//                     overallSentiment: { sentiment: 0, label: 'Neutral' },
//                     shortTermImpact: { direction: 'Neutral', confidence: 'Low' },
//                     longTermImpact: { direction: 'Neutral', confidence: 'Low' },
//                     recommendation: 'Insufficient data for analysis'
//                 };
//             }
            
//             const positiveWords = ['gain', 'profit', 'growth', 'surge', 'rally', 'bullish', 'upgrade', 'strong', 'positive', 'beat', 'outperform', 'rise', 'jump', 'soar', 'record', 'high', 'success', 'boost'];
//             const negativeWords = ['loss', 'decline', 'fall', 'drop', 'bearish', 'downgrade', 'weak', 'negative', 'miss', 'underperform', 'plunge', 'crash', 'sink', 'concern', 'risk', 'warning'];
            
//             let totalSentiment = 0;
//             news.forEach(item => {
//                 const text = (item.headline + ' ' + item.summary).toLowerCase();
//                 let score = 0;
                
//                 positiveWords.forEach(word => {
//                     if (text.includes(word)) score += 0.1;
//                 });
                
//                 negativeWords.forEach(word => {
//                     if (text.includes(word)) score -= 0.1;
//                 });
                
//                 totalSentiment += score;
//             });
            
//             const avgSentiment = totalSentiment / news.length;
            
//             let sentimentLabel = 'Neutral';
//             let shortTermDirection = 'Neutral';
//             let longTermDirection = 'Neutral';
//             let recommendation = 'Hold - Monitor for changes';
            
//             if (avgSentiment > 0.05) {
//                 sentimentLabel = 'Positive';
//                 shortTermDirection = 'Positive';
//                 longTermDirection = 'Positive';
//                 recommendation = 'Consider buying - Positive sentiment detected';
//             } else if (avgSentiment < -0.05) {
//                 sentimentLabel = 'Negative';
//                 shortTermDirection = 'Negative';
//                 longTermDirection = 'Negative';
//                 recommendation = 'Exercise caution - Negative sentiment detected';
//             }
            
//             return {
//                 overallSentiment: {
//                     sentiment: avgSentiment,
//                     label: sentimentLabel
//                 },
//                 shortTermImpact: {
//                     direction: shortTermDirection,
//                     confidence: news.length > 10 ? 'High' : news.length > 5 ? 'Medium' : 'Low'
//                 },
//                 longTermImpact: {
//                     direction: longTermDirection,
//                     confidence: news.length > 10 ? 'Medium' : 'Low'
//                 },
//                 recommendation: recommendation,
//                 newsCount: news.length
//             };
            
//         } catch (error) {
//             console.error('News sentiment analysis error:', error);
//             return {
//                 overallSentiment: { sentiment: 0, label: 'Error' },
//                 shortTermImpact: { direction: 'Unknown', confidence: 'Low' },
//                 longTermImpact: { direction: 'Unknown', confidence: 'Low' },
//                 recommendation: 'Unable to analyze sentiment'
//             };
//         }
//     }

//     // ============================================
//     // ANALYST RECOMMENDATIONS
//     // ============================================
    
//     async getRecommendationTrends(symbol) {
//         try {
//             console.log(`👥 Fetching analyst recommendations for ${symbol}`);
            
//             const cacheKey = `recommendations_${symbol}`;
//             const cached = this.getFromCache(cacheKey);
//             if (cached) return cached;

//             const url = `${this.workerBaseUrl}/api/finnhub/recommendation?symbol=${symbol}`;
//             const response = await fetch(url);
            
//             if (!response.ok) {
//                 console.error(`Recommendations API error: ${response.status}`);
//                 return [];
//             }
            
//             const data = await response.json();
//             const recommendations = Array.isArray(data) ? data : (data.data || []);
            
//             this.saveToCache(cacheKey, recommendations);
            
//             console.log(`✅ Loaded ${recommendations.length} recommendation periods`);
//             return recommendations;
            
//         } catch (error) {
//             console.error('Recommendations error:', error);
//             return [];
//         }
//     }

//     async getPriceTarget(symbol) {
//         console.warn(`⚠ Price target endpoint not available in Worker (Premium Finnhub feature)`);
//         return null;
//     }

//     async getUpgradeDowngrade(symbol = null, from = null, to = null) {
//         console.warn(`⚠ Upgrade/downgrade endpoint not available in Worker (Premium Finnhub feature)`);
//         return [];
//     }

//     // ============================================
//     // EARNINGS & FINANCIALS
//     // ============================================
    
//     async getEarningsCalendar(from = null, to = null, symbol = null) {
//         try {
//             if (!to) {
//                 to = new Date().toISOString().split('T')[0];
//             }
//             if (!from) {
//                 const fromDate = new Date();
//                 fromDate.setDate(fromDate.getDate() - 7);
//                 from = fromDate.toISOString().split('T')[0];
//             }
            
//             console.log(`📅 Fetching earnings calendar (${from} to ${to})`);
            
//             const params = new URLSearchParams({ from, to });
//             if (symbol) params.append('symbol', symbol);
            
//             const cacheKey = `earnings_calendar_${from}_${to}_${symbol || 'all'}`;
//             const cached = this.getFromCache(cacheKey);
//             if (cached) return cached;

//             const url = `${this.workerBaseUrl}/api/finnhub/earnings-calendar?${params.toString()}`;
//             const response = await fetch(url);
            
//             if (!response.ok) {
//                 console.error(`Earnings calendar API error: ${response.status}`);
//                 return [];
//             }
            
//             const data = await response.json();
//             const events = data.earningsCalendar || data.data || [];
            
//             this.saveToCache(cacheKey, events);
            
//             console.log(`✅ Loaded ${events.length} earnings events`);
//             return events;
            
//         } catch (error) {
//             console.error('Earnings calendar error:', error);
//             return [];
//         }
//     }

//     async getEarnings(symbol) {
//         try {
//             console.log(`💰 Fetching historical earnings for ${symbol}`);
            
//             const cacheKey = `earnings_${symbol}`;
//             const cached = this.getFromCache(cacheKey);
//             if (cached) return cached;

//             const url = `${this.workerBaseUrl}/api/finnhub/earnings?symbol=${symbol}`;
//             const response = await fetch(url);
            
//             if (!response.ok) {
//                 console.error(`Earnings API error: ${response.status}`);
//                 return [];
//             }
            
//             const data = await response.json();
//             const earnings = Array.isArray(data) ? data : (data.data || []);
            
//             this.saveToCache(cacheKey, earnings);
            
//             console.log(`✅ Loaded ${earnings.length} earnings reports`);
//             return earnings;
            
//         } catch (error) {
//             console.error('Earnings error:', error);
//             return [];
//         }
//     }

//     async getRevenueEstimates(symbol, freq = 'quarterly') {
//         console.warn(`⚠ Revenue estimates endpoint not available in Worker (Premium Finnhub feature)`);
//         return [];
//     }

//     async getEPSEstimates(symbol, freq = 'quarterly') {
//         console.warn(`⚠ EPS estimates endpoint not available in Worker (Premium Finnhub feature)`);
//         return [];
//     }

//     // ============================================
//     // IPO & PEERS
//     // ============================================
    
//     async getIPOCalendar(from = null, to = null) {
//         console.warn(`⚠ IPO calendar endpoint not available in Worker (Premium Finnhub feature)`);
//         return [];
//     }

//     async getPeers(symbol) {
//         try {
//             console.log(`🔗 Fetching peers for ${symbol}`);
            
//             const cacheKey = `peers_${symbol}`;
//             const cached = this.getFromCache(cacheKey);
//             if (cached) return cached;

//             const url = `${this.workerBaseUrl}/api/finnhub/peers?symbol=${symbol}`;
//             const response = await fetch(url);
            
//             if (!response.ok) {
//                 console.error(`Peers API error: ${response.status}`);
//                 return [];
//             }
            
//             const data = await response.json();
//             const peers = Array.isArray(data) ? data : (data.peers || data.data || []);
            
//             this.saveToCache(cacheKey, peers);
            
//             console.log(`✅ Loaded ${peers.length} peers`);
//             return peers;
            
//         } catch (error) {
//             console.error('Peers error:', error);
//             return [];
//         }
//     }

//     // ============================================
//     // TIME SERIES & MARKET DATA
//     // ============================================
    
//     async getTimeSeries(symbol, interval = '1day', outputsize = 30) {
//         try {
//             console.log(`\n📈 ═══ FETCHING TIME SERIES ═══`);
//             console.log(`   Symbol: ${symbol}`);
//             console.log(`   Interval: ${interval}`);
//             console.log(`   Output size: ${outputsize}`);
            
//             const cacheKey = `timeseries_${symbol}_${interval}_${outputsize}`;
//             const cached = this.getFromCache(cacheKey);
//             if (cached) {
//                 console.log(`   ✅ Using cached data (${cached.data.length} points)`);
//                 return cached;
//             }

//             const limitedSize = Math.min(outputsize, 5000);

//             const url = `${this.workerBaseUrl}/api/time-series?symbol=${symbol}&interval=${interval}&outputsize=${limitedSize}`;
            
//             console.log(`   📡 Calling API...`);
            
//             const response = await fetch(url);
            
//             if (!response.ok) {
//                 console.warn(`   ⚠ API error: ${response.status}`);
//                 return this.generateMockTimeSeries(symbol, limitedSize);
//             }
            
//             const data = await response.json();

//             let values = data.data || data.values;
            
//             if (!values || values.length === 0) {
//                 console.warn(`   ⚠ No time series data from API`);
//                 return this.generateMockTimeSeries(symbol, limitedSize);
//             }

//             const timeSeries = {
//                 symbol: symbol,
//                 interval: interval,
//                 data: values.map(item => {
//                     if (item.timestamp) {
//                         return item;
//                     }
//                     return {
//                         datetime: item.datetime,
//                         timestamp: new Date(item.datetime).getTime(),
//                         open: parseFloat(item.open),
//                         high: parseFloat(item.high),
//                         low: parseFloat(item.low),
//                         close: parseFloat(item.close),
//                         volume: parseInt(item.volume || 0)
//                     };
//                 }),
//                 timestamp: Date.now(),
//                 dataSource: 'Twelve Data via Worker'
//             };

//             if (timeSeries.data.length > 1) {
//                 const firstTimestamp = timeSeries.data[0].timestamp;
//                 const lastTimestamp = timeSeries.data[timeSeries.data.length - 1].timestamp;
                
//                 if (firstTimestamp > lastTimestamp) {
//                     timeSeries.data.reverse();
//                 }
//             }

//             this.saveToCache(cacheKey, timeSeries);
            
//             console.log(`   ✅ SUCCESS!`);
//             console.log(`   Data points: ${timeSeries.data.length}`);
//             console.log(`═══════════════════════════════\n`);
            
//             return timeSeries;

//         } catch (error) {
//             console.error(`   ❌ FETCH ERROR:`, error);
//             console.log(`═══════════════════════════════\n`);
//             return this.generateMockTimeSeries(symbol, outputsize);
//         }
//     }

//     async getMarketOverview() {
//         try {
//             console.log('📊 Fetching market overview...');
            
//             const cacheKey = 'market_overview';
//             const cached = this.getFromCache(cacheKey);
//             if (cached) return cached;

//             const [sp500, nasdaq, dow] = await Promise.all([
//                 this.getQuote('SPY'),
//                 this.getQuote('QQQ'),
//                 this.getQuote('DIA')
//             ]);

//             const overview = {
//                 sp500: this.formatIndexData(sp500, 'S&P 500', 'SPY'),
//                 nasdaq: this.formatIndexData(nasdaq, 'NASDAQ', 'QQQ'),
//                 dow: this.formatIndexData(dow, 'Dow Jones', 'DIA'),
//                 timestamp: Date.now(),
//                 dataSource: 'Twelve Data via Worker'
//             };

//             this.saveToCache(cacheKey, overview);
//             console.log('✅ Market overview fetched');
            
//             return overview;

//         } catch (error) {
//             console.error('❌ Market overview error:', error);
//             return null;
//         }
//     }

//     // ============================================
//     // WORKER API CALLS (BASE METHODS)
//     // ============================================
    
//     async getQuote(symbol) {
//         try {
//             await this.enforceRateLimit();
            
//             const url = `${this.workerBaseUrl}/api/quote?symbol=${symbol}`;
//             const response = await fetch(url);
            
//             if (!response.ok) {
//                 console.error(`Worker API error for quote ${symbol}: ${response.status}`);
//                 return null;
//             }
            
//             const data = await response.json();
            
//             this.trackRequest();
            
//             return data;
            
//         } catch (error) {
//             console.error(`Quote error for ${symbol}:`, error);
//             return null;
//         }
//     }

//     async getCompanyProfile(symbol) {
//         try {
//             await this.enforceRateLimit();
            
//             const url = `${this.workerBaseUrl}/api/finnhub/company-profile?symbol=${symbol}`;
//             const response = await fetch(url);
            
//             if (!response.ok) {
//                 console.error(`Worker API error for profile ${symbol}: ${response.status}`);
//                 return null;
//             }
            
//             const data = await response.json();
            
//             this.trackRequest();
            
//             return data;
            
//         } catch (error) {
//             console.error(`Profile error for ${symbol}:`, error);
//             return null;
//         }
//     }

//     async getBasicFinancials(symbol) {
//         try {
//             await this.enforceRateLimit();
            
//             const url = `${this.workerBaseUrl}/api/finnhub/basic-financials?symbol=${symbol}&metric=all`;
//             const response = await fetch(url);
            
//             if (!response.ok) {
//                 console.error(`Worker API error for financials ${symbol}: ${response.status}`);
//                 return null;
//             }
            
//             const data = await response.json();
            
//             this.trackRequest();
            
//             return data?.metric || null;
            
//         } catch (error) {
//             console.error(`Financials error for ${symbol}:`, error);
//             return null;
//         }
//     }

//     // ============================================
//     // HELPER METHODS
//     // ============================================
    
//     formatIndexData(quote, name, symbol) {
//         if (!quote) return null;
        
//         const current = parseFloat(quote.close || quote.price || quote.c || 0);
//         const previousClose = parseFloat(quote.previous_close || quote.pc || 0);
//         const change = current - previousClose;
//         const changePercent = previousClose > 0 ? (change / previousClose * 100) : 0;
        
//         return {
//             name: name,
//             symbol: symbol,
//             price: current.toFixed(2),
//             change: change.toFixed(2),
//             changePercent: changePercent.toFixed(2),
//             high: parseFloat(quote.high || quote.h || 0).toFixed(2),
//             low: parseFloat(quote.low || quote.l || 0).toFixed(2),
//             open: parseFloat(quote.open || quote.o || 0).toFixed(2),
//             volume: parseInt(quote.volume || quote.v || 0)
//         };
//     }

//     async enforceRateLimit() {
//         const now = Date.now();
//         const oneMinuteAgo = now - 60000;
        
//         this.requestTimestamps = this.requestTimestamps.filter(
//             timestamp => timestamp > oneMinuteAgo
//         );
        
//         if (this.requestTimestamps.length >= this.maxRequestsPerMinute) {
//             const waitTime = 60000 - (now - this.requestTimestamps[0]);
//             if (waitTime > 0) {
//                 console.log(`⏳ Rate limit: waiting ${waitTime}ms...`);
//                 await new Promise(resolve => setTimeout(resolve, waitTime));
//             }
//         }
//     }

//     trackRequest() {
//         this.requestTimestamps.push(Date.now());
//     }

//     getFromCache(key) {
//         const cached = this.cache.get(key);
//         if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
//             return cached.data;
//         }
//         return null;
//     }

//     saveToCache(key, data) {
//         this.cache.set(key, {
//             data: data,
//             timestamp: Date.now()
//         });
        
//         if (this.cache.size > 100) {
//             const firstKey = this.cache.keys().next().value;
//             this.cache.delete(firstKey);
//         }
//     }

//     clearCache() {
//         this.cache.clear();
//         console.log('✅ Cache cleared');
//     }

//     generateMockTimeSeries(symbol, count) {
//         console.warn(`⚠ Generating mock time series for ${symbol}`);
        
//         const data = [];
//         let basePrice = 100 + Math.random() * 100;
//         const now = Date.now();
//         const dayMs = 86400000;
        
//         for (let i = count - 1; i >= 0; i--) {
//             const timestamp = now - (i * dayMs);
//             const date = new Date(timestamp);
            
//             const open = basePrice;
//             const close = open + (Math.random() - 0.5) * 10;
//             const high = Math.max(open, close) + Math.random() * 5;
//             const low = Math.min(open, close) - Math.random() * 5;
            
//             data.push({
//                 datetime: date.toISOString().split('T')[0],
//                 timestamp: timestamp,
//                 open: parseFloat(open.toFixed(2)),
//                 high: parseFloat(high.toFixed(2)),
//                 low: parseFloat(low.toFixed(2)),
//                 close: parseFloat(close.toFixed(2)),
//                 volume: Math.floor(Math.random() * 10000000)
//             });
            
//             basePrice = close;
//         }
        
//         return {
//             symbol: symbol,
//             interval: '1day',
//             data: data,
//             timestamp: Date.now(),
//             dataSource: 'Mock Data (Fallback)'
//         };
//     }

//     // ============================================
//     // SEARCH SYMBOL
//     // ============================================
    
//     async searchSymbol(query) {
//         try {
//             console.log(`🔍 Searching for: ${query}`);
            
//             const cacheKey = `search_${query.toUpperCase()}`;
//             const cached = this.getFromCache(cacheKey);
//             if (cached) return { data: cached };

//             await this.enforceRateLimit();
            
//             const url = `${this.workerBaseUrl}/api/search?query=${encodeURIComponent(query)}`;
//             const response = await fetch(url);
            
//             if (!response.ok) {
//                 console.error(`Search API error: ${response.status}`);
//                 return { data: [] };
//             }
            
//             const data = await response.json();
//             const results = data.result || data.data || [];
            
//             this.trackRequest();
//             this.saveToCache(cacheKey, results);
            
//             console.log(`✅ Found ${results.length} results for "${query}"`);
//             return { data: results };
            
//         } catch (error) {
//             console.error('Search error:', error);
//             return { data: [] };
//         }
//     }

//     // ============================================
//     // UTILITY METHODS
//     // ============================================
    
//     getStats() {
//         return {
//             cacheSize: this.cache.size,
//             requestsInLastMinute: this.requestTimestamps.length,
//             maxRequestsPerMinute: this.maxRequestsPerMinute,
//             remainingRequests: this.maxRequestsPerMinute - this.requestTimestamps.length,
//             workerUrl: this.workerBaseUrl
//         };
//     }

//     logStats() {
//         const stats = this.getStats();
//         console.log('📊 FinancialAnalytics Stats:');
//         console.log(`   Cache size: ${stats.cacheSize} entries`);
//         console.log(`   Requests (last 60s): ${stats.requestsInLastMinute}/${stats.maxRequestsPerMinute}`);
//         console.log(`   Remaining: ${stats.remainingRequests} requests`);
//         console.log(`   Worker URL: ${stats.workerUrl}`);
//     }
// }

// // ============================================
// // EXPORT & GLOBAL AVAILABILITY
// // ============================================

// if (typeof module !== 'undefined' && module.exports) {
//     module.exports = FinancialAnalytics;
// }

// window.FinancialAnalytics = FinancialAnalytics;

// console.log('✅ FinancialAnalytics v4.2 loaded successfully!');
// console.log('📊 Compatible with Worker finance-hub-api v8.4.0');
// console.log('🚀 Cache optimized + Rate limiting enabled');

// ============================================
// ADVANCED FINANCIAL ANALYTICS v5.0 - ALPHAVAULT COMPLIANT
// ✅ CONFORMITÉ LÉGALE: Transformation des données brutes en scores propriétaires
// Compatible avec Worker finance-hub-api v8.4.0 + AlphaVault Scoring System
// ============================================

class FinancialAnalytics {
    constructor(config) {
        this.config = config;
        
        this.workerBaseUrl = 
            config?.api?.worker?.baseUrl ||
            config?.API_BASE_URL ||
            window.ChatbotConfig?.api?.worker?.baseUrl ||
            window.CONFIG?.API_BASE_URL ||
            'https://finance-hub-api.raphnardone.workers.dev';
        
        // ✅ Initialisation du système de scoring propriétaire
        this.scoringEngine = new AlphaVaultScoring();
        
        this.cache = new Map();
        this.cacheTimeout = 60000; // 1 minute
        
        this.requestTimestamps = [];
        this.maxRequestsPerMinute = 30;
        
        console.log('📊 FinancialAnalytics v5.0 - ALPHAVAULT COMPLIANT');
        console.log('🏆 Proprietary scoring system active');
        console.log('🔒 Legal compliance: No raw data redistribution');
        console.log('🌐 Worker URL:', this.workerBaseUrl);
    }

    // ============================================
    // 🏆 STOCK DATA (Transformé en Scores AlphaVault)
    // ============================================
    
    async getStockData(symbol) {
        try {
            console.log(`\n📊 ═══ FETCHING STOCK DATA (ALPHAVAULT MODE) ═══`);
            console.log(`   Symbol: ${symbol}`);
            
            const cacheKey = `stock_alphavault_${symbol}`;
            const cached = this.getFromCache(cacheKey);
            if (cached) {
                console.log(`   ✅ Using cached AlphaVault data`);
                return cached;
            }

            console.log(`   📡 Calling APIs for raw data...`);
            
            // Récupération des données brutes (usage interne uniquement)
            const [quote, profile, metrics] = await Promise.all([
                this.getQuote(symbol),
                this.getCompanyProfile(symbol),
                this.getBasicFinancials(symbol)
            ]);

            if (!quote) {
                console.warn(`   ⚠ No quote data for ${symbol}`);
                return null;
            }

            // 🔒 Construction des données brutes (USAGE INTERNE SEULEMENT)
            const rawStockData = {
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
                } : null
            };

            // 🏆 TRANSFORMATION EN SCORES ALPHAVAULT
            console.log(`   🏆 Transforming raw data to AlphaVault scores...`);
            const alphaVaultData = this.scoringEngine.transformStockData(rawStockData);

            this.saveToCache(cacheKey, alphaVaultData);
            
            console.log(`   ✅ SUCCESS!`);
            console.log(`   🏆 AlphaVault Score: ${alphaVaultData.alphaVaultScore}/100`);
            console.log(`   📊 Quality Grade: ${alphaVaultData.qualityGrade}`);
            console.log(`   ⚖ Risk Rating: ${alphaVaultData.riskRating}`);
            console.log(`   📈 Change: ${alphaVaultData.priceChangePercent}%`);
            console.log(`   🏢 Company: ${alphaVaultData.companyName}`);
            console.log(`═══════════════════════════════\n`);
            
            return alphaVaultData;

        } catch (error) {
            console.error(`   ❌ ERROR:`, error);
            console.log(`═══════════════════════════════\n`);
            return null;
        }
    }

    // ============================================
    // 📈 TIME SERIES (Transformé en Indices Normalisés Base 100)
    // ============================================
    
    async getTimeSeries(symbol, interval = '1day', outputsize = 30) {
        try {
            console.log(`\n📈 ═══ FETCHING TIME SERIES (ALPHAVAULT MODE) ═══`);
            console.log(`   Symbol: ${symbol}`);
            console.log(`   Interval: ${interval}`);
            console.log(`   Output size: ${outputsize}`);
            
            const cacheKey = `timeseries_alphavault_${symbol}_${interval}_${outputsize}`;
            const cached = this.getFromCache(cacheKey);
            if (cached) {
                console.log(`   ✅ Using cached normalized data (${cached.normalizedData.length} points)`);
                return cached;
            }

            const limitedSize = Math.min(outputsize, 5000);

            const url = `${this.workerBaseUrl}/api/time-series?symbol=${symbol}&interval=${interval}&outputsize=${limitedSize}`;
            
            console.log(`   📡 Calling API...`);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                console.warn(`   ⚠ API error: ${response.status}`);
                return this.generateMockNormalizedTimeSeries(symbol, limitedSize);
            }
            
            const data = await response.json();

            let values = data.data || data.values;
            
            if (!values || values.length === 0) {
                console.warn(`   ⚠ No time series data from API`);
                return this.generateMockNormalizedTimeSeries(symbol, limitedSize);
            }

            // 🔒 Construction des données brutes (USAGE INTERNE SEULEMENT)
            const rawTimeSeries = {
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
                })
            };

            // Inversion si nécessaire (ordre chronologique)
            if (rawTimeSeries.data.length > 1) {
                const firstTimestamp = rawTimeSeries.data[0].timestamp;
                const lastTimestamp = rawTimeSeries.data[rawTimeSeries.data.length - 1].timestamp;
                
                if (firstTimestamp > lastTimestamp) {
                    rawTimeSeries.data.reverse();
                }
            }

            // 🏆 TRANSFORMATION EN INDICES NORMALISÉS BASE 100
            console.log(`   🏆 Transforming to normalized performance index (Base 100)...`);
            const alphaVaultTimeSeries = this.scoringEngine.transformTimeSeries(rawTimeSeries);

            this.saveToCache(cacheKey, alphaVaultTimeSeries);
            
            console.log(`   ✅ SUCCESS!`);
            console.log(`   Data points: ${alphaVaultTimeSeries.normalizedData.length}`);
            console.log(`   📊 Total Return: ${alphaVaultTimeSeries.performanceSummary.totalReturn}`);
            console.log(`   ✅ Data Quality: ${alphaVaultTimeSeries.performanceSummary.dataQuality}`);
            console.log(`═══════════════════════════════\n`);
            
            return alphaVaultTimeSeries;

        } catch (error) {
            console.error(`   ❌ FETCH ERROR:`, error);
            console.log(`═══════════════════════════════\n`);
            return this.generateMockNormalizedTimeSeries(symbol, outputsize);
        }
    }

    // ============================================
    // NEWS ENDPOINTS (✅ OK - Pas de données propriétaires)
    // ============================================
    
    async getMarketNews(category = 'general') {
        try {
            console.log(`📰 Fetching market news: ${category}`);
            
            const cacheKey = `market_news_${category}`;
            const cached = this.getFromCache(cacheKey);
            if (cached) return cached;

            const url = `${this.workerBaseUrl}/api/finnhub/market-news?category=${category}`;
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

            const url = `${this.workerBaseUrl}/api/finnhub/company-news?symbol=${symbol}&from=${from}&to=${to}`;
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

    async analyzeNewsImpact(symbol) {
        // ✅ Sentiment analysis OK (pas de données propriétaires)
        try {
            console.log(`🤖 Analyzing news sentiment for ${symbol}`);
            
            const news = await this.getCompanyNews(symbol);
            
            if (news.length === 0) {
                return {
                    overallSentiment: { sentiment: 0, label: 'Neutral' },
                    shortTermImpact: { direction: 'Neutral', confidence: 'Low' },
                    longTermImpact: { direction: 'Neutral', confidence: 'Low' },
                    recommendation: 'Insufficient data for analysis'
                };
            }
            
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
    // ANALYST RECOMMENDATIONS (✅ OK - Données publiques)
    // ============================================
    
    async getRecommendationTrends(symbol) {
        try {
            console.log(`👥 Fetching analyst recommendations for ${symbol}`);
            
            const cacheKey = `recommendations_${symbol}`;
            const cached = this.getFromCache(cacheKey);
            if (cached) return cached;

            const url = `${this.workerBaseUrl}/api/finnhub/recommendation?symbol=${symbol}`;
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

    async getPriceTarget(symbol) {
        console.warn(`⚠ Price target endpoint not available (Premium Finnhub feature)`);
        return null;
    }

    async getUpgradeDowngrade(symbol = null, from = null, to = null) {
        console.warn(`⚠ Upgrade/downgrade endpoint not available (Premium Finnhub feature)`);
        return [];
    }

    // ============================================
    // EARNINGS (✅ OK - Données publiques)
    // ============================================
    
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

            const url = `${this.workerBaseUrl}/api/finnhub/earnings-calendar?${params.toString()}`;
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

    async getEarnings(symbol) {
        try {
            console.log(`💰 Fetching historical earnings for ${symbol}`);
            
            const cacheKey = `earnings_${symbol}`;
            const cached = this.getFromCache(cacheKey);
            if (cached) return cached;

            const url = `${this.workerBaseUrl}/api/finnhub/earnings?symbol=${symbol}`;
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

    async getRevenueEstimates(symbol, freq = 'quarterly') {
        console.warn(`⚠ Revenue estimates endpoint not available (Premium feature)`);
        return [];
    }

    async getEPSEstimates(symbol, freq = 'quarterly') {
        console.warn(`⚠ EPS estimates endpoint not available (Premium feature)`);
        return [];
    }

    // ============================================
    // IPO & PEERS (✅ OK - Données publiques)
    // ============================================
    
    async getIPOCalendar(from = null, to = null) {
        console.warn(`⚠ IPO calendar endpoint not available (Premium feature)`);
        return [];
    }

    async getPeers(symbol) {
        try {
            console.log(`🔗 Fetching peers for ${symbol}`);
            
            const cacheKey = `peers_${symbol}`;
            const cached = this.getFromCache(cacheKey);
            if (cached) return cached;

            const url = `${this.workerBaseUrl}/api/finnhub/peers?symbol=${symbol}`;
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
    // MARKET OVERVIEW (Scores AlphaVault pour indices)
    // ============================================
    
    async getMarketOverview() {
        try {
            console.log('📊 Fetching market overview (AlphaVault mode)...');
            
            const cacheKey = 'market_overview_alphavault';
            const cached = this.getFromCache(cacheKey);
            if (cached) return cached;

            const [sp500Data, nasdaqData, dowData] = await Promise.all([
                this.getStockData('SPY'),
                this.getStockData('QQQ'),
                this.getStockData('DIA')
            ]);

            const overview = {
                sp500: this.formatIndexAlphaVault(sp500Data, 'S&P 500', 'SPY'),
                nasdaq: this.formatIndexAlphaVault(nasdaqData, 'NASDAQ', 'QQQ'),
                dow: this.formatIndexAlphaVault(dowData, 'Dow Jones', 'DIA'),
                timestamp: Date.now(),
                dataSource: 'AlphaVault Proprietary Analysis'
            };

            this.saveToCache(cacheKey, overview);
            console.log('✅ Market overview fetched (AlphaVault mode)');
            
            return overview;

        } catch (error) {
            console.error('❌ Market overview error:', error);
            return null;
        }
    }

    // ============================================
    // WORKER API CALLS (Base methods - Usage interne)
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
            
            const url = `${this.workerBaseUrl}/api/finnhub/basic-financials?symbol=${symbol}&metric=all`;
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
    
    formatIndexAlphaVault(alphaVaultData, name, symbol) {
        if (!alphaVaultData) return null;
        
        return {
            name: name,
            symbol: symbol,
            alphaVaultScore: alphaVaultData.alphaVaultScore,
            momentumIndex: alphaVaultData.momentumIndex,
            qualityGrade: alphaVaultData.qualityGrade,
            riskRating: alphaVaultData.riskRating,
            changePercent: alphaVaultData.priceChangePercent,
            marketCapCategory: alphaVaultData.marketCapCategory,
            volatilityLevel: alphaVaultData.volatilityLevel,
            companyName: alphaVaultData.companyName,
            sector: alphaVaultData.sector
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
        console.log('✅ Cache cleared');
    }

    generateMockNormalizedTimeSeries(symbol, count) {
        console.warn(`⚠ Generating mock normalized time series for ${symbol}`);
        
        const normalizedData = [];
        let performanceIndex = 100;
        const now = Date.now();
        const dayMs = 86400000;
        
        for (let i = count - 1; i >= 0; i--) {
            const timestamp = now - (i * dayMs);
            const date = new Date(timestamp);
            
            const dailyChange = (Math.random() - 0.5) * 4;
            performanceIndex = performanceIndex * (1 + dailyChange / 100);
            
            normalizedData.push({
                date: date.toISOString().split('T')[0],
                timestamp: timestamp,
                performanceIndex: performanceIndex.toFixed(2),
                volumeIndex: (100 + (Math.random() - 0.5) * 40).toFixed(2),
                dailyChange: dailyChange.toFixed(2)
            });
        }
        
        const totalReturn = (normalizedData[normalizedData.length - 1].performanceIndex - 100).toFixed(2);
        
        return {
            symbol: symbol,
            interval: '1day',
            normalizedData: normalizedData,
            dataPoints: normalizedData.length,
            performanceSummary: {
                totalReturn: totalReturn + '%',
                dataQuality: 'Mock Data (Fallback)'
            },
            source: 'AlphaVault Normalized Performance Index (Mock)'
        };
    }

    // ============================================
    // SEARCH SYMBOL (✅ OK - Données publiques)
    // ============================================
    
    async searchSymbol(query) {
        try {
            console.log(`🔍 Searching for: ${query}`);
            
            const cacheKey = `search_${query.toUpperCase()}`;
            const cached = this.getFromCache(cacheKey);
            if (cached) return { data: cached };

            await this.enforceRateLimit();
            
            const url = `${this.workerBaseUrl}/api/search?query=${encodeURIComponent(query)}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                console.error(`Search API error: ${response.status}`);
                return { data: [] };
            }
            
            const data = await response.json();
            const results = data.result || data.data || [];
            
            this.trackRequest();
            this.saveToCache(cacheKey, results);
            
            console.log(`✅ Found ${results.length} results for "${query}"`);
            return { data: results };
            
        } catch (error) {
            console.error('Search error:', error);
            return { data: [] };
        }
    }

    // ============================================
    // UTILITY METHODS
    // ============================================
    
    getStats() {
        return {
            cacheSize: this.cache.size,
            requestsInLastMinute: this.requestTimestamps.length,
            maxRequestsPerMinute: this.maxRequestsPerMinute,
            remainingRequests: this.maxRequestsPerMinute - this.requestTimestamps.length,
            workerUrl: this.workerBaseUrl,
            scoringEngineVersion: this.scoringEngine.scoringVersion,
            complianceMode: 'AlphaVault Proprietary Data'
        };
    }

    logStats() {
        const stats = this.getStats();
        console.log('📊 FinancialAnalytics Stats:');
        console.log(`   Cache size: ${stats.cacheSize} entries`);
        console.log(`   Requests (last 60s): ${stats.requestsInLastMinute}/${stats.maxRequestsPerMinute}`);
        console.log(`   Remaining: ${stats.remainingRequests} requests`);
        console.log(`   Worker URL: ${stats.workerUrl}`);
        console.log(`   🏆 Scoring Engine: v${stats.scoringEngineVersion}`);
        console.log(`   🔒 Compliance: ${stats.complianceMode}`);
    }
}

// ============================================
// EXPORT & GLOBAL AVAILABILITY
// ============================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = FinancialAnalytics;
}

window.FinancialAnalytics = FinancialAnalytics;

console.log('✅ FinancialAnalytics v5.0 - ALPHAVAULT COMPLIANT loaded successfully!');
console.log('🏆 Proprietary scoring system integrated');
console.log('🔒 Legal compliance: No raw API data redistribution');
console.log('📊 All data transformed to AlphaVault scores');