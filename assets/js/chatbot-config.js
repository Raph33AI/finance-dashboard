// ============================================
// FINANCIAL CHATBOT - CONFIGURATION
// Version Conversationnelle Ultra-Performante
// ============================================

const ChatbotConfig = {
    // ============================================
    // API CONFIGURATION
    // ============================================
    api: {
        gemini: {
            apiKey: 'AIzaSyDWbJhZm4hUls0t7qkwmDwrAZCJTLXXztU',
            endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
            model: 'gemini-2.0-flash',
            
            // ✅ AMÉLIORATION 1: Paramètres optimisés pour la conversation
            maxOutputTokens: 8192, // Maintenu pour flexibilité
            temperature: 0.9, // ↑ Plus créatif (était 0.85)
            topK: 40,
            topP: 0.95,
            
            safetySettings: [
                { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
            ]
        },
        
        finnhub: {
            apiKey: 'd45qhbpr01qieo4rfq9gd45qhbpr01qieo4rfqa0',
            endpoint: 'https://finnhub.io/api/v1',
            websocket: 'wss://ws.finnhub.io'
        },
        
        twelveData: {
            apiKey: '57e3c785fda7424d97ab195f22263765',
            endpoint: 'https://api.twelvedata.com'
        }
    },

    // ============================================
    // CHATBOT BEHAVIOR
    // ============================================
    behavior: {
        typingDelay: 1200, // ↓ Réduit pour réactivité (était 1500)
        responseDelay: 200, // ↓ Réduit (était 300)
        maxMessageLength: 2000,
        
        // ✅ AMÉLIORATION 2: Historique étendu
        maxHistorySize: 100, // ↑ Augmenté (était 50)
        conversationMemorySize: 20, // Nouveaux messages gardés en mémoire pour contexte
        
        showSuggestions: true,
        suggestionsDelay: 400, // ↓ Réduit (était 500)
        maxSuggestions: 4,
        
        // ✅ AMÉLIORATION 3: Génération automatique de graphiques intelligente
        autoGenerateCharts: true,
        chartAnimationDuration: 600, // ↓ Plus rapide (était 750)
        
        inputDebounce: 200, // ↓ Réduit (était 300)
        virtualScrollThreshold: 100,
        enableLazyLoading: true,
        enableWebWorkers: false,
        enableServiceWorker: false
    },

    // ============================================
    // UI CUSTOMIZATION
    // ============================================
    ui: {
        theme: 'futuristic',
        primaryColor: '#667eea',
        accentColor: '#764ba2',
        botAvatar: '🤖',
        userAvatar: '👤',
        enableAnimations: true,
        enableParticles: false,
        position: 'bottom-right',
        width: 420,
        height: 650,
        mobileBreakpoint: 768,
        
        // ✅ AMÉLIORATION 4: Message d'accueil conversationnel
        welcomeMessage: "👋 **Hi! I'm Alphy**, your AI Financial Expert.\n\nI can help you with:\n• 📊 Stock analysis & recommendations\n• 💰 IPO evaluation & research\n• 📈 Technical & fundamental analysis\n• 🌐 Market insights & trends\n• 💡 Financial education\n\n**Ask me anything about finance!**",
        
        placeholderText: "Ask me anything about stocks, markets, IPOs...",
        showTimestamps: true,
        timestampFormat: 'HH:mm'
    },

    // ============================================
    // FEATURES FLAGS
    // ============================================
    features: {
        ipoAnalysis: true,
        marketData: true,
        chartGeneration: true,
        technicalIndicators: true,
        sentimentAnalysis: false,
        portfolioTracking: false,
        realTimeAlerts: false,
        exportConversation: true,
        voiceInput: false,
        multiLanguage: false,
        
        // ✅ AMÉLIORATION 5: Nouvelles fonctionnalités conversationnelles
        contextualMemory: true, // Mémoire des conversations précédentes
        smartSuggestions: true, // Suggestions basées sur le contexte
        adaptiveResponses: true // Réponses adaptées au niveau de l'utilisateur
    },

    // ============================================
    // IPO ANALYZER SETTINGS
    // ============================================
    ipo: {
        weights: {
            financial: 0.30,
            market: 0.25,
            valuation: 0.20,
            growth: 0.15,
            momentum: 0.10
        },
        highPotentialThreshold: 75,
        mediumPotentialThreshold: 60,
        cacheTimeout: 3600000,
        lookbackPeriod: 90,
        minDataPoints: 10
    },

    // ============================================
    // CHART SETTINGS
    // ============================================
    charts: {
        defaultType: 'line',
        colors: {
            primary: '#667eea',
            secondary: '#764ba2',
            success: '#38ef7d',
            danger: '#f45c43',
            warning: '#ffbe0b',
            info: '#00d9ff',
            grid: 'rgba(255, 255, 255, 0.1)',
            text: 'rgba(255, 255, 255, 0.8)'
        },
        animation: {
            duration: 600, // ↓ Plus rapide (était 750)
            easing: 'easeInOutQuart'
        },
        enableZoom: true,
        enablePan: true,
        enableTooltip: true,
        enableLegend: true,
        indicators: {
            sma: { periods: [20, 50, 200] },
            ema: { periods: [12, 26] },
            rsi: { period: 14, overbought: 70, oversold: 30 },
            macd: { fast: 12, slow: 26, signal: 9 },
            bollingerBands: { period: 20, stdDev: 2 }
        },
        exportFormats: ['png', 'svg', 'csv']
    },

    // ============================================
    // ANALYTICS
    // ============================================
    analytics: {
        enabled: false,
        trackingId: '',
        events: {
            messagesSent: true,
            chartsGenerated: true,
            suggestionsClicked: true,
            errorsOccurred: true
        }
    },

    // ============================================
    // LOCALIZATION
    // ============================================
    localization: {
        defaultLanguage: 'en',
        supportedLanguages: ['en'],
        translations: {
            en: {
                welcome: "👋 Hi! I'm Alphy, your AI Financial Expert. Ask me anything!",
                placeholder: "Ask me anything about stocks, markets, IPOs...",
                send: "Send",
                typing: "Alphy is typing...",
                error: "Oops! Something went wrong.",
                retry: "Retry",
                clear: "Clear",
                export: "Export",
                close: "Close"
            }
        }
    },

    // ============================================
    // SUGGESTIONS TEMPLATES
    // ============================================
    suggestions: {
        // ✅ AMÉLIORATION 6: Suggestions variées et engageantes
        initial: [
            "📈 Analyze NVDA stock performance",
            "💰 What's happening in the market today?",
            "📊 Show me top performing IPOs",
            "🎯 Explain the P/E ratio",
            "💡 Best tech stocks to watch",
            "🔍 Compare AAPL vs MSFT"
        ],
        followUp: {
            ipo: [
                "Show detailed IPO analysis",
                "Compare with industry peers",
                "Risk assessment for this IPO",
                "Historical IPO performance"
            ],
            stock: [
                "Technical indicators analysis",
                "Fundamental metrics breakdown",
                "Compare with competitors",
                "Price targets and recommendations"
            ],
            market: [
                "Sector performance breakdown",
                "Top gainers and losers",
                "Economic indicators impact",
                "Market sentiment analysis"
            ]
        }
    },

    // ============================================
    // PERFORMANCE
    // ============================================
    performance: {
        lazyLoadImages: true,
        lazyLoadCharts: true,
        enableCache: true,
        cacheExpiration: 300000, // 5 minutes
        compressMessages: false,
        useWebWorkers: false,
        maxWorkers: 2,
        batchRequests: false,
        batchDelay: 100,
        maxRequestsPerMinute: 30,
        virtualScrollItemHeight: 80,
        virtualScrollBuffer: 5
    },

    // ============================================
    // ERROR HANDLING
    // ============================================
    errors: {
        maxRetries: 3,
        retryDelay: 1000,
        showUserFriendlyMessages: true,
        logErrors: true,
        messages: {
            network: "⚠ Network error. Please check your connection.",
            apiKey: "⚠ API key is missing or invalid. Please configure your API keys.",
            rateLimit: "⚠ Rate limit exceeded. Please wait a moment.",
            timeout: "⚠ Request timeout. Please try again.",
            unknown: "⚠ An unexpected error occurred. Please try rephrasing your question."
        }
    },

    // ============================================
    // DEVELOPMENT
    // ============================================
    development: {
        debugMode: false,
        mockApiResponses: false,
        showPerformanceMetrics: false,
        enableHotReload: false
    }
};

// ============================================
// EXPORT
// ============================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChatbotConfig;
}