// ============================================
// FINNHUB API CLIENT v1.0
// Gère toutes les interactions avec l'API FinnHub via Cloudflare Worker
// ============================================

class FinnHubClient {
    constructor(workerUrl) {
        this.workerUrl = workerUrl || 'https://finance-hub-api.your-subdomain.workers.dev';
        this.cache = new Map();
        this.cacheDuration = {
            companyNews: 30 * 60 * 1000,      // 30 minutes
            marketNews: 10 * 60 * 1000,        // 10 minutes
            sentiment: 60 * 60 * 1000,         // 1 heure
            recommendation: 24 * 60 * 60 * 1000, // 24 heures
            earnings: 24 * 60 * 60 * 1000,     // 24 heures
            profile: 24 * 60 * 60 * 1000,      // 24 heures
            peers: 24 * 60 * 60 * 1000,        // 24 heures
            financials: 60 * 60 * 1000,        // 1 heure
        };
    }

    /**
     * Fonction générique pour faire des requêtes à l'API
     */
    async makeRequest(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = `${this.workerUrl}/api/finnhub/${endpoint}${queryString ? '?' + queryString : ''}`;
        
        // Check cache
        const cacheKey = url;
        const cached = this.cache.get(cacheKey);
        
        if (cached && (Date.now() - cached.timestamp < (this.cacheDuration[endpoint] || 600000))) {
            console.log(`✅ FinnHub Cache HIT: ${endpoint}`);
            return cached.data;
        }

        console.log(`📡 FinnHub API Call: ${endpoint}`, params);

        try {
            const response = await fetch(url);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Store in cache
            this.cache.set(cacheKey, {
                data: data,
                timestamp: Date.now()
            });

            return data;

        } catch (error) {
            console.error(`❌ FinnHub API Error (${endpoint}):`, error);
            throw error;
        }
    }

    /**
     * 📰 Récupère les news d'une entreprise
     * @param {string} symbol - Symbole de l'action (ex: "AAPL")
     * @param {string} from - Date de début (format YYYY-MM-DD)
     * @param {string} to - Date de fin (format YYYY-MM-DD)
     */
    async getCompanyNews(symbol, from = null, to = null) {
        if (!from) {
            const date = new Date();
            date.setDate(date.getDate() - 30); // 30 jours avant
            from = date.toISOString().split('T')[0];
        }
        if (!to) {
            to = new Date().toISOString().split('T')[0];
        }

        return await this.makeRequest('company-news', { symbol, from, to });
    }

    /**
     * 📰 Récupère les news du marché général
     * @param {string} category - Catégorie (general, forex, crypto, merger)
     */
    async getMarketNews(category = 'general') {
        return await this.makeRequest('market-news', { category });
    }

    /**
     * 💭 Récupère le sentiment des news pour une action
     * @param {string} symbol - Symbole de l'action
     */
    async getSentiment(symbol) {
        return await this.makeRequest('sentiment', { symbol });
    }

    /**
     * 📊 Récupère les recommandations des analystes
     * @param {string} symbol - Symbole de l'action
     */
    async getRecommendation(symbol) {
        return await this.makeRequest('recommendation', { symbol });
    }

    /**
     * 💰 Récupère les résultats financiers (earnings)
     * @param {string} symbol - Symbole de l'action
     */
    async getEarnings(symbol) {
        return await this.makeRequest('earnings', { symbol });
    }

    /**
     * 📅 Récupère le calendrier des résultats
     * @param {string} from - Date de début
     * @param {string} to - Date de fin
     * @param {string} symbol - (Optionnel) Filtrer par symbole
     */
    async getEarningsCalendar(from = null, to = null, symbol = '') {
        if (!from) {
            from = new Date().toISOString().split('T')[0];
        }
        if (!to) {
            const date = new Date();
            date.setDate(date.getDate() + 30); // 30 jours après
            to = date.toISOString().split('T')[0];
        }

        return await this.makeRequest('earnings-calendar', { from, to, symbol });
    }

    /**
     * 🏢 Récupère le profil d'une entreprise
     * @param {string} symbol - Symbole de l'action
     */
    async getCompanyProfile(symbol) {
        return await this.makeRequest('company-profile', { symbol });
    }

    /**
     * 🔗 Récupère les entreprises similaires (peers)
     * @param {string} symbol - Symbole de l'action
     */
    async getPeers(symbol) {
        return await this.makeRequest('peers', { symbol });
    }

    /**
     * 📊 Récupère les métriques financières de base
     * @param {string} symbol - Symbole de l'action
     * @param {string} metric - Type de métrique (all par défaut)
     */
    async getBasicFinancials(symbol, metric = 'all') {
        return await this.makeRequest('basic-financials', { symbol, metric });
    }

    /**
     * 🔍 Analyse l'impact potentiel des news sur le cours de l'action
     * (Fonction personnalisée qui combine sentiment + news récentes)
     */
    async analyzeNewsImpact(symbol) {
        try {
            const [sentiment, news] = await Promise.all([
                this.getSentiment(symbol),
                this.getCompanyNews(symbol)
            ]);

            // Analyser les 10 dernières news
            const recentNews = Array.isArray(news) ? news.slice(0, 10) : [];
            
            const analysis = {
                symbol: symbol,
                overallSentiment: sentiment,
                recentNews: recentNews.map(item => ({
                    headline: item.headline,
                    datetime: item.datetime,
                    source: item.source,
                    url: item.url,
                    summary: item.summary
                })),
                shortTermImpact: this.calculateImpact(sentiment, 'short'),
                longTermImpact: this.calculateImpact(sentiment, 'long'),
                recommendation: this.getRecommendationFromSentiment(sentiment)
            };

            return analysis;

        } catch (error) {
            console.error('Error analyzing news impact:', error);
            throw error;
        }
    }

    /**
     * Calcule l'impact potentiel basé sur le sentiment
     */
    calculateImpact(sentiment, term = 'short') {
        if (!sentiment || !sentiment.sentiment) {
            return { direction: 'Neutral', confidence: 'Low' };
        }

        const score = sentiment.sentiment;
        const multiplier = term === 'short' ? 1 : 0.7;

        if (score > 0.3 * multiplier) {
            return { direction: 'Positive', confidence: 'High' };
        } else if (score > 0.1 * multiplier) {
            return { direction: 'Positive', confidence: 'Medium' };
        } else if (score < -0.3 * multiplier) {
            return { direction: 'Negative', confidence: 'High' };
        } else if (score < -0.1 * multiplier) {
            return { direction: 'Negative', confidence: 'Medium' };
        } else {
            return { direction: 'Neutral', confidence: 'Medium' };
        }
    }

    /**
     * Génère une recommandation basée sur le sentiment
     */
    getRecommendationFromSentiment(sentiment) {
        if (!sentiment || !sentiment.sentiment) {
            return 'Hold - Insufficient data';
        }

        const score = sentiment.sentiment;

        if (score > 0.4) {
            return 'Strong Buy - Very positive sentiment';
        } else if (score > 0.2) {
            return 'Buy - Positive sentiment';
        } else if (score > -0.2) {
            return 'Hold - Neutral sentiment';
        } else if (score > -0.4) {
            return 'Sell - Negative sentiment';
        } else {
            return 'Strong Sell - Very negative sentiment';
        }
    }

    /**
     * Efface le cache
     */
    clearCache() {
        this.cache.clear();
        console.log('🗑️ FinnHub cache cleared');
    }

    /**
     * Efface le cache pour un endpoint spécifique
     */
    clearCacheFor(endpoint) {
        for (const [key] of this.cache) {
            if (key.includes(endpoint)) {
                this.cache.delete(key);
            }
        }
        console.log(`🗑️ Cache cleared for: ${endpoint}`);
    }
}

// Export pour utilisation globale
window.FinnHubClient = FinnHubClient;