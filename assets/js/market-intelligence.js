// ============================================
// MARKET INTELLIGENCE - PREMIUM VERSION
// Graphiques minimalistes et modernes
// ============================================

const MarketIntelligence = {
    finnhubClient: null,
    allNews: [],
    displayedNewsCount: 20,

    async init() {
        console.log('🚀 Initializing Market Intelligence Premium...');
        
        try {
            this.finnhubClient = new FinnHubClient();
            await this.loadData();
            this.updateLastUpdate();
            console.log('✅ Market Intelligence initialized');
            
        } catch (error) {
            console.error('❌ Initialization error:', error);
            this.showGlobalError('Failed to initialize Market Intelligence: ' + error.message);
        }
    },

    async loadData() {
        try {
            await Promise.all([
                this.loadMarketNews(),
                this.loadEarningsCalendar()
            ]);
        } catch (error) {
            console.error('❌ Error loading data:', error);
        }
    },

    async loadMarketNews() {
        const container = document.getElementById('marketNewsContainer');
        const category = document.getElementById('categoryFilter').value;
        const limit = parseInt(document.getElementById('newsLimit').value);

        container.innerHTML = `
            <div class='loading-container'>
                <i class='fas fa-spinner loading-spinner'></i>
                <p class='loading-text'>Loading ${category} news...</p>
            </div>
        `;

        try {
            const news = await this.finnhubClient.getMarketNews(category);

            if (!Array.isArray(news) || news.length === 0) {
                container.innerHTML = `
                    <div class='empty-state'>
                        <i class='fas fa-inbox empty-icon'></i>
                        <p class='empty-text'>No news available for ${category}</p>
                    </div>
                `;
                document.getElementById('loadMoreContainer').innerHTML = '';
                return;
            }

            this.allNews = news;
            this.displayedNewsCount = Math.min(20, limit);
            this.renderNews();
            this.renderSentimentChart();

        } catch (error) {
            console.error('Error loading market news:', error);
            container.innerHTML = this.getErrorHTML('Failed to load market news');
        }
    },

    renderNews() {
        const container = document.getElementById('marketNewsContainer');
        const newsToDisplay = this.allNews.slice(0, this.displayedNewsCount);
        
        let positiveCount = 0;
        let negativeCount = 0;
        let neutralCount = 0;

        container.innerHTML = newsToDisplay.map((item, index) => {
            const sentiment = this.analyzeSentiment(item.headline + ' ' + (item.summary || ''));
            if (sentiment === 'positive') positiveCount++;
            else if (sentiment === 'negative') negativeCount++;
            else neutralCount++;

            return this.renderNewsCard(item, sentiment, index);
        }).join('');

        document.getElementById('totalNewsCount').textContent = this.allNews.length;
        document.getElementById('positiveNewsCount').textContent = positiveCount;
        document.getElementById('negativeNewsCount').textContent = negativeCount;

        const loadMoreContainer = document.getElementById('loadMoreContainer');
        if (this.displayedNewsCount < this.allNews.length) {
            loadMoreContainer.innerHTML = `
                <button class='btn-primary' onclick='MarketIntelligence.loadMoreNews()'>
                    <i class='fas fa-chevron-down'></i> Load More (${this.allNews.length - this.displayedNewsCount} remaining)
                </button>
            `;
        } else {
            loadMoreContainer.innerHTML = '';
        }
    },

    loadMoreNews() {
        const limit = parseInt(document.getElementById('newsLimit').value);
        this.displayedNewsCount = Math.min(this.displayedNewsCount + 20, limit, this.allNews.length);
        this.renderNews();
        window.scrollTo({ top: document.getElementById('marketNewsContainer').offsetTop - 100, behavior: 'smooth' });
    },

    renderNewsCard(item, sentiment, index) {
        const hasImage = item.image && item.image.trim() !== '';
        
        return `
            <div class='news-card' onclick='window.open("${item.url}", "_blank")' style='animation-delay: ${(index % 20) * 0.05}s;'>
                ${hasImage ? `
                    <div class='news-image'>
                        <img src='${item.image}' 
                             alt='${this.escapeHtml(item.headline)}' 
                             onerror='this.parentElement.innerHTML = MarketIntelligence.getImagePlaceholder();'
                             loading='lazy'>
                    </div>
                ` : this.getImagePlaceholder()}
                
                <div class='news-content'>
                    <div class='news-card-header'>
                        <span class='news-source'>${this.escapeHtml(item.source || 'Unknown')}</span>
                        <span class='news-date'>${this.formatDate(item.datetime)}</span>
                    </div>
                    
                    <h3 class='news-headline'>${this.escapeHtml(item.headline)}</h3>
                    
                    <p class='news-summary'>${this.escapeHtml(item.summary || 'No summary available')}</p>
                    
                    <div class='news-footer'>
                        <span class='sentiment-badge sentiment-${sentiment}'>
                            ${sentiment === 'positive' ? '📈 ' : sentiment === 'negative' ? '📉 ' : '➡️ '}
                            ${sentiment.toUpperCase()}
                        </span>
                        <a href='${item.url}' target='_blank' class='news-link' onclick='event.stopPropagation();'>
                            Read more <i class='fas fa-external-link-alt'></i>
                        </a>
                    </div>
                </div>
            </div>
        `;
    },

    renderSentimentChart() {
        let positiveCount = 0;
        let negativeCount = 0;
        let neutralCount = 0;

        this.allNews.forEach(item => {
            const sentiment = this.analyzeSentiment(item.headline + ' ' + (item.summary || ''));
            if (sentiment === 'positive') positiveCount++;
            else if (sentiment === 'negative') negativeCount++;
            else neutralCount++;
        });

        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const textColor = isDark ? '#e4e4e7' : '#18181b';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';

        Highcharts.chart('sentimentChart', {
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
                backgroundColor: isDark ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                borderRadius: 8,
                shadow: false,
                style: {
                    color: textColor,
                    fontSize: '13px',
                    fontWeight: '500'
                },
                pointFormat: '<b>{point.percentage:.1f}%</b><br/>{point.y} news articles'
            },
            plotOptions: {
                pie: {
                    innerSize: '60%',
                    depth: 45,
                    allowPointSelect: true,
                    cursor: 'pointer',
                    borderWidth: 0,
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b><br>{point.percentage:.1f}%',
                        distance: 20,
                        style: {
                            color: textColor,
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
                name: 'Sentiment',
                colorByPoint: true,
                data: [{
                    name: 'Positive',
                    y: positiveCount,
                    color: {
                        linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
                        stops: [
                            [0, '#10b981'],
                            [1, '#059669']
                        ]
                    }
                }, {
                    name: 'Neutral',
                    y: neutralCount,
                    color: {
                        linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
                        stops: [
                            [0, '#94a3b8'],
                            [1, '#64748b']
                        ]
                    }
                }, {
                    name: 'Negative',
                    y: negativeCount,
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

    async loadEarningsCalendar() {
        const container = document.getElementById('earningsCalendarContainer');
        const days = parseInt(document.getElementById('earningsPeriod').value);

        try {
            const from = new Date().toISOString().split('T')[0];
            const toDate = new Date();
            toDate.setDate(toDate.getDate() + days);
            const to = toDate.toISOString().split('T')[0];

            const calendar = await this.finnhubClient.getEarningsCalendar(from, to);

            if (!calendar || !calendar.earningsCalendar || calendar.earningsCalendar.length === 0) {
                container.innerHTML = `
                    <div class='empty-state'>
                        <i class='fas fa-calendar-times empty-icon'></i>
                        <p class='empty-text'>No upcoming earnings in the next ${days} days</p>
                    </div>
                `;
                document.getElementById('upcomingEarningsCount').textContent = '0';
                return;
            }

            const earnings = calendar.earningsCalendar.slice(0, 100);

            container.innerHTML = `
                <div class='earnings-table'>
                    <table>
                        <thead>
                            <tr>
                                <th><i class='fas fa-calendar'></i> Date</th>
                                <th><i class='fas fa-tag'></i> Symbol</th>
                                <th><i class='fas fa-building'></i> Company</th>
                                <th><i class='fas fa-chart-line'></i> EPS Estimate</th>
                                <th><i class='fas fa-dollar-sign'></i> Revenue Estimate</th>
                                <th><i class='fas fa-external-link-alt'></i> Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${earnings.map(item => `
                                <tr>
                                    <td><strong>${this.formatEarningsDate(item.date)}</strong></td>
                                    <td>
                                        <span style='
                                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                            -webkit-background-clip: text;
                                            -webkit-text-fill-color: transparent;
                                            background-clip: text;
                                            font-weight: 800;
                                            font-size: 1.1em;
                                        '>${item.symbol || 'N/A'}</span>
                                    </td>
                                    <td>${this.escapeHtml(item.name || item.symbol || 'N/A')}</td>
                                    <td>${item.epsEstimate ? '<strong>$' + item.epsEstimate.toFixed(2) + '</strong>' : '<span style="color: var(--text-secondary);">N/A</span>'}</td>
                                    <td>${item.revenueEstimate ? '<strong>$' + (item.revenueEstimate / 1e9).toFixed(2) + 'B</strong>' : '<span style="color: var(--text-secondary);">N/A</span>'}</td>
                                    <td>
                                        <button class='btn-primary' onclick='MarketIntelligence.openCompanyInsights("${item.symbol}")' 
                                                style='padding: 8px 16px; font-size: 0.85em;'>
                                            <i class='fas fa-search'></i> View
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;

            document.getElementById('upcomingEarningsCount').textContent = calendar.earningsCalendar.length;

        } catch (error) {
            console.error('Error loading earnings calendar:', error);
            container.innerHTML = this.getErrorHTML('Failed to load earnings calendar');
        }
    },

    openCompanyInsights(symbol) {
        window.location.href = `company-insights.html?symbol=${symbol}`;
    },

    exportNews() {
        if (this.allNews.length === 0) {
            alert('No news to export');
            return;
        }

        const category = document.getElementById('categoryFilter').value;
        const csvContent = this.convertNewsToCSV(this.allNews);
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `market-news-${category}-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    },

    convertNewsToCSV(news) {
        const headers = ['Date', 'Source', 'Headline', 'Summary', 'Sentiment', 'URL'];
        const rows = news.map(item => {
            const sentiment = this.analyzeSentiment(item.headline + ' ' + (item.summary || ''));
            return [
                new Date(item.datetime * 1000).toISOString(),
                item.source || 'Unknown',
                `"${(item.headline || '').replace(/"/g, '""')}"`,
                `"${(item.summary || '').replace(/"/g, '""')}"`,
                sentiment,
                item.url || ''
            ].join(',');
        });

        return [headers.join(','), ...rows].join('\n');
    },

    exportEarnings() {
        alert('Earnings export feature - Coming soon!');
    },

    analyzeSentiment(text) {
        const positiveWords = ['gain', 'profit', 'growth', 'surge', 'rally', 'bullish', 'upgrade', 'strong', 'positive', 'beat', 'outperform', 'rise', 'jump', 'soar', 'record', 'high', 'success', 'boost', 'top', 'best'];
        const negativeWords = ['loss', 'decline', 'fall', 'drop', 'bearish', 'downgrade', 'weak', 'negative', 'miss', 'underperform', 'plunge', 'crash', 'sink', 'concern', 'risk', 'warning', 'threat', 'fear', 'worst'];

        const textLower = text.toLowerCase();
        let positiveScore = 0;
        let negativeScore = 0;

        positiveWords.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            const matches = textLower.match(regex);
            if (matches) positiveScore += matches.length;
        });

        negativeWords.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            const matches = textLower.match(regex);
            if (matches) negativeScore += matches.length;
        });

        if (positiveScore > negativeScore) return 'positive';
        if (negativeScore > positiveScore) return 'negative';
        return 'neutral';
    },

    formatDate(timestamp) {
        const date = new Date(timestamp * 1000);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    },

    formatEarningsDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        });
    },

    getImagePlaceholder() {
        const gradients = [
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        ];
        
        const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];
        
        return `
            <div class='news-image-placeholder' style='background: ${randomGradient};'>
                <i class='fas fa-newspaper'></i>
            </div>
        `;
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

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    getErrorHTML(message) {
        return `
            <div class='error-container'>
                <i class='fas fa-exclamation-triangle error-icon'></i>
                <p class='error-message'>${message}</p>
                <button class='btn-primary' onclick='MarketIntelligence.loadData()'>
                    <i class='fas fa-sync'></i> Retry
                </button>
            </div>
        `;
    },

    showGlobalError(message) {
        const container = document.querySelector('.container');
        if (container) {
            container.innerHTML = `
                <div class='error-container'>
                    <i class='fas fa-exclamation-triangle error-icon'></i>
                    <p class='error-message'>${message}</p>
                    <button class='btn-primary' onclick='location.reload()'>
                        <i class='fas fa-redo'></i> Reload Page
                    </button>
                </div>
            `;
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    MarketIntelligence.init();
});