// /**
//  * ═══════════════════════════════════════════════════════════════════
//  * 📊 SEC FORM 4 API CLIENT - AlphaVault AI
//  * ═══════════════════════════════════════════════════════════════════
//  * Client spécialisé pour récupérer et analyser les Form 4 (Insider Trading)
//  * ═══════════════════════════════════════════════════════════════════
//  */

// class SECForm4Client {
//     constructor() {
//         // URLs de base
//         this.workerURL = 'https://sec-edgar-api.raphnardone.workers.dev';
        
//         // User-Agent obligatoire pour la SEC
//         this.userAgent = 'AlphaVault AI info@alphavault-ai.com';
        
//         // Cache intelligent
//         this.cache = new Map();
//         this.cacheDuration = 900000; // 15 minutes pour données temps réel
//     }

//     /**
//      * 🔧 Récupère le CIK depuis un ticker (VIA WORKER)
//      */
//     async getCIKFromTicker(ticker) {
//         const cacheKey = `cik-${ticker}`;
        
//         if (this.isCacheValid(cacheKey)) {
//             return this.cache.get(cacheKey).data;
//         }

//         try {
//             console.log(`🔍 Getting CIK for ${ticker} via Worker...`);
            
//             const response = await fetch(
//                 `${this.workerURL}/api/sec/ticker-to-cik?ticker=${ticker}`
//             );

//             if (!response.ok) {
//                 const errorData = await response.json();
//                 throw new Error(errorData.error || `Worker error: ${response.status}`);
//             }

//             const data = await response.json();
            
//             if (data.error) {
//                 throw new Error(data.error);
//             }

//             console.log(`✅ Got CIK for ${ticker}: ${data.cik}`);

//             this.cache.set(cacheKey, {
//                 data: data.cik,
//                 timestamp: Date.now()
//             });

//             return data.cik;

//         } catch (error) {
//             console.error(`❌ Error getting CIK for ${ticker}:`, error);
//             throw new Error(`CIK not found for ticker: ${ticker}`);
//         }
//     }

//     /**
//      * 🔍 Recherche Form 4 par CIK (VIA WORKER)
//      */
//     async getForm4ByCIK(cik, options = {}) {
//         const {
//             limit = 100,
//             startDate = null,
//             endDate = null
//         } = options;

//         try {
//             console.log(`🔍 Searching Form 4s for CIK: ${cik} via Worker`);
            
//             const response = await fetch(
//                 `${this.workerURL}/api/sec/form4/feed?cik=${cik}&limit=${limit}`
//             );

//             if (!response.ok) {
//                 throw new Error(`Worker error: ${response.status}`);
//             }

//             const data = await response.json();

//             let filings = data.filings || [];

//             if (startDate || endDate) {
//                 const start = startDate ? new Date(startDate) : new Date(0);
//                 const end = endDate ? new Date(endDate) : new Date();

//                 filings = filings.filter(f => {
//                     const date = new Date(f.updated || f.filedDate);
//                     return date >= start && date <= end;
//                 });
//             }

//             console.log(`✅ Found ${filings.length} Form 4 filings for CIK ${cik}`);

//             return filings;

//         } catch (error) {
//             console.error(`❌ Error fetching Form 4s for CIK ${cik}:`, error);
//             throw error;
//         }
//     }

//     /**
//      * 📄 Récupère le XML complet d'un Form 4 (VIA WORKER)
//      */
//     async getForm4XML(accessionNumber, cik) {
//         const cacheKey = `form4-xml-${accessionNumber}`;

//         if (this.isCacheValid(cacheKey)) {
//             console.log('📦 Returning cached XML');
//             return this.cache.get(cacheKey).data;
//         }

//         try {
//             console.log(`🌐 Fetching Form 4 XML via Worker: ${accessionNumber}`);
            
//             const response = await fetch(
//                 `${this.workerURL}/api/sec/form4/xml?accession=${accessionNumber}&cik=${cik}`
//             );

//             if (!response.ok) {
//                 const errorData = await response.json().catch(() => ({}));
//                 console.error('❌ Worker returned error:', errorData);
//                 throw new Error(`Worker error: ${response.status}`);
//             }

//             const xmlText = await response.text();

//             this.cache.set(cacheKey, {
//                 data: xmlText,
//                 timestamp: Date.now()
//             });

//             console.log(`✅ Got Form 4 XML for ${accessionNumber}`);

//             return xmlText;

//         } catch (error) {
//             console.error(`❌ Error fetching Form 4 XML ${accessionNumber}:`, error);
//             throw error;
//         }
//     }

//     /**
//      * 📊 Récupère l'historique complet des insiders d'une entreprise
//      */
//     async getCompanyInsiderHistory(ticker, months = 12) {
//         try {
//             console.log(`📊 Fetching insider history for ${ticker} (${months} months)`);
            
//             // 1. Récupère le CIK
//             const cik = await this.getCIKFromTicker(ticker);
            
//             // 2. Calcule les dates
//             const endDate = new Date();
//             const startDate = new Date();
//             startDate.setMonth(startDate.getMonth() - months);

//             // 3. Récupère tous les Form 4
//             const filings = await this.getForm4ByCIK(cik, {
//                 limit: 500,
//                 startDate: this.formatDate(startDate),
//                 endDate: this.formatDate(endDate)
//             });

//             console.log(`📄 Got ${filings.length} Form 4 filings for ${ticker}`);

//             if (filings.length > 0) {
//                 console.log('🔍 First filing structure:', filings[0]);
//             }

//             // 4. Parse chaque Form 4 pour extraire les détails
//             const transactions = [];
//             let successCount = 0;
//             let errorCount = 0;

//             for (const filing of filings.slice(0, 50)) {
//                 try {
//                     const accessionNumber = filing.accessionNumber;
                    
//                     if (!accessionNumber) {
//                         console.warn(`⚠ Missing accessionNumber for filing:`, filing);
//                         errorCount++;
//                         continue;
//                     }

//                     console.log(`🌐 Fetching Form 4 XML via Worker: ${accessionNumber}`);

//                     const xmlText = await this.getForm4XML(accessionNumber, cik);
                    
//                     if (!xmlText || xmlText.includes('error')) {
//                         console.warn(`⚠ Invalid XML for ${accessionNumber}`);
//                         errorCount++;
//                         continue;
//                     }

//                     const parsedData = window.Form4Parser?.parse(xmlText);
                    
//                     if (parsedData) {
//                         transactions.push({
//                             ...parsedData,
//                             filingDate: filing.updated || filing.filedDate,
//                             accessionNumber: accessionNumber
//                         });
//                         successCount++;
//                     } else {
//                         errorCount++;
//                     }
//                 } catch (error) {
//                     console.warn(`⚠ Error parsing Form 4 ${filing.accessionNumber}:`, error.message);
//                     errorCount++;
//                 }

//                 // Petit délai pour éviter rate limiting
//                 await new Promise(resolve => setTimeout(resolve, 100));
//             }

//             console.log(`✅ Successfully parsed ${successCount} transactions (${errorCount} errors)`);

//             return {
//                 ticker,
//                 cik,
//                 period: { start: startDate, end: endDate },
//                 transactionCount: transactions.length,
//                 transactions,
//                 stats: {
//                     totalFilings: filings.length,
//                     parsedSuccessfully: successCount,
//                     parseErrors: errorCount
//                 }
//             };

//         } catch (error) {
//             console.error(`❌ Error fetching insider history for ${ticker}:`, error);
//             throw error;
//         }
//     }

//     /**
//      * 🎯 Détection de "Cluster Buying"
//      */
//     async detectClusterActivity(ticker, windowDays = 7) {
//         try {
//             const history = await this.getCompanyInsiderHistory(ticker, 6);
//             const clusters = [];

//             const transactions = history.transactions;
            
//             for (let i = 0; i < transactions.length; i++) {
//                 const baseTransaction = transactions[i];
//                 const baseDate = new Date(baseTransaction.filingDate);

//                 const cluster = transactions.filter(t => {
//                     const tDate = new Date(t.filingDate);
//                     const daysDiff = Math.abs((tDate - baseDate) / (1000 * 60 * 60 * 24));
//                     return daysDiff <= windowDays && t.transactionType === 'Purchase';
//                 });

//                 if (cluster.length >= 3) {
//                     const uniqueInsiders = new Set(cluster.map(c => c.reportingOwner?.name));
//                     if (uniqueInsiders.size >= 3) {
//                         clusters.push({
//                             startDate: baseDate,
//                             insiderCount: uniqueInsiders.size,
//                             transactionCount: cluster.length,
//                             totalValue: cluster.reduce((sum, c) => sum + (c.totalValue || 0), 0),
//                             transactions: cluster,
//                             signal: 'BULLISH',
//                             confidence: this.calculateClusterConfidence(cluster)
//                         });
//                     }
//                 }
//             }

//             return this.deduplicateClusters(clusters);

//         } catch (error) {
//             console.error('❌ Cluster detection error:', error);
//             throw error;
//         }
//     }

//     /**
//      * 🔧 UTILITY FUNCTIONS
//      */

//     formatDate(date) {
//         return date.toISOString().split('T')[0];
//     }

//     calculateClusterConfidence(cluster) {
//         const insiderCount = new Set(cluster.map(c => c.reportingOwner?.name)).size;
//         const totalValue = cluster.reduce((sum, c) => sum + (c.totalValue || 0), 0);
        
//         let score = 50;
//         score += Math.min(insiderCount * 10, 30);
//         score += totalValue > 1000000 ? 20 : totalValue > 100000 ? 10 : 0;
        
//         return Math.min(score, 100);
//     }

//     deduplicateClusters(clusters) {
//         return clusters.filter((cluster, index) => {
//             return !clusters.some((other, otherIndex) => {
//                 if (index >= otherIndex) return false;
//                 const timeDiff = Math.abs(cluster.startDate - other.startDate) / (1000 * 60 * 60 * 24);
//                 return timeDiff < 7 && other.insiderCount > cluster.insiderCount;
//             });
//         });
//     }

//     isCacheValid(key) {
//         if (!this.cache.has(key)) return false;
//         const cached = this.cache.get(key);
//         return (Date.now() - cached.timestamp) < this.cacheDuration;
//     }

//     clearCache() {
//         this.cache.clear();
//         console.log('🧹 Cache cleared');
//     }
// }

// // Export global
// window.SECForm4Client = SECForm4Client;

/**
 * ═══════════════════════════════════════════════════════════════════
 * 📊 SEC FORM 4 API CLIENT - AlphaVault AI (VERSION CONFIGURABLE)
 * ═══════════════════════════════════════════════════════════════════
 * Client spécialisé pour récupérer et analyser les Form 4 (Insider Trading)
 * ✅ CONFIGURABLE PAR L'UTILISATEUR (nombre de filings + période)
 * ✅ PAGINATION AUTOMATIQUE
 * ✅ RATE LIMITING RESPECTÉ
 * ═══════════════════════════════════════════════════════════════════
 */

class SECForm4Client {
    constructor() {
        this.workerURL = 'https://sec-edgar-api.raphnardone.workers.dev';
        this.userAgent = 'AlphaVault AI info@alphavault-ai.com';
        this.cache = new Map();
        this.cacheDuration = 900000; // 15 minutes
    }

    /**
     * 🚀 NOUVELLE MÉTHODE : Charge TOUTES les transactions des X derniers jours
     */
    async getAllForm4Transactions(options = {}) {
        const {
            maxTransactions = 100,
            days = 90,
            forceRefresh = false
        } = options;

        console.log(`🌐 Loading Form 4 transactions (max ${maxTransactions} from last ${days} days)...`);

        const cacheKey = `all-form4-${days}-${maxTransactions}`;
        
        if (!forceRefresh && this.isCacheValid(cacheKey)) {
            console.log('📦 Returning cached ALL transactions');
            return this.cache.get(cacheKey).data;
        }

        let allFilings = [];
        let start = 0;
        const limit = 100; // SEC limite à 100 max par requête
        let hasMore = true;

        try {
            // ✅ PAGINATION : Continue jusqu'à atteindre la limite ou épuiser les données
            while (hasMore && allFilings.length < maxTransactions) {
                console.log(`📥 Fetching batch ${Math.floor(start / limit) + 1} (start=${start})...`);

                const response = await fetch(
                    `${this.workerURL}/api/sec/form4/feed?limit=${limit}&start=${start}&days=${days}`
                );

                if (!response.ok) {
                    console.error(`❌ Worker error at start=${start}:`, response.status);
                    break;
                }

                const data = await response.json();
                
                if (!data.filings || data.filings.length === 0) {
                    console.log('✅ No more filings available');
                    hasMore = false;
                    break;
                }

                allFilings.push(...data.filings);
                console.log(`   ✅ Got ${data.filings.length} filings (total: ${allFilings.length})`);

                // Vérifie si le Worker indique qu'il y a plus de données
                hasMore = data.hasMore !== false && data.filings.length === limit;
                start += limit;

                // Petit délai pour respecter le rate limiting SEC (10 req/sec max)
                await this.sleep(150);
            }

            console.log(`🎉 Total loaded: ${allFilings.length} Form 4 filings`);

            // Cache le résultat
            this.cache.set(cacheKey, {
                data: allFilings,
                timestamp: Date.now()
            });

            return allFilings;

        } catch (error) {
            console.error('❌ Error loading ALL Form 4 transactions:', error);
            throw error;
        }
    }

    /**
     * 🔧 Récupère le CIK depuis un ticker (VIA WORKER)
     */
    async getCIKFromTicker(ticker) {
        const cacheKey = `cik-${ticker}`;
        
        if (this.isCacheValid(cacheKey)) {
            return this.cache.get(cacheKey).data;
        }

        try {
            console.log(`🔍 Getting CIK for ${ticker} via Worker...`);
            
            const response = await fetch(
                `${this.workerURL}/api/sec/ticker-to-cik?ticker=${ticker}`
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Worker error: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }

            console.log(`✅ Got CIK for ${ticker}: ${data.cik}`);

            this.cache.set(cacheKey, {
                data: data.cik,
                timestamp: Date.now()
            });

            return data.cik;

        } catch (error) {
            console.error(`❌ Error getting CIK for ${ticker}:`, error);
            throw new Error(`CIK not found for ticker: ${ticker}`);
        }
    }

    /**
     * 🔍 Recherche Form 4 par CIK (VIA WORKER) - AVEC PAGINATION AUTOMATIQUE
     */
    async getForm4ByCIK(cik, options = {}) {
        const {
            limit = 100,
            startDate = null,
            endDate = null
        } = options;

        try {
            console.log(`🔍 Searching Form 4s for CIK: ${cik} via Worker (max ${limit})...`);
            
            let allFilings = [];
            let start = 0;
            const batchSize = 100; // SEC limite par requête
            let hasMore = true;

            // ✅ PAGINATION AUTOMATIQUE avec limite
            while (hasMore && allFilings.length < limit) {
                const remaining = limit - allFilings.length;
                const currentBatch = Math.min(batchSize, remaining);

                const response = await fetch(
                    `${this.workerURL}/api/sec/form4/feed?cik=${cik}&limit=${currentBatch}&start=${start}`
                );

                if (!response.ok) {
                    console.warn(`⚠ Worker error at start=${start}: ${response.status}`);
                    break;
                }

                const data = await response.json();
                
                if (!data.filings || data.filings.length === 0) {
                    hasMore = false;
                    break;
                }

                allFilings.push(...data.filings);
                console.log(`   📥 Batch ${Math.floor(start / batchSize) + 1}: ${data.filings.length} filings (total: ${allFilings.length})`);

                hasMore = data.filings.length === currentBatch && allFilings.length < limit;
                start += batchSize;

                await this.sleep(150); // Rate limiting
            }

            let filings = allFilings;

            // Filtre par date si nécessaire
            if (startDate || endDate) {
                const start = startDate ? new Date(startDate) : new Date(0);
                const end = endDate ? new Date(endDate) : new Date();

                filings = filings.filter(f => {
                    const date = new Date(f.updated || f.filedDate);
                    return date >= start && date <= end;
                });
            }

            console.log(`✅ Found ${filings.length} Form 4 filings for CIK ${cik}`);

            return filings;

        } catch (error) {
            console.error(`❌ Error fetching Form 4s for CIK ${cik}:`, error);
            throw error;
        }
    }

    /**
     * 📄 Récupère le XML complet d'un Form 4 (VIA WORKER)
     */
    async getForm4XML(accessionNumber, cik) {
        const cacheKey = `form4-xml-${accessionNumber}`;

        if (this.isCacheValid(cacheKey)) {
            console.log('📦 Returning cached XML');
            return this.cache.get(cacheKey).data;
        }

        try {
            console.log(`🌐 Fetching Form 4 XML via Worker: ${accessionNumber}`);
            
            const response = await fetch(
                `${this.workerURL}/api/sec/form4/xml?accession=${accessionNumber}&cik=${cik}`
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('❌ Worker returned error:', errorData);
                throw new Error(`Worker error: ${response.status}`);
            }

            const xmlText = await response.text();

            this.cache.set(cacheKey, {
                data: xmlText,
                timestamp: Date.now()
            });

            console.log(`✅ Got Form 4 XML for ${accessionNumber}`);

            return xmlText;

        } catch (error) {
            console.error(`❌ Error fetching Form 4 XML ${accessionNumber}:`, error);
            throw error;
        }
    }

    /**
     * 📊 Récupère l'historique complet des insiders d'une entreprise
     * ✅ CONFIGURABLE : maxFilings et months
     */
    async getCompanyInsiderHistory(ticker, months = 12, options = {}) {
        const {
            maxFilings = 100, // ✅ Valeur par défaut raisonnable
            verbose = false // ✅ Désactive les logs détaillés par défaut
        } = options;

        try {
            console.log(`📊 Fetching insider history for ${ticker} (${months} months, max ${maxFilings} filings)`);
            
            const cik = await this.getCIKFromTicker(ticker);
            
            const endDate = new Date();
            const startDate = new Date();
            startDate.setMonth(startDate.getMonth() - months);

            const filings = await this.getForm4ByCIK(cik, {
                limit: maxFilings, // ✅ Utilise la limite de l'utilisateur
                startDate: this.formatDate(startDate),
                endDate: this.formatDate(endDate)
            });

            console.log(`📄 Got ${filings.length} Form 4 filings for ${ticker}`);

            if (filings.length > 0 && verbose) {
                console.log('🔍 First filing structure:', filings[0]);
            }

            const transactions = [];
            let successCount = 0;
            let errorCount = 0;

            console.log(`🔄 Processing ${filings.length} Form 4 filings...`);

            for (const filing of filings) {
                try {
                    const accessionNumber = filing.accessionNumber;
                    
                    if (!accessionNumber) {
                        console.warn(`⚠ Missing accessionNumber for filing:`, filing);
                        errorCount++;
                        continue;
                    }

                    if (verbose) {
                        console.log(`🌐 Fetching Form 4 XML via Worker: ${accessionNumber}`);
                    }

                    const xmlText = await this.getForm4XML(accessionNumber, cik);
                    
                    if (!xmlText || xmlText.includes('error')) {
                        console.warn(`⚠ Invalid XML for ${accessionNumber}`);
                        errorCount++;
                        continue;
                    }

                    const parsedData = window.Form4Parser?.parse(xmlText);
                    
                    if (parsedData) {
                        transactions.push({
                            ...parsedData,
                            filingDate: filing.updated || filing.filedDate,
                            accessionNumber: accessionNumber
                        });
                        successCount++;
                        
                        // ✅ Affiche la progression tous les 25 filings
                        if (successCount % 25 === 0) {
                            console.log(`   ✅ Progress: ${successCount}/${filings.length} parsed`);
                        }
                    } else {
                        errorCount++;
                    }
                } catch (error) {
                    console.warn(`⚠ Error parsing Form 4 ${filing.accessionNumber}:`, error.message);
                    errorCount++;
                }

                await this.sleep(100); // Rate limiting
            }

            console.log(`✅ Successfully parsed ${successCount} transactions (${errorCount} errors)`);

            return {
                ticker,
                cik,
                period: { start: startDate, end: endDate },
                transactionCount: transactions.length,
                transactions,
                stats: {
                    totalFilings: filings.length,
                    filingsProcessed: filings.length,
                    parsedSuccessfully: successCount,
                    parseErrors: errorCount,
                    successRate: filings.length > 0 ? Math.round((successCount / filings.length) * 100) : 0
                }
            };

        } catch (error) {
            console.error(`❌ Error fetching insider history for ${ticker}:`, error);
            throw error;
        }
    }

    /**
     * 🎯 Détection de "Cluster Buying"
     */
    async detectClusterActivity(ticker, windowDays = 7) {
        try {
            const history = await this.getCompanyInsiderHistory(ticker, 6);
            const clusters = [];

            const transactions = history.transactions;
            
            for (let i = 0; i < transactions.length; i++) {
                const baseTransaction = transactions[i];
                const baseDate = new Date(baseTransaction.filingDate);

                const cluster = transactions.filter(t => {
                    const tDate = new Date(t.filingDate);
                    const daysDiff = Math.abs((tDate - baseDate) / (1000 * 60 * 60 * 24));
                    return daysDiff <= windowDays && t.transactionType === 'Purchase';
                });

                if (cluster.length >= 3) {
                    const uniqueInsiders = new Set(cluster.map(c => c.reportingOwner?.name));
                    if (uniqueInsiders.size >= 3) {
                        clusters.push({
                            startDate: baseDate,
                            insiderCount: uniqueInsiders.size,
                            transactionCount: cluster.length,
                            totalValue: cluster.reduce((sum, c) => sum + (c.totalValue || 0), 0),
                            transactions: cluster,
                            signal: 'BULLISH',
                            confidence: this.calculateClusterConfidence(cluster)
                        });
                    }
                }
            }

            return this.deduplicateClusters(clusters);

        } catch (error) {
            console.error('❌ Cluster detection error:', error);
            throw error;
        }
    }

    /**
     * 🔧 UTILITY FUNCTIONS
     */

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    calculateClusterConfidence(cluster) {
        const insiderCount = new Set(cluster.map(c => c.reportingOwner?.name)).size;
        const totalValue = cluster.reduce((sum, c => sum + (c.totalValue || 0), 0);
        
        let score = 50;
        score += Math.min(insiderCount * 10, 30);
        score += totalValue > 1000000 ? 20 : totalValue > 100000 ? 10 : 0;
        
        return Math.min(score, 100);
    }

    deduplicateClusters(clusters) {
        return clusters.filter((cluster, index) => {
            return !clusters.some((other, otherIndex) => {
                if (index >= otherIndex) return false;
                const timeDiff = Math.abs(cluster.startDate - other.startDate) / (1000 * 60 * 60 * 24);
                return timeDiff < 7 && other.insiderCount > cluster.insiderCount;
            });
        });
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

// Export global
window.SECForm4Client = SECForm4Client;