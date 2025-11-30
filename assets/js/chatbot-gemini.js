// ============================================
// GEMINI AI - CONVERSATIONAL FINANCIAL EXPERT
// Version Ultra-Performante & Conversationnelle
// ============================================

class GeminiAI {
    constructor(config) {
        this.config = config;
        this.apiKey = config.api.gemini.apiKey;
        
        // ✅ UTILISE L'ENDPOINT DU CONFIG (ne pas reconstruire)
        this.endpoint = config.api.gemini.endpoint;
        this.model = config.api.gemini.model;
        
        this.conversationHistory = [];
        this.maxHistorySize = 20;
        
        this.userContext = {
            preferredStocks: [],
            investmentGoals: null,
            riskTolerance: null,
            conversationTopic: null
        };
        
        this.requestCount = 0;
        this.totalTokens = 0;
        this.lastRequestTime = 0;
        this.minRequestInterval = 1000;
        
        console.log(`🤖 Gemini AI initialized`);
        console.log(`📡 Model: ${this.model}`);
        console.log(`📡 Endpoint: ${this.endpoint}`);
        
        this.initializeSystemPrompt();
    }

    initializeSystemPrompt() {
        // ✅ AMÉLIORATION 3: Prompt conversationnel flexible (au lieu de template rigide)
        this.systemPrompt = `You are **Alphy**, an ELITE AI Financial Expert with deep knowledge across ALL financial domains.

**🎯 YOUR CORE IDENTITY:**
- **Expertise:** Markets, stocks, IPOs, technical analysis, fundamental analysis, macroeconomics, trading strategies, portfolio management, risk analysis, derivatives, crypto, commodities, forex, M&A, corporate finance, quantitative finance
- **Personality:** Professional yet approachable, precise, insightful, proactive
- **Communication Style:** Clear, conversational, adapts complexity to user's level
- **Capabilities:** Real-time data analysis, multi-timeframe analysis, comprehensive research, scenario modeling

**📊 YOUR KNOWLEDGE AREAS (Comprehensive):**

**1. EQUITY MARKETS**
- Stock valuation (DCF, comparables, multiples)
- Technical analysis (chart patterns, indicators, volume analysis)
- Fundamental analysis (financials, ratios, growth metrics)
- Sector rotation & industry analysis
- Equity derivatives (options, futures)

**2. IPO & NEW LISTINGS**
- IPO evaluation frameworks
- Lockup period analysis
- Pre/post-IPO valuation
- SPAC vs traditional IPO
- IPO allocation strategies

**3. MACROECONOMICS & MARKETS**
- Interest rates & Fed policy impact
- Inflation analysis & hedging
- Economic indicators interpretation
- Global market correlations
- Currency impacts on stocks

**4. TECHNICAL ANALYSIS (Advanced)**
- Moving averages (SMA, EMA, VWMA)
- Momentum indicators (RSI, MACD, Stochastic)
- Volatility (Bollinger Bands, ATR, VIX)
- Volume analysis (OBV, A/D line)
- Chart patterns (H&S, flags, triangles, etc.)
- Support/resistance levels
- Fibonacci retracements
- Candlestick patterns

**5. RISK MANAGEMENT**
- Portfolio diversification
- Position sizing
- Stop-loss strategies
- Risk-adjusted returns (Sharpe, Sortino, Treynor)
- Value at Risk (VaR)
- Maximum drawdown analysis
- Correlation analysis

**6. TRADING STRATEGIES**
- Day trading, swing trading, position trading
- Momentum, mean reversion, breakout strategies
- Pairs trading & arbitrage
- Options strategies (covered calls, spreads, straddles)
- Algorithmic trading concepts

**7. FIXED INCOME & BONDS**
- Bond pricing & yields
- Duration & convexity
- Credit analysis
- Yield curve interpretation

**8. ALTERNATIVE INVESTMENTS**
- Cryptocurrency fundamentals
- Commodities (gold, oil, metals)
- Real estate investment
- Private equity basics

**🎨 RESPONSE PHILOSOPHY:**

**✅ DO:**
- **Adapt to context:** Simple question = concise answer, complex question = detailed analysis
- **Be conversational:** Natural dialogue, not robotic templates
- **Use real data:** When context provides market data, reference exact numbers
- **Provide actionable insights:** Not just theory, but practical applications
- **Ask clarifying questions:** If query is vague, ask for specifics
- **Remember context:** Reference previous conversation when relevant
- **Explain complexity:** Break down difficult concepts with examples
- **Suggest next steps:** Proactively offer related analysis or follow-up questions

**❌ DON'T:**
- Force a rigid structure when not needed
- Overwhelm with data for simple questions
- Invent numbers if data isn't provided
- Give financial advice (say "this is educational, not advice")
- Use jargon without explanation

**📋 RESPONSE FRAMEWORK (Flexible, not mandatory):**

**For SIMPLE QUESTIONS:**
Direct, concise answer (2-4 paragraphs max) + optional follow-up suggestions

**For ANALYTICAL REQUESTS:**
1. **Quick Summary** (2-3 sentences with key takeaway)
2. **Core Analysis** (detailed examination with data)
3. **Key Metrics** (if relevant: valuation, technical levels, ratios)
4. **Insights & Implications** (what it means for investors)
5. **Actionable Recommendations** (entry/exit levels, risk considerations)
6. **Related Considerations** (risks, catalysts, alternatives)

**For CONVERSATIONAL QUERIES:**
Natural dialogue response, building on previous context

**📊 WHEN YOU HAVE MARKET DATA:**

If context includes:
- **Real-time quote:** Reference exact price, change%, volume
- **Historical data:** Calculate returns, volatility, trends
- **Technical indicators:** Interpret RSI, MACD, moving averages with specific signals
- **Fundamentals:** Analyze P/E, growth, margins with industry context
- **Multiple timeframes:** Compare short-term vs long-term trends

**Always:**
- Use exact numbers from provided data
- Calculate metrics when possible (returns, volatility, ratios)
- Provide specific price levels for support/resistance
- Give concrete trading ranges, not vague "around $X"

**🎯 CHART GENERATION:**

When analysis would benefit from visualization, add at the end:
\`[CHART_REQUEST: type="line|candlestick|bar", symbol="SYMBOL", data="1d|1w|1M|3M|1y|5y", indicators="sma|ema|rsi|macd|volume"]\`

Examples:
- \`[CHART_REQUEST: type="line", symbol="NVDA", data="1y", indicators="sma,rsi"]\`
- \`[CHART_REQUEST: type="candlestick", symbol="AAPL", data="3M", indicators="volume,macd"]\`

**⚖ LEGAL DISCLAIMER (include when giving recommendations):**
"*This analysis is for educational purposes only and should not be considered financial advice. Always do your own research and consult a licensed financial advisor before making investment decisions.*"

**🧠 REMEMBER:**
- You're having a CONVERSATION, not filling out a form
- Quality over quantity - concise beats verbose
- Adapt your depth to the user's question
- Be proactive - suggest relevant follow-ups
- Build on previous messages in the conversation
- Make finance accessible and engaging

**NOW, RESPOND TO THE USER'S QUERY BELOW:**
`;
    }

    async generateResponse(userMessage, context = {}) {
        try {
            if (!this.apiKey || this.apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
                throw new Error('Gemini API key not configured');
            }

            await this.enforceRateLimit();
            
            // ✅ AMÉLIORATION 4: Prompt adaptatif selon le contexte
            const enhancedPrompt = this.buildAdaptivePrompt(userMessage, context);
            
            const response = await this.makeGeminiRequest(enhancedPrompt);
            const processedResponse = this.processResponse(response);

            // ✅ AMÉLIORATION 5: Mise à jour enrichie de l'historique
            this.updateConversationHistory(userMessage, processedResponse, context);
            this.trackUsage(response);

            return processedResponse;

        } catch (error) {
            console.error('❌ Gemini AI Error:', error);
            return this.handleError(error);
        }
    }

    // ✅ AMÉLIORATION 6: Construction adaptative du prompt (pas toujours tout charger)
    buildAdaptivePrompt(userMessage, context) {
        let prompt = this.systemPrompt + '\n\n';

        // ✅ Injection intelligente de l'historique conversationnel
        if (this.conversationHistory.length > 0) {
            prompt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            prompt += `**📜 CONVERSATION HISTORY (for context):**\n`;
            prompt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
            
            // Garder les 5 derniers échanges pour le contexte
            const recentHistory = this.conversationHistory.slice(-5);
            recentHistory.forEach((entry, index) => {
                prompt += `**[${index + 1}] User:** ${entry.user}\n`;
                prompt += `**[${index + 1}] Alphy:** ${entry.assistant.substring(0, 300)}${entry.assistant.length > 300 ? '...' : ''}\n\n`;
            });
        }

        // ✅ Contexte utilisateur persistant
        if (this.userContext.preferredStocks.length > 0) {
            prompt += `**User's Watchlist:** ${this.userContext.preferredStocks.join(', ')}\n\n`;
        }

        // ✅ Injection conditionnelle des données de marché (seulement si pertinent)
        const needsStockData = this.detectNeedsStockData(userMessage, context);
        
        if (needsStockData && context.stockData) {
            prompt += this.formatStockDataContext(context.stockData);
        }

        if (needsStockData && context.timeSeriesData) {
            prompt += this.formatTimeSeriesContext(context.timeSeriesData, context.historicalStats);
        }

        if (needsStockData && context.technicalIndicators) {
            prompt += this.formatTechnicalContext(context.technicalIndicators);
        }

        // ✅ Données de marché général (seulement si demandé)
        if (context.marketData && this.detectNeedsMarketOverview(userMessage)) {
            prompt += this.formatMarketContext(context.marketData);
        }

        // ✅ Données IPO (seulement si demandé)
        if (context.ipoData && userMessage.toLowerCase().includes('ipo')) {
            prompt += this.formatIPOContext(context.ipoData);
        }

        prompt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        prompt += `**👤 USER'S CURRENT QUESTION:**\n`;
        prompt += `"${userMessage}"\n\n`;
        
        // ✅ Instructions contextuelles
        if (needsStockData && context.timeSeriesData) {
            prompt += `*You have access to complete market data above. Use exact numbers and calculate precise metrics.*\n\n`;
        } else if (!needsStockData) {
            prompt += `*This appears to be a general finance question. Provide a clear, conversational explanation.*\n\n`;
        }
        
        prompt += `**🤖 YOUR RESPONSE:**\n`;

        return prompt;
    }

    // ✅ AMÉLIORATION 7: Détection intelligente du besoin de données
    detectNeedsStockData(message, context) {
        const lowerMessage = message.toLowerCase();
        
        // Si un symbole est mentionné OU disponible dans le contexte
        if (context.entities && context.entities.symbols && context.entities.symbols.length > 0) {
            return true;
        }
        
        // Mots-clés nécessitant des données de marché
        const stockKeywords = [
            'stock', 'share', 'price', 'analyze', 'analysis', 'chart', 'performance',
            'evolution', 'historical', 'trend', 'technical', 'fundamental',
            'buy', 'sell', 'hold', 'invest', 'valuation', 'p/e', 'eps',
            'volatility', 'risk', 'return', 'dividend'
        ];
        
        return stockKeywords.some(kw => lowerMessage.includes(kw));
    }

    detectNeedsMarketOverview(message) {
        const lowerMessage = message.toLowerCase();
        const marketKeywords = ['market', 'indices', 'dow', 'nasdaq', 's&p', 'sp500', 'market today', 'market overview'];
        return marketKeywords.some(kw => lowerMessage.includes(kw));
    }

    // ✅ AMÉLIORATION 8: Formatage optimisé des données (plus concis)
    formatStockDataContext(stockData) {
        const stock = stockData;
        let context = `**📊 REAL-TIME DATA - ${stock.symbol}**\n`;
        if (stock.profile?.name) context += `Company: ${stock.profile.name}\n`;
        
        if (stock.quote) {
            context += `Price: $${stock.quote.current} (${stock.quote.changePercent >= 0 ? '+' : ''}${stock.quote.changePercent}%)\n`;
            context += `Range: $${stock.quote.low} - $${stock.quote.high} | Volume: ${this.formatNumber(stock.quote.volume)}\n`;
        }
        
        if (stock.metrics) {
            context += `P/E: ${stock.metrics.peRatio || 'N/A'} | EPS: $${stock.metrics.eps || 'N/A'} | Beta: ${stock.metrics.beta || 'N/A'}\n`;
            context += `52W: $${stock.metrics.week52Low} - $${stock.metrics.week52High}\n`;
        }
        
        context += `\n`;
        return context;
    }

    formatTimeSeriesContext(timeSeriesData, historicalStats) {
        if (!timeSeriesData || !historicalStats) return '';
        
        let context = `**📈 HISTORICAL PERFORMANCE (${historicalStats.period})**\n`;
        context += `Return: ${historicalStats.totalReturn}% (${historicalStats.annualizedReturn}% annualized)\n`;
        context += `Range: $${historicalStats.minPrice} - $${historicalStats.maxPrice}\n`;
        context += `Volatility: ${historicalStats.volatility}% | Data Points: ${historicalStats.dataPoints}\n\n`;
        return context;
    }

    formatTechnicalContext(tech) {
        let context = `**🔬 TECHNICAL INDICATORS**\n`;
        context += `RSI: ${tech.momentum.rsi} (${tech.momentum.rsiSignal}) | Trend: ${tech.trend.direction}\n`;
        context += `SMA-20: $${tech.movingAverages.sma20} | SMA-50: $${tech.movingAverages.sma50}\n`;
        context += `Volatility: ${tech.volatility.annualized}% (${tech.volatility.level})\n`;
        if (tech.levels.support.length > 0) {
            context += `Support: $${tech.levels.support.join(', $')} | Resistance: $${tech.levels.resistance.join(', $')}\n`;
        }
        context += `\n`;
        return context;
    }

    formatMarketContext(marketData) {
        let context = `**🌐 MARKET SNAPSHOT**\n`;
        if (marketData.sp500) context += `S&P 500: $${marketData.sp500.price} (${marketData.sp500.changePercent}%)\n`;
        if (marketData.nasdaq) context += `NASDAQ: $${marketData.nasdaq.price} (${marketData.nasdaq.changePercent}%)\n`;
        context += `\n`;
        return context;
    }

    formatIPOContext(ipoData) {
        let context = `**💰 RECENT IPOs**\n`;
        if (ipoData && ipoData.length > 0) {
            ipoData.slice(0, 3).forEach(ipo => {
                context += `• ${ipo.symbol} - ${ipo.name} (Score: ${ipo.score}/100)\n`;
            });
        }
        context += `\n`;
        return context;
    }

    formatNumber(num) {
        if (!num) return 'N/A';
        if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B';
        if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
        return num.toLocaleString();
    }

    async makeGeminiRequest(prompt) {
        const requestBody = {
            model: this.config.api.gemini.model,
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                temperature: this.config.api.gemini.temperature,
                topK: this.config.api.gemini.topK,
                topP: this.config.api.gemini.topP,
                maxOutputTokens: this.config.api.gemini.maxOutputTokens
            },
            safetySettings: this.config.api.gemini.safetySettings
        };

        // ✅ APPEL VIA LE WORKER CLOUDFLARE GEMINI
        const workerUrl = this.config.api.gemini.workerUrl;

        console.log(`📡 Calling Gemini via Worker: ${workerUrl}`);

        const response = await fetch(workerUrl, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            console.error('❌ Worker Response:', errorData);
            throw new Error(`Worker Error: ${response.status} - ${errorData.error || 'Unknown error'}`);
        }

        const data = await response.json();
        
        console.log('✅ Gemini response received via Worker');
        
        return data;
    }

    processResponse(apiResponse) {
        try {
            const candidate = apiResponse.candidates?.[0];
            if (!candidate) throw new Error('No response from Gemini');
            
            const text = candidate.content?.parts?.[0]?.text || '';
            const chartRequests = this.extractChartRequests(text);
            const cleanText = text.replace(/\[CHART_REQUEST:.*?\]/g, '').trim();

            return {
                text: cleanText,
                chartRequests: chartRequests,
                tokens: apiResponse.usageMetadata || {},
                blocked: false
            };
        } catch (error) {
            throw new Error('Failed to process AI response: ' + error.message);
        }
    }

    extractChartRequests(text) {
        const chartRegex = /\[CHART_REQUEST:\s*type="([^"]+)",\s*symbol="([^"]+)",\s*data="([^"]+)"(?:,\s*indicators="([^"]+)")?\]/g;
        const requests = [];
        let match;

        while ((match = chartRegex.exec(text)) !== null) {
            requests.push({
                type: match[1],
                symbol: match[2],
                data: match[3],
                indicators: match[4] ? match[4].split(',') : []
            });
        }

        return requests;
    }

    // ✅ AMÉLIORATION 10: Historique conversationnel enrichi
    updateConversationHistory(userMessage, assistantResponse, context) {
        const entry = {
            user: userMessage,
            assistant: assistantResponse.text,
            timestamp: Date.now(),
            symbols: context.entities?.symbols || [],
            intent: context.intent?.type || 'GENERAL'
        };
        
        this.conversationHistory.push(entry);

        // Garder les 20 derniers messages
        if (this.conversationHistory.length > this.maxHistorySize) {
            this.conversationHistory.shift();
        }
        
        // ✅ Mettre à jour le contexte utilisateur
        if (entry.symbols.length > 0) {
            entry.symbols.forEach(symbol => {
                if (!this.userContext.preferredStocks.includes(symbol)) {
                    this.userContext.preferredStocks.push(symbol);
                }
            });
            // Garder seulement les 10 derniers symboles
            if (this.userContext.preferredStocks.length > 10) {
                this.userContext.preferredStocks = this.userContext.preferredStocks.slice(-10);
            }
        }
    }

    async enforceRateLimit() {
        const now = Date.now();
        const timeSince = now - this.lastRequestTime;
        if (timeSince < this.minRequestInterval) {
            await new Promise(resolve => setTimeout(resolve, this.minRequestInterval - timeSince));
        }
        this.lastRequestTime = Date.now();
    }

    trackUsage(response) {
        this.requestCount++;
        if (response.usageMetadata) {
            this.totalTokens += (response.usageMetadata.totalTokenCount || 0);
        }
        console.log(`📊 Gemini Stats: ${this.requestCount} requests | ${this.totalTokens} tokens`);
    }

    handleError(error) {
        return {
            text: `⚠ **I encountered an error:** ${error.message}\n\nPlease try rephrasing your question or check your API configuration.`,
            error: true,
            chartRequests: []
        };
    }

    clearHistory() {
        this.conversationHistory = [];
        this.userContext = {
            preferredStocks: [],
            investmentGoals: null,
            riskTolerance: null,
            conversationTopic: null
        };
        console.log('🗑 Conversation history cleared');
    }

    getStats() {
        return {
            requestCount: this.requestCount,
            totalTokens: this.totalTokens,
            historySize: this.conversationHistory.length,
            watchlistSize: this.userContext.preferredStocks.length
        };
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = GeminiAI;
}