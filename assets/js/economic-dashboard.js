/**
 * ====================================================================
 * ALPHAVAULT AI - ECONOMIC DASHBOARD (US vs EU)
 * ====================================================================
 * Script principal pour le tableau de bord économique
 * Utilise economic-data-client.js pour récupérer les données FRED/ECB
 * 
 * Fonctionnalités:
 * - Indicateurs en temps réel (US & EU)
 * - Comparaisons directes
 * - Graphiques historiques (GDP, Unemployment, Inflation, Rates)
 * - Auto-refresh toutes les 5 minutes
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
     * SECTION 1: DASHBOARD CARDS
     * ========================================
     */
    async loadDashboardData() {
        const grid = document.getElementById('dashboardGrid');
        if (!grid) return;

        grid.innerHTML = '<div class="eco-loading"><div class="eco-spinner"></div><p>Loading economic data...</p></div>';

        try {
            // Récupérer les dashboards US et EU en parallèle
            const [usDashboard, euDashboard] = await Promise.all([
                economicDataClient.getDashboard(),
                economicDataClient.getECBDashboard()
            ]);

            console.log('🇺🇸 US Dashboard:', usDashboard);
            console.log('🇪🇺 EU Dashboard:', euDashboard);

            // Parser les données US (FRED)
            const usData = {
                gdp: this.parseFREDLatest(usDashboard.series?.GDP),
                unemployment: this.parseFREDLatest(usDashboard.series?.UNRATE),
                inflation: this.parseFREDLatest(usDashboard.series?.CPIAUCSL),
                fedRate: this.parseFREDLatest(usDashboard.series?.DFF),
                manufacturing: this.parseFREDLatest(usDashboard.series?.INDPRO),
                retailSales: this.parseFREDLatest(usDashboard.series?.RSAFS)
            };

            // Parser les données EU (ECB)
            const euData = {
                inflation: this.parseECBLatest(euDashboard.data?.inflation),
                unemployment: this.parseECBLatest(euDashboard.data?.unemployment),
                mainRate: this.parseECBLatest(euDashboard.data?.mainRate),
                gdp: this.parseECBLatest(euDashboard.data?.gdp),
                m3: this.parseECBLatest(euDashboard.data?.m3)
            };

            // Calculer les changements (simplifié - peut être amélioré avec données historiques)
            const usGDPChange = this.calculateChange(usDashboard.series?.GDP);
            const usUnempChange = this.calculateChange(usDashboard.series?.UNRATE);
            const usInflationChange = this.calculateChange(usDashboard.series?.CPIAUCSL);

            // Générer les cartes
            grid.innerHTML = `
                ${this.createEcoCard({
                    title: 'US GDP',
                    value: this.formatLargeNumber(usData.gdp.value, 'T'),
                    unit: 'Trillion USD',
                    flag: '🇺🇸',
                    cssClass: 'us-card',
                    change: usGDPChange.value,
                    changeType: usGDPChange.type,
                    lastUpdate: usData.gdp.date
                })}
                
                ${this.createEcoCard({
                    title: 'EU GDP',
                    value: euData.gdp.value !== 'N/A' ? this.formatLargeNumber(euData.gdp.value, 'T') : 'N/A',
                    unit: 'Trillion EUR',
                    flag: '🇪🇺',
                    cssClass: 'eu-card',
                    change: null,
                    lastUpdate: euData.gdp.date
                })}
                
                ${this.createEcoCard({
                    title: 'US Unemployment',
                    value: usData.unemployment.value + '%',
                    unit: 'Jobless Rate',
                    flag: '🇺🇸',
                    cssClass: 'us-card',
                    change: usUnempChange.value,
                    changeType: usUnempChange.type === 'positive' ? 'negative' : 'positive', // Inversé car baisse = bon
                    lastUpdate: usData.unemployment.date
                })}
                
                ${this.createEcoCard({
                    title: 'EU Unemployment',
                    value: euData.unemployment.value + '%',
                    unit: 'Jobless Rate',
                    flag: '🇪🇺',
                    cssClass: 'eu-card',
                    change: null,
                    lastUpdate: euData.unemployment.date
                })}
                
                ${this.createEcoCard({
                    title: 'US Inflation',
                    value: usInflationChange.value + '%',
                    unit: 'YoY CPI Change',
                    flag: '🇺🇸',
                    cssClass: 'us-card',
                    change: usInflationChange.value,
                    changeType: usInflationChange.type,
                    lastUpdate: usData.inflation.date
                })}
                
                ${this.createEcoCard({
                    title: 'EU Inflation',
                    value: euData.inflation.value + '%',
                    unit: 'YoY HICP',
                    flag: '🇪🇺',
                    cssClass: 'eu-card',
                    change: null,
                    lastUpdate: euData.inflation.date
                })}
                
                ${this.createEcoCard({
                    title: 'Fed Funds Rate',
                    value: usData.fedRate.value + '%',
                    unit: 'Target Rate',
                    flag: '🇺🇸',
                    cssClass: 'us-card',
                    change: null,
                    lastUpdate: usData.fedRate.date
                })}
                
                ${this.createEcoCard({
                    title: 'ECB Main Rate',
                    value: euData.mainRate.value + '%',
                    unit: 'Main Refinancing',
                    flag: '🇪🇺',
                    cssClass: 'eu-card',
                    change: null,
                    lastUpdate: euData.mainRate.date
                })}
            `;

            this.lastUpdate = new Date();

        } catch (error) {
            console.error('❌ Error loading dashboard data:', error);
            grid.innerHTML = `
                <div class="eco-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error loading economic data</p>
                    <button class="btn-primary" onclick="economicDashboard.loadDashboardData()">
                        <i class="fas fa-redo"></i> Retry
                    </button>
                </div>
            `;
        }
    }

    /**
     * Créer une carte économique
     */
    createEcoCard(options) {
        const { title, value, unit, flag, cssClass, change, changeType, lastUpdate } = options;
        
        let changeHTML = '';
        if (change !== null && change !== undefined) {
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
            // Récupérer les dernières valeurs pour comparaison
            const usGDPGrowth = await economicDataClient.getSeries('A191RL1Q225SBEA', { limit: 1 }); // US GDP Growth
            const euGDPGrowth = await economicDataClient.getECBGDPGrowth();

            const usGrowth = this.parseFREDLatest(usGDPGrowth);
            const euGrowth = this.parseECBLatest(euGDPGrowth);

            container.innerHTML = `
                <div class='comparison-grid'>
                    <div class='comparison-card us'>
                        <h4>🇺🇸 United States</h4>
                        <div class='eco-value' style='font-size: 2.5rem; margin: 20px 0;'>${usGrowth.value}%</div>
                        <div class='eco-sublabel'>GDP Growth Rate (Annual)</div>
                    </div>
                    
                    <div class='comparison-vs'>VS</div>
                    
                    <div class='comparison-card eu'>
                        <h4>🇪🇺 European Union</h4>
                        <div class='eco-value' style='font-size: 2.5rem; margin: 20px 0;'>${euGrowth.value}%</div>
                        <div class='eco-sublabel'>GDP Growth Rate (Annual)</div>
                    </div>
                </div>
                
                <div style='text-align: center; margin-top: 20px; padding: 16px; background: rgba(102, 126, 234, 0.08); border-radius: 12px;'>
                    <p style='font-weight: 700; color: var(--text-secondary);'>
                        ${parseFloat(usGrowth.value) > parseFloat(euGrowth.value) 
                            ? '🇺🇸 US economy is growing faster' 
                            : '🇪🇺 EU economy is growing faster'}
                    </p>
                    <p style='font-size: 0.85rem; color: var(--text-secondary); margin-top: 8px;'>
                        Difference: ${Math.abs(parseFloat(usGrowth.value) - parseFloat(euGrowth.value)).toFixed(2)} percentage points
                    </p>
                </div>
            `;

        } catch (error) {
            console.error('❌ Error loading comparison:', error);
            container.innerHTML = `
                <div class='eco-error'>
                    <p>Error loading comparison data</p>
                </div>
            `;
        }
    }

    /**
     * ========================================
     * SECTION 3: HISTORICAL CHARTS
     * ========================================
     */
    async loadCharts() {
        try {
            // Chart 1: GDP Growth
            await this.loadGDPChart();

            // Chart 2: Unemployment
            await this.loadUnemploymentChart();

            // Chart 3: Inflation
            await this.loadInflationChart();

            // Chart 4: Interest Rates
            await this.loadInterestRateChart();

        } catch (error) {
            console.error('❌ Error loading charts:', error);
        }
    }

    async loadGDPChart() {
        try {
            const usGDP = await economicDataClient.getSeries('A191RL1Q225SBEA', { limit: 40 }); // US GDP Growth
            
            const chartData = usGDP
                .filter(d => d.value !== '.')
                .map(d => [new Date(d.date).getTime(), parseFloat(d.value)]);

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
            const [usUnemp, euUnemp] = await Promise.all([
                economicDataClient.getSeries('UNRATE', { limit: 120 }),
                economicDataClient.getECBUnemployment()
            ]);

            const usData = usUnemp
                .filter(d => d.value !== '.')
                .map(d => [new Date(d.date).getTime(), parseFloat(d.value)]);

            // Extraire données EU (simplifié)
            const euData = this.extractECBTimeSeries(euUnemp);

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

            // Calculer YoY pour US
            const usData = this.calculateYoYChange(usInflation);
            const euData = this.extractECBTimeSeries(euInflation);

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

    /**
     * Parser la dernière valeur d'une série FRED
     */
    parseFREDLatest(series) {
        if (!series || !Array.isArray(series) || series.length === 0) {
            return { value: 'N/A', date: null };
        }

        // Trouver la dernière valeur valide
        for (let i = series.length - 1; i >= 0; i--) {
            if (series[i].value !== '.') {
                return {
                    value: parseFloat(series[i].value).toFixed(2),
                    date: series[i].date
                };
            }
        }

        return { value: 'N/A', date: null };
    }

    /**
     * Parser la dernière valeur ECB (format SDMX)
     */
    parseECBLatest(data) {
        if (!data || !data.success || !data.data) {
            return { value: 'N/A', date: null };
        }

        try {
            const observations = economicDataClient.extractECBObservations(data.data);
            if (observations.length === 0) return { value: 'N/A', date: null };

            const latest = observations[observations.length - 1];
            return {
                value: latest.value.toFixed(2),
                date: latest.date
            };
        } catch (error) {
            console.error('Error parsing ECB data:', error);
            return { value: 'N/A', date: null };
        }
    }

    /**
     * Calculer le changement entre les 2 dernières valeurs
     */
    calculateChange(series) {
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

    /**
     * Calculer le changement YoY (année sur année)
     */
    calculateYoYChange(series) {
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

    /**
     * Extraire une série temporelle ECB
     */
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

    /**
     * Formater les grands nombres
     */
    formatLargeNumber(value, unit = '') {
        if (value === 'N/A' || isNaN(parseFloat(value))) return 'N/A';
        
        const num = parseFloat(value);
        
        if (unit === 'T') {
            return (num / 1000).toFixed(2);
        }
        
        if (num >= 1e12) {
            return (num / 1e12).toFixed(2) + 'T';
        } else if (num >= 1e9) {
            return (num / 1e9).toFixed(2) + 'B';
        } else if (num >= 1e6) {
            return (num / 1e6).toFixed(2) + 'M';
        }
        
        return num.toFixed(2);
    }

    /**
     * Afficher une erreur globale
     */
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
        // Rafraîchir toutes les 5 minutes
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

// Cleanup au déchargement de la page
window.addEventListener('beforeunload', () => {
    if (economicDashboard) {
        economicDashboard.stopAutoRefresh();
    }
});