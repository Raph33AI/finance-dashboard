// /* ==============================================
//    MARKET-DATA.JS - Market Data & Technical Analysis
//    Version Cloud avec RATE LIMITING et CACHE OPTIMISÉ - COMPLET
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
            
//             // Trier par priorité (high > normal > low)
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
//             // Nettoyer les anciennes requêtes
//             const now = Date.now();
//             this.requestTimes = this.requestTimes.filter(time => now - time < this.windowMs);
            
//             // Vérifier si on peut faire une requête
//             if (this.requestTimes.length >= this.maxRequests) {
//                 const oldestRequest = Math.min(...this.requestTimes);
//                 const waitTime = this.windowMs - (now - oldestRequest) + 100;
                
//                 console.log(`⏳ Rate limit reached. Waiting ${Math.ceil(waitTime/1000)}s...`);
                
//                 // Mettre à jour l'indicateur de cache
//                 if (window.cacheWidget) {
//                     window.cacheWidget.updateQueueStatus(this.queue.length, waitTime);
//                 }
                
//                 await this.sleep(waitTime);
//                 continue;
//             }
            
//             // Exécuter la prochaine requête
//             const item = this.queue.shift();
//             this.requestTimes.push(Date.now());
            
//             try {
//                 const result = await item.fn();
//                 item.resolve(result);
//             } catch (error) {
//                 item.reject(error);
//             }
            
//             // Petit délai entre les requêtes
//             await this.sleep(100);
//         }
        
//         this.processing = false;
        
//         // Mettre à jour l'indicateur
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

// // ========== CACHE OPTIMISÉ ==========
// class OptimizedCache {
//     constructor() {
//         this.prefix = 'md_cache_';
//         this.staticTTL = 24 * 60 * 60 * 1000; // 24h pour données statiques
//         this.dynamicTTL = 5 * 60 * 1000; // 5min pour données dynamiques
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
            
//             // Vérifier expiration
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

// const MarketData = {
//     // API Client
//     apiClient: null,
//     rateLimiter: null,
//     optimizedCache: null,
    
//     // Current State
//     currentSymbol: '',
//     currentPeriod: '1M',
//     stockData: null,
//     profileData: null,
//     statisticsData: null,
//     logoUrl: '',
    
//     // Search functionality
//     selectedSuggestionIndex: -1,
//     searchTimeout: null,
    
//     // Watchlist & Alerts
//     watchlist: [],
//     alerts: [],
//     watchlistRefreshInterval: null,
//     notificationPermission: false,
//     lastWatchlistRefresh: 0,
    
//     // Comparison
//     comparisonSymbols: [],
//     comparisonData: {},
//     comparisonColors: ['#1e5eeb', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'],
    
//     // Charts instances
//     charts: {
//         price: null,
//         rsi: null,
//         macd: null,
//         comparison: null
//     },
    
//     // ========== INITIALIZATION ==========
    
//     async init() {
//         try {
//             console.log('🚀 Initializing Market Data with Rate Limiting...');
            
//             // Initialiser le rate limiter (8 req/min)
//             this.rateLimiter = new RateLimiter(8, 60000);
//             this.optimizedCache = new OptimizedCache();
            
//             // Attendre que l'utilisateur soit authentifié
//             await this.waitForAuth();
            
//             // Initialiser le client API
//             this.apiClient = new FinanceAPIClient({
//                 baseURL: APP_CONFIG.API_BASE_URL,
//                 cacheDuration: APP_CONFIG.CACHE_DURATION || 300000,
//                 maxRetries: APP_CONFIG.MAX_RETRIES || 2,
//                 onLoadingChange: (isLoading) => {
//                     this.showLoading(isLoading);
//                 }
//             });
            
//             // Rendre accessible globalement
//             window.apiClient = this.apiClient;
//             window.rateLimiter = this.rateLimiter;
            
//             this.updateLastUpdate();
//             this.setupEventListeners();
//             this.setupSearchListeners();
//             this.startCacheMonitoring();
            
//             await this.loadCurrentPortfolio();
            
//             this.requestNotificationPermission();
//             this.startWatchlistAutoRefresh();
            
//             // Auto-load a default symbol
//             setTimeout(() => {
//                 this.loadSymbol('AAPL');
//             }, 500);
            
//             console.log('✅ Market Data initialized with rate limiting');
            
//         } catch (error) {
//             console.error('Initialization error:', error);
//             this.showNotification('Failed to initialize application', 'error');
//         }
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
    
//     async waitForAuth() {
//         return new Promise((resolve) => {
//             if (!firebase || !firebase.auth) {
//                 console.warn('⚠️ Firebase not available');
//                 resolve();
//                 return;
//             }
            
//             const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
//                 if (user) {
//                     console.log('✅ User authenticated for Market Data');
//                     unsubscribe();
//                     resolve();
//                 }
//             });
            
//             setTimeout(() => {
//                 resolve();
//             }, 3000);
//         });
//     },
    
//     // ========== LOAD SYMBOL (OPTIMISÉ) ==========
    
//     async loadSymbol(symbol) {
//         this.currentSymbol = symbol;
        
//         const input = document.getElementById('symbolInput');
//         if (input) {
//             input.value = symbol;
//         }
        
//         this.showLoading(true);
//         this.hideResults();
//         this.hideSuggestions();
        
//         try {
//             console.log(`📊 Loading ${symbol} with optimized cache...`);
            
//             // Charger d'abord depuis le cache local
//             const cachedProfile = this.optimizedCache.get(`profile_${symbol}`);
//             const cachedLogo = this.optimizedCache.get(`logo_${symbol}`);
//             const cachedStats = this.optimizedCache.get(`stats_${symbol}`);
            
//             // Données critiques avec rate limiting (priorité haute)
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
//                 quote: quote
//             };
            
//             // Afficher immédiatement les données critiques
//             this.displayStockOverview();
//             this.displayResults();
//             this.updateAddToWatchlistButton();
            
//             // Utiliser le cache pour les données statiques
//             this.profileData = cachedProfile;
//             this.statisticsData = cachedStats;
//             this.logoUrl = cachedLogo || '';
            
//             if (cachedProfile || cachedStats) {
//                 this.displayCompanyProfile();
//                 console.log('✅ Loaded profile/stats from cache');
//             }
            
//             // Charger les données statiques en arrière-plan
//             this.loadStaticDataInBackground(symbol);
            
//         } catch (error) {
//             console.error('Error loading stock data:', error);
//             this.showNotification(error.message || 'Failed to load stock data', 'error');
//         } finally {
//             this.showLoading(false);
//         }
//     },
    
//     async loadStaticDataInBackground(symbol) {
//         try {
//             const [profile, statistics, logo] = await Promise.allSettled([
//                 this.apiRequest(() => this.apiClient.getProfile(symbol), 'low'),
//                 this.apiRequest(() => this.apiClient.getStatistics(symbol), 'low'),
//                 this.apiRequest(() => this.apiClient.getLogo(symbol), 'low')
//             ]);
            
//             let updated = false;
            
//             if (profile.status === 'fulfilled' && profile.value) {
//                 this.profileData = profile.value;
//                 this.optimizedCache.set(`profile_${symbol}`, profile.value, this.optimizedCache.staticTTL);
//                 updated = true;
//             }
            
//             if (statistics.status === 'fulfilled' && statistics.value) {
//                 this.statisticsData = statistics.value;
//                 this.optimizedCache.set(`stats_${symbol}`, statistics.value, this.optimizedCache.staticTTL);
//                 updated = true;
//             }
            
//             if (logo.status === 'fulfilled' && logo.value) {
//                 this.logoUrl = logo.value;
//                 this.optimizedCache.set(`logo_${symbol}`, logo.value, this.optimizedCache.staticTTL);
//                 updated = true;
//             }
            
//             if (updated) {
//                 this.displayCompanyProfile();
//                 console.log('✅ Updated static data in background');
//             }
            
//         } catch (error) {
//             console.warn('Background data load failed:', error);
//         }
//     },
    
//     async getTimeSeriesForPeriod(symbol, period) {
//         const periodMap = {
//             '1M': { interval: '1day', outputsize: 30 },
//             '3M': { interval: '1day', outputsize: 90 },
//             '6M': { interval: '1day', outputsize: 180 },
//             '1Y': { interval: '1day', outputsize: 252 },
//             '5Y': { interval: '1week', outputsize: 260 },
//             'MAX': { interval: '1month', outputsize: 300 }
//         };
        
//         const config = periodMap[period] || periodMap['6M'];
//         return await this.apiClient.getTimeSeries(symbol, config.interval, config.outputsize);
//     },
    
//     changePeriod(period) {
//         this.currentPeriod = period;
        
//         document.querySelectorAll('.period-btn').forEach(btn => {
//             btn.classList.remove('active');
//             btn.setAttribute('aria-pressed', 'false');
//         });
        
//         const activeBtn = document.querySelector(`[data-period="${period}"]`);
//         if (activeBtn) {
//             activeBtn.classList.add('active');
//             activeBtn.setAttribute('aria-pressed', 'true');
//         }
        
//         if (this.currentSymbol) {
//             this.loadSymbol(this.currentSymbol);
//         }
        
//         if (this.comparisonSymbols.length > 0) {
//             this.loadComparisonFromSymbols(this.comparisonSymbols);
//         }
//     },
    
//     updateChart() {
//         if (this.stockData) {
//             this.createPriceChart();
//         }
//     },
    
//     toggleAccordion(headerElement) {
//         const content = headerElement.nextElementSibling;
//         const isActive = headerElement.classList.contains('active');
        
//         document.querySelectorAll('.accordion-header.active').forEach(h => {
//             h.classList.remove('active');
//             h.nextElementSibling.classList.remove('active');
//         });
        
//         if (!isActive) {
//             headerElement.classList.add('active');
//             content.classList.add('active');
//         }
//     },
    
//     escapeHtml(text) {
//         if (!text) return '';
//         const div = document.createElement('div');
//         div.textContent = text;
//         return div.innerHTML;
//     }
    
// };

// // ========== WATCHLIST FUNCTIONS (OPTIMISÉ) ==========

// Object.assign(MarketData, {
    
//     loadWatchlistFromStorage() {
//         const saved = localStorage.getItem('market_watchlist');
//         if (saved) {
//             try {
//                 this.watchlist = JSON.parse(saved);
//                 this.renderWatchlist();
//             } catch (error) {
//                 console.error('Error loading watchlist:', error);
//                 this.watchlist = [];
//             }
//         }
//     },
    
//     saveWatchlistToStorage() {
//         try {
//             localStorage.setItem('market_watchlist', JSON.stringify(this.watchlist));
//         } catch (error) {
//             console.error('Error saving watchlist:', error);
//         }
//     },
    
//     addCurrentToWatchlist() {
//         if (!this.currentSymbol) {
//             alert('Please search for a stock first');
//             return;
//         }
        
//         if (this.watchlist.some(item => item.symbol === this.currentSymbol)) {
//             alert(`${this.currentSymbol} is already in your watchlist`);
//             return;
//         }
        
//         const watchlistItem = {
//             symbol: this.currentSymbol,
//             name: this.stockData.quote.name || this.currentSymbol,
//             addedAt: Date.now()
//         };
        
//         this.watchlist.push(watchlistItem);
        
//         this.saveWatchlistToStorage();
//         this.autoSave();
        
//         this.renderWatchlist();
//         this.refreshSingleWatchlistItem(this.currentSymbol);
//         this.updateAddToWatchlistButton();
        
//         this.showNotification(`✅ ${this.currentSymbol} added to watchlist`, 'success');
//     },
    
//     removeFromWatchlist(symbol) {
//         if (confirm(`Remove ${symbol} from watchlist?`)) {
//             this.watchlist = this.watchlist.filter(item => item.symbol !== symbol);
            
//             this.saveWatchlistToStorage();
//             this.autoSave();
            
//             this.renderWatchlist();
//             this.updateAddToWatchlistButton();
//             this.showNotification(`${symbol} removed from watchlist`, 'info');
//         }
//     },
    
//     clearWatchlist() {
//         if (this.watchlist.length === 0) {
//             alert('Watchlist is already empty');
//             return;
//         }
        
//         if (confirm(`Clear all ${this.watchlist.length} stocks from watchlist?`)) {
//             this.watchlist = [];
            
//             this.saveWatchlistToStorage();
//             this.autoSave();
            
//             this.renderWatchlist();
//             this.updateAddToWatchlistButton();
//             this.showNotification('Watchlist cleared', 'info');
//         }
//     },
    
//     renderWatchlist() {
//         const container = document.getElementById('watchlistContainer');
//         if (!container) return;
        
//         if (this.watchlist.length === 0) {
//             container.innerHTML = `
//                 <div class='watchlist-empty'>
//                     <i class='fas fa-star-half-alt'></i>
//                     <p>Your watchlist is empty</p>
//                     <p class='hint'>Search for a stock and click "Add to Watchlist" to start tracking</p>
//                 </div>
//             `;
//             return;
//         }
        
//         container.innerHTML = this.watchlist.map(item => `
//             <div class='watchlist-card' id='watchlist-${item.symbol}' onclick='MarketData.loadSymbol("${item.symbol}")'>
//                 <div class='watchlist-card-header'>
//                     <div>
//                         <div class='watchlist-symbol'>${this.escapeHtml(item.symbol)}</div>
//                         <div class='watchlist-name'>${this.escapeHtml(item.name)}</div>
//                     </div>
//                     <button class='watchlist-remove' onclick='event.stopPropagation(); MarketData.removeFromWatchlist("${item.symbol}")' aria-label='Remove ${item.symbol} from watchlist'>
//                         <i class='fas fa-times'></i>
//                     </button>
//                 </div>
//                 <div class='watchlist-price'>--</div>
//                 <div class='watchlist-change'>
//                     <i class='fas fa-minus'></i>
//                     <span>--</span>
//                 </div>
//                 <div class='watchlist-stats'>
//                     <div class='watchlist-stat'>
//                         <span class='watchlist-stat-label'>Open</span>
//                         <span class='watchlist-stat-value'>--</span>
//                     </div>
//                     <div class='watchlist-stat'>
//                         <span class='watchlist-stat-label'>Volume</span>
//                         <span class='watchlist-stat-value'>--</span>
//                     </div>
//                 </div>
//             </div>
//         `).join('');
//     },
    
//     async refreshWatchlist() {
//         if (this.watchlist.length === 0) {
//             return;
//         }
        
//         // THROTTLING : Ne pas rafraîchir plus d'une fois toutes les 5 minutes
//         const now = Date.now();
//         const minInterval = 5 * 60 * 1000;
        
//         if (now - this.lastWatchlistRefresh < minInterval) {
//             const remaining = Math.ceil((minInterval - (now - this.lastWatchlistRefresh)) / 1000);
//             this.showNotification(`Watchlist refreshed ${Math.ceil((now - this.lastWatchlistRefresh) / 1000)}s ago. Wait ${remaining}s`, 'info');
//             return;
//         }
        
//         this.lastWatchlistRefresh = now;
        
//         // Charger d'abord depuis le cache
//         let cacheHits = 0;
//         for (const item of this.watchlist) {
//             const cached = this.optimizedCache.get(`quote_${item.symbol}`);
//             if (cached && this.optimizedCache.getAge(`quote_${item.symbol}`) < 60000) {
//                 this.updateWatchlistCard(item.symbol, cached);
//                 cacheHits++;
//             }
//         }
        
//         if (cacheHits > 0) {
//             console.log(`✅ Loaded ${cacheHits}/${this.watchlist.length} from cache`);
//         }
        
//         // RATE LIMITING : Refresh par batch de 5 max
//         const batchSize = 5;
//         const symbolsToRefresh = this.watchlist.map(item => item.symbol);
        
//         this.showNotification(`Refreshing ${symbolsToRefresh.length} stocks...`, 'info');
        
//         for (let i = 0; i < symbolsToRefresh.length; i += batchSize) {
//             const batch = symbolsToRefresh.slice(i, i + batchSize);
            
//             await Promise.all(
//                 batch.map(symbol => this.refreshSingleWatchlistItem(symbol))
//             );
            
//             if (i + batchSize < symbolsToRefresh.length) {
//                 console.log(`⏳ Batch ${Math.ceil((i + batchSize) / batchSize)} completed, waiting...`);
//                 await this.rateLimiter.sleep(2000);
//             }
//         }
        
//         this.updateLastUpdate();
//         this.checkAlerts();
//         this.showNotification('✅ Watchlist refreshed!', 'success');
//     },
    
//     async refreshSingleWatchlistItem(symbol) {
//         const card = document.getElementById(`watchlist-${symbol}`);
//         if (!card) return;
        
//         card.classList.add('watchlist-loading');
        
//         try {
//             const quote = await this.apiRequest(() => this.apiClient.getQuote(symbol), 'normal');
            
//             this.optimizedCache.set(`quote_${symbol}`, quote, 60000);
            
//             this.updateWatchlistCard(symbol, quote);
            
//             const watchlistItem = this.watchlist.find(w => w.symbol === symbol);
//             if (watchlistItem) {
//                 watchlistItem.currentPrice = quote.price;
//                 watchlistItem.change = quote.change;
//                 watchlistItem.changePercent = quote.percentChange;
//             }
            
//         } catch (error) {
//             console.error(`Error refreshing ${symbol}:`, error);
            
//             const cached = this.optimizedCache.get(`quote_${symbol}`);
//             if (cached) {
//                 this.updateWatchlistCard(symbol, cached);
//                 console.log(`✅ Using cached data for ${symbol}`);
//             }
//         } finally {
//             card.classList.remove('watchlist-loading');
//         }
//     },
    
//     updateWatchlistCard(symbol, quote) {
//         const card = document.getElementById(`watchlist-${symbol}`);
//         if (!card) return;
        
//         const price = quote.price;
//         const change = quote.change;
//         const changePercent = quote.percentChange;
//         const open = quote.open;
//         const volume = quote.volume;
        
//         card.querySelector('.watchlist-price').textContent = this.formatCurrency(price);
        
//         const changeEl = card.querySelector('.watchlist-change');
//         const icon = change >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';
//         const changeClass = change >= 0 ? 'positive' : 'negative';
//         changeEl.className = `watchlist-change ${changeClass}`;
//         changeEl.innerHTML = `
//             <i class='fas ${icon}'></i>
//             <span>${change >= 0 ? '+' : ''}${this.formatCurrency(change)} (${change >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)</span>
//         `;
        
//         const stats = card.querySelectorAll('.watchlist-stat-value');
//         stats[0].textContent = this.formatCurrency(open);
//         stats[1].textContent = this.formatVolume(volume);
        
//         const cacheAge = this.optimizedCache.getAge(`quote_${symbol}`);
//         if (cacheAge && cacheAge > 0) {
//             const ageSeconds = Math.floor(cacheAge / 1000);
//             if (ageSeconds < 60) {
//                 card.setAttribute('title', `Updated ${ageSeconds}s ago (from cache)`);
//             }
//         }
//     },
    
//     startWatchlistAutoRefresh() {
//         if (this.watchlistRefreshInterval) {
//             clearInterval(this.watchlistRefreshInterval);
//         }
        
//         this.watchlistRefreshInterval = setInterval(() => {
//             if (this.watchlist.length > 0) {
//                 console.log('⏰ Auto-refresh triggered');
//                 this.refreshWatchlist();
//             }
//         }, 2 * 60 * 60 * 1000); // 2 heures
//     },
    
//     updateAddToWatchlistButton() {
//         const btn = document.getElementById('btnAddCurrent');
//         if (!btn) return;
        
//         if (this.currentSymbol && !this.watchlist.some(w => w.symbol === this.currentSymbol)) {
//             btn.disabled = false;
//             btn.innerHTML = `<i class='fas fa-plus'></i> Add ${this.currentSymbol} to Watchlist`;
//         } else if (this.currentSymbol) {
//             btn.disabled = true;
//             btn.innerHTML = `<i class='fas fa-check'></i> Already in Watchlist`;
//         } else {
//             btn.disabled = true;
//             btn.innerHTML = `<i class='fas fa-plus'></i> Add Current Stock`;
//         }
//     }
    
// });

// // ========== SEARCH FUNCTIONS (OPTIMISÉ) ==========

// Object.assign(MarketData, {
    
//     setupSearchListeners() {
//         const input = document.getElementById('symbolInput');
//         if (!input) return;
        
//         input.addEventListener('input', (e) => {
//             this.handleSearch(e.target.value);
//         });
        
//         input.addEventListener('keydown', (e) => {
//             if (e.key === 'Enter') {
//                 e.preventDefault();
//                 if (this.selectedSuggestionIndex >= 0) {
//                     const suggestions = document.querySelectorAll('.suggestion-item');
//                     if (suggestions[this.selectedSuggestionIndex]) {
//                         const symbol = suggestions[this.selectedSuggestionIndex].dataset.symbol;
//                         this.selectSuggestion(symbol);
//                     }
//                 } else {
//                     this.searchStock();
//                 }
//             } else if (e.key === 'ArrowDown') {
//                 e.preventDefault();
//                 this.navigateSuggestions('down');
//             } else if (e.key === 'ArrowUp') {
//                 e.preventDefault();
//                 this.navigateSuggestions('up');
//             } else if (e.key === 'Escape') {
//                 this.hideSuggestions();
//             }
//         });
        
//         input.addEventListener('focus', (e) => {
//             if (e.target.value.trim().length > 0) {
//                 this.handleSearch(e.target.value);
//             }
//         });
        
//         document.addEventListener('click', (e) => {
//             if (!e.target.closest('.search-input-wrapper')) {
//                 this.hideSuggestions();
//             }
//         });
//     },
    
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
//         if (!container) return;
        
//         // Vérifier le cache d'abord
//         const cacheKey = `search_${query.toUpperCase()}`;
//         const cached = this.optimizedCache.get(cacheKey);
        
//         if (cached) {
//             console.log('✅ Search results from cache');
//             this.displaySearchResults(cached, query);
//             return;
//         }
        
//         container.innerHTML = '<div class="suggestion-loading"><i class="fas fa-spinner fa-spin"></i> Searching...</div>';
//         container.classList.add('active');
        
//         try {
//             const results = await this.apiRequest(() => this.apiClient.searchSymbol(query), 'low');
            
//             if (results.data && results.data.length > 0) {
//                 this.optimizedCache.set(cacheKey, results.data, 60 * 60 * 1000);
//                 this.displaySearchResults(results.data, query);
//             } else {
//                 this.displayNoResults();
//             }
            
//         } catch (error) {
//             console.error('Search failed:', error);
//             this.displaySearchError();
//         }
//     },
    
//     displaySearchResults(results, query) {
//         const container = document.getElementById('searchSuggestions');
//         if (!container) return;
        
//         const grouped = {
//             stocks: [],
//             etfs: [],
//             crypto: [],
//             indices: [],
//             other: []
//         };
        
//         results.forEach(item => {
//             const type = (item.instrument_type || 'Common Stock').toLowerCase();
            
//             if (type.includes('stock') || type.includes('equity')) {
//                 grouped.stocks.push(item);
//             } else if (type.includes('etf')) {
//                 grouped.etfs.push(item);
//             } else if (type.includes('crypto') || type.includes('digital currency')) {
//                 grouped.crypto.push(item);
//             } else if (type.includes('index')) {
//                 grouped.indices.push(item);
//             } else {
//                 grouped.other.push(item);
//             }
//         });
        
//         let html = '';
//         if (grouped.stocks.length > 0) html += this.buildCategoryHTML('Stocks', grouped.stocks, query);
//         if (grouped.etfs.length > 0) html += this.buildCategoryHTML('ETFs', grouped.etfs, query);
//         if (grouped.crypto.length > 0) html += this.buildCategoryHTML('Cryptocurrencies', grouped.crypto, query);
//         if (grouped.indices.length > 0) html += this.buildCategoryHTML('Indices', grouped.indices, query);
//         if (grouped.other.length > 0) html += this.buildCategoryHTML('Other', grouped.other, query);
        
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
    
//     displayNoResults() {
//         const container = document.getElementById('searchSuggestions');
//         if (!container) return;
        
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
//         if (!container) return;
        
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
//         const input = document.getElementById('symbolInput');
//         if (input) {
//             input.value = symbol;
//         }
//         this.hideSuggestions();
//         this.loadSymbol(symbol);
//     },
    
//     hideSuggestions() {
//         const container = document.getElementById('searchSuggestions');
//         if (!container) return;
        
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
    
//     searchStock() {
//         const input = document.getElementById('symbolInput');
//         if (!input) return;
        
//         const symbol = input.value.trim().toUpperCase();
//         if (symbol) {
//             this.loadSymbol(symbol);
//         }
//     }
    
// });

// // ========== ALERTS FUNCTIONS ==========

// Object.assign(MarketData, {
    
//     loadAlertsFromStorage() {
//         const saved = localStorage.getItem('market_alerts');
//         if (saved) {
//             try {
//                 this.alerts = JSON.parse(saved);
//                 this.renderAlerts();
//             } catch (error) {
//                 console.error('Error loading alerts:', error);
//                 this.alerts = [];
//             }
//         }
//     },
    
//     saveAlertsToStorage() {
//         try {
//             localStorage.setItem('market_alerts', JSON.stringify(this.alerts));
//         } catch (error) {
//             console.error('Error saving alerts:', error);
//         }
//     },
    
//     openAlertModal() {
//         const modal = document.getElementById('modalCreateAlert');
//         if (modal) {
//             modal.classList.add('active');
//             document.body.style.overflow = 'hidden'; // Empêcher le scroll
//         }
        
//         if (this.currentSymbol) {
//             const input = document.getElementById('alertSymbol');
//             if (input) {
//                 input.value = this.currentSymbol;
//             }
//         }
//     },
    
//     closeAlertModal() {
//         const modal = document.getElementById('modalCreateAlert');
//         if (modal) {
//             modal.classList.remove('active');
//             document.body.style.overflow = ''; // Réactiver le scroll
//         }
        
//         const symbolInput = document.getElementById('alertSymbol');
//         const priceInput = document.getElementById('alertPrice');
//         const typeInput = document.getElementById('alertType');
//         const noteInput = document.getElementById('alertNote');
        
//         if (symbolInput) symbolInput.value = '';
//         if (priceInput) priceInput.value = '';
//         if (typeInput) typeInput.value = 'above';
//         if (noteInput) noteInput.value = '';
//     },
    
//     createAlert() {
//         const symbol = document.getElementById('alertSymbol').value.trim().toUpperCase();
//         const price = parseFloat(document.getElementById('alertPrice').value);
//         const type = document.getElementById('alertType').value;
//         const note = document.getElementById('alertNote').value.trim();
        
//         if (!symbol) {
//             alert('Please enter a stock symbol');
//             return;
//         }
        
//         if (!price || price <= 0) {
//             alert('Please enter a valid target price');
//             return;
//         }
        
//         const alert = {
//             id: Date.now(),
//             symbol: symbol,
//             targetPrice: price,
//             type: type,
//             note: note,
//             triggered: false,
//             createdAt: Date.now()
//         };
        
//         this.alerts.push(alert);
        
//         this.saveAlertsToStorage();
//         this.autoSave();
        
//         this.renderAlerts();
//         this.closeAlertModal();
        
//         this.showNotification(`✅ Alert created for ${symbol}`, 'success');
        
//         if (!this.watchlist.some(w => w.symbol === symbol)) {
//             this.watchlist.push({
//                 symbol: symbol,
//                 name: symbol,
//                 addedAt: Date.now()
//             });
//             this.saveWatchlistToStorage();
//             this.autoSave();
//             this.renderWatchlist();
//             this.refreshSingleWatchlistItem(symbol);
//         }
//     },
    
//     deleteAlert(alertId) {
//         if (confirm('Delete this alert?')) {
//             this.alerts = this.alerts.filter(a => a.id !== alertId);
            
//             this.saveAlertsToStorage();
//             this.autoSave();
            
//             this.renderAlerts();
//             this.showNotification('Alert deleted', 'info');
//         }
//     },
    
//     renderAlerts() {
//         const container = document.getElementById('alertsContainer');
//         if (!container) return;
        
//         if (this.alerts.length === 0) {
//             container.innerHTML = `
//                 <div class='alerts-empty'>
//                     <i class='fas fa-bell-slash'></i>
//                     <p>No active alerts</p>
//                     <p class='hint'>Create price alerts to get notified when a stock reaches your target</p>
//                 </div>
//             `;
//             return;
//         }
        
//         container.innerHTML = this.alerts.map(alert => {
//             const statusClass = alert.triggered ? 'triggered' : 'active';
//             const statusText = alert.triggered ? 'Triggered ✓' : 'Active';
//             const conditionText = alert.type === 'above' ? 'above' : 'below';
            
//             return `
//                 <div class='alert-card ${statusClass}'>
//                     <div class='alert-info'>
//                         <div class='alert-symbol'>${this.escapeHtml(alert.symbol)}</div>
//                         <div class='alert-condition'>
//                             Alert when price goes <strong>${conditionText}</strong> 
//                             <span class='price'>${this.formatCurrency(alert.targetPrice)}</span>
//                         </div>
//                         ${alert.note ? `<div class='alert-note'>${this.escapeHtml(alert.note)}</div>` : ''}
//                     </div>
//                     <span class='alert-status ${statusClass}'>${statusText}</span>
//                     <button class='alert-delete' onclick='MarketData.deleteAlert(${alert.id})' aria-label='Delete alert'>
//                         <i class='fas fa-trash'></i>
//                     </button>
//                 </div>
//             `;
//         }).join('');
//     },
    
//     checkAlerts() {
//         let triggeredCount = 0;
        
//         this.alerts.forEach(alert => {
//             if (alert.triggered) return;
            
//             const watchlistItem = this.watchlist.find(w => w.symbol === alert.symbol);
//             if (!watchlistItem || !watchlistItem.currentPrice) return;
            
//             const currentPrice = watchlistItem.currentPrice;
//             let shouldTrigger = false;
            
//             if (alert.type === 'above' && currentPrice >= alert.targetPrice) {
//                 shouldTrigger = true;
//             } else if (alert.type === 'below' && currentPrice <= alert.targetPrice) {
//                 shouldTrigger = true;
//             }
            
//             if (shouldTrigger) {
//                 alert.triggered = true;
//                 triggeredCount++;
                
//                 const message = `🔔 ${alert.symbol} is now ${alert.type} ${this.formatCurrency(alert.targetPrice)}! Current: ${this.formatCurrency(currentPrice)}`;
//                 this.showNotification(message, 'warning', true);
//             }
//         });
        
//         if (triggeredCount > 0) {
//             this.saveAlertsToStorage();
//             this.autoSave();
//             this.renderAlerts();
//         }
//     },
    
//     requestNotificationPermission() {
//         if ('Notification' in window && Notification.permission === 'default') {
//             Notification.requestPermission().then(permission => {
//                 this.notificationPermission = permission === 'granted';
//             });
//         } else if ('Notification' in window && Notification.permission === 'granted') {
//             this.notificationPermission = true;
//         }
//     }
    
// });

// // ========== COMPARISON FUNCTIONS (OPTIMISÉ) ==========

// Object.assign(MarketData, {
    
//     openComparisonModal() {
//         const modal = document.getElementById('modalAddComparison');
//         if (modal) {
//             modal.classList.add('active');
//             document.body.style.overflow = 'hidden';
//         }
//     },
    
//     closeComparisonModal() {
//         const modal = document.getElementById('modalAddComparison');
//         if (modal) {
//             modal.classList.remove('active');
//             document.body.style.overflow = '';
//         }
        
//         const input = document.getElementById('comparisonSymbols');
//         if (input) {
//             input.value = '';
//         }
//     },
    
//     async loadComparison() {
//         const input = document.getElementById('comparisonSymbols');
//         if (!input) return;
        
//         const symbols = input.value.split(',')
//             .map(s => s.trim().toUpperCase())
//             .filter(s => s.length > 0);
        
//         if (symbols.length < 2) {
//             alert('Please enter at least 2 symbols to compare');
//             return;
//         }
        
//         if (symbols.length > 5) {
//             alert('Maximum 5 symbols allowed');
//             return;
//         }
        
//         this.closeComparisonModal();
//         this.comparisonSymbols = symbols;
//         this.comparisonData = {};
        
//         this.autoSave();
        
//         this.showNotification(`Loading ${symbols.length} stocks for comparison...`, 'info');
        
//         const results = [];
//         for (const symbol of symbols) {
//             try {
//                 await this.fetchComparisonData(symbol);
//                 results.push({ status: 'fulfilled' });
//             } catch (error) {
//                 console.error(`Failed to load ${symbol}:`, error);
//                 results.push({ status: 'rejected' });
//             }
//         }
        
//         const successCount = results.filter(r => r.status === 'fulfilled').length;
        
//         if (successCount < 2) {
//             alert('Failed to load enough stocks for comparison. Please try again.');
//             return;
//         }
        
//         this.displayComparison();
//         this.showNotification(`✅ Comparison loaded for ${successCount} stocks`, 'success');
//     },
    
//     async loadComparisonFromSymbols(symbols) {
//         if (!symbols || symbols.length < 2) return;
        
//         this.comparisonSymbols = symbols;
//         this.comparisonData = {};
        
//         this.showNotification(`Loading comparison...`, 'info');
        
//         const results = [];
//         for (const symbol of symbols) {
//             try {
//                 await this.fetchComparisonData(symbol);
//                 results.push({ status: 'fulfilled' });
//             } catch (error) {
//                 console.error(`Failed to load ${symbol}:`, error);
//                 results.push({ status: 'rejected' });
//             }
//         }
        
//         const successCount = results.filter(r => r.status === 'fulfilled').length;
        
//         if (successCount >= 2) {
//             this.displayComparison();
//         }
//     },
    
//     async fetchComparisonData(symbol) {
//         const timeSeries = await this.apiRequest(() => this.getTimeSeriesForPeriod(symbol, this.currentPeriod), 'normal');
//         const quote = await this.apiRequest(() => this.apiClient.getQuote(symbol), 'normal');
        
//         this.comparisonData[symbol] = {
//             prices: timeSeries.data,
//             quote: quote
//         };
//     },
    
//     displayComparison() {
//         const emptyEl = document.getElementById('comparisonEmpty');
//         const containerEl = document.getElementById('comparisonContainer');
        
//         if (emptyEl) emptyEl.classList.add('hidden');
//         if (containerEl) containerEl.classList.remove('hidden');
        
//         this.renderComparisonChips();
//         this.createComparisonChart();
//         this.createComparisonTable();
//     },
    
//     renderComparisonChips() {
//         const container = document.getElementById('comparisonStocks');
//         if (!container) return;
        
//         container.innerHTML = this.comparisonSymbols.map((symbol, index) => {
//             const data = this.comparisonData[symbol];
//             if (!data) return '';
            
//             const prices = data.prices;
//             const firstPrice = prices[0].close;
//             const lastPrice = prices[prices.length - 1].close;
//             const performance = ((lastPrice - firstPrice) / firstPrice) * 100;
//             const perfClass = performance >= 0 ? 'positive' : 'negative';
//             const perfSign = performance >= 0 ? '+' : '';
            
//             return `
//                 <div class='comparison-stock-chip' style='border-color: ${this.comparisonColors[index]}'>
//                     <span class='symbol'>${this.escapeHtml(symbol)}</span>
//                     <span class='performance ${perfClass}'>${perfSign}${performance.toFixed(2)}%</span>
//                     <button class='remove' onclick='MarketData.removeFromComparison("${symbol}")' aria-label='Remove ${symbol}'>
//                         <i class='fas fa-times'></i>
//                     </button>
//                 </div>
//             `;
//         }).join('');
//     },
    
//     removeFromComparison(symbol) {
//         this.comparisonSymbols = this.comparisonSymbols.filter(s => s !== symbol);
//         delete this.comparisonData[symbol];
        
//         this.autoSave();
        
//         if (this.comparisonSymbols.length < 2) {
//             this.clearComparison();
//         } else {
//             this.displayComparison();
//         }
//     },
    
//     clearComparison() {
//         if (this.comparisonSymbols.length > 0 && !confirm('Clear comparison?')) {
//             return;
//         }
        
//         this.comparisonSymbols = [];
//         this.comparisonData = {};
        
//         this.autoSave();
        
//         const emptyEl = document.getElementById('comparisonEmpty');
//         const containerEl = document.getElementById('comparisonContainer');
        
//         if (emptyEl) emptyEl.classList.remove('hidden');
//         if (containerEl) containerEl.classList.add('hidden');
        
//         if (this.charts.comparison) {
//             this.charts.comparison.destroy();
//             this.charts.comparison = null;
//         }
//     },
    
//     calculateMaxDrawdown(prices) {
//         let maxDrawdown = 0;
//         let peak = prices[0];
        
//         for (let i = 1; i < prices.length; i++) {
//             if (prices[i] > peak) {
//                 peak = prices[i];
//             }
//             const drawdown = ((peak - prices[i]) / peak) * 100;
//             if (drawdown > maxDrawdown) {
//                 maxDrawdown = drawdown;
//             }
//         }
        
//         return maxDrawdown;
//     },
    
//     calculateVolatilityFromPrices(prices) {
//         const returns = [];
//         for (let i = 1; i < prices.length; i++) {
//             const ret = (prices[i] - prices[i - 1]) / prices[i - 1];
//             returns.push(ret);
//         }
        
//         const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
//         const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
//         const stdDev = Math.sqrt(variance);
        
//         return stdDev * Math.sqrt(252) * 100;
//     }
    
// });

// // ========== PORTFOLIO MANAGEMENT (CLOUD) ==========

// Object.assign(MarketData, {
    
//     async loadCurrentPortfolio() {
//         console.log('📥 Loading current portfolio...');
        
//         const currentPortfolioName = window.PortfolioManager 
//             ? window.PortfolioManager.getCurrentPortfolio() 
//             : 'default';
        
//         let loadedFromCloud = false;
        
//         if (window.PortfolioManager) {
//             const portfolioData = await window.PortfolioManager.loadFromCloud(currentPortfolioName);
            
//             if (portfolioData) {
//                 console.log('✅ Loaded portfolio from cloud');
//                 this.loadPortfolioData(portfolioData);
//                 loadedFromCloud = true;
//             }
//         }
        
//         if (!loadedFromCloud) {
//             console.log('⚠️ Loading from localStorage (fallback)');
//             this.loadWatchlistFromStorage();
//             this.loadAlertsFromStorage();
//         }
        
//         if (this.watchlist.length > 0) {
//             this.renderWatchlist();
//             this.refreshWatchlist();
//         }
        
//         if (this.alerts.length > 0) {
//             this.renderAlerts();
//         }
//     },
    
//     loadPortfolioData(portfolioData) {
//         if (!portfolioData) return;
        
//         console.log('📥 Loading portfolio data...');
        
//         this.watchlist = portfolioData.watchlist || [];
//         this.alerts = portfolioData.alerts || [];
//         this.comparisonSymbols = portfolioData.comparisonSymbols || [];
        
//         this.renderWatchlist();
//         this.renderAlerts();
        
//         if (this.comparisonSymbols.length >= 2) {
//             this.loadComparisonFromSymbols(this.comparisonSymbols);
//         }
        
//         this.showNotification('Portfolio loaded successfully!', 'success');
//     },
    
//     getCurrentPortfolioData() {
//         return {
//             watchlist: this.watchlist,
//             alerts: this.alerts,
//             comparisonSymbols: this.comparisonSymbols,
//             timestamp: Date.now()
//         };
//     },
    
//     async saveCurrentPortfolio() {
//         const portfolioData = this.getCurrentPortfolioData();
        
//         const currentPortfolioName = window.PortfolioManager 
//             ? window.PortfolioManager.getCurrentPortfolio() 
//             : 'default';
        
//         if (window.PortfolioManager) {
//             const success = await window.PortfolioManager.saveToCloud(currentPortfolioName, portfolioData);
            
//             if (!success) {
//                 this.saveWatchlistToStorage();
//                 this.saveAlertsToStorage();
//                 this.showNotification('Saved locally (cloud save failed)', 'warning');
//             }
//         } else {
//             this.saveWatchlistToStorage();
//             this.saveAlertsToStorage();
//             this.showNotification('Portfolio saved locally!', 'success');
//         }
//     },
    
//     autoSave: (() => {
//         let timeout;
//         return function() {
//             clearTimeout(timeout);
//             timeout = setTimeout(async () => {
//                 await MarketData.saveCurrentPortfolio();
//             }, 2000);
//         };
//     })(),
    
//     exportPortfolioJSON() {
//         const portfolioData = this.getCurrentPortfolioData();
        
//         const exportData = {
//             portfolioName: window.PortfolioManager 
//                 ? window.PortfolioManager.getCurrentPortfolio() 
//                 : 'default',
//             exportDate: new Date().toISOString(),
//             data: portfolioData
//         };
        
//         const json = JSON.stringify(exportData, null, 2);
//         const blob = new Blob([json], { type: 'application/json' });
//         const url = URL.createObjectURL(blob);
//         const a = document.createElement('a');
//         a.href = url;
//         a.download = `market_portfolio_${exportData.portfolioName}_${new Date().toISOString().split('T')[0]}.json`;
//         a.click();
//         URL.revokeObjectURL(url);
        
//         this.showNotification('Portfolio exported successfully!', 'success');
//     },
    
//     importPortfolioJSON() {
//         const input = document.createElement('input');
//         input.type = 'file';
//         input.accept = 'application/json';
//         input.onchange = async (e) => {
//             const file = e.target.files[0];
//             const reader = new FileReader();
//             reader.onload = async (event) => {
//                 try {
//                     const imported = JSON.parse(event.target.result);
                    
//                     let portfolioData;
//                     if (imported.data) {
//                         portfolioData = imported.data;
//                     } else {
//                         portfolioData = imported;
//                     }
                    
//                     this.loadPortfolioData(portfolioData);
//                     await this.saveCurrentPortfolio();
                    
//                     this.showNotification('Portfolio imported successfully!', 'success');
                    
//                 } catch (err) {
//                     console.error('Import error:', err);
//                     this.showNotification('Import error: ' + err.message, 'error');
//                 }
//             };
//             reader.readAsText(file);
//         };
//         input.click();
//     },
    
//     async refreshPortfoliosList() {
//         console.log('🔄 Refreshing portfolios list...');
        
//         const container = document.getElementById('portfoliosListContainer');
//         if (!container) {
//             console.error('❌ portfoliosListContainer not found');
//             return;
//         }
        
//         container.innerHTML = `
//             <div class="loading-simulations">
//                 <i class="fas fa-spinner fa-spin"></i> Loading portfolios...
//             </div>
//         `;
        
//         try {
//             const portfolios = await PortfolioManager.listPortfolios();
//             const currentPortfolio = PortfolioManager.getCurrentPortfolio();
            
//             console.log('📋 Portfolios loaded:', portfolios.length);
            
//             if (portfolios.length === 0) {
//                 container.innerHTML = `
//                     <div class="no-portfolios">
//                         <i class="fas fa-folder-open"></i>
//                         <p>No portfolios found</p>
//                         <p class="hint">Click "New Portfolio" to create one</p>
//                     </div>
//                 `;
//                 return;
//             }
            
//             const portfoliosList = portfolios.map(portfolio => {
//                 const isActive = portfolio.name === currentPortfolio;
//                 const createdDate = portfolio.createdAt 
//                     ? (typeof portfolio.createdAt === 'string' 
//                         ? new Date(portfolio.createdAt).toLocaleDateString('fr-FR', {
//                             year: 'numeric',
//                             month: 'short',
//                             day: 'numeric'
//                         })
//                         : portfolio.createdAt.toDate 
//                             ? portfolio.createdAt.toDate().toLocaleDateString('fr-FR', {
//                                 year: 'numeric',
//                                 month: 'short',
//                                 day: 'numeric'
//                             })
//                             : 'N/A')
//                     : 'N/A';
                
//                 return `
//                     <div class="simulation-item ${isActive ? 'active' : ''}" data-portfolio="${portfolio.name}">
//                         <div class="simulation-info">
//                             <div class="simulation-name">
//                                 <i class="fas fa-folder"></i>
//                                 ${this.escapeHtml(portfolio.name)}
//                                 ${portfolio.name === 'default' ? '<span class="badge-default">DEFAULT</span>' : ''}
//                             </div>
//                             <div class="simulation-meta">
//                                 <span class="creation-date">
//                                     <i class="far fa-calendar"></i>
//                                     Created: ${createdDate}
//                                 </span>
//                                 <span>
//                                     <i class="fas fa-star"></i>
//                                     ${portfolio.watchlist?.length || 0} stocks
//                                 </span>
//                                 <span>
//                                     <i class="fas fa-bell"></i>
//                                     ${portfolio.alerts?.length || 0} alerts
//                                 </span>
//                             </div>
//                         </div>
//                         <div class="simulation-actions">
//                             ${!isActive ? `
//                                 <button class="btn-sm btn-primary" onclick="MarketData.loadPortfolioFromModal('${portfolio.name}')">
//                                     <i class="fas fa-folder-open"></i> Load
//                                 </button>
//                             ` : `
//                                 <button class="btn-sm btn-success" disabled>
//                                     <i class="fas fa-check"></i> Active
//                                 </button>
//                             `}
//                             ${portfolio.name !== 'default' ? `
//                                 <button class="btn-sm btn-secondary" onclick="MarketData.renamePortfolio('${portfolio.name}')">
//                                     <i class="fas fa-edit"></i> Rename
//                                 </button>
//                                 <button class="btn-sm btn-danger" onclick="MarketData.deletePortfolioFromModal('${portfolio.name}')">
//                                     <i class="fas fa-trash"></i> Delete
//                                 </button>
//                             ` : ''}
//                         </div>
//                     </div>
//                 `;
//             }).join('');
            
//             container.innerHTML = `
//                 <div class="simulations-list">
//                     ${portfoliosList}
//                 </div>
//             `;
            
//             console.log('✅ Portfolios list displayed');
            
//         } catch (error) {
//             console.error('❌ Error loading portfolios:', error);
//             container.innerHTML = `
//                 <div class="no-portfolios">
//                     <i class="fas fa-exclamation-triangle"></i>
//                     <p>Error loading portfolios</p>
//                     <p class="hint">${this.escapeHtml(error.message)}</p>
//                 </div>
//             `;
//         }
//     },
    
//     async loadPortfolioFromModal(portfolioName) {
//         console.log(`📂 Loading portfolio "${portfolioName}" from modal...`);
        
//         try {
//             await PortfolioManager.switchPortfolio(portfolioName);
//             await this.loadCurrentPortfolio();
//             await this.refreshPortfoliosList();
            
//             this.showNotification(`Portfolio "${portfolioName}" loaded!`, 'success');
            
//         } catch (error) {
//             console.error('❌ Error loading portfolio:', error);
//             this.showNotification('Error loading portfolio: ' + error.message, 'error');
//         }
//     },
    
//     async deletePortfolioFromModal(portfolioName) {
//         if (!confirm(`Are you sure you want to delete portfolio "${portfolioName}"?`)) {
//             return;
//         }
        
//         console.log(`🗑️ Deleting portfolio "${portfolioName}"...`);
        
//         try {
//             await PortfolioManager.deletePortfolio(portfolioName);
//             await this.refreshPortfoliosList();
            
//             this.showNotification(`Portfolio "${portfolioName}" deleted`, 'success');
            
//         } catch (error) {
//             console.error('❌ Error deleting portfolio:', error);
//             this.showNotification('Error deleting portfolio: ' + error.message, 'error');
//         }
//     },
    
//     async renamePortfolio(oldName) {
//         const newName = prompt(`Rename portfolio "${oldName}" to:`, oldName);
        
//         if (!newName || newName.trim() === '' || newName === oldName) {
//             return;
//         }
        
//         console.log(`✏️ Renaming portfolio "${oldName}" to "${newName}"...`);
        
//         try {
//             const data = await PortfolioManager.loadFromCloud(oldName);
//             data.name = newName;
//             await PortfolioManager.saveToCloud(newName, data);
//             await PortfolioManager.deletePortfolio(oldName);
            
//             if (PortfolioManager.getCurrentPortfolio() === oldName) {
//                 await PortfolioManager.switchPortfolio(newName);
//             }
            
//             await this.refreshPortfoliosList();
            
//             this.showNotification(`Portfolio renamed to "${newName}"`, 'success');
            
//         } catch (error) {
//             console.error('❌ Error renaming portfolio:', error);
//             this.showNotification('Error renaming portfolio: ' + error.message, 'error');
//         }
//     },
    
//     async openPortfoliosModal() {
//         console.log('📂 Opening portfolios modal...');
        
//         const modal = document.getElementById('portfoliosModal');
//         if (modal) {
//             modal.classList.add('active');
//             document.body.style.overflow = 'hidden';
//             await this.refreshPortfoliosList();
//         } else {
//             console.error('❌ portfoliosModal not found');
//         }
//     }
    
// });

// // ========== EVENT LISTENERS ==========

// Object.assign(MarketData, {
    
//     setupEventListeners() {
//         const input = document.getElementById('symbolInput');
//         if (input) {
//             input.addEventListener('keypress', (e) => {
//                 if (e.key === 'Enter') {
//                     e.preventDefault();
//                     this.searchStock();
//                 }
//             });
//         }
        
//         const updateChart = () => this.updateChart();
        
//         document.getElementById('toggleSMA')?.addEventListener('change', updateChart);
//         document.getElementById('toggleEMA')?.addEventListener('change', updateChart);
//         document.getElementById('toggleBB')?.addEventListener('change', updateChart);
//         document.getElementById('toggleVolume')?.addEventListener('change', updateChart);
//     }
    
// });

// // ========== DISPLAY STOCK OVERVIEW ==========

// Object.assign(MarketData, {
    
//     displayStockOverview() {
//         const quote = this.stockData.quote;
        
//         document.getElementById('stockName').textContent = quote.name || this.currentSymbol;
//         document.getElementById('stockSymbol').textContent = quote.symbol || this.currentSymbol;
        
//         const price = quote.price;
//         const change = quote.change;
//         const changePercent = quote.percentChange;
        
//         document.getElementById('currentPrice').textContent = this.formatCurrency(price);
        
//         const priceChangeEl = document.getElementById('priceChange');
//         const changeText = `${change >= 0 ? '+' : ''}${this.formatCurrency(change)} (${change >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)`;
//         priceChangeEl.textContent = changeText;
//         priceChangeEl.className = change >= 0 ? 'price-change positive' : 'price-change negative';
        
//         document.getElementById('statOpen').textContent = this.formatCurrency(quote.open);
//         document.getElementById('statHigh').textContent = this.formatCurrency(quote.high);
//         document.getElementById('statLow').textContent = this.formatCurrency(quote.low);
//         document.getElementById('statVolume').textContent = this.formatVolume(quote.volume);
        
//         if (this.statisticsData) {
//             document.getElementById('statMarketCap').textContent = this.formatLargeNumber(this.statisticsData.marketCap);
//             document.getElementById('statPE').textContent = this.formatRatio(this.statisticsData.trailingPE);
//         } else {
//             document.getElementById('statMarketCap').textContent = 'N/A';
//             document.getElementById('statPE').textContent = 'N/A';
//         }
        
//         document.getElementById('stockOverview').classList.remove('hidden');
//     },
    
//     displayCompanyProfile() {
//         let profileSection = document.getElementById('companyProfileSection');
        
//         if (!profileSection) {
//             const stockOverview = document.getElementById('stockOverview');
//             if (!stockOverview) return;
            
//             profileSection = document.createElement('section');
//             profileSection.id = 'companyProfileSection';
//             profileSection.className = 'company-profile-section card hidden';
//             stockOverview.insertAdjacentElement('afterend', profileSection);
//         }
        
//         if (!this.profileData && !this.statisticsData) {
//             profileSection.classList.add('hidden');
//             return;
//         }
        
//         let html = `
//             <div class='card-header'>
//                 <h2 class='card-title'>
//                     <i class='fas fa-building'></i> Company Information & Statistics
//                 </h2>
//             </div>
//             <div class='card-body'>
//         `;
        
//         if (this.profileData || this.logoUrl) {
//             html += `
//                 <div class='company-accordion'>
//                     <div class='accordion-header' onclick='MarketData.toggleAccordion(this)'>
//                         <span><i class='fas fa-building'></i> Company Information</span>
//                         <i class='fas fa-chevron-down'></i>
//                     </div>
//                     <div class='accordion-content'>
//                         <div class='accordion-body'>
//             `;

//             // Logo désactivé pour économiser l'espace
//             // if (this.logoUrl) {
//             //     html += `
//             //         <div class='company-logo'>
//             //             <img src='${this.escapeHtml(this.logoUrl)}' alt='${this.escapeHtml(this.currentSymbol)} logo' onerror='this.style.display="none"'>
//             //         </div>
//             //     `;
//             // }
            
//             if (this.profileData) {
//                 html += `<div class='company-info-grid'>`;
                
//                 if (this.profileData.sector) {
//                     html += `
//                         <div class='info-item'>
//                             <span class='info-label'><i class='fas fa-industry'></i> Sector</span>
//                             <span class='info-value'>${this.escapeHtml(this.profileData.sector)}</span>
//                         </div>`;
//                 }
                
//                 if (this.profileData.industry) {
//                     html += `
//                         <div class='info-item'>
//                             <span class='info-label'><i class='fas fa-cogs'></i> Industry</span>
//                             <span class='info-value'>${this.escapeHtml(this.profileData.industry)}</span>
//                         </div>`;
//                 }
                
//                 if (this.profileData.country) {
//                     html += `
//                         <div class='info-item'>
//                             <span class='info-label'><i class='fas fa-globe'></i> Country</span>
//                             <span class='info-value'>${this.escapeHtml(this.profileData.country)}</span>
//                         </div>`;
//                 }
                
//                 if (this.profileData.employees) {
//                     html += `
//                         <div class='info-item'>
//                             <span class='info-label'><i class='fas fa-users'></i> Employees</span>
//                             <span class='info-value'>${this.formatNumber(this.profileData.employees)}</span>
//                         </div>`;
//                 }
                
//                 html += `</div>`;
                
//                 if (this.profileData.description && this.profileData.description !== 'No description available') {
//                     html += `
//                         <div class='company-description'>
//                             <h4><i class='fas fa-info-circle'></i> About</h4>
//                             <p>${this.escapeHtml(this.profileData.description)}</p>
//                         </div>
//                     `;
//                 }
//             }
            
//             html += `
//                         </div>
//                     </div>
//                 </div>
//             `;
//         }
        
//         if (this.statisticsData) {
//             html += `
//                 <div class='company-accordion'>
//                     <div class='accordion-header' onclick='MarketData.toggleAccordion(this)'>
//                         <span><i class='fas fa-chart-bar'></i> Fundamental Statistics</span>
//                         <i class='fas fa-chevron-down'></i>
//                     </div>
//                     <div class='accordion-content'>
//                         <div class='accordion-body'>
//                             <div class='stats-category'>
//                                 <h4>Valuation Metrics</h4>
//                                 <div class='stats-grid'>
//                                     ${this.createStatItem('Market Cap', this.formatLargeNumber(this.statisticsData.marketCap))}
//                                     ${this.createStatItem('P/E Ratio', this.formatRatio(this.statisticsData.trailingPE))}
//                                     ${this.createStatItem('Price/Book', this.formatRatio(this.statisticsData.priceToBook))}
//                                     ${this.createStatItem('EV/Revenue', this.formatRatio(this.statisticsData.evToRevenue))}
//                                 </div>
//                             </div>
                            
//                             <div class='stats-category'>
//                                 <h4>Profitability</h4>
//                                 <div class='stats-grid'>
//                                     ${this.createStatItem('Profit Margin', this.formatPercent(this.statisticsData.profitMargin))}
//                                     ${this.createStatItem('ROE', this.formatPercent(this.statisticsData.returnOnEquity))}
//                                     ${this.createStatItem('Revenue', this.formatLargeNumber(this.statisticsData.revenue))}
//                                     ${this.createStatItem('EPS', this.formatCurrency(this.statisticsData.eps))}
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             `;
//         }
        
//         html += `</div>`;
        
//         profileSection.innerHTML = html;
//         profileSection.classList.remove('hidden');
//     },
    
//     createStatItem(label, value) {
//         if (!value || value === 'N/A' || value === '$0' || value === '0' || value === '0%') {
//             return '';
//         }
//         return `
//             <div class='stat-box'>
//                 <div class='label'>${this.escapeHtml(label)}</div>
//                 <div class='value'>${value}</div>
//             </div>
//         `;
//     },
    
//     displayResults() {
//         this.createPriceChart();
//         this.createRSIChart();
//         this.createMACDChart();
//         this.displayTradingSignals();
//         this.displayKeyStatistics();
        
//         document.getElementById('resultsPanel').classList.remove('hidden');
//     }
    
// });

// // ========== CHARTS - PRICE CHART ==========

// Object.assign(MarketData, {
    
//     createPriceChart() {
//         const prices = this.stockData.prices;
//         const ohlc = prices.map(p => [p.timestamp, p.open, p.high, p.low, p.close]);
//         const volume = prices.map(p => [p.timestamp, p.volume]);
        
//         const showSMA = document.getElementById('toggleSMA')?.checked !== false;
//         const showEMA = document.getElementById('toggleEMA')?.checked || false;
//         const showBB = document.getElementById('toggleBB')?.checked !== false;
//         const showVolume = document.getElementById('toggleVolume')?.checked !== false;
        
//         const series = [
//             {
//                 type: 'candlestick',
//                 name: this.currentSymbol,
//                 data: ohlc,
//                 id: 'price',
//                 color: '#ef4444',
//                 upColor: '#10b981'
//             }
//         ];
        
//         if (showSMA) {
//             series.push({
//                 type: 'sma',
//                 linkedTo: 'price',
//                 params: { period: 20 },
//                 color: '#1e5eeb',
//                 lineWidth: 2,
//                 name: 'SMA 20'
//             });
//             series.push({
//                 type: 'sma',
//                 linkedTo: 'price',
//                 params: { period: 50 },
//                 color: '#8b5cf6',
//                 lineWidth: 2,
//                 name: 'SMA 50'
//             });
//         }
        
//         if (showEMA) {
//             series.push({
//                 type: 'ema',
//                 linkedTo: 'price',
//                 params: { period: 12 },
//                 color: '#06b6d4',
//                 lineWidth: 2,
//                 name: 'EMA 12'
//             });
//             series.push({
//                 type: 'ema',
//                 linkedTo: 'price',
//                 params: { period: 26 },
//                 color: '#14b8a6',
//                 lineWidth: 2,
//                 name: 'EMA 26'
//             });
//         }
        
//         if (showBB) {
//             series.push({
//                 type: 'bb',
//                 linkedTo: 'price',
//                 color: '#64748b',
//                 fillOpacity: 0.05,
//                 lineWidth: 1,
//                 name: 'Bollinger Bands'
//             });
//         }
        
//         if (showVolume) {
//             series.push({
//                 type: 'column',
//                 name: 'Volume',
//                 data: volume,
//                 yAxis: 1,
//                 color: '#cbd5e1'
//             });
//         }
        
//         if (this.charts.price) {
//             this.charts.price.destroy();
//         }
        
//         this.charts.price = Highcharts.stockChart('priceChart', {
//             chart: {
//                 height: 600,
//                 borderRadius: 12,
//                 style: {
//                     fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
//                 }
//             },
//             title: {
//                 text: `${this.currentSymbol} Price Chart`,
//                 style: { 
//                     color: '#0f172a',
//                     fontWeight: '600',
//                     fontSize: '1.25rem'
//                 }
//             },
//             rangeSelector: {
//                 selected: 1,
//                 buttonTheme: {
//                     fill: 'white',
//                     stroke: '#e2e8f0',
//                     'stroke-width': 1,
//                     r: 6,
//                     style: {
//                         color: '#475569',
//                         fontWeight: '500'
//                     },
//                     states: {
//                         hover: {
//                             fill: '#f1f5f9'
//                         },
//                         select: {
//                             fill: '#1e5eeb',
//                             style: {
//                                 color: 'white'
//                             }
//                         }
//                     }
//                 }
//             },
//             yAxis: [{
//                 labels: {
//                     align: 'right',
//                     x: -3,
//                     style: {
//                         color: '#475569'
//                     }
//                 },
//                 title: {
//                     text: 'Price',
//                     style: {
//                         color: '#475569'
//                     }
//                 },
//                 height: '75%',
//                 lineWidth: 1,
//                 gridLineColor: '#f1f5f9'
//             }, {
//                 labels: {
//                     align: 'right',
//                     x: -3,
//                     style: {
//                         color: '#475569'
//                     }
//                 },
//                 title: {
//                     text: 'Volume',
//                     style: {
//                         color: '#475569'
//                     }
//                 },
//                 top: '80%',
//                 height: '20%',
//                 offset: 0,
//                 lineWidth: 1,
//                 gridLineColor: '#f1f5f9'
//             }],
//             xAxis: {
//                 gridLineColor: '#f1f5f9'
//             },
//             tooltip: {
//                 split: true,
//                 borderRadius: 8,
//                 borderWidth: 1,
//                 borderColor: '#e2e8f0',
//                 backgroundColor: 'white',
//                 shadow: {
//                     color: 'rgba(0, 0, 0, 0.1)',
//                     offsetX: 0,
//                     offsetY: 2,
//                     width: 4
//                 }
//             },
//             series: series,
//             credits: { enabled: false }
//         });
//     },
    
//     createRSIChart() {
//         const prices = this.stockData.prices;
//         const rsiData = this.calculateRSIArray(prices, 14);
        
//         if (this.charts.rsi) {
//             this.charts.rsi.destroy();
//         }
        
//         this.charts.rsi = Highcharts.chart('rsiChart', {
//             chart: {
//                 borderRadius: 12,
//                 height: 400,
//                 style: {
//                     fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
//                 }
//             },
//             title: {
//                 text: 'RSI Indicator',
//                 style: { 
//                     color: '#0f172a',
//                     fontWeight: '600',
//                     fontSize: '1.125rem'
//                 }
//             },
//             xAxis: {
//                 type: 'datetime',
//                 crosshair: true,
//                 gridLineColor: '#f1f5f9'
//             },
//             yAxis: {
//                 title: { 
//                     text: 'RSI',
//                     style: { color: '#475569' }
//                 },
//                 plotLines: [{
//                     value: 70,
//                     color: '#ef4444',
//                     dashStyle: 'Dash',
//                     width: 2,
//                     label: {
//                         text: 'Overbought (70)',
//                         align: 'right',
//                         style: { color: '#ef4444', fontWeight: '600' }
//                     }
//                 }, {
//                     value: 30,
//                     color: '#10b981',
//                     dashStyle: 'Dash',
//                     width: 2,
//                     label: {
//                         text: 'Oversold (30)',
//                         align: 'right',
//                         style: { color: '#10b981', fontWeight: '600' }
//                     }
//                 }, {
//                     value: 50,
//                     color: '#94a3b8',
//                     dashStyle: 'Dot',
//                     width: 1,
//                     label: {
//                         text: 'Neutral (50)',
//                         align: 'right',
//                         style: { color: '#94a3b8' }
//                     }
//                 }],
//                 min: 0,
//                 max: 100,
//                 gridLineColor: '#f1f5f9'
//             },
//             tooltip: {
//                 borderRadius: 8,
//                 crosshairs: true,
//                 shared: true,
//                 valueDecimals: 2
//             },
//             plotOptions: {
//                 area: {
//                     fillColor: {
//                         linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
//                         stops: [
//                             [0, 'rgba(30, 94, 235, 0.3)'],
//                             [1, 'rgba(30, 94, 235, 0.05)']
//                         ]
//                     },
//                     lineWidth: 2,
//                     marker: {
//                         enabled: false
//                     },
//                     threshold: null
//                 }
//             },
//             series: [{
//                 type: 'area',
//                 name: 'RSI (14)',
//                 data: rsiData,
//                 color: '#1e5eeb',
//                 zones: [{
//                     value: 30,
//                     color: '#10b981'
//                 }, {
//                     value: 70,
//                     color: '#f59e0b'
//                 }, {
//                     color: '#ef4444'
//                 }]
//             }],
//             credits: { enabled: false }
//         });
//     },
    
//     createMACDChart() {
//         const prices = this.stockData.prices;
//         const macdData = this.calculateMACDArray(prices);
        
//         if (this.charts.macd) {
//             this.charts.macd.destroy();
//         }
        
//         this.charts.macd = Highcharts.chart('macdChart', {
//             chart: {
//                 borderRadius: 12,
//                 height: 400,
//                 style: {
//                     fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
//                 }
//             },
//             title: {
//                 text: 'MACD Indicator',
//                 style: { 
//                     color: '#0f172a',
//                     fontWeight: '600',
//                     fontSize: '1.125rem'
//                 }
//             },
//             xAxis: {
//                 type: 'datetime',
//                 crosshair: true,
//                 gridLineColor: '#f1f5f9'
//             },
//             yAxis: {
//                 title: { 
//                     text: 'MACD',
//                     style: { color: '#475569' }
//                 },
//                 plotLines: [{
//                     value: 0,
//                     color: '#94a3b8',
//                     dashStyle: 'Dash',
//                     width: 2,
//                     label: {
//                         text: 'Zero Line',
//                         align: 'right',
//                         style: { color: '#94a3b8' }
//                     }
//                 }],
//                 gridLineColor: '#f1f5f9'
//             },
//             tooltip: {
//                 borderRadius: 8,
//                 crosshairs: true,
//                 shared: true,
//                 valueDecimals: 2
//             },
//             plotOptions: {
//                 column: {
//                     borderRadius: '25%'
//                 }
//             },
//             series: [{
//                 type: 'line',
//                 name: 'MACD Line',
//                 data: macdData.macd,
//                 color: '#1e5eeb',
//                 lineWidth: 2,
//                 marker: {
//                     enabled: false
//                 }
//             }, {
//                 type: 'line',
//                 name: 'Signal Line',
//                 data: macdData.signal,
//                 color: '#8b5cf6',
//                 lineWidth: 2,
//                 marker: {
//                     enabled: false
//                 }
//             }, {
//                 type: 'column',
//                 name: 'Histogram',
//                 data: macdData.histogram,
//                 color: '#64748b',
//                 pointWidth: 3
//             }],
//             credits: { enabled: false }
//         });
//     },
    
//     createComparisonChart() {
//         const series = [];
        
//         this.comparisonSymbols.forEach((symbol, index) => {
//             const data = this.comparisonData[symbol];
//             if (!data) return;
            
//             const firstPrice = data.prices[0].close;
//             const normalizedData = data.prices.map(p => [
//                 p.timestamp,
//                 (p.close / firstPrice) * 100
//             ]);
            
//             series.push({
//                 name: symbol,
//                 data: normalizedData,
//                 color: this.comparisonColors[index],
//                 lineWidth: 2,
//                 marker: {
//                     enabled: false,
//                     radius: 3
//                 }
//             });
//         });
        
//         if (this.charts.comparison) {
//             this.charts.comparison.destroy();
//         }
        
//         this.charts.comparison = Highcharts.stockChart('comparisonChart', {
//             chart: {
//                 height: 500,
//                 borderRadius: 12,
//                 style: {
//                     fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
//                 }
//             },
//             title: {
//                 text: 'Stock Performance Comparison (Normalized)',
//                 style: { 
//                     color: '#0f172a',
//                     fontWeight: '600',
//                     fontSize: '1.25rem'
//                 }
//             },
//             subtitle: {
//                 text: 'All stocks start at 100 for easy comparison',
//                 style: { 
//                     color: '#64748b',
//                     fontSize: '0.875rem'
//                 }
//             },
//             rangeSelector: {
//                 selected: 1,
//                 buttonTheme: {
//                     fill: 'white',
//                     stroke: '#e2e8f0',
//                     'stroke-width': 1,
//                     r: 6,
//                     style: {
//                         color: '#475569',
//                         fontWeight: '500'
//                     },
//                     states: {
//                         hover: {
//                             fill: '#f1f5f9'
//                         },
//                         select: {
//                             fill: '#1e5eeb',
//                             style: {
//                                 color: 'white'
//                             }
//                         }
//                     }
//                 }
//             },
//             yAxis: {
//                 title: {
//                     text: 'Performance (Base 100)',
//                     style: { color: '#475569' }
//                 },
//                 plotLines: [{
//                     value: 100,
//                     color: '#94a3b8',
//                     dashStyle: 'Dash',
//                     width: 1,
//                     label: {
//                         text: 'Start (100)',
//                         align: 'right',
//                         style: { color: '#94a3b8' }
//                     }
//                 }],
//                 gridLineColor: '#f1f5f9'
//             },
//             xAxis: {
//                 gridLineColor: '#f1f5f9'
//             },
//             tooltip: {
//                 shared: true,
//                 crosshairs: true,
//                 borderRadius: 8,
//                 borderWidth: 1,
//                 borderColor: '#e2e8f0',
//                 backgroundColor: 'white',
//                 shadow: {
//                     color: 'rgba(0, 0, 0, 0.1)',
//                     offsetX: 0,
//                     offsetY: 2,
//                     width: 4
//                 },
//                 valueDecimals: 2,
//                 pointFormatter: function() {
//                     const change = this.y - 100;
//                     const changeSign = change >= 0 ? '+' : '';
//                     const color = change >= 0 ? '#10b981' : '#ef4444';
//                     return `<span style="color:${this.color}">●</span> ${this.series.name}: <b>${this.y.toFixed(2)}</b> (<span style="color:${color}">${changeSign}${change.toFixed(2)}%</span>)<br/>`;
//                 }
//             },
//             legend: {
//                 enabled: true,
//                 align: 'center',
//                 verticalAlign: 'bottom',
//                 itemStyle: {
//                     color: '#475569',
//                     fontWeight: '500'
//                 }
//             },
//             series: series,
//             credits: { enabled: false }
//         });
//     },
    
//     createComparisonTable() {
//         const metrics = [];
        
//         this.comparisonSymbols.forEach(symbol => {
//             const data = this.comparisonData[symbol];
//             if (!data) return;
            
//             const prices = data.prices.map(p => p.close);
//             const firstPrice = prices[0];
//             const lastPrice = prices[prices.length - 1];
            
//             const totalReturn = ((lastPrice - firstPrice) / firstPrice) * 100;
//             const volatility = this.calculateVolatilityFromPrices(prices);
//             const maxPrice = Math.max(...prices);
//             const minPrice = Math.min(...prices);
//             const maxDrawdown = this.calculateMaxDrawdown(prices);
//             const sharpeRatio = volatility > 0 ? totalReturn / volatility : 0;
            
//             metrics.push({
//                 symbol: symbol,
//                 name: data.quote.name || symbol,
//                 currentPrice: data.quote.price,
//                 totalReturn: totalReturn,
//                 volatility: volatility,
//                 maxPrice: maxPrice,
//                 minPrice: minPrice,
//                 maxDrawdown: maxDrawdown,
//                 sharpeRatio: sharpeRatio
//             });
//         });
        
//         const bestReturn = Math.max(...metrics.map(m => m.totalReturn));
//         const worstReturn = Math.min(...metrics.map(m => m.totalReturn));
//         const lowestVol = Math.min(...metrics.map(m => m.volatility));
//         const bestSharpe = Math.max(...metrics.map(m => m.sharpeRatio));
        
//         const tableHTML = `
//             <table>
//                 <thead>
//                     <tr>
//                         <th>Symbol</th>
//                         <th>Current Price</th>
//                         <th>Total Return</th>
//                         <th>Volatility</th>
//                         <th>Max Drawdown</th>
//                         <th>Sharpe Ratio</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     ${metrics.map(m => `
//                         <tr>
//                             <td class='metric-label'>${this.escapeHtml(m.symbol)}</td>
//                             <td>${this.formatCurrency(m.currentPrice)}</td>
//                             <td class='${m.totalReturn === bestReturn ? 'best-value' : m.totalReturn === worstReturn ? 'worst-value' : ''} ${m.totalReturn >= 0 ? 'value-positive' : 'value-negative'}'>
//                                 ${m.totalReturn >= 0 ? '+' : ''}${m.totalReturn.toFixed(2)}%
//                             </td>
//                             <td class='${m.volatility === lowestVol ? 'best-value' : ''} value-neutral'>
//                                 ${m.volatility.toFixed(2)}%
//                             </td>
//                             <td class='value-negative'>
//                                 -${m.maxDrawdown.toFixed(2)}%
//                             </td>
//                             <td class='${m.sharpeRatio === bestSharpe ? 'best-value' : ''} value-neutral'>
//                                 ${m.sharpeRatio.toFixed(2)}
//                             </td>
//                         </tr>
//                     `).join('')}
//                 </tbody>
//             </table>
//         `;
        
//         const tableContainer = document.getElementById('comparisonTable');
//         if (tableContainer) {
//             tableContainer.innerHTML = tableHTML;
//         }
//     }
    
// });

// // ========== TECHNICAL INDICATORS CALCULATIONS ==========

// Object.assign(MarketData, {
    
//     calculateRSIArray(prices, period = 14) {
//         const rsiData = [];
        
//         if (prices.length < period + 1) {
//             return rsiData;
//         }
        
//         let gains = 0;
//         let losses = 0;
        
//         for (let i = 1; i <= period; i++) {
//             const change = prices[i].close - prices[i - 1].close;
//             if (change > 0) gains += change;
//             else losses += Math.abs(change);
//         }
        
//         let avgGain = gains / period;
//         let avgLoss = losses / period;
        
//         const rs = avgGain / avgLoss;
//         const rsi = 100 - (100 / (1 + rs));
//         rsiData.push([prices[period].timestamp, rsi]);
        
//         for (let i = period + 1; i < prices.length; i++) {
//             const change = prices[i].close - prices[i - 1].close;
            
//             if (change > 0) {
//                 avgGain = ((avgGain * (period - 1)) + change) / period;
//                 avgLoss = (avgLoss * (period - 1)) / period;
//             } else {
//                 avgGain = (avgGain * (period - 1)) / period;
//                 avgLoss = ((avgLoss * (period - 1)) + Math.abs(change)) / period;
//             }
            
//             const currentRS = avgGain / avgLoss;
//             const currentRSI = 100 - (100 / (1 + currentRS));
//             rsiData.push([prices[i].timestamp, currentRSI]);
//         }
        
//         return rsiData;
//     },
    
//     calculateRSI(prices, period = 14) {
//         if (prices.length < period + 1) return null;
        
//         let gains = 0;
//         let losses = 0;
        
//         for (let i = 1; i <= period; i++) {
//             const change = prices[i].close - prices[i - 1].close;
//             if (change > 0) gains += change;
//             else losses += Math.abs(change);
//         }
        
//         let avgGain = gains / period;
//         let avgLoss = losses / period;
        
//         for (let i = period + 1; i < prices.length; i++) {
//             const change = prices[i].close - prices[i - 1].close;
//             if (change > 0) {
//                 avgGain = ((avgGain * (period - 1)) + change) / period;
//                 avgLoss = (avgLoss * (period - 1)) / period;
//             } else {
//                 avgGain = (avgGain * (period - 1)) / period;
//                 avgLoss = ((avgLoss * (period - 1)) + Math.abs(change)) / period;
//             }
//         }
        
//         const rs = avgGain / avgLoss;
//         const rsi = 100 - (100 / (1 + rs));
        
//         return rsi;
//     },
    
//     calculateMACDArray(prices, shortPeriod = 12, longPeriod = 26, signalPeriod = 9) {
//         const closePrices = prices.map(p => p.close);
        
//         const emaShort = this.calculateEMAArray(closePrices, shortPeriod);
//         const emaLong = this.calculateEMAArray(closePrices, longPeriod);
        
//         const macdLine = [];
//         for (let i = longPeriod - 1; i < prices.length; i++) {
//             const macdValue = emaShort[i] - emaLong[i];
//             macdLine.push(macdValue);
//         }
        
//         const signalLine = this.calculateEMAArray(macdLine, signalPeriod);
        
//         const macdData = [];
//         const signalData = [];
//         const histogramData = [];
        
//         const startIndex = longPeriod - 1 + signalPeriod - 1;
        
//         for (let i = startIndex; i < prices.length; i++) {
//             const timestamp = prices[i].timestamp;
//             const macdIndex = i - (longPeriod - 1);
//             const signalIndex = macdIndex - (signalPeriod - 1);
            
//             if (signalIndex >= 0 && signalIndex < signalLine.length) {
//                 const macdVal = macdLine[macdIndex];
//                 const signalVal = signalLine[signalIndex];
//                 const histogramVal = macdVal - signalVal;
                
//                 macdData.push([timestamp, macdVal]);
//                 signalData.push([timestamp, signalVal]);
//                 histogramData.push([timestamp, histogramVal]);
//             }
//         }
        
//         return {
//             macd: macdData,
//             signal: signalData,
//             histogram: histogramData
//         };
//     },
    
//     calculateEMAArray(data, period) {
//         const k = 2 / (period + 1);
//         const emaArray = [];
        
//         for (let i = 0; i < period - 1; i++) {
//             emaArray[i] = undefined;
//         }
        
//         let sum = 0;
//         for (let i = 0; i < period; i++) {
//             sum += data[i];
//         }
//         emaArray[period - 1] = sum / period;
        
//         for (let i = period; i < data.length; i++) {
//             const ema = data[i] * k + emaArray[i - 1] * (1 - k);
//             emaArray[i] = ema;
//         }
        
//         return emaArray;
//     },
    
//     displayTradingSignals() {
//         const prices = this.stockData.prices;
//         const currentPrice = prices[prices.length - 1].close;
//         const rsi = this.calculateRSI(prices);
        
//         const sma20 = this.calculateSMA(prices, 20);
//         const sma50 = this.calculateSMA(prices, 50);
        
//         const signals = [];
        
//         let rsiSignal = 'neutral';
//         let rsiStatus = 'Neutral';
//         if (rsi < 30) {
//             rsiSignal = 'bullish';
//             rsiStatus = 'Oversold - Buy Signal';
//         } else if (rsi > 70) {
//             rsiSignal = 'bearish';
//             rsiStatus = 'Overbought - Sell Signal';
//         }
        
//         signals.push({
//             title: 'RSI Signal',
//             value: rsi.toFixed(2),
//             status: rsiStatus,
//             type: rsiSignal
//         });
        
//         let maSignal = 'neutral';
//         let maStatus = 'Neutral';
//         if (currentPrice > sma20 && sma20 > sma50) {
//             maSignal = 'bullish';
//             maStatus = 'Bullish Trend';
//         } else if (currentPrice < sma20 && sma20 < sma50) {
//             maSignal = 'bearish';
//             maStatus = 'Bearish Trend';
//         }
        
//         signals.push({
//             title: 'Moving Average',
//             value: currentPrice > sma20 ? 'Above SMA' : 'Below SMA',
//             status: maStatus,
//             type: maSignal
//         });
        
//         const priceChange = ((currentPrice - prices[0].close) / prices[0].close) * 100;
//         signals.push({
//             title: 'Overall Trend',
//             value: `${priceChange > 0 ? '+' : ''}${priceChange.toFixed(2)}%`,
//             status: priceChange > 5 ? 'Strong Uptrend' : priceChange < -5 ? 'Strong Downtrend' : 'Sideways',
//             type: priceChange > 0 ? 'bullish' : priceChange < 0 ? 'bearish' : 'neutral'
//         });
        
//         const volatility = this.calculateVolatility(prices);
//         signals.push({
//             title: 'Volatility',
//             value: `${volatility.toFixed(2)}%`,
//             status: volatility > 3 ? 'High' : volatility > 1.5 ? 'Moderate' : 'Low',
//             type: 'neutral'
//         });
        
//         const container = document.getElementById('tradingSignals');
//         container.innerHTML = signals.map(signal => `
//             <div class='signal-card ${signal.type}'>
//                 <div class='signal-title'>${this.escapeHtml(signal.title)}</div>
//                 <div class='signal-value'>${this.escapeHtml(signal.value)}</div>
//                 <div class='signal-status'>${this.escapeHtml(signal.status)}</div>
//             </div>
//         `).join('');
//     },
    
//     displayKeyStatistics() {
//         const prices = this.stockData.prices;
//         const quote = this.stockData.quote;
        
//         const stats = [];
        
//         const high52w = quote.fiftyTwoWeekHigh || Math.max(...prices.map(p => p.high));
//         const low52w = quote.fiftyTwoWeekLow || Math.min(...prices.map(p => p.low));
        
//         stats.push({ label: '52W High', value: this.formatCurrency(high52w) });
//         stats.push({ label: '52W Low', value: this.formatCurrency(low52w) });
        
//         const avgVolume = quote.averageVolume || (prices.reduce((sum, p) => sum + p.volume, 0) / prices.length);
//         stats.push({ label: 'Avg Volume', value: this.formatVolume(avgVolume) });
        
//         const volatility = this.calculateVolatility(prices);
//         stats.push({ label: 'Volatility', value: `${volatility.toFixed(2)}%` });
        
//         if (this.statisticsData && this.statisticsData.beta) {
//             stats.push({ label: 'Beta', value: this.formatRatio(this.statisticsData.beta) });
//         } else {
//             stats.push({ label: 'Beta', value: 'N/A' });
//         }
        
//         const returns = [];
//         for (let i = 1; i < prices.length; i++) {
//             returns.push((prices[i].close - prices[i-1].close) / prices[i-1].close);
//         }
//         const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
//         const annualizedReturn = avgReturn * 252 * 100;
//         const sharpeRatio = volatility > 0 ? (annualizedReturn / volatility) : 0;
        
//         stats.push({ label: 'Sharpe Ratio', value: sharpeRatio.toFixed(2) });
        
//         const container = document.getElementById('keyStats');
//         container.innerHTML = stats.map(stat => `
//             <div class='stat-box'>
//                 <div class='label'>${this.escapeHtml(stat.label)}</div>
//                 <div class='value'>${this.escapeHtml(stat.value)}</div>
//             </div>
//         `).join('');
//     },
    
//     calculateSMA(prices, period) {
//         if (prices.length < period) return 0;
//         const sum = prices.slice(-period).reduce((acc, p) => acc + p.close, 0);
//         return sum / period;
//     },
    
//     calculateVolatility(prices) {
//         const returns = [];
//         for (let i = 1; i < prices.length; i++) {
//             const ret = (prices[i].close - prices[i - 1].close) / prices[i - 1].close;
//             returns.push(ret);
//         }
        
//         const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
//         const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
//         const stdDev = Math.sqrt(variance);
        
//         return stdDev * Math.sqrt(252) * 100;
//     }
    
// });

// // ========== UTILITY FUNCTIONS ==========

// Object.assign(MarketData, {
    
//     formatCurrency(value) {
//         if (!value && value !== 0) return 'N/A';
//         return new Intl.NumberFormat('en-US', {
//             style: 'currency',
//             currency: 'USD',
//             minimumFractionDigits: 2,
//             maximumFractionDigits: 2
//         }).format(value);
//     },
    
//     formatVolume(value) {
//         if (!value) return 'N/A';
//         if (value >= 1e9) return (value / 1e9).toFixed(2) + 'B';
//         if (value >= 1e6) return (value / 1e6).toFixed(2) + 'M';
//         if (value >= 1e3) return (value / 1e3).toFixed(2) + 'K';
//         return value.toFixed(0);
//     },
    
//     formatLargeNumber(value) {
//         if (!value) return 'N/A';
//         if (value >= 1e12) return '$' + (value / 1e12).toFixed(2) + 'T';
//         if (value >= 1e9) return '$' + (value / 1e9).toFixed(2) + 'B';
//         if (value >= 1e6) return '$' + (value / 1e6).toFixed(2) + 'M';
//         if (value >= 1e3) return '$' + (value / 1e3).toFixed(2) + 'K';
//         return '$' + value.toFixed(0);
//     },
    
//     formatNumber(value) {
//         if (!value || value === 'N/A') return 'N/A';
//         if (typeof value === 'string') value = parseInt(value);
//         return new Intl.NumberFormat('en-US').format(value);
//     },
    
//     formatPercent(value) {
//         if (!value && value !== 0) return 'N/A';
//         return (value * 100).toFixed(2) + '%';
//     },
    
//     formatRatio(value) {
//         if (!value && value !== 0) return 'N/A';
//         return value.toFixed(2);
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
//         const overview = document.getElementById('stockOverview');
//         const results = document.getElementById('resultsPanel');
//         const profile = document.getElementById('companyProfileSection');
        
//         if (overview) overview.classList.add('hidden');
//         if (results) results.classList.add('hidden');
//         if (profile) profile.classList.add('hidden');
//     },
    
//     updateLastUpdate() {
//         const el = document.getElementById('lastUpdate');
//         if (!el) return;
        
//         const now = new Date();
//         const formatted = now.toLocaleString('fr-FR', {
//             day: '2-digit',
//             month: '2-digit',
//             year: 'numeric',
//             hour: '2-digit',
//             minute: '2-digit'
//         });
//         el.textContent = `Last update: ${formatted}`;
//     },
    
//     showNotification(message, type = 'info') {
//         if (window.FinanceDashboard && window.FinanceDashboard.showNotification) {
//             window.FinanceDashboard.showNotification(message, type);
//         } else {
//             console.log(`[${type.toUpperCase()}]`, message);
//         }
//     }
    
// });

// // ========== INITIALIZE WHEN DOM IS LOADED ==========

// document.addEventListener('DOMContentLoaded', () => {
//     MarketData.init();
// });

// // ========== EXPOSITION GLOBALE ==========
// window.MarketData = MarketData;

// console.log('✅ Market Data script loaded - OPTIMIZED with Rate Limiting & Cache - COMPLETE VERSION');

/* ==============================================
   MARKET-DATA.JS v7.0 - QUOTES ONLY (FINNHUB)
   NO HISTORICAL DATA - REAL-TIME QUOTES ONLY
   Compatible avec api-client.js v5.0
   ============================================== */

// ========== RATE LIMITER ==========
class RateLimiter {
    constructor(maxRequests = 50, windowMs = 60000) {
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

// ========== CACHE OPTIMISÉ ==========
class OptimizedCache {
    constructor() {
        this.prefix = 'md_cache_';
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

// ========== MAIN MARKET DATA OBJECT ==========
const MarketData = {
    // API Client
    apiClient: null,
    rateLimiter: null,
    optimizedCache: null,
    
    // Current State
    currentSymbol: '',
    currentQuote: null,
    profileData: null,
    logoUrl: '',
    
    // Search functionality
    selectedSuggestionIndex: -1,
    searchTimeout: null,
    
    // Watchlist & Alerts
    watchlist: [],
    alerts: [],
    watchlistRefreshInterval: null,
    notificationPermission: false,
    lastWatchlistRefresh: 0,
    
    // Market Data
    allStocks: [],
    filteredStocks: [],
    currentPage: 1,
    pageSize: 100,
    sortColumn: 'symbol',
    sortDirection: 'asc',
    loadedStocksCount: 0,
    totalStocksToLoad: 30,
    
    // ✅ INDICES MAJEURS (ETFs)
    majorIndices: [
        { symbol: 'SPY', name: 'S&P 500 ETF', icon: 'chart-line', htmlId: 'sp500' },
        { symbol: 'QQQ', name: 'NASDAQ ETF', icon: 'microchip', htmlId: 'nasdaq' },
        { symbol: 'DIA', name: 'Dow Jones ETF', icon: 'landmark', htmlId: 'dow' },
        { symbol: 'VIXY', name: 'VIX ETF', icon: 'bolt', htmlId: 'vix' }
    ],
    
    // ✅ STOCKS PAR DÉFAUT (30 stocks)
    defaultStocks: [
        'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META', 'BRK.B', 'V', 'JNJ',
        'WMT', 'JPM', 'MA', 'PG', 'UNH', 'DIS', 'HD', 'BAC', 'XOM', 'ADBE',
        'CSCO', 'PFE', 'VZ', 'KO', 'CRM', 'NFLX', 'INTC', 'PEP', 'TMO', 'ABT'
    ],
    
    // ✅ STOCKS ADDITIONNELS
    additionalStocks: [
        'COST', 'AVGO', 'ACN', 'CMCSA', 'NKE', 'MRK', 'DHR', 'TXN', 'LIN', 'NEE',
        'AMD', 'ORCL', 'CVX', 'PM', 'MDT', 'UNP', 'RTX', 'HON', 'QCOM', 'UPS',
        'LOW', 'AMGN', 'SBUX', 'BMY', 'LMT', 'IBM', 'SPGI', 'CAT', 'GE', 'AXP',
        'BA', 'GS', 'BLK', 'GILD', 'BKNG', 'DE', 'MMM', 'ADP', 'TGT', 'ISRG',
        'MDLZ', 'CVS', 'CI', 'ZTS', 'SYK', 'MO', 'PYPL', 'NOW', 'REGN', 'DUK',
        'CB', 'TJX', 'PLD', 'USB', 'BDX', 'SO', 'SCHW', 'SLB', 'EL', 'PNC',
        'CL', 'ITW', 'MMC', 'NSC', 'BSX', 'EOG', 'GM', 'F', 'COIN', 'UBER'
    ],
    
    // Secteurs
    sectors: {
        'Technology': ['AAPL', 'MSFT', 'GOOGL', 'NVDA', 'META', 'ADBE', 'CSCO', 'INTC', 'AMD', 'ORCL'],
        'Healthcare': ['JNJ', 'UNH', 'PFE', 'ABT', 'TMO', 'MRK', 'DHR', 'BMY', 'AMGN', 'GILD'],
        'Financial': ['JPM', 'BAC', 'WFC', 'GS', 'MS', 'C', 'AXP', 'BLK', 'USB', 'PNC'],
        'Consumer': ['AMZN', 'WMT', 'HD', 'COST', 'NKE', 'SBUX', 'TGT', 'LOW', 'TJX', 'BKNG'],
        'Energy': ['XOM', 'CVX', 'COP', 'SLB', 'EOG', 'MPC', 'PSX', 'VLO', 'KMI', 'OXY'],
        'Industrial': ['BA', 'CAT', 'GE', 'HON', 'UNP', 'RTX', 'LMT', 'MMM', 'DE', 'NSC']
    },
    
    // ========== INITIALIZATION ==========
    
    async init() {
        try {
            console.log('🚀 Initializing Market Data v7.0 - Quotes Only (Finnhub)...');
            
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
            this.setupSearchListeners();
            this.setupTableListeners();
            this.startCacheMonitoring();
            
            // ✅ NE PAS charger la watchlist automatiquement
            // await this.loadCurrentPortfolio();
            this.loadWatchlistFromStorage();
            this.loadAlertsFromStorage();
            
            this.requestNotificationPermission();
            this.startWatchlistAutoRefresh();
            
            // ========== CHARGEMENT INITIAL ==========
            console.log('🌍 Step 1: Loading Market Overview (ETFs)...');
            await this.refreshMarketOverview();
            
            console.log('📊 Step 2: Loading Initial Stocks (30 stocks)...');
            await this.loadInitialStocks();
            
            console.log('🔥 Step 3: Loading Top Movers...');
            await this.loadTopMovers();
            
            console.log('📈 Step 4: Loading Sector Performance...');
            await this.loadSectorPerformance();
            
            console.log('🗺 Step 5: Loading Heat Map...');
            await this.loadHeatMap();
            
            console.log('✅ All market data sections initialized');
            
        } catch (error) {
            console.error('Initialization error:', error);
            this.showNotification('Failed to initialize application', 'error');
        }
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
    
    async waitForAuth() {
        return new Promise((resolve) => {
            if (!firebase || !firebase.auth) {
                console.warn('⚠ Firebase not available');
                resolve();
                return;
            }
            
            const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
                if (user) {
                    console.log('✅ User authenticated for Market Data');
                    unsubscribe();
                    resolve();
                }
            });
            
            setTimeout(() => {
                resolve();
            }, 3000);
        });
    },
    
    // ========== MARKET OVERVIEW ==========
    
    async refreshMarketOverview() {
        console.log('🌍 Refreshing Market Overview with ETFs...');
        
        try {
            const promises = this.majorIndices.map(async (index) => {
                try {
                    const quote = await this.apiRequest(() => this.apiClient.getQuote(index.symbol), 'high');
                    return { ...index, quote };
                } catch (error) {
                    console.error(`Error loading ${index.symbol}:`, error.message);
                    return { ...index, quote: null };
                }
            });
            
            const results = await Promise.all(promises);
            
            results.forEach((result) => {
                this.updateIndexCard(result);
            });
            
            // Mettre à jour les stats globales (simulation)
            this.updateMarketStats({
                totalVolume: '12.5B',
                advancing: '2,847',
                declining: '1,253',
                new52wHighs: '342'
            });
            
            this.showNotification('✅ Market overview refreshed', 'success');
            
        } catch (error) {
            console.error('Error refreshing market overview:', error);
            this.showNotification('Failed to refresh market overview', 'error');
        }
    },
    
    updateIndexCard(indexData) {
        const card = document.getElementById(`index-${indexData.htmlId}`);
        if (!card) {
            console.warn(`❌ Index card not found: index-${indexData.htmlId}`);
            return;
        }
        
        if (!indexData.quote) {
            console.warn(`⚠ No quote data for ${indexData.symbol}`);
            return;
        }
        
        const priceEl = card.querySelector('.index-price');
        const changeEl = card.querySelector('.index-change');
        
        const price = indexData.quote.price || 0;
        const change = indexData.quote.change || 0;
        const changePercent = indexData.quote.percentChange || 0;
        
        if (priceEl) {
            priceEl.textContent = this.formatCurrency(price);
        }
        
        if (changeEl) {
            const changeClass = change >= 0 ? 'positive' : 'negative';
            changeEl.className = `index-change ${changeClass}`;
            changeEl.textContent = `${change >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`;
        }
        
        console.log(`✅ Updated index card: ${indexData.symbol} (${indexData.htmlId})`);
    },
    
    updateMarketStats(stats) {
        const elements = {
            totalVolume: document.getElementById('totalVolume'),
            advancingStocks: document.getElementById('advancingStocks'),
            decliningStocks: document.getElementById('decliningStocks'),
            new52wHighs: document.getElementById('new52wHighs')
        };
        
        if (elements.totalVolume) elements.totalVolume.textContent = stats.totalVolume;
        if (elements.advancingStocks) elements.advancingStocks.textContent = stats.advancing;
        if (elements.decliningStocks) elements.decliningStocks.textContent = stats.declining;
        if (elements.new52wHighs) elements.new52wHighs.textContent = stats.new52wHighs;
    },
    
    // ========== LOAD INITIAL STOCKS ==========
    
    async loadInitialStocks() {
        console.log('📊 Loading initial 30 stocks...');
        
        const tbody = document.getElementById('stocksTableBody');
        if (!tbody) {
            console.error('❌ Table body element not found');
            return;
        }
        
        tbody.innerHTML = `
            <tr class='loading-row'>
                <td colspan='10' style='text-align: center; padding: 60px;'>
                    <i class='fas fa-spinner fa-spin' style='font-size: 2rem; color: var(--ml-primary);'></i>
                    <p style='margin-top: 20px;'>Loading market data...</p>
                </td>
            </tr>
        `;
        
        try {
            this.allStocks = [];
            this.loadedStocksCount = 0;
            
            // Charger par batch de 5 stocks
            const batchSize = 5;
            const stocksToLoad = this.defaultStocks.slice(0, this.totalStocksToLoad);
            
            for (let i = 0; i < stocksToLoad.length; i += batchSize) {
                const batch = stocksToLoad.slice(i, i + batchSize);
                
                console.log(`📦 Loading batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(stocksToLoad.length/batchSize)}: ${batch.join(', ')}...`);
                
                const batchPromises = batch.map(async (symbol) => {
                    try {
                        // Vérifier le cache d'abord
                        const cached = this.optimizedCache.get(`stock_${symbol}`);
                        if (cached && this.optimizedCache.getAge(`stock_${symbol}`) < 300000) {
                            console.log(`✅ ${symbol} from cache`);
                            return cached;
                        }
                        
                        // Appel API avec rate limiting
                        const quote = await this.apiRequest(() => this.apiClient.getQuote(symbol), 'normal');
                        
                        const stockData = {
                            symbol: symbol,
                            name: quote.name || symbol,
                            price: quote.price || 0,
                            change: quote.change || 0,
                            changePercent: quote.percentChange || 0,
                            volume: quote.volume || 0,
                            marketCap: this.calculateMarketCap(quote.price, quote.volume),
                            pe: 0,
                            sector: this.getSectorForSymbol(symbol)
                        };
                        
                        // Sauvegarder en cache
                        this.optimizedCache.set(`stock_${symbol}`, stockData, 300000);
                        
                        console.log(`✅ ${symbol} loaded`);
                        return stockData;
                        
                    } catch (error) {
                        console.error(`❌ Error loading ${symbol}:`, error.message);
                        return null;
                    }
                });
                
                const batchResults = await Promise.all(batchPromises);
                const validResults = batchResults.filter(stock => stock !== null);
                
                this.allStocks.push(...validResults);
                this.loadedStocksCount += validResults.length;
                
                // Afficher progressivement
                this.filteredStocks = [...this.allStocks];
                this.renderStocksTable();
                
                console.log(`✅ Progress: ${this.loadedStocksCount}/${stocksToLoad.length} stocks loaded`);
            }
            
            console.log(`✅ Initial load complete: ${this.loadedStocksCount} stocks`);
            
            if (this.allStocks.length > 0) {
                this.showNotification(`✅ Loaded ${this.allStocks.length} stocks`, 'success');
                this.showLoadMoreButton();
            } else {
                this.showNotification('❌ Failed to load stocks', 'error');
            }
            
        } catch (error) {
            console.error('❌ Critical error loading stocks:', error);
            tbody.innerHTML = `
                <tr>
                    <td colspan='10' style='text-align: center; padding: 40px; color: var(--ml-danger);'>
                        <i class='fas fa-exclamation-triangle'></i> Error: ${error.message}
                    </td>
                </tr>
            `;
            this.showNotification('❌ Error loading stocks', 'error');
        }
    },
    
    calculateMarketCap(price, volume) {
        // Estimation simplifiée : price * volume * 10
        if (!price || !volume) return 0;
        return price * volume * 10;
    },
    
    showLoadMoreButton() {
        const container = document.querySelector('.live-stocks-table .card-body');
        if (!container) return;
        
        let loadMoreBtn = document.getElementById('loadMoreStocksBtn');
        
        if (!loadMoreBtn) {
            loadMoreBtn = document.createElement('div');
            loadMoreBtn.id = 'loadMoreStocksBtn';
            loadMoreBtn.className = 'load-more-container';
            loadMoreBtn.style.cssText = 'text-align: center; padding: 20px; margin-top: 20px;';
            loadMoreBtn.innerHTML = `
                <button class='btn btn-primary' onclick='MarketData.loadMoreStocks()' style='padding: 12px 32px; font-size: 1.1rem;'>
                    <i class='fas fa-plus-circle'></i> Load More Stocks (${this.additionalStocks.length} remaining)
                </button>
            `;
            
            const pagination = document.getElementById('tablePagination');
            if (pagination) {
                pagination.parentNode.insertBefore(loadMoreBtn, pagination);
            } else {
                container.appendChild(loadMoreBtn);
            }
        }
    },
    
    async loadMoreStocks() {
        const loadMoreBtn = document.getElementById('loadMoreStocksBtn');
        if (loadMoreBtn) {
            loadMoreBtn.innerHTML = `
                <button class='btn btn-secondary' disabled style='padding: 12px 32px;'>
                    <i class='fas fa-spinner fa-spin'></i> Loading...
                </button>
            `;
        }
        
        const batchSize = 20;
        const nextBatch = this.additionalStocks.slice(0, batchSize);
        
        console.log(`📦 Loading ${nextBatch.length} additional stocks...`);
        
        for (let i = 0; i < nextBatch.length; i += 5) {
            const batch = nextBatch.slice(i, i + 5);
            
            const batchPromises = batch.map(async (symbol) => {
                try {
                    const cached = this.optimizedCache.get(`stock_${symbol}`);
                    if (cached && this.optimizedCache.getAge(`stock_${symbol}`) < 300000) {
                        return cached;
                    }
                    
                    const quote = await this.apiRequest(() => this.apiClient.getQuote(symbol), 'normal');
                    
                    const stockData = {
                        symbol: symbol,
                        name: quote.name || symbol,
                        price: quote.price || 0,
                        change: quote.change || 0,
                        changePercent: quote.percentChange || 0,
                        volume: quote.volume || 0,
                        marketCap: this.calculateMarketCap(quote.price, quote.volume),
                        pe: 0,
                        sector: this.getSectorForSymbol(symbol)
                    };
                    
                    this.optimizedCache.set(`stock_${symbol}`, stockData, 300000);
                    return stockData;
                    
                } catch (error) {
                    console.error(`❌ Error loading ${symbol}:`, error.message);
                    return null;
                }
            });
            
            const batchResults = await Promise.all(batchPromises);
            const validResults = batchResults.filter(stock => stock !== null);
            
            this.allStocks.push(...validResults);
            this.filteredStocks = [...this.allStocks];
            this.renderStocksTable();
        }
        
        this.additionalStocks = this.additionalStocks.slice(batchSize);
        
        if (this.additionalStocks.length === 0) {
            if (loadMoreBtn) {
                loadMoreBtn.innerHTML = `
                    <button class='btn btn-success' disabled style='padding: 12px 32px;'>
                        <i class='fas fa-check-circle'></i> All Stocks Loaded
                    </button>
                `;
            }
        } else {
            if (loadMoreBtn) {
                loadMoreBtn.innerHTML = `
                    <button class='btn btn-primary' onclick='MarketData.loadMoreStocks()' style='padding: 12px 32px; font-size: 1.1rem;'>
                        <i class='fas fa-plus-circle'></i> Load More Stocks (${this.additionalStocks.length} remaining)
                    </button>
                `;
            }
        }
        
        this.showNotification(`✅ Loaded ${nextBatch.length} more stocks`, 'success');
    },
    
    getSectorForSymbol(symbol) {
        for (const [sector, symbols] of Object.entries(this.sectors)) {
            if (symbols.includes(symbol)) {
                return sector;
            }
        }
        return 'Other';
    },
    
    renderStocksTable() {
        const tbody = document.getElementById('stocksTableBody');
        const stockCount = document.getElementById('stockCount');
        const pageInfo = document.getElementById('pageInfo');
        
        if (!tbody) return;
        
        const totalStocks = this.filteredStocks.length;
        const totalPages = Math.ceil(totalStocks / this.pageSize);
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = Math.min(startIndex + this.pageSize, totalStocks);
        const currentPageStocks = this.filteredStocks.slice(startIndex, endIndex);
        
        if (stockCount) {
            stockCount.textContent = `(${totalStocks} stocks)`;
        }
        
        if (pageInfo) {
            pageInfo.textContent = `Page ${this.currentPage} of ${totalPages}`;
        }
        
        if (currentPageStocks.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan='10' style='text-align: center; padding: 40px;'>
                        <i class='fas fa-search' style='font-size: 2rem; opacity: 0.3;'></i>
                        <p style='margin-top: 15px; color: var(--text-secondary);'>No stocks found</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = currentPageStocks.map(stock => {
            const changeClass = stock.change >= 0 ? 'positive' : 'negative';
            const rowClass = stock.change >= 0 ? 'positive' : 'negative';
            
            return `
                <tr class='${rowClass}'>
                    <td><strong>${this.escapeHtml(stock.symbol)}</strong></td>
                    <td class='stock-name-cell' title='${this.escapeHtml(stock.name)}'>${this.escapeHtml(stock.name)}</td>
                    <td class='stock-price'>${this.formatCurrency(stock.price)}</td>
                    <td class='stock-change-${changeClass}'>${stock.change >= 0 ? '+' : ''}${this.formatCurrency(stock.change)}</td>
                    <td class='stock-change-${changeClass}'><strong>${stock.changePercent >= 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%</strong></td>
                    <td>${this.formatVolume(stock.volume)}</td>
                    <td>${this.formatLargeNumber(stock.marketCap)}</td>
                    <td>N/A</td>
                    <td><em style="color: #94a3b8; font-size: 0.85rem;">Real-time only</em></td>
                    <td>
                        <div class='stock-actions'>
                            <button class='btn-table-action btn-view' onclick='MarketData.viewStock("${stock.symbol}")' title='View Details'>
                                <i class='fas fa-eye'></i>
                            </button>
                            <button class='btn-table-action btn-watchlist' onclick='MarketData.quickAddToWatchlist("${stock.symbol}", "${this.escapeHtml(stock.name)}")' title='Add to Watchlist'>
                                <i class='fas fa-star'></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    },
    
    viewStock(symbol) {
        this.showNotification(`📊 ${symbol} - Real-time quote view (historical charts removed)`, 'info');
        // Afficher une modal avec les détails du quote
        this.loadSymbolQuote(symbol);
    },
    
    async loadSymbolQuote(symbol) {
        console.log(`📊 Loading quote for: ${symbol}`);
        
        try {
            const quote = await this.apiRequest(() => this.apiClient.getQuote(symbol), 'high');
            const profile = await this.apiRequest(() => this.apiClient.getProfile(symbol), 'normal');
            
            this.currentSymbol = symbol;
            this.currentQuote = quote;
            this.profileData = profile;
            
            // Afficher un résumé dans une notification
            const summary = `
                ${symbol} - ${quote.name}
                Price: ${this.formatCurrency(quote.price)}
                Change: ${quote.changePercent >= 0 ? '+' : ''}${quote.changePercent.toFixed(2)}%
                Volume: ${this.formatVolume(quote.volume)}
            `;
            
            console.log(summary);
            this.showNotification(`✅ ${symbol} quote loaded`, 'success');
            
        } catch (error) {
            console.error('Error loading quote:', error);
            this.showNotification(`Failed to load ${symbol}`, 'error');
        }
    },
    
    quickAddToWatchlist(symbol, name) {
        if (this.watchlist.some(item => item.symbol === symbol)) {
            this.showNotification(`${symbol} is already in your watchlist`, 'info');
            return;
        }
        
        const watchlistItem = {
            symbol: symbol,
            name: name,
            addedAt: Date.now()
        };
        
        this.watchlist.push(watchlistItem);
        this.saveWatchlistToStorage();
        this.autoSave();
        this.renderWatchlist();
        this.refreshSingleWatchlistItem(symbol);
        
        this.showNotification(`✅ ${symbol} added to watchlist`, 'success');
    },
    
    // ========== TABLE CONTROLS ==========
    
    setupTableListeners() {
        const headers = document.querySelectorAll('.stocks-table th[data-sort]');
        headers.forEach(header => {
            header.addEventListener('click', () => {
                const column = header.dataset.sort;
                this.sortTable(column);
            });
        });
    },
    
    sortTable(column) {
        if (this.sortColumn === column) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = column;
            this.sortDirection = 'asc';
        }
        
        this.filteredStocks.sort((a, b) => {
            let valA = a[column];
            let valB = b[column];
            
            if (typeof valA === 'string') {
                valA = valA.toLowerCase();
                valB = valB.toLowerCase();
            }
            
            if (this.sortDirection === 'asc') {
                return valA > valB ? 1 : -1;
            } else {
                return valA < valB ? 1 : -1;
            }
        });
        
        document.querySelectorAll('.stocks-table th').forEach(th => {
            th.classList.remove('sorted-asc', 'sorted-desc');
        });
        
        const header = document.querySelector(`th[data-sort="${column}"]`);
        if (header) {
            header.classList.add(`sorted-${this.sortDirection}`);
        }
        
        this.currentPage = 1;
        this.renderStocksTable();
    },
    
    changePageSize(size) {
        this.pageSize = parseInt(size);
        this.currentPage = 1;
        this.renderStocksTable();
    },
    
    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderStocksTable();
        }
    },
    
    nextPage() {
        const totalPages = Math.ceil(this.filteredStocks.length / this.pageSize);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.renderStocksTable();
        }
    },
    
    exportToCSV() {
        const headers = ['Symbol', 'Name', 'Price', 'Change', 'Change %', 'Volume', 'Market Cap'];
        const rows = this.filteredStocks.map(stock => [
            stock.symbol,
            stock.name,
            stock.price,
            stock.change,
            stock.changePercent,
            stock.volume,
            stock.marketCap
        ]);
        
        const csv = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `market-data-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showNotification('✅ CSV exported successfully', 'success');
    },
    
    // ========== SCREENER FILTERS ==========
    
    resetFilters() {
        const filterIds = ['filterSearch', 'filterSector', 'filterMarketCap', 'filterPerformance', 'filterPE'];
        filterIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        
        this.applyFilters();
    },
    
    applyFilters() {
        const search = (document.getElementById('filterSearch')?.value || '').toLowerCase();
        const sector = document.getElementById('filterSector')?.value || '';
        const marketCap = document.getElementById('filterMarketCap')?.value || '';
        
        this.filteredStocks = this.allStocks.filter(stock => {
            if (search && !stock.symbol.toLowerCase().includes(search) && !stock.name.toLowerCase().includes(search)) {
                return false;
            }
            
            if (sector && stock.sector !== sector) {
                return false;
            }
            
            if (marketCap) {
                const cap = stock.marketCap;
                if (marketCap === 'mega' && cap < 200e9) return false;
                if (marketCap === 'large' && (cap < 10e9 || cap >= 200e9)) return false;
                if (marketCap === 'mid' && (cap < 2e9 || cap >= 10e9)) return false;
                if (marketCap === 'small' && (cap < 300e6 || cap >= 2e9)) return false;
                if (marketCap === 'micro' && cap >= 300e6) return false;
            }
            
            return true;
        });
        
        this.currentPage = 1;
        this.renderStocksTable();
        
        this.showNotification(`✅ ${this.filteredStocks.length} stocks match filters`, 'success');
    },
    
    // ========== TOP MOVERS ==========
    
    async loadTopMovers() {
        console.log('🔥 Loading Top Movers...');
        
        try {
            const maxWaitTime = 30000;
            const startTime = Date.now();
            
            while (this.allStocks.length === 0) {
                if (Date.now() - startTime > maxWaitTime) {
                    console.error('❌ Timeout waiting for allStocks to load');
                    this.renderMoversError('Timeout: stocks data not loaded');
                    return;
                }
                
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
            const sorted = [...this.allStocks].sort((a, b) => b.changePercent - a.changePercent);
            
            const topGainers = sorted.slice(0, 10);
            const topLosers = sorted.slice(-10).reverse();
            const mostActive = [...this.allStocks].sort((a, b) => b.volume - a.volume).slice(0, 10);
            
            this.renderMovers('topGainers', topGainers, 'positive');
            this.renderMovers('topLosers', topLosers, 'negative');
            this.renderMovers('mostActive', mostActive, 'active');
            
            console.log('✅ Top Movers loaded');
            
        } catch (error) {
            console.error('❌ Error loading top movers:', error);
            this.renderMoversError(error.message);
        }
    },
    
    renderMoversError(message) {
        ['topGainers', 'topLosers', 'mostActive'].forEach(containerId => {
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = `
                    <div class='movers-loading' style='color: var(--ml-danger);'>
                        <i class='fas fa-exclamation-triangle'></i> ${message}
                    </div>
                `;
            }
        });
    },
    
    renderMovers(containerId, stocks, type) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        if (stocks.length === 0) {
            container.innerHTML = `
                <div class='movers-loading'>
                    <i class='fas fa-spinner fa-spin'></i> Loading...
                </div>
            `;
            return;
        }
        
        container.innerHTML = stocks.map(stock => {
            const changeClass = stock.change >= 0 ? 'positive' : 'negative';
            
            return `
                <div class='mover-item' onclick='MarketData.viewStock("${stock.symbol}")'>
                    <div class='mover-info'>
                        <div class='mover-symbol'>${this.escapeHtml(stock.symbol)}</div>
                        <div class='mover-name'>${this.escapeHtml(stock.name)}</div>
                    </div>
                    <div class='mover-data'>
                        <div class='mover-price'>${this.formatCurrency(stock.price)}</div>
                        <div class='mover-change ${changeClass}'>
                            ${stock.changePercent >= 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },
    
    // ========== SECTOR PERFORMANCE ==========
    
    async loadSectorPerformance() {
        console.log('📈 Loading Sector Performance...');
        
        try {
            const maxWaitTime = 30000;
            const startTime = Date.now();
            
            while (this.allStocks.length === 0) {
                if (Date.now() - startTime > maxWaitTime) {
                    console.error('❌ Timeout waiting for allStocks');
                    return;
                }
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
            const sectorPerformance = {};
            
            Object.keys(this.sectors).forEach(sector => {
                const sectorStocks = this.allStocks.filter(stock => stock.sector === sector);
                
                if (sectorStocks.length > 0) {
                    const avgPerformance = sectorStocks.reduce((sum, stock) => sum + stock.changePercent, 0) / sectorStocks.length;
                    sectorPerformance[sector] = avgPerformance;
                }
            });
            
            if (typeof Highcharts !== 'undefined') {
                this.createSectorChart(sectorPerformance);
            } else {
                console.warn('⚠ Highcharts not loaded');
            }
            
            console.log('✅ Sector Performance loaded');
            
        } catch (error) {
            console.error('❌ Error loading sector performance:', error);
        }
    },
    
    createSectorChart(sectorPerformance) {
        const container = document.getElementById('sectorChart');
        if (!container) return;
        
        const sectors = Object.keys(sectorPerformance);
        const performances = Object.values(sectorPerformance);
        
        Highcharts.chart('sectorChart', {
            chart: {
                type: 'bar',
                backgroundColor: 'transparent',
                height: 400
            },
            title: { text: null },
            xAxis: {
                categories: sectors,
                labels: { style: { color: '#64748b', fontWeight: '600' } }
            },
            yAxis: {
                title: { text: 'Performance (%)', style: { color: '#64748b' } },
                labels: { format: '{value}%', style: { color: '#64748b' } }
            },
            legend: { enabled: false },
            plotOptions: {
                bar: {
                    borderRadius: 8,
                    dataLabels: {
                        enabled: true,
                        format: '{y:.2f}%',
                        style: { fontWeight: '700' }
                    },
                    colorByPoint: true
                }
            },
            colors: performances.map(perf => perf >= 0 ? '#10b981' : '#ef4444'),
            series: [{ name: 'Performance', data: performances }],
            credits: { enabled: false }
        });
    },
    
    // ========== HEAT MAP ==========
    
    async loadHeatMap() {
        console.log('🗺 Loading Heat Map...');
        
        try {
            const maxWaitTime = 30000;
            const startTime = Date.now();
            
            while (this.allStocks.length === 0) {
                if (Date.now() - startTime > maxWaitTime) {
                    console.error('❌ Timeout waiting for allStocks');
                    return;
                }
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
            const heatmapData = [];
            
            Object.entries(this.sectors).forEach(([sector, symbols]) => {
                const sectorStocks = this.allStocks.filter(stock => symbols.includes(stock.symbol));
                
                sectorStocks.forEach(stock => {
                    if (stock.marketCap > 0) {
                        heatmapData.push({
                            name: stock.symbol,
                            value: stock.marketCap,
                            colorValue: stock.changePercent
                        });
                    }
                });
            });
            
            if (heatmapData.length > 0 && typeof Highcharts !== 'undefined') {
                this.createHeatMapChart(heatmapData);
                console.log(`✅ Heat Map loaded with ${heatmapData.length} stocks`);
            } else {
                console.warn('⚠ No valid data for heat map');
            }
            
        } catch (error) {
            console.error('❌ Error loading heat map:', error);
        }
    },
    
    createHeatMapChart(data) {
        const container = document.getElementById('heatMapChart');
        if (!container) return;
        
        Highcharts.chart('heatMapChart', {
            chart: {
                type: 'treemap',
                backgroundColor: 'transparent',
                height: 600
            },
            title: { text: null },
            colorAxis: {
                minColor: '#ef4444',
                maxColor: '#10b981',
                labels: { format: '{value}%' }
            },
            tooltip: {
                pointFormat: '<b>{point.name}</b><br/>Market Cap: ${point.value:,.0f}<br/>Change: {point.colorValue:.2f}%'
            },
            series: [{
                type: 'treemap',
                layoutAlgorithm: 'squarified',
                data: data,
                dataLabels: {
                    enabled: true,
                    format: '{point.name}',
                    style: { fontSize: '12px', fontWeight: '700', textOutline: '2px rgba(0, 0, 0, 0.5)' }
                },
                levels: [{
                    level: 1,
                    dataLabels: { enabled: true },
                    borderWidth: 3,
                    borderColor: 'rgba(255, 255, 255, 0.3)'
                }]
            }],
            credits: { enabled: false }
        });
    },
    
    // ========== WATCHLIST & ALERTS ==========
    
    loadWatchlistFromStorage() {
        try {
            const saved = localStorage.getItem('market_watchlist');
            if (saved) {
                this.watchlist = JSON.parse(saved);
                this.renderWatchlist();
            }
        } catch (error) {
            console.error('Error loading watchlist:', error);
        }
    },
    
    loadAlertsFromStorage() {
        try {
            const savedAlerts = localStorage.getItem('market_alerts');
            if (savedAlerts) {
                this.alerts = JSON.parse(savedAlerts);
                this.renderAlerts();
            }
        } catch (error) {
            console.error('Error loading alerts:', error);
        }
    },
    
    saveWatchlistToStorage() {
        try {
            localStorage.setItem('market_watchlist', JSON.stringify(this.watchlist));
        } catch (error) {
            console.error('Error saving watchlist:', error);
        }
    },
    
    saveAlertsToStorage() {
        try {
            localStorage.setItem('market_alerts', JSON.stringify(this.alerts));
        } catch (error) {
            console.error('Error saving alerts:', error);
        }
    },
    
    addToWatchlist() {
        const symbol = this.currentSymbol;
        
        if (!symbol) {
            this.showNotification('Please select a stock first', 'error');
            return;
        }
        
        if (this.watchlist.some(item => item.symbol === symbol)) {
            this.showNotification(`${symbol} is already in your watchlist`, 'info');
            return;
        }
        
        const watchlistItem = {
            symbol: symbol,
            name: this.profileData?.name || symbol,
            addedAt: Date.now()
        };
        
        this.watchlist.push(watchlistItem);
        this.saveWatchlistToStorage();
        this.autoSave();
        this.renderWatchlist();
        this.refreshSingleWatchlistItem(symbol);
        
        this.showNotification(`✅ ${symbol} added to watchlist`, 'success');
    },
    
    removeFromWatchlist(symbol) {
        this.watchlist = this.watchlist.filter(item => item.symbol !== symbol);
        this.saveWatchlistToStorage();
        this.autoSave();
        this.renderWatchlist();
        
        this.showNotification(`${symbol} removed from watchlist`, 'info');
    },
    
    renderWatchlist() {
        const container = document.getElementById('watchlistContainer');
        if (!container) return;
        
        if (this.watchlist.length === 0) {
            container.innerHTML = `
                <div class='watchlist-empty'>
                    <i class='fas fa-star' style='font-size: 3rem; opacity: 0.2;'></i>
                    <p>Your watchlist is empty</p>
                    <p class='text-secondary'>Add stocks to track them here</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.watchlist.map(item => `
            <div class='watchlist-item' id='watchlist-${item.symbol}'>
                <div class='watchlist-info' onclick='MarketData.viewStock("${item.symbol}")'>
                    <div class='watchlist-symbol'>${item.symbol}</div>
                    <div class='watchlist-name'>${this.escapeHtml(item.name)}</div>
                </div>
                <div class='watchlist-data'>
                    <div class='watchlist-price'>--</div>
                    <div class='watchlist-change'>--</div>
                </div>
                <button class='btn-remove-watchlist' onclick='MarketData.removeFromWatchlist("${item.symbol}")' title='Remove'>
                    <i class='fas fa-times'></i>
                </button>
            </div>
        `).join('');
    },
    
    async refreshWatchlist() {
        if (this.watchlist.length === 0) return;
        
        const now = Date.now();
        if (now - this.lastWatchlistRefresh < 30000) {
            console.log('⏳ Watchlist refresh throttled');
            return;
        }
        
        this.lastWatchlistRefresh = now;
        
        console.log('🔄 Refreshing watchlist...');
        
        for (const item of this.watchlist) {
            await this.refreshSingleWatchlistItem(item.symbol);
        }
        
        this.showNotification('✅ Watchlist refreshed', 'success');
    },
    
    async refreshSingleWatchlistItem(symbol) {
        try {
            const quote = await this.apiRequest(() => this.apiClient.getQuote(symbol), 'low');
            
            const itemEl = document.getElementById(`watchlist-${symbol}`);
            if (!itemEl) return;
            
            const priceEl = itemEl.querySelector('.watchlist-price');
            const changeEl = itemEl.querySelector('.watchlist-change');
            
            if (priceEl) {
                priceEl.textContent = this.formatCurrency(quote.price);
            }
            
            if (changeEl) {
                const changeClass = quote.change >= 0 ? 'positive' : 'negative';
                changeEl.className = `watchlist-change ${changeClass}`;
                changeEl.textContent = `${quote.percentChange >= 0 ? '+' : ''}${quote.percentChange.toFixed(2)}%`;
            }
            
            this.checkAlertsForSymbol(symbol, quote.price);
            
        } catch (error) {
            console.error(`Error refreshing ${symbol}:`, error);
        }
    },
    
    startWatchlistAutoRefresh() {
        this.watchlistRefreshInterval = setInterval(() => {
            this.refreshWatchlist();
        }, 120000);
    },
    
    createAlert() {
        const symbol = this.currentSymbol;
        
        if (!symbol) {
            this.showNotification('Please select a stock first', 'error');
            return;
        }
        
        const price = prompt(`Enter target price for ${symbol}:`);
        if (!price || isNaN(parseFloat(price))) return;
        
        const condition = confirm('Alert when price goes ABOVE this level?\n(Cancel = below)') ? 'above' : 'below';
        
        const alert = {
            id: Date.now(),
            symbol: symbol,
            condition: condition,
            targetPrice: parseFloat(price),
            createdAt: Date.now(),
            triggered: false
        };
        
        this.alerts.push(alert);
        this.saveAlertsToStorage();
        this.renderAlerts();
        
        this.showNotification(`✅ Alert created for ${symbol}`, 'success');
    },
    
    removeAlert(alertId) {
        this.alerts = this.alerts.filter(alert => alert.id !== alertId);
        this.saveAlertsToStorage();
        this.renderAlerts();
        
        this.showNotification('Alert removed', 'info');
    },
    
    renderAlerts() {
        const container = document.getElementById('alertsContainer');
        if (!container) return;
        
        if (this.alerts.length === 0) {
            container.innerHTML = `
                <div class='alerts-empty'>
                    <i class='fas fa-bell' style='font-size: 3rem; opacity: 0.2;'></i>
                    <p>No alerts set</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.alerts.map(alert => `
            <div class='alert-item ${alert.triggered ? 'triggered' : ''}'>
                <div class='alert-info'>
                    <div class='alert-symbol'>${alert.symbol}</div>
                    <div class='alert-condition'>
                        ${alert.condition === 'above' ? '▲' : '▼'} 
                        ${alert.condition} ${this.formatCurrency(alert.targetPrice)}
                    </div>
                </div>
                <button class='btn-remove-alert' onclick='MarketData.removeAlert(${alert.id})' title='Remove'>
                    <i class='fas fa-times'></i>
                </button>
            </div>
        `).join('');
    },
    
    checkAlertsForSymbol(symbol, currentPrice) {
        this.alerts.forEach(alert => {
            if (alert.symbol === symbol && !alert.triggered) {
                const triggered = (alert.condition === 'above' && currentPrice >= alert.targetPrice) ||
                                (alert.condition === 'below' && currentPrice <= alert.targetPrice);
                
                if (triggered) {
                    alert.triggered = true;
                    this.saveAlertsToStorage();
                    this.renderAlerts();
                    
                    const message = `${symbol} ${alert.condition} ${this.formatCurrency(alert.targetPrice)}! Current: ${this.formatCurrency(currentPrice)}`;
                    this.showNotification(message, 'success');
                    this.sendBrowserNotification('Price Alert', message);
                }
            }
        });
    },
    
    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                this.notificationPermission = permission === 'granted';
            });
        } else if ('Notification' in window) {
            this.notificationPermission = Notification.permission === 'granted';
        }
    },
    
    sendBrowserNotification(title, body) {
        if (!this.notificationPermission) return;
        
        try {
            new Notification(title, {
                body: body,
                icon: '/assets/images/logo.png',
                badge: '/assets/images/badge.png'
            });
        } catch (error) {
            console.warn('Browser notification error:', error);
        }
    },
    
    // ========== EVENT LISTENERS ==========
    
    setupEventListeners() {
        // Filter inputs with debounce
        ['filterSearch', 'filterSector', 'filterMarketCap'].forEach(filterId => {
            const filterEl = document.getElementById(filterId);
            if (filterEl) {
                filterEl.addEventListener('input', this.debounce(() => this.applyFilters(), 500));
            }
        });
    },
    
    setupSearchListeners() {
        const searchInput = document.getElementById('symbolInput');
        if (!searchInput) return;
        
        searchInput.addEventListener('input', (e) => {
            clearTimeout(this.searchTimeout);
            
            const query = e.target.value.trim();
            if (query.length < 1) {
                this.hideSearchSuggestions();
                return;
            }
            
            this.searchTimeout = setTimeout(() => {
                this.showSearchSuggestions(query);
            }, 300);
        });
        
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                this.hideSearchSuggestions();
            }
        });
    },
    
    showSearchSuggestions(query) {
        const suggestions = this.searchStocks(query);
        
        if (suggestions.length === 0) {
            this.hideSearchSuggestions();
            return;
        }
        
        let container = document.getElementById('searchSuggestions');
        if (!container) {
            container = document.createElement('div');
            container.id = 'searchSuggestions';
            container.className = 'search-suggestions';
            const searchContainer = document.querySelector('.search-input-wrapper');
            if (searchContainer) {
                searchContainer.appendChild(container);
            }
        }
        
        container.innerHTML = suggestions.map((stock, index) => `
            <div class='search-suggestion-item ${index === this.selectedSuggestionIndex ? 'selected' : ''}' 
                 onclick='MarketData.viewStock("${stock.symbol}")'>
                <div class='suggestion-symbol'>${stock.symbol}</div>
                <div class='suggestion-name'>${this.escapeHtml(stock.name)}</div>
            </div>
        `).join('');
        
        container.style.display = 'block';
    },
    
    hideSearchSuggestions() {
        const container = document.getElementById('searchSuggestions');
        if (container) {
            container.style.display = 'none';
        }
        this.selectedSuggestionIndex = -1;
    },
    
    searchStocks(query) {
        query = query.toLowerCase();
        
        return this.allStocks
            .filter(stock => 
                stock.symbol.toLowerCase().includes(query) || 
                stock.name.toLowerCase().includes(query)
            )
            .slice(0, 10);
    },
    
    // ========== AUTO-SAVE ==========
    
    async autoSave() {
        if (!firebase || !firebase.auth || !firebase.firestore) {
            console.warn('⚠ Firebase not available for auto-save');
            return;
        }
        
        const user = firebase.auth().currentUser;
        if (!user) {
            console.warn('⚠ User not authenticated for auto-save');
            return;
        }
        
        try {
            const db = firebase.firestore();
            const docRef = db.collection('users').doc(user.uid).collection('market-data').doc('portfolio');
            
            await docRef.set({
                watchlist: this.watchlist,
                alerts: this.alerts,
                lastUpdate: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            
            console.log('✅ Portfolio auto-saved');
            
        } catch (error) {
            console.error('Auto-save error:', error);
        }
    },
    
    // ========== HELPER FUNCTIONS ==========
    
    formatCurrency(value) {
        if (value === null || value === undefined || isNaN(value)) return 'N/A';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    },
    
    formatVolume(value) {
        if (!value || isNaN(value)) return 'N/A';
        
        if (value >= 1e9) {
            return (value / 1e9).toFixed(2) + 'B';
        } else if (value >= 1e6) {
            return (value / 1e6).toFixed(2) + 'M';
        } else if (value >= 1e3) {
            return (value / 1e3).toFixed(2) + 'K';
        }
        return value.toLocaleString();
    },
    
    formatLargeNumber(value) {
        if (!value || isNaN(value)) return 'N/A';
        
        if (value >= 1e12) {
            return '$' + (value / 1e12).toFixed(2) + 'T';
        } else if (value >= 1e9) {
            return '$' + (value / 1e9).toFixed(2) + 'B';
        } else if (value >= 1e6) {
            return '$' + (value / 1e6).toFixed(2) + 'M';
        } else if (value >= 1e3) {
            return '$' + (value / 1e3).toFixed(2) + 'K';
        }
        return '$' + value.toLocaleString();
    },
    
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    showLoading(show) {
        const loader = document.getElementById('loadingIndicator');
        if (loader) {
            loader.style.display = show ? 'flex' : 'none';
        }
    },
    
    updateLastUpdate() {
        const element = document.getElementById('lastUpdate');
        if (element) {
            const now = new Date();
            element.textContent = `Last update: ${now.toLocaleTimeString()}`;
        }
    },
    
    showNotification(message, type = 'info') {
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }
};

// ========== INITIALIZATION ON LOAD ==========
document.addEventListener('DOMContentLoaded', () => {
    MarketData.init();
});

// ========== GLOBAL EXPORT ==========
window.MarketData = MarketData;

console.log('📊 market-data.js v7.0 loaded - Quotes Only (Finnhub)');