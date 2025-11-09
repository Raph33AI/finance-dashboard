// ============================================
// GEMINI AI INTEGRATION - SUPERCHARGED
// Ultra-Premium AI with Enhanced Prompts
// ============================================

class GeminiAI {
    constructor(config) {
        this.config = config;
        this.apiKey = config.api.gemini.apiKey;
        this.endpoint = config.api.gemini.endpoint;
        this.conversationHistory = [];
        this.contextWindow = [];
        this.maxHistorySize = 10;
        
        // Performance tracking
        this.requestCount = 0;
        this.totalTokens = 0;
        
        // Rate limiting
        this.lastRequestTime = 0;
        this.minRequestInterval = 1000; // 1 second between requests
        
        this.initializeSystemPrompt();
    }

    // ============================================
    // SYSTEM PROMPT - ULTRA-OPTIMIZED
    // ============================================
    initializeSystemPrompt() {
        this.systemPrompt = `You are an ELITE AI Financial Assistant with deep expertise in:

**CORE COMPETENCIES:**
1. **IPO Analysis** - Comprehensive evaluation of Initial Public Offerings
2. **Market Analysis** - Real-time market trends and sector insights
3. **Technical Analysis** - Chart patterns, indicators (RSI, MACD, Bollinger Bands)
4. **Fundamental Analysis** - Financial statements, valuation metrics, ratios
5. **Quantitative Finance** - Risk models, portfolio optimization, derivatives
6. **M&A Advisory** - Mergers, acquisitions, corporate restructuring
7. **Economic Indicators** - GDP, inflation, employment, interest rates

**RESPONSE GUIDELINES:**
✅ **Professional & Precise** - Use financial terminology accurately
✅ **Data-Driven** - Back claims with metrics, ratios, and numbers
✅ **Actionable Insights** - Provide clear recommendations
✅ **Chart Integration** - Request charts when relevant (ALWAYS include [CHART_REQUEST] tag)
✅ **Structured Format** - Use bullet points, sections, and emphasis
✅ **Risk Awareness** - Always mention risks and limitations

**CHART REQUEST FORMAT:**
When analysis would benefit from visualization, include:
[CHART_REQUEST: type="{TYPE}", symbol="{SYMBOL}", data="{DATA}"]

Types: line, bar, candlestick, area, pie, radar
Example: [CHART_REQUEST: type="candlestick", symbol="AAPL", data="6m"]

**RESPONSE STRUCTURE:**
📊 **Summary** - Quick overview (2-3 sentences)
📈 **Analysis** - Detailed breakdown with metrics
💡 **Insights** - Key takeaways
⚠️ **Risks** - Potential concerns
🎯 **Recommendation** - Clear action items

**EXAMPLE RESPONSES:**

**User:** "Analyze AAPL stock"

**Assistant:**
📊 **Summary**
Apple Inc. (AAPL) is currently trading at $178.45, showing strong momentum with +2.3% gain today. Market cap: $2.8T, making it one of the largest tech companies globally.

📈 **Technical Analysis**
• **Price Action:** Breaking above 50-day SMA ($175.20)
• **RSI:** 62 (neutral to bullish territory)
• **MACD:** Bullish crossover detected
• **Support:** $172.50 | **Resistance:** $182.00
• **Volume:** Above average (+15% vs 30-day avg)

[CHART_REQUEST: type="candlestick", symbol="AAPL", data="3m"]

📈 **Fundamental Metrics**
• **P/E Ratio:** 29.5 (premium vs sector avg 24.3)
• **Revenue Growth:** +8.2% YoY
• **Profit Margin:** 26.3% (excellent)
• **ROE:** 147% (exceptional capital efficiency)
• **Debt/Equity:** 1.8 (manageable leverage)

💡 **Key Insights**
✓ Services segment driving growth (+16% YoY)
✓ iPhone sales stabilizing after seasonal dip
✓ Vision Pro launch creating new revenue stream
✓ Strong institutional ownership (61%)

⚠️ **Risks**
⚠️ Regulatory scrutiny in EU (App Store practices)
⚠️ China exposure (~19% of revenue)
⚠️ Premium valuation leaves little margin for error
⚠️ Slowing iPhone upgrade cycles

🎯 **Recommendation**
**HOLD/BUY** - Strong fundamentals justify premium valuation. Consider entry on dips toward $172 support. Long-term outlook positive driven by services growth and ecosystem expansion.

---

**User:** "Show me high-potential IPOs"

**Assistant:**
📊 **Top High-Potential IPOs (2024)**

**1. ARM Holdings (ARM) - Score: 87/100** 🌟
• **Sector:** Semiconductors
• **IPO Price:** $51 | **Current:** $68 (+33%)
• **Market Cap:** $70B
• **Strengths:** AI chip demand, 99% smartphone market share
• **Valuation:** 25x forward sales (reasonable for growth)
• **Risks:** China exposure, competitive threats

[CHART_REQUEST: type="line", symbol="ARM", data="ipo"]

**2. Instacart (CART) - Score: 76/100**
• **Sector:** E-commerce/Delivery
• **IPO Price:** $30 | **Current:** $35 (+17%)
• **Market Cap:** $9.3B
• **Strengths:** Market leader, profitable, ad revenue growth
• **Valuation:** 3.2x forward revenue (attractive)
• **Risks:** Competition from DoorDash, Uber

**3. Klaviyo (KVYO) - Score: 82/100** 🚀
• **Sector:** Marketing SaaS
• **IPO Price:** $30 | **Current:** $38 (+27%)
• **Market Cap:** $5.1B
• **Strengths:** 130K customers, 50% revenue growth, AI integration
• **Valuation:** 8.5x forward revenue (premium but justified)
• **Risks:** Market saturation, customer churn

💡 **Investment Strategy**
✓ Diversify across 2-3 IPOs to manage risk
✓ Wait for post-IPO lockup expiration volatility
✓ Focus on profitable or near-profitable companies
✓ Prioritize sectors with secular tailwinds (AI, cloud, fintech)

⚠️ **IPO-Specific Risks**
⚠️ Limited financial history
⚠️ Lockup expirations can trigger selling pressure
⚠️ IPO pricing may be inflated
⚠️ Market volatility impact amplified

**NOW, RESPOND TO USER QUERIES FOLLOWING THIS STRUCTURE.**`;
    }

    // ============================================
    // GENERATE RESPONSE
    // ============================================
    async generateResponse(userMessage, context = {}) {
        try {
            // Validate API key
            if (!this.apiKey || this.apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
                throw new Error('Gemini API key not configured. Please add your API key in chatbot-config.js');
            }

            // Rate limiting
            await this.enforceRateLimit();

            // Build enhanced prompt with context
            const enhancedPrompt = this.buildEnhancedPrompt(userMessage, context);

            // Make API request
            const response = await this.makeGeminiRequest(enhancedPrompt);

            // Process and enhance response
            const processedResponse = this.processResponse(response);

            // Update conversation history
            this.updateHistory(userMessage, processedResponse);

            // Track usage
            this.trackUsage(response);

            return processedResponse;

        } catch (error) {
            console.error('Gemini AI Error:', error);
            return this.handleError(error);
        }
    }

    // ============================================
    // BUILD ENHANCED PROMPT WITH CONTEXT
    // ============================================
    buildEnhancedPrompt(userMessage, context) {
        let prompt = this.systemPrompt + '\n\n';

        // Add market context if available
        if (context.marketData) {
            prompt += `**CURRENT MARKET CONTEXT:**\n`;
            prompt += `• S&P 500: ${context.marketData.sp500 || 'N/A'}\n`;
            prompt += `• NASDAQ: ${context.marketData.nasdaq || 'N/A'}\n`;
            prompt += `• Volatility (VIX): ${context.marketData.vix || 'N/A'}\n`;
            prompt += `• Market Sentiment: ${context.marketData.sentiment || 'Neutral'}\n\n`;
        }

        // Add IPO context if available
        if (context.ipoData) {
            prompt += `**RECENT IPO DATA:**\n`;
            context.ipoData.forEach(ipo => {
                prompt += `• ${ipo.symbol}: ${ipo.name} - Score: ${ipo.score}/100\n`;
            });
            prompt += '\n';
        }

        // Add conversation history (last 3 exchanges for context)
        if (this.conversationHistory.length > 0) {
            prompt += `**CONVERSATION HISTORY:**\n`;
            const recentHistory = this.conversationHistory.slice(-3);
            recentHistory.forEach(entry => {
                prompt += `User: ${entry.user}\n`;
                prompt += `Assistant: ${entry.assistant.substring(0, 200)}...\n\n`;
            });
        }

        // Add current user message
        prompt += `**CURRENT USER QUERY:**\n${userMessage}\n\n`;
        
        // Explicit instruction for charts
        prompt += `**INSTRUCTIONS:**\n`;
        prompt += `1. Analyze the query thoroughly\n`;
        prompt += `2. If visualization would help, include [CHART_REQUEST] tag\n`;
        prompt += `3. Provide comprehensive response following the structure\n`;
        prompt += `4. Be specific with numbers and metrics\n`;
        prompt += `5. Always include risk assessment\n\n`;
        
        prompt += `**YOUR RESPONSE:**`;

        return prompt;
    }

    // ============================================
    // MAKE GEMINI API REQUEST
    // ============================================
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
                maxOutputTokens: this.config.api.gemini.maxOutputTokens,
                stopSequences: []
            },
            safetySettings: this.config.api.gemini.safetySettings
        };

        const response = await fetch(
            `${this.endpoint}?key=${this.apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Gemini API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }

        return await response.json();
    }

    // ============================================
    // PROCESS RESPONSE
    // ============================================
    processResponse(apiResponse) {
        try {
            const candidate = apiResponse.candidates?.[0];
            
            if (!candidate) {
                throw new Error('No response candidate received');
            }

            // Check for safety blocks
            if (candidate.finishReason === 'SAFETY') {
                return {
                    text: "I apologize, but I cannot provide a response to that query due to safety guidelines. Please rephrase your question.",
                    blocked: true
                };
            }

            const text = candidate.content?.parts?.[0]?.text || '';
            
            if (!text) {
                throw new Error('Empty response received');
            }

            // Extract chart requests
            const chartRequests = this.extractChartRequests(text);

            // Clean text (remove chart request tags)
            const cleanText = text.replace(/\[CHART_REQUEST:.*?\]/g, '').trim();

            return {
                text: cleanText,
                chartRequests: chartRequests,
                tokens: apiResponse.usageMetadata || {},
                blocked: false
            };

        } catch (error) {
            console.error('Error processing response:', error);
            throw new Error('Failed to process AI response');
        }
    }

    // ============================================
    // EXTRACT CHART REQUESTS
    // ============================================
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

    // ============================================
    // UPDATE CONVERSATION HISTORY
    // ============================================
    updateHistory(userMessage, assistantResponse) {
        this.conversationHistory.push({
            user: userMessage,
            assistant: assistantResponse.text,
            timestamp: Date.now()
        });

        // Keep only last N exchanges
        if (this.conversationHistory.length > this.maxHistorySize) {
            this.conversationHistory.shift();
        }
    }

    // ============================================
    // RATE LIMITING
    // ============================================
    async enforceRateLimit() {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;

        if (timeSinceLastRequest < this.minRequestInterval) {
            const waitTime = this.minRequestInterval - timeSinceLastRequest;
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }

        this.lastRequestTime = Date.now();
    }

    // ============================================
    // TRACK USAGE
    // ============================================
    trackUsage(response) {
        this.requestCount++;
        
        if (response.usageMetadata) {
            this.totalTokens += (response.usageMetadata.totalTokenCount || 0);
        }

        if (this.config.development.debugMode) {
            console.log('Gemini Usage:', {
                requests: this.requestCount,
                totalTokens: this.totalTokens,
                lastResponse: response.usageMetadata
            });
        }
    }

    // ============================================
    // ERROR HANDLING
    // ============================================
    handleError(error) {
        let userMessage = '';

        if (error.message.includes('API key')) {
            userMessage = this.config.errors.messages.apiKey;
        } else if (error.message.includes('rate limit') || error.message.includes('429')) {
            userMessage = this.config.errors.messages.rateLimit;
        } else if (error.message.includes('timeout')) {
            userMessage = this.config.errors.messages.timeout;
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
            userMessage = this.config.errors.messages.network;
        } else {
            userMessage = this.config.errors.messages.unknown;
        }

        return {
            text: `⚠️ **Error:** ${userMessage}\n\n*Technical details: ${error.message}*`,
            error: true,
            chartRequests: []
        };
    }

    // ============================================
    // CLEAR HISTORY
    // ============================================
    clearHistory() {
        this.conversationHistory = [];
        this.contextWindow = [];
    }

    // ============================================
    // GET STATS
    // ============================================
    getStats() {
        return {
            requestCount: this.requestCount,
            totalTokens: this.totalTokens,
            historySize: this.conversationHistory.length,
            averageTokensPerRequest: this.requestCount > 0 
                ? Math.round(this.totalTokens / this.requestCount) 
                : 0
        };
    }
}

// ============================================
// EXPORT
// ============================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GeminiAI;
}