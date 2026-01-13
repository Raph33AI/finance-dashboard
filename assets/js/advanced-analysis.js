/* ==============================================
   ADVANCED-ANALYSIS.JS - LEGAL COMPLIANT VERSION
   ✅ INDICATEURS TECHNIQUES PURS UNIQUEMENT
   ❌ AUCUN GRAPHIQUE DE PRIX (Conforme ToS)
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

// ========== COMPANY LOGOS SYSTEM (AUTONOMOUS) ==========
const CompanyLogos = {
    // ✅ Mapping des domaines principaux (Top 100 entreprises)
    companyDomains: {
        'AAPL': 'apple.com',
        'MSFT': 'microsoft.com',
        'GOOGL': 'abc.xyz',
        'GOOG': 'abc.xyz',
        'AMZN': 'amazon.com',
        'META': 'meta.com',
        'TSLA': 'tesla.com',
        'NVDA': 'nvidia.com',
        'NFLX': 'netflix.com',
        'ADBE': 'adobe.com',
        'CRM': 'salesforce.com',
        'ORCL': 'oracle.com',
        'INTC': 'intel.com',
        'AMD': 'amd.com',
        'QCOM': 'qualcomm.com',
        'AVGO': 'broadcom.com',
        'TXN': 'ti.com',
        'CSCO': 'cisco.com',
        'IBM': 'ibm.com',
        'ACN': 'accenture.com',
        'NOW': 'servicenow.com',
        'INTU': 'intuit.com',
        'PYPL': 'paypal.com',
        'SQ': 'squareup.com',
        'SNOW': 'snowflake.com',
        'PLTR': 'palantir.com',
        'ZM': 'zoom.us',
        'SHOP': 'shopify.com',
        'UBER': 'uber.com',
        'LYFT': 'lyft.com',
        'ABNB': 'airbnb.com',
        'DASH': 'doordash.com',
        'SNAP': 'snap.com',
        'PINS': 'pinterest.com',
        'SPOT': 'spotify.com',
        'RBLX': 'roblox.com',
        'U': 'unity.com',
        'JPM': 'jpmorganchase.com',
        'BAC': 'bankofamerica.com',
        'WFC': 'wellsfargo.com',
        'C': 'citigroup.com',
        'GS': 'goldmansachs.com',
        'MS': 'morganstanley.com',
        'V': 'visa.com',
        'MA': 'mastercard.com',
        'COIN': 'coinbase.com',
        'JNJ': 'jnj.com',
        'UNH': 'unitedhealthgroup.com',
        'PFE': 'pfizer.com',
        'LLY': 'lilly.com',
        'ABBV': 'abbvie.com',
        'MRK': 'merck.com',
        'ABT': 'abbott.com',
        'TMO': 'thermofisher.com',
        'WMT': 'walmart.com',
        'COST': 'costco.com',
        'HD': 'homedepot.com',
        'TGT': 'target.com',
        'NKE': 'nike.com',
        'KO': 'coca-colacompany.com',
        'PEP': 'pepsico.com',
        'MCD': 'mcdonalds.com',
        'SBUX': 'starbucks.com',
        'XOM': 'exxonmobil.com',
        'CVX': 'chevron.com',
        'BA': 'boeing.com',
        'CAT': 'caterpillar.com',
        'HON': 'honeywell.com',
        'GE': 'ge.com',
        'SAP': 'sap.com',
        'ASML': 'asml.com',
        'LVMUY': 'lvmh.com',
        'NVO': 'novonordisk.com',
        'SHEL': 'shell.com',
        'BP': 'bp.com',
        'BABA': 'alibaba.com',
        'TCEHY': 'tencent.com',
        'TSM': 'tsmc.com',
        'SONY': 'sony.com',
        'TM': 'toyota.com',
        'DIS': 'thewaltdisneycompany.com',
        'CMCSA': 'comcastcorporation.com',
        'VZ': 'verizon.com',
        'T': 'att.com',
        'TMUS': 't-mobile.com'
    },
    
    // ✅ Auto-génération intelligente de domaine
    autoGenerateDomain(ticker, companyName) {
        // Vérifier d'abord le mapping prédéfini
        if (this.companyDomains[ticker]) {
            return this.companyDomains[ticker];
        }
        
        // Sinon, générer automatiquement
        let cleanName = companyName.toLowerCase()
            .replace(/\s+inc\.?$/i, '')
            .replace(/\s+corp(oration)?\.?$/i, '')
            .replace(/\s+ltd\.?$/i, '')
            .replace(/\s+plc\.?$/i, '')
            .replace(/\s+sa\.?$/i, '')
            .replace(/\s+nv\.?$/i, '')
            .replace(/\s+ag\.?$/i, '')
            .replace(/\s+gmbh\.?$/i, '')
            .replace(/\s+holdings?\.?$/i, '')
            .replace(/\s+group\.?$/i, '')
            .replace(/\s+&\s+/g, '')
            .replace(/\s+and\s+/g, '')
            .replace(/\s+/g, '')
            .replace(/[^a-z0-9]/g, '');
        
        // Exceptions spéciales
        const exceptions = {
            'meta': 'meta.com',
            'metaplatforms': 'meta.com',
            'alphabet': 'abc.xyz',
            'facebook': 'meta.com',
            'google': 'google.com',
            'twitter': 'twitter.com',
            'square': 'squareup.com',
            'block': 'squareup.com',
            '3m': '3m.com',
            'berkshirehathaway': 'berkshirehathaway.com'
        };
        
        return exceptions[cleanName] || `${cleanName}.com`;
    },
    
    // ✅ Générer les URLs de logos avec fallbacks
    getLogoUrls(ticker, companyName) {
        const domain = this.autoGenerateDomain(ticker, companyName || ticker);
        
        return {
            primary: `https://img.logo.dev/${domain}?token=pk_X-WazSBJQn2GwW2hy9Lwpg`,
            fallbacks: [
                `https://logo.clearbit.com/${domain}`,
                `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
                `https://unavatar.io/${domain}?fallback=false`
            ],
            domain: domain,
            initials: (companyName || ticker).substring(0, 2).toUpperCase()
        };
    },
    
    // ✅ Gestion des erreurs de chargement (cascade de fallbacks)
    handleLogoError(imgElement, fallbacksArray, initials) {
        const logoContainer = imgElement.parentElement;
        
        if (!logoContainer) return;
        
        // Récupérer les fallbacks restants
        let fallbacks = [];
        try {
            fallbacks = JSON.parse(logoContainer.dataset.fallbacks || '[]');
        } catch (e) {
            console.warn('Failed to parse fallbacks:', e);
        }
        
        if (fallbacks.length > 0) {
            // Essayer le prochain fallback
            const nextUrl = fallbacks.shift();
            logoContainer.dataset.fallbacks = JSON.stringify(fallbacks);
            imgElement.src = nextUrl;
        } else {
            // Tous les fallbacks ont échoué → afficher les initiales
            logoContainer.innerHTML = `<div class="logo-initials">${initials}</div>`;
        }
    }
};

// ✅ Rendre accessible globalement
window.CompanyLogos = CompanyLogos;

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
        stochastic: null,
        williams: null,
        adx: null,
        obv: null,
        atr: null,
        rsi: null,
        macd: null,
        mfi: null,
        cci: null,
        roc: null,
        aroon: null,
        cmf: null,
        elderRay: null
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
        console.log('🚀 Advanced Analysis - Legal Compliant Version - Initializing...');
        
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
        
        console.log('✅ Advanced Analysis - Legal Compliant Version - Ready!');
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
    // SEARCH FUNCTIONALITY
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
    // LOAD SYMBOL
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
    
    // ✅ AFFICHAGE HEADER AVEC LOGO
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
        const symbol = displayQuote.symbol || this.currentSymbol;
        const name = displayQuote.name || this.currentSymbol;
        
        // ✅ RÉCUPÉRER LES URLS DE LOGOS
        const logoData = window.CompanyLogos.getLogoUrls(symbol, name);
        
        // ✅ Afficher le symbole et le nom
        document.getElementById('stockSymbol').textContent = symbol;
        document.getElementById('stockName').textContent = name;
        
        // ✅ INJECTER LE LOGO (avant le symbole)
        const stockInfoDiv = document.querySelector('.stock-info');
        if (stockInfoDiv) {
            // Supprimer l'ancien logo si existant
            const oldLogo = stockInfoDiv.querySelector('.stock-logo-container');
            if (oldLogo) oldLogo.remove();
            
            // Créer le nouveau logo
            const logoHTML = `
                <div class="stock-logo-container" 
                    data-ticker="${symbol}" 
                    data-fallbacks='${JSON.stringify(logoData.fallbacks)}'>
                    <img src="${logoData.primary}" 
                        alt="${name}" 
                        class="stock-logo"
                        onerror="window.CompanyLogos.handleLogoError(this, null, '${logoData.initials}')">
                </div>
            `;
            
            // Insérer le logo avant le h2
            stockInfoDiv.insertAdjacentHTML('afterbegin', logoHTML);
        }
        
        // ✅ Remplacer le prix par AlphaVault Score
        const alphaVaultScore = this.calculateAlphaVaultScore();
        document.getElementById('currentPrice').textContent = `AlphaVault Score: ${alphaVaultScore}/100`;
        
        // ✅ Remplacer le change par Market Strength
        const changeEl = document.getElementById('priceChange');
        const marketStrength = this.calculateMarketStrength();
        
        let strengthText = '';
        let strengthClass = '';
        
        if (marketStrength >= 75) {
            strengthText = 'Very Strong';
            strengthClass = 'positive';
        } else if (marketStrength >= 60) {
            strengthText = 'Strong';
            strengthClass = 'positive';
        } else if (marketStrength >= 45) {
            strengthText = 'Moderate';
            strengthClass = 'neutral';
        } else if (marketStrength >= 30) {
            strengthText = 'Weak';
            strengthClass = 'negative';
        } else {
            strengthText = 'Very Weak';
            strengthClass = 'negative';
        }
        
        changeEl.textContent = `Market Strength: ${strengthText}`;
        changeEl.className = `change ${strengthClass}`;
        
        document.getElementById('stockHeader').classList.remove('hidden');
    },
    
    // ✅ AlphaVault Score (basé sur indicateurs techniques uniquement)
    calculateAlphaVaultScore() {
        if (!this.stockData || !this.stockData.prices || this.stockData.prices.length < 50) {
            return 50;
        }
        
        const prices = this.stockData.prices;
        let score = 50;
        
        // RSI
        const rsi = this.calculateRSI(prices);
        if (rsi.length > 0) {
            const lastRSI = rsi[rsi.length - 1][1];
            if (lastRSI < 30) score += 10;
            else if (lastRSI < 40) score += 5;
            else if (lastRSI > 70) score -= 10;
            else if (lastRSI > 60) score -= 5;
        }
        
        // MACD
        const macd = this.calculateMACD(prices);
        if (macd.histogram.length > 0) {
            const lastHist = macd.histogram[macd.histogram.length - 1][1];
            if (lastHist > 0) score += 5;
            else score -= 5;
        }
        
        // ADX
        const adx = this.calculateADX(prices);
        if (adx.adx.length > 0) {
            const lastADX = adx.adx[adx.adx.length - 1][1];
            const lastPlusDI = adx.plusDI[adx.plusDI.length - 1][1];
            const lastMinusDI = adx.minusDI[adx.minusDI.length - 1][1];
            
            if (lastADX > 25) {
                if (lastPlusDI > lastMinusDI) score += 10;
                else score -= 10;
            }
        }
        
        // OBV
        const obv = this.calculateOBV(prices);
        if (obv.length >= 20) {
            const recentOBV = obv.slice(-20);
            const obvTrend = recentOBV[recentOBV.length - 1][1] - recentOBV[0][1];
            if (obvTrend > 0) score += 5;
            else score -= 5;
        }
        
        // Stochastic
        const stochastic = this.calculateStochastic(prices);
        if (stochastic.k.length > 0) {
            const lastK = stochastic.k[stochastic.k.length - 1][1];
            if (lastK < 20) score += 5;
            else if (lastK > 80) score -= 5;
        }
        
        return Math.max(0, Math.min(100, Math.round(score)));
    },
    
    // ✅ Market Strength (basé sur variation % récente)
    calculateMarketStrength() {
        if (!this.stockData || !this.stockData.prices || this.stockData.prices.length < 20) {
            return 50;
        }
        
        const prices = this.stockData.prices;
        const lastPrice = prices[prices.length - 1].close;
        const recentPrices = prices.slice(-20);
        
        let strength = 50;
        
        const firstPrice = recentPrices[0].close;
        const priceChange = ((lastPrice - firstPrice) / firstPrice) * 100;
        
        if (priceChange > 10) strength += 25;
        else if (priceChange > 5) strength += 15;
        else if (priceChange > 0) strength += 5;
        else if (priceChange < -10) strength -= 25;
        else if (priceChange < -5) strength -= 15;
        else if (priceChange < 0) strength -= 5;
        
        const avgVolume = recentPrices.reduce((sum, p) => sum + p.volume, 0) / 20;
        const lastVolume = prices[prices.length - 1].volume;
        
        if (lastVolume > avgVolume * 1.5) strength += 10;
        else if (lastVolume < avgVolume * 0.5) strength -= 10;
        
        return Math.max(0, Math.min(100, Math.round(strength)));
    },

    // ============================================
    // UPDATE ALL INDICATORS (UNIQUEMENT OSCILLATEURS)
    // ============================================
    
    updateAllIndicators() {
        console.log('📊 Updating indicators (Legal Compliant)...');
        
        const resultsPanel = document.getElementById('resultsPanel');
        if (resultsPanel.classList.contains('hidden')) {
            resultsPanel.classList.remove('hidden');
        }
        
        // ✅ UNIQUEMENT LES OSCILLATEURS PURS
        this.updateRSIChart();
        this.updateMACDChart();
        this.updateStochasticChart();
        this.updateWilliamsChart();
        this.updateADXChart();
        this.updateOBVChart();
        this.updateATRChart();
        this.updateMFIChart();
        this.updateCCIChart();
        this.updateUltimateOscillatorChart();
        this.updateROCChart();
        this.updateAroonChart();
        this.updateCMFChart();
        this.updateElderRayChart();
        
        // ✅ Signaux consolidés et recommandation IA
        this.generateConsolidatedSignals();
        this.generateAIRecommendation();
        
        console.log('✅ All indicators updated (Legal Compliant)');
    },

    // ============================================
    // ✅ RSI (Relative Strength Index)
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
    // ✅ MACD
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
    // ✅ STOCHASTIC OSCILLATOR
    // ============================================
    
    updateStochasticChart() {
        const prices = this.stockData.prices;
        const stochastic = this.calculateStochastic(prices);
        
        if (this.charts.stochastic) {
            this.charts.stochastic.series[0].setData(stochastic.k, false);
            this.charts.stochastic.series[1].setData(stochastic.d, false);
            this.charts.stochastic.redraw();
        } else {
            this.charts.stochastic = Highcharts.chart('stochasticChart', {
                chart: { borderRadius: 15, height: 400 },
                title: {
                    text: 'Stochastic Oscillator',
                    style: { color: this.colors.primary, fontWeight: 'bold' }
                },
                xAxis: { type: 'datetime', crosshair: true },
                yAxis: {
                    title: { text: 'Stochastic' },
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
                tooltip: { borderRadius: 10, shared: true },
                series: [
                    {
                        type: 'line',
                        name: '%K (Fast)',
                        data: stochastic.k,
                        color: this.colors.primary,
                        lineWidth: 2
                    },
                    {
                        type: 'line',
                        name: '%D (Slow)',
                        data: stochastic.d,
                        color: this.colors.danger,
                        lineWidth: 2
                    }
                ],
                credits: { enabled: false }
            });
        }
        
        this.displayStochasticSignal(stochastic);
    },
    
    calculateStochastic(prices, kPeriod = 14, dPeriod = 3) {
        const k = [];
        const d = [];
        
        for (let i = kPeriod - 1; i < prices.length; i++) {
            const slice = prices.slice(i - kPeriod + 1, i + 1);
            const high = Math.max(...slice.map(p => p.high));
            const low = Math.min(...slice.map(p => p.low));
            const close = prices[i].close;
            
            const kValue = ((close - low) / (high - low)) * 100;
            k.push([prices[i].timestamp, kValue]);
        }
        
        for (let i = dPeriod - 1; i < k.length; i++) {
            const slice = k.slice(i - dPeriod + 1, i + 1);
            const avg = slice.reduce((sum, item) => sum + item[1], 0) / dPeriod;
            d.push([k[i][0], avg]);
        }
        
        return { k, d };
    },
    
    displayStochasticSignal(stochastic) {
        if (!stochastic.k.length || !stochastic.d.length) {
            document.getElementById('stochasticSignal').textContent = 'Not enough data';
            return;
        }
        
        const lastK = stochastic.k[stochastic.k.length - 1][1];
        const lastD = stochastic.d[stochastic.d.length - 1][1];
        
        let signal = 'neutral';
        let text = `%K: ${lastK.toFixed(2)}, %D: ${lastD.toFixed(2)} - `;
        
        if (lastK > 80) {
            signal = 'bearish';
            text += 'Overbought - Potential Sell Signal';
        } else if (lastK < 20) {
            signal = 'bullish';
            text += 'Oversold - Potential Buy Signal';
        } else if (lastK > lastD && stochastic.k[stochastic.k.length - 2][1] <= stochastic.d[stochastic.d.length - 2][1]) {
            signal = 'bullish';
            text += 'Bullish Crossover';
        } else if (lastK < lastD && stochastic.k[stochastic.k.length - 2][1] >= stochastic.d[stochastic.d.length - 2][1]) {
            signal = 'bearish';
            text += 'Bearish Crossover';
        } else {
            text += 'Neutral';
        }
        
        const signalBox = document.getElementById('stochasticSignal');
        signalBox.className = `signal-box ${signal}`;
        signalBox.textContent = text;
    },
    
    // ============================================
    // ✅ WILLIAMS %R
    // ============================================
    
    updateWilliamsChart() {
        const prices = this.stockData.prices;
        const williams = this.calculateWilliams(prices);
        
        if (this.charts.williams) {
            this.charts.williams.series[0].setData(williams, true);
        } else {
            this.charts.williams = Highcharts.chart('williamsChart', {
                chart: { borderRadius: 15, height: 400 },
                title: {
                    text: 'Williams %R',
                    style: { color: this.colors.primary, fontWeight: 'bold' }
                },
                xAxis: { type: 'datetime', crosshair: true },
                yAxis: {
                    title: { text: 'Williams %R' },
                    plotLines: [
                        {
                            value: -20,
                            color: this.colors.danger,
                            dashStyle: 'ShortDash',
                            width: 2,
                            label: { text: 'Overbought (-20)', align: 'right', style: { color: this.colors.danger } }
                        },
                        {
                            value: -80,
                            color: this.colors.success,
                            dashStyle: 'ShortDash',
                            width: 2,
                            label: { text: 'Oversold (-80)', align: 'right', style: { color: this.colors.success } }
                        }
                    ],
                    min: -100,
                    max: 0
                },
                tooltip: { borderRadius: 10 },
                series: [
                    {
                        type: 'area',
                        name: 'Williams %R',
                        data: williams,
                        color: this.colors.secondary,
                        fillOpacity: 0.3,
                        lineWidth: 2
                    }
                ],
                credits: { enabled: false }
            });
        }
        
        this.displayWilliamsSignal(williams);
    },
    
    calculateWilliams(prices, period = 14) {
        const williams = [];
        
        for (let i = period - 1; i < prices.length; i++) {
            const slice = prices.slice(i - period + 1, i + 1);
            const high = Math.max(...slice.map(p => p.high));
            const low = Math.min(...slice.map(p => p.low));
            const close = prices[i].close;
            
            const value = ((high - close) / (high - low)) * -100;
            williams.push([prices[i].timestamp, value]);
        }
        
        return williams;
    },
    
    displayWilliamsSignal(williams) {
        if (!williams.length) {
            document.getElementById('williamsSignal').textContent = 'Not enough data';
            return;
        }
        
        const lastValue = williams[williams.length - 1][1];
        
        let signal = 'neutral';
        let text = `Williams %R: ${lastValue.toFixed(2)} - `;
        
        if (lastValue > -20) {
            signal = 'bearish';
            text += 'Overbought - Potential Sell Signal';
        } else if (lastValue < -80) {
            signal = 'bullish';
            text += 'Oversold - Potential Buy Signal';
        } else {
            text += 'Neutral Zone';
        }
        
        const signalBox = document.getElementById('williamsSignal');
        signalBox.className = `signal-box ${signal}`;
        signalBox.textContent = text;
    },
    
    // ============================================
    // ✅ ADX
    // ============================================
    
    updateADXChart() {
        const prices = this.stockData.prices;
        const adxData = this.calculateADX(prices);
        
        if (!adxData.adx.length || !adxData.plusDI.length || !adxData.minusDI.length) {
            console.warn('ADX calculation returned empty data');
            const signalBox = document.getElementById('adxSignal');
            if (signalBox) {
                signalBox.className = 'signal-box neutral';
                signalBox.textContent = 'Not enough data for ADX (need 6+ months)';
            }
            return;
        }
        
        if (this.charts.adx) {
            this.charts.adx.series[0].setData(adxData.adx, false);
            this.charts.adx.series[1].setData(adxData.plusDI, false);
            this.charts.adx.series[2].setData(adxData.minusDI, false);
            this.charts.adx.redraw();
        } else {
            this.charts.adx = Highcharts.chart('adxChart', {
                chart: { borderRadius: 15, height: 400 },
                title: {
                    text: 'ADX - Trend Strength',
                    style: { color: this.colors.primary, fontWeight: 'bold' }
                },
                xAxis: { type: 'datetime', crosshair: true },
                yAxis: {
                    title: { text: 'ADX Value' },
                    plotLines: [
                        {
                            value: 25,
                            color: this.colors.success,
                            dashStyle: 'ShortDash',
                            width: 2,
                            label: { text: 'Strong Trend (25)', align: 'right', style: { color: this.colors.success } }
                        },
                        {
                            value: 20,
                            color: this.colors.warning,
                            dashStyle: 'Dot',
                            width: 1,
                            label: { text: 'Weak Trend (20)', align: 'right' }
                        }
                    ],
                    min: 0,
                    max: 100
                },
                tooltip: { borderRadius: 10, shared: true },
                series: [
                    {
                        type: 'line',
                        name: 'ADX',
                        data: adxData.adx,
                        color: this.colors.primary,
                        lineWidth: 3
                    },
                    {
                        type: 'line',
                        name: '+DI',
                        data: adxData.plusDI,
                        color: this.colors.success,
                        lineWidth: 2
                    },
                    {
                        type: 'line',
                        name: '-DI',
                        data: adxData.minusDI,
                        color: this.colors.danger,
                        lineWidth: 2
                    }
                ],
                credits: { enabled: false }
            });
        }
        
        this.displayADXSignal(adxData);
    },
    
    calculateADX(prices, period = 14) {
        if (prices.length < period + 2) {
            console.warn('Not enough data for ADX calculation');
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
            console.warn('Not enough DX values for ADX calculation');
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
    },
    
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
    },
    
    displayADXSignal(adxData) {
        if (!adxData.adx.length || !adxData.plusDI.length || !adxData.minusDI.length) {
            const signalBox = document.getElementById('adxSignal');
            signalBox.className = 'signal-box neutral';
            signalBox.textContent = 'Not enough data for ADX calculation';
            return;
        }
        
        const lastADX = adxData.adx[adxData.adx.length - 1][1];
        const lastPlusDI = adxData.plusDI[adxData.plusDI.length - 1][1];
        const lastMinusDI = adxData.minusDI[adxData.minusDI.length - 1][1];
        
        let signal = 'neutral';
        let text = `ADX: ${lastADX.toFixed(2)} - `;
        
        if (lastADX > 25) {
            if (lastPlusDI > lastMinusDI) {
                signal = 'bullish';
                text += 'Strong Uptrend';
            } else {
                signal = 'bearish';
                text += 'Strong Downtrend';
            }
        } else if (lastADX > 20) {
            text += 'Developing Trend';
        } else {
            text += 'Weak/No Trend (Ranging Market)';
        }
        
        const signalBox = document.getElementById('adxSignal');
        signalBox.className = `signal-box ${signal}`;
        signalBox.textContent = text;
    },
    
    // ============================================
    // ✅ OBV
    // ============================================
    
    updateOBVChart() {
        const prices = this.stockData.prices;
        const obv = this.calculateOBV(prices);
        
        if (this.charts.obv) {
            this.charts.obv.series[0].setData(obv, true);
        } else {
            this.charts.obv = Highcharts.chart('obvChart', {
                chart: { borderRadius: 15, height: 400 },
                title: {
                    text: 'On-Balance Volume (OBV)',
                    style: { color: this.colors.primary, fontWeight: 'bold' }
                },
                xAxis: { type: 'datetime', crosshair: true },
                yAxis: { title: { text: 'OBV' } },
                tooltip: { borderRadius: 10, valueDecimals: 0 },
                series: [
                    {
                        type: 'area',
                        name: 'OBV',
                        data: obv,
                        color: this.colors.secondary,
                        fillOpacity: 0.3,
                        lineWidth: 2
                    }
                ],
                credits: { enabled: false }
            });
        }
        
        this.displayOBVSignal(obv, prices);
    },
    
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
    },
    
    displayOBVSignal(obv, prices) {
        if (obv.length < 20) {
            document.getElementById('obvSignal').textContent = 'Not enough data';
            return;
        }
        
        const recentPrices = prices.slice(-20);
        const recentOBV = obv.slice(-20);
        
        const priceChange = recentPrices[recentPrices.length - 1].close - recentPrices[0].close;
        const obvChange = recentOBV[recentOBV.length - 1][1] - recentOBV[0][1];
        
        let signal = 'neutral';
        let text = '';
        
        if (priceChange > 0 && obvChange > 0) {
            signal = 'bullish';
            text = 'Price ↑ + OBV ↑ - Strong Uptrend';
        } else if (priceChange < 0 && obvChange < 0) {
            signal = 'bearish';
            text = 'Price ↓ + OBV ↓ - Strong Downtrend';
        } else if (priceChange > 0 && obvChange < 0) {
            signal = 'bearish';
            text = 'Bearish Divergence - Weakness in Uptrend';
        } else if (priceChange < 0 && obvChange > 0) {
            signal = 'bullish';
            text = 'Bullish Divergence - Weakness in Downtrend';
        } else {
            text = 'No Clear Signal';
        }
        
        const signalBox = document.getElementById('obvSignal');
        signalBox.className = `signal-box ${signal}`;
        signalBox.textContent = text;
    },
    
    // ============================================
    // ✅ ATR
    // ============================================
    
    updateATRChart() {
        const prices = this.stockData.prices;
        const atr = this.calculateATR(prices);
        
        if (this.charts.atr) {
            this.charts.atr.series[0].setData(atr, true);
        } else {
            this.charts.atr = Highcharts.chart('atrChart', {
                chart: { borderRadius: 15, height: 400 },
                title: {
                    text: 'Average True Range (ATR)',
                    style: { color: this.colors.primary, fontWeight: 'bold' }
                },
                xAxis: { type: 'datetime', crosshair: true },
                yAxis: { title: { text: 'ATR Value' } },
                tooltip: { borderRadius: 10, valueDecimals: 2 },
                series: [
                    {
                        type: 'line',
                        name: 'ATR',
                        data: atr,
                        color: this.colors.tertiary,
                        lineWidth: 2
                    }
                ],
                credits: { enabled: false }
            });
        }
        
        this.displayATRSignal(atr);
    },
    
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
    },
    
    displayATRSignal(atr) {
        if (!atr.length || atr.length < 20) {
            const signalBox = document.getElementById('atrSignal');
            signalBox.className = 'signal-box neutral';
            signalBox.textContent = 'Not enough data for ATR calculation';
            return;
        }
        
        const lastATR = atr[atr.length - 1][1];
        const avgATR = atr.slice(-20).reduce((sum, item) => sum + item[1], 0) / 20;
        
        let signal = 'neutral';
        let text = `Current ATR: ${lastATR.toFixed(2)} - `;
        
        if (lastATR > avgATR * 1.5) {
            signal = 'neutral';
            text += 'High Volatility (Use Wider Stops)';
        } else if (lastATR < avgATR * 0.7) {
            signal = 'neutral';
            text += 'Low Volatility (Potential Breakout Coming)';
        } else {
            text += 'Normal Volatility';
        }
        
        const signalBox = document.getElementById('atrSignal');
        signalBox.className = `signal-box ${signal}`;
        signalBox.textContent = text;
    },

    // ============================================
    // ✅ MFI (Money Flow Index)
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
    
    // ============================================
    // ✅ CCI (Commodity Channel Index)
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
    
    // ============================================
    // ✅ ULTIMATE OSCILLATOR
    // ============================================
    
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
    
    // ============================================
    // ✅ ROC (Rate of Change)
    // ============================================
    
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
    
    // ============================================
    // ✅ AROON INDICATOR
    // ============================================
    
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
    // ✅ CMF (Chaikin Money Flow)
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
    
    // ============================================
    // ✅ ELDER RAY INDEX
    // ============================================
    
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
    // ✅ CONSOLIDATED TRADING SIGNALS
    // ============================================
    
    generateConsolidatedSignals() {
        const prices = this.stockData.prices;
        const signals = [];
        
        // RSI
        const rsi = this.calculateRSI(prices);
        if (rsi.length > 0) {
            const lastRSI = rsi[rsi.length - 1][1];
            let rsiSignal = 0;
            if (lastRSI < 30) rsiSignal = 1;
            else if (lastRSI > 70) rsiSignal = -1;
            signals.push({ name: 'RSI', value: lastRSI.toFixed(2), signal: rsiSignal });
        }
        
        // MACD
        const macd = this.calculateMACD(prices);
        if (macd.histogram.length > 0) {
            const lastHist = macd.histogram[macd.histogram.length - 1][1];
            const macdSignal = lastHist > 0 ? 1 : lastHist < 0 ? -1 : 0;
            signals.push({ name: 'MACD', value: lastHist.toFixed(4), signal: macdSignal });
        }
        
        // Stochastic
        const stochastic = this.calculateStochastic(prices);
        if (stochastic.k.length > 0) {
            const lastK = stochastic.k[stochastic.k.length - 1][1];
            let stochasticSignal = 0;
            if (lastK < 20) stochasticSignal = 1;
            else if (lastK > 80) stochasticSignal = -1;
            signals.push({ name: 'Stochastic', value: lastK.toFixed(2), signal: stochasticSignal });
        }
        
        // Williams %R
        const williams = this.calculateWilliams(prices);
        if (williams.length > 0) {
            const lastWilliams = williams[williams.length - 1][1];
            let williamsSignal = 0;
            if (lastWilliams < -80) williamsSignal = 1;
            else if (lastWilliams > -20) williamsSignal = -1;
            signals.push({ name: 'Williams %R', value: lastWilliams.toFixed(2), signal: williamsSignal });
        }
        
        // ADX
        const adxData = this.calculateADX(prices);
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
        
        // OBV
        const obv = this.calculateOBV(prices);
        if (obv.length >= 20) {
            const recentOBV = obv.slice(-20);
            const obvTrend = recentOBV[recentOBV.length - 1][1] - recentOBV[0][1];
            const obvSignal = obvTrend > 0 ? 1 : obvTrend < 0 ? -1 : 0;
            signals.push({ name: 'OBV', value: obvTrend > 0 ? 'Rising' : obvTrend < 0 ? 'Falling' : 'Flat', signal: obvSignal });
        }
        
        // MFI
        const mfi = this.calculateMFI(prices);
        if (mfi.length > 0) {
            const lastMFI = mfi[mfi.length - 1][1];
            let mfiSignal = 0;
            if (lastMFI < 20) mfiSignal = 1;
            else if (lastMFI > 80) mfiSignal = -1;
            signals.push({ name: 'MFI', value: lastMFI.toFixed(2), signal: mfiSignal });
        }
        
        // CCI
        const cci = this.calculateCCI(prices);
        if (cci.length > 0) {
            const lastCCI = cci[cci.length - 1][1];
            let cciSignal = 0;
            if (lastCCI < -100) cciSignal = 1;
            else if (lastCCI > 100) cciSignal = -1;
            signals.push({ name: 'CCI', value: lastCCI.toFixed(2), signal: cciSignal });
        }
        
        // Ultimate Oscillator
        const ultimate = this.calculateUltimateOscillator(prices);
        if (ultimate.length > 0) {
            const lastUO = ultimate[ultimate.length - 1][1];
            let uoSignal = 0;
            if (lastUO < 30) uoSignal = 1;
            else if (lastUO > 70) uoSignal = -1;
            signals.push({ name: 'Ultimate Osc', value: lastUO.toFixed(2), signal: uoSignal });
        }
        
        // ROC
        const roc = this.calculateROC(prices);
        if (roc.length > 0) {
            const lastROC = roc[roc.length - 1][1];
            const rocSignal = lastROC > 0 ? 1 : lastROC < 0 ? -1 : 0;
            signals.push({ name: 'ROC', value: lastROC.toFixed(2) + '%', signal: rocSignal });
        }
        
        // Aroon
        const aroon = this.calculateAroon(prices);
        if (aroon.up.length > 0 && aroon.down.length > 0) {
            const lastUp = aroon.up[aroon.up.length - 1][1];
            const lastDown = aroon.down[aroon.down.length - 1][1];
            const aroonSignal = lastUp > lastDown ? 1 : -1;
            signals.push({ name: 'Aroon', value: 'N/A', signal: aroonSignal });
        }
        
        // CMF
        const cmf = this.calculateCMF(prices);
        if (cmf.length > 0) {
            const lastCMF = cmf[cmf.length - 1][1];
            const cmfSignal = lastCMF > 0 ? 1 : lastCMF < 0 ? -1 : 0;
            signals.push({ name: 'CMF', value: lastCMF.toFixed(4), signal: cmfSignal });
        }
        
        // Elder Ray
        const elderRay = this.calculateElderRay(prices);
        if (elderRay.bullPower.length > 0 && elderRay.bearPower.length > 0) {
            const lastBull = elderRay.bullPower[elderRay.bullPower.length - 1][1];
            const lastBear = elderRay.bearPower[elderRay.bearPower.length - 1][1];
            let elderSignal = 0;
            if (lastBull > 0 && lastBear > 0) elderSignal = 1;
            else if (lastBull < 0 && lastBear < 0) elderSignal = -1;
            signals.push({ name: 'Elder Ray', value: 'N/A', signal: elderSignal });
        }
        
        // Calculate consolidated signal
        if (signals.length > 0) {
            const totalSignal = signals.reduce((sum, s) => sum + s.signal, 0);
            const maxSignal = signals.length;
            const signalPercentage = ((totalSignal + maxSignal) / (2 * maxSignal)) * 100;
            
            this.displayConsolidatedSignals(signals, signalPercentage);
        }
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
    // 🤖 AI RECOMMENDATION ENGINE (LEGAL COMPLIANT)
    // Basé sur 14 indicateurs techniques professionnels
    // VERSION COMPLÈTE ET CORRIGÉE
    // ============================================

    generateAIRecommendation() {
        console.log('🤖 Alphy AI - Generating professional multi-horizon recommendation...');
        
        const prices = this.stockData.prices;
        
        if (!prices || prices.length < 30) {
            console.warn('⚠ Insufficient data for AI recommendation (minimum 30 days required)');
            this.displayAIError('Insufficient historical data');
            return;
        }
        
        // ✅ ÉTAPE 1 : Collecter les 14 indicateurs techniques
        const technicalSignals = this.collectAllTechnicalSignals(prices);
        
        // ✅ ÉTAPE 2 : Analyser les tendances multi-horizons
        const trendAnalysis = this.analyzeTrendsByHorizon(prices);
        
        // ✅ ÉTAPE 3 : Calculer AI Confidence Score global
        const aiScore = this.calculateAIConfidenceScore(technicalSignals);
        
        // ✅ ÉTAPE 4 : Générer recommandations différenciées par horizon
        const horizonRecommendations = this.generateHorizonRecommendations(aiScore, technicalSignals, trendAnalysis);
        
        // ✅ ÉTAPE 5 : Afficher résultats
        this.displayAIRecommendation(aiScore, technicalSignals);
        this.displayHorizonRecommendations(horizonRecommendations);
        
        console.log('✅ Alphy AI Recommendation generated successfully');
        console.log('📊 Horizon Scores:', {
            '1y': `${horizonRecommendations['1y'].recommendation} (${horizonRecommendations['1y'].confidence}%) - Potential: ${horizonRecommendations['1y'].potentialMove}%`,
            '2y': `${horizonRecommendations['2y'].recommendation} (${horizonRecommendations['2y'].confidence}%) - Potential: ${horizonRecommendations['2y'].potentialMove}%`,
            '5y': `${horizonRecommendations['5y'].recommendation} (${horizonRecommendations['5y'].confidence}%) - Potential: ${horizonRecommendations['5y'].potentialMove}%`
        });
    },

    // 🔍 Collecte des 14 indicateurs techniques
    collectAllTechnicalSignals(prices) {
        const signals = {
            momentum: [],      // RSI, Stochastic, Williams, MFI, ROC
            trend: [],         // MACD, ADX, Aroon
            volume: [],        // OBV, CMF
            volatility: [],    // ATR
            composite: []      // CCI, Ultimate Oscillator, Elder Ray
        };
        
        // ========================
        // 1⃣ RSI (Relative Strength Index)
        // ========================
        try {
            const rsi = this.calculateRSI(prices);
            if (rsi.length > 0) {
                const lastRSI = rsi[rsi.length - 1][1];
                const prevRSI = rsi[rsi.length - 2]?.[1] || lastRSI;
                
                let strength = 0;
                
                // Zones critiques
                if (lastRSI < 20) strength = 2.5;           // Extreme oversold
                else if (lastRSI < 30) strength = 2.0;      // Oversold
                else if (lastRSI < 40) strength = 1.5;      // Moderately oversold
                else if (lastRSI < 45) strength = 0.8;      // Slightly oversold
                else if (lastRSI > 80) strength = -2.5;     // Extreme overbought
                else if (lastRSI > 70) strength = -2.0;     // Overbought
                else if (lastRSI > 60) strength = -1.5;     // Moderately overbought
                else if (lastRSI > 55) strength = -0.8;     // Slightly overbought
                
                // Divergence momentum
                if (lastRSI > prevRSI + 5 && lastRSI < 50) strength += 0.5;
                if (lastRSI < prevRSI - 5 && lastRSI > 50) strength -= 0.5;
                
                signals.momentum.push({
                    name: 'RSI',
                    value: lastRSI,
                    signal: strength,
                    weight: 1.8,
                    category: 'momentum',
                    description: lastRSI < 30 ? `Oversold (RSI: ${lastRSI.toFixed(1)})` :
                                lastRSI > 70 ? `Overbought (RSI: ${lastRSI.toFixed(1)})` :
                                `Neutral zone (RSI: ${lastRSI.toFixed(1)})`
                });
                
                console.log(`✅ RSI: ${lastRSI.toFixed(1)} | Signal: ${strength.toFixed(2)}`);
            }
        } catch (error) {
            console.warn('⚠ RSI calculation failed:', error);
        }
        
        // ========================
        // 2⃣ MACD (Moving Average Convergence Divergence)
        // ========================
        try {
            const macd = this.calculateMACD(prices);
            if (macd.histogram.length > 0) {
                const lastHist = macd.histogram[macd.histogram.length - 1][1];
                const prevHist = macd.histogram[macd.histogram.length - 2]?.[1] || 0;
                const lastMACD = macd.macd[macd.macd.length - 1][1];
                const lastSignal = macd.signal[macd.signal.length - 1][1];
                
                let strength = 0;
                
                // Croisements (signaux les plus forts)
                if (lastHist > 0 && prevHist <= 0) strength = 2.5;        // Bullish crossover
                else if (lastHist < 0 && prevHist >= 0) strength = -2.5;  // Bearish crossover
                // Position relative
                else if (lastMACD > lastSignal && lastHist > 0) strength = 1.8;
                else if (lastMACD < lastSignal && lastHist < 0) strength = -1.8;
                else if (lastHist > 0) strength = 1.0;
                else if (lastHist < 0) strength = -1.0;
                
                // Renforcement si histogram s'amplifie
                if (Math.abs(lastHist) > Math.abs(prevHist) * 1.2) {
                    strength *= 1.15;
                }
                
                signals.trend.push({
                    name: 'MACD',
                    value: lastHist,
                    signal: strength,
                    weight: 2.2,
                    category: 'trend',
                    description: lastHist > 0 && prevHist <= 0 ? 'Bullish crossover detected' :
                                lastHist < 0 && prevHist >= 0 ? 'Bearish crossover detected' :
                                lastHist > 0 ? 'Positive momentum' : 'Negative momentum'
                });
                
                console.log(`✅ MACD: ${lastHist.toFixed(4)} | Signal: ${strength.toFixed(2)}`);
            }
        } catch (error) {
            console.warn('⚠ MACD calculation failed:', error);
        }
        
        // ========================
        // 3⃣ STOCHASTIC OSCILLATOR
        // ========================
        try {
            const stochastic = this.calculateStochastic(prices);
            if (stochastic.k.length > 0) {
                const lastK = stochastic.k[stochastic.k.length - 1][1];
                const lastD = stochastic.d[stochastic.d.length - 1][1];
                const prevK = stochastic.k[stochastic.k.length - 2]?.[1] || lastK;
                const prevD = stochastic.d[stochastic.d.length - 2]?.[1] || lastD;
                
                let strength = 0;
                
                // Zones de surachat/survente
                if (lastK < 15) strength = 2.0;
                else if (lastK < 20) strength = 1.5;
                else if (lastK > 85) strength = -2.0;
                else if (lastK > 80) strength = -1.5;
                
                // Croisements K/D
                if (lastK > lastD && prevK <= prevD && lastK < 50) strength = 2.2;      // Bullish cross in oversold
                else if (lastK < lastD && prevK >= prevD && lastK > 50) strength = -2.2; // Bearish cross in overbought
                else if (lastK > lastD && lastK < 80) strength += 0.8;
                else if (lastK < lastD && lastK > 20) strength -= 0.8;
                
                signals.momentum.push({
                    name: 'Stochastic',
                    value: lastK,
                    signal: strength,
                    weight: 1.5,
                    category: 'momentum',
                    description: lastK < 20 ? `Oversold zone (${lastK.toFixed(1)})` :
                                lastK > 80 ? `Overbought zone (${lastK.toFixed(1)})` :
                                lastK > lastD ? 'Bullish momentum' : 'Bearish momentum'
                });
                
                console.log(`✅ Stochastic: ${lastK.toFixed(1)} | Signal: ${strength.toFixed(2)}`);
            }
        } catch (error) {
            console.warn('⚠ Stochastic calculation failed:', error);
        }
        
        // ========================
        // 4⃣ WILLIAMS %R
        // ========================
        try {
            const williams = this.calculateWilliamsR(prices);
            if (williams.length > 0) {
                const lastWR = williams[williams.length - 1][1];
                const prevWR = williams[williams.length - 2]?.[1] || lastWR;
                
                let strength = 0;
                
                // Williams %R va de -100 à 0
                if (lastWR < -85) strength = 2.0;           // Deep oversold
                else if (lastWR < -80) strength = 1.5;      // Oversold
                else if (lastWR > -15) strength = -2.0;     // Deep overbought
                else if (lastWR > -20) strength = -1.5;     // Overbought
                
                // Momentum change
                if (lastWR > prevWR + 10) strength += 0.5;
                if (lastWR < prevWR - 10) strength -= 0.5;
                
                signals.momentum.push({
                    name: 'Williams %R',
                    value: lastWR,
                    signal: strength,
                    weight: 1.3,
                    category: 'momentum',
                    description: lastWR < -80 ? `Strong oversold (${lastWR.toFixed(1)})` :
                                lastWR > -20 ? `Strong overbought (${lastWR.toFixed(1)})` :
                                'Mid-range'
                });
                
                console.log(`✅ Williams %R: ${lastWR.toFixed(1)} | Signal: ${strength.toFixed(2)}`);
            }
        } catch (error) {
            console.warn('⚠ Williams %R calculation failed:', error);
        }
        
        // ========================
        // 5⃣ ADX (Average Directional Index)
        // ========================
        try {
            const adx = this.calculateADX(prices);
            if (adx.adx.length > 0) {
                const lastADX = adx.adx[adx.adx.length - 1][1];
                const lastPlusDI = adx.plusDI[adx.plusDI.length - 1][1];
                const lastMinusDI = adx.minusDI[adx.minusDI.length - 1][1];
                const prevADX = adx.adx[adx.adx.length - 2]?.[1] || lastADX;
                
                let strength = 0;
                
                // Tendance forte (ADX > 25)
                if (lastADX > 50) {
                    strength = lastPlusDI > lastMinusDI ? 2.5 : -2.5;
                } else if (lastADX > 40) {
                    strength = lastPlusDI > lastMinusDI ? 2.2 : -2.2;
                } else if (lastADX > 25) {
                    strength = lastPlusDI > lastMinusDI ? 1.8 : -1.8;
                } else if (lastADX > 20) {
                    strength = lastPlusDI > lastMinusDI ? 1.0 : -1.0;
                } else {
                    // Tendance faible = incertitude
                    strength = 0;
                }
                
                // Bonus si ADX en hausse (trend strengthening)
                if (lastADX > prevADX + 3) strength *= 1.1;
                
                signals.trend.push({
                    name: 'ADX',
                    value: lastADX,
                    signal: strength,
                    weight: 2.0,
                    category: 'trend',
                    description: lastADX > 40 ? `Very strong ${lastPlusDI > lastMinusDI ? 'uptrend' : 'downtrend'} (ADX: ${lastADX.toFixed(1)})` :
                                lastADX > 25 ? `Strong ${lastPlusDI > lastMinusDI ? 'uptrend' : 'downtrend'} (ADX: ${lastADX.toFixed(1)})` :
                                `Weak trend (ADX: ${lastADX.toFixed(1)})`
                });
                
                console.log(`✅ ADX: ${lastADX.toFixed(1)} | +DI: ${lastPlusDI.toFixed(1)} | -DI: ${lastMinusDI.toFixed(1)} | Signal: ${strength.toFixed(2)}`);
            }
        } catch (error) {
            console.warn('⚠ ADX calculation failed:', error);
        }
        
        // ========================
        // 6⃣ OBV (On-Balance Volume)
        // ========================
        try {
            const obv = this.calculateOBV(prices);
            if (obv.length >= 30) {
                const lastOBV = obv[obv.length - 1][1];
                const obvMA20 = obv.slice(-20).reduce((sum, val) => sum + val[1], 0) / 20;
                const obvMA50 = obv.slice(-50) ? obv.slice(-50).reduce((sum, val) => sum + val[1], 0) / Math.min(50, obv.length) : obvMA20;
                
                const recentOBV = obv.slice(-20);
                const obvTrend = recentOBV[recentOBV.length - 1][1] - recentOBV[0][1];
                const obvPctChange = (obvTrend / Math.abs(recentOBV[0][1])) * 100;
                
                let strength = 0;
                
                // Tendance OBV
                if (obvPctChange > 20) strength = 2.2;
                else if (obvPctChange > 10) strength = 1.8;
                else if (obvPctChange > 5) strength = 1.2;
                else if (obvPctChange > 0) strength = 0.5;
                else if (obvPctChange < -20) strength = -2.2;
                else if (obvPctChange < -10) strength = -1.8;
                else if (obvPctChange < -5) strength = -1.2;
                else if (obvPctChange < 0) strength = -0.5;
                
                // Croisement MA
                if (lastOBV > obvMA20 && obvMA20 > obvMA50) strength += 0.8;
                else if (lastOBV < obvMA20 && obvMA20 < obvMA50) strength -= 0.8;
                
                signals.volume.push({
                    name: 'OBV',
                    value: obvPctChange,
                    signal: strength,
                    weight: 1.7,
                    category: 'volume',
                    description: obvPctChange > 10 ? `Strong volume accumulation (+${obvPctChange.toFixed(1)}%)` :
                                obvPctChange < -10 ? `Strong volume distribution (${obvPctChange.toFixed(1)}%)` :
                                obvPctChange > 0 ? 'Volume increasing' : 'Volume decreasing'
                });
                
                console.log(`✅ OBV: ${obvPctChange.toFixed(1)}% change | Signal: ${strength.toFixed(2)}`);
            }
        } catch (error) {
            console.warn('⚠ OBV calculation failed:', error);
        }
        
        // ========================
        // 7⃣ ATR (Average True Range)
        // ========================
        try {
            const atr = this.calculateATR(prices);
            if (atr.length > 0) {
                const lastATR = atr[atr.length - 1][1];
                const avgATR = atr.slice(-30).reduce((sum, val) => sum + val[1], 0) / Math.min(30, atr.length);
                const atrRatio = lastATR / avgATR;
                const prevATR = atr[atr.length - 2]?.[1] || lastATR;
                
                let strength = 0;
                
                // ATR élevé = haute volatilité (risque mais aussi opportunité)
                // ATR faible = faible volatilité (stable mais moins d'opportunités)
                if (atrRatio > 1.5) {
                    strength = -0.8;  // Très volatile = risque accru
                } else if (atrRatio > 1.3) {
                    strength = -0.4;  // Volatilité élevée
                } else if (atrRatio < 0.7) {
                    strength = 0.6;   // Faible volatilité = stabilité
                } else if (atrRatio < 0.85) {
                    strength = 0.3;   // Volatilité normale-basse
                }
                
                // ATR en baisse = volatilité qui diminue (positif)
                if (lastATR < prevATR * 0.9) strength += 0.3;
                
                signals.volatility.push({
                    name: 'ATR',
                    value: lastATR,
                    signal: strength,
                    weight: 1.0,
                    category: 'volatility',
                    description: atrRatio > 1.4 ? 'High volatility (risk elevated)' :
                                atrRatio < 0.8 ? 'Low volatility (stable environment)' :
                                'Normal volatility'
                });
                
                console.log(`✅ ATR: ${lastATR.toFixed(2)} | Ratio: ${atrRatio.toFixed(2)} | Signal: ${strength.toFixed(2)}`);
            }
        } catch (error) {
            console.warn('⚠ ATR calculation failed:', error);
        }
        
        // ========================
        // 8⃣ MFI (Money Flow Index)
        // ========================
        try {
            const mfi = this.calculateMFI(prices);
            if (mfi.length > 0) {
                const lastMFI = mfi[mfi.length - 1][1];
                const prevMFI = mfi[mfi.length - 2]?.[1] || lastMFI;
                
                let strength = 0;
                
                // Zones critiques (similaire RSI mais basé sur volume)
                if (lastMFI < 15) strength = 2.5;           // Extreme oversold
                else if (lastMFI < 20) strength = 2.0;      // Oversold
                else if (lastMFI < 30) strength = 1.5;      // Moderately oversold
                else if (lastMFI < 40) strength = 0.8;
                else if (lastMFI > 85) strength = -2.5;     // Extreme overbought
                else if (lastMFI > 80) strength = -2.0;     // Overbought
                else if (lastMFI > 70) strength = -1.5;     // Moderately overbought
                else if (lastMFI > 60) strength = -0.8;
                
                // Momentum
                if (lastMFI > prevMFI + 5 && lastMFI < 50) strength += 0.5;
                if (lastMFI < prevMFI - 5 && lastMFI > 50) strength -= 0.5;
                
                signals.momentum.push({
                    name: 'MFI',
                    value: lastMFI,
                    signal: strength,
                    weight: 1.6,
                    category: 'momentum',
                    description: lastMFI < 20 ? `Strong buying pressure (MFI: ${lastMFI.toFixed(1)})` :
                                lastMFI > 80 ? `Strong selling pressure (MFI: ${lastMFI.toFixed(1)})` :
                                'Balanced money flow'
                });
                
                console.log(`✅ MFI: ${lastMFI.toFixed(1)} | Signal: ${strength.toFixed(2)}`);
            }
        } catch (error) {
            console.warn('⚠ MFI calculation failed:', error);
        }
        
        // ========================
        // 9⃣ CCI (Commodity Channel Index)
        // ========================
        try {
            const cci = this.calculateCCI(prices);
            if (cci.length > 0) {
                const lastCCI = cci[cci.length - 1][1];
                const prevCCI = cci[cci.length - 2]?.[1] || lastCCI;
                
                let strength = 0;
                
                // CCI zones (+-100 = zones normales)
                if (lastCCI < -200) strength = 2.5;         // Extreme oversold
                else if (lastCCI < -150) strength = 2.0;
                else if (lastCCI < -100) strength = 1.5;    // Oversold
                else if (lastCCI < -50) strength = 0.8;
                else if (lastCCI > 200) strength = -2.5;    // Extreme overbought
                else if (lastCCI > 150) strength = -2.0;
                else if (lastCCI > 100) strength = -1.5;    // Overbought
                else if (lastCCI > 50) strength = -0.8;
                
                // Croisement de zéro
                if (lastCCI > 0 && prevCCI <= 0) strength = 1.8;
                else if (lastCCI < 0 && prevCCI >= 0) strength = -1.8;
                
                signals.composite.push({
                    name: 'CCI',
                    value: lastCCI,
                    signal: strength,
                    weight: 1.4,
                    category: 'composite',
                    description: lastCCI < -100 ? `Oversold territory (CCI: ${lastCCI.toFixed(0)})` :
                                lastCCI > 100 ? `Overbought territory (CCI: ${lastCCI.toFixed(0)})` :
                                lastCCI > 0 ? 'Bullish zone' : 'Bearish zone'
                });
                
                console.log(`✅ CCI: ${lastCCI.toFixed(0)} | Signal: ${strength.toFixed(2)}`);
            }
        } catch (error) {
            console.warn('⚠ CCI calculation failed:', error);
        }
        
        // ========================
        // 🔟 ULTIMATE OSCILLATOR
        // ========================
        try {
            const ultimateOsc = this.calculateUltimateOscillator(prices);
            if (ultimateOsc.length > 0) {
                const lastUO = ultimateOsc[ultimateOsc.length - 1][1];
                const prevUO = ultimateOsc[ultimateOsc.length - 2]?.[1] || lastUO;
                
                let strength = 0;
                
                // Ultimate Oscillator zones (0-100)
                if (lastUO < 25) strength = 2.2;            // Oversold
                else if (lastUO < 30) strength = 1.8;
                else if (lastUO < 40) strength = 1.0;
                else if (lastUO > 75) strength = -2.2;      // Overbought
                else if (lastUO > 70) strength = -1.8;
                else if (lastUO > 60) strength = -1.0;
                
                // Divergence bullish/bearish
                if (lastUO > prevUO + 5 && lastUO < 50) strength += 0.6;
                if (lastUO < prevUO - 5 && lastUO > 50) strength -= 0.6;
                
                signals.composite.push({
                    name: 'Ultimate Oscillator',
                    value: lastUO,
                    signal: strength,
                    weight: 1.5,
                    category: 'composite',
                    description: lastUO < 30 ? `Multi-timeframe oversold (${lastUO.toFixed(1)})` :
                                lastUO > 70 ? `Multi-timeframe overbought (${lastUO.toFixed(1)})` :
                                'Neutral multi-timeframe'
                });
                
                console.log(`✅ Ultimate Oscillator: ${lastUO.toFixed(1)} | Signal: ${strength.toFixed(2)}`);
            }
        } catch (error) {
            console.warn('⚠ Ultimate Oscillator calculation failed:', error);
        }
        
        // ========================
        // 1⃣1⃣ ROC (Rate of Change)
        // ========================
        try {
            const roc = this.calculateROC(prices);
            if (roc.length > 0) {
                const lastROC = roc[roc.length - 1][1];
                const prevROC = roc[roc.length - 2]?.[1] || lastROC;
                
                let strength = 0;
                
                // ROC positif/négatif
                if (lastROC > 15) strength = 2.5;
                else if (lastROC > 10) strength = 2.0;
                else if (lastROC > 5) strength = 1.5;
                else if (lastROC > 2) strength = 1.0;
                else if (lastROC > 0) strength = 0.5;
                else if (lastROC < -15) strength = -2.5;
                else if (lastROC < -10) strength = -2.0;
                else if (lastROC < -5) strength = -1.5;
                else if (lastROC < -2) strength = -1.0;
                else if (lastROC < 0) strength = -0.5;
                
                // Accélération du momentum
                if (lastROC > prevROC && lastROC > 0) strength += 0.4;
                if (lastROC < prevROC && lastROC < 0) strength -= 0.4;
                
                signals.momentum.push({
                    name: 'ROC',
                    value: lastROC,
                    signal: strength,
                    weight: 1.4,
                    category: 'momentum',
                    description: lastROC > 10 ? `Strong positive momentum (+${lastROC.toFixed(1)}%)` :
                                lastROC < -10 ? `Strong negative momentum (${lastROC.toFixed(1)}%)` :
                                lastROC > 0 ? 'Positive rate of change' : 'Negative rate of change'
                });
                
                console.log(`✅ ROC: ${lastROC.toFixed(1)}% | Signal: ${strength.toFixed(2)}`);
            }
        } catch (error) {
            console.warn('⚠ ROC calculation failed:', error);
        }
        
        // ========================
        // 1⃣2⃣ AROON INDICATOR
        // ========================
        try {
            const aroon = this.calculateAroon(prices);
            if (aroon.up.length > 0) {
                const lastAroonUp = aroon.up[aroon.up.length - 1][1];
                const lastAroonDown = aroon.down[aroon.down.length - 1][1];
                const prevAroonUp = aroon.up[aroon.up.length - 2]?.[1] || lastAroonUp;
                const prevAroonDown = aroon.down[aroon.down.length - 2]?.[1] || lastAroonDown;
                
                let strength = 0;
                
                // Aroon Up/Down comparaison
                const aroonDiff = lastAroonUp - lastAroonDown;
                
                if (aroonDiff > 70) strength = 2.5;         // Strong uptrend
                else if (aroonDiff > 50) strength = 2.0;
                else if (aroonDiff > 30) strength = 1.5;
                else if (aroonDiff > 10) strength = 0.8;
                else if (aroonDiff < -70) strength = -2.5;  // Strong downtrend
                else if (aroonDiff < -50) strength = -2.0;
                else if (aroonDiff < -30) strength = -1.5;
                else if (aroonDiff < -10) strength = -0.8;
                
                // Croisements
                if (lastAroonUp > lastAroonDown && prevAroonUp <= prevAroonDown) strength = 2.2;
                else if (lastAroonUp < lastAroonDown && prevAroonUp >= prevAroonDown) strength = -2.2;
                
                signals.trend.push({
                    name: 'Aroon',
                    value: aroonDiff,
                    signal: strength,
                    weight: 1.6,
                    category: 'trend',
                    description: aroonDiff > 50 ? `Strong uptrend (Aroon Up: ${lastAroonUp.toFixed(0)})` :
                                aroonDiff < -50 ? `Strong downtrend (Aroon Down: ${lastAroonDown.toFixed(0)})` :
                                'Consolidation phase'
                });
                
                console.log(`✅ Aroon: Up=${lastAroonUp.toFixed(0)}, Down=${lastAroonDown.toFixed(0)} | Signal: ${strength.toFixed(2)}`);
            }
        } catch (error) {
            console.warn('⚠ Aroon calculation failed:', error);
        }
        
        // ========================
        // 1⃣3⃣ CMF (Chaikin Money Flow)
        // ========================
        try {
            const cmf = this.calculateCMF(prices);
            if (cmf.length > 0) {
                const lastCMF = cmf[cmf.length - 1][1];
                const prevCMF = cmf[cmf.length - 2]?.[1] || lastCMF;
                
                let strength = 0;
                
                // CMF positif/négatif
                if (lastCMF > 0.25) strength = 2.5;         // Strong accumulation
                else if (lastCMF > 0.15) strength = 2.0;
                else if (lastCMF > 0.05) strength = 1.5;
                else if (lastCMF > 0) strength = 0.8;
                else if (lastCMF < -0.25) strength = -2.5;  // Strong distribution
                else if (lastCMF < -0.15) strength = -2.0;
                else if (lastCMF < -0.05) strength = -1.5;
                else if (lastCMF < 0) strength = -0.8;
                
                // Croisement de zéro
                if (lastCMF > 0 && prevCMF <= 0) strength = 2.0;
                else if (lastCMF < 0 && prevCMF >= 0) strength = -2.0;
                
                signals.volume.push({
                    name: 'CMF',
                    value: lastCMF,
                    signal: strength,
                    weight: 1.7,
                    category: 'volume',
                    description: lastCMF > 0.15 ? `Strong accumulation (CMF: ${lastCMF.toFixed(3)})` :
                                lastCMF < -0.15 ? `Strong distribution (CMF: ${lastCMF.toFixed(3)})` :
                                lastCMF > 0 ? 'Buying pressure' : 'Selling pressure'
                });
                
                console.log(`✅ CMF: ${lastCMF.toFixed(3)} | Signal: ${strength.toFixed(2)}`);
            }
        } catch (error) {
            console.warn('⚠ CMF calculation failed:', error);
        }
        
        // ========================
        // 1⃣4⃣ ELDER RAY (Bull Power & Bear Power)
        // ========================
        try {
            const elderRay = this.calculateElderRay(prices);
            if (elderRay.bullPower.length > 0) {
                const lastBullPower = elderRay.bullPower[elderRay.bullPower.length - 1][1];
                const lastBearPower = elderRay.bearPower[elderRay.bearPower.length - 1][1];
                const prevBullPower = elderRay.bullPower[elderRay.bullPower.length - 2]?.[1] || lastBullPower;
                const prevBearPower = elderRay.bearPower[elderRay.bearPower.length - 2]?.[1] || lastBearPower;
                
                let strength = 0;
                
                // Bull Power positif, Bear Power négatif = uptrend
                if (lastBullPower > 0 && lastBearPower > 0) strength = 2.5;         // Very bullish
                else if (lastBullPower > 0 && lastBearPower > -1) strength = 2.0;
                else if (lastBullPower > 0) strength = 1.5;
                else if (lastBullPower < 0 && lastBearPower < 0) strength = -2.5;   // Very bearish
                else if (lastBullPower < 0 && lastBearPower < 1) strength = -2.0;
                else if (lastBearPower < 0) strength = -1.5;
                
                // Renforcement de tendance
                if (lastBullPower > prevBullPower && lastBullPower > 0) strength += 0.5;
                if (lastBearPower < prevBearPower && lastBearPower < 0) strength -= 0.5;
                
                signals.composite.push({
                    name: 'Elder Ray',
                    value: lastBullPower - lastBearPower,
                    signal: strength,
                    weight: 1.6,
                    category: 'composite',
                    description: lastBullPower > 0 && lastBearPower > 0 ? 'Bulls in control' :
                                lastBullPower < 0 && lastBearPower < 0 ? 'Bears in control' :
                                lastBullPower > 0 ? 'Bull power positive' : 'Bear power negative'
                });
                
                console.log(`✅ Elder Ray: Bull=${lastBullPower.toFixed(2)}, Bear=${lastBearPower.toFixed(2)} | Signal: ${strength.toFixed(2)}`);
            }
        } catch (error) {
            console.warn('⚠ Elder Ray calculation failed:', error);
        }
        
        console.log(`📊 Total indicators collected: ${Object.values(signals).flat().length}`);
        
        return signals;
    },

    // 📈 Analyse des tendances par horizon temporel - VERSION CORRIGÉE
    analyzeTrendsByHorizon(prices) {
        const analysis = {
            short: { period: 30, trend: 0, strength: 0, volatility: 0 },    // ~1 mois
            medium: { period: 90, trend: 0, strength: 0, volatility: 0 },   // ~3 mois
            long: { period: 250, trend: 0, strength: 0, volatility: 0 }     // ~1 an
        };
        
        // Analyse court terme (30 jours)
        if (prices.length >= 30) {
            const shortPrices = prices.slice(-30);
            const shortChange = ((shortPrices[shortPrices.length - 1][1] - shortPrices[0][1]) / shortPrices[0][1]) * 100;
            const shortVolatility = this.calculateVolatility(shortPrices);
            
            analysis.short.trend = isNaN(shortChange) ? 0 : shortChange;
            analysis.short.strength = Math.abs(analysis.short.trend) > 15 ? 2.5 : Math.abs(analysis.short.trend) > 8 ? 1.8 : Math.abs(analysis.short.trend) > 3 ? 1.0 : 0.5;
            analysis.short.volatility = isNaN(shortVolatility) ? 0 : shortVolatility;
        }
        
        // Analyse moyen terme (90 jours)
        if (prices.length >= 90) {
            const mediumPrices = prices.slice(-90);
            const mediumChange = ((mediumPrices[mediumPrices.length - 1][1] - mediumPrices[0][1]) / mediumPrices[0][1]) * 100;
            const mediumVolatility = this.calculateVolatility(mediumPrices);
            
            analysis.medium.trend = isNaN(mediumChange) ? 0 : mediumChange;
            analysis.medium.strength = Math.abs(analysis.medium.trend) > 30 ? 2.5 : Math.abs(analysis.medium.trend) > 15 ? 1.8 : Math.abs(analysis.medium.trend) > 5 ? 1.0 : 0.5;
            analysis.medium.volatility = isNaN(mediumVolatility) ? 0 : mediumVolatility;
        }
        
        // Analyse long terme (250 jours)
        if (prices.length >= 250) {
            const longPrices = prices.slice(-250);
            const longChange = ((longPrices[longPrices.length - 1][1] - longPrices[0][1]) / longPrices[0][1]) * 100;
            const longVolatility = this.calculateVolatility(longPrices);
            
            analysis.long.trend = isNaN(longChange) ? 0 : longChange;
            analysis.long.strength = Math.abs(analysis.long.trend) > 60 ? 2.5 : Math.abs(analysis.long.trend) > 30 ? 1.8 : Math.abs(analysis.long.trend) > 10 ? 1.0 : 0.5;
            analysis.long.volatility = isNaN(longVolatility) ? 0 : longVolatility;
        }
        
        console.log('📈 Trend Analysis:', {
            short: `${analysis.short.trend.toFixed(1)}% (strength: ${analysis.short.strength.toFixed(1)})`,
            medium: `${analysis.medium.trend.toFixed(1)}% (strength: ${analysis.medium.strength.toFixed(1)})`,
            long: `${analysis.long.trend.toFixed(1)}% (strength: ${analysis.long.strength.toFixed(1)})`
        });
        
        return analysis;
    },

    // Helper: Calculer la volatilité d'une série de prix - VERSION CORRIGÉE
    calculateVolatility(prices) {
        if (!prices || prices.length < 2) return 0;
        
        const returns = [];
        for (let i = 1; i < prices.length; i++) {
            const prevPrice = prices[i-1][1];
            const currPrice = prices[i][1];
            
            if (prevPrice && prevPrice > 0 && currPrice) {
                returns.push((currPrice - prevPrice) / prevPrice);
            }
        }
        
        if (returns.length === 0) return 0;
        
        const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
        const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
        const stdDev = Math.sqrt(variance);
        
        const annualizedVol = stdDev * Math.sqrt(252) * 100;
        
        return isNaN(annualizedVol) ? 0 : annualizedVol;
    },

    // 🎯 Calculer le score de confiance IA global
    calculateAIConfidenceScore(signals) {
        let totalScore = 0;
        let totalWeight = 0;
        
        let bullishSignals = 0;
        let neutralSignals = 0;
        let bearishSignals = 0;
        
        const allSignals = [];
        
        // Calculer le score pondéré
        Object.values(signals).forEach(category => {
            category.forEach(indicator => {
                const signal = indicator.signal || 0;
                const weight = indicator.weight || 1;
                
                const weightedSignal = signal * weight;
                totalScore += weightedSignal;
                totalWeight += weight;
                
                allSignals.push(indicator);
                
                if (signal > 0.5) bullishSignals++;
                else if (signal < -0.5) bearishSignals++;
                else neutralSignals++;
            });
        });
        
        // ✅ FIX: Vérifier division par zéro
        if (totalWeight === 0) {
            console.warn('⚠ Total weight is zero, returning neutral score (50)');
            return {
                score: 50,
                rating: 'NEUTRAL',
                bullishSignals: 0,
                neutralSignals: 0,
                bearishSignals: 0,
                totalIndicators: 0,
                allSignals: []
            };
        }
        
        // Normaliser le score sur 100
        // Le signal max possible par indicateur est ±2.5
        const maxPossibleScore = totalWeight * 2.5;
        const minPossibleScore = totalWeight * -2.5;
        
        // Normaliser entre 0 et 100
        const normalizedScore = ((totalScore - minPossibleScore) / (maxPossibleScore - minPossibleScore)) * 100;
        const finalScore = Math.max(0, Math.min(100, normalizedScore));
        
        // ✅ FIX: Vérifier que le résultat est un nombre valide
        if (isNaN(finalScore)) {
            console.error('❌ Final score calculation returned NaN', {
                totalScore,
                totalWeight,
                maxPossibleScore,
                minPossibleScore
            });
            return {
                score: 50,
                rating: 'NEUTRAL',
                bullishSignals,
                neutralSignals,
                bearishSignals,
                totalIndicators: bullishSignals + neutralSignals + bearishSignals,
                allSignals
            };
        }
        
        // Déterminer le rating
        let rating = '';
        if (finalScore >= 85) rating = 'EXTREMELY BULLISH';
        else if (finalScore >= 75) rating = 'VERY BULLISH';
        else if (finalScore >= 65) rating = 'BULLISH';
        else if (finalScore >= 55) rating = 'MODERATELY BULLISH';
        else if (finalScore >= 45) rating = 'NEUTRAL';
        else if (finalScore >= 35) rating = 'MODERATELY BEARISH';
        else if (finalScore >= 25) rating = 'BEARISH';
        else if (finalScore >= 15) rating = 'VERY BEARISH';
        else rating = 'EXTREMELY BEARISH';
        
        console.log(`🎯 AI Confidence Score: ${finalScore.toFixed(1)}/100 (${rating})`);
        console.log(`📊 Signals: ${bullishSignals} bullish, ${neutralSignals} neutral, ${bearishSignals} bearish`);
        
        return {
            score: finalScore,
            rating,
            bullishSignals,
            neutralSignals,
            bearishSignals,
            totalIndicators: bullishSignals + neutralSignals + bearishSignals,
            allSignals
        };
    },

    // 🎯 Générer recommandations différenciées par horizon
    generateHorizonRecommendations(aiScore, signals, trendAnalysis) {
        return {
            '1y': this.generateSingleHorizon(aiScore, signals, trendAnalysis, 1, 'short'),
            '2y': this.generateSingleHorizon(aiScore, signals, trendAnalysis, 2, 'medium'),
            '5y': this.generateSingleHorizon(aiScore, signals, trendAnalysis, 5, 'long')
        };
    },

    // 📊 Calculer le score d'une catégorie d'indicateurs - VERSION CORRIGÉE
    calculateCategoryScore(categorySignals) {
        if (!categorySignals || categorySignals.length === 0) {
            console.warn('⚠ Empty category signals, returning neutral score (50)');
            return 50;
        }
        
        let totalScore = 0;
        let totalWeight = 0;
        
        categorySignals.forEach(indicator => {
            const signal = indicator.signal || 0;
            const weight = indicator.weight || 1;
            
            totalScore += signal * weight;
            totalWeight += weight;
        });
        
        // ✅ FIX: Vérifier division par zéro
        if (totalWeight === 0) {
            console.warn('⚠ Total weight is zero, returning neutral score (50)');
            return 50;
        }
        
        const maxPossible = totalWeight * 2.5;
        const minPossible = totalWeight * -2.5;
        
        const normalized = ((totalScore - minPossible) / (maxPossible - minPossible)) * 100;
        const finalScore = Math.max(0, Math.min(100, normalized));
        
        // ✅ FIX: Vérifier que le résultat est un nombre valide
        if (isNaN(finalScore)) {
            console.error('❌ Category score calculation returned NaN', {
                totalScore,
                totalWeight,
                maxPossible,
                minPossible,
                categorySignals
            });
            return 50;
        }
        
        return finalScore;
    },

    // 📊 Générer une recommandation pour un horizon spécifique - VERSION CORRIGÉE
    generateSingleHorizon(aiScore, signals, trendAnalysis, years, trendType) {
        const baseScore = aiScore.score || 50;
        let adjustedScore = baseScore;
        
        // ✅ PONDÉRATION DIFFÉRENTE SELON L'HORIZON
        if (years === 1) {
            // COURT TERME (1 an) : Priorité MOMENTUM + VOLUME
            const momentumSignals = signals.momentum || [];
            const volumeSignals = signals.volume || [];
            
            const momentumScore = this.calculateCategoryScore(momentumSignals);
            const volumeScore = this.calculateCategoryScore(volumeSignals);
            
            // Pondération forte sur momentum/volume
            adjustedScore = (baseScore * 0.5) + (momentumScore * 0.3) + (volumeScore * 0.2);
            
            // Bonus/Malus tendance court terme
            const shortTrend = trendAnalysis.short.trend || 0;
            if (shortTrend > 8) adjustedScore += 6;
            else if (shortTrend > 3) adjustedScore += 3;
            else if (shortTrend < -8) adjustedScore -= 6;
            else if (shortTrend < -3) adjustedScore -= 3;
            
            // Pénalité si haute volatilité court terme
            const shortVol = trendAnalysis.short.volatility || 0;
            if (shortVol > 40) adjustedScore -= 4;
            
        } else if (years === 2) {
            // MOYEN TERME (2 ans) : Équilibre TREND + MOMENTUM + COMPOSITE
            const trendSignals = signals.trend || [];
            const momentumSignals = signals.momentum || [];
            const compositeSignals = signals.composite || [];
            
            const trendScore = this.calculateCategoryScore(trendSignals);
            const momentumScore = this.calculateCategoryScore(momentumSignals);
            const compositeScore = this.calculateCategoryScore(compositeSignals);
            
            // Pondération équilibrée
            adjustedScore = (baseScore * 0.4) + (trendScore * 0.3) + (momentumScore * 0.2) + (compositeScore * 0.1);
            
            // Bonus/Malus tendance moyen terme
            const mediumTrend = trendAnalysis.medium.trend || 0;
            if (mediumTrend > 15) adjustedScore += 10;
            else if (mediumTrend > 5) adjustedScore += 5;
            else if (mediumTrend < -15) adjustedScore -= 10;
            else if (mediumTrend < -5) adjustedScore -= 5;
            
            // Légère pénalité si volatilité élevée
            const mediumVol = trendAnalysis.medium.volatility || 0;
            if (mediumVol > 35) adjustedScore -= 2;
            
        } else {
            // LONG TERME (5 ans) : Priorité TREND + COMPOSITE
            const trendSignals = signals.trend || [];
            const compositeSignals = signals.composite || [];
            
            const trendScore = this.calculateCategoryScore(trendSignals);
            const compositeScore = this.calculateCategoryScore(compositeSignals);
            
            // Pondération forte sur trend
            adjustedScore = (baseScore * 0.4) + (trendScore * 0.4) + (compositeScore * 0.2);
            
            // Bonus/Malus tendance long terme
            const longTrend = trendAnalysis.long.trend || 0;
            if (longTrend > 30) adjustedScore += 15;
            else if (longTrend > 10) adjustedScore += 8;
            else if (longTrend < -30) adjustedScore -= 15;
            else if (longTrend < -10) adjustedScore -= 8;
            
            // La volatilité a moins d'impact sur le long terme
            const longVol = trendAnalysis.long.volatility || 0;
            if (longVol < 20) adjustedScore += 3;
        }
        
        // ✅ FIX: Vérifier que adjustedScore est valide
        if (isNaN(adjustedScore)) {
            console.error('❌ Adjusted score is NaN, defaulting to base score', { baseScore, years });
            adjustedScore = baseScore;
        }
        
        // Limiter entre 0 et 100
        adjustedScore = Math.max(0, Math.min(100, adjustedScore));
        
        // ✅ DÉTERMINER RECOMMANDATION
        let recommendation = '';
        let confidence = 0;
        
        if (adjustedScore >= 75) {
            recommendation = 'BUY';
            confidence = Math.min(95, 75 + (adjustedScore - 75) * 0.8);
        } else if (adjustedScore >= 60) {
            recommendation = 'BUY';
            confidence = 60 + (adjustedScore - 60);
        } else if (adjustedScore >= 55) {
            recommendation = 'BUY';
            confidence = 55 + (adjustedScore - 55);
        } else if (adjustedScore >= 45) {
            recommendation = 'HOLD';
            confidence = 45 + Math.abs(adjustedScore - 50) * 0.5;
        } else if (adjustedScore >= 40) {
            recommendation = 'HOLD';
            confidence = 40 + (45 - adjustedScore);
        } else if (adjustedScore >= 30) {
            recommendation = 'SELL';
            confidence = 50 + (40 - adjustedScore);
        } else {
            recommendation = 'SELL';
            confidence = Math.min(95, 60 + (30 - adjustedScore) * 0.8);
        }
        
        // ✅ CALCUL POTENTIEL (basé sur la tendance ET le score) - VERSION CORRIGÉE
        let potentialMove = 0;
        
        if (years === 1) {
            const shortTrend = trendAnalysis.short.trend || 0;
            potentialMove = (adjustedScore - 50) * 0.4 + (shortTrend * 0.3);
        } else if (years === 2) {
            const mediumTrend = trendAnalysis.medium.trend || 0;
            potentialMove = (adjustedScore - 50) * 0.8 + (mediumTrend * 0.5);
        } else {
            const longTrend = trendAnalysis.long.trend || 0;
            potentialMove = (adjustedScore - 50) * 1.5 + (longTrend * 0.8);
        }
        
        // ✅ FIX: Vérifier que potentialMove est valide
        if (isNaN(potentialMove)) {
            console.error('❌ Potential move is NaN, defaulting to 0', { adjustedScore, years });
            potentialMove = 0;
        }
        
        // ✅ KEY DRIVERS DYNAMIQUES (basés sur les MEILLEURS indicateurs)
        const drivers = this.generateKeyDrivers(signals, trendAnalysis, years, adjustedScore);
        
        console.log(`📊 ${years}Y Horizon: ${recommendation} (${Math.round(confidence)}%) | Potential: ${potentialMove.toFixed(1)}% | Adjusted Score: ${adjustedScore.toFixed(1)}`);
        
        return {
            recommendation,
            confidence: Math.round(confidence),
            potentialMove: potentialMove.toFixed(1),
            drivers,
            adjustedScore: adjustedScore.toFixed(1)
        };
    },

    // 🔑 Générer les key drivers dynamiques - VERSION AMÉLIORÉE
    generateKeyDrivers(signals, trendAnalysis, years, adjustedScore) {
        const allSignals = [];
        
        // Collecter tous les signaux
        Object.values(signals).forEach(category => {
            if (Array.isArray(category)) {
                category.forEach(indicator => {
                    allSignals.push(indicator);
                });
            }
        });
        
        // Trier par force du signal (absolute value)
        allSignals.sort((a, b) => Math.abs(b.signal * b.weight) - Math.abs(a.signal * a.weight));
        
        const drivers = [];
        
        // ✅ DRIVER 1 : Multi-indicator consensus (toujours différent selon l'horizon)
        drivers.push(`Multi-indicator consensus: ${adjustedScore.toFixed(0)}/100`);
        
        // ✅ DRIVER 2 : Tendance SPÉCIFIQUE à l'horizon
        if (years === 1 && trendAnalysis.short) {
            const trend = trendAnalysis.short.trend || 0;
            if (Math.abs(trend) > 2) {
                const direction = trend > 0 ? 'uptrend' : 'downtrend';
                drivers.push(`Short-term ${direction} (${Math.abs(trend).toFixed(1)}%)`);
            }
        } else if (years === 2 && trendAnalysis.medium) {
            const trend = trendAnalysis.medium.trend || 0;
            if (Math.abs(trend) > 3) {
                const direction = trend > 0 ? 'uptrend' : 'downtrend';
                drivers.push(`Medium-term ${direction} (${Math.abs(trend).toFixed(1)}%)`);
            }
        } else if (years === 5 && trendAnalysis.long) {
            const trend = trendAnalysis.long.trend || 0;
            if (Math.abs(trend) > 5) {
                const direction = trend > 0 ? 'uptrend' : 'downtrend';
                drivers.push(`Long-term ${direction} (${Math.abs(trend).toFixed(1)}%)`);
            }
        }
        
        // ✅ DRIVER 3 : Top indicateur le plus fort
        if (allSignals.length > 0) {
            const topIndicator = allSignals[0];
            if (topIndicator && Math.abs(topIndicator.signal) > 1.0) {
                drivers.push(topIndicator.description);
            }
        }
        
        // ✅ DRIVER 4 : Catégorie dominante SELON L'HORIZON
        let dominantCategory = '';
        
        if (years === 1) {
            // Court terme : focus momentum
            const momentumScore = this.calculateCategoryScore(signals.momentum || []);
            if (Math.abs(momentumScore - 50) > 15) {
                dominantCategory = momentumScore > 50 ? 'Positive momentum indicators' : 'Negative momentum indicators';
            }
        } else if (years === 2) {
            // Moyen terme : focus trend
            const trendScore = this.calculateCategoryScore(signals.trend || []);
            if (Math.abs(trendScore - 50) > 15) {
                dominantCategory = trendScore > 50 ? 'Positive trend indicators' : 'Negative trend indicators';
            }
        } else {
            // Long terme : focus composite
            const compositeScore = this.calculateCategoryScore(signals.composite || []);
            if (Math.abs(compositeScore - 50) > 15) {
                dominantCategory = compositeScore > 50 ? 'Positive composite indicators' : 'Negative composite indicators';
            }
        }
        
        if (dominantCategory && drivers.length < 3) {
            drivers.push(dominantCategory);
        }
        
        // Assurer au moins 3 drivers
        while (drivers.length < 3 && allSignals.length > drivers.length - 1) {
            const nextIndicator = allSignals[drivers.length - 1];
            if (nextIndicator && nextIndicator.description) {
                drivers.push(nextIndicator.description);
            } else {
                break;
            }
        }
        
        // Limiter à 3 drivers maximum
        return drivers.slice(0, 3);
    },

    // 🖼 Afficher le score IA global
    displayAIRecommendation(aiScore, signals) {
        const scoreValueEl = document.getElementById('aiScoreValue');
        if (scoreValueEl) {
            scoreValueEl.textContent = aiScore.score.toFixed(0) + '/100';
        }
        
        const ratingEl = document.getElementById('aiScoreRating');
        if (ratingEl) {
            ratingEl.textContent = aiScore.rating;
            
            let scoreClass = '';
            if (aiScore.score >= 75) scoreClass = 'very-bullish';
            else if (aiScore.score >= 65) scoreClass = 'bullish';
            else if (aiScore.score >= 55) scoreClass = 'moderately-bullish';
            else if (aiScore.score >= 45) scoreClass = 'neutral';
            else if (aiScore.score >= 35) scoreClass = 'moderately-bearish';
            else if (aiScore.score >= 25) scoreClass = 'bearish';
            else scoreClass = 'very-bearish';
            
            ratingEl.className = `ai-score-rating ${scoreClass}`;
            
            const fillBarContainer = document.getElementById('aiScoreFill');
            if (fillBarContainer) {
                fillBarContainer.innerHTML = `<div class="ai-score-fill ${scoreClass}" style="width: ${aiScore.score}%"></div>`;
            }
        }
        
        const bullishEl = document.getElementById('bullishSignals');
        const neutralEl = document.getElementById('neutralSignals');
        const bearishEl = document.getElementById('bearishSignals');
        
        if (bullishEl) bullishEl.textContent = aiScore.bullishSignals;
        if (neutralEl) neutralEl.textContent = aiScore.neutralSignals;
        if (bearishEl) bearishEl.textContent = aiScore.bearishSignals;
    },

    // 🖼 Afficher les recommandations par horizon
    displayHorizonRecommendations(horizons) {
        this.displaySingleHorizon('1y', horizons['1y']);
        this.displaySingleHorizon('2y', horizons['2y']);
        this.displaySingleHorizon('5y', horizons['5y']);
    },

    // 🖼 Afficher une recommandation pour un horizon
    displaySingleHorizon(horizon, data) {
        const recEl = document.getElementById(`recommendation${horizon}`);
        if (recEl) {
            const recClass = this.getRecommendationClass(data.recommendation);
            recEl.innerHTML = `<div class='ai-rec-badge ${recClass}'>${data.recommendation}</div>`;
        }
        
        const targetEl = document.getElementById(`target${horizon}`);
        if (targetEl) {
            targetEl.textContent = `${data.potentialMove >= 0 ? '+' : ''}${data.potentialMove}% Potential`;
        }
        
        const confBarContainer = document.getElementById(`confidence${horizon}`);
        if (confBarContainer) {
            const recClass = this.getRecommendationClass(data.recommendation);
            confBarContainer.innerHTML = `<div class="ai-confidence-fill ${recClass}" style="width: ${data.confidence}%"></div>`;
        }
        
        const driversEl = document.getElementById(`drivers${horizon}`);
        if (driversEl) {
            driversEl.innerHTML = data.drivers.map(driver => 
                `<div class='ai-driver-item'><i class='fas fa-check-circle'></i> ${driver}</div>`
            ).join('');
        }
    },

    // 🎨 Obtenir la classe CSS pour une recommandation
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

    // 🖼 Afficher erreur si données insuffisantes
    displayAIError(message) {
        const scoreValueEl = document.getElementById('aiScoreValue');
        if (scoreValueEl) scoreValueEl.textContent = 'N/A';
        
        const ratingEl = document.getElementById('aiScoreRating');
        if (ratingEl) {
            ratingEl.textContent = message;
            ratingEl.className = 'ai-score-rating neutral';
        }
        
        const bullishEl = document.getElementById('bullishSignals');
        const neutralEl = document.getElementById('neutralSignals');
        const bearishEl = document.getElementById('bearishSignals');
        
        if (bullishEl) bullishEl.textContent = '0';
        if (neutralEl) neutralEl.textContent = '0';
        if (bearishEl) bearishEl.textContent = '0';
        
        ['1y', '2y', '5y'].forEach(horizon => {
            const recEl = document.getElementById(`recommendation${horizon}`);
            if (recEl) recEl.innerHTML = `<div class='ai-rec-badge hold'>DATA ERROR</div>`;
            
            const targetEl = document.getElementById(`target${horizon}`);
            if (targetEl) targetEl.textContent = 'N/A';
            
            const confBarContainer = document.getElementById(`confidence${horizon}`);
            if (confBarContainer) {
                confBarContainer.innerHTML = `<div class="ai-confidence-fill neutral" style="width: 0%"></div>`;
            }
            
            const driversEl = document.getElementById(`drivers${horizon}`);
            if (driversEl) {
                driversEl.innerHTML = `<div class='ai-driver-item'><i class='fas fa-exclamation-triangle'></i> ${message}</div>`;
            }
        });
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
    },

    // ============================================
    // 📊 EXPORT TO CSV - TECHNICAL INDICATORS ONLY (No Raw API Data)
    // ============================================

    exportToCSV() {
        console.log('📊 Exporting technical indicators to CSV...');
        
        if (!this.stockData || !this.stockData.prices || this.stockData.prices.length === 0) {
            alert('⚠ No data available to export. Please load a stock first.');
            return;
        }
        
        const symbol = this.currentSymbol;
        const period = this.currentPeriod;
        const prices = this.stockData.prices;
        
        try {
            // ✅ CALCULER TOUS LES INDICATEURS TECHNIQUES
            const rsi = this.calculateRSI(prices);
            const macd = this.calculateMACD(prices);
            const stochastic = this.calculateStochastic(prices);
            const williams = this.calculateWilliams(prices);
            const adx = this.calculateADX(prices);
            const obv = this.calculateOBV(prices);
            const atr = this.calculateATR(prices);
            const mfi = this.calculateMFI(prices);
            const cci = this.calculateCCI(prices);
            const ultimateOsc = this.calculateUltimateOscillator(prices);
            const roc = this.calculateROC(prices);
            const aroon = this.calculateAroon(prices);
            const cmf = this.calculateCMF(prices);
            const elderRay = this.calculateElderRay(prices);
            
            // ✅ HEADERS CSV - INDICATEURS TECHNIQUES UNIQUEMENT (PAS DE PRIX BRUTS)
            const headers = [
                'Date',
                'RSI',
                'MACD_Line',
                'MACD_Signal',
                'MACD_Histogram',
                'Stochastic_K',
                'Stochastic_D',
                'Williams_R',
                'ADX',
                'ADX_PlusDI',
                'ADX_MinusDI',
                'OBV_Normalized',
                'ATR',
                'MFI',
                'CCI',
                'Ultimate_Oscillator',
                'ROC',
                'Aroon_Up',
                'Aroon_Down',
                'CMF',
                'Elder_Bull_Power',
                'Elder_Bear_Power'
            ];
            
            // ✅ CRÉER UNE MAP POUR CHAQUE INDICATEUR (par timestamp)
            const dataByTimestamp = new Map();
            
            // Initialiser avec les dates uniquement
            prices.forEach(p => {
                dataByTimestamp.set(p.timestamp, {
                    date: new Date(p.timestamp).toISOString().split('T')[0]
                });
            });
            
            // Ajouter RSI
            rsi.forEach(([timestamp, value]) => {
                if (dataByTimestamp.has(timestamp)) {
                    dataByTimestamp.get(timestamp).rsi = value.toFixed(2);
                }
            });
            
            // Ajouter MACD
            macd.macdLine.forEach(([timestamp, value], idx) => {
                if (dataByTimestamp.has(timestamp)) {
                    const data = dataByTimestamp.get(timestamp);
                    data.macd_line = value.toFixed(4);
                    data.macd_signal = macd.signalLine[idx]?.[1]?.toFixed(4) || '';
                    data.macd_histogram = macd.histogram[idx]?.[1]?.toFixed(4) || '';
                }
            });
            
            // Ajouter Stochastic
            stochastic.k.forEach(([timestamp, value], idx) => {
                if (dataByTimestamp.has(timestamp)) {
                    const data = dataByTimestamp.get(timestamp);
                    data.stochastic_k = value.toFixed(2);
                    data.stochastic_d = stochastic.d[idx]?.[1]?.toFixed(2) || '';
                }
            });
            
            // Ajouter Williams %R
            williams.forEach(([timestamp, value]) => {
                if (dataByTimestamp.has(timestamp)) {
                    dataByTimestamp.get(timestamp).williams_r = value.toFixed(2);
                }
            });
            
            // Ajouter ADX
            adx.adx.forEach(([timestamp, value], idx) => {
                if (dataByTimestamp.has(timestamp)) {
                    const data = dataByTimestamp.get(timestamp);
                    data.adx = value.toFixed(2);
                    data.adx_plusdi = adx.plusDI[idx]?.[1]?.toFixed(2) || '';
                    data.adx_minusdi = adx.minusDI[idx]?.[1]?.toFixed(2) || '';
                }
            });
            
            // ✅ OBV NORMALISÉ (pas de valeurs brutes)
            // Normaliser OBV entre -100 et +100 pour éviter de redistribuer les volumes
            const obvValues = obv.map(([_, val]) => val);
            const obvMin = Math.min(...obvValues);
            const obvMax = Math.max(...obvValues);
            const obvRange = obvMax - obvMin;
            
            obv.forEach(([timestamp, value]) => {
                if (dataByTimestamp.has(timestamp)) {
                    const normalizedOBV = obvRange !== 0 ? ((value - obvMin) / obvRange) * 200 - 100 : 0;
                    dataByTimestamp.get(timestamp).obv_normalized = normalizedOBV.toFixed(2);
                }
            });
            
            // Ajouter ATR
            atr.forEach(([timestamp, value]) => {
                if (dataByTimestamp.has(timestamp)) {
                    dataByTimestamp.get(timestamp).atr = value.toFixed(2);
                }
            });
            
            // Ajouter MFI
            mfi.forEach(([timestamp, value]) => {
                if (dataByTimestamp.has(timestamp)) {
                    dataByTimestamp.get(timestamp).mfi = value.toFixed(2);
                }
            });
            
            // Ajouter CCI
            cci.forEach(([timestamp, value]) => {
                if (dataByTimestamp.has(timestamp)) {
                    dataByTimestamp.get(timestamp).cci = value.toFixed(2);
                }
            });
            
            // Ajouter Ultimate Oscillator
            ultimateOsc.forEach(([timestamp, value]) => {
                if (dataByTimestamp.has(timestamp)) {
                    dataByTimestamp.get(timestamp).ultimate_oscillator = value.toFixed(2);
                }
            });
            
            // Ajouter ROC
            roc.forEach(([timestamp, value]) => {
                if (dataByTimestamp.has(timestamp)) {
                    dataByTimestamp.get(timestamp).roc = value.toFixed(2);
                }
            });
            
            // Ajouter Aroon
            aroon.up.forEach(([timestamp, value], idx) => {
                if (dataByTimestamp.has(timestamp)) {
                    const data = dataByTimestamp.get(timestamp);
                    data.aroon_up = value.toFixed(2);
                    data.aroon_down = aroon.down[idx]?.[1]?.toFixed(2) || '';
                }
            });
            
            // Ajouter CMF
            cmf.forEach(([timestamp, value]) => {
                if (dataByTimestamp.has(timestamp)) {
                    dataByTimestamp.get(timestamp).cmf = value.toFixed(4);
                }
            });
            
            // Ajouter Elder Ray
            elderRay.bullPower.forEach(([timestamp, value], idx) => {
                if (dataByTimestamp.has(timestamp)) {
                    const data = dataByTimestamp.get(timestamp);
                    data.elder_bull_power = value.toFixed(2);
                    data.elder_bear_power = elderRay.bearPower[idx]?.[1]?.toFixed(2) || '';
                }
            });
            
            // ✅ CONSTRUIRE LE CSV
            let csvContent = '';
            
            // Header avec métadonnées
            csvContent += `AlphaVault AI - Technical Analysis Report\n`;
            csvContent += `Symbol: ${symbol}\n`;
            csvContent += `Period: ${period}\n`;
            csvContent += `Report Date: ${new Date().toLocaleDateString('en-US')}\n`;
            csvContent += `\n`;
            csvContent += `IMPORTANT: This report contains ONLY technical indicators calculated by AlphaVault AI.\n`;
            csvContent += `No raw market data (prices, volumes) is included to comply with data redistribution policies.\n`;
            csvContent += `\n`;
            
            csvContent += headers.join(',') + '\n';
            
            // Trier par timestamp (du plus ancien au plus récent)
            const sortedTimestamps = Array.from(dataByTimestamp.keys()).sort((a, b) => a - b);
            
            sortedTimestamps.forEach(timestamp => {
                const row = dataByTimestamp.get(timestamp);
                const values = [
                    row.date || '',
                    row.rsi || '',
                    row.macd_line || '',
                    row.macd_signal || '',
                    row.macd_histogram || '',
                    row.stochastic_k || '',
                    row.stochastic_d || '',
                    row.williams_r || '',
                    row.adx || '',
                    row.adx_plusdi || '',
                    row.adx_minusdi || '',
                    row.obv_normalized || '',
                    row.atr || '',
                    row.mfi || '',
                    row.cci || '',
                    row.ultimate_oscillator || '',
                    row.roc || '',
                    row.aroon_up || '',
                    row.aroon_down || '',
                    row.cmf || '',
                    row.elder_bull_power || '',
                    row.elder_bear_power || ''
                ];
                
                csvContent += values.join(',') + '\n';
            });
            
            // ✅ TÉLÉCHARGER LE FICHIER
            const filename = `AlphaVault_${symbol}_TechnicalIndicators_${period}_${new Date().toISOString().split('T')[0]}.csv`;
            this.downloadFile(csvContent, filename, 'text/csv');
            
            console.log('✅ CSV exported successfully:', filename);
            this.showNotification('✅ Technical Indicators exported to CSV!', 'success');
            
        } catch (error) {
            console.error('❌ CSV export failed:', error);
            alert('❌ Export failed. Please try again.');
        }
    },

    // ============================================
    // 📄 EXPORT TO PDF - ULTRA PREMIUM REPORT V3.5 (FINAL CORRECTED)
    // ============================================

    async exportToPDF() {
        console.log('📄 Generating premium PDF report...');
        
        if (!this.stockData || !this.stockData.prices || this.stockData.prices.length === 0) {
            alert('⚠ No data available to export. Please load a stock first.');
            return;
        }
        
        // ============================================
        // 🎯 SHOW PROGRESS MODAL
        // ============================================
        this.showProgressModal();
        
        try {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            
            const symbol = this.currentSymbol;
            const period = this.currentPeriod;
            const quote = this.stockData.quote || {};
            const currentDate = new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            let yPosition = 20;
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 15;
            const contentWidth = pageWidth - (2 * margin);
            
            // Update progress
            this.updateProgress(10, 'Loading logos...');
            
            // ============================================
            // 🎨 LOAD LOGO IMAGE & COMPANY LOGO
            // ============================================
            const logoBase64 = await this.loadImageAsBase64('apple-touch-icon.png');
            const companyLogoBase64 = await this.getCompanyLogoWithFallback(symbol, quote.name || symbol);
            
            this.updateProgress(20, 'Creating cover page...');
            
            // ============================================
            // 🎨 PAGE 1 : ULTRA PREMIUM COVER PAGE (MINIMALISTE)
            // ============================================

            // ✨ GRADIENT BACKGROUND (Simplifié - Bleu → Violet)
            const gradientSteps = 100;
            for (let i = 0; i < gradientSteps; i++) {
                const ratio = i / gradientSteps;
                
                // Gradient doux : Bleu profond → Violet
                const r = Math.round(102 + (118 - 102) * ratio);
                const g = Math.round(126 + (75 - 126) * ratio);
                const b = Math.round(234 + (162 - 234) * ratio);
                
                pdf.setFillColor(r, g, b);
                pdf.rect(0, (pageHeight / gradientSteps) * i, pageWidth, (pageHeight / gradientSteps) + 0.5, 'F');
            }

            // ✨ LOGO PREMIUM (Centré en haut - TAILLE RÉDUITE)
            const logoSize = 40;
            const logoX = (pageWidth - logoSize) / 2;
            const logoY = 35;

            // Subtle glow effect (3 couches légères)
            for (let i = 3; i > 0; i--) {
                const opacity = 0.08 * i;
                pdf.setFillColor(255, 255, 255, opacity);
                const glowSize = logoSize + (i * 8);
                pdf.circle(logoX + logoSize / 2, logoY + logoSize / 2, glowSize / 2, 'F');
            }

            // Logo image
            if (logoBase64) {
                pdf.addImage(logoBase64, 'PNG', logoX, logoY, logoSize, logoSize);
            } else {
                console.warn('⚠ Logo not loaded, using fallback');
                pdf.setFillColor(255, 255, 255, 0.95);
                pdf.circle(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2, 'F');
                pdf.setTextColor(102, 126, 234);
                pdf.setFontSize(20);
                pdf.setFont('helvetica', 'bold');
                pdf.text('AV', pageWidth / 2, logoY + logoSize / 2 + 5, { align: 'center' });
            }

            // ✨ BRAND NAME (CENTRÉ)
            yPosition = logoY + logoSize + 18;

            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(20);
            pdf.setFont('helvetica', 'bold');
            pdf.text('ALPHAVAULT AI', pageWidth / 2, yPosition, { 
                align: 'center', 
                charSpace: 5
            });

            yPosition += 9;
            pdf.setFontSize(8.5);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(255, 255, 255, 0.85);
            pdf.text('Premium Financial Intelligence Platform', pageWidth / 2, yPosition, { 
                align: 'center',
                charSpace: 0.5
            });

            // ✨ DIVIDER (CENTRÉ)
            yPosition += 11;
            pdf.setDrawColor(255, 255, 255, 0.4);
            pdf.setLineWidth(0.5);
            const dividerWidth = 60;
            pdf.line((pageWidth - dividerWidth) / 2, yPosition, (pageWidth + dividerWidth) / 2, yPosition);

            // ✨ MAIN TITLE (CENTRÉ)
            yPosition += 20;
            pdf.setFontSize(34);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(255, 255, 255);
            pdf.text('TECHNICAL ANALYSIS', pageWidth / 2, yPosition, { 
                align: 'center', 
                charSpace: 3
            });

            yPosition += 14;
            pdf.setFontSize(30);
            pdf.text('REPORT', pageWidth / 2, yPosition, { 
                align: 'center', 
                charSpace: 6
            });

            // ✨ COMPANY LOGO BADGE (RÉDUIT + SANS FOND NOIR)
            yPosition += 20;
            const badgeSize = 70; // ✅ RÉDUIT DE 90px → 70px
            const badgeX = (pageWidth - badgeSize) / 2;
            const badgeY = yPosition;

            // ✅ CERCLE BLANC TRANSPARENT (pas de fond noir/gris)
            pdf.setFillColor(255, 255, 255, 0.18); // Blanc très transparent
            pdf.circle(pageWidth / 2, badgeY + badgeSize / 2, badgeSize / 2, 'F');

            // Bordure subtile blanche
            pdf.setDrawColor(255, 255, 255, 0.35);
            pdf.setLineWidth(0.6);
            pdf.circle(pageWidth / 2, badgeY + badgeSize / 2, badgeSize / 2, 'S');

            // Company logo dans le badge (RÉDUIT)
            if (companyLogoBase64 && !companyLogoBase64.startsWith('<div')) {
                const companyLogoSize = 45; // ✅ RÉDUIT DE 60px → 45px
                const companyLogoX = (pageWidth - companyLogoSize) / 2;
                const companyLogoY = badgeY + (badgeSize - companyLogoSize) / 2;
                
                pdf.addImage(companyLogoBase64, 'PNG', companyLogoX, companyLogoY, companyLogoSize, companyLogoSize);
            } else {
                // Fallback : Symbole en texte (CENTRÉ)
                pdf.setFontSize(28); // ✅ RÉDUIT DE 36 → 28
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(255, 255, 255);
                pdf.text(symbol, pageWidth / 2, badgeY + badgeSize / 2 + 8, { align: 'center' });
            }

            // ✨ COMPANY NAME (CENTRÉ)
            yPosition = badgeY + badgeSize + 14;

            if (quote.name && quote.name !== symbol) {
                pdf.setFontSize(15);
                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(255, 255, 255, 0.95);
                
                let companyName = quote.name;
                if (companyName.length > 40) {
                    companyName = companyName.substring(0, 37) + '...';
                }
                
                pdf.text(companyName, pageWidth / 2, yPosition, { 
                    align: 'center',
                    charSpace: 0.3
                });
                yPosition += 14;
            }

            // ✨ INFO CARD (Période + Date) - CENTRÉE
            yPosition += 2;
            const cardHeight = 42;
            const cardY = yPosition;

            // Card background
            pdf.setFillColor(255, 255, 255, 0.22);
            pdf.setDrawColor(255, 255, 255, 0.5);
            pdf.setLineWidth(0.6);
            pdf.roundedRect(margin + 8, cardY, contentWidth - 16, cardHeight, 12, 12, 'FD');

            // Left section - Period (CENTRÉ dans sa zone)
            const leftZoneWidth = (contentWidth - 16) / 2;
            const leftCenterX = margin + 8 + leftZoneWidth / 2;
            
            pdf.setFontSize(7.5);
            pdf.setTextColor(255, 255, 255, 0.9);
            pdf.setFont('helvetica', 'bold');
            pdf.text('ANALYSIS PERIOD', leftCenterX, cardY + 12, { align: 'center' });

            pdf.setFontSize(15);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(255, 255, 255);
            pdf.text(period.toUpperCase(), leftCenterX, cardY + 26, { align: 'center' });

            // Center divider
            pdf.setDrawColor(255, 255, 255, 0.35);
            pdf.setLineWidth(0.4);
            pdf.line(pageWidth / 2, cardY + 9, pageWidth / 2, cardY + cardHeight - 9);

            // Right section - Date (CENTRÉ dans sa zone)
            const rightCenterX = pageWidth / 2 + leftZoneWidth / 2;
            
            pdf.setFontSize(7.5);
            pdf.setTextColor(255, 255, 255, 0.9);
            pdf.setFont('helvetica', 'bold');
            pdf.text('REPORT GENERATED', rightCenterX, cardY + 12, { align: 'center' });

            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(255, 255, 255);
            const formattedDate = new Date().toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
            pdf.text(formattedDate, rightCenterX, cardY + 24, { align: 'center' });

            pdf.setFontSize(7.5);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(255, 255, 255, 0.85);
            const timestamp = new Date().toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
            pdf.text(timestamp + ' UTC', rightCenterX, cardY + 33, { align: 'center' });

            // ✨ FOOTER (CENTRÉ)
            const footerY = pageHeight - 38;

            // Copyright (CENTRÉ)
            pdf.setFontSize(7.5);
            pdf.setTextColor(255, 255, 255, 0.9);
            pdf.setFont('helvetica', 'normal');
            pdf.text(`© ${new Date().getFullYear()} AlphaVault AI. All rights reserved.`, 
                    pageWidth / 2, footerY, { align: 'center' });

            // Confidential (CENTRÉ)
            pdf.setFontSize(6.5);
            pdf.setTextColor(255, 255, 255, 0.75);
            pdf.text('Confidential & Proprietary', pageWidth / 2, footerY + 5, { align: 'center' });
            
            this.updateProgress(35, 'Generating executive summary...');
            
            // ============================================
            // 📊 PAGE 2 : EXECUTIVE SUMMARY (REDESIGNED)
            // ============================================
            
            pdf.addPage();
            
            // Light professional background
            pdf.setFillColor(248, 250, 252);
            pdf.rect(0, 0, pageWidth, pageHeight, 'F');
            
            yPosition = 25;
            
            // Premium Header Bar (GRADIENT BLEU → VIOLET)
            this.addGradientHeader(pdf, pageWidth, pageHeight);
            
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.text('EXECUTIVE SUMMARY', margin, 11);
            
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            pdf.text(symbol, pageWidth - margin, 11, { align: 'right' });
            
            yPosition = 35;
            
            // Section Title
            pdf.setFontSize(24);
            pdf.setTextColor(102, 126, 234);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Key Performance Metrics', margin, yPosition);
            yPosition += 18;
            
            // ============================================
            // 📊 METRICS CARDS
            // ============================================
            
            const alphaScore = this.calculateAlphaVaultScore();
            const marketStrength = this.calculateMarketStrength();
            
            // AlphaVault Score Card
            pdf.setFillColor(255, 255, 255);
            pdf.setDrawColor(102, 126, 234);
            pdf.setLineWidth(0.8);
            pdf.roundedRect(margin, yPosition, (contentWidth / 2) - 5, 40, 8, 8, 'FD');
            
            pdf.setFontSize(11);
            pdf.setTextColor(30, 41, 59);
            pdf.setFont('helvetica', 'bold');
            pdf.text('AlphaVault Score', margin + 8, yPosition + 12);
            
            pdf.setFontSize(36);
            pdf.setTextColor(102, 126, 234);
            pdf.setFont('helvetica', 'bold');
            pdf.text(`${alphaScore}`, margin + 8, yPosition + 32);
            
            pdf.setFontSize(16);
            pdf.setTextColor(148, 163, 184);
            pdf.text('/100', margin + 32, yPosition + 32);
            
            // Market Strength Card
            pdf.setFillColor(255, 255, 255);
            pdf.roundedRect(margin + (contentWidth / 2) + 5, yPosition, (contentWidth / 2) - 5, 40, 8, 8, 'FD');
            
            pdf.setFontSize(11);
            pdf.setTextColor(30, 41, 59);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Market Strength', margin + (contentWidth / 2) + 13, yPosition + 12);
            
            let strengthText = marketStrength >= 75 ? 'Very Strong' :
                            marketStrength >= 60 ? 'Strong' :
                            marketStrength >= 45 ? 'Moderate' :
                            marketStrength >= 30 ? 'Weak' : 'Very Weak';
            
            let strengthColor = marketStrength >= 60 ? [16, 185, 129] : 
                            marketStrength >= 45 ? [251, 191, 36] : [239, 68, 68];
            
            pdf.setFontSize(20);
            pdf.setTextColor(...strengthColor);
            pdf.setFont('helvetica', 'bold');
            pdf.text(strengthText, margin + (contentWidth / 2) + 13, yPosition + 32);
            
            yPosition += 56;
            
            // ============================================
            // 🤖 AI RECOMMENDATIONS
            // ============================================
            
            pdf.setFontSize(20);
            pdf.setTextColor(102, 126, 234);
            pdf.setFont('helvetica', 'bold');
            pdf.text('AI-Powered Recommendations', margin, yPosition);
            yPosition += 15;
            
            const prices = this.stockData.prices;
            const technicalSignals = this.collectAllTechnicalSignals(prices);
            const trendAnalysis = this.analyzeTrendsByHorizon(prices);
            const aiScore = this.calculateAIConfidenceScore(technicalSignals);
            const horizonRecommendations = this.generateHorizonRecommendations(aiScore, technicalSignals, trendAnalysis);
            
            const horizons = [
                { key: '1y', label: '1 Year Horizon', icon: '>' },
                { key: '2y', label: '2 Years Horizon', icon: '>>' },
                { key: '5y', label: '5 Years Horizon', icon: '>>>' }
            ];
            
            horizons.forEach((horizon, idx) => {
                const rec = horizonRecommendations[horizon.key];
                
                // Card with shadow
                pdf.setFillColor(255, 255, 255);
                pdf.setDrawColor(226, 232, 240);
                pdf.setLineWidth(0.5);
                pdf.roundedRect(margin, yPosition, contentWidth, 36, 8, 8, 'FD');
                
                // Horizon label
                pdf.setFontSize(13);
                pdf.setTextColor(30, 41, 59);
                pdf.setFont('helvetica', 'bold');
                pdf.text(`${horizon.icon} ${horizon.label}`, margin + 8, yPosition + 12);
                
                // Recommendation Badge
                const recColor = rec.recommendation === 'BUY' ? [16, 185, 129] :
                                rec.recommendation === 'SELL' ? [239, 68, 68] : [251, 191, 36];
                
                pdf.setFillColor(...recColor);
                pdf.roundedRect(margin + 8, yPosition + 17, 30, 12, 4, 4, 'F');
                
                pdf.setTextColor(255, 255, 255);
                pdf.setFontSize(10);
                pdf.setFont('helvetica', 'bold');
                pdf.text(rec.recommendation, margin + 23, yPosition + 25, { align: 'center' });
                
                // Confidence
                pdf.setTextColor(71, 85, 105);
                pdf.setFont('helvetica', 'normal');
                pdf.setFontSize(11);
                pdf.text(`Confidence: ${rec.confidence}%`, margin + 45, yPosition + 25);
                
                // Potential Move
                pdf.setFont('helvetica', 'bold');
                const potentialColor = parseFloat(rec.potentialMove) >= 0 ? [16, 185, 129] : [239, 68, 68];
                pdf.setTextColor(...potentialColor);
                pdf.setFontSize(16);
                pdf.text(`${rec.potentialMove >= 0 ? '+' : ''}${rec.potentialMove}%`, 
                        pageWidth - margin - 8, yPosition + 25, { align: 'right' });
                
                yPosition += 41;
            });
            
            // Footer avec gradient
            this.addGradientFooter(pdf, pageWidth, pageHeight, symbol);
            
            this.updateProgress(45, 'Creating key drivers page...');
            
            // ============================================
            // 🔑 PAGE 3 : KEY DRIVERS (TOUS LES HORIZONS)
            // ============================================
            
            pdf.addPage();
            
            pdf.setFillColor(248, 250, 252);
            pdf.rect(0, 0, pageWidth, pageHeight, 'F');
            
            yPosition = 25;
            
            // Header avec gradient
            this.addGradientHeader(pdf, pageWidth, pageHeight);
            
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.text('KEY INVESTMENT DRIVERS', margin, 11);
            
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            pdf.text(symbol, pageWidth - margin, 11, { align: 'right' });
            
            yPosition = 35;
            
            // Page Title
            pdf.setFontSize(24);
            pdf.setTextColor(102, 126, 234);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Key Investment Drivers', margin, yPosition);
            yPosition += 10;
            
            pdf.setFontSize(11);
            pdf.setTextColor(100, 116, 139);
            pdf.setFont('helvetica', 'normal');
            pdf.text('Critical factors influencing recommendations across all time horizons', margin, yPosition);
            yPosition += 20;
            
            // KEY DRIVERS POUR LES 3 HORIZONS
            const allHorizons = [
                { key: '1y', label: '1 Year Horizon', color: [59, 130, 246] },
                { key: '2y', label: '2 Years Horizon', color: [139, 92, 246] },
                { key: '5y', label: '5 Years Horizon', color: [236, 72, 153] }
            ];
            
            allHorizons.forEach((horizon, horizonIdx) => {
                const rec = horizonRecommendations[horizon.key];
                
                // Section Header
                pdf.setFillColor(...horizon.color, 0.1);
                pdf.roundedRect(margin, yPosition, contentWidth, 12, 5, 5, 'F');
                
                pdf.setFontSize(14);
                pdf.setTextColor(...horizon.color);
                pdf.setFont('helvetica', 'bold');
                pdf.text(horizon.label, margin + 6, yPosition + 8);
                
                yPosition += 16;
                
                // Drivers
                rec.drivers.forEach((driver, idx) => {
                    pdf.setFillColor(255, 255, 255);
                    pdf.setDrawColor(219, 234, 254);
                    pdf.setLineWidth(0.3);
                    pdf.roundedRect(margin, yPosition, contentWidth, 14, 5, 5, 'FD');
                    
                    pdf.setFontSize(11);
                    pdf.setTextColor(30, 41, 59);
                    
                    // Bullet number
                    pdf.setFont('helvetica', 'bold');
                    pdf.text(`${idx + 1}.`, margin + 5, yPosition + 9);
                    
                    // Driver text
                    pdf.setFont('helvetica', 'normal');
                    
                    // Wrap text if too long
                    const maxWidth = contentWidth - 20;
                    const lines = pdf.splitTextToSize(driver, maxWidth);
                    
                    if (lines.length > 1) {
                        pdf.text(lines[0], margin + 12, yPosition + 9);
                        yPosition += 14;
                        pdf.setFillColor(255, 255, 255);
                        pdf.roundedRect(margin, yPosition, contentWidth, 14, 5, 5, 'FD');
                        pdf.text(lines[1], margin + 12, yPosition + 9);
                    } else {
                        pdf.text(driver, margin + 12, yPosition + 9);
                    }
                    
                    yPosition += 17;
                    
                    // Check page overflow
                    if (yPosition > pageHeight - 50 && horizonIdx < allHorizons.length - 1) {
                        // Footer avec gradient
                        this.addGradientFooter(pdf, pageWidth, pageHeight, symbol);
                        
                        pdf.addPage();
                        pdf.setFillColor(248, 250, 252);
                        pdf.rect(0, 0, pageWidth, pageHeight, 'F');
                        
                        // Header avec gradient
                        this.addGradientHeader(pdf, pageWidth, pageHeight);
                        pdf.setTextColor(255, 255, 255);
                        pdf.setFontSize(12);
                        pdf.setFont('helvetica', 'bold');
                        pdf.text('KEY INVESTMENT DRIVERS (CONTINUED)', margin, 11);
                        pdf.setFontSize(10);
                        pdf.setFont('helvetica', 'normal');
                        pdf.text(symbol, pageWidth - margin, 11, { align: 'right' });
                        
                        yPosition = 35;
                    }
                });
                
                yPosition += 8;
            });
            
            // Footer avec gradient
            this.addGradientFooter(pdf, pageWidth, pageHeight, symbol);
            
            this.updateProgress(55, 'Capturing technical indicators...');
            
            // ============================================
            // 📈 TECHNICAL INDICATORS CHARTS
            // ============================================
            
            const chartsToCapture = [
                { id: 'rsiChart', title: 'RSI - Relative Strength Index', description: 'Measures momentum and overbought/oversold conditions' },
                { id: 'macdChart', title: 'MACD - Moving Average Convergence Divergence', description: 'Identifies trend changes and momentum shifts' },
                { id: 'stochasticChart', title: 'Stochastic Oscillator', description: 'Compares closing price to price range over time' },
                { id: 'williamsChart', title: 'Williams %R', description: 'Momentum indicator showing overbought/oversold levels' },
                { id: 'adxChart', title: 'ADX - Average Directional Index', description: 'Measures trend strength regardless of direction' },
                { id: 'obvChart', title: 'On-Balance Volume (OBV)', description: 'Cumulative volume indicator predicting price movements' },
                { id: 'atrChart', title: 'Average True Range (ATR)', description: 'Volatility indicator measuring market movement' },
                { id: 'mfiChart', title: 'Money Flow Index (MFI)', description: 'Volume-weighted RSI identifying buying/selling pressure' },
                { id: 'cciChart', title: 'Commodity Channel Index (CCI)', description: 'Identifies cyclical trends in asset prices' },
                { id: 'ultimateChart', title: 'Ultimate Oscillator', description: 'Multi-timeframe momentum indicator' },
                { id: 'rocChart', title: 'Rate of Change (ROC)', description: 'Measures percentage change in price over time' },
                { id: 'aroonChart', title: 'Aroon Indicator', description: 'Identifies trend changes and strength' },
                { id: 'cmfChart', title: 'Chaikin Money Flow (CMF)', description: 'Measures money flow volume over specific period' },
                { id: 'elderRayChart', title: 'Elder Ray Index', description: 'Bull and Bear power indicator' }
            ];
            
            for (let i = 0; i < chartsToCapture.length; i++) {
                const chartInfo = chartsToCapture[i];
                const chartElement = document.getElementById(chartInfo.id);
                
                const progress = 55 + ((i / chartsToCapture.length) * 35);
                this.updateProgress(progress, `Processing ${chartInfo.title}...`);
                
                if (!chartElement) {
                    console.warn(`Chart ${chartInfo.id} not found`);
                    continue;
                }
                
                pdf.addPage();
                
                pdf.setFillColor(248, 250, 252);
                pdf.rect(0, 0, pageWidth, pageHeight, 'F');
                
                yPosition = 25;
                
                // Page Header avec gradient
                this.addGradientHeader(pdf, pageWidth, pageHeight);
                pdf.setTextColor(255, 255, 255);
                pdf.setFontSize(12);
                pdf.setFont('helvetica', 'bold');
                pdf.text('TECHNICAL INDICATOR', margin, 11);
                pdf.setFontSize(10);
                pdf.setFont('helvetica', 'normal');
                pdf.text(`${i + 1} of ${chartsToCapture.length}`, pageWidth - margin, 11, { align: 'right' });
                
                yPosition = 35;
                
                // Indicator Title
                pdf.setFontSize(20);
                pdf.setTextColor(102, 126, 234);
                pdf.setFont('helvetica', 'bold');
                pdf.text(chartInfo.title, margin, yPosition);
                yPosition += 10;
                
                // Description
                pdf.setFontSize(10);
                pdf.setTextColor(100, 116, 139);
                pdf.setFont('helvetica', 'italic');
                pdf.text(chartInfo.description, margin, yPosition);
                yPosition += 15;
                
                // Chart container
                pdf.setFillColor(255, 255, 255);
                pdf.setDrawColor(226, 232, 240);
                pdf.setLineWidth(0.5);
                pdf.roundedRect(margin - 2, yPosition - 2, contentWidth + 4, 162, 5, 5, 'FD');
                
                try {
                    const canvas = await html2canvas(chartElement, {
                        scale: 2,
                        backgroundColor: '#ffffff',
                        logging: false
                    });
                    
                    const imgData = canvas.toDataURL('image/png');
                    const imgHeight = 158;
                    pdf.addImage(imgData, 'PNG', margin, yPosition, contentWidth, imgHeight);
                    
                    yPosition += imgHeight + 10;
                    
                    console.log(`✅ Chart captured: ${chartInfo.title}`);
                    
                } catch (error) {
                    console.error(`❌ Failed to capture ${chartInfo.title}:`, error);
                    pdf.setFontSize(12);
                    pdf.setTextColor(239, 68, 68);
                    pdf.text('Error capturing chart', margin, yPosition);
                }
                
                // Footer avec gradient
                this.addGradientFooter(pdf, pageWidth, pageHeight, symbol);
            }
            
            this.updateProgress(92, 'Adding legal disclaimer...');
            
            // ============================================
            // 📜 LEGAL DISCLAIMER
            // ============================================
            
            pdf.addPage();
            
            pdf.setFillColor(248, 250, 252);
            pdf.rect(0, 0, pageWidth, pageHeight, 'F');
            
            yPosition = 25;
            
            // Header avec gradient
            this.addGradientHeader(pdf, pageWidth, pageHeight);
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.text('IMPORTANT LEGAL DISCLAIMER', margin, 11);
            
            yPosition = 35;
            
            pdf.setFontSize(20);
            pdf.setTextColor(102, 126, 234);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Legal Notice & Disclaimer', margin, yPosition);
            yPosition += 18;
            
            pdf.setFontSize(10);
            pdf.setTextColor(30, 41, 59);
            pdf.setFont('helvetica', 'normal');
            
            const disclaimer = [
                'This report is generated by AlphaVault AI based exclusively on proprietary technical analysis algorithms.',
                'All indicators are calculated internally and do not contain raw market data from third-party providers.',
                '',
                'INVESTMENT DISCLAIMER:',
                '• This report does NOT constitute investment advice or a recommendation to buy or sell securities.',
                '• Past performance does not guarantee future results.',
                '• All investments involve risk, including the potential loss of principal.',
                '• Technical indicators are mathematical calculations and should not be the sole basis for decisions.',
                '• Always consult with a qualified financial advisor before making investment decisions.',
                '',
                'DATA COMPLIANCE:',
                '• This report contains ONLY technical indicators calculated by AlphaVault AI.',
                '• No raw price data, volume data, or other market data from APIs is redistributed.',
                '• All calculations are performed on licensed data and presented as derivative analytics.',
                '',
                'NO WARRANTY:',
                '• This report is provided "AS IS" without warranty of any kind.',
                '• AlphaVault AI makes no representations regarding accuracy or completeness.',
                '• We are not liable for any investment losses resulting from use of this report.',
                '',
                'INTELLECTUAL PROPERTY:',
                '• AlphaVault AI algorithms and methodologies are proprietary and confidential.',
                '• Unauthorized reproduction or distribution of this report is prohibited.',
                '',
                'FOR EDUCATIONAL AND INFORMATIONAL PURPOSES ONLY.',
                '',
                'By using this report, you acknowledge and agree to these terms.'
            ];
            
            disclaimer.forEach(line => {
                if (yPosition > pageHeight - 50) {
                    // Footer avec gradient
                    this.addGradientFooter(pdf, pageWidth, pageHeight, symbol);
                    
                    pdf.addPage();
                    pdf.setFillColor(248, 250, 252);
                    pdf.rect(0, 0, pageWidth, pageHeight, 'F');
                    
                    // Header avec gradient
                    this.addGradientHeader(pdf, pageWidth, pageHeight);
                    pdf.setTextColor(255, 255, 255);
                    pdf.setFontSize(12);
                    pdf.setFont('helvetica', 'bold');
                    pdf.text('IMPORTANT LEGAL DISCLAIMER (CONTINUED)', margin, 11);
                    
                    yPosition = 35;
                }
                
                if (line.includes('DISCLAIMER:') || line.includes('COMPLIANCE:') || 
                    line.includes('WARRANTY:') || line.includes('PROPERTY:')) {
                    pdf.setFont('helvetica', 'bold');
                    pdf.setTextColor(102, 126, 234);
                } else {
                    pdf.setFont('helvetica', 'normal');
                    pdf.setTextColor(30, 41, 59);
                }
                
                pdf.text(line, margin, yPosition);
                yPosition += line === '' ? 4 : 6;
            });
            
            // Footer final avec gradient
            this.addGradientFooter(pdf, pageWidth, pageHeight, symbol);
            
            this.updateProgress(98, 'Finalizing PDF...');
            
            // ============================================
            // 💾 SAVE PDF
            // ============================================
            
            const filename = `AlphaVault_${symbol}_Analysis_${period}_${new Date().toISOString().split('T')[0]}.pdf`;
            pdf.save(filename);
            
            this.updateProgress(100, 'Complete!');
            
            setTimeout(() => {
                this.hideProgressModal();
            }, 800);
            
            console.log('✅ Premium PDF report generated:', filename);
            this.showNotification('✅ Premium PDF report generated!', 'success');
            
        } catch (error) {
            console.error('❌ PDF generation failed:', error);
            this.hideProgressModal();
            alert('❌ PDF generation failed. Please ensure jsPDF and html2canvas libraries are loaded.');
        }
    },

    // ============================================
    // 🎨 GRADIENT HEADER (BLEU → VIOLET)
    // ============================================

    addGradientHeader(pdf, pageWidth, pageHeight) {
        const headerHeight = 18;
        const steps = 50;
        
        for (let i = 0; i < steps; i++) {
            const ratio = i / steps;
            const r = Math.round(102 + (118 - 102) * ratio);
            const g = Math.round(126 + (75 - 126) * ratio);
            const b = Math.round(234 + (162 - 234) * ratio);
            
            pdf.setFillColor(r, g, b);
            pdf.rect((pageWidth / steps) * i, 0, (pageWidth / steps) + 0.5, headerHeight, 'F');
        }
    },

    // ============================================
    // 🎨 GRADIENT FOOTER (BLEU → VIOLET)
    // ============================================

    addGradientFooter(pdf, pageWidth, pageHeight, symbol) {
        const footerHeight = 18;
        const footerY = pageHeight - footerHeight;
        const steps = 50;
        
        for (let i = 0; i < steps; i++) {
            const ratio = i / steps;
            const r = Math.round(102 + (118 - 102) * ratio);
            const g = Math.round(126 + (75 - 126) * ratio);
            const b = Math.round(234 + (162 - 234) * ratio);
            
            pdf.setFillColor(r, g, b);
            pdf.rect((pageWidth / steps) * i, footerY, (pageWidth / steps) + 0.5, footerHeight, 'F');
        }
        
        // Footer text
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.text('AlphaVault AI', 15, footerY + 11);
        
        pdf.setFontSize(8);
        pdf.text(`© ${new Date().getFullYear()} AlphaVault AI. All rights reserved.`, 
                pageWidth / 2, footerY + 11, { align: 'center' });
        
        pdf.setFontSize(9);
        pdf.text(symbol, pageWidth - 15, footerY + 11, { align: 'right' });
    },

    // ============================================
    // 🎯 PROGRESS MODAL FUNCTIONS
    // ============================================

    showProgressModal() {
        const existingModal = document.getElementById('pdf-progress-modal');
        if (existingModal) existingModal.remove();
        
        const modalHTML = `
            <div id="pdf-progress-modal" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(15, 23, 42, 0.85);
                backdrop-filter: blur(10px);
                z-index: 999999;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: fadeIn 0.3s ease;
            ">
                <div style="
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 24px;
                    padding: 48px 56px;
                    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.4);
                    text-align: center;
                    max-width: 480px;
                    animation: slideUp 0.4s ease;
                ">
                    <div style="
                        width: 80px;
                        height: 80px;
                        margin: 0 auto 24px;
                        border: 6px solid rgba(255, 255, 255, 0.3);
                        border-top-color: white;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                    "></div>
                    
                    <h2 style="
                        color: white;
                        font-size: 28px;
                        font-weight: 800;
                        margin: 0 0 12px 0;
                        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                    ">Generating Report</h2>
                    
                    <p id="pdf-progress-text" style="
                        color: rgba(255, 255, 255, 0.9);
                        font-size: 15px;
                        margin: 0 0 28px 0;
                        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                    ">Initializing...</p>
                    
                    <div style="
                        background: rgba(255, 255, 255, 0.25);
                        border-radius: 12px;
                        height: 16px;
                        overflow: hidden;
                        margin-bottom: 16px;
                    ">
                        <div id="pdf-progress-bar" style="
                            background: white;
                            height: 100%;
                            width: 0%;
                            border-radius: 12px;
                            transition: width 0.4s ease;
                            box-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
                        "></div>
                    </div>
                    
                    <div id="pdf-progress-percent" style="
                        color: white;
                        font-size: 24px;
                        font-weight: 800;
                        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                    ">0%</div>
                </div>
            </div>
            
            <style>
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes slideUp {
                    from {
                        transform: translateY(30px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
                
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            </style>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },

    updateProgress(percent, message) {
        const progressBar = document.getElementById('pdf-progress-bar');
        const progressText = document.getElementById('pdf-progress-text');
        const progressPercent = document.getElementById('pdf-progress-percent');
        
        if (progressBar) progressBar.style.width = `${percent}%`;
        if (progressText) progressText.textContent = message;
        if (progressPercent) progressPercent.textContent = `${Math.round(percent)}%`;
    },

    hideProgressModal() {
        const modal = document.getElementById('pdf-progress-modal');
        if (modal) {
            modal.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => modal.remove(), 300);
        }
    },

    // ============================================
    // 🖼 LOAD IMAGE AS BASE64
    // ============================================

    loadImageAsBase64(imagePath) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            
            img.onload = function() {
                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    
                    const base64 = canvas.toDataURL('image/png');
                    resolve(base64);
                } catch (error) {
                    console.error('Error converting image to base64:', error);
                    resolve(null);
                }
            };
            
            img.onerror = function() {
                console.warn(`Failed to load image: ${imagePath}`);
                resolve(null);
            };
            
            img.src = imagePath;
        });
    },

    // ============================================
    // 🏢 GET COMPANY LOGO WITH FALLBACK (UTILISE CompanyLogos)
    // ============================================

    async getCompanyLogoWithFallback(symbol, companyName) {
        try {
            console.log(`🔍 Fetching company logo for ${symbol}...`);
            
            // Utiliser le système CompanyLogos existant
            if (typeof window.CompanyLogos !== 'undefined') {
                const logoUrls = window.CompanyLogos.getLogoUrls(symbol, companyName);
                
                // Essayer l'URL principale
                let logoBase64 = await this.loadImageAsBase64(logoUrls.primary);
                if (logoBase64) {
                    console.log(`✅ Logo loaded for ${symbol} from Logo.dev`);
                    return logoBase64;
                }
                
                // Essayer les fallbacks
                for (const fallbackUrl of logoUrls.fallbacks) {
                    logoBase64 = await this.loadImageAsBase64(fallbackUrl);
                    if (logoBase64) {
                        console.log(`✅ Logo loaded for ${symbol} from fallback`);
                        return logoBase64;
                    }
                }
            }
            
            // Méthode 2 : Logo stocké localement
            const localLogoPath = `assets/images/company-logos/${symbol.toLowerCase()}.png`;
            const localLogo = await this.loadImageAsBase64(localLogoPath);
            
            if (localLogo) {
                console.log(`✅ Local logo loaded for ${symbol}`);
                return localLogo;
            }
            
            console.warn(`⚠ No logo found for ${symbol}`);
            return null;
            
        } catch (error) {
            console.error(`❌ Error loading logo for ${symbol}:`, error);
            return null;
        }
    },

    // ============================================
    // 🔧 UTILITY: Download File
    // ============================================

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },

    // ============================================
    // 🔔 UTILITY: Show Notification
    // ============================================

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `export-notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #3b82f6, #2563eb)'};
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
            display: flex;
            align-items: center;
            gap: 12px;
            font-weight: 600;
            z-index: 10000;
            animation: slideInRight 0.4s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.4s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 400);
        }, 3000);
    }
};

// ============================================
// INITIALIZE ON DOM LOADED
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Advanced Analysis - Legal Compliant Version - Initializing...');
    AdvancedAnalysis.init();
});

// ✅ EXPORT GLOBAL POUR UTILISATION PAR D'AUTRES MODULES
window.AdvancedAnalysis = AdvancedAnalysis;

// ============================================
// SIDEBAR USER MENU - Toggle
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

console.log('✅ Advanced Analysis - Legal Compliant Version - Script Loaded (Pure Oscillators Only)');