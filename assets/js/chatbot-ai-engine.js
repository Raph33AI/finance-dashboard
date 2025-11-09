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
        
        // Message queue for processing
        this.messageQueue = [];
        this.isProcessing = false;
        
        // Context management
        this.currentContext = {
            topic: null,
            symbol: null,
            lastIntent: null,
            userPreferences: {}
        };
        
        // Performance metrics
        this.metrics = {
            totalMessages: 0,
            successfulResponses: 0,
            errors: 0,
            averageResponseTime: 0,
            totalResponseTime: 0
        };
        
        // Cache for frequent queries
        this.responseCache = new Map();
        this.cacheExpiration = 300000; // 5 minutes
        
        this.initialize();
    }

    // ============================================
    // INITIALIZATION
    // ============================================
    async initialize() {
        try {
            // Initialize Gemini AI
            if (typeof GeminiAI !== 'undefined') {
                this.geminiAI = new GeminiAI(this.config);
                console.log('✅ Gemini AI initialized');
            }

            // Initialize IPO Analyzer
            if (typeof IPOAnalyzer !== 'undefined') {
                this.ipoAnalyzer = new IPOAnalyzer(this.config);
                console.log('✅ IPO Analyzer initialized');
            }

            // Initialize Analytics
            if (typeof FinancialAnalytics !== 'undefined') {
                this.analytics = new FinancialAnalytics(this.config);
                console.log('✅ Analytics initialized');
            }

            // Initialize Charts
            if (typeof ChatbotCharts !== 'undefined') {
                this.charts = new ChatbotCharts(this.config);
                console.log('✅ Charts initialized');
            }

            console.log('🚀 Financial Chatbot Engine ready!');
            
        } catch (error) {
            console.error('❌ Engine initialization error:', error);
        }
    }

    // ============================================
    // PROCESS USER MESSAGE
    // ============================================
    async processMessage(userMessage) {
        const startTime = performance.now();
        
        try {
            this.metrics.totalMessages++;

            // Check cache first
            const cachedResponse = this.checkCache(userMessage);
            if (cachedResponse) {
                console.log('📦 Returning cached response');
                return cachedResponse;
            }

            // Detect intent and extract entities
            const intent = this.detectIntent(userMessage);
            const entities = this.extractEntities(userMessage);

            // Build context
            const context = await this.buildContext(intent, entities);

            // Route to appropriate handler
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
                    
                case 'GENERAL_FINANCE':
                    response = await this.handleGeneralQuery(userMessage, context);
                    break;
                    
                default:
                    response = await this.handleGenericQuery(userMessage, context);
            }

            // Add metadata
            response.intent = intent;
            response.entities = entities;
            response.processingTime = performance.now() - startTime;

            // Cache response
            this.cacheResponse(userMessage, response);

            // Update metrics
            this.updateMetrics(true, response.processingTime);

            // Update context
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
    // INTENT DETECTION
    // ============================================
    detectIntent(message) {
        const lowerMessage = message.toLowerCase();
        
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
    // ENTITY EXTRACTION
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

        // Extract stock symbols (1-5 uppercase letters)
        const symbolRegex = /\b[A-Z]{1,5}\b/g;
        const symbols = message.match(symbolRegex) || [];
        entities.symbols = symbols.filter(s => 
            s.length >= 1 && s.length <= 5 && !['IPO', 'USA', 'CEO', 'CFO', 'AI'].includes(s)
        );

        // Extract timeframes
        const timeframePatterns = {
            '1d': /\b(today|1\s*day)\b/i,
            '1w': /\b(week|1\s*week|7\s*days?)\b/i,
            '1m': /\b(month|1\s*month|30\s*days?)\b/i,
            '3m': /\b(3\s*months?|quarter)\b/i,
            '6m': /\b(6\s*months?|half\s*year)\b/i,
            '1y': /\b(year|1\s*year|12\s*months?)\b/i,
            'ytd': /\b(ytd|year\s*to\s*date)\b/i
        };

        for (const [timeframe, pattern] of Object.entries(timeframePatterns)) {
            if (pattern.test(message)) {
                entities.timeframes.push(timeframe);
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

        // Extract numbers (for price targets, percentages, etc.)
        const numberRegex = /\$?[\d,]+\.?\d*%?/g;
        entities.numbers = message.match(numberRegex) || [];

        return entities;
    }

// ============================================
// BUILD CONTEXT - WITH REAL DATA
// ============================================
async buildContext(intent, entities) {
    const context = {
        intent: intent,
        entities: entities,
        timestamp: Date.now()
    };

    console.log('🔧 Building context with real data...');

    // ✅ ADD STOCK DATA if symbol detected
    if (entities.symbols && entities.symbols.length > 0 && this.analytics) {
        const symbol = entities.symbols[0];
        console.log(`📊 Fetching real data for ${symbol}...`);
        
        try {
            const stockData = await this.analytics.getStockData(symbol);
            if (stockData) {
                context.stockData = stockData;
                console.log(`✅ Real stock data loaded for ${symbol}`);
                console.log(`   Price: $${stockData.quote?.current}`);
            }
            
            // ✅ ALSO GET TIME SERIES for charts
            const timeSeries = await this.analytics.getTimeSeries(symbol, '1day', 30);
            if (timeSeries) {
                context.timeSeriesData = timeSeries;
                console.log(`✅ Time series data loaded (${timeSeries.data.length} points)`);
            }
        } catch (error) {
            console.warn(`⚠️ Could not fetch stock data for ${symbol}:`, error);
        }
    }

    // ✅ ADD MARKET DATA for market queries
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

    // ✅ ADD IPO DATA for IPO queries
    if (intent.type === 'IPO_ANALYSIS' && this.ipoAnalyzer) {
        try {
            context.ipoData = await this.ipoAnalyzer.getTopIPOs(5);
            console.log('✅ IPO data loaded');
        } catch (error) {
            console.warn('⚠️ Could not fetch IPO data:', error);
        }
    }

    console.log('✅ Context built with real data:', Object.keys(context));
    return context;
}

    // ============================================
    // HANDLE IPO QUERY
    // ============================================
    async handleIPOQuery(message, entities, context) {
        console.log('📊 Processing IPO query...');

        let aiResponse = await this.geminiAI.generateResponse(message, context);
        
        // If specific symbol mentioned, analyze it
        if (entities.symbols.length > 0 && this.ipoAnalyzer) {
            const symbol = entities.symbols[0];
            try {
                const ipoAnalysis = await this.ipoAnalyzer.analyzeIPO(symbol);
                
                if (ipoAnalysis) {
                    // Enhance AI response with detailed IPO analysis
                    aiResponse.text += `\n\n📊 **Detailed IPO Analysis for ${symbol}:**\n`;
                    aiResponse.text += this.formatIPOAnalysis(ipoAnalysis);
                    
                    // Add chart request if not already present
                    if (!aiResponse.chartRequests || aiResponse.chartRequests.length === 0) {
                        aiResponse.chartRequests = [{
                            type: 'line',
                            symbol: symbol,
                            data: 'ipo'
                        }];
                    }
                }
            } catch (error) {
                console.warn('IPO analysis failed:', error);
            }
        }

        // Add IPO-specific suggestions
        aiResponse.suggestions = this.config.suggestions.followUp.ipo;

        return aiResponse;
    }

    // ============================================
    // HANDLE STOCK QUERY
    // ============================================
    async handleStockQuery(message, entities, context) {
        console.log('📈 Processing stock query...');

        // Add stock data to context if symbol is present
        if (entities.symbols.length > 0 && this.analytics) {
            const symbol = entities.symbols[0];
            try {
                const stockData = await this.analytics.getStockData(symbol);
                context.stockData = stockData;
            } catch (error) {
                console.warn('Could not fetch stock data:', error);
            }
        }

        const aiResponse = await this.geminiAI.generateResponse(message, context);
        
        // Add stock-specific suggestions
        aiResponse.suggestions = this.config.suggestions.followUp.stock;

        return aiResponse;
    }

    // ============================================
    // HANDLE MARKET QUERY
    // ============================================
    async handleMarketQuery(message, context) {
        console.log('🌐 Processing market query...');

        const aiResponse = await this.geminiAI.generateResponse(message, context);
        
        // Add market chart if not present
        if (!aiResponse.chartRequests || aiResponse.chartRequests.length === 0) {
            aiResponse.chartRequests = [{
                type: 'line',
                symbol: 'SPY', // S&P 500 ETF as market proxy
                data: '1m'
            }];
        }

        // Add market-specific suggestions
        aiResponse.suggestions = this.config.suggestions.followUp.market;

        return aiResponse;
    }

    // ============================================
    // HANDLE TECHNICAL QUERY
    // ============================================
    async handleTechnicalQuery(message, entities, context) {
        console.log('📊 Processing technical analysis query...');

        const aiResponse = await this.geminiAI.generateResponse(message, context);
        
        // Ensure candlestick chart for technical analysis
        if (entities.symbols.length > 0) {
            const symbol = entities.symbols[0];
            const timeframe = entities.timeframes[0] || '3m';
            
            aiResponse.chartRequests = [{
                type: 'candlestick',
                symbol: symbol,
                data: timeframe,
                indicators: ['sma', 'rsi', 'macd'] // Add technical indicators
            }];
        }

        return aiResponse;
    }

    // ============================================
    // HANDLE GENERAL FINANCE QUERY
    // ============================================
    async handleGeneralQuery(message, context) {
        console.log('💡 Processing general finance query...');

        const aiResponse = await this.geminiAI.generateResponse(message, context);
        
        // Add initial suggestions for follow-up
        aiResponse.suggestions = this.config.suggestions.initial;

        return aiResponse;
    }

    // ============================================
    // HANDLE GENERIC QUERY
    // ============================================
    async handleGenericQuery(message, context) {
        console.log('🤔 Processing generic query...');

        const aiResponse = await this.geminiAI.generateResponse(message, context);
        
        // Add initial suggestions
        aiResponse.suggestions = this.config.suggestions.initial;

        return aiResponse;
    }

    // ============================================
    // FORMAT IPO ANALYSIS
    // ============================================
    formatIPOAnalysis(analysis) {
        let formatted = '';
        
        formatted += `**Overall Score:** ${analysis.score}/100 `;
        formatted += analysis.score >= 75 ? '🌟 (High Potential)\n' : 
                     analysis.score >= 60 ? '⭐ (Medium Potential)\n' : 
                     '⚠️ (Lower Potential)\n';
        
        formatted += `\n**Score Breakdown:**\n`;
        formatted += `• Financial Health: ${analysis.breakdown.financial}/100\n`;
        formatted += `• Market Position: ${analysis.breakdown.market}/100\n`;
        formatted += `• Valuation: ${analysis.breakdown.valuation}/100\n`;
        formatted += `• Growth Potential: ${analysis.breakdown.growth}/100\n`;
        formatted += `• Market Momentum: ${analysis.breakdown.momentum}/100\n`;
        
        if (analysis.strengths && analysis.strengths.length > 0) {
            formatted += `\n**Key Strengths:**\n`;
            analysis.strengths.forEach(s => formatted += `✓ ${s}\n`);
        }
        
        if (analysis.risks && analysis.risks.length > 0) {
            formatted += `\n**Key Risks:**\n`;
            analysis.risks.forEach(r => formatted += `⚠️ ${r}\n`);
        }
        
        return formatted;
    }

    // ============================================
    // UTILITY: PATTERN MATCHING
    // ============================================
    matchesPattern(text, patterns) {
        return patterns.some(pattern => text.includes(pattern));
    }

    // ============================================
    // CACHE MANAGEMENT
    // ============================================
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
        
        // Cleanup old cache entries
        if (this.responseCache.size > 100) {
            const firstKey = this.responseCache.keys().next().value;
            this.responseCache.delete(firstKey);
        }
    }

    getCacheKey(message) {
        return message.toLowerCase().trim().replace(/\s+/g, '_');
    }

    // ============================================
    // CONTEXT MANAGEMENT
    // ============================================
    updateContext(intent, entities) {
        this.currentContext.lastIntent = intent.type;
        
        if (entities.symbols.length > 0) {
            this.currentContext.symbol = entities.symbols[0];
        }
        
        if (intent.type === 'IPO_ANALYSIS') {
            this.currentContext.topic = 'ipo';
        } else if (intent.type === 'STOCK_ANALYSIS') {
            this.currentContext.topic = 'stock';
        } else if (intent.type === 'MARKET_OVERVIEW') {
            this.currentContext.topic = 'market';
        }
    }

    // ============================================
    // METRICS
    // ============================================
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

    // ============================================
    // CLEAR DATA
    // ============================================
    clearCache() {
        this.responseCache.clear();
        console.log('🧹 Cache cleared');
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
        console.log('🧹 History cleared');
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
        console.log('🔄 Engine reset');
    }
}

// ============================================
// EXPORT
// ============================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FinancialChatbotEngine;
}