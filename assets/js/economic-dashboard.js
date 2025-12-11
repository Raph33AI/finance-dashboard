/**
 * ====================================================================
 * ALPHAVAULT AI - ECONOMIC DASHBOARD (US vs EU) - FIXED VERSION
 * ====================================================================
 * Correction: Parsing correct des données + Séries appropriées
 */

class EconomicDashboard {
    constructor() {
        this.refreshInterval = null;
        this.lastUpdate = null;
    }

    /**
     * ========================================
     * INITIALISATION
     * ========================================
     */
    async init() {
        console.log('📊 Initializing Economic Dashboard...');
        
        try {
            // Charger toutes les sections
            await Promise.all([
                this.loadDashboardData(),
                this.loadComparisonData(),
                this.loadCharts()
            ]);
            
            console.log('✅ Dashboard loaded successfully');
            
            // Auto-refresh toutes les 5 minutes
            this.startAutoRefresh();
            
        } catch (error) {
            console.error('❌ Dashboard initialization error:', error);
            this.showError('Failed to load economic dashboard');
        }
    }

    /**
     * ========================================
     * SECTION 1: DASHBOARD CARDS - CORRIGÉ
     * ========================================
     */
    async loadDashboardData() {
        const grid = document.getElementById('dashboardGrid');
        if (!grid) return;

        grid.innerHTML = '<div class="eco-loading"><div class="eco-spinner"></div><p>Loading economic data...</p></div>';

        try {
            // ✅ CORRECTION: Récupérer les séries individuellement avec les BONNES séries
            const [
                usGDP,           // Niveau GDP
                usGDPGrowth,     // ✅ NOUVEAU: Croissance GDP
                usUnemployment,
                usInflation,
                usFedRate,
                euGDP,
                euUnemployment,
                euInflation,
                euMainRate
            ] = await Promise.all([
                economicDataClient.getSeries('GDP', { limit: 1 }),
                economicDataClient.getSeries('A191RL1Q225SBEA', { limit: 1 }), // ✅ Real GDP Growth Rate
                economicDataClient.getSeries('UNRATE', { limit: 1 }),
                economicDataClient.getSeries('CPIAUCSL', { limit: 12 }), // Pour calculer YoY
                economicDataClient.getSeries('DFF', { limit: 1 }),
                economicDataClient.getECBGDP(),
                economicDataClient.getECBUnemployment(),
                economicDataClient.getECBInflation(),
                economicDataClient.getECBMainRate()
            ]);

            console.log('🔍 Raw data received:');
            console.log('US GDP Growth:', usGDPGrowth);
            console.log('US Unemployment:', usUnemployment);
            console.log('US Inflation:', usInflation);
            console.log('EU Inflation:', euInflation);

            // ✅ Parser les données US (FRED) - CORRIGÉ
            const usData = {
                gdp: this.parseFREDSingle(usGDP),                    // Niveau GDP en trillions
                gdpGrowth: this.parseFREDSingle(usGDPGrowth),       // ✅ Taux de croissance
                unemployment: this.parseFREDSingle(usUnemployment),
                inflation: this.calculateYoYInflation(usInflation), // ✅ Calcul YoY
                fedRate: this.parseFREDSingle(usFedRate)
            };

            // ✅ Parser les données EU (ECB) - CORRIGÉ
            const euData = {
                gdp: this.parseECBSingle(euGDP),
                unemployment: this.parseECBSingle(euUnemployment),
                inflation: this.parseECBSingle(euInflation),
                mainRate: this.parseECBSingle(euMainRate)
            };

            console.log('📊 Parsed US Data:', usData);
            console.log('📊 Parsed EU Data:', euData);

            // Calculer les changements
            const usGDPChange = this.calculateChangeFromSeries(usGDPGrowth);
            const usUnempChange = this.calculateChangeFromSeries(usUnemployment);

            // Générer les cartes
            grid.innerHTML = `
                ${this.createEcoCard({
                    title: 'US GDP',
                    value: this.formatGDP(usData.gdp),
                    unit: 'Trillion USD',
                    flag: '🇺🇸',
                    cssClass: 'us-card',
                    change: usData.gdpGrowth !== 'N/A' ? parseFloat(usData.gdpGrowth) : null,
                    changeType: parseFloat(usData.gdpGrowth) > 0 ? 'positive' : 'negative',
                    lastUpdate: usGDPGrowth[0]?.date || null
                })}
                
                ${this.createEcoCard({
                    title: 'EU GDP',
                    value: euData.gdp !== 'N/A' ? this.formatGDP(euData.gdp) : 'N/A',
                    unit: 'Trillion EUR',
                    flag: '🇪🇺',
                    cssClass: 'eu-card',
                    change: null,
                    lastUpdate: null
                })}
                
                ${this.createEcoCard({
                    title: 'US Unemployment',
                    value: usData.unemployment + '%',
                    unit: 'Jobless Rate',
                    flag: '🇺🇸',
                    cssClass: 'us-card',
                    change: usUnempChange.value,
                    changeType: usUnempChange.type === 'positive' ? 'negative' : 'positive',
                    lastUpdate: usUnemployment[0]?.date || null
                })}
                
                ${this.createEcoCard({
                    title: 'EU Unemployment',
                    value: euData.unemployment + '%',
                    unit: 'Jobless Rate',
                    flag: '🇪🇺',
                    cssClass: 'eu-card',
                    change: null,
                    lastUpdate: null
                })}
                
                ${this.createEcoCard({
                    title: 'US Inflation',
                    value: usData.inflation + '%',
                    unit: 'YoY CPI Change',
                    flag: '🇺🇸',
                    cssClass: 'us-card',
                    change: parseFloat(usData.inflation),
                    changeType: parseFloat(usData.inflation) > 2 ? 'negative' : 'positive',
                    lastUpdate: usInflation[0]?.date || null
                })}
                
                ${this.createEcoCard({
                    title: 'EU Inflation',
                    value: euData.inflation + '%',
                    unit: 'YoY HICP',
                    flag: '🇪🇺',
                    cssClass: 'eu-card',
                    change: null,
                    lastUpdate: null
                })}
                
                ${this.createEcoCard({
                    title: 'Fed Funds Rate',
                    value: usData.fedRate + '%',
                    unit: 'Target Rate',
                    flag: '🇺🇸',
                    cssClass: 'us-card',
                    change: null,
                    lastUpdate: usFedRate[0]?.date || null
                })}
                
                ${this.createEcoCard({
                    title: 'ECB Main Rate',
                    value: euData.mainRate + '%',
                    unit: 'Main Refinancing',
                    flag: '🇪🇺',
                    cssClass: 'eu-card',
                    change: null,
                    lastUpdate: null
                })}
            `;

            this.lastUpdate = new Date();

        } catch (error) {
            console.error('❌ Error loading dashboard data:', error);
            grid.innerHTML = `
                <div class="eco-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error loading economic data: ${error.message}</p>
                    <button class="btn-primary" onclick="economicDashboard.loadDashboardData()">
                        <i class="fas fa-redo"></i> Retry
                    </button>
                </div>
            `;
        }
    }

    /**
     * ✅ NOUVEAU: Parser une série FRED individuelle
     */
    parseFREDSingle(series) {
        console.log('🔍 Parsing FRED series:', series);
        
        if (!series || !Array.isArray(series) || series.length === 0) {
            console.warn('⚠ No data in series');
            return 'N/A';
        }

        // Chercher la dernière valeur valide
        for (let i = series.length - 1; i >= 0; i--) {
            if (series[i].value && series[i].value !== '.') {
                const value = parseFloat(series[i].value);
                console.log('✅ Found value:', value, 'at index', i);
                return value.toFixed(2);
            }
        }

        console.warn('⚠ No valid value found in series');
        return 'N/A';
    }

    /**
     * ✅ NOUVEAU: Parser une série ECB
     */
    parseECBSingle(data) {
        console.log('🔍 Parsing ECB data:', data);
        
        if (!data || !data.success || !data.data) {
            console.warn('⚠ ECB data not successful');
            return 'N/A';
        }

        try {
            const observations = economicDataClient.extractECBObservations(data.data);
            if (!observations || observations.length === 0) {
                console.warn('⚠ No ECB observations found');
                return 'N/A';
            }

            const latest = observations[observations.length - 1];
            console.log('✅ ECB latest value:', latest.value);
            return latest.value.toFixed(2);
        } catch (error) {
            console.error('❌ Error parsing ECB data:', error);
            return 'N/A';
        }
    }

    /**
     * ✅ NOUVEAU: Calculer l'inflation YoY
     */
    calculateYoYInflation(series) {
        if (!series || series.length < 13) {
            console.warn('⚠ Not enough data for YoY calculation');
            return 'N/A';
        }

        const validValues = series.filter(s => s.value !== '.').map(s => parseFloat(s.value));
        if (validValues.length < 13) {
            console.warn('⚠ Not enough valid values for YoY');
            return 'N/A';
        }

        const latest = validValues[validValues.length - 1];
        const yearAgo = validValues[validValues.length - 13];

        if (!latest || !yearAgo || yearAgo === 0) {
            return 'N/A';
        }

        const yoyChange = ((latest - yearAgo) / yearAgo) * 100;
        console.log('✅ YoY Inflation calculated:', yoyChange.toFixed(2) + '%');
        return yoyChange.toFixed(2);
    }

    /**
     * Formater le GDP en trillions
     */
    formatGDP(value) {
        if (value === 'N/A' || isNaN(parseFloat(value))) return 'N/A';
        const num = parseFloat(value);
        
        // Si c'est déjà en milliards, convertir en trillions
        if (num > 1000) {
            return (num / 1000).toFixed(2);
        }
        
        return num.toFixed(2);
    }

    /**
     * Créer une carte économique
     */
    createEcoCard(options) {
        const { title, value, unit, flag, cssClass, change, changeType, lastUpdate } = options;
        
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
            <div class='eco-card ${cssClass}'>
                <div class='eco-card-header'>
                    <h3 class='eco-card-title'>${title}</h3>
                    <span class='eco-flag'>${flag}</span>
                </div>
                <div class='eco-value'>${value}</div>
                <div class='eco-sublabel'>${unit}</div>
                ${changeHTML}
                ${lastUpdate ? `<div class='eco-sublabel' style='margin-top: 10px; font-size: 0.75rem;'>Updated: ${lastUpdate}</div>` : ''}
            </div>
        `;
    }

    /**
     * ========================================
     * SECTION 2: COMPARISON DATA
     * ========================================
     */
    async loadComparisonData() {
        const container = document.getElementById('comparisonContainer');
        if (!container) return;

        try {
            // ✅ Utiliser la bonne série pour la croissance GDP
            const [usGDPGrowth, euGDPGrowth] = await Promise.all([
                economicDataClient.getSeries('A191RL1Q225SBEA', { limit: 1 }), // ✅ US Real GDP Growth
                economicDataClient.getECBGDPGrowth()
            ]);

            const usGrowth = this.parseFREDSingle(usGDPGrowth);
            const euGrowth = this.parseECBSingle(euGDPGrowth);

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
                
                <div style='text-align: center; margin-top: 20px; padding: 16px; background: rgba(102, 126, 234, 0.08); border-radius: 12px;'>
                    <p style='font-weight: 700; color: var(--text-secondary);'>
                        ${parseFloat(usGrowth) > parseFloat(euGrowth) 
                            ? '🇺🇸 US economy is growing faster' 
                            : '🇪🇺 EU economy is growing faster'}
                    </p>
                    <p style='font-size: 0.85rem; color: var(--text-secondary); margin-top: 8px;'>
                        Difference: ${Math.abs(parseFloat(usGrowth) - parseFloat(euGrowth)).toFixed(2)} percentage points
                    </p>
                </div>
            `;

        } catch (error) {
            console.error('❌ Error loading comparison:', error);
            container.innerHTML = `<div class='eco-error'><p>Error loading comparison data</p></div>`;
        }
    }

    /**
     * ========================================
     * SECTION 3: HISTORICAL CHARTS - CORRIGÉ
     * ========================================
     */
    async loadCharts() {
        try {
            await this.loadGDPChart();
            await this.loadUnemploymentChart();
            await this.loadInflationChart();
            await this.loadInterestRateChart();
        } catch (error) {
            console.error('❌ Error loading charts:', error);
        }
    }

    async loadGDPChart() {
        try {
            // ✅ Utiliser la série de croissance GDP (dernières 10 ans = 40 trimestres)
            const usGDP = await economicDataClient.getSeries('A191RL1Q225SBEA', { limit: 40 });
            
            const chartData = usGDP
                .filter(d => d.value !== '.')
                .map(d => [new Date(d.date).getTime(), parseFloat(d.value)]);

            console.log('📊 GDP Chart data points:', chartData.length);

            Highcharts.chart('gdpChart', {
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
                    plotLines: [{
                        value: 0,
                        color: '#ef4444',
                        width: 2,
                        zIndex: 4
                    }]
                },
                tooltip: {
                    valueDecimals: 2,
                    valueSuffix: '%'
                },
                series: [{
                    name: 'US GDP Growth',
                    data: chartData,
                    color: '#3b82f6',
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
            console.error('❌ Error loading GDP chart:', error);
        }
    }

    async loadUnemploymentChart() {
        try {
            // Dernières 10 ans = 120 mois
            const [usUnemp, euUnemp] = await Promise.all([
                economicDataClient.getSeries('UNRATE', { limit: 120 }),
                economicDataClient.getECBUnemployment()
            ]);

            const usData = usUnemp
                .filter(d => d.value !== '.')
                .map(d => [new Date(d.date).getTime(), parseFloat(d.value)]);

            const euData = this.extractECBTimeSeries(euUnemp);

            console.log('📊 Unemployment US data points:', usData.length);
            console.log('📊 Unemployment EU data points:', euData.length);

            Highcharts.chart('unemploymentChart', {
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
                    title: { text: 'Unemployment Rate (%)', style: { color: 'var(--text-secondary)' } },
                    labels: { style: { color: 'var(--text-secondary)' } },
                    gridLineColor: 'var(--border-color)'
                },
                tooltip: {
                    valueDecimals: 1,
                    valueSuffix: '%'
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

        } catch (error) {
            console.error('❌ Error loading unemployment chart:', error);
        }
    }

    async loadInflationChart() {
        try {
            const [usInflation, euInflation] = await Promise.all([
                economicDataClient.getSeries('CPIAUCSL', { limit: 120 }),
                economicDataClient.getECBInflation()
            ]);

            const usData = this.calculateYoYTimeSeries(usInflation);
            const euData = this.extractECBTimeSeries(euInflation);

            console.log('📊 Inflation US data points:', usData.length);
            console.log('📊 Inflation EU data points:', euData.length);

            Highcharts.chart('inflationChart', {
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
                    title: { text: 'Inflation Rate (YoY %)', style: { color: 'var(--text-secondary)' } },
                    labels: { style: { color: 'var(--text-secondary)' } },
                    gridLineColor: 'var(--border-color)',
                    plotLines: [{
                        value: 2,
                        color: '#f59e0b',
                        width: 2,
                        dashStyle: 'Dash',
                        label: { text: 'Target 2%', style: { color: '#f59e0b' } }
                    }]
                },
                tooltip: {
                    valueDecimals: 2,
                    valueSuffix: '%'
                },
                series: [{
                    name: '🇺🇸 United States',
                    data: usData,
                    color: '#f59e0b',
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

        } catch (error) {
            console.error('❌ Error loading inflation chart:', error);
        }
    }

    async loadInterestRateChart() {
        try {
            const [usFedRate, ecbMainRate] = await Promise.all([
                economicDataClient.getSeries('DFF', { limit: 120 }),
                economicDataClient.getECBMainRate()
            ]);

            const usData = usFedRate
                .filter(d => d.value !== '.')
                .map(d => [new Date(d.date).getTime(), parseFloat(d.value)]);

            const euData = this.extractECBTimeSeries(ecbMainRate);

            console.log('📊 Interest Rate US data points:', usData.length);
            console.log('📊 Interest Rate EU data points:', euData.length);

            Highcharts.chart('interestRateChart', {
                chart: { 
                    type: 'area', 
                    backgroundColor: 'transparent',
                    height: 400
                },
                title: { text: null },
                xAxis: { 
                    type: 'datetime',
                    labels: { style: { color: 'var(--text-secondary)' } }
                },
                yAxis: { 
                    title: { text: 'Interest Rate (%)', style: { color: 'var(--text-secondary)' } },
                    labels: { style: { color: 'var(--text-secondary)' } },
                    gridLineColor: 'var(--border-color)'
                },
                tooltip: {
                    valueDecimals: 2,
                    valueSuffix: '%'
                },
                plotOptions: {
                    area: {
                        fillOpacity: 0.2
                    }
                },
                series: [{
                    name: '🇺🇸 Fed Funds Rate',
                    data: usData,
                    color: '#3b82f6',
                    marker: { enabled: false },
                    lineWidth: 3
                }, {
                    name: '🇪🇺 ECB Main Rate',
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

        } catch (error) {
            console.error('❌ Error loading interest rate chart:', error);
        }
    }

    /**
     * ========================================
     * HELPER METHODS
     * ========================================
     */

    calculateChangeFromSeries(series) {
        if (!series || !Array.isArray(series) || series.length < 2) {
            return { value: null, type: null };
        }

        const validValues = series.filter(s => s.value !== '.').map(s => parseFloat(s.value));
        if (validValues.length < 2) return { value: null, type: null };

        const latest = validValues[validValues.length - 1];
        const previous = validValues[validValues.length - 2];
        
        const change = ((latest - previous) / previous) * 100;
        
        return {
            value: change,
            type: change >= 0 ? 'positive' : 'negative'
        };
    }

    calculateYoYTimeSeries(series) {
        const data = [];
        const values = series.filter(s => s.value !== '.');

        for (let i = 12; i < values.length; i++) {
            const current = parseFloat(values[i].value);
            const yearAgo = parseFloat(values[i - 12].value);
            const yoyChange = ((current - yearAgo) / yearAgo) * 100;

            data.push([
                new Date(values[i].date).getTime(),
                yoyChange
            ]);
        }

        return data;
    }

    extractECBTimeSeries(data) {
        if (!data || !data.success) return [];

        try {
            const observations = economicDataClient.extractECBObservations(data.data);
            return observations.map(obs => [obs.timestamp, obs.value]);
        } catch (error) {
            console.error('Error extracting ECB time series:', error);
            return [];
        }
    }

    showError(message) {
        const container = document.querySelector('.container');
        if (container) {
            container.innerHTML = `
                <div class="eco-error" style="margin: 40px auto; max-width: 600px;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 20px;"></i>
                    <h3>${message}</h3>
                    <button class="btn-primary" onclick="location.reload()">
                        <i class="fas fa-redo"></i> Reload Page
                    </button>
                </div>
            `;
        }
    }

    /**
     * ========================================
     * AUTO-REFRESH
     * ========================================
     */
    startAutoRefresh() {
        this.refreshInterval = setInterval(() => {
            console.log('🔄 Auto-refreshing dashboard...');
            this.loadDashboardData();
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
// INITIALISATION GLOBALE
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