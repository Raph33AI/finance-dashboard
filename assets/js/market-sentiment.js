/**
 * ════════════════════════════════════════════════════════════════
 * MARKET SENTIMENT DASHBOARD - Interface principale (CORRIGÉ)
 * ════════════════════════════════════════════════════════════════
 */

class MarketSentimentDashboard {
    constructor() {
        this.rssClient = new RSSClient();
        this.sentimentAnalyzer = new SentimentAnalyzer();
        
        this.allArticles = [];
        this.analyzedData = null;
        this.currentFilter = 'all';
        
        this.charts = {};
        
        this.init();
    }

    async init() {
        console.log('🎯 Initializing Market Sentiment Dashboard...');
        
        // ✅ CORRECTION : Attendre que le DOM soit complètement chargé
        if (document.readyState === 'loading') {
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve);
            });
        }
        
        // ✅ Afficher un état de chargement SANS écraser le HTML
        this.showLoadingState();
        
        await this.loadAndAnalyze();
        
        // ✅ Masquer l'état de chargement
        this.hideLoadingState();
        
        this.renderDashboard();
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * CHARGEMENT ET ANALYSE DES DONNÉES
     * ═══════════════════════════════════════════════════════════
     */
    
    async loadAndAnalyze() {
        try {
            console.log('📡 Loading articles from RSS...');
            const data = await this.rssClient.getAllArticles();
            this.allArticles = data.articles;
            
            console.log(`✅ Loaded ${this.allArticles.length} articles`);
            console.log('🧠 Analyzing sentiment...');
            
            // Analyse du sentiment
            this.analyzedData = this.sentimentAnalyzer.analyzeBatch(this.allArticles);
            
            console.log('✅ Sentiment analysis complete:', this.analyzedData);
            
        } catch (error) {
            console.error('❌ Error loading data:', error);
            this.showError();
            throw error;
        }
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * ÉTATS DE CHARGEMENT (SANS ÉCRASER LE HTML)
     * ═══════════════════════════════════════════════════════════
     */
    
    showLoadingState() {
        // Ajouter une classe de chargement sur chaque section
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
            section.style.opacity = '0.5';
            section.style.pointerEvents = 'none';
        });
        
        // Afficher un spinner global
        const loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loadingOverlay';
        loadingOverlay.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--card-bg);
            padding: 40px 60px;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            z-index: 9999;
            text-align: center;
            border: 2px solid var(--glass-border);
        `;
        loadingOverlay.innerHTML = `
            <i class='fas fa-spinner fa-spin' style='font-size: 3rem; background: linear-gradient(135deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent;'></i>
            <p style='margin-top: 20px; font-size: 1.1rem; font-weight: 600; color: var(--text-secondary);'>Analyzing market sentiment...</p>
        `;
        document.body.appendChild(loadingOverlay);
    }
    
    hideLoadingState() {
        // Retirer l'overlay
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.remove();
        }
        
        // Réactiver les sections
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
            section.style.opacity = '1';
            section.style.pointerEvents = 'auto';
        });
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * RENDU DU DASHBOARD COMPLET
     * ═══════════════════════════════════════════════════════════
     */
    
    renderDashboard() {
        console.log('🎨 Rendering dashboard...');
        
        // ✅ Vérifier que tous les éléments existent
        const requiredElements = [
            'globalSentimentValue',
            'globalSentimentLabel',
            'positiveCount',
            'neutralCount',
            'negativeCount',
            'totalAnalyzed',
            'sectorSentimentGrid',
            'topBullishTickers',
            'topBearishTickers',
            'sentimentHeatmap',
            'sentimentTimeline',
            'sentimentArticles'
        ];
        
        const missingElements = requiredElements.filter(id => !document.getElementById(id));
        
        if (missingElements.length > 0) {
            console.error('❌ Missing HTML elements:', missingElements);
            alert(`Erreur: Éléments HTML manquants (${missingElements.join(', ')}). Rechargez la page.`);
            return;
        }
        
        this.renderGlobalSentiment();
        this.renderSectorSentiment();
        this.renderTopTickers();
        this.renderHeatmap();
        this.renderTimeline();
        this.renderArticles('all');
        
        console.log('✅ Dashboard rendered successfully!');
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * 1. SCORE GLOBAL (Gauge Chart)
     * ═══════════════════════════════════════════════════════════
     */
    
    renderGlobalSentiment() {
        const { globalScore, globalSentiment, positiveCount, neutralCount, negativeCount, totalAnalyzed } = this.analyzedData;
        
        // Mettre à jour les valeurs textuelles
        document.getElementById('globalSentimentValue').textContent = globalScore;
        document.getElementById('globalSentimentLabel').textContent = this.getSentimentLabel(globalSentiment);
        
        document.getElementById('positiveCount').textContent = positiveCount;
        document.getElementById('neutralCount').textContent = neutralCount;
        document.getElementById('negativeCount').textContent = negativeCount;
        document.getElementById('totalAnalyzed').textContent = totalAnalyzed;
        
        // Créer le gauge chart
        this.createGaugeChart(globalScore);
    }

    createGaugeChart(score) {
        const canvas = document.getElementById('sentimentGauge');
        if (!canvas) {
            console.error('❌ Canvas sentimentGauge not found!');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        
        // Détruire l'ancien chart si existe
        if (this.charts.gauge) {
            this.charts.gauge.destroy();
        }
        
        // Convertir score (-100 à +100) en pourcentage (0 à 100)
        const percentage = ((score + 100) / 200) * 100;
        
        // Couleur en fonction du score
        const getColor = (score) => {
            if (score > 15) return ['#10b981', '#059669']; // Vert
            if (score < -15) return ['#ef4444', '#dc2626']; // Rouge
            return ['#6b7280', '#4b5563']; // Gris
        };
        
        const colors = getColor(score);
        
        this.charts.gauge = new Chart(ctx, {
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
                cutout: '80%',
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
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

    getSentimentLabel(sentiment) {
        const labels = {
            'positive': 'Bullish',
            'negative': 'Bearish',
            'neutral': 'Neutral'
        };
        return labels[sentiment] || 'Neutral';
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * 2. SENTIMENT PAR SECTEUR
     * ═══════════════════════════════════════════════════════════
     */
    
    renderSectorSentiment() {
        const { sectorStats } = this.analyzedData;
        
        const sectorIcons = {
            'tech': 'fa-microchip',
            'finance': 'fa-chart-line',
            'energy': 'fa-bolt',
            'healthcare': 'fa-heartbeat',
            'consumer': 'fa-shopping-cart',
            'other': 'fa-building'
        };
        
        const sectorNames = {
            'tech': 'Technology',
            'finance': 'Finance',
            'energy': 'Energy',
            'healthcare': 'Healthcare',
            'consumer': 'Consumer',
            'other': 'Other'
        };
        
        const container = document.getElementById('sectorSentimentGrid');
        container.innerHTML = '';
        
        Object.entries(sectorStats).forEach(([sector, data]) => {
            const { score, sentiment, count } = data;
            const colors = this.getSectorColors(sentiment);
            const barWidth = ((score + 100) / 200) * 100;
            
            const card = document.createElement('div');
            card.className = 'sector-card';
            card.style.setProperty('--sector-gradient', `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`);
            card.style.setProperty('--sector-color', colors[0]);
            
            card.innerHTML = `
                <div class='sector-header'>
                    <div class='sector-name'>
                        <div class='sector-icon'>
                            <i class='fas ${sectorIcons[sector]}'></i>
                        </div>
                        ${sectorNames[sector]}
                    </div>
                    <div class='sector-score'>${score > 0 ? '+' : ''}${score}</div>
                </div>
                <div class='sector-bar'>
                    <div class='sector-bar-fill' style='width: ${barWidth}%; background: linear-gradient(90deg, ${colors[0]}, ${colors[1]});'></div>
                </div>
                <div class='sector-label'>${count} articles analyzed</div>
            `;
            
            container.appendChild(card);
        });
    }

    getSectorColors(sentiment) {
        if (sentiment === 'positive') return ['#10b981', '#059669'];
        if (sentiment === 'negative') return ['#ef4444', '#dc2626'];
        return ['#6b7280', '#4b5563'];
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * 3. TOP TICKERS (Bullish & Bearish)
     * ═══════════════════════════════════════════════════════════
     */
    
    renderTopTickers() {
        const { tickerStats } = this.analyzedData;
        
        // Filtrer les tickers avec au moins 2 mentions
        const filteredTickers = Object.entries(tickerStats)
            .filter(([ticker, data]) => data.count >= 2);
        
        // Top 10 bullish
        const bullish = filteredTickers
            .sort((a, b) => b[1].score - a[1].score)
            .slice(0, 10);
        
        // Top 10 bearish
        const bearish = filteredTickers
            .sort((a, b) => a[1].score - b[1].score)
            .slice(0, 10);
        
        this.renderTickerList('topBullishTickers', bullish, 'positive');
        this.renderTickerList('topBearishTickers', bearish, 'negative');
    }

    renderTickerList(containerId, tickers, type) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        
        if (tickers.length === 0) {
            container.innerHTML = '<p style="color: var(--text-tertiary); text-align: center; padding: 20px;">No data available</p>';
            return;
        }
        
        tickers.forEach(([ticker, data], index) => {
            const colors = type === 'positive' 
                ? ['#10b981', '#059669'] 
                : ['#ef4444', '#dc2626'];
            
            const item = document.createElement('div');
            item.className = 'ticker-item';
            item.style.setProperty('--ticker-gradient', `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`);
            item.style.setProperty('--ticker-color', colors[0]);
            
            item.innerHTML = `
                <div class='ticker-info'>
                    <div class='ticker-rank' style='background: linear-gradient(135deg, ${colors[0]}, ${colors[1]});'>
                        ${index + 1}
                    </div>
                    <div class='ticker-symbol'>${ticker}</div>
                </div>
                <div class='ticker-score'>${data.score > 0 ? '+' : ''}${data.score}</div>
            `;
            
            item.onclick = () => this.showTickerDetails(ticker, data);
            
            container.appendChild(item);
        });
    }

    showTickerDetails(ticker, data) {
        // Filtrer les articles contenant ce ticker
        const tickerArticles = this.analyzedData.articles.filter(a => 
            a.tickers.includes(ticker)
        );
        
        const msg = `${ticker}\n\nSentiment Score: ${data.score > 0 ? '+' : ''}${data.score}\nArticles: ${data.count}\n\n${data.count} article(s) found mentioning ${ticker}.`;
        
        alert(msg);
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * 4. HEATMAP (Top 40 tickers)
     * ═══════════════════════════════════════════════════════════
     */
    
    renderHeatmap() {
        const { tickerStats } = this.analyzedData;
        
        // Top 40 tickers les plus mentionnés
        const topTickers = Object.entries(tickerStats)
            .filter(([ticker, data]) => data.count >= 1)
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 40);
        
        const container = document.getElementById('sentimentHeatmap');
        container.innerHTML = '';
        
        if (topTickers.length === 0) {
            container.innerHTML = '<p style="color: var(--text-tertiary); text-align: center; padding: 40px;">No ticker data available</p>';
            return;
        }
        
        topTickers.forEach(([ticker, data]) => {
            const cell = document.createElement('div');
            cell.className = 'heatmap-cell';
            cell.style.background = this.getHeatmapColor(data.score);
            cell.title = `${ticker}: ${data.score > 0 ? '+' : ''}${data.score} (${data.count} articles)`;
            
            cell.innerHTML = `
                <div class='heatmap-symbol'>${ticker}</div>
                <div class='heatmap-value'>${data.score > 0 ? '+' : ''}${data.score}</div>
            `;
            
            cell.onclick = () => this.showTickerDetails(ticker, data);
            
            container.appendChild(cell);
        });
    }

    getHeatmapColor(score) {
        // Couleur en dégradé de rouge à vert
        if (score >= 50) return 'linear-gradient(135deg, #10b981, #059669)';
        if (score >= 25) return 'linear-gradient(135deg, #34d399, #10b981)';
        if (score >= 10) return 'linear-gradient(135deg, #6ee7b7, #34d399)';
        if (score > -10) return 'linear-gradient(135deg, #6b7280, #4b5563)';
        if (score > -25) return 'linear-gradient(135deg, #fca5a5, #f87171)';
        if (score > -50) return 'linear-gradient(135deg, #f87171, #ef4444)';
        return 'linear-gradient(135deg, #ef4444, #dc2626)';
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * 5. TIMELINE (Évolution du sentiment sur 24h)
     * ═══════════════════════════════════════════════════════════
     */
    
    renderTimeline() {
        const articles = this.analyzedData.articles;
        
        // Grouper par tranches horaires (dernières 24h)
        const now = Date.now();
        const last24h = now - (24 * 60 * 60 * 1000);
        
        const recentArticles = articles.filter(a => a.timestamp >= last24h);
        
        // Créer 24 buckets (1 par heure)
        const buckets = Array(24).fill(null).map((_, i) => ({
            hour: i,
            scores: []
        }));
        
        recentArticles.forEach(article => {
            const hourAgo = Math.floor((now - article.timestamp) / (60 * 60 * 1000));
            if (hourAgo < 24) {
                buckets[23 - hourAgo].scores.push(article.sentimentScore);
            }
        });
        
        // Calculer la moyenne par heure
        const labels = [];
        const data = [];
        
        buckets.forEach((bucket, i) => {
            const hourLabel = `${i}h ago`;
            labels.push(hourLabel);
            
            if (bucket.scores.length > 0) {
                const avg = bucket.scores.reduce((a, b) => a + b, 0) / bucket.scores.length;
                data.push(Math.round(avg));
            } else {
                data.push(null);
            }
        });
        
        this.createTimelineChart(labels.reverse(), data.reverse());
    }

    createTimelineChart(labels, data) {
        const canvas = document.getElementById('sentimentTimeline');
        if (!canvas) {
            console.error('❌ Canvas sentimentTimeline not found!');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        
        if (this.charts.timeline) {
            this.charts.timeline.destroy();
        }
        
        this.charts.timeline = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Sentiment Score',
                    data: data,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#3b82f6',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleFont: { size: 14, weight: 'bold' },
                        bodyFont: { size: 13 },
                        callbacks: {
                            label: (context) => {
                                const value = context.parsed.y;
                                if (value === null) return 'No data';
                                return `Sentiment: ${value > 0 ? '+' : ''}${value}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(200, 200, 200, 0.2)',
                            drawBorder: false
                        },
                        ticks: {
                            color: 'var(--text-secondary)',
                            font: { size: 12 }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: 'var(--text-secondary)',
                            font: { size: 11 },
                            maxRotation: 45,
                            minRotation: 45
                        }
                    }
                }
            }
        });
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * 6. ARTICLES PAR SENTIMENT
     * ═══════════════════════════════════════════════════════════
     */
    
    filterArticles(sentiment) {
        this.currentFilter = sentiment;
        
        // Mettre à jour les tabs
        document.querySelectorAll('.sentiment-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.sentiment === sentiment);
        });
        
        this.renderArticles(sentiment);
    }

    renderArticles(sentiment) {
        const articles = sentiment === 'all' 
            ? this.analyzedData.articles 
            : this.analyzedData.articles.filter(a => a.sentiment === sentiment);
        
        // Mettre à jour les compteurs dans les tabs
        document.getElementById('tabAllCount').textContent = this.analyzedData.articles.length;
        document.getElementById('tabPositiveCount').textContent = this.analyzedData.positiveCount;
        document.getElementById('tabNeutralCount').textContent = this.analyzedData.neutralCount;
        document.getElementById('tabNegativeCount').textContent = this.analyzedData.negativeCount;
        
        const container = document.getElementById('sentimentArticles');
        container.innerHTML = '';
        
        if (articles.length === 0) {
            container.innerHTML = '<p style="color: var(--text-tertiary); text-align: center; padding: 40px;">No articles found</p>';
            return;
        }
        
        // Trier par timestamp
        const sortedArticles = articles.sort((a, b) => b.timestamp - a.timestamp);
        
        // Afficher les 20 premiers
        sortedArticles.slice(0, 20).forEach(article => {
            const card = this.createArticleCard(article);
            container.appendChild(card);
        });
    }

    createArticleCard(article) {
        const card = document.createElement('div');
        card.className = 'sentiment-article-card';
        
        const colors = this.getSectorColors(article.sentiment);
        card.style.setProperty('--sentiment-color', colors[0]);
        card.style.setProperty('--sentiment-gradient', `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`);
        
        const timeAgo = this.getTimeAgo(article.timestamp);
        
        card.innerHTML = `
            <div class='article-sentiment-badge' style='background: linear-gradient(135deg, ${colors[0]}, ${colors[1]});'>
                ${article.sentiment.toUpperCase()} (${article.sentimentScore > 0 ? '+' : ''}${article.sentimentScore})
            </div>
            <div class='article-title-small'>${article.title}</div>
            <div class='article-meta'>
                <span class='article-source-small'>
                    <i class='fas fa-rss'></i> ${article.sourceName}
                </span>
                <span class='article-time-small'>
                    <i class='fas fa-clock'></i> ${timeAgo}
                </span>
            </div>
        `;
        
        card.onclick = () => window.open(article.link, '_blank');
        
        return card;
    }

    getTimeAgo(timestamp) {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * UTILITAIRES
     * ═══════════════════════════════════════════════════════════
     */
    
    async refreshData() {
        console.log('🔄 Refreshing sentiment data...');
        
        this.showLoadingState();
        
        this.rssClient.clearCache();
        await this.loadAndAnalyze();
        
        this.hideLoadingState();
        
        this.renderDashboard();
        this.showNotification('Sentiment data refreshed!', 'success');
    }

    showError() {
        this.hideLoadingState();
        
        const container = document.querySelector('.container');
        if (!container) return;
        
        container.innerHTML = `
            <div class='section' style='text-align: center; padding: 100px 20px;'>
                <i class='fas fa-exclamation-triangle' style='font-size: 4rem; background: linear-gradient(135deg, #ef4444, #dc2626); -webkit-background-clip: text; -webkit-text-fill-color: transparent;'></i>
                <p style='margin-top: 24px; font-size: 1.2rem; font-weight: 600; color: var(--text-secondary);'>Error loading data. Please try again.</p>
                <button class='dashboard-btn' onclick='location.reload()' style='margin-top: 24px; padding: 14px 32px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 12px; font-weight: 700; cursor: pointer;'>
                    <i class='fas fa-sync-alt'></i> Reload Page
                </button>
            </div>
        `;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #667eea, #764ba2)'};
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            font-weight: 600;
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

// Animations CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);

// ✅ Initialiser au chargement
let sentimentDashboard;
document.addEventListener('DOMContentLoaded', () => {
    sentimentDashboard = new MarketSentimentDashboard();
});