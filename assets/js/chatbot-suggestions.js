// // ============================================
// // CHATBOT SUGGESTIONS ENGINE
// // Smart Context-Aware Suggestions
// // ============================================

// class ChatbotSuggestions {
//     constructor(config) {
//         this.config = config;
//         this.currentSuggestions = [];
//         this.suggestionHistory = [];
//         this.maxHistorySize = 20;
//     }

//     // ============================================
//     // GET INITIAL SUGGESTIONS
//     // ============================================
//     getInitialSuggestions() {
//         return this.config.suggestions.initial || [
//             "📈 Show me trending IPOs",
//             "💰 Analyze AAPL stock",
//             "📊 Market overview today",
//             "🎯 High-potential opportunities"
//         ];
//     }

//     // ============================================
//     // GET CONTEXTUAL SUGGESTIONS
//     // ============================================
//     getContextualSuggestions(intent, entities, lastResponse) {
//         let suggestions = [];

//         // Based on intent type
//         switch (intent?.type) {
//             case 'IPO_ANALYSIS':
//                 suggestions = this.getIPOSuggestions(entities);
//                 break;
                
//             case 'STOCK_ANALYSIS':
//                 suggestions = this.getStockSuggestions(entities);
//                 break;
                
//             case 'MARKET_OVERVIEW':
//                 suggestions = this.getMarketSuggestions();
//                 break;
                
//             case 'TECHNICAL_ANALYSIS':
//                 suggestions = this.getTechnicalSuggestions(entities);
//                 break;
                
//             default:
//                 suggestions = this.getInitialSuggestions();
//         }

//         // Filter out recently used suggestions
//         suggestions = this.filterRecentSuggestions(suggestions);

//         // Limit to max suggestions
//         suggestions = suggestions.slice(0, this.config.behavior.maxSuggestions);

//         // Track suggestions
//         this.trackSuggestions(suggestions);

//         return suggestions;
//     }

//     // ============================================
//     // IPO SUGGESTIONS
//     // ============================================
//     getIPOSuggestions(entities) {
//         const symbol = entities?.symbols?.[0];
        
//         if (symbol) {
//             return [
//                 `Show ${symbol} detailed metrics`,
//                 `Compare ${symbol} with similar IPOs`,
//                 `${symbol} risk assessment`,
//                 "Show other high-score IPOs"
//             ];
//         }

//         return this.config.suggestions.followUp.ipo || [
//             "Show detailed IPO analysis",
//             "Compare with similar IPOs",
//             "IPO price history",
//             "IPO risk factors"
//         ];
//     }

//     // ============================================
//     // STOCK SUGGESTIONS
//     // ============================================
//     getStockSuggestions(entities) {
//         const symbol = entities?.symbols?.[0];
        
//         if (symbol) {
//             return [
//                 `${symbol} technical indicators`,
//                 `${symbol} earnings history`,
//                 `Compare ${symbol} with competitors`,
//                 `${symbol} analyst ratings`
//             ];
//         }

//         return this.config.suggestions.followUp.stock || [
//             "Show technical indicators",
//             "Compare with sector",
//             "Show earnings data",
//             "Analyst ratings"
//         ];
//     }

//     // ============================================
//     // MARKET SUGGESTIONS
//     // ============================================
//     getMarketSuggestions() {
//         return this.config.suggestions.followUp.market || [
//             "Sector performance breakdown",
//             "Market sentiment analysis",
//             "Economic indicators",
//             "Top gainers and losers"
//         ];
//     }

//     // ============================================
//     // TECHNICAL SUGGESTIONS
//     // ============================================
//     getTechnicalSuggestions(entities) {
//         const symbol = entities?.symbols?.[0];
        
//         if (symbol) {
//             return [
//                 `${symbol} RSI analysis`,
//                 `${symbol} MACD signals`,
//                 `${symbol} support/resistance levels`,
//                 `${symbol} moving averages`
//             ];
//         }

//         return [
//             "Explain RSI indicator",
//             "What is MACD?",
//             "How to read candlestick patterns",
//             "Support and resistance explained"
//         ];
//     }

//     // ============================================
//     // DYNAMIC SUGGESTIONS
//     // ============================================
//     getDynamicSuggestions(conversationContext) {
//         const suggestions = [];
        
//         // Based on last topic
//         if (conversationContext.topic === 'ipo') {
//             suggestions.push("Show more IPO opportunities");
//         } else if (conversationContext.topic === 'stock') {
//             suggestions.push("Analyze another stock");
//         }
        
//         // Based on last symbol
//         if (conversationContext.symbol) {
//             suggestions.push(`Latest news for ${conversationContext.symbol}`);
//         }
        
//         // Time-based suggestions
//         const hour = new Date().getHours();
//         if (hour >= 9 && hour < 16) { // Market hours (EST)
//             suggestions.push("Real-time market status");
//         } else {
//             suggestions.push("After-hours movers");
//         }
        
//         // Add general exploration
//         suggestions.push("Explore trending sectors");
        
//         return suggestions;
//     }

//     // ============================================
//     // EDUCATIONAL SUGGESTIONS
//     // ============================================
//     getEducationalSuggestions() {
//         return [
//             "What is P/E ratio?",
//             "Explain EPS",
//             "How to read financial statements",
//             "What is market capitalization?",
//             "Dividend yield explained",
//             "Understanding ROE",
//             "What is Beta in stocks?",
//             "EBITDA vs Net Income"
//         ];
//     }

//     // ============================================
//     // TRENDING SUGGESTIONS
//     // ============================================
//     getTrendingSuggestions() {
//         return [
//             "AI and Tech sector analysis",
//             "Electric vehicle stocks",
//             "Renewable energy opportunities",
//             "Cloud computing leaders",
//             "Fintech innovations",
//             "Biotech breakthroughs"
//         ];
//     }

//     // ============================================
//     // FILTER RECENT SUGGESTIONS
//     // ============================================
//     filterRecentSuggestions(suggestions) {
//         // Get last 5 used suggestions
//         const recentSuggestions = this.suggestionHistory.slice(-5);
        
//         // Filter out recently used ones
//         return suggestions.filter(s => !recentSuggestions.includes(s));
//     }

//     // ============================================
//     // TRACK SUGGESTIONS
//     // ============================================
//     trackSuggestions(suggestions) {
//         this.currentSuggestions = suggestions;
        
//         // Add to history
//         this.suggestionHistory.push(...suggestions);
        
//         // Limit history size
//         if (this.suggestionHistory.length > this.maxHistorySize) {
//             this.suggestionHistory = this.suggestionHistory.slice(-this.maxHistorySize);
//         }
//     }

//     // ============================================
//     // SUGGESTION CLICKED
//     // ============================================
//     onSuggestionClicked(suggestion) {
//         console.log('Suggestion clicked:', suggestion);
        
//         // Analytics tracking
//         if (this.config.analytics.enabled) {
//             this.trackAnalytics('suggestion_clicked', { suggestion });
//         }
//     }

//     // ============================================
//     // ANALYTICS
//     // ============================================
//     trackAnalytics(eventName, data) {
//         // Implement analytics tracking here
//         console.log('Analytics:', eventName, data);
//     }

//     // ============================================
//     // CLEAR HISTORY
//     // ============================================
//     clearHistory() {
//         this.suggestionHistory = [];
//         this.currentSuggestions = [];
//     }

//     // ============================================
//     // GET SUGGESTION STATS
//     // ============================================
//     getStats() {
//         return {
//             totalSuggestionsShown: this.suggestionHistory.length,
//             currentSuggestions: this.currentSuggestions.length,
//             uniqueSuggestions: new Set(this.suggestionHistory).size
//         };
//     }
// }

// // ============================================
// // EXPORT
// // ============================================
// if (typeof module !== 'undefined' && module.exports) {
//     module.exports = ChatbotSuggestions;
// }

/**
 * ═══════════════════════════════════════════════════════════════
 * CHATBOT SUGGESTIONS - Intelligent Contextual Suggestions
 * ═══════════════════════════════════════════════════════════════
 * Version: 3.0.0
 * Description: Suggestions contextuelles intelligentes adaptées à l'utilisateur
 * Features:
 *   - Suggestions par intent (IPO, Stock, Market, Budget, Forex)
 *   - Adaptation selon l'historique utilisateur
 *   - Smart follow-up questions
 */

class ChatbotSuggestions {
    constructor(config) {
        this.config = config;
        this.userHistory = [];
        this.popularSymbols = [
            'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 
            'BRK.B', 'V', 'JNJ', 'WMT', 'JPM', 'PG', 'MA', 'HD'
        ];
        
        this.suggestionsByIntent = {
            INITIAL: [
                "📊 Analyze a stock (e.g., 'Analyze AAPL')",
                "📈 Show me recent IPOs",
                "💱 Check forex rates (e.g., 'EUR/USD analysis')",
                "📋 Help me with my budget",
                "🔍 Show insider trading activity"
            ],
            STOCK_ANALYSIS: [
                "📊 Compare with another stock",
                "📈 Show technical indicators",
                "💰 What's the AI recommendation?",
                "⏱ Show 5-year performance",
                "🎯 Set a price alert"
            ],
            IPO_ANALYSIS: [
                "📊 Show IPO calendar for this month",
                "🔥 Which IPOs have the best scores?",
                "📈 Analyze a specific IPO",
                "💼 Compare recent IPOs",
                "⭐ Show top-rated IPOs"
            ],
            MA_ANALYSIS: [
                "📊 Show recent M&A deals",
                "🎯 Analyze merger probability",
                "💰 Show deal values",
                "📈 Compare M&A activity by sector",
                "🔍 Search for specific company deals"
            ],
            INSIDER_TRADING: [
                "📊 Show insider buying trends",
                "🔥 Which stocks have unusual insider activity?",
                "📈 Show insider transactions for a specific stock",
                "💼 Compare insider sentiment",
                "⭐ Show top insider buys this week"
            ],
            FOREX_ANALYSIS: [
                "💱 Show major currency pairs",
                "📊 EUR/USD technical analysis",
                "📈 Show currency strength radar",
                "🔥 Which currencies are strongest today?",
                "📉 Show correlation matrix"
            ],
            BUDGET_MANAGEMENT: [
                "💰 Show my budget overview",
                "📊 Track monthly expenses",
                "📈 Optimize my savings plan",
                "🎯 Set investment goals",
                "💼 Calculate ROI projections"
            ],
            MARKET_OVERVIEW: [
                "📊 Show S&P 500 performance",
                "📈 Analyze tech sector",
                "🔥 Which sectors are outperforming?",
                "💼 Show market breadth indicators",
                "⭐ Top gainers and losers today"
            ],
            TECHNICAL_ANALYSIS: [
                "📊 Show all technical indicators",
                "📈 What does RSI indicate?",
                "🔥 Are we overbought or oversold?",
                "💼 Show MACD signal",
                "⭐ Explain Bollinger Bands"
            ]
        };
        
        console.log('💡 ChatbotSuggestions initialized');
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * GET SUGGESTIONS (Main Method)
     * ═══════════════════════════════════════════════════════════
     */
    getSuggestions(currentIntent = 'INITIAL', context = {}) {
        console.log(`💡 Generating suggestions for intent: ${currentIntent}`);

        // Get base suggestions for the intent
        let suggestions = this.suggestionsByIntent[currentIntent] || this.suggestionsByIntent.INITIAL;

        // Personalize based on user history
        if (this.userHistory.length > 0) {
            suggestions = this.personalizeWithHistory(suggestions, context);
        }

        // Add contextual suggestions based on entities
        if (context.symbols && context.symbols.length > 0) {
            suggestions = this.addSymbolContextSuggestions(suggestions, context.symbols);
        }

        // Limit to 5 suggestions
        return suggestions.slice(0, 5);
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * PERSONALIZE WITH HISTORY
     * ═══════════════════════════════════════════════════════════
     */
    personalizeWithHistory(suggestions, context) {
        const recentIntents = this.userHistory
            .slice(-5)
            .map(item => item.intent)
            .filter(intent => intent);

        // If user frequently analyzes stocks, suggest popular symbols
        const stockAnalysisCount = recentIntents.filter(i => i === 'STOCK_ANALYSIS').length;
        if (stockAnalysisCount >= 2) {
            const randomSymbol = this.popularSymbols[Math.floor(Math.random() * this.popularSymbols.length)];
            suggestions = [
                `📊 Analyze ${randomSymbol}`,
                ...suggestions.slice(0, 4)
            ];
        }

        // If user is interested in IPOs
        const ipoCount = recentIntents.filter(i => i === 'IPO_ANALYSIS').length;
        if (ipoCount >= 1) {
            suggestions = [
                "📈 Show this week's IPO calendar",
                ...suggestions.slice(0, 4)
            ];
        }

        return suggestions;
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * ADD SYMBOL CONTEXT SUGGESTIONS
     * ═══════════════════════════════════════════════════════════
     */
    addSymbolContextSuggestions(suggestions, symbols) {
        if (symbols.length === 0) return suggestions;

        const symbol = symbols[0];

        const contextualSuggestions = [
            `📊 Show ${symbol} technical indicators`,
            `📈 Compare ${symbol} with sector peers`,
            `💰 What's the price target for ${symbol}?`,
            `⏱ Show ${symbol} 1-year trend`
        ];

        // Mix contextual suggestions with base suggestions
        return [
            contextualSuggestions[0],
            contextualSuggestions[1],
            ...suggestions.slice(0, 3)
        ];
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * GET FOLLOW-UP QUESTIONS
     * ═══════════════════════════════════════════════════════════
     */
    getFollowUpQuestions(lastResponse, context = {}) {
        const intent = context.lastIntent || 'INITIAL';

        const followUps = {
            STOCK_ANALYSIS: [
                "Would you like to see the AI recommendation?",
                "Should I compare this with another stock?",
                "Do you want to see insider trading activity?",
                "Would you like technical indicator details?"
            ],
            IPO_ANALYSIS: [
                "Would you like to see the IPO scoring breakdown?",
                "Should I show you similar IPOs?",
                "Do you want to set an alert for this IPO?",
                "Would you like to see the company's financials?"
            ],
            FOREX_ANALYSIS: [
                "Would you like to see other currency pairs?",
                "Should I show you the technical indicators?",
                "Do you want correlation analysis?",
                "Would you like to see economic calendar events?"
            ],
            BUDGET_MANAGEMENT: [
                "Would you like to optimize your budget?",
                "Should I show you savings projections?",
                "Do you want to add a new expense category?",
                "Would you like to see ROI calculations?"
            ],
            MARKET_OVERVIEW: [
                "Would you like sector-specific analysis?",
                "Should I show you top gainers/losers?",
                "Do you want to see market breadth indicators?",
                "Would you like economic calendar highlights?"
            ]
        };

        return followUps[intent] || followUps.STOCK_ANALYSIS;
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * ADD TO USER HISTORY
     * ═══════════════════════════════════════════════════════════
     */
    addToHistory(message, intent, entities = {}) {
        this.userHistory.push({
            message,
            intent,
            entities,
            timestamp: Date.now()
        });

        // Keep only last 20 interactions
        if (this.userHistory.length > 20) {
            this.userHistory = this.userHistory.slice(-20);
        }

        console.log(`📝 Added to history: ${intent} (Total: ${this.userHistory.length})`);
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * GET QUICK ACTIONS (Buttons)
     * ═══════════════════════════════════════════════════════════
     */
    getQuickActions(context = {}) {
        const baseActions = [
            { text: "📊 Popular Stocks", action: "show_popular_stocks" },
            { text: "📈 Recent IPOs", action: "show_recent_ipos" },
            { text: "💱 Forex Rates", action: "show_forex_rates" },
            { text: "📋 My Budget", action: "show_budget" },
            { text: "🔍 Insider Activity", action: "show_insider_activity" }
        ];

        // Add contextual actions if symbol is present
        if (context.symbols && context.symbols.length > 0) {
            const symbol = context.symbols[0];
            return [
                { text: `📊 Analyze ${symbol}`, action: `analyze_${symbol}` },
                { text: `📈 ${symbol} Indicators`, action: `indicators_${symbol}` },
                ...baseActions.slice(0, 3)
            ];
        }

        return baseActions;
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * GET TRENDING TOPICS
     * ═══════════════════════════════════════════════════════════
     */
    getTrendingTopics() {
        return [
            {
                topic: "AI & Tech Stocks",
                description: "Analysis of NVDA, MSFT, GOOGL",
                keywords: ["NVDA", "AI", "semiconductors"]
            },
            {
                topic: "Recent IPOs",
                description: "Top-rated IPOs this month",
                keywords: ["IPO", "new listings"]
            },
            {
                topic: "Forex Volatility",
                description: "Major currency pairs analysis",
                keywords: ["EUR/USD", "forex", "volatility"]
            },
            {
                topic: "Insider Buying",
                description: "Unusual insider activity alerts",
                keywords: ["insider", "Form 4", "buying"]
            },
            {
                topic: "M&A Activity",
                description: "Recent merger announcements",
                keywords: ["merger", "acquisition", "M&A"]
            }
        ];
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * GET SMART PROMPTS (Example Queries)
     * ═══════════════════════════════════════════════════════════
     */
    getSmartPrompts() {
        return [
            "Show me NVDA technical analysis",
            "What are the best IPOs this month?",
            "Analyze insider trading for AAPL",
            "Show EUR/USD forex indicators",
            "Help me optimize my budget",
            "Compare MSFT and GOOGL",
            "What's the AI recommendation for TSLA?",
            "Show recent M&A deals in tech sector",
            "Which stocks have unusual insider buying?",
            "Explain RSI indicator for beginners"
        ];
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * GET HELP SUGGESTIONS
     * ═══════════════════════════════════════════════════════════
     */
    getHelpSuggestions() {
        return [
            {
                category: "Stock Analysis",
                examples: [
                    "Analyze AAPL",
                    "Show me NVDA indicators",
                    "Compare MSFT and GOOGL"
                ]
            },
            {
                category: "IPO Intelligence",
                examples: [
                    "Show recent IPOs",
                    "Best IPOs this month",
                    "IPO calendar"
                ]
            },
            {
                category: "Insider Trading",
                examples: [
                    "Show insider activity for TSLA",
                    "Unusual insider buying",
                    "Recent Form 4 filings"
                ]
            },
            {
                category: "Forex Analysis",
                examples: [
                    "EUR/USD analysis",
                    "Show major currency pairs",
                    "Currency strength radar"
                ]
            },
            {
                category: "Budget Management",
                examples: [
                    "Show my budget",
                    "Optimize savings",
                    "Calculate ROI"
                ]
            }
        ];
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * CLEAR USER HISTORY
     * ═══════════════════════════════════════════════════════════
     */
    clearHistory() {
        this.userHistory = [];
        console.log('🗑 User history cleared');
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * GET USER PREFERENCES (Based on History)
     * ═══════════════════════════════════════════════════════════
     */
    getUserPreferences() {
        if (this.userHistory.length === 0) {
            return {
                favoriteIntent: 'UNKNOWN',
                favoriteSymbols: [],
                preferredTimeframe: '1y'
            };
        }

        // Count intents
        const intentCounts = {};
        this.userHistory.forEach(item => {
            intentCounts[item.intent] = (intentCounts[item.intent] || 0) + 1;
        });

        const favoriteIntent = Object.entries(intentCounts)
            .sort((a, b) => b[1] - a[1])[0][0];

        // Extract favorite symbols
        const symbolCounts = {};
        this.userHistory.forEach(item => {
            if (item.entities && item.entities.symbols) {
                item.entities.symbols.forEach(symbol => {
                    symbolCounts[symbol] = (symbolCounts[symbol] || 0) + 1;
                });
            }
        });

        const favoriteSymbols = Object.entries(symbolCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(entry => entry[0]);

        return {
            favoriteIntent,
            favoriteSymbols,
            preferredTimeframe: '1y',  // Can be enhanced with actual tracking
            totalInteractions: this.userHistory.length
        };
    }
}

// ═══════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChatbotSuggestions;
}

if (typeof window !== 'undefined') {
    window.ChatbotSuggestions = ChatbotSuggestions;
}

console.log('✅ ChatbotSuggestions loaded');