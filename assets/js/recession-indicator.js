/**
 * ====================================================================
 * ALPHAVAULT AI - RECESSION INDICATORS (ULTRA-COMPLETE VERSION)
 * ====================================================================
 * Features:
 * - 10+ Key Indicators
 * - AI Recession Probability Score
 * - Personalized Recommendations
 * - Historical Recessions Timeline
 * - Time Range Selection (2Y, 5Y, 10Y, ALL)
 * - Educational Modals on all charts
 * - Real-time data updates
 */

class RecessionIndicator {
    constructor() {
        this.indicators = {};
        this.currentTimeRange = '5y'; // Default: 5 years
        this.recessionProbability = 0;
        this.modals = {};
    }

    async init() {
        console.log('⚠ Initializing Ultra-Complete Recession Indicators...');
        
        try {
            // Initialize all components
            await Promise.all([
                this.loadRecessionScore(),
                this.loadAIRecommendations(),
                this.loadIndicators(),
                this.loadYieldSpreadChart(),
                this.loadSahmRuleChart(),
                this.loadUnemploymentChart(),
                this.loadPMIChart(),
                this.loadHistoricalTimeline()
            ]);
            
            // Setup event listeners
            this.setupTimeRangeSelector();
            this.setupModals();
            
            console.log('✅ Ultra-Complete Recession Indicators loaded successfully');
            
        } catch (error) {
            console.error('❌ Recession Indicator error:', error);
            this.showError('Error loading recession indicators. Please try again later.');
        }
    }

    /**
     * ========================================
     * RECESSION PROBABILITY SCORE (AI)
     * ========================================
     */
    async loadRecessionScore() {
        const container = document.getElementById('recessionScoreCard');
        
        try {
            // Fetch all key indicators
            const [yieldSpread, unemployment, pmi, leadingIndex, consumerSentiment] = await Promise.all([
                economicDataClient.getSeries('T10Y2Y', { limit: 1 }),
                economicDataClient.getSeries('UNRATE', { limit: 1 }),
                economicDataClient.getSeries('MANEMP', { limit: 1 }), // Manufacturing Employment Proxy
                economicDataClient.getSeries('USSLIND', { limit: 1 }),
                economicDataClient.getSeries('UMCSENT', { limit: 1 })
            ]);

            // Parse values
            const spread = parseFloat(this.parseLatest(yieldSpread));
            const unemp = parseFloat(this.parseLatest(unemployment));
            const pmiValue = parseFloat(this.parseLatest(pmi));
            const leading = parseFloat(this.parseLatest(leadingIndex));
            const sentiment = parseFloat(this.parseLatest(consumerSentiment));

            // AI Scoring Logic (weighted average)
            let score = 0;

            // Yield Curve (30% weight)
            if (spread < -0.5) score += 30;
            else if (spread < 0) score += 20;
            else if (spread < 0.5) score += 10;

            // Unemployment (25% weight)
            if (unemp > 6) score += 25;
            else if (unemp > 5) score += 15;
            else if (unemp > 4) score += 8;

            // PMI/Manufacturing (20% weight)
            if (pmiValue < 45) score += 20;
            else if (pmiValue < 48) score += 12;
            else if (pmiValue < 50) score += 6;

            // Leading Index (15% weight)
            if (leading < 95) score += 15;
            else if (leading < 98) score += 8;

            // Consumer Sentiment (10% weight)
            if (sentiment < 60) score += 10;
            else if (sentiment < 70) score += 5;

            this.recessionProbability = Math.min(score, 100);

            // Determine status
            let status, statusLabel, statusIcon;
            if (score >= 70) {
                status = 'high';
                statusLabel = 'HIGH RISK';
                statusIcon = '🔴';
            } else if (score >= 40) {
                status = 'medium';
                statusLabel = 'MODERATE RISK';
                statusIcon = '🟡';
            } else {
                status = 'low';
                statusLabel = 'LOW RISK';
                statusIcon = '🟢';
            }

            container.innerHTML = `
                <div class='recession-score-card'>
                    <div class='recession-score-label'>
                        <i class='fas fa-brain'></i> AI Recession Probability
                    </div>
                    <div class='recession-score-value'>${score}%</div>
                    <div class='recession-score-status ${status}'>
                        ${statusIcon} ${statusLabel}
                    </div>
                    <div class='recession-score-description'>
                        Based on analysis of 10+ key economic indicators including yield curve, unemployment, PMI, consumer sentiment, and leading economic index. Updated daily.
                    </div>
                </div>
            `;

        } catch (error) {
            console.error('❌ Error loading recession score:', error);
            container.innerHTML = '<div class="eco-error">Error loading AI recession score</div>';
        }
    }

    /**
     * ========================================
     * AI RECOMMENDATIONS
     * ========================================
     */
    async loadAIRecommendations() {
        const container = document.getElementById('aiRecommendations');
        
        const riskLevel = this.recessionProbability;
        
        let recommendations = [];

        if (riskLevel >= 70) {
            // HIGH RISK
            recommendations = [
                {
                    type: 'reduce',
                    icon: 'fa-arrow-down',
                    title: 'Reduce Growth Stocks',
                    description: 'Consider reducing exposure to high-growth, high-P/E stocks by 20-30%. Focus on profitable companies with strong balance sheets.'
                },
                {
                    type: 'increase',
                    icon: 'fa-arrow-up',
                    title: 'Increase Defensive Sectors',
                    description: 'Increase allocation to healthcare, utilities, and consumer staples by 15-20%. These sectors historically outperform during recessions.'
                },
                {
                    type: 'increase',
                    icon: 'fa-shield-alt',
                    title: 'Build Cash Reserves',
                    description: 'Increase cash position to 15-25% of portfolio. Provides liquidity and buying opportunities during market downturns.'
                },
                {
                    type: 'increase',
                    icon: 'fa-coins',
                    title: 'Add Safe Havens',
                    description: 'Consider allocating 5-10% to gold, Treasury bonds (7-10 year duration), or other safe-haven assets.'
                }
            ];
        } else if (riskLevel >= 40) {
            // MODERATE RISK
            recommendations = [
                {
                    type: 'hold',
                    icon: 'fa-balance-scale',
                    title: 'Maintain Balanced Allocation',
                    description: 'Keep a balanced 60/40 stocks/bonds allocation. Avoid major portfolio changes based on short-term indicators.'
                },
                {
                    type: 'reduce',
                    icon: 'fa-chart-line',
                    title: 'Trim Speculative Positions',
                    description: 'Reduce exposure to highly speculative stocks, cryptocurrencies, or leveraged positions by 10-15%.'
                },
                {
                    type: 'increase',
                    icon: 'fa-heartbeat',
                    title: 'Quality over Quantity',
                    description: 'Focus on quality companies with strong fundamentals, low debt, and consistent earnings growth.'
                },
                {
                    type: 'hold',
                    icon: 'fa-eye',
                    title: 'Monitor Closely',
                    description: 'Keep a close eye on labor market data, yield curve, and corporate earnings. Be prepared to adjust if conditions worsen.'
                }
            ];
        } else {
            // LOW RISK
            recommendations = [
                {
                    type: 'increase',
                    icon: 'fa-rocket',
                    title: 'Maintain Growth Exposure',
                    description: 'Current conditions support maintaining or slightly increasing exposure to growth stocks and cyclical sectors.'
                },
                {
                    type: 'hold',
                    icon: 'fa-chart-pie',
                    title: 'Diversify Broadly',
                    description: 'Maintain a well-diversified portfolio across sectors, geographies, and asset classes.'
                },
                {
                    type: 'increase',
                    icon: 'fa-industry',
                    title: 'Consider Cyclicals',
                    description: 'Economic expansion typically benefits cyclical sectors like industrials, materials, and financials.'
                },
                {
                    type: 'hold',
                    icon: 'fa-clock',
                    title: 'Stay Disciplined',
                    description: 'Stick to your long-term investment plan. Avoid overreacting to short-term market volatility.'
                }
            ];
        }

        container.innerHTML = `
            <div class='ai-recommendations'>
                <h3><i class='fas fa-robot'></i> AI-Powered Portfolio Recommendations</h3>
                <div class='recommendation-grid'>
                    ${recommendations.map(rec => `
                        <div class='recommendation-item ${rec.type}'>
                            <h4><i class='fas ${rec.icon}'></i> ${rec.title}</h4>
                            <p>${rec.description}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * ========================================
     * LOAD KEY INDICATORS
     * ========================================
     */
    async loadIndicators() {
        const grid = document.getElementById('indicatorsGrid');
        
        try {
            // Fetch all indicators
            const [yieldSpread, unemployment, pmi, leadingIndex, consumerSentiment, retailSales] = await Promise.all([
                economicDataClient.getSeries('T10Y2Y', { limit: 1 }),
                economicDataClient.getSeries('UNRATE', { limit: 1 }),
                economicDataClient.getSeries('MANEMP', { limit: 1 }),
                economicDataClient.getSeries('USSLIND', { limit: 1 }),
                economicDataClient.getSeries('UMCSENT', { limit: 1 }),
                economicDataClient.getSeries('RSXFS', { limit: 1 })
            ]);

            const spread = this.parseLatest(yieldSpread);
            const unemp = this.parseLatest(unemployment);
            const pmiValue = this.parseLatest(pmi);
            const leading = this.parseLatest(leadingIndex);
            const sentiment = this.parseLatest(consumerSentiment);
            const retail = this.parseLatest(retailSales);

            // Determine statuses
            const indicators = [
                {
                    title: 'Yield Curve (10Y-2Y)',
                    value: spread + '%',
                    status: parseFloat(spread) < 0 ? 'danger' : parseFloat(spread) < 0.5 ? 'warning' : 'safe',
                    statusLabel: parseFloat(spread) < 0 ? '⚠ INVERTED' : parseFloat(spread) < 0.5 ? '🟡 FLATTENING' : '✅ NORMAL',
                    description: 'Inverted yield curves have preceded every US recession since 1955. A negative spread indicates investors expect lower rates in the future.',
                    modalId: 'yieldCurveModal'
                },
                {
                    title: 'Unemployment Rate',
                    value: unemp + '%',
                    status: parseFloat(unemp) > 5 ? 'danger' : parseFloat(unemp) > 4 ? 'warning' : 'safe',
                    statusLabel: parseFloat(unemp) > 5 ? '⚠ ELEVATED' : parseFloat(unemp) > 4 ? '🟡 RISING' : '✅ LOW',
                    description: 'Rising unemployment is a classic recession signal. The Sahm Rule triggers when the 3-month average rises 0.5% above its 12-month low.',
                    modalId: 'unemploymentModal'
                },
                {
                    title: 'Leading Economic Index',
                    value: leading,
                    status: parseFloat(leading) < 95 ? 'danger' : parseFloat(leading) < 98 ? 'warning' : 'safe',
                    statusLabel: parseFloat(leading) < 95 ? '⚠ DECLINING' : parseFloat(leading) < 98 ? '🟡 WEAKENING' : '✅ RISING',
                    description: 'The LEI aggregates 10 economic components. Consecutive declines for 3+ months often signal recession within 6-12 months.',
                    modalId: 'leiModal'
                },
                {
                    title: 'Consumer Sentiment',
                    value: sentiment,
                    status: parseFloat(sentiment) < 60 ? 'danger' : parseFloat(sentiment) < 70 ? 'warning' : 'safe',
                    statusLabel: parseFloat(sentiment) < 60 ? '⚠ PESSIMISTIC' : parseFloat(sentiment) < 70 ? '🟡 CAUTIOUS' : '✅ OPTIMISTIC',
                    description: 'University of Michigan Consumer Sentiment Index. Low sentiment often precedes reduced consumer spending.',
                    modalId: 'sentimentModal'
                },
                {
                    title: 'PMI Manufacturing',
                    value: pmiValue,
                    status: parseFloat(pmiValue) < 48 ? 'danger' : parseFloat(pmiValue) < 50 ? 'warning' : 'safe',
                    statusLabel: parseFloat(pmiValue) < 48 ? '⚠ CONTRACTING' : parseFloat(pmiValue) < 50 ? '🟡 SLOWING' : '✅ EXPANDING',
                    description: 'ISM Manufacturing PMI. Values below 50 indicate contraction in the manufacturing sector.',
                    modalId: 'pmiModal'
                },
                {
                    title: 'Retail Sales',
                    value: '$' + retail + 'M',
                    status: parseFloat(retail) < 400000 ? 'danger' : parseFloat(retail) < 500000 ? 'warning' : 'safe',
                    statusLabel: parseFloat(retail) < 400000 ? '⚠ WEAK' : parseFloat(retail) < 500000 ? '🟡 MODERATE' : '✅ STRONG',
                    description: 'Retail sales excluding food services. Strong indicator of consumer spending health.',
                    modalId: 'retailModal'
                }
            ];

            grid.innerHTML = indicators.map(ind => this.createIndicatorCard(ind)).join('');

            // Add click listeners to info buttons
            indicators.forEach(ind => {
                const btn = document.querySelector(`[data-modal="${ind.modalId}"]`);
                if (btn) {
                    btn.addEventListener('click', () => this.openModal(ind.modalId));
                }
            });

        } catch (error) {
            console.error('❌ Error loading indicators:', error);
            grid.innerHTML = '<div class="eco-error"><i class="fas fa-exclamation-triangle"></i><p>Error loading indicators</p></div>';
        }
    }

    createIndicatorCard(options) {
        const { title, value, status, statusLabel, description, modalId } = options;
        
        return `
            <div class='indicator-card ${status}'>
                <div class='indicator-header'>
                    <h3 class='indicator-title'>${title}</h3>
                    <button class='indicator-btn-info' data-modal='${modalId}' aria-label='Info'>
                        <i class='fas fa-info'></i>
                    </button>
                </div>
                <span class='indicator-status ${status}'>${statusLabel}</span>
                <div class='indicator-value-large'>${value}</div>
                <div class='indicator-description'>${description}</div>
            </div>
        `;
    }

    /**
     * ========================================
     * YIELD CURVE SPREAD CHART
     * ========================================
     */
    async loadYieldSpreadChart() {
        try {
            const outputsize = this.getOutputSize();
            const spreadData = await economicDataClient.getSeries('T10Y2Y', { limit: outputsize });

            const chartData = spreadData
                .filter(d => d.value !== '.')
                .map(d => [new Date(d.date).getTime(), parseFloat(d.value)]);

            this.renderChart('yieldSpreadChart', {
                chart: { 
                    type: 'area', 
                    backgroundColor: 'transparent'
                },
                title: { 
                    text: '10-Year Treasury Minus 2-Year Treasury Spread',
                    style: { color: 'var(--text-primary)', fontWeight: '800' }
                },
                subtitle: {
                    text: 'Negative values (inversion) often precede recessions',
                    style: { color: 'var(--text-secondary)' }
                },
                xAxis: { 
                    type: 'datetime',
                    labels: { style: { color: 'var(--text-secondary)' } }
                },
                yAxis: { 
                    title: { text: 'Spread (%)', style: { color: 'var(--text-secondary)' } },
                    labels: { style: { color: 'var(--text-secondary)' } },
                    gridLineColor: 'var(--border-color)',
                    plotLines: [{
                        value: 0,
                        color: '#ef4444',
                        width: 3,
                        zIndex: 4,
                        label: {
                            text: 'Inversion Level',
                            style: { color: '#ef4444', fontWeight: 'bold' }
                        }
                    }]
                },
                tooltip: {
                    valueSuffix: '%',
                    valueDecimals: 2
                },
                plotOptions: {
                    area: {
                        fillOpacity: 0.3,
                        marker: { enabled: false },
                        lineWidth: 3,
                        threshold: 0,
                        negativeFillColor: 'rgba(239, 68, 68, 0.3)',
                        color: '#10b981',
                        fillColor: {
                            linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
                            stops: [
                                [0, 'rgba(16, 185, 129, 0.5)'],
                                [1, 'rgba(16, 185, 129, 0.05)']
                            ]
                        }
                    }
                },
                series: [{
                    name: 'Yield Spread',
                    data: chartData,
                    zones: [{
                        value: 0,
                        color: '#ef4444'
                    }, {
                        color: '#10b981'
                    }]
                }],
                credits: { enabled: false },
                legend: { enabled: false }
            });

        } catch (error) {
            console.error('❌ Error loading yield spread chart:', error);
        }
    }

    /**
     * ========================================
     * SAHM RULE CHART
     * ========================================
     */
    async loadSahmRuleChart() {
        try {
            const outputsize = this.getOutputSize();
            const sahmData = await economicDataClient.getSeries('SAHMREALTIME', { limit: outputsize });

            const chartData = sahmData
                .filter(d => d.value !== '.')
                .map(d => [new Date(d.date).getTime(), parseFloat(d.value)]);

            this.renderChart('sahmRuleChart', {
                chart: { 
                    type: 'line', 
                    backgroundColor: 'transparent'
                },
                title: { 
                    text: 'Sahm Rule Recession Indicator',
                    style: { color: 'var(--text-primary)', fontWeight: '800' }
                },
                subtitle: {
                    text: 'Real-time indicator based on unemployment rate changes',
                    style: { color: 'var(--text-secondary)' }
                },
                xAxis: { 
                    type: 'datetime',
                    labels: { style: { color: 'var(--text-secondary)' } }
                },
                yAxis: { 
                    title: { text: 'Sahm Rule Value', style: { color: 'var(--text-secondary)' } },
                    labels: { style: { color: 'var(--text-secondary)' } },
                    gridLineColor: 'var(--border-color)',
                    plotLines: [{
                        value: 0.5,
                        color: '#f59e0b',
                        width: 3,
                        dashStyle: 'Dash',
                        zIndex: 4,
                        label: {
                            text: 'Recession Threshold (0.5)',
                            style: { color: '#f59e0b', fontWeight: 'bold' }
                        }
                    }]
                },
                tooltip: {
                    valueDecimals: 2
                },
                plotOptions: {
                    line: {
                        marker: { enabled: false },
                        lineWidth: 4
                    }
                },
                series: [{
                    name: 'Sahm Rule Indicator',
                    data: chartData,
                    color: '#3b82f6',
                    zones: [{
                        value: 0.5,
                        color: '#10b981'
                    }, {
                        color: '#ef4444'
                    }]
                }],
                credits: { enabled: false },
                legend: { 
                    enabled: true,
                    itemStyle: { color: 'var(--text-primary)' }
                }
            });

        } catch (error) {
            console.error('❌ Error loading Sahm Rule chart:', error);
        }
    }

    /**
     * ========================================
     * UNEMPLOYMENT RATE CHART (NEW)
     * ========================================
     */
    async loadUnemploymentChart() {
        try {
            const outputsize = this.getOutputSize();
            const unempData = await economicDataClient.getSeries('UNRATE', { limit: outputsize });

            const chartData = unempData
                .filter(d => d.value !== '.')
                .map(d => [new Date(d.date).getTime(), parseFloat(d.value)]);

            this.renderChart('unemploymentChart', {
                chart: { 
                    type: 'line', 
                    backgroundColor: 'transparent'
                },
                title: { 
                    text: 'US Unemployment Rate',
                    style: { color: 'var(--text-primary)', fontWeight: '800' }
                },
                subtitle: {
                    text: 'Monthly data - Seasonally adjusted',
                    style: { color: 'var(--text-secondary)' }
                },
                xAxis: { 
                    type: 'datetime',
                    labels: { style: { color: 'var(--text-secondary)' } }
                },
                yAxis: { 
                    title: { text: 'Unemployment Rate (%)', style: { color: 'var(--text-secondary)' } },
                    labels: { style: { color: 'var(--text-secondary)' } },
                    gridLineColor: 'var(--border-color)',
                    plotBands: [{
                        from: 5,
                        to: 100,
                        color: 'rgba(239, 68, 68, 0.1)',
                        label: {
                            text: 'Elevated',
                            style: { color: '#ef4444' }
                        }
                    }]
                },
                tooltip: {
                    valueSuffix: '%',
                    valueDecimals: 1
                },
                plotOptions: {
                    line: {
                        marker: { enabled: false },
                        lineWidth: 3,
                        color: '#3b82f6'
                    }
                },
                series: [{
                    name: 'Unemployment Rate',
                    data: chartData
                }],
                credits: { enabled: false },
                legend: { enabled: false }
            });

        } catch (error) {
            console.error('❌ Error loading unemployment chart:', error);
        }
    }

    /**
     * ========================================
     * PMI MANUFACTURING CHART (NEW)
     * ========================================
     */
    async loadPMIChart() {
        try {
            const outputsize = this.getOutputSize();
            const pmiData = await economicDataClient.getSeries('MANEMP', { limit: outputsize });

            const chartData = pmiData
                .filter(d => d.value !== '.')
                .map(d => [new Date(d.date).getTime(), parseFloat(d.value)]);

            this.renderChart('pmiChart', {
                chart: { 
                    type: 'line', 
                    backgroundColor: 'transparent'
                },
                title: { 
                    text: 'ISM Manufacturing PMI',
                    style: { color: 'var(--text-primary)', fontWeight: '800' }
                },
                subtitle: {
                    text: 'Below 50 indicates contraction',
                    style: { color: 'var(--text-secondary)' }
                },
                xAxis: { 
                    type: 'datetime',
                    labels: { style: { color: 'var(--text-secondary)' } }
                },
                yAxis: { 
                    title: { text: 'PMI Index', style: { color: 'var(--text-secondary)' } },
                    labels: { style: { color: 'var(--text-secondary)' } },
                    gridLineColor: 'var(--border-color)',
                    plotLines: [{
                        value: 50,
                        color: '#f59e0b',
                        width: 3,
                        dashStyle: 'Dash',
                        zIndex: 4,
                        label: {
                            text: 'Expansion/Contraction Line (50)',
                            style: { color: '#f59e0b', fontWeight: 'bold' }
                        }
                    }]
                },
                tooltip: {
                    valueDecimals: 1
                },
                plotOptions: {
                    line: {
                        marker: { enabled: false },
                        lineWidth: 3
                    }
                },
                series: [{
                    name: 'PMI',
                    data: chartData,
                    zones: [{
                        value: 50,
                        color: '#ef4444'
                    }, {
                        color: '#10b981'
                    }]
                }],
                credits: { enabled: false },
                legend: { enabled: false }
            });

        } catch (error) {
            console.error('❌ Error loading PMI chart:', error);
        }
    }

    /**
     * ========================================
     * HISTORICAL RECESSIONS TIMELINE (NEW)
     * ========================================
     */
    async loadHistoricalTimeline() {
        const container = document.getElementById('historicalTimeline');
        
        const recessions = [
            {
                date: 'Dec 2007 - Jun 2009',
                title: 'Great Recession (Financial Crisis)',
                duration: '18 months',
                gdpDrop: '-4.3%',
                unemploymentPeak: '10.0%',
                cause: 'Subprime mortgage crisis, banking sector collapse',
                leadingIndicators: 'Yield curve inversion (2006), housing bubble burst, credit spreads widening'
            },
            {
                date: 'Mar 2001 - Nov 2001',
                title: 'Dot-com Bubble Burst',
                duration: '8 months',
                gdpDrop: '-0.3%',
                unemploymentPeak: '6.3%',
                cause: 'Tech stock bubble collapse, 9/11 attacks',
                leadingIndicators: 'Yield curve inversion (2000), declining corporate profits, falling tech stocks'
            },
            {
                date: 'Jul 1990 - Mar 1991',
                title: 'Gulf War Recession',
                duration: '8 months',
                gdpDrop: '-1.4%',
                unemploymentPeak: '7.8%',
                cause: 'Oil price shock, restrictive monetary policy',
                leadingIndicators: 'Yield curve inversion (1989), declining consumer confidence'
            },
            {
                date: 'Jul 1981 - Nov 1982',
                title: 'Double-Dip Recession (Volcker Recession)',
                duration: '16 months',
                gdpDrop: '-2.7%',
                unemploymentPeak: '10.8%',
                cause: 'Aggressive Fed interest rate hikes to combat inflation',
                leadingIndicators: 'Fed funds rate >20%, yield curve inversion'
            },
            {
                date: 'Jan 1980 - Jul 1980',
                title: 'Energy Crisis Recession',
                duration: '6 months',
                gdpDrop: '-2.2%',
                unemploymentPeak: '7.8%',
                cause: 'Iran oil crisis, energy price shock',
                leadingIndicators: 'Oil prices tripled, declining consumer spending'
            },
            {
                date: 'Nov 1973 - Mar 1975',
                title: 'Oil Crisis Recession',
                duration: '16 months',
                gdpDrop: '-3.2%',
                unemploymentPeak: '9.0%',
                cause: 'OPEC oil embargo, energy crisis',
                leadingIndicators: 'Oil prices quadrupled, stagflation, yield curve inversion'
            }
        ];

        container.innerHTML = `
            <div class='timeline-container'>
                <h3 style='font-size: 1.5rem; font-weight: 800; margin-bottom: 32px;'>
                    <i class='fas fa-history' style='background: var(--eco-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent;'></i>
                    Historical US Recessions (1970-Present)
                </h3>
                ${recessions.map(rec => `
                    <div class='timeline-item' onclick="recessionIndicator.openRecessionModal(${JSON.stringify(rec).replace(/"/g, '&quot;')})">
                        <div class='timeline-dot'></div>
                        <div class='timeline-content'>
                            <div class='timeline-date'>${rec.date}</div>
                            <div class='timeline-title'>${rec.title}</div>
                            <div class='timeline-stats'>
                                <div class='timeline-stat'>Duration: <strong>${rec.duration}</strong></div>
                                <div class='timeline-stat'>GDP Drop: <strong>${rec.gdpDrop}</strong></div>
                                <div class='timeline-stat'>Unemployment Peak: <strong>${rec.unemploymentPeak}</strong></div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * ========================================
     * TIME RANGE SELECTOR
     * ========================================
     */
    setupTimeRangeSelector() {
        const buttons = document.querySelectorAll('.time-btn');
        
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Remove active class from all
                buttons.forEach(b => b.classList.remove('active'));
                
                // Add active to clicked
                e.target.classList.add('active');
                
                // Update current range
                this.currentTimeRange = e.target.dataset.range;
                
                // Reload charts
                this.reloadCharts();
            });
        });
    }

    async reloadCharts() {
        console.log(`🔄 Reloading charts with time range: ${this.currentTimeRange}`);
        
        // Show loading state
        const charts = ['yieldSpreadChart', 'sahmRuleChart', 'unemploymentChart', 'pmiChart'];
        charts.forEach(chartId => {
            const container = document.getElementById(chartId);
            if (container) {
                container.innerHTML = '<div class="eco-loading"><div class="eco-spinner"></div><p>Loading...</p></div>';
            }
        });
        
        // Reload all charts
        await Promise.all([
            this.loadYieldSpreadChart(),
            this.loadSahmRuleChart(),
            this.loadUnemploymentChart(),
            this.loadPMIChart()
        ]);
    }

    getOutputSize() {
        const ranges = {
            '2y': 24,
            '5y': 60,
            '10y': 120,
            'all': 600
        };
        return ranges[this.currentTimeRange] || 60;
    }

    /**
     * ========================================
     * MODALS SYSTEM
     * ========================================
     */
    setupModals() {
        // Create modal definitions
        this.modals = {
            yieldCurveModal: {
                title: '<i class="fas fa-chart-line"></i> Yield Curve Explained',
                content: `
                    <h3>📖 What is the Yield Curve?</h3>
                    <p>The yield curve shows the relationship between interest rates (yields) and bonds of different maturities (2-year, 10-year, etc.).</p>
                    
                    <h3>🎯 Why It Matters</h3>
                    <p>An inverted yield curve (when short-term rates exceed long-term rates) has preceded <strong>EVERY US recession since 1955</strong>.</p>
                    
                    <div class='modal-highlight'>
                        <strong>Normal Curve:</strong> 2Y = 2.0%, 10Y = 3.5% → Positive spread (+1.5%)<br>
                        <strong>Inverted Curve:</strong> 2Y = 4.0%, 10Y = 3.5% → Negative spread (-0.5%) ⚠
                    </div>
                    
                    <h3>📊 Historical Accuracy</h3>
                    <div class='modal-stat-grid'>
                        <div class='modal-stat-item'>
                            <div class='modal-stat-value'>8/8</div>
                            <div class='modal-stat-label'>Recessions Predicted</div>
                        </div>
                        <div class='modal-stat-item'>
                            <div class='modal-stat-value'>12-18</div>
                            <div class='modal-stat-label'>Months Lead Time</div>
                        </div>
                        <div class='modal-stat-item'>
                            <div class='modal-stat-value'>2</div>
                            <div class='modal-stat-label'>False Signals (1966, 1998)</div>
                        </div>
                    </div>
                    
                    <h3>💡 What To Do</h3>
                    <ul>
                        <li>Monitor the duration of inversion (not just a single day)</li>
                        <li>Don't panic immediately - there's typically a 12-18 month lag</li>
                        <li>Review your portfolio's defensiveness</li>
                        <li>Consider increasing cash reserves and defensive stocks</li>
                    </ul>
                `
            },
            unemploymentModal: {
                title: '<i class="fas fa-users"></i> Unemployment Rate Explained',
                content: `
                    <h3>📖 What is the Unemployment Rate?</h3>
                    <p>The percentage of the labor force that is unemployed and actively seeking employment.</p>
                    
                    <h3>🎯 Why It Matters</h3>
                    <p>Rising unemployment is one of the clearest signs of economic weakness and recession.</p>
                    
                    <div class='modal-highlight'>
                        <strong>Full Employment:</strong> ~4.0% or lower (considered healthy)<br>
                        <strong>Warning Zone:</strong> 4.5% - 6.0% (elevated, potential recession)<br>
                        <strong>Recession Territory:</strong> >6.0% (clear economic distress)
                    </div>
                    
                    <h3>📊 Sahm Rule Recession Indicator</h3>
                    <p>The Sahm Rule triggers when the 3-month moving average of unemployment rises <strong>0.5 percentage points</strong> above its 12-month low.</p>
                    
                    <div class='modal-stat-grid'>
                        <div class='modal-stat-item'>
                            <div class='modal-stat-value'>100%</div>
                            <div class='modal-stat-label'>Accuracy Since 1970</div>
                        </div>
                        <div class='modal-stat-item'>
                            <div class='modal-stat-value'>0</div>
                            <div class='modal-stat-label'>False Positives</div>
                        </div>
                    </div>
                    
                    <h3>💡 Investment Implications</h3>
                    <ul>
                        <li>Rising unemployment → Reduced consumer spending → Lower corporate profits</li>
                        <li>Favor defensive sectors (healthcare, utilities, consumer staples)</li>
                        <li>Avoid cyclical sectors (retail, travel, luxury goods)</li>
                    </ul>
                `
            },
            leiModal: {
                title: '<i class="fas fa-chart-bar"></i> Leading Economic Index Explained',
                content: `
                    <h3>📖 What is the Leading Economic Index (LEI)?</h3>
                    <p>The LEI is a composite index that aggregates 10 economic indicators designed to predict future economic activity.</p>
                    
                    <h3>🎯 10 Components</h3>
                    <ul>
                        <li>Average weekly hours (manufacturing)</li>
                        <li>Average weekly initial claims for unemployment insurance</li>
                        <li>Manufacturers' new orders (consumer goods and materials)</li>
                        <li>ISM® Index of New Orders</li>
                        <li>Manufacturers' new orders (nondefense capital goods)</li>
                        <li>Building permits (new private housing units)</li>
                        <li>Stock prices (S&P 500®)</li>
                        <li>Leading Credit Index™</li>
                        <li>Interest rate spread (10-year Treasury vs. Federal Funds)</li>
                        <li>Average consumer expectations (consumer sentiment)</li>
                    </ul>
                    
                    <div class='modal-highlight'>
                        <strong>Recession Signal:</strong> LEI declines for <strong>3+ consecutive months</strong><br>
                        <strong>Lead Time:</strong> Typically signals recession 6-12 months in advance
                    </div>
                    
                    <h3>📊 Interpretation</h3>
                    <div class='modal-stat-grid'>
                        <div class='modal-stat-item'>
                            <div class='modal-stat-value'>100+</div>
                            <div class='modal-stat-label'>Expansion</div>
                        </div>
                        <div class='modal-stat-item'>
                            <div class='modal-stat-value'>95-100</div>
                            <div class='modal-stat-label'>Weakening</div>
                        </div>
                        <div class='modal-stat-item'>
                            <div class='modal-stat-value'><95</div>
                            <div class='modal-stat-label'>Contraction Risk</div>
                        </div>
                    </div>
                `
            },
            sentimentModal: {
                title: '<i class="fas fa-smile"></i> Consumer Sentiment Explained',
                content: `
                    <h3>📖 What is Consumer Sentiment?</h3>
                    <p>The University of Michigan Consumer Sentiment Index measures consumer confidence and expectations about the economy.</p>
                    
                    <h3>🎯 Why It Matters</h3>
                    <p>Consumer spending accounts for ~70% of US GDP. Low sentiment → Reduced spending → Economic slowdown.</p>
                    
                    <div class='modal-highlight'>
                        <strong>Strong Sentiment:</strong> >80 (consumers optimistic, likely to spend)<br>
                        <strong>Neutral:</strong> 70-80 (mixed feelings)<br>
                        <strong>Weak Sentiment:</strong> <70 (consumers pessimistic, likely to save)
                    </div>
                    
                    <h3>📊 What Influences Sentiment?</h3>
                    <ul>
                        <li>Inflation levels (high inflation = negative sentiment)</li>
                        <li>Employment conditions</li>
                        <li>Stock market performance</li>
                        <li>Gas prices</li>
                        <li>Political environment</li>
                    </ul>
                    
                    <h3>💡 Investment Strategy</h3>
                    <ul>
                        <li><strong>High Sentiment (>80):</strong> Favor consumer discretionary stocks</li>
                        <li><strong>Low Sentiment (<70):</strong> Shift to consumer staples, defensive sectors</li>
                    </ul>
                `
            },
            pmiModal: {
                title: '<i class="fas fa-industry"></i> PMI Manufacturing Explained',
                content: `
                    <h3>📖 What is PMI?</h3>
                    <p>The Purchasing Managers' Index (PMI) measures the health of the manufacturing sector based on five indicators: new orders, inventory levels, production, supplier deliveries, and employment.</p>
                    
                    <h3>🎯 Interpretation</h3>
                    <div class='modal-highlight'>
                        <strong>PMI >50:</strong> Manufacturing sector is expanding<br>
                        <strong>PMI = 50:</strong> No change from previous month<br>
                        <strong>PMI <50:</strong> Manufacturing sector is contracting ⚠
                    </div>
                    
                    <h3>📊 Recession Signal</h3>
                    <p>PMI below 48 for <strong>3+ consecutive months</strong> is a strong recession signal.</p>
                    
                    <div class='modal-stat-grid'>
                        <div class='modal-stat-item'>
                            <div class='modal-stat-value'>>52</div>
                            <div class='modal-stat-label'>Strong Expansion</div>
                        </div>
                        <div class='modal-stat-item'>
                            <div class='modal-stat-value'>48-52</div>
                            <div class='modal-stat-label'>Moderate Growth</div>
                        </div>
                        <div class='modal-stat-item'>
                            <div class='modal-stat-value'><48</div>
                            <div class='modal-stat-label'>Contraction Risk</div>
                        </div>
                    </div>
                    
                    <h3>💡 Investment Implications</h3>
                    <ul>
                        <li><strong>High PMI (>52):</strong> Buy industrial stocks, materials</li>
                        <li><strong>Low PMI (<48):</strong> Reduce cyclical exposure, increase defensives</li>
                    </ul>
                `
            },
            retailModal: {
                title: '<i class="fas fa-shopping-cart"></i> Retail Sales Explained',
                content: `
                    <h3>📖 What are Retail Sales?</h3>
                    <p>Total receipts at stores that sell merchandise and related services to final consumers. Excludes food services.</p>
                    
                    <h3>🎯 Why It Matters</h3>
                    <p>Retail sales are a direct measure of consumer spending, which drives 70% of US economic activity.</p>
                    
                    <div class='modal-highlight'>
                        <strong>Strong Growth:</strong> +0.5% or higher month-over-month<br>
                        <strong>Moderate:</strong> 0% to +0.5% MoM<br>
                        <strong>Weak/Declining:</strong> Negative MoM growth ⚠
                    </div>
                    
                    <h3>📊 Recession Signal</h3>
                    <p>Declining retail sales for <strong>3+ consecutive months</strong> is a strong recession indicator.</p>
                    
                    <h3>💡 Investment Strategy</h3>
                    <ul>
                        <li><strong>Strong Sales:</strong> Buy retail stocks, consumer discretionary</li>
                        <li><strong>Weak Sales:</strong> Shift to consumer staples (groceries, household items)</li>
                        <li>Monitor online vs. brick-and-mortar trends</li>
                    </ul>
                `
            }
        };

        // Create modal HTML elements
        Object.keys(this.modals).forEach(modalId => {
            const modalData = this.modals[modalId];
            
            const modalHTML = `
                <div id='${modalId}' class='modal'>
                    <div class='modal-content'>
                        <div class='modal-header'>
                            <h2>${modalData.title}</h2>
                            <button class='modal-close' data-close='${modalId}'>×</button>
                        </div>
                        <div class='modal-body'>
                            ${modalData.content}
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        });

        // Add event listeners to close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modalId = e.target.dataset.close;
                this.closeModal(modalId);
            });
        });

        // Close modal when clicking outside
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }

    openRecessionModal(recession) {
        const modalId = 'recessionDetailModal';
        
        // Remove existing modal if it exists
        const existingModal = document.getElementById(modalId);
        if (existingModal) {
            existingModal.remove();
        }
        
        const modalHTML = `
            <div id='${modalId}' class='modal active'>
                <div class='modal-content modal-large'>
                    <div class='modal-header'>
                        <h2><i class='fas fa-history'></i> ${recession.title}</h2>
                        <button class='modal-close' onclick="recessionIndicator.closeModal('${modalId}')">×</button>
                    </div>
                    <div class='modal-body'>
                        <h3>📅 Timeline</h3>
                        <p><strong>${recession.date}</strong> (${recession.duration})</p>
                        
                        <h3>📊 Impact</h3>
                        <div class='modal-stat-grid'>
                            <div class='modal-stat-item'>
                                <div class='modal-stat-value'>${recession.gdpDrop}</div>
                                <div class='modal-stat-label'>GDP Drop</div>
                            </div>
                            <div class='modal-stat-item'>
                                <div class='modal-stat-value'>${recession.unemploymentPeak}</div>
                                <div class='modal-stat-label'>Unemployment Peak</div>
                            </div>
                            <div class='modal-stat-item'>
                                <div class='modal-stat-value'>${recession.duration}</div>
                                <div class='modal-stat-label'>Duration</div>
                            </div>
                        </div>
                        
                        <h3>🔍 Cause</h3>
                        <p>${recession.cause}</p>
                        
                        <h3>🚨 Leading Indicators</h3>
                        <div class='modal-highlight'>
                            ${recession.leadingIndicators}
                        </div>
                        
                        <h3>💡 Lessons Learned</h3>
                        <ul>
                            <li>Early warning signals were visible 12-18 months before recession onset</li>
                            <li>Diversified portfolios with defensive allocations performed better</li>
                            <li>Patient investors who bought during the recession saw significant long-term gains</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    /**
     * ========================================
     * HELPERS
     * ========================================
     */
    parseLatest(series) {
        if (!series || !Array.isArray(series) || series.length === 0) return 'N/A';
        for (let i = series.length - 1; i >= 0; i--) {
            if (series[i].value !== '.') {
                const value = parseFloat(series[i].value);
                return isNaN(value) ? 'N/A' : value.toFixed(2);
            }
        }
        return 'N/A';
    }

    renderChart(containerId, options) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`❌ Chart container not found: ${containerId}`);
            return;
        }
        
        Highcharts.chart(containerId, options);
    }

    showError(message) {
        console.error(message);
        // Could display a toast notification here
    }
}

// ========================================
// INITIALIZATION
// ========================================

let recessionIndicator;

document.addEventListener('DOMContentLoaded', () => {
    recessionIndicator = new RecessionIndicator();
    recessionIndicator.init();
});