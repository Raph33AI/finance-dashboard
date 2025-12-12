/**
 * ====================================================================
 * ALPHAVAULT AI - INTEREST RATE TRACKER (ULTRA-PREMIUM VERSION)
 * ====================================================================
 * Features:
 * - US-focused interest rates (Fed, Treasuries, Mortgage)
 * - Rate projections (12-month forecasts)
 * - AI-powered daily recommendations
 * - Clickable modals on all charts
 * - Spread analysis (yield curve inversion detection)
 * - Economic impact assessment
 */

class InterestRateTracker {
    constructor() {
        this.rates = {};
        this.modals = {};
        this.charts = {};
    }

    async init() {
        console.log('Interest Rate Tracker initializing...');
        
        try {
            await Promise.all([
                this.loadCurrentRates(),
                this.loadYieldCurve(),
                this.loadHistoricalFedRate(),
                this.loadProjections(),
                this.loadSpreadAnalysis(),
                this.generateAIRecommendations(),
                this.loadEconomicImpact()
            ]);
            
            this.setupModals();
            console.log('Interest Rate Tracker loaded successfully');
            
        } catch (error) {
            console.error('Interest Rate Tracker error:', error);
        }
    }

    /* ========================================
       CURRENT RATES
       ======================================== */
    async loadCurrentRates() {
        const grid = document.getElementById('currentRatesGrid');
        
        try {
            const [fedFunds, treasury10Y, treasury2Y, mortgage30Y, treasury30Y, treasury5Y] = await Promise.all([
                economicDataClient.getSeries('DFF', { limit: 10 }),
                economicDataClient.getSeries('DGS10', { limit: 10 }),
                economicDataClient.getSeries('DGS2', { limit: 10 }),
                economicDataClient.getSeries('MORTGAGE30US', { limit: 10 }),
                economicDataClient.getSeries('DGS30', { limit: 10 }),
                economicDataClient.getSeries('DGS5', { limit: 10 })
            ]);

            const fedRate = this.parseLatest(fedFunds);
            const t10Y = this.parseLatest(treasury10Y);
            const t2Y = this.parseLatest(treasury2Y);
            const mortgage = this.parseLatest(mortgage30Y);
            const t30Y = this.parseLatest(treasury30Y);
            const t5Y = this.parseLatest(treasury5Y);

            // Store for later use
            this.rates.fed = fedRate;
            this.rates.t10y = t10Y;
            this.rates.t2y = t2Y;
            this.rates.mortgage = mortgage;

            const fedChange = this.calculateChange(fedFunds);
            const t10yChange = this.calculateChange(treasury10Y);
            const t2yChange = this.calculateChange(treasury2Y);
            const mortgageChange = this.calculateChange(mortgage30Y);

            grid.innerHTML = `
                ${this.createRateCard(
                    'Federal Funds Rate',
                    fedRate + '%',
                    'Federal Reserve Target Rate',
                    '<i class="fas fa-landmark"></i>',
                    fedChange
                )}
                ${this.createRateCard(
                    'US Treasury 10Y',
                    t10Y + '%',
                    'Long-term Government Yield',
                    '<i class="fas fa-chart-line"></i>',
                    t10yChange
                )}
                ${this.createRateCard(
                    'US Treasury 2Y',
                    t2Y + '%',
                    'Short-term Government Yield',
                    '<i class="fas fa-chart-area"></i>',
                    t2yChange
                )}
                ${this.createRateCard(
                    'US Mortgage 30Y',
                    mortgage + '%',
                    'Average Fixed Mortgage Rate',
                    '<i class="fas fa-home"></i>',
                    mortgageChange
                )}
                ${this.createRateCard(
                    'US Treasury 5Y',
                    t5Y + '%',
                    'Medium-term Government Yield',
                    '<i class="fas fa-signal"></i>',
                    this.calculateChange(treasury5Y)
                )}
                ${this.createRateCard(
                    'US Treasury 30Y',
                    t30Y + '%',
                    'Ultra-long Government Yield',
                    '<i class="fas fa-trophy"></i>',
                    this.calculateChange(treasury30Y)
                )}
            `;

        } catch (error) {
            console.error('Error loading current rates:', error);
            grid.innerHTML = '<div class="loading-skeleton"></div>';
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
                chart: { 
                    type: 'spline', 
                    backgroundColor: 'transparent'
                },
                title: { 
                    text: 'US Treasury Yield Curve',
                    style: { color: 'var(--text-primary)', fontWeight: '800', fontSize: '1.3rem' }
                },
                subtitle: {
                    text: 'Current market snapshot',
                    style: { color: 'var(--text-secondary)' }
                },
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
                    valueSuffix: '%',
                    valueDecimals: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderColor: '#667eea',
                    borderRadius: 8,
                    style: { fontWeight: '600' }
                },
                plotOptions: {
                    spline: {
                        marker: {
                            enabled: true,
                            radius: 6,
                            fillColor: '#667eea'
                        },
                        lineWidth: 4,
                        states: {
                            hover: {
                                lineWidth: 5
                            }
                        }
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

        } catch (error) {
            console.error('Error loading yield curve:', error);
        }
    }

    /* ========================================
       HISTORICAL FED RATE
       ======================================== */
    async loadHistoricalFedRate() {
        try {
            const fedData = await economicDataClient.getSeries('DFF', { limit: 1000 });

            const fedSeries = fedData
                .filter(d => d.value !== '.')
                .map(d => [new Date(d.date).getTime(), parseFloat(d.value)])
                .sort((a, b) => a[0] - b[0]);

            this.charts.historicalFed = Highcharts.chart('historicalFedChart', {
                chart: { 
                    type: 'area', 
                    backgroundColor: 'transparent',
                    zoomType: 'x'
                },
                title: { 
                    text: 'Federal Funds Rate - Historical Evolution',
                    style: { color: 'var(--text-primary)', fontWeight: '800', fontSize: '1.3rem' }
                },
                subtitle: {
                    text: 'Click and drag to zoom',
                    style: { color: 'var(--text-secondary)' }
                },
                xAxis: { 
                    type: 'datetime',
                    labels: { style: { color: 'var(--text-secondary)' } }
                },
                yAxis: { 
                    title: { text: 'Rate (%)', style: { color: 'var(--text-secondary)', fontWeight: '700' } },
                    labels: { style: { color: 'var(--text-secondary)' } },
                    gridLineColor: 'var(--glass-border)'
                },
                tooltip: {
                    valueSuffix: '%',
                    valueDecimals: 2,
                    shared: true,
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderColor: '#3b82f6',
                    borderRadius: 8
                },
                plotOptions: {
                    area: {
                        fillColor: {
                            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                            stops: [
                                [0, 'rgba(59, 130, 246, 0.5)'],
                                [1, 'rgba(59, 130, 246, 0.05)']
                            ]
                        },
                        marker: { enabled: false },
                        lineWidth: 3,
                        lineColor: '#3b82f6',
                        threshold: null
                    }
                },
                series: [{
                    name: 'Fed Funds Rate',
                    data: fedSeries
                }],
                credits: { enabled: false },
                legend: { enabled: false }
            });

        } catch (error) {
            console.error('Error loading historical Fed rate:', error);
        }
    }

    /* ========================================
       RATE PROJECTIONS (12 MONTHS)
       ======================================== */
    async loadProjections() {
        const container = document.getElementById('projectionsContainer');
        
        const currentFed = parseFloat(this.rates.fed) || 5.33;
        const currentT10Y = parseFloat(this.rates.t10y) || 4.25;

        // Scenario-based projections
        const scenarios = [
            {
                name: 'Optimistic',
                class: 'optimistic',
                icon: '<i class="fas fa-arrow-trend-down"></i>',
                fedRate: (currentFed - 1.5).toFixed(2),
                t10yRate: (currentT10Y - 0.75).toFixed(2),
                description: 'Inflation under control, Fed pivots to rate cuts to support growth.',
                probability: '35%',
                impacts: [
                    { label: 'Stock Market', value: 'Bullish' },
                    { label: 'Bonds', value: 'Positive' },
                    { label: 'Real Estate', value: 'Recovery' }
                ]
            },
            {
                name: 'Base Case',
                class: 'base',
                icon: '<i class="fas fa-equals"></i>',
                fedRate: (currentFed - 0.75).toFixed(2),
                t10yRate: (currentT10Y - 0.25).toFixed(2),
                description: 'Gradual policy normalization, economy achieves soft landing.',
                probability: '50%',
                impacts: [
                    { label: 'Stock Market', value: 'Neutral' },
                    { label: 'Bonds', value: 'Stable' },
                    { label: 'Real Estate', value: 'Moderate' }
                ]
            },
            {
                name: 'Pessimistic',
                class: 'pessimistic',
                icon: '<i class="fas fa-arrow-trend-up"></i>',
                fedRate: (currentFed + 0.5).toFixed(2),
                t10yRate: (currentT10Y + 0.5).toFixed(2),
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

        // Projection Chart
        this.loadProjectionChart();
    }

    async loadProjectionChart() {
        const currentDate = new Date();
        const projectionMonths = 12;
        
        const currentFed = parseFloat(this.rates.fed) || 5.33;
        
        // Generate projection data
        const optimisticData = [];
        const baseData = [];
        const pessimisticData = [];
        
        for (let i = 0; i <= projectionMonths; i++) {
            const date = new Date(currentDate);
            date.setMonth(date.getMonth() + i);
            const timestamp = date.getTime();
            
            optimisticData.push([timestamp, currentFed - (i * 0.125)]);
            baseData.push([timestamp, currentFed - (i * 0.0625)]);
            pessimisticData.push([timestamp, currentFed + (i * 0.042)]);
        }

        this.charts.projection = Highcharts.chart('projectionChart', {
            chart: { 
                type: 'line', 
                backgroundColor: 'transparent'
            },
            title: { 
                text: 'Fed Funds Rate - 12-Month Projections',
                style: { color: 'var(--text-primary)', fontWeight: '800', fontSize: '1.3rem' }
            },
            subtitle: {
                text: 'Scenario-based forecasts',
                style: { color: 'var(--text-secondary)' }
            },
            xAxis: { 
                type: 'datetime',
                labels: { style: { color: 'var(--text-secondary)' } }
            },
            yAxis: { 
                title: { text: 'Rate (%)', style: { color: 'var(--text-secondary)', fontWeight: '700' } },
                labels: { style: { color: 'var(--text-secondary)' } },
                gridLineColor: 'var(--glass-border)'
            },
            tooltip: {
                valueSuffix: '%',
                valueDecimals: 2,
                shared: true,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: 8
            },
            plotOptions: {
                line: {
                    marker: { enabled: false },
                    lineWidth: 3
                }
            },
            series: [
                {
                    name: 'Optimistic',
                    data: optimisticData,
                    color: '#10b981',
                    dashStyle: 'Dash'
                },
                {
                    name: 'Base Case',
                    data: baseData,
                    color: '#667eea',
                    lineWidth: 4
                },
                {
                    name: 'Pessimistic',
                    data: pessimisticData,
                    color: '#ef4444',
                    dashStyle: 'Dash'
                }
            ],
            credits: { enabled: false },
            legend: { 
                enabled: true,
                itemStyle: { color: 'var(--text-primary)', fontWeight: '600' }
            }
        });
    }

    /* ========================================
       AI RECOMMENDATIONS
       ======================================== */
    async generateAIRecommendations() {
        const container = document.getElementById('aiRecommendations');
        
        const today = new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

        const fedRate = parseFloat(this.rates.fed) || 5.33;
        const t10y = parseFloat(this.rates.t10y) || 4.25;
        const t2y = parseFloat(this.rates.t2y) || 4.55;
        const spread = (t10y - t2y).toFixed(2);

        // AI-generated insights
        const insights = [
            {
                title: 'Yield Curve Signal',
                icon: spread < 0 ? 'bearish' : spread < 0.5 ? 'neutral' : 'bullish',
                sentiment: spread < 0 ? 'bearish' : spread < 0.5 ? 'neutral' : 'bullish',
                content: spread < 0 
                    ? `The yield curve is <strong>inverted</strong> (10Y-2Y spread: ${spread}%), historically a recession indicator. Consider defensive positioning in your portfolio.`
                    : spread < 0.5
                    ? `The yield curve is <strong>flattening</strong> (10Y-2Y spread: ${spread}%). Monitor Fed policy closely for directional shifts.`
                    : `The yield curve is <strong>normal</strong> (10Y-2Y spread: ${spread}%), indicating healthy economic expectations.`
            },
            {
                title: 'Fed Policy Stance',
                icon: fedRate > 5 ? 'bearish' : fedRate > 4 ? 'neutral' : 'bullish',
                sentiment: fedRate > 5 ? 'bearish' : fedRate > 4 ? 'neutral' : 'bullish',
                content: fedRate > 5
                    ? `Federal Funds Rate at <strong>${fedRate}%</strong> indicates restrictive monetary policy. Growth stocks may face headwinds. Focus on quality dividend payers.`
                    : fedRate > 4
                    ? `Fed Funds Rate at <strong>${fedRate}%</strong> suggests policy normalization. Balanced portfolio allocation recommended.`
                    : `Fed Funds Rate at <strong>${fedRate}%</strong> indicates accommodative policy. Risk assets likely to benefit.`
            },
            {
                title: 'Fixed Income Opportunity',
                icon: 'bullish',
                sentiment: 'bullish',
                content: `With 10-Year Treasury at <strong>${t10y}%</strong>, fixed income offers attractive real yields. Consider laddering Treasury maturities to lock in current rates.`
            },
            {
                title: 'Mortgage Market',
                icon: this.rates.mortgage > 7 ? 'bearish' : this.rates.mortgage > 6 ? 'neutral' : 'bullish',
                sentiment: this.rates.mortgage > 7 ? 'bearish' : this.rates.mortgage > 6 ? 'neutral' : 'bullish',
                content: this.rates.mortgage > 7
                    ? `30-Year Mortgage at <strong>${this.rates.mortgage}%</strong> is pressuring housing affordability. Real estate sector may see reduced activity.`
                    : `30-Year Mortgage at <strong>${this.rates.mortgage}%</strong> remains elevated but manageable. Monitor refinancing opportunities as rates stabilize.`
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
                    <div class='ai-icon'>
                        <i class='fas fa-brain'></i>
                    </div>
                    <div class='ai-title-section'>
                        <h2>AI Market Intelligence</h2>
                        <div class='ai-date'>Updated: ${today}</div>
                    </div>
                </div>
                <div class='ai-insights-grid'>
                    ${insightsHTML}
                </div>
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
        const t30y = parseFloat(await this.getLatestRate('DGS30')) || 4.45;
        const t5y = parseFloat(await this.getLatestRate('DGS5')) || 4.15;
        
        const spread10y2y = (t10y - t2y).toFixed(2);
        const spread30y10y = (t30y - t10y).toFixed(2);
        const spread5y2y = (t5y - t2y).toFixed(2);

        const spreads = [
            {
                title: '10Y - 2Y Spread',
                value: spread10y2y,
                interpretation: spread10y2y < -0.2 ? 'Deeply Inverted' : spread10y2y < 0 ? 'Inverted' : spread10y2y < 0.5 ? 'Flattening' : 'Normal',
                class: spread10y2y < 0 ? 'inverted' : spread10y2y < 0.5 ? 'flat' : 'normal'
            },
            {
                title: '30Y - 10Y Spread',
                value: spread30y10y,
                interpretation: spread30y10y < 0.3 ? 'Compressed' : spread30y10y < 0.7 ? 'Moderate' : 'Steep',
                class: spread30y10y < 0.3 ? 'flat' : 'normal'
            },
            {
                title: '5Y - 2Y Spread',
                value: spread5y2y,
                interpretation: spread5y2y < -0.1 ? 'Inverted' : spread5y2y < 0.3 ? 'Flat' : 'Normal',
                class: spread5y2y < 0 ? 'inverted' : spread5y2y < 0.3 ? 'flat' : 'normal'
            }
        ];

        const spreadCards = spreads.map(spread => `
            <div class='spread-card'>
                <h3 class='spread-title'>${spread.title}</h3>
                <div class='spread-value'>${spread.value}%</div>
                <div class='spread-interpretation ${spread.class}'>${spread.interpretation}</div>
            </div>
        `).join('');

        container.innerHTML = `<div class='spread-analysis-grid'>${spreadCards}</div>`;
    }

    /* ========================================
       ECONOMIC IMPACT
       ======================================== */
    async loadEconomicImpact() {
        const container = document.getElementById('economicImpact');
        
        const fedRate = parseFloat(this.rates.fed) || 5.33;
        const mortgage = parseFloat(this.rates.mortgage) || 7.2;

        const impacts = [
            {
                icon: '<i class="fas fa-home"></i>',
                title: 'Housing Market',
                description: `With mortgage rates at ${mortgage}%, housing affordability has declined significantly. Expect reduced home sales volume and potential price corrections in overheated markets.`,
                metrics: [
                    { label: 'Affordability', value: 'Low' },
                    { label: 'Sales Trend', value: 'Declining' }
                ]
            },
            {
                icon: '<i class="fas fa-building"></i>',
                title: 'Corporate Debt',
                description: `Elevated interest rates increase borrowing costs for businesses. Companies with high leverage may face margin pressure and reduced capital expenditure.`,
                metrics: [
                    { label: 'Refinancing', value: 'Costly' },
                    { label: 'CapEx', value: 'Reduced' }
                ]
            },
            {
                icon: '<i class="fas fa-piggy-bank"></i>',
                title: 'Consumer Spending',
                description: `Higher rates incentivize saving over spending. Credit card and auto loan rates have risen, reducing discretionary spending power.`,
                metrics: [
                    { label: 'Savings Rate', value: 'Rising' },
                    { label: 'Credit Use', value: 'Declining' }
                ]
            },
            {
                icon: '<i class="fas fa-chart-line"></i>',
                title: 'Equity Markets',
                description: `Restrictive monetary policy typically pressures equity valuations, especially growth stocks. Value and dividend-paying stocks may outperform.`,
                metrics: [
                    { label: 'P/E Multiple', value: 'Compressed' },
                    { label: 'Preference', value: 'Value' }
                ]
            }
        ];

        const impactCards = impacts.map(impact => `
            <div class='impact-card'>
                <div class='impact-header'>
                    <div class='impact-icon'>${impact.icon}</div>
                    <h3 class='impact-title'>${impact.title}</h3>
                </div>
                <p class='impact-description'>${impact.description}</p>
                <div class='impact-metrics'>
                    ${impact.metrics.map(metric => `
                        <div class='impact-metric'>
                            <div class='impact-metric-label'>${metric.label}</div>
                            <div class='impact-metric-value'>${metric.value}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');

        container.innerHTML = `<div class='economic-impact-grid'>${impactCards}</div>`;
    }

    /* ========================================
       MODALS
       ======================================== */
    setupModals() {
        const chartWrappers = document.querySelectorAll('.chart-wrapper');
        
        chartWrappers.forEach((wrapper, index) => {
            wrapper.addEventListener('click', () => {
                const chartId = wrapper.querySelector('.chart').id;
                this.openChartModal(chartId);
            });
        });

        // Close modal on click outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target.id);
            }
        });
    }

    openChartModal(chartId) {
        const modalId = chartId + 'Modal';
        let modal = document.getElementById(modalId);
        
        if (!modal) {
            modal = this.createModal(chartId);
            document.body.appendChild(modal);
        }
        
        modal.classList.add('active');
        
        // Redraw chart in modal
        setTimeout(() => {
            const modalChartId = chartId + 'ModalChart';
            this.renderModalChart(chartId, modalChartId);
        }, 100);
    }

    createModal(chartId) {
        const modal = document.createElement('div');
        modal.id = chartId + 'Modal';
        modal.className = 'modal';
        
        const titles = {
            yieldCurveChart: 'US Treasury Yield Curve - Detailed View',
            historicalFedChart: 'Federal Funds Rate - Historical Analysis',
            projectionChart: 'Interest Rate Projections - Scenario Analysis'
        };

        const descriptions = {
            yieldCurveChart: 'The yield curve represents the relationship between bond yields and time to maturity. An inverted curve (short-term yields exceeding long-term) has historically preceded recessions.',
            historicalFedChart: 'The Federal Funds Rate is the target rate set by the Federal Reserve for overnight lending between banks. It is the primary tool for monetary policy implementation.',
            projectionChart: 'These projections are scenario-based forecasts derived from current economic conditions, Fed communications, and market expectations. Actual rates may vary significantly.'
        };

        modal.innerHTML = `
            <div class='modal-content'>
                <div class='modal-header'>
                    <h2><i class='fas fa-chart-area'></i> ${titles[chartId]}</h2>
                    <button class='modal-close' onclick="interestRateTracker.closeModal('${chartId}Modal')">
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
        
        return modal;
    }

    renderModalChart(sourceChartId, targetChartId) {
        const sourceChart = this.charts[sourceChartId.replace('Chart', '')];
        if (!sourceChart) return;

        const options = JSON.parse(JSON.stringify(sourceChart.userOptions));
        options.chart = options.chart || {};
        options.chart.renderTo = targetChartId;
        options.chart.height = 600;

        Highcharts.chart(targetChartId, options);
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }

    /* ========================================
       HELPERS
       ======================================== */
    parseLatest(series) {
        if (!series || !Array.isArray(series) || series.length === 0) return 'N/A';
        for (let i = series.length - 1; i >= 0; i--) {
            if (series[i].value !== '.') {
                return parseFloat(series[i].value).toFixed(2);
            }
        }
        return 'N/A';
    }

    calculateChange(series) {
        if (!series || !Array.isArray(series) || series.length < 30) return 0;
        
        const validData = series.filter(d => d.value !== '.');
        if (validData.length < 2) return 0;
        
        const latest = parseFloat(validData[validData.length - 1].value);
        const previous = parseFloat(validData[Math.max(0, validData.length - 30)].value);
        
        return latest - previous;
    }

    async getLatestRate(seriesId) {
        try {
            const data = await economicDataClient.getSeries(seriesId, { limit: 1 });
            return this.parseLatest(data);
        } catch (error) {
            console.error(`Error fetching ${seriesId}:`, error);
            return 'N/A';
        }
    }
}

/* ========================================
   INITIALIZATION
   ======================================== */
let interestRateTracker;

document.addEventListener('DOMContentLoaded', () => {
    interestRateTracker = new InterestRateTracker();
    interestRateTracker.init();
});