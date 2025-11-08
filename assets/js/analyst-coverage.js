// ============================================
// ANALYST COVERAGE - PREMIUM VERSION
// Graphiques avec textes en noir
// ============================================

const AnalystCoverage = {
    finnhubClient: null,
    currentSymbol: null,
    allRecommendations: [],

    async init() {
        console.log('🚀 Initializing Analyst Coverage Premium...');
        
        try {
            this.finnhubClient = new FinnHubClient();
            
            const urlParams = new URLSearchParams(window.location.search);
            const symbol = urlParams.get('symbol') || 'TSLA';
            
            document.getElementById('symbolInput').value = symbol.toUpperCase();
            await this.loadAnalystData();
            
            document.getElementById('symbolInput').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.loadAnalystData();
                }
            });
            
            this.updateLastUpdate();
            console.log('✅ Analyst Coverage initialized');
            
        } catch (error) {
            console.error('❌ Initialization error:', error);
        }
    },

    quickLoad(symbol) {
        document.getElementById('symbolInput').value = symbol;
        this.loadAnalystData();
    },

    async loadAnalystData() {
        const symbol = document.getElementById('symbolInput').value.trim().toUpperCase();
        
        if (!symbol) {
            alert('Please enter a stock symbol');
            return;
        }

        this.currentSymbol = symbol;
        
        const container = document.getElementById('recommendationsContainer');
        container.innerHTML = `
            <div class='loading-container'>
                <i class='fas fa-spinner loading-spinner'></i>
                <p class='loading-text'>Loading analyst recommendations...</p>
            </div>
        `;

        document.getElementById('chartSection').style.display = 'none';
        document.getElementById('pieChartSection').style.display = 'none';
        document.getElementById('historySection').style.display = 'none';

        try {
            const recommendations = await this.finnhubClient.getRecommendation(symbol);

            if (!Array.isArray(recommendations) || recommendations.length === 0) {
                container.innerHTML = `
                    <div class='error-container'>
                        <i class='fas fa-exclamation-triangle error-icon'></i>
                        <p class='error-message'>No analyst recommendations found for ${symbol}</p>
                    </div>
                `;
                return;
            }

            this.allRecommendations = recommendations;
            this.renderRecommendations(recommendations);
            this.renderChart(recommendations);
            this.renderPieChart(recommendations[0]);
            this.renderHistoryTable(recommendations);

        } catch (error) {
            console.error('Error loading analyst data:', error);
            container.innerHTML = this.getErrorHTML('Failed to load analyst recommendations');
        }
    },

    renderRecommendations(data) {
        const container = document.getElementById('recommendationsContainer');
        const latest = data[0];

        const total = latest.strongBuy + latest.buy + latest.hold + latest.sell + latest.strongSell;
        const bullishPercent = ((latest.strongBuy + latest.buy) / total * 100).toFixed(1);
        const bearishPercent = ((latest.sell + latest.strongSell) / total * 100).toFixed(1);

        container.innerHTML = `
            <div class='section'>
                <h2 class='section-title'>
                    <i class='fas fa-star'></i> Latest Analyst Recommendations
                    <span style='font-size: 0.6em; color: var(--text-secondary); font-weight: 400;'>
                        (${latest.period || 'Current'})
                    </span>
                </h2>
                
                <div class='recommendation-grid'>
                    <div class='recommendation-card recommendation-buy'>
                        <div class='recommendation-type'>
                            <i class='fas fa-arrow-up'></i> Strong Buy
                        </div>
                        <div class='recommendation-count'>${latest.strongBuy || 0}</div>
                        <div style='color: var(--text-secondary); font-weight: 600;'>
                            ${total > 0 ? ((latest.strongBuy / total) * 100).toFixed(1) : 0}%
                        </div>
                    </div>
                    
                    <div class='recommendation-card recommendation-buy'>
                        <div class='recommendation-type'>
                            <i class='fas fa-thumbs-up'></i> Buy
                        </div>
                        <div class='recommendation-count'>${latest.buy || 0}</div>
                        <div style='color: var(--text-secondary); font-weight: 600;'>
                            ${total > 0 ? ((latest.buy / total) * 100).toFixed(1) : 0}%
                        </div>
                    </div>
                    
                    <div class='recommendation-card recommendation-hold'>
                        <div class='recommendation-type'>
                            <i class='fas fa-hand-paper'></i> Hold
                        </div>
                        <div class='recommendation-count'>${latest.hold || 0}</div>
                        <div style='color: var(--text-secondary); font-weight: 600;'>
                            ${total > 0 ? ((latest.hold / total) * 100).toFixed(1) : 0}%
                        </div>
                    </div>
                    
                    <div class='recommendation-card recommendation-sell'>
                        <div class='recommendation-type'>
                            <i class='fas fa-thumbs-down'></i> Sell
                        </div>
                        <div class='recommendation-count'>${latest.sell || 0}</div>
                        <div style='color: var(--text-secondary); font-weight: 600;'>
                            ${total > 0 ? ((latest.sell / total) * 100).toFixed(1) : 0}%
                        </div>
                    </div>
                    
                    <div class='recommendation-card recommendation-sell'>
                        <div class='recommendation-type'>
                            <i class='fas fa-arrow-down'></i> Strong Sell
                        </div>
                        <div class='recommendation-count'>${latest.strongSell || 0}</div>
                        <div style='color: var(--text-secondary); font-weight: 600;'>
                            ${total > 0 ? ((latest.strongSell / total) * 100).toFixed(1) : 0}%
                        </div>
                    </div>
                </div>
                
                <div class='stats-row' style='margin-top: 30px;'>
                    <div class='stat-card'>
                        <div class='stat-card-icon'>📊</div>
                        <div class='stat-card-value'>${total}</div>
                        <div class='stat-card-label'>Total Analysts</div>
                    </div>
                    <div class='stat-card'>
                        <div class='stat-card-icon'>📈</div>
                        <div class='stat-card-value'>${bullishPercent}%</div>
                        <div class='stat-card-label'>Bullish (Buy/Strong Buy)</div>
                    </div>
                    <div class='stat-card'>
                        <div class='stat-card-icon'>📉</div>
                        <div class='stat-card-value'>${bearishPercent}%</div>
                        <div class='stat-card-label'>Bearish (Sell/Strong Sell)</div>
                    </div>
                    <div class='stat-card'>
                        <div class='stat-card-icon'>🎯</div>
                        <div class='stat-card-value'>${this.getConsensusRating(latest)}</div>
                        <div class='stat-card-label'>Consensus Rating</div>
                    </div>
                </div>
                
                <div class='toolbar' style='margin-top: 30px;'>
                    <div style='text-align: center; padding: 20px;'>
                        <h3 style='margin-bottom: 15px; color: var(--text-primary);'>
                            <i class='fas fa-lightbulb'></i> Investment Recommendation
                        </h3>
                        <div style='font-size: 1.5em; font-weight: 800;'>
                            ${this.getInvestmentAdvice(latest)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    getConsensusRating(data) {
        const scores = {
            strongBuy: data.strongBuy * 5,
            buy: data.buy * 4,
            hold: data.hold * 3,
            sell: data.sell * 2,
            strongSell: data.strongSell * 1
        };

        const totalScore = scores.strongBuy + scores.buy + scores.hold + scores.sell + scores.strongSell;
        const totalAnalysts = data.strongBuy + data.buy + data.hold + data.sell + data.strongSell;

        if (totalAnalysts === 0) return 'N/A';

        const avgScore = totalScore / totalAnalysts;

        if (avgScore >= 4.5) return 'Strong Buy';
        if (avgScore >= 3.5) return 'Buy';
        if (avgScore >= 2.5) return 'Hold';
        if (avgScore >= 1.5) return 'Sell';
        return 'Strong Sell';
    },

    getInvestmentAdvice(data) {
        const total = data.strongBuy + data.buy + data.hold + data.sell + data.strongSell;
        const bullishPercent = (data.strongBuy + data.buy) / total * 100;
        const bearishPercent = (data.sell + data.strongSell) / total * 100;

        if (bullishPercent >= 70) {
            return '🚀 Strong Buy Signal - High analyst confidence';
        } else if (bullishPercent >= 50) {
            return '📈 Buy Signal - Positive analyst sentiment';
        } else if (bearishPercent >= 50) {
            return '📉 Sell Signal - Negative analyst sentiment';
        } else if (bearishPercent >= 70) {
            return '⚠️ Strong Sell Signal - High caution advised';
        } else {
            return '⏸️ Hold - Mixed analyst opinions';
        }
    },

    renderChart(data) {
        const chartSection = document.getElementById('chartSection');
        chartSection.style.display = 'block';

        const sortedData = data.sort((a, b) => new Date(a.period) - new Date(b.period));

        const categories = sortedData.map(item => item.period);
        const strongBuy = sortedData.map(item => item.strongBuy);
        const buy = sortedData.map(item => item.buy);
        const hold = sortedData.map(item => item.hold);
        const sell = sortedData.map(item => item.sell);
        const strongSell = sortedData.map(item => item.strongSell);

        Highcharts.chart('recommendationsChart', {
            chart: {
                type: 'column',
                backgroundColor: 'transparent',
                style: {
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                }
            },
            title: {
                text: null
            },
            xAxis: {
                categories: categories,
                lineColor: 'rgba(0, 0, 0, 0.05)',
                tickColor: 'rgba(0, 0, 0, 0.05)',
                labels: {
                    style: {
                        color: '#18181b',
                        fontSize: '12px'
                    }
                }
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Number of Analysts',
                    style: {
                        color: '#18181b',
                        fontSize: '13px',
                        fontWeight: '600'
                    }
                },
                gridLineColor: 'rgba(0, 0, 0, 0.05)',
                labels: {
                    style: {
                        color: '#18181b',
                        fontSize: '12px'
                    }
                }
            },
            legend: {
                itemStyle: {
                    color: '#18181b',
                    fontSize: '13px',
                    fontWeight: '500'
                },
                itemHoverStyle: {
                    color: '#000000'
                }
            },
            tooltip: {
                shared: true,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderColor: 'rgba(0, 0, 0, 0.1)',
                borderRadius: 8,
                shadow: false,
                style: {
                    color: '#18181b',
                    fontSize: '13px'
                }
            },
            plotOptions: {
                column: {
                    stacking: 'normal',
                    borderWidth: 0,
                    borderRadius: 4,
                    dataLabels: {
                        enabled: false
                    }
                }
            },
            series: [{
                name: 'Strong Buy',
                data: strongBuy,
                color: {
                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                    stops: [
                        [0, '#059669'],
                        [1, '#047857']
                    ]
                }
            }, {
                name: 'Buy',
                data: buy,
                color: {
                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                    stops: [
                        [0, '#10b981'],
                        [1, '#059669']
                    ]
                }
            }, {
                name: 'Hold',
                data: hold,
                color: {
                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                    stops: [
                        [0, '#f59e0b'],
                        [1, '#d97706']
                    ]
                }
            }, {
                name: 'Sell',
                data: sell,
                color: {
                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                    stops: [
                        [0, '#f97316'],
                        [1, '#ea580c']
                    ]
                }
            }, {
                name: 'Strong Sell',
                data: strongSell,
                color: {
                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                    stops: [
                        [0, '#ef4444'],
                        [1, '#dc2626']
                    ]
                }
            }],
            credits: {
                enabled: false
            }
        });
    },

    renderPieChart(latest) {
        const section = document.getElementById('pieChartSection');
        section.style.display = 'block';

        Highcharts.chart('recommendationsPieChart', {
            chart: {
                type: 'pie',
                backgroundColor: 'transparent',
                style: {
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                }
            },
            title: {
                text: null
            },
            tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderColor: 'rgba(0, 0, 0, 0.1)',
                borderRadius: 8,
                shadow: false,
                style: {
                    color: '#18181b',
                    fontSize: '13px',
                    fontWeight: '500'
                },
                pointFormat: '<b>{point.percentage:.1f}%</b><br/>{point.y} analysts'
            },
            plotOptions: {
                pie: {
                    innerSize: '60%',
                    allowPointSelect: true,
                    cursor: 'pointer',
                    borderWidth: 0,
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b><br>{point.percentage:.1f}%',
                        distance: 20,
                        style: {
                            color: '#18181b',
                            fontSize: '13px',
                            fontWeight: '600',
                            textOutline: 'none'
                        }
                    },
                    states: {
                        hover: {
                            brightness: 0.1,
                            halo: {
                                size: 0
                            }
                        }
                    }
                }
            },
            series: [{
                name: 'Recommendations',
                colorByPoint: true,
                data: [{
                    name: 'Strong Buy',
                    y: latest.strongBuy,
                    color: {
                        linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
                        stops: [
                            [0, '#059669'],
                            [1, '#047857']
                        ]
                    }
                }, {
                    name: 'Buy',
                    y: latest.buy,
                    color: {
                        linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
                        stops: [
                            [0, '#10b981'],
                            [1, '#059669']
                        ]
                    }
                }, {
                    name: 'Hold',
                    y: latest.hold,
                    color: {
                        linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
                        stops: [
                            [0, '#f59e0b'],
                            [1, '#d97706']
                        ]
                    }
                }, {
                    name: 'Sell',
                    y: latest.sell,
                    color: {
                        linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
                        stops: [
                            [0, '#f97316'],
                            [1, '#ea580c']
                        ]
                    }
                }, {
                    name: 'Strong Sell',
                    y: latest.strongSell,
                    color: {
                        linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
                        stops: [
                            [0, '#ef4444'],
                            [1, '#dc2626']
                        ]
                    }
                }]
            }],
            credits: {
                enabled: false
            }
        });
    },

    renderHistoryTable(data) {
        const section = document.getElementById('historySection');
        const container = document.getElementById('historyTableContainer');
        
        section.style.display = 'block';

        const sortedData = data.sort((a, b) => new Date(b.period) - new Date(a.period));

        container.innerHTML = `
            <div class='earnings-table'>
                <table>
                    <thead>
                        <tr>
                            <th><i class='fas fa-calendar'></i> Period</th>
                            <th><i class='fas fa-arrow-up'></i> Strong Buy</th>
                            <th><i class='fas fa-thumbs-up'></i> Buy</th>
                            <th><i class='fas fa-hand-paper'></i> Hold</th>
                            <th><i class='fas fa-thumbs-down'></i> Sell</th>
                            <th><i class='fas fa-arrow-down'></i> Strong Sell</th>
                            <th><i class='fas fa-users'></i> Total</th>
                            <th><i class='fas fa-star'></i> Consensus</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sortedData.map(item => {
                            const total = item.strongBuy + item.buy + item.hold + item.sell + item.strongSell;
                            const consensus = this.getConsensusRating(item);
                            
                            return `
                                <tr>
                                    <td><strong>${item.period}</strong></td>
                                    <td style='color: #059669; font-weight: 700;'>${item.strongBuy}</td>
                                    <td style='color: #10b981; font-weight: 700;'>${item.buy}</td>
                                    <td style='color: #f59e0b; font-weight: 700;'>${item.hold}</td>
                                    <td style='color: #f97316; font-weight: 700;'>${item.sell}</td>
                                    <td style='color: #ef4444; font-weight: 700;'>${item.strongSell}</td>
                                    <td><strong>${total}</strong></td>
                                    <td><strong>${consensus}</strong></td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    exportRecommendations() {
        if (this.allRecommendations.length === 0) {
            alert('No data to export');
            return;
        }

        const csvContent = this.convertToCSV(this.allRecommendations);
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.currentSymbol}-analyst-recommendations-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    },

    convertToCSV(data) {
        const headers = ['Period', 'Strong Buy', 'Buy', 'Hold', 'Sell', 'Strong Sell', 'Total', 'Consensus'];
        const rows = data.map(item => {
            const total = item.strongBuy + item.buy + item.hold + item.sell + item.strongSell;
            const consensus = this.getConsensusRating(item);
            
            return [
                item.period,
                item.strongBuy,
                item.buy,
                item.hold,
                item.sell,
                item.strongSell,
                total,
                consensus
            ].join(',');
        });

        return [headers.join(','), ...rows].join('\n');
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
                <button class='btn-primary' onclick='AnalystCoverage.loadAnalystData()' style='margin-top: 20px;'>
                    <i class='fas fa-sync'></i> Retry
                </button>
            </div>
        `;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    AnalystCoverage.init();
});