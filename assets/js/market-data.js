/* ==============================================
   MARKET-DATA.JS - Récupération données de marché
   ============================================== */

const MarketData = (function() {
    'use strict';
    
    // ========== CONFIGURATION API ==========
    
    // Option 1 : Alpha Vantage (Officiel - Limité à 25 requêtes/jour)
    const ALPHA_VANTAGE_API_KEY = 'VOTRE_CLE_ICI'; // Gratuit sur alphavantage.co
    
    // Option 2 : Yahoo Finance via Proxy (Illimité - Non officiel)
    const YAHOO_FINANCE_PROXY = 'https://query1.finance.yahoo.com/v8/finance/chart/';
    
    // Sélectionnez votre méthode préférée
    const USE_ALPHA_VANTAGE = false; // false = Yahoo Finance
    
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
            let data;
            
            if (USE_ALPHA_VANTAGE) {
                data = await fetchFromAlphaVantage(symbol, period);
            } else {
                data = await fetchFromYahooFinance(symbol, period);
            }
            
            currentStockData = data;
            displayResults(data, symbol);
            
        } catch (error) {
            console.error('Error fetching stock data:', error);
            showError('Failed to fetch data: ' + error.message);
        } finally {
            showLoading(false);
        }
    }
    
    /**
     * Récupération depuis Yahoo Finance
     */
    async function fetchFromYahooFinance(symbol, period) {
        // Calculer les timestamps
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
        
        const url = `${YAHOO_FINANCE_PROXY}${symbol}?range=${range}&interval=${interval}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Stock symbol not found or API error');
        }
        
        const json = await response.json();
        
        if (!json.chart || !json.chart.result || json.chart.result.length === 0) {
            throw new Error('No data available for this symbol');
        }
        
        const result = json.chart.result[0];
        const quote = result.indicators.quote[0];
        const timestamps = result.timestamp;
        
        // Formater les données
        const formattedData = {
            symbol: result.meta.symbol,
            currency: result.meta.currency,
            currentPrice: result.meta.regularMarketPrice,
            previousClose: result.meta.previousClose,
            change: result.meta.regularMarketPrice - result.meta.previousClose,
            changePercent: ((result.meta.regularMarketPrice - result.meta.previousClose) / result.meta.previousClose * 100),
            dayHigh: result.meta.regularMarketDayHigh,
            dayLow: result.meta.regularMarketDayLow,
            volume: quote.volume[quote.volume.length - 1],
            timestamps: timestamps,
            prices: {
                open: quote.open,
                high: quote.high,
                low: quote.low,
                close: quote.close,
                volume: quote.volume
            }
        };
        
        return formattedData;
    }
    
    /**
     * Récupération depuis Alpha Vantage
     */
    async function fetchFromAlphaVantage(symbol, period) {
        if (!ALPHA_VANTAGE_API_KEY || ALPHA_VANTAGE_API_KEY === 'VOTRE_CLE_ICI') {
            throw new Error('Please set your Alpha Vantage API key in market-data.js');
        }
        
        // Déterminer la fonction API selon la période
        let func = 'TIME_SERIES_DAILY';
        if (period === '1D') func = 'TIME_SERIES_INTRADAY&interval=5min';
        
        const url = `https://www.alphavantage.co/query?function=${func}&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}&outputsize=full`;
        
        const response = await fetch(url);
        const json = await response.json();
        
        if (json['Error Message']) {
            throw new Error('Invalid stock symbol');
        }
        
        if (json['Note']) {
            throw new Error('API call limit reached (25 calls/day). Try Yahoo Finance instead.');
        }
        
        // Parser les données (simplifié - à adapter selon vos besoins)
        const timeSeriesKey = Object.keys(json).find(key => key.includes('Time Series'));
        const timeSeries = json[timeSeriesKey];
        
        const dates = Object.keys(timeSeries).reverse();
        const prices = dates.map(date => parseFloat(timeSeries[date]['4. close']));
        const volumes = dates.map(date => parseInt(timeSeries[date]['5. volume']));
        
        const currentPrice = prices[prices.length - 1];
        const previousClose = prices[prices.length - 2];
        
        return {
            symbol: symbol,
            currency: 'USD',
            currentPrice: currentPrice,
            previousClose: previousClose,
            change: currentPrice - previousClose,
            changePercent: ((currentPrice - previousClose) / previousClose * 100),
            dayHigh: Math.max(...prices.slice(-1)),
            dayLow: Math.min(...prices.slice(-1)),
            volume: volumes[volumes.length - 1],
            timestamps: dates.map(d => new Date(d).getTime() / 1000),
            prices: {
                close: prices,
                volume: volumes
            }
        };
    }
    
    /**
     * Affiche les résultats
     */
    function displayResults(data, symbol) {
        const resultsSection = document.getElementById('resultsSection');
        resultsSection.classList.remove('hidden');
        resultsSection.scrollIntoView({ behavior: 'smooth' });
        
        // Afficher les cartes d'info
        displayStockInfo(data);
        
        // Créer les graphiques
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
                <div class='value'>${data.dayHigh ? data.dayHigh.toFixed(2) : 'N/A'}</div>
            </div>
            <div class='info-card'>
                <div class='label'>Day Low</div>
                <div class='value'>${data.dayLow ? data.dayLow.toFixed(2) : 'N/A'}</div>
            </div>
            <div class='info-card'>
                <div class='label'>Volume</div>
                <div class='value'>${data.volume ? data.volume.toLocaleString() : 'N/A'}</div>
            </div>
        `;
        
        container.innerHTML = html;
    }
    
    /**
     * Crée le graphique de prix
     */
    function createPriceChart(data) {
        const prices = data.prices.close.map((price, i) => [
            data.timestamps[i] * 1000,
            price
        ]);
        
        Highcharts.chart('chartPrice', {
            chart: {
                type: 'area',
                backgroundColor: 'transparent',
                zoomType: 'x'
            },
            title: {
                text: data.symbol + ' Price Evolution',
                style: { color: '#2649B2', fontSize: '1.3em' }
            },
            xAxis: {
                type: 'datetime',
                crosshair: true
            },
            yAxis: {
                title: {
                    text: 'Price (' + data.currency + ')',
                    style: { color: '#2649B2' }
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
        const volumes = data.prices.volume.map((vol, i) => [
            data.timestamps[i] * 1000,
            vol || 0
        ]);
        
        Highcharts.chart('chartVolume', {
            chart: {
                type: 'column',
                backgroundColor: 'transparent'
            },
            title: {
                text: 'Trading Volume',
                style: { color: '#6C3483', fontSize: '1.2em' }
            },
            xAxis: {
                type: 'datetime'
            },
            yAxis: {
                title: {
                    text: 'Volume',
                    style: { color: '#6C3483' }
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

// Auto-charger Apple au démarrage (optionnel)
window.addEventListener('DOMContentLoaded', function() {
    // MarketData.loadQuickStock('AAPL');
});