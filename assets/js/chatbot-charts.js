// ============================================
// CHATBOT CHARTS v3.0 - PREMIUM VISUALIZATIONS
// Multi-Stock Comparison + Metrics Tables + Overlay Charts
// FIX: Chart.js date adapter error resolved
// ============================================

class ChatbotCharts {
    constructor(config) {
        this.config = config;
        this.activeCharts = new Map();
        this.chartCounter = 0;
        
        // Check if Chart.js is loaded
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js not loaded. Charts will not be available.');
            this.chartsAvailable = false;
        } else {
            this.chartsAvailable = true;
            this.configureChartDefaults();
        }
    }

    // ============================================
    // CONFIGURE CHART DEFAULTS
    // ============================================
    configureChartDefaults() {
        Chart.defaults.color = this.config.charts.colors.text;
        Chart.defaults.borderColor = this.config.charts.colors.grid;
        Chart.defaults.font.family = "'Inter', sans-serif";
        Chart.defaults.animation.duration = this.config.charts.animation.duration;
        Chart.defaults.animation.easing = this.config.charts.animation.easing;
    }

    // ============================================
    // CREATE CHART FROM REQUEST
    // ============================================
    async createChart(chartRequest, container) {
        if (!this.chartsAvailable) {
            console.warn('Charts not available');
            return null;
        }

        try {
            const { type, symbol, symbols, data, indicators, timeSeriesData } = chartRequest;
            
            // Generate unique ID
            const chartId = `chart-${++this.chartCounter}`;
            
            // Handle different visualization types
            if (type === 'comparison' && symbols && timeSeriesData) {
                return await this.createComparisonChart(chartId, symbols, timeSeriesData, container, chartRequest);
            }
            
            if (type === 'metrics-table' && data) {
                return this.createMetricsTable(chartId, data, container);
            }
            
            // Standard charts
            const displayType = type === 'candlestick' ? 'line' : type;
            
            // Create chart container HTML
            const chartHTML = this.createChartHTML(chartId, symbol, displayType);
            container.innerHTML = chartHTML;
            
            // Get canvas element
            const canvas = container.querySelector(`#${chartId}`);
            if (!canvas) {
                throw new Error('Canvas element not found');
            }

            // Fetch data based on chart type
            let chartData;
            if (type === 'candlestick') {
                chartData = await this.fetchCandlestickData(symbol, data);
                chartData = this.convertCandlestickToLine(chartData);
            } else if (type === 'line') {
                chartData = await this.fetchLineData(symbol, data, timeSeriesData);
            } else if (type === 'bar') {
                chartData = await this.fetchBarData(symbol, data);
            } else if (type === 'area') {
                chartData = await this.fetchAreaData(symbol, data);
            } else {
                chartData = await this.fetchLineData(symbol, data, timeSeriesData);
            }

            // Create chart
            const chart = this.renderChart(canvas, displayType, chartData, indicators);
            
            // Store chart reference
            this.activeCharts.set(chartId, chart);
            
            // Add export button functionality
            this.addExportButton(chartId, chart, symbol);
            
            return chartId;

        } catch (error) {
            console.error('Chart creation error:', error);
            container.innerHTML = `<div class="error-message">Failed to create chart: ${error.message}</div>`;
            return null;
        }
    }

    // ============================================
    // FIX: GRAPHIQUE DE COMPARAISON (sans date adapter)
    // ============================================
    async createComparisonChart(chartId, symbols, timeSeriesData, container, chartRequest) {
        try {
            console.log(`Creating comparison chart for: ${symbols.join(' vs ')}`);
            
            // Create HTML container
            const chartHTML = this.createComparisonChartHTML(chartId, symbols);
            container.innerHTML = chartHTML;
            
            // Get canvas element
            const canvas = container.querySelector(`#${chartId}`);
            if (!canvas) {
                throw new Error('Canvas element not found');
            }
            
            // Prepare datasets for overlay
            const datasets = [];
            const colors = [
                '#667eea', // Primary (purple)
                '#f093fb', // Secondary (pink)
                '#10b981', // Success (green)
                '#f59e0b', // Warning (orange)
                '#ef4444', // Danger (red)
                '#06b6d4'  // Info (cyan)
            ];
            
            // FIX: Find common labels (dates) and normalize data
            let commonLabels = [];
            if (timeSeriesData.length > 0 && timeSeriesData[0].data) {
                // Use first series dates as labels (formatted)
                commonLabels = timeSeriesData[0].data.map(d => {
                    const date = new Date(d.datetime);
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                });
            }
            
            timeSeriesData.forEach((series, index) => {
                if (!series.data || series.data.length === 0) return;
                
                // Normalize data to 100 for fair comparison
                const firstPrice = series.data[0].close;
                const normalizedData = series.data.map(d => {
                    return ((d.close / firstPrice) * 100).toFixed(2);
                });
                
                datasets.push({
                    label: series.symbol,
                    data: normalizedData,
                    borderColor: colors[index % colors.length],
                    backgroundColor: 'transparent',
                    borderWidth: 2.5,
                    tension: 0.4,
                    fill: false,
                    pointRadius: 0,
                    pointHoverRadius: 6,
                    pointHoverBackgroundColor: colors[index % colors.length],
                    pointHoverBorderColor: '#fff',
                    pointHoverBorderWidth: 2
                });
            });
            
            // FIX: Chart configuration without time scale
            const chartConfig = {
                type: 'line',
                data: { 
                    labels: commonLabels,
                    datasets: datasets 
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        mode: 'index',
                        intersect: false
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: `Performance Comparison (Normalized to 100)`,
                            font: {
                                size: 16,
                                weight: 'bold'
                            },
                            color: this.config.charts.colors.text,
                            padding: 20
                        },
                        legend: {
                            display: true,
                            position: 'top',
                            labels: {
                                color: this.config.charts.colors.text,
                                usePointStyle: true,
                                padding: 15,
                                font: {
                                    size: 13,
                                    weight: '600'
                                }
                            }
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                            backgroundColor: 'rgba(0, 0, 0, 0.85)',
                            borderColor: this.config.charts.colors.primary,
                            borderWidth: 1,
                            titleColor: '#fff',
                            bodyColor: '#fff',
                            padding: 12,
                            displayColors: true,
                            callbacks: {
                                title: (context) => {
                                    return context[0].label || '';
                                },
                                label: (context) => {
                                    return `${context.dataset.label}: ${context.parsed.y}`;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: {
                                color: this.config.charts.colors.grid,
                                drawBorder: false
                            },
                            ticks: {
                                color: this.config.charts.colors.text,
                                maxRotation: 45,
                                minRotation: 0,
                                autoSkipPadding: 20,
                                maxTicksLimit: 10
                            }
                        },
                        y: {
                            beginAtZero: false,
                            grid: {
                                color: this.config.charts.colors.grid,
                                drawBorder: false
                            },
                            ticks: {
                                color: this.config.charts.colors.text,
                                callback: (value) => value.toFixed(0)
                            },
                            title: {
                                display: true,
                                text: 'Normalized Performance (Base = 100)',
                                color: this.config.charts.colors.text,
                                font: {
                                    size: 12,
                                    weight: '600'
                                }
                            }
                        }
                    }
                }
            };
            
            const chart = new Chart(canvas, chartConfig);
            
            // Store chart reference
            this.activeCharts.set(chartId, chart);
            
            // Add export button functionality
            this.addExportButton(chartId, chart, symbols.join('_vs_'));
            
            console.log(`Comparison chart created: ${chartId}`);
            
            return chartId;
            
        } catch (error) {
            console.error('Comparison chart creation error:', error);
            container.innerHTML = `<div class="error-message">Failed to create comparison chart: ${error.message}</div>`;
            return null;
        }
    }

    // ============================================
    // TABLEAU DE MÉTRIQUES COMPARATIVES
    // ============================================
    createMetricsTable(tableId, tableData, container) {
        try {
            console.log(`Creating metrics comparison table`);
            
            const tableHTML = `
                <div class="metrics-table-container" id="${tableId}">
                    <div class="metrics-table-header">
                        <h3 class="metrics-table-title">Key Metrics Comparison</h3>
                        <button class="chart-btn" data-action="export-table" data-table="${tableId}">
                            Export
                        </button>
                    </div>
                    <div class="metrics-table-wrapper">
                        <table class="metrics-comparison-table">
                            <thead>
                                <tr>
                                    ${tableData.headers.map(header => `<th>${header}</th>`).join('')}
                                </tr>
                            </thead>
                            <tbody>
                                ${tableData.rows.map((row, index) => `
                                    <tr class="${index % 2 === 0 ? 'even' : 'odd'}">
                                        ${row.map((cell, cellIndex) => `
                                            <td class="${cellIndex === 0 ? 'metric-label' : 'metric-value'}">
                                                ${cell}
                                            </td>
                                        `).join('')}
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
            
            container.innerHTML = tableHTML;
            
            // Add export functionality for table
            const exportBtn = container.querySelector(`[data-action="export-table"]`);
            if (exportBtn) {
                exportBtn.addEventListener('click', () => {
                    this.exportTableAsCSV(tableData, 'metrics_comparison.csv');
                });
            }
            
            console.log(`Metrics table created: ${tableId}`);
            
            return tableId;
            
        } catch (error) {
            console.error('Metrics table creation error:', error);
            container.innerHTML = `<div class="error-message">Failed to create metrics table: ${error.message}</div>`;
            return null;
        }
    }

    // ============================================
    // CREATE CHART HTML
    // ============================================
    createChartHTML(chartId, symbol, type) {
        return `
            <div class="chart-container">
                <div class="chart-header">
                    <span class="chart-title">${symbol} - ${type.toUpperCase()} Chart</span>
                    <div class="chart-actions">
                        <button class="chart-btn" data-action="export" data-chart="${chartId}">
                            Export
                        </button>
                    </div>
                </div>
                <div class="chart-canvas-wrapper">
                    <canvas id="${chartId}"></canvas>
                </div>
            </div>
        `;
    }
    
    createComparisonChartHTML(chartId, symbols) {
        return `
            <div class="chart-container comparison-chart">
                <div class="chart-header">
                    <span class="chart-title">${symbols.join(' vs ')} - Performance Comparison</span>
                    <div class="chart-actions">
                        <button class="chart-btn" data-action="export" data-chart="${chartId}">
                            Export
                        </button>
                    </div>
                </div>
                <div class="chart-canvas-wrapper" style="height: 450px;">
                    <canvas id="${chartId}"></canvas>
                </div>
            </div>
        `;
    }

    // ============================================
    // RENDER CHART
    // ============================================
    renderChart(canvas, type, data, indicators = []) {
        const ctx = canvas.getContext('2d');
        
        let chartConfig;
        switch (type) {
            case 'line':
                chartConfig = this.getLineConfig(data, indicators);
                break;
            case 'bar':
                chartConfig = this.getBarConfig(data);
                break;
            case 'area':
                chartConfig = this.getAreaConfig(data);
                break;
            default:
                chartConfig = this.getLineConfig(data, indicators);
        }

        return new Chart(ctx, chartConfig);
    }

    // ============================================
    // LINE CHART CONFIG (avec indicateurs optionnels)
    // ============================================
    getLineConfig(data, indicators = []) {
        const datasets = [{
            label: 'Price',
            data: data.values,
            borderColor: this.config.charts.colors.primary,
            backgroundColor: this.hexToRgba(this.config.charts.colors.primary, 0.1),
            borderWidth: 2,
            tension: 0.4,
            fill: true,
            pointRadius: 0,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: this.config.charts.colors.primary,
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 2
        }];

        // Add technical indicators if requested
        if (indicators && indicators.includes('sma') && data.values.length > 0) {
            const sma20 = this.calculateSMA(data.values, 20);
            datasets.push({
                label: 'SMA 20',
                data: sma20,
                borderColor: '#f59e0b',
                backgroundColor: 'transparent',
                borderWidth: 1.5,
                tension: 0.4,
                fill: false,
                pointRadius: 0,
                borderDash: [5, 5]
            });
        }

        if (indicators && indicators.includes('sma') && data.values.length > 0) {
            const sma50 = this.calculateSMA(data.values, 50);
            datasets.push({
                label: 'SMA 50',
                data: sma50,
                borderColor: '#10b981',
                backgroundColor: 'transparent',
                borderWidth: 1.5,
                tension: 0.4,
                fill: false,
                pointRadius: 0,
                borderDash: [10, 5]
            });
        }

        return {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: datasets
            },
            options: this.getCommonOptions({
                plugins: {
                    legend: {
                        display: indicators && indicators.length > 0,
                        position: 'top',
                        labels: {
                            color: this.config.charts.colors.text,
                            usePointStyle: true,
                            padding: 15
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        borderColor: this.config.charts.colors.primary,
                        borderWidth: 1,
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        padding: 12,
                        displayColors: true,
                        callbacks: {
                            label: (context) => {
                                return `${context.dataset.label}: $${context.parsed.y.toFixed(2)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: {
                            callback: (value) => '$' + value.toFixed(2)
                        }
                    }
                }
            })
        };
    }

    // ============================================
    // AREA CHART CONFIG
    // ============================================
    getAreaConfig(data) {
        return {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Price',
                    data: data.values,
                    borderColor: this.config.charts.colors.primary,
                    backgroundColor: this.hexToRgba(this.config.charts.colors.primary, 0.3),
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 0,
                    pointHoverRadius: 5
                }]
            },
            options: this.getCommonOptions({
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        borderColor: this.config.charts.colors.primary,
                        borderWidth: 1,
                        callbacks: {
                            label: (context) => `Price: $${context.parsed.y.toFixed(2)}`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: {
                            callback: (value) => '$' + value.toFixed(2)
                        }
                    }
                }
            })
        };
    }

    // ============================================
    // BAR CHART CONFIG
    // ============================================
    getBarConfig(data) {
        return {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Volume',
                    data: data.values,
                    backgroundColor: this.hexToRgba(this.config.charts.colors.primary, 0.7),
                    borderColor: this.config.charts.colors.primary,
                    borderWidth: 1
                }]
            },
            options: this.getCommonOptions({
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        borderColor: this.config.charts.colors.primary,
                        borderWidth: 1
                    }
                }
            })
        };
    }

    // ============================================
    // COMMON CHART OPTIONS
    // ============================================
    getCommonOptions(customOptions = {}) {
        const baseOptions = {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: this.config.charts.colors.primary,
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 8
                }
            },
            scales: {
                x: {
                    grid: {
                        color: this.config.charts.colors.grid,
                        drawBorder: false
                    },
                    ticks: {
                        color: this.config.charts.colors.text,
                        maxRotation: 0,
                        autoSkipPadding: 20
                    }
                },
                y: {
                    grid: {
                        color: this.config.charts.colors.grid,
                        drawBorder: false
                    },
                    ticks: {
                        color: this.config.charts.colors.text
                    }
                }
            }
        };

        return this.deepMerge(baseOptions, customOptions);
    }

    // ============================================
    // FETCH LINE DATA - AVEC VRAIES DONNÉES
    // ============================================
    async fetchLineData(symbol, period, timeSeriesData = null) {
        console.log(`Fetching line data for ${symbol}, period: ${period}`);
        
        // If data already provided, use it
        if (timeSeriesData && timeSeriesData.data && timeSeriesData.data.length > 0) {
            console.log(`Using provided time series data: ${timeSeriesData.data.length} points`);
            
            return {
                labels: timeSeriesData.data.map(d => {
                    const date = new Date(d.datetime);
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }),
                values: timeSeriesData.data.map(d => d.close)
            };
        }
        
        // Try to fetch real data if analytics available
        if (window.financialChatbotFullPage && window.financialChatbotFullPage.engine && window.financialChatbotFullPage.engine.analytics) {
            try {
                const analytics = window.financialChatbotFullPage.engine.analytics;
                const outputsize = this.getDataPointsCount(period);
                
                const timeSeries = await analytics.getTimeSeries(symbol, '1day', outputsize);
                
                if (timeSeries && timeSeries.data && timeSeries.data.length > 0) {
                    console.log(`Real data loaded: ${timeSeries.data.length} points`);
                    
                    return {
                        labels: timeSeries.data.map(d => {
                            const date = new Date(d.datetime);
                            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        }),
                        values: timeSeries.data.map(d => d.close)
                    };
                }
            } catch (error) {
                console.warn('Could not fetch real data, using mock:', error);
            }
        }
        
        // Fallback: Mock data
        console.warn(`Using mock data for ${symbol}`);
        const dataPoints = this.getDataPointsCount(period);
        const now = Date.now();
        const interval = this.getIntervalMillis(period);
        
        const labels = [];
        const values = [];
        let basePrice = 100 + Math.random() * 100;
        
        for (let i = 0; i < dataPoints; i++) {
            const timestamp = now - (dataPoints - i) * interval;
            const date = new Date(timestamp);
            labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            
            basePrice += (Math.random() - 0.5) * 5;
            values.push(parseFloat(basePrice.toFixed(2)));
        }
        
        return { labels, values };
    }

    async fetchCandlestickData(symbol, period) {
        const dataPoints = this.getDataPointsCount(period);
        const now = Date.now();
        const interval = this.getIntervalMillis(period);
        
        const labels = [];
        const candlesticks = [];
        const closes = [];
        let basePrice = 100 + Math.random() * 100;
        
        for (let i = 0; i < dataPoints; i++) {
            const timestamp = now - (dataPoints - i) * interval;
            const date = new Date(timestamp);
            labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            
            const open = basePrice;
            const close = open + (Math.random() - 0.5) * 10;
            const high = Math.max(open, close) + Math.random() * 3;
            const low = Math.min(open, close) - Math.random() * 3;
            
            candlesticks.push({ 
                x: date, 
                o: parseFloat(open.toFixed(2)), 
                h: parseFloat(high.toFixed(2)), 
                l: parseFloat(low.toFixed(2)), 
                c: parseFloat(close.toFixed(2)) 
            });
            closes.push(parseFloat(close.toFixed(2)));
            
            basePrice = close;
        }
        
        return { labels, candlesticks, closes };
    }

    convertCandlestickToLine(candlestickData) {
        return {
            labels: candlestickData.labels,
            values: candlestickData.closes
        };
    }

    async fetchBarData(symbol, period) {
        return this.fetchLineData(symbol, period);
    }

    async fetchAreaData(symbol, period) {
        return this.fetchLineData(symbol, period);
    }

    // ============================================
    // TECHNICAL INDICATORS
    // ============================================
    calculateSMA(data, period) {
        const sma = [];
        for (let i = 0; i < data.length; i++) {
            if (i < period - 1) {
                sma.push(null);
            } else {
                const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
                sma.push(parseFloat((sum / period).toFixed(2)));
            }
        }
        return sma;
    }

    calculateEMA(data, period) {
        const ema = [];
        const multiplier = 2 / (period + 1);
        
        let sum = 0;
        for (let i = 0; i < period; i++) {
            sum += data[i];
            ema.push(null);
        }
        ema[period - 1] = sum / period;
        
        for (let i = period; i < data.length; i++) {
            ema.push((data[i] - ema[i - 1]) * multiplier + ema[i - 1]);
        }
        
        return ema;
    }

    // ============================================
    // EXPORT CHART
    // ============================================
    addExportButton(chartId, chart, symbol) {
        const exportBtn = document.querySelector(`[data-action="export"][data-chart="${chartId}"]`);
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                const url = chart.toBase64Image();
                const link = document.createElement('a');
                link.download = `${symbol}_chart_${Date.now()}.png`;
                link.href = url;
                link.click();
            });
        }
    }
    
    exportTableAsCSV(tableData, filename) {
        let csvContent = '';
        
        // Headers
        csvContent += tableData.headers.join(',') + '\n';
        
        // Rows
        tableData.rows.forEach(row => {
            csvContent += row.join(',') + '\n';
        });
        
        // Create blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // ============================================
    // UTILITY FUNCTIONS
    // ============================================
    getDataPointsCount(period) {
        const counts = {
            '1d': 24,
            '1w': 7,
            '1M': 30,
            '3M': 90,
            '6M': 180,
            '1y': 100,
            '2y': 200,
            '5y': 250,
            '10y': 500,
            'ytd': 250,
            'max': 500,
            'ipo': 60
        };
        return counts[period] || 100;
    }

    getIntervalMillis(period) {
        const intervals = {
            '1d': 3600000,
            '1w': 86400000,
            '1m': 86400000,
            '3m': 86400000,
            '6m': 86400000,
            '1y': 86400000,
            '2y': 86400000 * 2,
            '5y': 86400000 * 5,
            '10y': 86400000 * 10,
            'ytd': 86400000,
            'ipo': 86400000
        };
        return intervals[period] || 86400000;
    }

    hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    deepMerge(target, source) {
        const output = Object.assign({}, target);
        if (this.isObject(target) && this.isObject(source)) {
            Object.keys(source).forEach(key => {
                if (this.isObject(source[key])) {
                    if (!(key in target)) {
                        Object.assign(output, { [key]: source[key] });
                    } else {
                        output[key] = this.deepMerge(target[key], source[key]);
                    }
                } else {
                    Object.assign(output, { [key]: source[key] });
                }
            });
        }
        return output;
    }

    isObject(item) {
        return item && typeof item === 'object' && !Array.isArray(item);
    }

    // ============================================
    // CLEANUP
    // ============================================
    destroyChart(chartId) {
        const chart = this.activeCharts.get(chartId);
        if (chart) {
            chart.destroy();
            this.activeCharts.delete(chartId);
        }
    }

    destroyAllCharts() {
        this.activeCharts.forEach(chart => chart.destroy());
        this.activeCharts.clear();
    }
}

// ============================================
// EXPORT
// ============================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChatbotCharts;
}

window.ChatbotCharts = ChatbotCharts;