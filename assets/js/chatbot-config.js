/* ========================================
   CONFIGURATION DU CHATBOT
   Paramètres centralisés
   ======================================== */

const ChatbotConfig = {
    // 🔑 CLÉS API (À REMPLACER PAR VOS CLÉS)
    api: {
        gemini: 'AIzaSyDWbJhZm4hUls0t7qkwmDwrAZCJTLXXztU',
        finnhub: 'd45qhbpr01qieo4rfq9gd45qhbpr01qieo4rfqa0'
    },
    
    // 🎨 PERSONNALISATION
    branding: {
        name: 'Aurelia',
        tagline: 'Expert IA • Powered by Gemini',
        avatar: '💎',
        primaryColor: '#3b82f6',
        accentColor: '#10b981'
    },
    
    // ⚙️ PARAMÈTRES FONCTIONNELS
    features: {
        enableIPOAnalysis: true,
        enableREXAnalysis: true,
        enableComparison: true,
        enablePredictions: true,
        enableCharts: true,
        enableNews: true,
        maxHistoryMessages: 50,
        autoSaveConversation: true
    },
    
    // 📊 PARAMÈTRES DE PERFORMANCE
    performance: {
        cacheTimeout: 5 * 60 * 1000,          // 5 minutes
        maxChartDataPoints: 365,               // 1 an max
        typingIndicatorDelay: 300,             // ms
        messageAnimationDuration: 300          // ms
    },
    
    // 💬 MESSAGES PAR DÉFAUT
    messages: {
        welcome: "👋 Bonjour ! Je suis Aurelia, votre assistant financier IA. Comment puis-je vous aider ?",
        error: "😔 Désolé, une erreur s'est produite. Veuillez réessayer.",
        noData: "Aucune donnée disponible pour cette requête.",
        apiKeyMissing: "⚠️ Clé API manquante. Veuillez configurer vos clés dans chatbot-config.js"
    },
    
    // 🎯 SUGGESTIONS PAR DÉFAUT
    defaultSuggestions: [
        {
            icon: '🎯',
            text: 'Top IPOs',
            query: 'Quelles sont les 5 meilleures IPOs avec analyse complète ?'
        },
        {
            icon: '📊',
            text: 'Analyser AAPL',
            query: 'Analyse financière complète d\'Apple avec graphiques'
        },
        {
            icon: '⚖️',
            text: 'Comparer stocks',
            query: 'Compare Microsoft et Apple : revenus, marges, croissance'
        }
    ],
    
    // 📈 CONFIGURATION DES GRAPHIQUES
    charts: {
        defaultType: 'line',
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
        height: 300,
        responsive: true,
        animation: {
            duration: 750,
            easing: 'easeInOutQuart'
        }
    },
    
    // 🔒 LIMITES ET QUOTAS
    limits: {
        maxMessageLength: 2000,
        maxComparisonSymbols: 5,
        maxIPOResults: 10,
        maxYearsHistory: 10,
        rateLimit: {
            maxRequestsPerMinute: 30,
            maxRequestsPerHour: 300
        }
    },
    
    // 🌐 LANGUES SUPPORTÉES
    languages: {
        default: 'fr',
        supported: ['fr', 'en']
    },
    
    // 📱 RESPONSIVE
    responsive: {
        mobileBreakpoint: 768,
        tabletBreakpoint: 1024
    },
    
    // 🔔 NOTIFICATIONS
    notifications: {
        enableBadge: true,
        enableSound: false,
        badgeColor: '#ef4444'
    },
    
    // 📊 ANALYTICS
    analytics: {
        enabled: true,
        trackEvents: true,
        trackErrors: true,
        provider: 'custom' // 'google', 'custom', 'none'
    },
    
    // 🎨 THÈME
    theme: {
        mode: 'auto', // 'light', 'dark', 'auto'
        respectSystemPreference: true
    }
};

// Validation de la configuration
ChatbotConfig.validate = function() {
    const errors = [];
    
    if (!this.api.gemini || this.api.gemini === 'VOTRE_CLE_GEMINI_ICI') {
        errors.push('❌ Clé API Gemini manquante ou invalide');
    }
    
    if (!this.api.finnhub || this.api.finnhub === 'VOTRE_CLE_FINNHUB_ICI') {
        errors.push('⚠️ Clé API Finnhub manquante (fonctionnalités limitées)');
    }
    
    if (errors.length > 0) {
        console.warn('Configuration Chatbot - Problèmes détectés:');
        errors.forEach(err => console.warn(err));
        return false;
    }
    
    console.log('✅ Configuration Chatbot validée');
    return true;
};

// Export global
window.ChatbotConfig = ChatbotConfig;