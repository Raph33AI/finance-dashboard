// // ============================================
// // FINANCIAL CHATBOT - CONFIGURATION
// // Version Conversationnelle Ultra-Performante v3.1
// // ✅ CORRECTION: Détection thème dark/light pour couleurs de graphiques
// // ============================================

// const ChatbotConfig = {
//     api: {
//         // ✅ WORKER CLOUDFLARE EXISTANT (Finnhub + Twelve Data)
//         worker: {
//             baseUrl: 'https://finance-hub-api.raphnardone.workers.dev',
//             endpoints: {
//                 finnhub: '/api/finnhub',
//                 twelvedata: '/api/twelvedata',
//                 // ✅ Endpoints directs pour compatibilité
//                 quote: '/api/quote',
//                 timeSeries: '/api/time-series',
//                 profile: '/api/profile',
//                 companyProfile: '/api/finnhub/company-profile',
//                 basicFinancials: '/api/finnhub/basic-financials'
//             }
//         },
        
//         // ✅ WORKER GEMINI
//         gemini: {
//             apiKey: '',
//             workerUrl: 'https://gemini-ai-proxy.raphnardone.workers.dev/api/gemini',
//             model: 'gemini-2.5-flash',
//             maxOutputTokens: 8192,
//             temperature: 0.9,
//             topK: 40,
//             topP: 0.95,
            
//             safetySettings: [
//                 { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
//                 { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
//                 { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
//                 { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
//             ]
//         },
        
//         finnhub: {
//             apiKey: '',
//             endpoint: 'https://finnhub.io/api/v1',
//             websocket: 'wss://ws.finnhub.io'
//         },
        
//         twelveData: {
//             apiKey: '',
//             endpoint: 'https://api.twelvedata.com'
//         }
//     },

//     // ============================================
//     // CHATBOT BEHAVIOR
//     // ============================================
//     behavior: {
//         typingDelay: 1200,
//         responseDelay: 200,
//         maxMessageLength: 2000,
        
//         maxHistorySize: 100,
//         conversationMemorySize: 20,
        
//         showSuggestions: true,
//         suggestionsDelay: 400,
//         maxSuggestions: 4,
        
//         autoGenerateCharts: true,
//         chartAnimationDuration: 600,
        
//         inputDebounce: 200,
//         virtualScrollThreshold: 100,
//         enableLazyLoading: true,
//         enableWebWorkers: false,
//         enableServiceWorker: false
//     },

//     // ============================================
//     // UI CUSTOMIZATION
//     // ============================================
//     ui: {
//         theme: 'futuristic',
//         primaryColor: '#667eea',
//         accentColor: '#764ba2',
//         botAvatar: '🤖',
//         userAvatar: '👤',
//         enableAnimations: true,
//         enableParticles: false,
//         position: 'bottom-right',
//         width: 420,
//         height: 650,
//         mobileBreakpoint: 768,
        
//         welcomeMessage: "👋 **Hi! I'm Alphy**, your AI Financial Expert.\n\nI can help you with:\n• 📊 Stock analysis & recommendations\n• 💰 IPO evaluation & research\n• 📈 Technical & fundamental analysis\n• 🌐 Market insights & trends\n• 💡 Financial education\n\n**Ask me anything about finance!**",
        
//         placeholderText: "Ask me anything about stocks, markets, IPOs...",
//         showTimestamps: true,
//         timestampFormat: 'HH:mm'
//     },

//     // ============================================
//     // FEATURES FLAGS
//     // ============================================
//     features: {
//         ipoAnalysis: true,
//         marketData: true,
//         chartGeneration: true,
//         technicalIndicators: true,
//         sentimentAnalysis: false,
//         portfolioTracking: false,
//         realTimeAlerts: false,
//         exportConversation: true,
//         voiceInput: false,
//         multiLanguage: false,
        
//         contextualMemory: true,
//         smartSuggestions: true,
//         adaptiveResponses: true
//     },

//     // ============================================
//     // IPO ANALYZER SETTINGS
//     // ============================================
//     ipo: {
//         weights: {
//             financial: 0.30,
//             market: 0.25,
//             valuation: 0.20,
//             growth: 0.15,
//             momentum: 0.10
//         },
//         highPotentialThreshold: 75,
//         mediumPotentialThreshold: 60,
//         cacheTimeout: 3600000,
//         lookbackPeriod: 90,
//         minDataPoints: 10
//     },

//     // ============================================
//     // CHART SETTINGS (✅ CORRECTION MAJEURE)
//     // ============================================
//     charts: {
//         defaultType: 'line',
        
//         // ✅ CORRECTION: Couleurs adaptatives selon le thème
//         colors: {
//             // Fonction pour obtenir les couleurs selon le thème
//             getColors: function() {
//                 const isDarkMode = document.body.classList.contains('dark-mode');
                
//                 if (isDarkMode) {
//                     return {
//                         primary: '#667eea',
//                         secondary: '#764ba2',
//                         success: '#38ef7d',
//                         danger: '#f45c43',
//                         warning: '#ffbe0b',
//                         info: '#00d9ff',
//                         grid: 'rgba(255, 255, 255, 0.1)',
//                         text: 'rgba(255, 255, 255, 0.9)', // Blanc en dark mode
//                         background: 'rgba(15, 23, 42, 0.95)'
//                     };
//                 } else {
//                     return {
//                         primary: '#667eea',
//                         secondary: '#764ba2',
//                         success: '#10b981',
//                         danger: '#ef4444',
//                         warning: '#f59e0b',
//                         info: '#06b6d4',
//                         grid: 'rgba(0, 0, 0, 0.08)',
//                         text: 'rgba(30, 41, 59, 0.9)', // ✅ NOIR en light mode
//                         background: 'rgba(255, 255, 255, 0.98)'
//                     };
//                 }
//             },
            
//             // ✅ Valeurs par défaut (light mode) pour compatibilité
//             primary: '#667eea',
//             secondary: '#764ba2',
//             success: '#10b981',
//             danger: '#ef4444',
//             warning: '#f59e0b',
//             info: '#06b6d4',
//             grid: 'rgba(0, 0, 0, 0.08)',
//             text: 'rgba(30, 41, 59, 0.9)', // ✅ PAR DÉFAUT: NOIR (light mode)
//             background: 'rgba(255, 255, 255, 0.98)'
//         },
        
//         animation: {
//             duration: 600,
//             easing: 'easeInOutQuart'
//         },
//         enableZoom: true,
//         enablePan: true,
//         enableTooltip: true,
//         enableLegend: true,
//         indicators: {
//             sma: { periods: [20, 50, 200] },
//             ema: { periods: [12, 26] },
//             rsi: { period: 14, overbought: 70, oversold: 30 },
//             macd: { fast: 12, slow: 26, signal: 9 },
//             bollingerBands: { period: 20, stdDev: 2 }
//         },
//         exportFormats: ['png', 'svg', 'csv']
//     },

//     // ============================================
//     // ANALYTICS
//     // ============================================
//     analytics: {
//         enabled: false,
//         trackingId: '',
//         events: {
//             messagesSent: true,
//             chartsGenerated: true,
//             suggestionsClicked: true,
//             errorsOccurred: true
//         }
//     },

//     // ============================================
//     // LOCALIZATION
//     // ============================================
//     localization: {
//         defaultLanguage: 'en',
//         supportedLanguages: ['en'],
//         translations: {
//             en: {
//                 welcome: "👋 Hi! I'm Alphy, your AI Financial Expert. Ask me anything!",
//                 placeholder: "Ask me anything about stocks, markets, IPOs...",
//                 send: "Send",
//                 typing: "Alphy is typing...",
//                 error: "Oops! Something went wrong.",
//                 retry: "Retry",
//                 clear: "Clear",
//                 export: "Export",
//                 close: "Close"
//             }
//         }
//     },

//     // ============================================
//     // SUGGESTIONS TEMPLATES
//     // ============================================
//     suggestions: {
//         initial: [
//             "📈 Analyze NVDA stock performance",
//             "💰 What's happening in the market today?",
//             "📊 Show me top performing IPOs",
//             "🎯 Explain the P/E ratio",
//             "💡 Best tech stocks to watch",
//             "🔍 Compare AAPL vs MSFT"
//         ],
//         followUp: {
//             ipo: [
//                 "Show detailed IPO analysis",
//                 "Compare with industry peers",
//                 "Risk assessment for this IPO",
//                 "Historical IPO performance"
//             ],
//             stock: [
//                 "Technical indicators analysis",
//                 "Fundamental metrics breakdown",
//                 "Compare with competitors",
//                 "Price targets and recommendations"
//             ],
//             market: [
//                 "Sector performance breakdown",
//                 "Top gainers and losers",
//                 "Economic indicators impact",
//                 "Market sentiment analysis"
//             ]
//         }
//     },

//     // ============================================
//     // PERFORMANCE
//     // ============================================
//     performance: {
//         lazyLoadImages: true,
//         lazyLoadCharts: true,
//         enableCache: true,
//         cacheExpiration: 300000, // 5 minutes
//         compressMessages: false,
//         useWebWorkers: false,
//         maxWorkers: 2,
//         batchRequests: false,
//         batchDelay: 100,
//         maxRequestsPerMinute: 30,
//         virtualScrollItemHeight: 80,
//         virtualScrollBuffer: 5
//     },

//     // ============================================
//     // ERROR HANDLING
//     // ============================================
//     errors: {
//         maxRetries: 3,
//         retryDelay: 1000,
//         showUserFriendlyMessages: true,
//         logErrors: true,
//         messages: {
//             network: "⚠ Network error. Please check your connection.",
//             apiKey: "⚠ API key is missing or invalid. Please configure your API keys.",
//             rateLimit: "⚠ Rate limit exceeded. Please wait a moment.",
//             timeout: "⚠ Request timeout. Please try again.",
//             unknown: "⚠ An unexpected error occurred. Please try rephrasing your question."
//         }
//     },

//     // ============================================
//     // DEVELOPMENT
//     // ============================================
//     development: {
//         debugMode: true,
//         mockApiResponses: false,
//         showPerformanceMetrics: true,
//         enableHotReload: false
//     }
// };

// // ============================================
// // ✅ HELPER: Détection thème et mise à jour couleurs
// // ============================================
// ChatbotConfig.updateChartColors = function() {
//     const colors = this.charts.colors.getColors();
    
//     // Mettre à jour les couleurs dans l'objet
//     Object.assign(this.charts.colors, colors);
    
//     console.log('🎨 Chart colors updated for theme:', document.body.classList.contains('dark-mode') ? 'DARK' : 'LIGHT');
//     console.log('   Text color:', this.charts.colors.text);
//     console.log('   Grid color:', this.charts.colors.grid);
    
//     return colors;
// };

// // ✅ Observer les changements de thème
// if (typeof window !== 'undefined') {
//     const observer = new MutationObserver(() => {
//         ChatbotConfig.updateChartColors();
        
//         // ✅ Rafraîchir Chart.js defaults si disponible
//         if (typeof Chart !== 'undefined') {
//             Chart.defaults.color = ChatbotConfig.charts.colors.text;
//             Chart.defaults.borderColor = ChatbotConfig.charts.colors.grid;
//             console.log('✅ Chart.js defaults updated');
//         }
//     });
    
//     observer.observe(document.body, {
//         attributes: true,
//         attributeFilter: ['class']
//     });
    
//     // ✅ Initialisation au chargement
//     document.addEventListener('DOMContentLoaded', () => {
//         ChatbotConfig.updateChartColors();
//     });
// }

// // ============================================
// // EXPORT & GLOBAL AVAILABILITY
// // ============================================
// if (typeof module !== 'undefined' && module.exports) {
//     module.exports = ChatbotConfig;
// }

// window.ChatbotConfig = ChatbotConfig;

// console.log('✅ ChatbotConfig v3.1 loaded - Adaptive Chart Colors enabled');


// ============================================
// CHATBOT CONFIGURATION v6.0 ULTRA
// Configuration centrale du chatbot financier
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
    // 🎨 CONFIGURATION UI
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ui: {
        name: 'Alphy AI',
        tagline: 'Your Elite Financial Analyst',
        avatar: '🤖',
        language: 'en',
        theme: 'auto', // 'light', 'dark', 'auto'
        enableParticles: true,
        enable3DRobot: true,
        enableTypingIndicator: true,
        enableSoundEffects: false,
        messageDelay: 50, // ms entre chaque caractère du streaming
        maxMessages: 100, // Limite de messages en mémoire
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
        autoSaveDelay: 2000, // ms
        maxConversations: 50
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📊 PROMPTS SYSTÈME (FINANCE EXPERT)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    systemPrompt: `You are **Alphy AI**, an elite financial analyst and investment advisor with expertise in:

📊 **Core Competencies:**
- Stock Analysis (Technical & Fundamental)
- IPO Evaluation & Scoring
- M&A Predictions & Deal Analysis
- Forex Trading & Currency Analysis
- Portfolio Optimization (Markowitz, Risk Parity, Monte Carlo)
- Economic Data Interpretation (GDP, Inflation, Interest Rates)
- Insider Trading Pattern Detection
- Budget Planning & Investment Strategies

🎯 **Response Guidelines:**
1. **Always provide actionable insights** with specific numbers, percentages, and timeframes
2. **Use real-time data** when discussing current market conditions
3. **Include risk assessments** (Low/Medium/High) for investment recommendations
4. **Cite sources** when referencing economic indicators or financial data
5. **Explain complex concepts** in clear, professional language
6. **Suggest relevant charts** when data visualization would enhance understanding
7. **Provide multiple scenarios** (Bull/Base/Bear cases) for predictions
8. **Use financial terminology** accurately (P/E, EPS, EBITDA, Sharpe Ratio, etc.)

💼 **Tone:** Professional, confident, data-driven, yet approachable

🚫 **Never:**
- Give financial advice as personal recommendation (always use "consider", "may", "could")
- Guarantee returns or predict exact prices
- Recommend illegal activities (insider trading, market manipulation)
- Use overly complex jargon without explanation

✅ **Always:**
- Mention risks and uncertainties
- Provide context (market conditions, sector trends)
- Suggest further research or professional consultation for major decisions
- Use emojis strategically for readability (📊 📈 📉 💰 🚀 ⚠)

When asked about specific stocks, IPOs, forex pairs, or economic data:
1. Provide current metrics (price, volume, volatility)
2. Analyze technical indicators (RSI, MACD, Bollinger Bands)
3. Evaluate fundamentals (P/E, Revenue Growth, Debt/Equity)
4. Assess market sentiment and news impact
5. Give short-term (1-3 months) and long-term (1-3 years) outlooks
6. Suggest risk management strategies (stop-loss, position sizing)

Remember: You have access to real-time financial data through APIs. Use it to provide accurate, up-to-date analysis.`,

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 💬 MESSAGES PAR DÉFAUT
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    messages: {
        welcome: "👋 Hello! I'm Alphy AI, your personal financial analyst. Ask me anything about stocks, IPOs, forex, portfolio optimization, or market trends!",
        error: "❌ I encountered an error. Please try rephrasing your question or check your connection.",
        networkError: "🌐 Network error. Please check your internet connection and try again.",
        apiError: "🔧 API service temporarily unavailable. Please try again in a moment.",
        thinking: "🤔 Analyzing financial data...",
        noResults: "📭 No results found. Try adjusting your query.",
        rateLimited: "⏳ Rate limit reached. Please wait a moment before sending another message."
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎯 SUGGESTIONS INITIALES
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    initialSuggestions: [
        {
            icon: '📈',
            text: 'Analyze NVDA stock performance over the last 5 years',
            query: 'Analyze NVDA stock performance over the last 5 years'
        },
        {
            icon: '🚀',
            text: 'Show me the top 5 highest potential IPOs',
            query: 'Show me the top 5 highest potential IPOs'
        },
        {
            icon: '💰',
            text: "What's the market sentiment today?",
            query: "What's the market sentiment today?"
        },
        {
            icon: '📊',
            text: 'Compare AAPL vs MSFT technical indicators',
            query: 'Compare AAPL vs MSFT technical indicators'
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
        rateLimitRequests: 10, // requêtes max
        rateLimitWindow: 60000, // par minute (ms)
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
    // 🔍 DÉTECTION D'INTENT (Keywords)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    intents: {
        stockAnalysis: ['stock', 'share', 'ticker', 'quote', 'price', 'analyze', 'performance'],
        ipoAnalysis: ['ipo', 'initial public offering', 'newly listed', 'ipo score'],
        forexAnalysis: ['forex', 'currency', 'exchange rate', 'eur/usd', 'fx'],
        technicalAnalysis: ['rsi', 'macd', 'bollinger', 'moving average', 'technical', 'indicators'],
        portfolioOptimization: ['portfolio', 'optimization', 'markowitz', 'risk parity', 'allocation'],
        marketSentiment: ['sentiment', 'market mood', 'fear', 'greed', 'vix'],
        economicData: ['gdp', 'inflation', 'interest rate', 'unemployment', 'fed', 'ecb'],
        newsAnalysis: ['news', 'headlines', 'latest', 'breaking'],
        budgetPlanning: ['budget', 'savings', 'expenses', 'financial plan']
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎯 FEATURES TOGGLES
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    features: {
        enableRealTimeData: true,
        enableCharts: true,
        enableIPOScoring: true,
        enableForexAnalysis: true,
        enableTechnicalIndicators: true,
        enablePortfolioOptimization: true,
        enableNewsIntegration: true,
        enableVoiceInput: false, // Future feature
        enableMultiLanguage: false // Future feature
    }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ EXPORT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
console.log('✅ ChatbotConfig loaded successfully');
console.log('🤖 Alphy AI Configuration:', {
    model: ChatbotConfig.gemini.model,
    maxTokens: ChatbotConfig.gemini.maxOutputTokens,
    workerUrl: ChatbotConfig.gemini.workerUrl
});