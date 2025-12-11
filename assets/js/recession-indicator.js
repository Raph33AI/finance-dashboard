/**
 * ====================================================================
 * ALPHAVAULT AI - RECESSION INDICATORS
 * ====================================================================
 * Indicateurs de récession : Yield Curve, Sahm Rule, Leading Index
 */

class RecessionIndicator {
    constructor() {
        this.indicators = {};
    }

    async init() {
        console.log('⚠ Initializing Recession Indicators...');
        
        try {
            await Promise.all([
                this.loadIndicators(),
                this.loadYieldSpreadChart(),
                this.loadSahmRuleChart()
            ]);
            
            console.log('✅ Recession Indicators loaded');
            
        } catch (error) {
            console.error('❌ Recession Indicator error:', error);
        }
    }

    /**
     * ========================================
     * LOAD INDICATORS
     * ========================================
     */
    async loadIndicators() {
        const grid = document.getElementById('indicatorsGrid');
        
        try {
            // Récupérer les indicateurs
            const [yieldSpread, unemployment, leadingIndex] = await Promise.all([
                economicDataClient.getSeries('T10Y2Y', { limit: 1 }), // 10Y-2Y Spread
                economicDataClient.getSeries('UNRATE', { limit: 1 }),
                economicDataClient.getSeries('USSLIND', { limit: 1 }) // Leading Index
            ]);

            const spread = this.parseLatest(yieldSpread);
            const unemp = this.parseLatest(unemployment);
            const leading = this.parseLatest(leadingIndex);

            // Déterminer les statuts
            const spreadStatus = parseFloat(spread) < 0 ? 'danger' : 'safe';
            const spreadLabel = parseFloat(spread) < 0 ? '⚠ INVERTED' : '✅ NORMAL';
            
            const unempStatus = parseFloat(unemp) > 5 ? 'warning' : 'safe';
            const unempLabel = parseFloat(unemp) > 5 ? '⚠ ELEVATED' : '✅ LOW';

            const leadingStatus = parseFloat(leading) < 100 ? 'warning' : 'safe';
            const leadingLabel = parseFloat(leading) < 100 ? '⚠ DECLINING' : '✅ RISING';

            grid.innerHTML = `
                ${this.createIndicatorCard({
                    title: 'Yield Curve (10Y-2Y)',
                    value: spread + '%',
                    status: spreadStatus,
                    statusLabel: spreadLabel,
                    description: 'Inverted yield curves have preceded every US recession since 1955. A negative spread indicates investors expect lower rates in the future.'
                })}

                ${this.createIndicatorCard({
                    title: 'Unemployment Rate',
                    value: unemp + '%',
                    status: unempStatus,
                    statusLabel: unempLabel,
                    description: 'Rising unemployment is a classic recession signal. The Sahm Rule triggers when the 3-month moving average rises 0.5% above its 12-month low.'
                })}

                ${this.createIndicatorCard({
                    title: 'Leading Economic Index',
                    value: leading,
                    status: leadingStatus,
                    statusLabel: leadingLabel,
                    description: 'The LEI aggregates 10 economic components. Consecutive declines for 3+ months often signal recession within 6-12 months.'
                })}

                ${this.createIndicatorCard({
                    title: 'Sahm Rule Indicator',
                    value: 'Loading...',
                    status: 'safe',
                    statusLabel: '✅ NOT TRIGGERED',
                    description: 'The Sahm Rule has accurately identified every US recession since 1970 with no false positives. Trigger = 3-month avg unemployment > 0.5% above 12-month low.'
                })}
            `;

        } catch (error) {
            console.error('❌ Error loading indicators:', error);
            grid.innerHTML = '<div class="eco-error">Error loading indicators</div>';
        }
    }

    createIndicatorCard(options) {
        const { title, value, status, statusLabel, description } = options;
        
        return `
            <div class='indicator-card ${status}'>
                <div class='indicator-header'>
                    <h3 class='indicator-title'>${title}</h3>
                    <span class='indicator-status ${status}'>${statusLabel}</span>
                </div>
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
            const spreadData = await economicDataClient.getSeries('T10Y2Y', { limit: 360 });

            const chartData = spreadData
                .filter(d => d.value !== '.')
                .map(d => [new Date(d.date).getTime(), parseFloat(d.value)]);

            Highcharts.chart('yieldSpreadChart', {
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
            const sahmData = await economicDataClient.getSeries('SAHMREALTIME', { limit: 360 });

            const chartData = sahmData
                .filter(d => d.value !== '.')
                .map(d => [new Date(d.date).getTime(), parseFloat(d.value)]);

            Highcharts.chart('sahmRuleChart', {
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
     * HELPERS
     * ========================================
     */
    parseLatest(series) {
        if (!series || !Array.isArray(series) || series.length === 0) return 'N/A';
        for (let i = series.length - 1; i >= 0; i--) {
            if (series[i].value !== '.') {
                return parseFloat(series[i].value).toFixed(2);
            }
        }
        return 'N/A';
    }
}

// ========================================
// INITIALISATION
// ========================================

let recessionIndicator;

document.addEventListener('DOMContentLoaded', () => {
    recessionIndicator = new RecessionIndicator();
    recessionIndicator.init();
});