/**
 * ====================================================================
 * ALPHAVAULT AI - ECONOMIC DATA API CLIENT
 * ====================================================================
 * Client JavaScript pour le Cloudflare Worker (FRED ONLY - US DATA)
 * Version: 4.0 - US Exclusive Edition
 * 
 * Worker URL: https://economic-data-worker.raphnardone.workers.dev
 * 
 * Supporte:
 * - 34 endpoints FRED (US)
 * - Cache intelligent
 * - Gestion d'erreurs
 * - Formatage de données pour Chart.js
 */

class EconomicDataClient {
    constructor() {
        this.baseUrl = 'https://economic-data-worker.raphnardone.workers.dev';
        this.cache = new Map();
        this.cacheExpiry = new Map();
        this.defaultCacheTTL = 3600000; // 1 heure
    }

    /**
     * ========================================
     * MÉTHODE GÉNÉRIQUE D'APPEL API
     * ========================================
     */
    async call(endpoint, params = {}, options = {}) {
        const url = new URL(endpoint, this.baseUrl);
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                url.searchParams.append(key, value);
            }
        });

        const cacheKey = url.toString();
        const useCache = options.cache !== false;

        // Vérifier le cache
        if (useCache && this.isCached(cacheKey)) {
            console.log('📦 Cache hit:', endpoint);
            return this.cache.get(cacheKey);
        }

        console.log('🌐 Fetching:', endpoint, params);

        try {
            const response = await fetch(url.toString(), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'API returned error');
            }

            // Stocker en cache
            if (useCache) {
                const ttl = options.cacheTTL || this.defaultCacheTTL;
                this.setCache(cacheKey, data, ttl);
            }

            return data;

        } catch (error) {
            console.error('❌ API Error:', error);
            throw error;
        }
    }

    /**
     * ========================================
     * GESTION DU CACHE
     * ========================================
     */
    isCached(key) {
        if (!this.cache.has(key)) return false;
        const expiry = this.cacheExpiry.get(key);
        if (Date.now() > expiry) {
            this.cache.delete(key);
            this.cacheExpiry.delete(key);
            return false;
        }
        return true;
    }

    setCache(key, value, ttl) {
        this.cache.set(key, value);
        this.cacheExpiry.set(key, Date.now() + ttl);
    }

    clearCache() {
        this.cache.clear();
        this.cacheExpiry.clear();
        console.log('🗑 Cache cleared');
    }

    /**
     * ========================================
     * FRED API METHODS (34 endpoints - US DATA)
     * ========================================
     */

    // SERIES (les plus utilisés)
    
    async getSeries(seriesId, options = {}) {
        const response = await this.call('/series/observations', {
            series_id: seriesId,
            ...options
        });
        return response.data.observations || [];
    }

    async getMultipleSeries(seriesIds, options = {}) {
        const response = await this.call('/multiple', {
            series: Array.isArray(seriesIds) ? seriesIds.join(',') : seriesIds,
            ...options
        });
        return response.series || {};
    }

    async getLatestValues(seriesIds) {
        const response = await this.call('/latest', {
            series: Array.isArray(seriesIds) ? seriesIds.join(',') : seriesIds
        }, { cacheTTL: 300000 }); // 5 min pour données récentes
        return response.series || {};
    }

    async searchSeries(query, options = {}) {
        const response = await this.call('/series/search', {
            search_text: query,
            limit: 20,
            ...options
        });
        return response.data.seriess || [];
    }

    async getSeriesInfo(seriesId) {
        const response = await this.call('/series', {
            series_id: seriesId
        });
        return response.data.seriess?.[0] || null;
    }

    async getSeriesCategories(seriesId) {
        const response = await this.call('/series/categories', {
            series_id: seriesId
        });
        return response.data.categories || [];
    }

    async getSeriesRelease(seriesId) {
        const response = await this.call('/series/release', {
            series_id: seriesId
        });
        return response.data.releases?.[0] || null;
    }

    async getSeriesTags(seriesId) {
        const response = await this.call('/series/tags', {
            series_id: seriesId
        });
        return response.data.tags || [];
    }

    async getSeriesUpdates(options = {}) {
        const response = await this.call('/series/updates', options);
        return response.data.seriess || [];
    }

    async getSeriesVintageDates(seriesId) {
        const response = await this.call('/series/vintagedates', {
            series_id: seriesId
        });
        return response.data.vintage_dates || [];
    }

    // CATEGORIES

    async getCategory(categoryId = 0) {
        const response = await this.call('/category', { category_id: categoryId });
        return response.data.categories?.[0] || null;
    }

    async getCategoryChildren(categoryId = 0) {
        const response = await this.call('/category/children', { category_id: categoryId });
        return response.data.categories || [];
    }

    async getCategorySeries(categoryId, options = {}) {
        const response = await this.call('/category/series', {
            category_id: categoryId,
            limit: 100,
            ...options
        });
        return response.data.seriess || [];
    }

    async getCategoryTags(categoryId) {
        const response = await this.call('/category/tags', { category_id: categoryId });
        return response.data.tags || [];
    }

    // RELEASES

    async getReleases(options = {}) {
        const response = await this.call('/releases', options);
        return response.data.releases || [];
    }

    async getReleasesDates(options = {}) {
        const response = await this.call('/releases/dates', options);
        return response.data.release_dates || [];
    }

    async getRelease(releaseId) {
        const response = await this.call('/release', { release_id: releaseId });
        return response.data.releases?.[0] || null;
    }

    async getReleaseSeries(releaseId, options = {}) {
        const response = await this.call('/release/series', {
            release_id: releaseId,
            ...options
        });
        return response.data.seriess || [];
    }

    async getReleaseDates(releaseId) {
        const response = await this.call('/release/dates', { release_id: releaseId });
        return response.data.release_dates || [];
    }

    // SOURCES

    async getSources() {
        const response = await this.call('/sources');
        return response.data.sources || [];
    }

    async getSource(sourceId) {
        const response = await this.call('/source', { source_id: sourceId });
        return response.data.sources?.[0] || null;
    }

    // TAGS

    async getTags(options = {}) {
        const response = await this.call('/tags', options);
        return response.data.tags || [];
    }

    async getRelatedTags(tagNames, options = {}) {
        const response = await this.call('/related_tags', {
            tag_names: Array.isArray(tagNames) ? tagNames.join(';') : tagNames,
            ...options
        });
        return response.data.tags || [];
    }

    async getTagsSeries(tagNames, options = {}) {
        const response = await this.call('/tags/series', {
            tag_names: Array.isArray(tagNames) ? tagNames.join(';') : tagNames,
            ...options
        });
        return response.data.seriess || [];
    }

    // DASHBOARD US

    async getDashboard() {
        const response = await this.call('/dashboard', {}, { cacheTTL: 300000 });
        return response.series || {};
    }

    /**
     * ========================================
     * MÉTHODES UTILITAIRES
     * ========================================
     */

    /**
     * Formate une date pour les APIs (YYYY-MM-DD)
     */
    formatDate(date) {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    /**
     * Récupère une série FRED avec plage de dates
     */
    async getSeriesDateRange(seriesId, startDate, endDate, options = {}) {
        return await this.getSeries(seriesId, {
            observation_start: this.formatDate(startDate),
            observation_end: this.formatDate(endDate),
            ...options
        });
    }

    /**
     * Récupère les N dernières observations
     */
    async getSeriesRecent(seriesId, limit = 10) {
        return await this.getSeries(seriesId, {
            limit: limit,
            sort_order: 'desc'
        });
    }

    /**
     * Calcule le taux de croissance année sur année
     */
    calculateYoYGrowth(observations) {
        if (!observations || observations.length < 13) return null;

        const latest = parseFloat(observations[observations.length - 1].value);
        const yearAgo = parseFloat(observations[observations.length - 13]?.value);

        if (!yearAgo || yearAgo === 0 || isNaN(latest) || isNaN(yearAgo)) return null;

        return ((latest - yearAgo) / yearAgo) * 100;
    }

    /**
     * Transforme les observations FRED en format Chart.js
     */
    prepareChartData(observations, label = 'Value') {
        const validObs = observations.filter(obs => obs.value !== '.' && !isNaN(parseFloat(obs.value)));
        
        return {
            labels: validObs.map(obs => obs.date),
            datasets: [{
                label: label,
                data: validObs.map(obs => parseFloat(obs.value)),
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                pointRadius: 0,
                pointHoverRadius: 6
            }]
        };
    }

    /**
     * Calcule une statistique simple (moyenne, min, max)
     */
    calculateStats(observations) {
        const values = observations
            .filter(obs => obs.value !== '.' && !isNaN(parseFloat(obs.value)))
            .map(obs => parseFloat(obs.value));

        if (values.length === 0) return null;

        return {
            min: Math.min(...values),
            max: Math.max(...values),
            avg: values.reduce((a, b) => a + b, 0) / values.length,
            latest: values[values.length - 1],
            count: values.length
        };
    }

    /**
     * Teste la connexion au Worker
     */
    async testConnection() {
        try {
            const response = await fetch(`${this.baseUrl}/health`);
            const data = await response.json();
            console.log('✅ Worker Health Check:', data);
            return data;
        } catch (error) {
            console.error('❌ Worker Connection Failed:', error);
            throw error;
        }
    }
}

// ========================================
// SÉRIES FRED PRÉDÉFINIES (US DATA)
// ========================================

const FRED_SERIES = {
    // Macro
    GDP: 'GDP',
    GDPC1: 'GDPC1',
    UNRATE: 'UNRATE',
    CPIAUCSL: 'CPIAUCSL',
    CPILFESL: 'CPILFESL',
    PCE: 'PCE',
    PCEPILFE: 'PCEPILFE',
    
    // Taux d'intérêt
    DFF: 'DFF',
    DFEDTAR: 'DFEDTAR',
    DGS3MO: 'DGS3MO',
    DGS2: 'DGS2',
    DGS5: 'DGS5',
    DGS10: 'DGS10',
    DGS30: 'DGS30',
    T10Y2Y: 'T10Y2Y',
    
    // Hypothèques
    MORTGAGE30US: 'MORTGAGE30US',
    MORTGAGE15US: 'MORTGAGE15US',
    
    // Emploi
    PAYEMS: 'PAYEMS',
    CIVPART: 'CIVPART',
    EMRATIO: 'EMRATIO',
    
    // Production
    INDPRO: 'INDPRO',
    TCU: 'TCU',
    NAPM: 'NAPM',
    
    // Immobilier
    HOUST: 'HOUST',
    CSUSHPISA: 'CSUSHPISA',
    MSPUS: 'MSPUS',
    
    // Consommation
    RSAFS: 'RSAFS',
    UMCSENT: 'UMCSENT',
    
    // Monnaie
    M1SL: 'M1SL',
    M2SL: 'M2SL',
    VIXCLS: 'VIXCLS',
    
    // Forex
    DEXUSEU: 'DEXUSEU',
    DEXCHUS: 'DEXCHUS',
    DEXJPUS: 'DEXJPUS',
    DEXUSUK: 'DEXUSUK',
    
    // Commodities
    DCOILWTICO: 'DCOILWTICO',
    GOLDAMGBD228NLBM: 'GOLDAMGBD228NLBM'
};

// ========================================
// CATÉGORIES FRED
// ========================================

const FRED_CATEGORIES = {
    ROOT: 0,
    MONEY_BANKING: 32991,
    POPULATION_EMPLOYMENT: 10,
    NATIONAL_ACCOUNTS: 32992,
    PRODUCTION: 1,
    PRICES: 32455,
    INTEREST_RATES: 22,
    EXCHANGE_RATES: 95,
};

// ========================================
// INITIALISATION GLOBALE
// ========================================

window.economicDataClient = new EconomicDataClient();
window.FRED = FRED_SERIES;
window.FRED_CATS = FRED_CATEGORIES;

// Test de connexion au chargement
if (typeof console !== 'undefined') {
    console.log('📊 Economic Data Client loaded (FRED - US Only)');
    console.log('🔗 Worker URL:', window.economicDataClient.baseUrl);
    console.log('🇺🇸 FRED Series available:', Object.keys(FRED_SERIES).length);
}

// Export pour modules ES6
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        EconomicDataClient,
        FRED_SERIES,
        FRED_CATEGORIES
    };
}