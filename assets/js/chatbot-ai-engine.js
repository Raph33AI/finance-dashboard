// // ============================================
// // FINANCIAL CHATBOT - AI ENGINE v6.1 WALL STREET PRO
// // ✅ CORRECTION: Optimisation appels API + Génération graphiques
// // Advanced Analytics: Sharpe, Sortino, Greeks, Correlations, Fair Value
// // ULTRA-OPTIMIZED CHART GENERATION SYSTEM
// // ============================================

// class FinancialChatbotEngine {
//     constructor(config) {
//         this.config = config;
//         this.geminiAI = null;
//         this.ipoAnalyzer = null;
//         this.analytics = null;
//         this.charts = null;
        
//         this.isProcessing = false;
        
//         this.conversationContext = {
//             lastSymbol: null,
//             lastTimeframe: '1y',
//             lastTopic: null,
//             userPreferences: {}
//         };
        
//         this.metrics = {
//             totalMessages: 0,
//             successfulResponses: 0,
//             errors: 0,
//             averageResponseTime: 0,
//             totalResponseTime: 0
//         };
        
//         this.responseCache = new Map();
//         this.cacheExpiration = 300000; // 5 minutes
        
//         this.initialize();
//     }

//     async initialize() {
//         try {
//             if (typeof GeminiAI !== 'undefined') {
//                 this.geminiAI = new GeminiAI(this.config);
//                 console.log('✅ Gemini AI initialized');
//             }

//             if (typeof IPOAnalyzer !== 'undefined') {
//                 this.ipoAnalyzer = new IPOAnalyzer(this.config);
//                 console.log('✅ IPO Analyzer initialized');
//             }

//             if (typeof FinancialAnalytics !== 'undefined') {
//                 this.analytics = new FinancialAnalytics(this.config);
//                 console.log('✅ Analytics initialized');
//             }

//             if (typeof ChatbotCharts !== 'undefined') {
//                 this.charts = new ChatbotCharts(this.config);
//                 console.log('✅ Charts initialized');
//             }

//             console.log('🎉 Conversational Financial AI v6.1 WALL STREET PRO ready!');
//             console.log('📊 Advanced Analytics: Sharpe, Sortino, Correlations, Greeks, Fair Value');
//             console.log('📈 Ultra-Optimized Chart Generation System');
            
//         } catch (error) {
//             console.error('❌ Engine initialization error:', error);
//         }
//     }

//     // ============================================
//     // PROCESSUS PRINCIPAL
//     // ============================================
//     async processMessage(userMessage) {
//         const startTime = performance.now();
        
//         try {
//             this.metrics.totalMessages++;

//             const cachedResponse = this.checkCache(userMessage);
//             if (cachedResponse) {
//                 console.log('✅ Returning cached response');
//                 return cachedResponse;
//             }

//             // Analyse du message
//             const analysis = this.analyzeMessage(userMessage);
            
//             console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
//             console.log('📝 Processing:', userMessage.substring(0, 80) + '...');
//             console.log('🎯 Type:', analysis.type);
//             console.log('🏷 Intents:', analysis.intents.join(', '));
//             console.log('📊 Symbols:', analysis.symbols.join(', ') || 'None');
//             if (analysis.subIntents && analysis.subIntents.length > 0) {
//                 console.log('📌 Sub-Intents:', analysis.subIntents.join(', '));
//             }
//             if (analysis.isComparison) {
//                 console.log('⚖ COMPARISON MODE:', analysis.comparisonSymbols.join(' vs '));
//             }
//             console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

//             // Construction du contexte intelligent
//             const context = await this.buildSmartContext(userMessage, analysis);
            
//             // Ajout de l'intent au contexte
//             context.intent = {
//                 type: analysis.type,
//                 intents: analysis.intents,
//                 subIntents: analysis.subIntents || [],
//                 isComparison: analysis.isComparison
//             };
            
//             // Génération de la réponse via Gemini
//             const response = await this.geminiAI.generateResponse(userMessage, context);
            
//             // Ajout des éléments visuels
//             response.visualCards = await this.generateVisualCards(context, analysis);
//             response.chartRequests = await this.generateChartRequests(context, analysis);
//             response.suggestions = this.generateAdvancedSuggestions(analysis, context);
//             response.processingTime = performance.now() - startTime;

//             this.cacheResponse(userMessage, response);
//             this.updateMetrics(true, response.processingTime);
//             this.updateConversationContext(analysis);

//             console.log(`✅ Response generated in ${response.processingTime.toFixed(0)}ms`);

//             return response;

//         } catch (error) {
//             console.error('❌ Message processing error:', error);
//             this.updateMetrics(false, performance.now() - startTime);
            
//             return {
//                 text: `⚠ **An error occurred:** ${error.message}\n\nPlease try again or rephrase your question.`,
//                 error: true,
//                 visualCards: [],
//                 chartRequests: [],
//                 suggestions: this.config.suggestions.initial
//             };
//         }
//     }

//     // ============================================
//     // ANALYSE COMPLÈTE DU MESSAGE (ULTRA-PRÉCISE)
//     // ============================================
//     analyzeMessage(message) {
//         const lowerMessage = message.toLowerCase();
        
//         const symbols = this.extractSymbols(message);
//         const isComparison = this.detectComparisonIntent(message);
//         const comparisonSymbols = isComparison ? this.extractComparisonSymbols(message) : [];
//         const timeframes = this.extractTimeframes(message);
        
//         let type = 'CONVERSATIONAL';
//         const intents = [];
//         const subIntents = [];
        
//         // PRIORITÉ 1: Market News
//         if (this.detectMarketNewsIntent(message)) {
//             type = 'MARKET_NEWS_QUERY';
//             intents.push('MARKET_NEWS');
//         }
        
//         // PRIORITÉ 2: Comparison (avec détection des sous-intents)
//         else if (isComparison && comparisonSymbols.length >= 2) {
//             type = 'STOCK_COMPARISON';
//             intents.push('COMPARISON');
            
//             // Détection des sous-intents de comparaison
//             if (/\b(correlation|correlate|relationship|how related|move together)\b/i.test(lowerMessage)) {
//                 subIntents.push('CORRELATION_FOCUS');
//                 console.log('🎯 Sub-intent: CORRELATION FOCUS');
//             }
            
//             if (/\b(risk.?adjusted|sharpe|sortino|alpha|beta|risk return|risk.?reward)\b/i.test(lowerMessage)) {
//                 subIntents.push('RISK_ADJUSTED_FOCUS');
//                 console.log('🎯 Sub-intent: RISK-ADJUSTED RETURNS FOCUS');
//             }
            
//             if (/\b(volatility|volatile|drawdown|risk|safer|riskier)\b/i.test(lowerMessage)) {
//                 subIntents.push('VOLATILITY_FOCUS');
//                 console.log('🎯 Sub-intent: VOLATILITY FOCUS');
//             }
            
//             if (/\b(valuation|value|expensive|cheap|overvalued|undervalued|p\/e|price.?to.?earnings)\b/i.test(lowerMessage)) {
//                 subIntents.push('VALUATION_FOCUS');
//                 console.log('🎯 Sub-intent: VALUATION FOCUS');
//             }
            
//             if (/\b(growth|revenue|earnings|profit|margin|fundamental)\b/i.test(lowerMessage)) {
//                 subIntents.push('FUNDAMENTALS_FOCUS');
//                 console.log('🎯 Sub-intent: FUNDAMENTALS FOCUS');
//             }
            
//             if (/\b(performance|return|gain|winner|loser|outperform)\b/i.test(lowerMessage)) {
//                 subIntents.push('PERFORMANCE_FOCUS');
//                 console.log('🎯 Sub-intent: PERFORMANCE FOCUS');
//             }
            
//             // Par défaut, si aucun sous-intent, c'est une comparaison générale
//             if (subIntents.length === 0) {
//                 subIntents.push('GENERAL_COMPARISON');
//             }
//         }
        
//         // PRIORITÉ 3: Historical Analysis
//         else if (this.detectHistoricalIntent(message) && symbols.length > 0) {
//             type = 'HISTORICAL_ANALYSIS';
//             intents.push('HISTORICAL');
            
//             // Sous-intents pour historical
//             if (/\b(volatility|volatile|risk|drawdown)\b/i.test(lowerMessage)) {
//                 subIntents.push('VOLATILITY_ANALYSIS');
//             }
            
//             if (/\b(return|performance|gain|growth)\b/i.test(lowerMessage)) {
//                 subIntents.push('RETURN_ANALYSIS');
//             }
            
//             if (/\b(risk.?adjusted|sharpe|sortino)\b/i.test(lowerMessage)) {
//                 subIntents.push('RISK_METRICS_ANALYSIS');
//             }
//         }
        
//         // PRIORITÉ 4: IPO
//         else if (this.detectIPOIntent(message)) {
//             type = 'IPO_QUERY';
//             intents.push('IPO');
//         }
        
//         // PRIORITÉ 5: Educational
//         else if (this.detectEducationalIntent(message)) {
//             type = 'EDUCATIONAL_QUERY';
//             intents.push('EDUCATIONAL');
//         }
        
//         // PRIORITÉ 6: Stock Analysis
//         else if (symbols.length > 0) {
//             type = 'STOCK_QUERY';
//             intents.push('STOCK');
            
//             // Sous-intents avancés
//             if (this.detectAdvancedAnalysisIntent(message)) {
//                 intents.push('ADVANCED_ANALYSIS');
//             }
//             if (this.detectAnalystIntent(message)) {
//                 intents.push('ANALYST');
//                 subIntents.push('ANALYST_FOCUS');
//             }
//             if (this.detectEarningsIntent(message)) {
//                 intents.push('EARNINGS');
//                 subIntents.push('EARNINGS_FOCUS');
//             }
//             if (/\b(technical|chart|indicator|rsi|macd|moving average)\b/i.test(lowerMessage)) {
//                 subIntents.push('TECHNICAL_FOCUS');
//             }
//             if (/\b(valuation|fundamental|p\/e|earnings|revenue)\b/i.test(lowerMessage)) {
//                 subIntents.push('FUNDAMENTAL_FOCUS');
//             }
//         }
        
//         // PRIORITÉ 7: Market General
//         else if (/\b(market|indices|dow|nasdaq|s&p|sp500)\b/i.test(message)) {
//             type = 'MARKET_QUERY';
//             intents.push('MARKET');
//         }
        
//         // Ajouter les sous-intents supplémentaires
//         if (this.detectCorrelationIntent(message)) intents.push('CORRELATION');
//         if (this.detectFairValueIntent(message)) intents.push('FAIR_VALUE');
//         if (this.detectOptionsIntent(message)) intents.push('OPTIONS');
//         if (this.detectInsiderIntent(message)) intents.push('INSIDER');
//         if (this.detectSentimentIntent(message)) intents.push('SENTIMENT');
//         if (this.detectPeersIntent(message)) intents.push('PEERS');
        
//         console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
//         console.log('🎯 Analysis Complete:');
//         console.log('   Type:', type);
//         console.log('   Intents:', intents.join(', '));
//         if (subIntents.length > 0) {
//             console.log('   📌 Sub-Intents:', subIntents.join(', '));
//         }
//         console.log('   Symbols:', symbols.join(', ') || 'None');
//         console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
//         return {
//             type,
//             intents,
//             subIntents,
//             symbols: isComparison ? comparisonSymbols : symbols,
//             timeframes,
//             isComparison,
//             comparisonSymbols,
//             needsData: symbols.length > 0 || intents.length > 0 || isComparison || type === 'MARKET_NEWS_QUERY'
//         };
//     }

//     // ============================================
//     // DÉTECTEURS D'INTENT WALL STREET
//     // ============================================
    
//     detectAdvancedAnalysisIntent(message) {
//         const keywords = [
//             'sharpe', 'sortino', 'risk-adjusted', 'alpha', 'beta',
//             'volatility analysis', 'drawdown', 'var', 'value at risk',
//             'correlation', 'covariance', 'diversification'
//         ];
//         return keywords.some(keyword => message.toLowerCase().includes(keyword));
//     }
    
//     detectCorrelationIntent(message) {
//         const keywords = ['correlation', 'correlate', 'relationship between', 'how related'];
//         return keywords.some(keyword => message.toLowerCase().includes(keyword));
//     }
    
//     detectFairValueIntent(message) {
//         const keywords = [
//             'fair value', 'dcf', 'discounted cash flow', 'intrinsic value',
//             'valuation', 'worth', 'overvalued', 'undervalued'
//         ];
//         return keywords.some(keyword => message.toLowerCase().includes(keyword));
//     }
    
//     detectOptionsIntent(message) {
//         const keywords = ['option', 'call', 'put', 'strike', 'greeks', 'delta', 'gamma', 'theta', 'vega'];
//         return keywords.some(keyword => message.toLowerCase().includes(keyword));
//     }
    
//     detectInsiderIntent(message) {
//         const keywords = ['insider', 'insider trading', 'insider buy', 'insider sell', 'institutional'];
//         return keywords.some(keyword => message.toLowerCase().includes(keyword));
//     }
    
//     detectComparisonIntent(message) {
//         const keywords = [
//             'compare', 'vs', 'versus', 'against', 'comparison', 
//             'difference between', 'better than', 'which is better',
//             'compare with', 'compare to'
//         ];
//         const messageLower = message.toLowerCase();
//         return keywords.some(keyword => messageLower.includes(keyword));
//     }
    
//     detectHistoricalIntent(message) {
//         const keywords = [
//             'evolution', 'historical', 'history', 'performance over',
//             'last 5 years', 'past years', 'over the years', 'trend over',
//             'since', 'how has', 'performed in', 'over time'
//         ];
        
//         const messageLower = message.toLowerCase();
        
//         const hasHistoricalKeyword = keywords.some(keyword => messageLower.includes(keyword));
//         const hasTimeframe = /\d+\s*(year|month|day|week)|ytd|max/i.test(messageLower);
        
//         return hasHistoricalKeyword || hasTimeframe;
//     }

//     detectEducationalIntent(message) {
//         const keywords = [
//             'what is', 'explain', 'define', 'tell me about',
//             'how does', 'what does', 'meaning of', 'help me understand'
//         ];
//         const messageLower = message.toLowerCase();
//         return keywords.some(keyword => messageLower.includes(keyword));
//     }
    
//     detectMarketNewsIntent(message) {
//         const strictKeywords = [
//             'what\'s happening in the market',
//             'market today',
//             'what\'s happening today',
//             'market news today',
//             'today\'s market',
//             'market update',
//             'how is the market'
//         ];
        
//         const messageLower = message.toLowerCase();
        
//         if (strictKeywords.some(keyword => messageLower.includes(keyword))) {
//             return true;
//         }
        
//         if (/what'?s happening/i.test(message) && !/\b[A-Z]{1,5}\b/.test(message)) {
//             return true;
//         }
        
//         return false;
//     }

//     detectIPOIntent(message) {
//         const keywords = ['ipo', 'initial public offering', 'upcoming ipo', 'new listing', 'ipo calendar', 'recent ipo', 'ipo performance'];
//         const messageLower = message.toLowerCase();
//         return keywords.some(keyword => messageLower.includes(keyword));
//     }

//     detectEarningsCalendarIntent(message) {
//         const keywords = ['earnings calendar', 'upcoming earnings', 'when does', 'report earnings', 'earnings schedule', 'earnings date'];
//         const messageLower = message.toLowerCase();
//         return keywords.some(keyword => messageLower.includes(keyword));
//     }

//     detectAnalystIntent(message) {
//         const keywords = ['analyst', 'recommendation', 'price target', 'upgrade', 'downgrade', 'what do analysts', 'analyst rating', 'consensus', 'analyst opinion'];
//         const messageLower = message.toLowerCase();
//         return keywords.some(keyword => messageLower.includes(keyword));
//     }

//     detectEarningsIntent(message) {
//         const keywords = ['earnings', 'eps', 'earnings surprise', 'beat earnings', 'miss earnings', 'earnings history', 'quarterly results', 'earnings report'];
//         const messageLower = message.toLowerCase();
//         return keywords.some(keyword => messageLower.includes(keyword));
//     }

//     detectPeersIntent(message) {
//         const keywords = ['peers', 'competitors', 'similar companies', 'compare with', 'competition', 'industry peers', 'sector peers'];
//         const messageLower = message.toLowerCase();
//         return keywords.some(keyword => messageLower.includes(keyword));
//     }

//     detectSentimentIntent(message) {
//         const keywords = ['sentiment', 'news sentiment', 'market sentiment', 'how is the news', 'news analysis', 'public opinion', 'investor sentiment'];
//         const messageLower = message.toLowerCase();
//         return keywords.some(keyword => messageLower.includes(keyword));
//     }

//     // ============================================
//     // EXTRACTION SYMBOLES
//     // ============================================
    
//     extractSymbols(message) {
//         const symbols = new Set();
        
//         const upperRegex = /\b[A-Z]{1,5}\b/g;
//         const upperSymbols = message.match(upperRegex) || [];
//         const excludeWords = ['IPO', 'USA', 'CEO', 'CFO', 'AI', 'THE', 'AND', 'FOR', 'NOT', 'ETF', 'API', 'FAQ', 'EPS', 'ROE', 'ROA', 'TTM', 'DCF', 'VAR'];
//         upperSymbols.filter(s => !excludeWords.includes(s)).forEach(s => symbols.add(s));
        
//         const knownStocks = [
//             'NVDA', 'AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'TSLA', 'META', 'NFLX',
//             'AMD', 'INTC', 'QCOM', 'AVGO', 'TXN', 'MU',
//             'SPY', 'QQQ', 'DIA', 'IWM',
//             'COIN', 'PYPL', 'V', 'MA', 'JPM', 'BAC', 'GS', 'MS',
//             'DIS', 'WMT', 'MCD', 'NKE', 'SBUX', 'TGT', 'HD', 'COST',
//             'PFE', 'JNJ', 'UNH', 'ABBV', 'MRK',
//             'XOM', 'CVX', 'BA', 'CAT', 'GE', 'T', 'VZ', 'TMUS'
//         ];
        
//         const lowerMessage = message.toLowerCase();
//         knownStocks.forEach(symbol => {
//             if (new RegExp(`\\b${symbol.toLowerCase()}\\b`, 'i').test(lowerMessage)) {
//                 symbols.add(symbol);
//             }
//         });
        
//         const companyMapping = this.getCompanySymbolMapping();
//         for (const [companyName, symbol] of Object.entries(companyMapping)) {
//             if (new RegExp(`\\b${companyName}\\b`, 'i').test(lowerMessage)) {
//                 symbols.add(symbol);
//             }
//         }
        
//         if (symbols.size === 0 && this.conversationContext.lastSymbol) {
//             symbols.add(this.conversationContext.lastSymbol);
//         }
        
//         return Array.from(symbols);
//     }
    
//     extractComparisonSymbols(message) {
//         const symbols = this.extractSymbols(message);
        
//         if (symbols.length >= 2) {
//             return symbols.slice(0, 4);
//         }
        
//         const patterns = [
//             /compare\s+([A-Z]{1,5})\s+(?:with|vs|versus|and|to)\s+([A-Z]{1,5})/i,
//             /([A-Z]{1,5})\s+(?:vs|versus)\s+([A-Z]{1,5})/i,
//             /([A-Z]{1,5})\s+and\s+([A-Z]{1,5})/i
//         ];
        
//         for (const pattern of patterns) {
//             const match = message.match(pattern);
//             if (match) {
//                 return [match[1], match[2]];
//             }
//         }
        
//         return symbols;
//     }

//     extractTimeframes(message) {
//         const timeframePatterns = {
//             '1d': /\b(today|1\s*day)\b/i,
//             '1w': /\b(week|1\s*week|7\s*days?)\b/i,
//             '1M': /\b(month|1\s*month|30\s*days?)\b/i,
//             '3M': /\b(3\s*months?|quarter)\b/i,
//             '6M': /\b(6\s*months?)\b/i,
//             '1y': /\b(year|1\s*year|12\s*months?)\b/i,
//             '2y': /\b(2\s*years?|24\s*months?)\b/i,
//             '5y': /\b(5\s*years?|60\s*months?)\b/i,
//             '10y': /\b(10\s*years?)\b/i,
//             'ytd': /\b(ytd|year\s*to\s*date)\b/i,
//             'max': /\b(all\s*time|max|maximum|since\s*inception)\b/i
//         };

//         const found = [];
//         for (const [timeframe, pattern] of Object.entries(timeframePatterns)) {
//             if (pattern.test(message)) {
//                 found.push(timeframe);
//             }
//         }

//         if (found.length === 0 && /\b(evolution|historical|history|performance|trend)\b/i.test(message)) {
//             found.push(this.conversationContext.lastTimeframe || '1y');
//         }

//         return found;
//     }

//     getCompanySymbolMapping() {
//         return {
//             'nvidia': 'NVDA',
//             'apple': 'AAPL',
//             'microsoft': 'MSFT',
//             'google': 'GOOGL',
//             'alphabet': 'GOOGL',
//             'amazon': 'AMZN',
//             'tesla': 'TSLA',
//             'meta': 'META',
//             'facebook': 'META',
//             'netflix': 'NFLX',
//             'amd': 'AMD',
//             'intel': 'INTC',
//             'coinbase': 'COIN',
//             'paypal': 'PYPL',
//             'visa': 'V',
//             'mastercard': 'MA',
//             'jpmorgan': 'JPM',
//             'disney': 'DIS',
//             'walmart': 'WMT',
//             'nike': 'NKE',
//             'starbucks': 'SBUX',
//             'boeing': 'BA',
//             'caterpillar': 'CAT'
//         };
//     }

//     // ============================================
//     // CONSTRUCTION DE CONTEXTE ULTRA-COMPLET
//     // ============================================
    
//     async buildSmartContext(message, analysis) {
//         const context = {
//             timestamp: new Date().toISOString(),
//             userMessage: message,
//             detectedEntities: {
//                 symbols: analysis.symbols,
//                 timeframes: analysis.timeframes
//             },
//             intent: { 
//                 type: analysis.type,
//                 intents: analysis.intents,
//                 isComparison: analysis.isComparison
//             }
//         };

//         // PRIORITÉ 1: Market News
//         if (analysis.type === 'MARKET_NEWS_QUERY') {
//             console.log('📰 Loading MARKET NEWS data...');
            
//             try {
//                 const marketNews = await this.analytics.getMarketNews('general').catch(() => []);
//                 if (marketNews && marketNews.length > 0) {
//                     context.marketNews = marketNews.slice(0, 15);
//                     console.log(`✅ Loaded ${context.marketNews.length} market news articles`);
//                 }
                
//                 const [sp500, nasdaq, dow] = await Promise.all([
//                     this.analytics.getStockData('SPY').catch(() => null),
//                     this.analytics.getStockData('QQQ').catch(() => null),
//                     this.analytics.getStockData('DIA').catch(() => null)
//                 ]);
                
//                 context.marketData = {};
//                 if (sp500) {
//                     context.marketData.sp500 = {
//                         price: sp500.quote.current,
//                         changePercent: sp500.quote.changePercent
//                     };
//                 }
//                 if (nasdaq) {
//                     context.marketData.nasdaq = {
//                         price: nasdaq.quote.current,
//                         changePercent: nasdaq.quote.changePercent
//                     };
//                 }
//                 if (dow) {
//                     context.marketData.dow = {
//                         price: dow.quote.current,
//                         changePercent: dow.quote.changePercent
//                     };
//                 }
                
//                 console.log('✅ Market indices loaded');
                
//             } catch (error) {
//                 console.error('❌ Error loading market news data:', error);
//             }
            
//             return context;
//         }

//         // PRIORITÉ 2: Educational Questions
//         if (analysis.type === 'EDUCATIONAL_QUERY') {
//             console.log('📚 Educational question detected - no market data needed');
//             return context;
//         }

//         // PRIORITÉ 3: IPO Questions
//         if (analysis.type === 'IPO_QUERY') {
//             console.log('💰 Loading IPO data...');
            
//             try {
//                 const ipos = await this.analytics.getIPOCalendar().catch(() => []);
//                 if (ipos && ipos.length > 0) {
//                     context.upcomingIPOs = ipos.slice(0, 20);
//                     console.log(`✅ Loaded ${context.upcomingIPOs.length} upcoming IPOs`);
//                 }
//             } catch (error) {
//                 console.error('❌ Error fetching IPO calendar:', error);
//             }
            
//             return context;
//         }

//         if (!analysis.needsData) {
//             console.log('ℹ No market data needed for this query');
//             return context;
//         }

//         // PRIORITÉ 4: Comparison Data
//         if (analysis.isComparison && analysis.comparisonSymbols.length >= 2) {
//             console.log(`⚖ Loading comparison data for: ${analysis.comparisonSymbols.join(' vs ')}`);
//             context.comparisonData = await this.loadComparisonData(analysis.comparisonSymbols, analysis.timeframes[0]);
            
//             if (context.comparisonData.advancedMetrics) {
//                 context.advancedMetrics = context.comparisonData.advancedMetrics;
//             }
//             if (context.comparisonData.riskMetrics) {
//                 context.riskMetrics = context.comparisonData.riskMetrics;
//             }
//             if (context.comparisonData.historicalStats) {
//                 context.historicalStats = context.comparisonData.historicalStats;
//             }
            
//             if (context.comparisonData.timeSeries && context.comparisonData.timeSeries.length >= 2) {
//                 context.correlationAnalysis = this.calculateCorrelation(context.comparisonData.timeSeries);
//                 console.log(`✅ Correlation: ${context.correlationAnalysis.correlation}`);
//             }
            
//             return context;
//         }

//         // PRIORITÉ 5: Single Stock Analysis
//         const symbol = analysis.symbols[0];
        
//         if (!symbol) {
//             console.log('⚠ No symbol detected');
//             return context;
//         }

//         console.log(`📊 Loading comprehensive data for ${symbol}...`);
        
//         try {
//             const [
//                 stockData,
//                 recommendations,
//                 priceTarget,
//                 earnings
//             ] = await Promise.all([
//                 this.analytics.getStockData(symbol).catch(() => null),
//                 this.analytics.getRecommendationTrends(symbol).catch(() => null),
//                 this.analytics.getPriceTarget(symbol).catch(() => null),
//                 this.analytics.getEarnings(symbol).catch(() => null)
//             ]);

//             if (stockData) {
//                 context.stockData = stockData;
//                 console.log(`✅ Stock data loaded: $${stockData.quote.current}`);
//             }
            
//             if (recommendations && recommendations.length > 0) {
//                 const latest = recommendations[0];
//                 const total = latest.strongBuy + latest.buy + latest.hold + latest.sell + latest.strongSell;
//                 const bullishPercent = total > 0 ? ((latest.strongBuy + latest.buy) / total * 100).toFixed(1) : 0;
                
//                 context.analystRecommendations = {
//                     period: latest.period,
//                     strongBuy: latest.strongBuy,
//                     buy: latest.buy,
//                     hold: latest.hold,
//                     sell: latest.sell,
//                     strongSell: latest.strongSell,
//                     total: total,
//                     bullishPercent: bullishPercent,
//                     consensus: this.getConsensusRating(latest),
//                     history: recommendations.slice(0, 4)
//                 };
//                 console.log(`✅ Analyst consensus: ${context.analystRecommendations.consensus}`);
//             }
            
//             if (priceTarget && priceTarget.targetMean) {
//                 const currentPrice = stockData?.quote?.current || 0;
//                 const upside = currentPrice > 0 ? ((priceTarget.targetMean - currentPrice) / currentPrice * 100).toFixed(1) : 0;
                
//                 context.priceTarget = {
//                     current: currentPrice,
//                     targetMean: priceTarget.targetMean,
//                     targetHigh: priceTarget.targetHigh,
//                     targetLow: priceTarget.targetLow,
//                     targetMedian: priceTarget.targetMedian,
//                     upside: upside,
//                     lastUpdated: priceTarget.lastUpdated
//                 };
//                 console.log(`✅ Price target: $${priceTarget.targetMean} (${upside}% upside)`);
//             }
            
//             if (earnings && earnings.length > 0) {
//                 const recentEarnings = earnings.slice(0, 8);
//                 let beatCount = 0;
//                 let missCount = 0;
                
//                 recentEarnings.forEach(e => {
//                     if (e.surprise && e.surprise > 0) beatCount++;
//                     if (e.surprise && e.surprise < 0) missCount++;
//                 });
                
//                 context.earningsHistory = {
//                     recent: recentEarnings,
//                     beatCount: beatCount,
//                     missCount: missCount,
//                     beatRate: recentEarnings.length > 0 ? ((beatCount / recentEarnings.length) * 100).toFixed(1) : 0,
//                     totalReports: earnings.length,
//                     earningsQuality: this.calculateEarningsQuality(recentEarnings)
//                 };
//                 console.log(`✅ Earnings: ${context.earningsHistory.beatRate}% beat rate`);
//             }

//             const needsHistory = analysis.type === 'HISTORICAL_ANALYSIS' || 
//                                  analysis.intents.includes('HISTORICAL') || 
//                                  analysis.intents.includes('ADVANCED_ANALYSIS') ||
//                                  /\b(history|historical|evolution|performance|trend|chart|volatility|return)\b/i.test(message);
            
//             if (needsHistory && this.analytics) {
//                 console.log('📈 Loading historical time series...');
//                 const timeframe = analysis.timeframes[0] || this.conversationContext.lastTimeframe || '1y';
//                 const outputsize = this.getOutputSize(timeframe);
                
//                 const timeSeries = await this.analytics.getTimeSeries(symbol, '1day', outputsize).catch(() => null);
                
//                 if (timeSeries && timeSeries.data && timeSeries.data.length > 0) {
//                     context.timeSeriesData = timeSeries;
//                     context.historicalStats = this.calculateHistoricalStats(timeSeries);
//                     context.technicalIndicators = this.calculateTechnicalIndicators(timeSeries);
                    
//                     context.advancedMetrics = this.calculateAdvancedMetrics(timeSeries, stockData);
//                     context.riskMetrics = this.calculateRiskMetrics(timeSeries);
                    
//                     console.log(`✅ Historical data: ${timeSeries.data.length} points, ${context.historicalStats.totalReturn}% return`);
//                 } else {
//                     console.log('⚠ No historical data available');
//                 }
//             }

//             const [
//                 revenueEstimates,
//                 epsEstimates,
//                 peers,
//                 companyNews,
//                 sentiment,
//                 upgradesDowngrades
//             ] = await Promise.all([
//                 this.analytics.getRevenueEstimates(symbol, 'quarterly').catch(() => null),
//                 this.analytics.getEPSEstimates(symbol, 'quarterly').catch(() => null),
//                 this.analytics.getPeers(symbol).catch(() => []),
//                 this.analytics.getCompanyNews(symbol).catch(() => []),
//                 this.analytics.analyzeNewsImpact(symbol).catch(() => null),
//                 this.analytics.getUpgradeDowngrade(symbol).catch(() => [])
//             ]);
            
//             if (revenueEstimates && revenueEstimates.length > 0) {
//                 context.revenueEstimates = revenueEstimates.slice(0, 4);
//             }
            
//             if (epsEstimates && epsEstimates.length > 0) {
//                 context.epsEstimates = epsEstimates.slice(0, 4);
//             }
            
//             if (peers && peers.length > 0) {
//                 context.peers = peers.slice(0, 10);
//             }
            
//             if (companyNews && companyNews.length > 0) {
//                 context.recentNews = companyNews.slice(0, 10).map(n => ({
//                     headline: n.headline,
//                     source: n.source,
//                     datetime: n.datetime,
//                     url: n.url
//                 }));
//             }
            
//             if (sentiment) {
//                 context.sentiment = sentiment;
//             }
            
//             if (upgradesDowngrades && upgradesDowngrades.length > 0) {
//                 context.upgradesDowngrades = upgradesDowngrades.slice(0, 10);
//             }

//         } catch (error) {
//             console.error('❌ Error loading stock data:', error);
//         }

//         console.log('✅ Context built successfully');
//         return context;
//     }

//     // ============================================
//     // CHARGEMENT DONNÉES DE COMPARAISON (AMÉLIORÉ)
//     // ============================================
    
//     async loadComparisonData(symbols, timeframe = '1y') {
//         const comparisonData = {
//             symbols: symbols,
//             stocksData: [],
//             timeSeries: [],
//             keyMetricsComparison: null,
//             advancedMetrics: {},
//             riskMetrics: {},
//             historicalStats: {}
//         };
        
//         try {
//             console.log(`📊 Loading comparison data for ${symbols.length} symbols...`);
            
//             const promises = symbols.map(async symbol => {
//                 const [stockData, timeSeries] = await Promise.all([
//                     this.analytics.getStockData(symbol).catch(() => null),
//                     this.analytics.getTimeSeries(symbol, '1day', this.getOutputSize(timeframe)).catch(() => null)
//                 ]);
                
//                 let advancedMetrics = null;
//                 let riskMetrics = null;
//                 let historicalStats = null;
                
//                 if (timeSeries && timeSeries.data && timeSeries.data.length > 0) {
//                     advancedMetrics = this.calculateAdvancedMetrics(timeSeries, stockData);
//                     riskMetrics = this.calculateRiskMetrics(timeSeries);
//                     historicalStats = this.calculateHistoricalStats(timeSeries);
                    
//                     console.log(`✅ ${symbol}: Calculated advanced metrics (Sharpe: ${advancedMetrics.sharpeRatio})`);
//                 }
                
//                 return { 
//                     symbol, 
//                     stockData, 
//                     timeSeries,
//                     advancedMetrics,
//                     riskMetrics,
//                     historicalStats
//                 };
//             });
            
//             const results = await Promise.all(promises);
            
//             results.forEach(result => {
//                 if (result.stockData) {
//                     comparisonData.stocksData.push({
//                         symbol: result.symbol,
//                         ...result.stockData
//                     });
//                 }
                
//                 if (result.timeSeries) {
//                     comparisonData.timeSeries.push({
//                         symbol: result.symbol,
//                         data: result.timeSeries.data
//                     });
//                 }
                
//                 if (result.advancedMetrics) {
//                     comparisonData.advancedMetrics[result.symbol] = result.advancedMetrics;
//                 }
                
//                 if (result.riskMetrics) {
//                     comparisonData.riskMetrics[result.symbol] = result.riskMetrics;
//                 }
                
//                 if (result.historicalStats) {
//                     comparisonData.historicalStats[result.symbol] = result.historicalStats;
//                 }
//             });
            
//             comparisonData.keyMetricsComparison = this.buildMetricsComparisonTable(comparisonData.stocksData);
            
//             console.log(`✅ Comparison data loaded for ${symbols.join(', ')}`);
            
//         } catch (error) {
//             console.error('❌ Error loading comparison data:', error);
//         }
        
//         return comparisonData;
//     }
    
//     buildMetricsComparisonTable(stocksData) {
//         if (!stocksData || stocksData.length === 0) return null;
        
//         const metrics = [
//             { key: 'quote.current', label: 'Current Price', format: (v) => `$${v?.toFixed(2) || 'N/A'}` },
//             { key: 'quote.changePercent', label: 'Change %', format: (v) => `${v > 0 ? '+' : ''}${v?.toFixed(2) || 'N/A'}%` },
//             { key: 'profile.marketCap', label: 'Market Cap', format: (v) => `$${v || 'N/A'}B` },
//             { key: 'metrics.peRatio', label: 'P/E Ratio', format: (v) => v || 'N/A' },
//             { key: 'metrics.eps', label: 'EPS (TTM)', format: (v) => `$${v || 'N/A'}` },
//             { key: 'metrics.dividendYield', label: 'Dividend Yield', format: (v) => `${v || 'N/A'}%` },
//             { key: 'metrics.beta', label: 'Beta', format: (v) => v || 'N/A' },
//             { key: 'metrics.roe', label: 'ROE', format: (v) => `${v || 'N/A'}%` },
//             { key: 'metrics.profitMargin', label: 'Profit Margin', format: (v) => `${v || 'N/A'}%` }
//         ];
        
//         const table = {
//             headers: ['Metric', ...stocksData.map(s => s.symbol)],
//             rows: []
//         };
        
//         metrics.forEach(metric => {
//             const row = [metric.label];
            
//             stocksData.forEach(stock => {
//                 const value = this.getNestedValue(stock, metric.key);
//                 row.push(metric.format(value));
//             });
            
//             table.rows.push(row);
//         });
        
//         return table;
//     }
    
//     getNestedValue(obj, path) {
//         return path.split('.').reduce((current, key) => current?.[key], obj);
//     }

//     // ════════════════════════════════════════════════════════════
//     // GÉNÉRATION INTELLIGENTE DE GRAPHIQUES (ULTRA-OPTIMISÉE)
//     // ════════════════════════════════════════════════════════════

//     async generateChartRequests(context, analysis) {
//         const chartRequests = [];
        
//         console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
//         console.log('📊 GENERATING CHART REQUESTS');
//         console.log('   Type:', analysis.type);
//         console.log('   Intents:', analysis.intents.join(', '));
//         console.log('   Sub-Intents:', analysis.subIntents?.join(', ') || 'None');
//         console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
//         // PRIORITÉ 1: COMPARAISONS (avec sous-intents)
//         if (analysis.isComparison && context.comparisonData) {
//             const { symbols, stocksData, timeSeries } = context.comparisonData;
//             const subIntents = analysis.subIntents || [];
            
//             if (subIntents.includes('CORRELATION_FOCUS') && timeSeries?.length >= 2) {
//                 console.log('📈 Adding CORRELATION charts');
                
//                 chartRequests.push({
//                     type: 'scatter-correlation',
//                     title: `${symbols[0]} vs ${symbols[1]} - Correlation Analysis`,
//                     symbols: symbols,
//                     timeSeries: timeSeries,
//                     correlationData: context.correlationAnalysis,
//                     description: 'Daily returns scatter plot with regression line'
//                 });
                
//                 chartRequests.push({
//                     type: 'normalized-comparison',
//                     title: `${symbols.join(' vs ')} - Normalized Performance (Base 100)`,
//                     symbols: symbols,
//                     timeSeries: timeSeries,
//                     timeframe: analysis.timeframes[0] || '1y',
//                     description: 'Price movements normalized to show relative performance'
//                 });
                
//                 chartRequests.push({
//                     type: 'rolling-correlation',
//                     title: `${symbols[0]}-${symbols[1]} Rolling 30-Day Correlation`,
//                     symbols: symbols,
//                     timeSeries: timeSeries,
//                     window: 30,
//                     description: 'How correlation changes over time'
//                 });
//             }
            
//             else if (subIntents.includes('RISK_ADJUSTED_FOCUS') && stocksData?.length >= 2) {
//                 console.log('📊 Adding RISK-ADJUSTED RETURNS charts');
                
//                 chartRequests.push({
//                     type: 'risk-metrics-comparison',
//                     title: `${symbols.join(' vs ')} - Risk-Adjusted Returns Comparison`,
//                     symbols: symbols,
//                     metrics: ['sharpeRatio', 'sortinoRatio', 'calmarRatio', 'treynorRatio'],
//                     data: symbols.map(symbol => ({
//                         symbol: symbol,
//                         sharpe: context.advancedMetrics?.[symbol]?.sharpeRatio || 'N/A',
//                         sortino: context.advancedMetrics?.[symbol]?.sortinoRatio || 'N/A',
//                         calmar: context.advancedMetrics?.[symbol]?.calmarRatio || 'N/A',
//                         treynor: context.advancedMetrics?.[symbol]?.treynorRatio || 'N/A'
//                     })),
//                     description: 'Higher is better for all metrics'
//                 });
                
//                 chartRequests.push({
//                     type: 'return-vs-risk-scatter',
//                     title: `${symbols.join(' vs ')} - Return vs Risk Profile`,
//                     symbols: symbols,
//                     data: symbols.map(symbol => ({
//                         symbol: symbol,
//                         return: parseFloat(context.historicalStats?.[symbol]?.annualizedReturn) || 0,
//                         risk: parseFloat(context.historicalStats?.[symbol]?.volatility) || 0,
//                         sharpe: parseFloat(context.advancedMetrics?.[symbol]?.sharpeRatio) || 0
//                     })),
//                     description: 'Top-right quadrant = High return, Low risk (ideal)'
//                 });
                
//                 chartRequests.push({
//                     type: 'alpha-beta-chart',
//                     title: `${symbols.join(' vs ')} - Alpha & Beta Analysis`,
//                     symbols: symbols,
//                     data: symbols.map(symbol => {
//                         const stock = stocksData.find(s => s.symbol === symbol);
//                         return {
//                             symbol: symbol,
//                             alpha: parseFloat(context.advancedMetrics?.[symbol]?.alpha) || 0,
//                             beta: stock?.metrics?.beta || 1
//                         };
//                     }),
//                     description: 'Alpha > 0 = Outperforming market | Beta > 1 = More volatile than market'
//                 });
//             }
            
//             else if (subIntents.includes('VOLATILITY_FOCUS') && timeSeries?.length >= 2) {
//                 console.log('📉 Adding VOLATILITY charts');
                
//                 chartRequests.push({
//                     type: 'rolling-volatility',
//                     title: `${symbols.join(' vs ')} - Rolling 30-Day Volatility`,
//                     symbols: symbols,
//                     timeSeries: timeSeries,
//                     window: 30,
//                     description: 'Lower is less risky'
//                 });
                
//                 chartRequests.push({
//                     type: 'drawdown-comparison',
//                     title: `${symbols.join(' vs ')} - Maximum Drawdown Analysis`,
//                     symbols: symbols,
//                     timeSeries: timeSeries,
//                     description: 'Depth and duration of price declines from peaks'
//                 });
                
//                 chartRequests.push({
//                     type: 'var-comparison',
//                     title: `${symbols.join(' vs ')} - Value at Risk (95% Confidence)`,
//                     symbols: symbols,
//                     data: symbols.map(symbol => ({
//                         symbol: symbol,
//                         var95: context.riskMetrics?.[symbol]?.var95 || 'N/A',
//                         cvar95: context.riskMetrics?.[symbol]?.cvar95 || 'N/A'
//                     })),
//                     description: 'Expected maximum loss in worst 5% of days'
//                 });
//             }
            
//             else if (subIntents.includes('VALUATION_FOCUS') && stocksData?.length >= 2) {
//                 console.log('💰 Adding VALUATION charts');
                
//                 chartRequests.push({
//                     type: 'valuation-multiples',
//                     title: `${symbols.join(' vs ')} - Valuation Multiples Comparison`,
//                     symbols: symbols,
//                     data: stocksData.map(stock => ({
//                         symbol: stock.symbol,
//                         pe: stock.metrics?.peRatio || 'N/A',
//                         pb: stock.metrics?.priceToBook || 'N/A',
//                         ps: stock.metrics?.priceToSales || 'N/A',
//                         peg: stock.metrics?.pegRatio || 'N/A'
//                     })),
//                     description: 'Lower multiples may indicate undervaluation'
//                 });
                
//                 chartRequests.push({
//                     type: 'price-to-fair-value',
//                     title: `${symbols.join(' vs ')} - Current Price vs Analyst Fair Value`,
//                     symbols: symbols,
//                     data: stocksData.map(stock => ({
//                         symbol: stock.symbol,
//                         currentPrice: stock.quote?.current || 0,
//                         fairValue: context.priceTarget?.[stock.symbol]?.targetMean || 0,
//                         upside: context.priceTarget?.[stock.symbol]?.upside || 0
//                     })),
//                     description: 'Gap indicates potential upside/downside'
//                 });
//             }
            
//             else if (subIntents.includes('FUNDAMENTALS_FOCUS') && stocksData?.length >= 2) {
//                 console.log('📋 Adding FUNDAMENTALS charts');
                
//                 chartRequests.push({
//                     type: 'profitability-comparison',
//                     title: `${symbols.join(' vs ')} - Profitability Metrics`,
//                     symbols: symbols,
//                     data: stocksData.map(stock => ({
//                         symbol: stock.symbol,
//                         roe: stock.metrics?.roe || 'N/A',
//                         roa: stock.metrics?.roa || 'N/A',
//                         profitMargin: stock.metrics?.profitMargin || 'N/A',
//                         operatingMargin: stock.metrics?.operatingMargin || 'N/A'
//                     })),
//                     description: 'Higher percentages indicate better profitability'
//                 });
                
//                 chartRequests.push({
//                     type: 'growth-comparison',
//                     title: `${symbols.join(' vs ')} - Growth Metrics`,
//                     symbols: symbols,
//                     data: stocksData.map(stock => ({
//                         symbol: stock.symbol,
//                         revenueGrowth: stock.metrics?.revenueGrowth || 'N/A',
//                         epsGrowth: stock.metrics?.epsGrowth || 'N/A',
//                         earningsGrowth: stock.metrics?.earningsGrowth || 'N/A'
//                     })),
//                     description: 'Year-over-year growth rates'
//                 });
//             }
            
//             else {
//                 console.log('📊 Adding GENERAL COMPARISON charts');
                
//                 if (timeSeries?.length >= 2) {
//                     chartRequests.push({
//                         type: 'normalized-comparison',
//                         title: `${symbols.join(' vs ')} - Price Performance Comparison`,
//                         symbols: symbols,
//                         timeSeries: timeSeries,
//                         timeframe: analysis.timeframes[0] || '1y',
//                         description: 'Normalized to 100 at start date'
//                     });
//                 }
                
//                 if (context.comparisonData.keyMetricsComparison) {
//                     chartRequests.push({
//                         type: 'metrics-table',
//                         title: `${symbols.join(' vs ')} - Key Metrics Comparison`,
//                         data: context.comparisonData.keyMetricsComparison,
//                         description: 'Side-by-side comparison of fundamental metrics'
//                     });
//                 }
                
//                 if (timeSeries?.length >= 2) {
//                     chartRequests.push({
//                         type: 'returns-bar-chart',
//                         title: `${symbols.join(' vs ')} - Total Returns`,
//                         symbols: symbols,
//                         data: timeSeries.map(series => {
//                             const firstPrice = series.data[0]?.close || 1;
//                             const lastPrice = series.data[series.data.length - 1]?.close || 1;
//                             const totalReturn = ((lastPrice - firstPrice) / firstPrice * 100).toFixed(2);
//                             return {
//                                 symbol: series.symbol,
//                                 return: totalReturn
//                             };
//                         }),
//                         timeframe: analysis.timeframes[0] || '1y',
//                         description: 'Percentage gain/loss over period'
//                     });
//                 }
//             }
//         }
        
//         // PRIORITÉ 2: ANALYSE HISTORIQUE (stock unique)
//         else if (analysis.type === 'HISTORICAL_ANALYSIS' && context.timeSeriesData) {
//             const symbol = analysis.symbols[0];
//             const subIntents = analysis.subIntents || [];
            
//             console.log(`📈 Adding HISTORICAL ANALYSIS charts for ${symbol}`);
            
//             chartRequests.push({
//                 type: 'candlestick-with-indicators',
//                 symbol: symbol,
//                 data: context.timeSeriesData,
//                 indicators: ['sma20', 'sma50', 'sma200'],
//                 timeframe: analysis.timeframes[0] || '1y',
//                 title: `${symbol} - Price History with Moving Averages`,
//                 description: 'Price action with key technical indicators'
//             });
            
//             if (subIntents.includes('VOLATILITY_ANALYSIS')) {
//                 chartRequests.push({
//                     type: 'volatility-chart',
//                     symbol: symbol,
//                     data: context.timeSeriesData,
//                     title: `${symbol} - Historical Volatility Analysis`,
//                     description: '30-day rolling volatility'
//                 });
                
//                 chartRequests.push({
//                     type: 'drawdown-chart',
//                     symbol: symbol,
//                     data: context.timeSeriesData,
//                     title: `${symbol} - Drawdown from Peak`,
//                     description: 'Percentage decline from all-time highs'
//                 });
//             }
            
//             if (subIntents.includes('RETURN_ANALYSIS')) {
//                 chartRequests.push({
//                     type: 'cumulative-returns',
//                     symbol: symbol,
//                     data: context.timeSeriesData,
//                     title: `${symbol} - Cumulative Returns`,
//                     description: 'Total growth of $100 investment'
//                 });
                
//                 chartRequests.push({
//                     type: 'returns-distribution',
//                     symbol: symbol,
//                     data: context.timeSeriesData,
//                     title: `${symbol} - Daily Returns Distribution`,
//                     description: 'Histogram of daily percentage changes'
//                 });
//             }
            
//             if (subIntents.includes('RISK_METRICS_ANALYSIS') && context.advancedMetrics) {
//                 chartRequests.push({
//                     type: 'risk-metrics-dashboard',
//                     symbol: symbol,
//                     metrics: context.advancedMetrics,
//                     riskMetrics: context.riskMetrics,
//                     title: `${symbol} - Risk Metrics Dashboard`,
//                     description: 'Sharpe, Sortino, VaR, Skewness, Kurtosis'
//                 });
//             }
//         }
        
//         // PRIORITÉ 3: ANALYSE DE STOCK UNIQUE (autre que historical)
//         else if (analysis.symbols.length > 0 && context.stockData) {
//             const symbol = analysis.symbols[0];
//             const subIntents = analysis.subIntents || [];
            
//             console.log(`📊 Adding STOCK ANALYSIS charts for ${symbol}`);
            
//             if (subIntents.includes('TECHNICAL_FOCUS') && context.timeSeriesData) {
//                 chartRequests.push({
//                     type: 'technical-analysis',
//                     symbol: symbol,
//                     data: context.timeSeriesData,
//                     indicators: ['sma20', 'sma50', 'rsi', 'bollinger'],
//                     title: `${symbol} - Technical Analysis`,
//                     description: 'Price with SMA, RSI, Bollinger Bands'
//                 });
//             }
            
//             else if (subIntents.includes('ANALYST_FOCUS') && context.analystRecommendations) {
//                 chartRequests.push({
//                     type: 'analyst-recommendations',
//                     symbol: symbol,
//                     data: context.analystRecommendations,
//                     title: `${symbol} - Analyst Recommendations`,
//                     description: 'Distribution of Buy/Hold/Sell ratings'
//                 });
                
//                 if (context.priceTarget) {
//                     chartRequests.push({
//                         type: 'price-target-chart',
//                         symbol: symbol,
//                         currentPrice: context.stockData.quote.current,
//                         priceTarget: context.priceTarget,
//                         title: `${symbol} - Price Target Analysis`,
//                         description: 'Current price vs analyst targets'
//                     });
//                 }
//             }
            
//             else if (subIntents.includes('EARNINGS_FOCUS') && context.earningsHistory) {
//                 chartRequests.push({
//                     type: 'earnings-surprises',
//                     symbol: symbol,
//                     data: context.earningsHistory.recent,
//                     title: `${symbol} - Earnings Surprise History`,
//                     description: 'Actual vs Estimated EPS with surprise %'
//                 });
                
//                 chartRequests.push({
//                     type: 'earnings-beat-rate',
//                     symbol: symbol,
//                     beatCount: context.earningsHistory.beatCount,
//                     missCount: context.earningsHistory.missCount,
//                     title: `${symbol} - Earnings Beat Rate`,
//                     description: `${context.earningsHistory.beatRate}% of earnings reports beat estimates`
//                 });
//             }
            
//             else if (subIntents.includes('FUNDAMENTAL_FOCUS') && context.stockData.metrics) {
//                 chartRequests.push({
//                     type: 'fundamentals-dashboard',
//                     symbol: symbol,
//                     metrics: context.stockData.metrics,
//                     title: `${symbol} - Fundamental Metrics`,
//                     description: 'Key financial ratios and profitability metrics'
//                 });
//             }
            
//             else if (context.timeSeriesData) {
//                 chartRequests.push({
//                     type: 'line',
//                     symbol: symbol,
//                     data: context.timeSeriesData,
//                     indicators: ['sma20', 'sma50'],
//                     timeframe: analysis.timeframes[0] || '1y',
//                     title: `${symbol} - Price Chart`,
//                     description: 'Historical price with moving averages'
//                 });
//             }
//         }
        
//         // PRIORITÉ 4: MARKET NEWS / IPO (pas de graphiques généralement)
//         else if (analysis.type === 'MARKET_NEWS_QUERY' && context.marketData) {
//             console.log('📰 Market news query - adding market indices chart');
            
//             chartRequests.push({
//                 type: 'market-indices',
//                 data: context.marketData,
//                 title: 'Major Market Indices - Today\'s Performance',
//                 description: 'S&P 500, NASDAQ, Dow Jones'
//             });
//         }
        
//         console.log(`✅ Generated ${chartRequests.length} chart request(s)`);
//         chartRequests.forEach((req, i) => {
//             console.log(`   ${i + 1}. ${req.type} - ${req.title || req.symbol || 'N/A'}`);
//         });
//         console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
//         return chartRequests;
//     }

//     // ============================================
//     // GÉNÉRATION CARTES VISUELLES
//     // ============================================
    
//     async generateVisualCards(context, analysis) {
//         const cards = [];
        
//         if (context.stockData && !analysis.isComparison) {
//             const stock = context.stockData;
            
//             cards.push({
//                 type: 'metric',
//                 title: 'Current Price',
//                 value: `$${stock.quote.current}`,
//                 change: `${stock.quote.changePercent > 0 ? '+' : ''}${stock.quote.changePercent}%`,
//                 trend: stock.quote.changePercent > 0 ? 'up' : 'down',
//                 icon: '💰'
//             });
            
//             if (stock.profile?.marketCap) {
//                 cards.push({
//                     type: 'metric',
//                     title: 'Market Cap',
//                     value: `$${stock.profile.marketCap}B`,
//                     icon: '🏢'
//                 });
//             }
            
//             if (stock.metrics?.peRatio) {
//                 cards.push({
//                     type: 'metric',
//                     title: 'P/E Ratio',
//                     value: stock.metrics.peRatio,
//                     icon: '📊'
//                 });
//             }
            
//             if (context.analystRecommendations) {
//                 cards.push({
//                     type: 'metric',
//                     title: 'Analyst Consensus',
//                     value: context.analystRecommendations.consensus,
//                     subtitle: `${context.analystRecommendations.total} analysts`,
//                     icon: '👥'
//                 });
//             }
            
//             if (context.sentiment) {
//                 cards.push({
//                     type: 'metric',
//                     title: 'News Sentiment',
//                     value: context.sentiment.overallSentiment.label,
//                     subtitle: `Score: ${context.sentiment.overallSentiment.sentiment.toFixed(2)}`,
//                     icon: '📰'
//                 });
//             }
            
//             if (context.advancedMetrics) {
//                 cards.push({
//                     type: 'metric',
//                     title: 'Sharpe Ratio',
//                     value: context.advancedMetrics.sharpeRatio,
//                     subtitle: 'Risk-Adjusted Return',
//                     icon: '⚖'
//                 });
//             }
//         }
        
//         if (context.comparisonData && context.comparisonData.stocksData.length >= 2) {
//             context.comparisonData.stocksData.forEach(stock => {
//                 cards.push({
//                     type: 'comparison-card',
//                     symbol: stock.symbol,
//                     name: stock.profile?.name || stock.symbol,
//                     price: `$${stock.quote.current}`,
//                     change: `${stock.quote.changePercent > 0 ? '+' : ''}${stock.quote.changePercent}%`,
//                     trend: stock.quote.changePercent > 0 ? 'up' : 'down',
//                     marketCap: `$${stock.profile?.marketCap || 'N/A'}B`,
//                     peRatio: stock.metrics?.peRatio || 'N/A'
//                 });
//             });
//         }
        
//         return cards;
//     }

//     // ============================================
//     // SUGGESTIONS AVANCÉES WALL STREET
//     // ============================================
    
//     generateAdvancedSuggestions(analysis, context) {
//         const suggestions = [];
        
//         if (analysis.isComparison && analysis.comparisonSymbols.length >= 2) {
//             const symbols = analysis.comparisonSymbols;
//             suggestions.push(
//                 `Correlation analysis: ${symbols.join(' vs ')}`,
//                 `Risk-adjusted returns: ${symbols[0]} vs ${symbols[1]}`,
//                 `Fair value estimation: ${symbols[0]}`,
//                 `Sector rotation impact on ${symbols[0]}`
//             );
//             return suggestions.slice(0, 4);
//         }
        
//         if (analysis.symbols.length > 0) {
//             const symbol = analysis.symbols[0];
            
//             if (context.advancedMetrics) {
//                 suggestions.push(`${symbol} Sharpe ratio vs sector average`);
//             }
            
//             if (context.earningsHistory) {
//                 suggestions.push(`${symbol} earnings quality score breakdown`);
//             }
            
//             if (context.stockData?.metrics?.beta) {
//                 suggestions.push(`${symbol} systematic vs unsystematic risk`);
//             }
            
//             suggestions.push(
//                 `${symbol} fair value (DCF analysis)`,
//                 `${symbol} options flow analysis`,
//                 `${symbol} insider trading activity`,
//                 `${symbol} institutional ownership changes`,
//                 `${symbol} short interest trends`,
//                 `${symbol} relative strength index vs peers`,
//                 `${symbol} seasonal patterns analysis`,
//                 `${symbol} Monte Carlo simulation`,
//                 `${symbol} stress test scenarios`,
//                 `${symbol} credit risk assessment`
//             );
            
//         } else if (analysis.type === 'IPO_QUERY') {
//             suggestions.push(
//                 "Top performing IPOs by Sharpe ratio",
//                 "IPO lock-up period calendar",
//                 "Underwriter reputation analysis",
//                 "Post-IPO price stability metrics"
//             );
//         } else if (analysis.type === 'MARKET_NEWS_QUERY') {
//             suggestions.push(
//                 "Sector rotation indicators",
//                 "Market breadth analysis",
//                 "Volatility index (VIX) interpretation",
//                 "Economic surprise index impact"
//             );
//         } else {
//             suggestions.push(
//                 "Top stocks by Sharpe ratio this month",
//                 "Market correlation matrix",
//                 "Sector performance attribution",
//                 "Factor exposure analysis (growth vs value)"
//             );
//         }
        
//         return suggestions.slice(0, 4);
//     }

//     // ============================================
//     // CALCULS TECHNIQUES (Continuation dans prochain message...)
//     // ============================================
    
//     calculateHistoricalStats(timeSeriesData) {
//         const prices = timeSeriesData.data.map(d => d.close);
//         const firstPrice = prices[0];
//         const lastPrice = prices[prices.length - 1];
//         const minPrice = Math.min(...prices);
//         const maxPrice = Math.max(...prices);
//         const totalReturn = ((lastPrice - firstPrice) / firstPrice * 100).toFixed(2);
        
//         const years = timeSeriesData.data.length / 252;
//         const annualizedReturn = (Math.pow(lastPrice / firstPrice, 1 / years) - 1) * 100;
        
//         const returns = [];
//         for (let i = 1; i < prices.length; i++) {
//             returns.push((prices[i] - prices[i-1]) / prices[i-1]);
//         }
//         const stdDev = this.calculateStdDev(returns);
//         const annualizedVolatility = (stdDev * Math.sqrt(252) * 100).toFixed(2);
        
//         return {
//             firstPrice: firstPrice.toFixed(2),
//             lastPrice: lastPrice.toFixed(2),
//             minPrice: minPrice.toFixed(2),
//             maxPrice: maxPrice.toFixed(2),
//             totalReturn: totalReturn,
//             annualizedReturn: annualizedReturn.toFixed(2),
//             volatility: annualizedVolatility,
//             period: this.conversationContext.lastTimeframe || '1y',
//             dataPoints: timeSeriesData.data.length
//         };
//     }

//     calculateTechnicalIndicators(timeSeriesData) {
//         if (!timeSeriesData || !timeSeriesData.data || timeSeriesData.data.length === 0) {
//             return null;
//         }

//         const data = timeSeriesData.data;
//         const closes = data.map(d => d.close);
        
//         const sma20 = this.calculateSMA(closes, 20);
//         const sma50 = this.calculateSMA(closes, 50);
//         const sma200 = this.calculateSMA(closes, 200);
        
//         const currentPrice = closes[closes.length - 1];
//         const currentSMA20 = sma20[sma20.length - 1];
//         const currentSMA50 = sma50[sma50.length - 1];
//         const currentSMA200 = sma200[sma200.length - 1];
        
//         const rsi = this.calculateRSI(closes, 14);
//         const currentRSI = rsi[rsi.length - 1];
        
//         const returns = [];
//         for (let i = 1; i < closes.length; i++) {
//             returns.push((closes[i] - closes[i-1]) / closes[i-1]);
//         }
//         const stdDev = this.calculateStdDev(returns);
//         const annualizedVolatility = (stdDev * Math.sqrt(252) * 100).toFixed(2);
        
//         const maxDrawdown = this.calculateMaxDrawdown(closes);
//         const currentDrawdown = this.calculateCurrentDrawdown(closes);
        
//         const riskFreeRate = 0.02;
//         const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
//         const annualizedReturn = avgReturn * 252;
//         const excessReturn = annualizedReturn - riskFreeRate;
//         const annualizedStdDev = stdDev * Math.sqrt(252);
//         const sharpeRatio = annualizedStdDev !== 0 ? (excessReturn / annualizedStdDev).toFixed(2) : 'N/A';
        
//         const supportResistance = this.identifySupportResistance(data);
//         const trend = this.analyzeTrend(closes, sma20, sma50, sma200);
        
//         return {
//             movingAverages: {
//                 sma20: currentSMA20?.toFixed(2),
//                 sma50: currentSMA50?.toFixed(2),
//                 sma200: currentSMA200?.toFixed(2),
//                 priceVsSMA20: currentSMA20 ? ((currentPrice - currentSMA20) / currentSMA20 * 100).toFixed(2) : null,
//                 priceVsSMA50: currentSMA50 ? ((currentPrice - currentSMA50) / currentSMA50 * 100).toFixed(2) : null,
//                 priceVsSMA200: currentSMA200 ? ((currentPrice - currentSMA200) / currentSMA200 * 100).toFixed(2) : null
//             },
//             momentum: {
//                 rsi: currentRSI?.toFixed(2),
//                 rsiSignal: currentRSI > 70 ? 'Overbought' : currentRSI < 30 ? 'Oversold' : 'Neutral'
//             },
//             volatility: {
//                 annualized: annualizedVolatility,
//                 level: parseFloat(annualizedVolatility) > 50 ? 'Very High' : 
//                        parseFloat(annualizedVolatility) > 30 ? 'High' : 
//                        parseFloat(annualizedVolatility) > 15 ? 'Medium' : 'Low',
//                 maxDrawdown: maxDrawdown.toFixed(2),
//                 currentDrawdown: currentDrawdown.toFixed(2),
//                 sharpeRatio: sharpeRatio
//             },
//             levels: supportResistance,
//             trend: trend
//         };
//     }

//     calculateSMA(data, period) {
//         const sma = [];
//         for (let i = 0; i < data.length; i++) {
//             if (i < period - 1) {
//                 sma.push(null);
//             } else {
//                 const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
//                 sma.push(sum / period);
//             }
//         }
//         return sma;
//     }

//     calculateRSI(data, period = 14) {
//         const rsi = [];
//         const gains = [];
//         const losses = [];
        
//         for (let i = 1; i < data.length; i++) {
//             const change = data[i] - data[i - 1];
//             gains.push(change > 0 ? change : 0);
//             losses.push(change < 0 ? Math.abs(change) : 0);
//         }
        
//         for (let i = 0; i < gains.length; i++) {
//             if (i < period - 1) {
//                 rsi.push(null);
//             } else {
//                 const avgGain = gains.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
//                 const avgLoss = losses.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
                
//                 if (avgLoss === 0) {
//                     rsi.push(100);
//                 } else {
//                     const rs = avgGain / avgLoss;
//                     rsi.push(100 - (100 / (1 + rs)));
//                 }
//             }
//         }
        
//         return rsi;
//     }

//     calculateStdDev(data) {
//         const mean = data.reduce((a, b) => a + b, 0) / data.length;
//         const squaredDiffs = data.map(value => Math.pow(value - mean, 2));
//         const variance = squaredDiffs.reduce((a, b) => a + b, 0) / data.length;
//         return Math.sqrt(variance);
//     }

//     calculateMaxDrawdown(prices) {
//         let maxDrawdown = 0;
//         let peak = prices[0];
        
//         for (let i = 1; i < prices.length; i++) {
//             if (prices[i] > peak) {
//                 peak = prices[i];
//             }
//             const drawdown = ((peak - prices[i]) / peak) * 100;
//             if (drawdown > maxDrawdown) {
//                 maxDrawdown = drawdown;
//             }
//         }
        
//         return maxDrawdown;
//     }

//     calculateCurrentDrawdown(prices) {
//         const peak = Math.max(...prices);
//         const current = prices[prices.length - 1];
//         return ((peak - current) / peak) * 100;
//     }

//     identifySupportResistance(data) {
//         const supports = [];
//         const resistances = [];
        
//         for (let i = 10; i < data.length - 10; i++) {
//             const current = data[i].low;
//             const prev = data.slice(i - 10, i).map(d => d.low);
//             const next = data.slice(i + 1, i + 11).map(d => d.low);
            
//             if (current <= Math.min(...prev) && current <= Math.min(...next)) {
//                 supports.push(current);
//             }
            
//             const currentHigh = data[i].high;
//             const prevHigh = data.slice(i - 10, i).map(d => d.high);
//             const nextHigh = data.slice(i + 1, i + 11).map(d => d.high);
            
//             if (currentHigh >= Math.max(...prevHigh) && currentHigh >= Math.max(...nextHigh)) {
//                 resistances.push(currentHigh);
//             }
//         }
        
//         return {
//             support: supports.length > 0 ? [...new Set(supports.slice(-3))].map(s => s.toFixed(2)) : [],
//             resistance: resistances.length > 0 ? [...new Set(resistances.slice(-3))].map(r => r.toFixed(2)) : []
//         };
//     }

//     analyzeTrend(closes, sma20, sma50, sma200) {
//         const currentPrice = closes[closes.length - 1];
//         const current20 = sma20[sma20.length - 1];
//         const current50 = sma50[sma50.length - 1];
//         const current200 = sma200[sma200.length - 1];
        
//         if (!current20 || !current50 || !current200) {
//             return { direction: 'Insufficient data', strength: 'N/A', duration: 0 };
//         }
        
//         let direction = 'Neutral';
//         let strength = 'Weak';
        
//         if (currentPrice > current20 && current20 > current50 && current50 > current200) {
//             direction = 'Strong Uptrend';
//             strength = 'Strong';
//         } else if (currentPrice > current20 && currentPrice > current50) {
//             direction = 'Uptrend';
//             strength = 'Moderate';
//         } else if (currentPrice < current20 && current20 < current50 && current50 < current200) {
//             direction = 'Strong Downtrend';
//             strength = 'Strong';
//         } else if (currentPrice < current20 && currentPrice < current50) {
//             direction = 'Downtrend';
//             strength = 'Moderate';
//         } else {
//             direction = 'Sideways';
//             strength = 'Weak';
//         }
        
//         return { direction, strength, duration: 0 };
//     }

//     // ============================================
//     // WALL STREET ADVANCED METRICS
//     // ============================================
    
//     calculateAdvancedMetrics(timeSeriesData, stockData) {
//         const prices = timeSeriesData.data.map(d => d.close);
        
//         const returns = [];
//         for (let i = 1; i < prices.length; i++) {
//             returns.push((prices[i] - prices[i-1]) / prices[i-1]);
//         }
        
//         const riskFreeRate = 0.02;
//         const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
//         const annualizedReturn = avgReturn * 252;
//         const stdDev = this.calculateStdDev(returns);
//         const annualizedStdDev = stdDev * Math.sqrt(252);
//         const excessReturn = annualizedReturn - riskFreeRate;
//         const sharpeRatio = annualizedStdDev !== 0 ? (excessReturn / annualizedStdDev).toFixed(3) : 'N/A';
        
//         const downsideReturns = returns.filter(r => r < 0);
//         const downsideDeviation = downsideReturns.length > 0 ? 
//             Math.sqrt(downsideReturns.reduce((sum, r) => sum + r * r, 0) / downsideReturns.length) * Math.sqrt(252) : 0;
//         const sortinoRatio = downsideDeviation !== 0 ? (excessReturn / downsideDeviation).toFixed(3) : 'N/A';
        
//         const maxDrawdown = this.calculateMaxDrawdown(prices);
//         const calmarRatio = maxDrawdown !== 0 ? (annualizedReturn / (maxDrawdown / 100)).toFixed(3) : 'N/A';
        
//         const informationRatio = sharpeRatio;
        
//         const beta = stockData?.metrics?.beta || 1;
//         const treynorRatio = beta !== 0 ? (excessReturn / beta).toFixed(3) : 'N/A';
        
//         return {
//             sharpeRatio,
//             sortinoRatio,
//             calmarRatio,
//             informationRatio,
//             treynorRatio,
//             alpha: this.calculateAlpha(annualizedReturn, beta),
//             beta: beta
//         };
//     }
    
//     calculateRiskMetrics(timeSeriesData) {
//         const prices = timeSeriesData.data.map(d => d.close);
//         const returns = [];
//         for (let i = 1; i < prices.length; i++) {
//             returns.push((prices[i] - prices[i-1]) / prices[i-1]);
//         }
        
//         const sortedReturns = [...returns].sort((a, b) => a - b);
//         const varIndex = Math.floor(returns.length * 0.05);
//         const var95 = sortedReturns[varIndex];
//         const varPercentage = (var95 * 100).toFixed(2);
        
//         const cvarReturns = sortedReturns.slice(0, varIndex);
//         const cvar = cvarReturns.length > 0 ? 
//             (cvarReturns.reduce((a, b) => a + b, 0) / cvarReturns.length * 100).toFixed(2) : 'N/A';
        
//         const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
//         const stdDev = this.calculateStdDev(returns);
//         const skewness = returns.length > 0 && stdDev !== 0 ? 
//             (returns.reduce((sum, r) => sum + Math.pow((r - mean) / stdDev, 3), 0) / returns.length).toFixed(3) : 'N/A';
        
//         const kurtosis = returns.length > 0 && stdDev !== 0 ? 
//             (returns.reduce((sum, r) => sum + Math.pow((r - mean) / stdDev, 4), 0) / returns.length - 3).toFixed(3) : 'N/A';
        
//         return {
//             var95: varPercentage,
//             cvar95: cvar,
//             skewness,
//             kurtosis,
//             tailRisk: parseFloat(kurtosis) > 0 ? 'High' : 'Normal'
//         };
//     }
    
//     calculateAlpha(annualizedReturn, beta, riskFreeRate = 0.02, marketReturn = 0.10) {
//         const expectedReturn = riskFreeRate + beta * (marketReturn - riskFreeRate);
//         const alpha = ((annualizedReturn - expectedReturn) * 100).toFixed(2);
//         return alpha;
//     }
    
//     calculateEarningsQuality(earnings) {
//         if (!earnings || earnings.length === 0) return 'N/A';
        
//         let qualityScore = 0;
//         let totalSurprises = 0;
        
//         earnings.forEach(e => {
//             if (e.surprisePercent) {
//                 totalSurprises += Math.abs(e.surprisePercent);
//                 if (e.surprisePercent > 0) qualityScore += 10;
//                 if (e.surprisePercent > 5) qualityScore += 5;
//                 if (e.surprisePercent < -5) qualityScore -= 10;
//             }
//         });
        
//         const avgSurprise = totalSurprises / earnings.length;
//         const consistency = avgSurprise < 5 ? 20 : avgSurprise < 10 ? 10 : 0;
        
//         qualityScore += consistency;
        
//         if (qualityScore >= 60) return 'Excellent';
//         if (qualityScore >= 40) return 'Good';
//         if (qualityScore >= 20) return 'Average';
//         return 'Poor';
//     }
    
//     calculateCorrelation(timeSeriesArray) {
//         if (timeSeriesArray.length < 2) return null;
        
//         const series1 = timeSeriesArray[0].data.map(d => d.close);
//         const series2 = timeSeriesArray[1].data.map(d => d.close);
        
//         const minLength = Math.min(series1.length, series2.length);
//         const data1 = series1.slice(-minLength);
//         const data2 = series2.slice(-minLength);
        
//         const returns1 = [];
//         const returns2 = [];
        
//         for (let i = 1; i < minLength; i++) {
//             returns1.push((data1[i] - data1[i-1]) / data1[i-1]);
//             returns2.push((data2[i] - data2[i-1]) / data2[i-1]);
//         }
        
//         const mean1 = returns1.reduce((a, b) => a + b, 0) / returns1.length;
//         const mean2 = returns2.reduce((a, b) => a + b, 0) / returns2.length;
        
//         let numerator = 0;
//         let sum1Sq = 0;
//         let sum2Sq = 0;
        
//         for (let i = 0; i < returns1.length; i++) {
//             const diff1 = returns1[i] - mean1;
//             const diff2 = returns2[i] - mean2;
//             numerator += diff1 * diff2;
//             sum1Sq += diff1 * diff1;
//             sum2Sq += diff2 * diff2;
//         }
        
//         const correlation = numerator / Math.sqrt(sum1Sq * sum2Sq);
        
//         return {
//             correlation: correlation.toFixed(3),
//             interpretation: this.interpretCorrelation(correlation),
//             diversificationBenefit: Math.abs(correlation) < 0.7 ? 'High' : Math.abs(correlation) < 0.9 ? 'Moderate' : 'Low'
//         };
//     }
    
//     interpretCorrelation(corr) {
//         const abs = Math.abs(corr);
//         if (abs >= 0.9) return 'Very Strong';
//         if (abs >= 0.7) return 'Strong';
//         if (abs >= 0.5) return 'Moderate';
//         if (abs >= 0.3) return 'Weak';
//         return 'Very Weak';
//     }

//     getConsensusRating(recommendation) {
//         const scores = {
//             strongBuy: recommendation.strongBuy * 5,
//             buy: recommendation.buy * 4,
//             hold: recommendation.hold * 3,
//             sell: recommendation.sell * 2,
//             strongSell: recommendation.strongSell * 1
//         };

//         const totalScore = scores.strongBuy + scores.buy + scores.hold + scores.sell + scores.strongSell;
//         const totalAnalysts = recommendation.strongBuy + recommendation.buy + recommendation.hold + recommendation.sell + recommendation.strongSell;

//         if (totalAnalysts === 0) return 'N/A';

//         const avgScore = totalScore / totalAnalysts;

//         if (avgScore >= 4.5) return 'Strong Buy';
//         if (avgScore >= 3.5) return 'Buy';
//         if (avgScore >= 2.5) return 'Hold';
//         if (avgScore >= 1.5) return 'Sell';
//         return 'Strong Sell';
//     }

//     getOutputSize(timeframe) {
//         const sizes = {
//             '1d': 24, '1w': 7, '1M': 30, '3M': 90, '6M': 180,
//             '1y': 365, '2y': 730, '5y': 1825, '10y': 3650,
//             'ytd': 250, 'max': 5000
//         };
//         return sizes[timeframe] || 365;
//     }

//     // ============================================
//     // UTILITAIRES DE CACHE ET MÉTRIQUES
//     // ============================================

//     checkCache(message) {
//         const cacheKey = message.toLowerCase().trim().replace(/\s+/g, '_').substring(0, 100);
//         const cached = this.responseCache.get(cacheKey);
        
//         if (cached && Date.now() - cached.timestamp < this.cacheExpiration) {
//             return cached.response;
//         }
        
//         return null;
//     }

//     cacheResponse(message, response) {
//         const cacheKey = message.toLowerCase().trim().replace(/\s+/g, '_').substring(0, 100);
//         this.responseCache.set(cacheKey, {
//             response: response,
//             timestamp: Date.now()
//         });
        
//         if (this.responseCache.size > 50) {
//             const firstKey = this.responseCache.keys().next().value;
//             this.responseCache.delete(firstKey);
//         }
//     }

//     updateConversationContext(analysis) {
//         if (analysis.symbols.length > 0) {
//             this.conversationContext.lastSymbol = analysis.symbols[0];
//         }
        
//         if (analysis.timeframes.length > 0) {
//             this.conversationContext.lastTimeframe = analysis.timeframes[0];
//         }
        
//         this.conversationContext.lastTopic = analysis.type;
//     }

//     updateMetrics(success, responseTime) {
//         if (success) {
//             this.metrics.successfulResponses++;
//         } else {
//             this.metrics.errors++;
//         }
        
//         this.metrics.totalResponseTime += responseTime;
//         this.metrics.averageResponseTime = 
//             this.metrics.totalResponseTime / this.metrics.totalMessages;
//     }

//     getMetrics() {
//         return {
//             ...this.metrics,
//             successRate: this.metrics.totalMessages > 0 
//                 ? (this.metrics.successfulResponses / this.metrics.totalMessages * 100).toFixed(2) + '%'
//                 : '0%',
//             averageResponseTime: this.metrics.averageResponseTime.toFixed(2) + 'ms'
//         };
//     }

//     clearCache() {
//         this.responseCache.clear();
//         console.log('✅ Cache cleared');
//     }

//     clearHistory() {
//         if (this.geminiAI) {
//             this.geminiAI.clearHistory();
//         }
//         this.conversationContext = {
//             lastSymbol: null,
//             lastTimeframe: '1y',
//             lastTopic: null,
//             userPreferences: {}
//         };
//         console.log('✅ Conversation context cleared');
//     }

//     reset() {
//         this.clearCache();
//         this.clearHistory();
//         this.metrics = {
//             totalMessages: 0,
//             successfulResponses: 0,
//             errors: 0,
//             averageResponseTime: 0,
//             totalResponseTime: 0
//         };
//         console.log('✅ Engine reset');
//     }
// }

// // ============================================
// // EXPORT
// // ============================================

// if (typeof module !== 'undefined' && module.exports) {
//     module.exports = FinancialChatbotEngine;
// }

// window.FinancialChatbotEngine = FinancialChatbotEngine;

// console.log('🚀 Financial Chatbot AI Engine v6.1 WALL STREET PRO loaded successfully!');
// console.log('📊 Ultra-Optimized Chart Generation System active');
// console.log('🎯 Context-Aware Chart Requests with Sub-Intent Detection');
// console.log('⚡ Advanced Metrics: Sharpe, Sortino, Alpha, Beta, Correlation, VaR');
// console.log('✅ API Calls Optimized - No Duplicates');

/**
 * ═══════════════════════════════════════════════════════════════
 * CHATBOT AI ENGINE - Gemini 2.5 Flash Integration
 * ═══════════════════════════════════════════════════════════════
 * Version: 3.0.0
 * Description: Moteur IA principal avec détection d'intentions et routing
 * Features:
 *   - Intent detection (IPO, M&A, Insider, Forex, Budget, Portfolio, Stock)
 *   - Entity extraction (symbols, timeframes, metrics)
 *   - Routing vers analyses spécialisées
 *   - Génération de recommandations multi-horizon
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
        
        // Intent keywords mapping
        this.intentKeywords = {
            IPO_ANALYSIS: ['ipo', 'initial public offering', 'newly listed', 'recent ipo', 'ipo calendar'],
            MA_ANALYSIS: ['merger', 'acquisition', 'm&a', 'takeover', 'buyout', 'deal'],
            INSIDER_TRADING: ['insider', 'insider trading', 'form 4', 'insider buy', 'insider sell', 'insider transaction'],
            FOREX_ANALYSIS: ['forex', 'currency', 'exchange rate', 'fx', 'eur/usd', 'gbp/usd', 'usd/jpy'],
            BUDGET_MANAGEMENT: ['budget', 'expense', 'revenue', 'savings', 'roi', 'investment portfolio'],
            STOCK_ANALYSIS: ['stock', 'share', 'equity', 'analyze', 'technical analysis', 'fundamental'],
            PRICE_HISTORY: ['price', 'chart', 'historical', 'evolution', 'performance', 'trend', 'last'],
            MARKET_OVERVIEW: ['market', 'overview', 'sector', 'index', 'sp500', 'nasdaq', 'dow jones'],
            TECHNICAL_ANALYSIS: ['rsi', 'macd', 'bollinger', 'moving average', 'indicator', 'oscillator'],
            GENERAL_FINANCE: ['what is', 'explain', 'how does', 'define', 'help']
        };
        
        // Known stocks for better symbol detection
        this.knownStocks = [
            'AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'NVDA', 'META', 'TSLA', 'BRK.B', 'UNH',
            'JNJ', 'V', 'WMT', 'XOM', 'JPM', 'PG', 'MA', 'HD', 'CVX', 'MRK',
            'ABBV', 'LLY', 'PEP', 'KO', 'AVGO', 'COST', 'TMO', 'MCD', 'CSCO', 'ACN',
            'NFLX', 'AMD', 'INTC', 'CRM', 'ORCL', 'QCOM', 'TXN', 'ADBE', 'NKE', 'DIS'
        ];
        
        console.log('🤖 ChatbotAIEngine initialized');
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * INITIALIZE GEMINI API
     * ═══════════════════════════════════════════════════════════
     */
    async initialize() {
        if (typeof ChatbotGemini === 'undefined') {
            console.error('❌ ChatbotGemini not loaded');
            throw new Error('Gemini API client not available');
        }

        this.geminiAPI = new ChatbotGemini(this.config.gemini);
        await this.geminiAPI.initialize();
        
        console.log('✅ Gemini API initialized');
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

            // 2. Extract entities (symbols, timeframes, metrics)
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
     * DETECT INTENT
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

        // Enhanced detection for specific cases
        
        // PRICE_HISTORY detection (improved)
        if (lowerMessage.match(/\b(price|chart|historical|evolution|performance|last|trend)\b/)) {
            if (lowerMessage.match(/\b(year|month|week|day)\b/)) {
                scores.PRICE_HISTORY = (scores.PRICE_HISTORY || 0) + 2;
            }
            // Check for stock symbols (case insensitive)
            this.knownStocks.forEach(symbol => {
                if (lowerMessage.includes(symbol.toLowerCase()) || 
                    lowerMessage.match(new RegExp(`\\b${symbol.toLowerCase()}\\b`)) ||
                    lowerMessage.includes('stock') || lowerMessage.includes('share')) {
                    scores.PRICE_HISTORY = (scores.PRICE_HISTORY || 0) + 1;
                }
            });
        }

        // IPO_ANALYSIS detection
        if (lowerMessage.match(/\b(ipo|initial public offering|newly listed|recent ipo)\b/)) {
            scores.IPO_ANALYSIS = (scores.IPO_ANALYSIS || 0) + 3;
        }

        // STOCK_ANALYSIS detection
        if (lowerMessage.match(/\b(analyze|analysis|valuation|earnings|revenue)\b/)) {
            scores.STOCK_ANALYSIS = (scores.STOCK_ANALYSIS || 0) + 1;
        }

        // MARKET_OVERVIEW detection
        if (lowerMessage.match(/\b(market|overview|sector|index|sp500|nasdaq)\b/)) {
            scores.MARKET_OVERVIEW = (scores.MARKET_OVERVIEW || 0) + 1;
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

        // ========== SYMBOL EXTRACTION (IMPROVED) ==========
        
        // Method 1: Uppercase words (traditional)
        const upperWords = upperMessage.match(/\b[A-Z]{1,5}\b/g) || [];
        const filteredUpperSymbols = upperWords.filter(word => 
            word.length >= 1 && 
            word.length <= 5 &&
            !['IPO', 'THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HER', 'WAS', 'ONE', 'OUR', 'OUT', 'DAY', 'GET', 'HAS', 'HIM', 'HIS', 'HOW', 'ITS', 'MAY', 'NEW', 'NOW', 'OLD', 'SEE', 'TWO', 'WAY', 'WHO', 'BOY', 'DID', 'ITS', 'LET', 'PUT', 'SAY', 'SHE', 'TOO', 'USE'].includes(word)
        );

        // Method 2: Known stocks (case insensitive)
        const knownStocksFound = [];
        this.knownStocks.forEach(symbol => {
            const regex = new RegExp(`\\b${symbol}\\b`, 'i');
            if (message.match(regex)) {
                knownStocksFound.push(symbol);
            }
        });

        // Method 3: Pattern matching (e.g., "stock NVDA", "share aapl", "NVDA stock")
        const patterns = [
            /(?:stock|share|equity)\s+([a-z]{1,5})\b/gi,
            /\b([a-z]{1,5})\s+(?:stock|share|equity)\b/gi,
            /\b([a-z]{2,5})\s+(?:price|chart|analysis)\b/gi
        ];

        const patternMatches = [];
        patterns.forEach(pattern => {
            const matches = message.matchAll(pattern);
            for (const match of matches) {
                if (match[1]) {
                    patternMatches.push(match[1].toUpperCase());
                }
            }
        });

        // Combine all methods
        entities.symbols = [...new Set([
            ...filteredUpperSymbols,
            ...knownStocksFound,
            ...patternMatches
        ])];

        console.log('🔍 Symbol detection:');
        console.log('   Upper symbols:', filteredUpperSymbols);
        console.log('   Known stocks found:', knownStocksFound);
        console.log('   Pattern matches:', patternMatches);
        console.log('   ✅ Final symbols:', entities.symbols);

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

        // Implicit timeframe detection
        if (entities.timeframes.length === 0) {
            if (lowerMessage.includes('evolution') || lowerMessage.includes('historical')) {
                entities.timeframes.push('1y');
            }
        }

        // ========== METRICS EXTRACTION ==========
        const metricPatterns = {
            'p/e': /\b(p\/e|pe|price[- ]to[- ]earnings)\b/i,
            'eps': /\beps\b|earnings[- ]per[- ]share/i,
            'revenue': /\brevenue|sales\b/i,
            'profit': /\bprofit|net[- ]income\b/i,
            'margin': /\bmargin\b/i,
            'market_cap': /\bmarket[- ]cap|market[- ]capitalization\b/i,
            'volume': /\bvolume|trading[- ]volume\b/i,
            'volatility': /\bvolatility|beta\b/i,
            'dividend': /\bdividend|yield\b/i
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

            case 'STOCK_ANALYSIS':
            case 'PRICE_HISTORY':
            case 'TECHNICAL_ANALYSIS':
                return await this.handleStockAnalysis(entities, userMessage, context);

            case 'MARKET_OVERVIEW':
                return await this.handleMarketOverview(entities, userMessage, context);

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
        console.log('📊 Budget Management requested');

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
     * HANDLE STOCK ANALYSIS (LEGAL COMPLIANT)
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
     * HANDLE GENERAL QUERY (Gemini AI)
     * ═══════════════════════════════════════════════════════════
     */
    async handleGeneralQuery(userMessage, context) {
        console.log('💬 General query - routing to Gemini AI');

        if (!this.geminiAPI) {
            await this.initialize();
        }

        // Build context from conversation history
        const conversationContext = this.conversationHistory
            .slice(-5)  // Last 5 messages
            .map(msg => `${msg.role}: ${msg.content}`)
            .join('\n');

        const enrichedPrompt = `You are Alphy AI, an expert financial assistant for AlphaVault AI platform.

Context from previous conversation:
${conversationContext || 'No previous context'}

Current market data context:
- Available symbols: ${this.currentContext.symbols.join(', ') || 'None'}
- Timeframe: ${this.currentContext.timeframe}
- Metrics: ${this.currentContext.metrics.join(', ') || 'None'}

User question: ${userMessage}

Please provide a professional, concise, and actionable response. If the user is asking about specific stocks or financial data, recommend they provide a ticker symbol for detailed analysis.`;

        const response = await this.geminiAPI.sendMessage(enrichedPrompt);

        return {
            text: response,
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

console.log('✅ ChatbotAIEngine loaded');