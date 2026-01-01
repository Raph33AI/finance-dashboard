// /**
//  * ═══════════════════════════════════════════════════════════════
//  * CHATBOT SUGGESTIONS - Intelligent Contextual Suggestions
//  * ═══════════════════════════════════════════════════════════════
//  * Version: 3.1.0 - CORRECTED (getInitialSuggestions + getContextualSuggestions)
//  * Description: Suggestions contextuelles intelligentes adaptées à l'utilisateur
//  * Features:
//  *   - Suggestions par intent (IPO, Stock, Market, Budget, Forex)
//  *   - Adaptation selon l'historique utilisateur
//  *   - Smart follow-up questions
//  */

// class ChatbotSuggestions {
//     constructor(config) {
//         this.config = config;
//         this.userHistory = [];
//         this.popularSymbols = [
//             'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 
//             'BRK.B', 'V', 'JNJ', 'WMT', 'JPM', 'PG', 'MA', 'HD'
//         ];
        
//         this.suggestionsByIntent = {
//             INITIAL: [
//                 "Analyze a stock (e.g., 'Analyze AAPL')",
//                 "Show me recent IPOs",
//                 "Check forex rates (e.g., 'EUR/USD analysis')",
//                 "Help me with my budget",
//                 "Show insider trading activity"
//             ],
//             STOCK_ANALYSIS: [
//                 "Compare with another stock",
//                 "Show technical indicators",
//                 "What's the AI recommendation?",
//                 "Show 5-year performance",
//                 "Set a price alert"
//             ],
//             IPO_ANALYSIS: [
//                 "Show IPO calendar for this month",
//                 "Which IPOs have the best scores?",
//                 "Analyze a specific IPO",
//                 "Compare recent IPOs",
//                 "Show top-rated IPOs"
//             ],
//             MA_ANALYSIS: [
//                 "Show recent M&A deals",
//                 "Analyze merger probability",
//                 "Show deal values",
//                 "Compare M&A activity by sector",
//                 "Search for specific company deals"
//             ],
//             INSIDER_TRADING: [
//                 "Show insider buying trends",
//                 "Which stocks have unusual insider activity?",
//                 "Show insider transactions for a specific stock",
//                 "Compare insider sentiment",
//                 "Show top insider buys this week"
//             ],
//             FOREX_ANALYSIS: [
//                 "Show major currency pairs",
//                 "EUR/USD technical analysis",
//                 "Show currency strength radar",
//                 "Which currencies are strongest today?",
//                 "Show correlation matrix"
//             ],
//             BUDGET_MANAGEMENT: [
//                 "Show my budget overview",
//                 "Track monthly expenses",
//                 "Optimize my savings plan",
//                 "Set investment goals",
//                 "Calculate ROI projections"
//             ],
//             MARKET_OVERVIEW: [
//                 "Show S&P 500 performance",
//                 "Analyze tech sector",
//                 "Which sectors are outperforming?",
//                 "Show market breadth indicators",
//                 "Top gainers and losers today"
//             ],
//             TECHNICAL_ANALYSIS: [
//                 "Show all technical indicators",
//                 "What does RSI indicate?",
//                 "Are we overbought or oversold?",
//                 "Show MACD signal",
//                 "Explain Bollinger Bands"
//             ],
//             PRICE_HISTORY: [
//                 "Show different timeframe",
//                 "Compare with benchmark",
//                 "Analyze volatility",
//                 "Show moving averages",
//                 "What caused recent price changes?"
//             ]
//         };
        
//         console.log('💡 ChatbotSuggestions initialized');
//     }

//     /**
//      * ═══════════════════════════════════════════════════════════
//      * GET INITIAL SUGGESTIONS (Welcome Screen)
//      * ✅ NOUVELLE MÉTHODE REQUISE PAR chatbot-fullpage-ui.js
//      * ═══════════════════════════════════════════════════════════
//      */
//     getInitialSuggestions() {
//         console.log('💡 Generating initial suggestions (welcome screen)');
        
//         return this.suggestionsByIntent.INITIAL || [
//             "Analyze a stock (e.g., 'Analyze AAPL')",
//             "Show me recent IPOs",
//             "Check forex rates (e.g., 'EUR/USD analysis')",
//             "Help me with my budget",
//             "Show insider trading activity"
//         ];
//     }

//     /**
//      * ═══════════════════════════════════════════════════════════
//      * GET CONTEXTUAL SUGGESTIONS (After AI Response)
//      * ✅ NOUVELLE MÉTHODE REQUISE PAR chatbot-fullpage-ui.js
//      * ═══════════════════════════════════════════════════════════
//      */
//     getContextualSuggestions(intent, entities = {}, response = {}) {
//         console.log(`💡 Generating contextual suggestions for intent: ${intent}`);

//         // Get base suggestions for the intent
//         let suggestions = this.getSuggestions(intent, { 
//             symbols: entities.symbols || [],
//             originalMessage: entities.originalMessage || '' 
//         });

//         // Personalize based on user history
//         if (this.userHistory.length > 0) {
//             suggestions = this.personalizeWithHistory(suggestions, { 
//                 symbols: entities.symbols || [] 
//             });
//         }

//         // Add symbol-specific suggestions if available
//         if (entities.symbols && entities.symbols.length > 0) {
//             suggestions = this.addSymbolContextSuggestions(suggestions, entities.symbols);
//         }

//         return suggestions.slice(0, 5);
//     }

//     /**
//      * ═══════════════════════════════════════════════════════════
//      * GET SUGGESTIONS (Main Method)
//      * ═══════════════════════════════════════════════════════════
//      */
//     getSuggestions(currentIntent = 'INITIAL', context = {}) {
//         console.log(`💡 Generating suggestions for intent: ${currentIntent}`);

//         // Get base suggestions for the intent
//         let suggestions = this.suggestionsByIntent[currentIntent] || this.suggestionsByIntent.INITIAL;

//         // Personalize based on user history
//         if (this.userHistory.length > 0) {
//             suggestions = this.personalizeWithHistory(suggestions, context);
//         }

//         // Add contextual suggestions based on entities
//         if (context.symbols && context.symbols.length > 0) {
//             suggestions = this.addSymbolContextSuggestions(suggestions, context.symbols);
//         }

//         // Limit to 5 suggestions
//         return suggestions.slice(0, 5);
//     }

//     /**
//      * ═══════════════════════════════════════════════════════════
//      * PERSONALIZE WITH HISTORY
//      * ═══════════════════════════════════════════════════════════
//      */
//     personalizeWithHistory(suggestions, context) {
//         const recentIntents = this.userHistory
//             .slice(-5)
//             .map(item => item.intent)
//             .filter(intent => intent);

//         // If user frequently analyzes stocks, suggest popular symbols
//         const stockAnalysisCount = recentIntents.filter(i => i === 'STOCK_ANALYSIS' || i === 'PRICE_HISTORY').length;
//         if (stockAnalysisCount >= 2) {
//             const randomSymbol = this.popularSymbols[Math.floor(Math.random() * this.popularSymbols.length)];
//             suggestions = [
//                 `Analyze ${randomSymbol}`,
//                 ...suggestions.slice(0, 4)
//             ];
//         }

//         // If user is interested in IPOs
//         const ipoCount = recentIntents.filter(i => i === 'IPO_ANALYSIS').length;
//         if (ipoCount >= 1) {
//             suggestions = [
//                 "Show this week's IPO calendar",
//                 ...suggestions.slice(0, 4)
//             ];
//         }

//         // If user is interested in Forex
//         const forexCount = recentIntents.filter(i => i === 'FOREX_ANALYSIS').length;
//         if (forexCount >= 1) {
//             suggestions = [
//                 "Show major currency pairs",
//                 ...suggestions.slice(0, 4)
//             ];
//         }

//         return suggestions;
//     }

//     /**
//      * ═══════════════════════════════════════════════════════════
//      * ADD SYMBOL CONTEXT SUGGESTIONS
//      * ═══════════════════════════════════════════════════════════
//      */
//     addSymbolContextSuggestions(suggestions, symbols) {
//         if (symbols.length === 0) return suggestions;

//         const symbol = symbols[0];

//         const contextualSuggestions = [
//             `Show ${symbol} technical indicators`,
//             `Compare ${symbol} with sector peers`,
//             `What's the price target for ${symbol}?`,
//             `Show ${symbol} 1-year trend`,
//             `Analyze ${symbol} fundamentals`
//         ];

//         // Mix contextual suggestions with base suggestions
//         return [
//             contextualSuggestions[0],
//             contextualSuggestions[1],
//             ...suggestions.slice(0, 3)
//         ];
//     }

//     /**
//      * ═══════════════════════════════════════════════════════════
//      * GET FOLLOW-UP QUESTIONS
//      * ═══════════════════════════════════════════════════════════
//      */
//     getFollowUpQuestions(lastResponse, context = {}) {
//         const intent = context.lastIntent || 'INITIAL';

//         const followUps = {
//             STOCK_ANALYSIS: [
//                 "Would you like to see the AI recommendation?",
//                 "Should I compare this with another stock?",
//                 "Do you want to see insider trading activity?",
//                 "Would you like technical indicator details?"
//             ],
//             PRICE_HISTORY: [
//                 "Would you like to see technical indicators?",
//                 "Should I compare with another stock?",
//                 "Do you want to see fundamental analysis?",
//                 "Would you like to set a price alert?"
//             ],
//             IPO_ANALYSIS: [
//                 "Would you like to see the IPO scoring breakdown?",
//                 "Should I show you similar IPOs?",
//                 "Do you want to set an alert for this IPO?",
//                 "Would you like to see the company's financials?"
//             ],
//             FOREX_ANALYSIS: [
//                 "Would you like to see other currency pairs?",
//                 "Should I show you the technical indicators?",
//                 "Do you want correlation analysis?",
//                 "Would you like to see economic calendar events?"
//             ],
//             BUDGET_MANAGEMENT: [
//                 "Would you like to optimize your budget?",
//                 "Should I show you savings projections?",
//                 "Do you want to add a new expense category?",
//                 "Would you like to see ROI calculations?"
//             ],
//             MARKET_OVERVIEW: [
//                 "Would you like sector-specific analysis?",
//                 "Should I show you top gainers/losers?",
//                 "Do you want to see market breadth indicators?",
//                 "Would you like economic calendar highlights?"
//             ]
//         };

//         return followUps[intent] || followUps.STOCK_ANALYSIS;
//     }

//     /**
//      * ═══════════════════════════════════════════════════════════
//      * ADD TO USER HISTORY
//      * ═══════════════════════════════════════════════════════════
//      */
//     addToHistory(message, intent, entities = {}) {
//         this.userHistory.push({
//             message,
//             intent,
//             entities,
//             timestamp: Date.now()
//         });

//         // Keep only last 20 interactions
//         if (this.userHistory.length > 20) {
//             this.userHistory = this.userHistory.slice(-20);
//         }

//         console.log(`📝 Added to history: ${intent} (Total: ${this.userHistory.length})`);
//     }

//     /**
//      * ═══════════════════════════════════════════════════════════
//      * GET QUICK ACTIONS (Buttons)
//      * ═══════════════════════════════════════════════════════════
//      */
//     getQuickActions(context = {}) {
//         const baseActions = [
//             { text: "Popular Stocks", action: "show_popular_stocks" },
//             { text: "Recent IPOs", action: "show_recent_ipos" },
//             { text: "Forex Rates", action: "show_forex_rates" },
//             { text: "My Budget", action: "show_budget" },
//             { text: "Insider Activity", action: "show_insider_activity" }
//         ];

//         // Add contextual actions if symbol is present
//         if (context.symbols && context.symbols.length > 0) {
//             const symbol = context.symbols[0];
//             return [
//                 { text: `Analyze ${symbol}`, action: `analyze_${symbol}` },
//                 { text: `${symbol} Indicators`, action: `indicators_${symbol}` },
//                 ...baseActions.slice(0, 3)
//             ];
//         }

//         return baseActions;
//     }

//     /**
//      * ═══════════════════════════════════════════════════════════
//      * GET TRENDING TOPICS
//      * ═══════════════════════════════════════════════════════════
//      */
//     getTrendingTopics() {
//         return [
//             {
//                 topic: "AI & Tech Stocks",
//                 description: "Analysis of NVDA, MSFT, GOOGL",
//                 keywords: ["NVDA", "AI", "semiconductors"]
//             },
//             {
//                 topic: "Recent IPOs",
//                 description: "Top-rated IPOs this month",
//                 keywords: ["IPO", "new listings"]
//             },
//             {
//                 topic: "Forex Volatility",
//                 description: "Major currency pairs analysis",
//                 keywords: ["EUR/USD", "forex", "volatility"]
//             },
//             {
//                 topic: "Insider Buying",
//                 description: "Unusual insider activity alerts",
//                 keywords: ["insider", "Form 4", "buying"]
//             },
//             {
//                 topic: "M&A Activity",
//                 description: "Recent merger announcements",
//                 keywords: ["merger", "acquisition", "M&A"]
//             }
//         ];
//     }

//     /**
//      * ═══════════════════════════════════════════════════════════
//      * GET SMART PROMPTS (Example Queries)
//      * ═══════════════════════════════════════════════════════════
//      */
//     getSmartPrompts() {
//         return [
//             "Show me NVDA technical analysis",
//             "What are the best IPOs this month?",
//             "Analyze insider trading for AAPL",
//             "Show EUR/USD forex indicators",
//             "Help me optimize my budget",
//             "Compare MSFT and GOOGL",
//             "What's the AI recommendation for TSLA?",
//             "Show recent M&A deals in tech sector",
//             "Which stocks have unusual insider buying?",
//             "Explain RSI indicator for beginners"
//         ];
//     }

//     /**
//      * ═══════════════════════════════════════════════════════════
//      * GET HELP SUGGESTIONS
//      * ═══════════════════════════════════════════════════════════
//      */
//     getHelpSuggestions() {
//         return [
//             {
//                 category: "Stock Analysis",
//                 examples: [
//                     "Analyze AAPL",
//                     "Show me NVDA indicators",
//                     "Compare MSFT and GOOGL"
//                 ]
//             },
//             {
//                 category: "IPO Intelligence",
//                 examples: [
//                     "Show recent IPOs",
//                     "Best IPOs this month",
//                     "IPO calendar"
//                 ]
//             },
//             {
//                 category: "Insider Trading",
//                 examples: [
//                     "Show insider activity for TSLA",
//                     "Unusual insider buying",
//                     "Recent Form 4 filings"
//                 ]
//             },
//             {
//                 category: "Forex Analysis",
//                 examples: [
//                     "EUR/USD analysis",
//                     "Show major currency pairs",
//                     "Currency strength radar"
//                 ]
//             },
//             {
//                 category: "Budget Management",
//                 examples: [
//                     "Show my budget",
//                     "Optimize savings",
//                     "Calculate ROI"
//                 ]
//             }
//         ];
//     }

//     /**
//      * ═══════════════════════════════════════════════════════════
//      * CLEAR USER HISTORY
//      * ═══════════════════════════════════════════════════════════
//      */
//     clearHistory() {
//         this.userHistory = [];
//         console.log('🗑 User history cleared');
//     }

//     /**
//      * ═══════════════════════════════════════════════════════════
//      * GET USER PREFERENCES (Based on History)
//      * ═══════════════════════════════════════════════════════════
//      */
//     getUserPreferences() {
//         if (this.userHistory.length === 0) {
//             return {
//                 favoriteIntent: 'UNKNOWN',
//                 favoriteSymbols: [],
//                 preferredTimeframe: '1y'
//             };
//         }

//         // Count intents
//         const intentCounts = {};
//         this.userHistory.forEach(item => {
//             intentCounts[item.intent] = (intentCounts[item.intent] || 0) + 1;
//         });

//         const favoriteIntent = Object.entries(intentCounts)
//             .sort((a, b) => b[1] - a[1])[0][0];

//         // Extract favorite symbols
//         const symbolCounts = {};
//         this.userHistory.forEach(item => {
//             if (item.entities && item.entities.symbols) {
//                 item.entities.symbols.forEach(symbol => {
//                     symbolCounts[symbol] = (symbolCounts[symbol] || 0) + 1;
//                 });
//             }
//         });

//         const favoriteSymbols = Object.entries(symbolCounts)
//             .sort((a, b) => b[1] - a[1])
//             .slice(0, 5)
//             .map(entry => entry[0]);

//         return {
//             favoriteIntent,
//             favoriteSymbols,
//             preferredTimeframe: '1y',  // Can be enhanced with actual tracking
//             totalInteractions: this.userHistory.length
//         };
//     }
// }

// // ═══════════════════════════════════════════════════════════════
// // EXPORT
// // ═══════════════════════════════════════════════════════════════

// if (typeof module !== 'undefined' && module.exports) {
//     module.exports = ChatbotSuggestions;
// }

// if (typeof window !== 'undefined') {
//     window.ChatbotSuggestions = ChatbotSuggestions;
// }

// console.log('✅ ChatbotSuggestions v3.1.0 loaded (with getInitialSuggestions + getContextualSuggestions)');

// ============================================
// CHATBOT SUGGESTIONS v6.0
// Suggestions contextuelles intelligentes
// ============================================

class ChatbotSuggestions {
    constructor(config) {
        this.config = config;
        this.suggestionHistory = [];
        
        console.log('💡 ChatbotSuggestions initialized');
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎯 GET CONTEXTUAL SUGGESTIONS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    getContextualSuggestions(intent, entities, conversationHistory = []) {
        console.log('💡 Generating suggestions for intent:', intent);

        const suggestions = [];

        // Intent-based suggestions
        switch (intent) {
            case 'STOCK_ANALYSIS':
                suggestions.push(...this.getStockAnalysisSuggestions(entities));
                break;
            
            case 'IPO_ANALYSIS':
                suggestions.push(...this.getIPOSuggestions());
                break;
            
            case 'FOREX_ANALYSIS':
                suggestions.push(...this.getForexSuggestions(entities));
                break;
            
            case 'TECHNICAL_ANALYSIS':
                suggestions.push(...this.getTechnicalSuggestions(entities));
                break;
            
            case 'PORTFOLIO_OPTIMIZATION':
                suggestions.push(...this.getPortfolioSuggestions());
                break;
            
            case 'MARKET_SENTIMENT':
                suggestions.push(...this.getMarketSentimentSuggestions());
                break;
            
            case 'ECONOMIC_DATA':
                suggestions.push(...this.getEconomicDataSuggestions();
                break;
            
            case 'PRICE_HISTORY':
                suggestions.push(...this.getPriceHistorySuggestions(entities));
                break;
            
            default:
                suggestions.push(...this.getGeneralSuggestions());
        }

        // Add follow-up suggestions based on conversation
        if (conversationHistory.length > 0) {
            suggestions.push(...this.getFollowUpSuggestions(conversationHistory));
        }

        // Limit to 4 suggestions
        const uniqueSuggestions = [...new Set(suggestions)];
        return uniqueSuggestions.slice(0, 4);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📊 STOCK ANALYSIS SUGGESTIONS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    getStockAnalysisSuggestions(entities) {
        const suggestions = [];
        const symbol = entities.symbols?.[0] || 'AAPL';

        suggestions.push(
            `Show me the technical indicators for ${symbol}`,
            `Compare ${symbol} with its competitors`,
            `What's the analyst rating for ${symbol}?`,
            `Show me ${symbol} earnings history`
        );

        return suggestions;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🚀 IPO SUGGESTIONS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    getIPOSuggestions() {
        return [
            'Show me upcoming IPOs this month',
            'Which IPOs have the highest potential?',
            'Analyze the latest tech IPOs',
            'Compare recent IPO performances'
        ];
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 💱 FOREX SUGGESTIONS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    getForexSuggestions(entities) {
        const pair = entities.currencies?.[0] || 'EUR/USD';

        return [
            `Analyze ${pair} trend`,
            `Show me major currency pairs performance`,
            `What's the sentiment for ${pair}?`,
            `Compare USD against major currencies`
        ];
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📈 TECHNICAL ANALYSIS SUGGESTIONS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    getTechnicalSuggestions(entities) {
        const symbol = entities.symbols?.[0] || 'NVDA';

        return [
            `Show me RSI and MACD for ${symbol}`,
            `What are the support and resistance levels for ${symbol}?`,
            `Analyze Bollinger Bands for ${symbol}`,
            `Show me Fibonacci retracement levels for ${symbol}`
        ];
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 💼 PORTFOLIO SUGGESTIONS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    getPortfolioSuggestions() {
        return [
            'Optimize my portfolio allocation',
            'Run Monte Carlo simulation on my portfolio',
            'Suggest diversification strategies',
            'Calculate risk-adjusted returns'
        ];
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 😨 MARKET SENTIMENT SUGGESTIONS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    getMarketSentimentSuggestions() {
        return [
            "What's the current fear and greed index?",
            'Show me sector rotation trends',
            'Which sectors are performing best today?',
            'Analyze market volatility (VIX)'
        ];
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🌍 ECONOMIC DATA SUGGESTIONS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    getEconomicDataSuggestions() {
        return [
            'Show me the latest inflation data',
            'What are current interest rates?',
            'Analyze GDP growth trends',
            'Show me unemployment rate evolution'
        ];
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📜 PRICE HISTORY SUGGESTIONS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    getPriceHistorySuggestions(entities) {
        const symbol = entities.symbols?.[0] || 'TSLA';

        return [
            `Show me ${symbol} price chart for 1 year`,
            `What was ${symbol} performance in the last quarter?`,
            `Compare ${symbol} YTD performance`,
            `Analyze ${symbol} historical volatility`
        ];
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 💡 GENERAL SUGGESTIONS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    getGeneralSuggestions() {
        return [
            'Show me top gainers today',
            'Which stocks are trending?',
            'Analyze tech sector performance',
            'Show me high-dividend stocks'
        ];
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🔄 FOLLOW-UP SUGGESTIONS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    getFollowUpSuggestions(conversationHistory) {
        const suggestions = [];
        
        // Extract symbols from recent conversation
        const recentMessages = conversationHistory.slice(-3);
        const symbols = new Set();
        
        recentMessages.forEach(msg => {
            const matches = msg.text.match(/\b([A-Z]{2,5})\b/g);
            if (matches) {
                matches.forEach(match => {
                    if (!['USD', 'EUR', 'THE', 'AND'].includes(match)) {
                        symbols.add(match);
                    }
                });
            }
        });

        // Generate follow-up suggestions
        if (symbols.size > 0) {
            const symbolArray = Array.from(symbols);
            suggestions.push(
                `Tell me more about ${symbolArray[0]}`,
                `What are the risks of investing in ${symbolArray[0]}?`
            );
        }

        suggestions.push(
            'Explain that in simpler terms',
            'Show me a chart for this data'
        );

        return suggestions;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎨 RENDER SUGGESTIONS IN UI
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    renderSuggestions(suggestions, containerId = 'input-suggestions') {
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn('⚠ Suggestions container not found');
            return;
        }

        if (!suggestions || suggestions.length === 0) {
            container.style.display = 'none';
            return;
        }

        container.innerHTML = '';
        container.style.display = 'flex';

        suggestions.forEach(suggestion => {
            const btn = document.createElement('button');
            btn.className = 'suggestion-chip';
            btn.textContent = suggestion;
            btn.onclick = () => {
                const input = document.getElementById('chatbot-input');
                if (input) {
                    input.value = suggestion;
                    input.focus();
                    
                    // Trigger send if configured
                    if (this.config.ui.autoSendSuggestions) {
                        const sendBtn = document.getElementById('chatbot-send-btn');
                        if (sendBtn) {
                            sendBtn.click();
                        }
                    }
                }
            };
            
            container.appendChild(btn);
        });

        console.log('💡 Suggestions rendered:', suggestions.length);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🗑 CLEAR SUGGESTIONS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    clearSuggestions(containerId = 'input-suggestions') {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = '';
            container.style.display = 'none';
        }
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ EXPORT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
console.log('✅ ChatbotSuggestions class loaded');