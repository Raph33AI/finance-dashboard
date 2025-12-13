/**
 * ════════════════════════════════════════════════════════════════
 * TRENDING TOPICS DASHBOARD - Interface Ultra-Stylisée (CORRIGÉE)
 * ════════════════════════════════════════════════════════════════
 */

class TrendingTopicsDashboard {
    constructor() {
        this.rssClient = new RSSClient();
        this.sentimentAnalyzer = new SentimentAnalyzer();
        this.fearGreedCalculator = new FearGreedCalculator();
        
        this.allArticles = [];
        this.trendingTopics = [];
        this.fearGreedData = null;
        this.risksOpportunities = null;
        this.watchlistArticles = [];
        
        this.charts = {};
        this.currentWatchlistFilter = 'all';
        
        this.init();
    }

    async init() {
        console.log('🔥 Initializing Trending Topics Dashboard...');
        
        if (document.readyState === 'loading') {
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve);
            });
        }
        
        this.showLoadingState();
        
        await this.loadData();
        await this.loadWatchlist();
        
        this.hideLoadingState();
        
        this.renderDashboard();
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
            this.allArticles = data.articles;
            
            console.log(`✅ Loaded ${this.allArticles.length} articles`);
            
            // Détecter les tendances
            this.trendingTopics = this.detectTrendingTopics(this.allArticles);
            
            // Calculer Fear & Greed Index
            this.fearGreedData = this.fearGreedCalculator.calculate(this.allArticles);
            
            // Analyser risques & opportunités
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
        
        // Mots clés à tracker
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
        const dailyMentions = {};
        
        // Initialiser les stats
        Object.keys(keywords).forEach(topic => {
            topicStats[topic] = {
                name: topic,
                icon: keywords[topic].icon,
                count: 0,
                articles: [],
                dailyCount: {}
            };
        });
        
        // Parcourir les articles
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
        
        // Convertir en array et trier par nombre de mentions
        const trending = Object.values(topicStats)
            .filter(topic => topic.count > 0)
            .sort((a, b) => b.count - a.count)
            .map(topic => {
                // Calculer la tendance (7 derniers jours vs 7 jours précédents)
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
                
                // Créer les données pour le sparkline
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
     * ANALYSE RISQUES & OPPORTUNITÉS (AMÉLIORÉE)
     * ═══════════════════════════════════════════════════════════
     */
    
    analyzeRisksOpportunities(articles) {
        console.log('⚖ Analyzing risks & opportunities...');
        
        // ✅ CORRECTION: Liste étendue d'entreprises
        const companies = {
            // Tech Giants
            'Apple': 'AAPL',
            'Microsoft': 'MSFT',
            'Google': 'GOOGL',
            'Alphabet': 'GOOGL',
            'Amazon': 'AMZN',
            'Tesla': 'TSLA',
            'NVIDIA': 'NVDA',
            'Nvidia': 'NVDA',
            'Meta': 'META',
            'Facebook': 'META',
            'Netflix': 'NFLX',
            'AMD': 'AMD',
            'Intel': 'INTC',
            
            // Banking
            'JPMorgan': 'JPM',
            'Bank of America': 'BAC',
            'Goldman Sachs': 'GS',
            'Morgan Stanley': 'MS',
            'Wells Fargo': 'WFC',
            'Citigroup': 'C',
            
            // Other
            'Bitcoin': 'BTC',
            'Ethereum': 'ETH',
            'Walmart': 'WMT',
            'Disney': 'DIS',
            'Coca-Cola': 'KO',
            'Pfizer': 'PFE',
            'Johnson': 'JNJ',
            'ExxonMobil': 'XOM',
            'Exxon': 'XOM'
        };
        
        const companyMentions = {};
        
        articles.forEach(article => {
            const titleLower = article.title.toLowerCase();
            const titleUpper = article.title.toUpperCase();
            
            // Détecter les tickers (mots en majuscules de 2-5 lettres)
            const tickerMatches = titleUpper.match(/\b[A-Z]{2,5}\b/g) || [];
            
            // Vérifier chaque entreprise
            Object.entries(companies).forEach(([name, ticker]) => {
                const nameLower = name.toLowerCase();
                const found = titleLower.includes(nameLower) || tickerMatches.includes(ticker);
                
                if (found) {
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
                    
                    // Calculer le sentiment de l'article
                    const sentiment = this.sentimentAnalyzer.analyze(article.title);
                    companyMentions[ticker].totalSentiment += sentiment.score;
                    
                    if (sentiment.sentiment === 'positive') {
                        companyMentions[ticker].positiveCount += 1;
                    } else if (sentiment.sentiment === 'negative') {
                        companyMentions[ticker].negativeCount += 1;
                    } else {
                        companyMentions[ticker].neutralCount += 1;
                    }
                }
            });
        });
        
        console.log('📊 Company mentions detected:', Object.keys(companyMentions).length);
        
        // ✅ CORRECTION: Seuil réduit à 1 article minimum (au lieu de 3)
        const opportunities = Object.values(companyMentions)
            .filter(company => company.articles.length >= 1) // ✅ Au moins 1 article
            .filter(company => company.positiveCount > company.negativeCount) // ✅ Plus de positif que négatif
            .sort((a, b) => b.totalSentiment - a.totalSentiment)
            .slice(0, 5)
            .map(company => ({
                ...company,
                avgSentiment: Math.round(company.totalSentiment / company.articles.length),
                level: company.totalSentiment > 30 ? 'High' : 'Medium' // ✅ Seuil réduit de 50 à 30
            }));
        
        const risks = Object.values(companyMentions)
            .filter(company => company.articles.length >= 1) // ✅ Au moins 1 article
            .filter(company => company.negativeCount > company.positiveCount) // ✅ Plus de négatif que positif
            .sort((a, b) => a.totalSentiment - b.totalSentiment)
            .slice(0, 5)
            .map(company => ({
                ...company,
                avgSentiment: Math.round(company.totalSentiment / company.articles.length),
                level: company.totalSentiment < -30 ? 'High' : 'Medium' // ✅ Seuil réduit de -50 à -30
            }));
        
        console.log('✅ Risks & Opportunities analyzed:', { 
            opportunities: opportunities.length, 
            risks: risks.length 
        });
        
        return { opportunities, risks };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * WATCHLIST (FIREBASE INTEGRATION - CORRIGÉE)
     * ═══════════════════════════════════════════════════════════
     */

    async loadWatchlist() {
        console.log('📌 Loading watchlist from Firebase...');
        
        try {
            // ✅ CORRECTION: Vérifier si Firebase est disponible
            if (typeof firebase === 'undefined') {
                console.log('⚠ Firebase not available');
                this.watchlistArticles = [];
                return;
            }
            
            const currentUser = firebase.auth().currentUser;
            
            if (!currentUser) {
                console.log('⚠ User not logged in');
                this.watchlistArticles = [];
                return;
            }
            
            const userId = currentUser.uid;
            const db = firebase.firestore();
            
            console.log('📥 Fetching watchlist for user:', userId);
            
            // ✅ CORRECTION: Utiliser la structure users/{userId}/history (sous-collection)
            // Cette collection existe déjà dans votre firestore-rss-manager.js
            const snapshot = await db.collection('users')
                .doc(userId)
                .collection('history')
                .limit(50)
                .get();
            
            this.watchlistArticles = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    title: data.title || data.articleTitle,
                    link: data.link || data.articleLink,
                    sourceName: data.sourceName || data.source,
                    timestamp: data.viewedAt ? data.viewedAt.toMillis() : Date.now(),
                    savedAt: data.viewedAt ? data.viewedAt.toMillis() : Date.now()
                };
            });
            
            // Trier localement par timestamp (plus récent en premier)
            this.watchlistArticles.sort((a, b) => b.timestamp - a.timestamp);
            
            console.log(`✅ Loaded ${this.watchlistArticles.length} watchlist items`);
            
        } catch (error) {
            console.error('❌ Error loading watchlist:', error);
            console.error('Error details:', error.message);
            this.watchlistArticles = [];
        }
    }

    async removeFromWatchlist(articleId) {
        try {
            if (typeof firebase === 'undefined' || !firebase.auth().currentUser) {
                alert('You must be logged in to manage watchlist');
                return;
            }
            
            const userId = firebase.auth().currentUser.uid;
            const db = firebase.firestore();
            
            // ✅ CORRECTION: Utiliser la structure users/{userId}/history
            await db.collection('users')
                .doc(userId)
                .collection('history')
                .doc(articleId)
                .delete();
            
            console.log('✅ Article removed from watchlist');
            
            // Recharger la watchlist
            await this.loadWatchlist();
            this.renderWatchlist();
            
            this.showNotification('Article removed from watchlist', 'success');
            
        } catch (error) {
            console.error('❌ Error removing from watchlist:', error);
            this.showNotification('Error removing article', 'error');
        }
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
        this.renderWatchlist();
        
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
        
        // Créer le sparkline chart après insertion dans le DOM
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
        
        // Mettre à jour les valeurs
        document.getElementById('fearValue').textContent = index;
        document.getElementById('fearLabel').textContent = label;
        document.getElementById('fearCountValue').textContent = fearCount;
        document.getElementById('greedCountValue').textContent = greedCount;
        
        // Créer le gauge
        this.createFearGreedGauge(index);
        
        // Créer le graphique temporel
        this.createFearGreedTimeline(timeline);
    }

    createFearGreedGauge(index) {
        const canvas = document.getElementById('fearGreedGauge');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        if (this.charts.fearGauge) {
            this.charts.fearGauge.destroy();
        }
        
        const percentage = ((index + 100) / 200) * 100;
        const colors = this.fearGreedCalculator.getIndexColor(index);
        
        this.charts.fearGauge = new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [percentage, 100 - percentage],
                    backgroundColor: [
                        this.createGradient(ctx, colors),
                        'rgba(200, 200, 200, 0.15)'
                    ],
                    borderWidth: 0,
                    circumference: 180,
                    rotation: 270
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 2, // ✅ AJOUT: Force un ratio 2:1 pour le demi-cercle
                cutout: '70%', // ✅ CORRECTION: Réduit de 75% à 70% (plus d'espace au centre)
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                }
            }
        });
        
        // Mettre à jour la couleur du texte
        const fearValueEl = document.getElementById('fearValue');
        const fearLabelEl = document.getElementById('fearLabel');
        
        const gradient = `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`;
        fearValueEl.style.background = gradient;
        fearValueEl.style.webkitBackgroundClip = 'text';
        fearValueEl.style.webkitTextFillColor = 'transparent';
        
        fearLabelEl.style.color = colors[0];
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

    createGradient(ctx, colors) {
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, colors[0]);
        gradient.addColorStop(1, colors[1]);
        return gradient;
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
            };
            
            container.appendChild(item);
        });
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * 4. WATCHLIST
     * ═══════════════════════════════════════════════════════════
     */
    
    filterWatchlist(filter) {
        this.currentWatchlistFilter = filter;
        
        // Mettre à jour les boutons
        document.querySelectorAll('.watchlist-filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        this.renderWatchlist();
    }

    renderWatchlist() {
        const container = document.getElementById('watchlistGrid');
        if (!container) return;
        
        container.innerHTML = '';
        
        let filteredArticles = this.watchlistArticles;
        
        if (filteredArticles.length === 0) {
            container.innerHTML = `
                <div class='watchlist-empty'>
                    <i class='fas fa-star'></i>
                    <div class='watchlist-empty-title'>Your watchlist is empty</div>
                    <div class='watchlist-empty-text'>Save articles from the News Terminal to track them here</div>
                </div>
            `;
            return;
        }
        
        filteredArticles.forEach(article => {
            const item = this.createWatchlistItem(article);
            container.appendChild(item);
        });
    }

    createWatchlistItem(article) {
        const item = document.createElement('div');
        item.className = 'watchlist-item';
        
        const timeAgo = this.getTimeAgo(article.savedAt || article.timestamp);
        
        item.innerHTML = `
            <div class='watchlist-item-header'>
                <div class='watchlist-item-title'>${article.title}</div>
                <div class='watchlist-item-actions'>
                    <button class='watchlist-action-btn' onclick='window.open("${article.link}", "_blank")' title='Open article'>
                        <i class='fas fa-external-link-alt'></i>
                    </button>
                    <button class='watchlist-action-btn' onclick='trendingDashboard.removeFromWatchlist("${article.id}")' title='Remove'>
                        <i class='fas fa-trash'></i>
                    </button>
                </div>
            </div>
            <div class='watchlist-item-meta'>
                <span class='watchlist-item-source'>
                    <i class='fas fa-rss'></i> ${article.sourceName || 'Unknown'}
                </span>
                <span class='watchlist-item-time'>
                    <i class='fas fa-clock'></i> ${timeAgo}
                </span>
            </div>
        `;
        
        return item;
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
        await this.loadWatchlist();
        
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
            background: ${type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #667eea, #764ba2)'};
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

// Initialiser au chargement
let trendingDashboard;
document.addEventListener('DOMContentLoaded', () => {
    trendingDashboard = new TrendingTopicsDashboard();
});