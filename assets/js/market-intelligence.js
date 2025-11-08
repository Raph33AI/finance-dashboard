// ============================================
// MARKET INTELLIGENCE - PAGE LOGIC v2.0
// Avec support des images et effets optimisés
// ============================================

const MarketIntelligence = {
    finnhubClient: null,

    async init() {
        console.log('🚀 Initializing Market Intelligence v2.0...');
        
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
                return;
            }

            let positiveCount = 0;
            let negativeCount = 0;

            container.innerHTML = news.slice(0, 20).map((item, index) => {
                const sentiment = this.analyzeSentiment(item.headline + ' ' + (item.summary || ''));
                if (sentiment === 'positive') positiveCount++;
                if (sentiment === 'negative') negativeCount++;

                return this.renderNewsCard(item, sentiment, index);
            }).join('');

            document.getElementById('totalNewsCount').textContent = news.length;
            document.getElementById('positiveNewsCount').textContent = positiveCount;
            document.getElementById('negativeNewsCount').textContent = negativeCount;

        } catch (error) {
            console.error('Error loading market news:', error);
            container.innerHTML = this.getErrorHTML('Failed to load market news');
        }
    },

    renderNewsCard(item, sentiment, index) {
        const hasImage = item.image && item.image.trim() !== '';
        
        return `
            <div class='news-card' onclick='window.open("${item.url}", "_blank")' style='animation-delay: ${index * 0.1}s;'>
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

    async loadEarningsCalendar() {
        const container = document.getElementById('earningsCalendarContainer');

        try {
            const calendar = await this.finnhubClient.getEarningsCalendar();

            if (!calendar || !calendar.earningsCalendar || calendar.earningsCalendar.length === 0) {
                container.innerHTML = `
                    <div class='empty-state'>
                        <i class='fas fa-calendar-times empty-icon'></i>
                        <p class='empty-text'>No upcoming earnings in the next 30 days</p>
                    </div>
                `;
                document.getElementById('upcomingEarningsCount').textContent = '0';
                return;
            }

            const earnings = calendar.earningsCalendar.slice(0, 50);

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
                            </tr>
                        </thead>
                        <tbody>
                            ${earnings.map(item => `
                                <tr onclick='MarketIntelligence.openCompanyInsights("${item.symbol}")'>
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
        const positiveWords = ['gain', 'profit', 'growth', 'surge', 'rally', 'bullish', 'upgrade', 'strong', 'positive', 'beat', 'outperform', 'rise', 'jump', 'soar', 'record', 'high', 'success'];
        const negativeWords = ['loss', 'decline', 'fall', 'drop', 'bearish', 'downgrade', 'weak', 'negative', 'miss', 'underperform', 'plunge', 'crash', 'sink', 'concern', 'risk', 'warning'];

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

    updateLastUpdate() {
        const now = new Date();
        const formatted = now.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        document.getElementById('lastUpdate').textContent = formatted;
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    getErrorHTML(message) {
        return `
            <div class='error-container'>
                <i class='fas fa-exclamation-triangle error-icon'></i>
                <p class='error-message'>${message}</p>
                <button class='btn-primary' onclick='MarketIntelligence.loadData()' style='margin-top: 20px;'>
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
                    <button class='btn-primary' onclick='location.reload()' style='margin-top: 20px;'>
                        <i class='fas fa-redo'></i> Reload Page
                    </button>
                </div>
            `;
        }
    }
};

// Initialiser au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    MarketIntelligence.init();
});