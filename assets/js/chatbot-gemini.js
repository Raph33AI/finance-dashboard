// ============================================
// GEMINI AI - WITH REAL DATA INJECTION
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
        this.systemPrompt = `You are an ELITE AI Financial Assistant with access to REAL-TIME market data.

**🎯 CRITICAL INSTRUCTIONS:**

1. **USE ONLY THE REAL DATA PROVIDED IN THE CONTEXT**
2. **CITE THE EXACT NUMBERS FROM THE DATA**
3. **DO NOT INVENT OR ESTIMATE ANY FINANCIAL FIGURES**
4. **IF DATA IS PROVIDED, USE IT. IF NOT PROVIDED, SAY SO.**

**📊 RESPONSE FORMAT:**

When real-time data IS provided:
\`\`\`
📊 **Live Market Data Analysis**
**[Stock Symbol]** | **[Company Name]**

**Current Price:** $[EXACT PRICE FROM DATA]
**Change:** [EXACT CHANGE] ([EXACT %] %)
**52-Week Range:** $[LOW] - $[HIGH]

**Key Metrics:**
• P/E Ratio: [FROM DATA]
• Market Cap: [FROM DATA]
• Volume: [FROM DATA]

[Your analysis based on these REAL numbers]

💡 **Insights:**
[Analysis using the provided data]

⚠️ **Risks:**
[Risk assessment]

🎯 **Recommendation:**
[Investment perspective]

📌 **Data Source:** [Finnhub/Twelve Data] | Last Updated: [TIMESTAMP]
\`\`\`

When NO data is provided:
\`\`\`
⚠️ **Real-Time Data Not Available**

I don't have current market data for this query. For real-time information:
• Visit Yahoo Finance, Google Finance, or Bloomberg
• Check your broker's platform

I can provide:
✓ General analysis framework
✓ Educational content about the topic
✓ Historical context and trends

Would you like me to explain [relevant concept] or provide an analysis framework?
\`\`\`

**EXAMPLE - WITH REAL DATA:**

Context provided:
{
  symbol: "NVDA",
  quote: {
    current: 132.45,
    change: 3.25,
    changePercent: 2.51,
    high: 134.20,
    low: 130.15,
    volume: 45230000
  },
  profile: {
    name: "NVIDIA Corporation",
    marketCap: 3250000
  },
  metrics: {
    peRatio: 45.6,
    eps: 2.90,
    week52High: 150.23,
    week52Low: 95.30
  }
}

**Your Response:**
📊 **Live Market Data Analysis**
**NVDA** | **NVIDIA Corporation**

**Current Price:** $132.45
**Change:** +$3.25 (+2.51%) ↗️
**52-Week Range:** $95.30 - $150.23
**Volume:** 45.23M

**Key Metrics:**
• **P/E Ratio:** 45.6 (premium valuation for tech)
• **Market Cap:** $3.25 Trillion
• **EPS (TTM):** $2.90
• **Today's Range:** $130.15 - $134.20

📈 **Analysis:**
NVIDIA is trading at $132.45, showing strong momentum with a +2.51% gain today. The stock is trading 11.8% below its 52-week high of $150.23, suggesting potential upside if AI demand continues.

The P/E ratio of 45.6 is elevated but justified by NVIDIA's dominant position in AI chips. With 45.2M shares traded today (above average), there's strong investor interest.

💡 **Key Insights:**
✓ Stock recovering from recent pullback
✓ Strong volume indicates institutional buying
✓ 38% above 52-week low - solid support established
✓ Trading in upper half of daily range (bullish intraday)

⚠️ **Risks:**
⚠️ Premium valuation at 45.6x earnings
⚠️ 11.8% below recent high - resistance overhead
⚠️ Semiconductor sector volatility
⚠️ Concentration risk in AI market

🎯 **Recommendation:**
**HOLD/ACCUMULATE** - Current price of $132.45 offers reasonable entry for long-term investors. Watch for breakout above $135 (today's high $134.20) for momentum continuation. Strong fundamentals support current levels.

📌 **Data Source:** Finnhub Real-Time | Updated: [Current Time]

---

**NOW RESPOND TO THE USER'S QUERY USING THIS STRUCTURE.**`;
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
        prompt += `**REAL-TIME DATA CONTEXT**\n`;
        prompt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

        // ✅ INJECT STOCK DATA
        if (context.stockData) {
            const stock = context.stockData;
            prompt += `**📊 CURRENT STOCK DATA - ${stock.symbol}**\n`;
            prompt += `**YOU MUST USE THESE EXACT NUMBERS:**\n\n`;
            
            if (stock.quote) {
                prompt += `Current Quote:\n`;
                prompt += `• Current Price: $${stock.quote.current}\n`;
                prompt += `• Change: ${stock.quote.change >= 0 ? '+' : ''}$${stock.quote.change} (${stock.quote.changePercent}%)\n`;
                prompt += `• Open: $${stock.quote.open}\n`;
                prompt += `• High: $${stock.quote.high}\n`;
                prompt += `• Low: $${stock.quote.low}\n`;
                prompt += `• Volume: ${this.formatNumber(stock.quote.volume)}\n\n`;
            }
            
            if (stock.profile) {
                prompt += `Company: ${stock.profile.name}\n`;
                prompt += `Industry: ${stock.profile.industry || 'N/A'}\n`;
                prompt += `Market Cap: $${this.formatNumber(stock.profile.marketCap)}M\n\n`;
            }
            
            if (stock.metrics) {
                prompt += `Key Metrics:\n`;
                prompt += `• P/E: ${stock.metrics.peRatio || 'N/A'}\n`;
                prompt += `• 52-Week Range: $${stock.metrics.week52Low || 'N/A'} - $${stock.metrics.week52High || 'N/A'}\n\n`;
            }
        }

        // ✅ INJECT TIME SERIES DATA (CRUCIAL!)
        if (context.timeSeriesData && context.timeSeriesData.data && context.timeSeriesData.data.length > 0) {
            const ts = context.timeSeriesData;
            const stats = context.historicalStats;
            
            prompt += `**📈 HISTORICAL PRICE DATA - ${ts.symbol}**\n`;
            prompt += `**THIS IS THE DATA FOR THE CHART YOU MUST ANALYZE:**\n\n`;
            
            prompt += `Period: ${stats?.period || 'N/A'}\n`;
            prompt += `Total Data Points: ${ts.data.length}\n`;
            prompt += `Date Range: ${ts.data[0]?.datetime} to ${ts.data[ts.data.length - 1]?.datetime}\n\n`;
            
            prompt += `Price Evolution:\n`;
            prompt += `• Starting Price (${ts.data[0]?.datetime}): $${stats?.firstPrice || ts.data[0]?.close}\n`;
            prompt += `• Ending Price (${ts.data[ts.data.length - 1]?.datetime}): $${stats?.lastPrice || ts.data[ts.data.length - 1]?.close}\n`;
            prompt += `• Lowest Price: $${stats?.minPrice}\n`;
            prompt += `• Highest Price: $${stats?.maxPrice}\n`;
            prompt += `• Total Return: ${stats?.totalReturn}%\n\n`;
            
            // ✅ SAMPLE DATA POINTS (pour que l'IA voie la tendance)
            prompt += `Sample Price Points (every ${Math.floor(ts.data.length / 10)} days):\n`;
            for (let i = 0; i < ts.data.length; i += Math.floor(ts.data.length / 10)) {
                const point = ts.data[i];
                prompt += `• ${point.datetime}: $${point.close}\n`;
            }
            prompt += `\n`;
            
            prompt += `Data Source: ${ts.dataSource}\n`;
            prompt += `\n**IMPORTANT: A chart will be automatically generated with this data.**\n`;
            prompt += `**Your job is to ANALYZE this historical performance.**\n\n`;
        }

        // ✅ INJECT MARKET DATA
        if (context.marketData) {
            const market = context.marketData;
            prompt += `**🌐 MARKET OVERVIEW**\n\n`;
            
            if (market.sp500) {
                prompt += `S&P 500: $${market.sp500.price} (${market.sp500.changePercent}%)\n`;
            }
            if (market.nasdaq) {
                prompt += `NASDAQ: $${market.nasdaq.price} (${market.nasdaq.changePercent}%)\n`;
            }
            prompt += `\n`;
        }

        prompt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

        // User query
        prompt += `**USER QUERY:**\n${userMessage}\n\n`;
        
        // ✅ INSTRUCTION EXPLICITE
        if (context.timeSeriesData) {
            prompt += `**CRITICAL INSTRUCTION:**\n`;
            prompt += `You have ${context.timeSeriesData.data.length} data points of historical prices above.\n`;
            prompt += `Analyze this historical performance in detail. DO NOT say data is unavailable.\n`;
            prompt += `A chart is being generated automatically - focus on analyzing the trend.\n\n`;
        }
        
        prompt += `**YOUR RESPONSE:**\n`;

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
            const errorData = await response.json().catch(() => ({}));
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