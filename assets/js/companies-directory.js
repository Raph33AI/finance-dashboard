/**
 * ════════════════════════════════════════════════════════════════
 * COMPANIES DIRECTORY - MAIN SCRIPT - 100% RESPONSIVE
 * AlphaVault AI - Répertoire des Entreprises Cotées
 * Logos automatiques via Clearbit API + Fallback
 * ════════════════════════════════════════════════════════════════
 */

class CompaniesDirectory {
    constructor() {
        this.allCompanies = [];
        this.filteredCompanies = [];
        this.currentView = 'grid';
        this.currentSort = 'name-asc';
        this.filters = {
            search: '',
            sector: 'all',
            region: 'all'
        };
        
        // ✅ Mapping domaines pour logos Clearbit
        this.companyDomains = {
            'AAPL': 'apple.com',
            'MSFT': 'microsoft.com',
            'GOOGL': 'google.com',
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
            'TWLO': 'twilio.com',
            'OKTA': 'okta.com',
            'CRWD': 'crowdstrike.com',
            'DDOG': 'datadoghq.com',
            'MDB': 'mongodb.com',
            'SPLK': 'splunk.com',
            'WDAY': 'workday.com',
            'ADSK': 'autodesk.com',
            'DELL': 'dell.com',
            'HPQ': 'hp.com',
            'MU': 'micron.com',
            'JPM': 'jpmorganchase.com',
            'BAC': 'bankofamerica.com',
            'WFC': 'wellsfargo.com',
            'C': 'citigroup.com',
            'GS': 'goldmansachs.com',
            'MS': 'morganstanley.com',
            'SCHW': 'schwab.com',
            'AXP': 'americanexpress.com',
            'V': 'visa.com',
            'MA': 'mastercard.com',
            'COIN': 'coinbase.com',
            'BLK': 'blackrock.com',
            'JNJ': 'jnj.com',
            'UNH': 'unitedhealthgroup.com',
            'PFE': 'pfizer.com',
            'LLY': 'lilly.com',
            'ABBV': 'abbvie.com',
            'MRK': 'merck.com',
            'ABT': 'abbott.com',
            'TMO': 'thermofisher.com',
            'DHR': 'danaher.com',
            'BMY': 'bms.com',
            'AMGN': 'amgen.com',
            'GILD': 'gilead.com',
            'REGN': 'regeneron.com',
            'VRTX': 'vrtx.com',
            'MRNA': 'modernatx.com',
            'BNTX': 'biontech.com',
            'ISRG': 'intuitive.com',
            'MDT': 'medtronic.com',
            'CVS': 'cvshealth.com',
            'WMT': 'walmart.com',
            'COST': 'costco.com',
            'HD': 'homedepot.com',
            'TGT': 'target.com',
            'LOW': 'lowes.com',
            'NKE': 'nike.com',
            'LULU': 'lululemon.com',
            'KO': 'coca-cola.com',
            'PEP': 'pepsico.com',
            'MDLZ': 'mondelezinternational.com',
            'SBUX': 'starbucks.com',
            'MCD': 'mcdonalds.com',
            'XOM': 'exxonmobil.com',
            'CVX': 'chevron.com',
            'COP': 'conocophillips.com',
            'SLB': 'slb.com',
            'NEE': 'nexteraenergy.com',
            'BA': 'boeing.com',
            'CAT': 'caterpillar.com',
            'HON': 'honeywell.com',
            'MMM': '3m.com',
            'GE': 'ge.com',
            'LMT': 'lockheedmartin.com',
            'RTX': 'rtx.com',
            'NOC': 'northropgrumman.com',
            'GD': 'gd.com',
            'DE': 'deere.com',
            'UPS': 'ups.com',
            'FDX': 'fedex.com',
            'F': 'ford.com',
            'GM': 'gm.com',
            'RIVN': 'rivian.com',
            'LCID': 'lucidmotors.com',
            'VZ': 'verizon.com',
            'T': 'att.com',
            'TMUS': 't-mobile.com',
            'CMCSA': 'comcast.com',
            'DIS': 'thewaltdisneycompany.com',
            'NWSA': 'newscorp.com',
            'AMT': 'americantower.com',
            'PLD': 'prologis.com',
            'EQIX': 'equinix.com',
            'BHP': 'bhp.com',
            'RIO': 'riotinto.com',
            'NEM': 'newmont.com',
            'SAP': 'sap.com',
            'ASML': 'asml.com',
            'ERIC': 'ericsson.com',
            'NOK': 'nokia.com',
            'BABA': 'alibaba.com',
            'TCEHY': 'tencent.com',
            'TSM': 'tsmc.com',
            'SONY': 'sony.com',
            'BIDU': 'baidu.com',
            'JD': 'jd.com',
            'NIO': 'nio.com',
            'LI': 'lixiang.com',
            'XPEV': 'xiaopeng.com',
            'SFTBY': 'softbank.com',
            'NTDOY': 'nintendo.com',
            'INFY': 'infosys.com',
            'WIT': 'wipro.com',
            'HDB': 'hdfcbank.com',
            'IBN': 'icicibank.com'
        };
        
        // ✅ Secteurs détaillés (OUT EU précisé)
        this.detailedSectors = {
            // USA
            'AAPL': 'Technology - Consumer Electronics',
            'MSFT': 'Technology - Software',
            'GOOGL': 'Technology - Internet Services',
            'AMZN': 'Technology - E-Commerce & Cloud',
            'META': 'Technology - Social Media',
            'TSLA': 'Automotive - Electric Vehicles',
            'NVDA': 'Technology - Semiconductors (AI/GPU)',
            'NFLX': 'Media - Streaming Services',
            'ADBE': 'Technology - Creative Software',
            'CRM': 'Technology - Enterprise Software (CRM)',
            'ORCL': 'Technology - Database Software',
            'INTC': 'Technology - Semiconductors (CPUs)',
            'AMD': 'Technology - Semiconductors (CPUs/GPUs)',
            'QCOM': 'Technology - Semiconductors (Mobile)',
            'AVGO': 'Technology - Semiconductors (Wireless)',
            'TXN': 'Technology - Semiconductors (Analog)',
            'CSCO': 'Technology - Networking Equipment',
            'IBM': 'Technology - IT Services & Software',
            'ACN': 'Consulting - IT Services',
            'NOW': 'Technology - Cloud Workflows',
            'INTU': 'Technology - Financial Software',
            'PYPL': 'Fintech - Digital Payments',
            'SQ': 'Fintech - Payment Processing',
            'SNOW': 'Technology - Cloud Data Platform',
            'PLTR': 'Technology - Big Data Analytics',
            'ZM': 'Technology - Video Communications',
            'SHOP': 'Technology - E-Commerce Platform',
            'UBER': 'Technology - Ride-Hailing',
            'LYFT': 'Technology - Ride-Hailing',
            'ABNB': 'Technology - Vacation Rentals',
            'DASH': 'Technology - Food Delivery',
            'SNAP': 'Technology - Social Media',
            'PINS': 'Technology - Social Discovery',
            'SPOT': 'Media - Music Streaming',
            'RBLX': 'Gaming - Metaverse Platform',
            'TWLO': 'Technology - Cloud Communications',
            'OKTA': 'Technology - Identity Management',
            'CRWD': 'Cybersecurity - Endpoint Protection',
            'DDOG': 'Technology - Monitoring & Analytics',
            'MDB': 'Technology - Database (NoSQL)',
            'SPLK': 'Technology - Data Analytics',
            'WDAY': 'Technology - Enterprise Cloud (HR/Finance)',
            'ADSK': 'Technology - Design Software (CAD)',
            'DELL': 'Technology - Computers & IT',
            'HPQ': 'Technology - Personal Computing',
            'MU': 'Technology - Memory Chips',
            'JPM': 'Banking - Investment Banking',
            'BAC': 'Banking - Commercial Banking',
            'WFC': 'Banking - Diversified Banking',
            'C': 'Banking - Global Banking',
            'GS': 'Banking - Investment Banking',
            'MS': 'Banking - Investment Banking',
            'SCHW': 'Financial Services - Brokerage',
            'AXP': 'Financial Services - Credit Cards',
            'V': 'Fintech - Payment Networks',
            'MA': 'Fintech - Payment Networks',
            'COIN': 'Fintech - Cryptocurrency Exchange',
            'BLK': 'Asset Management - ETFs & Funds',
            'JNJ': 'Healthcare - Pharmaceuticals & Devices',
            'UNH': 'Healthcare - Health Insurance',
            'PFE': 'Pharmaceuticals - Drug Manufacturing',
            'LLY': 'Pharmaceuticals - Diabetes & Oncology',
            'ABBV': 'Pharmaceuticals - Immunology',
            'MRK': 'Pharmaceuticals - Vaccines & Drugs',
            'ABT': 'Healthcare - Medical Devices',
            'TMO': 'Healthcare - Lab Equipment',
            'DHR': 'Healthcare - Life Sciences',
            'BMY': 'Pharmaceuticals - Oncology',
            'AMGN': 'Biotechnology - Biologics',
            'GILD': 'Biotechnology - Antivirals',
            'REGN': 'Biotechnology - Monoclonal Antibodies',
            'VRTX': 'Biotechnology - Gene Therapy',
            'MRNA': 'Biotechnology - mRNA Vaccines',
            'BNTX': 'Biotechnology - mRNA Vaccines',
            'ISRG': 'Medical Devices - Robotic Surgery',
            'MDT': 'Medical Devices - Cardiovascular',
            'CVS': 'Healthcare - Pharmacy Retail',
            'WMT': 'Retail - Supermarkets',
            'COST': 'Retail - Warehouse Clubs',
            'HD': 'Retail - Home Improvement',
            'TGT': 'Retail - Discount Stores',
            'LOW': 'Retail - Home Improvement',
            'NKE': 'Consumer Goods - Athletic Footwear',
            'LULU': 'Consumer Goods - Athletic Apparel',
            'KO': 'Beverages - Soft Drinks',
            'PEP': 'Beverages - Snacks & Drinks',
            'MDLZ': 'Food - Snacks & Confectionery',
            'SBUX': 'Restaurants - Coffee Chains',
            'MCD': 'Restaurants - Fast Food',
            'XOM': 'Energy - Oil & Gas (Integrated)',
            'CVX': 'Energy - Oil & Gas (Integrated)',
            'COP': 'Energy - Oil & Gas (Exploration)',
            'SLB': 'Energy - Oilfield Services',
            'NEE': 'Utilities - Renewable Energy',
            'BA': 'Aerospace - Aircraft Manufacturing',
            'CAT': 'Industrials - Construction Equipment',
            'HON': 'Industrials - Aerospace & Automation',
            'MMM': 'Industrials - Diversified Manufacturing',
            'GE': 'Industrials - Aerospace & Power',
            'LMT': 'Defense - Aerospace & Missiles',
            'RTX': 'Defense - Aerospace & Defense',
            'NOC': 'Defense - Aerospace & Cyber',
            'GD': 'Defense - Combat Systems',
            'DE': 'Agriculture - Farm Equipment',
            'UPS': 'Logistics - Package Delivery',
            'FDX': 'Logistics - Express Transportation',
            'F': 'Automotive - Vehicles',
            'GM': 'Automotive - Vehicles',
            'RIVN': 'Automotive - Electric Trucks',
            'LCID': 'Automotive - Electric Luxury Cars',
            'VZ': 'Telecommunications - Wireless',
            'T': 'Telecommunications - Wireless & Media',
            'TMUS': 'Telecommunications - Wireless',
            'CMCSA': 'Media - Cable & Broadband',
            'DIS': 'Media - Entertainment & Streaming',
            'NWSA': 'Media - Publishing & News',
            'AMT': 'Real Estate - Cell Towers',
            'PLD': 'Real Estate - Logistics Warehouses',
            'EQIX': 'Real Estate - Data Centers',
            'BHP': 'Mining - Diversified Metals',
            'RIO': 'Mining - Iron Ore & Copper',
            'NEM': 'Mining - Gold',
            
            // Europe
            'SAP': 'Technology - Enterprise Software (OUT EU - Germany)',
            'ASML': 'Technology - Semiconductor Equipment (OUT EU - Netherlands)',
            'ERIC': 'Telecommunications - Network Equipment (OUT EU - Sweden)',
            'NOK': 'Telecommunications - Mobile Networks (OUT EU - Finland)',
            'LVMUY': 'Luxury Goods - Fashion & Accessories (OUT EU - France)',
            'NVO': 'Pharmaceuticals - Diabetes Care (OUT EU - Denmark)',
            'RHHBY': 'Pharmaceuticals - Oncology (OUT EU - Switzerland)',
            'NVS': 'Pharmaceuticals - Generics & Drugs (OUT EU - Switzerland)',
            'SNY': 'Pharmaceuticals - Vaccines (OUT EU - France)',
            'AZN': 'Pharmaceuticals - Oncology (OUT EU - UK)',
            'GSK': 'Pharmaceuticals - Vaccines & Drugs (OUT EU - UK)',
            'BAYRY': 'Pharmaceuticals & Agriculture (OUT EU - Germany)',
            'SHEL': 'Energy - Oil & Gas (OUT EU - UK)',
            'BP': 'Energy - Oil & Gas (OUT EU - UK)',
            'TTE': 'Energy - Oil & Gas (OUT EU - France)',
            'EQNR': 'Energy - Oil & Gas (OUT EU - Norway)',
            'SIEGY': 'Industrials - Automation & Electrification (OUT EU - Germany)',
            'ABB': 'Industrials - Robotics & Power (OUT EU - Switzerland)',
            'EADSY': 'Aerospace - Aircraft Manufacturing (OUT EU - France)',
            'RYCEY': 'Aerospace - Jet Engines (OUT EU - UK)',
            'BAESY': 'Defense - Aerospace & Naval (OUT EU - UK)',
            'VWAGY': 'Automotive - Vehicles (OUT EU - Germany)',
            'BMWYY': 'Automotive - Luxury Vehicles (OUT EU - Germany)',
            'STLA': 'Automotive - Vehicles (OUT EU - Italy/France)',
            'VOD': 'Telecommunications - Mobile (OUT EU - UK)',
            'ORAN': 'Telecommunications - Mobile (OUT EU - France)',
            'DTEGY': 'Telecommunications - Mobile (OUT EU - Germany)',
            'NSRGY': 'Food - Nutrition & Beverages (OUT EU - Switzerland)',
            'UL': 'Consumer Goods - Household Products (OUT EU - UK/Netherlands)',
            'DEO': 'Beverages - Spirits (OUT EU - UK)',
            'HEINY': 'Beverages - Beer (OUT EU - Netherlands)',
            'BUD': 'Beverages - Beer (OUT EU - Belgium)',
            'ADDYY': 'Consumer Goods - Sportswear (OUT EU - Germany)',
            'TSCDY': 'Retail - Supermarkets (OUT EU - UK)',
            
            // Asie
            'BABA': 'Technology - E-Commerce (OUT EU - China)',
            'TCEHY': 'Technology - Social Media & Gaming (OUT EU - China)',
            'TSM': 'Technology - Semiconductor Manufacturing (OUT EU - Taiwan)',
            'SSNLF': 'Technology - Consumer Electronics (OUT EU - South Korea)',
            'SONY': 'Technology - Gaming & Electronics (OUT EU - Japan)',
            'BIDU': 'Technology - Search Engine (OUT EU - China)',
            'JD': 'Technology - E-Commerce (OUT EU - China)',
            'NIO': 'Automotive - Electric Vehicles (OUT EU - China)',
            'LI': 'Automotive - Electric SUVs (OUT EU - China)',
            'XPEV': 'Automotive - Electric Vehicles (OUT EU - China)',
            'BYDDY': 'Automotive - Electric Vehicles & Batteries (OUT EU - China)',
            'SFTBY': 'Conglomerate - Telecom & Investments (OUT EU - Japan)',
            'NTDOY': 'Gaming - Console & Games (OUT EU - Japan)',
            'INFY': 'Technology - IT Services (OUT EU - India)',
            'WIT': 'Technology - IT Consulting (OUT EU - India)',
            'HDB': 'Banking - Retail Banking (OUT EU - India)',
            'IBN': 'Banking - Retail Banking (OUT EU - India)',
            'TM': 'Automotive - Vehicles (OUT EU - Japan)',
            'HMC': 'Automotive - Motorcycles & Cars (OUT EU - Japan)',
            'NSANY': 'Automotive - Vehicles (OUT EU - Japan)',
            'HYMTF': 'Automotive - Vehicles (OUT EU - South Korea)',
            'CHL': 'Telecommunications - Mobile (OUT EU - China)',
            'SKM': 'Telecommunications - Mobile (OUT EU - South Korea)',
            'PTR': 'Energy - Oil & Gas (OUT EU - China)',
            'SNP': 'Energy - Oil & Gas (OUT EU - China)'
        };
        
        this.init();
    }
    
    init() {
        console.log('🏢 Initializing Companies Directory...');
        
        // Load companies from entity database
        this.loadCompanies();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Render initial view
        this.renderCompanies();
        this.updateStats();
        this.renderCharts();
        
        console.log('✅ Companies Directory initialized!');
    }
    
    loadCompanies() {
        if (!window.entityDB) {
            console.error('❌ EntityDatabase not found!');
            return;
        }
        
        const companiesObj = window.entityDB.companies;
        
        // Convert to array format
        this.allCompanies = Object.entries(companiesObj).map(([name, ticker]) => {
            const sector = this.getDetailedSector(ticker);
            const region = this.getRegionForTicker(ticker);
            const domain = this.companyDomains[ticker];
            
            return {
                name: name,
                ticker: ticker,
                sector: sector,
                region: region,
                domain: domain,
                logoUrl: domain ? `https://logo.clearbit.com/${domain}` : null
            };
        });
        
        // Remove duplicates (same ticker)
        const seen = new Set();
        this.allCompanies = this.allCompanies.filter(company => {
            if (seen.has(company.ticker)) {
                return false;
            }
            seen.add(company.ticker);
            return true;
        });
        
        this.filteredCompanies = [...this.allCompanies];
        
        console.log(`📊 Loaded ${this.allCompanies.length} companies`);
    }
    
    getDetailedSector(ticker) {
        return this.detailedSectors[ticker] || 'Other';
    }
    
    getRegionForTicker(ticker) {
        const sector = this.detailedSectors[ticker] || '';
        
        if (sector.includes('OUT EU - China') || sector.includes('OUT EU - Taiwan') || 
            sector.includes('OUT EU - Japan') || sector.includes('OUT EU - South Korea') ||
            sector.includes('OUT EU - India')) {
            return 'Asia';
        }
        
        if (sector.includes('OUT EU -')) {
            return 'Europe';
        }
        
        // Fallback sur format ticker
        if (ticker.includes('.PA') || ticker.includes('.DE') || ticker.includes('.L') || 
            ticker.includes('.AS') || ticker.includes('.MC') || ticker.includes('.MI')) {
            return 'Europe';
        }
        
        if (ticker.includes('.HK') || ticker.includes('.T') || ticker.includes('.SS') || 
            ticker.includes('.KS') || ticker.includes('.NS')) {
            return 'Asia';
        }
        
        return 'USA';
    }
    
    setupEventListeners() {
        // Search
        const searchInput = document.getElementById('companySearch');
        const clearBtn = document.getElementById('clearSearch');
        
        searchInput?.addEventListener('input', (e) => {
            this.filters.search = e.target.value;
            clearBtn.style.display = e.target.value ? 'flex' : 'none';
            this.applyFilters();
        });
        
        clearBtn?.addEventListener('click', () => {
            searchInput.value = '';
            this.filters.search = '';
            clearBtn.style.display = 'none';
            this.applyFilters();
        });
        
        // Filters
        document.getElementById('sectorFilter')?.addEventListener('change', (e) => {
            this.filters.sector = e.target.value;
            this.applyFilters();
        });
        
        document.getElementById('regionFilter')?.addEventListener('change', (e) => {
            this.filters.region = e.target.value;
            this.applyFilters();
        });
        
        document.getElementById('sortBy')?.addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.applyFilters();
        });
        
        // Reset filters
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
            clearBtn.style.display = 'none';
            this.applyFilters();
        });
        
        // View toggles
        document.querySelectorAll('.view-toggle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.view-toggle').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.currentView = e.currentTarget.dataset.view;
                this.renderCompanies();
            });
        });
    }
    
    applyFilters() {
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
            const region = this.filters.region.charAt(0).toUpperCase() + this.filters.region.slice(1);
            filtered = filtered.filter(company => company.region === region);
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
        this.renderCompanies();
        this.updateStats();
    }
    
    renderCompanies() {
        const container = document.getElementById('companiesContainer');
        const loadingState = document.getElementById('loadingState');
        const noResults = document.getElementById('noResults');
        
        if (!container) return;
        
        // Update container class based on view
        container.className = this.currentView === 'grid' ? 'companies-grid' : 
                            this.currentView === 'list' ? 'companies-list' : 
                            'companies-compact';
        
        if (this.filteredCompanies.length === 0) {
            container.innerHTML = '';
            noResults.style.display = 'block';
            return;
        }
        
        noResults.style.display = 'none';
        
        container.innerHTML = this.filteredCompanies.map(company => {
            const initials = company.name.substring(0, 2).toUpperCase();
            
            return `
                <div class='company-card' onclick='CompaniesDirectory.openCompanyModal("${company.ticker}")'>
                    <div class='company-header'>
                        <div class='company-logo ${!company.logoUrl ? 'text-fallback' : ''}' data-ticker='${company.ticker}'>
                            ${company.logoUrl 
                                ? `<img src='${company.logoUrl}' alt='${company.name}' onerror='CompaniesDirectory.handleLogoError(this, "${initials}")'>` 
                                : initials
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
        logoDiv.classList.add('text-fallback');
        logoDiv.innerHTML = initials;
        console.log(`⚠ Logo not found, using fallback: ${initials}`);
    }
    
    static handleLogoError(img, ticker, name) {
        const logoDiv = img.parentElement;
        logoDiv.classList.remove('loading');
        logoDiv.innerHTML = name.substring(0, 2).toUpperCase();
        console.log(`⚠ Logo not found for ${ticker}, using fallback`);
    }
    
    updateStats() {
        document.getElementById('totalCompanies').textContent = this.allCompanies.length.toLocaleString();
        document.getElementById('filteredCompanies').textContent = this.filteredCompanies.length.toLocaleString();
        
        // Count unique sectors
        const sectors = new Set(this.allCompanies.map(c => c.sector));
        document.getElementById('totalSectors').textContent = sectors.size;
        
        // Count unique regions
        const regions = new Set(this.allCompanies.map(c => c.region));
        document.getElementById('totalRegions').textContent = regions.size;
        
        // Populate sector filter
        const sectorFilter = document.getElementById('sectorFilter');
        if (sectorFilter && sectorFilter.options.length === 1) {
            Array.from(sectors).sort().forEach(sector => {
                const option = document.createElement('option');
                option.value = sector;
                option.textContent = sector;
                sectorFilter.appendChild(option);
            });
        }
        
        // Populate region filter
        const regionFilter = document.getElementById('regionFilter');
        if (regionFilter && regionFilter.options.length === 4) {
            // Already has All/USA/Europe/Asia
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
            // Group by main sector (first part before " - ")
            const mainSector = company.sector.split(' - ')[0];
            sectorCounts[mainSector] = (sectorCounts[mainSector] || 0) + 1;
        });
        
        const data = Object.entries(sectorCounts)
            .map(([name, y]) => ({ name, y }))
            .sort((a, b) => b.y - a.y)
            .slice(0, 15); // Top 15 sectors
        
        Highcharts.chart('sectorChart', {
            chart: {
                type: 'pie',
                backgroundColor: 'transparent'
            },
            title: {
                text: 'Companies by Main Sector (Top 15)',
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
                text: 'Companies by Geographic Region',
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
    
    static openCompanyModal(ticker) {
        const instance = window.companiesDirectoryInstance;
        const company = instance.allCompanies.find(c => c.ticker === ticker);
        
        if (!company) return;
        
        const modal = document.getElementById('companyModal');
        const modalContent = document.getElementById('companyModalContent');
        
        modalContent.innerHTML = `
            <div class='company-modal-header'>
                <div class='company-modal-logo'>
                    ${company.logoUrl 
                        ? `<img src='${company.logoUrl}' alt='${company.name}' onerror='this.parentElement.innerHTML="${company.name.substring(0, 2).toUpperCase()}"'>` 
                        : company.name.substring(0, 2).toUpperCase()
                    }
                </div>
                <div class='company-modal-info'>
                    <h3>${company.name}</h3>
                    <div class='company-ticker'>${company.ticker}</div>
                </div>
            </div>
            
            <div class='company-modal-details'>
                <div class='detail-group'>
                    <h4>Sector</h4>
                    <p>${company.sector}</p>
                </div>
                <div class='detail-group'>
                    <h4>Region</h4>
                    <p>${company.region}</p>
                </div>
                <div class='detail-group'>
                    <h4>Ticker Symbol</h4>
                    <p>${company.ticker}</p>
                </div>
                ${company.domain ? `
                <div class='detail-group'>
                    <h4>Website</h4>
                    <p><a href='https://${company.domain}' target='_blank' style='color: #667eea; text-decoration: none; font-weight: 700;'>${company.domain} <i class='fas fa-external-link-alt' style='font-size: 0.85rem; margin-left: 4px;'></i></a></p>
                </div>
                ` : ''}
            </div>
            
            <div style='margin-top: 32px; text-align: center; display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;'>
                <a href='advanced-analysis.html?symbol=${company.ticker}' class='filter-btn' style='display: inline-flex; text-decoration: none;'>
                    <i class='fas fa-chart-line'></i>
                    <span>Analyze ${company.ticker}</span>
                </a>
                <a href='trend-prediction.html?symbol=${company.ticker}' class='filter-btn' style='display: inline-flex; text-decoration: none; background: linear-gradient(135deg, #10b981, #059669);'>
                    <i class='fas fa-brain'></i>
                    <span>Predict Trends</span>
                </a>
            </div>
        `;
        
        document.getElementById('modalCompanyName').textContent = company.name;
        modal.classList.add('active');
    }
    
    static closeModal() {
        document.getElementById('companyModal').classList.remove('active');
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    window.companiesDirectoryInstance = new CompaniesDirectory();
});

// Close modal on outside click
document.addEventListener('click', (e) => {
    const modal = document.getElementById('companyModal');
    if (e.target === modal) {
        CompaniesDirectory.closeModal();
    }
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        CompaniesDirectory.closeModal();
    }
});