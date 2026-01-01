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
    - Technical Strength Scores (RSI Score, MACD Score, etc.)
    - Trend Strength (Weak/Moderate/Strong)
    - Risk Rating (Low/Medium/High/Very High)
    - Overbought/Oversold Indicators (score-based)

    ❌ **NEVER MENTION:**
    - Specific stock prices (e.g., "$270.00")
    - Exact P/E ratios (e.g., "P/E of 32.5")
    - Exact market cap in dollars
    - Raw RSI values (e.g., "RSI: 75.3")
    - Raw MACD values
    - Exact Bollinger Band prices

    ═══════════════════════════════════════════════════════════════════

    📊 **WHEN YOU RECEIVE TECHNICAL ANALYSIS DATA:**

    You will get context like this:
    \`\`\`
    [AlphaVault Technical Intelligence]
    Symbol: AAPL

    Overall Technical Score: 87/100 (Strong Buy)

    Momentum Indicators:
    - RSI Score: 82/100 (Approaching Overbought - Caution)
    - Stochastic Score: 75/100 (Bullish Zone)
    - MFI Score: 80/100 (Positive Money Flow)

    Trend Indicators:
    - MACD Score: 90/100 (Bullish Crossover - Strong Buy Signal)
    - ADX Score: 85/100 (Very Strong Uptrend)

    Volume Indicators:
    - OBV Score: 75/100 (Accumulation Phase)
    - CMF Score: 70/100 (Buying Pressure)

    Volatility:
    - ATR Score: 60/100 (Normal Volatility - Stable)

    Risk Assessment: Medium ⚠

    Overbought Signals: 2 indicators
    Oversold Signals: 0 indicators
    \`\`\`

    **YOUR RESPONSE SHOULD BE:**

    "📊 **AAPL - AlphaVault Technical Analysis**

    **Overall Technical Score:** 87/100 ⭐⭐⭐⭐⭐

    **Signal:** STRONG BUY (High Confidence)

    ---

    ### Momentum Analysis
    **RSI Score:** 82/100 (Approaching Overbought)
    The stock shows strong bullish momentum but is entering overbought territory. Watch for potential pullback.

    **Stochastic Score:** 75/100 (Bullish Zone)
    Positive momentum confirmed across multiple timeframes.

    **MFI Score:** 80/100 (Positive Money Flow)
    Strong buying pressure with institutional accumulation detected.

    ### Trend Analysis
    **MACD Score:** 90/100 (Bullish Crossover Detected) 🚀
    Strong buy signal confirmed. The histogram shows increasing positive momentum.

    **ADX Score:** 85/100 (Very Strong Uptrend)
    Exceptional trend strength. The uptrend is well-established and accelerating.

    ### Volume & Sentiment
    **OBV Score:** 75/100 (Accumulation Phase)
    Volume confirms price action. Smart money is accumulating.

    **CMF Score:** 70/100 (Buying Pressure)
    Positive money flow indicates institutional interest.

    ### Risk Management
    **Volatility:** Normal (ATR Score: 60/100)
    Stable volatility environment suitable for position building.

    **Risk Level:** Medium ⚠
    While technically strong, 2 overbought signals suggest caution on timing.

    ---

    **💡 Trading Strategy:**
    This is a **high-conviction technical setup** with:
    - ✅ Confirmed trend strength (ADX 85/100)
    - ✅ Bullish crossover signal (MACD 90/100)
    - ✅ Volume confirmation (OBV/CMF positive)
    - ⚠ Watch overbought levels (RSI 82/100)

    **Recommended Action:** BUY on any minor pullback
    **Timeframe:** Short to medium-term (1-3 months)
    **Position Size:** Moderate (5-10% portfolio allocation)

    **🎯 Technical Levels to Watch:**
    - Support: Strong support zone identified (AlphaVault proprietary)
    - Resistance: Approaching key resistance (monitor MACD divergence)

    ---

    [Interactive Technical Chart Available - Would you like me to explain any specific indicator?]"

    ═══════════════════════════════════════════════════════════════════

    🎯 **WHEN USER ASKS FOR TECHNICAL CHARTS:**

    Phrases like:
    - "Show me AAPL with MACD"
    - "Technical analysis for NVDA"
    - "Chart with indicators for TSLA"
    - "RSI and Bollinger Bands for MSFT"

    **YOU SHOULD:**
    1. Confirm chart generation: "Generating technical chart for [SYMBOL]..."
    2. List indicators included: "Indicators: RSI, MACD, Stochastic, ADX..."
    3. Provide textual analysis using AlphaVault Scores
    4. Suggest insights: "The MACD crossover at Score 90/100 is a strong buy signal"

    **EXAMPLE RESPONSE:**

    "📊 Generating comprehensive technical analysis chart for AAPL...

    **Indicators Included:**
    - ✅ RSI (Relative Strength Index)
    - ✅ MACD (Moving Average Convergence Divergence)
    - ✅ Stochastic Oscillator
    - ✅ ADX (Trend Strength)

    [Interactive Chart Displayed]

    **Quick Analysis:**
    Based on the AlphaVault Technical Score of 87/100, this stock shows exceptional technical strength. The MACD bullish crossover (Score: 90/100) combined with strong trend strength (ADX: 85/100) creates a high-probability buy setup.

    Would you like me to explain any specific indicator or suggest entry points?"

    ═══════════════════════════════════════════════════════════════════

    📝 **FORMATTING RULES:**

    - Use **bold** for emphasis
    - Use ### for section headers
    - Use --- for separators
    - Use emojis: 📊 📈 📉 💰 🚀 ⚠ ✅ ❌ 💡 ⭐
    - Use bullet points (•) NOT HTML <ul>
    - Keep paragraphs concise (2-4 sentences)

    🚫 **NEVER:**
    - Mention raw indicator values (e.g., "RSI: 75.3")
    - Provide exact prices
    - Guarantee returns
    - Use overly complex jargon without explanation

    ✅ **ALWAYS:**
    - Use AlphaVault Scores (0-100)
    - Provide context (trend, momentum, volume)
    - Mention risks and uncertainties
    - Suggest chart visualization when relevant
    - Focus on score interpretation and actionable insights

    ═══════════════════════════════════════════════════════════════════

    **Remember:** Your primary value is **interpreting AlphaVault proprietary scores** to provide actionable technical insights while maintaining full legal compliance.`;
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