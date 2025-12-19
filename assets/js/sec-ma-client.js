/**
 * ═══════════════════════════════════════════════════════════════════
 * 🤝 SEC M&A DEALS API CLIENT - AlphaVault AI (VERSION CONFIGURABLE)
 * ═══════════════════════════════════════════════════════════════════
 * Client spécialisé pour récupérer et analyser les M&A Deals
 * ✅ Parse S-4, DEFM14A, et 8-K (Items M&A)
 * ✅ EXTRACTION RÉELLE : Deal Value, Premium, Multiples, Acquirer, Target
 * ✅ PAGINATION AUTOMATIQUE
 * ✅ RATE LIMITING RESPECTÉ
 * ═══════════════════════════════════════════════════════════════════
 */

class SECMAClient {
    constructor() {
        this.workerURL = 'https://sec-edgar-api.raphnardone.workers.dev';
        this.userAgent = 'AlphaVault AI info@alphavault-ai.com';
        this.cache = new Map();
        this.cacheDuration = 1800000; // 30 minutes (deals changent moins souvent que Form 4)
    }

    /**
     * 🚀 MÉTHODE PRINCIPALE : Charge TOUS les M&A Deals récents avec parsing COMPLET
     */
    async getAllMADeals(options = {}) {
        const {
            maxDeals = 50,
            days = 365,
            sector = null,
            minDealValue = null,
            forceRefresh = false,
            verbose = false
        } = options;

        console.log(`🤝 Loading M&A Deals (max ${maxDeals} from last ${days} days)...`);

        const cacheKey = `all-ma-deals-${days}-${maxDeals}-${sector || 'all'}`;
        
        if (!forceRefresh && this.isCacheValid(cacheKey)) {
            console.log('📦 Returning cached M&A deals');
            return this.cache.get(cacheKey).data;
        }

        let allDeals = [];
        const feedTypes = ['s4', 'defm14a', '8k'];

        try {
            // ✅ ÉTAPE 1 : Récupérer les filings de chaque type
            for (const feedType of feedTypes) {
                console.log(`📥 Fetching ${feedType.toUpperCase()} filings...`);

                const filings = await this.getFeedFilings(feedType, {
                    limit: feedType === '8k' ? 100 : 50, // Plus de 8-K car beaucoup ne sont pas M&A
                    days: days
                });

                console.log(`   ✅ Got ${filings.length} ${feedType.toUpperCase()} filings`);

                // ✅ ÉTAPE 2 : Parser chaque filing pour extraire les données du deal
                for (const filing of filings) {
                    try {
                        if (verbose) {
                            console.log(`🔍 Parsing ${filing.accessionNumber}...`);
                        }

                        const dealData = await this.parseMAFiling(filing, feedType, verbose);

                        if (dealData && dealData.dealValue) {
                            // Filtrer par secteur si spécifié
                            if (!sector || dealData.sector === sector) {
                                // Filtrer par valeur minimale si spécifié
                                if (!minDealValue || dealData.dealValue.valueMillions >= minDealValue) {
                                    allDeals.push(dealData);
                                    
                                    if (verbose) {
                                        console.log(`   ✅ Valid deal: ${dealData.acquirerName} → ${dealData.targetName} (${dealData.dealValue.formatted})`);
                                    }
                                }
                            }
                        }

                        // Arrêter si on a atteint la limite
                        if (allDeals.length >= maxDeals) {
                            console.log(`✅ Reached max deals limit (${maxDeals})`);
                            break;
                        }

                        await this.sleep(200); // Rate limiting

                    } catch (parseError) {
                        if (verbose) {
                            console.warn(`⚠ Error parsing ${filing.accessionNumber}:`, parseError.message);
                        }
                    }
                }

                if (allDeals.length >= maxDeals) break;
            }

            // ✅ ÉTAPE 3 : Trier par date (plus récent en premier)
            allDeals.sort((a, b) => new Date(b.announcementDate) - new Date(a.announcementDate));

            // Limiter au nombre max
            allDeals = allDeals.slice(0, maxDeals);

            console.log(`🎉 Successfully parsed ${allDeals.length} M&A deals`);

            // Cache le résultat
            this.cache.set(cacheKey, {
                data: allDeals,
                timestamp: Date.now()
            });

            return allDeals;

        } catch (error) {
            console.error('❌ Error loading M&A deals:', error);
            throw error;
        }
    }

    /**
     * 📥 Récupère les filings d'un type spécifique
     */
    async getFeedFilings(feedType, options = {}) {
        const { limit = 50, days = 365 } = options;

        try {
            const response = await fetch(
                `${this.workerURL}/api/sec/feed/${feedType}?limit=${limit}`
            );

            if (!response.ok) {
                throw new Error(`Worker error: ${response.status}`);
            }

            const data = await response.json();
            
            if (!data.data || data.data.length === 0) {
                return [];
            }

            // Filtrer par date
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);

            const filings = data.data.filter(f => {
                const filedDate = new Date(f.filedDate);
                return filedDate >= cutoffDate;
            });

            return filings;

        } catch (error) {
            console.error(`❌ Error fetching ${feedType} feed:`, error);
            return [];
        }
    }

    /**
     * 🔍 PARSER PRINCIPAL : Analyse un filing M&A et extrait les données du deal
     */
    async parseMAFiling(filing, feedType, verbose = false) {
        try {
            // Construction de l'URL du document texte
            let docURL = filing.filingUrl || filing.link;
            
            if (!docURL) {
                if (verbose) console.warn(`⚠ No filing URL for ${filing.accessionNumber}`);
                return null;
            }

            // Convertir l'index HTML en fichier .txt pour parsing
            docURL = docURL.replace('-index.htm', '.txt').replace('-index.html', '.txt');

            if (verbose) console.log(`📄 Fetching: ${docURL}`);

            const response = await fetch(docURL, {
                headers: { 
                    'User-Agent': this.userAgent,
                    'Accept': 'text/plain, text/html, */*'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const text = await response.text();

            // Pour les 8-K, vérifier d'abord si c'est un M&A filing
            if (feedType === '8k') {
                const isMARelated = this.is8KMARelated(text);
                if (!isMARelated) {
                    if (verbose) console.log(`   ⏭ Skipping non-M&A 8-K`);
                    return null;
                }
            }

            // ✅ EXTRACTION DES DONNÉES
            const dealData = {
                // Métadonnées du filing
                companyName: filing.companyName,
                cik: filing.cik,
                formType: filing.formType || feedType.toUpperCase(),
                filedDate: filing.filedDate,
                accessionNumber: filing.accessionNumber,
                filingUrl: filing.filingUrl,
                
                // Données du deal extraites
                dealValue: this.extractDealValue(text),
                acquirerName: this.extractAcquirerName(text, filing),
                targetName: this.extractTargetName(text, filing),
                premium: this.extractPremium(text),
                evSales: this.extractMultiple(text, 'sales'),
                evEbitda: this.extractMultiple(text, 'ebitda'),
                pbRatio: this.extractMultiple(text, 'book'),
                sector: this.extractSector(text, filing),
                dealStatus: this.extractDealStatus(text, feedType),
                announcementDate: this.extractAnnouncementDate(text) || filing.filedDate,
                paymentMethod: this.extractPaymentMethod(text),
                synergies: this.extractSynergies(text),
                dealType: this.extractDealType(text),
                expectedClose: this.extractExpectedCloseDate(text)
            };

            // ✅ Validation : au minimum besoin du deal value OU d'un acquirer ET target
            if (!dealData.dealValue && (!dealData.acquirerName || !dealData.targetName)) {
                if (verbose) console.log(`   ⚠ Insufficient deal data in ${filing.accessionNumber}`);
                return null;
            }

            return dealData;

        } catch (error) {
            if (verbose) console.error(`❌ Parse error for ${filing.accessionNumber}:`, error.message);
            return null;
        }
    }

    /**
     * 🔎 Vérifie si un 8-K est lié à du M&A
     */
    is8KMARelated(text) {
        const lowerText = text.toLowerCase();
        
        // Vérifier la présence d'Items M&A critiques
        const criticalItems = [
            'item 1.01', // Entry into Material Definitive Agreement
            'item 2.01', // Completion of Acquisition or Disposition
            'item 5.01'  // Changes in Control of Registrant
        ];

        const hasMAItem = criticalItems.some(item => lowerText.includes(item));

        // Vérifier la présence de mots-clés M&A
        const maKeywords = [
            'merger agreement',
            'acquisition agreement',
            'purchase agreement',
            'definitive agreement',
            'tender offer',
            'change of control',
            'stock purchase',
            'asset purchase'
        ];

        const keywordCount = maKeywords.filter(keyword => lowerText.includes(keyword)).length;

        return hasMAItem || keywordCount >= 2;
    }

    /**
     * 💰 EXTRACTION : Deal Value
     */
    extractDealValue(text) {
        const patterns = [
            /aggregate\s+(?:purchase\s+)?price\s+of\s+(?:approximately\s+)?\$?([\d,]+(?:\.\d+)?)\s*(million|billion)/i,
            /transaction\s+value\s+of\s+(?:approximately\s+)?\$?([\d,]+(?:\.\d+)?)\s*(million|billion)/i,
            /purchase\s+price\s+of\s+\$?([\d,]+(?:\.\d+)?)\s*(million|billion)/i,
            /consideration\s+of\s+\$?([\d,]+(?:\.\d+)?)\s*(million|billion)/i,
            /enterprise\s+value\s+of\s+\$?([\d,]+(?:\.\d+)?)\s*(million|billion)/i,
            /equity\s+value\s+of\s+\$?([\d,]+(?:\.\d+)?)\s*(million|billion)/i,
            /\$\s?([\d,]+(?:\.\d+)?)\s*(million|billion)\s+in\s+(?:cash|aggregate)/i,
            /total\s+consideration\s+of\s+\$?([\d,]+(?:\.\d+)?)\s*(million|billion)/i
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

    /**
     * 🏢 EXTRACTION : Acquirer Name
     */
    extractAcquirerName(text, filing) {
        const patterns = [
            /(?:the\s+)?acquirer[,\s:]+([A-Z][A-Za-z\s&,\.]+(?:Inc\.|Corp\.|Corporation|Company|LLC|Ltd\.|L\.P\.|LP))/i,
            /(?:the\s+)?purchaser[,\s:]+([A-Z][A-Za-z\s&,\.]+(?:Inc\.|Corp\.|Corporation|Company|LLC|Ltd\.|L\.P\.|LP))/i,
            /(?:the\s+)?buyer[,\s:]+([A-Z][A-Za-z\s&,\.]+(?:Inc\.|Corp\.|Corporation|Company|LLC|Ltd\.|L\.P\.|LP))/i,
            /acquired\s+by\s+([A-Z][A-Za-z\s&,\.]+(?:Inc\.|Corp\.|Corporation|Company|LLC|Ltd\.|L\.P\.|LP))/i,
            /merger\s+with\s+([A-Z][A-Za-z\s&,\.]+(?:Inc\.|Corp\.|Corporation|Company|LLC|Ltd\.|L\.P\.|LP))/i,
            /([A-Z][A-Za-z\s&,\.]+(?:Inc\.|Corp\.|Corporation|Company|LLC|Ltd\.|L\.P\.|LP))\s+(?:has\s+)?agreed\s+to\s+acquire/i
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                return this.cleanCompanyName(match[1]);
            }
        }

        // Si Form S-4 ou DEFM14A, souvent le filing company est l'acquirer
        if (filing.formType === 'S-4' || filing.formType === 'DEFM14A') {
            return filing.companyName;
        }

        return 'Unknown Acquirer';
    }

    /**
     * 🎯 EXTRACTION : Target Name
     */
    extractTargetName(text, filing) {
        const patterns = [
            /(?:the\s+)?target[,\s:]+([A-Z][A-Za-z\s&,\.]+(?:Inc\.|Corp\.|Corporation|Company|LLC|Ltd\.|L\.P\.|LP))/i,
            /acquisition\s+of\s+([A-Z][A-Za-z\s&,\.]+(?:Inc\.|Corp\.|Corporation|Company|LLC|Ltd\.|L\.P\.|LP))/i,
            /purchase\s+of\s+([A-Z][A-Za-z\s&,\.]+(?:Inc\.|Corp\.|Corporation|Company|LLC|Ltd\.|L\.P\.|LP))/i,
            /merger\s+of\s+([A-Z][A-Za-z\s&,\.]+(?:Inc\.|Corp\.|Corporation|Company|LLC|Ltd\.|L\.P\.|LP))/i
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                return this.cleanCompanyName(match[1]);
            }
        }

        // Pour 8-K, souvent la company qui file est la target
        if (filing.formType === '8-K' || filing.formType === '8K') {
            return filing.companyName;
        }

        return 'Unknown Target';
    }

    /**
     * 📈 EXTRACTION : Premium
     */
    extractPremium(text) {
        const patterns = [
            /premium\s+of\s+([\d.]+)%/i,
            /([\d.]+)%\s+premium/i,
            /premium\s+to\s+(?:the\s+)?(?:closing\s+)?(?:stock\s+)?price\s+of\s+([\d.]+)%/i,
            /([\d.]+)%\s+above\s+(?:the\s+)?(?:closing\s+)?price/i
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                const premium = parseFloat(match[1]);
                if (premium > 0 && premium < 200) { // Sanity check
                    return premium;
                }
            }
        }

        return null;
    }

    /**
     * 📊 EXTRACTION : Multiples (EV/Sales, EV/EBITDA, P/B)
     */
    extractMultiple(text, type) {
        let patterns = [];
        
        if (type === 'sales') {
            patterns = [
                /ev\s*[/\\]\s*sales\s+(?:multiple\s+)?(?:of\s+)?([\d.]+)x?/i,
                /enterprise\s+value\s+to\s+sales\s+(?:ratio\s+)?(?:of\s+)?([\d.]+)x?/i,
                /price\s+to\s+sales\s+(?:ratio\s+)?(?:of\s+)?([\d.]+)x?/i
            ];
        } else if (type === 'ebitda') {
            patterns = [
                /ev\s*[/\\]\s*ebitda\s+(?:multiple\s+)?(?:of\s+)?([\d.]+)x?/i,
                /enterprise\s+value\s+to\s+ebitda\s+(?:ratio\s+)?(?:of\s+)?([\d.]+)x?/i,
                /([\d.]+)x\s+ebitda/i
            ];
        } else if (type === 'book') {
            patterns = [
                /price\s+to\s+book\s+(?:ratio\s+)?(?:of\s+)?([\d.]+)x?/i,
                /p\s*[/\\]\s*b\s+(?:ratio\s+)?(?:of\s+)?([\d.]+)x?/i,
                /([\d.]+)x\s+book\s+value/i
            ];
        }

        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                const multiple = parseFloat(match[1]);
                if (multiple > 0 && multiple < 100) { // Sanity check
                    return multiple;
                }
            }
        }

        return null;
    }

    /**
     * 🏭 EXTRACTION : Sector
     */
    extractSector(text, filing) {
        const sectors = {
            'Technology': ['software', 'saas', 'cloud', 'cyber', 'ai', 'machine learning', 'semiconductor'],
            'Healthcare': ['pharma', 'biotech', 'medical', 'health', 'clinical', 'therapeutics'],
            'Financial Services': ['bank', 'insurance', 'fintech', 'asset management', 'capital'],
            'Energy': ['oil', 'gas', 'renewable', 'energy', 'utility'],
            'Consumer': ['retail', 'consumer', 'e-commerce', 'brand'],
            'Industrial': ['manufacturing', 'industrial', 'aerospace', 'defense'],
            'Real Estate': ['reit', 'real estate', 'property'],
            'Telecom': ['telecom', 'wireless', 'network', '5g']
        };

        const lowerText = text.toLowerCase();

        for (const [sector, keywords] of Object.entries(sectors)) {
            for (const keyword of keywords) {
                if (lowerText.includes(keyword)) {
                    return sector;
                }
            }
        }

        return 'Other';
    }

    /**
     * 📋 EXTRACTION : Deal Status
     */
    extractDealStatus(text, feedType) {
        const lowerText = text.toLowerCase();

        if (lowerText.includes('completed') || lowerText.includes('closing') || lowerText.includes('consummated')) {
            return 'Completed';
        } else if (lowerText.includes('definitive agreement') || lowerText.includes('entered into')) {
            return 'Definitive Agreement';
        } else if (lowerText.includes('letter of intent') || lowerText.includes('loi')) {
            return 'Letter of Intent';
        } else if (lowerText.includes('terminated') || lowerText.includes('withdrawn')) {
            return 'Terminated';
        }

        // Par défaut selon le type de form
        if (feedType === 's4' || feedType === 'defm14a') {
            return 'Pending';
        } else if (feedType === '8k' && lowerText.includes('item 2.01')) {
            return 'Completed';
        }

        return 'Announced';
    }

    /**
     * 📅 EXTRACTION : Announcement Date
     */
    extractAnnouncementDate(text) {
        const patterns = [
            /announced\s+on\s+([A-Z][a-z]+\s+\d{1,2},\s+\d{4})/i,
            /entered\s+into\s+on\s+([A-Z][a-z]+\s+\d{1,2},\s+\d{4})/i,
            /dated\s+(?:as\s+of\s+)?([A-Z][a-z]+\s+\d{1,2},\s+\d{4})/i
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                const date = new Date(match[1]);
                if (!isNaN(date.getTime())) {
                    return date.toISOString().split('T')[0];
                }
            }
        }

        return null;
    }

    /**
     * 💳 EXTRACTION : Payment Method
     */
    extractPaymentMethod(text) {
        const lowerText = text.toLowerCase();
        
        const methods = [];
        
        if (lowerText.includes('all cash') || lowerText.includes('cash consideration')) {
            methods.push('Cash');
        }
        if (lowerText.includes('stock') || lowerText.includes('shares') || lowerText.includes('equity')) {
            methods.push('Stock');
        }
        if (lowerText.includes('cash and stock') || (methods.includes('Cash') && methods.includes('Stock'))) {
            return 'Cash + Stock';
        }

        return methods.length > 0 ? methods.join(' + ') : 'Unknown';
    }

    /**
     * ⚡ EXTRACTION : Synergies
     */
    extractSynergies(text) {
        const patterns = [
            /synergies\s+of\s+(?:approximately\s+)?\$?([\d,]+(?:\.\d+)?)\s*(million|billion)/i,
            /cost\s+savings\s+of\s+\$?([\d,]+(?:\.\d+)?)\s*(million|billion)/i,
            /annual\s+(?:run-rate\s+)?synergies\s+of\s+\$?([\d,]+(?:\.\d+)?)\s*(million|billion)/i
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                const value = parseFloat(match[1].replace(/,/g, ''));
                const unit = match[2].toLowerCase();
                return {
                    value: unit === 'billion' ? value * 1000 : value,
                    formatted: `$${value}${unit === 'billion' ? 'B' : 'M'}`
                };
            }
        }

        return null;
    }

    /**
     * 🔄 EXTRACTION : Deal Type
     */
    extractDealType(text) {
        const lowerText = text.toLowerCase();

        if (lowerText.includes('merger of equals')) return 'Merger of Equals';
        if (lowerText.includes('reverse merger')) return 'Reverse Merger';
        if (lowerText.includes('tender offer')) return 'Tender Offer';
        if (lowerText.includes('leveraged buyout') || lowerText.includes('lbo')) return 'LBO';
        if (lowerText.includes('management buyout') || lowerText.includes('mbo')) return 'MBO';
        if (lowerText.includes('asset purchase')) return 'Asset Purchase';
        if (lowerText.includes('stock purchase')) return 'Stock Purchase';
        if (lowerText.includes('merger')) return 'Merger';
        if (lowerText.includes('acquisition')) return 'Acquisition';

        return 'Other';
    }

    /**
     * 📆 EXTRACTION : Expected Close Date
     */
    extractExpectedCloseDate(text) {
        const patterns = [
            /expected\s+to\s+close\s+(?:in\s+|during\s+)?(?:the\s+)?([A-Z][a-z]+\s+(?:quarter\s+)?(?:of\s+)?\d{4})/i,
            /anticipated\s+closing\s+(?:in\s+|during\s+)?([A-Z][a-z]+\s+\d{4})/i,
            /close\s+(?:in\s+|during\s+)?(?:the\s+)?([A-Z][a-z]+\s+(?:quarter\s+)?(?:of\s+)?\d{4})/i
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                return match[1];
            }
        }

        return null;
    }

    /**
     * 🔧 UTILITY : Clean Company Name
     */
    cleanCompanyName(name) {
        return name
            .trim()
            .replace(/\s{2,}/g, ' ')
            .substring(0, 150); // Limiter la longueur
    }

    /**
     * 📊 Analyse des deals pour un ticker spécifique (détection M&A probability)
     */
    async getTickerMAActivity(ticker, months = 12) {
        try {
            console.log(`🔍 Checking M&A activity for ${ticker}...`);

            const days = months * 30;
            const deals = await this.getAllMADeals({ 
                maxDeals: 100, 
                days: days,
                verbose: false 
            });

            // Filtrer les deals où ce ticker est impliqué
            const tickerLower = ticker.toLowerCase();
            const relatedDeals = deals.filter(deal => {
                const acquirer = (deal.acquirerName || '').toLowerCase();
                const target = (deal.targetName || '').toLowerCase();
                const company = (deal.companyName || '').toLowerCase();
                
                return acquirer.includes(tickerLower) || 
                       target.includes(tickerLower) || 
                       company.includes(tickerLower);
            });

            return {
                ticker,
                period: `${months} months`,
                totalDeals: relatedDeals.length,
                deals: relatedDeals,
                asAcquirer: relatedDeals.filter(d => 
                    (d.acquirerName || '').toLowerCase().includes(tickerLower)
                ).length,
                asTarget: relatedDeals.filter(d => 
                    (d.targetName || '').toLowerCase().includes(tickerLower)
                ).length,
                totalValue: relatedDeals.reduce((sum, d) => 
                    sum + (d.dealValue?.valueMillions || 0), 0
                )
            };

        } catch (error) {
            console.error(`❌ Error checking M&A activity for ${ticker}:`, error);
            throw error;
        }
    }

    /**
     * 🔧 UTILITY FUNCTIONS
     */

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
        console.log('🧹 M&A Cache cleared');
    }
}

// Export global
window.SECMAClient = SECMAClient;

console.log('✅ SEC M&A Client loaded');