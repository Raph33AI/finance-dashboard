// ============================================
// CHATBOT CHARTS v6.0
// Génération automatique de graphiques
// ============================================

class ChatbotCharts {
    constructor(config) {
        this.config = config;
        this.chartInstances = new Map();
        
        console.log('📊 ChatbotCharts initialized');
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📈 CREATE STOCK PRICE CHART
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    async createStockChart(symbol, data, containerId) {
        if (!data || data.length === 0) {
            console.error('❌ No data provided for chart');
            return null;
        }

        const container = document.getElementById(containerId) || this.createChartContainer();
        
        try {
            // Use Highcharts for professional stock charts
            if (typeof Highcharts !== 'undefined') {
                return this.createHighchartsStockChart(symbol, data, container);
            } 
            // Fallback to Chart.js
            else if (typeof Chart !== 'undefined') {
                return this.createChartJSLineChart(symbol, data, container);
            } 
            else {
                console.error('❌ No chart library available');
                return null;
            }
        } catch (error) {
            console.error('❌ Chart creation error:', error);
            return null;
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📊 HIGHCHARTS STOCK CHART
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    createHighchartsStockChart(symbol, data, container) {
        const chartData = data.map(item => [
            new Date(item.datetime || item.date).getTime(),
            item.close
        ]).sort((a, b) => a[0] - b[0]);

        const volumeData = data.map(item => [
            new Date(item.datetime || item.date).getTime(),
            item.volume || 0
        ]).sort((a, b) => a[0] - b[0]);

        const chart = Highcharts.stockChart(container, {
            chart: {
                backgroundColor: 'transparent',
                style: {
                    fontFamily: "'Inter', sans-serif"
                },
                height: 500
            },
            
            rangeSelector: {
                selected: 1,
                buttons: [{
                    type: 'month',
                    count: 1,
                    text: '1M'
                }, {
                    type: 'month',
                    count: 3,
                    text: '3M'
                }, {
                    type: 'month',
                    count: 6,
                    text: '6M'
                }, {
                    type: 'ytd',
                    text: 'YTD'
                }, {
                    type: 'year',
                    count: 1,
                    text: '1Y'
                }, {
                    type: 'all',
                    text: 'All'
                }]
            },

            title: {
                text: `${symbol} Stock Price`,
                style: {
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#1e293b'
                }
            },

            subtitle: {
                text: `Data from ${new Date(chartData[0][0]).toLocaleDateString()} to ${new Date(chartData[chartData.length - 1][0]).toLocaleDateString()}`,
                style: {
                    color: '#64748b'
                }
            },

            navigator: {
                enabled: true
            },

            scrollbar: {
                enabled: true
            },

            yAxis: [{
                labels: {
                    align: 'right',
                    x: -3
                },
                title: {
                    text: 'Price (USD)'
                },
                height: '70%',
                lineWidth: 2,
                resize: {
                    enabled: true
                }
            }, {
                labels: {
                    align: 'right',
                    x: -3
                },
                title: {
                    text: 'Volume'
                },
                top: '75%',
                height: '25%',
                offset: 0,
                lineWidth: 2
            }],

            tooltip: {
                split: true,
                valueDecimals: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderWidth: 1,
                borderColor: '#e2e8f0',
                shadow: true
            },

            series: [{
                name: symbol,
                data: chartData,
                type: 'area',
                threshold: null,
                fillColor: {
                    linearGradient: {
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: 1
                    },
                    stops: [
                        [0, 'rgba(102, 126, 234, 0.3)'],
                        [1, 'rgba(102, 126, 234, 0.05)']
                    ]
                },
                lineColor: '#667eea',
                lineWidth: 2,
                marker: {
                    enabled: false,
                    states: {
                        hover: {
                            enabled: true,
                            radius: 5
                        }
                    }
                },
                tooltip: {
                    valueDecimals: 2,
                    valuePrefix: '$'
                }
            }, {
                type: 'column',
                name: 'Volume',
                data: volumeData,
                yAxis: 1,
                color: 'rgba(102, 126, 234, 0.4)',
                tooltip: {
                    valueDecimals: 0
                }
            }],

            credits: {
                enabled: false
            },

            exporting: {
                enabled: true,
                buttons: {
                    contextButton: {
                        menuItems: ['downloadPNG', 'downloadJPEG', 'downloadPDF', 'downloadSVG']
                    }
                }
            }
        });

        this.chartInstances.set(container.id, chart);
        console.log('✅ Highcharts stock chart created:', symbol);
        
        return chart;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📊 CHART.JS LINE CHART (Fallback)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    createChartJSLineChart(symbol, data, container) {
        const canvas = document.createElement('canvas');
        container.appendChild(canvas);
        const ctx = canvas.getContext('2d');

        const labels = data.map(item => new Date(item.datetime || item.date).toLocaleDateString());
        const prices = data.map(item => item.close);

        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: `${symbol} Price`,
                    data: prices,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: '#667eea'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            font: {
                                family: "'Inter', sans-serif",
                                size: 14,
                                weight: '600'
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: `${symbol} Stock Price`,
                        font: {
                            family: "'Inter', sans-serif",
                            size: 18,
                            weight: '700'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleFont: {
                            size: 14,
                            weight: '600'
                        },
                        bodyFont: {
                            size: 13
                        },
                        callbacks: {
                            label: function(context) {
                                return `Price: $${context.parsed.y.toFixed(2)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45,
                            font: {
                                size: 11
                            }
                        }
                    },
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toFixed(2);
                            },
                            font: {
                                size: 12
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });

        this.chartInstances.set(container.id, chart);
        console.log('✅ Chart.js line chart created:', symbol);
        
        return chart;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📊 COMPARISON CHART (Multiple Stocks)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    createComparisonChart(stocks, containerId) {
        const container = document.getElementById(containerId) || this.createChartContainer();
        
        if (!stocks || stocks.length === 0) {
            console.error('❌ No stocks provided for comparison');
            return null;
        }

        const canvas = document.createElement('canvas');
        container.appendChild(canvas);
        const ctx = canvas.getContext('2d');

        const datasets = stocks.map((stock, index) => ({
            label: stock.symbol,
            data: stock.data.map(item => item.close),
            borderColor: this.config.charts.colors[index % this.config.charts.colors.length],
            backgroundColor: 'transparent',
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 5
        }));

        const labels = stocks[0].data.map(item => new Date(item.datetime || item.date).toLocaleDateString());

        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    title: {
                        display: true,
                        text: 'Stock Comparison',
                        font: {
                            size: 18,
                            weight: '700'
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: false,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toFixed(2);
                            }
                        }
                    }
                }
            }
        });

        this.chartInstances.set(container.id, chart);
        console.log('✅ Comparison chart created');
        
        return chart;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📊 TECHNICAL INDICATORS CHART
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    createTechnicalIndicatorsChart(symbol, data, indicators, containerId) {
        const container = document.getElementById(containerId) || this.createChartContainer();
        
        const canvas = document.createElement('canvas');
        container.appendChild(canvas);
        const ctx = canvas.getContext('2d');

        const labels = data.map(item => new Date(item.datetime || item.date).toLocaleDateString());
        
        const datasets = [{
            label: `${symbol} Price`,
            data: data.map(item => item.close),
            borderColor: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            borderWidth: 2,
            fill: true,
            yAxisID: 'y'
        }];

        // Add RSI if provided
        if (indicators.rsi) {
            datasets.push({
                label: 'RSI',
                data: indicators.rsi,
                borderColor: '#10b981',
                backgroundColor: 'transparent',
                borderWidth: 2,
                yAxisID: 'y1',
                pointRadius: 0
            });
        }

        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: `${symbol} - Technical Indicators`,
                        font: {
                            size: 18,
                            weight: '700'
                        }
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Price ($)'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'RSI'
                        },
                        min: 0,
                        max: 100,
                        grid: {
                            drawOnChartArea: false
                        }
                    }
                }
            }
        });

        this.chartInstances.set(container.id, chart);
        console.log('✅ Technical indicators chart created');
        
        return chart;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📊 CREATE TECHNICAL INDICATORS CHART (COMPREHENSIVE)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    async createTechnicalIndicatorsChart(symbol, technicalData, containerId = null) {
        console.log(`📊 Creating technical indicators chart for ${symbol}...`);

        if (!technicalData || !technicalData.indicators) {
            console.error('❌ No technical data provided');
            return null;
        }

        // Create container
        const container = containerId ? document.getElementById(containerId) : this.createChartContainer();
        
        if (!container) {
            console.error('❌ Failed to create chart container');
            return null;
        }

        // Check Highcharts availability
        if (typeof Highcharts === 'undefined') {
            console.error('❌ Highcharts not loaded');
            return null;
        }

        const { indicators, prices } = technicalData;

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // PREPARE DATA SERIES
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        const series = [];
        const yAxis = [];

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 1⃣ RSI (0-100 scale)
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        if (indicators.rsi && indicators.rsi.length > 0) {
            yAxis.push({
                title: { text: 'RSI' },
                height: '20%',
                top: '0%',
                lineWidth: 2,
                plotLines: [
                    { value: 70, color: '#ef4444', dashStyle: 'Dash', width: 1, label: { text: '70', align: 'right' } },
                    { value: 30, color: '#10b981', dashStyle: 'Dash', width: 1, label: { text: '30', align: 'right' } }
                ],
                min: 0,
                max: 100
            });

            series.push({
                type: 'line',
                name: 'RSI',
                data: indicators.rsi,
                yAxis: yAxis.length - 1,
                color: '#667eea',
                lineWidth: 2,
                tooltip: { valueDecimals: 2 }
            });
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 2⃣ MACD
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        if (indicators.macd && indicators.macd.histogram) {
            const topOffset = yAxis.length > 0 ? (yAxis.length * 22) + '%' : '0%';
            
            yAxis.push({
                title: { text: 'MACD' },
                height: '20%',
                top: topOffset,
                lineWidth: 2,
                plotLines: [
                    { value: 0, color: '#999', dashStyle: 'Dash', width: 1 }
                ]
            });

            series.push(
                {
                    type: 'line',
                    name: 'MACD Line',
                    data: indicators.macd.macdLine,
                    yAxis: yAxis.length - 1,
                    color: '#667eea',
                    lineWidth: 2
                },
                {
                    type: 'line',
                    name: 'Signal Line',
                    data: indicators.macd.signalLine,
                    yAxis: yAxis.length - 1,
                    color: '#ef4444',
                    lineWidth: 2
                },
                {
                    type: 'column',
                    name: 'Histogram',
                    data: indicators.macd.histogram,
                    yAxis: yAxis.length - 1,
                    color: '#10b981',
                    negativeColor: '#ef4444'
                }
            );
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 3⃣ STOCHASTIC
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        if (indicators.stochastic && indicators.stochastic.k) {
            const topOffset = yAxis.length > 0 ? (yAxis.length * 22) + '%' : '0%';
            
            yAxis.push({
                title: { text: 'Stochastic' },
                height: '20%',
                top: topOffset,
                lineWidth: 2,
                plotLines: [
                    { value: 80, color: '#ef4444', dashStyle: 'Dash', width: 1 },
                    { value: 20, color: '#10b981', dashStyle: 'Dash', width: 1 }
                ],
                min: 0,
                max: 100
            });

            series.push(
                {
                    type: 'line',
                    name: '%K',
                    data: indicators.stochastic.k,
                    yAxis: yAxis.length - 1,
                    color: '#667eea',
                    lineWidth: 2
                },
                {
                    type: 'line',
                    name: '%D',
                    data: indicators.stochastic.d,
                    yAxis: yAxis.length - 1,
                    color: '#ef4444',
                    lineWidth: 2
                }
            );
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 4⃣ ADX (Trend Strength)
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        if (indicators.adx && indicators.adx.adx && indicators.adx.adx.length > 0) {
            const topOffset = yAxis.length > 0 ? (yAxis.length * 22) + '%' : '0%';
            
            yAxis.push({
                title: { text: 'ADX' },
                height: '20%',
                top: topOffset,
                lineWidth: 2,
                plotLines: [
                    { value: 25, color: '#10b981', dashStyle: 'Dash', width: 1, label: { text: 'Strong (25)', align: 'right' } }
                ],
                min: 0,
                max: 100
            });

            series.push(
                {
                    type: 'line',
                    name: 'ADX',
                    data: indicators.adx.adx,
                    yAxis: yAxis.length - 1,
                    color: '#667eea',
                    lineWidth: 3
                },
                {
                    type: 'line',
                    name: '+DI',
                    data: indicators.adx.plusDI,
                    yAxis: yAxis.length - 1,
                    color: '#10b981',
                    lineWidth: 2
                },
                {
                    type: 'line',
                    name: '-DI',
                    data: indicators.adx.minusDI,
                    yAxis: yAxis.length - 1,
                    color: '#ef4444',
                    lineWidth: 2
                }
            );
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // CREATE CHART
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        const chart = Highcharts.stockChart(container, {
            chart: {
                backgroundColor: 'transparent',
                style: { fontFamily: "'Inter', sans-serif" },
                height: 600
            },

            title: {
                text: `${symbol} - Technical Indicators Analysis`,
                style: { fontSize: '18px', fontWeight: '700', color: '#1e293b' }
            },

            subtitle: {
                text: 'AlphaVault AI - Professional Technical Analysis',
                style: { color: '#64748b' }
            },

            rangeSelector: {
                selected: 1,
                buttons: [
                    { type: 'month', count: 1, text: '1M' },
                    { type: 'month', count: 3, text: '3M' },
                    { type: 'month', count: 6, text: '6M' },
                    { type: 'all', text: 'All' }
                ]
            },

            xAxis: {
                type: 'datetime',
                crosshair: true
            },

            yAxis: yAxis,

            tooltip: {
                split: true,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderWidth: 1,
                borderColor: '#e2e8f0',
                shadow: true
            },

            series: series,

            credits: { enabled: false },

            exporting: {
                enabled: true,
                buttons: {
                    contextButton: {
                        menuItems: ['downloadPNG', 'downloadJPEG', 'downloadPDF', 'downloadSVG']
                    }
                }
            }
        });

        this.chartInstances.set(container.id, chart);
        console.log('✅ Technical indicators chart created successfully:', symbol);

        return {
            chart: chart,
            container: container
        };
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📊 INSERT CHART INTO CHATBOT MESSAGE
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    insertChartIntoChatbot(chartResult) {
        if (!chartResult || !chartResult.container) {
            console.error('❌ Invalid chart result');
            return null;
        }

        // Add chatbot-specific styling
        chartResult.container.style.cssText = `
            width: 100%;
            max-width: 900px;
            margin: 20px auto;
            padding: 20px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        `;

        // Add dark mode support
        if (document.body.classList.contains('dark-mode')) {
            chartResult.container.style.background = '#1e293b';
            chartResult.container.style.color = '#f1f5f9';
        }

        return chartResult.container;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎨 CREATE CHART CONTAINER
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    createChartContainer() {
        const container = document.createElement('div');
        container.className = 'chart-container';
        container.id = 'chart_' + Date.now();
        container.style.cssText = `
            width: 100%;
            height: 400px;
            margin: 20px 0;
            padding: 20px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        `;
        
        return container;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🗑 DESTROY CHART
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    destroyChart(chartId) {
        const chart = this.chartInstances.get(chartId);
        if (chart) {
            if (chart.destroy) {
                chart.destroy();
            }
            this.chartInstances.delete(chartId);
            console.log('🗑 Chart destroyed:', chartId);
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🗑 DESTROY ALL CHARTS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    destroyAllCharts() {
        this.chartInstances.forEach((chart, id) => {
            this.destroyChart(id);
        });
        console.log('🗑 All charts destroyed');
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📥 EXPORT CHART AS IMAGE
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    async exportChartAsImage(chartId, filename = 'chart.png') {
        const chart = this.chartInstances.get(chartId);
        if (!chart) {
            console.error('❌ Chart not found:', chartId);
            return null;
        }

        try {
            if (chart.canvas) {
                // Chart.js
                const url = chart.canvas.toDataURL('image/png');
                this.downloadImage(url, filename);
            } else if (chart.getSVG) {
                // Highcharts
                const svg = chart.getSVG();
                this.downloadSVG(svg, filename.replace('.png', '.svg'));
            }
            
            console.log('✅ Chart exported:', filename);
        } catch (error) {
            console.error('❌ Export error:', error);
        }
    }

    downloadImage(dataUrl, filename) {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    downloadSVG(svg, filename) {
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ EXPORT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
console.log('✅ ChatbotCharts class loaded');