/* ==============================================
   MARKET-DATA.JS - Récupération données de marché
   VERSION CORRIGÉE AVEC PROXY CORS
   ============================================== */

const MarketData = (function() {
    'use strict';
    
    // ========== CONFIGURATION API ==========
    
    // Proxy CORS pour contourner les restrictions Yahoo Finance
    const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
    const YAHOO_FINANCE_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart/';
    
    // ========== VARIABLES PRIVÉES ==========
    let currentStockData = null;
    
    // ========== FONCTIONS PRINCIPALES ==========
    
    /**
     * Récupère les données d'une action
     */
    async function fetchStockData() {
        const symbol = document.getElementById('stockSymbol').value.trim().toUpperCase();
        const period = document.getElementById('timePeriod').value;
        
        if (!symbol) {
            showError('Please enter a stock symbol!');
            return;
        }
        
        showLoading(true);
        hideError();
        hideResults();
        
        try {
            const data = await fetchFromYahooFinance(symbol, period);
            currentStockData = data;
            displayResults(data, symbol);
            window.FinanceDashboard.showNotification('Stock data loaded successfully!', 'success');
        } catch (error) {
            console.error('Error fetching stock data:', error);
            showError('Failed to fetch data for ' + symbol + '. ' + error.message);
        } finally {
            showLoading(false);
        }
    }
    
    /**
     * Récupération depuis Yahoo Finance (avec proxy CORS)
     */
    async function fetchFromYahooFinance(symbol, period) {
        // Calculer les périodes
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
        
        // Construire l'URL Yahoo Finance
        const yahooUrl = `${YAHOO_FINANCE_BASE}${symbol}?range=${range}&interval=${interval}`;
        
        // Utiliser le proxy CORS
        const proxyUrl = CORS_PROXY + encodeURIComponent(yahooUrl);
        
        console.log('Fetching:', symbol, 'Period:', period);
        console.log('Proxy URL:', proxyUrl);
        
        try {
            const response = await fetch(proxyUrl);
            
            if (!response.ok) {
                throw new Error('Network response was not ok (Status: ' + response.status + ')');
            }
            
            const json = await response.json();
            
            console.log('Raw response:', json);
            
            // Vérifier la structure des données
            if (!json.chart || !json.chart.result || json.chart.result.length === 0) {
                throw new Error('Invalid symbol or no data available');
            }
            
            if (json.chart.error) {
                throw new Error(json.chart.error.description || 'Yahoo Finance API error');
            }
            
            const result = json.chart.result[0];
            const meta = result.meta;
            const quote = result.indicators.quote[0];
            const timestamps = result.timestamp;
            
            // Vérifier que nous avons des données
            if (!timestamps || timestamps.length === 0) {
                throw new Error('No historical data available for this symbol');
            }
            
            // Nettoyer les données (enlever les valeurs null)
            const cleanData = {
                open: [],
                high: [],
                low: [],
                close: [],
                volume: []
            };
            
            const cleanTimestamps = [];
            
            for (let i = 0; i < timestamps.length; i++) {
                if (quote.close[i] !== null && quote.close[i] !== undefined) {
                    cleanTimestamps.push(timestamps[i]);
                    cleanData.open.push(quote.open[i] || quote.close[i]);
                    cleanData.high.push(quote.high[i] || quote.close[i]);
                    cleanData.low.push(quote.low[i] || quote.close[i]);
                    cleanData.close.push(quote.close[i]);
                    cleanData.volume.push(quote.volume[i] || 0);
                }
            }
            
            if (cleanData.close.length === 0) {
                throw new Error('No valid price data found');
            }
            
            // Prix actuel et précédent
            const currentPrice = meta.regularMarketPrice || cleanData.close[cleanData.close.length - 1];
            const previousClose = meta.previousClose || cleanData.close[cleanData.close.length - 2] || currentPrice;
            
            // Formater les données
            const formattedData = {
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
                prices: cleanData
            };
            
            console.log('Formatted data:', formattedData);
            
            return formattedData;
            
        } catch (error) {
            console.error('Fetch error:', error);
            
            // Messages d'erreur plus clairs
            if (error.message.includes('Invalid symbol')) {
                throw new Error('Stock symbol not found. Please verify the ticker symbol.');
            } else if (error.message.includes('Network')) {
                throw new Error('Network error. Please check your internet connection.');
            } else {
                throw new Error(error.message || 'Unable to fetch stock data');
            }
        }
    }
    
    /**
     * Affiche les résultats
     */
    function displayResults(data, symbol) {
        const resultsSection = document.getElementById('resultsSection');
        resultsSection.classList.remove('hidden');
        resultsSection.scrollIntoView({ behavior: 'smooth' });
        
        displayStockInfo(data);
        createPriceChart(data);
        createVolumeChart(data);
        createStatsTable(data);
    }
    
    /**
     * Affiche les informations de l'action
     */
    function displayStockInfo(data) {
        const container = document.getElementById('stockInfo');
        const isPositive = data.change >= 0;
        
        const html = `
            <div class='info-card'>
                <div class='label'>Symbol</div>
                <div class='value'>${data.symbol}</div>
            </div>
            <div class='info-card ${isPositive ? 'positive' : 'negative'}'>
                <div class='label'>Current Price</div>
                <div class='value'>${data.currentPrice.toFixed(2)} ${data.currency}</div>
            </div>
            <div class='info-card ${isPositive ? 'positive' : 'negative'}'>
                <div class='label'>Change</div>
                <div class='value'>${isPositive ? '+' : ''}${data.change.toFixed(2)} (${data.changePercent.toFixed(2)}%)</div>
            </div>
            <div class='info-card'>
                <div class='label'>Day High</div>
                <div class='value'>${data.dayHigh.toFixed(2)}</div>
            </div>
            <div class='info-card'>
                <div class='label'>Day Low</div>
                <div class='value'>${data.dayLow.toFixed(2)}</div>
            </div>
            <div class='info-card'>
                <div class='label'>Volume</div>
                <div class='value'>${data.volume.toLocaleString()}</div>
            </div>
        `;
        
        container.innerHTML = html;
    }
    
    /**
     * Crée le graphique de prix
     */
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
                text: data.symbol + ' - Price Evolution',
                style: { color: '#2649B2', fontSize: '1.3em', fontWeight: 'bold' }
            },
            xAxis: {
                type: 'datetime',
                crosshair: true
            },
            yAxis: {
                title: {
                    text: 'Price (' + data.currency + ')',
                    style: { color: '#2649B2', fontWeight: 'bold' }
                }
            },
            tooltip: {
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
    
    /**
     * Crée le graphique de volume
     */
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
                text: 'Trading Volume',
                style: { color: '#6C3483', fontSize: '1.2em', fontWeight: 'bold' }
            },
            xAxis: {
                type: 'datetime'
            },
            yAxis: {
                title: {
                    text: 'Volume',
                    style: { color: '#6C3483', fontWeight: 'bold' }
                }
            },
            tooltip: {
                valueDecimals: 0,
                xDateFormat: '%Y-%m-%d'
            },
            series: [{
                name: 'Volume',
                data: volumes,
                color: '#8E44AD',
                borderRadius: '25%'
            }],
            legend: { enabled: false },
            credits: { enabled: false }
        });
    }
    
    /**
     * Crée le tableau de statistiques
     */
    function createStatsTable(data) {
        const prices = data.prices.close;
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
        const volatility = calculateVolatility(prices);
        
        const html = `
            <table>
                <thead>
                    <tr>
                        <th>Metric</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>Period Min</strong></td>
                        <td>${min.toFixed(2)} ${data.currency}</td>
                    </tr>
                    <tr>
                        <td><strong>Period Max</strong></td>
                        <td>${max.toFixed(2)} ${data.currency}</td>
                    </tr>
                    <tr>
                        <td><strong>Period Average</strong></td>
                        <td>${avg.toFixed(2)} ${data.currency}</td>
                    </tr>
                    <tr>
                        <td><strong>Volatility (Std Dev)</strong></td>
                        <td>${volatility.toFixed(2)}%</td>
                    </tr>
                    <tr>
                        <td><strong>Total Return</strong></td>
                        <td>${((prices[prices.length - 1] - prices[0]) / prices[0] * 100).toFixed(2)}%</td>
                    </tr>
                    <tr>
                        <td><strong>Data Points</strong></td>
                        <td>${prices.length} days</td>
                    </tr>
                </tbody>
            </table>
        `;
        
        document.getElementById('statsTable').innerHTML = html;
    }
    
    /**
     * Calcule la volatilité
     */
    function calculateVolatility(prices) {
        const returns = [];
        for (let i = 1; i < prices.length; i++) {
            returns.push((prices[i] - prices[i-1]) / prices[i-1]);
        }
        const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
        const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
        return Math.sqrt(variance) * 100;
    }
    
    /**
     * Charge un stock prédéfini
     */
    function loadQuickStock(symbol) {
        document.getElementById('stockSymbol').value = symbol;
        fetchStockData();
    }
    
    /**
     * Gestion de l'affichage
     */
    function showLoading(show) {
        const loader = document.getElementById('loadingIndicator');
        if (loader) {
            if (show) {
                loader.classList.remove('hidden');
            } else {
                loader.classList.add('hidden');
            }
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

// Optionnel : Charger une action au démarrage
// window.addEventListener('DOMContentLoaded', function() {
//     MarketData.loadQuickStock('AAPL');
// });