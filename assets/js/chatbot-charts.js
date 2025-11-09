// ============================================
// CHATBOT CHARTS - PREMIUM VISUALIZATIONS
// Advanced Chart.js Integration
// ============================================

class ChatbotCharts {
    constructor(config) {
        this.config = config;
        this.activeCharts = new Map();
        this.chartCounter = 0;
        
        // Check if Chart.js is loaded
        if (typeof Chart === 'undefined') {
            console.warn('⚠️ Chart.js not loaded. Charts will not be available.');
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
        Chart.defaults.font.family = this.config.ui.fontFamily || "'Inter', sans-serif";
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
            const { type, symbol, data, indicators } = chartRequest;
            
            // Generate unique ID
            const chartId = `chart-${++this.chartCounter}`;
            
            // Create chart container HTML
            const chartHTML = this.createChartHTML(chartId, symbol, type);
            container.innerHTML = chartHTML;
            
            // Get canvas element
            const canvas = container.querySelector(`#${chartId}`);
            if (!canvas) {
                throw new Error('Canvas element not found');
            }

            // Fetch data based on chart type
            let chartData;
            switch (type) {
                case 'candlestick':
                    chartData = await this.fetchCandlestickData(symbol, data);
                    break;
                case 'line':
                    chartData = await this.fetchLineData(symbol, data);
                    break;
                case 'bar':
                    chartData = await this.fetchBarData(symbol, data);
                    break;
                case 'area':
                    chartData = await this.fetchAreaData(symbol, data);
                    break;
                default:
                    chartData = await this.fetchLineData(symbol, data);
            }

            // Create chart
            const chart = this.renderChart(canvas, type, chartData, indicators);
            
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
    // CREATE CHART HTML
    // ============================================
    createChartHTML(chartId, symbol, type) {
        return `
            <div class="chart-container">
                <div class="chart-header">
                    <span class="chart-title">${symbol} - ${type.toUpperCase()} Chart</span>
                    <div class="chart-actions">
                        <button class="chart-btn" data-action="export" data-chart="${chartId}">
                            📥 Export
                        </button>
                        <button class="chart-btn" data-action="fullscreen" data-chart="${chartId}">
                            ⛶ Fullscreen
                        </button>
                    </div>
                </div>
                <div class="chart-canvas-wrapper">
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
            case 'candlestick':
                chartConfig = this.getCandlestickConfig(data, indicators);
                break;
            case 'line':
                chartConfig = this.getLineConfig(data);
                break;
            case 'bar':
                chartConfig = this.getBarConfig(data);
                break;
            case 'area':
                chartConfig = this.getAreaConfig(data);
                break;
            default:
                chartConfig = this.getLineConfig(data);
        }

        return new Chart(ctx, chartConfig);
    }

    // ============================================
    // LINE CHART CONFIG
    // ============================================
    getLineConfig(data) {
        return {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
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
                }]
            },
            options: this.getCommonOptions({
                plugins: {
                    legend: {
                        display: true
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
                        displayColors: false,
                        callbacks: {
                            label: (context) => {
                                return `Price: $${context.parsed.y.toFixed(2)}`;
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
        const config = this.getLineConfig(data);
        config.data.datasets[0].fill = 'start';
        config.data.datasets[0].backgroundColor = this.createGradient(data.values);
        return config;
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
                    backgroundColor: this.config.charts.colors.primary,
                    borderColor: this.config.charts.colors.primary,
                    borderWidth: 1
                }]
            },
            options: this.getCommonOptions({
                plugins: {
                    legend: {
                        display: true
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
    // CANDLESTICK CHART CONFIG
    // ============================================
    getCandlestickConfig(data, indicators = []) {
        const datasets = [{
            label: 'Price',
            data: data.candlesticks,
            type: 'candlestick',
            color: {
                up: this.config.charts.colors.success,
                down: this.config.charts.colors.danger,
                unchanged: this.config.charts.colors.text
            }
        }];

        // Add technical indicators
        if (indicators.includes('sma')) {
            datasets.push({
                label: 'SMA 20',
                data: this.calculateSMA(data.closes, 20),
                type: 'line',
                borderColor: this.config.charts.colors.warning,
                borderWidth: 1,
                pointRadius: 0,
                fill: false
            });
        }

        return {
            type: 'candlestick',
            data: {
                labels: data.labels,
                datasets: datasets
            },
            options: this.getCommonOptions({
                plugins: {
                    legend: {
                        display: true
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
                },
                zoom: this.config.charts.enableZoom ? {
                    zoom: {
                        wheel: {
                            enabled: true
                        },
                        pinch: {
                            enabled: true
                        },
                        mode: 'x'
                    },
                    pan: {
                        enabled: this.config.charts.enablePan,
                        mode: 'x'
                    }
                } : undefined
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
    // FETCH DATA METHODS
    // ============================================
    async fetchLineData(symbol, period) {
        // Mock data - replace with actual API call
        const dataPoints = this.getDataPointsCount(period);
        const now = Date.now();
        const interval = this.getIntervalMillis(period);
        
        const labels = [];
        const values = [];
        let basePrice = 100 + Math.random() * 100;
        
        for (let i = 0; i < dataPoints; i++) {
            const timestamp = now - (dataPoints - i) * interval;
            labels.push(new Date(timestamp).toLocaleDateString());
            
            // Simulate price movement
            basePrice += (Math.random() - 0.5) * 5;
            values.push(basePrice);
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
            labels.push(date.toLocaleDateString());
            
            const open = basePrice;
            const close = open + (Math.random() - 0.5) * 10;
            const high = Math.max(open, close) + Math.random() * 3;
            const low = Math.min(open, close) - Math.random() * 3;
            
            candlesticks.push({ x: date, o: open, h: high, l: low, c: close });
            closes.push(close);
            
            basePrice = close;
        }
        
        return { labels, candlesticks, closes };
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
                sma.push(sum / period);
            }
        }
        return sma;
    }

    calculateEMA(data, period) {
        const ema = [];
        const multiplier = 2 / (period + 1);
        
        // Start with SMA
        let sum = 0;
        for (let i = 0; i < period; i++) {
            sum += data[i];
            ema.push(null);
        }
        ema[period - 1] = sum / period;
        
        // Calculate EMA
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

    // ============================================
    // UTILITY FUNCTIONS
    // ============================================
    getDataPointsCount(period) {
        const counts = {
            '1d': 24,
            '1w': 7,
            '1m': 30,
            '3m': 90,
            '6m': 180,
            '1y': 365,
            'ytd': 250,
            'ipo': 60
        };
        return counts[period] || 30;
    }

    getIntervalMillis(period) {
        const intervals = {
            '1d': 3600000, // 1 hour
            '1w': 86400000, // 1 day
            '1m': 86400000, // 1 day
            '3m': 86400000,
            '6m': 86400000,
            '1y': 86400000,
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

    createGradient(values) {
        // This would need canvas context - simplified for now
        return this.hexToRgba(this.config.charts.colors.primary, 0.2);
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