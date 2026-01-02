/**
 * ════════════════════════════════════════════════════════════════
 * COMPANIES DIRECTORY - SYSTÈME COMPLET
 * Multi-API Logos + 15 Secteurs Principaux + Filtres Région
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
        
        // ✅ 15 SECTEURS PRINCIPAUX (Monde entier)
        this.mainSectors = {
            'Technology': ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA', 'NFLX', 'ADBE', 'CRM', 'ORCL', 'INTC', 'AMD', 'QCOM', 'AVGO', 'TXN', 'CSCO', 'IBM', 'ACN', 'NOW', 'INTU', 'PYPL', 'SQ', 'SNOW', 'PLTR', 'ZM', 'SHOP', 'UBER', 'LYFT', 'ABNB', 'DASH', 'SNAP', 'PINS', 'SPOT', 'RBLX', 'TWLO', 'OKTA', 'CRWD', 'DDOG', 'MDB', 'SPLK', 'WDAY', 'ADSK', 'VMW', 'DELL', 'HPQ', 'HPE', 'WDC', 'STX', 'MU', 'AMAT', 'LRCX', 'KLAC', 'ADI', 'MRVL', 'SNPS', 'CDNS', 'SAP', 'ASML', 'ERIC', 'NOK', 'STM', 'BABA', 'TCEHY', 'SSNLF', 'TSM', 'SONY', 'BIDU', 'JD', 'NTES', 'PDD', 'NIO', 'LI', 'XPEV', 'BYDDY', 'SFTBY', 'NTDOY', 'INFY', 'WIT', 'U', 'TWTR'],
            'Finance': ['JPM', 'BAC', 'WFC', 'C', 'GS', 'MS', 'USB', 'PNC', 'TFC', 'COF', 'SCHW', 'AXP', 'DFS', 'SYF', 'V', 'MA', 'AFRM', 'SOFI', 'HOOD', 'COIN', 'BLK', 'STT', 'BK', 'NTRS', 'TROW', 'BEN', 'IVZ', 'RJF', 'IBKR', 'ETFC', 'AMTD', 'ALLY', 'HSBC', 'BCS', 'LYG', 'DB', 'UBS', 'CS', 'ING', 'SAN', 'BBVA', 'IDCBY', 'CICHY', 'HDB', 'IBN', 'MUFG', 'SMFG', 'MFG', 'NMR', 'SCBFF', 'NWG.L', 'CBKGF', 'BNP.PA', 'GLE.PA', 'ACA.PA', 'ABN.AS', 'UCG.MI', 'ISP.MI', 'CABK.MC', 'NDAFI', 'DANSKE.CO', 'ALV.DE', 'CS.PA', 'ZURN.SW', 'PRU.L', 'AV.L', 'LGEN.L', 'G.MI', 'DBSDY', 'OVCHY', 'UOVEY', 'PNGAY', 'CIHKY', 'SBKFF', 'AXIBANK.NS', 'KOTAKBANK.NS', 'ACGBY', 'BACHF'],
            'Healthcare': ['JNJ', 'UNH', 'PFE', 'LLY', 'ABBV', 'MRK', 'ABT', 'TMO', 'DHR', 'BMY', 'AMGN', 'GILD', 'REGN', 'VRTX', 'MRNA', 'BNTX', 'BIIB', 'ILMN', 'ISRG', 'SYK', 'BSX', 'MDT', 'BAX', 'BDX', 'CI', 'HUM', 'CVS', 'WBA', 'MCK', 'CAH', 'ABC', 'ZBH', 'EW', 'IDXX', 'WAT', 'A', 'NVO', 'RHHBY', 'NVS', 'SNY', 'AZN', 'GSK', 'BAYRY', 'SMMNY', 'FSNUY', 'PHG', 'LZAGY', 'GRFS', 'UCBJF', 'RCDTF', 'ALM.MC', 'GLPG'],
            'Consumer Goods': ['WMT', 'COST', 'HD', 'TGT', 'LOW', 'TJX', 'DG', 'DLTR', 'BBY', 'EBAY', 'ETSY', 'W', 'GPS', 'ROST', 'BURL', 'JWN', 'M', 'KSS', 'FL', 'NKE', 'LULU', 'UAA', 'VFC', 'RL', 'TPR', 'CPRI', 'LVMUY', 'RMS.PA', 'KER.PA', 'OR.PA', 'ADDYY', 'PMMAF', 'ITX.MC', 'HNNMY', 'BURBY', 'MONC.MI', 'CFRHF', 'SWGAY', 'PANDY', 'CA.PA', 'TSCDY', 'SBRY.L', 'B4B.DE', 'AD.AS', 'CO.PA', 'MKS.L', 'NXT.L', 'ABF.L', 'KGF.L'],
            'Food & Beverage': ['KO', 'PEP', 'MDLZ', 'KHC', 'GIS', 'K', 'CAG', 'CPB', 'HSY', 'MNST', 'STZ', 'BF.B', 'TAP', 'TSN', 'HRL', 'SJM', 'MKC', 'LW', 'MCD', 'SBUX', 'CMG', 'YUM', 'QSR', 'DPZ', 'DRI', 'WEN', 'PZZA', 'SHAK', 'WING', 'NSRGY', 'DANOY', 'UL', 'DEO', 'HEINY', 'CABGY', 'BUD', 'PDRDY', 'REMYY', 'DVDCY', 'LDSVF', 'BYCBF', 'TATYY', 'KRYAY'],
            'Energy': ['XOM', 'CVX', 'COP', 'OXY', 'MPC', 'VLO', 'PSX', 'EOG', 'PXD', 'SLB', 'HAL', 'BKR', 'KMI', 'WMB', 'OKE', 'LNG', 'NEE', 'DUK', 'SO', 'D', 'EXC', 'AEP', 'SRE', 'XEL', 'WEC', 'ES', 'PEG', 'SHEL', 'BP', 'TTE', 'EQNR', 'E', 'REPYY', 'OMVKY', 'GLPEY', 'NTOIY', 'DNNGY', 'IBDRY', 'ENLAY', 'EDPFY', 'RWEOY', 'EONGY', 'ENGIY', 'SSEZY', 'NGG', 'CPYYY', 'ECIFY', 'FOJCF', 'OEZVY', 'PTR', 'SNP', 'CEO', 'RELIANCE.NS', 'ONGC.NS', 'IOC.NS', '2222.SR'],
            'Industrials': ['BA', 'CAT', 'HON', 'MMM', 'GE', 'LMT', 'RTX', 'NOC', 'GD', 'LHX', 'DE', 'UTX', 'CARR', 'OTIS', 'PH', 'ETN', 'EMR', 'ITW', 'ROK', 'JCI', 'CMI', 'PCAR', 'WAB', 'NSC', 'UNP', 'CSX', 'KSU', 'FDX', 'UPS', 'XPO', 'JBHT', 'ODFL', 'SIEGY', 'ABB', 'SBGSF', 'EADSY', 'SAFRY', 'RYCEY', 'BAESY', 'THLLY', 'FINMY', 'MTUAY', 'DUAVF', 'RNMBY', 'KNYJY', 'SHLRF', 'ATLKY', 'VOLVY', 'SCVCY', 'VLKAF', 'DTG', 'KNRRY', 'CNHI', 'SDVKY', 'SKFRY', 'ALFVY', 'LGRDY', 'RXL.PA', 'BNTGY', 'DPSGY', 'PNL.AS', 'RMG.L', 'KHNGY', 'DSDVY', 'MHVYF', 'KWHIY', 'IHICF', 'HTHIY', 'TOSYY', 'PCRFY', 'MKTAY', 'FANUY', 'YASKY', 'SMCAY', 'KMTUY', 'KUBTY', 'HINOF', 'ISUZY', 'LT.NS', 'TTM', 'MAHMF'],
            'Automotive': ['F', 'GM', 'RIVN', 'LCID', 'NKLA', 'FSR', 'VWAGY', 'BMWYY', 'MBGAF', 'POAHY', 'RACE', 'STLA', 'RNLSY', 'TM', 'HMC', 'NSANY', 'MZDAY', 'FUJHY', 'SZKMY', 'MMTOF', 'HYMTF', 'KIMTF', 'GELYF', '2333.HK', '600104.SS'],
            'Telecom & Media': ['VZ', 'T', 'TMUS', 'CMCSA', 'CHTR', 'DIS', 'WBD', 'PARA', 'SIRI', 'FOX', 'NWSA', 'VIAC', 'DISCA', 'LYV', 'MSG', 'VOD', 'BT.L', 'ORAN', 'DTEGY', 'TEF', 'TIIAY', 'SCMWY', 'KKPNY', 'BGAOY', 'TELNY', 'TLSNY', 'CHL', 'CHA', 'CHU', 'NTTYY', 'KDDIY', '9434.T', 'SKM', 'KT', 'BHARTIARTL.NS'],
            'Real Estate': ['AMT', 'PLD', 'CCI', 'EQIX', 'PSA', 'SPG', 'O', 'VICI', 'WELL', 'AVB', 'EQR', 'DLR', 'SBAC', 'LEN', 'DHI', 'PHM', 'NVR', 'TOL', 'VNA.DE', 'URW.AS', 'SGRO.L', 'LAND.L', 'BLND.L', 'LI.PA', 'GFC.PA'],
            'Mining & Materials': ['BHP', 'RIO', 'VALE', 'GLNCY', 'AAUKY', 'FCX', 'NEM', 'GOLD', 'FSUGY', 'AA', 'MT', 'NUE', 'STLD', 'TECK', 'SCCO', 'FQVLF', 'LUNMF', 'ANFGF'],
            'Hospitality': ['MAR', 'HLT', 'H', 'WH', 'MGM', 'CZR', 'LVS', 'WYNN', 'ACCYY', 'WTB.L', 'IHG'],
            'Chemicals & Agriculture': ['BASFY', 'DOW', 'DD', 'LIN', 'AIQUY', 'APD', 'SHW', 'PPG', 'ECL', 'CTVA', 'CF', 'MOS', 'NTR', 'IFF', 'CVVTF', 'AKZOY', 'SLVYY', 'EVKIF', 'CLZNF', 'RDSMY', 'GVDNY', 'SYIEY'],
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
            'TWTR': 'twitter.com',
            'PINS': 'pinterest.com',
            'SPOT': 'spotify.com',
            'RBLX': 'roblox.com',
            'U': 'unity.com',
            'TWLO': 'twilio.com',
            'OKTA': 'okta.com',
            'CRWD': 'crowdstrike.com',
            'DDOG': 'datadoghq.com',
            'MDB': 'mongodb.com',
            'SPLK': 'splunk.com',
            'WDAY': 'workday.com',
            'ADSK': 'autodesk.com',
            'VMW': 'vmware.com',
            'DELL': 'dell.com',
            'HPQ': 'hp.com',
            'HPE': 'hpe.com',
            'WDC': 'westerndigital.com',
            'STX': 'seagate.com',
            'MU': 'micron.com',
            'AMAT': 'appliedmaterials.com',
            'LRCX': 'lamresearch.com',
            'KLAC': 'kla.com',
            'ADI': 'analog.com',
            'MRVL': 'marvell.com',
            'SNPS': 'synopsys.com',
            'CDNS': 'cadence.com',
            
            // USA - Finance
            'JPM': 'jpmorganchase.com',
            'BAC': 'bankofamerica.com',
            'WFC': 'wellsfargo.com',
            'C': 'citigroup.com',
            'GS': 'goldmansachs.com',
            'MS': 'morganstanley.com',
            'USB': 'usbank.com',
            'PNC': 'pnc.com',
            'TFC': 'truist.com',
            'COF': 'capitalone.com',
            'SCHW': 'schwab.com',
            'AXP': 'americanexpress.com',
            'DFS': 'discover.com',
            'SYF': 'synchrony.com',
            'V': 'visa.com',
            'MA': 'mastercard.com',
            'AFRM': 'affirm.com',
            'SOFI': 'sofi.com',
            'HOOD': 'robinhood.com',
            'COIN': 'coinbase.com',
            'BLK': 'blackrock.com',
            'STT': 'statestreet.com',
            'BK': 'bnymellon.com',
            'NTRS': 'northerntrust.com',
            'TROW': 'troweprice.com',
            'BEN': 'franklintempleton.com',
            'IVZ': 'invesco.com',
            'RJF': 'raymondjames.com',
            'IBKR': 'interactivebrokers.com',
            'ETFC': 'etrade.com',
            'AMTD': 'tdameritrade.com',
            'ALLY': 'ally.com',
            
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
            'BIIB': 'biogen.com',
            'ILMN': 'illumina.com',
            'ISRG': 'intuitive.com',
            'SYK': 'stryker.com',
            'BSX': 'bostonscientific.com',
            'MDT': 'medtronic.com',
            'BAX': 'baxter.com',
            'BDX': 'bd.com',
            'CI': 'cigna.com',
            'HUM': 'humana.com',
            'CVS': 'cvshealth.com',
            'WBA': 'walgreens.com',
            'MCK': 'mckesson.com',
            'CAH': 'cardinalhealth.com',
            'ABC': 'amerisourcebergen.com',
            'ZBH': 'zimmerbiomet.com',
            'EW': 'edwards.com',
            'IDXX': 'idexx.com',
            'WAT': 'waters.com',
            'A': 'agilent.com',
            
            // USA - Consumer
            'WMT': 'walmart.com',
            'COST': 'costco.com',
            'HD': 'homedepot.com',
            'TGT': 'target.com',
            'LOW': 'lowes.com',
            'TJX': 'tjx.com',
            'DG': 'dollargeneral.com',
            'DLTR': 'dollartree.com',
            'BBY': 'bestbuy.com',
            'EBAY': 'ebay.com',
            'ETSY': 'etsy.com',
            'W': 'wayfair.com',
            'GPS': 'gap.com',
            'ROST': 'rossstores.com',
            'BURL': 'burlington.com',
            'JWN': 'nordstrom.com',
            'M': 'macys.com',
            'KSS': 'kohls.com',
            'FL': 'footlocker.com',
            'NKE': 'nike.com',
            'LULU': 'lululemon.com',
            'UAA': 'underarmour.com',
            'VFC': 'vfc.com',
            'RL': 'ralphlauren.com',
            'TPR': 'tapestry.com',
            'CPRI': 'capriholdings.com',
            
            // USA - Food & Beverage
            'KO': 'coca-colacompany.com',
            'PEP': 'pepsico.com',
            'MDLZ': 'mondelezinternational.com',
            'KHC': 'kraftheinzcompany.com',
            'GIS': 'generalmills.com',
            'K': 'kelloggs.com',
            'CAG': 'conagrabrands.com',
            'CPB': 'campbellsoupcompany.com',
            'HSY': 'thehersheycompany.com',
            'MNST': 'monsterenergy.com',
            'STZ': 'cbrands.com',
            'BF.B': 'brown-forman.com',
            'TAP': 'molsoncoors.com',
            'TSN': 'tysonfoods.com',
            'HRL': 'hormelfoods.com',
            'SJM': 'jmsmucker.com',
            'MKC': 'mccormick.com',
            'LW': 'lambweston.com',
            'MCD': 'mcdonalds.com',
            'SBUX': 'starbucks.com',
            'CMG': 'chipotle.com',
            'YUM': 'yum.com',
            'QSR': 'rbi.com',
            'DPZ': 'dominos.com',
            'DRI': 'darden.com',
            'WEN': 'wendys.com',
            'PZZA': 'papajohns.com',
            'SHAK': 'shakeshack.com',
            'WING': 'wingstop.com',
            
            // USA - Hospitality
            'MAR': 'marriott.com',
            'HLT': 'hilton.com',
            'H': 'hyatt.com',
            'WH': 'wyndhamhotels.com',
            'MGM': 'mgmresorts.com',
            'CZR': 'caesars.com',
            'LVS': 'sands.com',
            'WYNN': 'wynnresorts.com',
            
            // USA - Energy
            'XOM': 'exxonmobil.com',
            'CVX': 'chevron.com',
            'COP': 'conocophillips.com',
            'OXY': 'oxy.com',
            'MPC': 'marathonpetroleum.com',
            'VLO': 'valero.com',
            'PSX': 'phillips66.com',
            'EOG': 'eogresources.com',
            'PXD': 'pxd.com',
            'SLB': 'slb.com',
            'HAL': 'halliburton.com',
            'BKR': 'bakerhughes.com',
            'KMI': 'kindermorgan.com',
            'WMB': 'williams.com',
            'OKE': 'oneok.com',
            'LNG': 'cheniere.com',
            'NEE': 'nexteraenergy.com',
            'DUK': 'duke-energy.com',
            'SO': 'southerncompany.com',
            'D': 'dominionenergy.com',
            'EXC': 'exeloncorp.com',
            'AEP': 'aep.com',
            'SRE': 'sempra.com',
            'XEL': 'xcelenergy.com',
            'WEC': 'wecenergygroup.com',
            'ES': 'eversource.com',
            'PEG': 'pseg.com',
            
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
            'LHX': 'l3harris.com',
            'DE': 'deere.com',
            'UTX': 'utc.com',
            'CARR': 'carrier.com',
            'OTIS': 'otis.com',
            'PH': 'parker.com',
            'ETN': 'eaton.com',
            'EMR': 'emerson.com',
            'ITW': 'itw.com',
            'ROK': 'rockwellautomation.com',
            'JCI': 'johnsoncontrols.com',
            'CMI': 'cummins.com',
            'PCAR': 'paccar.com',
            'WAB': 'wabtec.com',
            'NSC': 'nscorp.com',
            'UNP': 'up.com',
            'CSX': 'csx.com',
            'KSU': 'kcsouthern.com',
            'FDX': 'fedex.com',
            'UPS': 'ups.com',
            'XPO': 'xpo.com',
            'JBHT': 'jbhunt.com',
            'ODFL': 'odfl.com'
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
    
    init() {
        console.log('🏢 Initializing Companies Directory...');
        this.loadCompanies();
        this.setupEventListeners();
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
        // Détection par extension de ticker
        const europeanSuffixes = ['.PA', '.DE', '.L', '.AS', '.MC', '.MI', '.SW', '.CO', '.HE', '.VI', '.PL', '.PR', '.ST', '.OL', '.AT'];
        const asianSuffixes = ['.HK', '.T', '.SS', '.SZ', '.KS', '.NS', '.TW', '.SR', '.SI', '.BK'];
        
        if (europeanSuffixes.some(suffix => ticker.includes(suffix))) {
            return 'Europe';
        }
        
        if (asianSuffixes.some(suffix => ticker.includes(suffix))) {
            return 'Asia';
        }
        
        // Détection par nom de société (mots-clés européens)
        const europeanKeywords = ['HSBC', 'Barclays', 'Vodafone', 'Shell', 'BP', 'SAP', 'ASML', 'LVMH', 'Hermès', 'Kering', 'Danone', 'Nestlé', 'Nestle', 'Unilever', 'Diageo', 'Heineken', 'Siemens', 'ABB', 'Airbus', 'Volkswagen', 'BMW', 'Mercedes', 'Ferrari', 'Renault', 'Stellantis', 'Orange', 'Deutsche', 'BNP', 'UBS', 'Credit Suisse', 'Allianz', 'AXA', 'Zurich', 'Novartis', 'Roche', 'Novo Nordisk', 'AstraZeneca', 'GSK', 'Sanofi', 'Bayer'];
        
        const asianKeywords = ['Alibaba', 'Tencent', 'Samsung', 'TSMC', 'Taiwan', 'Sony', 'Baidu', 'Toyota', 'Honda', 'Nissan', 'Hyundai', 'Mitsubishi', 'Toshiba', 'Panasonic', 'Hitachi', 'SoftBank', 'Nintendo', 'Infosys', 'Wipro', 'TCS', 'HDFC', 'ICICI', 'Reliance', 'Petro', 'Sinopec', 'CNOOC', 'PetroChina'];
        
        if (europeanKeywords.some(keyword => name.includes(keyword))) {
            return 'Europe';
        }
        
        if (asianKeywords.some(keyword => name.includes(keyword))) {
            return 'Asia';
        }
        
        return 'USA';
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
            
            return `
                <div class='company-card' onclick='CompaniesDirectory.openCompanyModal("${company.ticker}")'>
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
        
        const sectorFilter = document.getElementById('sectorFilter');
        if (sectorFilter && sectorFilter.options.length === 1) {
            // Utiliser les 15 secteurs principaux
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
    
    static openCompanyModal(ticker) {
        const instance = window.companiesDirectoryInstance;
        const company = instance.allCompanies.find(c => c.ticker === ticker);
        
        if (!company) return;
        
        const modal = document.getElementById('companyModal');
        const modalContent = document.getElementById('companyModalContent');
        
        const initials = company.name.substring(0, 2).toUpperCase();
        
        modalContent.innerHTML = `
            <div class='company-modal-header'>
                <div class='company-modal-logo'>
                    ${company.logoUrl 
                        ? `<img src='${company.logoUrl}' alt='${company.name}' onerror='this.parentElement.classList.add("text-fallback"); this.parentElement.innerHTML="${initials}";'>` 
                        : `<div class='text-fallback'>${initials}</div>`
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

// ✅ CONTINUATION DU MAPPING DOMAINES (Europe + Asie)
// Ajoutez ces lignes dans buildCompleteDomainMapping() après les domaines USA

// Dans la fonction buildCompleteDomainMapping(), continuez avec :
/*
            // EUROPE - Tech
            'SAP': 'sap.com',
            'ASML': 'asml.com',
            'ERIC': 'ericsson.com',
            'NOK': 'nokia.com',
            'STM': 'st.com',
            
            // Europe - Luxury
            'LVMUY': 'lvmh.com',
            'RMS.PA': 'hermes.com',
            'KER.PA': 'kering.com',
            'OR.PA': 'loreal.com',
            'ADDYY': 'adidas.com',
            'PMMAF': 'puma.com',
            'ITX.MC': 'inditex.com',
            'HNNMY': 'hm.com',
            'BURBY': 'burberryplc.com',
            'MONC.MI': 'moncler.com',
            'CFRHF': 'richemont.com',
            'SWGAY': 'swatchgroup.com',
            'PANDY': 'pandoragroup.com',
            
            // Europe - Pharma
            'NVO': 'novonordisk.com',
            'RHHBY': 'roche.com',
            'NVS': 'novartis.com',
            'SNY': 'sanofi.com',
            'AZN': 'astrazeneca.com',
            'GSK': 'gsk.com',
            'BAYRY': 'bayer.com',
            'SMMNY': 'siemens-healthineers.com',
            'FSNUY': 'fresenius.com',
            'PHG': 'philips.com',
            'LZAGY': 'lonza.com',
            'GRFS': 'grifols.com',
            
            // Europe - Consumer
            'CA.PA': 'carrefour.com',
            'TSCDY': 'tesco.com',
            'SBRY.L': 'sainsburys.co.uk',
            'AD.AS': 'aholddelhaize.com',
            'MKS.L': 'marksandspencer.com',
            
            // Europe - Food & Beverage
            'NSRGY': 'nestle.com',
            'DANOY': 'danone.com',
            'UL': 'unilever.com',
            'DEO': 'diageo.com',
            'HEINY': 'heineken.com',
            'CABGY': 'carlsberg.com',
            'BUD': 'ab-inbev.com',
            'PDRDY': 'pernod-ricard.com',
            
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
            'VWAGY': 'volkswagenag.com',
            'BMWYY': 'bmwgroup.com',
            'MBGAF': 'mercedes-benz.com',
            'RACE': 'ferrari.com',
            'STLA': 'stellantis.com',
            
            // Europe - Telecom
            'VOD': 'vodafone.com',
            'ORAN': 'orange.com',
            'DTEGY': 'telekom.com',
            
            // Europe - Banking
            'HSBC': 'hsbc.com',
            'BCS': 'barclays.com',
            'DB': 'db.com',
            'UBS': 'ubs.com',
            'ING': 'ing.com',
            'SAN': 'santander.com',
            'BBVA': 'bbva.com',
            
            // ASIE - Tech
            'BABA': 'alibaba.com',
            'TCEHY': 'tencent.com',
            'SSNLF': 'samsung.com',
            'TSM': 'tsmc.com',
            'SONY': 'sony.com',
            'BIDU': 'baidu.com',
            'JD': 'jd.com',
            'NIO': 'nio.com',
            'SFTBY': 'softbank.jp',
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
            'NSANY': 'nissan-global.com',
            'HYMTF': 'hyundai.com',
            
            // Crypto
            'BTC-USD': 'bitcoin.org',
            'ETH-USD': 'ethereum.org',
            'MARA': 'marathondh.com',
            'RIOT': 'riotplatforms.com',
            'MSTR': 'microstrategy.com'
*/

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.companiesDirectoryInstance = new CompaniesDirectory();
});

document.addEventListener('click', (e) => {
    const modal = document.getElementById('companyModal');
    if (e.target === modal) {
        CompaniesDirectory.closeModal();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        CompaniesDirectory.closeModal();
    }
});