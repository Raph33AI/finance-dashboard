// ============================================
// IPO ANALYZER - ADVANCED SCORING ENGINE
// High-Potential IPO Detection & Analysis
// ============================================

class IPOAnalyzer {
    constructor(config) {
        this.config = config;
        this.weights = config.ipo.weights;
        this.cache = new Map();
        this.cacheTimeout = config.ipo.cacheTimeout || 3600000; // 1 hour
        
        // Finnhub API access
        this.apiKey = config.api.finnhub.apiKey;
        this.endpoint = config.api.finnhub.endpoint;
    }

    // ============================================
    // ANALYZE IPO
    // ============================================
    async analyzeIPO(symbol) {
        try {
            // Check cache
            const cached = this.getFromCache(symbol);
            if (cached) return cached;

            // Fetch IPO data
            const [profile, financials, quote, news] = await Promise.all([
                this.fetchCompanyProfile(symbol),
                this.fetchFinancials(symbol),
                this.fetchQuote(symbol),
                this.fetchNews(symbol)
            ]);

            // Calculate scores
            const scores = {
                financial: this.calculateFinancialScore(financials),
                market: this.calculateMarketScore(quote, profile),
                valuation: this.calculateValuationScore(financials, quote),
                growth: this.calculateGrowthScore(financials),
                momentum: this.calculateMomentumScore(quote, news)
            };

            // Calculate weighted total score
            const totalScore = this.calculateTotalScore(scores);

            // Generate analysis
            const analysis = {
                symbol: symbol,
                name: profile?.name || symbol,
                score: Math.round(totalScore),
                breakdown: {
                    financial: Math.round(scores.financial),
                    market: Math.round(scores.market),
                    valuation: Math.round(scores.valuation),
                    growth: Math.round(scores.growth),
                    momentum: Math.round(scores.momentum)
                },
                metrics: this.extractKeyMetrics(profile, financials, quote),
                strengths: this.identifyStrengths(scores, profile, financials),
                risks: this.identifyRisks(scores, profile, financials),
                recommendation: this.generateRecommendation(totalScore),
                timestamp: Date.now()
            };

            // Cache result
            this.saveToCache(symbol, analysis);

            return analysis;

        } catch (error) {
            console.error(`IPO Analysis error for ${symbol}:`, error);
            return this.getMockAnalysis(symbol);
        }
    }

    // ============================================
    // GET TOP IPOs
    // ============================================
    async getTopIPOs(limit = 10) {
        try {
            // Fetch recent IPOs
            const today = new Date();
            const threeMonthsAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
            
            const from = this.formatDate(threeMonthsAgo);
            const to = this.formatDate(today);

            const ipoCalendar = await this.fetchIPOCalendar(from, to);

            // Analyze each IPO
            const analyses = [];
            for (const ipo of ipoCalendar.slice(0, limit * 2)) {
                try {
                    const analysis = await this.analyzeIPO(ipo.symbol);
                    if (analysis && analysis.score >= 50) {
                        analyses.push(analysis);
                    }
                } catch (error) {
                    console.warn(`Failed to analyze ${ipo.symbol}`);
                }
            }

            // Sort by score and return top N
            return analyses
                .sort((a, b) => b.score - a.score)
                .slice(0, limit);

        } catch (error) {
            console.error('Get top IPOs error:', error);
            return this.getMockTopIPOs(limit);
        }
    }

    // ============================================
    // CALCULATE FINANCIAL SCORE
    // ============================================
    calculateFinancialScore(financials) {
        if (!financials) return 50;

        let score = 0;
        const metrics = financials.metric || {};

        // Revenue (25 points)
        if (metrics.revenuePerShareTTM > 0) {
            score += 25;
        } else if (metrics.revenuePerShareTTM > -5) {
            score += 15;
        }

        // Profitability (25 points)
        if (metrics.netProfitMarginTTM > 15) {
            score += 25;
        } else if (metrics.netProfitMarginTTM > 5) {
            score += 15;
        } else if (metrics.netProfitMarginTTM > 0) {
            score += 10;
        }

        // Cash Flow (25 points)
        if (metrics.freeCashFlowPerShareTTM > 0) {
            score += 25;
        } else if (metrics.freeCashFlowPerShareTTM > -2) {
            score += 10;
        }

        // Financial Health (25 points)
        if (metrics.currentRatioAnnual > 2) {
            score += 25;
        } else if (metrics.currentRatioAnnual > 1.5) {
            score += 20;
        } else if (metrics.currentRatioAnnual > 1) {
            score += 15;
        }

        return Math.min(100, score);
    }

    // ============================================
    // CALCULATE MARKET SCORE
    // ============================================
    calculateMarketScore(quote, profile) {
        if (!quote || !profile) return 50;

        let score = 0;

        // Market Cap (30 points)
        const marketCap = profile.marketCapitalization || 0;
        if (marketCap > 50000) { // > $50B
            score += 30;
        } else if (marketCap > 10000) { // > $10B
            score += 25;
        } else if (marketCap > 1000) { // > $1B
            score += 20;
        } else {
            score += 10;
        }

        // Volume/Liquidity (35 points)
        const avgVolume = quote.v || 0;
        if (avgVolume > 10000000) {
            score += 35;
        } else if (avgVolume > 5000000) {
            score += 25;
        } else if (avgVolume > 1000000) {
            score += 15;
        }

        // Industry Position (35 points)
        const industry = profile.finnhubIndustry || '';
        const hotSectors = ['Technology', 'Healthcare', 'Software', 'AI', 'Cloud', 'Fintech'];
        if (hotSectors.some(sector => industry.includes(sector))) {
            score += 35;
        } else {
            score += 20;
        }

        return Math.min(100, score);
    }

    // ============================================
    // CALCULATE VALUATION SCORE
    // ============================================
    calculateValuationScore(financials, quote) {
        if (!financials || !quote) return 50;

        let score = 0;
        const metrics = financials.metric || {};

        // P/E Ratio (40 points)
        const pe = metrics.peNormalizedAnnual;
        if (pe > 0 && pe < 20) {
            score += 40;
        } else if (pe >= 20 && pe < 30) {
            score += 30;
        } else if (pe >= 30 && pe < 50) {
            score += 20;
        } else {
            score += 10;
        }

        // Price to Sales (30 points)
        const ps = metrics.psTTM;
        if (ps > 0 && ps < 5) {
            score += 30;
        } else if (ps >= 5 && ps < 10) {
            score += 20;
        } else {
            score += 10;
        }

        // Price to Book (30 points)
        const pb = metrics.pbAnnual;
        if (pb > 0 && pb < 3) {
            score += 30;
        } else if (pb >= 3 && pb < 5) {
            score += 20;
        } else {
            score += 10;
        }

        return Math.min(100, score);
    }

    // ============================================
    // CALCULATE GROWTH SCORE
    // ============================================
    calculateGrowthScore(financials) {
        if (!financials) return 50;

        let score = 0;
        const metrics = financials.metric || {};

        // Revenue Growth (50 points)
        const revenueGrowth = metrics.revenueGrowthTTMYoy || 0;
        if (revenueGrowth > 50) {
            score += 50;
        } else if (revenueGrowth > 30) {
            score += 40;
        } else if (revenueGrowth > 20) {
            score += 30;
        } else if (revenueGrowth > 10) {
            score += 20;
        } else if (revenueGrowth > 0) {
            score += 10;
        }

        // EPS Growth (50 points)
        const epsGrowth = metrics.epsGrowthTTMYoy || 0;
        if (epsGrowth > 50) {
            score += 50;
        } else if (epsGrowth > 30) {
            score += 40;
        } else if (epsGrowth > 20) {
            score += 30;
        } else if (epsGrowth > 10) {
            score += 20;
        } else if (epsGrowth > 0) {
            score += 10;
        }

        return Math.min(100, score);
    }

    // ============================================
    // CALCULATE MOMENTUM SCORE
    // ============================================
    calculateMomentumScore(quote, news) {
        if (!quote) return 50;

        let score = 0;

        // Price Performance (60 points)
        const change = quote.c - quote.pc;
        const changePercent = (change / quote.pc) * 100;

        if (changePercent > 10) {
            score += 60;
        } else if (changePercent > 5) {
            score += 50;
        } else if (changePercent > 2) {
            score += 40;
        } else if (changePercent > 0) {
            score += 30;
        } else if (changePercent > -2) {
            score += 20;
        } else {
            score += 10;
        }

        // News Sentiment (40 points)
        if (news && news.length > 0) {
            const recentPositiveNews = news.filter(n => 
                n.sentiment && n.sentiment > 0.3
            ).length;
            
            if (recentPositiveNews > 5) {
                score += 40;
            } else if (recentPositiveNews > 3) {
                score += 30;
            } else if (recentPositiveNews > 0) {
                score += 20;
            } else {
                score += 10;
            }
        } else {
            score += 20;
        }

        return Math.min(100, score);
    }

    // ============================================
    // CALCULATE TOTAL SCORE
    // ============================================
    calculateTotalScore(scores) {
        return (
            scores.financial * this.weights.financial +
            scores.market * this.weights.market +
            scores.valuation * this.weights.valuation +
            scores.growth * this.weights.growth +
            scores.momentum * this.weights.momentum
        );
    }

    // ============================================
    // EXTRACT KEY METRICS
    // ============================================
    extractKeyMetrics(profile, financials, quote) {
        const metrics = financials?.metric || {};
        
        return {
            marketCap: profile?.marketCapitalization || 0,
            price: quote?.c || 0,
            change: quote ? ((quote.c - quote.pc) / quote.pc * 100) : 0,
            volume: quote?.v || 0,
            peRatio: metrics.peNormalizedAnnual || 'N/A',
            revenueGrowth: metrics.revenueGrowthTTMYoy || 0,
            profitMargin: metrics.netProfitMarginTTM || 0,
            roe: metrics.roeTTM || 'N/A',
            debtToEquity: metrics.totalDebt2EquityAnnual || 'N/A'
        };
    }

    // ============================================
    // IDENTIFY STRENGTHS
    // ============================================
    identifyStrengths(scores, profile, financials) {
        const strengths = [];
        const metrics = financials?.metric || {};

        if (scores.financial > 75) {
            strengths.push('Strong financial foundation');
        }
        if (scores.growth > 75) {
            strengths.push('Exceptional growth trajectory');
        }
        if (scores.market > 75) {
            strengths.push('Dominant market position');
        }
        if (metrics.netProfitMarginTTM > 20) {
            strengths.push('Industry-leading profit margins');
        }
        if (metrics.revenueGrowthTTMYoy > 30) {
            strengths.push('Rapid revenue expansion');
        }
        if (profile?.marketCapitalization > 10000) {
            strengths.push('Large market capitalization');
        }

        return strengths.length > 0 ? strengths : ['Solid fundamentals'];
    }

    // ============================================
    // IDENTIFY RISKS
    // ============================================
    identifyRisks(scores, profile, financials) {
        const risks = [];
        const metrics = financials?.metric || {};

        if (scores.financial < 50) {
            risks.push('Weak financial performance');
        }
        if (scores.valuation < 40) {
            risks.push('High valuation concerns');
        }
        if (metrics.netProfitMarginTTM < 0) {
            risks.push('Currently unprofitable');
        }
        if (metrics.currentRatioAnnual < 1) {
            risks.push('Liquidity concerns');
        }
        if (metrics.totalDebt2EquityAnnual > 2) {
            risks.push('High debt levels');
        }
        if (profile?.marketCapitalization < 1000) {
            risks.push('Small market cap volatility');
        }

        return risks.length > 0 ? risks : ['Normal market risks apply'];
    }

    // ============================================
    // GENERATE RECOMMENDATION
    // ============================================
    generateRecommendation(score) {
        if (score >= 80) {
            return {
                rating: 'STRONG BUY',
                confidence: 'High',
                summary: 'Exceptional IPO with strong fundamentals and growth potential'
            };
        } else if (score >= 70) {
            return {
                rating: 'BUY',
                confidence: 'Medium-High',
                summary: 'Solid IPO opportunity with good fundamentals'
            };
        } else if (score >= 60) {
            return {
                rating: 'HOLD',
                confidence: 'Medium',
                summary: 'Decent IPO but consider waiting for better entry point'
            };
        } else if (score >= 50) {
            return {
                rating: 'CAUTIOUS',
                confidence: 'Low-Medium',
                summary: 'Proceed with caution, conduct thorough due diligence'
            };
        } else {
            return {
                rating: 'AVOID',
                confidence: 'Low',
                summary: 'Significant concerns, better opportunities available'
            };
        }
    }

    // ============================================
    // API METHODS
    // ============================================
    async fetchCompanyProfile(symbol) {
        try {
            const response = await fetch(
                `${this.endpoint}/stock/profile2?symbol=${symbol}&token=${this.apiKey}`
            );
            return await response.json();
        } catch (error) {
            console.error('Profile fetch error:', error);
            return null;
        }
    }

    async fetchFinancials(symbol) {
        try {
            const response = await fetch(
                `${this.endpoint}/stock/metric?symbol=${symbol}&metric=all&token=${this.apiKey}`
            );
            return await response.json();
        } catch (error) {
            console.error('Financials fetch error:', error);
            return null;
        }
    }

    async fetchQuote(symbol) {
        try {
            const response = await fetch(
                `${this.endpoint}/quote?symbol=${symbol}&token=${this.apiKey}`
            );
            return await response.json();
        } catch (error) {
            console.error('Quote fetch error:', error);
            return null;
        }
    }

    async fetchNews(symbol) {
        try {
            const today = new Date();
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            
            const response = await fetch(
                `${this.endpoint}/company-news?symbol=${symbol}&from=${this.formatDate(weekAgo)}&to=${this.formatDate(today)}&token=${this.apiKey}`
            );
            return await response.json();
        } catch (error) {
            console.error('News fetch error:', error);
            return [];
        }
    }

    async fetchIPOCalendar(from, to) {
        try {
            const response = await fetch(
                `${this.endpoint}/calendar/ipo?from=${from}&to=${to}&token=${this.apiKey}`
            );
            const data = await response.json();
            return data.ipoCalendar || [];
        } catch (error) {
            console.error('IPO calendar fetch error:', error);
            return [];
        }
    }

    // ============================================
    // UTILITIES
    // ============================================
    formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    getFromCache(symbol) {
        const cached = this.cache.get(symbol);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }
        return null;
    }

    saveToCache(symbol, data) {
        this.cache.set(symbol, {
            data: data,
            timestamp: Date.now()
        });
    }

    clearCache() {
        this.cache.clear();
    }

    // ============================================
    // MOCK DATA (Fallback)
    // ============================================
    getMockAnalysis(symbol) {
        return {
            symbol: symbol,
            name: `${symbol} Inc.`,
            score: 75,
            breakdown: {
                financial: 72,
                market: 78,
                valuation: 70,
                growth: 80,
                momentum: 75
            },
            metrics: {
                marketCap: 5000,
                price: 45.50,
                change: 2.5,
                volume: 2500000,
                peRatio: 25.5,
                revenueGrowth: 35,
                profitMargin: 15,
                roe: 18,
                debtToEquity: 1.2
            },
            strengths: [
                'Strong revenue growth',
                'Solid market position',
                'Experienced management team'
            ],
            risks: [
                'Market volatility',
                'Competitive landscape',
                'Regulatory uncertainties'
            ],
            recommendation: {
                rating: 'BUY',
                confidence: 'Medium-High',
                summary: 'Solid IPO opportunity with good fundamentals'
            },
            timestamp: Date.now()
        };
    }

    getMockTopIPOs(limit) {
        const mockIPOs = [
            { symbol: 'ARM', name: 'ARM Holdings', score: 87 },
            { symbol: 'KVYO', name: 'Klaviyo', score: 82 },
            { symbol: 'CART', name: 'Instacart', score: 76 },
            { symbol: 'BIRK', name: 'Birkenstock', score: 71 },
            { symbol: 'RXRX', name: 'Recursion Pharma', score: 68 }
        ];

        return mockIPOs.slice(0, limit).map(ipo => 
            this.getMockAnalysis(ipo.symbol)
        );
    }
}

// ============================================
// EXPORT
// ============================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IPOAnalyzer;
}