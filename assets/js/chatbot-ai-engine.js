// ============================================
// FINANCIAL CHATBOT - AI ENGINE v5.0 ULTRA
// ✅ Comparaison Multi-Stocks + Analyse Historique Enrichie
// ✅ Cartes Interactives + Tableaux Professionnels
// ============================================

class FinancialChatbotEngine {
    constructor(config) {
        this.config = config;
        this.geminiAI = null;
        this.ipoAnalyzer = null;
        this.analytics = null;
        this.charts = null;
        
        this.isProcessing = false;
        
        // ✅ Contexte conversationnel
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
        
        // ✅ Cache intelligent
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

            console.log('🚀 Conversational Financial AI v5.0 ready!');
            console.log('📊 NEW: Multi-Stock Comparison + Enhanced Historical Analysis + Interactive Cards');
            
        } catch (error) {
            console.error('❌ Engine initialization error:', error);
        }
    }

    // ============================================
    // PROCESSUS PRINCIPAL
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

            // ✅ Analyse du message (avec détection comparaison)
            const analysis = this.analyzeMessage(userMessage);
            
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('💬 Processing:', userMessage.substring(0, 60) + '...');
            console.log('🎯 Detected:', analysis.type);
            console.log('📊 Symbols:', analysis.symbols);
            if (analysis.isComparison) {
                console.log('⚖ COMPARISON MODE: ', analysis.comparisonSymbols.join(' vs '));
            }
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            // ✅ Construction de contexte ULTRA-COMPLET
            const context = await this.buildSmartContext(userMessage, analysis);

            // ✅ Construction du prompt enrichi pour Gemini
            const enrichedPrompt = this.buildEnhancedPrompt(userMessage, context, analysis);

            // ✅ Génération de réponse (Gemini avec contexte enrichi)
            const response = await this.geminiAI.generateResponse(enrichedPrompt, context);
            
            // ✅ NOUVEAU : Enrichir la réponse avec cartes visuelles
            response.visualCards = await this.generateVisualCards(context, analysis);
            
            // ✅ NOUVEAU : Générer graphiques de comparaison si pertinent
            response.chartRequests = await this.generateChartRequests(context, analysis);
            
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
                visualCards: [],
                chartRequests: [],
                suggestions: this.config.suggestions.initial
            };
        }
    }

    // ============================================
    // ANALYSE COMPLÈTE DU MESSAGE (AVEC COMPARAISON)
    // ============================================
    analyzeMessage(message) {
        const lowerMessage = message.toLowerCase();
        
        // ✅ Extraction symboles (méthodes combinées)
        const symbols = this.extractSymbols(message);
        
        // ✅ NOUVEAU : Détection de comparaison
        const isComparison = this.detectComparisonIntent(message);
        const comparisonSymbols = isComparison ? this.extractComparisonSymbols(message) : [];
        
        // ✅ Extraction timeframes
        const timeframes = this.extractTimeframes(message);
        
        // ✅ Détection de type (multi-intent)
        let type = 'CONVERSATIONAL'; // Par défaut
        const intents = [];
        
        // ✅ NOUVEAU : Priorité à la comparaison
        if (isComparison && comparisonSymbols.length >= 2) {
            type = 'STOCK_COMPARISON';
            intents.push('COMPARISON');
        }
        
        // Ordre de priorité dans la détection
        if (this.detectIPOIntent(message)) {
            type = symbols.length > 0 ? type : 'IPO_QUERY';
            intents.push('IPO');
        }
        
        if (this.detectAnalystIntent(message)) {
            type = symbols.length > 0 && type === 'CONVERSATIONAL' ? 'ANALYST_QUERY' : type;
            intents.push('ANALYST');
        }
        
        if (this.detectEarningsIntent(message)) {
            type = symbols.length > 0 && type === 'CONVERSATIONAL' ? 'EARNINGS_QUERY' : type;
            intents.push('EARNINGS');
        }
        
        if (this.detectSentimentIntent(message)) {
            type = symbols.length > 0 && type === 'CONVERSATIONAL' ? 'SENTIMENT_QUERY' : type;
            intents.push('SENTIMENT');
        }
        
        if (this.detectPeersIntent(message)) {
            type = symbols.length > 0 && type === 'CONVERSATIONAL' ? 'PEERS_QUERY' : type;
            intents.push('PEERS');
        }
        
        if (this.detectMarketNewsIntent(message)) {
            type = type === 'CONVERSATIONAL' ? 'MARKET_NEWS_QUERY' : type;
            intents.push('MARKET_NEWS');
        }
        
        if (this.detectEarningsCalendarIntent(message)) {
            type = type === 'CONVERSATIONAL' ? 'EARNINGS_CALENDAR_QUERY' : type;
            intents.push('EARNINGS_CALENDAR');
        }
        
        // ✅ NOUVEAU : Détection analyse historique
        if (this.detectHistoricalIntent(message)) {
            type = symbols.length > 0 && type === 'CONVERSATIONAL' ? 'HISTORICAL_ANALYSIS' : type;
            intents.push('HISTORICAL');
        }
        
        if (symbols.length > 0 || /\b(stock|share|ticker|analyze|price|chart|performance)\b/i.test(message)) {
            if (type === 'CONVERSATIONAL') {
                type = 'STOCK_QUERY';
            }
            intents.push('STOCK');
        }
        
        if (/\b(market|indices|dow|nasdaq|s&p|sp500)\b/i.test(message)) {
            if (type === 'CONVERSATIONAL') {
                type = 'MARKET_QUERY';
            }
            intents.push('MARKET');
        }
        
        if (/\b(what is|explain|define|tell me about|how does)\b/i.test(message)) {
            if (type === 'CONVERSATIONAL') {
                type = 'EDUCATIONAL_QUERY';
            }
            intents.push('EDUCATIONAL');
        }
        
        return {
            type,
            intents,
            symbols: isComparison ? comparisonSymbols : symbols,
            timeframes,
            isComparison,
            comparisonSymbols,
            needsData: symbols.length > 0 || intents.length > 0 || isComparison
        };
    }

    // ============================================
    // NOUVEAUX DÉTECTEURS D'INTENT
    // ============================================
    
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
    
    detectMarketNewsIntent(message) {
        const keywords = ['market news', 'news today', 'latest news', 'market update', 'what\'s happening', 'market sentiment', 'top news'];
        const messageLower = message.toLowerCase();
        return keywords.some(keyword => messageLower.includes(keyword));
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
    // EXTRACTION SYMBOLES AMÉLIORÉE
    // ============================================
    
    extractSymbols(message) {
        const symbols = new Set();
        
        // Méthode 1: Symboles UPPERCASE
        const upperRegex = /\b[A-Z]{1,5}\b/g;
        const upperSymbols = message.match(upperRegex) || [];
        const excludeWords = ['IPO', 'USA', 'CEO', 'CFO', 'AI', 'THE', 'AND', 'FOR', 'NOT', 'ETF', 'API', 'FAQ', 'EPS', 'ROE', 'ROA', 'TTM'];
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
    
    // ✅ NOUVEAU : Extraction symboles pour comparaison
    extractComparisonSymbols(message) {
        const symbols = this.extractSymbols(message);
        
        // Si on a déjà 2+ symboles, c'est bon
        if (symbols.length >= 2) {
            return symbols.slice(0, 4); // Max 4 symboles pour comparaison
        }
        
        // Sinon, chercher des patterns spécifiques
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

        // Défaut si pas trouvé
        if (found.length === 0 && /\b(evolution|historical|history|performance|trend)\b/i.test(message)) {
            found.push(this.conversationContext.lastTimeframe || '1y');
        }

        return found;
    }

    // ============================================
    // CONSTRUCTION DE CONTEXTE ULTRA-COMPLET
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

        // ✅ Si pas besoin de données
        if (!analysis.needsData) {
            console.log('   ⚡ No market data needed - conversational query');
            return context;
        }

        // ✅ NOUVEAU : COMPARAISON MULTI-STOCKS
        if (analysis.isComparison && analysis.comparisonSymbols.length >= 2) {
            console.log(`\n⚖ ═══ LOADING COMPARISON DATA ═══`);
            context.comparisonData = await this.loadComparisonData(analysis.comparisonSymbols, analysis.timeframes[0]);
            console.log(`═══════════════════════════════════════════\n`);
            return context;
        }

        const symbol = analysis.symbols[0];
        
        if (!symbol && !analysis.intents.includes('MARKET_NEWS') && !analysis.intents.includes('IPO') && !analysis.intents.includes('EARNINGS_CALENDAR')) {
            console.log('   ⚠ No symbol detected and no global query');
            return context;
        }

        // ============================================
        // CHARGEMENT DONNÉES COMPLÈTES (SI SYMBOLE)
        // ============================================
        
        if (symbol) {
            console.log(`\n📊 ═══ LOADING COMPREHENSIVE DATA FOR ${symbol} ═══`);
            
            try {
                // ✅ PARALLÈLE : Charger TOUTES les données disponibles
                const [
                    stockData,
                    recommendations,
                    priceTarget,
                    earnings,
                    revenueEstimates,
                    epsEstimates,
                    peers,
                    companyNews,
                    sentiment,
                    upgradesDowngrades
                ] = await Promise.all([
                    this.analytics.getStockData(symbol).catch(() => null),
                    this.analytics.getRecommendationTrends(symbol).catch(() => null),
                    this.analytics.getPriceTarget(symbol).catch(() => null),
                    this.analytics.getEarnings(symbol).catch(() => null),
                    this.analytics.getRevenueEstimates(symbol, 'quarterly').catch(() => null),
                    this.analytics.getEPSEstimates(symbol, 'quarterly').catch(() => null),
                    this.analytics.getPeers(symbol).catch(() => []),
                    this.analytics.getCompanyNews(symbol).catch(() => []),
                    this.analytics.analyzeNewsImpact(symbol).catch(() => null),
                    this.analytics.getUpgradeDowngrade(symbol).catch(() => [])
                ]);

                // ✅ 1. STOCK DATA (Quote + Profile + Metrics)
                if (stockData) {
                    context.stockData = stockData;
                    console.log(`   ✅ Stock Data: $${stockData.quote.current} (${stockData.quote.changePercent}%)`);
                }
                
                // ✅ 2. ANALYST RECOMMENDATIONS
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
                    console.log(`   ✅ Analyst Recommendations: ${context.analystRecommendations.consensus} (${bullishPercent}% bullish)`);
                }
                
                // ✅ 3. PRICE TARGET
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
                    console.log(`   ✅ Price Target: $${priceTarget.targetMean} (${upside}% upside)`);
                }
                
                // ✅ 4. EARNINGS HISTORY
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
                        totalReports: earnings.length
                    };
                    console.log(`   ✅ Earnings: ${beatCount} beats, ${missCount} misses (${context.earningsHistory.beatRate}% beat rate)`);
                }
                
                // ✅ 5. REVENUE ESTIMATES
                if (revenueEstimates && revenueEstimates.length > 0) {
                    context.revenueEstimates = revenueEstimates.slice(0, 4);
                    console.log(`   ✅ Revenue Estimates: ${revenueEstimates.length} periods`);
                }
                
                // ✅ 6. EPS ESTIMATES
                if (epsEstimates && epsEstimates.length > 0) {
                    context.epsEstimates = epsEstimates.slice(0, 4);
                    console.log(`   ✅ EPS Estimates: ${epsEstimates.length} periods`);
                }
                
                // ✅ 7. PEERS
                if (peers && peers.length > 0) {
                    context.peers = peers.slice(0, 10);
                    console.log(`   ✅ Peers: ${context.peers.join(', ')}`);
                }
                
                // ✅ 8. COMPANY NEWS
                if (companyNews && companyNews.length > 0) {
                    context.recentNews = companyNews.slice(0, 10).map(n => ({
                        headline: n.headline,
                        source: n.source,
                        datetime: n.datetime,
                        url: n.url
                    }));
                    console.log(`   ✅ Company News: ${companyNews.length} articles`);
                }
                
                // ✅ 9. NEWS SENTIMENT
                if (sentiment) {
                    context.sentiment = sentiment;
                    console.log(`   ✅ Sentiment: ${sentiment.overallSentiment.label} (${sentiment.overallSentiment.sentiment.toFixed(3)})`);
                }
                
                // ✅ 10. UPGRADES/DOWNGRADES
                if (upgradesDowngrades && upgradesDowngrades.length > 0) {
                    context.upgradesDowngrades = upgradesDowngrades.slice(0, 10);
                    console.log(`   ✅ Upgrades/Downgrades: ${upgradesDowngrades.length} changes`);
                }

                // ✅ 11. DONNÉES HISTORIQUES (si pertinent)
                const needsHistory = analysis.intents.includes('HISTORICAL') || 
                                     /\b(history|historical|evolution|performance|trend|chart|volatility|return)\b/i.test(message);
                
                if (needsHistory && this.analytics) {
                    const timeframe = analysis.timeframes[0] || this.conversationContext.lastTimeframe || '1y';
                    const outputsize = this.getOutputSize(timeframe);
                    
                    console.log(`   📅 Loading ${timeframe} history...`);
                    
                    const timeSeries = await this.analytics.getTimeSeries(symbol, '1day', outputsize);
                    
                    if (timeSeries && timeSeries.data && timeSeries.data.length > 0) {
                        context.timeSeriesData = timeSeries;
                        context.historicalStats = this.calculateHistoricalStats(timeSeries);
                        context.technicalIndicators = this.calculateTechnicalIndicators(timeSeries);
                        
                        console.log(`   ✅ History: ${timeSeries.data.length} points | Return: ${context.historicalStats.totalReturn}%`);
                    }
                }

            } catch (error) {
                console.error('   ❌ Error loading comprehensive data:', error);
            }
            
            console.log(`═══════════════════════════════════════════\n`);
        }

        // ============================================
        // DONNÉES GLOBALES (SANS SYMBOLE)
        // ============================================
        
        // ✅ MARKET NEWS
        if (analysis.intents.includes('MARKET_NEWS')) {
            try {
                const marketNews = await this.analytics.getMarketNews('general');
                if (marketNews && marketNews.length > 0) {
                    context.marketNews = marketNews.slice(0, 15);
                    console.log(`   ✅ Market News: ${marketNews.length} articles`);
                }
            } catch (error) {
                console.error('   ⚠ Error fetching market news:', error);
            }
        }

        // ✅ IPO CALENDAR
        if (analysis.intents.includes('IPO')) {
            try {
                const ipos = await this.analytics.getIPOCalendar();
                if (ipos && ipos.length > 0) {
                    context.upcomingIPOs = ipos.slice(0, 20);
                    console.log(`   ✅ Upcoming IPOs: ${ipos.length}`);
                }
            } catch (error) {
                console.error('   ⚠ Error fetching IPO calendar:', error);
            }
        }

        // ✅ EARNINGS CALENDAR
        if (analysis.intents.includes('EARNINGS_CALENDAR')) {
            try {
                const earnings = await this.analytics.getEarningsCalendar();
                if (earnings && earnings.length > 0) {
                    context.upcomingEarnings = earnings.slice(0, 30);
                    console.log(`   ✅ Upcoming Earnings: ${earnings.length} events`);
                }
            } catch (error) {
                console.error('   ⚠ Error fetching earnings calendar:', error);
            }
        }

        // ✅ MARKET OVERVIEW
        if (analysis.type === 'MARKET_QUERY' && this.analytics) {
            try {
                context.marketData = await this.analytics.getMarketOverview();
                console.log(`   ✅ Market Overview loaded`);
            } catch (error) {
                console.error('   ⚠ Error fetching market overview:', error);
            }
        }

        return context;
    }
    
    // ============================================
    // ✅ NOUVEAU : CHARGEMENT DONNÉES DE COMPARAISON
    // ============================================
    
    async loadComparisonData(symbols, timeframe = '1y') {
        const comparisonData = {
            symbols: symbols,
            stocksData: [],
            timeSeries: [],
            keyMetricsComparison: null
        };
        
        try {
            // Charger données pour chaque symbole en parallèle
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
                    console.log(`   ✅ ${result.symbol}: $${result.stockData.quote.current} (${result.stockData.quote.changePercent}%)`);
                }
                
                if (result.timeSeries) {
                    comparisonData.timeSeries.push({
                        symbol: result.symbol,
                        data: result.timeSeries.data
                    });
                }
            });
            
            // Construire tableau comparatif des métriques clés
            comparisonData.keyMetricsComparison = this.buildMetricsComparisonTable(comparisonData.stocksData);
            
        } catch (error) {
            console.error('   ❌ Error loading comparison data:', error);
        }
        
        return comparisonData;
    }
    
    // ============================================
    // ✅ NOUVEAU : TABLEAU COMPARATIF DES MÉTRIQUES
    // ============================================
    
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
    // CONSTRUCTION PROMPT ENRICHI POUR GEMINI
    // ============================================
    
    buildEnhancedPrompt(message, context, analysis) {
        let prompt = `You are Alphy, an expert AI financial analyst with access to comprehensive real-time data. Answer this question professionally and concisely:\n\n**User Question:** "${message}"\n\n`;

        // ✅ NOUVEAU : MODE COMPARAISON
        if (context.comparisonData && context.comparisonData.stocksData.length >= 2) {
            prompt += this.buildComparisonPrompt(context.comparisonData);
            
            // Instructions finales pour comparaison
            prompt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            prompt += `📝 **Your Task:**\n`;
            prompt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
            prompt += `Provide a **detailed side-by-side comparison** in 3-4 well-structured paragraphs:\n\n`;
            prompt += `1. **Performance Comparison**: Compare price performance, volatility, and returns\n`;
            prompt += `2. **Fundamental Analysis**: Compare valuation metrics (P/E, market cap, profitability)\n`;
            prompt += `3. **Investment Perspective**: Which stock is better for growth vs value investors?\n`;
            prompt += `4. **Risk Assessment**: Compare risk profiles and market positions\n\n`;
            prompt += `Use **specific numbers** from the data above. Be objective and data-driven.\n`;
            
            return prompt;
        }

        // ✅ DONNÉES DE BASE (Stock)
        if (context.stockData) {
            const stock = context.stockData;
            prompt += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            prompt += `📊 **${stock.profile?.name || stock.symbol}** (${stock.symbol})\n`;
            prompt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
            
            prompt += `**Current Price:** $${stock.quote.current} (${stock.quote.changePercent > 0 ? '+' : ''}${stock.quote.changePercent}%)\n`;
            prompt += `**Day Range:** $${stock.quote.low} - $${stock.quote.high}\n`;
            prompt += `**52-Week Range:** $${stock.metrics?.week52Low || 'N/A'} - $${stock.metrics?.week52High || 'N/A'}\n`;
            prompt += `**Volume:** ${stock.quote.volume?.toLocaleString() || 'N/A'}\n\n`;
            
            prompt += `**Company Info:**\n`;
            prompt += `• Industry: ${stock.profile?.industry || 'N/A'}\n`;
            prompt += `• Market Cap: $${stock.profile?.marketCap || 'N/A'}B\n`;
            prompt += `• Exchange: ${stock.profile?.exchange || 'N/A'}\n`;
            prompt += `• Country: ${stock.profile?.country || 'N/A'}\n\n`;
            
            if (stock.metrics) {
                prompt += `**Key Metrics:**\n`;
                prompt += `• P/E Ratio: ${stock.metrics.peRatio || 'N/A'}\n`;
                prompt += `• EPS (TTM): $${stock.metrics.eps || 'N/A'}\n`;
                prompt += `• Beta: ${stock.metrics.beta || 'N/A'}\n`;
                prompt += `• ROE: ${stock.metrics.roe || 'N/A'}%\n`;
                prompt += `• Profit Margin: ${stock.metrics.profitMargin || 'N/A'}%\n`;
                prompt += `• Dividend Yield: ${stock.metrics.dividendYield || 'N/A'}%\n`;
                prompt += `• Debt/Equity: ${stock.metrics.debtToEquity || 'N/A'}\n`;
                prompt += `• Current Ratio: ${stock.metrics.currentRatio || 'N/A'}\n\n`;
            }
        }

        // ✅ ANALYST RECOMMENDATIONS
        if (context.analystRecommendations) {
            const rec = context.analystRecommendations;
            prompt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            prompt += `👥 **Analyst Recommendations** (${rec.period})\n`;
            prompt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
            prompt += `• Strong Buy: ${rec.strongBuy} | Buy: ${rec.buy} | Hold: ${rec.hold} | Sell: ${rec.sell} | Strong Sell: ${rec.strongSell}\n`;
            prompt += `• **Total Analysts:** ${rec.total}\n`;
            prompt += `• **Consensus:** **${rec.consensus}** (${rec.bullishPercent}% bullish)\n\n`;
        }

        // ✅ PRICE TARGET
        if (context.priceTarget) {
            const pt = context.priceTarget;
            prompt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            prompt += `🎯 **Analyst Price Target**\n`;
            prompt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
            prompt += `• Current Price: $${pt.current}\n`;
            prompt += `• Mean Target: $${pt.targetMean} (${pt.upside > 0 ? '+' : ''}${pt.upside}% upside)\n`;
            prompt += `• Target Range: $${pt.targetLow} - $${pt.targetHigh}\n`;
            prompt += `• Median Target: $${pt.targetMedian || 'N/A'}\n\n`;
        }

        // ✅ EARNINGS HISTORY
        if (context.earningsHistory) {
            const earnings = context.earningsHistory;
            prompt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            prompt += `💰 **Earnings Performance**\n`;
            prompt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
            prompt += `• Beat Rate: **${earnings.beatRate}%** (${earnings.beatCount} beats, ${earnings.missCount} misses in last ${earnings.recent.length} quarters)\n`;
            prompt += `• Total Reports: ${earnings.totalReports}\n\n`;
            prompt += `**Recent Results:**\n`;
            earnings.recent.slice(0, 4).forEach(e => {
                const status = e.surprise > 0 ? '✅ Beat' : e.surprise < 0 ? '❌ Miss' : '➡ In-line';
                const surprisePercent = e.surprisePercent ? ` (${e.surprisePercent > 0 ? '+' : ''}${e.surprisePercent}%)` : '';
                prompt += `• ${e.period}: Actual $${e.actual || 'N/A'} vs Est. $${e.estimate || 'N/A'} - ${status}${surprisePercent}\n`;
            });
            prompt += `\n`;
        }

        // ✅ REVENUE & EPS ESTIMATES
        if (context.revenueEstimates && context.revenueEstimates.length > 0) {
            prompt += `**Revenue Estimates (Quarterly):**\n`;
            context.revenueEstimates.slice(0, 2).forEach(est => {
                prompt += `• ${est.period}: $${est.revenueAvg || 'N/A'}M (${est.numberAnalysts || 0} analysts)\n`;
            });
            prompt += `\n`;
        }

        if (context.epsEstimates && context.epsEstimates.length > 0) {
            prompt += `**EPS Estimates (Quarterly):**\n`;
            context.epsEstimates.slice(0, 2).forEach(est => {
                prompt += `• ${est.period}: $${est.epsAvg || 'N/A'} (${est.numberAnalysts || 0} analysts)\n`;
            });
            prompt += `\n`;
        }

        // ✅ NEWS SENTIMENT
        if (context.sentiment) {
            const sent = context.sentiment;
            prompt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            prompt += `💭 **News Sentiment Analysis**\n`;
            prompt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
            prompt += `• Overall Sentiment: **${sent.overallSentiment.label}** (score: ${sent.overallSentiment.sentiment.toFixed(3)})\n`;
            prompt += `• Short-Term Impact: ${sent.shortTermImpact.direction} (${sent.shortTermImpact.confidence} confidence)\n`;
            prompt += `• Long-Term Impact: ${sent.longTermImpact.direction} (${sent.longTermImpact.confidence} confidence)\n`;
            prompt += `• AI Recommendation: ${sent.recommendation}\n`;
            prompt += `• News Count: ${sent.newsCount || 0}\n\n`;
        }

        // ✅ RECENT NEWS
        if (context.recentNews && context.recentNews.length > 0) {
            prompt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            prompt += `📰 **Recent Company News** (Top 5)\n`;
            prompt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
            context.recentNews.slice(0, 5).forEach((news, i) => {
                const date = new Date(news.datetime).toLocaleDateString();
                prompt += `${i + 1}. **${news.headline}** (${news.source}, ${date})\n`;
            });
            prompt += `\n`;
        }

        // ✅ UPGRADES/DOWNGRADES
        if (context.upgradesDowngrades && context.upgradesDowngrades.length > 0) {
            prompt += `**Recent Analyst Actions:**\n`;
            context.upgradesDowngrades.slice(0, 3).forEach(change => {
                prompt += `• ${change.company || 'Analyst'}: ${change.fromGrade || 'N/A'} → ${change.toGrade || 'N/A'} (${change.action || 'N/A'})\n`;
            });
            prompt += `\n`;
        }

        // ✅ PEERS
        if (context.peers && context.peers.length > 0) {
            prompt += `**Industry Peers:** ${context.peers.slice(0, 5).join(', ')}\n\n`;
        }

        // ✅ TECHNICAL INDICATORS (si disponibles)
        if (context.technicalIndicators) {
            const tech = context.technicalIndicators;
            prompt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            prompt += `📈 **Technical Analysis**\n`;
            prompt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
            
            if (tech.movingAverages) {
                prompt += `**Moving Averages:**\n`;
                prompt += `• SMA 20: $${tech.movingAverages.sma20 || 'N/A'} (${tech.movingAverages.priceVsSMA20 > 0 ? '+' : ''}${tech.movingAverages.priceVsSMA20 || 0}%)\n`;
                prompt += `• SMA 50: $${tech.movingAverages.sma50 || 'N/A'} (${tech.movingAverages.priceVsSMA50 > 0 ? '+' : ''}${tech.movingAverages.priceVsSMA50 || 0}%)\n`;
                prompt += `• SMA 200: $${tech.movingAverages.sma200 || 'N/A'} (${tech.movingAverages.priceVsSMA200 > 0 ? '+' : ''}${tech.movingAverages.priceVsSMA200 || 0}%)\n\n`;
            }
            
            if (tech.momentum) {
                prompt += `**Momentum:**\n`;
                prompt += `• RSI(14): ${tech.momentum.rsi || 'N/A'} (${tech.momentum.rsiSignal || 'N/A'})\n\n`;
            }
            
            if (tech.volatility) {
                prompt += `**Risk Metrics:**\n`;
                prompt += `• Volatility: ${tech.volatility.annualized || 'N/A'}% (${tech.volatility.level || 'N/A'})\n`;
                prompt += `• Max Drawdown: ${tech.volatility.maxDrawdown || 'N/A'}%\n`;
                prompt += `• Sharpe Ratio: ${tech.volatility.sharpeRatio || 'N/A'}\n\n`;
            }
            
            if (tech.trend) {
                prompt += `**Trend:** ${tech.trend.direction || 'N/A'} (${tech.trend.strength || 'N/A'})\n\n`;
            }
        }

        // ✅ HISTORICAL STATS (si disponibles)
        if (context.historicalStats) {
            const stats = context.historicalStats;
            prompt += `**Historical Performance (${stats.period}):**\n`;
            prompt += `• Total Return: ${stats.totalReturn > 0 ? '+' : ''}${stats.totalReturn}%\n`;
            prompt += `• Annualized Return: ${stats.annualizedReturn > 0 ? '+' : ''}${stats.annualizedReturn}%\n`;
            prompt += `• Period Range: $${stats.minPrice} - $${stats.maxPrice}\n\n`;
        }

        // ✅ MARKET NEWS (global)
        if (context.marketNews && context.marketNews.length > 0) {
            prompt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            prompt += `📰 **Latest Market News**\n`;
            prompt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
            context.marketNews.slice(0, 5).forEach((news, i) => {
                prompt += `${i + 1}. **${news.headline}** (${news.source})\n`;
            });
            prompt += `\n`;
        }

        // ✅ UPCOMING IPOs
        if (context.upcomingIPOs && context.upcomingIPOs.length > 0) {
            prompt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            prompt += `🚀 **Upcoming IPOs**\n`;
            prompt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
            context.upcomingIPOs.slice(0, 10).forEach((ipo, i) => {
                prompt += `${i + 1}. **${ipo.name || ipo.symbol}** (${ipo.symbol}) - ${ipo.date} | Price: ${ipo.price || 'TBD'} | Shares: ${ipo.numberOfShares || 'N/A'}\n`;
            });
            prompt += `\n`;
        }

        // ✅ EARNINGS CALENDAR
        if (context.upcomingEarnings && context.upcomingEarnings.length > 0) {
            prompt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            prompt += `📅 **Upcoming Earnings Reports**\n`;
            prompt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
            context.upcomingEarnings.slice(0, 15).forEach((e, i) => {
                prompt += `${i + 1}. **${e.symbol}** - ${e.date} | EPS Est: $${e.epsEstimate || 'N/A'} | Rev Est: $${e.revenueEstimate ? (e.revenueEstimate / 1e9).toFixed(2) + 'B' : 'N/A'}\n`;
            });
            prompt += `\n`;
        }

        // ✅ MARKET OVERVIEW
        if (context.marketData) {
            const market = context.marketData;
            prompt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            prompt += `🌐 **Market Overview**\n`;
            prompt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
            
            if (market.sp500) {
                prompt += `• **S&P 500 (SPY):** $${market.sp500.price} (${market.sp500.changePercent > 0 ? '+' : ''}${market.sp500.changePercent}%)\n`;
            }
            if (market.nasdaq) {
                prompt += `• **NASDAQ (QQQ):** $${market.nasdaq.price} (${market.nasdaq.changePercent > 0 ? '+' : ''}${market.nasdaq.changePercent}%)\n`;
            }
            if (market.dow) {
                prompt += `• **Dow Jones (DIA):** $${market.dow.price} (${market.dow.changePercent > 0 ? '+' : ''}${market.dow.changePercent}%)\n`;
            }
            prompt += `\n`;
        }

        // ✅ INSTRUCTIONS FINALES
        prompt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        prompt += `📝 **Your Task:**\n`;
        prompt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        prompt += `Based on this comprehensive real-time data, provide a professional, detailed analysis in **3-4 well-structured paragraphs**. Include:\n\n`;
        prompt += `1. **Key Findings**: Highlight the most important data points and what they mean\n`;
        prompt += `2. **Analysis**: Provide context and interpretation of the numbers\n`;
        prompt += `3. **Actionable Insights**: Offer clear, data-driven recommendations\n`;
        prompt += `4. **Risk Considerations**: Mention relevant risks and limitations\n\n`;
        prompt += `Use **specific numbers** from the data above. Be concise but thorough. Write in a professional yet accessible tone.\n`;

        return prompt;
    }
    
    // ============================================
    // ✅ NOUVEAU : PROMPT POUR COMPARAISON
    // ============================================
    
    buildComparisonPrompt(comparisonData) {
        let prompt = `\n⚖ ════════════════════════════════════════\n`;
        prompt += `   MULTI-STOCK COMPARISON ANALYSIS\n`;
        prompt += `════════════════════════════════════════\n\n`;
        
        // Vue d'ensemble
        prompt += `**Comparing:** ${comparisonData.symbols.join(' vs ')}\n\n`;
        
        // Données individuelles pour chaque stock
        comparisonData.stocksData.forEach((stock, index) => {
            prompt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            prompt += `📊 **${index + 1}. ${stock.symbol}** - ${stock.profile?.name || stock.symbol}\n`;
            prompt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
            
            prompt += `**Price Performance:**\n`;
            prompt += `• Current: $${stock.quote.current} (${stock.quote.changePercent > 0 ? '+' : ''}${stock.quote.changePercent}%)\n`;
            prompt += `• Day Range: $${stock.quote.low} - $${stock.quote.high}\n`;
            prompt += `• 52W Range: $${stock.metrics?.week52Low || 'N/A'} - $${stock.metrics?.week52High || 'N/A'}\n\n`;
            
            prompt += `**Company Fundamentals:**\n`;
            prompt += `• Industry: ${stock.profile?.industry || 'N/A'}\n`;
            prompt += `• Market Cap: $${stock.profile?.marketCap || 'N/A'}B\n`;
            prompt += `• P/E Ratio: ${stock.metrics?.peRatio || 'N/A'}\n`;
            prompt += `• EPS: $${stock.metrics?.eps || 'N/A'}\n`;
            prompt += `• ROE: ${stock.metrics?.roe || 'N/A'}%\n`;
            prompt += `• Profit Margin: ${stock.metrics?.profitMargin || 'N/A'}%\n`;
            prompt += `• Beta: ${stock.metrics?.beta || 'N/A'}\n`;
            prompt += `• Dividend Yield: ${stock.metrics?.dividendYield || 'N/A'}%\n\n`;
        });
        
        // Tableau comparatif
        if (comparisonData.keyMetricsComparison) {
            prompt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            prompt += `📊 **Side-by-Side Metrics Comparison**\n`;
            prompt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
            
            const table = comparisonData.keyMetricsComparison;
            
            // Header
            prompt += `| ${table.headers.join(' | ')} |\n`;
            prompt += `|${table.headers.map(() => '---').join('|')}|\n`;
            
            // Rows
            table.rows.forEach(row => {
                prompt += `| ${row.join(' | ')} |\n`;
            });
            
            prompt += `\n`;
        }
        
        // Stats de performance historique (si disponibles)
        if (comparisonData.timeSeries && comparisonData.timeSeries.length > 0) {
            prompt += `**Historical Performance Comparison:**\n`;
            comparisonData.timeSeries.forEach(series => {
                if (series.data && series.data.length > 0) {
                    const firstPrice = series.data[0].close;
                    const lastPrice = series.data[series.data.length - 1].close;
                    const totalReturn = ((lastPrice - firstPrice) / firstPrice * 100).toFixed(2);
                    prompt += `• **${series.symbol}**: ${totalReturn > 0 ? '+' : ''}${totalReturn}% total return (${series.data.length} days)\n`;
                }
            });
            prompt += `\n`;
        }
        
        return prompt;
    }

    // ============================================
    // ✅ NOUVEAU : GÉNÉRATION CARTES VISUELLES
    // ============================================
    
    async generateVisualCards(context, analysis) {
        const cards = [];
        
        // Carte pour stock individuel
        if (context.stockData && !analysis.isComparison) {
            const stock = context.stockData;
            
            // Carte de prix actuel
            cards.push({
                type: 'metric',
                title: 'Current Price',
                value: `$${stock.quote.current}`,
                change: `${stock.quote.changePercent > 0 ? '+' : ''}${stock.quote.changePercent}%`,
                trend: stock.quote.changePercent > 0 ? 'up' : 'down',
                icon: '💰'
            });
            
            // Carte Market Cap
            if (stock.profile?.marketCap) {
                cards.push({
                    type: 'metric',
                    title: 'Market Cap',
                    value: `$${stock.profile.marketCap}B`,
                    icon: '🏢'
                });
            }
            
            // Carte P/E Ratio
            if (stock.metrics?.peRatio) {
                cards.push({
                    type: 'metric',
                    title: 'P/E Ratio',
                    value: stock.metrics.peRatio,
                    icon: '📊'
                });
            }
            
            // Carte de consensus analystes
            if (context.analystRecommendations) {
                cards.push({
                    type: 'metric',
                    title: 'Analyst Consensus',
                    value: context.analystRecommendations.consensus,
                    subtitle: `${context.analystRecommendations.total} analysts`,
                    icon: '👥'
                });
            }
            
            // Carte de sentiment
            if (context.sentiment) {
                cards.push({
                    type: 'metric',
                    title: 'News Sentiment',
                    value: context.sentiment.overallSentiment.label,
                    subtitle: `Score: ${context.sentiment.overallSentiment.sentiment.toFixed(2)}`,
                    icon: '💭'
                });
            }
        }
        
        // Cartes pour comparaison multi-stocks
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
    // ✅ NOUVEAU : GÉNÉRATION REQUÊTES DE GRAPHIQUES
    // ============================================
    
    async generateChartRequests(context, analysis) {
        const chartRequests = [];
        
        // Graphique de comparaison pour multi-stocks
        if (context.comparisonData && context.comparisonData.timeSeries && context.comparisonData.timeSeries.length >= 2) {
            chartRequests.push({
                type: 'comparison',
                symbols: context.comparisonData.symbols,
                timeSeriesData: context.comparisonData.timeSeries,
                timeframe: analysis.timeframes[0] || '1y'
            });
        }
        
        // Graphique historique pour stock individuel
        if (context.timeSeriesData && !analysis.isComparison) {
            chartRequests.push({
                type: 'line',
                symbol: analysis.symbols[0],
                data: context.timeSeriesData,
                indicators: analysis.intents.includes('HISTORICAL') ? ['sma'] : [],
                timeframe: analysis.timeframes[0] || '1y'
            });
        }
        
        // Tableau de comparaison des métriques
        if (context.comparisonData && context.comparisonData.keyMetricsComparison) {
            chartRequests.push({
                type: 'metrics-table',
                data: context.comparisonData.keyMetricsComparison
            });
        }
        
        return chartRequests;
    }

    // ============================================
    // CALCULS TECHNIQUES (IDENTIQUES)
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

    // ============================================
    // HELPER : Calcul Consensus Analyst
    // ============================================
    
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
    // SUGGESTIONS INTELLIGENTES
    // ============================================
    
    generateSmartSuggestions(analysis, context) {
        const suggestions = [];
        
        // Suggestions pour comparaison
        if (analysis.isComparison && analysis.comparisonSymbols.length >= 2) {
            const symbols = analysis.comparisonSymbols;
            suggestions.push(
                `Historical performance: ${symbols.join(' vs ')}`,
                `Technical analysis: ${symbols[0]}`,
                `${symbols[0]} analyst ratings`,
                `${symbols[1]} fundamentals`
            );
            return suggestions.slice(0, 4);
        }
        
        if (analysis.symbols.length > 0) {
            const symbol = analysis.symbols[0];
            
            // Suggestions basées sur les données disponibles
            if (context.analystRecommendations) {
                suggestions.push(`What do analysts say about ${symbol}?`);
            }
            if (context.earningsHistory) {
                suggestions.push(`${symbol} earnings trends`);
            }
            if (context.sentiment) {
                suggestions.push(`${symbol} news sentiment analysis`);
            }
            if (context.peers && context.peers.length > 0) {
                suggestions.push(`Compare ${symbol} with ${context.peers[0]}`);
            }
            
            // Suggestions génériques
            if (suggestions.length < 4) {
                suggestions.push(
                    `${symbol} risk assessment`,
                    `${symbol} price targets`,
                    `Technical indicators for ${symbol}`,
                    `${symbol} upcoming earnings`
                );
            }
            
        } else if (analysis.type === 'IPO_QUERY') {
            suggestions.push(
                "Show top performing IPOs",
                "IPO calendar this month",
                "How to evaluate IPOs",
                "Recent tech IPOs"
            );
        } else if (analysis.type === 'MARKET_NEWS_QUERY') {
            suggestions.push(
                "Top market movers today",
                "Sector performance analysis",
                "Market sentiment overview",
                "Economic indicators impact"
            );
        } else if (analysis.type === 'EARNINGS_CALENDAR_QUERY') {
            suggestions.push(
                "Upcoming tech earnings",
                "Earnings surprises this week",
                "High-profile earnings reports",
                "Earnings calendar next month"
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
                "👥 AAPL analyst ratings"
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

window.FinancialChatbotEngine = FinancialChatbotEngine;