/* ==============================================
   MARKET-DATA.JS - Version Simplifiée
   ============================================== */

const MarketData = (function() {
    'use strict';
    
    const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
    const YAHOO_FINANCE_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart/';
    
    let currentStockData = null;
    let technicalIndicators = null;
    
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
            console.log('🔍 Recherche des données pour:', symbol);
            const priceData = await fetchFromYahooFinance(symbol, period);
            
            currentStockData = priceData;
            technicalIndicators = calculateTechnicalIndicators(priceData);
            
            displayResults(currentStockData, symbol);
            showNotification('Données chargées avec succès !', 'success');
            
        } catch (error) {
            console.error('❌ Erreur:', error);
            showError(`Impossible de récupérer les données pour ${symbol}. ${error.message}`);
        } finally {
            showLoading(false);
        }
    }
    
    // ========== RÉCUPÉRATION DES DONNÉES ==========
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
        const proxyUrl = CORS_PROXY + encodeURIComponent(yahooUrl);
        
        console.log('📡 URL:', proxyUrl);
        
        const response = await fetch(proxyUrl);
        
        if (!response.ok) {
            throw new Error(`Erreur réseau (${response.status})`);
        }
        
        const json = await response.json();
        console.log('📊 Réponse API:', json);
        
        if (!json.chart?.result?.[0]) {
            throw new Error('Symbole invalide ou données indisponibles');
        }
        
        if (json.chart.error) {
            throw new Error(json.chart.error.description || 'Erreur API Yahoo Finance');
        }
        
        const result = json.chart.result[0];
        const meta = result.meta;
        const quote = result.indicators.quote[0];
        const timestamps = result.timestamp;
        
        // Nettoyage des données
        const cleanData = {
            timestamps: [],
            open: [],
            high: [],
            low: [],
            close: [],
            volume: []
        };
        
        for (let i = 0; i < timestamps.length; i++) {
            if (timestamps[i] && quote.close[i] != null) {
                cleanData.timestamps.push(timestamps[i]);
                cleanData.open.push(quote.open[i] || quote.close[i]);
                cleanData.high.push(quote.high[i] || quote.close[i]);
                cleanData.low.push(quote.low[i] || quote.close[i]);
                cleanData.close.push(quote.close[i]);
                cleanData.volume.push(quote.volume[i] || 0);
            }
        }
        
        if (cleanData.close.length === 0) {
            throw new Error('Aucune donnée valide trouvée');
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
            timestamps: cleanData.timestamps,
            prices: {
                open: cleanData.open,
                high: cleanData.high,
                low: cleanData.low,
                close: cleanData.close,
                volume: cleanData.volume
            },
            exchangeName: meta.exchangeName || 'N/A',
            marketState: meta.marketState || 'REGULAR',
            fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh || 'N/A',
            fiftyTwoWeekLow: meta.fiftyTwoWeekLow || 'N/A'
        };
    }
    
    // ========== INDICATEURS TECHNIQUES ==========
    function calculateTechnicalIndicators(data) {
        const prices = data.prices.close;
        
        if (prices.length < 20) {
            return { rsi: null, sma20: null, sma50: null };
        }
        
        return {
            sma20: calculateSMA(prices, 20),
            sma50: prices.length >= 50 ? calculateSMA(prices, 50) : null,
            rsi: prices.length >= 15 ? calculateRSI(prices, 14) : null
        };
    }
    
    function calculateSMA(data, period) {
        if (data.length < period) return null;
        const slice = data.slice(-period);
        return slice.reduce((a, b) => a + b, 0) / period;
    }
    
    function calculateRSI(prices, period = 14) {
        if (prices.length < period + 1) return null;
        
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
            avgGain = (avgGain * (period - 1) + (change > 0 ? change : 0)) / period;
            avgLoss = (avgLoss * (period - 1) + (change < 0 ? -change : 0)) / period;
        }
        
        if (avgLoss === 0) return 100;
        const rs = avgGain / avgLoss;
        return 100 - (100 / (1 + rs));
    }
    
    // ========== AFFICHAGE ==========
    function displayResults(data, symbol) {
        const resultsSection = document.getElementById('resultsSection');
        resultsSection.classList.remove('hidden');
        resultsSection.scrollIntoView({ behavior: 'smooth' });
        
        displayStockInfo(data);
        displayTechnicalIndicators();
        createPriceChart(data);
        createVolumeChart(data);
    }
    
    function displayStockInfo(data) {
        const container = document.getElementById('stockInfo');
        const isPositive = data.change >= 0;
        
        container.innerHTML = `
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
                <div class='label'>Plus Haut du Jour</div>
                <div class='value'>${formatNumber(data.dayHigh, 2)}</div>
            </div>
            <div class='info-card'>
                <div class='label'>Plus Bas du Jour</div>
                <div class='value'>${formatNumber(data.dayLow, 2)}</div>
            </div>
            <div class='info-card'>
                <div class='label'>Volume</div>
                <div class='value'>${formatNumber(data.volume)}</div>
            </div>
        `;
    }
    
    function displayTechnicalIndicators() {
        let container = document.getElementById('technicalIndicatorsSection');
        
        if (!container) {
            container = document.createElement('div');
            container.id = 'technicalIndicatorsSection';
            container.className = 'section';
            document.getElementById('resultsSection').appendChild(container);
        }
        
        if (!technicalIndicators || !currentStockData) {
            container.innerHTML = '<p class="info-message">Indicateurs techniques non disponibles.</p>';
            return;
        }
        
        const rsi = technicalIndicators.rsi;
        const rsiSignal = rsi !== null ? (rsi < 30 ? '🟢 Survendu' : rsi > 70 ? '🔴 Suracheté' : '🟡 Neutre') : 'N/A';
        
        container.innerHTML = `
            <h2 class='section-title'>📈 Indicateurs Techniques</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                ${technicalIndicators.rsi !== null ? `
                <div class='metric-card'>
                    <div class='metric-label'>RSI (14)</div>
                    <div class='metric-value'>${formatNumber(rsi, 2)}</div>
                    <div class='metric-signal'>${rsiSignal}</div>
                </div>` : ''}
                ${technicalIndicators.sma20 !== null ? `
                <div class='metric-card'>
                    <div class='metric-label'>SMA 20</div>
                    <div class='metric-value'>${formatNumber(technicalIndicators.sma20, 2)}</div>
                </div>` : ''}
                ${technicalIndicators.sma50 !== null ? `
                <div class='metric-card'>
                    <div class='metric-label'>SMA 50</div>
                    <div class='metric-value'>${formatNumber(technicalIndicators.sma50, 2)}</div>
                </div>` : ''}
            </div>
        `;
    }
    
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
                valueSuffix: ' ' + data.currency
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
                }
            }],
            credits: { enabled: false }
        });
    }
    
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
                type: 'datetime'
            },
            yAxis: {
                title: {
                    text: 'Volume'
                }
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
    
    // ========== UTILITAIRES ==========
    function formatNumber(num, decimals = 0) {
        if (num === 'N/A' || num == null || isNaN(num)) return 'N/A';
        return Number(num).toLocaleString('fr-FR', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    }
    
    function showNotification(message, type = 'info') {
        console.log(`✅ ${message}`);
    }
    
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
    }
    
    function showError(message) {
        const errorSection = document.getElementById('errorSection');
        const errorMessage = document.getElementById('errorMessage');
        if (errorSection && errorMessage) {
            errorMessage.textContent = message;
            errorSection.classList.remove('hidden');
        }
    }
    
    function hideError() {
        const errorSection = document.getElementById('errorSection');
        if (errorSection) errorSection.classList.add('hidden');
    }
    
    return {
        fetchStockData,
        loadQuickStock
    };
})();