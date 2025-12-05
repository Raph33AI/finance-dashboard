// ============================================
// CHATBOT CHARTS v4.1 - ULTRA-PREMIUM VISUALIZATIONS
// ✅ CORRECTION: Couleurs adaptatives dark/light mode
// 25+ Chart Types: Correlation, Risk Metrics, Volatility, Valuation, etc.
// Context-Aware Rendering with Advanced Financial Analytics
// ============================================

class ChatbotCharts {
    constructor(config) {
        this.config = config;
        this.activeCharts = new Map();
        this.chartCounter = 0;
        
        // Check if Chart.js is loaded
        if (typeof Chart === 'undefined') {
            console.warn('❌ Chart.js not loaded. Charts will not be available.');
            this.chartsAvailable = false;
        } else {
            this.chartsAvailable = true;
            this.configureChartDefaults();
            console.log('✅ ChatbotCharts v4.1 initialized - 25+ chart types available');
            console.log('🎨 Adaptive colors for dark/light mode enabled');
        }
    }

    // ============================================
    // ✅ CONFIGURE CHART DEFAULTS (CORRECTION MAJEURE)
    // ============================================
    configureChartDefaults() {
        const colors = this.getAdaptiveColors();
        
        Chart.defaults.color = colors.text;
        Chart.defaults.borderColor = colors.grid;
        Chart.defaults.font.family = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
        Chart.defaults.animation.duration = this.config.charts.animation.duration;
        Chart.defaults.animation.easing = this.config.charts.animation.easing;
        
        console.log('🎨 Chart.js defaults configured:');
        console.log('   Text color:', Chart.defaults.color);
        console.log('   Grid color:', Chart.defaults.borderColor);
    }
    
    // ✅ NOUVELLE MÉTHODE: Obtenir couleurs adaptatives
    getAdaptiveColors() {
        if (this.config.charts.colors.getColors) {
            return this.config.charts.colors.getColors();
        }
        
        const isDarkMode = document.body.classList.contains('dark-mode');
        
        if (isDarkMode) {
            return {
                primary: '#667eea',
                secondary: '#764ba2',
                success: '#38ef7d',
                danger: '#f45c43',
                warning: '#ffbe0b',
                info: '#00d9ff',
                grid: 'rgba(255, 255, 255, 0.1)',
                text: 'rgba(255, 255, 255, 0.9)',
                background: 'rgba(15, 23, 42, 0.95)'
            };
        } else {
            return {
                primary: '#667eea',
                secondary: '#764ba2',
                success: '#10b981',
                danger: '#ef4444',
                warning: '#f59e0b',
                info: '#06b6d4',
                grid: 'rgba(0, 0, 0, 0.08)',
                text: 'rgba(30, 41, 59, 0.9)',
                background: 'rgba(255, 255, 255, 0.98)'
            };
        }
    }

    // ============================================
    // MAIN CHART CREATION DISPATCHER
    // ============================================
    async createChart(chartRequest, container) {
        if (!this.chartsAvailable) {
            console.warn('⚠ Charts not available');
            return null;
        }

        try {
            const { type } = chartRequest;
            
            console.log(`📊 Creating chart: ${type}`);
            
            this.configureChartDefaults();
            
            const chartId = `chart-${++this.chartCounter}`;
            
            // COMPARISON CHARTS
            if (type === 'normalized-comparison' || type === 'comparison') {
                return await this.createNormalizedComparisonChart(chartId, chartRequest, container);
            }
            
            if (type === 'scatter-correlation') {
                return await this.createScatterCorrelationChart(chartId, chartRequest, container);
            }
            
            if (type === 'rolling-correlation') {
                return await this.createRollingCorrelationChart(chartId, chartRequest, container);
            }
            
            if (type === 'returns-bar-chart') {
                return await this.createReturnsBarChart(chartId, chartRequest, container);
            }
            
            // RISK-ADJUSTED CHARTS
            if (type === 'risk-metrics-comparison') {
                return await this.createRiskMetricsComparisonChart(chartId, chartRequest, container);
            }
            
            if (type === 'return-vs-risk-scatter') {
                return await this.createReturnVsRiskScatter(chartId, chartRequest, container);
            }
            
            if (type === 'alpha-beta-chart') {
                return await this.createAlphaBetaChart(chartId, chartRequest, container);
            }
            
            // VOLATILITY CHARTS
            if (type === 'rolling-volatility') {
                return await this.createRollingVolatilityChart(chartId, chartRequest, container);
            }
            
            if (type === 'drawdown-comparison' || type === 'drawdown-chart') {
                return await this.createDrawdownChart(chartId, chartRequest, container);
            }
            
            if (type === 'var-comparison') {
                return await this.createVaRComparisonChart(chartId, chartRequest, container);
            }
            
            if (type === 'volatility-chart') {
                return await this.createVolatilityChart(chartId, chartRequest, container);
            }
            
            // VALUATION CHARTS
            if (type === 'valuation-multiples') {
                return await this.createValuationMultiplesChart(chartId, chartRequest, container);
            }
            
            if (type === 'price-to-fair-value') {
                return await this.createPriceToFairValueChart(chartId, chartRequest, container);
            }
            
            // FUNDAMENTALS CHARTS
            if (type === 'profitability-comparison') {
                return await this.createProfitabilityComparisonChart(chartId, chartRequest, container);
            }
            
            if (type === 'growth-comparison') {
                return await this.createGrowthComparisonChart(chartId, chartRequest, container);
            }
            
            if (type === 'fundamentals-dashboard') {
                return await this.createFundamentalsDashboard(chartId, chartRequest, container);
            }
            
            // HISTORICAL ANALYSIS CHARTS
            if (type === 'candlestick-with-indicators') {
                return await this.createCandlestickWithIndicators(chartId, chartRequest, container);
            }
            
            if (type === 'cumulative-returns') {
                return await this.createCumulativeReturnsChart(chartId, chartRequest, container);
            }
            
            if (type === 'returns-distribution') {
                return await this.createReturnsDistributionChart(chartId, chartRequest, container);
            }
            
            if (type === 'risk-metrics-dashboard') {
                return await this.createRiskMetricsDashboard(chartId, chartRequest, container);
            }
            
            // ANALYST & EARNINGS CHARTS
            if (type === 'analyst-recommendations') {
                return await this.createAnalystRecommendationsChart(chartId, chartRequest, container);
            }
            
            if (type === 'price-target-chart') {
                return await this.createPriceTargetChart(chartId, chartRequest, container);
            }
            
            if (type === 'earnings-surprises') {
                return await this.createEarningsSurprisesChart(chartId, chartRequest, container);
            }
            
            if (type === 'earnings-beat-rate') {
                return await this.createEarningsBeatRateChart(chartId, chartRequest, container);
            }
            
            // TECHNICAL ANALYSIS
            if (type === 'technical-analysis') {
                return await this.createTechnicalAnalysisChart(chartId, chartRequest, container);
            }
            
            // MARKET OVERVIEW
            if (type === 'market-indices') {
                return await this.createMarketIndicesChart(chartId, chartRequest, container);
            }
            
            // TABLES
            if (type === 'metrics-table') {
                return this.createMetricsTable(chartId, chartRequest.data, container);
            }
            
            // STANDARD CHARTS (fallback)
            if (type === 'line' || type === 'bar' || type === 'area') {
                return await this.createStandardChart(chartId, chartRequest, container);
            }
            
            throw new Error(`Unknown chart type: ${type}`);

        } catch (error) {
            console.error('❌ Chart creation error:', error);
            container.innerHTML = `<div class="chart-error">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Failed to create chart: ${error.message}</p>
            </div>`;
            return null;
        }
    }

    // ============================================
    // ✅ CHART COLORS PALETTE (CORRECTION)
    // ============================================
    getColorPalette() {
        const colors = this.getAdaptiveColors();
        
        return {
            primary: colors.primary,
            secondary: colors.secondary,
            success: colors.success,
            warning: colors.warning,
            danger: colors.danger,
            info: colors.info,
            purple: '#8b5cf6',
            pink: '#ec4899',
            indigo: '#6366f1',
            teal: '#14b8a6',
            orange: '#f97316',
            emerald: '#059669'
        };
    }
    
    getColorArray(count = 6) {
        const palette = this.getColorPalette();
        const colors = [
            palette.primary,
            palette.secondary,
            palette.success,
            palette.warning,
            palette.danger,
            palette.info,
            palette.purple,
            palette.pink,
            palette.indigo,
            palette.teal,
            palette.orange,
            palette.emerald
        ];
        
        return colors.slice(0, count);
    }

    // ════════════════════════════════════════════════════════════
    // COMPARISON CHARTS
    // ════════════════════════════════════════════════════════════

    async createNormalizedComparisonChart(chartId, chartRequest, container) {
        const { symbols, timeSeries, title, description } = chartRequest;
        const adaptiveColors = this.getAdaptiveColors();
        
        const chartHTML = this.createChartHTML(chartId, title || `${symbols.join(' vs ')} - Performance Comparison`, description);
        container.innerHTML = chartHTML;
        
        const canvas = container.querySelector(`#${chartId}`);
        if (!canvas) throw new Error('Canvas not found');
        
        const datasets = [];
        const colors = this.getColorArray(symbols.length);
        
        let commonLabels = [];
        if (timeSeries[0]?.data) {
            commonLabels = timeSeries[0].data.map(d => {
                const date = new Date(d.datetime);
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            });
        }
        
        timeSeries.forEach((series, index) => {
            if (!series.data || series.data.length === 0) return;
            
            const firstPrice = series.data[0].close;
            const normalizedData = series.data.map(d => ((d.close / firstPrice) * 100).toFixed(2));
            
            datasets.push({
                label: series.symbol,
                data: normalizedData,
                borderColor: colors[index],
                backgroundColor: 'transparent',
                borderWidth: 2.5,
                tension: 0.4,
                fill: false,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: colors[index],
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 2
            });
        });
        
        const chart = new Chart(canvas, {
            type: 'line',
            data: { labels: commonLabels, datasets: datasets },
            options: this.getCommonOptions({
                plugins: {
                    title: {
                        display: true,
                        text: title || 'Performance Comparison (Normalized to 100)',
                        font: { size: 16, weight: 'bold' },
                        color: adaptiveColors.text,
                        padding: 20
                    },
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: adaptiveColors.text,
                            usePointStyle: true,
                            padding: 15,
                            font: { size: 13, weight: '600' }
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: (context) => `${context.dataset.label}: ${context.parsed.y}`
                        }
                    }
                },
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: 'Normalized Performance (Base = 100)',
                            color: adaptiveColors.text,
                            font: { size: 12, weight: '600' }
                        },
                        ticks: {
                            color: adaptiveColors.text
                        },
                        grid: {
                            color: adaptiveColors.grid
                        }
                    },
                    x: {
                        ticks: {
                            color: adaptiveColors.text
                        },
                        grid: {
                            color: adaptiveColors.grid
                        }
                    }
                }
            })
        });
        
        this.activeCharts.set(chartId, chart);
        this.addExportButton(chartId, chart, symbols.join('_vs_'));
        
        return chartId;
    }

    async createScatterCorrelationChart(chartId, chartRequest, container) {
        const { symbols, timeSeries, correlationData, title, description } = chartRequest;
        const adaptiveColors = this.getAdaptiveColors();
        
        const chartHTML = this.createChartHTML(chartId, title || `${symbols[0]} vs ${symbols[1]} - Correlation`, description);
        container.innerHTML = chartHTML;
        
        const canvas = container.querySelector(`#${chartId}`);
        if (!canvas) throw new Error('Canvas not found');
        
        const returns1 = this.calculateReturns(timeSeries[0].data.map(d => d.close));
        const returns2 = this.calculateReturns(timeSeries[1].data.map(d => d.close));
        
        const scatterData = returns1.map((r1, i) => ({
            x: (r1 * 100).toFixed(3),
            y: (returns2[i] * 100).toFixed(3)
        }));
        
        const chart = new Chart(canvas, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Daily Returns',
                    data: scatterData,
                    backgroundColor: this.hexToRgba(this.getColorPalette().primary, 0.6),
                    borderColor: this.getColorPalette().primary,
                    borderWidth: 1,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: this.getCommonOptions({
                plugins: {
                    title: {
                        display: true,
                        text: `Correlation: ${correlationData?.correlation || 'N/A'} (${correlationData?.interpretation || 'N/A'})`,
                        font: { size: 16, weight: 'bold' },
                        color: adaptiveColors.text,
                        padding: 20
                    },
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (context) => `${symbols[0]}: ${context.parsed.x}% | ${symbols[1]}: ${context.parsed.y}%`
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: `${symbols[0]} Daily Return (%)`,
                            color: adaptiveColors.text,
                            font: { size: 12, weight: '600' }
                        },
                        ticks: {
                            color: adaptiveColors.text
                        },
                        grid: {
                            color: adaptiveColors.grid
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: `${symbols[1]} Daily Return (%)`,
                            color: adaptiveColors.text,
                            font: { size: 12, weight: '600' }
                        },
                        ticks: {
                            color: adaptiveColors.text
                        },
                        grid: {
                            color: adaptiveColors.grid
                        }
                    }
                }
            })
        });
        
        this.activeCharts.set(chartId, chart);
        this.addExportButton(chartId, chart, `${symbols[0]}_${symbols[1]}_correlation`);
        
        return chartId;
    }

    async createRollingCorrelationChart(chartId, chartRequest, container) {
        const { symbols, timeSeries, window = 30, title, description } = chartRequest;
        const adaptiveColors = this.getAdaptiveColors();
        
        const chartHTML = this.createChartHTML(chartId, title || `${symbols[0]}-${symbols[1]} Rolling Correlation`, description);
        container.innerHTML = chartHTML;
        
        const canvas = container.querySelector(`#${chartId}`);
        if (!canvas) throw new Error('Canvas not found');
        
        const returns1 = this.calculateReturns(timeSeries[0].data.map(d => d.close));
        const returns2 = this.calculateReturns(timeSeries[1].data.map(d => d.close));
        
        const rollingCorr = this.calculateRollingCorrelation(returns1, returns2, window);
        
        const labels = timeSeries[0].data.slice(window).map(d => {
            const date = new Date(d.datetime);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        
        const chart = new Chart(canvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: `${window}-Day Correlation`,
                    data: rollingCorr,
                    borderColor: this.getColorPalette().info,
                    backgroundColor: this.hexToRgba(this.getColorPalette().info, 0.1),
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 0,
                    pointHoverRadius: 5
                }]
            },
            options: this.getCommonOptions({
                plugins: {
                    title: {
                        display: true,
                        text: title || `Rolling ${window}-Day Correlation`,
                        font: { size: 16, weight: 'bold' },
                        color: adaptiveColors.text
                    },
                    legend: { display: false }
                },
                scales: {
                    y: {
                        min: -1,
                        max: 1,
                        title: {
                            display: true,
                            text: 'Correlation Coefficient',
                            font: { size: 12, weight: '600' },
                            color: adaptiveColors.text
                        },
                        ticks: {
                            color: adaptiveColors.text
                        },
                        grid: {
                            color: adaptiveColors.grid
                        }
                    },
                    x: {
                        ticks: {
                            color: adaptiveColors.text
                        },
                        grid: {
                            color: adaptiveColors.grid
                        }
                    }
                }
            })
        });
        
        this.activeCharts.set(chartId, chart);
        this.addExportButton(chartId, chart, `${symbols[0]}_${symbols[1]}_rolling_corr`);
        
        return chartId;
    }

    async createReturnsBarChart(chartId, chartRequest, container) {
        const { symbols, data, title, description } = chartRequest;
        const adaptiveColors = this.getAdaptiveColors();
        
        const chartHTML = this.createChartHTML(chartId, title || `${symbols.join(' vs ')} - Total Returns`, description);
        container.innerHTML = chartHTML;
        
        const canvas = container.querySelector(`#${chartId}`);
        if (!canvas) throw new Error('Canvas not found');
        
        const labels = data.map(d => d.symbol);
        const returns = data.map(d => parseFloat(d.return));
        const colors = returns.map(r => r >= 0 ? this.getColorPalette().success : this.getColorPalette().danger);
        
        const chart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Total Return (%)',
                    data: returns,
                    backgroundColor: colors,
                    borderColor: colors,
                    borderWidth: 2
                }]
            },
            options: this.getCommonOptions({
                plugins: {
                    title: {
                        display: true,
                        text: title || 'Total Returns Comparison',
                        font: { size: 16, weight: 'bold' },
                        color: adaptiveColors.text
                    },
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (context) => `${context.parsed.y.toFixed(2)}%`
                        }
                    }
                },
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: 'Total Return (%)',
                            font: { size: 12, weight: '600' },
                            color: adaptiveColors.text
                        },
                        ticks: {
                            callback: (value) => `${value}%`,
                            color: adaptiveColors.text
                        },
                        grid: {
                            color: adaptiveColors.grid
                        }
                    },
                    x: {
                        ticks: {
                            color: adaptiveColors.text
                        },
                        grid: {
                            color: adaptiveColors.grid
                        }
                    }
                }
            })
        });
        
        this.activeCharts.set(chartId, chart);
        this.addExportButton(chartId, chart, `${symbols.join('_')}_returns`);
        
        return chartId;
    }

    // ════════════════════════════════════════════════════════════
    // RISK-ADJUSTED CHARTS
    // ════════════════════════════════════════════════════════════

    async createRiskMetricsComparisonChart(chartId, chartRequest, container) {
        const { symbols, data, metrics, title, description } = chartRequest;
        const adaptiveColors = this.getAdaptiveColors();
        
        const chartHTML = this.createChartHTML(chartId, title || 'Risk-Adjusted Returns Comparison', description);
        container.innerHTML = chartHTML;
        
        const canvas = container.querySelector(`#${chartId}`);
        if (!canvas) throw new Error('Canvas not found');
        
        const colors = this.getColorArray(symbols.length);
        
        const datasets = [];
        const metricLabels = {
            sharpe: 'Sharpe Ratio',
            sortino: 'Sortino Ratio',
            calmar: 'Calmar Ratio',
            treynor: 'Treynor Ratio'
        };
        
        const metricKeys = ['sharpe', 'sortino', 'calmar', 'treynor'];
        
        metricKeys.forEach((key, index) => {
            const values = data.map(d => {
                const value = parseFloat(d[key]);
                return isNaN(value) ? 0 : value;
            });
            
            datasets.push({
                label: metricLabels[key],
                data: values,
                backgroundColor: this.hexToRgba(colors[index], 0.8),
                borderColor: colors[index],
                borderWidth: 2
            });
        });
        
        const chart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: symbols,
                datasets: datasets
            },
            options: this.getCommonOptions({
                plugins: {
                    title: {
                        display: true,
                        text: title || 'Risk-Adjusted Returns Comparison',
                        font: { size: 16, weight: 'bold' },
                        color: adaptiveColors.text
                    },
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: adaptiveColors.text,
                            usePointStyle: true,
                            padding: 15
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => `${context.dataset.label}: ${context.parsed.y.toFixed(3)}`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Ratio Value (Higher is Better)',
                            font: { size: 12, weight: '600' },
                            color: adaptiveColors.text
                        },
                        ticks: {
                            color: adaptiveColors.text
                        },
                        grid: {
                            color: adaptiveColors.grid
                        }
                    },
                    x: {
                        ticks: {
                            color: adaptiveColors.text
                        },
                        grid: {
                            color: adaptiveColors.grid
                        }
                    }
                }
            })
        });
        
        this.activeCharts.set(chartId, chart);
        this.addExportButton(chartId, chart, `${symbols.join('_')}_risk_metrics`);
        
        return chartId;
    }

    async createReturnVsRiskScatter(chartId, chartRequest, container) {
        const { symbols, data, title, description } = chartRequest;
        const adaptiveColors = this.getAdaptiveColors();
        
        const chartHTML = this.createChartHTML(chartId, title || 'Return vs Risk Profile', description);
        container.innerHTML = chartHTML;
        
        const canvas = container.querySelector(`#${chartId}`);
        if (!canvas) throw new Error('Canvas not found');
        
        const colors = this.getColorArray(symbols.length);
        
        const datasets = data.map((item, index) => ({
            label: item.symbol,
            data: [{
                x: parseFloat(item.risk) || 0,
                y: parseFloat(item.return) || 0
            }],
            backgroundColor: this.hexToRgba(colors[index], 0.7),
            borderColor: colors[index],
            borderWidth: 2,
            pointRadius: 10,
            pointHoverRadius: 14
        }));
        
        const chart = new Chart(canvas, {
            type: 'scatter',
            data: { datasets: datasets },
            options: this.getCommonOptions({
                plugins: {
                    title: {
                        display: true,
                        text: title || 'Return vs Risk Profile',
                        font: { size: 16, weight: 'bold' },
                        color: adaptiveColors.text
                    },
                    legend: {
                        display: true,
                        position: 'right',
                        labels: {
                            color: adaptiveColors.text,
                            usePointStyle: true,
                            padding: 10
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const dataPoint = data[context.datasetIndex];
                                return [
                                    `${dataPoint.symbol}`,
                                    `Return: ${context.parsed.y.toFixed(2)}%`,
                                    `Risk: ${context.parsed.x.toFixed(2)}%`,
                                    `Sharpe: ${dataPoint.sharpe || 'N/A'}`
                                ];
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Volatility / Risk (%)',
                            font: { size: 12, weight: '600' },
                            color: adaptiveColors.text
                        },
                        ticks: {
                            color: adaptiveColors.text
                        },
                        grid: {
                            color: adaptiveColors.grid
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Annualized Return (%)',
                            font: { size: 12, weight: '600' },
                            color: adaptiveColors.text
                        },
                        ticks: {
                            color: adaptiveColors.text
                        },
                        grid: {
                            color: adaptiveColors.grid
                        }
                    }
                }
            })
        });
        
        this.activeCharts.set(chartId, chart);
        this.addExportButton(chartId, chart, `${symbols.join('_')}_return_risk`);
        
        return chartId;
    }

    async createAlphaBetaChart(chartId, chartRequest, container) {
        const { symbols, data, title, description } = chartRequest;
        const adaptiveColors = this.getAdaptiveColors();
        
        const chartHTML = this.createChartHTML(chartId, title || 'Alpha & Beta Analysis', description);
        container.innerHTML = chartHTML;
        
        const canvas = container.querySelector(`#${chartId}`);
        if (!canvas) throw new Error('Canvas not found');
        
        const alphaData = data.map(d => parseFloat(d.alpha) || 0);
        const betaData = data.map(d => parseFloat(d.beta) || 1);
        
        const chart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: symbols,
                datasets: [
                    {
                        label: 'Alpha (%)',
                        data: alphaData,
                        backgroundColor: this.hexToRgba(this.getColorPalette().success, 0.8),
                        borderColor: this.getColorPalette().success,
                        borderWidth: 2,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Beta',
                        data: betaData,
                        backgroundColor: this.hexToRgba(this.getColorPalette().info, 0.8),
                        borderColor: this.getColorPalette().info,
                        borderWidth: 2,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: this.getCommonOptions({
                plugins: {
                    title: {
                        display: true,
                        text: title || 'Alpha & Beta Analysis',
                        font: { size: 16, weight: 'bold' },
                        color: adaptiveColors.text
                    },
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: adaptiveColors.text
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                if (context.datasetIndex === 0) {
                                    return `Alpha: ${context.parsed.y.toFixed(2)}% (excess return)`;
                                } else {
                                    return `Beta: ${context.parsed.y.toFixed(2)} (market sensitivity)`;
                                }
                            }
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
                            text: 'Alpha (%)',
                            font: { size: 12, weight: '600' },
                            color: adaptiveColors.text
                        },
                        ticks: {
                            color: adaptiveColors.text
                        },
                        grid: {
                            color: adaptiveColors.grid
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Beta',
                            font: { size: 12, weight: '600' },
                            color: adaptiveColors.text
                        },
                        grid: {
                            drawOnChartArea: false
                        },
                        ticks: {
                            color: adaptiveColors.text
                        }
                    },
                    x: {
                        ticks: {
                            color: adaptiveColors.text
                        },
                        grid: {
                            color: adaptiveColors.grid
                        }
                    }
                }
            })
        });
        
        this.activeCharts.set(chartId, chart);
        this.addExportButton(chartId, chart, `${symbols.join('_')}_alpha_beta`);
        
        return chartId;
    }

    // ════════════════════════════════════════════════════════════
    // VOLATILITY CHARTS
    // ════════════════════════════════════════════════════════════

    async createRollingVolatilityChart(chartId, chartRequest, container) {
        const { symbols, timeSeries, window = 30, title, description } = chartRequest;
        const adaptiveColors = this.getAdaptiveColors();
        
        const chartHTML = this.createChartHTML(chartId, title || 'Rolling Volatility Comparison', description);
        container.innerHTML = chartHTML;
        
        const canvas = container.querySelector(`#${chartId}`);
        if (!canvas) throw new Error('Canvas not found');
        
        const colors = this.getColorArray(symbols.length);
        const datasets = [];
        
        let commonLabels = [];
        
        timeSeries.forEach((series, index) => {
            const returns = this.calculateReturns(series.data.map(d => d.close));
            const rollingVol = this.calculateRollingVolatility(returns, window);
            
            if (index === 0 && series.data.length > window) {
                commonLabels = series.data.slice(window).map(d => {
                    const date = new Date(d.datetime);
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                });
            }
            
            datasets.push({
                label: series.symbol,
                data: rollingVol,
                borderColor: colors[index],
                backgroundColor: 'transparent',
                borderWidth: 2,
                tension: 0.4,
                fill: false,
                pointRadius: 0,
                pointHoverRadius: 5
            });
        });
        
        const chart = new Chart(canvas, {
            type: 'line',
            data: { labels: commonLabels, datasets: datasets },
            options: this.getCommonOptions({
                plugins: {
                    title: {
                        display: true,
                        text: title || `Rolling ${window}-Day Volatility`,
                        font: { size: 16, weight: 'bold' },
                        color: adaptiveColors.text
                    },
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: adaptiveColors.text
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Annualized Volatility (%)',
                            font: { size: 12, weight: '600' },
                            color: adaptiveColors.text
                        },
                        ticks: {
                            callback: (value) => `${value.toFixed(1)}%`,
                            color: adaptiveColors.text
                        },
                        grid: {
                            color: adaptiveColors.grid
                        }
                    },
                    x: {
                        ticks: {
                            color: adaptiveColors.text
                        },
                        grid: {
                            color: adaptiveColors.grid
                        }
                    }
                }
            })
        });
        
        this.activeCharts.set(chartId, chart);
        this.addExportButton(chartId, chart, `${symbols.join('_')}_rolling_vol`);
        
        return chartId;
    }

    async createDrawdownChart(chartId, chartRequest, container) {
        const { symbol, symbols, timeSeries, title, description } = chartRequest;
        const adaptiveColors = this.getAdaptiveColors();
        
        const chartHTML = this.createChartHTML(chartId, title || 'Drawdown Analysis', description);
        container.innerHTML = chartHTML;
        
        const canvas = container.querySelector(`#${chartId}`);
        if (!canvas) throw new Error('Canvas not found');
        
        const colors = this.getColorArray(timeSeries ? timeSeries.length : 1);
        const datasets = [];
        
        let commonLabels = [];
        
        if (timeSeries && timeSeries.length > 0) {
            timeSeries.forEach((series, index) => {
                const drawdowns = this.calculateDrawdown(series.data.map(d => d.close));
                
                if (index === 0) {
                    commonLabels = series.data.map(d => {
                        const date = new Date(d.datetime);
                        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    });
                }
                
                datasets.push({
                    label: series.symbol,
                    data: drawdowns,
                    borderColor: colors[index],
                    backgroundColor: this.hexToRgba(colors[index], 0.2),
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 0,
                    pointHoverRadius: 5
                });
            });
        } else if (chartRequest.data && chartRequest.data.data) {
            const drawdowns = this.calculateDrawdown(chartRequest.data.data.map(d => d.close));
            commonLabels = chartRequest.data.data.map(d => {
                const date = new Date(d.datetime);
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            });
            
            datasets.push({
                label: symbol || 'Drawdown',
                data: drawdowns,
                borderColor: this.getColorPalette().danger,
                backgroundColor: this.hexToRgba(this.getColorPalette().danger, 0.2),
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                pointRadius: 0,
                pointHoverRadius: 5
            });
        }
        
        const chart = new Chart(canvas, {
            type: 'line',
            data: { labels: commonLabels, datasets: datasets },
            options: this.getCommonOptions({
                plugins: {
                    title: {
                        display: true,
                        text: title || 'Drawdown from Peak',
                        font: { size: 16, weight: 'bold' },
                        color: adaptiveColors.text
                    },
                    legend: {
                        display: datasets.length > 1,
                        position: 'top',
                        labels: {
                            color: adaptiveColors.text
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => `${context.dataset.label}: ${context.parsed.y.toFixed(2)}%`
                        }
                    }
                },
                scales: {
                    y: {
                        max: 0,
                        title: {
                            display: true,
                            text: 'Drawdown (%)',
                            font: { size: 12, weight: '600' },
                            color: adaptiveColors.text
                        },
                        ticks: {
                            callback: (value) => `${value.toFixed(0)}%`,
                            color: adaptiveColors.text
                        },
                        grid: {
                            color: adaptiveColors.grid
                        }
                    },
                    x: {
                        ticks: {
                            color: adaptiveColors.text
                        },
                        grid: {
                            color: adaptiveColors.grid
                        }
                    }
                }
            })
        });
        
        this.activeCharts.set(chartId, chart);
        this.addExportButton(chartId, chart, `${symbol || symbols.join('_')}_drawdown`);
        
        return chartId;
    }

    async createVaRComparisonChart(chartId, chartRequest, container) {
        const { symbols, data, title, description } = chartRequest;
        const adaptiveColors = this.getAdaptiveColors();
        
        const chartHTML = this.createChartHTML(chartId, title || 'Value at Risk Comparison', description);
        container.innerHTML = chartHTML;
        
        const canvas = container.querySelector(`#${chartId}`);
        if (!canvas) throw new Error('Canvas not found');
        
        const var95Data = data.map(d => parseFloat(d.var95) || 0);
        const cvar95Data = data.map(d => parseFloat(d.cvar95) || 0);
        
        const chart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: symbols,
                datasets: [
                    {
                        label: 'VaR 95%',
                        data: var95Data,
                        backgroundColor: this.hexToRgba(this.getColorPalette().warning, 0.8),
                        borderColor: this.getColorPalette().warning,
                        borderWidth: 2
                    },
                    {
                        label: 'CVaR 95%',
                        data: cvar95Data,
                        backgroundColor: this.hexToRgba(this.getColorPalette().danger, 0.8),
                        borderColor: this.getColorPalette().danger,
                        borderWidth: 2
                    }
                ]
            },
            options: this.getCommonOptions({
                plugins: {
                    title: {
                        display: true,
                        text: title || 'Value at Risk (95% Confidence)',
                        font: { size: 16, weight: 'bold' },
                        color: adaptiveColors.text
                    },
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: adaptiveColors.text
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => `${context.dataset.label}: ${context.parsed.y.toFixed(2)}%`
                        }
                    }
                },
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: 'Expected Loss (%)',
                            font: { size: 12, weight: '600' },
                            color: adaptiveColors.text
                        },
                        ticks: {
                            callback: (value) => `${value.toFixed(1)}%`,
                            color: adaptiveColors.text
                        },
                        grid: {
                            color: adaptiveColors.grid
                        }
                    },
                    x: {
                        ticks: {
                            color: adaptiveColors.text
                        },
                        grid: {
                            color: adaptiveColors.grid
                        }
                    }
                }
            })
        });
        
        this.activeCharts.set(chartId, chart);
        this.addExportButton(chartId, chart, `${symbols.join('_')}_var`);
        
        return chartId;
    }

    async createVolatilityChart(chartId, chartRequest, container) {
        const { symbol, data, title, description } = chartRequest;
        const adaptiveColors = this.getAdaptiveColors();
        
        const chartHTML = this.createChartHTML(chartId, title || `${symbol} - Historical Volatility`, description);
        container.innerHTML = chartHTML;
        
        const canvas = container.querySelector(`#${chartId}`);
        if (!canvas) throw new Error('Canvas not found');
        
        const returns = this.calculateReturns(data.data.map(d => d.close));
        const rollingVol = this.calculateRollingVolatility(returns, 30);
        
        const labels = data.data.slice(30).map(d => {
            const date = new Date(d.datetime);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        
        const chart = new Chart(canvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: '30-Day Volatility',
                    data: rollingVol,
                    borderColor: this.getColorPalette().warning,
                    backgroundColor: this.hexToRgba(this.getColorPalette().warning, 0.1),
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 0,
                    pointHoverRadius: 5
                }]
            },
            options: this.getCommonOptions({
                plugins: {
                    title: {
                        display: true,
                        text: title || `${symbol} - 30-Day Rolling Volatility`,
                        font: { size: 16, weight: 'bold' },
                        color: adaptiveColors.text
                    },
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Annualized Volatility (%)',
                            font: { size: 12, weight: '600' },
                            color: adaptiveColors.text
                        },
                        ticks: {
                            callback: (value) => `${value.toFixed(1)}%`,
                            color: adaptiveColors.text
                        },
                        grid: {
                            color: adaptiveColors.grid
                        }
                    },
                    x: {
                        ticks: {
                            color: adaptiveColors.text
                        },
                        grid: {
                            color: adaptiveColors.grid
                        }
                    }
                }
            })
        });
        
        this.activeCharts.set(chartId, chart);
        this.addExportButton(chartId, chart, `${symbol}_volatility`);
        
        return chartId;
    }

    // ════════════════════════════════════════════════════════════
    // VALUATION CHARTS
    // ════════════════════════════════════════════════════════════

    async createValuationMultiplesChart(chartId, chartRequest, container) {
        const { symbols, data, title, description } = chartRequest;
        const adaptiveColors = this.getAdaptiveColors();
        
        const chartHTML = this.createChartHTML(chartId, title || 'Valuation Multiples Comparison', description);
        container.innerHTML = chartHTML;
        
        const canvas = container.querySelector(`#${chartId}`);
        if (!canvas) throw new Error('Canvas not found');
        
        const colors = this.getColorArray(4);
        
        const peData = data.map(d => parseFloat(d.pe) || 0);
        const pbData = data.map(d => parseFloat(d.pb) || 0);
        const psData = data.map(d => parseFloat(d.ps) || 0);
        const pegData = data.map(d => parseFloat(d.peg) || 0);
        
        const chart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: symbols,
                datasets: [
                    {
                        label: 'P/E Ratio',
                        data: peData,
                        backgroundColor: this.hexToRgba(colors[0], 0.8),
                        borderColor: colors[0],
                        borderWidth: 2
                    },
                    {
                        label: 'P/B Ratio',
                        data: pbData,
                        backgroundColor: this.hexToRgba(colors[1], 0.8),
                        borderColor: colors[1],
                        borderWidth: 2
                    },
                    {
                        label: 'P/S Ratio',
                        data: psData,
                        backgroundColor: this.hexToRgba(colors[2], 0.8),
                        borderColor: colors[2],
                        borderWidth: 2
                    },
                    {
                        label: 'PEG Ratio',
                        data: pegData,
                        backgroundColor: this.hexToRgba(colors[3], 0.8),
                        borderColor: colors[3],
                        borderWidth: 2
                    }
                ]
            },
            options: this.getCommonOptions({
                plugins: {
                    title: {
                        display: true,
                        text: title || 'Valuation Multiples Comparison',
                        font: { size: 16, weight: 'bold' },
                        color: adaptiveColors.text
                    },
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: adaptiveColors.text
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Multiple Value',
                            font: { size: 12, weight: '600' },
                            color: adaptiveColors.text
                        },
                        ticks: {
                            color: adaptiveColors.text
                        },
                        grid: {
                            color: adaptiveColors.grid
                        }
                    },
                    x: {
                        ticks: {
                            color: adaptiveColors.text
                        },
                        grid: {
                            color: adaptiveColors.grid
                        }
                    }
                }
            })
        });
        
        this.activeCharts.set(chartId, chart);
        this.addExportButton(chartId, chart, `${symbols.join('_')}_valuation`);
        
        return chartId;
    }

    async createPriceToFairValueChart(chartId, chartRequest, container) {
        const { symbols, data, title, description } = chartRequest;
        const adaptiveColors = this.getAdaptiveColors();
        
        const chartHTML = this.createChartHTML(chartId, title || 'Current Price vs Fair Value', description);
        container.innerHTML = chartHTML;
        
        const canvas = container.querySelector(`#${chartId}`);
        if (!canvas) throw new Error('Canvas not found');
        
        const currentPrices = data.map(d => parseFloat(d.currentPrice) || 0);
        const fairValues = data.map(d => parseFloat(d.fairValue) || 0);
        
        const chart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: symbols,
                datasets: [
                    {
                        label: 'Current Price',
                        data: currentPrices,
                        backgroundColor: this.hexToRgba(this.getColorPalette().primary, 0.8),
                        borderColor: this.getColorPalette().primary,
                        borderWidth: 2
                    },
                    {
                        label: 'Analyst Fair Value',
                        data: fairValues,
                        backgroundColor: this.hexToRgba(this.getColorPalette().success, 0.8),
                        borderColor: this.getColorPalette().success,
                        borderWidth: 2
                    }
                ]
            },
            options: this.getCommonOptions({
                plugins: {
                    title: {
                        display: true,
                        text: title || 'Current Price vs Fair Value',
                        font: { size: 16, weight: 'bold' },
                        color: adaptiveColors.text
                    },
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: adaptiveColors.text
                        }
                    },
                    tooltip: {
                        callbacks: {
                            afterLabel: (context) => {
                                const upside = data[context.dataIndex].upside;
                                return upside ? `Upside: ${upside}%` : '';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Price ($)',
                            font: { size: 12, weight: '600' },
                            color: adaptiveColors.text
                        },
                        ticks: {
                            callback: (value) => `$${value.toFixed(2)}`,
                            color: adaptiveColors.text
                        },
                        grid: {
                            color: adaptiveColors.grid
                        }
                    },
                    x: {
                        ticks: {
                            color: adaptiveColors.text
                        },
                        grid: {
                            color: adaptiveColors.grid
                        }
                    }
                }
            })
        });
        
        this.activeCharts.set(chartId, chart);
        this.addExportButton(chartId, chart, `${symbols.join('_')}_fair_value`);
        
        return chartId;
    }

    // ════════════════════════════════════════════════════════════
    // FUNDAMENTALS CHARTS
    // ════════════════════════════════════════════════════════════

    async createProfitabilityComparisonChart(chartId, chartRequest, container) {
        const { symbols, data, title, description } = chartRequest;
        const adaptiveColors = this.getAdaptiveColors();
        
        const chartHTML = this.createChartHTML(chartId, title || 'Profitability Metrics Comparison', description);
        container.innerHTML = chartHTML;
        
        const canvas = container.querySelector(`#${chartId}`);
        if (!canvas) throw new Error('Canvas not found');
        
        const colors = this.getColorArray(4);
        
        const roeData = data.map(d => parseFloat(d.roe) || 0);
        const roaData = data.map(d => parseFloat(d.roa) || 0);
        const profitMarginData = data.map(d => parseFloat(d.profitMargin) || 0);
        const operatingMarginData = data.map(d => parseFloat(d.operatingMargin) || 0);
        
        const chart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: symbols,
                datasets: [
                    {
                        label: 'ROE (%)',
                        data: roeData,
                        backgroundColor: this.hexToRgba(colors[0], 0.8),
                        borderColor: colors[0],
                        borderWidth: 2
                    },
                    {
                        label: 'ROA (%)',
                        data: roaData,
                        backgroundColor: this.hexToRgba(colors[1], 0.8),
                        borderColor: colors[1],
                        borderWidth: 2
                    },
                    {
                        label: 'Profit Margin (%)',
                        data: profitMarginData,
                        backgroundColor: this.hexToRgba(colors[2], 0.8),
                        borderColor: colors[2],
                        borderWidth: 2
                    },
                    {
                        label: 'Operating Margin (%)',
                        data: operatingMarginData,
                        backgroundColor: this.hexToRgba(colors[3], 0.8),
                        borderColor: colors[3],
                        borderWidth: 2
                    }
                ]
            },
            options: this.getCommonOptions({
                plugins: {
                    title: {
                        display: true,
                        text: title || 'Profitability Metrics Comparison',
                        font: { size: 16, weight: 'bold' },
                        color: adaptiveColors.text
                    },
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: adaptiveColors.text
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Percentage (%)',
                            font: { size: 12, weight: '600' },
                            color: adaptiveColors.text
                        },
                        ticks: {
                            callback: (value) => `${value}%`,
                            color: adaptiveColors.text
                        },
                        grid: {
                            color: adaptiveColors.grid
                        }
                    },
                    x: {
                        ticks: {
                            color: adaptiveColors.text
                        },
                        grid: {
                            color: adaptiveColors.grid
                        }
                    }
                }
            })
        });
        
        this.activeCharts.set(chartId, chart);
        this.addExportButton(chartId, chart, `${symbols.join('_')}_profitability`);
        
        return chartId;
    }

    async createGrowthComparisonChart(chartId, chartRequest, container) {
        const { symbols, data, title, description } = chartRequest;
        const adaptiveColors = this.getAdaptiveColors();
        
        const chartHTML = this.createChartHTML(chartId, title || 'Growth Metrics Comparison', description);
        container.innerHTML = chartHTML;
        
        const canvas = container.querySelector(`#${chartId}`);
        if (!canvas) throw new Error('Canvas not found');
        
        const colors = this.getColorArray(3);
        
        const revenueGrowthData = data.map(d => parseFloat(d.revenueGrowth) || 0);
        const epsGrowthData = data.map(d => parseFloat(d.epsGrowth) || 0);
        const earningsGrowthData = data.map(d => parseFloat(d.earningsGrowth) || 0);
        
        const chart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: symbols,
                datasets: [
                    {
                        label: 'Revenue Growth (%)',
                        data: revenueGrowthData,
                        backgroundColor: this.hexToRgba(colors[0], 0.8),
                        borderColor: colors[0],
                        borderWidth: 2
                    },
                    {
                        label: 'EPS Growth (%)',
                        data: epsGrowthData,
                        backgroundColor: this.hexToRgba(colors[1], 0.8),
                        borderColor: colors[1],
                        borderWidth: 2
                    },
                    {
                        label: 'Earnings Growth (%)',
                        data: earningsGrowthData,
                        backgroundColor: this.hexToRgba(colors[2], 0.8),
                        borderColor: colors[2],
                        borderWidth: 2
                    }
                ]
            },
            options: this.getCommonOptions({
                plugins: {
                    title: {
                        display: true,
                        text: title || 'Growth Metrics Comparison',
                        font: { size: 16, weight: 'bold' },
                        color: adaptiveColors.text
                    },
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: adaptiveColors.text
                        }
                    }
                },
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: 'Year-over-Year Growth (%)',
                            font: { size: 12, weight: '600' },
                            color: adaptiveColors.text
                        },
                        ticks: {
                            callback: (value) => `${value}%`,
                            color: adaptiveColors.text
                        },
                        grid: {
                            color: adaptiveColors.grid
                        }
                    },
                    x: {
                        ticks: {
                            color: adaptiveColors.text
                        },
                        grid: {
                            color: adaptiveColors.grid
                        }
                    }
                }
            })
        });
        
        this.activeCharts.set(chartId, chart);
        this.addExportButton(chartId, chart, `${symbols.join('_')}_growth`);
        
        return chartId;
    }

    async createFundamentalsDashboard(chartId, chartRequest, container) {
        const { symbol, metrics, title, description } = chartRequest;
        
        const dashboardHTML = `
            <div class="fundamentals-dashboard" id="${chartId}">
                <div class="chart-header">
                    <h3 class="chart-title">${title || `${symbol} - Fundamental Metrics`}</h3>
                    ${description ? `<p class="chart-description">${description}</p>` : ''}
                </div>
                <div class="fundamentals-grid">
                    <div class="fundamental-card">
                        <div class="metric-label">P/E Ratio</div>
                        <div class="metric-value">${metrics.peRatio || 'N/A'}</div>
                    </div>
                    <div class="fundamental-card">
                        <div class="metric-label">EPS (TTM)</div>
                        <div class="metric-value">$${metrics.eps || 'N/A'}</div>
                    </div>
                    <div class="fundamental-card">
                        <div class="metric-label">Market Cap</div>
                        <div class="metric-value">$${metrics.marketCap || 'N/A'}B</div>
                    </div>
                    <div class="fundamental-card">
                        <div class="metric-label">ROE</div>
                        <div class="metric-value">${metrics.roe || 'N/A'}%</div>
                    </div>
                    <div class="fundamental-card">
                        <div class="metric-label">ROA</div>
                        <div class="metric-value">${metrics.roa || 'N/A'}%</div>
                    </div>
                    <div class="fundamental-card">
                        <div class="metric-label">Profit Margin</div>
                        <div class="metric-value">${metrics.profitMargin || 'N/A'}%</div>
                    </div>
                    <div class="fundamental-card">
                        <div class="metric-label">Debt/Equity</div>
                        <div class="metric-value">${metrics.debtToEquity || 'N/A'}</div>
                    </div>
                    <div class="fundamental-card">
                        <div class="metric-label">Current Ratio</div>
                        <div class="metric-value">${metrics.currentRatio || 'N/A'}</div>
                    </div>
                    <div class="fundamental-card">
                        <div class="metric-label">Beta</div>
                        <div class="metric-value">${metrics.beta || 'N/A'}</div>
                    </div>
                </div>
            </div>
        `;
        
        container.innerHTML = dashboardHTML;
        
        return chartId;
    }

    // ════════════════════════════════════════════════════════════
    // HISTORICAL ANALYSIS CHARTS
    // ════════════════════════════════════════════════════════════

    async createCandlestickWithIndicators(chartId, chartRequest, container) {
        return await this.createStandardChart(chartId, chartRequest, container);
    }

    async createCumulativeReturnsChart(chartId, chartRequest, container) {
        const { symbol, data, title, description } = chartRequest;
        const adaptiveColors = this.getAdaptiveColors();
        
        const chartHTML = this.createChartHTML(chartId, title || `${symbol} - Cumulative Returns`, description);
        container.innerHTML = chartHTML;
        
        const canvas = container.querySelector(`#${chartId}`);
        if (!canvas) throw new Error('Canvas not found');
        
        const prices = data.data.map(d => d.close);
        const initialPrice = prices[0];
        const cumulativeReturns = prices.map(p => ((p / initialPrice - 1) * 100).toFixed(2));
        
        const labels = data.data.map(d => {
            const date = new Date(d.datetime);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        
        const chart = new Chart(canvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Cumulative Return (%)',
                    data: cumulativeReturns,
                    borderColor: this.getColorPalette().success,
                    backgroundColor: this.hexToRgba(this.getColorPalette().success, 0.1),
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 0,
                    pointHoverRadius: 5
                }]
            },
            options: this.getCommonOptions({
                plugins: {
                    title: {
                        display: true,
                        text: title || `${symbol} - Cumulative Returns`,
                        font: { size: 16, weight: 'bold' },
                        color: adaptiveColors.text
                    },
                    legend: { display: false }
                },
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: 'Cumulative Return (%)',
                            font: { size: 12, weight: '600' },
                            color: adaptiveColors.text
                        },
                        ticks: {
                            callback: (value) => `${value}%`,
                            color: adaptiveColors.text
                        },
                        grid: {
                            color: adaptiveColors.grid
                        }
                    },
                    x: {
                        ticks: {
                            color: adaptiveColors.text
                        },
                        grid: {
                            color: adaptiveColors.grid
                        }
                    }
                }
            })
        });
        
        this.activeCharts.set(chartId, chart);
        this.addExportButton(chartId, chart, `${symbol}_cumulative_returns`);
        
        return chartId;
    }

    async createReturnsDistributionChart(chartId, chartRequest, container) {
        const { symbol, data, title, description } = chartRequest;
        const adaptiveColors = this.getAdaptiveColors();
        
        const chartHTML = this.createChartHTML(chartId, title || `${symbol} - Returns Distribution`, description);
        container.innerHTML = chartHTML;
        
        const canvas = container.querySelector(`#${chartId}`);
        if (!canvas) throw new Error('Canvas not found');
        
        const returns = this.calculateReturns(data.data.map(d => d.close));
        const returnsPercent = returns.map(r => r * 100);
        
        const histogram = this.createHistogram(returnsPercent, 30);
        
        const chart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: histogram.bins,
                datasets: [{
                    label: 'Frequency',
                    data: histogram.counts,
                    backgroundColor: this.hexToRgba(this.getColorPalette().primary, 0.7),
                    borderColor: this.getColorPalette().primary,
                    borderWidth: 1
                }]
            },
            options: this.getCommonOptions({
                plugins: {
                    title: {
                        display: true,
                        text: title || `${symbol} - Daily Returns Distribution`,
                        font: { size: 16, weight: 'bold' },
                        color: adaptiveColors.text
                    },
                    legend: { display: false }
                },
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: 'Frequency',
                            font: { size: 12, weight: '600' },
                            color: adaptiveColors.text
                        },
                        ticks: {
                            color: adaptiveColors.text
                        },
                        grid: {
                            color: adaptiveColors.grid
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Daily Return Range (%)',
                            font: { size: 12, weight: '600' },
                            color: adaptiveColors.text
                        },
                        ticks: {
                            color: adaptiveColors.text,
                            maxRotation: 45,
                            minRotation: 45
                        },
                        grid: {
                            color: adaptiveColors.grid
                        }
                    }
                }
            })
        });
        
        this.activeCharts.set(chartId, chart);
        this.addExportButton(chartId, chart, `${symbol}_returns_distribution`);
        
        return chartId;
    }

    async createRiskMetricsDashboard(chartId, chartRequest, container) {
        const { symbol, metrics, riskMetrics, title, description } = chartRequest;
        
        const dashboardHTML = `
            <div class="risk-metrics-dashboard" id="${chartId}">
                <div class="chart-header">
                    <h3 class="chart-title">${title || `${symbol} - Risk Metrics Dashboard`}</h3>
                    ${description ? `<p class="chart-description">${description}</p>` : ''}
                </div>
                <div class="risk-metrics-grid">
                    <div class="risk-metric-card">
                        <div class="metric-label">Sharpe Ratio</div>
                        <div class="metric-value">${metrics.sharpeRatio || 'N/A'}</div>
                        <div class="metric-sublabel">Risk-adjusted return</div>
                    </div>
                    <div class="risk-metric-card">
                        <div class="metric-label">Sortino Ratio</div>
                        <div class="metric-value">${metrics.sortinoRatio || 'N/A'}</div>
                        <div class="metric-sublabel">Downside risk-adjusted</div>
                    </div>
                    <div class="risk-metric-card">
                        <div class="metric-label">Calmar Ratio</div>
                        <div class="metric-value">${metrics.calmarRatio || 'N/A'}</div>
                        <div class="metric-sublabel">Return vs max drawdown</div>
                    </div>
                    <div class="risk-metric-card">
                        <div class="metric-label">Alpha</div>
                        <div class="metric-value">${metrics.alpha || 'N/A'}%</div>
                        <div class="metric-sublabel">Excess return vs market</div>
                    </div>
                    <div class="risk-metric-card">
                        <div class="metric-label">Beta</div>
                        <div class="metric-value">${metrics.beta || 'N/A'}</div>
                        <div class="metric-sublabel">Systematic risk</div>
                    </div>
                    <div class="risk-metric-card">
                        <div class="metric-label">VaR 95%</div>
                        <div class="metric-value">${riskMetrics.var95 || 'N/A'}%</div>
                        <div class="metric-sublabel">Max expected loss</div>
                    </div>
                    <div class="risk-metric-card">
                        <div class="metric-label">CVaR 95%</div>
                        <div class="metric-value">${riskMetrics.cvar95 || 'N/A'}%</div>
                        <div class="metric-sublabel">Expected shortfall</div>
                    </div>
                    <div class="risk-metric-card">
                        <div class="metric-label">Skewness</div>
                        <div class="metric-value">${riskMetrics.skewness || 'N/A'}</div>
                        <div class="metric-sublabel">Return asymmetry</div>
                    </div>
                    <div class="risk-metric-card">
                        <div class="metric-label">Kurtosis</div>
                        <div class="metric-value">${riskMetrics.kurtosis || 'N/A'}</div>
                        <div class="metric-sublabel">Tail risk</div>
                    </div>
                </div>
            </div>
        `;
        
        container.innerHTML = dashboardHTML;
        
        return chartId;
    }

    // ════════════════════════════════════════════════════════════
    // ANALYST & EARNINGS CHARTS
    // ════════════════════════════════════════════════════════════

    async createAnalystRecommendationsChart(chartId, chartRequest, container) {
        const { symbol, data, title, description } = chartRequest;
        const adaptiveColors = this.getAdaptiveColors();
        
        const chartHTML = this.createChartHTML(chartId, title || `${symbol} - Analyst Recommendations`, description);
        container.innerHTML = chartHTML;
        
        const canvas = container.querySelector(`#${chartId}`);
        if (!canvas) throw new Error('Canvas not found');
        
        const labels = ['Strong Buy', 'Buy', 'Hold', 'Sell', 'Strong Sell'];
        const values = [
            data.strongBuy || 0,
            data.buy || 0,
            data.hold || 0,
            data.sell || 0,
            data.strongSell || 0
        ];
        
        const colors = [
            this.getColorPalette().success,
            this.hexToRgba(this.getColorPalette().success, 0.6),
            this.getColorPalette().warning,
            this.hexToRgba(this.getColorPalette().danger, 0.6),
            this.getColorPalette().danger
        ];
        
        const chart = new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: colors,
                    borderColor: '#fff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: `${title || 'Analyst Recommendations'} - ${data.consensus || 'N/A'} (${data.total || 0} analysts)`,
                        font: { size: 16, weight: 'bold' },
                        color: adaptiveColors.text,
                        padding: 20
                    },
                    legend: {
                        display: true,
                        position: 'right',
                        labels: {
                            color: adaptiveColors.text,
                            usePointStyle: true,
                            padding: 15,
                            font: { size: 12, weight: '600' }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const total = values.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
                                return `${context.label}: ${context.parsed} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
        
        this.activeCharts.set(chartId, chart);
        this.addExportButton(chartId, chart, `${symbol}_analyst_recommendations`);
        
        return chartId;
    }

    async createPriceTargetChart(chartId, chartRequest, container) {
        const { symbol, currentPrice, priceTarget, title, description } = chartRequest;
        const adaptiveColors = this.getAdaptiveColors();
        
        const chartHTML = this.createChartHTML(chartId, title || `${symbol} - Price Target Analysis`, description);
        container.innerHTML = chartHTML;
        
        const canvas = container.querySelector(`#${chartId}`);
        if (!canvas) throw new Error('Canvas not found');
        
        const labels = ['Current', 'Target Low', 'Target Mean', 'Target High'];
        const values = [
            currentPrice,
            priceTarget.targetLow || 0,
            priceTarget.targetMean || 0,
            priceTarget.targetHigh || 0
        ];
        
        const colors = values.map((val, idx) => {
            if (idx === 0) return this.getColorPalette().info;
            if (val > currentPrice) return this.getColorPalette().success;
            if (val < currentPrice) return this.getColorPalette().danger;
            return this.getColorPalette().warning;
        });
        
        const chart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Price ($)',
                    data: values,
                    backgroundColor: colors.map(c => this.hexToRgba(c, 0.7)),
                    borderColor: colors,
                    borderWidth: 2
                }]
            },
            options: this.getCommonOptions({
                plugins: {
                    title: {
                        display: true,
                        text: `${title || 'Price Target Analysis'} - ${priceTarget.upside || 'N/A'}% upside`,
                        font: { size: 16, weight: 'bold' },
                        color: adaptiveColors.text,
                        padding: 20
                    },
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (context) => `$${context.parsed.y.toFixed(2)}`
                        }
                    }
                },
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: 'Price ($)',
                            font: { size: 12, weight: '600' },
                            color: adaptiveColors.text
                        },
                        beginAtZero: false,
                        ticks: {
                            callback: (value) => `$${value.toFixed(2)}`,
                            color: adaptiveColors.text
                        },
                        grid: {
                            color: adaptiveColors.grid
                        }
                    },
                    x: {
                        ticks: {
                            color: adaptiveColors.text
                        },
                        grid: {
                            color: adaptiveColors.grid
                        }
                    }
                }
            })
        });
        
        this.activeCharts.set(chartId, chart);
        this.addExportButton(chartId, chart, `${symbol}_price_target`);
        
        return chartId;
    }

    async createEarningsSurprisesChart(chartId, chartRequest, container) {
        const { symbol, data, title, description } = chartRequest;
        const adaptiveColors = this.getAdaptiveColors();
        
        const chartHTML = this.createChartHTML(chartId, title || `${symbol} - Earnings Surprises`, description);
        container.innerHTML = chartHTML;
        
        const canvas = container.querySelector(`#${chartId}`);
        if (!canvas) throw new Error('Canvas not found');
        
        const labels = data.map(e => e.period || 'N/A');
        const actual = data.map(e => parseFloat(e.actual) || 0);
        const estimate = data.map(e => parseFloat(e.estimate) || 0);
        const surprise = data.map(e => parseFloat(e.surprisePercent) || 0);
        
        const palette = this.getColorPalette();
        
        const chart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Actual EPS',
                        data: actual,
                        backgroundColor: this.hexToRgba(palette.success, 0.7),
                        borderColor: palette.success,
                        borderWidth: 2,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Estimated EPS',
                        data: estimate,
                        backgroundColor: this.hexToRgba(palette.info, 0.7),
                        borderColor: palette.info,
                        borderWidth: 2,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Surprise %',
                        type: 'line',
                        data: surprise,
                        borderColor: palette.warning,
                        backgroundColor: 'transparent',
                        borderWidth: 2.5,
                        tension: 0.4,
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: this.getCommonOptions({
                plugins: {
                    title: {
                        display: true,
                        text: title || `${symbol} - Earnings Surprise History`,
                        font: { size: 16, weight: 'bold' },
                        color: adaptiveColors.text,
                        padding: 20
                    },
                    legend: {
                        display: true,
                        position: 'top',
                        labels: { 
                            usePointStyle: true, 
                            padding: 15,
                            color: adaptiveColors.text
                        }
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        position: 'left',
                        title: {
                            display: true,
                            text: 'EPS ($)',
                            font: { size: 12, weight: '600' },
                            color: adaptiveColors.text
                        },
                        ticks: {
                            callback: (value) => `$${value.toFixed(2)}`,
                            color: adaptiveColors.text
                        },
                        grid: {
                            color: adaptiveColors.grid
                        }
                    },
                    y1: {
                        type: 'linear',
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Surprise (%)',
                            font: { size: 12, weight: '600' },
                            color: adaptiveColors.text
                        },
                        grid: {
                            drawOnChartArea: false
                        },
                        ticks: {
                            callback: (value) => `${value}%`,
                            color: adaptiveColors.text
                        }
                    },
                    x: {
                        ticks: {
                            color: adaptiveColors.text
                        },
                        grid: {
                            color: adaptiveColors.grid
                        }
                    }
                }
            })
        });
        
        this.activeCharts.set(chartId, chart);
        this.addExportButton(chartId, chart, `${symbol}_earnings_surprises`);
        
        return chartId;
    }

    async createEarningsBeatRateChart(chartId, chartRequest, container) {
        const { symbol, beatCount, missCount, title, description } = chartRequest;
        const adaptiveColors = this.getAdaptiveColors();
        
        const chartHTML = this.createChartHTML(chartId, title || `${symbol} - Earnings Beat Rate`, description);
        container.innerHTML = chartHTML;
        
        const canvas = container.querySelector(`#${chartId}`);
        if (!canvas) throw new Error('Canvas not found');
        
        const total = beatCount + missCount;
        const beatRate = total > 0 ? ((beatCount / total) * 100).toFixed(1) : 0;
        
        const chart = new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: ['Beats', 'Misses'],
                datasets: [{
                    data: [beatCount, missCount],
                    backgroundColor: [
                        this.getColorPalette().success,
                        this.getColorPalette().danger
                    ],
                    borderColor: '#fff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: `${title || 'Earnings Beat Rate'} - ${beatRate}% beat rate`,
                        font: { size: 16, weight: 'bold' },
                        color: adaptiveColors.text,
                        padding: 20
                    },
                    legend: {
                        display: true,
                        position: 'right',
                        labels: {
                            color: adaptiveColors.text,
                            usePointStyle: true,
                            padding: 15,
                            font: { size: 12, weight: '600' }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
                                return `${context.label}: ${context.parsed} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
        
        this.activeCharts.set(chartId, chart);
        this.addExportButton(chartId, chart, `${symbol}_beat_rate`);
        
        return chartId;
    }

    // ════════════════════════════════════════════════════════════
    // TECHNICAL ANALYSIS & MARKET CHARTS
    // ════════════════════════════════════════════════════════════

    async createTechnicalAnalysisChart(chartId, chartRequest, container) {
        return await this.createStandardChart(chartId, chartRequest, container);
    }

    async createMarketIndicesChart(chartId, chartRequest, container) {
        const { data, title, description } = chartRequest;
        const adaptiveColors = this.getAdaptiveColors();
        
        const chartHTML = this.createChartHTML(chartId, title || 'Major Market Indices - Today\'s Performance', description);
        container.innerHTML = chartHTML;
        
        const canvas = container.querySelector(`#${chartId}`);
        if (!canvas) throw new Error('Canvas not found');
        
        const labels = [];
        const prices = [];
        const changes = [];
        
        if (data.sp500) {
            labels.push('S&P 500');
            prices.push(data.sp500.price);
            changes.push(parseFloat(data.sp500.changePercent));
        }
        if (data.nasdaq) {
            labels.push('NASDAQ');
            prices.push(data.nasdaq.price);
            changes.push(parseFloat(data.nasdaq.changePercent));
        }
        if (data.dow) {
            labels.push('Dow Jones');
            prices.push(data.dow.price);
            changes.push(parseFloat(data.dow.changePercent));
        }
        
        const colors = changes.map(c => c >= 0 ? this.getColorPalette().success : this.getColorPalette().danger);
        
        const chart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Price',
                        data: prices,
                        backgroundColor: this.hexToRgba(this.getColorPalette().primary, 0.7),
                        borderColor: this.getColorPalette().primary,
                        borderWidth: 2,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Change %',
                        data: changes,
                        backgroundColor: colors.map(c => this.hexToRgba(c, 0.7)),
                        borderColor: colors,
                        borderWidth: 2,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: this.getCommonOptions({
                plugins: {
                    title: {
                        display: true,
                        text: title || 'Major Market Indices - Today\'s Performance',
                        font: { size: 16, weight: 'bold' },
                        color: adaptiveColors.text,
                        padding: 20
                    },
                    legend: {
                        display: true,
                        position: 'top',
                        labels: { 
                            usePointStyle: true, 
                            padding: 15,
                            color: adaptiveColors.text
                        }
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Price',
                            font: { size: 12, weight: '600' },
                            color: adaptiveColors.text
                        },
                        ticks: {
                            color: adaptiveColors.text
                        },
                        grid: {
                            color: adaptiveColors.grid
                        }
                    },
                    y1: {
                        type: 'linear',
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Change (%)',
                            font: { size: 12, weight: '600' },
                            color: adaptiveColors.text
                        },
                        grid: {
                            drawOnChartArea: false
                        },
                        ticks: {
                            callback: (value) => `${value.toFixed(2)}%`,
                            color: adaptiveColors.text
                        }
                    },
                    x: {
                        ticks: {
                            color: adaptiveColors.text
                        },
                        grid: {
                            color: adaptiveColors.grid
                        }
                    }
                }
            })
        });
        
        this.activeCharts.set(chartId, chart);
        this.addExportButton(chartId, chart, 'market_indices');
        
        return chartId;
    }

    // ════════════════════════════════════════════════════════════
    // STANDARD CHARTS (FALLBACK)
    // ════════════════════════════════════════════════════════════

    async createStandardChart(chartId, chartRequest, container) {
        const { type, symbol, data, indicators, timeSeriesData } = chartRequest;
        
        const chartHTML = this.createChartHTML(chartId, symbol, type);
        container.innerHTML = chartHTML;
        
        const canvas = container.querySelector(`#${chartId}`);
        if (!canvas) throw new Error('Canvas not found');

        let chartData;
        if (type === 'line') {
            chartData = await this.fetchLineData(symbol, data, timeSeriesData);
        } else if (type === 'bar') {
            chartData = await this.fetchBarData(symbol, data);
        } else if (type === 'area') {
            chartData = await this.fetchAreaData(symbol, data);
        } else {
            chartData = await this.fetchLineData(symbol, data, timeSeriesData);
        }

        const chart = this.renderChart(canvas, type, chartData, indicators);
        
        this.activeCharts.set(chartId, chart);
        this.addExportButton(chartId, chart, symbol);
        
        return chartId;
    }

    async fetchLineData(symbol, period, timeSeriesData = null) {
        console.log(`Fetching line data for ${symbol}, period: ${period}`);
        
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

    async fetchBarData(symbol, period) {
        return this.fetchLineData(symbol, period);
    }

    async fetchAreaData(symbol, period) {
        return this.fetchLineData(symbol, period);
    }

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

    getLineConfig(data, indicators = []) {
        const colors = this.getAdaptiveColors();
        
        const datasets = [{
            label: 'Price',
            data: data.values,
            borderColor: colors.primary,
            backgroundColor: this.hexToRgba(colors.primary, 0.1),
            borderWidth: 2,
            tension: 0.4,
            fill: true,
            pointRadius: 0,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: colors.primary,
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 2
        }];

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
                borderColor: colors.success,
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
                            color: colors.text,
                            usePointStyle: true,
                            padding: 15
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        borderColor: colors.primary,
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
                            callback: (value) => '$' + value.toFixed(2),
                            color: colors.text
                        },
                        grid: {
                            color: colors.grid
                        }
                    },
                    x: {
                        ticks: {
                            color: colors.text
                        },
                        grid: {
                            color: colors.grid
                        }
                    }
                }
            })
        };
    }

    getAreaConfig(data) {
        const colors = this.getAdaptiveColors();
        
        return {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Price',
                    data: data.values,
                    borderColor: colors.primary,
                    backgroundColor: this.hexToRgba(colors.primary, 0.3),
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 0,
                    pointHoverRadius: 5
                }]
            },
            options: this.getCommonOptions({
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        borderColor: colors.primary,
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
                            callback: (value) => '$' + value.toFixed(2),
                            color: colors.text
                        },
                        grid: {
                            color: colors.grid
                        }
                    },
                    x: {
                        ticks: {
                            color: colors.text
                        },
                        grid: {
                            color: colors.grid
                        }
                    }
                }
            })
        };
    }

    getBarConfig(data) {
        const colors = this.getAdaptiveColors();
        
        return {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Volume',
                    data: data.values,
                    backgroundColor: this.hexToRgba(colors.primary, 0.7),
                    borderColor: colors.primary,
                    borderWidth: 1
                }]
            },
            options: this.getCommonOptions({
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        borderColor: colors.primary,
                        borderWidth: 1
                    }
                }
            })
        };
    }

    // ════════════════════════════════════════════════════════════
    // ✅ COMMON CHART OPTIONS (AVEC COULEURS ADAPTATIVES)
    // ════════════════════════════════════════════════════════════

    getCommonOptions(customOptions = {}) {
        const colors = this.getAdaptiveColors();
        
        const baseOptions = {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    display: false,
                    labels: {
                        color: colors.text
                    }
                },
                tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: colors.primary,
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 8
                }
            },
            scales: {
                x: {
                    grid: {
                        color: colors.grid,
                        drawBorder: false
                    },
                    ticks: {
                        color: colors.text,
                        maxRotation: 45,
                        minRotation: 0,
                        autoSkipPadding: 20
                    }
                },
                y: {
                    grid: {
                        color: colors.grid,
                        drawBorder: false
                    },
                    ticks: {
                        color: colors.text
                    }
                }
            }
        };

        return this.deepMerge(baseOptions, customOptions);
    }

    // ════════════════════════════════════════════════════════════
    // HTML TEMPLATES
    // ════════════════════════════════════════════════════════════

    createChartHTML(chartId, title, description = '') {
        return `
            <div class="chart-container">
                <div class="chart-header">
                    <div class="chart-title-wrapper">
                        <span class="chart-title">${title}</span>
                        ${description ? `<span class="chart-description">${description}</span>` : ''}
                    </div>
                    <div class="chart-actions">
                        <button class="chart-btn" data-action="export" data-chart="${chartId}" title="Export as PNG">
                            <i class="fas fa-download"></i> Export
                        </button>
                    </div>
                </div>
                <div class="chart-canvas-wrapper">
                    <canvas id="${chartId}"></canvas>
                </div>
            </div>
        `;
    }

    // ════════════════════════════════════════════════════════════
    // METRICS TABLE
    // ════════════════════════════════════════════════════════════

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

    // ════════════════════════════════════════════════════════════
    // CALCULATION METHODS
    // ════════════════════════════════════════════════════════════

    calculateReturns(prices) {
        const returns = [];
        for (let i = 1; i < prices.length; i++) {
            const dailyReturn = (prices[i] - prices[i - 1]) / prices[i - 1];
            returns.push(dailyReturn);
        }
        return returns;
    }

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

    calculateRollingCorrelation(returns1, returns2, window) {
        const rollingCorr = [];
        
        for (let i = window; i < returns1.length; i++) {
            const subset1 = returns1.slice(i - window, i);
            const subset2 = returns2.slice(i - window, i);
            
            const mean1 = subset1.reduce((a, b) => a + b, 0) / window;
            const mean2 = subset2.reduce((a, b) => a + b, 0) / window;
            
            let numerator = 0;
            let sum1Sq = 0;
            let sum2Sq = 0;
            
            for (let j = 0; j < window; j++) {
                const diff1 = subset1[j] - mean1;
                const diff2 = subset2[j] - mean2;
                numerator += diff1 * diff2;
                sum1Sq += diff1 * diff1;
                sum2Sq += diff2 * diff2;
            }
            
            const correlation = numerator / Math.sqrt(sum1Sq * sum2Sq);
            rollingCorr.push(correlation.toFixed(3));
        }
        
        return rollingCorr;
    }

    calculateRollingVolatility(returns, window) {
        const rollingVol = [];
        
        for (let i = window; i < returns.length; i++) {
            const subset = returns.slice(i - window, i);
            const mean = subset.reduce((a, b) => a + b, 0) / window;
            const squaredDiffs = subset.map(r => Math.pow(r - mean, 2));
            const variance = squaredDiffs.reduce((a, b) => a + b, 0) / window;
            const stdDev = Math.sqrt(variance);
            const annualizedVol = stdDev * Math.sqrt(252) * 100;
            rollingVol.push(parseFloat(annualizedVol.toFixed(2)));
        }
        
        return rollingVol;
    }

    calculateDrawdown(prices) {
        const drawdowns = [];
        let peak = prices[0];
        
        for (let i = 0; i < prices.length; i++) {
            if (prices[i] > peak) {
                peak = prices[i];
            }
            const drawdown = ((prices[i] - peak) / peak) * 100;
            drawdowns.push(parseFloat(drawdown.toFixed(2)));
        }
        
        return drawdowns;
    }

    calculateStdDev(data) {
        const mean = data.reduce((a, b) => a + b, 0) / data.length;
        const squaredDiffs = data.map(value => Math.pow(value - mean, 2));
        const variance = squaredDiffs.reduce((a, b) => a + b, 0) / data.length;
        return Math.sqrt(variance);
    }

    createHistogram(data, numBins = 30) {
        const min = Math.min(...data);
        const max = Math.max(...data);
        const binSize = (max - min) / numBins;
        
        const bins = [];
        const counts = new Array(numBins).fill(0);
        
        for (let i = 0; i < numBins; i++) {
            const binStart = min + i * binSize;
            const binEnd = binStart + binSize;
            bins.push(`${binStart.toFixed(2)} to ${binEnd.toFixed(2)}`);
        }
        
        data.forEach(value => {
            const binIndex = Math.min(Math.floor((value - min) / binSize), numBins - 1);
            counts[binIndex]++;
        });
        
        return { bins, counts };
    }

    // ════════════════════════════════════════════════════════════
    // EXPORT FUNCTIONALITY
    // ════════════════════════════════════════════════════════════

    addExportButton(chartId, chart, filename) {
        const exportBtn = document.querySelector(`[data-action="export"][data-chart="${chartId}"]`);
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                const url = chart.toBase64Image();
                const link = document.createElement('a');
                link.download = `${filename}_chart_${Date.now()}.png`;
                link.href = url;
                link.click();
                
                console.log(`✅ Chart exported: ${filename}_chart_${Date.now()}.png`);
            });
        }
    }
    
    exportTableAsCSV(tableData, filename) {
        let csvContent = '';
        
        csvContent += tableData.headers.join(',') + '\n';
        
        tableData.rows.forEach(row => {
            csvContent += row.join(',') + '\n';
        });
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log(`✅ Table exported: ${filename}`);
    }

    // ════════════════════════════════════════════════════════════
    // UTILITY METHODS
    // ════════════════════════════════════════════════════════════

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
            '1M': 86400000,
            '3M': 86400000,
            '6M': 86400000,
            '1y': 86400000,
            '2y': 86400000 * 2,
            '5y': 86400000 * 5,
            '10y': 86400000 * 10,
            'ytd': 86400000,
            'max': 86400000,
            'ipo': 86400000
        };
        return intervals[period] || 86400000;
    }

    hexToRgba(hex, alpha) {
        if (hex.length === 4) {
            hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
        }
        
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

    // ════════════════════════════════════════════════════════════
    // CLEANUP & LIFECYCLE
    // ════════════════════════════════════════════════════════════

    destroyChart(chartId) {
        const chart = this.activeCharts.get(chartId);
        if (chart) {
            chart.destroy();
            this.activeCharts.delete(chartId);
            console.log(`🗑 Chart destroyed: ${chartId}`);
        }
    }

    destroyAllCharts() {
        this.activeCharts.forEach((chart, chartId) => {
            chart.destroy();
            console.log(`🗑 Chart destroyed: ${chartId}`);
        });
        this.activeCharts.clear();
        console.log('🗑 All charts destroyed');
    }

    getActiveChartsCount() {
        return this.activeCharts.size;
    }

    getChartById(chartId) {
        return this.activeCharts.get(chartId);
    }

    hasChart(chartId) {
        return this.activeCharts.has(chartId);
    }

    getStats() {
        return {
            totalCharts: this.activeCharts.size,
            chartIds: Array.from(this.activeCharts.keys()),
            chartsAvailable: this.chartsAvailable,
            version: '4.1 - Adaptive Colors'
        };
    }
}

// ════════════════════════════════════════════════════════════
// EXPORT & INITIALIZATION
// ════════════════════════════════════════════════════════════

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChatbotCharts;
}

window.ChatbotCharts = ChatbotCharts;

console.log('✅ ChatbotCharts v4.1 loaded successfully!');
console.log('🎨 Adaptive colors for dark/light mode enabled');
console.log('📊 25+ Chart Types Available');
console.log('🚀 Ready for Wall Street-grade visualizations');