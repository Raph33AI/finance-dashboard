// ============================================
// CHATBOT AI ENGINE v6.1 ULTRA PRO
// Moteur principal avec AlphaVault Scoring
// ✅ CONFORMITÉ LÉGALE : Scores propriétaires
// ============================================

class ChatbotAIEngine {
    constructor(config) {
        this.config = config;
        this.geminiClient = new GeminiAIClient(config);
        
        // ✅ NOUVEAU : Initialiser API Client
        if (config.features.enableRealTimeData) {
            this.apiClient = new FinanceAPIClient({
                baseURL: config.api.baseURL,
                cacheDuration: config.api.cacheDuration || 300000
            });
            console.log('✅ API Client initialized for real-time data');
        }
        
        // ✅ NOUVEAU : Initialiser AlphaVault Scoring Engine
        if (config.features.enableAlphaVaultScoring) {
            this.scoringEngine = new AlphaVaultScoring();
            console.log('✅ AlphaVault Scoring Engine initialized');
        }
        
        this.conversationHistory = [];
        this.currentContext = {
            symbols: [],
            timeframes: [],
            lastIntent: null,
            recentMetrics: {},
            lastAlphaVaultData: null
        };
        
        console.log('🧠 ChatbotAIEngine v6.1 ULTRA PRO initialized');
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎯 PROCESS USER MESSAGE (ENTRY POINT)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    async processMessage(userMessage) {
        try {
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🧠 Processing user message...');
            console.log('💬 Message:', userMessage);

            // 1⃣ Detect Intent
            const intent = this.detectIntent(userMessage);
            console.log('🎯 Detected intent:', intent);

            // 2⃣ Extract Entities
            const entities = this.extractEntities(userMessage);
            console.log('🔍 Extracted entities:', entities);

            // 3⃣ Update Context
            this.updateContext(intent, entities);

            // 4⃣ ✅ NOUVEAU : Fetch AlphaVault Data (si nécessaire)
            let alphaVaultData = null;
            
            if (this.shouldFetchRealTimeData(intent, entities)) {
                console.log('📊 Fetching real-time AlphaVault data...');
                
                try {
                    alphaVaultData = await this.fetchAlphaVaultData(intent, entities);
                    
                    if (alphaVaultData && !alphaVaultData.error) {
                        console.log('✅ AlphaVault data retrieved successfully');
                        console.log('📈 AlphaVault Score:', alphaVaultData.alphaVaultScore || alphaVaultData.overallScore);
                        this.currentContext.lastAlphaVaultData = alphaVaultData;
                    } else {
                        console.warn('⚠ AlphaVault data not available, using Gemini knowledge only');
                    }
                } catch (error) {
                    console.warn('⚠ Error fetching AlphaVault data:', error.message);
                    console.log('📚 Falling back to Gemini general knowledge');
                }
            } else {
                console.log('📚 Using Gemini general knowledge (no real-time data needed)');
            }

            // 5⃣ Enrich message with AlphaVault context
            const enrichedMessage = this.enrichMessageWithAlphaVault(
                userMessage, 
                intent, 
                entities, 
                alphaVaultData
            );

            // 6⃣ Send to Gemini AI
            const response = await this.geminiClient.sendMessage(
                enrichedMessage,
                this.conversationHistory
            );

            if (!response.success) {
                return {
                    success: false,
                    error: response.error,
                    message: response.message
                };
            }

            // 7⃣ Update conversation history
            this.conversationHistory.push({
                role: 'user',
                text: userMessage
            });

            this.conversationHistory.push({
                role: 'assistant',
                text: response.text
            });

            // Keep only last 20 messages
            if (this.conversationHistory.length > 20) {
                this.conversationHistory = this.conversationHistory.slice(-20);
            }

            console.log('✅ Message processed successfully');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            return {
                success: true,
                text: response.text,
                intent: intent,
                entities: entities,
                alphaVaultData: alphaVaultData,
                metadata: response.metadata
            };

        } catch (error) {
            console.error('❌ AI Engine error:', error);
            return {
                success: false,
                error: 'PROCESSING_ERROR',
                message: this.config.messages.error
            };
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🔍 SHOULD FETCH REAL-TIME DATA?
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    shouldFetchRealTimeData(intent, entities) {
        // Fetch data pour ces intents
        const dataIntents = [
            'STOCK_ANALYSIS',
            'STOCK_COMPARISON',
            'TECHNICAL_ANALYSIS',
            'IPO_ANALYSIS',
            'FOREX_ANALYSIS'
        ];

        // Vérifier que l'intent nécessite des données
        if (!dataIntents.includes(intent)) {
            return false;
        }

        // Vérifier qu'on a des symboles
        if (entities.symbols.length === 0) {
            return false;
        }

        // Vérifier que la feature est activée
        if (!this.config.features.enableRealTimeData) {
            return false;
        }

        return true;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📊 FETCH ALPHAVAULT DATA (AMÉLIORÉ AVEC TECHNICAL CHARTS)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    async fetchAlphaVaultData(intent, entities) {
        try {
            const symbol = entities.symbols[0];

            // 📈 STOCK ANALYSIS
            if (intent === 'STOCK_ANALYSIS') {
                return await this.getStockAlphaVaultData(symbol);
            }

            // 📊 TECHNICAL ANALYSIS (NOUVEAU)
            if (intent === 'TECHNICAL_ANALYSIS') {
                return await this.getTechnicalChartData(symbol, entities);
            }

            // ⚖ STOCK COMPARISON
            if (intent === 'STOCK_COMPARISON' && entities.symbols.length >= 2) {
                return await this.getComparisonAlphaVaultData(entities.symbols);
            }

            // 🚀 IPO ANALYSIS
            if (intent === 'IPO_ANALYSIS') {
                return await this.getIPOAlphaVaultData();
            }

            // 💱 FOREX ANALYSIS
            if (intent === 'FOREX_ANALYSIS') {
                return await this.getForexAlphaVaultData(entities.currencies[0] || 'EUR/USD');
            }

            return null;

        } catch (error) {
            console.error('❌ Error in fetchAlphaVaultData:', error);
            return { error: error.message };
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📊 GET TECHNICAL CHART DATA (NOUVEAU)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    async getTechnicalChartData(symbol, entities) {
        try {
            console.log(`📊 Fetching technical chart data for ${symbol}...`);

            // Fetch time series data (200 candles pour calculs techniques)
            const timeSeries = await this.apiClient.getTimeSeries(symbol, '1day', 200);

            if (!timeSeries || !timeSeries.data || timeSeries.data.length < 50) {
                throw new Error(`Insufficient historical data for ${symbol}`);
            }

            console.log(`✅ Received ${timeSeries.data.length} candles for ${symbol}`);

            // Utiliser AdvancedAnalysis pour calculer les indicateurs
            if (typeof window.AdvancedAnalysis === 'undefined') {
                console.error('❌ AdvancedAnalysis not loaded!');
                throw new Error('Technical analysis module not available');
            }

            // Préparer les données au format attendu par AdvancedAnalysis
            const prices = timeSeries.data.map(candle => ({
                timestamp: candle.timestamp,
                datetime: candle.datetime,
                open: candle.open,
                high: candle.high,
                low: candle.low,
                close: candle.close,
                volume: candle.volume
            }));

            // Calculer les 14 indicateurs techniques
            const indicators = {
                rsi: window.AdvancedAnalysis.calculateRSI(prices),
                macd: window.AdvancedAnalysis.calculateMACD(prices),
                stochastic: window.AdvancedAnalysis.calculateStochastic(prices),
                williams: window.AdvancedAnalysis.calculateWilliams(prices),
                adx: window.AdvancedAnalysis.calculateADX(prices),
                obv: window.AdvancedAnalysis.calculateOBV(prices),
                atr: window.AdvancedAnalysis.calculateATR(prices),
                mfi: window.AdvancedAnalysis.calculateMFI(prices),
                cci: window.AdvancedAnalysis.calculateCCI(prices),
                ultimateOsc: window.AdvancedAnalysis.calculateUltimateOscillator(prices),
                roc: window.AdvancedAnalysis.calculateROC(prices),
                aroon: window.AdvancedAnalysis.calculateAroon(prices),
                cmf: window.AdvancedAnalysis.calculateCMF(prices),
                elderRay: window.AdvancedAnalysis.calculateElderRay(prices)
            };

            console.log('✅ Technical indicators calculated successfully');

            // Transformer en AlphaVault Scores
            const alphaVaultScores = this.scoringEngine.transformTechnicalIndicators(indicators, prices);

            console.log(`🏆 AlphaVault Technical Scores:`, alphaVaultScores);

            return {
                type: 'technical_analysis',
                symbol: symbol,
                prices: prices,
                indicators: indicators,
                alphaVaultScores: alphaVaultScores,
                chartConfig: {
                    includeMACD: true,
                    includeBollinger: true,
                    includeRSI: true,
                    includeVolume: true
                }
            };

        } catch (error) {
            console.error(`❌ Error fetching technical data for ${symbol}:`, error);
            return { error: error.message, symbol: symbol };
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📈 GET STOCK ALPHAVAULT DATA
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    async getStockAlphaVaultData(symbol) {
        try {
            console.log(`📊 Fetching AlphaVault data for ${symbol}...`);

            // Fetch raw data from APIs (INTERNAL USE ONLY)
            const [quote, profile] = await Promise.all([
                this.apiClient.getQuote(symbol).catch(() => null),
                this.apiClient.getProfile(symbol).catch(() => null)
            ]);

            if (!quote) {
                throw new Error(`Quote data not available for ${symbol}`);
            }

            console.log(`✅ Raw data fetched for ${symbol}`);

            // Transform to AlphaVault proprietary scores
            const alphaVaultData = this.scoringEngine.calculateComprehensiveScore({
                symbol: symbol,
                quote: quote,
                profile: profile
            });

            console.log(`🏆 AlphaVault Score calculated: ${alphaVaultData.overall}/100`);

            return alphaVaultData;

        } catch (error) {
            console.error(`❌ Error fetching AlphaVault data for ${symbol}:`, error);
            return { error: error.message, symbol: symbol };
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ⚖ GET COMPARISON ALPHAVAULT DATA
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    async getComparisonAlphaVaultData(symbols) {
        try {
            console.log(`⚖ Comparing stocks: ${symbols.join(' vs ')}`);

            const results = await Promise.all(
                symbols.map(symbol => this.getStockAlphaVaultData(symbol))
            );

            // Filter out errors
            const validResults = results.filter(r => !r.error);

            if (validResults.length === 0) {
                throw new Error('No valid data for comparison');
            }

            return {
                type: 'comparison',
                symbols: symbols,
                stocks: validResults,
                winner: this.identifyWinner(validResults)
            };

        } catch (error) {
            console.error('❌ Error in comparison:', error);
            return { error: error.message };
        }
    }

    identifyWinner(results) {
        const sorted = [...results].sort((a, b) => b.overall - a.overall);
        return {
            symbol: sorted[0].symbol,
            score: sorted[0].overall,
            reason: `Highest AlphaVault Score (${sorted[0].overall}/100)`
        };
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🚀 GET IPO ALPHAVAULT DATA
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    async getIPOAlphaVaultData() {
        try {
            console.log('🚀 Fetching IPO calendar...');

            const ipoData = await this.apiClient.getIPOCalendar();

            if (!ipoData || !ipoData.data || ipoData.data.length === 0) {
                return {
                    type: 'ipo',
                    message: 'No upcoming IPOs available at this time.',
                    count: 0
                };
            }

            // Top 5 IPOs
            const topIPOs = ipoData.data.slice(0, 5).map(ipo => ({
                symbol: ipo.symbol,
                name: ipo.name,
                exchange: ipo.exchange,
                date: ipo.date,
                status: ipo.status,
                // Simplified scoring (no real prices)
                potentialScore: this.calculateIPOPotentialScore(ipo)
            }));

            return {
                type: 'ipo',
                count: topIPOs.length,
                ipos: topIPOs
            };

        } catch (error) {
            console.error('❌ Error fetching IPO data:', error);
            return { error: error.message };
        }
    }

    calculateIPOPotentialScore(ipo) {
        // Simplified scoring logic
        let score = 50;

        // Exchange premium (NASDAQ/NYSE = higher score)
        if (ipo.exchange === 'NASDAQ' || ipo.exchange === 'NYSE') {
            score += 20;
        }

        // Status boost
        if (ipo.status === 'priced') {
            score += 15;
        }

        // Recent date boost
        const ipoDate = new Date(ipo.date);
        const today = new Date();
        const daysDiff = Math.abs((ipoDate - today) / (1000 * 60 * 60 * 24));
        
        if (daysDiff <= 7) score += 15;
        else if (daysDiff <= 30) score += 10;

        return Math.min(100, score);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 💱 GET FOREX ALPHAVAULT DATA
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    async getForexAlphaVaultData(currencyPair) {
        // Placeholder pour forex (nécessite API forex spécifique)
        return {
            type: 'forex',
            pair: currencyPair,
            message: 'Forex analysis available. General context provided based on economic trends.',
            disclaimer: 'Real-time forex data integration pending.'
        };
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📝 ENRICH MESSAGE WITH ALPHAVAULT
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    enrichMessageWithAlphaVault(userMessage, intent, entities, alphaVaultData) {
        let enrichedMessage = userMessage;

        // Si on a des données AlphaVault
        if (alphaVaultData && !alphaVaultData.error) {
            
            // STOCK ANALYSIS
            if (alphaVaultData.type !== 'comparison' && alphaVaultData.type !== 'ipo') {
                const scoreContext = `

[AlphaVault Intelligence Report]
Symbol: ${alphaVaultData.symbol}
Company: ${alphaVaultData.companyName || alphaVaultData.symbol}
Sector: ${alphaVaultData.sector || 'Unknown'}

═══════════════════════════════════════════════════════════════════
📊 ALPHAVAULT PROPRIETARY SCORES
═══════════════════════════════════════════════════════════════════

Overall Score: ${alphaVaultData.overall}/100 (${alphaVaultData.rating})

Technical Strength: ${alphaVaultData.technical}/100
Momentum Index: ${alphaVaultData.momentum}/100
Quality Grade: ${alphaVaultData.quality}
Value Score: ${alphaVaultData.value}/100
Sentiment Index: ${alphaVaultData.sentiment}/100

Risk Level: ${alphaVaultData.risk}
Volatility: ${alphaVaultData.volatility}
Market Cap Category: ${alphaVaultData.marketCapCategory}

Performance Metrics:
- Price Change (1D): ${alphaVaultData.changePercent}%
- Trend Direction: ${alphaVaultData.trend}

═══════════════════════════════════════════════════════════════════

Key Insights:
${alphaVaultData.insights.map(i => `- ${i}`).join('\n')}

═══════════════════════════════════════════════════════════════════

⚠ CRITICAL: Use ONLY the above AlphaVault Scores in your analysis.
DO NOT mention specific prices, P/E ratios, or raw financial metrics.
Focus on score interpretation, trend analysis, and investment recommendations.
`;
                
                enrichedMessage += scoreContext;
            }

            // COMPARISON
            else if (alphaVaultData.type === 'comparison') {
                const comparisonContext = `

[AlphaVault Comparative Analysis]
Stocks Compared: ${alphaVaultData.symbols.join(' vs ')}

═══════════════════════════════════════════════════════════════════
📊 ALPHAVAULT COMPARATIVE SCORES
═══════════════════════════════════════════════════════════════════

${alphaVaultData.stocks.map(stock => `
**${stock.symbol}** (${stock.companyName})
- AlphaVault Score: ${stock.overall}/100 (${stock.rating})
- Technical: ${stock.technical}/100
- Quality: ${stock.quality}
- Risk: ${stock.risk}
- Momentum: ${stock.momentum}/100
`).join('\n')}

🏆 Top Pick: ${alphaVaultData.winner.symbol} (Score: ${alphaVaultData.winner.score}/100)
Reason: ${alphaVaultData.winner.reason}

═══════════════════════════════════════════════════════════════════

Provide a detailed comparison analysis using ONLY these AlphaVault Scores.
`;
                
                enrichedMessage += comparisonContext;
            }

            // IPO
            else if (alphaVaultData.type === 'ipo') {
                const ipoContext = `

[AlphaVault IPO Intelligence]
Upcoming IPOs: ${alphaVaultData.count}

${alphaVaultData.ipos ? alphaVaultData.ipos.map(ipo => `
**${ipo.symbol}** - ${ipo.name}
- Exchange: ${ipo.exchange}
- Date: ${ipo.date}
- Status: ${ipo.status}
- Potential Score: ${ipo.potentialScore}/100
`).join('\n') : alphaVaultData.message}

Provide analysis focusing on IPO potential, market conditions, and sector trends.
`;
                
                enrichedMessage += ipoContext;
            }

        } else {
            // Pas de données AlphaVault → Mode Gemini pur
            const generalContext = `

[Note: Real-time AlphaVault data not available]

Provide general market analysis based on your knowledge.
✅ You can discuss: Company overview, sector trends, business model, competitive landscape
❌ Do NOT provide: Specific current prices, exact P/E ratios, current market cap values

Suggest to the user that you can fetch real-time AlphaVault analysis if they want current data.
`;
            
            enrichedMessage += generalContext;
        }

        // Add intent-specific instructions
        const intentInstructions = {
            'STOCK_ANALYSIS': '\n\nProvide comprehensive stock analysis with clear buy/sell/hold recommendation.',
            'STOCK_COMPARISON': '\n\nCompare the stocks across all dimensions and identify the best investment.',
            'TECHNICAL_ANALYSIS': '\n\nFocus on technical indicators, chart patterns, and trading signals.',
            'IPO_ANALYSIS': '\n\nEvaluate IPO potential, market timing, and investment risks.',
            'MARKET_SENTIMENT': '\n\nAnalyze current market mood, VIX levels, and sector rotation.'
        };

        if (intentInstructions[intent]) {
            enrichedMessage += intentInstructions[intent];
        }

        return enrichedMessage;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎯 DETECT INTENT
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    detectIntent(message) {
        const msg = message.toLowerCase();
        
        // Comparison
        if (msg.includes('compare') || msg.includes(' vs ') || msg.includes('versus')) {
            return 'STOCK_COMPARISON';
        }

        // Stock Analysis
        if (this.matchKeywords(msg, this.config.intents.stockAnalysis)) {
            return 'STOCK_ANALYSIS';
        }

        // IPO Analysis
        if (this.matchKeywords(msg, this.config.intents.ipoAnalysis)) {
            return 'IPO_ANALYSIS';
        }

        // Forex
        if (this.matchKeywords(msg, this.config.intents.forexAnalysis)) {
            return 'FOREX_ANALYSIS';
        }

        // Technical
        if (this.matchKeywords(msg, this.config.intents.technicalAnalysis)) {
            return 'TECHNICAL_ANALYSIS';
        }

        // Portfolio
        if (this.matchKeywords(msg, this.config.intents.portfolioOptimization)) {
            return 'PORTFOLIO_OPTIMIZATION';
        }

        // Sentiment
        if (this.matchKeywords(msg, this.config.intents.marketSentiment)) {
            return 'MARKET_SENTIMENT';
        }

        // Economic Data
        if (this.matchKeywords(msg, this.config.intents.economicData)) {
            return 'ECONOMIC_DATA';
        }

        // News
        if (this.matchKeywords(msg, this.config.intents.newsAnalysis)) {
            return 'NEWS_ANALYSIS';
        }

        // Budget
        if (this.matchKeywords(msg, this.config.intents.budgetPlanning)) {
            return 'BUDGET_PLANNING';
        }

        return 'GENERAL_FINANCE';
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🔍 EXTRACT ENTITIES
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    extractEntities(message) {
        const entities = {
            symbols: [],
            timeframes: [],
            metrics: [],
            numbers: [],
            currencies: []
        };

        // Extract stock symbols
        const knownStocks = ['NVDA', 'AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'TSLA', 'META', 'NFLX', 'AMD', 'INTC', 'ORCL', 'CRM', 'ADBE'];
        
        // Method 1: Uppercase symbols
        const symbolRegex = /\b([A-Z]{2,5})\b/g;
        const upperSymbols = message.match(symbolRegex) || [];
        
        upperSymbols.forEach(symbol => {
            if (!['IPO', 'USD', 'EUR', 'GBP', 'JPY', 'THE', 'AND', 'FOR', 'USA', 'CEO', 'CFO', 'API'].includes(symbol)) {
                if (!entities.symbols.includes(symbol)) {
                    entities.symbols.push(symbol);
                }
            }
        });

        // Method 2: Known stocks (case-insensitive)
        knownStocks.forEach(stock => {
            const regex = new RegExp(`\\b${stock}\\b`, 'gi');
            if (regex.test(message) && !entities.symbols.includes(stock)) {
                entities.symbols.push(stock);
            }
        });

        // Method 3: Common company names
        const companyMap = {
            'apple': 'AAPL',
            'microsoft': 'MSFT',
            'google': 'GOOGL',
            'alphabet': 'GOOGL',
            'amazon': 'AMZN',
            'tesla': 'TSLA',
            'nvidia': 'NVDA',
            'meta': 'META',
            'facebook': 'META',
            'netflix': 'NFLX'
        };

        const msgLower = message.toLowerCase();
        Object.keys(companyMap).forEach(company => {
            if (msgLower.includes(company)) {
                const symbol = companyMap[company];
                if (!entities.symbols.includes(symbol)) {
                    entities.symbols.push(symbol);
                }
            }
        });

        // Extract currency pairs
        const currencyPairRegex = /\b([A-Z]{3})[\/\-]([A-Z]{3})\b/g;
        const currencyPairs = message.match(currencyPairRegex) || [];
        entities.currencies = currencyPairs;

        // Extract timeframes
        const timeframePatterns = [
            { pattern: /\b(\d+)\s*(year|yr|y)\b/gi, multiplier: 365 },
            { pattern: /\b(\d+)\s*(month|mo|m)\b/gi, multiplier: 30 },
            { pattern: /\b(\d+)\s*(week|wk|w)\b/gi, multiplier: 7 },
            { pattern: /\b(\d+)\s*(day|d)\b/gi, multiplier: 1 }
        ];

        timeframePatterns.forEach(({ pattern, multiplier }) => {
            const matches = message.matchAll(pattern);
            for (const match of matches) {
                const days = parseInt(match[1]) * multiplier;
                entities.timeframes.push(`${days}d`);
            }
        });

        return entities;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🔄 UPDATE CONTEXT
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    updateContext(intent, entities) {
        this.currentContext.lastIntent = intent;

        if (entities.symbols.length > 0) {
            this.currentContext.symbols = entities.symbols;
        }

        if (entities.timeframes.length > 0) {
            this.currentContext.timeframes = entities.timeframes;
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🔧 HELPER: Match Keywords
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    matchKeywords(message, keywords) {
        return keywords.some(keyword => message.includes(keyword));
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🔄 RESET CONVERSATION
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    resetConversation() {
        this.conversationHistory = [];
        this.currentContext = {
            symbols: [],
            timeframes: [],
            lastIntent: null,
            recentMetrics: {},
            lastAlphaVaultData: null
        };
        this.geminiClient.resetConversation();
        console.log('🔄 Conversation & context reset');
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📊 GET CONVERSATION STATS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    getConversationStats() {
        return {
            messageCount: this.conversationHistory.length,
            symbolsDiscussed: [...new Set(this.currentContext.symbols)],
            lastIntent: this.currentContext.lastIntent,
            hasAlphaVaultData: !!this.currentContext.lastAlphaVaultData,
            conversationLength: this.conversationHistory.reduce((sum, msg) => sum + msg.text.length, 0)
        };
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ EXPORT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
console.log('✅ ChatbotAIEngine v6.1 ULTRA PRO loaded successfully');
console.log('🏆 AlphaVault Integration: ACTIVE');
console.log('📊 Real-time data fetching: ENABLED');