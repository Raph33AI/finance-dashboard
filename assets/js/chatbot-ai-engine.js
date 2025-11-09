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

            // ✅ AJOUTER LE MESSAGE AU CONTEXTE
            const context = await this.buildContext(intent, entities);
            context.userMessage = userMessage; // ← AJOUTER CETTE LIGNE

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
    // INTENT DETECTION - VERSION AMÉLIORÉE
    // ============================================
    detectIntent(message) {
        const lowerMessage = message.toLowerCase();
        
        // ✅ DÉTECTER REQUÊTES HISTORIQUES/ÉVOLUTION
        const historyKeywords = ['evolution', 'historical', 'history', 'performance', 
                                'over the', 'past', 'last', 'since', 'trend',
                                'chart', 'graph', 'show me', 'display'];
        
        const periodKeywords = ['year', 'month', 'week', 'day', 'period', 'time'];
        
        const hasHistoryKeyword = historyKeywords.some(kw => lowerMessage.includes(kw));
        const hasPeriodKeyword = periodKeywords.some(kw => lowerMessage.includes(kw));
        
        // ✅ Détection symbole (même minuscule)
        const hasSymbol = /\b(nvda|aapl|msft|googl|amzn|tsla|meta|stock|share|ticker)\b/i.test(message);
        
        if (hasHistoryKeyword && (hasPeriodKeyword || hasSymbol)) {
            console.log('✅ PRICE_HISTORY intent detected');
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
            'valuation', 'fundamental', 'earnings', 'price'
        ]) || /\b[A-Z]{1,5}\b/.test(message) || hasSymbol) {
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
            'technical', 'rsi', 'macd', 'moving average',
            'support', 'resistance', 'pattern', 'indicator'
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
    // ENTITY EXTRACTION - AMÉLIORÉ AVEC MINUSCULES
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

        // ✅ EXTRACTION SYMBOLES AMÉLIORÉE (majuscules ET minuscules)
        
        // Méthode 1: Symboles en MAJUSCULES dans le message
        const upperSymbolRegex = /\b[A-Z]{1,5}\b/g;
        const upperSymbols = message.match(upperSymbolRegex) || [];
        const validUpperSymbols = upperSymbols.filter(s => 
            s.length >= 1 && s.length <= 5 && !['IPO', 'USA', 'CEO', 'CFO', 'AI', 'THE', 'AND', 'FOR', 'NOT'].includes(s)
        );
        
        // Méthode 2: Chercher des symboles connus (même en minuscules)
        const knownStocks = [
            'NVDA', 'AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'TSLA', 'META', 'NFLX',
            'AMD', 'INTC', 'QCOM', 'AVGO', 'TXN', 'AMAT', 'MU', 'LRCX', 'KLAC',
            'SPY', 'QQQ', 'DIA', 'IWM', 'VTI', 'VOO',
            'COIN', 'SQ', 'PYPL', 'V', 'MA', 'JPM', 'BAC', 'GS', 'MS',
            'DIS', 'CMCSA', 'T', 'VZ', 'TMUS',
            'BA', 'CAT', 'DE', 'GE', 'HON', 'MMM', 'RTX', 'UPS',
            'XOM', 'CVX', 'COP', 'SLB', 'OXY',
            'PFE', 'JNJ', 'UNH', 'ABBV', 'TMO', 'DHR', 'LLY', 'MRK',
            'WMT', 'HD', 'MCD', 'NKE', 'SBUX', 'TGT', 'LOW', 'COST'
        ];
        
        const lowerMessage = message.toLowerCase();
        const foundKnownSymbols = knownStocks.filter(symbol => {
            const lowerSymbol = symbol.toLowerCase();
            // Chercher le symbole avec des délimiteurs de mots
            const regex = new RegExp(`\\b${lowerSymbol}\\b`, 'i');
            return regex.test(lowerMessage);
        });
        
        // Méthode 3: Pattern "stock [SYMBOL]" ou "[SYMBOL] stock"
        const stockPatternRegex = /(?:stock\s+|share\s+|ticker\s+)([a-z]{1,5})\b|\b([a-z]{1,5})(?:\s+stock|\s+share|\s+ticker)/gi;
        let match;
        const patternSymbols = [];
        while ((match = stockPatternRegex.exec(message)) !== null) {
            const symbol = (match[1] || match[2]).toUpperCase();
            if (symbol.length >= 1 && symbol.length <= 5) {
                patternSymbols.push(symbol);
            }
        }
        
        // ✅ COMBINER TOUTES LES MÉTHODES (en supprimant les doublons)
        const allSymbols = [...new Set([
            ...validUpperSymbols,
            ...foundKnownSymbols,
            ...patternSymbols
        ])];
        
        entities.symbols = allSymbols;
        
        console.log('🔍 Symbol detection:');
        console.log('   Upper symbols:', validUpperSymbols);
        console.log('   Known stocks found:', foundKnownSymbols);
        console.log('   Pattern matches:', patternSymbols);
        console.log('   ✅ Final symbols:', allSymbols);

        // ✅ EXTRACTION PÉRIODES (inchangé mais optimisé)
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

        // Détection implicite de période
        if (entities.timeframes.length === 0) {
            if (/\b(evolution|historical|history|performance|trend)\b/i.test(message)) {
                entities.timeframes.push('1y'); // Défaut 1 an
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
    // BUILD CONTEXT - VERSION ULTRA-DEBUGGÉE
    // ============================================
    async buildContext(intent, entities) {
        const context = {
            intent: intent,
            entities: entities,
            timestamp: Date.now()
        };

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔧 BUILDING CONTEXT');
        console.log('Intent:', intent.type);
        console.log('Entities:', entities);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        // ✅ CHARGER LES DONNÉES POUR TOUTE REQUÊTE AVEC SYMBOLE
        if (entities.symbols && entities.symbols.length > 0 && this.analytics) {
            const symbol = entities.symbols[0];
            console.log(`\n📊 Symbol detected: ${symbol}`);
            
            try {
                // 1. DONNÉES EN TEMPS RÉEL
                console.log(`   ⏳ Fetching real-time quote...`);
                const stockData = await this.analytics.getStockData(symbol);
                
                if (stockData) {
                    context.stockData = stockData;
                    console.log(`   ✅ Real-time quote loaded`);
                    console.log(`      Price: $${stockData.quote?.current}`);
                    console.log(`      Source: ${stockData.dataSource}`);
                } else {
                    console.warn(`   ⚠️ No stock data returned`);
                }
                
                // 2. DONNÉES HISTORIQUES (TOUJOURS CHARGER SI SYMBOLE PRÉSENT)
                let timeframe = '1y'; // Défaut
                let outputsize = 365; // Défaut
                
                // Détecter la période demandée
                if (entities.timeframes && entities.timeframes.length > 0) {
                    timeframe = entities.timeframes[0];
                    outputsize = this.getOutputSize(timeframe);
                    console.log(`   📅 Timeframe detected: ${timeframe} (${outputsize} points)`);
                } else {
                    // ✅ CHERCHER DANS LE MESSAGE DIRECTEMENT
                    const message = context.userMessage || '';
                    if (message.toLowerCase().includes('5 year')) {
                        timeframe = '5y';
                        outputsize = 1825;
                    } else if (message.toLowerCase().includes('2 year')) {
                        timeframe = '2y';
                        outputsize = 730;
                    } else if (message.toLowerCase().includes('10 year')) {
                        timeframe = '10y';
                        outputsize = 3650;
                    }
                    console.log(`   📅 Timeframe inferred: ${timeframe} (${outputsize} points)`);
                }
                
                console.log(`   ⏳ Fetching time series data...`);
                const timeSeries = await this.analytics.getTimeSeries(symbol, '1day', outputsize);
                
                if (timeSeries && timeSeries.data && timeSeries.data.length > 0) {
                    context.timeSeriesData = timeSeries;
                    console.log(`   ✅ Time series loaded!`);
                    console.log(`      Data points: ${timeSeries.data.length}`);
                    console.log(`      From: ${timeSeries.data[0]?.datetime}`);
                    console.log(`      To: ${timeSeries.data[timeSeries.data.length - 1]?.datetime}`);
                    console.log(`      Source: ${timeSeries.dataSource}`);
                    
                    // ✅ STATS POUR GEMINI
                    const prices = timeSeries.data.map(d => d.close);
                    const firstPrice = prices[0];
                    const lastPrice = prices[prices.length - 1];
                    const minPrice = Math.min(...prices);
                    const maxPrice = Math.max(...prices);
                    const totalReturn = ((lastPrice - firstPrice) / firstPrice * 100).toFixed(2);
                    
                    context.historicalStats = {
                        firstPrice: firstPrice,
                        lastPrice: lastPrice,
                        minPrice: minPrice,
                        maxPrice: maxPrice,
                        totalReturn: totalReturn,
                        period: timeframe,
                        dataPoints: timeSeries.data.length
                    };
                    
                    console.log(`   📊 Historical stats calculated:`);
                    console.log(`      First: $${firstPrice} → Last: $${lastPrice}`);
                    console.log(`      Range: $${minPrice} - $${maxPrice}`);
                    console.log(`      Total Return: ${totalReturn}%`);
                } else {
                    console.warn(`   ⚠️ No time series data returned`);
                }
                
            } catch (error) {
                console.error(`   ❌ Error fetching data for ${symbol}:`, error);
            }
        } else {
            console.log(`\n⚠️ No symbol detected or analytics not available`);
        }

        // ✅ DONNÉES DE MARCHÉ
        if (intent.type === 'MARKET_OVERVIEW' && this.analytics) {
            console.log('\n🌐 Fetching market overview...');
            try {
                const marketData = await this.analytics.getMarketOverview();
                if (marketData) {
                    context.marketData = marketData;
                    console.log('   ✅ Market overview loaded');
                }
            } catch (error) {
                console.warn('   ⚠️ Could not fetch market data:', error);
            }
        }

        // ✅ DONNÉES IPO
        if (intent.type === 'IPO_ANALYSIS' && this.ipoAnalyzer) {
            console.log('\n📊 Fetching IPO data...');
            try {
                context.ipoData = await this.ipoAnalyzer.getTopIPOs(5);
                console.log('   ✅ IPO data loaded');
            } catch (error) {
                console.warn('   ⚠️ Could not fetch IPO data:', error);
            }
        }

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ CONTEXT BUILD COMPLETE');
        console.log('Context keys:', Object.keys(context));
        console.log('Has stockData:', !!context.stockData);
        console.log('Has timeSeriesData:', !!context.timeSeriesData);
        console.log('Has marketData:', !!context.marketData);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

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