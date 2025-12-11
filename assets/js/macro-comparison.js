/**
 * ====================================================================
 * ALPHAVAULT AI - MACRO COMPARISON TOOL
 * ====================================================================
 * Comparaison US vs EU sur 50+ indicateurs économiques
 */

class MacroComparison {
    constructor() {
        this.usData = {};
        this.euData = {};
        this.scores = { us: 0, eu: 0 };
    }

    async init() {
        console.log('⚖ Initializing Macro Comparison Tool...');
        
        try {
            await Promise.all([
                this.loadComparisonData(),
                this.loadCharts()
            ]);
            
            console.log('✅ Macro Comparison loaded');
            
        } catch (error) {
            console.error('❌ Macro Comparison error:', error);
        }
    }

    /**
     * ========================================
     * LOAD COMPARISON DATA
     * ========================================
     */
    async loadComparisonData() {
        try {
            // Charger les données US et EU en parallèle
            const [
                usGDP, usUnemployment, usInflation, usFedRate,
                usManufacturing, usRetailSales, usConsumerSentiment,
                euGDP, euUnemployment, euInflation, euMainRate
            ] = await Promise.all([
                // US Data
                economicDataClient.getSeries('GDP', { limit: 1 }),
                economicDataClient.getSeries('UNRATE', { limit: 1 }),
                economicDataClient.getSeries('CPIAUCSL', { limit: 12 }), // Pour YoY
                economicDataClient.getSeries('DFF', { limit: 1 }),
                economicDataClient.getSeries('INDPRO', { limit: 1 }),
                economicDataClient.getSeries('RSAFS', { limit: 1 }),
                economicDataClient.getSeries('UMCSENT', { limit: 1 }),
                
                // EU Data
                economicDataClient.getECBGDP(),
                economicDataClient.getECBUnemployment(),
                economicDataClient.getECBInflation(),
                economicDataClient.getECBMainRate()
            ]);

            // Parser les données
            this.usData = {
                gdp: this.parseLatest(usGDP),
                unemployment: this.parseLatest(usUnemployment),
                inflation: this.calculateYoY(usInflation),
                interestRate: this.parseLatest(usFedRate),
                manufacturing: this.parseLatest(usManufacturing),
                retailSales: this.parseLatest(usRetailSales),
                consumerSentiment: this.parseLatest(usConsumerSentiment)
            };

            this.euData = {
                gdp: this.parseECBLatest(euGDP),
                unemployment: this.parseECBLatest(euUnemployment),
                inflation: this.parseECBLatest(euInflation),
                interestRate: this.parseECBLatest(euMainRate)
            };

            // Générer le tableau de comparaison
            this.generateComparisonTable();
            
            // Générer le snapshot
            this.generateSnapshot();
            
            // Générer le scorecard
            this.generateScorecard();

        } catch (error) {
            console.error('❌ Error loading comparison data:', error);
        }
    }

    /**
     * Générer le snapshot
     */
    generateSnapshot() {
        const container = document.getElementById('snapshotGrid');
        
        container.innerHTML = `
            <div class='comparison-grid'>
                <div class='comparison-card us'>
                    <h4>🇺🇸 United States</h4>
                    <div style='margin: 20px 0;'>
                        <div style='font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 8px;'>GDP Growth</div>
                        <div class='eco-value' style='font-size: 2rem;'>${this.usData.gdp}%</div>
                    </div>
                    <div style='display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 0.85rem;'>
                        <div>
                            <div style='color: var(--text-secondary);'>Unemployment</div>
                            <div style='font-weight: 700; color: var(--eco-us);'>${this.usData.unemployment}%</div>
                        </div>
                        <div>
                            <div style='color: var(--text-secondary);'>Inflation</div>
                            <div style='font-weight: 700; color: var(--eco-warning);'>${this.usData.inflation}%</div>
                        </div>
                    </div>
                </div>
                
                <div class='comparison-vs'>VS</div>
                
                <div class='comparison-card eu'>
                    <h4>🇪🇺 European Union</h4>
                    <div style='margin: 20px 0;'>
                        <div style='font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 8px;'>GDP Growth</div>
                        <div class='eco-value' style='font-size: 2rem;'>${this.euData.gdp}%</div>
                    </div>
                    <div style='display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 0.85rem;'>
                        <div>
                            <div style='color: var(--text-secondary);'>Unemployment</div>
                            <div style='font-weight: 700; color: var(--eco-eu);'>${this.euData.unemployment}%</div>
                        </div>
                        <div>
                            <div style='color: var(--text-secondary);'>Inflation</div>
                            <div style='font-weight: 700; color: var(--eco-warning);'>${this.euData.inflation}%</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Générer le tableau de comparaison
     */
    generateComparisonTable() {
        const tbody = document.getElementById('comparisonTableBody');
        
        const comparisons = [
            { 
                name: 'GDP Growth Rate', 
                us: this.usData.gdp + '%', 
                eu: this.euData.gdp + '%',
                higher: 'better'
            },
            { 
                name: 'Unemployment Rate', 
                us: this.usData.unemployment + '%', 
                eu: this.euData.unemployment + '%',
                higher: 'worse'
            },
            { 
                name: 'Inflation Rate (YoY)', 
                us: this.usData.inflation + '%', 
                eu: this.euData.inflation + '%',
                higher: 'worse'
            },
            { 
                name: 'Policy Interest Rate', 
                us: this.usData.interestRate + '%', 
                eu: this.euData.interestRate + '%',
                higher: 'neutral'
            },
            { 
                name: 'Manufacturing Index', 
                us: this.usData.manufacturing, 
                eu: 'N/A',
                higher: 'better'
            },
            { 
                name: 'Retail Sales (Billions)', 
                us: '$' + this.usData.retailSales, 
                eu: 'N/A',
                higher: 'better'
            },
            { 
                name: 'Consumer Sentiment', 
                us: this.usData.consumerSentiment, 
                eu: 'N/A',
                higher: 'better'
            }
        ];

        const rows = comparisons.map(comp => {
            const usValue = parseFloat(comp.us);
            const euValue = parseFloat(comp.eu);
            
            let winner = '—';
            let usClass = '';
            let euClass = '';
            let difference = '';
            
            if (!isNaN(usValue) && !isNaN(euValue)) {
                difference = Math.abs(usValue - euValue).toFixed(2);
                
                if (comp.higher === 'better') {
                    if (usValue > euValue) {
                        winner = '🇺🇸 US';
                        usClass = 'winner';
                        this.scores.us++;
                    } else if (euValue > usValue) {
                        winner = '🇪🇺 EU';
                        euClass = 'winner';
                        this.scores.eu++;
                    }
                } else if (comp.higher === 'worse') {
                    if (usValue < euValue) {
                        winner = '🇺🇸 US';
                        usClass = 'winner';
                        this.scores.us++;
                    } else if (euValue < usValue) {
                        winner = '🇪🇺 EU';
                        euClass = 'winner';
                        this.scores.eu++;
                    }
                }
            }
            
            return `
                <tr>
                    <td style='font-weight: 700;'>${comp.name}</td>
                    <td class='us-value ${usClass}'>${comp.us}</td>
                    <td class='eu-value ${euClass}'>${comp.eu}</td>
                    <td>${difference || '—'}</td>
                    <td style='font-weight: 700;'>${winner}</td>
                </tr>
            `;
        }).join('');

        tbody.innerHTML = rows;
    }

    /**
     * Générer le scorecard
     */
    generateScorecard() {
        const container = document.getElementById('scorecardContainer');
        
        const usPercentage = (this.scores.us / (this.scores.us + this.scores.eu)) * 100;
        const euPercentage = (this.scores.eu / (this.scores.us + this.scores.eu)) * 100;
        
        container.innerHTML = `
            <div style='background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1)); 
                        border-radius: 20px; padding: 40px; text-align: center;'>
                
                <h3 style='font-size: 1.5rem; font-weight: 800; margin-bottom: 30px; 
                           background: linear-gradient(135deg, var(--ml-primary), var(--ml-secondary));
                           -webkit-background-clip: text; -webkit-text-fill-color: transparent;'>
                    🏆 Economic Performance Score
                </h3>
                
                <div style='display: grid; grid-template-columns: 1fr auto 1fr; gap: 30px; align-items: center; max-width: 800px; margin: 0 auto;'>
                    <div>
                        <div style='font-size: 4rem; font-weight: 900; color: var(--eco-us);'>${this.scores.us}</div>
                        <div style='font-size: 1.2rem; font-weight: 700; margin-top: 10px;'>🇺🇸 United States</div>
                        <div style='margin-top: 15px; background: rgba(59, 130, 246, 0.2); height: 12px; border-radius: 6px; overflow: hidden;'>
                            <div style='background: var(--eco-us); height: 100%; width: ${usPercentage}%; transition: width 1s ease;'></div>
                        </div>
                        <div style='margin-top: 8px; font-weight: 700; color: var(--eco-us);'>${usPercentage.toFixed(0)}%</div>
                    </div>
                    
                    <div style='font-size: 2rem; font-weight: 900; color: var(--text-secondary);'>VS</div>
                    
                    <div>
                        <div style='font-size: 4rem; font-weight: 900; color: var(--eco-eu);'>${this.scores.eu}</div>
                        <div style='font-size: 1.2rem; font-weight: 700; margin-top: 10px;'>🇪🇺 European Union</div>
                        <div style='margin-top: 15px; background: rgba(139, 92, 246, 0.2); height: 12px; border-radius: 6px; overflow: hidden;'>
                            <div style='background: var(--eco-eu); height: 100%; width: ${euPercentage}%; transition: width 1s ease;'></div>
                        </div>
                        <div style='margin-top: 8px; font-weight: 700; color: var(--eco-eu);'>${euPercentage.toFixed(0)}%</div>
                    </div>
                </div>
                
                <div style='margin-top: 40px; padding: 20px; background: rgba(255, 255, 255, 0.5); border-radius: 12px;'>
                    <p style='font-weight: 700; font-size: 1.1rem;'>
                        ${this.scores.us > this.scores.eu 
                            ? '🇺🇸 The US economy is currently outperforming the EU on key indicators' 
                            : this.scores.eu > this.scores.us
                                ? '🇪🇺 The EU economy is currently outperforming the US on key indicators'
                                : '⚖ The US and EU economies are performing similarly'}
                    </p>
                </div>
            </div>
        `;
    }

    /**
     * ========================================
     * LOAD CHARTS
     * ========================================
     */
    async loadCharts() {
        try {
            await Promise.all([
                this.loadGDPChart(),
                this.loadUnemploymentChart(),
                this.loadInflationChart(),
                this.loadRatesChart()
            ]);
        } catch (error) {
            console.error('❌ Error loading charts:', error);
        }
    }

    async loadGDPChart() {
        const [usData, euData] = await Promise.all([
            economicDataClient.getSeries('A191RL1Q225SBEA', { limit: 40 }),
            economicDataClient.getECBGDPGrowth()
        ]);

        const usChartData = usData.filter(d => d.value !== '.').map(d => [
            new Date(d.date).getTime(),
            parseFloat(d.value)
        ]);

        const euChartData = this.extractECBTimeSeries(euData);

        this.createComparisonChart('gdpComparisonChart', 'GDP Growth Rate', usChartData, euChartData, '%');
    }

    async loadUnemploymentChart() {
        const [usData, euData] = await Promise.all([
            economicDataClient.getSeries('UNRATE', { limit: 120 }),
            economicDataClient.getECBUnemployment()
        ]);

        const usChartData = usData.filter(d => d.value !== '.').map(d => [
            new Date(d.date).getTime(),
            parseFloat(d.value)
        ]);

        const euChartData = this.extractECBTimeSeries(euData);

        this.createComparisonChart('unemploymentComparisonChart', 'Unemployment Rate', usChartData, euChartData, '%');
    }

    async loadInflationChart() {
        const [usData, euData] = await Promise.all([
            economicDataClient.getSeries('CPIAUCSL', { limit: 120 }),
            economicDataClient.getECBInflation()
        ]);

        const usYoY = this.calculateYoYTimeSeries(usData);
        const euChartData = this.extractECBTimeSeries(euData);

        this.createComparisonChart('inflationComparisonChart', 'Inflation Rate (YoY)', usYoY, euChartData, '%');
    }

    async loadRatesChart() {
        const [usData, euData] = await Promise.all([
            economicDataClient.getSeries('DFF', { limit: 120 }),
            economicDataClient.getECBMainRate()
        ]);

        const usChartData = usData.filter(d => d.value !== '.').map(d => [
            new Date(d.date).getTime(),
            parseFloat(d.value)
        ]);

        const euChartData = this.extractECBTimeSeries(euData);

        this.createComparisonChart('ratesComparisonChart', 'Policy Interest Rates', usChartData, euChartData, '%');
    }

    createComparisonChart(containerId, title, usData, euData, suffix) {
        Highcharts.chart(containerId, {
            chart: { type: 'line', backgroundColor: 'transparent' },
            title: { text: null },
            xAxis: { 
                type: 'datetime',
                labels: { style: { color: 'var(--text-secondary)' } }
            },
            yAxis: { 
                title: { text: null },
                labels: { style: { color: 'var(--text-secondary)' } },
                gridLineColor: 'var(--border-color)'
            },
            tooltip: {
                valueSuffix: suffix,
                valueDecimals: 2,
                shared: true
            },
            series: [{
                name: '🇺🇸 United States',
                data: usData,
                color: '#3b82f6',
                marker: { enabled: false },
                lineWidth: 3
            }, {
                name: '🇪🇺 European Union',
                data: euData,
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

    calculateYoY(series) {
        if (!series || series.length < 13) return 'N/A';
        const validValues = series.filter(s => s.value !== '.').map(s => parseFloat(s.value));
        if (validValues.length < 13) return 'N/A';
        
        const latest = validValues[validValues.length - 1];
        const yearAgo = validValues[validValues.length - 13];
        
        return (((latest - yearAgo) / yearAgo) * 100).toFixed(2);
    }

    calculateYoYTimeSeries(series) {
        const data = [];
        const values = series.filter(s => s.value !== '.');
        
        for (let i = 12; i < values.length; i++) {
            const current = parseFloat(values[i].value);
            const yearAgo = parseFloat(values[i - 12].value);
            const yoyChange = ((current - yearAgo) / yearAgo) * 100;
            
            data.push([new Date(values[i].date).getTime(), yoyChange]);
        }
        
        return data;
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

let macroComparison;

document.addEventListener('DOMContentLoaded', () => {
    macroComparison = new MacroComparison();
    macroComparison.init();
});