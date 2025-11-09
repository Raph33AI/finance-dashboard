// ============================================
// FINANCIAL CHATBOT - AI ENGINE PREMIUM
// Core Intelligence & Orchestration
// ============================================

class FinancialChatbotEngine {
    constructor(config) {
        this.config = config;
        this.geminiAI = null;
        this.ipoAnalyzer = null;
        this.analytics = null;
        this.charts = null;
        
        this.messageQueue = [];
        this.isProcessing = false;
        
        this.currentContext = {
            topic: null,
            symbol: null,
            lastIntent: null,
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
        this.cacheExpiration = 300000;
        
        this.initialize();
    }

    async initialize() {
        try {
            if (typeof GeminiAI !== 'undefined') {
                this.geminiAI = new GeminiAI(this.config);
                console.log('✅ Gemini AI initialized');
            }

            if (typeof IPOAnalyzer !== 'undefined') {
                this.ipoAnalyzer = new IPOAnalyzer(this.config);
                console.log('✅ IPO Analyzer initialized');
            }

            if (typeof FinancialAnalytics !== 'undefined') {
                this.analytics = new FinancialAnalytics(this.config);
                console.log('✅ Analytics initialized');
            }

            if (typeof ChatbotCharts !== 'undefined') {
                this.charts = new ChatbotCharts(this.config);
                console.log('✅ Charts initialized');
            }

            console.log('🚀 Financial Chatbot Engine ready!');
            
        } catch (error) {
            console.error('❌ Engine initialization error:', error);
        }
    }

    async processMessage(userMessage) {
        const startTime = performance.now();
        
        try {
            this.metrics.totalMessages++;

            const cachedResponse = this.checkCache(userMessage);
            if (cachedResponse) {
                console.log('📦 Returning cached response');
                return cachedResponse;
            }

            const intent = this.detectIntent(userMessage);
            const entities = this.extractEntities(userMessage);

            console.log('🎯 Intent detected:', intent.type);
            console.log('🔍 Entities extracted:', entities);

            const context = await this.buildContext(intent, entities);

            let response;
            switch (intent.type) {
                case 'IPO_ANALYSIS':
                    response = await this.handleIPOQuery(userMessage, entities, context);
                    break;
                    
                case 'STOCK_ANALYSIS':
                    response = await this.handleStockQuery(userMessage, entities, context);
                    break;
                    
                case 'MARKET_OVERVIEW':
                    response = await this.handleMarketQuery(userMessage, context);
                    break;
                    
                case 'TECHNICAL_ANALYSIS':
                    response = await this.handleTechnicalQuery(userMessage, entities, context);
                    break;
                    
                case 'PRICE_HISTORY':
                    response = await this.handlePriceHistoryQuery(userMessage, entities, context);
                    break;
                    
                case 'GENERAL_FINANCE':
                    response = await this.handleGeneralQuery(userMessage, context);
                    break;
                    
                default:
                    response = await this.handleGenericQuery(userMessage, context);
            }

            response.intent = intent;
            response.entities = entities;
            response.processingTime = performance.now() - startTime;

            this.cacheResponse(userMessage, response);
            this.updateMetrics(true, response.processingTime);
            this.updateContext(intent, entities);

            return response;

        } catch (error) {
            console.error('❌ Message processing error:', error);
            this.updateMetrics(false, performance.now() - startTime);
            
            return {
                text: this.config.errors.messages.unknown,
                error: true,
                chartRequests: [],
                suggestions: []
            };
        }
    }

    // ============================================
    // INTENT DETECTION - AMÉLIORÉ
    // ============================================
    detectIntent(message) {
        const lowerMessage = message.toLowerCase();
        
        // ✅ DÉTECTER LES REQUÊTES D'ÉVOLUTION/HISTORIQUE
        if (this.matchesPattern(lowerMessage, [
            'evolution', 'historical', 'history', 'performance', 
            'over the', 'past', 'last', 'since', 'trend',
            'chart', 'graph', 'show me', 'display'
        ]) && this.matchesPattern(lowerMessage, [
            'year', 'month', 'week', 'day', 'period'
        ])) {
            return { type: 'PRICE_HISTORY', confidence: 0.95 };
        }

        // IPO related
        if (this.matchesPattern(lowerMessage, [
            'ipo', 'initial public offering', 'newly listed', 'recent listing',
            'going public', 'public offering', 'upcoming ipo'
        ])) {
            return { type: 'IPO_ANALYSIS', confidence: 0.9 };
        }

        // Stock analysis
        if (this.matchesPattern(lowerMessage, [
            'analyze', 'stock', 'share', 'ticker', 'company',
            'valuation', 'fundamental', 'earnings'
        ]) || /\b[A-Z]{1,5}\b/.test(message)) {
            return { type: 'STOCK_ANALYSIS', confidence: 0.85 };
        }

        // Market overview
        if (this.matchesPattern(lowerMessage, [
            'market', 'indices', 'dow', 'nasdaq', 's&p', 'sp500',
            'market overview', 'market summary', 'market today'
        ])) {
            return { type: 'MARKET_OVERVIEW', confidence: 0.88 };
        }

        // Technical analysis
        if (this.matchesPattern(lowerMessage, [
            'chart', 'technical', 'rsi', 'macd', 'moving average',
            'support', 'resistance', 'trend', 'pattern', 'indicator'
        ])) {
            return { type: 'TECHNICAL_ANALYSIS', confidence: 0.87 };
        }

        // General finance
        if (this.matchesPattern(lowerMessage, [
            'what is', 'explain', 'define', 'how does', 'tell me about',
            'p/e ratio', 'eps', 'dividend', 'beta', 'portfolio'
        ])) {
            return { type: 'GENERAL_FINANCE', confidence: 0.75 };
        }

        return { type: 'GENERIC', confidence: 0.5 };
    }

    // ============================================
    // ENTITY EXTRACTION - AMÉLIORÉ
    // ============================================
    extractEntities(message) {
        const entities = {
            symbols: [],
            companies: [],
            sectors: [],
            timeframes: [],
            metrics: [],
            numbers: []
        };

        // Extract stock symbols
        const symbolRegex = /\b[A-Z]{1,5}\b/g;
        const symbols = message.match(symbolRegex) || [];
        entities.symbols = symbols.filter(s => 
            s.length >= 1 && s.length <= 5 && !['IPO', 'USA', 'CEO', 'CFO', 'AI', 'THE'].includes(s)
        );

        // ✅ EXTRACTION AMÉLIORÉE DES PÉRIODES
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

        for (const [timeframe, pattern] of Object.entries(timeframePatterns)) {
            if (pattern.test(message)) {
                entities.timeframes.push(timeframe);
            }
        }

        // Si aucune période détectée mais mot-clé temporel présent
        if (entities.timeframes.length === 0) {
            if (/\b(last|past|previous|over|since)\b/i.test(message)) {
                entities.timeframes.push('1y'); // Par défaut 1 an
            }
        }

        // Extract metrics
        const metricPatterns = [
            'p/e', 'pe ratio', 'price to earnings',
            'eps', 'earnings per share',
            'revenue', 'sales',
            'profit', 'net income',
            'margin', 'profit margin',
            'debt', 'debt to equity',
            'roe', 'return on equity',
            'market cap', 'market capitalization',
            'dividend', 'dividend yield',
            'volume', 'trading volume'
        ];

        metricPatterns.forEach(metric => {
            if (message.toLowerCase().includes(metric)) {
                entities.metrics.push(metric);
            }
        });

        const numberRegex = /\$?[\d,]+\.?\d*%?/g;
        entities.numbers = message.match(numberRegex) || [];

        return entities;
    }

    // ============================================
    // BUILD CONTEXT - AVEC DONNÉES RÉELLES
    // ============================================
    async buildContext(intent, entities) {
        const context = {
            intent: intent,
            entities: entities,
            timestamp: Date.now()
        };

        console.log('🔧 Building context with real data...');

        // ✅ CHARGER LES DONNÉES DE STOCK
        if (entities.symbols && entities.symbols.length > 0 && this.analytics) {
            const symbol = entities.symbols[0];
            console.log(`📊 Fetching real data for ${symbol}...`);
            
            try {
                // Données en temps réel
                const stockData = await this.analytics.getStockData(symbol);
                if (stockData) {
                    context.stockData = stockData;
                    console.log(`✅ Real stock data loaded for ${symbol}`);
                    console.log(`   Price: $${stockData.quote?.current}`);
                }
                
                // ✅ DONNÉES HISTORIQUES (si période demandée)
                if (entities.timeframes && entities.timeframes.length > 0) {
                    const timeframe = entities.timeframes[0];
                    const outputsize = this.getOutputSize(timeframe);
                    
                    console.log(`📈 Fetching ${timeframe} time series (${outputsize} points)...`);
                    
                    const timeSeries = await this.analytics.getTimeSeries(symbol, '1day', outputsize);
                    if (timeSeries) {
                        context.timeSeriesData = timeSeries;
                        console.log(`✅ Time series loaded: ${timeSeries.data.length} data points`);
                    }
                }
                
            } catch (error) {
                console.warn(`⚠️ Could not fetch stock data for ${symbol}:`, error);
            }
        }

        // ✅ DONNÉES DE MARCHÉ
        if (intent.type === 'MARKET_OVERVIEW' && this.analytics) {
            console.log('🌐 Fetching market overview...');
            try {
                const marketData = await this.analytics.getMarketOverview();
                if (marketData) {
                    context.marketData = marketData;
                    console.log('✅ Market overview loaded');
                }
            } catch (error) {
                console.warn('⚠️ Could not fetch market data:', error);
            }
        }

        // ✅ DONNÉES IPO
        if (intent.type === 'IPO_ANALYSIS' && this.ipoAnalyzer) {
            try {
                context.ipoData = await this.ipoAnalyzer.getTopIPOs(5);
                console.log('✅ IPO data loaded');
            } catch (error) {
                console.warn('⚠️ Could not fetch IPO data:', error);
            }
        }

        console.log('✅ Context built:', Object.keys(context));
        return context;
    }

    // ============================================
    // CALCULER LA TAILLE DE SORTIE SELON LA PÉRIODE
    // ============================================
    getOutputSize(timeframe) {
        const sizes = {
            '1d': 24,
            '1w': 7,
            '1M': 30,
            '3M': 90,
            '6M': 180,
            '1y': 365,
            '2y': 730,
            '5y': 1825,
            '10y': 3650,
            'ytd': 250,
            'max': 5000
        };
        return sizes[timeframe] || 365;
    }

    // ============================================
    // HANDLE PRICE HISTORY QUERY (NOUVEAU)
    // ============================================
    async handlePriceHistoryQuery(message, entities, context) {
        console.log('📈 Processing price history query...');

        const aiResponse = await this.geminiAI.generateResponse(message, context);
        
        // ✅ FORCER LA GÉNÉRATION DE GRAPHIQUE
        if (entities.symbols && entities.symbols.length > 0) {
            const symbol = entities.symbols[0];
            const timeframe = entities.timeframes[0] || '1y';
            
            // Si l'IA n'a pas demandé de graphique, on l'ajoute
            if (!aiResponse.chartRequests || aiResponse.chartRequests.length === 0) {
                aiResponse.chartRequests = [{
                    type: 'line',
                    symbol: symbol,
                    data: timeframe,
                    indicators: ['sma']
                }];
                console.log(`📊 Chart request added: ${symbol} ${timeframe}`);
            }
        }

        aiResponse.suggestions = [
            "Show technical indicators",
            "Compare with S&P 500",
            "Analyze volatility",
            "Show volume trends"
        ];

        return aiResponse;
    }

    // ============================================
    // HANDLE STOCK QUERY
    // ============================================
    async handleStockQuery(message, entities, context) {
        console.log('📈 Processing stock query...');

        const aiResponse = await this.geminiAI.generateResponse(message, context);
        
        aiResponse.suggestions = this.config.suggestions.followUp.stock;

        return aiResponse;
    }

    // ============================================
    // HANDLE MARKET QUERY
    // ============================================
    async handleMarketQuery(message, context) {
        console.log('🌐 Processing market query...');

        const aiResponse = await this.geminiAI.generateResponse(message, context);
        
        if (!aiResponse.chartRequests || aiResponse.chartRequests.length === 0) {
            aiResponse.chartRequests = [{
                type: 'line',
                symbol: 'SPY',
                data: '1M'
            }];
        }

        aiResponse.suggestions = this.config.suggestions.followUp.market;

        return aiResponse;
    }

    // ============================================
    // HANDLE TECHNICAL QUERY
    // ============================================
    async handleTechnicalQuery(message, entities, context) {
        console.log('📊 Processing technical analysis query...');

        const aiResponse = await this.geminiAI.generateResponse(message, context);
        
        if (entities.symbols && entities.symbols.length > 0) {
            const symbol = entities.symbols[0];
            const timeframe = entities.timeframes[0] || '3M';
            
            aiResponse.chartRequests = [{
                type: 'line',
                symbol: symbol,
                data: timeframe,
                indicators: ['sma', 'rsi']
            }];
        }

        return aiResponse;
    }

    // ============================================
    // HANDLE IPO QUERY
    // ============================================
    async handleIPOQuery(message, entities, context) {
        console.log('📊 Processing IPO query...');

        let aiResponse = await this.geminiAI.generateResponse(message, context);
        
        if (entities.symbols.length > 0 && this.ipoAnalyzer) {
            const symbol = entities.symbols[0];
            try {
                const ipoAnalysis = await this.ipoAnalyzer.analyzeIPO(symbol);
                
                if (ipoAnalysis) {
                    aiResponse.text += `\n\n📊 **Detailed IPO Analysis for ${symbol}:**\n`;
                    aiResponse.text += this.formatIPOAnalysis(ipoAnalysis);
                    
                    if (!aiResponse.chartRequests || aiResponse.chartRequests.length === 0) {
                        aiResponse.chartRequests = [{
                            type: 'line',
                            symbol: symbol,
                            data: '6M'
                        }];
                    }
                }
            } catch (error) {
                console.warn('IPO analysis failed:', error);
            }
        }

        aiResponse.suggestions = this.config.suggestions.followUp.ipo;

        return aiResponse;
    }

    // ============================================
    // HANDLE GENERAL QUERY
    // ============================================
    async handleGeneralQuery(message, context) {
        console.log('💡 Processing general finance query...');

        const aiResponse = await this.geminiAI.generateResponse(message, context);
        aiResponse.suggestions = this.config.suggestions.initial;

        return aiResponse;
    }

    // ============================================
    // HANDLE GENERIC QUERY
    // ============================================
    async handleGenericQuery(message, context) {
        console.log('🤔 Processing generic query...');

        const aiResponse = await this.geminiAI.generateResponse(message, context);
        aiResponse.suggestions = this.config.suggestions.initial;

        return aiResponse;
    }

    formatIPOAnalysis(analysis) {
        let formatted = '';
        
        formatted += `**Overall Score:** ${analysis.score}/100 `;
        formatted += analysis.score >= 75 ? '🌟 (High Potential)\n' : 
                     analysis.score >= 60 ? '⭐ (Medium Potential)\n' : 
                     '⚠️ (Lower Potential)\n';
        
        if (analysis.breakdown) {
            formatted += `\n**Score Breakdown:**\n`;
            formatted += `• Financial: ${analysis.breakdown.financial}/100\n`;
            formatted += `• Market: ${analysis.breakdown.market}/100\n`;
            formatted += `• Valuation: ${analysis.breakdown.valuation}/100\n`;
            formatted += `• Growth: ${analysis.breakdown.growth}/100\n`;
            formatted += `• Momentum: ${analysis.breakdown.momentum}/100\n`;
        }
        
        if (analysis.strengths && analysis.strengths.length > 0) {
            formatted += `\n**Strengths:**\n`;
            analysis.strengths.forEach(s => formatted += `✓ ${s}\n`);
        }
        
        if (analysis.risks && analysis.risks.length > 0) {
            formatted += `\n**Risks:**\n`;
            analysis.risks.forEach(r => formatted += `⚠️ ${r}\n`);
        }
        
        return formatted;
    }

    matchesPattern(text, patterns) {
        return patterns.some(pattern => text.includes(pattern));
    }

    checkCache(message) {
        const cacheKey = this.getCacheKey(message);
        const cached = this.responseCache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < this.cacheExpiration) {
            return cached.response;
        }
        
        return null;
    }

    cacheResponse(message, response) {
        const cacheKey = this.getCacheKey(message);
        this.responseCache.set(cacheKey, {
            response: response,
            timestamp: Date.now()
        });
        
        if (this.responseCache.size > 100) {
            const firstKey = this.responseCache.keys().next().value;
            this.responseCache.delete(firstKey);
        }
    }

    getCacheKey(message) {
        return message.toLowerCase().trim().replace(/\s+/g, '_');
    }

    updateContext(intent, entities) {
        this.currentContext.lastIntent = intent.type;
        
        if (entities.symbols.length > 0) {
            this.currentContext.symbol = entities.symbols[0];
        }
        
        if (intent.type === 'IPO_ANALYSIS') {
            this.currentContext.topic = 'ipo';
        } else if (intent.type === 'STOCK_ANALYSIS' || intent.type === 'PRICE_HISTORY') {
            this.currentContext.topic = 'stock';
        } else if (intent.type === 'MARKET_OVERVIEW') {
            this.currentContext.topic = 'market';
        }
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
    }

    clearHistory() {
        if (this.geminiAI) {
            this.geminiAI.clearHistory();
        }
        this.currentContext = {
            topic: null,
            symbol: null,
            lastIntent: null,
            userPreferences: {}
        };
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
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = FinancialChatbotEngine;
}