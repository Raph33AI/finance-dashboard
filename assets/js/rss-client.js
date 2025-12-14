/**
 * ════════════════════════════════════════════════════════════════
 * RSS CLIENT - Version Optimisée (Support MAX articles)
 * ════════════════════════════════════════════════════════════════
 */

class RSSClient {
    constructor() {
        this.workerUrl = 'https://rss-api.raphnardone.workers.dev';
        this.cache = new Map();
        this.cacheTimeout = 10 * 60 * 1000; // ✨ 10 minutes (augmenté de 5 à 10)
    }

    /**
     * ✨ AMÉLIORÉ : Support des options pour récupérer plus d'articles
     */
    async getAllArticles(options = {}) {
        const {
            maxPerSource = 100, // ✨ Par défaut 100 articles par source
            useCache = true
        } = options;

        const cacheKey = `all_articles_${maxPerSource}`;
        
        // Vérifier le cache
        if (useCache && this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                console.log('✅ Using cached data');
                return cached.data;
            }
        }

        try {
            console.log(`📡 Fetching articles from Worker (max ${maxPerSource} per source)...`);
            
            // ✨ NOUVEAU : Envoyer les paramètres en POST
            const response = await fetch(`${this.workerUrl}/all`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    maxPerSource: maxPerSource
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            
            const sources = [...new Set(data.articles.map(a => a.source))];
            console.log('📊 Sources received:', sources);
            console.log(`✅ Total: ${data.totalArticles} articles`);
            console.log('🖼 With images:', data.articles.filter(a => a.image).length);
            
            // Mettre en cache
            this.cache.set(cacheKey, {
                data: data,
                timestamp: Date.now()
            });

            return data;

        } catch (error) {
            console.error('❌ Error fetching articles:', error);
            throw error;
        }
    }

    /**
     * ✨ NOUVEAU : Charger le MAXIMUM absolu d'articles (200 par source)
     */
    async loadMaxArticles() {
        console.log('🔥 RSS CLIENT: Loading MAX articles...');
        console.log('📡 Worker URL:', this.workerUrl);
        
        try {
            const response = await fetch(`${this.workerUrl}/all`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    maxPerSource: 200 // ✨ 200 articles par source
                })
            });
            
            console.log('📡 Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            
            console.log('✅ Data received from worker:', data);
            console.log('📊 Total articles in response:', data.totalArticles);
            console.log('📊 Articles array length:', data.articles.length);
            
            // Ne PAS mettre en cache pour forcer le refresh
            return data;
            
        } catch (error) {
            console.error('❌ RSS CLIENT ERROR:', error);
            throw error;
        }
    }

    /**
     * Récupérer un flux spécifique
     */
    async getFeed(feedName, maxArticles = 100) {
        try {
            console.log(`📡 Fetching ${feedName} feed (max: ${maxArticles})...`);
            const response = await fetch(`${this.workerUrl}/feed/${feedName}?max=${maxArticles}`);
            if (!response.ok) { throw new Error(`HTTP ${response.status}`); }
            const articles = await response.json();
            console.log(`✅ Received ${articles.length} articles from ${feedName}`);
            return articles;
        } catch (error) {
            console.error(`❌ Error fetching ${feedName}:`, error);
            throw error;
        }
    }

    /**
     * Rechercher des articles
     */
    async searchArticles(query) {
        try {
            console.log(`🔍 Searching for "${query}"...`);
            const response = await fetch(`${this.workerUrl}/search?q=${encodeURIComponent(query)}`);
            if (!response.ok) { throw new Error(`HTTP ${response.status}`); }
            const data = await response.json();
            console.log(`✅ Found ${data.totalResults} results`);
            return data;
        } catch (error) {
            console.error('❌ Search error:', error);
            throw error;
        }
    }

    /**
     * Filtres locaux
     */
    filterByTicker(articles, ticker) {
        return articles.filter(article => article.tickers.includes(ticker.toUpperCase()));
    }

    filterBySource(articles, sourceName) {
        return articles.filter(article => article.source === sourceName);
    }

    sortByDate(articles) {
        return articles.sort((a, b) => b.timestamp - a.timestamp);
    }

    /**
     * Vider le cache
     */
    clearCache() {
        this.cache.clear();
        console.log('🗑 Cache cleared');
    }
}

window.RSSClient = RSSClient;