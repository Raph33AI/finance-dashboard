// ============================================
// FINANCIAL CHATBOT - CONFIGURATION
// Version Conversationnelle Ultra-Performante v3.1
// ✅ CORRECTION: Détection thème dark/light pour couleurs de graphiques
// ============================================

const ChatbotConfig = {
    api: {
        // ✅ WORKER CLOUDFLARE EXISTANT (Finnhub + Twelve Data)
        worker: {
            baseUrl: 'https://finance-hub-api.raphnardone.workers.dev',
            endpoints: {
                finnhub: '/api/finnhub',
                twelvedata: '/api/twelvedata',
                // ✅ Endpoints directs pour compatibilité
                quote: '/api/quote',
                timeSeries: '/api/time-series',
                profile: '/api/profile',
                companyProfile: '/api/finnhub/company-profile',
                basicFinancials: '/api/finnhub/basic-financials'
            }
        },
        
        // ✅ WORKER GEMINI
        gemini: {
            apiKey: '',
            workerUrl: 'https://gemini-ai-proxy.raphnardone.workers.dev/api/gemini',
            model: 'gemini-2.5-flash',
            maxOutputTokens: 8192,
            temperature: 0.9,
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
            apiKey: '',
            endpoint: 'https://finnhub.io/api/v1',
            websocket: 'wss://ws.finnhub.io'
        },
        
        twelveData: {
            apiKey: '',
            endpoint: 'https://api.twelvedata.com'
        }
    },

    // ============================================
    // CHATBOT BEHAVIOR
    // ============================================
    behavior: {
        typingDelay: 1200,
        responseDelay: 200,
        maxMessageLength: 2000,
        
        maxHistorySize: 100,
        conversationMemorySize: 20,
        
        showSuggestions: true,
        suggestionsDelay: 400,
        maxSuggestions: 4,
        
        autoGenerateCharts: true,
        chartAnimationDuration: 600,
        
        inputDebounce: 200,
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
        
        contextualMemory: true,
        smartSuggestions: true,
        adaptiveResponses: true
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
    // CHART SETTINGS (✅ CORRECTION MAJEURE)
    // ============================================
    charts: {
        defaultType: 'line',
        
        // ✅ CORRECTION: Couleurs adaptatives selon le thème
        colors: {
            // Fonction pour obtenir les couleurs selon le thème
            getColors: function() {
                const isDarkMode = document.body.classList.contains('dark-mode');
                
                if (isDarkMode) {
                    return {
                        primary: '#667eea',
                        secondary: '#764ba2',
                        success: '#38ef7d',
                        danger: '#f45c43',
                        warning: '#ffbe0b',
                        info: '#00d9ff',
                        grid: 'rgba(255, 255, 255, 0.1)',
                        text: 'rgba(255, 255, 255, 0.9)', // Blanc en dark mode
                        background: 'rgba(15, 23, 42, 0.95)'
                    };
                } else {
                    return {
                        primary: '#667eea',
                        secondary: '#764ba2',
                        success: '#10b981',
                        danger: '#ef4444',
                        warning: '#f59e0b',
                        info: '#06b6d4',
                        grid: 'rgba(0, 0, 0, 0.08)',
                        text: 'rgba(30, 41, 59, 0.9)', // ✅ NOIR en light mode
                        background: 'rgba(255, 255, 255, 0.98)'
                    };
                }
            },
            
            // ✅ Valeurs par défaut (light mode) pour compatibilité
            primary: '#667eea',
            secondary: '#764ba2',
            success: '#10b981',
            danger: '#ef4444',
            warning: '#f59e0b',
            info: '#06b6d4',
            grid: 'rgba(0, 0, 0, 0.08)',
            text: 'rgba(30, 41, 59, 0.9)', // ✅ PAR DÉFAUT: NOIR (light mode)
            background: 'rgba(255, 255, 255, 0.98)'
        },
        
        animation: {
            duration: 600,
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
        debugMode: true,
        mockApiResponses: false,
        showPerformanceMetrics: true,
        enableHotReload: false
    }
};

// ============================================
// ✅ HELPER: Détection thème et mise à jour couleurs
// ============================================
ChatbotConfig.updateChartColors = function() {
    const colors = this.charts.colors.getColors();
    
    // Mettre à jour les couleurs dans l'objet
    Object.assign(this.charts.colors, colors);
    
    console.log('🎨 Chart colors updated for theme:', document.body.classList.contains('dark-mode') ? 'DARK' : 'LIGHT');
    console.log('   Text color:', this.charts.colors.text);
    console.log('   Grid color:', this.charts.colors.grid);
    
    return colors;
};

// ✅ Observer les changements de thème
if (typeof window !== 'undefined') {
    const observer = new MutationObserver(() => {
        ChatbotConfig.updateChartColors();
        
        // ✅ Rafraîchir Chart.js defaults si disponible
        if (typeof Chart !== 'undefined') {
            Chart.defaults.color = ChatbotConfig.charts.colors.text;
            Chart.defaults.borderColor = ChatbotConfig.charts.colors.grid;
            console.log('✅ Chart.js defaults updated');
        }
    });
    
    observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['class']
    });
    
    // ✅ Initialisation au chargement
    document.addEventListener('DOMContentLoaded', () => {
        ChatbotConfig.updateChartColors();
    });
}

// ============================================
// EXPORT & GLOBAL AVAILABILITY
// ============================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChatbotConfig;
}

window.ChatbotConfig = ChatbotConfig;

console.log('✅ ChatbotConfig v3.1 loaded - Adaptive Chart Colors enabled');