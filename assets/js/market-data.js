/* ==============================================
   MARKET-DATA.JS - Market Data & Technical Analysis
   ============================================== */

const MarketData = {
    currentSymbol: '',
    currentPeriod: '1M',
    stockData: null,
    
    // API Configuration
    // Option 1: Yahoo Finance via Proxy (gratuit mais limité)
    // Option 2: Alpha Vantage (gratuit avec API key)
    // Option 3: Twelve Data (gratuit avec API key)
    
    // ⚠️ IMPORTANT: Obtenez votre clé API gratuite sur https://www.alphavantage.co/support/#api-key
    API_KEY: 'YOUR_ALPHA_VANTAGE_API_KEY_HERE', // Remplacez par votre clé
    
    // Initialize
    init() {
        this.updateLastUpdate();
        this.setupEventListeners();
        
        // Auto-load a default symbol
        setTimeout(() => {
            this.loadSymbol('AAPL');
        }, 500);
    },
    
    // Setup Event Listeners
    setupEventListeners() {
        const input = document.getElementById('symbolInput');
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchStock();
            }
        });
        
        // Indicator toggles
        document.getElementById('toggleSMA')?.addEventListener('change', () => this.updateChart());
        document.getElementById('toggleEMA')?.addEventListener('change', () => this.updateChart());
        document.getElementById('toggleBB')?.addEventListener('change', () => this.updateChart());
        document.getElementById('toggleVolume')?.addEventListener('change', () => this.updateChart());
    },
    
    // Search Stock
    searchStock() {
        const symbol = document.getElementById('symbolInput').value.trim().toUpperCase();
        if (symbol) {
            this.loadSymbol(symbol);
        }
    },
    
    // Load Symbol Data
    async loadSymbol(symbol) {
        this.currentSymbol = symbol;
        document.getElementById('symbolInput').value = symbol;
        
        // Show loading
        this.showLoading(true);
        this.hideResults();
        
        try {
            // Fetch data from Yahoo Finance API (via proxy)
            await this.fetchYahooFinanceData(symbol);
            
            // Display results
            this.displayStockOverview();
            this.displayResults();
            this.showLoading(false);
            
        } catch (error) {
            console.error('Error loading stock data:', error);
            alert(`Error loading data for ${symbol}. Please check the symbol and try again.`);
            this.showLoading(false);
        }
    },
    
    // Fetch from Yahoo Finance (via free API proxy)
    async fetchYahooFinanceData(symbol) {
        const period = this.getPeriodParams(this.currentPeriod);
        
        // Using Yahoo Finance API via rapidapi or yfinance proxy
        // Alternative gratuite: https://query1.finance.yahoo.com/v8/finance/chart/
        
        const baseUrl = 'https://query1.finance.yahoo.com/v8/finance/chart/';
        const url = `${baseUrl}${symbol}?interval=${period.interval}&range=${period.range}`;
        
        try {
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.chart.error) {
                throw new Error(data.chart.error.description);
            }
            
            const result = data.chart.result[0];
            this.stockData = this.parseYahooData(result);
            
            // Fetch quote data for additional info
            await this.fetchQuoteData(symbol);
            
        } catch (error) {
            console.error('Yahoo Finance error:', error);
            // Fallback to demo data
            this.stockData = this.generateDemoData(symbol);
        }
    },
    
    // Fetch Quote Data
    async fetchQuoteData(symbol) {
        try {
            const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}`;
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.quoteResponse.result.length > 0) {
                const quote = data.quoteResponse.result[0];
                this.stockData.quote = {
                    name: quote.longName || quote.shortName || symbol,
                    symbol: quote.symbol,
                    price: quote.regularMarketPrice,
                    change: quote.regularMarketChange,
                    changePercent: quote.regularMarketChangePercent,
                    open: quote.regularMarketOpen,
                    high: quote.regularMarketDayHigh,
                    low: quote.regularMarketDayLow,
                    volume: quote.regularMarketVolume,
                    marketCap: quote.marketCap,
                    pe: quote.trailingPE
                };
            }
        } catch (error) {
            console.error('Quote fetch error:', error);
        }
    },
    
    // Parse Yahoo Finance Data
    parseYahooData(result) {
        const timestamps = result.timestamp;
        const quotes = result.indicators.quote[0];
        
        const prices = timestamps.map((time, i) => ({
            timestamp: time * 1000,
            open: quotes.open[i],
            high: quotes.high[i],
            low: quotes.low[i],
            close: quotes.close[i],
            volume: quotes.volume[i]
        })).filter(p => p.close !== null);
        
        return {
            symbol: result.meta.symbol,
            prices: prices,
            currency: result.meta.currency,
            quote: {} // Will be filled by fetchQuoteData
        };
    },
    
    // Get Period Parameters
    getPeriodParams(period) {
        const params = {
            '1M': { range: '1mo', interval: '1d' },
            '3M': { range: '3mo', interval: '1d' },
            '6M': { range: '6mo', interval: '1d' },
            '1Y': { range: '1y', interval: '1d' },
            '5Y': { range: '5y', interval: '1wk' },
            'MAX': { range: 'max', interval: '1mo' }
        };
        return params[period] || params['1Y'];
    },
    
    // Change Period
    changePeriod(period) {
        this.currentPeriod = period;
        
        // Update active button
        document.querySelectorAll('.period-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-period="${period}"]`).classList.add('active');
        
        // Reload data
        if (this.currentSymbol) {
            this.loadSymbol(this.currentSymbol);
        }
    },
    
    // Display Stock Overview
    displayStockOverview() {
        const quote = this.stockData.quote;
        const lastPrice = this.stockData.prices[this.stockData.prices.length - 1];
        
        document.getElementById('stockName').textContent = quote.name || this.currentSymbol;
        document.getElementById('stockSymbol').textContent = quote.symbol || this.currentSymbol;
        
        const price = quote.price || lastPrice.close;
        const change = quote.change || 0;
        const changePercent = quote.changePercent || 0;
        
        document.getElementById('currentPrice').textContent = this.formatCurrency(price);
        
        const priceChangeEl = document.getElementById('priceChange');
        const changeText = `${change >= 0 ? '+' : ''}${this.formatCurrency(change)} (${change >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)`;
        priceChangeEl.textContent = changeText;
        priceChangeEl.className = change >= 0 ? 'price-change positive' : 'price-change negative';
        
        // Stats
        document.getElementById('statOpen').textContent = this.formatCurrency(quote.open || lastPrice.open);
        document.getElementById('statHigh').textContent = this.formatCurrency(quote.high || lastPrice.high);
        document.getElementById('statLow').textContent = this.formatCurrency(quote.low || lastPrice.low);
        document.getElementById('statVolume').textContent = this.formatVolume(quote.volume || lastPrice.volume);
        document.getElementById('statMarketCap').textContent = quote.marketCap ? this.formatLargeNumber(quote.marketCap) : 'N/A';
        document.getElementById('statPE').textContent = quote.pe ? quote.pe.toFixed(2) : 'N/A';
        
        document.getElementById('stockOverview').classList.remove('hidden');
    },
    
    // Display Results
    displayResults() {
        this.createPriceChart();
        this.createRSIChart();
        this.createMACDChart();
        this.displayTradingSignals();
        this.displayKeyStatistics();
        
        document.getElementById('resultsPanel').classList.remove('hidden');
    },
    
    // Create Price Chart
    createPriceChart() {
        const prices = this.stockData.prices;
        const ohlc = prices.map(p => [p.timestamp, p.open, p.high, p.low, p.close]);
        const volume = prices.map(p => [p.timestamp, p.volume]);
        
        const showSMA = document.getElementById('toggleSMA')?.checked !== false;
        const showEMA = document.getElementById('toggleEMA')?.checked || false;
        const showBB = document.getElementById('toggleBB')?.checked !== false;
        const showVolume = document.getElementById('toggleVolume')?.checked !== false;
        
        const series = [
            {
                type: 'candlestick',
                name: this.currentSymbol,
                data: ohlc,
                id: 'price',
                color: '#dc3545',
                upColor: '#28a745',
                borderRadius: '25%'
            }
        ];
        
        // Add SMA
        if (showSMA) {
            series.push({
                type: 'sma',
                linkedTo: 'price',
                params: { period: 20 },
                color: '#2649B2',
                lineWidth: 2,
                name: 'SMA 20'
            });
            series.push({
                type: 'sma',
                linkedTo: 'price',
                params: { period: 50 },
                color: '#9D5CE6',
                lineWidth: 2,
                name: 'SMA 50'
            });
        }
        
        // Add EMA
        if (showEMA) {
            series.push({
                type: 'ema',
                linkedTo: 'price',
                params: { period: 12 },
                color: '#4A74F3',
                lineWidth: 2,
                name: 'EMA 12'
            });
            series.push({
                type: 'ema',
                linkedTo: 'price',
                params: { period: 26 },
                color: '#8E7DE3',
                lineWidth: 2,
                name: 'EMA 26'
            });
        }
        
        // Add Bollinger Bands
        if (showBB) {
            series.push({
                type: 'bb',
                linkedTo: 'price',
                color: '#6C8BE0',
                fillOpacity: 0.1,
                lineWidth: 1,
                name: 'Bollinger Bands'
            });
        }
        
        // Add Volume
        if (showVolume) {
            series.push({
                type: 'column',
                name: 'Volume',
                data: volume,
                yAxis: 1,
                color: '#D4D9F0'
            });
        }
        
        Highcharts.stockChart('priceChart', {
            chart: {
                height: 600,
                borderRadius: 15
            },
            title: {
                text: `${this.currentSymbol} Price Chart`,
                style: { color: '#2649B2', fontWeight: 'bold' }
            },
            rangeSelector: {
                selected: 1,
                buttons: [{
                    type: 'week',
                    count: 1,
                    text: '1w'
                }, {
                    type: 'month',
                    count: 1,
                    text: '1m'
                }, {
                    type: 'month',
                    count: 3,
                    text: '3m'
                }, {
                    type: 'month',
                    count: 6,
                    text: '6m'
                }, {
                    type: 'ytd',
                    text: 'YTD'
                }, {
                    type: 'year',
                    count: 1,
                    text: '1y'
                }, {
                    type: 'all',
                    text: 'All'
                }]
            },
            yAxis: [{
                labels: {
                    align: 'right',
                    x: -3
                },
                title: {
                    text: 'Price'
                },
                height: '75%',
                lineWidth: 2
            }, {
                labels: {
                    align: 'right',
                    x: -3
                },
                title: {
                    text: 'Volume'
                },
                top: '80%',
                height: '20%',
                offset: 0,
                lineWidth: 2
            }],
            tooltip: {
                split: true,
                borderRadius: 10
            },
            series: series,
            credits: { enabled: false }
        });
    },
    
    // Create RSI Chart
    createRSIChart() {
        const prices = this.stockData.prices;
        const closeData = prices.map(p => [p.timestamp, p.close]);
        
        Highcharts.chart('rsiChart', {
            chart: {
                borderRadius: 15
            },
            title: {
                text: 'RSI Indicator',
                style: { color: '#2649B2', fontWeight: 'bold' }
            },
            xAxis: {
                type: 'datetime',
                crosshair: true
            },
            yAxis: {
                title: { text: 'RSI' },
                plotLines: [{
                    value: 70,
                    color: '#dc3545',
                    dashStyle: 'shortdash',
                    width: 2,
                    label: {
                        text: 'Overbought (70)',
                        align: 'right',
                        style: { color: '#dc3545' }
                    }
                }, {
                    value: 30,
                    color: '#28a745',
                    dashStyle: 'shortdash',
                    width: 2,
                    label: {
                        text: 'Oversold (30)',
                        align: 'right',
                        style: { color: '#28a745' }
                    }
                }, {
                    value: 50,
                    color: '#6C8BE0',
                    dashStyle: 'dot',
                    width: 1,
                    label: {
                        text: 'Neutral (50)',
                        align: 'right'
                    }
                }],
                min: 0,
                max: 100
            },
            tooltip: {
                borderRadius: 10
            },
            series: [{
                type: 'line',
                name: 'Close Price',
                data: closeData,
                id: 'price',
                visible: false
            }, {
                type: 'rsi',
                linkedTo: 'price',
                color: '#4A74F3',
                lineWidth: 2,
                name: 'RSI (14)',
                params: {
                    period: 14
                }
            }],
            credits: { enabled: false }
        });
    },
    
    // Create MACD Chart
    createMACDChart() {
        const prices = this.stockData.prices;
        const closeData = prices.map(p => [p.timestamp, p.close]);
        
        Highcharts.chart('macdChart', {
            chart: {
                borderRadius: 15
            },
            title: {
                text: 'MACD Indicator',
                style: { color: '#2649B2', fontWeight: 'bold' }
            },
            xAxis: {
                type: 'datetime',
                crosshair: true
            },
            yAxis: [{
                title: { text: 'MACD' },
                height: '100%'
            }],
            tooltip: {
                borderRadius: 10
            },
            series: [{
                type: 'line',
                name: 'Close Price',
                data: closeData,
                id: 'price',
                visible: false
            }, {
                type: 'macd',
                linkedTo: 'price',
                name: 'MACD',
                macdLine: {
                    styles: {
                        lineColor: '#2649B2',
                        lineWidth: 2
                    }
                },
                signalLine: {
                    styles: {
                        lineColor: '#9D5CE6',
                        lineWidth: 2
                    }
                },
                params: {
                    shortPeriod: 12,
                    longPeriod: 26,
                    signalPeriod: 9
                }
            }],
            credits: { enabled: false }
        });
    },
    
    // Calculate Technical Indicators
    calculateRSI(prices, period = 14) {
        if (prices.length < period + 1) return null;
        
        let gains = 0;
        let losses = 0;
        
        for (let i = 1; i <= period; i++) {
            const change = prices[i].close - prices[i - 1].close;
            if (change > 0) gains += change;
            else losses += Math.abs(change);
        }
        
        let avgGain = gains / period;
        let avgLoss = losses / period;
        
        for (let i = period + 1; i < prices.length; i++) {
            const change = prices[i].close - prices[i - 1].close;
            if (change > 0) {
                avgGain = ((avgGain * (period - 1)) + change) / period;
                avgLoss = (avgLoss * (period - 1)) / period;
            } else {
                avgGain = (avgGain * (period - 1)) / period;
                avgLoss = ((avgLoss * (period - 1)) + Math.abs(change)) / period;
            }
        }
        
        const rs = avgGain / avgLoss;
        const rsi = 100 - (100 / (1 + rs));
        
        return rsi;
    },
    
    // Display Trading Signals
    displayTradingSignals() {
        const prices = this.stockData.prices;
        const currentPrice = prices[prices.length - 1].close;
        const rsi = this.calculateRSI(prices);
        
        // Calculate simple signals
        const sma20 = this.calculateSMA(prices, 20);
        const sma50 = this.calculateSMA(prices, 50);
        
        const signals = [];
        
        // RSI Signal
        let rsiSignal = 'neutral';
        let rsiStatus = 'Neutral';
        if (rsi < 30) {
            rsiSignal = 'bullish';
            rsiStatus = 'Oversold - Buy Signal';
        } else if (rsi > 70) {
            rsiSignal = 'bearish';
            rsiStatus = 'Overbought - Sell Signal';
        }
        
        signals.push({
            title: 'RSI Signal',
            value: rsi.toFixed(2),
            status: rsiStatus,
            type: rsiSignal
        });
        
        // Moving Average Signal
        let maSignal = 'neutral';
        let maStatus = 'Neutral';
        if (currentPrice > sma20 && sma20 > sma50) {
            maSignal = 'bullish';
            maStatus = 'Bullish Trend';
        } else if (currentPrice < sma20 && sma20 < sma50) {
            maSignal = 'bearish';
            maStatus = 'Bearish Trend';
        }
        
        signals.push({
            title: 'Moving Average',
            value: currentPrice > sma20 ? 'Above SMA' : 'Below SMA',
            status: maStatus,
            type: maSignal
        });
        
        // Trend Signal
        const priceChange = ((currentPrice - prices[0].close) / prices[0].close) * 100;
        signals.push({
            title: 'Overall Trend',
            value: `${priceChange > 0 ? '+' : ''}${priceChange.toFixed(2)}%`,
            status: priceChange > 5 ? 'Strong Uptrend' : priceChange < -5 ? 'Strong Downtrend' : 'Sideways',
            type: priceChange > 0 ? 'bullish' : priceChange < 0 ? 'bearish' : 'neutral'
        });
        
        // Volatility
        const volatility = this.calculateVolatility(prices);
        signals.push({
            title: 'Volatility',
            value: `${volatility.toFixed(2)}%`,
            status: volatility > 3 ? 'High' : volatility > 1.5 ? 'Moderate' : 'Low',
            type: 'neutral'
        });
        
        // Render signals
        const container = document.getElementById('tradingSignals');
        container.innerHTML = signals.map(signal => `
            <div class='signal-card ${signal.type}'>
                <div class='signal-title'>${signal.title}</div>
                <div class='signal-value'>${signal.value}</div>
                <div class='signal-status'>${signal.status}</div>
            </div>
        `).join('');
    },
    
    // Display Key Statistics
    displayKeyStatistics() {
        const prices = this.stockData.prices;
        const currentPrice = prices[prices.length - 1].close;
        
        const stats = [];
        
        // 52-week high/low
        const high52w = Math.max(...prices.map(p => p.high));
        const low52w = Math.min(...prices.map(p => p.low));
        
        stats.push({ label: '52W High', value: this.formatCurrency(high52w) });
        stats.push({ label: '52W Low', value: this.formatCurrency(low52w) });
        
        // Average volume
        const avgVolume = prices.reduce((sum, p) => sum + p.volume, 0) / prices.length;
        stats.push({ label: 'Avg Volume', value: this.formatVolume(avgVolume) });
        
        // Volatility
        const volatility = this.calculateVolatility(prices);
        stats.push({ label: 'Volatility', value: `${volatility.toFixed(2)}%` });
        
        // Beta (simplified)
        stats.push({ label: 'Beta', value: 'N/A' });
        
        // Sharpe Ratio (simplified)
        stats.push({ label: 'Sharpe Ratio', value: 'N/A' });
        
        // Render stats
        const container = document.getElementById('keyStats');
        container.innerHTML = stats.map(stat => `
            <div class='stat-box'>
                <div class='label'>${stat.label}</div>
                <div class='value'>${stat.value}</div>
            </div>
        `).join('');
    },
    
    // Calculate SMA
    calculateSMA(prices, period) {
        if (prices.length < period) return 0;
        const sum = prices.slice(-period).reduce((acc, p) => acc + p.close, 0);
        return sum / period;
    },
    
    // Calculate Volatility
    calculateVolatility(prices) {
        const returns = [];
        for (let i = 1; i < prices.length; i++) {
            const ret = (prices[i].close - prices[i - 1].close) / prices[i - 1].close;
            returns.push(ret);
        }
        
        const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
        const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
        const stdDev = Math.sqrt(variance);
        
        return stdDev * Math.sqrt(252) * 100; // Annualized
    },
    
    // Generate Demo Data (fallback)
    generateDemoData(symbol) {
        const days = 365;
        const prices = [];
        let price = 100;
        
        for (let i = 0; i < days; i++) {
            const change = (Math.random() - 0.5) * 4;
            price = price * (1 + change / 100);
            
            const timestamp = Date.now() - (days - i) * 24 * 60 * 60 * 1000;
            prices.push({
                timestamp: timestamp,
                open: price * (1 + (Math.random() - 0.5) * 0.01),
                high: price * (1 + Math.random() * 0.02),
                low: price * (1 - Math.random() * 0.02),
                close: price,
                volume: Math.floor(Math.random() * 10000000)
            });
        }
        
        return {
            symbol: symbol,
            prices: prices,
            currency: 'USD',
            quote: {
                name: symbol + ' Inc.',
                symbol: symbol,
                price: price,
                change: price - 100,
                changePercent: ((price - 100) / 100) * 100,
                open: price * 0.99,
                high: price * 1.01,
                low: price * 0.98,
                volume: 50000000,
                marketCap: price * 1000000000,
                pe: 25.5
            }
        };
    },
    
    // Utility Functions
    formatCurrency(value) {
        if (!value && value !== 0) return 'N/A';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: this.stockData?.currency || 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    },
    
    formatVolume(value) {
        if (!value) return 'N/A';
        if (value >= 1e9) return (value / 1e9).toFixed(2) + 'B';
        if (value >= 1e6) return (value / 1e6).toFixed(2) + 'M';
        if (value >= 1e3) return (value / 1e3).toFixed(2) + 'K';
        return value.toFixed(0);
    },
    
    formatLargeNumber(value) {
        if (!value) return 'N/A';
        if (value >= 1e12) return '$' + (value / 1e12).toFixed(2) + 'T';
        if (value >= 1e9) return '$' + (value / 1e9).toFixed(2) + 'B';
        if (value >= 1e6) return '$' + (value / 1e6).toFixed(2) + 'M';
        return '$' + value.toFixed(0);
    },
    
    showLoading(show) {
        const loader = document.getElementById('loadingIndicator');
        if (show) {
            loader.classList.remove('hidden');
        } else {
            loader.classList.add('hidden');
        }
    },
    
    hideResults() {
        document.getElementById('stockOverview').classList.add('hidden');
        document.getElementById('resultsPanel').classList.add('hidden');
    },
    
    updateLastUpdate() {
        const now = new Date();
        const formatted = now.toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        document.getElementById('lastUpdate').textContent = `Last update: ${formatted}`;
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    MarketData.init();
});