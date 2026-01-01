// ============================================
// CHATBOT SUGGESTIONS v6.0 CORRECTED
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
                suggestions.push(...this.getEconomicDataSuggestions());  // ✅ CORRECTION ICI
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