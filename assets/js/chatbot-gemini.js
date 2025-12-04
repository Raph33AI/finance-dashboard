// ============================================
// GEMINI AI - CONVERSATIONAL FINANCIAL EXPERT
// Version Ultra-Performante & Conversationnelle v3.5
// ✅ CORRECTION: Few-Shot Examples + Prompts Ciblés
// ============================================

class GeminiAI {
    constructor(config) {
        this.config = config;
        
        this.workerUrl = config.api.gemini.workerUrl;
        this.model = config.api.gemini.model || 'gemini-2.5-flash';
        this.apiKey = null;
        
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
        
        console.log(`🤖 Gemini AI initialized (v3.5 - Few-Shot Enhanced)`);
        console.log(`📡 Model: ${this.model}`);
        console.log(`📡 Worker URL: ${this.workerUrl}`);
        
        this.initializeSystemPrompt();
    }

    initializeSystemPrompt() {
        this.systemPrompt = `You are **Alphy**, an ELITE AI Financial Expert specializing in clear, actionable market insights.

**🎯 YOUR CORE MISSION:**
Provide **precise, data-driven financial analysis** in a professional yet conversational tone. Always reference specific numbers from provided data and structure responses for maximum clarity.

**📐 RESPONSE RULES:**

**1⃣ FOR MARKET NEWS QUESTIONS** (e.g., "What's happening in the market today?"):
- **Structure:**
  • **Market Overview** (2-3 sentences): Current indices performance (S&P, NASDAQ, Dow)
  • **Key Drivers** (1-2 sentences): Main factors moving markets today
  • **Top Stories** (3-4 bullet points): Most impactful news headlines
  • **Investor Sentiment** (1 sentence): Overall market mood (bullish/bearish/neutral)
- **Length:** 3-4 short paragraphs
- **Tone:** News anchor style (factual, timely, digestible)

**2⃣ FOR STOCK ANALYSIS** (e.g., "Analyze NVDA stock"):
- **Structure:**
  • **Current Status** (price, change%, volume)
  • **Key Metrics** (P/E, market cap, 52W range)
  • **Technical Picture** (trend, RSI, support/resistance)
  • **Fundamental Snapshot** (earnings quality, analyst consensus)
  • **Investment Perspective** (risks, catalysts, recommendation)
- **Length:** 4-5 paragraphs
- **Tone:** Analyst report style (objective, detailed, actionable)

**3⃣ FOR STOCK COMPARISONS** (e.g., "Compare AAPL vs MSFT"):
- **Structure:**
  • **Performance Comparison** (returns, volatility)
  • **Valuation Metrics** (P/E, PEG, margins)
  • **Strengths/Weaknesses** (each stock)
  • **Which to Choose?** (growth vs value, risk profiles)
- **Length:** 4-5 paragraphs
- **Tone:** Side-by-side analysis (balanced, comparative)

**4⃣ FOR HISTORICAL PERFORMANCE** (e.g., "NVDA evolution over 5 years"):
- **Structure:**
  • **Total Return** (exact % with annualized)
  • **Volatility Analysis** (risk-adjusted metrics)
  • **Major Milestones** (peaks, crashes, recoveries)
  • **Risk Metrics** (max drawdown, Sharpe ratio)
- **Length:** 3-4 paragraphs
- **Tone:** Historical review (data-heavy, context-rich)

**5⃣ FOR IPO QUESTIONS** (e.g., "Top performing IPOs"):
- **Structure:**
  • **IPO Landscape** (recent trends, market conditions)
  • **Top Performers** (list with returns)
  • **Quality Indicators** (score, fundamentals)
  • **Investment Considerations** (risks, lockup periods)
- **Length:** 3-4 paragraphs
- **Tone:** IPO specialist (cautiously optimistic, risk-aware)

**6⃣ FOR EDUCATIONAL QUESTIONS** (e.g., "Explain P/E ratio"):
- **Structure:**
  • **Simple Definition** (what it is)
  • **How to Calculate** (formula with example)
  • **Interpretation** (high vs low, industry context)
  • **Limitations** (when it misleads)
- **Length:** 2-3 paragraphs
- **Tone:** Teacher style (clear, example-rich, beginner-friendly)

**✅ CRITICAL REQUIREMENTS:**

- **Use exact numbers** from provided data (don't say "around $150", say "$152.34")
- **Calculate metrics** when raw data is provided (returns, volatility, ratios)
- **Reference timestamps** for time-sensitive data ("as of today", "in the last quarter")
- **Provide specific levels** for technical analysis ($145 support, not "mid-140s")
- **Add disclaimer** for investment recommendations

**❌ NEVER:**
- Give vague numbers ("around", "approximately") when exact data exists
- Overwhelm simple questions with excessive technical jargon
- Invent data if not provided (say "data not available")
- Provide financial advice (always say "for educational purposes only")

**📊 FEW-SHOT EXAMPLES:**

**Example 1: Market News Question**
**User:** "What's happening in the market today?"
**Alphy:** "📊 **Market Overview**

The U.S. stock market is showing mixed performance today, with the **S&P 500** up **0.8%** at **4,520**, the **NASDAQ** gaining **1.2%** to **14,150**, while the **Dow Jones** is slightly down **0.2%** at **35,100**. Volume is above average, indicating active investor participation.

**Key Drivers:**

Today's market sentiment is heavily influenced by anticipation of the upcoming **inflation report** scheduled for Friday. Investors are positioning cautiously, with a noticeable shift from an "oversold to overbought" state, suggesting recent upward momentum may face consolidation. Additionally, **tech stocks** are outperforming on renewed AI optimism.

**Top Stories:**
• **Fed Policy Watch**: Markets pricing in 65% chance of rate hold next month
• **Tech Earnings Beat**: Major semiconductor companies reporting strong Q3 results
• **Energy Sector Weakness**: Oil prices down 3% on demand concerns
• **Treasury Yields**: 10-year yield steady at 4.25%, easing financial conditions

**Investor Sentiment:** Cautiously optimistic. While short-term momentum is positive, traders are monitoring inflation data closely before making large commitments."

---

**Example 2: Stock Analysis Question**
**User:** "Analyze NVDA stock"
**Alphy:** "📊 **NVIDIA (NVDA) Analysis**

**Current Status:**
NVDA is trading at **$485.72**, down **1.4%** today with volume at **42.5M shares** (above the 30-day average of 38M). The stock is **8.2% below its 52-week high** of $528.50 and **156% above its 52-week low** of $189.40.

**Valuation Metrics:**
With a **market cap of $1.21 trillion**, NVDA trades at a **P/E ratio of 65.3** (premium to sector average of 28), **EPS of $7.44 (TTM)**, and a **profit margin of 48.5%**. The stock has a **beta of 1.68**, indicating higher volatility than the broader market.

**Technical Picture:**
NVDA is in a **strong uptrend** with the price above both the **SMA-50 ($465)** and **SMA-200 ($425)**. The **RSI at 58** suggests neutral momentum (not overbought/oversold). Key support at **$470**, resistance at **$500**. Max drawdown from peak: **12.3%**.

**Fundamental Snapshot:**
NVDA has beaten earnings estimates in **7 out of 8 recent quarters** (87.5% beat rate), with an **"Excellent" earnings quality score**. Analyst consensus is **Strong Buy** (78% bullish, 28 out of 36 analysts recommend buy/strong buy). Mean price target: **$545** (**+12% upside**).

**Investment Perspective:**
NVDA remains a **high-conviction growth play** driven by AI demand. However, the premium valuation (P/E 65+) requires continued strong execution. **Risks**: Regulatory scrutiny, China exposure, valuation compression. **Catalysts**: Data center growth, new chip launches. Best for **growth-oriented investors** comfortable with volatility.

*This analysis is for educational purposes only and should not be considered financial advice.*"

---

**Example 3: Comparison Question**
**User:** "Compare AAPL vs MSFT"
**Alphy:** "📊 **AAPL vs MSFT Comparison**

**Performance:**
Over the past year, **MSFT** outperformed with **+32.5% total return** vs **AAPL's +18.2%**. However, MSFT showed higher volatility (**28% annualized**) compared to AAPL (**22%**). The correlation between the two is **0.78** (strong positive), offering limited diversification benefits.

**Valuation:**
**AAPL** trades at a **P/E of 29.5** (market cap $2.95T), while **MSFT** commands a **P/E of 33.8** (market cap $2.82T). MSFT has stronger profit margins (**42.1%** vs AAPL's **25.3%**) and higher ROE (**43.5%** vs **147%** - AAPL benefits from buybacks). Both have fortress balance sheets.

**Strengths:**
**AAPL**: Ecosystem lock-in, services growth, capital returns ($90B buyback), dividend yield 0.5%
**MSFT**: Cloud leadership (Azure), AI integration, enterprise dominance, dividend yield 0.8%

**Which to Choose?**
For **growth investors**, MSFT offers higher upside via AI/cloud expansion but with more volatility. For **value/income investors**, AAPL provides steadier returns, lower valuation, and a mature business model. Risk-averse investors may prefer AAPL's stability; aggressive investors may favor MSFT's innovation premium.

*Both are high-quality holdings. Diversification across both could capture complementary strengths.*"

---

**NOW, RESPOND TO THE USER'S QUERY WITH THE SAME PRECISION AND STRUCTURE.**
`;
    }

    async generateResponse(userMessage, context = {}) {
        try {
            if (!this.workerUrl) {
                throw new Error('Gemini Worker URL not configured. Please check chatbot-config.js');
            }

            await this.enforceRateLimit();
            
            // ✅ CORRECTION: Utiliser la nouvelle méthode ciblée
            const enhancedPrompt = this.buildTargetedPrompt(userMessage, context);
            
            const response = await this.makeGeminiRequest(enhancedPrompt);
            const processedResponse = this.processResponse(response);

            this.updateConversationHistory(userMessage, processedResponse, context);
            this.trackUsage(response);

            return processedResponse;

        } catch (error) {
            console.error('❌ Gemini AI Error:', error);
            return this.handleError(error);
        }
    }

    // ✅ NOUVELLE MÉTHODE: Prompts ultra-ciblés selon le type de question
    buildTargetedPrompt(userMessage, context) {
        let prompt = this.systemPrompt + '\n\n';

        // Détecter le type de question
        const questionType = this.detectQuestionType(userMessage, context);
        
        console.log(`🎯 Question Type Detected: ${questionType}`);

        // ✅ PROMPTS SPÉCIALISÉS PAR TYPE
        switch (questionType) {
            case 'MARKET_NEWS':
                prompt += this.buildMarketNewsPrompt(userMessage, context);
                break;
                
            case 'STOCK_ANALYSIS':
                prompt += this.buildStockAnalysisPrompt(userMessage, context);
                break;
                
            case 'STOCK_COMPARISON':
                prompt += this.buildComparisonPrompt(userMessage, context);
                break;
                
            case 'HISTORICAL_PERFORMANCE':
                prompt += this.buildHistoricalPrompt(userMessage, context);
                break;
                
            case 'IPO_ANALYSIS':
                prompt += this.buildIPOPrompt(userMessage, context);
                break;
                
            case 'EDUCATIONAL':
                prompt += this.buildEducationalPrompt(userMessage, context);
                break;
                
            default:
                prompt += this.buildGeneralPrompt(userMessage, context);
        }

        return prompt;
    }

    // ✅ Détection précise du type de question
    detectQuestionType(message, context) {
        const lower = message.toLowerCase();
        
        // Market News
        if (/what'?s happening|market today|market news|today'?s market|market update|market sentiment/i.test(lower)) {
            return 'MARKET_NEWS';
        }
        
        // Comparison
        if (context.intent?.isComparison || /compare|vs|versus/i.test(lower)) {
            return 'STOCK_COMPARISON';
        }
        
        // Historical
        if (/evolution|historical|history|performance over|last.*years?|past.*years?|trend|since/i.test(lower)) {
            return 'HISTORICAL_PERFORMANCE';
        }
        
        // IPO
        if (/ipo|initial public offering|upcoming ipo|recent ipo|top.*ipo/i.test(lower)) {
            return 'IPO_ANALYSIS';
        }
        
        // Educational
        if (/what is|explain|define|tell me about|how does.*work|what does.*mean/i.test(lower)) {
            return 'EDUCATIONAL';
        }
        
        // Stock Analysis (si un symbole est détecté)
        if (context.detectedEntities?.symbols?.length > 0 || /analyze|analysis|stock|share/i.test(lower)) {
            return 'STOCK_ANALYSIS';
        }
        
        return 'GENERAL';
    }

    // ✅ PROMPT SPÉCIALISÉ: Market News
    buildMarketNewsPrompt(userMessage, context) {
        let prompt = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        prompt += `**📰 MARKET NEWS REQUEST**\n`;
        prompt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        
        // Market Data
        if (context.marketData) {
            prompt += `**📊 CURRENT MARKET SNAPSHOT:**\n\n`;
            if (context.marketData.sp500) {
                prompt += `- **S&P 500 (SPY):** $${context.marketData.sp500.price} (${context.marketData.sp500.changePercent > 0 ? '+' : ''}${context.marketData.sp500.changePercent}%)\n`;
            }
            if (context.marketData.nasdaq) {
                prompt += `- **NASDAQ (QQQ):** $${context.marketData.nasdaq.price} (${context.marketData.nasdaq.changePercent > 0 ? '+' : ''}${context.marketData.nasdaq.changePercent}%)\n`;
            }
            if (context.marketData.dow) {
                prompt += `- **Dow Jones (DIA):** $${context.marketData.dow.price} (${context.marketData.dow.changePercent > 0 ? '+' : ''}${context.marketData.dow.changePercent}%)\n`;
            }
            prompt += `\n`;
        }
        
        // Top News Headlines
        if (context.marketNews && context.marketNews.length > 0) {
            prompt += `**📰 TOP MARKET NEWS (Last 24H):**\n\n`;
            context.marketNews.slice(0, 8).forEach((news, i) => {
                const time = new Date(news.datetime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                prompt += `${i + 1}. **${news.headline}** (${news.source}, ${time})\n`;
            });
            prompt += `\n`;
        }
        
        prompt += `**👤 USER QUESTION:** "${userMessage}"\n\n`;
        
        prompt += `**🎯 YOUR TASK:**\n\n`;
        prompt += `Provide a **professional market update** following this structure:\n\n`;
        prompt += `1. **Market Overview** (2-3 sentences):\n`;
        prompt += `   - Current indices performance with exact numbers\n`;
        prompt += `   - Overall market direction (up/down/mixed)\n\n`;
        prompt += `2. **Key Drivers** (1-2 sentences):\n`;
        prompt += `   - Main factors moving markets today\n`;
        prompt += `   - Upcoming events investors are watching\n\n`;
        prompt += `3. **Top Stories** (3-4 bullet points):\n`;
        prompt += `   - Most impactful news from the headlines above\n`;
        prompt += `   - Brief context for each story\n\n`;
        prompt += `4. **Investor Sentiment** (1 sentence):\n`;
        prompt += `   - Overall market mood (bullish/bearish/cautious)\n\n`;
        prompt += `**Length:** 3-4 short, digestible paragraphs\n`;
        prompt += `**Tone:** News anchor style (factual, timely, professional)\n`;
        prompt += `**Use exact numbers** from the market data above.\n\n`;
        prompt += `**🤖 YOUR RESPONSE:**\n`;
        
        return prompt;
    }

    // ✅ PROMPT SPÉCIALISÉ: Stock Analysis
    buildStockAnalysisPrompt(userMessage, context) {
        let prompt = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        prompt += `**📊 STOCK ANALYSIS REQUEST**\n`;
        prompt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        
        if (context.stockData) {
            const stock = context.stockData;
            prompt += `**${stock.profile?.name || stock.symbol}** (${stock.symbol})\n\n`;
            
            // Prix actuel
            prompt += `**Current Price:** $${stock.quote.current} (${stock.quote.changePercent > 0 ? '+' : ''}${stock.quote.changePercent}%)\n`;
            prompt += `**Day Range:** $${stock.quote.low} - $${stock.quote.high} | **Volume:** ${this.formatNumber(stock.quote.volume)}\n`;
            prompt += `**52-Week Range:** $${stock.metrics?.week52Low || 'N/A'} - $${stock.metrics?.week52High || 'N/A'}\n\n`;
            
            // Métriques clés
            if (stock.metrics) {
                prompt += `**Key Metrics:**\n`;
                prompt += `- Market Cap: $${stock.profile?.marketCap || 'N/A'}B | P/E: ${stock.metrics.peRatio || 'N/A'} | EPS: $${stock.metrics.eps || 'N/A'}\n`;
                prompt += `- Beta: ${stock.metrics.beta || 'N/A'} | ROE: ${stock.metrics.roe || 'N/A'}% | Profit Margin: ${stock.metrics.profitMargin || 'N/A'}%\n\n`;
            }
            
            // Technique
            if (context.technicalIndicators) {
                const tech = context.technicalIndicators;
                prompt += `**Technical Indicators:**\n`;
                prompt += `- RSI(14): ${tech.momentum.rsi} (${tech.momentum.rsiSignal}) | Trend: ${tech.trend.direction}\n`;
                prompt += `- SMA-20: $${tech.movingAverages.sma20} | SMA-50: $${tech.movingAverages.sma50}\n`;
                if (tech.levels.support.length > 0) {
                    prompt += `- Support: $${tech.levels.support.join(', $')} | Resistance: $${tech.levels.resistance.join(', $')}\n`;
                }
                prompt += `\n`;
            }
            
            // Analystes
            if (context.analystRecommendations) {
                const rec = context.analystRecommendations;
                prompt += `**Analyst Consensus:**\n`;
                prompt += `- **${rec.consensus}** (${rec.bullishPercent}% bullish)\n`;
                prompt += `- Strong Buy: ${rec.strongBuy} | Buy: ${rec.buy} | Hold: ${rec.hold} | Sell: ${rec.sell} | Strong Sell: ${rec.strongSell}\n\n`;
            }
            
            if (context.priceTarget) {
                const pt = context.priceTarget;
                prompt += `**Price Target:** Mean $${pt.targetMean} (**${pt.upside > 0 ? '+' : ''}${pt.upside}% upside**) | Range: $${pt.targetLow} - $${pt.targetHigh}\n\n`;
            }
            
            // Earnings
            if (context.earningsHistory) {
                const earn = context.earningsHistory;
                prompt += `**Earnings:** Beat rate ${earn.beatRate}% (${earn.beatCount}/${earn.recent.length} beats) | Quality: **${earn.earningsQuality}**\n\n`;
            }
        }
        
        prompt += `**👤 USER QUESTION:** "${userMessage}"\n\n`;
        
        prompt += `**🎯 YOUR TASK:**\n\n`;
        prompt += `Provide a **comprehensive stock analysis** with this structure:\n\n`;
        prompt += `1. **Current Status** (price, volume, range)\n`;
        prompt += `2. **Valuation Metrics** (P/E, market cap, margins)\n`;
        prompt += `3. **Technical Picture** (trend, RSI, support/resistance levels)\n`;
        prompt += `4. **Analyst View** (consensus, price targets)\n`;
        prompt += `5. **Investment Perspective** (risks, catalysts, who should buy)\n\n`;
        prompt += `**Length:** 4-5 paragraphs | **Tone:** Analyst report\n`;
        prompt += `**Use exact numbers** from the data above. End with disclaimer.\n\n`;
        prompt += `**🤖 YOUR RESPONSE:**\n`;
        
        return prompt;
    }

    // ✅ PROMPT SPÉCIALISÉ: Stock Comparison
    buildComparisonPrompt(userMessage, context) {
        let prompt = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        prompt += `**⚖ STOCK COMPARISON REQUEST**\n`;
        prompt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        
        if (context.comparisonData && context.comparisonData.stocksData.length >= 2) {
            prompt += `**Comparing:** ${context.comparisonData.symbols.join(' vs ')}\n\n`;
            
            // Tableau comparatif
            context.comparisonData.stocksData.forEach((stock, index) => {
                prompt += `**${index + 1}. ${stock.symbol}** - ${stock.profile?.name || stock.symbol}\n`;
                prompt += `- Price: $${stock.quote.current} (${stock.quote.changePercent > 0 ? '+' : ''}${stock.quote.changePercent}%)\n`;
                prompt += `- Market Cap: $${stock.profile?.marketCap || 'N/A'}B | P/E: ${stock.metrics?.peRatio || 'N/A'}\n`;
                prompt += `- Beta: ${stock.metrics?.beta || 'N/A'} | ROE: ${stock.metrics?.roe || 'N/A'}%\n`;
                prompt += `- Profit Margin: ${stock.metrics?.profitMargin || 'N/A'}%\n\n`;
            });
            
            // Performance historique
            if (context.comparisonData.timeSeries && context.comparisonData.timeSeries.length > 0) {
                prompt += `**Historical Performance:**\n`;
                context.comparisonData.timeSeries.forEach(series => {
                    if (series.data && series.data.length > 0) {
                        const firstPrice = series.data[0].close;
                        const lastPrice = series.data[series.data.length - 1].close;
                        const totalReturn = ((lastPrice - firstPrice) / firstPrice * 100).toFixed(2);
                        prompt += `- **${series.symbol}**: ${totalReturn > 0 ? '+' : ''}${totalReturn}% (${series.data.length} days)\n`;
                    }
                });
                prompt += `\n`;
            }
            
            // Corrélation
            if (context.correlationAnalysis) {
                prompt += `**Correlation Analysis:**\n`;
                prompt += `- Correlation: ${context.correlationAnalysis.correlation} (${context.correlationAnalysis.interpretation})\n`;
                prompt += `- Diversification Benefit: ${context.correlationAnalysis.diversificationBenefit}\n\n`;
            }
            
            // Tableau metrics
            if (context.comparisonData.keyMetricsComparison) {
                prompt += `**Metrics Comparison Table:**\n\n`;
                const table = context.comparisonData.keyMetricsComparison;
                prompt += `| ${table.headers.join(' | ')} |\n`;
                prompt += `|${table.headers.map(() => '---').join('|')}|\n`;
                table.rows.forEach(row => {
                    prompt += `| ${row.join(' | ')} |\n`;
                });
                prompt += `\n`;
            }
        }
        
        prompt += `**👤 USER QUESTION:** "${userMessage}"\n\n`;
        
        prompt += `**🎯 YOUR TASK:**\n\n`;
        prompt += `Provide a **detailed side-by-side comparison** with this structure:\n\n`;
        prompt += `1. **Performance Comparison**:\n`;
        prompt += `   - Historical returns (exact % from data)\n`;
        prompt += `   - Volatility comparison (which is riskier?)\n`;
        prompt += `   - Correlation insight (diversification potential)\n\n`;
        prompt += `2. **Valuation Analysis**:\n`;
        prompt += `   - P/E ratio comparison (which is cheaper?)\n`;
        prompt += `   - Profitability metrics (margins, ROE)\n`;
        prompt += `   - Market cap and scale differences\n\n`;
        prompt += `3. **Strengths & Weaknesses**:\n`;
        prompt += `   - Key advantages of each stock\n`;
        prompt += `   - Main risks for each\n\n`;
        prompt += `4. **Investment Recommendation**:\n`;
        prompt += `   - Which for growth investors?\n`;
        prompt += `   - Which for value investors?\n`;
        prompt += `   - Risk profile comparison\n\n`;
        prompt += `**Length:** 4-5 paragraphs | **Tone:** Balanced, comparative analysis\n`;
        prompt += `**Use exact numbers** from the tables above. Be objective.\n\n`;
        prompt += `**🤖 YOUR RESPONSE:**\n`;
        
        return prompt;
    }

    // ✅ PROMPT SPÉCIALISÉ: Historical Performance
    buildHistoricalPrompt(userMessage, context) {
        let prompt = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        prompt += `**📈 HISTORICAL PERFORMANCE REQUEST**\n`;
        prompt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        
        if (context.stockData) {
            const stock = context.stockData;
            prompt += `**Stock:** ${stock.symbol} - ${stock.profile?.name || stock.symbol}\n`;
            prompt += `**Current Price:** $${stock.quote.current}\n\n`;
        }
        
        if (context.historicalStats) {
            const stats = context.historicalStats;
            prompt += `**Historical Performance (${stats.period}):**\n\n`;
            prompt += `- **Total Return:** ${stats.totalReturn > 0 ? '+' : ''}${stats.totalReturn}%\n`;
            prompt += `- **Annualized Return:** ${stats.annualizedReturn > 0 ? '+' : ''}${stats.annualizedReturn}%\n`;
            prompt += `- **Period Range:** $${stats.minPrice} (low) - $${stats.maxPrice} (high)\n`;
            prompt += `- **Volatility:** ${stats.volatility}% annualized\n`;
            prompt += `- **Data Points:** ${stats.dataPoints} trading days\n\n`;
        }
        
        if (context.technicalIndicators) {
            const tech = context.technicalIndicators;
            
            if (tech.volatility) {
                prompt += `**Risk Metrics:**\n`;
                prompt += `- **Max Drawdown:** ${tech.volatility.maxDrawdown}% (worst decline from peak)\n`;
                prompt += `- **Current Drawdown:** ${tech.volatility.currentDrawdown}%\n`;
                prompt += `- **Sharpe Ratio:** ${tech.volatility.sharpeRatio} (risk-adjusted return)\n`;
                prompt += `- **Volatility Level:** ${tech.volatility.level}\n\n`;
            }
            
            if (tech.trend) {
                prompt += `**Trend Analysis:**\n`;
                prompt += `- **Direction:** ${tech.trend.direction}\n`;
                prompt += `- **Strength:** ${tech.trend.strength}\n\n`;
            }
        }
        
        if (context.advancedMetrics) {
            const adv = context.advancedMetrics;
            prompt += `**Advanced Risk-Adjusted Metrics:**\n`;
            prompt += `- **Sharpe Ratio:** ${adv.sharpeRatio} (return per unit of risk)\n`;
            prompt += `- **Sortino Ratio:** ${adv.sortinoRatio} (downside risk-adjusted)\n`;
            prompt += `- **Calmar Ratio:** ${adv.calmarRatio} (return vs max drawdown)\n`;
            prompt += `- **Alpha:** ${adv.alpha}% (excess return vs market)\n`;
            prompt += `- **Beta:** ${adv.beta} (market sensitivity)\n\n`;
        }
        
        if (context.timeSeriesData && context.timeSeriesData.data) {
            const data = context.timeSeriesData.data;
            const recent = data.slice(-5);
            prompt += `**Recent Price Action (Last 5 Days):**\n`;
            recent.forEach((day, i) => {
                const date = new Date(day.datetime).toLocaleDateString();
                const change = i > 0 ? ((day.close - recent[i-1].close) / recent[i-1].close * 100).toFixed(2) : '0.00';
                prompt += `- ${date}: $${day.close} (${change > 0 ? '+' : ''}${change}%)\n`;
            });
            prompt += `\n`;
        }
        
        prompt += `**👤 USER QUESTION:** "${userMessage}"\n\n`;
        
        prompt += `**🎯 YOUR TASK:**\n\n`;
        prompt += `Provide a **comprehensive historical analysis** with this structure:\n\n`;
        prompt += `1. **Total Return Summary**:\n`;
        prompt += `   - Exact total and annualized returns from the data\n`;
        prompt += `   - How it compares to market averages\n\n`;
        prompt += `2. **Volatility & Risk Analysis**:\n`;
        prompt += `   - Volatility level interpretation\n`;
        prompt += `   - Max drawdown context (how bad was the worst decline?)\n`;
        prompt += `   - Risk-adjusted metrics (Sharpe, Sortino)\n\n`;
        prompt += `3. **Major Milestones**:\n`;
        prompt += `   - Price range journey (low to high)\n`;
        prompt += `   - Notable trends or reversals\n\n`;
        prompt += `4. **Investment Perspective**:\n`;
        prompt += `   - What this history tells us about the stock\n`;
        prompt += `   - Risk/reward profile based on historical data\n\n`;
        prompt += `**Length:** 3-4 paragraphs | **Tone:** Historical review (data-heavy)\n`;
        prompt += `**Use exact numbers** from the metrics above.\n\n`;
        prompt += `**🤖 YOUR RESPONSE:**\n`;
        
        return prompt;
    }

    // ✅ PROMPT SPÉCIALISÉ: IPO Analysis
    buildIPOPrompt(userMessage, context) {
        let prompt = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        prompt += `**💰 IPO ANALYSIS REQUEST**\n`;
        prompt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        
        if (context.upcomingIPOs && context.upcomingIPOs.length > 0) {
            prompt += `**Upcoming IPOs (Next 30 Days):**\n\n`;
            context.upcomingIPOs.slice(0, 10).forEach((ipo, i) => {
                prompt += `${i + 1}. **${ipo.name || ipo.symbol}** (${ipo.symbol})\n`;
                prompt += `   - Date: ${ipo.date}\n`;
                prompt += `   - Price Range: ${ipo.price || 'TBD'}\n`;
                prompt += `   - Shares: ${ipo.numberOfShares ? this.formatNumber(ipo.numberOfShares) : 'N/A'}\n`;
                prompt += `   - Exchange: ${ipo.exchange || 'N/A'}\n\n`;
            });
        } else {
            prompt += `**No upcoming IPO data available in context.**\n\n`;
        }
        
        if (context.ipoAnalysis) {
            prompt += `**Recent IPO Performance Analysis:**\n\n`;
            if (context.ipoAnalysis.topPerformers) {
                prompt += `**Top Performers:**\n`;
                context.ipoAnalysis.topPerformers.slice(0, 5).forEach((ipo, i) => {
                    prompt += `${i + 1}. ${ipo.symbol}: ${ipo.return > 0 ? '+' : ''}${ipo.return}% | Score: ${ipo.score}/100\n`;
                });
                prompt += `\n`;
            }
        }
        
        prompt += `**👤 USER QUESTION:** "${userMessage}"\n\n`;
        
        prompt += `**🎯 YOUR TASK:**\n\n`;
        prompt += `Provide an **IPO market analysis** with this structure:\n\n`;
        prompt += `1. **IPO Landscape** (1-2 sentences):\n`;
        prompt += `   - Current IPO market conditions\n`;
        prompt += `   - Recent trends (hot/cold market)\n\n`;
        prompt += `2. **Upcoming Highlights** (if data available):\n`;
        prompt += `   - Most notable upcoming IPOs\n`;
        prompt += `   - Key dates and price ranges\n\n`;
        prompt += `3. **Quality Assessment**:\n`;
        prompt += `   - What makes a good IPO investment?\n`;
        prompt += `   - Red flags to watch for\n\n`;
        prompt += `4. **Investment Considerations**:\n`;
        prompt += `   - Lock-up period risks\n`;
        prompt += `   - Valuation concerns\n`;
        prompt += `   - Historical IPO performance patterns\n\n`;
        prompt += `**Length:** 3-4 paragraphs | **Tone:** IPO specialist (cautious, educational)\n`;
        prompt += `If specific IPO data is missing, provide general IPO investment guidance.\n\n`;
        prompt += `**🤖 YOUR RESPONSE:**\n`;
        
        return prompt;
    }

    // ✅ PROMPT SPÉCIALISÉ: Educational Questions
    buildEducationalPrompt(userMessage, context) {
        let prompt = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        prompt += `**📚 EDUCATIONAL FINANCE QUESTION**\n`;
        prompt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        
        // Détecter le concept demandé
        const concept = this.extractFinancialConcept(userMessage);
        if (concept) {
            prompt += `**Detected Concept:** ${concept}\n\n`;
        }
        
        prompt += `**👤 USER QUESTION:** "${userMessage}"\n\n`;
        
        prompt += `**🎯 YOUR TASK:**\n\n`;
        prompt += `Provide a **clear educational explanation** with this structure:\n\n`;
        prompt += `1. **Simple Definition** (1-2 sentences):\n`;
        prompt += `   - What is it in plain English?\n`;
        prompt += `   - Why does it matter to investors?\n\n`;
        prompt += `2. **How to Calculate/Use It**:\n`;
        prompt += `   - Formula (if applicable)\n`;
        prompt += `   - Step-by-step example with numbers\n\n`;
        prompt += `3. **Interpretation Guide**:\n`;
        prompt += `   - What values are "good" vs "bad"?\n`;
        prompt += `   - Industry context (tech vs banks, etc.)\n\n`;
        prompt += `4. **Practical Application**:\n`;
        prompt += `   - How investors use this metric\n`;
        prompt += `   - Common mistakes to avoid\n\n`;
        prompt += `5. **Limitations** (1 sentence):\n`;
        prompt += `   - When this metric can be misleading\n\n`;
        prompt += `**Length:** 2-3 short paragraphs | **Tone:** Teacher (clear, example-rich)\n`;
        prompt += `**Avoid jargon** unless you explain it. Use concrete examples.\n\n`;
        prompt += `**🤖 YOUR RESPONSE:**\n`;
        
        return prompt;
    }

    // ✅ Extraction de concept financier pour questions éducatives
    extractFinancialConcept(message) {
        const lower = message.toLowerCase();
        
        const concepts = {
            'p/e ratio': /\bp\/e\b|price.?to.?earnings|pe ratio/i,
            'EPS': /\beps\b|earnings per share/i,
            'dividend yield': /dividend yield|dividend/i,
            'market cap': /market cap|market capitalization/i,
            'beta': /\bbeta\b/i,
            'ROE': /\broe\b|return on equity/i,
            'profit margin': /profit margin|net margin/i,
            'debt-to-equity': /debt.?to.?equity|leverage/i,
            'free cash flow': /free cash flow|fcf/i,
            'EBITDA': /ebitda/i,
            'PEG ratio': /peg ratio/i,
            'short selling': /short sell|shorting/i,
            'options': /option trading|call|put option/i,
            'RSI': /\brsi\b|relative strength/i,
            'moving average': /moving average|sma|ema/i,
            'support/resistance': /support|resistance/i,
            'bull market': /bull market|bullish/i,
            'bear market': /bear market|bearish/i,
            'IPO': /\bipo\b|initial public offering/i,
            'stock split': /stock split/i
        };
        
        for (const [concept, pattern] of Object.entries(concepts)) {
            if (pattern.test(lower)) {
                return concept;
            }
        }
        
        return null;
    }

    // ✅ PROMPT SPÉCIALISÉ: Comparison (sera dans Partie 3)
    buildComparisonPrompt(userMessage, context) {
        // Sera fourni dans la partie 3
        return this.buildGeneralPrompt(userMessage, context);
    }

    buildHistoricalPrompt(userMessage, context) {
        // Sera fourni dans la partie 3
        return this.buildGeneralPrompt(userMessage, context);
    }

    buildIPOPrompt(userMessage, context) {
        // Sera fourni dans la partie 3
        return this.buildGeneralPrompt(userMessage, context);
    }

    buildEducationalPrompt(userMessage, context) {
        // Sera fourni dans la partie 3
        return this.buildGeneralPrompt(userMessage, context);
    }

    buildGeneralPrompt(userMessage, context) {
        let prompt = `**👤 USER QUESTION:** "${userMessage}"\n\n`;
        prompt += `**🤖 YOUR RESPONSE:** (Provide a clear, professional answer)\n`;
        return prompt;
    }

    // ===== MÉTHODES UTILITAIRES (identiques) =====
    
    formatNumber(num) {
        if (!num) return 'N/A';
        if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B';
        if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
        return num.toLocaleString();
    }

    async makeGeminiRequest(prompt) {
        const requestBody = {
            model: this.model,
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

        console.log(`📡 Calling Gemini via Worker: ${this.workerUrl}`);

        const response = await fetch(this.workerUrl, {
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

    updateConversationHistory(userMessage, assistantResponse, context) {
        const entry = {
            user: userMessage,
            assistant: assistantResponse.text,
            timestamp: Date.now(),
            symbols: context.detectedEntities?.symbols || [],
            intent: context.intent?.type || 'GENERAL'
        };
        
        this.conversationHistory.push(entry);

        if (this.conversationHistory.length > this.maxHistorySize) {
            this.conversationHistory.shift();
        }
        
        if (entry.symbols.length > 0) {
            entry.symbols.forEach(symbol => {
                if (!this.userContext.preferredStocks.includes(symbol)) {
                    this.userContext.preferredStocks.push(symbol);
                }
            });
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
        let errorMessage = '⚠ **I encountered an error.**\n\n';
        
        if (error.message.includes('Worker URL not configured')) {
            errorMessage += '❌ **Configuration Error**: Gemini Worker URL is missing.\n\n';
            errorMessage += '**Please check chatbot-config.js:**\n';
            errorMessage += '- Verify `api.gemini.workerUrl` is set\n';
        } else if (error.message.includes('404')) {
            errorMessage += '❌ **Worker Error 404**: The Gemini Worker was not found.\n\n';
        } else if (error.message.includes('403')) {
            errorMessage += '❌ **Worker Error 403**: Access denied. Check GEMINI_API_KEY.\n\n';
        } else {
            errorMessage += `**Error:** ${error.message}\n\n`;
        }
        
        return {
            text: errorMessage,
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

window.GeminiAI = GeminiAI;