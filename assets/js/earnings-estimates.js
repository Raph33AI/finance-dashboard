// ============================================
// EARNINGS & ESTIMATES - PREMIUM VERSION
// ============================================

const EarningsEstimates = {
    finnhubClient: null,
    currentSymbol: null,
    allEarnings: [],

    async init() {
        console.log('🚀 Initializing Earnings & Estimates Premium...');
        
        try {
            this.finnhubClient = new FinnHubClient();
            
            const urlParams = new URLSearchParams(window.location.search);
            const symbol = urlParams.get('symbol') || 'NVDA'; // ✅ Défaut: NVDA
            
            document.getElementById('symbolInput').value = symbol.toUpperCase();
            await this.loadEarningsData();
            
            document.getElementById('symbolInput').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.loadEarningsData();
                }
            });
            
            this.updateLastUpdate();
            console.log('✅ Earnings & Estimates initialized');
            
        } catch (error) {
            console.error('❌ Initialization error:', error);
        }
    },

    quickLoad(symbol) {
        document.getElementById('symbolInput').value = symbol;
        this.loadEarningsData();
    },

    async loadEarningsData() {
        const symbol = document.getElementById('symbolInput').value.trim().toUpperCase();
        
        if (!symbol) {
            alert('Please enter a stock symbol');
            return;
        }

        this.currentSymbol = symbol;
        
        const container = document.getElementById('earningsHistoryContainer');
        container.innerHTML = `
            <div class='loading-container'>
                <i class='fas fa-spinner loading-spinner'></i>
                <p class='loading-text'>Loading earnings data...</p>
            </div>
        `;

        document.getElementById('chartSection').style.display = 'none';
        document.getElementById('surpriseChartSection').style.display = 'none';
        document.getElementById('financialsContainer').innerHTML = '';
        document.getElementById('earningsSummaryContainer').innerHTML = '';

        try {
            await Promise.all([
                this.loadEarningsHistory(symbol),
                this.loadBasicFinancials(symbol)
            ]);
        } catch (error) {
            console.error('Error loading earnings data:', error);
            container.innerHTML = this.getErrorHTML('Failed to load earnings data');
        }
    },

    async loadEarningsHistory(symbol) {
        const container = document.getElementById('earningsHistoryContainer');
        const summaryContainer = document.getElementById('earningsSummaryContainer');

        try {
            const earnings = await this.finnhubClient.getEarnings(symbol);

            if (!Array.isArray(earnings) || earnings.length === 0) {
                container.innerHTML = `
                    <div class='error-container'>
                        <i class='fas fa-exclamation-triangle error-icon'></i>
                        <p class='error-message'>No earnings data found for ${symbol}</p>
                    </div>
                `;
                return;
            }

            this.allEarnings = earnings.sort((a, b) => new Date(b.period) - new Date(a.period));

            // Calculer les statistiques
            this.renderEarningsSummary(this.allEarnings);

            container.innerHTML = `
                <div class='section'>
                    <h2 class='section-title'>
                        <i class='fas fa-history'></i> Historical Earnings Results
                    </h2>
                    
                    <div class='toolbar'>
                        <div class='toolbar-row'>
                            <button class='btn-success' onclick='EarningsEstimates.exportEarnings()'>
                                <i class='fas fa-download'></i> Export Data
                            </button>
                        </div>
                    </div>
                    
                    <div class='earnings-table'>
                        <table>
                            <thead>
                                <tr>
                                    <th><i class='fas fa-calendar'></i> Period</th>
                                    <th><i class='fas fa-chart-line'></i> Actual EPS</th>
                                    <th><i class='fas fa-bullseye'></i> Estimated EPS</th>
                                    <th><i class='fas fa-percentage'></i> Surprise</th>
                                    <th><i class='fas fa-percentage'></i> Surprise %</th>
                                    <th><i class='fas fa-signal'></i> Performance</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.allEarnings.slice(0, 20).map(item => {
                                    const actual = item.actual !== null ? item.actual : 'N/A';
                                    const estimate = item.estimate !== null ? item.estimate : 'N/A';
                                    const surprise = item.surprise !== null ? item.surprise : null;
                                    const surprisePercent = item.surprisePercent !== null ? item.surprisePercent : null;
                                    
                                    let performanceClass = 'earnings-inline';
                                    let performanceIcon = '➡️';
                                    let performanceText = 'In-line';
                                    
                                    if (surprise !== null && surprise > 0) {
                                        performanceClass = 'earnings-beat';
                                        performanceIcon = '✅';
                                        performanceText = 'Beat';
                                    } else if (surprise !== null && surprise < 0) {
                                        performanceClass = 'earnings-miss';
                                        performanceIcon = '❌';
                                        performanceText = 'Miss';
                                    }
                                    
                                    return `
                                        <tr>
                                            <td><strong>${this.formatPeriod(item.period)}</strong></td>
                                            <td><strong>$${actual !== 'N/A' ? actual.toFixed(2) : 'N/A'}</strong></td>
                                            <td>$${estimate !== 'N/A' ? estimate.toFixed(2) : 'N/A'}</td>
                                            <td class='${performanceClass}'>
                                                ${surprise !== null ? (surprise > 0 ? '+' : '') + '$' + surprise.toFixed(2) : 'N/A'}
                                            </td>
                                            <td class='${performanceClass}'>
                                                ${surprisePercent !== null ? (surprisePercent > 0 ? '+' : '') + surprisePercent.toFixed(1) + '%' : 'N/A'}
                                            </td>
                                            <td class='${performanceClass}'>
                                                ${performanceIcon} <strong>${performanceText}</strong>
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;

            this.renderEarningsChart(this.allEarnings);
            this.renderSurpriseChart(this.allEarnings);

        } catch (error) {
            console.error('Error loading earnings history:', error);
            container.innerHTML = this.getErrorHTML('Failed to load earnings history');
        }
    },

    renderEarningsSummary(earnings) {
        const container = document.getElementById('earningsSummaryContainer');

        let beatCount = 0;
        let missCount = 0;
        let inlineCount = 0;
        let totalSurprise = 0;
        let validSurprises = 0;

        earnings.forEach(item => {
            if (item.surprise !== null) {
                if (item.surprise > 0) beatCount++;
                else if (item.surprise < 0) missCount++;
                else inlineCount++;
                
                totalSurprise += item.surprise;
                validSurprises++;
            }
        });

        const avgSurprise = validSurprises > 0 ? (totalSurprise / validSurprises).toFixed(3) : 0;
        const beatRate = earnings.length > 0 ? ((beatCount / earnings.length) * 100).toFixed(1) : 0;

        container.innerHTML = `
            <div class='section'>
                <h2 class='section-title'>
                    <i class='fas fa-chart-pie'></i> Earnings Performance Summary
                </h2>
                
                <div class='stats-row'>
                    <div class='stat-card'>
                        <div class='stat-card-icon'>📊</div>
                        <div class='stat-card-value'>${earnings.length}</div>
                        <div class='stat-card-label'>Total Reports</div>
                    </div>
                    <div class='stat-card'>
                        <div class='stat-card-icon'>✅</div>
                        <div class='stat-card-value'>${beatCount}</div>
                        <div class='stat-card-label'>Earnings Beat</div>
                    </div>
                    <div class='stat-card'>
                        <div class='stat-card-icon'>❌</div>
                        <div class='stat-card-value'>${missCount}</div>
                        <div class='stat-card-label'>Earnings Miss</div>
                    </div>
                    <div class='stat-card'>
                        <div class='stat-card-icon'>➡️</div>
                        <div class='stat-card-value'>${inlineCount}</div>
                        <div class='stat-card-label'>In-line</div>
                    </div>
                    <div class='stat-card'>
                        <div class='stat-card-icon'>📈</div>
                        <div class='stat-card-value'>${beatRate}%</div>
                        <div class='stat-card-label'>Beat Rate</div>
                    </div>
                    <div class='stat-card'>
                        <div class='stat-card-icon'>💰</div>
                        <div class='stat-card-value'>$${avgSurprise}</div>
                        <div class='stat-card-label'>Avg Surprise</div>
                    </div>
                </div>
            </div>
        `;
    },

    renderEarningsChart(earnings) {
        const chartSection = document.getElementById('chartSection');
        chartSection.style.display = 'block';

        const sortedData = earnings.slice(0, 20).reverse();

        const categories = sortedData.map(item => this.formatPeriod(item.period));
        const actualEPS = sortedData.map(item => item.actual !== null ? item.actual : null);
        const estimateEPS = sortedData.map(item => item.estimate !== null ? item.estimate : null);

        Highcharts.chart('earningsChart', {
            chart: {
                type: 'line',
                backgroundColor: 'transparent'
            },
            title: {
                text: null
            },
            xAxis: {
                categories: categories,
                labels: {
                    style: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
                    }
                }
            },
            yAxis: {
                title: {
                    text: 'EPS ($)',
                    style: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
                    }
                },
                labels: {
                    style: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
                    },
                    formatter: function() {
                        return '$' + this.value.toFixed(2);
                    }
                },
                gridLineColor: getComputedStyle(document.documentElement).getPropertyValue('--border-color')
            },
            legend: {
                itemStyle: {
                    color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
                }
            },
            tooltip: {
                shared: true,
                backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--card-bg'),
                style: {
                    color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
                },
                formatter: function() {
                    let tooltip = '<b>' + this.x + '</b><br/>';
                    this.points.forEach(point => {
                        tooltip += '<span style="color:' + point.color + '">●</span> ' + 
                                   point.series.name + ': <b>$' + point.y.toFixed(2) + '</b><br/>';
                    });
                    return tooltip;
                }
            },
            plotOptions: {
                line: {
                    dataLabels: {
                        enabled: false
                    },
                    enableMouseTracking: true,
                    marker: {
                        enabled: true,
                        radius: 5
                    }
                }
            },
            series: [{
                name: 'Actual EPS',
                data: actualEPS,
                color: '#667eea',
                lineWidth: 3,
                marker: {
                    symbol: 'circle'
                }
            }, {
                name: 'Estimated EPS',
                data: estimateEPS,
                color: '#f39c12',
                lineWidth: 2,
                dashStyle: 'ShortDash',
                marker: {
                    symbol: 'diamond'
                }
            }],
            credits: {
                enabled: false
            }
        });
    },

    renderSurpriseChart(earnings) {
        const section = document.getElementById('surpriseChartSection');
        section.style.display = 'block';

        const sortedData = earnings.slice(0, 20).reverse();

        const categories = sortedData.map(item => this.formatPeriod(item.period));
        const surpriseData = sortedData.map(item => item.surprisePercent !== null ? item.surprisePercent : 0);

        Highcharts.chart('surpriseChart', {
            chart: {
                type: 'column',
                backgroundColor: 'transparent'
            },
            title: {
                text: null
            },
            xAxis: {
                categories: categories,
                labels: {
                    style: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
                    }
                }
            },
            yAxis: {
                title: {
                    text: 'Surprise (%)',
                    style: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
                    }
                },
                labels: {
                    style: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
                    },
                    formatter: function() {
                        return this.value.toFixed(1) + '%';
                    }
                },
                gridLineColor: getComputedStyle(document.documentElement).getPropertyValue('--border-color'),
                plotLines: [{
                    value: 0,
                    color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary'),
                    width: 2,
                    zIndex: 4
                }]
            },
            legend: {
                enabled: false
            },
            tooltip: {
                backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--card-bg'),
                style: {
                    color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
                },
                formatter: function() {
                    const color = this.y >= 0 ? '#27ae60' : '#e74c3c';
                    return '<b>' + this.x + '</b><br/>' +
                           '<span style="color:' + color + '">●</span> Surprise: <b>' + 
                           (this.y > 0 ? '+' : '') + this.y.toFixed(1) + '%</b>';
                }
            },
            plotOptions: {
                column: {
                    colorByPoint: false,
                    zones: [{
                        value: 0,
                        color: '#e74c3c'
                    }, {
                        color: '#27ae60'
                    }]
                }
            },
            series: [{
                name: 'Surprise',
                data: surpriseData
            }],
            credits: {
                enabled: false
            }
        });
    },

    async loadBasicFinancials(symbol) {
        const container = document.getElementById('financialsContainer');

        try {
            const financials = await this.finnhubClient.getBasicFinancials(symbol);

            if (!financials || !financials.metric) {
                return;
            }

            const metric = financials.metric;

            container.innerHTML = `
                <div class='section'>
                    <h2 class='section-title'>
                        <i class='fas fa-chart-pie'></i> Key Financial Metrics
                    </h2>
                    
                    <div class='stats-row' style='grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));'>
                        ${metric['52WeekHigh'] ? `
                            <div class='stat-card'>
                                <div class='stat-card-icon'>📈</div>
                                <div class='stat-card-value'>$${metric['52WeekHigh'].toFixed(2)}</div>
                                <div class='stat-card-label'>52-Week High</div>
                            </div>
                        ` : ''}
                        
                        ${metric['52WeekLow'] ? `
                            <div class='stat-card'>
                                <div class='stat-card-icon'>📉</div>
                                <div class='stat-card-value'>$${metric['52WeekLow'].toFixed(2)}</div>
                                <div class='stat-card-label'>52-Week Low</div>
                            </div>
                        ` : ''}
                        
                        ${metric['52WeekPriceReturnDaily'] ? `
                            <div class='stat-card'>
                                <div class='stat-card-icon'>📊</div>
                                <div class='stat-card-value'>${metric['52WeekPriceReturnDaily'].toFixed(2)}%</div>
                                <div class='stat-card-label'>52-Week Return</div>
                            </div>
                        ` : ''}
                        
                        ${metric['peBasicExclExtraTTM'] ? `
                            <div class='stat-card'>
                                <div class='stat-card-icon'>💹</div>
                                <div class='stat-card-value'>${metric['peBasicExclExtraTTM'].toFixed(2)}</div>
                                <div class='stat-card-label'>P/E Ratio (TTM)</div>
                            </div>
                        ` : ''}
                        
                        ${metric['epsBasicExclExtraItemsAnnual'] ? `
                            <div class='stat-card'>
                                <div class='stat-card-icon'>💰</div>
                                <div class='stat-card-value'>$${metric['epsBasicExclExtraItemsAnnual'].toFixed(2)}</div>
                                <div class='stat-card-label'>EPS (Annual)</div>
                            </div>
                        ` : ''}
                        
                        ${metric['beta'] ? `
                            <div class='stat-card'>
                                <div class='stat-card-icon'>📐</div>
                                <div class='stat-card-value'>${metric['beta'].toFixed(2)}</div>
                                <div class='stat-card-label'>Beta</div>
                            </div>
                        ` : ''}
                        
                        ${metric['dividendYieldIndicatedAnnual'] ? `
                            <div class='stat-card'>
                                <div class='stat-card-icon'>💵</div>
                                <div class='stat-card-value'>${metric['dividendYieldIndicatedAnnual'].toFixed(2)}%</div>
                                <div class='stat-card-label'>Dividend Yield</div>
                            </div>
                        ` : ''}
                        
                        ${metric['roeTTM'] ? `
                            <div class='stat-card'>
                                <div class='stat-card-icon'>🎯</div>
                                <div class='stat-card-value'>${metric['roeTTM'].toFixed(2)}%</div>
                                <div class='stat-card-label'>ROE (TTM)</div>
                            </div>
                        ` : ''}
                        
                        ${metric['currentRatioAnnual'] ? `
                            <div class='stat-card'>
                                <div class='stat-card-icon'>⚖️</div>
                                <div class='stat-card-value'>${metric['currentRatioAnnual'].toFixed(2)}</div>
                                <div class='stat-card-label'>Current Ratio</div>
                            </div>
                        ` : ''}
                        
                        ${metric['grossMarginAnnual'] ? `
                            <div class='stat-card'>
                                <div class='stat-card-icon'>📊</div>
                                <div class='stat-card-value'>${metric['grossMarginAnnual'].toFixed(2)}%</div>
                                <div class='stat-card-label'>Gross Margin</div>
                            </div>
                        ` : ''}
                        
                        ${metric['operatingMarginAnnual'] ? `
                            <div class='stat-card'>
                                <div class='stat-card-icon'>💼</div>
                                <div class='stat-card-value'>${metric['operatingMarginAnnual'].toFixed(2)}%</div>
                                <div class='stat-card-label'>Operating Margin</div>
                            </div>
                        ` : ''}
                        
                        ${metric['netProfitMarginAnnual'] ? `
                            <div class='stat-card'>
                                <div class='stat-card-icon'>💎</div>
                                <div class='stat-card-value'>${metric['netProfitMarginAnnual'].toFixed(2)}%</div>
                                <div class='stat-card-label'>Net Profit Margin</div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;

        } catch (error) {
            console.error('Error loading basic financials:', error);
        }
    },

    exportEarnings() {
        if (this.allEarnings.length === 0) {
            alert('No data to export');
            return;
        }

        const csvContent = this.convertToCSV(this.allEarnings);
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.currentSymbol}-earnings-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    },

    convertToCSV(data) {
        const headers = ['Period', 'Actual EPS', 'Estimated EPS', 'Surprise', 'Surprise %', 'Performance'];
        const rows = data.map(item => {
            const actual = item.actual !== null ? item.actual.toFixed(2) : 'N/A';
            const estimate = item.estimate !== null ? item.estimate.toFixed(2) : 'N/A';
            const surprise = item.surprise !== null ? item.surprise.toFixed(2) : 'N/A';
            const surprisePercent = item.surprisePercent !== null ? item.surprisePercent.toFixed(2) : 'N/A';
            
            let performance = 'In-line';
            if (item.surprise !== null) {
                performance = item.surprise > 0 ? 'Beat' : item.surprise < 0 ? 'Miss' : 'In-line';
            }
            
            return [
                item.period,
                actual,
                estimate,
                surprise,
                surprisePercent,
                performance
            ].join(',');
        });

        return [headers.join(','), ...rows].join('\n');
    },

    formatPeriod(period) {
        if (!period) return 'N/A';
        const date = new Date(period);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short',
            day: 'numeric'
        });
    },

    updateLastUpdate() {
        const now = new Date();
        const formatted = now.toLocaleString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
        document.getElementById('lastUpdate').textContent = formatted;
    },

    getErrorHTML(message) {
        return `
            <div class='error-container'>
                <i class='fas fa-exclamation-triangle error-icon'></i>
                <p class='error-message'>${message}</p>
                <button class='btn-primary' onclick='EarningsEstimates.loadEarningsData()' style='margin-top: 20px;'>
                    <i class='fas fa-sync'></i> Retry
                </button>
            </div>
        `;
    }
};

// Initialiser au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    EarningsEstimates.init();
});