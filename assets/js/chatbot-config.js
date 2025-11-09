// ============================================
// FINANCIAL CHATBOT - CONFIGURATION
// Ultra-Premium Settings & API Keys
// ============================================

const ChatbotConfig = {
    // ============================================
    // API CONFIGURATION
    // ============================================
    api: {
        gemini: {
            // ✅ TA CLÉ GEMINI
            apiKey: 'AIzaSyDWbJhZm4hUls0t7qkwmDwrAZCJTLXXztU',
            endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
            model: 'gemini-2.5-flash',
            maxOutputTokens: 8192,
            temperature: 0.85,
            topK: 40,
            topP: 0.95,
            safetySettings: [
                {
                    category: 'HARM_CATEGORY_HARASSMENT',
                    threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                },
                {
                    category: 'HARM_CATEGORY_HATE_SPEECH',
                    threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                },
                {
                    category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                    threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                },
                {
                    category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                    threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                }
            ]
        },
        
        finnhub: {
            // ✅ METS TA VRAIE CLÉ FINNHUB ICI
            apiKey: 'd45qhbpr01qieo4rfq9gd45qhbpr01qieo4rfqa0',
            endpoint: 'https://finnhub.io/api/v1',
            websocket: 'wss://ws.finnhub.io'
        },
        
        twelveData: {
            // ✅ METS TA VRAIE CLÉ TWELVE DATA ICI
            apiKey: '57e3c785fda7424d97ab195f22263765',
            endpoint: 'https://api.twelvedata.com'
        }
    },

    // ============================================
    // CHATBOT BEHAVIOR
    // ============================================
    behavior: {
        typingDelay: 1500,
        responseDelay: 300,
        maxMessageLength: 2000,
        maxHistorySize: 50,
        showSuggestions: true,
        suggestionsDelay: 500,
        maxSuggestions: 4,
        autoGenerateCharts: true,
        chartAnimationDuration: 750,
        inputDebounce: 300,
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
        particleCount: 0,
        position: 'bottom-right',
        width: 420,
        height: 650,
        mobileBreakpoint: 768,
        welcomeMessage: "Hello! 👋 I'm Alphy, your AI Financial Assistant with real-time market data. How can I help you today?",
        placeholderText: "Ask me anything about finance, stocks, IPOs...",
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
        multiLanguage: false
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
            duration: 750,
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
        supportedLanguages: ['en', 'fr'],
        translations: {
            en: {
                welcome: "Hello! 👋 I'm Alphy, your AI Financial Assistant with real-time market data.",
                placeholder: "Ask me anything about finance, stocks, IPOs...",
                send: "Send",
                typing: "Alphy is typing...",
                error: "Oops! Something went wrong.",
                retry: "Retry",
                clear: "Clear",
                export: "Export",
                close: "Close"
            },
            fr: {
                welcome: "Bonjour ! 👋 Je suis Alphy, votre Assistant Financier IA avec données en temps réel.",
                placeholder: "Posez-moi des questions sur la finance, actions, IPO...",
                send: "Envoyer",
                typing: "Alphy écrit...",
                error: "Oups ! Une erreur s'est produite.",
                retry: "Réessayer",
                clear: "Effacer",
                export: "Exporter",
                close: "Fermer"
            }
        }
    },

    // ============================================
    // SUGGESTIONS TEMPLATES
    // ============================================
    suggestions: {
        initial: [
            "📈 Analyze NVDA stock",
            "💰 Market overview today",
            "📊 Show trending IPOs",
            "🎯 AAPL technical analysis"
        ],
        followUp: {
            ipo: [
                "Show detailed analysis",
                "Compare with sector",
                "Risk assessment",
                "Price history"
            ],
            stock: [
                "Show technical indicators",
                "Earnings data",
                "Analyst ratings",
                "Compare with competitors"
            ],
            market: [
                "Sector performance",
                "Top gainers today",
                "Economic indicators",
                "Market sentiment"
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
        cacheExpiration: 300000,
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
            network: "Network error. Please check your connection.",
            apiKey: "API key is missing or invalid.",
            rateLimit: "Rate limit exceeded. Please wait.",
            timeout: "Request timeout. Please try again.",
            unknown: "An unexpected error occurred."
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