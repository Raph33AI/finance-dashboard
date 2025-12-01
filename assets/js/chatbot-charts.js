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
            const { type, symbol, data, indicators } = chartRequest;
            
            // Generate unique ID
            const chartId = `chart-${++this.chartCounter}`;
            
            // ✅ CONVERTIR CANDLESTICK EN LINE (Chart.js standard)
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
                // ✅ Pour candlestick, utiliser line avec min/max
                chartData = await this.fetchCandlestickData(symbol, data);
                // Convertir en données line
                chartData = this.convertCandlestickToLine(chartData);
            } else if (type === 'line') {
                chartData = await this.fetchLineData(symbol, data);
            } else if (type === 'bar') {
                chartData = await this.fetchBarData(symbol, data);
            } else if (type === 'area') {
                chartData = await this.fetchAreaData(symbol, data);
            } else {
                chartData = await this.fetchLineData(symbol, data);
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

        // ✅ AJOUTER INDICATEURS TECHNIQUES SI DEMANDÉS
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
    async fetchLineData(symbol, period) {
        console.log(`📊 Fetching line data for ${symbol}, period: ${period}`);
        
        // ✅ SI ANALYTICS DISPONIBLE, UTILISER VRAIES DONNÉES
        if (window.financialChatbot && window.financialChatbot.engine && window.financialChatbot.engine.analytics) {
            try {
                const analytics = window.financialChatbot.engine.analytics;
                const outputsize = this.getDataPointsCount(period);
                
                const timeSeries = await analytics.getTimeSeries(symbol, '1day', outputsize);
                
                if (timeSeries && timeSeries.data && timeSeries.data.length > 0) {
                    console.log(`✅ Real data loaded: ${timeSeries.data.length} points`);
                    
                    return {
                        labels: timeSeries.data.map(d => d.datetime),
                        values: timeSeries.data.map(d => d.close)
                    };
                }
            } catch (error) {
                console.warn('⚠️ Could not fetch real data, using mock:', error);
            }
        }
        
        // ✅ FALLBACK: Mock data
        console.warn(`⚠️ Using mock data for ${symbol}`);
        const dataPoints = this.getDataPointsCount(period);
        const now = Date.now();
        const interval = this.getIntervalMillis(period);
        
        const labels = [];
        const values = [];
        let basePrice = 100 + Math.random() * 100;
        
        for (let i = 0; i < dataPoints; i++) {
            const timestamp = now - (dataPoints - i) * interval;
            labels.push(new Date(timestamp).toLocaleDateString());
            
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
            labels.push(date.toLocaleDateString());
            
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

    // ✅ NOUVELLE MÉTHODE : Convertir candlestick en line
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
            '1y': 365,
            '2y': 730,
            '5y': 1825,   // ✅ 5 ans
            '10y': 3650,  // ✅ 10 ans
            'ytd': 250,
            'max': 5000,
            'ipo': 60
        };
        return counts[period] || 365;
    }

    getIntervalMillis(period) {
        const intervals = {
            '1d': 3600000,
            '1w': 86400000,
            '1m': 86400000,
            '3m': 86400000,
            '6m': 86400000,
            '1y': 86400000,
            '2y': 86400000,
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