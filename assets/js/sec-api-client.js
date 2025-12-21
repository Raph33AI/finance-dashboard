// /**
//  * ═══════════════════════════════════════════════════════════════════
//  * 🏛 SEC API CLIENT - AlphaVault AI
//  * ═══════════════════════════════════════════════════════════════════
//  * Interface avec le Cloudflare Worker pour les données SEC EDGAR
//  * ═══════════════════════════════════════════════════════════════════
//  */

// class SECApiClient {
//     constructor() {
//         // ⚠ REMPLACER PAR L'URL DE TON CLOUDFLARE WORKER
//         this.baseURL = 'https://sec-edgar-api.raphnardone.workers.dev';
//         this.cache = new Map();
//         this.cacheDuration = 1800000; // 30 minutes
//     }

//     /**
//      * 📊 Récupère tous les IPOs (S-1, F-1, amendments)
//      */
//     async getIPOs(options = {}) {
//         const {
//             limit = 5000,
//             includeAmendments = true,
//             forceRefresh = false
//         } = options;

//         const cacheKey = `ipos-${limit}-${includeAmendments}`;

//         if (!forceRefresh && this.isCacheValid(cacheKey)) {
//             console.log('📦 Returning cached IPOs');
//             return this.cache.get(cacheKey).data;
//         }

//         try {
//             console.log('🌐 Fetching IPOs from SEC...');
//             const params = new URLSearchParams({
//                 limit,
//                 amendments: includeAmendments
//             });

//             const response = await fetch(`${this.baseURL}/api/sec/ipos?${params}`);
            
//             if (!response.ok) {
//                 throw new Error(`HTTP ${response.status}: ${response.statusText}`);
//             }

//             const data = await response.json();
            
//             // Cache the result
//             this.cache.set(cacheKey, {
//                 data,
//                 timestamp: Date.now()
//             });

//             console.log(`✅ Fetched ${data.count} IPOs`);
//             return data;

//         } catch (error) {
//             console.error('❌ Error fetching IPOs:', error);
//             throw error;
//         }
//     }

//     /**
//      * 📄 Récupère un feed spécifique (s1, f1, 10k, 8k, etc.)
//      */
//     async getFeed(feedType, limit = 100, forceRefresh = false) {
//         const cacheKey = `feed-${feedType}-${limit}`;

//         if (!forceRefresh && this.isCacheValid(cacheKey)) {
//             console.log(`📦 Returning cached feed: ${feedType}`);
//             return this.cache.get(cacheKey).data;
//         }

//         try {
//             console.log(`🌐 Fetching feed: ${feedType}`);
//             const params = new URLSearchParams({ limit });
//             const response = await fetch(`${this.baseURL}/api/sec/feed/${feedType}?${params}`);
            
//             if (!response.ok) {
//                 throw new Error(`HTTP ${response.status}: ${response.statusText}`);
//             }

//             const data = await response.json();
            
//             this.cache.set(cacheKey, {
//                 data,
//                 timestamp: Date.now()
//             });

//             console.log(`✅ Fetched ${data.count} filings for ${feedType}`);
//             return data;

//         } catch (error) {
//             console.error(`❌ Error fetching feed ${feedType}:`, error);
//             throw error;
//         }
//     }

//     /**
//      * 📂 Récupère tous les filings par catégorie
//      */
//     async getByCategory(category, limit = 100, forceRefresh = false) {
//         const cacheKey = `category-${category}-${limit}`;

//         if (!forceRefresh && this.isCacheValid(cacheKey)) {
//             console.log(`📦 Returning cached category: ${category}`);
//             return this.cache.get(cacheKey).data;
//         }

//         try {
//             console.log(`🌐 Fetching category: ${category}`);
//             const params = new URLSearchParams({ limit });
//             const response = await fetch(`${this.baseURL}/api/sec/category/${encodeURIComponent(category)}?${params}`);
            
//             if (!response.ok) {
//                 throw new Error(`HTTP ${response.status}: ${response.statusText}`);
//             }

//             const data = await response.json();
            
//             this.cache.set(cacheKey, {
//                 data,
//                 timestamp: Date.now()
//             });

//             console.log(`✅ Fetched ${data.count} filings for category ${category}`);
//             return data;

//         } catch (error) {
//             console.error(`❌ Error fetching category ${category}:`, error);
//             throw error;
//         }
//     }

//     /**
//      * 🔄 Déclenche une synchronisation manuelle
//      */
//     async triggerSync() {
//         try {
//             console.log('🔄 Triggering manual sync...');
//             const response = await fetch(`${this.baseURL}/api/sec/sync`);
//             const data = await response.json();
//             console.log('✅ Sync initiated:', data);
//             return data;
//         } catch (error) {
//             console.error('❌ Sync error:', error);
//             throw error;
//         }
//     }

//     /**
//      * 🏥 Health check du service
//      */
//     async healthCheck() {
//         try {
//             const response = await fetch(`${this.baseURL}/health`);
//             return await response.json();
//         } catch (error) {
//             console.error('❌ Health check failed:', error);
//             return { status: 'error', error: error.message };
//         }
//     }

//     /**
//      * 🧹 Nettoie le cache
//      */
//     clearCache() {
//         this.cache.clear();
//         console.log('🧹 Cache cleared');
//     }

//     /**
//      * ⏰ Vérifie si une entrée de cache est valide
//      */
//     isCacheValid(key) {
//         if (!this.cache.has(key)) return false;
        
//         const cached = this.cache.get(key);
//         const age = Date.now() - cached.timestamp;
        
//         if (age > this.cacheDuration) {
//             this.cache.delete(key);
//             return false;
//         }
        
//         return true;
//     }

//     /**
//      * 📈 Analyse un IPO spécifique (données enrichies)
//      */
//     async analyzeIPO(ipo) {
//         // Enrichissement avec données supplémentaires
//         const enriched = {
//             ...ipo,
//             // Calcul du score de réussite (algorithme simplifié)
//             successScore: this.calculateSuccessScore(ipo),
//             // Classification sectorielle
//             sector: this.classifySector(ipo.companyName),
//             // Détection de red flags
//             riskFactors: this.detectRiskFactors(ipo),
//             // Estimation de la période de lock-up (typiquement 180 jours)
//             lockUpExpiry: this.estimateLockUpExpiry(ipo.filedDate),
//             // Statut du filing
//             filingStage: this.determineFilingStage(ipo.formType)
//         };

//         return enriched;
//     }

//     /**
//      * 🎯 Calcule un score de réussite (0-100)
//      */
//     calculateSuccessScore(ipo) {
//         let score = 50; // Base score

//         // Facteur 1: Type de formulaire (S-1 original > amendments)
//         if (ipo.formType === 'S-1' || ipo.formType === 'F-1') {
//             score += 10;
//         }

//         // Facteur 2: Récence du filing (plus récent = mieux)
//         const daysSinceFiling = (Date.now() - new Date(ipo.filedDate)) / (1000 * 60 * 60 * 24);
//         if (daysSinceFiling < 30) score += 15;
//         else if (daysSinceFiling < 90) score += 10;
//         else if (daysSinceFiling < 180) score += 5;

//         // Facteur 3: Présence de mots-clés positifs
//         const positiveKeywords = ['technology', 'AI', 'cloud', 'software', 'biotech', 'fintech'];
//         const companyLower = ipo.companyName.toLowerCase();
//         if (positiveKeywords.some(kw => companyLower.includes(kw))) {
//             score += 15;
//         }

//         // Facteur 4: Longueur du summary (plus détaillé = mieux préparé)
//         if (ipo.summary && ipo.summary.length > 200) {
//             score += 10;
//         }

//         return Math.min(100, Math.max(0, score));
//     }

//     /**
//      * 🏢 Classification sectorielle basique
//      */
//     classifySector(companyName) {
//         const name = companyName.toLowerCase();
        
//         if (name.match(/tech|software|ai|cloud|data|cyber/)) return 'Technology';
//         if (name.match(/bio|pharma|health|medical|therapeutics/)) return 'Healthcare';
//         if (name.match(/finance|capital|bank|insurance|credit/)) return 'Financial Services';
//         if (name.match(/energy|oil|gas|solar|renewable/)) return 'Energy';
//         if (name.match(/retail|consumer|ecommerce/)) return 'Consumer';
//         if (name.match(/real estate|reit|property/)) return 'Real Estate';
//         if (name.match(/industrial|manufacturing|materials/)) return 'Industrials';
        
//         return 'Other';
//     }

//     /**
//      * ⚠ Détection de facteurs de risque
//      */
//     detectRiskFactors(ipo) {
//         const risks = [];
        
//         if (ipo.formType.includes('/A')) {
//             risks.push('Multiple amendments filed');
//         }
        
//         const daysSinceFiling = (Date.now() - new Date(ipo.filedDate)) / (1000 * 60 * 60 * 24);
//         if (daysSinceFiling > 180) {
//             risks.push('Filing older than 6 months');
//         }
        
//         return risks;
//     }

//     /**
//      * 🔒 Estime la date d'expiration du lock-up
//      */
//     estimateLockUpExpiry(filedDate) {
//         const filed = new Date(filedDate);
//         // Typiquement 180 jours après l'IPO (on estime +30 jours pour l'IPO effective)
//         const lockUpDays = 210;
//         const expiry = new Date(filed);
//         expiry.setDate(expiry.getDate() + lockUpDays);
//         return expiry.toISOString();
//     }

//     /**
//      * 📋 Détermine le stade du filing
//      */
//     determineFilingStage(formType) {
//         if (formType === 'S-1' || formType === 'F-1') return 'Initial Filing';
//         if (formType.includes('/A')) return 'Amendment';
//         if (formType === '424B4') return 'Final Prospectus';
//         return 'Unknown';
//     }
// }

// // Export global
// window.SECApiClient = SECApiClient;

/**
 * ═══════════════════════════════════════════════════════════════════
 * 🏛 SEC API CLIENT - AlphaVault AI (VERSION PRODUCTION)
 * ═══════════════════════════════════════════════════════════════════
 * ✅ Utilise /api/sec/category/IPO (endpoint corrigé)
 * ✅ Fallback vers /api/sec/feed/s1 + /api/sec/feed/f1
 * ✅ Retry automatique (3 tentatives)
 * ✅ Filtrage strict S-1, S-1/A, F-1, F-1/A
 * ✅ Timeout 30s
 * ═══════════════════════════════════════════════════════════════════
 */

class SECApiClient {
    constructor() {
        this.baseURL = 'https://sec-edgar-api.raphnardone.workers.dev';
        this.cache = new Map();
        this.cacheDuration = 1800000; // 30 minutes
        
        // Configuration retry
        this.maxRetries = 3;
        this.retryDelay = 2000;
        this.requestTimeout = 30000;
        
        console.log('🔧 SEC API Client initialized');
        console.log(`📡 Worker URL: ${this.baseURL}`);
    }

    /**
     * ═══════════════════════════════════════════════════════════════
     * 🌐 REQUÊTE AVEC RETRY + TIMEOUT
     * ═══════════════════════════════════════════════════════════════
     */
    async fetchWithRetry(url, options = {}, attempt = 1) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);

        try {
            console.log(`🌐 [Attempt ${attempt}/${this.maxRetries}] ${url}`);
            
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log(`✅ [Attempt ${attempt}] Success - ${data.count || data.data?.length || 0} items`);
            
            return data;

        } catch (error) {
            clearTimeout(timeoutId);
            console.error(`❌ [Attempt ${attempt}] ${error.message}`);

            if (attempt < this.maxRetries) {
                const delay = this.retryDelay * attempt;
                console.log(`⏳ Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                return this.fetchWithRetry(url, options, attempt + 1);
            }

            throw error;
        }
    }

    /**
     * ═══════════════════════════════════════════════════════════════
     * 📊 RÉCUPÈRE LES IPOs (MÉTHODE CORRIGÉE)
     * ═══════════════════════════════════════════════════════════════
     * Stratégie multi-endpoints :
     * 1. Essayer /api/sec/category/IPO (optimal)
     * 2. Fallback : merger /api/sec/feed/s1 + /api/sec/feed/f1
     * 3. Filtrage strict : S-1, S-1/A, F-1, F-1/A uniquement
     * ═══════════════════════════════════════════════════════════════
     */
    async getIPOs(options = {}) {
        const {
            limit = 5000,
            includeAmendments = true,
            forceRefresh = false
        } = options;

        const cacheKey = `ipos-${limit}-${includeAmendments}`;

        // Vérifier le cache
        if (!forceRefresh && this.isCacheValid(cacheKey)) {
            console.log('📦 Returning cached IPOs');
            return this.cache.get(cacheKey).data;
        }

        try {
            console.log('🎯 Strategy 1: Trying /api/sec/category/IPO...');
            
            // ✅ STRATÉGIE 1 : Endpoint catégorie IPO
            try {
                const params = new URLSearchParams({ limit });
                const data = await this.fetchWithRetry(
                    `${this.baseURL}/api/sec/category/IPO?${params}`
                );
                
                // Filtrer strictement les forms IPO
                const filteredData = this.filterIPOForms(data);
                
                if (filteredData.count > 0) {
                    console.log(`✅ Strategy 1 SUCCESS - ${filteredData.count} IPOs`);
                    this.cacheData(cacheKey, filteredData);
                    return filteredData;
                }
                
                console.warn('⚠ Strategy 1 returned 0 IPOs, trying Strategy 2...');
                
            } catch (error) {
                console.warn('⚠ Strategy 1 failed:', error.message);
            }

            // ✅ STRATÉGIE 2 : Merger S-1 + F-1 feeds
            console.log('🎯 Strategy 2: Merging /feed/s1 + /feed/f1...');
            
            const [s1Data, f1Data] = await Promise.all([
                this.fetchWithRetry(`${this.baseURL}/api/sec/feed/s1?limit=${Math.floor(limit / 2)}`),
                this.fetchWithRetry(`${this.baseURL}/api/sec/feed/f1?limit=${Math.floor(limit / 2)}`)
            ]);

            const mergedData = {
                data: [...(s1Data.data || []), ...(f1Data.data || [])],
                count: (s1Data.data?.length || 0) + (f1Data.data?.length || 0),
                source: 'MERGED_FEEDS',
                feeds: ['s1', 'f1']
            };

            // Filtrer strictement
            const filteredData = this.filterIPOForms(mergedData);
            
            console.log(`✅ Strategy 2 SUCCESS - ${filteredData.count} IPOs`);
            this.cacheData(cacheKey, filteredData);
            return filteredData;

        } catch (error) {
            console.error('❌ All strategies failed:', error);
            throw error;
        }
    }

    /**
     * ═══════════════════════════════════════════════════════════════
     * 🛡 FILTRAGE STRICT DES FORMS IPO
     * ═══════════════════════════════════════════════════════════════
     * Garde UNIQUEMENT : S-1, S-1/A, F-1, F-1/A
     * Exclut : 4, 4/A, 8-K, 10-K, 10-Q, etc.
     * ═══════════════════════════════════════════════════════════════
     */
    filterIPOForms(data) {
        const validForms = ['S-1', 'S-1/A', 'F-1', 'F-1/A'];
        
        let items = data.data || [];
        
        console.log(`🔍 Filtering ${items.length} items...`);
        
        const filtered = items.filter(item => {
            const formType = (item.formType || '').trim().toUpperCase();
            
            // Normaliser : "S-1/A" ou "S-1MEF" → "S-1/A"
            let normalizedForm = formType;
            if (formType.startsWith('S-1') && formType !== 'S-1') {
                normalizedForm = 'S-1/A';
            } else if (formType.startsWith('F-1') && formType !== 'F-1') {
                normalizedForm = 'F-1/A';
            }
            
            const isValid = validForms.includes(normalizedForm);
            
            if (!isValid) {
                console.log(`   ❌ Excluded: ${formType} (${item.companyName?.substring(0, 30)}...)`);
            }
            
            return isValid;
        });

        console.log(`✅ Kept ${filtered.length} valid IPO forms`);
        console.log(`❌ Excluded ${items.length - filtered.length} non-IPO forms`);

        return {
            ...data,
            data: filtered,
            count: filtered.length,
            originalCount: items.length,
            excluded: items.length - filtered.length
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════════
     * 💾 CACHE
     * ═══════════════════════════════════════════════════════════════
     */
    cacheData(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
        console.log(`💾 Cached: ${key}`);
    }

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

    clearCache() {
        this.cache.clear();
        console.log('🧹 Cache cleared');
    }

    /**
     * ═══════════════════════════════════════════════════════════════
     * 📄 RÉCUPÈRE UN FEED SPÉCIFIQUE
     * ═══════════════════════════════════════════════════════════════
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
            const data = await this.fetchWithRetry(
                `${this.baseURL}/api/sec/feed/${feedType}?${params}`
            );
            
            this.cacheData(cacheKey, data);
            console.log(`✅ Fetched ${data.count} filings for ${feedType}`);
            
            return data;

        } catch (error) {
            console.error(`❌ Error fetching feed ${feedType}:`, error);
            throw error;
        }
    }

    /**
     * ═══════════════════════════════════════════════════════════════
     * 📂 RÉCUPÈRE PAR CATÉGORIE
     * ═══════════════════════════════════════════════════════════════
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
            const data = await this.fetchWithRetry(
                `${this.baseURL}/api/sec/category/${encodeURIComponent(category)}?${params}`
            );
            
            this.cacheData(cacheKey, data);
            console.log(`✅ Fetched ${data.count} filings for category ${category}`);
            
            return data;

        } catch (error) {
            console.error(`❌ Error fetching category ${category}:`, error);
            throw error;
        }
    }

    /**
     * ═══════════════════════════════════════════════════════════════
     * 🔄 SYNCHRONISATION MANUELLE
     * ═══════════════════════════════════════════════════════════════
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
     * ═══════════════════════════════════════════════════════════════
     * 🏥 HEALTH CHECK
     * ═══════════════════════════════════════════════════════════════
     */
    async healthCheck() {
        try {
            console.log('🏥 Checking Worker health...');
            
            const data = await this.fetchWithRetry(`${this.baseURL}/health`);
            
            console.log('✅ Worker is healthy:', data);
            
            return { status: 'ok', ...data };
            
        } catch (error) {
            console.error('❌ Worker health check failed:', error);
            
            return { 
                status: 'error', 
                error: error.message
            };
        }
    }

    /**
     * ═══════════════════════════════════════════════════════════════
     * 📈 ANALYSE IPO (ENRICHISSEMENT)
     * ═══════════════════════════════════════════════════════════════
     */
    async analyzeIPO(ipo) {
        const enriched = {
            ...ipo,
            successScore: this.calculateSuccessScore(ipo),
            sector: this.classifySector(ipo.companyName),
            riskFactors: this.detectRiskFactors(ipo),
            lockUpExpiry: this.estimateLockUpExpiry(ipo.filedDate),
            filingStage: this.determineFilingStage(ipo.formType)
        };

        return enriched;
    }

    calculateSuccessScore(ipo) {
        let score = 50;

        if (ipo.formType === 'S-1' || ipo.formType === 'F-1') score += 10;

        const daysSinceFiling = (Date.now() - new Date(ipo.filedDate)) / (1000 * 60 * 60 * 24);
        if (daysSinceFiling < 30) score += 15;
        else if (daysSinceFiling < 90) score += 10;
        else if (daysSinceFiling < 180) score += 5;

        const positiveKeywords = ['technology', 'AI', 'cloud', 'software', 'biotech', 'fintech'];
        if (positiveKeywords.some(kw => (ipo.companyName || '').toLowerCase().includes(kw))) {
            score += 15;
        }

        if (ipo.summary && ipo.summary.length > 200) score += 10;

        return Math.min(100, Math.max(0, score));
    }

    classifySector(companyName) {
        const name = (companyName || '').toLowerCase();
        
        if (name.match(/tech|software|ai|cloud|data|cyber/)) return 'Technology';
        if (name.match(/bio|pharma|health|medical|therapeutics/)) return 'Healthcare';
        if (name.match(/finance|capital|bank|insurance|credit/)) return 'Financial Services';
        if (name.match(/energy|oil|gas|solar|renewable/)) return 'Energy';
        if (name.match(/retail|consumer|ecommerce/)) return 'Consumer';
        if (name.match(/real estate|reit|property/)) return 'Real Estate';
        if (name.match(/industrial|manufacturing|materials/)) return 'Industrials';
        
        return 'Other';
    }

    detectRiskFactors(ipo) {
        const risks = [];
        
        if (ipo.formType && ipo.formType.includes('/A')) {
            risks.push('Multiple amendments filed');
        }
        
        const daysSinceFiling = (Date.now() - new Date(ipo.filedDate)) / (1000 * 60 * 60 * 24);
        if (daysSinceFiling > 180) {
            risks.push('Filing older than 6 months');
        }
        
        return risks;
    }

    estimateLockUpExpiry(filedDate) {
        const filed = new Date(filedDate);
        const lockUpDays = 210;
        const expiry = new Date(filed);
        expiry.setDate(expiry.getDate() + lockUpDays);
        return expiry.toISOString();
    }

    determineFilingStage(formType) {
        if (!formType) return 'Unknown';
        if (formType === 'S-1' || formType === 'F-1') return 'Initial Filing';
        if (formType.includes('/A')) return 'Amendment';
        if (formType === '424B4') return 'Final Prospectus';
        return 'Unknown';
    }
}

// Export global
window.SECApiClient = SECApiClient;