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
            // IMPORTANT: Replace with your actual Gemini API key
            apiKey: 'AIzaSyDWbJhZm4hUls0t7qkwmDwrAZCJTLXXztU',
            endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
            model: 'gemini-2.5-flash',
            // Supercharged parameters for premium responses
            maxOutputTokens: 8192, // 4x increase from default 2048
            temperature: 0.85, // Higher creativity while maintaining accuracy
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
            // IMPORTANT: Replace with your actual Finnhub API key
            apiKey: 'd45qhbpr01qieo4rfq9gd45qhbpr01qieo4rfqa0',
            endpoint: 'https://finnhub.io/api/v1',
            websocket: 'wss://ws.finnhub.io'
        },
        
        twelveData: {
            // Optional: For advanced market data
            apiKey: '57e3c785fda7424d97ab195f22263765',
            endpoint: 'https://api.twelvedata.com'
        }
    },

    // ============================================
    // CHATBOT BEHAVIOR
    // ============================================
    behavior: {
        // Response timing
        typingDelay: 1500, // ms - simulated typing time
        responseDelay: 300, // ms - delay before showing response
        
        // Message limits
        maxMessageLength: 2000,
        maxHistorySize: 50,
        
        // Auto-suggestions
        showSuggestions: true,
        suggestionsDelay: 500,
        maxSuggestions: 4,
        
        // Chart generation
        autoGenerateCharts: true,
        chartAnimationDuration: 750,
        
        // Debouncing
        inputDebounce: 300, // ms
        
        // Virtual scrolling
        virtualScrollThreshold: 100,
        
        // Performance
        enableLazyLoading: true,
        enableWebWorkers: true,
        enableServiceWorker: true
    },

    // ============================================
    // UI CUSTOMIZATION
    // ============================================
    ui: {
        theme: 'futuristic', // futuristic | classic | minimal
        primaryColor: '#667eea',
        accentColor: '#764ba2',
        
        // Avatar emojis
        botAvatar: '🤖',
        userAvatar: '👤',
        
        // Animations
        enableAnimations: true,
        enableParticles: true,
        particleCount: 50,
        
        // Position
        position: 'bottom-right', // bottom-right | bottom-left | top-right | top-left
        
        // Size
        width: 420,
        height: 650,
        mobileBreakpoint: 768,
        
        // Messages
        welcomeMessage: "Hello! 👋 I'm your AI Financial Assistant. How can I help you today?",
        placeholderText: "Ask me anything about finance, IPOs, market analysis...",
        
        // Timestamps
        showTimestamps: true,
        timestampFormat: 'HH:mm' // 24-hour format
    },

    // ============================================
    // FEATURES FLAGS
    // ============================================
    features: {
        ipoAnalysis: true,
        marketData: true,
        chartGeneration: true,
        technicalIndicators: true,
        sentimentAnalysis: true,
        portfolioTracking: false, // Premium feature
        realTimeAlerts: false, // Premium feature
        exportConversation: true,
        voiceInput: false, // Future feature
        multiLanguage: false // Future feature
    },

    // ============================================
    // IPO ANALYZER SETTINGS
    // ============================================
    ipo: {
        // Scoring weights (must sum to 1.0)
        weights: {
            financial: 0.30,
            market: 0.25,
            valuation: 0.20,
            growth: 0.15,
            momentum: 0.10
        },
        
        // Thresholds
        highPotentialThreshold: 75,
        mediumPotentialThreshold: 60,
        
        // Data refresh
        cacheTimeout: 3600000, // 1 hour in ms
        
        // Analysis depth
        lookbackPeriod: 90, // days
        minDataPoints: 10
    },

    // ============================================
    // CHART SETTINGS
    // ============================================
    charts: {
        defaultType: 'line', // line | bar | candlestick | area
        
        // Colors
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
        
        // Animation
        animation: {
            duration: 750,
            easing: 'easeInOutQuart'
        },
        
        // Interactions
        enableZoom: true,
        enablePan: true,
        enableTooltip: true,
        enableLegend: true,
        
        // Technical indicators
        indicators: {
            sma: { periods: [20, 50, 200] },
            ema: { periods: [12, 26] },
            rsi: { period: 14, overbought: 70, oversold: 30 },
            macd: { fast: 12, slow: 26, signal: 9 },
            bollingerBands: { period: 20, stdDev: 2 }
        },
        
        // Export
        exportFormats: ['png', 'svg', 'csv']
    },

    // ============================================
    // ANALYTICS
    // ============================================
    analytics: {
        enabled: false, // Set to true to enable analytics
        trackingId: '', // Google Analytics ID
        events: {
            messagesSent: true,
            chartsGenerated: true,
            suggestionsClicked: true,
            errorsOccurred: true
        }
    },

    // ============================================
    // LOCALIZATION (i18n)
    // ============================================
    localization: {
        defaultLanguage: 'en',
        supportedLanguages: ['en', 'fr', 'es', 'de'],
        translations: {
            en: {
                welcome: "Hello! 👋 I'm your AI Financial Assistant. How can I help you today?",
                placeholder: "Ask me anything about finance, IPOs, market analysis...",
                send: "Send",
                typing: "AI is typing...",
                error: "Oops! Something went wrong. Please try again.",
                retry: "Retry",
                clear: "Clear",
                export: "Export",
                close: "Close"
            },
            fr: {
                welcome: "Bonjour ! 👋 Je suis votre Assistant Financier IA. Comment puis-je vous aider aujourd'hui ?",
                placeholder: "Posez-moi des questions sur la finance, les IPO, l'analyse de marché...",
                send: "Envoyer",
                typing: "L'IA est en train d'écrire...",
                error: "Oups ! Quelque chose s'est mal passé. Veuillez réessayer.",
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
            "📈 Show me trending IPOs",
            "💰 Analyze AAPL stock",
            "📊 Market overview today",
            "🎯 High-potential opportunities"
        ],
        
        followUp: {
            ipo: [
                "Show detailed analysis",
                "Compare with similar IPOs",
                "Show price history",
                "Risk assessment"
            ],
            stock: [
                "Show technical indicators",
                "Compare with sector",
                "Show earnings data",
                "Analyst ratings"
            ],
            market: [
                "Sector performance",
                "Market sentiment",
                "Economic indicators",
                "Top movers"
            ]
        }
    },

    // ============================================
    // PERFORMANCE OPTIMIZATION
    // ============================================
    performance: {
        // Lazy loading
        lazyLoadImages: true,
        lazyLoadCharts: true,
        
        // Caching
        enableCache: true,
        cacheExpiration: 3600000, // 1 hour
        
        // Compression
        compressMessages: false,
        
        // Web Workers
        useWebWorkers: true,
        maxWorkers: 2,
        
        // Request batching
        batchRequests: true,
        batchDelay: 100, // ms
        
        // Throttling
        maxRequestsPerMinute: 30,
        
        // Virtual scrolling
        virtualScrollItemHeight: 80,
        virtualScrollBuffer: 5
    },

    // ============================================
    // ERROR HANDLING
    // ============================================
    errors: {
        maxRetries: 3,
        retryDelay: 1000, // ms
        showUserFriendlyMessages: true,
        logErrors: true,
        
        messages: {
            network: "Network error. Please check your connection.",
            apiKey: "API key is missing or invalid.",
            rateLimit: "Rate limit exceeded. Please wait a moment.",
            timeout: "Request timeout. Please try again.",
            unknown: "An unexpected error occurred. Please try again."
        }
    },

    // ============================================
    // DEVELOPMENT
    // ============================================
    development: {
        debugMode: false, // Set to true for detailed console logs
        mockApiResponses: false, // Use mock data instead of real APIs
        showPerformanceMetrics: false,
        enableHotReload: false
    }
};

// ============================================
// EXPORT CONFIGURATION
// ============================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChatbotConfig;
}