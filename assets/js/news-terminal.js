/**
 * ════════════════════════════════════════════════════════════════
 * NEWS TERMINAL - MAIN SCRIPT
 * ════════════════════════════════════════════════════════════════
 */

class NewsTerminal {
    constructor() {
        this.rssClient = new RSSClient();
        this.firestoreManager = new FirestoreRSSManager();
        this.sentimentAnalyzer = new SentimentAnalyzer(); // À créer ensuite
        
        this.allArticles = [];
        this.filteredArticles = [];
        this.displayedArticles = [];
        this.currentView = 'grid';
        this.articlesPerPage = 20;
        this.currentPage = 0;

        this.init();
    }

    async init() {
        console.log('🚀 Initializing News Terminal...');
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Load articles
        await this.loadArticles();
    }

    setupEventListeners() {
        // Search avec debounce
        let searchTimeout;
        document.getElementById('searchInput').addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => this.applyFilters(), 300);
        });
    }

    async loadArticles() {
        try {
            const data = await this.rssClient.getAllArticles();
            this.allArticles = data.articles;
            
            // Analyser le sentiment pour chaque article
            await this.analyzeSentiments();
            
            // Appliquer les filtres et afficher
            this.applyFilters();
            this.updateStats();
            
        } catch (error) {
            console.error('❌ Error loading articles:', error);
            this.showError();
        }
    }

    async analyzeSentiments() {
        console.log('🧠 Analyzing sentiments...');
        
        for (const article of this.allArticles) {
            // Vérifier si déjà analysé dans Firestore
            const cached = await this.firestoreManager.getSentimentAnalysis(article.id);
            
            if (cached) {
                article.sentiment = cached.sentiment;
                article.sentimentScore = cached.score;
            } else {
                // Analyser avec Gemini
                const sentiment = await this.sentimentAnalyzer.analyze(article.title, article.description);
                article.sentiment = sentiment.sentiment;
                article.sentimentScore = sentiment.score;
                
                // Sauvegarder dans Firestore
                await this.firestoreManager.saveSentimentAnalysis(article.id, {
                    sentiment: sentiment.sentiment,
                    score: sentiment.score,
                    tickers: article.tickers
                });
            }
        }
    }

    applyFilters() {
        const searchQuery = document.getElementById('searchInput').value.toLowerCase();
        const sourceFilter = document.getElementById('sourceFilter').value;
        const sectorFilter = document.getElementById('sectorFilter').value;
        const regionFilter = document.getElementById('regionFilter').value;
        const sortFilter = document.getElementById('sortFilter').value;

        this.filteredArticles = this.allArticles.filter(article => {
            // Search
            const matchesSearch = searchQuery === '' || 
                article.title.toLowerCase().includes(searchQuery) ||
                article.description.toLowerCase().includes(searchQuery) ||
                article.tickers.some(t => t.toLowerCase().includes(searchQuery));

            // Source
            const matchesSource = sourceFilter === 'all' || article.source === sourceFilter;

            // Sector (à implémenter avec détection de mots-clés)
            const matchesSector = sectorFilter === 'all' || this.detectSector(article) === sectorFilter;

            // Region (à implémenter avec détection de mots-clés)
            const matchesRegion = regionFilter === 'all' || this.detectRegion(article) === regionFilter;

            return matchesSearch && matchesSource && matchesSector && matchesRegion;
        });

        // Tri
        this.sortArticles(sortFilter);

        // Reset pagination
        this.currentPage = 0;
        this.displayArticles();
    }

    sortArticles(sortBy) {
        switch (sortBy) {
            case 'newest':
                this.filteredArticles.sort((a, b) => b.timestamp - a.timestamp);
                break;
            case 'oldest':
                this.filteredArticles.sort((a, b) => a.timestamp - b.timestamp);
                break;
            case 'importance':
                // Score basé sur: source, tickers présents, longueur titre
                this.filteredArticles.sort((a, b) => this.calculateImportance(b) - this.calculateImportance(a));
                break;
            case 'sentiment':
                this.filteredArticles.sort((a, b) => (b.sentimentScore || 0) - (a.sentimentScore || 0));
                break;
        }
    }

    calculateImportance(article) {
        let score = 0;
        
        // Source priority
        if (article.source.includes('reuters')) score += 10;
        if (article.source.includes('cnbc-earnings')) score += 8;
        
        // Tickers detected
        score += article.tickers.length * 5;
        
        // Title length (longer = more detailed)
        score += Math.min(article.title.length / 10, 10);
        
        return score;
    }

    detectSector(article) {
        const text = (article.title + ' ' + article.description).toLowerCase();
        
        if (text.match(/\b(tech|software|ai|semiconductor|apple|microsoft|google|nvidia)\b/i)) return 'tech';
        if (text.match(/\b(bank|finance|fed|interest|wall street|trading)\b/i)) return 'finance';
        if (text.match(/\b(oil|energy|gas|renewable|electric|exxon|chevron)\b/i)) return 'energy';
        if (text.match(/\b(healthcare|pharma|drug|vaccine|pfizer|moderna)\b/i)) return 'healthcare';
        if (text.match(/\b(consumer|retail|amazon|walmart|target)\b/i)) return 'consumer';
        
        return 'all';
    }

    detectRegion(article) {
        const text = (article.title + ' ' + article.description).toLowerCase();
        
        if (text.match(/\b(us|united states|america|wall street|nyse|nasdaq)\b/i)) return 'us';
        if (text.match(/\b(europe|eu|euro|ecb|germany|france|uk)\b/i)) return 'eu';
        if (text.match(/\b(asia|china|japan|korea|india)\b/i)) return 'asia';
        
        return 'all';
    }

    displayArticles() {
        const container = document.getElementById('articlesContainer');
        const startIndex = this.currentPage * this.articlesPerPage;
        const endIndex = startIndex + this.articlesPerPage;
        
        this.displayedArticles = this.filteredArticles.slice(0, endIndex);

        if (this.displayedArticles.length === 0) {
            container.innerHTML = `
                <div class='loading-state'>
                    <i class='fas fa-inbox'></i>
                    <p>No articles found</p>
                </div>
            `;
            document.querySelector('.load-more-container').style.display = 'none';
            return;
        }

        container.innerHTML = this.displayedArticles.map(article => this.renderArticleCard(article)).join('');

        // Show/Hide load more button
        const loadMoreBtn = document.querySelector('.load-more-container');
        loadMoreBtn.style.display = endIndex < this.filteredArticles.length ? 'block' : 'none';
    }

    renderArticleCard(article) {
        const sentimentIcon = {
            'positive': 'fa-smile',
            'neutral': 'fa-meh',
            'negative': 'fa-frown'
        };

        const timeAgo = this.getTimeAgo(article.timestamp);

        return `
            <div class='article-card' onclick='newsTerminal.openArticle("${article.link}")'>
                <div class='article-header'>
                    <div class='article-source'>
                        <i class='fas fa-rss'></i>
                        ${article.sourceName}
                    </div>
                    <div class='article-actions'>
                        <button class='article-action-btn' onclick='event.stopPropagation(); newsTerminal.toggleWatchlist("${article.tickers[0] || ''}", "${article.title}")' title='Add to watchlist'>
                            <i class='fas fa-star'></i>
                        </button>
                        <button class='article-action-btn' onclick='event.stopPropagation(); newsTerminal.shareArticle("${article.link}")' title='Share'>
                            <i class='fas fa-share-alt'></i>
                        </button>
                    </div>
                </div>

                <div class='article-title'>${article.title}</div>
                <div class='article-description'>${article.description}</div>

                ${article.tickers.length > 0 ? `
                    <div class='article-tickers'>
                        ${article.tickers.map(ticker => `
                            <span class='ticker-badge' onclick='event.stopPropagation(); newsTerminal.filterByTicker("${ticker}")'>
                                ${ticker}
                            </span>
                        `).join('')}
                    </div>
                ` : ''}

                ${article.sentiment ? `
                    <div class='article-sentiment ${article.sentiment}'>
                        <i class='fas ${sentimentIcon[article.sentiment]}'></i>
                        ${article.sentiment.charAt(0).toUpperCase() + article.sentiment.slice(1)}
                        ${article.sentimentScore ? `(${(article.sentimentScore * 100).toFixed(0)}%)` : ''}
                    </div>
                ` : ''}

                <div class='article-footer'>
                    <div class='article-date'>
                        <i class='fas fa-clock'></i>
                        ${timeAgo}
                    </div>
                    <a href='${article.link}' target='_blank' class='article-link' onclick='event.stopPropagation(); newsTerminal.recordView(this.article)'>
                        Read more <i class='fas fa-external-link-alt'></i>
                    </a>
                </div>
            </div>
        `;
    }

    async openArticle(link) {
        // Enregistrer dans l'historique
        const article = this.allArticles.find(a => a.link === link);
        if (article) {
            await this.firestoreManager.recordArticleView(article);
        }
        
        window.open(link, '_blank');
    }

    async toggleWatchlist(ticker, companyName) {
        if (!ticker) return;
        
        const isInWatchlist = await this.firestoreManager.isInWatchlist(ticker);
        
        if (isInWatchlist) {
            await this.firestoreManager.removeFromWatchlist(ticker);
            this.showNotification(`${ticker} removed from watchlist`, 'success');
        } else {
            await this.firestoreManager.addToWatchlist(ticker, companyName);
            this.showNotification(`${ticker} added to watchlist`, 'success');
        }
    }

    filterByTicker(ticker) {
        document.getElementById('searchInput').value = ticker;
        this.applyFilters();
    }

    changeView(view) {
        this.currentView = view;
        
        // Update buttons
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
        
        // Update container class
        const container = document.getElementById('articlesContainer');
        if (view === 'list') {
            container.classList.add('list-view');
        } else {
            container.classList.remove('list-view');
        }
    }

    updateStats() {
        const total = this.allArticles.length;
        const positive = this.allArticles.filter(a => a.sentiment === 'positive').length;
        const neutral = this.allArticles.filter(a => a.sentiment === 'neutral').length;
        const negative = this.allArticles.filter(a => a.sentiment === 'negative').length;

        document.getElementById('totalArticles').textContent = total;
        document.getElementById('positiveCount').textContent = positive;
        document.getElementById('neutralCount').textContent = neutral;
        document.getElementById('negativeCount').textContent = negative;

        document.getElementById('positivePercent').textContent = `${((positive / total) * 100).toFixed(1)}%`;
        document.getElementById('neutralPercent').textContent = `${((neutral / total) * 100).toFixed(1)}%`;
        document.getElementById('negativePercent').textContent = `${((negative / total) * 100).toFixed(1)}%`;

        // Hot topics (tickers les plus mentionnés)
        const tickerCount = {};
        this.allArticles.forEach(article => {
            article.tickers.forEach(ticker => {
                tickerCount[ticker] = (tickerCount[ticker] || 0) + 1;
            });
        });
        
        document.getElementById('hotTopicsCount').textContent = Object.keys(tickerCount).length;
    }

    loadMore() {
        this.currentPage++;
        this.displayArticles();
    }

    async refreshAll() {
        this.allArticles = [];
        this.filteredArticles = [];
        this.displayedArticles = [];
        
        document.getElementById('articlesContainer').innerHTML = `
            <div class='loading-state'>
                <i class='fas fa-spinner fa-spin'></i>
                <p>Refreshing articles...</p>
            </div>
        `;
        
        await this.loadArticles();
    }

    exportToCSV() {
        // Créer le CSV
        const headers = ['Title', 'Source', 'Date', 'Tickers', 'Sentiment', 'Link'];
        const rows = this.filteredArticles.map(article => [
            `"${article.title.replace(/"/g, '""')}"`,
            article.sourceName,
            new Date(article.timestamp).toISOString(),
            article.tickers.join(';'),
            article.sentiment || 'N/A',
            article.link
        ]);

        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        
        // Télécharger
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `news-terminal-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    getTimeAgo(timestamp) {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    }

    showNotification(message, type = 'info') {
        // Utiliser ton système de notifications existant
        console.log(`${type.toUpperCase()}: ${message}`);
    }

    showError() {
        document.getElementById('articlesContainer').innerHTML = `
            <div class='loading-state'>
                <i class='fas fa-exclamation-triangle' style='color: var(--forex-danger);'></i>
                <p>Error loading articles. Please try again.</p>
            </div>
        `;
    }
}

// Initialiser au chargement
let newsTerminal;
document.addEventListener('DOMContentLoaded', () => {
    newsTerminal = new NewsTerminal();
});