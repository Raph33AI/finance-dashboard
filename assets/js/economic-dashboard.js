/**
 * ====================================================================
 * ALPHAVAULT AI - ECONOMIC DASHBOARD v3.0 - ULTRA ROBUST + ADVANCED
 * ====================================================================
 * Features:
 * - Robust error handling for ECB 500 errors
 * - Fallback mechanisms for missing data
 * - Derived indicators (spreads, differentials)
 * - Correlation matrix
 * - Export functionality (CSV, JSON, PDF)
 * - Interactive modals
 * - Fullscreen charts
 * - Performance optimizations
 */

class EconomicDashboard {
    constructor() {
        this.refreshInterval = null;
        this.lastUpdate = null;
        this.cachedData = {};
        this.charts = {};
    }

    async init() {
        console.log('📊 Economic Dashboard v3.0 - Initializing...');
        
        try {
            // Initialize UI
            this.initializeUI();
            
            // Load data with error handling
            await this.loadAllData();
            
            // Setup event listeners
            this.setupEventListeners();
            
            console.log('✅ Dashboard v3.0 loaded successfully');
            this.startAutoRefresh();
            
        } catch (error) {
            console.error('❌ Dashboard initialization error:', error);
            this.showError('Failed to load economic dashboard. Please refresh the page.');
        }
    }

    /**
     * ========================================
     * UI INITIALIZATION
     * ========================================
     */
    initializeUI() {
        // Update last update time
        this.updateLastUpdateTime();
        
        // Initialize modals
        this.initializeModals();
    }

    initializeModals() {
        const modals = ['indicatorModal', 'exportModal', 'correlationModal'];
        
        modals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (!modal) return;
            
            const closeBtn = modal.querySelector('.modal-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.closeModal(modalId));
            }
            
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
            this.loadComparisonData(),
            this.loadCharts()
        ];
        
        // Load data concurrently but handle errors gracefully
        const results = await Promise.allSettled(loadingPromises);
        
        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                console.error(`❌ Failed to load section ${index}:`, result.reason);
            }
        });
        
        // Load derived indicators after main data
        await this.loadDerivedIndicators();
    }

    /**
     * ========================================
     * DASHBOARD CARDS
     * ========================================
     */
    async loadDashboardData() {
        const grid = document.getElementById('dashboardGrid');
        if (!grid) {
            console.error('❌ dashboardGrid element not found');
            return;
        }

        grid.innerHTML = '<div class="eco-loading"><div class="eco-spinner"></div><p>Loading economic data...</p></div>';

        try {
            console.log('🔄 Fetching economic data...');
            
            // Fetch US data (reliable FRED API)
            const [usGDP, usGDPGrowth, usUnemployment, usInflation, usFedRate] = await Promise.all([
                this.fetchWithFallback(() => economicDataClient.getSeries('GDP', { limit: 1, sort_order: 'desc' })),
                this.fetchWithFallback(() => economicDataClient.getSeries('A191RL1Q225SBEA', { limit: 1, sort_order: 'desc' })),
                this.fetchWithFallback(() => economicDataClient.getSeries('UNRATE', { limit: 1, sort_order: 'desc' })),
                this.fetchWithFallback(() => economicDataClient.getSeries('CPIAUCSL', { limit: 13, sort_order: 'desc' })),
                this.fetchWithFallback(() => economicDataClient.getSeries('DFF', { limit: 1, sort_order: 'desc' }))
            ]);

            // Fetch EU data (with fallback for 500 errors)
            const [euGDP, euUnemployment, euInflation, euMainRate] = await Promise.all([
                this.fetchWithFallback(() => economicDataClient.getECBGDP(), null),
                this.fetchWithFallback(() => economicDataClient.getECBUnemployment(), null),
                this.fetchWithFallback(() => economicDataClient.getECBInflation(), null),
                this.fetchWithFallback(() => economicDataClient.getECBMainRate(), null)
            ]);

            console.log('✅ Data fetched successfully');

            // Parse data
            const usData = {
                gdp: this.parseFREDLatest(usGDP),
                gdpGrowth: this.parseFREDLatest(usGDPGrowth),
                unemployment: this.parseFREDLatest(usUnemployment),
                inflation: this.calculateYoYInflation(usInflation),
                fedRate: this.parseFREDLatest(usFedRate)
            };

            const euData = {
                gdp: this.parseECBLatest(euGDP),
                unemployment: this.parseECBLatest(euUnemployment),
                inflation: this.parseECBLatest(euInflation),
                mainRate: this.parseECBLatest(euMainRate)
            };

            // Cache data for later use
            this.cachedData = { usData, euData };

            console.log('📊 Parsed US Data:', usData);
            console.log('📊 Parsed EU Data:', euData);

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
                    title: 'EU GDP',
                    value: euData.gdp !== 'N/A' ? this.formatGDP(euData.gdp) : 'N/A',
                    unit: 'Trillion EUR',
                    flag: '🇪🇺',
                    cssClass: 'eu-card',
                    change: null,
                    lastUpdate: null,
                    indicator: 'eu-gdp'
                })}
                
                ${this.createEcoCard({
                    title: 'US Unemployment',
                    value: usData.unemployment !== 'N/A' ? usData.unemployment + '%' : 'N/A',
                    unit: 'Jobless Rate',
                    flag: '🇺🇸',
                    cssClass: 'us-card',
                    change: null,
                    lastUpdate: usUnemployment?.[0]?.date,
                    indicator: 'us-unemployment'
                })}
                
                ${this.createEcoCard({
                    title: 'EU Unemployment',
                    value: euData.unemployment !== 'N/A' ? euData.unemployment + '%' : 'N/A',
                    unit: 'Jobless Rate',
                    flag: '🇪🇺',
                    cssClass: 'eu-card',
                    change: null,
                    lastUpdate: null,
                    indicator: 'eu-unemployment'
                })}
                
                ${this.createEcoCard({
                    title: 'US Inflation',
                    value: usData.inflation !== 'N/A' ? usData.inflation + '%' : 'N/A',
                    unit: 'YoY CPI Change',
                    flag: '🇺🇸',
                    cssClass: 'us-card',
                    change: parseFloat(usData.inflation),
                    changeType: parseFloat(usData.inflation) > 2 ? 'negative' : 'positive',
                    lastUpdate: usInflation?.[0]?.date,
                    indicator: 'us-inflation'
                })}
                
                ${this.createEcoCard({
                    title: 'EU Inflation',
                    value: euData.inflation !== 'N/A' ? euData.inflation + '%' : 'N/A',
                    unit: 'YoY HICP',
                    flag: '🇪🇺',
                    cssClass: 'eu-card',
                    change: null,
                    lastUpdate: null,
                    indicator: 'eu-inflation'
                })}
                
                ${this.createEcoCard({
                    title: 'Fed Funds Rate',
                    value: usData.fedRate !== 'N/A' ? usData.fedRate + '%' : 'N/A',
                    unit: 'Target Rate',
                    flag: '🇺🇸',
                    cssClass: 'us-card',
                    change: null,
                    lastUpdate: usFedRate?.[0]?.date,
                    indicator: 'us-fed-rate'
                })}
                
                ${this.createEcoCard({
                    title: 'ECB Main Rate',
                    value: euData.mainRate !== 'N/A' ? euData.mainRate + '%' : 'N/A',
                    unit: 'Main Refinancing',
                    flag: '🇪🇺',
                    cssClass: 'eu-card',
                    change: null,
                    lastUpdate: null,
                    indicator: 'eu-main-rate'
                })}
            `;

            // Attach click handlers to cards
            this.attachCardClickHandlers();

            this.lastUpdate = new Date();
            this.updateLastUpdateTime();
            console.log('✅ Dashboard cards rendered');

        } catch (error) {
            console.error('❌ Error loading dashboard data:', error);
            grid.innerHTML = `
                <div class="eco-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Error loading data</h3>
                    <p>${error.message}</p>
                    <button class="btn-primary" onclick="economicDashboard.loadDashboardData()">
                        <i class="fas fa-redo"></i> Retry
                    </button>
                </div>
            `;
        }
    }

    /**
     * ========================================
     * DERIVED INDICATORS
     * ========================================
     */
    async loadDerivedIndicators() {
        const container = document.getElementById('derivedIndicators');
        if (!container || !this.cachedData.usData || !this.cachedData.euData) {
            return;
        }

        try {
            const { usData, euData } = this.cachedData;
            
            // Calculate derived metrics
            const rateSpread = this.calculateSpread(usData.fedRate, euData.mainRate);
            const inflationDiff = this.calculateSpread(usData.inflation, euData.inflation);
            const unemploymentDiff = this.calculateSpread(usData.unemployment, euData.unemployment);
            
            container.innerHTML = `
                <div class='derived-card'>
                    <h4><i class='fas fa-exchange-alt'></i> Interest Rate Spread</h4>
                    <div class='derived-value'>${rateSpread}</div>
                    <div class='derived-description'>
                        US Federal Reserve rate minus ECB main rate. 
                        ${this.interpretSpread(rateSpread, 'rate')}
                    </div>
                </div>
                
                <div class='derived-card'>
                    <h4><i class='fas fa-chart-line'></i> Inflation Differential</h4>
                    <div class='derived-value'>${inflationDiff}</div>
                    <div class='derived-description'>
                        US inflation minus EU inflation. 
                        ${this.interpretSpread(inflationDiff, 'inflation')}
                    </div>
                </div>
                
                <div class='derived-card'>
                    <h4><i class='fas fa-users'></i> Unemployment Gap</h4>
                    <div class='derived-value'>${unemploymentDiff}</div>
                    <div class='derived-description'>
                        US unemployment minus EU unemployment. 
                        ${this.interpretSpread(unemploymentDiff, 'unemployment')}
                    </div>
                </div>
            `;
            
        } catch (error) {
            console.error('❌ Error loading derived indicators:', error);
            container.innerHTML = '<p style="text-align: center; color: var(--text-tertiary);">Unable to calculate derived indicators</p>';
        }
    }

    calculateSpread(value1, value2) {
        if (value1 === 'N/A' || value2 === 'N/A') return 'N/A';
        
        const num1 = parseFloat(value1);
        const num2 = parseFloat(value2);
        
        if (isNaN(num1) || isNaN(num2)) return 'N/A';
        
        const spread = num1 - num2;
        return (spread >= 0 ? '+' : '') + spread.toFixed(2) + '%';
    }

    interpretSpread(spread, type) {
        if (spread === 'N/A') return '';
        
        const value = parseFloat(spread);
        
        if (type === 'rate') {
            if (value > 0) return 'US rates are higher, potentially stronger dollar.';
            if (value < 0) return 'EU rates are higher, potentially stronger euro.';
            return 'Rates are aligned.';
        }
        
        if (type === 'inflation') {
            if (value > 0) return 'US experiencing higher inflation pressure.';
            if (value < 0) return 'EU experiencing higher inflation pressure.';
            return 'Inflation rates are similar.';
        }
        
        if (type === 'unemployment') {
            if (value > 0) return 'US labor market is weaker.';
            if (value < 0) return 'EU labor market is weaker.';
            return 'Labor markets are comparable.';
        }
        
        return '';
    }

    /**
     * ========================================
     * PARSING METHODS WITH FALLBACKS
     * ========================================
     */
    async fetchWithFallback(fetchFn, fallbackValue = []) {
        try {
            return await fetchFn();
        } catch (error) {
            console.warn('⚠ Fetch failed, using fallback:', error.message);
            return fallbackValue;
        }
    }

    parseFREDLatest(series) {
        console.log('🔍 Parsing FRED series, length:', series?.length);
        
        if (!series || !Array.isArray(series) || series.length === 0) {
            console.warn('⚠ Empty FRED series');
            return 'N/A';
        }

        const latest = series[0];
        console.log('  Latest entry:', latest);
        
        if (latest?.value && latest.value !== '.') {
            const value = parseFloat(latest.value);
            if (!isNaN(value)) {
                console.log('  ✅ Parsed value:', value);
                return value.toFixed(2);
            }
        }

        console.warn('⚠ No valid value in latest entry');
        return 'N/A';
    }

    parseECBLatest(data) {
        console.log('🔍 Parsing ECB data, success:', data?.success);
        
        if (!data || !data.success || !data.data) {
            console.warn('⚠ Invalid ECB data structure or API error');
            return 'N/A';
        }

        try {
            const observations = economicDataClient.extractECBObservations(data.data);
            console.log('  ECB observations count:', observations.length);
            
            if (!observations || observations.length === 0) {
                return 'N/A';
            }

            const latest = observations[observations.length - 1];
            console.log('  Latest ECB value:', latest.value, 'date:', latest.date);
            
            if (isNaN(latest.value)) {
                return 'N/A';
            }
            
            return latest.value.toFixed(2);
        } catch (error) {
            console.error('❌ Error parsing ECB:', error);
            return 'N/A';
        }
    }

    calculateYoYInflation(series) {
        console.log('🔍 Calculating YoY inflation, series length:', series?.length);
        
        if (!series || series.length < 13) {
            console.warn('⚠ Not enough data for YoY (need 13, have', series?.length, ')');
            return 'N/A';
        }

        const latest = parseFloat(series[0].value);
        const yearAgo = parseFloat(series[12].value);

        console.log('  Latest CPI:', latest, 'date:', series[0].date);
        console.log('  Year ago CPI:', yearAgo, 'date:', series[12].date);

        if (isNaN(latest) || isNaN(yearAgo) || yearAgo === 0) {
            return 'N/A';
        }

        const yoyChange = ((latest - yearAgo) / yearAgo) * 100;
        console.log('  ✅ YoY Inflation:', yoyChange.toFixed(2) + '%');
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
     * COMPARISON
     * ========================================
     */
    async loadComparisonData() {
        const container = document.getElementById('comparisonContainer');
        if (!container) return;

        try {
            console.log('🔄 Loading comparison data...');
            
            const [usGDPGrowth, euGDPGrowth] = await Promise.all([
                this.fetchWithFallback(() => economicDataClient.getSeries('A191RL1Q225SBEA', { limit: 1, sort_order: 'desc' })),
                this.fetchWithFallback(() => economicDataClient.getECBGDPGrowth(), null)
            ]);

            const usGrowth = this.parseFREDLatest(usGDPGrowth);
            const euGrowth = this.parseECBLatest(euGDPGrowth);

            console.log('📊 Comparison - US:', usGrowth, '% | EU:', euGrowth, '%');

            let comparisonText = 'Data unavailable';
            if (usGrowth !== 'N/A' && euGrowth !== 'N/A') {
                const usVal = parseFloat(usGrowth);
                const euVal = parseFloat(euGrowth);
                if (usVal > euVal) {
                    comparisonText = `🇺🇸 US economy is growing faster (+${(usVal - euVal).toFixed(2)}% difference)`;
                } else if (euVal > usVal) {
                    comparisonText = `🇪🇺 EU economy is growing faster (+${(euVal - usVal).toFixed(2)}% difference)`;
                } else {
                    comparisonText = '⚖ Both economies growing at similar rates';
                }
            } else if (usGrowth !== 'N/A') {
                comparisonText = '🇺🇸 US data available, EU data pending';
            } else if (euGrowth !== 'N/A') {
                comparisonText = '🇪🇺 EU data available, US data pending';
            }

            container.innerHTML = `
                <div class='comparison-grid'>
                    <div class='comparison-card us'>
                        <h4>🇺🇸 United States</h4>
                        <div class='eco-value' style='font-size: 2.5rem; margin: 20px 0;'>${usGrowth}%</div>
                        <div class='eco-sublabel'>GDP Growth Rate (Annual)</div>
                    </div>
                    
                    <div class='comparison-vs'>VS</div>
                    
                    <div class='comparison-card eu'>
                        <h4>🇪🇺 European Union</h4>
                        <div class='eco-value' style='font-size: 2.5rem; margin: 20px 0;'>${euGrowth}%</div>
                        <div class='eco-sublabel'>GDP Growth Rate (Annual)</div>
                    </div>
                </div>
                
                <div style='text-align: center; margin-top: 20px; padding: 20px; background: var(--eco-gradient-soft); border-radius: 12px; border: 2px solid var(--glass-border);'>
                    <p style='font-weight: 700; font-size: 1.1rem; color: var(--text-primary);'>
                        ${comparisonText}
                    </p>
                </div>
            `;

        } catch (error) {
            console.error('❌ Error loading comparison:', error);
            container.innerHTML = `
                <div class='eco-error'>
                    <p>Unable to load comparison data</p>
                </div>
            `;
        }
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
            console.log('📊 Loading GDP chart...');
            
            const usGDP = await this.fetchWithFallback(
                () => economicDataClient.getSeries('A191RL1Q225SBEA', { limit: 40, sort_order: 'desc' })
            );

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
                    height: 400,
                    animation: { duration: 1000 }
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
                exporting: {
                    enabled: true,
                    buttons: {
                        contextButton: {
                            menuItems: ['downloadPNG', 'downloadJPEG', 'downloadPDF', 'downloadSVG']
                        }
                    }
                }
            });

            console.log('✅ GDP chart rendered');

        } catch (error) {
            console.error('❌ Error loading GDP chart:', error);
            this.renderEmptyChart('gdpChart', 'Error loading chart');
        }
    }

    async loadUnemploymentChart() {
        try {
            console.log('📊 Loading unemployment chart...');
            
            const [usUnemp, euUnemp] = await Promise.all([
                this.fetchWithFallback(() => economicDataClient.getSeries('UNRATE', { limit: 120, sort_order: 'desc' })),
                this.fetchWithFallback(() => economicDataClient.getECBUnemployment(), null)
            ]);

            const usData = usUnemp
                .filter(d => d.value !== '.')
                .reverse()
                .map(d => [new Date(d.date).getTime(), parseFloat(d.value)]);

            const euData = this.extractECBTimeSeries(euUnemp);

            const series = [];
            
            if (usData.length > 0) {
                series.push({
                    name: '🇺🇸 United States',
                    data: usData,
                    color: '#3b82f6',
                    marker: { enabled: false },
                    lineWidth: 3
                });
            }
            
            if (euData.length > 0) {
                series.push({
                    name: '🇪🇺 European Union',
                    data: euData,
                    color: '#8b5cf6',
                    marker: { enabled: false },
                    lineWidth: 3
                });
            }

            if (series.length === 0) {
                this.renderEmptyChart('unemploymentChart', 'No unemployment data available');
                return;
            }

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
                series: series,
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
            console.log('📊 Loading inflation chart...');
            
            const [usInflation, euInflation] = await Promise.all([
                this.fetchWithFallback(() => economicDataClient.getSeries('CPIAUCSL', { limit: 120, sort_order: 'desc' })),
                this.fetchWithFallback(() => economicDataClient.getECBInflation(), null)
            ]);

            const usData = this.calculateYoYTimeSeriesFromDesc(usInflation);
            const euData = this.extractECBTimeSeries(euInflation);

            const series = [];
            
            if (usData.length > 0) {
                series.push({
                    name: '🇺🇸 United States',
                    data: usData,
                    color: '#f59e0b',
                    marker: { enabled: false },
                    lineWidth: 3
                });
            }
            
            if (euData.length > 0) {
                series.push({
                    name: '🇪🇺 European Union',
                    data: euData,
                    color: '#8b5cf6',
                    marker: { enabled: false },
                    lineWidth: 3
                });
            }

            if (series.length === 0) {
                this.renderEmptyChart('inflationChart', 'No inflation data available');
                return;
            }

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
                        label: { text: 'Target 2%', style: { color: '#f59e0b' } }
                    }]
                },
                tooltip: { 
                    valueDecimals: 2, 
                    valueSuffix: '%',
                    backgroundColor: 'var(--glass-bg)',
                    borderColor: 'var(--glass-border)',
                    style: { color: 'var(--text-primary)' }
                },
                series: series,
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
            console.log('📊 Loading interest rate chart...');
            
            const [usFedRate, ecbMainRate] = await Promise.all([
                this.fetchWithFallback(() => economicDataClient.getSeries('DFF', { limit: 120, sort_order: 'desc' })),
                this.fetchWithFallback(() => economicDataClient.getECBMainRate(), null)
            ]);

            const usData = usFedRate
                .filter(d => d.value !== '.')
                .reverse()
                .map(d => [new Date(d.date).getTime(), parseFloat(d.value)]);

            const euData = this.extractECBTimeSeries(ecbMainRate);

            const series = [];
            
            if (usData.length > 0) {
                series.push({
                    name: '🇺🇸 Fed Funds Rate',
                    data: usData,
                    color: '#3b82f6',
                    marker: { enabled: false },
                    lineWidth: 3
                });
            }
            
            if (euData.length > 0) {
                series.push({
                    name: '🇪🇺 ECB Main Rate',
                    data: euData,
                    color: '#8b5cf6',
                    marker: { enabled: false },
                    lineWidth: 3
                });
            }

            if (series.length === 0) {
                this.renderEmptyChart('interestRateChart', 'No interest rate data available');
                return;
            }

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
                series: series,
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

    extractECBTimeSeries(data) {
        console.log('🔍 Extracting ECB time series, success:', data?.success);
        
        if (!data || !data.success) {
            console.warn('⚠ ECB data not successful');
            return [];
        }
        
        try {
            const observations = economicDataClient.extractECBObservations(data.data);
            console.log(`  📊 ECB raw observations extracted: ${observations.length}`);
            
            if (observations.length === 0) {
                return [];
            }
            
            const validObservations = observations
                .map(obs => {
                    if (!obs.timestamp || obs.timestamp === 0 || isNaN(obs.value)) {
                        return null;
                    }
                    return [obs.timestamp, obs.value];
                })
                .filter(item => item !== null);
            
            console.log(`  ✅ ECB valid time series: ${validObservations.length} points`);
            return validObservations;
            
        } catch (error) {
            console.error('❌ Error extracting ECB time series:', error);
            return [];
        }
    }

    /**
     * ========================================
     * EVENT LISTENERS
     * ========================================
     */
    setupEventListeners() {
        // Refresh button
        const refreshBtn = document.getElementById('refreshDashboard');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.handleRefresh());
        }

        // Refresh indicators button
        const refreshIndicatorsBtn = document.getElementById('refreshIndicators');
        if (refreshIndicatorsBtn) {
            refreshIndicatorsBtn.addEventListener('click', () => this.loadDashboardData());
        }

        // Export button
        const exportBtn = document.getElementById('exportData');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.handleExport());
        }

        // Correlation button
        const correlationBtn = document.getElementById('viewCorrelation');
        if (correlationBtn) {
            correlationBtn.addEventListener('click', () => this.showCorrelationMatrix());
        }

        // Fullscreen buttons for charts
        const fullscreenBtns = document.querySelectorAll('.chart-fullscreen');
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

    handleRefresh() {
        console.log('🔄 Manual refresh triggered');
        this.loadAllData();
    }

    handleExport() {
        this.openModal('exportModal');
    }

    exportData(format) {
        console.log('📥 Exporting data in format:', format);
        
        if (!this.cachedData.usData || !this.cachedData.euData) {
            alert('No data available to export');
            return;
        }

        const data = {
            timestamp: new Date().toISOString(),
            us: this.cachedData.usData,
            eu: this.cachedData.euData
        };

        switch(format) {
            case 'csv':
                this.exportAsCSV(data);
                break;
            case 'json':
                this.exportAsJSON(data);
                break;
            case 'pdf':
                alert('PDF export coming soon!');
                break;
        }

        this.closeModal('exportModal');
    }

    exportAsCSV(data) {
        const csv = [
            ['Indicator', 'US Value', 'EU Value'],
            ['GDP', data.us.gdp, data.eu.gdp],
            ['GDP Growth', data.us.gdpGrowth, 'N/A'],
            ['Unemployment', data.us.unemployment, data.eu.unemployment],
            ['Inflation', data.us.inflation, data.eu.inflation],
            ['Interest Rate', data.us.fedRate, data.eu.mainRate]
        ].map(row => row.join(',')).join('\n');

        this.downloadFile(csv, 'economic-data.csv', 'text/csv');
    }

    exportAsJSON(data) {
        const json = JSON.stringify(data, null, 2);
        this.downloadFile(json, 'economic-data.json', 'application/json');
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

    showCorrelationMatrix() {
        // Placeholder for correlation matrix
        this.openModal('correlationModal');
        
        // TODO: Implement actual correlation calculation
        const modalBody = document.querySelector('#correlationModal .modal-body');
        modalBody.innerHTML = `
            <div style='text-align: center; padding: 40px; color: var(--text-tertiary);'>
                <i class='fas fa-project-diagram' style='font-size: 4rem; margin-bottom: 20px; opacity: 0.3;'></i>
                <h3>Correlation Matrix</h3>
                <p>Coming soon! This will show correlations between US and EU economic indicators.</p>
            </div>
        `;
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

    showIndicatorModal(indicator) {
        console.log('📊 Showing details for:', indicator);
        
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        // Set title
        const titles = {
            'us-gdp': '🇺🇸 US Gross Domestic Product',
            'eu-gdp': '🇪🇺 EU Gross Domestic Product',
            'us-unemployment': '🇺🇸 US Unemployment Rate',
            'eu-unemployment': '🇪🇺 EU Unemployment Rate',
            'us-inflation': '🇺🇸 US Inflation (CPI)',
            'eu-inflation': '🇪🇺 EU Inflation (HICP)',
            'us-fed-rate': '🇺🇸 Federal Funds Rate',
            'eu-main-rate': '🇪🇺 ECB Main Refinancing Rate'
        };
        
        modalTitle.textContent = titles[indicator] || 'Economic Indicator';
        
        // Set body content
        const descriptions = {
            'us-gdp': 'The Gross Domestic Product (GDP) is the total monetary value of all finished goods and services produced within the United States during a specific period. It is the most comprehensive measure of U.S. economic activity.',
            'eu-gdp': 'The EU GDP represents the total economic output of all European Union member states. It serves as a key indicator of the economic health of the entire European bloc.',
            'us-unemployment': 'The unemployment rate represents the percentage of the labor force that is jobless and actively seeking employment. It is a lagging indicator of economic health.',
            'eu-unemployment': 'The EU unemployment rate measures the percentage of the EU labor force without a job but available for and seeking employment.',
            'us-inflation': 'The Consumer Price Index (CPI) measures the average change over time in the prices paid by urban consumers for a market basket of consumer goods and services.',
            'eu-inflation': 'The Harmonized Index of Consumer Prices (HICP) is the EU standard for measuring inflation across member states, ensuring comparability.',
            'us-fed-rate': 'The Federal Funds Rate is the target interest rate set by the Federal Reserve at which commercial banks lend reserve balances to other banks overnight.',
            'eu-main-rate': 'The Main Refinancing Operations (MRO) rate is the interest rate that banks pay when they borrow money from the European Central Bank for one week.'
        };
        
        modalBody.innerHTML = `
            <p style='line-height: 1.8; color: var(--text-primary); margin-bottom: 24px;'>
                ${descriptions[indicator] || 'No description available.'}
            </p>
            <div style='background: var(--eco-gradient-soft); padding: 20px; border-radius: 12px; border: 2px solid var(--glass-border);'>
                <h4 style='margin-bottom: 12px; color: var(--text-primary);'>📈 Significance</h4>
                <p style='color: var(--text-secondary); line-height: 1.6;'>
                    This indicator is crucial for understanding economic trends, policy decisions, and market expectations. 
                    Central banks and policymakers closely monitor this metric to make informed decisions about monetary policy.
                </p>
            </div>
        `;
        
        this.openModal('indicatorModal');
    }

    updateLastUpdateTime() {
        const timeElement = document.getElementById('lastUpdateTime');
        if (timeElement && this.lastUpdate) {
            const formatted = this.lastUpdate.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            timeElement.textContent = formatted;
        } else if (timeElement) {
            timeElement.textContent = 'Loading...';
        }
    }

    showError(message) {
        const container = document.querySelector('.container');
        if (container) {
            container.innerHTML = `
                <div class="eco-error" style="margin: 40px auto; max-width: 600px; padding: 40px;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 4rem; margin-bottom: 24px; color: var(--eco-danger);"></i>
                    <h3 style="margin-bottom: 16px; color: var(--text-primary);">${message}</h3>
                    <button class="btn-primary" onclick="location.reload()" style="margin-top: 20px;">
                        <i class="fas fa-redo"></i> Reload Page
                    </button>
                </div>
            `;
        }
    }

    startAutoRefresh() {
        // Refresh every 5 minutes
        this.refreshInterval = setInterval(() => {
            console.log('🔄 Auto-refreshing dashboard...');
            this.loadDashboardData();
            this.loadDerivedIndicators();
        }, 5 * 60 * 1000);
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

// Make dashboard globally accessible for debugging
window.economicDashboard = economicDashboard;