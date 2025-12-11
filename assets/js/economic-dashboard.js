/**
 * ====================================================================
 * ALPHAVAULT AI - US ECONOMIC DASHBOARD v5.0 - FINAL PERFECT VERSION
 * ====================================================================
 * Features:
 * - US data only (FRED API)
 * - Interactive modals for charts
 * - Trends analysis
 * - Export functionality
 * - No refresh buttons
 * - Gradient titles everywhere
 */

class EconomicDashboard {
    constructor() {
        this.refreshInterval = null;
        this.lastUpdate = null;
        this.cachedData = {};
        this.charts = {};
    }

    async init() {
        console.log('📊 US Economic Dashboard v5.0 - Initializing...');
        
        try {
            // Initialize UI
            this.initializeUI();
            
            // Load all data
            await this.loadAllData();
            
            // Setup event listeners
            this.setupEventListeners();
            
            console.log('✅ Dashboard v5.0 loaded successfully');
            this.startAutoRefresh();
            
        } catch (error) {
            console.error('❌ Dashboard initialization error:', error);
            this.showError('Failed to load US economic dashboard. Please refresh the page.');
        }
    }

    /**
     * ========================================
     * UI INITIALIZATION
     * ========================================
     */
    initializeUI() {
        this.initializeModals();
    }

    initializeModals() {
        const modals = ['indicatorModal', 'exportModal', 'chartInfoModal', 'trendsModal'];
        
        modals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (!modal) return;
            
            // Close buttons
            const closeBtns = modal.querySelectorAll('.modal-close');
            closeBtns.forEach(btn => {
                btn.addEventListener('click', () => this.closeModal(modalId));
            });
            
            // Click outside to close
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modalId);
                }
            });
        });
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    /**
     * ========================================
     * DATA LOADING
     * ========================================
     */
    async loadAllData() {
        const loadingPromises = [
            this.loadDashboardData(),
            this.loadCharts()
        ];
        
        const results = await Promise.allSettled(loadingPromises);
        
        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                console.error(`❌ Failed to load section ${index}:`, result.reason);
            }
        });
        
        // Load metrics after main data
        await this.loadMetricsSummary();
    }

    /**
     * ========================================
     * DASHBOARD CARDS (US ONLY)
     * ========================================
     */
    async loadDashboardData() {
        const grid = document.getElementById('dashboardGrid');
        if (!grid) {
            console.error('❌ dashboardGrid element not found');
            return;
        }

        grid.innerHTML = '<div class="eco-loading"><div class="eco-spinner"></div><p>Loading US economic data...</p></div>';

        try {
            console.log('🔄 Fetching US economic data...');
            
            const [usGDP, usGDPGrowth, usUnemployment, usInflation, usFedRate] = await Promise.all([
                economicDataClient.getSeries('GDP', { limit: 1, sort_order: 'desc' }),
                economicDataClient.getSeries('A191RL1Q225SBEA', { limit: 1, sort_order: 'desc' }),
                economicDataClient.getSeries('UNRATE', { limit: 1, sort_order: 'desc' }),
                economicDataClient.getSeries('CPIAUCSL', { limit: 13, sort_order: 'desc' }),
                economicDataClient.getSeries('DFF', { limit: 1, sort_order: 'desc' })
            ]);

            console.log('✅ US data fetched successfully');

            // Parse data
            const usData = {
                gdp: this.parseFREDLatest(usGDP),
                gdpGrowth: this.parseFREDLatest(usGDPGrowth),
                unemployment: this.parseFREDLatest(usUnemployment),
                inflation: this.calculateYoYInflation(usInflation),
                fedRate: this.parseFREDLatest(usFedRate)
            };

            // Cache data
            this.cachedData = { usData };

            console.log('📊 Parsed US Data:', usData);

            // Render cards
            grid.innerHTML = `
                ${this.createEcoCard({
                    title: 'US GDP',
                    value: this.formatGDP(usData.gdp),
                    unit: 'Trillion USD',
                    flag: '🇺🇸',
                    cssClass: 'us-card',
                    change: parseFloat(usData.gdpGrowth),
                    changeType: parseFloat(usData.gdpGrowth) > 0 ? 'positive' : 'negative',
                    lastUpdate: usGDP?.[0]?.date,
                    indicator: 'us-gdp'
                })}
                
                ${this.createEcoCard({
                    title: 'GDP Growth',
                    value: usData.gdpGrowth + '%',
                    unit: 'Annual Rate',
                    flag: '📈',
                    cssClass: 'us-card',
                    change: parseFloat(usData.gdpGrowth),
                    changeType: parseFloat(usData.gdpGrowth) > 0 ? 'positive' : 'negative',
                    lastUpdate: usGDPGrowth?.[0]?.date,
                    indicator: 'us-gdp-growth'
                })}
                
                ${this.createEcoCard({
                    title: 'Unemployment',
                    value: usData.unemployment + '%',
                    unit: 'Labor Force',
                    flag: '👥',
                    cssClass: 'us-card',
                    change: null,
                    lastUpdate: usUnemployment?.[0]?.date,
                    indicator: 'us-unemployment'
                })}
                
                ${this.createEcoCard({
                    title: 'Inflation (CPI)',
                    value: usData.inflation + '%',
                    unit: 'YoY Change',
                    flag: '🔥',
                    cssClass: 'us-card',
                    change: parseFloat(usData.inflation),
                    changeType: parseFloat(usData.inflation) > 2 ? 'negative' : 'positive',
                    lastUpdate: usInflation?.[0]?.date,
                    indicator: 'us-inflation'
                })}
                
                ${this.createEcoCard({
                    title: 'Fed Funds Rate',
                    value: usData.fedRate + '%',
                    unit: 'Target Rate',
                    flag: '🏦',
                    cssClass: 'us-card',
                    change: null,
                    lastUpdate: usFedRate?.[0]?.date,
                    indicator: 'us-fed-rate'
                })}
            `;

            // Attach click handlers
            this.attachCardClickHandlers();

            this.lastUpdate = new Date();
            console.log('✅ Dashboard cards rendered');

        } catch (error) {
            console.error('❌ Error loading dashboard data:', error);
            grid.innerHTML = `
                <div class="eco-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Error loading data</h3>
                    <p>${error.message}</p>
                    <button class="dashboard-btn" onclick="location.reload()">
                        <i class="fas fa-redo"></i> Reload Page
                    </button>
                </div>
            `;
        }
    }

    /**
     * ========================================
     * METRICS SUMMARY
     * ========================================
     */
    async loadMetricsSummary() {
        const container = document.getElementById('metricsSummary');
        if (!container || !this.cachedData.usData) {
            return;
        }

        try {
            const { usData } = this.cachedData;
            
            // Calculate metrics
            const economicHealth = this.calculateEconomicHealth(usData);
            const inflationTrend = this.getInflationTrend(parseFloat(usData.inflation));
            const laborMarket = this.getLaborMarketStatus(parseFloat(usData.unemployment));
            
            container.innerHTML = `
                <div class='metric-card'>
                    <h4><i class='fas fa-heartbeat'></i> Economic Health</h4>
                    <div class='metric-value'>${economicHealth.score}/100</div>
                    <div class='metric-description'>${economicHealth.description}</div>
                </div>
                
                <div class='metric-card'>
                    <h4><i class='fas fa-fire'></i> Inflation Trend</h4>
                    <div class='metric-value'>${inflationTrend.status}</div>
                    <div class='metric-description'>${inflationTrend.description}</div>
                </div>
                
                <div class='metric-card'>
                    <h4><i class='fas fa-briefcase'></i> Labor Market</h4>
                    <div class='metric-value'>${laborMarket.status}</div>
                    <div class='metric-description'>${laborMarket.description}</div>
                </div>
            `;
            
        } catch (error) {
            console.error('❌ Error loading metrics:', error);
            container.innerHTML = '<p style="text-align: center; color: var(--text-tertiary);">Unable to calculate metrics</p>';
        }
    }

    calculateEconomicHealth(data) {
        let score = 50;
        
        const gdpGrowth = parseFloat(data.gdpGrowth);
        if (!isNaN(gdpGrowth)) {
            if (gdpGrowth > 3) score += 30;
            else if (gdpGrowth > 2) score += 20;
            else if (gdpGrowth > 1) score += 10;
            else if (gdpGrowth < 0) score -= 20;
        }
        
        const unemployment = parseFloat(data.unemployment);
        if (!isNaN(unemployment)) {
            if (unemployment < 4) score += 30;
            else if (unemployment < 5) score += 20;
            else if (unemployment < 6) score += 10;
            else if (unemployment > 8) score -= 20;
        }
        
        const inflation = parseFloat(data.inflation);
        if (!isNaN(inflation)) {
            if (inflation >= 1.5 && inflation <= 2.5) score += 20;
            else if (inflation < 1) score -= 10;
            else if (inflation > 4) score -= 20;
        }
        
        score = Math.max(0, Math.min(100, score));
        
        let description = '';
        if (score >= 80) description = 'Strong - Economy showing robust performance';
        else if (score >= 60) description = 'Good - Economy performing well overall';
        else if (score >= 40) description = 'Moderate - Mixed economic signals';
        else description = 'Weak - Economy facing challenges';
        
        return { score: score.toFixed(0), description };
    }

    getInflationTrend(inflation) {
        if (isNaN(inflation)) {
            return { status: 'N/A', description: 'Data unavailable' };
        }
        
        if (inflation < 1) {
            return { status: 'Low', description: 'Below Fed target, may indicate weak demand' };
        } else if (inflation >= 1 && inflation <= 2.5) {
            return { status: 'Target', description: 'Near Fed 2% target, healthy inflation' };
        } else if (inflation > 2.5 && inflation <= 4) {
            return { status: 'Elevated', description: 'Above target, Fed may tighten policy' };
        } else {
            return { status: 'High', description: 'Significantly above target, pressure on Fed' };
        }
    }

    getLaborMarketStatus(unemployment) {
        if (isNaN(unemployment)) {
            return { status: 'N/A', description: 'Data unavailable' };
        }
        
        if (unemployment < 4) {
            return { status: 'Tight', description: 'Very low unemployment, strong labor market' };
        } else if (unemployment >= 4 && unemployment < 5) {
            return { status: 'Healthy', description: 'Near full employment conditions' };
        } else if (unemployment >= 5 && unemployment < 6.5) {
            return { status: 'Moderate', description: 'Some slack in the labor market' };
        } else {
            return { status: 'Weak', description: 'High unemployment, labor market challenges' };
        }
    }

    /**
     * ========================================
     * PARSING METHODS
     * ========================================
     */
    parseFREDLatest(series) {
        if (!series || !Array.isArray(series) || series.length === 0) {
            return 'N/A';
        }

        const latest = series[0];
        
        if (latest?.value && latest.value !== '.') {
            const value = parseFloat(latest.value);
            if (!isNaN(value)) {
                return value.toFixed(2);
            }
        }

        return 'N/A';
    }

    calculateYoYInflation(series) {
        if (!series || series.length < 13) {
            return 'N/A';
        }

        const latest = parseFloat(series[0].value);
        const yearAgo = parseFloat(series[12].value);

        if (isNaN(latest) || isNaN(yearAgo) || yearAgo === 0) {
            return 'N/A';
        }

        const yoyChange = ((latest - yearAgo) / yearAgo) * 100;
        return yoyChange.toFixed(2);
    }

    formatGDP(value) {
        if (value === 'N/A' || isNaN(parseFloat(value))) return 'N/A';
        const num = parseFloat(value);
        
        if (num > 1000) {
            return (num / 1000).toFixed(2);
        }
        
        return num.toFixed(2);
    }

    createEcoCard(options) {
        const { title, value, unit, flag, cssClass, change, changeType, lastUpdate, indicator } = options;
        
        let changeHTML = '';
        if (change !== null && change !== undefined && !isNaN(change)) {
            const icon = changeType === 'positive' ? 'fa-arrow-up' : 'fa-arrow-down';
            const changeClass = changeType === 'positive' ? 'positive' : 'negative';
            changeHTML = `
                <div class='eco-change ${changeClass}'>
                    <i class='fas ${icon}'></i>
                    <span>${Math.abs(change).toFixed(2)}%</span>
                </div>
            `;
        }

        return `
            <div class='eco-card ${cssClass}' data-indicator='${indicator}'>
                <div class='eco-card-header'>
                    <h3 class='eco-card-title'>${title}</h3>
                    <span class='eco-flag'>${flag}</span>
                </div>
                <div class='eco-value'>${value}</div>
                <div class='eco-sublabel'>${unit}</div>
                ${changeHTML}
                ${lastUpdate ? `<div class='eco-sublabel' style='margin-top: 10px; font-size: 0.75rem; opacity: 0.7;'>Updated: ${lastUpdate}</div>` : ''}
            </div>
        `;
    }

    attachCardClickHandlers() {
        const cards = document.querySelectorAll('.eco-card');
        cards.forEach(card => {
            card.addEventListener('click', () => {
                const indicator = card.dataset.indicator;
                this.showIndicatorModal(indicator);
            });
        });
    }

    /**
     * ========================================
     * CHARTS
     * ========================================
     */
    async loadCharts() {
        console.log('📊 Loading charts...');
        
        const chartPromises = [
            this.loadGDPChart(),
            this.loadUnemploymentChart(),
            this.loadInflationChart(),
            this.loadInterestRateChart()
        ];
        
        const results = await Promise.allSettled(chartPromises);
        
        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                console.error(`❌ Chart ${index} failed:`, result.reason);
            }
        });
    }

    async loadGDPChart() {
        try {
            const usGDP = await economicDataClient.getSeries('A191RL1Q225SBEA', { limit: 40, sort_order: 'desc' });

            if (!usGDP || usGDP.length === 0) {
                this.renderEmptyChart('gdpChart', 'No GDP data available');
                return;
            }

            const chartData = usGDP
                .filter(d => d.value !== '.')
                .reverse()
                .map(d => [new Date(d.date).getTime(), parseFloat(d.value)]);

            this.charts.gdpChart = Highcharts.chart('gdpChart', {
                chart: { 
                    type: 'line', 
                    backgroundColor: 'transparent', 
                    height: 400
                },
                title: { text: null },
                xAxis: { 
                    type: 'datetime',
                    labels: { style: { color: 'var(--text-secondary)' } }
                },
                yAxis: { 
                    title: { text: 'Growth Rate (%)', style: { color: 'var(--text-secondary)' } },
                    labels: { style: { color: 'var(--text-secondary)' } },
                    gridLineColor: 'var(--border-color)',
                    plotLines: [{ value: 0, color: '#ef4444', width: 2, zIndex: 4 }]
                },
                tooltip: { 
                    valueDecimals: 2, 
                    valueSuffix: '%',
                    backgroundColor: 'var(--glass-bg)',
                    borderColor: 'var(--glass-border)',
                    style: { color: 'var(--text-primary)' }
                },
                series: [{
                    name: 'US GDP Growth',
                    data: chartData,
                    color: '#3b82f6',
                    marker: { enabled: false },
                    lineWidth: 3
                }],
                credits: { enabled: false },
                legend: { enabled: true, itemStyle: { color: 'var(--text-primary)' } },
                exporting: { enabled: true }
            });

            console.log('✅ GDP chart rendered');

        } catch (error) {
            console.error('❌ Error loading GDP chart:', error);
            this.renderEmptyChart('gdpChart', 'Error loading chart');
        }
    }

    async loadUnemploymentChart() {
        try {
            const usUnemp = await economicDataClient.getSeries('UNRATE', { limit: 120, sort_order: 'desc' });

            if (!usUnemp || usUnemp.length === 0) {
                this.renderEmptyChart('unemploymentChart', 'No unemployment data available');
                return;
            }

            const usData = usUnemp
                .filter(d => d.value !== '.')
                .reverse()
                .map(d => [new Date(d.date).getTime(), parseFloat(d.value)]);

            this.charts.unemploymentChart = Highcharts.chart('unemploymentChart', {
                chart: { type: 'line', backgroundColor: 'transparent', height: 400 },
                title: { text: null },
                xAxis: { type: 'datetime', labels: { style: { color: 'var(--text-secondary)' } } },
                yAxis: { 
                    title: { text: 'Unemployment Rate (%)', style: { color: 'var(--text-secondary)' } },
                    labels: { style: { color: 'var(--text-secondary)' } },
                    gridLineColor: 'var(--border-color)'
                },
                tooltip: { 
                    valueDecimals: 1, 
                    valueSuffix: '%',
                    backgroundColor: 'var(--glass-bg)',
                    borderColor: 'var(--glass-border)',
                    style: { color: 'var(--text-primary)' }
                },
                series: [{
                    name: 'US Unemployment',
                    data: usData,
                    color: '#3b82f6',
                    marker: { enabled: false },
                    lineWidth: 3
                }],
                credits: { enabled: false },
                legend: { enabled: true, itemStyle: { color: 'var(--text-primary)' } },
                exporting: { enabled: true }
            });

            console.log('✅ Unemployment chart rendered');

        } catch (error) {
            console.error('❌ Error loading unemployment chart:', error);
            this.renderEmptyChart('unemploymentChart', 'Error loading chart');
        }
    }

    async loadInflationChart() {
        try {
            const usInflation = await economicDataClient.getSeries('CPIAUCSL', { limit: 120, sort_order: 'desc' });

            if (!usInflation || usInflation.length < 13) {
                this.renderEmptyChart('inflationChart', 'No inflation data available');
                return;
            }

            const usData = this.calculateYoYTimeSeriesFromDesc(usInflation);

            this.charts.inflationChart = Highcharts.chart('inflationChart', {
                chart: { type: 'line', backgroundColor: 'transparent', height: 400 },
                title: { text: null },
                xAxis: { type: 'datetime', labels: { style: { color: 'var(--text-secondary)' } } },
                yAxis: { 
                    title: { text: 'Inflation Rate (YoY %)', style: { color: 'var(--text-secondary)' } },
                    labels: { style: { color: 'var(--text-secondary)' } },
                    gridLineColor: 'var(--border-color)',
                    plotLines: [{
                        value: 2, color: '#f59e0b', width: 2, dashStyle: 'Dash',
                        label: { text: 'Fed Target 2%', style: { color: '#f59e0b' } }
                    }]
                },
                tooltip: { 
                    valueDecimals: 2, 
                    valueSuffix: '%',
                    backgroundColor: 'var(--glass-bg)',
                    borderColor: 'var(--glass-border)',
                    style: { color: 'var(--text-primary)' }
                },
                series: [{
                    name: 'US Inflation (CPI)',
                    data: usData,
                    color: '#f59e0b',
                    marker: { enabled: false },
                    lineWidth: 3
                }],
                credits: { enabled: false },
                legend: { enabled: true, itemStyle: { color: 'var(--text-primary)' } },
                exporting: { enabled: true }
            });

            console.log('✅ Inflation chart rendered');

        } catch (error) {
            console.error('❌ Error loading inflation chart:', error);
            this.renderEmptyChart('inflationChart', 'Error loading chart');
        }
    }

    async loadInterestRateChart() {
        try {
            const usFedRate = await economicDataClient.getSeries('DFF', { limit: 120, sort_order: 'desc' });

            if (!usFedRate || usFedRate.length === 0) {
                this.renderEmptyChart('interestRateChart', 'No interest rate data available');
                return;
            }

            const usData = usFedRate
                .filter(d => d.value !== '.')
                .reverse()
                .map(d => [new Date(d.date).getTime(), parseFloat(d.value)]);

            this.charts.interestRateChart = Highcharts.chart('interestRateChart', {
                chart: { type: 'area', backgroundColor: 'transparent', height: 400 },
                title: { text: null },
                xAxis: { type: 'datetime', labels: { style: { color: 'var(--text-secondary)' } } },
                yAxis: { 
                    title: { text: 'Interest Rate (%)', style: { color: 'var(--text-secondary)' } },
                    labels: { style: { color: 'var(--text-secondary)' } },
                    gridLineColor: 'var(--border-color)'
                },
                tooltip: { 
                    valueDecimals: 2, 
                    valueSuffix: '%',
                    backgroundColor: 'var(--glass-bg)',
                    borderColor: 'var(--glass-border)',
                    style: { color: 'var(--text-primary)' }
                },
                plotOptions: { area: { fillOpacity: 0.2 } },
                series: [{
                    name: 'Fed Funds Rate',
                    data: usData,
                    color: '#3b82f6',
                    marker: { enabled: false },
                    lineWidth: 3
                }],
                credits: { enabled: false },
                legend: { enabled: true, itemStyle: { color: 'var(--text-primary)' } },
                exporting: { enabled: true }
            });

            console.log('✅ Interest rate chart rendered');

        } catch (error) {
            console.error('❌ Error loading interest rate chart:', error);
            this.renderEmptyChart('interestRateChart', 'Error loading chart');
        }
    }

    renderEmptyChart(containerId, message) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div style='display: flex; align-items: center; justify-content: center; height: 100%; color: var(--text-tertiary);'>
                    <div style='text-align: center;'>
                        <i class='fas fa-chart-line' style='font-size: 3rem; margin-bottom: 16px; opacity: 0.3;'></i>
                        <p>${message}</p>
                    </div>
                </div>
            `;
        }
    }

    /**
     * ========================================
     * HELPERS
     * ========================================
     */
    calculateYoYTimeSeriesFromDesc(series) {
        if (!series || series.length < 13) return [];
        
        const data = [];
        
        for (let i = 0; i < series.length - 12; i++) {
            if (series[i].value === '.' || series[i + 12].value === '.') continue;
            
            const current = parseFloat(series[i].value);
            const yearAgo = parseFloat(series[i + 12].value);
            
            if (isNaN(current) || isNaN(yearAgo) || yearAgo === 0) continue;
            
            const yoyChange = ((current - yearAgo) / yearAgo) * 100;
            data.push([new Date(series[i].date).getTime(), yoyChange]);
        }
        
        return data.reverse();
    }

    /**
     * ========================================
     * EVENT LISTENERS
     * ========================================
     */
    setupEventListeners() {
        // Export button
        const exportBtn = document.getElementById('exportData');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.handleExport());
        }

        // View Trends button
        const trendsBtn = document.getElementById('viewTrends');
        if (trendsBtn) {
            trendsBtn.addEventListener('click', () => this.showTrendsModal());
        }

        // Chart info buttons
        const infoBtns = document.querySelectorAll('.chart-btn-info');
        infoBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const infoType = btn.dataset.info;
                this.showChartInfoModal(infoType);
            });
        });

        // Fullscreen buttons
        const fullscreenBtns = document.querySelectorAll('.chart-btn-fullscreen');
        fullscreenBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const chartId = btn.dataset.chart;
                this.toggleChartFullscreen(chartId);
            });
        });

        // Export format buttons
        const exportFormatBtns = document.querySelectorAll('.export-btn');
        exportFormatBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const format = btn.dataset.format;
                this.exportData(format);
            });
        });
    }

    handleExport() {
        this.openModal('exportModal');
    }

    exportData(format) {
        console.log('📥 Exporting data in format:', format);
        
        if (!this.cachedData.usData) {
            alert('No data available to export');
            return;
        }

        const data = {
            timestamp: new Date().toISOString(),
            us: this.cachedData.usData
        };

        switch(format) {
            case 'csv':
                this.exportAsCSV(data);
                break;
            case 'json':
                this.exportAsJSON(data);
                break;
            case 'print':
                window.print();
                break;
        }

        this.closeModal('exportModal');
    }

    exportAsCSV(data) {
        const csv = [
            ['Indicator', 'Value'],
            ['GDP (Trillion USD)', data.us.gdp],
            ['GDP Growth (%)', data.us.gdpGrowth],
            ['Unemployment (%)', data.us.unemployment],
            ['Inflation YoY (%)', data.us.inflation],
            ['Fed Funds Rate (%)', data.us.fedRate]
        ].map(row => row.join(',')).join('\n');

        this.downloadFile(csv, 'us-economic-data.csv', 'text/csv');
    }

    exportAsJSON(data) {
        const json = JSON.stringify(data, null, 2);
        this.downloadFile(json, 'us-economic-data.json', 'application/json');
    }

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        console.log('✅ File downloaded:', filename);
    }

    toggleChartFullscreen(chartId) {
        const chartContainer = document.getElementById(chartId);
        if (!chartContainer) return;

        if (!document.fullscreenElement) {
            chartContainer.requestFullscreen().catch(err => {
                console.error('Error attempting to enable fullscreen:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }

    /**
     * ========================================
     * MODALS
     * ========================================
     */
    showIndicatorModal(indicator) {
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        const titles = {
            'us-gdp': '🇺🇸 US Gross Domestic Product',
            'us-gdp-growth': '📈 US GDP Growth Rate',
            'us-unemployment': '👥 US Unemployment Rate',
            'us-inflation': '🔥 US Inflation (CPI)',
            'us-fed-rate': '🏦 Federal Funds Rate'
        };
        
        const descriptions = {
            'us-gdp': 'The Gross Domestic Product (GDP) is the total monetary value of all finished goods and services produced within the United States. It is the most comprehensive measure of U.S. economic activity and health.',
            'us-gdp-growth': 'The GDP Growth Rate measures the percentage change in the value of all goods and services produced in the US compared to the previous quarter, expressed at an annual rate.',
            'us-unemployment': 'The unemployment rate represents the percentage of the labor force that is jobless and actively seeking employment. It is a lagging indicator of economic health.',
            'us-inflation': 'The Consumer Price Index (CPI) measures the average change over time in the prices paid by urban consumers for a market basket of consumer goods and services.',
            'us-fed-rate': 'The Federal Funds Rate is the target interest rate set by the Federal Reserve at which commercial banks lend reserve balances to other banks overnight.'
        };
        
        modalTitle.textContent = titles[indicator] || 'Economic Indicator';
        
        modalBody.innerHTML = `
            <p style='line-height: 1.8; color: var(--text-primary); margin-bottom: 24px; font-size: 1.05rem;'>
                ${descriptions[indicator] || 'No description available.'}
            </p>
            <div style='background: var(--eco-gradient-soft); padding: 24px; border-radius: 12px; border: 2px solid var(--glass-border);'>
                <h4 style='margin-bottom: 12px; color: var(--text-primary); font-size: 1.1rem;'>
                    <i class='fas fa-chart-line' style='color: var(--eco-primary);'></i> 
                    Significance
                </h4>
                <p style='color: var(--text-secondary); line-height: 1.7;'>
                    This indicator is crucial for understanding economic trends, policy decisions, and market expectations. 
                    The Federal Reserve and policymakers closely monitor this metric to make informed decisions about monetary policy, 
                    interest rates, and economic stimulus measures.
                </p>
            </div>
        `;
        
        this.openModal('indicatorModal');
    }

    showChartInfoModal(infoType) {
        const modalTitle = document.getElementById('chartInfoTitle');
        const modalBody = document.getElementById('chartInfoBody');
        
        const chartInfo = {
            'gdp': {
                title: '📈 GDP Growth Rate Chart',
                description: 'This chart displays the quarterly GDP growth rate for the United States over the past 10 years (40 quarters).',
                keyPoints: [
                    'Shows economic expansion (positive values) or contraction (negative values)',
                    'Red line at 0% marks the recession threshold',
                    'Data is annualized for comparison across periods',
                    'Sourced from the Federal Reserve Economic Data (FRED)'
                ],
                interpretation: 'Positive growth indicates economic expansion, while negative growth (recession) shows economic contraction. Growth above 3% is considered strong, while growth below 1% may signal economic weakness.'
            },
            'unemployment': {
                title: '👥 Unemployment Rate Chart',
                description: 'This chart tracks the US unemployment rate over the past 10 years.',
                keyPoints: [
                    'Shows percentage of labor force actively seeking work',
                    'Lower values indicate a stronger labor market',
                    'Natural rate of unemployment is around 4-5%',
                    'Spikes often correlate with economic recessions'
                ],
                interpretation: 'Unemployment below 4% indicates a tight labor market. Rates above 6% suggest labor market slack. Rapid increases may signal economic distress.'
            },
            'inflation': {
                title: '🔥 Inflation Rate Chart',
                description: 'This chart displays the year-over-year Consumer Price Index (CPI) inflation rate.',
                keyPoints: [
                    'Measures purchasing power changes over time',
                    'Fed target is 2% (shown as orange dashed line)',
                    'Calculated as 12-month percentage change',
                    'Reflects cost of living changes for consumers'
                ],
                interpretation: 'Inflation near 2% is considered healthy. Below 1% may indicate deflation risk. Above 4% suggests overheating economy and potential Fed intervention.'
            },
            'fedrate': {
                title: '🏦 Federal Funds Rate Chart',
                description: 'This chart shows the target Federal Funds Rate set by the Federal Reserve.',
                keyPoints: [
                    'Primary tool for Federal Reserve monetary policy',
                    'Influences all other interest rates in economy',
                    'Raised to combat inflation, lowered to stimulate growth',
                    'Zero or near-zero rates indicate crisis response'
                ],
                interpretation: 'Rising rates indicate Fed tightening policy to control inflation. Falling rates suggest economic stimulus. Rate changes impact mortgages, loans, and savings.'
            }
        };
        
        const info = chartInfo[infoType];
        
        if (!info) {
            modalBody.innerHTML = '<p>No information available for this chart.</p>';
            return;
        }
        
        modalTitle.textContent = info.title;
        
        modalBody.innerHTML = `
            <div style='margin-bottom: 24px;'>
                <p style='color: var(--text-primary); line-height: 1.8; font-size: 1.05rem;'>
                    ${info.description}
                </p>
            </div>
            
            <div style='background: var(--eco-gradient-soft); padding: 20px; border-radius: 12px; margin-bottom: 24px;'>
                <h4 style='margin-bottom: 12px; font-weight: 700; color: var(--text-primary);'>
                    <i class='fas fa-lightbulb' style='color: var(--eco-warning);'></i> Key Points
                </h4>
                <ul style='margin: 0; padding-left: 20px; color: var(--text-secondary); line-height: 1.8;'>
                    ${info.keyPoints.map(point => `<li>${point}</li>`).join('')}
                </ul>
            </div>
            
            <div style='background: rgba(59, 130, 246, 0.1); padding: 20px; border-radius: 12px; border-left: 4px solid var(--eco-primary);'>
                <h4 style='margin-bottom: 12px; font-weight: 700; color: var(--text-primary);'>
                    <i class='fas fa-book-open' style='color: var(--eco-primary);'></i> Interpretation
                </h4>
                <p style='color: var(--text-secondary); line-height: 1.7; margin: 0;'>
                    ${info.interpretation}
                </p>
            </div>
        `;
        
        this.openModal('chartInfoModal');
    }

    showTrendsModal() {
        const modalBody = document.getElementById('trendsContent');
        
        if (!this.cachedData.usData) {
            modalBody.innerHTML = '<p style="text-align: center; color: var(--text-tertiary);">No data available for trends analysis</p>';
            this.openModal('trendsModal');
            return;
        }
        
        const { usData } = this.cachedData;
        
        // Analyze trends
        const trends = this.analyzeTrends(usData);
        
        modalBody.innerHTML = `
            <div class='trend-item'>
                <h3><i class='fas fa-chart-line'></i> GDP Growth Trend</h3>
                <p>${trends.gdp}</p>
            </div>
            
            <div class='trend-item'>
                <h3><i class='fas fa-users'></i> Labor Market Trend</h3>
                <p>${trends.unemployment}</p>
            </div>
            
            <div class='trend-item'>
                <h3><i class='fas fa-fire'></i> Inflation Trend</h3>
                <p>${trends.inflation}</p>
            </div>
            
            <div class='trend-item'>
                <h3><i class='fas fa-university'></i> Monetary Policy Trend</h3>
                <p>${trends.fedRate}</p>
            </div>
            
            <div class='trend-item' style='background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%); border-left-color: #8b5cf6;'>
                <h3><i class='fas fa-crystal-ball'></i> Overall Economic Outlook</h3>
                <p>${trends.outlook}</p>
            </div>
        `;
        
        this.openModal('trendsModal');
    }

    analyzeTrends(data) {
        const gdpGrowth = parseFloat(data.gdpGrowth);
        const unemployment = parseFloat(data.unemployment);
        const inflation = parseFloat(data.inflation);
        const fedRate = parseFloat(data.fedRate);
        
        let trends = {};
        
        // GDP Trend
        if (isNaN(gdpGrowth)) {
            trends.gdp = 'Insufficient data to determine GDP growth trend.';
        } else if (gdpGrowth > 3) {
            trends.gdp = `Strong GDP growth at ${gdpGrowth}% indicates robust economic expansion. This suggests healthy business investment, consumer spending, and overall economic vitality.`;
        } else if (gdpGrowth > 2) {
            trends.gdp = `Moderate GDP growth at ${gdpGrowth}% reflects steady economic expansion. The economy is growing at a sustainable pace without overheating.`;
        } else if (gdpGrowth > 0) {
            trends.gdp = `Slow GDP growth at ${gdpGrowth}% suggests modest economic expansion. While positive, this indicates the economy may be facing headwinds.`;
        } else {
            trends.gdp = `Negative GDP growth at ${gdpGrowth}% signals economic contraction. This may indicate a recession or significant economic challenges.`;
        }
        
        // Unemployment Trend
        if (isNaN(unemployment)) {
            trends.unemployment = 'Insufficient data to determine labor market trend.';
        } else if (unemployment < 4) {
            trends.unemployment = `Very low unemployment at ${unemployment}% indicates an exceptionally tight labor market. This suggests strong job creation and may lead to wage pressures.`;
        } else if (unemployment < 5) {
            trends.unemployment = `Unemployment at ${unemployment}% is near full employment levels. The labor market is healthy with most job seekers finding employment.`;
        } else if (unemployment < 6.5) {
            trends.unemployment = `Unemployment at ${unemployment}% suggests some slack in the labor market. There is room for improvement in job creation and economic activity.`;
        } else {
            trends.unemployment = `Elevated unemployment at ${unemployment}% indicates significant labor market challenges. Job creation is weak and economic activity may be sluggish.`;
        }
        
        // Inflation Trend
        if (isNaN(inflation)) {
            trends.inflation = 'Insufficient data to determine inflation trend.';
        } else if (inflation < 1) {
            trends.inflation = `Low inflation at ${inflation}% is below the Federal Reserve's target. This may indicate weak demand and potential deflation risks.`;
        } else if (inflation >= 1 && inflation <= 2.5) {
            trends.inflation = `Inflation at ${inflation}% is near the Fed's 2% target, indicating price stability. This is considered ideal for a healthy economy.`;
        } else if (inflation > 2.5 && inflation <= 4) {
            trends.inflation = `Elevated inflation at ${inflation}% is above the Fed's target. This may prompt the Fed to tighten monetary policy to control rising prices.`;
        } else {
            trends.inflation = `High inflation at ${inflation}% significantly exceeds the Fed's target. This creates pressure on the Fed to aggressively raise interest rates.`;
        }
        
        // Fed Rate Trend
        if (isNaN(fedRate)) {
            trends.fedRate = 'Insufficient data to determine monetary policy trend.';
        } else if (fedRate < 1) {
            trends.fedRate = `Near-zero rates at ${fedRate}% indicate an accommodative monetary policy. The Fed is supporting economic growth and employment.`;
        } else if (fedRate < 3) {
            trends.fedRate = `Moderate rates at ${fedRate}% suggest a balanced monetary policy approach. The Fed is maintaining flexibility to respond to economic conditions.`;
        } else if (fedRate < 5) {
            trends.fedRate = `Elevated rates at ${fedRate}% indicate restrictive monetary policy. The Fed is actively working to control inflation and cool the economy.`;
        } else {
            trends.fedRate = `High rates at ${fedRate}% signal aggressive monetary tightening. The Fed is prioritizing inflation control over economic growth.`;
        }
        
        // Overall Outlook
        const healthScore = this.calculateEconomicHealth(data).score;
        if (healthScore >= 80) {
            trends.outlook = 'The US economy is in strong shape with robust growth, low unemployment, and controlled inflation. The outlook remains positive for continued expansion.';
        } else if (healthScore >= 60) {
            trends.outlook = 'The US economy is performing well overall, though some indicators suggest room for improvement. The outlook is cautiously optimistic.';
        } else if (healthScore >= 40) {
            trends.outlook = 'The US economy shows mixed signals with both strengths and weaknesses. Careful monitoring of key indicators is warranted.';
        } else {
            trends.outlook = 'The US economy faces significant challenges with weak performance across multiple indicators. Risks of recession or prolonged slowdown are elevated.';
        }
        
        return trends;
    }

    showError(message) {
        const container = document.querySelector('.container');
        if (container) {
            container.innerHTML = `
                <div class="eco-error" style="margin: 40px auto; max-width: 600px; padding: 40px;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 4rem; margin-bottom: 24px; color: var(--eco-danger);"></i>
                    <h3 style="margin-bottom: 16px; color: var(--text-primary); font-size: 1.5rem;">${message}</h3>
                    <button class="dashboard-btn" onclick="location.reload()" style="margin-top: 20px;">
                        <i class="fas fa-redo"></i> Reload Page
                    </button>
                </div>
            `;
        }
    }

    startAutoRefresh() {
        // Refresh every 10 minutes
        this.refreshInterval = setInterval(() => {
            console.log('🔄 Auto-refreshing dashboard...');
            this.loadDashboardData();
            this.loadMetricsSummary();
        }, 10 * 60 * 1000);
    }

    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }
}

// ========================================
// INITIALIZATION
// ========================================

let economicDashboard;

document.addEventListener('DOMContentLoaded', () => {
    economicDashboard = new EconomicDashboard();
    economicDashboard.init();
});

window.addEventListener('beforeunload', () => {
    if (economicDashboard) {
        economicDashboard.stopAutoRefresh();
    }
});

// Make globally accessible
window.economicDashboard = economicDashboard;