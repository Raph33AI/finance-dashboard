/**
 * ════════════════════════════════════════════════════════════════
 * COMPANIES DIRECTORY - MAIN SCRIPT
 * AlphaVault AI - Répertoire des Entreprises Cotées
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
        
        this.sectors = {
            'Tech Giants & Software': ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA', 'NFLX', 'ADBE', 'CRM', 'ORCL', 'INTC', 'AMD', 'QCOM', 'AVGO', 'TXN', 'CSCO', 'IBM', 'ACN', 'NOW', 'INTU', 'PYPL', 'SQ', 'SNOW', 'PLTR', 'ZM', 'SHOP', 'UBER', 'LYFT', 'ABNB', 'DASH', 'SNAP', 'PINS', 'SPOT', 'RBLX', 'U', 'TWLO', 'OKTA', 'CRWD', 'DDOG', 'MDB', 'SPLK', 'WDAY', 'ADSK', 'VMW', 'DELL', 'HPQ', 'HPE', 'WDC', 'STX', 'MU', 'AMAT', 'LRCX', 'KLAC', 'ADI', 'MRVL', 'SNPS', 'CDNS', 'SAP', 'ASML', 'ERIC', 'NOK', 'STM', 'BABA', 'TCEHY', 'SSNLF', 'TSM', 'SONY', 'BIDU', 'JD', 'NTES', 'PDD', 'NIO', 'LI', 'XPEV', 'BYDDY', 'SFTBY', 'NTDOY', 'INFY', 'WIT'],
            'Finance & Banking': ['JPM', 'BAC', 'WFC', 'C', 'GS', 'MS', 'USB', 'PNC', 'TFC', 'COF', 'SCHW', 'AXP', 'DFS', 'SYF', 'V', 'MA', 'AFRM', 'SOFI', 'HOOD', 'COIN', 'BLK', 'STT', 'BK', 'NTRS', 'TROW', 'BEN', 'IVZ', 'RJF', 'IBKR', 'ETFC', 'AMTD', 'ALLY', 'HSBC', 'BCS', 'LYG', 'DB', 'UBS', 'CS', 'ING', 'SAN', 'BBVA', 'IDCBY', 'CICHY', 'HDB', 'IBN', 'MUFG', 'SMFG', 'MFG', 'NMR'],
            'Healthcare & Pharmaceuticals': ['JNJ', 'UNH', 'PFE', 'LLY', 'ABBV', 'MRK', 'ABT', 'TMO', 'DHR', 'BMY', 'AMGN', 'GILD', 'REGN', 'VRTX', 'MRNA', 'BNTX', 'BIIB', 'ILMN', 'ISRG', 'SYK', 'BSX', 'MDT', 'BAX', 'BDX', 'CI', 'HUM', 'CVS', 'WBA', 'MCK', 'CAH', 'ABC', 'ZBH', 'EW', 'IDXX', 'WAT', 'A', 'NVO', 'RHHBY', 'NVS', 'SNY', 'AZN', 'GSK', 'BAYRY'],
            'Consumer & Retail': ['WMT', 'COST', 'HD', 'TGT', 'LOW', 'TJX', 'DG', 'DLTR', 'BBY', 'EBAY', 'ETSY', 'W', 'GPS', 'ROST', 'BURL', 'JWN', 'M', 'KSS', 'FL', 'NKE', 'LULU', 'UAA', 'VFC', 'RL', 'TPR', 'CPRI', 'LVMUY', 'ADDYY', 'TSCDY'],
            'Food & Beverage': ['KO', 'PEP', 'MDLZ', 'KHC', 'GIS', 'K', 'CAG', 'CPB', 'HSY', 'MNST', 'STZ', 'TAP', 'TSN', 'HRL', 'SJM', 'MKC', 'LW', 'NSRGY', 'DANOY', 'UL', 'DEO', 'HEINY', 'BUD', 'PDRDY'],
            'Energy & Utilities': ['XOM', 'CVX', 'COP', 'OXY', 'MPC', 'VLO', 'PSX', 'EOG', 'PXD', 'SLB', 'HAL', 'BKR', 'KMI', 'WMB', 'OKE', 'LNG', 'NEE', 'DUK', 'SO', 'D', 'EXC', 'AEP', 'SRE', 'XEL', 'WEC', 'ES', 'PEG', 'SHEL', 'BP', 'TTE', 'EQNR', 'E', 'PTR', 'SNP', 'CEO'],
            'Industrials & Manufacturing': ['BA', 'CAT', 'HON', 'MMM', 'GE', 'LMT', 'RTX', 'NOC', 'GD', 'LHX', 'DE', 'CARR', 'OTIS', 'PH', 'ETN', 'EMR', 'ITW', 'ROK', 'JCI', 'CMI', 'PCAR', 'WAB', 'NSC', 'UNP', 'CSX', 'KSU', 'FDX', 'UPS', 'XPO', 'JBHT', 'ODFL', 'SIEGY', 'ABB', 'EADSY', 'SAFRY', 'RYCEY', 'BAESY'],
            'Automotive': ['F', 'GM', 'RIVN', 'LCID', 'NKLA', 'FSR', 'VWAGY', 'BMWYY', 'MBGAF', 'POAHY', 'RACE', 'STLA', 'TM', 'HMC', 'NSANY', 'HYMTF'],
            'Telecommunications & Media': ['VZ', 'T', 'TMUS', 'CMCSA', 'CHTR', 'DIS', 'WBD', 'PARA', 'SIRI', 'FOX', 'NWSA', 'LYV', 'VOD', 'ORAN', 'DTEGY', 'TEF', 'CHL', 'CHA', 'CHU', 'SKM', 'KT'],
            'Real Estate & Construction': ['AMT', 'PLD', 'CCI', 'EQIX', 'PSA', 'SPG', 'O', 'VICI', 'WELL', 'AVB', 'EQR', 'DLR', 'SBAC', 'LEN', 'DHI', 'PHM', 'NVR', 'TOL'],
            'Mining & Materials': ['BHP', 'RIO', 'VALE', 'GLNCY', 'FCX', 'NEM', 'GOLD', 'AA', 'MT', 'NUE', 'STLD', 'TECK', 'SCCO'],
            'Luxury Goods': ['LVMUY', 'CFRHF', 'SWGAY', 'BURBY', 'GOOS'],
            'Chemicals & Agriculture': ['BASFY', 'DOW', 'DD', 'LIN', 'AIQUY', 'APD', 'SHW', 'PPG', 'ECL', 'CTVA', 'BAYRY', 'CF', 'MOS', 'NTR', 'IFF']
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
            const sector = this.getSectorForTicker(ticker);
            const region = this.getRegionForTicker(ticker);
            
            return {
                name: name,
                ticker: ticker,
                sector: sector,
                region: region,
                logo: this.getCompanyLogo(ticker, name)
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
    
    getSectorForTicker(ticker) {
        for (const [sector, tickers] of Object.entries(this.sectors)) {
            if (tickers.includes(ticker)) {
                return sector;
            }
        }
        return 'Other';
    }
    
    getRegionForTicker(ticker) {
        // Simple heuristic based on ticker format and common patterns
        if (ticker.includes('.PA') || ticker.includes('.DE') || ticker.includes('.L') || 
            ticker.includes('.AS') || ticker.includes('.MC') || ticker.includes('.MI')) {
            return 'Europe';
        }
        
        if (ticker.includes('.HK') || ticker.includes('.T') || ticker.includes('.SS') || 
            ticker.includes('.KS') || ticker.includes('.NS') || ticker.includes('TSM') ||
            ticker.includes('BABA') || ticker.includes('TCEHY') || ticker.includes('SONY')) {
            return 'Asia';
        }
        
        return 'USA';
    }
    
    getCompanyLogo(ticker, name) {
        // Use first 2 letters of name as fallback
        return name.substring(0, 2).toUpperCase();
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
        
        container.innerHTML = this.filteredCompanies.map(company => `
            <div class='company-card' onclick='CompaniesDirectory.openCompanyModal("${company.ticker}")'>
                <div class='company-header'>
                    <div class='company-logo'>
                        ${company.logo}
                    </div>
                    <div class='company-info'>
                        <div class='company-name' title='${company.name}'>${company.name}</div>
                        <div class='company-ticker'>${company.ticker}</div>
                    </div>
                </div>
                <div class='company-details'>
                    <div class='company-detail'>
                        <i class='fas fa-map-marker-alt'></i>
                        <span>${company.region}</span>
                    </div>
                </div>
                <div class='company-sector'>${company.sector}</div>
            </div>
        `).join('');
    }
    
    updateStats() {
        document.getElementById('totalCompanies').textContent = this.allCompanies.length.toLocaleString();
        document.getElementById('filteredCompanies').textContent = this.filteredCompanies.length.toLocaleString();
        
        // Count unique sectors
        const sectors = new Set(this.allCompanies.map(c => c.sector));
        document.getElementById('totalSectors').textContent = sectors.size;
        
        // Count unique countries (simplified)
        const regions = new Set(this.allCompanies.map(c => c.region));
        document.getElementById('totalCountries').textContent = regions.size;
        
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
        
        const data = Object.entries(sectorCounts).map(([name, y]) => ({ name, y }));
        
        Highcharts.chart('sectorChart', {
            chart: {
                type: 'pie',
                backgroundColor: 'transparent'
            },
            title: {
                text: 'Companies by Sector'
            },
            plotOptions: {
                pie: {
                    innerSize: '50%',
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b>: {point.percentage:.1f}%'
                    }
                }
            },
            series: [{
                name: 'Companies',
                data: data
            }]
        });
    }
    
    renderRegionChart() {
        if (typeof Highcharts === 'undefined') return;
        
        const regionCounts = {};
        this.allCompanies.forEach(company => {
            regionCounts[company.region] = (regionCounts[company.region] || 0) + 1;
        });
        
        const categories = Object.keys(regionCounts);
        const data = Object.values(regionCounts);
        
        Highcharts.chart('regionChart', {
            chart: {
                type: 'column',
                backgroundColor: 'transparent'
            },
            title: {
                text: 'Companies by Region'
            },
            xAxis: {
                categories: categories
            },
            yAxis: {
                title: {
                    text: 'Number of Companies'
                }
            },
            series: [{
                name: 'Companies',
                data: data,
                colorByPoint: true
            }],
            legend: {
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
                    ${company.logo}
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
            </div>
            
            <div style='margin-top: 32px; text-align: center;'>
                <a href='advanced-analysis.html?symbol=${company.ticker}' class='filter-btn' style='display: inline-flex; text-decoration: none;'>
                    <i class='fas fa-chart-line'></i>
                    <span>Analyze ${company.ticker}</span>
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