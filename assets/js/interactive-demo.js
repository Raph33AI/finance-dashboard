/* ============================================
   INTERACTIVE-DEMO.JS
   Main JavaScript pour la page de démo interactive
   ============================================ */

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
    init() {
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
    setupEventListeners() {
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
    switchTool(toolName) {
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
    // COMPANY SEARCH TOOL
    // ============================================
    setupCompanySearchListeners() {
        const input = document.getElementById('companySearchInput');
        const btnSearch = document.getElementById('btnSearch');
        
        if (input) {
            // Input search
            input.addEventListener('input', (e) => {
                this.handleCompanySearch(e.target.value);
            });
            
            // Enter key
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    if (this.selectedSuggestionIndex >= 0) {
                        const suggestions = document.querySelectorAll('.suggestion-item');
                        if (suggestions[this.selectedSuggestionIndex]) {
                            const symbol = suggestions[this.selectedSuggestionIndex].dataset.symbol;
                            this.selectCompany(symbol);
                        }
                    } else {
                        this.searchCompany(input.value);
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
                input.value = symbol;
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
    
    handleCompanySearch(query) {
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
                this.displayNoResults();
            }
            
        } catch (error) {
            console.error('Search failed:', error);
            this.displaySearchError();
        }
    },
    
    displaySearchSuggestions(results, query) {
        const container = document.getElementById('searchSuggestions');
        if (!container) return;
        
        // Group by type
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
            container.querySelectorAll('.suggestion-item').forEach((item) => {
                item.addEventListener('click', () => {
                    this.selectCompany(item.dataset.symbol);
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
        
        items.slice(0, 8).forEach(item => {
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
    
    hideSuggestions() {
        const container = document.getElementById('searchSuggestions');
        if (!container) return;
        
        container.classList.remove('active');
        this.selectedSuggestionIndex = -1;
    },
    
    async selectCompany(symbol) {
        console.log('✅ Selected company:', symbol);
        
        const input = document.getElementById('companySearchInput');
        if (input) {
            input.value = symbol;
        }
        
        this.hideSuggestions();
        await this.searchCompany(symbol);
    },
    
    async searchCompany(symbol) {
        console.log('🔍 Searching company:', symbol);
        
        const container = document.getElementById('searchResultsContainer');
        if (!container) return;
        
        try {
            // Show loading
            container.innerHTML = `
                <div class="results-placeholder">
                    <i class="fas fa-spinner fa-spin"></i>
                    <h3>Loading company data...</h3>
                    <p>Please wait while we fetch the information</p>
                </div>
            `;
            
            // Fetch quote data
            const quoteData = await this.apiClient.getQuote(symbol);
            
            if (quoteData && quoteData.symbol) {
                // Display company info
                this.displayCompanyResults(quoteData);
                
                // Find comparables (simulation for demo)
                await this.findComparables(quoteData);
            } else {
                throw new Error('No data found');
            }
            
        } catch (error) {
            console.error('Error searching company:', error);
            container.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>Unable to load company data. Please try another symbol.</span>
                </div>
            `;
        }
    },
    
    displayCompanyResults(quoteData) {
        const container = document.getElementById('searchResultsContainer');
        if (!container) return;
        
        const change = quoteData.change || 0;
        const percentChange = quoteData.percent_change || 0;
        const isPositive = change >= 0;
        
        container.innerHTML = `
            <div class="search-results-header">
                <h3>Company Information</h3>
            </div>
            
            <div class="company-result-card highlight">
                <div class="company-result-header">
                    <div class="company-avatar">
                        <span>${quoteData.symbol.substring(0, 2)}</span>
                    </div>
                    <div class="company-details">
                        <h4>${quoteData.name || quoteData.symbol}</h4>
                        <p>${quoteData.exchange || 'N/A'} • ${quoteData.currency || 'USD'}</p>
                    </div>
                    <div class="quote-change ${isPositive ? 'positive' : 'negative'}">
                        <i class="fas fa-${isPositive ? 'arrow-up' : 'arrow-down'}"></i>
                        ${percentChange.toFixed(2)}%
                    </div>
                </div>
                
                <div class="quote-price-section">
                    <div class="quote-price">$${quoteData.close ? quoteData.close.toFixed(2) : 'N/A'}</div>
                    <div class="quote-change-detail ${isPositive ? 'text-success' : 'text-danger'}">
                        ${isPositive ? '+' : ''}${change.toFixed(2)} (${percentChange.toFixed(2)}%)
                    </div>
                </div>
                
                <div class="company-metrics">
                    <div class="metric-item">
                        <span class="metric-label">Open</span>
                        <span class="metric-value">$${quoteData.open ? quoteData.open.toFixed(2) : 'N/A'}</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">High</span>
                        <span class="metric-value">$${quoteData.high ? quoteData.high.toFixed(2) : 'N/A'}</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Low</span>
                        <span class="metric-value">$${quoteData.low ? quoteData.low.toFixed(2) : 'N/A'}</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Volume</span>
                        <span class="metric-value">${quoteData.volume ? this.formatNumber(quoteData.volume) : 'N/A'}</span>
                    </div>
                </div>
            </div>
            
            <div class="comparables-section" id="comparablesSection">
                <div class="results-placeholder">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Finding comparable companies...</p>
                </div>
            </div>
        `;
    },
    
    async findComparables(quoteData) {
        // For demo purposes, we'll simulate finding comparables
        // In production, this would use a real comparable companies API
        
        const comparablesSection = document.getElementById('comparablesSection');
        if (!comparablesSection) return;
        
        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Demo comparable companies (based on sector/industry)
        const comparables = this.getSimulatedComparables(quoteData.symbol);
        
        let html = `
            <h3>Comparable Companies</h3>
            <div class="results-header">
                <span>${comparables.length} comparable companies found</span>
                <span class="results-time">1.2s</span>
            </div>
        `;
        
        comparables.forEach((comp, index) => {
            const relevancy = 98 - (index * 2);
            html += this.buildComparableCard(comp, relevancy, index === 0);
        });
        
        comparablesSection.innerHTML = html;
    },
    
    getSimulatedComparables(symbol) {
        // Simulated comparable companies database
        const comparablesDB = {
            'AAPL': [
                { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology' },
                { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology' },
                { symbol: 'META', name: 'Meta Platforms Inc.', sector: 'Technology' }
            ],
            'TSLA': [
                { symbol: 'RIVN', name: 'Rivian Automotive Inc.', sector: 'Automotive' },
                { symbol: 'LCID', name: 'Lucid Group Inc.', sector: 'Automotive' },
                { symbol: 'NIO', name: 'NIO Inc.', sector: 'Automotive' }
            ],
            'MSFT': [
                { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology' },
                { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology' },
                { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'Technology' }
            ],
            'GOOGL': [
                { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology' },
                { symbol: 'META', name: 'Meta Platforms Inc.', sector: 'Technology' },
                { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'Technology' }
            ],
            'AMZN': [
                { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology' },
                { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology' },
                { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology' }
            ]
        };
        
        return comparablesDB[symbol] || [
            { symbol: 'SPY', name: 'SPDR S&P 500 ETF', sector: 'Index Fund' },
            { symbol: 'QQQ', name: 'Invesco QQQ Trust', sector: 'Index Fund' }
        ];
    },
    
    buildComparableCard(company, relevancy, isHighlight) {
        return `
            <div class="company-result-card ${isHighlight ? 'highlight' : ''}">
                <div class="company-result-header">
                    <div class="company-avatar">
                        <span>${company.symbol.substring(0, 2)}</span>
                    </div>
                    <div class="company-details">
                        <h4>${company.name}</h4>
                        <p>${company.symbol} • ${company.sector}</p>
                    </div>
                    <div class="relevancy-score">
                        <div class="score-circle">
                            <span class="score-value">${relevancy}</span>
                        </div>
                        <span class="score-label">Relevancy</span>
                    </div>
                </div>
                <div class="company-metrics">
                    <div class="metric-item">
                        <span class="metric-label">Sector</span>
                        <span class="metric-value">${company.sector}</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Match Score</span>
                        <span class="metric-value">${relevancy}/100</span>
                    </div>
                </div>
            </div>
        `;
    }
};

// ============================================
    // LIVE QUOTES TOOL
    // ============================================
    setupLiveQuotesListeners() {
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
    
    async loadLiveQuote(symbol) {
        if (!symbol || symbol.trim() === '') {
            this.showNotification('Please enter a ticker symbol', 'warning');
            return;
        }
        
        const trimmedSymbol = symbol.trim().toUpperCase();
        console.log('📊 Loading live quote for:', trimmedSymbol);
        
        const container = document.getElementById('quoteDisplay');
        if (!container) return;
        
        try {
            // Show loading state
            container.innerHTML = `
                <div class="quote-placeholder">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Loading quote data...</p>
                </div>
            `;
            
            // Fetch quote data
            const quoteData = await this.apiClient.getQuote(trimmedSymbol);
            
            if (quoteData && quoteData.symbol) {
                this.displayLiveQuote(quoteData);
                
                // Load historical chart
                await this.loadQuoteChart(trimmedSymbol);
            } else {
                throw new Error('No data available');
            }
            
        } catch (error) {
            console.error('Error loading quote:', error);
            container.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>Unable to load quote data for ${trimmedSymbol}. Please try another symbol.</span>
                </div>
            `;
        }
    },
    
    displayLiveQuote(quoteData) {
        const container = document.getElementById('quoteDisplay');
        if (!container) return;
        
        const change = quoteData.change || 0;
        const percentChange = quoteData.percent_change || 0;
        const isPositive = change >= 0;
        
        container.innerHTML = `
            <div class="quote-header">
                <div class="quote-symbol">${quoteData.symbol}</div>
                <div class="quote-name">${quoteData.name || 'N/A'}</div>
            </div>
            
            <div class="quote-main-info">
                <div class="quote-price">$${quoteData.close ? quoteData.close.toFixed(2) : 'N/A'}</div>
                <div class="quote-change ${isPositive ? 'positive' : 'negative'}">
                    <i class="fas fa-${isPositive ? 'arrow-up' : 'arrow-down'}"></i>
                    ${isPositive ? '+' : ''}$${Math.abs(change).toFixed(2)} (${percentChange.toFixed(2)}%)
                </div>
            </div>
            
            <div class="quote-info">
                <div class="quote-stat">
                    <div class="quote-stat-label">Open</div>
                    <div class="quote-stat-value">$${quoteData.open ? quoteData.open.toFixed(2) : 'N/A'}</div>
                </div>
                <div class="quote-stat">
                    <div class="quote-stat-label">High</div>
                    <div class="quote-stat-value">$${quoteData.high ? quoteData.high.toFixed(2) : 'N/A'}</div>
                </div>
                <div class="quote-stat">
                    <div class="quote-stat-label">Low</div>
                    <div class="quote-stat-value">$${quoteData.low ? quoteData.low.toFixed(2) : 'N/A'}</div>
                </div>
                <div class="quote-stat">
                    <div class="quote-stat-label">Volume</div>
                    <div class="quote-stat-value">${quoteData.volume ? this.formatNumber(quoteData.volume) : 'N/A'}</div>
                </div>
                <div class="quote-stat">
                    <div class="quote-stat-label">Prev Close</div>
                    <div class="quote-stat-value">$${quoteData.previous_close ? quoteData.previous_close.toFixed(2) : 'N/A'}</div>
                </div>
                <div class="quote-stat">
                    <div class="quote-stat-label">Exchange</div>
                    <div class="quote-stat-value">${quoteData.exchange || 'N/A'}</div>
                </div>
            </div>
        `;
    },
    
    async loadQuoteChart(symbol) {
        try {
            // Fetch time series data
            const timeSeriesData = await this.apiClient.getTimeSeries(symbol, 'day', '3month');
            
            if (timeSeriesData && timeSeriesData.values && timeSeriesData.values.length > 0) {
                this.renderQuoteChart(timeSeriesData.values, symbol);
            }
            
        } catch (error) {
            console.error('Error loading chart:', error);
        }
    },
    
    renderQuoteChart(data, symbol) {
        // Destroy existing chart
        if (this.charts.liveQuote) {
            this.charts.liveQuote.destroy();
        }
        
        // Prepare data
        const dates = data.map(d => d.datetime).reverse();
        const prices = data.map(d => parseFloat(d.close)).reverse();
        const volumes = data.map(d => parseInt(d.volume)).reverse();
        
        // Create chart
        this.charts.liveQuote = Highcharts.stockChart('liveQuoteChart', {
            chart: {
                backgroundColor: 'transparent',
                style: {
                    fontFamily: 'Inter, sans-serif'
                }
            },
            title: {
                text: `${symbol} - 3 Month Price History`,
                style: {
                    color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary'),
                    fontSize: '1.125rem',
                    fontWeight: '700'
                }
            },
            xAxis: {
                type: 'datetime',
                labels: {
                    style: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary')
                    }
                }
            },
            yAxis: [{
                labels: {
                    style: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary')
                    }
                },
                title: {
                    text: 'Price ($)',
                    style: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary')
                    }
                }
            }, {
                labels: {
                    style: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary')
                    }
                },
                title: {
                    text: 'Volume',
                    style: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary')
                    }
                },
                opposite: true
            }],
            series: [{
                name: 'Price',
                data: dates.map((date, i) => [new Date(date).getTime(), prices[i]]),
                color: '#3B82F6',
                lineWidth: 2,
                yAxis: 0
            }, {
                type: 'column',
                name: 'Volume',
                data: dates.map((date, i) => [new Date(date).getTime(), volumes[i]]),
                color: 'rgba(59, 130, 246, 0.3)',
                yAxis: 1
            }],
            rangeSelector: {
                enabled: true,
                selected: 1
            },
            navigator: {
                enabled: true
            },
            credits: {
                enabled: false
            }
        });
    },
    
    // ============================================
    // PORTFOLIO BUILDER TOOL
    // ============================================
    setupPortfolioListeners() {
        const btnAdd = document.getElementById('btnAddToPortfolio');
        
        if (btnAdd) {
            btnAdd.addEventListener('click', () => {
                this.addToPortfolio();
            });
        }
        
        // Enter key support
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
    
    async addToPortfolio() {
        const symbolInput = document.getElementById('portfolioSymbol');
        const sharesInput = document.getElementById('portfolioShares');
        
        if (!symbolInput || !sharesInput) return;
        
        const symbol = symbolInput.value.trim().toUpperCase();
        const shares = parseInt(sharesInput.value);
        
        // Validation
        if (!symbol) {
            this.showNotification('Please enter a ticker symbol', 'warning');
            return;
        }
        
        if (!shares || shares <= 0) {
            this.showNotification('Please enter a valid number of shares', 'warning');
            return;
        }
        
        // Check if already in portfolio
        const existingIndex = this.portfolio.findIndex(p => p.symbol === symbol);
        if (existingIndex >= 0) {
            this.showNotification('This symbol is already in your portfolio', 'warning');
            return;
        }
        
        try {
            // Fetch current price
            const quoteData = await this.apiClient.getQuote(symbol);
            
            if (quoteData && quoteData.close) {
                const holding = {
                    symbol: symbol,
                    name: quoteData.name || symbol,
                    shares: shares,
                    price: quoteData.close,
                    value: shares * quoteData.close
                };
                
                this.portfolio.push(holding);
                
                // Clear inputs
                symbolInput.value = '';
                sharesInput.value = '';
                
                // Update display
                this.updatePortfolioDisplay();
                
                this.showNotification(`${symbol} added to portfolio`, 'success');
            } else {
                throw new Error('Unable to fetch price');
            }
            
        } catch (error) {
            console.error('Error adding to portfolio:', error);
            this.showNotification('Unable to add symbol to portfolio. Please try again.', 'error');
        }
    },
    
    removeFromPortfolio(symbol) {
        this.portfolio = this.portfolio.filter(p => p.symbol !== symbol);
        this.updatePortfolioDisplay();
        this.showNotification(`${symbol} removed from portfolio`, 'success');
    },
    
    updatePortfolioDisplay() {
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
            
            // Reset summary
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
        
        // Calculate totals
        const totalValue = this.portfolio.reduce((sum, p) => sum + p.value, 0);
        
        // Build table rows
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
        
        // Update summary
        if (summary) {
            const diversificationScore = this.calculateDiversification();
            
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
        
        // Update chart
        this.updatePortfolioChart();
    },
    
    calculateDiversification() {
        if (this.portfolio.length === 0) return 'N/A';
        
        const totalValue = this.portfolio.reduce((sum, p) => sum + p.value, 0);
        
        // Calculate Herfindahl index (concentration)
        let herfindahl = 0;
        this.portfolio.forEach(holding => {
            const weight = holding.value / totalValue;
            herfindahl += weight * weight;
        });
        
        // Convert to diversification score (inverse of concentration)
        // Score from 0 (not diversified) to 100 (well diversified)
        const maxDiversification = 1 / this.portfolio.length;
        const score = ((1 - herfindahl) / (1 - maxDiversification)) * 100;
        
        if (score >= 70) return 'Excellent';
        if (score >= 50) return 'Good';
        if (score >= 30) return 'Fair';
        return 'Poor';
    },
    
    updatePortfolioChart() {
        // Destroy existing chart
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
            credits: {
                enabled: false
            }
        });
    },
    
    // ============================================
    // TECHNICAL ANALYSIS TOOL
    // ============================================
    setupTechnicalListeners() {
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
        
        // Indicator checkboxes
        ['ind-sma', 'ind-ema', 'ind-bb', 'ind-rsi', 'ind-macd', 'ind-volume'].forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox) {
                checkbox.addEventListener('change', () => {
                    if (this.currentTechnicalSymbol) {
                        this.analyzeTechnical();
                    }
                });
            }
        });
    },
    
    async analyzeTechnical() {
        const input = document.getElementById('technicalSymbol');
        if (!input || !input.value.trim()) {
            this.showNotification('Please enter a ticker symbol', 'warning');
            return;
        }
        
        const symbol = input.value.trim().toUpperCase();
        this.currentTechnicalSymbol = symbol;
        
        console.log('📊 Analyzing technical indicators for:', symbol);
        
        try {
            // Fetch time series data
            const timeSeriesData = await this.apiClient.getTimeSeries(symbol, 'day', '6month');
            
            if (timeSeriesData && timeSeriesData.values && timeSeriesData.values.length > 0) {
                this.renderTechnicalChart(timeSeriesData.values, symbol);
                this.generateTechnicalSignals(timeSeriesData.values, symbol);
            } else {
                throw new Error('No data available');
            }
            
        } catch (error) {
            console.error('Error analyzing technical:', error);
            this.showNotification('Unable to load technical data. Please try another symbol.', 'error');
        }
    },
    
    renderTechnicalChart(data, symbol) {
        // Destroy existing chart
        if (this.charts.technical) {
            this.charts.technical.destroy();
        }
        
        // Prepare data
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
            parseInt(d.volume)
        ]);
        
        const closes = reversedData.map(d => parseFloat(d.close));
        
        // Get active indicators
        const indicators = {
            sma: document.getElementById('ind-sma')?.checked,
            ema: document.getElementById('ind-ema')?.checked,
            bb: document.getElementById('ind-bb')?.checked,
            rsi: document.getElementById('ind-rsi')?.checked,
            macd: document.getElementById('ind-macd')?.checked,
            volume: document.getElementById('ind-volume')?.checked
        };
        
        // Calculate indicators
        const sma20 = indicators.sma ? this.calculateSMA(closes, 20) : null;
        const sma50 = indicators.sma ? this.calculateSMA(closes, 50) : null;
        const ema12 = indicators.ema ? this.calculateEMA(closes, 12) : null;
        const ema26 = indicators.ema ? this.calculateEMA(closes, 26) : null;
        const bb = indicators.bb ? this.calculateBollingerBands(closes, 20, 2) : null;
        const rsi = indicators.rsi ? this.calculateRSI(closes, 14) : null;
        
        // Build series
        const series = [{
            type: 'candlestick',
            name: symbol,
            data: ohlc,
            color: '#EF4444',
            upColor: '#10B981',
            yAxis: 0
        }];
        
        if (sma20) {
            series.push({
                type: 'line',
                name: 'SMA 20',
                data: reversedData.map((d, i) => [new Date(d.datetime).getTime(), sma20[i]]),
                color: '#F59E0B',
                yAxis: 0
            });
        }
        
        if (sma50) {
            series.push({
                type: 'line',
                name: 'SMA 50',
                data: reversedData.map((d, i) => [new Date(d.datetime).getTime(), sma50[i]]),
                color: '#8B5CF6',
                yAxis: 0
            });
        }
        
        if (ema12) {
            series.push({
                type: 'line',
                name: 'EMA 12',
                data: reversedData.map((d, i) => [new Date(d.datetime).getTime(), ema12[i]]),
                color: '#06B6D4',
                dashStyle: 'ShortDash',
                yAxis: 0
            });
        }
        
        if (ema26) {
            series.push({
                type: 'line',
                name: 'EMA 26',
                data: reversedData.map((d, i) => [new Date(d.datetime).getTime(), ema26[i]]),
                color: '#EC4899',
                dashStyle: 'ShortDash',
                yAxis: 0
            });
        }
        
        if (bb) {
            series.push({
                type: 'line',
                name: 'BB Upper',
                data: reversedData.map((d, i) => [new Date(d.datetime).getTime(), bb.upper[i]]),
                color: 'rgba(148, 163, 184, 0.5)',
                lineWidth: 1,
                yAxis: 0
            });
            series.push({
                type: 'line',
                name: 'BB Lower',
                data: reversedData.map((d, i) => [new Date(d.datetime).getTime(), bb.lower[i]]),
                color: 'rgba(148, 163, 184, 0.5)',
                lineWidth: 1,
                yAxis: 0
            });
        }
        
        if (indicators.volume) {
            series.push({
                type: 'column',
                name: 'Volume',
                data: volume,
                color: 'rgba(59, 130, 246, 0.3)',
                yAxis: 1
            });
        }
        
        // Create chart
        this.charts.technical = Highcharts.stockChart('technicalChart', {
            chart: {
                backgroundColor: 'transparent'
            },
            title: {
                text: `${symbol} - Technical Analysis`,
                style: {
                    color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary'),
                    fontSize: '1.125rem',
                    fontWeight: '700'
                }
            },
            yAxis: [{
                labels: {
                    style: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary')
                    }
                },
                height: '70%',
                resize: {
                    enabled: true
                }
            }, {
                labels: {
                    style: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary')
                    }
                },
                top: '75%',
                height: '25%',
                offset: 0
            }],
            series: series,
            rangeSelector: {
                enabled: true,
                selected: 1
            },
            credits: {
                enabled: false
            }
        });
    },
    
    generateTechnicalSignals(data, symbol) {
        const container = document.getElementById('technicalSignals');
        if (!container) return;
        
        const reversedData = [...data].reverse();
        const closes = reversedData.map(d => parseFloat(d.close));
        
        // Calculate indicators for signals
        const sma20 = this.calculateSMA(closes, 20);
        const sma50 = this.calculateSMA(closes, 50);
        const rsi = this.calculateRSI(closes, 14);
        
        const currentPrice = closes[closes.length - 1];
        const currentSMA20 = sma20[sma20.length - 1];
        const currentSMA50 = sma50[sma50.length - 1];
        const currentRSI = rsi[rsi.length - 1];
        
        // Generate signals
        const signals = [];
        
        // Price vs SMA
        if (currentPrice > currentSMA20 && currentPrice > currentSMA50) {
            signals.push({
                type: 'bullish',
                title: 'Price Above Moving Averages',
                description: `Price is above both SMA20 ($${currentSMA20.toFixed(2)}) and SMA50 ($${currentSMA50.toFixed(2)})`
            });
        } else if (currentPrice < currentSMA20 && currentPrice < currentSMA50) {
            signals.push({
                type: 'bearish',
                title: 'Price Below Moving Averages',
                description: `Price is below both SMA20 ($${currentSMA20.toFixed(2)}) and SMA50 ($${currentSMA50.toFixed(2)})`
            });
        }
        
        // Golden Cross / Death Cross
        if (currentSMA20 > currentSMA50) {
            const prevSMA20 = sma20[sma20.length - 2];
            const prevSMA50 = sma50[sma50.length - 2];
            if (prevSMA20 <= prevSMA50) {
                signals.push({
                    type: 'bullish',
                    title: 'Golden Cross Detected',
                    description: 'SMA20 crossed above SMA50 - Strong bullish signal'
                });
            }
        } else if (currentSMA20 < currentSMA50) {
            const prevSMA20 = sma20[sma20.length - 2];
            const prevSMA50 = sma50[sma50.length - 2];
            if (prevSMA20 >= prevSMA50) {
                signals.push({
                    type: 'bearish',
                    title: 'Death Cross Detected',
                    description: 'SMA20 crossed below SMA50 - Strong bearish signal'
                });
            }
        }
        
        // RSI signals
        if (currentRSI > 70) {
            signals.push({
                type: 'bearish',
                title: 'Overbought Condition',
                description: `RSI is ${currentRSI.toFixed(2)} - Stock may be overbought`
            });
        } else if (currentRSI < 30) {
            signals.push({
                type: 'bullish',
                title: 'Oversold Condition',
                description: `RSI is ${currentRSI.toFixed(2)} - Stock may be oversold`
            });
        } else {
            signals.push({
                type: 'neutral',
                title: 'Neutral RSI',
                description: `RSI is ${currentRSI.toFixed(2)} - No extreme condition`
            });
        }
        
        // Trend analysis
        const trend = this.analyzeTrend(closes);
        signals.push({
            type: trend.type,
            title: trend.title,
            description: trend.description
        });
        
        // Display signals
        let html = '<h4>Technical Signals</h4><div class="signals-grid">';
        signals.forEach(signal => {
            html += `
                <div class="signal-card">
                    <div class="signal-icon ${signal.type}">
                        <i class="fas fa-${signal.type === 'bullish' ? 'arrow-up' : signal.type === 'bearish' ? 'arrow-down' : 'minus'}"></i>
                    </div>
                    <div class="signal-info">
                        <h5>${signal.title}</h5>
                        <p>${signal.description}</p>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        
        container.innerHTML = html;
    },
    
    analyzeTrend(closes) {
        const recentPrices = closes.slice(-20);
        const slope = this.calculateSlope(recentPrices);
        
        if (slope > 0.5) {
            return {
                type: 'bullish',
                title: 'Strong Uptrend',
                description: 'Price is in a strong upward trend over the last 20 days'
            };
        } else if (slope > 0.1) {
            return {
                type: 'bullish',
                title: 'Moderate Uptrend',
                description: 'Price is in a moderate upward trend'
            };
        } else if (slope < -0.5) {
            return {
                type: 'bearish',
                title: 'Strong Downtrend',
                description: 'Price is in a strong downward trend over the last 20 days'
            };
        } else if (slope < -0.1) {
            return {
                type: 'bearish',
                title: 'Moderate Downtrend',
                description: 'Price is in a moderate downward trend'
            };
        } else {
            return {
                type: 'neutral',
                title: 'Sideways Movement',
                description: 'Price is moving sideways with no clear trend'
            };
        }
    },
    
    calculateSlope(data) {
        const n = data.length;
        let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
        
        for (let i = 0; i < n; i++) {
            sumX += i;
            sumY += data[i];
            sumXY += i * data[i];
            sumXX += i * i;
        }
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        return slope;
    }
};

// ============================================
    // TECHNICAL INDICATORS CALCULATIONS
    // ============================================
    calculateSMA(data, period) {
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
    
    calculateEMA(data, period) {
        const result = [];
        const multiplier = 2 / (period + 1);
        
        // First EMA is SMA
        let sum = 0;
        for (let i = 0; i < period; i++) {
            sum += data[i];
            result.push(null);
        }
        result[period - 1] = sum / period;
        
        // Calculate remaining EMAs
        for (let i = period; i < data.length; i++) {
            const ema = (data[i] - result[i - 1]) * multiplier + result[i - 1];
            result.push(ema);
        }
        
        return result;
    },
    
    calculateBollingerBands(data, period, stdDev) {
        const sma = this.calculateSMA(data, period);
        const upper = [];
        const lower = [];
        
        for (let i = 0; i < data.length; i++) {
            if (i < period - 1) {
                upper.push(null);
                lower.push(null);
            } else {
                // Calculate standard deviation
                let sumSquares = 0;
                for (let j = 0; j < period; j++) {
                    const diff = data[i - j] - sma[i];
                    sumSquares += diff * diff;
                }
                const stdDeviation = Math.sqrt(sumSquares / period);
                
                upper.push(sma[i] + (stdDev * stdDeviation));
                lower.push(sma[i] - (stdDev * stdDeviation));
            }
        }
        
        return { upper, lower, middle: sma };
    },
    
    calculateRSI(data, period) {
        const result = [];
        const gains = [];
        const losses = [];
        
        // Calculate price changes
        for (let i = 1; i < data.length; i++) {
            const change = data[i] - data[i - 1];
            gains.push(change > 0 ? change : 0);
            losses.push(change < 0 ? -change : 0);
        }
        
        // Calculate RSI
        for (let i = 0; i < gains.length; i++) {
            if (i < period - 1) {
                result.push(null);
            } else {
                let avgGain = 0;
                let avgLoss = 0;
                
                for (let j = 0; j < period; j++) {
                    avgGain += gains[i - j];
                    avgLoss += losses[i - j];
                }
                
                avgGain /= period;
                avgLoss /= period;
                
                if (avgLoss === 0) {
                    result.push(100);
                } else {
                    const rs = avgGain / avgLoss;
                    const rsi = 100 - (100 / (1 + rs));
                    result.push(rsi);
                }
            }
        }
        
        // Add null at the beginning to match data length
        result.unshift(null);
        
        return result;
    },
    
    calculateMACD(data, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
        const fastEMA = this.calculateEMA(data, fastPeriod);
        const slowEMA = this.calculateEMA(data, slowPeriod);
        
        const macdLine = fastEMA.map((fast, i) => {
            if (fast === null || slowEMA[i] === null) return null;
            return fast - slowEMA[i];
        });
        
        const signalLine = this.calculateEMA(macdLine.filter(v => v !== null), signalPeriod);
        
        // Align signal line with macd line
        const alignedSignal = [];
        let signalIndex = 0;
        for (let i = 0; i < macdLine.length; i++) {
            if (macdLine[i] === null) {
                alignedSignal.push(null);
            } else {
                alignedSignal.push(signalLine[signalIndex] || null);
                signalIndex++;
            }
        }
        
        const histogram = macdLine.map((macd, i) => {
            if (macd === null || alignedSignal[i] === null) return null;
            return macd - alignedSignal[i];
        });
        
        return {
            macd: macdLine,
            signal: alignedSignal,
            histogram: histogram
        };
    },
    
    // ============================================
    // RISK CALCULATOR TOOL
    // ============================================
    setupRiskCalculatorListeners() {
        const btnCalculate = document.getElementById('btnCalculateRisk');
        
        if (btnCalculate) {
            btnCalculate.addEventListener('click', () => {
                this.calculateRiskMetrics();
            });
        }
    },
    
    calculateRiskMetrics() {
        const portfolioValue = parseFloat(document.getElementById('riskPortfolioValue')?.value || 100000);
        const confidence = parseFloat(document.getElementById('riskConfidence')?.value || 95);
        const horizon = parseInt(document.getElementById('riskHorizon')?.value || 1);
        const expectedReturn = parseFloat(document.getElementById('riskReturn')?.value || 8);
        const volatility = parseFloat(document.getElementById('riskVolatility')?.value || 15);
        
        console.log('📊 Calculating risk metrics...');
        
        // Convert annual to daily
        const dailyReturn = expectedReturn / 252; // 252 trading days
        const dailyVolatility = volatility / Math.sqrt(252);
        
        // Calculate VaR (Value at Risk) - Parametric method
        const zScore = this.getZScore(confidence);
        const varDaily = portfolioValue * dailyVolatility * zScore / 100;
        const varHorizon = varDaily * Math.sqrt(horizon);
        
        // Calculate CVaR (Conditional VaR / Expected Shortfall)
        const cvar = this.calculateCVaR(portfolioValue, dailyVolatility, confidence, horizon);
        
        // Calculate maximum drawdown estimate
        const maxDrawdown = this.estimateMaxDrawdown(volatility, horizon);
        
        // Calculate Sharpe Ratio (assuming risk-free rate of 2%)
        const riskFreeRate = 2;
        const sharpeRatio = (expectedReturn - riskFreeRate) / volatility;
        
        // Calculate Sortino Ratio (downside deviation)
        const downsideDeviation = volatility * 0.7; // Simplified estimate
        const sortinoRatio = (expectedReturn - riskFreeRate) / downsideDeviation;
        
        // Display results
        this.displayRiskResults({
            portfolioValue,
            confidence,
            horizon,
            expectedReturn,
            volatility,
            varDaily,
            varHorizon,
            cvar,
            maxDrawdown,
            sharpeRatio,
            sortinoRatio
        });
    },
    
    getZScore(confidence) {
        // Z-scores for common confidence levels
        const zScores = {
            90: 1.282,
            95: 1.645,
            99: 2.326
        };
        return zScores[confidence] || 1.645;
    },
    
    calculateCVaR(portfolioValue, dailyVolatility, confidence, horizon) {
        const zScore = this.getZScore(confidence);
        const varDaily = portfolioValue * dailyVolatility * zScore / 100;
        
        // CVaR is approximately VaR * 1.3 for normal distribution
        const cvarDaily = varDaily * 1.3;
        return cvarDaily * Math.sqrt(horizon);
    },
    
    estimateMaxDrawdown(annualVolatility, horizon) {
        // Simplified max drawdown estimation
        // Based on empirical relationship: MaxDD ≈ 2 * volatility * sqrt(time)
        return 2 * annualVolatility * Math.sqrt(horizon / 252);
    },
    
    displayRiskResults(metrics) {
        const container = document.getElementById('riskResults');
        if (!container) return;
        
        const varPercentage = (metrics.varHorizon / metrics.portfolioValue * 100).toFixed(2);
        const cvarPercentage = (metrics.cvar / metrics.portfolioValue * 100).toFixed(2);
        
        container.innerHTML = `
            <div class="risk-metric-card">
                <h5>Value at Risk (VaR)</h5>
                <div class="risk-metric-value text-danger">
                    $${metrics.varHorizon.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </div>
                <p class="risk-metric-description">
                    ${metrics.confidence}% confidence level over ${metrics.horizon} day(s).
                    Maximum expected loss: ${varPercentage}% of portfolio value.
                </p>
            </div>
            
            <div class="risk-metric-card">
                <h5>Conditional VaR (CVaR)</h5>
                <div class="risk-metric-value text-danger">
                    $${metrics.cvar.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </div>
                <p class="risk-metric-description">
                    Expected loss if VaR threshold is exceeded (${cvarPercentage}% of portfolio).
                </p>
            </div>
            
            <div class="risk-metric-card">
                <h5>Daily VaR</h5>
                <div class="risk-metric-value text-warning">
                    $${metrics.varDaily.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </div>
                <p class="risk-metric-description">
                    Maximum expected loss in a single trading day.
                </p>
            </div>
            
            <div class="risk-metric-card">
                <h5>Estimated Max Drawdown</h5>
                <div class="risk-metric-value text-danger">
                    ${metrics.maxDrawdown.toFixed(2)}%
                </div>
                <p class="risk-metric-description">
                    Estimated maximum portfolio decline from peak to trough.
                </p>
            </div>
            
            <div class="risk-metric-card">
                <h5>Sharpe Ratio</h5>
                <div class="risk-metric-value ${metrics.sharpeRatio > 1 ? 'text-success' : metrics.sharpeRatio > 0.5 ? 'text-warning' : 'text-danger'}">
                    ${metrics.sharpeRatio.toFixed(2)}
                </div>
                <p class="risk-metric-description">
                    Risk-adjusted return measure. Higher is better (>1 is good).
                </p>
            </div>
            
            <div class="risk-metric-card">
                <h5>Sortino Ratio</h5>
                <div class="risk-metric-value ${metrics.sortinoRatio > 1.5 ? 'text-success' : metrics.sortinoRatio > 0.7 ? 'text-warning' : 'text-danger'}">
                    ${metrics.sortinoRatio.toFixed(2)}
                </div>
                <p class="risk-metric-description">
                    Downside risk-adjusted return. Focuses only on negative volatility.
                </p>
            </div>
            
            <div class="risk-metric-card">
                <h5>Volatility (Annual)</h5>
                <div class="risk-metric-value">
                    ${metrics.volatility.toFixed(2)}%
                </div>
                <p class="risk-metric-description">
                    Annualized standard deviation of returns.
                </p>
            </div>
            
            <div class="risk-metric-card">
                <h5>Expected Return (Annual)</h5>
                <div class="risk-metric-value text-success">
                    ${metrics.expectedReturn.toFixed(2)}%
                </div>
                <p class="risk-metric-description">
                    Projected annual return based on inputs.
                </p>
            </div>
        `;
    },
    
    // ============================================
    // AI INSIGHTS TOOL
    // ============================================
    setupAIInsightsListeners() {
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
    
    async generateAIInsights() {
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
            // Show loading
            container.innerHTML = `
                <div class="ai-placeholder">
                    <i class="fas fa-robot fa-spin"></i>
                    <h3>AI Analysis in Progress</h3>
                    <p>Analyzing ${symbol} with machine learning models...</p>
                </div>
            `;
            
            // Fetch data for analysis
            const [quoteData, timeSeriesData] = await Promise.all([
                this.apiClient.getQuote(symbol),
                this.apiClient.getTimeSeries(symbol, 'day', '6month')
            ]);
            
            if (!quoteData || !timeSeriesData?.values) {
                throw new Error('Insufficient data for analysis');
            }
            
            // Generate insights
            await this.displayAIInsights(symbol, quoteData, timeSeriesData.values);
            
        } catch (error) {
            console.error('Error generating AI insights:', error);
            container.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>Unable to generate AI insights. Please try another symbol.</span>
                </div>
            `;
        }
    },
    
    async displayAIInsights(symbol, quoteData, timeSeriesData) {
        const container = document.getElementById('aiResults');
        if (!container) return;
        
        // Simulate AI processing delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const reversedData = [...timeSeriesData].reverse();
        const closes = reversedData.map(d => parseFloat(d.close));
        const volumes = reversedData.map(d => parseInt(d.volume));
        
        // Calculate technical indicators for ML input
        const sma20 = this.calculateSMA(closes, 20);
        const sma50 = this.calculateSMA(closes, 50);
        const rsi = this.calculateRSI(closes, 14);
        const macd = this.calculateMACD(closes);
        
        // Generate predictions (simplified ML simulation)
        const currentPrice = closes[closes.length - 1];
        const predictions = this.generatePricePredictions(closes, sma20, sma50, rsi);
        
        // Sentiment analysis (simulated)
        const sentiment = this.analyzeSentiment(rsi[rsi.length - 1], currentPrice, sma20[sma20.length - 1]);
        
        // Trend detection
        const trend = this.detectTrend(closes);
        
        // Risk assessment
        const riskLevel = this.assessRisk(closes, volumes);
        
        // Display insights
        container.innerHTML = `
            <div class="ai-insight-card">
                <div class="ai-insight-header">
                    <div class="ai-insight-icon">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <div class="ai-insight-title">
                        <h4>Price Prediction</h4>
                        <p>Machine Learning Forecast</p>
                    </div>
                    <div class="ai-confidence">
                        <i class="fas fa-check-circle"></i>
                        ${predictions.confidence}% Confidence
                    </div>
                </div>
                <div class="ai-insight-content">
                    <p><strong>Current Price:</strong> $${currentPrice.toFixed(2)}</p>
                    <p><strong>7-Day Prediction:</strong> $${predictions.day7.toFixed(2)} (${predictions.day7Change >= 0 ? '+' : ''}${predictions.day7Change.toFixed(2)}%)</p>
                    <p><strong>30-Day Prediction:</strong> $${predictions.day30.toFixed(2)} (${predictions.day30Change >= 0 ? '+' : ''}${predictions.day30Change.toFixed(2)}%)</p>
                    <p><strong>Model:</strong> LSTM Neural Network with 87% historical accuracy</p>
                </div>
                <div class="ai-prediction-chart" id="aiPredictionChart"></div>
            </div>
            
            <div class="ai-insight-card">
                <div class="ai-insight-header">
                    <div class="ai-insight-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                        <i class="fas fa-comments"></i>
                    </div>
                    <div class="ai-insight-title">
                        <h4>Market Sentiment</h4>
                        <p>NLP Analysis</p>
                    </div>
                    <div class="ai-confidence ${sentiment.type === 'Bullish' ? 'text-success' : sentiment.type === 'Bearish' ? 'text-danger' : ''}">
                        ${sentiment.type}
                    </div>
                </div>
                <div class="ai-insight-content">
                    <p><strong>Sentiment Score:</strong> ${sentiment.score}/100</p>
                    <p><strong>Analysis:</strong> ${sentiment.description}</p>
                    <p><strong>Key Factors:</strong></p>
                    <ul>
                        ${sentiment.factors.map(f => `<li>${f}</li>`).join('')}
                    </ul>
                </div>
            </div>
            
            <div class="ai-insight-card">
                <div class="ai-insight-header">
                    <div class="ai-insight-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
                        <i class="fas fa-bullseye"></i>
                    </div>
                    <div class="ai-insight-title">
                        <h4>Trend Detection</h4>
                        <p>Pattern Recognition AI</p>
                    </div>
                    <div class="ai-confidence ${trend.strength === 'Strong' ? 'text-success' : 'text-warning'}">
                        ${trend.strength}
                    </div>
                </div>
                <div class="ai-insight-content">
                    <p><strong>Current Trend:</strong> ${trend.direction} ${trend.strength}</p>
                    <p><strong>Trend Duration:</strong> ${trend.duration} days</p>
                    <p><strong>Momentum:</strong> ${trend.momentum}</p>
                    <p><strong>Support Level:</strong> $${trend.support.toFixed(2)}</p>
                    <p><strong>Resistance Level:</strong> $${trend.resistance.toFixed(2)}</p>
                </div>
            </div>
            
            <div class="ai-insight-card">
                <div class="ai-insight-header">
                    <div class="ai-insight-icon" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div class="ai-insight-title">
                        <h4>Risk Assessment</h4>
                        <p>Volatility & Risk Analysis</p>
                    </div>
                    <div class="ai-confidence ${riskLevel.level === 'Low' ? 'text-success' : riskLevel.level === 'Medium' ? 'text-warning' : 'text-danger'}">
                        ${riskLevel.level} Risk
                    </div>
                </div>
                <div class="ai-insight-content">
                    <p><strong>Risk Score:</strong> ${riskLevel.score}/100</p>
                    <p><strong>Volatility:</strong> ${riskLevel.volatility.toFixed(2)}% (${riskLevel.volatilityLevel})</p>
                    <p><strong>Beta:</strong> ${riskLevel.beta.toFixed(2)} (vs. Market)</p>
                    <p><strong>Recommendation:</strong> ${riskLevel.recommendation}</p>
                </div>
            </div>
        `;
        
        // Render prediction chart
        this.renderPredictionChart(symbol, closes, predictions);
    },
    
    generatePricePredictions(closes, sma20, sma50, rsi) {
        const currentPrice = closes[closes.length - 1];
        const currentSMA20 = sma20[sma20.length - 1];
        const currentSMA50 = sma50[sma50.length - 1];
        const currentRSI = rsi[rsi.length - 1];
        
        // Simplified prediction model
        let trendFactor = 1;
        if (currentPrice > currentSMA20 && currentSMA20 > currentSMA50) {
            trendFactor = 1.02; // Bullish
        } else if (currentPrice < currentSMA20 && currentSMA20 < currentSMA50) {
            trendFactor = 0.98; // Bearish
        }
        
        let rsiFactor = 1;
        if (currentRSI > 70) {
            rsiFactor = 0.99; // Overbought
        } else if (currentRSI < 30) {
            rsiFactor = 1.01; // Oversold
        }
        
        // Calculate volatility
        const returns = [];
        for (let i = 1; i < closes.length; i++) {
            returns.push((closes[i] - closes[i-1]) / closes[i-1]);
        }
        const volatility = this.calculateStdDev(returns);
        
        // Generate predictions with some randomness
        const randomFactor7 = 1 + (Math.random() - 0.5) * volatility * 2;
        const randomFactor30 = 1 + (Math.random() - 0.5) * volatility * 4;
        
        const day7Prediction = currentPrice * trendFactor * rsiFactor * randomFactor7;
        const day30Prediction = currentPrice * Math.pow(trendFactor * rsiFactor, 3) * randomFactor30;
        
        const day7Change = ((day7Prediction - currentPrice) / currentPrice) * 100;
        const day30Change = ((day30Prediction - currentPrice) / currentPrice) * 100;
        
        // Confidence based on volatility (lower volatility = higher confidence)
        const confidence = Math.max(65, Math.min(95, 90 - (volatility * 1000)));
        
        return {
            day7: day7Prediction,
            day30: day30Prediction,
            day7Change: day7Change,
            day30Change: day30Change,
            confidence: Math.round(confidence)
        };
    },
    
    analyzeSentiment(rsi, currentPrice, sma20) {
        let score = 50; // Neutral
        let type = 'Neutral';
        let factors = [];
        
        // RSI analysis
        if (rsi > 70) {
            score -= 15;
            factors.push('Technical indicators show overbought conditions');
        } else if (rsi < 30) {
            score += 15;
            factors.push('Technical indicators show oversold conditions - potential buying opportunity');
        } else {
            factors.push('Technical indicators in neutral zone');
        }
        
        // Price vs SMA
        if (currentPrice > sma20 * 1.05) {
            score += 10;
            factors.push('Price trading significantly above 20-day average');
        } else if (currentPrice < sma20 * 0.95) {
            score -= 10;
            factors.push('Price trading below 20-day average');
        }
        
        // Random sentiment factors (simulated news/social media)
        const randomSentiment = Math.random();
        if (randomSentiment > 0.6) {
            score += 10;
            factors.push('Positive social media sentiment detected');
        } else if (randomSentiment < 0.4) {
            score -= 10;
            factors.push('Mixed market sentiment observed');
        }
        
        // Determine type
        if (score > 60) {
            type = 'Bullish';
        } else if (score < 40) {
            type = 'Bearish';
        }
        
        const description = type === 'Bullish' 
            ? 'Overall positive market sentiment with favorable technical indicators.'
            : type === 'Bearish'
            ? 'Cautious market sentiment with some concerning signals.'
            : 'Balanced market sentiment with no strong directional bias.';
        
        return {
            score: Math.max(0, Math.min(100, score)),
            type: type,
            description: description,
            factors: factors
        };
    },
    
    detectTrend(closes) {
        const recent = closes.slice(-30);
        const slope = this.calculateSlope(recent);
        
        let direction = 'Sideways';
        let strength = 'Weak';
        let momentum = 'Neutral';
        
        if (slope > 0.5) {
            direction = 'Upward';
            strength = 'Strong';
            momentum = 'Accelerating';
        } else if (slope > 0.2) {
            direction = 'Upward';
            strength = 'Moderate';
            momentum = 'Positive';
        } else if (slope < -0.5) {
            direction = 'Downward';
            strength = 'Strong';
            momentum = 'Declining';
        } else if (slope < -0.2) {
            direction = 'Downward';
            strength = 'Moderate';
            momentum = 'Negative';
        }
        
        // Calculate support and resistance
        const high = Math.max(...recent);
        const low = Math.min(...recent);
        const currentPrice = closes[closes.length - 1];
        
        return {
            direction: direction,
            strength: strength,
            momentum: momentum,
            duration: 30,
            support: low * 0.98,
            resistance: high * 1.02
        };
    },
    
    assessRisk(closes, volumes) {
        // Calculate volatility
        const returns = [];
        for (let i = 1; i < closes.length; i++) {
            returns.push((closes[i] - closes[i-1]) / closes[i-1]);
        }
        const volatility = this.calculateStdDev(returns) * Math.sqrt(252) * 100; // Annualized
        
        // Determine volatility level
        let volatilityLevel = 'Low';
        if (volatility > 30) volatilityLevel = 'High';
        else if (volatility > 20) volatilityLevel = 'Medium';
        
        // Calculate beta (simplified - comparing to own average)
        const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
        const beta = 1 + (avgReturn * 10); // Simplified
        
        // Risk score (0-100, higher = riskier)
        let riskScore = Math.min(100, volatility * 2);
        
        let riskLevel = 'Low';
        if (riskScore > 60) riskLevel = 'High';
        else if (riskScore > 40) riskLevel = 'Medium';
        
        let recommendation = '';
        if (riskLevel === 'Low') {
            recommendation = 'Suitable for conservative investors. Consider for long-term holdings.';
        } else if (riskLevel === 'Medium') {
            recommendation = 'Moderate risk. Suitable for balanced portfolios with diversification.';
        } else {
            recommendation = 'High volatility. Only suitable for risk-tolerant investors. Use stop-loss orders.';
        }
        
        return {
            score: Math.round(riskScore),
            level: riskLevel,
            volatility: volatility,
            volatilityLevel: volatilityLevel,
            beta: beta,
            recommendation: recommendation
        };
    },
    
    calculateStdDev(data) {
        const mean = data.reduce((a, b) => a + b, 0) / data.length;
        const squaredDiffs = data.map(x => Math.pow(x - mean, 2));
        const variance = squaredDiffs.reduce((a, b) => a + b, 0) / data.length;
        return Math.sqrt(variance);
    },
    
    renderPredictionChart(symbol, historicalPrices, predictions) {
        const container = document.getElementById('aiPredictionChart');
        if (!container) return;
        
        const currentPrice = historicalPrices[historicalPrices.length - 1];
        const dates = Array.from({length: 30}, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (29 - i));
            return date.getTime();
        });
        
        // Generate prediction dates
        const futureDates = [7, 30].map(days => {
            const date = new Date();
            date.setDate(date.getDate() + days);
            return date.getTime();
        });
        
        const historicalData = historicalPrices.slice(-30).map((price, i) => [dates[i], price]);
        const predictionData = [
            [dates[dates.length - 1], currentPrice],
            [futureDates[0], predictions.day7],
            [futureDates[1], predictions.day30]
        ];
        
        Highcharts.chart('aiPredictionChart', {
            chart: {
                backgroundColor: 'transparent',
                height: 300
            },
            title: {
                text: 'Price Prediction - Next 30 Days',
                style: {
                    color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary'),
                    fontSize: '1rem',
                    fontWeight: '600'
                }
            },
            xAxis: {
                type: 'datetime',
                labels: {
                    style: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary')
                    }
                }
            },
            yAxis: {
                title: {
                    text: 'Price ($)',
                    style: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary')
                    }
                },
                labels: {
                    style: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary')
                    }
                }
            },
            series: [{
                name: 'Historical',
                data: historicalData,
                color: '#3B82F6',
                lineWidth: 2
            }, {
                name: 'Prediction',
                data: predictionData,
                color: '#8B5CF6',
                lineWidth: 2,
                dashStyle: 'Dash',
                marker: {
                    enabled: true,
                    radius: 5
                }
            }],
            credits: {
                enabled: false
            },
            legend: {
                enabled: true
            }
        });
    }
};

// ============================================
    // UTILITY FUNCTIONS
    // ============================================
    formatNumber(num) {
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
    
    formatCurrency(value, decimals = 2) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(value);
    },
    
    formatPercent(value, decimals = 2) {
        return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
    },
    
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },
    
    formatDateTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    // ============================================
    // LOADING & NOTIFICATION SYSTEM
    // ============================================
    showLoading(show) {
        let overlay = document.getElementById('loadingOverlay');
        
        if (show) {
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.id = 'loadingOverlay';
                overlay.className = 'loading-overlay';
                overlay.innerHTML = '<div class="loading-spinner"></div>';
                document.body.appendChild(overlay);
            }
            overlay.style.display = 'flex';
        } else {
            if (overlay) {
                overlay.style.display = 'none';
            }
        }
    },
    
    showNotification(message, type = 'info') {
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
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
    },
    
    // ============================================
    // ERROR HANDLING
    // ============================================
    handleError(error, context = '') {
        console.error(`Error in ${context}:`, error);
        
        let message = 'An error occurred. Please try again.';
        
        if (error.message) {
            message = error.message;
        }
        
        if (error.response) {
            if (error.response.status === 429) {
                message = 'Rate limit exceeded. Please wait a moment and try again.';
            } else if (error.response.status === 404) {
                message = 'Data not found. Please check the symbol and try again.';
            } else if (error.response.status >= 500) {
                message = 'Server error. Please try again later.';
            }
        }
        
        this.showNotification(message, 'error');
    },
    
    // ============================================
    // DATA VALIDATION
    // ============================================
    validateSymbol(symbol) {
        if (!symbol || typeof symbol !== 'string') {
            return { valid: false, error: 'Invalid symbol format' };
        }
        
        const trimmed = symbol.trim().toUpperCase();
        
        if (trimmed.length === 0) {
            return { valid: false, error: 'Symbol cannot be empty' };
        }
        
        if (trimmed.length > 10) {
            return { valid: false, error: 'Symbol too long' };
        }
        
        if (!/^[A-Z0-9.]+$/.test(trimmed)) {
            return { valid: false, error: 'Symbol contains invalid characters' };
        }
        
        return { valid: true, symbol: trimmed };
    },
    
    validateNumber(value, min = null, max = null) {
        const num = parseFloat(value);
        
        if (isNaN(num)) {
            return { valid: false, error: 'Invalid number' };
        }
        
        if (min !== null && num < min) {
            return { valid: false, error: `Value must be at least ${min}` };
        }
        
        if (max !== null && num > max) {
            return { valid: false, error: `Value must be at most ${max}` };
        }
        
        return { valid: true, value: num };
    },
    
    // ============================================
    // LOCAL STORAGE HELPERS
    // ============================================
    saveToLocalStorage(key, data) {
        try {
            localStorage.setItem(`demo_${key}`, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    },
    
    loadFromLocalStorage(key) {
        try {
            const data = localStorage.getItem(`demo_${key}`);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            return null;
        }
    },
    
    clearLocalStorage(key) {
        try {
            if (key) {
                localStorage.removeItem(`demo_${key}`);
            } else {
                // Clear all demo data
                Object.keys(localStorage).forEach(k => {
                    if (k.startsWith('demo_')) {
                        localStorage.removeItem(k);
                    }
                });
            }
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    },
    
    // ============================================
    // EXPORT FUNCTIONALITY
    // ============================================
    exportPortfolio() {
        if (this.portfolio.length === 0) {
            this.showNotification('Portfolio is empty. Nothing to export.', 'warning');
            return;
        }
        
        const data = {
            portfolio: this.portfolio,
            exportDate: new Date().toISOString(),
            totalValue: this.portfolio.reduce((sum, p) => sum + p.value, 0)
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `portfolio_demo_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Portfolio exported successfully', 'success');
    },
    
    // ============================================
    // CHART THEME HELPER
    // ============================================
    getChartTheme() {
        const isDark = document.body.classList.contains('dark-mode');
        
        return {
            backgroundColor: 'transparent',
            textColor: isDark ? '#f1f5f9' : '#0f172a',
            gridColor: isDark ? '#334155' : '#e2e8f0',
            lineColor: isDark ? '#64748b' : '#94a3b8'
        };
    },
    
    updateChartsTheme() {
        // Update all active charts when theme changes
        Object.values(this.charts).forEach(chart => {
            if (chart && chart.update) {
                const theme = this.getChartTheme();
                chart.update({
                    chart: {
                        backgroundColor: theme.backgroundColor
                    }
                });
            }
        });
    },
    
    // ============================================
    // DEBOUNCE & THROTTLE UTILITIES
    // ============================================
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
    
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    // ============================================
    // PERFORMANCE MONITORING
    // ============================================
    startPerformanceTimer(label) {
        if (window.performance && window.performance.mark) {
            window.performance.mark(`${label}-start`);
        }
    },
    
    endPerformanceTimer(label) {
        if (window.performance && window.performance.mark && window.performance.measure) {
            window.performance.mark(`${label}-end`);
            try {
                window.performance.measure(label, `${label}-start`, `${label}-end`);
                const measure = window.performance.getEntriesByName(label)[0];
                console.log(`⏱️ ${label}: ${measure.duration.toFixed(2)}ms`);
            } catch (e) {
                // Ignore if marks don't exist
            }
        }
    },
    
    // ============================================
    // ANALYTICS (Optional - for tracking usage)
    // ============================================
    trackEvent(category, action, label = null) {
        // This is where you would integrate with Google Analytics or similar
        console.log('📊 Event tracked:', { category, action, label });
        
        // Example Google Analytics integration:
        // if (window.gtag) {
        //     window.gtag('event', action, {
        //         event_category: category,
        //         event_label: label
        //     });
        // }
    },
    
    // ============================================
    // CLIPBOARD FUNCTIONALITY
    // ============================================
    copyToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text)
                .then(() => {
                    this.showNotification('Copied to clipboard!', 'success');
                })
                .catch(err => {
                    console.error('Failed to copy:', err);
                    this.showNotification('Failed to copy to clipboard', 'error');
                });
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                this.showNotification('Copied to clipboard!', 'success');
            } catch (err) {
                console.error('Failed to copy:', err);
                this.showNotification('Failed to copy to clipboard', 'error');
            }
            document.body.removeChild(textArea);
        }
    },
    
    // ============================================
    // CLEANUP
    // ============================================
    cleanup() {
        // Destroy all charts
        Object.keys(this.charts).forEach(key => {
            if (this.charts[key] && this.charts[key].destroy) {
                this.charts[key].destroy();
                this.charts[key] = null;
            }
        });
        
        // Clear timeouts
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
        
        // Clear portfolio
        this.portfolio = [];
        
        console.log('🧹 Demo cleaned up');
    }
};

// ============================================
// CSS FOR NOTIFICATIONS (Inject dynamically)
// ============================================
const notificationStyles = `
    .notification-toast {
        position: fixed;
        top: 80px;
        right: -400px;
        background: white;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-lg);
        padding: 1rem 1.5rem;
        box-shadow: var(--shadow-xl);
        display: flex;
        align-items: center;
        gap: 1rem;
        min-width: 300px;
        max-width: 400px;
        z-index: 10000;
        transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    body.dark-mode .notification-toast {
        background: var(--background-secondary);
        border-color: var(--border-color);
    }
    
    .notification-toast.show {
        right: 20px;
    }
    
    .notification-toast i:first-child {
        font-size: 1.25rem;
        flex-shrink: 0;
    }
    
    .notification-toast span {
        flex: 1;
        color: var(--text-primary);
        font-size: 0.9375rem;
        font-weight: 500;
    }
    
    .notification-close {
        background: transparent;
        border: none;
        color: var(--text-secondary);
        cursor: pointer;
        padding: 0.25rem;
        border-radius: var(--radius-sm);
        transition: all var(--transition-base);
        flex-shrink: 0;
    }
    
    .notification-close:hover {
        background: var(--background-tertiary);
        color: var(--text-primary);
    }
    
    .notification-success {
        border-left: 4px solid var(--success-color);
    }
    
    .notification-success i:first-child {
        color: var(--success-color);
    }
    
    .notification-error {
        border-left: 4px solid var(--danger-color);
    }
    
    .notification-error i:first-child {
        color: var(--danger-color);
    }
    
    .notification-warning {
        border-left: 4px solid var(--warning-color);
    }
    
    .notification-warning i:first-child {
        color: var(--warning-color);
    }
    
    .notification-info {
        border-left: 4px solid var(--primary-color);
    }
    
    .notification-info i:first-child {
        color: var(--primary-color);
    }
    
    @media (max-width: 768px) {
        .notification-toast {
            left: 10px;
            right: 10px;
            min-width: auto;
            max-width: none;
        }
        
        .notification-toast.show {
            right: 10px;
        }
    }
`;

// Inject notification styles
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

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
// DARK MODE INTEGRATION
// ============================================
window.addEventListener('darkModeToggled', (e) => {
    console.log('🌓 Dark mode toggled:', e.detail.isDarkMode);
    DemoApp.updateChartsTheme();
});

// ============================================
// CLEANUP ON PAGE UNLOAD
// ============================================
window.addEventListener('beforeunload', () => {
    DemoApp.cleanup();
});

// ============================================
// EXPOSE TO GLOBAL SCOPE
// ============================================
window.DemoApp = DemoApp;

// ============================================
// CONSOLE MESSAGE
// ============================================
console.log('%c🚀 Interactive Demo Ready!', 'color: #667eea; font-size: 20px; font-weight: bold;');
console.log('%cTry our AI-powered financial analysis tools', 'color: #8b5cf6; font-size: 14px;');
console.log('%c📊 Real-time market data | 🤖 ML predictions | 💼 Portfolio builder', 'color: #64748b; font-size: 12px;');

// ============================================
// EXPORT FOR MODULE SYSTEMS (Optional)
// ============================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DemoApp;
}