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
    
    // ✅ GESTION ERREURS LOGOS MODAL (même logique que la grille)
    static handleModalLogoError(img, initials) {
        const logoDiv = img.parentElement;
        const fallbacks = JSON.parse(logoDiv.dataset.fallbacks || '[]');
        
        if (fallbacks.length > 0) {
            const nextUrl = fallbacks.shift();
            logoDiv.dataset.fallbacks = JSON.stringify(fallbacks);
            img.src = nextUrl;
            console.log(`🔄 Modal: Trying fallback logo: ${nextUrl}`);
        } else {
            // Appliquer le style gradient pour le fallback texte
            logoDiv.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
            logoDiv.style.color = 'white';
            logoDiv.innerHTML = `<div style='font-size: 2.5rem; font-weight: 900; color: white;'>${initials}</div>`;
            console.log(`⚠ Modal: Using text fallback: ${initials}`);
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
     * ✅ MODAL ENRICHI AVEC TOUTES LES DONNÉES GOOGLE KNOWLEDGE GRAPH
     */
    static async openCompanyModal(ticker) {
        const instance = window.companiesDirectoryInstance;
        const company = instance.allCompanies.find(c => c.ticker === ticker);
        
        if (!company) return;
        
        const modal = document.getElementById('companyModal');
        const modalContent = document.getElementById('companyModalContent');
        
        // ✅ Afficher un loader
        modalContent.innerHTML = `
            <div style='text-align: center; padding: 80px 20px;'>
                <div class='chart-loading-spinner' style='margin: 0 auto 20px;'></div>
                <div class='chart-loading-text'>Loading comprehensive company data...</div>
                <p style='margin-top: 12px; font-size: 0.85rem; color: var(--text-tertiary);'>
                    Fetching from Google Knowledge Graph API
                </p>
            </div>
        `;
        
        modal.classList.add('active');
        
        // ✅ Récupérer les données enrichies
        const enrichedData = await instance.fetchEnrichedData(company);
        
        // ✅ Logo avec fallback (MÊME SYSTÈME QUE LA GRILLE)
        const initials = company.name.substring(0, 2).toUpperCase();
        const logoUrl = company.logoUrl; // Utiliser le logo de la grille
        const logoFallbacks = company.logoFallbacks || [];
        
        // ✅ Description enrichie
        const hasDescription = enrichedData?.description?.detailed || enrichedData?.description?.short;
        const description = enrichedData?.description?.detailed || enrichedData?.description?.short || 'No description available.';
        const descriptionUrl = enrichedData?.description?.source || enrichedData?.links?.wikipedia || '';
        
        // ✅ NOUVEAU MODAL ULTRA-ENRICHI
        modalContent.innerHTML = `
            <!-- ✨ HEADER PREMIUM avec Gradient Animé -->
            <div style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 32px; border-radius: 24px 24px 0 0; margin: -24px -24px 32px -24px; position: relative; overflow: hidden;'>
                <div style='position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255, 255, 255, 0.05) 10px, rgba(255, 255, 255, 0.05) 20px); animation: moveStripes 20s linear infinite;'></div>
                
                <div style='position: relative; z-index: 1;'>
                    <!-- Logo -->
                    <div id='modalCompanyLogo' class='modal-company-logo' data-ticker='${company.ticker}' data-fallbacks='${JSON.stringify(logoFallbacks).replace(/'/g, '&apos;')}' data-initials='${initials}' style='width: 120px; height: 120px; background: white; border-radius: 24px; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2); border: 3px solid rgba(255, 255, 255, 0.5); overflow: hidden;'>
                        ${logoUrl 
                            ? `<img src='${logoUrl}' alt='${company.name}' style='width: 100%; height: 100%; object-fit: contain; padding: 12px; background: white; border-radius: 24px;' onerror='CompaniesDirectory.handleModalLogoError(this, "${initials}")'>` 
                            : `<div style='font-size: 2.5rem; font-weight: 900; background: linear-gradient(135deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;'>${initials}</div>`
                        }
                    </div>
                    
                    <!-- Company Name -->
                    <h2 style='color: white; font-size: 2.2rem; font-weight: 900; text-align: center; margin-bottom: 12px; text-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);'>${company.name}</h2>
                    
                    <!-- Ticker Badge -->
                    <div style='text-align: center; margin-bottom: 16px;'>
                        <span style='background: rgba(255, 255, 255, 0.25); backdrop-filter: blur(10px); color: white; padding: 10px 24px; border-radius: 24px; font-size: 1.2rem; font-weight: 800; letter-spacing: 1px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2); border: 2px solid rgba(255, 255, 255, 0.4);'>${company.ticker}</span>
                    </div>
                    
                    ${enrichedData && enrichedData.found ? `
                    <!-- Confidence Badge -->
                    <div style='text-align: center;'>
                        <div style='display: inline-flex; align-items: center; gap: 8px; background: rgba(16, 185, 129, 0.2); backdrop-filter: blur(10px); color: white; padding: 8px 20px; border-radius: 20px; font-size: 0.9rem; font-weight: 700; border: 2px solid rgba(16, 185, 129, 0.5);'>
                            <i class='fas fa-check-circle'></i>
                            <span>Verified by Google Knowledge Graph</span>
                            <span style='background: rgba(255, 255, 255, 0.3); padding: 2px 8px; border-radius: 8px; font-size: 0.85rem;'>${enrichedData.metadata?.confidence?.toUpperCase() || 'HIGH'}</span>
                        </div>
                    </div>
                    ` : ''}
                </div>
            </div>
            
            ${hasDescription ? `
            <!-- ✨ DESCRIPTION SECTION -->
            <div class='modal-section'>
                <h4><i class='fas fa-info-circle'></i> About ${company.name}</h4>
                <p style='color: var(--text-secondary); line-height: 1.8; font-size: 1rem; margin-bottom: 16px;'>${description}</p>
                ${descriptionUrl ? `
                    <a href='${descriptionUrl}' target='_blank' style='display: inline-flex; align-items: center; gap: 8px; color: #667eea; font-weight: 700; text-decoration: none; padding: 10px 20px; background: rgba(102, 126, 234, 0.1); border-radius: 12px; transition: all 0.3s ease;' onmouseover='this.style.background="rgba(102, 126, 234, 0.2)"; this.style.transform="translateX(4px)";' onmouseout='this.style.background="rgba(102, 126, 234, 0.1)"; this.style.transform="translateX(0)";'>
                        <i class='fas fa-external-link-alt'></i>
                        <span>Read more on Wikipedia</span>
                    </a>
                ` : ''}
            </div>
            ` : ''}
            
            <!-- ✨ BASIC INFO SECTION -->
            <div class='modal-section'>
                <h4><i class='fas fa-building'></i> Company Information</h4>
                <div class='modal-detail-grid'>
                    <div class='modal-detail-item' style='border-left-color: #667eea;'>
                        <div class='detail-label'>Sector</div>
                        <div class='detail-value'>${company.sector}</div>
                    </div>
                    <div class='modal-detail-item' style='border-left-color: #10b981;'>
                        <div class='detail-label'>Region</div>
                        <div class='detail-value'>${company.region}</div>
                    </div>
                    ${enrichedData?.classification?.primaryType ? `
                    <div class='modal-detail-item' style='border-left-color: #f59e0b;'>
                        <div class='detail-label'>Type</div>
                        <div class='detail-value'>${enrichedData.classification.primaryType}</div>
                    </div>
                    ` : ''}
                    ${enrichedData?.metadata?.resultScore ? `
                    <div class='modal-detail-item' style='border-left-color: #8b5cf6;'>
                        <div class='detail-label'>KG Score</div>
                        <div class='detail-value'>${Math.round(enrichedData.metadata.resultScore).toLocaleString()}</div>
                    </div>
                    ` : ''}
                </div>
            </div>
            
            ${enrichedData && enrichedData.additionalInfo && Object.keys(enrichedData.additionalInfo).length > 0 ? `
            <!-- ✨ DETAILED INFORMATION SECTION -->
            <div class='modal-section' style='background: linear-gradient(135deg, rgba(102, 126, 234, 0.08), rgba(118, 75, 162, 0.08));'>
                <h4><i class='fas fa-database'></i> Detailed Information</h4>
                <div class='modal-detail-grid'>
                    ${enrichedData.additionalInfo.foundingDate ? `
                    <div class='modal-detail-item' style='border-left-color: #3b82f6;'>
                        <div class='detail-label'><i class='fas fa-calendar-alt' style='margin-right: 6px; color: #3b82f6;'></i>Founded</div>
                        <div class='detail-value'>${enrichedData.additionalInfo.foundingDate}</div>
                    </div>
                    ` : ''}
                    
                    ${enrichedData.additionalInfo.headquarters ? `
                    <div class='modal-detail-item' style='border-left-color: #10b981;'>
                        <div class='detail-label'><i class='fas fa-map-marker-alt' style='margin-right: 6px; color: #10b981;'></i>Headquarters</div>
                        <div class='detail-value'>${typeof enrichedData.additionalInfo.headquarters === 'object' ? JSON.stringify(enrichedData.additionalInfo.headquarters) : enrichedData.additionalInfo.headquarters}</div>
                    </div>
                    ` : ''}
                    
                    ${enrichedData.additionalInfo.location ? `
                    <div class='modal-detail-item' style='border-left-color: #14b8a6;'>
                        <div class='detail-label'><i class='fas fa-location-dot' style='margin-right: 6px; color: #14b8a6;'></i>Location</div>
                        <div class='detail-value'>${typeof enrichedData.additionalInfo.location === 'object' ? JSON.stringify(enrichedData.additionalInfo.location) : enrichedData.additionalInfo.location}</div>
                    </div>
                    ` : ''}
                    
                    ${enrichedData.additionalInfo.industry ? `
                    <div class='modal-detail-item' style='border-left-color: #f59e0b;'>
                        <div class='detail-label'><i class='fas fa-industry' style='margin-right: 6px; color: #f59e0b;'></i>Industry</div>
                        <div class='detail-value'>${typeof enrichedData.additionalInfo.industry === 'object' ? JSON.stringify(enrichedData.additionalInfo.industry) : enrichedData.additionalInfo.industry}</div>
                    </div>
                    ` : ''}
                    
                    ${enrichedData.additionalInfo.numberOfEmployees ? `
                    <div class='modal-detail-item' style='border-left-color: #8b5cf6;'>
                        <div class='detail-label'><i class='fas fa-users' style='margin-right: 6px; color: #8b5cf6;'></i>Employees</div>
                        <div class='detail-value'>${typeof enrichedData.additionalInfo.numberOfEmployees === 'number' ? enrichedData.additionalInfo.numberOfEmployees.toLocaleString() : enrichedData.additionalInfo.numberOfEmployees}</div>
                    </div>
                    ` : ''}
                    
                    ${enrichedData.additionalInfo.founder ? `
                    <div class='modal-detail-item' style='border-left-color: #ec4899;'>
                        <div class='detail-label'><i class='fas fa-user-tie' style='margin-right: 6px; color: #ec4899;'></i>Founder(s)</div>
                        <div class='detail-value'>${Array.isArray(enrichedData.additionalInfo.founder) ? enrichedData.additionalInfo.founder.join(', ') : (typeof enrichedData.additionalInfo.founder === 'object' ? JSON.stringify(enrichedData.additionalInfo.founder) : enrichedData.additionalInfo.founder)}</div>
                    </div>
                    ` : ''}
                    
                    ${enrichedData.additionalInfo.ceo ? `
                    <div class='modal-detail-item' style='border-left-color: #06b6d4;'>
                        <div class='detail-label'><i class='fas fa-crown' style='margin-right: 6px; color: #06b6d4;'></i>CEO</div>
                        <div class='detail-value'>${typeof enrichedData.additionalInfo.ceo === 'object' ? JSON.stringify(enrichedData.additionalInfo.ceo) : enrichedData.additionalInfo.ceo}</div>
                    </div>
                    ` : ''}
                    
                    ${enrichedData.additionalInfo.stockSymbol || enrichedData.additionalInfo.tickerSymbol ? `
                    <div class='modal-detail-item' style='border-left-color: #84cc16;'>
                        <div class='detail-label'><i class='fas fa-chart-line' style='margin-right: 6px; color: #84cc16;'></i>Stock Symbol</div>
                        <div class='detail-value'>${enrichedData.additionalInfo.stockSymbol || enrichedData.additionalInfo.tickerSymbol}</div>
                    </div>
                    ` : ''}
                    
                    ${enrichedData.additionalInfo.stockExchange ? `
                    <div class='modal-detail-item' style='border-left-color: #a855f7;'>
                        <div class='detail-label'><i class='fas fa-building-columns' style='margin-right: 6px; color: #a855f7;'></i>Stock Exchange</div>
                        <div class='detail-value'>${typeof enrichedData.additionalInfo.stockExchange === 'object' ? JSON.stringify(enrichedData.additionalInfo.stockExchange) : enrichedData.additionalInfo.stockExchange}</div>
                    </div>
                    ` : ''}
                    
                    ${enrichedData.additionalInfo.revenue ? `
                    <div class='modal-detail-item' style='border-left-color: #22c55e;'>
                        <div class='detail-label'><i class='fas fa-dollar-sign' style='margin-right: 6px; color: #22c55e;'></i>Revenue</div>
                        <div class='detail-value'>${typeof enrichedData.additionalInfo.revenue === 'object' ? JSON.stringify(enrichedData.additionalInfo.revenue) : enrichedData.additionalInfo.revenue}</div>
                    </div>
                    ` : ''}
                    
                    ${enrichedData.additionalInfo.netIncome ? `
                    <div class='modal-detail-item' style='border-left-color: #16a34a;'>
                        <div class='detail-label'><i class='fas fa-coins' style='margin-right: 6px; color: #16a34a;'></i>Net Income</div>
                        <div class='detail-value'>${typeof enrichedData.additionalInfo.netIncome === 'object' ? JSON.stringify(enrichedData.additionalInfo.netIncome) : enrichedData.additionalInfo.netIncome}</div>
                    </div>
                    ` : ''}
                    
                    ${enrichedData.additionalInfo.totalAssets ? `
                    <div class='modal-detail-item' style='border-left-color: #0891b2;'>
                        <div class='detail-label'><i class='fas fa-wallet' style='margin-right: 6px; color: #0891b2;'></i>Total Assets</div>
                        <div class='detail-value'>${typeof enrichedData.additionalInfo.totalAssets === 'object' ? JSON.stringify(enrichedData.additionalInfo.totalAssets) : enrichedData.additionalInfo.totalAssets}</div>
                    </div>
                    ` : ''}
                    
                    ${enrichedData.additionalInfo.marketCap ? `
                    <div class='modal-detail-item' style='border-left-color: #eab308;'>
                        <div class='detail-label'><i class='fas fa-chart-pie' style='margin-right: 6px; color: #eab308;'></i>Market Cap</div>
                        <div class='detail-value'>${typeof enrichedData.additionalInfo.marketCap === 'object' ? JSON.stringify(enrichedData.additionalInfo.marketCap) : enrichedData.additionalInfo.marketCap}</div>
                    </div>
                    ` : ''}
                    
                    ${enrichedData.additionalInfo.website || enrichedData.additionalInfo.url ? `
                    <div class='modal-detail-item' style='border-left-color: #6366f1;'>
                        <div class='detail-label'><i class='fas fa-globe' style='margin-right: 6px; color: #6366f1;'></i>Website</div>
                        <div class='detail-value' style='word-break: break-all;'>
                            <a href='${enrichedData.additionalInfo.website || enrichedData.additionalInfo.url}' target='_blank' style='color: #667eea; text-decoration: none; font-weight: 700;'>${enrichedData.additionalInfo.website || enrichedData.additionalInfo.url}</a>
                        </div>
                    </div>
                    ` : ''}
                    
                    ${enrichedData.additionalInfo.telephone || enrichedData.additionalInfo.phone ? `
                    <div class='modal-detail-item' style='border-left-color: #f43f5e;'>
                        <div class='detail-label'><i class='fas fa-phone' style='margin-right: 6px; color: #f43f5e;'></i>Phone</div>
                        <div class='detail-value'>${enrichedData.additionalInfo.telephone || enrichedData.additionalInfo.phone}</div>
                    </div>
                    ` : ''}
                    
                    ${enrichedData.additionalInfo.email ? `
                    <div class='modal-detail-item' style='border-left-color: #fb923c;'>
                        <div class='detail-label'><i class='fas fa-envelope' style='margin-right: 6px; color: #fb923c;'></i>Email</div>
                        <div class='detail-value'>${enrichedData.additionalInfo.email}</div>
                    </div>
                    ` : ''}
                </div>
            </div>
            ` : ''}
            
            ${enrichedData?.links?.officialWebsite || company.domain ? `
            <!-- ✨ OFFICIAL WEBSITE BUTTON -->
            <div style='background: linear-gradient(135deg, #10b981, #059669); padding: 20px 28px; border-radius: 16px; margin-bottom: 24px; box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3); transition: all 0.3s ease;' onmouseover='this.style.transform="translateY(-4px)"; this.style.boxShadow="0 12px 36px rgba(16, 185, 129, 0.5)";' onmouseout='this.style.transform="translateY(0)"; this.style.boxShadow="0 8px 24px rgba(16, 185, 129, 0.3)";'>
                <a href='${enrichedData?.links?.officialWebsite || `https://${company.domain}`}' target='_blank' style='display: flex; align-items: center; justify-content: space-between; color: white; text-decoration: none; font-weight: 700;'>
                    <span style='display: flex; align-items: center; gap: 14px;'>
                        <i class='fas fa-globe' style='font-size: 1.8rem;'></i>
                        <span style='font-size: 1.15rem;'>Visit Official Website</span>
                    </span>
                    <i class='fas fa-arrow-right' style='font-size: 1.3rem;'></i>
                </a>
            </div>
            ` : ''}
            
            <!-- ✨ ACTIONS BUTTON -->
            <div style='display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px;'>
                <a href='advanced-analysis.html?symbol=${company.ticker}' style='background: linear-gradient(135deg, #667eea, #764ba2); color: white; text-decoration: none; padding: 16px 24px; border-radius: 14px; text-align: center; font-weight: 800; font-size: 1rem; display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4); transition: all 0.3s ease;' onmouseover='this.style.transform="translateY(-4px)"; this.style.boxShadow="0 10px 32px rgba(102, 126, 234, 0.6)";' onmouseout='this.style.transform="translateY(0)"; this.style.boxShadow="0 6px 20px rgba(102, 126, 234, 0.4)";'>
                    <i class='fas fa-chart-line'></i>
                    <span>Analyze ${company.ticker}</span>
                </a>
                <a href='trend-prediction.html?symbol=${company.ticker}' style='background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; text-decoration: none; padding: 16px 24px; border-radius: 14px; text-align: center; font-weight: 800; font-size: 1rem; display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4); transition: all 0.3s ease;' onmouseover='this.style.transform="translateY(-4px)"; this.style.boxShadow="0 10px 32px rgba(59, 130, 246, 0.6)";' onmouseout='this.style.transform="translateY(0)"; this.style.boxShadow="0 6px 20px rgba(59, 130, 246, 0.4)";'>
                    <i class='fas fa-brain'></i>
                    <span>Predict Trends</span>
                </a>
            </div>
            
            ${enrichedData && enrichedData.found ? `
            <!-- ✨ DATA SOURCE & METADATA -->
            <div style='margin-top: 32px; padding: 20px; background: rgba(241, 245, 249, 0.5); border-radius: 16px; border: 1px solid var(--glass-border);'>
                <div style='display: flex; flex-wrap: wrap; gap: 16px; align-items: center; justify-content: space-between;'>
                    <div style='display: flex; align-items: center; gap: 10px;'>
                        <i class='fas fa-database' style='color: #667eea; font-size: 1.2rem;'></i>
                        <span style='color: var(--text-secondary); font-size: 0.9rem; font-weight: 600;'>Data provided by Google Knowledge Graph API</span>
                    </div>
                    
                    ${enrichedData.metadata?.knowledgeGraphId ? `
                    <div style='display: flex; align-items: center; gap: 8px; background: rgba(102, 126, 234, 0.1); padding: 6px 14px; border-radius: 10px;'>
                        <i class='fas fa-fingerprint' style='color: #667eea; font-size: 0.9rem;'></i>
                        <span style='color: var(--text-secondary); font-size: 0.8rem; font-weight: 700; font-family: monospace;'>${enrichedData.metadata.knowledgeGraphId}</span>
                    </div>
                    ` : ''}
                </div>
                
                ${enrichedData.metadata?.totalResults > 1 ? `
                <div style='margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--glass-border);'>
                    <details style='cursor: pointer;'>
                        <summary style='font-size: 0.85rem; font-weight: 700; color: var(--text-secondary); user-select: none;'>
                            <i class='fas fa-info-circle' style='margin-right: 6px; color: #3b82f6;'></i>
                            Alternative Matches Found (${enrichedData.metadata.totalResults - 1})
                        </summary>
                        <div style='margin-top: 12px; display: flex; flex-direction: column; gap: 8px;'>
                            ${enrichedData.metadata.alternativeMatches?.map(alt => `
                                <div style='background: white; padding: 10px 14px; border-radius: 8px; border-left: 3px solid #94a3b8;'>
                                    <div style='font-weight: 700; color: var(--text-primary); font-size: 0.9rem;'>${alt.name}</div>
                                    <div style='font-size: 0.75rem; color: var(--text-tertiary); margin-top: 4px;'>
                                        Score: ${Math.round(alt.score)} | Type: ${alt.types?.[0] || 'Unknown'}
                                    </div>
                                </div>
                            `).join('') || '<p style="color: var(--text-tertiary); font-size: 0.85rem;">No alternative matches available</p>'}
                        </div>
                    </details>
                </div>
                ` : ''}
            </div>
            ` : `
            <!-- ⚠ NO ENRICHED DATA WARNING -->
            <div style='margin-top: 24px; padding: 20px; background: rgba(245, 158, 11, 0.1); border-left: 4px solid #f59e0b; border-radius: 12px;'>
                <div style='display: flex; align-items: center; gap: 12px;'>
                    <i class='fas fa-exclamation-triangle' style='color: #f59e0b; font-size: 1.5rem;'></i>
                    <div>
                        <div style='font-weight: 800; color: var(--text-primary); margin-bottom: 4px;'>Limited Data Available</div>
                        <div style='font-size: 0.9rem; color: var(--text-secondary);'>No additional information found in Google Knowledge Graph for this company.</div>
                    </div>
                </div>
            </div>
            `}
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