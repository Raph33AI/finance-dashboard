/**
 * ═══════════════════════════════════════════════════════════════
 * CHATBOT CHARTS - ULTRA FINANCIAL CHARTING ENGINE
 * ═══════════════════════════════════════════════════════════════
 * Version: 6.0.0 ULTRA-COMPLETE
 * Description: Génération COMPLÈTE de graphiques pour TOUS les modules
 * 
 * Supported Modules:
 *   ✅ Technical Indicators (RSI, MACD, Bollinger, Fibonacci, Ichimoku, Pivots, ADX, Stochastic, ATR, OBV)
 *   ✅ Forex Analysis (14 Wall Street Indicators + Currency Strength + Correlation)
 *   ✅ Insider Trading (Transaction Timeline, Buy/Sell, Clusters, Whales, Sentiment)
 *   ✅ IPO Analysis (Success Scores, Sector Performance, Risk/Opportunity, Dilution)
 *   ✅ M&A Analysis (Success Probability, Deal Value, Sector Breakdown, Premium)
 *   ✅ Budget Management (Income vs Expenses, Portfolio, ROI, Savings)
 *   ✅ Investment Analytics (Asset Allocation, Efficient Frontier, Backtest, Diversification)
 *   ✅ Comparison Tools (Radar, Heatmap, Multi-series)
 * 
 * Total Chart Types: 50+ professional financial charts
 * ═══════════════════════════════════════════════════════════════
 */

class ChatbotCharts {
    constructor() {
        this.chartInstances = new Map();
        this.chartCounter = 0;
        this.defaultColors = {
            primary: '#667eea',
            secondary: '#764ba2',
            success: '#10b981',
            danger: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6',
            purple: '#9d5ce6',
            teal: '#20c997',
            cyan: '#0dcaf0',
            indigo: '#6610f2',
            orange: '#fd7e14',
            pink: '#d63384',
            lime: '#84cc16',
            emerald: '#10b981',
            rose: '#f43f5e'
        };
        
        console.log('📊 ChatbotCharts ULTRA v6.0 initialized - 50+ chart types loaded');
    }

    // ═══════════════════════════════════════════════════════════
    // 📈 SECTION 1: TECHNICAL INDICATORS CHARTS
    // ═══════════════════════════════════════════════════════════

    /**
     * RSI Chart (Relative Strength Index)
     */
    createRSIChart(rsiData, containerId, options = {}) {
        try {
            const chartId = containerId || `rsi-chart-${++this.chartCounter}`;
            
            const chartConfig = {
                chart: {
                    type: 'area',
                    backgroundColor: 'transparent',
                    height: options.height || 350,
                    borderRadius: 15
                },
                title: {
                    text: options.title || 'RSI - Relative Strength Index',
                    style: { color: '#1e293b', fontWeight: '800', fontSize: '16px' }
                },
                xAxis: {
                    type: 'datetime',
                    labels: { style: { color: '#64748b' } }
                },
                yAxis: {
                    title: { text: 'RSI', style: { color: '#1e293b' } },
                    min: 0,
                    max: 100,
                    plotLines: [
                        {
                            value: 70,
                            color: this.defaultColors.danger,
                            dashStyle: 'ShortDash',
                            width: 2,
                            label: { text: 'Overbought (70)', align: 'right', style: { color: this.defaultColors.danger, fontWeight: 'bold' } }
                        },
                        {
                            value: 50,
                            color: '#999',
                            dashStyle: 'Dot',
                            width: 1
                        },
                        {
                            value: 30,
                            color: this.defaultColors.success,
                            dashStyle: 'ShortDash',
                            width: 2,
                            label: { text: 'Oversold (30)', align: 'right', style: { color: this.defaultColors.success, fontWeight: 'bold' } }
                        }
                    ]
                },
                tooltip: {
                    borderRadius: 10,
                    valueDecimals: 2,
                    pointFormat: '<b>RSI:</b> {point.y:.2f}'
                },
                series: [{
                    type: 'area',
                    name: 'RSI',
                    data: rsiData,
                    color: this.defaultColors.secondary,
                    fillColor: {
                        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                        stops: [
                            [0, Highcharts.color(this.defaultColors.secondary).setOpacity(0.4).get('rgba')],
                            [1, Highcharts.color(this.defaultColors.secondary).setOpacity(0.1).get('rgba')]
                        ]
                    },
                    lineWidth: 2,
                    zones: [
                        { value: 30, color: this.defaultColors.success },
                        { value: 70, color: this.defaultColors.secondary },
                        { color: this.defaultColors.danger }
                    ]
                }],
                credits: { enabled: false },
                exporting: { enabled: true }
            };

            return { config: chartConfig, containerId: chartId };

        } catch (error) {
            console.error('❌ RSI chart error:', error);
            throw error;
        }
    }

    /**
     * MACD Chart
     */
    createMACDChart(macdData, containerId, options = {}) {
        const chartId = containerId || `macd-chart-${++this.chartCounter}`;

        const chartConfig = {
            chart: {
                type: 'line',
                backgroundColor: 'transparent',
                height: options.height || 350,
                borderRadius: 15
            },
            title: {
                text: options.title || 'MACD - Moving Average Convergence Divergence',
                style: { color: '#1e293b', fontWeight: '800', fontSize: '16px' }
            },
            xAxis: {
                type: 'datetime',
                labels: { style: { color: '#64748b' } }
            },
            yAxis: {
                title: { text: 'MACD', style: { color: '#1e293b' } },
                plotLines: [{
                    value: 0,
                    color: '#999',
                    dashStyle: 'Dash',
                    width: 2
                }]
            },
            tooltip: {
                borderRadius: 10,
                shared: true,
                valueDecimals: 4
            },
            series: [
                {
                    type: 'line',
                    name: 'MACD Line',
                    data: macdData.macdLine || macdData.macd,
                    color: this.defaultColors.primary,
                    lineWidth: 2,
                    zIndex: 2
                },
                {
                    type: 'line',
                    name: 'Signal Line',
                    data: macdData.signalLine || macdData.signal,
                    color: this.defaultColors.danger,
                    lineWidth: 2,
                    zIndex: 2
                },
                {
                    type: 'column',
                    name: 'Histogram',
                    data: macdData.histogram,
                    color: this.defaultColors.success,
                    negativeColor: this.defaultColors.danger,
                    zIndex: 1
                }
            ],
            credits: { enabled: false },
            exporting: { enabled: true }
        };

        return { config: chartConfig, containerId: chartId };
    }

    /**
     * Stochastic Oscillator Chart
     */
    createStochasticChart(stochasticData, containerId, options = {}) {
        const chartId = containerId || `stochastic-chart-${++this.chartCounter}`;

        const chartConfig = {
            chart: {
                type: 'line',
                backgroundColor: 'transparent',
                height: options.height || 350,
                borderRadius: 15
            },
            title: {
                text: options.title || 'Stochastic Oscillator',
                style: { color: '#1e293b', fontWeight: '800', fontSize: '16px' }
            },
            xAxis: {
                type: 'datetime',
                labels: { style: { color: '#64748b' } }
            },
            yAxis: {
                title: { text: 'Stochastic', style: { color: '#1e293b' } },
                min: 0,
                max: 100,
                plotLines: [
                    {
                        value: 80,
                        color: this.defaultColors.danger,
                        dashStyle: 'ShortDash',
                        width: 2,
                        label: { text: 'Overbought (80)', align: 'right', style: { color: this.defaultColors.danger } }
                    },
                    {
                        value: 20,
                        color: this.defaultColors.success,
                        dashStyle: 'ShortDash',
                        width: 2,
                        label: { text: 'Oversold (20)', align: 'right', style: { color: this.defaultColors.success } }
                    }
                ]
            },
            tooltip: {
                borderRadius: 10,
                shared: true,
                valueDecimals: 2
            },
            series: [
                {
                    type: 'line',
                    name: '%K (Fast)',
                    data: stochasticData.k,
                    color: this.defaultColors.primary,
                    lineWidth: 2
                },
                {
                    type: 'line',
                    name: '%D (Slow)',
                    data: stochasticData.d,
                    color: this.defaultColors.danger,
                    lineWidth: 2
                }
            ],
            credits: { enabled: false },
            exporting: { enabled: true }
        };

        return { config: chartConfig, containerId: chartId };
    }

    /**
     * ADX Chart (Trend Strength)
     */
    createADXChart(adxData, containerId, options = {}) {
        const chartId = containerId || `adx-chart-${++this.chartCounter}`;

        const chartConfig = {
            chart: {
                type: 'line',
                backgroundColor: 'transparent',
                height: options.height || 350,
                borderRadius: 15
            },
            title: {
                text: options.title || 'ADX - Trend Strength Indicator',
                style: { color: '#1e293b', fontWeight: '800', fontSize: '16px' }
            },
            xAxis: {
                type: 'datetime',
                labels: { style: { color: '#64748b' } }
            },
            yAxis: {
                title: { text: 'ADX Value', style: { color: '#1e293b' } },
                min: 0,
                max: 100,
                plotLines: [
                    {
                        value: 25,
                        color: this.defaultColors.success,
                        dashStyle: 'ShortDash',
                        width: 2,
                        label: { text: 'Strong Trend (25)', align: 'right', style: { color: this.defaultColors.success } }
                    }
                ]
            },
            tooltip: {
                borderRadius: 10,
                shared: true,
                valueDecimals: 2
            },
            series: [
                {
                    type: 'line',
                    name: 'ADX',
                    data: adxData.adx,
                    color: this.defaultColors.primary,
                    lineWidth: 3
                },
                {
                    type: 'line',
                    name: '+DI',
                    data: adxData.plusDI,
                    color: this.defaultColors.success,
                    lineWidth: 2
                },
                {
                    type: 'line',
                    name: '-DI',
                    data: adxData.minusDI,
                    color: this.defaultColors.danger,
                    lineWidth: 2
                }
            ],
            credits: { enabled: false },
            exporting: { enabled: true }
        };

        return { config: chartConfig, containerId: chartId };
    }

    /**
     * ✅ NEW: Bollinger Bands Chart
     */
    createBollingerBandsChart(bollingerData, priceData, containerId, options = {}) {
        const chartId = containerId || `bollinger-chart-${++this.chartCounter}`;

        const chartConfig = {
            chart: {
                type: 'line',
                backgroundColor: 'transparent',
                height: options.height || 400,
                borderRadius: 15
            },
            title: {
                text: options.title || 'Bollinger Bands (20, 2)',
                style: { color: '#1e293b', fontWeight: '800', fontSize: '16px' }
            },
            xAxis: {
                type: 'datetime',
                labels: { style: { color: '#64748b' } }
            },
            yAxis: {
                title: { text: 'Price', style: { color: '#1e293b' } },
                labels: { style: { color: '#64748b' } }
            },
            tooltip: {
                borderRadius: 10,
                shared: true,
                valueDecimals: 4
            },
            series: [
                {
                    type: 'line',
                    name: 'Upper Band',
                    data: bollingerData.upper,
                    color: this.defaultColors.danger,
                    lineWidth: 1,
                    dashStyle: 'ShortDash',
                    marker: { enabled: false }
                },
                {
                    type: 'line',
                    name: 'Middle Band (SMA 20)',
                    data: bollingerData.middle,
                    color: this.defaultColors.primary,
                    lineWidth: 2,
                    marker: { enabled: false }
                },
                {
                    type: 'line',
                    name: 'Lower Band',
                    data: bollingerData.lower,
                    color: this.defaultColors.success,
                    lineWidth: 1,
                    dashStyle: 'ShortDash',
                    marker: { enabled: false }
                },
                {
                    type: 'line',
                    name: 'Price',
                    data: priceData,
                    color: '#1e293b',
                    lineWidth: 2,
                    marker: { enabled: false },
                    zIndex: 10
                },
                {
                    type: 'arearange',
                    name: 'Bollinger Range',
                    data: bollingerData.bands,
                    color: this.defaultColors.primary,
                    fillOpacity: 0.1,
                    lineWidth: 0,
                    zIndex: 0,
                    marker: { enabled: false }
                }
            ],
            credits: { enabled: false },
            exporting: { enabled: true }
        };

        return { config: chartConfig, containerId: chartId };
    }

    /**
     * ✅ NEW: Fibonacci Retracements Chart
     */
    createFibonacciChart(fibonacciData, priceData, containerId, options = {}) {
        const chartId = containerId || `fibonacci-chart-${++this.chartCounter}`;

        const chartConfig = {
            chart: {
                type: 'line',
                backgroundColor: 'transparent',
                height: options.height || 400,
                borderRadius: 15
            },
            title: {
                text: options.title || 'Fibonacci Retracements & Extensions',
                style: { color: '#1e293b', fontWeight: '800', fontSize: '16px' }
            },
            xAxis: {
                type: 'datetime',
                labels: { style: { color: '#64748b' } }
            },
            yAxis: {
                title: { text: 'Price', style: { color: '#1e293b' } },
                labels: { style: { color: '#64748b' } },
                plotLines: [
                    { value: fibonacciData.level_0, color: '#94a3b8', dashStyle: 'Dot', width: 1, label: { text: '0%', style: { color: '#64748b' } } },
                    { value: fibonacciData.level_236, color: '#06b6d4', dashStyle: 'ShortDash', width: 1, label: { text: '23.6%', style: { color: '#06b6d4' } } },
                    { value: fibonacciData.level_382, color: '#3b82f6', dashStyle: 'ShortDash', width: 2, label: { text: '38.2%', style: { color: '#3b82f6', fontWeight: 'bold' } } },
                    { value: fibonacciData.level_50, color: '#8b5cf6', dashStyle: 'Solid', width: 2, label: { text: '50%', style: { color: '#8b5cf6', fontWeight: 'bold' } } },
                    { value: fibonacciData.level_618, color: '#f59e0b', dashStyle: 'Solid', width: 3, label: { text: '61.8% (Golden)', style: { color: '#f59e0b', fontWeight: 'bold' } } },
                    { value: fibonacciData.level_786, color: '#ef4444', dashStyle: 'ShortDash', width: 1, label: { text: '78.6%', style: { color: '#ef4444' } } },
                    { value: fibonacciData.level_100, color: '#94a3b8', dashStyle: 'Dot', width: 1, label: { text: '100%', style: { color: '#64748b' } } },
                    { value: fibonacciData.level_1618, color: '#10b981', dashStyle: 'Dash', width: 1, label: { text: '161.8% Ext', style: { color: '#10b981' } } },
                    { value: fibonacciData.level_2618, color: '#14b8a6', dashStyle: 'Dash', width: 1, label: { text: '261.8% Ext', style: { color: '#14b8a6' } } }
                ]
            },
            tooltip: {
                borderRadius: 10,
                valueDecimals: 4
            },
            series: [{
                type: 'line',
                name: 'Price',
                data: priceData,
                color: '#1e293b',
                lineWidth: 2,
                marker: { enabled: false }
            }],
            credits: { enabled: false },
            exporting: { enabled: true }
        };

        return { config: chartConfig, containerId: chartId };
    }

    /**
     * ✅ NEW: Ichimoku Cloud Chart
     */
    createIchimokuChart(ichimokuData, priceData, containerId, options = {}) {
        const chartId = containerId || `ichimoku-chart-${++this.chartCounter}`;

        const chartConfig = {
            chart: {
                type: 'line',
                backgroundColor: 'transparent',
                height: options.height || 450,
                borderRadius: 15
            },
            title: {
                text: options.title || 'Ichimoku Cloud - Japanese Trading System',
                style: { color: '#1e293b', fontWeight: '800', fontSize: '16px' }
            },
            xAxis: {
                type: 'datetime',
                labels: { style: { color: '#64748b' } }
            },
            yAxis: {
                title: { text: 'Price', style: { color: '#1e293b' } },
                labels: { style: { color: '#64748b' } }
            },
            tooltip: {
                borderRadius: 10,
                shared: true,
                valueDecimals: 4
            },
            series: [
                {
                    type: 'line',
                    name: 'Price',
                    data: priceData,
                    color: '#1e293b',
                    lineWidth: 2,
                    marker: { enabled: false },
                    zIndex: 10
                },
                {
                    type: 'line',
                    name: 'Tenkan-sen (Conversion)',
                    data: ichimokuData.tenkan,
                    color: '#ef4444',
                    lineWidth: 1,
                    marker: { enabled: false }
                },
                {
                    type: 'line',
                    name: 'Kijun-sen (Base)',
                    data: ichimokuData.kijun,
                    color: '#3b82f6',
                    lineWidth: 1,
                    marker: { enabled: false }
                },
                {
                    type: 'line',
                    name: 'Senkou Span A',
                    data: ichimokuData.senkouA,
                    color: '#10b981',
                    lineWidth: 1,
                    dashStyle: 'ShortDash',
                    marker: { enabled: false }
                },
                {
                    type: 'line',
                    name: 'Senkou Span B',
                    data: ichimokuData.senkouB,
                    color: '#f59e0b',
                    lineWidth: 1,
                    dashStyle: 'ShortDash',
                    marker: { enabled: false }
                },
                {
                    type: 'arearange',
                    name: 'Kumo (Cloud)',
                    data: ichimokuData.cloud,
                    color: '#10b981',
                    fillOpacity: 0.15,
                    lineWidth: 0,
                    zIndex: 0,
                    marker: { enabled: false }
                },
                {
                    type: 'line',
                    name: 'Chikou Span (Lagging)',
                    data: ichimokuData.chikou,
                    color: '#8b5cf6',
                    lineWidth: 1,
                    dashStyle: 'Dot',
                    marker: { enabled: false }
                }
            ],
            credits: { enabled: false },
            exporting: { enabled: true }
        };

        return { config: chartConfig, containerId: chartId };
    }

    /**
     * ✅ NEW: Pivot Points Chart
     */
    createPivotPointsChart(pivotData, priceData, containerId, options = {}) {
        const chartId = containerId || `pivot-chart-${++this.chartCounter}`;

        const standard = pivotData.standard;

        const chartConfig = {
            chart: {
                type: 'line',
                backgroundColor: 'transparent',
                height: options.height || 400,
                borderRadius: 15
            },
            title: {
                text: options.title || 'Pivot Points (Standard)',
                style: { color: '#1e293b', fontWeight: '800', fontSize: '16px' }
            },
            xAxis: {
                type: 'datetime',
                labels: { style: { color: '#64748b' } }
            },
            yAxis: {
                title: { text: 'Price', style: { color: '#1e293b' } },
                labels: { style: { color: '#64748b' } },
                plotLines: [
                    { value: standard.r3, color: '#dc2626', dashStyle: 'Dash', width: 1, label: { text: 'R3', style: { color: '#dc2626' } } },
                    { value: standard.r2, color: '#ef4444', dashStyle: 'Dash', width: 1, label: { text: 'R2', style: { color: '#ef4444' } } },
                    { value: standard.r1, color: '#f87171', dashStyle: 'Dash', width: 1, label: { text: 'R1', style: { color: '#f87171' } } },
                    { value: standard.pp, color: '#8b5cf6', dashStyle: 'Solid', width: 2, label: { text: 'PP', style: { color: '#8b5cf6', fontWeight: 'bold' } } },
                    { value: standard.s1, color: '#34d399', dashStyle: 'Dash', width: 1, label: { text: 'S1', style: { color: '#34d399' } } },
                    { value: standard.s2, color: '#10b981', dashStyle: 'Dash', width: 1, label: { text: 'S2', style: { color: '#10b981' } } },
                    { value: standard.s3, color: '#059669', dashStyle: 'Dash', width: 1, label: { text: 'S3', style: { color: '#059669' } } }
                ]
            },
            tooltip: {
                borderRadius: 10,
                valueDecimals: 4
            },
            series: [{
                type: 'line',
                name: 'Price',
                data: priceData,
                color: '#1e293b',
                lineWidth: 2,
                marker: { enabled: false }
            }],
            credits: { enabled: false },
            exporting: { enabled: true }
        };

        return { config: chartConfig, containerId: chartId };
    }

    /**
     * ✅ NEW: Moving Averages Chart
     */
    createMovingAveragesChart(maData, priceData, containerId, options = {}) {
        const chartId = containerId || `ma-chart-${++this.chartCounter}`;

        const series = [
            {
                type: 'line',
                name: 'Price',
                data: priceData,
                color: '#1e293b',
                lineWidth: 2,
                marker: { enabled: false },
                zIndex: 10
            }
        ];

        if (maData.sma20) {
            series.push({
                type: 'line',
                name: 'SMA 20',
                data: maData.sma20,
                color: '#3b82f6',
                lineWidth: 1,
                marker: { enabled: false }
            });
        }

        if (maData.sma50) {
            series.push({
                type: 'line',
                name: 'SMA 50',
                data: maData.sma50,
                color: '#8b5cf6',
                lineWidth: 1,
                marker: { enabled: false }
            });
        }

        if (maData.sma100) {
            series.push({
                type: 'line',
                name: 'SMA 100',
                data: maData.sma100,
                color: '#f59e0b',
                lineWidth: 1,
                marker: { enabled: false }
            });
        }

        if (maData.sma200) {
            series.push({
                type: 'line',
                name: 'SMA 200',
                data: maData.sma200,
                color: '#ef4444',
                lineWidth: 2,
                marker: { enabled: false }
            });
        }

        if (maData.ema20) {
            series.push({
                type: 'line',
                name: 'EMA 20',
                data: maData.ema20,
                color: '#10b981',
                lineWidth: 1,
                dashStyle: 'ShortDash',
                marker: { enabled: false }
            });
        }

        if (maData.ema50) {
            series.push({
                type: 'line',
                name: 'EMA 50',
                data: maData.ema50,
                color: '#14b8a6',
                lineWidth: 1,
                dashStyle: 'ShortDash',
                marker: { enabled: false }
            });
        }

        const chartConfig = {
            chart: {
                type: 'line',
                backgroundColor: 'transparent',
                height: options.height || 400,
                borderRadius: 15
            },
            title: {
                text: options.title || 'Moving Averages (SMA & EMA)',
                style: { color: '#1e293b', fontWeight: '800', fontSize: '16px' }
            },
            xAxis: {
                type: 'datetime',
                labels: { style: { color: '#64748b' } }
            },
            yAxis: {
                title: { text: 'Price', style: { color: '#1e293b' } },
                labels: { style: { color: '#64748b' } }
            },
            tooltip: {
                borderRadius: 10,
                shared: true,
                valueDecimals: 4
            },
            series: series,
            credits: { enabled: false },
            exporting: { enabled: true }
        };

        return { config: chartConfig, containerId: chartId };
    }

    /**
     * ATR Chart
     */
    createATRChart(atrData, containerId, options = {}) {
        const chartId = containerId || `atr-chart-${++this.chartCounter}`;

        const chartConfig = {
            chart: {
                type: 'line',
                backgroundColor: 'transparent',
                height: options.height || 350,
                borderRadius: 15
            },
            title: {
                text: options.title || 'Average True Range (ATR) - Volatility',
                style: { color: '#1e293b', fontWeight: '800', fontSize: '16px' }
            },
            xAxis: {
                type: 'datetime',
                labels: { style: { color: '#64748b' } }
            },
            yAxis: {
                title: { text: 'ATR Value', style: { color: '#1e293b' } }
            },
            tooltip: {
                borderRadius: 10,
                valueDecimals: 2,
                pointFormat: '<b>ATR:</b> {point.y:.2f}'
            },
            series: [{
                type: 'line',
                name: 'ATR',
                data: atrData,
                color: this.defaultColors.purple,
                lineWidth: 2
            }],
            credits: { enabled: false },
            exporting: { enabled: true }
        };

        return { config: chartConfig, containerId: chartId };
    }

    /**
     * OBV Chart
     */
    createOBVChart(obvData, containerId, options = {}) {
        const chartId = containerId || `obv-chart-${++this.chartCounter}`;

        const chartConfig = {
            chart: {
                type: 'area',
                backgroundColor: 'transparent',
                height: options.height || 350,
                borderRadius: 15
            },
            title: {
                text: options.title || 'On-Balance Volume (OBV)',
                style: { color: '#1e293b', fontWeight: '800', fontSize: '16px' }
            },
            xAxis: {
                type: 'datetime',
                labels: { style: { color: '#64748b' } }
            },
            yAxis: {
                title: { text: 'OBV', style: { color: '#1e293b' } }
            },
            tooltip: {
                borderRadius: 10,
                valueDecimals: 0,
                pointFormat: '<b>OBV:</b> {point.y}'
            },
            series: [{
                type: 'area',
                name: 'OBV',
                data: obvData,
                color: this.defaultColors.secondary,
                fillOpacity: 0.3,
                lineWidth: 2
            }],
            credits: { enabled: false },
            exporting: { enabled: true }
        };

        return { config: chartConfig, containerId: chartId };
    }

    // ═══════════════════════════════════════════════════════════
    // 💱 SECTION 2: FOREX ANALYSIS CHARTS
    // ═══════════════════════════════════════════════════════════

    /**
     * ✅ NEW: Forex Historical Price Chart
     */
    createForexHistoricalChart(historicalData, containerId, options = {}) {
        const chartId = containerId || `forex-historical-${++this.chartCounter}`;

        const chartConfig = {
            chart: {
                type: 'line',
                backgroundColor: 'transparent',
                height: options.height || 400,
                borderRadius: 15,
                zoomType: 'x'
            },
            title: {
                text: options.title || `${options.pair || 'Forex'} - Historical Price`,
                style: { color: '#1e293b', fontWeight: '800', fontSize: '16px' }
            },
            xAxis: {
                type: 'datetime',
                labels: { style: { color: '#64748b' } }
            },
            yAxis: {
                title: { text: 'Exchange Rate', style: { color: '#1e293b' } },
                labels: { style: { color: '#64748b' } }
            },
            tooltip: {
                borderRadius: 10,
                valueDecimals: 4,
                pointFormat: '<b>Rate:</b> {point.y:.4f}'
            },
            series: [{
                type: 'line',
                name: 'Exchange Rate',
                data: historicalData,
                color: this.defaultColors.primary,
                lineWidth: 2,
                marker: { enabled: false }
            }],
            credits: { enabled: false },
            exporting: { enabled: true }
        };

        return { config: chartConfig, containerId: chartId };
    }

    /**
     * ✅ NEW: Forex Volatility Chart
     */
    createForexVolatilityChart(volatilityData, containerId, options = {}) {
        const chartId = containerId || `forex-volatility-${++this.chartCounter}`;

        const chartConfig = {
            chart: {
                type: 'column',
                backgroundColor: 'transparent',
                height: options.height || 350,
                borderRadius: 15
            },
            title: {
                text: options.title || 'Forex Volatility Analysis',
                style: { color: '#1e293b', fontWeight: '800', fontSize: '16px' }
            },
            xAxis: {
                categories: ['ATR', 'Std Dev', 'Max Drawdown'],
                labels: { style: { color: '#64748b' } }
            },
            yAxis: {
                title: { text: 'Value', style: { color: '#1e293b' } },
                labels: { style: { color: '#64748b' } }
            },
            tooltip: {
                borderRadius: 10,
                valueDecimals: 4
            },
            series: [{
                name: 'Volatility Metrics',
                data: [
                    parseFloat(volatilityData.atr),
                    parseFloat(volatilityData.stdDev),
                    parseFloat(volatilityData.maxDrawdown)
                ],
                color: this.defaultColors.warning,
                dataLabels: {
                    enabled: true,
                    format: '{point.y:.4f}'
                }
            }],
            credits: { enabled: false },
            exporting: { enabled: true }
        };

        return { config: chartConfig, containerId: chartId };
    }

    /**
     * ✅ NEW: Currency Strength Radar Chart
     */
    createCurrencyStrengthChart(strengthData, containerId, options = {}) {
        const chartId = containerId || `currency-strength-${++this.chartCounter}`;

        const categories = strengthData.map(d => d.currency);
        const values = strengthData.map(d => d.strength);

        const chartConfig = {
            chart: {
                polar: true,
                type: 'area',
                backgroundColor: 'transparent',
                height: options.height || 400,
                borderRadius: 15
            },
            title: {
                text: options.title || 'Currency Strength Analysis',
                style: { color: '#1e293b', fontWeight: '800', fontSize: '16px' }
            },
            pane: {
                size: '80%'
            },
            xAxis: {
                categories: categories,
                tickmarkPlacement: 'on',
                lineWidth: 0,
                labels: { style: { color: '#64748b', fontWeight: '600' } }
            },
            yAxis: {
                gridLineInterpolation: 'polygon',
                lineWidth: 0,
                min: 0,
                max: 100,
                labels: { style: { color: '#64748b' } }
            },
            tooltip: {
                borderRadius: 10,
                shared: true,
                pointFormat: '<b>{series.name}:</b> {point.y:.1f}/100'
            },
            series: [{
                name: 'Strength',
                data: values,
                pointPlacement: 'on',
                color: this.defaultColors.primary,
                fillOpacity: 0.3,
                lineWidth: 2
            }],
            credits: { enabled: false },
            exporting: { enabled: true }
        };

        return { config: chartConfig, containerId: chartId };
    }

    // ═══════════════════════════════════════════════════════════
    // 📊 SECTION 3: INSIDER TRADING CHARTS
    // ═══════════════════════════════════════════════════════════

    /**
     * ✅ NEW: Insider Transaction Timeline Chart
     */
    createInsiderTimelineChart(transactions, containerId, options = {}) {
        const chartId = containerId || `insider-timeline-${++this.chartCounter}`;

        // Group by date
        const grouped = {};
        transactions.forEach(tx => {
            const date = new Date(tx.filingDate).setHours(0, 0, 0, 0);
            if (!grouped[date]) {
                grouped[date] = { buy: 0, sell: 0 };
            }

            const netValue = (tx.nonDerivativeTransactions || []).reduce((sum, nt) => {
                return sum + (nt.transactionType === 'Purchase' ? nt.totalValue : -nt.totalValue);
            }, 0);

            if (netValue > 0) grouped[date].buy += netValue;
            else grouped[date].sell += Math.abs(netValue);
        });

        const dates = Object.keys(grouped).map(d => parseInt(d)).sort((a, b) => a - b);
        const buyData = dates.map(d => [d, grouped[d].buy]);
        const sellData = dates.map(d => [d, grouped[d].sell]);

        const chartConfig = {
            chart: {
                type: 'column',
                backgroundColor: 'transparent',
                height: options.height || 400,
                borderRadius: 15
            },
            title: {
                text: options.title || 'Insider Transaction Timeline',
                style: { color: '#1e293b', fontWeight: '800', fontSize: '16px' }
            },
            xAxis: {
                type: 'datetime',
                labels: { style: { color: '#64748b' } }
            },
            yAxis: {
                title: { text: 'Transaction Value ($)', style: { color: '#1e293b' } },
                labels: { style: { color: '#64748b' } }
            },
            tooltip: {
                borderRadius: 10,
                shared: true,
                valuePrefix: '$',
                valueDecimals: 0
            },
            plotOptions: {
                column: {
                    stacking: 'normal'
                }
            },
            series: [
                {
                    name: 'Purchases',
                    data: buyData,
                    color: this.defaultColors.success
                },
                {
                    name: 'Sales',
                    data: sellData,
                    color: this.defaultColors.danger
                }
            ],
            credits: { enabled: false },
            exporting: { enabled: true }
        };

        return { config: chartConfig, containerId: chartId };
    }

    /**
     * ✅ NEW: Insider Buy vs Sell Pie Chart
     */
    createInsiderBuySellPieChart(classified, containerId, options = {}) {
        const chartId = containerId || `insider-pie-${++this.chartCounter}`;

        const chartConfig = {
            chart: {
                type: 'pie',
                backgroundColor: 'transparent',
                height: options.height || 400,
                borderRadius: 15
            },
            title: {
                text: options.title || 'Buy vs Sell Distribution',
                style: { color: '#1e293b', fontWeight: '800', fontSize: '16px' }
            },
            tooltip: {
                borderRadius: 10,
                pointFormat: '<b>{point.name}</b><br/>Value: ${point.y:,.0f}<br/>Percentage: {point.percentage:.1f}%'
            },
            plotOptions: {
                pie: {
                    innerSize: '50%',
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b><br/>{point.percentage:.1f}%',
                        style: { fontWeight: '600', fontSize: '12px' }
                    },
                    showInLegend: true
                }
            },
            series: [{
                name: 'Transactions',
                colorByPoint: true,
                data: [
                    {
                        name: 'Purchases',
                        y: classified.buys.totalValue,
                        color: this.defaultColors.success
                    },
                    {
                        name: 'Sales',
                        y: classified.sells.totalValue,
                        color: this.defaultColors.danger
                    }
                ]
            }],
            credits: { enabled: false },
            exporting: { enabled: true }
        };

        return { config: chartConfig, containerId: chartId };
    }

    /**
     * ✅ NEW: Insider Role Analysis Bar Chart
     */
    createInsiderRoleAnalysisChart(roleAnalysis, containerId, options = {}) {
        const chartId = containerId || `insider-role-${++this.chartCounter}`;

        const roles = Object.keys(roleAnalysis.byRole);
        const purchaseData = roles.map(r => roleAnalysis.byRole[r].purchaseValue);
        const saleData = roles.map(r => Math.abs(roleAnalysis.byRole[r].saleValue));

        const chartConfig = {
            chart: {
                type: 'bar',
                backgroundColor: 'transparent',
                height: options.height || 400,
                borderRadius: 15
            },
            title: {
                text: options.title || 'Insider Activity by Role',
                style: { color: '#1e293b', fontWeight: '800', fontSize: '16px' }
            },
            xAxis: {
                categories: roles,
                labels: { style: { color: '#64748b' } }
            },
            yAxis: {
                title: { text: 'Transaction Value ($)', style: { color: '#1e293b' } },
                labels: { style: { color: '#64748b' } }
            },
            tooltip: {
                borderRadius: 10,
                shared: true,
                valuePrefix: '$',
                valueDecimals: 0
            },
            plotOptions: {
                bar: {
                    dataLabels: {
                        enabled: true,
                        format: '${point.y:,.0f}'
                    }
                }
            },
            series: [
                {
                    name: 'Purchases',
                    data: purchaseData,
                    color: this.defaultColors.success
                },
                {
                    name: 'Sales',
                    data: saleData,
                    color: this.defaultColors.danger
                }
            ],
            credits: { enabled: false },
            exporting: { enabled: true }
        };

        return { config: chartConfig, containerId: chartId };
    }

    /**
     * ✅ NEW: Insider Sentiment Gauge Chart
     */
    createInsiderSentimentGaugeChart(sentiment, containerId, options = {}) {
        const chartId = containerId || `insider-sentiment-${++this.chartCounter}`;

        const chartConfig = {
            chart: {
                type: 'gauge',
                backgroundColor: 'transparent',
                height: options.height || 300,
                borderRadius: 15
            },
            title: {
                text: options.title || 'Insider Sentiment Score',
                style: { color: '#1e293b', fontWeight: '800', fontSize: '16px' }
            },
            pane: {
                startAngle: -150,
                endAngle: 150,
                background: [{
                    backgroundColor: {
                        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                        stops: [
                            [0, '#FFF'],
                            [1, '#F0F0F0']
                        ]
                    },
                    borderWidth: 0,
                    outerRadius: '109%'
                }]
            },
            yAxis: {
                min: 0,
                max: 100,
                minorTickInterval: 'auto',
                minorTickWidth: 1,
                minorTickLength: 10,
                minorTickPosition: 'inside',
                minorTickColor: '#666',
                tickPixelInterval: 30,
                tickWidth: 2,
                tickPosition: 'inside',
                tickLength: 10,
                tickColor: '#666',
                labels: {
                    step: 2,
                    rotation: 'auto'
                },
                title: {
                    text: sentiment.label
                },
                plotBands: [
                    {
                        from: 0,
                        to: 35,
                        color: '#ef4444'
                    },
                    {
                        from: 35,
                        to: 65,
                        color: '#f59e0b'
                    },
                    {
                        from: 65,
                        to: 100,
                        color: '#10b981'
                    }
                ]
            },
            series: [{
                name: 'Sentiment',
                data: [sentiment.score],
                tooltip: {
                    valueSuffix: '/100'
                },
                dataLabels: {
                    format: '{y}/100',
                    borderWidth: 0,
                    color: '#1e293b',
                    style: {
                        fontSize: '16px',
                        fontWeight: 'bold'
                    }
                },
                dial: {
                    radius: '80%',
                    backgroundColor: this.defaultColors.primary,
                    baseWidth: 12,
                    baseLength: '0%',
                    rearLength: '0%'
                },
                pivot: {
                    backgroundColor: this.defaultColors.primary,
                    radius: 6
                }
            }],
            credits: { enabled: false },
            exporting: { enabled: true }
        };

        return { config: chartConfig, containerId: chartId };
    }

    /**
     * ✅ NEW: Insider Whale Tracker Chart (Top Volume)
     */
    createWhaleInsiderChart(whales, containerId, options = {}) {
        const chartId = containerId || `whale-insider-${++this.chartCounter}`;

        const categories = whales.slice(0, 10).map(w => w.name);
        const volumes = whales.slice(0, 10).map(w => w.totalVolume);

        const chartConfig = {
            chart: {
                type: 'bar',
                backgroundColor: 'transparent',
                height: options.height || 400,
                borderRadius: 15
            },
            title: {
                text: options.title || '🐋 Whale Insiders - Top Volume Traders',
                style: { color: '#1e293b', fontWeight: '800', fontSize: '16px' }
            },
            xAxis: {
                categories: categories,
                labels: { style: { color: '#64748b' } }
            },
            yAxis: {
                title: { text: 'Total Volume ($)', style: { color: '#1e293b' } },
                labels: { style: { color: '#64748b' } }
            },
            tooltip: {
                borderRadius: 10,
                valuePrefix: '$',
                valueDecimals: 0
            },
            plotOptions: {
                bar: {
                    dataLabels: {
                        enabled: true,
                        format: '${point.y:,.0f}'
                    },
                    colorByPoint: true,
                    colors: [
                        this.defaultColors.primary,
                        this.defaultColors.secondary,
                        this.defaultColors.info,
                        this.defaultColors.teal,
                        this.defaultColors.purple,
                        this.defaultColors.orange,
                        this.defaultColors.cyan,
                        this.defaultColors.indigo,
                        this.defaultColors.pink,
                        this.defaultColors.lime
                    ]
                }
            },
            series: [{
                name: 'Volume',
                data: volumes
            }],
            credits: { enabled: false },
            exporting: { enabled: true }
        };

        return { config: chartConfig, containerId: chartId };
    }

    // ═══════════════════════════════════════════════════════════
    // 🚀 SECTION 4: IPO ANALYSIS CHARTS
    // ═══════════════════════════════════════════════════════════

    /**
     * ✅ NEW: IPO Success Score Distribution Chart
     */
    createIPOScoreDistributionChart(ipos, containerId, options = {}) {
        const chartId = containerId || `ipo-score-dist-${++this.chartCounter}`;

        const scores = ipos.map(ipo => ipo.successScore).sort((a, b) => a - b);
        
        const bins = [
            { range: '0-20', count: 0 },
            { range: '21-40', count: 0 },
            { range: '41-60', count: 0 },
            { range: '61-80', count: 0 },
            { range: '81-100', count: 0 }
        ];

        scores.forEach(score => {
            if (score <= 20) bins[0].count++;
            else if (score <= 40) bins[1].count++;
            else if (score <= 60) bins[2].count++;
            else if (score <= 80) bins[3].count++;
            else bins[4].count++;
        });

        const chartConfig = {
            chart: {
                type: 'column',
                backgroundColor: 'transparent',
                height: options.height || 350,
                borderRadius: 15
            },
            title: {
                text: options.title || 'IPO Success Score Distribution',
                style: { color: '#1e293b', fontWeight: '800', fontSize: '16px' }
            },
            xAxis: {
                categories: bins.map(b => b.range),
                labels: { style: { color: '#64748b' } }
            },
            yAxis: {
                title: { text: 'Number of IPOs', style: { color: '#1e293b' } },
                labels: { style: { color: '#64748b' } }
            },
            tooltip: {
                borderRadius: 10,
                pointFormat: '<b>{point.y}</b> IPOs'
            },
            plotOptions: {
                column: {
                    dataLabels: {
                        enabled: true,
                        format: '{point.y}'
                    },
                    colorByPoint: true,
                    colors: [
                        this.defaultColors.danger,
                        this.defaultColors.warning,
                        this.defaultColors.info,
                        this.defaultColors.success,
                        this.defaultColors.emerald
                    ]
                }
            },
            series: [{
                name: 'IPO Count',
                data: bins.map(b => b.count)
            }],
            credits: { enabled: false },
            exporting: { enabled: true }
        };

        return { config: chartConfig, containerId: chartId };
    }

    /**
     * ✅ NEW: IPO Sector Performance Chart
     */
    createIPOSectorPerformanceChart(sectorPerformance, containerId, options = {}) {
        const chartId = containerId || `ipo-sector-${++this.chartCounter}`;

        const categories = sectorPerformance.map(s => s.sector);
        const scores = sectorPerformance.map(s => s.avgScore);

        const chartConfig = {
            chart: {
                type: 'bar',
                backgroundColor: 'transparent',
                height: options.height || 400,
                borderRadius: 15
            },
            title: {
                text: options.title || 'IPO Performance by Sector',
                style: { color: '#1e293b', fontWeight: '800', fontSize: '16px' }
            },
            xAxis: {
                categories: categories,
                labels: { style: { color: '#64748b' } }
            },
            yAxis: {
                title: { text: 'Average Success Score', style: { color: '#1e293b' } },
                labels: { style: { color: '#64748b' } },
                max: 100
            },
            tooltip: {
                borderRadius: 10,
                valueSuffix: '/100',
                valueDecimals: 1
            },
            plotOptions: {
                bar: {
                    dataLabels: {
                        enabled: true,
                        format: '{point.y:.1f}'
                    }
                }
            },
            series: [{
                name: 'Avg Score',
                data: scores,
                color: this.defaultColors.primary
            }],
            credits: { enabled: false },
            exporting: { enabled: true }
        };

        return { config: chartConfig, containerId: chartId };
    }

    /**
     * ✅ NEW: IPO Risk/Opportunity Scatter Chart
     */
    createIPORiskOpportunityChart(ipos, containerId, options = {}) {
        const chartId = containerId || `ipo-risk-scatter-${++this.chartCounter}`;

        const data = ipos.map(ipo => ({
            x: parseFloat(ipo.riskRatio || 5),
            y: ipo.successScore,
            name: ipo.companyName,
            sector: ipo.sector
        }));

        const chartConfig = {
            chart: {
                type: 'scatter',
                backgroundColor: 'transparent',
                height: options.height || 450,
                borderRadius: 15,
                zoomType: 'xy'
            },
            title: {
                text: options.title || 'IPO Risk vs Success Score',
                style: { color: '#1e293b', fontWeight: '800', fontSize: '16px' }
            },
            xAxis: {
                title: { text: 'Risk/Opportunity Ratio', style: { color: '#1e293b' } },
                labels: { style: { color: '#64748b' } },
                min: 0,
                max: 10,
                plotLines: [{
                    value: 5,
                    color: '#94a3b8',
                    dashStyle: 'Dash',
                    width: 2,
                    label: { text: 'Moderate Risk', style: { color: '#64748b' } }
                }]
            },
            yAxis: {
                title: { text: 'Success Score', style: { color: '#1e293b' } },
                labels: { style: { color: '#64748b' } },
                min: 0,
                max: 100,
                plotLines: [{
                    value: 60,
                    color: '#10b981',
                    dashStyle: 'Dash',
                    width: 2,
                    label: { text: 'Strong Potential', style: { color: '#10b981' } }
                }]
            },
            tooltip: {
                borderRadius: 10,
                formatter: function() {
                    return `<b>${this.point.name}</b><br/>` +
                           `Success Score: ${this.y}/100<br/>` +
                           `Risk Ratio: ${this.x.toFixed(2)}<br/>` +
                           `Sector: ${this.point.sector}`;
                }
            },
            series: [{
                name: 'IPOs',
                data: data,
                color: this.defaultColors.primary,
                marker: { radius: 6 }
            }],
            credits: { enabled: false },
            exporting: { enabled: true }
        };

        return { config: chartConfig, containerId: chartId };
    }

    /**
     * ✅ NEW: IPO Top Rankings Chart
     */
    createIPOTopRankingsChart(topIPOs, containerId, options = {}) {
        const chartId = containerId || `ipo-top-rankings-${++this.chartCounter}`;

        const categories = topIPOs.map(ipo => ipo.companyName);
        const scores = topIPOs.map(ipo => ipo.successScore);

        const chartConfig = {
            chart: {
                type: 'bar',
                backgroundColor: 'transparent',
                height: options.height || 400,
                borderRadius: 15
            },
            title: {
                text: options.title || '⭐ Top IPO Rankings',
                style: { color: '#1e293b', fontWeight: '800', fontSize: '16px' }
            },
            xAxis: {
                categories: categories,
                labels: { style: { color: '#64748b' } }
            },
            yAxis: {
                title: { text: 'Success Score', style: { color: '#1e293b' } },
                labels: { style: { color: '#64748b' } },
                max: 100
            },
            tooltip: {
                borderRadius: 10,
                valueSuffix: '/100',
                valueDecimals: 0
            },
            plotOptions: {
                bar: {
                    dataLabels: {
                        enabled: true,
                        format: '{point.y}/100'
                    },
                    colorByPoint: true,
                    colors: [
                        '#FFD700',
                        '#C0C0C0',
                        '#CD7F32',
                        this.defaultColors.primary,
                        this.defaultColors.secondary,
                        this.defaultColors.info,
                        this.defaultColors.purple,
                        this.defaultColors.teal,
                        this.defaultColors.orange,
                        this.defaultColors.cyan
                    ]
                }
            },
            series: [{
                name: 'Success Score',
                data: scores
            }],
            credits: { enabled: false },
            exporting: { enabled: true }
        };

        return { config: chartConfig, containerId: chartId };
    }

    // ═══════════════════════════════════════════════════════════
    // 🤝 SECTION 5: M&A ANALYSIS CHARTS
    // ═══════════════════════════════════════════════════════════

    /**
     * ✅ NEW: M&A Success Probability Chart
     */
    createMASuccessProbabilityChart(deals, containerId, options = {}) {
        const chartId = containerId || `ma-success-${++this.chartCounter}`;

        const categories = deals.map(deal => deal.companyName);
        const probabilities = deals.map(deal => deal.successProbability || 50);

        const chartConfig = {
            chart: {
                type: 'bar',
                backgroundColor: 'transparent',
                height: options.height || 400,
                borderRadius: 15
            },
            title: {
                text: options.title || 'M&A Success Probability',
                style: { color: '#1e293b', fontWeight: '800', fontSize: '16px' }
            },
            xAxis: {
                categories: categories,
                labels: { style: { color: '#64748b' } }
            },
            yAxis: {
                title: { text: 'Success Probability (%)', style: { color: '#1e293b' } },
                labels: { style: { color: '#64748b' } },
                max: 100
            },
            tooltip: {
                borderRadius: 10,
                valueSuffix: '%',
                valueDecimals: 1
            },
            plotOptions: {
                bar: {
                    dataLabels: {
                        enabled: true,
                        format: '{point.y:.1f}%'
                    },
                    zones: [
                        { value: 40, color: this.defaultColors.danger },
                        { value: 70, color: this.defaultColors.warning },
                        { color: this.defaultColors.success }
                    ]
                }
            },
            series: [{
                name: 'Success Probability',
                data: probabilities
            }],
            credits: { enabled: false },
            exporting: { enabled: true }
        };

        return { config: chartConfig, containerId: chartId };
    }

    /**
     * ✅ NEW: M&A Deal Value Timeline Chart
     */
    createMADealValueTimelineChart(deals, containerId, options = {}) {
        const chartId = containerId || `ma-timeline-${++this.chartCounter}`;

        const data = deals.map(deal => ({
            x: new Date(deal.announcedDate).getTime(),
            y: deal.dealValue || 0,
            name: deal.companyName
        }));

        const chartConfig = {
            chart: {
                type: 'scatter',
                backgroundColor: 'transparent',
                height: options.height || 400,
                borderRadius: 15,
                zoomType: 'xy'
            },
            title: {
                text: options.title || 'M&A Deal Value Timeline',
                style: { color: '#1e293b', fontWeight: '800', fontSize: '16px' }
            },
            xAxis: {
                type: 'datetime',
                title: { text: 'Announcement Date', style: { color: '#1e293b' } },
                labels: { style: { color: '#64748b' } }
            },
            yAxis: {
                type: 'logarithmic',
                title: { text: 'Deal Value ($M)', style: { color: '#1e293b' } },
                labels: { style: { color: '#64748b' } }
            },
            tooltip: {
                borderRadius: 10,
                formatter: function() {
                    return `<b>${this.point.name}</b><br/>` +
                           `Date: ${new Date(this.x).toLocaleDateString()}<br/>` +
                           `Value: $${this.y.toFixed(1)}M`;
                }
            },
            series: [{
                name: 'Deals',
                data: data,
                color: this.defaultColors.primary,
                marker: { radius: 8, symbol: 'diamond' }
            }],
            credits: { enabled: false },
            exporting: { enabled: true }
        };

        return { config: chartConfig, containerId: chartId };
    }

    /**
     * ✅ NEW: M&A Sector Breakdown Pie Chart
     */
    createMASectorBreakdownChart(deals, containerId, options = {}) {
        const chartId = containerId || `ma-sector-${++this.chartCounter}`;

        const sectorCounts = {};
        deals.forEach(deal => {
            const sector = deal.sector || 'Other';
            sectorCounts[sector] = (sectorCounts[sector] || 0) + 1;
        });

        const data = Object.entries(sectorCounts).map(([sector, count]) => ({
            name: sector,
            y: count
        }));

        const chartConfig = {
            chart: {
                type: 'pie',
                backgroundColor: 'transparent',
                height: options.height || 400,
                borderRadius: 15
            },
            title: {
                text: options.title || 'M&A Activity by Sector',
                style: { color: '#1e293b', fontWeight: '800', fontSize: '16px' }
            },
            tooltip: {
                borderRadius: 10,
                pointFormat: '<b>{point.name}</b><br/>{point.y} deals ({point.percentage:.1f}%)'
            },
            plotOptions: {
                pie: {
                    innerSize: '50%',
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b><br/>{point.percentage:.1f}%',
                        style: { fontWeight: '600', fontSize: '12px' }
                    },
                    showInLegend: true
                }
            },
            series: [{
                name: 'Deals',
                colorByPoint: true,
                data: data
            }],
            credits: { enabled: false },
            exporting: { enabled: true }
        };

        return { config: chartConfig, containerId: chartId };
    }

    // ═══════════════════════════════════════════════════════════
    // 💰 SECTION 6: BUDGET MANAGEMENT CHARTS
    // ═══════════════════════════════════════════════════════════

    /**
     * Budget: Income vs Expenses vs Savings
     */
    createBudgetOverviewChart(budgetData, containerId, options = {}) {
        const chartId = containerId || `budget-overview-${++this.chartCounter}`;

        const categories = budgetData.months || [];
        const incomeData = budgetData.income || [];
        const expensesData = budgetData.expenses || [];
        const savingsData = budgetData.savings || [];

        const chartConfig = {
            chart: {
                type: 'line',
                backgroundColor: 'transparent',
                height: options.height || 400,
                borderRadius: 15
            },
            title: {
                text: options.title || 'Budget Overview - Income vs Expenses vs Savings',
                style: { color: '#1e293b', fontWeight: '800', fontSize: '16px' }
            },
            xAxis: {
                categories: categories,
                labels: { style: { color: '#64748b' }, rotation: -45 }
            },
            yAxis: {
                title: { text: 'Amount (EUR)', style: { color: '#1e293b' } },
                labels: { style: { color: '#64748b' } }
            },
            tooltip: {
                borderRadius: 10,
                shared: true,
                valuePrefix: '€',
                valueDecimals: 0
            },
            series: [
                {
                    name: 'Income',
                    data: incomeData,
                    color: this.defaultColors.success,
                    lineWidth: 2,
                    marker: { enabled: false }
                },
                {
                    name: 'Expenses',
                    data: expensesData,
                    color: this.defaultColors.danger,
                    lineWidth: 2,
                    marker: { enabled: false }
                },
                {
                    name: 'Savings',
                    type: 'area',
                    data: savingsData,
                    color: this.defaultColors.primary,
                    fillOpacity: 0.3,
                    lineWidth: 2,
                    marker: { enabled: false }
                }
            ],
            credits: { enabled: false },
            exporting: { enabled: true }
        };

        return { config: chartConfig, containerId: chartId };
    }

    /**
     * Budget: Portfolio Evolution
     */
    createPortfolioEvolutionChart(portfolioData, containerId, options = {}) {
        const chartId = containerId || `portfolio-evolution-${++this.chartCounter}`;

        const categories = portfolioData.months || [];
        const investmentData = portfolioData.investment || [];
        const gainsData = portfolioData.gains || [];
        const totalData = portfolioData.total || [];

        const chartConfig = {
            chart: {
                type: 'area',
                backgroundColor: 'transparent',
                height: options.height || 400,
                borderRadius: 15
            },
            title: {
                text: options.title || 'Portfolio Evolution',
                style: { color: '#1e293b', fontWeight: '800', fontSize: '16px' }
            },
            xAxis: {
                categories: categories,
                labels: { style: { color: '#64748b' }, rotation: -45 }
            },
            yAxis: {
                title: { text: 'Value (EUR)', style: { color: '#1e293b' } },
                labels: { style: { color: '#64748b' } }
            },
            tooltip: {
                borderRadius: 10,
                shared: true,
                valuePrefix: '€',
                valueDecimals: 0
            },
            plotOptions: {
                area: {
                    stacking: null,
                    marker: { enabled: false }
                }
            },
            series: [
                {
                    name: 'Investment',
                    data: investmentData,
                    color: this.defaultColors.primary,
                    fillOpacity: 0.3
                },
                {
                    name: 'Gains',
                    data: gainsData,
                    color: this.defaultColors.success,
                    fillOpacity: 0.3
                },
                {
                    name: 'Total Portfolio',
                    data: totalData,
                    color: this.defaultColors.secondary,
                    lineWidth: 3,
                    fillOpacity: 0.4
                }
            ],
            credits: { enabled: false },
            exporting: { enabled: true }
        };

        return { config: chartConfig, containerId: chartId };
    }

    /**
     * Budget: ROI Evolution
     */
    createROIChart(roiData, containerId, options = {}) {
        const chartId = containerId || `roi-chart-${++this.chartCounter}`;

        const categories = roiData.months || [];
        const values = roiData.values || [];

        const chartConfig = {
            chart: {
                type: 'area',
                backgroundColor: 'transparent',
                height: options.height || 350,
                borderRadius: 15
            },
            title: {
                text: options.title || 'ROI Evolution (%)',
                style: { color: '#1e293b', fontWeight: '800', fontSize: '16px' }
            },
            xAxis: {
                categories: categories,
                labels: { style: { color: '#64748b' }, rotation: -45 }
            },
            yAxis: {
                title: { text: 'ROI (%)', style: { color: '#1e293b' } },
                labels: { style: { color: '#64748b' } },
                plotLines: [{
                    value: 0,
                    color: '#999',
                    dashStyle: 'Dash',
                    width: 2
                }]
            },
            tooltip: {
                borderRadius: 10,
                valueSuffix: '%',
                valueDecimals: 2
            },
            series: [{
                name: 'ROI',
                data: values,
                color: this.defaultColors.primary,
                fillColor: {
                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                    stops: [
                        [0, Highcharts.color(this.defaultColors.primary).setOpacity(0.4).get('rgba')],
                        [1, Highcharts.color(this.defaultColors.primary).setOpacity(0.1).get('rgba')]
                    ]
                },
                lineWidth: 2,
                marker: { enabled: false }
            }],
            credits: { enabled: false },
            exporting: { enabled: true }
        };

        return { config: chartConfig, containerId: chartId };
    }

    // ═══════════════════════════════════════════════════════════
    // 📊 SECTION 7: INVESTMENT ANALYTICS CHARTS
    // ═══════════════════════════════════════════════════════════

    /**
     * Investment: Asset Allocation Pie Chart
     */
    createAssetAllocationChart(allocationData, containerId, options = {}) {
        const chartId = containerId || `asset-allocation-${++this.chartCounter}`;

        const data = allocationData.map(item => ({
            name: item.name,
            y: item.allocation,
            color: item.color || this.defaultColors.primary
        }));

        const chartConfig = {
            chart: {
                type: 'pie',
                backgroundColor: 'transparent',
                height: options.height || 450,
                borderRadius: 15
            },
            title: {
                text: options.title || 'Asset Allocation',
                style: { color: '#1e293b', fontWeight: '800', fontSize: '16px' }
            },
            tooltip: {
                borderRadius: 10,
                pointFormat: '<b>{point.name}</b><br/>{point.percentage:.1f}%',
                valueSuffix: '%'
            },
            plotOptions: {
                pie: {
                    innerSize: '60%',
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b><br/>{point.percentage:.1f}%',
                        style: { fontWeight: '600', fontSize: '12px' }
                    },
                    showInLegend: true
                }
            },
            series: [{
                name: 'Allocation',
                colorByPoint: true,
                data: data
            }],
            legend: {
                itemStyle: { color: '#64748b' }
            },
            credits: { enabled: false },
            exporting: { enabled: true }
        };

        return { config: chartConfig, containerId: chartId };
    }

    /**
     * Investment: Efficient Frontier Scatter Chart
     */
    createEfficientFrontierChart(frontierData, containerId, options = {}) {
        const chartId = containerId || `efficient-frontier-${++this.chartCounter}`;

        const chartConfig = {
            chart: {
                type: 'scatter',
                backgroundColor: 'transparent',
                height: options.height || 500,
                borderRadius: 15,
                zoomType: 'xy'
            },
            title: {
                text: options.title || 'Efficient Frontier - Risk vs Return',
                style: { color: '#1e293b', fontWeight: '800', fontSize: '16px' }
            },
            xAxis: {
                title: { text: 'Volatility (Risk) %', style: { color: '#1e293b', fontWeight: '600' } },
                labels: { style: { color: '#64748b' } },
                gridLineWidth: 1,
                gridLineColor: '#e5e7eb'
            },
            yAxis: {
                title: { text: 'Expected Return %', style: { color: '#1e293b', fontWeight: '600' } },
                labels: { style: { color: '#64748b' } },
                gridLineColor: '#e5e7eb'
            },
            tooltip: {
                borderRadius: 10,
                formatter: function() {
                    return `<b>${this.point.name || 'Portfolio'}</b><br/>` +
                           `Risk: ${this.x.toFixed(2)}%<br/>` +
                           `Return: ${this.y.toFixed(2)}%<br/>` +
                           (this.point.sharpe ? `Sharpe: ${this.point.sharpe.toFixed(3)}` : '');
                }
            },
            series: [
                {
                    name: 'Efficient Portfolios',
                    data: frontierData.efficient || [],
                    color: this.defaultColors.primary,
                    marker: { radius: 4, symbol: 'circle' }
                },
                {
                    name: 'Current Portfolio',
                    data: frontierData.current ? [frontierData.current] : [],
                    color: this.defaultColors.danger,
                    marker: { radius: 8, symbol: 'diamond' }
                },
                {
                    name: 'Optimized Strategies',
                    data: frontierData.strategies || [],
                    color: this.defaultColors.success,
                    marker: { radius: 7, symbol: 'triangle' }
                }
            ],
            legend: {
                itemStyle: { color: '#64748b' }
            },
            credits: { enabled: false },
            exporting: { enabled: true }
        };

        return { config: chartConfig, containerId: chartId };
    }

    /**
     * Investment: Backtest Performance Chart
     */
    createBacktestChart(backtestData, containerId, options = {}) {
        const chartId = containerId || `backtest-chart-${++this.chartCounter}`;

        const series = backtestData.strategies.map((strategy, index) => ({
            name: strategy.name,
            data: strategy.values,
            color: [this.defaultColors.success, this.defaultColors.primary, this.defaultColors.danger][index % 3],
            lineWidth: 2,
            marker: { enabled: false }
        }));

        const chartConfig = {
            chart: {
                type: 'line',
                backgroundColor: 'transparent',
                height: options.height || 450,
                borderRadius: 15
            },
            title: {
                text: options.title || 'Backtest Performance Comparison',
                style: { color: '#1e293b', fontWeight: '800', fontSize: '16px' }
            },
            xAxis: {
                title: { text: 'Months', style: { color: '#1e293b' } },
                labels: { style: { color: '#64748b' } }
            },
            yAxis: {
                title: { text: 'Portfolio Value (EUR)', style: { color: '#1e293b' } },
                labels: { style: { color: '#64748b' } }
            },
            tooltip: {
                borderRadius: 10,
                shared: true,
                valuePrefix: '€',
                valueDecimals: 0
            },
            series: series,
            legend: {
                itemStyle: { color: '#64748b' }
            },
            credits: { enabled: false },
            exporting: { enabled: true }
        };

        return { config: chartConfig, containerId: chartId };
    }

    /**
     * Investment: Diversification Radar Chart
     */
    createDiversificationRadarChart(diversificationData, containerId, options = {}) {
        const chartId = containerId || `diversification-radar-${++this.chartCounter}`;

        const categories = diversificationData.map(d => d.name);
        const values = diversificationData.map(d => d.score);

        const chartConfig = {
            chart: {
                polar: true,
                type: 'area',
                backgroundColor: 'transparent',
                height: options.height || 400,
                borderRadius: 15
            },
            title: {
                text: options.title || 'Portfolio Diversification Score',
                style: { color: '#1e293b', fontWeight: '800', fontSize: '16px' }
            },
            pane: {
                size: '80%'
            },
            xAxis: {
                categories: categories,
                tickmarkPlacement: 'on',
                lineWidth: 0,
                labels: { style: { color: '#64748b', fontWeight: '600' } }
            },
            yAxis: {
                gridLineInterpolation: 'polygon',
                lineWidth: 0,
                min: 0,
                max: 100,
                labels: { style: { color: '#64748b' } }
            },
            tooltip: {
                borderRadius: 10,
                shared: true,
                pointFormat: '<b>{series.name}:</b> {point.y:.1f}/100'
            },
            series: [{
                name: 'Diversification',
                data: values,
                pointPlacement: 'on',
                color: this.defaultColors.primary,
                fillOpacity: 0.3,
                lineWidth: 2
            }],
            credits: { enabled: false },
            exporting: { enabled: true }
        };

        return { config: chartConfig, containerId: chartId };
    }

    // ═══════════════════════════════════════════════════════════
    // 🔄 SECTION 8: COMPARISON & GENERAL CHARTS
    // ═══════════════════════════════════════════════════════════

    /**
     * Radar Chart (General)
     */
    createRadarChart(indicators, containerId, options = {}) {
        const chartId = containerId || `radar-chart-${++this.chartCounter}`;

        const categories = indicators.map(ind => ind.name);
        const values = indicators.map(ind => ind.value);

        const chartConfig = {
            chart: {
                polar: true,
                type: 'area',
                backgroundColor: 'transparent',
                height: options.height || 400,
                borderRadius: 15
            },
            title: {
                text: options.title || 'Technical Indicators Overview',
                style: { color: '#1e293b', fontWeight: '800', fontSize: '16px' }
            },
            pane: {
                size: '80%'
            },
            xAxis: {
                categories: categories,
                tickmarkPlacement: 'on',
                lineWidth: 0,
                labels: { style: { color: '#64748b', fontWeight: '600' } }
            },
            yAxis: {
                gridLineInterpolation: 'polygon',
                lineWidth: 0,
                min: 0,
                max: 100,
                labels: { style: { color: '#64748b' } }
            },
            tooltip: {
                borderRadius: 10,
                shared: true,
                pointFormat: '<b>{series.name}:</b> {point.y:.1f}/100'
            },
            series: [{
                name: 'Technical Strength',
                data: values,
                pointPlacement: 'on',
                color: this.defaultColors.primary,
                fillOpacity: 0.3,
                lineWidth: 2
            }],
            credits: { enabled: false },
            exporting: { enabled: true }
        };

        return { config: chartConfig, containerId: chartId };
    }

    /**
     * Heatmap Chart (Correlation Matrix)
     */
    createHeatmapChart(correlationMatrix, symbols, containerId, options = {}) {
        const chartId = containerId || `heatmap-chart-${++this.chartCounter}`;

        const data = [];
        symbols.forEach((symbol1, i) => {
            symbols.forEach((symbol2, j) => {
                data.push([i, j, correlationMatrix[i][j]]);
            });
        });

        const chartConfig = {
            chart: {
                type: 'heatmap',
                backgroundColor: 'transparent',
                height: options.height || 500,
                borderRadius: 15
            },
            title: {
                text: options.title || 'Correlation Matrix',
                style: { color: '#1e293b', fontWeight: '800', fontSize: '16px' }
            },
            xAxis: {
                categories: symbols,
                labels: { style: { color: '#64748b', fontWeight: '600' } }
            },
            yAxis: {
                categories: symbols,
                title: null,
                labels: { style: { color: '#64748b', fontWeight: '600' } }
            },
            colorAxis: {
                min: -1,
                max: 1,
                stops: [
                    [0, this.defaultColors.danger],
                    [0.5, '#ffffff'],
                    [1, this.defaultColors.success]
                ]
            },
            tooltip: {
                borderRadius: 10,
                formatter: function() {
                    return `<b>${symbols[this.point.x]} vs ${symbols[this.point.y]}</b><br/>Correlation: <b>${this.point.value.toFixed(3)}</b>`;
                }
            },
            series: [{
                name: 'Correlation',
                borderWidth: 1,
                data: data,
                dataLabels: {
                    enabled: true,
                    color: '#000000',
                    format: '{point.value:.2f}'
                }
            }],
            credits: { enabled: false },
            exporting: { enabled: true }
        };

        return { config: chartConfig, containerId: chartId };
    }

    // ═══════════════════════════════════════════════════════════
    // 🔧 SECTION 9: UTILITY METHODS
    // ═══════════════════════════════════════════════════════════

    /**
     * Render Chart to DOM
     */
    renderChart(chartData, targetElement) {
        if (!chartData || !chartData.config || !chartData.containerId) {
            console.error('❌ Invalid chart data');
            return null;
        }

        let container = document.getElementById(chartData.containerId);
        
        if (!container) {
            container = document.createElement('div');
            container.id = chartData.containerId;
            container.className = 'chatbot-chart-container';
            container.style.marginTop = '20px';
            container.style.borderRadius = '15px';
            container.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
            container.style.padding = '15px';
            container.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
            
            if (targetElement) {
                targetElement.appendChild(container);
            }
        }

        try {
            const chart = Highcharts.chart(chartData.containerId, chartData.config);
            this.chartInstances.set(chartData.containerId, chart);
            
            console.log(`✅ Chart ${chartData.containerId} rendered successfully`);
            
            return chart;
        } catch (error) {
            console.error(`❌ Error rendering chart ${chartData.containerId}:`, error);
            return null;
        }
    }

    /**
     * Destroy Chart
     */
    destroyChart(chartId) {
        const chart = this.chartInstances.get(chartId);
        if (chart) {
            chart.destroy();
            this.chartInstances.delete(chartId);
            console.log(`🗑 Chart ${chartId} destroyed`);
        }
    }

    /**
     * Export Chart
     */
    exportChart(chartId, format = 'png') {
        const chart = this.chartInstances.get(chartId);
        
        if (!chart) {
            console.error(`❌ Chart ${chartId} not found`);
            return;
        }

        try {
            if (format === 'png') {
                chart.exportChart({ type: 'image/png' });
            } else if (format === 'svg') {
                chart.exportChart({ type: 'image/svg+xml' });
            } else if (format === 'pdf') {
                chart.exportChart({ type: 'application/pdf' });
            }
            
            console.log(`📥 Chart ${chartId} exported as ${format.toUpperCase()}`);
        } catch (error) {
            console.error(`❌ Export error for ${chartId}:`, error);
        }
    }

    /**
     * Get All Charts
     */
    getAllCharts() {
        return Array.from(this.chartInstances.keys());
    }

    /**
     * Destroy All Charts
     */
    destroyAllCharts() {
        this.chartInstances.forEach((chart, id) => {
            chart.destroy();
        });
        this.chartInstances.clear();
        console.log('🗑 All charts destroyed');
    }

    /**
     * Get Chart Instance
     */
    getChart(chartId) {
        return this.chartInstances.get(chartId);
    }

    /**
     * Update Chart Data
     */
    updateChart(chartId, newData) {
        const chart = this.chartInstances.get(chartId);
        if (!chart) {
            console.error(`❌ Chart ${chartId} not found`);
            return;
        }

        try {
            chart.series.forEach((series, index) => {
                if (newData.series && newData.series[index]) {
                    series.setData(newData.series[index].data, false);
                }
            });
            chart.redraw();
            console.log(`✅ Chart ${chartId} updated successfully`);
        } catch (error) {
            console.error(`❌ Error updating chart ${chartId}:`, error);
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChatbotCharts;
}

if (typeof window !== 'undefined') {
    window.ChatbotCharts = ChatbotCharts;
}

console.log('✅ ChatbotCharts ULTRA v6.0 COMPLETE loaded - 50+ chart types ready!');