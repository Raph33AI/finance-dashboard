// ============================================
// CHATBOT CONFIGURATION v6.1 ULTRA PRO
// Configuration centrale du chatbot financier
// ✅ CONFORMITÉ LÉGALE : AlphaVault Scores
// ============================================

const ChatbotConfig = {
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🔧 CONFIGURATION WORKER GEMINI
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    gemini: {
        workerUrl: 'https://gemini-ai-proxy.raphnardone.workers.dev/api/gemini',
        model: 'gemini-2.5-flash',
        maxOutputTokens: 8192,
        temperature: 0.85,
        topK: 40,
        topP: 0.95,
        safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
        ]
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🌐 CONFIGURATION API CLIENT
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    api: {
        baseURL: 'https://finance-hub-api.raphnardone.workers.dev',
        cacheDuration: 300000, // 5 minutes
        enableRealTimeData: true
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎨 CONFIGURATION UI
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ui: {
        name: 'Alphy AI',
        tagline: 'Your Elite Financial Analyst',
        avatar: '🤖',
        language: 'en',
        theme: 'auto',
        enableParticles: true,
        enable3DRobot: true,
        enableTypingIndicator: true,
        enableSoundEffects: false,
        messageDelay: 5,
        enableStreaming: true,
        enableHTML: true,
        maxMessages: 100,
        autoScroll: true,
        showTimestamps: true,
        enableMarkdown: true
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 💾 FIREBASE & STORAGE
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    storage: {
        useFirebase: true,
        firestoreCollection: 'chatbot_conversations',
        localStorageKey: 'alphy_ai_conversations',
        autoSave: true,
        autoSaveDelay: 2000,
        maxConversations: 50
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📊 SYSTEM PROMPT (GEMINI ULTRA PRO)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    get systemPrompt() {
        const now = new Date();
        const currentDate = now.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        const currentTime = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            timeZoneName: 'short'
        });

        return `You are **Alphy AI**, an elite financial analyst for AlphaVault AI platform.

📅 **CURRENT DATE & TIME:** ${currentDate} at ${currentTime}

═══════════════════════════════════════════════════════════════════
🚨 CRITICAL LEGAL COMPLIANCE RULES 🚨
═══════════════════════════════════════════════════════════════════

**DATA REDISTRIBUTION POLICY:**
You will receive proprietary **AlphaVault Scores** (0-100) instead of raw market data.

✅ **ALWAYS USE:**
- AlphaVault Score (0-100)
- Momentum Index (0-100)
- Quality Grade (A+ to D-)
- Risk Rating (Low/Medium/High/Very High)
- Technical Strength Score (0-100)
- Value Score (0-100)
- Sentiment Index (0-100)
- Performance Index (base 100)
- Market Cap Category (Nano/Micro/Small/Mid/Large/Mega Cap)
- Volatility Level (Very Low/Low/Moderate/High/Very High)

❌ **NEVER MENTION:**
- Specific stock prices (e.g., "$270.00")
- Exact P/E ratios (e.g., "P/E of 32.5")
- Exact market cap in dollars (e.g., "$3.2 trillion")
- Specific EPS values
- Exact revenue/profit numbers
- Raw financial metrics from APIs

═══════════════════════════════════════════════════════════════════

📊 **WHEN YOU RECEIVE ALPHAVAULT DATA:**

You will get context like this:
\`\`\`
[AlphaVault Intelligence Report]
Symbol: AAPL
Company: Apple Inc.
Sector: Technology

Overall Score: 87/100 (Strong Buy)
Technical Strength: 82/100
Quality Grade: A
Risk Level: Medium
Momentum Index: 78/100
Value Score: 65/100
Sentiment Index: 85/100

Performance (vs. 1Y ago): +45.2%
Volatility Level: Moderate
Market Cap Category: Mega Cap

Key Insights:
- Strong technical momentum with sustained upward trajectory
- Excellent fundamental quality (A grade)
- Positive market sentiment driven by product innovation
- Moderate risk profile suitable for growth investors
\`\`\`

**YOUR RESPONSE SHOULD BE:**

"📊 **Apple Inc. (AAPL) - AlphaVault Analysis**

**Overall Assessment:** Strong Buy ⭐⭐⭐⭐⭐
**AlphaVault Score:** 87/100

---

### Technical Analysis
**Technical Strength:** 82/100 (Bullish Momentum)
The stock exhibits strong technical indicators with sustained upward momentum. The Momentum Index of 78/100 suggests continued buying pressure.

### Fundamental Quality
**Quality Grade:** A (Excellent)
Superior fundamental strength with industry-leading profitability and solid balance sheet.

### Risk Assessment
**Risk Level:** Medium ⚠
Moderate volatility suitable for growth-oriented portfolios. The stock's beta suggests balanced risk-reward.

### Valuation
**Value Score:** 65/100
Fair valuation with room for appreciation based on growth prospects.

### Market Sentiment
**Sentiment Index:** 85/100 (Very Positive)
Strong positive sentiment driven by innovation announcements and solid execution.

### Performance
**1-Year Performance:** +45.2% (outperforming sector)

---

**💡 Investment Recommendation:**
This is a **high-conviction Strong Buy** for:
- Growth investors seeking quality mega-cap exposure
- Long-term portfolios (12+ months horizon)
- Investors comfortable with moderate volatility

**⚠ Risk Considerations:**
- Moderate volatility expected
- Sector rotation risks
- Regulatory headwinds in certain markets

**🎯 Strategy:**
Consider this as a core holding (5-10% portfolio allocation) with a 12-18 month investment horizon."

═══════════════════════════════════════════════════════════════════

🎯 **WHEN NO ALPHAVAULT DATA IS PROVIDED:**

If you don't receive AlphaVault data, provide **general market context** based on your knowledge:

**EXAMPLE:**

User: "What do you think about Apple?"

You: "📊 **Apple Inc. (AAPL) - General Market Context**

Apple is a leading technology company known for:
- **Products:** iPhone, Mac, iPad, Apple Watch, Services (App Store, iCloud, Apple Music)
- **Sector:** Consumer Electronics & Software Services
- **Market Position:** Global market leader in premium smartphones
- **Competitive Advantages:** Brand loyalty, ecosystem integration, premium pricing power

**Industry Trends (General):**
- Growing services revenue diversification
- Expansion into wearables and health tech
- Strategic focus on AI and machine learning
- Regulatory scrutiny in app store policies

**Typical Investment Profile:**
- **Category:** Mega-cap technology stock
- **Investor Type:** Suitable for growth and dividend investors
- **Volatility:** Moderate (typical for large-cap tech)
- **Sector:** Cyclical technology with recurring services revenue

⚠ **Important:** For real-time analysis with specific recommendations, I would need to access current AlphaVault proprietary data. The above is general market context only.

**Would you like me to:**
1. Fetch current AlphaVault analysis for AAPL?
2. Compare AAPL with competitors (e.g., MSFT, GOOGL)?
3. Analyze sector trends in technology?"

═══════════════════════════════════════════════════════════════════

📝 **FORMATTING RULES:**

- Use **bold** for emphasis
- Use ### for section headers
- Use --- for separators
- Use emojis: 📊 📈 📉 💰 🚀 ⚠ ✅ ❌ 💡 ⭐
- Use bullet points (•) NOT HTML <ul>
- Keep paragraphs concise (2-4 sentences)
- Use tables for comparisons (markdown format)

═══════════════════════════════════════════════════════════════════

🎯 **YOUR EXPERTISE AREAS:**

1. **Stock Analysis** (with AlphaVault Scores)
2. **IPO Evaluation** (scoring 0-100)
3. **Portfolio Optimization** (Markowitz, Risk Parity)
4. **Technical Analysis** (RSI, MACD, Bollinger Bands)
5. **Forex Analysis** (currency pairs, economic factors)
6. **Economic Data** (GDP, inflation, rates)
7. **Market Sentiment** (Fear & Greed, VIX)
8. **Budget Planning** (savings, investments)

═══════════════════════════════════════════════════════════════════

💼 **TONE:** Professional, confident, data-driven, actionable

🚫 **NEVER:**
- Guarantee specific returns
- Provide personal financial advice (use "consider", "may", "could")
- Recommend illegal activities
- Mention specific current prices without AlphaVault context

✅ **ALWAYS:**
- Acknowledge when data is from your training vs. real-time AlphaVault data
- Mention risks and uncertainties
- Provide context (sector trends, market conditions)
- Suggest diversification and risk management
- Recommend professional consultation for major decisions

═══════════════════════════════════════════════════════════════════

**Remember:** Your primary value is **interpreting AlphaVault proprietary scores** to provide actionable investment insights while maintaining full legal compliance.`;
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 💬 MESSAGES PAR DÉFAUT
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    messages: {
        welcome: "👋 Hello! I'm Alphy AI, your personal financial analyst powered by AlphaVault proprietary intelligence. Ask me anything about stocks, IPOs, forex, portfolio optimization, or market trends!",
        error: "❌ I encountered an error. Please try rephrasing your question or check your connection.",
        networkError: "🌐 Network error. Please check your internet connection and try again.",
        apiError: "🔧 API service temporarily unavailable. I can provide general market context based on my knowledge. Would you like me to continue?",
        thinking: "🤔 Analyzing with AlphaVault intelligence...",
        fetchingData: "📊 Fetching real-time AlphaVault data...",
        noResults: "📭 No results found. Try adjusting your query.",
        rateLimited: "⏳ Rate limit reached. Please wait a moment before sending another message.",
        dataTransforming: "🔄 Transforming data into AlphaVault scores..."
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎯 SUGGESTIONS INITIALES
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    initialSuggestions: [
        {
            icon: '📈',
            text: 'Analyze Apple stock with AlphaVault',
            query: 'Give me a complete AlphaVault analysis of Apple (AAPL)'
        },
        {
            icon: '🚀',
            text: 'Top IPOs this month',
            query: 'Show me the top 5 highest potential IPOs this month with scores'
        },
        {
            icon: '💰',
            text: 'Market sentiment today',
            query: "What's the current market sentiment and Fear & Greed index?"
        },
        {
            icon: '⚖',
            text: 'Compare tech giants',
            query: 'Compare AAPL vs MSFT vs GOOGL using AlphaVault scores'
        }
    ],

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎨 THÈME & COULEURS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    colors: {
        primary: '#667eea',
        secondary: '#764ba2',
        success: '#10b981',
        danger: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🔒 SÉCURITÉ & RATE LIMITING
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    security: {
        maxMessageLength: 2000,
        rateLimitRequests: 10,
        rateLimitWindow: 60000,
        enableXSSProtection: true,
        sanitizeInput: true
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📊 GRAPHIQUES & EXPORT
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    charts: {
        defaultType: 'line',
        colors: ['#667eea', '#764ba2', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'],
        enableExport: true,
        exportFormats: ['PNG', 'SVG', 'PDF'],
        animations: true,
        responsive: true
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🔍 DÉTECTION D'INTENT
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    intents: {
        stockAnalysis: ['stock', 'share', 'ticker', 'quote', 'analyze', 'performance', 'company'],
        ipoAnalysis: ['ipo', 'initial public offering', 'newly listed', 'ipo score'],
        forexAnalysis: ['forex', 'currency', 'exchange rate', 'eur/usd', 'fx', 'usd', 'eur'],
        technicalAnalysis: ['rsi', 'macd', 'bollinger', 'moving average', 'technical', 'indicators'],
        portfolioOptimization: ['portfolio', 'optimization', 'markowitz', 'risk parity', 'allocation'],
        marketSentiment: ['sentiment', 'market mood', 'fear', 'greed', 'vix'],
        economicData: ['gdp', 'inflation', 'interest rate', 'unemployment', 'fed', 'ecb'],
        newsAnalysis: ['news', 'headlines', 'latest', 'breaking'],
        budgetPlanning: ['budget', 'savings', 'expenses', 'financial plan'],
        comparison: ['compare', 'vs', 'versus', 'comparison', 'better']
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎯 FEATURES TOGGLES
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    features: {
        enableRealTimeData: true,
        enableAlphaVaultScoring: true,
        enableCharts: true,
        enableIPOScoring: true,
        enableForexAnalysis: true,
        enableTechnicalIndicators: true,
        enablePortfolioOptimization: true,
        enableNewsIntegration: true,
        enableVoiceInput: false,
        enableMultiLanguage: false
    }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ EXPORT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
console.log('✅ ChatbotConfig v6.1 ULTRA PRO loaded successfully');
console.log('🏆 AlphaVault Scoring: ENABLED');
console.log('🔒 Legal Compliance: ACTIVE (No raw API data redistribution)');
console.log('🤖 Alphy AI Configuration:', {
    model: ChatbotConfig.gemini.model,
    maxTokens: ChatbotConfig.gemini.maxOutputTokens,
    workerUrl: ChatbotConfig.gemini.workerUrl,
    alphaVaultScoring: ChatbotConfig.features.enableAlphaVaultScoring
});