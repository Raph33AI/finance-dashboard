// // ============================================
// // IPO ANALYZER - ADVANCED SCORING ENGINE
// // High-Potential IPO Detection & Analysis
// // ============================================

// class IPOAnalyzer {
//     constructor(config) {
//         this.config = config;
//         this.weights = config.ipo.weights;
//         this.cache = new Map();
//         this.cacheTimeout = config.ipo.cacheTimeout || 3600000; // 1 hour
        
//         // Finnhub API access
//         this.apiKey = config.api.finnhub.apiKey;
//         this.endpoint = config.api.finnhub.endpoint;
//     }

//     // ============================================
//     // ANALYZE IPO
//     // ============================================
//     async analyzeIPO(symbol) {
//         try {
//             // Check cache
//             const cached = this.getFromCache(symbol);
//             if (cached) return cached;

//             // Fetch IPO data
//             const [profile, financials, quote, news] = await Promise.all([
//                 this.fetchCompanyProfile(symbol),
//                 this.fetchFinancials(symbol),
//                 this.fetchQuote(symbol),
//                 this.fetchNews(symbol)
//             ]);

//             // Calculate scores
//             const scores = {
//                 financial: this.calculateFinancialScore(financials),
//                 market: this.calculateMarketScore(quote, profile),
//                 valuation: this.calculateValuationScore(financials, quote),
//                 growth: this.calculateGrowthScore(financials),
//                 momentum: this.calculateMomentumScore(quote, news)
//             };

//             // Calculate weighted total score
//             const totalScore = this.calculateTotalScore(scores);

//             // Generate analysis
//             const analysis = {
//                 symbol: symbol,
//                 name: profile?.name || symbol,
//                 score: Math.round(totalScore),
//                 breakdown: {
//                     financial: Math.round(scores.financial),
//                     market: Math.round(scores.market),
//                     valuation: Math.round(scores.valuation),
//                     growth: Math.round(scores.growth),
//                     momentum: Math.round(scores.momentum)
//                 },
//                 metrics: this.extractKeyMetrics(profile, financials, quote),
//                 strengths: this.identifyStrengths(scores, profile, financials),
//                 risks: this.identifyRisks(scores, profile, financials),
//                 recommendation: this.generateRecommendation(totalScore),
//                 timestamp: Date.now()
//             };

//             // Cache result
//             this.saveToCache(symbol, analysis);

//             return analysis;

//         } catch (error) {
//             console.error(`IPO Analysis error for ${symbol}:`, error);
//             return this.getMockAnalysis(symbol);
//         }
//     }

//     // ============================================
//     // GET TOP IPOs
//     // ============================================
//     async getTopIPOs(limit = 10) {
//         try {
//             // Fetch recent IPOs
//             const today = new Date();
//             const threeMonthsAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
            
//             const from = this.formatDate(threeMonthsAgo);
//             const to = this.formatDate(today);

//             const ipoCalendar = await this.fetchIPOCalendar(from, to);

//             // Analyze each IPO
//             const analyses = [];
//             for (const ipo of ipoCalendar.slice(0, limit * 2)) {
//                 try {
//                     const analysis = await this.analyzeIPO(ipo.symbol);
//                     if (analysis && analysis.score >= 50) {
//                         analyses.push(analysis);
//                     }
//                 } catch (error) {
//                     console.warn(`Failed to analyze ${ipo.symbol}`);
//                 }
//             }

//             // Sort by score and return top N
//             return analyses
//                 .sort((a, b) => b.score - a.score)
//                 .slice(0, limit);

//         } catch (error) {
//             console.error('Get top IPOs error:', error);
//             return this.getMockTopIPOs(limit);
//         }
//     }

//     // ============================================
//     // CALCULATE FINANCIAL SCORE
//     // ============================================
//     calculateFinancialScore(financials) {
//         if (!financials) return 50;

//         let score = 0;
//         const metrics = financials.metric || {};

//         // Revenue (25 points)
//         if (metrics.revenuePerShareTTM > 0) {
//             score += 25;
//         } else if (metrics.revenuePerShareTTM > -5) {
//             score += 15;
//         }

//         // Profitability (25 points)
//         if (metrics.netProfitMarginTTM > 15) {
//             score += 25;
//         } else if (metrics.netProfitMarginTTM > 5) {
//             score += 15;
//         } else if (metrics.netProfitMarginTTM > 0) {
//             score += 10;
//         }

//         // Cash Flow (25 points)
//         if (metrics.freeCashFlowPerShareTTM > 0) {
//             score += 25;
//         } else if (metrics.freeCashFlowPerShareTTM > -2) {
//             score += 10;
//         }

//         // Financial Health (25 points)
//         if (metrics.currentRatioAnnual > 2) {
//             score += 25;
//         } else if (metrics.currentRatioAnnual > 1.5) {
//             score += 20;
//         } else if (metrics.currentRatioAnnual > 1) {
//             score += 15;
//         }

//         return Math.min(100, score);
//     }

//     // ============================================
//     // CALCULATE MARKET SCORE
//     // ============================================
//     calculateMarketScore(quote, profile) {
//         if (!quote || !profile) return 50;

//         let score = 0;

//         // Market Cap (30 points)
//         const marketCap = profile.marketCapitalization || 0;
//         if (marketCap > 50000) { // > $50B
//             score += 30;
//         } else if (marketCap > 10000) { // > $10B
//             score += 25;
//         } else if (marketCap > 1000) { // > $1B
//             score += 20;
//         } else {
//             score += 10;
//         }

//         // Volume/Liquidity (35 points)
//         const avgVolume = quote.v || 0;
//         if (avgVolume > 10000000) {
//             score += 35;
//         } else if (avgVolume > 5000000) {
//             score += 25;
//         } else if (avgVolume > 1000000) {
//             score += 15;
//         }

//         // Industry Position (35 points)
//         const industry = profile.finnhubIndustry || '';
//         const hotSectors = ['Technology', 'Healthcare', 'Software', 'AI', 'Cloud', 'Fintech'];
//         if (hotSectors.some(sector => industry.includes(sector))) {
//             score += 35;
//         } else {
//             score += 20;
//         }

//         return Math.min(100, score);
//     }

//     // ============================================
//     // CALCULATE VALUATION SCORE
//     // ============================================
//     calculateValuationScore(financials, quote) {
//         if (!financials || !quote) return 50;

//         let score = 0;
//         const metrics = financials.metric || {};

//         // P/E Ratio (40 points)
//         const pe = metrics.peNormalizedAnnual;
//         if (pe > 0 && pe < 20) {
//             score += 40;
//         } else if (pe >= 20 && pe < 30) {
//             score += 30;
//         } else if (pe >= 30 && pe < 50) {
//             score += 20;
//         } else {
//             score += 10;
//         }

//         // Price to Sales (30 points)
//         const ps = metrics.psTTM;
//         if (ps > 0 && ps < 5) {
//             score += 30;
//         } else if (ps >= 5 && ps < 10) {
//             score += 20;
//         } else {
//             score += 10;
//         }

//         // Price to Book (30 points)
//         const pb = metrics.pbAnnual;
//         if (pb > 0 && pb < 3) {
//             score += 30;
//         } else if (pb >= 3 && pb < 5) {
//             score += 20;
//         } else {
//             score += 10;
//         }

//         return Math.min(100, score);
//     }

//     // ============================================
//     // CALCULATE GROWTH SCORE
//     // ============================================
//     calculateGrowthScore(financials) {
//         if (!financials) return 50;

//         let score = 0;
//         const metrics = financials.metric || {};

//         // Revenue Growth (50 points)
//         const revenueGrowth = metrics.revenueGrowthTTMYoy || 0;
//         if (revenueGrowth > 50) {
//             score += 50;
//         } else if (revenueGrowth > 30) {
//             score += 40;
//         } else if (revenueGrowth > 20) {
//             score += 30;
//         } else if (revenueGrowth > 10) {
//             score += 20;
//         } else if (revenueGrowth > 0) {
//             score += 10;
//         }

//         // EPS Growth (50 points)
//         const epsGrowth = metrics.epsGrowthTTMYoy || 0;
//         if (epsGrowth > 50) {
//             score += 50;
//         } else if (epsGrowth > 30) {
//             score += 40;
//         } else if (epsGrowth > 20) {
//             score += 30;
//         } else if (epsGrowth > 10) {
//             score += 20;
//         } else if (epsGrowth > 0) {
//             score += 10;
//         }

//         return Math.min(100, score);
//     }

//     // ============================================
//     // CALCULATE MOMENTUM SCORE
//     // ============================================
//     calculateMomentumScore(quote, news) {
//         if (!quote) return 50;

//         let score = 0;

//         // Price Performance (60 points)
//         const change = quote.c - quote.pc;
//         const changePercent = (change / quote.pc) * 100;

//         if (changePercent > 10) {
//             score += 60;
//         } else if (changePercent > 5) {
//             score += 50;
//         } else if (changePercent > 2) {
//             score += 40;
//         } else if (changePercent > 0) {
//             score += 30;
//         } else if (changePercent > -2) {
//             score += 20;
//         } else {
//             score += 10;
//         }

//         // News Sentiment (40 points)
//         if (news && news.length > 0) {
//             const recentPositiveNews = news.filter(n => 
//                 n.sentiment && n.sentiment > 0.3
//             ).length;
            
//             if (recentPositiveNews > 5) {
//                 score += 40;
//             } else if (recentPositiveNews > 3) {
//                 score += 30;
//             } else if (recentPositiveNews > 0) {
//                 score += 20;
//             } else {
//                 score += 10;
//             }
//         } else {
//             score += 20;
//         }

//         return Math.min(100, score);
//     }

//     // ============================================
//     // CALCULATE TOTAL SCORE
//     // ============================================
//     calculateTotalScore(scores) {
//         return (
//             scores.financial * this.weights.financial +
//             scores.market * this.weights.market +
//             scores.valuation * this.weights.valuation +
//             scores.growth * this.weights.growth +
//             scores.momentum * this.weights.momentum
//         );
//     }

//     // ============================================
//     // EXTRACT KEY METRICS
//     // ============================================
//     extractKeyMetrics(profile, financials, quote) {
//         const metrics = financials?.metric || {};
        
//         return {
//             marketCap: profile?.marketCapitalization || 0,
//             price: quote?.c || 0,
//             change: quote ? ((quote.c - quote.pc) / quote.pc * 100) : 0,
//             volume: quote?.v || 0,
//             peRatio: metrics.peNormalizedAnnual || 'N/A',
//             revenueGrowth: metrics.revenueGrowthTTMYoy || 0,
//             profitMargin: metrics.netProfitMarginTTM || 0,
//             roe: metrics.roeTTM || 'N/A',
//             debtToEquity: metrics.totalDebt2EquityAnnual || 'N/A'
//         };
//     }

//     // ============================================
//     // IDENTIFY STRENGTHS
//     // ============================================
//     identifyStrengths(scores, profile, financials) {
//         const strengths = [];
//         const metrics = financials?.metric || {};

//         if (scores.financial > 75) {
//             strengths.push('Strong financial foundation');
//         }
//         if (scores.growth > 75) {
//             strengths.push('Exceptional growth trajectory');
//         }
//         if (scores.market > 75) {
//             strengths.push('Dominant market position');
//         }
//         if (metrics.netProfitMarginTTM > 20) {
//             strengths.push('Industry-leading profit margins');
//         }
//         if (metrics.revenueGrowthTTMYoy > 30) {
//             strengths.push('Rapid revenue expansion');
//         }
//         if (profile?.marketCapitalization > 10000) {
//             strengths.push('Large market capitalization');
//         }

//         return strengths.length > 0 ? strengths : ['Solid fundamentals'];
//     }

//     // ============================================
//     // IDENTIFY RISKS
//     // ============================================
//     identifyRisks(scores, profile, financials) {
//         const risks = [];
//         const metrics = financials?.metric || {};

//         if (scores.financial < 50) {
//             risks.push('Weak financial performance');
//         }
//         if (scores.valuation < 40) {
//             risks.push('High valuation concerns');
//         }
//         if (metrics.netProfitMarginTTM < 0) {
//             risks.push('Currently unprofitable');
//         }
//         if (metrics.currentRatioAnnual < 1) {
//             risks.push('Liquidity concerns');
//         }
//         if (metrics.totalDebt2EquityAnnual > 2) {
//             risks.push('High debt levels');
//         }
//         if (profile?.marketCapitalization < 1000) {
//             risks.push('Small market cap volatility');
//         }

//         return risks.length > 0 ? risks : ['Normal market risks apply'];
//     }

//     // ============================================
//     // GENERATE RECOMMENDATION
//     // ============================================
//     generateRecommendation(score) {
//         if (score >= 80) {
//             return {
//                 rating: 'STRONG BUY',
//                 confidence: 'High',
//                 summary: 'Exceptional IPO with strong fundamentals and growth potential'
//             };
//         } else if (score >= 70) {
//             return {
//                 rating: 'BUY',
//                 confidence: 'Medium-High',
//                 summary: 'Solid IPO opportunity with good fundamentals'
//             };
//         } else if (score >= 60) {
//             return {
//                 rating: 'HOLD',
//                 confidence: 'Medium',
//                 summary: 'Decent IPO but consider waiting for better entry point'
//             };
//         } else if (score >= 50) {
//             return {
//                 rating: 'CAUTIOUS',
//                 confidence: 'Low-Medium',
//                 summary: 'Proceed with caution, conduct thorough due diligence'
//             };
//         } else {
//             return {
//                 rating: 'AVOID',
//                 confidence: 'Low',
//                 summary: 'Significant concerns, better opportunities available'
//             };
//         }
//     }

//     // ============================================
//     // API METHODS
//     // ============================================
//     async fetchCompanyProfile(symbol) {
//         try {
//             const response = await fetch(
//                 `${this.endpoint}/stock/profile2?symbol=${symbol}&token=${this.apiKey}`
//             );
//             return await response.json();
//         } catch (error) {
//             console.error('Profile fetch error:', error);
//             return null;
//         }
//     }

//     async fetchFinancials(symbol) {
//         try {
//             const response = await fetch(
//                 `${this.endpoint}/stock/metric?symbol=${symbol}&metric=all&token=${this.apiKey}`
//             );
//             return await response.json();
//         } catch (error) {
//             console.error('Financials fetch error:', error);
//             return null;
//         }
//     }

//     async fetchQuote(symbol) {
//         try {
//             const response = await fetch(
//                 `${this.endpoint}/quote?symbol=${symbol}&token=${this.apiKey}`
//             );
//             return await response.json();
//         } catch (error) {
//             console.error('Quote fetch error:', error);
//             return null;
//         }
//     }

//     async fetchNews(symbol) {
//         try {
//             const today = new Date();
//             const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            
//             const response = await fetch(
//                 `${this.endpoint}/company-news?symbol=${symbol}&from=${this.formatDate(weekAgo)}&to=${this.formatDate(today)}&token=${this.apiKey}`
//             );
//             return await response.json();
//         } catch (error) {
//             console.error('News fetch error:', error);
//             return [];
//         }
//     }

//     async fetchIPOCalendar(from, to) {
//         try {
//             const response = await fetch(
//                 `${this.endpoint}/calendar/ipo?from=${from}&to=${to}&token=${this.apiKey}`
//             );
//             const data = await response.json();
//             return data.ipoCalendar || [];
//         } catch (error) {
//             console.error('IPO calendar fetch error:', error);
//             return [];
//         }
//     }

//     // ============================================
//     // UTILITIES
//     // ============================================
//     formatDate(date) {
//         return date.toISOString().split('T')[0];
//     }

//     getFromCache(symbol) {
//         const cached = this.cache.get(symbol);
//         if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
//             return cached.data;
//         }
//         return null;
//     }

//     saveToCache(symbol, data) {
//         this.cache.set(symbol, {
//             data: data,
//             timestamp: Date.now()
//         });
//     }

//     clearCache() {
//         this.cache.clear();
//     }

//     // ============================================
//     // MOCK DATA (Fallback)
//     // ============================================
//     getMockAnalysis(symbol) {
//         return {
//             symbol: symbol,
//             name: `${symbol} Inc.`,
//             score: 75,
//             breakdown: {
//                 financial: 72,
//                 market: 78,
//                 valuation: 70,
//                 growth: 80,
//                 momentum: 75
//             },
//             metrics: {
//                 marketCap: 5000,
//                 price: 45.50,
//                 change: 2.5,
//                 volume: 2500000,
//                 peRatio: 25.5,
//                 revenueGrowth: 35,
//                 profitMargin: 15,
//                 roe: 18,
//                 debtToEquity: 1.2
//             },
//             strengths: [
//                 'Strong revenue growth',
//                 'Solid market position',
//                 'Experienced management team'
//             ],
//             risks: [
//                 'Market volatility',
//                 'Competitive landscape',
//                 'Regulatory uncertainties'
//             ],
//             recommendation: {
//                 rating: 'BUY',
//                 confidence: 'Medium-High',
//                 summary: 'Solid IPO opportunity with good fundamentals'
//             },
//             timestamp: Date.now()
//         };
//     }

//     getMockTopIPOs(limit) {
//         const mockIPOs = [
//             { symbol: 'ARM', name: 'ARM Holdings', score: 87 },
//             { symbol: 'KVYO', name: 'Klaviyo', score: 82 },
//             { symbol: 'CART', name: 'Instacart', score: 76 },
//             { symbol: 'BIRK', name: 'Birkenstock', score: 71 },
//             { symbol: 'RXRX', name: 'Recursion Pharma', score: 68 }
//         ];

//         return mockIPOs.slice(0, limit).map(ipo => 
//             this.getMockAnalysis(ipo.symbol)
//         );
//     }
// }

// // ============================================
// // EXPORT
// // ============================================
// if (typeof module !== 'undefined' && module.exports) {
//     module.exports = IPOAnalyzer;
// }

/**
 * ═══════════════════════════════════════════════════════════════
 * CHATBOT IPO ANALYZER - IPO Intelligence Integration
 * ═══════════════════════════════════════════════════════════════
 * Version: 3.0.0
 * Description: Réutilisation de la logique IPO Intelligence
 * Features:
 *   - Scoring automatique multi-critères
 *   - Génération de visual cards
 *   - Analyse des IPOs récentes
 */

class ChatbotIPOAnalyzer {
    constructor(config) {
        this.config = config;
        this.apiClient = null;
        
        // IPO Scoring Criteria (from IPO Intelligence)
        this.scoringCriteria = {
            underwriters: {
                tier1: ['Goldman Sachs', 'Morgan Stanley', 'JP Morgan', 'Bank of America', 'Citigroup'],
                tier2: ['Credit Suisse', 'Deutsche Bank', 'Barclays', 'UBS', 'Wells Fargo']
            },
            sectorMultipliers: {
                'Technology': 1.2,
                'Healthcare': 1.15,
                'Financial Services': 1.0,
                'Consumer': 1.05,
                'Industrial': 0.95,
                'Energy': 0.9
            }
        };
        
        console.log('📊 ChatbotIPOAnalyzer initialized');
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * ANALYZE IPOs (Main Method)
     * ═══════════════════════════════════════════════════════════
     */
    async analyzeIPOs(entities = {}) {
        try {
            console.log('📊 Fetching recent IPOs...');

            // Get recent IPOs (last 30 days)
            const ipos = await this.getRecentIPOs();

            if (!ipos || ipos.length === 0) {
                return {
                    text: "📊 **Recent IPOs**\n\nNo recent IPOs found in the last 30 days. The IPO market may be experiencing a quiet period.\n\nWould you like to:\n• Check historical IPO data\n• Set up IPO alerts\n• Analyze a specific company",
                    charts: [],
                    data: null
                };
            }

            // Score all IPOs
            const scoredIPOs = ipos.map(ipo => this.scoreIPO(ipo));

            // Sort by score
            scoredIPOs.sort((a, b) => b.totalScore - a.totalScore);

            // Get top 5
            const topIPOs = scoredIPOs.slice(0, 5);

            // Build response
            const responseText = this.buildIPOResponse(topIPOs);

            return {
                text: responseText,
                charts: [],
                data: {
                    totalIPOs: ipos.length,
                    topIPOs: topIPOs,
                    allIPOs: scoredIPOs
                }
            };

        } catch (error) {
            console.error('❌ IPO analysis error:', error);
            return {
                text: "❌ Unable to fetch IPO data at the moment. Please try again later.",
                charts: [],
                data: null
            };
        }
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * GET RECENT IPOs
     * ═══════════════════════════════════════════════════════════
     */
    async getRecentIPOs() {
        // This would connect to your IPO data source
        // For now, returning simulated data structure
        
        // If API client is available, use it
        if (this.apiClient && typeof this.apiClient.getRecentIPOs === 'function') {
            return await this.apiClient.getRecentIPOs();
        }

        // Otherwise, return demo data
        return this.getDemoIPOData();
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * GET DEMO IPO DATA
     * ═══════════════════════════════════════════════════════════
     */
    getDemoIPOData() {
        return [
            {
                symbol: 'DEMO1',
                name: 'TechCorp Inc.',
                sector: 'Technology',
                priceRange: '$18-$20',
                sharesOffered: 10000000,
                expectedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                underwriters: ['Goldman Sachs', 'Morgan Stanley'],
                revenue: 500000000,
                netIncome: -50000000,
                foundedYear: 2018
            },
            {
                symbol: 'DEMO2',
                name: 'BioHealth Solutions',
                sector: 'Healthcare',
                priceRange: '$22-$25',
                sharesOffered: 8000000,
                expectedDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                underwriters: ['JP Morgan', 'Citigroup'],
                revenue: 200000000,
                netIncome: 15000000,
                foundedYear: 2015
            },
            {
                symbol: 'DEMO3',
                name: 'FinTech Innovations',
                sector: 'Financial Services',
                priceRange: '$15-$17',
                sharesOffered: 12000000,
                expectedDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
                underwriters: ['Bank of America', 'Credit Suisse'],
                revenue: 350000000,
                netIncome: -20000000,
                foundedYear: 2019
            }
        ];
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * SCORE IPO (6-Factor Scoring System)
     * ═══════════════════════════════════════════════════════════
     */
    scoreIPO(ipo) {
        let scores = {
            underwriter: 0,
            financials: 0,
            sector: 0,
            valuation: 0,
            momentum: 0,
            institutional: 0
        };

        // 1. Underwriter Quality (20 points)
        scores.underwriter = this.scoreUnderwriters(ipo.underwriters);

        // 2. Financial Health (25 points)
        scores.financials = this.scoreFinancials(ipo);

        // 3. Sector Attractiveness (15 points)
        scores.sector = this.scoreSector(ipo.sector);

        // 4. Valuation (20 points)
        scores.valuation = this.scoreValuation(ipo);

        // 5. Market Momentum (10 points)
        scores.momentum = this.scoreMarketMomentum(ipo);

        // 6. Institutional Interest (10 points)
        scores.institutional = this.scoreInstitutionalInterest(ipo);

        const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

        return {
            ...ipo,
            scores,
            totalScore: Math.round(totalScore),
            rating: this.getRating(totalScore)
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * SCORE UNDERWRITERS
     * ═══════════════════════════════════════════════════════════
     */
    scoreUnderwriters(underwriters) {
        if (!underwriters || underwriters.length === 0) return 5;

        let score = 0;
        underwriters.forEach(underwriter => {
            if (this.scoringCriteria.underwriters.tier1.includes(underwriter)) {
                score += 10;
            } else if (this.scoringCriteria.underwriters.tier2.includes(underwriter)) {
                score += 6;
            } else {
                score += 3;
            }
        });

        return Math.min(score, 20);
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * SCORE FINANCIALS
     * ═══════════════════════════════════════════════════════════
     */
    scoreFinancials(ipo) {
        let score = 0;

        // Revenue growth (10 points)
        if (ipo.revenue > 1000000000) score += 10;
        else if (ipo.revenue > 500000000) score += 8;
        else if (ipo.revenue > 100000000) score += 6;
        else if (ipo.revenue > 50000000) score += 4;
        else score += 2;

        // Profitability (15 points)
        if (ipo.netIncome > 0) {
            const margin = (ipo.netIncome / ipo.revenue) * 100;
            if (margin > 20) score += 15;
            else if (margin > 10) score += 12;
            else if (margin > 5) score += 9;
            else score += 6;
        } else {
            // Loss tolerance for growth companies
            const lossRatio = Math.abs(ipo.netIncome / ipo.revenue);
            if (lossRatio < 0.1) score += 8;
            else if (lossRatio < 0.2) score += 5;
            else if (lossRatio < 0.5) score += 3;
            else score += 1;
        }

        return Math.min(score, 25);
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * SCORE SECTOR
     * ═══════════════════════════════════════════════════════════
     */
    scoreSector(sector) {
        const baseScore = 10;
        const multiplier = this.scoringCriteria.sectorMultipliers[sector] || 1.0;
        return Math.round(baseScore * multiplier);
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * SCORE VALUATION
     * ═══════════════════════════════════════════════════════════
     */
    scoreValuation(ipo) {
        // Parse price range
        const priceMatch = ipo.priceRange.match(/\$(\d+)-\$(\d+)/);
        if (!priceMatch) return 10;

        const midPrice = (parseInt(priceMatch[1]) + parseInt(priceMatch[2])) / 2;
        const marketCap = midPrice * ipo.sharesOffered;

        // P/S Ratio
        const psRatio = marketCap / ipo.revenue;

        let score = 0;
        if (psRatio < 5) score = 20;
        else if (psRatio < 10) score = 15;
        else if (psRatio < 15) score = 10;
        else if (psRatio < 20) score = 6;
        else score = 3;

        return score;
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * SCORE MARKET MOMENTUM
     * ═══════════════════════════════════════════════════════════
     */
    scoreMarketMomentum(ipo) {
        // This would analyze current market conditions
        // For now, returning a baseline score
        return 7;
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * SCORE INSTITUTIONAL INTEREST
     * ═══════════════════════════════════════════════════════════
     */
    scoreInstitutionalInterest(ipo) {
        // This would check institutional demand
        // For now, returning a baseline score
        return 6;
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * GET RATING
     * ═══════════════════════════════════════════════════════════
     */
    getRating(score) {
        if (score >= 85) return '⭐⭐⭐⭐⭐ EXCEPTIONAL';
        if (score >= 75) return '⭐⭐⭐⭐ STRONG BUY';
        if (score >= 65) return '⭐⭐⭐ BUY';
        if (score >= 50) return '⭐⭐ HOLD';
        return '⭐ AVOID';
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * BUILD IPO RESPONSE
     * ═══════════════════════════════════════════════════════════
     */
    buildIPOResponse(topIPOs) {
        let response = `📊 **Top Rated IPOs - AlphaVault Intelligence**\n\n`;

        topIPOs.forEach((ipo, index) => {
            const dateStr = ipo.expectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            
            response += `**${index + 1}. ${ipo.name} (${ipo.symbol})**\n`;
            response += `${ipo.rating} - Score: ${ipo.totalScore}/100\n`;
            response += `📅 Expected: ${dateStr} | 💼 ${ipo.sector}\n`;
            response += `💰 Price Range: ${ipo.priceRange}\n`;
            response += `🏦 Lead Underwriters: ${ipo.underwriters.slice(0, 2).join(', ')}\n`;
            response += `\n`;
        });

        response += `\n💡 **Key Insights:**\n`;
        response += `• ${topIPOs[0].name} leads with ${topIPOs[0].totalScore}/100 score\n`;
        response += `• ${topIPOs.filter(ipo => ipo.sector === 'Technology').length} tech IPOs in top 5\n`;
        response += `• Average score: ${Math.round(topIPOs.reduce((sum, ipo) => sum + ipo.totalScore, 0) / topIPOs.length)}/100\n`;

        return response;
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * ANALYZE SPECIFIC IPO
     * ═══════════════════════════════════════════════════════════
     */
    async analyzeSpecificIPO(symbol) {
        const ipos = await this.getRecentIPOs();
        const ipo = ipos.find(i => i.symbol === symbol);

        if (!ipo) {
            return {
                text: `❌ IPO ${symbol} not found in recent listings.`,
                charts: [],
                data: null
            };
        }

        const scoredIPO = this.scoreIPO(ipo);

        const response = `📊 **${scoredIPO.name} (${scoredIPO.symbol}) - IPO Analysis**

**Overall Rating:** ${scoredIPO.rating}
**Total Score:** ${scoredIPO.totalScore}/100

**Score Breakdown:**
• Underwriter Quality: ${scoredIPO.scores.underwriter}/20
• Financial Health: ${scoredIPO.scores.financials}/25
• Sector Attractiveness: ${scoredIPO.scores.sector}/15
• Valuation: ${scoredIPO.scores.valuation}/20
• Market Momentum: ${scoredIPO.scores.momentum}/10
• Institutional Interest: ${scoredIPO.scores.institutional}/10

**Key Details:**
• Expected Date: ${scoredIPO.expectedDate.toLocaleDateString()}
• Price Range: ${scoredIPO.priceRange}
• Shares Offered: ${(scoredIPO.sharesOffered / 1000000).toFixed(1)}M
• Sector: ${scoredIPO.sector}
• Lead Underwriters: ${scoredIPO.underwriters.join(', ')}

**Financial Snapshot:**
• Revenue: $${(scoredIPO.revenue / 1000000).toFixed(0)}M
• Net Income: $${(scoredIPO.netIncome / 1000000).toFixed(0)}M
• Founded: ${scoredIPO.foundedYear}`;

        return {
            text: response,
            charts: [],
            data: scoredIPO
        };
    }
}

// ═══════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChatbotIPOAnalyzer;
}

if (typeof window !== 'undefined') {
    window.ChatbotIPOAnalyzer = ChatbotIPOAnalyzer;
}

console.log('✅ ChatbotIPOAnalyzer loaded');