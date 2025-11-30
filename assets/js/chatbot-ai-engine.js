// ============================================
// FINANCIAL CHATBOT - AI ENGINE
// Version Conversationnelle Ultra-Performante
// ============================================

class FinancialChatbotEngine {
    constructor(config) {
        this.config = config;
        this.geminiAI = null;
        this.ipoAnalyzer = null;
        this.analytics = null;
        this.charts = null;
        
        this.isProcessing = false;
        
        // ✅ AMÉLIORATION 1: Contexte conversationnel simplifié
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
        
        // ✅ AMÉLIORATION 2: Cache intelligent
        this.responseCache = new Map();
        this.cacheExpiration = 300000; // 5 minutes
        
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

            console.log('🚀 Conversational Financial AI ready!');
            
        } catch (error) {
            console.error('❌ Engine initialization error:', error);
        }
    }

    // ============================================
    // PROCESSUS PRINCIPAL SIMPLIFIÉ
    // ============================================
    async processMessage(userMessage) {
        const startTime = performance.now();
        
        try {
            this.metrics.totalMessages++;

            // ✅ Vérification cache
            const cachedResponse = this.checkCache(userMessage);
            if (cachedResponse) {
                console.log('📦 Returning cached response');
                return cachedResponse;
            }

            // ✅ AMÉLIORATION 3: Analyse légère (pas de forcing d'intent)
            const analysis = this.analyzeMessage(userMessage);
            
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('💬 Processing:', userMessage.substring(0, 60) + '...');
            console.log('🎯 Detected:', analysis.type);
            console.log('📊 Symbols:', analysis.symbols);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            // ✅ AMÉLIORATION 4: Construction de contexte intelligente (pas toujours tout charger)
            const context = await this.buildSmartContext(analysis, userMessage);

            // ✅ AMÉLIORATION 5: Génération de réponse (Gemini gère tout)
            const response = await this.geminiAI.generateResponse(userMessage, context);
            
            // ✅ Enrichissement de la réponse
            response.suggestions = this.generateSmartSuggestions(analysis, context);
            response.processingTime = performance.now() - startTime;

            // ✅ Sauvegarde cache & métriques
            this.cacheResponse(userMessage, response);
            this.updateMetrics(true, response.processingTime);
            this.updateConversationContext(analysis);

            console.log(`✅ Response generated in ${response.processingTime.toFixed(0)}ms`);

            return response;

        } catch (error) {
            console.error('❌ Message processing error:', error);
            this.updateMetrics(false, performance.now() - startTime);
            
            return {
                text: `⚠ **I encountered an error:** ${error.message}\n\nPlease try again or rephrase your question.`,
                error: true,
                chartRequests: [],
                suggestions: this.config.suggestions.initial
            };
        }
    }

    // ============================================
    // ANALYSE LÉGÈRE DU MESSAGE (pas de forcing)
    // ============================================
    analyzeMessage(message) {
        const lowerMessage = message.toLowerCase();
        
        // ✅ Extraction symboles (méthodes combinées)
        const symbols = this.extractSymbols(message);
        
        // ✅ Extraction timeframes
        const timeframes = this.extractTimeframes(message);
        
        // ✅ Détection de type (suggestif, pas contraignant)
        let type = 'CONVERSATIONAL'; // Par défaut
        
        if (/\b(ipo|initial public offering)\b/i.test(message)) {
            type = 'IPO_QUERY';
        } else if (symbols.length > 0 || /\b(stock|share|ticker|analyze|price|chart)\b/i.test(message)) {
            type = 'STOCK_QUERY';
        } else if (/\b(market|indices|dow|nasdaq|s&p|sp500)\b/i.test(message)) {
            type = 'MARKET_QUERY';
        } else if (/\b(what is|explain|define|tell me about|how does)\b/i.test(message)) {
            type = 'EDUCATIONAL_QUERY';
        }
        
        return {
            type,
            symbols,
            timeframes,
            needsData: symbols.length > 0 || type === 'STOCK_QUERY' || type === 'MARKET_QUERY'
        };
    }

    // ✅ AMÉLIORATION 6: Extraction symboles améliorée
    extractSymbols(message) {
        const symbols = new Set();
        
        // Méthode 1: Symboles UPPERCASE
        const upperRegex = /\b[A-Z]{1,5}\b/g;
        const upperSymbols = message.match(upperRegex) || [];
        const excludeWords = ['IPO', 'USA', 'CEO', 'CFO', 'AI', 'THE', 'AND', 'FOR', 'NOT', 'ETF', 'API', 'FAQ'];
        upperSymbols.filter(s => !excludeWords.includes(s)).forEach(s => symbols.add(s));
        
        // Méthode 2: Symboles connus (lowercase aussi)
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
        
        // Méthode 3: Noms de sociétés
        const companyMapping = this.getCompanySymbolMapping();
        for (const [companyName, symbol] of Object.entries(companyMapping)) {
            if (new RegExp(`\\b${companyName}\\b`, 'i').test(lowerMessage)) {
                symbols.add(symbol);
            }
        }
        
        // Utiliser le dernier symbole du contexte si aucun trouvé
        if (symbols.size === 0 && this.conversationContext.lastSymbol) {
            symbols.add(this.conversationContext.lastSymbol);
            console.log(`   🔄 Using context symbol: ${this.conversationContext.lastSymbol}`);
        }
        
        return Array.from(symbols);
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

        // Défaut si pas trouvé
        if (found.length === 0 && /\b(evolution|historical|history|performance|trend)\b/i.test(message)) {
            found.push(this.conversationContext.lastTimeframe || '1y');
        }

        return found;
    }

    // ============================================
    // CONSTRUCTION DE CONTEXTE INTELLIGENTE
    // ============================================
    async buildSmartContext(analysis, userMessage) {
        const context = {
            entities: {
                symbols: analysis.symbols,
                timeframes: analysis.timeframes
            },
            intent: { type: analysis.type }
        };

        // ✅ AMÉLIORATION 7: Charger les données SEULEMENT si nécessaire
        if (!analysis.needsData) {
            console.log('   ⚡ No market data needed - conversational query');
            return context;
        }

        const symbol = analysis.symbols[0];
        
        if (!symbol) {
            console.log('   ⚠ No symbol detected');
            return context;
        }

        console.log(`   📊 Loading data for: ${symbol}`);

        try {
            // 1. Quote en temps réel
            if (this.analytics) {
                context.stockData = await this.analytics.getStockData(symbol);
                if (context.stockData) {
                    console.log(`   ✅ Quote: $${context.stockData.quote?.current}`);
                }
            }

            // 2. Données historiques (seulement si pertinent)
            const needsHistory = /\b(history|historical|evolution|performance|trend|chart|volatility|return)\b/i.test(userMessage);
            
            if (needsHistory && this.analytics) {
                const timeframe = analysis.timeframes[0] || this.conversationContext.lastTimeframe || '1y';
                const outputsize = this.getOutputSize(timeframe);
                
                console.log(`   📅 Loading ${timeframe} history...`);
                
                const timeSeries = await this.analytics.getTimeSeries(symbol, '1day', outputsize);
                
                if (timeSeries && timeSeries.data && timeSeries.data.length > 0) {
                    context.timeSeriesData = timeSeries;
                    context.historicalStats = this.calculateHistoricalStats(timeSeries);
                    context.technicalIndicators = this.calculateTechnicalIndicators(timeSeries);
                    
                    console.log(`   ✅ History: ${timeSeries.data.length} points`);
                    console.log(`   📈 Return: ${context.historicalStats.totalReturn}%`);
                }
            }

            // 3. Données de marché (seulement si demandé)
            if (analysis.type === 'MARKET_QUERY' && this.analytics) {
                context.marketData = await this.analytics.getMarketOverview();
            }

            // 4. Données IPO (seulement si demandé)
            if (analysis.type === 'IPO_QUERY' && this.ipoAnalyzer) {
                context.ipoData = await this.ipoAnalyzer.getTopIPOs(5);
            }

        } catch (error) {
            console.warn('   ⚠ Error loading context data:', error.message);
        }

        return context;
    }

    // ============================================
    // CALCULS TECHNIQUES (identiques à avant)
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
        
        // Calculs techniques complets (comme avant)
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

    // Fonctions de calcul (identiques)
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

    // ============================================
    // SUGGESTIONS INTELLIGENTES
    // ============================================
    generateSmartSuggestions(analysis, context) {
        const suggestions = [];
        
        if (analysis.symbols.length > 0) {
            const symbol = analysis.symbols[0];
            suggestions.push(
                `Compare ${symbol} with sector`,
                `${symbol} risk assessment`,
                `${symbol} price targets`,
                `Technical indicators for ${symbol}`
            );
        } else if (analysis.type === 'IPO_QUERY') {
            suggestions.push(
                "Show top performing IPOs",
                "IPO calendar this month",
                "How to evaluate IPOs",
                "Recent tech IPOs"
            );
        } else if (analysis.type === 'MARKET_QUERY') {
            suggestions.push(
                "Sector performance today",
                "Market sentiment analysis",
                "Economic indicators impact",
                "Top gainers and losers"
            );
        } else {
            suggestions.push(
                "📈 Analyze NVDA stock",
                "💰 Market overview today",
                "📊 Show trending IPOs",
                "🎯 Explain P/E ratio"
            );
        }
        
        return suggestions.slice(0, 4);
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
            'starbucks': 'SBUX'
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
        console.log('🗑 Cache cleared');
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
        console.log('🗑 Conversation context cleared');
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

if (typeof module !== 'undefined' && module.exports) {
    module.exports = FinancialChatbotEngine;
}