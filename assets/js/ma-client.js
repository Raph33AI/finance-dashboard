/**
 * ====================================================================
 * ALPHAVAULT AI - M&A PREDICTOR - API CLIENT
 * ====================================================================
 * Client pour interagir avec le Worker SEC EDGAR M&A Analyzer
 */

class MAClient {
    constructor() {
        this.baseURL = 'https://sec-edgar-api.raphnardone.workers.dev'; // ⚠ REMPLACE PAR TON URL WORKER
        this.cache = new Map();
        this.cacheDuration = 30 * 60 * 1000; // 30 minutes
    }

    /**
     * Requête générique avec gestion d'erreurs
     */
    async makeRequest(endpoint, params = {}) {
        const cacheKey = `${endpoint}-${JSON.stringify(params)}`;
        
        // Vérifie le cache
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheDuration) {
                console.log(`📦 Cache HIT: ${endpoint}`);
                return cached.data;
            }
        }

        try {
            const queryString = new URLSearchParams(params).toString();
            const url = `${this.baseURL}${endpoint}${queryString ? '?' + queryString : ''}`;
            
            console.log(`🌐 Fetching: ${endpoint}`);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            
            // Mise en cache
            this.cache.set(cacheKey, {
                data: data,
                timestamp: Date.now()
            });

            return data;

        } catch (error) {
            console.error(`❌ API Error (${endpoint}):`, error);
            throw error;
        }
    }

    /**
     * 🚨 Récupère les alertes M&A 8-K
     */
    async getMAAlerts(params = {}) {
        return await this.makeRequest('/api/ma/alerts', params);
    }

    /**
     * 📊 Calcule le M&A Probability Score
     */
    async getMAProbability(ticker, cik = null) {
        return await this.makeRequest('/api/ma/probability', { ticker, cik });
    }

    /**
     * 💼 Récupère la base de données des Deal Comps
     */
    async getDealComps(params = {}) {
        return await this.makeRequest('/api/ma/deal-comps', params);
    }

    /**
     * 🏢 Profils des Serial Acquirers
     */
    async getAcquirerProfiles(sector = null) {
        return await this.makeRequest('/api/ma/acquirers', sector ? { sector } : {});
    }

    /**
     * ⚠ Score de risque d'intégration
     */
    async getIntegrationRisk(accession) {
        return await this.makeRequest('/api/ma/integration-risk', { accession });
    }

    /**
     * 💰 Calculateur de prime de rachat
     */
    async calculateTakeoverPremium(ticker, price, sector) {
        return await this.makeRequest('/api/ma/premium-calculator', { ticker, price, sector });
    }

    /**
     * 📊 Dashboard M&A complet
     */
    async getMADashboard() {
        return await this.makeRequest('/api/ma/dashboard');
    }

    /**
     * 📄 Parse un document 8-K
     */
    async parse8K(accession) {
        return await this.makeRequest('/api/ma/8k/parse', { accession });
    }

    /**
     * 📄 Parse un document S-4 (break-up fees)
     */
    async parseS4(accession) {
        return await this.makeRequest('/api/ma/s4/parse', { accession });
    }

    /**
     * 🔍 Recherche CIK depuis Ticker
     */
    async tickerToCIK(ticker) {
        return await this.makeRequest('/api/sec/ticker-to-cik', { ticker });
    }

    /**
     * 📋 Form 4 Feed (Insider Trading)
     */
    async getForm4Feed(params = {}) {
        return await this.makeRequest('/api/sec/form4/feed', params);
    }

    /**
     * 🧹 Nettoie le cache
     */
    clearCache() {
        this.cache.clear();
        console.log('🧹 Cache cleared');
    }
}

// Instance globale
const maClient = new MAClient();