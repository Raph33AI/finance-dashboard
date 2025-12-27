/**
 * ═══════════════════════════════════════════════════════════════
 * CHATBOT CHARTS - Ultra Financial Charting Engine
 * ═══════════════════════════════════════════════════════════════
 * Version: 5.0.0 ULTRA
 * Description: Génération de graphiques pour tous les modules
 * Features:
 *   - Technical Oscillators (RSI, MACD, Stochastic, ADX, etc.)
 *   - Budget Charts (Income vs Expenses, Savings, Portfolio)
 *   - Investment Charts (Asset Allocation, Efficient Frontier, Backtest)
 *   - Comparison Charts (Radar, Heatmap, Multi-series)
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
            pink: '#d63384'
        };
        
        console.log('📊 ChatbotCharts ULTRA v5.0 initialized');
    }

    // ═══════════════════════════════════════════════════════════
    // TECHNICAL INDICATORS CHARTS (EXISTING - Keep as is)
    // ═══════════════════════════════════════════════════════════

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
                    data: macdData.macdLine,
                    color: this.defaultColors.primary,
                    lineWidth: 2,
                    zIndex: 2
                },
                {
                    type: 'line',
                    name: 'Signal Line',
                    data: macdData.signalLine,
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

    // ═══════════════════════════════════════════════════════════
    // ✅ NEW: BUDGET CHARTS
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
    // ✅ NEW: INVESTMENT CHARTS
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
    // ✅ EXISTING: COMPARISON CHARTS
    // ═══════════════════════════════════════════════════════════

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
    // UTILITY METHODS
    // ═══════════════════════════════════════════════════════════

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

    destroyChart(chartId) {
        const chart = this.chartInstances.get(chartId);
        if (chart) {
            chart.destroy();
            this.chartInstances.delete(chartId);
            console.log(`🗑 Chart ${chartId} destroyed`);
        }
    }

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

    getAllCharts() {
        return Array.from(this.chartInstances.keys());
    }

    destroyAllCharts() {
        this.chartInstances.forEach((chart, id) => {
            chart.destroy();
        });
        this.chartInstances.clear();
        console.log('🗑 All charts destroyed');
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

console.log('✅ ChatbotCharts ULTRA v5.0 loaded - Budget & Investment integrated');