/**
 * ════════════════════════════════════════════════════════════════
 * COMPANIES DIRECTORY - SYSTÈME COMPLET V2.0
 * Multi-API Logos + Google Knowledge Graph + 15 Secteurs + Régions
 * Cache LocalStorage : 30 JOURS (1 MOIS)
 * ════════════════════════════════════════════════════════════════
 */

class CompaniesDirectory {
    constructor() {
        this.allCompanies = [];
        this.filteredCompanies = [];
        this.displayedCompanies = [];
        this.currentView = 'grid';
        this.currentSort = 'name-asc';
        this.currentPage = 1;
        this.itemsPerPage = 20;
        this.filters = {
            search: '',
            sector: 'all',
            region: 'all'
        };
        
        // ✅ URL du Worker Cloudflare
        this.knowledgeGraphWorkerUrl = 'https://google-knowledge-api.raphnardone.workers.dev';
        
        // ✅ Cache local des données enrichies
        this.enrichedDataCache = new Map();
        
        // ✅ NOUVEAU : Durée du cache = 30 JOURS (1 MOIS)
        this.CACHE_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 jours en millisecondes
        
        // ✅ État du préchargement
        this.preloadingStatus = {
            isLoading: false,
            loaded: 0,
            total: 0,
            errors: 0,
            startTime: null
        };
        
        // ✅ 15 SECTEURS PRINCIPAUX (Monde entier)
        this.mainSectors = {
            'Technology': ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA', 'NFLX', 'ADBE', 'CRM', 'ORCL', 'INTC', 'AMD', 'QCOM', 'AVGO', 'TXN', 'CSCO', 'IBM', 'ACN', 'NOW', 'INTU', 'PYPL', 'SQ', 'SNOW', 'PLTR', 'ZM', 'SHOP', 'UBER', 'LYFT', 'ABNB', 'DASH', 'SNAP', 'PINS', 'SPOT', 'RBLX', 'TWLO', 'OKTA', 'CRWD', 'DDOG', 'MDB', 'SPLK', 'WDAY', 'ADSK', 'VMW', 'DELL', 'HPQ', 'HPE', 'WDC', 'STX', 'MU', 'AMAT', 'LRCX', 'KLAC', 'ADI', 'MRVL', 'SNPS', 'CDNS', 'SAP', 'ASML', 'ERIC', 'NOK', 'STM', 'BABA', 'TCEHY', 'SSNLF', 'TSM', 'SONY', 'BIDU', 'JD', 'NTES', 'PDD', 'NIO', 'LI', 'XPEV', 'BYDDY', 'SFTBY', 'NTDOY', 'INFY', 'WIT', 'U'],
            'Finance': ['JPM', 'BAC', 'WFC', 'C', 'GS', 'MS', 'USB', 'PNC', 'TFC', 'COF', 'SCHW', 'AXP', 'DFS', 'SYF', 'V', 'MA', 'AFRM', 'SOFI', 'HOOD', 'COIN', 'BLK', 'STT', 'BK', 'NTRS', 'TROW', 'BEN', 'IVZ', 'RJF', 'IBKR', 'ETFC', 'AMTD', 'ALLY', 'HSBC', 'BCS', 'LYG', 'DB', 'UBS', 'CS', 'ING', 'SAN', 'BBVA', 'IDCBY', 'CICHY', 'HDB', 'IBN', 'MUFG', 'SMFG', 'MFG', 'NMR', 'SCBFF', 'NWG.L', 'CBKGF', 'BNP.PA', 'GLE.PA', 'ACA.PA', 'ABN.AS', 'UCG.MI', 'ISP.MI', 'CABK.MC', 'NDAFI', 'DANSKE.CO', 'ALV.DE', 'CS.PA', 'ZURN.SW', 'PRU.L', 'AV.L', 'LGEN.L', 'G.MI', 'DBSDY', 'OVCHY', 'UOVEY', 'PNGAY', 'CIHKY', 'SBKFF'],
            'Healthcare': ['JNJ', 'UNH', 'PFE', 'LLY', 'ABBV', 'MRK', 'ABT', 'TMO', 'DHR', 'BMY', 'AMGN', 'GILD', 'REGN', 'VRTX', 'MRNA', 'BNTX', 'BIIB', 'ILMN', 'ISRG', 'SYK', 'BSX', 'MDT', 'BAX', 'BDX', 'CI', 'HUM', 'CVS', 'WBA', 'MCK', 'CAH', 'ABC', 'ZBH', 'EW', 'IDXX', 'WAT', 'A', 'NVO', 'RHHBY', 'NVS', 'SNY', 'AZN', 'GSK', 'BAYRY', 'SMMNY', 'FSNUY', 'PHG', 'LZAGY', 'GRFS', 'UCBJF'],
            'Consumer Goods': ['WMT', 'COST', 'HD', 'TGT', 'LOW', 'TJX', 'DG', 'DLTR', 'BBY', 'EBAY', 'ETSY', 'W', 'GPS', 'ROST', 'BURL', 'JWN', 'M', 'KSS', 'FL', 'NKE', 'LULU', 'UAA', 'VFC', 'RL', 'TPR', 'CPRI', 'LVMUY', 'RMS.PA', 'KER.PA', 'OR.PA', 'ADDYY', 'PMMAF', 'ITX.MC', 'HNNMY', 'BURBY', 'MONC.MI', 'CFRHF', 'SWGAY', 'PANDY', 'CA.PA', 'TSCDY', 'SBRY.L', 'B4B.DE', 'AD.AS', 'CO.PA', 'MKS.L', 'NXT.L', 'ABF.L'],
            'Food & Beverage': ['KO', 'PEP', 'MDLZ', 'KHC', 'GIS', 'K', 'CAG', 'CPB', 'HSY', 'MNST', 'STZ', 'BF.B', 'TAP', 'TSN', 'HRL', 'SJM', 'MKC', 'LW', 'MCD', 'SBUX', 'CMG', 'YUM', 'QSR', 'DPZ', 'DRI', 'WEN', 'PZZA', 'SHAK', 'WING', 'NSRGY', 'DANOY', 'UL', 'DEO', 'HEINY', 'CABGY', 'BUD', 'PDRDY'],
            'Energy': ['XOM', 'CVX', 'COP', 'OXY', 'MPC', 'VLO', 'PSX', 'EOG', 'PXD', 'SLB', 'HAL', 'BKR', 'KMI', 'WMB', 'OKE', 'LNG', 'NEE', 'DUK', 'SO', 'D', 'EXC', 'AEP', 'SRE', 'XEL', 'WEC', 'ES', 'PEG', 'SHEL', 'BP', 'TTE', 'EQNR', 'E', 'REPYY', 'OMVKY', 'GLPEY', 'NTOIY', 'DNNGY', 'IBDRY', 'ENLAY'],
            'Industrials': ['BA', 'CAT', 'HON', 'MMM', 'GE', 'LMT', 'RTX', 'NOC', 'GD', 'LHX', 'DE', 'UTX', 'CARR', 'OTIS', 'PH', 'ETN', 'EMR', 'ITW', 'ROK', 'JCI', 'CMI', 'PCAR', 'WAB', 'NSC', 'UNP', 'CSX', 'KSU', 'FDX', 'UPS', 'XPO', 'JBHT', 'ODFL', 'SIEGY', 'ABB', 'SBGSF', 'EADSY', 'SAFRY', 'RYCEY', 'BAESY'],
            'Automotive': ['F', 'GM', 'RIVN', 'LCID', 'NKLA', 'FSR', 'VWAGY', 'BMWYY', 'MBGAF', 'POAHY', 'RACE', 'STLA', 'RNLSY', 'TM', 'HMC', 'NSANY', 'MZDAY', 'FUJHY', 'SZKMY', 'MMTOF', 'HYMTF'],
            'Telecom & Media': ['VZ', 'T', 'TMUS', 'CMCSA', 'CHTR', 'DIS', 'WBD', 'PARA', 'SIRI', 'FOX', 'NWSA', 'LYV', 'VOD', 'BT.L', 'ORAN', 'DTEGY', 'TEF', 'TIIAY', 'SCMWY', 'CHL', 'NTTYY'],
            'Real Estate': ['AMT', 'PLD', 'CCI', 'EQIX', 'PSA', 'SPG', 'O', 'VICI', 'WELL', 'AVB', 'EQR', 'DLR', 'SBAC', 'LEN', 'DHI', 'PHM', 'NVR', 'TOL', 'VNA.DE', 'URW.AS'],
            'Mining & Materials': ['BHP', 'RIO', 'VALE', 'GLNCY', 'AAUKY', 'FCX', 'NEM', 'GOLD', 'FSUGY', 'AA', 'MT', 'NUE', 'STLD', 'TECK', 'SCCO'],
            'Hospitality': ['MAR', 'HLT', 'H', 'WH', 'MGM', 'CZR', 'LVS', 'WYNN', 'ACCYY', 'WTB.L', 'IHG'],
            'Chemicals & Agriculture': ['BASFY', 'DOW', 'DD', 'LIN', 'AIQUY', 'APD', 'SHW', 'PPG', 'ECL', 'CTVA', 'CF', 'MOS', 'NTR', 'IFF'],
            'Fintech & Crypto': ['COIN', 'HOOD', 'SOFI', 'AFRM', 'SQ', 'PYPL', 'V', 'MA', 'BTC-USD', 'ETH-USD', 'MARA', 'RIOT', 'MSTR', 'LC', 'TREE', 'UPST'],
            'Other': []
        };
        
        // ✅ AUTO-GÉNÉRATION DE DOMAINES
        this.autoGenerateDomain = (ticker, companyName) => {
            let cleanName = companyName.toLowerCase()
                .replace(/\s+inc\.?$/i, '')
                .replace(/\s+corp(oration)?\.?$/i, '')
                .replace(/\s+ltd\.?$/i, '')
                .replace(/\s+plc\.?$/i, '')
                .replace(/\s+sa\.?$/i, '')
                .replace(/\s+nv\.?$/i, '')
                .replace(/\s+ag\.?$/i, '')
                .replace(/\s+gmbh\.?$/i, '')
                .replace(/\s+holdings?\.?$/i, '')
                .replace(/\s+group\.?$/i, '')
                .replace(/\s+&\s+/g, '')
                .replace(/\s+and\s+/g, '')
                .replace(/\s+/g, '')
                .replace(/[^a-z0-9]/g, '');
            
            const exceptions = {
                'meta': 'meta.com',
                'metaplatforms': 'meta.com',
                'alphabet': 'abc.xyz',
                'facebook': 'meta.com',
                'google': 'google.com',
                'xcorp': 'twitter.com',
                'twitter': 'twitter.com',
                'square': 'squareup.com',
                'block': 'squareup.com',
                '3m': '3m.com',
                'lvmh': 'lvmh.com',
                'hermes': 'hermes.com',
                'loreal': 'loreal.com',
                'berkshirehathaway': 'berkshirehathaway.com',
                'jpmorgan': 'jpmorganchase.com',
                'jpmorganchase': 'jpmorganchase.com',
                'bankofamerica': 'bankofamerica.com',
                'wellsfargo': 'wellsfargo.com'
            };
            
            if (exceptions[cleanName]) {
                return exceptions[cleanName];
            }
            
            return `${cleanName}.com`;
        };
        
        // ✅ MAPPING DOMAINES COMPLET
        this.companyDomains = this.buildCompleteDomainMapping();
        
        this.init();
    }
    
    buildCompleteDomainMapping() {
        return {
            // USA - Tech Giants
            'AAPL': 'apple.com',
            'MSFT': 'microsoft.com',
            'GOOGL': 'abc.xyz',
            'AMZN': 'amazon.com',
            'META': 'meta.com',
            'TSLA': 'tesla.com',
            'NVDA': 'nvidia.com',
            'NFLX': 'netflix.com',
            'ADBE': 'adobe.com',
            'CRM': 'salesforce.com',
            'ORCL': 'oracle.com',
            'INTC': 'intel.com',
            'AMD': 'amd.com',
            'QCOM': 'qualcomm.com',
            'AVGO': 'broadcom.com',
            'TXN': 'ti.com',
            'CSCO': 'cisco.com',
            'IBM': 'ibm.com',
            'ACN': 'accenture.com',
            'NOW': 'servicenow.com',
            'INTU': 'intuit.com',
            'PYPL': 'paypal.com',
            'SQ': 'squareup.com',
            'SNOW': 'snowflake.com',
            'PLTR': 'palantir.com',
            'ZM': 'zoom.us',
            'SHOP': 'shopify.com',
            'UBER': 'uber.com',
            'LYFT': 'lyft.com',
            'ABNB': 'airbnb.com',
            'DASH': 'doordash.com',
            'SNAP': 'snap.com',
            'PINS': 'pinterest.com',
            'SPOT': 'spotify.com',
            'RBLX': 'roblox.com',
            'U': 'unity.com',
            // USA - Finance
            'JPM': 'jpmorganchase.com',
            'BAC': 'bankofamerica.com',
            'WFC': 'wellsfargo.com',
            'C': 'citigroup.com',
            'GS': 'goldmansachs.com',
            'MS': 'morganstanley.com',
            'V': 'visa.com',
            'MA': 'mastercard.com',
            'COIN': 'coinbase.com',
            // USA - Healthcare
            'JNJ': 'jnj.com',
            'UNH': 'unitedhealthgroup.com',
            'PFE': 'pfizer.com',
            'LLY': 'lilly.com',
            'ABBV': 'abbvie.com',
            'MRK': 'merck.com',
            'ABT': 'abbott.com',
            'TMO': 'thermofisher.com',
            // USA - Consumer
            'WMT': 'walmart.com',
            'COST': 'costco.com',
            'HD': 'homedepot.com',
            'TGT': 'target.com',
            'NKE': 'nike.com',
            // USA - Food
            'KO': 'coca-colacompany.com',
            'PEP': 'pepsico.com',
            'MCD': 'mcdonalds.com',
            'SBUX': 'starbucks.com',
            // USA - Energy
            'XOM': 'exxonmobil.com',
            'CVX': 'chevron.com',
            // USA - Industrials
            'BA': 'boeing.com',
            'CAT': 'caterpillar.com',
            'HON': 'honeywell.com',
            'GE': 'ge.com',
            // Europe
            'SAP': 'sap.com',
            'ASML': 'asml.com',
            'LVMUY': 'lvmh.com',
            'NVO': 'novonordisk.com',
            'SHEL': 'shell.com',
            'BP': 'bp.com',
            // Asia
            'BABA': 'alibaba.com',
            'TCEHY': 'tencent.com',
            'TSM': 'tsmc.com',
            'SONY': 'sony.com',
            'TM': 'toyota.com'
        };
    }
    
    // ✅ SYSTÈME DE LOGOS MULTI-API
    getLogoUrl(ticker, companyName, domain) {
        if (!domain) {
            domain = this.autoGenerateDomain(ticker, companyName);
        }
        
        return {
            primary: `https://img.logo.dev/${domain}?token=pk_X-WazSBJQn2GwW2hy9Lwpg`,
            fallbacks: [
                `https://logo.clearbit.com/${domain}`,
                `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
                `https://unavatar.io/${domain}?fallback=false`
            ],
            domain: domain
        };
    }

    /**
     * ✅ INITIALISATION PRINCIPALE
     */
    async init() {
        console.log('🏢 Initializing Companies Directory...');
        console.log(`   🌐 Worker URL: ${this.knowledgeGraphWorkerUrl}`);
        
        // Afficher un indicateur de chargement
        this.showLoadingIndicator();
        
        // Charger la liste des entreprises
        this.loadCompanies();
        
        // Configurer les event listeners
        this.setupEventListeners();
        
        // ✅ ÉTAPE 1 : Charger le cache depuis localStorage
        const cacheLoaded = this.loadEnrichedCache();
        
        if (cacheLoaded && this.enrichedDataCache.size > 0) {
            const cacheStats = this.getCacheStats();
            console.log(`💾 Cache loaded:`);
            console.log(`   📊 Profiles: ${this.enrichedDataCache.size}`);
            console.log(`   📅 Age: ${cacheStats.ageDays} days (${cacheStats.ageHours}h)`);
            console.log(`   💿 Size: ${cacheStats.sizeKB} KB`);
            
            this.updatePreloadStatus(
                `✅ Loaded ${this.enrichedDataCache.size} cached profiles (${cacheStats.ageDays} days old)`
            );
        } else {
            console.log('📭 No valid cache found, will load fresh data...');
        }
        
        // ✅ ÉTAPE 2 : Pré-charger les données enrichies (100 premières entreprises)
        // Si cache existe et valide, cette étape chargera uniquement les manquantes
        await this.preloadEnrichedData(100);
        
        // Appliquer les filtres et afficher les résultats
        this.applyFiltersAndPagination();
        this.updateStats();
        this.renderCharts();
        
        // Masquer l'indicateur de chargement
        this.hideLoadingIndicator();
        
        console.log('✅ Companies Directory initialized!');
        console.log(`   📊 Total companies: ${this.allCompanies.length}`);
        console.log(`   ✨ Enriched profiles: ${this.enrichedDataCache.size}`);
    }

    // ✅ Afficher indicateur de chargement
    showLoadingIndicator() {
        const container = document.getElementById('companiesContainer');
        if (!container) return;
        
        container.innerHTML = `
            <div style='grid-column: 1 / -1; text-align: center; padding: 80px 20px;'>
                <div style='display: inline-block; position: relative;'>
                    <i class='fas fa-spinner fa-spin' style='font-size: 4rem; color: #667eea;'></i>
                    <div style='margin-top: 24px; font-size: 1.2rem; font-weight: 700; color: #1e293b;'>
                        Loading Companies Directory...
                    </div>
                    <div id='preloadStatus' style='margin-top: 12px; font-size: 0.95rem; color: #64748b;'>
                        Preparing data...
                    </div>
                </div>
            </div>
        `;
    }
    
    // ✅ Masquer indicateur de chargement
    hideLoadingIndicator() {
        // Le container sera remplacé par renderCompanies()
    }
    
    // ✅ Mettre à jour le statut de préchargement
    updatePreloadStatus(message) {
        const statusEl = document.getElementById('preloadStatus');
        if (statusEl) {
            statusEl.textContent = message;
        }
        console.log(`📢 ${message}`);
    }

    loadCompanies() {
        if (!window.entityDB) {
            console.error('❌ EntityDatabase not found!');
            return;
        }
        
        const companiesObj = window.entityDB.companies;
        
        // Convert to array format
        this.allCompanies = Object.entries(companiesObj).map(([name, ticker]) => {
            const sector = this.getMainSector(ticker);
            const region = this.getRegionForTicker(ticker, name);
            const domain = this.companyDomains[ticker];
            const logoUrls = this.getLogoUrl(ticker, name, domain);
            
            return {
                name: name,
                ticker: ticker,
                sector: sector,
                region: region,
                domain: logoUrls.domain,
                logoUrl: logoUrls.primary,
                logoFallbacks: logoUrls.fallbacks
            };
        });
        
        // Remove duplicates
        const seen = new Set();
        this.allCompanies = this.allCompanies.filter(company => {
            if (seen.has(company.ticker)) {
                return false;
            }
            seen.add(company.ticker);
            return true;
        });
        
        console.log(`📊 Loaded ${this.allCompanies.length} companies`);
    }
    
    // ✅ SECTEUR PRINCIPAL (15 catégories)
    getMainSector(ticker) {
        for (const [sectorName, tickers] of Object.entries(this.mainSectors)) {
            if (tickers.includes(ticker)) {
                return sectorName;
            }
        }
        return 'Other';
    }
    
    // ✅ RÉGION (basée sur ticker et nom)
    getRegionForTicker(ticker, name) {
        const europeanSuffixes = ['.PA', '.DE', '.L', '.AS', '.MC', '.MI', '.SW', '.CO', '.HE', '.VI'];
        const asianSuffixes = ['.HK', '.T', '.SS', '.SZ', '.KS', '.NS', '.TW', '.SR'];
        
        if (europeanSuffixes.some(suffix => ticker.includes(suffix))) return 'Europe';
        if (asianSuffixes.some(suffix => ticker.includes(suffix))) return 'Asia';
        
        const europeanKeywords = ['HSBC', 'Barclays', 'Shell', 'BP', 'SAP', 'ASML', 'LVMH', 'Nestlé', 'Siemens'];
        const asianKeywords = ['Alibaba', 'Tencent', 'Samsung', 'TSMC', 'Sony', 'Toyota'];
        
        if (europeanKeywords.some(keyword => name.includes(keyword))) return 'Europe';
        if (asianKeywords.some(keyword => name.includes(keyword))) return 'Asia';
        
        return 'USA';
    }
    
    /**
     * ════════════════════════════════════════════════════════════════
     * GESTION DU CACHE LOCALSTORAGE (30 JOURS)
     * ════════════════════════════════════════════════════════════════
     */

    /**
     * ✅ SAUVEGARDER LE CACHE DANS LOCALSTORAGE
     */
    saveEnrichedCache() {
        try {
            const cacheArray = Array.from(this.enrichedDataCache.entries());
            const cacheData = {
                version: '2.0',
                timestamp: Date.now(),
                count: cacheArray.length,
                data: cacheArray,
                workerUrl: this.knowledgeGraphWorkerUrl
            };
            
            localStorage.setItem('companiesEnrichedCache', JSON.stringify(cacheData));
            
            const sizeKB = Math.round((JSON.stringify(cacheData).length * 2) / 1024);
            console.log(`💾 Cache saved: ${cacheArray.length} profiles (${sizeKB} KB)`);
            return true;
        } catch (error) {
            console.warn('⚠ Failed to save cache:', error.message);
            
            if (error.name === 'QuotaExceededError') {
                console.log('🗑 localStorage quota exceeded, clearing old cache...');
                localStorage.removeItem('companiesEnrichedCache');
                localStorage.removeItem('companiesCacheTimestamp'); // Legacy
            }
            return false;
        }
    }

    /**
     * ✅ CHARGER LE CACHE DEPUIS LOCALSTORAGE
     */
    loadEnrichedCache() {
        try {
            const cachedItem = localStorage.getItem('companiesEnrichedCache');
            
            if (!cachedItem) {
                console.log('📭 No cached data found');
                return false;
            }
            
            const cacheData = JSON.parse(cachedItem);
            
            // Vérifier la structure
            if (!cacheData || !cacheData.data || !cacheData.timestamp) {
                console.warn('⚠ Invalid cache structure, clearing...');
                localStorage.removeItem('companiesEnrichedCache');
                return false;
            }
            
            // ✅ VÉRIFIER L'ÂGE DU CACHE (30 JOURS MAX)
            const age = Date.now() - cacheData.timestamp;
            
            if (age > this.CACHE_DURATION_MS) {
                const days = Math.floor(age / (24 * 60 * 60 * 1000));
                console.log(`🗑 Cache expired (${days} days old), clearing...`);
                localStorage.removeItem('companiesEnrichedCache');
                return false;
            }
            
            // Charger les données dans le Map
            this.enrichedDataCache = new Map(cacheData.data);
            
            const hours = Math.floor(age / (60 * 60 * 1000));
            const days = Math.floor(age / (24 * 60 * 60 * 1000));
            console.log(`💾 Loaded ${this.enrichedDataCache.size} cached profiles`);
            console.log(`   📅 Cache age: ${days} days (${hours} hours)`);
            console.log(`   ✅ Version: ${cacheData.version || 'legacy'}`);
            console.log(`   ⏰ Expires in: ${30 - days} days`);
            
            return true;
            
        } catch (error) {
            console.warn('⚠ Failed to load cache:', error.message);
            
            try {
                localStorage.removeItem('companiesEnrichedCache');
            } catch (e) {
                // Ignore cleanup errors
            }
            
            return false;
        }
    }

    /**
     * ✅ VIDER LE CACHE MANUELLEMENT
     */
    clearEnrichedCache() {
        try {
            this.enrichedDataCache.clear();
            localStorage.removeItem('companiesEnrichedCache');
            console.log('🗑 Enriched cache cleared');
            return true;
        } catch (error) {
            console.warn('⚠ Failed to clear cache:', error.message);
            return false;
        }
    }

    /**
     * ✅ OBTENIR LES STATISTIQUES DU CACHE
     */
    getCacheStats() {
        try {
            const cachedItem = localStorage.getItem('companiesEnrichedCache');
            
            if (!cachedItem) {
                return {
                    exists: false,
                    size: 0,
                    age: 0,
                    sizeKB: 0
                };
            }
            
            const cacheData = JSON.parse(cachedItem);
            const age = Date.now() - (cacheData.timestamp || 0);
            const sizeKB = Math.round((cachedItem.length * 2) / 1024);
            const ageHours = Math.floor(age / (60 * 60 * 1000));
            const ageDays = Math.floor(age / (24 * 60 * 60 * 1000));
            const expiresInDays = Math.max(0, 30 - ageDays);
            
            return {
                exists: true,
                size: cacheData.count || 0,
                age: age,
                ageHours: ageHours,
                ageDays: ageDays,
                expiresInDays: expiresInDays,
                sizeKB: sizeKB,
                version: cacheData.version || 'legacy'
            };
            
        } catch (error) {
            console.warn('⚠ Failed to get cache stats:', error.message);
            return {
                exists: false,
                error: error.message
            };
        }
    }

    /**
     * ════════════════════════════════════════════════════════════════
     * PRÉCHARGEMENT DES DONNÉES ENRICHIES (AVEC CACHE 30 JOURS)
     * ════════════════════════════════════════════════════════════════
     */

    /**
     * ✅ PRÉCHARGEMENT DES DONNÉES ENRICHIES (100 ENTREPRISES)
     */
    async preloadEnrichedData(count = 100, forceRefresh = false) {
        console.log(`🔄 Pre-loading enriched data for ${count} companies...`);
        
        // ✅ Si forceRefresh, vider le cache
        if (forceRefresh) {
            console.log('🔄 Force refresh requested, clearing cache...');
            this.clearEnrichedCache();
        }
        
        // ✅ Vérifier si le cache est déjà suffisant
        if (!forceRefresh && this.enrichedDataCache.size >= count) {
            const stats = this.getCacheStats();
            console.log(`✅ Cache already sufficient (${this.enrichedDataCache.size} profiles)`);
            console.log(`   📅 Expires in: ${stats.expiresInDays} days`);
            this.updatePreloadStatus(
                `✅ Loaded ${this.enrichedDataCache.size} cached profiles (expires in ${stats.expiresInDays} days)`
            );
            return;
        }
        
        // ✅ Initialiser le statut
        this.preloadingStatus.isLoading = true;
        this.preloadingStatus.total = Math.min(count, this.allCompanies.length);
        this.preloadingStatus.loaded = this.enrichedDataCache.size;
        this.preloadingStatus.errors = 0;
        this.preloadingStatus.startTime = Date.now();
        
        // ✅ Sélectionner les entreprises à charger
        const topCompanies = this.allCompanies.slice(0, count);
        const companiesToLoad = forceRefresh 
            ? topCompanies 
            : topCompanies.filter(c => !this.enrichedDataCache.has(c.ticker));
        
        if (companiesToLoad.length === 0) {
            console.log('✅ All companies already cached!');
            this.preloadingStatus.isLoading = false;
            this.updatePreloadStatus(
                `✅ All ${this.enrichedDataCache.size} profiles already cached`
            );
            return;
        }
        
        console.log(`📋 Loading ${companiesToLoad.length} companies (${this.enrichedDataCache.size} already cached)`);
        
        // ✅ Préparer les batches (50 max par batch)
        const batchSize = 50;
        const batches = [];
        
        for (let i = 0; i < companiesToLoad.length; i += batchSize) {
            batches.push(companiesToLoad.slice(i, i + batchSize));
        }
        
        console.log(`📦 Processing ${batches.length} batch(es)...`);
        
        // ✅ Charger chaque batch
        for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
            const batch = batches[batchIndex];
            const batchNum = batchIndex + 1;
            
            this.updatePreloadStatus(
                `⏳ Batch ${batchNum}/${batches.length} (${this.preloadingStatus.loaded}/${this.preloadingStatus.total})...`
            );
            
            try {
                const response = await fetch(`${this.knowledgeGraphWorkerUrl}/batch-companies`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        companies: batch.map(c => ({ name: c.name, ticker: c.ticker }))
                    })
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const result = await response.json();
                
                if (result.success && result.results) {
                    let batchSuccess = 0;
                    
                    result.results.forEach(item => {
                        if (item.data && item.data.found) {
                            this.enrichedDataCache.set(item.ticker, item.data);
                            this.preloadingStatus.loaded++;
                            batchSuccess++;
                        } else {
                            this.preloadingStatus.errors++;
                        }
                    });
                    
                    console.log(`✅ Batch ${batchNum}: +${batchSuccess} enriched`);
                } else {
                    throw new Error(result.error || 'Invalid response');
                }
                
                // ✅ Sauvegarder le cache après chaque batch
                this.saveEnrichedCache();
                
                // ✅ Pause entre batches (100ms)
                if (batchIndex < batches.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
                
            } catch (error) {
                console.error(`❌ Batch ${batchNum} failed:`, error.message);
                this.preloadingStatus.errors += batch.length;
            }
        }
        
        // ✅ Finaliser
        this.preloadingStatus.isLoading = false;
        const duration = ((Date.now() - this.preloadingStatus.startTime) / 1000).toFixed(1);
        const stats = this.getCacheStats();
        
        console.log(`✅ Pre-loading completed in ${duration}s!`);
        console.log(`   ✅ Loaded: ${this.enrichedDataCache.size}`);
        console.log(`   ❌ Errors: ${this.preloadingStatus.errors}`);
        console.log(`   📅 Cache expires in: ${stats.expiresInDays} days`);
        
        this.updatePreloadStatus(
            `✅ ${this.enrichedDataCache.size} profiles loaded (expires in ${stats.expiresInDays} days)`
        );
        
        this.updateStats();
    }

    /**
     * ✅ RAFRAÎCHIR LES DONNÉES (BOUTON MANUEL)
     */
    async refreshEnrichedData(count = 100) {
        if (this.preloadingStatus.isLoading) {
            alert('⏳ Loading in progress...\n\nPlease wait.');
            return;
        }
        
        const stats = this.getCacheStats();
        const confirmed = confirm(
            `🔄 Refresh enriched data?\n\n` +
            `• Current cache: ${this.enrichedDataCache.size} profiles\n` +
            `• Cache age: ${stats.ageDays} days\n` +
            `• Expires in: ${stats.expiresInDays} days\n\n` +
            `This will reload fresh data.\nContinue?`
        );
        
        if (!confirmed) return;
        
        this.showLoadingIndicator();
        
        try {
            await this.preloadEnrichedData(count, true);
            this.applyFiltersAndPagination();
            
            const newStats = this.getCacheStats();
            alert(
                `✅ Refresh completed!\n\n` +
                `• Loaded: ${this.enrichedDataCache.size} profiles\n` +
                `• Errors: ${this.preloadingStatus.errors}\n` +
                `• Expires in: ${newStats.expiresInDays} days`
            );
        } catch (error) {
            console.error('❌ Refresh failed:', error);
            alert(`❌ Refresh failed: ${error.message}`);
        } finally {
            this.hideLoadingIndicator();
        }
    }

    /**
     * ✅ RÉCUPÉRER UNE DONNÉE ENRICHIE (avec cache)
     */
    async fetchEnrichedData(company) {
        // Vérifier le cache
        if (this.enrichedDataCache.has(company.ticker)) {
            return this.enrichedDataCache.get(company.ticker);
        }
        
        try {
            const response = await fetch(
                `${this.knowledgeGraphWorkerUrl}/company-info?query=${encodeURIComponent(company.name)}&ticker=${company.ticker}`
            );
            
            const result = await response.json();
            
            if (result.success && result.data.found) {
                this.enrichedDataCache.set(company.ticker, result.data);
                this.saveEnrichedCache(); // Sauvegarder immédiatement
                return result.data;
            }
            
            return null;
        } catch (error) {
            console.error(`❌ Error fetching ${company.ticker}:`, error);
            return null;
        }
    }

    setupEventListeners() {
        const searchInput = document.getElementById('companySearch');
        const clearBtn = document.getElementById('clearSearch');
        
        searchInput?.addEventListener('input', (e) => {
            this.filters.search = e.target.value;
            clearBtn.style.display = e.target.value ? 'flex' : 'none';
            this.currentPage = 1;
            this.applyFiltersAndPagination();
        });
        
        clearBtn?.addEventListener('click', () => {
            searchInput.value = '';
            this.filters.search = '';
            clearBtn.style.display = 'none';
            this.currentPage = 1;
            this.applyFiltersAndPagination();
        });
        
        document.getElementById('sectorFilter')?.addEventListener('change', (e) => {
            this.filters.sector = e.target.value;
            this.currentPage = 1;
            this.applyFiltersAndPagination();
        });
        
        document.getElementById('regionFilter')?.addEventListener('change', (e) => {
            this.filters.region = e.target.value;
            this.currentPage = 1;
            this.applyFiltersAndPagination();
        });
        
        document.getElementById('sortBy')?.addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.applyFiltersAndPagination();
        });
        
        document.getElementById('resetFilters')?.addEventListener('click', () => {
            searchInput.value = '';
            this.filters = {
                search: '',
                sector: 'all',
                region: 'all'
            };
            document.getElementById('sectorFilter').value = 'all';
            document.getElementById('regionFilter').value = 'all';
            document.getElementById('sortBy').value = 'name-asc';
            this.currentSort = 'name-asc';
            this.currentPage = 1;
            clearBtn.style.display = 'none';
            this.applyFiltersAndPagination();
        });
        
        document.querySelectorAll('.view-toggle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.view-toggle').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.currentView = e.currentTarget.dataset.view;
                this.renderCompanies();
            });
        });
    }
    
    applyFiltersAndPagination() {
        let filtered = [...this.allCompanies];
        
        // Search filter
        if (this.filters.search) {
            const search = this.filters.search.toLowerCase();
            filtered = filtered.filter(company => 
                company.name.toLowerCase().includes(search) ||
                company.ticker.toLowerCase().includes(search)
            );
        }
        
        // Sector filter
        if (this.filters.sector !== 'all') {
            filtered = filtered.filter(company => company.sector === this.filters.sector);
        }
        
        // Region filter
        if (this.filters.region !== 'all') {
            filtered = filtered.filter(company => company.region.toLowerCase() === this.filters.region.toLowerCase());
        }
        
        // Sort
        filtered.sort((a, b) => {
            switch (this.currentSort) {
                case 'name-asc':
                    return a.name.localeCompare(b.name);
                case 'name-desc':
                    return b.name.localeCompare(a.name);
                case 'ticker-asc':
                    return a.ticker.localeCompare(b.ticker);
                case 'ticker-desc':
                    return b.ticker.localeCompare(a.ticker);
                default:
                    return 0;
            }
        });
        
        this.filteredCompanies = filtered;
        
        // Pagination
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        this.displayedCompanies = filtered.slice(startIndex, endIndex);
        
        this.renderCompanies();
        this.renderPagination();
        this.updateStats();
    }
    
    renderCompanies() {
        const container = document.getElementById('companiesContainer');
        const noResults = document.getElementById('noResults');
        
        if (!container) return;
        
        container.className = this.currentView === 'grid' ? 'companies-grid' : 
                              this.currentView === 'list' ? 'companies-list' : 
                              'companies-compact';
        
        if (this.displayedCompanies.length === 0) {
            container.innerHTML = '';
            noResults.style.display = 'block';
            return;
        }
        
        noResults.style.display = 'none';
        
        container.innerHTML = this.displayedCompanies.map(company => {
            const initials = company.name.substring(0, 2).toUpperCase();
            const fallbacksData = JSON.stringify(company.logoFallbacks || []);
            
            // ✅ Badge si données enrichies disponibles
            const hasEnrichedData = this.enrichedDataCache.has(company.ticker);
            const enrichedBadge = hasEnrichedData 
                ? `<div class='enriched-badge' title='Enhanced with Google Knowledge Graph' style='position: absolute; top: 8px; right: 8px; background: linear-gradient(135deg, #10b981, #059669); color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 800; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);'><i class='fas fa-check'></i></div>`
                : '';
            
            return `
                <div class='company-card' onclick='CompaniesDirectory.openCompanyModal("${company.ticker}")' style='position: relative; cursor: pointer;'>
                    ${enrichedBadge}
                    <div class='company-header'>
                        <div class='company-logo' 
                             data-ticker='${company.ticker}' 
                             data-fallbacks='${fallbacksData.replace(/'/g, '&apos;')}'>
                            ${company.logoUrl 
                                ? `<img src='${company.logoUrl}' alt='${company.name}' onerror='CompaniesDirectory.handleLogoError(this, "${initials}")'>` 
                                : `<div class='text-fallback'>${initials}</div>`
                            }
                        </div>
                        <div class='company-info'>
                            <div class='company-name' title='${company.name}'>${company.name}</div>
                            <div class='company-ticker'>${company.ticker}</div>
                        </div>
                    </div>
                    <div class='company-details'>
                        <div class='company-detail'>
                            <i class='fas fa-map-marker-alt'></i>
                            <span class='company-region-badge'><i class='fas fa-globe'></i> ${company.region}</span>
                        </div>
                    </div>
                    <div class='company-sector' title='${company.sector}'>${company.sector}</div>
                </div>
            `;
        }).join('');
    }
    
    // ✅ GESTION ERREURS LOGOS (cascade d'APIs)
    static handleLogoError(img, initials) {
        const logoDiv = img.parentElement;
        const fallbacks = JSON.parse(logoDiv.dataset.fallbacks || '[]');
        
        if (fallbacks.length > 0) {
            const nextUrl = fallbacks.shift();
            logoDiv.dataset.fallbacks = JSON.stringify(fallbacks);
            img.src = nextUrl;
            console.log(`🔄 Trying fallback logo: ${nextUrl}`);
        } else {
            logoDiv.classList.add('text-fallback');
            logoDiv.innerHTML = initials;
            console.log(`⚠ Using text fallback: ${initials}`);
        }
    }
    
    renderPagination() {
        const totalPages = Math.ceil(this.filteredCompanies.length / this.itemsPerPage);
        
        if (totalPages <= 1) {
            document.getElementById('paginationControls').style.display = 'none';
            return;
        }
        
        document.getElementById('paginationControls').style.display = 'flex';
        
        let paginationHTML = '';
        
        paginationHTML += `
            <button class='pagination-btn ${this.currentPage === 1 ? 'disabled' : ''}' 
                    onclick='CompaniesDirectory.goToPage(${this.currentPage - 1})' 
                    ${this.currentPage === 1 ? 'disabled' : ''}>
                <i class='fas fa-chevron-left'></i>
            </button>
        `;
        
        const maxVisiblePages = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        if (startPage > 1) {
            paginationHTML += `<button class='pagination-btn' onclick='CompaniesDirectory.goToPage(1)'>1</button>`;
            if (startPage > 2) {
                paginationHTML += `<span class='pagination-ellipsis'>...</span>`;
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button class='pagination-btn ${i === this.currentPage ? 'active' : ''}' 
                        onclick='CompaniesDirectory.goToPage(${i})'>
                    ${i}
                </button>
            `;
        }
        
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                paginationHTML += `<span class='pagination-ellipsis'>...</span>`;
            }
            paginationHTML += `<button class='pagination-btn' onclick='CompaniesDirectory.goToPage(${totalPages})'>${totalPages}</button>`;
        }
        
        paginationHTML += `
            <button class='pagination-btn ${this.currentPage === totalPages ? 'disabled' : ''}' 
                    onclick='CompaniesDirectory.goToPage(${this.currentPage + 1})' 
                    ${this.currentPage === totalPages ? 'disabled' : ''}>
                <i class='fas fa-chevron-right'></i>
            </button>
        `;
        
        document.getElementById('paginationControls').innerHTML = paginationHTML;
        
        const startItem = (this.currentPage - 1) * this.itemsPerPage + 1;
        const endItem = Math.min(this.currentPage * this.itemsPerPage, this.filteredCompanies.length);
        document.getElementById('paginationInfo').textContent = 
            `Showing ${startItem}-${endItem} of ${this.filteredCompanies.length} companies`;
    }
    
    static goToPage(page) {
        const instance = window.companiesDirectoryInstance;
        instance.currentPage = page;
        instance.applyFiltersAndPagination();
        
        document.querySelector('.companies-grid, .companies-list, .companies-compact')?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }
    
    updateStats() {
        document.getElementById('totalCompanies').textContent = this.allCompanies.length.toLocaleString();
        document.getElementById('filteredCompanies').textContent = this.filteredCompanies.length.toLocaleString();
        
        const sectors = new Set(this.allCompanies.map(c => c.sector));
        document.getElementById('totalSectors').textContent = sectors.size;
        
        const regions = new Set(this.allCompanies.map(c => c.region));
        document.getElementById('totalRegions').textContent = regions.size;
        
        // ✅ Afficher le nombre de profils enrichis (si l'élément existe)
        const enrichedCount = this.enrichedDataCache.size;
        const enrichedStat = document.getElementById('enrichedProfiles');
        if (enrichedStat) {
            enrichedStat.textContent = enrichedCount.toLocaleString();
        }
        
        // Populer le filtre secteur
        const sectorFilter = document.getElementById('sectorFilter');
        if (sectorFilter && sectorFilter.options.length === 1) {
            Object.keys(this.mainSectors).sort().forEach(sector => {
                const option = document.createElement('option');
                option.value = sector;
                option.textContent = sector;
                sectorFilter.appendChild(option);
            });
        }
    }

    renderCharts() {
        this.renderSectorChart();
        this.renderRegionChart();
    }
    
    renderSectorChart() {
        if (typeof Highcharts === 'undefined') return;
        
        const sectorCounts = {};
        this.allCompanies.forEach(company => {
            sectorCounts[company.sector] = (sectorCounts[company.sector] || 0) + 1;
        });
        
        const data = Object.entries(sectorCounts)
            .map(([name, y]) => ({ name, y }))
            .sort((a, b) => b.y - a.y);
        
        Highcharts.chart('sectorChart', {
            chart: {
                type: 'pie',
                backgroundColor: 'transparent'
            },
            title: {
                text: 'Companies by Sector',
                style: {
                    fontSize: '1.2rem',
                    fontWeight: '800'
                }
            },
            plotOptions: {
                pie: {
                    innerSize: '50%',
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b>: {point.percentage:.1f}%',
                        style: {
                            fontSize: '11px',
                            fontWeight: '600'
                        }
                    }
                }
            },
            series: [{
                name: 'Companies',
                colorByPoint: true,
                data: data
            }],
            credits: {
                enabled: false
            }
        });
    }
    
    renderRegionChart() {
        if (typeof Highcharts === 'undefined') return;
        
        const regionCounts = {};
        this.allCompanies.forEach(company => {
            regionCounts[company.region] = (regionCounts[company.region] || 0) + 1;
        });
        
        const categories = Object.keys(regionCounts).sort();
        const data = categories.map(region => regionCounts[region]);
        
        Highcharts.chart('regionChart', {
            chart: {
                type: 'column',
                backgroundColor: 'transparent'
            },
            title: {
                text: 'Companies by Region',
                style: {
                    fontSize: '1.2rem',
                    fontWeight: '800'
                }
            },
            xAxis: {
                categories: categories,
                title: {
                    text: 'Region',
                    style: { fontWeight: '700' }
                }
            },
            yAxis: {
                title: {
                    text: 'Number of Companies',
                    style: { fontWeight: '700' }
                },
                gridLineColor: 'rgba(100, 116, 139, 0.1)'
            },
            series: [{
                name: 'Companies',
                data: data,
                colorByPoint: true,
                colors: ['#667eea', '#10b981', '#f59e0b']
            }],
            legend: {
                enabled: false
            },
            credits: {
                enabled: false
            }
        });
    }
    
    /**
     * ✅ MODAL ENRICHI AVEC DONNÉES GOOGLE KNOWLEDGE GRAPH
     */
    static async openCompanyModal(ticker) {
        const instance = window.companiesDirectoryInstance;
        const company = instance.allCompanies.find(c => c.ticker === ticker);
        
        if (!company) return;
        
        const modal = document.getElementById('companyModal');
        const modalContent = document.getElementById('companyModalContent');
        
        // ✅ Afficher un loader
        modalContent.innerHTML = `
            <div style='text-align: center; padding: 60px;'>
                <i class='fas fa-spinner fa-spin' style='font-size: 3rem; color: #667eea;'></i>
                <p style='margin-top: 20px; font-size: 1.1rem; color: #64748b;'>Loading company information...</p>
            </div>
        `;
        
        modal.classList.add('active');
        
        // ✅ Récupérer les données enrichies
        const enrichedData = await instance.fetchEnrichedData(company);
        
        // ✅ Logo avec fallback
        const initials = company.name.substring(0, 2).toUpperCase();
        const logoUrl = enrichedData?.images?.primary || company.logoUrl;
        
        // ✅ Description enrichie
        const description = enrichedData?.description?.detailed || enrichedData?.description?.short || 'No description available.';
        const descriptionUrl = enrichedData?.description?.source || enrichedData?.links?.wikipedia || '';
        
        // ✅ NOUVEAU MODAL ENRICHI
        modalContent.innerHTML = `
            <div class='company-modal-header' style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 16px 16px 0 0; margin: -24px -24px 24px -24px; position: relative; overflow: hidden;'>
                <div style='position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255, 255, 255, 0.05) 10px, rgba(255, 255, 255, 0.05) 20px); animation: moveStripes 20s linear infinite;'></div>
                <div class='company-modal-logo' style='width: 100px; height: 100px; background: white; border-radius: 20px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15); position: relative; z-index: 1;'>
                    ${logoUrl 
                        ? `<img src='${logoUrl}' alt='${company.name}' style='max-width: 80%; max-height: 80%; object-fit: contain;' onerror='this.parentElement.classList.add("text-fallback"); this.parentElement.innerHTML="${initials}"; this.parentElement.style.fontSize="2.5rem"; this.parentElement.style.fontWeight="900"; this.parentElement.style.color="#667eea";'>` 
                        : `<div style='font-size: 2.5rem; font-weight: 900; color: #667eea;'>${initials}</div>`
                    }
                </div>
                <h3 style='color: white; font-size: 2rem; font-weight: 900; text-align: center; margin-bottom: 8px; position: relative; z-index: 1;'>${company.name}</h3>
                <div style='text-align: center; position: relative; z-index: 1;'>
                    <span class='company-ticker' style='background: rgba(255,255,255,0.2); color: white; padding: 8px 20px; border-radius: 20px; font-size: 1.1rem; font-weight: 800;'>${company.ticker}</span>
                </div>
            </div>
            
            ${enrichedData && enrichedData.found ? `
                <!-- ✅ DESCRIPTION ENRICHIE -->
                <div style='background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05)); padding: 24px; border-radius: 16px; margin-bottom: 24px;'>
                    <h4 style='font-size: 1.2rem; font-weight: 800; color: #1e293b; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;'>
                        <i class='fas fa-info-circle' style='color: #667eea;'></i>
                        About ${company.name}
                    </h4>
                    <p style='color: #475569; line-height: 1.7; font-size: 0.95rem;'>${description}</p>
                    ${descriptionUrl ? `
                        <a href='${descriptionUrl}' target='_blank' style='display: inline-flex; align-items: center; gap: 6px; color: #667eea; font-weight: 700; font-size: 0.9rem; margin-top: 12px; text-decoration: none;'>
                            Learn more <i class='fas fa-external-link-alt' style='font-size: 0.75rem;'></i>
                        </a>
                    ` : ''}
                </div>
            ` : ''}
            
            <!-- ✅ DÉTAILS PRINCIPAUX -->
            <div style='display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px;'>
                <div style='background: #f8fafc; padding: 16px; border-radius: 12px; border-left: 4px solid #667eea;'>
                    <div style='font-size: 0.8rem; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;'>Sector</div>
                    <div style='font-size: 1.1rem; font-weight: 800; color: #1e293b;'>${company.sector}</div>
                </div>
                <div style='background: #f8fafc; padding: 16px; border-radius: 12px; border-left: 4px solid #10b981;'>
                    <div style='font-size: 0.8rem; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;'>Region</div>
                    <div style='font-size: 1.1rem; font-weight: 800; color: #1e293b;'>${company.region}</div>
                </div>
                ${enrichedData && enrichedData.additionalInfo?.headquarters ? `
                <div style='background: #f8fafc; padding: 16px; border-radius: 12px; border-left: 4px solid #f59e0b;'>
                    <div style='font-size: 0.8rem; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;'>Headquarters</div>
                    <div style='font-size: 1.1rem; font-weight: 800; color: #1e293b;'>${enrichedData.additionalInfo.headquarters}</div>
                </div>
                ` : ''}
                ${enrichedData && enrichedData.additionalInfo?.foundingDate ? `
                <div style='background: #f8fafc; padding: 16px; border-radius: 12px; border-left: 4px solid #8b5cf6;'>
                    <div style='font-size: 0.8rem; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;'>Founded</div>
                    <div style='font-size: 1.1rem; font-weight: 800; color: #1e293b;'>${enrichedData.additionalInfo.foundingDate}</div>
                </div>
                ` : ''}
                ${enrichedData && enrichedData.additionalInfo?.industry ? `
                <div style='background: #f8fafc; padding: 16px; border-radius: 12px; border-left: 4px solid #ec4899;'>
                    <div style='font-size: 0.8rem; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;'>Industry</div>
                    <div style='font-size: 1.1rem; font-weight: 800; color: #1e293b;'>${enrichedData.additionalInfo.industry}</div>
                </div>
                ` : ''}
            </div>
            
            ${enrichedData && (enrichedData.links?.officialWebsite || company.domain) ? `
            <!-- ✅ LIEN SITE WEB -->
            <div style='background: linear-gradient(135deg, #10b981, #059669); padding: 16px 24px; border-radius: 12px; margin-bottom: 24px;'>
                <a href='${enrichedData.links?.officialWebsite || `https://${company.domain}`}' target='_blank' style='display: flex; align-items: center; justify-content: space-between; color: white; text-decoration: none; font-weight: 700;'>
                    <span style='display: flex; align-items: center; gap: 12px;'>
                        <i class='fas fa-globe' style='font-size: 1.5rem;'></i>
                        <span style='font-size: 1.1rem;'>Visit Official Website</span>
                    </span>
                    <i class='fas fa-arrow-right'></i>
                </a>
            </div>
            ` : ''}
            
            <!-- ✅ ACTIONS -->
            <div style='display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;'>
                <a href='advanced-analysis.html?symbol=${company.ticker}' class='filter-btn' style='flex: 1; min-width: 200px; display: inline-flex; text-decoration: none; justify-content: center; background: linear-gradient(135deg, #667eea, #764ba2);'>
                    <i class='fas fa-chart-line'></i>
                    <span>Analyze ${company.ticker}</span>
                </a>
                <a href='trend-prediction.html?symbol=${company.ticker}' class='filter-btn' style='flex: 1; min-width: 200px; display: inline-flex; text-decoration: none; justify-content: center; background: linear-gradient(135deg, #10b981, #059669);'>
                    <i class='fas fa-brain'></i>
                    <span>Predict Trends</span>
                </a>
            </div>
            
            ${enrichedData && enrichedData.found ? `
            <!-- ✅ DATA SOURCE -->
            <div style='margin-top: 24px; padding-top: 20px; border-top: 2px solid #e2e8f0; text-align: center;'>
                <div style='display: inline-flex; align-items: center; gap: 8px; color: #64748b; font-size: 0.85rem;'>
                    <i class='fas fa-database'></i>
                    <span>Data provided by Google Knowledge Graph</span>
                </div>
            </div>
            ` : ''}
        `;
    }
    
    static closeModal() {
        document.getElementById('companyModal').classList.remove('active');
    }
}

// ✅ INITIALISATION
document.addEventListener('DOMContentLoaded', () => {
    window.companiesDirectoryInstance = new CompaniesDirectory();
});

// ✅ FERMETURE MODAL (clic extérieur)
document.addEventListener('click', (e) => {
    const modal = document.getElementById('companyModal');
    if (e.target === modal) {
        CompaniesDirectory.closeModal();
    }
});

// ✅ FERMETURE MODAL (touche Escape)
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        CompaniesDirectory.closeModal();
    }
});