/* ============================================
   INTERACTIVE-DEMO.JS - VERSION LEGAL COMPLIANT
   ✅ DONNÉES FICTIVES UNIQUEMENT (PAS DE REDISTRIBUTION D'API)
   ✅ DISCLAIMERS CLAIRS SUR TOUTES LES SECTIONS
   ============================================ */

console.log('🔍 Loading interactive-demo.js LEGAL COMPLIANT VERSION...');

// ============================================
// ⚠ GÉNÉRATEUR DE DONNÉES FICTIVES
// ============================================
const DemoDataGenerator = {
    // Génère un prix aléatoire réaliste
    generatePrice: function(min = 10, max = 500) {
        return (Math.random() * (max - min) + min).toFixed(2);
    },
    
    // Génère un changement de prix
    generateChange: function(price) {
        const changePercent = (Math.random() - 0.5) * 10; // -5% à +5%
        const change = (price * changePercent / 100).toFixed(2);
        return {
            change: parseFloat(change),
            percentChange: changePercent.toFixed(2)
        };
    },
    
    // Génère des données OHLCV fictives
    generateOHLCV: function(days = 90, basePrice = 150) {
        const data = [];
        let currentPrice = basePrice;
        const now = new Date();
        
        for (let i = days; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            
            const volatility = currentPrice * 0.02;
            const open = currentPrice + (Math.random() - 0.5) * volatility;
            const close = open + (Math.random() - 0.5) * volatility;
            const high = Math.max(open, close) + Math.random() * volatility * 0.5;
            const low = Math.min(open, close) - Math.random() * volatility * 0.5;
            const volume = Math.floor(Math.random() * 10000000) + 1000000;
            
            data.push({
                datetime: date.toISOString(),
                timestamp: date.getTime(),
                open: parseFloat(open.toFixed(2)),
                high: parseFloat(high.toFixed(2)),
                low: parseFloat(low.toFixed(2)),
                close: parseFloat(close.toFixed(2)),
                volume: volume
            });
            
            currentPrice = close;
        }
        
        return data;
    },
    
    // Génère des données de quote fictives
    generateQuote: function(symbol) {
        const price = this.generatePrice();
        const changeData = this.generateChange(price);
        
        return {
            symbol: symbol,
            name: `${symbol} Corporation (DEMO)`,
            exchange: 'DEMO EXCHANGE',
            currency: 'USD',
            price: parseFloat(price),
            close: parseFloat(price),
            open: parseFloat((price * (1 + (Math.random() - 0.5) * 0.02)).toFixed(2)),
            high: parseFloat((price * (1 + Math.random() * 0.03)).toFixed(2)),
            low: parseFloat((price * (1 - Math.random() * 0.03)).toFixed(2)),
            volume: Math.floor(Math.random() * 50000000) + 5000000,
            change: changeData.change,
            percent_change: parseFloat(changeData.percentChange),
            percentChange: parseFloat(changeData.percentChange),
            is_demo: true
        };
    }
};

// ============================================
// CONFIGURATION & GLOBAL STATE
// ============================================
const DemoApp = {
    apiClient: null,
    activeTool: 'company-search',
    searchTimeout: null,
    selectedSuggestionIndex: -1,
    currentTechnicalSymbol: null,
    currentCompanySymbol: null,
    portfolio: [],
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
    
    isMobile: function() {
        return window.innerWidth <= 768;
    },
    
    wrapChartInScrollContainer: function(chartId) {
        const chartElement = document.getElementById(chartId);
        if (!chartElement || chartElement.parentElement.classList.contains('chart-scroll-wrapper')) {
            return;
        }
        
        const wrapper = document.createElement('div');
        wrapper.className = 'chart-scroll-wrapper';
        
        const container = document.createElement('div');
        container.className = 'chart-scroll-container';
        container.id = chartId + '-container';
        
        chartElement.parentNode.insertBefore(wrapper, chartElement);
        wrapper.appendChild(container);
        container.appendChild(chartElement);
        
        console.log(`📱 Wrapped chart ${chartId} in scroll container`);
    },
    
    getResponsiveChartConfig: function() {
        const isMobile = this.isMobile();
        
        return {
            chart: {
                backgroundColor: 'transparent',
                height: isMobile ? 250 : 400,
                width: null,
                style: {
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                }
            },
            title: {
                style: {
                    color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary'),
                    fontSize: isMobile ? '0.875rem' : '1.125rem',
                    fontWeight: '700'
                }
            },
            credits: { enabled: false },
            legend: {
                enabled: true,
                itemStyle: {
                    color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary'),
                    fontSize: isMobile ? '0.75rem' : '0.875rem'
                }
            },
            xAxis: {
                labels: {
                    style: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary'),
                        fontSize: isMobile ? '0.625rem' : '0.75rem'
                    }
                }
            },
            yAxis: {
                labels: {
                    style: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary'),
                        fontSize: isMobile ? '0.625rem' : '0.75rem'
                    }
                },
                title: {
                    style: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary'),
                        fontSize: isMobile ? '0.75rem' : '0.875rem'
                    }
                }
            },
            tooltip: {
                backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--background-primary'),
                style: {
                    color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary'),
                    fontSize: isMobile ? '0.75rem' : '0.875rem'
                }
            },
            rangeSelector: {
                enabled: !isMobile,
                buttonTheme: {
                    style: {
                        fontSize: isMobile ? '0.625rem' : '0.75rem'
                    }
                }
            },
            navigator: {
                enabled: !isMobile
            },
            scrollbar: {
                enabled: !isMobile
            }
        };
    },
    
    init: function() {
        try {
            console.log('🚀 Initializing Interactive Demo LEGAL COMPLIANT VERSION...');
            
            // ⚠ PAS D'INITIALISATION D'API CLIENT RÉEL
            console.log('⚠ DEMO MODE: Using simulated data only');
            
            this.setupEventListeners();
            this.switchTool('company-search');
            this.setupResizeListener();
            
            // Afficher un disclaimer global
            this.showGlobalDisclaimer();
            
            console.log('✅ Interactive Demo LEGAL COMPLIANT VERSION initialized!');
            
        } catch (error) {
            console.error('❌ Initialization error:', error);
            this.showNotification('Failed to initialize demo. Please refresh the page.', 'error');
        }
    },
    
    showGlobalDisclaimer: function() {
        const disclaimer = document.createElement('div');
        disclaimer.className = 'global-demo-disclaimer';
        disclaimer.innerHTML = `
            <i class="fas fa-info-circle"></i>
            <span><strong>DEMO MODE:</strong> All data shown is simulated for demonstration purposes only. Not real market data.</span>
            <button onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        document.body.appendChild(disclaimer);
        
        setTimeout(() => {
            disclaimer.classList.add('show');
        }, 100);
    },
    
    setupResizeListener: function() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                console.log('📱 Window resized, updating charts...');
                this.reflowAllCharts();
            }, 250);
        });
    },
    
    reflowAllCharts: function() {
        Object.keys(this.charts).forEach(key => {
            if (this.charts[key] && this.charts[key].reflow) {
                this.charts[key].reflow();
            }
        });
    },
    
    setupEventListeners: function() {
        document.querySelectorAll('.tool-card').forEach(card => {
            card.addEventListener('click', () => {
                const tool = card.dataset.tool;
                this.switchTool(tool);
            });
        });
        
        this.setupCompanySearchListeners();
        this.setupLiveQuotesListeners();
        this.setupPortfolioListeners();
        this.setupTechnicalListeners();
        this.setupRiskCalculatorListeners();
        this.setupAIInsightsListeners();
    },
    
    switchTool: function(toolName) {
        console.log('🔄 Switching to tool:', toolName);
        
        this.activeTool = toolName;
        
        document.querySelectorAll('.tool-card').forEach(card => {
            if (card.dataset.tool === toolName) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });
        
        document.querySelectorAll('.demo-tool').forEach(tool => {
            if (tool.id === `tool-${toolName}`) {
                tool.classList.add('active');
            } else {
                tool.classList.remove('active');
            }
        });
        
        const toolElement = document.getElementById(`tool-${toolName}`);
        if (toolElement) {
            toolElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    },
    
    // ============================================
    // COMPANY SEARCH - DONNÉES FICTIVES
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
        
        document.querySelectorAll('.popular-tag').forEach(tag => {
            tag.addEventListener('click', () => {
                const symbol = tag.dataset.symbol;
                if (input) input.value = symbol;
                this.searchCompany(symbol);
            });
        });
        
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
    
    // ⚠ RECHERCHE DE SYMBOLES - DONNÉES FICTIVES
    searchSymbols: function(query) {
        console.log('🔍 Searching for (DEMO):', query);
        
        const container = document.getElementById('searchSuggestions');
        if (!container) return;
        
        container.innerHTML = '<div class="suggestion-loading"><i class="fas fa-spinner fa-spin"></i> Searching demo database...</div>';
        container.classList.add('active');
        
        // Simuler un délai de recherche
        setTimeout(() => {
            const demoResults = this.generateDemoSearchResults(query);
            this.displaySearchSuggestions(demoResults, query);
        }, 500);
    },
    
    // Génère des résultats de recherche fictifs
    generateDemoSearchResults: function(query) {
        const results = [];
        const queryUpper = query.toUpperCase();
        
        // Quelques symboles de démo
        const demoSymbols = [
            { symbol: 'DEMO', name: 'Demo Corporation', type: 'Common Stock', exchange: 'DEMO' },
            { symbol: 'TEST', name: 'Test Industries Inc', type: 'Common Stock', exchange: 'DEMO' },
            { symbol: 'SAMPLE', name: 'Sample Tech Group', type: 'Common Stock', exchange: 'DEMO' },
            { symbol: 'MOCK', name: 'Mock Financial Services', type: 'Common Stock', exchange: 'DEMO' },
            { symbol: 'FICTO', name: 'Fictional Energy Ltd', type: 'Common Stock', exchange: 'DEMO' },
            { symbol: 'SIMUL', name: 'Simulated Healthcare', type: 'Common Stock', exchange: 'DEMO' }
        ];
        
        // Filtrer selon la requête
        demoSymbols.forEach(item => {
            if (item.symbol.includes(queryUpper) || item.name.toUpperCase().includes(queryUpper)) {
                results.push({
                    symbol: item.symbol,
                    instrument_name: item.name,
                    instrument_type: item.type,
                    exchange: item.exchange
                });
            }
        });
        
        // Si aucun résultat, créer un résultat fictif basé sur la requête
        if (results.length === 0) {
            results.push({
                symbol: queryUpper.substring(0, 5),
                instrument_name: `${query} Demo Company`,
                instrument_type: 'Common Stock',
                exchange: 'DEMO'
            });
        }
        
        return results;
    },
    
    displaySearchSuggestions: function(results, query) {
        const container = document.getElementById('searchSuggestions');
        if (!container) return;
        
        let html = '<div class="suggestion-category"><i class="fas fa-flask"></i> Demo Stocks</div>';
        
        results.forEach(item => {
            const symbol = this.escapeHtml(item.symbol);
            const name = this.escapeHtml(item.instrument_name || item.symbol);
            
            const highlightedSymbol = this.highlightMatch(symbol, query);
            const highlightedName = this.highlightMatch(name, query);
            
            html += `
                <div class="suggestion-item" data-symbol="${symbol}">
                    <div class="suggestion-icon tech">
                        ${symbol.substring(0, 2)}
                    </div>
                    <div class="suggestion-info">
                        <div class="suggestion-symbol">${highlightedSymbol} <span class="demo-badge-inline">DEMO</span></div>
                        <div class="suggestion-name">${highlightedName}</div>
                    </div>
                    <div class="suggestion-exchange">DEMO</div>
                </div>
            `;
        });
        
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
    },
    
    highlightMatch: function(text, query) {
        if (!text || !query) return text;
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    },
    
    hideSuggestions: function() {
        const container = document.getElementById('searchSuggestions');
        if (!container) return;
        
        container.classList.remove('active');
        this.selectedSuggestionIndex = -1;
    },
    
    selectCompany: function(symbol) {
        console.log('✅ Selected company (DEMO):', symbol);
        
        const input = document.getElementById('companySearchInput');
        if (input) {
            input.value = symbol;
        }
        
        this.hideSuggestions();
        this.searchCompany(symbol);
    },
    
    // ⚠ RECHERCHE ENTREPRISE - DONNÉES FICTIVES UNIQUEMENT
    searchCompany: function(symbol) {
        if (!symbol || symbol.trim() === '') {
            this.showNotification('Please enter a ticker symbol or company name', 'warning');
            return;
        }
        
        const trimmedSymbol = symbol.trim().toUpperCase();
        console.log('🔍 Searching company (DEMO):', trimmedSymbol);
        
        this.currentCompanySymbol = trimmedSymbol;
        
        const container = document.getElementById('searchResultsContainer');
        if (!container) return;
        
        container.innerHTML = `
            <div class="results-placeholder">
                <i class="fas fa-spinner fa-spin"></i>
                <h3>Loading demo company data...</h3>
                <p>Please wait...</p>
            </div>
        `;
        
        // Simuler un délai de chargement
        setTimeout(() => {
            // ⚠ GÉNÉRER DES DONNÉES FICTIVES
            const quoteData = DemoDataGenerator.generateQuote(trimmedSymbol);
            this.displayCompanyResults(quoteData);
            this.loadCompanyExtraCharts(trimmedSymbol);
        }, 800);
    },
    
    displayCompanyResults: function(quoteData) {
        const container = document.getElementById('searchResultsContainer');
        if (!container) return;
        
        const currentPrice = quoteData.close || quoteData.price || 0;
        const change = quoteData.change || 0;
        const percentChange = quoteData.percent_change || quoteData.percentChange || 0;
        const isPositive = change >= 0;
        
        container.innerHTML = `
            <div class="demo-data-disclaimer">
                <i class="fas fa-exclamation-triangle"></i>
                <strong>SIMULATED DATA:</strong> All values below are randomly generated for demonstration purposes only.
            </div>
            
            <div class="company-result-card highlight">
                <div class="company-result-header">
                    <div class="company-avatar">
                        <span>${quoteData.symbol.substring(0, 2)}</span>
                    </div>
                    <div class="company-details">
                        <h4>${this.escapeHtml(quoteData.name || quoteData.symbol)} <span class="demo-badge-inline">DEMO</span></h4>
                        <p>${this.escapeHtml(quoteData.exchange || 'DEMO')} • ${this.escapeHtml(quoteData.currency || 'USD')}</p>
                    </div>
                    <div class="quote-change ${isPositive ? 'positive' : 'negative'}">
                        <i class="fas fa-${isPositive ? 'arrow-up' : 'arrow-down'}"></i>
                        ${percentChange.toFixed(2)}%
                    </div>
                </div>
                
                <div style="margin: 1.5rem 0;">
                    <div style="font-size: 2.5rem; font-weight: 800; color: var(--text-primary);">
                        $${currentPrice.toFixed(2)} <span class="demo-watermark">DEMO</span>
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
        
        this.showNotification(`✅ Loaded DEMO data for ${quoteData.symbol}`, 'success');
    },
    
    loadCompanyExtraCharts: function(symbol) {
        console.log('📊 Loading extra charts (DEMO) for:', symbol);
        
        const chartsContainer = document.getElementById('companyExtraCharts');
        if (!chartsContainer) return;
        
        chartsContainer.style.display = 'block';
        
        // ⚠ GÉNÉRER DES DONNÉES FICTIVES
        const timeSeriesData = DemoDataGenerator.generateOHLCV(90);
        
        this.wrapChartInScrollContainer('companyPerformanceChart');
        this.wrapChartInScrollContainer('companyRatingsChart');
        
        this.renderCompanyPerformanceChart(symbol, timeSeriesData);
        this.renderCompanyRatingsChart(symbol);
    },

    renderCompanyPerformanceChart: function(symbol, data) {
        if (this.charts.companyPerformance) {
            this.charts.companyPerformance.destroy();
        }
        
        const sortedData = [...data].sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
        
        const firstPrice = parseFloat(sortedData[0].close);
        const stockPerformance = sortedData.map(d => ({
            x: new Date(d.datetime).getTime(),
            y: (parseFloat(d.close) / firstPrice - 1) * 100
        }));
        
        const sp500Performance = sortedData.map((d, i) => ({
            x: new Date(d.datetime).getTime(),
            y: (Math.random() - 0.5) * 10 + i * 0.1
        }));
        
        const baseConfig = this.getResponsiveChartConfig();
        
        this.charts.companyPerformance = Highcharts.chart('companyPerformanceChart', Object.assign({}, baseConfig, {
            title: {
                text: `${symbol} vs Market Performance (DEMO DATA)`,
                style: baseConfig.title.style
            },
            subtitle: {
                text: '⚠ Simulated data for demonstration only',
                style: {
                    color: '#f59e0b',
                    fontSize: '0.75rem'
                }
            },
            xAxis: Object.assign({}, baseConfig.xAxis, {
                type: 'datetime'
            }),
            yAxis: Object.assign({}, baseConfig.yAxis, {
                title: {
                    text: 'Performance (%)',
                    style: baseConfig.yAxis.title.style
                },
                labels: {
                    format: '{value}%',
                    style: baseConfig.yAxis.labels.style
                },
                plotLines: [{
                    value: 0,
                    color: '#64748b',
                    width: 1,
                    dashStyle: 'Dash'
                }]
            }),
            tooltip: {
                shared: true,
                valueDecimals: 2,
                valueSuffix: '%'
            },
            series: [{
                name: symbol + ' (DEMO)',
                data: stockPerformance,
                color: '#3B82F6',
                lineWidth: this.isMobile() ? 2 : 3
            }, {
                name: 'Market (DEMO)',
                data: sp500Performance,
                color: '#94A3B8',
                lineWidth: this.isMobile() ? 1.5 : 2,
                dashStyle: 'Dash'
            }]
        }));
    },
    
    renderCompanyRatingsChart: function(symbol) {
        if (this.charts.companyRatings) {
            this.charts.companyRatings.destroy();
        }
        
        // ⚠ DONNÉES FICTIVES ALÉATOIRES
        const ratings = [
            { name: 'Strong Buy', y: Math.floor(Math.random() * 15), color: '#10B981' },
            { name: 'Buy', y: Math.floor(Math.random() * 10), color: '#34D399' },
            { name: 'Hold', y: Math.floor(Math.random() * 8), color: '#FCD34D' },
            { name: 'Sell', y: Math.floor(Math.random() * 5), color: '#FB923C' },
            { name: 'Strong Sell', y: Math.floor(Math.random() * 3), color: '#EF4444' }
        ];
        
        const baseConfig = this.getResponsiveChartConfig();
        
        this.charts.companyRatings = Highcharts.chart('companyRatingsChart', Object.assign({}, baseConfig, {
            chart: Object.assign({}, baseConfig.chart, {
                type: 'bar'
            }),
            title: {
                text: `${symbol} Analyst Ratings (DEMO DATA)`,
                style: baseConfig.title.style
            },
            subtitle: {
                text: '⚠ Simulated data for demonstration only',
                style: {
                    color: '#f59e0b',
                    fontSize: '0.75rem'
                }
            },
            xAxis: Object.assign({}, baseConfig.xAxis, {
                categories: ratings.map(r => r.name)
            }),
            yAxis: Object.assign({}, baseConfig.yAxis, {
                min: 0,
                title: {
                    text: 'Analysts',
                    style: baseConfig.yAxis.title.style
                }
            }),
            legend: {
                enabled: false
            },
            tooltip: {
                valueSuffix: ' analysts (DEMO)'
            },
            plotOptions: {
                bar: {
                    dataLabels: {
                        enabled: !this.isMobile(),
                        style: {
                            color: '#fff',
                            textOutline: 'none',
                            fontSize: this.isMobile() ? '0.625rem' : '0.75rem'
                        }
                    }
                }
            },
            series: [{
                name: 'Analysts',
                data: ratings,
                colorByPoint: true
            }]
        }));
    },

    // ============================================
    // LIVE QUOTES - DONNÉES FICTIVES
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
    
    loadLiveQuote: function(symbol) {
        if (!symbol || symbol.trim() === '') {
            this.showNotification('Please enter a ticker symbol', 'warning');
            return;
        }
        
        const trimmedSymbol = symbol.trim().toUpperCase();
        console.log('📊 Loading live quote (DEMO) for:', trimmedSymbol);
        
        const container = document.getElementById('quoteDisplay');
        if (!container) return;
        
        container.innerHTML = `
            <div class="quote-placeholder">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading demo quote data...</p>
            </div>
        `;
        
        setTimeout(() => {
            // ⚠ DONNÉES FICTIVES
            const quoteData = DemoDataGenerator.generateQuote(trimmedSymbol);
            this.displayLiveQuote(quoteData);
            
            this.wrapChartInScrollContainer('liveQuoteChart');
            this.wrapChartInScrollContainer('sentimentGauge');
            
            this.loadQuoteChart(trimmedSymbol);
            this.renderMarketSentiment(trimmedSymbol, quoteData);
        }, 800);
    },
    
    displayLiveQuote: function(quoteData) {
        const container = document.getElementById('quoteDisplay');
        if (!container) return;
        
        const currentPrice = quoteData.close || quoteData.price || 0;
        const change = quoteData.change || 0;
        const percentChange = quoteData.percent_change || quoteData.percentChange || 0;
        const isPositive = change >= 0;
        
        container.innerHTML = `
            <div class="demo-data-disclaimer">
                <i class="fas fa-exclamation-triangle"></i>
                <strong>SIMULATED DATA:</strong> All quotes are randomly generated for demonstration purposes only.
            </div>
            
            <div class="quote-header">
                <div class="quote-symbol">${quoteData.symbol} <span class="demo-badge-inline">DEMO</span></div>
                <div class="quote-name">${this.escapeHtml(quoteData.name || 'N/A')}</div>
            </div>
            
            <div class="quote-main-info">
                <div class="quote-price">$${currentPrice.toFixed(2)} <span class="demo-watermark">DEMO</span></div>
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
    
    loadQuoteChart: function(symbol) {
        // ⚠ DONNÉES FICTIVES
        const timeSeriesData = DemoDataGenerator.generateOHLCV(90);
        this.renderQuoteChart(timeSeriesData, symbol);
    },
    
    renderQuoteChart: function(data, symbol) {
        if (this.charts.liveQuote) {
            this.charts.liveQuote.destroy();
        }
        
        const dates = data.map(d => new Date(d.datetime).getTime());
        const prices = data.map(d => parseFloat(d.close));
        
        const baseConfig = this.getResponsiveChartConfig();
        
        this.charts.liveQuote = Highcharts.stockChart('liveQuoteChart', Object.assign({}, baseConfig, {
            title: {
                text: `${symbol} - Price History (DEMO DATA)`,
                style: baseConfig.title.style
            },
            subtitle: {
                text: '⚠ Simulated data for demonstration only',
                style: {
                    color: '#f59e0b',
                    fontSize: '0.75rem'
                }
            },
            series: [{
                name: 'Price (DEMO)',
                data: dates.map((date, i) => [date, prices[i]]),
                color: '#3B82F6',
                lineWidth: this.isMobile() ? 2 : 2,
                fillColor: {
                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                    stops: [
                        [0, 'rgba(59, 130, 246, 0.3)'],
                        [1, 'rgba(59, 130, 246, 0.05)']
                    ]
                }
            }]
        }));
    },
    
    renderMarketSentiment: function(symbol, quoteData) {
        const container = document.getElementById('marketSentiment');
        if (!container) return;
        
        container.style.display = 'block';
        
        if (this.charts.sentimentGauge) {
            this.charts.sentimentGauge.destroy();
        }
        
        // ⚠ SENTIMENT FICTIF
        const percentChange = quoteData.percent_change || quoteData.percentChange || 0;
        let sentimentScore = 50 + (percentChange * 5);
        sentimentScore = Math.max(0, Math.min(100, sentimentScore));
        
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
        
        const baseConfig = this.getResponsiveChartConfig();
        const isMobile = this.isMobile();
        
        this.charts.sentimentGauge = Highcharts.chart('sentimentGauge', Object.assign({}, baseConfig, {
            chart: Object.assign({}, baseConfig.chart, {
                type: 'solidgauge',
                height: isMobile ? 200 : 250
            }),
            title: {
                text: `${symbol} Market Sentiment (DEMO)`,
                style: baseConfig.title.style
            },
            subtitle: {
                text: '⚠ Simulated sentiment score',
                style: {
                    color: '#f59e0b',
                    fontSize: '0.75rem'
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
                    [0.3, '#EF4444'],
                    [0.5, '#FCD34D'],
                    [0.7, '#10B981']
                ],
                lineWidth: 0,
                tickWidth: 0,
                minorTickInterval: null,
                tickAmount: 2,
                labels: {
                    y: 16,
                    style: baseConfig.yAxis.labels.style
                }
            },
            plotOptions: {
                solidgauge: {
                    dataLabels: {
                        y: isMobile ? -15 : -25,
                        borderWidth: 0,
                        useHTML: true
                    }
                }
            },
            series: [{
                name: 'Sentiment',
                data: [Math.round(sentimentScore)],
                dataLabels: {
                    format: `<div style="text-align:center">
                        <span style="font-size:${isMobile ? '1.5rem' : '2rem'};font-weight:bold;color:${sentimentColor}">{y}</span><br/>
                        <span style="font-size:${isMobile ? '0.75rem' : '0.875rem'};color:var(--text-secondary)">${sentimentLabel}</span>
                    </div>`
                }
            }]
        }));
    },
    
    // ... (Le reste du code continue avec la même approche : remplacer toutes les données API par des données générées par DemoDataGenerator)
    
    // POURSUIVRE AVEC LE MÊME PATTERN POUR :
    // - Portfolio Builder
    // - Technical Analysis
    // - Risk Calculator
    // - AI Insights
    
    // Exemple pour Portfolio :
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
    
    addToPortfolio: function() {
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
        
        // ⚠ GÉNÉRER PRIX FICTIF
        const demoPrice = parseFloat(DemoDataGenerator.generatePrice());
        
        const holding = {
            symbol: symbol,
            name: `${symbol} Corporation (DEMO)`,
            shares: shares,
            price: demoPrice,
            value: shares * demoPrice
        };
        
        this.portfolio.push(holding);
        
        symbolInput.value = '';
        sharesInput.value = '';
        
        this.updatePortfolioDisplay();
        
        if (this.portfolio.length >= 2) {
            this.wrapChartInScrollContainer('correlationHeatmap');
            this.wrapChartInScrollContainer('portfolioPerformanceChart');
            
            this.loadPortfolioAdvancedCharts();
        }
        
        this.showNotification(`✅ ${symbol} added to portfolio (DEMO DATA)`, 'success');
    },
    
    // UTILITY FUNCTIONS
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
        
        const existing = document.querySelectorAll('.notification-toast');
        existing.forEach(n => n.remove());
        
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
    
};

// INITIALIZE ON DOM READY
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        DemoApp.init();
    });
} else {
    DemoApp.init();
}

window.DemoApp = DemoApp;

console.log('%c✅ LEGAL COMPLIANT VERSION - All data is simulated!', 'color: #10b981; font-size: 16px; font-weight: bold;');