/**
 * ════════════════════════════════════════════════════════════════
 * RSS CLIENT - Version Sans Reuters
 * ════════════════════════════════════════════════════════════════
 */

class RSSClient {
    constructor() {
        this.workerUrl = 'https://rss-api.raphnardone.workers.dev';
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    async getAllArticles() {
        const cacheKey = 'all_articles';
        
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
            
            const sources = [...new Set(data.articles.map(a => a.source))];
            console.log('📊 Sources reçues:', sources);
            console.log('🖼 Articles avec images:', data.articles.filter(a => a.image).length, '/', data.totalArticles);
            
            const cnbcWithImages = data.articles.filter(a => a.source.includes('cnbc') && a.image);
            console.log('🖼 CNBC avec images:', cnbcWithImages.length);
            
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

    async getFeed(feedName) {
        try {
            console.log(`📡 Fetching ${feedName} feed...`);
            const response = await fetch(`${this.workerUrl}/feed/${feedName}`);
            if (!response.ok) { throw new Error(`HTTP ${response.status}`); }
            const articles = await response.json();
            console.log(`✅ Received ${articles.length} articles from ${feedName}`);
            return articles;
        } catch (error) {
            console.error(`❌ Error fetching ${feedName}:`, error);
            throw error;
        }
    }

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

    filterByTicker(articles, ticker) {
        return articles.filter(article => article.tickers.includes(ticker.toUpperCase()));
    }

    filterBySource(articles, sourceName) {
        return articles.filter(article => article.source === sourceName);
    }

    sortByDate(articles) {
        return articles.sort((a, b) => b.timestamp - a.timestamp);
    }

    clearCache() {
        this.cache.clear();
        console.log('🗑 Cache cleared');
    }
}

window.RSSClient = RSSClient;