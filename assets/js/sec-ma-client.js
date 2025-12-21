// // /**
// //  * ═══════════════════════════════════════════════════════════════════
// //  * 🤝 SEC M&A CLIENT - API DATA LAYER
// //  * ═══════════════════════════════════════════════════════════════════
// //  * Client pour récupérer les données Form S-4 et 8-K depuis le Worker
// //  * + Document Parsing via Worker (CORS-free)
// //  * ═══════════════════════════════════════════════════════════════════
// //  */

// // class SECMAClient {
// //     constructor(config = {}) {
// //         this.workerURL = config.workerURL || 'https://sec-edgar-api.raphnardone.workers.dev';
// //         this.cache = new Map();
// //         this.cacheTTL = config.cacheTTL || 300000; // 5 minutes
// //         this.requestQueue = [];
// //         this.isProcessing = false;
// //         this.rateLimit = config.rateLimit || 200; // ms entre requêtes
        
// //         console.log('🤝 SEC M&A Client initialized:', this.workerURL);
// //     }

// //     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// //     // 🌐 CORE REQUEST HANDLER
// //     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// //     /**
// //      * Generic API request with caching and rate limiting
// //      */
// //     async request(endpoint, options = {}) {
// //         const cacheKey = `${endpoint}-${JSON.stringify(options)}`;
        
// //         // Check cache
// //         if (!options.forceRefresh) {
// //             const cached = this.getFromCache(cacheKey);
// //             if (cached) {
// //                 console.log('📦 Cache HIT:', endpoint);
// //                 return cached;
// //             }
// //         }

// //         // Add to queue
// //         return new Promise((resolve, reject) => {
// //             this.requestQueue.push({ endpoint, options, cacheKey, resolve, reject });
// //             this.processQueue();
// //         });
// //     }

// //     /**
// //      * Process request queue with rate limiting
// //      */
// //     async processQueue() {
// //         if (this.isProcessing || this.requestQueue.length === 0) return;
        
// //         this.isProcessing = true;
        
// //         while (this.requestQueue.length > 0) {
// //             const { endpoint, options, cacheKey, resolve, reject } = this.requestQueue.shift();
            
// //             try {
// //                 const params = new URLSearchParams(options.params || {});
// //                 if (options.forceRefresh) {
// //                     params.set('_t', Date.now());
// //                 }
                
// //                 const url = `${this.workerURL}${endpoint}?${params.toString()}`;
// //                 console.log('🌐 Fetching:', url);
                
// //                 const response = await fetch(url, {
// //                     method: options.method || 'GET',
// //                     headers: {
// //                         'Content-Type': 'application/json',
// //                         ...options.headers
// //                     }
// //                 });

// //                 if (!response.ok) {
// //                     throw new Error(`HTTP ${response.status}: ${response.statusText}`);
// //                 }

// //                 const data = await response.json();
                
// //                 // Cache result
// //                 this.setCache(cacheKey, data);
                
// //                 resolve(data);
                
// //                 // Rate limit
// //                 if (this.requestQueue.length > 0) {
// //                     await this.sleep(this.rateLimit);
// //                 }
                
// //             } catch (error) {
// //                 console.error('❌ Request failed:', endpoint, error);
// //                 reject(error);
// //             }
// //         }
        
// //         this.isProcessing = false;
// //     }

// //     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// //     // 📊 FORM S-4 ENDPOINTS (M&A Filings)
// //     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// //     /**
// //      * Get S-4 filings feed
// //      */
// //     async getS4Feed(params = {}) {
// //         const options = {
// //             params: {
// //                 limit: params.limit || 50,
// //                 cik: params.cik || ''
// //             },
// //             forceRefresh: params.forceRefresh || false
// //         };
        
// //         return this.request('/api/sec/s4/feed', options);
// //     }

// //     /**
// //      * Get S-4 document content with full parsing
// //      */
// //     async getS4Content(accession, cik) {
// //         if (!accession || !cik) {
// //             throw new Error('Accession number and CIK required');
// //         }
        
// //         return this.request('/api/sec/s4/content', {
// //             params: { accession, cik }
// //         });
// //     }

// //     /**
// //      * Bulk load S-4 filings
// //      */
// //     async getS4Bulk(params = {}) {
// //         const options = {
// //             params: {
// //                 days: params.days || 90,
// //                 max: params.max || 200
// //             }
// //         };
        
// //         return this.request('/api/sec/s4/bulk', options);
// //     }

// //     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// //     // 📊 FORM 8-K ENDPOINTS (Material Events)
// //     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// //     /**
// //      * Get 8-K filings feed
// //      */
// //     async get8KFeed(params = {}) {
// //         const options = {
// //             params: {
// //                 limit: params.limit || 100,
// //                 cik: params.cik || ''
// //             },
// //             forceRefresh: params.forceRefresh || false
// //         };
        
// //         return this.request('/api/sec/8k/feed', options);
// //     }

// //     /**
// //      * Get 8-K document content with full parsing
// //      */
// //     async get8KContent(accession, cik) {
// //         if (!accession || !cik) {
// //             throw new Error('Accession number and CIK required');
// //         }
        
// //         return this.request('/api/sec/8k/content', {
// //             params: { accession, cik }
// //         });
// //     }

// //     /**
// //      * Bulk load 8-K filings with Item filtering
// //      */
// //     async get8KBulk(params = {}) {
// //         const options = {
// //             params: {
// //                 days: params.days || 90,
// //                 max: params.max || 500,
// //                 items: params.items || '' // Ex: "1.01,2.01"
// //             }
// //         };
        
// //         return this.request('/api/sec/8k/bulk', options);
// //     }

// //     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// //     // 🤝 M&A ANALYTICS ENDPOINTS
// //     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// //     /**
// //      * Get recent M&A deals (combined S-4 + 8-K)
// //      */
// //     async getRecentDeals(params = {}) {
// //         const options = {
// //             params: {
// //                 days: params.days || 90,
// //                 minValue: params.minValue || 0
// //             }
// //         };
        
// //         return this.request('/api/sec/ma/recent-deals', options);
// //     }

// //     /**
// //      * Get material events categorized
// //      */
// //     async getMaterialEvents(params = {}) {
// //         const options = {
// //             params: {
// //                 days: params.days || 30,
// //                 cik: params.cik || ''
// //             }
// //         };
        
// //         return this.request('/api/sec/ma/material-events', options);
// //     }

// //     /**
// //      * Get company-specific M&A activity
// //      */
// //     async getCompanyMAActivity(cik, days = 365) {
// //         const [s4Data, eightKData] = await Promise.all([
// //             this.getS4Feed({ cik, limit: 100 }),
// //             this.get8KBulk({ days, items: '1.01,2.01' })
// //         ]);

// //         // Filter 8-K data by CIK
// //         const companyEightK = eightKData.filings?.filter(f => f.cik === cik) || [];

// //         return {
// //             cik,
// //             s4Filings: s4Data.filings || [],
// //             materialEvents: companyEightK,
// //             totalActivity: (s4Data.count || 0) + companyEightK.length,
// //             period: days
// //         };
// //     }

// //     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// //     // 🔍 TICKER & CIK UTILITIES
// //     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// //     /**
// //      * Convert ticker to CIK
// //      */
// //     async tickerToCIK(ticker) {
// //         return this.request('/api/sec/ticker-to-cik', {
// //             params: { ticker: ticker.toUpperCase() }
// //         });
// //     }

// //     /**
// //      * Batch ticker to CIK conversion
// //      */
// //     async batchTickerToCIK(tickers) {
// //         const results = {};
        
// //         for (const ticker of tickers) {
// //             try {
// //                 const data = await this.tickerToCIK(ticker);
// //                 results[ticker] = {
// //                     cik: data.cik,
// //                     companyName: data.companyName,
// //                     success: true
// //                 };
// //             } catch (error) {
// //                 results[ticker] = {
// //                     success: false,
// //                     error: error.message
// //                 };
// //             }
// //         }
        
// //         return results;
// //     }

// //     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// //     // 🧬 PARSING METHODS (Integration avec les parsers)
// //     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// //     /**
// //      * Parse S-4 XML content
// //      */
// //     parseS4Content(rawText) {
// //         if (typeof FormS4Parser === 'undefined') {
// //             console.error('❌ FormS4Parser not loaded');
// //             return { error: 'Parser not available' };
// //         }

// //         return FormS4Parser.parse(rawText);
// //     }

// //     /**
// //      * Parse 8-K XML content
// //      */
// //     parse8KContent(rawText) {
// //         if (typeof Form8KParser === 'undefined') {
// //             console.error('❌ Form8KParser not loaded');
// //             return { error: 'Parser not available' };
// //         }

// //         return Form8KParser.parse(rawText);
// //     }

// //     /**
// //      * Get S-4 content with enhanced parsing
// //      */
// //     async getS4ContentParsed(accession, cik) {
// //         const rawData = await this.getS4Content(accession, cik);
        
// //         if (rawData.rawContent) {
// //             const parsedEnhanced = this.parseS4Content(rawData.rawContent);
// //             return {
// //                 ...rawData,
// //                 parsedEnhanced
// //             };
// //         }

// //         return rawData;
// //     }

// //     /**
// //      * Get 8-K content with enhanced parsing
// //      */
// //     async get8KContentParsed(accession, cik) {
// //         const rawData = await this.get8KContent(accession, cik);
        
// //         if (rawData.rawContent) {
// //             const parsedEnhanced = this.parse8KContent(rawData.rawContent);
// //             return {
// //                 ...rawData,
// //                 parsedEnhanced
// //             };
// //         }

// //         return rawData;
// //     }

// //     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// //     // 📊 ADVANCED QUERIES
// //     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// //     /**
// //      * Get all M&A activity for multiple companies
// //      */
// //     async getPortfolioMAActivity(tickers, days = 90) {
// //         console.log('📊 Loading M&A activity for portfolio:', tickers);
        
// //         // Convert tickers to CIKs
// //         const cikMap = await this.batchTickerToCIK(tickers);
        
// //         const results = [];
        
// //         for (const [ticker, info] of Object.entries(cikMap)) {
// //             if (!info.success) {
// //                 console.warn(`⚠ Skipping ${ticker}: ${info.error}`);
// //                 continue;
// //             }
            
// //             try {
// //                 const activity = await this.getCompanyMAActivity(info.cik, days);
// //                 results.push({
// //                     ticker,
// //                     ...info,
// //                     activity
// //                 });
// //             } catch (error) {
// //                 console.error(`❌ Failed to load activity for ${ticker}:`, error);
// //             }
// //         }
        
// //         return results;
// //     }

// //     /**
// //      * Search for specific deal terms in S-4 filings
// //      */
// //     async searchDealTerms(searchParams = {}) {
// //         const s4Bulk = await this.getS4Bulk({
// //             days: searchParams.days || 180,
// //             max: searchParams.max || 200
// //         });

// //         const results = [];

// //         for (const filing of s4Bulk.filings || []) {
// //             try {
// //                 const content = await this.getS4ContentParsed(filing.accessionNumber, filing.cik);
// //                 const parsed = content.parsedEnhanced || content.parsed;

// //                 // Filter by criteria
// //                 let matches = true;

// //                 if (searchParams.minDealValue && (!parsed?.dealStructure?.dealValue || parsed.dealStructure.dealValue < searchParams.minDealValue)) {
// //                     matches = false;
// //                 }

// //                 if (searchParams.dealType && parsed?.dealStructure?.dealType !== searchParams.dealType) {
// //                     matches = false;
// //                 }

// //                 if (matches) {
// //                     results.push({
// //                         filing,
// //                         parsed
// //                     });
// //                 }

// //             } catch (error) {
// //                 console.error(`Failed to parse S-4 ${filing.accessionNumber}:`, error);
// //             }
// //         }

// //         return results;
// //     }

// //     /**
// //      * Get 8-K alerts by Item type
// //      */
// //     async get8KAlerts(itemNumbers = ['1.01', '2.01'], days = 7) {
// //         const data = await this.get8KBulk({
// //             days,
// //             items: itemNumbers.join(','),
// //             max: 500
// //         });

// //         return {
// //             count: data.count,
// //             alerts: data.filings || [],
// //             itemFilter: itemNumbers,
// //             period: days
// //         };
// //     }

// //     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// //     // 🔧 DOCUMENT PARSING VIA WORKER (CORS-FREE)
// //     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// //     /**
// //      * Parse any SEC document URL via Worker (bypasses CORS)
// //      * @param {string} url - Full SEC document URL
// //      * @returns {Promise<Object>} - Parsed document data
// //      */
// //     async getDocumentParsed(url) {
// //         if (!url) {
// //             throw new Error('Document URL is required');
// //         }

// //         console.log('📄 Requesting parsed document from Worker:', url);

// //         return this.request('/api/sec/parse-document', {
// //             params: { 
// //                 url: encodeURIComponent(url)
// //             }
// //         });
// //     }

// //     /**
// //      * Parse S-4 or 8-K by accession number (auto-detects URL)
// //      * @param {string} accession - Accession number (e.g., "0001437749-25-038382")
// //      * @param {string} cik - Company CIK
// //      * @param {string} formType - "S-4" or "8-K"
// //      */
// //     async getFilingParsed(accession, cik, formType = '8-K') {
// //         // Construct SEC URL
// //         const url = `https://www.sec.gov/cgi-bin/viewer?action=view&cik=${cik}&accession_number=${accession}&xbrl_type=v`;
        
// //         return this.getDocumentParsed(url);
// //     }

// //     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// //     // 💾 CACHE MANAGEMENT
// //     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// //     setCache(key, data) {
// //         this.cache.set(key, {
// //             data,
// //             timestamp: Date.now()
// //         });
// //     }

// //     getFromCache(key) {
// //         const cached = this.cache.get(key);
        
// //         if (!cached) return null;
        
// //         const age = Date.now() - cached.timestamp;
        
// //         if (age > this.cacheTTL) {
// //             this.cache.delete(key);
// //             return null;
// //         }
        
// //         return cached.data;
// //     }

// //     clearCache() {
// //         this.cache.clear();
// //         console.log('🗑 Cache cleared');
// //     }

// //     getCacheStats() {
// //         return {
// //             entries: this.cache.size,
// //             ttl: this.cacheTTL
// //         };
// //     }

// //     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// //     // 🛠 UTILITIES
// //     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// //     sleep(ms) {
// //         return new Promise(resolve => setTimeout(resolve, ms));
// //     }

// //     /**
// //      * Health check
// //      */
// //     async healthCheck() {
// //         try {
// //             const response = await fetch(`${this.workerURL}/health`);
// //             const data = await response.json();
// //             console.log('✅ Worker health check:', data);
// //             return data;
// //         } catch (error) {
// //             console.error('❌ Worker health check failed:', error);
// //             throw error;
// //         }
// //     }
// // }

// // // Export for use in other scripts
// // if (typeof window !== 'undefined') {
// //     window.SECMAClient = SECMAClient;
// // }

// /**
//  * ═══════════════════════════════════════════════════════════════════
//  * 🤝 SEC M&A CLIENT - API DATA LAYER
//  * ═══════════════════════════════════════════════════════════════════
//  * Client pour récupérer les données Form S-4 et 8-K depuis le Worker
//  * + Document Parsing via Worker (CORS-free)
//  * ✅ CORRECTION: Extraction correcte des dates depuis les liens SEC
//  * ═══════════════════════════════════════════════════════════════════
//  */

// class SECMAClient {
//     constructor(config = {}) {
//         this.workerURL = config.workerURL || 'https://sec-edgar-api.raphnardone.workers.dev';
//         this.cache = new Map();
//         this.cacheTTL = config.cacheTTL || 300000; // 5 minutes
//         this.requestQueue = [];
//         this.isProcessing = false;
//         this.rateLimit = config.rateLimit || 200; // ms entre requêtes
        
//         console.log('🤝 SEC M&A Client initialized:', this.workerURL);
//     }

//     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//     // 🌐 CORE REQUEST HANDLER
//     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

//     /**
//      * Generic API request with caching and rate limiting
//      */
//     async request(endpoint, options = {}) {
//         const cacheKey = `${endpoint}-${JSON.stringify(options)}`;
        
//         // Check cache
//         if (!options.forceRefresh) {
//             const cached = this.getFromCache(cacheKey);
//             if (cached) {
//                 console.log('📦 Cache HIT:', endpoint);
//                 return cached;
//             }
//         }

//         // Add to queue
//         return new Promise((resolve, reject) => {
//             this.requestQueue.push({ endpoint, options, cacheKey, resolve, reject });
//             this.processQueue();
//         });
//     }

//     /**
//      * Process request queue with rate limiting
//      */
//     async processQueue() {
//         if (this.isProcessing || this.requestQueue.length === 0) return;
        
//         this.isProcessing = true;
        
//         while (this.requestQueue.length > 0) {
//             const { endpoint, options, cacheKey, resolve, reject } = this.requestQueue.shift();
            
//             try {
//                 const params = new URLSearchParams(options.params || {});
//                 if (options.forceRefresh) {
//                     params.set('_t', Date.now());
//                 }
                
//                 const url = `${this.workerURL}${endpoint}?${params.toString()}`;
//                 console.log('🌐 Fetching:', url);
                
//                 const response = await fetch(url, {
//                     method: options.method || 'GET',
//                     headers: {
//                         'Content-Type': 'application/json',
//                         ...options.headers
//                     }
//                 });

//                 if (!response.ok) {
//                     throw new Error(`HTTP ${response.status}: ${response.statusText}`);
//                 }

//                 const data = await response.json();
                
//                 // Cache result
//                 this.setCache(cacheKey, data);
                
//                 resolve(data);
                
//                 // Rate limit
//                 if (this.requestQueue.length > 0) {
//                     await this.sleep(this.rateLimit);
//                 }
                
//             } catch (error) {
//                 console.error('❌ Request failed:', endpoint, error);
//                 reject(error);
//             }
//         }
        
//         this.isProcessing = false;
//     }

//     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//     // ✅ DATE EXTRACTION UTILITIES (NOUVEAU)
//     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

//     /**
//      * Extract correct filing date from SEC data
//      * @param {Object} filing - Filing object with various date fields
//      * @returns {string} - ISO date string (YYYY-MM-DD)
//      */
//     extractFilingDate(filing) {
//         // Method 1: Direct filedDate field
//         if (filing.filedDate && filing.filedDate !== 'Unknown' && this.isValidDate(filing.filedDate)) {
//             return this.normalizeDate(filing.filedDate);
//         }

//         // Method 2: acceptanceDateTime field
//         if (filing.acceptanceDateTime) {
//             return filing.acceptanceDateTime.split('T')[0];
//         }

//         // Method 3: Extract from accessionNumber (format: 0001234567-23-001234)
//         if (filing.accessionNumber) {
//             const dateFromAccession = this.extractDateFromAccession(filing.accessionNumber);
//             if (dateFromAccession) {
//                 return dateFromAccession;
//             }
//         }

//         // Method 4: Extract from filing link/URL
//         if (filing.link || filing.url) {
//             const url = filing.link || filing.url;
//             const dateFromURL = this.extractDateFromURL(url);
//             if (dateFromURL) {
//                 return dateFromURL;
//             }
//         }

//         // Method 5: Extract from filingDate field (alternative naming)
//         if (filing.filingDate && this.isValidDate(filing.filingDate)) {
//             return this.normalizeDate(filing.filingDate);
//         }

//         // Fallback: current date
//         console.warn('⚠ Could not extract date for filing, using current date:', filing);
//         return new Date().toISOString().split('T')[0];
//     }

//     /**
//      * Extract date from accession number
//      * Format: XXXXXXXXXX-YY-NNNNNN where YY is year
//      */
//     extractDateFromAccession(accessionNumber) {
//         if (!accessionNumber) return null;

//         // Standard format: 0001234567-23-001234
//         const match = accessionNumber.match(/\d{10}-(\d{2})-(\d{6})/);
        
//         if (match) {
//             const year = parseInt('20' + match[1]);
//             const sequence = match[2];
            
//             // The sequence number can give us an approximate date
//             // Most filings are sequential within a year
//             // We'll estimate based on the sequence number (rough approximation)
//             const dayOfYear = Math.min(Math.floor(parseInt(sequence) / 1000), 365);
            
//             const date = new Date(year, 0, 1);
//             date.setDate(date.getDate() + dayOfYear);
            
//             return date.toISOString().split('T')[0];
//         }

//         return null;
//     }

//     /**
//      * Extract date from SEC URL
//      * Format: /Archives/edgar/data/CIK/ACCESSION/...
//      */
//     extractDateFromURL(url) {
//         if (!url) return null;

//         // Try to find date pattern YYYYMMDD in URL
//         const dateMatch = url.match(/(\d{4})(\d{2})(\d{2})/);
        
//         if (dateMatch) {
//             const year = parseInt(dateMatch[1]);
//             const month = parseInt(dateMatch[2]);
//             const day = parseInt(dateMatch[3]);
            
//             // Validate date components
//             if (year >= 1990 && year <= 2100 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
//                 return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
//             }
//         }

//         return null;
//     }

//     /**
//      * Validate if a string is a valid date
//      */
//     isValidDate(dateString) {
//         if (!dateString) return false;
        
//         const date = new Date(dateString);
//         return date instanceof Date && !isNaN(date.getTime());
//     }

//     /**
//      * Normalize date to YYYY-MM-DD format
//      */
//     normalizeDate(dateString) {
//         const date = new Date(dateString);
        
//         if (isNaN(date.getTime())) {
//             return dateString;
//         }
        
//         const year = date.getFullYear();
//         const month = String(date.getMonth() + 1).padStart(2, '0');
//         const day = String(date.getDate()).padStart(2, '0');
        
//         return `${year}-${month}-${day}`;
//     }

//     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//     // 📊 FORM S-4 ENDPOINTS (M&A Filings)
//     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

//     /**
//      * Get S-4 filings feed
//      */
//     async getS4Feed(params = {}) {
//         const options = {
//             params: {
//                 limit: params.limit || 50,
//                 cik: params.cik || ''
//             },
//             forceRefresh: params.forceRefresh || false
//         };
        
//         const data = await this.request('/api/sec/s4/feed', options);
        
//         // ✅ CORRECTION: Extract correct dates
//         if (data.filings && Array.isArray(data.filings)) {
//             data.filings = data.filings.map(filing => ({
//                 ...filing,
//                 filedDate: this.extractFilingDate(filing)
//             }));
//         }
        
//         return data;
//     }

//     /**
//      * Get S-4 document content with full parsing
//      */
//     async getS4Content(accession, cik) {
//         if (!accession || !cik) {
//             throw new Error('Accession number and CIK required');
//         }
        
//         return this.request('/api/sec/s4/content', {
//             params: { accession, cik }
//         });
//     }

//     /**
//      * Bulk load S-4 filings
//      */
//     async getS4Bulk(params = {}) {
//         const options = {
//             params: {
//                 days: params.days || 90,
//                 max: params.max || 200
//             }
//         };
        
//         const data = await this.request('/api/sec/s4/bulk', options);
        
//         // ✅ CORRECTION: Extract correct dates
//         if (data.filings && Array.isArray(data.filings)) {
//             data.filings = data.filings.map(filing => ({
//                 ...filing,
//                 filedDate: this.extractFilingDate(filing)
//             }));
//         }
        
//         return data;
//     }

//     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//     // 📊 FORM 8-K ENDPOINTS (Material Events)
//     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

//     /**
//      * Get 8-K filings feed
//      */
//     async get8KFeed(params = {}) {
//         const options = {
//             params: {
//                 limit: params.limit || 100,
//                 cik: params.cik || ''
//             },
//             forceRefresh: params.forceRefresh || false
//         };
        
//         const data = await this.request('/api/sec/8k/feed', options);
        
//         // ✅ CORRECTION: Extract correct dates
//         if (data.filings && Array.isArray(data.filings)) {
//             data.filings = data.filings.map(filing => ({
//                 ...filing,
//                 filedDate: this.extractFilingDate(filing)
//             }));
//         }
        
//         return data;
//     }

//     /**
//      * Get 8-K document content with full parsing
//      */
//     async get8KContent(accession, cik) {
//         if (!accession || !cik) {
//             throw new Error('Accession number and CIK required');
//         }
        
//         return this.request('/api/sec/8k/content', {
//             params: { accession, cik }
//         });
//     }

//     /**
//      * Bulk load 8-K filings with Item filtering
//      */
//     async get8KBulk(params = {}) {
//         const options = {
//             params: {
//                 days: params.days || 90,
//                 max: params.max || 500,
//                 items: params.items || '' // Ex: "1.01,2.01"
//             }
//         };
        
//         const data = await this.request('/api/sec/8k/bulk', options);
        
//         // ✅ CORRECTION: Extract correct dates
//         if (data.filings && Array.isArray(data.filings)) {
//             data.filings = data.filings.map(filing => ({
//                 ...filing,
//                 filedDate: this.extractFilingDate(filing)
//             }));
//         }
        
//         return data;
//     }

//     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//     // 🤝 M&A ANALYTICS ENDPOINTS
//     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

//     /**
//      * Get recent M&A deals (combined S-4 + 8-K)
//      */
//     async getRecentDeals(params = {}) {
//         const options = {
//             params: {
//                 days: params.days || 90,
//                 minValue: params.minValue || 0
//             }
//         };
        
//         const data = await this.request('/api/sec/ma/recent-deals', options);
        
//         // ✅ CORRECTION: Extract correct dates
//         if (data.deals && Array.isArray(data.deals)) {
//             data.deals = data.deals.map(deal => ({
//                 ...deal,
//                 filedDate: this.extractFilingDate(deal)
//             }));
//         }
        
//         return data;
//     }

//     /**
//      * Get material events categorized
//      */
//     async getMaterialEvents(params = {}) {
//         const options = {
//             params: {
//                 days: params.days || 30,
//                 cik: params.cik || ''
//             }
//         };
        
//         return this.request('/api/sec/ma/material-events', options);
//     }

//     /**
//      * Get company-specific M&A activity
//      */
//     async getCompanyMAActivity(cik, days = 365) {
//         const [s4Data, eightKData] = await Promise.all([
//             this.getS4Feed({ cik, limit: 100 }),
//             this.get8KBulk({ days, items: '1.01,2.01' })
//         ]);

//         // Filter 8-K data by CIK
//         const companyEightK = eightKData.filings?.filter(f => f.cik === cik) || [];

//         return {
//             cik,
//             s4Filings: s4Data.filings || [],
//             materialEvents: companyEightK,
//             totalActivity: (s4Data.count || 0) + companyEightK.length,
//             period: days
//         };
//     }

//     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//     // 🔍 TICKER & CIK UTILITIES
//     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

//     /**
//      * Convert ticker to CIK
//      */
//     async tickerToCIK(ticker) {
//         return this.request('/api/sec/ticker-to-cik', {
//             params: { ticker: ticker.toUpperCase() }
//         });
//     }

//     /**
//      * Batch ticker to CIK conversion
//      */
//     async batchTickerToCIK(tickers) {
//         const results = {};
        
//         for (const ticker of tickers) {
//             try {
//                 const data = await this.tickerToCIK(ticker);
//                 results[ticker] = {
//                     cik: data.cik,
//                     companyName: data.companyName,
//                     success: true
//                 };
//             } catch (error) {
//                 results[ticker] = {
//                     success: false,
//                     error: error.message
//                 };
//             }
//         }
        
//         return results;
//     }

//     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//     // 🧬 PARSING METHODS (Integration avec les parsers)
//     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

//     /**
//      * Parse S-4 XML content
//      */
//     parseS4Content(rawText) {
//         if (typeof FormS4Parser === 'undefined') {
//             console.error('❌ FormS4Parser not loaded');
//             return { error: 'Parser not available' };
//         }

//         return FormS4Parser.parse(rawText);
//     }

//     /**
//      * Parse 8-K XML content
//      */
//     parse8KContent(rawText) {
//         if (typeof Form8KParser === 'undefined') {
//             console.error('❌ Form8KParser not loaded');
//             return { error: 'Parser not available' };
//         }

//         return Form8KParser.parse(rawText);
//     }

//     /**
//      * Get S-4 content with enhanced parsing
//      */
//     async getS4ContentParsed(accession, cik) {
//         const rawData = await this.getS4Content(accession, cik);
        
//         if (rawData.rawContent) {
//             const parsedEnhanced = this.parseS4Content(rawData.rawContent);
//             return {
//                 ...rawData,
//                 parsedEnhanced
//             };
//         }

//         return rawData;
//     }

//     /**
//      * Get 8-K content with enhanced parsing
//      */
//     async get8KContentParsed(accession, cik) {
//         const rawData = await this.get8KContent(accession, cik);
        
//         if (rawData.rawContent) {
//             const parsedEnhanced = this.parse8KContent(rawData.rawContent);
//             return {
//                 ...rawData,
//                 parsedEnhanced
//             };
//         }

//         return rawData;
//     }

//     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//     // 📊 ADVANCED QUERIES
//     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

//     /**
//      * Get all M&A activity for multiple companies
//      */
//     async getPortfolioMAActivity(tickers, days = 90) {
//         console.log('📊 Loading M&A activity for portfolio:', tickers);
        
//         // Convert tickers to CIKs
//         const cikMap = await this.batchTickerToCIK(tickers);
        
//         const results = [];
        
//         for (const [ticker, info] of Object.entries(cikMap)) {
//             if (!info.success) {
//                 console.warn(`⚠ Skipping ${ticker}: ${info.error}`);
//                 continue;
//             }
            
//             try {
//                 const activity = await this.getCompanyMAActivity(info.cik, days);
//                 results.push({
//                     ticker,
//                     ...info,
//                     activity
//                 });
//             } catch (error) {
//                 console.error(`❌ Failed to load activity for ${ticker}:`, error);
//             }
//         }
        
//         return results;
//     }

//     /**
//      * Search for specific deal terms in S-4 filings
//      */
//     async searchDealTerms(searchParams = {}) {
//         const s4Bulk = await this.getS4Bulk({
//             days: searchParams.days || 180,
//             max: searchParams.max || 200
//         });

//         const results = [];

//         for (const filing of s4Bulk.filings || []) {
//             try {
//                 const content = await this.getS4ContentParsed(filing.accessionNumber, filing.cik);
//                 const parsed = content.parsedEnhanced || content.parsed;

//                 // Filter by criteria
//                 let matches = true;

//                 if (searchParams.minDealValue && (!parsed?.dealStructure?.dealValue || parsed.dealStructure.dealValue < searchParams.minDealValue)) {
//                     matches = false;
//                 }

//                 if (searchParams.dealType && parsed?.dealStructure?.dealType !== searchParams.dealType) {
//                     matches = false;
//                 }

//                 if (matches) {
//                     results.push({
//                         filing,
//                         parsed
//                     });
//                 }

//             } catch (error) {
//                 console.error(`Failed to parse S-4 ${filing.accessionNumber}:`, error);
//             }
//         }

//         return results;
//     }

//     /**
//      * Get 8-K alerts by Item type
//      */
//     async get8KAlerts(itemNumbers = ['1.01', '2.01'], days = 7) {
//         const data = await this.get8KBulk({
//             days,
//             items: itemNumbers.join(','),
//             max: 500
//         });

//         return {
//             count: data.count,
//             alerts: data.filings || [],
//             itemFilter: itemNumbers,
//             period: days
//         };
//     }

//     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//     // 🔧 DOCUMENT PARSING VIA WORKER (CORS-FREE)
//     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

//     /**
//      * Parse any SEC document URL via Worker (bypasses CORS)
//      * @param {string} url - Full SEC document URL
//      * @returns {Promise<Object>} - Parsed document data
//      */
//     async getDocumentParsed(url) {
//         if (!url) {
//             throw new Error('Document URL is required');
//         }

//         console.log('📄 Requesting parsed document from Worker:', url);

//         return this.request('/api/sec/parse-document', {
//             params: { 
//                 url: encodeURIComponent(url)
//             }
//         });
//     }

//     /**
//      * Parse S-4 or 8-K by accession number (auto-detects URL)
//      * @param {string} accession - Accession number (e.g., "0001437749-25-038382")
//      * @param {string} cik - Company CIK
//      * @param {string} formType - "S-4" or "8-K"
//      */
//     async getFilingParsed(accession, cik, formType = '8-K') {
//         // Construct SEC URL
//         const url = `https://www.sec.gov/cgi-bin/viewer?action=view&cik=${cik}&accession_number=${accession}&xbrl_type=v`;
        
//         return this.getDocumentParsed(url);
//     }

//     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//     // 💾 CACHE MANAGEMENT
//     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

//     setCache(key, data) {
//         this.cache.set(key, {
//             data,
//             timestamp: Date.now()
//         });
//     }

//     getFromCache(key) {
//         const cached = this.cache.get(key);
        
//         if (!cached) return null;
        
//         const age = Date.now() - cached.timestamp;
        
//         if (age > this.cacheTTL) {
//             this.cache.delete(key);
//             return null;
//         }
        
//         return cached.data;
//     }

//     clearCache() {
//         this.cache.clear();
//         console.log('🗑 Cache cleared');
//     }

//     getCacheStats() {
//         return {
//             entries: this.cache.size,
//             ttl: this.cacheTTL
//         };
//     }

//     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//     // 🛠 UTILITIES
//     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

//     sleep(ms) {
//         return new Promise(resolve => setTimeout(resolve, ms));
//     }

//     /**
//      * Health check
//      */
//     async healthCheck() {
//         try {
//             const response = await fetch(`${this.workerURL}/health`);
//             const data = await response.json();
//             console.log('✅ Worker health check:', data);
//             return data;
//         } catch (error) {
//             console.error('❌ Worker health check failed:', error);
//             throw error;
//         }
//     }
// }

// // Export for use in other scripts
// if (typeof window !== 'undefined') {
//     window.SECMAClient = SECMAClient;
// }

/**
 * ═══════════════════════════════════════════════════════════════════
 * 🤝 SEC M&A CLIENT - API DATA LAYER (CORRECTED)
 * ═══════════════════════════════════════════════════════════════════
 * ✅ CORRECTIONS:
 * - Reduced default max from 500 to 250 (avoid HTTP2 errors)
 * - Enhanced error handling with retry logic
 * - Better logging for debugging
 * - Optimized date extraction
 * ═══════════════════════════════════════════════════════════════════
 */

class SECMAClient {
    constructor(config = {}) {
        this.workerURL = config.workerURL || 'https://sec-edgar-api.raphnardone.workers.dev';
        this.cache = new Map();
        this.cacheTTL = config.cacheTTL || 300000; // 5 minutes
        this.requestQueue = [];
        this.isProcessing = false;
        this.rateLimit = config.rateLimit || 200; // ms entre requêtes
        this.maxRetries = config.maxRetries || 2; // ✅ NOUVEAU
        
        console.log('🤝 SEC M&A Client initialized:', this.workerURL);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🌐 CORE REQUEST HANDLER (ENHANCED)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    async request(endpoint, options = {}) {
        const cacheKey = `${endpoint}-${JSON.stringify(options)}`;
        
        // Check cache
        if (!options.forceRefresh) {
            const cached = this.getFromCache(cacheKey);
            if (cached) {
                console.log('📦 Cache HIT:', endpoint);
                return cached;
            }
        }

        // Add to queue
        return new Promise((resolve, reject) => {
            this.requestQueue.push({ endpoint, options, cacheKey, resolve, reject, retries: 0 });
            this.processQueue();
        });
    }

    async processQueue() {
        if (this.isProcessing || this.requestQueue.length === 0) return;
        
        this.isProcessing = true;
        
        while (this.requestQueue.length > 0) {
            const { endpoint, options, cacheKey, resolve, reject, retries } = this.requestQueue.shift();
            
            try {
                const params = new URLSearchParams(options.params || {});
                if (options.forceRefresh) {
                    params.set('_t', Date.now());
                }
                
                const url = `${this.workerURL}${endpoint}?${params.toString()}`;
                console.log('🌐 Fetching:', url);
                
                // ✅ TIMEOUT DE SÉCURITÉ (30 secondes max)
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 30000);
                
                const response = await fetch(url, {
                    method: options.method || 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        ...options.headers
                    },
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                
                // Cache result
                this.setCache(cacheKey, data);
                
                resolve(data);
                
                // Rate limit
                if (this.requestQueue.length > 0) {
                    await this.sleep(this.rateLimit);
                }
                
            } catch (error) {
                console.error('❌ Request failed:', endpoint, error.message);
                
                // ✅ RETRY LOGIC
                if (retries < this.maxRetries && (error.name === 'AbortError' || error.message.includes('HTTP'))) {
                    console.log(`🔄 Retrying (${retries + 1}/${this.maxRetries})...`);
                    
                    // Re-add to queue with incremented retry count
                    this.requestQueue.unshift({ endpoint, options, cacheKey, resolve, reject, retries: retries + 1 });
                    
                    // Wait before retry (exponential backoff)
                    await this.sleep(1000 * (retries + 1));
                } else {
                    reject(error);
                }
            }
        }
        
        this.isProcessing = false;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ✅ DATE EXTRACTION UTILITIES
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    extractFilingDate(filing) {
        // Method 1: Direct filedDate field
        if (filing.filedDate && filing.filedDate !== 'Unknown' && this.isValidDate(filing.filedDate)) {
            return this.normalizeDate(filing.filedDate);
        }

        // Method 2: acceptanceDateTime field
        if (filing.acceptanceDateTime) {
            return filing.acceptanceDateTime.split('T')[0];
        }

        // Method 3: Extract from accessionNumber
        if (filing.accessionNumber) {
            const dateFromAccession = this.extractDateFromAccession(filing.accessionNumber);
            if (dateFromAccession) {
                return dateFromAccession;
            }
        }

        // Method 4: Extract from filing link/URL
        if (filing.link || filing.url) {
            const url = filing.link || filing.url;
            const dateFromURL = this.extractDateFromURL(url);
            if (dateFromURL) {
                return dateFromURL;
            }
        }

        // Method 5: Extract from filingDate field (alternative naming)
        if (filing.filingDate && this.isValidDate(filing.filingDate)) {
            return this.normalizeDate(filing.filingDate);
        }

        // Fallback: current date
        console.warn('⚠ Could not extract date for filing, using current date:', filing.accessionNumber);
        return new Date().toISOString().split('T')[0];
    }

    extractDateFromAccession(accessionNumber) {
        if (!accessionNumber) return null;

        const match = accessionNumber.match(/\d{10}-(\d{2})-(\d{6})/);
        
        if (match) {
            const year = parseInt('20' + match[1]);
            const sequence = match[2];
            
            const dayOfYear = Math.min(Math.floor(parseInt(sequence) / 1000), 365);
            
            const date = new Date(year, 0, 1);
            date.setDate(date.getDate() + dayOfYear);
            
            return date.toISOString().split('T')[0];
        }

        return null;
    }

    extractDateFromURL(url) {
        if (!url) return null;

        const dateMatch = url.match(/(\d{4})(\d{2})(\d{2})/);
        
        if (dateMatch) {
            const year = parseInt(dateMatch[1]);
            const month = parseInt(dateMatch[2]);
            const day = parseInt(dateMatch[3]);
            
            if (year >= 1990 && year <= 2100 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
                return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            }
        }

        return null;
    }

    isValidDate(dateString) {
        if (!dateString) return false;
        
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date.getTime());
    }

    normalizeDate(dateString) {
        const date = new Date(dateString);
        
        if (isNaN(date.getTime())) {
            return dateString;
        }
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📊 FORM S-4 ENDPOINTS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    async getS4Feed(params = {}) {
        const options = {
            params: {
                limit: params.limit || 50,
                cik: params.cik || ''
            },
            forceRefresh: params.forceRefresh || false
        };
        
        const data = await this.request('/api/sec/s4/feed', options);
        
        if (data.filings && Array.isArray(data.filings)) {
            data.filings = data.filings.map(filing => ({
                ...filing,
                filedDate: this.extractFilingDate(filing)
            }));
        }
        
        return data;
    }

    async getS4Content(accession, cik) {
        if (!accession || !cik) {
            throw new Error('Accession number and CIK required');
        }
        
        return this.request('/api/sec/s4/content', {
            params: { accession, cik }
        });
    }

    async getS4Bulk(params = {}) {
        const options = {
            params: {
                days: params.days || 90,
                max: params.max || 200 // ✅ RÉDUIT (était 500 avant)
            }
        };
        
        const data = await this.request('/api/sec/s4/bulk', options);
        
        if (data.filings && Array.isArray(data.filings)) {
            data.filings = data.filings.map(filing => ({
                ...filing,
                filedDate: this.extractFilingDate(filing)
            }));
        }
        
        return data;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📊 FORM 8-K ENDPOINTS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    async get8KFeed(params = {}) {
        const options = {
            params: {
                limit: params.limit || 100,
                cik: params.cik || ''
            },
            forceRefresh: params.forceRefresh || false
        };
        
        const data = await this.request('/api/sec/8k/feed', options);
        
        if (data.filings && Array.isArray(data.filings)) {
            data.filings = data.filings.map(filing => ({
                ...filing,
                filedDate: this.extractFilingDate(filing)
            }));
        }
        
        return data;
    }

    async get8KContent(accession, cik) {
        if (!accession || !cik) {
            throw new Error('Accession number and CIK required');
        }
        
        return this.request('/api/sec/8k/content', {
            params: { accession, cik }
        });
    }

    async get8KBulk(params = {}) {
        const options = {
            params: {
                days: params.days || 90,
                max: params.max || 250, // ✅ RÉDUIT DE 500 À 250 (évite les timeouts)
                items: params.items || ''
            }
        };
        
        console.log(`📊 Requesting 8-K bulk: ${options.params.days} days, max ${options.params.max} filings`);
        
        const data = await this.request('/api/sec/8k/bulk', options);
        
        if (data.filings && Array.isArray(data.filings)) {
            data.filings = data.filings.map(filing => ({
                ...filing,
                filedDate: this.extractFilingDate(filing)
            }));
        }
        
        return data;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🤝 M&A ANALYTICS ENDPOINTS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    async getRecentDeals(params = {}) {
        const options = {
            params: {
                days: params.days || 90,
                minValue: params.minValue || 0
            }
        };
        
        const data = await this.request('/api/sec/ma/recent-deals', options);
        
        if (data.deals && Array.isArray(data.deals)) {
            data.deals = data.deals.map(deal => ({
                ...deal,
                filedDate: this.extractFilingDate(deal)
            }));
        }
        
        return data;
    }

    async getMaterialEvents(params = {}) {
        const options = {
            params: {
                days: params.days || 30,
                cik: params.cik || ''
            }
        };
        
        return this.request('/api/sec/ma/material-events', options);
    }

    async getCompanyMAActivity(cik, days = 365) {
        const [s4Data, eightKData] = await Promise.all([
            this.getS4Feed({ cik, limit: 100 }),
            this.get8KBulk({ days, items: '1.01,2.01' })
        ]);

        const companyEightK = eightKData.filings?.filter(f => f.cik === cik) || [];

        return {
            cik,
            s4Filings: s4Data.filings || [],
            materialEvents: companyEightK,
            totalActivity: (s4Data.count || 0) + companyEightK.length,
            period: days
        };
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🔍 TICKER & CIK UTILITIES
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    async tickerToCIK(ticker) {
        return this.request('/api/sec/ticker-to-cik', {
            params: { ticker: ticker.toUpperCase() }
        });
    }

    async batchTickerToCIK(tickers) {
        const results = {};
        
        for (const ticker of tickers) {
            try {
                const data = await this.tickerToCIK(ticker);
                results[ticker] = {
                    cik: data.cik,
                    companyName: data.companyName,
                    success: true
                };
            } catch (error) {
                results[ticker] = {
                    success: false,
                    error: error.message
                };
            }
        }
        
        return results;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🧬 PARSING METHODS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    parseS4Content(rawText) {
        if (typeof FormS4Parser === 'undefined') {
            console.error('❌ FormS4Parser not loaded');
            return { error: 'Parser not available' };
        }

        return FormS4Parser.parse(rawText);
    }

    parse8KContent(rawText) {
        if (typeof Form8KParser === 'undefined') {
            console.error('❌ Form8KParser not loaded');
            return { error: 'Parser not available' };
        }

        return Form8KParser.parse(rawText);
    }

    async getS4ContentParsed(accession, cik) {
        const rawData = await this.getS4Content(accession, cik);
        
        if (rawData.rawContent) {
            const parsedEnhanced = this.parseS4Content(rawData.rawContent);
            return {
                ...rawData,
                parsedEnhanced
            };
        }

        return rawData;
    }

    async get8KContentParsed(accession, cik) {
        const rawData = await this.get8KContent(accession, cik);
        
        if (rawData.rawContent) {
            const parsedEnhanced = this.parse8KContent(rawData.rawContent);
            return {
                ...rawData,
                parsedEnhanced
            };
        }

        return rawData;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📊 ADVANCED QUERIES
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    async getPortfolioMAActivity(tickers, days = 90) {
        console.log('📊 Loading M&A activity for portfolio:', tickers);
        
        const cikMap = await this.batchTickerToCIK(tickers);
        
        const results = [];
        
        for (const [ticker, info] of Object.entries(cikMap)) {
            if (!info.success) {
                console.warn(`⚠ Skipping ${ticker}: ${info.error}`);
                continue;
            }
            
            try {
                const activity = await this.getCompanyMAActivity(info.cik, days);
                results.push({
                    ticker,
                    ...info,
                    activity
                });
            } catch (error) {
                console.error(`❌ Failed to load activity for ${ticker}:`, error);
            }
        }
        
        return results;
    }

    async searchDealTerms(searchParams = {}) {
        const s4Bulk = await this.getS4Bulk({
            days: searchParams.days || 180,
            max: searchParams.max || 200
        });

        const results = [];

        for (const filing of s4Bulk.filings || []) {
            try {
                const content = await this.getS4ContentParsed(filing.accessionNumber, filing.cik);
                const parsed = content.parsedEnhanced || content.parsed;

                let matches = true;

                if (searchParams.minDealValue && (!parsed?.dealStructure?.dealValue || parsed.dealStructure.dealValue < searchParams.minDealValue)) {
                    matches = false;
                }

                if (searchParams.dealType && parsed?.dealStructure?.dealType !== searchParams.dealType) {
                    matches = false;
                }

                if (matches) {
                    results.push({
                        filing,
                        parsed
                    });
                }

            } catch (error) {
                console.error(`Failed to parse S-4 ${filing.accessionNumber}:`, error);
            }
        }

        return results;
    }

    async get8KAlerts(itemNumbers = ['1.01', '2.01'], days = 7) {
        const data = await this.get8KBulk({
            days,
            items: itemNumbers.join(','),
            max: 250 // ✅ RÉDUIT (était 500)
        });

        return {
            count: data.count,
            alerts: data.filings || [],
            itemFilter: itemNumbers,
            period: days
        };
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🔧 DOCUMENT PARSING VIA WORKER
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    async getDocumentParsed(url) {
        if (!url) {
            throw new Error('Document URL is required');
        }

        console.log('📄 Requesting parsed document from Worker:', url);

        return this.request('/api/sec/parse-document', {
            params: { 
                url: encodeURIComponent(url)
            }
        });
    }

    async getFilingParsed(accession, cik, formType = '8-K') {
        const url = `https://www.sec.gov/cgi-bin/viewer?action=view&cik=${cik}&accession_number=${accession}&xbrl_type=v`;
        
        return this.getDocumentParsed(url);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 💾 CACHE MANAGEMENT
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    setCache(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    getFromCache(key) {
        const cached = this.cache.get(key);
        
        if (!cached) return null;
        
        const age = Date.now() - cached.timestamp;
        
        if (age > this.cacheTTL) {
            this.cache.delete(key);
            return null;
        }
        
        return cached.data;
    }

    clearCache() {
        this.cache.clear();
        console.log('🗑 Cache cleared');
    }

    getCacheStats() {
        return {
            entries: this.cache.size,
            ttl: this.cacheTTL
        };
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🛠 UTILITIES
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async healthCheck() {
        try {
            const response = await fetch(`${this.workerURL}/health`);
            const data = await response.json();
            console.log('✅ Worker health check:', data);
            return data;
        } catch (error) {
            console.error('❌ Worker health check failed:', error);
            throw error;
        }
    }
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.SECMAClient = SECMAClient;
}