// /* ==============================================
//    ADVANCED-ANALYSIS.JS - COMPLETE & CORRECTED
//    ✅ Twelve Data API + RateLimiter + OptimizedCache
//    ============================================== */

// // ========== RATE LIMITER (COPIÉ DE MARKET DATA) ==========
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

// // ========== OPTIMIZED CACHE (COPIÉ DE MARKET DATA) ==========
// class OptimizedCache {
//     constructor() {
//         this.prefix = 'aa_cache_'; // Advanced Analysis cache
//         this.staticTTL = 24 * 60 * 60 * 1000; // 24h
//         this.dynamicTTL = 5 * 60 * 1000; // 5min
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
//     // ✅ NOUVEAUX : API Client et Rate Limiter
//     apiClient: null,
//     rateLimiter: null,
//     optimizedCache: null,
    
//     // Existing properties
//     currentSymbol: 'AAPL',
//     currentPeriod: '6M',
//     stockData: null,
//     selectedSuggestionIndex: -1,
//     searchTimeout: null,
    
//     charts: {
//         ichimoku: null,
//         stochastic: null,
//         williams: null,
//         adx: null,
//         sar: null,
//         obv: null,
//         atr: null,
//         fibonacci: null,
//         vwap: null
//     },
    
//     colors: {
//         primary: '#2649B2',
//         secondary: '#4A74F3',
//         tertiary: '#8E7DE3',
//         purple: '#9D5CE6',
//         lightBlue: '#6C8BE0',
//         success: '#28a745',
//         danger: '#dc3545',
//         warning: '#ffc107'
//     },
    
//     // ============================================
//     // ✅ INITIALIZATION (MODIFIÉE)
//     // ============================================
    
//     async init() {
//         console.log('🚀 Advanced Analysis - Initializing with Twelve Data API...');
        
//         // ✅ Initialiser le rate limiter (8 req/min)
//         this.rateLimiter = new RateLimiter(8, 60000);
//         this.optimizedCache = new OptimizedCache();
        
//         // ✅ Attendre que l'utilisateur soit authentifié
//         await this.waitForAuth();
        
//         // ✅ Initialiser le client API
//         this.apiClient = new FinanceAPIClient({
//             baseURL: APP_CONFIG.API_BASE_URL,
//             cacheDuration: APP_CONFIG.CACHE_DURATION || 300000,
//             maxRetries: APP_CONFIG.MAX_RETRIES || 2,
//             onLoadingChange: (isLoading) => {
//                 this.showLoading(isLoading);
//             }
//         });
        
//         // Rendre accessible globalement
//         window.apiClient = this.apiClient;
//         window.rateLimiter = this.rateLimiter;
        
//         this.updateLastUpdate();
//         this.setupEventListeners();
//         this.startCacheMonitoring();
        
//         // Auto-load default symbol
//         setTimeout(() => {
//             this.loadSymbol(this.currentSymbol);
//         }, 500);
        
//         console.log('✅ Advanced Analysis initialized with rate limiting');
//     },
    
//     // ✅ NOUVEAU : Wait for Auth
//     async waitForAuth() {
//         return new Promise((resolve) => {
//             if (!firebase || !firebase.auth) {
//                 console.warn('⚠️ Firebase not available');
//                 resolve();
//                 return;
//             }
            
//             const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
//                 if (user) {
//                     console.log('✅ User authenticated for Advanced Analysis');
//                     unsubscribe();
//                     resolve();
//                 }
//             });
            
//             setTimeout(() => {
//                 resolve();
//             }, 3000);
//         });
//     },
    
//     // ✅ NOUVEAU : Cache Monitoring
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
    
//     // ✅ NOUVEAU : API Request avec Rate Limiting
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
//     // ✅ SEARCH - MODIFIÉ POUR TWELVE DATA
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
//     // ✅ LOAD SYMBOL - MODIFIÉ POUR TWELVE DATA
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
            
//             // ✅ Charger les données avec rate limiting (priorité haute)
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
    
//     // ✅ NOUVEAU : Get Time Series avec les bons paramètres
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

// // ============================================
//     // ✅ CHANGE PERIOD - CORRIGÉ
//     // ============================================
    
//     changePeriod(period) {
//         this.currentPeriod = period;
        
//         // ✅ Enlever la classe active de TOUS les boutons
//         document.querySelectorAll('.horizon-btn').forEach(btn => {
//             btn.classList.remove('active');
//         });
        
//         // Ajouter la classe active au bouton sélectionné
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
//     // UPDATE ALL INDICATORS
//     // ============================================
    
//     updateAllIndicators() {
//         console.log('📊 Updating all indicators...');
        
//         const resultsPanel = document.getElementById('resultsPanel');
//         if (resultsPanel.classList.contains('hidden')) {
//             resultsPanel.classList.remove('hidden');
//         }
        
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
//         this.generateConsolidatedSignals();
        
//         console.log('✅ All indicators updated');
//     },
    
//     // ============================================
//     // ICHIMOKU CLOUD
//     // ============================================
    
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
    
//     // ============================================
//     // STOCHASTIC OSCILLATOR
//     // ============================================
    
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
    
//     // ============================================
//     // WILLIAMS %R
//     // ============================================
    
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

//     // ============================================
//     // ADX
//     // ============================================
    
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
    
//     // ============================================
//     // PARABOLIC SAR
//     // ============================================
    
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
    
//     // ============================================
//     // OBV
//     // ============================================
    
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
    
//     // ============================================
//     // ATR
//     // ============================================
    
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

// // ============================================
//     // FIBONACCI RETRACEMENTS
//     // ============================================
    
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
    
//     // ============================================
//     // PIVOT POINTS
//     // ============================================
    
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
    
//     // ============================================
//     // VWAP (Volume Weighted Average Price)
//     // ============================================
    
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
//     // CONSOLIDATED TRADING SIGNALS
//     // ============================================
    
//     generateConsolidatedSignals() {
//         const prices = this.stockData.prices;
//         const signals = [];
        
//         // Calculate all indicators
//         const stochastic = this.calculateStochastic(prices);
//         const williams = this.calculateWilliams(prices);
//         const adxData = this.calculateADX(prices);
//         const sar = this.calculateSAR(prices);
//         const obv = this.calculateOBV(prices);
//         const vwap = this.calculateVWAP(prices);
//         const ichimoku = this.calculateIchimoku(prices);
        
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
//         const formatted = now.toLocaleString('fr-FR', {
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
//     console.log('🚀 Advanced Analysis - Initializing...');
//     AdvancedAnalysis.init();
// });

// // ============================================
// // SIDEBAR USER MENU - Toggle
// // ============================================

// document.addEventListener('DOMContentLoaded', () => {
//     const sidebarUserTrigger = document.getElementById('sidebarUserTrigger');
//     const sidebarUserDropdown = document.getElementById('sidebarUserDropdown');
    
//     if (sidebarUserTrigger && sidebarUserDropdown) {
//         // Toggle dropdown au clic
//         sidebarUserTrigger.addEventListener('click', (e) => {
//             e.stopPropagation();
            
//             // Toggle classes
//             sidebarUserTrigger.classList.toggle('active');
//             sidebarUserDropdown.classList.toggle('active');
//         });
        
//         // Fermer le dropdown si on clique ailleurs
//         document.addEventListener('click', (e) => {
//             if (!sidebarUserDropdown.contains(e.target) && 
//                 !sidebarUserTrigger.contains(e.target)) {
//                 sidebarUserTrigger.classList.remove('active');
//                 sidebarUserDropdown.classList.remove('active');
//             }
//         });
        
//         // Empêcher la fermeture si on clique dans le dropdown
//         sidebarUserDropdown.addEventListener('click', (e) => {
//             e.stopPropagation();
//         });
//     }
// });

// console.log('✅ Advanced Analysis script loaded - COMPLETE VERSION with Twelve Data API');

/* ==============================================
   ADVANCED-ANALYSIS.JS - WALL STREET PRO EDITION
   PARTIE 1/6 - MOMENTUM INDICATORS
   ✅ RSI, MACD, Bollinger Bands, CCI
   ============================================== */

// ============================================
// RSI (RELATIVE STRENGTH INDEX) - ESSENTIEL
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
            tooltip: { 
                borderRadius: 10,
                valueDecimals: 2,
                formatter: function() {
                    let level = 'Neutral';
                    if (this.y > 70) level = '🔴 Overbought';
                    else if (this.y < 30) level = '🟢 Oversold';
                    
                    return `<b>RSI:</b> ${this.y.toFixed(2)}<br/><b>Level:</b> ${level}`;
                }
            },
            series: [
                {
                    type: 'area',
                    name: 'RSI',
                    data: rsi,
                    color: this.colors.primary,
                    fillColor: {
                        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                        stops: [
                            [0, Highcharts.color(this.colors.primary).setOpacity(0.3).get('rgba')],
                            [1, Highcharts.color(this.colors.primary).setOpacity(0.1).get('rgba')]
                        ]
                    },
                    lineWidth: 2,
                    threshold: 50
                }
            ],
            credits: { enabled: false }
        });
    }
    
    this.displayRSISignal(rsi);
},

calculateRSI(prices, period = 14) {
    if (prices.length < period + 1) return [];
    
    const changes = [];
    for (let i = 1; i < prices.length; i++) {
        changes.push(prices[i].close - prices[i - 1].close);
    }
    
    const rsi = [];
    let avgGain = 0;
    let avgLoss = 0;
    
    // Initial average
    for (let i = 0; i < period; i++) {
        if (changes[i] > 0) avgGain += changes[i];
        else avgLoss += Math.abs(changes[i]);
    }
    avgGain /= period;
    avgLoss /= period;
    
    // First RSI
    const rs = avgGain / avgLoss;
    rsi.push([prices[period].timestamp, 100 - (100 / (1 + rs))]);
    
    // Smoothed RSI
    for (let i = period; i < changes.length; i++) {
        const change = changes[i];
        const gain = change > 0 ? change : 0;
        const loss = change < 0 ? Math.abs(change) : 0;
        
        avgGain = ((avgGain * (period - 1)) + gain) / period;
        avgLoss = ((avgLoss * (period - 1)) + loss) / period;
        
        const newRS = avgGain / avgLoss;
        rsi.push([prices[i + 1].timestamp, 100 - (100 / (1 + newRS))]);
    }
    
    return rsi;
},

displayRSISignal(rsi) {
    if (!rsi.length) {
        document.getElementById('rsiSignal').textContent = 'Not enough data';
        return;
    }
    
    const lastRSI = rsi[rsi.length - 1][1];
    const prevRSI = rsi.length > 1 ? rsi[rsi.length - 2][1] : lastRSI;
    
    let signal = 'neutral';
    let text = `RSI: ${lastRSI.toFixed(2)} - `;
    
    // Divergence detection
    const recentRSI = rsi.slice(-14);
    const rsiTrend = recentRSI[recentRSI.length - 1][1] - recentRSI[0][1];
    
    if (lastRSI > 70) {
        signal = 'bearish';
        text += '🔴 OVERBOUGHT - Strong Sell Signal';
        if (prevRSI > 70 && lastRSI < prevRSI) {
            text += ' (Bearish Reversal Forming)';
        }
    } else if (lastRSI < 30) {
        signal = 'bullish';
        text += '🟢 OVERSOLD - Strong Buy Signal';
        if (prevRSI < 30 && lastRSI > prevRSI) {
            text += ' (Bullish Reversal Forming)';
        }
    } else if (lastRSI >= 50 && lastRSI < 70) {
        signal = 'bullish';
        text += 'Bullish Zone';
    } else if (lastRSI <= 50 && lastRSI > 30) {
        signal = 'bearish';
        text += 'Bearish Zone';
    } else {
        text += 'Neutral';
    }
    
    const signalBox = document.getElementById('rsiSignal');
    signalBox.className = `signal-box ${signal}`;
    signalBox.textContent = text;
},

// ============================================
// MACD (MOVING AVERAGE CONVERGENCE DIVERGENCE)
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
                        color: '#333',
                        width: 2,
                        zIndex: 2
                    }]
                }
            ],
            tooltip: { 
                borderRadius: 10, 
                shared: true,
                valueDecimals: 4
            },
            plotOptions: {
                column: {
                    borderRadius: 3,
                    pointPadding: 0.1,
                    groupPadding: 0
                }
            },
            series: [
                {
                    type: 'line',
                    name: 'MACD Line',
                    data: macd.macdLine,
                    color: this.colors.primary,
                    lineWidth: 2,
                    zIndex: 3
                },
                {
                    type: 'line',
                    name: 'Signal Line',
                    data: macd.signalLine,
                    color: this.colors.danger,
                    lineWidth: 2,
                    zIndex: 3
                },
                {
                    type: 'column',
                    name: 'Histogram',
                    data: macd.histogram,
                    color: {
                        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                        stops: [
                            [0, this.colors.success],
                            [1, Highcharts.color(this.colors.success).setOpacity(0.5).get('rgba')]
                        ]
                    },
                    negativeColor: {
                        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                        stops: [
                            [0, Highcharts.color(this.colors.danger).setOpacity(0.5).get('rgba')],
                            [1, this.colors.danger]
                        ]
                    },
                    zIndex: 1
                }
            ],
            credits: { enabled: false }
        });
    }
    
    this.displayMACDSignal(macd);
},

calculateMACD(prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
    const closePrices = prices.map(p => ({ timestamp: p.timestamp, close: p.close }));
    
    // Calculate EMAs
    const fastEMA = this.calculateEMA(closePrices, fastPeriod);
    const slowEMA = this.calculateEMA(closePrices, slowPeriod);
    
    // MACD Line = Fast EMA - Slow EMA
    const macdLine = [];
    const minLength = Math.min(fastEMA.length, slowEMA.length);
    
    for (let i = 0; i < minLength; i++) {
        macdLine.push({
            timestamp: fastEMA[i].timestamp,
            value: fastEMA[i].value - slowEMA[i].value
        });
    }
    
    // Signal Line = EMA of MACD Line
    const signalLine = this.calculateEMA(macdLine, signalPeriod);
    
    // Histogram = MACD Line - Signal Line
    const histogram = [];
    const histMinLength = Math.min(macdLine.length, signalLine.length);
    
    for (let i = 0; i < histMinLength; i++) {
        const macdValue = macdLine.find(m => m.timestamp === signalLine[i].timestamp)?.value || 0;
        histogram.push([
            signalLine[i].timestamp,
            macdValue - signalLine[i].value
        ]);
    }
    
    return {
        macdLine: macdLine.map(m => [m.timestamp, m.value]),
        signalLine: signalLine.map(s => [s.timestamp, s.value]),
        histogram: histogram
    };
},

calculateEMA(data, period) {
    if (data.length < period) return [];
    
    const ema = [];
    const multiplier = 2 / (period + 1);
    
    // First EMA = SMA
    let sum = 0;
    for (let i = 0; i < period; i++) {
        sum += data[i].close || data[i].value;
    }
    const firstEMA = sum / period;
    ema.push({ timestamp: data[period - 1].timestamp, value: firstEMA });
    
    // Calculate EMA for remaining periods
    for (let i = period; i < data.length; i++) {
        const currentValue = data[i].close || data[i].value;
        const newEMA = (currentValue - ema[ema.length - 1].value) * multiplier + ema[ema.length - 1].value;
        ema.push({ timestamp: data[i].timestamp, value: newEMA });
    }
    
    return ema;
},

displayMACDSignal(macd) {
    if (!macd.macdLine.length || !macd.signalLine.length) {
        document.getElementById('macdSignal').textContent = 'Not enough data';
        return;
    }
    
    const lastMACD = macd.macdLine[macd.macdLine.length - 1][1];
    const lastSignal = macd.signalLine[macd.signalLine.length - 1][1];
    const prevMACD = macd.macdLine.length > 1 ? macd.macdLine[macd.macdLine.length - 2][1] : lastMACD;
    const prevSignal = macd.signalLine.length > 1 ? macd.signalLine[macd.signalLine.length - 2][1] : lastSignal;
    
    let signal = 'neutral';
    let text = `MACD: ${lastMACD.toFixed(4)}, Signal: ${lastSignal.toFixed(4)} - `;
    
    // Crossover detection
    if (lastMACD > lastSignal && prevMACD <= prevSignal) {
        signal = 'bullish';
        text += '🚀 BULLISH CROSSOVER - Strong Buy Signal!';
    } else if (lastMACD < lastSignal && prevMACD >= prevSignal) {
        signal = 'bearish';
        text += '⚠ BEARISH CROSSOVER - Strong Sell Signal!';
    } else if (lastMACD > lastSignal) {
        signal = 'bullish';
        text += 'Bullish (MACD above Signal)';
    } else if (lastMACD < lastSignal) {
        signal = 'bearish';
        text += 'Bearish (MACD below Signal)';
    } else {
        text += 'Neutral';
    }
    
    // Histogram divergence
    const lastHist = macd.histogram[macd.histogram.length - 1][1];
    if (Math.abs(lastHist) > 0.1) {
        text += ` | Histogram: ${lastHist > 0 ? 'Expanding Bullish' : 'Expanding Bearish'}`;
    }
    
    const signalBox = document.getElementById('macdSignal');
    signalBox.className = `signal-box ${signal}`;
    signalBox.textContent = text;
},

// ============================================
// BOLLINGER BANDS - VOLATILITY INDICATOR
// ============================================

updateBollingerBandsChart() {
    const prices = this.stockData.prices;
    const bollinger = this.calculateBollingerBands(prices);
    const ohlc = prices.map(p => [p.timestamp, p.open, p.high, p.low, p.close]);
    
    if (this.charts.bollinger) {
        this.charts.bollinger.series[0].setData(ohlc, false);
        this.charts.bollinger.series[1].setData(bollinger.upper, false);
        this.charts.bollinger.series[2].setData(bollinger.middle, false);
        this.charts.bollinger.series[3].setData(bollinger.lower, false);
        this.charts.bollinger.series[4].setData(bollinger.bandwidth, false);
        this.charts.bollinger.redraw();
    } else {
        this.charts.bollinger = Highcharts.stockChart('bollingerChart', {
            chart: { borderRadius: 15, height: 600 },
            title: {
                text: 'Bollinger Bands® - Volatility Analysis',
                style: { color: this.colors.primary, fontWeight: 'bold' }
            },
            rangeSelector: { enabled: false },
            navigator: { enabled: true },
            xAxis: { type: 'datetime', crosshair: true },
            yAxis: [
                {
                    title: { text: 'Price' },
                    height: '70%',
                    lineWidth: 2
                },
                {
                    title: { text: 'Bandwidth %' },
                    top: '75%',
                    height: '25%',
                    offset: 0,
                    lineWidth: 2
                }
            ],
            tooltip: { 
                borderRadius: 10, 
                split: false,
                shared: true
            },
            series: [
                {
                    type: 'candlestick',
                    name: this.currentSymbol,
                    data: ohlc,
                    color: this.colors.danger,
                    upColor: this.colors.success,
                    zIndex: 2,
                    yAxis: 0
                },
                {
                    type: 'line',
                    name: 'Upper Band',
                    data: bollinger.upper,
                    color: this.colors.danger,
                    lineWidth: 2,
                    dashStyle: 'Dash',
                    marker: { enabled: false },
                    zIndex: 1,
                    yAxis: 0
                },
                {
                    type: 'line',
                    name: 'Middle (SMA 20)',
                    data: bollinger.middle,
                    color: this.colors.primary,
                    lineWidth: 2,
                    marker: { enabled: false },
                    zIndex: 1,
                    yAxis: 0
                },
                {
                    type: 'line',
                    name: 'Lower Band',
                    data: bollinger.lower,
                    color: this.colors.success,
                    lineWidth: 2,
                    dashStyle: 'Dash',
                    marker: { enabled: false },
                    zIndex: 1,
                    yAxis: 0
                },
                {
                    type: 'area',
                    name: 'Bandwidth %',
                    data: bollinger.bandwidth,
                    color: this.colors.purple,
                    fillOpacity: 0.3,
                    lineWidth: 2,
                    yAxis: 1
                }
            ],
            credits: { enabled: false }
        });
    }
    
    this.displayBollingerSignal(bollinger, prices);
},

calculateBollingerBands(prices, period = 20, stdDev = 2) {
    const sma = this.calculateSMA(prices, period);
    const upper = [];
    const middle = [];
    const lower = [];
    const bandwidth = [];
    
    for (let i = 0; i < sma.length; i++) {
        const smaValue = sma[i][1];
        const priceIndex = prices.findIndex(p => p.timestamp === sma[i][0]);
        
        if (priceIndex === -1 || priceIndex < period - 1) continue;
        
        // Calculate standard deviation
        const slice = prices.slice(priceIndex - period + 1, priceIndex + 1);
        const mean = slice.reduce((sum, p) => sum + p.close, 0) / period;
        const variance = slice.reduce((sum, p) => sum + Math.pow(p.close - mean, 2), 0) / period;
        const sd = Math.sqrt(variance);
        
        const upperBand = smaValue + (stdDev * sd);
        const lowerBand = smaValue - (stdDev * sd);
        const bw = ((upperBand - lowerBand) / smaValue) * 100;
        
        upper.push([sma[i][0], upperBand]);
        middle.push([sma[i][0], smaValue]);
        lower.push([sma[i][0], lowerBand]);
        bandwidth.push([sma[i][0], bw]);
    }
    
    return { upper, middle, lower, bandwidth };
},

calculateSMA(prices, period) {
    const sma = [];
    
    for (let i = period - 1; i < prices.length; i++) {
        const slice = prices.slice(i - period + 1, i + 1);
        const avg = slice.reduce((sum, p) => sum + p.close, 0) / period;
        sma.push([prices[i].timestamp, avg]);
    }
    
    return sma;
},

displayBollingerSignal(bollinger, prices) {
    if (!bollinger.upper.length || !bollinger.lower.length) {
        document.getElementById('bollingerSignal').textContent = 'Not enough data';
        return;
    }
    
    const lastPrice = prices[prices.length - 1].close;
    const lastUpper = bollinger.upper[bollinger.upper.length - 1][1];
    const lastMiddle = bollinger.middle[bollinger.middle.length - 1][1];
    const lastLower = bollinger.lower[bollinger.lower.length - 1][1];
    const lastBandwidth = bollinger.bandwidth[bollinger.bandwidth.length - 1][1];
    
    // Calculate %B (position within bands)
    const percentB = ((lastPrice - lastLower) / (lastUpper - lastLower)) * 100;
    
    let signal = 'neutral';
    let text = `Price: ${this.formatCurrency(lastPrice)}, %B: ${percentB.toFixed(1)}% - `;
    
    if (lastPrice > lastUpper) {
        signal = 'bearish';
        text += '🔴 Above Upper Band - Overbought (Potential Reversal)';
    } else if (lastPrice < lastLower) {
        signal = 'bullish';
        text += '🟢 Below Lower Band - Oversold (Potential Bounce)';
    } else if (percentB > 80) {
        signal = 'bearish';
        text += 'Near Upper Band - Resistance Zone';
    } else if (percentB < 20) {
        signal = 'bullish';
        text += 'Near Lower Band - Support Zone';
    } else {
        text += 'Within Normal Range';
    }
    
    // Bandwidth analysis (squeeze detection)
    const avgBandwidth = bollinger.bandwidth.slice(-20).reduce((sum, b) => sum + b[1], 0) / 20;
    if (lastBandwidth < avgBandwidth * 0.7) {
        text += ' | ⚡ SQUEEZE DETECTED - Breakout Imminent!';
    }
    
    const signalBox = document.getElementById('bollingerSignal');
    signalBox.className = `signal-box ${signal}`;
    signalBox.textContent = text;
},

// ============================================
// CCI (COMMODITY CHANNEL INDEX)
// ============================================

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
                        color: '#666',
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
                    type: 'area',
                    name: 'CCI',
                    data: cci,
                    color: this.colors.tertiary,
                    fillColor: {
                        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                        stops: [
                            [0, Highcharts.color(this.colors.tertiary).setOpacity(0.3).get('rgba')],
                            [1, Highcharts.color(this.colors.tertiary).setOpacity(0.1).get('rgba')]
                        ]
                    },
                    lineWidth: 2,
                    threshold: 0
                }
            ],
            credits: { enabled: false }
        });
    }
    
    this.displayCCISignal(cci);
},

calculateCCI(prices, period = 20) {
    const cci = [];
    const constant = 0.015; // Lambert constant
    
    for (let i = period - 1; i < prices.length; i++) {
        const slice = prices.slice(i - period + 1, i + 1);
        
        // Calculate Typical Price
        const typicalPrices = slice.map(p => (p.high + p.low + p.close) / 3);
        const currentTP = typicalPrices[typicalPrices.length - 1];
        
        // Calculate SMA of Typical Price
        const smaTP = typicalPrices.reduce((sum, tp) => sum + tp, 0) / period;
        
        // Calculate Mean Deviation
        const meanDeviation = typicalPrices.reduce((sum, tp) => sum + Math.abs(tp - smaTP), 0) / period;
        
        // Calculate CCI
        const cciValue = (currentTP - smaTP) / (constant * meanDeviation);
        
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
    const prevCCI = cci.length > 1 ? cci[cci.length - 2][1] : lastCCI;
    
    let signal = 'neutral';
    let text = `CCI: ${lastCCI.toFixed(2)} - `;
    
    if (lastCCI > 100) {
        signal = 'bearish';
        text += '🔴 Overbought - Strong Sell Signal';
        if (prevCCI > 100 && lastCCI < prevCCI) {
            text += ' (Reversal Starting)';
        }
    } else if (lastCCI < -100) {
        signal = 'bullish';
        text += '🟢 Oversold - Strong Buy Signal';
        if (prevCCI < -100 && lastCCI > prevCCI) {
            text += ' (Reversal Starting)';
        }
    } else if (lastCCI > 0 && prevCCI <= 0) {
        signal = 'bullish';
        text += 'Bullish Crossover Above Zero';
    } else if (lastCCI < 0 && prevCCI >= 0) {
        signal = 'bearish';
        text += 'Bearish Crossover Below Zero';
    } else if (lastCCI > 0) {
        signal = 'bullish';
        text += 'Bullish Zone (Above Zero)';
    } else {
        signal = 'bearish';
        text += 'Bearish Zone (Below Zero)';
    }
    
    const signalBox = document.getElementById('cciSignal');
    signalBox.className = `signal-box ${signal}`;
    signalBox.textContent = text;
},

/* ==============================================
   ADVANCED-ANALYSIS.JS - WALL STREET PRO EDITION
   PARTIE 2/6 - VOLUME INDICATORS
   ✅ MFI, A/D Line, Chaikin Money Flow, Volume Profile
   ============================================== */

// ============================================
// MFI (MONEY FLOW INDEX) - RSI avec Volume
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
                text: 'MFI - Money Flow Index (Volume-Weighted RSI)',
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
                        label: { 
                            text: 'Overbought (80)', 
                            align: 'right', 
                            style: { color: this.colors.danger, fontWeight: 'bold' } 
                        }
                    },
                    {
                        value: 50,
                        color: '#999',
                        dashStyle: 'Dot',
                        width: 1
                    },
                    {
                        value: 20,
                        color: this.colors.success,
                        dashStyle: 'ShortDash',
                        width: 2,
                        label: { 
                            text: 'Oversold (20)', 
                            align: 'right', 
                            style: { color: this.colors.success, fontWeight: 'bold' } 
                        }
                    }
                ],
                min: 0,
                max: 100
            },
            tooltip: { 
                borderRadius: 10,
                valueDecimals: 2,
                formatter: function() {
                    let level = 'Neutral';
                    if (this.y > 80) level = '🔴 Overbought';
                    else if (this.y < 20) level = '🟢 Oversold';
                    
                    return `<b>MFI:</b> ${this.y.toFixed(2)}<br/><b>Level:</b> ${level}`;
                }
            },
            series: [
                {
                    type: 'area',
                    name: 'MFI',
                    data: mfi,
                    color: this.colors.secondary,
                    fillColor: {
                        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                        stops: [
                            [0, Highcharts.color(this.colors.secondary).setOpacity(0.4).get('rgba')],
                            [1, Highcharts.color(this.colors.secondary).setOpacity(0.1).get('rgba')]
                        ]
                    },
                    lineWidth: 2
                }
            ],
            credits: { enabled: false }
        });
    }
    
    this.displayMFISignal(mfi);
},

calculateMFI(prices, period = 14) {
    if (prices.length < period + 1) return [];
    
    const mfi = [];
    const typicalPrices = prices.map(p => (p.high + p.low + p.close) / 3);
    const rawMoneyFlow = prices.map((p, i) => typicalPrices[i] * p.volume);
    
    for (let i = period; i < prices.length; i++) {
        let positiveFlow = 0;
        let negativeFlow = 0;
        
        for (let j = i - period + 1; j <= i; j++) {
            if (typicalPrices[j] > typicalPrices[j - 1]) {
                positiveFlow += rawMoneyFlow[j];
            } else if (typicalPrices[j] < typicalPrices[j - 1]) {
                negativeFlow += rawMoneyFlow[j];
            }
        }
        
        const moneyFlowRatio = positiveFlow / negativeFlow;
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
    const prevMFI = mfi.length > 1 ? mfi[mfi.length - 2][1] : lastMFI;
    
    let signal = 'neutral';
    let text = `MFI: ${lastMFI.toFixed(2)} - `;
    
    if (lastMFI > 80) {
        signal = 'bearish';
        text += '🔴 OVERBOUGHT - Heavy Selling Pressure Expected';
        if (prevMFI > 80 && lastMFI < prevMFI) {
            text += ' (⚠ Divergence: Reversal Imminent)';
        }
    } else if (lastMFI < 20) {
        signal = 'bullish';
        text += '🟢 OVERSOLD - Strong Buying Opportunity';
        if (prevMFI < 20 && lastMFI > prevMFI) {
            text += ' (✅ Momentum Shifting Up)';
        }
    } else if (lastMFI >= 50) {
        signal = 'bullish';
        text += 'Bullish - Money Flowing In';
    } else {
        signal = 'bearish';
        text += 'Bearish - Money Flowing Out';
    }
    
    const signalBox = document.getElementById('mfiSignal');
    signalBox.className = `signal-box ${signal}`;
    signalBox.textContent = text;
},

// ============================================
// A/D LINE (ACCUMULATION/DISTRIBUTION)
// ============================================

updateADLineChart() {
    const prices = this.stockData.prices;
    const adLine = this.calculateADLine(prices);
    
    if (this.charts.adline) {
        this.charts.adline.series[0].setData(adLine, true);
    } else {
        this.charts.adline = Highcharts.chart('adlineChart', {
            chart: { borderRadius: 15, height: 400 },
            title: {
                text: 'A/D Line - Accumulation/Distribution',
                style: { color: this.colors.primary, fontWeight: 'bold' }
            },
            xAxis: { type: 'datetime', crosshair: true },
            yAxis: { 
                title: { text: 'A/D Line' },
                labels: {
                    formatter: function() {
                        return Highcharts.numberFormat(this.value / 1000000, 1) + 'M';
                    }
                }
            },
            tooltip: { 
                borderRadius: 10,
                valueDecimals: 0,
                formatter: function() {
                    return `<b>A/D Line:</b> ${Highcharts.numberFormat(this.y, 0)}`;
                }
            },
            series: [
                {
                    type: 'area',
                    name: 'A/D Line',
                    data: adLine,
                    color: this.colors.lightBlue,
                    fillColor: {
                        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                        stops: [
                            [0, Highcharts.color(this.colors.lightBlue).setOpacity(0.3).get('rgba')],
                            [1, Highcharts.color(this.colors.lightBlue).setOpacity(0.05).get('rgba')]
                        ]
                    },
                    lineWidth: 2
                }
            ],
            credits: { enabled: false }
        });
    }
    
    this.displayADLineSignal(adLine, prices);
},

calculateADLine(prices) {
    const adLine = [];
    let cumulative = 0;
    
    for (let i = 0; i < prices.length; i++) {
        const { high, low, close, volume } = prices[i];
        
        if (high === low) {
            adLine.push([prices[i].timestamp, cumulative]);
            continue;
        }
        
        const moneyFlowMultiplier = ((close - low) - (high - close)) / (high - low);
        const moneyFlowVolume = moneyFlowMultiplier * volume;
        
        cumulative += moneyFlowVolume;
        adLine.push([prices[i].timestamp, cumulative]);
    }
    
    return adLine;
},

displayADLineSignal(adLine, prices) {
    if (adLine.length < 20) {
        document.getElementById('adlineSignal').textContent = 'Not enough data';
        return;
    }
    
    const recentPrices = prices.slice(-20);
    const recentAD = adLine.slice(-20);
    
    const priceChange = recentPrices[recentPrices.length - 1].close - recentPrices[0].close;
    const adChange = recentAD[recentAD.length - 1][1] - recentAD[0][1];
    
    let signal = 'neutral';
    let text = '';
    
    // Bullish/Bearish Divergence Detection
    if (priceChange > 0 && adChange > 0) {
        signal = 'bullish';
        text = '🚀 STRONG ACCUMULATION - Price ↑ + A/D ↑ (Institutional Buying)';
    } else if (priceChange < 0 && adChange < 0) {
        signal = 'bearish';
        text = '📉 STRONG DISTRIBUTION - Price ↓ + A/D ↓ (Institutional Selling)';
    } else if (priceChange > 0 && adChange < 0) {
        signal = 'bearish';
        text = '⚠ BEARISH DIVERGENCE - Price ↑ but A/D ↓ (Weak Rally, Sell Signal)';
    } else if (priceChange < 0 && adChange > 0) {
        signal = 'bullish';
        text = '✅ BULLISH DIVERGENCE - Price ↓ but A/D ↑ (Accumulation on Dip, Buy Signal)';
    } else {
        text = 'Neutral - No Clear Divergence';
    }
    
    const signalBox = document.getElementById('adlineSignal');
    signalBox.className = `signal-box ${signal}`;
    signalBox.textContent = text;
},

// ============================================
// CMF (CHAIKIN MONEY FLOW)
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
                        value: 0.1,
                        color: this.colors.success,
                        dashStyle: 'Dash',
                        width: 1,
                        label: { text: 'Strong Buying (+0.1)', align: 'right', style: { color: this.colors.success } }
                    },
                    {
                        value: 0,
                        color: '#333',
                        width: 2,
                        zIndex: 2
                    },
                    {
                        value: -0.1,
                        color: this.colors.danger,
                        dashStyle: 'Dash',
                        width: 1,
                        label: { text: 'Strong Selling (-0.1)', align: 'right', style: { color: this.colors.danger } }
                    }
                ]
            },
            tooltip: { 
                borderRadius: 10,
                valueDecimals: 4
            },
            plotOptions: {
                column: {
                    borderRadius: 3,
                    pointPadding: 0,
                    groupPadding: 0
                }
            },
            series: [
                {
                    type: 'column',
                    name: 'CMF',
                    data: cmf,
                    color: this.colors.success,
                    negativeColor: this.colors.danger,
                    threshold: 0
                }
            ],
            credits: { enabled: false }
        });
    }
    
    this.displayCMFSignal(cmf);
},

calculateCMF(prices, period = 21) {
    const cmf = [];
    
    for (let i = period - 1; i < prices.length; i++) {
        const slice = prices.slice(i - period + 1, i + 1);
        
        let sumMoneyFlowVolume = 0;
        let sumVolume = 0;
        
        for (const p of slice) {
            const { high, low, close, volume } = p;
            
            if (high === low) continue;
            
            const moneyFlowMultiplier = ((close - low) - (high - close)) / (high - low);
            const moneyFlowVolume = moneyFlowMultiplier * volume;
            
            sumMoneyFlowVolume += moneyFlowVolume;
            sumVolume += volume;
        }
        
        const cmfValue = sumVolume > 0 ? sumMoneyFlowVolume / sumVolume : 0;
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
    const prevCMF = cmf.length > 1 ? cmf[cmf.length - 2][1] : lastCMF;
    
    let signal = 'neutral';
    let text = `CMF: ${lastCMF.toFixed(4)} - `;
    
    if (lastCMF > 0.1) {
        signal = 'bullish';
        text += '🚀 STRONG BUYING PRESSURE - Accumulation Phase';
    } else if (lastCMF < -0.1) {
        signal = 'bearish';
        text += '📉 STRONG SELLING PRESSURE - Distribution Phase';
    } else if (lastCMF > 0 && prevCMF <= 0) {
        signal = 'bullish';
        text += '✅ Bullish Crossover - Buying Starting';
    } else if (lastCMF < 0 && prevCMF >= 0) {
        signal = 'bearish';
        text += '⚠ Bearish Crossover - Selling Starting';
    } else if (lastCMF > 0) {
        signal = 'bullish';
        text += 'Buying Pressure (Positive CMF)';
    } else if (lastCMF < 0) {
        signal = 'bearish';
        text += 'Selling Pressure (Negative CMF)';
    } else {
        text += 'Neutral';
    }
    
    const signalBox = document.getElementById('cmfSignal');
    signalBox.className = `signal-box ${signal}`;
    signalBox.textContent = text;
},

// ============================================
// VOLUME PROFILE - Institutional Levels
// ============================================

updateVolumeProfileChart() {
    const prices = this.stockData.prices;
    const profile = this.calculateVolumeProfile(prices);
    const ohlc = prices.map(p => [p.timestamp, p.open, p.high, p.low, p.close]);
    
    if (this.charts.volumeProfile) {
        this.charts.volumeProfile.series[0].setData(ohlc, false);
        this.charts.volumeProfile.yAxis[0].update({
            plotLines: profile.levels.map(level => ({
                value: level.price,
                color: level.type === 'POC' ? '#FF6B00' : level.type === 'VAH' ? this.colors.danger : this.colors.success,
                dashStyle: level.type === 'POC' ? 'Solid' : 'Dash',
                width: level.type === 'POC' ? 3 : 2,
                label: {
                    text: `${level.type} (${this.formatCurrency(level.price)})`,
                    align: 'right',
                    style: {
                        color: level.type === 'POC' ? '#FF6B00' : level.type === 'VAH' ? this.colors.danger : this.colors.success,
                        fontWeight: level.type === 'POC' ? 'bold' : 'normal'
                    }
                },
                zIndex: 5
            }))
        }, false);
        this.charts.volumeProfile.redraw();
    } else {
        this.charts.volumeProfile = Highcharts.stockChart('volumeProfileChart', {
            chart: { borderRadius: 15, height: 600 },
            title: {
                text: 'Volume Profile - Institutional Support/Resistance',
                style: { color: this.colors.primary, fontWeight: 'bold' }
            },
            rangeSelector: { enabled: false },
            navigator: { enabled: true },
            xAxis: { type: 'datetime', crosshair: true },
            yAxis: {
                title: { text: 'Price' },
                plotLines: profile.levels.map(level => ({
                    value: level.price,
                    color: level.type === 'POC' ? '#FF6B00' : level.type === 'VAH' ? this.colors.danger : this.colors.success,
                    dashStyle: level.type === 'POC' ? 'Solid' : 'Dash',
                    width: level.type === 'POC' ? 3 : 2,
                    label: {
                        text: `${level.type} (${this.formatCurrency(level.price)})`,
                        align: 'right',
                        style: {
                            color: level.type === 'POC' ? '#FF6B00' : level.type === 'VAH' ? this.colors.danger : this.colors.success,
                            fontWeight: level.type === 'POC' ? 'bold' : 'normal'
                        }
                    },
                    zIndex: 5
                }))
            },
            tooltip: { borderRadius: 10, shared: true },
            series: [
                {
                    type: 'candlestick',
                    name: this.currentSymbol,
                    data: ohlc,
                    color: this.colors.danger,
                    upColor: this.colors.success,
                    zIndex: 2
                }
            ],
            credits: { enabled: false }
        });
    }
    
    this.displayVolumeProfileLevels(profile);
},

calculateVolumeProfile(prices, bins = 50) {
    // Find price range
    const priceHigh = Math.max(...prices.map(p => p.high));
    const priceLow = Math.min(...prices.map(p => p.low));
    const priceRange = priceHigh - priceLow;
    const binSize = priceRange / bins;
    
    // Create volume bins
    const volumeBins = new Array(bins).fill(0);
    
    for (const p of prices) {
        const binIndex = Math.min(
            Math.floor((p.close - priceLow) / binSize),
            bins - 1
        );
        volumeBins[binIndex] += p.volume;
    }
    
    // Find Point of Control (POC) - highest volume level
    const pocIndex = volumeBins.indexOf(Math.max(...volumeBins));
    const pocPrice = priceLow + (pocIndex * binSize) + (binSize / 2);
    
    // Calculate Value Area (70% of volume)
    const totalVolume = volumeBins.reduce((sum, vol) => sum + vol, 0);
    const targetVolume = totalVolume * 0.70;
    
    let currentVolume = volumeBins[pocIndex];
    let upperIndex = pocIndex;
    let lowerIndex = pocIndex;
    
    while (currentVolume < targetVolume && (upperIndex < bins - 1 || lowerIndex > 0)) {
        const upperVolume = upperIndex < bins - 1 ? volumeBins[upperIndex + 1] : 0;
        const lowerVolume = lowerIndex > 0 ? volumeBins[lowerIndex - 1] : 0;
        
        if (upperVolume > lowerVolume) {
            upperIndex++;
            currentVolume += upperVolume;
        } else {
            lowerIndex--;
            currentVolume += lowerVolume;
        }
    }
    
    const vahPrice = priceLow + (upperIndex * binSize) + (binSize / 2); // Value Area High
    const valPrice = priceLow + (lowerIndex * binSize) + (binSize / 2); // Value Area Low
    
    return {
        levels: [
            { type: 'POC', price: pocPrice, volume: volumeBins[pocIndex] },
            { type: 'VAH', price: vahPrice, volume: volumeBins[upperIndex] },
            { type: 'VAL', price: valPrice, volume: volumeBins[lowerIndex] }
        ],
        bins: volumeBins.map((vol, i) => ({
            price: priceLow + (i * binSize) + (binSize / 2),
            volume: vol
        }))
    };
},

displayVolumeProfileLevels(profile) {
    const currentPrice = this.stockData.prices[this.stockData.prices.length - 1].close;
    
    const tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>Level</th>
                    <th>Price</th>
                    <th>Volume</th>
                    <th>Distance</th>
                    <th>Type</th>
                </tr>
            </thead>
            <tbody>
                ${profile.levels.map(level => {
                    const distance = ((level.price - currentPrice) / currentPrice) * 100;
                    const distanceText = `${distance >= 0 ? '+' : ''}${distance.toFixed(2)}%`;
                    const type = level.price > currentPrice ? 'Resistance' : 'Support';
                    
                    let levelColor = this.colors.primary;
                    if (level.type === 'POC') levelColor = '#FF6B00';
                    else if (level.type === 'VAH') levelColor = this.colors.danger;
                    else if (level.type === 'VAL') levelColor = this.colors.success;
                    
                    return `
                        <tr>
                            <td style='color: ${levelColor}; font-weight: bold;'>${level.type}</td>
                            <td class='level-price'>${this.formatCurrency(level.price)}</td>
                            <td>${Highcharts.numberFormat(level.volume, 0)}</td>
                            <td style='color: ${distance >= 0 ? this.colors.danger : this.colors.success}'>${distanceText}</td>
                            <td style='color: ${type === 'Resistance' ? this.colors.danger : this.colors.success}'>${type}</td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
        <div style="margin-top: 15px; padding: 12px; background: rgba(255, 107, 0, 0.1); border-left: 4px solid #FF6B00; border-radius: 8px;">
            <strong style="color: #FF6B00;">📊 POC (Point of Control):</strong> Price level with highest trading volume - Major institutional support/resistance
        </div>
    `;
    
    document.getElementById('volumeProfileLevels').innerHTML = tableHTML;
},

/* ==============================================
   ADVANCED-ANALYSIS.JS - WALL STREET PRO EDITION
   PARTIE 3/6 - ADVANCED MOVING AVERAGES
   ✅ EMA, WMA, HMA, DEMA, TEMA
   ============================================== */

// ============================================
// MULTIPLE MOVING AVERAGES COMPARISON
// ============================================

updateMovingAveragesChart() {
    const prices = this.stockData.prices;
    const ohlc = prices.map(p => [p.timestamp, p.open, p.high, p.low, p.close]);
    
    // Calculate different MAs
    const sma20 = this.calculateSMA(prices, 20);
    const sma50 = this.calculateSMA(prices, 50);
    const sma200 = this.calculateSMA(prices, 200);
    const ema20 = this.calculateEMAFromPrices(prices, 20);
    const wma20 = this.calculateWMA(prices, 20);
    const hma20 = this.calculateHMA(prices, 20);
    
    if (this.charts.movingAverages) {
        this.charts.movingAverages.series[0].setData(ohlc, false);
        this.charts.movingAverages.series[1].setData(sma20, false);
        this.charts.movingAverages.series[2].setData(sma50, false);
        this.charts.movingAverages.series[3].setData(sma200, false);
        this.charts.movingAverages.series[4].setData(ema20, false);
        this.charts.movingAverages.series[5].setData(wma20, false);
        this.charts.movingAverages.series[6].setData(hma20, false);
        this.charts.movingAverages.redraw();
    } else {
        this.charts.movingAverages = Highcharts.stockChart('movingAveragesChart', {
            chart: { borderRadius: 15, height: 600 },
            title: {
                text: 'Moving Averages - Trend Analysis',
                style: { color: this.colors.primary, fontWeight: 'bold' }
            },
            rangeSelector: { enabled: false },
            navigator: { enabled: true },
            xAxis: { type: 'datetime', crosshair: true },
            yAxis: { title: { text: 'Price' } },
            tooltip: { borderRadius: 10, shared: true, split: false },
            series: [
                {
                    type: 'candlestick',
                    name: this.currentSymbol,
                    data: ohlc,
                    color: this.colors.danger,
                    upColor: this.colors.success,
                    zIndex: 2
                },
                {
                    type: 'line',
                    name: 'SMA 20',
                    data: sma20,
                    color: this.colors.primary,
                    lineWidth: 2,
                    marker: { enabled: false },
                    zIndex: 1
                },
                {
                    type: 'line',
                    name: 'SMA 50',
                    data: sma50,
                    color: this.colors.warning,
                    lineWidth: 2,
                    marker: { enabled: false },
                    zIndex: 1
                },
                {
                    type: 'line',
                    name: 'SMA 200',
                    data: sma200,
                    color: this.colors.danger,
                    lineWidth: 3,
                    marker: { enabled: false },
                    zIndex: 1
                },
                {
                    type: 'line',
                    name: 'EMA 20',
                    data: ema20,
                    color: this.colors.secondary,
                    lineWidth: 2,
                    dashStyle: 'Dash',
                    marker: { enabled: false },
                    zIndex: 1
                },
                {
                    type: 'line',
                    name: 'WMA 20',
                    data: wma20,
                    color: this.colors.purple,
                    lineWidth: 2,
                    dashStyle: 'Dot',
                    marker: { enabled: false },
                    zIndex: 1
                },
                {
                    type: 'line',
                    name: 'HMA 20',
                    data: hma20,
                    color: '#00D9FF',
                    lineWidth: 2,
                    marker: { enabled: false },
                    zIndex: 1
                }
            ],
            credits: { enabled: false }
        });
    }
    
    this.displayMovingAveragesSignal(prices, sma20, sma50, sma200);
},

calculateEMAFromPrices(prices, period) {
    const data = prices.map(p => ({ timestamp: p.timestamp, close: p.close }));
    const ema = this.calculateEMA(data, period);
    return ema.map(e => [e.timestamp, e.value]);
},

calculateWMA(prices, period) {
    const wma = [];
    const divisor = (period * (period + 1)) / 2;
    
    for (let i = period - 1; i < prices.length; i++) {
        let sum = 0;
        for (let j = 0; j < period; j++) {
            const weight = period - j;
            sum += prices[i - j].close * weight;
        }
        wma.push([prices[i].timestamp, sum / divisor]);
    }
    
    return wma;
},

calculateHMA(prices, period) {
    // Hull Moving Average = WMA(2 * WMA(n/2) - WMA(n), sqrt(n))
    const halfPeriod = Math.floor(period / 2);
    const sqrtPeriod = Math.floor(Math.sqrt(period));
    
    const wmaHalf = this.calculateWMA(prices, halfPeriod);
    const wmaFull = this.calculateWMA(prices, period);
    
    // 2 * WMA(n/2) - WMA(n)
    const rawHMA = [];
    const minLength = Math.min(wmaHalf.length, wmaFull.length);
    
    for (let i = 0; i < minLength; i++) {
        const timestamp = wmaFull[i][0];
        const halfValue = wmaHalf.find(w => w[0] === timestamp)?.[1];
        const fullValue = wmaFull[i][1];
        
        if (halfValue !== undefined) {
            rawHMA.push({
                timestamp: timestamp,
                close: 2 * halfValue - fullValue
            });
        }
    }
    
    // Apply WMA(sqrt(n)) to raw HMA
    const hma = [];
    const divisor = (sqrtPeriod * (sqrtPeriod + 1)) / 2;
    
    for (let i = sqrtPeriod - 1; i < rawHMA.length; i++) {
        let sum = 0;
        for (let j = 0; j < sqrtPeriod; j++) {
            const weight = sqrtPeriod - j;
            sum += rawHMA[i - j].close * weight;
        }
        hma.push([rawHMA[i].timestamp, sum / divisor]);
    }
    
    return hma;
},

displayMovingAveragesSignal(prices, sma20, sma50, sma200) {
    if (!prices.length || !sma20.length || !sma50.length) {
        document.getElementById('movingAveragesSignal').textContent = 'Not enough data';
        return;
    }
    
    const lastPrice = prices[prices.length - 1].close;
    const lastSMA20 = sma20[sma20.length - 1]?.[1];
    const lastSMA50 = sma50[sma50.length - 1]?.[1];
    const lastSMA200 = sma200.length > 0 ? sma200[sma200.length - 1]?.[1] : null;
    
    let signal = 'neutral';
    let text = '';
    
    // Golden Cross / Death Cross
    if (sma50.length > 1 && sma200 && sma200.length > 1) {
        const prevSMA50 = sma50[sma50.length - 2]?.[1];
        const prevSMA200 = sma200[sma200.length - 2]?.[1];
        
        if (lastSMA50 > lastSMA200 && prevSMA50 <= prevSMA200) {
            signal = 'bullish';
            text = '🌟 GOLDEN CROSS - SMA 50 crossed above SMA 200! STRONG BUY SIGNAL!';
        } else if (lastSMA50 < lastSMA200 && prevSMA50 >= prevSMA200) {
            signal = 'bearish';
            text = '☠ DEATH CROSS - SMA 50 crossed below SMA 200! STRONG SELL SIGNAL!';
        }
    }
    
    // Standard trend analysis
    if (!text) {
        if (lastPrice > lastSMA20 && lastSMA20 > lastSMA50) {
            signal = 'bullish';
            text = '🚀 STRONG UPTREND - Price > SMA20 > SMA50';
            if (lastSMA200 && lastSMA50 > lastSMA200) {
                text += ' > SMA200 (BULL MARKET)';
            }
        } else if (lastPrice < lastSMA20 && lastSMA20 < lastSMA50) {
            signal = 'bearish';
            text = '📉 STRONG DOWNTREND - Price < SMA20 < SMA50';
            if (lastSMA200 && lastSMA50 < lastSMA200) {
                text += ' < SMA200 (BEAR MARKET)';
            }
        } else if (lastPrice > lastSMA20) {
            signal = 'bullish';
            text = 'Bullish - Price above SMA 20';
        } else {
            signal = 'bearish';
            text = 'Bearish - Price below SMA 20';
        }
    }
    
    const signalBox = document.getElementById('movingAveragesSignal');
    signalBox.className = `signal-box ${signal}`;
    signalBox.textContent = text;
},

/* ==============================================
   ADVANCED-ANALYSIS.JS - WALL STREET PRO EDITION
   PARTIE 4/6 - SUPPORT/RESISTANCE & DIVERGENCES
   ✅ Auto S/R Detection, RSI/MACD Divergences, Price Action
   ============================================== */

// ============================================
// AUTOMATIC SUPPORT/RESISTANCE DETECTION
// ============================================

updateSupportResistanceChart() {
    const prices = this.stockData.prices;
    const levels = this.calculateSupportResistance(prices);
    const ohlc = prices.map(p => [p.timestamp, p.open, p.high, p.low, p.close]);
    
    if (this.charts.supportResistance) {
        this.charts.supportResistance.series[0].setData(ohlc, false);
        this.charts.supportResistance.yAxis[0].update({
            plotLines: levels.map(level => ({
                value: level.price,
                color: level.type === 'resistance' ? this.colors.danger : this.colors.success,
                dashStyle: 'Solid',
                width: 2,
                label: {
                    text: `${level.type.toUpperCase()} (${this.formatCurrency(level.price)}) - Touches: ${level.touches}`,
                    align: 'right',
                    style: {
                        color: level.type === 'resistance' ? this.colors.danger : this.colors.success,
                        fontWeight: 'bold'
                    }
                },
                zIndex: 5
            }))
        }, false);
        this.charts.supportResistance.redraw();
    } else {
        this.charts.supportResistance = Highcharts.stockChart('supportResistanceChart', {
            chart: { borderRadius: 15, height: 600 },
            title: {
                text: 'Automatic Support/Resistance - Key Levels',
                style: { color: this.colors.primary, fontWeight: 'bold' }
            },
            rangeSelector: { enabled: false },
            navigator: { enabled: true },
            xAxis: { type: 'datetime', crosshair: true },
            yAxis: {
                title: { text: 'Price' },
                plotLines: levels.map(level => ({
                    value: level.price,
                    color: level.type === 'resistance' ? this.colors.danger : this.colors.success,
                    dashStyle: 'Solid',
                    width: 2,
                    label: {
                        text: `${level.type.toUpperCase()} (${this.formatCurrency(level.price)}) - Touches: ${level.touches}`,
                        align: 'right',
                        style: {
                            color: level.type === 'resistance' ? this.colors.danger : this.colors.success,
                            fontWeight: 'bold'
                        }
                    },
                    zIndex: 5
                }))
            },
            tooltip: { borderRadius: 10, shared: true },
            series: [
                {
                    type: 'candlestick',
                    name: this.currentSymbol,
                    data: ohlc,
                    color: this.colors.danger,
                    upColor: this.colors.success,
                    zIndex: 2
                }
            ],
            credits: { enabled: false }
        });
    }
    
    this.displaySupportResistanceLevels(levels, prices);
},

calculateSupportResistance(prices, sensitivity = 0.02) {
    // Find local peaks and troughs
    const peaks = [];
    const troughs = [];
    
    for (let i = 2; i < prices.length - 2; i++) {
        // Peak detection (resistance)
        if (prices[i].high > prices[i - 1].high && 
            prices[i].high > prices[i - 2].high &&
            prices[i].high > prices[i + 1].high && 
            prices[i].high > prices[i + 2].high) {
            peaks.push({ price: prices[i].high, index: i });
        }
        
        // Trough detection (support)
        if (prices[i].low < prices[i - 1].low && 
            prices[i].low < prices[i - 2].low &&
            prices[i].low < prices[i + 1].low && 
            prices[i].low < prices[i + 2].low) {
            troughs.push({ price: prices[i].low, index: i });
        }
    }
    
    // Cluster similar levels
    const clusterLevels = (points) => {
        if (points.length === 0) return [];
        
        const clusters = [];
        const sorted = [...points].sort((a, b) => a.price - b.price);
        
        let currentCluster = [sorted[0]];
        
        for (let i = 1; i < sorted.length; i++) {
            const priceDiff = Math.abs(sorted[i].price - currentCluster[0].price) / currentCluster[0].price;
            
            if (priceDiff <= sensitivity) {
                currentCluster.push(sorted[i]);
            } else {
                if (currentCluster.length >= 2) {
                    const avgPrice = currentCluster.reduce((sum, p) => sum + p.price, 0) / currentCluster.length;
                    clusters.push({
                        price: avgPrice,
                        touches: currentCluster.length,
                        indices: currentCluster.map(c => c.index)
                    });
                }
                currentCluster = [sorted[i]];
            }
        }
        
        if (currentCluster.length >= 2) {
            const avgPrice = currentCluster.reduce((sum, p) => sum + p.price, 0) / currentCluster.length;
            clusters.push({
                price: avgPrice,
                touches: currentCluster.length,
                indices: currentCluster.map(c => c.index)
            });
        }
        
        return clusters;
    };
    
    const resistanceLevels = clusterLevels(peaks).map(l => ({ ...l, type: 'resistance' }));
    const supportLevels = clusterLevels(troughs).map(l => ({ ...l, type: 'support' }));
    
    // Combine and sort by strength (touches)
    const allLevels = [...resistanceLevels, ...supportLevels]
        .sort((a, b) => b.touches - a.touches)
        .slice(0, 8); // Top 8 strongest levels
    
    return allLevels;
},

displaySupportResistanceLevels(levels, prices) {
    const currentPrice = prices[prices.length - 1].close;
    
    const tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>Type</th>
                    <th>Price</th>
                    <th>Touches</th>
                    <th>Distance</th>
                    <th>Strength</th>
                </tr>
            </thead>
            <tbody>
                ${levels.map(level => {
                    const distance = ((level.price - currentPrice) / currentPrice) * 100;
                    const distanceText = `${distance >= 0 ? '+' : ''}${distance.toFixed(2)}%`;
                    
                    let strength = 'Weak';
                    if (level.touches >= 5) strength = 'Very Strong';
                    else if (level.touches >= 4) strength = 'Strong';
                    else if (level.touches >= 3) strength = 'Medium';
                    
                    const strengthColor = level.touches >= 4 ? '#FF6B00' : level.touches >= 3 ? this.colors.warning : '#999';
                    
                    return `
                        <tr>
                            <td style='color: ${level.type === 'resistance' ? this.colors.danger : this.colors.success}; font-weight: bold; text-transform: uppercase;'>
                                ${level.type === 'resistance' ? '🔴' : '🟢'} ${level.type}
                            </td>
                            <td class='level-price'>${this.formatCurrency(level.price)}</td>
                            <td><strong>${level.touches}</strong></td>
                            <td style='color: ${distance >= 0 ? this.colors.danger : this.colors.success}'>${distanceText}</td>
                            <td style='color: ${strengthColor}; font-weight: bold;'>${strength}</td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
        <div style="margin-top: 15px; padding: 12px; background: rgba(59, 130, 246, 0.1); border-left: 4px solid ${this.colors.primary}; border-radius: 8px;">
            <strong>💡 Trading Tip:</strong> Strong levels (4+ touches) are major institutional barriers. Wait for breakout confirmation before trading.
        </div>
    `;
    
    document.getElementById('supportResistanceLevels').innerHTML = tableHTML;
},

// ============================================
// DIVERGENCE DETECTION (RSI/MACD vs Price)
// ============================================

updateDivergenceAnalysis() {
    const prices = this.stockData.prices;
    const rsi = this.calculateRSI(prices);
    const macd = this.calculateMACD(prices);
    
    const divergences = this.detectDivergences(prices, rsi, macd);
    
    this.displayDivergences(divergences);
},

detectDivergences(prices, rsi, macd) {
    const divergences = [];
    const lookback = 20;
    
    if (prices.length < lookback || rsi.length < lookback || macd.macdLine.length < lookback) {
        return divergences;
    }
    
    // Analyze recent price action
    const recentPrices = prices.slice(-lookback);
    const recentRSI = rsi.slice(-lookback);
    const recentMACD = macd.macdLine.slice(-lookback);
    
    // Find price peaks and troughs
    const pricePeaks = [];
    const priceTroughs = [];
    
    for (let i = 2; i < recentPrices.length - 2; i++) {
        if (recentPrices[i].high > recentPrices[i - 1].high && 
            recentPrices[i].high > recentPrices[i + 1].high) {
            pricePeaks.push({ index: i, value: recentPrices[i].high });
        }
        
        if (recentPrices[i].low < recentPrices[i - 1].low && 
            recentPrices[i].low < recentPrices[i + 1].low) {
            priceTroughs.push({ index: i, value: recentPrices[i].low });
        }
    }
    
    // Bullish Divergence Detection (price makes lower low, RSI/MACD makes higher low)
    if (priceTroughs.length >= 2) {
        const lastTrough = priceTroughs[priceTroughs.length - 1];
        const prevTrough = priceTroughs[priceTroughs.length - 2];
        
        if (lastTrough.value < prevTrough.value) {
            // Check RSI
            const lastRSIValue = recentRSI[lastTrough.index]?.[1];
            const prevRSIValue = recentRSI[prevTrough.index]?.[1];
            
            if (lastRSIValue > prevRSIValue) {
                divergences.push({
                    type: 'Bullish',
                    indicator: 'RSI',
                    strength: 'Strong',
                    description: '🟢 Price making lower lows, RSI making higher lows - Bullish Reversal Signal'
                });
            }
            
            // Check MACD
            const lastMACDValue = recentMACD[lastTrough.index]?.[1];
            const prevMACDValue = recentMACD[prevTrough.index]?.[1];
            
            if (lastMACDValue > prevMACDValue) {
                divergences.push({
                    type: 'Bullish',
                    indicator: 'MACD',
                    strength: 'Strong',
                    description: '🟢 Price making lower lows, MACD making higher lows - Bullish Reversal Signal'
                });
            }
        }
    }
    
    // Bearish Divergence Detection (price makes higher high, RSI/MACD makes lower high)
    if (pricePeaks.length >= 2) {
        const lastPeak = pricePeaks[pricePeaks.length - 1];
        const prevPeak = pricePeaks[pricePeaks.length - 2];
        
        if (lastPeak.value > prevPeak.value) {
            // Check RSI
            const lastRSIValue = recentRSI[lastPeak.index]?.[1];
            const prevRSIValue = recentRSI[prevPeak.index]?.[1];
            
            if (lastRSIValue < prevRSIValue) {
                divergences.push({
                    type: 'Bearish',
                    indicator: 'RSI',
                    strength: 'Strong',
                    description: '🔴 Price making higher highs, RSI making lower highs - Bearish Reversal Signal'
                });
            }
            
            // Check MACD
            const lastMACDValue = recentMACD[lastPeak.index]?.[1];
            const prevMACDValue = recentMACD[prevPeak.index]?.[1];
            
            if (lastMACDValue < prevMACDValue) {
                divergences.push({
                    type: 'Bearish',
                    indicator: 'MACD',
                    strength: 'Strong',
                    description: '🔴 Price making higher highs, MACD making lower highs - Bearish Reversal Signal'
                });
            }
        }
    }
    
    return divergences;
},

displayDivergences(divergences) {
    const container = document.getElementById('divergenceAnalysis');
    
    if (divergences.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 30px; color: #64748b;">
                <i class="fas fa-chart-line" style="font-size: 48px; opacity: 0.3; margin-bottom: 15px;"></i>
                <p style="font-size: 16px; font-weight: 600;">No Divergences Detected</p>
                <p style="font-size: 14px; margin-top: 8px;">Price and indicators are in sync</p>
            </div>
        `;
        return;
    }
    
    const html = `
        <div style="display: grid; gap: 15px;">
            ${divergences.map(div => {
                const bgColor = div.type === 'Bullish' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(220, 53, 69, 0.1)';
                const borderColor = div.type === 'Bullish' ? this.colors.success : this.colors.danger;
                const icon = div.type === 'Bullish' ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down';
                
                return `
                    <div style="background: ${bgColor}; border-left: 4px solid ${borderColor}; padding: 15px; border-radius: 8px;">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                            <i class="fas ${icon}" style="color: ${borderColor}; font-size: 20px;"></i>
                            <strong style="color: ${borderColor}; font-size: 16px;">${div.type} Divergence - ${div.indicator}</strong>
                            <span style="margin-left: auto; background: ${borderColor}; color: white; padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: bold;">
                                ${div.strength}
                            </span>
                        </div>
                        <p style="margin: 0; color: #334155; font-size: 14px;">${div.description}</p>
                    </div>
                `;
            }).join('')}
        </div>
        <div style="margin-top: 15px; padding: 12px; background: rgba(255, 107, 0, 0.1); border-left: 4px solid #FF6B00; border-radius: 8px;">
            <strong style="color: #FF6B00;">⚠ Important:</strong> Divergences are early warning signals. Wait for price confirmation before trading!
        </div>
    `;
    
    container.innerHTML = html;
},

// ============================================
// CANDLESTICK PATTERN RECOGNITION
// ============================================

updateCandlestickPatterns() {
    const prices = this.stockData.prices;
    const patterns = this.detectCandlestickPatterns(prices);
    
    this.displayCandlestickPatterns(patterns);
},

detectCandlestickPatterns(prices) {
    const patterns = [];
    const recent = prices.slice(-5); // Analyze last 5 candles
    
    if (recent.length < 3) return patterns;
    
    const last = recent[recent.length - 1];
    const prev = recent[recent.length - 2];
    const prev2 = recent[recent.length - 3];
    
    // Helper functions
    const isBullish = (candle) => candle.close > candle.open;
    const isBearish = (candle) => candle.close < candle.open;
    const bodySize = (candle) => Math.abs(candle.close - candle.open);
    const upperWick = (candle) => candle.high - Math.max(candle.open, candle.close);
    const lowerWick = (candle) => Math.min(candle.open, candle.close) - candle.low;
    const range = (candle) => candle.high - candle.low;
    
    // BULLISH PATTERNS
    
    // Hammer
    if (isBullish(last) && lowerWick(last) > bodySize(last) * 2 && upperWick(last) < bodySize(last) * 0.3) {
        patterns.push({
            name: 'Hammer',
            type: 'Bullish',
            strength: 'Strong',
            description: '🔨 Hammer - Strong reversal signal after downtrend'
        });
    }
    
    // Bullish Engulfing
    if (isBearish(prev) && isBullish(last) && 
        last.open < prev.close && last.close > prev.open) {
        patterns.push({
            name: 'Bullish Engulfing',
            type: 'Bullish',
            strength: 'Very Strong',
            description: '🚀 Bullish Engulfing - Powerful reversal pattern'
        });
    }
    
    // Morning Star
    if (recent.length >= 3 && isBearish(prev2) && bodySize(prev) < bodySize(prev2) * 0.3 && 
        isBullish(last) && last.close > (prev2.open + prev2.close) / 2) {
        patterns.push({
            name: 'Morning Star',
            type: 'Bullish',
            strength: 'Very Strong',
            description: '⭐ Morning Star - Major reversal pattern (3-candle)'
        });
    }
    
    // Three White Soldiers
    if (recent.length >= 3 && 
        isBullish(prev2) && isBullish(prev) && isBullish(last) &&
        prev.close > prev2.close && last.close > prev.close) {
        patterns.push({
            name: 'Three White Soldiers',
            type: 'Bullish',
            strength: 'Strong',
            description: '⬆⬆⬆ Three White Soldiers - Strong uptrend continuation'
        });
    }
    
    // BEARISH PATTERNS
    
    // Shooting Star
    if (isBearish(last) && upperWick(last) > bodySize(last) * 2 && lowerWick(last) < bodySize(last) * 0.3) {
        patterns.push({
            name: 'Shooting Star',
            type: 'Bearish',
            strength: 'Strong',
            description: '💫 Shooting Star - Strong reversal signal after uptrend'
        });
    }
    
    // Bearish Engulfing
    if (isBullish(prev) && isBearish(last) && 
        last.open > prev.close && last.close < prev.open) {
        patterns.push({
            name: 'Bearish Engulfing',
            type: 'Bearish',
            strength: 'Very Strong',
            description: '📉 Bearish Engulfing - Powerful reversal pattern'
        });
    }
    
    // Evening Star
    if (recent.length >= 3 && isBullish(prev2) && bodySize(prev) < bodySize(prev2) * 0.3 && 
        isBearish(last) && last.close < (prev2.open + prev2.close) / 2) {
        patterns.push({
            name: 'Evening Star',
            type: 'Bearish',
            strength: 'Very Strong',
            description: '🌙 Evening Star - Major reversal pattern (3-candle)'
        });
    }
    
    // Doji
    if (bodySize(last) < range(last) * 0.1) {
        patterns.push({
            name: 'Doji',
            type: 'Neutral',
            strength: 'Medium',
            description: '➖ Doji - Indecision, potential reversal'
        });
    }
    
    return patterns;
},

displayCandlestickPatterns(patterns) {
    const container = document.getElementById('candlestickPatterns');
    
    if (patterns.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 30px; color: #64748b;">
                <i class="fas fa-candle-holder" style="font-size: 48px; opacity: 0.3; margin-bottom: 15px;"></i>
                <p style="font-size: 16px; font-weight: 600;">No Patterns Detected</p>
                <p style="font-size: 14px; margin-top: 8px;">No significant candlestick patterns in recent bars</p>
            </div>
        `;
        return;
    }
    
    const html = `
        <div style="display: grid; gap: 15px;">
            ${patterns.map(pattern => {
                let bgColor, borderColor;
                if (pattern.type === 'Bullish') {
                    bgColor = 'rgba(16, 185, 129, 0.1)';
                    borderColor = this.colors.success;
                } else if (pattern.type === 'Bearish') {
                    bgColor = 'rgba(220, 53, 69, 0.1)';
                    borderColor = this.colors.danger;
                } else {
                    bgColor = 'rgba(108, 117, 125, 0.1)';
                    borderColor = '#6c757d';
                }
                
                return `
                    <div style="background: ${bgColor}; border-left: 4px solid ${borderColor}; padding: 15px; border-radius: 8px;">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                            <strong style="color: ${borderColor}; font-size: 16px;">${pattern.name}</strong>
                            <span style="margin-left: auto; background: ${borderColor}; color: white; padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: bold;">
                                ${pattern.strength}
                            </span>
                        </div>
                        <p style="margin: 0; color: #334155; font-size: 14px;">${pattern.description}</p>
                    </div>
                `;
            }).join('')}
        </div>
    `;
    
    container.innerHTML = html;
},

/* ==============================================
   ADVANCED-ANALYSIS.JS - WALL STREET PRO EDITION
   PARTIE 5/6 - MONEY MANAGEMENT & RISK ANALYSIS
   ✅ Position Sizing, Risk/Reward, Stop Loss Calculator
   ============================================== */

// ============================================
// POSITION SIZING CALCULATOR
// ============================================

calculatePositionSize(accountSize, riskPercent, entryPrice, stopLoss) {
    const riskAmount = accountSize * (riskPercent / 100);
    const riskPerShare = Math.abs(entryPrice - stopLoss);
    const positionSize = Math.floor(riskAmount / riskPerShare);
    const positionValue = positionSize * entryPrice;
    
    return {
        shares: positionSize,
        positionValue: positionValue,
        riskAmount: riskAmount,
        riskPerShare: riskPerShare,
        percentOfAccount: (positionValue / accountSize) * 100
    };
},

// ============================================
// RISK/REWARD CALCULATOR
// ============================================

calculateRiskReward(entryPrice, stopLoss, takeProfit) {
    const risk = Math.abs(entryPrice - stopLoss);
    const reward = Math.abs(takeProfit - entryPrice);
    const ratio = reward / risk;
    
    return {
        risk: risk,
        reward: reward,
        ratio: ratio,
        riskPercent: (risk / entryPrice) * 100,
        rewardPercent: (reward / entryPrice) * 100
    };
},

// ============================================
// TRADING CALCULATOR INTERFACE
// ============================================

initializeTradingCalculator() {
    const container = document.getElementById('tradingCalculator');
    if (!container) return;
    
    const currentPrice = this.stockData.prices[this.stockData.prices.length - 1].close;
    
    const html = `
        <div class="calculator-card">
            <h3 style="margin-bottom: 20px; color: ${this.colors.primary}; font-size: 18px;">
                <i class="fas fa-calculator"></i> Trading Calculator
            </h3>
            
            <div style="display: grid; gap: 15px;">
                <!-- Account Size -->
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #334155; font-size: 13px;">
                        Account Size ($)
                    </label>
                    <input type="number" id="calcAccountSize" value="10000" 
                           style="width: 100%; padding: 10px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 14px;"
                           placeholder="10000">
                </div>
                
                <!-- Risk Percent -->
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #334155; font-size: 13px;">
                        Risk Per Trade (%)
                    </label>
                    <input type="number" id="calcRiskPercent" value="2" min="0.1" max="10" step="0.1"
                           style="width: 100%; padding: 10px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 14px;"
                           placeholder="2">
                </div>
                
                <!-- Entry Price -->
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #334155; font-size: 13px;">
                        Entry Price ($)
                    </label>
                    <input type="number" id="calcEntryPrice" value="${currentPrice.toFixed(2)}" step="0.01"
                           style="width: 100%; padding: 10px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 14px;"
                           placeholder="${currentPrice.toFixed(2)}">
                </div>
                
                <!-- Stop Loss -->
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: 600; color: ${this.colors.danger}; font-size: 13px;">
                        Stop Loss ($)
                    </label>
                    <input type="number" id="calcStopLoss" value="${(currentPrice * 0.95).toFixed(2)}" step="0.01"
                           style="width: 100%; padding: 10px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 14px;"
                           placeholder="${(currentPrice * 0.95).toFixed(2)}">
                </div>
                
                <!-- Take Profit -->
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: 600; color: ${this.colors.success}; font-size: 13px;">
                        Take Profit ($)
                    </label>
                    <input type="number" id="calcTakeProfit" value="${(currentPrice * 1.10).toFixed(2)}" step="0.01"
                           style="width: 100%; padding: 10px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 14px;"
                           placeholder="${(currentPrice * 1.10).toFixed(2)}">
                </div>
                
                <!-- Calculate Button -->
                <button onclick="AdvancedAnalysis.calculateTrade()" 
                        style="width: 100%; padding: 12px; background: linear-gradient(135deg, ${this.colors.primary}, ${this.colors.secondary}); 
                               color: white; border: none; border-radius: 8px; font-weight: bold; font-size: 14px; cursor: pointer;
                               transition: transform 0.2s;">
                    <i class="fas fa-chart-line"></i> Calculate Position
                </button>
            </div>
            
            <!-- Results -->
            <div id="calcResults" style="margin-top: 20px; display: none;">
                <div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1)); 
                            padding: 20px; border-radius: 12px; border: 2px solid ${this.colors.primary};">
                    <h4 style="margin: 0 0 15px 0; color: ${this.colors.primary}; font-size: 16px;">
                        <i class="fas fa-check-circle"></i> Trade Analysis
                    </h4>
                    
                    <div style="display: grid; gap: 12px;">
                        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(0,0,0,0.1);">
                            <span style="color: #64748b; font-size: 13px;">Position Size:</span>
                            <strong id="resultShares" style="color: #1e293b; font-size: 14px;"></strong>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(0,0,0,0.1);">
                            <span style="color: #64748b; font-size: 13px;">Position Value:</span>
                            <strong id="resultValue" style="color: #1e293b; font-size: 14px;"></strong>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(0,0,0,0.1);">
                            <span style="color: #64748b; font-size: 13px;">Risk Amount:</span>
                            <strong id="resultRisk" style="color: ${this.colors.danger}; font-size: 14px;"></strong>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(0,0,0,0.1);">
                            <span style="color: #64748b; font-size: 13px;">Potential Profit:</span>
                            <strong id="resultReward" style="color: ${this.colors.success}; font-size: 14px;"></strong>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                            <span style="color: #64748b; font-size: 13px;">Risk/Reward Ratio:</span>
                            <strong id="resultRatio" style="color: #1e293b; font-size: 16px;"></strong>
                        </div>
                    </div>
                    
                    <div id="ratioWarning" style="margin-top: 15px; padding: 10px; border-radius: 8px; display: none;">
                    </div>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    
    // Add event listeners for real-time calculation
    ['calcAccountSize', 'calcRiskPercent', 'calcEntryPrice', 'calcStopLoss', 'calcTakeProfit'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', () => this.calculateTrade());
        }
    });
},

calculateTrade() {
    const accountSize = parseFloat(document.getElementById('calcAccountSize').value) || 0;
    const riskPercent = parseFloat(document.getElementById('calcRiskPercent').value) || 0;
    const entryPrice = parseFloat(document.getElementById('calcEntryPrice').value) || 0;
    const stopLoss = parseFloat(document.getElementById('calcStopLoss').value) || 0;
    const takeProfit = parseFloat(document.getElementById('calcTakeProfit').value) || 0;
    
    if (accountSize <= 0 || riskPercent <= 0 || entryPrice <= 0 || stopLoss <= 0 || takeProfit <= 0) {
        return;
    }
    
    if (stopLoss >= entryPrice) {
        alert('❌ Stop Loss must be below Entry Price for a long position');
        return;
    }
    
    if (takeProfit <= entryPrice) {
        alert('❌ Take Profit must be above Entry Price for a long position');
        return;
    }
    
    const position = this.calculatePositionSize(accountSize, riskPercent, entryPrice, stopLoss);
    const rr = this.calculateRiskReward(entryPrice, stopLoss, takeProfit);
    
    // Display results
    document.getElementById('resultShares').textContent = `${position.shares.toLocaleString()} shares`;
    document.getElementById('resultValue').textContent = this.formatCurrency(position.positionValue);
    document.getElementById('resultRisk').textContent = this.formatCurrency(position.riskAmount);
    document.getElementById('resultReward').textContent = this.formatCurrency(rr.reward * position.shares);
    document.getElementById('resultRatio').textContent = `1:${rr.ratio.toFixed(2)}`;
    
    // Show results
    document.getElementById('calcResults').style.display = 'block';
    
    // Risk/Reward warning
    const warningDiv = document.getElementById('ratioWarning');
    if (rr.ratio < 2) {
        warningDiv.style.display = 'block';
        warningDiv.style.background = 'rgba(220, 53, 69, 0.1)';
        warningDiv.style.borderLeft = `4px solid ${this.colors.danger}`;
        warningDiv.innerHTML = `
            <strong style="color: ${this.colors.danger};">⚠ Warning:</strong> 
            <span style="color: #334155;">Risk/Reward ratio below 2:1. Consider adjusting targets.</span>
        `;
    } else if (rr.ratio >= 3) {
        warningDiv.style.display = 'block';
        warningDiv.style.background = 'rgba(16, 185, 129, 0.1)';
        warningDiv.style.borderLeft = `4px solid ${this.colors.success}`;
        warningDiv.innerHTML = `
            <strong style="color: ${this.colors.success};">✅ Excellent:</strong> 
            <span style="color: #334155;">Risk/Reward ratio above 3:1. Great trade setup!</span>
        `;
    } else {
        warningDiv.style.display = 'block';
        warningDiv.style.background = 'rgba(255, 193, 7, 0.1)';
        warningDiv.style.borderLeft = `4px solid ${this.colors.warning}`;
        warningDiv.innerHTML = `
            <strong style="color: ${this.colors.warning};">✓ Good:</strong> 
            <span style="color: #334155;">Risk/Reward ratio is acceptable (2:1 to 3:1).</span>
        `;
    }
},

// ============================================
// VOLATILITY-BASED STOP LOSS SUGGESTION
// ============================================

suggestStopLoss() {
    const prices = this.stockData.prices;
    const atr = this.calculateATR(prices);
    
    if (!atr.length) return null;
    
    const lastPrice = prices[prices.length - 1].close;
    const lastATR = atr[atr.length - 1][1];
    
    // Conservative: 2x ATR
    const conservativeStop = lastPrice - (2 * lastATR);
    
    // Moderate: 1.5x ATR
    const moderateStop = lastPrice - (1.5 * lastATR);
    
    // Aggressive: 1x ATR
    const aggressiveStop = lastPrice - lastATR;
    
    return {
        conservative: conservativeStop,
        moderate: moderateStop,
        aggressive: aggressiveStop,
        atr: lastATR
    };
},

/* ==============================================
   ADVANCED-ANALYSIS.JS - WALL STREET PRO EDITION
   PARTIE 6/6 - INTEGRATION FINALE & MODAL SYSTEM
   ✅ UpdateAllIndicators(), Modal System, Performance Score
   ============================================== */

// ============================================
// MISE À JOUR DE updateAllIndicators() - COMPLET
// ============================================

updateAllIndicators() {
    console.log('📊 Updating all indicators (WALL STREET PRO EDITION)...');
    
    const resultsPanel = document.getElementById('resultsPanel');
    if (resultsPanel.classList.contains('hidden')) {
        resultsPanel.classList.remove('hidden');
    }
    
    // ===== INDICATEURS EXISTANTS =====
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
    
    // ===== NOUVEAUX INDICATEURS - MOMENTUM =====
    this.updateRSIChart();
    this.updateMACDChart();
    this.updateBollingerBandsChart();
    this.updateCCIChart();
    
    // ===== NOUVEAUX INDICATEURS - VOLUME =====
    this.updateMFIChart();
    this.updateADLineChart();
    this.updateCMFChart();
    this.updateVolumeProfileChart();
    
    // ===== NOUVEAUX INDICATEURS - MOYENNES MOBILES =====
    this.updateMovingAveragesChart();
    
    // ===== NOUVEAUX INDICATEURS - SUPPORT/RESISTANCE =====
    this.updateSupportResistanceChart();
    this.updateDivergenceAnalysis();
    this.updateCandlestickPatterns();
    
    // ===== TRADING CALCULATOR =====
    this.initializeTradingCalculator();
    
    // ===== PERFORMANCE SCORE =====
    this.calculatePerformanceScore();
    
    // ===== CONSOLIDATED SIGNALS (MISE À JOUR) =====
    this.generateConsolidatedSignals();
    
    console.log('✅ All indicators updated (WALL STREET PRO EDITION)');
},

// ============================================
// PERFORMANCE SCORE CALCULATOR
// ============================================

calculatePerformanceScore() {
    const container = document.getElementById('performanceScore');
    if (!container) return;
    
    const prices = this.stockData.prices;
    
    // Collect all signals
    const signals = [];
    
    // RSI
    const rsi = this.calculateRSI(prices);
    if (rsi.length > 0) {
        const lastRSI = rsi[rsi.length - 1][1];
        if (lastRSI < 30) signals.push(2); // Strong buy
        else if (lastRSI < 40) signals.push(1); // Buy
        else if (lastRSI > 70) signals.push(-2); // Strong sell
        else if (lastRSI > 60) signals.push(-1); // Sell
        else signals.push(0);
    }
    
    // MACD
    const macd = this.calculateMACD(prices);
    if (macd.macdLine.length > 1 && macd.signalLine.length > 1) {
        const lastMACD = macd.macdLine[macd.macdLine.length - 1][1];
        const lastSignal = macd.signalLine[macd.signalLine.length - 1][1];
        if (lastMACD > lastSignal) signals.push(1);
        else if (lastMACD < lastSignal) signals.push(-1);
    }
    
    // Moving Averages
    const sma20 = this.calculateSMA(prices, 20);
    const sma50 = this.calculateSMA(prices, 50);
    if (sma20.length > 0 && sma50.length > 0) {
        const lastPrice = prices[prices.length - 1].close;
        const lastSMA20 = sma20[sma20.length - 1][1];
        const lastSMA50 = sma50[sma50.length - 1][1];
        
        if (lastPrice > lastSMA20 && lastSMA20 > lastSMA50) signals.push(2);
        else if (lastPrice < lastSMA20 && lastSMA20 < lastSMA50) signals.push(-2);
        else if (lastPrice > lastSMA20) signals.push(1);
        else signals.push(-1);
    }
    
    // Volume indicators
    const mfi = this.calculateMFI(prices);
    if (mfi.length > 0) {
        const lastMFI = mfi[mfi.length - 1][1];
        if (lastMFI < 20) signals.push(2);
        else if (lastMFI > 80) signals.push(-2);
        else if (lastMFI > 50) signals.push(1);
        else signals.push(-1);
    }
    
    // Calculate score
    const totalSignal = signals.reduce((sum, s) => sum + s, 0);
    const maxScore = signals.length * 2;
    const score = ((totalSignal + maxScore) / (2 * maxScore)) * 100;
    
    // Determine rating
    let rating, ratingColor, ratingText, recommendation;
    if (score >= 80) {
        rating = 'A+';
        ratingColor = '#10b981';
        ratingText = 'Excellent';
        recommendation = '🚀 STRONG BUY - Multiple bullish signals aligned';
    } else if (score >= 70) {
        rating = 'A';
        ratingColor = '#34d399';
        ratingText = 'Very Good';
        recommendation = '✅ BUY - Positive momentum detected';
    } else if (score >= 60) {
        rating = 'B';
        ratingColor = '#fbbf24';
        ratingText = 'Good';
        recommendation = '📈 HOLD/BUY - Moderately bullish';
    } else if (score >= 40) {
        rating = 'C';
        ratingColor = '#f59e0b';
        ratingText = 'Neutral';
        recommendation = '⏸ HOLD - Mixed signals, wait for clarity';
    } else if (score >= 30) {
        rating = 'D';
        ratingColor = '#f87171';
        ratingText = 'Poor';
        recommendation = '⚠ HOLD/SELL - Moderately bearish';
    } else {
        rating = 'F';
        ratingColor = '#dc2626';
        ratingText = 'Very Poor';
        recommendation = '📉 STRONG SELL - Multiple bearish signals';
    }
    
    const html = `
        <div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1)); 
                    padding: 25px; border-radius: 16px; border: 2px solid ${this.colors.primary};">
            <div style="text-align: center; margin-bottom: 20px;">
                <h3 style="margin: 0 0 10px 0; color: ${this.colors.primary}; font-size: 20px;">
                    <i class="fas fa-chart-pie"></i> AlphaVault Performance Score
                </h3>
                <p style="margin: 0; color: #64748b; font-size: 13px;">Based on ${signals.length} technical indicators</p>
            </div>
            
            <div style="display: flex; align-items: center; justify-content: center; gap: 30px; margin-bottom: 20px;">
                <!-- Score Circle -->
                <div style="position: relative; width: 120px; height: 120px;">
                    <svg width="120" height="120" style="transform: rotate(-90deg);">
                        <circle cx="60" cy="60" r="50" fill="none" stroke="#e2e8f0" stroke-width="10"/>
                        <circle cx="60" cy="60" r="50" fill="none" stroke="${ratingColor}" stroke-width="10"
                                stroke-dasharray="${(score / 100) * 314} 314" 
                                stroke-linecap="round"
                                style="transition: stroke-dasharray 1s ease;"/>
                    </svg>
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
                        <div style="font-size: 32px; font-weight: 900; color: ${ratingColor};">${Math.round(score)}</div>
                        <div style="font-size: 11px; color: #64748b; margin-top: -5px;">/ 100</div>
                    </div>
                </div>
                
                <!-- Rating Badge -->
                <div style="text-align: center;">
                    <div style="background: ${ratingColor}; color: white; padding: 15px 25px; border-radius: 12px; 
                                box-shadow: 0 4px 12px ${ratingColor}44; margin-bottom: 10px;">
                        <div style="font-size: 36px; font-weight: 900; line-height: 1;">${rating}</div>
                    </div>
                    <div style="font-size: 14px; font-weight: 600; color: ${ratingColor};">${ratingText}</div>
                </div>
            </div>
            
            <!-- Recommendation -->
            <div style="background: white; padding: 15px; border-radius: 10px; border-left: 4px solid ${ratingColor};">
                <strong style="color: ${ratingColor}; font-size: 14px;">Recommendation:</strong>
                <p style="margin: 5px 0 0 0; color: #334155; font-size: 14px;">${recommendation}</p>
            </div>
            
            <!-- Progress Bars -->
            <div style="margin-top: 15px; display: grid; gap: 10px;">
                <div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 12px;">
                        <span style="color: #64748b;">Bullish Signals</span>
                        <span style="color: ${this.colors.success}; font-weight: bold;">${signals.filter(s => s > 0).length}</span>
                    </div>
                    <div style="height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden;">
                        <div style="height: 100%; background: ${this.colors.success}; width: ${(signals.filter(s => s > 0).length / signals.length) * 100}%;
                                    transition: width 0.5s ease;"></div>
                    </div>
                </div>
                
                <div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 12px;">
                        <span style="color: #64748b;">Bearish Signals</span>
                        <span style="color: ${this.colors.danger}; font-weight: bold;">${signals.filter(s => s < 0).length}</span>
                    </div>
                    <div style="height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden;">
                        <div style="height: 100%; background: ${this.colors.danger}; width: ${(signals.filter(s => s < 0).length / signals.length) * 100}%;
                                    transition: width 0.5s ease;"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
},

// ============================================
// MODAL SYSTEM FOR INDICATOR EXPLANATIONS
// ============================================

showIndicatorModal(indicatorName) {
    const modal = document.getElementById('indicatorModal');
    const title = document.getElementById('modalTitle');
    const content = document.getElementById('modalContent');
    
    const explanations = {
        'rsi': {
            title: 'RSI - Relative Strength Index',
            icon: 'fa-gauge-high',
            description: 'The RSI is a momentum oscillator that measures the speed and magnitude of price changes.',
            formula: 'RSI = 100 - (100 / (1 + RS))<br>RS = Average Gain / Average Loss',
            interpretation: `
                <ul>
                    <li><strong>Above 70:</strong> Overbought - Potential sell signal</li>
                    <li><strong>30-70:</strong> Neutral zone</li>
                    <li><strong>Below 30:</strong> Oversold - Potential buy signal</li>
                    <li><strong>Divergences:</strong> Price vs RSI divergences signal potential reversals</li>
                </ul>
            `,
            usage: 'Professional traders use RSI to identify overbought/oversold conditions and divergences. Combine with trend analysis for best results.',
            period: '14 periods (standard)',
            tradingTip: '⚡ Most reliable in ranging markets. In strong trends, RSI can stay overbought/oversold for extended periods.'
        },
        'macd': {
            title: 'MACD - Moving Average Convergence Divergence',
            icon: 'fa-water',
            description: 'MACD is a trend-following momentum indicator showing the relationship between two moving averages.',
            formula: 'MACD Line = 12-period EMA - 26-period EMA<br>Signal Line = 9-period EMA of MACD<br>Histogram = MACD - Signal',
            interpretation: `
                <ul>
                    <li><strong>Bullish Crossover:</strong> MACD crosses above Signal line</li>
                    <li><strong>Bearish Crossover:</strong> MACD crosses below Signal line</li>
                    <li><strong>Histogram Expansion:</strong> Increasing momentum</li>
                    <li><strong>Divergences:</strong> Price vs MACD divergences signal reversals</li>
                </ul>
            `,
            usage: 'Wall Street traders use MACD for trend confirmation and momentum shifts. The histogram shows momentum strength.',
            period: '12, 26, 9 (Fast, Slow, Signal)',
            tradingTip: '🚀 Golden rule: Wait for histogram to turn positive after bullish crossover for confirmation.'
        },
        'bollinger': {
            title: 'Bollinger Bands® - Volatility Indicator',
            icon: 'fa-chart-area',
            description: 'Bollinger Bands consist of a middle band (SMA) and two outer bands at standard deviations above/below.',
            formula: 'Middle Band = 20-period SMA<br>Upper Band = SMA + (2 × SD)<br>Lower Band = SMA - (2 × SD)',
            interpretation: `
                <ul>
                    <li><strong>Price at Upper Band:</strong> Overbought, potential resistance</li>
                    <li><strong>Price at Lower Band:</strong> Oversold, potential support</li>
                    <li><strong>Band Squeeze:</strong> Low volatility, breakout imminent</li>
                    <li><strong>Band Expansion:</strong> High volatility, strong trend</li>
                </ul>
            `,
            usage: 'Institutional traders use Bollinger Bands to identify volatility cycles and potential reversal zones.',
            period: '20 periods, 2 standard deviations',
            tradingTip: '💡 The "Bollinger Squeeze" (narrow bands) often precedes major price moves in either direction.'
        },
        'cci': {
            title: 'CCI - Commodity Channel Index',
            icon: 'fa-wave-square',
            description: 'CCI measures the current price level relative to an average price level over a given period.',
            formula: 'CCI = (Typical Price - SMA) / (0.015 × Mean Deviation)',
            interpretation: `
                <ul>
                    <li><strong>Above +100:</strong> Overbought territory</li>
                    <li><strong>-100 to +100:</strong> Normal range</li>
                    <li><strong>Below -100:</strong> Oversold territory</li>
                    <li><strong>Zero-line crosses:</strong> Trend change signals</li>
                </ul>
            `,
            usage: 'Professional traders use CCI to identify cyclical trends and extreme conditions in both stocks and commodities.',
            period: '20 periods (standard)',
            tradingTip: '📊 CCI above +100 or below -100 only 25% of the time - these are significant extremes.'
        },
        'mfi': {
            title: 'MFI - Money Flow Index',
            icon: 'fa-money-bill-trend-up',
            description: 'MFI is the volume-weighted version of RSI, incorporating both price and volume.',
            formula: 'MFI = 100 - (100 / (1 + Money Flow Ratio))<br>Money Flow = Typical Price × Volume',
            interpretation: `
                <ul>
                    <li><strong>Above 80:</strong> Overbought with heavy volume - strong sell signal</li>
                    <li><strong>Below 20:</strong> Oversold with heavy volume - strong buy signal</li>
                    <li><strong>Divergences:</strong> Price vs MFI divergences show institutional activity</li>
                </ul>
            `,
            usage: 'Wall Street uses MFI to detect institutional money flow - superior to RSI for volume analysis.',
            period: '14 periods',
            tradingTip: '💰 MFI divergences are extremely powerful - they show when "smart money" disagrees with price.'
        },
        'adline': {
            title: 'A/D Line - Accumulation/Distribution',
            icon: 'fa-arrows-turn-to-dots',
            description: 'The A/D Line measures the cumulative flow of money into and out of a security.',
            formula: 'Money Flow Multiplier = [(Close - Low) - (High - Close)] / (High - Low)<br>A/D = Previous A/D + (MFM × Volume)',
            interpretation: `
                <ul>
                    <li><strong>Rising A/D:</strong> Accumulation (institutional buying)</li>
                    <li><strong>Falling A/D:</strong> Distribution (institutional selling)</li>
                    <li><strong>Bullish Divergence:</strong> Price down, A/D up (accumulation on dip)</li>
                    <li><strong>Bearish Divergence:</strong> Price up, A/D down (distribution on rally)</li>
                </ul>
            `,
            usage: 'Institutional traders use A/D to confirm trends and spot when "smart money" is accumulating or distributing.',
            period: 'Cumulative (all periods)',
            tradingTip: '🎯 A/D divergences often predict major reversals weeks in advance - a Wall Street favorite.'
        },
        'cmf': {
            title: 'CMF - Chaikin Money Flow',
            icon: 'fa-arrow-trend-up',
            description: 'CMF measures buying and selling pressure over a specified period using price and volume.',
            formula: 'CMF = Sum(Money Flow Volume for 21 periods) / Sum(Volume for 21 periods)',
            interpretation: `
                <ul>
                    <li><strong>Above +0.1:</strong> Strong buying pressure (accumulation)</li>
                    <li><strong>+0.1 to -0.1:</strong> Neutral zone</li>
                    <li><strong>Below -0.1:</strong> Strong selling pressure (distribution)</li>
                    <li><strong>Zero-line crosses:</strong> Trend change signals</li>
                </ul>
            `,
            usage: 'Professional traders use CMF to confirm trends and identify potential reversals based on volume patterns.',
            period: '21 periods (standard)',
            tradingTip: '💎 CMF crossing zero line is a powerful signal - especially when aligned with price action.'
        },
        'volumeProfile': {
            title: 'Volume Profile - Institutional Levels',
            icon: 'fa-chart-column',
            description: 'Volume Profile shows trading activity over time at specific price levels, revealing institutional support/resistance.',
            formula: 'POC = Price level with highest volume<br>VAH/VAL = Value Area High/Low (70% of volume)',
            interpretation: `
                <ul>
                    <li><strong>POC (Point of Control):</strong> Most traded price - major S/R level</li>
                    <li><strong>VAH (Value Area High):</strong> Upper boundary of fair value</li>
                    <li><strong>VAL (Value Area Low):</strong> Lower boundary of fair value</li>
                    <li><strong>High Volume Nodes:</strong> Strong support/resistance zones</li>
                </ul>
            `,
            usage: 'This is a Wall Street institutional tool - shows where the "big money" has been active.',
            period: 'Lookback period (customizable)',
            tradingTip: '🏛 POC levels act like magnets - price often returns to test these institutional levels.'
        },
        'movingAverages': {
            title: 'Moving Averages - Trend Analysis',
            icon: 'fa-chart-line',
            description: 'Moving Averages smooth price data to identify trends and potential support/resistance levels.',
            formula: 'SMA = Sum of prices / n<br>EMA = (Price × Multiplier) + (Previous EMA × (1 - Multiplier))<br>WMA = Weighted sum<br>HMA = WMA of (2×WMA(n/2) - WMA(n))',
            interpretation: `
                <ul>
                    <li><strong>Golden Cross:</strong> SMA50 crosses above SMA200 - Major buy signal</li>
                    <li><strong>Death Cross:</strong> SMA50 crosses below SMA200 - Major sell signal</li>
                    <li><strong>Price above MAs:</strong> Uptrend confirmed</li>
                    <li><strong>Price below MAs:</strong> Downtrend confirmed</li>
                </ul>
            `,
            usage: 'Wall Street uses multiple MAs to identify trend strength and key reversal points.',
            period: '20, 50, 200 (most common)',
            tradingTip: '⭐ The 200-day SMA is the most watched indicator on Wall Street - institutional benchmark.'
        },
        'supportResistance': {
            title: 'Support/Resistance - Key Levels',
            icon: 'fa-layer-group',
            description: 'Automatic detection of price levels where the stock has historically found support or faced resistance.',
            formula: 'Algorithm detects local peaks (resistance) and troughs (support) with clustering of similar levels.',
            interpretation: `
                <ul>
                    <li><strong>Support:</strong> Price level where buying interest prevents further decline</li>
                    <li><strong>Resistance:</strong> Price level where selling interest prevents further rise</li>
                    <li><strong>Touches:</strong> More touches = stronger level</li>
                    <li><strong>Breakouts:</strong> Breaking through key levels signals major moves</li>
                </ul>
            `,
            usage: 'Professional traders use S/R levels for entry/exit points and stop-loss placement.',
            period: 'Full price history',
            tradingTip: '🎯 Levels with 4+ touches are institutional barriers - major breakouts often follow.'
        },
        'divergences': {
            title: 'Divergences - Reversal Signals',
            icon: 'fa-code-branch',
            description: 'Divergences occur when price action disagrees with indicator movement, signaling potential reversals.',
            formula: 'Compares price peaks/troughs with RSI/MACD peaks/troughs over recent periods.',
            interpretation: `
                <ul>
                    <li><strong>Bullish Divergence:</strong> Lower price low + Higher indicator low = Buy signal</li>
                    <li><strong>Bearish Divergence:</strong> Higher price high + Lower indicator high = Sell signal</li>
                    <li><strong>Hidden Divergences:</strong> Continuation patterns in trends</li>
                </ul>
            `,
            usage: 'Wall Street traders use divergences as early warning signals - often precede major reversals by days/weeks.',
            period: '20-period lookback (standard)',
            tradingTip: '🚨 Divergences are leading indicators - they warn you BEFORE the reversal happens.'
        },
        'candlestickPatterns': {
            title: 'Candlestick Patterns - Price Action',
            icon: 'fa-chart-candlestick',
            description: 'Japanese candlestick patterns reveal market psychology and potential reversals through specific formations.',
            formula: 'Pattern recognition algorithms analyze candle bodies, wicks, and sequences.',
            interpretation: `
                <ul>
                    <li><strong>Hammer/Shooting Star:</strong> Single-candle reversal patterns</li>
                    <li><strong>Engulfing:</strong> Powerful 2-candle reversal patterns</li>
                    <li><strong>Morning/Evening Star:</strong> 3-candle major reversals</li>
                    <li><strong>Doji:</strong> Indecision, potential reversal</li>
                </ul>
            `,
            usage: 'Professional traders combine candlestick patterns with support/resistance for high-probability setups.',
            period: '1-5 candles per pattern',
            tradingTip: '🕯 Patterns work best at key S/R levels - context is everything in price action trading.'
        },
        'ichimoku': {
            title: 'Ichimoku Cloud - Complete System',
            icon: 'fa-cloud',
            description: 'Ichimoku is an all-in-one indicator providing support/resistance, trend direction, and momentum.',
            formula: 'Tenkan = (9-period high + low) / 2<br>Kijun = (26-period high + low) / 2<br>Senkou A = (Tenkan + Kijun) / 2<br>Senkou B = (52-period high + low) / 2',
            interpretation: `
                <ul>
                    <li><strong>Price above Cloud:</strong> Bullish trend</li>
                    <li><strong>Price below Cloud:</strong> Bearish trend</li>
                    <li><strong>Price in Cloud:</strong> Consolidation/uncertainty</li>
                    <li><strong>Cloud color:</strong> Green = support, Red = resistance</li>
                </ul>
            `,
            usage: 'Used extensively by Japanese institutional traders - provides complete trading system in one indicator.',
            period: '9, 26, 52 (standard)',
            tradingTip: '☁ Ichimoku is designed for daily charts - works best on medium to long-term timeframes.'
        },
        'vwap': {
            title: 'VWAP - Volume Weighted Average Price',
            icon: 'fa-balance-scale',
            description: 'VWAP shows the average price weighted by volume - the "fair value" according to the market.',
            formula: 'VWAP = Σ(Price × Volume) / Σ(Volume)',
            interpretation: `
                <ul>
                    <li><strong>Price above VWAP:</strong> Bullish, institutional support</li>
                    <li><strong>Price below VWAP:</strong> Bearish, institutional resistance</li>
                    <li><strong>±1 SD bands:</strong> Overbought/oversold zones</li>
                    <li><strong>±2 SD bands:</strong> Extreme zones</li>
                </ul>
            `,
            usage: 'Institutional traders use VWAP as a benchmark - hedge funds measure their performance against it.',
            period: 'Resets daily (intraday) or session-based',
            tradingTip: '🏦 Banks and hedge funds use VWAP for execution - it reveals where "smart money" is positioned.'
        }
    };
    
    const data = explanations[indicatorName];
    if (!data) return;
    
    title.innerHTML = `<i class="fas ${data.icon}"></i> ${data.title}`;
    
    content.innerHTML = `
        <div class="modal-section">
            <h4><i class="fas fa-info-circle"></i> Description</h4>
            <p>${data.description}</p>
        </div>
        
        <div class="modal-section">
            <h4><i class="fas fa-calculator"></i> Formula</h4>
            <div class="formula-box">${data.formula}</div>
        </div>
        
        <div class="modal-section">
            <h4><i class="fas fa-book-open"></i> Interpretation</h4>
            ${data.interpretation}
        </div>
        
        <div class="modal-section">
            <h4><i class="fas fa-briefcase"></i> Professional Usage</h4>
            <p>${data.usage}</p>
        </div>
        
        <div class="modal-section">
            <h4><i class="fas fa-clock"></i> Period</h4>
            <p><strong>${data.period}</strong></p>
        </div>
        
        <div class="modal-section trading-tip">
            <h4><i class="fas fa-lightbulb"></i> Trading Tip</h4>
            <p>${data.tradingTip}</p>
        </div>
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
},

closeIndicatorModal() {
    const modal = document.getElementById('indicatorModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
},

// ============================================
// INITIALIZATION - ADD MODAL LISTENERS
// ============================================

setupModalListeners() {
    // Close modal on backdrop click
    document.getElementById('indicatorModal')?.addEventListener('click', (e) => {
        if (e.target.id === 'indicatorModal') {
            this.closeIndicatorModal();
        }
    });
    
    // Close modal on X button
    document.querySelector('.modal-close')?.addEventListener('click', () => {
        this.closeIndicatorModal();
    });
    
    // Close modal on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            this.closeIndicatorModal();
        }
    });
},