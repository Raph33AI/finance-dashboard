/**
 * ════════════════════════════════════════════════════════════════
 * 🏛 COMPANIES DIRECTORY - SYSTÈME COMPLET V3.1
 * Multi-API Logos + Google Knowledge Graph + 15 Secteurs + Régions
 * Cache FIRESTORE : Synchronisation multi-appareils ✨
 * ✅ NOUVEAU : Intégration rapports financiers SEC EDGAR
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
        
        // ✅ URLs des Workers Cloudflare
        this.knowledgeGraphWorkerUrl = 'https://google-knowledge-api.raphnardone.workers.dev';
        this.secWorkerUrl = 'https://sec-edgar-api.raphnardone.workers.dev';
        
        // ✅ Cache local des données enrichies
        this.enrichedDataCache = new Map();
        
        // ✅ Durée du cache = 30 JOURS (1 MOIS)
        this.CACHE_DURATION_MS = 30 * 24 * 60 * 60 * 1000;
        
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
            'JPM': 'jpmorganchase.com',
            'BAC': 'bankofamerica.com',
            'WFC': 'wellsfargo.com',
            'C': 'citigroup.com',
            'GS': 'goldmansachs.com',
            'MS': 'morganstanley.com',
            'V': 'visa.com',
            'MA': 'mastercard.com',
            'COIN': 'coinbase.com',
            'JNJ': 'jnj.com',
            'UNH': 'unitedhealthgroup.com',
            'PFE': 'pfizer.com',
            'LLY': 'lilly.com',
            'ABBV': 'abbvie.com',
            'MRK': 'merck.com',
            'ABT': 'abbott.com',
            'TMO': 'thermofisher.com',
            'WMT': 'walmart.com',
            'COST': 'costco.com',
            'HD': 'homedepot.com',
            'TGT': 'target.com',
            'NKE': 'nike.com',
            'KO': 'coca-colacompany.com',
            'PEP': 'pepsico.com',
            'MCD': 'mcdonalds.com',
            'SBUX': 'starbucks.com',
            'XOM': 'exxonmobil.com',
            'CVX': 'chevron.com',
            'BA': 'boeing.com',
            'CAT': 'caterpillar.com',
            'HON': 'honeywell.com',
            'GE': 'ge.com',
            'SAP': 'sap.com',
            'ASML': 'asml.com',
            'LVMUY': 'lvmh.com',
            'NVO': 'novonordisk.com',
            'SHEL': 'shell.com',
            'BP': 'bp.com',
            'BABA': 'alibaba.com',
            'TCEHY': 'tencent.com',
            'TSM': 'tsmc.com',
            'SONY': 'sony.com',
            'TM': 'toyota.com'
        };
    }
    
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

    async init() {
        console.log('🏢 Initializing Companies Directory...');
        console.log(`   🌐 KG Worker: ${this.knowledgeGraphWorkerUrl}`);
        console.log(`   📊 SEC Worker: ${this.secWorkerUrl}`);
        
        this.showLoadingIndicator();
        this.loadCompanies();
        this.setupEventListeners();
        
        const cacheLoaded = await this.loadEnrichedCacheFromFirestore();
        
        if (cacheLoaded && this.enrichedDataCache.size > 0) {
            const cacheStats = this.getCacheStats();
            console.log(`💾 Firestore cache loaded: ${this.enrichedDataCache.size} profiles (${cacheStats.ageDays} days old)`);
            this.updatePreloadStatus(`✅ Loaded ${this.enrichedDataCache.size} cached profiles from Firestore`);
        }
        
        await this.preloadEnrichedData(100);
        
        this.applyFiltersAndPagination();
        this.updateStats();
        this.renderCharts();
        this.hideLoadingIndicator();
        this.restoreDropdownStates();
        
        console.log('✅ Companies Directory initialized!');
    }

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
    
    hideLoadingIndicator() {
        // Le container sera remplacé par renderCompanies()
    }
    
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
    
    getMainSector(ticker) {
        for (const [sectorName, tickers] of Object.entries(this.mainSectors)) {
            if (tickers.includes(ticker)) {
                return sectorName;
            }
        }
        return 'Other';
    }
    
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
     * ✅ NOUVELLE MÉTHODE : Récupérer les rapports financiers SEC
     */
    async fetchFinancialReports(ticker) {
        try {
            console.log(`📊 Fetching financial reports for ${ticker}...`);
            
            const response = await fetch(
                `${this.secWorkerUrl}/api/sec/company-filings?ticker=${ticker}&limit=10&types=10-K,10-Q,8-K`
            );
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            
            if (result.error) {
                throw new Error(result.error);
            }
            
            console.log(`✅ Loaded ${result.count} financial reports for ${ticker}`);
            return result;
            
        } catch (error) {
            console.error(`❌ Error fetching financial reports for ${ticker}:`, error);
            return null;
        }
    }

    async saveEnrichedCacheToFirestore() {
        try {
            if (!firebase.auth().currentUser) {
                console.warn('⚠ No user logged in, skipping Firestore cache save');
                return false;
            }
            
            const userId = firebase.auth().currentUser.uid;
            const cacheArray = Array.from(this.enrichedDataCache.entries());
            
            const cacheData = {
                version: '3.1',
                timestamp: Date.now(),
                count: cacheArray.length,
                data: cacheArray,
                workerUrl: this.knowledgeGraphWorkerUrl,
                userId: userId,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            await firebase.firestore()
                .collection('companiesCache')
                .doc(userId)
                .set(cacheData, { merge: true });
            
            console.log(`💾 Firestore cache saved: ${cacheArray.length} profiles`);
            return true;
        } catch (error) {
            console.warn('⚠ Failed to save Firestore cache:', error.message);
            return false;
        }
    }

    async loadEnrichedCacheFromFirestore() {
        try {
            if (!firebase.auth().currentUser) {
                console.warn('⚠ No user logged in, skipping Firestore cache load');
                return false;
            }
            
            const userId = firebase.auth().currentUser.uid;
            
            const doc = await firebase.firestore()
                .collection('companiesCache')
                .doc(userId)
                .get();
            
            if (!doc.exists) {
                console.log('📭 No Firestore cache found for this user');
                return false;
            }
            
            const cacheData = doc.data();
            
            if (!cacheData || !cacheData.data || !cacheData.timestamp) {
                console.warn('⚠ Invalid Firestore cache structure, clearing...');
                await firebase.firestore()
                    .collection('companiesCache')
                    .doc(userId)
                    .delete();
                return false;
            }
            
            const age = Date.now() - cacheData.timestamp;
            
            if (age > this.CACHE_DURATION_MS) {
                const days = Math.floor(age / (24 * 60 * 60 * 1000));
                console.log(`🗑 Firestore cache expired (${days} days old), clearing...`);
                await firebase.firestore()
                    .collection('companiesCache')
                    .doc(userId)
                    .delete();
                return false;
            }
            
            this.enrichedDataCache = new Map(cacheData.data);
            
            const days = Math.floor(age / (24 * 60 * 60 * 1000));
            console.log(`💾 Loaded ${this.enrichedDataCache.size} cached profiles (${days} days old)`);
            
            return true;
            
        } catch (error) {
            console.warn('⚠ Failed to load Firestore cache:', error.message);
            return false;
        }
    }

    async clearEnrichedCacheFromFirestore() {
        try {
            this.enrichedDataCache.clear();
            
            if (firebase.auth().currentUser) {
                const userId = firebase.auth().currentUser.uid;
                await firebase.firestore()
                    .collection('companiesCache')
                    .doc(userId)
                    .delete();
            }
            
            console.log('🗑 Firestore enriched cache cleared');
            return true;
        } catch (error) {
            console.warn('⚠ Failed to clear Firestore cache:', error.message);
            return false;
        }
    }

    getCacheStats() {
        const size = this.enrichedDataCache.size;
        
        if (size === 0) {
            return {
                exists: false,
                size: 0,
                age: 0,
                sizeKB: 0
            };
        }
        
        return {
            exists: true,
            size: size,
            age: 0,
            ageHours: 0,
            ageDays: 0,
            expiresInDays: 30,
            sizeKB: 0,
            version: '3.1'
        };
    }

    async preloadEnrichedData(count = 100, forceRefresh = false) {
        console.log(`🔄 Pre-loading enriched data for ${count} companies...`);
        
        if (forceRefresh) {
            console.log('🔄 Force refresh requested, clearing cache...');
            await this.clearEnrichedCacheFromFirestore();
        }
        
        if (!forceRefresh && this.enrichedDataCache.size >= count) {
            console.log(`✅ Cache already sufficient (${this.enrichedDataCache.size} profiles)`);
            this.updatePreloadStatus(`✅ Loaded ${this.enrichedDataCache.size} cached profiles from Firestore`);
            return;
        }
        
        this.preloadingStatus.isLoading = true;
        this.preloadingStatus.total = Math.min(count, this.allCompanies.length);
        this.preloadingStatus.loaded = this.enrichedDataCache.size;
        this.preloadingStatus.errors = 0;
        this.preloadingStatus.startTime = Date.now();
        
        const topCompanies = this.allCompanies.slice(0, count);
        const companiesToLoad = forceRefresh 
            ? topCompanies 
            : topCompanies.filter(c => !this.enrichedDataCache.has(c.ticker));
        
        if (companiesToLoad.length === 0) {
            console.log('✅ All companies already cached!');
            this.preloadingStatus.isLoading = false;
            this.updatePreloadStatus(`✅ All ${this.enrichedDataCache.size} profiles already cached`);
            return;
        }
        
        console.log(`📋 Loading ${companiesToLoad.length} companies (${this.enrichedDataCache.size} already cached)`);
        
        const batchSize = 50;
        const batches = [];
        
        for (let i = 0; i < companiesToLoad.length; i += batchSize) {
            batches.push(companiesToLoad.slice(i, i + batchSize));
        }
        
        console.log(`📦 Processing ${batches.length} batch(es)...`);
        
        for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
            const batch = batches[batchIndex];
            const batchNum = batchIndex + 1;
            
            this.updatePreloadStatus(`⏳ Batch ${batchNum}/${batches.length} (${this.preloadingStatus.loaded}/${this.preloadingStatus.total})...`);
            
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
                }
                
                await this.saveEnrichedCacheToFirestore();
                
                if (batchIndex < batches.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
                
            } catch (error) {
                console.error(`❌ Batch ${batchNum} failed:`, error.message);
                this.preloadingStatus.errors += batch.length;
            }
        }
        
        this.preloadingStatus.isLoading = false;
        const duration = ((Date.now() - this.preloadingStatus.startTime) / 1000).toFixed(1);
        
        console.log(`✅ Pre-loading completed in ${duration}s! (${this.enrichedDataCache.size} loaded, ${this.preloadingStatus.errors} errors)`);
        
        this.updatePreloadStatus(`✅ ${this.enrichedDataCache.size} profiles loaded and synced to Firestore`);
        this.updateStats();
    }

    async fetchEnrichedData(company) {
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
                await this.saveEnrichedCacheToFirestore();
                return result.data;
            }
            
            return null;
        } catch (error) {
            console.error(`❌ Error fetching ${company.ticker}:`, error);
            return null;
        }
    }

    static toggleDropdown(sectionId) {
        const section = document.getElementById(sectionId);
        const toggle = section?.querySelector('.dropdown-toggle');
        const content = section?.querySelector('.dropdown-content');
        
        if (!section || !toggle || !content) return;
        
        const isOpen = content.classList.contains('open');
        
        if (isOpen) {
            content.classList.remove('open');
            toggle.querySelector('i').classList.remove('fa-chevron-up');
            toggle.querySelector('i').classList.add('fa-chevron-down');
        } else {
            content.classList.add('open');
            toggle.querySelector('i').classList.remove('fa-chevron-down');
            toggle.querySelector('i').classList.add('fa-chevron-up');
        }
        
        localStorage.setItem(`dropdown_${sectionId}`, isOpen ? 'closed' : 'open');
    }

    restoreDropdownStates() {
        const sections = ['combinedSection'];
        
        sections.forEach(sectionId => {
            const state = localStorage.getItem(`dropdown_${sectionId}`);
            const section = document.getElementById(sectionId);
            const content = section?.querySelector('.dropdown-content');
            const toggle = section?.querySelector('.dropdown-toggle i');
            
            if (!content || !toggle) return;
            
            if (state === 'closed') {
                content.classList.remove('open');
                toggle.classList.remove('fa-chevron-up');
                toggle.classList.add('fa-chevron-down');
            } else {
                content.classList.add('open');
                toggle.classList.remove('fa-chevron-down');
                toggle.classList.add('fa-chevron-up');
            }
        });
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
        
        if (this.filters.search) {
            const search = this.filters.search.toLowerCase();
            filtered = filtered.filter(company => 
                company.name.toLowerCase().includes(search) ||
                company.ticker.toLowerCase().includes(search)
            );
        }
        
        if (this.filters.sector !== 'all') {
            filtered = filtered.filter(company => company.sector === this.filters.sector);
        }
        
        if (this.filters.region !== 'all') {
            filtered = filtered.filter(company => company.region.toLowerCase() === this.filters.region.toLowerCase());
        }
        
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
    
    static handleLogoError(img, initials) {
        const logoDiv = img.parentElement;
        const fallbacks = JSON.parse(logoDiv.dataset.fallbacks || '[]');
        
        if (fallbacks.length > 0) {
            const nextUrl = fallbacks.shift();
            logoDiv.dataset.fallbacks = JSON.stringify(fallbacks);
            img.src = nextUrl;
        } else {
            logoDiv.classList.add('text-fallback');
            logoDiv.innerHTML = initials;
        }
    }
    
    static handleModalLogoError(img, initials) {
        const logoDiv = img.parentElement;
        const fallbacks = JSON.parse(logoDiv.dataset.fallbacks || '[]');
        
        if (fallbacks.length > 0) {
            const nextUrl = fallbacks.shift();
            logoDiv.dataset.fallbacks = JSON.stringify(fallbacks);
            img.src = nextUrl;
        } else {
            logoDiv.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
            logoDiv.style.color = 'white';
            logoDiv.innerHTML = `<div style='font-size: 2.5rem; font-weight: 900; color: white;'>${initials}</div>`;
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
     * ✅ MODAL ENRICHI AVEC RAPPORTS FINANCIERS SEC
     */
    static async openCompanyModal(ticker) {
        const instance = window.companiesDirectoryInstance;
        const company = instance.allCompanies.find(c => c.ticker === ticker);
        
        if (!company) return;
        
        const modal = document.getElementById('companyModal');
        const modalContent = document.getElementById('companyModalContent');
        
        modalContent.innerHTML = `
            <div style='text-align: center; padding: 80px 20px;'>
                <div class='chart-loading-spinner' style='margin: 0 auto 20px;'></div>
                <div class='chart-loading-text'>Loading comprehensive company data...</div>
                <p style='margin-top: 12px; font-size: 0.85rem; color: var(--text-tertiary);'>
                    Fetching from Google Knowledge Graph & SEC EDGAR APIs
                </p>
            </div>
        `;
        
        modal.classList.add('active');
        
        // ✅ CHARGER EN PARALLÈLE
        const [enrichedData, financialReports] = await Promise.all([
            instance.fetchEnrichedData(company),
            instance.fetchFinancialReports(company.ticker)
        ]);
        
        const initials = company.name.substring(0, 2).toUpperCase();
        const logoUrl = company.logoUrl;
        const logoFallbacks = company.logoFallbacks || [];
        
        const hasDescription = enrichedData?.description?.detailed || enrichedData?.description?.short;
        const description = enrichedData?.description?.detailed || enrichedData?.description?.short || 'No description available.';
        const descriptionUrl = enrichedData?.description?.source || enrichedData?.links?.wikipedia || '';
        
        // ✅ SECTION RAPPORTS FINANCIERS
        const reportsHTML = financialReports && financialReports.reports && financialReports.reports.length > 0 ? `
        <div style='background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(37, 99, 235, 0.05)); padding: 24px; border-radius: 16px; margin-bottom: 24px; border: 1px solid rgba(59, 130, 246, 0.2);'>
            <h4 style='display: flex; align-items: center; gap: 10px; margin-bottom: 20px; font-size: 1.15rem; font-weight: 800; color: var(--text-primary);'>
                <i class='fas fa-file-invoice-dollar' style='color: #3b82f6;'></i>
                <span>Recent Financial Reports & Earnings</span>
            </h4>
            
            ${financialReports.reports.slice(0, 5).map(report => {
                const reportDate = new Date(report.filedDate);
                const formattedDate = reportDate.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                });
                
                let badgeClass = 'current';
                let badgeColor = 'linear-gradient(135deg, #f59e0b, #d97706)';
                if (report.formType === '10-K') {
                    badgeClass = 'annual';
                    badgeColor = 'linear-gradient(135deg, #10b981, #059669)';
                } else if (report.formType === '10-Q') {
                    badgeClass = 'quarterly';
                    badgeColor = 'linear-gradient(135deg, #3b82f6, #2563eb)';
                }
                
                let reportTypeLabel = report.formType;
                if (report.formType === '10-K') reportTypeLabel = '10-K (Annual)';
                else if (report.formType === '10-Q') reportTypeLabel = '10-Q (Quarterly)';
                else if (report.formType === '8-K') reportTypeLabel = '8-K (Current)';
                
                return `
                <div style='background: white; padding: 16px 20px; border-radius: 12px; margin-bottom: 12px; border: 1px solid rgba(203, 213, 225, 0.25); transition: all 0.3s ease; cursor: pointer;' onclick='window.open("${report.documentUrl}", "_blank")' onmouseover='this.style.borderColor="rgba(59, 130, 246, 0.5)"; this.style.transform="translateX(4px)"; this.style.boxShadow="0 4px 16px rgba(59, 130, 246, 0.15)";' onmouseout='this.style.borderColor="rgba(203, 213, 225, 0.25)"; this.style.transform="translateX(0)"; this.style.boxShadow="none";'>
                    <div style='display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;'>
                        <div style='flex: 1; min-width: 200px;'>
                            <div style='display: flex; align-items: center; gap: 10px; margin-bottom: 6px;'>
                                <span style='display: inline-block; padding: 4px 12px; border-radius: 8px; font-size: 0.75rem; font-weight: 800; letter-spacing: 0.5px; color: white; background: ${badgeColor};'>${reportTypeLabel}</span>
                                <span style='color: var(--text-tertiary); font-size: 0.85rem; font-weight: 600;'>${formattedDate}</span>
                            </div>
                            <div style='color: var(--text-primary); font-weight: 700; font-size: 0.95rem;'>
                                ${report.title}
                            </div>
                            ${report.summary ? `
                            <div style='color: var(--text-secondary); font-size: 0.85rem; margin-top: 4px; line-height: 1.5;'>
                                ${report.summary.substring(0, 150)}${report.summary.length > 150 ? '...' : ''}
                            </div>
                            ` : ''}
                        </div>
                        
                        <div style='display: flex; align-items: center; gap: 12px;'>
                            <a href='${report.filingUrl}' target='_blank' onclick='event.stopPropagation();' style='color: #667eea; text-decoration: none; font-weight: 700; font-size: 0.85rem; display: flex; align-items: center; gap: 6px; padding: 8px 16px; background: rgba(102, 126, 234, 0.1); border-radius: 8px; transition: all 0.3s ease;' onmouseover='this.style.background="rgba(102, 126, 234, 0.2)";' onmouseout='this.style.background="rgba(102, 126, 234, 0.1)";'>
                                <i class='fas fa-file-alt'></i>
                                <span>Filing</span>
                            </a>
                            <a href='${report.documentUrl}' target='_blank' onclick='event.stopPropagation();' style='color: white; text-decoration: none; font-weight: 700; font-size: 0.85rem; display: flex; align-items: center; gap: 6px; padding: 8px 16px; background: linear-gradient(135deg, #3b82f6, #2563eb); border-radius: 8px; transition: all 0.3s ease; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);' onmouseover='this.style.transform="translateY(-2px)"; this.style.boxShadow="0 6px 18px rgba(59, 130, 246, 0.5)";' onmouseout='this.style.transform="translateY(0)"; this.style.boxShadow="0 4px 12px rgba(59, 130, 246, 0.3)";'>
                                <i class='fas fa-eye'></i>
                                <span>View</span>
                            </a>
                        </div>
                    </div>
                </div>
                `;
            }).join('')}
            
            ${financialReports.reports.length > 5 ? `
            <div style='text-align: center; margin-top: 16px;'>
                <a href='https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${financialReports.cik}&type=&dateb=&owner=exclude&count=100' target='_blank' style='color: #3b82f6; text-decoration: none; font-weight: 700; font-size: 0.95rem; display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; background: rgba(59, 130, 246, 0.1); border-radius: 10px; transition: all 0.3s ease;' onmouseover='this.style.background="rgba(59, 130, 246, 0.2)"; this.style.transform="translateX(4px)";' onmouseout='this.style.background="rgba(59, 130, 246, 0.1)"; this.style.transform="translateX(0)";'>
                    <span>View All ${financialReports.count} Filings on SEC.gov</span>
                    <i class='fas fa-arrow-right'></i>
                </a>
            </div>
            ` : ''}
        </div>
        ` : `
        <div style='margin-bottom: 24px; padding: 20px; background: rgba(241, 245, 249, 0.5); border-left: 4px solid #94a3b8; border-radius: 12px;'>
            <div style='display: flex; align-items: center; gap: 12px;'>
                <i class='fas fa-info-circle' style='color: #94a3b8; font-size: 1.3rem;'></i>
                <div style='color: var(--text-secondary); font-size: 0.95rem;'>No recent financial reports available from SEC EDGAR.</div>
            </div>
        </div>
        `;
        
        // ✅ MODAL HTML COMPLET
        modalContent.innerHTML = `
            <div style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 32px; border-radius: 24px 24px 0 0; margin: -24px -24px 32px -24px; position: relative; overflow: hidden;'>
                <div style='position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255, 255, 255, 0.05) 10px, rgba(255, 255, 255, 0.05) 20px); animation: moveStripes 20s linear infinite;'></div>
                
                <div style='position: relative; z-index: 1;'>
                    <div id='modalCompanyLogo' class='modal-company-logo' data-ticker='${company.ticker}' data-fallbacks='${JSON.stringify(logoFallbacks).replace(/'/g, '&apos;')}' data-initials='${initials}' style='width: 120px; height: 120px; background: white; border-radius: 24px; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2); border: 3px solid rgba(255, 255, 255, 0.5); overflow: hidden;'>
                        ${logoUrl 
                            ? `<img src='${logoUrl}' alt='${company.name}' style='width: 100%; height: 100%; object-fit: contain; padding: 12px; background: white; border-radius: 24px;' onerror='CompaniesDirectory.handleModalLogoError(this, "${initials}")'>` 
                            : `<div style='font-size: 2.5rem; font-weight: 900; background: linear-gradient(135deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;'>${initials}</div>`
                        }
                    </div>
                    
                    <h2 style='color: white; font-size: 2.2rem; font-weight: 900; text-align: center; margin-bottom: 12px; text-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);'>${company.name}</h2>
                    
                    <div style='text-align: center; margin-bottom: 16px;'>
                        <span style='background: rgba(255, 255, 255, 0.25); backdrop-filter: blur(10px); color: white; padding: 10px 24px; border-radius: 24px; font-size: 1.2rem; font-weight: 800; letter-spacing: 1px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2); border: 2px solid rgba(255, 255, 255, 0.4);'>${company.ticker}</span>
                    </div>
                    
                    ${enrichedData && enrichedData.found ? `
                    <div style='text-align: center;'>
                        <div style='display: inline-flex; align-items: center; gap: 8px; background: rgba(16, 185, 129, 0.2); backdrop-filter: blur(10px); color: white; padding: 8px 20px; border-radius: 20px; font-size: 0.9rem; font-weight: 700; border: 2px solid rgba(16, 185, 129, 0.5);'>
                            <i class='fas fa-check-circle'></i>
                            <span>Verified by Google Knowledge Graph</span>
                        </div>
                    </div>
                    ` : ''}
                </div>
            </div>
            
            ${hasDescription ? `
            <div style='margin-bottom: 24px;'>
                <h4 style='font-size: 1.15rem; font-weight: 800; margin-bottom: 12px; color: var(--text-primary);'><i class='fas fa-info-circle'></i> About ${company.name}</h4>
                <p style='color: var(--text-secondary); line-height: 1.8; font-size: 1rem; margin-bottom: 16px;'>${description}</p>
                ${descriptionUrl ? `
                    <a href='${descriptionUrl}' target='_blank' style='display: inline-flex; align-items: center; gap: 8px; color: #667eea; font-weight: 700; text-decoration: none; padding: 10px 20px; background: rgba(102, 126, 234, 0.1); border-radius: 12px; transition: all 0.3s ease;' onmouseover='this.style.background="rgba(102, 126, 234, 0.2)"; this.style.transform="translateX(4px)";' onmouseout='this.style.background="rgba(102, 126, 234, 0.1)"; this.style.transform="translateX(0)";'>
                        <i class='fas fa-external-link-alt'></i>
                        <span>Read more on Wikipedia</span>
                    </a>
                ` : ''}
            </div>
            ` : ''}
            
            <div style='margin-bottom: 24px;'>
                <h4 style='font-size: 1.15rem; font-weight: 800; margin-bottom: 12px; color: var(--text-primary);'><i class='fas fa-building'></i> Company Information</h4>
                <div style='display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;'>
                    <div style='background: rgba(102, 126, 234, 0.05); padding: 12px 16px; border-radius: 10px; border-left: 3px solid #667eea;'>
                        <div style='font-size: 0.8rem; color: var(--text-tertiary); font-weight: 700; margin-bottom: 4px;'>Sector</div>
                        <div style='font-size: 1rem; font-weight: 700; color: var(--text-primary);'>${company.sector}</div>
                    </div>
                    <div style='background: rgba(16, 185, 129, 0.05); padding: 12px 16px; border-radius: 10px; border-left: 3px solid #10b981;'>
                        <div style='font-size: 0.8rem; color: var(--text-tertiary); font-weight: 700; margin-bottom: 4px;'>Region</div>
                        <div style='font-size: 1rem; font-weight: 700; color: var(--text-primary);'>${company.region}</div>
                    </div>
                </div>
            </div>
            
            ${reportsHTML}
            
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
        `;
    }
    
    static showKGScoreModal(score) {
        const kgModal = document.getElementById('kgScoreModal');
        const scoreValue = document.getElementById('kgScoreValue');
        const scoreInterpretation = document.getElementById('kgScoreInterpretation');
        
        if (!kgModal) return;
        
        scoreValue.textContent = Math.round(score).toLocaleString();
        
        let interpretation = '';
        let color = '';
        let icon = '';
        
        if (score >= 1000) {
            interpretation = '<strong>Exceptionally High Confidence</strong> - This entity is extremely well-documented in Google\'s Knowledge Graph with comprehensive verified information.';
            color = '#10b981';
            icon = 'fa-star';
        } else if (score >= 500) {
            interpretation = '<strong>High Confidence</strong> - Well-established entity with substantial verified information available.';
            color = '#3b82f6';
            icon = 'fa-check-circle';
        } else if (score >= 100) {
            interpretation = '<strong>Moderate Confidence</strong> - Entity recognized with verified basic information.';
            color = '#f59e0b';
            icon = 'fa-info-circle';
        } else {
            interpretation = '<strong>Lower Confidence</strong> - Limited verified information available for this entity.';
            color = '#ef4444';
            icon = 'fa-exclamation-triangle';
        }
        
        scoreInterpretation.innerHTML = `
            <div style='display: flex; align-items: flex-start; gap: 12px;'>
                <i class='fas ${icon}' style='color: ${color}; font-size: 1.5rem; margin-top: 4px;'></i>
                <div style='flex: 1; line-height: 1.8;'>
                    <p style='margin-bottom: 12px;'>${interpretation}</p>
                    <div style='background: rgba(102, 126, 234, 0.1); padding: 12px 16px; border-radius: 10px; border-left: 3px solid ${color};'>
                        <strong>Your Score: ${Math.round(score).toLocaleString()}</strong>
                    </div>
                </div>
            </div>
        `;
        
        kgModal.classList.add('active');
    }
    
    static closeModal() {
        document.getElementById('companyModal').classList.remove('active');
    }
    
    static closeKGScoreModal() {
        document.getElementById('kgScoreModal').classList.remove('active');
    }
}

// ✅ INITIALISATION
document.addEventListener('DOMContentLoaded', () => {
    window.companiesDirectoryInstance = new CompaniesDirectory();
});

// ✅ FERMETURE MODAL (clic extérieur)
document.addEventListener('click', (e) => {
    const modal = document.getElementById('companyModal');
    const kgModal = document.getElementById('kgScoreModal');
    
    if (e.target === modal) {
        CompaniesDirectory.closeModal();
    }
    
    if (e.target === kgModal) {
        CompaniesDirectory.closeKGScoreModal();
    }
});

// ✅ FERMETURE MODAL (touche Escape)
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        CompaniesDirectory.closeModal();
        CompaniesDirectory.closeKGScoreModal();
    }
});