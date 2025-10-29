/* ==============================================
   MARKET-DATA.JS - Market Data & Technical Analysis
   ============================================== */

const MarketData = {
    currentSymbol: '',
    currentPeriod: '1M',
    stockData: null,
    
    // Proxy CORS
    CORS_PROXIES: [
        'https://api.allorigins.win/raw?url=',
        'https://corsproxy.io/?',
        'https://api.codetabs.com/v1/proxy?quest='
    ],
    currentProxyIndex: 0,
    
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
        this.updateLastUpdate();
        this.setupEventListeners();
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
    
    // Search Stock
    searchStock() {
        const symbol = document.getElementById('symbolInput').value.trim().toUpperCase();
        if (symbol) {
            this.loadSymbol(symbol);
        }
    },
    
    // Load Symbol Data
    async loadSymbol(symbol) {
        this.currentSymbol = symbol;
        document.getElementById('symbolInput').value = symbol;
        
        this.showLoading(true);
        this.hideResults();
        
        try {
            await this.fetchYahooFinanceData(symbol);
            this.displayStockOverview();
            this.displayResults();
            this.showLoading(false);
            this.updateAddToWatchlistButton();
            
        } catch (error) {
            console.error('Error loading stock data:', error);
            console.log('Using demo data as fallback...');
            this.stockData = this.generateDemoData(symbol);
            this.displayStockOverview();
            this.displayResults();
            this.showLoading(false);
            this.updateAddToWatchlistButton();
        }
    },
    
    // Fetch from Yahoo Finance with CORS proxy
    async fetchYahooFinanceData(symbol) {
        const period = this.getPeriodParams(this.currentPeriod);
        const targetUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${period.interval}&range=${period.range}`;
        
        // Try with CORS proxy
        for (let i = 0; i < this.CORS_PROXIES.length; i++) {
            try {
                const proxyUrl = this.CORS_PROXIES[i];
                const url = proxyUrl + encodeURIComponent(targetUrl);
                
                console.log(`Attempting fetch with proxy ${i + 1}...`);
                const response = await fetch(url);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                
                const data = await response.json();
                
                if (data.chart && data.chart.error) {
                    throw new Error(data.chart.error.description);
                }
                
                const result = data.chart.result[0];
                this.stockData = this.parseYahooData(result);
                
                // Fetch quote data
                await this.fetchQuoteData(symbol);
                
                console.log('✅ Data fetched successfully');
                return;
                
            } catch (error) {
                console.warn(`Proxy ${i + 1} failed:`, error.message);
                if (i === this.CORS_PROXIES.length - 1) {
                    throw new Error('All proxies failed');
                }
            }
        }
    },
    
    // Fetch Quote Data
    async fetchQuoteData(symbol) {
        try {
            const targetUrl = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}`;
            const proxyUrl = this.CORS_PROXIES[0];
            const url = proxyUrl + encodeURIComponent(targetUrl);
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.quoteResponse && data.quoteResponse.result.length > 0) {
                const quote = data.quoteResponse.result[0];
                this.stockData.quote = {
                    name: quote.longName || quote.shortName || symbol,
                    symbol: quote.symbol,
                    price: quote.regularMarketPrice,
                    change: quote.regularMarketChange,
                    changePercent: quote.regularMarketChangePercent,
                    open: quote.regularMarketOpen,
                    high: quote.regularMarketDayHigh,
                    low: quote.regularMarketDayLow,
                    volume: quote.regularMarketVolume,
                    marketCap: quote.marketCap,
                    pe: quote.trailingPE
                };
            }
        } catch (error) {
            console.warn('Quote fetch failed, using fallback data');
            const lastPrice = this.stockData.prices[this.stockData.prices.length - 1];
            const prevPrice = this.stockData.prices[this.stockData.prices.length - 2] || lastPrice;
            
            this.stockData.quote = {
                name: symbol,
                symbol: symbol,
                price: lastPrice.close,
                change: lastPrice.close - prevPrice.close,
                changePercent: ((lastPrice.close - prevPrice.close) / prevPrice.close) * 100,
                open: lastPrice.open,
                high: lastPrice.high,
                low: lastPrice.low,
                volume: lastPrice.volume,
                marketCap: null,
                pe: null
            };
        }
    },
    
    // Parse Yahoo Finance Data
    parseYahooData(result) {
        const timestamps = result.timestamp;
        const quotes = result.indicators.quote[0];
        
        const prices = timestamps.map((time, i) => ({
            timestamp: time * 1000,
            open: quotes.open[i],
            high: quotes.high[i],
            low: quotes.low[i],
            close: quotes.close[i],
            volume: quotes.volume[i]
        })).filter(p => p.close !== null);
        
        return {
            symbol: result.meta.symbol,
            prices: prices,
            currency: result.meta.currency,
            quote: {}
        };
    },
    
    // Get Period Parameters
    getPeriodParams(period) {
        const params = {
            '1M': { range: '1mo', interval: '1d' },
            '3M': { range: '3mo', interval: '1d' },
            '6M': { range: '6mo', interval: '1d' },
            '1Y': { range: '1y', interval: '1d' },
            '5Y': { range: '5y', interval: '1wk' },
            'MAX': { range: 'max', interval: '1mo' }
        };
        return params[period] || params['1Y'];
    },
    
    // Change Period
    changePeriod(period) {
        this.currentPeriod = period;
        
        document.querySelectorAll('.period-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-period="${period}"]`)?.classList.add('active');
        
        if (this.currentSymbol) {
            this.loadSymbol(this.currentSymbol);
        }
        
        // Reload comparison if active
        if (this.comparisonSymbols.length > 0) {
            this.loadComparison();
        }
    },
    
    // Update Chart (when toggles change)
    updateChart() {
        if (this.stockData) {
            this.createPriceChart();
        }
    },
    
    // ============================================
    // COMPARISON FUNCTIONS
    // ============================================
    
    // Open comparison modal
    openComparisonModal() {
        document.getElementById('modalAddComparison').style.display = 'block';
    },
    
    // Close comparison modal
    closeComparisonModal() {
        document.getElementById('modalAddComparison').style.display = 'none';
        document.getElementById('comparisonSymbols').value = '';
    },
    
    // Load comparison
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
        
        // Show loading
        this.showNotification(`Loading ${symbols.length} stocks for comparison...`, 'info');
        
        // Fetch data for all symbols
        let successCount = 0;
        for (const symbol of symbols) {
            try {
                await this.fetchComparisonData(symbol);
                successCount++;
            } catch (error) {
                console.error(`Failed to load ${symbol}:`, error);
            }
            await this.sleep(500);
        }
        
        if (successCount < 2) {
            alert('Failed to load enough stocks for comparison. Please try again.');
            return;
        }
        
        // Display comparison
        this.displayComparison();
        this.showNotification(`✅ Comparison loaded for ${successCount} stocks`, 'success');
    },
    
    // Fetch comparison data for a symbol
    async fetchComparisonData(symbol) {
        const period = this.getPeriodParams(this.currentPeriod);
        const targetUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${period.interval}&range=${period.range}`;
        const proxyUrl = this.CORS_PROXIES[0];
        const url = proxyUrl + encodeURIComponent(targetUrl);
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.chart && data.chart.error) {
            throw new Error(data.chart.error.description);
        }
        
        const result = data.chart.result[0];
        const timestamps = result.timestamp;
        const quotes = result.indicators.quote[0];
        
        const prices = timestamps.map((time, i) => ({
            timestamp: time * 1000,
            close: quotes.close[i]
        })).filter(p => p.close !== null);
        
        // Fetch quote for additional info
        const quoteUrl = proxyUrl + encodeURIComponent(`https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}`);
        let quote = { symbol: symbol, name: symbol };
        
        try {
            const quoteResponse = await fetch(quoteUrl);
            const quoteData = await quoteResponse.json();
            if (quoteData.quoteResponse && quoteData.quoteResponse.result.length > 0) {
                const q = quoteData.quoteResponse.result[0];
                quote = {
                    symbol: q.symbol,
                    name: q.longName || q.shortName || symbol,
                    price: q.regularMarketPrice,
                    change: q.regularMarketChange,
                    changePercent: q.regularMarketChangePercent,
                    marketCap: q.marketCap,
                    pe: q.trailingPE,
                    volume: q.regularMarketVolume
                };
            }
        } catch (error) {
            console.warn('Quote fetch failed for', symbol);
        }
        
        this.comparisonData[symbol] = {
            prices: prices,
            quote: quote
        };
    },
    
    // Display comparison
    displayComparison() {
        // Hide empty state, show comparison
        document.getElementById('comparisonEmpty').classList.add('hidden');
        document.getElementById('comparisonContainer').classList.remove('hidden');
        
        // Render stock chips
        this.renderComparisonChips();
        
        // Create comparison chart
        this.createComparisonChart();
        
        // Create comparison table
        this.createComparisonTable();
    },
    
    // Render comparison chips
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
    
    // Remove from comparison
    removeFromComparison(symbol) {
        this.comparisonSymbols = this.comparisonSymbols.filter(s => s !== symbol);
        delete this.comparisonData[symbol];
        
        if (this.comparisonSymbols.length < 2) {
            this.clearComparison();
        } else {
            this.displayComparison();
        }
    },
    
    // Clear comparison
    clearComparison() {
        if (this.comparisonSymbols.length > 0 && !confirm('Clear comparison?')) {
            return;
        }
        
        this.comparisonSymbols = [];
        this.comparisonData = {};
        
        document.getElementById('comparisonEmpty').classList.remove('hidden');
        document.getElementById('comparisonContainer').classList.add('hidden');
    },
    
    // Create comparison chart
    createComparisonChart() {
        const series = [];
        
        this.comparisonSymbols.forEach((symbol, index) => {
            const data = this.comparisonData[symbol];
            if (!data) return;
            
            // Normalize to 100 (first price = 100)
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
                selected: 1,
                buttons: [{
                    type: 'month',
                    count: 1,
                    text: '1m'
                }, {
                    type: 'month',
                    count: 3,
                    text: '3m'
                }, {
                    type: 'month',
                    count: 6,
                    text: '6m'
                }, {
                    type: 'ytd',
                    text: 'YTD'
                }, {
                    type: 'year',
                    count: 1,
                    text: '1y'
                }, {
                    type: 'all',
                    text: 'All'
                }]
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
                }],
                labels: {
                    formatter: function() {
                        return this.value.toFixed(0);
                    }
                }
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
                verticalAlign: 'bottom',
                itemStyle: {
                    fontWeight: 'bold'
                }
            },
            series: series,
            credits: { enabled: false }
        });
    },
    
    // Create comparison table
    createComparisonTable() {
        const metrics = [];
        
        // Calculate metrics for each stock
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
            const sharpeRatio = totalReturn / volatility; // Simplified
            
            metrics.push({
                symbol: symbol,
                name: data.quote.name,
                currentPrice: data.quote.price || lastPrice,
                totalReturn: totalReturn,
                volatility: volatility,
                maxPrice: maxPrice,
                minPrice: minPrice,
                maxDrawdown: maxDrawdown,
                sharpeRatio: sharpeRatio,
                marketCap: data.quote.marketCap,
                pe: data.quote.pe,
                volume: data.quote.volume
            });
        });
        
        // Find best/worst for highlighting
        const bestReturn = Math.max(...metrics.map(m => m.totalReturn));
        const worstReturn = Math.min(...metrics.map(m => m.totalReturn));
        const lowestVol = Math.min(...metrics.map(m => m.volatility));
        const bestSharpe = Math.max(...metrics.map(m => m.sharpeRatio));
        
        // Create table HTML
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
                        <th>Market Cap</th>
                        <th>P/E Ratio</th>
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
                            <td class='value-neutral'>
                                ${m.marketCap ? this.formatLargeNumber(m.marketCap) : 'N/A'}
                            </td>
                            <td class='value-neutral'>
                                ${m.pe ? m.pe.toFixed(2) : 'N/A'}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
        document.getElementById('comparisonTable').innerHTML = tableHTML;
    },
    
    // Calculate max drawdown
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
    
    // Calculate volatility from prices
    calculateVolatilityFromPrices(prices) {
        const returns = [];
        for (let i = 1; i < prices.length; i++) {
            const ret = (prices[i] - prices[i - 1]) / prices[i - 1];
            returns.push(ret);
        }
        
        const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
        const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
        const stdDev = Math.sqrt(variance);
        
        return stdDev * Math.sqrt(252) * 100; // Annualized
    },

// ============================================
    // WATCHLIST FUNCTIONS
    // ============================================
    
    // Load watchlist from localStorage
    loadWatchlistFromStorage() {
        const saved = localStorage.getItem('market_watchlist');
        if (saved) {
            this.watchlist = JSON.parse(saved);
            this.renderWatchlist();
            this.refreshWatchlist();
        }
    },
    
    // Save watchlist to localStorage
    saveWatchlistToStorage() {
        localStorage.setItem('market_watchlist', JSON.stringify(this.watchlist));
    },
    
    // Add current stock to watchlist
    addCurrentToWatchlist() {
        if (!this.currentSymbol) {
            alert('Please search for a stock first');
            return;
        }
        
        // Check if already in watchlist
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
        
        // Show success notification
        this.showNotification(`✅ ${this.currentSymbol} added to watchlist`, 'success');
    },
    
    // Remove from watchlist
    removeFromWatchlist(symbol) {
        if (confirm(`Remove ${symbol} from watchlist?`)) {
            this.watchlist = this.watchlist.filter(item => item.symbol !== symbol);
            this.saveWatchlistToStorage();
            this.renderWatchlist();
            this.updateAddToWatchlistButton();
            this.showNotification(`${symbol} removed from watchlist`, 'info');
        }
    },
    
    // Clear entire watchlist
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
    
    // Render watchlist
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
    
    // Refresh entire watchlist
    async refreshWatchlist() {
        if (this.watchlist.length === 0) {
            return;
        }
        
        this.showNotification('Refreshing watchlist...', 'info');
        
        for (const item of this.watchlist) {
            await this.refreshSingleWatchlistItem(item.symbol);
            await this.sleep(500);
        }
        
        this.updateLastUpdate();
        this.checkAlerts();
    },
    
    // Refresh single watchlist item
    async refreshSingleWatchlistItem(symbol) {
        const card = document.getElementById(`watchlist-${symbol}`);
        if (!card) return;
        
        card.classList.add('watchlist-loading');
        
        try {
            const targetUrl = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}`;
            const proxyUrl = this.CORS_PROXIES[0];
            const url = proxyUrl + encodeURIComponent(targetUrl);
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.quoteResponse && data.quoteResponse.result.length > 0) {
                const quote = data.quoteResponse.result[0];
                
                const price = quote.regularMarketPrice || 0;
                const change = quote.regularMarketChange || 0;
                const changePercent = quote.regularMarketChangePercent || 0;
                const open = quote.regularMarketOpen || 0;
                const volume = quote.regularMarketVolume || 0;
                
                // Update card
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
                
                // Update watchlist item data for alerts
                const watchlistItem = this.watchlist.find(w => w.symbol === symbol);
                if (watchlistItem) {
                    watchlistItem.currentPrice = price;
                    watchlistItem.change = change;
                    watchlistItem.changePercent = changePercent;
                }
            }
        } catch (error) {
            console.error(`Error refreshing ${symbol}:`, error);
        } finally {
            card.classList.remove('watchlist-loading');
        }
    },
    
    // Start auto-refresh (every 60 seconds)
    startWatchlistAutoRefresh() {
        this.watchlistRefreshInterval = setInterval(() => {
            if (this.watchlist.length > 0) {
                this.refreshWatchlist();
            }
        }, 60000);
    },
    
    // Sleep helper
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    
    // Update "Add to Watchlist" button state
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
    
    // Load alerts from localStorage
    loadAlertsFromStorage() {
        const saved = localStorage.getItem('market_alerts');
        if (saved) {
            this.alerts = JSON.parse(saved);
            this.renderAlerts();
        }
    },
    
    // Save alerts to localStorage
    saveAlertsToStorage() {
        localStorage.setItem('market_alerts', JSON.stringify(this.alerts));
    },
    
    // Open alert modal
    openAlertModal() {
        document.getElementById('modalCreateAlert').style.display = 'block';
        // Pre-fill with current symbol if available
        if (this.currentSymbol) {
            document.getElementById('alertSymbol').value = this.currentSymbol;
        }
    },
    
    // Close alert modal
    closeAlertModal() {
        document.getElementById('modalCreateAlert').style.display = 'none';
        // Clear form
        document.getElementById('alertSymbol').value = '';
        document.getElementById('alertPrice').value = '';
        document.getElementById('alertType').value = 'above';
        document.getElementById('alertNote').value = '';
    },
    
    // Create alert
    createAlert() {
        const symbol = document.getElementById('alertSymbol').value.trim().toUpperCase();
        const price = parseFloat(document.getElementById('alertPrice').value);
        const type = document.getElementById('alertType').value;
        const note = document.getElementById('alertNote').value.trim();
        
        // Validation
        if (!symbol) {
            alert('Please enter a stock symbol');
            return;
        }
        
        if (!price || price <= 0) {
            alert('Please enter a valid target price');
            return;
        }
        
        // Create alert object
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
        
        // Add to watchlist if not already there
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
    
    // Delete alert
    deleteAlert(alertId) {
        if (confirm('Delete this alert?')) {
            this.alerts = this.alerts.filter(a => a.id !== alertId);
            this.saveAlertsToStorage();
            this.renderAlerts();
            this.showNotification('Alert deleted', 'info');
        }
    },
    
    // Render alerts
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
    
    // Check alerts
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
    
    // Request notification permission
    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                this.notificationPermission = permission === 'granted';
            });
        } else if ('Notification' in window && Notification.permission === 'granted') {
            this.notificationPermission = true;
        }
    },
    
    // Show notification
    showNotification(message, type = 'info', useBrowserNotification = false) {
        // Browser notification
        if (useBrowserNotification && this.notificationPermission) {
            new Notification('Market Data Alert', {
                body: message,
                icon: 'https://img.icons8.com/fluency/48/000000/stocks.png'
            });
        }
        
        // In-page notification (toast)
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
    
    // Display Stock Overview
    displayStockOverview() {
        const quote = this.stockData.quote;
        const lastPrice = this.stockData.prices[this.stockData.prices.length - 1];
        
        document.getElementById('stockName').textContent = quote.name || this.currentSymbol;
        document.getElementById('stockSymbol').textContent = quote.symbol || this.currentSymbol;
        
        const price = quote.price || lastPrice.close;
        const change = quote.change || 0;
        const changePercent = quote.changePercent || 0;
        
        document.getElementById('currentPrice').textContent = this.formatCurrency(price);
        
        const priceChangeEl = document.getElementById('priceChange');
        const changeText = `${change >= 0 ? '+' : ''}${this.formatCurrency(change)} (${change >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)`;
        priceChangeEl.textContent = changeText;
        priceChangeEl.className = change >= 0 ? 'price-change positive' : 'price-change negative';
        
        // Stats
        document.getElementById('statOpen').textContent = this.formatCurrency(quote.open || lastPrice.open);
        document.getElementById('statHigh').textContent = this.formatCurrency(quote.high || lastPrice.high);
        document.getElementById('statLow').textContent = this.formatCurrency(quote.low || lastPrice.low);
        document.getElementById('statVolume').textContent = this.formatVolume(quote.volume || lastPrice.volume);
        document.getElementById('statMarketCap').textContent = quote.marketCap ? this.formatLargeNumber(quote.marketCap) : 'N/A';
        document.getElementById('statPE').textContent = quote.pe ? quote.pe.toFixed(2) : 'N/A';
        
        document.getElementById('stockOverview').classList.remove('hidden');
    },
    
    // Display Results
    displayResults() {
        this.createPriceChart();
        this.createRSIChart();
        this.createMACDChart();
        this.displayTradingSignals();
        this.displayKeyStatistics();
        
        document.getElementById('resultsPanel').classList.remove('hidden');
    },
    
    // Create Price Chart
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
        
        // Add SMA
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
        
        // Add EMA
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
        
        // Add Bollinger Bands
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
        
        // Add Volume
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
                selected: 1,
                buttons: [{
                    type: 'week',
                    count: 1,
                    text: '1w'
                }, {
                    type: 'month',
                    count: 1,
                    text: '1m'
                }, {
                    type: 'month',
                    count: 3,
                    text: '3m'
                }, {
                    type: 'month',
                    count: 6,
                    text: '6m'
                }, {
                    type: 'ytd',
                    text: 'YTD'
                }, {
                    type: 'year',
                    count: 1,
                    text: '1y'
                }, {
                    type: 'all',
                    text: 'All'
                }]
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
    
    // Create RSI Chart - VERSION MANUELLE
    createRSIChart() {
        const prices = this.stockData.prices;
        
        // Calculer RSI manuellement
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
                    },
                    zIndex: 5
                }, {
                    value: 30,
                    color: '#28a745',
                    dashStyle: 'ShortDash',
                    width: 2,
                    label: {
                        text: 'Oversold (30)',
                        align: 'right',
                        style: { color: '#28a745', fontWeight: 'bold' }
                    },
                    zIndex: 5
                }, {
                    value: 50,
                    color: '#6C8BE0',
                    dashStyle: 'Dot',
                    width: 1,
                    label: {
                        text: 'Neutral (50)',
                        align: 'right',
                        style: { color: '#6C8BE0' }
                    },
                    zIndex: 5
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
    
    // Calculer RSI pour tous les points
    calculateRSIArray(prices, period = 14) {
        const rsiData = [];
        
        if (prices.length < period + 1) {
            return rsiData;
        }
        
        // Premier RSI
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
        
        // RSI suivants
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
    
    // Create MACD Chart - VERSION MANUELLE
    createMACDChart() {
        const prices = this.stockData.prices;
        
        // Calculer MACD manuellement
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
                    },
                    zIndex: 5
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
    
    // Calculer MACD pour tous les points
    calculateMACDArray(prices, shortPeriod = 12, longPeriod = 26, signalPeriod = 9) {
        const closePrices = prices.map(p => p.close);
        
        // Calculer EMA
        const emaShort = this.calculateEMAArray(closePrices, shortPeriod);
        const emaLong = this.calculateEMAArray(closePrices, longPeriod);
        
        // MACD Line = EMA(12) - EMA(26)
        const macdLine = [];
        for (let i = longPeriod - 1; i < prices.length; i++) {
            const macdValue = emaShort[i] - emaLong[i];
            macdLine.push(macdValue);
        }
        
        // Signal Line = EMA(9) of MACD
        const signalLine = this.calculateEMAArray(macdLine, signalPeriod);
        
        // Préparer les données pour Highcharts
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
    
    // Calculer EMA array
    calculateEMAArray(data, period) {
        const k = 2 / (period + 1);
        const emaArray = [];
        
        // Remplir les premiers éléments avec undefined
        for (let i = 0; i < period - 1; i++) {
            emaArray[i] = undefined;
        }
        
        // Premier EMA = SMA
        let sum = 0;
        for (let i = 0; i < period; i++) {
            sum += data[i];
        }
        emaArray[period - 1] = sum / period;
        
        // EMA suivants
        for (let i = period; i < data.length; i++) {
            const ema = data[i] * k + emaArray[i - 1] * (1 - k);
            emaArray[i] = ema;
        }
        
        return emaArray;
    },
    
    // Calculate RSI (single value)
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
    
    // Display Trading Signals
    displayTradingSignals() {
        const prices = this.stockData.prices;
        const currentPrice = prices[prices.length - 1].close;
        const rsi = this.calculateRSI(prices);
        
        // Calculate simple signals
        const sma20 = this.calculateSMA(prices, 20);
        const sma50 = this.calculateSMA(prices, 50);
        
        const signals = [];
        
        // RSI Signal
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
        
        // Moving Average Signal
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
        
        // Trend Signal
        const priceChange = ((currentPrice - prices[0].close) / prices[0].close) * 100;
        signals.push({
            title: 'Overall Trend',
            value: `${priceChange > 0 ? '+' : ''}${priceChange.toFixed(2)}%`,
            status: priceChange > 5 ? 'Strong Uptrend' : priceChange < -5 ? 'Strong Downtrend' : 'Sideways',
            type: priceChange > 0 ? 'bullish' : priceChange < 0 ? 'bearish' : 'neutral'
        });
        
        // Volatility
        const volatility = this.calculateVolatility(prices);
        signals.push({
            title: 'Volatility',
            value: `${volatility.toFixed(2)}%`,
            status: volatility > 3 ? 'High' : volatility > 1.5 ? 'Moderate' : 'Low',
            type: 'neutral'
        });
        
        // Render signals
        const container = document.getElementById('tradingSignals');
        container.innerHTML = signals.map(signal => `
            <div class='signal-card ${signal.type}'>
                <div class='signal-title'>${signal.title}</div>
                <div class='signal-value'>${signal.value}</div>
                <div class='signal-status'>${signal.status}</div>
            </div>
        `).join('');
    },
    
    // Display Key Statistics
    displayKeyStatistics() {
        const prices = this.stockData.prices;
        
        const stats = [];
        
        // 52-week high/low
        const high52w = Math.max(...prices.map(p => p.high));
        const low52w = Math.min(...prices.map(p => p.low));
        
        stats.push({ label: '52W High', value: this.formatCurrency(high52w) });
        stats.push({ label: '52W Low', value: this.formatCurrency(low52w) });
        
        // Average volume
        const avgVolume = prices.reduce((sum, p) => sum + p.volume, 0) / prices.length;
        stats.push({ label: 'Avg Volume', value: this.formatVolume(avgVolume) });
        
        // Volatility
        const volatility = this.calculateVolatility(prices);
        stats.push({ label: 'Volatility', value: `${volatility.toFixed(2)}%` });
        
        // Beta & Sharpe
        stats.push({ label: 'Beta', value: 'N/A' });
        stats.push({ label: 'Sharpe Ratio', value: 'N/A' });
        
        // Render stats
        const container = document.getElementById('keyStats');
        container.innerHTML = stats.map(stat => `
            <div class='stat-box'>
                <div class='label'>${stat.label}</div>
                <div class='value'>${stat.value}</div>
            </div>
        `).join('');
    },
    
    // Calculate SMA
    calculateSMA(prices, period) {
        if (prices.length < period) return 0;
        const sum = prices.slice(-period).reduce((acc, p) => acc + p.close, 0);
        return sum / period;
    },
    
    // Calculate Volatility
    calculateVolatility(prices) {
        const returns = [];
        for (let i = 1; i < prices.length; i++) {
            const ret = (prices[i].close - prices[i - 1].close) / prices[i - 1].close;
            returns.push(ret);
        }
        
        const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
        const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
        const stdDev = Math.sqrt(variance);
        
        return stdDev * Math.sqrt(252) * 100; // Annualized
    },
    
    // Generate Demo Data (fallback)
    generateDemoData(symbol) {
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
                changePercent: ((price - 100) / 100) * 100,
                open: price * 0.99,
                high: price * 1.01,
                low: price * 0.98,
                volume: 50000000,
                marketCap: price * 1000000000,
                pe: 25.5
            }
        };
    },
    
    // ============================================
    // UTILITY FUNCTIONS
    // ============================================
    
    // Format Currency
    formatCurrency(value) {
        if (!value && value !== 0) return 'N/A';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: this.stockData?.currency || 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    },
    
    // Format Volume
    formatVolume(value) {
        if (!value) return 'N/A';
        if (value >= 1e9) return (value / 1e9).toFixed(2) + 'B';
        if (value >= 1e6) return (value / 1e6).toFixed(2) + 'M';
        if (value >= 1e3) return (value / 1e3).toFixed(2) + 'K';
        return value.toFixed(0);
    },
    
    // Format Large Number
    formatLargeNumber(value) {
        if (!value) return 'N/A';
        if (value >= 1e12) return '$' + (value / 1e12).toFixed(2) + 'T';
        if (value >= 1e9) return '$' + (value / 1e9).toFixed(2) + 'B';
        if (value >= 1e6) return '$' + (value / 1e6).toFixed(2) + 'M';
        return '$' + value.toFixed(0);
    },
    
    // Show Loading
    showLoading(show) {
        const loader = document.getElementById('loadingIndicator');
        if (show) {
            loader.classList.remove('hidden');
        } else {
            loader.classList.add('hidden');
        }
    },
    
    // Hide Results
    hideResults() {
        document.getElementById('stockOverview').classList.add('hidden');
        document.getElementById('resultsPanel').classList.add('hidden');
    },
    
    // Update Last Update
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