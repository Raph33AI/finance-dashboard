// /* ==============================================
//    ADVANCED-ANALYSIS.JS - WALL STREET EDITION
//    ✅ 40+ Technical Indicators
//    ✅ Professional Pattern Recognition
//    ✅ Automated Support/Resistance
//    ============================================== */

// // ========== RATE LIMITER ==========
// class RateLimiter {
//     constructor(maxRequests = 8, windowMs = 60000) {
//         this.maxRequests = maxRequests;
//         this.windowMs = windowMs;
//         this.queue = [];
//         this.requestTimes = [];
//         this.processing = false;
//     }
    
//     async execute(fn, priority = 'normal') {
//         return new Promise((resolve, reject) => {
//             this.queue.push({
//                 fn,
//                 priority,
//                 resolve,
//                 reject,
//                 timestamp: Date.now()
//             });
            
//             this.queue.sort((a, b) => {
//                 const priorities = { high: 3, normal: 2, low: 1 };
//                 return (priorities[b.priority] || 2) - (priorities[a.priority] || 2);
//             });
            
//             this.processQueue();
//         });
//     }
    
//     async processQueue() {
//         if (this.processing || this.queue.length === 0) return;
        
//         this.processing = true;
        
//         while (this.queue.length > 0) {
//             const now = Date.now();
//             this.requestTimes = this.requestTimes.filter(time => now - time < this.windowMs);
            
//             if (this.requestTimes.length >= this.maxRequests) {
//                 const oldestRequest = Math.min(...this.requestTimes);
//                 const waitTime = this.windowMs - (now - oldestRequest) + 100;
                
//                 console.log(`⏳ Rate limit reached. Waiting ${Math.ceil(waitTime/1000)}s...`);
                
//                 if (window.cacheWidget) {
//                     window.cacheWidget.updateQueueStatus(this.queue.length, waitTime);
//                 }
                
//                 await this.sleep(waitTime);
//                 continue;
//             }
            
//             const item = this.queue.shift();
//             this.requestTimes.push(Date.now());
            
//             try {
//                 const result = await item.fn();
//                 item.resolve(result);
//             } catch (error) {
//                 item.reject(error);
//             }
            
//             await this.sleep(100);
//         }
        
//         this.processing = false;
        
//         if (window.cacheWidget) {
//             window.cacheWidget.updateQueueStatus(0, 0);
//         }
//     }
    
//     sleep(ms) {
//         return new Promise(resolve => setTimeout(resolve, ms));
//     }
    
//     getRemainingRequests() {
//         const now = Date.now();
//         this.requestTimes = this.requestTimes.filter(time => now - time < this.windowMs);
//         return this.maxRequests - this.requestTimes.length;
//     }
    
//     getQueueLength() {
//         return this.queue.length;
//     }
// }

// // ========== OPTIMIZED CACHE ==========
// class OptimizedCache {
//     constructor() {
//         this.prefix = 'aa_cache_';
//         this.staticTTL = 24 * 60 * 60 * 1000;
//         this.dynamicTTL = 5 * 60 * 1000;
//     }
    
//     set(key, data, ttl = null) {
//         try {
//             const cacheData = {
//                 data,
//                 timestamp: Date.now(),
//                 ttl: ttl || this.dynamicTTL
//             };
//             localStorage.setItem(this.prefix + key, JSON.stringify(cacheData));
//             return true;
//         } catch (error) {
//             console.warn('Cache storage error:', error);
//             return false;
//         }
//     }
    
//     get(key) {
//         try {
//             const cached = localStorage.getItem(this.prefix + key);
//             if (!cached) return null;
            
//             const cacheData = JSON.parse(cached);
//             const now = Date.now();
            
//             if (now - cacheData.timestamp > cacheData.ttl) {
//                 this.delete(key);
//                 return null;
//             }
            
//             return cacheData.data;
//         } catch (error) {
//             console.warn('Cache retrieval error:', error);
//             return null;
//         }
//     }
    
//     delete(key) {
//         localStorage.removeItem(this.prefix + key);
//     }
    
//     clear() {
//         Object.keys(localStorage)
//             .filter(key => key.startsWith(this.prefix))
//             .forEach(key => localStorage.removeItem(key));
//     }
    
//     getAge(key) {
//         try {
//             const cached = localStorage.getItem(this.prefix + key);
//             if (!cached) return null;
            
//             const cacheData = JSON.parse(cached);
//             return Date.now() - cacheData.timestamp;
//         } catch {
//             return null;
//         }
//     }
// }

// // ========== MAIN OBJECT ==========
// const AdvancedAnalysis = {
//     apiClient: null,
//     rateLimiter: null,
//     optimizedCache: null,
    
//     currentSymbol: 'AAPL',
//     currentPeriod: '6M',
//     stockData: null,
//     selectedSuggestionIndex: -1,
//     searchTimeout: null,
    
//     // ✅ NOUVEAUX CHARTS
//     charts: {
//         ichimoku: null,
//         stochastic: null,
//         williams: null,
//         adx: null,
//         sar: null,
//         obv: null,
//         atr: null,
//         fibonacci: null,
//         vwap: null,
//         // Nouveaux
//         rsi: null,
//         macd: null,
//         bollinger: null,
//         mfi: null,
//         cci: null,
//         roc: null,
//         aroon: null,
//         keltner: null,
//         donchian: null,
//         cmf: null,
//         elderRay: null,
//         volumeProfile: null,
//         movingAverages: null,
//         linearRegression: null
//     },
    
//     colors: {
//         primary: '#2649B2',
//         secondary: '#4A74F3',
//         tertiary: '#8E7DE3',
//         purple: '#9D5CE6',
//         lightBlue: '#6C8BE0',
//         success: '#28a745',
//         danger: '#dc3545',
//         warning: '#ffc107',
//         info: '#17a2b8',
//         orange: '#fd7e14',
//         teal: '#20c997',
//         cyan: '#0dcaf0',
//         indigo: '#6610f2',
//         pink: '#d63384'
//     },
    
//     // ============================================
//     // ✅ INITIALIZATION
//     // ============================================
    
//     async init() {
//         console.log('🚀 Advanced Analysis - Wall Street Edition - Initializing...');
        
//         this.rateLimiter = new RateLimiter(8, 60000);
//         this.optimizedCache = new OptimizedCache();
        
//         await this.waitForAuth();
        
//         this.apiClient = new FinanceAPIClient({
//             baseURL: APP_CONFIG.API_BASE_URL,
//             cacheDuration: APP_CONFIG.CACHE_DURATION || 300000,
//             maxRetries: APP_CONFIG.MAX_RETRIES || 2,
//             onLoadingChange: (isLoading) => {
//                 this.showLoading(isLoading);
//             }
//         });
        
//         window.apiClient = this.apiClient;
//         window.rateLimiter = this.rateLimiter;
        
//         this.updateLastUpdate();
//         this.setupEventListeners();
//         this.startCacheMonitoring();
        
//         setTimeout(() => {
//             this.loadSymbol(this.currentSymbol);
//         }, 500);
        
//         console.log('✅ Advanced Analysis - Wall Street Edition - Ready!');
//     },
    
//     async waitForAuth() {
//         return new Promise((resolve) => {
//             if (!firebase || !firebase.auth) {
//                 console.warn('⚠ Firebase not available');
//                 resolve();
//                 return;
//             }
            
//             const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
//                 if (user) {
//                     console.log('✅ User authenticated');
//                     unsubscribe();
//                     resolve();
//                 }
//             });
            
//             setTimeout(() => {
//                 resolve();
//             }, 3000);
//         });
//     },
    
//     startCacheMonitoring() {
//         setInterval(() => {
//             if (window.cacheWidget) {
//                 const remaining = this.rateLimiter.getRemainingRequests();
//                 const queueLength = this.rateLimiter.getQueueLength();
                
//                 window.cacheWidget.updateRateLimitStatus(remaining, 8);
                
//                 if (queueLength > 0) {
//                     window.cacheWidget.updateQueueStatus(queueLength, 0);
//                 }
//             }
//         }, 1000);
//     },
    
//     async apiRequest(fn, priority = 'normal') {
//         return await this.rateLimiter.execute(fn, priority);
//     },
    
//     setupEventListeners() {
//         const input = document.getElementById('symbolInput');
//         if (input) {
//             input.addEventListener('input', (e) => {
//                 this.handleSearch(e.target.value);
//             });
            
//             input.addEventListener('keydown', (e) => {
//                 if (e.key === 'Enter') {
//                     e.preventDefault();
//                     if (this.selectedSuggestionIndex >= 0) {
//                         const suggestions = document.querySelectorAll('.suggestion-item');
//                         if (suggestions[this.selectedSuggestionIndex]) {
//                             const symbol = suggestions[this.selectedSuggestionIndex].dataset.symbol;
//                             this.selectSuggestion(symbol);
//                         }
//                     } else {
//                         this.analyzeStock();
//                     }
//                 } else if (e.key === 'ArrowDown') {
//                     e.preventDefault();
//                     this.navigateSuggestions('down');
//                 } else if (e.key === 'ArrowUp') {
//                     e.preventDefault();
//                     this.navigateSuggestions('up');
//                 } else if (e.key === 'Escape') {
//                     this.hideSuggestions();
//                 }
//             });
            
//             input.addEventListener('focus', (e) => {
//                 if (e.target.value.trim().length > 0) {
//                     this.handleSearch(e.target.value);
//                 }
//             });
//         }
        
//         document.addEventListener('click', (e) => {
//             if (!e.target.closest('.search-input-wrapper')) {
//                 this.hideSuggestions();
//             }
//         });
//     },
    
//     // ============================================
//     // SEARCH FUNCTIONALITY (CONSERVÉ)
//     // ============================================
    
//     handleSearch(query) {
//         const trimmedQuery = query.trim();
        
//         if (trimmedQuery.length === 0) {
//             this.hideSuggestions();
//             return;
//         }
        
//         clearTimeout(this.searchTimeout);
        
//         this.searchTimeout = setTimeout(() => {
//             this.searchSymbols(trimmedQuery);
//         }, 500);
//     },
    
//     async searchSymbols(query) {
//         console.log('🔍 Searching for:', query);
        
//         const container = document.getElementById('searchSuggestions');
//         container.innerHTML = '<div class="suggestion-loading"><i class="fas fa-spinner fa-spin"></i> Searching...</div>';
//         container.classList.add('active');
        
//         try {
//             const results = await this.apiRequest(() => this.apiClient.searchSymbol(query), 'low');
            
//             if (results.data && results.data.length > 0) {
//                 this.displaySearchResults(results.data, query);
//             } else {
//                 this.displayNoResults();
//             }
            
//         } catch (error) {
//             console.error('Search failed:', error);
//             this.displaySearchError();
//         }
//     },
    
//     displaySearchResults(quotes, query) {
//         const container = document.getElementById('searchSuggestions');
        
//         const stocks = [];
//         const etfs = [];
//         const crypto = [];
//         const indices = [];
//         const other = [];
        
//         quotes.forEach(quote => {
//             const type = (quote.instrument_type || 'Common Stock').toLowerCase();
            
//             if (type.includes('stock') || type.includes('equity')) {
//                 stocks.push(quote);
//             } else if (type.includes('etf')) {
//                 etfs.push(quote);
//             } else if (type.includes('crypto') || type.includes('digital currency')) {
//                 crypto.push(quote);
//             } else if (type.includes('index')) {
//                 indices.push(quote);
//             } else {
//                 other.push(quote);
//             }
//         });
        
//         let html = '';
//         if (stocks.length > 0) html += this.buildCategoryHTML('Stocks', stocks, query);
//         if (etfs.length > 0) html += this.buildCategoryHTML('ETFs', etfs, query);
//         if (crypto.length > 0) html += this.buildCategoryHTML('Cryptocurrencies', crypto, query);
//         if (indices.length > 0) html += this.buildCategoryHTML('Indices', indices, query);
//         if (other.length > 0) html += this.buildCategoryHTML('Other', other, query);
        
//         if (html === '') {
//             this.displayNoResults();
//         } else {
//             container.innerHTML = html;
//             container.classList.add('active');
//             this.selectedSuggestionIndex = -1;
            
//             container.querySelectorAll('.suggestion-item').forEach((item) => {
//                 item.addEventListener('click', () => {
//                     this.selectSuggestion(item.dataset.symbol);
//                 });
//             });
//         }
//     },
    
//     buildCategoryHTML(categoryName, items, query) {
//         const iconMap = {
//             'Stocks': 'chart-line',
//             'ETFs': 'layer-group',
//             'Cryptocurrencies': 'coins',
//             'Indices': 'chart-bar',
//             'Other': 'folder'
//         };
        
//         const sectorMap = {
//             'Stocks': 'tech',
//             'ETFs': 'etf',
//             'Cryptocurrencies': 'crypto',
//             'Indices': 'finance',
//             'Other': 'industrial'
//         };
        
//         let html = `<div class="suggestion-category">
//             <i class="fas fa-${iconMap[categoryName] || 'folder'}"></i> ${categoryName}
//         </div>`;
        
//         items.slice(0, 10).forEach(item => {
//             const highlightedSymbol = this.highlightMatch(item.symbol, query);
//             const highlightedName = this.highlightMatch(item.instrument_name, query);
            
//             html += `
//                 <div class="suggestion-item" data-symbol="${this.escapeHtml(item.symbol)}">
//                     <div class="suggestion-icon ${sectorMap[categoryName] || 'tech'}">
//                         ${this.escapeHtml(item.symbol.substring(0, 2))}
//                     </div>
//                     <div class="suggestion-info">
//                         <div class="suggestion-symbol">${highlightedSymbol}</div>
//                         <div class="suggestion-name">${highlightedName}</div>
//                     </div>
//                     ${item.exchange ? `<div class="suggestion-exchange">${this.escapeHtml(item.exchange)}</div>` : ''}
//                 </div>
//             `;
//         });
        
//         return html;
//     },
    
//     highlightMatch(text, query) {
//         if (!text || !query) return this.escapeHtml(text);
//         const escapedText = this.escapeHtml(text);
//         const escapedQuery = this.escapeHtml(query);
//         const regex = new RegExp(`(${escapedQuery})`, 'gi');
//         return escapedText.replace(regex, '<span class="suggestion-match">$1</span>');
//     },
    
//     escapeHtml(text) {
//         if (!text) return '';
//         const div = document.createElement('div');
//         div.textContent = text;
//         return div.innerHTML;
//     },
    
//     displayNoResults() {
//         const container = document.getElementById('searchSuggestions');
//         container.innerHTML = `
//             <div class="no-results">
//                 <i class="fas fa-search"></i>
//                 <p><strong>No results found</strong></p>
//                 <p>Try searching by ticker symbol or company name</p>
//             </div>
//         `;
//         container.classList.add('active');
//     },
    
//     displaySearchError() {
//         const container = document.getElementById('searchSuggestions');
//         container.innerHTML = `
//             <div class="no-results">
//                 <i class="fas fa-exclamation-triangle"></i>
//                 <p><strong>Search temporarily unavailable</strong></p>
//                 <p>Please enter a ticker symbol directly</p>
//             </div>
//         `;
//         container.classList.add('active');
//     },
    
//     selectSuggestion(symbol) {
//         document.getElementById('symbolInput').value = symbol;
//         this.hideSuggestions();
//         this.loadSymbol(symbol);
//     },
    
//     hideSuggestions() {
//         const container = document.getElementById('searchSuggestions');
//         container.classList.remove('active');
//         this.selectedSuggestionIndex = -1;
//     },
    
//     navigateSuggestions(direction) {
//         const suggestions = document.querySelectorAll('.suggestion-item');
//         if (suggestions.length === 0) return;
        
//         if (this.selectedSuggestionIndex >= 0) {
//             suggestions[this.selectedSuggestionIndex].classList.remove('selected');
//         }
        
//         if (direction === 'down') {
//             this.selectedSuggestionIndex = (this.selectedSuggestionIndex + 1) % suggestions.length;
//         } else {
//             this.selectedSuggestionIndex = this.selectedSuggestionIndex <= 0 
//                 ? suggestions.length - 1 
//                 : this.selectedSuggestionIndex - 1;
//         }
        
//         suggestions[this.selectedSuggestionIndex].classList.add('selected');
//         suggestions[this.selectedSuggestionIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
//     },
    
//     // ============================================
//     // LOAD SYMBOL (CONSERVÉ)
//     // ============================================
    
//     analyzeStock() {
//         const symbol = document.getElementById('symbolInput').value.trim().toUpperCase();
//         if (symbol) {
//             this.loadSymbol(symbol);
//         }
//     },
    
//     async loadSymbol(symbol) {
//         this.currentSymbol = symbol;
//         document.getElementById('symbolInput').value = symbol;
//         this.hideSuggestions();
        
//         this.showLoading(true);
//         this.hideResults();
        
//         try {
//             console.log(`📊 Loading ${symbol} with Twelve Data API...`);
            
//             const [quote, timeSeries] = await Promise.all([
//                 this.apiRequest(() => this.apiClient.getQuote(symbol), 'high'),
//                 this.apiRequest(() => this.getTimeSeriesForPeriod(symbol, this.currentPeriod), 'high')
//             ]);
            
//             if (!quote || !timeSeries) {
//                 throw new Error('Failed to load stock data');
//             }
            
//             this.stockData = {
//                 symbol: quote.symbol,
//                 prices: timeSeries.data,
//                 currency: 'USD',
//                 quote: quote
//             };
            
//             console.log('✅ Data loaded successfully');
            
//             this.displayStockHeader();
//             this.updateAllIndicators();
//             this.showLoading(false);
            
//         } catch (error) {
//             console.error('Error loading stock data:', error);
//             console.log('Using demo data as fallback...');
//             this.stockData = this.generateDemoData(symbol);
//             this.displayStockHeader();
//             this.updateAllIndicators();
//             this.showLoading(false);
//         }
//     },
    
//     async getTimeSeriesForPeriod(symbol, period) {
//         const periodMap = {
//             '1M': { interval: '1day', outputsize: 30 },
//             '3M': { interval: '1day', outputsize: 90 },
//             '6M': { interval: '1day', outputsize: 180 },
//             '1Y': { interval: '1day', outputsize: 252 },
//             '5Y': { interval: '1week', outputsize: 260 }
//         };
        
//         const config = periodMap[period] || periodMap['6M'];
//         return await this.apiClient.getTimeSeries(symbol, config.interval, config.outputsize);
//     },
    
//     changePeriod(period) {
//         this.currentPeriod = period;
        
//         document.querySelectorAll('.horizon-btn').forEach(btn => {
//             btn.classList.remove('active');
//         });
        
//         const selectedBtn = document.querySelector(`[data-period="${period}"]`);
//         if (selectedBtn) {
//             selectedBtn.classList.add('active');
//         }
        
//         if (this.currentSymbol) {
//             this.loadSymbol(this.currentSymbol);
//         }
//     },
    
//     displayStockHeader() {
//         const quote = this.stockData.quote;
        
//         if (!quote || Object.keys(quote).length === 0) {
//             if (this.stockData.prices && this.stockData.prices.length > 0) {
//                 const lastPrice = this.stockData.prices[this.stockData.prices.length - 1];
//                 const prevPrice = this.stockData.prices[this.stockData.prices.length - 2] || lastPrice;
                
//                 this.stockData.quote = {
//                     name: this.currentSymbol,
//                     symbol: this.currentSymbol,
//                     price: lastPrice.close,
//                     change: lastPrice.close - prevPrice.close,
//                     percentChange: ((lastPrice.close - prevPrice.close) / prevPrice.close) * 100
//                 };
//             }
//         }
        
//         const displayQuote = this.stockData.quote;
        
//         document.getElementById('stockSymbol').textContent = displayQuote.symbol || this.currentSymbol;
//         document.getElementById('stockName').textContent = displayQuote.name || this.currentSymbol;
        
//         const price = displayQuote.price !== undefined && displayQuote.price !== null ? displayQuote.price : 0;
//         const change = displayQuote.change !== undefined && displayQuote.change !== null ? displayQuote.change : 0;
//         const changePercent = displayQuote.percentChange !== undefined && displayQuote.percentChange !== null ? displayQuote.percentChange : 0;
        
//         document.getElementById('currentPrice').textContent = this.formatCurrency(price);
        
//         const changeEl = document.getElementById('priceChange');
//         const changeText = `${change >= 0 ? '+' : ''}${this.formatCurrency(change)} (${change >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)`;
//         changeEl.textContent = changeText;
//         changeEl.className = change >= 0 ? 'change positive' : 'change negative';
        
//         document.getElementById('stockHeader').classList.remove('hidden');
//     },

//     // ============================================
//     // ✅ UPDATE ALL INDICATORS (ÉTENDU)
//     // ============================================
    
//     updateAllIndicators() {
//         console.log('📊 Updating all indicators (Wall Street Edition)...');
        
//         const resultsPanel = document.getElementById('resultsPanel');
//         if (resultsPanel.classList.contains('hidden')) {
//             resultsPanel.classList.remove('hidden');
//         }
        
//         // Indicateurs originaux
//         this.updateIchimokuChart();
//         this.updateStochasticChart();
//         this.updateWilliamsChart();
//         this.updateADXChart();
//         this.updateSARChart();
//         this.updateOBVChart();
//         this.updateATRChart();
//         this.updateFibonacciChart();
//         this.createPivotPoints();
//         this.updateVWAPChart();
        
//         // ✅ NOUVEAUX INDICATEURS
//         this.updateRSIChart();
//         this.updateMACDChart();
//         this.updateBollingerChart();
//         this.updateMFIChart();
//         this.updateCCIChart();
//         this.updateUltimateOscillatorChart();
//         this.updateROCChart();
//         this.updateAroonChart();
//         this.updateKeltnerChart();
//         this.updateDonchianChart();
//         this.updateCMFChart();
//         this.updateElderRayChart();
//         this.updateVolumeProfileChart();
//         this.updateMovingAveragesChart();
//         this.updateLinearRegressionChart();
//         this.detectCandlestickPatterns();
//         this.detectSupportResistance();
//         this.detectDivergences();
        
//         // Signaux consolidés
//         this.generateConsolidatedSignals();
//         this.generateAIRecommendation();
        
//         console.log('✅ All indicators updated (40+ indicators)');
//     },
    
//     // ============================================
//     // ✅ RSI (Relative Strength Index)
//     // ============================================
    
//     updateRSIChart() {
//         const prices = this.stockData.prices;
//         const rsi = this.calculateRSI(prices);
        
//         if (this.charts.rsi) {
//             this.charts.rsi.series[0].setData(rsi, true);
//         } else {
//             this.charts.rsi = Highcharts.chart('rsiChart', {
//                 chart: { borderRadius: 15, height: 400 },
//                 title: {
//                     text: 'RSI - Relative Strength Index',
//                     style: { color: this.colors.primary, fontWeight: 'bold' }
//                 },
//                 xAxis: { type: 'datetime', crosshair: true },
//                 yAxis: {
//                     title: { text: 'RSI' },
//                     plotLines: [
//                         {
//                             value: 70,
//                             color: this.colors.danger,
//                             dashStyle: 'ShortDash',
//                             width: 2,
//                             label: { 
//                                 text: 'Overbought (70)', 
//                                 align: 'right', 
//                                 style: { color: this.colors.danger, fontWeight: 'bold' } 
//                             }
//                         },
//                         {
//                             value: 50,
//                             color: '#999',
//                             dashStyle: 'Dot',
//                             width: 1,
//                             label: { text: 'Neutral (50)', align: 'right' }
//                         },
//                         {
//                             value: 30,
//                             color: this.colors.success,
//                             dashStyle: 'ShortDash',
//                             width: 2,
//                             label: { 
//                                 text: 'Oversold (30)', 
//                                 align: 'right', 
//                                 style: { color: this.colors.success, fontWeight: 'bold' } 
//                             }
//                         }
//                     ],
//                     min: 0,
//                     max: 100
//                 },
//                 tooltip: { borderRadius: 10, valueDecimals: 2 },
//                 series: [
//                     {
//                         type: 'area',
//                         name: 'RSI',
//                         data: rsi,
//                         color: this.colors.secondary,
//                         fillColor: {
//                             linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
//                             stops: [
//                                 [0, Highcharts.color(this.colors.secondary).setOpacity(0.4).get('rgba')],
//                                 [1, Highcharts.color(this.colors.secondary).setOpacity(0.1).get('rgba')]
//                             ]
//                         },
//                         lineWidth: 2,
//                         zones: [
//                             { value: 30, color: this.colors.success },
//                             { value: 70, color: this.colors.secondary },
//                             { color: this.colors.danger }
//                         ]
//                     }
//                 ],
//                 credits: { enabled: false }
//             });
//         }
        
//         this.displayRSISignal(rsi);
//     },
    
//     calculateRSI(prices, period = 14) {
//         const rsi = [];
//         const changes = [];
        
//         for (let i = 1; i < prices.length; i++) {
//             changes.push(prices[i].close - prices[i - 1].close);
//         }
        
//         let avgGain = 0;
//         let avgLoss = 0;
        
//         for (let i = 0; i < period; i++) {
//             if (changes[i] > 0) {
//                 avgGain += changes[i];
//             } else {
//                 avgLoss += Math.abs(changes[i]);
//             }
//         }
        
//         avgGain /= period;
//         avgLoss /= period;
        
//         for (let i = period; i < changes.length; i++) {
//             const gain = changes[i] > 0 ? changes[i] : 0;
//             const loss = changes[i] < 0 ? Math.abs(changes[i]) : 0;
            
//             avgGain = (avgGain * (period - 1) + gain) / period;
//             avgLoss = (avgLoss * (period - 1) + loss) / period;
            
//             const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
//             const rsiValue = 100 - (100 / (1 + rs));
            
//             rsi.push([prices[i + 1].timestamp, rsiValue]);
//         }
        
//         return rsi;
//     },
    
//     displayRSISignal(rsi) {
//         if (!rsi.length) {
//             document.getElementById('rsiSignal').textContent = 'Not enough data';
//             return;
//         }
        
//         const lastRSI = rsi[rsi.length - 1][1];
        
//         let signal = 'neutral';
//         let text = `RSI: ${lastRSI.toFixed(2)} - `;
        
//         if (lastRSI > 70) {
//             signal = 'bearish';
//             text += 'OVERBOUGHT - Strong Sell Signal';
//         } else if (lastRSI > 60) {
//             signal = 'bearish';
//             text += 'Approaching Overbought - Caution';
//         } else if (lastRSI < 30) {
//             signal = 'bullish';
//             text += 'OVERSOLD - Strong Buy Signal';
//         } else if (lastRSI < 40) {
//             signal = 'bullish';
//             text += 'Approaching Oversold - Watch for Entry';
//         } else {
//             text += 'Neutral Zone - No Clear Signal';
//         }
        
//         const signalBox = document.getElementById('rsiSignal');
//         signalBox.className = `signal-box ${signal}`;
//         signalBox.textContent = text;
//     },
    
//     // ============================================
//     // ✅ MACD (Moving Average Convergence Divergence)
//     // ============================================
    
//     updateMACDChart() {
//         const prices = this.stockData.prices;
//         const macd = this.calculateMACD(prices);
        
//         if (this.charts.macd) {
//             this.charts.macd.series[0].setData(macd.macdLine, false);
//             this.charts.macd.series[1].setData(macd.signalLine, false);
//             this.charts.macd.series[2].setData(macd.histogram, false);
//             this.charts.macd.redraw();
//         } else {
//             this.charts.macd = Highcharts.chart('macdChart', {
//                 chart: { borderRadius: 15, height: 400 },
//                 title: {
//                     text: 'MACD - Moving Average Convergence Divergence',
//                     style: { color: this.colors.primary, fontWeight: 'bold' }
//                 },
//                 xAxis: { type: 'datetime', crosshair: true },
//                 yAxis: [
//                     {
//                         title: { text: 'MACD' },
//                         plotLines: [{
//                             value: 0,
//                             color: '#999',
//                             dashStyle: 'Dash',
//                             width: 2
//                         }]
//                     }
//                 ],
//                 tooltip: { borderRadius: 10, shared: true, valueDecimals: 4 },
//                 series: [
//                     {
//                         type: 'line',
//                         name: 'MACD Line',
//                         data: macd.macdLine,
//                         color: this.colors.primary,
//                         lineWidth: 2,
//                         zIndex: 2
//                     },
//                     {
//                         type: 'line',
//                         name: 'Signal Line',
//                         data: macd.signalLine,
//                         color: this.colors.danger,
//                         lineWidth: 2,
//                         zIndex: 2
//                     },
//                     {
//                         type: 'column',
//                         name: 'Histogram',
//                         data: macd.histogram,
//                         color: this.colors.success,
//                         negativeColor: this.colors.danger,
//                         zIndex: 1
//                     }
//                 ],
//                 credits: { enabled: false }
//             });
//         }
        
//         this.displayMACDSignal(macd);
//     },
    
//     calculateMACD(prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
//         const closes = prices.map(p => p.close);
        
//         const fastEMA = this.calculateEMA(closes, fastPeriod);
//         const slowEMA = this.calculateEMA(closes, slowPeriod);
        
//         const macdLine = [];
//         const startIndex = Math.max(fastEMA.length - slowEMA.length, 0);
        
//         for (let i = 0; i < slowEMA.length; i++) {
//             const macdValue = fastEMA[i + startIndex] - slowEMA[i];
//             macdLine.push(macdValue);
//         }
        
//         const signalEMA = this.calculateEMA(macdLine, signalPeriod);
        
//         const macdLineData = [];
//         const signalLineData = [];
//         const histogram = [];
        
//         const offset = prices.length - macdLine.length;
//         const signalOffset = macdLine.length - signalEMA.length;
        
//         for (let i = 0; i < signalEMA.length; i++) {
//             const timestamp = prices[offset + signalOffset + i].timestamp;
//             const macdVal = macdLine[signalOffset + i];
//             const signalVal = signalEMA[i];
            
//             macdLineData.push([timestamp, macdVal]);
//             signalLineData.push([timestamp, signalVal]);
//             histogram.push([timestamp, macdVal - signalVal]);
//         }
        
//         return { macdLine: macdLineData, signalLine: signalLineData, histogram };
//     },
    
//     calculateEMA(data, period) {
//         const ema = [];
//         const multiplier = 2 / (period + 1);
        
//         let sum = 0;
//         for (let i = 0; i < period && i < data.length; i++) {
//             sum += data[i];
//         }
//         ema.push(sum / period);
        
//         for (let i = period; i < data.length; i++) {
//             const value = (data[i] - ema[ema.length - 1]) * multiplier + ema[ema.length - 1];
//             ema.push(value);
//         }
        
//         return ema;
//     },
    
//     displayMACDSignal(macd) {
//         if (!macd.histogram.length) {
//             document.getElementById('macdSignal').textContent = 'Not enough data';
//             return;
//         }
        
//         const lastHistogram = macd.histogram[macd.histogram.length - 1][1];
//         const prevHistogram = macd.histogram[macd.histogram.length - 2]?.[1] || 0;
        
//         let signal = 'neutral';
//         let text = `Histogram: ${lastHistogram.toFixed(4)} - `;
        
//         if (lastHistogram > 0 && prevHistogram <= 0) {
//             signal = 'bullish';
//             text += 'BULLISH CROSSOVER - Strong Buy Signal';
//         } else if (lastHistogram < 0 && prevHistogram >= 0) {
//             signal = 'bearish';
//             text += 'BEARISH CROSSOVER - Strong Sell Signal';
//         } else if (lastHistogram > 0 && lastHistogram > prevHistogram) {
//             signal = 'bullish';
//             text += 'Bullish Momentum Increasing';
//         } else if (lastHistogram < 0 && lastHistogram < prevHistogram) {
//             signal = 'bearish';
//             text += 'Bearish Momentum Increasing';
//         } else if (lastHistogram > 0) {
//             signal = 'bullish';
//             text += 'Bullish but Weakening';
//         } else if (lastHistogram < 0) {
//             signal = 'bearish';
//             text += 'Bearish but Weakening';
//         } else {
//             text += 'No Clear Signal';
//         }
        
//         const signalBox = document.getElementById('macdSignal');
//         signalBox.className = `signal-box ${signal}`;
//         signalBox.textContent = text;
//     },
    
//     // ============================================
//     // ✅ BOLLINGER BANDS
//     // ============================================
    
//     updateBollingerChart() {
//         const prices = this.stockData.prices;
//         const bollinger = this.calculateBollingerBands(prices);
//         const ohlc = prices.map(p => [p.timestamp, p.open, p.high, p.low, p.close]);
        
//         if (this.charts.bollinger) {
//             this.charts.bollinger.series[0].setData(ohlc, false);
//             this.charts.bollinger.series[1].setData(bollinger.upper, false);
//             this.charts.bollinger.series[2].setData(bollinger.middle, false);
//             this.charts.bollinger.series[3].setData(bollinger.lower, false);
//             this.charts.bollinger.redraw();
//         } else {
//             this.charts.bollinger = Highcharts.stockChart('bollingerChart', {
//                 chart: { borderRadius: 15, height: 600 },
//                 title: {
//                     text: 'Bollinger Bands (20, 2)',
//                     style: { color: this.colors.primary, fontWeight: 'bold' }
//                 },
//                 rangeSelector: { enabled: false },
//                 navigator: { enabled: true },
//                 xAxis: { type: 'datetime', crosshair: true },
//                 yAxis: { title: { text: 'Price' } },
//                 tooltip: { borderRadius: 10, shared: true },
//                 series: [
//                     {
//                         type: 'candlestick',
//                         name: this.currentSymbol,
//                         data: ohlc,
//                         color: this.colors.danger,
//                         upColor: this.colors.success,
//                         zIndex: 2
//                     },
//                     {
//                         type: 'line',
//                         name: 'Upper Band',
//                         data: bollinger.upper,
//                         color: this.colors.danger,
//                         lineWidth: 2,
//                         dashStyle: 'Dash',
//                         zIndex: 1
//                     },
//                     {
//                         type: 'line',
//                         name: 'Middle Band (SMA)',
//                         data: bollinger.middle,
//                         color: this.colors.primary,
//                         lineWidth: 2,
//                         zIndex: 1
//                     },
//                     {
//                         type: 'line',
//                         name: 'Lower Band',
//                         data: bollinger.lower,
//                         color: this.colors.success,
//                         lineWidth: 2,
//                         dashStyle: 'Dash',
//                         zIndex: 1
//                     }
//                 ],
//                 credits: { enabled: false }
//             });
//         }
        
//         this.displayBollingerSignal(bollinger, prices);
//     },
    
//     calculateBollingerBands(prices, period = 20, stdDevMultiplier = 2) {
//         const closes = prices.map(p => p.close);
//         const upper = [];
//         const middle = [];
//         const lower = [];
        
//         for (let i = period - 1; i < closes.length; i++) {
//             const slice = closes.slice(i - period + 1, i + 1);
//             const sma = slice.reduce((a, b) => a + b, 0) / period;
            
//             const variance = slice.reduce((sum, val) => sum + Math.pow(val - sma, 2), 0) / period;
//             const stdDev = Math.sqrt(variance);
            
//             const timestamp = prices[i].timestamp;
            
//             upper.push([timestamp, sma + stdDevMultiplier * stdDev]);
//             middle.push([timestamp, sma]);
//             lower.push([timestamp, sma - stdDevMultiplier * stdDev]);
//         }
        
//         return { upper, middle, lower };
//     },
    
//     displayBollingerSignal(bollinger, prices) {
//         if (!bollinger.upper.length) {
//             document.getElementById('bollingerSignal').textContent = 'Not enough data';
//             return;
//         }
        
//         const lastPrice = prices[prices.length - 1].close;
//         const lastUpper = bollinger.upper[bollinger.upper.length - 1][1];
//         const lastMiddle = bollinger.middle[bollinger.middle.length - 1][1];
//         const lastLower = bollinger.lower[bollinger.lower.length - 1][1];
        
//         const bandwidth = ((lastUpper - lastLower) / lastMiddle) * 100;
        
//         let signal = 'neutral';
//         let text = `Price: ${this.formatCurrency(lastPrice)} - `;
        
//         if (lastPrice > lastUpper) {
//             signal = 'bearish';
//             text += 'ABOVE UPPER BAND - Overbought, Potential Reversal';
//         } else if (lastPrice < lastLower) {
//             signal = 'bullish';
//             text += 'BELOW LOWER BAND - Oversold, Potential Reversal';
//         } else if (lastPrice > lastMiddle) {
//             signal = 'bullish';
//             text += 'Above Middle Band - Bullish Territory';
//         } else if (lastPrice < lastMiddle) {
//             signal = 'bearish';
//             text += 'Below Middle Band - Bearish Territory';
//         } else {
//             text += 'At Middle Band - Neutral';
//         }
        
//         text += ` | Bandwidth: ${bandwidth.toFixed(2)}%`;
        
//         if (bandwidth < 5) {
//             text += ' (Squeeze - Breakout Coming)';
//         } else if (bandwidth > 20) {
//             text += ' (High Volatility)';
//         }
        
//         const signalBox = document.getElementById('bollingerSignal');
//         signalBox.className = `signal-box ${signal}`;
//         signalBox.textContent = text;
//     },
    
//     // ============================================
//     // ✅ MFI (Money Flow Index)
//     // ============================================
    
//     updateMFIChart() {
//         const prices = this.stockData.prices;
//         const mfi = this.calculateMFI(prices);
        
//         if (this.charts.mfi) {
//             this.charts.mfi.series[0].setData(mfi, true);
//         } else {
//             this.charts.mfi = Highcharts.chart('mfiChart', {
//                 chart: { borderRadius: 15, height: 400 },
//                 title: {
//                     text: 'MFI - Money Flow Index',
//                     style: { color: this.colors.primary, fontWeight: 'bold' }
//                 },
//                 xAxis: { type: 'datetime', crosshair: true },
//                 yAxis: {
//                     title: { text: 'MFI' },
//                     plotLines: [
//                         {
//                             value: 80,
//                             color: this.colors.danger,
//                             dashStyle: 'ShortDash',
//                             width: 2,
//                             label: { text: 'Overbought (80)', align: 'right', style: { color: this.colors.danger } }
//                         },
//                         {
//                             value: 20,
//                             color: this.colors.success,
//                             dashStyle: 'ShortDash',
//                             width: 2,
//                             label: { text: 'Oversold (20)', align: 'right', style: { color: this.colors.success } }
//                         }
//                     ],
//                     min: 0,
//                     max: 100
//                 },
//                 tooltip: { borderRadius: 10, valueDecimals: 2 },
//                 series: [
//                     {
//                         type: 'area',
//                         name: 'MFI',
//                         data: mfi,
//                         color: this.colors.teal,
//                         fillOpacity: 0.3,
//                         lineWidth: 2
//                     }
//                 ],
//                 credits: { enabled: false }
//             });
//         }
        
//         this.displayMFISignal(mfi);
//     },
    
//     calculateMFI(prices, period = 14) {
//         const mfi = [];
//         const typicalPrices = [];
//         const moneyFlow = [];
        
//         for (let i = 0; i < prices.length; i++) {
//             const typical = (prices[i].high + prices[i].low + prices[i].close) / 3;
//             typicalPrices.push(typical);
//             moneyFlow.push(typical * prices[i].volume);
//         }
        
//         for (let i = period; i < prices.length; i++) {
//             let positiveFlow = 0;
//             let negativeFlow = 0;
            
//             for (let j = i - period + 1; j <= i; j++) {
//                 if (typicalPrices[j] > typicalPrices[j - 1]) {
//                     positiveFlow += moneyFlow[j];
//                 } else if (typicalPrices[j] < typicalPrices[j - 1]) {
//                     negativeFlow += moneyFlow[j];
//                 }
//             }
            
//             const moneyFlowRatio = negativeFlow === 0 ? 100 : positiveFlow / negativeFlow;
//             const mfiValue = 100 - (100 / (1 + moneyFlowRatio));
            
//             mfi.push([prices[i].timestamp, mfiValue]);
//         }
        
//         return mfi;
//     },
    
//     displayMFISignal(mfi) {
//         if (!mfi.length) {
//             document.getElementById('mfiSignal').textContent = 'Not enough data';
//             return;
//         }
        
//         const lastMFI = mfi[mfi.length - 1][1];
        
//         let signal = 'neutral';
//         let text = `MFI: ${lastMFI.toFixed(2)} - `;
        
//         if (lastMFI > 80) {
//             signal = 'bearish';
//             text += 'OVERBOUGHT - Strong Money Outflow Expected';
//         } else if (lastMFI < 20) {
//             signal = 'bullish';
//             text += 'OVERSOLD - Strong Money Inflow Expected';
//         } else if (lastMFI > 50) {
//             signal = 'bullish';
//             text += 'Positive Money Flow - Buyers in Control';
//         } else {
//             signal = 'bearish';
//             text += 'Negative Money Flow - Sellers in Control';
//         }
        
//         const signalBox = document.getElementById('mfiSignal');
//         signalBox.className = `signal-box ${signal}`;
//         signalBox.textContent = text;
//     },
    
//     // ============================================
//     // ✅ CCI (Commodity Channel Index)
//     // ============================================
    
//     updateCCIChart() {
//         const prices = this.stockData.prices;
//         const cci = this.calculateCCI(prices);
        
//         if (this.charts.cci) {
//             this.charts.cci.series[0].setData(cci, true);
//         } else {
//             this.charts.cci = Highcharts.chart('cciChart', {
//                 chart: { borderRadius: 15, height: 400 },
//                 title: {
//                     text: 'CCI - Commodity Channel Index',
//                     style: { color: this.colors.primary, fontWeight: 'bold' }
//                 },
//                 xAxis: { type: 'datetime', crosshair: true },
//                 yAxis: {
//                     title: { text: 'CCI' },
//                     plotLines: [
//                         {
//                             value: 100,
//                             color: this.colors.danger,
//                             dashStyle: 'ShortDash',
//                             width: 2,
//                             label: { text: 'Overbought (+100)', align: 'right', style: { color: this.colors.danger } }
//                         },
//                         {
//                             value: 0,
//                             color: '#999',
//                             dashStyle: 'Dot',
//                             width: 1
//                         },
//                         {
//                             value: -100,
//                             color: this.colors.success,
//                             dashStyle: 'ShortDash',
//                             width: 2,
//                             label: { text: 'Oversold (-100)', align: 'right', style: { color: this.colors.success } }
//                         }
//                     ]
//                 },
//                 tooltip: { borderRadius: 10, valueDecimals: 2 },
//                 series: [
//                     {
//                         type: 'line',
//                         name: 'CCI',
//                         data: cci,
//                         color: this.colors.indigo,
//                         lineWidth: 2
//                     }
//                 ],
//                 credits: { enabled: false }
//             });
//         }
        
//         this.displayCCISignal(cci);
//     },
    
//     calculateCCI(prices, period = 20) {
//         const cci = [];
//         const typicalPrices = prices.map(p => (p.high + p.low + p.close) / 3);
        
//         for (let i = period - 1; i < prices.length; i++) {
//             const slice = typicalPrices.slice(i - period + 1, i + 1);
//             const sma = slice.reduce((a, b) => a + b, 0) / period;
            
//             const meanDeviation = slice.reduce((sum, val) => sum + Math.abs(val - sma), 0) / period;
            
//             const cciValue = (typicalPrices[i] - sma) / (0.015 * meanDeviation);
            
//             cci.push([prices[i].timestamp, cciValue]);
//         }
        
//         return cci;
//     },
    
//     displayCCISignal(cci) {
//         if (!cci.length) {
//             document.getElementById('cciSignal').textContent = 'Not enough data';
//             return;
//         }
        
//         const lastCCI = cci[cci.length - 1][1];
        
//         let signal = 'neutral';
//         let text = `CCI: ${lastCCI.toFixed(2)} - `;
        
//         if (lastCCI > 100) {
//             signal = 'bearish';
//             text += 'OVERBOUGHT - Strong Reversal Signal';
//         } else if (lastCCI < -100) {
//             signal = 'bullish';
//             text += 'OVERSOLD - Strong Reversal Signal';
//         } else if (lastCCI > 0) {
//             signal = 'bullish';
//             text += 'Bullish Territory';
//         } else {
//             signal = 'bearish';
//             text += 'Bearish Territory';
//         }
        
//         const signalBox = document.getElementById('cciSignal');
//         signalBox.className = `signal-box ${signal}`;
//         signalBox.textContent = text;
//     },
    
//     // ============================================
//     // ✅ ULTIMATE OSCILLATOR
//     // ============================================
    
//     updateUltimateOscillatorChart() {
//         const prices = this.stockData.prices;
//         const ultimate = this.calculateUltimateOscillator(prices);
        
//         if (this.charts.ultimate) {
//             this.charts.ultimate.series[0].setData(ultimate, true);
//         } else {
//             this.charts.ultimate = Highcharts.chart('ultimateChart', {
//                 chart: { borderRadius: 15, height: 400 },
//                 title: {
//                     text: 'Ultimate Oscillator',
//                     style: { color: this.colors.primary, fontWeight: 'bold' }
//                 },
//                 xAxis: { type: 'datetime', crosshair: true },
//                 yAxis: {
//                     title: { text: 'Ultimate Oscillator' },
//                     plotLines: [
//                         {
//                             value: 70,
//                             color: this.colors.danger,
//                             dashStyle: 'ShortDash',
//                             width: 2,
//                             label: { text: 'Overbought (70)', align: 'right', style: { color: this.colors.danger } }
//                         },
//                         {
//                             value: 30,
//                             color: this.colors.success,
//                             dashStyle: 'ShortDash',
//                             width: 2,
//                             label: { text: 'Oversold (30)', align: 'right', style: { color: this.colors.success } }
//                         }
//                     ],
//                     min: 0,
//                     max: 100
//                 },
//                 tooltip: { borderRadius: 10, valueDecimals: 2 },
//                 series: [
//                     {
//                         type: 'area',
//                         name: 'Ultimate Oscillator',
//                         data: ultimate,
//                         color: this.colors.pink,
//                         fillOpacity: 0.3,
//                         lineWidth: 2
//                     }
//                 ],
//                 credits: { enabled: false }
//             });
//         }
        
//         this.displayUltimateSignal(ultimate);
//     },
    
//     calculateUltimateOscillator(prices, period1 = 7, period2 = 14, period3 = 28) {
//         const ultimate = [];
//         const buyingPressure = [];
//         const trueRange = [];
        
//         for (let i = 1; i < prices.length; i++) {
//             const trueLow = Math.min(prices[i].low, prices[i - 1].close);
//             const bp = prices[i].close - trueLow;
//             const tr = Math.max(prices[i].high, prices[i - 1].close) - trueLow;
            
//             buyingPressure.push(bp);
//             trueRange.push(tr);
//         }
        
//         const maxPeriod = Math.max(period1, period2, period3);
        
//         for (let i = maxPeriod - 1; i < buyingPressure.length; i++) {
//             const avg1 = this.sumArray(buyingPressure, i - period1 + 1, i + 1) / this.sumArray(trueRange, i - period1 + 1, i + 1);
//             const avg2 = this.sumArray(buyingPressure, i - period2 + 1, i + 1) / this.sumArray(trueRange, i - period2 + 1, i + 1);
//             const avg3 = this.sumArray(buyingPressure, i - period3 + 1, i + 1) / this.sumArray(trueRange, i - period3 + 1, i + 1);
            
//             const uo = 100 * ((4 * avg1 + 2 * avg2 + avg3) / 7);
            
//             ultimate.push([prices[i + 1].timestamp, uo]);
//         }
        
//         return ultimate;
//     },
    
//     sumArray(arr, start, end) {
//         let sum = 0;
//         for (let i = start; i < end && i < arr.length; i++) {
//             sum += arr[i];
//         }
//         return sum || 1;
//     },
    
//     displayUltimateSignal(ultimate) {
//         if (!ultimate.length) {
//             document.getElementById('ultimateSignal').textContent = 'Not enough data';
//             return;
//         }
        
//         const lastUO = ultimate[ultimate.length - 1][1];
        
//         let signal = 'neutral';
//         let text = `Ultimate Oscillator: ${lastUO.toFixed(2)} - `;
        
//         if (lastUO > 70) {
//             signal = 'bearish';
//             text += 'OVERBOUGHT - Sell Signal';
//         } else if (lastUO < 30) {
//             signal = 'bullish';
//             text += 'OVERSOLD - Buy Signal';
//         } else {
//             text += 'Neutral Zone';
//         }
        
//         const signalBox = document.getElementById('ultimateSignal');
//         signalBox.className = `signal-box ${signal}`;
//         signalBox.textContent = text;
//     },
    
//     // ============================================
//     // ✅ ROC (Rate of Change)
//     // ============================================
    
//     updateROCChart() {
//         const prices = this.stockData.prices;
//         const roc = this.calculateROC(prices);
        
//         if (this.charts.roc) {
//             this.charts.roc.series[0].setData(roc, true);
//         } else {
//             this.charts.roc = Highcharts.chart('rocChart', {
//                 chart: { borderRadius: 15, height: 400 },
//                 title: {
//                     text: 'ROC - Rate of Change',
//                     style: { color: this.colors.primary, fontWeight: 'bold' }
//                 },
//                 xAxis: { type: 'datetime', crosshair: true },
//                 yAxis: {
//                     title: { text: 'ROC (%)' },
//                     plotLines: [{
//                         value: 0,
//                         color: '#999',
//                         dashStyle: 'Dash',
//                         width: 2
//                     }]
//                 },
//                 tooltip: { borderRadius: 10, valueDecimals: 2, valueSuffix: '%' },
//                 series: [
//                     {
//                         type: 'area',
//                         name: 'ROC',
//                         data: roc,
//                         color: this.colors.orange,
//                         negativeColor: this.colors.danger,
//                         fillOpacity: 0.3,
//                         lineWidth: 2
//                     }
//                 ],
//                 credits: { enabled: false }
//             });
//         }
        
//         this.displayROCSignal(roc);
//     },
    
//     calculateROC(prices, period = 12) {
//         const roc = [];
        
//         for (let i = period; i < prices.length; i++) {
//             const currentClose = prices[i].close;
//             const pastClose = prices[i - period].close;
//             const rocValue = ((currentClose - pastClose) / pastClose) * 100;
            
//             roc.push([prices[i].timestamp, rocValue]);
//         }
        
//         return roc;
//     },
    
//     displayROCSignal(roc) {
//         if (!roc.length) {
//             document.getElementById('rocSignal').textContent = 'Not enough data';
//             return;
//         }
        
//         const lastROC = roc[roc.length - 1][1];
//         const prevROC = roc[roc.length - 2]?.[1] || 0;
        
//         let signal = 'neutral';
//         let text = `ROC: ${lastROC.toFixed(2)}% - `;
        
//         if (lastROC > 0 && prevROC <= 0) {
//             signal = 'bullish';
//             text += 'BULLISH CROSSOVER - Momentum Shift Up';
//         } else if (lastROC < 0 && prevROC >= 0) {
//             signal = 'bearish';
//             text += 'BEARISH CROSSOVER - Momentum Shift Down';
//         } else if (lastROC > 5) {
//             signal = 'bullish';
//             text += 'Strong Positive Momentum';
//         } else if (lastROC < -5) {
//             signal = 'bearish';
//             text += 'Strong Negative Momentum';
//         } else {
//             text += 'Weak Momentum';
//         }
        
//         const signalBox = document.getElementById('rocSignal');
//         signalBox.className = `signal-box ${signal}`;
//         signalBox.textContent = text;
//     },
    
//     // ============================================
//     // ✅ AROON INDICATOR
//     // ============================================
    
//     updateAroonChart() {
//         const prices = this.stockData.prices;
//         const aroon = this.calculateAroon(prices);
        
//         if (this.charts.aroon) {
//             this.charts.aroon.series[0].setData(aroon.up, false);
//             this.charts.aroon.series[1].setData(aroon.down, false);
//             this.charts.aroon.redraw();
//         } else {
//             this.charts.aroon = Highcharts.chart('aroonChart', {
//                 chart: { borderRadius: 15, height: 400 },
//                 title: {
//                     text: 'Aroon Indicator',
//                     style: { color: this.colors.primary, fontWeight: 'bold' }
//                 },
//                 xAxis: { type: 'datetime', crosshair: true },
//                 yAxis: {
//                     title: { text: 'Aroon' },
//                     plotLines: [{
//                         value: 50,
//                         color: '#999',
//                         dashStyle: 'Dot',
//                         width: 1
//                     }],
//                     min: 0,
//                     max: 100
//                 },
//                 tooltip: { borderRadius: 10, shared: true, valueDecimals: 2 },
//                 series: [
//                     {
//                         type: 'line',
//                         name: 'Aroon Up',
//                         data: aroon.up,
//                         color: this.colors.success,
//                         lineWidth: 2
//                     },
//                     {
//                         type: 'line',
//                         name: 'Aroon Down',
//                         data: aroon.down,
//                         color: this.colors.danger,
//                         lineWidth: 2
//                     }
//                 ],
//                 credits: { enabled: false }
//             });
//         }
        
//         this.displayAroonSignal(aroon);
//     },
    
//     calculateAroon(prices, period = 25) {
//         const up = [];
//         const down = [];
        
//         for (let i = period; i < prices.length; i++) {
//             const slice = prices.slice(i - period, i + 1);
            
//             let highestIndex = 0;
//             let lowestIndex = 0;
//             let highest = slice[0].high;
//             let lowest = slice[0].low;
            
//             for (let j = 1; j < slice.length; j++) {
//                 if (slice[j].high > highest) {
//                     highest = slice[j].high;
//                     highestIndex = j;
//                 }
//                 if (slice[j].low < lowest) {
//                     lowest = slice[j].low;
//                     lowestIndex = j;
//                 }
//             }
            
//             const daysSinceHigh = period - highestIndex;
//             const daysSinceLow = period - lowestIndex;
            
//             const aroonUp = ((period - daysSinceHigh) / period) * 100;
//             const aroonDown = ((period - daysSinceLow) / period) * 100;
            
//             up.push([prices[i].timestamp, aroonUp]);
//             down.push([prices[i].timestamp, aroonDown]);
//         }
        
//         return { up, down };
//     },
    
//     displayAroonSignal(aroon) {
//         if (!aroon.up.length || !aroon.down.length) {
//             document.getElementById('aroonSignal').textContent = 'Not enough data';
//             return;
//         }
        
//         const lastUp = aroon.up[aroon.up.length - 1][1];
//         const lastDown = aroon.down[aroon.down.length - 1][1];
        
//         let signal = 'neutral';
//         let text = `Up: ${lastUp.toFixed(0)}, Down: ${lastDown.toFixed(0)} - `;
        
//         if (lastUp > 70 && lastDown < 30) {
//             signal = 'bullish';
//             text += 'STRONG UPTREND - Bulls in Control';
//         } else if (lastDown > 70 && lastUp < 30) {
//             signal = 'bearish';
//             text += 'STRONG DOWNTREND - Bears in Control';
//         } else if (lastUp > lastDown) {
//             signal = 'bullish';
//             text += 'Bullish Bias';
//         } else if (lastDown > lastUp) {
//             signal = 'bearish';
//             text += 'Bearish Bias';
//         } else {
//             text += 'Consolidation';
//         }
        
//         const signalBox = document.getElementById('aroonSignal');
//         signalBox.className = `signal-box ${signal}`;
//         signalBox.textContent = text;
//     },

//     // ============================================
//     // ✅ KELTNER CHANNELS
//     // ============================================
    
//     updateKeltnerChart() {
//         const prices = this.stockData.prices;
//         const keltner = this.calculateKeltnerChannels(prices);
//         const ohlc = prices.map(p => [p.timestamp, p.open, p.high, p.low, p.close]);
        
//         if (this.charts.keltner) {
//             this.charts.keltner.series[0].setData(ohlc, false);
//             this.charts.keltner.series[1].setData(keltner.upper, false);
//             this.charts.keltner.series[2].setData(keltner.middle, false);
//             this.charts.keltner.series[3].setData(keltner.lower, false);
//             this.charts.keltner.redraw();
//         } else {
//             this.charts.keltner = Highcharts.stockChart('keltnerChart', {
//                 chart: { borderRadius: 15, height: 600 },
//                 title: {
//                     text: 'Keltner Channels (20, 2x ATR)',
//                     style: { color: this.colors.primary, fontWeight: 'bold' }
//                 },
//                 rangeSelector: { enabled: false },
//                 navigator: { enabled: true },
//                 xAxis: { type: 'datetime', crosshair: true },
//                 yAxis: { title: { text: 'Price' } },
//                 tooltip: { borderRadius: 10, shared: true },
//                 series: [
//                     {
//                         type: 'candlestick',
//                         name: this.currentSymbol,
//                         data: ohlc,
//                         color: this.colors.danger,
//                         upColor: this.colors.success,
//                         zIndex: 2
//                     },
//                     {
//                         type: 'line',
//                         name: 'Upper Channel',
//                         data: keltner.upper,
//                         color: this.colors.danger,
//                         lineWidth: 2,
//                         dashStyle: 'Dash',
//                         zIndex: 1
//                     },
//                     {
//                         type: 'line',
//                         name: 'Middle Line (EMA)',
//                         data: keltner.middle,
//                         color: this.colors.primary,
//                         lineWidth: 2,
//                         zIndex: 1
//                     },
//                     {
//                         type: 'line',
//                         name: 'Lower Channel',
//                         data: keltner.lower,
//                         color: this.colors.success,
//                         lineWidth: 2,
//                         dashStyle: 'Dash',
//                         zIndex: 1
//                     }
//                 ],
//                 credits: { enabled: false }
//             });
//         }
        
//         this.displayKeltnerSignal(keltner, prices);
//     },
    
//     calculateKeltnerChannels(prices, period = 20, atrMultiplier = 2) {
//         const closes = prices.map(p => p.close);
//         const ema = this.calculateEMA(closes, period);
//         const atr = this.calculateATR(prices, period);
        
//         const upper = [];
//         const middle = [];
//         const lower = [];
        
//         const offset = prices.length - ema.length;
//         const atrOffset = prices.length - atr.length;
        
//         for (let i = 0; i < ema.length; i++) {
//             const atrIndex = i - (offset - atrOffset);
            
//             if (atrIndex >= 0 && atrIndex < atr.length) {
//                 const timestamp = prices[offset + i].timestamp;
//                 const emaValue = ema[i];
//                 const atrValue = atr[atrIndex][1];
                
//                 upper.push([timestamp, emaValue + atrMultiplier * atrValue]);
//                 middle.push([timestamp, emaValue]);
//                 lower.push([timestamp, emaValue - atrMultiplier * atrValue]);
//             }
//         }
        
//         return { upper, middle, lower };
//     },
    
//     displayKeltnerSignal(keltner, prices) {
//         if (!keltner.upper.length) {
//             document.getElementById('keltnerSignal').textContent = 'Not enough data';
//             return;
//         }
        
//         const lastPrice = prices[prices.length - 1].close;
//         const lastUpper = keltner.upper[keltner.upper.length - 1][1];
//         const lastMiddle = keltner.middle[keltner.middle.length - 1][1];
//         const lastLower = keltner.lower[keltner.lower.length - 1][1];
        
//         let signal = 'neutral';
//         let text = `Price: ${this.formatCurrency(lastPrice)} - `;
        
//         if (lastPrice > lastUpper) {
//             signal = 'bearish';
//             text += 'ABOVE UPPER CHANNEL - Overbought, Strong Uptrend';
//         } else if (lastPrice < lastLower) {
//             signal = 'bullish';
//             text += 'BELOW LOWER CHANNEL - Oversold, Strong Downtrend';
//         } else if (lastPrice > lastMiddle) {
//             signal = 'bullish';
//             text += 'Above Middle Line - Bullish Bias';
//         } else {
//             signal = 'bearish';
//             text += 'Below Middle Line - Bearish Bias';
//         }
        
//         const signalBox = document.getElementById('keltnerSignal');
//         signalBox.className = `signal-box ${signal}`;
//         signalBox.textContent = text;
//     },
    
//     // ============================================
//     // ✅ DONCHIAN CHANNELS
//     // ============================================
    
//     updateDonchianChart() {
//         const prices = this.stockData.prices;
//         const donchian = this.calculateDonchianChannels(prices);
//         const ohlc = prices.map(p => [p.timestamp, p.open, p.high, p.low, p.close]);
        
//         if (this.charts.donchian) {
//             this.charts.donchian.series[0].setData(ohlc, false);
//             this.charts.donchian.series[1].setData(donchian.upper, false);
//             this.charts.donchian.series[2].setData(donchian.middle, false);
//             this.charts.donchian.series[3].setData(donchian.lower, false);
//             this.charts.donchian.redraw();
//         } else {
//             this.charts.donchian = Highcharts.stockChart('donchianChart', {
//                 chart: { borderRadius: 15, height: 600 },
//                 title: {
//                     text: 'Donchian Channels (20 periods)',
//                     style: { color: this.colors.primary, fontWeight: 'bold' }
//                 },
//                 rangeSelector: { enabled: false },
//                 navigator: { enabled: true },
//                 xAxis: { type: 'datetime', crosshair: true },
//                 yAxis: { title: { text: 'Price' } },
//                 tooltip: { borderRadius: 10, shared: true },
//                 series: [
//                     {
//                         type: 'candlestick',
//                         name: this.currentSymbol,
//                         data: ohlc,
//                         color: this.colors.danger,
//                         upColor: this.colors.success,
//                         zIndex: 2
//                     },
//                     {
//                         type: 'line',
//                         name: 'Upper Channel (Highest High)',
//                         data: donchian.upper,
//                         color: this.colors.danger,
//                         lineWidth: 2,
//                         dashStyle: 'Dash',
//                         zIndex: 1
//                     },
//                     {
//                         type: 'line',
//                         name: 'Middle Line',
//                         data: donchian.middle,
//                         color: this.colors.primary,
//                         lineWidth: 2,
//                         dashStyle: 'Dot',
//                         zIndex: 1
//                     },
//                     {
//                         type: 'line',
//                         name: 'Lower Channel (Lowest Low)',
//                         data: donchian.lower,
//                         color: this.colors.success,
//                         lineWidth: 2,
//                         dashStyle: 'Dash',
//                         zIndex: 1
//                     }
//                 ],
//                 credits: { enabled: false }
//             });
//         }
        
//         this.displayDonchianSignal(donchian, prices);
//     },
    
//     calculateDonchianChannels(prices, period = 20) {
//         const upper = [];
//         const middle = [];
//         const lower = [];
        
//         for (let i = period - 1; i < prices.length; i++) {
//             const slice = prices.slice(i - period + 1, i + 1);
            
//             const highest = Math.max(...slice.map(p => p.high));
//             const lowest = Math.min(...slice.map(p => p.low));
//             const mid = (highest + lowest) / 2;
            
//             const timestamp = prices[i].timestamp;
            
//             upper.push([timestamp, highest]);
//             middle.push([timestamp, mid]);
//             lower.push([timestamp, lowest]);
//         }
        
//         return { upper, middle, lower };
//     },
    
//     displayDonchianSignal(donchian, prices) {
//         if (!donchian.upper.length) {
//             document.getElementById('donchianSignal').textContent = 'Not enough data';
//             return;
//         }
        
//         const lastPrice = prices[prices.length - 1].close;
//         const lastUpper = donchian.upper[donchian.upper.length - 1][1];
//         const lastMiddle = donchian.middle[donchian.middle.length - 1][1];
//         const lastLower = donchian.lower[donchian.lower.length - 1][1];
        
//         let signal = 'neutral';
//         let text = `Price: ${this.formatCurrency(lastPrice)} - `;
        
//         if (lastPrice >= lastUpper) {
//             signal = 'bullish';
//             text += 'BREAKOUT ABOVE - New 20-Period High (Strong Buy)';
//         } else if (lastPrice <= lastLower) {
//             signal = 'bearish';
//             text += 'BREAKDOWN BELOW - New 20-Period Low (Strong Sell)';
//         } else if (lastPrice > lastMiddle) {
//             signal = 'bullish';
//             text += 'Above Midpoint - Bullish Zone';
//         } else {
//             signal = 'bearish';
//             text += 'Below Midpoint - Bearish Zone';
//         }
        
//         const signalBox = document.getElementById('donchianSignal');
//         signalBox.className = `signal-box ${signal}`;
//         signalBox.textContent = text;
//     },
    
//     // ============================================
//     // ✅ CMF (Chaikin Money Flow)
//     // ============================================
    
//     updateCMFChart() {
//         const prices = this.stockData.prices;
//         const cmf = this.calculateCMF(prices);
        
//         if (this.charts.cmf) {
//             this.charts.cmf.series[0].setData(cmf, true);
//         } else {
//             this.charts.cmf = Highcharts.chart('cmfChart', {
//                 chart: { borderRadius: 15, height: 400 },
//                 title: {
//                     text: 'CMF - Chaikin Money Flow',
//                     style: { color: this.colors.primary, fontWeight: 'bold' }
//                 },
//                 xAxis: { type: 'datetime', crosshair: true },
//                 yAxis: {
//                     title: { text: 'CMF' },
//                     plotLines: [
//                         {
//                             value: 0,
//                             color: '#999',
//                             dashStyle: 'Dash',
//                             width: 2
//                         },
//                         {
//                             value: 0.05,
//                             color: this.colors.success,
//                             dashStyle: 'Dot',
//                             width: 1,
//                             label: { text: 'Bullish (+0.05)', align: 'right' }
//                         },
//                         {
//                             value: -0.05,
//                             color: this.colors.danger,
//                             dashStyle: 'Dot',
//                             width: 1,
//                             label: { text: 'Bearish (-0.05)', align: 'right' }
//                         }
//                     ]
//                 },
//                 tooltip: { borderRadius: 10, valueDecimals: 4 },
//                 series: [
//                     {
//                         type: 'area',
//                         name: 'CMF',
//                         data: cmf,
//                         color: this.colors.cyan,
//                         negativeColor: this.colors.danger,
//                         fillOpacity: 0.3,
//                         lineWidth: 2
//                     }
//                 ],
//                 credits: { enabled: false }
//             });
//         }
        
//         this.displayCMFSignal(cmf);
//     },
    
//     calculateCMF(prices, period = 20) {
//         const cmf = [];
//         const moneyFlowMultiplier = [];
//         const moneyFlowVolume = [];
        
//         for (let i = 0; i < prices.length; i++) {
//             const high = prices[i].high;
//             const low = prices[i].low;
//             const close = prices[i].close;
//             const volume = prices[i].volume;
            
//             const mfm = high === low ? 0 : ((close - low) - (high - close)) / (high - low);
//             const mfv = mfm * volume;
            
//             moneyFlowMultiplier.push(mfm);
//             moneyFlowVolume.push(mfv);
//         }
        
//         for (let i = period - 1; i < prices.length; i++) {
//             const sumMFV = this.sumArray(moneyFlowVolume, i - period + 1, i + 1);
//             const sumVolume = prices.slice(i - period + 1, i + 1).reduce((sum, p) => sum + p.volume, 0);
            
//             const cmfValue = sumVolume === 0 ? 0 : sumMFV / sumVolume;
            
//             cmf.push([prices[i].timestamp, cmfValue]);
//         }
        
//         return cmf;
//     },
    
//     displayCMFSignal(cmf) {
//         if (!cmf.length) {
//             document.getElementById('cmfSignal').textContent = 'Not enough data';
//             return;
//         }
        
//         const lastCMF = cmf[cmf.length - 1][1];
        
//         let signal = 'neutral';
//         let text = `CMF: ${lastCMF.toFixed(4)} - `;
        
//         if (lastCMF > 0.05) {
//             signal = 'bullish';
//             text += 'STRONG BUYING PRESSURE - Accumulation Phase';
//         } else if (lastCMF < -0.05) {
//             signal = 'bearish';
//             text += 'STRONG SELLING PRESSURE - Distribution Phase';
//         } else if (lastCMF > 0) {
//             signal = 'bullish';
//             text += 'Weak Buying Pressure';
//         } else if (lastCMF < 0) {
//             signal = 'bearish';
//             text += 'Weak Selling Pressure';
//         } else {
//             text += 'Neutral Money Flow';
//         }
        
//         const signalBox = document.getElementById('cmfSignal');
//         signalBox.className = `signal-box ${signal}`;
//         signalBox.textContent = text;
//     },
    
//     // ============================================
//     // ✅ ELDER RAY INDEX (Bull Power / Bear Power)
//     // ============================================
    
//     updateElderRayChart() {
//         const prices = this.stockData.prices;
//         const elderRay = this.calculateElderRay(prices);
        
//         if (this.charts.elderRay) {
//             this.charts.elderRay.series[0].setData(elderRay.bullPower, false);
//             this.charts.elderRay.series[1].setData(elderRay.bearPower, false);
//             this.charts.elderRay.redraw();
//         } else {
//             this.charts.elderRay = Highcharts.chart('elderRayChart', {
//                 chart: { borderRadius: 15, height: 400 },
//                 title: {
//                     text: 'Elder Ray Index - Bull & Bear Power',
//                     style: { color: this.colors.primary, fontWeight: 'bold' }
//                 },
//                 xAxis: { type: 'datetime', crosshair: true },
//                 yAxis: {
//                     title: { text: 'Power' },
//                     plotLines: [{
//                         value: 0,
//                         color: '#999',
//                         dashStyle: 'Dash',
//                         width: 2
//                     }]
//                 },
//                 tooltip: { borderRadius: 10, shared: true, valueDecimals: 2 },
//                 series: [
//                     {
//                         type: 'column',
//                         name: 'Bull Power',
//                         data: elderRay.bullPower,
//                         color: this.colors.success,
//                         zIndex: 1
//                     },
//                     {
//                         type: 'column',
//                         name: 'Bear Power',
//                         data: elderRay.bearPower,
//                         color: this.colors.danger,
//                         zIndex: 1
//                     }
//                 ],
//                 credits: { enabled: false }
//             });
//         }
        
//         this.displayElderRaySignal(elderRay);
//     },
    
//     calculateElderRay(prices, period = 13) {
//         const closes = prices.map(p => p.close);
//         const ema = this.calculateEMA(closes, period);
        
//         const bullPower = [];
//         const bearPower = [];
        
//         const offset = prices.length - ema.length;
        
//         for (let i = 0; i < ema.length; i++) {
//             const priceIndex = offset + i;
//             const timestamp = prices[priceIndex].timestamp;
//             const high = prices[priceIndex].high;
//             const low = prices[priceIndex].low;
//             const emaValue = ema[i];
            
//             bullPower.push([timestamp, high - emaValue]);
//             bearPower.push([timestamp, low - emaValue]);
//         }
        
//         return { bullPower, bearPower };
//     },
    
//     displayElderRaySignal(elderRay) {
//         if (!elderRay.bullPower.length || !elderRay.bearPower.length) {
//             document.getElementById('elderRaySignal').textContent = 'Not enough data';
//             return;
//         }
        
//         const lastBull = elderRay.bullPower[elderRay.bullPower.length - 1][1];
//         const lastBear = elderRay.bearPower[elderRay.bearPower.length - 1][1];
        
//         let signal = 'neutral';
//         let text = `Bull: ${lastBull.toFixed(2)}, Bear: ${lastBear.toFixed(2)} - `;
        
//         if (lastBull > 0 && lastBear > 0) {
//             signal = 'bullish';
//             text += 'STRONG BULLS - Both Powers Positive (Buy)';
//         } else if (lastBull < 0 && lastBear < 0) {
//             signal = 'bearish';
//             text += 'STRONG BEARS - Both Powers Negative (Sell)';
//         } else if (lastBull > 0 && lastBear < 0) {
//             signal = 'neutral';
//             text += 'Consolidation - Mixed Signals';
//         } else if (lastBull > lastBear) {
//             signal = 'bullish';
//             text += 'Bulls Gaining Strength';
//         } else {
//             signal = 'bearish';
//             text += 'Bears Gaining Strength';
//         }
        
//         const signalBox = document.getElementById('elderRaySignal');
//         signalBox.className = `signal-box ${signal}`;
//         signalBox.textContent = text;
//     },
    
//     // ============================================
//     // ✅ VOLUME PROFILE
//     // ============================================
    
//     updateVolumeProfileChart() {
//         const prices = this.stockData.prices;
//         const volumeProfile = this.calculateVolumeProfile(prices);
        
//         if (this.charts.volumeProfile) {
//             this.charts.volumeProfile.series[0].setData(volumeProfile.profile, true);
//         } else {
//             this.charts.volumeProfile = Highcharts.chart('volumeProfileChart', {
//                 chart: { 
//                     borderRadius: 15, 
//                     height: 500,
//                     type: 'bar'
//                 },
//                 title: {
//                     text: 'Volume Profile - Price Distribution',
//                     style: { color: this.colors.primary, fontWeight: 'bold' }
//                 },
//                 xAxis: {
//                     title: { text: 'Volume' },
//                     reversed: false
//                 },
//                 yAxis: {
//                     title: { text: 'Price Level' },
//                     plotLines: [{
//                         value: volumeProfile.poc,
//                         color: this.colors.danger,
//                         dashStyle: 'Dash',
//                         width: 3,
//                         label: { 
//                             text: `POC: ${this.formatCurrency(volumeProfile.poc)}`,
//                             style: { color: this.colors.danger, fontWeight: 'bold' }
//                         },
//                         zIndex: 5
//                     }]
//                 },
//                 tooltip: { 
//                     borderRadius: 10,
//                     formatter: function() {
//                         return `<b>Price: ${AdvancedAnalysis.formatCurrency(this.y)}</b><br>` +
//                                `Volume: ${this.x.toLocaleString()}`;
//                     }
//                 },
//                 legend: { enabled: false },
//                 series: [{
//                     name: 'Volume Profile',
//                     data: volumeProfile.profile,
//                     color: {
//                         linearGradient: { x1: 0, y1: 0, x2: 1, y2: 0 },
//                         stops: [
//                             [0, this.colors.secondary],
//                             [1, this.colors.purple]
//                         ]
//                     }
//                 }],
//                 credits: { enabled: false }
//             });
//         }
        
//         this.displayVolumeProfileSignal(volumeProfile, prices);
//     },
    
//     calculateVolumeProfile(prices, bins = 30) {
//         const priceRange = Math.max(...prices.map(p => p.high)) - Math.min(...prices.map(p => p.low));
//         const binSize = priceRange / bins;
//         const minPrice = Math.min(...prices.map(p => p.low));
        
//         const volumeByPrice = new Array(bins).fill(0);
//         const priceLevels = [];
        
//         for (let i = 0; i < bins; i++) {
//             priceLevels.push(minPrice + (i + 0.5) * binSize);
//         }
        
//         prices.forEach(p => {
//             const typical = (p.high + p.low + p.close) / 3;
//             const binIndex = Math.min(Math.floor((typical - minPrice) / binSize), bins - 1);
//             if (binIndex >= 0 && binIndex < bins) {
//                 volumeByPrice[binIndex] += p.volume;
//             }
//         });
        
//         const profile = priceLevels.map((price, i) => [volumeByPrice[i], price]);
        
//         const maxVolumeIndex = volumeByPrice.indexOf(Math.max(...volumeByPrice));
//         const poc = priceLevels[maxVolumeIndex];
        
//         const totalVolume = volumeByPrice.reduce((a, b) => a + b, 0);
//         let cumulativeVolume = 0;
//         let valueAreaHigh = poc;
//         let valueAreaLow = poc;
        
//         const sortedIndices = volumeByPrice
//             .map((vol, idx) => ({ vol, idx }))
//             .sort((a, b) => b.vol - a.vol);
        
//         for (let i = 0; i < sortedIndices.length && cumulativeVolume < totalVolume * 0.7; i++) {
//             const idx = sortedIndices[i].idx;
//             cumulativeVolume += sortedIndices[i].vol;
//             valueAreaHigh = Math.max(valueAreaHigh, priceLevels[idx]);
//             valueAreaLow = Math.min(valueAreaLow, priceLevels[idx]);
//         }
        
//         return { profile, poc, valueAreaHigh, valueAreaLow };
//     },
    
//     displayVolumeProfileSignal(volumeProfile, prices) {
//         const lastPrice = prices[prices.length - 1].close;
//         const poc = volumeProfile.poc;
//         const vah = volumeProfile.valueAreaHigh;
//         const val = volumeProfile.valueAreaLow;
        
//         let signal = 'neutral';
//         let text = `POC: ${this.formatCurrency(poc)} | VA: ${this.formatCurrency(val)} - ${this.formatCurrency(vah)} | `;
        
//         if (lastPrice > vah) {
//             signal = 'bullish';
//             text += 'Price ABOVE Value Area - Strong Bullish';
//         } else if (lastPrice < val) {
//             signal = 'bearish';
//             text += 'Price BELOW Value Area - Strong Bearish';
//         } else if (Math.abs(lastPrice - poc) / poc < 0.01) {
//             signal = 'neutral';
//             text += 'Price AT POC - High Liquidity Zone';
//         } else if (lastPrice > poc) {
//             signal = 'bullish';
//             text += 'Price in Upper Value Area - Bullish';
//         } else {
//             signal = 'bearish';
//             text += 'Price in Lower Value Area - Bearish';
//         }
        
//         const signalBox = document.getElementById('volumeProfileSignal');
//         signalBox.className = `signal-box ${signal}`;
//         signalBox.textContent = text;
//     },
    
//     // ============================================
//     // ✅ MOVING AVERAGES (Multiple)
//     // ============================================
    
//     updateMovingAveragesChart() {
//         const prices = this.stockData.prices;
//         const mas = this.calculateMultipleMovingAverages(prices);
//         const ohlc = prices.map(p => [p.timestamp, p.open, p.high, p.low, p.close]);
        
//         if (this.charts.movingAverages) {
//             this.charts.movingAverages.series[0].setData(ohlc, false);
//             this.charts.movingAverages.series[1].setData(mas.sma20, false);
//             this.charts.movingAverages.series[2].setData(mas.sma50, false);
//             this.charts.movingAverages.series[3].setData(mas.sma200, false);
//             this.charts.movingAverages.series[4].setData(mas.ema9, false);
//             this.charts.movingAverages.series[5].setData(mas.ema21, false);
//             this.charts.movingAverages.redraw();
//         } else {
//             this.charts.movingAverages = Highcharts.stockChart('movingAveragesChart', {
//                 chart: { borderRadius: 15, height: 600 },
//                 title: {
//                     text: 'Moving Averages - Multiple Timeframes',
//                     style: { color: this.colors.primary, fontWeight: 'bold' }
//                 },
//                 rangeSelector: { enabled: false },
//                 navigator: { enabled: true },
//                 xAxis: { type: 'datetime', crosshair: true },
//                 yAxis: { title: { text: 'Price' } },
//                 tooltip: { borderRadius: 10, shared: true },
//                 series: [
//                     {
//                         type: 'candlestick',
//                         name: this.currentSymbol,
//                         data: ohlc,
//                         color: this.colors.danger,
//                         upColor: this.colors.success,
//                         zIndex: 2
//                     },
//                     {
//                         type: 'line',
//                         name: 'SMA 20',
//                         data: mas.sma20,
//                         color: this.colors.primary,
//                         lineWidth: 2,
//                         zIndex: 1
//                     },
//                     {
//                         type: 'line',
//                         name: 'SMA 50',
//                         data: mas.sma50,
//                         color: this.colors.orange,
//                         lineWidth: 2,
//                         zIndex: 1
//                     },
//                     {
//                         type: 'line',
//                         name: 'SMA 200',
//                         data: mas.sma200,
//                         color: this.colors.danger,
//                         lineWidth: 3,
//                         dashStyle: 'Dash',
//                         zIndex: 1
//                     },
//                     {
//                         type: 'line',
//                         name: 'EMA 9',
//                         data: mas.ema9,
//                         color: this.colors.cyan,
//                         lineWidth: 1,
//                         dashStyle: 'Dot',
//                         zIndex: 1
//                     },
//                     {
//                         type: 'line',
//                         name: 'EMA 21',
//                         data: mas.ema21,
//                         color: this.colors.teal,
//                         lineWidth: 2,
//                         dashStyle: 'Dot',
//                         zIndex: 1
//                     }
//                 ],
//                 credits: { enabled: false }
//             });
//         }
        
//         this.displayMovingAveragesSignal(mas, prices);
//     },
    
//     calculateMultipleMovingAverages(prices) {
//         const closes = prices.map(p => p.close);
        
//         const sma20Data = this.calculateSMA(closes, 20);
//         const sma50Data = this.calculateSMA(closes, 50);
//         const sma200Data = this.calculateSMA(closes, 200);
//         const ema9Data = this.calculateEMA(closes, 9);
//         const ema21Data = this.calculateEMA(closes, 21);
        
//         const sma20 = sma20Data.map((val, i) => [prices[i + 19].timestamp, val]);
//         const sma50 = sma50Data.map((val, i) => [prices[i + 49].timestamp, val]);
//         const sma200 = sma200Data.map((val, i) => [prices[i + 199].timestamp, val]);
        
//         const ema9Offset = prices.length - ema9Data.length;
//         const ema21Offset = prices.length - ema21Data.length;
        
//         const ema9 = ema9Data.map((val, i) => [prices[ema9Offset + i].timestamp, val]);
//         const ema21 = ema21Data.map((val, i) => [prices[ema21Offset + i].timestamp, val]);
        
//         return { sma20, sma50, sma200, ema9, ema21 };
//     },
    
//     calculateSMA(data, period) {
//         const sma = [];
        
//         for (let i = period - 1; i < data.length; i++) {
//             const slice = data.slice(i - period + 1, i + 1);
//             const avg = slice.reduce((a, b) => a + b, 0) / period;
//             sma.push(avg);
//         }
        
//         return sma;
//     },
    
//     displayMovingAveragesSignal(mas, prices) {
//         if (!mas.sma20.length || !mas.sma50.length) {
//             document.getElementById('movingAveragesSignal').textContent = 'Not enough data';
//             return;
//         }
        
//         const lastPrice = prices[prices.length - 1].close;
//         const lastSMA20 = mas.sma20[mas.sma20.length - 1][1];
//         const lastSMA50 = mas.sma50[mas.sma50.length - 1][1];
//         const lastSMA200 = mas.sma200.length > 0 ? mas.sma200[mas.sma200.length - 1][1] : null;
        
//         let signal = 'neutral';
//         let text = '';
        
//         const goldenCross = lastSMA50 > lastSMA200 && mas.sma50[mas.sma50.length - 2][1] <= (mas.sma200[mas.sma200.length - 2]?.[1] || Infinity);
//         const deathCross = lastSMA50 < lastSMA200 && mas.sma50[mas.sma50.length - 2][1] >= (mas.sma200[mas.sma200.length - 2]?.[1] || 0);
        
//         if (goldenCross) {
//             signal = 'bullish';
//             text = '🌟 GOLDEN CROSS - SMA50 crossed above SMA200 (Major Buy Signal)';
//         } else if (deathCross) {
//             signal = 'bearish';
//             text = '☠ DEATH CROSS - SMA50 crossed below SMA200 (Major Sell Signal)';
//         } else if (lastPrice > lastSMA20 && lastPrice > lastSMA50 && lastSMA20 > lastSMA50) {
//             signal = 'bullish';
//             text = 'STRONG UPTREND - Price above all MAs, aligned bullish';
//         } else if (lastPrice < lastSMA20 && lastPrice < lastSMA50 && lastSMA20 < lastSMA50) {
//             signal = 'bearish';
//             text = 'STRONG DOWNTREND - Price below all MAs, aligned bearish';
//         } else if (lastPrice > lastSMA20) {
//             signal = 'bullish';
//             text = 'Short-term bullish - Price above SMA20';
//         } else {
//             signal = 'bearish';
//             text = 'Short-term bearish - Price below SMA20';
//         }
        
//         const signalBox = document.getElementById('movingAveragesSignal');
//         signalBox.className = `signal-box ${signal}`;
//         signalBox.textContent = text;
//     },
    
//     // ============================================
//     // ✅ LINEAR REGRESSION CHANNEL
//     // ============================================
    
//     updateLinearRegressionChart() {
//         const prices = this.stockData.prices;
//         const regression = this.calculateLinearRegression(prices);
//         const ohlc = prices.map(p => [p.timestamp, p.open, p.high, p.low, p.close]);
        
//         if (this.charts.linearRegression) {
//             this.charts.linearRegression.series[0].setData(ohlc, false);
//             this.charts.linearRegression.series[1].setData(regression.upper, false);
//             this.charts.linearRegression.series[2].setData(regression.middle, false);
//             this.charts.linearRegression.series[3].setData(regression.lower, false);
//             this.charts.linearRegression.redraw();
//         } else {
//             this.charts.linearRegression = Highcharts.stockChart('linearRegressionChart', {
//                 chart: { borderRadius: 15, height: 600 },
//                 title: {
//                     text: 'Linear Regression Channel',
//                     style: { color: this.colors.primary, fontWeight: 'bold' }
//                 },
//                 rangeSelector: { enabled: false },
//                 navigator: { enabled: true },
//                 xAxis: { type: 'datetime', crosshair: true },
//                 yAxis: { title: { text: 'Price' } },
//                 tooltip: { borderRadius: 10, shared: true },
//                 series: [
//                     {
//                         type: 'candlestick',
//                         name: this.currentSymbol,
//                         data: ohlc,
//                         color: this.colors.danger,
//                         upColor: this.colors.success,
//                         zIndex: 2
//                     },
//                     {
//                         type: 'line',
//                         name: 'Upper Channel',
//                         data: regression.upper,
//                         color: this.colors.danger,
//                         lineWidth: 2,
//                         dashStyle: 'Dash',
//                         zIndex: 1
//                     },
//                     {
//                         type: 'line',
//                         name: 'Regression Line',
//                         data: regression.middle,
//                         color: this.colors.primary,
//                         lineWidth: 3,
//                         zIndex: 1
//                     },
//                     {
//                         type: 'line',
//                         name: 'Lower Channel',
//                         data: regression.lower,
//                         color: this.colors.success,
//                         lineWidth: 2,
//                         dashStyle: 'Dash',
//                         zIndex: 1
//                     }
//                 ],
//                 credits: { enabled: false }
//             });
//         }
        
//         this.displayLinearRegressionSignal(regression, prices);
//     },
    
//     calculateLinearRegression(prices, period = 100) {
//         const closes = prices.map(p => p.close);
//         const n = Math.min(period, closes.length);
//         const recentPrices = closes.slice(-n);
        
//         let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
        
//         for (let i = 0; i < n; i++) {
//             sumX += i;
//             sumY += recentPrices[i];
//             sumXY += i * recentPrices[i];
//             sumX2 += i * i;
//         }
        
//         const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
//         const intercept = (sumY - slope * sumX) / n;
        
//         const regressionLine = [];
//         const deviations = [];
        
//         for (let i = 0; i < n; i++) {
//             const regValue = slope * i + intercept;
//             regressionLine.push(regValue);
//             deviations.push(Math.abs(recentPrices[i] - regValue));
//         }
        
//         const avgDeviation = deviations.reduce((a, b) => a + b, 0) / n;
//         const stdDev = Math.sqrt(deviations.reduce((sum, dev) => sum + Math.pow(dev - avgDeviation, 2), 0) / n);
        
//         const upper = [];
//         const middle = [];
//         const lower = [];
        
//         const startIndex = prices.length - n;
        
//         for (let i = 0; i < n; i++) {
//             const timestamp = prices[startIndex + i].timestamp;
//             const regValue = regressionLine[i];
            
//             upper.push([timestamp, regValue + 2 * stdDev]);
//             middle.push([timestamp, regValue]);
//             lower.push([timestamp, regValue - 2 * stdDev]);
//         }
        
//         return { upper, middle, lower, slope };
//     },
    
//     displayLinearRegressionSignal(regression, prices) {
//         if (!regression.middle.length) {
//             document.getElementById('linearRegressionSignal').textContent = 'Not enough data';
//             return;
//         }
        
//         const lastPrice = prices[prices.length - 1].close;
//         const lastMiddle = regression.middle[regression.middle.length - 1][1];
//         const lastUpper = regression.upper[regression.upper.length - 1][1];
//         const lastLower = regression.lower[regression.lower.length - 1][1];
//         const slope = regression.slope;
        
//         let signal = 'neutral';
//         let text = '';
        
//         const trendText = slope > 0 ? 'UPTREND' : slope < 0 ? 'DOWNTREND' : 'SIDEWAYS';
//         const trendStrength = Math.abs(slope) > 1 ? 'Strong' : Math.abs(slope) > 0.3 ? 'Moderate' : 'Weak';
        
//         text = `${trendStrength} ${trendText} (Slope: ${slope.toFixed(4)}) | `;
        
//         if (lastPrice > lastUpper) {
//             signal = slope > 0 ? 'bullish' : 'bearish';
//             text += 'Price ABOVE Upper Channel - Overbought';
//         } else if (lastPrice < lastLower) {
//             signal = slope > 0 ? 'bullish' : 'bearish';
//             text += 'Price BELOW Lower Channel - Oversold';
//         } else if (lastPrice > lastMiddle) {
//             signal = 'bullish';
//             text += 'Above Regression Line - Bullish Bias';
//         } else {
//             signal = 'bearish';
//             text += 'Below Regression Line - Bearish Bias';
//         }
        
//         const signalBox = document.getElementById('linearRegressionSignal');
//         signalBox.className = `signal-box ${signal}`;
//         signalBox.textContent = text;
//     },
    
//     // ============================================
//     // ✅ CANDLESTICK PATTERN DETECTION
//     // ============================================
    
//     detectCandlestickPatterns() {
//         const prices = this.stockData.prices;
//         const patterns = this.findCandlestickPatterns(prices);
        
//         this.displayCandlestickPatterns(patterns);
//     },
    
//     findCandlestickPatterns(prices) {
//         const detected = [];
        
//         for (let i = 2; i < prices.length; i++) {
//             const current = prices[i];
//             const prev = prices[i - 1];
//             const prev2 = prices[i - 2];
            
//             const currentBody = Math.abs(current.close - current.open);
//             const prevBody = Math.abs(prev.close - prev.open);
            
//             const currentRange = current.high - current.low;
//             const prevRange = prev.high - prev.low;
            
//             // Doji
//             if (currentBody / currentRange < 0.1) {
//                 detected.push({ pattern: 'Doji', signal: 'neutral', strength: 'medium', index: i });
//             }
            
//             // Hammer / Hanging Man
//             const lowerShadow = Math.min(current.open, current.close) - current.low;
//             const upperShadow = current.high - Math.max(current.open, current.close);
            
//             if (lowerShadow > currentBody * 2 && upperShadow < currentBody * 0.5) {
//                 if (prev.close < prev.open) {
//                     detected.push({ pattern: 'Hammer', signal: 'bullish', strength: 'strong', index: i });
//                 } else {
//                     detected.push({ pattern: 'Hanging Man', signal: 'bearish', strength: 'medium', index: i });
//                 }
//             }
            
//             // Inverted Hammer / Shooting Star
//             if (upperShadow > currentBody * 2 && lowerShadow < currentBody * 0.5) {
//                 if (prev.close < prev.open) {
//                     detected.push({ pattern: 'Inverted Hammer', signal: 'bullish', strength: 'medium', index: i });
//                 } else {
//                     detected.push({ pattern: 'Shooting Star', signal: 'bearish', strength: 'strong', index: i });
//                 }
//             }
            
//             // Engulfing
//             if (current.close > current.open && prev.close < prev.open &&
//                 current.open < prev.close && current.close > prev.open) {
//                 detected.push({ pattern: 'Bullish Engulfing', signal: 'bullish', strength: 'strong', index: i });
//             }
            
//             if (current.close < current.open && prev.close > prev.open &&
//                 current.open > prev.close && current.close < prev.open) {
//                 detected.push({ pattern: 'Bearish Engulfing', signal: 'bearish', strength: 'strong', index: i });
//             }
            
//             // Morning Star / Evening Star
//             if (i >= 2) {
//                 const isMorningStar = prev2.close < prev2.open && 
//                                       prevBody < currentBody * 0.5 && 
//                                       current.close > current.open &&
//                                       current.close > (prev2.open + prev2.close) / 2;
                
//                 if (isMorningStar) {
//                     detected.push({ pattern: 'Morning Star', signal: 'bullish', strength: 'very strong', index: i });
//                 }
                
//                 const isEveningStar = prev2.close > prev2.open && 
//                                       prevBody < currentBody * 0.5 && 
//                                       current.close < current.open &&
//                                       current.close < (prev2.open + prev2.close) / 2;
                
//                 if (isEveningStar) {
//                     detected.push({ pattern: 'Evening Star', signal: 'bearish', strength: 'very strong', index: i });
//                 }
//             }
            
//             // Piercing Line / Dark Cloud Cover
//             if (current.close > current.open && prev.close < prev.open &&
//                 current.open < prev.low && current.close > (prev.open + prev.close) / 2 &&
//                 current.close < prev.open) {
//                 detected.push({ pattern: 'Piercing Line', signal: 'bullish', strength: 'strong', index: i });
//             }
            
//             if (current.close < current.open && prev.close > prev.open &&
//                 current.open > prev.high && current.close < (prev.open + prev.close) / 2 &&
//                 current.close > prev.open) {
//                 detected.push({ pattern: 'Dark Cloud Cover', signal: 'bearish', strength: 'strong', index: i });
//             }
//         }
        
//         return detected.slice(-10);
//     },
    
//     displayCandlestickPatterns(patterns) {
//         const container = document.getElementById('candlestickPatterns');
        
//         if (!patterns.length) {
//             container.innerHTML = '<p style="text-align: center; color: #999;">No significant patterns detected recently</p>';
//             return;
//         }
        
//         let html = '<table><thead><tr><th>Pattern</th><th>Signal</th><th>Strength</th><th>When</th></tr></thead><tbody>';
        
//         patterns.forEach(p => {
//             const signalClass = p.signal === 'bullish' ? 'bullish' : p.signal === 'bearish' ? 'bearish' : 'neutral';
//             const strengthBadge = `<span class="strength-badge ${p.strength.replace(' ', '-')}">${p.strength.toUpperCase()}</span>`;
//             const daysAgo = this.stockData.prices.length - 1 - p.index;
//             const when = daysAgo === 0 ? 'Today' : `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`;
            
//             html += `
//                 <tr>
//                     <td><strong>${p.pattern}</strong></td>
//                     <td><span class="signal-badge ${signalClass}">${p.signal.toUpperCase()}</span></td>
//                     <td>${strengthBadge}</td>
//                     <td>${when}</td>
//                 </tr>
//             `;
//         });
        
//         html += '</tbody></table>';
//         container.innerHTML = html;
//     },
    
//     // ============================================
//     // ✅ SUPPORT/RESISTANCE DETECTION
//     // ============================================
    
//     detectSupportResistance() {
//         const prices = this.stockData.prices;
//         const levels = this.findSupportResistanceLevels(prices);
        
//         this.displaySupportResistance(levels);
//     },
    
//     findSupportResistanceLevels(prices, sensitivity = 0.02) {
//         const highs = [];
//         const lows = [];
        
//         for (let i = 2; i < prices.length - 2; i++) {
//             if (prices[i].high > prices[i-1].high && prices[i].high > prices[i-2].high &&
//                 prices[i].high > prices[i+1].high && prices[i].high > prices[i+2].high) {
//                 highs.push(prices[i].high);
//             }
            
//             if (prices[i].low < prices[i-1].low && prices[i].low < prices[i-2].low &&
//                 prices[i].low < prices[i+1].low && prices[i].low < prices[i+2].low) {
//                 lows.push(prices[i].low);
//             }
//         }
        
//         const clusterLevels = (levels) => {
//             if (levels.length === 0) return [];
            
//             levels.sort((a, b) => a - b);
//             const clusters = [];
//             let currentCluster = [levels[0]];
            
//             for (let i = 1; i < levels.length; i++) {
//                 if (Math.abs(levels[i] - currentCluster[0]) / currentCluster[0] < sensitivity) {
//                     currentCluster.push(levels[i]);
//                 } else {
//                     clusters.push(currentCluster.reduce((a, b) => a + b, 0) / currentCluster.length);
//                     currentCluster = [levels[i]];
//                 }
//             }
            
//             clusters.push(currentCluster.reduce((a, b) => a + b, 0) / currentCluster.length);
//             return clusters;
//         };
        
//         const resistance = clusterLevels(highs).slice(-5);
//         const support = clusterLevels(lows).slice(-5);
        
//         return { resistance, support };
//     },
    
//     displaySupportResistance(levels) {
//         const container = document.getElementById('supportResistance');
//         const currentPrice = this.stockData.prices[this.stockData.prices.length - 1].close;
        
//         let html = '<div class="sr-grid">';
        
//         html += '<div class="sr-column"><h4>🔴 Resistance Levels</h4><ul>';
//         levels.resistance.sort((a, b) => b - a).forEach(level => {
//             const distance = ((level - currentPrice) / currentPrice) * 100;
//             html += `<li>${this.formatCurrency(level)} <span class="distance">(+${distance.toFixed(2)}%)</span></li>`;
//         });
//         html += '</ul></div>';
        
//         html += '<div class="sr-column"><h4>🟢 Support Levels</h4><ul>';
//         levels.support.sort((a, b) => b - a).forEach(level => {
//             const distance = ((currentPrice - level) / currentPrice) * 100;
//             html += `<li>${this.formatCurrency(level)} <span class="distance">(-${distance.toFixed(2)}%)</span></li>`;
//         });
//         html += '</ul></div>';
        
//         html += '</div>';
        
//         container.innerHTML = html;
//     },
    
//     // ============================================
//     // ✅ DIVERGENCE DETECTION
//     // ============================================
    
//     detectDivergences() {
//         const prices = this.stockData.prices;
//         const rsi = this.calculateRSI(prices);
//         const macd = this.calculateMACD(prices);
        
//         const divergences = this.findDivergences(prices, rsi, macd);
        
//         this.displayDivergences(divergences);
//     },
    
//     findDivergences(prices, rsi, macd) {
//         const divergences = [];
//         const lookback = 20;
        
//         if (prices.length < lookback || rsi.length < lookback) return divergences;
        
//         const recentPrices = prices.slice(-lookback);
//         const recentRSI = rsi.slice(-lookback);
        
//         for (let i = 5; i < lookback - 5; i++) {
//             const priceHigh1 = recentPrices[i].high;
//             const priceHigh2 = Math.max(...recentPrices.slice(i + 1, i + 6).map(p => p.high));
            
//             const rsiVal1 = recentRSI[i][1];
//             const rsiVal2 = Math.max(...recentRSI.slice(i + 1, i + 6).map(r => r[1]));
            
//             if (priceHigh2 > priceHigh1 && rsiVal2 < rsiVal1) {
//                 divergences.push({
//                     type: 'Bearish Divergence (RSI)',
//                     signal: 'bearish',
//                     description: 'Price making higher highs, RSI making lower highs'
//                 });
//                 break;
//             }
            
//             const priceLow1 = recentPrices[i].low;
//             const priceLow2 = Math.min(...recentPrices.slice(i + 1, i + 6).map(p => p.low));
            
//             if (priceLow2 < priceLow1 && rsiVal2 > rsiVal1) {
//                 divergences.push({
//                     type: 'Bullish Divergence (RSI)',
//                     signal: 'bullish',
//                     description: 'Price making lower lows, RSI making higher lows'
//                 });
//                 break;
//             }
//         }
        
//         return divergences;
//     },
    
//     displayDivergences(divergences) {
//         const container = document.getElementById('divergences');
        
//         if (!divergences.length) {
//             container.innerHTML = '<p style="text-align: center; color: #999;">No divergences detected recently</p>';
//             return;
//         }
        
//         let html = '<ul>';
//         divergences.forEach(div => {
//             const signalClass = div.signal === 'bullish' ? 'bullish' : 'bearish';
//             html += `
//                 <li class="divergence-item ${signalClass}">
//                     <strong>${div.type}</strong>
//                     <p>${div.description}</p>
//                 </li>
//             `;
//         });
//         html += '</ul>';
        
//         container.innerHTML = html;
//     },

//     // ============================================
//     // INDICATEURS ORIGINAUX CONSERVÉS
//     // ============================================
    
//     // ✅ ICHIMOKU CLOUD (CONSERVÉ)
//     updateIchimokuChart() {
//         const prices = this.stockData.prices;
//         const ichimoku = this.calculateIchimoku(prices);
//         const ohlc = prices.map(p => [p.timestamp, p.open, p.high, p.low, p.close]);
        
//         if (this.charts.ichimoku) {
//             this.charts.ichimoku.series[0].setData(ohlc, false);
//             this.charts.ichimoku.series[1].setData(ichimoku.tenkan, false);
//             this.charts.ichimoku.series[2].setData(ichimoku.kijun, false);
//             this.charts.ichimoku.series[3].setData(ichimoku.spanA, false);
//             this.charts.ichimoku.series[4].setData(ichimoku.spanB, false);
//             this.charts.ichimoku.series[5].setData(ichimoku.cloud, false);
//             this.charts.ichimoku.series[6].setData(ichimoku.chikou, false);
//             this.charts.ichimoku.setTitle({ text: `${this.currentSymbol} - Ichimoku Cloud` });
//             this.charts.ichimoku.redraw();
//         } else {
//             this.charts.ichimoku = Highcharts.stockChart('ichimokuChart', {
//                 chart: { height: 600, borderRadius: 15 },
//                 title: {
//                     text: `${this.currentSymbol} - Ichimoku Cloud`,
//                     style: { color: this.colors.primary, fontWeight: 'bold' }
//                 },
//                 rangeSelector: { enabled: false },
//                 navigator: { enabled: true },
//                 xAxis: { type: 'datetime', crosshair: true },
//                 yAxis: { title: { text: 'Price' }, opposite: true },
//                 tooltip: { split: false, shared: true, borderRadius: 10 },
//                 plotOptions: { series: { marker: { enabled: false } } },
//                 series: [
//                     {
//                         type: 'candlestick',
//                         name: this.currentSymbol,
//                         data: ohlc,
//                         color: this.colors.danger,
//                         upColor: this.colors.success,
//                         zIndex: 3
//                     },
//                     {
//                         type: 'line',
//                         name: 'Tenkan-sen',
//                         data: ichimoku.tenkan,
//                         color: this.colors.danger,
//                         lineWidth: 2,
//                         zIndex: 2
//                     },
//                     {
//                         type: 'line',
//                         name: 'Kijun-sen',
//                         data: ichimoku.kijun,
//                         color: this.colors.primary,
//                         lineWidth: 2,
//                         zIndex: 2
//                     },
//                     {
//                         type: 'line',
//                         name: 'Senkou Span A',
//                         data: ichimoku.spanA,
//                         color: this.colors.success,
//                         lineWidth: 1,
//                         zIndex: 1
//                     },
//                     {
//                         type: 'line',
//                         name: 'Senkou Span B',
//                         data: ichimoku.spanB,
//                         color: this.colors.danger,
//                         lineWidth: 1,
//                         zIndex: 1
//                     },
//                     {
//                         type: 'arearange',
//                         name: 'Kumo (Cloud)',
//                         data: ichimoku.cloud,
//                         fillOpacity: 0.3,
//                         lineWidth: 0,
//                         color: this.colors.success,
//                         negativeColor: this.colors.danger,
//                         zIndex: 0
//                     },
//                     {
//                         type: 'line',
//                         name: 'Chikou Span',
//                         data: ichimoku.chikou,
//                         color: this.colors.purple,
//                         lineWidth: 1,
//                         dashStyle: 'Dot',
//                         zIndex: 2
//                     }
//                 ],
//                 credits: { enabled: false }
//             });
//         }
//     },
    
//     calculateIchimoku(prices) {
//         const tenkanPeriod = 9;
//         const kijunPeriod = 26;
//         const senkouPeriod = 52;
//         const displacement = 26;
        
//         const tenkan = [];
//         const kijun = [];
//         const spanA = [];
//         const spanB = [];
//         const chikou = [];
//         const cloud = [];
        
//         for (let i = tenkanPeriod - 1; i < prices.length; i++) {
//             const slice = prices.slice(i - tenkanPeriod + 1, i + 1);
//             const high = Math.max(...slice.map(p => p.high));
//             const low = Math.min(...slice.map(p => p.low));
//             tenkan.push([prices[i].timestamp, (high + low) / 2]);
//         }
        
//         for (let i = kijunPeriod - 1; i < prices.length; i++) {
//             const slice = prices.slice(i - kijunPeriod + 1, i + 1);
//             const high = Math.max(...slice.map(p => p.high));
//             const low = Math.min(...slice.map(p => p.low));
//             kijun.push([prices[i].timestamp, (high + low) / 2]);
//         }
        
//         for (let i = 0; i < prices.length; i++) {
//             if (i < tenkanPeriod - 1 || i < kijunPeriod - 1) continue;
            
//             const tenkanValue = tenkan[i - tenkanPeriod + 1]?.[1];
//             const kijunValue = kijun[i - kijunPeriod + 1]?.[1];
            
//             if (tenkanValue && kijunValue) {
//                 const futureIndex = i + displacement;
//                 if (futureIndex < prices.length) {
//                     spanA.push([prices[futureIndex].timestamp, (tenkanValue + kijunValue) / 2]);
//                 }
//             }
//         }
        
//         for (let i = senkouPeriod - 1; i < prices.length; i++) {
//             const slice = prices.slice(i - senkouPeriod + 1, i + 1);
//             const high = Math.max(...slice.map(p => p.high));
//             const low = Math.min(...slice.map(p => p.low));
            
//             const futureIndex = i + displacement;
//             if (futureIndex < prices.length) {
//                 spanB.push([prices[futureIndex].timestamp, (high + low) / 2]);
//             }
//         }
        
//         for (let i = displacement; i < prices.length; i++) {
//             chikou.push([prices[i - displacement].timestamp, prices[i].close]);
//         }
        
//         const minLength = Math.min(spanA.length, spanB.length);
//         for (let i = 0; i < minLength; i++) {
//             cloud.push([
//                 spanA[i][0],
//                 Math.min(spanA[i][1], spanB[i][1]),
//                 Math.max(spanA[i][1], spanB[i][1])
//             ]);
//         }
        
//         return { tenkan, kijun, spanA, spanB, chikou, cloud };
//     },
    
//     // ✅ STOCHASTIC OSCILLATOR (CONSERVÉ)
//     updateStochasticChart() {
//         const prices = this.stockData.prices;
//         const stochastic = this.calculateStochastic(prices);
        
//         if (this.charts.stochastic) {
//             this.charts.stochastic.series[0].setData(stochastic.k, false);
//             this.charts.stochastic.series[1].setData(stochastic.d, false);
//             this.charts.stochastic.redraw();
//         } else {
//             this.charts.stochastic = Highcharts.chart('stochasticChart', {
//                 chart: { borderRadius: 15, height: 400 },
//                 title: {
//                     text: 'Stochastic Oscillator',
//                     style: { color: this.colors.primary, fontWeight: 'bold' }
//                 },
//                 xAxis: { type: 'datetime', crosshair: true },
//                 yAxis: {
//                     title: { text: 'Stochastic' },
//                     plotLines: [
//                         {
//                             value: 80,
//                             color: this.colors.danger,
//                             dashStyle: 'ShortDash',
//                             width: 2,
//                             label: { text: 'Overbought (80)', align: 'right', style: { color: this.colors.danger } }
//                         },
//                         {
//                             value: 20,
//                             color: this.colors.success,
//                             dashStyle: 'ShortDash',
//                             width: 2,
//                             label: { text: 'Oversold (20)', align: 'right', style: { color: this.colors.success } }
//                         }
//                     ],
//                     min: 0,
//                     max: 100
//                 },
//                 tooltip: { borderRadius: 10, shared: true },
//                 series: [
//                     {
//                         type: 'line',
//                         name: '%K (Fast)',
//                         data: stochastic.k,
//                         color: this.colors.primary,
//                         lineWidth: 2
//                     },
//                     {
//                         type: 'line',
//                         name: '%D (Slow)',
//                         data: stochastic.d,
//                         color: this.colors.danger,
//                         lineWidth: 2
//                     }
//                 ],
//                 credits: { enabled: false }
//             });
//         }
        
//         this.displayStochasticSignal(stochastic);
//     },
    
//     calculateStochastic(prices, kPeriod = 14, dPeriod = 3) {
//         const k = [];
//         const d = [];
        
//         for (let i = kPeriod - 1; i < prices.length; i++) {
//             const slice = prices.slice(i - kPeriod + 1, i + 1);
//             const high = Math.max(...slice.map(p => p.high));
//             const low = Math.min(...slice.map(p => p.low));
//             const close = prices[i].close;
            
//             const kValue = ((close - low) / (high - low)) * 100;
//             k.push([prices[i].timestamp, kValue]);
//         }
        
//         for (let i = dPeriod - 1; i < k.length; i++) {
//             const slice = k.slice(i - dPeriod + 1, i + 1);
//             const avg = slice.reduce((sum, item) => sum + item[1], 0) / dPeriod;
//             d.push([k[i][0], avg]);
//         }
        
//         return { k, d };
//     },
    
//     displayStochasticSignal(stochastic) {
//         if (!stochastic.k.length || !stochastic.d.length) {
//             document.getElementById('stochasticSignal').textContent = 'Not enough data';
//             return;
//         }
        
//         const lastK = stochastic.k[stochastic.k.length - 1][1];
//         const lastD = stochastic.d[stochastic.d.length - 1][1];
        
//         let signal = 'neutral';
//         let text = `%K: ${lastK.toFixed(2)}, %D: ${lastD.toFixed(2)} - `;
        
//         if (lastK > 80) {
//             signal = 'bearish';
//             text += 'Overbought - Potential Sell Signal';
//         } else if (lastK < 20) {
//             signal = 'bullish';
//             text += 'Oversold - Potential Buy Signal';
//         } else if (lastK > lastD && stochastic.k[stochastic.k.length - 2][1] <= stochastic.d[stochastic.d.length - 2][1]) {
//             signal = 'bullish';
//             text += 'Bullish Crossover';
//         } else if (lastK < lastD && stochastic.k[stochastic.k.length - 2][1] >= stochastic.d[stochastic.d.length - 2][1]) {
//             signal = 'bearish';
//             text += 'Bearish Crossover';
//         } else {
//             text += 'Neutral';
//         }
        
//         const signalBox = document.getElementById('stochasticSignal');
//         signalBox.className = `signal-box ${signal}`;
//         signalBox.textContent = text;
//     },
    
//     // ✅ WILLIAMS %R (CONSERVÉ)
//     updateWilliamsChart() {
//         const prices = this.stockData.prices;
//         const williams = this.calculateWilliams(prices);
        
//         if (this.charts.williams) {
//             this.charts.williams.series[0].setData(williams, true);
//         } else {
//             this.charts.williams = Highcharts.chart('williamsChart', {
//                 chart: { borderRadius: 15, height: 400 },
//                 title: {
//                     text: 'Williams %R',
//                     style: { color: this.colors.primary, fontWeight: 'bold' }
//                 },
//                 xAxis: { type: 'datetime', crosshair: true },
//                 yAxis: {
//                     title: { text: 'Williams %R' },
//                     plotLines: [
//                         {
//                             value: -20,
//                             color: this.colors.danger,
//                             dashStyle: 'ShortDash',
//                             width: 2,
//                             label: { text: 'Overbought (-20)', align: 'right', style: { color: this.colors.danger } }
//                         },
//                         {
//                             value: -80,
//                             color: this.colors.success,
//                             dashStyle: 'ShortDash',
//                             width: 2,
//                             label: { text: 'Oversold (-80)', align: 'right', style: { color: this.colors.success } }
//                         }
//                     ],
//                     min: -100,
//                     max: 0
//                 },
//                 tooltip: { borderRadius: 10 },
//                 series: [
//                     {
//                         type: 'area',
//                         name: 'Williams %R',
//                         data: williams,
//                         color: this.colors.secondary,
//                         fillOpacity: 0.3,
//                         lineWidth: 2
//                     }
//                 ],
//                 credits: { enabled: false }
//             });
//         }
        
//         this.displayWilliamsSignal(williams);
//     },
    
//     calculateWilliams(prices, period = 14) {
//         const williams = [];
        
//         for (let i = period - 1; i < prices.length; i++) {
//             const slice = prices.slice(i - period + 1, i + 1);
//             const high = Math.max(...slice.map(p => p.high));
//             const low = Math.min(...slice.map(p => p.low));
//             const close = prices[i].close;
            
//             const value = ((high - close) / (high - low)) * -100;
//             williams.push([prices[i].timestamp, value]);
//         }
        
//         return williams;
//     },
    
//     displayWilliamsSignal(williams) {
//         if (!williams.length) {
//             document.getElementById('williamsSignal').textContent = 'Not enough data';
//             return;
//         }
        
//         const lastValue = williams[williams.length - 1][1];
        
//         let signal = 'neutral';
//         let text = `Williams %R: ${lastValue.toFixed(2)} - `;
        
//         if (lastValue > -20) {
//             signal = 'bearish';
//             text += 'Overbought - Potential Sell Signal';
//         } else if (lastValue < -80) {
//             signal = 'bullish';
//             text += 'Oversold - Potential Buy Signal';
//         } else {
//             text += 'Neutral Zone';
//         }
        
//         const signalBox = document.getElementById('williamsSignal');
//         signalBox.className = `signal-box ${signal}`;
//         signalBox.textContent = text;
//     },
    
//     // ✅ ADX (CONSERVÉ)
//     updateADXChart() {
//         const prices = this.stockData.prices;
//         const adxData = this.calculateADX(prices);
        
//         if (!adxData.adx.length || !adxData.plusDI.length || !adxData.minusDI.length) {
//             console.warn('ADX calculation returned empty data');
//             const signalBox = document.getElementById('adxSignal');
//             if (signalBox) {
//                 signalBox.className = 'signal-box neutral';
//                 signalBox.textContent = 'Not enough data for ADX (need 6+ months)';
//             }
//             return;
//         }
        
//         if (this.charts.adx) {
//             this.charts.adx.series[0].setData(adxData.adx, false);
//             this.charts.adx.series[1].setData(adxData.plusDI, false);
//             this.charts.adx.series[2].setData(adxData.minusDI, false);
//             this.charts.adx.redraw();
//         } else {
//             this.charts.adx = Highcharts.chart('adxChart', {
//                 chart: { borderRadius: 15, height: 400 },
//                 title: {
//                     text: 'ADX - Trend Strength',
//                     style: { color: this.colors.primary, fontWeight: 'bold' }
//                 },
//                 xAxis: { type: 'datetime', crosshair: true },
//                 yAxis: {
//                     title: { text: 'ADX Value' },
//                     plotLines: [
//                         {
//                             value: 25,
//                             color: this.colors.success,
//                             dashStyle: 'ShortDash',
//                             width: 2,
//                             label: { text: 'Strong Trend (25)', align: 'right', style: { color: this.colors.success } }
//                         },
//                         {
//                             value: 20,
//                             color: this.colors.warning,
//                             dashStyle: 'Dot',
//                             width: 1,
//                             label: { text: 'Weak Trend (20)', align: 'right' }
//                         }
//                     ],
//                     min: 0,
//                     max: 100
//                 },
//                 tooltip: { borderRadius: 10, shared: true },
//                 series: [
//                     {
//                         type: 'line',
//                         name: 'ADX',
//                         data: adxData.adx,
//                         color: this.colors.primary,
//                         lineWidth: 3
//                     },
//                     {
//                         type: 'line',
//                         name: '+DI',
//                         data: adxData.plusDI,
//                         color: this.colors.success,
//                         lineWidth: 2
//                     },
//                     {
//                         type: 'line',
//                         name: '-DI',
//                         data: adxData.minusDI,
//                         color: this.colors.danger,
//                         lineWidth: 2
//                     }
//                 ],
//                 credits: { enabled: false }
//             });
//         }
        
//         this.displayADXSignal(adxData);
//     },
    
//     calculateADX(prices, period = 14) {
//         if (prices.length < period + 2) {
//             console.warn('Not enough data for ADX calculation');
//             return { adx: [], plusDI: [], minusDI: [] };
//         }
        
//         const trueRange = [];
//         const plusDM = [];
//         const minusDM = [];
        
//         for (let i = 1; i < prices.length; i++) {
//             const high = prices[i].high;
//             const low = prices[i].low;
//             const prevClose = prices[i - 1].close;
            
//             const tr = Math.max(
//                 high - low,
//                 Math.abs(high - prevClose),
//                 Math.abs(low - prevClose)
//             );
//             trueRange.push(tr);
            
//             const highDiff = high - prices[i - 1].high;
//             const lowDiff = prices[i - 1].low - low;
            
//             plusDM.push(highDiff > lowDiff && highDiff > 0 ? highDiff : 0);
//             minusDM.push(lowDiff > highDiff && lowDiff > 0 ? lowDiff : 0);
//         }
        
//         const smoothTR = this.smoothArray(trueRange, period);
//         const smoothPlusDM = this.smoothArray(plusDM, period);
//         const smoothMinusDM = this.smoothArray(minusDM, period);
        
//         const plusDI = [];
//         const minusDI = [];
//         const dxValues = [];
        
//         const maxIndex = Math.min(smoothTR.length, prices.length - period - 1);
        
//         for (let i = 0; i < maxIndex; i++) {
//             if (smoothTR[i] === 0) continue;
            
//             const plusDIValue = (smoothPlusDM[i] / smoothTR[i]) * 100;
//             const minusDIValue = (smoothMinusDM[i] / smoothTR[i]) * 100;
            
//             const timestamp = prices[i + period + 1].timestamp;
//             plusDI.push([timestamp, plusDIValue]);
//             minusDI.push([timestamp, minusDIValue]);
            
//             const sum = plusDIValue + minusDIValue;
//             if (sum > 0) {
//                 const dx = (Math.abs(plusDIValue - minusDIValue) / sum) * 100;
//                 dxValues.push(dx);
//             }
//         }
        
//         if (dxValues.length < period) {
//             console.warn('Not enough DX values for ADX calculation');
//             return { adx: [], plusDI, minusDI };
//         }
        
//         const adxSmoothed = this.smoothArray(dxValues, period);
//         const adxArray = [];
        
//         const adxMaxIndex = Math.min(adxSmoothed.length, prices.length - period * 2 - 1);
        
//         for (let i = 0; i < adxMaxIndex; i++) {
//             const timestamp = prices[i + period * 2 + 1].timestamp;
//             adxArray.push([timestamp, adxSmoothed[i]]);
//         }
        
//         return { adx: adxArray, plusDI, minusDI };
//     },
    
//     smoothArray(arr, period) {
//         if (arr.length < period) return [];
        
//         const result = [];
//         let sum = 0;
        
//         for (let i = 0; i < period; i++) {
//             sum += arr[i];
//         }
//         result.push(sum / period);
        
//         for (let i = period; i < arr.length; i++) {
//             const smoothed = (result[result.length - 1] * (period - 1) + arr[i]) / period;
//             result.push(smoothed);
//         }
        
//         return result;
//     },
    
//     displayADXSignal(adxData) {
//         if (!adxData.adx.length || !adxData.plusDI.length || !adxData.minusDI.length) {
//             const signalBox = document.getElementById('adxSignal');
//             signalBox.className = 'signal-box neutral';
//             signalBox.textContent = 'Not enough data for ADX calculation';
//             return;
//         }
        
//         const lastADX = adxData.adx[adxData.adx.length - 1][1];
//         const lastPlusDI = adxData.plusDI[adxData.plusDI.length - 1][1];
//         const lastMinusDI = adxData.minusDI[adxData.minusDI.length - 1][1];
        
//         let signal = 'neutral';
//         let text = `ADX: ${lastADX.toFixed(2)} - `;
        
//         if (lastADX > 25) {
//             if (lastPlusDI > lastMinusDI) {
//                 signal = 'bullish';
//                 text += 'Strong Uptrend';
//             } else {
//                 signal = 'bearish';
//                 text += 'Strong Downtrend';
//             }
//         } else if (lastADX > 20) {
//             text += 'Developing Trend';
//         } else {
//             text += 'Weak/No Trend (Ranging Market)';
//         }
        
//         const signalBox = document.getElementById('adxSignal');
//         signalBox.className = `signal-box ${signal}`;
//         signalBox.textContent = text;
//     },
    
//     // ✅ PARABOLIC SAR (CONSERVÉ)
//     updateSARChart() {
//         const prices = this.stockData.prices;
//         const sar = this.calculateSAR(prices);
//         const ohlc = prices.map(p => [p.timestamp, p.open, p.high, p.low, p.close]);
        
//         if (this.charts.sar) {
//             this.charts.sar.series[0].setData(ohlc, false);
//             this.charts.sar.series[1].setData(sar, false);
//             this.charts.sar.redraw();
//         } else {
//             this.charts.sar = Highcharts.stockChart('sarChart', {
//                 chart: { borderRadius: 15, height: 400 },
//                 title: {
//                     text: 'Parabolic SAR',
//                     style: { color: this.colors.primary, fontWeight: 'bold' }
//                 },
//                 rangeSelector: { enabled: false },
//                 navigator: { enabled: false },
//                 xAxis: { type: 'datetime', crosshair: true },
//                 yAxis: { title: { text: 'Price' } },
//                 tooltip: { borderRadius: 10, shared: true },
//                 series: [
//                     {
//                         type: 'candlestick',
//                         name: this.currentSymbol,
//                         data: ohlc,
//                         color: this.colors.danger,
//                         upColor: this.colors.success
//                     },
//                     {
//                         type: 'scatter',
//                         name: 'Parabolic SAR',
//                         data: sar,
//                         color: this.colors.purple,
//                         marker: { radius: 3, symbol: 'circle' }
//                     }
//                 ],
//                 credits: { enabled: false }
//             });
//         }
        
//         this.displaySARSignal(sar, prices);
//     },
    
//     calculateSAR(prices, af = 0.02, maxAF = 0.2) {
//         const sar = [];
//         let isUptrend = true;
//         let currentSAR = prices[0].low;
//         let ep = prices[0].high;
//         let currentAF = af;
        
//         for (let i = 1; i < prices.length; i++) {
//             const price = prices[i];
//             currentSAR = currentSAR + currentAF * (ep - currentSAR);
            
//             if (isUptrend) {
//                 if (price.low < currentSAR) {
//                     isUptrend = false;
//                     currentSAR = ep;
//                     ep = price.low;
//                     currentAF = af;
//                 } else {
//                     if (price.high > ep) {
//                         ep = price.high;
//                         currentAF = Math.min(currentAF + af, maxAF);
//                     }
//                 }
//             } else {
//                 if (price.high > currentSAR) {
//                     isUptrend = true;
//                     currentSAR = ep;
//                     ep = price.high;
//                     currentAF = af;
//                 } else {
//                     if (price.low < ep) {
//                         ep = price.low;
//                         currentAF = Math.min(currentAF + af, maxAF);
//                     }
//                 }
//             }
            
//             sar.push([price.timestamp, currentSAR]);
//         }
        
//         return sar;
//     },
    
//     displaySARSignal(sar, prices) {
//         if (!sar.length) {
//             document.getElementById('sarSignal').textContent = 'Not enough data';
//             return;
//         }
        
//         const lastPrice = prices[prices.length - 1].close;
//         const lastSAR = sar[sar.length - 1][1];
        
//         const signal = lastPrice > lastSAR ? 'bullish' : 'bearish';
//         const text = lastPrice > lastSAR 
//             ? `Price above SAR - Uptrend (Hold Long)` 
//             : `Price below SAR - Downtrend (Hold Short)`;
        
//         const signalBox = document.getElementById('sarSignal');
//         signalBox.className = `signal-box ${signal}`;
//         signalBox.textContent = text;
//     },
    
//     // ✅ OBV (CONSERVÉ)
//     updateOBVChart() {
//         const prices = this.stockData.prices;
//         const obv = this.calculateOBV(prices);
        
//         if (this.charts.obv) {
//             this.charts.obv.series[0].setData(obv, true);
//         } else {
//             this.charts.obv = Highcharts.chart('obvChart', {
//                 chart: { borderRadius: 15, height: 400 },
//                 title: {
//                     text: 'On-Balance Volume (OBV)',
//                     style: { color: this.colors.primary, fontWeight: 'bold' }
//                 },
//                 xAxis: { type: 'datetime', crosshair: true },
//                 yAxis: { title: { text: 'OBV' } },
//                 tooltip: { borderRadius: 10, valueDecimals: 0 },
//                 series: [
//                     {
//                         type: 'area',
//                         name: 'OBV',
//                         data: obv,
//                         color: this.colors.secondary,
//                         fillOpacity: 0.3,
//                         lineWidth: 2
//                     }
//                 ],
//                 credits: { enabled: false }
//             });
//         }
        
//         this.displayOBVSignal(obv, prices);
//     },
    
//     calculateOBV(prices) {
//         const obv = [];
//         let currentOBV = 0;
        
//         obv.push([prices[0].timestamp, currentOBV]);
        
//         for (let i = 1; i < prices.length; i++) {
//             if (prices[i].close > prices[i - 1].close) {
//                 currentOBV += prices[i].volume;
//             } else if (prices[i].close < prices[i - 1].close) {
//                 currentOBV -= prices[i].volume;
//             }
            
//             obv.push([prices[i].timestamp, currentOBV]);
//         }
        
//         return obv;
//     },
    
//     displayOBVSignal(obv, prices) {
//         if (obv.length < 20) {
//             document.getElementById('obvSignal').textContent = 'Not enough data';
//             return;
//         }
        
//         const recentPrices = prices.slice(-20);
//         const recentOBV = obv.slice(-20);
        
//         const priceChange = recentPrices[recentPrices.length - 1].close - recentPrices[0].close;
//         const obvChange = recentOBV[recentOBV.length - 1][1] - recentOBV[0][1];
        
//         let signal = 'neutral';
//         let text = '';
        
//         if (priceChange > 0 && obvChange > 0) {
//             signal = 'bullish';
//             text = 'Price ↑ + OBV ↑ - Strong Uptrend';
//         } else if (priceChange < 0 && obvChange < 0) {
//             signal = 'bearish';
//             text = 'Price ↓ + OBV ↓ - Strong Downtrend';
//         } else if (priceChange > 0 && obvChange < 0) {
//             signal = 'bearish';
//             text = 'Bearish Divergence - Weakness in Uptrend';
//         } else if (priceChange < 0 && obvChange > 0) {
//             signal = 'bullish';
//             text = 'Bullish Divergence - Weakness in Downtrend';
//         } else {
//             text = 'No Clear Signal';
//         }
        
//         const signalBox = document.getElementById('obvSignal');
//         signalBox.className = `signal-box ${signal}`;
//         signalBox.textContent = text;
//     },
    
//     // ✅ ATR (CONSERVÉ)
//     updateATRChart() {
//         const prices = this.stockData.prices;
//         const atr = this.calculateATR(prices);
        
//         if (this.charts.atr) {
//             this.charts.atr.series[0].setData(atr, true);
//         } else {
//             this.charts.atr = Highcharts.chart('atrChart', {
//                 chart: { borderRadius: 15, height: 400 },
//                 title: {
//                     text: 'Average True Range (ATR)',
//                     style: { color: this.colors.primary, fontWeight: 'bold' }
//                 },
//                 xAxis: { type: 'datetime', crosshair: true },
//                 yAxis: { title: { text: 'ATR Value' } },
//                 tooltip: { borderRadius: 10, valueDecimals: 2 },
//                 series: [
//                     {
//                         type: 'line',
//                         name: 'ATR',
//                         data: atr,
//                         color: this.colors.tertiary,
//                         lineWidth: 2
//                     }
//                 ],
//                 credits: { enabled: false }
//             });
//         }
        
//         this.displayATRSignal(atr);
//     },
    
//     calculateATR(prices, period = 14) {
//         const trueRange = [];
        
//         for (let i = 1; i < prices.length; i++) {
//             const high = prices[i].high;
//             const low = prices[i].low;
//             const prevClose = prices[i - 1].close;
            
//             const tr = Math.max(
//                 high - low,
//                 Math.abs(high - prevClose),
//                 Math.abs(low - prevClose)
//             );
            
//             trueRange.push(tr);
//         }
        
//         const atr = [];
//         let sum = 0;
        
//         for (let i = 0; i < period && i < trueRange.length; i++) {
//             sum += trueRange[i];
//         }
        
//         if (period < prices.length) {
//             atr.push([prices[period].timestamp, sum / period]);
//         }
        
//         for (let i = period; i < trueRange.length; i++) {
//             const smoothed = (atr[atr.length - 1][1] * (period - 1) + trueRange[i]) / period;
//             const priceIndex = i + 1;
            
//             if (priceIndex < prices.length) {
//                 atr.push([prices[priceIndex].timestamp, smoothed]);
//             }
//         }
        
//         return atr;
//     },
    
//     displayATRSignal(atr) {
//         if (!atr.length || atr.length < 20) {
//             const signalBox = document.getElementById('atrSignal');
//             signalBox.className = 'signal-box neutral';
//             signalBox.textContent = 'Not enough data for ATR calculation';
//             return;
//         }
        
//         const lastATR = atr[atr.length - 1][1];
//         const avgATR = atr.slice(-20).reduce((sum, item) => sum + item[1], 0) / 20;
        
//         let signal = 'neutral';
//         let text = `Current ATR: ${lastATR.toFixed(2)} - `;
        
//         if (lastATR > avgATR * 1.5) {
//             signal = 'neutral';
//             text += 'High Volatility (Use Wider Stops)';
//         } else if (lastATR < avgATR * 0.7) {
//             signal = 'neutral';
//             text += 'Low Volatility (Potential Breakout Coming)';
//         } else {
//             text += 'Normal Volatility';
//         }
        
//         const signalBox = document.getElementById('atrSignal');
//         signalBox.className = `signal-box ${signal}`;
//         signalBox.textContent = text;
//     },
    
//     // ✅ FIBONACCI RETRACEMENTS (CONSERVÉ)
//     updateFibonacciChart() {
//         const prices = this.stockData.prices;
//         const fibonacci = this.calculateFibonacci(prices);
//         const ohlc = prices.map(p => [p.timestamp, p.open, p.high, p.low, p.close]);
        
//         if (this.charts.fibonacci) {
//             this.charts.fibonacci.series[0].setData(ohlc, false);
//             this.charts.fibonacci.yAxis[0].update({
//                 plotLines: fibonacci.levels.map(level => ({
//                     value: level.price,
//                     color: this.getColorForFibLevel(level.ratio),
//                     dashStyle: 'Dash',
//                     width: 2,
//                     label: {
//                         text: `${level.name} (${this.formatCurrency(level.price)})`,
//                         align: 'right',
//                         style: {
//                             color: this.getColorForFibLevel(level.ratio),
//                             fontWeight: level.ratio === 0.618 ? 'bold' : 'normal'
//                         }
//                     },
//                     zIndex: 5
//                 }))
//             }, false);
//             this.charts.fibonacci.redraw();
//         } else {
//             this.charts.fibonacci = Highcharts.stockChart('fibonacciChart', {
//                 chart: { borderRadius: 15, height: 600 },
//                 title: {
//                     text: 'Fibonacci Retracements',
//                     style: { color: this.colors.primary, fontWeight: 'bold' }
//                 },
//                 rangeSelector: { enabled: false },
//                 navigator: { enabled: false },
//                 xAxis: { type: 'datetime', crosshair: true },
//                 yAxis: {
//                     title: { text: 'Price' },
//                     plotLines: fibonacci.levels.map(level => ({
//                         value: level.price,
//                         color: this.getColorForFibLevel(level.ratio),
//                         dashStyle: 'Dash',
//                         width: 2,
//                         label: {
//                             text: `${level.name} (${this.formatCurrency(level.price)})`,
//                             align: 'right',
//                             style: {
//                                 color: this.getColorForFibLevel(level.ratio),
//                                 fontWeight: level.ratio === 0.618 ? 'bold' : 'normal'
//                             }
//                         },
//                         zIndex: 5
//                     }))
//                 },
//                 tooltip: { borderRadius: 10, shared: true },
//                 series: [
//                     {
//                         type: 'candlestick',
//                         name: this.currentSymbol,
//                         data: ohlc,
//                         color: this.colors.danger,
//                         upColor: this.colors.success,
//                         zIndex: 2
//                     }
//                 ],
//                 credits: { enabled: false }
//             });
//         }
        
//         this.displayFibonacciLevels(fibonacci);
//     },
    
//     calculateFibonacci(prices) {
//         const high = Math.max(...prices.map(p => p.high));
//         const low = Math.min(...prices.map(p => p.low));
//         const diff = high - low;
        
//         const ratios = [
//             { ratio: 0, name: '0% (High)' },
//             { ratio: 0.236, name: '23.6%' },
//             { ratio: 0.382, name: '38.2%' },
//             { ratio: 0.5, name: '50%' },
//             { ratio: 0.618, name: '61.8% (Golden)' },
//             { ratio: 0.786, name: '78.6%' },
//             { ratio: 1, name: '100% (Low)' }
//         ];
        
//         const levels = ratios.map(r => ({
//             ratio: r.ratio,
//             name: r.name,
//             price: high - (diff * r.ratio)
//         }));
        
//         return { high, low, levels };
//     },
    
//     getColorForFibLevel(ratio) {
//         if (ratio === 0.618) return this.colors.danger;
//         if (ratio === 0 || ratio === 1) return this.colors.primary;
//         return this.colors.lightBlue;
//     },
    
//     displayFibonacciLevels(fibonacci) {
//         const currentPrice = this.stockData.prices[this.stockData.prices.length - 1].close;
        
//         const tableHTML = `
//             <table>
//                 <thead>
//                     <tr>
//                         <th>Level</th>
//                         <th>Price</th>
//                         <th>Distance from Current</th>
//                         <th>Type</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     ${fibonacci.levels.map(level => {
//                         const distance = ((level.price - currentPrice) / currentPrice) * 100;
//                         const distanceText = `${distance >= 0 ? '+' : ''}${distance.toFixed(2)}%`;
//                         const type = level.price > currentPrice ? 'Resistance' : 'Support';
                        
//                         return `
//                             <tr>
//                                 <td class='level-name'>${level.name}</td>
//                                 <td class='level-price'>${this.formatCurrency(level.price)}</td>
//                                 <td style='color: ${distance >= 0 ? this.colors.danger : this.colors.success}'>${distanceText}</td>
//                                 <td style='color: ${type === 'Resistance' ? this.colors.danger : this.colors.success}'>${type}</td>
//                             </tr>
//                         `;
//                     }).join('')}
//                 </tbody>
//             </table>
//         `;
        
//         document.getElementById('fibonacciLevels').innerHTML = tableHTML;
//     },
    
//     // ✅ PIVOT POINTS (CONSERVÉ)
//     createPivotPoints() {
//         const prices = this.stockData.prices;
//         const lastPrice = prices[prices.length - 1];
//         const prevPrice = prices[prices.length - 2];
        
//         const high = prevPrice.high;
//         const low = prevPrice.low;
//         const close = prevPrice.close;
        
//         const standard = this.calculateStandardPivots(high, low, close);
//         this.displayPivotCard('pivotStandard', standard, lastPrice.close);
        
//         const fibonacci = this.calculateFibonacciPivots(high, low, close);
//         this.displayPivotCard('pivotFibonacci', fibonacci, lastPrice.close);
        
//         const camarilla = this.calculateCamarillaPivots(high, low, close);
//         this.displayPivotCard('pivotCamarilla', camarilla, lastPrice.close);
//     },
    
//     calculateStandardPivots(high, low, close) {
//         const pivot = (high + low + close) / 3;
        
//         return {
//             R3: high + 2 * (pivot - low),
//             R2: pivot + (high - low),
//             R1: 2 * pivot - low,
//             P: pivot,
//             S1: 2 * pivot - high,
//             S2: pivot - (high - low),
//             S3: low - 2 * (high - pivot)
//         };
//     },
    
//     calculateFibonacciPivots(high, low, close) {
//         const pivot = (high + low + close) / 3;
//         const range = high - low;
        
//         return {
//             R3: pivot + range * 1.000,
//             R2: pivot + range * 0.618,
//             R1: pivot + range * 0.382,
//             P: pivot,
//             S1: pivot - range * 0.382,
//             S2: pivot - range * 0.618,
//             S3: pivot - range * 1.000
//         };
//     },
    
//     calculateCamarillaPivots(high, low, close) {
//         const range = high - low;
        
//         return {
//             R4: close + range * 1.1 / 2,
//             R3: close + range * 1.1 / 4,
//             R2: close + range * 1.1 / 6,
//             R1: close + range * 1.1 / 12,
//             P: close,
//             S1: close - range * 1.1 / 12,
//             S2: close - range * 1.1 / 6,
//             S3: close - range * 1.1 / 4,
//             S4: close - range * 1.1 / 2
//         };
//     },
    
//     displayPivotCard(elementId, pivots, currentPrice) {
//         const container = document.getElementById(elementId);
//         if (!container) return;
        
//         const valuesContainer = container.querySelector('.pivot-values');
//         if (!valuesContainer) return;
        
//         const entries = Object.entries(pivots).sort((a, b) => b[1] - a[1]);
        
//         const html = entries.map(([label, value]) => {
//             let className = 'pivot-level';
//             if (label.startsWith('R')) className += ' resistance';
//             else if (label.startsWith('S')) className += ' support';
//             else className += ' pivot';
            
//             const distance = ((value - currentPrice) / currentPrice) * 100;
//             const distanceText = `${distance >= 0 ? '+' : ''}${distance.toFixed(2)}%`;
            
//             return `
//                 <div class='${className}'>
//                     <span class='pivot-label'>${label}</span>
//                     <span class='pivot-value'><strong>${this.formatCurrency(value)}</strong> <small>(${distanceText})</small></span>
//                 </div>
//             `;
//         }).join('');
        
//         valuesContainer.innerHTML = html;
//     },
    
//     // ✅ VWAP (CONSERVÉ)
//     updateVWAPChart() {
//         const prices = this.stockData.prices;
//         const vwap = this.calculateVWAP(prices);
//         const ohlc = prices.map(p => [p.timestamp, p.open, p.high, p.low, p.close]);
        
//         if (this.charts.vwap) {
//             this.charts.vwap.series[0].setData(ohlc, false);
//             this.charts.vwap.series[1].setData(vwap.vwap, false);
//             this.charts.vwap.series[2].setData(vwap.upperBand1, false);
//             this.charts.vwap.series[3].setData(vwap.upperBand2, false);
//             this.charts.vwap.series[4].setData(vwap.lowerBand1, false);
//             this.charts.vwap.series[5].setData(vwap.lowerBand2, false);
//             this.charts.vwap.redraw();
//         } else {
//             this.charts.vwap = Highcharts.stockChart('vwapChart', {
//                 chart: { borderRadius: 15, height: 600 },
//                 title: {
//                     text: 'VWAP with Standard Deviation Bands',
//                     style: { color: this.colors.primary, fontWeight: 'bold' }
//                 },
//                 rangeSelector: { enabled: false },
//                 navigator: { enabled: true },
//                 xAxis: { type: 'datetime', crosshair: true },
//                 yAxis: { title: { text: 'Price' } },
//                 tooltip: { borderRadius: 10, shared: true },
//                 series: [
//                     {
//                         type: 'candlestick',
//                         name: this.currentSymbol,
//                         data: ohlc,
//                         color: this.colors.danger,
//                         upColor: this.colors.success,
//                         zIndex: 2
//                     },
//                     {
//                         type: 'line',
//                         name: 'VWAP',
//                         data: vwap.vwap,
//                         color: this.colors.primary,
//                         lineWidth: 3,
//                         zIndex: 3
//                     },
//                     {
//                         type: 'line',
//                         name: 'Upper Band (+1 SD)',
//                         data: vwap.upperBand1,
//                         color: this.colors.danger,
//                         lineWidth: 1,
//                         dashStyle: 'Dash',
//                         zIndex: 1
//                     },
//                     {
//                         type: 'line',
//                         name: 'Upper Band (+2 SD)',
//                         data: vwap.upperBand2,
//                         color: this.colors.danger,
//                         lineWidth: 1,
//                         dashStyle: 'Dot',
//                         zIndex: 1
//                     },
//                     {
//                         type: 'line',
//                         name: 'Lower Band (-1 SD)',
//                         data: vwap.lowerBand1,
//                         color: this.colors.success,
//                         lineWidth: 1,
//                         dashStyle: 'Dash',
//                         zIndex: 1
//                     },
//                     {
//                         type: 'line',
//                         name: 'Lower Band (-2 SD)',
//                         data: vwap.lowerBand2,
//                         color: this.colors.success,
//                         lineWidth: 1,
//                         dashStyle: 'Dot',
//                         zIndex: 1
//                     }
//                 ],
//                 credits: { enabled: false }
//             });
//         }
        
//         this.displayVWAPSignal(vwap, prices);
//     },
    
//     calculateVWAP(prices) {
//         const vwapArray = [];
//         const upperBand1 = [];
//         const upperBand2 = [];
//         const lowerBand1 = [];
//         const lowerBand2 = [];
        
//         let cumulativeTPV = 0;
//         let cumulativeVolume = 0;
//         const squaredDiffs = [];
        
//         for (let i = 0; i < prices.length; i++) {
//             const typical = (prices[i].high + prices[i].low + prices[i].close) / 3;
//             const tpv = typical * prices[i].volume;
            
//             cumulativeTPV += tpv;
//             cumulativeVolume += prices[i].volume;
            
//             const vwapValue = cumulativeTPV / cumulativeVolume;
//             vwapArray.push([prices[i].timestamp, vwapValue]);
            
//             squaredDiffs.push(Math.pow(typical - vwapValue, 2) * prices[i].volume);
//             const variance = squaredDiffs.reduce((a, b) => a + b, 0) / cumulativeVolume;
//             const stdDev = Math.sqrt(variance);
            
//             upperBand1.push([prices[i].timestamp, vwapValue + stdDev]);
//             upperBand2.push([prices[i].timestamp, vwapValue + 2 * stdDev]);
//             lowerBand1.push([prices[i].timestamp, vwapValue - stdDev]);
//             lowerBand2.push([prices[i].timestamp, vwapValue - 2 * stdDev]);
//         }
        
//         return { vwap: vwapArray, upperBand1, upperBand2, lowerBand1, lowerBand2 };
//     },
    
//     displayVWAPSignal(vwap, prices) {
//         if (!vwap.vwap.length) {
//             document.getElementById('vwapSignal').textContent = 'Not enough data';
//             return;
//         }
        
//         const lastPrice = prices[prices.length - 1].close;
//         const lastVWAP = vwap.vwap[vwap.vwap.length - 1][1];
//         const lastUpper1 = vwap.upperBand1[vwap.upperBand1.length - 1][1];
//         const lastLower1 = vwap.lowerBand1[vwap.lowerBand1.length - 1][1];
        
//         let signal = 'neutral';
//         let text = `Price: ${this.formatCurrency(lastPrice)}, VWAP: ${this.formatCurrency(lastVWAP)} - `;
        
//         if (lastPrice > lastVWAP) {
//             signal = 'bullish';
//             text += 'Price above VWAP - Bullish (Institutional Support)';
//         } else if (lastPrice < lastVWAP) {
//             signal = 'bearish';
//             text += 'Price below VWAP - Bearish (Institutional Resistance)';
//         } else {
//             text += 'Price at VWAP - Fair Value';
//         }
        
//         if (lastPrice > lastUpper1) {
//             text += ' | Overbought (Above +1 SD)';
//         } else if (lastPrice < lastLower1) {
//             text += ' | Oversold (Below -1 SD)';
//         }
        
//         const signalBox = document.getElementById('vwapSignal');
//         signalBox.className = `signal-box ${signal}`;
//         signalBox.textContent = text;
//     },
    
//     // ============================================
//     // ✅ CONSOLIDATED TRADING SIGNALS (AMÉLIORÉ - TOUS LES INDICATEURS)
//     // ============================================
    
//     generateConsolidatedSignals() {
//         const prices = this.stockData.prices;
//         const signals = [];
        
//         // Calculer TOUS les indicateurs
//         const stochastic = this.calculateStochastic(prices);
//         const williams = this.calculateWilliams(prices);
//         const adxData = this.calculateADX(prices);
//         const sar = this.calculateSAR(prices);
//         const obv = this.calculateOBV(prices);
//         const vwap = this.calculateVWAP(prices);
//         const ichimoku = this.calculateIchimoku(prices);
//         const rsi = this.calculateRSI(prices);
//         const macd = this.calculateMACD(prices);
//         const bollinger = this.calculateBollingerBands(prices);
//         const mfi = this.calculateMFI(prices);
//         const cci = this.calculateCCI(prices);
//         const ultimate = this.calculateUltimateOscillator(prices);
//         const roc = this.calculateROC(prices);
//         const aroon = this.calculateAroon(prices);
//         const keltner = this.calculateKeltnerChannels(prices);
//         const donchian = this.calculateDonchianChannels(prices);
//         const cmf = this.calculateCMF(prices);
//         const elderRay = this.calculateElderRay(prices);
//         const mas = this.calculateMultipleMovingAverages(prices);
        
//         // RSI
//         if (rsi.length > 0) {
//             const lastRSI = rsi[rsi.length - 1][1];
//             let rsiSignal = 0;
//             if (lastRSI < 30) rsiSignal = 1;
//             else if (lastRSI > 70) rsiSignal = -1;
//             signals.push({ name: 'RSI', value: lastRSI.toFixed(2), signal: rsiSignal });
//         }
        
//         // MACD
//         if (macd.histogram.length > 0) {
//             const lastHist = macd.histogram[macd.histogram.length - 1][1];
//             const macdSignal = lastHist > 0 ? 1 : lastHist < 0 ? -1 : 0;
//             signals.push({ name: 'MACD', value: lastHist.toFixed(4), signal: macdSignal });
//         }
        
//         // Bollinger Bands
//         if (bollinger.upper.length > 0) {
//             const lastPrice = prices[prices.length - 1].close;
//             const lastUpper = bollinger.upper[bollinger.upper.length - 1][1];
//             const lastLower = bollinger.lower[bollinger.lower.length - 1][1];
//             let bbSignal = 0;
//             if (lastPrice < lastLower) bbSignal = 1;
//             else if (lastPrice > lastUpper) bbSignal = -1;
//             signals.push({ name: 'Bollinger', value: 'N/A', signal: bbSignal });
//         }
        
//         // MFI
//         if (mfi.length > 0) {
//             const lastMFI = mfi[mfi.length - 1][1];
//             let mfiSignal = 0;
//             if (lastMFI < 20) mfiSignal = 1;
//             else if (lastMFI > 80) mfiSignal = -1;
//             signals.push({ name: 'MFI', value: lastMFI.toFixed(2), signal: mfiSignal });
//         }
        
//         // CCI
//         if (cci.length > 0) {
//             const lastCCI = cci[cci.length - 1][1];
//             let cciSignal = 0;
//             if (lastCCI < -100) cciSignal = 1;
//             else if (lastCCI > 100) cciSignal = -1;
//             signals.push({ name: 'CCI', value: lastCCI.toFixed(2), signal: cciSignal });
//         }
        
//         // Ultimate Oscillator
//         if (ultimate.length > 0) {
//             const lastUO = ultimate[ultimate.length - 1][1];
//             let uoSignal = 0;
//             if (lastUO < 30) uoSignal = 1;
//             else if (lastUO > 70) uoSignal = -1;
//             signals.push({ name: 'Ultimate Osc', value: lastUO.toFixed(2), signal: uoSignal });
//         }
        
//         // ROC
//         if (roc.length > 0) {
//             const lastROC = roc[roc.length - 1][1];
//             const rocSignal = lastROC > 0 ? 1 : lastROC < 0 ? -1 : 0;
//             signals.push({ name: 'ROC', value: lastROC.toFixed(2) + '%', signal: rocSignal });
//         }
        
//         // Aroon
//         if (aroon.up.length > 0 && aroon.down.length > 0) {
//             const lastUp = aroon.up[aroon.up.length - 1][1];
//             const lastDown = aroon.down[aroon.down.length - 1][1];
//             const aroonSignal = lastUp > lastDown ? 1 : -1;
//             signals.push({ name: 'Aroon', value: 'N/A', signal: aroonSignal });
//         }
        
//         // CMF
//         if (cmf.length > 0) {
//             const lastCMF = cmf[cmf.length - 1][1];
//             const cmfSignal = lastCMF > 0 ? 1 : lastCMF < 0 ? -1 : 0;
//             signals.push({ name: 'CMF', value: lastCMF.toFixed(4), signal: cmfSignal });
//         }
        
//         // Elder Ray
//         if (elderRay.bullPower.length > 0 && elderRay.bearPower.length > 0) {
//             const lastBull = elderRay.bullPower[elderRay.bullPower.length - 1][1];
//             const lastBear = elderRay.bearPower[elderRay.bearPower.length - 1][1];
//             let elderSignal = 0;
//             if (lastBull > 0 && lastBear > 0) elderSignal = 1;
//             else if (lastBull < 0 && lastBear < 0) elderSignal = -1;
//             signals.push({ name: 'Elder Ray', value: 'N/A', signal: elderSignal });
//         }
        
//         // Moving Averages
//         if (mas.sma20.length > 0 && mas.sma50.length > 0) {
//             const lastPrice = prices[prices.length - 1].close;
//             const lastSMA20 = mas.sma20[mas.sma20.length - 1][1];
//             const lastSMA50 = mas.sma50[mas.sma50.length - 1][1];
//             let maSignal = 0;
//             if (lastPrice > lastSMA20 && lastSMA20 > lastSMA50) maSignal = 1;
//             else if (lastPrice < lastSMA20 && lastSMA20 < lastSMA50) maSignal = -1;
//             signals.push({ name: 'Moving Averages', value: 'N/A', signal: maSignal });
//         }
        
//         // Stochastic
//         if (stochastic.k.length > 0) {
//             const lastK = stochastic.k[stochastic.k.length - 1][1];
//             let stochasticSignal = 0;
//             if (lastK < 20) stochasticSignal = 1;
//             else if (lastK > 80) stochasticSignal = -1;
//             signals.push({ name: 'Stochastic', value: lastK.toFixed(2), signal: stochasticSignal });
//         }
        
//         // Williams %R
//         if (williams.length > 0) {
//             const lastWilliams = williams[williams.length - 1][1];
//             let williamsSignal = 0;
//             if (lastWilliams < -80) williamsSignal = 1;
//             else if (lastWilliams > -20) williamsSignal = -1;
//             signals.push({ name: 'Williams %R', value: lastWilliams.toFixed(2), signal: williamsSignal });
//         }
        
//         // ADX
//         let adxSignal = 0;
//         let adxValue = 'N/A';
//         if (adxData.adx.length > 0 && adxData.plusDI.length > 0 && adxData.minusDI.length > 0) {
//             const lastADX = adxData.adx[adxData.adx.length - 1][1];
//             const lastPlusDI = adxData.plusDI[adxData.plusDI.length - 1][1];
//             const lastMinusDI = adxData.minusDI[adxData.minusDI.length - 1][1];
//             adxValue = lastADX.toFixed(2);
//             if (lastADX > 25) {
//                 if (lastPlusDI > lastMinusDI) adxSignal = 1;
//                 else adxSignal = -1;
//             }
//         }
//         signals.push({ name: 'ADX', value: adxValue, signal: adxSignal });
        
//         // Parabolic SAR
//         if (sar.length > 0) {
//             const lastPrice = prices[prices.length - 1].close;
//             const lastSAR = sar[sar.length - 1][1];
//             const sarSignal = lastPrice > lastSAR ? 1 : -1;
//             signals.push({ name: 'Parabolic SAR', value: this.formatCurrency(lastSAR), signal: sarSignal });
//         }
        
//         // OBV
//         if (obv.length >= 20) {
//             const recentOBV = obv.slice(-20);
//             const obvTrend = recentOBV[recentOBV.length - 1][1] - recentOBV[0][1];
//             const obvSignal = obvTrend > 0 ? 1 : obvTrend < 0 ? -1 : 0;
//             signals.push({ name: 'OBV', value: obvTrend > 0 ? 'Rising' : obvTrend < 0 ? 'Falling' : 'Flat', signal: obvSignal });
//         }
        
//         // VWAP
//         if (vwap.vwap.length > 0) {
//             const lastPrice = prices[prices.length - 1].close;
//             const lastVWAP = vwap.vwap[vwap.vwap.length - 1][1];
//             const vwapSignal = lastPrice > lastVWAP ? 1 : lastPrice < lastVWAP ? -1 : 0;
//             signals.push({ name: 'VWAP', value: this.formatCurrency(lastVWAP), signal: vwapSignal });
//         }
        
//         // Ichimoku Cloud
//         if (ichimoku.spanA.length > 0 && ichimoku.spanB.length > 0) {
//             const lastPrice = prices[prices.length - 1].close;
//             const lastCloudTop = Math.max(
//                 ichimoku.spanA[ichimoku.spanA.length - 1]?.[1] || 0,
//                 ichimoku.spanB[ichimoku.spanB.length - 1]?.[1] || 0
//             );
//             const lastCloudBottom = Math.min(
//                 ichimoku.spanA[ichimoku.spanA.length - 1]?.[1] || Infinity,
//                 ichimoku.spanB[ichimoku.spanB.length - 1]?.[1] || Infinity
//             );
            
//             let ichimokuSignal = 0;
//             let ichimokuValue = 'In Cloud';
            
//             if (lastPrice > lastCloudTop) {
//                 ichimokuSignal = 1;
//                 ichimokuValue = 'Above Cloud';
//             } else if (lastPrice < lastCloudBottom) {
//                 ichimokuSignal = -1;
//                 ichimokuValue = 'Below Cloud';
//             }
            
//             signals.push({ name: 'Ichimoku Cloud', value: ichimokuValue, signal: ichimokuSignal });
//         }
        
//         // Calculate consolidated signal
//         if (signals.length > 0) {
//             const totalSignal = signals.reduce((sum, s) => sum + s.signal, 0);
//             const maxSignal = signals.length;
//             const signalPercentage = ((totalSignal + maxSignal) / (2 * maxSignal)) * 100;
            
//             this.displayConsolidatedSignals(signals, signalPercentage);
//         }
//     },

//     // ============================================
//     // 🤖 ALPHY AI RECOMMENDATION ENGINE
//     // Wall Street Grade Multi-Horizon Analysis
//     // ============================================

//     generateAIRecommendation() {
//         console.log('🤖 Alphy AI - Generating institutional-grade recommendation...');
        
//         const prices = this.stockData.prices;
//         const currentPrice = prices[prices.length - 1].close;
        
//         // ✅ ÉTAPE 1 : Collecter tous les signaux techniques
//         const technicalSignals = this.collectAllTechnicalSignals(prices);
        
//         // ✅ ÉTAPE 2 : Calculer l'AI Confidence Score global
//         const aiScore = this.calculateAIConfidenceScore(technicalSignals);
        
//         // ✅ ÉTAPE 3 : Générer les recommandations multi-horizons
//         const horizonRecommendations = this.generateHorizonRecommendations(
//             prices, 
//             currentPrice, 
//             technicalSignals, 
//             aiScore
//         );
        
//         // ✅ ÉTAPE 4 : Analyser le Risk/Reward
//         const riskReward = this.analyzeRiskReward(prices, technicalSignals);
        
//         // ✅ ÉTAPE 5 : Générer le rapport professionnel
//         const professionalSummary = this.generateProfessionalSummary(
//             aiScore,
//             horizonRecommendations,
//             riskReward,
//             technicalSignals
//         );
        
//         // ✅ ÉTAPE 6 : Afficher tous les résultats
//         this.displayAIRecommendation(aiScore, technicalSignals);
//         this.displayHorizonRecommendations(horizonRecommendations, currentPrice);
//         this.displayRiskReward(riskReward);
//         this.displayProfessionalSummary(professionalSummary);
        
//         console.log('✅ Alphy AI Recommendation generated successfully');
//     },

//     // ============================================
//     // 📊 COLLECTE DE TOUS LES SIGNAUX TECHNIQUES
//     // ============================================

//     collectAllTechnicalSignals(prices) {
//         const signals = {
//             momentum: [],      // RSI, Stochastic, Williams, MFI, CCI, Ultimate, ROC
//             trend: [],         // MACD, ADX, Aroon, Moving Averages, SAR, Ichimoku
//             volatility: [],    // Bollinger, Keltner, Donchian, ATR
//             volume: [],        // OBV, CMF, MFI, Volume Profile
//             price: [],         // Support/Resistance, Fibonacci, Pivot Points, VWAP
//             patterns: []       // Candlestick Patterns, Divergences
//         };
        
//         // === MOMENTUM INDICATORS ===
        
//         // RSI
//         const rsi = this.calculateRSI(prices);
//         if (rsi.length > 0) {
//             const lastRSI = rsi[rsi.length - 1][1];
//             let strength = 0;
//             if (lastRSI < 30) strength = 2;
//             else if (lastRSI < 40) strength = 1;
//             else if (lastRSI > 70) strength = -2;
//             else if (lastRSI > 60) strength = -1;
            
//             signals.momentum.push({
//                 name: 'RSI',
//                 value: lastRSI,
//                 signal: strength,
//                 weight: 1.2,
//                 timeframe: 'short'
//             });
//         }
        
//         // Stochastic
//         const stochastic = this.calculateStochastic(prices);
//         if (stochastic.k.length > 0) {
//             const lastK = stochastic.k[stochastic.k.length - 1][1];
//             const lastD = stochastic.d[stochastic.d.length - 1][1];
//             let strength = 0;
//             if (lastK < 20) strength = 2;
//             else if (lastK > 80) strength = -2;
//             else if (lastK > lastD) strength = 1;
//             else if (lastK < lastD) strength = -1;
            
//             signals.momentum.push({
//                 name: 'Stochastic',
//                 value: lastK,
//                 signal: strength,
//                 weight: 1.0,
//                 timeframe: 'short'
//             });
//         }
        
//         // Williams %R
//         const williams = this.calculateWilliams(prices);
//         if (williams.length > 0) {
//             const lastW = williams[williams.length - 1][1];
//             let strength = 0;
//             if (lastW < -80) strength = 2;
//             else if (lastW > -20) strength = -2;
            
//             signals.momentum.push({
//                 name: 'Williams %R',
//                 value: lastW,
//                 signal: strength,
//                 weight: 0.9,
//                 timeframe: 'short'
//             });
//         }
        
//         // MFI
//         const mfi = this.calculateMFI(prices);
//         if (mfi.length > 0) {
//             const lastMFI = mfi[mfi.length - 1][1];
//             let strength = 0;
//             if (lastMFI < 20) strength = 2;
//             else if (lastMFI > 80) strength = -2;
            
//             signals.momentum.push({
//                 name: 'MFI',
//                 value: lastMFI,
//                 signal: strength,
//                 weight: 1.1,
//                 timeframe: 'short'
//             });
//         }
        
//         // CCI
//         const cci = this.calculateCCI(prices);
//         if (cci.length > 0) {
//             const lastCCI = cci[cci.length - 1][1];
//             let strength = 0;
//             if (lastCCI < -100) strength = 2;
//             else if (lastCCI > 100) strength = -2;
            
//             signals.momentum.push({
//                 name: 'CCI',
//                 value: lastCCI,
//                 signal: strength,
//                 weight: 1.0,
//                 timeframe: 'short'
//             });
//         }
        
//         // Ultimate Oscillator
//         const ultimate = this.calculateUltimateOscillator(prices);
//         if (ultimate.length > 0) {
//             const lastUO = ultimate[ultimate.length - 1][1];
//             let strength = 0;
//             if (lastUO < 30) strength = 2;
//             else if (lastUO > 70) strength = -2;
            
//             signals.momentum.push({
//                 name: 'Ultimate Oscillator',
//                 value: lastUO,
//                 signal: strength,
//                 weight: 1.0,
//                 timeframe: 'medium'
//             });
//         }
        
//         // ROC
//         const roc = this.calculateROC(prices);
//         if (roc.length > 0) {
//             const lastROC = roc[roc.length - 1][1];
//             let strength = 0;
//             if (lastROC > 5) strength = 2;
//             else if (lastROC > 2) strength = 1;
//             else if (lastROC < -5) strength = -2;
//             else if (lastROC < -2) strength = -1;
            
//             signals.momentum.push({
//                 name: 'ROC',
//                 value: lastROC,
//                 signal: strength,
//                 weight: 1.0,
//                 timeframe: 'short'
//             });
//         }
        
//         // === TREND INDICATORS ===
        
//         // MACD
//         const macd = this.calculateMACD(prices);
//         if (macd.histogram.length > 0) {
//             const lastHist = macd.histogram[macd.histogram.length - 1][1];
//             const prevHist = macd.histogram[macd.histogram.length - 2]?.[1] || 0;
//             let strength = 0;
            
//             if (lastHist > 0 && prevHist <= 0) strength = 2; // Bullish crossover
//             else if (lastHist < 0 && prevHist >= 0) strength = -2; // Bearish crossover
//             else if (lastHist > 0) strength = 1;
//             else if (lastHist < 0) strength = -1;
            
//             signals.trend.push({
//                 name: 'MACD',
//                 value: lastHist,
//                 signal: strength,
//                 weight: 1.5,
//                 timeframe: 'medium'
//             });
//         }
        
//         // ADX
//         const adxData = this.calculateADX(prices);
//         if (adxData.adx.length > 0) {
//             const lastADX = adxData.adx[adxData.adx.length - 1][1];
//             const lastPlusDI = adxData.plusDI[adxData.plusDI.length - 1][1];
//             const lastMinusDI = adxData.minusDI[adxData.minusDI.length - 1][1];
            
//             let strength = 0;
//             if (lastADX > 25) {
//                 if (lastPlusDI > lastMinusDI) strength = 2;
//                 else strength = -2;
//             } else if (lastADX > 20) {
//                 if (lastPlusDI > lastMinusDI) strength = 1;
//                 else strength = -1;
//             }
            
//             signals.trend.push({
//                 name: 'ADX',
//                 value: lastADX,
//                 signal: strength,
//                 weight: 1.3,
//                 timeframe: 'medium'
//             });
//         }
        
//         // Aroon
//         const aroon = this.calculateAroon(prices);
//         if (aroon.up.length > 0) {
//             const lastUp = aroon.up[aroon.up.length - 1][1];
//             const lastDown = aroon.down[aroon.down.length - 1][1];
            
//             let strength = 0;
//             if (lastUp > 70 && lastDown < 30) strength = 2;
//             else if (lastDown > 70 && lastUp < 30) strength = -2;
//             else if (lastUp > lastDown) strength = 1;
//             else strength = -1;
            
//             signals.trend.push({
//                 name: 'Aroon',
//                 value: lastUp - lastDown,
//                 signal: strength,
//                 weight: 1.1,
//                 timeframe: 'medium'
//             });
//         }
        
//         // Moving Averages
//         const mas = this.calculateMultipleMovingAverages(prices);
//         if (mas.sma20.length > 0 && mas.sma50.length > 0) {
//             const currentPrice = prices[prices.length - 1].close;
//             const lastSMA20 = mas.sma20[mas.sma20.length - 1][1];
//             const lastSMA50 = mas.sma50[mas.sma50.length - 1][1];
//             const lastSMA200 = mas.sma200.length > 0 ? mas.sma200[mas.sma200.length - 1][1] : null;
            
//             let strength = 0;
            
//             // Golden Cross / Death Cross
//             const prevSMA50 = mas.sma50[mas.sma50.length - 2]?.[1];
//             const prevSMA200 = mas.sma200.length > 1 ? mas.sma200[mas.sma200.length - 2][1] : null;
            
//             if (lastSMA200 && prevSMA200) {
//                 if (lastSMA50 > lastSMA200 && prevSMA50 <= prevSMA200) strength = 3; // Golden Cross
//                 else if (lastSMA50 < lastSMA200 && prevSMA50 >= prevSMA200) strength = -3; // Death Cross
//             }
            
//             if (strength === 0) {
//                 if (currentPrice > lastSMA20 && lastSMA20 > lastSMA50) strength = 2;
//                 else if (currentPrice < lastSMA20 && lastSMA20 < lastSMA50) strength = -2;
//                 else if (currentPrice > lastSMA20) strength = 1;
//                 else strength = -1;
//             }
            
//             signals.trend.push({
//                 name: 'Moving Averages',
//                 value: currentPrice - lastSMA20,
//                 signal: strength,
//                 weight: 1.4,
//                 timeframe: 'long'
//             });
//         }
        
//         // Parabolic SAR
//         const sar = this.calculateSAR(prices);
//         if (sar.length > 0) {
//             const currentPrice = prices[prices.length - 1].close;
//             const lastSAR = sar[sar.length - 1][1];
            
//             const strength = currentPrice > lastSAR ? 1 : -1;
            
//             signals.trend.push({
//                 name: 'Parabolic SAR',
//                 value: currentPrice - lastSAR,
//                 signal: strength,
//                 weight: 1.0,
//                 timeframe: 'short'
//             });
//         }
        
//         // Ichimoku Cloud
//         const ichimoku = this.calculateIchimoku(prices);
//         if (ichimoku.spanA.length > 0 && ichimoku.spanB.length > 0) {
//             const currentPrice = prices[prices.length - 1].close;
//             const lastCloudTop = Math.max(
//                 ichimoku.spanA[ichimoku.spanA.length - 1]?.[1] || 0,
//                 ichimoku.spanB[ichimoku.spanB.length - 1]?.[1] || 0
//             );
//             const lastCloudBottom = Math.min(
//                 ichimoku.spanA[ichimoku.spanA.length - 1]?.[1] || Infinity,
//                 ichimoku.spanB[ichimoku.spanB.length - 1]?.[1] || Infinity
//             );
            
//             let strength = 0;
//             if (currentPrice > lastCloudTop) strength = 2;
//             else if (currentPrice < lastCloudBottom) strength = -2;
            
//             signals.trend.push({
//                 name: 'Ichimoku Cloud',
//                 value: currentPrice - (lastCloudTop + lastCloudBottom) / 2,
//                 signal: strength,
//                 weight: 1.3,
//                 timeframe: 'long'
//             });
//         }
        
//         // === VOLATILITY INDICATORS ===
        
//         // Bollinger Bands
//         const bollinger = this.calculateBollingerBands(prices);
//         if (bollinger.upper.length > 0) {
//             const currentPrice = prices[prices.length - 1].close;
//             const lastUpper = bollinger.upper[bollinger.upper.length - 1][1];
//             const lastMiddle = bollinger.middle[bollinger.middle.length - 1][1];
//             const lastLower = bollinger.lower[bollinger.lower.length - 1][1];
            
//             let strength = 0;
//             if (currentPrice < lastLower) strength = 2;
//             else if (currentPrice > lastUpper) strength = -2;
//             else if (currentPrice > lastMiddle) strength = 1;
//             else strength = -1;
            
//             const bandwidth = ((lastUpper - lastLower) / lastMiddle) * 100;
            
//             signals.volatility.push({
//                 name: 'Bollinger Bands',
//                 value: bandwidth,
//                 signal: strength,
//                 weight: 1.2,
//                 timeframe: 'short'
//             });
//         }
        
//         // Keltner Channels
//         const keltner = this.calculateKeltnerChannels(prices);
//         if (keltner.upper.length > 0) {
//             const currentPrice = prices[prices.length - 1].close;
//             const lastUpper = keltner.upper[keltner.upper.length - 1][1];
//             const lastMiddle = keltner.middle[keltner.middle.length - 1][1];
//             const lastLower = keltner.lower[keltner.lower.length - 1][1];
            
//             let strength = 0;
//             if (currentPrice < lastLower) strength = 2;
//             else if (currentPrice > lastUpper) strength = -1;
//             else if (currentPrice > lastMiddle) strength = 1;
//             else strength = -1;
            
//             signals.volatility.push({
//                 name: 'Keltner Channels',
//                 value: currentPrice - lastMiddle,
//                 signal: strength,
//                 weight: 1.0,
//                 timeframe: 'short'
//             });
//         }
        
//         // Donchian Channels
//         const donchian = this.calculateDonchianChannels(prices);
//         if (donchian.upper.length > 0) {
//             const currentPrice = prices[prices.length - 1].close;
//             const lastUpper = donchian.upper[donchian.upper.length - 1][1];
//             const lastLower = donchian.lower[donchian.lower.length - 1][1];
            
//             let strength = 0;
//             if (currentPrice >= lastUpper) strength = 2; // Breakout
//             else if (currentPrice <= lastLower) strength = -2; // Breakdown
            
//             signals.volatility.push({
//                 name: 'Donchian Channels',
//                 value: currentPrice - (lastUpper + lastLower) / 2,
//                 signal: strength,
//                 weight: 1.1,
//                 timeframe: 'medium'
//             });
//         }
        
//         // ATR
//         const atr = this.calculateATR(prices);
//         if (atr.length > 20) {
//             const lastATR = atr[atr.length - 1][1];
//             const avgATR = atr.slice(-20).reduce((sum, item) => sum + item[1], 0) / 20;
            
//             const volatilityLevel = lastATR / avgATR;
            
//             signals.volatility.push({
//                 name: 'ATR',
//                 value: lastATR,
//                 signal: 0, // Neutral indicator
//                 weight: 0.8,
//                 timeframe: 'short',
//                 metadata: { volatilityLevel }
//             });
//         }
        
//         // === VOLUME INDICATORS ===
        
//         // OBV
//         const obv = this.calculateOBV(prices);
//         if (obv.length >= 20) {
//             const recentOBV = obv.slice(-20);
//             const obvChange = recentOBV[recentOBV.length - 1][1] - recentOBV[0][1];
//             const priceChange = prices[prices.length - 1].close - prices[prices.length - 20].close;
            
//             let strength = 0;
//             if (priceChange > 0 && obvChange > 0) strength = 2;
//             else if (priceChange < 0 && obvChange < 0) strength = -2;
//             else if (priceChange > 0 && obvChange < 0) strength = -1; // Bearish divergence
//             else if (priceChange < 0 && obvChange > 0) strength = 1; // Bullish divergence
            
//             signals.volume.push({
//                 name: 'OBV',
//                 value: obvChange,
//                 signal: strength,
//                 weight: 1.1,
//                 timeframe: 'medium'
//             });
//         }
        
//         // CMF
//         const cmf = this.calculateCMF(prices);
//         if (cmf.length > 0) {
//             const lastCMF = cmf[cmf.length - 1][1];
            
//             let strength = 0;
//             if (lastCMF > 0.05) strength = 2;
//             else if (lastCMF < -0.05) strength = -2;
//             else if (lastCMF > 0) strength = 1;
//             else strength = -1;
            
//             signals.volume.push({
//                 name: 'CMF',
//                 value: lastCMF,
//                 signal: strength,
//                 weight: 1.2,
//                 timeframe: 'medium'
//             });
//         }
        
//         // Volume Profile
//         const volumeProfile = this.calculateVolumeProfile(prices);
//         const currentPrice = prices[prices.length - 1].close;
//         const poc = volumeProfile.poc;
//         const vah = volumeProfile.valueAreaHigh;
//         const val = volumeProfile.valueAreaLow;
        
//         let vpStrength = 0;
//         if (currentPrice > vah) vpStrength = 1;
//         else if (currentPrice < val) vpStrength = -1;
        
//         signals.volume.push({
//             name: 'Volume Profile',
//             value: currentPrice - poc,
//             signal: vpStrength,
//             weight: 1.0,
//             timeframe: 'medium',
//             metadata: { poc, vah, val }
//         });
        
//         // === PRICE LEVEL INDICATORS ===
        
//         // VWAP
//         const vwap = this.calculateVWAP(prices);
//         if (vwap.vwap.length > 0) {
//             const lastVWAP = vwap.vwap[vwap.vwap.length - 1][1];
            
//             const strength = currentPrice > lastVWAP ? 1 : -1;
            
//             signals.price.push({
//                 name: 'VWAP',
//                 value: currentPrice - lastVWAP,
//                 signal: strength,
//                 weight: 1.1,
//                 timeframe: 'short'
//             });
//         }
        
//         // Support/Resistance
//         const srLevels = this.findSupportResistanceLevels(prices);
//         const nearestSupport = srLevels.support.length > 0 
//             ? srLevels.support.reduce((prev, curr) => 
//                 (Math.abs(curr - currentPrice) < Math.abs(prev - currentPrice) ? curr : prev))
//             : currentPrice * 0.95;
//         const nearestResistance = srLevels.resistance.length > 0
//             ? srLevels.resistance.reduce((prev, curr) => 
//                 (Math.abs(curr - currentPrice) < Math.abs(prev - currentPrice) ? curr : prev))
//             : currentPrice * 1.05;
        
//         signals.price.push({
//             name: 'Support/Resistance',
//             value: 0,
//             signal: 0,
//             weight: 1.0,
//             timeframe: 'long',
//             metadata: { 
//                 nearestSupport, 
//                 nearestResistance,
//                 distanceToSupport: ((currentPrice - nearestSupport) / currentPrice) * 100,
//                 distanceToResistance: ((nearestResistance - currentPrice) / currentPrice) * 100
//             }
//         });
        
//         // Fibonacci
//         const fibonacci = this.calculateFibonacci(prices);
//         const fib618 = fibonacci.levels.find(l => l.ratio === 0.618);
        
//         if (fib618) {
//             let fibSignal = 0;
//             if (currentPrice < fib618.price) fibSignal = 1; // Below golden ratio = support
//             else fibSignal = -1; // Above golden ratio = resistance
            
//             signals.price.push({
//                 name: 'Fibonacci 61.8%',
//                 value: currentPrice - fib618.price,
//                 signal: fibSignal,
//                 weight: 0.9,
//                 timeframe: 'long'
//             });
//         }
        
//         // === PATTERN INDICATORS ===
        
//         // Candlestick Patterns
//         const patterns = this.findCandlestickPatterns(prices);
//         const recentPatterns = patterns.slice(-5);
        
//         const patternScore = recentPatterns.reduce((score, p) => {
//             let value = 0;
//             if (p.signal === 'bullish') {
//                 if (p.strength === 'very strong') value = 3;
//                 else if (p.strength === 'strong') value = 2;
//                 else value = 1;
//             } else if (p.signal === 'bearish') {
//                 if (p.strength === 'very strong') value = -3;
//                 else if (p.strength === 'strong') value = -2;
//                 else value = -1;
//             }
//             return score + value;
//         }, 0);
        
//         if (recentPatterns.length > 0) {
//             signals.patterns.push({
//                 name: 'Candlestick Patterns',
//                 value: recentPatterns.length,
//                 signal: Math.sign(patternScore),
//                 weight: 1.0,
//                 timeframe: 'short',
//                 metadata: { patterns: recentPatterns, score: patternScore }
//             });
//         }
        
//         // Divergences
//         // ✅ Réutilise le 'rsi' déjà calculé au début de collectAllTechnicalSignals()
//         const macdDataForDiv = this.calculateMACD(prices);
//         const divergences = this.findDivergences(prices, rsi, macdDataForDiv);
        
//         if (divergences.length > 0) {
//             const divSignal = divergences[0].signal === 'bullish' ? 2 : -2;
            
//             signals.patterns.push({
//                 name: 'Divergences',
//                 value: divergences.length,
//                 signal: divSignal,
//                 weight: 1.3,
//                 timeframe: 'medium',
//                 metadata: { divergences }
//             });
//         }
        
//         // Linear Regression
//         const regression = this.calculateLinearRegression(prices);
//         const slope = regression.slope;
        
//         let trendStrength = 0;
//         if (Math.abs(slope) > 1) trendStrength = slope > 0 ? 2 : -2;
//         else if (Math.abs(slope) > 0.3) trendStrength = slope > 0 ? 1 : -1;
        
//         signals.trend.push({
//             name: 'Linear Regression',
//             value: slope,
//             signal: trendStrength,
//             weight: 1.2,
//             timeframe: 'long'
//         });
        
//         // Elder Ray
//         const elderRay = this.calculateElderRay(prices);
//         if (elderRay.bullPower.length > 0) {
//             const lastBull = elderRay.bullPower[elderRay.bullPower.length - 1][1];
//             const lastBear = elderRay.bearPower[elderRay.bearPower.length - 1][1];
            
//             let strength = 0;
//             if (lastBull > 0 && lastBear > 0) strength = 2;
//             else if (lastBull < 0 && lastBear < 0) strength = -2;
            
//             signals.trend.push({
//                 name: 'Elder Ray',
//                 value: lastBull - lastBear,
//                 signal: strength,
//                 weight: 1.0,
//                 timeframe: 'medium'
//             });
//         }
        
//         return signals;
//     },

//     // ============================================
//     // 🎯 AI CONFIDENCE SCORE CALCULATION
//     // Algorithme sophistiqué de scoring multi-facteurs
//     // ============================================

//     calculateAIConfidenceScore(signals) {
//         let totalScore = 0;
//         let totalWeight = 0;
        
//         let bullishSignals = 0;
//         let neutralSignals = 0;
//         let bearishSignals = 0;
        
//         // Parcourir toutes les catégories de signaux
//         Object.values(signals).forEach(category => {
//             category.forEach(indicator => {
//                 const weightedSignal = indicator.signal * indicator.weight;
//                 totalScore += weightedSignal;
//                 totalWeight += Math.abs(indicator.weight);
                
//                 if (indicator.signal > 0) bullishSignals++;
//                 else if (indicator.signal < 0) bearishSignals++;
//                 else neutralSignals++;
//             });
//         });
        
//         // Normaliser le score entre 0 et 100
//         const normalizedScore = ((totalScore / totalWeight) + 1) * 50;
//         const finalScore = Math.max(0, Math.min(100, normalizedScore));
        
//         // Déterminer le rating
//         let rating = '';
//         if (finalScore >= 85) rating = 'EXTREMELY BULLISH';
//         else if (finalScore >= 70) rating = 'VERY BULLISH';
//         else if (finalScore >= 60) rating = 'BULLISH';
//         else if (finalScore >= 55) rating = 'MODERATELY BULLISH';
//         else if (finalScore >= 45) rating = 'NEUTRAL';
//         else if (finalScore >= 40) rating = 'MODERATELY BEARISH';
//         else if (finalScore >= 30) rating = 'BEARISH';
//         else if (finalScore >= 15) rating = 'VERY BEARISH';
//         else rating = 'EXTREMELY BEARISH';
        
//         return {
//             score: finalScore,
//             rating,
//             bullishSignals,
//             neutralSignals,
//             bearishSignals,
//             totalIndicators: bullishSignals + neutralSignals + bearishSignals
//         };
//     },

//     // ============================================
//     // 📈 MULTI-HORIZON RECOMMENDATIONS
//     // Différenciation Short/Medium/Long Term
//     // ============================================

//     generateHorizonRecommendations(prices, currentPrice, signals, aiScore) {
//         const horizons = {
//             '1y': this.generateHorizonRecommendation(prices, currentPrice, signals, 'short', 1, aiScore),
//             '2y': this.generateHorizonRecommendation(prices, currentPrice, signals, 'medium', 2, aiScore),
//             '5y': this.generateHorizonRecommendation(prices, currentPrice, signals, 'long', 5, aiScore),
//             '10y': this.generateHorizonRecommendation(prices, currentPrice, signals, 'strategic', 10, aiScore)
//         };
        
//         return horizons;
//     },

//     generateHorizonRecommendation(prices, currentPrice, signals, timeframe, years, aiScore) {
//         // Filtrer les signaux pertinents pour cet horizon
//         const relevantSignals = this.filterSignalsByTimeframe(signals, timeframe);
        
//         // Calculer le score pondéré pour cet horizon
//         let horizonScore = 0;
//         let totalWeight = 0;
        
//         Object.values(relevantSignals).forEach(category => {
//             category.forEach(indicator => {
//                 horizonScore += indicator.signal * indicator.weight;
//                 totalWeight += Math.abs(indicator.weight);
//             });
//         });
        
//         const normalizedHorizonScore = ((horizonScore / totalWeight) + 1) * 50;
        
//         // Déterminer la recommandation
//         let recommendation = '';
//         let confidence = 0;
        
//         if (normalizedHorizonScore >= 70) {
//             recommendation = 'STRONG BUY';
//             confidence = Math.min(95, 70 + (normalizedHorizonScore - 70) * 0.8);
//         } else if (normalizedHorizonScore >= 60) {
//             recommendation = 'BUY';
//             confidence = 60 + (normalizedHorizonScore - 60);
//         } else if (normalizedHorizonScore >= 55) {
//             recommendation = 'ACCUMULATE';
//             confidence = 55 + (normalizedHorizonScore - 55);
//         } else if (normalizedHorizonScore >= 45) {
//             recommendation = 'HOLD';
//             confidence = 45 + Math.abs(normalizedHorizonScore - 50) * 0.5;
//         } else if (normalizedHorizonScore >= 40) {
//             recommendation = 'REDUCE';
//             confidence = 40 + (45 - normalizedHorizonScore);
//         } else if (normalizedHorizonScore >= 30) {
//             recommendation = 'SELL';
//             confidence = 50 + (40 - normalizedHorizonScore);
//         } else {
//             recommendation = 'STRONG SELL';
//             confidence = Math.min(95, 60 + (30 - normalizedHorizonScore) * 0.8);
//         }
        
//         // Calculer le prix cible
//         const targetPrice = this.calculateTargetPrice(prices, currentPrice, normalizedHorizonScore, years, signals);
        
//         // Calculer l'upside/downside
//         const upside = ((targetPrice - currentPrice) / currentPrice) * 100;
        
//         // Identifier les drivers clés
//         const drivers = this.identifyKeyDrivers(relevantSignals, timeframe, years);
        
//         return {
//             recommendation,
//             confidence: Math.round(confidence),
//             targetPrice,
//             upside,
//             drivers,
//             score: normalizedHorizonScore
//         };
//     },

//     filterSignalsByTimeframe(signals, timeframe) {
//         const filtered = {
//             momentum: [],
//             trend: [],
//             volatility: [],
//             volume: [],
//             price: [],
//             patterns: []
//         };
        
//         const timeframeMap = {
//             'short': ['short'],
//             'medium': ['short', 'medium'],
//             'long': ['short', 'medium', 'long'],
//             'strategic': ['medium', 'long']
//         };
        
//         const relevantTimeframes = timeframeMap[timeframe] || ['short', 'medium', 'long'];
        
//         Object.entries(signals).forEach(([category, indicators]) => {
//             filtered[category] = indicators.filter(ind => 
//                 relevantTimeframes.includes(ind.timeframe)
//             );
//         });
        
//         return filtered;
//     },

//     // ============================================
//     // 💰 TARGET PRICE CALCULATION
//     // Méthodologie quantitative multi-facteurs
//     // ============================================

//     calculateTargetPrice(prices, currentPrice, score, years, signals) {
//         // Méthode 1 : Basée sur le momentum historique
//         const historicalGrowth = this.calculateHistoricalGrowth(prices);
//         const momentumAdjusted = historicalGrowth * (score / 50); // Ajusté par le score
        
//         // Méthode 2 : Basée sur la volatilité (ATR)
//         const atr = this.calculateATR(prices);
//         const avgATR = atr.length > 20 
//             ? atr.slice(-20).reduce((sum, item) => sum + item[1], 0) / 20
//             : currentPrice * 0.02;
        
//         const volatilityTarget = currentPrice + (avgATR * years * 252 * (score - 50) / 100);
        
//         // Méthode 3 : Basée sur la régression linéaire
//         const regression = this.calculateLinearRegression(prices);
//         const regressionTarget = currentPrice + (regression.slope * years * 252);
        
//         // Méthode 4 : Basée sur les niveaux de support/résistance
//         const srSignal = signals.price.find(s => s.name === 'Support/Resistance');
//         let srTarget = currentPrice;
        
//         if (srSignal && srSignal.metadata) {
//             if (score > 50) {
//                 srTarget = srSignal.metadata.nearestResistance * (1 + (years * 0.1));
//             } else {
//                 srTarget = srSignal.metadata.nearestSupport * (1 - (years * 0.05));
//             }
//         }
        
//         // Méthode 5 : Basée sur le Volume Profile POC
//         const vpSignal = signals.volume.find(s => s.name === 'Volume Profile');
//         let vpTarget = currentPrice;
        
//         if (vpSignal && vpSignal.metadata) {
//             const poc = vpSignal.metadata.poc;
//             if (score > 50) {
//                 vpTarget = Math.max(currentPrice, vpSignal.metadata.vah) * (1 + (years * 0.08));
//             } else {
//                 vpTarget = Math.min(currentPrice, vpSignal.metadata.val) * (1 - (years * 0.06));
//             }
//         }
        
//         // Combinaison pondérée des 5 méthodes
//         const weights = {
//             momentum: 0.25,
//             volatility: 0.20,
//             regression: 0.25,
//             sr: 0.15,
//             vp: 0.15
//         };
        
//         const combinedTarget = 
//             (momentumAdjusted * weights.momentum) +
//             (volatilityTarget * weights.volatility) +
//             (regressionTarget * weights.regression) +
//             (srTarget * weights.sr) +
//             (vpTarget * weights.vp);
        
//         // Appliquer une marge de sécurité conservative
//         const conservativeAdjustment = score > 50 ? 0.95 : 1.05;
        
//         return combinedTarget * conservativeAdjustment;
//     },

//     calculateHistoricalGrowth(prices) {
//         if (prices.length < 2) return 0;
        
//         const startPrice = prices[0].close;
//         const endPrice = prices[prices.length - 1].close;
//         const days = prices.length;
        
//         const totalReturn = (endPrice - startPrice) / startPrice;
//         const annualizedReturn = Math.pow(1 + totalReturn, 365 / days) - 1;
        
//         return prices[0].close * (1 + annualizedReturn);
//     },

//     // ============================================
//     // 🔑 KEY DRIVERS IDENTIFICATION
//     // Identification des facteurs clés par horizon
//     // ============================================

//     identifyKeyDrivers(signals, timeframe, years) {
//         const drivers = [];
        
//         // Collecter tous les signaux avec leur force
//         const allSignals = [];
//         Object.entries(signals).forEach(([category, indicators]) => {
//             indicators.forEach(ind => {
//                 allSignals.push({
//                     category,
//                     name: ind.name,
//                     signal: ind.signal,
//                     weight: ind.weight,
//                     strength: Math.abs(ind.signal * ind.weight)
//                 });
//             });
//         });
        
//         // Trier par force décroissante
//         allSignals.sort((a, b) => b.strength - a.strength);
        
//         // Sélectionner les 3-5 drivers les plus importants
//         const topDrivers = allSignals.slice(0, timeframe === 'short' ? 3 : 5);
        
//         topDrivers.forEach(driver => {
//             let description = '';
            
//             // Générer une description professionnelle
//             if (driver.signal > 0) {
//                 if (driver.category === 'momentum') {
//                     description = `Positive momentum confirmed by ${driver.name}`;
//                 } else if (driver.category === 'trend') {
//                     description = `Uptrend validated by ${driver.name}`;
//                 } else if (driver.category === 'volume') {
//                     description = `Strong accumulation detected via ${driver.name}`;
//                 } else if (driver.category === 'price') {
//                     description = `Price above key ${driver.name} level`;
//                 } else {
//                     description = `Bullish ${driver.name} signal`;
//                 }
//             } else if (driver.signal < 0) {
//                 if (driver.category === 'momentum') {
//                     description = `Negative momentum indicated by ${driver.name}`;
//                 } else if (driver.category === 'trend') {
//                     description = `Downtrend confirmed by ${driver.name}`;
//                 } else if (driver.category === 'volume') {
//                     description = `Distribution phase detected via ${driver.name}`;
//                 } else if (driver.category === 'price') {
//                     description = `Price below key ${driver.name} level`;
//                 } else {
//                     description = `Bearish ${driver.name} signal`;
//                 }
//             }
            
//             drivers.push(description);
//         });
        
//         // Ajouter des drivers spécifiques à l'horizon temporel
//         if (timeframe === 'strategic' && years >= 10) {
//             drivers.push('Long-term secular trend analysis');
//             drivers.push('Macro-economic positioning');
//         } else if (timeframe === 'long' && years >= 5) {
//             drivers.push('Multi-year trend structure');
//         }
        
//         return drivers;
//     },

//     // ============================================
//     // ⚖ RISK/REWARD ANALYSIS
//     // Analyse professionnelle des risques et opportunités
//     // ============================================

//     analyzeRiskReward(prices, signals) {
//         const currentPrice = prices[prices.length - 1].close;
        
//         // === RISK ASSESSMENT ===
//         const riskFactors = [];
//         let riskLevel = 'MODERATE';
//         let riskScore = 50;
        
//         // 1. Volatility Risk (ATR)
//         const atr = this.calculateATR(prices);
//         if (atr.length > 20) {
//             const lastATR = atr[atr.length - 1][1];
//             const avgATR = atr.slice(-20).reduce((sum, item) => sum + item[1], 0) / 20;
//             const volatilityRatio = lastATR / avgATR;
            
//             if (volatilityRatio > 1.5) {
//                 riskFactors.push({
//                     factor: 'High Volatility',
//                     description: `Current volatility ${((volatilityRatio - 1) * 100).toFixed(0)}% above average`,
//                     severity: 'high',
//                     impact: 15
//                 });
//                 riskScore += 15;
//             } else if (volatilityRatio < 0.7) {
//                 riskFactors.push({
//                     factor: 'Low Volatility',
//                     description: 'Volatility compression may lead to sharp moves',
//                     severity: 'medium',
//                     impact: 5
//                 });
//                 riskScore += 5;
//             }
//         }
        
//         // 2. Trend Weakness Risk
//         const adxData = this.calculateADX(prices);
//         if (adxData.adx.length > 0) {
//             const lastADX = adxData.adx[adxData.adx.length - 1][1];
            
//             if (lastADX < 20) {
//                 riskFactors.push({
//                     factor: 'Weak Trend',
//                     description: `ADX at ${lastADX.toFixed(1)} indicates ranging market`,
//                     severity: 'medium',
//                     impact: 10
//                 });
//                 riskScore += 10;
//             }
//         }
        
//         // 3. Overbought/Oversold Risk
//         const rsi = this.calculateRSI(prices);
//         if (rsi.length > 0) {
//             const lastRSI = rsi[rsi.length - 1][1];
            
//             if (lastRSI > 75) {
//                 riskFactors.push({
//                     factor: 'Extreme Overbought',
//                     description: `RSI at ${lastRSI.toFixed(1)} signals potential reversal`,
//                     severity: 'high',
//                     impact: 15
//                 });
//                 riskScore += 15;
//             } else if (lastRSI < 25) {
//                 riskFactors.push({
//                     factor: 'Extreme Oversold',
//                     description: `RSI at ${lastRSI.toFixed(1)} signals capitulation risk`,
//                     severity: 'high',
//                     impact: 15
//                 });
//                 riskScore += 15;
//             }
//         }
        
//         // 4. Divergence Risk
//         const macdData = this.calculateMACD(prices);
//         const divergences = this.findDivergences(prices, rsi, macdData);
        
//         if (divergences.length > 0) {
//             const divType = divergences[0].signal === 'bullish' ? 'Bullish' : 'Bearish';
//             riskFactors.push({
//                 factor: `${divType} Divergence Detected`,
//                 description: divergences[0].description,
//                 severity: 'medium',
//                 impact: 10
//             });
//             riskScore += 10;
//         }
        
//         // 5. Support/Resistance Proximity Risk
//         const srSignal = signals.price.find(s => s.name === 'Support/Resistance');
//         if (srSignal && srSignal.metadata) {
//             const distToSupport = srSignal.metadata.distanceToSupport;
//             const distToResistance = srSignal.metadata.distanceToResistance;
            
//             if (distToSupport < 2) {
//                 riskFactors.push({
//                     factor: 'Near Support Level',
//                     description: `Price only ${distToSupport.toFixed(1)}% above key support`,
//                     severity: 'high',
//                     impact: 12
//                 });
//                 riskScore += 12;
//             }
            
//             if (distToResistance < 2) {
//                 riskFactors.push({
//                     factor: 'Near Resistance Level',
//                     description: `Price only ${distToResistance.toFixed(1)}% below key resistance`,
//                     severity: 'medium',
//                     impact: 8
//                 });
//                 riskScore += 8;
//             }
//         }
        
//         // 6. Volume Concern
//         const obvSignals = signals.volume.filter(s => s.name === 'OBV' || s.name === 'CMF');
//         const negativeVolumeSignals = obvSignals.filter(s => s.signal < 0).length;
        
//         if (negativeVolumeSignals >= 2) {
//             riskFactors.push({
//                 factor: 'Weak Volume Support',
//                 description: 'Multiple volume indicators show distribution',
//                 severity: 'medium',
//                 impact: 10
//             });
//             riskScore += 10;
//         }
        
//         // 7. Multiple Bearish Indicators
//         const bearishMomentum = signals.momentum.filter(s => s.signal < 0).length;
//         const bearishTrend = signals.trend.filter(s => s.signal < 0).length;
        
//         if (bearishMomentum >= 4 || bearishTrend >= 4) {
//             riskFactors.push({
//                 factor: 'Multiple Bearish Signals',
//                 description: `${bearishMomentum + bearishTrend} negative technical indicators`,
//                 severity: 'high',
//                 impact: 15
//             });
//             riskScore += 15;
//         }
        
//         // Déterminer le niveau de risque global
//         if (riskScore >= 75) {
//             riskLevel = 'VERY HIGH';
//         } else if (riskScore >= 65) {
//             riskLevel = 'HIGH';
//         } else if (riskScore >= 55) {
//             riskLevel = 'ELEVATED';
//         } else if (riskScore >= 45) {
//             riskLevel = 'MODERATE';
//         } else if (riskScore >= 35) {
//             riskLevel = 'LOW';
//         } else {
//             riskLevel = 'VERY LOW';
//         }
        
//         // === REWARD ASSESSMENT ===
//         const rewardFactors = [];
//         let rewardLevel = 'MODERATE';
//         let rewardScore = 50;
        
//         // 1. Strong Uptrend Opportunity
//         const bullishTrend = signals.trend.filter(s => s.signal > 0).length;
//         if (bullishTrend >= 5) {
//             rewardFactors.push({
//                 factor: 'Strong Uptrend Confirmed',
//                 description: `${bullishTrend} trend indicators show bullish alignment`,
//                 potential: 'high',
//                 impact: 20
//             });
//             rewardScore += 20;
//         }
        
//         // 2. Oversold Bounce Potential
//         if (rsi.length > 0) {
//             const lastRSI = rsi[rsi.length - 1][1];
//             if (lastRSI < 35) {
//                 rewardFactors.push({
//                     factor: 'Oversold Reversal Setup',
//                     description: `RSI at ${lastRSI.toFixed(1)} presents mean-reversion opportunity`,
//                     potential: 'high',
//                     impact: 18
//                 });
//                 rewardScore += 18;
//             }
//         }
        
//         // 3. Breakout Potential
//         const donchian = this.calculateDonchianChannels(prices);
//         if (donchian.upper.length > 0) {
//             const lastUpper = donchian.upper[donchian.upper.length - 1][1];
//             const distanceToBreakout = ((lastUpper - currentPrice) / currentPrice) * 100;
            
//             if (distanceToBreakout < 3 && distanceToBreakout > 0) {
//                 rewardFactors.push({
//                     factor: 'Breakout Proximity',
//                     description: `Price ${distanceToBreakout.toFixed(1)}% from 20-period high breakout`,
//                     potential: 'very high',
//                     impact: 25
//                 });
//                 rewardScore += 25;
//             }
//         }
        
//         // 4. Golden Cross / Bullish MA Alignment
//         const mas = this.calculateMultipleMovingAverages(prices);
//         if (mas.sma20.length > 0 && mas.sma50.length > 0 && mas.sma200.length > 1) {
//             const lastSMA50 = mas.sma50[mas.sma50.length - 1][1];
//             const lastSMA200 = mas.sma200[mas.sma200.length - 1][1];
//             const prevSMA50 = mas.sma50[mas.sma50.length - 2][1];
//             const prevSMA200 = mas.sma200[mas.sma200.length - 2][1];
            
//             // Golden Cross
//             if (lastSMA50 > lastSMA200 && prevSMA50 <= prevSMA200) {
//                 rewardFactors.push({
//                     factor: 'Golden Cross Formation',
//                     description: 'SMA50 crossed above SMA200 - Major bullish signal',
//                     potential: 'very high',
//                     impact: 30
//                 });
//                 rewardScore += 30;
//             }
            
//             // Bullish alignment
//             if (currentPrice > mas.sma20[mas.sma20.length - 1][1] &&
//                 mas.sma20[mas.sma20.length - 1][1] > lastSMA50 &&
//                 lastSMA50 > lastSMA200) {
//                 rewardFactors.push({
//                     factor: 'Perfect MA Alignment',
//                     description: 'All moving averages in bullish order',
//                     potential: 'high',
//                     impact: 20
//                 });
//                 rewardScore += 20;
//             }
//         }
        
//         // 5. Volume Accumulation
//         const cmfSignal = signals.volume.find(s => s.name === 'CMF');
//         if (cmfSignal && cmfSignal.value > 0.1) {
//             rewardFactors.push({
//                 factor: 'Strong Accumulation',
//                 description: `CMF at ${cmfSignal.value.toFixed(3)} shows institutional buying`,
//                 potential: 'high',
//                 impact: 18
//             });
//             rewardScore += 18;
//         }
        
//         // 6. Bullish Candlestick Patterns
//         const patterns = this.findCandlestickPatterns(prices);
//         const recentBullishPatterns = patterns.filter(p => 
//             p.signal === 'bullish' && 
//             (prices.length - 1 - p.index) < 5
//         );
        
//         if (recentBullishPatterns.length >= 2) {
//             rewardFactors.push({
//                 factor: 'Multiple Bullish Patterns',
//                 description: `${recentBullishPatterns.length} bullish reversal patterns detected`,
//                 potential: 'medium',
//                 impact: 15
//             });
//             rewardScore += 15;
//         }
        
//         // 7. Bullish Divergence
//         if (divergences.length > 0 && divergences[0].signal === 'bullish') {
//             rewardFactors.push({
//                 factor: 'Bullish Divergence',
//                 description: 'Price making lower lows while indicators strengthen',
//                 potential: 'high',
//                 impact: 20
//             });
//             rewardScore += 20;
//         }
        
//         // 8. Strong Momentum Confirmation
//         const bullishMomentum = signals.momentum.filter(s => s.signal > 0).length;
//         if (bullishMomentum >= 5) {
//             rewardFactors.push({
//                 factor: 'Momentum Convergence',
//                 description: `${bullishMomentum} momentum indicators confirm strength`,
//                 potential: 'high',
//                 impact: 18
//             });
//             rewardScore += 18;
//         }
        
//         // Déterminer le niveau de récompense global
//         if (rewardScore >= 85) {
//             rewardLevel = 'EXCEPTIONAL';
//         } else if (rewardScore >= 75) {
//             rewardLevel = 'VERY HIGH';
//         } else if (rewardScore >= 65) {
//             rewardLevel = 'HIGH';
//         } else if (rewardScore >= 55) {
//             rewardLevel = 'ATTRACTIVE';
//         } else if (rewardScore >= 45) {
//             rewardLevel = 'MODERATE';
//         } else if (rewardScore >= 35) {
//             rewardLevel = 'LOW';
//         } else {
//             rewardLevel = 'MINIMAL';
//         }
        
//         // Calculer le ratio Risk/Reward
//         const rrRatio = rewardScore / Math.max(riskScore, 1);
        
//         return {
//             risk: {
//                 level: riskLevel,
//                 score: Math.min(100, riskScore),
//                 factors: riskFactors
//             },
//             reward: {
//                 level: rewardLevel,
//                 score: Math.min(100, rewardScore),
//                 factors: rewardFactors
//             },
//             rrRatio: rrRatio.toFixed(2)
//         };
//     },

//     // ============================================
//     // 📋 PROFESSIONAL ANALYST SUMMARY
//     // Rapport de style Wall Street/Goldman Sachs
//     // ============================================

//     generateProfessionalSummary(aiScore, horizons, riskReward, signals) {
//         const currentDate = new Date().toLocaleDateString('en-US', {
//             year: 'numeric',
//             month: 'long',
//             day: 'numeric'
//         });
        
//         const symbol = this.currentSymbol;
//         const currentPrice = this.formatCurrency(this.stockData.prices[this.stockData.prices.length - 1].close);
        
//         // === EXECUTIVE SUMMARY ===
//         let executiveSummary = '';
        
//         if (aiScore.score >= 70) {
//             executiveSummary = `We maintain a BULLISH outlook on ${symbol} with an AI Confidence Score of ${aiScore.score.toFixed(0)}/100. `;
//             executiveSummary += `Our proprietary multi-indicator analysis, incorporating ${aiScore.totalIndicators} technical signals, `;
//             executiveSummary += `suggests strong upside potential across multiple time horizons. `;
//         } else if (aiScore.score >= 55) {
//             executiveSummary = `We adopt a MODERATELY BULLISH stance on ${symbol} with an AI Confidence Score of ${aiScore.score.toFixed(0)}/100. `;
//             executiveSummary += `Technical indicators show constructive setup with ${aiScore.bullishSignals} bullish signals, `;
//             executiveSummary += `though some caution is warranted given ${aiScore.bearishSignals} contrary indicators. `;
//         } else if (aiScore.score >= 45) {
//             executiveSummary = `We recommend a NEUTRAL/HOLD position on ${symbol} with an AI Confidence Score of ${aiScore.score.toFixed(0)}/100. `;
//             executiveSummary += `The technical picture remains mixed with balanced signals (${aiScore.bullishSignals} bullish vs ${aiScore.bearishSignals} bearish). `;
//             executiveSummary += `We advise waiting for clearer directional conviction before initiating new positions. `;
//         } else if (aiScore.score >= 30) {
//             executiveSummary = `We maintain a BEARISH view on ${symbol} with an AI Confidence Score of ${aiScore.score.toFixed(0)}/100. `;
//             executiveSummary += `Our technical analysis reveals ${aiScore.bearishSignals} negative signals across momentum, trend, and volume indicators. `;
//             executiveSummary += `We recommend defensive positioning or outright short exposure. `;
//         } else {
//             executiveSummary = `We hold a STRONGLY BEARISH outlook on ${symbol} with an AI Confidence Score of ${aiScore.score.toFixed(0)}/100. `;
//             executiveSummary += `Technical deterioration is evident across ${aiScore.totalIndicators} indicators. `;
//             executiveSummary += `We strongly recommend profit-taking or establishing short positions. `;
//         }
        
//         // === TECHNICAL THESIS ===
//         let technicalThesis = '';
        
//         // Trend Analysis
//         const trendSignals = signals.trend;
//         const bullishTrends = trendSignals.filter(s => s.signal > 0).length;
//         const bearishTrends = trendSignals.filter(s => s.signal < 0).length;
        
//         technicalThesis += `**Trend Structure:** `;
//         if (bullishTrends > bearishTrends) {
//             technicalThesis += `The primary trend remains intact with ${bullishTrends}/${trendSignals.length} trend indicators confirming upward bias. `;
            
//             const maSignal = trendSignals.find(s => s.name === 'Moving Averages');
//             if (maSignal && maSignal.signal >= 2) {
//                 technicalThesis += `Moving average alignment is particularly constructive. `;
//             }
            
//             const adxSignal = trendSignals.find(s => s.name === 'ADX');
//             if (adxSignal && adxSignal.value !== 'N/A' && parseFloat(adxSignal.value) > 25) {
//                 technicalThesis += `ADX above 25 confirms strong trend strength. `;
//             }
//         } else if (bearishTrends > bullishTrends) {
//             technicalThesis += `The trend structure has deteriorated with ${bearishTrends}/${trendSignals.length} indicators showing negative bias. `;
//             technicalThesis += `We advise respecting the downtrend until clear reversal signals emerge. `;
//         } else {
//             technicalThesis += `Trend indicators are mixed, suggesting a consolidation or transition phase. `;
//         }
        
//         // Momentum Analysis
//         const momentumSignals = signals.momentum;
//         const extremeOversold = momentumSignals.filter(s => s.signal >= 2).length;
//         const extremeOverbought = momentumSignals.filter(s => s.signal <= -2).length;
        
//         technicalThesis += `\n\n**Momentum Profile:** `;
//         if (extremeOversold >= 2) {
//             technicalThesis += `Multiple oscillators (${extremeOversold} indicators) show extreme oversold readings, `;
//             technicalThesis += `suggesting strong mean-reversion potential. `;
//         } else if (extremeOverbought >= 2) {
//             technicalThesis += `Momentum indicators (${extremeOverbought} readings) signal overbought conditions, `;
//             technicalThesis += `warranting caution on longs and consideration of profit-taking. `;
//         } else {
//             const bullishMomentum = momentumSignals.filter(s => s.signal > 0).length;
//             if (bullishMomentum > momentumSignals.length / 2) {
//                 technicalThesis += `Momentum remains constructive with ${bullishMomentum}/${momentumSignals.length} positive readings. `;
//             } else {
//                 technicalThesis += `Momentum has weakened, with mixed signals across oscillators. `;
//             }
//         }
        
//         // Volume Analysis
//         const volumeSignals = signals.volume;
//         const accumulation = volumeSignals.filter(s => s.signal > 0).length;
//         const distribution = volumeSignals.filter(s => s.signal < 0).length;
        
//         technicalThesis += `\n\n**Volume Dynamics:** `;
//         if (accumulation > distribution) {
//             technicalThesis += `Volume analysis confirms institutional accumulation, `;
            
//             const cmfSignal = volumeSignals.find(s => s.name === 'CMF');
//             if (cmfSignal && cmfSignal.value > 0.05) {
//                 technicalThesis += `with Chaikin Money Flow at +${cmfSignal.value.toFixed(3)} signaling strong buying pressure. `;
//             } else {
//                 technicalThesis += `supporting our constructive view. `;
//             }
//         } else if (distribution > accumulation) {
//             technicalThesis += `Volume patterns suggest distribution, with ${distribution}/${volumeSignals.length} indicators negative. `;
//             technicalThesis += `This raises concerns about demand sustainability. `;
//         } else {
//             technicalThesis += `Volume signals are balanced, providing no clear directional edge. `;
//         }
        
//         // === RISK CONSIDERATIONS ===
//         let riskSection = `**Risk Assessment (${riskReward.risk.level}):** `;
        
//         if (riskReward.risk.factors.length > 0) {
//             riskSection += `We identify ${riskReward.risk.factors.length} key risk factor(s): `;
//             riskReward.risk.factors.slice(0, 3).forEach((risk, idx) => {
//                 riskSection += `(${idx + 1}) ${risk.description}. `;
//             });
//         } else {
//             riskSection += `Risk profile appears benign with no major technical warning signals. `;
//         }
        
//         // === REWARD POTENTIAL ===
//         let rewardSection = `\n\n**Upside Catalysts (${riskReward.reward.level}):** `;
        
//         if (riskReward.reward.factors.length > 0) {
//             rewardSection += `We see ${riskReward.reward.factors.length} positive catalyst(s): `;
//             riskReward.reward.factors.slice(0, 3).forEach((reward, idx) => {
//                 rewardSection += `(${idx + 1}) ${reward.description}. `;
//             });
//         } else {
//             rewardSection += `Limited upside catalysts identified in current technical setup. `;
//         }
        
//         // === INVESTMENT HORIZON GUIDANCE ===
//         let horizonGuidance = `\n\n**Multi-Horizon Recommendations:**\n`;
        
//         horizonGuidance += `• **1-Year Target:** ${this.formatCurrency(horizons['1y'].targetPrice)} `;
//         horizonGuidance += `(${horizons['1y'].upside >= 0 ? '+' : ''}${horizons['1y'].upside.toFixed(1)}%) - `;
//         horizonGuidance += `**${horizons['1y'].recommendation}** (${horizons['1y'].confidence}% conviction)\n`;
        
//         horizonGuidance += `• **2-Year Target:** ${this.formatCurrency(horizons['2y'].targetPrice)} `;
//         horizonGuidance += `(${horizons['2y'].upside >= 0 ? '+' : ''}${horizons['2y'].upside.toFixed(1)}%) - `;
//         horizonGuidance += `**${horizons['2y'].recommendation}** (${horizons['2y'].confidence}% conviction)\n`;
        
//         horizonGuidance += `• **5-Year Target:** ${this.formatCurrency(horizons['5y'].targetPrice)} `;
//         horizonGuidance += `(${horizons['5y'].upside >= 0 ? '+' : ''}${horizons['5y'].upside.toFixed(1)}%) - `;
//         horizonGuidance += `**${horizons['5y'].recommendation}** (${horizons['5y'].confidence}% conviction)\n`;
        
//         horizonGuidance += `• **10-Year Target:** ${this.formatCurrency(horizons['10y'].targetPrice)} `;
//         horizonGuidance += `(${horizons['10y'].upside >= 0 ? '+' : ''}${horizons['10y'].upside.toFixed(1)}%) - `;
//         horizonGuidance += `**${horizons['10y'].recommendation}** (${horizons['10y'].confidence}% conviction)`;
        
//         // === CONCLUSION ===
//         let conclusion = `\n\n**Investment Conclusion:** `;
        
//         const avgUpside = (horizons['1y'].upside + horizons['2y'].upside + horizons['5y'].upside + horizons['10y'].upside) / 4;
//         const rrRatio = parseFloat(riskReward.rrRatio);
        
//         if (rrRatio > 2.0 && avgUpside > 15) {
//             conclusion += `${symbol} presents an ATTRACTIVE risk/reward profile (R/R: ${riskReward.rrRatio}x) `;
//             conclusion += `with significant upside potential across all time horizons. `;
//             conclusion += `We recommend INITIATING or ADDING to positions on weakness. `;
//         } else if (rrRatio > 1.5 && avgUpside > 5) {
//             conclusion += `${symbol} offers a FAVORABLE setup (R/R: ${riskReward.rrRatio}x) `;
//             conclusion += `suitable for patient investors with medium-term horizons. `;
//             conclusion += `We recommend ACCUMULATING on pullbacks to support levels. `;
//         } else if (rrRatio > 1.0) {
//             conclusion += `${symbol} shows BALANCED risk/reward (R/R: ${riskReward.rrRatio}x). `;
//             conclusion += `We recommend HOLDING existing positions while monitoring for improved entry points. `;
//         } else {
//             conclusion += `${symbol} exhibits UNFAVORABLE risk/reward (R/R: ${riskReward.rrRatio}x). `;
//             conclusion += `We recommend REDUCING exposure or EXITING positions. `;
//         }
        
//         // === ASSEMBLER LE RAPPORT COMPLET ===
//         const fullReport = `
//     **ALPHY AI INSTITUTIONAL RESEARCH**
//     **${symbol} - Technical Analysis Report**
//     **Date:** ${currentDate} | **Current Price:** ${currentPrice}
//     **AI Confidence Score:** ${aiScore.score.toFixed(0)}/100 (${aiScore.rating})

//     ---

//     **EXECUTIVE SUMMARY**

//     ${executiveSummary}

//     ---

//     **TECHNICAL ANALYSIS**

//     ${technicalThesis}

//     ---

//     **RISK/REWARD FRAMEWORK**

//     ${riskSection}

//     ${rewardSection}

//     **Risk/Reward Ratio:** ${riskReward.rrRatio}x

//     ---

//     **PRICE TARGETS & RECOMMENDATIONS**

//     ${horizonGuidance}

//     ---

//     ${conclusion}

//     ---

//     **Methodology Note:** This analysis synthesizes ${aiScore.totalIndicators} proprietary technical indicators across momentum, trend, volatility, volume, and price action dimensions. Our AI-powered engine weights signals by statistical significance and time horizon relevance to generate institutional-grade recommendations.

//     **Disclaimer:** This report is for informational purposes only and does not constitute investment advice. Technical analysis has inherent limitations. Past performance does not guarantee future results. Consult a licensed financial advisor before making investment decisions.
//         `.trim();
        
//         return fullReport;
//     },

//     // ============================================
//     // 🎨 UI DISPLAY FUNCTIONS
//     // Affichage professionnel des résultats
//     // ============================================

//     displayAIRecommendation(aiScore, signals) {
//         console.log('📊 Displaying AI Recommendation:', aiScore);
        
//         // AI Score Value
//         const scoreValueEl = document.getElementById('aiScoreValue');
//         if (scoreValueEl) {
//             scoreValueEl.textContent = aiScore.score.toFixed(0) + '/100';
//         }
        
//         // AI Score Rating
//         const ratingEl = document.getElementById('aiScoreRating');
//         if (ratingEl) {
//             ratingEl.textContent = aiScore.rating;
            
//             // Apply color class
//             let scoreClass = '';
//             if (aiScore.score >= 70) scoreClass = 'very-bullish';
//             else if (aiScore.score >= 60) scoreClass = 'bullish';
//             else if (aiScore.score >= 55) scoreClass = 'moderately-bullish';
//             else if (aiScore.score >= 45) scoreClass = 'neutral';
//             else if (aiScore.score >= 40) scoreClass = 'moderately-bearish';
//             else if (aiScore.score >= 30) scoreClass = 'bearish';
//             else scoreClass = 'very-bearish';
            
//             ratingEl.className = `ai-score-rating ${scoreClass}`;
            
//             // ✅ CORRECTION - AI Score Fill Bar (comme les confidence bars)
//             const fillBarContainer = document.getElementById('aiScoreFill');
//             if (fillBarContainer) {
//                 let fillEl = fillBarContainer.querySelector('.ai-score-fill');
                
//                 if (!fillEl) {
//                     fillBarContainer.innerHTML = `<div class="ai-score-fill"></div>`;
//                     fillEl = fillBarContainer.querySelector('.ai-score-fill');
//                 }
                
//                 if (fillEl) {
//                     fillEl.style.width = aiScore.score + '%';
//                     fillEl.className = `ai-score-fill ${scoreClass}`;
//                     console.log(`✅ AI Score fill: ${aiScore.score}% (class: ${scoreClass})`);
//                 }
//             }
//         }
        
//         // Signal Counts
//         const bullishEl = document.getElementById('bullishSignals');
//         const neutralEl = document.getElementById('neutralSignals');
//         const bearishEl = document.getElementById('bearishSignals');
        
//         if (bullishEl) bullishEl.textContent = aiScore.bullishSignals;
//         if (neutralEl) neutralEl.textContent = aiScore.neutralSignals;
//         if (bearishEl) bearishEl.textContent = aiScore.bearishSignals;
        
//         console.log('✅ AI Recommendation displayed successfully');
//     },

//     displayHorizonRecommendations(horizons, currentPrice) {
//         // 1 Year
//         this.displaySingleHorizon('1y', horizons['1y'], currentPrice);
        
//         // 2 Years
//         this.displaySingleHorizon('2y', horizons['2y'], currentPrice);
        
//         // 5 Years
//         this.displaySingleHorizon('5y', horizons['5y'], currentPrice);
        
//         // 10 Years
//         this.displaySingleHorizon('10y', horizons['10y'], currentPrice);
//     },

//     displaySingleHorizon(horizon, data, currentPrice) {
//         console.log(`📊 Displaying ${horizon} horizon:`, data);
        
//         // Recommendation Badge
//         const recEl = document.getElementById(`recommendation${horizon}`);
//         if (recEl) {
//             const recClass = this.getRecommendationClass(data.recommendation);
//             recEl.innerHTML = `<div class='ai-rec-badge ${recClass}'>${data.recommendation}</div>`;
//         }
        
//         // Target Price
//         const targetEl = document.getElementById(`target${horizon}`);
//         if (targetEl) {
//             targetEl.textContent = this.formatCurrency(data.targetPrice);
//         }
        
//         // Upside/Downside
//         const upsideEl = document.getElementById(`upside${horizon}`);
//         if (upsideEl) {
//             const upsideText = `${data.upside >= 0 ? '+' : ''}${data.upside.toFixed(1)}%`;
//             const upsideColor = data.upside >= 0 ? '#10b981' : '#ef4444';
//             upsideEl.innerHTML = `<span style="color: ${upsideColor}; font-weight: 700;">${upsideText}</span>`;
//         }
        
//         // ✅ CORRECTION - Confidence Bar (la partie problématique)
//         const confBarContainer = document.getElementById(`confidence${horizon}`);
//         if (confBarContainer) {
//             // S'assurer que la structure HTML existe
//             let confFill = confBarContainer.querySelector('.ai-confidence-fill');
            
//             if (!confFill) {
//                 // Si la barre n'existe pas, la créer
//                 confBarContainer.innerHTML = `<div class="ai-confidence-fill"></div>`;
//                 confFill = confBarContainer.querySelector('.ai-confidence-fill');
//             }
            
//             if (confFill) {
//                 const recClass = this.getRecommendationClass(data.recommendation);
                
//                 // Appliquer la largeur et la classe
//                 confFill.style.width = data.confidence + '%';
//                 confFill.className = `ai-confidence-fill ${recClass}`;
                
//                 console.log(`✅ Confidence bar ${horizon}: ${data.confidence}% (class: ${recClass})`);
//             } else {
//                 console.error(`❌ Failed to create confidence fill for ${horizon}`);
//             }
//         } else {
//             console.error(`❌ Confidence bar container not found: confidence${horizon}`);
//         }
        
//         // Key Drivers
//         const driversEl = document.getElementById(`drivers${horizon}`);
//         if (driversEl) {
//             driversEl.innerHTML = data.drivers.map(driver => 
//                 `<div class='ai-driver-item'><i class='fas fa-check-circle'></i> ${driver}</div>`
//             ).join('');
//         }
        
//         console.log(`✅ ${horizon} horizon displayed successfully`);
//     },

//     getRecommendationClass(recommendation) {
//         const map = {
//             'STRONG BUY': 'strong-buy',
//             'BUY': 'buy',
//             'ACCUMULATE': 'accumulate',
//             'HOLD': 'hold',
//             'REDUCE': 'reduce',
//             'SELL': 'sell',
//             'STRONG SELL': 'strong-sell'
//         };
        
//         return map[recommendation] || 'neutral';
//     },

//     displayRiskReward(riskReward) {
//         // Risk Level
//         const riskEl = document.getElementById('aiRiskLevel');
//         const riskClass = this.getRiskClass(riskReward.risk.level);
//         riskEl.innerHTML = `<div class='ai-risk-badge ${riskClass}'>${riskReward.risk.level} (${riskReward.risk.score}/100)</div>`;
        
//         // Risk Factors
//         const riskFactorsEl = document.getElementById('aiRiskFactors');
//         if (riskReward.risk.factors.length > 0) {
//             riskFactorsEl.innerHTML = riskReward.risk.factors.map(risk => {
//                 const icon = this.getSeverityIcon(risk.severity);
//                 return `
//                     <div class='ai-factor-item ${risk.severity}'>
//                         ${icon} <strong>${risk.factor}:</strong> ${risk.description}
//                     </div>
//                 `;
//             }).join('');
//         } else {
//             riskFactorsEl.innerHTML = `<div class='ai-factor-item low'><i class='fas fa-check-circle'></i> No significant risk factors identified</div>`;
//         }
        
//         // Reward Level
//         const rewardEl = document.getElementById('aiRewardLevel');
//         const rewardClass = this.getRewardClass(riskReward.reward.level);
//         rewardEl.innerHTML = `<div class='ai-reward-badge ${rewardClass}'>${riskReward.reward.level} (${riskReward.reward.score}/100)</div>`;
        
//         // Reward Factors
//         const rewardFactorsEl = document.getElementById('aiRewardFactors');
//         if (riskReward.reward.factors.length > 0) {
//             rewardFactorsEl.innerHTML = riskReward.reward.factors.map(reward => {
//                 const icon = this.getPotentialIcon(reward.potential);
//                 return `
//                     <div class='ai-factor-item ${reward.potential}'>
//                         ${icon} <strong>${reward.factor}:</strong> ${reward.description}
//                     </div>
//                 `;
//             }).join('');
//         } else {
//             rewardFactorsEl.innerHTML = `<div class='ai-factor-item low'><i class='fas fa-info-circle'></i> Limited upside catalysts at current levels</div>`;
//         }
//     },

//     getRiskClass(level) {
//         const map = {
//             'VERY HIGH': 'very-high-risk',
//             'HIGH': 'high-risk',
//             'ELEVATED': 'elevated-risk',
//             'MODERATE': 'moderate-risk',
//             'LOW': 'low-risk',
//             'VERY LOW': 'very-low-risk'
//         };
//         return map[level] || 'moderate-risk';
//     },

//     getRewardClass(level) {
//         const map = {
//             'EXCEPTIONAL': 'exceptional-reward',
//             'VERY HIGH': 'very-high-reward',
//             'HIGH': 'high-reward',
//             'ATTRACTIVE': 'attractive-reward',
//             'MODERATE': 'moderate-reward',
//             'LOW': 'low-reward',
//             'MINIMAL': 'minimal-reward'
//         };
//         return map[level] || 'moderate-reward';
//     },

//     getSeverityIcon(severity) {
//         const map = {
//             'high': '<i class="fas fa-exclamation-triangle" style="color: #ef4444;"></i>',
//             'medium': '<i class="fas fa-exclamation-circle" style="color: #f59e0b;"></i>',
//             'low': '<i class="fas fa-info-circle" style="color: #3b82f6;"></i>'
//         };
//         return map[severity] || '<i class="fas fa-info-circle"></i>';
//     },

//     getPotentialIcon(potential) {
//         const map = {
//             'very high': '<i class="fas fa-rocket" style="color: #10b981;"></i>',
//             'high': '<i class="fas fa-arrow-up" style="color: #10b981;"></i>',
//             'medium': '<i class="fas fa-arrow-right" style="color: #3b82f6;"></i>',
//             'low': '<i class="fas fa-minus" style="color: #6b7280;"></i>'
//         };
//         return map[potential] || '<i class="fas fa-arrow-up"></i>';
//     },

//     displayProfessionalSummary(summary) {
//         const summaryEl = document.getElementById('aiSummaryContent');
//         const dateEl = document.getElementById('aiSummaryDate');
        
//         // Update date
//         dateEl.textContent = new Date().toLocaleDateString('en-US', {
//             year: 'numeric',
//             month: 'long',
//             day: 'numeric'
//         });
        
//         // Convert markdown-style formatting to HTML
//         let htmlSummary = summary
//             .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
//             .replace(/\n\n/g, '</p><p>')
//             .replace(/\n/g, '<br>')
//             .replace(/^(.+)$/gm, '<p>$1</p>')
//             .replace(/<p><\/p>/g, '')
//             .replace(/---/g, '<hr style="margin: 20px 0; border: none; border-top: 2px solid rgba(0,0,0,0.1);">');
        
//         summaryEl.innerHTML = htmlSummary;
//     },
    
//     displayConsolidatedSignals(signals, signalPercentage) {
//         const gaugeValue = document.getElementById('gaugeValue');
//         const gaugeFill = document.getElementById('gaugeFill');
        
//         let signalText = '';
//         let signalClass = '';
        
//         if (signalPercentage >= 80) {
//             signalText = 'STRONG BUY';
//             signalClass = 'strong-buy';
//         } else if (signalPercentage >= 60) {
//             signalText = 'BUY';
//             signalClass = 'buy';
//         } else if (signalPercentage >= 40) {
//             signalText = 'NEUTRAL';
//             signalClass = 'neutral';
//         } else if (signalPercentage >= 20) {
//             signalText = 'SELL';
//             signalClass = 'sell';
//         } else {
//             signalText = 'STRONG SELL';
//             signalClass = 'strong-sell';
//         }
        
//         gaugeValue.textContent = signalText;
//         gaugeValue.className = `gauge-value ${signalClass}`;
//         gaugeFill.style.width = `${signalPercentage}%`;
        
//         const breakdown = document.getElementById('signalsBreakdown');
//         breakdown.innerHTML = signals.map(s => {
//             let badgeClass = 'neutral';
//             let badgeText = 'NEUTRAL';
            
//             if (s.signal > 0) {
//                 badgeClass = 'buy';
//                 badgeText = 'BUY';
//             } else if (s.signal < 0) {
//                 badgeClass = 'sell';
//                 badgeText = 'SELL';
//             }
            
//             return `
//                 <div class='signal-row'>
//                     <span class='signal-indicator-name'>${s.name}</span>
//                     <span class='signal-indicator-value'>${s.value}</span>
//                     <span class='signal-badge ${badgeClass}'>${badgeText}</span>
//                 </div>
//             `;
//         }).join('');
//     },
    
//     // ============================================
//     // UTILITY FUNCTIONS
//     // ============================================
    
//     generateDemoData(symbol) {
//         console.log('📊 Generating demo data for', symbol);
//         const days = 365;
//         const prices = [];
//         let price = 100;
        
//         for (let i = 0; i < days; i++) {
//             const change = (Math.random() - 0.5) * 4;
//             price = price * (1 + change / 100);
            
//             const timestamp = Date.now() - (days - i) * 24 * 60 * 60 * 1000;
//             prices.push({
//                 timestamp: timestamp,
//                 open: price * (1 + (Math.random() - 0.5) * 0.01),
//                 high: price * (1 + Math.random() * 0.02),
//                 low: price * (1 - Math.random() * 0.02),
//                 close: price,
//                 volume: Math.floor(Math.random() * 10000000)
//             });
//         }
        
//         return {
//             symbol: symbol,
//             prices: prices,
//             currency: 'USD',
//             quote: {
//                 name: symbol + ' Inc.',
//                 symbol: symbol,
//                 price: price,
//                 change: price - 100,
//                 percentChange: ((price - 100) / 100) * 100
//             }
//         };
//     },
    
//     formatCurrency(value) {
//         if (!value && value !== 0) return 'N/A';
//         return new Intl.NumberFormat('en-US', {
//             style: 'currency',
//             currency: this.stockData?.currency || 'USD',
//             minimumFractionDigits: 2,
//             maximumFractionDigits: 2
//         }).format(value);
//     },
    
//     showLoading(show) {
//         const loader = document.getElementById('loadingIndicator');
//         if (loader) {
//             if (show) {
//                 loader.classList.remove('hidden');
//             } else {
//                 loader.classList.add('hidden');
//             }
//         }
//     },
    
//     hideResults() {
//         document.getElementById('resultsPanel').classList.add('hidden');
//     },
    
//     updateLastUpdate() {
//         const now = new Date();
//         const formatted = now.toLocaleString('en-US', {
//             day: '2-digit',
//             month: '2-digit',
//             year: 'numeric',
//             hour: '2-digit',
//             minute: '2-digit'
//         });
        
//         const updateElement = document.getElementById('lastUpdate');
//         if (updateElement) {
//             updateElement.textContent = `Last update: ${formatted}`;
//         }
//     }
// };

// // ============================================
// // INITIALIZE ON DOM LOADED
// // ============================================

// document.addEventListener('DOMContentLoaded', () => {
//     console.log('🚀 Advanced Analysis - Wall Street Edition - Initializing...');
//     AdvancedAnalysis.init();
// });

// // ============================================
// // SIDEBAR USER MENU - Toggle
// // ============================================

// document.addEventListener('DOMContentLoaded', () => {
//     const sidebarUserTrigger = document.getElementById('sidebarUserTrigger');
//     const sidebarUserDropdown = document.getElementById('sidebarUserDropdown');
    
//     if (sidebarUserTrigger && sidebarUserDropdown) {
//         sidebarUserTrigger.addEventListener('click', (e) => {
//             e.stopPropagation();
            
//             sidebarUserTrigger.classList.toggle('active');
//             sidebarUserDropdown.classList.toggle('active');
//         });
        
//         document.addEventListener('click', (e) => {
//             if (!sidebarUserDropdown.contains(e.target) && 
//                 !sidebarUserTrigger.contains(e.target)) {
//                 sidebarUserTrigger.classList.remove('active');
//                 sidebarUserDropdown.classList.remove('active');
//             }
//         });
        
//         sidebarUserDropdown.addEventListener('click', (e) => {
//             e.stopPropagation();
//         });
//     }
// });

// console.log('✅ Advanced Analysis - Wall Street Edition - Script Loaded (40+ Indicators)');

/* ==============================================
   ADVANCED-ANALYSIS.JS - WALL STREET EDITION
   ✅ 40+ Technical Indicators
   ✅ Professional Pattern Recognition
   ✅ Automated Support/Resistance
   ❌ NO RAW PRICE DATA (License Compliant)
   ============================================== */

// ========== RATE LIMITER ==========
class RateLimiter {
    constructor(maxRequests = 8, windowMs = 60000) {
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
        this.queue = [];
        this.requestTimes = [];
        this.processing = false;
    }
    
    async execute(fn, priority = 'normal') {
        return new Promise((resolve, reject) => {
            this.queue.push({
                fn,
                priority,
                resolve,
                reject,
                timestamp: Date.now()
            });
            
            this.queue.sort((a, b) => {
                const priorities = { high: 3, normal: 2, low: 1 };
                return (priorities[b.priority] || 2) - (priorities[a.priority] || 2);
            });
            
            this.processQueue();
        });
    }
    
    async processQueue() {
        if (this.processing || this.queue.length === 0) return;
        
        this.processing = true;
        
        while (this.queue.length > 0) {
            const now = Date.now();
            this.requestTimes = this.requestTimes.filter(time => now - time < this.windowMs);
            
            if (this.requestTimes.length >= this.maxRequests) {
                const oldestRequest = Math.min(...this.requestTimes);
                const waitTime = this.windowMs - (now - oldestRequest) + 100;
                
                console.log(`⏳ Rate limit reached. Waiting ${Math.ceil(waitTime/1000)}s...`);
                
                if (window.cacheWidget) {
                    window.cacheWidget.updateQueueStatus(this.queue.length, waitTime);
                }
                
                await this.sleep(waitTime);
                continue;
            }
            
            const item = this.queue.shift();
            this.requestTimes.push(Date.now());
            
            try {
                const result = await item.fn();
                item.resolve(result);
            } catch (error) {
                item.reject(error);
            }
            
            await this.sleep(100);
        }
        
        this.processing = false;
        
        if (window.cacheWidget) {
            window.cacheWidget.updateQueueStatus(0, 0);
        }
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    getRemainingRequests() {
        const now = Date.now();
        this.requestTimes = this.requestTimes.filter(time => now - time < this.windowMs);
        return this.maxRequests - this.requestTimes.length;
    }
    
    getQueueLength() {
        return this.queue.length;
    }
}

// ========== OPTIMIZED CACHE ==========
class OptimizedCache {
    constructor() {
        this.prefix = 'aa_cache_';
        this.staticTTL = 24 * 60 * 60 * 1000;
        this.dynamicTTL = 5 * 60 * 1000;
    }
    
    set(key, data, ttl = null) {
        try {
            const cacheData = {
                data,
                timestamp: Date.now(),
                ttl: ttl || this.dynamicTTL
            };
            localStorage.setItem(this.prefix + key, JSON.stringify(cacheData));
            return true;
        } catch (error) {
            console.warn('Cache storage error:', error);
            return false;
        }
    }
    
    get(key) {
        try {
            const cached = localStorage.getItem(this.prefix + key);
            if (!cached) return null;
            
            const cacheData = JSON.parse(cached);
            const now = Date.now();
            
            if (now - cacheData.timestamp > cacheData.ttl) {
                this.delete(key);
                return null;
            }
            
            return cacheData.data;
        } catch (error) {
            console.warn('Cache retrieval error:', error);
            return null;
        }
    }
    
    delete(key) {
        localStorage.removeItem(this.prefix + key);
    }
    
    clear() {
        Object.keys(localStorage)
            .filter(key => key.startsWith(this.prefix))
            .forEach(key => localStorage.removeItem(key));
    }
    
    getAge(key) {
        try {
            const cached = localStorage.getItem(this.prefix + key);
            if (!cached) return null;
            
            const cacheData = JSON.parse(cached);
            return Date.now() - cacheData.timestamp;
        } catch {
            return null;
        }
    }
}

// ========== MAIN OBJECT ==========
const AdvancedAnalysis = {
    apiClient: null,
    rateLimiter: null,
    optimizedCache: null,
    
    currentSymbol: 'AAPL',
    currentPeriod: '6M',
    stockData: null,
    selectedSuggestionIndex: -1,
    searchTimeout: null,
    
    charts: {
        ichimoku: null,
        stochastic: null,
        williams: null,
        adx: null,
        sar: null,
        obv: null,
        atr: null,
        fibonacci: null,
        vwap: null,
        rsi: null,
        macd: null,
        bollinger: null,
        mfi: null,
        cci: null,
        roc: null,
        aroon: null,
        keltner: null,
        donchian: null,
        cmf: null,
        elderRay: null,
        volumeProfile: null,
        movingAverages: null,
        linearRegression: null
    },
    
    colors: {
        primary: '#2649B2',
        secondary: '#4A74F3',
        tertiary: '#8E7DE3',
        purple: '#9D5CE6',
        lightBlue: '#6C8BE0',
        success: '#28a745',
        danger: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8',
        orange: '#fd7e14',
        teal: '#20c997',
        cyan: '#0dcaf0',
        indigo: '#6610f2',
        pink: '#d63384'
    },
    
    // ============================================
    // ✅ INITIALIZATION
    // ============================================
    
    async init() {
        console.log('🚀 Advanced Analysis - Wall Street Edition - Initializing...');
        
        this.rateLimiter = new RateLimiter(8, 60000);
        this.optimizedCache = new OptimizedCache();
        
        await this.waitForAuth();
        
        this.apiClient = new FinanceAPIClient({
            baseURL: APP_CONFIG.API_BASE_URL,
            cacheDuration: APP_CONFIG.CACHE_DURATION || 300000,
            maxRetries: APP_CONFIG.MAX_RETRIES || 2,
            onLoadingChange: (isLoading) => {
                this.showLoading(isLoading);
            }
        });
        
        window.apiClient = this.apiClient;
        window.rateLimiter = this.rateLimiter;
        
        this.updateLastUpdate();
        this.setupEventListeners();
        this.startCacheMonitoring();
        
        setTimeout(() => {
            this.loadSymbol(this.currentSymbol);
        }, 500);
        
        console.log('✅ Advanced Analysis - Wall Street Edition - Ready!');
    },
    
    async waitForAuth() {
        return new Promise((resolve) => {
            if (!firebase || !firebase.auth) {
                console.warn('⚠ Firebase not available');
                resolve();
                return;
            }
            
            const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
                if (user) {
                    console.log('✅ User authenticated');
                    unsubscribe();
                    resolve();
                }
            });
            
            setTimeout(() => {
                resolve();
            }, 3000);
        });
    },
    
    startCacheMonitoring() {
        setInterval(() => {
            if (window.cacheWidget) {
                const remaining = this.rateLimiter.getRemainingRequests();
                const queueLength = this.rateLimiter.getQueueLength();
                
                window.cacheWidget.updateRateLimitStatus(remaining, 8);
                
                if (queueLength > 0) {
                    window.cacheWidget.updateQueueStatus(queueLength, 0);
                }
            }
        }, 1000);
    },
    
    async apiRequest(fn, priority = 'normal') {
        return await this.rateLimiter.execute(fn, priority);
    },
    
    setupEventListeners() {
        const input = document.getElementById('symbolInput');
        if (input) {
            input.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
            
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    if (this.selectedSuggestionIndex >= 0) {
                        const suggestions = document.querySelectorAll('.suggestion-item');
                        if (suggestions[this.selectedSuggestionIndex]) {
                            const symbol = suggestions[this.selectedSuggestionIndex].dataset.symbol;
                            this.selectSuggestion(symbol);
                        }
                    } else {
                        this.analyzeStock();
                    }
                } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    this.navigateSuggestions('down');
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    this.navigateSuggestions('up');
                } else if (e.key === 'Escape') {
                    this.hideSuggestions();
                }
            });
            
            input.addEventListener('focus', (e) => {
                if (e.target.value.trim().length > 0) {
                    this.handleSearch(e.target.value);
                }
            });
        }
        
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-input-wrapper')) {
                this.hideSuggestions();
            }
        });
    },
    
    // ============================================
    // SEARCH FUNCTIONALITY (CONSERVÉ)
    // ============================================
    
    handleSearch(query) {
        const trimmedQuery = query.trim();
        
        if (trimmedQuery.length === 0) {
            this.hideSuggestions();
            return;
        }
        
        clearTimeout(this.searchTimeout);
        
        this.searchTimeout = setTimeout(() => {
            this.searchSymbols(trimmedQuery);
        }, 500);
    },
    
    async searchSymbols(query) {
        console.log('🔍 Searching for:', query);
        
        const container = document.getElementById('searchSuggestions');
        container.innerHTML = '<div class="suggestion-loading"><i class="fas fa-spinner fa-spin"></i> Searching...</div>';
        container.classList.add('active');
        
        try {
            const results = await this.apiRequest(() => this.apiClient.searchSymbol(query), 'low');
            
            if (results.data && results.data.length > 0) {
                this.displaySearchResults(results.data, query);
            } else {
                this.displayNoResults();
            }
            
        } catch (error) {
            console.error('Search failed:', error);
            this.displaySearchError();
        }
    },
    
    displaySearchResults(quotes, query) {
        const container = document.getElementById('searchSuggestions');
        
        const stocks = [];
        const etfs = [];
        const crypto = [];
        const indices = [];
        const other = [];
        
        quotes.forEach(quote => {
            const type = (quote.instrument_type || 'Common Stock').toLowerCase();
            
            if (type.includes('stock') || type.includes('equity')) {
                stocks.push(quote);
            } else if (type.includes('etf')) {
                etfs.push(quote);
            } else if (type.includes('crypto') || type.includes('digital currency')) {
                crypto.push(quote);
            } else if (type.includes('index')) {
                indices.push(quote);
            } else {
                other.push(quote);
            }
        });
        
        let html = '';
        if (stocks.length > 0) html += this.buildCategoryHTML('Stocks', stocks, query);
        if (etfs.length > 0) html += this.buildCategoryHTML('ETFs', etfs, query);
        if (crypto.length > 0) html += this.buildCategoryHTML('Cryptocurrencies', crypto, query);
        if (indices.length > 0) html += this.buildCategoryHTML('Indices', indices, query);
        if (other.length > 0) html += this.buildCategoryHTML('Other', other, query);
        
        if (html === '') {
            this.displayNoResults();
        } else {
            container.innerHTML = html;
            container.classList.add('active');
            this.selectedSuggestionIndex = -1;
            
            container.querySelectorAll('.suggestion-item').forEach((item) => {
                item.addEventListener('click', () => {
                    this.selectSuggestion(item.dataset.symbol);
                });
            });
        }
    },
    
    buildCategoryHTML(categoryName, items, query) {
        const iconMap = {
            'Stocks': 'chart-line',
            'ETFs': 'layer-group',
            'Cryptocurrencies': 'coins',
            'Indices': 'chart-bar',
            'Other': 'folder'
        };
        
        const sectorMap = {
            'Stocks': 'tech',
            'ETFs': 'etf',
            'Cryptocurrencies': 'crypto',
            'Indices': 'finance',
            'Other': 'industrial'
        };
        
        let html = `<div class="suggestion-category">
            <i class="fas fa-${iconMap[categoryName] || 'folder'}"></i> ${categoryName}
        </div>`;
        
        items.slice(0, 10).forEach(item => {
            const highlightedSymbol = this.highlightMatch(item.symbol, query);
            const highlightedName = this.highlightMatch(item.instrument_name, query);
            
            html += `
                <div class="suggestion-item" data-symbol="${this.escapeHtml(item.symbol)}">
                    <div class="suggestion-icon ${sectorMap[categoryName] || 'tech'}">
                        ${this.escapeHtml(item.symbol.substring(0, 2))}
                    </div>
                    <div class="suggestion-info">
                        <div class="suggestion-symbol">${highlightedSymbol}</div>
                        <div class="suggestion-name">${highlightedName}</div>
                    </div>
                    ${item.exchange ? `<div class="suggestion-exchange">${this.escapeHtml(item.exchange)}</div>` : ''}
                </div>
            `;
        });
        
        return html;
    },
    
    highlightMatch(text, query) {
        if (!text || !query) return this.escapeHtml(text);
        const escapedText = this.escapeHtml(text);
        const escapedQuery = this.escapeHtml(query);
        const regex = new RegExp(`(${escapedQuery})`, 'gi');
        return escapedText.replace(regex, '<span class="suggestion-match">$1</span>');
    },
    
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    displayNoResults() {
        const container = document.getElementById('searchSuggestions');
        container.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <p><strong>No results found</strong></p>
                <p>Try searching by ticker symbol or company name</p>
            </div>
        `;
        container.classList.add('active');
    },
    
    displaySearchError() {
        const container = document.getElementById('searchSuggestions');
        container.innerHTML = `
            <div class="no-results">
                <i class="fas fa-exclamation-triangle"></i>
                <p><strong>Search temporarily unavailable</strong></p>
                <p>Please enter a ticker symbol directly</p>
            </div>
        `;
        container.classList.add('active');
    },
    
    selectSuggestion(symbol) {
        document.getElementById('symbolInput').value = symbol;
        this.hideSuggestions();
        this.loadSymbol(symbol);
    },
    
    hideSuggestions() {
        const container = document.getElementById('searchSuggestions');
        container.classList.remove('active');
        this.selectedSuggestionIndex = -1;
    },
    
    navigateSuggestions(direction) {
        const suggestions = document.querySelectorAll('.suggestion-item');
        if (suggestions.length === 0) return;
        
        if (this.selectedSuggestionIndex >= 0) {
            suggestions[this.selectedSuggestionIndex].classList.remove('selected');
        }
        
        if (direction === 'down') {
            this.selectedSuggestionIndex = (this.selectedSuggestionIndex + 1) % suggestions.length;
        } else {
            this.selectedSuggestionIndex = this.selectedSuggestionIndex <= 0 
                ? suggestions.length - 1 
                : this.selectedSuggestionIndex - 1;
        }
        
        suggestions[this.selectedSuggestionIndex].classList.add('selected');
        suggestions[this.selectedSuggestionIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    },
    
    // ============================================
    // LOAD SYMBOL (CONSERVÉ)
    // ============================================
    
    analyzeStock() {
        const symbol = document.getElementById('symbolInput').value.trim().toUpperCase();
        if (symbol) {
            this.loadSymbol(symbol);
        }
    },
    
    async loadSymbol(symbol) {
        this.currentSymbol = symbol;
        document.getElementById('symbolInput').value = symbol;
        this.hideSuggestions();
        
        this.showLoading(true);
        this.hideResults();
        
        try {
            console.log(`📊 Loading ${symbol} with Twelve Data API...`);
            
            const [quote, timeSeries] = await Promise.all([
                this.apiRequest(() => this.apiClient.getQuote(symbol), 'high'),
                this.apiRequest(() => this.getTimeSeriesForPeriod(symbol, this.currentPeriod), 'high')
            ]);
            
            if (!quote || !timeSeries) {
                throw new Error('Failed to load stock data');
            }
            
            this.stockData = {
                symbol: quote.symbol,
                prices: timeSeries.data,
                currency: 'USD',
                quote: quote
            };
            
            console.log('✅ Data loaded successfully');
            
            this.displayStockHeader();
            this.updateAllIndicators();
            this.showLoading(false);
            
        } catch (error) {
            console.error('Error loading stock data:', error);
            console.log('Using demo data as fallback...');
            this.stockData = this.generateDemoData(symbol);
            this.displayStockHeader();
            this.updateAllIndicators();
            this.showLoading(false);
        }
    },
    
    async getTimeSeriesForPeriod(symbol, period) {
        const periodMap = {
            '1M': { interval: '1day', outputsize: 30 },
            '3M': { interval: '1day', outputsize: 90 },
            '6M': { interval: '1day', outputsize: 180 },
            '1Y': { interval: '1day', outputsize: 252 },
            '5Y': { interval: '1week', outputsize: 260 }
        };
        
        const config = periodMap[period] || periodMap['6M'];
        return await this.apiClient.getTimeSeries(symbol, config.interval, config.outputsize);
    },
    
    changePeriod(period) {
        this.currentPeriod = period;
        
        document.querySelectorAll('.horizon-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const selectedBtn = document.querySelector(`[data-period="${period}"]`);
        if (selectedBtn) {
            selectedBtn.classList.add('active');
        }
        
        if (this.currentSymbol) {
            this.loadSymbol(this.currentSymbol);
        }
    },
    
    // ✅ CORRECTION 1 - displayStockHeader() - SCORE ALPHAVAULT
    displayStockHeader() {
        const quote = this.stockData.quote;
        
        if (!quote || Object.keys(quote).length === 0) {
            if (this.stockData.prices && this.stockData.prices.length > 0) {
                const lastPrice = this.stockData.prices[this.stockData.prices.length - 1];
                const prevPrice = this.stockData.prices[this.stockData.prices.length - 2] || lastPrice;
                
                this.stockData.quote = {
                    name: this.currentSymbol,
                    symbol: this.currentSymbol,
                    price: lastPrice.close,
                    change: lastPrice.close - prevPrice.close,
                    percentChange: ((lastPrice.close - prevPrice.close) / prevPrice.close) * 100
                };
            }
        }
        
        const displayQuote = this.stockData.quote;
        
        document.getElementById('stockSymbol').textContent = displayQuote.symbol || this.currentSymbol;
        document.getElementById('stockName').textContent = displayQuote.name || this.currentSymbol;
        
        // ❌ SUPPRIMER PRIX - ✅ AFFICHER SCORE ALPHAVAULT
        const alphaScore = this.calculateAlphaVaultScore(this.stockData.prices);
        document.getElementById('currentPrice').textContent = `AlphaVault Score: ${alphaScore}/100`;
        
        // ✅ CONSERVER LE CHANGE % (c'est une dérivée, pas une donnée brute)
        const change = displayQuote.change !== undefined && displayQuote.change !== null ? displayQuote.change : 0;
        const changePercent = displayQuote.percentChange !== undefined && displayQuote.percentChange !== null ? displayQuote.percentChange : 0;
        
        const changeEl = document.getElementById('priceChange');
        const changeText = `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}% (24h)`;
        changeEl.textContent = changeText;
        changeEl.className = change >= 0 ? 'change positive' : 'change negative';
        
        document.getElementById('stockHeader').classList.remove('hidden');
    },
    
    // ✅ NOUVELLE FONCTION - Calcul Score AlphaVault (propriétaire)
    calculateAlphaVaultScore(prices) {
        if (!prices || prices.length < 20) return 50;
        
        let score = 50; // Base neutre
        
        // Momentum récent (20 jours)
        const recentPrices = prices.slice(-20);
        const priceChange = ((recentPrices[19].close - recentPrices[0].close) / recentPrices[0].close) * 100;
        
        if (priceChange > 10) score += 15;
        else if (priceChange > 5) score += 10;
        else if (priceChange > 0) score += 5;
        else if (priceChange < -10) score -= 15;
        else if (priceChange < -5) score -= 10;
        else if (priceChange < 0) score -= 5;
        
        // Volatilité (range moyen)
        const avgRange = recentPrices.reduce((sum, p) => sum + (p.high - p.low), 0) / 20;
        const avgPrice = recentPrices.reduce((sum, p) => sum + p.close, 0) / 20;
        const volatility = (avgRange / avgPrice) * 100;
        
        if (volatility < 2) score += 10; // Faible volatilité = stable
        else if (volatility > 5) score -= 10; // Haute volatilité = risqué
        
        // Volume trend
        const volumeTrend = recentPrices.slice(-5).reduce((sum, p) => sum + p.volume, 0) / 
                            recentPrices.slice(0, 5).reduce((sum, p) => sum + p.volume, 0);
        
        if (volumeTrend > 1.2) score += 10; // Volume en hausse
        else if (volumeTrend < 0.8) score -= 10; // Volume en baisse
        
        return Math.max(0, Math.min(100, Math.round(score)));
    },

    // ============================================
    // ✅ UPDATE ALL INDICATORS (CONSERVÉ - NO PRICE DATA)
    // ============================================
    
    updateAllIndicators() {
        console.log('📊 Updating all indicators (Wall Street Edition)...');
        
        const resultsPanel = document.getElementById('resultsPanel');
        if (resultsPanel.classList.contains('hidden')) {
            resultsPanel.classList.remove('hidden');
        }
        
        // Indicateurs originaux
        this.updateIchimokuChart();
        this.updateStochasticChart();
        this.updateWilliamsChart();
        this.updateADXChart();
        this.updateSARChart();
        this.updateOBVChart();
        this.updateATRChart();
        this.updateFibonacciChart();
        this.createPivotPoints();
        this.updateVWAPChart();
        
        // Nouveaux indicateurs
        this.updateRSIChart();
        this.updateMACDChart();
        this.updateBollingerChart();
        this.updateMFIChart();
        this.updateCCIChart();
        this.updateUltimateOscillatorChart();
        this.updateROCChart();
        this.updateAroonChart();
        this.updateKeltnerChart();
        this.updateDonchianChart();
        this.updateCMFChart();
        this.updateElderRayChart();
        this.updateVolumeProfileChart();
        this.updateMovingAveragesChart();
        this.updateLinearRegressionChart();
        this.detectCandlestickPatterns();
        this.detectSupportResistance();
        this.detectDivergences();
        
        // Signaux consolidés
        this.generateConsolidatedSignals();
        this.generateAIRecommendation();
        
        console.log('✅ All indicators updated (40+ indicators)');
    },

    // ============================================
    // ✅ RSI (Relative Strength Index) - CONSERVÉ
    // ============================================
    
    updateRSIChart() {
        const prices = this.stockData.prices;
        const rsi = this.calculateRSI(prices);
        
        if (this.charts.rsi) {
            this.charts.rsi.series[0].setData(rsi, true);
        } else {
            this.charts.rsi = Highcharts.chart('rsiChart', {
                chart: { borderRadius: 15, height: 400 },
                title: {
                    text: 'RSI - Relative Strength Index',
                    style: { color: this.colors.primary, fontWeight: 'bold' }
                },
                xAxis: { type: 'datetime', crosshair: true },
                yAxis: {
                    title: { text: 'RSI' },
                    plotLines: [
                        {
                            value: 70,
                            color: this.colors.danger,
                            dashStyle: 'ShortDash',
                            width: 2,
                            label: { 
                                text: 'Overbought (70)', 
                                align: 'right', 
                                style: { color: this.colors.danger, fontWeight: 'bold' } 
                            }
                        },
                        {
                            value: 50,
                            color: '#999',
                            dashStyle: 'Dot',
                            width: 1,
                            label: { text: 'Neutral (50)', align: 'right' }
                        },
                        {
                            value: 30,
                            color: this.colors.success,
                            dashStyle: 'ShortDash',
                            width: 2,
                            label: { 
                                text: 'Oversold (30)', 
                                align: 'right', 
                                style: { color: this.colors.success, fontWeight: 'bold' } 
                            }
                        }
                    ],
                    min: 0,
                    max: 100
                },
                tooltip: { borderRadius: 10, valueDecimals: 2 },
                series: [
                    {
                        type: 'area',
                        name: 'RSI',
                        data: rsi,
                        color: this.colors.secondary,
                        fillColor: {
                            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                            stops: [
                                [0, Highcharts.color(this.colors.secondary).setOpacity(0.4).get('rgba')],
                                [1, Highcharts.color(this.colors.secondary).setOpacity(0.1).get('rgba')]
                            ]
                        },
                        lineWidth: 2,
                        zones: [
                            { value: 30, color: this.colors.success },
                            { value: 70, color: this.colors.secondary },
                            { color: this.colors.danger }
                        ]
                    }
                ],
                credits: { enabled: false }
            });
        }
        
        this.displayRSISignal(rsi);
    },
    
    calculateRSI(prices, period = 14) {
        const rsi = [];
        const changes = [];
        
        for (let i = 1; i < prices.length; i++) {
            changes.push(prices[i].close - prices[i - 1].close);
        }
        
        let avgGain = 0;
        let avgLoss = 0;
        
        for (let i = 0; i < period; i++) {
            if (changes[i] > 0) {
                avgGain += changes[i];
            } else {
                avgLoss += Math.abs(changes[i]);
            }
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
    },
    
    displayRSISignal(rsi) {
        if (!rsi.length) {
            document.getElementById('rsiSignal').textContent = 'Not enough data';
            return;
        }
        
        const lastRSI = rsi[rsi.length - 1][1];
        
        let signal = 'neutral';
        let text = `RSI: ${lastRSI.toFixed(2)} - `;
        
        if (lastRSI > 70) {
            signal = 'bearish';
            text += 'OVERBOUGHT - Strong Sell Signal';
        } else if (lastRSI > 60) {
            signal = 'bearish';
            text += 'Approaching Overbought - Caution';
        } else if (lastRSI < 30) {
            signal = 'bullish';
            text += 'OVERSOLD - Strong Buy Signal';
        } else if (lastRSI < 40) {
            signal = 'bullish';
            text += 'Approaching Oversold - Watch for Entry';
        } else {
            text += 'Neutral Zone - No Clear Signal';
        }
        
        const signalBox = document.getElementById('rsiSignal');
        signalBox.className = `signal-box ${signal}`;
        signalBox.textContent = text;
    },
    
    // ============================================
    // ✅ MACD - CONSERVÉ
    // ============================================
    
    updateMACDChart() {
        const prices = this.stockData.prices;
        const macd = this.calculateMACD(prices);
        
        if (this.charts.macd) {
            this.charts.macd.series[0].setData(macd.macdLine, false);
            this.charts.macd.series[1].setData(macd.signalLine, false);
            this.charts.macd.series[2].setData(macd.histogram, false);
            this.charts.macd.redraw();
        } else {
            this.charts.macd = Highcharts.chart('macdChart', {
                chart: { borderRadius: 15, height: 400 },
                title: {
                    text: 'MACD - Moving Average Convergence Divergence',
                    style: { color: this.colors.primary, fontWeight: 'bold' }
                },
                xAxis: { type: 'datetime', crosshair: true },
                yAxis: [
                    {
                        title: { text: 'MACD' },
                        plotLines: [{
                            value: 0,
                            color: '#999',
                            dashStyle: 'Dash',
                            width: 2
                        }]
                    }
                ],
                tooltip: { borderRadius: 10, shared: true, valueDecimals: 4 },
                series: [
                    {
                        type: 'line',
                        name: 'MACD Line',
                        data: macd.macdLine,
                        color: this.colors.primary,
                        lineWidth: 2,
                        zIndex: 2
                    },
                    {
                        type: 'line',
                        name: 'Signal Line',
                        data: macd.signalLine,
                        color: this.colors.danger,
                        lineWidth: 2,
                        zIndex: 2
                    },
                    {
                        type: 'column',
                        name: 'Histogram',
                        data: macd.histogram,
                        color: this.colors.success,
                        negativeColor: this.colors.danger,
                        zIndex: 1
                    }
                ],
                credits: { enabled: false }
            });
        }
        
        this.displayMACDSignal(macd);
    },
    
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
    },
    
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
    },
    
    displayMACDSignal(macd) {
        if (!macd.histogram.length) {
            document.getElementById('macdSignal').textContent = 'Not enough data';
            return;
        }
        
        const lastHistogram = macd.histogram[macd.histogram.length - 1][1];
        const prevHistogram = macd.histogram[macd.histogram.length - 2]?.[1] || 0;
        
        let signal = 'neutral';
        let text = `Histogram: ${lastHistogram.toFixed(4)} - `;
        
        if (lastHistogram > 0 && prevHistogram <= 0) {
            signal = 'bullish';
            text += 'BULLISH CROSSOVER - Strong Buy Signal';
        } else if (lastHistogram < 0 && prevHistogram >= 0) {
            signal = 'bearish';
            text += 'BEARISH CROSSOVER - Strong Sell Signal';
        } else if (lastHistogram > 0 && lastHistogram > prevHistogram) {
            signal = 'bullish';
            text += 'Bullish Momentum Increasing';
        } else if (lastHistogram < 0 && lastHistogram < prevHistogram) {
            signal = 'bearish';
            text += 'Bearish Momentum Increasing';
        } else if (lastHistogram > 0) {
            signal = 'bullish';
            text += 'Bullish but Weakening';
        } else if (lastHistogram < 0) {
            signal = 'bearish';
            text += 'Bearish but Weakening';
        } else {
            text += 'No Clear Signal';
        }
        
        const signalBox = document.getElementById('macdSignal');
        signalBox.className = `signal-box ${signal}`;
        signalBox.textContent = text;
    },
    
    // ============================================
    // ✅ BOLLINGER BANDS - CORRIGÉ (SANS CANDLESTICKS)
    // ============================================
    
    updateBollingerChart() {
        const prices = this.stockData.prices;
        const bollinger = this.calculateBollingerBands(prices);
        
        // ❌ SUPPRESSION DES OHLC CANDLESTICKS
        
        if (this.charts.bollinger) {
            this.charts.bollinger.series[0].setData(bollinger.upper, false);
            this.charts.bollinger.series[1].setData(bollinger.middle, false);
            this.charts.bollinger.series[2].setData(bollinger.lower, false);
            this.charts.bollinger.redraw();
        } else {
            this.charts.bollinger = Highcharts.stockChart('bollingerChart', {
                chart: { borderRadius: 15, height: 600 },
                title: {
                    text: 'Bollinger Bands (20, 2) - Analysis Only',
                    style: { color: this.colors.primary, fontWeight: 'bold' }
                },
                rangeSelector: { enabled: false },
                navigator: { enabled: true },
                xAxis: { type: 'datetime', crosshair: true },
                yAxis: { title: { text: 'Relative Position' } },
                tooltip: { borderRadius: 10, shared: true },
                series: [
                    // ❌ SUPPRIMÉ : Candlestick series
                    {
                        type: 'line',
                        name: 'Upper Band',
                        data: bollinger.upper,
                        color: this.colors.danger,
                        lineWidth: 2,
                        dashStyle: 'Dash',
                        zIndex: 1
                    },
                    {
                        type: 'line',
                        name: 'Middle Band (SMA)',
                        data: bollinger.middle,
                        color: this.colors.primary,
                        lineWidth: 2,
                        zIndex: 1
                    },
                    {
                        type: 'line',
                        name: 'Lower Band',
                        data: bollinger.lower,
                        color: this.colors.success,
                        lineWidth: 2,
                        dashStyle: 'Dash',
                        zIndex: 1
                    }
                ],
                credits: { enabled: false }
            });
        }
        
        this.displayBollingerSignal(bollinger, prices);
    },
    
    calculateBollingerBands(prices, period = 20, stdDevMultiplier = 2) {
        const closes = prices.map(p => p.close);
        const upper = [];
        const middle = [];
        const lower = [];
        
        for (let i = period - 1; i < closes.length; i++) {
            const slice = closes.slice(i - period + 1, i + 1);
            const sma = slice.reduce((a, b) => a + b, 0) / period;
            
            const variance = slice.reduce((sum, val) => sum + Math.pow(val - sma, 2), 0) / period;
            const stdDev = Math.sqrt(variance);
            
            const timestamp = prices[i].timestamp;
            
            upper.push([timestamp, sma + stdDevMultiplier * stdDev]);
            middle.push([timestamp, sma]);
            lower.push([timestamp, sma - stdDevMultiplier * stdDev]);
        }
        
        return { upper, middle, lower };
    },
    
    // ✅ CORRECTION 2 - displayBollingerSignal - MASQUER PRIX
    displayBollingerSignal(bollinger, prices) {
        if (!bollinger.upper.length) {
            document.getElementById('bollingerSignal').textContent = 'Not enough data';
            return;
        }
        
        const lastPrice = prices[prices.length - 1].close;
        const lastUpper = bollinger.upper[bollinger.upper.length - 1][1];
        const lastMiddle = bollinger.middle[bollinger.middle.length - 1][1];
        const lastLower = bollinger.lower[bollinger.lower.length - 1][1];
        
        const bandwidth = ((lastUpper - lastLower) / lastMiddle) * 100;
        
        // ✅ CALCULER POSITION RELATIVE (pas de prix)
        const pricePosition = ((lastPrice - lastMiddle) / lastMiddle * 100).toFixed(2);
        
        let signal = 'neutral';
        let text = `Position: ${pricePosition}% from midline - `;
        
        if (lastPrice > lastUpper) {
            signal = 'bearish';
            text += 'ABOVE UPPER BAND - Overbought, Potential Reversal';
        } else if (lastPrice < lastLower) {
            signal = 'bullish';
            text += 'BELOW LOWER BAND - Oversold, Potential Reversal';
        } else if (lastPrice > lastMiddle) {
            signal = 'bullish';
            text += 'Above Middle Band - Bullish Territory';
        } else if (lastPrice < lastMiddle) {
            signal = 'bearish';
            text += 'Below Middle Band - Bearish Territory';
        } else {
            text += 'At Middle Band - Neutral';
        }
        
        text += ` | Bandwidth: ${bandwidth.toFixed(2)}%`;
        
        if (bandwidth < 5) {
            text += ' (Squeeze - Breakout Coming)';
        } else if (bandwidth > 20) {
            text += ' (High Volatility)';
        }
        
        const signalBox = document.getElementById('bollingerSignal');
        signalBox.className = `signal-box ${signal}`;
        signalBox.textContent = text;
    },
    
    // ============================================
    // ✅ MFI, CCI, ULTIMATE, ROC, AROON - CONSERVÉS (déjà OK)
    // ============================================
    
    updateMFIChart() {
        const prices = this.stockData.prices;
        const mfi = this.calculateMFI(prices);
        
        if (this.charts.mfi) {
            this.charts.mfi.series[0].setData(mfi, true);
        } else {
            this.charts.mfi = Highcharts.chart('mfiChart', {
                chart: { borderRadius: 15, height: 400 },
                title: {
                    text: 'MFI - Money Flow Index',
                    style: { color: this.colors.primary, fontWeight: 'bold' }
                },
                xAxis: { type: 'datetime', crosshair: true },
                yAxis: {
                    title: { text: 'MFI' },
                    plotLines: [
                        {
                            value: 80,
                            color: this.colors.danger,
                            dashStyle: 'ShortDash',
                            width: 2,
                            label: { text: 'Overbought (80)', align: 'right', style: { color: this.colors.danger } }
                        },
                        {
                            value: 20,
                            color: this.colors.success,
                            dashStyle: 'ShortDash',
                            width: 2,
                            label: { text: 'Oversold (20)', align: 'right', style: { color: this.colors.success } }
                        }
                    ],
                    min: 0,
                    max: 100
                },
                tooltip: { borderRadius: 10, valueDecimals: 2 },
                series: [
                    {
                        type: 'area',
                        name: 'MFI',
                        data: mfi,
                        color: this.colors.teal,
                        fillOpacity: 0.3,
                        lineWidth: 2
                    }
                ],
                credits: { enabled: false }
            });
        }
        
        this.displayMFISignal(mfi);
    },
    
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
    },
    
    displayMFISignal(mfi) {
        if (!mfi.length) {
            document.getElementById('mfiSignal').textContent = 'Not enough data';
            return;
        }
        
        const lastMFI = mfi[mfi.length - 1][1];
        
        let signal = 'neutral';
        let text = `MFI: ${lastMFI.toFixed(2)} - `;
        
        if (lastMFI > 80) {
            signal = 'bearish';
            text += 'OVERBOUGHT - Strong Money Outflow Expected';
        } else if (lastMFI < 20) {
            signal = 'bullish';
            text += 'OVERSOLD - Strong Money Inflow Expected';
        } else if (lastMFI > 50) {
            signal = 'bullish';
            text += 'Positive Money Flow - Buyers in Control';
        } else {
            signal = 'bearish';
            text += 'Negative Money Flow - Sellers in Control';
        }
        
        const signalBox = document.getElementById('mfiSignal');
        signalBox.className = `signal-box ${signal}`;
        signalBox.textContent = text;
    },
    
    updateCCIChart() {
        const prices = this.stockData.prices;
        const cci = this.calculateCCI(prices);
        
        if (this.charts.cci) {
            this.charts.cci.series[0].setData(cci, true);
        } else {
            this.charts.cci = Highcharts.chart('cciChart', {
                chart: { borderRadius: 15, height: 400 },
                title: {
                    text: 'CCI - Commodity Channel Index',
                    style: { color: this.colors.primary, fontWeight: 'bold' }
                },
                xAxis: { type: 'datetime', crosshair: true },
                yAxis: {
                    title: { text: 'CCI' },
                    plotLines: [
                        {
                            value: 100,
                            color: this.colors.danger,
                            dashStyle: 'ShortDash',
                            width: 2,
                            label: { text: 'Overbought (+100)', align: 'right', style: { color: this.colors.danger } }
                        },
                        {
                            value: 0,
                            color: '#999',
                            dashStyle: 'Dot',
                            width: 1
                        },
                        {
                            value: -100,
                            color: this.colors.success,
                            dashStyle: 'ShortDash',
                            width: 2,
                            label: { text: 'Oversold (-100)', align: 'right', style: { color: this.colors.success } }
                        }
                    ]
                },
                tooltip: { borderRadius: 10, valueDecimals: 2 },
                series: [
                    {
                        type: 'line',
                        name: 'CCI',
                        data: cci,
                        color: this.colors.indigo,
                        lineWidth: 2
                    }
                ],
                credits: { enabled: false }
            });
        }
        
        this.displayCCISignal(cci);
    },
    
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
    },
    
    displayCCISignal(cci) {
        if (!cci.length) {
            document.getElementById('cciSignal').textContent = 'Not enough data';
            return;
        }
        
        const lastCCI = cci[cci.length - 1][1];
        
        let signal = 'neutral';
        let text = `CCI: ${lastCCI.toFixed(2)} - `;
        
        if (lastCCI > 100) {
            signal = 'bearish';
            text += 'OVERBOUGHT - Strong Reversal Signal';
        } else if (lastCCI < -100) {
            signal = 'bullish';
            text += 'OVERSOLD - Strong Reversal Signal';
        } else if (lastCCI > 0) {
            signal = 'bullish';
            text += 'Bullish Territory';
        } else {
            signal = 'bearish';
            text += 'Bearish Territory';
        }
        
        const signalBox = document.getElementById('cciSignal');
        signalBox.className = `signal-box ${signal}`;
        signalBox.textContent = text;
    },
    
    updateUltimateOscillatorChart() {
        const prices = this.stockData.prices;
        const ultimate = this.calculateUltimateOscillator(prices);
        
        if (this.charts.ultimate) {
            this.charts.ultimate.series[0].setData(ultimate, true);
        } else {
            this.charts.ultimate = Highcharts.chart('ultimateChart', {
                chart: { borderRadius: 15, height: 400 },
                title: {
                    text: 'Ultimate Oscillator',
                    style: { color: this.colors.primary, fontWeight: 'bold' }
                },
                xAxis: { type: 'datetime', crosshair: true },
                yAxis: {
                    title: { text: 'Ultimate Oscillator' },
                    plotLines: [
                        {
                            value: 70,
                            color: this.colors.danger,
                            dashStyle: 'ShortDash',
                            width: 2,
                            label: { text: 'Overbought (70)', align: 'right', style: { color: this.colors.danger } }
                        },
                        {
                            value: 30,
                            color: this.colors.success,
                            dashStyle: 'ShortDash',
                            width: 2,
                            label: { text: 'Oversold (30)', align: 'right', style: { color: this.colors.success } }
                        }
                    ],
                    min: 0,
                    max: 100
                },
                tooltip: { borderRadius: 10, valueDecimals: 2 },
                series: [
                    {
                        type: 'area',
                        name: 'Ultimate Oscillator',
                        data: ultimate,
                        color: this.colors.pink,
                        fillOpacity: 0.3,
                        lineWidth: 2
                    }
                ],
                credits: { enabled: false }
            });
        }
        
        this.displayUltimateSignal(ultimate);
    },
    
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
    },
    
    sumArray(arr, start, end) {
        let sum = 0;
        for (let i = start; i < end && i < arr.length; i++) {
            sum += arr[i];
        }
        return sum || 1;
    },
    
    displayUltimateSignal(ultimate) {
        if (!ultimate.length) {
            document.getElementById('ultimateSignal').textContent = 'Not enough data';
            return;
        }
        
        const lastUO = ultimate[ultimate.length - 1][1];
        
        let signal = 'neutral';
        let text = `Ultimate Oscillator: ${lastUO.toFixed(2)} - `;
        
        if (lastUO > 70) {
            signal = 'bearish';
            text += 'OVERBOUGHT - Sell Signal';
        } else if (lastUO < 30) {
            signal = 'bullish';
            text += 'OVERSOLD - Buy Signal';
        } else {
            text += 'Neutral Zone';
        }
        
        const signalBox = document.getElementById('ultimateSignal');
        signalBox.className = `signal-box ${signal}`;
        signalBox.textContent = text;
    },
    
    updateROCChart() {
        const prices = this.stockData.prices;
        const roc = this.calculateROC(prices);
        
        if (this.charts.roc) {
            this.charts.roc.series[0].setData(roc, true);
        } else {
            this.charts.roc = Highcharts.chart('rocChart', {
                chart: { borderRadius: 15, height: 400 },
                title: {
                    text: 'ROC - Rate of Change',
                    style: { color: this.colors.primary, fontWeight: 'bold' }
                },
                xAxis: { type: 'datetime', crosshair: true },
                yAxis: {
                    title: { text: 'ROC (%)' },
                    plotLines: [{
                        value: 0,
                        color: '#999',
                        dashStyle: 'Dash',
                        width: 2
                    }]
                },
                tooltip: { borderRadius: 10, valueDecimals: 2, valueSuffix: '%' },
                series: [
                    {
                        type: 'area',
                        name: 'ROC',
                        data: roc,
                        color: this.colors.orange,
                        negativeColor: this.colors.danger,
                        fillOpacity: 0.3,
                        lineWidth: 2
                    }
                ],
                credits: { enabled: false }
            });
        }
        
        this.displayROCSignal(roc);
    },
    
    calculateROC(prices, period = 12) {
        const roc = [];
        
        for (let i = period; i < prices.length; i++) {
            const currentClose = prices[i].close;
            const pastClose = prices[i - period].close;
            const rocValue = ((currentClose - pastClose) / pastClose) * 100;
            
            roc.push([prices[i].timestamp, rocValue]);
        }
        
        return roc;
    },
    
    displayROCSignal(roc) {
        if (!roc.length) {
            document.getElementById('rocSignal').textContent = 'Not enough data';
            return;
        }
        
        const lastROC = roc[roc.length - 1][1];
        const prevROC = roc[roc.length - 2]?.[1] || 0;
        
        let signal = 'neutral';
        let text = `ROC: ${lastROC.toFixed(2)}% - `;
        
        if (lastROC > 0 && prevROC <= 0) {
            signal = 'bullish';
            text += 'BULLISH CROSSOVER - Momentum Shift Up';
        } else if (lastROC < 0 && prevROC >= 0) {
            signal = 'bearish';
            text += 'BEARISH CROSSOVER - Momentum Shift Down';
        } else if (lastROC > 5) {
            signal = 'bullish';
            text += 'Strong Positive Momentum';
        } else if (lastROC < -5) {
            signal = 'bearish';
            text += 'Strong Negative Momentum';
        } else {
            text += 'Weak Momentum';
        }
        
        const signalBox = document.getElementById('rocSignal');
        signalBox.className = `signal-box ${signal}`;
        signalBox.textContent = text;
    },
    
    updateAroonChart() {
        const prices = this.stockData.prices;
        const aroon = this.calculateAroon(prices);
        
        if (this.charts.aroon) {
            this.charts.aroon.series[0].setData(aroon.up, false);
            this.charts.aroon.series[1].setData(aroon.down, false);
            this.charts.aroon.redraw();
        } else {
            this.charts.aroon = Highcharts.chart('aroonChart', {
                chart: { borderRadius: 15, height: 400 },
                title: {
                    text: 'Aroon Indicator',
                    style: { color: this.colors.primary, fontWeight: 'bold' }
                },
                xAxis: { type: 'datetime', crosshair: true },
                yAxis: {
                    title: { text: 'Aroon' },
                    plotLines: [{
                        value: 50,
                        color: '#999',
                        dashStyle: 'Dot',
                        width: 1
                    }],
                    min: 0,
                    max: 100
                },
                tooltip: { borderRadius: 10, shared: true, valueDecimals: 2 },
                series: [
                    {
                        type: 'line',
                        name: 'Aroon Up',
                        data: aroon.up,
                        color: this.colors.success,
                        lineWidth: 2
                    },
                    {
                        type: 'line',
                        name: 'Aroon Down',
                        data: aroon.down,
                        color: this.colors.danger,
                        lineWidth: 2
                    }
                ],
                credits: { enabled: false }
            });
        }
        
        this.displayAroonSignal(aroon);
    },
    
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
    },
    
    displayAroonSignal(aroon) {
        if (!aroon.up.length || !aroon.down.length) {
            document.getElementById('aroonSignal').textContent = 'Not enough data';
            return;
        }
        
        const lastUp = aroon.up[aroon.up.length - 1][1];
        const lastDown = aroon.down[aroon.down.length - 1][1];
        
        let signal = 'neutral';
        let text = `Up: ${lastUp.toFixed(0)}, Down: ${lastDown.toFixed(0)} - `;
        
        if (lastUp > 70 && lastDown < 30) {
            signal = 'bullish';
            text += 'STRONG UPTREND - Bulls in Control';
        } else if (lastDown > 70 && lastUp < 30) {
            signal = 'bearish';
            text += 'STRONG DOWNTREND - Bears in Control';
        } else if (lastUp > lastDown) {
            signal = 'bullish';
            text += 'Bullish Bias';
        } else if (lastDown > lastUp) {
            signal = 'bearish';
            text += 'Bearish Bias';
        } else {
            text += 'Consolidation';
        }
        
        const signalBox = document.getElementById('aroonSignal');
        signalBox.className = `signal-box ${signal}`;
        signalBox.textContent = text;
    },

    // ============================================
    // ✅ KELTNER CHANNELS - CORRIGÉ (SANS CANDLESTICKS)
    // ============================================
    
    updateKeltnerChart() {
        const prices = this.stockData.prices;
        const keltner = this.calculateKeltnerChannels(prices);
        
        // ❌ SUPPRESSION DES OHLC
        
        if (this.charts.keltner) {
            this.charts.keltner.series[0].setData(keltner.upper, false);
            this.charts.keltner.series[1].setData(keltner.middle, false);
            this.charts.keltner.series[2].setData(keltner.lower, false);
            this.charts.keltner.redraw();
        } else {
            this.charts.keltner = Highcharts.stockChart('keltnerChart', {
                chart: { borderRadius: 15, height: 600 },
                title: {
                    text: 'Keltner Channels (20, 2x ATR) - Analysis Only',
                    style: { color: this.colors.primary, fontWeight: 'bold' }
                },
                rangeSelector: { enabled: false },
                navigator: { enabled: true },
                xAxis: { type: 'datetime', crosshair: true },
                yAxis: { title: { text: 'Relative Position' } },
                tooltip: { borderRadius: 10, shared: true },
                series: [
                    // ❌ SUPPRIMÉ : Candlestick series
                    {
                        type: 'line',
                        name: 'Upper Channel',
                        data: keltner.upper,
                        color: this.colors.danger,
                        lineWidth: 2,
                        dashStyle: 'Dash',
                        zIndex: 1
                    },
                    {
                        type: 'line',
                        name: 'Middle Line (EMA)',
                        data: keltner.middle,
                        color: this.colors.primary,
                        lineWidth: 2,
                        zIndex: 1
                    },
                    {
                        type: 'line',
                        name: 'Lower Channel',
                        data: keltner.lower,
                        color: this.colors.success,
                        lineWidth: 2,
                        dashStyle: 'Dash',
                        zIndex: 1
                    }
                ],
                credits: { enabled: false }
            });
        }
        
        this.displayKeltnerSignal(keltner, prices);
    },
    
    calculateKeltnerChannels(prices, period = 20, atrMultiplier = 2) {
        const closes = prices.map(p => p.close);
        const ema = this.calculateEMA(closes, period);
        const atr = this.calculateATR(prices, period);
        
        const upper = [];
        const middle = [];
        const lower = [];
        
        const offset = prices.length - ema.length;
        const atrOffset = prices.length - atr.length;
        
        for (let i = 0; i < ema.length; i++) {
            const atrIndex = i - (offset - atrOffset);
            
            if (atrIndex >= 0 && atrIndex < atr.length) {
                const timestamp = prices[offset + i].timestamp;
                const emaValue = ema[i];
                const atrValue = atr[atrIndex][1];
                
                upper.push([timestamp, emaValue + atrMultiplier * atrValue]);
                middle.push([timestamp, emaValue]);
                lower.push([timestamp, emaValue - atrMultiplier * atrValue]);
            }
        }
        
        return { upper, middle, lower };
    },
    
    // ✅ CORRECTION 3 - displayKeltnerSignal - MASQUER PRIX
    displayKeltnerSignal(keltner, prices) {
        if (!keltner.upper.length) {
            document.getElementById('keltnerSignal').textContent = 'Not enough data';
            return;
        }
        
        const lastPrice = prices[prices.length - 1].close;
        const lastUpper = keltner.upper[keltner.upper.length - 1][1];
        const lastMiddle = keltner.middle[keltner.middle.length - 1][1];
        const lastLower = keltner.lower[keltner.lower.length - 1][1];
        
        // ✅ POSITION RELATIVE (pas de prix)
        const distanceFromMiddle = ((lastPrice - lastMiddle) / lastMiddle * 100).toFixed(2);
        
        let signal = 'neutral';
        let text = `Position: ${distanceFromMiddle > 0 ? '+' : ''}${distanceFromMiddle}% - `;
        
        if (lastPrice > lastUpper) {
            signal = 'bearish';
            text += 'ABOVE UPPER CHANNEL - Overbought, Strong Uptrend';
        } else if (lastPrice < lastLower) {
            signal = 'bullish';
            text += 'BELOW LOWER CHANNEL - Oversold, Strong Downtrend';
        } else if (lastPrice > lastMiddle) {
            signal = 'bullish';
            text += 'Above Middle Line - Bullish Bias';
        } else {
            signal = 'bearish';
            text += 'Below Middle Line - Bearish Bias';
        }
        
        const signalBox = document.getElementById('keltnerSignal');
        signalBox.className = `signal-box ${signal}`;
        signalBox.textContent = text;
    },

    // ============================================
    // ✅ DONCHIAN CHANNELS - CORRIGÉ (SANS CANDLESTICKS)
    // ============================================
    
    updateDonchianChart() {
        const prices = this.stockData.prices;
        const donchian = this.calculateDonchianChannels(prices);
        
        // ❌ SUPPRESSION DES OHLC
        
        if (this.charts.donchian) {
            this.charts.donchian.series[0].setData(donchian.upper, false);
            this.charts.donchian.series[1].setData(donchian.middle, false);
            this.charts.donchian.series[2].setData(donchian.lower, false);
            this.charts.donchian.redraw();
        } else {
            this.charts.donchian = Highcharts.stockChart('donchianChart', {
                chart: { borderRadius: 15, height: 600 },
                title: {
                    text: 'Donchian Channels (20 periods) - Analysis Only',
                    style: { color: this.colors.primary, fontWeight: 'bold' }
                },
                rangeSelector: { enabled: false },
                navigator: { enabled: true },
                xAxis: { type: 'datetime', crosshair: true },
                yAxis: { title: { text: 'Relative Position' } },
                tooltip: { borderRadius: 10, shared: true },
                series: [
                    // ❌ SUPPRIMÉ : Candlestick series
                    {
                        type: 'line',
                        name: 'Upper Channel (Highest High)',
                        data: donchian.upper,
                        color: this.colors.danger,
                        lineWidth: 2,
                        dashStyle: 'Dash',
                        zIndex: 1
                    },
                    {
                        type: 'line',
                        name: 'Middle Line',
                        data: donchian.middle,
                        color: this.colors.primary,
                        lineWidth: 2,
                        dashStyle: 'Dot',
                        zIndex: 1
                    },
                    {
                        type: 'line',
                        name: 'Lower Channel (Lowest Low)',
                        data: donchian.lower,
                        color: this.colors.success,
                        lineWidth: 2,
                        dashStyle: 'Dash',
                        zIndex: 1
                    }
                ],
                credits: { enabled: false }
            });
        }
        
        this.displayDonchianSignal(donchian, prices);
    },
    
    calculateDonchianChannels(prices, period = 20) {
        const upper = [];
        const middle = [];
        const lower = [];
        
        for (let i = period - 1; i < prices.length; i++) {
            const slice = prices.slice(i - period + 1, i + 1);
            
            const highest = Math.max(...slice.map(p => p.high));
            const lowest = Math.min(...slice.map(p => p.low));
            const mid = (highest + lowest) / 2;
            
            const timestamp = prices[i].timestamp;
            
            upper.push([timestamp, highest]);
            middle.push([timestamp, mid]);
            lower.push([timestamp, lowest]);
        }
        
        return { upper, middle, lower };
    },
    
    // ✅ CORRECTION 4 - displayDonchianSignal - MASQUER PRIX
    displayDonchianSignal(donchian, prices) {
        if (!donchian.upper.length) {
            document.getElementById('donchianSignal').textContent = 'Not enough data';
            return;
        }
        
        const lastPrice = prices[prices.length - 1].close;
        const lastUpper = donchian.upper[donchian.upper.length - 1][1];
        const lastMiddle = donchian.middle[donchian.middle.length - 1][1];
        const lastLower = donchian.lower[donchian.lower.length - 1][1];
        
        // ✅ POSITION DANS LE CANAL (0-100%)
        const channelPosition = ((lastPrice - lastLower) / (lastUpper - lastLower) * 100).toFixed(0);
        
        let signal = 'neutral';
        let text = `Channel Position: ${channelPosition}% - `;
        
        if (lastPrice >= lastUpper) {
            signal = 'bullish';
            text += 'BREAKOUT ABOVE - New 20-Period High (Strong Buy)';
        } else if (lastPrice <= lastLower) {
            signal = 'bearish';
            text += 'BREAKDOWN BELOW - New 20-Period Low (Strong Sell)';
        } else if (lastPrice > lastMiddle) {
            signal = 'bullish';
            text += 'Above Midpoint - Bullish Zone';
        } else {
            signal = 'bearish';
            text += 'Below Midpoint - Bearish Zone';
        }
        
        const signalBox = document.getElementById('donchianSignal');
        signalBox.className = `signal-box ${signal}`;
        signalBox.textContent = text;
    },
    
    // ============================================
    // ✅ CMF, ELDER RAY - CONSERVÉS (déjà OK, pas de prix direct)
    // ============================================
    
    updateCMFChart() {
        const prices = this.stockData.prices;
        const cmf = this.calculateCMF(prices);
        
        if (this.charts.cmf) {
            this.charts.cmf.series[0].setData(cmf, true);
        } else {
            this.charts.cmf = Highcharts.chart('cmfChart', {
                chart: { borderRadius: 15, height: 400 },
                title: {
                    text: 'CMF - Chaikin Money Flow',
                    style: { color: this.colors.primary, fontWeight: 'bold' }
                },
                xAxis: { type: 'datetime', crosshair: true },
                yAxis: {
                    title: { text: 'CMF' },
                    plotLines: [
                        {
                            value: 0,
                            color: '#999',
                            dashStyle: 'Dash',
                            width: 2
                        },
                        {
                            value: 0.05,
                            color: this.colors.success,
                            dashStyle: 'Dot',
                            width: 1,
                            label: { text: 'Bullish (+0.05)', align: 'right' }
                        },
                        {
                            value: -0.05,
                            color: this.colors.danger,
                            dashStyle: 'Dot',
                            width: 1,
                            label: { text: 'Bearish (-0.05)', align: 'right' }
                        }
                    ]
                },
                tooltip: { borderRadius: 10, valueDecimals: 4 },
                series: [
                    {
                        type: 'area',
                        name: 'CMF',
                        data: cmf,
                        color: this.colors.cyan,
                        negativeColor: this.colors.danger,
                        fillOpacity: 0.3,
                        lineWidth: 2
                    }
                ],
                credits: { enabled: false }
            });
        }
        
        this.displayCMFSignal(cmf);
    },
    
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
    },
    
    displayCMFSignal(cmf) {
        if (!cmf.length) {
            document.getElementById('cmfSignal').textContent = 'Not enough data';
            return;
        }
        
        const lastCMF = cmf[cmf.length - 1][1];
        
        let signal = 'neutral';
        let text = `CMF: ${lastCMF.toFixed(4)} - `;
        
        if (lastCMF > 0.05) {
            signal = 'bullish';
            text += 'STRONG BUYING PRESSURE - Accumulation Phase';
        } else if (lastCMF < -0.05) {
            signal = 'bearish';
            text += 'STRONG SELLING PRESSURE - Distribution Phase';
        } else if (lastCMF > 0) {
            signal = 'bullish';
            text += 'Weak Buying Pressure';
        } else if (lastCMF < 0) {
            signal = 'bearish';
            text += 'Weak Selling Pressure';
        } else {
            text += 'Neutral Money Flow';
        }
        
        const signalBox = document.getElementById('cmfSignal');
        signalBox.className = `signal-box ${signal}`;
        signalBox.textContent = text;
    },
    
    updateElderRayChart() {
        const prices = this.stockData.prices;
        const elderRay = this.calculateElderRay(prices);
        
        if (this.charts.elderRay) {
            this.charts.elderRay.series[0].setData(elderRay.bullPower, false);
            this.charts.elderRay.series[1].setData(elderRay.bearPower, false);
            this.charts.elderRay.redraw();
        } else {
            this.charts.elderRay = Highcharts.chart('elderRayChart', {
                chart: { borderRadius: 15, height: 400 },
                title: {
                    text: 'Elder Ray Index - Bull & Bear Power',
                    style: { color: this.colors.primary, fontWeight: 'bold' }
                },
                xAxis: { type: 'datetime', crosshair: true },
                yAxis: {
                    title: { text: 'Power' },
                    plotLines: [{
                        value: 0,
                        color: '#999',
                        dashStyle: 'Dash',
                        width: 2
                    }]
                },
                tooltip: { borderRadius: 10, shared: true, valueDecimals: 2 },
                series: [
                    {
                        type: 'column',
                        name: 'Bull Power',
                        data: elderRay.bullPower,
                        color: this.colors.success,
                        zIndex: 1
                    },
                    {
                        type: 'column',
                        name: 'Bear Power',
                        data: elderRay.bearPower,
                        color: this.colors.danger,
                        zIndex: 1
                    }
                ],
                credits: { enabled: false }
            });
        }
        
        this.displayElderRaySignal(elderRay);
    },
    
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
    },
    
    displayElderRaySignal(elderRay) {
        if (!elderRay.bullPower.length || !elderRay.bearPower.length) {
            document.getElementById('elderRaySignal').textContent = 'Not enough data';
            return;
        }
        
        const lastBull = elderRay.bullPower[elderRay.bullPower.length - 1][1];
        const lastBear = elderRay.bearPower[elderRay.bearPower.length - 1][1];
        
        let signal = 'neutral';
        let text = `Bull: ${lastBull.toFixed(2)}, Bear: ${lastBear.toFixed(2)} - `;
        
        if (lastBull > 0 && lastBear > 0) {
            signal = 'bullish';
            text += 'STRONG BULLS - Both Powers Positive (Buy)';
        } else if (lastBull < 0 && lastBear < 0) {
            signal = 'bearish';
            text += 'STRONG BEARS - Both Powers Negative (Sell)';
        } else if (lastBull > 0 && lastBear < 0) {
            signal = 'neutral';
            text += 'Consolidation - Mixed Signals';
        } else if (lastBull > lastBear) {
            signal = 'bullish';
            text += 'Bulls Gaining Strength';
        } else {
            signal = 'bearish';
            text += 'Bears Gaining Strength';
        }
        
        const signalBox = document.getElementById('elderRaySignal');
        signalBox.className = `signal-box ${signal}`;
        signalBox.textContent = text;
    },
    
    // ============================================
    // ✅ VOLUME PROFILE - CORRIGÉ (MASQUER PRIX EXACT)
    // ============================================
    
    updateVolumeProfileChart() {
        const prices = this.stockData.prices;
        const volumeProfile = this.calculateVolumeProfile(prices);
        
        if (this.charts.volumeProfile) {
            this.charts.volumeProfile.series[0].setData(volumeProfile.profile, true);
        } else {
            this.charts.volumeProfile = Highcharts.chart('volumeProfileChart', {
                chart: { 
                    borderRadius: 15, 
                    height: 500,
                    type: 'bar'
                },
                title: {
                    text: 'Volume Profile - Price Distribution',
                    style: { color: this.colors.primary, fontWeight: 'bold' }
                },
                xAxis: {
                    title: { text: 'Volume' },
                    reversed: false
                },
                yAxis: {
                    title: { text: 'Relative Price Level' },
                    // ✅ CORRECTION 5 - Masquer labels de prix
                    labels: {
                        formatter: function() {
                            return 'Level ' + Math.round(this.value / 10);
                        }
                    },
                    plotLines: [{
                        value: volumeProfile.poc,
                        color: this.colors.danger,
                        dashStyle: 'Dash',
                        width: 3,
                        // ✅ CORRECTION 6 - Supprimer prix dans le label
                        label: { 
                            text: `POC (Point of Control)`,
                            style: { color: this.colors.danger, fontWeight: 'bold' }
                        },
                        zIndex: 5
                    }]
                },
                tooltip: { 
                    borderRadius: 10,
                    // ✅ CORRECTION 7 - Tooltip sans prix exact
                    formatter: function() {
                        return `<b>Relative Level: ${(this.y / 100).toFixed(2)}</b><br>` +
                               `Volume: ${this.x.toLocaleString()}`;
                    }
                },
                legend: { enabled: false },
                series: [{
                    name: 'Volume Profile',
                    data: volumeProfile.profile,
                    color: {
                        linearGradient: { x1: 0, y1: 0, x2: 1, y2: 0 },
                        stops: [
                            [0, this.colors.secondary],
                            [1, this.colors.purple]
                        ]
                    }
                }],
                credits: { enabled: false }
            });
        }
        
        this.displayVolumeProfileSignal(volumeProfile, prices);
    },
    
    calculateVolumeProfile(prices, bins = 30) {
        const priceRange = Math.max(...prices.map(p => p.high)) - Math.min(...prices.map(p => p.low));
        const binSize = priceRange / bins;
        const minPrice = Math.min(...prices.map(p => p.low));
        
        const volumeByPrice = new Array(bins).fill(0);
        const priceLevels = [];
        
        for (let i = 0; i < bins; i++) {
            priceLevels.push(minPrice + (i + 0.5) * binSize);
        }
        
        prices.forEach(p => {
            const typical = (p.high + p.low + p.close) / 3;
            const binIndex = Math.min(Math.floor((typical - minPrice) / binSize), bins - 1);
            if (binIndex >= 0 && binIndex < bins) {
                volumeByPrice[binIndex] += p.volume;
            }
        });
        
        const profile = priceLevels.map((price, i) => [volumeByPrice[i], price]);
        
        const maxVolumeIndex = volumeByPrice.indexOf(Math.max(...volumeByPrice));
        const poc = priceLevels[maxVolumeIndex];
        
        const totalVolume = volumeByPrice.reduce((a, b) => a + b, 0);
        let cumulativeVolume = 0;
        let valueAreaHigh = poc;
        let valueAreaLow = poc;
        
        const sortedIndices = volumeByPrice
            .map((vol, idx) => ({ vol, idx }))
            .sort((a, b) => b.vol - a.vol);
        
        for (let i = 0; i < sortedIndices.length && cumulativeVolume < totalVolume * 0.7; i++) {
            const idx = sortedIndices[i].idx;
            cumulativeVolume += sortedIndices[i].vol;
            valueAreaHigh = Math.max(valueAreaHigh, priceLevels[idx]);
            valueAreaLow = Math.min(valueAreaLow, priceLevels[idx]);
        }
        
        return { profile, poc, valueAreaHigh, valueAreaLow };
    },
    
    // ✅ CORRECTION 8 - displayVolumeProfileSignal - MASQUER PRIX
    displayVolumeProfileSignal(volumeProfile, prices) {
        const lastPrice = prices[prices.length - 1].close;
        const poc = volumeProfile.poc;
        const vah = volumeProfile.valueAreaHigh;
        const val = volumeProfile.valueAreaLow;
        
        // ✅ DISTANCES RELATIVES
        const pocDistance = ((lastPrice - poc) / poc * 100).toFixed(2);
        
        let signal = 'neutral';
        let text = `Distance from POC: ${pocDistance > 0 ? '+' : ''}${pocDistance}% | `;
        
        if (lastPrice > vah) {
            signal = 'bullish';
            text += 'Price ABOVE Value Area - Strong Bullish';
        } else if (lastPrice < val) {
            signal = 'bearish';
            text += 'Price BELOW Value Area - Strong Bearish';
        } else if (Math.abs(lastPrice - poc) / poc < 0.01) {
            signal = 'neutral';
            text += 'Price AT POC - High Liquidity Zone';
        } else if (lastPrice > poc) {
            signal = 'bullish';
            text += 'Price in Upper Value Area - Bullish';
        } else {
            signal = 'bearish';
            text += 'Price in Lower Value Area - Bearish';
        }
        
        const signalBox = document.getElementById('volumeProfileSignal');
        signalBox.className = `signal-box ${signal}`;
        signalBox.textContent = text;
    },
    
    // ============================================
    // ✅ MOVING AVERAGES - CORRIGÉ (SANS CANDLESTICKS)
    // ============================================
    
    updateMovingAveragesChart() {
        const prices = this.stockData.prices;
        const mas = this.calculateMultipleMovingAverages(prices);
        
        // ❌ SUPPRESSION DES OHLC
        
        if (this.charts.movingAverages) {
            this.charts.movingAverages.series[0].setData(mas.sma20, false);
            this.charts.movingAverages.series[1].setData(mas.sma50, false);
            this.charts.movingAverages.series[2].setData(mas.sma200, false);
            this.charts.movingAverages.series[3].setData(mas.ema9, false);
            this.charts.movingAverages.series[4].setData(mas.ema21, false);
            this.charts.movingAverages.redraw();
        } else {
            this.charts.movingAverages = Highcharts.stockChart('movingAveragesChart', {
                chart: { borderRadius: 15, height: 600 },
                title: {
                    text: 'Moving Averages - Multiple Timeframes (Analysis Only)',
                    style: { color: this.colors.primary, fontWeight: 'bold' }
                },
                rangeSelector: { enabled: false },
                navigator: { enabled: true },
                xAxis: { type: 'datetime', crosshair: true },
                yAxis: { title: { text: 'Relative Value' } },
                tooltip: { borderRadius: 10, shared: true },
                series: [
                    // ❌ SUPPRIMÉ : Candlestick series
                    {
                        type: 'line',
                        name: 'SMA 20',
                        data: mas.sma20,
                        color: this.colors.primary,
                        lineWidth: 2,
                        zIndex: 1
                    },
                    {
                        type: 'line',
                        name: 'SMA 50',
                        data: mas.sma50,
                        color: this.colors.orange,
                        lineWidth: 2,
                        zIndex: 1
                    },
                    {
                        type: 'line',
                        name: 'SMA 200',
                        data: mas.sma200,
                        color: this.colors.danger,
                        lineWidth: 3,
                        dashStyle: 'Dash',
                        zIndex: 1
                    },
                    {
                        type: 'line',
                        name: 'EMA 9',
                        data: mas.ema9,
                        color: this.colors.cyan,
                        lineWidth: 1,
                        dashStyle: 'Dot',
                        zIndex: 1
                    },
                    {
                        type: 'line',
                        name: 'EMA 21',
                        data: mas.ema21,
                        color: this.colors.teal,
                        lineWidth: 2,
                        dashStyle: 'Dot',
                        zIndex: 1
                    }
                ],
                credits: { enabled: false }
            });
        }
        
        this.displayMovingAveragesSignal(mas, prices);
    },
    
    calculateMultipleMovingAverages(prices) {
        const closes = prices.map(p => p.close);
        
        const sma20Data = this.calculateSMA(closes, 20);
        const sma50Data = this.calculateSMA(closes, 50);
        const sma200Data = this.calculateSMA(closes, 200);
        const ema9Data = this.calculateEMA(closes, 9);
        const ema21Data = this.calculateEMA(closes, 21);
        
        const sma20 = sma20Data.map((val, i) => [prices[i + 19].timestamp, val]);
        const sma50 = sma50Data.map((val, i) => [prices[i + 49].timestamp, val]);
        const sma200 = sma200Data.map((val, i) => [prices[i + 199].timestamp, val]);
        
        const ema9Offset = prices.length - ema9Data.length;
        const ema21Offset = prices.length - ema21Data.length;
        
        const ema9 = ema9Data.map((val, i) => [prices[ema9Offset + i].timestamp, val]);
        const ema21 = ema21Data.map((val, i) => [prices[ema21Offset + i].timestamp, val]);
        
        return { sma20, sma50, sma200, ema9, ema21 };
    },
    
    calculateSMA(data, period) {
        const sma = [];
        
        for (let i = period - 1; i < data.length; i++) {
            const slice = data.slice(i - period + 1, i + 1);
            const avg = slice.reduce((a, b) => a + b, 0) / period;
            sma.push(avg);
        }
        
        return sma;
    },
    
    displayMovingAveragesSignal(mas, prices) {
        if (!mas.sma20.length || !mas.sma50.length) {
            document.getElementById('movingAveragesSignal').textContent = 'Not enough data';
            return;
        }
        
        const lastPrice = prices[prices.length - 1].close;
        const lastSMA20 = mas.sma20[mas.sma20.length - 1][1];
        const lastSMA50 = mas.sma50[mas.sma50.length - 1][1];
        const lastSMA200 = mas.sma200.length > 0 ? mas.sma200[mas.sma200.length - 1][1] : null;
        
        let signal = 'neutral';
        let text = '';
        
        const goldenCross = lastSMA200 && lastSMA50 > lastSMA200 && mas.sma50[mas.sma50.length - 2][1] <= (mas.sma200[mas.sma200.length - 2]?.[1] || Infinity);
        const deathCross = lastSMA200 && lastSMA50 < lastSMA200 && mas.sma50[mas.sma50.length - 2][1] >= (mas.sma200[mas.sma200.length - 2]?.[1] || 0);
        
        if (goldenCross) {
            signal = 'bullish';
            text = '🌟 GOLDEN CROSS - SMA50 crossed above SMA200 (Major Buy Signal)';
        } else if (deathCross) {
            signal = 'bearish';
            text = '☠ DEATH CROSS - SMA50 crossed below SMA200 (Major Sell Signal)';
        } else if (lastPrice > lastSMA20 && lastPrice > lastSMA50 && lastSMA20 > lastSMA50) {
            signal = 'bullish';
            text = 'STRONG UPTREND - Price above all MAs, aligned bullish';
        } else if (lastPrice < lastSMA20 && lastPrice < lastSMA50 && lastSMA20 < lastSMA50) {
            signal = 'bearish';
            text = 'STRONG DOWNTREND - Price below all MAs, aligned bearish';
        } else if (lastPrice > lastSMA20) {
            signal = 'bullish';
            text = 'Short-term bullish - Price above SMA20';
        } else {
            signal = 'bearish';
            text = 'Short-term bearish - Price below SMA20';
        }
        
        const signalBox = document.getElementById('movingAveragesSignal');
        signalBox.className = `signal-box ${signal}`;
        signalBox.textContent = text;
    },
    
    // ============================================
    // ✅ LINEAR REGRESSION - CORRIGÉ (SANS CANDLESTICKS)
    // ============================================
    
    updateLinearRegressionChart() {
        const prices = this.stockData.prices;
        const regression = this.calculateLinearRegression(prices);
        
        // ❌ SUPPRESSION DES OHLC
        
        if (this.charts.linearRegression) {
            this.charts.linearRegression.series[0].setData(regression.upper, false);
            this.charts.linearRegression.series[1].setData(regression.middle, false);
            this.charts.linearRegression.series[2].setData(regression.lower, false);
            this.charts.linearRegression.redraw();
        } else {
            this.charts.linearRegression = Highcharts.stockChart('linearRegressionChart', {
                chart: { borderRadius: 15, height: 600 },
                title: {
                    text: 'Linear Regression Channel - Analysis Only',
                    style: { color: this.colors.primary, fontWeight: 'bold' }
                },
                rangeSelector: { enabled: false },
                navigator: { enabled: true },
                xAxis: { type: 'datetime', crosshair: true },
                yAxis: { title: { text: 'Relative Position' } },
                tooltip: { borderRadius: 10, shared: true },
                series: [
                    // ❌ SUPPRIMÉ : Candlestick series
                    {
                        type: 'line',
                        name: 'Upper Channel',
                        data: regression.upper,
                        color: this.colors.danger,
                        lineWidth: 2,
                        dashStyle: 'Dash',
                        zIndex: 1
                    },
                    {
                        type: 'line',
                        name: 'Regression Line',
                        data: regression.middle,
                        color: this.colors.primary,
                        lineWidth: 3,
                        zIndex: 1
                    },
                    {
                        type: 'line',
                        name: 'Lower Channel',
                        data: regression.lower,
                        color: this.colors.success,
                        lineWidth: 2,
                        dashStyle: 'Dash',
                        zIndex: 1
                    }
                ],
                credits: { enabled: false }
            });
        }
        
        this.displayLinearRegressionSignal(regression, prices);
    },
    
    calculateLinearRegression(prices, period = 100) {
        const closes = prices.map(p => p.close);
        const n = Math.min(period, closes.length);
        const recentPrices = closes.slice(-n);
        
        let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
        
        for (let i = 0; i < n; i++) {
            sumX += i;
            sumY += recentPrices[i];
            sumXY += i * recentPrices[i];
            sumX2 += i * i;
        }
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        
        const regressionLine = [];
        const deviations = [];
        
        for (let i = 0; i < n; i++) {
            const regValue = slope * i + intercept;
            regressionLine.push(regValue);
            deviations.push(Math.abs(recentPrices[i] - regValue));
        }
        
        const avgDeviation = deviations.reduce((a, b) => a + b, 0) / n;
        const stdDev = Math.sqrt(deviations.reduce((sum, dev) => sum + Math.pow(dev - avgDeviation, 2), 0) / n);
        
        const upper = [];
        const middle = [];
        const lower = [];
        
        const startIndex = prices.length - n;
        
        for (let i = 0; i < n; i++) {
            const timestamp = prices[startIndex + i].timestamp;
            const regValue = regressionLine[i];
            
            upper.push([timestamp, regValue + 2 * stdDev]);
            middle.push([timestamp, regValue]);
            lower.push([timestamp, regValue - 2 * stdDev]);
        }
        
        return { upper, middle, lower, slope };
    },
    
    displayLinearRegressionSignal(regression, prices) {
        if (!regression.middle.length) {
            document.getElementById('linearRegressionSignal').textContent = 'Not enough data';
            return;
        }
        
        const lastPrice = prices[prices.length - 1].close;
        const lastMiddle = regression.middle[regression.middle.length - 1][1];
        const lastUpper = regression.upper[regression.upper.length - 1][1];
        const lastLower = regression.lower[regression.lower.length - 1][1];
        const slope = regression.slope;
        
        let signal = 'neutral';
        let text = '';
        
        const trendText = slope > 0 ? 'UPTREND' : slope < 0 ? 'DOWNTREND' : 'SIDEWAYS';
        const trendStrength = Math.abs(slope) > 1 ? 'Strong' : Math.abs(slope) > 0.3 ? 'Moderate' : 'Weak';
        
        text = `${trendStrength} ${trendText} (Slope: ${slope.toFixed(4)}) | `;
        
        if (lastPrice > lastUpper) {
            signal = slope > 0 ? 'bullish' : 'bearish';
            text += 'Price ABOVE Upper Channel - Overbought';
        } else if (lastPrice < lastLower) {
            signal = slope > 0 ? 'bullish' : 'bearish';
            text += 'Price BELOW Lower Channel - Oversold';
        } else if (lastPrice > lastMiddle) {
            signal = 'bullish';
            text += 'Above Regression Line - Bullish Bias';
        } else {
            signal = 'bearish';
            text += 'Below Regression Line - Bearish Bias';
        }
        
        const signalBox = document.getElementById('linearRegressionSignal');
        signalBox.className = `signal-box ${signal}`;
        signalBox.textContent = text;
    },
    
    // ============================================
    // ✅ CANDLESTICK PATTERNS - CONSERVÉ (OK)
    // ============================================
    
    detectCandlestickPatterns() {
        const prices = this.stockData.prices;
        const patterns = this.findCandlestickPatterns(prices);
        
        this.displayCandlestickPatterns(patterns);
    },
    
    findCandlestickPatterns(prices) {
        const detected = [];
        
        for (let i = 2; i < prices.length; i++) {
            const current = prices[i];
            const prev = prices[i - 1];
            const prev2 = prices[i - 2];
            
            const currentBody = Math.abs(current.close - current.open);
            const prevBody = Math.abs(prev.close - prev.open);
            
            const currentRange = current.high - current.low;
            const prevRange = prev.high - prev.low;
            
            // Doji
            if (currentBody / currentRange < 0.1) {
                detected.push({ pattern: 'Doji', signal: 'neutral', strength: 'medium', index: i });
            }
            
            // Hammer / Hanging Man
            const lowerShadow = Math.min(current.open, current.close) - current.low;
            const upperShadow = current.high - Math.max(current.open, current.close);
            
            if (lowerShadow > currentBody * 2 && upperShadow < currentBody * 0.5) {
                if (prev.close < prev.open) {
                    detected.push({ pattern: 'Hammer', signal: 'bullish', strength: 'strong', index: i });
                } else {
                    detected.push({ pattern: 'Hanging Man', signal: 'bearish', strength: 'medium', index: i });
                }
            }
            
            // Inverted Hammer / Shooting Star
            if (upperShadow > currentBody * 2 && lowerShadow < currentBody * 0.5) {
                if (prev.close < prev.open) {
                    detected.push({ pattern: 'Inverted Hammer', signal: 'bullish', strength: 'medium', index: i });
                } else {
                    detected.push({ pattern: 'Shooting Star', signal: 'bearish', strength: 'strong', index: i });
                }
            }
            
            // Engulfing
            if (current.close > current.open && prev.close < prev.open &&
                current.open < prev.close && current.close > prev.open) {
                detected.push({ pattern: 'Bullish Engulfing', signal: 'bullish', strength: 'strong', index: i });
            }
            
            if (current.close < current.open && prev.close > prev.open &&
                current.open > prev.close && current.close < prev.open) {
                detected.push({ pattern: 'Bearish Engulfing', signal: 'bearish', strength: 'strong', index: i });
            }
            
            // Morning Star / Evening Star
            if (i >= 2) {
                const isMorningStar = prev2.close < prev2.open && 
                                      prevBody < currentBody * 0.5 && 
                                      current.close > current.open &&
                                      current.close > (prev2.open + prev2.close) / 2;
                
                if (isMorningStar) {
                    detected.push({ pattern: 'Morning Star', signal: 'bullish', strength: 'very strong', index: i });
                }
                
                const isEveningStar = prev2.close > prev2.open && 
                                      prevBody < currentBody * 0.5 && 
                                      current.close < current.open &&
                                      current.close < (prev2.open + prev2.close) / 2;
                
                if (isEveningStar) {
                    detected.push({ pattern: 'Evening Star', signal: 'bearish', strength: 'very strong', index: i });
                }
            }
            
            // Piercing Line / Dark Cloud Cover
            if (current.close > current.open && prev.close < prev.open &&
                current.open < prev.low && current.close > (prev.open + prev.close) / 2 &&
                current.close < prev.open) {
                detected.push({ pattern: 'Piercing Line', signal: 'bullish', strength: 'strong', index: i });
            }
            
            if (current.close < current.open && prev.close > prev.open &&
                current.open > prev.high && current.close < (prev.open + prev.close) / 2 &&
                current.close > prev.open) {
                detected.push({ pattern: 'Dark Cloud Cover', signal: 'bearish', strength: 'strong', index: i });
            }
        }
        
        return detected.slice(-10);
    },
    
    displayCandlestickPatterns(patterns) {
        const container = document.getElementById('candlestickPatterns');
        
        if (!patterns.length) {
            container.innerHTML = '<p style="text-align: center; color: #999;">No significant patterns detected recently</p>';
            return;
        }
        
        let html = '<table><thead><tr><th>Pattern</th><th>Signal</th><th>Strength</th><th>When</th></tr></thead><tbody>';
        
        patterns.forEach(p => {
            const signalClass = p.signal === 'bullish' ? 'bullish' : p.signal === 'bearish' ? 'bearish' : 'neutral';
            const strengthBadge = `<span class="strength-badge ${p.strength.replace(' ', '-')}">${p.strength.toUpperCase()}</span>`;
            const daysAgo = this.stockData.prices.length - 1 - p.index;
            const when = daysAgo === 0 ? 'Today' : `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`;
            
            html += `
                <tr>
                    <td><strong>${p.pattern}</strong></td>
                    <td><span class="signal-badge ${signalClass}">${p.signal.toUpperCase()}</span></td>
                    <td>${strengthBadge}</td>
                    <td>${when}</td>
                </tr>
            `;
        });
        
        html += '</tbody></table>';
        container.innerHTML = html;
    },
    
    // ============================================
    // ✅ SUPPORT/RESISTANCE - CORRIGÉ (DISTANCES RELATIVES)
    // ============================================
    
    detectSupportResistance() {
        const prices = this.stockData.prices;
        const levels = this.findSupportResistanceLevels(prices);
        
        this.displaySupportResistance(levels);
    },
    
    findSupportResistanceLevels(prices, sensitivity = 0.02) {
        const highs = [];
        const lows = [];
        
        for (let i = 2; i < prices.length - 2; i++) {
            if (prices[i].high > prices[i-1].high && prices[i].high > prices[i-2].high &&
                prices[i].high > prices[i+1].high && prices[i].high > prices[i+2].high) {
                highs.push(prices[i].high);
            }
            
            if (prices[i].low < prices[i-1].low && prices[i].low < prices[i-2].low &&
                prices[i].low < prices[i+1].low && prices[i].low < prices[i+2].low) {
                lows.push(prices[i].low);
            }
        }
        
        const clusterLevels = (levels) => {
            if (levels.length === 0) return [];
            
            levels.sort((a, b) => a - b);
            const clusters = [];
            let currentCluster = [levels[0]];
            
            for (let i = 1; i < levels.length; i++) {
                if (Math.abs(levels[i] - currentCluster[0]) / currentCluster[0] < sensitivity) {
                    currentCluster.push(levels[i]);
                } else {
                    clusters.push(currentCluster.reduce((a, b) => a + b, 0) / currentCluster.length);
                    currentCluster = [levels[i]];
                }
            }
            
            clusters.push(currentCluster.reduce((a, b) => a + b, 0) / currentCluster.length);
            return clusters;
        };
        
        const resistance = clusterLevels(highs).slice(-5);
        const support = clusterLevels(lows).slice(-5);
        
        return { resistance, support };
    },
    
    // ✅ CORRECTION 9 - displaySupportResistance - AFFICHER UNIQUEMENT DISTANCES %
    displaySupportResistance(levels) {
        const container = document.getElementById('supportResistance');
        const currentPrice = this.stockData.prices[this.stockData.prices.length - 1].close;
        
        let html = '<div class="sr-grid">';
        
        html += '<div class="sr-column"><h4>🔴 Resistance Levels</h4><ul>';
        levels.resistance.sort((a, b) => b - a).forEach((level, index) => {
            const distance = ((level - currentPrice) / currentPrice) * 100;
            // ❌ SUPPRESSION DU PRIX - ✅ AFFICHER SEULEMENT LABEL + DISTANCE
            html += `<li>Level R${index + 1} <span class="distance">(+${distance.toFixed(2)}%)</span></li>`;
        });
        html += '</ul></div>';
        
        html += '<div class="sr-column"><h4>🟢 Support Levels</h4><ul>';
        levels.support.sort((a, b) => b - a).forEach((level, index) => {
            const distance = ((currentPrice - level) / currentPrice) * 100;
            // ❌ SUPPRESSION DU PRIX - ✅ AFFICHER SEULEMENT LABEL + DISTANCE
            html += `<li>Level S${index + 1} <span class="distance">(-${distance.toFixed(2)}%)</span></li>`;
        });
        html += '</ul></div>';
        
        html += '</div>';
        
        container.innerHTML = html;
    },
    
    // ============================================
    // ✅ DIVERGENCES - CONSERVÉ (OK)
    // ============================================
    
    detectDivergences() {
        const prices = this.stockData.prices;
        const rsi = this.calculateRSI(prices);
        const macd = this.calculateMACD(prices);
        
        const divergences = this.findDivergences(prices, rsi, macd);
        
        this.displayDivergences(divergences);
    },
    
    findDivergences(prices, rsi, macd) {
        const divergences = [];
        const lookback = 20;
        
        if (prices.length < lookback || rsi.length < lookback) return divergences;
        
        const recentPrices = prices.slice(-lookback);
        const recentRSI = rsi.slice(-lookback);
        
        for (let i = 5; i < lookback - 5; i++) {
            const priceHigh1 = recentPrices[i].high;
            const priceHigh2 = Math.max(...recentPrices.slice(i + 1, i + 6).map(p => p.high));
            
            const rsiVal1 = recentRSI[i][1];
            const rsiVal2 = Math.max(...recentRSI.slice(i + 1, i + 6).map(r => r[1]));
            
            if (priceHigh2 > priceHigh1 && rsiVal2 < rsiVal1) {
                divergences.push({
                    type: 'Bearish Divergence (RSI)',
                    signal: 'bearish',
                    description: 'Price making higher highs, RSI making lower highs'
                });
                break;
            }
            
            const priceLow1 = recentPrices[i].low;
            const priceLow2 = Math.min(...recentPrices.slice(i + 1, i + 6).map(p => p.low));
            
            if (priceLow2 < priceLow1 && rsiVal2 > rsiVal1) {
                divergences.push({
                    type: 'Bullish Divergence (RSI)',
                    signal: 'bullish',
                    description: 'Price making lower lows, RSI making higher lows'
                });
                break;
            }
        }
        
        return divergences;
    },
    
    displayDivergences(divergences) {
        const container = document.getElementById('divergences');
        
        if (!divergences.length) {
            container.innerHTML = '<p style="text-align: center; color: #999;">No divergences detected recently</p>';
            return;
        }
        
        let html = '<ul>';
        divergences.forEach(div => {
            const signalClass = div.signal === 'bullish' ? 'bullish' : 'bearish';
            html += `
                <li class="divergence-item ${signalClass}">
                    <strong>${div.type}</strong>
                    <p>${div.description}</p>
                </li>
            `;
        });
        html += '</ul>';
        
        container.innerHTML = html;
    },

    // ============================================
    // ✅ INDICATEURS ORIGINAUX CONSERVÉS (PARTIE DÉJÀ FOURNIE)
    // Ichimoku, Stochastic, Williams, ADX, SAR, OBV, ATR
    // ============================================
    
    // (Code déjà fourni dans la partie 1)
    
    // ============================================
    // ✅ FIBONACCI - CORRIGÉ (POSITIONS RELATIVES)
    // ============================================
    
    updateFibonacciChart() {
        const prices = this.stockData.prices;
        const fibonacci = this.calculateFibonacci(prices);
        
        // ❌ SUPPRESSION DES CANDLESTICKS
        
        if (this.charts.fibonacci) {
            this.charts.fibonacci.yAxis[0].update({
                plotLines: fibonacci.levels.map(level => ({
                    value: level.price,
                    color: this.getColorForFibLevel(level.ratio),
                    dashStyle: 'Dash',
                    width: 2,
                    // ✅ CORRECTION 10 - Label sans prix exact
                    label: {
                        text: `${level.name}`,
                        align: 'right',
                        style: {
                            color: this.getColorForFibLevel(level.ratio),
                            fontWeight: level.ratio === 0.618 ? 'bold' : 'normal'
                        }
                    },
                    zIndex: 5
                }))
            }, false);
            this.charts.fibonacci.redraw();
        } else {
            this.charts.fibonacci = Highcharts.stockChart('fibonacciChart', {
                chart: { borderRadius: 15, height: 600 },
                title: {
                    text: 'Fibonacci Retracements - Analysis Only',
                    style: { color: this.colors.primary, fontWeight: 'bold' }
                },
                rangeSelector: { enabled: false },
                navigator: { enabled: false },
                xAxis: { type: 'datetime', crosshair: true },
                yAxis: {
                    title: { text: 'Relative Position' },
                    plotLines: fibonacci.levels.map(level => ({
                        value: level.price,
                        color: this.getColorForFibLevel(level.ratio),
                        dashStyle: 'Dash',
                        width: 2,
                        label: {
                            text: `${level.name}`,
                            align: 'right',
                            style: {
                                color: this.getColorForFibLevel(level.ratio),
                                fontWeight: level.ratio === 0.618 ? 'bold' : 'normal'
                            }
                        },
                        zIndex: 5
                    }))
                },
                tooltip: { borderRadius: 10, shared: true },
                series: [],
                credits: { enabled: false }
            });
        }
        
        this.displayFibonacciLevels(fibonacci);
    },
    
    calculateFibonacci(prices) {
        const high = Math.max(...prices.map(p => p.high));
        const low = Math.min(...prices.map(p => p.low));
        const diff = high - low;
        
        const ratios = [
            { ratio: 0, name: '0% (High)' },
            { ratio: 0.236, name: '23.6%' },
            { ratio: 0.382, name: '38.2%' },
            { ratio: 0.5, name: '50%' },
            { ratio: 0.618, name: '61.8% (Golden)' },
            { ratio: 0.786, name: '78.6%' },
            { ratio: 1, name: '100% (Low)' }
        ];
        
        const levels = ratios.map(r => ({
            ratio: r.ratio,
            name: r.name,
            price: high - (diff * r.ratio)
        }));
        
        return { high, low, levels };
    },
    
    getColorForFibLevel(ratio) {
        if (ratio === 0.618) return this.colors.danger;
        if (ratio === 0 || ratio === 1) return this.colors.primary;
        return this.colors.lightBlue;
    },
    
    // ✅ CORRECTION 11 - displayFibonacciLevels - POSITIONS RELATIVES
    displayFibonacciLevels(fibonacci) {
        const currentPrice = this.stockData.prices[this.stockData.prices.length - 1].close;
        
        const tableHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Level</th>
                        <th>Distance from Current</th>
                        <th>Type</th>
                    </tr>
                </thead>
                <tbody>
                    ${fibonacci.levels.map(level => {
                        const distance = ((level.price - currentPrice) / currentPrice) * 100;
                        const distanceText = `${distance >= 0 ? '+' : ''}${distance.toFixed(2)}%`;
                        const type = level.price > currentPrice ? 'Resistance' : 'Support';
                        
                        return `
                            <tr>
                                <td class='level-name'>${level.name}</td>
                                <td style='color: ${distance >= 0 ? this.colors.danger : this.colors.success}'>${distanceText}</td>
                                <td style='color: ${type === 'Resistance' ? this.colors.danger : this.colors.success}'>${type}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
        
        document.getElementById('fibonacciLevels').innerHTML = tableHTML;
    },
    
    // ============================================
    // ✅ PIVOT POINTS - CORRIGÉ (DISTANCES %)
    // ============================================
    
    createPivotPoints() {
        const prices = this.stockData.prices;
        const lastPrice = prices[prices.length - 1];
        const prevPrice = prices[prices.length - 2];
        
        const high = prevPrice.high;
        const low = prevPrice.low;
        const close = prevPrice.close;
        
        const standard = this.calculateStandardPivots(high, low, close);
        this.displayPivotCard('pivotStandard', standard, lastPrice.close);
        
        const fibonacci = this.calculateFibonacciPivots(high, low, close);
        this.displayPivotCard('pivotFibonacci', fibonacci, lastPrice.close);
        
        const camarilla = this.calculateCamarillaPivots(high, low, close);
        this.displayPivotCard('pivotCamarilla', camarilla, lastPrice.close);
    },
    
    calculateStandardPivots(high, low, close) {
        const pivot = (high + low + close) / 3;
        
        return {
            R3: high + 2 * (pivot - low),
            R2: pivot + (high - low),
            R1: 2 * pivot - low,
            P: pivot,
            S1: 2 * pivot - high,
            S2: pivot - (high - low),
            S3: low - 2 * (high - pivot)
        };
    },
    
    calculateFibonacciPivots(high, low, close) {
        const pivot = (high + low + close) / 3;
        const range = high - low;
        
        return {
            R3: pivot + range * 1.000,
            R2: pivot + range * 0.618,
            R1: pivot + range * 0.382,
            P: pivot,
            S1: pivot - range * 0.382,
            S2: pivot - range * 0.618,
            S3: pivot - range * 1.000
        };
    },
    
    calculateCamarillaPivots(high, low, close) {
        const range = high - low;
        
        return {
            R4: close + range * 1.1 / 2,
            R3: close + range * 1.1 / 4,
            R2: close + range * 1.1 / 6,
            R1: close + range * 1.1 / 12,
            P: close,
            S1: close - range * 1.1 / 12,
            S2: close - range * 1.1 / 6,
            S3: close - range * 1.1 / 4,
            S4: close - range * 1.1 / 2
        };
    },
    
    // ✅ CORRECTION 12 - displayPivotCard - AFFICHER DISTANCES %
    displayPivotCard(elementId, pivots, currentPrice) {
        const container = document.getElementById(elementId);
        if (!container) return;
        
        const valuesContainer = container.querySelector('.pivot-values');
        if (!valuesContainer) return;
        
        const entries = Object.entries(pivots).sort((a, b) => b[1] - a[1]);
        
        const html = entries.map(([label, value]) => {
            let className = 'pivot-level';
            if (label.startsWith('R')) className += ' resistance';
            else if (label.startsWith('S')) className += ' support';
            else className += ' pivot';
            
            const distance = ((value - currentPrice) / currentPrice) * 100;
            const distanceText = `${distance >= 0 ? '+' : ''}${distance.toFixed(2)}%`;
            
            return `
                <div class='${className}'>
                    <span class='pivot-label'>${label}</span>
                    <span class='pivot-value'><strong>${distanceText}</strong></span>
                </div>
            `;
        }).join('');
        
        valuesContainer.innerHTML = html;
    },
    
    // ============================================
    // ✅ VWAP - CORRIGÉ (MASQUER PRIX EXACTS)
    // ============================================
    
    updateVWAPChart() {
        const prices = this.stockData.prices;
        const vwap = this.calculateVWAP(prices);
        
        // ❌ SUPPRESSION DES CANDLESTICKS
        
        if (this.charts.vwap) {
            this.charts.vwap.series[0].setData(vwap.vwap, false);
            this.charts.vwap.series[1].setData(vwap.upperBand1, false);
            this.charts.vwap.series[2].setData(vwap.upperBand2, false);
            this.charts.vwap.series[3].setData(vwap.lowerBand1, false);
            this.charts.vwap.series[4].setData(vwap.lowerBand2, false);
            this.charts.vwap.redraw();
        } else {
            this.charts.vwap = Highcharts.stockChart('vwapChart', {
                chart: { borderRadius: 15, height: 600 },
                title: {
                    text: 'VWAP with Standard Deviation Bands - Analysis Only',
                    style: { color: this.colors.primary, fontWeight: 'bold' }
                },
                rangeSelector: { enabled: false },
                navigator: { enabled: true },
                xAxis: { type: 'datetime', crosshair: true },
                yAxis: { title: { text: 'Relative Value' } },
                tooltip: { borderRadius: 10, shared: true },
                series: [
                    // ❌ SUPPRIMÉ : Candlestick series
                    {
                        type: 'line',
                        name: 'VWAP',
                        data: vwap.vwap,
                        color: this.colors.primary,
                        lineWidth: 3,
                        zIndex: 3
                    },
                    {
                        type: 'line',
                        name: 'Upper Band (+1 SD)',
                        data: vwap.upperBand1,
                        color: this.colors.danger,
                        lineWidth: 1,
                        dashStyle: 'Dash',
                        zIndex: 1
                    },
                    {
                        type: 'line',
                        name: 'Upper Band (+2 SD)',
                        data: vwap.upperBand2,
                        color: this.colors.danger,
                        lineWidth: 1,
                        dashStyle: 'Dot',
                        zIndex: 1
                    },
                    {
                        type: 'line',
                        name: 'Lower Band (-1 SD)',
                        data: vwap.lowerBand1,
                        color: this.colors.success,
                        lineWidth: 1,
                        dashStyle: 'Dash',
                        zIndex: 1
                    },
                    {
                        type: 'line',
                        name: 'Lower Band (-2 SD)',
                        data: vwap.lowerBand2,
                        color: this.colors.success,
                        lineWidth: 1,
                        dashStyle: 'Dot',
                        zIndex: 1
                    }
                ],
                credits: { enabled: false }
            });
        }
        
        this.displayVWAPSignal(vwap, prices);
    },
    
    calculateVWAP(prices) {
        const vwapArray = [];
        const upperBand1 = [];
        const upperBand2 = [];
        const lowerBand1 = [];
        const lowerBand2 = [];
        
        let cumulativeTPV = 0;
        let cumulativeVolume = 0;
        const squaredDiffs = [];
        
        for (let i = 0; i < prices.length; i++) {
            const typical = (prices[i].high + prices[i].low + prices[i].close) / 3;
            const tpv = typical * prices[i].volume;
            
            cumulativeTPV += tpv;
            cumulativeVolume += prices[i].volume;
            
            const vwapValue = cumulativeTPV / cumulativeVolume;
            vwapArray.push([prices[i].timestamp, vwapValue]);
            
            squaredDiffs.push(Math.pow(typical - vwapValue, 2) * prices[i].volume);
            const variance = squaredDiffs.reduce((a, b) => a + b, 0) / cumulativeVolume;
            const stdDev = Math.sqrt(variance);
            
            upperBand1.push([prices[i].timestamp, vwapValue + stdDev]);
            upperBand2.push([prices[i].timestamp, vwapValue + 2 * stdDev]);
            lowerBand1.push([prices[i].timestamp, vwapValue - stdDev]);
            lowerBand2.push([prices[i].timestamp, vwapValue - 2 * stdDev]);
        }
        
        return { vwap: vwapArray, upperBand1, upperBand2, lowerBand1, lowerBand2 };
    },
    
    // ✅ CORRECTION 13 - displayVWAPSignal - MASQUER PRIX EXACTS
    displayVWAPSignal(vwap, prices) {
        if (!vwap.vwap.length) {
            document.getElementById('vwapSignal').textContent = 'Not enough data';
            return;
        }
        
        const lastPrice = prices[prices.length - 1].close;
        const lastVWAP = vwap.vwap[vwap.vwap.length - 1][1];
        const lastUpper1 = vwap.upperBand1[vwap.upperBand1.length - 1][1];
        const lastLower1 = vwap.lowerBand1[vwap.lowerBand1.length - 1][1];
        
        // ✅ POSITION RELATIVE
        const vwapDistance = ((lastPrice - lastVWAP) / lastVWAP * 100).toFixed(2);
        
        let signal = 'neutral';
        let text = `Position vs VWAP: ${vwapDistance > 0 ? '+' : ''}${vwapDistance}% - `;
        
        if (lastPrice > lastVWAP) {
            signal = 'bullish';
            text += 'Price above VWAP - Bullish (Institutional Support)';
        } else if (lastPrice < lastVWAP) {
            signal = 'bearish';
            text += 'Price below VWAP - Bearish (Institutional Resistance)';
        } else {
            text += 'Price at VWAP - Fair Value';
        }
        
        if (lastPrice > lastUpper1) {
            text += ' | Overbought (Above +1 SD)';
        } else if (lastPrice < lastLower1) {
            text += ' | Oversold (Below -1 SD)';
        }
        
        const signalBox = document.getElementById('vwapSignal');
        signalBox.className = `signal-box ${signal}`;
        signalBox.textContent = text;
    },
    
    // ============================================
    // ✅ CONSOLIDATED TRADING SIGNALS (SANS PRIX)
    // ============================================
    
    generateConsolidatedSignals() {
        const prices = this.stockData.prices;
        const signals = [];
        
        // Calculer TOUS les indicateurs
        const stochastic = this.calculateStochastic(prices);
        const williams = this.calculateWilliams(prices);
        const adxData = this.calculateADX(prices);
        const sar = this.calculateSAR(prices);
        const obv = this.calculateOBV(prices);
        const vwap = this.calculateVWAP(prices);
        const ichimoku = this.calculateIchimoku(prices);
        const rsi = this.calculateRSI(prices);
        const macd = this.calculateMACD(prices);
        const bollinger = this.calculateBollingerBands(prices);
        const mfi = this.calculateMFI(prices);
        const cci = this.calculateCCI(prices);
        const ultimate = this.calculateUltimateOscillator(prices);
        const roc = this.calculateROC(prices);
        const aroon = this.calculateAroon(prices);
        const keltner = this.calculateKeltnerChannels(prices);
        const donchian = this.calculateDonchianChannels(prices);
        const cmf = this.calculateCMF(prices);
        const elderRay = this.calculateElderRay(prices);
        const mas = this.calculateMultipleMovingAverages(prices);
        
        // RSI
        if (rsi.length > 0) {
            const lastRSI = rsi[rsi.length - 1][1];
            let rsiSignal = 0;
            if (lastRSI < 30) rsiSignal = 1;
            else if (lastRSI > 70) rsiSignal = -1;
            signals.push({ name: 'RSI', value: lastRSI.toFixed(2), signal: rsiSignal });
        }
        
        // MACD
        if (macd.histogram.length > 0) {
            const lastHist = macd.histogram[macd.histogram.length - 1][1];
            const macdSignal = lastHist > 0 ? 1 : lastHist < 0 ? -1 : 0;
            signals.push({ name: 'MACD', value: lastHist.toFixed(4), signal: macdSignal });
        }
        
        // Bollinger Bands
        if (bollinger.upper.length > 0) {
            const lastPrice = prices[prices.length - 1].close;
            const lastUpper = bollinger.upper[bollinger.upper.length - 1][1];
            const lastLower = bollinger.lower[bollinger.lower.length - 1][1];
            let bbSignal = 0;
            if (lastPrice < lastLower) bbSignal = 1;
            else if (lastPrice > lastUpper) bbSignal = -1;
            signals.push({ name: 'Bollinger', value: 'N/A', signal: bbSignal });
        }
        
        // MFI
        if (mfi.length > 0) {
            const lastMFI = mfi[mfi.length - 1][1];
            let mfiSignal = 0;
            if (lastMFI < 20) mfiSignal = 1;
            else if (lastMFI > 80) mfiSignal = -1;
            signals.push({ name: 'MFI', value: lastMFI.toFixed(2), signal: mfiSignal });
        }
        
        // CCI
        if (cci.length > 0) {
            const lastCCI = cci[cci.length - 1][1];
            let cciSignal = 0;
            if (lastCCI < -100) cciSignal = 1;
            else if (lastCCI > 100) cciSignal = -1;
            signals.push({ name: 'CCI', value: lastCCI.toFixed(2), signal: cciSignal });
        }
        
        // Ultimate Oscillator
        if (ultimate.length > 0) {
            const lastUO = ultimate[ultimate.length - 1][1];
            let uoSignal = 0;
            if (lastUO < 30) uoSignal = 1;
            else if (lastUO > 70) uoSignal = -1;
            signals.push({ name: 'Ultimate Osc', value: lastUO.toFixed(2), signal: uoSignal });
        }
        
        // ROC
        if (roc.length > 0) {
            const lastROC = roc[roc.length - 1][1];
            const rocSignal = lastROC > 0 ? 1 : lastROC < 0 ? -1 : 0;
            signals.push({ name: 'ROC', value: lastROC.toFixed(2) + '%', signal: rocSignal });
        }
        
        // Aroon
        if (aroon.up.length > 0 && aroon.down.length > 0) {
            const lastUp = aroon.up[aroon.up.length - 1][1];
            const lastDown = aroon.down[aroon.down.length - 1][1];
            const aroonSignal = lastUp > lastDown ? 1 : -1;
            signals.push({ name: 'Aroon', value: 'N/A', signal: aroonSignal });
        }
        
        // CMF
        if (cmf.length > 0) {
            const lastCMF = cmf[cmf.length - 1][1];
            const cmfSignal = lastCMF > 0 ? 1 : lastCMF < 0 ? -1 : 0;
            signals.push({ name: 'CMF', value: lastCMF.toFixed(4), signal: cmfSignal });
        }
        
        // Elder Ray
        if (elderRay.bullPower.length > 0 && elderRay.bearPower.length > 0) {
            const lastBull = elderRay.bullPower[elderRay.bullPower.length - 1][1];
            const lastBear = elderRay.bearPower[elderRay.bearPower.length - 1][1];
            let elderSignal = 0;
            if (lastBull > 0 && lastBear > 0) elderSignal = 1;
            else if (lastBull < 0 && lastBear < 0) elderSignal = -1;
            signals.push({ name: 'Elder Ray', value: 'N/A', signal: elderSignal });
        }
        
        // Moving Averages
        if (mas.sma20.length > 0 && mas.sma50.length > 0) {
            const lastPrice = prices[prices.length - 1].close;
            const lastSMA20 = mas.sma20[mas.sma20.length - 1][1];
            const lastSMA50 = mas.sma50[mas.sma50.length - 1][1];
            let maSignal = 0;
            if (lastPrice > lastSMA20 && lastSMA20 > lastSMA50) maSignal = 1;
            else if (lastPrice < lastSMA20 && lastSMA20 < lastSMA50) maSignal = -1;
            signals.push({ name: 'Moving Averages', value: 'N/A', signal: maSignal });
        }
        
        // Stochastic
        if (stochastic.k.length > 0) {
            const lastK = stochastic.k[stochastic.k.length - 1][1];
            let stochasticSignal = 0;
            if (lastK < 20) stochasticSignal = 1;
            else if (lastK > 80) stochasticSignal = -1;
            signals.push({ name: 'Stochastic', value: lastK.toFixed(2), signal: stochasticSignal });
        }
        
        // Williams %R
        if (williams.length > 0) {
            const lastWilliams = williams[williams.length - 1][1];
            let williamsSignal = 0;
            if (lastWilliams < -80) williamsSignal = 1;
            else if (lastWilliams > -20) williamsSignal = -1;
            signals.push({ name: 'Williams %R', value: lastWilliams.toFixed(2), signal: williamsSignal });
        }
        
        // ADX
        let adxSignal = 0;
        let adxValue = 'N/A';
        if (adxData.adx.length > 0 && adxData.plusDI.length > 0 && adxData.minusDI.length > 0) {
            const lastADX = adxData.adx[adxData.adx.length - 1][1];
            const lastPlusDI = adxData.plusDI[adxData.plusDI.length - 1][1];
            const lastMinusDI = adxData.minusDI[adxData.minusDI.length - 1][1];
            adxValue = lastADX.toFixed(2);
            if (lastADX > 25) {
                if (lastPlusDI > lastMinusDI) adxSignal = 1;
                else adxSignal = -1;
            }
        }
        signals.push({ name: 'ADX', value: adxValue, signal: adxSignal });
        
        // Parabolic SAR
        if (sar.length > 0) {
            const lastPrice = prices[prices.length - 1].close;
            const lastSAR = sar[sar.length - 1][1];
            const sarSignal = lastPrice > lastSAR ? 1 : -1;
            const sarPosition = ((lastPrice - lastSAR) / lastSAR * 100).toFixed(2);
            signals.push({ name: 'Parabolic SAR', value: sarPosition + '%', signal: sarSignal });
        }
        
        // OBV
        if (obv.length >= 20) {
            const recentOBV = obv.slice(-20);
            const obvTrend = recentOBV[recentOBV.length - 1][1] - recentOBV[0][1];
            const obvSignal = obvTrend > 0 ? 1 : obvTrend < 0 ? -1 : 0;
            signals.push({ name: 'OBV', value: obvTrend > 0 ? 'Rising' : obvTrend < 0 ? 'Falling' : 'Flat', signal: obvSignal });
        }
        
        // VWAP
        if (vwap.vwap.length > 0) {
            const lastPrice = prices[prices.length - 1].close;
            const lastVWAP = vwap.vwap[vwap.vwap.length - 1][1];
            const vwapSignal = lastPrice > lastVWAP ? 1 : lastPrice < lastVWAP ? -1 : 0;
            const vwapPosition = ((lastPrice - lastVWAP) / lastVWAP * 100).toFixed(2);
            signals.push({ name: 'VWAP', value: vwapPosition + '%', signal: vwapSignal });
        }
        
        // Ichimoku Cloud
        if (ichimoku.spanA.length > 0 && ichimoku.spanB.length > 0) {
            const lastPrice = prices[prices.length - 1].close;
            const lastCloudTop = Math.max(
                ichimoku.spanA[ichimoku.spanA.length - 1]?.[1] || 0,
                ichimoku.spanB[ichimoku.spanB.length - 1]?.[1] || 0
            );
            const lastCloudBottom = Math.min(
                ichimoku.spanA[ichimoku.spanA.length - 1]?.[1] || Infinity,
                ichimoku.spanB[ichimoku.spanB.length - 1]?.[1] || Infinity
            );
            
            let ichimokuSignal = 0;
            let ichimokuValue = 'In Cloud';
            
            if (lastPrice > lastCloudTop) {
                ichimokuSignal = 1;
                ichimokuValue = 'Above Cloud';
            } else if (lastPrice < lastCloudBottom) {
                ichimokuSignal = -1;
                ichimokuValue = 'Below Cloud';
            }
            
            signals.push({ name: 'Ichimoku Cloud', value: ichimokuValue, signal: ichimokuSignal });
        }
        
        // Calculate consolidated signal
        if (signals.length > 0) {
            const totalSignal = signals.reduce((sum, s) => sum + s.signal, 0);
            const maxSignal = signals.length;
            const signalPercentage = ((totalSignal + maxSignal) / (2 * maxSignal)) * 100;
            
            this.displayConsolidatedSignals(signals, signalPercentage);
        }
    },

    // ============================================
    // 🤖 ALPHY AI RECOMMENDATION ENGINE
    // Wall Street Grade Multi-Horizon Analysis
    // ============================================

    generateAIRecommendation() {
        console.log('🤖 Alphy AI - Generating institutional-grade recommendation...');
        
        const prices = this.stockData.prices;
        const currentPrice = prices[prices.length - 1].close;
        
        const technicalSignals = this.collectAllTechnicalSignals(prices);
        const aiScore = this.calculateAIConfidenceScore(technicalSignals);
        const horizonRecommendations = this.generateHorizonRecommendations(
            prices, 
            currentPrice, 
            technicalSignals, 
            aiScore
        );
        const riskReward = this.analyzeRiskReward(prices, technicalSignals);
        const professionalSummary = this.generateProfessionalSummary(
            aiScore,
            horizonRecommendations,
            riskReward,
            technicalSignals
        );
        
        this.displayAIRecommendation(aiScore, technicalSignals);
        this.displayHorizonRecommendations(horizonRecommendations, currentPrice);
        this.displayRiskReward(riskReward);
        this.displayProfessionalSummary(professionalSummary);
        
        console.log('✅ Alphy AI Recommendation generated successfully');
    },

    // ============================================
    // 📊 COLLECTE DE TOUS LES SIGNAUX TECHNIQUES
    // ============================================

    collectAllTechnicalSignals(prices) {
        const signals = {
            momentum: [],
            trend: [],
            volatility: [],
            volume: [],
            price: [],
            patterns: []
        };
        
        // === MOMENTUM INDICATORS ===
        
        // RSI
        const rsi = this.calculateRSI(prices);
        if (rsi.length > 0) {
            const lastRSI = rsi[rsi.length - 1][1];
            let strength = 0;
            if (lastRSI < 30) strength = 2;
            else if (lastRSI < 40) strength = 1;
            else if (lastRSI > 70) strength = -2;
            else if (lastRSI > 60) strength = -1;
            
            signals.momentum.push({
                name: 'RSI',
                value: lastRSI,
                signal: strength,
                weight: 1.2,
                timeframe: 'short'
            });
        }
        
        // Stochastic
        const stochastic = this.calculateStochastic(prices);
        if (stochastic.k.length > 0) {
            const lastK = stochastic.k[stochastic.k.length - 1][1];
            const lastD = stochastic.d[stochastic.d.length - 1][1];
            let strength = 0;
            if (lastK < 20) strength = 2;
            else if (lastK > 80) strength = -2;
            else if (lastK > lastD) strength = 1;
            else if (lastK < lastD) strength = -1;
            
            signals.momentum.push({
                name: 'Stochastic',
                value: lastK,
                signal: strength,
                weight: 1.0,
                timeframe: 'short'
            });
        }
        
        // Williams %R
        const williams = this.calculateWilliams(prices);
        if (williams.length > 0) {
            const lastW = williams[williams.length - 1][1];
            let strength = 0;
            if (lastW < -80) strength = 2;
            else if (lastW > -20) strength = -2;
            
            signals.momentum.push({
                name: 'Williams %R',
                value: lastW,
                signal: strength,
                weight: 0.9,
                timeframe: 'short'
            });
        }
        
        // MFI
        const mfi = this.calculateMFI(prices);
        if (mfi.length > 0) {
            const lastMFI = mfi[mfi.length - 1][1];
            let strength = 0;
            if (lastMFI < 20) strength = 2;
            else if (lastMFI > 80) strength = -2;
            
            signals.momentum.push({
                name: 'MFI',
                value: lastMFI,
                signal: strength,
                weight: 1.1,
                timeframe: 'short'
            });
        }
        
        // CCI
        const cci = this.calculateCCI(prices);
        if (cci.length > 0) {
            const lastCCI = cci[cci.length - 1][1];
            let strength = 0;
            if (lastCCI < -100) strength = 2;
            else if (lastCCI > 100) strength = -2;
            
            signals.momentum.push({
                name: 'CCI',
                value: lastCCI,
                signal: strength,
                weight: 1.0,
                timeframe: 'short'
            });
        }
        
        // Ultimate Oscillator
        const ultimate = this.calculateUltimateOscillator(prices);
        if (ultimate.length > 0) {
            const lastUO = ultimate[ultimate.length - 1][1];
            let strength = 0;
            if (lastUO < 30) strength = 2;
            else if (lastUO > 70) strength = -2;
            
            signals.momentum.push({
                name: 'Ultimate Oscillator',
                value: lastUO,
                signal: strength,
                weight: 1.0,
                timeframe: 'medium'
            });
        }
        
        // ROC
        const roc = this.calculateROC(prices);
        if (roc.length > 0) {
            const lastROC = roc[roc.length - 1][1];
            let strength = 0;
            if (lastROC > 5) strength = 2;
            else if (lastROC > 2) strength = 1;
            else if (lastROC < -5) strength = -2;
            else if (lastROC < -2) strength = -1;
            
            signals.momentum.push({
                name: 'ROC',
                value: lastROC,
                signal: strength,
                weight: 1.0,
                timeframe: 'short'
            });
        }
        
        // === TREND INDICATORS ===
        
        // MACD
        const macd = this.calculateMACD(prices);
        if (macd.histogram.length > 0) {
            const lastHist = macd.histogram[macd.histogram.length - 1][1];
            const prevHist = macd.histogram[macd.histogram.length - 2]?.[1] || 0;
            let strength = 0;
            
            if (lastHist > 0 && prevHist <= 0) strength = 2;
            else if (lastHist < 0 && prevHist >= 0) strength = -2;
            else if (lastHist > 0) strength = 1;
            else if (lastHist < 0) strength = -1;
            
            signals.trend.push({
                name: 'MACD',
                value: lastHist,
                signal: strength,
                weight: 1.5,
                timeframe: 'medium'
            });
        }
        
        // ADX
        const adxData = this.calculateADX(prices);
        if (adxData.adx.length > 0) {
            const lastADX = adxData.adx[adxData.adx.length - 1][1];
            const lastPlusDI = adxData.plusDI[adxData.plusDI.length - 1][1];
            const lastMinusDI = adxData.minusDI[adxData.minusDI.length - 1][1];
            
            let strength = 0;
            if (lastADX > 25) {
                if (lastPlusDI > lastMinusDI) strength = 2;
                else strength = -2;
            } else if (lastADX > 20) {
                if (lastPlusDI > lastMinusDI) strength = 1;
                else strength = -1;
            }
            
            signals.trend.push({
                name: 'ADX',
                value: lastADX,
                signal: strength,
                weight: 1.3,
                timeframe: 'medium'
            });
        }
        
        // Aroon
        const aroon = this.calculateAroon(prices);
        if (aroon.up.length > 0) {
            const lastUp = aroon.up[aroon.up.length - 1][1];
            const lastDown = aroon.down[aroon.down.length - 1][1];
            
            let strength = 0;
            if (lastUp > 70 && lastDown < 30) strength = 2;
            else if (lastDown > 70 && lastUp < 30) strength = -2;
            else if (lastUp > lastDown) strength = 1;
            else strength = -1;
            
            signals.trend.push({
                name: 'Aroon',
                value: lastUp - lastDown,
                signal: strength,
                weight: 1.1,
                timeframe: 'medium'
            });
        }
        
        // Moving Averages
        const mas = this.calculateMultipleMovingAverages(prices);
        if (mas.sma20.length > 0 && mas.sma50.length > 0) {
            const currentPrice = prices[prices.length - 1].close;
            const lastSMA20 = mas.sma20[mas.sma20.length - 1][1];
            const lastSMA50 = mas.sma50[mas.sma50.length - 1][1];
            const lastSMA200 = mas.sma200.length > 0 ? mas.sma200[mas.sma200.length - 1][1] : null;
            
            let strength = 0;
            
            const prevSMA50 = mas.sma50[mas.sma50.length - 2]?.[1];
            const prevSMA200 = mas.sma200.length > 1 ? mas.sma200[mas.sma200.length - 2][1] : null;
            
            if (lastSMA200 && prevSMA200) {
                if (lastSMA50 > lastSMA200 && prevSMA50 <= prevSMA200) strength = 3;
                else if (lastSMA50 < lastSMA200 && prevSMA50 >= prevSMA200) strength = -3;
            }
            
            if (strength === 0) {
                if (currentPrice > lastSMA20 && lastSMA20 > lastSMA50) strength = 2;
                else if (currentPrice < lastSMA20 && lastSMA20 < lastSMA50) strength = -2;
                else if (currentPrice > lastSMA20) strength = 1;
                else strength = -1;
            }
            
            signals.trend.push({
                name: 'Moving Averages',
                value: currentPrice - lastSMA20,
                signal: strength,
                weight: 1.4,
                timeframe: 'long'
            });
        }
        
        // Parabolic SAR
        const sar = this.calculateSAR(prices);
        if (sar.length > 0) {
            const currentPrice = prices[prices.length - 1].close;
            const lastSAR = sar[sar.length - 1][1];
            
            const strength = currentPrice > lastSAR ? 1 : -1;
            
            signals.trend.push({
                name: 'Parabolic SAR',
                value: currentPrice - lastSAR,
                signal: strength,
                weight: 1.0,
                timeframe: 'short'
            });
        }
        
        // Ichimoku Cloud
        const ichimoku = this.calculateIchimoku(prices);
        if (ichimoku.spanA.length > 0 && ichimoku.spanB.length > 0) {
            const currentPrice = prices[prices.length - 1].close;
            const lastCloudTop = Math.max(
                ichimoku.spanA[ichimoku.spanA.length - 1]?.[1] || 0,
                ichimoku.spanB[ichimoku.spanB.length - 1]?.[1] || 0
            );
            const lastCloudBottom = Math.min(
                ichimoku.spanA[ichimoku.spanA.length - 1]?.[1] || Infinity,
                ichimoku.spanB[ichimoku.spanB.length - 1]?.[1] || Infinity
            );
            
            let strength = 0;
            if (currentPrice > lastCloudTop) strength = 2;
            else if (currentPrice < lastCloudBottom) strength = -2;
            
            signals.trend.push({
                name: 'Ichimoku Cloud',
                value: currentPrice - (lastCloudTop + lastCloudBottom) / 2,
                signal: strength,
                weight: 1.3,
                timeframe: 'long'
            });
        }
        
        // === VOLATILITY INDICATORS ===
        
        // Bollinger Bands
        const bollinger = this.calculateBollingerBands(prices);
        if (bollinger.upper.length > 0) {
            const currentPrice = prices[prices.length - 1].close;
            const lastUpper = bollinger.upper[bollinger.upper.length - 1][1];
            const lastMiddle = bollinger.middle[bollinger.middle.length - 1][1];
            const lastLower = bollinger.lower[bollinger.lower.length - 1][1];
            
            let strength = 0;
            if (currentPrice < lastLower) strength = 2;
            else if (currentPrice > lastUpper) strength = -2;
            else if (currentPrice > lastMiddle) strength = 1;
            else strength = -1;
            
            const bandwidth = ((lastUpper - lastLower) / lastMiddle) * 100;
            
            signals.volatility.push({
                name: 'Bollinger Bands',
                value: bandwidth,
                signal: strength,
                weight: 1.2,
                timeframe: 'short'
            });
        }
        
        // Keltner Channels
        const keltner = this.calculateKeltnerChannels(prices);
        if (keltner.upper.length > 0) {
            const currentPrice = prices[prices.length - 1].close;
            const lastUpper = keltner.upper[keltner.upper.length - 1][1];
            const lastMiddle = keltner.middle[keltner.middle.length - 1][1];
            const lastLower = keltner.lower[keltner.lower.length - 1][1];
            
            let strength = 0;
            if (currentPrice < lastLower) strength = 2;
            else if (currentPrice > lastUpper) strength = -1;
            else if (currentPrice > lastMiddle) strength = 1;
            else strength = -1;
            
            signals.volatility.push({
                name: 'Keltner Channels',
                value: currentPrice - lastMiddle,
                signal: strength,
                weight: 1.0,
                timeframe: 'short'
            });
        }
        
        // Donchian Channels
        const donchian = this.calculateDonchianChannels(prices);
        if (donchian.upper.length > 0) {
            const currentPrice = prices[prices.length - 1].close;
            const lastUpper = donchian.upper[donchian.upper.length - 1][1];
            const lastLower = donchian.lower[donchian.lower.length - 1][1];
            
            let strength = 0;
            if (currentPrice >= lastUpper) strength = 2;
            else if (currentPrice <= lastLower) strength = -2;
            
            signals.volatility.push({
                name: 'Donchian Channels',
                value: currentPrice - (lastUpper + lastLower) / 2,
                signal: strength,
                weight: 1.1,
                timeframe: 'medium'
            });
        }
        
        // ATR
        const atr = this.calculateATR(prices);
        if (atr.length > 20) {
            const lastATR = atr[atr.length - 1][1];
            const avgATR = atr.slice(-20).reduce((sum, item) => sum + item[1], 0) / 20;
            
            const volatilityLevel = lastATR / avgATR;
            
            signals.volatility.push({
                name: 'ATR',
                value: lastATR,
                signal: 0,
                weight: 0.8,
                timeframe: 'short',
                metadata: { volatilityLevel }
            });
        }
        
        // === VOLUME INDICATORS ===
        
        // OBV
        const obv = this.calculateOBV(prices);
        if (obv.length >= 20) {
            const recentOBV = obv.slice(-20);
            const obvChange = recentOBV[recentOBV.length - 1][1] - recentOBV[0][1];
            const priceChange = prices[prices.length - 1].close - prices[prices.length - 20].close;
            
            let strength = 0;
            if (priceChange > 0 && obvChange > 0) strength = 2;
            else if (priceChange < 0 && obvChange < 0) strength = -2;
            else if (priceChange > 0 && obvChange < 0) strength = -1;
            else if (priceChange < 0 && obvChange > 0) strength = 1;
            
            signals.volume.push({
                name: 'OBV',
                value: obvChange,
                signal: strength,
                weight: 1.1,
                timeframe: 'medium'
            });
        }
        
        // CMF
        const cmf = this.calculateCMF(prices);
        if (cmf.length > 0) {
            const lastCMF = cmf[cmf.length - 1][1];
            
            let strength = 0;
            if (lastCMF > 0.05) strength = 2;
            else if (lastCMF < -0.05) strength = -2;
            else if (lastCMF > 0) strength = 1;
            else strength = -1;
            
            signals.volume.push({
                name: 'CMF',
                value: lastCMF,
                signal: strength,
                weight: 1.2,
                timeframe: 'medium'
            });
        }
        
        // Volume Profile
        const volumeProfile = this.calculateVolumeProfile(prices);
        const currentPrice = prices[prices.length - 1].close;
        const poc = volumeProfile.poc;
        const vah = volumeProfile.valueAreaHigh;
        const val = volumeProfile.valueAreaLow;
        
        let vpStrength = 0;
        if (currentPrice > vah) vpStrength = 1;
        else if (currentPrice < val) vpStrength = -1;
        
        signals.volume.push({
            name: 'Volume Profile',
            value: currentPrice - poc,
            signal: vpStrength,
            weight: 1.0,
            timeframe: 'medium',
            metadata: { poc, vah, val }
        });
        
        // === PRICE LEVEL INDICATORS ===
        
        // VWAP
        const vwap = this.calculateVWAP(prices);
        if (vwap.vwap.length > 0) {
            const lastVWAP = vwap.vwap[vwap.vwap.length - 1][1];
            
            const strength = currentPrice > lastVWAP ? 1 : -1;
            
            signals.price.push({
                name: 'VWAP',
                value: currentPrice - lastVWAP,
                signal: strength,
                weight: 1.1,
                timeframe: 'short'
            });
        }
        
        // Support/Resistance
        const srLevels = this.findSupportResistanceLevels(prices);
        const nearestSupport = srLevels.support.length > 0 
            ? srLevels.support.reduce((prev, curr) => 
                (Math.abs(curr - currentPrice) < Math.abs(prev - currentPrice) ? curr : prev))
            : currentPrice * 0.95;
        const nearestResistance = srLevels.resistance.length > 0
            ? srLevels.resistance.reduce((prev, curr) => 
                (Math.abs(curr - currentPrice) < Math.abs(prev - currentPrice) ? curr : prev))
            : currentPrice * 1.05;
        
        signals.price.push({
            name: 'Support/Resistance',
            value: 0,
            signal: 0,
            weight: 1.0,
            timeframe: 'long',
            metadata: { 
                nearestSupport, 
                nearestResistance,
                distanceToSupport: ((currentPrice - nearestSupport) / currentPrice) * 100,
                distanceToResistance: ((nearestResistance - currentPrice) / currentPrice) * 100
            }
        });
        
        // Fibonacci
        const fibonacci = this.calculateFibonacci(prices);
        const fib618 = fibonacci.levels.find(l => l.ratio === 0.618);
        
        if (fib618) {
            let fibSignal = 0;
            if (currentPrice < fib618.price) fibSignal = 1;
            else fibSignal = -1;
            
            signals.price.push({
                name: 'Fibonacci 61.8%',
                value: currentPrice - fib618.price,
                signal: fibSignal,
                weight: 0.9,
                timeframe: 'long'
            });
        }
        
        // === PATTERN INDICATORS ===
        
        // Candlestick Patterns
        const patterns = this.findCandlestickPatterns(prices);
        const recentPatterns = patterns.slice(-5);
        
        const patternScore = recentPatterns.reduce((score, p) => {
            let value = 0;
            if (p.signal === 'bullish') {
                if (p.strength === 'very strong') value = 3;
                else if (p.strength === 'strong') value = 2;
                else value = 1;
            } else if (p.signal === 'bearish') {
                if (p.strength === 'very strong') value = -3;
                else if (p.strength === 'strong') value = -2;
                else value = -1;
            }
            return score + value;
        }, 0);
        
        if (recentPatterns.length > 0) {
            signals.patterns.push({
                name: 'Candlestick Patterns',
                value: recentPatterns.length,
                signal: Math.sign(patternScore),
                weight: 1.0,
                timeframe: 'short',
                metadata: { patterns: recentPatterns, score: patternScore }
            });
        }
        
        // Divergences
        const macdDataForDiv = this.calculateMACD(prices);
        const divergences = this.findDivergences(prices, rsi, macdDataForDiv);
        
        if (divergences.length > 0) {
            const divSignal = divergences[0].signal === 'bullish' ? 2 : -2;
            
            signals.patterns.push({
                name: 'Divergences',
                value: divergences.length,
                signal: divSignal,
                weight: 1.3,
                timeframe: 'medium',
                metadata: { divergences }
            });
        }
        
        // Linear Regression
        const regression = this.calculateLinearRegression(prices);
        const slope = regression.slope;
        
        let trendStrength = 0;
        if (Math.abs(slope) > 1) trendStrength = slope > 0 ? 2 : -2;
        else if (Math.abs(slope) > 0.3) trendStrength = slope > 0 ? 1 : -1;
        
        signals.trend.push({
            name: 'Linear Regression',
            value: slope,
            signal: trendStrength,
            weight: 1.2,
            timeframe: 'long'
        });
        
        // Elder Ray
        const elderRay = this.calculateElderRay(prices);
        if (elderRay.bullPower.length > 0) {
            const lastBull = elderRay.bullPower[elderRay.bullPower.length - 1][1];
            const lastBear = elderRay.bearPower[elderRay.bearPower.length - 1][1];
            
            let strength = 0;
            if (lastBull > 0 && lastBear > 0) strength = 2;
            else if (lastBull < 0 && lastBear < 0) strength = -2;
            
            signals.trend.push({
                name: 'Elder Ray',
                value: lastBull - lastBear,
                signal: strength,
                weight: 1.0,
                timeframe: 'medium'
            });
        }
        
        return signals;
    },

    // ============================================
    // 🎯 AI CONFIDENCE SCORE CALCULATION
    // ============================================

    calculateAIConfidenceScore(signals) {
        let totalScore = 0;
        let totalWeight = 0;
        
        let bullishSignals = 0;
        let neutralSignals = 0;
        let bearishSignals = 0;
        
        Object.values(signals).forEach(category => {
            category.forEach(indicator => {
                const weightedSignal = indicator.signal * indicator.weight;
                totalScore += weightedSignal;
                totalWeight += Math.abs(indicator.weight);
                
                if (indicator.signal > 0) bullishSignals++;
                else if (indicator.signal < 0) bearishSignals++;
                else neutralSignals++;
            });
        });
        
        const normalizedScore = ((totalScore / totalWeight) + 1) * 50;
        const finalScore = Math.max(0, Math.min(100, normalizedScore));
        
        let rating = '';
        if (finalScore >= 85) rating = 'EXTREMELY BULLISH';
        else if (finalScore >= 70) rating = 'VERY BULLISH';
        else if (finalScore >= 60) rating = 'BULLISH';
        else if (finalScore >= 55) rating = 'MODERATELY BULLISH';
        else if (finalScore >= 45) rating = 'NEUTRAL';
        else if (finalScore >= 40) rating = 'MODERATELY BEARISH';
        else if (finalScore >= 30) rating = 'BEARISH';
        else if (finalScore >= 15) rating = 'VERY BEARISH';
        else rating = 'EXTREMELY BEARISH';
        
        return {
            score: finalScore,
            rating,
            bullishSignals,
            neutralSignals,
            bearishSignals,
            totalIndicators: bullishSignals + neutralSignals + bearishSignals
        };
    },

    // ============================================
    // 📈 MULTI-HORIZON RECOMMENDATIONS
    // ============================================

    generateHorizonRecommendations(prices, currentPrice, signals, aiScore) {
        const horizons = {
            '1y': this.generateHorizonRecommendation(prices, currentPrice, signals, 'short', 1, aiScore),
            '2y': this.generateHorizonRecommendation(prices, currentPrice, signals, 'medium', 2, aiScore),
            '5y': this.generateHorizonRecommendation(prices, currentPrice, signals, 'long', 5, aiScore),
            '10y': this.generateHorizonRecommendation(prices, currentPrice, signals, 'strategic', 10, aiScore)
        };
        
        return horizons;
    },

    generateHorizonRecommendation(prices, currentPrice, signals, timeframe, years, aiScore) {
        const relevantSignals = this.filterSignalsByTimeframe(signals, timeframe);
        
        let horizonScore = 0;
        let totalWeight = 0;
        
        Object.values(relevantSignals).forEach(category => {
            category.forEach(indicator => {
                horizonScore += indicator.signal * indicator.weight;
                totalWeight += Math.abs(indicator.weight);
            });
        });
        
        const normalizedHorizonScore = ((horizonScore / totalWeight) + 1) * 50;
        
        let recommendation = '';
        let confidence = 0;
        
        if (normalizedHorizonScore >= 70) {
            recommendation = 'STRONG BUY';
            confidence = Math.min(95, 70 + (normalizedHorizonScore - 70) * 0.8);
        } else if (normalizedHorizonScore >= 60) {
            recommendation = 'BUY';
            confidence = 60 + (normalizedHorizonScore - 60);
        } else if (normalizedHorizonScore >= 55) {
            recommendation = 'ACCUMULATE';
            confidence = 55 + (normalizedHorizonScore - 55);
        } else if (normalizedHorizonScore >= 45) {
            recommendation = 'HOLD';
            confidence = 45 + Math.abs(normalizedHorizonScore - 50) * 0.5;
        } else if (normalizedHorizonScore >= 40) {
            recommendation = 'REDUCE';
            confidence = 40 + (45 - normalizedHorizonScore);
        } else if (normalizedHorizonScore >= 30) {
            recommendation = 'SELL';
            confidence = 50 + (40 - normalizedHorizonScore);
        } else {
            recommendation = 'STRONG SELL';
            confidence = Math.min(95, 60 + (30 - normalizedHorizonScore) * 0.8);
        }
        
        const targetPrice = this.calculateTargetPrice(prices, currentPrice, normalizedHorizonScore, years, signals);
        const upside = ((targetPrice - currentPrice) / currentPrice) * 100;
        const drivers = this.identifyKeyDrivers(relevantSignals, timeframe, years);
        
        return {
            recommendation,
            confidence: Math.round(confidence),
            targetPrice,
            upside,
            drivers,
            score: normalizedHorizonScore
        };
    },

    filterSignalsByTimeframe(signals, timeframe) {
        const filtered = {
            momentum: [],
            trend: [],
            volatility: [],
            volume: [],
            price: [],
            patterns: []
        };
        
        const timeframeMap = {
            'short': ['short'],
            'medium': ['short', 'medium'],
            'long': ['short', 'medium', 'long'],
            'strategic': ['medium', 'long']
        };
        
        const relevantTimeframes = timeframeMap[timeframe] || ['short', 'medium', 'long'];
        
        Object.entries(signals).forEach(([category, indicators]) => {
            filtered[category] = indicators.filter(ind => 
                relevantTimeframes.includes(ind.timeframe)
            );
        });
        
        return filtered;
    },

    // ============================================
    // 💰 TARGET PRICE CALCULATION (% UPSIDE ONLY)
    // ============================================

    calculateTargetPrice(prices, currentPrice, score, years, signals) {
        const historicalGrowth = this.calculateHistoricalGrowth(prices);
        const momentumAdjusted = historicalGrowth * (score / 50);
        
        const atr = this.calculateATR(prices);
        const avgATR = atr.length > 20 
            ? atr.slice(-20).reduce((sum, item) => sum + item[1], 0) / 20
            : currentPrice * 0.02;
        
        const volatilityTarget = currentPrice + (avgATR * years * 252 * (score - 50) / 100);
        
        const regression = this.calculateLinearRegression(prices);
        const regressionTarget = currentPrice + (regression.slope * years * 252);
        
        const srSignal = signals.price.find(s => s.name === 'Support/Resistance');
        let srTarget = currentPrice;
        
        if (srSignal && srSignal.metadata) {
            if (score > 50) {
                srTarget = srSignal.metadata.nearestResistance * (1 + (years * 0.1));
            } else {
                srTarget = srSignal.metadata.nearestSupport * (1 - (years * 0.05));
            }
        }
        
        const vpSignal = signals.volume.find(s => s.name === 'Volume Profile');
        let vpTarget = currentPrice;
        
        if (vpSignal && vpSignal.metadata) {
            if (score > 50) {
                vpTarget = Math.max(currentPrice, vpSignal.metadata.vah) * (1 + (years * 0.08));
            } else {
                vpTarget = Math.min(currentPrice, vpSignal.metadata.val) * (1 - (years * 0.06));
            }
        }
        
        const weights = {
            momentum: 0.25,
            volatility: 0.20,
            regression: 0.25,
            sr: 0.15,
            vp: 0.15
        };
        
        const combinedTarget = 
            (momentumAdjusted * weights.momentum) +
            (volatilityTarget * weights.volatility) +
            (regressionTarget * weights.regression) +
            (srTarget * weights.sr) +
            (vpTarget * weights.vp);
        
        const conservativeAdjustment = score > 50 ? 0.95 : 1.05;
        
        return combinedTarget * conservativeAdjustment;
    },

    calculateHistoricalGrowth(prices) {
        if (prices.length < 2) return 0;
        
        const startPrice = prices[0].close;
        const endPrice = prices[prices.length - 1].close;
        const days = prices.length;
        
        const totalReturn = (endPrice - startPrice) / startPrice;
        const annualizedReturn = Math.pow(1 + totalReturn, 365 / days) - 1;
        
        return prices[0].close * (1 + annualizedReturn);
    },

    // ============================================
    // 🔑 KEY DRIVERS IDENTIFICATION
    // ============================================

    identifyKeyDrivers(signals, timeframe, years) {
        const drivers = [];
        
        const allSignals = [];
        Object.entries(signals).forEach(([category, indicators]) => {
            indicators.forEach(ind => {
                allSignals.push({
                    category,
                    name: ind.name,
                    signal: ind.signal,
                    weight: ind.weight,
                    strength: Math.abs(ind.signal * ind.weight)
                });
            });
        });
        
        allSignals.sort((a, b) => b.strength - a.strength);
        
        const topDrivers = allSignals.slice(0, timeframe === 'short' ? 3 : 5);
        
        topDrivers.forEach(driver => {
            let description = '';
            
            if (driver.signal > 0) {
                if (driver.category === 'momentum') {
                    description = `Positive momentum confirmed by ${driver.name}`;
                } else if (driver.category === 'trend') {
                    description = `Uptrend validated by ${driver.name}`;
                } else if (driver.category === 'volume') {
                    description = `Strong accumulation detected via ${driver.name}`;
                } else if (driver.category === 'price') {
                    description = `Price above key ${driver.name} level`;
                } else {
                    description = `Bullish ${driver.name} signal`;
                }
            } else if (driver.signal < 0) {
                if (driver.category === 'momentum') {
                    description = `Negative momentum indicated by ${driver.name}`;
                } else if (driver.category === 'trend') {
                    description = `Downtrend confirmed by ${driver.name}`;
                } else if (driver.category === 'volume') {
                    description = `Distribution phase detected via ${driver.name}`;
                } else if (driver.category === 'price') {
                    description = `Price below key ${driver.name} level`;
                } else {
                    description = `Bearish ${driver.name} signal`;
                }
            }
            
            drivers.push(description);
        });
        
        if (timeframe === 'strategic' && years >= 10) {
            drivers.push('Long-term secular trend analysis');
            drivers.push('Macro-economic positioning');
        } else if (timeframe === 'long' && years >= 5) {
            drivers.push('Multi-year trend structure');
        }
        
        return drivers;
    },

    // ============================================
    // ⚖ RISK/REWARD ANALYSIS (SANS PRIX)
    // ============================================

    analyzeRiskReward(prices, signals) {
        const currentPrice = prices[prices.length - 1].close;
        
        const riskFactors = [];
        let riskLevel = 'MODERATE';
        let riskScore = 50;
        
        // 1. Volatility Risk (ATR)
        const atr = this.calculateATR(prices);
        if (atr.length > 20) {
            const lastATR = atr[atr.length - 1][1];
            const avgATR = atr.slice(-20).reduce((sum, item) => sum + item[1], 0) / 20;
            const volatilityRatio = lastATR / avgATR;
            
            if (volatilityRatio > 1.5) {
                riskFactors.push({
                    factor: 'High Volatility',
                    description: `Current volatility ${((volatilityRatio - 1) * 100).toFixed(0)}% above average`,
                    severity: 'high',
                    impact: 15
                });
                riskScore += 15;
            } else if (volatilityRatio < 0.7) {
                riskFactors.push({
                    factor: 'Low Volatility',
                    description: 'Volatility compression may lead to sharp moves',
                    severity: 'medium',
                    impact: 5
                });
                riskScore += 5;
            }
        }
        
        // 2. Trend Weakness Risk
        const adxData = this.calculateADX(prices);
        if (adxData.adx.length > 0) {
            const lastADX = adxData.adx[adxData.adx.length - 1][1];
            
            if (lastADX < 20) {
                riskFactors.push({
                    factor: 'Weak Trend',
                    description: `ADX at ${lastADX.toFixed(1)} indicates ranging market`,
                    severity: 'medium',
                    impact: 10
                });
                riskScore += 10;
            }
        }
        
        // 3. Overbought/Oversold Risk
        const rsi = this.calculateRSI(prices);
        if (rsi.length > 0) {
            const lastRSI = rsi[rsi.length - 1][1];
            
            if (lastRSI > 75) {
                riskFactors.push({
                    factor: 'Extreme Overbought',
                    description: `RSI at ${lastRSI.toFixed(1)} signals potential reversal`,
                    severity: 'high',
                    impact: 15
                });
                riskScore += 15;
            } else if (lastRSI < 25) {
                riskFactors.push({
                    factor: 'Extreme Oversold',
                    description: `RSI at ${lastRSI.toFixed(1)} signals capitulation risk`,
                    severity: 'high',
                    impact: 15
                });
                riskScore += 15;
            }
        }
        
        // 4. Divergence Risk
        const macdData = this.calculateMACD(prices);
        const divergences = this.findDivergences(prices, rsi, macdData);
        
        if (divergences.length > 0) {
            const divType = divergences[0].signal === 'bullish' ? 'Bullish' : 'Bearish';
            riskFactors.push({
                factor: `${divType} Divergence Detected`,
                description: divergences[0].description,
                severity: 'medium',
                impact: 10
            });
            riskScore += 10;
        }
        
        // 5. Support/Resistance Proximity Risk
        const srSignal = signals.price.find(s => s.name === 'Support/Resistance');
        if (srSignal && srSignal.metadata) {
            const distToSupport = srSignal.metadata.distanceToSupport;
            const distToResistance = srSignal.metadata.distanceToResistance;
            
            if (distToSupport < 2) {
                riskFactors.push({
                    factor: 'Near Support Level',
                    description: `Only ${distToSupport.toFixed(1)}% above key support`,
                    severity: 'high',
                    impact: 12
                });
                riskScore += 12;
            }
            
            if (distToResistance < 2) {
                riskFactors.push({
                    factor: 'Near Resistance Level',
                    description: `Only ${distToResistance.toFixed(1)}% below key resistance`,
                    severity: 'medium',
                    impact: 8
                });
                riskScore += 8;
            }
        }
        
        // 6. Volume Concern
        const obvSignals = signals.volume.filter(s => s.name === 'OBV' || s.name === 'CMF');
        const negativeVolumeSignals = obvSignals.filter(s => s.signal < 0).length;
        
        if (negativeVolumeSignals >= 2) {
            riskFactors.push({
                factor: 'Weak Volume Support',
                description: 'Multiple volume indicators show distribution',
                severity: 'medium',
                impact: 10
            });
            riskScore += 10;
        }
        
        // 7. Multiple Bearish Indicators
        const bearishMomentum = signals.momentum.filter(s => s.signal < 0).length;
        const bearishTrend = signals.trend.filter(s => s.signal < 0).length;
        
        if (bearishMomentum >= 4 || bearishTrend >= 4) {
            riskFactors.push({
                factor: 'Multiple Bearish Signals',
                description: `${bearishMomentum + bearishTrend} negative technical indicators`,
                severity: 'high',
                impact: 15
            });
            riskScore += 15;
        }
        
        if (riskScore >= 75) {
            riskLevel = 'VERY HIGH';
        } else if (riskScore >= 65) {
            riskLevel = 'HIGH';
        } else if (riskScore >= 55) {
            riskLevel = 'ELEVATED';
        } else if (riskScore >= 45) {
            riskLevel = 'MODERATE';
        } else if (riskScore >= 35) {
            riskLevel = 'LOW';
        } else {
            riskLevel = 'VERY LOW';
        }
        
        // === REWARD ASSESSMENT ===
        const rewardFactors = [];
        let rewardLevel = 'MODERATE';
        let rewardScore = 50;
        
        // 1. Strong Uptrend Opportunity
        const bullishTrend = signals.trend.filter(s => s.signal > 0).length;
        if (bullishTrend >= 5) {
            rewardFactors.push({
                factor: 'Strong Uptrend Confirmed',
                description: `${bullishTrend} trend indicators show bullish alignment`,
                potential: 'high',
                impact: 20
            });
            rewardScore += 20;
        }
        
        // 2. Oversold Bounce Potential
        if (rsi.length > 0) {
            const lastRSI = rsi[rsi.length - 1][1];
            if (lastRSI < 35) {
                rewardFactors.push({
                    factor: 'Oversold Reversal Setup',
                    description: `RSI at ${lastRSI.toFixed(1)} presents mean-reversion opportunity`,
                    potential: 'high',
                    impact: 18
                });
                rewardScore += 18;
            }
        }
        
        // 3. Breakout Potential
        const donchian = this.calculateDonchianChannels(prices);
        if (donchian.upper.length > 0) {
            const lastUpper = donchian.upper[donchian.upper.length - 1][1];
            const distanceToBreakout = ((lastUpper - currentPrice) / currentPrice) * 100;
            
            if (distanceToBreakout < 3 && distanceToBreakout > 0) {
                rewardFactors.push({
                    factor: 'Breakout Proximity',
                    description: `${distanceToBreakout.toFixed(1)}% from 20-period high breakout`,
                    potential: 'very high',
                    impact: 25
                });
                rewardScore += 25;
            }
        }
        
        // 4. Golden Cross / Bullish MA Alignment
        const mas = this.calculateMultipleMovingAverages(prices);
        if (mas.sma20.length > 0 && mas.sma50.length > 0 && mas.sma200.length > 1) {
            const lastSMA50 = mas.sma50[mas.sma50.length - 1][1];
            const lastSMA200 = mas.sma200[mas.sma200.length - 1][1];
            const prevSMA50 = mas.sma50[mas.sma50.length - 2][1];
            const prevSMA200 = mas.sma200[mas.sma200.length - 2][1];
            
            if (lastSMA50 > lastSMA200 && prevSMA50 <= prevSMA200) {
                rewardFactors.push({
                    factor: 'Golden Cross Formation',
                    description: 'SMA50 crossed above SMA200 - Major bullish signal',
                    potential: 'very high',
                    impact: 30
                });
                rewardScore += 30;
            }
            
            if (currentPrice > mas.sma20[mas.sma20.length - 1][1] &&
                mas.sma20[mas.sma20.length - 1][1] > lastSMA50 &&
                lastSMA50 > lastSMA200) {
                rewardFactors.push({
                    factor: 'Perfect MA Alignment',
                    description: 'All moving averages in bullish order',
                    potential: 'high',
                    impact: 20
                });
                rewardScore += 20;
            }
        }
        
        // 5. Volume Accumulation
        const cmfSignal = signals.volume.find(s => s.name === 'CMF');
        if (cmfSignal && cmfSignal.value > 0.1) {
            rewardFactors.push({
                factor: 'Strong Accumulation',
                description: `CMF at ${cmfSignal.value.toFixed(3)} shows institutional buying`,
                potential: 'high',
                impact: 18
            });
            rewardScore += 18;
        }
        
        // 6. Bullish Candlestick Patterns
        const patterns = this.findCandlestickPatterns(prices);
        const recentBullishPatterns = patterns.filter(p => 
            p.signal === 'bullish' && 
            (prices.length - 1 - p.index) < 5
        );
        
        if (recentBullishPatterns.length >= 2) {
            rewardFactors.push({
                factor: 'Multiple Bullish Patterns',
                description: `${recentBullishPatterns.length} bullish reversal patterns detected`,
                potential: 'medium',
                impact: 15
            });
            rewardScore += 15;
        }
        
        // 7. Bullish Divergence
        if (divergences.length > 0 && divergences[0].signal === 'bullish') {
            rewardFactors.push({
                factor: 'Bullish Divergence',
                description: 'Price making lower lows while indicators strengthen',
                potential: 'high',
                impact: 20
            });
            rewardScore += 20;
        }
        
        // 8. Strong Momentum Confirmation
        const bullishMomentum = signals.momentum.filter(s => s.signal > 0).length;
        if (bullishMomentum >= 5) {
            rewardFactors.push({
                factor: 'Momentum Convergence',
                description: `${bullishMomentum} momentum indicators confirm strength`,
                potential: 'high',
                impact: 18
            });
            rewardScore += 18;
        }
        
        if (rewardScore >= 85) {
            rewardLevel = 'EXCEPTIONAL';
        } else if (rewardScore >= 75) {
            rewardLevel = 'VERY HIGH';
        } else if (rewardScore >= 65) {
            rewardLevel = 'HIGH';
        } else if (rewardScore >= 55) {
            rewardLevel = 'ATTRACTIVE';
        } else if (rewardScore >= 45) {
            rewardLevel = 'MODERATE';
        } else if (rewardScore >= 35) {
            rewardLevel = 'LOW';
        } else {
            rewardLevel = 'MINIMAL';
        }
        
        const rrRatio = rewardScore / Math.max(riskScore, 1);
        
        return {
            risk: {
                level: riskLevel,
                score: Math.min(100, riskScore),
                factors: riskFactors
            },
            reward: {
                level: rewardLevel,
                score: Math.min(100, rewardScore),
                factors: rewardFactors
            },
            rrRatio: rrRatio.toFixed(2)
        };
    },

    // ============================================
    // 📋 PROFESSIONAL ANALYST SUMMARY (SANS PRIX)
    // ============================================

    generateProfessionalSummary(aiScore, horizons, riskReward, signals) {
        const currentDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        const symbol = this.currentSymbol;
        
        // === EXECUTIVE SUMMARY ===
        let executiveSummary = '';
        
        if (aiScore.score >= 70) {
            executiveSummary = `We maintain a BULLISH outlook on ${symbol} with an AI Confidence Score of ${aiScore.score.toFixed(0)}/100. `;
            executiveSummary += `Our proprietary multi-indicator analysis, incorporating ${aiScore.totalIndicators} technical signals, `;
            executiveSummary += `suggests strong upside potential across multiple time horizons. `;
        } else if (aiScore.score >= 55) {
            executiveSummary = `We adopt a MODERATELY BULLISH stance on ${symbol} with an AI Confidence Score of ${aiScore.score.toFixed(0)}/100. `;
            executiveSummary += `Technical indicators show constructive setup with ${aiScore.bullishSignals} bullish signals, `;
            executiveSummary += `though some caution is warranted given ${aiScore.bearishSignals} contrary indicators. `;
        } else if (aiScore.score >= 45) {
            executiveSummary = `We recommend a NEUTRAL/HOLD position on ${symbol} with an AI Confidence Score of ${aiScore.score.toFixed(0)}/100. `;
            executiveSummary += `The technical picture remains mixed with balanced signals (${aiScore.bullishSignals} bullish vs ${aiScore.bearishSignals} bearish). `;
            executiveSummary += `We advise waiting for clearer directional conviction before initiating new positions. `;
        } else if (aiScore.score >= 30) {
            executiveSummary = `We maintain a BEARISH view on ${symbol} with an AI Confidence Score of ${aiScore.score.toFixed(0)}/100. `;
            executiveSummary += `Our technical analysis reveals ${aiScore.bearishSignals} negative signals across momentum, trend, and volume indicators. `;
            executiveSummary += `We recommend defensive positioning or outright short exposure. `;
        } else {
            executiveSummary = `We hold a STRONGLY BEARISH outlook on ${symbol} with an AI Confidence Score of ${aiScore.score.toFixed(0)}/100. `;
            executiveSummary += `Technical deterioration is evident across ${aiScore.totalIndicators} indicators. `;
            executiveSummary += `We strongly recommend profit-taking or establishing short positions. `;
        }
        
        // === TECHNICAL THESIS ===
        let technicalThesis = '';
        
        const trendSignals = signals.trend;
        const bullishTrends = trendSignals.filter(s => s.signal > 0).length;
        const bearishTrends = trendSignals.filter(s => s.signal < 0).length;
        
        technicalThesis += `**Trend Structure:** `;
        if (bullishTrends > bearishTrends) {
            technicalThesis += `The primary trend remains intact with ${bullishTrends}/${trendSignals.length} trend indicators confirming upward bias. `;
            
            const maSignal = trendSignals.find(s => s.name === 'Moving Averages');
            if (maSignal && maSignal.signal >= 2) {
                technicalThesis += `Moving average alignment is particularly constructive. `;
            }
            
            const adxSignal = trendSignals.find(s => s.name === 'ADX');
            if (adxSignal && adxSignal.value !== 'N/A' && parseFloat(adxSignal.value) > 25) {
                technicalThesis += `ADX above 25 confirms strong trend strength. `;
            }
        } else if (bearishTrends > bullishTrends) {
            technicalThesis += `The trend structure has deteriorated with ${bearishTrends}/${trendSignals.length} indicators showing negative bias. `;
            technicalThesis += `We advise respecting the downtrend until clear reversal signals emerge. `;
        } else {
            technicalThesis += `Trend indicators are mixed, suggesting a consolidation or transition phase. `;
        }
        
        const momentumSignals = signals.momentum;
        const extremeOversold = momentumSignals.filter(s => s.signal >= 2).length;
        const extremeOverbought = momentumSignals.filter(s => s.signal <= -2).length;
        
        technicalThesis += `\n\n**Momentum Profile:** `;
        if (extremeOversold >= 2) {
            technicalThesis += `Multiple oscillators (${extremeOversold} indicators) show extreme oversold readings, `;
            technicalThesis += `suggesting strong mean-reversion potential. `;
        } else if (extremeOverbought >= 2) {
            technicalThesis += `Momentum indicators (${extremeOverbought} readings) signal overbought conditions, `;
            technicalThesis += `warranting caution on longs and consideration of profit-taking. `;
        } else {
            const bullishMomentum = momentumSignals.filter(s => s.signal > 0).length;
            if (bullishMomentum > momentumSignals.length / 2) {
                technicalThesis += `Momentum remains constructive with ${bullishMomentum}/${momentumSignals.length} positive readings. `;
            } else {
                technicalThesis += `Momentum has weakened, with mixed signals across oscillators. `;
            }
        }
        
        const volumeSignals = signals.volume;
        const accumulation = volumeSignals.filter(s => s.signal > 0).length;
        const distribution = volumeSignals.filter(s => s.signal < 0).length;
        
        technicalThesis += `\n\n**Volume Dynamics:** `;
        if (accumulation > distribution) {
            technicalThesis += `Volume analysis confirms institutional accumulation, `;
            
            const cmfSignal = volumeSignals.find(s => s.name === 'CMF');
            if (cmfSignal && cmfSignal.value > 0.05) {
                technicalThesis += `with Chaikin Money Flow at +${cmfSignal.value.toFixed(3)} signaling strong buying pressure. `;
            } else {
                technicalThesis += `supporting our constructive view. `;
            }
        } else if (distribution > accumulation) {
            technicalThesis += `Volume patterns suggest distribution, with ${distribution}/${volumeSignals.length} indicators negative. `;
            technicalThesis += `This raises concerns about demand sustainability. `;
        } else {
            technicalThesis += `Volume signals are balanced, providing no clear directional edge. `;
        }
        
        // === RISK CONSIDERATIONS ===
        let riskSection = `**Risk Assessment (${riskReward.risk.level}):** `;
        
        if (riskReward.risk.factors.length > 0) {
            riskSection += `We identify ${riskReward.risk.factors.length} key risk factor(s): `;
            riskReward.risk.factors.slice(0, 3).forEach((risk, idx) => {
                riskSection += `(${idx + 1}) ${risk.description}. `;
            });
        } else {
            riskSection += `Risk profile appears benign with no major technical warning signals. `;
        }
        
        // === REWARD POTENTIAL ===
        let rewardSection = `\n\n**Upside Catalysts (${riskReward.reward.level}):** `;
        
        if (riskReward.reward.factors.length > 0) {
            rewardSection += `We see ${riskReward.reward.factors.length} positive catalyst(s): `;
            riskReward.reward.factors.slice(0, 3).forEach((reward, idx) => {
                rewardSection += `(${idx + 1}) ${reward.description}. `;
            });
        } else {
            rewardSection += `Limited upside catalysts identified in current technical setup. `;
        }
        
        // === INVESTMENT HORIZON GUIDANCE (SANS PRIX) ===
        let horizonGuidance = `\n\n**Multi-Horizon Recommendations:**\n`;
        
        horizonGuidance += `• **1-Year Upside:** ${horizons['1y'].upside >= 0 ? '+' : ''}${horizons['1y'].upside.toFixed(1)}% `;
        horizonGuidance += `- **${horizons['1y'].recommendation}** (${horizons['1y'].confidence}% conviction)\n`;
        
        horizonGuidance += `• **2-Year Upside:** ${horizons['2y'].upside >= 0 ? '+' : ''}${horizons['2y'].upside.toFixed(1)}% `;
        horizonGuidance += `- **${horizons['2y'].recommendation}** (${horizons['2y'].confidence}% conviction)\n`;
        
        horizonGuidance += `• **5-Year Upside:** ${horizons['5y'].upside >= 0 ? '+' : ''}${horizons['5y'].upside.toFixed(1)}% `;
        horizonGuidance += `- **${horizons['5y'].recommendation}** (${horizons['5y'].confidence}% conviction)\n`;
        
        horizonGuidance += `• **10-Year Upside:** ${horizons['10y'].upside >= 0 ? '+' : ''}${horizons['10y'].upside.toFixed(1)}% `;
        horizonGuidance += `- **${horizons['10y'].recommendation}** (${horizons['10y'].confidence}% conviction)`;
        
        // === CONCLUSION ===
        let conclusion = `\n\n**Investment Conclusion:** `;
        
        const avgUpside = (horizons['1y'].upside + horizons['2y'].upside + horizons['5y'].upside + horizons['10y'].upside) / 4;
        const rrRatio = parseFloat(riskReward.rrRatio);
        
        if (rrRatio > 2.0 && avgUpside > 15) {
            conclusion += `${symbol} presents an ATTRACTIVE risk/reward profile (R/R: ${riskReward.rrRatio}x) `;
            conclusion += `with significant upside potential across all time horizons. `;
            conclusion += `We recommend INITIATING or ADDING to positions on weakness. `;
        } else if (rrRatio > 1.5 && avgUpside > 5) {
            conclusion += `${symbol} offers a FAVORABLE setup (R/R: ${riskReward.rrRatio}x) `;
            conclusion += `suitable for patient investors with medium-term horizons. `;
            conclusion += `We recommend ACCUMULATING on pullbacks to support levels. `;
        } else if (rrRatio > 1.0) {
            conclusion += `${symbol} shows BALANCED risk/reward (R/R: ${riskReward.rrRatio}x). `;
            conclusion += `We recommend HOLDING existing positions while monitoring for improved entry points. `;
        } else {
            conclusion += `${symbol} exhibits UNFAVORABLE risk/reward (R/R: ${riskReward.rrRatio}x). `;
            conclusion += `We recommend REDUCING exposure or EXITING positions. `;
        }
        
        // === ASSEMBLER LE RAPPORT COMPLET ===
        const fullReport = `
    **ALPHY AI INSTITUTIONAL RESEARCH**
    **${symbol} - Technical Analysis Report**
    **Date:** ${currentDate}
    **AI Confidence Score:** ${aiScore.score.toFixed(0)}/100 (${aiScore.rating})

    ---

    **EXECUTIVE SUMMARY**

    ${executiveSummary}

    ---

    **TECHNICAL ANALYSIS**

    ${technicalThesis}

    ---

    **RISK/REWARD FRAMEWORK**

    ${riskSection}

    ${rewardSection}

    **Risk/Reward Ratio:** ${riskReward.rrRatio}x

    ---

    **PRICE TARGETS & RECOMMENDATIONS**

    ${horizonGuidance}

    ---

    ${conclusion}

    ---

    **Methodology Note:** This analysis synthesizes ${aiScore.totalIndicators} proprietary technical indicators across momentum, trend, volatility, volume, and price action dimensions. Our AI-powered engine weights signals by statistical significance and time horizon relevance to generate institutional-grade recommendations.

    **Disclaimer:** This report is for informational purposes only and does not constitute investment advice. Technical analysis has inherent limitations. Past performance does not guarantee future results. Consult a licensed financial advisor before making investment decisions.
        `.trim();
        
        return fullReport;
    },

    // ============================================
    // 🎨 UI DISPLAY FUNCTIONS
    // ============================================

    displayAIRecommendation(aiScore, signals) {
        console.log('📊 Displaying AI Recommendation:', aiScore);
        
        const scoreValueEl = document.getElementById('aiScoreValue');
        if (scoreValueEl) {
            scoreValueEl.textContent = aiScore.score.toFixed(0) + '/100';
        }
        
        const ratingEl = document.getElementById('aiScoreRating');
        if (ratingEl) {
            ratingEl.textContent = aiScore.rating;
            
            let scoreClass = '';
            if (aiScore.score >= 70) scoreClass = 'very-bullish';
            else if (aiScore.score >= 60) scoreClass = 'bullish';
            else if (aiScore.score >= 55) scoreClass = 'moderately-bullish';
            else if (aiScore.score >= 45) scoreClass = 'neutral';
            else if (aiScore.score >= 40) scoreClass = 'moderately-bearish';
            else if (aiScore.score >= 30) scoreClass = 'bearish';
            else scoreClass = 'very-bearish';
            
            ratingEl.className = `ai-score-rating ${scoreClass}`;
            
            const fillBarContainer = document.getElementById('aiScoreFill');
            if (fillBarContainer) {
                let fillEl = fillBarContainer.querySelector('.ai-score-fill');
                
                if (!fillEl) {
                    fillBarContainer.innerHTML = `<div class="ai-score-fill"></div>`;
                    fillEl = fillBarContainer.querySelector('.ai-score-fill');
                }
                
                if (fillEl) {
                    fillEl.style.width = aiScore.score + '%';
                    fillEl.className = `ai-score-fill ${scoreClass}`;
                }
            }
        }
        
        const bullishEl = document.getElementById('bullishSignals');
        const neutralEl = document.getElementById('neutralSignals');
        const bearishEl = document.getElementById('bearishSignals');
        
        if (bullishEl) bullishEl.textContent = aiScore.bullishSignals;
        if (neutralEl) neutralEl.textContent = aiScore.neutralSignals;
        if (bearishEl) bearishEl.textContent = aiScore.bearishSignals;
        
        console.log('✅ AI Recommendation displayed successfully');
    },

    displayHorizonRecommendations(horizons, currentPrice) {
        this.displaySingleHorizon('1y', horizons['1y'], currentPrice);
        this.displaySingleHorizon('2y', horizons['2y'], currentPrice);
        this.displaySingleHorizon('5y', horizons['5y'], currentPrice);
        this.displaySingleHorizon('10y', horizons['10y'], currentPrice);
    },

    displaySingleHorizon(horizon, data, currentPrice) {
        console.log(`📊 Displaying ${horizon} horizon:`, data);
        
        const recEl = document.getElementById(`recommendation${horizon}`);
        if (recEl) {
            const recClass = this.getRecommendationClass(data.recommendation);
            recEl.innerHTML = `<div class='ai-rec-badge ${recClass}'>${data.recommendation}</div>`;
        }
        
        // ✅ UPSIDE POTENTIAL ONLY (NO PRICE)
        const targetEl = document.getElementById(`target${horizon}`);
        if (targetEl) {
            targetEl.innerHTML = `<span style="font-weight: 700; color: ${data.upside >= 0 ? '#10b981' : '#ef4444'};">
                ${data.upside >= 0 ? '+' : ''}${data.upside.toFixed(1)}% Potential
            </span>`;
        }
        
        const upsideEl = document.getElementById(`upside${horizon}`);
        if (upsideEl) {
            const upsideText = `${data.upside >= 0 ? '+' : ''}${data.upside.toFixed(1)}%`;
            const upsideColor = data.upside >= 0 ? '#10b981' : '#ef4444';
            upsideEl.innerHTML = `<span style="color: ${upsideColor}; font-weight: 700;">${upsideText}</span>`;
        }
        
        const confBarContainer = document.getElementById(`confidence${horizon}`);
        if (confBarContainer) {
            let confFill = confBarContainer.querySelector('.ai-confidence-fill');
            
            if (!confFill) {
                confBarContainer.innerHTML = `<div class="ai-confidence-fill"></div>`;
                confFill = confBarContainer.querySelector('.ai-confidence-fill');
            }
            
            if (confFill) {
                const recClass = this.getRecommendationClass(data.recommendation);
                confFill.style.width = data.confidence + '%';
                confFill.className = `ai-confidence-fill ${recClass}`;
            }
        }
        
        const driversEl = document.getElementById(`drivers${horizon}`);
        if (driversEl) {
            driversEl.innerHTML = data.drivers.map(driver => 
                `<div class='ai-driver-item'><i class='fas fa-check-circle'></i> ${driver}</div>`
            ).join('');
        }
        
        console.log(`✅ ${horizon} horizon displayed successfully`);
    },

    getRecommendationClass(recommendation) {
        const map = {
            'STRONG BUY': 'strong-buy',
            'BUY': 'buy',
            'ACCUMULATE': 'accumulate',
            'HOLD': 'hold',
            'REDUCE': 'reduce',
            'SELL': 'sell',
            'STRONG SELL': 'strong-sell'
        };
        
        return map[recommendation] || 'neutral';
    },

    displayRiskReward(riskReward) {
        const riskEl = document.getElementById('aiRiskLevel');
        const riskClass = this.getRiskClass(riskReward.risk.level);
        riskEl.innerHTML = `<div class='ai-risk-badge ${riskClass}'>${riskReward.risk.level} (${riskReward.risk.score}/100)</div>`;
        
        const riskFactorsEl = document.getElementById('aiRiskFactors');
        if (riskReward.risk.factors.length > 0) {
            riskFactorsEl.innerHTML = riskReward.risk.factors.map(risk => {
                const icon = this.getSeverityIcon(risk.severity);
                return `
                    <div class='ai-factor-item ${risk.severity}'>
                        ${icon} <strong>${risk.factor}:</strong> ${risk.description}
                    </div>
                `;
            }).join('');
        } else {
            riskFactorsEl.innerHTML = `<div class='ai-factor-item low'><i class='fas fa-check-circle'></i> No significant risk factors identified</div>`;
        }
        
        const rewardEl = document.getElementById('aiRewardLevel');
        const rewardClass = this.getRewardClass(riskReward.reward.level);
        rewardEl.innerHTML = `<div class='ai-reward-badge ${rewardClass}'>${riskReward.reward.level} (${riskReward.reward.score}/100)</div>`;
        
        const rewardFactorsEl = document.getElementById('aiRewardFactors');
        if (riskReward.reward.factors.length > 0) {
            rewardFactorsEl.innerHTML = riskReward.reward.factors.map(reward => {
                const icon = this.getPotentialIcon(reward.potential);
                return `
                    <div class='ai-factor-item ${reward.potential}'>
                        ${icon} <strong>${reward.factor}:</strong> ${reward.description}
                    </div>
                `;
            }).join('');
        } else {
            rewardFactorsEl.innerHTML = `<div class='ai-factor-item low'><i class='fas fa-info-circle'></i> Limited upside catalysts at current levels</div>`;
        }
    },

    getRiskClass(level) {
        const map = {
            'VERY HIGH': 'very-high-risk',
            'HIGH': 'high-risk',
            'ELEVATED': 'elevated-risk',
            'MODERATE': 'moderate-risk',
            'LOW': 'low-risk',
            'VERY LOW': 'very-low-risk'
        };
        return map[level] || 'moderate-risk';
    },

    getRewardClass(level) {
        const map = {
            'EXCEPTIONAL': 'exceptional-reward',
            'VERY HIGH': 'very-high-reward',
            'HIGH': 'high-reward',
            'ATTRACTIVE': 'attractive-reward',
            'MODERATE': 'moderate-reward',
            'LOW': 'low-reward',
            'MINIMAL': 'minimal-reward'
        };
        return map[level] || 'moderate-reward';
    },

    getSeverityIcon(severity) {
        const map = {
            'high': '<i class="fas fa-exclamation-triangle" style="color: #ef4444;"></i>',
            'medium': '<i class="fas fa-exclamation-circle" style="color: #f59e0b;"></i>',
            'low': '<i class="fas fa-info-circle" style="color: #3b82f6;"></i>'
        };
        return map[severity] || '<i class="fas fa-info-circle"></i>';
    },

    getPotentialIcon(potential) {
        const map = {
            'very high': '<i class="fas fa-rocket" style="color: #10b981;"></i>',
            'high': '<i class="fas fa-arrow-up" style="color: #10b981;"></i>',
            'medium': '<i class="fas fa-arrow-right" style="color: #3b82f6;"></i>',
            'low': '<i class="fas fa-minus" style="color: #6b7280;"></i>'
        };
        return map[potential] || '<i class="fas fa-arrow-up"></i>';
    },

    displayProfessionalSummary(summary) {
        const summaryEl = document.getElementById('aiSummaryContent');
        const dateEl = document.getElementById('aiSummaryDate');
        
        dateEl.textContent = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        let htmlSummary = summary
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            .replace(/^(.+)$/gm, '<p>$1</p>')
            .replace(/<p><\/p>/g, '')
            .replace(/---/g, '<hr style="margin: 20px 0; border: none; border-top: 2px solid rgba(0,0,0,0.1);">');
        
        summaryEl.innerHTML = htmlSummary;
    },
    
    displayConsolidatedSignals(signals, signalPercentage) {
        const gaugeValue = document.getElementById('gaugeValue');
        const gaugeFill = document.getElementById('gaugeFill');
        
        let signalText = '';
        let signalClass = '';
        
        if (signalPercentage >= 80) {
            signalText = 'STRONG BUY';
            signalClass = 'strong-buy';
        } else if (signalPercentage >= 60) {
            signalText = 'BUY';
            signalClass = 'buy';
        } else if (signalPercentage >= 40) {
            signalText = 'NEUTRAL';
            signalClass = 'neutral';
        } else if (signalPercentage >= 20) {
            signalText = 'SELL';
            signalClass = 'sell';
        } else {
            signalText = 'STRONG SELL';
            signalClass = 'strong-sell';
        }
        
        gaugeValue.textContent = signalText;
        gaugeValue.className = `gauge-value ${signalClass}`;
        gaugeFill.style.width = `${signalPercentage}%`;
        
        const breakdown = document.getElementById('signalsBreakdown');
        breakdown.innerHTML = signals.map(s => {
            let badgeClass = 'neutral';
            let badgeText = 'NEUTRAL';
            
            if (s.signal > 0) {
                badgeClass = 'buy';
                badgeText = 'BUY';
            } else if (s.signal < 0) {
                badgeClass = 'sell';
                badgeText = 'SELL';
            }
            
            return `
                <div class='signal-row'>
                    <span class='signal-indicator-name'>${s.name}</span>
                    <span class='signal-indicator-value'>${s.value}</span>
                    <span class='signal-badge ${badgeClass}'>${badgeText}</span>
                </div>
            `;
        }).join('');
    },
    
    // ============================================
    // ✅ UTILITY FUNCTIONS
    // ============================================
    
    generateDemoData(symbol) {
        console.log('📊 Generating demo data for', symbol);
        const days = 365;
        const prices = [];
        let price = 100;
        
        for (let i = 0; i < days; i++) {
            const change = (Math.random() - 0.5) * 4;
            price = price * (1 + change / 100);
            
            const timestamp = Date.now() - (days - i) * 24 * 60 * 60 * 1000;
            prices.push({
                timestamp: timestamp,
                open: price * (1 + (Math.random() - 0.5) * 0.01),
                high: price * (1 + Math.random() * 0.02),
                low: price * (1 - Math.random() * 0.02),
                close: price,
                volume: Math.floor(Math.random() * 10000000)
            });
        }
        
        return {
            symbol: symbol,
            prices: prices,
            currency: 'USD',
            quote: {
                name: symbol + ' Inc.',
                symbol: symbol,
                price: price,
                change: price - 100,
                percentChange: ((price - 100) / 100) * 100
            }
        };
    },
    
    formatCurrency(value) {
        if (!value && value !== 0) return 'N/A';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: this.stockData?.currency || 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    },
    
    showLoading(show) {
        const loader = document.getElementById('loadingIndicator');
        if (loader) {
            if (show) {
                loader.classList.remove('hidden');
            } else {
                loader.classList.add('hidden');
            }
        }
    },
    
    hideResults() {
        document.getElementById('resultsPanel').classList.add('hidden');
    },
    
    updateLastUpdate() {
        const now = new Date();
        const formatted = now.toLocaleString('en-US', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const updateElement = document.getElementById('lastUpdate');
        if (updateElement) {
            updateElement.textContent = `Last update: ${formatted}`;
        }
    }
};

// ============================================
// ✅ INITIALIZE ON DOM LOADED
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Advanced Analysis - Wall Street Edition - Initializing...');
    AdvancedAnalysis.init();
});

// ============================================
// ✅ SIDEBAR USER MENU - Toggle
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const sidebarUserTrigger = document.getElementById('sidebarUserTrigger');
    const sidebarUserDropdown = document.getElementById('sidebarUserDropdown');
    
    if (sidebarUserTrigger && sidebarUserDropdown) {
        sidebarUserTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            
            sidebarUserTrigger.classList.toggle('active');
            sidebarUserDropdown.classList.toggle('active');
        });
        
        document.addEventListener('click', (e) => {
            if (!sidebarUserDropdown.contains(e.target) && 
                !sidebarUserTrigger.contains(e.target)) {
                sidebarUserTrigger.classList.remove('active');
                sidebarUserDropdown.classList.remove('active');
            }
        });
        
        sidebarUserDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
});

console.log('✅ Advanced Analysis - Wall Street Edition - Script Loaded (40+ Indicators) - 100% COMPLIANT');