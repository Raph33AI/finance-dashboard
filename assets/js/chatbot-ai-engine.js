/**
 * ═══════════════════════════════════════════════════════════════
 * CHATBOT AI ENGINE - Gemini 2.5 Flash Integration ULTRA
 * ═══════════════════════════════════════════════════════════════
 * Version: 5.0.0 ULTRA
 * Description: Moteur IA principal avec détection d'intentions complète
 * Features:
 *   - 12+ Intent types (IPO, M&A, Insider, Forex, Budget, Investment, Stock)
 *   - Entity extraction avancée (symbols, timeframes, metrics)
 *   - Routing vers 6+ analyseurs spécialisés
 *   - Context management intelligent
 *   - Multi-horizon recommendations
 */

class ChatbotAIEngine {
    constructor(config) {
        this.config = config;
        this.geminiAPI = null;
        this.conversationHistory = [];
        this.currentContext = {
            symbols: [],
            timeframe: '1y',
            metrics: [],
            lastIntent: null
        };
        
        // ✅ Intent keywords mapping (COMPLET)
        this.intentKeywords = {
            // Financial Analysis
            IPO_ANALYSIS: ['ipo', 'initial public offering', 'newly listed', 'recent ipo', 'ipo calendar', 'new listing'],
            MA_ANALYSIS: ['merger', 'acquisition', 'm&a', 'ma', 'takeover', 'buyout', 'deal', 'sec filing'],
            INSIDER_TRADING: ['insider', 'insider trading', 'form 4', 'insider buy', 'insider sell', 'insider transaction', 'corporate insider'],
            FOREX_ANALYSIS: ['forex', 'currency', 'exchange rate', 'fx', 'eur/usd', 'gbp/usd', 'usd/jpy', 'pair', 'cross rate'],
            
            // Portfolio Management
            BUDGET_MANAGEMENT: ['budget', 'expense', 'revenue', 'savings', 'monthly', 'spending', 'income', 'roi', 'portfolio budget', 'financial plan'],
            INVESTMENT_MANAGEMENT: ['portfolio', 'allocation', 'asset', 'diversification', 'rebalance', 'investment strategy', 'asset allocation', 'efficient frontier', 'optimize portfolio', 'risk profile'],
            
            // Stock Analysis
            STOCK_ANALYSIS: ['stock', 'share', 'equity', 'analyze', 'technical analysis', 'fundamental', 'valuation', 'earnings'],
            PRICE_HISTORY: ['price', 'chart', 'historical', 'evolution', 'performance', 'trend', 'last', 'past', 'years'],
            MARKET_OVERVIEW: ['market', 'overview', 'sector', 'index', 'sp500', 'nasdaq', 'dow jones', 'market sentiment'],
            TECHNICAL_ANALYSIS: ['rsi', 'macd', 'bollinger', 'moving average', 'indicator', 'oscillator', 'stochastic', 'adx'],
            
            // General
            COMPARISON: ['compare', 'comparison', 'vs', 'versus', 'difference', 'which is better'],
            GENERAL_FINANCE: ['what is', 'explain', 'how does', 'define', 'help', 'teach me']
        };
        
        // Known stocks for better symbol detection
        this.knownStocks = [
            'AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'NVDA', 'META', 'TSLA', 'BRK.B', 'UNH',
            'JNJ', 'V', 'WMT', 'XOM', 'JPM', 'PG', 'MA', 'HD', 'CVX', 'MRK',
            'ABBV', 'LLY', 'PEP', 'KO', 'AVGO', 'COST', 'TMO', 'MCD', 'CSCO', 'ACN',
            'NFLX', 'AMD', 'INTC', 'CRM', 'ORCL', 'QCOM', 'TXN', 'ADBE', 'NKE', 'DIS'
        ];
        
        console.log('🤖 ChatbotAIEngine ULTRA v5.0 initialized');
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * INITIALIZE
     * ═══════════════════════════════════════════════════════════
     */
    async initialize() {
        if (typeof GeminiAI === 'undefined') {
            console.error('❌ GeminiAI not loaded');
            throw new Error('GeminiAI class not available');
        }

        this.geminiAPI = new GeminiAI(this.config);
        console.log('✅ ChatbotAIEngine initialized with GeminiAI');
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * PROCESS USER MESSAGE
     * ═══════════════════════════════════════════════════════════
     */
    async processMessage(userMessage, context = {}) {
        try {
            console.log('📩 Processing message:', userMessage);

            // 1. Detect intent
            const intent = this.detectIntent(userMessage);
            console.log('🎯 Intent detected:', intent);

            // 2. Extract entities
            const entities = this.extractEntities(userMessage);
            console.log('🔍 Entities extracted:', entities);

            // 3. Update context
            this.updateContext(intent, entities);

            // 4. Route to specialized analyzer
            const response = await this.routeToAnalyzer(intent, entities, userMessage, context);

            // 5. Add to conversation history
            this.conversationHistory.push({
                role: 'user',
                content: userMessage,
                timestamp: Date.now()
            });

            this.conversationHistory.push({
                role: 'assistant',
                content: response.text,
                intent: intent,
                entities: entities,
                timestamp: Date.now()
            });

            return response;

        } catch (error) {
            console.error('❌ Error processing message:', error);
            return {
                text: "I apologize, but I encountered an error processing your request. Please try rephrasing your question.",
                intent: 'ERROR',
                entities: {},
                charts: []
            };
        }
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * DETECT INTENT (Enhanced)
     * ═══════════════════════════════════════════════════════════
     */
    detectIntent(message) {
        const lowerMessage = message.toLowerCase();
        const scores = {};

        // Calculate score for each intent
        Object.entries(this.intentKeywords).forEach(([intent, keywords]) => {
            scores[intent] = 0;
            keywords.forEach(keyword => {
                if (lowerMessage.includes(keyword.toLowerCase())) {
                    scores[intent] += 1;
                }
            });
        });

        // ✅ Enhanced detection for specific cases

        // INVESTMENT_MANAGEMENT (portfolio, allocation, diversification)
        if (lowerMessage.match(/\b(portfolio|allocation|diversif|rebalance|asset|efficient frontier|optimize.*portfolio|risk.*profile)\b/i)) {
            scores.INVESTMENT_MANAGEMENT = (scores.INVESTMENT_MANAGEMENT || 0) + 3;
        }

        // BUDGET_MANAGEMENT (budget, savings, expenses, income)
        if (lowerMessage.match(/\b(budget|savings?|expense|income|revenue|spending|monthly.*investment|roi)\b/i)) {
            scores.BUDGET_MANAGEMENT = (scores.BUDGET_MANAGEMENT || 0) + 2;
        }

        // PRICE_HISTORY detection
        if (lowerMessage.match(/\b(price|chart|historical|evolution|performance|last|trend)\b/)) {
            if (lowerMessage.match(/\b(year|month|week|day)\b/)) {
                scores.PRICE_HISTORY = (scores.PRICE_HISTORY || 0) + 2;
            }
            this.knownStocks.forEach(symbol => {
                if (lowerMessage.includes(symbol.toLowerCase())) {
                    scores.PRICE_HISTORY = (scores.PRICE_HISTORY || 0) + 1;
                }
            });
        }

        // IPO_ANALYSIS detection
        if (lowerMessage.match(/\b(ipo|initial public offering|newly listed|recent ipo)\b/)) {
            scores.IPO_ANALYSIS = (scores.IPO_ANALYSIS || 0) + 3;
        }

        // FOREX_ANALYSIS detection
        if (lowerMessage.match(/\b(forex|currency|exchange rate|fx|eur.*usd|gbp.*usd)\b/i)) {
            scores.FOREX_ANALYSIS = (scores.FOREX_ANALYSIS || 0) + 3;
        }

        // INSIDER_TRADING detection
        if (lowerMessage.match(/\b(insider|form 4|insider.*trad|insider.*buy|insider.*sell)\b/i)) {
            scores.INSIDER_TRADING = (scores.INSIDER_TRADING || 0) + 3;
        }

        // MA_ANALYSIS detection
        if (lowerMessage.match(/\b(merger|acquisition|m&a|takeover|buyout)\b/i)) {
            scores.MA_ANALYSIS = (scores.MA_ANALYSIS || 0) + 3;
        }

        // Find highest scoring intent
        let maxScore = 0;
        let detectedIntent = 'GENERAL_FINANCE';

        Object.entries(scores).forEach(([intent, score]) => {
            if (score > maxScore) {
                maxScore = score;
                detectedIntent = intent;
            }
        });

        // Default to STOCK_ANALYSIS if symbol detected but no clear intent
        if (maxScore === 0 && this.containsStockSymbol(lowerMessage)) {
            detectedIntent = 'STOCK_ANALYSIS';
        }

        return detectedIntent;
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * EXTRACT ENTITIES (Symbols, Timeframes, Metrics)
     * ═══════════════════════════════════════════════════════════
     */
    extractEntities(message) {
        const entities = {
            symbols: [],
            timeframes: [],
            metrics: [],
            numbers: []
        };

        const upperMessage = message.toUpperCase();
        const lowerMessage = message.toLowerCase();

        // ========== SYMBOL EXTRACTION ==========
        const excludedWords = [
            'IPO', 'THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN',
            'SHOW', 'TELL', 'WHAT', 'WHEN', 'WHERE', 'WHICH', 'WITH', 'ANALYZE',
            'BUDGET', 'PORTFOLIO', 'INVESTMENT', 'ALLOCATION'
        ];
        
        // Method 1: Uppercase words (filtered)
        const upperWords = upperMessage.match(/\b[A-Z]{2,5}\b/g) || [];
        const filteredUpperSymbols = upperWords.filter(word => 
            word.length >= 2 && 
            word.length <= 5 &&
            !excludedWords.includes(word)
        );

        // Method 2: Known stocks (case insensitive)
        const knownStocksFound = [];
        this.knownStocks.forEach(symbol => {
            const regex = new RegExp(`\\b${symbol}\\b`, 'i');
            if (message.match(regex)) {
                knownStocksFound.push(symbol);
            }
        });

        // Method 3: Pattern matching
        const patterns = [
            /(?:stock|share|equity|analyze|analysis)\s+([a-z]{2,5})\b/gi,
            /\b([a-z]{2,5})\s+(?:stock|share|equity|price|chart)\b/gi
        ];

        const patternMatches = [];
        patterns.forEach(pattern => {
            const matches = message.matchAll(pattern);
            for (const match of matches) {
                if (match[1]) {
                    const symbol = match[1].toUpperCase();
                    if (!excludedWords.includes(symbol)) {
                        patternMatches.push(symbol);
                    }
                }
            }
        });

        // Priority: Known stocks > Pattern matches > Upper symbols
        let finalSymbols = [];
        
        if (knownStocksFound.length > 0) {
            finalSymbols = knownStocksFound;
        } else if (patternMatches.length > 0) {
            finalSymbols = patternMatches;
        } else if (filteredUpperSymbols.length > 0) {
            finalSymbols = filteredUpperSymbols;
        }

        entities.symbols = [...new Set(finalSymbols)];

        // ========== TIMEFRAME EXTRACTION ==========
        const timeframePatterns = {
            '1d': /\b(1|one)\s*(day|d)\b/i,
            '1w': /\b(1|one)\s*(week|w)\b/i,
            '1m': /\b(1|one)\s*(month|m)\b/i,
            '3m': /\b(3|three)\s*(months?|m)\b/i,
            '6m': /\b(6|six)\s*(months?|m)\b/i,
            '1y': /\b(1|one)\s*(year|y)\b/i,
            '2y': /\b(2|two)\s*(years?|y)\b/i,
            '5y': /\b(5|five)\s*(years?|y)\b/i,
            'ytd': /\byear[- ]to[- ]date\b|ytd\b/i,
            'max': /\b(max|all[- ]time|maximum|entire)\b/i
        };

        Object.entries(timeframePatterns).forEach(([timeframe, pattern]) => {
            if (pattern.test(lowerMessage)) {
                entities.timeframes.push(timeframe);
            }
        });

        // ========== METRICS EXTRACTION ==========
        const metricPatterns = {
            'p/e': /\b(p\/e|pe|price[- ]to[- ]earnings)\b/i,
            'eps': /\beps\b|earnings[- ]per[- ]share/i,
            'revenue': /\brevenue|sales\b/i,
            'sharpe': /\bsharpe|sharpe.*ratio\b/i,
            'volatility': /\bvolatility|vol\b/i,
            'diversification': /\bdiversif/i,
            'allocation': /\ballocation\b/i
        };

        Object.entries(metricPatterns).forEach(([metric, pattern]) => {
            if (pattern.test(lowerMessage)) {
                entities.metrics.push(metric);
            }
        });

        // ========== NUMBER EXTRACTION ==========
        const numbers = message.match(/\b\d+\.?\d*\b/g);
        if (numbers) {
            entities.numbers = numbers.map(n => parseFloat(n));
        }

        return entities;
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * CHECK IF MESSAGE CONTAINS STOCK SYMBOL
     * ═══════════════════════════════════════════════════════════
     */
    containsStockSymbol(message) {
        const lowerMessage = message.toLowerCase();
        return this.knownStocks.some(symbol => 
            lowerMessage.includes(symbol.toLowerCase()) ||
            lowerMessage.match(new RegExp(`\\b${symbol.toLowerCase()}\\b`))
        );
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * UPDATE CONTEXT
     * ═══════════════════════════════════════════════════════════
     */
    updateContext(intent, entities) {
        if (entities.symbols && entities.symbols.length > 0) {
            this.currentContext.symbols = entities.symbols;
        }

        if (entities.timeframes && entities.timeframes.length > 0) {
            this.currentContext.timeframe = entities.timeframes[0];
        }

        if (entities.metrics && entities.metrics.length > 0) {
            this.currentContext.metrics = entities.metrics;
        }

        this.currentContext.lastIntent = intent;
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * ROUTE TO ANALYZER
     * ═══════════════════════════════════════════════════════════
     */
    async routeToAnalyzer(intent, entities, userMessage, context) {
        console.log(`🔀 Routing to analyzer: ${intent}`);

        switch (intent) {
            case 'IPO_ANALYSIS':
                return await this.handleIPOAnalysis(entities, userMessage, context);

            case 'MA_ANALYSIS':
                return await this.handleMAAnalysis(entities, userMessage, context);

            case 'INSIDER_TRADING':
                return await this.handleInsiderAnalysis(entities, userMessage, context);

            case 'FOREX_ANALYSIS':
                return await this.handleForexAnalysis(entities, userMessage, context);

            case 'BUDGET_MANAGEMENT':
                return await this.handleBudgetManagement(entities, userMessage, context);

            case 'INVESTMENT_MANAGEMENT':
                return await this.handleInvestmentManagement(entities, userMessage, context);

            case 'STOCK_ANALYSIS':
            case 'PRICE_HISTORY':
            case 'TECHNICAL_ANALYSIS':
                return await this.handleStockAnalysis(entities, userMessage, context);

            case 'MARKET_OVERVIEW':
                return await this.handleMarketOverview(entities, userMessage, context);

            case 'COMPARISON':
                return await this.handleComparison(entities, userMessage, context);

            case 'GENERAL_FINANCE':
            default:
                return await this.handleGeneralQuery(userMessage, context);
        }
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * HANDLE IPO ANALYSIS
     * ═══════════════════════════════════════════════════════════
     */
    async handleIPOAnalysis(entities, userMessage, context) {
        console.log('📊 IPO Analysis requested');

        if (typeof ChatbotIPOAnalyzer === 'undefined') {
            return await this.handleGeneralQuery(userMessage, context);
        }

        const ipoAnalyzer = new ChatbotIPOAnalyzer(this.config);
        const result = await ipoAnalyzer.analyzeIPOs(entities);

        return {
            text: result.text,
            intent: 'IPO_ANALYSIS',
            entities: entities,
            charts: result.charts || [],
            data: result.data
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * HANDLE M&A ANALYSIS
     * ═══════════════════════════════════════════════════════════
     */
    async handleMAAnalysis(entities, userMessage, context) {
        console.log('📊 M&A Analysis requested');

        if (typeof ChatbotMAAnalyzer === 'undefined') {
            return await this.handleGeneralQuery(userMessage, context);
        }

        const maAnalyzer = new ChatbotMAAnalyzer(this.config);
        const result = await maAnalyzer.analyzeMergers(entities);

        return {
            text: result.text,
            intent: 'MA_ANALYSIS',
            entities: entities,
            charts: result.charts || [],
            data: result.data
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * HANDLE INSIDER TRADING ANALYSIS
     * ═══════════════════════════════════════════════════════════
     */
    async handleInsiderAnalysis(entities, userMessage, context) {
        console.log('📊 Insider Trading Analysis requested');

        if (typeof ChatbotInsiderAnalyzer === 'undefined') {
            return await this.handleGeneralQuery(userMessage, context);
        }

        const insiderAnalyzer = new ChatbotInsiderAnalyzer(this.config);
        const result = await insiderAnalyzer.analyzeInsiderTrading(entities);

        return {
            text: result.text,
            intent: 'INSIDER_TRADING',
            entities: entities,
            charts: result.charts || [],
            data: result.data
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * HANDLE FOREX ANALYSIS
     * ═══════════════════════════════════════════════════════════
     */
    async handleForexAnalysis(entities, userMessage, context) {
        console.log('📊 Forex Analysis requested');

        if (typeof ChatbotForexAnalyzer === 'undefined') {
            return await this.handleGeneralQuery(userMessage, context);
        }

        const forexAnalyzer = new ChatbotForexAnalyzer(this.config);
        const result = await forexAnalyzer.analyzeForex(entities);

        return {
            text: result.text,
            intent: 'FOREX_ANALYSIS',
            entities: entities,
            charts: result.charts || [],
            data: result.data
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * HANDLE BUDGET MANAGEMENT
     * ═══════════════════════════════════════════════════════════
     */
    async handleBudgetManagement(entities, userMessage, context) {
        console.log('💰 Budget Management requested');

        if (typeof ChatbotBudgetManager === 'undefined') {
            return await this.handleGeneralQuery(userMessage, context);
        }

        const budgetManager = new ChatbotBudgetManager(this.config);
        const result = await budgetManager.manageBudget(entities, userMessage);

        return {
            text: result.text,
            intent: 'BUDGET_MANAGEMENT',
            entities: entities,
            charts: result.charts || [],
            data: result.data
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * HANDLE INVESTMENT MANAGEMENT
     * ═══════════════════════════════════════════════════════════
     */
    async handleInvestmentManagement(entities, userMessage, context) {
        console.log('📊 Investment Management requested');

        if (typeof ChatbotInvestmentManager === 'undefined') {
            return await this.handleGeneralQuery(userMessage, context);
        }

        const investmentManager = new ChatbotInvestmentManager(this.config);
        const result = await investmentManager.manageInvestments(entities, userMessage);

        return {
            text: result.text,
            intent: 'INVESTMENT_MANAGEMENT',
            entities: entities,
            charts: result.charts || [],
            data: result.data
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * HANDLE STOCK ANALYSIS
     * ═══════════════════════════════════════════════════════════
     */
    async handleStockAnalysis(entities, userMessage, context) {
        console.log('📊 Stock Analysis requested');

        if (!entities.symbols || entities.symbols.length === 0) {
            return {
                text: "Please specify a stock symbol (e.g., AAPL, MSFT, NVDA) for me to analyze.",
                intent: 'STOCK_ANALYSIS',
                entities: entities,
                charts: []
            };
        }

        const symbol = entities.symbols[0];
        console.log(`📊 Symbol detected: ${symbol}`);

        if (typeof ChatbotAnalytics === 'undefined') {
            return await this.handleGeneralQuery(userMessage, context);
        }

        const analytics = new ChatbotAnalytics(this.config);
        const result = await analytics.analyzeStock(symbol, entities);

        return {
            text: result.text,
            intent: 'STOCK_ANALYSIS',
            entities: entities,
            charts: result.charts || [],
            data: result.data
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * HANDLE MARKET OVERVIEW
     * ═══════════════════════════════════════════════════════════
     */
    async handleMarketOverview(entities, userMessage, context) {
        console.log('📊 Market Overview requested');

        if (typeof ChatbotAnalytics === 'undefined') {
            return await this.handleGeneralQuery(userMessage, context);
        }

        const analytics = new ChatbotAnalytics(this.config);
        const result = await analytics.getMarketOverview(entities);

        return {
            text: result.text,
            intent: 'MARKET_OVERVIEW',
            entities: entities,
            charts: result.charts || [],
            data: result.data
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * HANDLE COMPARISON
     * ═══════════════════════════════════════════════════════════
     */
    async handleComparison(entities, userMessage, context) {
        console.log('📊 Comparison requested');

        // Route to appropriate analyzer based on context
        if (userMessage.toLowerCase().includes('strategy') || userMessage.toLowerCase().includes('allocation')) {
            return await this.handleInvestmentManagement(entities, userMessage, context);
        } else if (userMessage.toLowerCase().includes('stock')) {
            return await this.handleStockAnalysis(entities, userMessage, context);
        } else {
            return await this.handleGeneralQuery(userMessage, context);
        }
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * HANDLE GENERAL QUERY (Gemini AI)
     * ═══════════════════════════════════════════════════════════
     */
    async handleGeneralQuery(userMessage, context) {
        console.log('💬 General query - routing to Gemini AI');

        if (!this.geminiAPI) {
            await this.initialize();
        }

        const conversationContext = this.conversationHistory
            .slice(-5)
            .map(msg => `${msg.role}: ${msg.content}`)
            .join('\n');

        const enrichedContext = {
            conversationHistory: conversationContext || 'No previous context',
            currentSymbols: this.currentContext.symbols.join(', ') || 'None',
            timeframe: this.currentContext.timeframe,
            metrics: this.currentContext.metrics.join(', ') || 'None'
        };

        const responseData = await this.geminiAPI.generateResponse(userMessage, enrichedContext);

        return {
            text: responseData.text || responseData,
            intent: 'GENERAL_FINANCE',
            entities: {},
            charts: []
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * GET CONVERSATION HISTORY
     * ═══════════════════════════════════════════════════════════
     */
    getConversationHistory() {
        return this.conversationHistory;
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * CLEAR CONVERSATION HISTORY
     * ═══════════════════════════════════════════════════════════
     */
    clearConversationHistory() {
        this.conversationHistory = [];
        this.currentContext = {
            symbols: [],
            timeframe: '1y',
            metrics: [],
            lastIntent: null
        };
        console.log('🗑 Conversation history cleared');
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * GET CURRENT CONTEXT
     * ═══════════════════════════════════════════════════════════
     */
    getCurrentContext() {
        return this.currentContext;
    }
}

// ═══════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChatbotAIEngine;
}

if (typeof window !== 'undefined') {
    window.ChatbotAIEngine = ChatbotAIEngine;
}

console.log('✅ ChatbotAIEngine ULTRA v5.0 loaded - All analyzers integrated');