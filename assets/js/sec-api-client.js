/**
 * ═══════════════════════════════════════════════════════════════════
 * 🏛 SEC API CLIENT - AlphaVault AI
 * ═══════════════════════════════════════════════════════════════════
 * Interface avec le Cloudflare Worker pour les données SEC EDGAR
 * ═══════════════════════════════════════════════════════════════════
 */

class SECApiClient {
    constructor() {
        // ⚠ REMPLACER PAR L'URL DE TON CLOUDFLARE WORKER
        this.baseURL = 'https://sec-edgar-api.raphnardone.workers.dev';
        this.cache = new Map();
        this.cacheDuration = 1800000; // 30 minutes
    }

    /**
     * 📊 Récupère tous les IPOs (S-1, F-1, amendments)
     */
    async getIPOs(options = {}) {
        const {
            limit = 100,
            includeAmendments = true,
            forceRefresh = false
        } = options;

        const cacheKey = `ipos-${limit}-${includeAmendments}`;

        if (!forceRefresh && this.isCacheValid(cacheKey)) {
            console.log('📦 Returning cached IPOs');
            return this.cache.get(cacheKey).data;
        }

        try {
            console.log('🌐 Fetching IPOs from SEC...');
            const params = new URLSearchParams({
                limit,
                amendments: includeAmendments
            });

            const response = await fetch(`${this.baseURL}/api/sec/ipos?${params}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            // Cache the result
            this.cache.set(cacheKey, {
                data,
                timestamp: Date.now()
            });

            console.log(`✅ Fetched ${data.count} IPOs`);
            return data;

        } catch (error) {
            console.error('❌ Error fetching IPOs:', error);
            throw error;
        }
    }

    /**
     * 📄 Récupère un feed spécifique (s1, f1, 10k, 8k, etc.)
     */
    async getFeed(feedType, limit = 100, forceRefresh = false) {
        const cacheKey = `feed-${feedType}-${limit}`;

        if (!forceRefresh && this.isCacheValid(cacheKey)) {
            console.log(`📦 Returning cached feed: ${feedType}`);
            return this.cache.get(cacheKey).data;
        }

        try {
            console.log(`🌐 Fetching feed: ${feedType}`);
            const params = new URLSearchParams({ limit });
            const response = await fetch(`${this.baseURL}/api/sec/feed/${feedType}?${params}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            this.cache.set(cacheKey, {
                data,
                timestamp: Date.now()
            });

            console.log(`✅ Fetched ${data.count} filings for ${feedType}`);
            return data;

        } catch (error) {
            console.error(`❌ Error fetching feed ${feedType}:`, error);
            throw error;
        }
    }

    /**
     * 📂 Récupère tous les filings par catégorie
     */
    async getByCategory(category, limit = 100, forceRefresh = false) {
        const cacheKey = `category-${category}-${limit}`;

        if (!forceRefresh && this.isCacheValid(cacheKey)) {
            console.log(`📦 Returning cached category: ${category}`);
            return this.cache.get(cacheKey).data;
        }

        try {
            console.log(`🌐 Fetching category: ${category}`);
            const params = new URLSearchParams({ limit });
            const response = await fetch(`${this.baseURL}/api/sec/category/${encodeURIComponent(category)}?${params}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            this.cache.set(cacheKey, {
                data,
                timestamp: Date.now()
            });

            console.log(`✅ Fetched ${data.count} filings for category ${category}`);
            return data;

        } catch (error) {
            console.error(`❌ Error fetching category ${category}:`, error);
            throw error;
        }
    }

    /**
     * 🔄 Déclenche une synchronisation manuelle
     */
    async triggerSync() {
        try {
            console.log('🔄 Triggering manual sync...');
            const response = await fetch(`${this.baseURL}/api/sec/sync`);
            const data = await response.json();
            console.log('✅ Sync initiated:', data);
            return data;
        } catch (error) {
            console.error('❌ Sync error:', error);
            throw error;
        }
    }

    /**
     * 🏥 Health check du service
     */
    async healthCheck() {
        try {
            const response = await fetch(`${this.baseURL}/health`);
            return await response.json();
        } catch (error) {
            console.error('❌ Health check failed:', error);
            return { status: 'error', error: error.message };
        }
    }

    /**
     * 🧹 Nettoie le cache
     */
    clearCache() {
        this.cache.clear();
        console.log('🧹 Cache cleared');
    }

    /**
     * ⏰ Vérifie si une entrée de cache est valide
     */
    isCacheValid(key) {
        if (!this.cache.has(key)) return false;
        
        const cached = this.cache.get(key);
        const age = Date.now() - cached.timestamp;
        
        if (age > this.cacheDuration) {
            this.cache.delete(key);
            return false;
        }
        
        return true;
    }

    /**
     * 📈 Analyse un IPO spécifique (données enrichies)
     */
    async analyzeIPO(ipo) {
        // Enrichissement avec données supplémentaires
        const enriched = {
            ...ipo,
            // Calcul du score de réussite (algorithme simplifié)
            successScore: this.calculateSuccessScore(ipo),
            // Classification sectorielle
            sector: this.classifySector(ipo.companyName),
            // Détection de red flags
            riskFactors: this.detectRiskFactors(ipo),
            // Estimation de la période de lock-up (typiquement 180 jours)
            lockUpExpiry: this.estimateLockUpExpiry(ipo.filedDate),
            // Statut du filing
            filingStage: this.determineFilingStage(ipo.formType)
        };

        return enriched;
    }

    /**
     * 🎯 Calcule un score de réussite (0-100)
     */
    calculateSuccessScore(ipo) {
        let score = 50; // Base score

        // Facteur 1: Type de formulaire (S-1 original > amendments)
        if (ipo.formType === 'S-1' || ipo.formType === 'F-1') {
            score += 10;
        }

        // Facteur 2: Récence du filing (plus récent = mieux)
        const daysSinceFiling = (Date.now() - new Date(ipo.filedDate)) / (1000 * 60 * 60 * 24);
        if (daysSinceFiling < 30) score += 15;
        else if (daysSinceFiling < 90) score += 10;
        else if (daysSinceFiling < 180) score += 5;

        // Facteur 3: Présence de mots-clés positifs
        const positiveKeywords = ['technology', 'AI', 'cloud', 'software', 'biotech', 'fintech'];
        const companyLower = ipo.companyName.toLowerCase();
        if (positiveKeywords.some(kw => companyLower.includes(kw))) {
            score += 15;
        }

        // Facteur 4: Longueur du summary (plus détaillé = mieux préparé)
        if (ipo.summary && ipo.summary.length > 200) {
            score += 10;
        }

        return Math.min(100, Math.max(0, score));
    }

    /**
     * 🏢 Classification sectorielle basique
     */
    classifySector(companyName) {
        const name = companyName.toLowerCase();
        
        if (name.match(/tech|software|ai|cloud|data|cyber/)) return 'Technology';
        if (name.match(/bio|pharma|health|medical|therapeutics/)) return 'Healthcare';
        if (name.match(/finance|capital|bank|insurance|credit/)) return 'Financial Services';
        if (name.match(/energy|oil|gas|solar|renewable/)) return 'Energy';
        if (name.match(/retail|consumer|ecommerce/)) return 'Consumer';
        if (name.match(/real estate|reit|property/)) return 'Real Estate';
        if (name.match(/industrial|manufacturing|materials/)) return 'Industrials';
        
        return 'Other';
    }

    /**
     * ⚠ Détection de facteurs de risque
     */
    detectRiskFactors(ipo) {
        const risks = [];
        
        if (ipo.formType.includes('/A')) {
            risks.push('Multiple amendments filed');
        }
        
        const daysSinceFiling = (Date.now() - new Date(ipo.filedDate)) / (1000 * 60 * 60 * 24);
        if (daysSinceFiling > 180) {
            risks.push('Filing older than 6 months');
        }
        
        return risks;
    }

    /**
     * 🔒 Estime la date d'expiration du lock-up
     */
    estimateLockUpExpiry(filedDate) {
        const filed = new Date(filedDate);
        // Typiquement 180 jours après l'IPO (on estime +30 jours pour l'IPO effective)
        const lockUpDays = 210;
        const expiry = new Date(filed);
        expiry.setDate(expiry.getDate() + lockUpDays);
        return expiry.toISOString();
    }

    /**
     * 📋 Détermine le stade du filing
     */
    determineFilingStage(formType) {
        if (formType === 'S-1' || formType === 'F-1') return 'Initial Filing';
        if (formType.includes('/A')) return 'Amendment';
        if (formType === '424B4') return 'Final Prospectus';
        return 'Unknown';
    }
}

// Export global
window.SECApiClient = SECApiClient;