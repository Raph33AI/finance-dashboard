/**
 * ═══════════════════════════════════════════════════════════════════
 * 📊 SEC FORM 4 API CLIENT - AlphaVault AI
 * ═══════════════════════════════════════════════════════════════════
 * Client spécialisé pour récupérer et analyser les Form 4 (Insider Trading)
 * ═══════════════════════════════════════════════════════════════════
 */

class SECForm4Client {
    constructor() {
        // URLs de base
        this.secBaseURL = 'https://www.sec.gov';
        this.edgarArchiveURL = 'https://www.sec.gov/cgi-bin/browse-edgar';
        this.workerURL = 'https://sec-edgar-api.raphnardone.workers.dev'; // Ton Worker
        
        // User-Agent obligatoire pour la SEC
        this.userAgent = 'AlphaVault AI info@alphavault-ai.com';
        
        // Cache intelligent
        this.cache = new Map();
        this.cacheDuration = 900000; // 15 minutes pour données temps réel
        
        // Rate limiting (10 requêtes/seconde max pour SEC)
        this.requestQueue = [];
        this.isProcessingQueue = false;
        this.requestDelay = 150; // 150ms entre chaque requête
    }

    /**
     * 🎯 Récupère les Form 4 récents (via RSS feed SEC)
     */
    async getRecentForm4s(options = {}) {
        const {
            limit = 100,
            forceRefresh = false,
            daysBack = 7
        } = options;

        const cacheKey = `form4-recent-${limit}-${daysBack}`;

        if (!forceRefresh && this.isCacheValid(cacheKey)) {
            console.log('📦 Returning cached Form 4s');
            return this.cache.get(cacheKey).data;
        }

        try {
            console.log('🌐 Fetching recent Form 4 filings from SEC...');
            
            // Utilise le RSS feed de la SEC pour Form 4
            const rssURL = `${this.secBaseURL}/cgi-bin/browse-edgar?action=getcurrent&CIK=&type=4&company=&dateb=&owner=include&start=0&count=${limit}&output=atom`;
            
            const response = await this.queueRequest(rssURL);
            const xmlText = await response.text();
            
            // Parse le XML RSS
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
            
            const entries = xmlDoc.getElementsByTagName('entry');
            const form4s = [];

            for (let i = 0; i < entries.length; i++) {
                const entry = entries[i];
                
                const filing = {
                    id: this.getXMLValue(entry, 'id'),
                    title: this.getXMLValue(entry, 'title'),
                    summary: this.getXMLValue(entry, 'summary'),
                    updated: this.getXMLValue(entry, 'updated'),
                    filingDate: new Date(this.getXMLValue(entry, 'updated')),
                    
                    // Extraction des détails depuis le summary
                    ...this.parseForm4Summary(this.getXMLValue(entry, 'summary')),
                    
                    // Lien vers le filing
                    link: entry.getElementsByTagName('link')[0]?.getAttribute('href') || '',
                };

                // Filtre par date
                const daysAgo = (Date.now() - filing.filingDate.getTime()) / (1000 * 60 * 60 * 24);
                if (daysAgo <= daysBack) {
                    form4s.push(filing);
                }
            }

            // Enrichissement des données
            const enrichedForm4s = await this.enrichForm4Data(form4s);

            const result = {
                count: enrichedForm4s.length,
                filings: enrichedForm4s,
                lastUpdated: new Date().toISOString()
            };

            this.cache.set(cacheKey, {
                data: result,
                timestamp: Date.now()
            });

            console.log(`✅ Fetched ${enrichedForm4s.length} Form 4 filings`);
            return result;

        } catch (error) {
            console.error('❌ Error fetching Form 4s:', error);
            throw error;
        }
    }

    /**
     * 📄 Récupère le XML complet d'un Form 4 spécifique
     */
    async getForm4XML(accessionNumber) {
        const cacheKey = `form4-xml-${accessionNumber}`;

        if (this.isCacheValid(cacheKey)) {
            return this.cache.get(cacheKey).data;
        }

        try {
            // Construction de l'URL du fichier XML
            const cleanAccession = accessionNumber.replace(/-/g, '');
            const xmlURL = `${this.secBaseURL}/Archives/edgar/data/${this.extractCIK(accessionNumber)}/${cleanAccession}/${accessionNumber}.xml`;

            console.log(`🌐 Fetching Form 4 XML: ${accessionNumber}`);
            
            const response = await this.queueRequest(xmlURL);
            const xmlText = await response.text();

            this.cache.set(cacheKey, {
                data: xmlText,
                timestamp: Date.now()
            });

            return xmlText;

        } catch (error) {
            console.error(`❌ Error fetching Form 4 XML ${accessionNumber}:`, error);
            
            // Fallback: essai d'une URL alternative
            try {
                const altURL = `${this.secBaseURL}/cgi-bin/viewer?action=view&cik=&accession_number=${accessionNumber}&xbrl_type=v`;
                const response = await this.queueRequest(altURL);
                return await response.text();
            } catch (e) {
                throw error;
            }
        }
    }

    async getForm4ByCIK(cik, options = {}) {
        const {
            limit = 100,
            startDate = null,
            endDate = null
        } = options;

        try {
            console.log(`🔍 Searching Form 4s for CIK: ${cik} via Worker`);
            
            const response = await fetch(
                `${this.workerURL}/api/sec/form4/feed?cik=${cik}&limit=${limit}`
            );

            if (!response.ok) {
                throw new Error(`Worker error: ${response.status}`);
            }

            const data = await response.json();

            // ✅ DEBUG: Affiche les données brutes
            console.log('🔍 Raw Worker response:', data);

            let filings = data.filings || [];

            // ✅ DEBUG: Affiche le premier filing
            if (filings.length > 0) {
                console.log('🔍 First filing from Worker:', filings[0]);
            }

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
     * 📊 Récupère l'historique complet des insiders d'une entreprise
     */
    async getCompanyInsiderHistory(ticker, months = 12) {
        try {
            console.log(`📊 Fetching insider history for ${ticker} (${months} months)`);
            
            // 1. Récupère le CIK depuis le ticker
            const cik = await this.getCIKFromTicker(ticker);
            
            // 2. Calcule les dates
            const endDate = new Date();
            const startDate = new Date();
            startDate.setMonth(startDate.getMonth() - months);

            // 3. Récupère tous les Form 4
            const filings = await this.getForm4ByCIK(cik, {
                limit: 500,
                startDate: this.formatDate(startDate),
                endDate: this.formatDate(endDate)
            });

            // 4. Parse chaque Form 4 pour extraire les détails
            const transactions = [];
            for (const filing of filings) {
                try {
                    const xmlText = await this.getForm4XML(filing.accessionNumber);
                    const parsedData = window.Form4Parser?.parse(xmlText);
                    if (parsedData) {
                        transactions.push({
                            ...parsedData,
                            filingDate: filing.filingDate,
                            accessionNumber: filing.accessionNumber
                        });
                    }
                } catch (error) {
                    console.warn(`⚠ Error parsing Form 4 ${filing.accessionNumber}:`, error);
                }
            }

            return {
                ticker,
                cik,
                period: { start: startDate, end: endDate },
                transactionCount: transactions.length,
                transactions
            };

        } catch (error) {
            console.error(`❌ Error fetching insider history for ${ticker}:`, error);
            throw error;
        }
    }

    /**
     * 🎯 Détection de "Cluster Buying" (plusieurs insiders achètent simultanément)
     */
    async detectClusterActivity(ticker, windowDays = 7) {
        try {
            const history = await this.getCompanyInsiderHistory(ticker, 6);
            const clusters = [];

            // Groupe les transactions par période de X jours
            const transactions = history.transactions;
            
            for (let i = 0; i < transactions.length; i++) {
                const baseTransaction = transactions[i];
                const baseDate = new Date(baseTransaction.filingDate);

                // Trouve toutes les transactions dans la fenêtre temporelle
                const cluster = transactions.filter(t => {
                    const tDate = new Date(t.filingDate);
                    const daysDiff = Math.abs((tDate - baseDate) / (1000 * 60 * 60 * 24));
                    return daysDiff <= windowDays && t.transactionType === 'Purchase';
                });

                // Si au moins 3 insiders achètent en même temps = cluster
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

            // Déduplique les clusters qui se chevauchent
            return this.deduplicateClusters(clusters);

        } catch (error) {
            console.error('❌ Cluster detection error:', error);
            throw error;
        }
    }

    /**
     * 🔧 Fonctions utilitaires
     */
    
    getXMLValue(element, tagName) {
        return element.getElementsByTagName(tagName)[0]?.textContent || '';
    }

    parseForm4Summary(summary) {
        // Extrait les informations depuis le summary HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(summary, 'text/html');
        
        return {
            companyName: doc.querySelector('.companyName')?.textContent?.trim() || '',
            cik: this.extractCIKFromSummary(summary),
            formType: '4',
            insiderName: this.extractInsiderName(summary)
        };
    }

    extractCIKFromSummary(summary) {
        const match = summary.match(/CIK=(\d+)/);
        return match ? match[1] : '';
    }

    extractInsiderName(summary) {
        const match = summary.match(/Filed by:\s*([^<]+)/);
        return match ? match[1].trim() : '';
    }

    extractAccessionFromLink(link) {
        const match = link?.match(/Accession-Number=([0-9-]+)/);
        return match ? match[1] : '';
    }

    extractCIK(accessionNumber) {
        // Le CIK est souvent au début de l'accession number
        return accessionNumber.split('-')[0];
    }

    async enrichForm4Data(form4s) {
        // Enrichissement futur avec données externes (prix, etc.)
        return form4s;
    }

    /**
     * 🔧 VERSION CORRIGÉE - utilise le Cloudflare Worker
     */
    async getCIKFromTicker(ticker) {
        const cacheKey = `cik-${ticker}`;
        
        if (this.isCacheValid(cacheKey)) {
            return this.cache.get(cacheKey).data;
        }

        try {
            console.log(`🔍 Getting CIK for ${ticker} via Worker...`);
            
            // ✅ Utilise le Worker au lieu de la SEC directement
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

            // Cache le résultat
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
     * 🔍 Recherche Form 4 par CIK (VIA WORKER)
     */
    async getForm4ByCIK(cik, options = {}) {
        const {
            limit = 100,
            startDate = null,
            endDate = null
        } = options;

        try {
            console.log(`🔍 Searching Form 4s for CIK: ${cik} via Worker`);
            
            // ✅ Utilise le Worker
            const response = await fetch(
                `${this.workerURL}/api/sec/form4/feed?cik=${cik}&limit=${limit}`
            );

            if (!response.ok) {
                throw new Error(`Worker error: ${response.status}`);
            }

            const data = await response.json();

            // Filtre par date si nécessaire
            let filings = data.filings || [];

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
            return this.cache.get(cacheKey).data;
        }

        try {
            console.log(`🌐 Fetching Form 4 XML via Worker: ${accessionNumber}`);
            
            // ✅ Utilise le Worker
            const response = await fetch(
                `${this.workerURL}/api/sec/form4/xml?accession=${accessionNumber}&cik=${cik}`
            );

            if (!response.ok) {
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
     */
    async getCompanyInsiderHistory(ticker, months = 12) {
        try {
            console.log(`📊 Fetching insider history for ${ticker} (${months} months)`);
            
            // 1. Récupère le CIK depuis le ticker (via Worker)
            const cik = await this.getCIKFromTicker(ticker);
            
            // 2. Calcule les dates
            const endDate = new Date();
            const startDate = new Date();
            startDate.setMonth(startDate.getMonth() - months);

            // 3. Récupère tous les Form 4 (via Worker)
            const filings = await this.getForm4ByCIK(cik, {
                limit: 500,
                startDate: this.formatDate(startDate),
                endDate: this.formatDate(endDate)
            });

            console.log(`📄 Got ${filings.length} Form 4 filings for ${ticker}`);

            // ✅ DEBUG: Affiche le premier filing pour vérifier la structure
            if (filings.length > 0) {
                console.log('🔍 First filing structure:', filings[0]);
            }

            // 4. Parse chaque Form 4 pour extraire les détails
            const transactions = [];
            let successCount = 0;
            let errorCount = 0;

            for (const filing of filings.slice(0, 50)) { // Limite à 50
                try {
                    // ✅ CORRECTION: Accède à l'accessionNumber correctement
                    const accessionNumber = filing.accessionNumber;
                    
                    if (!accessionNumber) {
                        console.warn(`⚠ Missing accessionNumber for filing:`, filing);
                        errorCount++;
                        continue;
                    }

                    console.log(`🌐 Fetching Form 4 XML via Worker: ${accessionNumber}`);

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
                    } else {
                        errorCount++;
                    }
                } catch (error) {
                    console.warn(`⚠ Error parsing Form 4 ${filing.accessionNumber}:`, error.message);
                    errorCount++;
                }

                // Petit délai pour éviter rate limiting
                await new Promise(resolve => setTimeout(resolve, 100));
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
                    parsedSuccessfully: successCount,
                    parseErrors: errorCount
                }
            };

        } catch (error) {
            console.error(`❌ Error fetching insider history for ${ticker}:`, error);
            throw error;
        }
    }

    formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    calculateClusterConfidence(cluster) {
        // Score basé sur le nombre d'insiders et la valeur totale
        const insiderCount = new Set(cluster.map(c => c.reportingOwner?.name)).size;
        const totalValue = cluster.reduce((sum, c) => sum + (c.totalValue || 0), 0);
        
        let score = 50;
        score += Math.min(insiderCount * 10, 30); // Max +30 pour insiders
        score += totalValue > 1000000 ? 20 : totalValue > 100000 ? 10 : 0;
        
        return Math.min(score, 100);
    }

    deduplicateClusters(clusters) {
        // Supprime les clusters qui se chevauchent (garde le plus grand)
        return clusters.filter((cluster, index) => {
            return !clusters.some((other, otherIndex) => {
                if (index >= otherIndex) return false;
                const timeDiff = Math.abs(cluster.startDate - other.startDate) / (1000 * 60 * 60 * 24);
                return timeDiff < 7 && other.insiderCount > cluster.insiderCount;
            });
        });
    }

    /**
     * ⏱ Queue system pour respecter le rate limiting de la SEC
     */
    async queueRequest(url) {
        return new Promise((resolve, reject) => {
            this.requestQueue.push({ url, resolve, reject });
            if (!this.isProcessingQueue) {
                this.processQueue();
            }
        });
    }

    async processQueue() {
        if (this.requestQueue.length === 0) {
            this.isProcessingQueue = false;
            return;
        }

        this.isProcessingQueue = true;
        const { url, resolve, reject } = this.requestQueue.shift();

        try {
            const response = await fetch(url, {
                headers: {
                    'User-Agent': this.userAgent
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            resolve(response);
        } catch (error) {
            reject(error);
        }

        // Délai avant la prochaine requête
        setTimeout(() => this.processQueue(), this.requestDelay);
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