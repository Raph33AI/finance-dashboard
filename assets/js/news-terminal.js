/**
 * ════════════════════════════════════════════════════════════════
 * NEWS TERMINAL - OPTIMIZED VERSION (MAX Articles Support)
 * ════════════════════════════════════════════════════════════════
 */

class NewsTerminal {
    constructor() {
        this.rssClient = new RSSClient();
        // ❌ SUPPRIMÉ : this.firestoreManager = new FirestoreRSSManager();
        
        this.allArticles = [];
        this.filteredArticles = [];
        this.displayedArticles = [];
        this.currentView = 'grid';
        this.articlesPerPage = 50; // ✨ Par défaut 50
        this.currentPage = 0;
        
        // ✨ NOUVEAU : Options de chargement
        this.loadingInProgress = false;
        this.autoLoadMore = false;

        this.init();
    }

    async init() {
        console.log('🚀 Initializing News Terminal (Optimized Mode)...');
        
        this.setupEventListeners();
        this.setupInfiniteScroll();
        await this.loadArticles();
    }

    setupEventListeners() {
        // Search avec debounce
        let searchTimeout;
        document.getElementById('searchInput').addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => this.applyFilters(), 300);
        });

        // ✨ Sélecteur de nombre d'articles
        const articleLimitSelect = document.getElementById('articleLimitSelect');
        if (articleLimitSelect) {
            console.log('✅ Article limit select found');
            articleLimitSelect.addEventListener('change', (e) => {
                const value = parseInt(e.target.value);
                this.changeArticleLimit(value);
            });
        } else {
            console.warn('⚠ Article limit select NOT found');
        }

        // ✨ Toggle Auto-Load
        const autoLoadToggle = document.getElementById('autoLoadToggle');
        if (autoLoadToggle) {
            console.log('✅ Auto-load toggle found');
            autoLoadToggle.addEventListener('change', (e) => {
                this.autoLoadMore = e.target.checked;
                console.log(`♾ Auto-load: ${this.autoLoadMore ? 'ON' : 'OFF'}`);
            });
        } else {
            console.warn('⚠ Auto-load toggle NOT found');
        }

        // ✨ Bouton "Load MAX" - CRITIQUE!
        const loadMaxBtn = document.getElementById('loadMaxBtn');
        if (loadMaxBtn) {
            console.log('✅ Load MAX button found!');
            loadMaxBtn.addEventListener('click', () => {
                console.log('🔥 Load MAX button clicked!');
                this.loadMaxArticles();
            });
        } else {
            console.error('❌❌❌ Load MAX button NOT FOUND! Check HTML ID!');
        }
    }

    // ✨ NOUVEAU : Infinite Scroll
    setupInfiniteScroll() {
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            if (!this.autoLoadMore || this.loadingInProgress) return;

            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                const scrollPosition = window.innerHeight + window.scrollY;
                const pageHeight = document.documentElement.scrollHeight;
                
                // Charger plus quand on atteint 80% de la page
                if (scrollPosition >= pageHeight * 0.8) {
                    const hasMore = (this.currentPage + 1) * this.articlesPerPage < this.filteredArticles.length;
                    if (hasMore) {
                        console.log('📜 Auto-loading more articles...');
                        this.loadMore();
                    }
                }
            }, 100);
        });
    }

    changeArticleLimit(limit) {
        console.log(`📊 Changing article limit to: ${limit >= 999999 ? 'ALL' : limit}`);
        this.articlesPerPage = limit >= 999999 ? this.filteredArticles.length : limit;
        this.currentPage = 0;
        this.displayArticles();
    }

    // ✨ AMÉLIORÉ : Chargement standard (100 articles par source)
    async loadArticles() {
        try {
            this.loadingInProgress = true;
            console.log('📡 Loading articles (standard mode)...');
            
            const data = await this.rssClient.getAllArticles({
                maxPerSource: 100 // 100 articles par source
            });
            
            this.allArticles = data.articles;
            
            console.log(`✅ Loaded ${this.allArticles.length} articles`);
            
            this.applyFilters();
            this.updateStats();
            
        } catch (error) {
            console.error('❌ Error loading articles:', error);
            this.showError();
        } finally {
            this.loadingInProgress = false;
        }
    }

    // ✨ NOUVEAU : Charger le MAXIMUM d'articles (200 par source)
    async loadMaxArticles() {
        console.log('🔥🔥🔥 LOAD MAX ARTICLES CLICKED!');
        
        if (this.loadingInProgress) {
            console.warn('⚠ Loading already in progress');
            this.showNotification('Loading already in progress...', 'warning');
            return;
        }

        const confirmation = confirm(
            `🚀 Load MAXIMUM articles?\n\n` +
            `This will fetch up to 200 articles per source (~1000 total).\n\n` +
            `Current: ${this.allArticles.length} articles\n\n` +
            `Continue?`
        );

        if (!confirmation) {
            console.log('❌ User cancelled MAX load');
            return;
        }

        try {
            this.loadingInProgress = true;
            console.log('🚀 Starting MAX articles load...');
            
            // Afficher un loader
            document.getElementById('articlesContainer').innerHTML = `
                <div class='loading-state'>
                    <i class='fas fa-spinner fa-spin' style='font-size: 48px; color: #667eea;'></i>
                    <p style='font-size: 18px; font-weight: 600; margin-top: 20px;'>
                        Loading MAXIMUM articles...
                    </p>
                    <p style='font-size: 14px; color: var(--text-secondary); margin-top: 8px;'>
                        Fetching up to 200 articles per source...
                    </p>
                </div>
            `;
            
            console.log('📡 Calling rssClient.loadMaxArticles()...');
            
            const data = await this.rssClient.loadMaxArticles();
            
            console.log('✅ Data received:', data);
            console.log('📊 Total articles:', data.articles.length);
            
            this.allArticles = data.articles;
            
            console.log(`🎉 LOADED ${this.allArticles.length} ARTICLES!`);
            
            this.applyFilters();
            this.updateStats();
            
            this.showNotification(`Successfully loaded ${this.allArticles.length} articles!`, 'success');
            
        } catch (error) {
            console.error('❌ Error loading max articles:', error);
            console.error('Error details:', error.message);
            console.error('Error stack:', error.stack);
            this.showNotification('Error loading articles. Check console for details.', 'error');
            this.showError();
        } finally {
            this.loadingInProgress = false;
            console.log('🏁 Load MAX completed (success or error)');
        }
    }

    applyFilters() {
        const searchQuery = document.getElementById('searchInput').value.toLowerCase();
        const sourceFilter = document.getElementById('sourceFilter').value;
        const sectorFilter = document.getElementById('sectorFilter').value;
        const regionFilter = document.getElementById('regionFilter').value;
        const sortFilter = document.getElementById('sortFilter').value;

        this.filteredArticles = this.allArticles.filter(article => {
            const matchesSearch = searchQuery === '' || 
                article.title.toLowerCase().includes(searchQuery) ||
                article.description.toLowerCase().includes(searchQuery) ||
                article.tickers.some(t => t.toLowerCase().includes(searchQuery));

            const matchesSource = sourceFilter === 'all' || article.source === sourceFilter;
            const matchesSector = sectorFilter === 'all' || this.detectSector(article) === sectorFilter;
            const matchesRegion = regionFilter === 'all' || this.detectRegion(article) === regionFilter;

            return matchesSearch && matchesSource && matchesSector && matchesRegion;
        });

        this.sortArticles(sortFilter);
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
                this.filteredArticles.sort((a, b) => this.calculateImportance(b) - this.calculateImportance(a));
                break;
        }
    }

    calculateImportance(article) {
        let score = 0;
        
        if (article.source.includes('cnbc-earnings')) score += 10;
        if (article.source.includes('marketwatch-realtime')) score += 8;
        if (article.source.includes('cnbc-tech')) score += 7;
        
        score += article.tickers.length * 5;
        if (article.image) score += 3;
        score += Math.min(article.title.length / 10, 10);
        
        return score;
    }

    detectSector(article) {
        const text = (article.title + ' ' + article.description).toLowerCase();
        
        if (text.match(/\b(tech|software|ai|semiconductor|apple|microsoft|google|nvidia|meta|amazon)\b/i)) return 'tech';
        if (text.match(/\b(bank|finance|fed|interest|wall street|trading|goldman|jpmorgan)\b/i)) return 'finance';
        if (text.match(/\b(oil|energy|gas|renewable|electric|exxon|chevron|shell)\b/i)) return 'energy';
        if (text.match(/\b(healthcare|pharma|drug|vaccine|pfizer|moderna|johnson)\b/i)) return 'healthcare';
        if (text.match(/\b(consumer|retail|walmart|target|costco|starbucks)\b/i)) return 'consumer';
        
        return 'all';
    }

    detectRegion(article) {
        const text = (article.title + ' ' + article.description).toLowerCase();
        
        if (text.match(/\b(us|united states|america|wall street|nyse|nasdaq|federal reserve|fed)\b/i)) return 'us';
        if (text.match(/\b(europe|eu|euro|ecb|germany|france|uk|britain|london)\b/i)) return 'eu';
        if (text.match(/\b(asia|china|japan|korea|india|tokyo|beijing|shanghai)\b/i)) return 'asia';
        
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
            const loadMoreContainer = document.querySelector('.load-more-container');
            if (loadMoreContainer) loadMoreContainer.style.display = 'none';
            return;
        }

        container.innerHTML = this.displayedArticles.map(article => this.renderArticleCard(article)).join('');

        // Show/Hide load more button
        const loadMoreBtn = document.querySelector('.load-more-container');
        if (loadMoreBtn) {
            loadMoreBtn.style.display = endIndex < this.filteredArticles.length ? 'block' : 'none';
        }

        this.updateArticleCounter(endIndex, this.filteredArticles.length);
    }

    updateArticleCounter(displayed, total) {
        const counter = document.getElementById('articleCounter');
        if (counter) {
            counter.textContent = `Showing ${displayed} of ${total} articles`;
        }
    }

    renderArticleCard(article) {
        const timeAgo = this.getTimeAgo(article.timestamp);

        return `
            <div class='article-card' onclick='newsTerminal.openArticle("${article.link}")'>
                ${article.image ? `
                    <img src='${article.image}' alt='${article.title}' class='article-image' onerror='this.style.display="none"'>
                ` : ''}
                
                <div class='article-content'>
                    <div class='article-header'>
                        <div class='article-source'>
                            <i class='fas fa-rss'></i>
                            ${article.sourceName}
                        </div>
                    </div>

                    <div class='article-title'>${article.title}</div>
                    <div class='article-description'>${article.description}</div>

                    ${article.tickers.length > 0 ? `
                        <div class='article-tickers'>
                            ${article.tickers.map(ticker => `
                                <span class='ticker-badge' onclick='event.stopPropagation(); newsTerminal.filterByTicker("${ticker}");'>
                                    ${ticker}
                                </span>
                            `).join('')}
                        </div>
                    ` : ''}

                    <div class='article-footer'>
                        <div class='article-date'>
                            <i class='fas fa-clock'></i>
                            ${timeAgo}
                        </div>
                        <a href='${article.link}' target='_blank' class='article-link' onclick='event.stopPropagation();'>
                            Read more <i class='fas fa-external-link-alt'></i>
                        </a>
                    </div>
                </div>
            </div>
        `;
    }

    // ✅ CORRIGÉ : Suppression de articleId et de firestoreManager
    openArticle(link) {
        // ❌ SUPPRIMÉ : const article = this.allArticles.find(a => a.id === articleId);
        // ❌ SUPPRIMÉ : if (article) { await this.firestoreManager.recordArticleView(article); }
        window.open(link, '_blank');
    }

    // ❌ MÉTHODE COMPLÈTE SUPPRIMÉE : toggleWatchlist()
    // (Était utilisée pour ajouter/retirer des tickers de la watchlist Firebase)

    shareArticle(link) {
        if (navigator.share) {
            navigator.share({
                title: 'Financial News',
                url: link
            }).catch(err => console.log('Share cancelled'));
        } else {
            navigator.clipboard.writeText(link);
            this.showNotification('Link copied to clipboard!', 'success');
        }
    }

    filterByTicker(ticker) {
        document.getElementById('searchInput').value = ticker;
        this.applyFilters();
    }

    changeView(view) {
        this.currentView = view;
        
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
        
        const container = document.getElementById('articlesContainer');
        if (view === 'list') {
            container.classList.add('list-view');
        } else {
            container.classList.remove('list-view');
        }
    }

    updateStats() {
        const total = this.allArticles.length;

        document.getElementById('totalArticles').textContent = total;

        const tickerCount = {};
        this.allArticles.forEach(article => {
            article.tickers.forEach(ticker => {
                tickerCount[ticker] = (tickerCount[ticker] || 0) + 1;
            });
        });
        
        document.getElementById('hotTopicsCount').textContent = Object.keys(tickerCount).length;

        const sources = new Set(this.allArticles.map(a => a.source));
        document.getElementById('sourcesCount').textContent = sources.size;

        const uniqueTickers = new Set(this.allArticles.flatMap(a => a.tickers));
        document.getElementById('tickersCount').textContent = uniqueTickers.size;
    }

    loadMore() {
        this.currentPage++;
        this.displayArticles();
        
        const loadMoreContainer = document.querySelector('.load-more-container');
        if (loadMoreContainer) {
            window.scrollTo({
                top: loadMoreContainer.offsetTop - 100,
                behavior: 'smooth'
            });
        }
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
        
        this.rssClient.clearCache();
        await this.loadArticles();
        this.showNotification('Articles refreshed!', 'success');
    }

    getTimeAgo(timestamp) {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    }

    showNotification(message, type = 'info') {
        const colors = {
            success: 'linear-gradient(135deg, #10b981, #059669)',
            warning: 'linear-gradient(135deg, #f59e0b, #d97706)',
            error: 'linear-gradient(135deg, #ef4444, #dc2626)',
            info: 'linear-gradient(135deg, #667eea, #764ba2)'
        };
        
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type] || colors.info};
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

    showError() {
        document.getElementById('articlesContainer').innerHTML = `
            <div class='loading-state'>
                <i class='fas fa-exclamation-triangle' style='background: linear-gradient(135deg, #ef4444, #dc2626); -webkit-background-clip: text; -webkit-text-fill-color: transparent;'></i>
                <p>Error loading articles. Please try again.</p>
                <button class='dashboard-btn' onclick='newsTerminal.refreshAll()' style='margin-top: 20px;'>
                    <i class='fas fa-sync-alt'></i> Retry
                </button>
            </div>
        `;
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

let newsTerminal;
document.addEventListener('DOMContentLoaded', () => {
    newsTerminal = new NewsTerminal();
});