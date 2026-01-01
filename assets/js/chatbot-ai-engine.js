// ============================================
// CHATBOT AI ENGINE v6.2 ULTRA PRO
// Moteur principal avec support graphiques techniques
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
        
        // ✅ NOUVEAU : Initialiser ChatbotCharts
        if (typeof ChatbotCharts !== 'undefined') {
            this.chartsEngine = new ChatbotCharts(config);
            console.log('✅ ChatbotCharts Engine initialized');
        }
        
        this.conversationHistory = [];
        this.currentContext = {
            symbols: [],
            timeframes: [],
            lastIntent: null,
            recentMetrics: {},
            lastAlphaVaultData: null,
            lastSymbols: [] // ✅ NOUVEAU : Garder trace des derniers symboles
        };
        
        console.log('🧠 ChatbotAIEngine v6.2 ULTRA PRO initialized');
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

            // 3⃣ ✅ NOUVEAU : Utiliser le contexte si pas de symboles
            if (entities.symbols.length === 0 && this.currentContext.lastSymbols.length > 0) {
                console.log('📌 Using context symbols:', this.currentContext.lastSymbols);
                entities.symbols = [...this.currentContext.lastSymbols];
            }

            // 4⃣ Update Context
            this.updateContext(intent, entities);

            // 5⃣ ✅ NOUVEAU : Fetch AlphaVault Data (si nécessaire)
            let alphaVaultData = null;
            
            if (this.shouldFetchRealTimeData(intent, entities)) {
                console.log('📊 Fetching real-time AlphaVault data...');
                
                try {
                    alphaVaultData = await this.fetchAlphaVaultData(intent, entities);
                    
                    if (alphaVaultData && !alphaVaultData.error) {
                        console.log('✅ AlphaVault data retrieved successfully');
                        console.log('📈 AlphaVault Score:', alphaVaultData.overall || alphaVaultData.overallScore);
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

            // 6⃣ Enrich message with AlphaVault context
            const enrichedMessage = this.enrichMessageWithAlphaVault(
                userMessage, 
                intent, 
                entities, 
                alphaVaultData
            );

            // 7⃣ Send to Gemini AI
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

            // 8⃣ Update conversation history
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
    // 🔍 SHOULD FETCH REAL-TIME DATA? (✅ AMÉLIORÉ)
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

        // ✅ NOUVEAU : Pour TECHNICAL_ANALYSIS, utiliser le contexte si pas de symboles
        if (intent === 'TECHNICAL_ANALYSIS') {
            if (entities.symbols.length === 0 && this.currentContext.lastSymbols.length === 0) {
                console.warn('⚠ Technical analysis requested but no symbols available');
                return false;
            }
            return true; // On a des symboles (soit dans entities, soit dans le contexte)
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
    // 📊 FETCH ALPHAVAULT DATA (✅ AMÉLIORÉ)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    async fetchAlphaVaultData(intent, entities) {
        try {
            const symbol = entities.symbols[0];

            // 📈 STOCK ANALYSIS
            if (intent === 'STOCK_ANALYSIS') {
                return await this.getStockAlphaVaultData(symbol);
            }

            // 📊 TECHNICAL ANALYSIS (✅ AMÉLIORÉ)
            if (intent === 'TECHNICAL_ANALYSIS') {
                const symbols = entities.symbols.length > 0 ? entities.symbols : this.currentContext.lastSymbols;
                
                if (symbols.length === 0) {
                    throw new Error('No symbols available for technical analysis');
                }

                // Si plusieurs symboles, faire une comparaison
                if (symbols.length > 1) {
                    return await this.getTechnicalComparisonData(symbols);
                } else {
                    return await this.getTechnicalChartData(symbols[0], entities);
                }
            }

            // ⚖ STOCK COMPARISON (✅ AMÉLIORÉ AVEC GRAPHIQUES)
            if (intent === 'STOCK_COMPARISON' && entities.symbols.length >= 2) {
                return await this.getComparisonWithChartsData(entities.symbols);
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
    // 📊 GET TECHNICAL CHART DATA (✅ NOUVEAU)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    async getTechnicalChartData(symbol, entities) {
        try {
            console.log(`📊 Fetching technical chart data for ${symbol}...`);

            // Fetch time series data (200 candles pour calculs techniques)
            const timeSeries = await this.apiClient.getTimeSeries(symbol, '1day', 200);

            if (!timeSeries || !timeSeries.data || timeSeries.data.length < 50) {
                throw new Error(`Insufficient historical data for ${symbol} (need min 50 candles, got ${timeSeries?.data?.length || 0})`);
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
                chartData: {
                    symbol: symbol,
                    indicators: indicators,
                    prices: prices
                }
            };

        } catch (error) {
            console.error(`❌ Error fetching technical data for ${symbol}:`, error);
            return { error: error.message, symbol: symbol };
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ⚖ GET COMPARISON WITH CHARTS DATA (✅ NOUVEAU)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    async getComparisonWithChartsData(symbols) {
        try {
            console.log(`⚖ Comparing stocks with technical data: ${symbols.join(' vs ')}`);

            // Récupérer les données techniques pour chaque symbole
            const results = await Promise.all(
                symbols.map(symbol => this.getTechnicalChartData(symbol, {}))
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

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📊 GET TECHNICAL COMPARISON DATA (✅ NOUVEAU)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    async getTechnicalComparisonData(symbols) {
        return await this.getComparisonWithChartsData(symbols);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ⚖ GET COMPARISON ALPHAVAULT DATA (LEGACY - CONSERVÉ)
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
        const sorted = [...results].sort((a, b) => {
            const scoreA = a.alphaVaultScores?.overall || a.overall || 0;
            const scoreB = b.alphaVaultScores?.overall || b.overall || 0;
            return scoreB - scoreA;
        });

        const topResult = sorted[0];
        const score = topResult.alphaVaultScores?.overall || topResult.overall || 0;

        return {
            symbol: topResult.symbol,
            score: score,
            reason: `Highest AlphaVault Score (${score}/100)`
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
        let score = 50;

        if (ipo.exchange === 'NASDAQ' || ipo.exchange === 'NYSE') {
            score += 20;
        }

        if (ipo.status === 'priced') {
            score += 15;
        }

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
        return {
            type: 'forex',
            pair: currencyPair,
            message: 'Forex analysis available. General context provided based on economic trends.',
            disclaimer: 'Real-time forex data integration pending.'
        };
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📝 ENRICH MESSAGE WITH ALPHAVAULT (✅ AMÉLIORÉ)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    enrichMessageWithAlphaVault(userMessage, intent, entities, alphaVaultData) {
        let enrichedMessage = userMessage;

        // Si on a des données AlphaVault
        if (alphaVaultData && !alphaVaultData.error) {
            
            // ✅ TECHNICAL ANALYSIS
            if (alphaVaultData.type === 'technical_analysis') {
                const scores = alphaVaultData.alphaVaultScores;
                
                const technicalContext = `

[AlphaVault Technical Intelligence Report]
Symbol: ${alphaVaultData.symbol}

═══════════════════════════════════════════════════════════════════
📊 ALPHAVAULT TECHNICAL SCORES
═══════════════════════════════════════════════════════════════════

Overall Technical Score: ${scores.overall}/100 (${scores.overallSignal})

Momentum Indicators:
${scores.momentum.rsi ? `- RSI Score: ${scores.momentum.rsi.score}/100 (${scores.momentum.rsi.signal})` : ''}
${scores.momentum.stochastic ? `- Stochastic Score: ${scores.momentum.stochastic.score}/100 (${scores.momentum.stochastic.signal})` : ''}
${scores.momentum.mfi ? `- MFI Score: ${scores.momentum.mfi.score}/100 (${scores.momentum.mfi.signal})` : ''}

Trend Indicators:
${scores.trend.macd ? `- MACD Score: ${scores.trend.macd.score}/100 (${scores.trend.macd.signal})` : ''}
${scores.trend.adx ? `- ADX Score: ${scores.trend.adx.score}/100 (${scores.trend.adx.signal})` : ''}

Volume Indicators:
${scores.volume.obv ? `- OBV Score: ${scores.volume.obv.score}/100 (${scores.volume.obv.signal})` : ''}

Volatility:
${scores.volatility.atr ? `- ATR Score: ${scores.volatility.atr.score}/100 (${scores.volatility.atr.signal})` : ''}

Overbought Signals: ${scores.overbought}
Oversold Signals: ${scores.oversold}

═══════════════════════════════════════════════════════════════════

⚠ CRITICAL: Use ONLY the above AlphaVault Scores in your analysis.
Provide detailed technical analysis with trading recommendations.
MENTION that an interactive technical chart is available (you will generate it).
`;
                
                enrichedMessage += technicalContext;
            }

            // ✅ COMPARISON (WITH TECHNICAL DATA)
            else if (alphaVaultData.type === 'comparison' && alphaVaultData.stocks[0]?.alphaVaultScores) {
                const comparisonContext = `

[AlphaVault Comparative Technical Analysis]
Stocks Compared: ${alphaVaultData.symbols.join(' vs ')}

═══════════════════════════════════════════════════════════════════
📊 ALPHAVAULT COMPARATIVE TECHNICAL SCORES
═══════════════════════════════════════════════════════════════════

${alphaVaultData.stocks.map(stock => {
    const scores = stock.alphaVaultScores;
    return `
**${stock.symbol}**
- Overall Technical Score: ${scores.overall}/100 (${scores.overallSignal})
- MACD Score: ${scores.trend.macd?.score || 'N/A'}/100
- RSI Score: ${scores.momentum.rsi?.score || 'N/A'}/100
- ADX Score: ${scores.trend.adx?.score || 'N/A'}/100
`;
}).join('\n')}

🏆 Top Technical Pick: ${alphaVaultData.winner.symbol} (Score: ${alphaVaultData.winner.score}/100)
Reason: ${alphaVaultData.winner.reason}

═══════════════════════════════════════════════════════════════════

Provide detailed comparative analysis using ONLY these AlphaVault Technical Scores.
MENTION that interactive comparison charts are available.
`;
                
                enrichedMessage += comparisonContext;
            }

            // STOCK ANALYSIS (NON-TECHNICAL)
            else if (!alphaVaultData.type || alphaVaultData.type !== 'comparison') {
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
`;
                
                enrichedMessage += scoreContext;
            }

            // COMPARISON (LEGACY - WITHOUT TECHNICAL)
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
            'TECHNICAL_ANALYSIS': '\n\n✅ CRITICAL: Mention that you will generate an interactive technical chart with all indicators. Provide detailed technical analysis based on AlphaVault Scores.',
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
        
        // Technical Analysis (✅ PRIORITÉ HAUTE)
        if (msg.includes('technical') || msg.includes('chart') || msg.includes('indicator') || 
            msg.includes('macd') || msg.includes('rsi') || msg.includes('bollinger') ||
            msg.includes('stochastic') || msg.includes('adx') || msg.includes('show me') && msg.includes('with')) {
            return 'TECHNICAL_ANALYSIS';
        }

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
    // 🔍 EXTRACT ENTITIES (✅ AMÉLIORÉ)
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
        const knownStocks = ['NVDA', 'AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'TSLA', 'META', 'NFLX', 'AMD', 'INTC', 'ORCL', 'CRM', 'ADBE', 'PYPL', 'DIS', 'BA', 'GE'];
        
        // Method 1: Uppercase symbols
        const symbolRegex = /\b([A-Z]{2,5})\b/g;
        const upperSymbols = message.match(symbolRegex) || [];
        
        upperSymbols.forEach(symbol => {
            if (!['IPO', 'USD', 'EUR', 'GBP', 'JPY', 'THE', 'AND', 'FOR', 'USA', 'CEO', 'CFO', 'API', 'RSI', 'MACD', 'ADX', 'ATR', 'MFI', 'CCI', 'OBV', 'CMF'].includes(symbol)) {
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
            'netflix': 'NFLX',
            'disney': 'DIS',
            'boeing': 'BA'
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
    // 🔄 UPDATE CONTEXT (✅ AMÉLIORÉ)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    updateContext(intent, entities) {
        this.currentContext.lastIntent = intent;

        if (entities.symbols.length > 0) {
            this.currentContext.symbols = entities.symbols;
            this.currentContext.lastSymbols = entities.symbols; // ✅ NOUVEAU : Sauvegarder pour le contexte
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
            lastAlphaVaultData: null,
            lastSymbols: []
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
            lastSymbols: this.currentContext.lastSymbols,
            conversationLength: this.conversationHistory.reduce((sum, msg) => sum + msg.text.length, 0)
        };
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ EXPORT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
console.log('✅ ChatbotAIEngine v6.2 ULTRA PRO loaded successfully');
console.log('🏆 AlphaVault Integration: ACTIVE');
console.log('📊 Real-time data fetching: ENABLED');
console.log('📈 Technical Analysis: ENABLED');
console.log('⚖ Comparison with Charts: ENABLED');