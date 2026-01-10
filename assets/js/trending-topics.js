/**
 * ════════════════════════════════════════════════════════════════
 * TRENDING TOPICS DASHBOARD V2.0 - Avec Modal Détaillé
 * ════════════════════════════════════════════════════════════════
 */

class TrendingTopicsDashboard {
    constructor() {
        this.rssClient = new RSSClient();
        this.sentimentAnalyzer = new SentimentAnalyzer();
        this.fearGreedCalculator = new FearGreedCalculator();
        this.entityDB = window.entityDB || new EntityDatabase();
        
        this.allArticles = [];
        this.trendingTopics = [];
        this.fearGreedData = null;
        this.risksOpportunities = null;
        
        this.charts = {};
        
        this.init();
    }

    async init() {
        console.log('🔥 Initializing Trending Topics Dashboard V2.0...');
        
        if (document.readyState === 'loading') {
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve);
            });
        }
        
        this.createModal();
        this.showLoadingState();
        
        await this.loadData();
        
        this.hideLoadingState();
        
        this.renderDashboard();
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * CRÉATION DU MODAL
     * ═══════════════════════════════════════════════════════════
     */
    
    createModal() {
        if (document.getElementById('companyModal')) return;
        
        const modal = document.createElement('div');
        modal.id = 'companyModal';
        modal.className = 'company-modal';
        modal.innerHTML = `
            <div class='modal-overlay'></div>
            <div class='modal-content'>
                <div class='modal-header'>
                    <div class='modal-title-wrapper'>
                        <div class='modal-company-icon'>
                            <i class='fas fa-building'></i>
                        </div>
                        <div>
                            <h2 class='modal-company-name' id='modalCompanyName'></h2>
                            <p class='modal-company-ticker' id='modalCompanyTicker'></p>
                        </div>
                    </div>
                    <button class='modal-close' onclick='trendingDashboard.closeModal()'>
                        <i class='fas fa-times'></i>
                    </button>
                </div>
                
                <div class='modal-sentiment-badge' id='modalSentimentBadge'></div>
                
                <div class='modal-actions'>
                    <button class='modal-action-btn analyze' id='modalAnalyzeBtn'>
                        <i class='fas fa-brain'></i>
                        <span>Advanced Analysis</span>
                    </button>
                    <button class='modal-action-btn predict' id='modalPredictBtn'>
                        <i class='fas fa-chart-line'></i>
                        <span>Predict Trends</span>
                    </button>
                </div>
                
                <div class='modal-stats'>
                    <div class='modal-stat'>
                        <i class='fas fa-newspaper'></i>
                        <div>
                            <span class='stat-label'>Mentions</span>
                            <span class='stat-value' id='modalMentions'>0</span>
                        </div>
                    </div>
                    <div class='modal-stat'>
                        <i class='fas fa-smile'></i>
                        <div>
                            <span class='stat-label'>Positive</span>
                            <span class='stat-value' id='modalPositive'>0</span>
                        </div>
                    </div>
                    <div class='modal-stat'>
                        <i class='fas fa-frown'></i>
                        <div>
                            <span class='stat-label'>Negative</span>
                            <span class='stat-value' id='modalNegative'>0</span>
                        </div>
                    </div>
                    <div class='modal-stat'>
                        <i class='fas fa-chart-bar'></i>
                        <div>
                            <span class='stat-label'>Sentiment</span>
                            <span class='stat-value' id='modalAvgSentiment'>0</span>
                        </div>
                    </div>
                </div>
                
                <div class='modal-section'>
                    <h3 class='modal-section-title'>
                        <i class='fas fa-list'></i> Recent Mentions
                    </h3>
                    <div class='modal-articles-list' id='modalArticlesList'></div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close on overlay click
        modal.querySelector('.modal-overlay').addEventListener('click', () => {
            this.closeModal();
        });
        
        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                this.closeModal();
            }
        });
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * OUVRIR LE MODAL
     * ═══════════════════════════════════════════════════════════
     */
    
    openModal(companyData) {
        console.log('🔍 Opening modal for:', companyData.name);
        
        const modal = document.getElementById('companyModal');
        if (!modal) return;
        
        // Store current company data
        this.currentCompany = companyData;
        
        // Populate modal
        document.getElementById('modalCompanyName').textContent = companyData.name;
        document.getElementById('modalCompanyTicker').textContent = `(${companyData.ticker})`;
        document.getElementById('modalMentions').textContent = companyData.articles.length;
        document.getElementById('modalPositive').textContent = companyData.positiveCount;
        document.getElementById('modalNegative').textContent = companyData.negativeCount;
        document.getElementById('modalAvgSentiment').textContent = companyData.avgSentiment > 0 ? `+${companyData.avgSentiment}` : companyData.avgSentiment;
        
        // Sentiment badge
        const sentimentBadge = document.getElementById('modalSentimentBadge');
        if (companyData.avgSentiment > 20) {
            sentimentBadge.innerHTML = `<i class='fas fa-arrow-up'></i> <strong>High Opportunity</strong> - Strong positive sentiment detected`;
            sentimentBadge.className = 'modal-sentiment-badge opportunity';
        } else if (companyData.avgSentiment < -20) {
            sentimentBadge.innerHTML = `<i class='fas fa-arrow-down'></i> <strong>High Risk</strong> - Strong negative sentiment detected`;
            sentimentBadge.className = 'modal-sentiment-badge risk';
        } else {
            sentimentBadge.innerHTML = `<i class='fas fa-minus'></i> <strong>Neutral</strong> - Mixed sentiment`;
            sentimentBadge.className = 'modal-sentiment-badge neutral';
        }
        
        // Render articles
        this.renderModalArticles(companyData.articles);
        
        // Setup action buttons
        this.setupModalActions(companyData.ticker);
        
        // Show modal
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * AFFICHER LES ARTICLES DANS LE MODAL
     * ═══════════════════════════════════════════════════════════
     */
    
    renderModalArticles(articles) {
        const container = document.getElementById('modalArticlesList');
        if (!container) return;
        
        container.innerHTML = '';
        
        // Sort by timestamp (most recent first)
        const sortedArticles = [...articles].sort((a, b) => b.timestamp - a.timestamp);
        
        sortedArticles.forEach(article => {
            const sentiment = this.sentimentAnalyzer.analyze(article.title);
            
            const articleCard = document.createElement('div');
            articleCard.className = 'modal-article-card';
            
            const sentimentClass = sentiment.sentiment === 'positive' ? 'positive' : 
                                   sentiment.sentiment === 'negative' ? 'negative' : 'neutral';
            
            articleCard.innerHTML = `
                <div class='article-sentiment-indicator ${sentimentClass}'></div>
                <div class='article-content'>
                    <div class='article-header'>
                        <span class='article-source'>${article.source || 'Unknown Source'}</span>
                        <span class='article-time'>${this.getTimeAgo(article.timestamp)}</span>
                    </div>
                    <h4 class='article-title'>${article.title}</h4>
                    <div class='article-footer'>
                        <div class='article-sentiment'>
                            <i class='fas ${sentiment.sentiment === 'positive' ? 'fa-smile' : sentiment.sentiment === 'negative' ? 'fa-frown' : 'fa-meh'}'></i>
                            <span>${sentiment.sentiment}</span>
                            <span class='sentiment-score'>${sentiment.score > 0 ? '+' : ''}${sentiment.score}</span>
                        </div>
                        ${article.link ? `<a href='${article.link}' target='_blank' class='article-link'>
                            <i class='fas fa-external-link-alt'></i> Read More
                        </a>` : ''}
                    </div>
                </div>
            `;
            
            container.appendChild(articleCard);
        });
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * CONFIGURER LES BOUTONS D'ACTION
     * ═══════════════════════════════════════════════════════════
     */
    
    setupModalActions(ticker) {
        // Analyze button
        const analyzeBtn = document.getElementById('modalAnalyzeBtn');
        analyzeBtn.onclick = () => {
            window.location.href = `advanced-analysis.html?symbol=${ticker}`;
        };
        
        // Predict button
        const predictBtn = document.getElementById('modalPredictBtn');
        predictBtn.onclick = () => {
            window.location.href = `trend-prediction.html?symbol=${ticker}`;
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * FERMER LE MODAL
     * ═══════════════════════════════════════════════════════════
     */
    
    closeModal() {
        const modal = document.getElementById('companyModal');
        if (!modal) return;
        
        modal.classList.remove('active');
        document.body.style.overflow = '';
        this.currentCompany = null;
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * CHARGEMENT DES DONNÉES
     * ═══════════════════════════════════════════════════════════
     */
    
    async loadData() {
        try {
            console.log('📡 Loading articles from RSS...');
            const data = await this.rssClient.getAllArticles();
            
            this.allArticles = data.articles.map(article => {
                const entities = this.entityDB.extractEntities(article);
                return {
                    ...article,
                    companies: entities.companies,
                    countries: entities.countries,
                    tickers: entities.tickers
                };
            });
            
            console.log(`✅ Loaded ${this.allArticles.length} articles with entity extraction`);
            
            this.trendingTopics = this.detectTrendingTopics(this.allArticles);
            this.fearGreedData = this.fearGreedCalculator.calculate(this.allArticles);
            this.risksOpportunities = this.analyzeRisksOpportunities(this.allArticles);
            
            console.log('✅ All data processed successfully!');
            
        } catch (error) {
            console.error('❌ Error loading data:', error);
            this.showError();
            throw error;
        }
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * DÉTECTION DES TRENDING TOPICS
     * ═══════════════════════════════════════════════════════════
     */
    
    detectTrendingTopics(articles) {
        console.log('🔍 Detecting trending topics...');
        
        const keywords = {
            'AI': { icon: 'fa-robot', variations: ['ai', 'artificial intelligence', 'chatgpt', 'openai', 'machine learning', 'generative'] },
            'Rate Cuts': { icon: 'fa-percent', variations: ['rate cut', 'interest rate', 'fed', 'federal reserve', 'monetary policy', 'powell'] },
            'Earnings': { icon: 'fa-chart-line', variations: ['earnings', 'revenue', 'profit', 'quarterly results', 'eps', 'beats estimates'] },
            'China': { icon: 'fa-flag', variations: ['china', 'chinese', 'beijing', 'yuan', 'xi jinping'] },
            'Oil': { icon: 'fa-oil-can', variations: ['oil', 'crude', 'petroleum', 'opec', 'energy prices', 'brent'] },
            'Crypto': { icon: 'fa-bitcoin', variations: ['bitcoin', 'crypto', 'cryptocurrency', 'ethereum', 'blockchain', 'btc'] },
            'Tech': { icon: 'fa-microchip', variations: ['tech', 'technology', 'semiconductor', 'chip', 'nvidia', 'apple', 'microsoft'] },
            'Banking': { icon: 'fa-university', variations: ['bank', 'banking', 'financial institution', 'jpmorgan', 'goldman', 'wells fargo'] },
            'Inflation': { icon: 'fa-fire', variations: ['inflation', 'cpi', 'pce', 'price increase', 'consumer prices'] },
            'Recession': { icon: 'fa-exclamation-triangle', variations: ['recession', 'economic slowdown', 'gdp decline', 'downturn'] }
        };
        
        const topicStats = {};
        
        Object.keys(keywords).forEach(topic => {
            topicStats[topic] = {
                name: topic,
                icon: keywords[topic].icon,
                count: 0,
                articles: [],
                dailyCount: {}
            };
        });
        
        articles.forEach(article => {
            const titleLower = article.title.toLowerCase();
            const date = new Date(article.timestamp).toLocaleDateString();
            
            Object.entries(keywords).forEach(([topic, data]) => {
                const found = data.variations.some(variation => 
                    titleLower.includes(variation.toLowerCase())
                );
                
                if (found) {
                    topicStats[topic].count += 1;
                    topicStats[topic].articles.push(article);
                    
                    if (!topicStats[topic].dailyCount[date]) {
                        topicStats[topic].dailyCount[date] = 0;
                    }
                    topicStats[topic].dailyCount[date] += 1;
                }
            });
        });
        
        const trending = Object.values(topicStats)
            .filter(topic => topic.count > 0)
            .sort((a, b) => b.count - a.count)
            .map(topic => {
                const dates = Object.keys(topic.dailyCount).sort((a, b) => new Date(b) - new Date(a));
                
                const recent7Days = dates.slice(0, 7).reduce((sum, date) => sum + (topic.dailyCount[date] || 0), 0);
                const previous7Days = dates.slice(7, 14).reduce((sum, date) => sum + (topic.dailyCount[date] || 0), 0);
                
                let trend = 'neutral';
                let change = 0;
                
                if (previous7Days > 0) {
                    change = Math.round(((recent7Days - previous7Days) / previous7Days) * 100);
                    
                    if (change > 10) trend = 'up';
                    else if (change < -10) trend = 'down';
                } else if (recent7Days > 0) {
                    trend = 'up';
                    change = 100;
                }
                
                const timeline = dates.slice(0, 14).reverse().map(date => ({
                    date,
                    count: topic.dailyCount[date] || 0
                }));
                
                return {
                    ...topic,
                    trend,
                    change,
                    timeline
                };
            });
        
        console.log('✅ Trending topics detected:', trending);
        return trending;
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * ANALYSE RISQUES & OPPORTUNITÉS (AVEC NOMS D'ENTREPRISES)
     * ═══════════════════════════════════════════════════════════
     */
    
    analyzeRisksOpportunities(articles) {
        console.log('⚖ Analyzing risks & opportunities (with company names)...');
        
        const companyMentions = {};
        
        articles.forEach(article => {
            if (article.companies && article.companies.length > 0) {
                article.companies.forEach(company => {
                    const ticker = company.ticker;
                    const name = company.name;
                    
                    if (!companyMentions[ticker]) {
                        companyMentions[ticker] = {
                            name: name,
                            ticker: ticker,
                            articles: [],
                            positiveCount: 0,
                            negativeCount: 0,
                            neutralCount: 0,
                            totalSentiment: 0
                        };
                    }
                    
                    companyMentions[ticker].articles.push(article);
                    
                    const sentiment = this.sentimentAnalyzer.analyze(article.title);
                    companyMentions[ticker].totalSentiment += sentiment.score;
                    
                    if (sentiment.sentiment === 'positive') {
                        companyMentions[ticker].positiveCount += 1;
                    } else if (sentiment.sentiment === 'negative') {
                        companyMentions[ticker].negativeCount += 1;
                    } else {
                        companyMentions[ticker].neutralCount += 1;
                    }
                });
            }
        });
        
        console.log('📊 Company mentions detected:', Object.keys(companyMentions).length);
        
        const opportunities = Object.values(companyMentions)
            .filter(company => company.articles.length >= 1)
            .filter(company => company.positiveCount > company.negativeCount)
            .sort((a, b) => b.totalSentiment - a.totalSentiment)
            .slice(0, 5)
            .map(company => ({
                ...company,
                avgSentiment: Math.round(company.totalSentiment / company.articles.length),
                level: company.totalSentiment > 30 ? 'High' : 'Medium'
            }));
        
        const risks = Object.values(companyMentions)
            .filter(company => company.articles.length >= 1)
            .filter(company => company.negativeCount > company.positiveCount)
            .sort((a, b) => a.totalSentiment - b.totalSentiment)
            .slice(0, 5)
            .map(company => ({
                ...company,
                avgSentiment: Math.round(company.totalSentiment / company.articles.length),
                level: company.totalSentiment < -30 ? 'High' : 'Medium'
            }));
        
        console.log('✅ Risks & Opportunities analyzed:', { 
            opportunities: opportunities.length, 
            risks: risks.length 
        });
        
        return { opportunities, risks };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * RENDU DU DASHBOARD
     * ═══════════════════════════════════════════════════════════
     */
    
    renderDashboard() {
        console.log('🎨 Rendering dashboard...');
        
        this.renderTrendingTopics();
        this.renderFearGreedIndex();
        this.renderRisksOpportunities();
        
        console.log('✅ Dashboard rendered successfully!');
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * 1. TRENDING TOPICS
     * ═══════════════════════════════════════════════════════════
     */
    
    renderTrendingTopics() {
        const container = document.getElementById('trendingTopicsGrid');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (this.trendingTopics.length === 0) {
            container.innerHTML = `
                <div style='grid-column: 1 / -1; text-align: center; padding: 60px 20px;'>
                    <i class='fas fa-fire' style='font-size: 3rem; color: var(--text-tertiary); margin-bottom: 16px;'></i>
                    <p style='color: var(--text-tertiary); font-size: 1.1rem;'>No trending topics detected</p>
                </div>
            `;
            return;
        }
        
        this.trendingTopics.forEach((topic, index) => {
            const card = this.createTopicCard(topic, index);
            container.appendChild(card);
        });
    }

    createTopicCard(topic, index) {
        const card = document.createElement('div');
        card.className = 'trending-topic-card';
        
        const trendIcon = topic.trend === 'up' ? 'fa-arrow-up' : topic.trend === 'down' ? 'fa-arrow-down' : 'fa-minus';
        const trendClass = topic.trend === 'up' ? 'up' : topic.trend === 'down' ? 'down' : 'neutral';
        
        card.innerHTML = `
            <div class='topic-header'>
                <div class='topic-name'>
                    <div class='topic-icon'>
                        <i class='fas ${topic.icon}'></i>
                    </div>
                    ${topic.name}
                </div>
                <div class='topic-trend ${trendClass}'>
                    <i class='fas ${trendIcon}'></i>
                </div>
            </div>
            
            <div class='topic-mentions'>
                <span class='mention-count'>${topic.count}</span> mentions
            </div>
            
            <div class='topic-timeline'>
                <canvas id='sparkline-${index}'></canvas>
            </div>
            
            <div class='topic-change-badge ${topic.change > 0 ? 'positive' : topic.change < 0 ? 'negative' : 'neutral'}'>
                <i class='fas ${trendIcon}'></i>
                ${topic.change > 0 ? '+' : ''}${topic.change}% vs last week
            </div>
        `;
        
        setTimeout(() => {
            this.createSparklineChart(index, topic.timeline);
        }, 100);
        
        card.onclick = () => {
            console.log(`🔥 Clicked on topic: ${topic.name}`);
        };
        
        return card;
    }

    createSparklineChart(index, timeline) {
        const canvas = document.getElementById(`sparkline-${index}`);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: timeline.map(d => d.date),
                datasets: [{
                    data: timeline.map(d => d.count),
                    borderColor: 'rgba(102, 126, 234, 1)',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: (context) => `${context.parsed.y} mentions`
                        }
                    }
                },
                scales: {
                    x: { display: false },
                    y: { display: false }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * 2. FEAR & GREED INDEX
     * ═══════════════════════════════════════════════════════════
     */
    
    renderFearGreedIndex() {
        if (!this.fearGreedData) return;
        
        const { index, label, fearCount, greedCount, distribution, timeline } = this.fearGreedData;
        
        document.getElementById('fearValue').textContent = index;
        document.getElementById('fearLabel').textContent = label;
        document.getElementById('fearCountValue').textContent = fearCount;
        document.getElementById('greedCountValue').textContent = greedCount;
        
        this.createFearGreedGauge(index);
        this.createFearGreedTimeline(timeline);
    }

    createFearGreedGauge(index) {
        const canvas = document.getElementById('fearGreedGauge');
        if (!canvas) {
            console.error('❌ Canvas fearGreedGauge not found!');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        
        if (this.charts.fearGauge) {
            this.charts.fearGauge.destroy();
        }
        
        const percentage = ((index + 100) / 200) * 100;
        
        const getGradientColors = (index) => {
            if (index > 50) return ['#10b981', '#059669', '#047857'];
            if (index > 0) return ['#3b82f6', '#2563eb', '#1d4ed8'];
            if (index > -50) return ['#f59e0b', '#ea580c', '#dc2626'];
            return ['#ef4444', '#dc2626', '#b91c1c'];
        };
        
        const colors = getGradientColors(index);
        
        const gradient = ctx.createLinearGradient(0, 0, 400, 400);
        gradient.addColorStop(0, colors[0]);
        gradient.addColorStop(0.5, colors[1]);
        gradient.addColorStop(1, colors[2]);
        
        const isMobile = window.innerWidth < 768;
        
        this.charts.fearGauge = new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [percentage, 100 - percentage],
                    backgroundColor: [
                        gradient,
                        'rgba(200, 200, 200, 0.1)'
                    ],
                    borderWidth: 0,
                    borderRadius: 10,
                    spacing: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: isMobile ? 2.2 : 2,
                cutout: isMobile ? '65%' : '70%',
                rotation: -90,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        enabled: true,
                        callbacks: {
                            label: function(context) {
                                if (context.dataIndex === 0) {
                                    const label = this.fearGreedCalculator ? 
                                        this.fearGreedCalculator.getIndexLabel(index) : 
                                        'Market Sentiment';
                                    return `${label}: ${index}`;
                                }
                                return null;
                            }.bind(this)
                        },
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        padding: 12,
                        borderColor: colors[0],
                        borderWidth: 2,
                        displayColors: false
                    }
                },
                animation: {
                    animateRotate: true,
                    animateScale: true,
                    duration: 1800,
                    easing: 'easeInOutQuart'
                }
            }
        });
        
        const fearValueEl = document.getElementById('fearValue');
        const fearLabelEl = document.getElementById('fearLabel');
        
        if (fearValueEl && fearLabelEl) {
            const gradientStyle = `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`;
            fearValueEl.style.background = gradientStyle;
            fearValueEl.style.webkitBackgroundClip = 'text';
            fearValueEl.style.webkitTextFillColor = 'transparent';
            
            fearLabelEl.style.color = colors[0];
        }
    }

    createFearGreedTimeline(timeline) {
        const canvas = document.getElementById('fearGreedTimeline');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        if (this.charts.fearTimeline) {
            this.charts.fearTimeline.destroy();
        }
        
        this.charts.fearTimeline = new Chart(ctx, {
            type: 'line',
            data: {
                labels: timeline.map(d => d.date),
                datasets: [{
                    label: 'Fear & Greed Index',
                    data: timeline.map(d => d.index),
                    borderColor: 'rgba(102, 126, 234, 1)',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: 'rgba(102, 126, 234, 1)',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: (context) => {
                                const value = context.parsed.y;
                                const label = this.fearGreedCalculator.getIndexLabel(value);
                                return `${label}: ${value}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        min: -100,
                        max: 100,
                        ticks: {
                            callback: (value) => {
                                if (value === 100) return 'Extreme Greed';
                                if (value === 50) return 'Greed';
                                if (value === 0) return 'Neutral';
                                if (value === -50) return 'Fear';
                                if (value === -100) return 'Extreme Fear';
                                return '';
                            },
                            color: 'var(--text-secondary)',
                            font: { weight: '600' }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)',
                            drawBorder: false
                        }
                    },
                    x: {
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45,
                            color: 'var(--text-tertiary)',
                            font: { size: 10 }
                        },
                        grid: { display: false }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * 3. RISQUES & OPPORTUNITÉS
     * ═══════════════════════════════════════════════════════════
     */
    
    renderRisksOpportunities() {
        if (!this.risksOpportunities) return;
        
        this.renderOpportunities(this.risksOpportunities.opportunities);
        this.renderRisks(this.risksOpportunities.risks);
    }

    renderOpportunities(opportunities) {
        const container = document.getElementById('opportunitiesList');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (opportunities.length === 0) {
            container.innerHTML = `
                <div style='text-align: center; padding: 40px 20px; color: var(--text-tertiary);'>
                    <i class='fas fa-search' style='font-size: 2rem; margin-bottom: 12px;'></i>
                    <p>No opportunities detected</p>
                </div>
            `;
            return;
        }
        
        opportunities.forEach(opportunity => {
            const item = document.createElement('div');
            item.className = 'risk-opportunity-item';
            
            item.innerHTML = `
                <div class='item-header'>
                    <div class='item-name'>
                        <i class='fas fa-building'></i>
                        ${opportunity.name} (${opportunity.ticker})
                    </div>
                    <div class='item-badge high-opportunity'>
                        ${opportunity.level} Opportunity
                    </div>
                </div>
                <div class='item-description'>
                    Positive sentiment detected across ${opportunity.articles.length} recent article${opportunity.articles.length > 1 ? 's' : ''} with an average sentiment score of +${opportunity.avgSentiment}.
                </div>
                <div class='item-metrics'>
                    <div class='metric'>
                        <i class='fas fa-newspaper'></i>
                        <strong>${opportunity.articles.length}</strong> mention${opportunity.articles.length > 1 ? 's' : ''}
                    </div>
                    <div class='metric'>
                        <i class='fas fa-arrow-up'></i>
                        <strong>${opportunity.positiveCount}</strong> positive
                    </div>
                    <div class='metric'>
                        <i class='fas fa-smile'></i>
                        Sentiment: <strong>+${opportunity.avgSentiment}</strong>
                    </div>
                </div>
            `;
            
            item.onclick = () => {
                console.log(`💰 Clicked on opportunity: ${opportunity.name}`);
                this.openModal(opportunity);
            };
            
            container.appendChild(item);
        });
    }

    renderRisks(risks) {
        const container = document.getElementById('risksList');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (risks.length === 0) {
            container.innerHTML = `
                <div style='text-align: center; padding: 40px 20px; color: var(--text-tertiary);'>
                    <i class='fas fa-search' style='font-size: 2rem; margin-bottom: 12px;'></i>
                    <p>No risks detected</p>
                </div>
            `;
            return;
        }
        
        risks.forEach(risk => {
            const item = document.createElement('div');
            item.className = 'risk-opportunity-item';
            
            item.innerHTML = `
                <div class='item-header'>
                    <div class='item-name'>
                        <i class='fas fa-building'></i>
                        ${risk.name} (${risk.ticker})
                    </div>
                    <div class='item-badge high-risk'>
                        ${risk.level} Risk
                    </div>
                </div>
                <div class='item-description'>
                    Negative sentiment detected across ${risk.articles.length} recent article${risk.articles.length > 1 ? 's' : ''} with an average sentiment score of ${risk.avgSentiment}.
                </div>
                <div class='item-metrics'>
                    <div class='metric'>
                        <i class='fas fa-newspaper'></i>
                        <strong>${risk.articles.length}</strong> mention${risk.articles.length > 1 ? 's' : ''}
                    </div>
                    <div class='metric'>
                        <i class='fas fa-arrow-down'></i>
                        <strong>${risk.negativeCount}</strong> negative
                    </div>
                    <div class='metric'>
                        <i class='fas fa-frown'></i>
                        Sentiment: <strong>${risk.avgSentiment}</strong>
                    </div>
                </div>
            `;
            
            item.onclick = () => {
                console.log(`⚠ Clicked on risk: ${risk.name}`);
                this.openModal(risk);
            };
            
            container.appendChild(item);
        });
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * UTILITAIRES
     * ═══════════════════════════════════════════════════════════
     */
    
    getTimeAgo(timestamp) {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    }

    showLoadingState() {
        const loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loadingOverlay';
        loadingOverlay.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: var(--card-bg); padding: 40px 60px; border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); z-index: 9999; text-align: center;
            border: 2px solid rgba(102, 126, 234, 0.3);
        `;
        loadingOverlay.innerHTML = `
            <i class='fas fa-spinner fa-spin' style='font-size: 3rem; background: linear-gradient(135deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent;'></i>
            <p style='margin-top: 20px; font-size: 1.1rem; font-weight: 600; color: var(--text-secondary);'>Analyzing trending topics...</p>
        `;
        document.body.appendChild(loadingOverlay);
    }
    
    hideLoadingState() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) overlay.remove();
    }

    async refreshData() {
        console.log('🔄 Refreshing trending data...');
        
        this.showLoadingState();
        
        this.rssClient.clearCache();
        await this.loadData();
        
        this.hideLoadingState();
        
        this.renderDashboard();
        this.showNotification('Trending data refreshed!', 'success');
    }

    showError() {
        this.hideLoadingState();
        
        const container = document.querySelector('.container');
        if (!container) return;
        
        container.innerHTML = `
            <div class='section' style='text-align: center; padding: 100px 20px;'>
                <i class='fas fa-exclamation-triangle' style='font-size: 4rem; background: linear-gradient(135deg, #ef4444, #dc2626); -webkit-background-clip: text; -webkit-text-fill-color: transparent;'></i>
                <p style='margin-top: 24px; font-size: 1.2rem; font-weight: 600; color: var(--text-secondary);'>Error loading trending data</p>
                <p style='margin-top: 12px; color: var(--text-tertiary);'>Please check your connection and try again</p>
                <button class='refresh-btn' onclick='location.reload()' style='margin-top: 24px;'>
                    <i class='fas fa-sync-alt'></i> Reload Page
                </button>
            </div>
        `;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed; top: 20px; right: 20px;
            background: ${type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' : type === 'warning' ? 'linear-gradient(135deg, #f59e0b, #ea580c)' : 'linear-gradient(135deg, #667eea, #764ba2)'};
            color: white; padding: 16px 24px; border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2); z-index: 10000; font-weight: 600;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

let trendingDashboard;
document.addEventListener('DOMContentLoaded', () => {
    trendingDashboard = new TrendingTopicsDashboard();
});