/**
 * ====================================================================
 * ALPHAVAULT AI - M&A PREDICTOR - HYBRID API CLIENT
 * ====================================================================
 * ✅ Calls Worker API for alerts, probability, dashboard
 * ✅ Parses REAL M&A deal content locally (no Worker needed)
 * ====================================================================
 */

class MAClient {
    constructor() {
        this.baseURL = 'https://sec-edgar-api.raphnardone.workers.dev';
        this.userAgent = 'AlphaVault AI info@alphavault-ai.com';
        this.cache = new Map();
        this.cacheDuration = 30 * 60 * 1000; // 30 minutes
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🌐 WORKER API METHODS (Existing - Keep as is)
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
    // 🔥 NEW: REAL M&A DEAL PARSING (Replaces /api/ma/deal-comps)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /**
     * 🚀 MAIN METHOD: Get REAL M&A deals with parsed content
     */
    async getDealComps(options = {}) {
        const {
            sector = null,
            year = null,
            limit = 50,
            forceRefresh = false
        } = options;

        console.log(`🤝 Loading REAL M&A Deals (max ${limit})...`);

        const cacheKey = `real-ma-deals-${sector || 'all'}-${year || 'all'}-${limit}`;
        
        if (!forceRefresh && this.isCacheValid(cacheKey)) {
            console.log('📦 Returning cached REAL M&A deals');
            return this.cache.get(cacheKey).data;
        }

        let allDeals = [];
        const feedTypes = ['s4', 'defm14a', '8k'];
        const days = year ? this.calculateDaysFromYear(year) : 365;

        try {
            for (const feedType of feedTypes) {
                console.log(`📥 Fetching ${feedType.toUpperCase()} filings...`);

                const filings = await this.getFeedFilings(feedType, { limit: 50, days });

                console.log(`   ✅ Got ${filings.length} ${feedType.toUpperCase()} filings`);

                for (const filing of filings) {
                    try {
                        const dealData = await this.parseMAFiling(filing, feedType);

                        if (dealData && dealData.dealValue) {
                            if (!sector || dealData.sector === sector) {
                                if (!year || this.isInYear(dealData.announcementDate, year)) {
                                    allDeals.push(dealData);
                                }
                            }
                        }

                        if (allDeals.length >= limit) break;

                        await this.sleep(200);

                    } catch (parseError) {
                        console.warn(`⚠ Error parsing ${filing.accessionNumber}:`, parseError.message);
                    }
                }

                if (allDeals.length >= limit) break;
            }

            allDeals.sort((a, b) => new Date(b.announcementDate) - new Date(a.announcementDate));
            allDeals = allDeals.slice(0, limit);

            const result = {
                sector: sector || 'All Sectors',
                year: year || 'All Years',
                count: allDeals.length,
                deals: allDeals,
                averageMultiples: this.calculateAverageMultiples(allDeals),
                lastUpdated: new Date().toISOString()
            };

            this.cache.set(cacheKey, {
                data: result,
                timestamp: Date.now()
            });

            console.log(`🎉 Successfully parsed ${allDeals.length} REAL M&A deals`);
            return result;

        } catch (error) {
            console.error('❌ Error loading M&A deals:', error);
            throw error;
        }
    }

    /**
     * 📥 Fetch filings from SEC RSS
     */
    async getFeedFilings(feedType, options = {}) {
        const { limit = 50, days = 365 } = options;

        try {
            const response = await fetch(
                `${this.baseURL}/api/sec/feed/${feedType}?limit=${limit}`
            );

            if (!response.ok) {
                throw new Error(`Worker error: ${response.status}`);
            }

            const data = await response.json();
            
            if (!data.data || data.data.length === 0) {
                return [];
            }

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
     * 🔍 MAIN PARSER: Extract deal data from filing
     */
    async parseMAFiling(filing, feedType) {
        try {
            let docURL = filing.filingUrl || filing.link;
            
            if (!docURL) return null;

            docURL = docURL.replace('-index.htm', '.txt').replace('-index.html', '.txt');

            console.log(`📄 Parsing: ${filing.accessionNumber}`);

            const response = await fetch(docURL, {
                headers: { 'User-Agent': this.userAgent }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const text = await response.text();

            if (feedType === '8k' && !this.is8KMARelated(text)) {
                return null;
            }

            const dealData = {
                companyName: filing.companyName,
                cik: filing.cik,
                formType: filing.formType || feedType.toUpperCase(),
                filedDate: filing.filedDate,
                accessionNumber: filing.accessionNumber,
                filingUrl: filing.filingUrl,
                
                dealValue: this.extractDealValue(text),
                acquirerName: this.extractAcquirerName(text, filing),
                targetName: this.extractTargetName(text, filing),
                premium: this.extractPremium(text),
                evSales: this.extractMultiple(text, 'sales'),
                evEbitda: this.extractMultiple(text, 'ebitda'),
                sector: this.extractSector(text, filing),
                dealStatus: this.extractDealStatus(text, feedType),
                announcementDate: this.extractAnnouncementDate(text) || filing.filedDate,
                paymentMethod: this.extractPaymentMethod(text)
            };

            if (!dealData.dealValue) return null;

            return dealData;

        } catch (error) {
            console.error(`❌ Parse error for ${filing.accessionNumber}:`, error.message);
            return null;
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🔎 EXTRACTION FUNCTIONS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    is8KMARelated(text) {
        const lowerText = text.toLowerCase();
        const criticalItems = ['item 1.01', 'item 2.01', 'item 5.01'];
        const hasMAItem = criticalItems.some(item => lowerText.includes(item));
        const maKeywords = ['merger agreement', 'acquisition agreement', 'purchase agreement', 'definitive agreement'];
        const keywordCount = maKeywords.filter(keyword => lowerText.includes(keyword)).length;
        return hasMAItem || keywordCount >= 2;
    }

    extractDealValue(text) {
        const patterns = [
            /aggregate\s+(?:purchase\s+)?price\s+of\s+(?:approximately\s+)?\$?([\d,]+(?:\.\d+)?)\s*(million|billion)/i,
            /transaction\s+value\s+of\s+(?:approximately\s+)?\$?([\d,]+(?:\.\d+)?)\s*(million|billion)/i,
            /purchase\s+price\s+of\s+\$?([\d,]+(?:\.\d+)?)\s*(million|billion)/i,
            /consideration\s+of\s+\$?([\d,]+(?:\.\d+)?)\s*(million|billion)/i,
            /enterprise\s+value\s+of\s+\$?([\d,]+(?:\.\d+)?)\s*(million|billion)/i
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

    extractAcquirerName(text, filing) {
        const patterns = [
            /(?:the\s+)?acquirer[,\s:]+([A-Z][A-Za-z\s&,\.]+(?:Inc\.|Corp\.|Corporation|Company|LLC|Ltd\.))/i,
            /acquired\s+by\s+([A-Z][A-Za-z\s&,\.]+(?:Inc\.|Corp\.|Corporation|Company|LLC|Ltd\.))/i,
            /merger\s+with\s+([A-Z][A-Za-z\s&,\.]+(?:Inc\.|Corp\.|Corporation|Company|LLC|Ltd\.))/i
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) return this.cleanCompanyName(match[1]);
        }

        if (filing.formType === 'S-4' || filing.formType === 'DEFM14A') {
            return filing.companyName;
        }

        return 'Unknown Acquirer';
    }

    extractTargetName(text, filing) {
        const patterns = [
            /(?:the\s+)?target[,\s:]+([A-Z][A-Za-z\s&,\.]+(?:Inc\.|Corp\.|Corporation|Company|LLC|Ltd\.))/i,
            /acquisition\s+of\s+([A-Z][A-Za-z\s&,\.]+(?:Inc\.|Corp\.|Corporation|Company|LLC|Ltd\.))/i
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) return this.cleanCompanyName(match[1]);
        }

        if (filing.formType === '8-K' || filing.formType === '8K') {
            return filing.companyName;
        }

        return 'Unknown Target';
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

    extractSector(text, filing) {
        const sectors = {
            'Technology': ['software', 'saas', 'cloud', 'cyber', 'ai', 'semiconductor'],
            'Healthcare': ['pharma', 'biotech', 'medical', 'health', 'clinical'],
            'Financial Services': ['bank', 'insurance', 'fintech', 'asset management'],
            'Energy': ['oil', 'gas', 'renewable', 'energy'],
            'Consumer': ['retail', 'consumer', 'e-commerce'],
            'Industrial': ['manufacturing', 'industrial', 'aerospace']
        };

        const lowerText = text.toLowerCase();

        for (const [sector, keywords] of Object.entries(sectors)) {
            for (const keyword of keywords) {
                if (lowerText.includes(keyword)) return sector;
            }
        }

        return 'Other';
    }

    extractDealStatus(text, feedType) {
        const lowerText = text.toLowerCase();

        if (lowerText.includes('completed') || lowerText.includes('consummated')) return 'Completed';
        if (lowerText.includes('definitive agreement')) return 'Definitive Agreement';
        if (lowerText.includes('terminated')) return 'Terminated';

        if (feedType === 's4' || feedType === 'defm14a') return 'Pending';
        if (feedType === '8k' && lowerText.includes('item 2.01')) return 'Completed';

        return 'Announced';
    }

    extractAnnouncementDate(text) {
        const patterns = [
            /announced\s+on\s+([A-Z][a-z]+\s+\d{1,2},\s+\d{4})/i,
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

    extractPaymentMethod(text) {
        const lowerText = text.toLowerCase();
        const methods = [];
        
        if (lowerText.includes('all cash') || lowerText.includes('cash consideration')) methods.push('Cash');
        if (lowerText.includes('stock') || lowerText.includes('shares')) methods.push('Stock');
        
        if (methods.includes('Cash') && methods.includes('Stock')) return 'Cash + Stock';
        return methods.length > 0 ? methods.join(' + ') : 'Unknown';
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🔧 UTILITY FUNCTIONS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    cleanCompanyName(name) {
        return name.trim().replace(/\s{2,}/g, ' ').substring(0, 150);
    }

    calculateAverageMultiples(deals) {
        const validDeals = deals.filter(d => d.evSales && d.evEbitda);
        
        if (validDeals.length === 0) {
            return { evSales: null, evEbitda: null, premium: null };
        }

        const avgEvSales = validDeals.reduce((sum, d) => sum + d.evSales, 0) / validDeals.length;
        const avgEvEbitda = validDeals.reduce((sum, d) => sum + d.evEbitda, 0) / validDeals.length;
        const dealsWithPremium = deals.filter(d => d.premium);
        const avgPremium = dealsWithPremium.length > 0 
            ? dealsWithPremium.reduce((sum, d) => sum + d.premium, 0) / dealsWithPremium.length 
            : null;

        return {
            evSales: avgEvSales.toFixed(2) + 'x',
            evEbitda: avgEvEbitda.toFixed(2) + 'x',
            premium: avgPremium ? avgPremium.toFixed(1) + '%' : 'N/A'
        };
    }

    calculateDaysFromYear(year) {
        const now = new Date();
        const targetYear = parseInt(year);
        const yearStart = new Date(targetYear, 0, 1);
        return Math.ceil((now - yearStart) / (1000 * 60 * 60 * 24));
    }

    isInYear(dateString, year) {
        if (!dateString) return false;
        const date = new Date(dateString);
        return date.getFullYear().toString() === year;
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
        console.log('🧹 Cache cleared');
    }
}

// Instance globale
const maClient = new MAClient();

console.log('✅ M&A Client (Hybrid) loaded - REAL parsing enabled');