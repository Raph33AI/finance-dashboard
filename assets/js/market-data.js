/* ==============================================
   MARKET-DATA.JS - Market Data & Technical Analysis
   Migré vers Twelve Data API + Cloudflare Workers Backend
   ============================================== */

const MarketData = {
    // API Client
    apiClient: null,
    
    // Current State
    currentSymbol: '',
    currentPeriod: '1M',
    stockData: null,
    
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
    comparisonColors: ['#2649B2', '#4A74F3', '#8E7DE3', '#9D5CE6', '#6C8BE0'],
    
    // Initialize
    init() {
        // ✅ Initialiser le client API
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
    },
    
    // Setup Event Listeners
    setupEventListeners() {
        const input = document.getElementById('symbolInput');
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchStock();
            }
        });
        
        // Indicator toggles
        document.getElementById('toggleSMA')?.addEventListener('change', () => this.updateChart());
        document.getElementById('toggleEMA')?.addEventListener('change', () => this.updateChart());
        document.getElementById('toggleBB')?.addEventListener('change', () => this.updateChart());
        document.getElementById('toggleVolume')?.addEventListener('change', () => this.updateChart());
    },
    
    // ========== RECHERCHE AVEC TWELVE DATA ==========
    
    setupSearchListeners() {
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
        }
        
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
            
            if (results.results && results.results.length > 0) {
                this.displaySearchResults(results.results, query);
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
        const stocks = [];
        const etfs = [];
        const crypto = [];
        const indices = [];
        const other = [];
        
        results.forEach(item => {
            const type = (item.type || 'EQUITY').toUpperCase();
            
            switch (type) {
                case 'COMMON STOCK':
                case 'EQUITY':
                    stocks.push(item);
                    break;
                case 'ETF':
                    etfs.push(item);
                    break;
                case 'CRYPTOCURRENCY':
                    crypto.push(item);
                    break;
                case 'INDEX':
                    indices.push(item);
                    break;
                default:
                    other.push(item);
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
            const highlightedName = this.highlightMatch(item.name, query);
            
            html += `
                <div class="suggestion-item" data-symbol="${item.symbol}">
                    <div class="suggestion-icon ${sectorMap[categoryName] || 'tech'}">
                        ${item.symbol.substring(0, 2)}
                    </div>
                    <div class="suggestion-info">
                        <div class="suggestion-symbol">${highlightedSymbol}</div>
                        <div class="suggestion-name">${highlightedName}</div>
                    </div>
                    ${item.exchange ? `<div class="suggestion-exchange">${item.exchange}</div>` : ''}
                </div>
            `;
        });
        
        return html;
    },
    
    highlightMatch(text, query) {
        if (!text || !query) return text;
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<span class="suggestion-match">$1</span>');
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
        document.getElementById('symbolInput').value = symbol;
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
    },
    
    // ========== CHARGEMENT DES DONNÉES ==========
    
    searchStock() {
        const symbol = document.getElementById('symbolInput').value.trim().toUpperCase();
        if (symbol) {
            this.loadSymbol(symbol);
        }
    },
    
    async loadSymbol(symbol) {
        this.currentSymbol = symbol;
        document.getElementById('symbolInput').value = symbol;
        
        this.showLoading(true);
        this.hideResults();
        this.hideSuggestions();
        
        try {
            // Récupérer quote + time series en parallèle
            const [quote, timeSeries] = await Promise.all([
                this.apiClient.getQuote(symbol),
                this.getTimeSeriesForPeriod(symbol, this.currentPeriod)
            ]);
            
            // Construire stockData
            this.stockData = {
                symbol: quote.symbol,
                prices: timeSeries.data,
                quote: quote
            };
            
            this.displayStockOverview();
            this.displayResults();
            this.showLoading(false);
            this.updateAddToWatchlistButton();
            
        } catch (error) {
            console.error('Error loading stock data:', error);
            this.showNotification(error.message, 'alert');
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
        const result = await this.apiClient.getTimeSeries(symbol, config.interval, config.outputsize);
        
        // Transformer les données pour correspondre au format attendu
        const transformedData = result.data.map(item => ({
            timestamp: new Date(item.datetime).getTime(),
            open: item.open,
            high: item.high,
            low: item.low,
            close: item.close,
            volume: item.volume
        }));
        
        return {
            symbol: result.symbol,
            interval: result.interval,
            data: transformedData
        };
    },
    
    changePeriod(period) {
        this.currentPeriod = period;
        
        document.querySelectorAll('.period-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-period="${period}"]`)?.classList.add('active');
        
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
    
    // ============================================
    // COMPARISON FUNCTIONS
    // ============================================
    
    openComparisonModal() {
        document.getElementById('modalAddComparison').style.display = 'block';
    },
    
    closeComparisonModal() {
        document.getElementById('modalAddComparison').style.display = 'none';
        document.getElementById('comparisonSymbols').value = '';
    },
    
    async loadComparison() {
        const input = document.getElementById('comparisonSymbols').value;
        const symbols = input.split(',')
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
        
        let successCount = 0;
        for (const symbol of symbols) {
            try {
                await this.fetchComparisonData(symbol);
                successCount++;
            } catch (error) {
                console.error(`Failed to load ${symbol}:`, error);
            }
        }
        
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
        
        const prices = timeSeries.data.map(item => ({
            timestamp: item.timestamp,
            close: item.close
        }));
        
        this.comparisonData[symbol] = {
            prices: prices,
            quote: {
                symbol: quote.symbol,
                name: quote.name || symbol,
                price: quote.price,
                change: quote.change,
                changePercent: quote.percentChange
            }
        };
    },
    
    displayComparison() {
        document.getElementById('comparisonEmpty').classList.add('hidden');
        document.getElementById('comparisonContainer').classList.remove('hidden');
        
        this.renderComparisonChips();
        this.createComparisonChart();
        this.createComparisonTable();
    },
    
    renderComparisonChips() {
        const container = document.getElementById('comparisonStocks');
        
        container.innerHTML = this.comparisonSymbols.map((symbol, index) => {
            const data = this.comparisonData[symbol];
            if (!data) return '';
            
            const firstPrice = data.prices[0].close;
            const lastPrice = data.prices[data.prices.length - 1].close;
            const performance = ((lastPrice - firstPrice) / firstPrice) * 100;
            const perfClass = performance >= 0 ? 'positive' : 'negative';
            const perfSign = performance >= 0 ? '+' : '';
            
            return `
                <div class='comparison-stock-chip' style='border-color: ${this.comparisonColors[index]}'>
                    <span class='symbol'>${symbol}</span>
                    <span class='performance ${perfClass}'>${perfSign}${performance.toFixed(2)}%</span>
                    <button class='remove' onclick='MarketData.removeFromComparison("${symbol}")'>
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
        
        document.getElementById('comparisonEmpty').classList.remove('hidden');
        document.getElementById('comparisonContainer').classList.add('hidden');
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
                lineWidth: 3,
                marker: {
                    enabled: false
                }
            });
        });
        
        Highcharts.stockChart('comparisonChart', {
            chart: {
                height: 500,
                borderRadius: 15
            },
            title: {
                text: 'Stock Performance Comparison (Normalized)',
                style: { color: '#2649B2', fontWeight: 'bold' }
            },
            subtitle: {
                text: 'All stocks start at 100 for easy comparison',
                style: { color: '#6C3483' }
            },
            rangeSelector: {
                selected: 1
            },
            yAxis: {
                title: {
                    text: 'Performance (Base 100)',
                    style: { color: '#2649B2' }
                },
                plotLines: [{
                    value: 100,
                    color: '#6C8BE0',
                    dashStyle: 'Dash',
                    width: 2,
                    label: {
                        text: 'Start (100)',
                        align: 'right',
                        style: { color: '#6C8BE0' }
                    }
                }]
            },
            tooltip: {
                shared: true,
                crosshairs: true,
                borderRadius: 10,
                valueDecimals: 2,
                pointFormatter: function() {
                    const change = this.y - 100;
                    const changeSign = change >= 0 ? '+' : '';
                    const color = change >= 0 ? '#28a745' : '#dc3545';
                    return `<span style="color:${this.color}">●</span> ${this.series.name}: <b>${this.y.toFixed(2)}</b> (<span style="color:${color}">${changeSign}${change.toFixed(2)}%</span>)<br/>`;
                }
            },
            legend: {
                enabled: true,
                align: 'center',
                verticalAlign: 'bottom'
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
            const sharpeRatio = totalReturn / volatility;
            
            metrics.push({
                symbol: symbol,
                name: data.quote.name,
                currentPrice: data.quote.price || lastPrice,
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
                            <td class='metric-label'>${m.symbol}</td>
                            <td>${this.formatCurrency(m.currentPrice)}</td>
                            <td class='${m.totalReturn === bestReturn ? 'best-value' : m.totalReturn === worstReturn ? 'worst-value' : ''} ${m.totalReturn >= 0 ? 'value-positive' : 'value-negative'}'>
                                ${m.totalReturn >= 0 ? '+' : ''}${m.totalReturn.toFixed(2)}%
                            </td>
                            <td class='${m.volatility === lowestVol ? 'best-value' : ''} value-neutral'>
                                ${m.volatility.toFixed(2)}%
                            </td>
                            <td class='value-negative'>
                                ${m.maxDrawdown.toFixed(2)}%
                            </td>
                            <td class='${m.sharpeRatio === bestSharpe ? 'best-value' : ''} value-neutral'>
                                ${m.sharpeRatio.toFixed(2)}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
        document.getElementById('comparisonTable').innerHTML = tableHTML;
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
    // WATCHLIST FUNCTIONS
    // ============================================
    
    loadWatchlistFromStorage() {
        const saved = localStorage.getItem('market_watchlist');
        if (saved) {
            this.watchlist = JSON.parse(saved);
            this.renderWatchlist();
            this.refreshWatchlist();
        }
    },
    
    saveWatchlistToStorage() {
        localStorage.setItem('market_watchlist', JSON.stringify(this.watchlist));
    },
    
    addCurrentToWatchlist() {
        if (!this.currentSymbol) {
            alert('Please search for a stock first');
            return;
        }
        
        if (this.watchlist.some(item => item.symbol === this.currentSymbol)) {
            alert(`${this.currentSymbol} is already in your watchlist`);
            return;
        }
        
        const watchlistItem = {
            symbol: this.currentSymbol,
            name: this.stockData.quote.name || this.currentSymbol,
            addedAt: Date.now()
        };
        
        this.watchlist.push(watchlistItem);
        this.saveWatchlistToStorage();
        this.renderWatchlist();
        this.refreshSingleWatchlistItem(this.currentSymbol);
        this.updateAddToWatchlistButton();
        
        this.showNotification(`✅ ${this.currentSymbol} added to watchlist`, 'success');
    },
    
    removeFromWatchlist(symbol) {
        if (confirm(`Remove ${symbol} from watchlist?`)) {
            this.watchlist = this.watchlist.filter(item => item.symbol !== symbol);
            this.saveWatchlistToStorage();
            this.renderWatchlist();
            this.updateAddToWatchlistButton();
            this.showNotification(`${symbol} removed from watchlist`, 'info');
        }
    },
    
    clearWatchlist() {
        if (this.watchlist.length === 0) {
            alert('Watchlist is already empty');
            return;
        }
        
        if (confirm(`Clear all ${this.watchlist.length} stocks from watchlist?`)) {
            this.watchlist = [];
            this.saveWatchlistToStorage();
            this.renderWatchlist();
            this.updateAddToWatchlistButton();
            this.showNotification('Watchlist cleared', 'info');
        }
    },
    
    renderWatchlist() {
        const container = document.getElementById('watchlistContainer');
        
        if (this.watchlist.length === 0) {
            container.innerHTML = `
                <div class='watchlist-empty'>
                    <i class='fas fa-star-half-alt'></i>
                    <p>Your watchlist is empty</p>
                    <p class='hint'>Search for a stock and click "Add to Watchlist" to start tracking</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.watchlist.map(item => `
            <div class='watchlist-card' id='watchlist-${item.symbol}' onclick='MarketData.loadSymbol("${item.symbol}")'>
                <div class='watchlist-card-header'>
                    <div>
                        <div class='watchlist-symbol'>${item.symbol}</div>
                        <div class='watchlist-name'>${item.name}</div>
                    </div>
                    <button class='watchlist-remove' onclick='event.stopPropagation(); MarketData.removeFromWatchlist("${item.symbol}")'>
                        <i class='fas fa-times'></i>
                    </button>
                </div>
                <div class='watchlist-price'>--</div>
                <div class='watchlist-change'>
                    <i class='fas fa-minus'></i>
                    <span>--</span>
                </div>
                <div class='watchlist-stats'>
                    <div class='watchlist-stat'>
                        <span class='watchlist-stat-label'>Open</span>
                        <span class='watchlist-stat-value'>--</span>
                    </div>
                    <div class='watchlist-stat'>
                        <span class='watchlist-stat-label'>Volume</span>
                        <span class='watchlist-stat-value'>--</span>
                    </div>
                </div>
            </div>
        `).join('');
    },
    
    async refreshWatchlist() {
        if (this.watchlist.length === 0) {
            return;
        }
        
        this.showNotification('Refreshing watchlist...', 'info');
        
        for (const item of this.watchlist) {
            await this.refreshSingleWatchlistItem(item.symbol);
        }
        
        this.updateLastUpdate();
        this.checkAlerts();
    },
    
    async refreshSingleWatchlistItem(symbol) {
        const card = document.getElementById(`watchlist-${symbol}`);
        if (!card) return;
        
        card.classList.add('watchlist-loading');
        
        try {
            const quote = await this.apiClient.getQuote(symbol);
            
            const price = quote.price || 0;
            const change = quote.change || 0;
            const changePercent = quote.percentChange || 0;
            const open = quote.open || 0;
            const volume = quote.volume || 0;
            
            card.querySelector('.watchlist-price').textContent = this.formatCurrency(price);
            
            const changeEl = card.querySelector('.watchlist-change');
            const icon = change >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';
            const changeClass = change >= 0 ? 'positive' : 'negative';
            changeEl.className = `watchlist-change ${changeClass}`;
            changeEl.innerHTML = `
                <i class='fas ${icon}'></i>
                <span>${change >= 0 ? '+' : ''}${this.formatCurrency(change)} (${change >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)</span>
            `;
            
            const stats = card.querySelectorAll('.watchlist-stat-value');
            stats[0].textContent = this.formatCurrency(open);
            stats[1].textContent = this.formatVolume(volume);
            
            const watchlistItem = this.watchlist.find(w => w.symbol === symbol);
            if (watchlistItem) {
                watchlistItem.currentPrice = price;
                watchlistItem.change = change;
                watchlistItem.changePercent = changePercent;
            }
        } catch (error) {
            console.error(`Error refreshing ${symbol}:`, error);
        } finally {
            card.classList.remove('watchlist-loading');
        }
    },
    
    startWatchlistAutoRefresh() {
        this.watchlistRefreshInterval = setInterval(() => {
            if (this.watchlist.length > 0) {
                this.refreshWatchlist();
            }
        }, 60000);
    },
    
    updateAddToWatchlistButton() {
        const btn = document.getElementById('btnAddCurrent');
        if (!btn) return;
        
        if (this.currentSymbol && !this.watchlist.some(w => w.symbol === this.currentSymbol)) {
            btn.disabled = false;
            btn.innerHTML = `<i class='fas fa-plus'></i> Add ${this.currentSymbol} to Watchlist`;
        } else if (this.currentSymbol) {
            btn.disabled = true;
            btn.innerHTML = `<i class='fas fa-check'></i> Already in Watchlist`;
        } else {
            btn.disabled = true;
            btn.innerHTML = `<i class='fas fa-plus'></i> Add Current Stock`;
        }
    },
    
    // ============================================
    // ALERTS FUNCTIONS
    // ============================================
    
    loadAlertsFromStorage() {
        const saved = localStorage.getItem('market_alerts');
        if (saved) {
            this.alerts = JSON.parse(saved);
            this.renderAlerts();
        }
    },
    
    saveAlertsToStorage() {
        localStorage.setItem('market_alerts', JSON.stringify(this.alerts));
    },
    
    openAlertModal() {
        document.getElementById('modalCreateAlert').style.display = 'block';
        if (this.currentSymbol) {
            document.getElementById('alertSymbol').value = this.currentSymbol;
        }
    },
    
    closeAlertModal() {
        document.getElementById('modalCreateAlert').style.display = 'none';
        document.getElementById('alertSymbol').value = '';
        document.getElementById('alertPrice').value = '';
        document.getElementById('alertType').value = 'above';
        document.getElementById('alertNote').value = '';
    },
    
    createAlert() {
        const symbol = document.getElementById('alertSymbol').value.trim().toUpperCase();
        const price = parseFloat(document.getElementById('alertPrice').value);
        const type = document.getElementById('alertType').value;
        const note = document.getElementById('alertNote').value.trim();
        
        if (!symbol) {
            alert('Please enter a stock symbol');
            return;
        }
        
        if (!price || price <= 0) {
            alert('Please enter a valid target price');
            return;
        }
        
        const alert = {
            id: Date.now(),
            symbol: symbol,
            targetPrice: price,
            type: type,
            note: note,
            triggered: false,
            createdAt: Date.now()
        };
        
        this.alerts.push(alert);
        this.saveAlertsToStorage();
        this.renderAlerts();
        this.closeAlertModal();
        
        this.showNotification(`✅ Alert created for ${symbol}`, 'success');
        
        if (!this.watchlist.some(w => w.symbol === symbol)) {
            this.watchlist.push({
                symbol: symbol,
                name: symbol,
                addedAt: Date.now()
            });
            this.saveWatchlistToStorage();
            this.renderWatchlist();
            this.refreshSingleWatchlistItem(symbol);
        }
    },
    
    deleteAlert(alertId) {
        if (confirm('Delete this alert?')) {
            this.alerts = this.alerts.filter(a => a.id !== alertId);
            this.saveAlertsToStorage();
            this.renderAlerts();
            this.showNotification('Alert deleted', 'info');
        }
    },
    
    renderAlerts() {
        const container = document.getElementById('alertsContainer');
        
        if (this.alerts.length === 0) {
            container.innerHTML = `
                <div class='alerts-empty'>
                    <i class='fas fa-bell-slash'></i>
                    <p>No active alerts</p>
                    <p class='hint'>Create price alerts to get notified when a stock reaches your target</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.alerts.map(alert => {
            const statusClass = alert.triggered ? 'triggered' : 'active';
            const statusText = alert.triggered ? 'Triggered ✓' : 'Active';
            const conditionText = alert.type === 'above' ? 'above' : 'below';
            
            return `
                <div class='alert-card ${statusClass}'>
                    <div class='alert-info'>
                        <div class='alert-symbol'>${alert.symbol}</div>
                        <div class='alert-condition'>
                            Alert when price goes <strong>${conditionText}</strong> 
                            <span class='price'>${this.formatCurrency(alert.targetPrice)}</span>
                        </div>
                        ${alert.note ? `<div class='alert-note'>${alert.note}</div>` : ''}
                    </div>
                    <span class='alert-status ${statusClass}'>${statusText}</span>
                    <button class='alert-delete' onclick='MarketData.deleteAlert(${alert.id})'>
                        <i class='fas fa-trash'></i>
                    </button>
                </div>
            `;
        }).join('');
    },
    
    checkAlerts() {
        let triggeredCount = 0;
        
        this.alerts.forEach(alert => {
            if (alert.triggered) return;
            
            const watchlistItem = this.watchlist.find(w => w.symbol === alert.symbol);
            if (!watchlistItem || !watchlistItem.currentPrice) return;
            
            const currentPrice = watchlistItem.currentPrice;
            let shouldTrigger = false;
            
            if (alert.type === 'above' && currentPrice >= alert.targetPrice) {
                shouldTrigger = true;
            } else if (alert.type === 'below' && currentPrice <= alert.targetPrice) {
                shouldTrigger = true;
            }
            
            if (shouldTrigger) {
                alert.triggered = true;
                triggeredCount++;
                
                const message = `🔔 ${alert.symbol} is now ${alert.type} ${this.formatCurrency(alert.targetPrice)}! Current: ${this.formatCurrency(currentPrice)}`;
                this.showNotification(message, 'alert', true);
            }
        });
        
        if (triggeredCount > 0) {
            this.saveAlertsToStorage();
            this.renderAlerts();
        }
    },
    
    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                this.notificationPermission = permission === 'granted';
            });
        } else if ('Notification' in window && Notification.permission === 'granted') {
            this.notificationPermission = true;
        }
    },
    
    showNotification(message, type = 'info', useBrowserNotification = false) {
        if (useBrowserNotification && this.notificationPermission) {
            new Notification('Market Data Alert', {
                body: message,
                icon: 'https://img.icons8.com/fluency/48/000000/stocks.png'
            });
        }
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : type === 'alert' ? '#ffc107' : '#2649B2'};
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            z-index: 10000;
            font-weight: bold;
            max-width: 400px;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 5000);
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
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    MarketData.init();
});