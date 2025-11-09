// ============================================
// FINANCIAL CHATBOT - AI ENGINE ULTRA-PREMIUM
// Complete Intelligence & Advanced Calculations
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
            lastAnalysisTime: null,
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
        
        this.currentUserMessage = '';
        
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

    // ============================================
    // COMPANY NAME TO SYMBOL MAPPING
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
            'advanced micro devices': 'AMD',
            'intel': 'INTC',
            'qualcomm': 'QCOM',
            'broadcom': 'AVGO',
            'texas instruments': 'TXN',
            'micron': 'MU',
            'jpmorgan': 'JPM',
            'jp morgan': 'JPM',
            'bank of america': 'BAC',
            'goldman sachs': 'GS',
            'morgan stanley': 'MS',
            'visa': 'V',
            'mastercard': 'MA',
            'paypal': 'PYPL',
            'coinbase': 'COIN',
            'disney': 'DIS',
            'walmart': 'WMT',
            'mcdonalds': 'MCD',
            "mcdonald's": 'MCD',
            'nike': 'NKE',
            'starbucks': 'SBUX',
            'target': 'TGT',
            'home depot': 'HD',
            'costco': 'COST',
            'pfizer': 'PFE',
            'johnson & johnson': 'JNJ',
            'johnson and johnson': 'JNJ',
            'unitedhealth': 'UNH',
            'merck': 'MRK',
            'abbvie': 'ABBV',
            'exxon': 'XOM',
            'exxonmobil': 'XOM',
            'chevron': 'CVX',
            'boeing': 'BA',
            'caterpillar': 'CAT',
            'general electric': 'GE',
            'at&t': 'T',
            'verizon': 'VZ',
            't-mobile': 'TMUS'
        };
    }

    // ============================================
    // PROCESS MESSAGE
    // ============================================
    async processMessage(userMessage) {
        const startTime = performance.now();
        
        try {
            this.metrics.totalMessages++;
            this.currentUserMessage = userMessage;

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
    // INTENT DETECTION - ADVANCED
    // ============================================
    detectIntent(message) {
        const lowerMessage = message.toLowerCase();
        
        // PRICE HISTORY / EVOLUTION
        const historyKeywords = ['evolution', 'historical', 'history', 'performance', 
                                 'over the', 'past', 'last', 'since', 'trend', 'how did',
                                 'chart', 'graph', 'show me', 'display'];
        
        const periodKeywords = ['year', 'month', 'week', 'day', 'period', 'time'];
        const hasHistoryKeyword = historyKeywords.some(kw => lowerMessage.includes(kw));
        const hasPeriodKeyword = periodKeywords.some(kw => lowerMessage.includes(kw));
        const hasSymbol = /\b(nvda|aapl|msft|googl|amzn|tsla|meta|stock|share|ticker)\b/i.test(message);
        
        if (hasHistoryKeyword && (hasPeriodKeyword || hasSymbol)) {
            console.log('✅ PRICE_HISTORY intent detected');
            return { type: 'PRICE_HISTORY', confidence: 0.95 };
        }

        // IPO ANALYSIS
        if (this.matchesPattern(lowerMessage, [
            'ipo', 'initial public offering', 'newly listed', 'recent listing',
            'going public', 'public offering', 'upcoming ipo'
        ])) {
            return { type: 'IPO_ANALYSIS', confidence: 0.9 };
        }

        // TECHNICAL ANALYSIS
        if (this.matchesPattern(lowerMessage, [
            'technical', 'rsi', 'macd', 'moving average', 'sma', 'ema',
            'support', 'resistance', 'pattern', 'indicator', 'bollinger',
            'volatility', 'volume', 'momentum'
        ])) {
            return { type: 'TECHNICAL_ANALYSIS', confidence: 0.87 };
        }

        // STOCK ANALYSIS
        if (this.matchesPattern(lowerMessage, [
            'analyze', 'analysis', 'stock', 'share', 'ticker', 'company',
            'valuation', 'fundamental', 'earnings', 'price', 'invest',
            'buy', 'sell', 'hold', 'recommendation'
        ]) || /\b[A-Z]{1,5}\b/.test(message) || hasSymbol) {
            return { type: 'STOCK_ANALYSIS', confidence: 0.85 };
        }

        // MARKET OVERVIEW
        if (this.matchesPattern(lowerMessage, [
            'market', 'indices', 'dow', 'nasdaq', 's&p', 'sp500',
            'market overview', 'market summary', 'market today'
        ])) {
            return { type: 'MARKET_OVERVIEW', confidence: 0.88 };
        }

        // GENERAL FINANCE
        if (this.matchesPattern(lowerMessage, [
            'what is', 'explain', 'define', 'how does', 'tell me about',
            'p/e ratio', 'eps', 'dividend', 'beta', 'portfolio'
        ])) {
            return { type: 'GENERAL_FINANCE', confidence: 0.75 };
        }

        return { type: 'GENERIC', confidence: 0.5 };
    }

    // ============================================
    // ENTITY EXTRACTION - ADVANCED
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

        // MÉTHODE 1: Symboles MAJUSCULES
        const upperSymbolRegex = /\b[A-Z]{1,5}\b/g;
        const upperSymbols = message.match(upperSymbolRegex) || [];
        const validUpperSymbols = upperSymbols.filter(s => 
            s.length >= 1 && s.length <= 5 && !['IPO', 'USA', 'CEO', 'CFO', 'AI', 'THE', 'AND', 'FOR', 'NOT', 'ETF'].includes(s)
        );
        
        // MÉTHODE 2: Symboles connus (minuscules)
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
        const foundKnownSymbols = knownStocks.filter(symbol => {
            const lowerSymbol = symbol.toLowerCase();
            const regex = new RegExp(`\\b${lowerSymbol}\\b`, 'i');
            return regex.test(lowerMessage);
        });
        
        // MÉTHODE 3: Pattern "stock [SYMBOL]"
        const stockPatternRegex = /(?:stock\s+|share\s+|ticker\s+)([a-z]{1,5})\b|\b([a-z]{1,5})(?:\s+stock|\s+share|\s+ticker)/gi;
        let match;
        const patternSymbols = [];
        while ((match = stockPatternRegex.exec(message)) !== null) {
            const symbol = (match[1] || match[2]).toUpperCase();
            if (symbol.length >= 1 && symbol.length <= 5) {
                patternSymbols.push(symbol);
            }
        }
        
        // MÉTHODE 4: Noms d'entreprises
        const companyMapping = this.getCompanySymbolMapping();
        const companySymbols = [];
        
        for (const [companyName, symbol] of Object.entries(companyMapping)) {
            const regex = new RegExp(`\\b${companyName}\\b`, 'i');
            if (regex.test(lowerMessage)) {
                companySymbols.push(symbol);
                console.log(`   🏢 Company name detected: "${companyName}" → ${symbol}`);
            }
        }
        
        // COMBINER
        const allSymbols = [...new Set([
            ...validUpperSymbols,
            ...foundKnownSymbols,
            ...patternSymbols,
            ...companySymbols
        ])];
        
        entities.symbols = allSymbols;
        
        console.log('🔍 Symbol detection:');
        console.log('   Upper symbols:', validUpperSymbols);
        console.log('   Known stocks found:', foundKnownSymbols);
        console.log('   Pattern matches:', patternSymbols);
        console.log('   Company names found:', companySymbols);
        console.log('   ✅ Final symbols:', allSymbols);

        // EXTRACTION PÉRIODES
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

        if (entities.timeframes.length === 0) {
            if (/\b(evolution|historical|history|performance|trend)\b/i.test(message)) {
                entities.timeframes.push('1y');
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
            'volume', 'trading volume',
            'volatility', 'beta', 'risk'
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
    // BUILD CONTEXT - ULTRA-COMPLET
    // ============================================
    async buildContext(intent, entities) {
        const context = {
            intent: intent,
            entities: entities,
            timestamp: Date.now(),
            userMessage: this.currentUserMessage
        };

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔧 BUILDING ULTRA-COMPLETE CONTEXT');
        console.log('Intent:', intent.type);
        console.log('Entities:', entities);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        // DÉTERMINER LE SYMBOLE
        let symbolToAnalyze = null;
        
        if (entities.symbols && entities.symbols.length > 0) {
            symbolToAnalyze = entities.symbols[0];
            this.setLastAnalyzedSymbol(symbolToAnalyze);
        } else {
            symbolToAnalyze = this.getLastAnalyzedSymbol();
            if (symbolToAnalyze) {
                console.log(`   🔄 Using last analyzed symbol: ${symbolToAnalyze}`);
                entities.symbols = [symbolToAnalyze];
            }
        }

        if (symbolToAnalyze && this.analytics) {
            console.log(`\n📊 Analyzing: ${symbolToAnalyze}`);
            
            try {
                // 1. REAL-TIME QUOTE
                console.log(`   ⏳ Fetching real-time quote...`);
                const stockData = await this.analytics.getStockData(symbolToAnalyze);
                
                if (stockData) {
                    context.stockData = stockData;
                    console.log(`   ✅ Quote loaded: $${stockData.quote?.current}`);
                }
                
                // 2. HISTORICAL DATA
                let timeframe = '1y';
                let outputsize = 365;
                
                if (entities.timeframes && entities.timeframes.length > 0) {
                    timeframe = entities.timeframes[0];
                    outputsize = this.getOutputSize(timeframe);
                } else if (context.userMessage.toLowerCase().includes('volatility')) {
                    timeframe = '1y';
                    outputsize = 365;
                }
                
                console.log(`   📅 Loading ${timeframe} history (${outputsize} points)...`);
                
                const timeSeries = await this.analytics.getTimeSeries(symbolToAnalyze, '1day', outputsize);
                
                if (timeSeries && timeSeries.data && timeSeries.data.length > 0) {
                    context.timeSeriesData = timeSeries;
                    
                    const prices = timeSeries.data.map(d => d.close);
                    const firstPrice = prices[0];
                    const lastPrice = prices[prices.length - 1];
                    const minPrice = Math.min(...prices);
                    const maxPrice = Math.max(...prices);
                    const totalReturn = ((lastPrice - firstPrice) / firstPrice * 100).toFixed(2);
                    
                    // Calculer le rendement annualisé
                    const years = timeSeries.data.length / 252; // 252 jours de trading par an
                    const annualizedReturn = (Math.pow(lastPrice / firstPrice, 1 / years) - 1) * 100;
                    
                    // Calculer la volatilité
                    const returns = [];
                    for (let i = 1; i < prices.length; i++) {
                        returns.push((prices[i] - prices[i-1]) / prices[i-1]);
                    }
                    const stdDev = this.calculateStdDev(returns);
                    const annualizedVolatility = (stdDev * Math.sqrt(252) * 100).toFixed(2);
                    
                    context.historicalStats = {
                        firstPrice: firstPrice,
                        lastPrice: lastPrice,
                        minPrice: minPrice,
                        maxPrice: maxPrice,
                        totalReturn: totalReturn,
                        annualizedReturn: annualizedReturn.toFixed(2),
                        volatility: annualizedVolatility,
                        period: timeframe,
                        dataPoints: timeSeries.data.length
                    };
                    
                    console.log(`   ✅ History loaded: ${timeSeries.data.length} points`);
                    console.log(`      Return: ${totalReturn}% (${annualizedReturn.toFixed(2)}% annualized)`);
                    console.log(`      Volatility: ${annualizedVolatility}%`);
                    
                    // 3. CALCULER TOUS LES INDICATEURS TECHNIQUES
                    console.log(`   🔬 Calculating advanced technical indicators...`);
                    const technicalIndicators = this.calculateAdvancedTechnicalIndicators(timeSeries);
                    context.technicalIndicators = technicalIndicators;
                    
                    console.log(`   ✅ Technical analysis complete:`);
                    console.log(`      Trend: ${technicalIndicators.trend.direction} (${technicalIndicators.trend.strength})`);
                    console.log(`      RSI: ${technicalIndicators.momentum.rsi} (${technicalIndicators.momentum.rsiSignal})`);
                    console.log(`      Volatility: ${technicalIndicators.volatility.annualized}% (${technicalIndicators.volatility.level})`);
                    console.log(`      Sharpe Ratio: ${technicalIndicators.volatility.sharpeRatio}`);
                    console.log(`      Max Drawdown: ${technicalIndicators.volatility.maxDrawdown}%`);
                    console.log(`      Support: ${technicalIndicators.levels.support.join(', ')}`);
                    console.log(`      Resistance: ${technicalIndicators.levels.resistance.join(', ')}`);
                }
                
            } catch (error) {
                console.error(`   ❌ Error:`, error);
            }
        }

        // MARKET DATA
        if (intent.type === 'MARKET_OVERVIEW' && this.analytics) {
            try {
                context.marketData = await this.analytics.getMarketOverview();
            } catch (error) {
                console.warn('Could not fetch market data');
            }
        }

        // IPO DATA
        if (intent.type === 'IPO_ANALYSIS' && this.ipoAnalyzer) {
            try {
                context.ipoData = await this.ipoAnalyzer.getTopIPOs(5);
            } catch (error) {
                console.warn('Could not fetch IPO data');
            }
        }

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ ULTRA-COMPLETE CONTEXT BUILT');
        console.log('Symbol:', symbolToAnalyze);
        console.log('Has stockData:', !!context.stockData);
        console.log('Has timeSeriesData:', !!context.timeSeriesData);
        console.log('Has technicalIndicators:', !!context.technicalIndicators);
        console.log('Has historicalStats:', !!context.historicalStats);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        return context;
    }

    // ============================================
    // ADVANCED TECHNICAL INDICATORS (COMPLET)
    // ============================================
    calculateAdvancedTechnicalIndicators(timeSeriesData) {
        if (!timeSeriesData || !timeSeriesData.data || timeSeriesData.data.length === 0) {
            return null;
        }

        const data = timeSeriesData.data;
        const closes = data.map(d => d.close);
        const highs = data.map(d => d.high);
        const lows = data.map(d => d.low);
        const volumes = data.map(d => d.volume);
        
        // 1. MOVING AVERAGES
        const sma20 = this.calculateSMA(closes, 20);
        const sma50 = this.calculateSMA(closes, 50);
        const sma200 = this.calculateSMA(closes, 200);
        const ema12 = this.calculateEMA(closes, 12);
        const ema26 = this.calculateEMA(closes, 26);
        
        const currentPrice = closes[closes.length - 1];
        const currentSMA20 = sma20[sma20.length - 1];
        const currentSMA50 = sma50[sma50.length - 1];
        const currentSMA200 = sma200[sma200.length - 1];
        const currentEMA12 = ema12[ema12.length - 1];
        const currentEMA26 = ema26[ema26.length - 1];
        
        // 2. RSI
        const rsi = this.calculateRSI(closes, 14);
        const currentRSI = rsi[rsi.length - 1];
        
        // 3. MACD
        const macdLine = [];
        for (let i = 0; i < ema12.length; i++) {
            if (ema12[i] !== null && ema26[i] !== null) {
                macdLine.push(ema12[i] - ema26[i]);
            } else {
                macdLine.push(null);
            }
        }
        const signalLine = this.calculateEMA(macdLine.filter(v => v !== null), 9);
        const currentMACD = macdLine[macdLine.length - 1];
        const currentSignal = signalLine[signalLine.length - 1];
        const macdHistogram = currentMACD && currentSignal ? currentMACD - currentSignal : null;
        
        // 4. VOLATILITY
        const returns = [];
        for (let i = 1; i < closes.length; i++) {
            returns.push((closes[i] - closes[i-1]) / closes[i-1]);
        }
        const stdDev = this.calculateStdDev(returns);
        const annualizedVolatility = (stdDev * Math.sqrt(252) * 100).toFixed(2);
        
        // 5. DRAWDOWN
        const maxDrawdown = this.calculateMaxDrawdown(closes);
        const currentDrawdown = this.calculateCurrentDrawdown(closes);
        
        // 6. SHARPE RATIO (risk-free rate = 2%)
        const riskFreeRate = 0.02;
        const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
        const annualizedReturn = avgReturn * 252;
        const excessReturn = annualizedReturn - riskFreeRate;
        const annualizedStdDev = stdDev * Math.sqrt(252);
        const sharpeRatio = annualizedStdDev !== 0 ? (excessReturn / annualizedStdDev).toFixed(2) : 'N/A';
        
        // 7. SORTINO RATIO (downside deviation)
        const downsideReturns = returns.filter(r => r < 0);
        const downsideStdDev = downsideReturns.length > 0 ? this.calculateStdDev(downsideReturns) : stdDev;
        const annualizedDownsideStdDev = downsideStdDev * Math.sqrt(252);
        const sortinoRatio = annualizedDownsideStdDev !== 0 ? (excessReturn / annualizedDownsideStdDev).toFixed(2) : 'N/A';
        
        // 8. SUPPORT & RESISTANCE
        const supportResistance = this.identifySupportResistance(data);
        
        // 9. TREND ANALYSIS
        const trend = this.analyzeTrend(closes, sma20, sma50, sma200);
        
        // 10. VOLUME ANALYSIS
        const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
        const recentAvgVolume = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20;
        const volumeTrend = recentAvgVolume > avgVolume * 1.1 ? 'Increasing' : 
                           recentAvgVolume < avgVolume * 0.9 ? 'Decreasing' : 'Stable';
        
        // 11. BOLLINGER BANDS
        const bollingerBands = this.calculateBollingerBands(closes, 20, 2);
        const currentUpper = bollingerBands.upper[bollingerBands.upper.length - 1];
        const currentMiddle = bollingerBands.middle[bollingerBands.middle.length - 1];
        const currentLower = bollingerBands.lower[bollingerBands.lower.length - 1];
        
        return {
            movingAverages: {
                sma20: currentSMA20?.toFixed(2),
                sma50: currentSMA50?.toFixed(2),
                sma200: currentSMA200?.toFixed(2),
                ema12: currentEMA12?.toFixed(2),
                ema26: currentEMA26?.toFixed(2),
                priceVsSMA20: currentSMA20 ? ((currentPrice - currentSMA20) / currentSMA20 * 100).toFixed(2) : null,
                priceVsSMA50: currentSMA50 ? ((currentPrice - currentSMA50) / currentSMA50 * 100).toFixed(2) : null,
                priceVsSMA200: currentSMA200 ? ((currentPrice - currentSMA200) / currentSMA200 * 100).toFixed(2) : null
            },
            momentum: {
                rsi: currentRSI?.toFixed(2),
                rsiSignal: currentRSI > 70 ? 'Overbought' : currentRSI < 30 ? 'Oversold' : 'Neutral',
                macd: currentMACD && currentSignal ? {
                    value: currentMACD.toFixed(4),
                    signal: currentSignal.toFixed(4),
                    histogram: macdHistogram.toFixed(4),
                    crossover: currentMACD > currentSignal ? 'Bullish' : 'Bearish'
                } : null
            },
            volatility: {
                annualized: annualizedVolatility,
                level: parseFloat(annualizedVolatility) > 50 ? 'Very High' : 
                       parseFloat(annualizedVolatility) > 30 ? 'High' : 
                       parseFloat(annualizedVolatility) > 15 ? 'Medium' : 'Low',
                maxDrawdown: maxDrawdown.toFixed(2),
                currentDrawdown: currentDrawdown.toFixed(2),
                sharpeRatio: sharpeRatio,
                sortinoRatio: sortinoRatio
            },
            bollingerBands: {
                upper: currentUpper?.toFixed(2),
                middle: currentMiddle?.toFixed(2),
                lower: currentLower?.toFixed(2),
                position: currentPrice > currentUpper ? 'Above upper band (Overbought)' :
                         currentPrice < currentLower ? 'Below lower band (Oversold)' :
                         currentPrice > currentMiddle ? 'Above middle (Bullish zone)' : 'Below middle (Bearish zone)'
            },
            volume: {
                average: Math.round(avgVolume),
                recent: Math.round(recentAvgVolume),
                trend: volumeTrend,
                confirmation: volumeTrend === 'Increasing' && trend.direction.includes('Uptrend') ? 'Yes' : 
                             volumeTrend === 'Increasing' && trend.direction.includes('Downtrend') ? 'Yes' : 'No'
            },
            levels: supportResistance,
            trend: trend
        };
    }

    // ============================================
    // CALCULATION METHODS
    // ============================================
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

    calculateEMA(data, period) {
        const ema = [];
        const multiplier = 2 / (period + 1);
        
        let sum = 0;
        for (let i = 0; i < period; i++) {
            sum += data[i];
            ema.push(null);
        }
        ema[period - 1] = sum / period;
        
        for (let i = period; i < data.length; i++) {
            ema.push((data[i] - ema[i - 1]) * multiplier + ema[i - 1]);
        }
        
        return ema;
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

    calculateBollingerBands(data, period = 20, stdDevMultiplier = 2) {
        const sma = this.calculateSMA(data, period);
        const upper = [];
        const middle = [];
        const lower = [];
        
        for (let i = 0; i < data.length; i++) {
            if (i < period - 1) {
                upper.push(null);
                middle.push(null);
                lower.push(null);
            } else {
                const slice = data.slice(i - period + 1, i + 1);
                const mean = sma[i];
                const variance = slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period;
                const stdDev = Math.sqrt(variance);
                
                upper.push(mean + (stdDev * stdDevMultiplier));
                middle.push(mean);
                lower.push(mean - (stdDev * stdDevMultiplier));
            }
        }
        
        return { upper, middle, lower };
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
            support: supports.length > 0 ? [...new Set(supports.slice(-5))].map(s => s.toFixed(2)) : [],
            resistance: resistances.length > 0 ? [...new Set(resistances.slice(-5))].map(r => r.toFixed(2)) : []
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
            direction = 'Sideways/Consolidation';
            strength = 'Weak';
        }
        
        // Calculate trend duration
        let duration = 0;
        const isUptrend = direction.includes('Uptrend');
        for (let i = closes.length - 1; i >= 20; i--) {
            if (isUptrend) {
                if (closes[i] > sma20[i]) {
                    duration++;
                } else {
                    break;
                }
            } else {
                if (closes[i] < sma20[i]) {
                    duration++;
                } else {
                    break;
                }
            }
        }
        
        return { direction, strength, duration };
    }

    // ============================================
    // CONTEXTE PERSISTANT
    // ============================================
    getLastAnalyzedSymbol() {
        return this.currentContext.symbol || null;
    }

    setLastAnalyzedSymbol(symbol) {
        this.currentContext.symbol = symbol;
        this.currentContext.lastAnalysisTime = Date.now();
    }

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
    // QUERY HANDLERS
    // ============================================
    async handlePriceHistoryQuery(message, entities, context) {
        console.log('📈 Processing price history query...');

        const aiResponse = await this.geminiAI.generateResponse(message, context);
        
        if (entities.symbols && entities.symbols.length > 0) {
            const symbol = entities.symbols[0];
            const timeframe = entities.timeframes[0] || '1y';
            
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
            "Analyze volatility",
            "Compare with sector",
            "Risk assessment",
            "Price targets"
        ];

        return aiResponse;
    }

    async handleStockQuery(message, entities, context) {
        console.log('📈 Processing stock query...');
        const aiResponse = await this.geminiAI.generateResponse(message, context);
        aiResponse.suggestions = this.config.suggestions.followUp.stock;
        return aiResponse;
    }

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

    async handleIPOQuery(message, entities, context) {
        console.log('📊 Processing IPO query...');
        let aiResponse = await this.geminiAI.generateResponse(message, context);
        
        if (entities.symbols.length > 0 && this.ipoAnalyzer) {
            const symbol = entities.symbols[0];
            try {
                const ipoAnalysis = await this.ipoAnalyzer.analyzeIPO(symbol);
                if (ipoAnalysis) {
                    aiResponse.text += `\n\n📊 **IPO Analysis for ${symbol}:**\n`;
                    aiResponse.text += this.formatIPOAnalysis(ipoAnalysis);
                }
            } catch (error) {
                console.warn('IPO analysis failed:', error);
            }
        }

        aiResponse.suggestions = this.config.suggestions.followUp.ipo;
        return aiResponse;
    }

    async handleGeneralQuery(message, context) {
        console.log('💡 Processing general finance query...');
        const aiResponse = await this.geminiAI.generateResponse(message, context);
        aiResponse.suggestions = this.config.suggestions.initial;
        return aiResponse;
    }

    async handleGenericQuery(message, context) {
        console.log('🤔 Processing generic query...');
        const aiResponse = await this.geminiAI.generateResponse(message, context);
        aiResponse.suggestions = this.config.suggestions.initial;
        return aiResponse;
    }

    formatIPOAnalysis(analysis) {
        let formatted = `Score: ${analysis.score}/100\n`;
        if (analysis.strengths) {
            formatted += `Strengths: ${analysis.strengths.join(', ')}\n`;
        }
        if (analysis.risks) {
            formatted += `Risks: ${analysis.risks.join(', ')}\n`;
        }
        return formatted;
    }

    // ============================================
    // UTILITIES
    // ============================================
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
            lastAnalysisTime: null,
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