/**
 * ════════════════════════════════════════════════════════════════
 * ENTITY DATABASE - Entreprises US + Tous les Pays
 * Base de données centralisée pour tracking
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
            // TECH GIANTS & SOFTWARE
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
            // FINANCE & BANKING
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
            'PayPal': 'PYPL',
            'Block': 'SQ',
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
            // HEALTHCARE & PHARMACEUTICALS
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
            // CONSUMER & RETAIL
            // ═══════════════════════════════════════════════════════
            'Walmart': 'WMT',
            'Amazon': 'AMZN',
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
            'Adidas': 'ADDYY',
            'Lululemon': 'LULU',
            'Under Armour': 'UAA',
            'VF Corp': 'VFC',
            'Ralph Lauren': 'RL',
            'Tapestry': 'TPR',
            'Capri': 'CPRI',

            // ═══════════════════════════════════════════════════════
            // FOOD & BEVERAGE
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

            // ═══════════════════════════════════════════════════════
            // ENERGY & UTILITIES
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
            // INDUSTRIALS & MANUFACTURING
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
            // AUTOMOTIVE
            // ═══════════════════════════════════════════════════════
            'Tesla': 'TSLA',
            'Ford': 'F',
            'General Motors': 'GM',
            'Rivian': 'RIVN',
            'Lucid': 'LCID',
            'Nikola': 'NKLA',
            'Fisker': 'FSR',

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
            'Netflix': 'NFLX',
            'Spotify': 'SPOT',
            'SiriusXM': 'SIRI',
            'Fox': 'FOX',
            'News Corp': 'NWSA',
            'ViacomCBS': 'VIAC',
            'Discovery': 'DISCA',
            'Live Nation': 'LYV',
            'Madison Square Garden': 'MSG',

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

            // ═══════════════════════════════════════════════════════
            // CRYPTO & FINTECH
            // ═══════════════════════════════════════════════════════
            'Bitcoin': 'BTC-USD',
            'Ethereum': 'ETH-USD',
            'Coinbase': 'COIN',
            'Marathon Digital': 'MARA',
            'Riot Platforms': 'RIOT',
            'MicroStrategy': 'MSTR',
            'Robinhood': 'HOOD',
            'SoFi': 'SOFI',
            'Affirm': 'AFRM',
            'Upstart': 'UPST',
            'LendingClub': 'LC',
            'LendingTree': 'TREE'
        };
    }

    buildCountriesDatabase() {
        return [
            // Amérique du Nord
            'United States', 'USA', 'U.S.', 'America',
            'Canada', 'Mexico',
            
            // Amérique Centrale & Caraïbes
            'Guatemala', 'Belize', 'Honduras', 'El Salvador', 'Nicaragua',
            'Costa Rica', 'Panama', 'Cuba', 'Jamaica', 'Haiti',
            'Dominican Republic', 'Bahamas', 'Trinidad and Tobago',
            'Barbados', 'Saint Lucia', 'Grenada', 'Saint Vincent',
            'Antigua and Barbuda', 'Dominica', 'Saint Kitts and Nevis',
            
            // Amérique du Sud
            'Brazil', 'Argentina', 'Colombia', 'Chile', 'Peru',
            'Venezuela', 'Ecuador', 'Bolivia', 'Paraguay', 'Uruguay',
            'Guyana', 'Suriname', 'French Guiana',
            
            // Europe Occidentale
            'United Kingdom', 'UK', 'Britain', 'England', 'Scotland', 'Wales',
            'France', 'Germany', 'Italy', 'Spain', 'Portugal',
            'Netherlands', 'Belgium', 'Switzerland', 'Austria',
            'Ireland', 'Luxembourg', 'Monaco', 'Liechtenstein',
            'Andorra', 'San Marino', 'Vatican', 'Malta',
            
            // Europe du Nord
            'Norway', 'Sweden', 'Denmark', 'Finland', 'Iceland',
            
            // Europe de l'Est
            'Poland', 'Czech Republic', 'Hungary', 'Romania', 'Bulgaria',
            'Slovakia', 'Croatia', 'Slovenia', 'Serbia', 'Bosnia',
            'Montenegro', 'North Macedonia', 'Albania', 'Kosovo',
            
            // Europe Baltes
            'Estonia', 'Latvia', 'Lithuania',
            
            // Ex-URSS
            'Russia', 'Ukraine', 'Belarus', 'Moldova',
            'Georgia', 'Armenia', 'Azerbaijan',
            'Kazakhstan', 'Uzbekistan', 'Turkmenistan',
            'Kyrgyzstan', 'Tajikistan',
            
            // Moyen-Orient
            'Turkey', 'Israel', 'Saudi Arabia', 'UAE', 'United Arab Emirates',
            'Qatar', 'Kuwait', 'Bahrain', 'Oman', 'Jordan',
            'Lebanon', 'Iraq', 'Iran', 'Syria', 'Yemen',
            
            // Asie de l'Est
            'China', 'Japan', 'South Korea', 'North Korea',
            'Taiwan', 'Hong Kong', 'Macau', 'Mongolia',
            
            // Asie du Sud-Est
            'Singapore', 'Malaysia', 'Indonesia', 'Thailand',
            'Philippines', 'Vietnam', 'Myanmar', 'Cambodia',
            'Laos', 'Brunei', 'East Timor',
            
            // Asie du Sud
            'India', 'Pakistan', 'Bangladesh', 'Sri Lanka',
            'Nepal', 'Bhutan', 'Maldives', 'Afghanistan',
            
            // Océanie
            'Australia', 'New Zealand', 'Papua New Guinea',
            'Fiji', 'Solomon Islands', 'Vanuatu', 'Samoa',
            'Kiribati', 'Tonga', 'Micronesia', 'Palau',
            'Marshall Islands', 'Nauru', 'Tuvalu',
            
            // Afrique du Nord
            'Egypt', 'Libya', 'Tunisia', 'Algeria', 'Morocco',
            'Sudan', 'South Sudan',
            
            // Afrique de l'Ouest
            'Nigeria', 'Ghana', 'Senegal', 'Ivory Coast', 'Côte d\'Ivoire',
            'Mali', 'Burkina Faso', 'Niger', 'Benin', 'Togo',
            'Guinea', 'Sierra Leone', 'Liberia', 'Mauritania',
            'Gambia', 'Guinea-Bissau', 'Cape Verde',
            
            // Afrique Centrale
            'Democratic Republic of Congo', 'DRC', 'Congo',
            'Cameroon', 'Chad', 'Central African Republic',
            'Gabon', 'Equatorial Guinea', 'São Tomé and Príncipe',
            
            // Afrique de l'Est
            'Ethiopia', 'Kenya', 'Tanzania', 'Uganda',
            'Somalia', 'Rwanda', 'Burundi', 'Eritrea',
            'Djibouti', 'Seychelles', 'Comoros', 'Mauritius',
            
            // Afrique Australe
            'South Africa', 'Zimbabwe', 'Zambia', 'Mozambique',
            'Angola', 'Namibia', 'Botswana', 'Malawi',
            'Lesotho', 'Eswatini', 'Swaziland', 'Madagascar',
            
            // Régions géopolitiques
            'Europe', 'Asia', 'Africa', 'Middle East',
            'Latin America', 'Caribbean', 'Pacific', 'Oceania'
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
            const regex = new RegExp(`\\b${companyName.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
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
            const regex = new RegExp(`\\b${country.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
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
        const invalidEntities = ['CDATA', 'XML', 'RSS', 'HTML', 'HTTP', 'HTTPS', 'WWW', 'API', 'JSON'];
        entities.companies = entities.companies.filter(c => !invalidEntities.includes(c.name.toUpperCase()));
        entities.countries = entities.countries.filter(c => !invalidEntities.includes(c.toUpperCase()));
        entities.tickers = entities.tickers.filter(t => !invalidEntities.includes(t.toUpperCase()));

        return entities;
    }
}

// Instance globale
window.entityDB = new EntityDatabase();
console.log(`📚 Entity Database loaded: ${Object.keys(window.entityDB.companies).length} companies, ${window.entityDB.countries.length} countries`);