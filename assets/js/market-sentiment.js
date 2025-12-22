/**
 * ════════════════════════════════════════════════════════════════
 * MARKET SENTIMENT DASHBOARD - Interface Ultra-Stylisée
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
        
        // Attendre que le DOM soit complètement chargé
        if (document.readyState === 'loading') {
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve);
            });
        }
        
        // Afficher un état de chargement
        this.showLoadingState();
        
        await this.loadAndAnalyze();
        
        // Masquer l'état de chargement
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
     * ÉTATS DE CHARGEMENT
     * ═══════════════════════════════════════════════════════════
     */
    
    showLoadingState() {
        // Ajouter une classe de chargement sur chaque section
        const sections = document.querySelectorAll('.section, .global-sentiment-wrapper');
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
            border: 2px solid rgba(102, 126, 234, 0.3);
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
        const sections = document.querySelectorAll('.section, .global-sentiment-wrapper');
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
        
        // Vérifier que tous les éléments existent
        const requiredElements = [
            'globalSentimentValue',
            'globalSentimentLabel',
            'positiveCount',
            'neutralCount',
            'negativeCount',
            'totalAnalyzed',
            'totalAnalyzedHeader',
            'positiveBar',
            'neutralBar',
            'negativeBar',
            'sentimentInsight',
            'insightText',
            'sectorSentimentGrid',
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
        this.renderArticles('all');
        
        console.log('✅ Dashboard rendered successfully!');
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * 1. SCORE GLOBAL + INSIGHT
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
        document.getElementById('totalAnalyzedHeader').textContent = totalAnalyzed;
        
        // Calculer les pourcentages pour les barres
        const total = positiveCount + neutralCount + negativeCount;
        const positivePercent = total > 0 ? (positiveCount / total) * 100 : 0;
        const neutralPercent = total > 0 ? (neutralCount / total) * 100 : 0;
        const negativePercent = total > 0 ? (negativeCount / total) * 100 : 0;
        
        // Animer les barres de progression
        setTimeout(() => {
            document.getElementById('positiveBar').style.width = `${positivePercent}%`;
            document.getElementById('neutralBar').style.width = `${neutralPercent}%`;
            document.getElementById('negativeBar').style.width = `${negativePercent}%`;
        }, 100);
        
        // Créer le gauge chart
        this.createGaugeChart(globalScore);
        
        // Générer l'insight automatique
        this.generateInsight(globalScore, globalSentiment, positiveCount, neutralCount, negativeCount);
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
            if (score > 20) return ['#10b981', '#059669']; // Vert
            if (score < -20) return ['#ef4444', '#dc2626']; // Rouge
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
     * GÉNÉRATION D'INSIGHT AUTOMATIQUE
     * ═══════════════════════════════════════════════════════════
     */
    
    generateInsight(score, sentiment, positive, neutral, negative) {
        let insight = '';
        
        const total = positive + neutral + negative;
        const positivePercent = Math.round((positive / total) * 100);
        const negativePercent = Math.round((negative / total) * 100);
        
        // Insight basé sur le score global
        if (score > 40) {
            insight = `📈 <strong>Strongly Bullish Market</strong>: The market sentiment is overwhelmingly positive (${positivePercent}% of articles). `;
            insight += `Investors are optimistic with ${positive} positive signals detected. This indicates strong market confidence and potential upward momentum.`;
        } else if (score > 20) {
            insight = `📊 <strong>Moderately Bullish Market</strong>: Sentiment leans positive with ${positivePercent}% positive coverage. `;
            insight += `While optimism prevails, ${neutral} neutral articles suggest some caution. Overall trend appears favorable.`;
        } else if (score > -20) {
            insight = `⚖ <strong>Balanced Market Sentiment</strong>: The market shows mixed signals with ${positivePercent}% positive and ${negativePercent}% negative coverage. `;
            insight += `${neutral} neutral articles indicate uncertainty. Investors should monitor closely for directional clarity.`;
        } else if (score > -40) {
            insight = `📉 <strong>Moderately Bearish Market</strong>: Sentiment tilts negative with ${negativePercent}% negative articles. `;
            insight += `${negative} concerning signals detected. Caution is advised as market faces headwinds.`;
        } else {
            insight = `⚠ <strong>Strongly Bearish Market</strong>: Heavy negative sentiment dominates (${negativePercent}% of coverage). `;
            insight += `${negative} negative articles signal significant market concerns. Risk-off positioning recommended.`;
        }
        
        // Ajouter un contexte sur la distribution
        if (neutral > positive && neutral > negative) {
            insight += ` <em>Note: High neutral coverage (${neutral} articles) suggests awaiting catalysts.</em>`;
        }
        
        document.getElementById('insightText').innerHTML = insight;
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
            'finance': 'Finance & Banking',
            'energy': 'Energy & Utilities',
            'healthcare': 'Healthcare & Biotech',
            'consumer': 'Consumer & Retail',
            'other': 'Other Sectors'
        };
        
        const container = document.getElementById('sectorSentimentGrid');
        container.innerHTML = '';
        
        // Trier les secteurs par score (du plus positif au plus négatif)
        const sortedSectors = Object.entries(sectorStats).sort((a, b) => b[1].score - a[1].score);
        
        sortedSectors.forEach(([sector, data]) => {
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
                <div class='sector-label'>
                    ${count} article${count > 1 ? 's' : ''} analyzed • ${this.getSentimentEmoji(sentiment)} ${sentiment.toUpperCase()}
                </div>
            `;
            
            // Ajouter un tooltip au hover
            card.title = this.getSectorInsight(sectorNames[sector], score, sentiment, count);
            
            container.appendChild(card);
        });
    }

    getSectorColors(sentiment) {
        if (sentiment === 'positive') return ['#10b981', '#059669'];
        if (sentiment === 'negative') return ['#ef4444', '#dc2626'];
        return ['#6b7280', '#4b5563'];
    }

    getSentimentEmoji(sentiment) {
        if (sentiment === 'positive') return '📈';
        if (sentiment === 'negative') return '📉';
        return '➡';
    }

    getSectorInsight(sectorName, score, sentiment, count) {
        if (sentiment === 'positive') {
            return `${sectorName} shows positive momentum (+${score}) based on ${count} article(s). Strong outlook.`;
        } else if (sentiment === 'negative') {
            return `${sectorName} faces headwinds (${score}) based on ${count} article(s). Caution advised.`;
        } else {
            return `${sectorName} sentiment is neutral (${score}) based on ${count} article(s). Mixed signals.`;
        }
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * 3. ARTICLES PAR SENTIMENT
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
            container.innerHTML = `
                <div style='grid-column: 1 / -1; text-align: center; padding: 60px 20px;'>
                    <i class='fas fa-inbox' style='font-size: 3rem; color: var(--text-tertiary); margin-bottom: 16px;'></i>
                    <p style='color: var(--text-tertiary); font-size: 1.1rem;'>No ${sentiment !== 'all' ? sentiment : ''} articles found</p>
                </div>
            `;
            return;
        }
        
        // Trier par timestamp (plus récent en premier)
        const sortedArticles = articles.sort((a, b) => b.timestamp - a.timestamp);
        
        // Afficher les 30 premiers
        sortedArticles.slice(0, 30).forEach(article => {
            const card = this.createArticleCard(article);
            container.appendChild(card);
        });
        
        // Afficher un message si plus d'articles disponibles
        if (sortedArticles.length > 30) {
            const moreInfo = document.createElement('div');
            moreInfo.style.cssText = 'grid-column: 1 / -1; text-align: center; padding: 20px; color: var(--text-tertiary); font-weight: 600;';
            moreInfo.innerHTML = `<i class='fas fa-info-circle'></i> Showing 30 of ${sortedArticles.length} articles`;
            container.appendChild(moreInfo);
        }
    }

    createArticleCard(article) {
        const card = document.createElement('div');
        card.className = 'sentiment-article-card';
        
        const colors = this.getSectorColors(article.sentiment);
        card.style.setProperty('--sentiment-color', colors[0]);
        card.style.setProperty('--sentiment-gradient', `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`);
        
        const timeAgo = this.getTimeAgo(article.timestamp);
        
        // Emoji basé sur le sentiment
        const sentimentEmoji = this.getSentimentEmoji(article.sentiment);
        
        card.innerHTML = `
            <div class='article-sentiment-badge' style='background: linear-gradient(135deg, ${colors[0]}, ${colors[1]});'>
                ${sentimentEmoji} ${article.sentiment.toUpperCase()} (${article.sentimentScore > 0 ? '+' : ''}${article.sentimentScore})
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
        
        card.onclick = () => {
            console.log(`📰 Opening article: ${article.title}`);
            window.open(article.link, '_blank');
        };
        
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
                <p style='margin-top: 24px; font-size: 1.2rem; font-weight: 600; color: var(--text-secondary);'>Error loading sentiment data</p>
                <p style='margin-top: 12px; color: var(--text-tertiary);'>Please check your connection and try again</p>
                <button class='dashboard-btn' onclick='location.reload()' style='margin-top: 24px; padding: 14px 32px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 12px; font-weight: 700; cursor: pointer; font-size: 1rem;'>
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
// const style = document.createElement('style');
// style.textContent = `
//     @keyframes slideIn {
//         from { transform: translateX(400px); opacity: 0; }
//         to { transform: translateX(0); opacity: 1; }
//     }
//     @keyframes slideOut {
//         from { transform: translateX(0); opacity: 1; }
//         to { transform: translateX(400px); opacity: 0; }
//     }
// `;
// document.head.appendChild(style);

// Initialiser au chargement
let sentimentDashboard;
document.addEventListener('DOMContentLoaded', () => {
    sentimentDashboard = new MarketSentimentDashboard();
});