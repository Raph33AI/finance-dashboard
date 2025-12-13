/**
 * ════════════════════════════════════════════════════════════════
 * RSS CLIENT - Appelle le Worker Cloudflare (Version Améliorée)
 * ════════════════════════════════════════════════════════════════
 */

class RSSClient {
    constructor() {
        // ⚠ REMPLACE PAR TON URL WORKER
        this.workerUrl = 'https://rss-api.raphnardone.workers.dev';
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    // ──────────────────────────────────────────────────────────
    // Récupérer TOUS les articles
    // ──────────────────────────────────────────────────────────
    async getAllArticles() {
        const cacheKey = 'all_articles';
        
        // Vérifier le cache
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                console.log('✅ Using cached data');
                return cached.data;
            }
        }

        try {
            console.log('📡 Fetching all articles from Worker...');
            
            const response = await fetch(`${this.workerUrl}/all`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            
            // Log des sources reçues
            const sources = [...new Set(data.articles.map(a => a.source))];
            console.log('📊 Sources reçues:', sources);
            console.log('🖼 Articles avec images:', data.articles.filter(a => a.image).length);
            
            // Mettre en cache
            this.cache.set(cacheKey, {
                data: data,
                timestamp: Date.now()
            });

            console.log(`✅ Received ${data.totalArticles} articles`);
            return data;

        } catch (error) {
            console.error('❌ Error fetching articles:', error);
            throw error;
        }
    }

    // ──────────────────────────────────────────────────────────
    // Récupérer UN flux spécifique (ex: 'cnbc-top')
    // ──────────────────────────────────────────────────────────
    async getFeed(feedName) {
        try {
            console.log(`📡 Fetching ${feedName} feed...`);
            
            const response = await fetch(`${this.workerUrl}/feed/${feedName}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const articles = await response.json();
            
            console.log(`✅ Received ${articles.length} articles from ${feedName}`);
            return articles;

        } catch (error) {
            console.error(`❌ Error fetching ${feedName}:`, error);
            throw error;
        }
    }

    // ──────────────────────────────────────────────────────────
    // Rechercher des articles (ex: 'AAPL')
    // ──────────────────────────────────────────────────────────
    async searchArticles(query) {
        try {
            console.log(`🔍 Searching for "${query}"...`);
            
            const response = await fetch(`${this.workerUrl}/search?q=${encodeURIComponent(query)}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            
            console.log(`✅ Found ${data.totalResults} results`);
            return data;

        } catch (error) {
            console.error('❌ Search error:', error);
            throw error;
        }
    }

    // ──────────────────────────────────────────────────────────
    // Filtrer par ticker (côté client)
    // ──────────────────────────────────────────────────────────
    filterByTicker(articles, ticker) {
        return articles.filter(article => 
            article.tickers.includes(ticker.toUpperCase())
        );
    }

    // ──────────────────────────────────────────────────────────
    // Filtrer par source (côté client)
    // ──────────────────────────────────────────────────────────
    filterBySource(articles, sourceName) {
        return articles.filter(article => 
            article.source === sourceName
        );
    }

    // ──────────────────────────────────────────────────────────
    // Trier par date (plus récent en premier)
    // ──────────────────────────────────────────────────────────
    sortByDate(articles) {
        return articles.sort((a, b) => b.timestamp - a.timestamp);
    }

    // ──────────────────────────────────────────────────────────
    // Clear cache (utile pour le refresh)
    // ──────────────────────────────────────────────────────────
    clearCache() {
        this.cache.clear();
        console.log('🗑 Cache cleared');
    }
}

// Export global
window.RSSClient = RSSClient;