// ============================================
// CHATBOT SUGGESTIONS ENGINE
// Smart Context-Aware Suggestions
// ============================================

class ChatbotSuggestions {
    constructor(config) {
        this.config = config;
        this.currentSuggestions = [];
        this.suggestionHistory = [];
        this.maxHistorySize = 20;
    }

    // ============================================
    // GET INITIAL SUGGESTIONS
    // ============================================
    getInitialSuggestions() {
        return this.config.suggestions.initial || [
            "📈 Show me trending IPOs",
            "💰 Analyze AAPL stock",
            "📊 Market overview today",
            "🎯 High-potential opportunities"
        ];
    }

    // ============================================
    // GET CONTEXTUAL SUGGESTIONS
    // ============================================
    getContextualSuggestions(intent, entities, lastResponse) {
        let suggestions = [];

        // Based on intent type
        switch (intent?.type) {
            case 'IPO_ANALYSIS':
                suggestions = this.getIPOSuggestions(entities);
                break;
                
            case 'STOCK_ANALYSIS':
                suggestions = this.getStockSuggestions(entities);
                break;
                
            case 'MARKET_OVERVIEW':
                suggestions = this.getMarketSuggestions();
                break;
                
            case 'TECHNICAL_ANALYSIS':
                suggestions = this.getTechnicalSuggestions(entities);
                break;
                
            default:
                suggestions = this.getInitialSuggestions();
        }

        // Filter out recently used suggestions
        suggestions = this.filterRecentSuggestions(suggestions);

        // Limit to max suggestions
        suggestions = suggestions.slice(0, this.config.behavior.maxSuggestions);

        // Track suggestions
        this.trackSuggestions(suggestions);

        return suggestions;
    }

    // ============================================
    // IPO SUGGESTIONS
    // ============================================
    getIPOSuggestions(entities) {
        const symbol = entities?.symbols?.[0];
        
        if (symbol) {
            return [
                `Show ${symbol} detailed metrics`,
                `Compare ${symbol} with similar IPOs`,
                `${symbol} risk assessment`,
                "Show other high-score IPOs"
            ];
        }

        return this.config.suggestions.followUp.ipo || [
            "Show detailed IPO analysis",
            "Compare with similar IPOs",
            "IPO price history",
            "IPO risk factors"
        ];
    }

    // ============================================
    // STOCK SUGGESTIONS
    // ============================================
    getStockSuggestions(entities) {
        const symbol = entities?.symbols?.[0];
        
        if (symbol) {
            return [
                `${symbol} technical indicators`,
                `${symbol} earnings history`,
                `Compare ${symbol} with competitors`,
                `${symbol} analyst ratings`
            ];
        }

        return this.config.suggestions.followUp.stock || [
            "Show technical indicators",
            "Compare with sector",
            "Show earnings data",
            "Analyst ratings"
        ];
    }

    // ============================================
    // MARKET SUGGESTIONS
    // ============================================
    getMarketSuggestions() {
        return this.config.suggestions.followUp.market || [
            "Sector performance breakdown",
            "Market sentiment analysis",
            "Economic indicators",
            "Top gainers and losers"
        ];
    }

    // ============================================
    // TECHNICAL SUGGESTIONS
    // ============================================
    getTechnicalSuggestions(entities) {
        const symbol = entities?.symbols?.[0];
        
        if (symbol) {
            return [
                `${symbol} RSI analysis`,
                `${symbol} MACD signals`,
                `${symbol} support/resistance levels`,
                `${symbol} moving averages`
            ];
        }

        return [
            "Explain RSI indicator",
            "What is MACD?",
            "How to read candlestick patterns",
            "Support and resistance explained"
        ];
    }

    // ============================================
    // DYNAMIC SUGGESTIONS
    // ============================================
    getDynamicSuggestions(conversationContext) {
        const suggestions = [];
        
        // Based on last topic
        if (conversationContext.topic === 'ipo') {
            suggestions.push("Show more IPO opportunities");
        } else if (conversationContext.topic === 'stock') {
            suggestions.push("Analyze another stock");
        }
        
        // Based on last symbol
        if (conversationContext.symbol) {
            suggestions.push(`Latest news for ${conversationContext.symbol}`);
        }
        
        // Time-based suggestions
        const hour = new Date().getHours();
        if (hour >= 9 && hour < 16) { // Market hours (EST)
            suggestions.push("Real-time market status");
        } else {
            suggestions.push("After-hours movers");
        }
        
        // Add general exploration
        suggestions.push("Explore trending sectors");
        
        return suggestions;
    }

    // ============================================
    // EDUCATIONAL SUGGESTIONS
    // ============================================
    getEducationalSuggestions() {
        return [
            "What is P/E ratio?",
            "Explain EPS",
            "How to read financial statements",
            "What is market capitalization?",
            "Dividend yield explained",
            "Understanding ROE",
            "What is Beta in stocks?",
            "EBITDA vs Net Income"
        ];
    }

    // ============================================
    // TRENDING SUGGESTIONS
    // ============================================
    getTrendingSuggestions() {
        return [
            "AI and Tech sector analysis",
            "Electric vehicle stocks",
            "Renewable energy opportunities",
            "Cloud computing leaders",
            "Fintech innovations",
            "Biotech breakthroughs"
        ];
    }

    // ============================================
    // FILTER RECENT SUGGESTIONS
    // ============================================
    filterRecentSuggestions(suggestions) {
        // Get last 5 used suggestions
        const recentSuggestions = this.suggestionHistory.slice(-5);
        
        // Filter out recently used ones
        return suggestions.filter(s => !recentSuggestions.includes(s));
    }

    // ============================================
    // TRACK SUGGESTIONS
    // ============================================
    trackSuggestions(suggestions) {
        this.currentSuggestions = suggestions;
        
        // Add to history
        this.suggestionHistory.push(...suggestions);
        
        // Limit history size
        if (this.suggestionHistory.length > this.maxHistorySize) {
            this.suggestionHistory = this.suggestionHistory.slice(-this.maxHistorySize);
        }
    }

    // ============================================
    // SUGGESTION CLICKED
    // ============================================
    onSuggestionClicked(suggestion) {
        console.log('Suggestion clicked:', suggestion);
        
        // Analytics tracking
        if (this.config.analytics.enabled) {
            this.trackAnalytics('suggestion_clicked', { suggestion });
        }
    }

    // ============================================
    // ANALYTICS
    // ============================================
    trackAnalytics(eventName, data) {
        // Implement analytics tracking here
        console.log('Analytics:', eventName, data);
    }

    // ============================================
    // CLEAR HISTORY
    // ============================================
    clearHistory() {
        this.suggestionHistory = [];
        this.currentSuggestions = [];
    }

    // ============================================
    // GET SUGGESTION STATS
    // ============================================
    getStats() {
        return {
            totalSuggestionsShown: this.suggestionHistory.length,
            currentSuggestions: this.currentSuggestions.length,
            uniqueSuggestions: new Set(this.suggestionHistory).size
        };
    }
}

// ============================================
// EXPORT
// ============================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChatbotSuggestions;
}