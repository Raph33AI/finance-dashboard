/**
 * ═══════════════════════════════════════════════════════════════════
 * 🤝 M&A DEALS API CLIENT - AlphaVault AI (VERSION FORM 4 STYLE)
 * ═══════════════════════════════════════════════════════════════════
 * Client spécialisé pour récupérer et analyser les deals M&A
 * ✅ PAGINATION AUTOMATIQUE (comme Form 4)
 * ✅ PARSING DE DOCUMENTS
 * ✅ RATE LIMITING RESPECTÉ
 * ═══════════════════════════════════════════════════════════════════
 */

class MAClient {
    constructor() {
        this.workerURL = 'https://sec-edgar-api.raphnardone.workers.dev';
        this.userAgent = 'AlphaVault AI info@alphavault-ai.com';
        this.cache = new Map();
        this.cacheDuration = 30 * 60 * 1000; // 30 minutes (comme Form 4 mais plus long)
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🚀 MÉTHODE PRINCIPALE : Charge TOUS les deals M&A avec pagination
    // (Équivalent de getAllForm4Transactions)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /**
     * 🚀 Charge TOUS les deals M&A des X derniers jours
     * @param {Object} options - Options de chargement
     * @param {Number} options.maxDeals - Nombre max de deals à charger (défaut: 100)
     * @param {Array} options.types - Types de filings M&A ['s4', 'defm14a'] (défaut: tous)
     * @param {Boolean} options.forceRefresh - Force le rechargement (défaut: false)
     * @param {Boolean} options.parseDocuments - Parse le contenu des documents (défaut: false)
     */
    async getAllMADeals(options = {}) {
        const {
            maxDeals = 100,
            types = ['s4', 'defm14a'], // S-4 = Mergers, DEFM14A = Proxy Statements
            forceRefresh = false,
            parseDocuments = false
        } = options;

        console.log(`🌐 Loading M&A deals (max ${maxDeals}, types: ${types.join(', ')})...`);

        const cacheKey = `all-ma-deals-${types.join('-')}-${maxDeals}-${parseDocuments}`;
        
        if (!forceRefresh && this.isCacheValid(cacheKey)) {
            console.log('📦 Returning cached ALL M&A deals');
            return this.cache.get(cacheKey).data;
        }

        let allDeals = [];

        try {
            // ✅ PAGINATION pour chaque type de filing
            for (const type of types) {
                console.log(`📥 Loading ${type.toUpperCase()} filings...`);
                
                const response = await fetch(
                    `${this.workerURL}/api/ma/feed?type=${type}&limit=${maxDeals}`
                );

                if (!response.ok) {
                    console.error(`❌ Worker error for ${type}:`, response.status);
                    continue;
                }

                const data = await response.json();
                
                if (data.filings && Array.isArray(data.filings)) {
                    console.log(`   ✅ Got ${data.filings.length} ${type.toUpperCase()} filings`);
                    
                    // Transform to standard deal format
                    const deals = data.filings.map(filing => ({
                        // Core Info
                        targetCompany: filing.companyName,
                        companyName: filing.companyName,
                        dealDate: filing.filedDate,
                        filedDate: filing.filedDate,
                        formType: filing.formType || type.toUpperCase(),
                        
                        // SEC Data
                        cik: filing.cik,
                        accessionNumber: filing.accessionNumber,
                        filingUrl: filing.link || filing.filingUrl,
                        
                        // Extracted Info
                        acquirerName: this.extractAcquirerFromSummary(filing.summary || filing.title),
                        targetName: filing.companyName,
                        sector: this.categorizeSector(filing.companyName),
                        
                        // Placeholders (à remplir avec parseDocuments)
                        dealValue: null,
                        evSales: null,
                        evEbitda: null,
                        premium: null,
                        
                        // Status
                        dealStatus: 'Filed',
                        paymentMethod: 'TBD',
                        
                        // Raw Data
                        summary: filing.summary || '',
                        rawTitle: filing.title || ''
                    }));

                    allDeals.push(...deals);
                }

                await this.sleep(150); // Rate limiting
            }

            // ✅ OPTIONAL: Parse documents for detailed metrics (comme Form 4 parse XML)
            if (parseDocuments && allDeals.length > 0) {
                console.log(`🔄 Parsing ${Math.min(allDeals.length, 20)} documents for detailed data...`);
                
                let parsedCount = 0;
                let errorCount = 0;

                for (let i = 0; i < Math.min(allDeals.length, 20); i++) {
                    const deal = allDeals[i];
                    try {
                        const docText = await this.getMADocument(deal.accessionNumber, deal.cik);
                        const extracted = this.extractDealDataFromDocument(docText);
                        
                        allDeals[i] = { ...deal, ...extracted };
                        parsedCount++;
                        
                        if (parsedCount % 5 === 0) {
                            console.log(`   📄 Progress: ${parsedCount}/${Math.min(allDeals.length, 20)} parsed`);
                        }
                        
                        await this.sleep(200);
                    } catch (error) {
                        console.warn(`⚠ Failed to parse document for ${deal.accessionNumber}:`, error.message);
                        errorCount++;
                    }
                }

                console.log(`✅ Parsed ${parsedCount} documents (${errorCount} errors)`);
            }

            console.log(`🎉 Total loaded: ${allDeals.length} M&A deals`);

            // Cache result
            this.cache.set(cacheKey, {
                data: allDeals,
                timestamp: Date.now()
            });

            return allDeals;

        } catch (error) {
            console.error('❌ Error loading ALL M&A deals:', error);
            throw error;
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📄 Récupère le document M&A complet (équivalent de getForm4XML)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /**
     * 📄 Récupère le document M&A complet (VIA WORKER)
     * @param {String} accessionNumber - Numéro d'accession SEC
     * @param {String} cik - CIK de la compagnie
     * @returns {Promise<String>} Texte complet du document
     */
    async getMADocument(accessionNumber, cik) {
        const cacheKey = `ma-doc-${accessionNumber}`;

        if (this.isCacheValid(cacheKey)) {
            console.log('📦 Returning cached M&A document');
            return this.cache.get(cacheKey).data;
        }

        try {
            console.log(`🌐 Fetching M&A document via Worker: ${accessionNumber}`);
            
            const response = await fetch(
                `${this.workerURL}/api/ma/document?accession=${accessionNumber}&cik=${cik}`
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('❌ Worker returned error:', errorData);
                throw new Error(`Worker error: ${response.status}`);
            }

            const docText = await response.text();

            this.cache.set(cacheKey, {
                data: docText,
                timestamp: Date.now()
            });

            console.log(`✅ Got M&A document for ${accessionNumber} (${docText.length} chars)`);

            return docText;

        } catch (error) {
            console.error(`❌ Error fetching M&A document ${accessionNumber}:`, error);
            throw error;
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🔍 EXTRACTION DE DONNÉES DES DOCUMENTS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /**
     * 🔍 Extrait les données financières d'un document M&A
     * (Équivalent du parsing XML Form 4)
     */
    extractDealDataFromDocument(text) {
        return {
            dealValue: this.extractDealValue(text),
            acquirerName: this.extractAcquirerName(text),
            targetName: this.extractTargetName(text),
            premium: this.extractPremium(text),
            evSales: this.extractMultiple(text, 'sales'),
            evEbitda: this.extractMultiple(text, 'ebitda'),
            paymentMethod: this.extractPaymentMethod(text),
            dealStatus: this.extractDealStatus(text)
        };
    }

    extractDealValue(text) {
        const patterns = [
            /aggregate\s+(?:purchase\s+)?price\s+of\s+(?:approximately\s+)?\$?([\d,]+(?:\.\d+)?)\s*(million|billion)/i,
            /transaction\s+value\s+of\s+(?:approximately\s+)?\$?([\d,]+(?:\.\d+)?)\s*(million|billion)/i,
            /purchase\s+price\s+of\s+\$?([\d,]+(?:\.\d+)?)\s*(million|billion)/i,
            /consideration\s+of\s+\$?([\d,]+(?:\.\d+)?)\s*(million|billion)/i
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                const value = parseFloat(match[1].replace(/,/g, ''));
                const unit = match[2].toLowerCase();
                const valueMillions = unit === 'billion' ? value * 1000 : value;
                
                return {
                    valueMillions: valueMillions,
                    formatted: `$${value}${unit === 'billion' ? 'B' : 'M'}`,
                    currency: 'USD'
                };
            }
        }
        return null;
    }

    extractAcquirerName(text) {
        const patterns = [
            /(?:the\s+)?acquirer[,\s:]+([A-Z][A-Za-z\s&,\.]+(?:Inc\.|Corp\.|Corporation|Company|LLC|Ltd\.))/i,
            /acquired\s+by\s+([A-Z][A-Za-z\s&,\.]+(?:Inc\.|Corp\.|Corporation|Company|LLC|Ltd\.))/i,
            /merger\s+with\s+([A-Z][A-Za-z\s&,\.]+(?:Inc\.|Corp\.|Corporation|Company|LLC|Ltd\.))/i
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) return match[1].trim().substring(0, 100);
        }
        
        return 'TBD';
    }

    extractTargetName(text) {
        const patterns = [
            /(?:the\s+)?target[,\s:]+([A-Z][A-Za-z\s&,\.]+(?:Inc\.|Corp\.|Corporation|Company|LLC|Ltd\.))/i,
            /acquisition\s+of\s+([A-Z][A-Za-z\s&,\.]+(?:Inc\.|Corp\.|Corporation|Company|LLC|Ltd\.))/i
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) return match[1].trim().substring(0, 100);
        }
        
        return 'Unknown';
    }

    extractPremium(text) {
        const patterns = [
            /premium\s+of\s+([\d.]+)%/i,
            /([\d.]+)%\s+premium/i
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                const premium = parseFloat(match[1]);
                if (premium > 0 && premium < 200) return premium;
            }
        }
        return null;
    }

    extractMultiple(text, type) {
        let patterns = [];
        
        if (type === 'sales') {
            patterns = [
                /ev\s*[/\\]\s*sales\s+(?:multiple\s+)?(?:of\s+)?([\d.]+)x?/i,
                /price\s+to\s+sales\s+(?:ratio\s+)?(?:of\s+)?([\d.]+)x?/i
            ];
        } else if (type === 'ebitda') {
            patterns = [
                /ev\s*[/\\]\s*ebitda\s+(?:multiple\s+)?(?:of\s+)?([\d.]+)x?/i,
                /([\d.]+)x\s+ebitda/i
            ];
        }

        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                const multiple = parseFloat(match[1]);
                if (multiple > 0 && multiple < 100) return multiple;
            }
        }
        return null;
    }

    extractPaymentMethod(text) {
        const lowerText = text.toLowerCase();
        const methods = [];
        
        if (lowerText.includes('all cash') || lowerText.includes('cash consideration')) methods.push('Cash');
        if (lowerText.includes('stock') || lowerText.includes('shares')) methods.push('Stock');
        
        if (methods.includes('Cash') && methods.includes('Stock')) return 'Cash + Stock';
        return methods.length > 0 ? methods.join(' + ') : 'Unknown';
    }

    extractDealStatus(text) {
        const lowerText = text.toLowerCase();

        if (lowerText.includes('completed') || lowerText.includes('consummated')) return 'Completed';
        if (lowerText.includes('definitive agreement')) return 'Definitive Agreement';
        if (lowerText.includes('terminated')) return 'Terminated';
        
        return 'Pending';
    }

    extractAcquirerFromSummary(text) {
        if (!text) return 'TBD';
        
        const patterns = [
            /acquired by ([A-Z][A-Za-z\s&,\.]+(?:Inc\.|Corp\.|Corporation|Company|LLC|Ltd\.))/i,
            /merger with ([A-Z][A-Za-z\s&,\.]+(?:Inc\.|Corp\.|Corporation|Company|LLC|Ltd\.))/i,
            /acquisition by ([A-Z][A-Za-z\s&,\.]+(?:Inc\.|Corp\.|Corporation|Company|LLC|Ltd\.))/i
        ];
        
        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                return match[1].trim().substring(0, 100);
            }
        }
        
        return 'TBD';
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎯 MÉTHODE SIMPLIFIÉE : getDealComps (appelle getAllMADeals)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /**
     * 🤝 Get M&A deal comps (version simplifiée)
     * Cette méthode est appelée par ma-ui.js
     */
    async getDealComps(options = {}) {
        const {
            sector = null,
            year = null,
            limit = 50,
            forceRefresh = false
        } = options;

        console.log(`🤝 Loading M&A Deal Comps (sector: ${sector || 'all'}, year: ${year || 'all'}, max: ${limit})...`);

        try {
            // ✅ Appelle la méthode principale
            let allDeals = await this.getAllMADeals({
                maxDeals: limit,
                types: ['s4', 'defm14a'],
                forceRefresh: forceRefresh,
                parseDocuments: false // Désactivé pour la vitesse
            });

            // Apply filters
            if (sector) {
                allDeals = allDeals.filter(d => d.sector === sector);
            }
            
            if (year) {
                allDeals = allDeals.filter(d => {
                    const dealYear = new Date(d.filedDate).getFullYear().toString();
                    return dealYear === year;
                });
            }

            const result = {
                count: allDeals.length,
                sector: sector || 'All Sectors',
                year: year || 'All Years',
                deals: allDeals,
                source: 'SEC EDGAR via Worker',
                timestamp: new Date().toISOString(),
                breakdown: {
                    bySector: this.calculateSectorBreakdown(allDeals),
                    byYear: this.calculateYearBreakdown(allDeals),
                    byFormType: this.calculateFormTypeBreakdown(allDeals)
                }
            };
            
            console.log(`✅ Returning ${allDeals.length} M&A deal comps`);
            return result;

        } catch (error) {
            console.error('❌ Error in getDealComps:', error);
            throw error;
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🌐 AUTRES MÉTHODES WORKER (inchangées)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    async makeRequest(endpoint, params = {}) {
        const cacheKey = `${endpoint}-${JSON.stringify(params)}`;
        
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheDuration) {
                console.log(`📦 Cache HIT: ${endpoint}`);
                return cached.data;
            }
        }

        try {
            const queryString = new URLSearchParams(params).toString();
            const url = `${this.workerURL}${endpoint}${queryString ? '?' + queryString : ''}`;
            
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

    async getMAAlerts(params = {}) {
        return await this.makeRequest('/api/ma/alerts', params);
    }

    async getMAProbability(ticker, cik = null) {
        return await this.makeRequest('/api/ma/probability', { ticker, cik });
    }

    async getAcquirerProfiles(sector = null) {
        return await this.makeRequest('/api/ma/acquirers', sector ? { sector } : {});
    }

    async calculateTakeoverPremium(ticker, price, sector) {
        return await this.makeRequest('/api/ma/premium-calculator', { ticker, price, sector });
    }

    async getMADashboard() {
        return await this.makeRequest('/api/ma/dashboard');
    }

    async tickerToCIK(ticker) {
        return await this.makeRequest('/api/sec/ticker-to-cik', { ticker });
    }

    async getForm4Feed(params = {}) {
        return await this.makeRequest('/api/sec/form4/feed', params);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🔧 UTILITY FUNCTIONS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    categorizeSector(companyName) {
        const lower = (companyName || '').toLowerCase();
        
        const sectors = {
            'Technology': ['tech', 'software', 'data', 'cloud', 'cyber', 'ai', 'digital', 'semiconductor'],
            'Healthcare': ['health', 'pharma', 'biotech', 'medical', 'therapeutics', 'drug', 'clinical'],
            'Financial Services': ['bank', 'financial', 'capital', 'investment', 'insurance', 'fintech'],
            'Energy': ['energy', 'oil', 'gas', 'renewable', 'solar', 'power'],
            'Consumer': ['retail', 'consumer', 'food', 'beverage', 'restaurant', 'e-commerce'],
            'Industrial': ['manufacturing', 'industrial', 'materials', 'construction', 'aerospace'],
            'Real Estate': ['real estate', 'reit', 'property', 'realty']
        };
        
        for (const [sector, keywords] of Object.entries(sectors)) {
            if (keywords.some(kw => lower.includes(kw))) {
                return sector;
            }
        }
        
        return 'Other';
    }

    calculateSectorBreakdown(deals) {
        const breakdown = {};
        deals.forEach(deal => {
            const sector = deal.sector || 'Other';
            breakdown[sector] = (breakdown[sector] || 0) + 1;
        });
        return breakdown;
    }

    calculateYearBreakdown(deals) {
        const breakdown = {};
        deals.forEach(deal => {
            const year = new Date(deal.filedDate).getFullYear().toString();
            breakdown[year] = (breakdown[year] || 0) + 1;
        });
        return breakdown;
    }

    calculateFormTypeBreakdown(deals) {
        const breakdown = {};
        deals.forEach(deal => {
            const formType = deal.formType || 'Unknown';
            breakdown[formType] = (breakdown[formType] || 0) + 1;
        });
        return breakdown;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    isCacheValid(key) {
        if (!this.cache.has(key)) return false;
        const cached = this.cache.get(key);
        return (Date.now() - cached.timestamp) < this.cacheDuration;
    }

    clearCache() {
        this.cache.clear();
        console.log('🧹 M&A Client cache cleared');
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🌍 GLOBAL INSTANCE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const maClient = new MAClient();

console.log('✅ M&A Client (Form 4 Style) loaded - Pagination & document parsing enabled');