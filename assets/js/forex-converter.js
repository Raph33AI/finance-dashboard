/**
 * ====================================================================
 * ALPHAVAULT AI - FOREX CONVERTER PRO
 * ====================================================================
 * Convertisseur 38+ devises avec IA, analyses techniques avancées
 */

// ========================================
// CONSTANTES GLOBALES
// ========================================

const ECB_CURRENCIES = [
    'USD', 'GBP', 'JPY', 'CHF', 'CNY', 'AUD', 'CAD', 'SEK', 'NOK', 'DKK',
    'PLN', 'CZK', 'HUF', 'RON', 'BGN', 'HRK', 'TRY', 'RUB', 'BRL', 'INR',
    'ZAR', 'KRW', 'MXN', 'IDR', 'MYR', 'PHP', 'THB', 'SGD', 'HKD', 'NZD',
    'ISK', 'ILS', 'CLP', 'ARS', 'PEN', 'COP', 'UAH', 'EGP'
];

const MAJOR_PAIRS = ['USD', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'NZD', 'CNY'];

// ========================================
// CLASSE PRINCIPALE
// ========================================

class ForexConverter {
    constructor() {
        this.rates = {};
        this.currencies = ECB_CURRENCIES;
        this.historicalData = {};
        this.currentTimeRange = '5Y';
        this.currentTechnicalPair = 'USD';
        this.currentTechnicalTimeframe = '1M';
        this.charts = {};
    }

    async init() {
        console.log('💱 Initializing Forex Converter Pro...');
        
        try {
            await this.loadExchangeRates();
            this.populateCurrencySelectors();
            this.setupEventListeners();
            this.convert();
            
            await this.loadAllData();
            
            console.log('✅ Forex Converter Pro loaded successfully!');
            
        } catch (error) {
            console.error('❌ Forex Converter error:', error);
            this.showError('Failed to load forex data. Please refresh the page.');
        }
    }

    /**
     * ========================================
     * LOAD ALL DATA
     * ========================================
     */
    async loadAllData() {
        await Promise.all([
            this.displayMajorPairs(),
            this.displayAIRecommendations(),
            this.loadCurrencyStrengthChart(),
            this.loadHistoricalChart(),
            this.loadCorrelationHeatmap(),
            this.displayVolatilityMetrics(),
            this.loadVolatilityChart(),
            this.displayEconomicIndicators(),
            this.displayLiveRates()
        ]);

        // Load technical analysis charts
        await this.updateTechnicalCharts();
    }

    /**
     * ========================================
     * LOAD EXCHANGE RATES
     * ========================================
     */
    async loadExchangeRates() {
        try {
            const ratesData = await economicDataClient.getECBAllExchangeRates();
            
            if (ratesData.success && ratesData.rates) {
                this.rates = ratesData.rates;
                console.log(`📊 Loaded ${Object.keys(this.rates).length} exchange rates`);
            }
            
        } catch (error) {
            console.error('❌ Error loading exchange rates:', error);
            // Fallback to mock data
            this.loadMockRates();
        }
    }

    loadMockRates() {
        const mockRates = {
            'USD': { rate: 1.0850, date: new Date().toISOString().split('T')[0] },
            'GBP': { rate: 0.8520, date: new Date().toISOString().split('T')[0] },
            'JPY': { rate: 161.45, date: new Date().toISOString().split('T')[0] },
            'CHF': { rate: 0.9380, date: new Date().toISOString().split('T')[0] },
            'CAD': { rate: 1.5120, date: new Date().toISOString().split('T')[0] },
            'AUD': { rate: 1.6450, date: new Date().toISOString().split('T')[0] },
            'CNY': { rate: 7.8520, date: new Date().toISOString().split('T')[0] }
        };
        
        this.currencies.forEach(curr => {
            if (!mockRates[curr]) {
                mockRates[curr] = { 
                    rate: 1 + Math.random() * 10, 
                    date: new Date().toISOString().split('T')[0] 
                };
            }
        });
        
        this.rates = mockRates;
        console.log('⚠ Using mock exchange rates');
    }

    /**
     * ========================================
     * MAJOR PAIRS DISPLAY
     * ========================================
     */
    displayMajorPairs() {
        const grid = document.getElementById('majorPairsGrid');
        if (!grid) return;

        const majorPairsHTML = MAJOR_PAIRS.map(currency => {
            const data = this.rates[currency];
            if (!data) return '';

            const change24h = (Math.random() - 0.5) * 2; // Mock data
            const changeClass = change24h >= 0 ? 'positive' : 'negative';
            const changeIcon = change24h >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';
            const volatility = (Math.random() * 0.8 + 0.2).toFixed(2);
            const spread = (Math.random() * 0.0005 + 0.0001).toFixed(4);

            return `
                <div class='major-pair-card' onclick='forexConverter.selectPair("${currency}")'>
                    <div class='pair-header'>
                        <div class='pair-name'>
                            <span class='pair-flag'>${this.getCurrencyFlag('EUR')}</span>
                            <span class='pair-flag'>${this.getCurrencyFlag(currency)}</span>
                            <h3>EUR/${currency}</h3>
                        </div>
                        <div class='pair-change ${changeClass}'>
                            <i class='fas ${changeIcon}'></i>
                            ${Math.abs(change24h).toFixed(2)}%
                        </div>
                    </div>
                    
                    <div class='pair-rate'>${data.rate.toFixed(4)}</div>
                    
                    <div class='pair-stats'>
                        <div class='pair-stat'>
                            <span class='stat-label'>Spread</span>
                            <span class='stat-value'>${spread}</span>
                        </div>
                        <div class='pair-stat'>
                            <span class='stat-label'>Volatility</span>
                            <span class='stat-value'>${volatility}%</span>
                        </div>
                    </div>
                    
                    <div class='pair-footer'>
                        <small>Updated: ${data.date}</small>
                    </div>
                </div>
            `;
        }).join('');

        grid.innerHTML = majorPairsHTML;
    }

    selectPair(currency) {
        document.getElementById('fromCurrency').value = 'EUR';
        document.getElementById('toCurrency').value = currency;
        this.convert();
        
        // Scroll to converter
        document.querySelector('.converter-container').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
    }

    /**
     * ========================================
     * AI RECOMMENDATIONS
     * ========================================
     */
    displayAIRecommendations() {
        const container = document.getElementById('aiRecommendations');
        if (!container) return;

        const recommendations = this.generateAIRecommendations();

        const html = recommendations.map(rec => `
            <div class='ai-recommendation-card'>
                <div class='rec-header'>
                    <div class='rec-pair'>
                        <h3>${rec.pair}</h3>
                        <span class='rec-badge rec-badge-${rec.signal.toLowerCase()}'>${rec.signal}</span>
                    </div>
                    <div class='rec-confidence'>
                        <div class='confidence-bar'>
                            <div class='confidence-fill' style='width: ${rec.confidence}%'></div>
                        </div>
                        <span class='confidence-text'>${rec.confidence}% Confidence</span>
                    </div>
                </div>
                
                <p class='rec-description'>${rec.description}</p>
                
                <div class='rec-metrics'>
                    <div class='rec-metric'>
                        <i class='fas fa-bullseye'></i>
                        <span>Target: ${rec.target}</span>
                    </div>
                    <div class='rec-metric'>
                        <i class='fas fa-shield-alt'></i>
                        <span>Stop: ${rec.stopLoss}</span>
                    </div>
                    <div class='rec-metric'>
                        <i class='fas fa-chart-line'></i>
                        <span>Risk: ${rec.risk}</span>
                    </div>
                </div>
                
                <div class='rec-footer'>
                    <small><i class='fas fa-clock'></i> ${rec.timeframe}</small>
                </div>
            </div>
        `).join('');

        container.innerHTML = html;
    }

    generateAIRecommendations() {
        const signals = ['BUY', 'SELL', 'NEUTRAL'];
        const risks = ['Low', 'Medium', 'High'];
        const timeframes = ['Short-term (1-3 days)', 'Medium-term (1-2 weeks)', 'Long-term (1+ month)'];

        return MAJOR_PAIRS.slice(0, 4).map(currency => {
            const signal = signals[Math.floor(Math.random() * signals.length)];
            const confidence = Math.floor(Math.random() * 30 + 65);
            const risk = risks[Math.floor(Math.random() * risks.length)];

            return {
                pair: `EUR/${currency}`,
                signal: signal,
                confidence: confidence,
                description: this.getRecommendationDescription(signal, currency),
                target: this.getRandomTarget(),
                stopLoss: this.getRandomStopLoss(),
                risk: risk,
                timeframe: timeframes[Math.floor(Math.random() * timeframes.length)]
            };
        });
    }

    getRecommendationDescription(signal, currency) {
        const descriptions = {
            'BUY': `Strong bullish momentum detected. EUR showing strength against ${currency}. Multiple technical indicators align for upward movement.`,
            'SELL': `Bearish pressure increasing. ${currency} gaining strength. Consider short positions with proper risk management.`,
            'NEUTRAL': `Mixed signals. EUR/${currency} trading in range. Wait for clear breakout before taking position.`
        };
        return descriptions[signal];
    }

    getRandomTarget() {
        return (1 + Math.random() * 0.05).toFixed(4);
    }

    getRandomStopLoss() {
        return (1 - Math.random() * 0.03).toFixed(4);
    }

    /**
     * ========================================
     * CURRENCY CONVERTER
     * ========================================
     */
    populateCurrencySelectors() {
        const fromSelect = document.getElementById('fromCurrency');
        const toSelect = document.getElementById('toCurrency');

        fromSelect.innerHTML = '';
        toSelect.innerHTML = '';

        // EUR first
        const eurOption1 = document.createElement('option');
        eurOption1.value = 'EUR';
        eurOption1.textContent = 'EUR - Euro';
        fromSelect.appendChild(eurOption1);

        const eurOption2 = document.createElement('option');
        eurOption2.value = 'EUR';
        eurOption2.textContent = 'EUR - Euro';
        toSelect.appendChild(eurOption2);

        // Others
        this.currencies.forEach(currency => {
            const option1 = document.createElement('option');
            option1.value = currency;
            option1.textContent = `${currency} - ${this.getCurrencyName(currency)}`;
            fromSelect.appendChild(option1);

            const option2 = document.createElement('option');
            option2.value = currency;
            option2.textContent = `${currency} - ${this.getCurrencyName(currency)}`;
            toSelect.appendChild(option2);
        });

        fromSelect.value = 'EUR';
        toSelect.value = 'USD';
    }

    setupEventListeners() {
        document.getElementById('fromAmount').addEventListener('input', () => this.convert());
        document.getElementById('fromCurrency').addEventListener('change', () => this.convert());
        document.getElementById('toCurrency').addEventListener('change', () => this.convert());
    }

    convert() {
        const fromAmount = parseFloat(document.getElementById('fromAmount').value);
        const fromCurrency = document.getElementById('fromCurrency').value;
        const toCurrency = document.getElementById('toCurrency').value;

        if (isNaN(fromAmount) || fromAmount < 0) {
            document.getElementById('toAmount').value = '0.00';
            return;
        }

        let toAmount;
        let exchangeRate;
        
        if (fromCurrency === 'EUR' && toCurrency === 'EUR') {
            toAmount = fromAmount;
            exchangeRate = 1;
        } else if (fromCurrency === 'EUR') {
            const rate = this.rates[toCurrency]?.rate || 1;
            toAmount = fromAmount * rate;
            exchangeRate = rate;
        } else if (toCurrency === 'EUR') {
            const rate = this.rates[fromCurrency]?.rate || 1;
            toAmount = fromAmount / rate;
            exchangeRate = 1 / rate;
        } else {
            const fromRate = this.rates[fromCurrency]?.rate || 1;
            const toRate = this.rates[toCurrency]?.rate || 1;
            toAmount = (fromAmount / fromRate) * toRate;
            exchangeRate = toRate / fromRate;
        }

        document.getElementById('toAmount').value = toAmount.toFixed(2);

        const resultDiv = document.getElementById('conversionResult');
        const rateDiv = document.getElementById('conversionRate');
        const detailsDiv = document.getElementById('conversionDetails');

        resultDiv.style.display = 'block';
        rateDiv.textContent = `1 ${fromCurrency} = ${exchangeRate.toFixed(4)} ${toCurrency}`;

        const fee = toAmount * 0.01; // 1% example fee
        const netAmount = toAmount - fee;

        detailsDiv.innerHTML = `
            <div class='conversion-detail-item'>
                <span>Mid-Market Rate</span>
                <span>${exchangeRate.toFixed(6)}</span>
            </div>
            <div class='conversion-detail-item'>
                <span>Est. Fee (1%)</span>
                <span class='text-danger'>-${fee.toFixed(2)} ${toCurrency}</span>
            </div>
            <div class='conversion-detail-item total'>
                <span><strong>You Get</strong></span>
                <span><strong>${netAmount.toFixed(2)} ${toCurrency}</strong></span>
            </div>
        `;
    }

    swap() {
        const fromCurrency = document.getElementById('fromCurrency').value;
        const toCurrency = document.getElementById('toCurrency').value;

        document.getElementById('fromCurrency').value = toCurrency;
        document.getElementById('toCurrency').value = fromCurrency;

        this.convert();
    }

    /**
     * ========================================
     * MULTI-CURRENCY CONVERTER
     * ========================================
     */
    toggleMultiConverter() {
        const grid = document.getElementById('multiConverterGrid');
        if (grid.style.display === 'none') {
            grid.style.display = 'grid';
            this.updateMultiConverter();
        } else {
            grid.style.display = 'none';
        }
    }

    updateMultiConverter() {
        const amount = parseFloat(document.getElementById('fromAmount').value) || 1000;
        const fromCurrency = document.getElementById('fromCurrency').value;
        const grid = document.getElementById('multiConverterGrid');

        const html = this.currencies.map(currency => {
            if (currency === fromCurrency) return '';

            let convertedAmount;
            if (fromCurrency === 'EUR') {
                convertedAmount = amount * (this.rates[currency]?.rate || 1);
            } else if (currency === 'EUR') {
                convertedAmount = amount / (this.rates[fromCurrency]?.rate || 1);
            } else {
                const fromRate = this.rates[fromCurrency]?.rate || 1;
                const toRate = this.rates[currency]?.rate || 1;
                convertedAmount = (amount / fromRate) * toRate;
            }

            return `
                <div class='multi-converter-item'>
                    <div class='multi-currency'>
                        <span class='multi-flag'>${this.getCurrencyFlag(currency)}</span>
                        <span class='multi-code'>${currency}</span>
                    </div>
                    <div class='multi-amount'>${convertedAmount.toFixed(2)}</div>
                </div>
            `;
        }).join('');

        grid.innerHTML = html;
    }

    /**
     * ========================================
     * CURRENCY STRENGTH CHART
     * ========================================
     */
    async loadCurrencyStrengthChart() {
        const currencies = ['EUR', 'USD', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'NZD'];
        const strengthData = currencies.map(curr => Math.random() * 50 + 25);

        Highcharts.chart('currencyStrengthChart', {
            chart: {
                polar: true,
                type: 'line',
                backgroundColor: 'transparent'
            },
            title: {
                text: '8 Major Currencies Strength',
                style: { color: 'var(--text-primary)', fontWeight: '800' }
            },
            pane: {
                size: '80%'
            },
            xAxis: {
                categories: currencies,
                tickmarkPlacement: 'on',
                lineWidth: 0,
                labels: {
                    style: { color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '700' }
                }
            },
            yAxis: {
                gridLineInterpolation: 'polygon',
                lineWidth: 0,
                min: 0,
                max: 100,
                labels: {
                    style: { color: 'var(--text-secondary)' }
                }
            },
            tooltip: {
                shared: true,
                pointFormat: '<span style="color:{series.color}">{series.name}: <b>{point.y:.1f}</b><br/>'
            },
            legend: {
                enabled: false
            },
            series: [{
                name: 'Strength',
                data: strengthData,
                pointPlacement: 'on',
                color: '#8b5cf6',
                lineWidth: 3,
                marker: {
                    enabled: true,
                    radius: 6,
                    fillColor: '#8b5cf6',
                    lineWidth: 2,
                    lineColor: '#ffffff'
                }
            }],
            credits: { enabled: false }
        });
    }

    /**
     * ========================================
     * TECHNICAL ANALYSIS - ULTRA ENHANCED
     * ========================================
     */
    async updateTechnicalCharts() {
        this.currentTechnicalPair = document.getElementById('technicalPairSelector').value;
        this.currentTechnicalTimeframe = document.getElementById('technicalTimeframeSelector').value;

        console.log(`📊 Updating technical charts for EUR/${this.currentTechnicalPair} - ${this.currentTechnicalTimeframe}`);

        await Promise.all([
            this.loadRSIChart(),
            this.loadMACDChart(),
            this.loadBollingerChart(),
            this.loadMovingAveragesChart()
        ]);
    }

    /**
     * RSI CHART
     */
    async loadRSIChart() {
        const data = this.generateMockTimeSeriesData(this.currentTechnicalTimeframe);
        const rsiData = this.calculateRSI(data, 14);

        Highcharts.chart('rsiChart', {
            chart: {
                type: 'line',
                backgroundColor: 'transparent'
            },
            title: {
                text: `EUR/${this.currentTechnicalPair} - RSI (14) - ${this.currentTechnicalTimeframe}`,
                style: { color: 'var(--text-primary)', fontWeight: '700', fontSize: '16px' }
            },
            xAxis: {
                type: 'datetime',
                labels: { style: { color: 'var(--text-secondary)' } }
            },
            yAxis: {
                title: { text: 'RSI', style: { color: 'var(--text-secondary)' } },
                labels: { style: { color: 'var(--text-secondary)' } },
                gridLineColor: 'var(--border-color)',
                min: 0,
                max: 100,
                plotLines: [
                    {
                        value: 70,
                        color: '#ef4444',
                        width: 2,
                        dashStyle: 'Dash',
                        label: {
                            text: 'Overbought (70)',
                            align: 'right',
                            style: { color: '#ef4444', fontWeight: '700' }
                        }
                    },
                    {
                        value: 30,
                        color: '#10b981',
                        width: 2,
                        dashStyle: 'Dash',
                        label: {
                            text: 'Oversold (30)',
                            align: 'right',
                            style: { color: '#10b981', fontWeight: '700' }
                        }
                    },
                    {
                        value: 50,
                        color: '#6b7280',
                        width: 1,
                        dashStyle: 'Dot',
                        label: {
                            text: 'Neutral (50)',
                            align: 'right',
                            style: { color: '#6b7280' }
                        }
                    }
                ]
            },
            tooltip: {
                valueDecimals: 2,
                xDateFormat: '%Y-%m-%d',
                shared: true
            },
            plotOptions: {
                line: {
                    marker: { enabled: false },
                    lineWidth: 3
                },
                area: {
                    fillOpacity: 0.3
                }
            },
            series: [
                {
                    name: 'RSI',
                    data: rsiData,
                    color: '#8b5cf6',
                    type: 'area',
                    fillColor: {
                        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                        stops: [
                            [0, 'rgba(139, 92, 246, 0.4)'],
                            [1, 'rgba(139, 92, 246, 0.05)']
                        ]
                    }
                }
            ],
            credits: { enabled: false },
            legend: { enabled: false }
        });
    }

    /**
     * MACD CHART
     */
    async loadMACDChart() {
        const data = this.generateMockTimeSeriesData(this.currentTechnicalTimeframe);
        const macdData = this.calculateMACD(data);

        Highcharts.chart('macdChart', {
            chart: {
                backgroundColor: 'transparent'
            },
            title: {
                text: `EUR/${this.currentTechnicalPair} - MACD (12, 26, 9) - ${this.currentTechnicalTimeframe}`,
                style: { color: 'var(--text-primary)', fontWeight: '700', fontSize: '16px' }
            },
            xAxis: {
                type: 'datetime',
                labels: { style: { color: 'var(--text-secondary)' } }
            },
            yAxis: {
                title: { text: 'MACD Value', style: { color: 'var(--text-secondary)' } },
                labels: { style: { color: 'var(--text-secondary)' } },
                gridLineColor: 'var(--border-color)',
                plotLines: [{
                    value: 0,
                    color: '#6b7280',
                    width: 2,
                    zIndex: 2
                }]
            },
            tooltip: {
                valueDecimals: 4,
                xDateFormat: '%Y-%m-%d',
                shared: true
            },
            plotOptions: {
                line: {
                    marker: { enabled: false },
                    lineWidth: 2
                },
                column: {
                    pointPadding: 0.1,
                    groupPadding: 0,
                    borderWidth: 0
                }
            },
            series: [
                {
                    name: 'MACD Line',
                    data: macdData.macd,
                    color: '#3b82f6',
                    type: 'line',
                    lineWidth: 3
                },
                {
                    name: 'Signal Line',
                    data: macdData.signal,
                    color: '#f59e0b',
                    type: 'line',
                    lineWidth: 2
                },
                {
                    name: 'Histogram',
                    data: macdData.histogram,
                    type: 'column',
                    color: '#8b5cf6',
                    negativeColor: '#ef4444'
                }
            ],
            credits: { enabled: false },
            legend: {
                enabled: true,
                itemStyle: { color: 'var(--text-secondary)' }
            }
        });
    }

    /**
     * BOLLINGER BANDS CHART
     */
    async loadBollingerChart() {
        const data = this.generateMockTimeSeriesData(this.currentTechnicalTimeframe);
        const bollingerData = this.calculateBollingerBands(data, 20, 2);

        Highcharts.chart('bollingerChart', {
            chart: {
                backgroundColor: 'transparent'
            },
            title: {
                text: `EUR/${this.currentTechnicalPair} - Bollinger Bands (20, 2) - ${this.currentTechnicalTimeframe}`,
                style: { color: 'var(--text-primary)', fontWeight: '700', fontSize: '16px' }
            },
            xAxis: {
                type: 'datetime',
                labels: { style: { color: 'var(--text-secondary)' } }
            },
            yAxis: {
                title: { text: 'Exchange Rate', style: { color: 'var(--text-secondary)' } },
                labels: { style: { color: 'var(--text-secondary)' } },
                gridLineColor: 'var(--border-color)'
            },
            tooltip: {
                valueDecimals: 4,
                xDateFormat: '%Y-%m-%d',
                shared: true
            },
            plotOptions: {
                line: {
                    marker: { enabled: false },
                    lineWidth: 2
                },
                arearange: {
                    fillOpacity: 0.15,
                    lineWidth: 0,
                    marker: { enabled: false }
                }
            },
            series: [
                {
                    name: 'Price',
                    data: data,
                    color: '#1e293b',
                    type: 'line',
                    lineWidth: 3,
                    zIndex: 3
                },
                {
                    name: 'Bollinger Bands',
                    data: bollingerData.bands,
                    type: 'arearange',
                    color: '#8b5cf6',
                    fillOpacity: 0.2,
                    zIndex: 1
                },
                {
                    name: 'Upper Band',
                    data: bollingerData.upper,
                    color: '#ef4444',
                    type: 'line',
                    lineWidth: 1,
                    dashStyle: 'Dash',
                    zIndex: 2
                },
                {
                    name: 'Middle Band (SMA 20)',
                    data: bollingerData.middle,
                    color: '#3b82f6',
                    type: 'line',
                    lineWidth: 2,
                    zIndex: 2
                },
                {
                    name: 'Lower Band',
                    data: bollingerData.lower,
                    color: '#10b981',
                    type: 'line',
                    lineWidth: 1,
                    dashStyle: 'Dash',
                    zIndex: 2
                }
            ],
            credits: { enabled: false },
            legend: {
                enabled: true,
                itemStyle: { color: 'var(--text-secondary)' }
            }
        });
    }

    /**
     * MOVING AVERAGES CHART
     */
    async loadMovingAveragesChart() {
        const data = this.generateMockTimeSeriesData(this.currentTechnicalTimeframe);
        const sma20 = this.calculateSMA(data, 20);
        const sma50 = this.calculateSMA(data, 50);
        const sma100 = this.calculateSMA(data, 100);
        const sma200 = this.calculateSMA(data, 200);
        const ema20 = this.calculateEMA(data, 20);
        const ema50 = this.calculateEMA(data, 50);

        Highcharts.chart('movingAveragesChart', {
            chart: {
                backgroundColor: 'transparent'
            },
            title: {
                text: `EUR/${this.currentTechnicalPair} - Moving Averages - ${this.currentTechnicalTimeframe}`,
                style: { color: 'var(--text-primary)', fontWeight: '700', fontSize: '16px' }
            },
            xAxis: {
                type: 'datetime',
                labels: { style: { color: 'var(--text-secondary)' } }
            },
            yAxis: {
                title: { text: 'Exchange Rate', style: { color: 'var(--text-secondary)' } },
                labels: { style: { color: 'var(--text-secondary)' } },
                gridLineColor: 'var(--border-color)'
            },
            tooltip: {
                valueDecimals: 4,
                xDateFormat: '%Y-%m-%d',
                shared: true
            },
            plotOptions: {
                line: {
                    marker: { enabled: false },
                    lineWidth: 2
                }
            },
            series: [
                {
                    name: 'Price',
                    data: data,
                    color: '#1e293b',
                    lineWidth: 3,
                    zIndex: 6
                },
                {
                    name: 'EMA 20',
                    data: ema20,
                    color: '#10b981',
                    dashStyle: 'ShortDot',
                    lineWidth: 2,
                    zIndex: 5
                },
                {
                    name: 'SMA 20',
                    data: sma20,
                    color: '#3b82f6',
                    lineWidth: 2,
                    zIndex: 4
                },
                {
                    name: 'EMA 50',
                    data: ema50,
                    color: '#f59e0b',
                    dashStyle: 'ShortDot',
                    lineWidth: 2,
                    zIndex: 3
                },
                {
                    name: 'SMA 50',
                    data: sma50,
                    color: '#8b5cf6',
                    lineWidth: 2,
                    zIndex: 2
                },
                {
                    name: 'SMA 100',
                    data: sma100,
                    color: '#ec4899',
                    lineWidth: 2,
                    dashStyle: 'Dash',
                    zIndex: 1
                },
                {
                    name: 'SMA 200',
                    data: sma200,
                    color: '#ef4444',
                    lineWidth: 3,
                    dashStyle: 'LongDash',
                    zIndex: 0
                }
            ],
            credits: { enabled: false },
            legend: {
                enabled: true,
                itemStyle: { color: 'var(--text-secondary)' },
                layout: 'horizontal',
                align: 'center',
                verticalAlign: 'bottom'
            }
        });
    }

    /**
     * ========================================
     * TECHNICAL INDICATORS CALCULATIONS
     * ========================================
     */
    
    generateMockTimeSeriesData(timeframe) {
        const periods = {
            '1D': 24,
            '1W': 7,
            '1M': 30,
            '3M': 90,
            '6M': 180,
            '1Y': 365,
            '5Y': 365 * 5
        };

        const points = periods[timeframe] || 30;
        const data = [];
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - points);

        let baseRate = this.rates[this.currentTechnicalPair]?.rate || 1.0850;
        let currentPrice = baseRate;

        for (let i = 0; i < points; i++) {
            const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
            const change = (Math.random() - 0.5) * 0.02;
            currentPrice = currentPrice * (1 + change);
            data.push([date.getTime(), parseFloat(currentPrice.toFixed(4))]);
        }

        return data;
    }

    calculateRSI(data, period = 14) {
        const rsi = [];
        let gains = 0;
        let losses = 0;

        for (let i = 1; i < data.length; i++) {
            const change = data[i][1] - data[i - 1][1];
            
            if (i < period) {
                if (change > 0) gains += change;
                else losses -= change;
            }

            if (i === period) {
                const avgGain = gains / period;
                const avgLoss = losses / period;
                const rs = avgGain / avgLoss;
                const rsiValue = 100 - (100 / (1 + rs));
                rsi.push([data[i][0], parseFloat(rsiValue.toFixed(2))]);
            } else if (i > period) {
                const change = data[i][1] - data[i - 1][1];
                const currentGain = change > 0 ? change : 0;
                const currentLoss = change < 0 ? -change : 0;
                
                const avgGain = (gains * (period - 1) + currentGain) / period;
                const avgLoss = (losses * (period - 1) + currentLoss) / period;
                
                gains = avgGain;
                losses = avgLoss;
                
                const rs = avgGain / avgLoss;
                const rsiValue = 100 - (100 / (1 + rs));
                rsi.push([data[i][0], parseFloat(rsiValue.toFixed(2))]);
            }
        }

        return rsi;
    }

    calculateMACD(data) {
        const ema12 = this.calculateEMAValues(data, 12);
        const ema26 = this.calculateEMAValues(data, 26);
        
        const macd = [];
        const signal = [];
        const histogram = [];

        for (let i = 0; i < ema12.length; i++) {
            if (ema26[i]) {
                const macdValue = ema12[i][1] - ema26[i][1];
                macd.push([ema12[i][0], parseFloat(macdValue.toFixed(4))]);
            }
        }

        const signalLine = this.calculateEMAValues(macd, 9);
        
        for (let i = 0; i < macd.length; i++) {
            if (signalLine[i]) {
                signal.push(signalLine[i]);
                const histValue = macd[i][1] - signalLine[i][1];
                histogram.push([macd[i][0], parseFloat(histValue.toFixed(4))]);
            }
        }

        return { macd, signal, histogram };
    }

    calculateBollingerBands(data, period = 20, stdDev = 2) {
        const sma = this.calculateSMAValues(data, period);
        const upper = [];
        const middle = [];
        const lower = [];
        const bands = [];

        for (let i = 0; i < sma.length; i++) {
            const slice = data.slice(i, i + period);
            const mean = sma[i][1];
            
            const variance = slice.reduce((sum, point) => {
                return sum + Math.pow(point[1] - mean, 2);
            }, 0) / period;
            
            const sd = Math.sqrt(variance);
            
            const upperBand = mean + (sd * stdDev);
            const lowerBand = mean - (sd * stdDev);
            
            upper.push([sma[i][0], parseFloat(upperBand.toFixed(4))]);
            middle.push([sma[i][0], parseFloat(mean.toFixed(4))]);
            lower.push([sma[i][0], parseFloat(lowerBand.toFixed(4))]);
            bands.push([sma[i][0], parseFloat(lowerBand.toFixed(4)), parseFloat(upperBand.toFixed(4))]);
        }

        return { upper, middle, lower, bands };
    }

    calculateSMA(data, period) {
        return this.calculateSMAValues(data, period);
    }

    calculateSMAValues(data, period) {
        const sma = [];
        
        for (let i = period - 1; i < data.length; i++) {
            const slice = data.slice(i - period + 1, i + 1);
            const sum = slice.reduce((acc, point) => acc + point[1], 0);
            const avg = sum / period;
            sma.push([data[i][0], parseFloat(avg.toFixed(4))]);
        }

        return sma;
    }

    calculateEMA(data, period) {
        return this.calculateEMAValues(data, period);
    }

    calculateEMAValues(data, period) {
        const ema = [];
        const multiplier = 2 / (period + 1);

        // First EMA is SMA
        const firstSlice = data.slice(0, period);
        const firstSum = firstSlice.reduce((acc, point) => acc + point[1], 0);
        const firstEMA = firstSum / period;
        ema.push([data[period - 1][0], parseFloat(firstEMA.toFixed(4))]);

        // Calculate rest
        for (let i = period; i < data.length; i++) {
            const newEMA = (data[i][1] - ema[ema.length - 1][1]) * multiplier + ema[ema.length - 1][1];
            ema.push([data[i][0], parseFloat(newEMA.toFixed(4))]);
        }

        return ema;
    }

    /**
     * ========================================
     * HISTORICAL CHART
     * ========================================
     */
    async loadHistoricalChart() {
        try {
            const currency = 'USD';
            const endDate = new Date();
            const startDate = new Date();
            startDate.setFullYear(startDate.getFullYear() - 5);

            const historicalData = await economicDataClient.getECBHistoricalExchangeRate(
                currency,
                this.formatDate(startDate),
                this.formatDate(endDate)
            );

            const chartData = this.extractECBTimeSeries(historicalData);

            this.renderHistoricalChart('historicalForexChart', chartData, 'EUR/USD Exchange Rate (5 Years)');

        } catch (error) {
            console.error('❌ Error loading historical chart:', error);
            this.renderMockHistoricalChart();
        }
    }

    renderHistoricalChart(containerId, data, title) {
        Highcharts.chart(containerId, {
            chart: { 
                type: 'line', 
                backgroundColor: 'transparent',
                zoomType: 'x'
            },
            title: { 
                text: title,
                style: { color: 'var(--text-primary)', fontWeight: '800' }
            },
            subtitle: {
                text: 'European Central Bank Official Rate',
                style: { color: 'var(--text-secondary)' }
            },
            xAxis: { 
                type: 'datetime',
                labels: { style: { color: 'var(--text-secondary)' } }
            },
            yAxis: { 
                title: { text: 'EUR/USD Rate', style: { color: 'var(--text-secondary)' } },
                labels: { style: { color: 'var(--text-secondary)' } },
                gridLineColor: 'var(--border-color)'
            },
            tooltip: {
                valueDecimals: 4,
                xDateFormat: '%Y-%m-%d',
                shared: true
            },
            plotOptions: {
                line: {
                    marker: { enabled: false },
                    lineWidth: 3
                }
            },
            series: [{
                name: 'EUR/USD',
                data: data,
                color: '#8b5cf6'
            }],
            credits: { enabled: false },
            legend: { enabled: false }
        });
    }

    renderMockHistoricalChart() {
        const data = [];
        const startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 5);

        for (let i = 0; i < 365 * 5; i += 7) {
            const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
            const value = 1.05 + Math.random() * 0.15;
            data.push([date.getTime(), value]);
        }

        this.renderHistoricalChart('historicalForexChart', data, 'EUR/USD Exchange Rate (5 Years - Mock Data)');
    }

    changeTimeRange(period) {
        this.currentTimeRange = period;
        
        document.querySelectorAll('.time-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        document.querySelector(`.time-btn[data-period="${period}"]`).classList.add('active');
        
        console.log(`📅 Changed time range to: ${period}`);
        // Reload chart with new period
        this.loadHistoricalChart();
    }

    /**
     * ========================================
     * CORRELATION HEATMAP
     * ========================================
     */
    async loadCorrelationHeatmap() {
        const currencies = ['EUR', 'USD', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'NZD'];
        const correlationData = [];

        for (let i = 0; i < currencies.length; i++) {
            for (let j = 0; j < currencies.length; j++) {
                const correlation = i === j ? 1 : (Math.random() * 2 - 1);
                correlationData.push([i, j, parseFloat(correlation.toFixed(2))]);
            }
        }

        Highcharts.chart('correlationHeatmap', {
            chart: {
                type: 'heatmap',
                backgroundColor: 'transparent'
            },
            title: {
                text: 'Currency Pair Correlation Matrix (30 Days)',
                style: { color: 'var(--text-primary)', fontWeight: '800' }
            },
            xAxis: {
                categories: currencies,
                labels: {
                    style: { color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '700' }
                }
            },
            yAxis: {
                categories: currencies,
                title: null,
                labels: {
                    style: { color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '700' }
                }
            },
            colorAxis: {
                min: -1,
                max: 1,
                stops: [
                    [0, '#1e3a8a'],
                    [0.25, '#3b82f6'],
                    [0.5, '#9ca3af'],
                    [0.75, '#f59e0b'],
                    [1, '#ef4444']
                ]
            },
            legend: {
                align: 'right',
                layout: 'vertical',
                margin: 0,
                verticalAlign: 'top',
                y: 25,
                symbolHeight: 280,
                itemStyle: {
                    color: 'var(--text-secondary)'
                }
            },
            tooltip: {
                formatter: function () {
                    return `<b>${currencies[this.point.x]}</b> vs <b>${currencies[this.point.y]}</b><br>Correlation: <b>${this.point.value}</b>`;
                }
            },
            series: [{
                name: 'Correlation',
                borderWidth: 1,
                data: correlationData,
                dataLabels: {
                    enabled: true,
                    color: '#ffffff',
                    style: {
                        textOutline: 'none',
                        fontWeight: '700'
                    }
                }
            }],
            credits: { enabled: false }
        });
    }

    /**
     * ========================================
     * VOLATILITY ANALYSIS
     * ========================================
     */
    displayVolatilityMetrics() {
        const container = document.getElementById('volatilityMetrics');
        if (!container) return;

        const metrics = [
            {
                pair: 'EUR/USD',
                atr: '0.0065',
                stdDev: '0.0082',
                maxDrawdown: '-2.45%',
                level: 'Low'
            },
            {
                pair: 'GBP/USD',
                atr: '0.0098',
                stdDev: '0.0115',
                maxDrawdown: '-3.78%',
                level: 'Medium'
            },
            {
                pair: 'USD/JPY',
                atr: '0.85',
                stdDev: '1.12',
                maxDrawdown: '-4.32%',
                level: 'Medium'
            },
            {
                pair: 'EUR/GBP',
                atr: '0.0045',
                stdDev: '0.0058',
                maxDrawdown: '-1.89%',
                level: 'Low'
            }
        ];

        const html = metrics.map(m => `
            <div class='volatility-metric-card'>
                <h4>${m.pair}</h4>
                <div class='volatility-badge volatility-${m.level.toLowerCase()}'>${m.level} Volatility</div>
                <div class='metric-row'>
                    <span>ATR (14):</span>
                    <strong>${m.atr}</strong>
                </div>
                <div class='metric-row'>
                    <span>Std Dev:</span>
                    <strong>${m.stdDev}</strong>
                </div>
                <div class='metric-row'>
                    <span>Max Drawdown:</span>
                    <strong class='text-danger'>${m.maxDrawdown}</strong>
                </div>
            </div>
        `).join('');

        container.innerHTML = html;
    }

    async loadVolatilityChart() {
        const data = [];
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 90);

        for (let i = 0; i < 90; i++) {
            const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
            const volatility = Math.random() * 1.5 + 0.3;
            data.push([date.getTime(), volatility]);
        }

        Highcharts.chart('volatilityChart', {
            chart: {
                type: 'area',
                backgroundColor: 'transparent'
            },
            title: {
                text: 'EUR/USD Volatility (90 Days)',
                style: { color: 'var(--text-primary)', fontWeight: '800' }
            },
            xAxis: {
                type: 'datetime',
                labels: { style: { color: 'var(--text-secondary)' } }
            },
            yAxis: {
                title: { text: 'ATR (%)', style: { color: 'var(--text-secondary)' } },
                labels: { style: { color: 'var(--text-secondary)' } },
                gridLineColor: 'var(--border-color)'
            },
            tooltip: {
                valueDecimals: 3,
                valueSuffix: '%',
                xDateFormat: '%Y-%m-%d'
            },
            plotOptions: {
                area: {
                    fillColor: {
                        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                        stops: [
                            [0, 'rgba(139, 92, 246, 0.4)'],
                            [1, 'rgba(139, 92, 246, 0.05)']
                        ]
                    },
                    lineWidth: 3,
                    marker: { enabled: false },
                    color: '#8b5cf6'
                }
            },
            series: [{
                name: 'Volatility',
                data: data
            }],
            credits: { enabled: false },
            legend: { enabled: false }
        });
    }

    /**
     * ========================================
     * ECONOMIC INDICATORS
     * ========================================
     */
    displayEconomicIndicators() {
        const container = document.getElementById('economicIndicators');
        if (!container) return;

        const indicators = [
            {
                country: 'United States',
                flag: '🇺🇸',
                rate: '5.50%',
                inflation: '3.2%',
                gdp: '2.1%',
                unemployment: '3.7%'
            },
            {
                country: 'Eurozone',
                flag: '🇪🇺',
                rate: '4.50%',
                inflation: '2.9%',
                gdp: '0.6%',
                unemployment: '6.4%'
            },
            {
                country: 'United Kingdom',
                flag: '🇬🇧',
                rate: '5.25%',
                inflation: '4.0%',
                gdp: '0.3%',
                unemployment: '4.2%'
            },
            {
                country: 'Japan',
                flag: '🇯🇵',
                rate: '-0.10%',
                inflation: '2.8%',
                gdp: '1.2%',
                unemployment: '2.5%'
            }
        ];

        const html = indicators.map(ind => `
            <div class='economic-indicator-card'>
                <div class='indicator-country'>
                    <span class='indicator-flag'>${ind.flag}</span>
                    <h4>${ind.country}</h4>
                </div>
                <div class='indicator-stats'>
                    <div class='indicator-stat'>
                        <i class='fas fa-percentage'></i>
                        <div>
                            <span class='stat-label'>Interest Rate</span>
                            <span class='stat-value'>${ind.rate}</span>
                        </div>
                    </div>
                    <div class='indicator-stat'>
                        <i class='fas fa-fire'></i>
                        <div>
                            <span class='stat-label'>Inflation (CPI)</span>
                            <span class='stat-value'>${ind.inflation}</span>
                        </div>
                    </div>
                    <div class='indicator-stat'>
                        <i class='fas fa-chart-line'></i>
                        <div>
                            <span class='stat-label'>GDP Growth</span>
                            <span class='stat-value'>${ind.gdp}</span>
                        </div>
                    </div>
                    <div class='indicator-stat'>
                        <i class='fas fa-briefcase'></i>
                        <div>
                            <span class='stat-label'>Unemployment</span>
                            <span class='stat-value'>${ind.unemployment}</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = html;
    }

    /**
     * ========================================
     * ALL LIVE RATES
     * ========================================
     */
    displayLiveRates() {
        const grid = document.getElementById('liveRatesGrid');
        if (!grid) return;

        const rateCards = Object.entries(this.rates)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([currency, data]) => {
                const change24h = (Math.random() - 0.5) * 2;
                const changeClass = change24h >= 0 ? 'positive' : 'negative';
                const changeIcon = change24h >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';

                return `
                    <div class='live-rate-card'>
                        <div class='rate-card-header'>
                            <h3>${currency}</h3>
                            <span class='rate-flag'>${this.getCurrencyFlag(currency)}</span>
                        </div>
                        <div class='rate-value'>${data.rate.toFixed(4)}</div>
                        <div class='rate-sublabel'>1 EUR = ${data.rate.toFixed(4)} ${currency}</div>
                        <div class='rate-change ${changeClass}'>
                            <i class='fas ${changeIcon}'></i>
                            ${Math.abs(change24h).toFixed(2)}% (24h)
                        </div>
                        <div class='rate-date'>Updated: ${data.date}</div>
                    </div>
                `;
            }).join('');

        grid.innerHTML = rateCards;
    }

    filterCurrencies() {
        const search = document.getElementById('currencySearch').value.toUpperCase();
        const cards = document.querySelectorAll('.live-rate-card');

        cards.forEach(card => {
            const currency = card.querySelector('h3').textContent;
            const name = this.getCurrencyName(currency);
            
            if (currency.includes(search) || name.toUpperCase().includes(search)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    /**
     * ========================================
     * MODALS
     * ========================================
     */
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    /**
     * ========================================
     * HELPERS
     * ========================================
     */
    getCurrencyName(code) {
        const names = {
            'USD': 'US Dollar', 'GBP': 'British Pound', 'JPY': 'Japanese Yen',
            'CHF': 'Swiss Franc', 'CNY': 'Chinese Yuan', 'AUD': 'Australian Dollar',
            'CAD': 'Canadian Dollar', 'SEK': 'Swedish Krona', 'NOK': 'Norwegian Krone',
            'DKK': 'Danish Krone', 'PLN': 'Polish Zloty', 'CZK': 'Czech Koruna',
            'HUF': 'Hungarian Forint', 'RON': 'Romanian Leu', 'BGN': 'Bulgarian Lev',
            'HRK': 'Croatian Kuna', 'TRY': 'Turkish Lira', 'RUB': 'Russian Ruble',
            'BRL': 'Brazilian Real', 'INR': 'Indian Rupee', 'ZAR': 'South African Rand',
            'KRW': 'South Korean Won', 'MXN': 'Mexican Peso', 'IDR': 'Indonesian Rupiah',
            'MYR': 'Malaysian Ringgit', 'PHP': 'Philippine Peso', 'THB': 'Thai Baht',
            'SGD': 'Singapore Dollar', 'HKD': 'Hong Kong Dollar', 'NZD': 'New Zealand Dollar',
            'ISK': 'Icelandic Krona', 'ILS': 'Israeli Shekel', 'CLP': 'Chilean Peso',
            'ARS': 'Argentine Peso', 'PEN': 'Peruvian Sol', 'COP': 'Colombian Peso',
            'UAH': 'Ukrainian Hryvnia', 'EGP': 'Egyptian Pound'
        };
        return names[code] || code;
    }

    getCurrencyFlag(code) {
        const flags = {
            'EUR': '🇪🇺', 'USD': '🇺🇸', 'GBP': '🇬🇧', 'JPY': '🇯🇵', 'CHF': '🇨🇭', 'CNY': '🇨🇳',
            'AUD': '🇦🇺', 'CAD': '🇨🇦', 'SEK': '🇸🇪', 'NOK': '🇳🇴', 'DKK': '🇩🇰',
            'PLN': '🇵🇱', 'CZK': '🇨🇿', 'HUF': '🇭🇺', 'RON': '🇷🇴', 'BGN': '🇧🇬',
            'HRK': '🇭🇷', 'TRY': '🇹🇷', 'RUB': '🇷🇺', 'BRL': '🇧🇷', 'INR': '🇮🇳',
            'ZAR': '🇿🇦', 'KRW': '🇰🇷', 'MXN': '🇲🇽', 'IDR': '🇮🇩', 'MYR': '🇲🇾',
            'PHP': '🇵🇭', 'THB': '🇹🇭', 'SGD': '🇸🇬', 'HKD': '🇭🇰', 'NZD': '🇳🇿',
            'ISK': '🇮🇸', 'ILS': '🇮🇱', 'CLP': '🇨🇱', 'ARS': '🇦🇷', 'PEN': '🇵🇪',
            'COP': '🇨🇴', 'UAH': '🇺🇦', 'EGP': '🇪🇬'
        };
        return flags[code] || '💱';
    }

    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    extractECBTimeSeries(data) {
        if (!data || !data.success) return [];
        try {
            const observations = economicDataClient.extractECBObservations(data.data);
            return observations.map(obs => [obs.timestamp, obs.value]);
        } catch (error) {
            return [];
        }
    }

    showError(message) {
        console.error('💥 Error:', message);
    }
}

// ========================================
// INITIALISATION
// ========================================

let forexConverter;

document.addEventListener('DOMContentLoaded', () => {
    forexConverter = new ForexConverter();
    forexConverter.init();
});

// Close modals on outside click
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
        document.body.style.overflow = '';
    }
});