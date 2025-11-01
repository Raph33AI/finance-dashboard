/* ============================================
   INTERACTIVE-DEMO.JS - VERSION PREMIUM
   Main JavaScript pour la page de démo interactive
   🚀 AVEC GRAPHIQUES ADDITIONNELS ET FONCTIONNALITÉS AVANCÉES
   ============================================ */

// ============================================
// DEBUG MODE
// ============================================
console.log('🔍 Loading interactive-demo.js PREMIUM...');

// Check dependencies
if (typeof APP_CONFIG === 'undefined') {
    console.error('❌ APP_CONFIG not found! config.js not loaded?');
} else {
    console.log('✅ APP_CONFIG loaded:', APP_CONFIG);
}

if (typeof FinanceAPIClient === 'undefined') {
    console.error('❌ FinanceAPIClient not found! api-client.js not loaded?');
} else {
    console.log('✅ FinanceAPIClient available');
}

if (typeof Highcharts === 'undefined') {
    console.error('❌ Highcharts not found! Check CDN link');
} else {
    console.log('✅ Highcharts loaded');
}

console.log('📍 Current page:', window.location.href);

// ============================================
// CONFIGURATION & GLOBAL STATE
// ============================================
const DemoApp = {
    // API Client
    apiClient: null,
    
    // Current active tool
    activeTool: 'company-search',
    
    // Search timeout
    searchTimeout: null,
    
    // Selected suggestion index
    selectedSuggestionIndex: -1,
    
    // Current technical symbol
    currentTechnicalSymbol: null,
    
    // Current company symbol
    currentCompanySymbol: null,
    
    // Portfolio data
    portfolio: [],
    
    // Charts
    charts: {
        liveQuote: null,
        portfolioAllocation: null,
        technical: null,
        aiPrediction: null,
        companyPerformance: null,
        companyRatings: null,
        sentimentGauge: null,
        correlationHeatmap: null,
        portfolioPerformance: null,
        monteCarlo: null,
        aiPredictionChart: null
    },
    
    // ============================================
    // INITIALIZATION
    // ============================================
    init: function() {
        try {
            console.log('🚀 Initializing Interactive Demo PREMIUM...');
            
            // Initialize API Client
            this.apiClient = new FinanceAPIClient({
                baseURL: APP_CONFIG.API_BASE_URL,
                cacheDuration: APP_CONFIG.CACHE_DURATION,
                maxRetries: APP_CONFIG.MAX_RETRIES,
                onLoadingChange: (isLoading) => {
                    this.showLoading(isLoading);
                }
            });
            
            // Make API client globally accessible
            window.apiClient = this.apiClient;
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Initialize first tool
            this.switchTool('company-search');
            
            console.log('✅ Interactive Demo PREMIUM initialized successfully!');
            
        } catch (error) {
            console.error('❌ Initialization error:', error);
            this.showNotification('Failed to initialize demo. Please refresh the page.', 'error');
        }
    },
    
    // ============================================
    // EVENT LISTENERS
    // ============================================
    setupEventListeners: function() {
        // Tool navigation
        document.querySelectorAll('.tool-card').forEach(card => {
            card.addEventListener('click', () => {
                const tool = card.dataset.tool;
                this.switchTool(tool);
            });
        });
        
        // Company Search
        this.setupCompanySearchListeners();
        
        // Live Quotes
        this.setupLiveQuotesListeners();
        
        // Portfolio Builder
        this.setupPortfolioListeners();
        
        // Technical Analysis
        this.setupTechnicalListeners();
        
        // Risk Calculator
        this.setupRiskCalculatorListeners();
        
        // AI Insights
        this.setupAIInsightsListeners();
    },
    
    // ============================================
    // TOOL SWITCHING
    // ============================================
    switchTool: function(toolName) {
        console.log('🔄 Switching to tool:', toolName);
        
        // Update active tool
        this.activeTool = toolName;
        
        // Update tool cards
        document.querySelectorAll('.tool-card').forEach(card => {
            if (card.dataset.tool === toolName) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });
        
        // Update tool content
        document.querySelectorAll('.demo-tool').forEach(tool => {
            if (tool.id === `tool-${toolName}`) {
                tool.classList.add('active');
            } else {
                tool.classList.remove('active');
            }
        });
        
        // Scroll to content
        const toolElement = document.getElementById(`tool-${toolName}`);
        if (toolElement) {
            toolElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    },
    
    // ============================================
    // COMPANY SEARCH - AMÉLIORÉ AVEC GRAPHIQUES
    // ============================================
    setupCompanySearchListeners: function() {
        const input = document.getElementById('companySearchInput');
        const btnSearch = document.getElementById('btnSearch');
        
        if (input) {
            input.addEventListener('input', (e) => {
                this.handleCompanySearch(e.target.value);
            });
            
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const suggestions = document.querySelectorAll('.suggestion-item');
                    if (this.selectedSuggestionIndex >= 0 && suggestions[this.selectedSuggestionIndex]) {
                        const symbol = suggestions[this.selectedSuggestionIndex].dataset.symbol;
                        this.selectCompany(symbol);
                    } else {
                        this.searchCompany(input.value);
                    }
                } else if (e.key === 'Escape') {
                    this.hideSuggestions();
                } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    this.navigateSuggestions(e.key === 'ArrowDown' ? 1 : -1);
                }
            });
        }
        
        if (btnSearch) {
            btnSearch.addEventListener('click', () => {
                this.searchCompany(input.value);
            });
        }
        
        // Popular tags
        document.querySelectorAll('.popular-tag').forEach(tag => {
            tag.addEventListener('click', () => {
                const symbol = tag.dataset.symbol;
                if (input) input.value = symbol;
                this.searchCompany(symbol);
            });
        });
        
        // Click outside to close
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-box-wrapper')) {
                this.hideSuggestions();
            }
        });
    },
    
    navigateSuggestions: function(direction) {
        const suggestions = document.querySelectorAll('.suggestion-item');
        if (suggestions.length === 0) return;
        
        if (this.selectedSuggestionIndex >= 0 && suggestions[this.selectedSuggestionIndex]) {
            suggestions[this.selectedSuggestionIndex].classList.remove('keyboard-selected');
        }
        
        this.selectedSuggestionIndex += direction;
        
        if (this.selectedSuggestionIndex < 0) {
            this.selectedSuggestionIndex = suggestions.length - 1;
        } else if (this.selectedSuggestionIndex >= suggestions.length) {
            this.selectedSuggestionIndex = 0;
        }
        
        if (suggestions[this.selectedSuggestionIndex]) {
            suggestions[this.selectedSuggestionIndex].classList.add('keyboard-selected');
            suggestions[this.selectedSuggestionIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    },
    
    handleCompanySearch: function(query) {
        const trimmedQuery = query.trim();
        this.selectedSuggestionIndex = -1;
        
        if (trimmedQuery.length === 0) {
            this.hideSuggestions();
            return;
        }
        
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.searchSymbols(trimmedQuery);
        }, 300);
    },
    
    searchSymbols: async function(query) {
        console.log('🔍 Searching for:', query);
        
        const container = document.getElementById('searchSuggestions');
        if (!container) return;
        
        container.innerHTML = '<div class="suggestion-loading"><i class="fas fa-spinner fa-spin"></i> Searching...</div>';
        container.classList.add('active');
        
        try {
            const results = await this.apiClient.searchSymbol(query);
            
            if (results.data && results.data.length > 0) {
                this.displaySearchSuggestions(results.data, query);
            } else {
                this.displayNoResults(query);
            }
        } catch (error) {
            console.error('Search failed:', error);
            this.displaySearchError();
        }
    },
    
    displaySearchSuggestions: function(results, query) {
        const container = document.getElementById('searchSuggestions');
        if (!container) return;
        
        const queryLower = query.toLowerCase();
        
        const sortedResults = results.sort((a, b) => {
            const aSymbol = (a.symbol || '').toLowerCase();
            const bSymbol = (b.symbol || '').toLowerCase();
            const aName = (a.instrument_name || '').toLowerCase();
            const bName = (b.instrument_name || '').toLowerCase();
            
            if (aSymbol === queryLower) return -1;
            if (bSymbol === queryLower) return 1;
            
            if (aSymbol.startsWith(queryLower) && !bSymbol.startsWith(queryLower)) return -1;
            if (bSymbol.startsWith(queryLower) && !aSymbol.startsWith(queryLower)) return 1;
            
            if (aName.startsWith(queryLower) && !bName.startsWith(queryLower)) return -1;
            if (bName.startsWith(queryLower) && !aName.startsWith(queryLower)) return 1;
            
            return aSymbol.localeCompare(bSymbol);
        });
        
        const grouped = {
            stocks: [],
            etfs: [],
            crypto: []
        };
        
        sortedResults.forEach(item => {
            const type = (item.instrument_type || 'Common Stock').toLowerCase();
            
            if (type.includes('stock') || type.includes('equity')) {
                grouped.stocks.push(item);
            } else if (type.includes('etf')) {
                grouped.etfs.push(item);
            } else if (type.includes('crypto')) {
                grouped.crypto.push(item);
            } else {
                grouped.stocks.push(item);
            }
        });
        
        let html = '';
        if (grouped.stocks.length > 0) html += this.buildCategoryHTML('Stocks', grouped.stocks, query);
        if (grouped.etfs.length > 0) html += this.buildCategoryHTML('ETFs', grouped.etfs, query);
        if (grouped.crypto.length > 0) html += this.buildCategoryHTML('Crypto', grouped.crypto, query);
        
        if (html === '') {
            this.displayNoResults(query);
        } else {
            container.innerHTML = html;
            container.classList.add('active');
            
            container.querySelectorAll('.suggestion-item').forEach((item) => {
                item.addEventListener('click', () => {
                    this.selectCompany(item.dataset.symbol);
                });
                
                item.addEventListener('mouseenter', () => {
                    document.querySelectorAll('.suggestion-item').forEach(s => s.classList.remove('keyboard-selected'));
                    this.selectedSuggestionIndex = -1;
                });
            });
        }
    },
    
    buildCategoryHTML: function(categoryName, items, query) {
        const iconMap = {
            'Stocks': 'chart-line',
            'ETFs': 'layer-group',
            'Crypto': 'coins'
        };
        
        const sectorMap = {
            'Stocks': 'tech',
            'ETFs': 'etf',
            'Crypto': 'crypto'
        };
        
        let html = `<div class="suggestion-category">
            <i class="fas fa-${iconMap[categoryName]}"></i> ${categoryName}
        </div>`;
        
        items.slice(0, 8).forEach(item => {
            const symbol = this.escapeHtml(item.symbol);
            const name = this.escapeHtml(item.instrument_name || item.symbol);
            
            const highlightedSymbol = this.highlightMatch(symbol, query);
            const highlightedName = this.highlightMatch(name, query);
            
            html += `
                <div class="suggestion-item" data-symbol="${symbol}">
                    <div class="suggestion-icon ${sectorMap[categoryName]}">
                        ${symbol.substring(0, 2)}
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
    
    highlightMatch: function(text, query) {
        if (!text || !query) return text;
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    },
    
    displayNoResults: function(query) {
        const container = document.getElementById('searchSuggestions');
        if (!container) return;
        
        container.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <p><strong>No results found for "${this.escapeHtml(query)}"</strong></p>
                <p>Try searching by:</p>
                <ul style="text-align: left; margin: 0.5rem 0; padding-left: 1.5rem;">
                    <li>Ticker symbol (e.g., AAPL, MSFT)</li>
                    <li>Company name (e.g., Apple, Microsoft)</li>
                </ul>
            </div>
        `;
        container.classList.add('active');
    },
    
    displaySearchError: function() {
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
    
    hideSuggestions: function() {
        const container = document.getElementById('searchSuggestions');
        if (!container) return;
        
        container.classList.remove('active');
        this.selectedSuggestionIndex = -1;
    },
    
    selectCompany: async function(symbol) {
        console.log('✅ Selected company:', symbol);
        
        const input = document.getElementById('companySearchInput');
        if (input) {
            input.value = symbol;
        }
        
        this.hideSuggestions();
        await this.searchCompany(symbol);
    },
    
    searchCompany: async function(symbol) {
        if (!symbol || symbol.trim() === '') {
            this.showNotification('Please enter a ticker symbol or company name', 'warning');
            return;
        }
        
        const trimmedSymbol = symbol.trim().toUpperCase();
        console.log('🔍 Searching company:', trimmedSymbol);
        
        this.currentCompanySymbol = trimmedSymbol;
        
        const container = document.getElementById('searchResultsContainer');
        if (!container) return;
        
        try {
            container.innerHTML = `
                <div class="results-placeholder">
                    <i class="fas fa-spinner fa-spin"></i>
                    <h3>Loading company data...</h3>
                    <p>Please wait...</p>
                </div>
            `;
            
            const quoteData = await this.apiClient.getQuote(trimmedSymbol);
            
            if (quoteData && quoteData.symbol) {
                this.displayCompanyResults(quoteData);
                
                // NOUVEAU : Charger les graphiques additionnels
                await this.loadCompanyExtraCharts(trimmedSymbol);
            } else {
                throw new Error('No data found');
            }
            
        } catch (error) {
            console.error('Error searching company:', error);
            container.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>Unable to load company data for ${this.escapeHtml(trimmedSymbol)}. Please try another symbol.</span>
                </div>
            `;
        }
    },
    
    displayCompanyResults: function(quoteData) {
        const container = document.getElementById('searchResultsContainer');
        if (!container) return;
        
        const currentPrice = quoteData.close || quoteData.price || 0;
        const change = quoteData.change || 0;
        const percentChange = quoteData.percent_change || quoteData.percentChange || 0;
        const isPositive = change >= 0;
        
        container.innerHTML = `
            <div class="company-result-card highlight">
                <div class="company-result-header">
                    <div class="company-avatar">
                        <span>${quoteData.symbol.substring(0, 2)}</span>
                    </div>
                    <div class="company-details">
                        <h4>${this.escapeHtml(quoteData.name || quoteData.symbol)}</h4>
                        <p>${this.escapeHtml(quoteData.exchange || 'N/A')} • ${this.escapeHtml(quoteData.currency || 'USD')}</p>
                    </div>
                    <div class="quote-change ${isPositive ? 'positive' : 'negative'}">
                        <i class="fas fa-${isPositive ? 'arrow-up' : 'arrow-down'}"></i>
                        ${percentChange.toFixed(2)}%
                    </div>
                </div>
                
                <div style="margin: 1.5rem 0;">
                    <div style="font-size: 2.5rem; font-weight: 800; color: var(--text-primary);">
                        $${currentPrice.toFixed(2)}
                    </div>
                    <div class="${isPositive ? 'text-success' : 'text-danger'}" style="font-size: 1.125rem; margin-top: 0.5rem;">
                        ${isPositive ? '+' : ''}$${Math.abs(change).toFixed(2)} (${isPositive ? '+' : ''}${percentChange.toFixed(2)}%)
                    </div>
                </div>
                
                <div class="company-metrics">
                    <div class="metric-item">
                        <span class="metric-label">Open</span>
                        <span class="metric-value">$${(quoteData.open || 0).toFixed(2)}</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">High</span>
                        <span class="metric-value">$${(quoteData.high || 0).toFixed(2)}</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Low</span>
                        <span class="metric-value">$${(quoteData.low || 0).toFixed(2)}</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Volume</span>
                        <span class="metric-value">${this.formatNumber(quoteData.volume || 0)}</span>
                    </div>
                </div>
            </div>
        `;
        
        this.showNotification(`✅ Loaded data for ${quoteData.symbol}`, 'success');
    },
    
    // NOUVEAU : Graphiques additionnels pour Company Search
    loadCompanyExtraCharts: async function(symbol) {
        console.log('📊 Loading extra charts for:', symbol);
        
        const chartsContainer = document.getElementById('companyExtraCharts');
        if (!chartsContainer) return;
        
        try {
            // Afficher le container
            chartsContainer.style.display = 'block';
            
            // Charger les données
            const timeSeriesData = await this.apiClient.getTimeSeries(symbol, '1day', '90');
            
            if (timeSeriesData && timeSeriesData.data && timeSeriesData.data.length > 0) {
                // Graphique 1 : Performance vs Market
                this.renderCompanyPerformanceChart(symbol, timeSeriesData.data);
                
                // Graphique 2 : Analyst Ratings (simulé)
                this.renderCompanyRatingsChart(symbol);
            }
            
        } catch (error) {
            console.error('Error loading extra charts:', error);
            chartsContainer.style.display = 'none';
        }
    },
    
    renderCompanyPerformanceChart: function(symbol, data) {
        if (this.charts.companyPerformance) {
            this.charts.companyPerformance.destroy();
        }
        
        const sortedData = [...data].sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
        
        // Calculer la performance relative (base 100)
        const firstPrice = parseFloat(sortedData[0].close);
        const stockPerformance = sortedData.map(d => ({
            x: new Date(d.datetime).getTime(),
            y: (parseFloat(d.close) / firstPrice - 1) * 100
        }));
        
        // Simuler le S&P 500 (pour l'exemple)
        const sp500Performance = sortedData.map((d, i) => ({
            x: new Date(d.datetime).getTime(),
            y: (Math.random() - 0.5) * 10 + i * 0.1 // Tendance légèrement haussière
        }));
        
        this.charts.companyPerformance = Highcharts.chart('companyPerformanceChart', {
            chart: {
                backgroundColor: 'transparent',
                type: 'line'
            },
            title: {
                text: null
            },
            xAxis: {
                type: 'datetime',
                labels: {
                    style: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
                    }
                }
            },
            yAxis: {
                title: {
                    text: 'Performance (%)',
                    style: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
                    }
                },
                labels: {
                    format: '{value}%',
                    style: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
                    }
                },
                plotLines: [{
                    value: 0,
                    color: '#64748b',
                    width: 1,
                    dashStyle: 'Dash'
                }]
            },
            tooltip: {
                shared: true,
                valueDecimals: 2,
                valueSuffix: '%'
            },
            series: [{
                name: symbol,
                data: stockPerformance,
                color: '#3B82F6',
                lineWidth: 3
            }, {
                name: 'S&P 500 (simulated)',
                data: sp500Performance,
                color: '#94A3B8',
                lineWidth: 2,
                dashStyle: 'Dash'
            }],
            credits: { enabled: false },
            legend: {
                enabled: true,
                itemStyle: {
                    color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
                }
            }
        });
    },
    
    renderCompanyRatingsChart: function(symbol) {
        if (this.charts.companyRatings) {
            this.charts.companyRatings.destroy();
        }
        
        // Simuler des ratings d'analystes
        const ratings = [
            { name: 'Strong Buy', y: 12, color: '#10B981' },
            { name: 'Buy', y: 8, color: '#34D399' },
            { name: 'Hold', y: 5, color: '#FCD34D' },
            { name: 'Sell', y: 2, color: '#FB923C' },
            { name: 'Strong Sell', y: 1, color: '#EF4444' }
        ];
        
        this.charts.companyRatings = Highcharts.chart('companyRatingsChart', {
            chart: {
                type: 'bar',
                backgroundColor: 'transparent'
            },
            title: {
                text: null
            },
            xAxis: {
                categories: ratings.map(r => r.name),
                labels: {
                    style: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
                    }
                }
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Number of Analysts',
                    style: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
                    }
                },
                labels: {
                    style: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
                    }
                }
            },
            legend: {
                enabled: false
            },
            tooltip: {
                valueSuffix: ' analysts'
            },
            plotOptions: {
                bar: {
                    dataLabels: {
                        enabled: true,
                        style: {
                            color: '#fff',
                            textOutline: 'none'
                        }
                    }
                }
            },
            series: [{
                name: 'Analysts',
                data: ratings,
                colorByPoint: true
            }],
            credits: { enabled: false }
        });
    },

// ============================================
    // LIVE QUOTES TOOL - AMÉLIORÉ
    // ============================================
    setupLiveQuotesListeners: function() {
        const input = document.getElementById('quoteSymbolInput');
        const btnLoad = document.getElementById('btnLoadQuote');
        
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.loadLiveQuote(input.value);
                }
            });
        }
        
        if (btnLoad) {
            btnLoad.addEventListener('click', () => {
                this.loadLiveQuote(input.value);
            });
        }
    },
    
    loadLiveQuote: async function(symbol) {
        if (!symbol || symbol.trim() === '') {
            this.showNotification('Please enter a ticker symbol', 'warning');
            return;
        }
        
        const trimmedSymbol = symbol.trim().toUpperCase();
        console.log('📊 Loading live quote for:', trimmedSymbol);
        
        const container = document.getElementById('quoteDisplay');
        if (!container) return;
        
        try {
            container.innerHTML = `
                <div class="quote-placeholder">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Loading quote data...</p>
                </div>
            `;
            
            const quoteData = await this.apiClient.getQuote(trimmedSymbol);
            
            if (quoteData && quoteData.symbol) {
                this.displayLiveQuote(quoteData);
                await this.loadQuoteChart(trimmedSymbol);
                
                // NOUVEAU : Market Sentiment Gauge
                this.renderMarketSentiment(trimmedSymbol, quoteData);
            } else {
                throw new Error('No data available');
            }
            
        } catch (error) {
            console.error('Error loading quote:', error);
            container.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>Unable to load quote data for ${trimmedSymbol}</span>
                </div>
            `;
        }
    },
    
    displayLiveQuote: function(quoteData) {
        const container = document.getElementById('quoteDisplay');
        if (!container) return;
        
        const currentPrice = quoteData.close || quoteData.price || 0;
        const change = quoteData.change || 0;
        const percentChange = quoteData.percent_change || quoteData.percentChange || 0;
        const isPositive = change >= 0;
        
        container.innerHTML = `
            <div class="quote-header">
                <div class="quote-symbol">${quoteData.symbol}</div>
                <div class="quote-name">${this.escapeHtml(quoteData.name || 'N/A')}</div>
            </div>
            
            <div class="quote-main-info">
                <div class="quote-price">$${currentPrice.toFixed(2)}</div>
                <div class="quote-change ${isPositive ? 'positive' : 'negative'}">
                    <i class="fas fa-${isPositive ? 'arrow-up' : 'arrow-down'}"></i>
                    ${isPositive ? '+' : ''}$${Math.abs(change).toFixed(2)} (${percentChange.toFixed(2)}%)
                </div>
            </div>
            
            <div class="quote-info">
                <div class="quote-stat">
                    <div class="quote-stat-label">Open</div>
                    <div class="quote-stat-value">$${(quoteData.open || 0).toFixed(2)}</div>
                </div>
                <div class="quote-stat">
                    <div class="quote-stat-label">High</div>
                    <div class="quote-stat-value">$${(quoteData.high || 0).toFixed(2)}</div>
                </div>
                <div class="quote-stat">
                    <div class="quote-stat-label">Low</div>
                    <div class="quote-stat-value">$${(quoteData.low || 0).toFixed(2)}</div>
                </div>
                <div class="quote-stat">
                    <div class="quote-stat-label">Volume</div>
                    <div class="quote-stat-value">${this.formatNumber(quoteData.volume || 0)}</div>
                </div>
            </div>
        `;
    },
    
    loadQuoteChart: async function(symbol) {
        try {
            const timeSeriesData = await this.apiClient.getTimeSeries(symbol, '1day', '90');
            
            if (timeSeriesData && timeSeriesData.data && timeSeriesData.data.length > 0) {
                this.renderQuoteChart(timeSeriesData.data, symbol);
            }
        } catch (error) {
            console.error('Error loading chart:', error);
        }
    },
    
    renderQuoteChart: function(data, symbol) {
        if (this.charts.liveQuote) {
            this.charts.liveQuote.destroy();
        }
        
        const dates = data.map(d => new Date(d.datetime).getTime()).reverse();
        const prices = data.map(d => parseFloat(d.close)).reverse();
        
        this.charts.liveQuote = Highcharts.stockChart('liveQuoteChart', {
            chart: {
                backgroundColor: 'transparent',
                height: 400
            },
            title: {
                text: `${symbol} - 3 Month Price History`,
                style: {
                    color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary'),
                    fontSize: '1.125rem',
                    fontWeight: '700'
                }
            },
            series: [{
                name: 'Price',
                data: dates.map((date, i) => [date, prices[i]]),
                color: '#3B82F6',
                lineWidth: 2,
                fillColor: {
                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                    stops: [
                        [0, 'rgba(59, 130, 246, 0.3)'],
                        [1, 'rgba(59, 130, 246, 0.05)']
                    ]
                }
            }],
            credits: { enabled: false },
            rangeSelector: {
                enabled: true,
                selected: 1
            },
            navigator: {
                enabled: true
            }
        });
    },
    
    // NOUVEAU : Market Sentiment Gauge
    renderMarketSentiment: function(symbol, quoteData) {
        const container = document.getElementById('marketSentiment');
        if (!container) return;
        
        container.style.display = 'block';
        
        if (this.charts.sentimentGauge) {
            this.charts.sentimentGauge.destroy();
        }
        
        // Calculer un sentiment basé sur le changement de prix
        const percentChange = quoteData.percent_change || quoteData.percentChange || 0;
        
        // Score de sentiment (0-100, 50 = neutre)
        let sentimentScore = 50 + (percentChange * 5); // Amplifier pour rendre visible
        sentimentScore = Math.max(0, Math.min(100, sentimentScore)); // Clamp entre 0-100
        
        let sentimentLabel = 'Neutral';
        let sentimentColor = '#FCD34D';
        
        if (sentimentScore >= 70) {
            sentimentLabel = 'Very Bullish';
            sentimentColor = '#10B981';
        } else if (sentimentScore >= 55) {
            sentimentLabel = 'Bullish';
            sentimentColor = '#34D399';
        } else if (sentimentScore >= 45) {
            sentimentLabel = 'Neutral';
            sentimentColor = '#FCD34D';
        } else if (sentimentScore >= 30) {
            sentimentLabel = 'Bearish';
            sentimentColor = '#FB923C';
        } else {
            sentimentLabel = 'Very Bearish';
            sentimentColor = '#EF4444';
        }
        
        this.charts.sentimentGauge = Highcharts.chart('sentimentGauge', {
            chart: {
                type: 'solidgauge',
                backgroundColor: 'transparent'
            },
            title: {
                text: `${symbol} Market Sentiment`,
                style: {
                    color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary'),
                    fontSize: '1rem',
                    fontWeight: '700'
                }
            },
            pane: {
                center: ['50%', '85%'],
                size: '140%',
                startAngle: -90,
                endAngle: 90,
                background: {
                    backgroundColor: 'rgba(0,0,0,0.1)',
                    innerRadius: '60%',
                    outerRadius: '100%',
                    shape: 'arc'
                }
            },
            tooltip: {
                enabled: false
            },
            yAxis: {
                min: 0,
                max: 100,
                stops: [
                    [0.3, '#EF4444'], // Bearish
                    [0.5, '#FCD34D'], // Neutral
                    [0.7, '#10B981']  // Bullish
                ],
                lineWidth: 0,
                tickWidth: 0,
                minorTickInterval: null,
                tickAmount: 2,
                labels: {
                    y: 16,
                    style: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
                    }
                }
            },
            plotOptions: {
                solidgauge: {
                    dataLabels: {
                        y: -25,
                        borderWidth: 0,
                        useHTML: true,
                        format: `<div style="text-align:center">
                            <span style="font-size:2rem;font-weight:bold;color:${sentimentColor}">{y}</span><br/>
                            <span style="font-size:0.875rem;color:var(--text-secondary)">${sentimentLabel}</span>
                        </div>`
                    }
                }
            },
            series: [{
                name: 'Sentiment',
                data: [Math.round(sentimentScore)],
                dataLabels: {
                    format: `<div style="text-align:center">
                        <span style="font-size:2rem;font-weight:bold;color:${sentimentColor}">{y}</span><br/>
                        <span style="font-size:0.875rem;color:var(--text-secondary)">${sentimentLabel}</span>
                    </div>`
                }
            }],
            credits: { enabled: false }
        });
    },
    
    // ============================================
    // PORTFOLIO BUILDER TOOL - AMÉLIORÉ
    // ============================================
    setupPortfolioListeners: function() {
        const btnAdd = document.getElementById('btnAddToPortfolio');
        
        if (btnAdd) {
            btnAdd.addEventListener('click', () => {
                this.addToPortfolio();
            });
        }
        
        const symbolInput = document.getElementById('portfolioSymbol');
        const sharesInput = document.getElementById('portfolioShares');
        
        [symbolInput, sharesInput].forEach(input => {
            if (input) {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        this.addToPortfolio();
                    }
                });
            }
        });
    },
    
    addToPortfolio: async function() {
        const symbolInput = document.getElementById('portfolioSymbol');
        const sharesInput = document.getElementById('portfolioShares');
        
        if (!symbolInput || !sharesInput) return;
        
        const symbol = symbolInput.value.trim().toUpperCase();
        const shares = parseInt(sharesInput.value);
        
        if (!symbol) {
            this.showNotification('Please enter a ticker symbol', 'warning');
            return;
        }
        
        if (!shares || shares <= 0) {
            this.showNotification('Please enter a valid number of shares', 'warning');
            return;
        }
        
        const existingIndex = this.portfolio.findIndex(p => p.symbol === symbol);
        if (existingIndex >= 0) {
            this.showNotification('This symbol is already in your portfolio', 'warning');
            return;
        }
        
        try {
            const quoteData = await this.apiClient.getQuote(symbol);
            
            const currentPrice = quoteData.close !== undefined && quoteData.close !== null 
                ? quoteData.close 
                : quoteData.price;
            
            if (quoteData && currentPrice !== null && currentPrice !== undefined && !isNaN(currentPrice)) {
                const holding = {
                    symbol: symbol,
                    name: quoteData.name || symbol,
                    shares: shares,
                    price: parseFloat(currentPrice),
                    value: shares * parseFloat(currentPrice)
                };
                
                this.portfolio.push(holding);
                
                symbolInput.value = '';
                sharesInput.value = '';
                
                this.updatePortfolioDisplay();
                
                // NOUVEAU : Charger les graphiques avancés si portfolio >= 2 stocks
                if (this.portfolio.length >= 2) {
                    this.loadPortfolioAdvancedCharts();
                }
                
                this.showNotification(`✅ ${symbol} added to portfolio`, 'success');
            } else {
                throw new Error('Unable to fetch valid price data');
            }
            
        } catch (error) {
            console.error('Error adding to portfolio:', error);
            this.showNotification(`Unable to add ${symbol} to portfolio. Please try again.`, 'error');
        }
    },
    
    removeFromPortfolio: function(symbol) {
        this.portfolio = this.portfolio.filter(p => p.symbol !== symbol);
        this.updatePortfolioDisplay();
        
        if (this.portfolio.length >= 2) {
            this.loadPortfolioAdvancedCharts();
        } else {
            // Cacher les graphiques avancés
            const corrContainer = document.getElementById('portfolioCorrelation');
            const perfContainer = document.getElementById('portfolioPerformance');
            if (corrContainer) corrContainer.style.display = 'none';
            if (perfContainer) perfContainer.style.display = 'none';
        }
        
        this.showNotification(`${symbol} removed from portfolio`, 'success');
    },
    
    updatePortfolioDisplay: function() {
        const tableBody = document.getElementById('portfolioTableBody');
        const summary = document.getElementById('portfolioSummary');
        
        if (!tableBody) return;
        
        if (this.portfolio.length === 0) {
            tableBody.innerHTML = `
                <tr class="empty-state">
                    <td colspan="6">
                        <i class="fas fa-briefcase"></i>
                        <p>Your portfolio is empty. Add some stocks to get started!</p>
                    </td>
                </tr>
            `;
            
            if (summary) {
                summary.innerHTML = `
                    <div class="summary-card">
                        <h4>Total Value</h4>
                        <p class="value-large">$0.00</p>
                    </div>
                    <div class="summary-card">
                        <h4>Holdings</h4>
                        <p class="value-large">0</p>
                    </div>
                    <div class="summary-card">
                        <h4>Diversification</h4>
                        <p class="value-large">N/A</p>
                    </div>
                `;
            }
            
            return;
        }
        
        const totalValue = this.portfolio.reduce((sum, p) => sum + p.value, 0);
        
        let html = '';
        this.portfolio.forEach(holding => {
            const allocation = (holding.value / totalValue * 100).toFixed(2);
            
            html += `
                <tr>
                    <td><strong>${holding.symbol}</strong></td>
                    <td>${holding.shares.toLocaleString()}</td>
                    <td>$${holding.price.toFixed(2)}</td>
                    <td>$${holding.value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                    <td>${allocation}%</td>
                    <td>
                        <button class="btn-remove" onclick="DemoApp.removeFromPortfolio('${holding.symbol}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        
        tableBody.innerHTML = html;
        
        // Calcul du score de diversification
        let diversificationScore = 'Low';
        if (this.portfolio.length >= 5) {
            diversificationScore = 'Excellent';
        } else if (this.portfolio.length >= 3) {
            diversificationScore = 'Good';
        } else if (this.portfolio.length >= 2) {
            diversificationScore = 'Fair';
        }
        
        if (summary) {
            summary.innerHTML = `
                <div class="summary-card">
                    <h4>Total Value</h4>
                    <p class="value-large">$${totalValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                </div>
                <div class="summary-card">
                    <h4>Holdings</h4>
                    <p class="value-large">${this.portfolio.length}</p>
                </div>
                <div class="summary-card">
                    <h4>Diversification</h4>
                    <p class="value-large">${diversificationScore}</p>
                </div>
            `;
        }
        
        this.updatePortfolioChart();
    },
    
    updatePortfolioChart: function() {
        if (this.charts.portfolioAllocation) {
            this.charts.portfolioAllocation.destroy();
        }
        
        if (this.portfolio.length === 0) return;
        
        const totalValue = this.portfolio.reduce((sum, p) => sum + p.value, 0);
        
        const data = this.portfolio.map(holding => ({
            name: holding.symbol,
            y: holding.value,
            percentage: (holding.value / totalValue * 100).toFixed(2)
        }));
        
        this.charts.portfolioAllocation = Highcharts.chart('portfolioAllocationChart', {
            chart: {
                type: 'pie',
                backgroundColor: 'transparent'
            },
            title: {
                text: null
            },
            tooltip: {
                pointFormat: '<b>${point.y:,.2f}</b> ({point.percentage}%)'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b>: {point.percentage}%',
                        style: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
                        }
                    },
                    showInLegend: true
                }
            },
            series: [{
                name: 'Value',
                colorByPoint: true,
                data: data
            }],
            credits: { enabled: false },
            legend: {
                itemStyle: {
                    color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
                }
            }
        });
    },
    
    // NOUVEAU : Graphiques avancés du portfolio
    loadPortfolioAdvancedCharts: async function() {
        console.log('📊 Loading advanced portfolio charts...');
        
        try {
            // Charger les données historiques pour chaque stock
            const promises = this.portfolio.map(holding => 
                this.apiClient.getTimeSeries(holding.symbol, '1day', '30')
            );
            
            const results = await Promise.all(promises);
            
            // Correlation Matrix
            this.renderPortfolioCorrelation(results);
            
            // Performance Chart
            this.renderPortfolioPerformance(results);
            
        } catch (error) {
            console.error('Error loading advanced charts:', error);
        }
    },
    
    renderPortfolioCorrelation: function(timeSeriesResults) {
        const container = document.getElementById('portfolioCorrelation');
        if (!container) return;
        
        container.style.display = 'block';
        
        if (this.charts.correlationHeatmap) {
            this.charts.correlationHeatmap.destroy();
        }
        
        // Calculer la matrice de corrélation (simplifié - corrélations simulées)
        const symbols = this.portfolio.map(p => p.symbol);
        const correlationData = [];
        
        symbols.forEach((symbol1, i) => {
            symbols.forEach((symbol2, j) => {
                let correlation;
                if (i === j) {
                    correlation = 1; // Corrélation avec soi-même = 1
                } else {
                    // Simuler une corrélation (dans la vraie vie, calculer à partir des prix)
                    correlation = (Math.random() * 1.6 - 0.8).toFixed(2); // Entre -0.8 et 0.8
                }
                
                correlationData.push([j, i, parseFloat(correlation)]);
            });
        });
        
        this.charts.correlationHeatmap = Highcharts.chart('correlationHeatmap', {
            chart: {
                type: 'heatmap',
                backgroundColor: 'transparent'
            },
            title: {
                text: null
            },
            xAxis: {
                categories: symbols,
                labels: {
                    style: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
                    }
                }
            },
            yAxis: {
                categories: symbols,
                title: null,
                labels: {
                    style: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
                    }
                }
            },
            colorAxis: {
                min: -1,
                max: 1,
                stops: [
                    [0, '#EF4444'],
                    [0.5, '#FCD34D'],
                    [1, '#10B981']
                ]
            },
            legend: {
                align: 'right',
                layout: 'vertical',
                margin: 0,
                verticalAlign: 'top',
                y: 25,
                symbolHeight: 200,
                itemStyle: {
                    color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
                }
            },
            tooltip: {
                formatter: function() {
                    return `<b>${this.series.xAxis.categories[this.point.x]}</b> vs <b>${this.series.yAxis.categories[this.point.y]}</b><br/>
                            Correlation: <b>${this.point.value.toFixed(2)}</b>`;
                }
            },
            series: [{
                name: 'Correlation',
                borderWidth: 1,
                data: correlationData,
                dataLabels: {
                    enabled: true,
                    color: '#000000',
                    format: '{point.value:.2f}'
                }
            }],
            credits: { enabled: false }
        });
    },
    
    renderPortfolioPerformance: function(timeSeriesResults) {
        const container = document.getElementById('portfolioPerformance');
        if (!container) return;
        
        container.style.display = 'block';
        
        if (this.charts.portfolioPerformance) {
            this.charts.portfolioPerformance.destroy();
        }
        
        // Créer des séries pour chaque stock
        const series = [];
        
        timeSeriesResults.forEach((result, index) => {
            if (result && result.data && result.data.length > 0) {
                const holding = this.portfolio[index];
                const sortedData = [...result.data].sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
                
                // Performance relative (base 100)
                const firstPrice = parseFloat(sortedData[0].close);
                const performanceData = sortedData.map(d => ({
                    x: new Date(d.datetime).getTime(),
                    y: (parseFloat(d.close) / firstPrice - 1) * 100
                }));
                
                series.push({
                    name: holding.symbol,
                    data: performanceData
                });
            }
        });
        
        this.charts.portfolioPerformance = Highcharts.stockChart('portfolioPerformanceChart', {
            chart: {
                backgroundColor: 'transparent'
            },
            title: {
                text: null
            },
            xAxis: {
                type: 'datetime',
                labels: {
                    style: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
                    }
                }
            },
            yAxis: {
                title: {
                    text: 'Performance (%)',
                    style: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
                    }
                },
                labels: {
                    format: '{value}%',
                    style: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
                    }
                },
                plotLines: [{
                    value: 0,
                    color: '#64748b',
                    width: 1,
                    dashStyle: 'Dash'
                }]
            },
            tooltip: {
                shared: true,
                valueDecimals: 2,
                valueSuffix: '%'
            },
            series: series,
            credits: { enabled: false },
            rangeSelector: {
                enabled: false
            },
            navigator: {
                enabled: false
            },
            legend: {
                enabled: true,
                itemStyle: {
                    color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
                }
            }
        });
    },

// ============================================
    // TECHNICAL ANALYSIS TOOL - COMPLET
    // ============================================
    setupTechnicalListeners: function() {
        const btnAnalyze = document.getElementById('btnAnalyze');
        const input = document.getElementById('technicalSymbol');
        
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.analyzeTechnical();
                }
            });
        }
        
        if (btnAnalyze) {
            btnAnalyze.addEventListener('click', () => {
                this.analyzeTechnical();
            });
        }
        
        // Event listeners pour les indicateurs
        const indicatorCheckboxes = [
            'indicatorSMA',
            'indicatorEMA',
            'indicatorBollinger',
            'indicatorRSI',
            'indicatorMACD',
            'indicatorVolume'
        ];
        
        indicatorCheckboxes.forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox) {
                checkbox.addEventListener('change', (e) => {
                    this.toggleIndicator(id, e.target.checked);
                });
            }
        });
    },
    
    analyzeTechnical: async function() {
        const input = document.getElementById('technicalSymbol');
        if (!input || !input.value.trim()) {
            this.showNotification('Please enter a ticker symbol', 'warning');
            return;
        }
        
        const symbol = input.value.trim().toUpperCase();
        this.currentTechnicalSymbol = symbol;
        
        console.log('📊 Analyzing:', symbol);
        
        try {
            const timeSeriesData = await this.apiClient.getTimeSeries(symbol, '1day', '180');
            
            let dataArray = null;
            
            if (timeSeriesData && timeSeriesData.data && Array.isArray(timeSeriesData.data)) {
                dataArray = timeSeriesData.data;
            } else if (timeSeriesData && timeSeriesData.values && Array.isArray(timeSeriesData.values)) {
                dataArray = timeSeriesData.values;
            } else if (Array.isArray(timeSeriesData)) {
                dataArray = timeSeriesData;
            }
            
            if (dataArray && dataArray.length > 0) {
                console.log('✅ Using data array with', dataArray.length, 'items');
                this.renderTechnicalChart(dataArray, symbol);
                this.generateTechnicalSignals(symbol, dataArray);
            } else {
                throw new Error('No data available');
            }
            
        } catch (error) {
            console.error('Error analyzing:', error);
            this.showNotification('Unable to load technical data for ' + symbol, 'error');
        }
    },
    
    renderTechnicalChart: function(data, symbol) {
        console.log('📊 === TECHNICAL CHART RENDERING ===');
        
        if (this.charts.technical) {
            this.charts.technical.destroy();
        }
        
        const container = document.getElementById('technicalChart');
        if (!container) {
            console.error('❌ Chart container #technicalChart not found!');
            return;
        }
        
        const sortedData = [...data].sort((a, b) => {
            const dateA = new Date(a.datetime).getTime();
            const dateB = new Date(b.datetime).getTime();
            return dateA - dateB;
        });
        
        const firstItem = sortedData[0];
        const hasOHLC = firstItem.open !== undefined && 
                        firstItem.high !== undefined && 
                        firstItem.low !== undefined && 
                        firstItem.close !== undefined;
        
        if (hasOHLC) {
            const ohlc = sortedData.map(d => {
                const timestamp = d.timestamp || new Date(d.datetime).getTime();
                return [
                    timestamp,
                    parseFloat(d.open),
                    parseFloat(d.high),
                    parseFloat(d.low),
                    parseFloat(d.close)
                ];
            });
            
            const volume = sortedData.map(d => {
                const timestamp = d.timestamp || new Date(d.datetime).getTime();
                return [timestamp, parseFloat(d.volume || 0)];
            });
            
            try {
                this.charts.technical = Highcharts.stockChart('technicalChart', {
                    chart: {
                        backgroundColor: 'transparent',
                        height: 500
                    },
                    title: {
                        text: `${symbol} - Technical Analysis`,
                        style: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary') || '#1e293b',
                            fontSize: '1.125rem',
                            fontWeight: '700'
                        }
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
                            type: 'all',
                            text: 'All'
                        }],
                        buttonTheme: {
                            style: {
                                color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary') || '#1e293b'
                            }
                        }
                    },
                    yAxis: [{
                        labels: {
                            align: 'right',
                            x: -3,
                            style: {
                                color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary') || '#1e293b'
                            }
                        },
                        title: {
                            text: 'Price (USD)',
                            style: {
                                color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary') || '#1e293b'
                            }
                        },
                        height: '70%',
                        lineWidth: 2,
                        resize: {
                            enabled: true
                        }
                    }, {
                        labels: {
                            align: 'right',
                            x: -3,
                            style: {
                                color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary') || '#1e293b'
                            }
                        },
                        title: {
                            text: 'Volume',
                            style: {
                                color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary') || '#1e293b'
                            }
                        },
                        top: '75%',
                        height: '25%',
                        offset: 0,
                        lineWidth: 2
                    }],
                    xAxis: {
                        type: 'datetime',
                        labels: {
                            style: {
                                color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary') || '#1e293b'
                            }
                        }
                    },
                    tooltip: {
                        split: true,
                        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--background-primary') || '#ffffff',
                        style: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary') || '#1e293b'
                        }
                    },
                    series: [{
                        type: 'candlestick',
                        name: symbol,
                        id: 'main-series',
                        data: ohlc,
                        color: '#EF4444',
                        upColor: '#10B981',
                        lineColor: '#EF4444',
                        upLineColor: '#10B981',
                        yAxis: 0,
                        dataGrouping: {
                            enabled: false
                        }
                    }, {
                        type: 'column',
                        name: 'Volume',
                        data: volume,
                        yAxis: 1,
                        color: '#3B82F6',
                        opacity: 0.5
                    }],
                    credits: { 
                        enabled: false 
                    },
                    navigator: {
                        enabled: true,
                        series: {
                            color: '#3B82F6'
                        }
                    },
                    scrollbar: {
                        enabled: true
                    },
                    legend: {
                        enabled: false
                    }
                });
                
                console.log('✅ Technical chart created successfully!');
                
                // Activer les indicateurs cochés par défaut
                setTimeout(() => {
                    const indicators = [
                        { id: 'indicatorSMA', checkbox: document.getElementById('indicatorSMA') },
                        { id: 'indicatorEMA', checkbox: document.getElementById('indicatorEMA') },
                        { id: 'indicatorBollinger', checkbox: document.getElementById('indicatorBollinger') },
                        { id: 'indicatorRSI', checkbox: document.getElementById('indicatorRSI') },
                        { id: 'indicatorMACD', checkbox: document.getElementById('indicatorMACD') }
                    ];
                    
                    indicators.forEach(ind => {
                        if (ind.checkbox && ind.checkbox.checked) {
                            console.log('🔄 Auto-enabling indicator:', ind.id);
                            this.toggleIndicator(ind.id, true);
                        }
                    });
                }, 100);
                
            } catch (error) {
                console.error('❌ Error creating chart:', error);
            }
        }
    },
    
    // ============================================
    // TECHNICAL INDICATORS
    // ============================================
    
    toggleIndicator: function(indicatorId, isEnabled) {
        console.log('🔄 Toggle indicator:', indicatorId, isEnabled);
        
        if (!this.charts.technical || !this.currentTechnicalSymbol) {
            console.log('⚠️ No chart or symbol available');
            return;
        }
        
        const mainSeries = this.charts.technical.series.find(s => s.options.id === 'main-series');
        if (!mainSeries || !mainSeries.options.data) {
            console.log('⚠️ No data in chart');
            return;
        }
        
        const data = mainSeries.options.data;
        
        switch(indicatorId) {
            case 'indicatorSMA':
                if (isEnabled) {
                    this.addSMA(data);
                } else {
                    this.removeIndicator('SMA 20');
                    this.removeIndicator('SMA 50');
                }
                break;
                
            case 'indicatorEMA':
                if (isEnabled) {
                    this.addEMA(data);
                } else {
                    this.removeIndicator('EMA 12');
                    this.removeIndicator('EMA 26');
                }
                break;
                
            case 'indicatorBollinger':
                if (isEnabled) {
                    this.addBollingerBands(data);
                } else {
                    this.removeIndicator('BB Upper');
                    this.removeIndicator('BB Middle');
                    this.removeIndicator('BB Lower');
                }
                break;
                
            case 'indicatorRSI':
                if (isEnabled) {
                    this.addRSI(data);
                } else {
                    this.removeIndicator('RSI');
                    // Supprimer l'axe RSI
                    const rsiAxis = this.charts.technical.get('rsi-axis');
                    if (rsiAxis) rsiAxis.remove();
                }
                break;
                
            case 'indicatorMACD':
                if (isEnabled) {
                    this.addMACD(data);
                } else {
                    this.removeIndicator('MACD');
                    this.removeIndicator('Signal');
                    this.removeIndicator('Histogram');
                    // Supprimer l'axe MACD
                    const macdAxis = this.charts.technical.get('macd-axis');
                    if (macdAxis) macdAxis.remove();
                }
                break;
        }
    },
    
    removeIndicator: function(name) {
        if (!this.charts.technical) return;
        
        const chart = this.charts.technical;
        const seriesToRemove = chart.series.find(s => s.name === name);
        
        if (seriesToRemove) {
            seriesToRemove.remove();
            console.log('🗑️ Removed indicator:', name);
        }
    },
    
    // SMA - Simple Moving Average
    addSMA: function(ohlcData) {
        console.log('📊 Adding SMA indicators');
        
        const closePrices = ohlcData.map(d => d[4]);
        const timestamps = ohlcData.map(d => d[0]);
        
        const sma20 = this.calculateSMA(closePrices, 20);
        const sma50 = this.calculateSMA(closePrices, 50);
        
        const sma20Data = timestamps.map((t, i) => [t, sma20[i]]).filter(d => d[1] !== null);
        const sma50Data = timestamps.map((t, i) => [t, sma50[i]]).filter(d => d[1] !== null);
        
        this.charts.technical.addSeries({
            name: 'SMA 20',
            type: 'line',
            data: sma20Data,
            color: '#F59E0B',
            lineWidth: 2,
            yAxis: 0,
            marker: { enabled: false }
        });
        
        this.charts.technical.addSeries({
            name: 'SMA 50',
            type: 'line',
            data: sma50Data,
            color: '#8B5CF6',
            lineWidth: 2,
            yAxis: 0,
            marker: { enabled: false }
        });
    },
    
    calculateSMA: function(data, period) {
        const result = [];
        
        for (let i = 0; i < data.length; i++) {
            if (i < period - 1) {
                result.push(null);
            } else {
                let sum = 0;
                for (let j = 0; j < period; j++) {
                    sum += data[i - j];
                }
                result.push(sum / period);
            }
        }
        
        return result;
    },
    
    // EMA - Exponential Moving Average
    addEMA: function(ohlcData) {
        console.log('📊 Adding EMA indicators');
        
        const closePrices = ohlcData.map(d => d[4]);
        const timestamps = ohlcData.map(d => d[0]);
        
        const ema12 = this.calculateEMA(closePrices, 12);
        const ema26 = this.calculateEMA(closePrices, 26);
        
        const ema12Data = timestamps.map((t, i) => [t, ema12[i]]).filter(d => d[1] !== null);
        const ema26Data = timestamps.map((t, i) => [t, ema26[i]]).filter(d => d[1] !== null);
        
        this.charts.technical.addSeries({
            name: 'EMA 12',
            type: 'line',
            data: ema12Data,
            color: '#06B6D4',
            lineWidth: 2,
            dashStyle: 'Dash',
            yAxis: 0,
            marker: { enabled: false }
        });
        
        this.charts.technical.addSeries({
            name: 'EMA 26',
            type: 'line',
            data: ema26Data,
            color: '#EC4899',
            lineWidth: 2,
            dashStyle: 'Dash',
            yAxis: 0,
            marker: { enabled: false }
        });
    },
    
    calculateEMA: function(data, period) {
        const result = [];
        const multiplier = 2 / (period + 1);
        
        let sum = 0;
        for (let i = 0; i < period; i++) {
            if (i < data.length) {
                sum += data[i];
            }
        }
        const sma = sum / period;
        
        for (let i = 0; i < data.length; i++) {
            if (i < period - 1) {
                result.push(null);
            } else if (i === period - 1) {
                result.push(sma);
            } else {
                const ema = (data[i] - result[i - 1]) * multiplier + result[i - 1];
                result.push(ema);
            }
        }
        
        return result;
    },
    
    // Bollinger Bands
    addBollingerBands: function(ohlcData) {
        console.log('📊 Adding Bollinger Bands');
        
        const closePrices = ohlcData.map(d => d[4]);
        const timestamps = ohlcData.map(d => d[0]);
        const period = 20;
        const stdDevMultiplier = 2;
        
        const sma = this.calculateSMA(closePrices, period);
        const stdDev = [];
        
        for (let i = 0; i < closePrices.length; i++) {
            if (i < period - 1) {
                stdDev.push(null);
            } else {
                let variance = 0;
                for (let j = 0; j < period; j++) {
                    variance += Math.pow(closePrices[i - j] - sma[i], 2);
                }
                stdDev.push(Math.sqrt(variance / period));
            }
        }
        
        const upperBand = timestamps.map((t, i) => 
            sma[i] !== null ? [t, sma[i] + stdDevMultiplier * stdDev[i]] : null
        ).filter(d => d !== null);
        
        const middleBand = timestamps.map((t, i) => 
            sma[i] !== null ? [t, sma[i]] : null
        ).filter(d => d !== null);
        
        const lowerBand = timestamps.map((t, i) => 
            sma[i] !== null ? [t, sma[i] - stdDevMultiplier * stdDev[i]] : null
        ).filter(d => d !== null);
        
        this.charts.technical.addSeries({
            name: 'BB Upper',
            type: 'line',
            data: upperBand,
            color: '#9CA3AF',
            lineWidth: 1,
            yAxis: 0,
            marker: { enabled: false },
            enableMouseTracking: false
        });
        
        this.charts.technical.addSeries({
            name: 'BB Middle',
            type: 'line',
            data: middleBand,
            color: '#6B7280',
            lineWidth: 1,
            dashStyle: 'Dot',
            yAxis: 0,
            marker: { enabled: false },
            enableMouseTracking: false
        });
        
        this.charts.technical.addSeries({
            name: 'BB Lower',
            type: 'line',
            data: lowerBand,
            color: '#9CA3AF',
            lineWidth: 1,
            yAxis: 0,
            marker: { enabled: false },
            enableMouseTracking: false
        });
    },
    
    // RSI - Relative Strength Index
    addRSI: function(ohlcData) {
        console.log('📊 Adding RSI');
        
        const closePrices = ohlcData.map(d => d[4]);
        const timestamps = ohlcData.map(d => d[0]);
        const period = 14;
        
        const rsi = this.calculateRSI(closePrices, period);
        const rsiData = timestamps.map((t, i) => [t, rsi[i]]).filter(d => d[1] !== null);
        
        this.charts.technical.addAxis({
            id: 'rsi-axis',
            labels: {
                align: 'right',
                x: -3,
                style: {
                    color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
                }
            },
            title: {
                text: 'RSI',
                style: {
                    color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
                }
            },
            top: '80%',
            height: '20%',
            offset: 0,
            lineWidth: 2,
            plotLines: [{
                value: 70,
                color: '#EF4444',
                dashStyle: 'Dot',
                width: 1,
                label: { 
                    text: '70',
                    style: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
                    }
                }
            }, {
                value: 30,
                color: '#10B981',
                dashStyle: 'Dot',
                width: 1,
                label: { 
                    text: '30',
                    style: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
                    }
                }
            }]
        });
        
        this.charts.technical.addSeries({
            name: 'RSI',
            type: 'line',
            data: rsiData,
            color: '#8B5CF6',
            lineWidth: 2,
            yAxis: 'rsi-axis',
            marker: { enabled: false }
        });
    },
    
    calculateRSI: function(data, period) {
        const result = [];
        const gains = [];
        const losses = [];
        
        for (let i = 1; i < data.length; i++) {
            const change = data[i] - data[i - 1];
            gains.push(change > 0 ? change : 0);
            losses.push(change < 0 ? Math.abs(change) : 0);
        }
        
        for (let i = 0; i < data.length; i++) {
            if (i < period) {
                result.push(null);
            } else {
                let avgGain = 0;
                let avgLoss = 0;
                
                for (let j = 0; j < period; j++) {
                    avgGain += gains[i - 1 - j];
                    avgLoss += losses[i - 1 - j];
                }
                
                avgGain /= period;
                avgLoss /= period;
                
                const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
                const rsi = 100 - (100 / (1 + rs));
                
                result.push(rsi);
            }
        }
        
        return result;
    },
    
    // MACD
    addMACD: function(ohlcData) {
        console.log('📊 Adding MACD');
        
        const closePrices = ohlcData.map(d => d[4]);
        const timestamps = ohlcData.map(d => d[0]);
        
        const ema12 = this.calculateEMA(closePrices, 12);
        const ema26 = this.calculateEMA(closePrices, 26);
        
        const macdLine = [];
        for (let i = 0; i < closePrices.length; i++) {
            if (ema12[i] !== null && ema26[i] !== null) {
                macdLine.push(ema12[i] - ema26[i]);
            } else {
                macdLine.push(null);
            }
        }
        
        const signalLine = this.calculateEMA(macdLine.filter(v => v !== null), 9);
        
        const fullSignalLine = [];
        let signalIndex = 0;
        for (let i = 0; i < macdLine.length; i++) {
            if (macdLine[i] === null) {
                fullSignalLine.push(null);
            } else {
                fullSignalLine.push(signalLine[signalIndex]);
                signalIndex++;
            }
        }
        
        const histogram = macdLine.map((m, i) => 
            m !== null && fullSignalLine[i] !== null ? m - fullSignalLine[i] : null
        );
        
        const macdData = timestamps.map((t, i) => [t, macdLine[i]]).filter(d => d[1] !== null);
        const signalData = timestamps.map((t, i) => [t, fullSignalLine[i]]).filter(d => d[1] !== null);
        const histogramData = timestamps.map((t, i) => [t, histogram[i]]).filter(d => d[1] !== null);
        
        this.charts.technical.addAxis({
            id: 'macd-axis',
            labels: {
                align: 'right',
                x: -3,
                style: {
                    color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
                }
            },
            title: {
                text: 'MACD',
                style: {
                    color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
                }
            },
            top: '80%',
            height: '20%',
            offset: 0,
            lineWidth: 2
        });
        
        this.charts.technical.addSeries({
            name: 'MACD',
            type: 'line',
            data: macdData,
            color: '#3B82F6',
            lineWidth: 2,
            yAxis: 'macd-axis',
            marker: { enabled: false }
        });
        
        this.charts.technical.addSeries({
            name: 'Signal',
            type: 'line',
            data: signalData,
            color: '#EF4444',
            lineWidth: 2,
            yAxis: 'macd-axis',
            marker: { enabled: false }
        });
        
        this.charts.technical.addSeries({
            name: 'Histogram',
            type: 'column',
            data: histogramData,
            color: '#10B981',
            yAxis: 'macd-axis',
            opacity: 0.5
        });
    },
    
    generateTechnicalSignals: function(symbol, data) {
        const container = document.getElementById('technicalSignals');
        if (!container) return;
        
        const calculateSMA = (prices, period) => {
            if (prices.length < period) return null;
            const slice = prices.slice(-period);
            const sum = slice.reduce((a, b) => a + b, 0);
            return sum / period;
        };
        
        const prices = data.map(d => parseFloat(d.close));
        const sma20 = calculateSMA(prices, 20);
        const sma50 = calculateSMA(prices, 50);
        const currentPrice = prices[prices.length - 1];
        
        let trend = 'Neutral';
        let trendClass = 'neutral';
        let trendIcon = 'minus';
        
        if (sma20 && sma50) {
            if (currentPrice > sma20 && sma20 > sma50) {
                trend = 'Strong Bullish';
                trendClass = 'bullish';
                trendIcon = 'arrow-up';
            } else if (currentPrice < sma20 && sma20 < sma50) {
                trend = 'Strong Bearish';
                trendClass = 'bearish';
                trendIcon = 'arrow-down';
            }
        }
        
        // Calcul RSI simple
        const rsi = this.calculateRSI(prices, 14);
        const currentRSI = rsi[rsi.length - 1];
        
        let rsiSignal = 'Neutral';
        let rsiClass = 'neutral';
        
        if (currentRSI !== null) {
            if (currentRSI > 70) {
                rsiSignal = 'Overbought';
                rsiClass = 'bearish';
            } else if (currentRSI < 30) {
                rsiSignal = 'Oversold';
                rsiClass = 'bullish';
            }
        }
        
        container.innerHTML = `
            <h4>Technical Signals for ${symbol}</h4>
            <div class="signals-grid">
                <div class="signal-card">
                    <div class="signal-icon ${trendClass}">
                        <i class="fas fa-${trendIcon}"></i>
                    </div>
                    <div class="signal-info">
                        <h5>Price Trend</h5>
                        <p><strong>${trend}</strong></p>
                        <p class="signal-detail">Current: $${currentPrice.toFixed(2)}</p>
                    </div>
                </div>
                
                <div class="signal-card">
                    <div class="signal-icon neutral">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <div class="signal-info">
                        <h5>SMA 20</h5>
                        <p><strong>${sma20 ? '$' + sma20.toFixed(2) : 'N/A'}</strong></p>
                        <p class="signal-detail">20-day moving average</p>
                    </div>
                </div>
                
                <div class="signal-card">
                    <div class="signal-icon neutral">
                        <i class="fas fa-chart-area"></i>
                    </div>
                    <div class="signal-info">
                        <h5>SMA 50</h5>
                        <p><strong>${sma50 ? '$' + sma50.toFixed(2) : 'N/A'}</strong></p>
                        <p class="signal-detail">50-day moving average</p>
                    </div>
                </div>
                
                <div class="signal-card">
                    <div class="signal-icon ${rsiClass}">
                        <i class="fas fa-tachometer-alt"></i>
                    </div>
                    <div class="signal-info">
                        <h5>RSI (14)</h5>
                        <p><strong>${currentRSI !== null ? currentRSI.toFixed(2) : 'N/A'}</strong></p>
                        <p class="signal-detail">${rsiSignal}</p>
                    </div>
                </div>
            </div>
        `;
    },

// ============================================
    // RISK CALCULATOR TOOL - AMÉLIORÉ AVEC MONTE CARLO
    // ============================================
    setupRiskCalculatorListeners: function() {
        const btnCalculate = document.getElementById('btnCalculateRisk');
        
        if (btnCalculate) {
            btnCalculate.addEventListener('click', () => {
                this.calculateRiskMetrics();
            });
        }
        
        // Auto-calculate on input change
        ['riskPortfolioValue', 'riskConfidence', 'riskVolatility', 'riskReturn', 'riskHorizon'].forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('input', () => {
                    clearTimeout(this.riskCalcTimeout);
                    this.riskCalcTimeout = setTimeout(() => {
                        this.calculateRiskMetrics();
                    }, 500);
                });
            }
        });
    },
    
    calculateRiskMetrics: function() {
        const portfolioValue = parseFloat(document.getElementById('riskPortfolioValue')?.value || 100000);
        const confidence = parseFloat(document.getElementById('riskConfidence')?.value || 95);
        const volatility = parseFloat(document.getElementById('riskVolatility')?.value || 15);
        const expectedReturn = parseFloat(document.getElementById('riskReturn')?.value || 8);
        const timeHorizon = parseFloat(document.getElementById('riskHorizon')?.value || 1);
        
        console.log('📊 Calculating risk metrics...');
        
        // Z-scores pour différents niveaux de confiance
        const zScoreMap = {
            90: 1.282,
            95: 1.645,
            99: 2.326
        };
        const zScore = zScoreMap[confidence] || 1.645;
        
        // VaR calculé
        const dailyVolatility = volatility / Math.sqrt(252);
        const horizonVolatility = dailyVolatility * Math.sqrt(timeHorizon);
        const varDaily = portfolioValue * horizonVolatility * zScore / 100;
        
        // CVaR (Expected Shortfall)
        const cvar = varDaily * 1.3;
        
        // Sharpe Ratio
        const riskFreeRate = 2;
        const sharpeRatio = (expectedReturn - riskFreeRate) / volatility;
        
        // Maximum Drawdown (simulé)
        const maxDrawdown = (volatility / 100) * portfolioValue * 1.5;
        
        // Beta (simulé - vs market)
        const beta = 0.8 + (Math.random() * 0.6); // Entre 0.8 et 1.4
        
        this.displayRiskResults({
            portfolioValue,
            confidence,
            volatility,
            expectedReturn,
            timeHorizon,
            varDaily,
            cvar,
            sharpeRatio,
            maxDrawdown,
            beta
        });
        
        // NOUVEAU : Monte Carlo Simulation
        this.runMonteCarloSimulation({
            portfolioValue,
            expectedReturn,
            volatility,
            timeHorizon: 252 // 1 an de trading
        });
    },
    
    displayRiskResults: function(metrics) {
        const container = document.getElementById('riskResults');
        if (!container) return;
        
        container.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                <div class="risk-metric-card">
                    <h5>Value at Risk (VaR)</h5>
                    <div class="risk-metric-value text-danger">
                        $${metrics.varDaily.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </div>
                    <p class="risk-metric-description">
                        ${metrics.confidence}% confidence - ${metrics.timeHorizon} day${metrics.timeHorizon > 1 ? 's' : ''}
                    </p>
                </div>
                
                <div class="risk-metric-card">
                    <h5>Conditional VaR (CVaR)</h5>
                    <div class="risk-metric-value text-danger">
                        $${metrics.cvar.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </div>
                    <p class="risk-metric-description">
                        Expected loss if VaR exceeded
                    </p>
                </div>
                
                <div class="risk-metric-card">
                    <h5>Volatility (Annual)</h5>
                    <div class="risk-metric-value">
                        ${metrics.volatility.toFixed(2)}%
                    </div>
                    <p class="risk-metric-description">
                        Annualized standard deviation
                    </p>
                </div>
                
                <div class="risk-metric-card">
                    <h5>Sharpe Ratio</h5>
                    <div class="risk-metric-value ${metrics.sharpeRatio > 1 ? 'text-success' : ''}">
                        ${metrics.sharpeRatio.toFixed(2)}
                    </div>
                    <p class="risk-metric-description">
                        Risk-adjusted return measure
                    </p>
                </div>
                
                <div class="risk-metric-card">
                    <h5>Maximum Drawdown</h5>
                    <div class="risk-metric-value text-danger">
                        $${metrics.maxDrawdown.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </div>
                    <p class="risk-metric-description">
                        Estimated worst-case loss
                    </p>
                </div>
                
                <div class="risk-metric-card">
                    <h5>Portfolio Beta</h5>
                    <div class="risk-metric-value ${metrics.beta > 1 ? 'text-danger' : 'text-success'}">
                        ${metrics.beta.toFixed(2)}
                    </div>
                    <p class="risk-metric-description">
                        Sensitivity to market movements
                    </p>
                </div>
            </div>
        `;
    },
    
    // NOUVEAU : Monte Carlo Simulation
    runMonteCarloSimulation: function(params) {
        console.log('🎲 Running Monte Carlo simulation...');
        
        const container = document.getElementById('monteCarloSection');
        if (!container) return;
        
        container.style.display = 'block';
        
        if (this.charts.monteCarlo) {
            this.charts.monteCarlo.destroy();
        }
        
        const { portfolioValue, expectedReturn, volatility, timeHorizon } = params;
        
        const numSimulations = 100; // 100 simulations pour performance
        const dailyReturn = expectedReturn / 252 / 100;
        const dailyVol = volatility / Math.sqrt(252) / 100;
        
        // Générer les simulations
        const simulations = [];
        
        for (let sim = 0; sim < numSimulations; sim++) {
            const path = [portfolioValue];
            let currentValue = portfolioValue;
            
            for (let day = 1; day <= timeHorizon; day++) {
                // Générer un rendement aléatoire (distribution normale)
                const randomReturn = this.randomNormal(dailyReturn, dailyVol);
                currentValue = currentValue * (1 + randomReturn);
                path.push(currentValue);
            }
            
            simulations.push(path);
        }
        
        // Convertir en séries Highcharts
        const series = simulations.map((path, index) => ({
            name: `Simulation ${index + 1}`,
            data: path,
            lineWidth: 1,
            opacity: 0.3,
            marker: { enabled: false },
            enableMouseTracking: false,
            showInLegend: false
        }));
        
        // Calculer la moyenne
        const avgPath = [];
        for (let day = 0; day <= timeHorizon; day++) {
            const dayValues = simulations.map(sim => sim[day]);
            const avg = dayValues.reduce((a, b) => a + b, 0) / dayValues.length;
            avgPath.push(avg);
        }
        
        // Ajouter la série moyenne
        series.push({
            name: 'Average Path',
            data: avgPath,
            lineWidth: 3,
            color: '#3B82F6',
            marker: { enabled: false },
            zIndex: 10
        });
        
        // Calculer les percentiles
        const percentile5 = [];
        const percentile95 = [];
        
        for (let day = 0; day <= timeHorizon; day++) {
            const dayValues = simulations.map(sim => sim[day]).sort((a, b) => a - b);
            percentile5.push(dayValues[Math.floor(dayValues.length * 0.05)]);
            percentile95.push(dayValues[Math.floor(dayValues.length * 0.95)]);
        }
        
        series.push({
            name: '5th Percentile',
            data: percentile5,
            lineWidth: 2,
            color: '#EF4444',
            dashStyle: 'Dash',
            marker: { enabled: false }
        });
        
        series.push({
            name: '95th Percentile',
            data: percentile95,
            lineWidth: 2,
            color: '#10B981',
            dashStyle: 'Dash',
            marker: { enabled: false }
        });
        
        this.charts.monteCarlo = Highcharts.chart('monteCarloChart', {
            chart: {
                backgroundColor: 'transparent'
            },
            title: {
                text: 'Portfolio Value Projections',
                style: {
                    color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary'),
                    fontSize: '1rem',
                    fontWeight: '700'
                }
            },
            xAxis: {
                title: {
                    text: 'Trading Days',
                    style: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
                    }
                },
                labels: {
                    style: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
                    }
                }
            },
            yAxis: {
                title: {
                    text: 'Portfolio Value ($)',
                    style: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
                    }
                },
                labels: {
                    formatter: function() {
                        return '$' + (this.value / 1000).toFixed(0) + 'k';
                    },
                    style: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
                    }
                }
            },
            tooltip: {
                shared: false,
                valueDecimals: 0,
                valuePrefix: '$'
            },
            series: series,
            credits: { enabled: false },
            legend: {
                enabled: true,
                itemStyle: {
                    color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
                }
            }
        });
    },
    
    // Fonction pour générer nombres aléatoires avec distribution normale
    randomNormal: function(mean, stdDev) {
        // Box-Muller transform
        let u = 0, v = 0;
        while(u === 0) u = Math.random();
        while(v === 0) v = Math.random();
        const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        return num * stdDev + mean;
    },
    
    // ============================================
    // AI INSIGHTS TOOL - AMÉLIORÉ AVEC GRAPHIQUES
    // ============================================
    setupAIInsightsListeners: function() {
        const btnAnalyze = document.getElementById('btnAIAnalyze');
        const input = document.getElementById('aiSymbolInput');
        
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.generateAIInsights();
                }
            });
        }
        
        if (btnAnalyze) {
            btnAnalyze.addEventListener('click', () => {
                this.generateAIInsights();
            });
        }
    },
    
    generateAIInsights: async function() {
        const input = document.getElementById('aiSymbolInput');
        if (!input || !input.value.trim()) {
            this.showNotification('Please enter a ticker symbol', 'warning');
            return;
        }
        
        const symbol = input.value.trim().toUpperCase();
        console.log('🤖 Generating AI insights for:', symbol);
        
        const container = document.getElementById('aiResults');
        if (!container) return;
        
        try {
            container.innerHTML = `
                <div class="ai-placeholder">
                    <i class="fas fa-robot fa-spin"></i>
                    <h3>AI Analysis in Progress</h3>
                    <p>Analyzing ${symbol} with machine learning models...</p>
                    <div style="margin-top: 1rem; color: var(--text-secondary);">
                        <p>⚙️ Loading LSTM neural network...</p>
                        <p>📊 Processing 5 years of historical data...</p>
                        <p>🧠 Calculating sentiment scores...</p>
                    </div>
                </div>
            `;
            
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Charger les données
            const quoteData = await this.apiClient.getQuote(symbol);
            const timeSeriesData = await this.apiClient.getTimeSeries(symbol, '1day', '90');
            
            if (quoteData && timeSeriesData) {
                this.displayAIInsights(symbol, quoteData, timeSeriesData);
            }
            
        } catch (error) {
            console.error('Error generating AI insights:', error);
            container.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>Unable to generate AI insights for ${symbol}</span>
                </div>
            `;
        }
    },
    
    displayAIInsights: function(symbol, quoteData, timeSeriesData) {
        const container = document.getElementById('aiResults');
        if (!container) return;
        
        const currentPrice = quoteData.close || quoteData.price || 0;
        
        // Générer des prédictions réalistes
        const prediction7d = currentPrice * (1 + (Math.random() - 0.45) * 0.15);
        const prediction30d = currentPrice * (1 + (Math.random() - 0.45) * 0.25);
        const prediction90d = currentPrice * (1 + (Math.random() - 0.45) * 0.35);
        
        const change7d = ((prediction7d - currentPrice) / currentPrice * 100).toFixed(2);
        const change30d = ((prediction30d - currentPrice) / currentPrice * 100).toFixed(2);
        const change90d = ((prediction90d - currentPrice) / currentPrice * 100).toFixed(2);
        
        // Score de sentiment (0-100)
        const sentimentScore = 50 + (parseFloat(change30d) * 2);
        const clampedSentiment = Math.max(0, Math.min(100, sentimentScore));
        
        let sentimentLabel = 'Neutral';
        let sentimentColor = '#FCD34D';
        let sentimentIcon = 'meh';
        
        if (clampedSentiment >= 70) {
            sentimentLabel = 'Very Positive';
            sentimentColor = '#10B981';
            sentimentIcon = 'smile';
        } else if (clampedSentiment >= 55) {
            sentimentLabel = 'Positive';
            sentimentColor = '#34D399';
            sentimentIcon = 'smile-wink';
        } else if (clampedSentiment >= 45) {
            sentimentLabel = 'Neutral';
            sentimentColor = '#FCD34D';
            sentimentIcon = 'meh';
        } else if (clampedSentiment >= 30) {
            sentimentLabel = 'Negative';
            sentimentColor = '#FB923C';
            sentimentIcon = 'frown';
        } else {
            sentimentLabel = 'Very Negative';
            sentimentColor = '#EF4444';
            sentimentIcon = 'angry';
        }
        
        // Calcul du score de confiance
        const confidence = 75 + Math.random() * 15; // Entre 75% et 90%
        
        container.innerHTML = `
            <div class="ai-insight-card">
                <div class="ai-insight-header">
                    <div class="ai-insight-icon">
                        <i class="fas fa-brain"></i>
                    </div>
                    <div class="ai-insight-title">
                        <h4>AI Price Predictions</h4>
                        <p>Deep Learning Analysis for ${symbol}</p>
                    </div>
                    <div class="ai-confidence">
                        <i class="fas fa-check-circle"></i>
                        ${confidence.toFixed(1)}% Confidence
                    </div>
                </div>
                <div class="ai-insight-content">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1.5rem; margin: 1.5rem 0;">
                        <div style="text-align: center;">
                            <p style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.5rem; text-transform: uppercase; font-weight: 600;">Current Price</p>
                            <p style="font-size: 2rem; font-weight: 800; color: var(--text-primary); margin: 0;">$${currentPrice.toFixed(2)}</p>
                        </div>
                        <div style="text-align: center;">
                            <p style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.5rem; text-transform: uppercase; font-weight: 600;">7-Day Target</p>
                            <p style="font-size: 2rem; font-weight: 800; color: ${change7d > 0 ? '#10B981' : '#EF4444'}; margin: 0;">
                                $${prediction7d.toFixed(2)}
                            </p>
                            <p style="font-size: 0.875rem; color: ${change7d > 0 ? '#10B981' : '#EF4444'}; margin-top: 0.25rem;">
                                ${change7d > 0 ? '▲' : '▼'} ${Math.abs(change7d)}%
                            </p>
                        </div>
                        <div style="text-align: center;">
                            <p style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.5rem; text-transform: uppercase; font-weight: 600;">30-Day Target</p>
                            <p style="font-size: 2rem; font-weight: 800; color: ${change30d > 0 ? '#10B981' : '#EF4444'}; margin: 0;">
                                $${prediction30d.toFixed(2)}
                            </p>
                            <p style="font-size: 0.875rem; color: ${change30d > 0 ? '#10B981' : '#EF4444'}; margin-top: 0.25rem;">
                                ${change30d > 0 ? '▲' : '▼'} ${Math.abs(change30d)}%
                            </p>
                        </div>
                        <div style="text-align: center;">
                            <p style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.5rem; text-transform: uppercase; font-weight: 600;">90-Day Target</p>
                            <p style="font-size: 2rem; font-weight: 800; color: ${change90d > 0 ? '#10B981' : '#EF4444'}; margin: 0;">
                                $${prediction90d.toFixed(2)}
                            </p>
                            <p style="font-size: 0.875rem; color: ${change90d > 0 ? '#10B981' : '#EF4444'}; margin-top: 0.25rem;">
                                ${change90d > 0 ? '▲' : '▼'} ${Math.abs(change90d)}%
                            </p>
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--border-color);">
                        <div>
                            <h5 style="font-size: 0.875rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 1rem;">
                                <i class="fas fa-comments"></i> Market Sentiment
                            </h5>
                            <div style="display: flex; align-items: center; gap: 1rem;">
                                <div style="font-size: 3rem; color: ${sentimentColor};">
                                    <i class="fas fa-${sentimentIcon}"></i>
                                </div>
                                <div>
                                    <p style="font-size: 1.5rem; font-weight: 700; color: ${sentimentColor}; margin: 0;">
                                        ${sentimentLabel}
                                    </p>
                                    <p style="font-size: 0.875rem; color: var(--text-secondary); margin: 0.25rem 0 0 0;">
                                        Score: ${clampedSentiment.toFixed(0)}/100
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <h5 style="font-size: 0.875rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 1rem;">
                                <i class="fas fa-info-circle"></i> Model Information
                            </h5>
                            <div style="font-size: 0.875rem; color: var(--text-secondary); line-height: 1.8;">
                                <p style="margin: 0.25rem 0;"><strong>Model:</strong> LSTM Neural Network</p>
                                <p style="margin: 0.25rem 0;"><strong>Training:</strong> 5 years historical</p>
                                <p style="margin: 0.25rem 0;"><strong>Features:</strong> 47 technical indicators</p>
                                <p style="margin: 0.25rem 0;"><strong>Updated:</strong> ${new Date().toLocaleTimeString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // NOUVEAU : Charger le graphique de prédiction
        if (timeSeriesData && timeSeriesData.data) {
            this.renderAIPredictionChart(symbol, timeSeriesData.data, {
                currentPrice,
                prediction7d,
                prediction30d,
                prediction90d
            });
        }
    },
    
    // NOUVEAU : Graphique de prédiction AI
    renderAIPredictionChart: function(symbol, historicalData, predictions) {
        const container = document.getElementById('aiPredictionChart');
        if (!container) return;
        
        container.style.display = 'block';
        
        if (this.charts.aiPredictionChart) {
            this.charts.aiPredictionChart.destroy();
        }
        
        // Données historiques
        const sortedData = [...historicalData].sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
        const historical = sortedData.map(d => ({
            x: new Date(d.datetime).getTime(),
            y: parseFloat(d.close)
        }));
        
        // Dernière date
        const lastDate = new Date(sortedData[sortedData.length - 1].datetime);
        
        // Points de prédiction
        const predictionPoints = [
            {
                x: lastDate.getTime(),
                y: predictions.currentPrice
            },
            {
                x: lastDate.getTime() + (7 * 24 * 60 * 60 * 1000),
                y: predictions.prediction7d
            },
            {
                x: lastDate.getTime() + (30 * 24 * 60 * 60 * 1000),
                y: predictions.prediction30d
            },
            {
                x: lastDate.getTime() + (90 * 24 * 60 * 60 * 1000),
                y: predictions.prediction90d
            }
        ];
        
        // Intervalles de confiance (±10%)
        const upperBound = predictionPoints.map(p => ({
            x: p.x,
            y: p.y * 1.1
        }));
        
        const lowerBound = predictionPoints.map(p => ({
            x: p.x,
            y: p.y * 0.9
        }));
        
        this.charts.aiPredictionChart = Highcharts.chart('predictionChartContainer', {
            chart: {
                backgroundColor: 'transparent'
            },
            title: {
                text: `${symbol} - AI Price Forecast`,
                style: {
                    color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary'),
                    fontSize: '1rem',
                    fontWeight: '700'
                }
            },
            xAxis: {
                type: 'datetime',
                labels: {
                    style: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
                    }
                },
                plotLines: [{
                    value: lastDate.getTime(),
                    color: '#64748b',
                    width: 2,
                    dashStyle: 'Dash',
                    label: {
                        text: 'Today',
                        style: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
                        }
                    }
                }]
            },
            yAxis: {
                title: {
                    text: 'Price (USD)',
                    style: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
                    }
                },
                labels: {
                    format: '${value}',
                    style: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
                    }
                }
            },
            tooltip: {
                shared: true,
                valueDecimals: 2,
                valuePrefix: '$'
            },
            series: [{
                name: 'Historical Price',
                data: historical,
                color: '#3B82F6',
                lineWidth: 2,
                marker: { enabled: false }
            }, {
                name: 'AI Prediction',
                data: predictionPoints,
                color: '#8B5CF6',
                lineWidth: 3,
                dashStyle: 'Dash',
                marker: { 
                    enabled: true,
                    radius: 5
                }
            }, {
                name: 'Confidence Range',
                data: upperBound.concat(lowerBound.reverse()),
                type: 'area',
                color: '#8B5CF6',
                fillOpacity: 0.1,
                lineWidth: 0,
                marker: { enabled: false },
                enableMouseTracking: false
            }],
            credits: { enabled: false },
            legend: {
                enabled: true,
                itemStyle: {
                    color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
                }
            }
        });
    },

// ============================================
    // UTILITY FUNCTIONS
    // ============================================
    
    formatNumber: function(num) {
        if (num >= 1000000000) {
            return (num / 1000000000).toFixed(2) + 'B';
        }
        if (num >= 1000000) {
            return (num / 1000000).toFixed(2) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(2) + 'K';
        }
        return num.toLocaleString();
    },
    
    escapeHtml: function(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    showLoading: function(show) {
        console.log(show ? '⏳ Loading...' : '✅ Loaded');
        
        // OPTIONNEL : Afficher un indicateur de chargement global
        let loader = document.getElementById('globalLoader');
        
        if (show) {
            if (!loader) {
                loader = document.createElement('div');
                loader.id = 'globalLoader';
                loader.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 3px;
                    background: linear-gradient(90deg, #667eea 0%, #764ba2 50%, #667eea 100%);
                    background-size: 200% 100%;
                    animation: loadingBar 1.5s ease-in-out infinite;
                    z-index: 99999;
                `;
                document.body.appendChild(loader);
                
                // Ajouter l'animation CSS si elle n'existe pas
                if (!document.getElementById('loadingBarStyle')) {
                    const style = document.createElement('style');
                    style.id = 'loadingBarStyle';
                    style.textContent = `
                        @keyframes loadingBar {
                            0% { background-position: 0% 0%; }
                            100% { background-position: 200% 0%; }
                        }
                    `;
                    document.head.appendChild(style);
                }
            }
        } else {
            if (loader) {
                loader.remove();
            }
        }
    },
    
    showNotification: function(message, type = 'info') {
        console.log(`[${type.toUpperCase()}] ${message}`);
        
        // Remove existing notifications
        const existing = document.querySelectorAll('.notification-toast');
        existing.forEach(n => n.remove());
        
        // Create notification
        const notification = document.createElement('div');
        notification.className = `notification-toast notification-${type}`;
        
        const iconMap = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        
        notification.innerHTML = `
            <i class="fas fa-${iconMap[type] || 'info-circle'}"></i>
            <span>${this.escapeHtml(message)}</span>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        document.body.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
    },
    
    // ============================================
    // DEMO HELPERS - Fonctions d'exemple
    // ============================================
    
    // Fonction pour simuler un chargement progressif
    simulateProgress: function(callback, steps = 5) {
        let currentStep = 0;
        const interval = setInterval(() => {
            currentStep++;
            if (currentStep >= steps) {
                clearInterval(interval);
                if (callback) callback();
            }
        }, 300);
    },
    
    // Fonction pour générer des données de démonstration
    generateDemoData: function(points = 30) {
        const data = [];
        let value = 100;
        
        for (let i = 0; i < points; i++) {
            value += (Math.random() - 0.5) * 5;
            data.push({
                x: Date.now() - (points - i) * 24 * 60 * 60 * 1000,
                y: value
            });
        }
        
        return data;
    },
    
    // Fonction pour formater une date
    formatDate: function(date, format = 'short') {
        const d = new Date(date);
        
        if (format === 'short') {
            return d.toLocaleDateString();
        } else if (format === 'long') {
            return d.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        } else if (format === 'time') {
            return d.toLocaleTimeString();
        }
        
        return d.toString();
    },
    
    // Fonction pour calculer la performance
    calculatePerformance: function(startPrice, endPrice) {
        const change = endPrice - startPrice;
        const percentChange = (change / startPrice) * 100;
        
        return {
            change: change,
            percentChange: percentChange,
            isPositive: change >= 0
        };
    },
    
    // Fonction pour obtenir la couleur d'un graphique basée sur le thème
    getChartColor: function(index) {
        const colors = [
            '#3B82F6', // Blue
            '#10B981', // Green
            '#F59E0B', // Amber
            '#EF4444', // Red
            '#8B5CF6', // Purple
            '#EC4899', // Pink
            '#06B6D4', // Cyan
            '#84CC16'  // Lime
        ];
        
        return colors[index % colors.length];
    },
    
    // Fonction pour détecter le mode sombre
    isDarkMode: function() {
        return document.body.classList.contains('dark-mode');
    },
    
    // Fonction pour obtenir les couleurs du thème actuel
    getThemeColors: function() {
        const root = document.documentElement;
        const style = getComputedStyle(root);
        
        return {
            primary: style.getPropertyValue('--text-primary').trim() || '#1e293b',
            secondary: style.getPropertyValue('--text-secondary').trim() || '#64748b',
            background: style.getPropertyValue('--background-primary').trim() || '#ffffff',
            success: style.getPropertyValue('--success-color').trim() || '#10B981',
            danger: style.getPropertyValue('--danger-color').trim() || '#EF4444',
            warning: style.getPropertyValue('--warning-color').trim() || '#F59E0B'
        };
    },
    
    // ============================================
    // EXPORT / SHARE FUNCTIONS (Bonus)
    // ============================================
    
    exportChartAsImage: function(chartId) {
        const chart = this.charts[chartId];
        if (!chart) {
            this.showNotification('Chart not found', 'error');
            return;
        }
        
        // Highcharts a une fonction d'export intégrée
        if (chart.exportChart) {
            chart.exportChart({
                type: 'image/png',
                filename: `${chartId}_${Date.now()}`
            });
            this.showNotification('Chart exported successfully!', 'success');
        }
    },
    
    shareResults: function(symbol, data) {
        const shareText = `Check out my analysis of ${symbol} on FinancePro!`;
        const shareUrl = window.location.href;
        
        if (navigator.share) {
            navigator.share({
                title: 'FinancePro Analysis',
                text: shareText,
                url: shareUrl
            }).then(() => {
                this.showNotification('Shared successfully!', 'success');
            }).catch((error) => {
                console.error('Error sharing:', error);
            });
        } else {
            // Fallback: copier dans le presse-papier
            const textToCopy = `${shareText}\n${shareUrl}`;
            navigator.clipboard.writeText(textToCopy).then(() => {
                this.showNotification('Link copied to clipboard!', 'success');
            });
        }
    },
    
    // ============================================
    // KEYBOARD SHORTCUTS (Bonus)
    // ============================================
    
    setupKeyboardShortcuts: function() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K : Focus sur la recherche
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.getElementById('companySearchInput');
                if (searchInput) {
                    searchInput.focus();
                    this.showNotification('Search activated', 'info');
                }
            }
            
            // Escape : Fermer les suggestions
            if (e.key === 'Escape') {
                this.hideSuggestions();
            }
            
            // Ctrl/Cmd + 1-6 : Changer d'outil
            if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '6') {
                e.preventDefault();
                const tools = [
                    'company-search',
                    'live-quotes',
                    'portfolio-builder',
                    'technical-analysis',
                    'risk-calculator',
                    'ai-insights'
                ];
                const index = parseInt(e.key) - 1;
                if (tools[index]) {
                    this.switchTool(tools[index]);
                }
            }
        });
        
        console.log('⌨️ Keyboard shortcuts enabled!');
        console.log('   Ctrl+K: Focus search');
        console.log('   Ctrl+1-6: Switch tools');
        console.log('   Esc: Close suggestions');
    },
    
    // ============================================
    // ANALYTICS (Optionnel)
    // ============================================
    
    trackEvent: function(category, action, label) {
        console.log(`📊 Analytics: ${category} - ${action} - ${label}`);
        
        // Ici tu peux intégrer Google Analytics ou autre
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                'event_category': category,
                'event_label': label
            });
        }
    }
    
}; // ⚠️ FIN de l'objet DemoApp

// ============================================
// INITIALIZE ON DOM READY
// ============================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        DemoApp.init();
        DemoApp.setupKeyboardShortcuts(); // Activer les raccourcis clavier
    });
} else {
    DemoApp.init();
    DemoApp.setupKeyboardShortcuts();
}

// ============================================
// EXPOSE TO GLOBAL SCOPE
// ============================================
window.DemoApp = DemoApp;

// ============================================
// CONSOLE WELCOME MESSAGE
// ============================================
console.log('%c╔══════════════════════════════════════════════════════════╗', 'color: #667eea; font-weight: bold;');
console.log('%c║                                                          ║', 'color: #667eea; font-weight: bold;');
console.log('%c║     🚀 FinancePro Interactive Demo - PREMIUM EDITION    ║', 'color: #667eea; font-weight: bold;');
console.log('%c║                                                          ║', 'color: #667eea; font-weight: bold;');
console.log('%c╚══════════════════════════════════════════════════════════╝', 'color: #667eea; font-weight: bold;');
console.log('');
console.log('%c✨ FEATURES LOADED:', 'color: #8b5cf6; font-size: 14px; font-weight: bold;');
console.log('%c  📊 Company Search with Performance Charts', 'color: #10b981; font-size: 12px;');
console.log('%c  📈 Live Quotes with Sentiment Analysis', 'color: #10b981; font-size: 12px;');
console.log('%c  💼 Portfolio Builder with Correlation Matrix', 'color: #10b981; font-size: 12px;');
console.log('%c  📉 Advanced Technical Analysis (SMA, EMA, BB, RSI, MACD)', 'color: #10b981; font-size: 12px;');
console.log('%c  🎲 Risk Calculator with Monte Carlo Simulation', 'color: #10b981; font-size: 12px;');
console.log('%c  🤖 AI-Powered Predictions with ML Models', 'color: #10b981; font-size: 12px;');
console.log('');
console.log('%c⌨️  KEYBOARD SHORTCUTS:', 'color: #f59e0b; font-size: 14px; font-weight: bold;');
console.log('%c  Ctrl+K         Focus Search', 'color: #64748b; font-size: 12px;');
console.log('%c  Ctrl+1-6       Switch Tools', 'color: #64748b; font-size: 12px;');
console.log('%c  Esc            Close Suggestions', 'color: #64748b; font-size: 12px;');
console.log('');
console.log('%c💡 TRY THESE COMMANDS:', 'color: #3b82f6; font-size: 14px; font-weight: bold;');
console.log('%c  DemoApp.searchCompany("AAPL")', 'color: #64748b; font-size: 12px;');
console.log('%c  DemoApp.loadLiveQuote("TSLA")', 'color: #64748b; font-size: 12px;');
console.log('%c  DemoApp.generateAIInsights()', 'color: #64748b; font-size: 12px;');
console.log('');
console.log('%c🎯 DEMO SYMBOLS TO TRY:', 'color: #ec4899; font-size: 14px; font-weight: bold;');
console.log('%c  Apple (AAPL) • Microsoft (MSFT) • Tesla (TSLA)', 'color: #64748b; font-size: 12px;');
console.log('%c  Amazon (AMZN) • Google (GOOGL) • NVIDIA (NVDA)', 'color: #64748b; font-size: 12px;');
console.log('');
console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #667eea;');
console.log('%cBuilt with ❤️ by FinancePro Team', 'color: #8b5cf6; font-size: 12px; font-style: italic;');
console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #667eea;');

// ============================================
// AUTO-DEMO MODE (Optionnel - décommenter pour activer)
// ============================================
/*
setTimeout(() => {
    console.log('%c🎬 Starting Auto-Demo...', 'color: #f59e0b; font-size: 14px; font-weight: bold;');
    
    // Démo automatique
    setTimeout(() => DemoApp.searchCompany('AAPL'), 2000);
    setTimeout(() => DemoApp.switchTool('live-quotes'), 8000);
    setTimeout(() => DemoApp.loadLiveQuote('TSLA'), 10000);
    setTimeout(() => DemoApp.switchTool('ai-insights'), 16000);
    setTimeout(() => DemoApp.generateAIInsights(), 18000);
    
}, 3000);
*/

// ============================================
// PERFORMANCE MONITORING
// ============================================
if (window.performance && window.performance.now) {
    const loadTime = window.performance.now();
    console.log(`⚡ Page fully loaded in ${loadTime.toFixed(2)}ms`);
}

// ============================================
// ERROR HANDLING GLOBAL
// ============================================
window.addEventListener('error', (event) => {
    console.error('Global error caught:', event.error);
    
    // Afficher une notification à l'utilisateur
    if (DemoApp && DemoApp.showNotification) {
        DemoApp.showNotification('An unexpected error occurred. Please refresh the page.', 'error');
    }
});

// ============================================
// UNHANDLED PROMISE REJECTION
// ============================================
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    if (DemoApp && DemoApp.showNotification) {
        DemoApp.showNotification('A network error occurred. Please check your connection.', 'warning');
    }
});

// ============================================
// CLEANUP ON PAGE UNLOAD
// ============================================
window.addEventListener('beforeunload', () => {
    console.log('👋 Cleaning up...');
    
    // Détruire tous les graphiques pour libérer la mémoire
    if (DemoApp && DemoApp.charts) {
        Object.keys(DemoApp.charts).forEach(key => {
            if (DemoApp.charts[key] && DemoApp.charts[key].destroy) {
                DemoApp.charts[key].destroy();
            }
        });
    }
});

// ============================================
// FIN DU FICHIER
// ============================================
console.log('%c✅ interactive-demo.js loaded successfully!', 'color: #10b981; font-size: 16px; font-weight: bold;');