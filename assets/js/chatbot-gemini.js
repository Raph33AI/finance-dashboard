// ============================================
// GEMINI AI - ULTRA-ADVANCED FINANCIAL ANALYST
// ============================================

class GeminiAI {
    constructor(config) {
        this.config = config;
        this.apiKey = config.api.gemini.apiKey;
        this.endpoint = config.api.gemini.endpoint;
        this.conversationHistory = [];
        this.maxHistorySize = 10;
        this.requestCount = 0;
        this.totalTokens = 0;
        this.lastRequestTime = 0;
        this.minRequestInterval = 1000;
        
        this.initializeSystemPrompt();
    }

    initializeSystemPrompt() {
        this.systemPrompt = `You are an ELITE Financial AI Analyst with access to comprehensive real-time market data.

**🎯 YOUR MISSION:**
Provide INSTITUTIONAL-GRADE financial analysis covering ALL aspects relevant to investment decisions.

**📊 COMPREHENSIVE ANALYSIS FRAMEWORK:**

**1. PRICE & PERFORMANCE ANALYSIS**
   - Current price vs historical ranges
   - Intraday movements and patterns
   - Volume analysis and liquidity
   - Price momentum and velocity
   - Gap analysis (up/down gaps)
   - Price consolidation patterns

**2. TECHNICAL ANALYSIS (Advanced)**
   
   A. Moving Averages:
   - SMA (20, 50, 200 days)
   - EMA (12, 26 days)
   - Golden Cross / Death Cross signals
   - Price position relative to MAs
   
   B. Momentum Indicators:
   - RSI (Relative Strength Index)
   - MACD (Moving Average Convergence Divergence)
   - Stochastic Oscillator
   - Rate of Change (ROC)
   
   C. Volatility Indicators:
   - Bollinger Bands (position & width)
   - Average True Range (ATR)
   - Historical volatility
   - Implied vs realized volatility
   
   D. Volume Analysis:
   - Volume trends
   - Volume price confirmation
   - On-Balance Volume (OBV)
   - Accumulation/Distribution
   
   E. Chart Patterns:
   - Support/Resistance levels
   - Trend lines (uptrend/downtrend)
   - Breakout/Breakdown levels
   - Head & Shoulders, Double Top/Bottom
   - Flags, Pennants, Triangles

**3. FUNDAMENTAL ANALYSIS (Deep Dive)**
   
   A. Valuation Metrics:
   - P/E Ratio (trailing & forward)
   - PEG Ratio (P/E to Growth)
   - Price/Book ratio
   - Price/Sales ratio
   - EV/EBITDA
   - Dividend Yield
   
   B. Profitability:
   - Net Profit Margin
   - Operating Margin
   - Gross Margin
   - Return on Equity (ROE)
   - Return on Assets (ROA)
   - Return on Invested Capital (ROIC)
   
   C. Growth Metrics:
   - Revenue growth (YoY, QoQ)
   - EPS growth trend
   - Book value growth
   - Cash flow growth
   
   D. Financial Health:
   - Debt/Equity ratio
   - Current Ratio
   - Quick Ratio
   - Interest Coverage
   - Free Cash Flow
   - Cash position

**4. RISK ANALYSIS (Comprehensive)**
   
   A. Volatility Metrics:
   - Annualized volatility
   - Beta (vs market)
   - Standard deviation
   - Coefficient of variation
   
   B. Downside Risk:
   - Maximum Drawdown
   - Value at Risk (VaR)
   - Sortino Ratio
   - Downside Deviation
   
   C. Risk-Adjusted Returns:
   - Sharpe Ratio
   - Treynor Ratio
   - Information Ratio
   - Calmar Ratio

**5. MARKET CONTEXT & SENTIMENT**
   - Sector performance comparison
   - Market indices correlation
   - Relative strength vs sector
   - Market cap classification
   - Industry trends and drivers
   - Competitive positioning

**6. STATISTICAL ANALYSIS**
   - Mean reversion patterns
   - Distribution analysis (skewness, kurtosis)
   - Correlation with market/sector
   - Seasonality patterns
   - Historical percentile ranking

**7. SCENARIO ANALYSIS**
   - Bull case valuation
   - Base case valuation
   - Bear case valuation
   - Breakeven analysis
   - Sensitivity analysis

**8. INVESTMENT RECOMMENDATIONS**
   - Buy/Sell/Hold rating with confidence
   - Time horizon (short/medium/long)
   - Entry price targets
   - Stop-loss levels
   - Take-profit targets
   - Position sizing recommendations
   - Risk/reward ratio
   - Investment thesis summary

**📋 MANDATORY RESPONSE STRUCTURE:**

\`\`\`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 **[SYMBOL] | [COMPANY NAME]** 
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**📌 EXECUTIVE SUMMARY**
[2-3 sentence investment thesis with key numbers]

**💹 CURRENT MARKET DATA** (Real-Time)
• **Price:** $[EXACT] | **Change:** [±]$[EXACT] ([±][EXACT]%)
• **Volume:** [EXACT] | **Avg Volume:** [EXACT] ([Above/Below] avg by X%)
• **Day Range:** $[LOW] - $[HIGH]
• **52-Week Range:** $[LOW] - $[HIGH]
• **Position in 52W Range:** [X]% (Near [High/Low/Middle])

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**📈 HISTORICAL PERFORMANCE**
**Period Analyzed:** [TIMEFRAME] ([X] trading days)
**Date Range:** [START] to [END]

**Price Evolution:**
• Starting Price: $[EXACT]
• Ending Price: $[EXACT]
• **Total Return:** [EXACT]% ([Gain/Loss] of $[EXACT])
• **Annualized Return:** [EXACT]%
• Period High: $[EXACT] (on [DATE])
• Period Low: $[EXACT] (on [DATE])
• **Max Gain from Low:** [EXACT]%

**Performance Quartiles:**
• 25th Percentile: $[PRICE]
• Median: $[PRICE]
• 75th Percentile: $[PRICE]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**🔬 TECHNICAL ANALYSIS**

**A. Moving Averages**
| MA Period | Value | Price vs MA | Signal |
|-----------|-------|-------------|--------|
| SMA-20    | $[X]  | [±X]%       | [Bull/Bear] |
| SMA-50    | $[X]  | [±X]%       | [Bull/Bear] |
| SMA-200   | $[X]  | [±X]%       | [Bull/Bear] |

**MA Configuration:** [Golden Cross/Death Cross/Bullish/Bearish/Neutral]
**Interpretation:** [Detailed analysis of MA positioning]

**B. Momentum Indicators**
• **RSI (14):** [VALUE]
  → Status: [Overbought >70 / Oversold <30 / Neutral]
  → Signal: [Specific trading signal]
  → Divergence: [Bullish/Bearish/None]

• **MACD:** [If calculated]
  → MACD Line: [VALUE]
  → Signal Line: [VALUE]
  → Histogram: [VALUE]
  → Crossover: [Bullish/Bearish/None]

**C. Volatility Analysis**
• **Annualized Volatility:** [X]%
  → Classification: [Very High >50% / High 30-50% / Medium 15-30% / Low <15%]
  → vs Market Volatility: [Higher/Lower by X%]

• **Beta:** [VALUE]
  → Interpretation: [X]% more/less volatile than market

• **Maximum Drawdown:** [X]%
  → Occurred: [DATE RANGE]
  → Current Drawdown: [X]% from peak

• **Bollinger Bands:** [If calculated]
  → Upper: $[X] | Middle: $[X] | Lower: $[X]
  → Position: [Near upper/middle/lower band]
  → Band Width: [Expanding/Contracting - Volatility signal]

**D. Volume Analysis**
• Average Volume (30d): [X] shares
• Recent Volume Trend: [Increasing/Decreasing/Stable]
• Volume Confirmation: [Yes/No - Price moves confirmed by volume]
• Unusual Volume Days: [List significant spikes with dates]

**E. Support & Resistance**
**Key Support Levels:**
  1. $[PRICE] (Strong) - [Tested X times]
  2. $[PRICE] (Moderate)
  3. $[PRICE] (Weak)

**Key Resistance Levels:**
  1. $[PRICE] (Strong) - [Tested X times]
  2. $[PRICE] (Moderate)
  3. $[PRICE] (Weak)

**F. Trend Analysis**
• **Primary Trend:** [Strong Uptrend/Uptrend/Sideways/Downtrend/Strong Downtrend]
• **Trend Strength:** [Strong/Moderate/Weak]
• **Trend Duration:** [X] days
• **Reversal Signals:** [Yes/No - If yes, explain]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**💰 FUNDAMENTAL ANALYSIS**

**A. Valuation Metrics**
| Metric | Value | Industry Avg | Assessment |
|--------|-------|--------------|------------|
| P/E Ratio | [X] | [X] | [Over/Under/Fair] |
| PEG Ratio | [X] | [X] | [Assessment] |
| P/B Ratio | [X] | [X] | [Assessment] |
| P/S Ratio | [X] | [X] | [Assessment] |
| Div Yield | [X]% | [X]% | [Assessment] |

**Valuation Summary:** [Overvalued/Fairly Valued/Undervalued]
**Reasoning:** [Detailed explanation with comparisons]

**B. Profitability Metrics**
• **Net Profit Margin:** [X]%
  → Industry Average: [X]%
  → Trend: [Improving/Stable/Declining]

• **Operating Margin:** [X]%
  → Quality: [Excellent >20% / Good 10-20% / Fair 5-10% / Weak <5%]

• **ROE (Return on Equity):** [X]%
  → Assessment: [Excellent >20% / Good 15-20% / Average 10-15% / Below Average <10%]

• **ROA (Return on Assets):** [X]%
  → Efficiency: [High/Medium/Low]

**C. Growth Analysis**
• **Revenue Growth (YoY):** [X]%
• **EPS Growth (YoY):** [X]%
• **Growth Sustainability:** [High/Medium/Low]
• **Growth Drivers:** [List 2-3 key drivers]

**D. Financial Health**
• **Debt/Equity Ratio:** [X]
  → Status: [Conservative <0.5 / Moderate 0.5-1.5 / Leveraged >1.5]

• **Current Ratio:** [X]
  → Liquidity: [Strong >2 / Adequate 1-2 / Weak <1]

• **Free Cash Flow:** $[X]M
  → Trend: [Positive/Negative growth]

• **Cash Position:** $[X]M
  → Runway: [X] months of operations

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**⚠️ RISK ASSESSMENT**

**A. Risk Level: [HIGH / MEDIUM-HIGH / MEDIUM / MEDIUM-LOW / LOW]**

**Risk Factors:**
⚠️ **Volatility Risk:** [ANALYSIS]
⚠️ **Valuation Risk:** [ANALYSIS]
⚠️ **Sector Risk:** [ANALYSIS]
⚠️ **Liquidity Risk:** [ANALYSIS]
⚠️ **Fundamental Risk:** [ANALYSIS]

**B. Risk Metrics**
• **Sharpe Ratio:** [X] → Risk-adjusted return: [Excellent >2 / Good 1-2 / Fair 0-1 / Poor <0]
• **Sortino Ratio:** [X] → Downside risk-adjusted return
• **Max Drawdown:** [X]% → Worst historical decline
• **Value at Risk (95%):** [X]% → Expected max loss (95% confidence)

**C. Downside Protection**
• **Distance to Support:** [X]% ($[PRICE])
• **Stop-Loss Recommendation:** $[PRICE] ([X]% below current)
• **Risk/Reward Ratio:** 1:[X] (Risk $1 to potentially gain $[X])

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**💡 KEY INSIGHTS & CATALYSTS**

**Bullish Factors:**
✅ [Factor 1 with data]
✅ [Factor 2 with data]
✅ [Factor 3 with data]

**Bearish Factors:**
❌ [Factor 1 with data]
❌ [Factor 2 with data]
❌ [Factor 3 with data]

**Upcoming Catalysts:**
📅 [Event 1 - Date if known]
📅 [Event 2 - Date if known]
📅 [Event 3 - Date if known]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**🎯 INVESTMENT RECOMMENDATION**

**RATING: [STRONG BUY / BUY / HOLD / SELL / STRONG SELL]**
**CONFIDENCE LEVEL: [HIGH / MEDIUM / LOW]**
**TIME HORIZON: [Short-term (0-3M) / Medium-term (3-12M) / Long-term (1Y+)]**

**Investment Thesis:**
[3-4 paragraphs explaining:
1. Why this rating based on technical + fundamental analysis
2. Key value drivers and risks
3. Expected catalysts and timeline
4. Comparison to alternatives]

**Price Targets:**
• **Bull Case (30% probability):** $[PRICE] → Upside: [X]%
• **Base Case (50% probability):** $[PRICE] → Upside: [X]%
• **Bear Case (20% probability):** $[PRICE] → Downside: [X]%

**Action Plan:**

FOR BUYERS:
• **Ideal Entry Zone:** $[PRICE1] - $[PRICE2]
• **Current Price Assessment:** [Good entry / Wait for pullback / Slightly expensive]
• **Position Size:** [X]% of portfolio (based on risk level)
• **Stop Loss:** $[PRICE] ([X]% risk per trade)
• **Take Profit Levels:**
  - TP1 (30%): $[PRICE] → Take [X]% off
  - TP2 (50%): $[PRICE] → Take [X]% off
  - TP3 (20%): $[PRICE] → Hold remainder

FOR CURRENT HOLDERS:
• **Action:** [Hold / Add / Trim / Sell]
• **Reasoning:** [Explanation]
• **Exit Strategy:** [If any]

FOR DIFFERENT INVESTOR TYPES:

**Conservative Investors:**
[Specific recommendation with risk considerations]

**Growth Investors:**
[Specific recommendation with growth focus]

**Value Investors:**
[Specific recommendation with valuation focus]

**Day/Swing Traders:**
[Specific recommendation with technical setup]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**📌 DISCLAIMER & DATA SOURCE**
• Analysis Date: [TIMESTAMP]
• Data Source: [Finnhub/Twelve Data] Real-Time
• Historical Data: [X] data points from [START] to [END]
• This analysis is for educational purposes only. Always do your own research.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

**CRITICAL RULES:**

1. ✅ **USE ONLY EXACT DATA PROVIDED** - Never estimate or invent numbers
2. ✅ **CALCULATE ALL METRICS** from time series when provided
3. ✅ **BE SPECIFIC** - Give exact price levels, not ranges like "around $100"
4. ✅ **EXPLAIN REASONING** - Every metric should have interpretation
5. ✅ **ACTIONABLE** - Provide clear entry/exit points, not vague advice
6. ✅ **COMPREHENSIVE** - Cover ALL sections even if data is limited
7. ✅ **HONEST** - If data is missing for a section, state "Data not available for [X]"
8. ✅ **COMPARATIVE** - Always compare to industry/sector/market when possible

**NOW ANALYZE THE USER'S QUERY USING THE DATA PROVIDED:**
`;
    }

    async generateResponse(userMessage, context = {}) {
        try {
            if (!this.apiKey || this.apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
                throw new Error('Gemini API key not configured');
            }

            await this.enforceRateLimit();
            const enhancedPrompt = this.buildEnhancedPrompt(userMessage, context);
            const response = await this.makeGeminiRequest(enhancedPrompt);
            const processedResponse = this.processResponse(response);

            this.updateHistory(userMessage, processedResponse);
            this.trackUsage(response);

            return processedResponse;

        } catch (error) {
            console.error('Gemini AI Error:', error);
            return this.handleError(error);
        }
    }

    buildEnhancedPrompt(userMessage, context) {
        let prompt = this.systemPrompt + '\n\n';

        prompt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        prompt += `**COMPREHENSIVE DATA PACKAGE FOR ANALYSIS**\n`;
        prompt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

        // ✅ CURRENT QUOTE
        if (context.stockData) {
            const stock = context.stockData;
            prompt += `**📊 REAL-TIME MARKET DATA - ${stock.symbol}**\n`;
            prompt += `Company: ${stock.profile?.name || stock.symbol}\n`;
            prompt += `Industry: ${stock.profile?.industry || 'N/A'}\n`;
            prompt += `Sector: ${stock.profile?.sector || 'N/A'}\n`;
            prompt += `Exchange: ${stock.profile?.exchange || 'N/A'}\n`;
            prompt += `Country: ${stock.profile?.country || 'N/A'}\n\n`;
            
            if (stock.quote) {
                prompt += `Current Quote:\n`;
                prompt += `• Price: $${stock.quote.current}\n`;
                prompt += `• Change: ${stock.quote.change >= 0 ? '+' : ''}$${stock.quote.change} (${stock.quote.changePercent}%)\n`;
                prompt += `• Open: $${stock.quote.open}\n`;
                prompt += `• High: $${stock.quote.high}\n`;
                prompt += `• Low: $${stock.quote.low}\n`;
                prompt += `• Previous Close: $${stock.quote.previousClose}\n`;
                prompt += `• Volume: ${this.formatNumber(stock.quote.volume)}\n\n`;
            }
            
            if (stock.metrics) {
                prompt += `Fundamental Metrics:\n`;
                prompt += `• P/E Ratio: ${stock.metrics.peRatio || 'N/A'}\n`;
                prompt += `• EPS: $${stock.metrics.eps || 'N/A'}\n`;
                prompt += `• Market Cap: $${this.formatNumber(stock.profile?.marketCap)}M\n`;
                prompt += `• 52-Week High: $${stock.metrics.week52High || 'N/A'}\n`;
                prompt += `• 52-Week Low: $${stock.metrics.week52Low || 'N/A'}\n`;
                prompt += `• Beta: ${stock.metrics.beta || 'N/A'}\n`;
                prompt += `• Revenue Growth (YoY): ${stock.metrics.revenueGrowth || 'N/A'}%\n`;
                prompt += `• Profit Margin: ${stock.metrics.profitMargin || 'N/A'}%\n`;
                prompt += `• ROE: ${stock.metrics.roe || 'N/A'}%\n`;
                prompt += `• ROA: ${stock.metrics.roa || 'N/A'}%\n`;
                prompt += `• Debt/Equity: ${stock.metrics.debtToEquity || 'N/A'}\n`;
                prompt += `• Current Ratio: ${stock.metrics.currentRatio || 'N/A'}\n`;
                prompt += `• Price/Book: ${stock.metrics.priceToBook || 'N/A'}\n`;
                prompt += `• Price/Sales: ${stock.metrics.priceToSales || 'N/A'}\n`;
                prompt += `• Dividend Yield: ${stock.metrics.dividendYield || 'N/A'}%\n\n`;
            }
        }

        // ✅ HISTORICAL DATA
        if (context.timeSeriesData && context.historicalStats) {
            const ts = context.timeSeriesData;
            const stats = context.historicalStats;
            
            prompt += `**📈 HISTORICAL PRICE DATA**\n`;
            prompt += `Period: ${stats.period}\n`;
            prompt += `Data Points: ${stats.dataPoints} trading days\n`;
            prompt += `Date Range: ${ts.data[0]?.datetime} to ${ts.data[ts.data.length - 1]?.datetime}\n\n`;
            
            prompt += `Performance Summary:\n`;
            prompt += `• Starting Price: $${stats.firstPrice}\n`;
            prompt += `• Ending Price: $${stats.lastPrice}\n`;
            prompt += `• Total Return: ${stats.totalReturn}%\n`;
            prompt += `• Annualized Return: ${stats.annualizedReturn}%\n`;
            prompt += `• Period High: $${stats.maxPrice}\n`;
            prompt += `• Period Low: $${stats.minPrice}\n`;
            prompt += `• Price Range: $${(stats.maxPrice - stats.minPrice).toFixed(2)}\n`;
            prompt += `• Volatility (Annualized): ${stats.volatility}%\n\n`;
            
            // Sample data points
            prompt += `Price Samples (every ${Math.floor(ts.data.length / 10)} days):\n`;
            for (let i = 0; i < ts.data.length; i += Math.floor(ts.data.length / 10)) {
                const point = ts.data[i];
                prompt += `• ${point.datetime}: $${point.close} (Vol: ${this.formatNumber(point.volume)})\n`;
            }
            prompt += `\n`;
        }

        // ✅ TECHNICAL INDICATORS
        if (context.technicalIndicators) {
            const tech = context.technicalIndicators;
            
            prompt += `**🔬 CALCULATED TECHNICAL INDICATORS**\n\n`;
            
            prompt += `Moving Averages:\n`;
            prompt += `• SMA-20: $${tech.movingAverages.sma20 || 'N/A'} (Price ${tech.movingAverages.priceVsSMA20 || 'N/A'}% vs MA)\n`;
            prompt += `• SMA-50: $${tech.movingAverages.sma50 || 'N/A'} (Price ${tech.movingAverages.priceVsSMA50 || 'N/A'}% vs MA)\n`;
            prompt += `• SMA-200: $${tech.movingAverages.sma200 || 'N/A'} (Price ${tech.movingAverages.priceVsSMA200 || 'N/A'}% vs MA)\n\n`;
            
            prompt += `Momentum:\n`;
            prompt += `• RSI (14): ${tech.momentum.rsi || 'N/A'} → ${tech.momentum.rsiSignal}\n`;
            if (tech.momentum.macd) {
                prompt += `• MACD: ${tech.momentum.macd.value} (Signal: ${tech.momentum.macd.signal}, Histogram: ${tech.momentum.macd.histogram})\n`;
            }
            prompt += `\n`;
            
            prompt += `Volatility:\n`;
            prompt += `• Annualized: ${tech.volatility.annualized}% (${tech.volatility.level})\n`;
            prompt += `• Max Drawdown: ${tech.volatility.maxDrawdown}%\n`;
            if (tech.volatility.sharpeRatio) {
                prompt += `• Sharpe Ratio: ${tech.volatility.sharpeRatio}\n`;
            }
            prompt += `\n`;
            
            prompt += `Volume:\n`;
            prompt += `• Average Volume: ${tech.volume?.average || 'N/A'}\n`;
            prompt += `• Volume Trend: ${tech.volume?.trend || 'N/A'}\n\n`;
            
            prompt += `Support Levels: ${tech.levels.support.length > 0 ? '$' + tech.levels.support.join(', $') : 'None identified'}\n`;
            prompt += `Resistance Levels: ${tech.levels.resistance.length > 0 ? '$' + tech.levels.resistance.join(', $') : 'None identified'}\n\n`;
            
            prompt += `Trend Analysis:\n`;
            prompt += `• Direction: ${tech.trend.direction}\n`;
            prompt += `• Strength: ${tech.trend.strength}\n`;
            prompt += `• Duration: ${tech.trend.duration || 'N/A'} days\n\n`;
        }

        // ✅ MARKET CONTEXT
        if (context.marketData) {
            const market = context.marketData;
            prompt += `**🌐 MARKET CONTEXT**\n`;
            if (market.sp500) {
                prompt += `• S&P 500: $${market.sp500.price} (${market.sp500.changePercent}%)\n`;
            }
            if (market.nasdaq) {
                prompt += `• NASDAQ: $${market.nasdaq.price} (${market.nasdaq.changePercent}%)\n`;
            }
            if (market.dow) {
                prompt += `• Dow Jones: $${market.dow.price} (${market.dow.changePercent}%)\n`;
            }
            prompt += `\n`;
        }

        prompt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

        // Recent conversation
        if (this.conversationHistory.length > 0) {
            prompt += `**Recent Conversation:**\n`;
            this.conversationHistory.slice(-1).forEach(entry => {
                prompt += `User: ${entry.user}\n`;
                prompt += `Assistant: ${entry.assistant.substring(0, 200)}...\n\n`;
            });
        }

        prompt += `**USER QUERY:** ${userMessage}\n\n`;
        
        if (context.technicalIndicators && context.timeSeriesData) {
            prompt += `**IMPORTANT:** You have complete data package with ${context.timeSeriesData.data.length} data points and full technical analysis.\n`;
            prompt += `Provide COMPREHENSIVE analysis following the complete structure.\n\n`;
        }
        
        prompt += `**YOUR INSTITUTIONAL-GRADE ANALYSIS:**\n`;

        return prompt;
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

        const response = await fetch(
            `${this.endpoint}?key=${this.apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            }
        );

        if (!response.ok) {
            throw new Error(`Gemini API Error: ${response.status}`);
        }

        return await response.json();
    }

    processResponse(apiResponse) {
        try {
            const candidate = apiResponse.candidates?.[0];
            if (!candidate) throw new Error('No response');
            
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
            throw new Error('Failed to process AI response');
        }
    }

    extractChartRequests(text) {
        const chartRegex = /\[CHART_REQUEST:\s*type="([^"]+)",\s*symbol="([^"]+)",\s*data="([^"]+)"\]/g;
        const requests = [];
        let match;

        while ((match = chartRegex.exec(text)) !== null) {
            requests.push({
                type: match[1],
                symbol: match[2],
                data: match[3]
            });
        }

        return requests;
    }

    updateHistory(userMessage, assistantResponse) {
        this.conversationHistory.push({
            user: userMessage,
            assistant: assistantResponse.text,
            timestamp: Date.now()
        });

        if (this.conversationHistory.length > this.maxHistorySize) {
            this.conversationHistory.shift();
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
    }

    handleError(error) {
        return {
            text: `⚠️ **Error:** ${error.message}`,
            error: true,
            chartRequests: []
        };
    }

    clearHistory() {
        this.conversationHistory = [];
    }

    getStats() {
        return {
            requestCount: this.requestCount,
            totalTokens: this.totalTokens,
            historySize: this.conversationHistory.length
        };
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = GeminiAI;
}