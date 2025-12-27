// // // ============================================
// // // ADVANCED FINANCIAL ANALYTICS v4.2
// // // Compatible avec Worker finance-hub-api v8.4.0
// // // ✅ OPTIMISATION: Cache amélioré + Rate limiting
// // // ============================================

// // class FinancialAnalytics {
// //     constructor(config) {
// //         this.config = config;
        
// //         this.workerBaseUrl = 
// //             config?.api?.worker?.baseUrl ||
// //             config?.API_BASE_URL ||
// //             window.ChatbotConfig?.api?.worker?.baseUrl ||
// //             window.CONFIG?.API_BASE_URL ||
// //             'https://finance-hub-api.raphnardone.workers.dev';
        
// //         this.cache = new Map();
// //         this.cacheTimeout = 60000; // 1 minute
        
// //         this.requestTimestamps = [];
// //         this.maxRequestsPerMinute = 30;
        
// //         console.log('📊 FinancialAnalytics v4.2 - Compatible Worker v8.4.0');
// //         console.log('🌐 Worker URL:', this.workerBaseUrl);
// //     }

// //     // ============================================
// //     // STOCK DATA (Quote + Profile + Metrics)
// //     // ============================================
    
// //     async getStockData(symbol) {
// //         try {
// //             console.log(`\n📊 ═══ FETCHING COMPLETE STOCK DATA ═══`);
// //             console.log(`   Symbol: ${symbol}`);
            
// //             const cacheKey = `stock_complete_${symbol}`;
// //             const cached = this.getFromCache(cacheKey);
// //             if (cached) {
// //                 console.log(`   ✅ Using cached data`);
// //                 return cached;
// //             }

// //             console.log(`   📡 Calling multiple APIs...`);
            
// //             const [quote, profile, metrics] = await Promise.all([
// //                 this.getQuote(symbol),
// //                 this.getCompanyProfile(symbol),
// //                 this.getBasicFinancials(symbol)
// //             ]);

// //             if (!quote) {
// //                 console.warn(`   ⚠ No quote data for ${symbol}`);
// //                 return null;
// //             }

// //             const stockData = {
// //                 symbol: symbol,
// //                 quote: {
// //                     current: parseFloat(quote.close || quote.price || quote.c || 0),
// //                     previousClose: parseFloat(quote.previous_close || quote.pc || 0),
// //                     change: parseFloat(quote.change || 0),
// //                     changePercent: parseFloat(quote.percent_change || 0),
// //                     high: parseFloat(quote.high || quote.h || 0),
// //                     low: parseFloat(quote.low || quote.l || 0),
// //                     open: parseFloat(quote.open || quote.o || 0),
// //                     volume: parseInt(quote.volume || quote.v || 0),
// //                     timestamp: quote.timestamp || Date.now()
// //                 },
// //                 profile: profile ? {
// //                     name: profile.name || symbol,
// //                     ticker: profile.ticker || profile.symbol || symbol,
// //                     exchange: profile.exchange || 'N/A',
// //                     industry: profile.finnhubIndustry || profile.sector || 'N/A',
// //                     sector: profile.finnhubIndustry || profile.sector || 'N/A',
// //                     marketCap: profile.marketCapitalization || 0,
// //                     country: profile.country || 'N/A',
// //                     currency: profile.currency || 'USD',
// //                     ipo: profile.ipo || 'N/A',
// //                     logo: profile.logo || '',
// //                     phone: profile.phone || 'N/A',
// //                     weburl: profile.weburl || '',
// //                     shareOutstanding: profile.shareOutstanding || 0
// //                 } : null,
// //                 metrics: metrics ? {
// //                     peRatio: parseFloat(metrics.peNormalizedAnnual || metrics['peBasicExclExtraTTM'] || 0),
// //                     eps: parseFloat(metrics.epsBasicTTM || metrics['epsBasicExclExtraItemsAnnual'] || 0),
// //                     beta: parseFloat(metrics.beta || 0),
// //                     week52High: parseFloat(metrics['52WeekHigh'] || 0),
// //                     week52Low: parseFloat(metrics['52WeekLow'] || 0),
// //                     marketCap: parseFloat(metrics.marketCapitalization || 0),
// //                     dividendYield: parseFloat(metrics.dividendYieldIndicatedAnnual || 0),
// //                     revenueGrowth: parseFloat(metrics.revenueGrowthTTMYoy || 0),
// //                     profitMargin: parseFloat(metrics.netProfitMarginTTM || metrics.netProfitMarginAnnual || 0),
// //                     roe: parseFloat(metrics.roeTTM || 0),
// //                     roa: parseFloat(metrics.roaTTM || 0),
// //                     debtToEquity: parseFloat(metrics.totalDebt2EquityAnnual || 0),
// //                     currentRatio: parseFloat(metrics.currentRatioAnnual || 0),
// //                     priceToBook: parseFloat(metrics.pbAnnual || 0),
// //                     priceToSales: parseFloat(metrics.psTTM || 0),
// //                     grossMargin: parseFloat(metrics.grossMarginAnnual || 0),
// //                     operatingMargin: parseFloat(metrics.operatingMarginAnnual || 0),
// //                     week52Return: parseFloat(metrics['52WeekPriceReturnDaily'] || 0)
// //                 } : null,
// //                 timestamp: Date.now(),
// //                 dataSource: 'Twelve Data + Finnhub via Worker'
// //             };

// //             this.saveToCache(cacheKey, stockData);
            
// //             console.log(`   ✅ SUCCESS!`);
// //             console.log(`   💰 Price: $${stockData.quote.current}`);
// //             console.log(`   📊 Change: ${stockData.quote.changePercent}%`);
// //             console.log(`   🏢 Company: ${stockData.profile?.name || 'N/A'}`);
// //             console.log(`   📈 P/E: ${stockData.metrics?.peRatio || 'N/A'}`);
// //             console.log(`═══════════════════════════════\n`);
            
// //             return stockData;

// //         } catch (error) {
// //             console.error(`   ❌ ERROR:`, error);
// //             console.log(`═══════════════════════════════\n`);
// //             return null;
// //         }
// //     }

// //     // ============================================
// //     // NEWS ENDPOINTS
// //     // ============================================
    
// //     async getMarketNews(category = 'general') {
// //         try {
// //             console.log(`📰 Fetching market news: ${category}`);
            
// //             const cacheKey = `market_news_${category}`;
// //             const cached = this.getFromCache(cacheKey);
// //             if (cached) return cached;

// //             const url = `${this.workerBaseUrl}/api/finnhub/market-news?category=${category}`;
// //             const response = await fetch(url);
            
// //             if (!response.ok) {
// //                 console.error(`Market news API error: ${response.status}`);
// //                 return [];
// //             }
            
// //             const data = await response.json();
// //             const newsArray = Array.isArray(data) ? data : (data.news || data.data || []);
            
// //             const transformedNews = newsArray.map(item => ({
// //                 id: item.id || `${item.datetime || Date.now()}_${Math.random()}`,
// //                 category: item.category || category,
// //                 headline: item.headline || 'No headline',
// //                 summary: item.summary || '',
// //                 source: item.source || 'Finnhub',
// //                 url: item.url || '#',
// //                 image: item.image || '',
// //                 datetime: new Date(item.datetime * 1000),
// //                 timestamp: item.datetime * 1000,
// //                 related: item.related || []
// //             }));
            
// //             this.saveToCache(cacheKey, transformedNews);
            
// //             console.log(`✅ Loaded ${transformedNews.length} market news articles`);
// //             return transformedNews;
            
// //         } catch (error) {
// //             console.error('Market news error:', error);
// //             return [];
// //         }
// //     }

// //     async getCompanyNews(symbol, from = null, to = null) {
// //         try {
// //             if (!to) {
// //                 to = new Date().toISOString().split('T')[0];
// //             }
// //             if (!from) {
// //                 const fromDate = new Date();
// //                 fromDate.setDate(fromDate.getDate() - 7);
// //                 from = fromDate.toISOString().split('T')[0];
// //             }
            
// //             console.log(`📰 Fetching company news: ${symbol} (${from} to ${to})`);
            
// //             const cacheKey = `company_news_${symbol}_${from}_${to}`;
// //             const cached = this.getFromCache(cacheKey);
// //             if (cached) return cached;

// //             const url = `${this.workerBaseUrl}/api/finnhub/company-news?symbol=${symbol}&from=${from}&to=${to}`;
// //             const response = await fetch(url);
            
// //             if (!response.ok) {
// //                 console.error(`Company news API error: ${response.status}`);
// //                 return [];
// //             }
            
// //             const data = await response.json();
// //             const newsArray = Array.isArray(data) ? data : (data.news || data.data || []);
            
// //             const transformedNews = newsArray.map(item => ({
// //                 id: item.id || `${item.datetime || Date.now()}_${Math.random()}`,
// //                 symbol: symbol,
// //                 headline: item.headline || 'No headline',
// //                 summary: item.summary || '',
// //                 source: item.source || 'Finnhub',
// //                 url: item.url || '#',
// //                 image: item.image || '',
// //                 datetime: new Date(item.datetime * 1000),
// //                 timestamp: item.datetime * 1000,
// //                 related: item.related || []
// //             }));
            
// //             this.saveToCache(cacheKey, transformedNews);
            
// //             console.log(`✅ Loaded ${transformedNews.length} company news articles`);
// //             return transformedNews;
            
// //         } catch (error) {
// //             console.error('Company news error:', error);
// //             return [];
// //         }
// //     }

// //     async analyzeNewsImpact(symbol) {
// //         try {
// //             console.log(`🤖 Analyzing news sentiment for ${symbol}`);
            
// //             const news = await this.getCompanyNews(symbol);
            
// //             if (news.length === 0) {
// //                 return {
// //                     overallSentiment: { sentiment: 0, label: 'Neutral' },
// //                     shortTermImpact: { direction: 'Neutral', confidence: 'Low' },
// //                     longTermImpact: { direction: 'Neutral', confidence: 'Low' },
// //                     recommendation: 'Insufficient data for analysis'
// //                 };
// //             }
            
// //             const positiveWords = ['gain', 'profit', 'growth', 'surge', 'rally', 'bullish', 'upgrade', 'strong', 'positive', 'beat', 'outperform', 'rise', 'jump', 'soar', 'record', 'high', 'success', 'boost'];
// //             const negativeWords = ['loss', 'decline', 'fall', 'drop', 'bearish', 'downgrade', 'weak', 'negative', 'miss', 'underperform', 'plunge', 'crash', 'sink', 'concern', 'risk', 'warning'];
            
// //             let totalSentiment = 0;
// //             news.forEach(item => {
// //                 const text = (item.headline + ' ' + item.summary).toLowerCase();
// //                 let score = 0;
                
// //                 positiveWords.forEach(word => {
// //                     if (text.includes(word)) score += 0.1;
// //                 });
                
// //                 negativeWords.forEach(word => {
// //                     if (text.includes(word)) score -= 0.1;
// //                 });
                
// //                 totalSentiment += score;
// //             });
            
// //             const avgSentiment = totalSentiment / news.length;
            
// //             let sentimentLabel = 'Neutral';
// //             let shortTermDirection = 'Neutral';
// //             let longTermDirection = 'Neutral';
// //             let recommendation = 'Hold - Monitor for changes';
            
// //             if (avgSentiment > 0.05) {
// //                 sentimentLabel = 'Positive';
// //                 shortTermDirection = 'Positive';
// //                 longTermDirection = 'Positive';
// //                 recommendation = 'Consider buying - Positive sentiment detected';
// //             } else if (avgSentiment < -0.05) {
// //                 sentimentLabel = 'Negative';
// //                 shortTermDirection = 'Negative';
// //                 longTermDirection = 'Negative';
// //                 recommendation = 'Exercise caution - Negative sentiment detected';
// //             }
            
// //             return {
// //                 overallSentiment: {
// //                     sentiment: avgSentiment,
// //                     label: sentimentLabel
// //                 },
// //                 shortTermImpact: {
// //                     direction: shortTermDirection,
// //                     confidence: news.length > 10 ? 'High' : news.length > 5 ? 'Medium' : 'Low'
// //                 },
// //                 longTermImpact: {
// //                     direction: longTermDirection,
// //                     confidence: news.length > 10 ? 'Medium' : 'Low'
// //                 },
// //                 recommendation: recommendation,
// //                 newsCount: news.length
// //             };
            
// //         } catch (error) {
// //             console.error('News sentiment analysis error:', error);
// //             return {
// //                 overallSentiment: { sentiment: 0, label: 'Error' },
// //                 shortTermImpact: { direction: 'Unknown', confidence: 'Low' },
// //                 longTermImpact: { direction: 'Unknown', confidence: 'Low' },
// //                 recommendation: 'Unable to analyze sentiment'
// //             };
// //         }
// //     }

// //     // ============================================
// //     // ANALYST RECOMMENDATIONS
// //     // ============================================
    
// //     async getRecommendationTrends(symbol) {
// //         try {
// //             console.log(`👥 Fetching analyst recommendations for ${symbol}`);
            
// //             const cacheKey = `recommendations_${symbol}`;
// //             const cached = this.getFromCache(cacheKey);
// //             if (cached) return cached;

// //             const url = `${this.workerBaseUrl}/api/finnhub/recommendation?symbol=${symbol}`;
// //             const response = await fetch(url);
            
// //             if (!response.ok) {
// //                 console.error(`Recommendations API error: ${response.status}`);
// //                 return [];
// //             }
            
// //             const data = await response.json();
// //             const recommendations = Array.isArray(data) ? data : (data.data || []);
            
// //             this.saveToCache(cacheKey, recommendations);
            
// //             console.log(`✅ Loaded ${recommendations.length} recommendation periods`);
// //             return recommendations;
            
// //         } catch (error) {
// //             console.error('Recommendations error:', error);
// //             return [];
// //         }
// //     }

// //     async getPriceTarget(symbol) {
// //         console.warn(`⚠ Price target endpoint not available in Worker (Premium Finnhub feature)`);
// //         return null;
// //     }

// //     async getUpgradeDowngrade(symbol = null, from = null, to = null) {
// //         console.warn(`⚠ Upgrade/downgrade endpoint not available in Worker (Premium Finnhub feature)`);
// //         return [];
// //     }

// //     // ============================================
// //     // EARNINGS & FINANCIALS
// //     // ============================================
    
// //     async getEarningsCalendar(from = null, to = null, symbol = null) {
// //         try {
// //             if (!to) {
// //                 to = new Date().toISOString().split('T')[0];
// //             }
// //             if (!from) {
// //                 const fromDate = new Date();
// //                 fromDate.setDate(fromDate.getDate() - 7);
// //                 from = fromDate.toISOString().split('T')[0];
// //             }
            
// //             console.log(`📅 Fetching earnings calendar (${from} to ${to})`);
            
// //             const params = new URLSearchParams({ from, to });
// //             if (symbol) params.append('symbol', symbol);
            
// //             const cacheKey = `earnings_calendar_${from}_${to}_${symbol || 'all'}`;
// //             const cached = this.getFromCache(cacheKey);
// //             if (cached) return cached;

// //             const url = `${this.workerBaseUrl}/api/finnhub/earnings-calendar?${params.toString()}`;
// //             const response = await fetch(url);
            
// //             if (!response.ok) {
// //                 console.error(`Earnings calendar API error: ${response.status}`);
// //                 return [];
// //             }
            
// //             const data = await response.json();
// //             const events = data.earningsCalendar || data.data || [];
            
// //             this.saveToCache(cacheKey, events);
            
// //             console.log(`✅ Loaded ${events.length} earnings events`);
// //             return events;
            
// //         } catch (error) {
// //             console.error('Earnings calendar error:', error);
// //             return [];
// //         }
// //     }

// //     async getEarnings(symbol) {
// //         try {
// //             console.log(`💰 Fetching historical earnings for ${symbol}`);
            
// //             const cacheKey = `earnings_${symbol}`;
// //             const cached = this.getFromCache(cacheKey);
// //             if (cached) return cached;

// //             const url = `${this.workerBaseUrl}/api/finnhub/earnings?symbol=${symbol}`;
// //             const response = await fetch(url);
            
// //             if (!response.ok) {
// //                 console.error(`Earnings API error: ${response.status}`);
// //                 return [];
// //             }
            
// //             const data = await response.json();
// //             const earnings = Array.isArray(data) ? data : (data.data || []);
            
// //             this.saveToCache(cacheKey, earnings);
            
// //             console.log(`✅ Loaded ${earnings.length} earnings reports`);
// //             return earnings;
            
// //         } catch (error) {
// //             console.error('Earnings error:', error);
// //             return [];
// //         }
// //     }

// //     async getRevenueEstimates(symbol, freq = 'quarterly') {
// //         console.warn(`⚠ Revenue estimates endpoint not available in Worker (Premium Finnhub feature)`);
// //         return [];
// //     }

// //     async getEPSEstimates(symbol, freq = 'quarterly') {
// //         console.warn(`⚠ EPS estimates endpoint not available in Worker (Premium Finnhub feature)`);
// //         return [];
// //     }

// //     // ============================================
// //     // IPO & PEERS
// //     // ============================================
    
// //     async getIPOCalendar(from = null, to = null) {
// //         console.warn(`⚠ IPO calendar endpoint not available in Worker (Premium Finnhub feature)`);
// //         return [];
// //     }

// //     async getPeers(symbol) {
// //         try {
// //             console.log(`🔗 Fetching peers for ${symbol}`);
            
// //             const cacheKey = `peers_${symbol}`;
// //             const cached = this.getFromCache(cacheKey);
// //             if (cached) return cached;

// //             const url = `${this.workerBaseUrl}/api/finnhub/peers?symbol=${symbol}`;
// //             const response = await fetch(url);
            
// //             if (!response.ok) {
// //                 console.error(`Peers API error: ${response.status}`);
// //                 return [];
// //             }
            
// //             const data = await response.json();
// //             const peers = Array.isArray(data) ? data : (data.peers || data.data || []);
            
// //             this.saveToCache(cacheKey, peers);
            
// //             console.log(`✅ Loaded ${peers.length} peers`);
// //             return peers;
            
// //         } catch (error) {
// //             console.error('Peers error:', error);
// //             return [];
// //         }
// //     }

// //     // ============================================
// //     // TIME SERIES & MARKET DATA
// //     // ============================================
    
// //     async getTimeSeries(symbol, interval = '1day', outputsize = 30) {
// //         try {
// //             console.log(`\n📈 ═══ FETCHING TIME SERIES ═══`);
// //             console.log(`   Symbol: ${symbol}`);
// //             console.log(`   Interval: ${interval}`);
// //             console.log(`   Output size: ${outputsize}`);
            
// //             const cacheKey = `timeseries_${symbol}_${interval}_${outputsize}`;
// //             const cached = this.getFromCache(cacheKey);
// //             if (cached) {
// //                 console.log(`   ✅ Using cached data (${cached.data.length} points)`);
// //                 return cached;
// //             }

// //             const limitedSize = Math.min(outputsize, 5000);

// //             const url = `${this.workerBaseUrl}/api/time-series?symbol=${symbol}&interval=${interval}&outputsize=${limitedSize}`;
            
// //             console.log(`   📡 Calling API...`);
            
// //             const response = await fetch(url);
            
// //             if (!response.ok) {
// //                 console.warn(`   ⚠ API error: ${response.status}`);
// //                 return this.generateMockTimeSeries(symbol, limitedSize);
// //             }
            
// //             const data = await response.json();

// //             let values = data.data || data.values;
            
// //             if (!values || values.length === 0) {
// //                 console.warn(`   ⚠ No time series data from API`);
// //                 return this.generateMockTimeSeries(symbol, limitedSize);
// //             }

// //             const timeSeries = {
// //                 symbol: symbol,
// //                 interval: interval,
// //                 data: values.map(item => {
// //                     if (item.timestamp) {
// //                         return item;
// //                     }
// //                     return {
// //                         datetime: item.datetime,
// //                         timestamp: new Date(item.datetime).getTime(),
// //                         open: parseFloat(item.open),
// //                         high: parseFloat(item.high),
// //                         low: parseFloat(item.low),
// //                         close: parseFloat(item.close),
// //                         volume: parseInt(item.volume || 0)
// //                     };
// //                 }),
// //                 timestamp: Date.now(),
// //                 dataSource: 'Twelve Data via Worker'
// //             };

// //             if (timeSeries.data.length > 1) {
// //                 const firstTimestamp = timeSeries.data[0].timestamp;
// //                 const lastTimestamp = timeSeries.data[timeSeries.data.length - 1].timestamp;
                
// //                 if (firstTimestamp > lastTimestamp) {
// //                     timeSeries.data.reverse();
// //                 }
// //             }

// //             this.saveToCache(cacheKey, timeSeries);
            
// //             console.log(`   ✅ SUCCESS!`);
// //             console.log(`   Data points: ${timeSeries.data.length}`);
// //             console.log(`═══════════════════════════════\n`);
            
// //             return timeSeries;

// //         } catch (error) {
// //             console.error(`   ❌ FETCH ERROR:`, error);
// //             console.log(`═══════════════════════════════\n`);
// //             return this.generateMockTimeSeries(symbol, outputsize);
// //         }
// //     }

// //     async getMarketOverview() {
// //         try {
// //             console.log('📊 Fetching market overview...');
            
// //             const cacheKey = 'market_overview';
// //             const cached = this.getFromCache(cacheKey);
// //             if (cached) return cached;

// //             const [sp500, nasdaq, dow] = await Promise.all([
// //                 this.getQuote('SPY'),
// //                 this.getQuote('QQQ'),
// //                 this.getQuote('DIA')
// //             ]);

// //             const overview = {
// //                 sp500: this.formatIndexData(sp500, 'S&P 500', 'SPY'),
// //                 nasdaq: this.formatIndexData(nasdaq, 'NASDAQ', 'QQQ'),
// //                 dow: this.formatIndexData(dow, 'Dow Jones', 'DIA'),
// //                 timestamp: Date.now(),
// //                 dataSource: 'Twelve Data via Worker'
// //             };

// //             this.saveToCache(cacheKey, overview);
// //             console.log('✅ Market overview fetched');
            
// //             return overview;

// //         } catch (error) {
// //             console.error('❌ Market overview error:', error);
// //             return null;
// //         }
// //     }

// //     // ============================================
// //     // WORKER API CALLS (BASE METHODS)
// //     // ============================================
    
// //     async getQuote(symbol) {
// //         try {
// //             await this.enforceRateLimit();
            
// //             const url = `${this.workerBaseUrl}/api/quote?symbol=${symbol}`;
// //             const response = await fetch(url);
            
// //             if (!response.ok) {
// //                 console.error(`Worker API error for quote ${symbol}: ${response.status}`);
// //                 return null;
// //             }
            
// //             const data = await response.json();
            
// //             this.trackRequest();
            
// //             return data;
            
// //         } catch (error) {
// //             console.error(`Quote error for ${symbol}:`, error);
// //             return null;
// //         }
// //     }

// //     async getCompanyProfile(symbol) {
// //         try {
// //             await this.enforceRateLimit();
            
// //             const url = `${this.workerBaseUrl}/api/finnhub/company-profile?symbol=${symbol}`;
// //             const response = await fetch(url);
            
// //             if (!response.ok) {
// //                 console.error(`Worker API error for profile ${symbol}: ${response.status}`);
// //                 return null;
// //             }
            
// //             const data = await response.json();
            
// //             this.trackRequest();
            
// //             return data;
            
// //         } catch (error) {
// //             console.error(`Profile error for ${symbol}:`, error);
// //             return null;
// //         }
// //     }

// //     async getBasicFinancials(symbol) {
// //         try {
// //             await this.enforceRateLimit();
            
// //             const url = `${this.workerBaseUrl}/api/finnhub/basic-financials?symbol=${symbol}&metric=all`;
// //             const response = await fetch(url);
            
// //             if (!response.ok) {
// //                 console.error(`Worker API error for financials ${symbol}: ${response.status}`);
// //                 return null;
// //             }
            
// //             const data = await response.json();
            
// //             this.trackRequest();
            
// //             return data?.metric || null;
            
// //         } catch (error) {
// //             console.error(`Financials error for ${symbol}:`, error);
// //             return null;
// //         }
// //     }

// //     // ============================================
// //     // HELPER METHODS
// //     // ============================================
    
// //     formatIndexData(quote, name, symbol) {
// //         if (!quote) return null;
        
// //         const current = parseFloat(quote.close || quote.price || quote.c || 0);
// //         const previousClose = parseFloat(quote.previous_close || quote.pc || 0);
// //         const change = current - previousClose;
// //         const changePercent = previousClose > 0 ? (change / previousClose * 100) : 0;
        
// //         return {
// //             name: name,
// //             symbol: symbol,
// //             price: current.toFixed(2),
// //             change: change.toFixed(2),
// //             changePercent: changePercent.toFixed(2),
// //             high: parseFloat(quote.high || quote.h || 0).toFixed(2),
// //             low: parseFloat(quote.low || quote.l || 0).toFixed(2),
// //             open: parseFloat(quote.open || quote.o || 0).toFixed(2),
// //             volume: parseInt(quote.volume || quote.v || 0)
// //         };
// //     }

// //     async enforceRateLimit() {
// //         const now = Date.now();
// //         const oneMinuteAgo = now - 60000;
        
// //         this.requestTimestamps = this.requestTimestamps.filter(
// //             timestamp => timestamp > oneMinuteAgo
// //         );
        
// //         if (this.requestTimestamps.length >= this.maxRequestsPerMinute) {
// //             const waitTime = 60000 - (now - this.requestTimestamps[0]);
// //             if (waitTime > 0) {
// //                 console.log(`⏳ Rate limit: waiting ${waitTime}ms...`);
// //                 await new Promise(resolve => setTimeout(resolve, waitTime));
// //             }
// //         }
// //     }

// //     trackRequest() {
// //         this.requestTimestamps.push(Date.now());
// //     }

// //     getFromCache(key) {
// //         const cached = this.cache.get(key);
// //         if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
// //             return cached.data;
// //         }
// //         return null;
// //     }

// //     saveToCache(key, data) {
// //         this.cache.set(key, {
// //             data: data,
// //             timestamp: Date.now()
// //         });
        
// //         if (this.cache.size > 100) {
// //             const firstKey = this.cache.keys().next().value;
// //             this.cache.delete(firstKey);
// //         }
// //     }

// //     clearCache() {
// //         this.cache.clear();
// //         console.log('✅ Cache cleared');
// //     }

// //     generateMockTimeSeries(symbol, count) {
// //         console.warn(`⚠ Generating mock time series for ${symbol}`);
        
// //         const data = [];
// //         let basePrice = 100 + Math.random() * 100;
// //         const now = Date.now();
// //         const dayMs = 86400000;
        
// //         for (let i = count - 1; i >= 0; i--) {
// //             const timestamp = now - (i * dayMs);
// //             const date = new Date(timestamp);
            
// //             const open = basePrice;
// //             const close = open + (Math.random() - 0.5) * 10;
// //             const high = Math.max(open, close) + Math.random() * 5;
// //             const low = Math.min(open, close) - Math.random() * 5;
            
// //             data.push({
// //                 datetime: date.toISOString().split('T')[0],
// //                 timestamp: timestamp,
// //                 open: parseFloat(open.toFixed(2)),
// //                 high: parseFloat(high.toFixed(2)),
// //                 low: parseFloat(low.toFixed(2)),
// //                 close: parseFloat(close.toFixed(2)),
// //                 volume: Math.floor(Math.random() * 10000000)
// //             });
            
// //             basePrice = close;
// //         }
        
// //         return {
// //             symbol: symbol,
// //             interval: '1day',
// //             data: data,
// //             timestamp: Date.now(),
// //             dataSource: 'Mock Data (Fallback)'
// //         };
// //     }

// //     // ============================================
// //     // SEARCH SYMBOL
// //     // ============================================
    
// //     async searchSymbol(query) {
// //         try {
// //             console.log(`🔍 Searching for: ${query}`);
            
// //             const cacheKey = `search_${query.toUpperCase()}`;
// //             const cached = this.getFromCache(cacheKey);
// //             if (cached) return { data: cached };

// //             await this.enforceRateLimit();
            
// //             const url = `${this.workerBaseUrl}/api/search?query=${encodeURIComponent(query)}`;
// //             const response = await fetch(url);
            
// //             if (!response.ok) {
// //                 console.error(`Search API error: ${response.status}`);
// //                 return { data: [] };
// //             }
            
// //             const data = await response.json();
// //             const results = data.result || data.data || [];
            
// //             this.trackRequest();
// //             this.saveToCache(cacheKey, results);
            
// //             console.log(`✅ Found ${results.length} results for "${query}"`);
// //             return { data: results };
            
// //         } catch (error) {
// //             console.error('Search error:', error);
// //             return { data: [] };
// //         }
// //     }

// //     // ============================================
// //     // UTILITY METHODS
// //     // ============================================
    
// //     getStats() {
// //         return {
// //             cacheSize: this.cache.size,
// //             requestsInLastMinute: this.requestTimestamps.length,
// //             maxRequestsPerMinute: this.maxRequestsPerMinute,
// //             remainingRequests: this.maxRequestsPerMinute - this.requestTimestamps.length,
// //             workerUrl: this.workerBaseUrl
// //         };
// //     }

// //     logStats() {
// //         const stats = this.getStats();
// //         console.log('📊 FinancialAnalytics Stats:');
// //         console.log(`   Cache size: ${stats.cacheSize} entries`);
// //         console.log(`   Requests (last 60s): ${stats.requestsInLastMinute}/${stats.maxRequestsPerMinute}`);
// //         console.log(`   Remaining: ${stats.remainingRequests} requests`);
// //         console.log(`   Worker URL: ${stats.workerUrl}`);
// //     }
// // }

// // // ============================================
// // // EXPORT & GLOBAL AVAILABILITY
// // // ============================================

// // if (typeof module !== 'undefined' && module.exports) {
// //     module.exports = FinancialAnalytics;
// // }

// // window.FinancialAnalytics = FinancialAnalytics;

// // console.log('✅ FinancialAnalytics v4.2 loaded successfully!');
// // console.log('📊 Compatible with Worker finance-hub-api v8.4.0');
// // console.log('🚀 Cache optimized + Rate limiting enabled');

// // ============================================
// // ADVANCED FINANCIAL ANALYTICS v5.0 - ALPHAVAULT COMPLIANT
// // ✅ CONFORMITÉ LÉGALE: Transformation des données brutes en scores propriétaires
// // Compatible avec Worker finance-hub-api v8.4.0 + AlphaVault Scoring System
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
        
//         // ✅ Initialisation du système de scoring propriétaire
//         this.scoringEngine = new AlphaVaultScoring();
        
//         this.cache = new Map();
//         this.cacheTimeout = 60000; // 1 minute
        
//         this.requestTimestamps = [];
//         this.maxRequestsPerMinute = 30;
        
//         console.log('📊 FinancialAnalytics v5.0 - ALPHAVAULT COMPLIANT');
//         console.log('🏆 Proprietary scoring system active');
//         console.log('🔒 Legal compliance: No raw data redistribution');
//         console.log('🌐 Worker URL:', this.workerBaseUrl);
//     }

//     // ============================================
//     // 🏆 STOCK DATA (Transformé en Scores AlphaVault)
//     // ============================================
    
//     async getStockData(symbol) {
//         try {
//             console.log(`\n📊 ═══ FETCHING STOCK DATA (ALPHAVAULT MODE) ═══`);
//             console.log(`   Symbol: ${symbol}`);
            
//             const cacheKey = `stock_alphavault_${symbol}`;
//             const cached = this.getFromCache(cacheKey);
//             if (cached) {
//                 console.log(`   ✅ Using cached AlphaVault data`);
//                 return cached;
//             }

//             console.log(`   📡 Calling APIs for raw data...`);
            
//             // Récupération des données brutes (usage interne uniquement)
//             const [quote, profile, metrics] = await Promise.all([
//                 this.getQuote(symbol),
//                 this.getCompanyProfile(symbol),
//                 this.getBasicFinancials(symbol)
//             ]);

//             if (!quote) {
//                 console.warn(`   ⚠ No quote data for ${symbol}`);
//                 return null;
//             }

//             // 🔒 Construction des données brutes (USAGE INTERNE SEULEMENT)
//             const rawStockData = {
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
//                 } : null
//             };

//             // 🏆 TRANSFORMATION EN SCORES ALPHAVAULT
//             console.log(`   🏆 Transforming raw data to AlphaVault scores...`);
//             const alphaVaultData = this.scoringEngine.transformStockData(rawStockData);

//             this.saveToCache(cacheKey, alphaVaultData);
            
//             console.log(`   ✅ SUCCESS!`);
//             console.log(`   🏆 AlphaVault Score: ${alphaVaultData.alphaVaultScore}/100`);
//             console.log(`   📊 Quality Grade: ${alphaVaultData.qualityGrade}`);
//             console.log(`   ⚖ Risk Rating: ${alphaVaultData.riskRating}`);
//             console.log(`   📈 Change: ${alphaVaultData.priceChangePercent}%`);
//             console.log(`   🏢 Company: ${alphaVaultData.companyName}`);
//             console.log(`═══════════════════════════════\n`);
            
//             return alphaVaultData;

//         } catch (error) {
//             console.error(`   ❌ ERROR:`, error);
//             console.log(`═══════════════════════════════\n`);
//             return null;
//         }
//     }

//     // ============================================
//     // 📈 TIME SERIES (Transformé en Indices Normalisés Base 100)
//     // ============================================
    
//     async getTimeSeries(symbol, interval = '1day', outputsize = 30) {
//         try {
//             console.log(`\n📈 ═══ FETCHING TIME SERIES (ALPHAVAULT MODE) ═══`);
//             console.log(`   Symbol: ${symbol}`);
//             console.log(`   Interval: ${interval}`);
//             console.log(`   Output size: ${outputsize}`);
            
//             const cacheKey = `timeseries_alphavault_${symbol}_${interval}_${outputsize}`;
//             const cached = this.getFromCache(cacheKey);
//             if (cached) {
//                 console.log(`   ✅ Using cached normalized data (${cached.normalizedData.length} points)`);
//                 return cached;
//             }

//             const limitedSize = Math.min(outputsize, 5000);

//             const url = `${this.workerBaseUrl}/api/time-series?symbol=${symbol}&interval=${interval}&outputsize=${limitedSize}`;
            
//             console.log(`   📡 Calling API...`);
            
//             const response = await fetch(url);
            
//             if (!response.ok) {
//                 console.warn(`   ⚠ API error: ${response.status}`);
//                 return this.generateMockNormalizedTimeSeries(symbol, limitedSize);
//             }
            
//             const data = await response.json();

//             let values = data.data || data.values;
            
//             if (!values || values.length === 0) {
//                 console.warn(`   ⚠ No time series data from API`);
//                 return this.generateMockNormalizedTimeSeries(symbol, limitedSize);
//             }

//             // 🔒 Construction des données brutes (USAGE INTERNE SEULEMENT)
//             const rawTimeSeries = {
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
//                 })
//             };

//             // Inversion si nécessaire (ordre chronologique)
//             if (rawTimeSeries.data.length > 1) {
//                 const firstTimestamp = rawTimeSeries.data[0].timestamp;
//                 const lastTimestamp = rawTimeSeries.data[rawTimeSeries.data.length - 1].timestamp;
                
//                 if (firstTimestamp > lastTimestamp) {
//                     rawTimeSeries.data.reverse();
//                 }
//             }

//             // 🏆 TRANSFORMATION EN INDICES NORMALISÉS BASE 100
//             console.log(`   🏆 Transforming to normalized performance index (Base 100)...`);
//             const alphaVaultTimeSeries = this.scoringEngine.transformTimeSeries(rawTimeSeries);

//             this.saveToCache(cacheKey, alphaVaultTimeSeries);
            
//             console.log(`   ✅ SUCCESS!`);
//             console.log(`   Data points: ${alphaVaultTimeSeries.normalizedData.length}`);
//             console.log(`   📊 Total Return: ${alphaVaultTimeSeries.performanceSummary.totalReturn}`);
//             console.log(`   ✅ Data Quality: ${alphaVaultTimeSeries.performanceSummary.dataQuality}`);
//             console.log(`═══════════════════════════════\n`);
            
//             return alphaVaultTimeSeries;

//         } catch (error) {
//             console.error(`   ❌ FETCH ERROR:`, error);
//             console.log(`═══════════════════════════════\n`);
//             return this.generateMockNormalizedTimeSeries(symbol, outputsize);
//         }
//     }

//     // ============================================
//     // NEWS ENDPOINTS (✅ OK - Pas de données propriétaires)
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
//         // ✅ Sentiment analysis OK (pas de données propriétaires)
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
//     // ANALYST RECOMMENDATIONS (✅ OK - Données publiques)
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
//         console.warn(`⚠ Price target endpoint not available (Premium Finnhub feature)`);
//         return null;
//     }

//     async getUpgradeDowngrade(symbol = null, from = null, to = null) {
//         console.warn(`⚠ Upgrade/downgrade endpoint not available (Premium Finnhub feature)`);
//         return [];
//     }

//     // ============================================
//     // EARNINGS (✅ OK - Données publiques)
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
//         console.warn(`⚠ Revenue estimates endpoint not available (Premium feature)`);
//         return [];
//     }

//     async getEPSEstimates(symbol, freq = 'quarterly') {
//         console.warn(`⚠ EPS estimates endpoint not available (Premium feature)`);
//         return [];
//     }

//     // ============================================
//     // IPO & PEERS (✅ OK - Données publiques)
//     // ============================================
    
//     async getIPOCalendar(from = null, to = null) {
//         console.warn(`⚠ IPO calendar endpoint not available (Premium feature)`);
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
//     // MARKET OVERVIEW (Scores AlphaVault pour indices)
//     // ============================================
    
//     async getMarketOverview() {
//         try {
//             console.log('📊 Fetching market overview (AlphaVault mode)...');
            
//             const cacheKey = 'market_overview_alphavault';
//             const cached = this.getFromCache(cacheKey);
//             if (cached) return cached;

//             const [sp500Data, nasdaqData, dowData] = await Promise.all([
//                 this.getStockData('SPY'),
//                 this.getStockData('QQQ'),
//                 this.getStockData('DIA')
//             ]);

//             const overview = {
//                 sp500: this.formatIndexAlphaVault(sp500Data, 'S&P 500', 'SPY'),
//                 nasdaq: this.formatIndexAlphaVault(nasdaqData, 'NASDAQ', 'QQQ'),
//                 dow: this.formatIndexAlphaVault(dowData, 'Dow Jones', 'DIA'),
//                 timestamp: Date.now(),
//                 dataSource: 'AlphaVault Proprietary Analysis'
//             };

//             this.saveToCache(cacheKey, overview);
//             console.log('✅ Market overview fetched (AlphaVault mode)');
            
//             return overview;

//         } catch (error) {
//             console.error('❌ Market overview error:', error);
//             return null;
//         }
//     }

//     // ============================================
//     // WORKER API CALLS (Base methods - Usage interne)
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
    
//     formatIndexAlphaVault(alphaVaultData, name, symbol) {
//         if (!alphaVaultData) return null;
        
//         return {
//             name: name,
//             symbol: symbol,
//             alphaVaultScore: alphaVaultData.alphaVaultScore,
//             momentumIndex: alphaVaultData.momentumIndex,
//             qualityGrade: alphaVaultData.qualityGrade,
//             riskRating: alphaVaultData.riskRating,
//             changePercent: alphaVaultData.priceChangePercent,
//             marketCapCategory: alphaVaultData.marketCapCategory,
//             volatilityLevel: alphaVaultData.volatilityLevel,
//             companyName: alphaVaultData.companyName,
//             sector: alphaVaultData.sector
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

//     generateMockNormalizedTimeSeries(symbol, count) {
//         console.warn(`⚠ Generating mock normalized time series for ${symbol}`);
        
//         const normalizedData = [];
//         let performanceIndex = 100;
//         const now = Date.now();
//         const dayMs = 86400000;
        
//         for (let i = count - 1; i >= 0; i--) {
//             const timestamp = now - (i * dayMs);
//             const date = new Date(timestamp);
            
//             const dailyChange = (Math.random() - 0.5) * 4;
//             performanceIndex = performanceIndex * (1 + dailyChange / 100);
            
//             normalizedData.push({
//                 date: date.toISOString().split('T')[0],
//                 timestamp: timestamp,
//                 performanceIndex: performanceIndex.toFixed(2),
//                 volumeIndex: (100 + (Math.random() - 0.5) * 40).toFixed(2),
//                 dailyChange: dailyChange.toFixed(2)
//             });
//         }
        
//         const totalReturn = (normalizedData[normalizedData.length - 1].performanceIndex - 100).toFixed(2);
        
//         return {
//             symbol: symbol,
//             interval: '1day',
//             normalizedData: normalizedData,
//             dataPoints: normalizedData.length,
//             performanceSummary: {
//                 totalReturn: totalReturn + '%',
//                 dataQuality: 'Mock Data (Fallback)'
//             },
//             source: 'AlphaVault Normalized Performance Index (Mock)'
//         };
//     }

//     // ============================================
//     // SEARCH SYMBOL (✅ OK - Données publiques)
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
//             workerUrl: this.workerBaseUrl,
//             scoringEngineVersion: this.scoringEngine.scoringVersion,
//             complianceMode: 'AlphaVault Proprietary Data'
//         };
//     }

//     logStats() {
//         const stats = this.getStats();
//         console.log('📊 FinancialAnalytics Stats:');
//         console.log(`   Cache size: ${stats.cacheSize} entries`);
//         console.log(`   Requests (last 60s): ${stats.requestsInLastMinute}/${stats.maxRequestsPerMinute}`);
//         console.log(`   Remaining: ${stats.remainingRequests} requests`);
//         console.log(`   Worker URL: ${stats.workerUrl}`);
//         console.log(`   🏆 Scoring Engine: v${stats.scoringEngineVersion}`);
//         console.log(`   🔒 Compliance: ${stats.complianceMode}`);
//     }
// }

// // ============================================
// // EXPORT & GLOBAL AVAILABILITY
// // ============================================

// if (typeof module !== 'undefined' && module.exports) {
//     module.exports = FinancialAnalytics;
// }

// window.FinancialAnalytics = FinancialAnalytics;

// console.log('✅ FinancialAnalytics v5.0 - ALPHAVAULT COMPLIANT loaded successfully!');
// console.log('🏆 Proprietary scoring system integrated');
// console.log('🔒 Legal compliance: No raw API data redistribution');
// console.log('📊 All data transformed to AlphaVault scores');

/**
 * ═══════════════════════════════════════════════════════════════
 * CHATBOT ANALYTICS - Advanced Stock Analysis Engine
 * ═══════════════════════════════════════════════════════════════
 * Version: 3.0.0 - LEGAL COMPLIANT
 * Description: Analyses techniques/fondamentales + AlphaVault Scoring
 * Features:
 *   - Intégration AlphaVault Scoring
 *   - 14 indicateurs techniques (RSI, MACD, ADX, etc.)
 *   - Calculs de risque (VaR, Sharpe, Beta, ATR)
 *   - Sentiment analysis
 *   - Corrélation matrix
 */

class ChatbotAnalytics {
    constructor(config) {
        this.config = config;
        this.apiClient = null;
        this.chartsEngine = null;
        
        console.log('📊 ChatbotAnalytics initialized');
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * INITIALIZE
     * ✅ CORRIGÉ : Crée FinanceAPIClient comme dans advanced-analysis
     * ═══════════════════════════════════════════════════════════
     */
    async initialize() {
        if (typeof FinanceAPIClient !== 'undefined') {
            this.apiClient = new FinanceAPIClient({
                baseURL: this.config.apiBaseURL || APP_CONFIG.API_BASE_URL,
                cacheDuration: 300000,
                maxRetries: 2
            });
            
            console.log('✅ FinanceAPIClient initialized');
        } else {
            console.warn('⚠ FinanceAPIClient not available - will try to use window.apiClient');
        }

        if (typeof ChatbotCharts !== 'undefined') {
            this.chartsEngine = new ChatbotCharts();
            console.log('✅ Charts engine initialized');
        }

        console.log('✅ ChatbotAnalytics initialized');
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * ANALYZE STOCK (MAIN METHOD)
     * ✅ CORRIGÉ : Initialisation API + Utilise Twelve Data comme advanced-analysis
     * ═══════════════════════════════════════════════════════════
     */
    async analyzeStock(symbol, entities = {}) {
        try {
            // ✅ CORRECTION : Initialiser l'API client si nécessaire
            if (!this.apiClient) {
                await this.initialize();
            }

            // ✅ VÉRIFICATION : Si toujours null, utiliser window.apiClient (comme advanced-analysis)
            if (!this.apiClient && window.apiClient) {
                console.log('📡 Using global apiClient from window');
                this.apiClient = window.apiClient;
            }

            // ✅ DERNIÈRE VÉRIFICATION
            if (!this.apiClient) {
                console.error('❌ API Client not available');
                return {
                    text: `❌ Unable to fetch data for ${symbol}. API client not initialized.\n\nPlease check that FinanceAPIClient is properly loaded.`,
                    charts: [],
                    data: null
                };
            }

            console.log(`📊 Analyzing ${symbol}...`);

            // ✅ UTILISE LA MÊME LOGIQUE QUE ADVANCED-ANALYSIS
            const [quote, timeSeries] = await Promise.all([
                this.apiClient.getQuote(symbol).catch(() => null),
                this.apiClient.getTimeSeries(symbol, '1day', 365).catch(() => null)
            ]);

            if (!quote || !timeSeries || !timeSeries.data || timeSeries.data.length < 30) {
                return {
                    text: `❌ Unable to fetch sufficient data for ${symbol}. Please verify the ticker symbol.`,
                    charts: [],
                    data: null
                };
            }

            const prices = timeSeries.data;

            // Calculate all technical indicators
            const technicalIndicators = this.calculateAllIndicators(prices);

            // Calculate AlphaVault Score
            const alphaVaultScore = this.calculateAlphaVaultScore(technicalIndicators);

            // Calculate risk metrics
            const riskMetrics = this.calculateRiskMetrics(prices);

            // Generate AI recommendation
            const aiRecommendation = this.generateAIRecommendation(alphaVaultScore, technicalIndicators, riskMetrics);

            // Generate charts
            const charts = this.generateCharts(technicalIndicators, symbol);

            // ✅ BUILD RESPONSE (SANS MENTIONNER LES PRIX BRUTS)
            const responseText = this.buildAnalysisResponse(symbol, quote, alphaVaultScore, technicalIndicators, riskMetrics, aiRecommendation);

            return {
                text: responseText,
                charts: charts,
                data: {
                    symbol,
                    quote,
                    alphaVaultScore,
                    technicalIndicators,
                    riskMetrics,
                    aiRecommendation
                }
            };

        } catch (error) {
            console.error('❌ Stock analysis error:', error);
            return {
                text: `❌ An error occurred while analyzing ${symbol}. Please try again.`,
                charts: [],
                data: null
            };
        }
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * CALCULATE ALL TECHNICAL INDICATORS
     * ═══════════════════════════════════════════════════════════
     */
    calculateAllIndicators(prices) {
        return {
            rsi: this.calculateRSI(prices),
            macd: this.calculateMACD(prices),
            stochastic: this.calculateStochastic(prices),
            adx: this.calculateADX(prices),
            obv: this.calculateOBV(prices),
            atr: this.calculateATR(prices),
            mfi: this.calculateMFI(prices),
            cci: this.calculateCCI(prices),
            williamsR: this.calculateWilliamsR(prices),
            roc: this.calculateROC(prices),
            aroon: this.calculateAroon(prices),
            cmf: this.calculateCMF(prices),
            elderRay: this.calculateElderRay(prices),
            ultimateOscillator: this.calculateUltimateOscillator(prices)
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * CALCULATE RSI
     * ═══════════════════════════════════════════════════════════
     */
    calculateRSI(prices, period = 14) {
        const rsi = [];
        const changes = [];
        
        for (let i = 1; i < prices.length; i++) {
            changes.push(prices[i].close - prices[i - 1].close);
        }
        
        let avgGain = 0;
        let avgLoss = 0;
        
        for (let i = 0; i < period; i++) {
            if (changes[i] > 0) avgGain += changes[i];
            else avgLoss += Math.abs(changes[i]);
        }
        
        avgGain /= period;
        avgLoss /= period;
        
        for (let i = period; i < changes.length; i++) {
            const gain = changes[i] > 0 ? changes[i] : 0;
            const loss = changes[i] < 0 ? Math.abs(changes[i]) : 0;
            
            avgGain = (avgGain * (period - 1) + gain) / period;
            avgLoss = (avgLoss * (period - 1) + loss) / period;
            
            const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
            const rsiValue = 100 - (100 / (1 + rs));
            
            rsi.push([prices[i + 1].timestamp, rsiValue]);
        }
        
        return rsi;
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * CALCULATE MACD
     * ═══════════════════════════════════════════════════════════
     */
    calculateMACD(prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
        const closes = prices.map(p => p.close);
        
        const fastEMA = this.calculateEMA(closes, fastPeriod);
        const slowEMA = this.calculateEMA(closes, slowPeriod);
        
        const macdLine = [];
        const startIndex = Math.max(fastEMA.length - slowEMA.length, 0);
        
        for (let i = 0; i < slowEMA.length; i++) {
            const macdValue = fastEMA[i + startIndex] - slowEMA[i];
            macdLine.push(macdValue);
        }
        
        const signalEMA = this.calculateEMA(macdLine, signalPeriod);
        
        const macdLineData = [];
        const signalLineData = [];
        const histogram = [];
        
        const offset = prices.length - macdLine.length;
        const signalOffset = macdLine.length - signalEMA.length;
        
        for (let i = 0; i < signalEMA.length; i++) {
            const timestamp = prices[offset + signalOffset + i].timestamp;
            const macdVal = macdLine[signalOffset + i];
            const signalVal = signalEMA[i];
            
            macdLineData.push([timestamp, macdVal]);
            signalLineData.push([timestamp, signalVal]);
            histogram.push([timestamp, macdVal - signalVal]);
        }
        
        return { macdLine: macdLineData, signalLine: signalLineData, histogram };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * CALCULATE EMA
     * ═══════════════════════════════════════════════════════════
     */
    calculateEMA(data, period) {
        const ema = [];
        const multiplier = 2 / (period + 1);
        
        let sum = 0;
        for (let i = 0; i < period && i < data.length; i++) {
            sum += data[i];
        }
        ema.push(sum / period);
        
        for (let i = period; i < data.length; i++) {
            const value = (data[i] - ema[ema.length - 1]) * multiplier + ema[ema.length - 1];
            ema.push(value);
        }
        
        return ema;
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * CALCULATE STOCHASTIC
     * ═══════════════════════════════════════════════════════════
     */
    calculateStochastic(prices, kPeriod = 14, dPeriod = 3) {
        const k = [];
        const d = [];
        
        for (let i = kPeriod - 1; i < prices.length; i++) {
            const slice = prices.slice(i - kPeriod + 1, i + 1);
            const high = Math.max(...slice.map(p => p.high));
            const low = Math.min(...slice.map(p => p.low));
            const close = prices[i].close;
            
            const kValue = ((close - low) / (high - low)) * 100;
            k.push([prices[i].timestamp, kValue || 0]);
        }
        
        for (let i = dPeriod - 1; i < k.length; i++) {
            const slice = k.slice(i - dPeriod + 1, i + 1);
            const avg = slice.reduce((sum, item) => sum + item[1], 0) / dPeriod;
            d.push([k[i][0], avg]);
        }
        
        return { k, d };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * CALCULATE ADX
     * ═══════════════════════════════════════════════════════════
     */
    calculateADX(prices, period = 14) {
        if (prices.length < period + 2) {
            return { adx: [], plusDI: [], minusDI: [] };
        }
        
        const trueRange = [];
        const plusDM = [];
        const minusDM = [];
        
        for (let i = 1; i < prices.length; i++) {
            const high = prices[i].high;
            const low = prices[i].low;
            const prevClose = prices[i - 1].close;
            
            const tr = Math.max(
                high - low,
                Math.abs(high - prevClose),
                Math.abs(low - prevClose)
            );
            trueRange.push(tr);
            
            const highDiff = high - prices[i - 1].high;
            const lowDiff = prices[i - 1].low - low;
            
            plusDM.push(highDiff > lowDiff && highDiff > 0 ? highDiff : 0);
            minusDM.push(lowDiff > highDiff && lowDiff > 0 ? lowDiff : 0);
        }
        
        const smoothTR = this.smoothArray(trueRange, period);
        const smoothPlusDM = this.smoothArray(plusDM, period);
        const smoothMinusDM = this.smoothArray(minusDM, period);
        
        const plusDI = [];
        const minusDI = [];
        const dxValues = [];
        
        const maxIndex = Math.min(smoothTR.length, prices.length - period - 1);
        
        for (let i = 0; i < maxIndex; i++) {
            if (smoothTR[i] === 0) continue;
            
            const plusDIValue = (smoothPlusDM[i] / smoothTR[i]) * 100;
            const minusDIValue = (smoothMinusDM[i] / smoothTR[i]) * 100;
            
            const timestamp = prices[i + period + 1].timestamp;
            plusDI.push([timestamp, plusDIValue]);
            minusDI.push([timestamp, minusDIValue]);
            
            const sum = plusDIValue + minusDIValue;
            if (sum > 0) {
                const dx = (Math.abs(plusDIValue - minusDIValue) / sum) * 100;
                dxValues.push(dx);
            }
        }
        
        if (dxValues.length < period) {
            return { adx: [], plusDI, minusDI };
        }
        
        const adxSmoothed = this.smoothArray(dxValues, period);
        const adxArray = [];
        
        const adxMaxIndex = Math.min(adxSmoothed.length, prices.length - period * 2 - 1);
        
        for (let i = 0; i < adxMaxIndex; i++) {
            const timestamp = prices[i + period * 2 + 1].timestamp;
            adxArray.push([timestamp, adxSmoothed[i]]);
        }
        
        return { adx: adxArray, plusDI, minusDI };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * SMOOTH ARRAY (Helper for ADX)
     * ═══════════════════════════════════════════════════════════
     */
    smoothArray(arr, period) {
        if (arr.length < period) return [];
        
        const result = [];
        let sum = 0;
        
        for (let i = 0; i < period; i++) {
            sum += arr[i];
        }
        result.push(sum / period);
        
        for (let i = period; i < arr.length; i++) {
            const smoothed = (result[result.length - 1] * (period - 1) + arr[i]) / period;
            result.push(smoothed);
        }
        
        return result;
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * CALCULATE OBV
     * ═══════════════════════════════════════════════════════════
     */
    calculateOBV(prices) {
        const obv = [];
        let currentOBV = 0;
        
        obv.push([prices[0].timestamp, currentOBV]);
        
        for (let i = 1; i < prices.length; i++) {
            if (prices[i].close > prices[i - 1].close) {
                currentOBV += prices[i].volume;
            } else if (prices[i].close < prices[i - 1].close) {
                currentOBV -= prices[i].volume;
            }
            
            obv.push([prices[i].timestamp, currentOBV]);
        }
        
        return obv;
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * CALCULATE ATR
     * ═══════════════════════════════════════════════════════════
     */
    calculateATR(prices, period = 14) {
        const trueRange = [];
        
        for (let i = 1; i < prices.length; i++) {
            const high = prices[i].high;
            const low = prices[i].low;
            const prevClose = prices[i - 1].close;
            
            const tr = Math.max(
                high - low,
                Math.abs(high - prevClose),
                Math.abs(low - prevClose)
            );
            
            trueRange.push(tr);
        }
        
        const atr = [];
        let sum = 0;
        
        for (let i = 0; i < period && i < trueRange.length; i++) {
            sum += trueRange[i];
        }
        
        if (period < prices.length) {
            atr.push([prices[period].timestamp, sum / period]);
        }
        
        for (let i = period; i < trueRange.length; i++) {
            const smoothed = (atr[atr.length - 1][1] * (period - 1) + trueRange[i]) / period;
            const priceIndex = i + 1;
            
            if (priceIndex < prices.length) {
                atr.push([prices[priceIndex].timestamp, smoothed]);
            }
        }
        
        return atr;
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * CALCULATE MFI (Money Flow Index)
     * ═══════════════════════════════════════════════════════════
     */
    calculateMFI(prices, period = 14) {
        const mfi = [];
        const typicalPrices = [];
        const moneyFlow = [];
        
        for (let i = 0; i < prices.length; i++) {
            const typical = (prices[i].high + prices[i].low + prices[i].close) / 3;
            typicalPrices.push(typical);
            moneyFlow.push(typical * prices[i].volume);
        }
        
        for (let i = period; i < prices.length; i++) {
            let positiveFlow = 0;
            let negativeFlow = 0;
            
            for (let j = i - period + 1; j <= i; j++) {
                if (typicalPrices[j] > typicalPrices[j - 1]) {
                    positiveFlow += moneyFlow[j];
                } else if (typicalPrices[j] < typicalPrices[j - 1]) {
                    negativeFlow += moneyFlow[j];
                }
            }
            
            const moneyFlowRatio = negativeFlow === 0 ? 100 : positiveFlow / negativeFlow;
            const mfiValue = 100 - (100 / (1 + moneyFlowRatio));
            
            mfi.push([prices[i].timestamp, mfiValue]);
        }
        
        return mfi;
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * CALCULATE CCI
     * ═══════════════════════════════════════════════════════════
     */
    calculateCCI(prices, period = 20) {
        const cci = [];
        const typicalPrices = prices.map(p => (p.high + p.low + p.close) / 3);
        
        for (let i = period - 1; i < prices.length; i++) {
            const slice = typicalPrices.slice(i - period + 1, i + 1);
            const sma = slice.reduce((a, b) => a + b, 0) / period;
            
            const meanDeviation = slice.reduce((sum, val) => sum + Math.abs(val - sma), 0) / period;
            
            const cciValue = (typicalPrices[i] - sma) / (0.015 * meanDeviation);
            
            cci.push([prices[i].timestamp, cciValue]);
        }
        
        return cci;
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * CALCULATE WILLIAMS %R
     * ═══════════════════════════════════════════════════════════
     */
    calculateWilliamsR(prices, period = 14) {
        const williams = [];
        
        for (let i = period - 1; i < prices.length; i++) {
            const slice = prices.slice(i - period + 1, i + 1);
            const high = Math.max(...slice.map(p => p.high));
            const low = Math.min(...slice.map(p => p.low));
            const close = prices[i].close;
            
            const value = ((high - close) / (high - low)) * -100;
            williams.push([prices[i].timestamp, value || 0]);
        }
        
        return williams;
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * CALCULATE ROC (Rate of Change)
     * ═══════════════════════════════════════════════════════════
     */
    calculateROC(prices, period = 12) {
        const roc = [];
        
        for (let i = period; i < prices.length; i++) {
            const currentClose = prices[i].close;
            const pastClose = prices[i - period].close;
            const rocValue = ((currentClose - pastClose) / pastClose) * 100;
            
            roc.push([prices[i].timestamp, rocValue]);
        }
        
        return roc;
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * CALCULATE AROON
     * ═══════════════════════════════════════════════════════════
     */
    calculateAroon(prices, period = 25) {
        const up = [];
        const down = [];
        
        for (let i = period; i < prices.length; i++) {
            const slice = prices.slice(i - period, i + 1);
            
            let highestIndex = 0;
            let lowestIndex = 0;
            let highest = slice[0].high;
            let lowest = slice[0].low;
            
            for (let j = 1; j < slice.length; j++) {
                if (slice[j].high > highest) {
                    highest = slice[j].high;
                    highestIndex = j;
                }
                if (slice[j].low < lowest) {
                    lowest = slice[j].low;
                    lowestIndex = j;
                }
            }
            
            const daysSinceHigh = period - highestIndex;
            const daysSinceLow = period - lowestIndex;
            
            const aroonUp = ((period - daysSinceHigh) / period) * 100;
            const aroonDown = ((period - daysSinceLow) / period) * 100;
            
            up.push([prices[i].timestamp, aroonUp]);
            down.push([prices[i].timestamp, aroonDown]);
        }
        
        return { up, down };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * CALCULATE CMF (Chaikin Money Flow)
     * ═══════════════════════════════════════════════════════════
     */
    calculateCMF(prices, period = 20) {
        const cmf = [];
        const moneyFlowMultiplier = [];
        const moneyFlowVolume = [];
        
        for (let i = 0; i < prices.length; i++) {
            const high = prices[i].high;
            const low = prices[i].low;
            const close = prices[i].close;
            const volume = prices[i].volume;
            
            const mfm = high === low ? 0 : ((close - low) - (high - close)) / (high - low);
            const mfv = mfm * volume;
            
            moneyFlowMultiplier.push(mfm);
            moneyFlowVolume.push(mfv);
        }
        
        for (let i = period - 1; i < prices.length; i++) {
            const sumMFV = this.sumArray(moneyFlowVolume, i - period + 1, i + 1);
            const sumVolume = prices.slice(i - period + 1, i + 1).reduce((sum, p) => sum + p.volume, 0);
            
            const cmfValue = sumVolume === 0 ? 0 : sumMFV / sumVolume;
            
            cmf.push([prices[i].timestamp, cmfValue]);
        }
        
        return cmf;
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * CALCULATE ELDER RAY
     * ═══════════════════════════════════════════════════════════
     */
    calculateElderRay(prices, period = 13) {
        const closes = prices.map(p => p.close);
        const ema = this.calculateEMA(closes, period);
        
        const bullPower = [];
        const bearPower = [];
        
        const offset = prices.length - ema.length;
        
        for (let i = 0; i < ema.length; i++) {
            const priceIndex = offset + i;
            const timestamp = prices[priceIndex].timestamp;
            const high = prices[priceIndex].high;
            const low = prices[priceIndex].low;
            const emaValue = ema[i];
            
            bullPower.push([timestamp, high - emaValue]);
            bearPower.push([timestamp, low - emaValue]);
        }
        
        return { bullPower, bearPower };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * CALCULATE ULTIMATE OSCILLATOR
     * ═══════════════════════════════════════════════════════════
     */
    calculateUltimateOscillator(prices, period1 = 7, period2 = 14, period3 = 28) {
        const ultimate = [];
        const buyingPressure = [];
        const trueRange = [];
        
        for (let i = 1; i < prices.length; i++) {
            const trueLow = Math.min(prices[i].low, prices[i - 1].close);
            const bp = prices[i].close - trueLow;
            const tr = Math.max(prices[i].high, prices[i - 1].close) - trueLow;
            
            buyingPressure.push(bp);
            trueRange.push(tr);
        }
        
        const maxPeriod = Math.max(period1, period2, period3);
        
        for (let i = maxPeriod - 1; i < buyingPressure.length; i++) {
            const avg1 = this.sumArray(buyingPressure, i - period1 + 1, i + 1) / this.sumArray(trueRange, i - period1 + 1, i + 1);
            const avg2 = this.sumArray(buyingPressure, i - period2 + 1, i + 1) / this.sumArray(trueRange, i - period2 + 1, i + 1);
            const avg3 = this.sumArray(buyingPressure, i - period3 + 1, i + 1) / this.sumArray(trueRange, i - period3 + 1, i + 1);
            
            const uo = 100 * ((4 * avg1 + 2 * avg2 + avg3) / 7);
            
            ultimate.push([prices[i + 1].timestamp, uo]);
        }
        
        return ultimate;
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * SUM ARRAY (Helper)
     * ═══════════════════════════════════════════════════════════
     */
    sumArray(arr, start, end) {
        let sum = 0;
        for (let i = start; i < end && i < arr.length; i++) {
            sum += arr[i];
        }
        return sum || 1;
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * CALCULATE ALPHAVAULT SCORE
     * ═══════════════════════════════════════════════════════════
     */
    calculateAlphaVaultScore(indicators) {
        let score = 50;  // Base score
        let totalWeight = 0;
        let weightedScore = 0;

        // RSI (weight: 1.8)
        if (indicators.rsi.length > 0) {
            const lastRSI = indicators.rsi[indicators.rsi.length - 1][1];
            let rsiScore = 0;
            
            if (lastRSI < 30) rsiScore = 80;
            else if (lastRSI < 40) rsiScore = 65;
            else if (lastRSI > 70) rsiScore = 20;
            else if (lastRSI > 60) rsiScore = 35;
            else rsiScore = 50;
            
            weightedScore += rsiScore * 1.8;
            totalWeight += 1.8;
        }

        // MACD (weight: 2.2)
        if (indicators.macd.histogram.length > 0) {
            const lastHist = indicators.macd.histogram[indicators.macd.histogram.length - 1][1];
            let macdScore = lastHist > 0 ? 70 : 30;
            
            weightedScore += macdScore * 2.2;
            totalWeight += 2.2;
        }

        // ADX (weight: 2.0)
        if (indicators.adx.adx.length > 0) {
            const lastADX = indicators.adx.adx[indicators.adx.adx.length - 1][1];
            const lastPlusDI = indicators.adx.plusDI[indicators.adx.plusDI.length - 1][1];
            const lastMinusDI = indicators.adx.minusDI[indicators.adx.minusDI.length - 1][1];
            
            let adxScore = 50;
            if (lastADX > 25) {
                adxScore = lastPlusDI > lastMinusDI ? 75 : 25;
            }
            
            weightedScore += adxScore * 2.0;
            totalWeight += 2.0;
        }

        // OBV (weight: 1.7)
        if (indicators.obv.length >= 20) {
            const recentOBV = indicators.obv.slice(-20);
            const obvTrend = recentOBV[recentOBV.length - 1][1] - recentOBV[0][1];
            const obvScore = obvTrend > 0 ? 65 : 35;
            
            weightedScore += obvScore * 1.7;
            totalWeight += 1.7;
        }

        // Stochastic (weight: 1.5)
        if (indicators.stochastic.k.length > 0) {
            const lastK = indicators.stochastic.k[indicators.stochastic.k.length - 1][1];
            let stochScore = 50;
            
            if (lastK < 20) stochScore = 75;
            else if (lastK > 80) stochScore = 25;
            
            weightedScore += stochScore * 1.5;
            totalWeight += 1.5;
        }

        // Calculate final score
        const finalScore = totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 50;

        return Math.max(0, Math.min(100, finalScore));
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * CALCULATE RISK METRICS
     * ═══════════════════════════════════════════════════════════
     */
    calculateRiskMetrics(prices) {
        const returns = [];
        for (let i = 1; i < prices.length; i++) {
            const ret = (prices[i].close - prices[i - 1].close) / prices[i - 1].close;
            returns.push(ret);
        }

        // Volatility (annualized)
        const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
        const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
        const volatility = Math.sqrt(variance) * Math.sqrt(252) * 100;

        // Sharpe Ratio (assuming risk-free rate of 3%)
        const riskFreeRate = 0.03;
        const annualReturn = mean * 252;
        const sharpeRatio = (annualReturn - riskFreeRate) / (volatility / 100);

        // Max Drawdown
        let peak = prices[0].close;
        let maxDrawdown = 0;

        for (let i = 1; i < prices.length; i++) {
            if (prices[i].close > peak) {
                peak = prices[i].close;
            }
            const drawdown = ((peak - prices[i].close) / peak) * 100;
            if (drawdown > maxDrawdown) {
                maxDrawdown = drawdown;
            }
        }

        // VaR (95% confidence)
        const sortedReturns = [...returns].sort((a, b) => a - b);
        const varIndex = Math.floor(returns.length * 0.05);
        const var95 = sortedReturns[varIndex] * 100;

        return {
            volatility: volatility.toFixed(2),
            sharpeRatio: sharpeRatio.toFixed(2),
            maxDrawdown: maxDrawdown.toFixed(2),
            var95: var95.toFixed(2)
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * GENERATE AI RECOMMENDATION
     * ═══════════════════════════════════════════════════════════
     */
    generateAIRecommendation(alphaVaultScore, indicators, riskMetrics) {
        let recommendation = 'HOLD';
        let confidence = 50;

        if (alphaVaultScore >= 75) {
            recommendation = 'BUY';
            confidence = 85;
        } else if (alphaVaultScore >= 60) {
            recommendation = 'BUY';
            confidence = 70;
        } else if (alphaVaultScore >= 55) {
            recommendation = 'BUY';
            confidence = 60;
        } else if (alphaVaultScore <= 25) {
            recommendation = 'SELL';
            confidence = 85;
        } else if (alphaVaultScore <= 40) {
            recommendation = 'SELL';
            confidence = 70;
        } else if (alphaVaultScore <= 45) {
            recommendation = 'SELL';
            confidence = 60;
        }

        return {
            recommendation,
            confidence,
            rating: alphaVaultScore >= 75 ? 'VERY BULLISH' :
                    alphaVaultScore >= 60 ? 'BULLISH' :
                    alphaVaultScore >= 45 ? 'NEUTRAL' :
                    alphaVaultScore >= 30 ? 'BEARISH' : 'VERY BEARISH'
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * GENERATE CHARTS
     * ═══════════════════════════════════════════════════════════
     */
    generateCharts(indicators, symbol) {
        if (!this.chartsEngine) {
            return [];
        }

        const charts = [];

        // RSI Chart
        if (indicators.rsi.length > 0) {
            charts.push(this.chartsEngine.createRSIChart(indicators.rsi, null, { 
                title: `${symbol} - RSI (Relative Strength Index)` 
            }));
        }

        // MACD Chart
        if (indicators.macd.histogram.length > 0) {
            charts.push(this.chartsEngine.createMACDChart(indicators.macd, null, { 
                title: `${symbol} - MACD` 
            }));
        }

        // Stochastic Chart
        if (indicators.stochastic.k.length > 0) {
            charts.push(this.chartsEngine.createStochasticChart(indicators.stochastic, null, { 
                title: `${symbol} - Stochastic Oscillator` 
            }));
        }

        // ADX Chart
        if (indicators.adx.adx.length > 0) {
            charts.push(this.chartsEngine.createADXChart(indicators.adx, null, { 
                title: `${symbol} - ADX (Trend Strength)` 
            }));
        }

        return charts;
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * BUILD ANALYSIS RESPONSE TEXT
     * ═══════════════════════════════════════════════════════════
     */
    buildAnalysisResponse(symbol, quote, alphaVaultScore, indicators, riskMetrics, aiRecommendation) {
        const lastRSI = indicators.rsi.length > 0 ? indicators.rsi[indicators.rsi.length - 1][1].toFixed(2) : 'N/A';
        const lastMACD = indicators.macd.histogram.length > 0 ? indicators.macd.histogram[indicators.macd.histogram.length - 1][1].toFixed(4) : 'N/A';

        return `📊 **Technical Analysis for ${symbol}**

**AlphaVault Score:** ${alphaVaultScore}/100 (${aiRecommendation.rating})
**AI Recommendation:** ${aiRecommendation.recommendation} (${aiRecommendation.confidence}% confidence)

**Key Technical Indicators:**
• RSI (14): ${lastRSI}
• MACD Histogram: ${lastMACD}

**Risk Metrics:**
• Volatility (annualized): ${riskMetrics.volatility}%
• Sharpe Ratio: ${riskMetrics.sharpeRatio}
• Max Drawdown: ${riskMetrics.maxDrawdown}%
• VaR (95%): ${riskMetrics.var95}%

📈 View the detailed charts below for comprehensive technical analysis.`;
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * GET MARKET OVERVIEW
     * ═══════════════════════════════════════════════════════════
     */
    async getMarketOverview(entities) {
        return {
            text: `📊 **Market Overview**

The current market environment shows mixed signals across major indices. For detailed analysis of specific stocks, please provide a ticker symbol.

**Major Indices:**
• S&P 500: Market sentiment neutral
• NASDAQ: Tech sector showing strength
• Dow Jones: Industrial stocks consolidating

Use commands like "analyze AAPL" or "show me NVDA technical analysis" for detailed stock insights.`,
            charts: [],
            data: null
        };
    }
}

// ═══════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChatbotAnalytics;
}

if (typeof window !== 'undefined') {
    window.ChatbotAnalytics = ChatbotAnalytics;
}

console.log('✅ ChatbotAnalytics loaded (Legal Compliant)');