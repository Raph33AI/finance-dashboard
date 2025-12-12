/**
 * ====================================================================
 * ALPHAVAULT AI - RECESSION INDICATORS (FINAL VERSION)
 * ====================================================================
 * Features:
 * - AI Recession Probability Score
 * - 6 Key Indicators
 * - 4 Advanced Charts with MOST RECENT DATA (automated)
 * - Historical Recessions Timeline
 * - Time Range Selection (2Y, 5Y, 10Y, ALL)
 * - Educational Modals
 * - NO EMOJIS - FontAwesome Icons Only
 */

class RecessionIndicator {
    constructor() {
        this.indicators = {};
        this.currentTimeRange = '5y';
        this.recessionProbability = 0;
        this.modals = {};
    }

    async init() {
        console.log('⚠ Initializing Ultra-Complete Recession Indicators...');
        
        try {
            // Setup modals FIRST
            this.setupModals();
            
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
            this.setupChartModalButtons();
            
            console.log('✅ Ultra-Complete Recession Indicators loaded successfully');
            
        } catch (error) {
            console.error('❌ Recession Indicator error:', error);
            this.showError('Error loading recession indicators. Please try again later.');
        }
    }

    /**
     * ========================================
     * GET MOST RECENT DATA (AUTOMATED)
     * ========================================
     */
    async getMostRecentData(seriesId, requestedPoints = 100) {
        try {
            // Request MUCH more data than needed to ensure we get recent data
            const rawData = await economicDataClient.getSeries(seriesId, { limit: 10000 });
            
            if (!rawData || rawData.length === 0) {
                console.warn(`⚠ No data returned for ${seriesId}`);
                return [];
            }
            
            // Filter out null/invalid values
            const validData = rawData
                .filter(d => d.value !== '.' && d.value !== null && !isNaN(parseFloat(d.value)))
                .map(d => ({
                    date: d.date,
                    timestamp: new Date(d.date).getTime(),
                    value: parseFloat(d.value)
                }))
                .sort((a, b) => b.timestamp - a.timestamp); // Sort descending (most recent first)
            
            // Take only the requested number of most recent points
            const recentData = validData.slice(0, requestedPoints);
            
            // Sort ascending for chart (oldest to newest)
            const chartData = recentData.reverse();
            
            if (chartData.length > 0) {
                const oldestDate = new Date(chartData[0].timestamp).toLocaleDateString();
                const newestDate = new Date(chartData[chartData.length - 1].timestamp).toLocaleDateString();
                console.log(`📊 ${seriesId}: ${chartData.length} points from ${oldestDate} to ${newestDate}`);
            }
            
            return chartData;
            
        } catch (error) {
            console.error(`❌ Error fetching ${seriesId}:`, error);
            return [];
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
            // Fetch most recent values
            const [yieldData, unempData, pmiData, leadingData, sentimentData] = await Promise.all([
                this.getMostRecentData('T10Y2Y', 1),
                this.getMostRecentData('UNRATE', 1),
                this.getMostRecentData('MANEMP', 1),
                this.getMostRecentData('USSLIND', 1),
                this.getMostRecentData('UMCSENT', 1)
            ]);

            const spread = yieldData[0]?.value || 0;
            const unemp = unempData[0]?.value || 0;
            const pmiValue = pmiData[0]?.value || 0;
            const leading = leadingData[0]?.value || 0;
            const sentiment = sentimentData[0]?.value || 0;

            console.log('📊 Latest Economic Data:', { spread, unemp, pmiValue, leading, sentiment });

            // AI Scoring Logic
            let score = 0;

            if (spread < -0.5) score += 30;
            else if (spread < 0) score += 20;
            else if (spread < 0.5) score += 10;

            if (unemp > 6) score += 25;
            else if (unemp > 5) score += 15;
            else if (unemp > 4) score += 8;

            if (pmiValue < 45) score += 20;
            else if (pmiValue < 48) score += 12;
            else if (pmiValue < 50) score += 6;

            if (leading < 95) score += 15;
            else if (leading < 98) score += 8;

            if (sentiment < 60) score += 10;
            else if (sentiment < 70) score += 5;

            this.recessionProbability = Math.min(score, 100);

            let status, statusLabel, statusIcon;
            if (score >= 70) {
                status = 'high';
                statusLabel = 'HIGH RISK';
                statusIcon = '<i class="fas fa-exclamation-triangle"></i>';
            } else if (score >= 40) {
                status = 'medium';
                statusLabel = 'MODERATE RISK';
                statusIcon = '<i class="fas fa-exclamation-circle"></i>';
            } else {
                status = 'low';
                statusLabel = 'LOW RISK';
                statusIcon = '<i class="fas fa-check-circle"></i>';
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
                        Based on analysis of 10+ key economic indicators including yield curve, unemployment, PMI, consumer sentiment, and leading economic index. Updated daily with the most recent available data.
                    </div>
                </div>
            `;

        } catch (error) {
            console.error('❌ Error loading recession score:', error);
            container.innerHTML = '<div class="eco-error"><i class="fas fa-exclamation-triangle"></i><p>Error loading AI recession score</p></div>';
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
            const [yieldData, unempData, pmiData, leadingData, sentimentData, retailData] = await Promise.all([
                this.getMostRecentData('T10Y2Y', 1),
                this.getMostRecentData('UNRATE', 1),
                this.getMostRecentData('MANEMP', 1),
                this.getMostRecentData('USSLIND', 1),
                this.getMostRecentData('UMCSENT', 1),
                this.getMostRecentData('RSXFS', 1)
            ]);

            const spread = yieldData[0]?.value.toFixed(2) || 'N/A';
            const unemp = unempData[0]?.value.toFixed(2) || 'N/A';
            const pmiValue = pmiData[0]?.value.toFixed(2) || 'N/A';
            const leading = leadingData[0]?.value.toFixed(2) || 'N/A';
            const sentiment = sentimentData[0]?.value.toFixed(2) || 'N/A';
            const retail = retailData[0]?.value.toFixed(0) || 'N/A';

            const indicators = [
                {
                    title: 'Yield Curve (10Y-2Y)',
                    value: spread + '%',
                    status: parseFloat(spread) < 0 ? 'danger' : parseFloat(spread) < 0.5 ? 'warning' : 'safe',
                    statusLabel: parseFloat(spread) < 0 ? '<i class="fas fa-exclamation-triangle"></i> INVERTED' : parseFloat(spread) < 0.5 ? '<i class="fas fa-exclamation-circle"></i> FLATTENING' : '<i class="fas fa-check-circle"></i> NORMAL',
                    description: 'Inverted yield curves have preceded every US recession since 1955. A negative spread indicates investors expect lower rates in the future.',
                    modalId: 'yieldCurveModal'
                },
                {
                    title: 'Unemployment Rate',
                    value: unemp + '%',
                    status: parseFloat(unemp) > 5 ? 'danger' : parseFloat(unemp) > 4 ? 'warning' : 'safe',
                    statusLabel: parseFloat(unemp) > 5 ? '<i class="fas fa-exclamation-triangle"></i> ELEVATED' : parseFloat(unemp) > 4 ? '<i class="fas fa-exclamation-circle"></i> RISING' : '<i class="fas fa-check-circle"></i> LOW',
                    description: 'Rising unemployment is a classic recession signal. The Sahm Rule triggers when the 3-month average rises 0.5% above its 12-month low.',
                    modalId: 'unemploymentModal'
                },
                {
                    title: 'Leading Economic Index',
                    value: leading,
                    status: parseFloat(leading) < 95 ? 'danger' : parseFloat(leading) < 98 ? 'warning' : 'safe',
                    statusLabel: parseFloat(leading) < 95 ? '<i class="fas fa-exclamation-triangle"></i> DECLINING' : parseFloat(leading) < 98 ? '<i class="fas fa-exclamation-circle"></i> WEAKENING' : '<i class="fas fa-check-circle"></i> RISING',
                    description: 'The LEI aggregates 10 economic components. Consecutive declines for 3+ months often signal recession within 6-12 months.',
                    modalId: 'leiModal'
                },
                {
                    title: 'Consumer Sentiment',
                    value: sentiment,
                    status: parseFloat(sentiment) < 60 ? 'danger' : parseFloat(sentiment) < 70 ? 'warning' : 'safe',
                    statusLabel: parseFloat(sentiment) < 60 ? '<i class="fas fa-exclamation-triangle"></i> PESSIMISTIC' : parseFloat(sentiment) < 70 ? '<i class="fas fa-exclamation-circle"></i> CAUTIOUS' : '<i class="fas fa-check-circle"></i> OPTIMISTIC',
                    description: 'University of Michigan Consumer Sentiment Index. Low sentiment often precedes reduced consumer spending.',
                    modalId: 'sentimentModal'
                },
                {
                    title: 'PMI Manufacturing',
                    value: pmiValue,
                    status: parseFloat(pmiValue) < 48 ? 'danger' : parseFloat(pmiValue) < 50 ? 'warning' : 'safe',
                    statusLabel: parseFloat(pmiValue) < 48 ? '<i class="fas fa-exclamation-triangle"></i> CONTRACTING' : parseFloat(pmiValue) < 50 ? '<i class="fas fa-exclamation-circle"></i> SLOWING' : '<i class="fas fa-check-circle"></i> EXPANDING',
                    description: 'ISM Manufacturing PMI. Values below 50 indicate contraction in the manufacturing sector.',
                    modalId: 'pmiModal'
                },
                {
                    title: 'Retail Sales',
                    value: '$' + retail + 'M',
                    status: parseFloat(retail) < 400000 ? 'danger' : parseFloat(retail) < 500000 ? 'warning' : 'safe',
                    statusLabel: parseFloat(retail) < 400000 ? '<i class="fas fa-exclamation-triangle"></i> WEAK' : parseFloat(retail) < 500000 ? '<i class="fas fa-exclamation-circle"></i> MODERATE' : '<i class="fas fa-check-circle"></i> STRONG',
                    description: 'Retail sales excluding food services. Strong indicator of consumer spending health.',
                    modalId: 'retailModal'
                }
            ];

            grid.innerHTML = indicators.map(ind => this.createIndicatorCard(ind)).join('');

            setTimeout(() => {
                indicators.forEach(ind => {
                    const btn = document.querySelector(`[data-indicator-modal="${ind.modalId}"]`);
                    if (btn) {
                        btn.addEventListener('click', (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            this.openModal(ind.modalId);
                        });
                    }
                });
            }, 100);

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
                    <button class='indicator-btn-info' data-indicator-modal='${modalId}' aria-label='Info'>
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
     * YIELD CURVE SPREAD CHART (MOST RECENT DATA)
     * ========================================
     */
    async loadYieldSpreadChart() {
        try {
            const requestedPoints = this.getRequestedPoints();
            const spreadData = await this.getMostRecentData('T10Y2Y', requestedPoints);

            if (spreadData.length === 0) {
                throw new Error('No yield spread data available');
            }

            const chartData = spreadData.map(d => [d.timestamp, d.value]);

            this.renderChart('yieldSpreadChart', {
                chart: { 
                    type: 'area', 
                    backgroundColor: 'transparent'
                },
                title: { text: null },
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
            document.getElementById('yieldSpreadChart').innerHTML = '<div class="eco-error"><i class="fas fa-exclamation-triangle"></i><p>Error loading chart</p></div>';
        }
    }

    /**
     * ========================================
     * SAHM RULE CHART (MOST RECENT DATA)
     * ========================================
     */
    async loadSahmRuleChart() {
        try {
            const requestedPoints = this.getRequestedPoints();
            const sahmData = await this.getMostRecentData('SAHMREALTIME', requestedPoints);

            if (sahmData.length === 0) {
                throw new Error('No Sahm Rule data available');
            }

            const chartData = sahmData.map(d => [d.timestamp, d.value]);

            this.renderChart('sahmRuleChart', {
                chart: { 
                    type: 'line', 
                    backgroundColor: 'transparent'
                },
                title: { text: null },
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
            document.getElementById('sahmRuleChart').innerHTML = '<div class="eco-error"><i class="fas fa-exclamation-triangle"></i><p>Error loading chart</p></div>';
        }
    }

    /**
     * ========================================
     * UNEMPLOYMENT RATE CHART (MOST RECENT DATA)
     * ========================================
     */
    async loadUnemploymentChart() {
        try {
            const requestedPoints = this.getRequestedPoints();
            const unempData = await this.getMostRecentData('UNRATE', requestedPoints);

            if (unempData.length === 0) {
                throw new Error('No unemployment data available');
            }

            const chartData = unempData.map(d => [d.timestamp, d.value]);

            this.renderChart('unemploymentChart', {
                chart: { 
                    type: 'line', 
                    backgroundColor: 'transparent'
                },
                title: { text: null },
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
            document.getElementById('unemploymentChart').innerHTML = '<div class="eco-error"><i class="fas fa-exclamation-triangle"></i><p>Error loading chart</p></div>';
        }
    }

    /**
     * ========================================
     * PMI MANUFACTURING CHART (MOST RECENT DATA)
     * ========================================
     */
    async loadPMIChart() {
        try {
            const requestedPoints = this.getRequestedPoints();
            const pmiData = await this.getMostRecentData('MANEMP', requestedPoints);

            if (pmiData.length === 0) {
                throw new Error('No PMI data available');
            }

            const chartData = pmiData.map(d => [d.timestamp, d.value]);

            this.renderChart('pmiChart', {
                chart: { 
                    type: 'line', 
                    backgroundColor: 'transparent'
                },
                title: { text: null },
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
            document.getElementById('pmiChart').innerHTML = '<div class="eco-error"><i class="fas fa-exclamation-triangle"></i><p>Error loading chart</p></div>';
        }
    }

    /**
     * ========================================
     * HISTORICAL RECESSIONS TIMELINE
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
                <h3>
                    <i class='fas fa-history'></i>
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
                buttons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentTimeRange = e.target.dataset.range;
                this.reloadCharts();
            });
        });
    }

    async reloadCharts() {
        console.log(`🔄 Reloading charts with time range: ${this.currentTimeRange}`);
        
        const charts = ['yieldSpreadChart', 'sahmRuleChart', 'unemploymentChart', 'pmiChart'];
        charts.forEach(chartId => {
            const container = document.getElementById(chartId);
            if (container) {
                container.innerHTML = '<div class="eco-loading"><div class="eco-spinner"></div><p>Loading...</p></div>';
            }
        });
        
        await Promise.all([
            this.loadYieldSpreadChart(),
            this.loadSahmRuleChart(),
            this.loadUnemploymentChart(),
            this.loadPMIChart()
        ]);
    }

    getRequestedPoints() {
        const ranges = {
            '2y': 24,    // 2 years monthly
            '5y': 60,    // 5 years monthly
            '10y': 120,  // 10 years monthly
            'all': 600   // ~50 years monthly
        };
        return ranges[this.currentTimeRange] || 60;
    }

    /**
     * ========================================
     * MODALS SYSTEM
     * ========================================
     */
    setupModals() {
        console.log('🔧 Setting up modals...');
        
        this.modals = {
            yieldCurveModal: {
                title: '<i class="fas fa-chart-line"></i> Yield Curve Explained',
                content: `
                    <h3>What is the Yield Curve?</h3>
                    <p>The yield curve shows the relationship between interest rates (yields) and bonds of different maturities (2-year, 10-year, etc.).</p>
                    
                    <h3>Why It Matters</h3>
                    <p>An inverted yield curve (when short-term rates exceed long-term rates) has preceded <strong>EVERY US recession since 1955</strong>.</p>
                    
                    <div class='modal-highlight'>
                        <strong>Normal Curve:</strong> 2Y = 2.0%, 10Y = 3.5% → Positive spread (+1.5%)<br>
                        <strong>Inverted Curve:</strong> 2Y = 4.0%, 10Y = 3.5% → Negative spread (-0.5%)
                    </div>
                    
                    <h3>Historical Accuracy</h3>
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
                            <div class='modal-stat-label'>False Signals</div>
                        </div>
                    </div>
                    
                    <h3>What To Do</h3>
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
                    <h3>What is the Unemployment Rate?</h3>
                    <p>The percentage of the labor force that is unemployed and actively seeking employment.</p>
                    
                    <h3>Why It Matters</h3>
                    <p>Rising unemployment is one of the clearest signs of economic weakness and recession.</p>
                    
                    <div class='modal-highlight'>
                        <strong>Full Employment:</strong> ~4.0% or lower (considered healthy)<br>
                        <strong>Warning Zone:</strong> 4.5% - 6.0% (elevated, potential recession)<br>
                        <strong>Recession Territory:</strong> >6.0% (clear economic distress)
                    </div>
                    
                    <h3>Sahm Rule Recession Indicator</h3>
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
                    
                    <h3>Investment Implications</h3>
                    <ul>
                        <li>Rising unemployment leads to reduced consumer spending and lower corporate profits</li>
                        <li>Favor defensive sectors (healthcare, utilities, consumer staples)</li>
                        <li>Avoid cyclical sectors (retail, travel, luxury goods)</li>
                    </ul>
                `
            },
            leiModal: {
                title: '<i class="fas fa-chart-bar"></i> Leading Economic Index Explained',
                content: `
                    <h3>What is the Leading Economic Index?</h3>
                    <p>The LEI is a composite index that aggregates 10 economic indicators designed to predict future economic activity.</p>
                    
                    <h3>10 Components</h3>
                    <ul>
                        <li>Average weekly hours (manufacturing)</li>
                        <li>Initial claims for unemployment insurance</li>
                        <li>Manufacturers' new orders (consumer goods)</li>
                        <li>ISM Index of New Orders</li>
                        <li>Building permits (new housing units)</li>
                        <li>Stock prices (S&P 500)</li>
                        <li>Interest rate spread (10Y vs Fed Funds)</li>
                        <li>Average consumer expectations</li>
                    </ul>
                    
                    <div class='modal-highlight'>
                        <strong>Recession Signal:</strong> LEI declines for <strong>3+ consecutive months</strong><br>
                        <strong>Lead Time:</strong> Typically 6-12 months in advance
                    </div>
                    
                    <h3>Interpretation</h3>
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
                    <h3>What is Consumer Sentiment?</h3>
                    <p>The University of Michigan Consumer Sentiment Index measures consumer confidence and expectations about the economy.</p>
                    
                    <h3>Why It Matters</h3>
                    <p>Consumer spending accounts for ~70% of US GDP. Low sentiment leads to reduced spending and economic slowdown.</p>
                    
                    <div class='modal-highlight'>
                        <strong>Strong Sentiment:</strong> >80 (consumers optimistic, likely to spend)<br>
                        <strong>Neutral:</strong> 70-80 (mixed feelings)<br>
                        <strong>Weak Sentiment:</strong> <70 (consumers pessimistic, likely to save)
                    </div>
                    
                    <h3>What Influences Sentiment?</h3>
                    <ul>
                        <li>Inflation levels (high inflation = negative sentiment)</li>
                        <li>Employment conditions</li>
                        <li>Stock market performance</li>
                        <li>Gas prices</li>
                        <li>Political environment</li>
                    </ul>
                `
            },
            pmiModal: {
                title: '<i class="fas fa-industry"></i> PMI Manufacturing Explained',
                content: `
                    <h3>What is PMI?</h3>
                    <p>The Purchasing Managers' Index measures the health of the manufacturing sector based on new orders, inventory, production, supplier deliveries, and employment.</p>
                    
                    <h3>Interpretation</h3>
                    <div class='modal-highlight'>
                        <strong>PMI >50:</strong> Manufacturing sector is expanding<br>
                        <strong>PMI = 50:</strong> No change from previous month<br>
                        <strong>PMI <50:</strong> Manufacturing sector is contracting
                    </div>
                    
                    <h3>Recession Signal</h3>
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
                `
            },
            retailModal: {
                title: '<i class="fas fa-shopping-cart"></i> Retail Sales Explained',
                content: `
                    <h3>What are Retail Sales?</h3>
                    <p>Total receipts at stores that sell merchandise and related services to final consumers. Excludes food services.</p>
                    
                    <h3>Why It Matters</h3>
                    <p>Retail sales are a direct measure of consumer spending, which drives 70% of US economic activity.</p>
                    
                    <div class='modal-highlight'>
                        <strong>Strong Growth:</strong> +0.5% or higher month-over-month<br>
                        <strong>Moderate:</strong> 0% to +0.5% MoM<br>
                        <strong>Weak/Declining:</strong> Negative MoM growth
                    </div>
                    
                    <h3>Investment Strategy</h3>
                    <ul>
                        <li>Strong Sales: Buy retail stocks, consumer discretionary</li>
                        <li>Weak Sales: Shift to consumer staples</li>
                        <li>Monitor online vs brick-and-mortar trends</li>
                    </ul>
                `
            }
        };

        Object.keys(this.modals).forEach(modalId => {
            const modalData = this.modals[modalId];
            
            const existingModal = document.getElementById(modalId);
            if (existingModal) {
                existingModal.remove();
            }
            
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

        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modalId = e.target.dataset.close;
                this.closeModal(modalId);
            });
        });

        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });
        
        console.log('✅ Modals setup complete');
    }

    setupChartModalButtons() {
        console.log('🔧 Setting up chart modal buttons...');
        
        setTimeout(() => {
            const chartInfoButtons = document.querySelectorAll('.chart-btn-info');
            
            chartInfoButtons.forEach(btn => {
                const modalId = btn.dataset.modal;
                if (modalId) {
                    btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        this.openModal(modalId);
                    });
                }
            });
            
            console.log(`✅ ${chartInfoButtons.length} chart modal buttons initialized`);
        }, 500);
    }

    openModal(modalId) {
        console.log('📖 Opening modal:', modalId);
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        } else {
            console.error('❌ Modal not found:', modalId);
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
                        <h3>Timeline</h3>
                        <p><strong>${recession.date}</strong> (${recession.duration})</p>
                        
                        <h3>Impact</h3>
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
                        
                        <h3>Cause</h3>
                        <p>${recession.cause}</p>
                        
                        <h3>Leading Indicators</h3>
                        <div class='modal-highlight'>
                            ${recession.leadingIndicators}
                        </div>
                        
                        <h3>Lessons Learned</h3>
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