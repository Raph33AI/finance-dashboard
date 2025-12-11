/**
 * ====================================================================
 * ALPHAVAULT AI - INTEREST RATE TRACKER
 * ====================================================================
 * Suivi des taux d'intérêt Fed, ECB, Treasuries, Euribor
 */

class InterestRateTracker {
    constructor() {
        this.rates = {};
    }

    async init() {
        console.log('📊 Initializing Interest Rate Tracker...');
        
        try {
            await Promise.all([
                this.loadCurrentRates(),
                this.loadYieldCurve(),
                this.loadCentralBanksChart(),
                this.loadEuriborRates()
            ]);
            
            console.log('✅ Interest Rate Tracker loaded');
            
        } catch (error) {
            console.error('❌ Interest Rate Tracker error:', error);
        }
    }

    /**
     * ========================================
     * CURRENT RATES
     * ========================================
     */
    async loadCurrentRates() {
        const grid = document.getElementById('currentRatesGrid');
        
        try {
            // Récupérer tous les taux en parallèle
            const [fedFunds, treasury10Y, treasury2Y, mortgage30Y, ecbMain, euribor12M] = await Promise.all([
                economicDataClient.getSeries('DFF', { limit: 1 }),
                economicDataClient.getSeries('DGS10', { limit: 1 }),
                economicDataClient.getSeries('DGS2', { limit: 1 }),
                economicDataClient.getSeries('MORTGAGE30US', { limit: 1 }),
                economicDataClient.getECBMainRate(),
                economicDataClient.getECBEuribor('12M')
            ]);

            const fedRate = this.parseLatest(fedFunds);
            const t10Y = this.parseLatest(treasury10Y);
            const t2Y = this.parseLatest(treasury2Y);
            const mortgage = this.parseLatest(mortgage30Y);
            const ecbRate = this.parseECBLatest(ecbMain);
            const euribor = this.parseECBLatest(euribor12M);

            grid.innerHTML = `
                <div class='rate-display'>
                    <div class='rate-header'>
                        <h3 class='rate-title'>🇺🇸 Fed Funds Rate</h3>
                        <span class='eco-flag' style='font-size: 2rem;'>🏦</span>
                    </div>
                    <div class='rate-value-large'>${fedRate}%</div>
                    <div class='eco-sublabel'>Federal Reserve Target Rate</div>
                </div>

                <div class='rate-display'>
                    <div class='rate-header'>
                        <h3 class='rate-title'>🇪🇺 ECB Main Rate</h3>
                        <span class='eco-flag' style='font-size: 2rem;'>🏦</span>
                    </div>
                    <div class='rate-value-large'>${ecbRate}%</div>
                    <div class='eco-sublabel'>Main Refinancing Operations</div>
                </div>

                ${this.createRateCard('US Treasury 10Y', t10Y + '%', 'Long-term Government Yield', '🇺🇸', 'us-card')}
                ${this.createRateCard('US Treasury 2Y', t2Y + '%', 'Short-term Government Yield', '🇺🇸', 'us-card')}
                ${this.createRateCard('US Mortgage 30Y', mortgage + '%', 'Average Fixed Mortgage Rate', '🇺🇸', 'us-card')}
                ${this.createRateCard('Euribor 12M', euribor + '%', 'Euro Interbank Offered Rate', '🇪🇺', 'eu-card')}
            `;

        } catch (error) {
            console.error('❌ Error loading current rates:', error);
            grid.innerHTML = '<div class="eco-error">Error loading rates</div>';
        }
    }

    createRateCard(title, value, sublabel, flag, cssClass) {
        return `
            <div class='eco-card ${cssClass}'>
                <div class='eco-card-header'>
                    <h3 class='eco-card-title'>${title}</h3>
                    <span class='eco-flag'>${flag}</span>
                </div>
                <div class='eco-value' style='font-size: 2.2rem;'>${value}</div>
                <div class='eco-sublabel'>${sublabel}</div>
            </div>
        `;
    }

    /**
     * ========================================
     * US YIELD CURVE
     * ========================================
     */
    async loadYieldCurve() {
        try {
            const [m3, y1, y2, y5, y10, y30] = await Promise.all([
                economicDataClient.getSeries('DGS3MO', { limit: 1 }),
                economicDataClient.getSeries('DGS1', { limit: 1 }),
                economicDataClient.getSeries('DGS2', { limit: 1 }),
                economicDataClient.getSeries('DGS5', { limit: 1 }),
                economicDataClient.getSeries('DGS10', { limit: 1 }),
                economicDataClient.getSeries('DGS30', { limit: 1 })
            ]);

            const yieldData = [
                ['3 Months', this.parseLatest(m3)],
                ['1 Year', this.parseLatest(y1)],
                ['2 Years', this.parseLatest(y2)],
                ['5 Years', this.parseLatest(y5)],
                ['10 Years', this.parseLatest(y10)],
                ['30 Years', this.parseLatest(y30)]
            ];

            Highcharts.chart('yieldCurveChart', {
                chart: { 
                    type: 'spline', 
                    backgroundColor: 'transparent'
                },
                title: { 
                    text: 'US Treasury Yield Curve (Current)',
                    style: { color: 'var(--text-primary)', fontWeight: '800' }
                },
                xAxis: { 
                    categories: yieldData.map(d => d[0]),
                    labels: { style: { color: 'var(--text-secondary)' } }
                },
                yAxis: { 
                    title: { text: 'Yield (%)', style: { color: 'var(--text-secondary)' } },
                    labels: { style: { color: 'var(--text-secondary)' } },
                    gridLineColor: 'var(--border-color)'
                },
                tooltip: {
                    valueSuffix: '%',
                    valueDecimals: 2
                },
                plotOptions: {
                    spline: {
                        marker: {
                            enabled: true,
                            radius: 6
                        },
                        lineWidth: 4
                    }
                },
                series: [{
                    name: 'Treasury Yield',
                    data: yieldData.map(d => parseFloat(d[1])),
                    color: '#3b82f6'
                }],
                credits: { enabled: false },
                legend: { enabled: false }
            });

        } catch (error) {
            console.error('❌ Error loading yield curve:', error);
        }
    }

    /**
     * ========================================
     * CENTRAL BANKS COMPARISON
     * ========================================
     */
    async loadCentralBanksChart() {
        try {
            const [fedData, ecbData] = await Promise.all([
                economicDataClient.getSeries('DFF', { limit: 240 }),
                economicDataClient.getECBMainRate()
            ]);

            const fedSeries = fedData
                .filter(d => d.value !== '.')
                .map(d => [new Date(d.date).getTime(), parseFloat(d.value)]);

            const ecbSeries = this.extractECBTimeSeries(ecbData);

            Highcharts.chart('centralBanksChart', {
                chart: { 
                    type: 'line', 
                    backgroundColor: 'transparent'
                },
                title: { 
                    text: 'Central Banks Policy Rates Comparison',
                    style: { color: 'var(--text-primary)', fontWeight: '800' }
                },
                xAxis: { 
                    type: 'datetime',
                    labels: { style: { color: 'var(--text-secondary)' } }
                },
                yAxis: { 
                    title: { text: 'Rate (%)', style: { color: 'var(--text-secondary)' } },
                    labels: { style: { color: 'var(--text-secondary)' } },
                    gridLineColor: 'var(--border-color)'
                },
                tooltip: {
                    valueSuffix: '%',
                    valueDecimals: 2,
                    shared: true
                },
                series: [{
                    name: '🇺🇸 Federal Reserve',
                    data: fedSeries,
                    color: '#3b82f6',
                    marker: { enabled: false },
                    lineWidth: 3
                }, {
                    name: '🇪🇺 European Central Bank',
                    data: ecbSeries,
                    color: '#8b5cf6',
                    marker: { enabled: false },
                    lineWidth: 3
                }],
                credits: { enabled: false },
                legend: { 
                    enabled: true,
                    itemStyle: { color: 'var(--text-primary)' }
                }
            });

        } catch (error) {
            console.error('❌ Error loading central banks chart:', error);
        }
    }

    /**
     * ========================================
     * EURIBOR RATES
     * ========================================
     */
    async loadEuriborRates() {
        const container = document.getElementById('euriborContainer');
        
        try {
            const maturities = ['1W', '1M', '3M', '6M', '12M'];
            const euriborPromises = maturities.map(m => economicDataClient.getECBEuribor(m));
            const results = await Promise.all(euriborPromises);

            const cards = maturities.map((maturity, index) => {
                const rate = this.parseECBLatest(results[index]);
                return this.createRateCard(
                    `Euribor ${maturity}`,
                    rate + '%',
                    `${maturity} Maturity`,
                    '🇪🇺',
                    'eu-card'
                );
            }).join('');

            container.innerHTML = `<div class='eco-dashboard-grid'>${cards}</div>`;

        } catch (error) {
            console.error('❌ Error loading Euribor rates:', error);
            container.innerHTML = '<div class="eco-error">Error loading Euribor rates</div>';
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

    parseECBLatest(data) {
        if (!data || !data.success) return 'N/A';
        try {
            const observations = economicDataClient.extractECBObservations(data.data);
            if (observations.length === 0) return 'N/A';
            return observations[observations.length - 1].value.toFixed(2);
        } catch (error) {
            return 'N/A';
        }
    }

    extractECBTimeSeries(data) {
        if (!data || !data.success) return [];
        try {
            const observations = economicDataClient.extractECBObservations(data.data);
            return observations.map(obs => [obs.timestamp, obs.value]);
        } catch (error) {
            return [];
        }
    }
}

// ========================================
// INITIALISATION
// ========================================

let interestRateTracker;

document.addEventListener('DOMContentLoaded', () => {
    interestRateTracker = new InterestRateTracker();
    interestRateTracker.init();
});