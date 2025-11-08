// ============================================
// ANALYST COVERAGE - PAGE LOGIC
// ============================================

const AnalystCoverage = {
    finnhubClient: null,
    currentSymbol: null,

    async init() {
        console.log('🚀 Initializing Analyst Coverage...');
        
        try {
            this.finnhubClient = new FinnHubClient();
            
            const urlParams = new URLSearchParams(window.location.search);
            const symbol = urlParams.get('symbol');
            
            if (symbol) {
                document.getElementById('symbolInput').value = symbol.toUpperCase();
                await this.loadAnalystData();
            }
            
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

            this.renderRecommendations(recommendations);
            this.renderChart(recommendations);

        } catch (error) {
            console.error('Error loading analyst data:', error);
            container.innerHTML = this.getErrorHTML('Failed to load analyst recommendations');
        }
    },

    renderRecommendations(data) {
        const container = document.getElementById('recommendationsContainer');
        const latest = data[0];

        const total = latest.strongBuy + latest.buy + latest.hold + latest.sell + latest.strongSell;

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
                
                <div class='toolbar' style='margin-top: 30px;'>
                    <div style='text-align: center; padding: 20px;'>
                        <h3 style='margin-bottom: 15px; color: var(--text-primary);'>
                            <i class='fas fa-chart-pie'></i> Consensus Rating
                        </h3>
                        <div style='font-size: 2em; font-weight: 800; background: var(--gradient-primary); 
                                    -webkit-background-clip: text; -webkit-text-fill-color: transparent; 
                                    background-clip: text;'>
                            ${this.getConsensusRating(latest)}
                        </div>
                        <div style='color: var(--text-secondary); margin-top: 10px; font-size: 1.1em;'>
                            Based on ${total} analyst${total !== 1 ? 's' : ''}
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
                min: 0,
                title: {
                    text: 'Number of Analysts',
                    style: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
                    }
                },
                labels: {
                    style: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
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
                }
            },
            plotOptions: {
                column: {
                    stacking: 'normal',
                    dataLabels: {
                        enabled: false
                    }
                }
            },
            series: [{
                name: 'Strong Buy',
                data: strongBuy,
                color: '#27ae60'
            }, {
                name: 'Buy',
                data: buy,
                color: '#2ecc71'
            }, {
                name: 'Hold',
                data: hold,
                color: '#f39c12'
            }, {
                name: 'Sell',
                data: sell,
                color: '#e67e22'
            }, {
                name: 'Strong Sell',
                data: strongSell,
                color: '#e74c3c'
            }],
            credits: {
                enabled: false
            }
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
                <button class='btn-primary' onclick='AnalystCoverage.loadAnalystData()' style='margin-top: 20px;'>
                    <i class='fas fa-sync'></i> Retry
                </button>
            </div>
        `;
    }
};

// Initialiser au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    AnalystCoverage.init();
});