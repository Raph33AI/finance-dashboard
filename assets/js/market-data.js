/* ==============================================
   MARKET-DATA.JS - VERSION AVEC FALLBACK PROXY
   ============================================== */

const MarketData = (function() {
    'use strict';
    
    // ========== CONFIGURATION PROXIES CORS (avec fallback) ==========
    const CORS_PROXIES = [
        'https://corsproxy.io/?',
        'https://api.codetabs.com/v1/proxy?quest=',
        'https://api.allorigins.win/raw?url='
    ];
    
    let currentProxyIndex = 0;
    
    const YAHOO_FINANCE_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart/';
    const YAHOO_QUOTE_BASE = 'https://query1.finance.yahoo.com/v10/finance/quoteSummary/';
    
    let currentStockData = null;
    let technicalIndicators = null;
    
    // ========== FONCTION FETCH AVEC RETRY ==========
    async function fetchWithProxy(url, retries = CORS_PROXIES.length) {
        for (let i = 0; i < retries; i++) {
            const proxyIndex = (currentProxyIndex + i) % CORS_PROXIES.length;
            const proxy = CORS_PROXIES[proxyIndex];
            const proxyUrl = proxy + encodeURIComponent(url);
            
            console.log(`🔄 Tentative ${i + 1}/${retries} avec proxy:`, proxy);
            
            try {
                const response = await fetch(proxyUrl, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                    }
                });
                
                if (response.ok) {
                    console.log('✅ Succès avec proxy:', proxy);
                    currentProxyIndex = proxyIndex; // Mémoriser le proxy fonctionnel
                    return response;
                }
                
                console.warn(`⚠️ Échec ${response.status} avec proxy:`, proxy);
            } catch (error) {
                console.warn(`❌ Erreur avec proxy ${proxy}:`, error.message);
            }
        }
        
        throw new Error('Tous les proxies CORS ont échoué. Veuillez réessayer plus tard.');
    }
    
    // ========== FONCTION PRINCIPALE ==========
    async function fetchStockData() {
        const symbol = document.getElementById('stockSymbol').value.trim().toUpperCase();
        const period = document.getElementById('timePeriod').value;
        
        if (!symbol) {
            showError('Veuillez entrer un symbole boursier !');
            return;
        }
        
        showLoading(true);
        hideError();
        hideResults();
        
        try {
            console.log('🔍 Récupération des données pour:', symbol);
            
            const priceData = await fetchFromYahooFinance(symbol, period);
            
            let detailedInfo = {};
            try {
                detailedInfo = await fetchDetailedInfo(symbol);
            } catch (crumbError) {
                console.warn("⚠️ Données fondamentales limitées", crumbError.message);
            }
            
            currentStockData = { ...priceData, ...detailedInfo };
            technicalIndicators = calculateTechnicalIndicators(priceData);
            
            displayResults(currentStockData, symbol);
            showNotification('Données chargées avec succès !', 'success');
            
        } catch (error) {
            console.error('❌ Erreur:', error);
            showError('Échec de récupération pour ' + symbol + '. ' + error.message);
        } finally {
            showLoading(false);
        }
    }
    
    // ========== RÉCUPÉRATION DES DONNÉES DE PRIX ==========
    async function fetchFromYahooFinance(symbol, period) {
        const periods = {
            '1D': { range: '1d', interval: '5m' },
            '5D': { range: '5d', interval: '15m' },
            '1M': { range: '1mo', interval: '1d' },
            '3M': { range: '3mo', interval: '1d' },
            '6M': { range: '6mo', interval: '1d' },
            '1Y': { range: '1y', interval: '1d' },
            '5Y': { range: '5y', interval: '1wk' }
        };
        
        const { range, interval } = periods[period] || periods['1M'];
        const yahooUrl = `${YAHOO_FINANCE_BASE}${symbol}?range=${range}&interval=${interval}`;
        
        console.log('📡 Requête Yahoo Finance:', yahooUrl);
        
        // Utiliser la fonction avec retry
        const response = await fetchWithProxy(yahooUrl);
        
        const json = await response.json();
        console.log('📊 Réponse brute:', json);
        
        if (!json.chart || !json.chart.result || json.chart.result.length === 0) {
            throw new Error('Symbole invalide ou données indisponibles');
        }
        
        if (json.chart.error) {
            throw new Error(json.chart.error.description || 'Erreur API Yahoo Finance');
        }
        
        const result = json.chart.result[0];
        const meta = result.meta;
        const quote = result.indicators.quote[0];
        const timestamps = result.timestamp;
        
        if (!timestamps || timestamps.length === 0) {
            throw new Error('Aucune donnée historique disponible');
        }
        
        // Nettoyage des données
        const cleanData = {
            open: [],
            high: [],
            low: [],
            close: [],
            volume: []
        };
        
        const cleanTimestamps = [];
        
        for (let i = 0; i < timestamps.length; i++) {
            if (timestamps[i] !== null && quote.close[i] !== null && quote.close[i] !== undefined) {
                cleanTimestamps.push(timestamps[i]);
                cleanData.open.push(quote.open[i] || quote.close[i]);
                cleanData.high.push(quote.high[i] || quote.close[i]);
                cleanData.low.push(quote.low[i] || quote.close[i]);
                cleanData.close.push(quote.close[i]);
                cleanData.volume.push(quote.volume[i] || 0);
            }
        }
        
        if (cleanData.close.length === 0) {
            throw new Error('Aucune donnée valide après nettoyage');
        }
        
        const currentPrice = meta.regularMarketPrice || cleanData.close[cleanData.close.length - 1];
        const previousClose = meta.chartPreviousClose || cleanData.close[cleanData.close.length - 2] || currentPrice;
        
        return {
            symbol: meta.symbol,
            currency: meta.currency || 'USD',
            currentPrice: currentPrice,
            previousClose: previousClose,
            change: currentPrice - previousClose,
            changePercent: ((currentPrice - previousClose) / previousClose * 100),
            dayHigh: meta.regularMarketDayHigh || Math.max(...cleanData.high),
            dayLow: meta.regularMarketDayLow || Math.min(...cleanData.low),
            volume: cleanData.volume[cleanData.volume.length - 1] || 0,
            timestamps: cleanTimestamps,
            prices: cleanData,
            exchangeName: meta.exchangeName || 'N/A',
            marketState: meta.marketState || 'REGULAR',
            fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh || 'N/A',
            fiftyTwoWeekLow: meta.fiftyTwoWeekLow || 'N/A'
        };
    }
    
    // ========== RÉCUPÉRATION DES DONNÉES DÉTAILLÉES ==========
    async function fetchDetailedInfo(symbol) {
        const modules = [
            'summaryDetail',
            'financialData',
            'defaultKeyStatistics',
            'assetProfile'
        ].join(',');
        
        const yahooUrl = `${YAHOO_QUOTE_BASE}${symbol}?modules=${modules}`;
        
        console.log('📡 Récupération infos détaillées:', symbol);
        
        const response = await fetchWithProxy(yahooUrl);
        
        const json = await response.json();
        console.log('📋 Infos détaillées brutes:', json);
        
        if (json.quoteSummary?.error?.description === 'Invalid Crumb') {
            throw new Error('Erreur de sécurité Yahoo Finance: Invalid Crumb');
        }
        
        if (!json.quoteSummary || !json.quoteSummary.result || json.quoteSummary.result.length === 0) {
            console.warn('⚠️ Aucune info détaillée disponible');
            return {};
        }
        
        const result = json.quoteSummary.result[0];
        
        const profile = result.assetProfile || {};
        const summaryDetail = result.summaryDetail || {};
        const keyStats = result.defaultKeyStatistics || {};
        const financialData = result.financialData || {};
        
        const getValue = (obj, prop, fallback = 'N/A') => {
            if (obj && obj[prop]) {
                if (obj[prop].raw !== undefined) return obj[prop].raw;
                if (obj[prop].fmt !== undefined && obj[prop].fmt !== null) {
                    const parsed = parseFloat(obj[prop].fmt.replace(/,/g, ''));
                    return isNaN(parsed) ? fallback : parsed;
                }
            }
            return fallback;
        };

        const getStringValue = (obj, prop, fallback = 'N/A') => {
            return (obj && obj[prop] !== null) ? obj[prop] : fallback;
        };
        
        return {
            companyName: getStringValue(profile, 'longName') || getStringValue(profile, 'shortName') || symbol,
            sector: getStringValue(profile, 'sector'),
            industry: getStringValue(profile, 'industry'),
            website: getStringValue(profile, 'website'),
            country: getStringValue(profile, 'country'),
            employees: getValue(profile, 'fullTimeEmployees'),
            description: getStringValue(profile, 'longBusinessSummary') || 'Pas de description disponible',
            
            marketCap: getValue(summaryDetail, 'marketCap') || getValue(keyStats, 'enterpriseValue'),
            peRatio: getValue(summaryDetail, 'trailingPE') || getValue(keyStats, 'trailingPE'),
            forwardPE: getValue(summaryDetail, 'forwardPE'),
            eps: getValue(keyStats, 'trailingEps'),
            beta: getValue(keyStats, 'beta') || getValue(summaryDetail, 'beta'),
            
            dividendRate: getValue(summaryDetail, 'dividendRate'),
            dividendYield: getValue(summaryDetail, 'dividendYield'),
            
            profitMargins: getValue(financialData, 'profitMargins'),
            returnOnEquity: getValue(financialData, 'returnOnEquity'),
            
            debtToEquity: getValue(financialData, 'debtToEquity'),
            currentRatio: getValue(financialData, 'currentRatio')
        };
    }
    
    // ========== INDICATEURS TECHNIQUES ==========
    function calculateTechnicalIndicators(data) {
        const prices = data.prices.close;
        const volumes = data.prices.volume;
        const highs = data.prices.high;
        const lows = data.prices.low;
        
        // ✅ CORRECTION : Condition moins stricte (20 au lieu de 200)
        if (prices.length < 20) {
            console.warn('⚠️ Pas assez de données pour les indicateurs techniques (minimum 20 points)');
            return {
                sma20: null,
                sma50: null,
                rsi: null
            };
        }

        return {
            sma20: calculateSMA(prices, 20),
            sma50: prices.length >= 50 ? calculateSMA(prices, 50) : null,
            sma200: prices.length >= 200 ? calculateSMA(prices, 200) : null,
            rsi: prices.length >= 15 ? calculateRSI(prices, 14) : null
        };
    }
    
    function calculateSMA(data, period) {
        if (!data || data.length < period) return null;
        const slice = data.slice(-period);
        const sum = slice.reduce((a, b) => a + b, 0);
        return sum / period;
    }
    
    function calculateRSI(prices, period = 14) {
        if (!prices || prices.length < period + 1) return null;
        
        let avgGain = 0;
        let avgLoss = 0;
        
        for (let i = 1; i <= period; i++) {
            const change = prices[i] - prices[i - 1];
            if (change > 0) avgGain += change;
            else avgLoss -= change;
        }
        avgGain /= period;
        avgLoss /= period;

        for (let i = period + 1; i < prices.length; i++) {
            const change = prices[i] - prices[i - 1];
            let currentGain = 0;
            let currentLoss = 0;
            if (change > 0) currentGain = change;
            else currentLoss = -change;

            avgGain = (avgGain * (period - 1) + currentGain) / period;
            avgLoss = (avgLoss * (period - 1) + currentLoss) / period;
        }
        
        if (avgLoss === 0) return 100;
        const rs = avgGain / avgLoss;
        return 100 - (100 / (1 + rs));
    }
    
    // ========== AFFICHAGE DES RÉSULTATS ==========
    function displayResults(data, symbol) {
        const resultsSection = document.getElementById('resultsSection');
        resultsSection.classList.remove('hidden');
        resultsSection.scrollIntoView({ behavior: 'smooth' });
        
        displayStockInfo(data);
        displayCompanyInfo(data);
        displayFinancialMetrics(data);
        displayTechnicalIndicators();
        
        createPriceChart(data);
        createVolumeChart(data);
    }
    
    // ========== AFFICHAGE INFO BOURSIÈRE ==========
    function displayStockInfo(data) {
        const container = document.getElementById('stockInfo');
        const isPositive = data.change >= 0;
        
        const html = `
            <div class='info-card'>
                <div class='label'>Symbole</div>
                <div class='value'>${data.symbol}</div>
            </div>
            <div class='info-card ${isPositive ? 'positive' : 'negative'}'>
                <div class='label'>Prix Actuel</div>
                <div class='value'>${formatNumber(data.currentPrice, 2)} ${data.currency}</div>
            </div>
            <div class='info-card ${isPositive ? 'positive' : 'negative'}'>
                <div class='label'>Variation</div>
                <div class='value'>${isPositive ? '+' : ''}${formatNumber(data.change, 2)} (${formatNumber(data.changePercent, 2)}%)</div>
            </div>
            <div class='info-card'>
                <div class='label'>Plus Haut</div>
                <div class='value'>${formatNumber(data.dayHigh, 2)}</div>
            </div>
            <div class='info-card'>
                <div class='label'>Plus Bas</div>
                <div class='value'>${formatNumber(data.dayLow, 2)}</div>
            </div>
            <div class='info-card'>
                <div class='label'>Volume</div>
                <div class='value'>${formatNumber(data.volume)}</div>
            </div>
        `;
        
        container.innerHTML = html;
    }
    
    // ========== AFFICHAGE INFO ENTREPRISE ==========
    function displayCompanyInfo(data) {
        let container = document.getElementById('companyInfo');
        const resultsSection = document.getElementById('resultsSection');
        const stockInfoDiv = document.getElementById('stockInfo');
        
        if (!container) {
            container = document.createElement('div');
            container.id = 'companyInfo';
            container.className = 'section';
            resultsSection.insertBefore(container, stockInfoDiv.nextSibling);
        }

        const hasCompanyData = (data.companyName && data.companyName !== data.symbol && data.companyName !== 'N/A') || 
                                (data.sector && data.sector !== 'N/A');

        if (!hasCompanyData) {
            container.innerHTML = '';
            container.classList.add('hidden');
            return;
        } else {
            container.classList.remove('hidden');
        }
        
        const html = `
            <h2 class='section-title'>🏢 Informations sur l'Entreprise</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                <div class='info-item'>
                    <strong>Entreprise:</strong> ${data.companyName}
                </div>
                <div class='info-item'>
                    <strong>Secteur:</strong> ${data.sector}
                </div>
                <div class='info-item'>
                    <strong>Industrie:</strong> ${data.industry}
                </div>
                <div class='info-item'>
                    <strong>Pays:</strong> ${data.country}
                </div>
            </div>
        `;
        
        container.innerHTML = html;
    }
    
    // ========== AFFICHAGE MÉTRIQUES FINANCIÈRES ==========
    function displayFinancialMetrics(data) {
        let container = document.getElementById('financialMetrics');
        const resultsSection = document.getElementById('resultsSection');
        const companyInfoDiv = document.getElementById('companyInfo');
        const stockInfoDiv = document.getElementById('stockInfo'); // ✅ CORRECTION : Variable définie
        
        if (!container) {
            container = document.createElement('div');
            container.id = 'financialMetrics';
            container.className = 'section';
            if (companyInfoDiv && !companyInfoDiv.classList.contains('hidden')) {
                resultsSection.insertBefore(container, companyInfoDiv.nextSibling);
            } else {
                resultsSection.insertBefore(container, stockInfoDiv.nextSibling);
            }
        }

        const allMetricsAreNA = [
            data.marketCap, data.peRatio, data.forwardPE, data.eps,
            data.beta, data.dividendYield
        ].every(val => val === 'N/A' || val === null || val === undefined || isNaN(val));

        if (allMetricsAreNA) {
            container.innerHTML = '<p class="info-message">Métriques financières non disponibles (limitation API).</p>';
            container.classList.remove('hidden');
            return;
        } else {
            container.classList.remove('hidden');
        }
        
        const html = `
            <h2 class='section-title'>💰 Métriques Financières</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
                <div class='metric-card'>
                    <div class='metric-label'>Capitalisation</div>
                    <div class='metric-value'>${formatLargeNumber(data.marketCap)}</div>
                </div>
                <div class='metric-card'>
                    <div class='metric-label'>P/E Ratio</div>
                    <div class='metric-value'>${formatNumber(data.peRatio, 2)}</div>
                </div>
                <div class='metric-card'>
                    <div class='metric-label'>Forward P/E</div>
                    <div class='metric-value'>${formatNumber(data.forwardPE, 2)}</div>
                </div>
                <div class='metric-card'>
                    <div class='metric-label'>EPS</div>
                    <div class='metric-value'>${formatNumber(data.eps, 2)}</div>
                </div>
                <div class='metric-card'>
                    <div class='metric-label'>Beta</div>
                    <div class='metric-value'>${formatNumber(data.beta, 2)}</div>
                </div>
                <div class='metric-card'>
                    <div class='metric-label'>Rendement Dividende</div>
                    <div class='metric-value'>${formatPercent(data.dividendYield)}</div>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
    }
    
    // ========== AFFICHAGE INDICATEURS TECHNIQUES ==========
    function displayTechnicalIndicators() {
        let container = document.getElementById('technicalIndicatorsSection');
        const resultsSection = document.getElementById('resultsSection');
        const financialMetricsDiv = document.getElementById('financialMetrics');
        
        if (!container) {
            container = document.createElement('div');
            container.id = 'technicalIndicatorsSection';
            container.className = 'section';
            if (financialMetricsDiv) {
                resultsSection.insertBefore(container, financialMetricsDiv.nextSibling);
            } else {
                resultsSection.appendChild(container);
            }
        }

        if (!technicalIndicators || !currentStockData) {
            container.innerHTML = '<p class="info-message">Indicateurs techniques non calculés (données insuffisantes).</p>';
            container.classList.remove('hidden');
            return;
        }
        
        const rsi = technicalIndicators.rsi;
        const rsiSignal = rsi !== null ? (rsi < 30 ? '🟢 Survendu' : rsi > 70 ? '🔴 Suracheté' : '🟡 Neutre') : 'N/A';
        
        const html = `
            <h2 class='section-title'>📈 Indicateurs Techniques</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                ${technicalIndicators.rsi !== null ? `<div class='metric-card'>
                    <div class='metric-label'>RSI (14)</div>
                    <div class='metric-value'>${formatNumber(rsi, 2)}</div>
                    <div class='metric-signal'>${rsiSignal}</div>
                </div>` : ''}
                ${technicalIndicators.sma20 !== null ? `<div class='metric-card'>
                    <div class='metric-label'>SMA 20</div>
                    <div class='metric-value'>${formatNumber(technicalIndicators.sma20, 2)}</div>
                </div>` : ''}
                ${technicalIndicators.sma50 !== null ? `<div class='metric-card'>
                    <div class='metric-label'>SMA 50</div>
                    <div class='metric-value'>${formatNumber(technicalIndicators.sma50, 2)}</div>
                </div>` : ''}
            </div>
        `;
        
        container.innerHTML = html;
    }
    
    // ========== GRAPHIQUE DES PRIX ==========
    function createPriceChart(data) {
        const prices = data.timestamps.map((timestamp, i) => [
            timestamp * 1000,
            data.prices.close[i]
        ]);
        
        Highcharts.chart('chartPrice', {
            chart: {
                type: 'area',
                backgroundColor: 'transparent',
                zoomType: 'x'
            },
            title: {
                text: data.symbol + ' - Évolution du Prix',
                style: { color: '#2649B2', fontSize: '1.3em', fontWeight: 'bold' }
            },
            xAxis: {
                type: 'datetime',
                crosshair: true
            },
            yAxis: {
                title: {
                    text: 'Prix (' + data.currency + ')',
                    style: { color: '#2649B2', fontWeight: 'bold' }
                }
            },
            tooltip: {
                shared: true,
                valueDecimals: 2,
                valueSuffix: ' ' + data.currency,
                xDateFormat: '%Y-%m-%d %H:%M'
            },
            series: [{
                name: data.symbol,
                data: prices,
                color: '#2649B2',
                fillColor: {
                    linearGradient: [0, 0, 0, 300],
                    stops: [
                        [0, 'rgba(38,73,178,0.5)'],
                        [1, 'rgba(38,73,178,0.05)']
                    ]
                },
                lineWidth: 2
            }],
            plotOptions: {
                area: {
                    marker: { enabled: false }
                }
            },
            credits: { enabled: false }
        });
    }
    
    // ========== GRAPHIQUE DES VOLUMES ==========
    function createVolumeChart(data) {
        const volumes = data.timestamps.map((timestamp, i) => [
            timestamp * 1000,
            data.prices.volume[i] || 0
        ]);
        
        Highcharts.chart('chartVolume', {
            chart: {
                type: 'column',
                backgroundColor: 'transparent'
            },
            title: {
                text: 'Volume de Transactions',
                style: { color: '#9D5CE6', fontSize: '1.2em', fontWeight: 'bold' }
            },
            xAxis: {
                type: 'datetime',
                crosshair: true
            },
            yAxis: {
                title: {
                    text: 'Volume',
                    style: { color: '#9D5CE6', fontWeight: 'bold' }
                }
            },
            tooltip: {
                valueDecimals: 0,
                xDateFormat: '%Y-%m-%d'
            },
            series: [{
                name: 'Volume',
                data: volumes,
                color: '#9D5CE6'
            }],
            legend: { enabled: false },
            credits: { enabled: false }
        });
    }
    
    // ========== UTILITAIRES DE FORMATAGE ==========
    function formatNumber(num, decimals = 0) {
        if (num === 'N/A' || num === null || num === undefined || isNaN(num)) return 'N/A';
        return Number(num).toLocaleString('fr-FR', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    }
    
    function formatLargeNumber(num) {
        if (num === 'N/A' || num === null || num === undefined || isNaN(num)) return 'N/A';
        
        const absNum = Math.abs(num);
        let formatted = '';
        
        if (absNum >= 1e12) formatted = (num / 1e12).toFixed(2) + 'T';
        else if (absNum >= 1e9) formatted = (num / 1e9).toFixed(2) + 'B';
        else if (absNum >= 1e6) formatted = (num / 1e6).toFixed(2) + 'M';
        else if (absNum >= 1e3) formatted = (num / 1e3).toFixed(2) + 'K';
        else formatted = num.toFixed(2);
        
        return formatted.replace('.', ',');
    }
    
    function formatPercent(num) {
        if (num === 'N/A' || num === null || num === undefined || isNaN(num)) return 'N/A';
        return (num * 100).toFixed(2).replace('.', ',') + '%';
    }

    function showNotification(message, type = 'info') {
        console.log(`✅ ${message}`);
    }
    
    // ========== GESTION DE L'AFFICHAGE ==========
    function loadQuickStock(symbol) {
        document.getElementById('stockSymbol').value = symbol;
        fetchStockData();
    }
    
    function showLoading(show) {
        const loader = document.getElementById('loadingIndicator');
        if (loader) {
            loader.classList.toggle('hidden', !show);
        }
    }
    
    function hideResults() {
        const results = document.getElementById('resultsSection');
        if (results) results.classList.add('hidden');
        
        // Détruire les graphiques existants
        Highcharts.charts.forEach(chart => {
            if (chart && chart.renderTo) {
                const chartId = chart.renderTo.id;
                if (['chartPrice', 'chartVolume'].includes(chartId)) {
                    chart.destroy();
                }
            }
        });
    }
    
    function showError(message) {
        const errorSection = document.getElementById('errorSection');
        const errorMessage = document.getElementById('errorMessage');
        if (errorSection && errorMessage) {
            errorMessage.textContent = message;
            errorSection.classList.remove('hidden');
            errorSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    function hideError() {
        const errorSection = document.getElementById('errorSection');
        if (errorSection) errorSection.classList.add('hidden');
    }
    
    // ========== EXPORTS ==========
    return {
        fetchStockData,
        loadQuickStock
    };
})();