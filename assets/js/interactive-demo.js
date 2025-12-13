/* ============================================
   INTERACTIVE-DEMO.JS - VERSION LEGAL COMPLIANT COMPLÈTE
   ✅ TOUTES LES FONCTIONS IMPLÉMENTÉES
   ============================================ */

console.log('🔍 Loading interactive-demo.js LEGAL COMPLIANT VERSION...');

// ============================================
// ⚠ GÉNÉRATEUR DE DONNÉES FICTIVES
// ============================================
const DemoDataGenerator = {
    generatePrice: function(min = 10, max = 500) {
        return (Math.random() * (max - min) + min).toFixed(2);
    },
    
    generateChange: function(price) {
        const changePercent = (Math.random() - 0.5) * 10;
        const change = (price * changePercent / 100).toFixed(2);
        return {
            change: parseFloat(change),
            percentChange: changePercent.toFixed(2)
        };
    },
    
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
// APPLICATION PRINCIPALE
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
            
            console.log('⚠ DEMO MODE: Using simulated data only');
            
            this.setupEventListeners();
            this.switchTool('company-search');
            this.setupResizeListener();
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
    // COMPANY SEARCH
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
                    this.searchCompany(input.value);
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
        
        document.querySelectorAll('.popular-tag').forEach(tag => {
            tag.addEventListener('click', () => {
                const symbol = tag.dataset.symbol;
                if (input) input.value = symbol;
                this.searchCompany(symbol);
            });
        });
    },
    
    handleCompanySearch: function(query) {
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
    
    searchSymbols: function(query) {
        const container = document.getElementById('searchSuggestions');
        if (!container) return;
        
        container.innerHTML = '<div class="suggestion-loading"><i class="fas fa-spinner fa-spin"></i> Searching...</div>';
        container.classList.add('active');
        
        setTimeout(() => {
            const demoResults = this.generateDemoSearchResults(query);
            this.displaySearchSuggestions(demoResults, query);
        }, 300);
    },
    
    generateDemoSearchResults: function(query) {
        const results = [];
        const queryUpper = query.toUpperCase();
        
        const demoSymbols = [
            { symbol: 'DEMO', name: 'Demo Corporation', type: 'Common Stock' },
            { symbol: 'TEST', name: 'Test Industries Inc', type: 'Common Stock' },
            { symbol: 'SAMPLE', name: 'Sample Tech Group', type: 'Common Stock' }
        ];
        
        demoSymbols.forEach(item => {
            if (item.symbol.includes(queryUpper) || item.name.toUpperCase().includes(queryUpper)) {
                results.push({
                    symbol: item.symbol,
                    instrument_name: item.name,
                    instrument_type: item.type,
                    exchange: 'DEMO'
                });
            }
        });
        
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
            
            html += `
                <div class="suggestion-item" data-symbol="${symbol}">
                    <div class="suggestion-icon tech">${symbol.substring(0, 2)}</div>
                    <div class="suggestion-info">
                        <div class="suggestion-symbol">${symbol} <span class="demo-badge-inline">DEMO</span></div>
                        <div class="suggestion-name">${name}</div>
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
        });
    },
    
    hideSuggestions: function() {
        const container = document.getElementById('searchSuggestions');
        if (container) {
            container.classList.remove('active');
        }
    },
    
    selectCompany: function(symbol) {
        const input = document.getElementById('companySearchInput');
        if (input) {
            input.value = symbol;
        }
        this.hideSuggestions();
        this.searchCompany(symbol);
    },
    
    searchCompany: function(symbol) {
        if (!symbol || symbol.trim() === '') {
            this.showNotification('Please enter a ticker symbol', 'warning');
            return;
        }
        
        const trimmedSymbol = symbol.trim().toUpperCase();
        this.currentCompanySymbol = trimmedSymbol;
        
        const container = document.getElementById('searchResultsContainer');
        if (!container) return;
        
        container.innerHTML = `
            <div class="results-placeholder">
                <i class="fas fa-spinner fa-spin"></i>
                <h3>Loading demo data...</h3>
            </div>
        `;
        
        setTimeout(() => {
            const quoteData = DemoDataGenerator.generateQuote(trimmedSymbol);
            this.displayCompanyResults(quoteData);
            this.loadCompanyExtraCharts(trimmedSymbol);
        }, 500);
    },
    
    displayCompanyResults: function(quoteData) {
        const container = document.getElementById('searchResultsContainer');
        if (!container) return;
        
        const currentPrice = quoteData.close || 0;
        const change = quoteData.change || 0;
        const percentChange = quoteData.percent_change || 0;
        const isPositive = change >= 0;
        
        container.innerHTML = `
            <div class="demo-data-disclaimer">
                <i class="fas fa-exclamation-triangle"></i>
                <strong>SIMULATED DATA:</strong> All values are randomly generated for demonstration only.
            </div>
            
            <div class="company-result-card highlight">
                <div class="company-result-header">
                    <div class="company-avatar"><span>${quoteData.symbol.substring(0, 2)}</span></div>
                    <div class="company-details">
                        <h4>${this.escapeHtml(quoteData.name)} <span class="demo-badge-inline">DEMO</span></h4>
                        <p>${quoteData.exchange} • ${quoteData.currency}</p>
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
                        <span class="metric-value">$${quoteData.open.toFixed(2)}</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">High</span>
                        <span class="metric-value">$${quoteData.high.toFixed(2)}</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Low</span>
                        <span class="metric-value">$${quoteData.low.toFixed(2)}</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Volume</span>
                        <span class="metric-value">${this.formatNumber(quoteData.volume)}</span>
                    </div>
                </div>
            </div>
        `;
        
        this.showNotification(`✅ Loaded DEMO data for ${quoteData.symbol}`, 'success');
    },
    
    loadCompanyExtraCharts: function(symbol) {
        const chartsContainer = document.getElementById('companyExtraCharts');
        if (!chartsContainer) return;
        
        chartsContainer.style.display = 'block';
        
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
                text: `${symbol} vs Market (DEMO DATA)`,
                style: baseConfig.title.style
            },
            subtitle: {
                text: '⚠ Simulated data',
                style: { color: '#f59e0b', fontSize: '0.75rem' }
            },
            xAxis: Object.assign({}, baseConfig.xAxis, { type: 'datetime' }),
            yAxis: Object.assign({}, baseConfig.yAxis, {
                title: { text: 'Performance (%)', style: baseConfig.yAxis.title.style },
                labels: { format: '{value}%', style: baseConfig.yAxis.labels.style }
            }),
            series: [{
                name: symbol + ' (DEMO)',
                data: stockPerformance,
                color: '#3B82F6',
                lineWidth: 2
            }, {
                name: 'Market (DEMO)',
                data: sp500Performance,
                color: '#94A3B8',
                lineWidth: 2,
                dashStyle: 'Dash'
            }]
        }));
    },
    
    renderCompanyRatingsChart: function(symbol) {
        if (this.charts.companyRatings) {
            this.charts.companyRatings.destroy();
        }
        
        const ratings = [
            { name: 'Strong Buy', y: Math.floor(Math.random() * 15), color: '#10B981' },
            { name: 'Buy', y: Math.floor(Math.random() * 10), color: '#34D399' },
            { name: 'Hold', y: Math.floor(Math.random() * 8), color: '#FCD34D' },
            { name: 'Sell', y: Math.floor(Math.random() * 5), color: '#FB923C' },
            { name: 'Strong Sell', y: Math.floor(Math.random() * 3), color: '#EF4444' }
        ];
        
        const baseConfig = this.getResponsiveChartConfig();
        
        this.charts.companyRatings = Highcharts.chart('companyRatingsChart', Object.assign({}, baseConfig, {
            chart: Object.assign({}, baseConfig.chart, { type: 'bar' }),
            title: {
                text: `${symbol} Ratings (DEMO)`,
                style: baseConfig.title.style
            },
            subtitle: {
                text: '⚠ Simulated data',
                style: { color: '#f59e0b', fontSize: '0.75rem' }
            },
            xAxis: Object.assign({}, baseConfig.xAxis, {
                categories: ratings.map(r => r.name)
            }),
            yAxis: Object.assign({}, baseConfig.yAxis, {
                min: 0,
                title: { text: 'Analysts', style: baseConfig.yAxis.title.style }
            }),
            legend: { enabled: false },
            series: [{
                name: 'Analysts',
                data: ratings,
                colorByPoint: true
            }]
        }));
    },

    // ============================================
    // LIVE QUOTES
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
        
        const container = document.getElementById('quoteDisplay');
        if (!container) return;
        
        container.innerHTML = '<div class="quote-placeholder"><i class="fas fa-spinner fa-spin"></i><p>Loading...</p></div>';
        
        setTimeout(() => {
            const quoteData = DemoDataGenerator.generateQuote(trimmedSymbol);
            this.displayLiveQuote(quoteData);
            
            this.wrapChartInScrollContainer('liveQuoteChart');
            this.wrapChartInScrollContainer('sentimentGauge');
            
            this.loadQuoteChart(trimmedSymbol);
            this.renderMarketSentiment(trimmedSymbol, quoteData);
        }, 500);
    },
    
    displayLiveQuote: function(quoteData) {
        const container = document.getElementById('quoteDisplay');
        if (!container) return;
        
        const currentPrice = quoteData.close || 0;
        const change = quoteData.change || 0;
        const percentChange = quoteData.percent_change || 0;
        const isPositive = change >= 0;
        
        container.innerHTML = `
            <div class="demo-data-disclaimer">
                <i class="fas fa-exclamation-triangle"></i>
                <strong>SIMULATED DATA:</strong> Randomly generated quotes for demo.
            </div>
            
            <div class="quote-header">
                <div class="quote-symbol">${quoteData.symbol} <span class="demo-badge-inline">DEMO</span></div>
                <div class="quote-name">${this.escapeHtml(quoteData.name)}</div>
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
                    <div class="quote-stat-value">$${quoteData.open.toFixed(2)}</div>
                </div>
                <div class="quote-stat">
                    <div class="quote-stat-label">High</div>
                    <div class="quote-stat-value">$${quoteData.high.toFixed(2)}</div>
                </div>
                <div class="quote-stat">
                    <div class="quote-stat-label">Low</div>
                    <div class="quote-stat-value">$${quoteData.low.toFixed(2)}</div>
                </div>
                <div class="quote-stat">
                    <div class="quote-stat-label">Volume</div>
                    <div class="quote-stat-value">${this.formatNumber(quoteData.volume)}</div>
                </div>
            </div>
        `;
    },
    
    loadQuoteChart: function(symbol) {
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
                text: `${symbol} - Price (DEMO)`,
                style: baseConfig.title.style
            },
            subtitle: {
                text: '⚠ Simulated data',
                style: { color: '#f59e0b', fontSize: '0.75rem' }
            },
            series: [{
                name: 'Price (DEMO)',
                data: dates.map((date, i) => [date, prices[i]]),
                color: '#3B82F6',
                lineWidth: 2
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
        
        const percentChange = quoteData.percent_change || 0;
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
                text: `${symbol} Sentiment (DEMO)`,
                style: baseConfig.title.style
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
                labels: { y: 16, style: baseConfig.yAxis.labels.style }
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

    // ============================================
    // PORTFOLIO BUILDER
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
    
    removeFromPortfolio: function(symbol) {
        this.portfolio = this.portfolio.filter(p => p.symbol !== symbol);
        this.updatePortfolioDisplay();
        
        if (this.portfolio.length >= 2) {
            this.loadPortfolioAdvancedCharts();
        } else {
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
                        <p>Your portfolio is empty. Add some stocks!</p>
                    </td>
                </tr>
            `;
            
            if (summary) {
                summary.innerHTML = `
                    <div class="summary-card"><h4>Total Value</h4><p class="value-large">$0.00</p></div>
                    <div class="summary-card"><h4>Holdings</h4><p class="value-large">0</p></div>
                    <div class="summary-card"><h4>Diversification</h4><p class="value-large">N/A</p></div>
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
                    <td>$${holding.value.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
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
        
        let diversificationScore = 'Low';
        if (this.portfolio.length >= 5) diversificationScore = 'Excellent';
        else if (this.portfolio.length >= 3) diversificationScore = 'Good';
        else if (this.portfolio.length >= 2) diversificationScore = 'Fair';
        
        if (summary) {
            summary.innerHTML = `
                <div class="summary-card"><h4>Total Value</h4><p class="value-large">$${totalValue.toLocaleString(undefined, {minimumFractionDigits: 2})}</p></div>
                <div class="summary-card"><h4>Holdings</h4><p class="value-large">${this.portfolio.length}</p></div>
                <div class="summary-card"><h4>Diversification</h4><p class="value-large">${diversificationScore}</p></div>
            `;
        }
        
        this.wrapChartInScrollContainer('portfolioAllocationChart');
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
        
        const baseConfig = this.getResponsiveChartConfig();
        
        this.charts.portfolioAllocation = Highcharts.chart('portfolioAllocationChart', Object.assign({}, baseConfig, {
            chart: Object.assign({}, baseConfig.chart, { type: 'pie' }),
            title: {
                text: 'Portfolio Allocation',
                style: baseConfig.title.style
            },
            series: [{
                name: 'Value',
                colorByPoint: true,
                data: data
            }]
        }));
    },
    
    loadPortfolioAdvancedCharts: function() {
        this.renderPortfolioCorrelation();
        this.renderPortfolioPerformance();
    },
    
    renderPortfolioCorrelation: function() {
        const container = document.getElementById('portfolioCorrelation');
        if (!container) return;
        
        container.style.display = 'block';
        
        if (this.charts.correlationHeatmap) {
            this.charts.correlationHeatmap.destroy();
        }
        
        const symbols = this.portfolio.map(p => p.symbol);
        const correlationData = [];
        
        symbols.forEach((symbol1, i) => {
            symbols.forEach((symbol2, j) => {
                let correlation = i === j ? 1 : (Math.random() * 1.6 - 0.8).toFixed(2);
                correlationData.push([j, i, parseFloat(correlation)]);
            });
        });
        
        const baseConfig = this.getResponsiveChartConfig();
        
        this.charts.correlationHeatmap = Highcharts.chart('correlationHeatmap', Object.assign({}, baseConfig, {
            chart: Object.assign({}, baseConfig.chart, { type: 'heatmap' }),
            title: {
                text: 'Correlation Matrix (DEMO)',
                style: baseConfig.title.style
            },
            xAxis: Object.assign({}, baseConfig.xAxis, { categories: symbols }),
            yAxis: Object.assign({}, baseConfig.yAxis, { categories: symbols, title: null }),
            colorAxis: {
                min: -1,
                max: 1,
                stops: [[0, '#EF4444'], [0.5, '#FCD34D'], [1, '#10B981']]
            },
            series: [{
                name: 'Correlation',
                data: correlationData,
                dataLabels: {
                    enabled: !this.isMobile(),
                    color: '#000',
                    format: '{point.value:.2f}'
                }
            }]
        }));
    },
    
    renderPortfolioPerformance: function() {
        const container = document.getElementById('portfolioPerformance');
        if (!container) return;
        
        container.style.display = 'block';
        
        if (this.charts.portfolioPerformance) {
            this.charts.portfolioPerformance.destroy();
        }
        
        const series = this.portfolio.map(holding => {
            const data = DemoDataGenerator.generateOHLCV(30);
            const sortedData = [...data].sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
            
            const firstPrice = parseFloat(sortedData[0].close);
            const performanceData = sortedData.map(d => ({
                x: new Date(d.datetime).getTime(),
                y: (parseFloat(d.close) / firstPrice - 1) * 100
            }));
            
            return {
                name: holding.symbol,
                data: performanceData
            };
        });
        
        const baseConfig = this.getResponsiveChartConfig();
        
        this.charts.portfolioPerformance = Highcharts.stockChart('portfolioPerformanceChart', Object.assign({}, baseConfig, {
            title: {
                text: 'Portfolio Performance (DEMO)',
                style: baseConfig.title.style
            },
            yAxis: Object.assign({}, baseConfig.yAxis, {
                title: { text: 'Performance (%)', style: baseConfig.yAxis.title.style },
                labels: { format: '{value}%', style: baseConfig.yAxis.labels.style }
            }),
            series: series
        }));
    },

    // ============================================
    // TECHNICAL ANALYSIS
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
        
        ['indicatorSMA', 'indicatorEMA', 'indicatorBollinger', 'indicatorRSI', 'indicatorMACD'].forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox) {
                checkbox.addEventListener('change', (e) => {
                    this.toggleIndicator(id, e.target.checked);
                });
            }
        });
    },
    
    analyzeTechnical: function() {
        const input = document.getElementById('technicalSymbol');
        if (!input || !input.value.trim()) {
            this.showNotification('Please enter a ticker symbol', 'warning');
            return;
        }
        
        const symbol = input.value.trim().toUpperCase();
        this.currentTechnicalSymbol = symbol;
        
        const timeSeriesData = DemoDataGenerator.generateOHLCV(180);
        
        this.wrapChartInScrollContainer('technicalChart');
        
        this.renderTechnicalChart(timeSeriesData, symbol);
        this.generateTechnicalSignals(symbol, timeSeriesData);
    },
    
    renderTechnicalChart: function(data, symbol) {
        if (this.charts.technical) {
            this.charts.technical.destroy();
        }
        
        const sortedData = [...data].sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
        
        const ohlc = sortedData.map(d => [
            d.timestamp || new Date(d.datetime).getTime(),
            parseFloat(d.open),
            parseFloat(d.high),
            parseFloat(d.low),
            parseFloat(d.close)
        ]);
        
        const volume = sortedData.map(d => [
            d.timestamp || new Date(d.datetime).getTime(),
            parseFloat(d.volume || 0)
        ]);
        
        const baseConfig = this.getResponsiveChartConfig();
        const isMobile = this.isMobile();
        
        this.charts.technical = Highcharts.stockChart('technicalChart', Object.assign({}, baseConfig, {
            chart: Object.assign({}, baseConfig.chart, {
                height: isMobile ? 350 : 500
            }),
            title: {
                text: `${symbol} - Technical Analysis (DEMO)`,
                style: baseConfig.title.style
            },
            subtitle: {
                text: '⚠ Simulated data',
                style: { color: '#f59e0b', fontSize: '0.75rem' }
            },
            yAxis: [{
                labels: { align: 'right', x: -3, style: baseConfig.yAxis.labels.style },
                title: { text: 'Price (USD)', style: baseConfig.yAxis.title.style },
                height: '70%',
                lineWidth: 2
            }, {
                labels: { align: 'right', x: -3, style: baseConfig.yAxis.labels.style },
                title: { text: 'Volume', style: baseConfig.yAxis.title.style },
                top: '75%',
                height: '25%',
                offset: 0,
                lineWidth: 2
            }],
            series: [{
                type: 'candlestick',
                name: symbol,
                id: 'main-series',
                data: ohlc,
                color: '#EF4444',
                upColor: '#10B981',
                yAxis: 0
            }, {
                type: 'column',
                name: 'Volume',
                data: volume,
                yAxis: 1,
                color: '#3B82F6',
                opacity: 0.5
            }]
        }));
    },
    
    toggleIndicator: function(indicatorId, isEnabled) {
        console.log('Toggle indicator:', indicatorId, isEnabled);
    },
    
    generateTechnicalSignals: function(symbol, data) {
        const container = document.getElementById('technicalSignals');
        if (!container) return;
        
        container.innerHTML = `
            <h4>Technical Signals for ${symbol} (DEMO)</h4>
            <div class="signals-grid">
                <div class="signal-card">
                    <div class="signal-icon bullish"><i class="fas fa-arrow-up"></i></div>
                    <div class="signal-info">
                        <h5>Price Trend</h5>
                        <p><strong>Bullish (DEMO)</strong></p>
                        <p class="signal-detail">Current: $${(Math.random() * 200 + 50).toFixed(2)}</p>
                    </div>
                </div>
                
                <div class="signal-card">
                    <div class="signal-icon neutral"><i class="fas fa-chart-line"></i></div>
                    <div class="signal-info">
                        <h5>RSI (14)</h5>
                        <p><strong>${(Math.random() * 100).toFixed(2)} (DEMO)</strong></p>
                        <p class="signal-detail">Neutral zone</p>
                    </div>
                </div>
            </div>
        `;
    },

    // ============================================
    // RISK CALCULATOR
    // ============================================
    setupRiskCalculatorListeners: function() {
        const btnCalculate = document.getElementById('btnCalculateRisk');
        
        if (btnCalculate) {
            btnCalculate.addEventListener('click', () => {
                this.calculateRiskMetrics();
            });
        }
        
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
        
        const zScoreMap = { 90: 1.282, 95: 1.645, 99: 2.326 };
        const zScore = zScoreMap[confidence] || 1.645;
        
        const dailyVolatility = volatility / Math.sqrt(252);
        const horizonVolatility = dailyVolatility * Math.sqrt(timeHorizon);
        const varDaily = portfolioValue * horizonVolatility * zScore / 100;
        
        const cvar = varDaily * 1.3;
        const riskFreeRate = 2;
        const sharpeRatio = (expectedReturn - riskFreeRate) / volatility;
        const maxDrawdown = (volatility / 100) * portfolioValue * 1.5;
        const beta = 0.8 + (Math.random() * 0.6);
        
        this.displayRiskResults({
            portfolioValue, confidence, volatility, expectedReturn, timeHorizon,
            varDaily, cvar, sharpeRatio, maxDrawdown, beta
        });
        
        this.wrapChartInScrollContainer('monteCarloChart');
        this.runMonteCarloSimulation({ portfolioValue, expectedReturn, volatility, timeHorizon: 252 });
    },
    
    displayRiskResults: function(metrics) {
        const container = document.getElementById('riskResults');
        if (!container) return;
        
        container.innerHTML = `
            <div class="demo-data-disclaimer">
                <i class="fas fa-exclamation-triangle"></i>
                <strong>SIMULATED METRICS:</strong> Educational purposes only.
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                <div class="risk-metric-card">
                    <h5>Value at Risk (VaR)</h5>
                    <div class="risk-metric-value text-danger">$${metrics.varDaily.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                    <p class="risk-metric-description">${metrics.confidence}% confidence - ${metrics.timeHorizon} day(s)</p>
                </div>
                
                <div class="risk-metric-card">
                    <h5>Conditional VaR (CVaR)</h5>
                    <div class="risk-metric-value text-danger">$${metrics.cvar.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                    <p class="risk-metric-description">Expected loss if VaR exceeded</p>
                </div>
                
                <div class="risk-metric-card">
                    <h5>Sharpe Ratio</h5>
                    <div class="risk-metric-value ${metrics.sharpeRatio > 1 ? 'text-success' : ''}">${metrics.sharpeRatio.toFixed(2)}</div>
                    <p class="risk-metric-description">Risk-adjusted return</p>
                </div>
                
                <div class="risk-metric-card">
                    <h5>Maximum Drawdown</h5>
                    <div class="risk-metric-value text-danger">$${metrics.maxDrawdown.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                    <p class="risk-metric-description">Estimated worst-case loss</p>
                </div>
            </div>
        `;
    },
    
    runMonteCarloSimulation: function(params) {
        const container = document.getElementById('monteCarloSection');
        if (!container) return;
        
        container.style.display = 'block';
        
        if (this.charts.monteCarlo) {
            this.charts.monteCarlo.destroy();
        }
        
        const { portfolioValue, expectedReturn, volatility, timeHorizon } = params;
        const numSimulations = this.isMobile() ? 50 : 100;
        const dailyReturn = expectedReturn / 252 / 100;
        const dailyVol = volatility / Math.sqrt(252) / 100;
        
        const simulations = [];
        
        for (let sim = 0; sim < numSimulations; sim++) {
            const path = [portfolioValue];
            let currentValue = portfolioValue;
            
            for (let day = 1; day <= timeHorizon; day++) {
                const randomReturn = this.randomNormal(dailyReturn, dailyVol);
                currentValue = currentValue * (1 + randomReturn);
                path.push(currentValue);
            }
            
            simulations.push(path);
        }
        
        const series = simulations.map((path, index) => ({
            name: `Simulation ${index + 1}`,
            data: path,
            lineWidth: this.isMobile() ? 0.5 : 1,
            opacity: 0.3,
            marker: { enabled: false },
            enableMouseTracking: false,
            showInLegend: false
        }));
        
        const avgPath = [];
        for (let day = 0; day <= timeHorizon; day++) {
            const dayValues = simulations.map(sim => sim[day]);
            const avg = dayValues.reduce((a, b) => a + b, 0) / dayValues.length;
            avgPath.push(avg);
        }
        
        series.push({
            name: 'Average Path',
            data: avgPath,
            lineWidth: this.isMobile() ? 2 : 3,
            color: '#3B82F6',
            marker: { enabled: false },
            zIndex: 10
        });
        
        const baseConfig = this.getResponsiveChartConfig();
        
        this.charts.monteCarlo = Highcharts.chart('monteCarloChart', Object.assign({}, baseConfig, {
            title: {
                text: 'Portfolio Projections (DEMO)',
                style: baseConfig.title.style
            },
            subtitle: {
                text: '⚠ Simulated scenarios',
                style: { color: '#f59e0b', fontSize: '0.75rem' }
            },
            xAxis: Object.assign({}, baseConfig.xAxis, {
                title: { text: 'Trading Days', style: baseConfig.xAxis.labels.style }
            }),
            yAxis: Object.assign({}, baseConfig.yAxis, {
                title: { text: 'Portfolio Value ($)', style: baseConfig.yAxis.title.style },
                labels: {
                    formatter: function() {
                        return '$' + (this.value / 1000).toFixed(0) + 'k';
                    },
                    style: baseConfig.yAxis.labels.style
                }
            }),
            series: series
        }));
    },
    
    randomNormal: function(mean, stdDev) {
        let u = 0, v = 0;
        while(u === 0) u = Math.random();
        while(v === 0) v = Math.random();
        const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        return num * stdDev + mean;
    },

    // ============================================
    // AI INSIGHTS
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
    
    generateAIInsights: function() {
        const input = document.getElementById('aiSymbolInput');
        if (!input || !input.value.trim()) {
            this.showNotification('Please enter a ticker symbol', 'warning');
            return;
        }
        
        const symbol = input.value.trim().toUpperCase();
        
        const container = document.getElementById('aiResults');
        if (!container) return;
        
        container.innerHTML = `
            <div class="ai-placeholder">
                <i class="fas fa-robot fa-spin"></i>
                <h3>AI Analysis in Progress</h3>
                <p>Analyzing ${symbol} with ML models (DEMO)...</p>
            </div>
        `;
        
        setTimeout(() => {
            const quoteData = DemoDataGenerator.generateQuote(symbol);
            const timeSeriesData = DemoDataGenerator.generateOHLCV(90);
            this.displayAIInsights(symbol, quoteData, timeSeriesData);
        }, 2000);
    },
    
    displayAIInsights: function(symbol, quoteData, timeSeriesData) {
        const container = document.getElementById('aiResults');
        if (!container) return;
        
        const currentPrice = quoteData.close || 0;
        
        const prediction7d = currentPrice * (1 + (Math.random() - 0.45) * 0.15);
        const prediction30d = currentPrice * (1 + (Math.random() - 0.45) * 0.25);
        const prediction90d = currentPrice * (1 + (Math.random() - 0.45) * 0.35);
        
        const change7d = ((prediction7d - currentPrice) / currentPrice * 100).toFixed(2);
        const change30d = ((prediction30d - currentPrice) / currentPrice * 100).toFixed(2);
        const change90d = ((prediction90d - currentPrice) / currentPrice * 100).toFixed(2);
        
        const sentimentScore = 50 + (parseFloat(change30d) * 2);
        const clampedSentiment = Math.max(0, Math.min(100, sentimentScore));
        
        let sentimentLabel = 'Neutral';
        if (clampedSentiment >= 70) sentimentLabel = 'Very Positive';
        else if (clampedSentiment >= 55) sentimentLabel = 'Positive';
        else if (clampedSentiment >= 30) sentimentLabel = 'Negative';
        else sentimentLabel = 'Very Negative';
        
        const confidence = 75 + Math.random() * 15;
        
        container.innerHTML = `
            <div class="demo-data-disclaimer">
                <i class="fas fa-exclamation-triangle"></i>
                <strong>AI PREDICTIONS (DEMO):</strong> Randomly generated for demonstration only.
            </div>
            
            <div class="ai-insight-card">
                <div class="ai-insight-header">
                    <div class="ai-insight-icon"><i class="fas fa-brain"></i></div>
                    <div class="ai-insight-title">
                        <h4>AI Price Predictions (DEMO)</h4>
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
                            <p style="font-size: 2rem; font-weight: 800; color: ${change7d > 0 ? '#10B981' : '#EF4444'}; margin: 0;">$${prediction7d.toFixed(2)}</p>
                            <p style="font-size: 0.875rem; color: ${change7d > 0 ? '#10B981' : '#EF4444'}; margin-top: 0.25rem;">${change7d > 0 ? '▲' : '▼'} ${Math.abs(change7d)}%</p>
                        </div>
                        <div style="text-align: center;">
                            <p style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.5rem; text-transform: uppercase; font-weight: 600;">30-Day Target</p>
                            <p style="font-size: 2rem; font-weight: 800; color: ${change30d > 0 ? '#10B981' : '#EF4444'}; margin: 0;">$${prediction30d.toFixed(2)}</p>
                            <p style="font-size: 0.875rem; color: ${change30d > 0 ? '#10B981' : '#EF4444'}; margin-top: 0.25rem;">${change30d > 0 ? '▲' : '▼'} ${Math.abs(change30d)}%</p>
                        </div>
                    </div>
                    
                    <div style="text-align: center; padding: 1.5rem; background: var(--background-secondary); border-radius: var(--radius-lg); margin-top: 1.5rem;">
                        <p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Market Sentiment</p>
                        <p style="font-size: 1.5rem; font-weight: 700; color: var(--primary-color); margin: 0;">${sentimentLabel}</p>
                        <p style="font-size: 0.875rem; color: var(--text-secondary); margin-top: 0.5rem;">Score: ${clampedSentiment.toFixed(0)}/100</p>
                    </div>
                </div>
            </div>
        `;
        
        if (timeSeriesData) {
            this.wrapChartInScrollContainer('predictionChartContainer');
            this.renderAIPredictionChart(symbol, timeSeriesData, { currentPrice, prediction7d, prediction30d, prediction90d });
        }
    },
    
    renderAIPredictionChart: function(symbol, historicalData, predictions) {
        const container = document.getElementById('aiPredictionChart');
        if (!container) return;
        
        container.style.display = 'block';
        
        if (this.charts.aiPredictionChart) {
            this.charts.aiPredictionChart.destroy();
        }
        
        const sortedData = [...historicalData].sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
        const historical = sortedData.map(d => ({
            x: new Date(d.datetime).getTime(),
            y: parseFloat(d.close)
        }));
        
        const lastDate = new Date(sortedData[sortedData.length - 1].datetime);
        
        const predictionPoints = [
            { x: lastDate.getTime(), y: predictions.currentPrice },
            { x: lastDate.getTime() + (7 * 24 * 60 * 60 * 1000), y: predictions.prediction7d },
            { x: lastDate.getTime() + (30 * 24 * 60 * 60 * 1000), y: predictions.prediction30d }
        ];
        
        const baseConfig = this.getResponsiveChartConfig();
        
        this.charts.aiPredictionChart = Highcharts.chart('predictionChartContainer', Object.assign({}, baseConfig, {
            title: {
                text: `${symbol} - AI Forecast (DEMO)`,
                style: baseConfig.title.style
            },
            subtitle: {
                text: '⚠ Simulated predictions',
                style: { color: '#f59e0b', fontSize: '0.75rem' }
            },
            xAxis: Object.assign({}, baseConfig.xAxis, { type: 'datetime' }),
            yAxis: Object.assign({}, baseConfig.yAxis, {
                title: { text: 'Price (USD)', style: baseConfig.yAxis.title.style },
                labels: { format: '${value}', style: baseConfig.yAxis.labels.style }
            }),
            series: [{
                name: 'Historical (DEMO)',
                data: historical,
                color: '#3B82F6',
                lineWidth: 2
            }, {
                name: 'AI Prediction (DEMO)',
                data: predictionPoints,
                color: '#8B5CF6',
                lineWidth: 3,
                dashStyle: 'Dash',
                marker: { enabled: true, radius: 5 }
            }]
        }));
    },
    
    // ============================================
    // UTILITY FUNCTIONS
    // ============================================
    formatNumber: function(num) {
        if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B';
        if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
        return num.toLocaleString();
    },
    
    escapeHtml: function(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
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
        
        setTimeout(() => { notification.classList.add('show'); }, 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => { notification.remove(); }, 300);
        }, 5000);
    }
};

// INITIALIZE
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        DemoApp.init();
    });
} else {
    DemoApp.init();
}

window.DemoApp = DemoApp;

console.log('%c✅ LEGAL COMPLIANT VERSION - All data is simulated!', 'color: #10b981; font-size: 16px; font-weight: bold;');