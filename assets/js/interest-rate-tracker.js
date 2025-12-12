/**
 * ====================================================================
 * ALPHAVAULT AI - INTEREST RATE TRACKER (EMERGENCY FIX)
 * ====================================================================
 * Fixes:
 * - Load recent data only (last 20 years)
 * - Global modal function for HTML onclick
 */

class InterestRateTracker {
    constructor() {
        this.rates = {};
        this.ratesSeries = {};
        this.modals = {};
        this.charts = {};
        
        // Make instance globally accessible for onclick
        window.rateTracker = this;
    }

    async init() {
        console.log('🚀 Interest Rate Tracker initializing...');
        
        try {
            await this.loadCurrentRates();
            await this.loadYieldCurve();
            await this.loadHistoricalFedRate();
            await this.loadSpreadAnalysis();
            await this.loadProjections();
            await this.generateAIRecommendations();
            await this.loadEconomicImpact();
            
            console.log('✅ Interest Rate Tracker loaded successfully');
            
        } catch (error) {
            console.error('❌ Interest Rate Tracker error:', error);
        }
    }

    /* ========================================
       CURRENT RATES
       ======================================== */
    async loadCurrentRates() {
        const grid = document.getElementById('currentRatesGrid');
        
        try {
            console.log('📊 Loading current rates...');
            
            // Calculate date 60 days ago
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 60);
            
            const dateParams = {
                observation_start: startDate.toISOString().split('T')[0],
                observation_end: endDate.toISOString().split('T')[0]
            };
            
            const [fedFunds, treasury10Y, treasury2Y, mortgage30Y, treasury30Y, treasury5Y] = await Promise.all([
                economicDataClient.getSeries('DFF', dateParams),
                economicDataClient.getSeries('DGS10', dateParams),
                economicDataClient.getSeries('DGS2', dateParams),
                economicDataClient.getSeries('MORTGAGE30US', dateParams),
                economicDataClient.getSeries('DGS30', dateParams),
                economicDataClient.getSeries('DGS5', dateParams)
            ]);

            console.log('✅ Data loaded:', {
                fedFunds: fedFunds.length,
                treasury10Y: treasury10Y.length
            });

            this.ratesSeries.fed = fedFunds;
            this.ratesSeries.t10y = treasury10Y;
            this.ratesSeries.t2y = treasury2Y;
            this.ratesSeries.mortgage = mortgage30Y;
            this.ratesSeries.t30y = treasury30Y;
            this.ratesSeries.t5y = treasury5Y;

            const fedRate = this.parseLatest(fedFunds);
            const t10Y = this.parseLatest(treasury10Y);
            const t2Y = this.parseLatest(treasury2Y);
            const mortgage = this.parseLatest(mortgage30Y);
            const t30Y = this.parseLatest(treasury30Y);
            const t5Y = this.parseLatest(treasury5Y);

            this.rates.fed = fedRate;
            this.rates.t10y = t10Y;
            this.rates.t2y = t2Y;
            this.rates.mortgage = mortgage;
            this.rates.t30y = t30Y;
            this.rates.t5y = t5Y;

            const fedChange = this.calculateChange(fedFunds);
            const t10yChange = this.calculateChange(treasury10Y);
            const t2yChange = this.calculateChange(treasury2Y);
            const mortgageChange = this.calculateChange(mortgage30Y);
            const t30yChange = this.calculateChange(treasury30Y);
            const t5yChange = this.calculateChange(treasury5Y);

            console.log('📈 30-day changes:', { fedChange, t10yChange, t2yChange });

            grid.innerHTML = `
                ${this.createRateCard('Federal Funds Rate', fedRate + '%', 'Federal Reserve Target Rate', '<i class="fas fa-landmark"></i>', fedChange)}
                ${this.createRateCard('US Treasury 10Y', t10Y + '%', 'Long-term Government Yield', '<i class="fas fa-chart-line"></i>', t10yChange)}
                ${this.createRateCard('US Treasury 2Y', t2Y + '%', 'Short-term Government Yield', '<i class="fas fa-chart-area"></i>', t2yChange)}
                ${this.createRateCard('US Mortgage 30Y', mortgage + '%', 'Average Fixed Mortgage Rate', '<i class="fas fa-home"></i>', mortgageChange)}
                ${this.createRateCard('US Treasury 5Y', t5Y + '%', 'Medium-term Government Yield', '<i class="fas fa-signal"></i>', t5yChange)}
                ${this.createRateCard('US Treasury 30Y', t30Y + '%', 'Ultra-long Government Yield', '<i class="fas fa-trophy"></i>', t30yChange)}
            `;

        } catch (error) {
            console.error('❌ Error loading current rates:', error);
            grid.innerHTML = '<div style="padding: 40px; text-align: center; color: var(--text-secondary);">Error loading rates. Please refresh.</div>';
        }
    }

    createRateCard(title, value, sublabel, icon, change) {
        const changeClass = change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral';
        const changeIcon = change > 0 ? '<i class="fas fa-arrow-up"></i>' : change < 0 ? '<i class="fas fa-arrow-down"></i>' : '<i class="fas fa-minus"></i>';
        
        return `
            <div class='rate-display'>
                <div class='rate-header'>
                    <h3 class='rate-title'>${title}</h3>
                    <div class='rate-icon'>${icon}</div>
                </div>
                <div class='rate-value-large'>${value}</div>
                <div class='rate-sublabel'>${sublabel}</div>
                <div class='rate-change ${changeClass}'>
                    ${changeIcon} ${Math.abs(change).toFixed(2)}% (30 days)
                </div>
            </div>
        `;
    }

    /* ========================================
       YIELD CURVE
       ======================================== */
    async loadYieldCurve() {
        try {
            console.log('📊 Loading yield curve...');
            
            const [m3, m6, y1, y2, y5, y7, y10, y20, y30] = await Promise.all([
                economicDataClient.getSeries('DGS3MO', { limit: 1 }),
                economicDataClient.getSeries('DGS6MO', { limit: 1 }),
                economicDataClient.getSeries('DGS1', { limit: 1 }),
                economicDataClient.getSeries('DGS2', { limit: 1 }),
                economicDataClient.getSeries('DGS5', { limit: 1 }),
                economicDataClient.getSeries('DGS7', { limit: 1 }),
                economicDataClient.getSeries('DGS10', { limit: 1 }),
                economicDataClient.getSeries('DGS20', { limit: 1 }),
                economicDataClient.getSeries('DGS30', { limit: 1 })
            ]);

            const yieldData = [
                { name: '3M', value: this.parseLatest(m3) },
                { name: '6M', value: this.parseLatest(m6) },
                { name: '1Y', value: this.parseLatest(y1) },
                { name: '2Y', value: this.parseLatest(y2) },
                { name: '5Y', value: this.parseLatest(y5) },
                { name: '7Y', value: this.parseLatest(y7) },
                { name: '10Y', value: this.parseLatest(y10) },
                { name: '20Y', value: this.parseLatest(y20) },
                { name: '30Y', value: this.parseLatest(y30) }
            ];

            this.charts.yieldCurve = Highcharts.chart('yieldCurveChart', {
                chart: { type: 'spline', backgroundColor: 'transparent' },
                title: { 
                    text: 'US Treasury Yield Curve',
                    style: { color: 'var(--text-primary)', fontWeight: '800', fontSize: '1.3rem' }
                },
                subtitle: { text: 'Current market snapshot', style: { color: 'var(--text-secondary)' } },
                xAxis: { 
                    categories: yieldData.map(d => d.name),
                    labels: { style: { color: 'var(--text-secondary)', fontWeight: '600' } }
                },
                yAxis: { 
                    title: { text: 'Yield (%)', style: { color: 'var(--text-secondary)', fontWeight: '700' } },
                    labels: { style: { color: 'var(--text-secondary)' } },
                    gridLineColor: 'var(--glass-border)'
                },
                tooltip: {
                    valueSuffix: '%', valueDecimals: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderColor: '#667eea', borderRadius: 8
                },
                plotOptions: {
                    spline: {
                        marker: { enabled: true, radius: 6, fillColor: '#667eea' },
                        lineWidth: 4
                    }
                },
                series: [{
                    name: 'Treasury Yield',
                    data: yieldData.map(d => parseFloat(d.value)),
                    color: '#667eea'
                }],
                credits: { enabled: false },
                legend: { enabled: false }
            });

            console.log('✅ Yield curve chart created');

        } catch (error) {
            console.error('❌ Error loading yield curve:', error);
        }
    }

    /* ========================================
       HISTORICAL FED RATE (LAST 20 YEARS)
       ======================================== */
    async loadHistoricalFedRate() {
        try {
            console.log('📊 Loading historical Fed rate (last 20 years)...');
            
            // Get data from last 20 years
            const endDate = new Date();
            const startDate = new Date();
            startDate.setFullYear(startDate.getFullYear() - 20);
            
            const fedData = await economicDataClient.getSeries('DFF', {
                observation_start: startDate.toISOString().split('T')[0],
                observation_end: endDate.toISOString().split('T')[0]
            });

            console.log(`✅ Loaded ${fedData.length} Fed Funds Rate observations`);

            const fedSeries = fedData
                .filter(d => d.value !== '.')
                .map(d => [new Date(d.date).getTime(), parseFloat(d.value)])
                .sort((a, b) => a[0] - b[0]);

            console.log(`✅ Processed ${fedSeries.length} valid data points`);
            
            if (fedSeries.length > 0) {
                const firstDate = new Date(fedSeries[0][0]).toLocaleDateString();
                const lastDate = new Date(fedSeries[fedSeries.length - 1][0]).toLocaleDateString();
                console.log(`📅 Date range: ${firstDate} to ${lastDate}`);
            }

            this.charts.historicalFed = Highcharts.chart('historicalFedChart', {
                chart: { type: 'area', backgroundColor: 'transparent', zoomType: 'x' },
                title: { 
                    text: 'Federal Funds Rate - Historical Evolution',
                    style: { color: 'var(--text-primary)', fontWeight: '800', fontSize: '1.3rem' }
                },
                subtitle: { text: 'Click and drag to zoom', style: { color: 'var(--text-secondary)' } },
                xAxis: { type: 'datetime', labels: { style: { color: 'var(--text-secondary)' } } },
                yAxis: { 
                    title: { text: 'Rate (%)', style: { color: 'var(--text-secondary)', fontWeight: '700' } },
                    labels: { style: { color: 'var(--text-secondary)' } },
                    gridLineColor: 'var(--glass-border)'
                },
                tooltip: {
                    valueSuffix: '%', valueDecimals: 2, shared: true,
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderColor: '#3b82f6', borderRadius: 8
                },
                plotOptions: {
                    area: {
                        fillColor: {
                            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                            stops: [[0, 'rgba(59, 130, 246, 0.5)'], [1, 'rgba(59, 130, 246, 0.05)']]
                        },
                        marker: { enabled: false },
                        lineWidth: 3,
                        lineColor: '#3b82f6',
                        threshold: null
                    }
                },
                series: [{ name: 'Fed Funds Rate', data: fedSeries }],
                credits: { enabled: false },
                legend: { enabled: false }
            });

            console.log('✅ Historical Fed chart created');

        } catch (error) {
            console.error('❌ Error loading historical Fed rate:', error);
        }
    }

    /* ========================================
       PROJECTIONS
       ======================================== */
    async loadProjections() {
        const container = document.getElementById('projectionsContainer');
        
        const currentFed = parseFloat(this.rates.fed) || 4.50;

        const scenarios = [
            {
                name: 'Optimistic', class: 'optimistic',
                icon: '<i class="fas fa-arrow-trend-down"></i>',
                fedRate: (currentFed - 1.5).toFixed(2),
                description: 'Inflation under control, Fed pivots to rate cuts to support growth.',
                probability: '35%',
                impacts: [
                    { label: 'Stock Market', value: 'Bullish' },
                    { label: 'Bonds', value: 'Positive' },
                    { label: 'Real Estate', value: 'Recovery' }
                ]
            },
            {
                name: 'Base Case', class: 'base',
                icon: '<i class="fas fa-equals"></i>',
                fedRate: (currentFed - 0.75).toFixed(2),
                description: 'Gradual policy normalization, economy achieves soft landing.',
                probability: '50%',
                impacts: [
                    { label: 'Stock Market', value: 'Neutral' },
                    { label: 'Bonds', value: 'Stable' },
                    { label: 'Real Estate', value: 'Moderate' }
                ]
            },
            {
                name: 'Pessimistic', class: 'pessimistic',
                icon: '<i class="fas fa-arrow-trend-up"></i>',
                fedRate: (currentFed + 0.5).toFixed(2),
                description: 'Persistent inflation forces Fed to maintain restrictive policy longer.',
                probability: '15%',
                impacts: [
                    { label: 'Stock Market', value: 'Bearish' },
                    { label: 'Bonds', value: 'Volatile' },
                    { label: 'Real Estate', value: 'Pressured' }
                ]
            }
        ];

        const scenarioCards = scenarios.map(scenario => `
            <div class='scenario-card ${scenario.class}'>
                <div class='scenario-header'>
                    <div class='scenario-icon'>${scenario.icon}</div>
                    <div>
                        <h3 class='scenario-title'>${scenario.name} Scenario</h3>
                        <div style='font-size: 0.85rem; color: var(--text-secondary); font-weight: 600;'>
                            Probability: ${scenario.probability}
                        </div>
                    </div>
                </div>
                <div class='scenario-rate'>${scenario.fedRate}%</div>
                <div class='scenario-description'>${scenario.description}</div>
                <div class='scenario-impact'>
                    <div class='scenario-impact-title'>12-Month Outlook</div>
                    ${scenario.impacts.map(impact => `
                        <div class='scenario-impact-item'>
                            <span class='scenario-impact-label'>${impact.label}:</span>
                            <span class='scenario-impact-value'>${impact.value}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');

        container.innerHTML = `<div class='projection-scenarios'>${scenarioCards}</div>`;

        await this.loadProjectionChart();
    }

    async loadProjectionChart() {
        try {
            const currentDate = new Date();
            const currentFed = parseFloat(this.rates.fed) || 4.50;
            
            const optimisticData = [];
            const baseData = [];
            const pessimisticData = [];
            
            for (let i = 0; i <= 12; i++) {
                const date = new Date(currentDate);
                date.setMonth(date.getMonth() + i);
                const timestamp = date.getTime();
                
                optimisticData.push([timestamp, Math.max(0, currentFed - (i * 0.125))]);
                baseData.push([timestamp, Math.max(0, currentFed - (i * 0.0625))]);
                pessimisticData.push([timestamp, currentFed + (i * 0.042)]);
            }

            this.charts.projection = Highcharts.chart('projectionChart', {
                chart: { type: 'line', backgroundColor: 'transparent' },
                title: { 
                    text: 'Fed Funds Rate - 12-Month Projections',
                    style: { color: 'var(--text-primary)', fontWeight: '800', fontSize: '1.3rem' }
                },
                subtitle: { text: 'Scenario-based forecasts', style: { color: 'var(--text-secondary)' } },
                xAxis: { type: 'datetime', labels: { style: { color: 'var(--text-secondary)' } } },
                yAxis: { 
                    title: { text: 'Rate (%)', style: { color: 'var(--text-secondary)', fontWeight: '700' } },
                    labels: { style: { color: 'var(--text-secondary)' } },
                    gridLineColor: 'var(--glass-border)', min: 0
                },
                tooltip: { valueSuffix: '%', valueDecimals: 2, shared: true, backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: 8 },
                plotOptions: { line: { marker: { enabled: false }, lineWidth: 3 } },
                series: [
                    { name: 'Optimistic', data: optimisticData, color: '#10b981', dashStyle: 'Dash' },
                    { name: 'Base Case', data: baseData, color: '#667eea', lineWidth: 4 },
                    { name: 'Pessimistic', data: pessimisticData, color: '#ef4444', dashStyle: 'Dash' }
                ],
                credits: { enabled: false },
                legend: { enabled: true, itemStyle: { color: 'var(--text-primary)', fontWeight: '600' } }
            });
            
        } catch (error) {
            console.error('❌ Error loading projection chart:', error);
        }
    }

    /* ========================================
       AI RECOMMENDATIONS
       ======================================== */
    async generateAIRecommendations() {
        const container = document.getElementById('aiRecommendations');
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

        const fedRate = parseFloat(this.rates.fed) || 4.50;
        const t10y = parseFloat(this.rates.t10y) || 4.25;
        const t2y = parseFloat(this.rates.t2y) || 4.55;
        const spread = (t10y - t2y).toFixed(2);

        const insights = [
            {
                title: 'Yield Curve Signal',
                icon: spread < 0 ? 'bearish' : spread < 0.5 ? 'neutral' : 'bullish',
                sentiment: spread < 0 ? 'bearish' : spread < 0.5 ? 'neutral' : 'bullish',
                content: spread < 0 
                    ? `The yield curve is <strong>inverted</strong> (10Y-2Y spread: ${spread}%), historically a recession indicator.`
                    : spread < 0.5
                    ? `The yield curve is <strong>flattening</strong> (10Y-2Y spread: ${spread}%). Monitor Fed policy closely.`
                    : `The yield curve is <strong>normal</strong> (10Y-2Y spread: ${spread}%), indicating healthy economic expectations.`
            },
            {
                title: 'Fed Policy Stance',
                icon: fedRate > 5 ? 'bearish' : fedRate > 4 ? 'neutral' : 'bullish',
                sentiment: fedRate > 5 ? 'bearish' : fedRate > 4 ? 'neutral' : 'bullish',
                content: `Fed Funds Rate at <strong>${fedRate}%</strong> suggests ${fedRate > 5 ? 'restrictive' : fedRate > 4 ? 'neutral' : 'accommodative'} monetary policy.`
            },
            {
                title: 'Fixed Income Opportunity',
                icon: 'bullish', sentiment: 'bullish',
                content: `With 10-Year Treasury at <strong>${t10y}%</strong>, fixed income offers attractive real yields.`
            },
            {
                title: 'Mortgage Market',
                icon: this.rates.mortgage > 7 ? 'bearish' : 'neutral',
                sentiment: this.rates.mortgage > 7 ? 'bearish' : 'neutral',
                content: `30-Year Mortgage at <strong>${this.rates.mortgage}%</strong> ${this.rates.mortgage > 7 ? 'is pressuring housing affordability' : 'remains elevated but manageable'}.`
            }
        ];

        const insightsHTML = insights.map(insight => `
            <div class='ai-insight-card'>
                <div class='insight-header'>
                    <div class='insight-icon ${insight.icon}'>
                        <i class="fas fa-${insight.icon === 'bullish' ? 'arrow-trend-up' : insight.icon === 'bearish' ? 'arrow-trend-down' : 'minus'}"></i>
                    </div>
                    <h3 class='insight-title'>${insight.title}</h3>
                </div>
                <p class='insight-content'>${insight.content}</p>
                <div class='ai-sentiment-badge ${insight.sentiment}'>
                    <i class="fas fa-circle"></i>
                    ${insight.sentiment.charAt(0).toUpperCase() + insight.sentiment.slice(1)} Signal
                </div>
            </div>
        `).join('');

        container.innerHTML = `
            <div class='ai-recommendations-section'>
                <div class='ai-header'>
                    <div class='ai-icon'><i class='fas fa-brain'></i></div>
                    <div class='ai-title-section'>
                        <h2>AI Market Intelligence</h2>
                        <div class='ai-date'>Updated: ${today}</div>
                    </div>
                </div>
                <div class='ai-insights-grid'>${insightsHTML}</div>
            </div>
        `;
    }

    /* ========================================
       SPREAD ANALYSIS
       ======================================== */
    async loadSpreadAnalysis() {
        const container = document.getElementById('spreadAnalysis');
        
        const t10y = parseFloat(this.rates.t10y) || 4.25;
        const t2y = parseFloat(this.rates.t2y) || 4.55;
        const t30y = parseFloat(this.rates.t30y) || 4.45;
        const t5y = parseFloat(this.rates.t5y) || 4.15;
        
        const spreads = [
            {
                title: '10Y - 2Y Spread',
                value: (t10y - t2y).toFixed(2),
                interpretation: (t10y - t2y) < -0.2 ? 'Deeply Inverted' : (t10y - t2y) < 0 ? 'Inverted' : (t10y - t2y) < 0.5 ? 'Flattening' : 'Normal',
                class: (t10y - t2y) < 0 ? 'inverted' : (t10y - t2y) < 0.5 ? 'flat' : 'normal'
            },
            {
                title: '30Y - 10Y Spread',
                value: (t30y - t10y).toFixed(2),
                interpretation: (t30y - t10y) < 0.3 ? 'Compressed' : (t30y - t10y) < 0.7 ? 'Moderate' : 'Steep',
                class: (t30y - t10y) < 0.3 ? 'flat' : 'normal'
            },
            {
                title: '5Y - 2Y Spread',
                value: (t5y - t2y).toFixed(2),
                interpretation: (t5y - t2y) < -0.1 ? 'Inverted' : (t5y - t2y) < 0.3 ? 'Flat' : 'Normal',
                class: (t5y - t2y) < 0 ? 'inverted' : (t5y - t2y) < 0.3 ? 'flat' : 'normal'
            }
        ];

        container.innerHTML = `<div class='spread-analysis-grid'>
            ${spreads.map(s => `
                <div class='spread-card'>
                    <h3 class='spread-title'>${s.title}</h3>
                    <div class='spread-value'>${s.value}%</div>
                    <div class='spread-interpretation ${s.class}'>${s.interpretation}</div>
                </div>
            `).join('')}
        </div>`;
    }

    /* ========================================
       ECONOMIC IMPACT
       ======================================== */
    async loadEconomicImpact() {
        const container = document.getElementById('economicImpact');
        
        const impacts = [
            {
                icon: '<i class="fas fa-home"></i>',
                title: 'Housing Market',
                description: `With mortgage rates at ${this.rates.mortgage}%, housing affordability has declined significantly.`,
                metrics: [{ label: 'Affordability', value: 'Low' }, { label: 'Sales Trend', value: 'Declining' }]
            },
            {
                icon: '<i class="fas fa-building"></i>',
                title: 'Corporate Debt',
                description: `Elevated interest rates increase borrowing costs for businesses.`,
                metrics: [{ label: 'Refinancing', value: 'Costly' }, { label: 'CapEx', value: 'Reduced' }]
            },
            {
                icon: '<i class="fas fa-piggy-bank"></i>',
                title: 'Consumer Spending',
                description: `Higher rates incentivize saving over spending.`,
                metrics: [{ label: 'Savings Rate', value: 'Rising' }, { label: 'Credit Use', value: 'Declining' }]
            },
            {
                icon: '<i class="fas fa-chart-line"></i>',
                title: 'Equity Markets',
                description: `Restrictive monetary policy typically pressures equity valuations.`,
                metrics: [{ label: 'P/E Multiple', value: 'Compressed' }, { label: 'Preference', value: 'Value' }]
            }
        ];

        container.innerHTML = `<div class='economic-impact-grid'>
            ${impacts.map(i => `
                <div class='impact-card'>
                    <div class='impact-header'>
                        <div class='impact-icon'>${i.icon}</div>
                        <h3 class='impact-title'>${i.title}</h3>
                    </div>
                    <p class='impact-description'>${i.description}</p>
                    <div class='impact-metrics'>
                        ${i.metrics.map(m => `
                            <div class='impact-metric'>
                                <div class='impact-metric-label'>${m.label}</div>
                                <div class='impact-metric-value'>${m.value}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
        </div>`;
    }

    /* ========================================
       MODALS - GLOBAL FUNCTION
       ======================================== */
    openModal(chartId) {
        console.log(`🔓 Opening modal: ${chartId}`);
        
        const modalId = chartId + 'Modal';
        let modal = document.getElementById(modalId);
        
        if (!modal) {
            modal = this.createModal(chartId);
            document.body.appendChild(modal);
        }
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        setTimeout(() => this.renderModalChart(chartId), 200);
    }

    createModal(chartId) {
        const modal = document.createElement('div');
        modal.id = chartId + 'Modal';
        modal.className = 'modal';
        
        const titles = {
            yieldCurveChart: 'US Treasury Yield Curve',
            historicalFedChart: 'Federal Funds Rate - Historical',
            projectionChart: 'Rate Projections - 12 Months'
        };

        const descriptions = {
            yieldCurveChart: 'The yield curve represents bond yields across maturities. Inversion historically precedes recessions.',
            historicalFedChart: 'The Federal Funds Rate is the Fed\'s primary monetary policy tool.',
            projectionChart: 'Scenario-based forecasts from current economic conditions and Fed communications.'
        };

        modal.innerHTML = `
            <div class='modal-content'>
                <div class='modal-header'>
                    <h2><i class='fas fa-chart-area'></i> ${titles[chartId]}</h2>
                    <button class='modal-close' onclick="window.rateTracker.closeModal('${chartId}Modal')">
                        <i class='fas fa-times'></i>
                    </button>
                </div>
                <div class='modal-body'>
                    <div id='${chartId}ModalChart' class='modal-chart'></div>
                    <div class='modal-info'>
                        <h3><i class='fas fa-info-circle'></i> About This Chart</h3>
                        <p>${descriptions[chartId]}</p>
                    </div>
                </div>
            </div>
        `;
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal(modal.id);
        });
        
        return modal;
    }

    renderModalChart(sourceChartId) {
        const modalChartId = sourceChartId + 'ModalChart';
        const chartKey = sourceChartId.replace('Chart', '');
        const sourceChart = this.charts[chartKey];
        
        if (!sourceChart) {
            console.error(`Chart not found: ${chartKey}`);
            return;
        }

        try {
            const options = JSON.parse(JSON.stringify(sourceChart.userOptions));
            options.chart = options.chart || {};
            options.chart.height = 600;
            Highcharts.chart(modalChartId, options);
        } catch (error) {
            console.error('Error rendering modal chart:', error);
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    /* ========================================
       HELPERS
       ======================================== */
    parseLatest(series) {
        if (!series || !Array.isArray(series) || series.length === 0) return 'N/A';
        for (let i = series.length - 1; i >= 0; i--) {
            if (series[i].value !== '.' && series[i].value !== null) {
                return parseFloat(series[i].value).toFixed(2);
            }
        }
        return 'N/A';
    }

    calculateChange(series) {
        if (!series || !Array.isArray(series) || series.length < 2) return 0;
        
        const validData = series.filter(d => d.value !== '.' && d.value !== null);
        if (validData.length < 2) return 0;
        
        const latest = parseFloat(validData[validData.length - 1].value);
        const latestDate = new Date(validData[validData.length - 1].date);
        const thirtyDaysAgo = new Date(latestDate);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        let closestPoint = validData[0];
        let closestDiff = Math.abs(new Date(closestPoint.date).getTime() - thirtyDaysAgo.getTime());
        
        for (let i = 1; i < validData.length - 1; i++) {
            const diff = Math.abs(new Date(validData[i].date).getTime() - thirtyDaysAgo.getTime());
            if (diff < closestDiff) {
                closestDiff = diff;
                closestPoint = validData[i];
            }
        }
        
        return latest - parseFloat(closestPoint.value);
    }
}

let interestRateTracker;
document.addEventListener('DOMContentLoaded', () => {
    interestRateTracker = new InterestRateTracker();
    interestRateTracker.init();
});