/**
 * ════════════════════════════════════════════════════════════════
 * ENTITY DATABASE - ENTREPRISES MONDIALES + TOUS LES PAYS
 * 1000+ entreprises internationales
 * ════════════════════════════════════════════════════════════════
 */

class EntityDatabase {
    constructor() {
        this.companies = this.buildCompaniesDatabase();
        this.countries = this.buildCountriesDatabase();
    }

    buildCompaniesDatabase() {
        return {
            // ═══════════════════════════════════════════════════════
            // TECH GIANTS & SOFTWARE (USA)
            // ═══════════════════════════════════════════════════════
            'Apple': 'AAPL',
            'Microsoft': 'MSFT',
            'Alphabet': 'GOOGL',
            'Google': 'GOOGL',
            'Amazon': 'AMZN',
            'Meta': 'META',
            'Facebook': 'META',
            'Tesla': 'TSLA',
            'NVIDIA': 'NVDA',
            'Nvidia': 'NVDA',
            'Netflix': 'NFLX',
            'Adobe': 'ADBE',
            'Salesforce': 'CRM',
            'Oracle': 'ORCL',
            'Intel': 'INTC',
            'AMD': 'AMD',
            'Qualcomm': 'QCOM',
            'Broadcom': 'AVGO',
            'Texas Instruments': 'TXN',
            'Cisco': 'CSCO',
            'IBM': 'IBM',
            'Accenture': 'ACN',
            'ServiceNow': 'NOW',
            'Intuit': 'INTU',
            'PayPal': 'PYPL',
            'Block': 'SQ',
            'Square': 'SQ',
            'Snowflake': 'SNOW',
            'Palantir': 'PLTR',
            'Zoom': 'ZM',
            'Shopify': 'SHOP',
            'Uber': 'UBER',
            'Lyft': 'LYFT',
            'Airbnb': 'ABNB',
            'DoorDash': 'DASH',
            'Snap': 'SNAP',
            'Snapchat': 'SNAP',
            'Twitter': 'TWTR',
            'X Corp': 'TWTR',
            'Pinterest': 'PINS',
            'Spotify': 'SPOT',
            'Roblox': 'RBLX',
            'Unity': 'U',
            'Twilio': 'TWLO',
            'Okta': 'OKTA',
            'Crowdstrike': 'CRWD',
            'Datadog': 'DDOG',
            'MongoDB': 'MDB',
            'Splunk': 'SPLK',
            'Workday': 'WDAY',
            'Autodesk': 'ADSK',
            'VMware': 'VMW',
            'Dell': 'DELL',
            'HP': 'HPQ',
            'HPE': 'HPE',
            'Western Digital': 'WDC',
            'Seagate': 'STX',
            'Micron': 'MU',
            'Applied Materials': 'AMAT',
            'Lam Research': 'LRCX',
            'KLA': 'KLAC',
            'Analog Devices': 'ADI',
            'Marvell': 'MRVL',
            'Synopsys': 'SNPS',
            'Cadence': 'CDNS',

            // ═══════════════════════════════════════════════════════
            // TECH EUROPE (50+ entreprises)
            // ═══════════════════════════════════════════════════════
            'SAP': 'SAP',
            'ASML': 'ASML',
            'Adyen': 'ADYEN.AS',
            'Spotify': 'SPOT',
            'Ericsson': 'ERIC',
            'Nokia': 'NOK',
            'Infineon': 'IFX.DE',
            'STMicroelectronics': 'STM',
            'Capgemini': 'CAP.PA',
            'Dassault Systemes': 'DSY.PA',
            'Amadeus': 'AMS.MC',
            'Worldline': 'WLN.PA',
            'Sage Group': 'SGE.L',
            'Ubisoft': 'UBI.PA',
            'Delivery Hero': 'DHER.DE',
            'Zalando': 'ZAL.DE',
            'Just Eat Takeaway': 'JET.AS',
            'TeamViewer': 'TMV.DE',
            'Prosus': 'PRX.AS',
            'Booking Holdings': 'BKNG',
            'Expedia': 'EXPE',

            // ═══════════════════════════════════════════════════════
            // TECH ASIE (60+ entreprises)
            // ═══════════════════════════════════════════════════════
            'Alibaba': 'BABA',
            'Tencent': 'TCEHY',
            'Samsung': 'SSNLF',
            'TSMC': 'TSM',
            'Taiwan Semiconductor': 'TSM',
            'Sony': 'SONY',
            'Baidu': 'BIDU',
            'JD.com': 'JD',
            'NetEase': 'NTES',
            'Pinduoduo': 'PDD',
            'Meituan': '3690.HK',
            'Xiaomi': 'XIACF',
            'NIO': 'NIO',
            'Li Auto': 'LI',
            'XPeng': 'XPEV',
            'BYD': 'BYDDY',
            'Rakuten': 'RKUNY',
            'SoftBank': 'SFTBY',
            'Nintendo': 'NTDOY',
            'Keyence': 'KYCCF',
            'Tokyo Electron': 'TOELY',
            'Naver': '035420.KS',
            'Kakao': '035720.KS',
            'SK Hynix': '000660.KS',
            'LG Electronics': '066570.KS',
            'Infosys': 'INFY',
            'TCS': 'TCS.NS',
            'Wipro': 'WIT',
            'HCL Technologies': 'HCLTECH.NS',
            'Tech Mahindra': 'TECHM.NS',

            // ═══════════════════════════════════════════════════════
            // FINANCE & BANKING (USA)
            // ═══════════════════════════════════════════════════════
            'JPMorgan': 'JPM',
            'Bank of America': 'BAC',
            'Wells Fargo': 'WFC',
            'Citigroup': 'C',
            'Goldman Sachs': 'GS',
            'Morgan Stanley': 'MS',
            'US Bancorp': 'USB',
            'PNC': 'PNC',
            'Truist': 'TFC',
            'Capital One': 'COF',
            'Charles Schwab': 'SCHW',
            'Schwab': 'SCHW',
            'American Express': 'AXP',
            'Amex': 'AXP',
            'Discover': 'DFS',
            'Synchrony': 'SYF',
            'Visa': 'V',
            'Mastercard': 'MA',
            'Affirm': 'AFRM',
            'SoFi': 'SOFI',
            'Robinhood': 'HOOD',
            'Coinbase': 'COIN',
            'BlackRock': 'BLK',
            'State Street': 'STT',
            'BNY Mellon': 'BK',
            'Northern Trust': 'NTRS',
            'T. Rowe Price': 'TROW',
            'Franklin Resources': 'BEN',
            'Invesco': 'IVZ',
            'Raymond James': 'RJF',
            'Interactive Brokers': 'IBKR',
            'E-Trade': 'ETFC',
            'TD Ameritrade': 'AMTD',
            'Ally Financial': 'ALLY',

            // ═══════════════════════════════════════════════════════
            // FINANCE EUROPE (50+ entreprises)
            // ═══════════════════════════════════════════════════════
            'HSBC': 'HSBC',
            'Barclays': 'BCS',
            'Standard Chartered': 'SCBFF',
            'Lloyds Banking': 'LYG',
            'NatWest': 'NWG.L',
            'Deutsche Bank': 'DB',
            'Commerzbank': 'CBKGF',
            'UBS': 'UBS',
            'Credit Suisse': 'CS',
            'BNP Paribas': 'BNP.PA',
            'Societe Generale': 'GLE.PA',
            'Credit Agricole': 'ACA.PA',
            'ING': 'ING',
            'ABN AMRO': 'ABN.AS',
            'UniCredit': 'UCG.MI',
            'Intesa Sanpaolo': 'ISP.MI',
            'Banco Santander': 'SAN',
            'BBVA': 'BBVA',
            'CaixaBank': 'CABK.MC',
            'Nordea': 'NDAFI',
            'Danske Bank': 'DANSKE.CO',
            'Allianz': 'ALV.DE',
            'AXA': 'CS.PA',
            'Zurich Insurance': 'ZURN.SW',
            'Prudential': 'PRU.L',
            'Aviva': 'AV.L',
            'Legal & General': 'LGEN.L',
            'Generali': 'G.MI',

            // ═══════════════════════════════════════════════════════
            // FINANCE ASIE (40+ entreprises)
            // ═══════════════════════════════════════════════════════
            'Industrial & Commercial Bank': 'IDCBY',
            'China Construction Bank': 'CICHY',
            'Agricultural Bank of China': 'ACGBY',
            'Bank of China': 'BACHF',
            'Ping An': 'PNGAY',
            'China Merchants Bank': 'CIHKY',
            'HDFC Bank': 'HDB',
            'ICICI Bank': 'IBN',
            'State Bank of India': 'SBKFF',
            'Axis Bank': 'AXIBANK.NS',
            'Kotak Mahindra': 'KOTAKBANK.NS',
            'Mitsubishi UFJ': 'MUFG',
            'Sumitomo Mitsui': 'SMFG',
            'Mizuho': 'MFG',
            'Nomura': 'NMR',
            'DBS': 'DBSDY',
            'OCBC': 'OVCHY',
            'UOB': 'UOVEY',

            // ═══════════════════════════════════════════════════════
            // HEALTHCARE & PHARMACEUTICALS (USA)
            // ═══════════════════════════════════════════════════════
            'Johnson & Johnson': 'JNJ',
            'UnitedHealth': 'UNH',
            'Pfizer': 'PFE',
            'Eli Lilly': 'LLY',
            'AbbVie': 'ABBV',
            'Merck': 'MRK',
            'Abbott': 'ABT',
            'Thermo Fisher': 'TMO',
            'Danaher': 'DHR',
            'Bristol Myers': 'BMY',
            'Amgen': 'AMGN',
            'Gilead': 'GILD',
            'Regeneron': 'REGN',
            'Vertex': 'VRTX',
            'Moderna': 'MRNA',
            'BioNTech': 'BNTX',
            'Biogen': 'BIIB',
            'Illumina': 'ILMN',
            'Intuitive Surgical': 'ISRG',
            'Stryker': 'SYK',
            'Boston Scientific': 'BSX',
            'Medtronic': 'MDT',
            'Baxter': 'BAX',
            'Becton Dickinson': 'BDX',
            'Cigna': 'CI',
            'Humana': 'HUM',
            'CVS Health': 'CVS',
            'Walgreens': 'WBA',
            'McKesson': 'MCK',
            'Cardinal Health': 'CAH',
            'AmerisourceBergen': 'ABC',
            'Zimmer Biomet': 'ZBH',
            'Edwards Lifesciences': 'EW',
            'IDEXX': 'IDXX',
            'Waters': 'WAT',
            'Agilent': 'A',

            // ═══════════════════════════════════════════════════════
            // HEALTHCARE EUROPE (40+ entreprises)
            // ═══════════════════════════════════════════════════════
            'Novo Nordisk': 'NVO',
            'Roche': 'RHHBY',
            'Novartis': 'NVS',
            'Sanofi': 'SNY',
            'AstraZeneca': 'AZN',
            'GSK': 'GSK',
            'Bayer': 'BAYRY',
            'Siemens Healthineers': 'SMMNY',
            'Fresenius': 'FSNUY',
            'Philips': 'PHG',
            'Lonza': 'LZAGY',
            'Grifols': 'GRFS',
            'UCB': 'UCBJF',
            'Recordati': 'RCDTF',
            'Almirall': 'ALM.MC',
            'Galapagos': 'GLPG',

            // ═══════════════════════════════════════════════════════
            // CONSUMER & RETAIL (USA)
            // ═══════════════════════════════════════════════════════
            'Walmart': 'WMT',
            'Costco': 'COST',
            'Home Depot': 'HD',
            'Target': 'TGT',
            'Lowe\'s': 'LOW',
            'TJX': 'TJX',
            'Dollar General': 'DG',
            'Dollar Tree': 'DLTR',
            'Best Buy': 'BBY',
            'eBay': 'EBAY',
            'Etsy': 'ETSY',
            'Wayfair': 'W',
            'Gap': 'GPS',
            'Ross Stores': 'ROST',
            'Burlington': 'BURL',
            'Nordstrom': 'JWN',
            'Macy\'s': 'M',
            'Kohl\'s': 'KSS',
            'Foot Locker': 'FL',
            'Nike': 'NKE',
            'Lululemon': 'LULU',
            'Under Armour': 'UAA',
            'VF Corp': 'VFC',
            'Ralph Lauren': 'RL',
            'Tapestry': 'TPR',
            'Capri': 'CPRI',

            // ═══════════════════════════════════════════════════════
            // CONSUMER EUROPE (60+ entreprises)
            // ═══════════════════════════════════════════════════════
            'LVMH': 'LVMUY',
            'Hermès': 'RMS.PA',
            'Kering': 'KER.PA',
            'L\'Oréal': 'OR.PA',
            'Adidas': 'ADDYY',
            'Puma': 'PMMAF',
            'Inditex': 'ITX.MC',
            'Zara': 'ITX.MC',
            'H&M': 'HNNMY',
            'Burberry': 'BURBY',
            'Moncler': 'MONC.MI',
            'Richemont': 'CFRHF',
            'Swatch': 'SWGAY',
            'Pandora': 'PANDY',
            'Carrefour': 'CA.PA',
            'Tesco': 'TSCDY',
            'Sainsbury': 'SBRY.L',
            'Metro': 'B4B.DE',
            'Ahold Delhaize': 'AD.AS',
            'Casino': 'CO.PA',
            'Marks & Spencer': 'MKS.L',
            'Next': 'NXT.L',
            'Primark': 'ABF.L',
            'Kingfisher': 'KGF.L',
            'Leroy Merlin': 'ACA.PA',
            'MediaMarkt': 'METGF',
            'IKEA': 'PRIVATE',
            'Decathlon': 'PRIVATE',

            // ═══════════════════════════════════════════════════════
            // CONSUMER ASIE (40+ entreprises)
            // ═══════════════════════════════════════════════════════
            'Uniqlo': 'PRIVATE',
            'Fast Retailing': '9983.T',
            'Seven & I Holdings': 'SVNDY',
            'Lawson': '2651.T',
            'FamilyMart': '8028.T',
            'Isetan Mitsukoshi': '3099.T',
            'Aeon': '8267.T',
            'Muji': '7453.T',
            'Shiseido': 'SSDOY',
            'Kao': 'KAOCF',
            'Anta Sports': '2020.HK',
            'Li Ning': '2331.HK',
            'Belle International': 'PRIVATE',

            // ═══════════════════════════════════════════════════════
            // FOOD & BEVERAGE (USA)
            // ═══════════════════════════════════════════════════════
            'Coca-Cola': 'KO',
            'PepsiCo': 'PEP',
            'Pepsi': 'PEP',
            'Mondelez': 'MDLZ',
            'Kraft Heinz': 'KHC',
            'General Mills': 'GIS',
            'Kellogg': 'K',
            'Conagra': 'CAG',
            'Campbell Soup': 'CPB',
            'Hershey': 'HSY',
            'Monster Beverage': 'MNST',
            'Constellation Brands': 'STZ',
            'Brown-Forman': 'BF.B',
            'Molson Coors': 'TAP',
            'Tyson Foods': 'TSN',
            'Hormel': 'HRL',
            'JM Smucker': 'SJM',
            'McCormick': 'MKC',
            'Lamb Weston': 'LW',

            // ═══════════════════════════════════════════════════════
            // FOOD & BEVERAGE EUROPE (50+ entreprises)
            // ═══════════════════════════════════════════════════════
            'Nestlé': 'NSRGY',
            'Danone': 'DANOY',
            'Unilever': 'UL',
            'Diageo': 'DEO',
            'Heineken': 'HEINY',
            'Carlsberg': 'CABGY',
            'AB InBev': 'BUD',
            'Pernod Ricard': 'PDRDY',
            'Remy Cointreau': 'REMYY',
            'Campari': 'DVDCY',
            'Ferrero': 'PRIVATE',
            'Lindt': 'LDSVF',
            'Barry Callebaut': 'BYCBF',
            'Associated British Foods': 'ABF.L',
            'Tate & Lyle': 'TATYY',
            'Kerry Group': 'KRYAY',
            'Arla Foods': 'PRIVATE',
            'FrieslandCampina': 'PRIVATE',

            // ═══════════════════════════════════════════════════════
            // RESTAURANTS & HOSPITALITY
            // ═══════════════════════════════════════════════════════
            'McDonald\'s': 'MCD',
            'Starbucks': 'SBUX',
            'Chipotle': 'CMG',
            'Yum Brands': 'YUM',
            'Restaurant Brands': 'QSR',
            'Domino\'s': 'DPZ',
            'Darden': 'DRI',
            'Wendy\'s': 'WEN',
            'Papa John\'s': 'PZZA',
            'Shake Shack': 'SHAK',
            'Wingstop': 'WING',
            'Marriott': 'MAR',
            'Hilton': 'HLT',
            'Hyatt': 'H',
            'Wyndham': 'WH',
            'MGM Resorts': 'MGM',
            'Caesars': 'CZR',
            'Las Vegas Sands': 'LVS',
            'Wynn': 'WYNN',
            'Accor': 'ACCYY',
            'Whitbread': 'WTB.L',
            'Intercontinental': 'IHG',

            // ═══════════════════════════════════════════════════════
            // ENERGY & UTILITIES (USA)
            // ═══════════════════════════════════════════════════════
            'ExxonMobil': 'XOM',
            'Exxon': 'XOM',
            'Chevron': 'CVX',
            'ConocoPhillips': 'COP',
            'Occidental': 'OXY',
            'Marathon Petroleum': 'MPC',
            'Valero': 'VLO',
            'Phillips 66': 'PSX',
            'EOG Resources': 'EOG',
            'Pioneer Natural': 'PXD',
            'Schlumberger': 'SLB',
            'Halliburton': 'HAL',
            'Baker Hughes': 'BKR',
            'Kinder Morgan': 'KMI',
            'Williams Companies': 'WMB',
            'Oneok': 'OKE',
            'Cheniere': 'LNG',
            'NextEra Energy': 'NEE',
            'Duke Energy': 'DUK',
            'Southern Company': 'SO',
            'Dominion': 'D',
            'Exelon': 'EXC',
            'American Electric': 'AEP',
            'Sempra': 'SRE',
            'Xcel Energy': 'XEL',
            'WEC Energy': 'WEC',
            'Eversource': 'ES',
            'Public Service': 'PEG',

            // ═══════════════════════════════════════════════════════
            // ENERGY EUROPE (60+ entreprises)
            // ═══════════════════════════════════════════════════════
            'Shell': 'SHEL',
            'BP': 'BP',
            'TotalEnergies': 'TTE',
            'Equinor': 'EQNR',
            'Eni': 'E',
            'Repsol': 'REPYY',
            'OMV': 'OMVKY',
            'Galp': 'GLPEY',
            'Neste': 'NTOIY',
            'Orsted': 'DNNGY',
            'Iberdrola': 'IBDRY',
            'Enel': 'ENLAY',
            'EDP': 'EDPFY',
            'RWE': 'RWEOY',
            'E.ON': 'EONGY',
            'Vattenfall': 'PRIVATE',
            'Engie': 'ENGIY',
            'SSE': 'SSEZY',
            'National Grid': 'NGG',
            'Centrica': 'CPYYY',
            'EDF': 'ECIFY',
            'Fortum': 'FOJCF',
            'Verbund': 'OEZVY',

            // ═══════════════════════════════════════════════════════
            // ENERGY ASIE (30+ entreprises)
            // ═══════════════════════════════════════════════════════
            'PetroChina': 'PTR',
            'Sinopec': 'SNP',
            'CNOOC': 'CEO',
            'Reliance Industries': 'RELIANCE.NS',
            'ONGC': 'ONGC.NS',
            'Indian Oil': 'IOC.NS',
            'Saudi Aramco': '2222.SR',
            'ADNOC': 'PRIVATE',

            // ═══════════════════════════════════════════════════════
            // INDUSTRIALS & MANUFACTURING (USA)
            // ═══════════════════════════════════════════════════════
            'Boeing': 'BA',
            'Caterpillar': 'CAT',
            'Honeywell': 'HON',
            '3M': 'MMM',
            'General Electric': 'GE',
            'GE': 'GE',
            'Lockheed Martin': 'LMT',
            'Raytheon': 'RTX',
            'Northrop Grumman': 'NOC',
            'General Dynamics': 'GD',
            'L3Harris': 'LHX',
            'Deere': 'DE',
            'United Technologies': 'UTX',
            'Carrier': 'CARR',
            'Otis': 'OTIS',
            'Parker-Hannifin': 'PH',
            'Eaton': 'ETN',
            'Emerson': 'EMR',
            'Illinois Tool Works': 'ITW',
            'Rockwell Automation': 'ROK',
            'Johnson Controls': 'JCI',
            'Cummins': 'CMI',
            'PACCAR': 'PCAR',
            'Westinghouse Air Brake': 'WAB',
            'Norfolk Southern': 'NSC',
            'Union Pacific': 'UNP',
            'CSX': 'CSX',
            'Kansas City Southern': 'KSU',
            'FedEx': 'FDX',
            'UPS': 'UPS',
            'XPO Logistics': 'XPO',
            'JB Hunt': 'JBHT',
            'Old Dominion': 'ODFL',

            // ═══════════════════════════════════════════════════════
            // INDUSTRIALS EUROPE (80+ entreprises)
            // ═══════════════════════════════════════════════════════
            'Siemens': 'SIEGY',
            'ABB': 'ABB',
            'Schneider Electric': 'SBGSF',
            'Airbus': 'EADSY',
            'Safran': 'SAFRY',
            'Rolls-Royce': 'RYCEY',
            'BAE Systems': 'BAESY',
            'Thales': 'THLLY',
            'Leonardo': 'FINMY',
            'MTU Aero': 'MTUAY',
            'Dassault Aviation': 'DUAVF',
            'Rheinmetall': 'RNMBY',
            'Kone': 'KNYJY',
            'Schindler': 'SHLRF',
            'Atlas Copco': 'ATLKY',
            'Volvo': 'VOLVY',
            'Scania': 'SCVCY',
            'MAN': 'VLKAF',
            'Daimler Truck': 'DTG',
            'Knorr-Bremse': 'KNRRY',
            'CNH Industrial': 'CNHI',
            'Komatsu Europe': 'KMTUY',
            'Sandvik': 'SDVKY',
            'SKF': 'SKFRY',
            'Alfa Laval': 'ALFVY',
            'Legrand': 'LGRDY',
            'Rexel': 'RXL.PA',
            'Brenntag': 'BNTGY',
            'Deutsche Post': 'DPSGY',
            'PostNL': 'PNL.AS',
            'Royal Mail': 'RMG.L',
            'Kuehne + Nagel': 'KHNGY',
            'DSV': 'DSDVY',
            'DB Schenker': 'PRIVATE',

            // ═══════════════════════════════════════════════════════
            // INDUSTRIALS ASIE (50+ entreprises)
            // ═══════════════════════════════════════════════════════
            'Mitsubishi Heavy': 'MHVYF',
            'Kawasaki Heavy': 'KWHIY',
            'IHI': 'IHICF',
            'Hitachi': 'HTHIY',
            'Toshiba': 'TOSYY',
            'Panasonic': 'PCRFY',
            'Makita': 'MKTAY',
            'Fanuc': 'FANUY',
            'Yaskawa': 'YASKY',
            'SMC': 'SMCAY',
            'Komatsu': 'KMTUY',
            'Kubota': 'KUBTY',
            'Hino Motors': 'HINOF',
            'Isuzu': 'ISUZY',
            'China State Construction': 'CSCEC',
            'China Railway': 'CRYCY',
            'CRRC': '1766.HK',
            'Larsen & Toubro': 'LT.NS',
            'Tata Motors': 'TTM',
            'Mahindra': 'MAHMF',
            'Hyundai Heavy': 'HYHHF',
            'Doosan': 'DOOSF',

            // ═══════════════════════════════════════════════════════
            // AUTOMOTIVE (MONDE)
            // ═══════════════════════════════════════════════════════
            'Ford': 'F',
            'General Motors': 'GM',
            'Rivian': 'RIVN',
            'Lucid': 'LCID',
            'Nikola': 'NKLA',
            'Fisker': 'FSR',
            'Volkswagen': 'VWAGY',
            'BMW': 'BMWYY',
            'Mercedes-Benz': 'MBGAF',
            'Porsche': 'POAHY',
            'Ferrari': 'RACE',
            'Stellantis': 'STLA',
            'Renault': 'RNLSY',
            'Peugeot': 'STLA',
            'Toyota': 'TM',
            'Honda': 'HMC',
            'Nissan': 'NSANY',
            'Mazda': 'MZDAY',
            'Subaru': 'FUJHY',
            'Suzuki': 'SZKMY',
            'Mitsubishi Motors': 'MMTOF',
            'Hyundai': 'HYMTF',
            'Kia': 'KIMTF',
            'Geely': 'GELYF',
            'Great Wall': '2333.HK',
            'SAIC': '600104.SS',

            // ═══════════════════════════════════════════════════════
            // TELECOMMUNICATIONS & MEDIA
            // ═══════════════════════════════════════════════════════
            'Verizon': 'VZ',
            'AT&T': 'T',
            'T-Mobile': 'TMUS',
            'Comcast': 'CMCSA',
            'Charter': 'CHTR',
            'Disney': 'DIS',
            'Warner Bros': 'WBD',
            'Paramount': 'PARA',
            'SiriusXM': 'SIRI',
            'Fox': 'FOX',
            'News Corp': 'NWSA',
            'ViacomCBS': 'VIAC',
            'Discovery': 'DISCA',
            'Live Nation': 'LYV',
            'Madison Square Garden': 'MSG',
            'Vodafone': 'VOD',
            'BT Group': 'BT.L',
            'Orange': 'ORAN',
            'Deutsche Telekom': 'DTEGY',
            'Telefonica': 'TEF',
            'Telecom Italia': 'TIIAY',
            'Swisscom': 'SCMWY',
            'KPN': 'KKPNY',
            'Proximus': 'BGAOY',
            'Telenor': 'TELNY',
            'Telia': 'TLSNY',
            'China Mobile': 'CHL',
            'China Telecom': 'CHA',
            'China Unicom': 'CHU',
            'NTT': 'NTTYY',
            'KDDI': 'KDDIY',
            'SoftBank Corp': '9434.T',
            'SK Telecom': 'SKM',
            'KT Corp': 'KT',
            'Bharti Airtel': 'BHARTIARTL.NS',
            'Reliance Jio': 'RELIANCE.NS',

            // ═══════════════════════════════════════════════════════
            // REAL ESTATE & CONSTRUCTION
            // ═══════════════════════════════════════════════════════
            'American Tower': 'AMT',
            'Prologis': 'PLD',
            'Crown Castle': 'CCI',
            'Equinix': 'EQIX',
            'Public Storage': 'PSA',
            'Simon Property': 'SPG',
            'Realty Income': 'O',
            'VICI Properties': 'VICI',
            'Welltower': 'WELL',
            'AvalonBay': 'AVB',
            'Equity Residential': 'EQR',
            'Digital Realty': 'DLR',
            'SBA Communications': 'SBAC',
            'Lennar': 'LEN',
            'DR Horton': 'DHI',
            'PulteGroup': 'PHM',
            'NVR': 'NVR',
            'Toll Brothers': 'TOL',
            'Vonovia': 'VNA.DE',
            'Unibail': 'URW.AS',
            'Segro': 'SGRO.L',
            'Land Securities': 'LAND.L',
            'British Land': 'BLND.L',
            'Klepierre': 'LI.PA',
            'Gecina': 'GFC.PA',

            // ═══════════════════════════════════════════════════════
            // CRYPTO & FINTECH
            // ═══════════════════════════════════════════════════════
            'Bitcoin': 'BTC-USD',
            'Ethereum': 'ETH-USD',
            'Marathon Digital': 'MARA',
            'Riot Platforms': 'RIOT',
            'MicroStrategy': 'MSTR',
            'LendingClub': 'LC',
            'LendingTree': 'TREE',
            'Upstart': 'UPST',

            // ═══════════════════════════════════════════════════════
            // MINING & MATERIALS (50+ entreprises)
            // ═══════════════════════════════════════════════════════
            'BHP': 'BHP',
            'Rio Tinto': 'RIO',
            'Vale': 'VALE',
            'Glencore': 'GLNCY',
            'Anglo American': 'AAUKY',
            'Freeport-McMoRan': 'FCX',
            'Newmont': 'NEM',
            'Barrick Gold': 'GOLD',
            'Fortescue': 'FSUGY',
            'Alcoa': 'AA',
            'ArcelorMittal': 'MT',
            'Nucor': 'NUE',
            'Steel Dynamics': 'STLD',
            'Teck Resources': 'TECK',
            'First Quantum': 'FQVLF',
            'Southern Copper': 'SCCO',
            'Lundin Mining': 'LUNMF',
            'Antofagasta': 'ANFGF',

            // ═══════════════════════════════════════════════════════
            // LUXURY GOODS (30+ entreprises)
            // ═══════════════════════════════════════════════════════
            'LVMH': 'LVMUY',
            'Hermès': 'RMS.PA',
            'Kering': 'KER.PA',
            'Richemont': 'CFRHF',
            'Swatch': 'SWGAY',
            'Prada': '1913.HK',
            'Moncler': 'MONC.MI',
            'Burberry': 'BURBY',
            'Salvatore Ferragamo': 'SFER.MI',
            'Tod\'s': 'TOD.MI',
            'Brunello Cucinelli': 'BC.MI',
            'Canada Goose': 'GOOS',

            // ═══════════════════════════════════════════════════════
            // AEROSPACE & DEFENSE
            // ═══════════════════════════════════════════════════════
            'Lockheed Martin': 'LMT',
            'Boeing': 'BA',
            'Raytheon': 'RTX',
            'Northrop Grumman': 'NOC',
            'General Dynamics': 'GD',
            'L3Harris': 'LHX',
            'Airbus': 'EADSY',
            'BAE Systems': 'BAESY',
            'Thales': 'THLLY',
            'Leonardo': 'FINMY',
            'Saab': 'SAABF',
            'Dassault Aviation': 'DUAVF',
            'Rolls-Royce': 'RYCEY',

            // ═══════════════════════════════════════════════════════
            // CHEMICALS & AGRICULTURE (40+ entreprises)
            // ═══════════════════════════════════════════════════════
            'BASF': 'BASFY',
            'Dow': 'DOW',
            'DuPont': 'DD',
            'Linde': 'LIN',
            'Air Liquide': 'AIQUY',
            'Air Products': 'APD',
            'Sherwin-Williams': 'SHW',
            'PPG Industries': 'PPG',
            'Ecolab': 'ECL',
            'Corteva': 'CTVA',
            'Bayer': 'BAYRY',
            'Syngenta': 'PRIVATE',
            'Yara': 'YARIY',
            'CF Industries': 'CF',
            'Mosaic': 'MOS',
            'Nutrien': 'NTR',
            'Covestro': 'CVVTF',
            'Akzo Nobel': 'AKZOY',
            'Solvay': 'SLVYY',
            'Evonik': 'EVKIF',
            'Clariant': 'CLZNF',
            'DSM': 'RDSMY',
            'Givaudan': 'GVDNY',
            'Symrise': 'SYIEY',
            'International Flavors': 'IFF'
        };
    }

    buildCountriesDatabase() {
        return [
            // Amérique du Nord
            'United States', 'USA', 'U.S.', 'America', 'American',
            'Canada', 'Canadian', 'Mexico', 'Mexican',
            
            // Amérique Centrale & Caraïbes
            'Guatemala', 'Belize', 'Honduras', 'El Salvador', 'Nicaragua',
            'Costa Rica', 'Panama', 'Cuba', 'Cuban', 'Jamaica', 'Haiti',
            'Dominican Republic', 'Bahamas', 'Trinidad and Tobago',
            'Barbados', 'Saint Lucia', 'Grenada', 'Saint Vincent',
            'Antigua and Barbuda', 'Dominica', 'Saint Kitts and Nevis',
            
            // Amérique du Sud
            'Brazil', 'Brazilian', 'Argentina', 'Argentine', 'Colombian', 'Colombia', 
            'Chile', 'Chilean', 'Peru', 'Peruvian',
            'Venezuela', 'Venezuelan', 'Ecuador', 'Bolivia', 'Bolivian',
            'Paraguay', 'Uruguay', 'Uruguayan',
            'Guyana', 'Suriname', 'French Guiana',
            
            // Europe Occidentale
            'United Kingdom', 'UK', 'Britain', 'British', 'England', 'English',
            'Scotland', 'Scottish', 'Wales', 'Welsh',
            'France', 'French', 'Germany', 'German', 'Italy', 'Italian', 
            'Spain', 'Spanish', 'Portugal', 'Portuguese',
            'Netherlands', 'Dutch', 'Belgium', 'Belgian', 
            'Switzerland', 'Swiss', 'Austria', 'Austrian',
            'Ireland', 'Irish', 'Luxembourg', 'Monaco', 'Liechtenstein',
            'Andorra', 'San Marino', 'Vatican', 'Malta', 'Maltese',
            
            // Europe du Nord
            'Norway', 'Norwegian', 'Sweden', 'Swedish', 'Denmark', 'Danish', 
            'Finland', 'Finnish', 'Iceland', 'Icelandic',
            
            // Europe de l'Est
            'Poland', 'Polish', 'Czech Republic', 'Czech', 'Hungary', 'Hungarian',
            'Romania', 'Romanian', 'Bulgaria', 'Bulgarian',
            'Slovakia', 'Slovak', 'Croatia', 'Croatian', 'Slovenia', 'Slovenian',
            'Serbia', 'Serbian', 'Bosnia', 'Bosnian',
            'Montenegro', 'North Macedonia', 'Macedonia', 'Albanian', 'Albania', 
            'Kosovo',
            
            // Europe Baltes
            'Estonia', 'Estonian', 'Latvia', 'Latvian', 'Lithuania', 'Lithuanian',
            
            // Ex-URSS
            'Russia', 'Russian', 'Ukraine', 'Ukrainian', 'Belarus', 'Belarusian',
            'Moldova', 'Moldovan', 'Georgia', 'Georgian', 
            'Armenia', 'Armenian', 'Azerbaijan', 'Azerbaijani',
            'Kazakhstan', 'Kazakh', 'Uzbekistan', 'Uzbek', 
            'Turkmenistan', 'Turkmen',
            'Kyrgyzstan', 'Kyrgyz', 'Tajikistan', 'Tajik',
            
            // Moyen-Orient
            'Turkey', 'Turkish', 'Israel', 'Israeli', 
            'Saudi Arabia', 'Saudi', 'UAE', 'United Arab Emirates', 'Emirati',
            'Qatar', 'Qatari', 'Kuwait', 'Kuwaiti', 'Bahrain', 'Bahraini',
            'Oman', 'Omani', 'Jordan', 'Jordanian',
            'Lebanon', 'Lebanese', 'Iraq', 'Iraqi', 
            'Iran', 'Iranian', 'Syria', 'Syrian', 'Yemen', 'Yemeni',
            'Palestine', 'Palestinian',
            
            // Asie de l'Est
            'China', 'Chinese', 'Japan', 'Japanese', 
            'South Korea', 'Korean', 'North Korea',
            'Taiwan', 'Taiwanese', 'Hong Kong', 'Macau', 'Mongolia', 'Mongolian',
            
            // Asie du Sud-Est
            'Singapore', 'Singaporean', 'Malaysia', 'Malaysian',
            'Indonesian', 'Indonesia', 
            'Thailand', 'Thai', 'Philippines', 'Philippine', 'Filipino',
            'Vietnam', 'Vietnamese', 'Myanmar', 'Burmese',
            'Cambodia', 'Cambodian', 'Laos', 'Lao',
            'Brunei', 'East Timor',
            
            // Asie du Sud
            'India', 'Indian', 'Pakistan', 'Pakistani', 
            'Bangladesh', 'Bangladeshi', 'Sri Lanka', 'Sri Lankan',
            'Nepal', 'Nepalese', 'Bhutan', 'Bhutanese',
            'Maldives', 'Maldivian', 'Afghanistan', 'Afghan',
            
            // Océanie
            'Australia', 'Australian', 'New Zealand', 'Zealand',
            'Papua New Guinea', 'Fiji', 'Fijian',
            'Solomon Islands', 'Vanuatu', 'Samoa', 'Samoan',
            'Kiribati', 'Tonga', 'Tongan', 'Micronesia', 'Palau',
            'Marshall Islands', 'Nauru', 'Tuvalu',
            
            // Afrique du Nord
            'Egypt', 'Egyptian', 'Libya', 'Libyan', 
            'Tunisia', 'Tunisian', 'Algeria', 'Algerian',
            'Morocco', 'Moroccan', 'Sudan', 'Sudanese', 'South Sudan',
            
            // Afrique de l'Ouest
            'Nigeria', 'Nigerian', 'Ghana', 'Ghanaian',
            'Senegal', 'Senegalese', 'Ivory Coast', 'Ivorian', 'Côte d\'Ivoire',
            'Mali', 'Malian', 'Burkina Faso', 'Niger', 'Benin',
            'Togo', 'Togolese', 'Guinea', 'Guinean',
            'Sierra Leone', 'Liberia', 'Liberian', 'Mauritania', 'Mauritanian',
            'Gambia', 'Gambian', 'Guinea-Bissau', 'Cape Verde',
            
            // Afrique Centrale
            'Democratic Republic of Congo', 'DRC', 'Congo', 'Congolese',
            'Cameroon', 'Cameroonian', 'Chad', 'Chadian',
            'Central African Republic',
            'Gabon', 'Gabonese', 'Equatorial Guinea', 'São Tomé and Príncipe',
            
            // Afrique de l'Est
            'Ethiopia', 'Ethiopian', 'Kenya', 'Kenyan',
            'Tanzania', 'Tanzanian', 'Uganda', 'Ugandan',
            'Somalia', 'Somali', 'Rwanda', 'Rwandan',
            'Burundi', 'Burundian', 'Eritrea', 'Eritrean',
            'Djibouti', 'Seychelles', 'Comoros', 'Mauritius', 'Mauritian',
            
            // Afrique Australe
            'South Africa', 'South African', 'Zimbabwe', 'Zimbabwean',
            'Zambia', 'Zambian', 'Mozambique', 'Mozambican',
            'Angola', 'Angolan', 'Namibia', 'Namibian',
            'Botswana', 'Batswana', 'Malawi', 'Malawian',
            'Lesotho', 'Eswatini', 'Swaziland', 'Swazi',
            'Madagascar', 'Malagasy',
            
            // Régions géopolitiques
            'Europe', 'European', 'Asia', 'Asian', 'Africa', 'African', 
            'Middle East', 'Latin America', 'Caribbean', 'Pacific', 'Oceania'
        ];
    }

    extractEntities(article) {
        const fullText = `${article.title} ${article.description}`.toLowerCase();
        
        const entities = {
            companies: [],
            countries: [],
            tickers: []
        };

        // Extraction des entreprises
        Object.keys(this.companies).forEach(companyName => {
            const escapedName = companyName.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`\\b${escapedName}\\b`, 'gi');
            if (regex.test(fullText)) {
                entities.companies.push({
                    name: companyName,
                    ticker: this.companies[companyName]
                });
                entities.tickers.push(this.companies[companyName]);
            }
        });

        // Extraction des pays
        this.countries.forEach(country => {
            const escapedCountry = country.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`\\b${escapedCountry}\\b`, 'gi');
            if (regex.test(fullText)) {
                if (!entities.countries.includes(country)) {
                    entities.countries.push(country);
                }
            }
        });

        // Dédoublonnage
        entities.companies = entities.companies.filter((company, index, self) =>
            index === self.findIndex((c) => c.ticker === company.ticker)
        );
        entities.tickers = [...new Set(entities.tickers)];

        // Filtrage anti-artefacts
        const invalidEntities = ['CDATA', 'XML', 'RSS', 'HTML', 'HTTP', 'HTTPS', 'WWW', 'API', 'JSON', 'UTF'];
        entities.companies = entities.companies.filter(c => !invalidEntities.includes(c.name.toUpperCase()));
        entities.countries = entities.countries.filter(c => !invalidEntities.includes(c.toUpperCase()));
        entities.tickers = entities.tickers.filter(t => !invalidEntities.includes(t.toUpperCase()));

        return entities;
    }

    // ✅ NOUVELLE MÉTHODE : Trouver le nom d'entreprise à partir du ticker
    getCompanyName(ticker) {
        for (const [name, tick] of Object.entries(this.companies)) {
            if (tick === ticker) {
                return name;
            }
        }
        return ticker; // Fallback au ticker si non trouvé
    }
}

// Instance globale
window.entityDB = new EntityDatabase();
console.log(`📚 Entity Database loaded: ${Object.keys(window.entityDB.companies).length} companies, ${window.entityDB.countries.length} countries`);