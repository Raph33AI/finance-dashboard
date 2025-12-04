// ============================================
// FINANCIAL CHATBOT - AI ENGINE v6.0 WALL STREET PRO
// Advanced Analytics: Sharpe, Sortino, Greeks, Correlations, Fair Value
// ============================================

class FinancialChatbotEngine {
    constructor(config) {
        this.config = config;
        this.geminiAI = null;
        this.ipoAnalyzer = null;
        this.analytics = null;
        this.charts = null;
        
        this.isProcessing = false;
        
        this.conversationContext = {
            lastSymbol: null,
            lastTimeframe: '1y',
            lastTopic: null,
            userPreferences: {}
        };
        
        this.metrics = {
            totalMessages: 0,
            successfulResponses: 0,
            errors: 0,
            averageResponseTime: 0,
            totalResponseTime: 0
        };
        
        this.responseCache = new Map();
        this.cacheExpiration = 300000; // 5 minutes
        
        this.initialize();
    }

    async initialize() {
        try {
            if (typeof GeminiAI !== 'undefined') {
                this.geminiAI = new GeminiAI(this.config);
                console.log('Gemini AI initialized');
            }

            if (typeof IPOAnalyzer !== 'undefined') {
                this.ipoAnalyzer = new IPOAnalyzer(this.config);
                console.log('IPO Analyzer initialized');
            }

            if (typeof FinancialAnalytics !== 'undefined') {
                this.analytics = new FinancialAnalytics(this.config);
                console.log('Analytics initialized');
            }

            if (typeof ChatbotCharts !== 'undefined') {
                this.charts = new ChatbotCharts(this.config);
                console.log('Charts initialized');
            }

            console.log('Conversational Financial AI v6.0 WALL STREET PRO ready!');
            console.log('Advanced Analytics: Sharpe, Sortino, Correlations, Greeks, Fair Value, Insider Trading');
            
        } catch (error) {
            console.error('Engine initialization error:', error);
        }
    }

    // ============================================
    // PROCESSUS PRINCIPAL (CORRIGÉ)
    // ============================================
    async processMessage(userMessage) {
        const startTime = performance.now();
        
        try {
            this.metrics.totalMessages++;

            const cachedResponse = this.checkCache(userMessage);
            if (cachedResponse) {
                console.log('✅ Returning cached response');
                return cachedResponse;
            }

            // ✅ CORRECTION: Meilleure analyse du message
            const analysis = this.analyzeMessage(userMessage);
            
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('📝 Processing:', userMessage.substring(0, 80) + '...');
            console.log('🎯 Type:', analysis.type);
            console.log('🏷 Intents:', analysis.intents.join(', '));
            console.log('📊 Symbols:', analysis.symbols.join(', ') || 'None');
            if (analysis.isComparison) {
                console.log('⚖ COMPARISON MODE:', analysis.comparisonSymbols.join(' vs '));
            }
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            // ✅ CORRECTION: Construction de contexte intelligente
            const context = await this.buildSmartContext(userMessage, analysis);
            
            // ✅ AJOUT: Passer analysis.type dans context.intent
            context.intent = {
                type: analysis.type,
                intents: analysis.intents,
                isComparison: analysis.isComparison
            };
            
            // ✅ CORRECTION: Ne plus construire de prompt ici, laisser Gemini le faire
            const response = await this.geminiAI.generateResponse(userMessage, context);
            
            // Ajouter les visuels et graphiques
            response.visualCards = await this.generateVisualCards(context, analysis);
            response.chartRequests = await this.generateChartRequests(context, analysis);
            response.suggestions = this.generateAdvancedSuggestions(analysis, context);
            response.processingTime = performance.now() - startTime;

            this.cacheResponse(userMessage, response);
            this.updateMetrics(true, response.processingTime);
            this.updateConversationContext(analysis);

            console.log(`✅ Response generated in ${response.processingTime.toFixed(0)}ms`);

            return response;

        } catch (error) {
            console.error('❌ Message processing error:', error);
            this.updateMetrics(false, performance.now() - startTime);
            
            return {
                text: `⚠ **An error occurred:** ${error.message}\n\nPlease try again or rephrase your question.`,
                error: true,
                visualCards: [],
                chartRequests: [],
                suggestions: this.config.suggestions.initial
            };
        }
    }

    // ============================================
    // ANALYSE COMPLÈTE DU MESSAGE (CORRIGÉE)
    // ============================================
    analyzeMessage(message) {
        const lowerMessage = message.toLowerCase();
        
        const symbols = this.extractSymbols(message);
        const isComparison = this.detectComparisonIntent(message);
        const comparisonSymbols = isComparison ? this.extractComparisonSymbols(message) : [];
        const timeframes = this.extractTimeframes(message);
        
        let type = 'CONVERSATIONAL';
        const intents = [];
        
        // ✅ PRIORITÉ 1: Market News (AVANT tout le reste)
        if (this.detectMarketNewsIntent(message)) {
            type = 'MARKET_NEWS_QUERY';
            intents.push('MARKET_NEWS');
            console.log('🎯 Detected: MARKET NEWS question');
        }
        
        // ✅ PRIORITÉ 2: Comparison
        else if (isComparison && comparisonSymbols.length >= 2) {
            type = 'STOCK_COMPARISON';
            intents.push('COMPARISON');
            console.log('🎯 Detected: STOCK COMPARISON');
        }
        
        // ✅ PRIORITÉ 3: Historical Analysis
        else if (this.detectHistoricalIntent(message) && symbols.length > 0) {
            type = 'HISTORICAL_ANALYSIS';
            intents.push('HISTORICAL');
            console.log('🎯 Detected: HISTORICAL ANALYSIS');
        }
        
        // ✅ PRIORITÉ 4: IPO
        else if (this.detectIPOIntent(message)) {
            type = 'IPO_QUERY';
            intents.push('IPO');
            console.log('🎯 Detected: IPO question');
        }
        
        // ✅ PRIORITÉ 5: Educational
        else if (this.detectEducationalIntent(message)) {
            type = 'EDUCATIONAL_QUERY';
            intents.push('EDUCATIONAL');
            console.log('🎯 Detected: EDUCATIONAL question');
        }
        
        // ✅ PRIORITÉ 6: Stock Analysis (avec symbole)
        else if (symbols.length > 0) {
            type = 'STOCK_QUERY';
            intents.push('STOCK');
            
            // Sous-intents avancés
            if (this.detectAdvancedAnalysisIntent(message)) {
                intents.push('ADVANCED_ANALYSIS');
            }
            if (this.detectAnalystIntent(message)) {
                intents.push('ANALYST');
            }
            if (this.detectEarningsIntent(message)) {
                intents.push('EARNINGS');
            }
            
            console.log('🎯 Detected: STOCK ANALYSIS');
        }
        
        // ✅ PRIORITÉ 7: Market General
        else if (/\b(market|indices|dow|nasdaq|s&p|sp500)\b/i.test(message)) {
            type = 'MARKET_QUERY';
            intents.push('MARKET');
            console.log('🎯 Detected: MARKET GENERAL question');
        }
        
        // Ajouter les sous-intents supplémentaires
        if (this.detectCorrelationIntent(message)) intents.push('CORRELATION');
        if (this.detectFairValueIntent(message)) intents.push('FAIR_VALUE');
        if (this.detectOptionsIntent(message)) intents.push('OPTIONS');
        if (this.detectInsiderIntent(message)) intents.push('INSIDER');
        if (this.detectSentimentIntent(message)) intents.push('SENTIMENT');
        if (this.detectPeersIntent(message)) intents.push('PEERS');
        
        return {
            type,
            intents,
            symbols: isComparison ? comparisonSymbols : symbols,
            timeframes,
            isComparison,
            comparisonSymbols,
            needsData: symbols.length > 0 || intents.length > 0 || isComparison || type === 'MARKET_NEWS_QUERY'
        };
    }

    // ============================================
    // NOUVEAUX DÉTECTEURS D'INTENT WALL STREET
    // ============================================
    
    detectAdvancedAnalysisIntent(message) {
        const keywords = [
            'sharpe', 'sortino', 'risk-adjusted', 'alpha', 'beta',
            'volatility analysis', 'drawdown', 'var', 'value at risk',
            'correlation', 'covariance', 'diversification'
        ];
        return keywords.some(keyword => message.toLowerCase().includes(keyword));
    }
    
    detectCorrelationIntent(message) {
        const keywords = ['correlation', 'correlate', 'relationship between', 'how related'];
        return keywords.some(keyword => message.toLowerCase().includes(keyword));
    }
    
    detectFairValueIntent(message) {
        const keywords = [
            'fair value', 'dcf', 'discounted cash flow', 'intrinsic value',
            'valuation', 'worth', 'overvalued', 'undervalued'
        ];
        return keywords.some(keyword => message.toLowerCase().includes(keyword));
    }
    
    detectOptionsIntent(message) {
        const keywords = ['option', 'call', 'put', 'strike', 'greeks', 'delta', 'gamma', 'theta', 'vega'];
        return keywords.some(keyword => message.toLowerCase().includes(keyword));
    }
    
    detectInsiderIntent(message) {
        const keywords = ['insider', 'insider trading', 'insider buy', 'insider sell', 'institutional'];
        return keywords.some(keyword => message.toLowerCase().includes(keyword));
    }
    
    detectComparisonIntent(message) {
        const keywords = [
            'compare', 'vs', 'versus', 'against', 'comparison', 
            'difference between', 'better than', 'which is better',
            'compare with', 'compare to'
        ];
        const messageLower = message.toLowerCase();
        return keywords.some(keyword => messageLower.includes(keyword));
    }
    
    detectHistoricalIntent(message) {
        const keywords = [
            'history', 'historical', 'evolution', 'performance over',
            'last 5 years', 'past years', 'over the years', 'trend',
            'since', 'how has', 'performed in'
        ];
        const messageLower = message.toLowerCase();
        return keywords.some(keyword => messageLower.includes(keyword));
    }

    // ✅ NOUVELLE MÉTHODE: Détection de questions éducatives
    detectEducationalIntent(message) {
        const keywords = [
            'what is', 'explain', 'define', 'tell me about',
            'how does', 'what does', 'meaning of', 'help me understand'
        ];
        const messageLower = message.toLowerCase();
        return keywords.some(keyword => messageLower.includes(keyword));
    }
    
    // ✅ CORRECTION: Détection Market News (plus stricte)
    detectMarketNewsIntent(message) {
        const strictKeywords = [
            'what\'s happening in the market',
            'market today',
            'what\'s happening today',
            'market news today',
            'today\'s market',
            'market update',
            'how is the market'
        ];
        
        const messageLower = message.toLowerCase();
        
        // Check strict matches first
        if (strictKeywords.some(keyword => messageLower.includes(keyword))) {
            return true;
        }
        
        // Check if it's a general "what's happening" without a specific stock
        if (/what'?s happening/i.test(message) && !/\b[A-Z]{1,5}\b/.test(message)) {
            return true;
        }
        
        return false;
    }

    // ✅ CORRECTION: Détection Historical plus stricte
    detectHistoricalIntent(message) {
        const keywords = [
            'evolution', 'historical', 'history', 'performance over',
            'last 5 years', 'past years', 'over the years', 'trend over',
            'since', 'how has', 'performed in', 'over time'
        ];
        
        const messageLower = message.toLowerCase();
        
        // Must contain a historical keyword + a timeframe indicator
        const hasHistoricalKeyword = keywords.some(keyword => messageLower.includes(keyword));
        const hasTimeframe = /\d+\s*(year|month|day|week)|ytd|max/i.test(messageLower);
        
        return hasHistoricalKeyword || hasTimeframe;
    }

    detectIPOIntent(message) {
        const keywords = ['ipo', 'initial public offering', 'upcoming ipo', 'new listing', 'ipo calendar', 'recent ipo', 'ipo performance'];
        const messageLower = message.toLowerCase();
        return keywords.some(keyword => messageLower.includes(keyword));
    }

    detectEarningsCalendarIntent(message) {
        const keywords = ['earnings calendar', 'upcoming earnings', 'when does', 'report earnings', 'earnings schedule', 'earnings date'];
        const messageLower = message.toLowerCase();
        return keywords.some(keyword => messageLower.includes(keyword));
    }

    detectAnalystIntent(message) {
        const keywords = ['analyst', 'recommendation', 'price target', 'upgrade', 'downgrade', 'what do analysts', 'analyst rating', 'consensus', 'analyst opinion'];
        const messageLower = message.toLowerCase();
        return keywords.some(keyword => messageLower.includes(keyword));
    }

    detectEarningsIntent(message) {
        const keywords = ['earnings', 'eps', 'earnings surprise', 'beat earnings', 'miss earnings', 'earnings history', 'quarterly results', 'earnings report'];
        const messageLower = message.toLowerCase();
        return keywords.some(keyword => messageLower.includes(keyword));
    }

    detectPeersIntent(message) {
        const keywords = ['peers', 'competitors', 'similar companies', 'compare with', 'competition', 'industry peers', 'sector peers'];
        const messageLower = message.toLowerCase();
        return keywords.some(keyword => messageLower.includes(keyword));
    }

    detectSentimentIntent(message) {
        const keywords = ['sentiment', 'news sentiment', 'market sentiment', 'how is the news', 'news analysis', 'public opinion', 'investor sentiment'];
        const messageLower = message.toLowerCase();
        return keywords.some(keyword => messageLower.includes(keyword));
    }

    // ============================================
    // EXTRACTION SYMBOLES
    // ============================================
    
    extractSymbols(message) {
        const symbols = new Set();
        
        const upperRegex = /\b[A-Z]{1,5}\b/g;
        const upperSymbols = message.match(upperRegex) || [];
        const excludeWords = ['IPO', 'USA', 'CEO', 'CFO', 'AI', 'THE', 'AND', 'FOR', 'NOT', 'ETF', 'API', 'FAQ', 'EPS', 'ROE', 'ROA', 'TTM', 'DCF', 'VAR'];
        upperSymbols.filter(s => !excludeWords.includes(s)).forEach(s => symbols.add(s));
        
        const knownStocks = [
            'NVDA', 'AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'TSLA', 'META', 'NFLX',
            'AMD', 'INTC', 'QCOM', 'AVGO', 'TXN', 'MU',
            'SPY', 'QQQ', 'DIA', 'IWM',
            'COIN', 'PYPL', 'V', 'MA', 'JPM', 'BAC', 'GS', 'MS',
            'DIS', 'WMT', 'MCD', 'NKE', 'SBUX', 'TGT', 'HD', 'COST',
            'PFE', 'JNJ', 'UNH', 'ABBV', 'MRK',
            'XOM', 'CVX', 'BA', 'CAT', 'GE', 'T', 'VZ', 'TMUS'
        ];
        
        const lowerMessage = message.toLowerCase();
        knownStocks.forEach(symbol => {
            if (new RegExp(`\\b${symbol.toLowerCase()}\\b`, 'i').test(lowerMessage)) {
                symbols.add(symbol);
            }
        });
        
        const companyMapping = this.getCompanySymbolMapping();
        for (const [companyName, symbol] of Object.entries(companyMapping)) {
            if (new RegExp(`\\b${companyName}\\b`, 'i').test(lowerMessage)) {
                symbols.add(symbol);
            }
        }
        
        if (symbols.size === 0 && this.conversationContext.lastSymbol) {
            symbols.add(this.conversationContext.lastSymbol);
        }
        
        return Array.from(symbols);
    }
    
    extractComparisonSymbols(message) {
        const symbols = this.extractSymbols(message);
        
        if (symbols.length >= 2) {
            return symbols.slice(0, 4);
        }
        
        const patterns = [
            /compare\s+([A-Z]{1,5})\s+(?:with|vs|versus|and|to)\s+([A-Z]{1,5})/i,
            /([A-Z]{1,5})\s+(?:vs|versus)\s+([A-Z]{1,5})/i,
            /([A-Z]{1,5})\s+and\s+([A-Z]{1,5})/i
        ];
        
        for (const pattern of patterns) {
            const match = message.match(pattern);
            if (match) {
                return [match[1], match[2]];
            }
        }
        
        return symbols;
    }

    extractTimeframes(message) {
        const timeframePatterns = {
            '1d': /\b(today|1\s*day)\b/i,
            '1w': /\b(week|1\s*week|7\s*days?)\b/i,
            '1M': /\b(month|1\s*month|30\s*days?)\b/i,
            '3M': /\b(3\s*months?|quarter)\b/i,
            '6M': /\b(6\s*months?)\b/i,
            '1y': /\b(year|1\s*year|12\s*months?)\b/i,
            '2y': /\b(2\s*years?|24\s*months?)\b/i,
            '5y': /\b(5\s*years?|60\s*months?)\b/i,
            '10y': /\b(10\s*years?)\b/i,
            'ytd': /\b(ytd|year\s*to\s*date)\b/i,
            'max': /\b(all\s*time|max|maximum|since\s*inception)\b/i
        };

        const found = [];
        for (const [timeframe, pattern] of Object.entries(timeframePatterns)) {
            if (pattern.test(message)) {
                found.push(timeframe);
            }
        }

        if (found.length === 0 && /\b(evolution|historical|history|performance|trend)\b/i.test(message)) {
            found.push(this.conversationContext.lastTimeframe || '1y');
        }

        return found;
    }

    // ============================================
    // CONSTRUCTION DE CONTEXTE ULTRA-COMPLET (CORRIGÉ)
    // ============================================
    
    async buildSmartContext(message, analysis) {
        const context = {
            timestamp: new Date().toISOString(),
            userMessage: message,
            detectedEntities: {
                symbols: analysis.symbols,
                timeframes: analysis.timeframes
            },
            intent: { 
                type: analysis.type,
                intents: analysis.intents,
                isComparison: analysis.isComparison
            }
        };

        // ✅ CORRECTION 1: Market News en PRIORITÉ (avant needsData check)
        if (analysis.type === 'MARKET_NEWS_QUERY') {
            console.log('📰 Loading MARKET NEWS data...');
            
            try {
                // Charger les news du marché
                const marketNews = await this.analytics.getMarketNews('general').catch(() => []);
                if (marketNews && marketNews.length > 0) {
                    context.marketNews = marketNews.slice(0, 15);
                    console.log(`✅ Loaded ${context.marketNews.length} market news articles`);
                }
                
                // Charger les données des indices majeurs
                const [sp500, nasdaq, dow] = await Promise.all([
                    this.analytics.getStockData('SPY').catch(() => null),
                    this.analytics.getStockData('QQQ').catch(() => null),
                    this.analytics.getStockData('DIA').catch(() => null)
                ]);
                
                context.marketData = {};
                if (sp500) {
                    context.marketData.sp500 = {
                        price: sp500.quote.current,
                        changePercent: sp500.quote.changePercent
                    };
                }
                if (nasdaq) {
                    context.marketData.nasdaq = {
                        price: nasdaq.quote.current,
                        changePercent: nasdaq.quote.changePercent
                    };
                }
                if (dow) {
                    context.marketData.dow = {
                        price: dow.quote.current,
                        changePercent: dow.quote.changePercent
                    };
                }
                
                console.log('✅ Market indices loaded');
                
            } catch (error) {
                console.error('❌ Error loading market news data:', error);
            }
            
            // ✅ IMPORTANT: Return early pour Market News
            return context;
        }

        // ✅ CORRECTION 2: Educational Questions (pas besoin de data)
        if (analysis.type === 'EDUCATIONAL_QUERY') {
            console.log('📚 Educational question detected - no market data needed');
            return context;
        }

        // ✅ CORRECTION 3: IPO Questions
        if (analysis.type === 'IPO_QUERY') {
            console.log('💰 Loading IPO data...');
            
            try {
                const ipos = await this.analytics.getIPOCalendar().catch(() => []);
                if (ipos && ipos.length > 0) {
                    context.upcomingIPOs = ipos.slice(0, 20);
                    console.log(`✅ Loaded ${context.upcomingIPOs.length} upcoming IPOs`);
                }
            } catch (error) {
                console.error('❌ Error fetching IPO calendar:', error);
            }
            
            return context;
        }

        // ✅ Pour les autres types, vérifier si on a besoin de données
        if (!analysis.needsData) {
            console.log('ℹ No market data needed for this query');
            return context;
        }

        // ✅ CORRECTION 4: Comparison Data
        if (analysis.isComparison && analysis.comparisonSymbols.length >= 2) {
            console.log(`⚖ Loading comparison data for: ${analysis.comparisonSymbols.join(' vs ')}`);
            context.comparisonData = await this.loadComparisonData(analysis.comparisonSymbols, analysis.timeframes[0]);
            
            // Calculate correlation
            if (context.comparisonData.timeSeries && context.comparisonData.timeSeries.length >= 2) {
                context.correlationAnalysis = this.calculateCorrelation(context.comparisonData.timeSeries);
                console.log(`✅ Correlation: ${context.correlationAnalysis.correlation}`);
            }
            
            return context;
        }

        // ✅ CORRECTION 5: Single Stock Analysis
        const symbol = analysis.symbols[0];
        
        if (!symbol) {
            console.log('⚠ No symbol detected');
            return context;
        }

        console.log(`📊 Loading comprehensive data for ${symbol}...`);
        
        try {
            // ✅ Charger les données de base (toujours)
            const [
                stockData,
                recommendations,
                priceTarget,
                earnings
            ] = await Promise.all([
                this.analytics.getStockData(symbol).catch(() => null),
                this.analytics.getRecommendationTrends(symbol).catch(() => null),
                this.analytics.getPriceTarget(symbol).catch(() => null),
                this.analytics.getEarnings(symbol).catch(() => null)
            ]);

            if (stockData) {
                context.stockData = stockData;
                console.log(`✅ Stock data loaded: $${stockData.quote.current}`);
            }
            
            // Analyst Recommendations
            if (recommendations && recommendations.length > 0) {
                const latest = recommendations[0];
                const total = latest.strongBuy + latest.buy + latest.hold + latest.sell + latest.strongSell;
                const bullishPercent = total > 0 ? ((latest.strongBuy + latest.buy) / total * 100).toFixed(1) : 0;
                
                context.analystRecommendations = {
                    period: latest.period,
                    strongBuy: latest.strongBuy,
                    buy: latest.buy,
                    hold: latest.hold,
                    sell: latest.sell,
                    strongSell: latest.strongSell,
                    total: total,
                    bullishPercent: bullishPercent,
                    consensus: this.getConsensusRating(latest),
                    history: recommendations.slice(0, 4)
                };
                console.log(`✅ Analyst consensus: ${context.analystRecommendations.consensus}`);
            }
            
            // Price Target
            if (priceTarget && priceTarget.targetMean) {
                const currentPrice = stockData?.quote?.current || 0;
                const upside = currentPrice > 0 ? ((priceTarget.targetMean - currentPrice) / currentPrice * 100).toFixed(1) : 0;
                
                context.priceTarget = {
                    current: currentPrice,
                    targetMean: priceTarget.targetMean,
                    targetHigh: priceTarget.targetHigh,
                    targetLow: priceTarget.targetLow,
                    targetMedian: priceTarget.targetMedian,
                    upside: upside,
                    lastUpdated: priceTarget.lastUpdated
                };
                console.log(`✅ Price target: $${priceTarget.targetMean} (${upside}% upside)`);
            }
            
            // Earnings History
            if (earnings && earnings.length > 0) {
                const recentEarnings = earnings.slice(0, 8);
                let beatCount = 0;
                let missCount = 0;
                
                recentEarnings.forEach(e => {
                    if (e.surprise && e.surprise > 0) beatCount++;
                    if (e.surprise && e.surprise < 0) missCount++;
                });
                
                context.earningsHistory = {
                    recent: recentEarnings,
                    beatCount: beatCount,
                    missCount: missCount,
                    beatRate: recentEarnings.length > 0 ? ((beatCount / recentEarnings.length) * 100).toFixed(1) : 0,
                    totalReports: earnings.length,
                    earningsQuality: this.calculateEarningsQuality(recentEarnings)
                };
                console.log(`✅ Earnings: ${context.earningsHistory.beatRate}% beat rate`);
            }

            // ✅ CORRECTION 6: Historical Data (seulement si nécessaire)
            const needsHistory = analysis.type === 'HISTORICAL_ANALYSIS' || 
                                 analysis.intents.includes('HISTORICAL') || 
                                 analysis.intents.includes('ADVANCED_ANALYSIS') ||
                                 /\b(history|historical|evolution|performance|trend|chart|volatility|return)\b/i.test(message);
            
            if (needsHistory && this.analytics) {
                console.log('📈 Loading historical time series...');
                const timeframe = analysis.timeframes[0] || this.conversationContext.lastTimeframe || '1y';
                const outputsize = this.getOutputSize(timeframe);
                
                const timeSeries = await this.analytics.getTimeSeries(symbol, '1day', outputsize).catch(() => null);
                
                if (timeSeries && timeSeries.data && timeSeries.data.length > 0) {
                    context.timeSeriesData = timeSeries;
                    context.historicalStats = this.calculateHistoricalStats(timeSeries);
                    context.technicalIndicators = this.calculateTechnicalIndicators(timeSeries);
                    
                    // Advanced Wall Street metrics
                    context.advancedMetrics = this.calculateAdvancedMetrics(timeSeries, stockData);
                    context.riskMetrics = this.calculateRiskMetrics(timeSeries);
                    
                    console.log(`✅ Historical data: ${timeSeries.data.length} points, ${context.historicalStats.totalReturn}% return`);
                } else {
                    console.log('⚠ No historical data available');
                }
            }

            // ✅ Charger données supplémentaires en parallèle (optionnel)
            const [
                revenueEstimates,
                epsEstimates,
                peers,
                companyNews,
                sentiment,
                upgradesDowngrades
            ] = await Promise.all([
                this.analytics.getRevenueEstimates(symbol, 'quarterly').catch(() => null),
                this.analytics.getEPSEstimates(symbol, 'quarterly').catch(() => null),
                this.analytics.getPeers(symbol).catch(() => []),
                this.analytics.getCompanyNews(symbol).catch(() => []),
                this.analytics.analyzeNewsImpact(symbol).catch(() => null),
                this.analytics.getUpgradeDowngrade(symbol).catch(() => [])
            ]);
            
            if (revenueEstimates && revenueEstimates.length > 0) {
                context.revenueEstimates = revenueEstimates.slice(0, 4);
            }
            
            if (epsEstimates && epsEstimates.length > 0) {
                context.epsEstimates = epsEstimates.slice(0, 4);
            }
            
            if (peers && peers.length > 0) {
                context.peers = peers.slice(0, 10);
            }
            
            if (companyNews && companyNews.length > 0) {
                context.recentNews = companyNews.slice(0, 10).map(n => ({
                    headline: n.headline,
                    source: n.source,
                    datetime: n.datetime,
                    url: n.url
                }));
            }
            
            if (sentiment) {
                context.sentiment = sentiment;
            }
            
            if (upgradesDowngrades && upgradesDowngrades.length > 0) {
                context.upgradesDowngrades = upgradesDowngrades.slice(0, 10);
            }

        } catch (error) {
            console.error('❌ Error loading stock data:', error);
        }

        console.log('✅ Context built successfully');
        return context;
    }
    
    // ============================================
    // WALL STREET ADVANCED METRICS
    // ============================================
    
    calculateAdvancedMetrics(timeSeriesData, stockData) {
        const prices = timeSeriesData.data.map(d => d.close);
        
        const returns = [];
        for (let i = 1; i < prices.length; i++) {
            returns.push((prices[i] - prices[i-1]) / prices[i-1]);
        }
        
        // Sharpe Ratio
        const riskFreeRate = 0.02;
        const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
        const annualizedReturn = avgReturn * 252;
        const stdDev = this.calculateStdDev(returns);
        const annualizedStdDev = stdDev * Math.sqrt(252);
        const excessReturn = annualizedReturn - riskFreeRate;
        const sharpeRatio = annualizedStdDev !== 0 ? (excessReturn / annualizedStdDev).toFixed(3) : 'N/A';
        
        // Sortino Ratio
        const downsideReturns = returns.filter(r => r < 0);
        const downsideDeviation = downsideReturns.length > 0 ? 
            Math.sqrt(downsideReturns.reduce((sum, r) => sum + r * r, 0) / downsideReturns.length) * Math.sqrt(252) : 0;
        const sortinoRatio = downsideDeviation !== 0 ? (excessReturn / downsideDeviation).toFixed(3) : 'N/A';
        
        // Calmar Ratio
        const maxDrawdown = this.calculateMaxDrawdown(prices);
        const calmarRatio = maxDrawdown !== 0 ? (annualizedReturn / (maxDrawdown / 100)).toFixed(3) : 'N/A';
        
        // Information Ratio
        const informationRatio = sharpeRatio;
        
        // Treynor Ratio
        const beta = stockData?.metrics?.beta || 1;
        const treynorRatio = beta !== 0 ? (excessReturn / beta).toFixed(3) : 'N/A';
        
        return {
            sharpeRatio,
            sortinoRatio,
            calmarRatio,
            informationRatio,
            treynorRatio,
            alpha: this.calculateAlpha(annualizedReturn, beta),
            beta: beta
        };
    }
    
    calculateRiskMetrics(timeSeriesData) {
        const prices = timeSeriesData.data.map(d => d.close);
        const returns = [];
        for (let i = 1; i < prices.length; i++) {
            returns.push((prices[i] - prices[i-1]) / prices[i-1]);
        }
        
        // Value at Risk (VaR) - 95% confidence
        const sortedReturns = [...returns].sort((a, b) => a - b);
        const varIndex = Math.floor(returns.length * 0.05);
        const var95 = sortedReturns[varIndex];
        const varPercentage = (var95 * 100).toFixed(2);
        
        // Conditional VaR (CVaR)
        const cvarReturns = sortedReturns.slice(0, varIndex);
        const cvar = cvarReturns.length > 0 ? 
            (cvarReturns.reduce((a, b) => a + b, 0) / cvarReturns.length * 100).toFixed(2) : 'N/A';
        
        // Skewness
        const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
        const stdDev = this.calculateStdDev(returns);
        const skewness = returns.length > 0 && stdDev !== 0 ? 
            (returns.reduce((sum, r) => sum + Math.pow((r - mean) / stdDev, 3), 0) / returns.length).toFixed(3) : 'N/A';
        
        // Kurtosis
        const kurtosis = returns.length > 0 && stdDev !== 0 ? 
            (returns.reduce((sum, r) => sum + Math.pow((r - mean) / stdDev, 4), 0) / returns.length - 3).toFixed(3) : 'N/A';
        
        return {
            var95: varPercentage,
            cvar95: cvar,
            skewness,
            kurtosis,
            tailRisk: parseFloat(kurtosis) > 0 ? 'High' : 'Normal'
        };
    }
    
    calculateAlpha(annualizedReturn, beta, riskFreeRate = 0.02, marketReturn = 0.10) {
        const expectedReturn = riskFreeRate + beta * (marketReturn - riskFreeRate);
        const alpha = ((annualizedReturn - expectedReturn) * 100).toFixed(2);
        return alpha;
    }
    
    calculateEarningsQuality(earnings) {
        if (!earnings || earnings.length === 0) return 'N/A';
        
        let qualityScore = 0;
        let totalSurprises = 0;
        
        earnings.forEach(e => {
            if (e.surprisePercent) {
                totalSurprises += Math.abs(e.surprisePercent);
                if (e.surprisePercent > 0) qualityScore += 10;
                if (e.surprisePercent > 5) qualityScore += 5;
                if (e.surprisePercent < -5) qualityScore -= 10;
            }
        });
        
        const avgSurprise = totalSurprises / earnings.length;
        const consistency = avgSurprise < 5 ? 20 : avgSurprise < 10 ? 10 : 0;
        
        qualityScore += consistency;
        
        if (qualityScore >= 60) return 'Excellent';
        if (qualityScore >= 40) return 'Good';
        if (qualityScore >= 20) return 'Average';
        return 'Poor';
    }
    
    calculateCorrelation(timeSeriesArray) {
        if (timeSeriesArray.length < 2) return null;
        
        const series1 = timeSeriesArray[0].data.map(d => d.close);
        const series2 = timeSeriesArray[1].data.map(d => d.close);
        
        const minLength = Math.min(series1.length, series2.length);
        const data1 = series1.slice(-minLength);
        const data2 = series2.slice(-minLength);
        
        const returns1 = [];
        const returns2 = [];
        
        for (let i = 1; i < minLength; i++) {
            returns1.push((data1[i] - data1[i-1]) / data1[i-1]);
            returns2.push((data2[i] - data2[i-1]) / data2[i-1]);
        }
        
        const mean1 = returns1.reduce((a, b) => a + b, 0) / returns1.length;
        const mean2 = returns2.reduce((a, b) => a + b, 0) / returns2.length;
        
        let numerator = 0;
        let sum1Sq = 0;
        let sum2Sq = 0;
        
        for (let i = 0; i < returns1.length; i++) {
            const diff1 = returns1[i] - mean1;
            const diff2 = returns2[i] - mean2;
            numerator += diff1 * diff2;
            sum1Sq += diff1 * diff1;
            sum2Sq += diff2 * diff2;
        }
        
        const correlation = numerator / Math.sqrt(sum1Sq * sum2Sq);
        
        return {
            correlation: correlation.toFixed(3),
            interpretation: this.interpretCorrelation(correlation),
            diversificationBenefit: Math.abs(correlation) < 0.7 ? 'High' : Math.abs(correlation) < 0.9 ? 'Moderate' : 'Low'
        };
    }
    
    interpretCorrelation(corr) {
        const abs = Math.abs(corr);
        if (abs >= 0.9) return 'Very Strong';
        if (abs >= 0.7) return 'Strong';
        if (abs >= 0.5) return 'Moderate';
        if (abs >= 0.3) return 'Weak';
        return 'Very Weak';
    }

    // ============================================
    // CHARGEMENT DONNÉES DE COMPARAISON
    // ============================================
    
    async loadComparisonData(symbols, timeframe = '1y') {
        const comparisonData = {
            symbols: symbols,
            stocksData: [],
            timeSeries: [],
            keyMetricsComparison: null
        };
        
        try {
            const promises = symbols.map(async symbol => {
                const [stockData, timeSeries] = await Promise.all([
                    this.analytics.getStockData(symbol).catch(() => null),
                    this.analytics.getTimeSeries(symbol, '1day', this.getOutputSize(timeframe)).catch(() => null)
                ]);
                
                return { symbol, stockData, timeSeries };
            });
            
            const results = await Promise.all(promises);
            
            results.forEach(result => {
                if (result.stockData) {
                    comparisonData.stocksData.push({
                        symbol: result.symbol,
                        ...result.stockData
                    });
                }
                
                if (result.timeSeries) {
                    comparisonData.timeSeries.push({
                        symbol: result.symbol,
                        data: result.timeSeries.data
                    });
                }
            });
            
            comparisonData.keyMetricsComparison = this.buildMetricsComparisonTable(comparisonData.stocksData);
            
        } catch (error) {
            console.error('Error loading comparison data:', error);
        }
        
        return comparisonData;
    }
    
    buildMetricsComparisonTable(stocksData) {
        if (!stocksData || stocksData.length === 0) return null;
        
        const metrics = [
            { key: 'quote.current', label: 'Current Price', format: (v) => `$${v?.toFixed(2) || 'N/A'}` },
            { key: 'quote.changePercent', label: 'Change %', format: (v) => `${v > 0 ? '+' : ''}${v?.toFixed(2) || 'N/A'}%` },
            { key: 'profile.marketCap', label: 'Market Cap', format: (v) => `$${v || 'N/A'}B` },
            { key: 'metrics.peRatio', label: 'P/E Ratio', format: (v) => v || 'N/A' },
            { key: 'metrics.eps', label: 'EPS (TTM)', format: (v) => `$${v || 'N/A'}` },
            { key: 'metrics.dividendYield', label: 'Dividend Yield', format: (v) => `${v || 'N/A'}%` },
            { key: 'metrics.beta', label: 'Beta', format: (v) => v || 'N/A' },
            { key: 'metrics.roe', label: 'ROE', format: (v) => `${v || 'N/A'}%` },
            { key: 'metrics.profitMargin', label: 'Profit Margin', format: (v) => `${v || 'N/A'}%` }
        ];
        
        const table = {
            headers: ['Metric', ...stocksData.map(s => s.symbol)],
            rows: []
        };
        
        metrics.forEach(metric => {
            const row = [metric.label];
            
            stocksData.forEach(stock => {
                const value = this.getNestedValue(stock, metric.key);
                row.push(metric.format(value));
            });
            
            table.rows.push(row);
        });
        
        return table;
    }
    
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }

    // ============================================
    // CONSTRUCTION PROMPT ENRICHI
    // ============================================
    
    buildEnhancedPrompt(message, context, analysis) {
        let prompt = `You are Alphy, an expert AI financial analyst with access to comprehensive real-time data. Answer this question professionally and concisely:\n\n**User Question:** "${message}"\n\n`;

        if (context.comparisonData && context.comparisonData.stocksData.length >= 2) {
            prompt += this.buildComparisonPrompt(context.comparisonData, context.correlationAnalysis);
            
            prompt += `\n**Your Task:**\n\nProvide a **detailed side-by-side comparison** in 3-4 well-structured paragraphs:\n\n`;
            prompt += `1. **Performance Comparison**: Compare price performance, volatility, and returns\n`;
            prompt += `2. **Fundamental Analysis**: Compare valuation metrics (P/E, market cap, profitability)\n`;
            prompt += `3. **Investment Perspective**: Which stock is better for growth vs value investors?\n`;
            prompt += `4. **Risk Assessment**: Compare risk profiles and market positions\n\n`;
            prompt += `Use **specific numbers** from the data above. Be objective and data-driven.\n`;
            
            return prompt;
        }

        if (context.stockData) {
            const stock = context.stockData;
            prompt += `\n**${stock.profile?.name || stock.symbol}** (${stock.symbol})\n\n`;
            
            prompt += `**Current Price:** $${stock.quote.current} (${stock.quote.changePercent > 0 ? '+' : ''}${stock.quote.changePercent}%)\n`;
            prompt += `**Day Range:** $${stock.quote.low} - $${stock.quote.high}\n`;
            prompt += `**52-Week Range:** $${stock.metrics?.week52Low || 'N/A'} - $${stock.metrics?.week52High || 'N/A'}\n`;
            prompt += `**Volume:** ${stock.quote.volume?.toLocaleString() || 'N/A'}\n\n`;
            
            prompt += `**Company Info:**\n`;
            prompt += `- Industry: ${stock.profile?.industry || 'N/A'}\n`;
            prompt += `- Market Cap: $${stock.profile?.marketCap || 'N/A'}B\n`;
            prompt += `- Exchange: ${stock.profile?.exchange || 'N/A'}\n`;
            prompt += `- Country: ${stock.profile?.country || 'N/A'}\n\n`;
            
            if (stock.metrics) {
                prompt += `**Key Metrics:**\n`;
                prompt += `- P/E Ratio: ${stock.metrics.peRatio || 'N/A'}\n`;
                prompt += `- EPS (TTM): $${stock.metrics.eps || 'N/A'}\n`;
                prompt += `- Beta: ${stock.metrics.beta || 'N/A'}\n`;
                prompt += `- ROE: ${stock.metrics.roe || 'N/A'}%\n`;
                prompt += `- Profit Margin: ${stock.metrics.profitMargin || 'N/A'}%\n`;
                prompt += `- Dividend Yield: ${stock.metrics.dividendYield || 'N/A'}%\n`;
                prompt += `- Debt/Equity: ${stock.metrics.debtToEquity || 'N/A'}\n`;
                prompt += `- Current Ratio: ${stock.metrics.currentRatio || 'N/A'}\n\n`;
            }
        }

        if (context.advancedMetrics) {
            const adv = context.advancedMetrics;
            prompt += `\n**ADVANCED RISK-ADJUSTED METRICS:**\n\n`;
            prompt += `- **Sharpe Ratio:** ${adv.sharpeRatio} (risk-adjusted return)\n`;
            prompt += `- **Sortino Ratio:** ${adv.sortinoRatio} (downside risk-adjusted)\n`;
            prompt += `- **Calmar Ratio:** ${adv.calmarRatio} (return vs max drawdown)\n`;
            prompt += `- **Treynor Ratio:** ${adv.treynorRatio} (return per unit of systematic risk)\n`;
            prompt += `- **Alpha:** ${adv.alpha}% (excess return vs market)\n`;
            prompt += `- **Beta:** ${adv.beta} (systematic risk)\n\n`;
        }
        
        if (context.riskMetrics) {
            const risk = context.riskMetrics;
            prompt += `**RISK METRICS:**\n\n`;
            prompt += `- **Value at Risk (95%):** ${risk.var95}% (max expected loss)\n`;
            prompt += `- **Conditional VaR:** ${risk.cvar95}% (expected shortfall)\n`;
            prompt += `- **Skewness:** ${risk.skewness} (return distribution asymmetry)\n`;
            prompt += `- **Kurtosis:** ${risk.kurtosis} (tail risk)\n`;
            prompt += `- **Tail Risk Assessment:** ${risk.tailRisk}\n\n`;
        }

        if (context.analystRecommendations) {
            const rec = context.analystRecommendations;
            prompt += `\n**Analyst Recommendations** (${rec.period})\n\n`;
            prompt += `- Strong Buy: ${rec.strongBuy} | Buy: ${rec.buy} | Hold: ${rec.hold} | Sell: ${rec.sell} | Strong Sell: ${rec.strongSell}\n`;
            prompt += `- **Total Analysts:** ${rec.total}\n`;
            prompt += `- **Consensus:** **${rec.consensus}** (${rec.bullishPercent}% bullish)\n\n`;
        }

        if (context.priceTarget) {
            const pt = context.priceTarget;
            prompt += `\n**Analyst Price Target**\n\n`;
            prompt += `- Current Price: $${pt.current}\n`;
            prompt += `- Mean Target: $${pt.targetMean} (${pt.upside > 0 ? '+' : ''}${pt.upside}% upside)\n`;
            prompt += `- Target Range: $${pt.targetLow} - $${pt.targetHigh}\n`;
            prompt += `- Median Target: $${pt.targetMedian || 'N/A'}\n\n`;
        }

        if (context.earningsHistory) {
            const earnings = context.earningsHistory;
            prompt += `\n**Earnings Performance**\n\n`;
            prompt += `- Beat Rate: **${earnings.beatRate}%** (${earnings.beatCount} beats, ${earnings.missCount} misses in last ${earnings.recent.length} quarters)\n`;
            prompt += `- Total Reports: ${earnings.totalReports}\n`;
            prompt += `- **Earnings Quality Score:** ${earnings.earningsQuality}\n\n`;
            prompt += `**Recent Results:**\n`;
            earnings.recent.slice(0, 4).forEach(e => {
                const status = e.surprise > 0 ? 'Beat' : e.surprise < 0 ? 'Miss' : 'In-line';
                const surprisePercent = e.surprisePercent ? ` (${e.surprisePercent > 0 ? '+' : ''}${e.surprisePercent}%)` : '';
                prompt += `- ${e.period}: Actual $${e.actual || 'N/A'} vs Est. $${e.estimate || 'N/A'} - ${status}${surprisePercent}\n`;
            });
            prompt += `\n`;
        }

        if (context.revenueEstimates && context.revenueEstimates.length > 0) {
            prompt += `**Revenue Estimates (Quarterly):**\n`;
            context.revenueEstimates.slice(0, 2).forEach(est => {
                prompt += `- ${est.period}: $${est.revenueAvg || 'N/A'}M (${est.numberAnalysts || 0} analysts)\n`;
            });
            prompt += `\n`;
        }

        if (context.epsEstimates && context.epsEstimates.length > 0) {
            prompt += `**EPS Estimates (Quarterly):**\n`;
            context.epsEstimates.slice(0, 2).forEach(est => {
                prompt += `- ${est.period}: $${est.epsAvg || 'N/A'} (${est.numberAnalysts || 0} analysts)\n`;
            });
            prompt += `\n`;
        }

        if (context.sentiment) {
            const sent = context.sentiment;
            prompt += `\n**News Sentiment Analysis**\n\n`;
            prompt += `- Overall Sentiment: **${sent.overallSentiment.label}** (score: ${sent.overallSentiment.sentiment.toFixed(3)})\n`;
            prompt += `- Short-Term Impact: ${sent.shortTermImpact.direction} (${sent.shortTermImpact.confidence} confidence)\n`;
            prompt += `- Long-Term Impact: ${sent.longTermImpact.direction} (${sent.longTermImpact.confidence} confidence)\n`;
            prompt += `- AI Recommendation: ${sent.recommendation}\n`;
            prompt += `- News Count: ${sent.newsCount || 0}\n\n`;
        }

        if (context.recentNews && context.recentNews.length > 0) {
            prompt += `\n**Recent Company News** (Top 5)\n\n`;
            context.recentNews.slice(0, 5).forEach((news, i) => {
                const date = new Date(news.datetime).toLocaleDateString();
                prompt += `${i + 1}. **${news.headline}** (${news.source}, ${date})\n`;
            });
            prompt += `\n`;
        }

        if (context.upgradesDowngrades && context.upgradesDowngrades.length > 0) {
            prompt += `**Recent Analyst Actions:**\n`;
            context.upgradesDowngrades.slice(0, 3).forEach(change => {
                prompt += `- ${change.company || 'Analyst'}: ${change.fromGrade || 'N/A'} -> ${change.toGrade || 'N/A'} (${change.action || 'N/A'})\n`;
            });
            prompt += `\n`;
        }

        if (context.peers && context.peers.length > 0) {
            prompt += `**Industry Peers:** ${context.peers.slice(0, 5).join(', ')}\n\n`;
        }

        if (context.technicalIndicators) {
            const tech = context.technicalIndicators;
            prompt += `\n**Technical Analysis**\n\n`;
            
            if (tech.movingAverages) {
                prompt += `**Moving Averages:**\n`;
                prompt += `- SMA 20: $${tech.movingAverages.sma20 || 'N/A'} (${tech.movingAverages.priceVsSMA20 > 0 ? '+' : ''}${tech.movingAverages.priceVsSMA20 || 0}%)\n`;
                prompt += `- SMA 50: $${tech.movingAverages.sma50 || 'N/A'} (${tech.movingAverages.priceVsSMA50 > 0 ? '+' : ''}${tech.movingAverages.priceVsSMA50 || 0}%)\n`;
                prompt += `- SMA 200: $${tech.movingAverages.sma200 || 'N/A'} (${tech.movingAverages.priceVsSMA200 > 0 ? '+' : ''}${tech.movingAverages.priceVsSMA200 || 0}%)\n\n`;
            }
            
            if (tech.momentum) {
                prompt += `**Momentum:**\n`;
                prompt += `- RSI(14): ${tech.momentum.rsi || 'N/A'} (${tech.momentum.rsiSignal || 'N/A'})\n\n`;
            }
            
            if (tech.volatility) {
                prompt += `**Risk Metrics:**\n`;
                prompt += `- Volatility: ${tech.volatility.annualized || 'N/A'}% (${tech.volatility.level || 'N/A'})\n`;
                prompt += `- Max Drawdown: ${tech.volatility.maxDrawdown || 'N/A'}%\n`;
                prompt += `- Sharpe Ratio: ${tech.volatility.sharpeRatio || 'N/A'}\n\n`;
            }
            
            if (tech.trend) {
                prompt += `**Trend:** ${tech.trend.direction || 'N/A'} (${tech.trend.strength || 'N/A'})\n\n`;
            }
        }

        if (context.historicalStats) {
            const stats = context.historicalStats;
            prompt += `**Historical Performance (${stats.period}):**\n`;
            prompt += `- Total Return: ${stats.totalReturn > 0 ? '+' : ''}${stats.totalReturn}%\n`;
            prompt += `- Annualized Return: ${stats.annualizedReturn > 0 ? '+' : ''}${stats.annualizedReturn}%\n`;
            prompt += `- Period Range: $${stats.minPrice} - $${stats.maxPrice}\n\n`;
        }

        if (context.marketNews && context.marketNews.length > 0) {
            prompt += `\n**Latest Market News**\n\n`;
            context.marketNews.slice(0, 5).forEach((news, i) => {
                prompt += `${i + 1}. **${news.headline}** (${news.source})\n`;
            });
            prompt += `\n`;
        }

        if (context.upcomingIPOs && context.upcomingIPOs.length > 0) {
            prompt += `\n**Upcoming IPOs**\n\n`;
            context.upcomingIPOs.slice(0, 10).forEach((ipo, i) => {
                prompt += `${i + 1}. **${ipo.name || ipo.symbol}** (${ipo.symbol}) - ${ipo.date} | Price: ${ipo.price || 'TBD'} | Shares: ${ipo.numberOfShares || 'N/A'}\n`;
            });
            prompt += `\n`;
        }

        if (context.upcomingEarnings && context.upcomingEarnings.length > 0) {
            prompt += `\n**Upcoming Earnings Reports**\n\n`;
            context.upcomingEarnings.slice(0, 15).forEach((e, i) => {
                prompt += `${i + 1}. **${e.symbol}** - ${e.date} | EPS Est: $${e.epsEstimate || 'N/A'} | Rev Est: $${e.revenueEstimate ? (e.revenueEstimate / 1e9).toFixed(2) + 'B' : 'N/A'}\n`;
            });
            prompt += `\n`;
        }

        if (context.marketData) {
            const market = context.marketData;
            prompt += `\n**Market Overview**\n\n`;
            
            if (market.sp500) {
                prompt += `- **S&P 500 (SPY):** $${market.sp500.price} (${market.sp500.changePercent > 0 ? '+' : ''}${market.sp500.changePercent}%)\n`;
            }
            if (market.nasdaq) {
                prompt += `- **NASDAQ (QQQ):** $${market.nasdaq.price} (${market.nasdaq.changePercent > 0 ? '+' : ''}${market.nasdaq.changePercent}%)\n`;
            }
            if (market.dow) {
                prompt += `- **Dow Jones (DIA):** $${market.dow.price} (${market.dow.changePercent > 0 ? '+' : ''}${market.dow.changePercent}%)\n`;
            }
            prompt += `\n`;
        }

        prompt += `\n**Your Task:**\n\nBased on this comprehensive real-time data, provide a professional, detailed analysis in **3-4 well-structured paragraphs**. Include:\n\n`;
        prompt += `1. **Key Findings**: Highlight the most important data points and what they mean\n`;
        prompt += `2. **Analysis**: Provide context and interpretation of the numbers\n`;
        prompt += `3. **Actionable Insights**: Offer clear, data-driven recommendations\n`;
        prompt += `4. **Risk Considerations**: Mention relevant risks and limitations\n\n`;
        prompt += `Use **specific numbers** from the data above. Be concise but thorough. Write in a professional yet accessible tone.\n`;

        return prompt;
    }
    
    buildComparisonPrompt(comparisonData, correlationAnalysis) {
        let prompt = `\nMULTI-STOCK COMPARISON ANALYSIS\n\n`;
        
        prompt += `**Comparing:** ${comparisonData.symbols.join(' vs ')}\n\n`;
        
        comparisonData.stocksData.forEach((stock, index) => {
            prompt += `\n**${index + 1}. ${stock.symbol}** - ${stock.profile?.name || stock.symbol}\n\n`;
            
            prompt += `**Price Performance:**\n`;
            prompt += `- Current: $${stock.quote.current} (${stock.quote.changePercent > 0 ? '+' : ''}${stock.quote.changePercent}%)\n`;
            prompt += `- Day Range: $${stock.quote.low} - $${stock.quote.high}\n`;
            prompt += `- 52W Range: $${stock.metrics?.week52Low || 'N/A'} - $${stock.metrics?.week52High || 'N/A'}\n\n`;
            
            prompt += `**Company Fundamentals:**\n`;
            prompt += `- Industry: ${stock.profile?.industry || 'N/A'}\n`;
            prompt += `- Market Cap: $${stock.profile?.marketCap || 'N/A'}B\n`;
            prompt += `- P/E Ratio: ${stock.metrics?.peRatio || 'N/A'}\n`;
            prompt += `- EPS: $${stock.metrics?.eps || 'N/A'}\n`;
            prompt += `- ROE: ${stock.metrics?.roe || 'N/A'}%\n`;
            prompt += `- Profit Margin: ${stock.metrics?.profitMargin || 'N/A'}%\n`;
            prompt += `- Beta: ${stock.metrics?.beta || 'N/A'}\n`;
            prompt += `- Dividend Yield: ${stock.metrics?.dividendYield || 'N/A'}%\n\n`;
        });
        
        if (comparisonData.keyMetricsComparison) {
            prompt += `\n**Side-by-Side Metrics Comparison**\n\n`;
            
            const table = comparisonData.keyMetricsComparison;
            
            prompt += `| ${table.headers.join(' | ')} |\n`;
            prompt += `|${table.headers.map(() => '---').join('|')}|\n`;
            
            table.rows.forEach(row => {
                prompt += `| ${row.join(' | ')} |\n`;
            });
            
            prompt += `\n`;
        }
        
        if (correlationAnalysis) {
            prompt += `\n**CORRELATION ANALYSIS:**\n\n`;
            prompt += `- **Correlation Coefficient:** ${correlationAnalysis.correlation}\n`;
            prompt += `- **Interpretation:** ${correlationAnalysis.interpretation} correlation\n`;
            prompt += `- **Diversification Benefit:** ${correlationAnalysis.diversificationBenefit}\n\n`;
            prompt += `**Insight:** ${Math.abs(parseFloat(correlationAnalysis.correlation)) < 0.7 ? 
                'These stocks move relatively independently, providing good diversification.' : 
                'These stocks tend to move together, offering limited diversification benefits.'}\n\n`;
        }
        
        if (comparisonData.timeSeries && comparisonData.timeSeries.length > 0) {
            prompt += `**Historical Performance Comparison:**\n`;
            comparisonData.timeSeries.forEach(series => {
                if (series.data && series.data.length > 0) {
                    const firstPrice = series.data[0].close;
                    const lastPrice = series.data[series.data.length - 1].close;
                    const totalReturn = ((lastPrice - firstPrice) / firstPrice * 100).toFixed(2);
                    prompt += `- **${series.symbol}**: ${totalReturn > 0 ? '+' : ''}${totalReturn}% total return (${series.data.length} days)\n`;
                }
            });
            prompt += `\n`;
        }
        
        return prompt;
    }

    // ============================================
    // GÉNÉRATION CARTES VISUELLES
    // ============================================
    
    async generateVisualCards(context, analysis) {
        const cards = [];
        
        if (context.stockData && !analysis.isComparison) {
            const stock = context.stockData;
            
            cards.push({
                type: 'metric',
                title: 'Current Price',
                value: `$${stock.quote.current}`,
                change: `${stock.quote.changePercent > 0 ? '+' : ''}${stock.quote.changePercent}%`,
                trend: stock.quote.changePercent > 0 ? 'up' : 'down',
                icon: ''
            });
            
            if (stock.profile?.marketCap) {
                cards.push({
                    type: 'metric',
                    title: 'Market Cap',
                    value: `$${stock.profile.marketCap}B`,
                    icon: ''
                });
            }
            
            if (stock.metrics?.peRatio) {
                cards.push({
                    type: 'metric',
                    title: 'P/E Ratio',
                    value: stock.metrics.peRatio,
                    icon: ''
                });
            }
            
            if (context.analystRecommendations) {
                cards.push({
                    type: 'metric',
                    title: 'Analyst Consensus',
                    value: context.analystRecommendations.consensus,
                    subtitle: `${context.analystRecommendations.total} analysts`,
                    icon: ''
                });
            }
            
            if (context.sentiment) {
                cards.push({
                    type: 'metric',
                    title: 'News Sentiment',
                    value: context.sentiment.overallSentiment.label,
                    subtitle: `Score: ${context.sentiment.overallSentiment.sentiment.toFixed(2)}`,
                    icon: ''
                });
            }
            
            if (context.advancedMetrics) {
                cards.push({
                    type: 'metric',
                    title: 'Sharpe Ratio',
                    value: context.advancedMetrics.sharpeRatio,
                    subtitle: 'Risk-Adjusted Return',
                    icon: ''
                });
            }
        }
        
        if (context.comparisonData && context.comparisonData.stocksData.length >= 2) {
            context.comparisonData.stocksData.forEach(stock => {
                cards.push({
                    type: 'comparison-card',
                    symbol: stock.symbol,
                    name: stock.profile?.name || stock.symbol,
                    price: `$${stock.quote.current}`,
                    change: `${stock.quote.changePercent > 0 ? '+' : ''}${stock.quote.changePercent}%`,
                    trend: stock.quote.changePercent > 0 ? 'up' : 'down',
                    marketCap: `$${stock.profile?.marketCap || 'N/A'}B`,
                    peRatio: stock.metrics?.peRatio || 'N/A'
                });
            });
        }
        
        return cards;
    }
    
    // ============================================
    // GÉNÉRATION REQUÊTES DE GRAPHIQUES
    // ============================================
    
    async generateChartRequests(context, analysis) {
        const chartRequests = [];
        
        if (context.comparisonData && context.comparisonData.timeSeries && context.comparisonData.timeSeries.length >= 2) {
            chartRequests.push({
                type: 'comparison',
                symbols: context.comparisonData.symbols,
                timeSeriesData: context.comparisonData.timeSeries,
                timeframe: analysis.timeframes[0] || '1y'
            });
        }
        
        if (context.timeSeriesData && !analysis.isComparison) {
            chartRequests.push({
                type: 'line',
                symbol: analysis.symbols[0],
                data: context.timeSeriesData,
                indicators: analysis.intents.includes('HISTORICAL') || analysis.intents.includes('ADVANCED_ANALYSIS') ? ['sma'] : [],
                timeframe: analysis.timeframes[0] || '1y'
            });
        }
        
        if (context.comparisonData && context.comparisonData.keyMetricsComparison) {
            chartRequests.push({
                type: 'metrics-table',
                data: context.comparisonData.keyMetricsComparison
            });
        }
        
        return chartRequests;
    }

    // ============================================
    // SUGGESTIONS AVANCÉES WALL STREET
    // ============================================
    
    generateAdvancedSuggestions(analysis, context) {
        const suggestions = [];
        
        if (analysis.isComparison && analysis.comparisonSymbols.length >= 2) {
            const symbols = analysis.comparisonSymbols;
            suggestions.push(
                `Correlation analysis: ${symbols.join(' vs ')}`,
                `Risk-adjusted returns: ${symbols[0]} vs ${symbols[1]}`,
                `Fair value estimation: ${symbols[0]}`,
                `Sector rotation impact on ${symbols[0]}`
            );
            return suggestions.slice(0, 4);
        }
        
        if (analysis.symbols.length > 0) {
            const symbol = analysis.symbols[0];
            
            if (context.advancedMetrics) {
                suggestions.push(`${symbol} Sharpe ratio vs sector average`);
            }
            
            if (context.earningsHistory) {
                suggestions.push(`${symbol} earnings quality score breakdown`);
            }
            
            if (context.stockData?.metrics?.beta) {
                suggestions.push(`${symbol} systematic vs unsystematic risk`);
            }
            
            suggestions.push(
                `${symbol} fair value (DCF analysis)`,
                `${symbol} options flow analysis`,
                `${symbol} insider trading activity`,
                `${symbol} institutional ownership changes`,
                `${symbol} short interest trends`,
                `${symbol} relative strength index vs peers`,
                `${symbol} seasonal patterns analysis`,
                `${symbol} Monte Carlo simulation`,
                `${symbol} stress test scenarios`,
                `${symbol} credit risk assessment`
            );
            
        } else if (analysis.type === 'IPO_QUERY') {
            suggestions.push(
                "Top performing IPOs by Sharpe ratio",
                "IPO lock-up period calendar",
                "Underwriter reputation analysis",
                "Post-IPO price stability metrics"
            );
        } else if (analysis.type === 'MARKET_NEWS_QUERY') {
            suggestions.push(
                "Sector rotation indicators",
                "Market breadth analysis",
                "Volatility index (VIX) interpretation",
                "Economic surprise index impact"
            );
        } else {
            suggestions.push(
                "Top stocks by Sharpe ratio this month",
                "Market correlation matrix",
                "Sector performance attribution",
                "Factor exposure analysis (growth vs value)"
            );
        }
        
        return suggestions.slice(0, 4);
    }

    // ============================================
    // CALCULS TECHNIQUES
    // ============================================
    
    calculateHistoricalStats(timeSeriesData) {
        const prices = timeSeriesData.data.map(d => d.close);
        const firstPrice = prices[0];
        const lastPrice = prices[prices.length - 1];
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const totalReturn = ((lastPrice - firstPrice) / firstPrice * 100).toFixed(2);
        
        const years = timeSeriesData.data.length / 252;
        const annualizedReturn = (Math.pow(lastPrice / firstPrice, 1 / years) - 1) * 100;
        
        const returns = [];
        for (let i = 1; i < prices.length; i++) {
            returns.push((prices[i] - prices[i-1]) / prices[i-1]);
        }
        const stdDev = this.calculateStdDev(returns);
        const annualizedVolatility = (stdDev * Math.sqrt(252) * 100).toFixed(2);
        
        return {
            firstPrice: firstPrice.toFixed(2),
            lastPrice: lastPrice.toFixed(2),
            minPrice: minPrice.toFixed(2),
            maxPrice: maxPrice.toFixed(2),
            totalReturn: totalReturn,
            annualizedReturn: annualizedReturn.toFixed(2),
            volatility: annualizedVolatility,
            period: this.conversationContext.lastTimeframe || '1y',
            dataPoints: timeSeriesData.data.length
        };
    }

    calculateTechnicalIndicators(timeSeriesData) {
        if (!timeSeriesData || !timeSeriesData.data || timeSeriesData.data.length === 0) {
            return null;
        }

        const data = timeSeriesData.data;
        const closes = data.map(d => d.close);
        
        const sma20 = this.calculateSMA(closes, 20);
        const sma50 = this.calculateSMA(closes, 50);
        const sma200 = this.calculateSMA(closes, 200);
        
        const currentPrice = closes[closes.length - 1];
        const currentSMA20 = sma20[sma20.length - 1];
        const currentSMA50 = sma50[sma50.length - 1];
        const currentSMA200 = sma200[sma200.length - 1];
        
        const rsi = this.calculateRSI(closes, 14);
        const currentRSI = rsi[rsi.length - 1];
        
        const returns = [];
        for (let i = 1; i < closes.length; i++) {
            returns.push((closes[i] - closes[i-1]) / closes[i-1]);
        }
        const stdDev = this.calculateStdDev(returns);
        const annualizedVolatility = (stdDev * Math.sqrt(252) * 100).toFixed(2);
        
        const maxDrawdown = this.calculateMaxDrawdown(closes);
        const currentDrawdown = this.calculateCurrentDrawdown(closes);
        
        const riskFreeRate = 0.02;
        const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
        const annualizedReturn = avgReturn * 252;
        const excessReturn = annualizedReturn - riskFreeRate;
        const annualizedStdDev = stdDev * Math.sqrt(252);
        const sharpeRatio = annualizedStdDev !== 0 ? (excessReturn / annualizedStdDev).toFixed(2) : 'N/A';
        
        const supportResistance = this.identifySupportResistance(data);
        const trend = this.analyzeTrend(closes, sma20, sma50, sma200);
        
        return {
            movingAverages: {
                sma20: currentSMA20?.toFixed(2),
                sma50: currentSMA50?.toFixed(2),
                sma200: currentSMA200?.toFixed(2),
                priceVsSMA20: currentSMA20 ? ((currentPrice - currentSMA20) / currentSMA20 * 100).toFixed(2) : null,
                priceVsSMA50: currentSMA50 ? ((currentPrice - currentSMA50) / currentSMA50 * 100).toFixed(2) : null,
                priceVsSMA200: currentSMA200 ? ((currentPrice - currentSMA200) / currentSMA200 * 100).toFixed(2) : null
            },
            momentum: {
                rsi: currentRSI?.toFixed(2),
                rsiSignal: currentRSI > 70 ? 'Overbought' : currentRSI < 30 ? 'Oversold' : 'Neutral'
            },
            volatility: {
                annualized: annualizedVolatility,
                level: parseFloat(annualizedVolatility) > 50 ? 'Very High' : 
                       parseFloat(annualizedVolatility) > 30 ? 'High' : 
                       parseFloat(annualizedVolatility) > 15 ? 'Medium' : 'Low',
                maxDrawdown: maxDrawdown.toFixed(2),
                currentDrawdown: currentDrawdown.toFixed(2),
                sharpeRatio: sharpeRatio
            },
            levels: supportResistance,
            trend: trend
        };
    }

    calculateSMA(data, period) {
        const sma = [];
        for (let i = 0; i < data.length; i++) {
            if (i < period - 1) {
                sma.push(null);
            } else {
                const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
                sma.push(sum / period);
            }
        }
        return sma;
    }

    calculateRSI(data, period = 14) {
        const rsi = [];
        const gains = [];
        const losses = [];
        
        for (let i = 1; i < data.length; i++) {
            const change = data[i] - data[i - 1];
            gains.push(change > 0 ? change : 0);
            losses.push(change < 0 ? Math.abs(change) : 0);
        }
        
        for (let i = 0; i < gains.length; i++) {
            if (i < period - 1) {
                rsi.push(null);
            } else {
                const avgGain = gains.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
                const avgLoss = losses.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
                
                if (avgLoss === 0) {
                    rsi.push(100);
                } else {
                    const rs = avgGain / avgLoss;
                    rsi.push(100 - (100 / (1 + rs)));
                }
            }
        }
        
        return rsi;
    }

    calculateStdDev(data) {
        const mean = data.reduce((a, b) => a + b, 0) / data.length;
        const squaredDiffs = data.map(value => Math.pow(value - mean, 2));
        const variance = squaredDiffs.reduce((a, b) => a + b, 0) / data.length;
        return Math.sqrt(variance);
    }

    calculateMaxDrawdown(prices) {
        let maxDrawdown = 0;
        let peak = prices[0];
        
        for (let i = 1; i < prices.length; i++) {
            if (prices[i] > peak) {
                peak = prices[i];
            }
            const drawdown = ((peak - prices[i]) / peak) * 100;
            if (drawdown > maxDrawdown) {
                maxDrawdown = drawdown;
            }
        }
        
        return maxDrawdown;
    }

    calculateCurrentDrawdown(prices) {
        const peak = Math.max(...prices);
        const current = prices[prices.length - 1];
        return ((peak - current) / peak) * 100;
    }

    identifySupportResistance(data) {
        const supports = [];
        const resistances = [];
        
        for (let i = 10; i < data.length - 10; i++) {
            const current = data[i].low;
            const prev = data.slice(i - 10, i).map(d => d.low);
            const next = data.slice(i + 1, i + 11).map(d => d.low);
            
            if (current <= Math.min(...prev) && current <= Math.min(...next)) {
                supports.push(current);
            }
            
            const currentHigh = data[i].high;
            const prevHigh = data.slice(i - 10, i).map(d => d.high);
            const nextHigh = data.slice(i + 1, i + 11).map(d => d.high);
            
            if (currentHigh >= Math.max(...prevHigh) && currentHigh >= Math.max(...nextHigh)) {
                resistances.push(currentHigh);
            }
        }
        
        return {
            support: supports.length > 0 ? [...new Set(supports.slice(-3))].map(s => s.toFixed(2)) : [],
            resistance: resistances.length > 0 ? [...new Set(resistances.slice(-3))].map(r => r.toFixed(2)) : []
        };
    }

    analyzeTrend(closes, sma20, sma50, sma200) {
        const currentPrice = closes[closes.length - 1];
        const current20 = sma20[sma20.length - 1];
        const current50 = sma50[sma50.length - 1];
        const current200 = sma200[sma200.length - 1];
        
        if (!current20 || !current50 || !current200) {
            return { direction: 'Insufficient data', strength: 'N/A', duration: 0 };
        }
        
        let direction = 'Neutral';
        let strength = 'Weak';
        
        if (currentPrice > current20 && current20 > current50 && current50 > current200) {
            direction = 'Strong Uptrend';
            strength = 'Strong';
        } else if (currentPrice > current20 && currentPrice > current50) {
            direction = 'Uptrend';
            strength = 'Moderate';
        } else if (currentPrice < current20 && current20 < current50 && current50 < current200) {
            direction = 'Strong Downtrend';
            strength = 'Strong';
        } else if (currentPrice < current20 && currentPrice < current50) {
            direction = 'Downtrend';
            strength = 'Moderate';
        } else {
            direction = 'Sideways';
            strength = 'Weak';
        }
        
        return { direction, strength, duration: 0 };
    }

    getConsensusRating(recommendation) {
        const scores = {
            strongBuy: recommendation.strongBuy * 5,
            buy: recommendation.buy * 4,
            hold: recommendation.hold * 3,
            sell: recommendation.sell * 2,
            strongSell: recommendation.strongSell * 1
        };

        const totalScore = scores.strongBuy + scores.buy + scores.hold + scores.sell + scores.strongSell;
        const totalAnalysts = recommendation.strongBuy + recommendation.buy + recommendation.hold + recommendation.sell + recommendation.strongSell;

        if (totalAnalysts === 0) return 'N/A';

        const avgScore = totalScore / totalAnalysts;

        if (avgScore >= 4.5) return 'Strong Buy';
        if (avgScore >= 3.5) return 'Buy';
        if (avgScore >= 2.5) return 'Hold';
        if (avgScore >= 1.5) return 'Sell';
        return 'Strong Sell';
    }

    // ============================================
    // UTILITAIRES
    // ============================================
    
    getCompanySymbolMapping() {
        return {
            'nvidia': 'NVDA',
            'apple': 'AAPL',
            'microsoft': 'MSFT',
            'google': 'GOOGL',
            'alphabet': 'GOOGL',
            'amazon': 'AMZN',
            'tesla': 'TSLA',
            'meta': 'META',
            'facebook': 'META',
            'netflix': 'NFLX',
            'amd': 'AMD',
            'intel': 'INTC',
            'coinbase': 'COIN',
            'paypal': 'PYPL',
            'visa': 'V',
            'mastercard': 'MA',
            'jpmorgan': 'JPM',
            'disney': 'DIS',
            'walmart': 'WMT',
            'nike': 'NKE',
            'starbucks': 'SBUX',
            'boeing': 'BA',
            'caterpillar': 'CAT'
        };
    }

    getOutputSize(timeframe) {
        const sizes = {
            '1d': 24, '1w': 7, '1M': 30, '3M': 90, '6M': 180,
            '1y': 365, '2y': 730, '5y': 1825, '10y': 3650,
            'ytd': 250, 'max': 5000
        };
        return sizes[timeframe] || 365;
    }

    checkCache(message) {
        const cacheKey = message.toLowerCase().trim().replace(/\s+/g, '_').substring(0, 100);
        const cached = this.responseCache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < this.cacheExpiration) {
            return cached.response;
        }
        
        return null;
    }

    cacheResponse(message, response) {
        const cacheKey = message.toLowerCase().trim().replace(/\s+/g, '_').substring(0, 100);
        this.responseCache.set(cacheKey, {
            response: response,
            timestamp: Date.now()
        });
        
        if (this.responseCache.size > 50) {
            const firstKey = this.responseCache.keys().next().value;
            this.responseCache.delete(firstKey);
        }
    }

    updateConversationContext(analysis) {
        if (analysis.symbols.length > 0) {
            this.conversationContext.lastSymbol = analysis.symbols[0];
        }
        
        if (analysis.timeframes.length > 0) {
            this.conversationContext.lastTimeframe = analysis.timeframes[0];
        }
        
        this.conversationContext.lastTopic = analysis.type;
    }

    updateMetrics(success, responseTime) {
        if (success) {
            this.metrics.successfulResponses++;
        } else {
            this.metrics.errors++;
        }
        
        this.metrics.totalResponseTime += responseTime;
        this.metrics.averageResponseTime = 
            this.metrics.totalResponseTime / this.metrics.totalMessages;
    }

    getMetrics() {
        return {
            ...this.metrics,
            successRate: this.metrics.totalMessages > 0 
                ? (this.metrics.successfulResponses / this.metrics.totalMessages * 100).toFixed(2) + '%'
                : '0%',
            averageResponseTime: this.metrics.averageResponseTime.toFixed(2) + 'ms'
        };
    }

    clearCache() {
        this.responseCache.clear();
        console.log('Cache cleared');
    }

    clearHistory() {
        if (this.geminiAI) {
            this.geminiAI.clearHistory();
        }
        this.conversationContext = {
            lastSymbol: null,
            lastTimeframe: '1y',
            lastTopic: null,
            userPreferences: {}
        };
        console.log('Conversation context cleared');
    }

    reset() {
        this.clearCache();
        this.clearHistory();
        this.metrics = {
            totalMessages: 0,
            successfulResponses: 0,
            errors: 0,
            averageResponseTime: 0,
            totalResponseTime: 0
        };
        console.log('Engine reset');
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = FinancialChatbotEngine;
}

window.FinancialChatbotEngine = FinancialChatbotEngine;