// ============================================
// COMPANY INSIGHTS - PAGE LOGIC
// ============================================

const CompanyInsights = {
    finnhubClient: null,
    currentSymbol: null,

    async init() {
        console.log('🚀 Initializing Company Insights...');
        
        try {
            this.finnhubClient = new FinnHubClient();
            
            // Vérifier si un symbole est passé en URL
            const urlParams = new URLSearchParams(window.location.search);
            const symbol = urlParams.get('symbol');
            
            if (symbol) {
                document.getElementById('symbolInput').value = symbol.toUpperCase();
                await this.loadCompanyData();
            }
            
            // Écouter la touche Enter
            document.getElementById('symbolInput').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.loadCompanyData();
                }
            });
            
            this.updateLastUpdate();
            console.log('✅ Company Insights initialized');
            
        } catch (error) {
            console.error('❌ Initialization error:', error);
        }
    },

    async loadCompanyData() {
        const symbol = document.getElementById('symbolInput').value.trim().toUpperCase();
        
        if (!symbol) {
            alert('Please enter a stock symbol');
            return;
        }

        this.currentSymbol = symbol;
        
        // Afficher les loaders
        this.showLoading();

        try {
            await Promise.all([
                this.loadCompanyProfile(symbol),
                this.loadSentimentAnalysis(symbol),
                this.loadCompanyNews(symbol),
                this.loadPeers(symbol)
            ]);
        } catch (error) {
            console.error('❌ Error loading company data:', error);
        }
    },

    showLoading() {
        const loadingHTML = `
            <div class='loading-container'>
                <i class='fas fa-spinner loading-spinner'></i>
                <p class='loading-text'>Loading company data...</p>
            </div>
        `;
        
        document.getElementById('companyProfileContainer').innerHTML = loadingHTML;
        document.getElementById('sentimentContainer').innerHTML = '';
        document.getElementById('companyNewsContainer').innerHTML = '';
        document.getElementById('peersContainer').innerHTML = '';
        
        document.getElementById('newsSection').style.display = 'none';
        document.getElementById('peersSection').style.display = 'none';
    },

    async loadCompanyProfile(symbol) {
        const container = document.getElementById('companyProfileContainer');

        try {
            const profile = await this.finnhubClient.getCompanyProfile(symbol);

            if (!profile || !profile.name) {
                container.innerHTML = `
                    <div class='error-container'>
                        <i class='fas fa-exclamation-triangle error-icon'></i>
                        <p class='error-message'>Company not found: ${symbol}</p>
                        <p>Please try another symbol</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = `
                <div class='company-profile-card'>
                    <div class='company-profile-header'>
                        ${profile.logo ? `
                            <img src='${profile.logo}' alt='${profile.name}' class='company-logo'
                                 onerror='this.src="https://ui-avatars.com/api/?name=${encodeURIComponent(profile.ticker || symbol)}&background=667eea&color=fff&size=100&bold=true"'>
                        ` : `
                            <div class='company-logo' style='display: flex; align-items: center; justify-content: center; font-size: 2em; font-weight: 800; color: #667eea;'>
                                ${(profile.ticker || symbol).substring(0, 2)}
                            </div>
                        `}
                        <div class='company-title'>
                            <h1>${this.escapeHtml(profile.name)}</h1>
                            <p>
                                <strong>${profile.ticker || symbol}</strong> • 
                                ${profile.exchange || 'N/A'} • 
                                ${profile.country || 'N/A'}
                            </p>
                        </div>
                    </div>
                    
                    <div class='company-details'>
                        <div class='company-detail-item'>
                            <div class='company-detail-label'><i class='fas fa-industry'></i> Industry</div>
                            <div class='company-detail-value'>${profile.finnhubIndustry || 'N/A'}</div>
                        </div>
                        <div class='company-detail-item'>
                            <div class='company-detail-label'><i class='fas fa-calendar'></i> IPO Date</div>
                            <div class='company-detail-value'>${profile.ipo || 'N/A'}</div>
                        </div>
                        <div class='company-detail-item'>
                            <div class='company-detail-label'><i class='fas fa-chart-line'></i> Market Cap</div>
                            <div class='company-detail-value'>${profile.marketCapitalization ? '$' + profile.marketCapitalization.toFixed(2) + 'B' : 'N/A'}</div>
                        </div>
                        <div class='company-detail-item'>
                            <div class='company-detail-label'><i class='fas fa-chart-area'></i> Outstanding Shares</div>
                            <div class='company-detail-value'>${profile.shareOutstanding ? profile.shareOutstanding.toFixed(2) + 'M' : 'N/A'}</div>
                        </div>
                    </div>
                    
                    ${profile.weburl ? `
                        <div style='margin-top: 25px; position: relative; z-index: 1;'>
                            <a href='${profile.weburl}' target='_blank' 
                               style='display: inline-flex; align-items: center; gap: 10px; 
                                      background: rgba(255,255,255,0.2); padding: 12px 25px; 
                                      border-radius: 12px; color: white; text-decoration: none; 
                                      font-weight: 700; transition: all 0.3s ease;
                                      backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.3);'>
                                <i class='fas fa-globe'></i> Visit Website
                            </a>
                        </div>
                    ` : ''}
                </div>
            `;

        } catch (error) {
            console.error('Error loading company profile:', error);
            container.innerHTML = this.getErrorHTML('Failed to load company profile');
        }
    },

    async loadSentimentAnalysis(symbol) {
        const container = document.getElementById('sentimentContainer');

        try {
            const analysis = await this.finnhubClient.analyzeNewsImpact(symbol);

            if (!analysis || !analysis.overallSentiment) {
                return;
            }

            const sentiment = analysis.overallSentiment;
            const score = sentiment.sentiment || 0;
            const sentimentClass = score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral';

            container.innerHTML = `
                <div class='section'>
                    <h2 class='section-title'>
                        <i class='fas fa-brain'></i> AI Sentiment & Impact Analysis
                    </h2>
                    
                    <div class='stats-row'>
                        <div class='stat-card'>
                            <div class='stat-card-icon'>💭</div>
                            <div class='stat-card-value'>${score.toFixed(2)}</div>
                            <div class='stat-card-label'>Sentiment Score</div>
                        </div>
                        <div class='stat-card'>
                            <div class='stat-card-icon'>${analysis.shortTermImpact.direction === 'Positive' ? '📈' : analysis.shortTermImpact.direction === 'Negative' ? '📉' : '➡️'}</div>
                            <div class='stat-card-value'>${analysis.shortTermImpact.direction}</div>
                            <div class='stat-card-label'>Short-Term Impact</div>
                        </div>
                        <div class='stat-card'>
                            <div class='stat-card-icon'>${analysis.longTermImpact.direction === 'Positive' ? '🚀' : analysis.longTermImpact.direction === 'Negative' ? '⚠️' : '⏸️'}</div>
                            <div class='stat-card-value'>${analysis.longTermImpact.direction}</div>
                            <div class='stat-card-label'>Long-Term Impact</div>
                        </div>
                    </div>
                    
                    <div class='toolbar'>
                        <div style='text-align: center; padding: 20px;'>
                            <h3 style='margin-bottom: 15px; color: var(--text-primary);'>
                                <i class='fas fa-lightbulb'></i> AI Recommendation
                            </h3>
                            <div class='sentiment-badge sentiment-${sentimentClass}' 
                                 style='font-size: 1.2em; padding: 15px 35px; display: inline-block;'>
                                ${analysis.recommendation}
                            </div>
                        </div>
                    </div>
                </div>
            `;

        } catch (error) {
            console.error('Error loading sentiment analysis:', error);
        }
    },

    async loadCompanyNews(symbol) {
        const container = document.getElementById('companyNewsContainer');
        const section = document.getElementById('newsSection');

        try {
            const news = await this.finnhubClient.getCompanyNews(symbol);

            if (!Array.isArray(news) || news.length === 0) {
                section.style.display = 'none';
                return;
            }

            section.style.display = 'block';

            container.innerHTML = news.slice(0, 12).map((item, index) => {
                const sentiment = this.analyzeSentiment(item.headline + ' ' + (item.summary || ''));
                return this.renderNewsCard(item, sentiment, index);
            }).join('');

        } catch (error) {
            console.error('Error loading company news:', error);
            section.style.display = 'none';
        }
    },

    async loadPeers(symbol) {
        const container = document.getElementById('peersContainer');
        const section = document.getElementById('peersSection');

        try {
            const peers = await this.finnhubClient.getPeers(symbol);

            if (!Array.isArray(peers) || peers.length === 0) {
                section.style.display = 'none';
                return;
            }

            section.style.display = 'block';

            container.innerHTML = peers.map(peer => `
                <div class='peer-badge' onclick='CompanyInsights.selectPeer("${peer}")'>
                    <i class='fas fa-building'></i> ${peer}
                </div>
            `).join('');

        } catch (error) {
            console.error('Error loading peers:', error);
            section.style.display = 'none';
        }
    },

    selectPeer(symbol) {
        document.getElementById('symbolInput').value = symbol;
        this.loadCompanyData();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    renderNewsCard(item, sentiment, index) {
        const hasImage = item.image && item.image.trim() !== '';
        
        return `
            <div class='news-card' onclick='window.open("${item.url}", "_blank")' style='animation-delay: ${index * 0.05}s;'>
                ${hasImage ? `
                    <div class='news-image'>
                        <img src='${item.image}' 
                             alt='${this.escapeHtml(item.headline)}' 
                             onerror='this.parentElement.innerHTML = CompanyInsights.getImagePlaceholder();'
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
        ];
        
        const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];
        
        return `
            <div class='news-image-placeholder' style='background: ${randomGradient};'>
                <i class='fas fa-newspaper'></i>
            </div>
        `;
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

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
            </div>
        `;
    }
};

// Initialiser au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    CompanyInsights.init();
});