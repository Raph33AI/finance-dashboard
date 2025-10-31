/* ==============================================
   MARKET-DATA.JS - Market Data & Technical Analysis
   Version optimisée ES6+ 2024 avec async/await
   ============================================== */

const MarketData = {
    // API Client
    apiClient: null,
    
    // Current State
    currentSymbol: '',
    currentPeriod: '1M',
    stockData: null,
    profileData: null,
    statisticsData: null,
    logoUrl: '',
    
    // Search functionality
    selectedSuggestionIndex: -1,
    searchTimeout: null,
    
    // Watchlist & Alerts
    watchlist: [],
    alerts: [],
    watchlistRefreshInterval: null,
    notificationPermission: false,
    
    // Comparison
    comparisonSymbols: [],
    comparisonData: {},
    comparisonColors: ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'],
    
    // Charts instances
    charts: {
        price: null,
        rsi: null,
        macd: null,
        comparison: null
    },
    
    // Initialize
    init() {
        try {
            // Initialiser le client API
            this.apiClient = new FinanceAPIClient({
                baseURL: APP_CONFIG.API_BASE_URL,
                cacheDuration: APP_CONFIG.CACHE_DURATION,
                maxRetries: APP_CONFIG.MAX_RETRIES,
                onLoadingChange: (isLoading) => {
                    this.showLoading(isLoading);
                }
            });
            
            // Rendre accessible globalement pour le widget cache
            window.apiClient = this.apiClient;
            
            this.updateLastUpdate();
            this.setupEventListeners();
            this.setupSearchListeners();
            this.loadWatchlistFromStorage();
            this.loadAlertsFromStorage();
            this.requestNotificationPermission();
            this.startWatchlistAutoRefresh();
            
            // Auto-load a default symbol
            setTimeout(() => {
                this.loadSymbol('AAPL');
            }, 500);
            
        } catch (error) {
            console.error('Initialization error:', error);
            this.showNotification('Failed to initialize application', 'error');
        }
    },
    
    // Setup Event Listeners
    setupEventListeners() {
        const input = document.getElementById('symbolInput');
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.searchStock();
                }
            });
        }
        
        // Indicator toggles avec debounce
        const updateChart = this.debounce(() => this.updateChart(), 300);
        
        document.getElementById('toggleSMA')?.addEventListener('change', updateChart);
        document.getElementById('toggleEMA')?.addEventListener('change', updateChart);
        document.getElementById('toggleBB')?.addEventListener('change', updateChart);
        document.getElementById('toggleVolume')?.addEventListener('change', updateChart);
    },
    
    // ========== RECHERCHE AVEC TWELVE DATA ==========
    
    setupSearchListeners() {
        const input = document.getElementById('symbolInput');
        if (!input) return;
        
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
                    this.searchStock();
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
        
        // Close suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-input-wrapper')) {
                this.hideSuggestions();
            }
        });
    },
    
    handleSearch(query) {
        const trimmedQuery = query.trim();
        
        if (trimmedQuery.length === 0) {
            this.hideSuggestions();
            return;
        }
        
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.searchSymbols(trimmedQuery);
        }, 300);
    },
    
    async searchSymbols(query) {
        console.log('🔍 Searching Twelve Data for:', query);
        
        const container = document.getElementById('searchSuggestions');
        if (!container) return;
        
        container.innerHTML = '<div class="suggestion-loading"><i class="fas fa-spinner fa-spin"></i> Searching...</div>';
        container.classList.add('active');
        
        try {
            const results = await this.apiClient.searchSymbol(query);
            
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
    
    displaySearchResults(results, query) {
        const container = document.getElementById('searchSuggestions');
        if (!container) return;
        
        // Grouper par type
        const grouped = {
            stocks: [],
            etfs: [],
            crypto: [],
            indices: [],
            other: []
        };
        
        results.forEach(item => {
            const type = (item.instrument_type || 'Common Stock').toLowerCase();
            
            if (type.includes('stock') || type.includes('equity')) {
                grouped.stocks.push(item);
            } else if (type.includes('etf')) {
                grouped.etfs.push(item);
            } else if (type.includes('crypto') || type.includes('digital currency')) {
                grouped.crypto.push(item);
            } else if (type.includes('index')) {
                grouped.indices.push(item);
            } else {
                grouped.other.push(item);
            }
        });
        
        let html = '';
        if (grouped.stocks.length > 0) html += this.buildCategoryHTML('Stocks', grouped.stocks, query);
        if (grouped.etfs.length > 0) html += this.buildCategoryHTML('ETFs', grouped.etfs, query);
        if (grouped.crypto.length > 0) html += this.buildCategoryHTML('Cryptocurrencies', grouped.crypto, query);
        if (grouped.indices.length > 0) html += this.buildCategoryHTML('Indices', grouped.indices, query);
        if (grouped.other.length > 0) html += this.buildCategoryHTML('Other', grouped.other, query);
        
        if (html === '') {
            this.displayNoResults();
        } else {
            container.innerHTML = html;
            container.classList.add('active');
            this.selectedSuggestionIndex = -1;
            
            // Add click listeners
            container.querySelectorAll('.suggestion-item').forEach((item, index) => {
                item.setAttribute('tabindex', '0');
                item.dataset.index = index;
                
                item.addEventListener('click', () => {
                    this.selectSuggestion(item.dataset.symbol);
                });
                
                item.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.selectSuggestion(item.dataset.symbol);
                    }
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
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    displayNoResults() {
        const container = document.getElementById('searchSuggestions');
        if (!container) return;
        
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
        if (!container) return;
        
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
        const input = document.getElementById('symbolInput');
        if (input) {
            input.value = symbol;
        }
        this.hideSuggestions();
        this.loadSymbol(symbol);
    },
    
    hideSuggestions() {
        const container = document.getElementById('searchSuggestions');
        if (!container) return;
        
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
        suggestions[this.selectedSuggestionIndex].focus();
    },
    
    // ========== CHARGEMENT DES DONNÉES ==========
    
    searchStock() {
        const input = document.getElementById('symbolInput');
        if (!input) return;
        
        const symbol = input.value.trim().toUpperCase();
        if (symbol) {
            this.loadSymbol(symbol);
        }
    },
    
    async loadSymbol(symbol) {
        this.currentSymbol = symbol;
        
        const input = document.getElementById('symbolInput');
        if (input) {
            input.value = symbol;
        }
        
        this.showLoading(true);
        this.hideResults();
        this.hideSuggestions();
        
        try {
            // Récupérer toutes les données en parallèle
            const [quote, timeSeries, profile, statistics, logo] = await Promise.allSettled([
                this.apiClient.getQuote(symbol),
                this.getTimeSeriesForPeriod(symbol, this.currentPeriod),
                this.apiClient.getProfile(symbol),
                this.apiClient.getStatistics(symbol),
                this.apiClient.getLogo(symbol)
            ]);
            
            // Vérifier que quote et timeSeries sont OK
            if (quote.status !== 'fulfilled' || timeSeries.status !== 'fulfilled') {
                throw new Error('Failed to load stock data');
            }
            
            // Construire stockData
            this.stockData = {
                symbol: quote.value.symbol,
                prices: timeSeries.value.data,
                quote: quote.value
            };
            
            this.profileData = profile.status === 'fulfilled' ? profile.value : null;
            this.statisticsData = statistics.status === 'fulfilled' ? statistics.value : null;
            this.logoUrl = logo.status === 'fulfilled' ? logo.value : '';
            
            this.displayStockOverview();
            this.displayCompanyProfile();
            this.displayResults();
            this.updateAddToWatchlistButton();
            
        } catch (error) {
            console.error('Error loading stock data:', error);
            this.showNotification(error.message || 'Failed to load stock data', 'error');
        } finally {
            this.showLoading(false);
        }
    },
    
    async getTimeSeriesForPeriod(symbol, period) {
        const periodMap = {
            '1M': { interval: '1day', outputsize: 30 },
            '3M': { interval: '1day', outputsize: 90 },
            '6M': { interval: '1day', outputsize: 180 },
            '1Y': { interval: '1day', outputsize: 252 },
            '5Y': { interval: '1week', outputsize: 260 },
            'MAX': { interval: '1month', outputsize: 300 }
        };
        
        const config = periodMap[period] || periodMap['6M'];
        return await this.apiClient.getTimeSeries(symbol, config.interval, config.outputsize);
    },
    
    changePeriod(period) {
        this.currentPeriod = period;
        
        document.querySelectorAll('.period-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[data-period="${period}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        if (this.currentSymbol) {
            this.loadSymbol(this.currentSymbol);
        }
        
        if (this.comparisonSymbols.length > 0) {
            this.loadComparison();
        }
    },
    
    updateChart() {
        if (this.stockData) {
            this.createPriceChart();
        }
    },
    
    // ========== AFFICHAGE DU PROFIL ENTREPRISE ==========
    
    displayCompanyProfile() {
        let profileSection = document.getElementById('companyProfileSection');
        
        if (!profileSection) {
            const stockOverview = document.getElementById('stockOverview');
            if (!stockOverview) return;
            
            profileSection = document.createElement('div');
            profileSection.id = 'companyProfileSection';
            profileSection.className = 'company-profile-section card hidden';
            stockOverview.insertAdjacentElement('afterend', profileSection);
        }
        
        if (!this.profileData && !this.statisticsData) {
            profileSection.classList.add('hidden');
            return;
        }
        
        let html = `
            <div class='card-header'>
                <h2 class='card-title'>
                    <i class='fas fa-building'></i> Company Information
                </h2>
            </div>
            <div class='card-body'>
        `;
        
        // Logo et profil
        if (this.profileData || this.logoUrl) {
            html += `<div class='company-header-section'>`;
            
            if (this.logoUrl) {
                html += `
                    <div class='company-logo'>
                        <img src='${this.escapeHtml(this.logoUrl)}' alt='${this.escapeHtml(this.currentSymbol)} logo' onerror='this.style.display="none"'>
                    </div>
                `;
            }
            
            if (this.profileData) {
                html += `
                    <div class='company-info-grid'>
                        ${this.profileData.sector ? `
                        <div class='info-item'>
                            <span class='info-label'><i class='fas fa-industry'></i> Sector</span>
                            <span class='info-value'>${this.escapeHtml(this.profileData.sector)}</span>
                        </div>` : ''}
                        ${this.profileData.industry ? `
                        <div class='info-item'>
                            <span class='info-label'><i class='fas fa-cogs'></i> Industry</span>
                            <span class='info-value'>${this.escapeHtml(this.profileData.industry)}</span>
                        </div>` : ''}
                        ${this.profileData.country ? `
                        <div class='info-item'>
                            <span class='info-label'><i class='fas fa-globe'></i> Country</span>
                            <span class='info-value'>${this.escapeHtml(this.profileData.country)}</span>
                        </div>` : ''}
                        ${this.profileData.employees ? `
                        <div class='info-item'>
                            <span class='info-label'><i class='fas fa-users'></i> Employees</span>
                            <span class='info-value'>${this.formatNumber(this.profileData.employees)}</span>
                        </div>` : ''}
                        ${this.profileData.founded ? `
                        <div class='info-item'>
                            <span class='info-label'><i class='fas fa-calendar'></i> Founded</span>
                            <span class='info-value'>${this.escapeHtml(this.profileData.founded)}</span>
                        </div>` : ''}
                        ${this.profileData.ceo ? `
                        <div class='info-item'>
                            <span class='info-label'><i class='fas fa-user-tie'></i> CEO</span>
                            <span class='info-value'>${this.escapeHtml(this.profileData.ceo)}</span>
                        </div>` : ''}
                    </div>
                `;
                
                if (this.profileData.description && this.profileData.description !== 'No description available') {
                    html += `
                        <div class='company-description'>
                            <h4><i class='fas fa-info-circle'></i> About</h4>
                            <p>${this.escapeHtml(this.profileData.description)}</p>
                        </div>
                    `;
                }
                
                if (this.profileData.website) {
                    html += `
                        <div class='company-links'>
                            <a href='${this.escapeHtml(this.profileData.website)}' target='_blank' rel='noopener noreferrer' class='btn btn-secondary btn-sm'>
                                <i class='fas fa-external-link-alt'></i> Visit Website
                            </a>
                        </div>
                    `;
                }
            }
            
            html += `</div>`;
        }
        
        // Statistiques fondamentales
        if (this.statisticsData) {
            html += `
                <div class='fundamental-stats'>
                    <h3 class='subsection-title'><i class='fas fa-chart-bar'></i> Fundamental Statistics</h3>
                    
                    <div class='stats-category'>
                        <h4>Valuation Metrics</h4>
                        <div class='stats-grid'>
                            ${this.createStatItem('Market Cap', this.formatLargeNumber(this.statisticsData.marketCap))}
                            ${this.createStatItem('Enterprise Value', this.formatLargeNumber(this.statisticsData.enterpriseValue))}
                            ${this.createStatItem('P/E Ratio (TTM)', this.formatRatio(this.statisticsData.trailingPE))}
                            ${this.createStatItem('Forward P/E', this.formatRatio(this.statisticsData.forwardPE))}
                            ${this.createStatItem('PEG Ratio', this.formatRatio(this.statisticsData.pegRatio))}
                            ${this.createStatItem('Price/Sales', this.formatRatio(this.statisticsData.priceToSales))}
                            ${this.createStatItem('Price/Book', this.formatRatio(this.statisticsData.priceToBook))}
                            ${this.createStatItem('EV/Revenue', this.formatRatio(this.statisticsData.evToRevenue))}
                        </div>
                    </div>
                    
                    <div class='stats-category'>
                        <h4>Profitability & Returns</h4>
                        <div class='stats-grid'>
                            ${this.createStatItem('Profit Margin', this.formatPercent(this.statisticsData.profitMargin))}
                            ${this.createStatItem('Operating Margin', this.formatPercent(this.statisticsData.operatingMargin))}
                            ${this.createStatItem('ROA', this.formatPercent(this.statisticsData.returnOnAssets))}
                            ${this.createStatItem('ROE', this.formatPercent(this.statisticsData.returnOnEquity))}
                            ${this.createStatItem('Revenue (TTM)', this.formatLargeNumber(this.statisticsData.revenue))}
                            ${this.createStatItem('EBITDA', this.formatLargeNumber(this.statisticsData.ebitda))}
                            ${this.createStatItem('Net Income', this.formatLargeNumber(this.statisticsData.netIncome))}
                            ${this.createStatItem('EPS (Diluted)', this.formatCurrency(this.statisticsData.eps))}
                        </div>
                    </div>
                    
                    <div class='stats-category'>
                        <h4>Stock Statistics</h4>
                        <div class='stats-grid'>
                            ${this.createStatItem('Beta', this.formatRatio(this.statisticsData.beta))}
                            ${this.createStatItem('52W Change', this.formatPercent(this.statisticsData.fiftyTwoWeekChange))}
                            ${this.createStatItem('Shares Outstanding', this.formatLargeNumber(this.statisticsData.sharesOutstanding))}
                            ${this.createStatItem('Float', this.formatLargeNumber(this.statisticsData.sharesFloat))}
                            ${this.createStatItem('Short Interest', this.formatLargeNumber(this.statisticsData.sharesShort))}
                            ${this.createStatItem('Short Ratio', this.formatRatio(this.statisticsData.shortRatio))}
                            ${this.createStatItem('Short % of Float', this.formatPercent(this.statisticsData.shortPercentOfFloat))}
                        </div>
                    </div>
                    
                    ${this.statisticsData.dividendRate > 0 ? `
                    <div class='stats-category'>
                        <h4>Dividends & Splits</h4>
                        <div class='stats-grid'>
                            ${this.createStatItem('Dividend Rate', this.formatCurrency(this.statisticsData.dividendRate))}
                            ${this.createStatItem('Dividend Yield', this.formatPercent(this.statisticsData.dividendYield))}
                            ${this.createStatItem('Payout Ratio', this.formatPercent(this.statisticsData.payoutRatio))}
                            ${this.statisticsData.exDividendDate ? this.createStatItem('Ex-Dividend Date', this.statisticsData.exDividendDate) : ''}
                        </div>
                    </div>
                    ` : ''}
                </div>
            `;
        }
        
        html += `</div>`;
        
        profileSection.innerHTML = html;
        profileSection.classList.remove('hidden');
    },
    
    createStatItem(label, value) {
        if (!value || value === 'N/A' || value === '$0' || value === '0' || value === '0%') {
            return '';
        }
        return `
            <div class='stat-box'>
                <div class='label'>${this.escapeHtml(label)}</div>
                <div class='value'>${value}</div>
            </div>
        `;
    },
    
    // ========== SUITE DANS LE PROCHAIN MESSAGE (fichier trop long) ==========
    
    // ... (je continue dans le prochain message avec le reste des fonctions)
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    MarketData.init();
});

// Ajouter ces méthodes à l'objet MarketData :

Object.assign(MarketData, {
    
    // ============================================
    // COMPARISON FUNCTIONS
    // ============================================
    
    openComparisonModal() {
        if (window.FinanceDashboard && window.FinanceDashboard.openModal) {
            window.FinanceDashboard.openModal('modalAddComparison');
        }
    },
    
    closeComparisonModal() {
        if (window.FinanceDashboard && window.FinanceDashboard.closeModal) {
            window.FinanceDashboard.closeModal('modalAddComparison');
        }
        const input = document.getElementById('comparisonSymbols');
        if (input) {
            input.value = '';
        }
    },
    
    async loadComparison() {
        const input = document.getElementById('comparisonSymbols');
        if (!input) return;
        
        const symbols = input.value.split(',')
            .map(s => s.trim().toUpperCase())
            .filter(s => s.length > 0);
        
        if (symbols.length < 2) {
            alert('Please enter at least 2 symbols to compare');
            return;
        }
        
        if (symbols.length > 5) {
            alert('Maximum 5 symbols allowed');
            return;
        }
        
        this.closeComparisonModal();
        this.comparisonSymbols = symbols;
        this.comparisonData = {};
        
        this.showNotification(`Loading ${symbols.length} stocks for comparison...`, 'info');
        
        const results = await Promise.allSettled(
            symbols.map(symbol => this.fetchComparisonData(symbol))
        );
        
        const successCount = results.filter(r => r.status === 'fulfilled').length;
        
        if (successCount < 2) {
            alert('Failed to load enough stocks for comparison. Please try again.');
            return;
        }
        
        this.displayComparison();
        this.showNotification(`✅ Comparison loaded for ${successCount} stocks`, 'success');
    },
    
    async fetchComparisonData(symbol) {
        const timeSeries = await this.getTimeSeriesForPeriod(symbol, this.currentPeriod);
        const quote = await this.apiClient.getQuote(symbol);
        
        this.comparisonData[symbol] = {
            prices: timeSeries.data,
            quote: quote
        };
    },
    
    displayComparison() {
        const emptyEl = document.getElementById('comparisonEmpty');
        const containerEl = document.getElementById('comparisonContainer');
        
        if (emptyEl) emptyEl.classList.add('hidden');
        if (containerEl) containerEl.classList.remove('hidden');
        
        this.renderComparisonChips();
        this.createComparisonChart();
        this.createComparisonTable();
    },
    
    renderComparisonChips() {
        const container = document.getElementById('comparisonStocks');
        if (!container) return;
        
        container.innerHTML = this.comparisonSymbols.map((symbol, index) => {
            const data = this.comparisonData[symbol];
            if (!data) return '';
            
            const prices = data.prices;
            const firstPrice = prices[0].close;
            const lastPrice = prices[prices.length - 1].close;
            const performance = ((lastPrice - firstPrice) / firstPrice) * 100;
            const perfClass = performance >= 0 ? 'positive' : 'negative';
            const perfSign = performance >= 0 ? '+' : '';
            
            return `
                <div class='comparison-stock-chip' style='border-color: ${this.comparisonColors[index]}'>
                    <span class='symbol'>${this.escapeHtml(symbol)}</span>
                    <span class='performance ${perfClass}'>${perfSign}${performance.toFixed(2)}%</span>
                    <button class='remove' onclick='MarketData.removeFromComparison("${symbol}")' aria-label='Remove ${symbol}'>
                        <i class='fas fa-times'></i>
                    </button>
                </div>
            `;
        }).join('');
    },
    
    removeFromComparison(symbol) {
        this.comparisonSymbols = this.comparisonSymbols.filter(s => s !== symbol);
        delete this.comparisonData[symbol];
        
        if (this.comparisonSymbols.length < 2) {
            this.clearComparison();
        } else {
            this.displayComparison();
        }
    },
    
    clearComparison() {
        if (this.comparisonSymbols.length > 0 && !confirm('Clear comparison?')) {
            return;
        }
        
        this.comparisonSymbols = [];
        this.comparisonData = {};
        
        const emptyEl = document.getElementById('comparisonEmpty');
        const containerEl = document.getElementById('comparisonContainer');
        
        if (emptyEl) emptyEl.classList.remove('hidden');
        if (containerEl) containerEl.classList.add('hidden');
        
        // Destroy chart
        if (this.charts.comparison) {
            this.charts.comparison.destroy();
            this.charts.comparison = null;
        }
    },
    
    createComparisonChart() {
        const series = [];
        
        this.comparisonSymbols.forEach((symbol, index) => {
            const data = this.comparisonData[symbol];
            if (!data) return;
            
            const firstPrice = data.prices[0].close;
            const normalizedData = data.prices.map(p => [
                p.timestamp,
                (p.close / firstPrice) * 100
            ]);
            
            series.push({
                name: symbol,
                data: normalizedData,
                color: this.comparisonColors[index],
                lineWidth: 2,
                marker: {
                    enabled: false,
                    radius: 3
                }
            });
        });
        
        if (this.charts.comparison) {
            this.charts.comparison.destroy();
        }
        
        this.charts.comparison = Highcharts.stockChart('comparisonChart', {
            chart: {
                height: 500,
                borderRadius: 12,
                style: {
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
                }
            },
            title: {
                text: 'Stock Performance Comparison (Normalized)',
                style: { 
                    color: '#0f172a',
                    fontWeight: '600',
                    fontSize: '1.25rem'
                }
            },
            subtitle: {
                text: 'All stocks start at 100 for easy comparison',
                style: { 
                    color: '#64748b',
                    fontSize: '0.875rem'
                }
            },
            accessibility: {
                enabled: true,
                description: 'Stock performance comparison chart showing normalized prices'
            },
            rangeSelector: {
                selected: 1,
                buttonTheme: {
                    fill: 'white',
                    stroke: '#e2e8f0',
                    'stroke-width': 1,
                    r: 6,
                    style: {
                        color: '#475569',
                        fontWeight: '500'
                    },
                    states: {
                        hover: {
                            fill: '#f1f5f9'
                        },
                        select: {
                            fill: '#2563eb',
                            style: {
                                color: 'white'
                            }
                        }
                    }
                }
            },
            yAxis: {
                title: {
                    text: 'Performance (Base 100)',
                    style: { color: '#475569' }
                },
                plotLines: [{
                    value: 100,
                    color: '#94a3b8',
                    dashStyle: 'Dash',
                    width: 1,
                    label: {
                        text: 'Start (100)',
                        align: 'right',
                        style: { color: '#94a3b8' }
                    }
                }],
                gridLineColor: '#f1f5f9'
            },
            xAxis: {
                gridLineColor: '#f1f5f9'
            },
            tooltip: {
                shared: true,
                crosshairs: true,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#e2e8f0',
                backgroundColor: 'white',
                shadow: {
                    color: 'rgba(0, 0, 0, 0.1)',
                    offsetX: 0,
                    offsetY: 2,
                    width: 4
                },
                valueDecimals: 2,
                pointFormatter: function() {
                    const change = this.y - 100;
                    const changeSign = change >= 0 ? '+' : '';
                    const color = change >= 0 ? '#10b981' : '#ef4444';
                    return `<span style="color:${this.color}">●</span> ${this.series.name}: <b>${this.y.toFixed(2)}</b> (<span style="color:${color}">${changeSign}${change.toFixed(2)}%</span>)<br/>`;
                }
            },
            legend: {
                enabled: true,
                align: 'center',
                verticalAlign: 'bottom',
                itemStyle: {
                    color: '#475569',
                    fontWeight: '500'
                }
            },
            series: series,
            credits: { enabled: false }
        });
    },
    
    createComparisonTable() {
        const metrics = [];
        
        this.comparisonSymbols.forEach(symbol => {
            const data = this.comparisonData[symbol];
            if (!data) return;
            
            const prices = data.prices.map(p => p.close);
            const firstPrice = prices[0];
            const lastPrice = prices[prices.length - 1];
            
            const totalReturn = ((lastPrice - firstPrice) / firstPrice) * 100;
            const volatility = this.calculateVolatilityFromPrices(prices);
            const maxPrice = Math.max(...prices);
            const minPrice = Math.min(...prices);
            const maxDrawdown = this.calculateMaxDrawdown(prices);
            const sharpeRatio = volatility > 0 ? totalReturn / volatility : 0;
            
            metrics.push({
                symbol: symbol,
                name: data.quote.name || symbol,
                currentPrice: data.quote.price,
                totalReturn: totalReturn,
                volatility: volatility,
                maxPrice: maxPrice,
                minPrice: minPrice,
                maxDrawdown: maxDrawdown,
                sharpeRatio: sharpeRatio
            });
        });
        
        const bestReturn = Math.max(...metrics.map(m => m.totalReturn));
        const worstReturn = Math.min(...metrics.map(m => m.totalReturn));
        const lowestVol = Math.min(...metrics.map(m => m.volatility));
        const bestSharpe = Math.max(...metrics.map(m => m.sharpeRatio));
        
        const tableHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Symbol</th>
                        <th>Current Price</th>
                        <th>Total Return</th>
                        <th>Volatility</th>
                        <th>Max Drawdown</th>
                        <th>Sharpe Ratio</th>
                    </tr>
                </thead>
                <tbody>
                    ${metrics.map(m => `
                        <tr>
                            <td class='metric-label'>${this.escapeHtml(m.symbol)}</td>
                            <td>${this.formatCurrency(m.currentPrice)}</td>
                            <td class='${m.totalReturn === bestReturn ? 'best-value' : m.totalReturn === worstReturn ? 'worst-value' : ''} ${m.totalReturn >= 0 ? 'value-positive' : 'value-negative'}'>
                                ${m.totalReturn >= 0 ? '+' : ''}${m.totalReturn.toFixed(2)}%
                            </td>
                            <td class='${m.volatility === lowestVol ? 'best-value' : ''} value-neutral'>
                                ${m.volatility.toFixed(2)}%
                            </td>
                            <td class='value-negative'>
                                -${m.maxDrawdown.toFixed(2)}%
                            </td>
                            <td class='${m.sharpeRatio === bestSharpe ? 'best-value' : ''} value-neutral'>
                                ${m.sharpeRatio.toFixed(2)}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
        const tableContainer = document.getElementById('comparisonTable');
        if (tableContainer) {
            tableContainer.innerHTML = tableHTML;
        }
    },
    
    calculateMaxDrawdown(prices) {
        let maxDrawdown = 0;
        let peak = prices[0];
        
        for (let i = 1; i < prices.length; i++) {
            if (prices[i] > peak) {
                peak = prices[i];
            }
            const drawdown = ((peak - prices[i]) / peak) * 100;
            if (drawdown > maxDrawdown) {
                maxDrawdown = drawdown;
            }
        }
        
        return maxDrawdown;
    },
    
    calculateVolatilityFromPrices(prices) {
        const returns = [];
        for (let i = 1; i < prices.length; i++) {
            const ret = (prices[i] - prices[i - 1]) / prices[i - 1];
            returns.push(ret);
        }
        
        const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
        const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
        const stdDev = Math.sqrt(variance);
        
        return stdDev * Math.sqrt(252) * 100;
    },
    
    // ============================================
    // UTILITY FUNCTIONS
    // ============================================
    
    formatCurrency(value) {
        if (!value && value !== 0) return 'N/A';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    },
    
    formatVolume(value) {
        if (!value) return 'N/A';
        if (value >= 1e9) return (value / 1e9).toFixed(2) + 'B';
        if (value >= 1e6) return (value / 1e6).toFixed(2) + 'M';
        if (value >= 1e3) return (value / 1e3).toFixed(2) + 'K';
        return value.toFixed(0);
    },
    
    formatLargeNumber(value) {
        if (!value) return 'N/A';
        if (value >= 1e12) return '$' + (value / 1e12).toFixed(2) + 'T';
        if (value >= 1e9) return '$' + (value / 1e9).toFixed(2) + 'B';
        if (value >= 1e6) return '$' + (value / 1e6).toFixed(2) + 'M';
        if (value >= 1e3) return '$' + (value / 1e3).toFixed(2) + 'K';
        return '$' + value.toFixed(0);
    },
    
    formatNumber(value) {
        if (!value || value === 'N/A') return 'N/A';
        if (typeof value === 'string') value = parseInt(value);
        return new Intl.NumberFormat('en-US').format(value);
    },
    
    formatPercent(value) {
        if (!value && value !== 0) return 'N/A';
        return (value * 100).toFixed(2) + '%';
    },
    
    formatRatio(value) {
        if (!value && value !== 0) return 'N/A';
        return value.toFixed(2);
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
        const overview = document.getElementById('stockOverview');
        const results = document.getElementById('resultsPanel');
        const profile = document.getElementById('companyProfileSection');
        
        if (overview) overview.classList.add('hidden');
        if (results) results.classList.add('hidden');
        if (profile) profile.classList.add('hidden');
    },
    
    updateLastUpdate() {
        const el = document.getElementById('lastUpdate');
        if (!el) return;
        
        const now = new Date();
        const formatted = now.toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        el.textContent = `Last update: ${formatted}`;
    },
    
    showNotification(message, type = 'info') {
        if (window.FinanceDashboard && window.FinanceDashboard.showNotification) {
            window.FinanceDashboard.showNotification(message, type);
        } else {
            console.log(`[${type.toUpperCase()}]`, message);
        }
    },
    
    debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    },

    // ============================================
    // DISPLAY FUNCTIONS
    // ============================================
    
    displayStockOverview() {
        const quote = this.stockData.quote;
        
        document.getElementById('stockName').textContent = quote.name || this.currentSymbol;
        document.getElementById('stockSymbol').textContent = quote.symbol || this.currentSymbol;
        
        const price = quote.price;
        const change = quote.change || 0;
        const changePercent = quote.percentChange || 0;
        
        document.getElementById('currentPrice').textContent = this.formatCurrency(price);
        
        const priceChangeEl = document.getElementById('priceChange');
        const changeText = `${change >= 0 ? '+' : ''}${this.formatCurrency(change)} (${change >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)`;
        priceChangeEl.textContent = changeText;
        priceChangeEl.className = change >= 0 ? 'price-change positive' : 'price-change negative';
        
        document.getElementById('statOpen').textContent = this.formatCurrency(quote.open);
        document.getElementById('statHigh').textContent = this.formatCurrency(quote.high);
        document.getElementById('statLow').textContent = this.formatCurrency(quote.low);
        document.getElementById('statVolume').textContent = this.formatVolume(quote.volume);
        document.getElementById('statMarketCap').textContent = 'N/A';
        document.getElementById('statPE').textContent = 'N/A';
        
        document.getElementById('stockOverview').classList.remove('hidden');
    },
    
    displayResults() {
        this.createPriceChart();
        this.createRSIChart();
        this.createMACDChart();
        this.displayTradingSignals();
        this.displayKeyStatistics();
        
        document.getElementById('resultsPanel').classList.remove('hidden');
    },
    
    createPriceChart() {
        const prices = this.stockData.prices;
        const ohlc = prices.map(p => [p.timestamp, p.open, p.high, p.low, p.close]);
        const volume = prices.map(p => [p.timestamp, p.volume]);
        
        const showSMA = document.getElementById('toggleSMA')?.checked !== false;
        const showEMA = document.getElementById('toggleEMA')?.checked || false;
        const showBB = document.getElementById('toggleBB')?.checked !== false;
        const showVolume = document.getElementById('toggleVolume')?.checked !== false;
        
        const series = [
            {
                type: 'candlestick',
                name: this.currentSymbol,
                data: ohlc,
                id: 'price',
                color: '#dc3545',
                upColor: '#28a745'
            }
        ];
        
        if (showSMA) {
            series.push({
                type: 'sma',
                linkedTo: 'price',
                params: { period: 20 },
                color: '#2649B2',
                lineWidth: 2,
                name: 'SMA 20'
            });
            series.push({
                type: 'sma',
                linkedTo: 'price',
                params: { period: 50 },
                color: '#9D5CE6',
                lineWidth: 2,
                name: 'SMA 50'
            });
        }
        
        if (showEMA) {
            series.push({
                type: 'ema',
                linkedTo: 'price',
                params: { period: 12 },
                color: '#4A74F3',
                lineWidth: 2,
                name: 'EMA 12'
            });
            series.push({
                type: 'ema',
                linkedTo: 'price',
                params: { period: 26 },
                color: '#8E7DE3',
                lineWidth: 2,
                name: 'EMA 26'
            });
        }
        
        if (showBB) {
            series.push({
                type: 'bb',
                linkedTo: 'price',
                color: '#6C8BE0',
                fillOpacity: 0.1,
                lineWidth: 1,
                name: 'Bollinger Bands'
            });
        }
        
        if (showVolume) {
            series.push({
                type: 'column',
                name: 'Volume',
                data: volume,
                yAxis: 1,
                color: '#D4D9F0'
            });
        }
        
        Highcharts.stockChart('priceChart', {
            chart: {
                height: 600,
                borderRadius: 15
            },
            title: {
                text: `${this.currentSymbol} Price Chart`,
                style: { color: '#2649B2', fontWeight: 'bold' }
            },
            rangeSelector: {
                selected: 1
            },
            yAxis: [{
                labels: {
                    align: 'right',
                    x: -3
                },
                title: {
                    text: 'Price'
                },
                height: '75%',
                lineWidth: 2
            }, {
                labels: {
                    align: 'right',
                    x: -3
                },
                title: {
                    text: 'Volume'
                },
                top: '80%',
                height: '20%',
                offset: 0,
                lineWidth: 2
            }],
            tooltip: {
                split: true,
                borderRadius: 10
            },
            series: series,
            credits: { enabled: false }
        });
    },
    
    createRSIChart() {
        const prices = this.stockData.prices;
        const rsiData = this.calculateRSIArray(prices, 14);
        
        Highcharts.chart('rsiChart', {
            chart: {
                borderRadius: 15,
                height: 400
            },
            title: {
                text: 'RSI Indicator',
                style: { color: '#2649B2', fontWeight: 'bold' }
            },
            xAxis: {
                type: 'datetime',
                crosshair: true
            },
            yAxis: {
                title: { 
                    text: 'RSI',
                    style: { color: '#2649B2' }
                },
                plotLines: [{
                    value: 70,
                    color: '#dc3545',
                    dashStyle: 'ShortDash',
                    width: 2,
                    label: {
                        text: 'Overbought (70)',
                        align: 'right',
                        style: { color: '#dc3545', fontWeight: 'bold' }
                    }
                }, {
                    value: 30,
                    color: '#28a745',
                    dashStyle: 'ShortDash',
                    width: 2,
                    label: {
                        text: 'Oversold (30)',
                        align: 'right',
                        style: { color: '#28a745', fontWeight: 'bold' }
                    }
                }, {
                    value: 50,
                    color: '#6C8BE0',
                    dashStyle: 'Dot',
                    width: 1,
                    label: {
                        text: 'Neutral (50)',
                        align: 'right',
                        style: { color: '#6C8BE0' }
                    }
                }],
                min: 0,
                max: 100
            },
            tooltip: {
                borderRadius: 10,
                crosshairs: true,
                shared: true,
                valueDecimals: 2
            },
            plotOptions: {
                area: {
                    fillColor: {
                        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                        stops: [
                            [0, 'rgba(74, 116, 243, 0.3)'],
                            [1, 'rgba(74, 116, 243, 0.05)']
                        ]
                    },
                    lineWidth: 3,
                    marker: {
                        enabled: false
                    },
                    threshold: null
                }
            },
            series: [{
                type: 'area',
                name: 'RSI (14)',
                data: rsiData,
                color: '#4A74F3',
                zones: [{
                    value: 30,
                    color: '#28a745'
                }, {
                    value: 70,
                    color: '#ffc107'
                }, {
                    color: '#dc3545'
                }]
            }],
            credits: { enabled: false }
        });
    },
    
    calculateRSIArray(prices, period = 14) {
        const rsiData = [];
        
        if (prices.length < period + 1) {
            return rsiData;
        }
        
        let gains = 0;
        let losses = 0;
        
        for (let i = 1; i <= period; i++) {
            const change = prices[i].close - prices[i - 1].close;
            if (change > 0) gains += change;
            else losses += Math.abs(change);
        }
        
        let avgGain = gains / period;
        let avgLoss = losses / period;
        
        const rs = avgGain / avgLoss;
        const rsi = 100 - (100 / (1 + rs));
        rsiData.push([prices[period].timestamp, rsi]);
        
        for (let i = period + 1; i < prices.length; i++) {
            const change = prices[i].close - prices[i - 1].close;
            
            if (change > 0) {
                avgGain = ((avgGain * (period - 1)) + change) / period;
                avgLoss = (avgLoss * (period - 1)) / period;
            } else {
                avgGain = (avgGain * (period - 1)) / period;
                avgLoss = ((avgLoss * (period - 1)) + Math.abs(change)) / period;
            }
            
            const currentRS = avgGain / avgLoss;
            const currentRSI = 100 - (100 / (1 + currentRS));
            rsiData.push([prices[i].timestamp, currentRSI]);
        }
        
        return rsiData;
    },
    
    createMACDChart() {
        const prices = this.stockData.prices;
        const macdData = this.calculateMACDArray(prices);
        
        Highcharts.chart('macdChart', {
            chart: {
                borderRadius: 15,
                height: 400
            },
            title: {
                text: 'MACD Indicator',
                style: { color: '#2649B2', fontWeight: 'bold' }
            },
            xAxis: {
                type: 'datetime',
                crosshair: true
            },
            yAxis: {
                title: { 
                    text: 'MACD',
                    style: { color: '#2649B2' }
                },
                plotLines: [{
                    value: 0,
                    color: '#6C8BE0',
                    dashStyle: 'Dash',
                    width: 2,
                    label: {
                        text: 'Zero Line',
                        align: 'right',
                        style: { color: '#6C8BE0' }
                    }
                }]
            },
            tooltip: {
                borderRadius: 10,
                crosshairs: true,
                shared: true,
                valueDecimals: 2
            },
            plotOptions: {
                column: {
                    borderRadius: '25%'
                }
            },
            series: [{
                type: 'line',
                name: 'MACD Line',
                data: macdData.macd,
                color: '#2649B2',
                lineWidth: 2,
                marker: {
                    enabled: false
                }
            }, {
                type: 'line',
                name: 'Signal Line',
                data: macdData.signal,
                color: '#9D5CE6',
                lineWidth: 2,
                marker: {
                    enabled: false
                }
            }, {
                type: 'column',
                name: 'Histogram',
                data: macdData.histogram,
                color: '#6C8BE0',
                pointWidth: 3
            }],
            credits: { enabled: false }
        });
    },
    
    calculateMACDArray(prices, shortPeriod = 12, longPeriod = 26, signalPeriod = 9) {
        const closePrices = prices.map(p => p.close);
        
        const emaShort = this.calculateEMAArray(closePrices, shortPeriod);
        const emaLong = this.calculateEMAArray(closePrices, longPeriod);
        
        const macdLine = [];
        for (let i = longPeriod - 1; i < prices.length; i++) {
            const macdValue = emaShort[i] - emaLong[i];
            macdLine.push(macdValue);
        }
        
        const signalLine = this.calculateEMAArray(macdLine, signalPeriod);
        
        const macdData = [];
        const signalData = [];
        const histogramData = [];
        
        const startIndex = longPeriod - 1 + signalPeriod - 1;
        
        for (let i = startIndex; i < prices.length; i++) {
            const timestamp = prices[i].timestamp;
            const macdIndex = i - (longPeriod - 1);
            const signalIndex = macdIndex - (signalPeriod - 1);
            
            if (signalIndex >= 0 && signalIndex < signalLine.length) {
                const macdVal = macdLine[macdIndex];
                const signalVal = signalLine[signalIndex];
                const histogramVal = macdVal - signalVal;
                
                macdData.push([timestamp, macdVal]);
                signalData.push([timestamp, signalVal]);
                histogramData.push([timestamp, histogramVal]);
            }
        }
        
        return {
            macd: macdData,
            signal: signalData,
            histogram: histogramData
        };
    },
    
    calculateEMAArray(data, period) {
        const k = 2 / (period + 1);
        const emaArray = [];
        
        for (let i = 0; i < period - 1; i++) {
            emaArray[i] = undefined;
        }
        
        let sum = 0;
        for (let i = 0; i < period; i++) {
            sum += data[i];
        }
        emaArray[period - 1] = sum / period;
        
        for (let i = period; i < data.length; i++) {
            const ema = data[i] * k + emaArray[i - 1] * (1 - k);
            emaArray[i] = ema;
        }
        
        return emaArray;
    },
    
    calculateRSI(prices, period = 14) {
        if (prices.length < period + 1) return null;
        
        let gains = 0;
        let losses = 0;
        
        for (let i = 1; i <= period; i++) {
            const change = prices[i].close - prices[i - 1].close;
            if (change > 0) gains += change;
            else losses += Math.abs(change);
        }
        
        let avgGain = gains / period;
        let avgLoss = losses / period;
        
        for (let i = period + 1; i < prices.length; i++) {
            const change = prices[i].close - prices[i - 1].close;
            if (change > 0) {
                avgGain = ((avgGain * (period - 1)) + change) / period;
                avgLoss = (avgLoss * (period - 1)) / period;
            } else {
                avgGain = (avgGain * (period - 1)) / period;
                avgLoss = ((avgLoss * (period - 1)) + Math.abs(change)) / period;
            }
        }
        
        const rs = avgGain / avgLoss;
        const rsi = 100 - (100 / (1 + rs));
        
        return rsi;
    },
    
    displayTradingSignals() {
        const prices = this.stockData.prices;
        const currentPrice = prices[prices.length - 1].close;
        const rsi = this.calculateRSI(prices);
        
        const sma20 = this.calculateSMA(prices, 20);
        const sma50 = this.calculateSMA(prices, 50);
        
        const signals = [];
        
        let rsiSignal = 'neutral';
        let rsiStatus = 'Neutral';
        if (rsi < 30) {
            rsiSignal = 'bullish';
            rsiStatus = 'Oversold - Buy Signal';
        } else if (rsi > 70) {
            rsiSignal = 'bearish';
            rsiStatus = 'Overbought - Sell Signal';
        }
        
        signals.push({
            title: 'RSI Signal',
            value: rsi.toFixed(2),
            status: rsiStatus,
            type: rsiSignal
        });
        
        let maSignal = 'neutral';
        let maStatus = 'Neutral';
        if (currentPrice > sma20 && sma20 > sma50) {
            maSignal = 'bullish';
            maStatus = 'Bullish Trend';
        } else if (currentPrice < sma20 && sma20 < sma50) {
            maSignal = 'bearish';
            maStatus = 'Bearish Trend';
        }
        
        signals.push({
            title: 'Moving Average',
            value: currentPrice > sma20 ? 'Above SMA' : 'Below SMA',
            status: maStatus,
            type: maSignal
        });
        
        const priceChange = ((currentPrice - prices[0].close) / prices[0].close) * 100;
        signals.push({
            title: 'Overall Trend',
            value: `${priceChange > 0 ? '+' : ''}${priceChange.toFixed(2)}%`,
            status: priceChange > 5 ? 'Strong Uptrend' : priceChange < -5 ? 'Strong Downtrend' : 'Sideways',
            type: priceChange > 0 ? 'bullish' : priceChange < 0 ? 'bearish' : 'neutral'
        });
        
        const volatility = this.calculateVolatility(prices);
        signals.push({
            title: 'Volatility',
            value: `${volatility.toFixed(2)}%`,
            status: volatility > 3 ? 'High' : volatility > 1.5 ? 'Moderate' : 'Low',
            type: 'neutral'
        });
        
        const container = document.getElementById('tradingSignals');
        container.innerHTML = signals.map(signal => `
            <div class='signal-card ${signal.type}'>
                <div class='signal-title'>${signal.title}</div>
                <div class='signal-value'>${signal.value}</div>
                <div class='signal-status'>${signal.status}</div>
            </div>
        `).join('');
    },
    
    displayKeyStatistics() {
        const prices = this.stockData.prices;
        
        const stats = [];
        
        const high52w = Math.max(...prices.map(p => p.high));
        const low52w = Math.min(...prices.map(p => p.low));
        
        stats.push({ label: '52W High', value: this.formatCurrency(high52w) });
        stats.push({ label: '52W Low', value: this.formatCurrency(low52w) });
        
        const avgVolume = prices.reduce((sum, p) => sum + p.volume, 0) / prices.length;
        stats.push({ label: 'Avg Volume', value: this.formatVolume(avgVolume) });
        
        const volatility = this.calculateVolatility(prices);
        stats.push({ label: 'Volatility', value: `${volatility.toFixed(2)}%` });
        
        stats.push({ label: 'Beta', value: 'N/A' });
        stats.push({ label: 'Sharpe Ratio', value: 'N/A' });
        
        const container = document.getElementById('keyStats');
        container.innerHTML = stats.map(stat => `
            <div class='stat-box'>
                <div class='label'>${stat.label}</div>
                <div class='value'>${stat.value}</div>
            </div>
        `).join('');
    },
    
    calculateSMA(prices, period) {
        if (prices.length < period) return 0;
        const sum = prices.slice(-period).reduce((acc, p) => acc + p.close, 0);
        return sum / period;
    },
    
    calculateVolatility(prices) {
        const returns = [];
        for (let i = 1; i < prices.length; i++) {
            const ret = (prices[i].close - prices[i - 1].close) / prices[i - 1].close;
            returns.push(ret);
        }
        
        const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
        const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
        const stdDev = Math.sqrt(variance);
        
        return stdDev * Math.sqrt(252) * 100;
    },
    
    // ============================================
    // UTILITY FUNCTIONS
    // ============================================
    
    formatCurrency(value) {
        if (!value && value !== 0) return 'N/A';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    },
    
    formatVolume(value) {
        if (!value) return 'N/A';
        if (value >= 1e9) return (value / 1e9).toFixed(2) + 'B';
        if (value >= 1e6) return (value / 1e6).toFixed(2) + 'M';
        if (value >= 1e3) return (value / 1e3).toFixed(2) + 'K';
        return value.toFixed(0);
    },
    
    formatLargeNumber(value) {
        if (!value) return 'N/A';
        if (value >= 1e12) return '$' + (value / 1e12).toFixed(2) + 'T';
        if (value >= 1e9) return '$' + (value / 1e9).toFixed(2) + 'B';
        if (value >= 1e6) return '$' + (value / 1e6).toFixed(2) + 'M';
        return '$' + value.toFixed(0);
    },
    
    showLoading(show) {
        const loader = document.getElementById('loadingIndicator');
        if (show) {
            loader.classList.remove('hidden');
        } else {
            loader.classList.add('hidden');
        }
    },
    
    hideResults() {
        document.getElementById('stockOverview').classList.add('hidden');
        document.getElementById('resultsPanel').classList.add('hidden');
    },
    
    updateLastUpdate() {
        const now = new Date();
        const formatted = now.toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        document.getElementById('lastUpdate').textContent = `Last update: ${formatted}`;
    }
});

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    MarketData.init();
});