/**
 * ═══════════════════════════════════════════════════════════════════
 * 🏛 SEC API CLIENT - AlphaVault AI (VERSION PRODUCTION FINALE)
 * ═══════════════════════════════════════════════════════════════════
 * ✅ Strategy unique : /feed/s1 + /feed/f1 (endpoint fonctionnel)
 * ✅ Retry automatique (3 tentatives)
 * ✅ Filtrage strict S-1, S-1/A, F-1, F-1/A, F-10, F-1MEF
 * ✅ Récupération massive (jusqu'à 5000 IPOs)
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
     * 📊 RÉCUPÈRE LES IPOs (STRATÉGIE OPTIMISÉE)
     * ═══════════════════════════════════════════════════════════════
     * Stratégie unique : Merger /feed/s1 + /feed/f1
     * Limite maximale : 2000 par feed = 4000 IPOs total
     * Filtrage strict : S-1, S-1/A, F-1, F-1/A, F-10, F-1MEF
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
            console.log('🎯 Loading IPOs via S-1 + F-1 feeds...');
            
            // Calculer les limites par feed (max 2000 par feed pour éviter timeout)
            const limitPerFeed = Math.min(Math.floor(limit / 2), 2000);
            
            console.log(`📊 Requesting ${limitPerFeed} items per feed (S-1 + F-1)`);
            
            // ✅ RÉCUPÉRATION PARALLÈLE DES 2 FEEDS
            const [s1Data, f1Data] = await Promise.all([
                this.fetchWithRetry(`${this.baseURL}/api/sec/feed/s1?limit=${limitPerFeed}`),
                this.fetchWithRetry(`${this.baseURL}/api/sec/feed/f1?limit=${limitPerFeed}`)
            ]);

            // Merger les données
            const mergedData = {
                data: [...(s1Data.data || []), ...(f1Data.data || [])],
                count: (s1Data.data?.length || 0) + (f1Data.data?.length || 0),
                source: 'MERGED_FEEDS',
                feeds: ['s1', 'f1'],
                s1Count: s1Data.data?.length || 0,
                f1Count: f1Data.data?.length || 0
            };

            console.log(`📦 Merged data: ${mergedData.s1Count} S-1 + ${mergedData.f1Count} F-1 = ${mergedData.count} total`);

            // Filtrer strictement (exclure F-10 si nécessaire)
            const filteredData = this.filterIPOForms(mergedData, includeAmendments);
            
            console.log(`✅ Final dataset: ${filteredData.count} valid IPOs`);
            
            this.cacheData(cacheKey, filteredData);
            return filteredData;

        } catch (error) {
            console.error('❌ Failed to load IPOs:', error);
            throw error;
        }
    }

    /**
     * ═══════════════════════════════════════════════════════════════
     * 🛡 FILTRAGE STRICT DES FORMS IPO
     * ═══════════════════════════════════════════════════════════════
     * Garde : S-1, S-1/A, F-1, F-1/A, F-10 (optionnel), F-1MEF
     * Exclut : 4, 4/A, 8-K, 10-K, 10-Q, etc.
     * ═══════════════════════════════════════════════════════════════
     */
    filterIPOForms(data, includeAmendments = true) {
        // Forms valides pour IPO
        const validForms = ['S-1', 'S-1/A', 'F-1', 'F-1/A', 'F-10', 'F-1MEF'];
        
        let items = data.data || [];
        
        console.log(`🔍 Filtering ${items.length} items...`);
        
        const filtered = items.filter(item => {
            const formType = (item.formType || '').trim().toUpperCase();
            
            // Normaliser les variantes
            let normalizedForm = formType;
            
            // S-1 variants
            if (formType.startsWith('S-1') && formType !== 'S-1') {
                if (formType === 'S-1MEF') {
                    normalizedForm = 'S-1MEF'; // Garder tel quel
                } else {
                    normalizedForm = 'S-1/A'; // Tout le reste → S-1/A
                }
            }
            
            // F-1 variants
            if (formType.startsWith('F-1') && formType !== 'F-1') {
                if (formType === 'F-1MEF') {
                    normalizedForm = 'F-1MEF';
                } else if (formType !== 'F-10') {
                    normalizedForm = 'F-1/A';
                }
            }
            
            // Vérifier si c'est un form valide
            const isValid = validForms.includes(normalizedForm);
            
            // Si on n'inclut pas les amendments, exclure /A
            if (!includeAmendments && normalizedForm.includes('/A')) {
                return false;
            }
            
            if (!isValid) {
                console.log(`   ❌ Excluded: ${formType} (${item.companyName?.substring(0, 30)}...)`);
            }
            
            return isValid;
        });

        console.log(`✅ Kept ${filtered.length} valid IPO forms`);
        console.log(`❌ Excluded ${items.length - filtered.length} non-IPO forms`);

        // Déduplication par accessionNumber
        const deduped = this.deduplicateByAccession(filtered);

        return {
            ...data,
            data: deduped,
            count: deduped.length,
            originalCount: items.length,
            excluded: items.length - filtered.length,
            duplicatesRemoved: filtered.length - deduped.length
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════════
     * 🗑 DÉDUPLICATION PAR ACCESSION NUMBER
     * ═══════════════════════════════════════════════════════════════
     */
    deduplicateByAccession(items) {
        const seen = new Map();
        
        return items.filter(item => {
            // Utiliser l'URL de filing comme clé unique (plus fiable que accessionNumber)
            const key = item.filingUrl || `${item.cik}-${item.companyName}-${item.filedDate}`;
            
            if (seen.has(key)) {
                console.log(`🗑 Duplicate removed: ${item.companyName} (${item.formType})`);
                return false;
            }
            
            seen.set(key, true);
            return true;
        });
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
        if (formType === 'F-10') return 'Foreign Prospectus';
        if (formType.includes('MEF')) return 'MEF Amendment';
        if (formType === '424B4') return 'Final Prospectus';
        return 'Unknown';
    }
}

// Export global
window.SECApiClient = SECApiClient;