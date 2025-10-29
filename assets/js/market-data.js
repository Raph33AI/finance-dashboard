/* ==============================================
   MARKET-DATA.JS - VERSION ROBUSTE 2025
   ============================================== */

const MarketData = (function() {
    'use strict';
    
    // ========== NOUVEAUX PROXIES CORS TESTÉS ==========
    const CORS_PROXIES = [
        // Proxies sans Cloudflare (plus fiables)
        { url: 'https://api.allorigins.win/get?url=', jsonPath: 'contents' },
        { url: 'https://thingproxy.freeboard.io/fetch/', jsonPath: null },
        { url: 'https://corsproxy.io/?', jsonPath: null },
        { url: 'https://proxy.cors.sh/', jsonPath: null }
    ];
    
    let currentProxyIndex = 0;
    let successfulProxy = null;
    
    const YAHOO_FINANCE_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart/';
    
    let currentStockData = null;
    let technicalIndicators = null;
    
    // ========== FETCH AVEC RETRY ET VALIDATION JSON ==========
    async function fetchWithProxy(url, maxRetries = 4) {
        // Essayer le proxy mémorisé en premier
        if (successfulProxy) {
            try {
                console.log(`✅ Utilisation du proxy mémorisé`);
                const result = await attemptFetch(successfulProxy, url);
                if (result) return result;
                successfulProxy = null;
            } catch (error) {
                console.warn(`⚠️ Proxy mémorisé a échoué:`, error.message);
                successfulProxy = null;
            }
        }
        
        // Essayer tous les proxies
        for (let i = 0; i < CORS_PROXIES.length; i++) {
            const proxyConfig = CORS_PROXIES[i];
            
            console.log(`🔄 Tentative ${i + 1}/${CORS_PROXIES.length} avec: ${proxyConfig.url}`);
            
            try {
                const result = await attemptFetch(proxyConfig, url);
                if (result) {
                    console.log(`✅ Succès avec: ${proxyConfig.url}`);
                    successfulProxy = proxyConfig;
                    return result;
                }
            } catch (error) {
                console.warn(`❌ Échec avec ${proxyConfig.url}:`, error.message);
            }
        }
        
        throw new Error('❌ Tous les proxies CORS ont échoué. Veuillez réessayer dans quelques minutes.');
    }
    
    // ========== TENTATIVE DE FETCH AVEC VALIDATION ==========
    async function attemptFetch(proxyConfig, url) {
        const proxyUrl = proxyConfig.url + encodeURIComponent(url);
        
        try {
            const response = await fetch(proxyUrl, {
                method: 'GET',
                headers: { 
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                signal: AbortSignal.timeout(15000) // 15 secondes
            });
            
            if (!response.ok) {
                console.warn(`⚠️ HTTP ${response.status}`);
                return null;
            }
            
            // Lire le texte brut d'abord
            const rawText = await response.text();
            
            // Vérifier si c'est du JSON valide
            if (!rawText || rawText.trim().length === 0) {
                console.warn('⚠️ Réponse vide');
                return null;
            }
            
            // Vérifier si c'est du HTML (erreur Cloudflare, etc.)
            if (rawText.trim().startsWith('<') || rawText.includes('<!DOCTYPE') || rawText.includes('Edge:')) {
                console.warn('⚠️ Réponse HTML détectée (probablement une erreur)');
                console.log('Début de la réponse:', rawText.substring(0, 100));
                return null;
            }
            
            // Parser le JSON
            let jsonData;
            try {
                jsonData = JSON.parse(rawText);
            } catch (parseError) {
                console.warn('⚠️ JSON invalide:', parseError.message);
                console.log('Début de la réponse:', rawText.substring(0, 200));
                return null;
            }
            
            // Extraire les données si nécessaire (pour allorigins)
            if (proxyConfig.jsonPath && jsonData[proxyConfig.jsonPath]) {
                try {
                    jsonData = JSON.parse(jsonData[proxyConfig.jsonPath]);
                } catch (e) {
                    console.warn('⚠️ Impossible d\'extraire les données JSON');
                    return null;
                }
            }
            
            // Vérifier que c'est bien une réponse Yahoo Finance
            if (!jsonData.chart && !jsonData.quoteSummary) {
                console.warn('⚠️ Réponse JSON inattendue (pas Yahoo Finance)');
                return null;
            }
            
            return jsonData;
            
        } catch (error) {
            if (error.name === 'AbortError') {
                console.warn('⏱️ Timeout');
            } else {
                console.warn('❌ Erreur réseau:', error.message);
            }
            return null;
        }
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
            currentStockData = priceData;
            technicalIndicators = calculateTechnicalIndicators(priceData);
            
            displayResults(currentStockData, symbol);
            showNotification('✅ Données chargées avec succès !', 'success');
            
        } catch (error) {
            console.error('❌ Erreur:', error);
            showError(`Échec de récupération pour ${symbol}. ${error.message}`);
        } finally {
            showLoading(false);
        }
    }
    
    // ========== RÉCUPÉRATION YAHOO FINANCE ==========
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
        
        console.log('📡 Yahoo Finance URL:', yahooUrl);
        
        const json = await fetchWithProxy(yahooUrl);
        
        console.log('📊 Réponse Yahoo Finance:', json);
        
        if (!json.chart?.result?.[0]) {
            throw new Error('Symbole invalide ou données indisponibles');
        }
        
        if (json.chart.error) {
            throw new Error(json.chart.error.description || 'Erreur API Yahoo');
        }
        
        const result = json.chart.result[0];
        const meta = result.meta;
        const quote = result.indicators.quote[0];
        const timestamps = result.timestamp;
        
        if (!timestamps || timestamps.length === 0) {
            throw new Error('Aucune donnée historique');
        }
        
        // Nettoyage des données
        const cleanData = { open: [], high: [], low: [], close: [], volume: [] };
        const cleanTimestamps = [];
        
        for (let i = 0; i < timestamps.length; i++) {
            if (timestamps[i] && quote.close[i] != null) {
                cleanTimestamps.push(timestamps[i]);
                cleanData.open.push(quote.open[i] || quote.close[i]);
                cleanData.high.push(quote.high[i] || quote.close[i]);
                cleanData.low.push(quote.low[i] || quote.close[i]);
                cleanData.close.push(quote.close[i]);
                cleanData.volume.push(quote.volume[i] || 0);
            }
        }
        
        if (cleanData.close.length === 0) {
            throw new Error('Aucune donnée valide');
        }
        
        const currentPrice = meta.regularMarketPrice || cleanData.close[cleanData.close.length - 1];
        const previousClose = meta.chartPreviousClose || cleanData.close[cleanData.close.length - 2] || currentPrice;
        
        return {
            symbol: meta.symbol,
            currency: meta.currency || 'USD',
            currentPrice,
            previousClose,
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
    
    // ========== INDICATEURS TECHNIQUES ==========
    function calculateTechnicalIndicators(data) {
        const prices = data.prices.close;
        
        if (prices.length < 20) {
            return { sma20: null, sma50: null, rsi: null };
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
        
        let avgGain = 0, avgLoss = 0;
        
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
        return 100 - (100 / (1 + avgGain / avgLoss));
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
    }
    
    function displayTechnicalIndicators() {
        let container = document.getElementById('technicalIndicatorsSection');
        
        if (!container) {
            container = document.createElement('div');
            container.id = 'technicalIndicatorsSection';
            container.className = 'section';
            document.getElementById('resultsSection').appendChild(container);
        }
        
        if (!technicalIndicators) {
            container.innerHTML = '<p class="info-message">Indicateurs techniques non disponibles.</p>';
            return;
        }
        
        const rsi = technicalIndicators.rsi;
        const rsiSignal = rsi ? (rsi < 30 ? '🟢 Survendu' : rsi > 70 ? '🔴 Suracheté' : '🟡 Neutre') : 'N/A';
        
        container.innerHTML = `
            <h2 class='section-title'>📈 Indicateurs Techniques</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                ${technicalIndicators.rsi ? `<div class='metric-card'>
                    <div class='metric-label'>RSI (14)</div>
                    <div class='metric-value'>${formatNumber(rsi, 2)}</div>
                    <div class='metric-signal'>${rsiSignal}</div>
                </div>` : ''}
                ${technicalIndicators.sma20 ? `<div class='metric-card'>
                    <div class='metric-label'>SMA 20</div>
                    <div class='metric-value'>${formatNumber(technicalIndicators.sma20, 2)}</div>
                </div>` : ''}
                ${technicalIndicators.sma50 ? `<div class='metric-card'>
                    <div class='metric-label'>SMA 50</div>
                    <div class='metric-value'>${formatNumber(technicalIndicators.sma50, 2)}</div>
                </div>` : ''}
            </div>
        `;
    }
    
    function createPriceChart(data) {
        const prices = data.timestamps.map((ts, i) => [ts * 1000, data.prices.close[i]]);
        
        Highcharts.chart('chartPrice', {
            chart: { type: 'area', backgroundColor: 'transparent', zoomType: 'x' },
            title: { text: `${data.symbol} - Price Evolution`, style: { color: '#2649B2' } },
            xAxis: { type: 'datetime', crosshair: true },
            yAxis: { title: { text: `Price (${data.currency})` } },
            tooltip: { shared: true, valueDecimals: 2, valueSuffix: ` ${data.currency}` },
            series: [{
                name: data.symbol,
                data: prices,
                color: '#2649B2',
                fillColor: {
                    linearGradient: [0, 0, 0, 300],
                    stops: [[0, 'rgba(38,73,178,0.5)'], [1, 'rgba(38,73,178,0.05)']]
                }
            }],
            credits: { enabled: false }
        });
    }
    
    function createVolumeChart(data) {
        const volumes = data.timestamps.map((ts, i) => [ts * 1000, data.prices.volume[i] || 0]);
        
        Highcharts.chart('chartVolume', {
            chart: { type: 'column', backgroundColor: 'transparent' },
            title: { text: 'Trading Volume', style: { color: '#9D5CE6' } },
            xAxis: { type: 'datetime' },
            yAxis: { title: { text: 'Volume' } },
            series: [{ name: 'Volume', data: volumes, color: '#9D5CE6' }],
            legend: { enabled: false },
            credits: { enabled: false }
        });
    }
    
    // ========== UTILITAIRES ==========
    function formatNumber(num, decimals = 0) {
        if (num == null || isNaN(num)) return 'N/A';
        return Number(num).toLocaleString('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    }
    
    function showNotification(msg, type = 'info') {
        console.log(msg);
    }
    
    function loadQuickStock(symbol) {
        document.getElementById('stockSymbol').value = symbol;
        fetchStockData();
    }
    
    function showLoading(show) {
        const loader = document.getElementById('loadingIndicator');
        if (loader) loader.classList.toggle('hidden', !show);
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
    
    return {
        fetchStockData,
        loadQuickStock
    };
})();