/**
 * ====================================================================
 * ALPHAVAULT AI - ECONOMIC DASHBOARD v2.1 - ULTRA FIXED + ECB IMPROVED
 * ====================================================================
 * Fix: Force les données récentes + Logs détaillés + ECB extraction améliorée
 */

class EconomicDashboard {
    constructor() {
        this.refreshInterval = null;
        this.lastUpdate = null;
    }

    async init() {
        console.log('📊 Economic Dashboard v2.1 - Initializing...');
        
        try {
            await Promise.all([
                this.loadDashboardData(),
                this.loadComparisonData(),
                this.loadCharts()
            ]);
            
            console.log('✅ Dashboard v2.1 loaded successfully');
            this.startAutoRefresh();
            
        } catch (error) {
            console.error('❌ Dashboard initialization error:', error);
            this.showError('Failed to load economic dashboard: ' + error.message);
        }
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

        grid.innerHTML = '<div class="eco-loading"><div class="eco-spinner"></div><p>Loading economic data v2.1...</p></div>';

        try {
            console.log('🔄 Fetching economic data...');
            
            // ✅ Récupérer avec sort_order DESC pour avoir les plus récentes en premier
            const [
                usGDP,
                usGDPGrowth,
                usUnemployment,
                usInflation,
                usFedRate,
                euGDP,
                euUnemployment,
                euInflation,
                euMainRate
            ] = await Promise.all([
                economicDataClient.getSeries('GDP', { limit: 1, sort_order: 'desc' }),
                economicDataClient.getSeries('A191RL1Q225SBEA', { limit: 1, sort_order: 'desc' }),
                economicDataClient.getSeries('UNRATE', { limit: 1, sort_order: 'desc' }),
                economicDataClient.getSeries('CPIAUCSL', { limit: 13, sort_order: 'desc' }),
                economicDataClient.getSeries('DFF', { limit: 1, sort_order: 'desc' }),
                economicDataClient.getECBGDP(),
                economicDataClient.getECBUnemployment(),
                economicDataClient.getECBInflation(),
                economicDataClient.getECBMainRate()
            ]);

            console.log('✅ Raw data received:');
            console.log('  US GDP:', usGDP);
            console.log('  US GDP Growth:', usGDPGrowth);
            console.log('  US Unemployment:', usUnemployment);
            console.log('  US Inflation:', usInflation);
            console.log('  US Fed Rate:', usFedRate);
            console.log('  EU GDP:', euGDP?.success);
            console.log('  EU Unemployment:', euUnemployment?.success);
            console.log('  EU Inflation:', euInflation?.success);
            console.log('  EU Main Rate:', euMainRate?.success);

            // Parser les données
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

            console.log('📊 Parsed US Data:', usData);
            console.log('📊 Parsed EU Data:', euData);

            // Afficher les cartes
            grid.innerHTML = `
                ${this.createEcoCard({
                    title: 'US GDP',
                    value: this.formatGDP(usData.gdp),
                    unit: 'Trillion USD',
                    flag: '🇺🇸',
                    cssClass: 'us-card',
                    change: parseFloat(usData.gdpGrowth),
                    changeType: parseFloat(usData.gdpGrowth) > 0 ? 'positive' : 'negative',
                    lastUpdate: usGDP[0]?.date
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
                    change: null,
                    lastUpdate: usUnemployment[0]?.date
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
                    lastUpdate: usInflation[0]?.date
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
                    lastUpdate: usFedRate[0]?.date
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
            console.log('✅ Dashboard cards rendered');

        } catch (error) {
            console.error('❌ Error loading dashboard data:', error);
            grid.innerHTML = `
                <div class="eco-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error: ${error.message}</p>
                    <button class="btn-primary" onclick="economicDashboard.loadDashboardData()">
                        <i class="fas fa-redo"></i> Retry
                    </button>
                </div>
            `;
        }
    }

    /**
     * ========================================
     * PARSING METHODS
     * ========================================
     */
    parseFREDLatest(series) {
        console.log('🔍 Parsing FRED series, length:', series?.length);
        
        if (!series || !Array.isArray(series) || series.length === 0) {
            console.warn('⚠ Empty FRED series');
            return 'N/A';
        }

        // Les données sont déjà triées par DESC, donc index 0 = plus récent
        const latest = series[0];
        console.log('  Latest entry:', latest);
        
        if (latest.value && latest.value !== '.') {
            const value = parseFloat(latest.value);
            console.log('  ✅ Parsed value:', value);
            return value.toFixed(2);
        }

        console.warn('⚠ No valid value in latest entry');
        return 'N/A';
    }

    parseECBLatest(data) {
        console.log('🔍 Parsing ECB data, success:', data?.success);
        
        if (!data || !data.success || !data.data) {
            console.warn('⚠ Invalid ECB data structure');
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

        // Les données sont en DESC, donc [0] = plus récent, [12] = il y a 12 mois
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
     * COMPARISON
     * ========================================
     */
    async loadComparisonData() {
        const container = document.getElementById('comparisonContainer');
        if (!container) return;

        try {
            console.log('🔄 Loading comparison data...');
            
            const [usGDPGrowth, euGDPGrowth] = await Promise.all([
                economicDataClient.getSeries('A191RL1Q225SBEA', { limit: 1, sort_order: 'desc' }),
                economicDataClient.getECBGDPGrowth()
            ]);

            const usGrowth = this.parseFREDLatest(usGDPGrowth);
            const euGrowth = this.parseECBLatest(euGDPGrowth);

            console.log('📊 Comparison - US:', usGrowth, '% | EU:', euGrowth, '%');

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
                </div>
            `;

        } catch (error) {
            console.error('❌ Error loading comparison:', error);
        }
    }

    /**
     * ========================================
     * CHARTS
     * ========================================
     */
    async loadCharts() {
        console.log('📊 Loading charts...');
        
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
            console.log('📊 Loading GDP chart...');
            
            // ✅ 40 derniers trimestres = 10 ans
            const usGDP = await economicDataClient.getSeries('A191RL1Q225SBEA', { 
                limit: 40, 
                sort_order: 'desc' 
            });

            console.log('  GDP data received:', usGDP.length, 'points');
            console.log('  First point (most recent):', usGDP[0]);
            console.log('  Last point (oldest):', usGDP[usGDP.length - 1]);
            
            // ✅ Inverser l'ordre pour avoir chronologique (ancien → récent)
            const chartData = usGDP
                .filter(d => d.value !== '.')
                .reverse() // ✅ IMPORTANT: Inverser car FRED retourne DESC
                .map(d => [new Date(d.date).getTime(), parseFloat(d.value)]);

            console.log('  Chart data:', chartData.length, 'points');
            console.log('  Date range:', new Date(chartData[0][0]).toISOString(), 'to', new Date(chartData[chartData.length-1][0]).toISOString());

            Highcharts.chart('gdpChart', {
                chart: { type: 'line', backgroundColor: 'transparent', height: 400 },
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
                tooltip: { valueDecimals: 2, valueSuffix: '%' },
                series: [{
                    name: 'US GDP Growth',
                    data: chartData,
                    color: '#3b82f6',
                    marker: { enabled: false },
                    lineWidth: 3
                }],
                credits: { enabled: false },
                legend: { enabled: true, itemStyle: { color: 'var(--text-primary)' } }
            });

            console.log('✅ GDP chart rendered');

        } catch (error) {
            console.error('❌ Error loading GDP chart:', error);
        }
    }

    async loadUnemploymentChart() {
        try {
            console.log('📊 Loading unemployment chart...');
            
            const [usUnemp, euUnemp] = await Promise.all([
                economicDataClient.getSeries('UNRATE', { limit: 120, sort_order: 'desc' }),
                economicDataClient.getECBUnemployment()
            ]);

            const usData = usUnemp
                .filter(d => d.value !== '.')
                .reverse()
                .map(d => [new Date(d.date).getTime(), parseFloat(d.value)]);

            const euData = this.extractECBTimeSeries(euUnemp);

            console.log('  US unemployment:', usData.length, 'points');
            console.log('  EU unemployment:', euData.length, 'points');

            Highcharts.chart('unemploymentChart', {
                chart: { type: 'line', backgroundColor: 'transparent', height: 400 },
                title: { text: null },
                xAxis: { type: 'datetime', labels: { style: { color: 'var(--text-secondary)' } } },
                yAxis: { 
                    title: { text: 'Unemployment Rate (%)', style: { color: 'var(--text-secondary)' } },
                    labels: { style: { color: 'var(--text-secondary)' } },
                    gridLineColor: 'var(--border-color)'
                },
                tooltip: { valueDecimals: 1, valueSuffix: '%' },
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
                legend: { enabled: true, itemStyle: { color: 'var(--text-primary)' } }
            });

            console.log('✅ Unemployment chart rendered');

        } catch (error) {
            console.error('❌ Error loading unemployment chart:', error);
        }
    }

    async loadInflationChart() {
        try {
            console.log('📊 Loading inflation chart...');
            
            const [usInflation, euInflation] = await Promise.all([
                economicDataClient.getSeries('CPIAUCSL', { limit: 120, sort_order: 'desc' }),
                economicDataClient.getECBInflation()
            ]);

            const usData = this.calculateYoYTimeSeriesFromDesc(usInflation);
            const euData = this.extractECBTimeSeries(euInflation);

            console.log('  US inflation:', usData.length, 'points');
            console.log('  EU inflation:', euData.length, 'points');

            Highcharts.chart('inflationChart', {
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
                tooltip: { valueDecimals: 2, valueSuffix: '%' },
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
                legend: { enabled: true, itemStyle: { color: 'var(--text-primary)' } }
            });

            console.log('✅ Inflation chart rendered');

        } catch (error) {
            console.error('❌ Error loading inflation chart:', error);
        }
    }

    async loadInterestRateChart() {
        try {
            console.log('📊 Loading interest rate chart...');
            
            const [usFedRate, ecbMainRate] = await Promise.all([
                economicDataClient.getSeries('DFF', { limit: 120, sort_order: 'desc' }),
                economicDataClient.getECBMainRate()
            ]);

            const usData = usFedRate
                .filter(d => d.value !== '.')
                .reverse()
                .map(d => [new Date(d.date).getTime(), parseFloat(d.value)]);

            const euData = this.extractECBTimeSeries(ecbMainRate);

            console.log('  US rates:', usData.length, 'points');
            console.log('  EU rates:', euData.length, 'points');

            Highcharts.chart('interestRateChart', {
                chart: { type: 'area', backgroundColor: 'transparent', height: 400 },
                title: { text: null },
                xAxis: { type: 'datetime', labels: { style: { color: 'var(--text-secondary)' } } },
                yAxis: { 
                    title: { text: 'Interest Rate (%)', style: { color: 'var(--text-secondary)' } },
                    labels: { style: { color: 'var(--text-secondary)' } },
                    gridLineColor: 'var(--border-color)'
                },
                tooltip: { valueDecimals: 2, valueSuffix: '%' },
                plotOptions: { area: { fillOpacity: 0.2 } },
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
                legend: { enabled: true, itemStyle: { color: 'var(--text-primary)' } }
            });

            console.log('✅ Interest rate chart rendered');

        } catch (error) {
            console.error('❌ Error loading interest rate chart:', error);
        }
    }

    /**
     * ========================================
     * HELPERS - ✅ AMÉLIORATION ECB EXTRACTION
     * ========================================
     */
    calculateYoYTimeSeriesFromDesc(series) {
        // Les données sont en DESC, donc on calcule YoY puis on inverse
        const data = [];
        
        for (let i = 0; i < series.length - 12; i++) {
            if (series[i].value === '.' || series[i + 12].value === '.') continue;
            
            const current = parseFloat(series[i].value);
            const yearAgo = parseFloat(series[i + 12].value);
            const yoyChange = ((current - yearAgo) / yearAgo) * 100;
            
            data.push([new Date(series[i].date).getTime(), yoyChange]);
        }
        
        return data.reverse(); // Inverser pour avoir chronologique
    }

    /**
     * ✅ AMÉLIORATION: Extraction ECB avec logs détaillés et filtrage
     */
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
                console.warn('  ⚠ No observations extracted from ECB data');
                return [];
            }
            
            // ✅ IMPORTANT: Filtrer les valeurs invalides
            const validObservations = observations
                .map(obs => {
                    // Vérifier si le timestamp est valide
                    if (!obs.timestamp || obs.timestamp === 0) {
                        console.warn('  ⚠ Invalid timestamp for observation:', obs);
                        return null;
                    }
                    // Vérifier si la valeur est un nombre valide
                    if (isNaN(obs.value)) {
                        console.warn('  ⚠ Invalid value for observation:', obs);
                        return null;
                    }
                    return [obs.timestamp, obs.value];
                })
                .filter(item => item !== null); // Supprimer les valeurs null
            
            console.log(`  ✅ ECB valid time series: ${validObservations.length} points`);
            
            if (validObservations.length > 0) {
                console.log(`  📅 Date range: ${new Date(validObservations[0][0]).toISOString()} to ${new Date(validObservations[validObservations.length-1][0]).toISOString()}`);
            }
            
            return validObservations;
            
        } catch (error) {
            console.error('❌ Error extracting ECB time series:', error);
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
// INITIALISATION
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