// ============================================
// MARKET INTELLIGENCE - PAGE LOGIC
// ============================================

const MarketIntelligence = {
    finnhubClient: null,

    async init() {
        console.log('🚀 Initializing Market Intelligence...');
        
        try {
            // ✅ Initialiser le client FinnHub
            this.finnhubClient = new FinnHubClient();
            
            // Charger les données
            await this.loadData();
            
            // Mettre à jour l'heure
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
                        <p class='empty-text'>No news available</p>
                    </div>
                `;
                return;
            }

            let positiveCount = 0;
            let negativeCount = 0;

            container.innerHTML = news.slice(0, 20).map(item => {
                const sentiment = this.analyzeSentiment(item.headline + ' ' + (item.summary || ''));
                if (sentiment === 'positive') positiveCount++;
                if (sentiment === 'negative') negativeCount++;

                return `
                    <div class='news-card' onclick='window.open("${item.url}", "_blank")'>
                        <div class='news-card-header'>
                            <span class='news-source'>${item.source || 'Unknown'}</span>
                            <span class='news-date'>${this.formatDate(item.datetime)}</span>
                        </div>
                        <h3 class='news-headline'>${item.headline}</h3>
                        <p class='news-summary'>${item.summary || 'No summary available'}</p>
                        <div class='news-footer'>
                            <span class='sentiment-badge sentiment-${sentiment}'>
                                ${sentiment.toUpperCase()}
                            </span>
                            <a href='${item.url}' target='_blank' class='news-link' onclick='event.stopPropagation();'>
                                Read more <i class='fas fa-external-link-alt'></i>
                            </a>
                        </div>
                    </div>
                `;
            }).join('');

            document.getElementById('totalNewsCount').textContent = news.length;
            document.getElementById('positiveNewsCount').textContent = positiveCount;
            document.getElementById('negativeNewsCount').textContent = negativeCount;

        } catch (error) {
            console.error('Error loading market news:', error);
            container.innerHTML = this.getErrorHTML('Failed to load market news');
        }
    },

    async loadEarningsCalendar() {
        const container = document.getElementById('earningsCalendarContainer');

        try {
            const calendar = await this.finnhubClient.getEarningsCalendar();

            if (!calendar || !calendar.earningsCalendar || calendar.earningsCalendar.length === 0) {
                container.innerHTML = `
                    <div class='empty-state'>
                        <i class='fas fa-calendar-times empty-icon'></i>
                        <p class='empty-text'>No upcoming earnings</p>
                    </div>
                `;
                document.getElementById('upcomingEarningsCount').textContent = '0';
                return;
            }

            const earnings = calendar.earningsCalendar.slice(0, 30);

            container.innerHTML = `
                <div class='earnings-table'>
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Symbol</th>
                                <th>Company</th>
                                <th>EPS Estimate</th>
                                <th>Revenue Estimate</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${earnings.map(item => `
                                <tr onclick='MarketIntelligence.openCompanyInsights("${item.symbol}")' style='cursor: pointer;'>
                                    <td>${item.date || 'N/A'}</td>
                                    <td><strong>${item.symbol || 'N/A'}</strong></td>
                                    <td>${item.name || item.symbol || 'N/A'}</td>
                                    <td>${item.epsEstimate ? '$' + item.epsEstimate.toFixed(2) : 'N/A'}</td>
                                    <td>${item.revenueEstimate ? '$' + (item.revenueEstimate / 1e9).toFixed(2) + 'B' : 'N/A'}</td>
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

    analyzeSentiment(text) {
        const positiveWords = ['gain', 'profit', 'growth', 'surge', 'rally', 'bullish', 'upgrade', 'strong', 'positive', 'beat', 'outperform', 'rise', 'jump', 'soar'];
        const negativeWords = ['loss', 'decline', 'fall', 'drop', 'bearish', 'downgrade', 'weak', 'negative', 'miss', 'underperform', 'plunge', 'crash', 'sink'];

        const textLower = text.toLowerCase();
        let positiveScore = 0;
        let negativeScore = 0;

        positiveWords.forEach(word => {
            if (textLower.includes(word)) positiveScore++;
        });

        negativeWords.forEach(word => {
            if (textLower.includes(word)) negativeScore++;
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

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return date.toLocaleDateString();
    },

    updateLastUpdate() {
        const now = new Date();
        document.getElementById('lastUpdate').textContent = now.toLocaleString();
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
                </div>
            `;
        }
    }
};

// Initialiser au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    MarketIntelligence.init();
});