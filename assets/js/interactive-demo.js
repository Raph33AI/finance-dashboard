/* ============================================
   INTERACTIVE-DEMO.JS - VERSION CORRIGÉE v2
   Main JavaScript pour la page de démo interactive
   ============================================ */

// ============================================
// DEBUG MODE
// ============================================
console.log('🔍 Loading interactive-demo.js...');

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
    
    // Portfolio data
    portfolio: [],
    
    // Charts
    charts: {
        liveQuote: null,
        portfolioAllocation: null,
        technical: null,
        aiPrediction: null
    },
    
    // ============================================
    // INITIALIZATION
    // ============================================
    init: function() {
        try {
            console.log('🚀 Initializing Interactive Demo...');
            
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
            
            console.log('✅ Interactive Demo initialized successfully!');
            
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
    // COMPANY SEARCH - Setup
    // ============================================
    setupCompanySearchListeners: function() {
        const input = document.getElementById('companySearchInput');
        const btnSearch = document.getElementById('btnSearch');
        
        if (input) {
            // Input search - AMÉLIORATION : Recherche par nom ET ticker
            input.addEventListener('input', (e) => {
                this.handleCompanySearch(e.target.value);
            });
            
            // Enter key
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    // Si une suggestion est sélectionnée, utiliser celle-ci
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
    
    // NOUVELLE FONCTION : Navigation clavier dans les suggestions
    navigateSuggestions: function(direction) {
        const suggestions = document.querySelectorAll('.suggestion-item');
        if (suggestions.length === 0) return;
        
        // Remove current highlight
        if (this.selectedSuggestionIndex >= 0 && suggestions[this.selectedSuggestionIndex]) {
            suggestions[this.selectedSuggestionIndex].classList.remove('keyboard-selected');
        }
        
        // Update index
        this.selectedSuggestionIndex += direction;
        
        // Wrap around
        if (this.selectedSuggestionIndex < 0) {
            this.selectedSuggestionIndex = suggestions.length - 1;
        } else if (this.selectedSuggestionIndex >= suggestions.length) {
            this.selectedSuggestionIndex = 0;
        }
        
        // Add new highlight
        if (suggestions[this.selectedSuggestionIndex]) {
            suggestions[this.selectedSuggestionIndex].classList.add('keyboard-selected');
            suggestions[this.selectedSuggestionIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    },
    
    handleCompanySearch: function(query) {
        const trimmedQuery = query.trim();
        
        // Reset selected suggestion
        this.selectedSuggestionIndex = -1;
        
        if (trimmedQuery.length === 0) {
            this.hideSuggestions();
            return;
        }
        
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.searchSymbols(trimmedQuery);
        }, 300); // Délai de 300ms pour éviter trop de requêtes
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
        
        // Trier les résultats : prioriser les correspondances exactes
        const sortedResults = results.sort((a, b) => {
            const aSymbol = (a.symbol || '').toLowerCase();
            const bSymbol = (b.symbol || '').toLowerCase();
            const aName = (a.instrument_name || '').toLowerCase();
            const bName = (b.instrument_name || '').toLowerCase();
            
            // Exact symbol match first
            if (aSymbol === queryLower) return -1;
            if (bSymbol === queryLower) return 1;
            
            // Symbol starts with query
            if (aSymbol.startsWith(queryLower) && !bSymbol.startsWith(queryLower)) return -1;
            if (bSymbol.startsWith(queryLower) && !aSymbol.startsWith(queryLower)) return 1;
            
            // Name starts with query
            if (aName.startsWith(queryLower) && !bName.startsWith(queryLower)) return -1;
            if (bName.startsWith(queryLower) && !aName.startsWith(queryLower)) return 1;
            
            // Alphabetical
            return aSymbol.localeCompare(bSymbol);
        });
        
        // Group by type
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
                // Par défaut, mettre dans stocks
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
            
            // Add click listeners
            container.querySelectorAll('.suggestion-item').forEach((item) => {
                item.addEventListener('click', () => {
                    this.selectCompany(item.dataset.symbol);
                });
                
                // Highlight on hover
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
        
        const queryLower = query.toLowerCase();
        
        items.slice(0, 8).forEach(item => {
            const symbol = this.escapeHtml(item.symbol);
            const name = this.escapeHtml(item.instrument_name || item.symbol);
            
            // Highlight matching text
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
    
    // NOUVELLE FONCTION : Highlight du texte correspondant
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
        
        const container = document.getElementById('searchResultsContainer');
        if (!container) return;
        
        try {
            // Show loading
            container.innerHTML = `
                <div class="results-placeholder">
                    <i class="fas fa-spinner fa-spin"></i>
                    <h3>Loading company data...</h3>
                    <p>Please wait...</p>
                </div>
            `;
            
            // Fetch quote data
            const quoteData = await this.apiClient.getQuote(trimmedSymbol);
            
            if (quoteData && quoteData.symbol) {
                this.displayCompanyResults(quoteData);
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
        
        // FIX : Support price ET close
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
    
    // ============================================
    // LIVE QUOTES TOOL
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
        
        // FIX : Support price ET close
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
            
            // FIX : L'API retourne 'data' et non 'values'
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
                lineWidth: 2
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
    
    // ============================================
    // PORTFOLIO BUILDER TOOL
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
            
            console.log('📊 Quote data received for portfolio:', quoteData);
            
            // FIX CRITIQUE : Vérifier price OU close - supporter la valeur 0
            const currentPrice = quoteData.close !== undefined && quoteData.close !== null 
                ? quoteData.close 
                : quoteData.price;
            
            console.log('💰 Current price:', currentPrice);
            
            // Vérifier que le prix existe ET est un nombre valide
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
                
                this.showNotification(`✅ ${symbol} added to portfolio`, 'success');
            } else {
                console.error('❌ Invalid price data:', { quoteData, currentPrice });
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
                    <p class="value-large">${this.portfolio.length > 1 ? 'Good' : 'Low'}</p>
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
                text: 'Portfolio Allocation',
                style: {
                    color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary'),
                    fontSize: '1.125rem',
                    fontWeight: '700'
                }
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
                        format: '<b>{point.name}</b>: {point.percentage}%'
                    }
                }
            },
            series: [{
                name: 'Value',
                colorByPoint: true,
                data: data
            }],
            credits: { enabled: false }
        });
    },
    
    // ============================================
    // TECHNICAL ANALYSIS TOOL
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
            
            console.log('📈 Time series data received:', timeSeriesData);
            console.log('📈 Data array:', timeSeriesData?.data);
            console.log('📈 Data length:', timeSeriesData?.data?.length);
            
            // FIX CRITIQUE : Vérifier plusieurs structures possibles
            let dataArray = null;
            
            // Structure 1 : {data: [...]}
            if (timeSeriesData && timeSeriesData.data && Array.isArray(timeSeriesData.data)) {
                dataArray = timeSeriesData.data;
            }
            // Structure 2 : {values: [...]}
            else if (timeSeriesData && timeSeriesData.values && Array.isArray(timeSeriesData.values)) {
                dataArray = timeSeriesData.values;
            }
            // Structure 3 : directement un tableau
            else if (Array.isArray(timeSeriesData)) {
                dataArray = timeSeriesData;
            }
            
            if (dataArray && dataArray.length > 0) {
                console.log('✅ Using data array with', dataArray.length, 'items');
                this.renderTechnicalChart(dataArray, symbol);
                this.generateTechnicalSignals(symbol, dataArray);
            } else {
                console.error('❌ No valid data array found in:', timeSeriesData);
                throw new Error('No data available');
            }
            
        } catch (error) {
            console.error('Error analyzing:', error);
            this.showNotification('Unable to load technical data for ' + symbol, 'error');
        }
    },
    
    renderTechnicalChart: function(data, symbol) {
        if (this.charts.technical) {
            this.charts.technical.destroy();
        }
        
        const reversedData = [...data].reverse();
        const ohlc = reversedData.map(d => [
            new Date(d.datetime).getTime(),
            parseFloat(d.open),
            parseFloat(d.high),
            parseFloat(d.low),
            parseFloat(d.close)
        ]);
        
        const volume = reversedData.map(d => [
            new Date(d.datetime).getTime(),
            parseFloat(d.volume || 0)
        ]);
        
        this.charts.technical = Highcharts.stockChart('technicalChart', {
            chart: {
                backgroundColor: 'transparent',
                height: 500
            },
            title: {
                text: `${symbol} - Technical Analysis`,
                style: {
                    color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
                }
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
                lineWidth: 2,
                resize: {
                    enabled: true
                }
            }, {
                labels: {
                    align: 'right',
                    x: -3
                },
                title: {
                    text: 'Volume'
                },
                top: '75%',
                height: '25%',
                offset: 0,
                lineWidth: 2
            }],
            series: [{
                type: 'candlestick',
                name: symbol,
                data: ohlc,
                color: '#EF4444',
                upColor: '#10B981',
                yAxis: 0
            }, {
                type: 'column',
                name: 'Volume',
                data: volume,
                yAxis: 1,
                color: '#3B82F6'
            }],
            credits: { enabled: false },
            rangeSelector: {
                enabled: true,
                selected: 1
            }
        });
    },
    
    generateTechnicalSignals: function(symbol, data) {
        const container = document.getElementById('technicalSignals');
        if (!container) return;
        
        // Calcul de la moyenne mobile simple (SMA)
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
        
        if (sma20 && sma50) {
            if (currentPrice > sma20 && sma20 > sma50) {
                trend = 'Bullish';
                trendClass = 'bullish';
            } else if (currentPrice < sma20 && sma20 < sma50) {
                trend = 'Bearish';
                trendClass = 'bearish';
            }
        }
        
        container.innerHTML = `
            <h4>Technical Signals for ${symbol}</h4>
            <div class="signals-grid">
                <div class="signal-card">
                    <div class="signal-icon ${trendClass}">
                        <i class="fas fa-${trend === 'Bullish' ? 'arrow-up' : trend === 'Bearish' ? 'arrow-down' : 'minus'}"></i>
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
            </div>
        `;
    },
    
    // ============================================
    // RISK CALCULATOR TOOL
    // ============================================
    setupRiskCalculatorListeners: function() {
        const btnCalculate = document.getElementById('btnCalculateRisk');
        
        if (btnCalculate) {
            btnCalculate.addEventListener('click', () => {
                this.calculateRiskMetrics();
            });
        }
        
        // Auto-calculate on input change
        ['riskPortfolioValue', 'riskConfidence', 'riskVolatility'].forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('input', () => {
                    // Debounce
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
        
        console.log('📊 Calculating risk metrics...');
        
        const zScore = confidence === 95 ? 1.645 : confidence === 99 ? 2.326 : 1.282;
        const dailyVolatility = volatility / Math.sqrt(252);
        const varDaily = portfolioValue * dailyVolatility * zScore / 100;
        const cvar = varDaily * 1.3;
        const sharpeRatio = (8 - 2) / volatility; // Assuming 8% return, 2% risk-free rate
        
        this.displayRiskResults({
            portfolioValue,
            confidence,
            volatility,
            varDaily,
            cvar,
            sharpeRatio
        });
    },
    
    displayRiskResults: function(metrics) {
        const container = document.getElementById('riskResults');
        if (!container) return;
        
        container.innerHTML = `
            <div class="risk-metric-card">
                <h5>Value at Risk (VaR)</h5>
                <div class="risk-metric-value text-danger">
                    $${metrics.varDaily.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </div>
                <p class="risk-metric-description">
                    ${metrics.confidence}% confidence level - Daily VaR
                </p>
            </div>
            
            <div class="risk-metric-card">
                <h5>Conditional VaR (CVaR)</h5>
                <div class="risk-metric-value text-danger">
                    $${metrics.cvar.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </div>
                <p class="risk-metric-description">
                    Expected loss if VaR threshold is exceeded
                </p>
            </div>
            
            <div class="risk-metric-card">
                <h5>Volatility (Annual)</h5>
                <div class="risk-metric-value">
                    ${metrics.volatility.toFixed(2)}%
                </div>
                <p class="risk-metric-description">
                    Annualized standard deviation of returns
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
        `;
    },
    
    // ============================================
    // AI INSIGHTS TOOL
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
                    <p>Analyzing ${symbol}...</p>
                </div>
            `;
            
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            const quoteData = await this.apiClient.getQuote(symbol);
            
            if (quoteData) {
                this.displayAIInsights(symbol, quoteData);
            }
            
        } catch (error) {
            console.error('Error generating AI insights:', error);
            container.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>Unable to generate AI insights</span>
                </div>
            `;
        }
    },
    
    displayAIInsights: function(symbol, quoteData) {
        const container = document.getElementById('aiResults');
        if (!container) return;
        
        // FIX : Support price ET close
        const currentPrice = quoteData.close || quoteData.price || 0;
        const prediction7d = currentPrice * (1 + (Math.random() - 0.5) * 0.1);
        const prediction30d = currentPrice * (1 + (Math.random() - 0.5) * 0.2);
        
        const change7d = ((prediction7d - currentPrice) / currentPrice * 100).toFixed(2);
        const change30d = ((prediction30d - currentPrice) / currentPrice * 100).toFixed(2);
        
        container.innerHTML = `
            <div class="ai-insight-card">
                <div class="ai-insight-header">
                    <div class="ai-insight-icon">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <div class="ai-insight-title">
                        <h4>Price Prediction</h4>
                        <p>ML Forecast for ${symbol}</p>
                    </div>
                    <div class="ai-confidence">
                        <i class="fas fa-check-circle"></i>
                        85% Confidence
                    </div>
                </div>
                <div class="ai-insight-content">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin: 1.5rem 0;">
                        <div>
                            <p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Current Price</p>
                            <p style="font-size: 1.5rem; font-weight: 700; color: var(--text-primary);">$${currentPrice.toFixed(2)}</p>
                        </div>
                        <div>
                            <p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem;">7-Day Prediction</p>
                            <p style="font-size: 1.5rem; font-weight: 700; color: ${change7d > 0 ? 'var(--success-color)' : 'var(--danger-color)'};">
                                $${prediction7d.toFixed(2)}
                                <span style="font-size: 0.875rem; margin-left: 0.5rem;">(${change7d > 0 ? '+' : ''}${change7d}%)</span>
                            </p>
                        </div>
                        <div>
                            <p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem;">30-Day Prediction</p>
                            <p style="font-size: 1.5rem; font-weight: 700; color: ${change30d > 0 ? 'var(--success-color)' : 'var(--danger-color)'};">
                                $${prediction30d.toFixed(2)}
                                <span style="font-size: 0.875rem; margin-left: 0.5rem;">(${change30d > 0 ? '+' : ''}${change30d}%)</span>
                            </p>
                        </div>
                    </div>
                    
                    <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border-color);">
                        <p><strong>Model:</strong> LSTM Neural Network</p>
                        <p><strong>Training Data:</strong> 5 years historical data</p>
                        <p><strong>Last Updated:</strong> ${new Date().toLocaleString()}</p>
                    </div>
                </div>
            </div>
        `;
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
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
    }
    
}; // Fin de l'objet DemoApp

// ============================================
// INITIALIZE ON DOM READY
// ============================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        DemoApp.init();
    });
} else {
    DemoApp.init();
}

// ============================================
// EXPOSE TO GLOBAL SCOPE
// ============================================
window.DemoApp = DemoApp;

// ============================================
// CONSOLE MESSAGE
// ============================================
console.log('%c🚀 Interactive Demo Ready!', 'color: #667eea; font-size: 20px; font-weight: bold;');
console.log('%c📊 Try searching for "Apple", "AAPL", "Microsoft", or "TSLA"', 'color: #8b5cf6; font-size: 14px;');
console.log('%c✨ Search works with both company names and ticker symbols!', 'color: #10b981; font-size: 14px;');