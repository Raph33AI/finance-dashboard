/**
 * ════════════════════════════════════════════════════════════════
 * COMPANIES DIRECTORY - MAIN SCRIPT - 100% RESPONSIVE
 * AlphaVault AI - Répertoire des Entreprises Cotées
 * Logos automatiques via Google Favicons + Unavatar
 * Pagination 20 entreprises/page
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
        
        // ✅ Mapping domaines COMPLET (USA + Europe + Asie)
        this.companyDomains = {
            // USA - Tech
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
            
            // USA - Finance
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
            
            // USA - Healthcare
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
            
            // USA - Consumer
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
            'MCD': 'mcdonalds.com',
            'SBUX': 'starbucks.com',
            
            // USA - Energy
            'XOM': 'exxonmobil.com',
            'CVX': 'chevron.com',
            'COP': 'conocophillips.com',
            'SLB': 'slb.com',
            'NEE': 'nexteraenergy.com',
            
            // USA - Industrials
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
            'FDX': 'fedex.com',
            'UPS': 'ups.com',
            
            // USA - Automotive
            'F': 'ford.com',
            'GM': 'gm.com',
            'RIVN': 'rivian.com',
            'LCID': 'lucidmotors.com',
            
            // USA - Telecom
            'VZ': 'verizon.com',
            'T': 'att.com',
            'TMUS': 't-mobile.com',
            'CMCSA': 'comcast.com',
            'DIS': 'thewaltdisneycompany.com',
            'NWSA': 'newscorp.com',
            
            // USA - Real Estate
            'AMT': 'americantower.com',
            'PLD': 'prologis.com',
            'EQIX': 'equinix.com',
            
            // USA - Mining
            'BHP': 'bhp.com',
            'RIO': 'riotinto.com',
            'NEM': 'newmont.com',
            
            // ✅ EUROPE - Tech
            'SAP': 'sap.com',
            'ASML': 'asml.com',
            'ERIC': 'ericsson.com',
            'NOK': 'nokia.com',
            'STM': 'st.com',
            
            // Europe - Luxury
            'LVMUY': 'lvmh.com',
            'RMS.PA': 'hermes.com',
            'KER.PA': 'kering.com',
            'CFRHF': 'richemont.com',
            'SWGAY': 'swatchgroup.com',
            'BURBY': 'burberryplc.com',
            'MONC.MI': 'moncler.com',
            
            // Europe - Pharma
            'NVO': 'novonordisk.com',
            'RHHBY': 'roche.com',
            'NVS': 'novartis.com',
            'SNY': 'sanofi.com',
            'AZN': 'astrazeneca.com',
            'GSK': 'gsk.com',
            'BAYRY': 'bayer.com',
            
            // Europe - Energy
            'SHEL': 'shell.com',
            'BP': 'bp.com',
            'TTE': 'totalenergies.com',
            'EQNR': 'equinor.com',
            'E': 'eni.com',
            
            // Europe - Industrials
            'SIEGY': 'siemens.com',
            'ABB': 'abb.com',
            'EADSY': 'airbus.com',
            'RYCEY': 'rolls-royce.com',
            'BAESY': 'baesystems.com',
            
            // Europe - Automotive
            'VWAGY': 'volkswagen.com',
            'BMWYY': 'bmw.com',
            'MBGAF': 'mercedes-benz.com',
            'STLA': 'stellantis.com',
            'RACE': 'ferrari.com',
            
            // Europe - Telecom
            'VOD': 'vodafone.com',
            'ORAN': 'orange.com',
            'DTEGY': 'telekom.com',
            
            // Europe - Consumer
            'NSRGY': 'nestle.com',
            'UL': 'unilever.com',
            'DEO': 'diageo.com',
            'HEINY': 'heineken.com',
            'BUD': 'ab-inbev.com',
            'ADDYY': 'adidas.com',
            'TSCDY': 'tesco.com',
            
            // ✅ ASIE - Tech
            'BABA': 'alibaba.com',
            'TCEHY': 'tencent.com',
            'TSM': 'tsmc.com',
            'SSNLF': 'samsung.com',
            'SONY': 'sony.com',
            'BIDU': 'baidu.com',
            'JD': 'jd.com',
            'NIO': 'nio.com',
            'LI': 'lixiang.com',
            'XPEV': 'xiaopeng.com',
            'BYDDY': 'byd.com',
            'SFTBY': 'softbank.com',
            'NTDOY': 'nintendo.com',
            'INFY': 'infosys.com',
            'WIT': 'wipro.com',
            
            // Asie - Finance
            'HDB': 'hdfcbank.com',
            'IBN': 'icicibank.com',
            'MUFG': 'mufg.jp',
            
            // Asie - Automotive
            'TM': 'toyota.com',
            'HMC': 'honda.com',
            'NSANY': 'nissan.com',
            'HYMTF': 'hyundai.com',
            
            // Asie - Energy
            'PTR': 'petrochina.com',
            'SNP': 'sinopec.com'
        };
        
        // ✅ Secteurs détaillés SANS "OUT EU"
        this.detailedSectors = {
            // USA - Technology
            'AAPL': 'Technology - Consumer Electronics',
            'MSFT': 'Technology - Software & Cloud',
            'GOOGL': 'Technology - Internet Services & AI',
            'AMZN': 'Technology - E-Commerce & Cloud (AWS)',
            'META': 'Technology - Social Media & VR',
            'TSLA': 'Automotive - Electric Vehicles & Energy',
            'NVDA': 'Technology - Semiconductors (AI/GPU)',
            'NFLX': 'Media - Streaming Entertainment',
            'ADBE': 'Technology - Creative Software (Photoshop)',
            'CRM': 'Technology - Enterprise CRM Software',
            'ORCL': 'Technology - Database & Cloud',
            'INTC': 'Technology - Semiconductors (CPUs)',
            'AMD': 'Technology - Semiconductors (CPUs/GPUs)',
            'QCOM': 'Technology - Mobile Chips & 5G',
            'AVGO': 'Technology - Wireless Semiconductors',
            'TXN': 'Technology - Analog Semiconductors',
            'CSCO': 'Technology - Networking Equipment',
            'IBM': 'Technology - Enterprise IT & Consulting',
            'ACN': 'Consulting - IT Services & Strategy',
            'NOW': 'Technology - Cloud Workflow Automation',
            'INTU': 'Technology - Financial Software (QuickBooks)',
            'PYPL': 'Fintech - Digital Payments',
            'SQ': 'Fintech - Payment Processing',
            'SNOW': 'Technology - Cloud Data Platform',
            'PLTR': 'Technology - Big Data & AI Analytics',
            'ZM': 'Technology - Video Communications',
            'SHOP': 'Technology - E-Commerce Platform',
            'UBER': 'Technology - Ride-Hailing & Delivery',
            'LYFT': 'Technology - Ride-Sharing',
            'ABNB': 'Technology - Vacation Rentals Platform',
            'DASH': 'Technology - Food Delivery',
            'SNAP': 'Technology - Social Media (Snapchat)',
            'PINS': 'Technology - Visual Discovery Platform',
            'SPOT': 'Media - Music Streaming',
            'RBLX': 'Gaming - Metaverse Platform',
            'TWLO': 'Technology - Cloud Communications API',
            'OKTA': 'Cybersecurity - Identity Management',
            'CRWD': 'Cybersecurity - Endpoint Protection',
            'DDOG': 'Technology - Cloud Monitoring',
            'MDB': 'Technology - NoSQL Database',
            'SPLK': 'Technology - Data Analytics',
            'WDAY': 'Technology - HR & Finance Cloud',
            'ADSK': 'Technology - CAD & 3D Design',
            'DELL': 'Technology - PCs & IT Infrastructure',
            'HPQ': 'Technology - Personal Computing',
            'HPE': 'Technology - Enterprise IT',
            'WDC': 'Technology - Data Storage',
            'STX': 'Technology - Hard Drives',
            'MU': 'Technology - Memory Chips (DRAM)',
            'AMAT': 'Technology - Semiconductor Equipment',
            'LRCX': 'Technology - Chip Manufacturing Tools',
            'KLAC': 'Technology - Wafer Inspection',
            'ADI': 'Technology - Analog Semiconductors',
            'MRVL': 'Technology - Data Infrastructure Chips',
            'SNPS': 'Technology - Electronic Design Automation',
            'CDNS': 'Technology - Chip Design Software',
            
            // USA - Finance & Banking
            'JPM': 'Banking - Investment Banking',
            'BAC': 'Banking - Commercial Banking',
            'WFC': 'Banking - Diversified Banking',
            'C': 'Banking - Global Banking',
            'GS': 'Banking - Investment Banking & Trading',
            'MS': 'Banking - Investment Banking',
            'USB': 'Banking - Regional Banking',
            'PNC': 'Banking - Regional Banking',
            'TFC': 'Banking - Regional Banking (Truist)',
            'COF': 'Banking - Consumer Banking & Credit Cards',
            'SCHW': 'Financial Services - Discount Brokerage',
            'AXP': 'Financial Services - Credit Cards & Travel',
            'DFS': 'Financial Services - Credit Cards (Discover)',
            'SYF': 'Financial Services - Consumer Credit',
            'V': 'Fintech - Payment Networks',
            'MA': 'Fintech - Payment Networks',
            'AFRM': 'Fintech - Buy Now Pay Later',
            'SOFI': 'Fintech - Digital Banking',
            'HOOD': 'Fintech - Trading Platform',
            'COIN': 'Fintech - Cryptocurrency Exchange',
            'BLK': 'Asset Management - ETFs & Index Funds',
            'STT': 'Financial Services - Custody & Asset Servicing',
            'BK': 'Financial Services - Custody & Wealth',
            'NTRS': 'Financial Services - Wealth Management',
            'TROW': 'Asset Management - Mutual Funds',
            'BEN': 'Asset Management - Franklin Templeton',
            'IVZ': 'Asset Management - Invesco',
            'RJF': 'Financial Services - Wealth Management',
            'IBKR': 'Financial Services - Online Brokerage',
            'ETFC': 'Financial Services - E-Trade',
            'AMTD': 'Financial Services - TD Ameritrade',
            'ALLY': 'Banking - Online Banking',
            
            // USA - Healthcare
            'JNJ': 'Healthcare - Pharmaceuticals & Medical Devices',
            'UNH': 'Healthcare - Health Insurance',
            'PFE': 'Pharmaceuticals - Vaccines & Drugs',
            'LLY': 'Pharmaceuticals - Diabetes & Oncology',
            'ABBV': 'Pharmaceuticals - Immunology (Humira)',
            'MRK': 'Pharmaceuticals - Vaccines & Oncology',
            'ABT': 'Healthcare - Medical Devices & Diagnostics',
            'TMO': 'Healthcare - Lab Equipment & Reagents',
            'DHR': 'Healthcare - Life Sciences & Diagnostics',
            'BMY': 'Pharmaceuticals - Oncology & Immunology',
            'AMGN': 'Biotechnology - Biologics',
            'GILD': 'Biotechnology - Antivirals (HIV/HCV)',
            'REGN': 'Biotechnology - Monoclonal Antibodies',
            'VRTX': 'Biotechnology - Gene Therapy (Cystic Fibrosis)',
            'MRNA': 'Biotechnology - mRNA Vaccines',
            'BNTX': 'Biotechnology - mRNA Vaccines (Pfizer Partner)',
            'BIIB': 'Biotechnology - Neurology (Alzheimer)',
            'ILMN': 'Healthcare - DNA Sequencing',
            'ISRG': 'Medical Devices - Robotic Surgery (Da Vinci)',
            'SYK': 'Medical Devices - Orthopedics',
            'BSX': 'Medical Devices - Interventional Cardiology',
            'MDT': 'Medical Devices - Cardiovascular',
            'BAX': 'Healthcare - Renal & Hospital Products',
            'BDX': 'Medical Devices - Syringes & Diagnostics',
            'CI': 'Healthcare - Health Insurance (Cigna)',
            'HUM': 'Healthcare - Health Insurance (Humana)',
            'CVS': 'Healthcare - Pharmacy & PBM',
            'WBA': 'Healthcare - Pharmacy Retail (Walgreens)',
            'MCK': 'Healthcare - Pharmaceutical Distribution',
            'CAH': 'Healthcare - Medical Supply Distribution',
            'ABC': 'Healthcare - Pharmaceutical Distribution',
            'ZBH': 'Medical Devices - Orthopedic Implants',
            'EW': 'Medical Devices - Heart Valves',
            'IDXX': 'Healthcare - Veterinary Diagnostics',
            'WAT': 'Healthcare - Lab Instruments',
            'A': 'Healthcare - Lab Equipment (Agilent)',
            
            // USA - Consumer & Retail
            'WMT': 'Retail - Supermarkets & Hypermarkets',
            'COST': 'Retail - Warehouse Clubs',
            'HD': 'Retail - Home Improvement',
            'TGT': 'Retail - Discount Department Stores',
            'LOW': 'Retail - Home Improvement',
            'TJX': 'Retail - Off-Price Apparel (TJ Maxx)',
            'DG': 'Retail - Dollar Stores',
            'DLTR': 'Retail - Dollar Stores (Dollar Tree)',
            'BBY': 'Retail - Consumer Electronics',
            'EBAY': 'Technology - Online Marketplace',
            'ETSY': 'Technology - Handmade Goods Marketplace',
            'W': 'Retail - Online Furniture (Wayfair)',
            'GPS': 'Retail - Apparel (Gap, Old Navy)',
            'ROST': 'Retail - Off-Price Apparel (Ross)',
            'BURL': 'Retail - Off-Price Department Stores',
            'JWN': 'Retail - Luxury Department Stores (Nordstrom)',
            'M': 'Retail - Department Stores (Macy\'s)',
            'KSS': 'Retail - Department Stores (Kohl\'s)',
            'FL': 'Retail - Athletic Footwear (Foot Locker)',
            'NKE': 'Consumer Goods - Athletic Footwear & Apparel',
            'LULU': 'Consumer Goods - Athletic Apparel (Yoga)',
            'UAA': 'Consumer Goods - Athletic Apparel (Under Armour)',
            'VFC': 'Consumer Goods - Outdoor Apparel (Vans, North Face)',
            'RL': 'Consumer Goods - Luxury Apparel (Ralph Lauren)',
            'TPR': 'Consumer Goods - Luxury Accessories (Coach)',
            'CPRI': 'Consumer Goods - Luxury Fashion (Versace)',
            
            // USA - Food & Beverage
            'KO': 'Beverages - Soft Drinks (Coca-Cola)',
            'PEP': 'Beverages & Food - Soft Drinks & Snacks',
            'MDLZ': 'Food - Snacks & Confectionery (Oreo)',
            'KHC': 'Food - Packaged Foods (Kraft, Heinz)',
            'GIS': 'Food - Packaged Foods (Cheerios)',
            'K': 'Food - Breakfast Cereals (Kellogg\'s)',
            'CAG': 'Food - Packaged Foods (Conagra)',
            'CPB': 'Food - Soups & Packaged Foods (Campbell)',
            'HSY': 'Food - Chocolate & Confectionery (Hershey\'s)',
            'MNST': 'Beverages - Energy Drinks (Monster)',
            'STZ': 'Beverages - Beer & Wine (Corona)',
            'BF.B': 'Beverages - Spirits (Jack Daniel\'s)',
            'TAP': 'Beverages - Beer (Coors)',
            'TSN': 'Food - Meat Processing (Tyson)',
            'HRL': 'Food - Meat & Packaged Foods (Hormel)',
            'SJM': 'Food - Jam & Coffee (Smucker\'s)',
            'MKC': 'Food - Spices & Seasonings (McCormick)',
            'LW': 'Food - Frozen Potato Products (Lamb Weston)',
            
            // USA - Restaurants
            'MCD': 'Restaurants - Fast Food (McDonald\'s)',
            'SBUX': 'Restaurants - Coffee Chains (Starbucks)',
            'CMG': 'Restaurants - Fast Casual (Chipotle)',
            'YUM': 'Restaurants - Fast Food (KFC, Taco Bell)',
            'QSR': 'Restaurants - Fast Food (Burger King)',
            'DPZ': 'Restaurants - Pizza Delivery (Domino\'s)',
            'DRI': 'Restaurants - Casual Dining (Olive Garden)',
            'WEN': 'Restaurants - Fast Food (Wendy\'s)',
            'PZZA': 'Restaurants - Pizza (Papa John\'s)',
            'SHAK': 'Restaurants - Fast Casual (Shake Shack)',
            'WING': 'Restaurants - Chicken Wings (Wingstop)',
            
            // USA - Hospitality
            'MAR': 'Hospitality - Hotels (Marriott)',
            'HLT': 'Hospitality - Hotels (Hilton)',
            'H': 'Hospitality - Hotels (Hyatt)',
            'WH': 'Hospitality - Hotels (Wyndham)',
            'MGM': 'Hospitality - Casinos (MGM Resorts)',
            'CZR': 'Hospitality - Casinos (Caesars)',
            'LVS': 'Hospitality - Casinos (Las Vegas Sands)',
            'WYNN': 'Hospitality - Casinos (Wynn)',
            
            // USA - Energy
            'XOM': 'Energy - Oil & Gas (Integrated)',
            'CVX': 'Energy - Oil & Gas (Integrated)',
            'COP': 'Energy - Oil & Gas (Exploration)',
            'OXY': 'Energy - Oil & Gas (Occidental)',
            'MPC': 'Energy - Oil Refining',
            'VLO': 'Energy - Oil Refining (Valero)',
            'PSX': 'Energy - Oil Refining (Phillips 66)',
            'EOG': 'Energy - Oil & Gas (Shale)',
            'PXD': 'Energy - Oil & Gas (Permian Basin)',
            'SLB': 'Energy - Oilfield Services',
            'HAL': 'Energy - Oilfield Services (Halliburton)',
            'BKR': 'Energy - Oilfield Services (Baker Hughes)',
            'KMI': 'Energy - Oil & Gas Pipelines',
            'WMB': 'Energy - Natural Gas Pipelines',
            'OKE': 'Energy - Midstream Energy',
            'LNG': 'Energy - Liquefied Natural Gas',
            'NEE': 'Utilities - Renewable Energy (Solar/Wind)',
            'DUK': 'Utilities - Electric Power',
            'SO': 'Utilities - Electric & Gas',
            'D': 'Utilities - Electric & Gas (Dominion)',
            'EXC': 'Utilities - Electric Power (Exelon)',
            'AEP': 'Utilities - Electric Power',
            'SRE': 'Utilities - Electric & Gas (Sempra)',
            'XEL': 'Utilities - Electric & Gas (Xcel)',
            'WEC': 'Utilities - Electric & Gas',
            'ES': 'Utilities - Electric & Gas (Eversource)',
            'PEG': 'Utilities - Electric & Gas (PSEG)',
            
            // USA - Industrials
            'BA': 'Aerospace - Commercial Aircraft (Boeing)',
            'CAT': 'Industrials - Construction Equipment',
            'HON': 'Industrials - Aerospace & Automation',
            'MMM': 'Industrials - Diversified Manufacturing (3M)',
            'GE': 'Industrials - Aerospace & Power Turbines',
            'LMT': 'Defense - Aerospace & Missiles',
            'RTX': 'Defense - Aerospace (Raytheon)',
            'NOC': 'Defense - Aerospace & Cyber',
            'GD': 'Defense - Combat Systems & Submarines',
            'LHX': 'Defense - Communications & Sensors',
            'DE': 'Agriculture - Farm Equipment (John Deere)',
            'UTX': 'Industrials - Aerospace (Legacy United Tech)',
            'CARR': 'Industrials - HVAC Systems',
            'OTIS': 'Industrials - Elevators & Escalators',
            'PH': 'Industrials - Motion & Control',
            'ETN': 'Industrials - Electrical Equipment',
            'EMR': 'Industrials - Automation (Emerson)',
            'ITW': 'Industrials - Diversified Manufacturing',
            'ROK': 'Industrials - Industrial Automation',
            'JCI': 'Industrials - Building Technology',
            'CMI': 'Industrials - Diesel Engines (Cummins)',
            'PCAR': 'Automotive - Heavy Trucks (Peterbilt)',
            'WAB': 'Industrials - Rail Equipment (Wabtec)',
            'NSC': 'Transportation - Freight Rail (Norfolk Southern)',
            'UNP': 'Transportation - Freight Rail (Union Pacific)',
            'CSX': 'Transportation - Freight Rail',
            'KSU': 'Transportation - Freight Rail (Kansas City)',
            'FDX': 'Logistics - Express Delivery (FedEx)',
            'UPS': 'Logistics - Package Delivery',
            'XPO': 'Logistics - Freight Transportation',
            'JBHT': 'Logistics - Trucking (J.B. Hunt)',
            'ODFL': 'Logistics - LTL Freight',
            
            // USA - Automotive
            'F': 'Automotive - Vehicles (Ford)',
            'GM': 'Automotive - Vehicles (General Motors)',
            'RIVN': 'Automotive - Electric Trucks & SUVs',
            'LCID': 'Automotive - Electric Luxury Sedans',
            'NKLA': 'Automotive - Electric Trucks (Nikola)',
            'FSR': 'Automotive - Electric Vehicles (Fisker)',
            
            // USA - Telecom & Media
            'VZ': 'Telecommunications - Wireless (Verizon)',
            'T': 'Telecommunications - Wireless & Media (AT&T)',
            'TMUS': 'Telecommunications - Wireless (T-Mobile)',
            'CMCSA': 'Media - Cable & Broadband (Comcast)',
            'CHTR': 'Media - Cable & Broadband (Charter)',
            'DIS': 'Media - Entertainment & Streaming (Disney+)',
            'WBD': 'Media - Entertainment (Warner Bros)',
            'PARA': 'Media - Entertainment (Paramount)',
            'SIRI': 'Media - Satellite Radio (SiriusXM)',
            'FOX': 'Media - Broadcasting (Fox)',
            'NWSA': 'Media - Publishing (News Corp)',
            'VIAC': 'Media - Broadcasting (ViacomCBS)',
            'DISCA': 'Media - Broadcasting (Discovery)',
            'LYV': 'Media - Live Entertainment (Ticketmaster)',
            'MSG': 'Media - Sports & Entertainment (MSG)',
            
            // USA - Real Estate
            'AMT': 'Real Estate - Cell Towers',
            'PLD': 'Real Estate - Logistics Warehouses',
            'CCI': 'Real Estate - Cell Towers (Crown Castle)',
            'EQIX': 'Real Estate - Data Centers',
            'PSA': 'Real Estate - Self-Storage',
            'SPG': 'Real Estate - Shopping Malls',
            'O': 'Real Estate - Retail Properties (Realty Income)',
            'VICI': 'Real Estate - Casinos & Entertainment',
            'WELL': 'Real Estate - Healthcare Properties',
            'AVB': 'Real Estate - Apartments',
            'EQR': 'Real Estate - Apartments',
            'DLR': 'Real Estate - Data Centers (Digital Realty)',
            'SBAC': 'Real Estate - Cell Towers (SBA)',
            'LEN': 'Real Estate - Home Construction (Lennar)',
            'DHI': 'Real Estate - Home Construction (DR Horton)',
            'PHM': 'Real Estate - Home Construction (PulteGroup)',
            'NVR': 'Real Estate - Home Construction',
            'TOL': 'Real Estate - Home Construction (Toll Brothers)',
            
            // USA - Mining
            'BHP': 'Mining - Diversified Metals (Iron Ore)',
            'RIO': 'Mining - Iron Ore & Copper',
            'VALE': 'Mining - Iron Ore (Brazil)',
            'GLNCY': 'Mining - Diversified Metals (Glencore)',
            'AAUKY': 'Mining - Platinum & Diamonds (Anglo American)',
            'FCX': 'Mining - Copper (Freeport-McMoRan)',
            'NEM': 'Mining - Gold (Newmont)',
            'GOLD': 'Mining - Gold (Barrick)',
            'FSUGY': 'Mining - Iron Ore (Fortescue)',
            'AA': 'Mining - Aluminum (Alcoa)',
            'MT': 'Industrials - Steel (ArcelorMittal)',
            'NUE': 'Industrials - Steel (Nucor)',
            'STLD': 'Industrials - Steel (Steel Dynamics)',
            
            // ✅ EUROPE - Technology
            'SAP': 'Technology - Enterprise Software (Germany)',
            'ASML': 'Technology - Semiconductor Equipment (Netherlands)',
            'ERIC': 'Telecommunications - Network Equipment (Sweden)',
            'NOK': 'Telecommunications - Mobile Networks (Finland)',
            'IFX.DE': 'Technology - Semiconductors (Germany)',
            'STM': 'Technology - Semiconductors (France/Italy)',
            'CAP.PA': 'Consulting - IT Services (France)',
            'DSY.PA': 'Technology - 3D Design Software (France)',
            'AMS.MC': 'Technology - Travel Booking Systems (Spain)',
            'WLN.PA': 'Fintech - Payment Processing (France)',
            'SGE.L': 'Technology - Accounting Software (UK)',
            'UBI.PA': 'Gaming - Video Games (France)',
            'DHER.DE': 'Technology - Food Delivery (Germany)',
            'ZAL.DE': 'Retail - Online Fashion (Germany)',
            'JET.AS': 'Technology - Food Delivery (Netherlands)',
            'TMV.DE': 'Technology - Remote Access Software (Germany)',
            'PRX.AS': 'Technology - Internet Investments (Netherlands)',
            'BKNG': 'Technology - Travel Booking (Netherlands)',
            'EXPE': 'Technology - Travel Booking (USA)',
            
            // Europe - Luxury
            'LVMUY': 'Luxury Goods - Fashion & Spirits (France)',
            'RMS.PA': 'Luxury Goods - Leather Goods (France)',
            'KER.PA': 'Luxury Goods - Fashion (Gucci) (France)',
            'OR.PA': 'Consumer Goods - Cosmetics (L\'Oréal) (France)',
            'ADDYY': 'Consumer Goods - Sportswear (Germany)',
            'PMMAF': 'Consumer Goods - Sportswear (Puma) (Germany)',
            'ITX.MC': 'Retail - Fast Fashion (Zara) (Spain)',
            'HNNMY': 'Retail - Fast Fashion (H&M) (Sweden)',
            'BURBY': 'Luxury Goods - Fashion (UK)',
            'MONC.MI': 'Luxury Goods - Outerwear (Italy)',
            'CFRHF': 'Luxury Goods - Jewelry (Cartier) (Switzerland)',
            'SWGAY': 'Luxury Goods - Watches (Switzerland)',
            'PANDY': 'Luxury Goods - Jewelry (Denmark)',
            
            // Europe - Pharma
            'NVO': 'Pharmaceuticals - Diabetes Care (Denmark)',
            'RHHBY': 'Pharmaceuticals - Oncology (Switzerland)',
            'NVS': 'Pharmaceuticals - Generics & Drugs (Switzerland)',
            'SNY': 'Pharmaceuticals - Vaccines (France)',
            'AZN': 'Pharmaceuticals - Oncology (UK)',
            'GSK': 'Pharmaceuticals - Vaccines & Respiratory (UK)',
            'BAYRY': 'Pharmaceuticals & Agriculture (Germany)',
            'SMMNY': 'Healthcare - Medical Imaging (Germany)',
            'FSNUY': 'Healthcare - Dialysis & Hospital Products (Germany)',
            'PHG': 'Healthcare - Medical Equipment (Philips) (Netherlands)',
            'LZAGY': 'Healthcare - Biotech Manufacturing (Switzerland)',
            'GRFS': 'Healthcare - Blood Products (Spain)',
            'UCBJF': 'Pharmaceuticals - Neurology (Belgium)',
            'RCDTF': 'Pharmaceuticals - Specialty Drugs (Italy)',
            'ALM.MC': 'Pharmaceuticals - Dermatology (Spain)',
            'GLPG': 'Biotechnology - Inflammation (Belgium)',
            
            // Europe - Consumer & Retail
            'CA.PA': 'Retail - Supermarkets (France)',
            'TSCDY': 'Retail - Supermarkets (UK)',
            'SBRY.L': 'Retail - Supermarkets (UK)',
            'B4B.DE': 'Retail - Wholesale (Germany)',
            'AD.AS': 'Retail - Supermarkets (Netherlands)',
            'CO.PA': 'Retail - Supermarkets (France)',
            'MKS.L': 'Retail - Department Stores (UK)',
            'NXT.L': 'Retail - Fashion (UK)',
            'ABF.L': 'Retail - Discount Fashion (Primark) (UK)',
            'KGF.L': 'Retail - Home Improvement (UK)',
            
            // Europe - Food & Beverage
            'NSRGY': 'Food - Nutrition & Beverages (Nescafé) (Switzerland)',
            'DANOY': 'Food - Dairy Products (France)',
            'UL': 'Consumer Goods - Food & Personal Care (UK/Netherlands)',
            'DEO': 'Beverages - Spirits (Johnnie Walker) (UK)',
            'HEINY': 'Beverages - Beer (Netherlands)',
            'CABGY': 'Beverages - Beer (Denmark)',
            'BUD': 'Beverages - Beer (Belgium)',
            'PDRDY': 'Beverages - Spirits (France)',
            'REMYY': 'Beverages - Cognac (France)',
            'DVDCY': 'Beverages - Spirits (Italy)',
            'LDSVF': 'Food - Chocolate (Lindt) (Switzerland)',
            'BYCBF': 'Food - Chocolate Manufacturing (Switzerland)',
            'TATYY': 'Food - Sweeteners (UK)',
            'KRYAY': 'Food - Ingredients & Flavors (Ireland)',
            
            // Europe - Hospitality
            'ACCYY': 'Hospitality - Hotels (France)',
            'WTB.L': 'Hospitality - Hotels (UK)',
            'IHG': 'Hospitality - Hotels (InterContinental) (UK)',
            
            // Europe - Energy
            'SHEL': 'Energy - Oil & Gas (UK)',
            'BP': 'Energy - Oil & Gas (UK)',
            'TTE': 'Energy - Oil & Gas (France)',
            'EQNR': 'Energy - Oil & Gas (Norway)',
            'E': 'Energy - Oil & Gas (Italy)',
            'REPYY': 'Energy - Oil & Gas (Spain)',
            'OMVKY': 'Energy - Oil & Gas (Austria)',
            'GLPEY': 'Energy - Oil & Gas (Portugal)',
            'NTOIY': 'Energy - Renewable Diesel (Finland)',
            'DNNGY': 'Energy - Offshore Wind (Denmark)',
            'IBDRY': 'Utilities - Renewable Energy (Spain)',
            'ENLAY': 'Utilities - Electric Power (Italy)',
            'EDPFY': 'Utilities - Renewable Energy (Portugal)',
            'RWEOY': 'Utilities - Electric & Gas (Germany)',
            'EONGY': 'Utilities - Electric & Gas (Germany)',
            'ENGIY': 'Utilities - Gas & Electricity (France)',
            'SSEZY': 'Utilities - Renewable Energy (UK)',
            'NGG': 'Utilities - Gas & Electricity Distribution (UK)',
            'CPYYY': 'Utilities - Gas & Electricity (UK)',
            'ECIFY': 'Utilities - Nuclear & Hydro (France)',
            'FOJCF': 'Utilities - Power Generation (Finland)',
            'OEZVY': 'Utilities - Hydro Power (Austria)',
            
            // Europe - Industrials
            'SIEGY': 'Industrials - Automation & Electrification (Germany)',
            'ABB': 'Industrials - Robotics & Power Grids (Switzerland)',
            'SBGSF': 'Industrials - Electrical Equipment (France)',
            'EADSY': 'Aerospace - Commercial Aircraft (France)',
            'SAFRY': 'Aerospace - Aircraft Engines (France)',
            'RYCEY': 'Aerospace - Jet Engines (UK)',
            'BAESY': 'Defense - Aerospace & Naval (UK)',
            'THLLY': 'Defense - Aerospace & Cyber (France)',
            'FINMY': 'Defense - Aerospace & Electronics (Italy)',
            'MTUAY': 'Aerospace - Aircraft Engines (Germany)',
            'DUAVF': 'Aerospace - Fighter Jets (France)',
            'RNMBY': 'Defense - Weapons Systems (Germany)',
            'KNYJY': 'Industrials - Elevators & Escalators (Finland)',
            'SHLRF': 'Industrials - Elevators (Switzerland)',
            'ATLKY': 'Industrials - Compressors & Vacuum (Sweden)',
            'VOLVY': 'Automotive - Trucks & Buses (Sweden)',
            'SCVCY': 'Automotive - Trucks (Sweden)',
            'VLKAF': 'Automotive - Trucks (Germany)',
            'DTG': 'Automotive - Trucks (Germany)',
            'KNRRY': 'Automotive - Braking Systems (Germany)',
            'CNHI': 'Agriculture - Tractors & Equipment (Italy)',
            'KMTUY': 'Industrials - Construction Equipment (Japan/Europe)',
            'SDVKY': 'Industrials - Mining & Construction Tools (Sweden)',
            'SKFRY': 'Industrials - Bearings (Sweden)',
            'ALFVY': 'Industrials - Heat Transfer Equipment (Sweden)',
            'LGRDY': 'Industrials - Electrical Equipment (France)',
            'RXL.PA': 'Distribution - Electrical Equipment (France)',
            'BNTGY': 'Distribution - Chemicals (Germany)',
            'DPSGY': 'Logistics - Mail & Parcel (Germany)',
            'PNL.AS': 'Logistics - Mail & Parcel (Netherlands)',
            'RMG.L': 'Logistics - Mail (UK)',
            'KHNGY': 'Logistics - Freight Forwarding (Switzerland)',
            'DSDVY': 'Logistics - Freight Forwarding (Denmark)',
            
            // Europe - Automotive
            'VWAGY': 'Automotive - Vehicles (Volkswagen) (Germany)',
            'BMWYY': 'Automotive - Luxury Vehicles (Germany)',
            'MBGAF': 'Automotive - Luxury Vehicles (Mercedes) (Germany)',
            'POAHY': 'Automotive - Sports Cars (Porsche) (Germany)',
            'RACE': 'Automotive - Luxury Sports Cars (Ferrari) (Italy)',
            'STLA': 'Automotive - Vehicles (Peugeot, Fiat) (France/Italy)',
            'RNLSY': 'Automotive - Vehicles (France)',
            
            // Europe - Telecom
            'VOD': 'Telecommunications - Mobile & Broadband (UK)',
            'BT.L': 'Telecommunications - Fixed & Mobile (UK)',
            'ORAN': 'Telecommunications - Mobile & Internet (France)',
            'DTEGY': 'Telecommunications - Mobile & Broadband (Germany)',
            'TEF': 'Telecommunications - Mobile & Broadband (Spain)',
            'TIIAY': 'Telecommunications - Fixed & Mobile (Italy)',
            'SCMWY': 'Telecommunications - Fixed & Mobile (Switzerland)',
            'KKPNY': 'Telecommunications - Fixed & Mobile (Netherlands)',
            'BGAOY': 'Telecommunications - Fixed & Mobile (Belgium)',
            'TELNY': 'Telecommunications - Mobile (Norway)',
            'TLSNY': 'Telecommunications - Mobile (Sweden)',
            
            // Europe - Banking
            'HSBC': 'Banking - Global Banking (UK)',
            'BCS': 'Banking - Investment Banking (UK)',
            'SCBFF': 'Banking - Emerging Markets (UK)',
            'LYG': 'Banking - Retail Banking (UK)',
            'NWG.L': 'Banking - Retail Banking (UK)',
            'DB': 'Banking - Investment Banking (Germany)',
            'CBKGF': 'Banking - Commercial Banking (Germany)',
            'UBS': 'Banking - Wealth Management (Switzerland)',
            'CS': 'Banking - Investment Banking (Switzerland)',
            'BNP.PA': 'Banking - Investment Banking (France)',
            'GLE.PA': 'Banking - Commercial Banking (France)',
            'ACA.PA': 'Banking - Regional Banking (France)',
            'ING': 'Banking - Retail Banking (Netherlands)',
            'ABN.AS': 'Banking - Retail Banking (Netherlands)',
            'UCG.MI': 'Banking - Commercial Banking (Italy)',
            'ISP.MI': 'Banking - Retail Banking (Italy)',
            'SAN': 'Banking - Retail Banking (Spain)',
            'BBVA': 'Banking - Commercial Banking (Spain)',
            'CABK.MC': 'Banking - Retail Banking (Spain)',
            'NDAFI': 'Banking - Retail Banking (Nordics)',
            'DANSKE.CO': 'Banking - Retail Banking (Denmark)',
            'ALV.DE': 'Insurance - Property & Casualty (Germany)',
            'CS.PA': 'Insurance - Life & Property (France)',
            'ZURN.SW': 'Insurance - Property & Casualty (Switzerland)',
            'PRU.L': 'Insurance - Life Insurance (UK)',
            'AV.L': 'Insurance - Life & General (UK)',
            'LGEN.L': 'Insurance - Pensions & Investments (UK)',
            'G.MI': 'Insurance - Life & Property (Italy)',
            
            // ✅ ASIE - Technology
            'BABA': 'Technology - E-Commerce (Taobao, Tmall) (China)',
            'TCEHY': 'Technology - Social Media & Gaming (WeChat) (China)',
            'SSNLF': 'Technology - Consumer Electronics (Smartphones) (South Korea)',
            'TSM': 'Technology - Semiconductor Manufacturing (Taiwan)',
            'SONY': 'Technology - Gaming & Electronics (PlayStation) (Japan)',
            'BIDU': 'Technology - Search Engine (China)',
            'JD': 'Technology - E-Commerce (China)',
            'NTES': 'Technology - Online Gaming (China)',
            'PDD': 'Technology - E-Commerce (Pinduoduo) (China)',
            '3690.HK': 'Technology - Food Delivery (Meituan) (China)',
            'XIACF': 'Technology - Smartphones (China)',
            'NIO': 'Automotive - Electric Vehicles (China)',
            'LI': 'Automotive - Electric SUVs (Li Auto) (China)',
            'XPEV': 'Automotive - Electric Vehicles (XPeng) (China)',
            'BYDDY': 'Automotive - Electric Vehicles & Batteries (China)',
            'RKUNY': 'Technology - E-Commerce & Fintech (Japan)',
            'SFTBY': 'Conglomerate - Telecom & Investments (Japan)',
            'NTDOY': 'Gaming - Console & Games (Nintendo Switch) (Japan)',
            'KYCCF': 'Technology - Factory Automation (Japan)',
            'TOELY': 'Technology - Semiconductor Equipment (Japan)',
            '035420.KS': 'Technology - Internet Services (Naver) (South Korea)',
            '035720.KS': 'Technology - Internet Services (Kakao) (South Korea)',
            '000660.KS': 'Technology - Memory Chips (SK Hynix) (South Korea)',
            '066570.KS': 'Technology - Consumer Electronics (LG) (South Korea)',
            'INFY': 'Technology - IT Services & Consulting (India)',
            'TCS.NS': 'Technology - IT Services (India)',
            'WIT': 'Technology - IT Consulting (India)',
            'HCLTECH.NS': 'Technology - IT Services (India)',
            'TECHM.NS': 'Technology - IT Services (India)',
            
            // Asie - Banking
            'IDCBY': 'Banking - Commercial Banking (China)',
            'CICHY': 'Banking - Construction Loans (China)',
            'ACGBY': 'Banking - Agricultural Banking (China)',
            'BACHF': 'Banking - Commercial Banking (China)',
            'PNGAY': 'Insurance & Banking - Life Insurance (China)',
            'CIHKY': 'Banking - Commercial Banking (China)',
            'HDB': 'Banking - Retail Banking (India)',
            'IBN': 'Banking - Retail Banking (India)',
            'SBKFF': 'Banking - Retail Banking (India)',
            'AXIBANK.NS': 'Banking - Retail Banking (India)',
            'KOTAKBANK.NS': 'Banking - Retail Banking (India)',
            'MUFG': 'Banking - Commercial Banking (Japan)',
            'SMFG': 'Banking - Commercial Banking (Japan)',
            'MFG': 'Banking - Commercial Banking (Mizuho) (Japan)',
            'NMR': 'Banking - Investment Banking (Japan)',
            'DBSDY': 'Banking - Commercial Banking (Singapore)',
            'OVCHY': 'Banking - Commercial Banking (Singapore)',
            'UOVEY': 'Banking - Commercial Banking (Singapore)',
            
            // Asie - Automotive
            'TM': 'Automotive - Vehicles (Toyota) (Japan)',
            'HMC': 'Automotive - Motorcycles & Cars (Honda) (Japan)',
            'NSANY': 'Automotive - Vehicles (Nissan) (Japan)',
            'MZDAY': 'Automotive - Vehicles (Mazda) (Japan)',
            'FUJHY': 'Automotive - Vehicles (Subaru) (Japan)',
            'SZKMY': 'Automotive - Vehicles (Suzuki) (Japan)',
            'MMTOF': 'Automotive - Vehicles (Mitsubishi) (Japan)',
            'HYMTF': 'Automotive - Vehicles (Hyundai) (South Korea)',
            'KIMTF': 'Automotive - Vehicles (Kia) (South Korea)',
            'GELYF': 'Automotive - Vehicles (Geely) (China)',
            '2333.HK': 'Automotive - Vehicles (Great Wall) (China)',
            '600104.SS': 'Automotive - Vehicles (SAIC) (China)',
            
            // Asie - Energy
            'PTR': 'Energy - Oil & Gas (China)',
            'SNP': 'Energy - Oil & Gas Refining (China)',
            'CEO': 'Energy - Offshore Oil & Gas (China)',
            'RELIANCE.NS': 'Energy & Petrochemicals (India)',
            'ONGC.NS': 'Energy - Oil & Gas Exploration (India)',
            'IOC.NS': 'Energy - Oil Refining (India)',
            '2222.SR': 'Energy - Oil & Gas (Saudi Arabia)',
            
            // Asie - Industrials
            'MHVYF': 'Industrials - Heavy Industries (Japan)',
            'KWHIY': 'Industrials - Heavy Industries (Japan)',
            'IHICF': 'Industrials - Shipbuilding (Japan)',
            'HTHIY': 'Industrials - Conglomerate (Hitachi) (Japan)',
            'TOSYY': 'Industrials - Conglomerate (Toshiba) (Japan)',
            'PCRFY': 'Industrials - Electronics (Panasonic) (Japan)',
            'MKTAY': 'Industrials - Power Tools (Makita) (Japan)',
            'FANUY': 'Industrials - Industrial Robots (Japan)',
            'YASKY': 'Industrials - Industrial Robots (Japan)',
            'SMCAY': 'Industrials - Pneumatic Components (Japan)',
            'KMTUY': 'Industrials - Construction Equipment (Japan)',
            'KUBTY': 'Agriculture - Tractors (Japan)',
            'HINOF': 'Automotive - Trucks (Hino) (Japan)',
            'ISUZY': 'Automotive - Trucks (Isuzu) (Japan)',
            'LT.NS': 'Industrials - Infrastructure & Engineering (India)',
            'TTM': 'Automotive - Vehicles (Tata Motors) (India)',
            'MAHMF': 'Automotive - Vehicles (Mahindra) (India)',
            
            // Asie - Consumer
            '9983.T': 'Retail - Fashion (Uniqlo) (Japan)',
            'SVNDY': 'Retail - Convenience Stores (7-Eleven) (Japan)',
            '2651.T': 'Retail - Convenience Stores (Lawson) (Japan)',
            '8028.T': 'Retail - Convenience Stores (FamilyMart) (Japan)',
            '3099.T': 'Retail - Department Stores (Japan)',
            '8267.T': 'Retail - Supermarkets (Japan)',
            '7453.T': 'Retail - Household Goods (Muji) (Japan)',
            'SSDOY': 'Consumer Goods - Cosmetics (Japan)',
            'KAOCF': 'Consumer Goods - Personal Care (Japan)',
            '2020.HK': 'Consumer Goods - Sportswear (Anta) (China)',
            '2331.HK': 'Consumer Goods - Sportswear (Li Ning) (China)',
            
            // Crypto
            'BTC-USD': 'Cryptocurrency - Digital Currency (Bitcoin)',
            'ETH-USD': 'Cryptocurrency - Smart Contracts (Ethereum)',
            'MARA': 'Cryptocurrency - Bitcoin Mining',
            'RIOT': 'Cryptocurrency - Bitcoin Mining',
            'MSTR': 'Technology - Business Intelligence & Bitcoin Treasury',
            
            // Fintech
            'LC': 'Fintech - Peer-to-Peer Lending',
            'TREE': 'Fintech - Loan Marketplace',
            'UPST': 'Fintech - AI Lending',
            
            // Chemicals
            'BASFY': 'Chemicals - Diversified Chemicals (Germany)',
            'DOW': 'Chemicals - Commodity Chemicals',
            'DD': 'Chemicals - Specialty Materials (DuPont)',
            'LIN': 'Chemicals - Industrial Gases',
            'AIQUY': 'Chemicals - Industrial Gases (France)',
            'APD': 'Chemicals - Industrial Gases',
            'SHW': 'Chemicals - Paints & Coatings',
            'PPG': 'Chemicals - Paints & Coatings',
            'ECL': 'Chemicals - Cleaning & Sanitation',
            'CTVA': 'Agriculture - Crop Protection',
            'CF': 'Chemicals - Fertilizers',
            'MOS': 'Chemicals - Fertilizers (Mosaic)',
            'NTR': 'Agriculture - Fertilizers (Nutrien)',
            'IFF': 'Chemicals - Flavors & Fragrances'
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
        this.applyFiltersAndPagination();
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
                // ✅ API de logos GRATUITE : Google Favicons avec fallback Unavatar
                logoUrl: domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : null
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
        
        console.log(`📊 Loaded ${this.allCompanies.length} companies`);
    }
    
    getDetailedSector(ticker) {
        return this.detailedSectors[ticker] || 'Other';
    }
    
    getRegionForTicker(ticker) {
        const sector = this.detailedSectors[ticker] || '';
        
        // Détection basée sur les parenthèses dans le secteur
        if (sector.includes('(China)') || sector.includes('(Taiwan)') || 
            sector.includes('(Japan)') || sector.includes('(South Korea)') ||
            sector.includes('(India)') || sector.includes('(Singapore)') ||
            sector.includes('(Hong Kong)') || sector.includes('(Saudi Arabia)')) {
            return 'Asia';
        }
        
        if (sector.includes('(Germany)') || sector.includes('(France)') || 
            sector.includes('(UK)') || sector.includes('(Switzerland)') ||
            sector.includes('(Italy)') || sector.includes('(Spain)') ||
            sector.includes('(Netherlands)') || sector.includes('(Sweden)') ||
            sector.includes('(Belgium)') || sector.includes('(Denmark)') ||
            sector.includes('(Norway)') || sector.includes('(Finland)') ||
            sector.includes('(Austria)') || sector.includes('(Portugal)') ||
            sector.includes('(Ireland)') || sector.includes('(Poland)')) {
            return 'Europe';
        }
        
        // Fallback sur format ticker
        if (ticker.includes('.PA') || ticker.includes('.DE') || ticker.includes('.L') || 
            ticker.includes('.AS') || ticker.includes('.MC') || ticker.includes('.MI') ||
            ticker.includes('.SW') || ticker.includes('.CO')) {
            return 'Europe';
        }
        
        if (ticker.includes('.HK') || ticker.includes('.T') || ticker.includes('.SS') || 
            ticker.includes('.KS') || ticker.includes('.NS') || ticker.includes('.SR')) {
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
        
        // Filters
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
            this.currentPage = 1;
            clearBtn.style.display = 'none';
            this.applyFiltersAndPagination();
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
        
        // ✅ Pagination
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        this.displayedCompanies = filtered.slice(startIndex, endIndex);
        
        this.renderCompanies();
        this.renderPagination();
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
        
        if (this.displayedCompanies.length === 0) {
            container.innerHTML = '';
            noResults.style.display = 'block';
            return;
        }
        
        noResults.style.display = 'none';
        
        container.innerHTML = this.displayedCompanies.map(company => {
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
    
    // ✅ Pagination Render
    renderPagination() {
        const totalPages = Math.ceil(this.filteredCompanies.length / this.itemsPerPage);
        
        if (totalPages <= 1) {
            document.getElementById('paginationControls').style.display = 'none';
            return;
        }
        
        document.getElementById('paginationControls').style.display = 'flex';
        
        let paginationHTML = '';
        
        // Previous button
        paginationHTML += `
            <button class='pagination-btn ${this.currentPage === 1 ? 'disabled' : ''}' 
                    onclick='CompaniesDirectory.goToPage(${this.currentPage - 1})' 
                    ${this.currentPage === 1 ? 'disabled' : ''}>
                <i class='fas fa-chevron-left'></i>
            </button>
        `;
        
        // Page numbers
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
        
        // Next button
        paginationHTML += `
            <button class='pagination-btn ${this.currentPage === totalPages ? 'disabled' : ''}' 
                    onclick='CompaniesDirectory.goToPage(${this.currentPage + 1})' 
                    ${this.currentPage === totalPages ? 'disabled' : ''}>
                <i class='fas fa-chevron-right'></i>
            </button>
        `;
        
        document.getElementById('paginationControls').innerHTML = paginationHTML;
        
        // Update info
        const startItem = (this.currentPage - 1) * this.itemsPerPage + 1;
        const endItem = Math.min(this.currentPage * this.itemsPerPage, this.filteredCompanies.length);
        document.getElementById('paginationInfo').textContent = 
            `Showing ${startItem}-${endItem} of ${this.filteredCompanies.length} companies`;
    }
    
    static goToPage(page) {
        const instance = window.companiesDirectoryInstance;
        instance.currentPage = page;
        instance.applyFiltersAndPagination();
        
        // Scroll to top
        document.querySelector('.companies-grid, .companies-list, .companies-compact')?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }
    
    static handleLogoError(img, initials) {
        const logoDiv = img.parentElement;
        logoDiv.classList.add('text-fallback');
        logoDiv.innerHTML = initials;
        console.log(`⚠ Logo not found, using fallback: ${initials}`);
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
        
        const initials = company.name.substring(0, 2).toUpperCase();
        
        modalContent.innerHTML = `
            <div class='company-modal-header'>
                <div class='company-modal-logo ${!company.logoUrl ? 'text-fallback' : ''}'>
                    ${company.logoUrl 
                        ? `<img src='${company.logoUrl}' alt='${company.name}' onerror='this.parentElement.classList.add("text-fallback"); this.parentElement.innerHTML="${initials}";'>` 
                        : initials
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