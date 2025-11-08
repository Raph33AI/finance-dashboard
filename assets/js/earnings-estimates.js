// ============================================
// EARNINGS & ESTIMATES - PAGE LOGIC
// ============================================

const EarningsEstimates = {
    finnhubClient: null,
    currentSymbol: null,

    async init() {
        console.log('🚀 Initializing Earnings & Estimates...');
        
        try {
            this.finnhubClient = new FinnHubClient();
            
            const urlParams = new URLSearchParams(window.location.search);
            const symbol = urlParams.get('symbol');
            
            if (symbol) {
                document.getElementById('symbolInput').value = symbol.toUpperCase();
                await this.loadEarningsData();
            }
            
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
        document.getElementById('financialsContainer').innerHTML = '';

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

            // Inverser pour avoir les plus récents en premier
            const sortedEarnings = earnings.sort((a, b) => new Date(b.period) - new Date(a.period));

            container.innerHTML = `
                <div class='section'>
                    <h2 class='section-title'>
                        <i class='fas fa-history'></i> Historical Earnings Results
                    </h2>
                    
                    <div class='earnings-table'>
                        <table>
                            <thead>
                                <tr>
                                    <th><i class='fas fa-calendar'></i> Period</th>
                                    <th><i class='fas fa-chart-line'></i> Actual EPS</th>
                                    <th><i class='fas fa-bullseye'></i> Estimated EPS</th>
                                    <th><i class='fas fa-percentage'></i> Surprise</th>
                                    <th><i class='fas fa-signal'></i> Performance</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${sortedEarnings.slice(0, 12).map(item => {
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
                                                ${surprisePercent !== null ? ' (' + (surprisePercent > 0 ? '+' : '') + surprisePercent.toFixed(1) + '%)' : ''}
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

            this.renderEarningsChart(sortedEarnings);

        } catch (error) {
            console.error('Error loading earnings history:', error);
            container.innerHTML = this.getErrorHTML('Failed to load earnings history');
        }
    },

    renderEarningsChart(earnings) {
        const chartSection = document.getElementById('chartSection');
        chartSection.style.display = 'block';

        // Inverser pour afficher chronologiquement
        const sortedData = earnings.slice(0, 12).reverse();

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
                        
                        ${metric['peBasicExclExtraTTM'] ? `
                            <div class='stat-card'>
                                <div class='stat-card-icon'>📊</div>
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
                    </div>
                </div>
            `;

        } catch (error) {
            console.error('Error loading basic financials:', error);
        }
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