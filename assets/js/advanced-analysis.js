/* ==============================================
   ADVANCED-ANALYSIS.JS - Corrected & Optimized
   ============================================== */

const AdvancedAnalysis = {
    currentSymbol: 'AAPL',
    currentPeriod: '6M',
    stockData: null,
    
    charts: {
        ichimoku: null,
        stochastic: null,
        williams: null,
        adx: null,
        sar: null,
        obv: null,
        atr: null,
        fibonacci: null,
        vwap: null
    },
    
    CORS_PROXIES: [
        'https://api.allorigins.win/raw?url=',
        'https://corsproxy.io/?',
        'https://api.codetabs.com/v1/proxy?quest='
    ],
    
    colors: {
        primary: '#2649B2',
        secondary: '#4A74F3',
        tertiary: '#8E7DE3',
        purple: '#9D5CE6',
        lightBlue: '#6C8BE0',
        success: '#28a745',
        danger: '#dc3545',
        warning: '#ffc107'
    },
    
    init() {
        console.log('🚀 Advanced Analysis - Initializing...');
        this.updateLastUpdate();
        this.setupEventListeners();
        this.loadSymbol(this.currentSymbol);
    },
    
    setupEventListeners() {
        const input = document.getElementById('symbolInput');
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.analyzeStock();
                }
            });
        }
    },
    
    analyzeStock() {
        const symbol = document.getElementById('symbolInput').value.trim().toUpperCase();
        if (symbol) {
            this.loadSymbol(symbol);
        }
    },
    
    async loadSymbol(symbol) {
        this.currentSymbol = symbol;
        document.getElementById('symbolInput').value = symbol;
        this.showLoading(true);
        
        try {
            await this.fetchStockData(symbol);
            const resultsPanel = document.getElementById('resultsPanel');
            if (resultsPanel.classList.contains('hidden')) {
                resultsPanel.classList.remove('hidden');
            }
            
            this.displayStockHeader();
            this.updateAllIndicators();
            this.showLoading(false);
            
        } catch (error) {
            console.error('Error loading stock data:', error);
            console.log('Using demo data as fallback...');
            this.stockData = this.generateDemoData(symbol);
            
            const resultsPanel = document.getElementById('resultsPanel');
            if (resultsPanel.classList.contains('hidden')) {
                resultsPanel.classList.remove('hidden');
            }
            
            this.displayStockHeader();
            this.updateAllIndicators();
            this.showLoading(false);
        }
    },
    
    async fetchStockData(symbol) {
        const period = this.getPeriodParams(this.currentPeriod);
        const targetUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${period.interval}&range=${period.range}`;
        
        for (let i = 0; i < this.CORS_PROXIES.length; i++) {
            try {
                const proxyUrl = this.CORS_PROXIES[i];
                const url = proxyUrl + encodeURIComponent(targetUrl);
                const response = await fetch(url);
                
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                
                const data = await response.json();
                if (data.chart && data.chart.error) {
                    throw new Error(data.chart.error.description);
                }
                
                const result = data.chart.result[0];
                this.stockData = this.parseYahooData(result);
                await this.fetchQuoteData(symbol);
                
                console.log('✅ Data fetched successfully');
                return;
                
            } catch (error) {
                console.warn(`Proxy ${i + 1} failed:`, error.message);
                if (i === this.CORS_PROXIES.length - 1) {
                    throw new Error('All proxies failed');
                }
            }
        }
    },
    
    async fetchQuoteData(symbol) {
        try {
            const targetUrl = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}`;
            const proxyUrl = this.CORS_PROXIES[0];
            const url = proxyUrl + encodeURIComponent(targetUrl);
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.quoteResponse && data.quoteResponse.result.length > 0) {
                const quote = data.quoteResponse.result[0];
                this.stockData.quote = {
                    name: quote.longName || quote.shortName || symbol,
                    symbol: quote.symbol,
                    price: quote.regularMarketPrice,
                    change: quote.regularMarketChange,
                    changePercent: quote.regularMarketChangePercent
                };
            }
        } catch (error) {
            console.warn('Quote fetch failed, using fallback data');
            const lastPrice = this.stockData.prices[this.stockData.prices.length - 1];
            const prevPrice = this.stockData.prices[this.stockData.prices.length - 2] || lastPrice;
            
            this.stockData.quote = {
                name: symbol,
                symbol: symbol,
                price: lastPrice.close,
                change: lastPrice.close - prevPrice.close,
                changePercent: ((lastPrice.close - prevPrice.close) / prevPrice.close) * 100
            };
        }
    },
    
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
            quote: {}
        };
    },
    
    getPeriodParams(period) {
        const params = {
            '1M': { range: '1mo', interval: '1d' },
            '3M': { range: '3mo', interval: '1d' },
            '6M': { range: '6mo', interval: '1d' },
            '1Y': { range: '1y', interval: '1d' },
            '5Y': { range: '5y', interval: '1wk' }
        };
        return params[period] || params['6M'];
    },
    
    changePeriod(period) {
        this.currentPeriod = period;
        
        document.querySelectorAll('.period-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const periodBtn = document.querySelector(`[data-period="${period}"]`);
        if (periodBtn) {
            periodBtn.classList.add('active');
        }
        
        if (this.currentSymbol) {
            this.loadSymbol(this.currentSymbol);
        }
    },
    
    displayStockHeader() {
        const quote = this.stockData.quote;
        
        document.getElementById('stockSymbol').textContent = quote.symbol || this.currentSymbol;
        document.getElementById('stockName').textContent = quote.name || this.currentSymbol;
        document.getElementById('currentPrice').textContent = this.formatCurrency(quote.price);
        
        const changeEl = document.getElementById('priceChange');
        const change = quote.change || 0;
        const changePercent = quote.changePercent || 0;
        const changeText = `${change >= 0 ? '+' : ''}${this.formatCurrency(change)} (${change >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)`;
        changeEl.textContent = changeText;
        changeEl.className = change >= 0 ? 'change positive' : 'change negative';
        
        document.getElementById('stockHeader').classList.remove('hidden');
    },
    
    updateAllIndicators() {
        console.log('🔄 Updating all indicators...');
        const startTime = performance.now();
        
        this.updateIchimokuChart();
        this.updateStochasticChart();
        this.updateWilliamsChart();
        this.updateADXChart();
        this.updateSARChart();
        this.updateOBVChart();
        this.updateATRChart();
        this.updateFibonacciChart();
        this.createPivotPoints();
        this.updateVWAPChart();
        this.generateConsolidatedSignals();
        
        const endTime = performance.now();
        console.log(`✅ All indicators updated in ${(endTime - startTime).toFixed(2)}ms`);
    },
    
    // ============================================
    // ICHIMOKU CLOUD
    // ============================================
    
    updateIchimokuChart() {
        const prices = this.stockData.prices;
        const ichimoku = this.calculateIchimoku(prices);
        const ohlc = prices.map(p => [p.timestamp, p.open, p.high, p.low, p.close]);
        
        if (this.charts.ichimoku) {
            this.charts.ichimoku.series[0].setData(ohlc, false);
            this.charts.ichimoku.series[1].setData(ichimoku.tenkan, false);
            this.charts.ichimoku.series[2].setData(ichimoku.kijun, false);
            this.charts.ichimoku.series[3].setData(ichimoku.spanA, false);
            this.charts.ichimoku.series[4].setData(ichimoku.spanB, false);
            this.charts.ichimoku.series[5].setData(ichimoku.cloud, false);
            this.charts.ichimoku.series[6].setData(ichimoku.chikou, false);
            this.charts.ichimoku.setTitle({ text: `${this.currentSymbol} - Ichimoku Cloud` });
            this.charts.ichimoku.redraw();
        } else {
            this.charts.ichimoku = Highcharts.stockChart('ichimokuChart', {
                chart: { height: 600, borderRadius: 15 },
                title: {
                    text: `${this.currentSymbol} - Ichimoku Cloud`,
                    style: { color: this.colors.primary, fontWeight: 'bold' }
                },
                rangeSelector: { enabled: false },
                navigator: { enabled: true },
                xAxis: { type: 'datetime', crosshair: true },
                yAxis: { title: { text: 'Price' }, opposite: true },
                tooltip: { split: false, shared: true, borderRadius: 10 },
                plotOptions: { series: { marker: { enabled: false } } },
                series: [
                    {
                        type: 'candlestick',
                        name: this.currentSymbol,
                        data: ohlc,
                        color: this.colors.danger,
                        upColor: this.colors.success,
                        zIndex: 3
                    },
                    {
                        type: 'line',
                        name: 'Tenkan-sen',
                        data: ichimoku.tenkan,
                        color: this.colors.danger,
                        lineWidth: 2,
                        zIndex: 2
                    },
                    {
                        type: 'line',
                        name: 'Kijun-sen',
                        data: ichimoku.kijun,
                        color: this.colors.primary,
                        lineWidth: 2,
                        zIndex: 2
                    },
                    {
                        type: 'line',
                        name: 'Senkou Span A',
                        data: ichimoku.spanA,
                        color: this.colors.success,
                        lineWidth: 1,
                        zIndex: 1
                    },
                    {
                        type: 'line',
                        name: 'Senkou Span B',
                        data: ichimoku.spanB,
                        color: this.colors.danger,
                        lineWidth: 1,
                        zIndex: 1
                    },
                    {
                        type: 'arearange',
                        name: 'Kumo (Cloud)',
                        data: ichimoku.cloud,
                        fillOpacity: 0.3,
                        lineWidth: 0,
                        color: this.colors.success,
                        negativeColor: this.colors.danger,
                        zIndex: 0
                    },
                    {
                        type: 'line',
                        name: 'Chikou Span',
                        data: ichimoku.chikou,
                        color: this.colors.purple,
                        lineWidth: 1,
                        dashStyle: 'Dot',
                        zIndex: 2
                    }
                ],
                credits: { enabled: false }
            });
        }
    },
    
    calculateIchimoku(prices) {
        const tenkanPeriod = 9;
        const kijunPeriod = 26;
        const senkouPeriod = 52;
        const displacement = 26;
        
        const tenkan = [];
        const kijun = [];
        const spanA = [];
        const spanB = [];
        const chikou = [];
        const cloud = [];
        
        for (let i = tenkanPeriod - 1; i < prices.length; i++) {
            const slice = prices.slice(i - tenkanPeriod + 1, i + 1);
            const high = Math.max(...slice.map(p => p.high));
            const low = Math.min(...slice.map(p => p.low));
            tenkan.push([prices[i].timestamp, (high + low) / 2]);
        }
        
        for (let i = kijunPeriod - 1; i < prices.length; i++) {
            const slice = prices.slice(i - kijunPeriod + 1, i + 1);
            const high = Math.max(...slice.map(p => p.high));
            const low = Math.min(...slice.map(p => p.low));
            kijun.push([prices[i].timestamp, (high + low) / 2]);
        }
        
        for (let i = 0; i < prices.length; i++) {
            if (i < tenkanPeriod - 1 || i < kijunPeriod - 1) continue;
            
            const tenkanValue = tenkan[i - tenkanPeriod + 1]?.[1];
            const kijunValue = kijun[i - kijunPeriod + 1]?.[1];
            
            if (tenkanValue && kijunValue) {
                const futureIndex = i + displacement;
                if (futureIndex < prices.length) {
                    spanA.push([prices[futureIndex].timestamp, (tenkanValue + kijunValue) / 2]);
                }
            }
        }
        
        for (let i = senkouPeriod - 1; i < prices.length; i++) {
            const slice = prices.slice(i - senkouPeriod + 1, i + 1);
            const high = Math.max(...slice.map(p => p.high));
            const low = Math.min(...slice.map(p => p.low));
            
            const futureIndex = i + displacement;
            if (futureIndex < prices.length) {
                spanB.push([prices[futureIndex].timestamp, (high + low) / 2]);
            }
        }
        
        for (let i = displacement; i < prices.length; i++) {
            chikou.push([prices[i - displacement].timestamp, prices[i].close]);
        }
        
        const minLength = Math.min(spanA.length, spanB.length);
        for (let i = 0; i < minLength; i++) {
            cloud.push([
                spanA[i][0],
                Math.min(spanA[i][1], spanB[i][1]),
                Math.max(spanA[i][1], spanB[i][1])
            ]);
        }
        
        return { tenkan, kijun, spanA, spanB, chikou, cloud };
    },
    
    // ============================================
    // STOCHASTIC OSCILLATOR
    // ============================================
    
    updateStochasticChart() {
        const prices = this.stockData.prices;
        const stochastic = this.calculateStochastic(prices);
        
        if (this.charts.stochastic) {
            this.charts.stochastic.series[0].setData(stochastic.k, false);
            this.charts.stochastic.series[1].setData(stochastic.d, false);
            this.charts.stochastic.redraw();
        } else {
            this.charts.stochastic = Highcharts.chart('stochasticChart', {
                chart: { borderRadius: 15, height: 400 },
                title: {
                    text: 'Stochastic Oscillator',
                    style: { color: this.colors.primary, fontWeight: 'bold' }
                },
                xAxis: { type: 'datetime', crosshair: true },
                yAxis: {
                    title: { text: 'Stochastic' },
                    plotLines: [
                        {
                            value: 80,
                            color: this.colors.danger,
                            dashStyle: 'ShortDash',
                            width: 2,
                            label: { text: 'Overbought (80)', align: 'right', style: { color: this.colors.danger } }
                        },
                        {
                            value: 20,
                            color: this.colors.success,
                            dashStyle: 'ShortDash',
                            width: 2,
                            label: { text: 'Oversold (20)', align: 'right', style: { color: this.colors.success } }
                        }
                    ],
                    min: 0,
                    max: 100
                },
                tooltip: { borderRadius: 10, shared: true },
                series: [
                    {
                        type: 'line',
                        name: '%K (Fast)',
                        data: stochastic.k,
                        color: this.colors.primary,
                        lineWidth: 2
                    },
                    {
                        type: 'line',
                        name: '%D (Slow)',
                        data: stochastic.d,
                        color: this.colors.danger,
                        lineWidth: 2
                    }
                ],
                credits: { enabled: false }
            });
        }
        
        this.displayStochasticSignal(stochastic);
    },
    
    calculateStochastic(prices, kPeriod = 14, dPeriod = 3) {
        const k = [];
        const d = [];
        
        for (let i = kPeriod - 1; i < prices.length; i++) {
            const slice = prices.slice(i - kPeriod + 1, i + 1);
            const high = Math.max(...slice.map(p => p.high));
            const low = Math.min(...slice.map(p => p.low));
            const close = prices[i].close;
            
            const kValue = ((close - low) / (high - low)) * 100;
            k.push([prices[i].timestamp, kValue]);
        }
        
        for (let i = dPeriod - 1; i < k.length; i++) {
            const slice = k.slice(i - dPeriod + 1, i + 1);
            const avg = slice.reduce((sum, item) => sum + item[1], 0) / dPeriod;
            d.push([k[i][0], avg]);
        }
        
        return { k, d };
    },
    
    displayStochasticSignal(stochastic) {
        if (!stochastic.k.length || !stochastic.d.length) {
            document.getElementById('stochasticSignal').textContent = 'Not enough data';
            return;
        }
        
        const lastK = stochastic.k[stochastic.k.length - 1][1];
        const lastD = stochastic.d[stochastic.d.length - 1][1];
        
        let signal = 'neutral';
        let text = `%K: ${lastK.toFixed(2)}, %D: ${lastD.toFixed(2)} - `;
        
        if (lastK > 80) {
            signal = 'bearish';
            text += 'Overbought - Potential Sell Signal';
        } else if (lastK < 20) {
            signal = 'bullish';
            text += 'Oversold - Potential Buy Signal';
        } else if (lastK > lastD && stochastic.k[stochastic.k.length - 2][1] <= stochastic.d[stochastic.d.length - 2][1]) {
            signal = 'bullish';
            text += 'Bullish Crossover';
        } else if (lastK < lastD && stochastic.k[stochastic.k.length - 2][1] >= stochastic.d[stochastic.d.length - 2][1]) {
            signal = 'bearish';
            text += 'Bearish Crossover';
        } else {
            text += 'Neutral';
        }
        
        const signalBox = document.getElementById('stochasticSignal');
        signalBox.className = `signal-box ${signal}`;
        signalBox.textContent = text;
    },
    
    // ============================================
    // WILLIAMS %R
    // ============================================
    
    updateWilliamsChart() {
        const prices = this.stockData.prices;
        const williams = this.calculateWilliams(prices);
        
        if (this.charts.williams) {
            this.charts.williams.series[0].setData(williams, true);
        } else {
            this.charts.williams = Highcharts.chart('williamsChart', {
                chart: { borderRadius: 15, height: 400 },
                title: {
                    text: 'Williams %R',
                    style: { color: this.colors.primary, fontWeight: 'bold' }
                },
                xAxis: { type: 'datetime', crosshair: true },
                yAxis: {
                    title: { text: 'Williams %R' },
                    plotLines: [
                        {
                            value: -20,
                            color: this.colors.danger,
                            dashStyle: 'ShortDash',
                            width: 2,
                            label: { text: 'Overbought (-20)', align: 'right', style: { color: this.colors.danger } }
                        },
                        {
                            value: -80,
                            color: this.colors.success,
                            dashStyle: 'ShortDash',
                            width: 2,
                            label: { text: 'Oversold (-80)', align: 'right', style: { color: this.colors.success } }
                        }
                    ],
                    min: -100,
                    max: 0
                },
                tooltip: { borderRadius: 10 },
                series: [
                    {
                        type: 'area',
                        name: 'Williams %R',
                        data: williams,
                        color: this.colors.secondary,
                        fillOpacity: 0.3,
                        lineWidth: 2
                    }
                ],
                credits: { enabled: false }
            });
        }
        
        this.displayWilliamsSignal(williams);
    },
    
    calculateWilliams(prices, period = 14) {
        const williams = [];
        
        for (let i = period - 1; i < prices.length; i++) {
            const slice = prices.slice(i - period + 1, i + 1);
            const high = Math.max(...slice.map(p => p.high));
            const low = Math.min(...slice.map(p => p.low));
            const close = prices[i].close;
            
            const value = ((high - close) / (high - low)) * -100;
            williams.push([prices[i].timestamp, value]);
        }
        
        return williams;
    },
    
    displayWilliamsSignal(williams) {
        if (!williams.length) {
            document.getElementById('williamsSignal').textContent = 'Not enough data';
            return;
        }
        
        const lastValue = williams[williams.length - 1][1];
        
        let signal = 'neutral';
        let text = `Williams %R: ${lastValue.toFixed(2)} - `;
        
        if (lastValue > -20) {
            signal = 'bearish';
            text += 'Overbought - Potential Sell Signal';
        } else if (lastValue < -80) {
            signal = 'bullish';
            text += 'Oversold - Potential Buy Signal';
        } else {
            text += 'Neutral Zone';
        }
        
        const signalBox = document.getElementById('williamsSignal');
        signalBox.className = `signal-box ${signal}`;
        signalBox.textContent = text;
    },

    // ============================================
    // ADX
    // ============================================
    
    updateADXChart() {
        const prices = this.stockData.prices;
        const adxData = this.calculateADX(prices);
        
        if (!adxData.adx.length || !adxData.plusDI.length || !adxData.minusDI.length) {
            console.warn('ADX calculation returned empty data');
            const signalBox = document.getElementById('adxSignal');
            if (signalBox) {
                signalBox.className = 'signal-box neutral';
                signalBox.textContent = 'Not enough data for ADX (need 6+ months)';
            }
            return;
        }
        
        if (this.charts.adx) {
            this.charts.adx.series[0].setData(adxData.adx, false);
            this.charts.adx.series[1].setData(adxData.plusDI, false);
            this.charts.adx.series[2].setData(adxData.minusDI, false);
            this.charts.adx.redraw();
        } else {
            this.charts.adx = Highcharts.chart('adxChart', {
                chart: { borderRadius: 15, height: 400 },
                title: {
                    text: 'ADX - Trend Strength',
                    style: { color: this.colors.primary, fontWeight: 'bold' }
                },
                xAxis: { type: 'datetime', crosshair: true },
                yAxis: {
                    title: { text: 'ADX Value' },
                    plotLines: [
                        {
                            value: 25,
                            color: this.colors.success,
                            dashStyle: 'ShortDash',
                            width: 2,
                            label: { text: 'Strong Trend (25)', align: 'right', style: { color: this.colors.success } }
                        },
                        {
                            value: 20,
                            color: this.colors.warning,
                            dashStyle: 'Dot',
                            width: 1,
                            label: { text: 'Weak Trend (20)', align: 'right' }
                        }
                    ],
                    min: 0,
                    max: 100
                },
                tooltip: { borderRadius: 10, shared: true },
                series: [
                    {
                        type: 'line',
                        name: 'ADX',
                        data: adxData.adx,
                        color: this.colors.primary,
                        lineWidth: 3
                    },
                    {
                        type: 'line',
                        name: '+DI',
                        data: adxData.plusDI,
                        color: this.colors.success,
                        lineWidth: 2
                    },
                    {
                        type: 'line',
                        name: '-DI',
                        data: adxData.minusDI,
                        color: this.colors.danger,
                        lineWidth: 2
                    }
                ],
                credits: { enabled: false }
            });
        }
        
        this.displayADXSignal(adxData);
    },
    
    calculateADX(prices, period = 14) {
        if (prices.length < period + 2) {
            console.warn('Not enough data for ADX calculation');
            return { adx: [], plusDI: [], minusDI: [] };
        }
        
        const trueRange = [];
        const plusDM = [];
        const minusDM = [];
        
        for (let i = 1; i < prices.length; i++) {
            const high = prices[i].high;
            const low = prices[i].low;
            const prevClose = prices[i - 1].close;
            
            const tr = Math.max(
                high - low,
                Math.abs(high - prevClose),
                Math.abs(low - prevClose)
            );
            trueRange.push(tr);
            
            const highDiff = high - prices[i - 1].high;
            const lowDiff = prices[i - 1].low - low;
            
            plusDM.push(highDiff > lowDiff && highDiff > 0 ? highDiff : 0);
            minusDM.push(lowDiff > highDiff && lowDiff > 0 ? lowDiff : 0);
        }
        
        const smoothTR = this.smoothArray(trueRange, period);
        const smoothPlusDM = this.smoothArray(plusDM, period);
        const smoothMinusDM = this.smoothArray(minusDM, period);
        
        const plusDI = [];
        const minusDI = [];
        const dxValues = [];
        
        const maxIndex = Math.min(smoothTR.length, prices.length - period - 1);
        
        for (let i = 0; i < maxIndex; i++) {
            if (smoothTR[i] === 0) continue;
            
            const plusDIValue = (smoothPlusDM[i] / smoothTR[i]) * 100;
            const minusDIValue = (smoothMinusDM[i] / smoothTR[i]) * 100;
            
            const timestamp = prices[i + period + 1].timestamp;
            plusDI.push([timestamp, plusDIValue]);
            minusDI.push([timestamp, minusDIValue]);
            
            const sum = plusDIValue + minusDIValue;
            if (sum > 0) {
                const dx = (Math.abs(plusDIValue - minusDIValue) / sum) * 100;
                dxValues.push(dx);
            }
        }
        
        if (dxValues.length < period) {
            console.warn('Not enough DX values for ADX calculation');
            return { adx: [], plusDI, minusDI };
        }
        
        const adxSmoothed = this.smoothArray(dxValues, period);
        const adxArray = [];
        
        const adxMaxIndex = Math.min(adxSmoothed.length, prices.length - period * 2 - 1);
        
        for (let i = 0; i < adxMaxIndex; i++) {
            const timestamp = prices[i + period * 2 + 1].timestamp;
            adxArray.push([timestamp, adxSmoothed[i]]);
        }
        
        return { adx: adxArray, plusDI, minusDI };
    },
    
    smoothArray(arr, period) {
        if (arr.length < period) return [];
        
        const result = [];
        let sum = 0;
        
        for (let i = 0; i < period; i++) {
            sum += arr[i];
        }
        result.push(sum / period);
        
        for (let i = period; i < arr.length; i++) {
            const smoothed = (result[result.length - 1] * (period - 1) + arr[i]) / period;
            result.push(smoothed);
        }
        
        return result;
    },
    
    displayADXSignal(adxData) {
        if (!adxData.adx.length || !adxData.plusDI.length || !adxData.minusDI.length) {
            const signalBox = document.getElementById('adxSignal');
            signalBox.className = 'signal-box neutral';
            signalBox.textContent = 'Not enough data for ADX calculation';
            return;
        }
        
        const lastADX = adxData.adx[adxData.adx.length - 1][1];
        const lastPlusDI = adxData.plusDI[adxData.plusDI.length - 1][1];
        const lastMinusDI = adxData.minusDI[adxData.minusDI.length - 1][1];
        
        let signal = 'neutral';
        let text = `ADX: ${lastADX.toFixed(2)} - `;
        
        if (lastADX > 25) {
            if (lastPlusDI > lastMinusDI) {
                signal = 'bullish';
                text += 'Strong Uptrend';
            } else {
                signal = 'bearish';
                text += 'Strong Downtrend';
            }
        } else if (lastADX > 20) {
            text += 'Developing Trend';
        } else {
            text += 'Weak/No Trend (Ranging Market)';
        }
        
        const signalBox = document.getElementById('adxSignal');
        signalBox.className = `signal-box ${signal}`;
        signalBox.textContent = text;
    },
    
    // ============================================
    // PARABOLIC SAR
    // ============================================
    
    updateSARChart() {
        const prices = this.stockData.prices;
        const sar = this.calculateSAR(prices);
        const ohlc = prices.map(p => [p.timestamp, p.open, p.high, p.low, p.close]);
        
        if (this.charts.sar) {
            this.charts.sar.series[0].setData(ohlc, false);
            this.charts.sar.series[1].setData(sar, false);
            this.charts.sar.redraw();
        } else {
            this.charts.sar = Highcharts.stockChart('sarChart', {
                chart: { borderRadius: 15, height: 400 },
                title: {
                    text: 'Parabolic SAR',
                    style: { color: this.colors.primary, fontWeight: 'bold' }
                },
                rangeSelector: { enabled: false },
                navigator: { enabled: false },
                xAxis: { type: 'datetime', crosshair: true },
                yAxis: { title: { text: 'Price' } },
                tooltip: { borderRadius: 10, shared: true },
                series: [
                    {
                        type: 'candlestick',
                        name: this.currentSymbol,
                        data: ohlc,
                        color: this.colors.danger,
                        upColor: this.colors.success
                    },
                    {
                        type: 'scatter',
                        name: 'Parabolic SAR',
                        data: sar,
                        color: this.colors.purple,
                        marker: { radius: 3, symbol: 'circle' }
                    }
                ],
                credits: { enabled: false }
            });
        }
        
        this.displaySARSignal(sar, prices);
    },
    
    calculateSAR(prices, af = 0.02, maxAF = 0.2) {
        const sar = [];
        let isUptrend = true;
        let currentSAR = prices[0].low;
        let ep = prices[0].high;
        let currentAF = af;
        
        for (let i = 1; i < prices.length; i++) {
            const price = prices[i];
            currentSAR = currentSAR + currentAF * (ep - currentSAR);
            
            if (isUptrend) {
                if (price.low < currentSAR) {
                    isUptrend = false;
                    currentSAR = ep;
                    ep = price.low;
                    currentAF = af;
                } else {
                    if (price.high > ep) {
                        ep = price.high;
                        currentAF = Math.min(currentAF + af, maxAF);
                    }
                }
            } else {
                if (price.high > currentSAR) {
                    isUptrend = true;
                    currentSAR = ep;
                    ep = price.high;
                    currentAF = af;
                } else {
                    if (price.low < ep) {
                        ep = price.low;
                        currentAF = Math.min(currentAF + af, maxAF);
                    }
                }
            }
            
            sar.push([price.timestamp, currentSAR]);
        }
        
        return sar;
    },
    
    displaySARSignal(sar, prices) {
        if (!sar.length) {
            document.getElementById('sarSignal').textContent = 'Not enough data';
            return;
        }
        
        const lastPrice = prices[prices.length - 1].close;
        const lastSAR = sar[sar.length - 1][1];
        
        const signal = lastPrice > lastSAR ? 'bullish' : 'bearish';
        const text = lastPrice > lastSAR 
            ? `Price above SAR - Uptrend (Hold Long)` 
            : `Price below SAR - Downtrend (Hold Short)`;
        
        const signalBox = document.getElementById('sarSignal');
        signalBox.className = `signal-box ${signal}`;
        signalBox.textContent = text;
    },
    
    // ============================================
    // OBV
    // ============================================
    
    updateOBVChart() {
        const prices = this.stockData.prices;
        const obv = this.calculateOBV(prices);
        
        if (this.charts.obv) {
            this.charts.obv.series[0].setData(obv, true);
        } else {
            this.charts.obv = Highcharts.chart('obvChart', {
                chart: { borderRadius: 15, height: 400 },
                title: {
                    text: 'On-Balance Volume (OBV)',
                    style: { color: this.colors.primary, fontWeight: 'bold' }
                },
                xAxis: { type: 'datetime', crosshair: true },
                yAxis: { title: { text: 'OBV' } },
                tooltip: { borderRadius: 10, valueDecimals: 0 },
                series: [
                    {
                        type: 'area',
                        name: 'OBV',
                        data: obv,
                        color: this.colors.secondary,
                        fillOpacity: 0.3,
                        lineWidth: 2
                    }
                ],
                credits: { enabled: false }
            });
        }
        
        this.displayOBVSignal(obv, prices);
    },
    
    calculateOBV(prices) {
        const obv = [];
        let currentOBV = 0;
        
        obv.push([prices[0].timestamp, currentOBV]);
        
        for (let i = 1; i < prices.length; i++) {
            if (prices[i].close > prices[i - 1].close) {
                currentOBV += prices[i].volume;
            } else if (prices[i].close < prices[i - 1].close) {
                currentOBV -= prices[i].volume;
            }
            
            obv.push([prices[i].timestamp, currentOBV]);
        }
        
        return obv;
    },
    
    displayOBVSignal(obv, prices) {
        if (obv.length < 20) {
            document.getElementById('obvSignal').textContent = 'Not enough data';
            return;
        }
        
        const recentPrices = prices.slice(-20);
        const recentOBV = obv.slice(-20);
        
        const priceChange = recentPrices[recentPrices.length - 1].close - recentPrices[0].close;
        const obvChange = recentOBV[recentOBV.length - 1][1] - recentOBV[0][1];
        
        let signal = 'neutral';
        let text = '';
        
        if (priceChange > 0 && obvChange > 0) {
            signal = 'bullish';
            text = 'Price ↑ + OBV ↑ - Strong Uptrend';
        } else if (priceChange < 0 && obvChange < 0) {
            signal = 'bearish';
            text = 'Price ↓ + OBV ↓ - Strong Downtrend';
        } else if (priceChange > 0 && obvChange < 0) {
            signal = 'bearish';
            text = 'Bearish Divergence - Weakness in Uptrend';
        } else if (priceChange < 0 && obvChange > 0) {
            signal = 'bullish';
            text = 'Bullish Divergence - Weakness in Downtrend';
        } else {
            text = 'No Clear Signal';
        }
        
        const signalBox = document.getElementById('obvSignal');
        signalBox.className = `signal-box ${signal}`;
        signalBox.textContent = text;
    },
    
    // ============================================
    // ATR
    // ============================================
    
    updateATRChart() {
        const prices = this.stockData.prices;
        const atr = this.calculateATR(prices);
        
        if (this.charts.atr) {
            this.charts.atr.series[0].setData(atr, true);
        } else {
            this.charts.atr = Highcharts.chart('atrChart', {
                chart: { borderRadius: 15, height: 400 },
                title: {
                    text: 'Average True Range (ATR)',
                    style: { color: this.colors.primary, fontWeight: 'bold' }
                },
                xAxis: { type: 'datetime', crosshair: true },
                yAxis: { title: { text: 'ATR Value' } },
                tooltip: { borderRadius: 10, valueDecimals: 2 },
                series: [
                    {
                        type: 'line',
                        name: 'ATR',
                        data: atr,
                        color: this.colors.tertiary,
                        lineWidth: 2
                    }
                ],
                credits: { enabled: false }
            });
        }
        
        this.displayATRSignal(atr);
    },
    
    calculateATR(prices, period = 14) {
        const trueRange = [];
        
        for (let i = 1; i < prices.length; i++) {
            const high = prices[i].high;
            const low = prices[i].low;
            const prevClose = prices[i - 1].close;
            
            const tr = Math.max(
                high - low,
                Math.abs(high - prevClose),
                Math.abs(low - prevClose)
            );
            
            trueRange.push(tr);
        }
        
        const atr = [];
        let sum = 0;
        
        for (let i = 0; i < period && i < trueRange.length; i++) {
            sum += trueRange[i];
        }
        
        if (period < prices.length) {
            atr.push([prices[period].timestamp, sum / period]);
        }
        
        for (let i = period; i < trueRange.length; i++) {
            const smoothed = (atr[atr.length - 1][1] * (period - 1) + trueRange[i]) / period;
            const priceIndex = i + 1;
            
            if (priceIndex < prices.length) {
                atr.push([prices[priceIndex].timestamp, smoothed]);
            }
        }
        
        return atr;
    },

    displayATRSignal(atr) {
        if (!atr.length || atr.length < 20) {
            const signalBox = document.getElementById('atrSignal');
            signalBox.className = 'signal-box neutral';
            signalBox.textContent = 'Not enough data for ATR calculation';
            return;
        }
        
        const lastATR = atr[atr.length - 1][1];
        const avgATR = atr.slice(-20).reduce((sum, item) => sum + item[1], 0) / 20;
        
        let signal = 'neutral';
        let text = `Current ATR: ${lastATR.toFixed(2)} - `;
        
        if (lastATR > avgATR * 1.5) {
            signal = 'neutral';
            text += 'High Volatility (Use Wider Stops)';
        } else if (lastATR < avgATR * 0.7) {
            signal = 'neutral';
            text += 'Low Volatility (Potential Breakout Coming)';
        } else {
            text += 'Normal Volatility';
        }
        
        const signalBox = document.getElementById('atrSignal');
        signalBox.className = `signal-box ${signal}`;
        signalBox.textContent = text;
    },
    
    // ============================================
    // FIBONACCI
    // ============================================
    
    updateFibonacciChart() {
        const prices = this.stockData.prices;
        const fibonacci = this.calculateFibonacci(prices);
        const ohlc = prices.map(p => [p.timestamp, p.open, p.high, p.low, p.close]);
        
        if (this.charts.fibonacci) {
            this.charts.fibonacci.series[0].setData(ohlc, false);
            this.charts.fibonacci.yAxis[0].update({
                plotLines: fibonacci.levels.map(level => ({
                    value: level.price,
                    color: this.getColorForFibLevel(level.ratio),
                    dashStyle: 'Dash',
                    width: 2,
                    label: {
                        text: `${level.name} (${this.formatCurrency(level.price)})`,
                        align: 'right',
                        style: {
                            color: this.getColorForFibLevel(level.ratio),
                            fontWeight: level.ratio === 0.618 ? 'bold' : 'normal'
                        }
                    },
                    zIndex: 5
                }))
            }, false);
            this.charts.fibonacci.redraw();
        } else {
            this.charts.fibonacci = Highcharts.stockChart('fibonacciChart', {
                chart: { borderRadius: 15, height: 600 },
                title: {
                    text: 'Fibonacci Retracements',
                    style: { color: this.colors.primary, fontWeight: 'bold' }
                },
                rangeSelector: { enabled: false },
                navigator: { enabled: false },
                xAxis: { type: 'datetime', crosshair: true },
                yAxis: {
                    title: { text: 'Price' },
                    plotLines: fibonacci.levels.map(level => ({
                        value: level.price,
                        color: this.getColorForFibLevel(level.ratio),
                        dashStyle: 'Dash',
                        width: 2,
                        label: {
                            text: `${level.name} (${this.formatCurrency(level.price)})`,
                            align: 'right',
                            style: {
                                color: this.getColorForFibLevel(level.ratio),
                                fontWeight: level.ratio === 0.618 ? 'bold' : 'normal'
                            }
                        },
                        zIndex: 5
                    }))
                },
                tooltip: { borderRadius: 10, shared: true },
                series: [
                    {
                        type: 'candlestick',
                        name: this.currentSymbol,
                        data: ohlc,
                        color: this.colors.danger,
                        upColor: this.colors.success,
                        zIndex: 2
                    }
                ],
                credits: { enabled: false }
            });
        }
        
        this.displayFibonacciLevels(fibonacci);
    },
    
    calculateFibonacci(prices) {
        const high = Math.max(...prices.map(p => p.high));
        const low = Math.min(...prices.map(p => p.low));
        const diff = high - low;
        
        const ratios = [
            { ratio: 0, name: '0% (High)' },
            { ratio: 0.236, name: '23.6%' },
            { ratio: 0.382, name: '38.2%' },
            { ratio: 0.5, name: '50%' },
            { ratio: 0.618, name: '61.8% (Golden)' },
            { ratio: 0.786, name: '78.6%' },
            { ratio: 1, name: '100% (Low)' }
        ];
        
        const levels = ratios.map(r => ({
            ratio: r.ratio,
            name: r.name,
            price: high - (diff * r.ratio)
        }));
        
        return { high, low, levels };
    },
    
    getColorForFibLevel(ratio) {
        if (ratio === 0.618) return this.colors.danger;
        if (ratio === 0 || ratio === 1) return this.colors.primary;
        return this.colors.lightBlue;
    },
    
    displayFibonacciLevels(fibonacci) {
        const currentPrice = this.stockData.prices[this.stockData.prices.length - 1].close;
        
        const tableHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Level</th>
                        <th>Price</th>
                        <th>Distance from Current</th>
                        <th>Type</th>
                    </tr>
                </thead>
                <tbody>
                    ${fibonacci.levels.map(level => {
                        const distance = ((level.price - currentPrice) / currentPrice) * 100;
                        const distanceText = `${distance >= 0 ? '+' : ''}${distance.toFixed(2)}%`;
                        const type = level.price > currentPrice ? 'Resistance' : 'Support';
                        
                        return `
                            <tr>
                                <td class='level-name'>${level.name}</td>
                                <td class='level-price'>${this.formatCurrency(level.price)}</td>
                                <td style='color: ${distance >= 0 ? this.colors.danger : this.colors.success}'>${distanceText}</td>
                                <td style='color: ${type === 'Resistance' ? this.colors.danger : this.colors.success}'>${type}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
        
        document.getElementById('fibonacciLevels').innerHTML = tableHTML;
    },
    
    // ============================================
    // PIVOT POINTS
    // ============================================
    
    createPivotPoints() {
        const prices = this.stockData.prices;
        const lastPrice = prices[prices.length - 1];
        const prevPrice = prices[prices.length - 2];
        
        const high = prevPrice.high;
        const low = prevPrice.low;
        const close = prevPrice.close;
        
        const standard = this.calculateStandardPivots(high, low, close);
        this.displayPivotCard('pivotStandard', standard, lastPrice.close);
        
        const fibonacci = this.calculateFibonacciPivots(high, low, close);
        this.displayPivotCard('pivotFibonacci', fibonacci, lastPrice.close);
        
        const camarilla = this.calculateCamarillaPivots(high, low, close);
        this.displayPivotCard('pivotCamarilla', camarilla, lastPrice.close);
    },
    
    calculateStandardPivots(high, low, close) {
        const pivot = (high + low + close) / 3;
        
        return {
            R3: high + 2 * (pivot - low),
            R2: pivot + (high - low),
            R1: 2 * pivot - low,
            P: pivot,
            S1: 2 * pivot - high,
            S2: pivot - (high - low),
            S3: low - 2 * (high - pivot)
        };
    },
    
    calculateFibonacciPivots(high, low, close) {
        const pivot = (high + low + close) / 3;
        const range = high - low;
        
        return {
            R3: pivot + range * 1.000,
            R2: pivot + range * 0.618,
            R1: pivot + range * 0.382,
            P: pivot,
            S1: pivot - range * 0.382,
            S2: pivot - range * 0.618,
            S3: pivot - range * 1.000
        };
    },
    
    calculateCamarillaPivots(high, low, close) {
        const range = high - low;
        
        return {
            R4: close + range * 1.1 / 2,
            R3: close + range * 1.1 / 4,
            R2: close + range * 1.1 / 6,
            R1: close + range * 1.1 / 12,
            P: close,
            S1: close - range * 1.1 / 12,
            S2: close - range * 1.1 / 6,
            S3: close - range * 1.1 / 4,
            S4: close - range * 1.1 / 2
        };
    },
    
    displayPivotCard(elementId, pivots, currentPrice) {
        const container = document.getElementById(elementId);
        if (!container) return;
        
        const valuesContainer = container.querySelector('.pivot-values');
        if (!valuesContainer) return;
        
        const entries = Object.entries(pivots).sort((a, b) => b[1] - a[1]);
        
        const html = entries.map(([label, value]) => {
            let className = 'pivot-level';
            if (label.startsWith('R')) className += ' resistance';
            else if (label.startsWith('S')) className += ' support';
            else className += ' pivot';
            
            const distance = ((value - currentPrice) / currentPrice) * 100;
            const distanceText = `${distance >= 0 ? '+' : ''}${distance.toFixed(2)}%`;
            
            return `
                <div class='${className}'>
                    <span class='pivot-label'>${label}</span>
                    <span class='pivot-value'>${this.formatCurrency(value)} <small>(${distanceText})</small></span>
                </div>
            `;
        }).join('');
        
        valuesContainer.innerHTML = html;
    },
    
    // ============================================
    // VWAP
    // ============================================
    
    updateVWAPChart() {
        const prices = this.stockData.prices;
        const vwap = this.calculateVWAP(prices);
        const ohlc = prices.map(p => [p.timestamp, p.open, p.high, p.low, p.close]);
        
        if (this.charts.vwap) {
            this.charts.vwap.series[0].setData(ohlc, false);
            this.charts.vwap.series[1].setData(vwap.vwap, false);
            this.charts.vwap.series[2].setData(vwap.upperBand1, false);
            this.charts.vwap.series[3].setData(vwap.upperBand2, false);
            this.charts.vwap.series[4].setData(vwap.lowerBand1, false);
            this.charts.vwap.series[5].setData(vwap.lowerBand2, false);
            this.charts.vwap.redraw();
        } else {
            this.charts.vwap = Highcharts.stockChart('vwapChart', {
                chart: { borderRadius: 15, height: 600 },
                title: {
                    text: 'VWAP with Standard Deviation Bands',
                    style: { color: this.colors.primary, fontWeight: 'bold' }
                },
                rangeSelector: { enabled: false },
                navigator: { enabled: true },
                xAxis: { type: 'datetime', crosshair: true },
                yAxis: { title: { text: 'Price' } },
                tooltip: { borderRadius: 10, shared: true },
                series: [
                    {
                        type: 'candlestick',
                        name: this.currentSymbol,
                        data: ohlc,
                        color: this.colors.danger,
                        upColor: this.colors.success,
                        zIndex: 2
                    },
                    {
                        type: 'line',
                        name: 'VWAP',
                        data: vwap.vwap,
                        color: this.colors.primary,
                        lineWidth: 3,
                        zIndex: 3
                    },
                    {
                        type: 'line',
                        name: 'Upper Band (+1 SD)',
                        data: vwap.upperBand1,
                        color: this.colors.danger,
                        lineWidth: 1,
                        dashStyle: 'Dash',
                        zIndex: 1
                    },
                    {
                        type: 'line',
                        name: 'Upper Band (+2 SD)',
                        data: vwap.upperBand2,
                        color: this.colors.danger,
                        lineWidth: 1,
                        dashStyle: 'Dot',
                        zIndex: 1
                    },
                    {
                        type: 'line',
                        name: 'Lower Band (-1 SD)',
                        data: vwap.lowerBand1,
                        color: this.colors.success,
                        lineWidth: 1,
                        dashStyle: 'Dash',
                        zIndex: 1
                    },
                    {
                        type: 'line',
                        name: 'Lower Band (-2 SD)',
                        data: vwap.lowerBand2,
                        color: this.colors.success,
                        lineWidth: 1,
                        dashStyle: 'Dot',
                        zIndex: 1
                    }
                ],
                credits: { enabled: false }
            });
        }
        
        this.displayVWAPSignal(vwap, prices);
    },
    
    calculateVWAP(prices) {
        const vwapArray = [];
        const upperBand1 = [];
        const upperBand2 = [];
        const lowerBand1 = [];
        const lowerBand2 = [];
        
        let cumulativeTPV = 0;
        let cumulativeVolume = 0;
        const squaredDiffs = [];
        
        for (let i = 0; i < prices.length; i++) {
            const typical = (prices[i].high + prices[i].low + prices[i].close) / 3;
            const tpv = typical * prices[i].volume;
            
            cumulativeTPV += tpv;
            cumulativeVolume += prices[i].volume;
            
            const vwapValue = cumulativeTPV / cumulativeVolume;
            vwapArray.push([prices[i].timestamp, vwapValue]);
            
            squaredDiffs.push(Math.pow(typical - vwapValue, 2) * prices[i].volume);
            const variance = squaredDiffs.reduce((a, b) => a + b, 0) / cumulativeVolume;
            const stdDev = Math.sqrt(variance);
            
            upperBand1.push([prices[i].timestamp, vwapValue + stdDev]);
            upperBand2.push([prices[i].timestamp, vwapValue + 2 * stdDev]);
            lowerBand1.push([prices[i].timestamp, vwapValue - stdDev]);
            lowerBand2.push([prices[i].timestamp, vwapValue - 2 * stdDev]);
        }
        
        return { vwap: vwapArray, upperBand1, upperBand2, lowerBand1, lowerBand2 };
    },
    
    displayVWAPSignal(vwap, prices) {
        if (!vwap.vwap.length) {
            document.getElementById('vwapSignal').textContent = 'Not enough data';
            return;
        }
        
        const lastPrice = prices[prices.length - 1].close;
        const lastVWAP = vwap.vwap[vwap.vwap.length - 1][1];
        const lastUpper1 = vwap.upperBand1[vwap.upperBand1.length - 1][1];
        const lastLower1 = vwap.lowerBand1[vwap.lowerBand1.length - 1][1];
        
        let signal = 'neutral';
        let text = `Price: ${this.formatCurrency(lastPrice)}, VWAP: ${this.formatCurrency(lastVWAP)} - `;
        
        if (lastPrice > lastVWAP) {
            signal = 'bullish';
            text += 'Price above VWAP - Bullish (Institutional Support)';
        } else if (lastPrice < lastVWAP) {
            signal = 'bearish';
            text += 'Price below VWAP - Bearish (Institutional Resistance)';
        } else {
            text += 'Price at VWAP - Fair Value';
        }
        
        if (lastPrice > lastUpper1) {
            text += ' | Overbought (Above +1 SD)';
        } else if (lastPrice < lastLower1) {
            text += ' | Oversold (Below -1 SD)';
        }
        
        const signalBox = document.getElementById('vwapSignal');
        signalBox.className = `signal-box ${signal}`;
        signalBox.textContent = text;
    },

    // ============================================
    // CONSOLIDATED TRADING SIGNALS
    // ============================================
    
    generateConsolidatedSignals() {
        const prices = this.stockData.prices;
        const signals = [];
        
        const stochastic = this.calculateStochastic(prices);
        const williams = this.calculateWilliams(prices);
        const adxData = this.calculateADX(prices);
        const sar = this.calculateSAR(prices);
        const obv = this.calculateOBV(prices);
        const vwap = this.calculateVWAP(prices);
        const ichimoku = this.calculateIchimoku(prices);
        
        if (stochastic.k.length > 0) {
            const lastK = stochastic.k[stochastic.k.length - 1][1];
            let stochasticSignal = 0;
            if (lastK < 20) stochasticSignal = 1;
            else if (lastK > 80) stochasticSignal = -1;
            signals.push({ name: 'Stochastic', value: lastK.toFixed(2), signal: stochasticSignal });
        }
        
        if (williams.length > 0) {
            const lastWilliams = williams[williams.length - 1][1];
            let williamsSignal = 0;
            if (lastWilliams < -80) williamsSignal = 1;
            else if (lastWilliams > -20) williamsSignal = -1;
            signals.push({ name: 'Williams %R', value: lastWilliams.toFixed(2), signal: williamsSignal });
        }
        
        let adxSignal = 0;
        let adxValue = 'N/A';
        if (adxData.adx.length > 0 && adxData.plusDI.length > 0 && adxData.minusDI.length > 0) {
            const lastADX = adxData.adx[adxData.adx.length - 1][1];
            const lastPlusDI = adxData.plusDI[adxData.plusDI.length - 1][1];
            const lastMinusDI = adxData.minusDI[adxData.minusDI.length - 1][1];
            adxValue = lastADX.toFixed(2);
            if (lastADX > 25) {
                if (lastPlusDI > lastMinusDI) adxSignal = 1;
                else adxSignal = -1;
            }
        }
        signals.push({ name: 'ADX', value: adxValue, signal: adxSignal });
        
        if (sar.length > 0) {
            const lastPrice = prices[prices.length - 1].close;
            const lastSAR = sar[sar.length - 1][1];
            const sarSignal = lastPrice > lastSAR ? 1 : -1;
            signals.push({ name: 'Parabolic SAR', value: this.formatCurrency(lastSAR), signal: sarSignal });
        }
        
        if (obv.length >= 20) {
            const recentOBV = obv.slice(-20);
            const obvTrend = recentOBV[recentOBV.length - 1][1] - recentOBV[0][1];
            const obvSignal = obvTrend > 0 ? 1 : obvTrend < 0 ? -1 : 0;
            signals.push({ name: 'OBV', value: obvTrend > 0 ? 'Rising' : obvTrend < 0 ? 'Falling' : 'Flat', signal: obvSignal });
        }
        
        if (vwap.vwap.length > 0) {
            const lastPrice = prices[prices.length - 1].close;
            const lastVWAP = vwap.vwap[vwap.vwap.length - 1][1];
            const vwapSignal = lastPrice > lastVWAP ? 1 : lastPrice < lastVWAP ? -1 : 0;
            signals.push({ name: 'VWAP', value: this.formatCurrency(lastVWAP), signal: vwapSignal });
        }
        
        if (ichimoku.spanA.length > 0 && ichimoku.spanB.length > 0) {
            const lastPrice = prices[prices.length - 1].close;
            const lastCloudTop = Math.max(
                ichimoku.spanA[ichimoku.spanA.length - 1]?.[1] || 0,
                ichimoku.spanB[ichimoku.spanB.length - 1]?.[1] || 0
            );
            const lastCloudBottom = Math.min(
                ichimoku.spanA[ichimoku.spanA.length - 1]?.[1] || Infinity,
                ichimoku.spanB[ichimoku.spanB.length - 1]?.[1] || Infinity
            );
            
            let ichimokuSignal = 0;
            let ichimokuValue = 'In Cloud';
            
            if (lastPrice > lastCloudTop) {
                ichimokuSignal = 1;
                ichimokuValue = 'Above Cloud';
            } else if (lastPrice < lastCloudBottom) {
                ichimokuSignal = -1;
                ichimokuValue = 'Below Cloud';
            }
            
            signals.push({ name: 'Ichimoku Cloud', value: ichimokuValue, signal: ichimokuSignal });
        }
        
        if (signals.length > 0) {
            const totalSignal = signals.reduce((sum, s) => sum + s.signal, 0);
            const maxSignal = signals.length;
            const signalPercentage = ((totalSignal + maxSignal) / (2 * maxSignal)) * 100;
            
            this.displayConsolidatedSignals(signals, signalPercentage);
        }
    },
    
    displayConsolidatedSignals(signals, signalPercentage) {
        const gaugeValue = document.getElementById('gaugeValue');
        const gaugeFill = document.getElementById('gaugeFill');
        
        let signalText = '';
        let signalClass = '';
        
        if (signalPercentage >= 80) {
            signalText = 'STRONG BUY';
            signalClass = 'strong-buy';
        } else if (signalPercentage >= 60) {
            signalText = 'BUY';
            signalClass = 'buy';
        } else if (signalPercentage >= 40) {
            signalText = 'NEUTRAL';
            signalClass = 'neutral';
        } else if (signalPercentage >= 20) {
            signalText = 'SELL';
            signalClass = 'sell';
        } else {
            signalText = 'STRONG SELL';
            signalClass = 'strong-sell';
        }
        
        gaugeValue.textContent = signalText;
        gaugeValue.className = `gauge-value ${signalClass}`;
        gaugeFill.style.width = `${signalPercentage}%`;
        
        const breakdown = document.getElementById('signalsBreakdown');
        breakdown.innerHTML = signals.map(s => {
            let badgeClass = 'neutral';
            let badgeText = 'NEUTRAL';
            
            if (s.signal > 0) {
                badgeClass = 'buy';
                badgeText = 'BUY';
            } else if (s.signal < 0) {
                badgeClass = 'sell';
                badgeText = 'SELL';
            }
            
            return `
                <div class='signal-row'>
                    <span class='signal-indicator-name'>${s.name}</span>
                    <span class='signal-indicator-value'>${s.value}</span>
                    <span class='signal-badge ${badgeClass}'>${badgeText}</span>
                </div>
            `;
        }).join('');
    },
    
    // ============================================
    // UTILITY FUNCTIONS
    // ============================================
    
    generateDemoData(symbol) {
        console.log('📊 Generating demo data for', symbol);
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
                changePercent: ((price - 100) / 100) * 100
            }
        };
    },
    
    formatCurrency(value) {
        if (!value && value !== 0) return 'N/A';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: this.stockData?.currency || 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    },
    
    showLoading(show) {
        const loader = document.getElementById('loadingIndicator');
        if (loader) {
            if (show) {
                loader.classList.remove('hidden');
            } else {
                loader.classList.add('hidden');
            }
        }
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
        
        const updateElement = document.getElementById('lastUpdate');
        if (updateElement) {
            updateElement.textContent = `Last update: ${formatted}`;
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Advanced Analysis - Initializing...');
    AdvancedAnalysis.init();
});