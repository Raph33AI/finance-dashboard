// // ============================================
// // GEMINI AI INTEGRATION v5.1 - ALPHAVAULT COMPLIANT
// // ✅ CONFORMITÉ LÉGALE: Prompts configurés pour parler uniquement de scores AlphaVault
// // ✅ CONFIGURATION: Utilise config.api.gemini.* (comme l'ancien code)
// // ============================================

// class GeminiAI {
//     constructor(config) {
//         this.config = config;
        
//         // ✅ ADAPTATION: Utiliser config.api.gemini.* (comme l'ancien code)
//         this.workerUrl = config.api?.gemini?.workerUrl || 'https://gemini-ai-proxy.raphnardone.workers.dev/api/gemini';
//         this.model = config.api?.gemini?.model || 'gemini-2.5-flash';
//         this.apiKey = null; // ✅ La clé est gérée côté Worker, pas côté client
        
//         this.conversationHistory = [];
//         this.maxHistoryLength = 10;
        
//         // ✅ Initialiser le system prompt directement
//         this.systemPrompt = this.buildAlphaVaultSystemPrompt();
        
//         console.log('🤖 Gemini AI initialized (v5.1 - AlphaVault + Worker Proxy)');
//         console.log('📡 Model:', this.model);
//         console.log('📡 Worker URL:', this.workerUrl);
//     }

//     // ============================================
//     // 🏆 SYSTEM PROMPT ALPHAVAULT
//     // ============================================
    
//     buildAlphaVaultSystemPrompt() {
//         return `You are **AlphaVault AI**, an elite financial analysis assistant specializing in proprietary scoring systems.

// 📊 **CRITICAL COMPLIANCE RULES - YOU MUST FOLLOW THESE:**

// 1. **NEVER mention raw prices, volumes, or market cap values**
//    ❌ WRONG: "AAPL is trading at $175.43"
//    ✅ CORRECT: "AAPL has an AlphaVault Score of 85/100"

// 2. **ALWAYS use AlphaVault proprietary metrics:**
//    - **AlphaVault Score** (0-100): Composite investment quality score
//    - **Momentum Index** (0-100): Price momentum strength
//    - **Quality Grade** (A+ to D-): Financial health rating
//    - **Risk Rating** (Low/Medium/High/Very High): Overall risk assessment
//    - **Technical Strength** (0-100): Technical analysis score
//    - **Value Score** (0-100): Valuation attractiveness
//    - **Sentiment Index** (0-100): Market sentiment strength

// 3. **For historical performance, use Performance Index (Base 100):**
//    ❌ WRONG: "The stock went from $100 to $150"
//    ✅ CORRECT: "The Performance Index increased from 100 to 150 (+50% total return)"

// 4. **For comparisons, use relative scores:**
//    ❌ WRONG: "AAPL ($175) is more expensive than MSFT ($380)"
//    ✅ CORRECT: "AAPL's AlphaVault Score (85) is higher than MSFT's Score (78)"

// 5. **Percentage changes are OK (they're relative):**
//    ✅ "The stock gained +15% this year"
//    ✅ "Momentum has increased by 8%"

// 📈 **AVAILABLE DATA IN CONTEXT:**

// When analyzing stocks, you receive:
// - \`alphaVaultScore\`: Overall investment quality (0-100)
// - \`momentumIndex\`: Price momentum strength (0-100)
// - \`qualityGrade\`: Financial health (A+ to D-)
// - \`riskRating\`: Risk level (Low/Medium/High/Very High)
// - \`technicalStrength\`: Technical indicators score (0-100)
// - \`valueScore\`: Valuation attractiveness (0-100)
// - \`sentimentIndex\`: Market sentiment (0-100)
// - \`priceChangePercent\`: Daily/period percentage change (✅ OK to mention)
// - \`volatilityLevel\`: Volatility category (Very Low to Very High)
// - \`marketCapCategory\`: Size category (Nano/Micro/Small/Mid/Large/Mega Cap) ✅ OK
// - \`sector\`: Industry sector ✅ OK
// - \`companyName\`: Company name ✅ OK

// For time series data:
// - \`performanceIndex\`: Normalized performance (Base 100)
// - \`dailyChange\`: Daily percentage change
// - \`totalReturn\`: Total return percentage since start

// 🎯 **YOUR ROLE:**

// 1. **Analyze AlphaVault Scores** to identify investment opportunities
// 2. **Explain what scores mean** in plain English
// 3. **Compare stocks using relative metrics** (scores, grades, indices)
// 4. **Provide actionable insights** based on proprietary data
// 5. **Be professional but conversational** - like a Bloomberg analyst

// 💡 **EXAMPLE RESPONSES:**

// **User:** "How is NVDA doing?"
// **You:** "NVDA currently has an **AlphaVault Score of 92/100** – classified as Excellent! 🏆

// Key highlights:
// - **Momentum Index:** 88/100 (Strong upward momentum)
// - **Quality Grade:** A+ (Exceptional financial health)
// - **Risk Rating:** Medium (Balanced risk profile)
// - **Technical Strength:** 85/100 (Bullish technical indicators)

// The stock is up **+12.5%** this period, with a Sentiment Index of 90/100 showing very positive market perception. This is a high-quality growth stock with strong fundamentals."

// **User:** "Compare AAPL vs MSFT"
// **You:** "**AAPL vs MSFT - AlphaVault Comparison:**

// **AAPL:**
// - AlphaVault Score: 85/100
// - Quality Grade: A
// - Momentum Index: 78/100
// - Value Score: 72/100

// **MSFT:**
// - AlphaVault Score: 78/100
// - Quality Grade: A-
// - Momentum Index: 82/100
// - Value Score: 68/100

// **Winner:** AAPL edges ahead with a higher overall AlphaVault Score (85 vs 78), indicating better investment quality. However, MSFT shows stronger momentum (82 vs 78). Both are A-grade quality stocks.

// **Recommendation:** AAPL for long-term quality, MSFT for near-term momentum."

// **User:** "Show me TSLA's performance over 1 year"
// **You:** "**TSLA - 1 Year Performance Summary:**

// 📈 **Performance Index:** Started at 100, now at 145 (**+45% total return**)

// **Current Metrics:**
// - AlphaVault Score: 68/100 (Good)
// - Volatility Level: Very High
// - Risk Rating: High
// - Momentum Index: 75/100

// The stock delivered strong returns but with significant volatility. The Performance Index shows periods of sharp gains and corrections, typical for high-growth stocks. Current AlphaVault Score suggests decent fundamentals despite the volatility."

// 🚫 **WHAT TO AVOID:**

// - Never say "current price is $X"
// - Never mention specific dollar amounts for market cap
// - Never display raw volume numbers
// - Never reference specific price levels ($100, $200, etc.)
// - Never mention "52-week high/low" in dollar terms

// ✅ **WHAT TO USE INSTEAD:**

// - "The Performance Index reached 150 (all-time high for this period)"
// - "Market cap category: Large Cap"
// - "Trading volume is above average"
// - "AlphaVault Score has improved by 15 points"

// Remember: You're analyzing **AlphaVault proprietary scores**, not redistributing raw market data. This keeps us legally compliant while providing superior analysis.

// Always be helpful, insightful, and data-driven. Use emojis sparingly for emphasis. Keep responses concise but comprehensive.`;
//     }

//     // ============================================
//     // 🤖 GÉNÉRATION DE RÉPONSE (WORKER PROXY)
//     // ============================================
    
//     async generateResponse(userMessage, context = {}) {
//         try {
//             console.log('🤖 Gemini AI generating response (AlphaVault mode)...');
            
//             if (!this.workerUrl) {
//                 console.error('❌ Gemini Worker URL not configured');
//                 return {
//                     text: '⚠ **AI Configuration Error:** Gemini Worker URL is missing.\n\nPlease check `chatbot-config.js` and verify that `api.gemini.workerUrl` is properly configured.',
//                     error: true
//                 };
//             }

//             const enrichedPrompt = this.buildEnrichedPrompt(userMessage, context);
            
//             const requestBody = {
//                 model: this.model,
//                 contents: [
//                     {
//                         role: 'user',
//                         parts: [{ text: this.systemPrompt }]
//                     },
//                     {
//                         role: 'model',
//                         parts: [{ text: 'Understood. I will analyze stocks using AlphaVault proprietary scores only, never mentioning raw prices or volumes. I will focus on Performance Indices, AlphaVault Scores, Quality Grades, and relative metrics. Ready to assist!' }]
//                     },
//                     ...this.conversationHistory,
//                     {
//                         role: 'user',
//                         parts: [{ text: enrichedPrompt }]
//                     }
//                 ],
//                 generationConfig: {
//                     temperature: this.config.api?.gemini?.temperature || 0.85,
//                     topK: this.config.api?.gemini?.topK || 40,
//                     topP: this.config.api?.gemini?.topP || 0.95,
//                     maxOutputTokens: this.config.api?.gemini?.maxOutputTokens || 8192,
//                     stopSequences: []
//                 },
//                 safetySettings: this.config.api?.gemini?.safetySettings || [
//                     {
//                         category: 'HARM_CATEGORY_HARASSMENT',
//                         threshold: 'BLOCK_MEDIUM_AND_ABOVE'
//                     },
//                     {
//                         category: 'HARM_CATEGORY_HATE_SPEECH',
//                         threshold: 'BLOCK_MEDIUM_AND_ABOVE'
//                     },
//                     {
//                         category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
//                         threshold: 'BLOCK_MEDIUM_AND_ABOVE'
//                     },
//                     {
//                         category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
//                         threshold: 'BLOCK_MEDIUM_AND_ABOVE'
//                     }
//                 ]
//             };

//             // ✅ ADAPTATION: Appel au Worker (comme l'ancien code, sans header X-API-Key)
//             console.log('📡 Calling Gemini via Worker:', this.workerUrl);
            
//             const response = await fetch(this.workerUrl, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify(requestBody)
//             });

//             if (!response.ok) {
//                 const errorData = await response.json().catch(() => ({}));
//                 console.error('❌ Gemini Worker error:', errorData);
//                 throw new Error(`Worker Error: ${response.status} - ${errorData.error || 'Unknown error'}`);
//             }

//             const data = await response.json();
            
//             if (!data.candidates || data.candidates.length === 0) {
//                 throw new Error('No response from Gemini AI');
//             }

//             const aiText = data.candidates[0].content.parts[0].text;

//             this.addToHistory('user', enrichedPrompt);
//             this.addToHistory('model', aiText);

//             console.log('✅ Gemini AI response generated (AlphaVault compliant)');

//             return {
//                 text: aiText,
//                 model: this.model,
//                 timestamp: Date.now(),
//                 tokensUsed: data.usageMetadata?.totalTokenCount || 0
//             };

//         } catch (error) {
//             console.error('❌ Gemini AI generation error:', error);
            
//             return {
//                 text: `⚠ **AI Error:** ${error.message}\n\nI'm having trouble connecting to the AI service. Please check:\n1. The Worker URL is accessible (${this.workerUrl})\n2. The Gemini API key is configured in the Worker\n3. Your internet connection`,
//                 error: true
//             };
//         }
//     }

//     // ============================================
//     // 📝 CONSTRUCTION DU PROMPT ENRICHI
//     // ============================================
    
//     buildEnrichedPrompt(userMessage, context) {
//         let enrichedPrompt = `**User Question:** ${userMessage}\n\n`;

//         enrichedPrompt += `**AlphaVault Data Available:**\n\n`;

//         // Stock data transformé en scores AlphaVault
//         if (context.stockData) {
//             const stock = context.stockData;
//             enrichedPrompt += `📊 **${stock.symbol} - AlphaVault Analysis:**\n`;
//             enrichedPrompt += `- Company: ${stock.companyName || stock.symbol}\n`;
//             enrichedPrompt += `- Sector: ${stock.sector || 'N/A'}\n`;
//             enrichedPrompt += `- AlphaVault Score: ${stock.alphaVaultScore}/100\n`;
//             enrichedPrompt += `- Momentum Index: ${stock.momentumIndex}/100\n`;
//             enrichedPrompt += `- Quality Grade: ${stock.qualityGrade}\n`;
//             enrichedPrompt += `- Risk Rating: ${stock.riskRating}\n`;
//             enrichedPrompt += `- Technical Strength: ${stock.technicalStrength}/100\n`;
//             enrichedPrompt += `- Value Score: ${stock.valueScore}/100\n`;
//             enrichedPrompt += `- Sentiment Index: ${stock.sentimentIndex}/100\n`;
//             enrichedPrompt += `- Change Today: ${stock.priceChangePercent > 0 ? '+' : ''}${stock.priceChangePercent}%\n`;
//             enrichedPrompt += `- Volatility Level: ${stock.volatilityLevel}\n`;
//             enrichedPrompt += `- Market Cap Category: ${stock.marketCapCategory}\n`;
//             enrichedPrompt += `- Data Quality: ${stock.dataQuality}\n\n`;
//         }

//         // Time series transformé en Performance Index
//         if (context.timeSeriesData && context.timeSeriesData.normalizedData) {
//             const ts = context.timeSeriesData;
//             enrichedPrompt += `📈 **${ts.symbol} - Performance Index (Base 100):**\n`;
//             enrichedPrompt += `- Data Points: ${ts.dataPoints}\n`;
//             enrichedPrompt += `- Total Return: ${ts.performanceSummary.totalReturn}\n`;
//             enrichedPrompt += `- Data Quality: ${ts.performanceSummary.dataQuality}\n`;
//             enrichedPrompt += `- Latest Performance Index: ${ts.normalizedData[ts.normalizedData.length - 1]?.performanceIndex}\n\n`;
//         }

//         // Comparison data
//         if (context.comparisonData && context.comparisonData.comparison) {
//             enrichedPrompt += `⚖ **AlphaVault Comparison:**\n`;
//             context.comparisonData.comparison.forEach(item => {
//                 enrichedPrompt += `\n**${item.symbol}** (${item.companyName}):\n`;
//                 enrichedPrompt += `- AlphaVault Score: ${item.alphaVaultScore}/100\n`;
//                 enrichedPrompt += `- Momentum Index: ${item.momentumIndex}/100\n`;
//                 enrichedPrompt += `- Quality Grade: ${item.qualityGrade}\n`;
//                 enrichedPrompt += `- Risk Rating: ${item.riskRating}\n`;
//                 enrichedPrompt += `- Value Score: ${item.valueScore}/100\n`;
//                 enrichedPrompt += `- Relative Performance: ${item.relativePerformance}\n`;
//                 enrichedPrompt += `- Market Cap: ${item.marketCapCategory}\n`;
//                 enrichedPrompt += `- Volatility: ${item.volatilityLevel}\n`;
//             });
            
//             if (context.comparisonData.winner) {
//                 enrichedPrompt += `\n🏆 **Top Pick:** ${context.comparisonData.winner.topPick}\n`;
//                 enrichedPrompt += `   Reason: ${context.comparisonData.winner.reason}\n\n`;
//             }
//         }

//         // Analyst recommendations (✅ OK - données publiques)
//         if (context.analystRecommendations) {
//             const rec = context.analystRecommendations;
//             enrichedPrompt += `👥 **Analyst Consensus:**\n`;
//             enrichedPrompt += `- Rating: ${rec.consensus}\n`;
//             enrichedPrompt += `- Bullish %: ${rec.bullishPercent}%\n`;
//             enrichedPrompt += `- Total Analysts: ${rec.total}\n`;
//             enrichedPrompt += `- Strong Buy: ${rec.strongBuy}, Buy: ${rec.buy}, Hold: ${rec.hold}, Sell: ${rec.sell}, Strong Sell: ${rec.strongSell}\n\n`;
//         }

//         // Earnings (✅ OK - données publiques)
//         if (context.earningsHistory) {
//             const earnings = context.earningsHistory;
//             enrichedPrompt += `💰 **Earnings Quality:**\n`;
//             enrichedPrompt += `- Beat Rate: ${earnings.beatRate}%\n`;
//             enrichedPrompt += `- Beats: ${earnings.beatCount}, Misses: ${earnings.missCount}\n`;
//             enrichedPrompt += `- Quality Rating: ${earnings.earningsQuality}\n\n`;
//         }

//         // News sentiment (✅ OK)
//         if (context.sentiment) {
//             enrichedPrompt += `📰 **News Sentiment:**\n`;
//             enrichedPrompt += `- Overall: ${context.sentiment.overallSentiment.label}\n`;
//             enrichedPrompt += `- Score: ${context.sentiment.overallSentiment.sentiment.toFixed(2)}\n`;
//             enrichedPrompt += `- Recommendation: ${context.sentiment.recommendation}\n\n`;
//         }

//         // Market news
//         if (context.marketNews && context.marketNews.length > 0) {
//             enrichedPrompt += `📰 **Recent Market News:**\n`;
//             context.marketNews.slice(0, 5).forEach(news => {
//                 enrichedPrompt += `- ${news.headline} (${news.source})\n`;
//             });
//             enrichedPrompt += `\n`;
//         }

//         enrichedPrompt += `\n**REMEMBER:** Use ONLY AlphaVault proprietary metrics. Never mention raw prices or volumes. Focus on scores, grades, performance indices, and percentage changes.`;

//         return enrichedPrompt;
//     }

//     // ============================================
//     // 📚 GESTION HISTORIQUE
//     // ============================================
    
//     addToHistory(role, text) {
//         this.conversationHistory.push({
//             role: role,
//             parts: [{ text: text }]
//         });

//         if (this.conversationHistory.length > this.maxHistoryLength * 2) {
//             this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength * 2);
//         }
//     }

//     clearHistory() {
//         this.conversationHistory = [];
//         console.log('✅ Conversation history cleared');
//     }

//     getHistory() {
//         return this.conversationHistory;
//     }

//     getHistoryLength() {
//         return this.conversationHistory.length;
//     }
// }

// // ============================================
// // EXPORT & GLOBAL AVAILABILITY
// // ============================================

// if (typeof module !== 'undefined' && module.exports) {
//     module.exports = GeminiAI;
// }

// window.GeminiAI = GeminiAI;

// console.log('✅ GeminiAI v5.1 - ALPHAVAULT COMPLIANT loaded successfully!');
// console.log('🤖 AI trained to discuss AlphaVault proprietary scores only');
// console.log('🔒 Legal compliance: No raw API data mentioned in responses');
// console.log('📡 Configuration: Using config.api.gemini.* structure');

// ============================================
// GEMINI AI CLIENT v6.0
// Communication avec le Worker Cloudflare
// ============================================

class GeminiAIClient {
    constructor(config) {
        this.config = config;
        this.workerUrl = config.gemini.workerUrl;
        this.model = config.gemini.model;
        this.conversationHistory = [];
        this.requestCount = 0;
        this.lastRequestTime = 0;
        
        console.log('🤖 GeminiAIClient initialized:', {
            workerUrl: this.workerUrl,
            model: this.model,
            maxTokens: config.gemini.maxOutputTokens
        });
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🔒 RATE LIMITING
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    checkRateLimit() {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        
        if (timeSinceLastRequest < this.config.security.rateLimitWindow) {
            this.requestCount++;
            if (this.requestCount > this.config.security.rateLimitRequests) {
                throw new Error('RATE_LIMIT_EXCEEDED');
            }
        } else {
            this.requestCount = 1;
            this.lastRequestTime = now;
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🧹 SANITIZE INPUT (XSS Protection)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    sanitizeInput(text) {
        if (!this.config.security.sanitizeInput) return text;
        
        return text
            .replace(/[<>]/g, '') // Remove < >
            .trim()
            .slice(0, this.config.security.maxMessageLength);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 💬 ENVOYER UN MESSAGE À GEMINI
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    async sendMessage(userMessage, conversationContext = []) {
        try {
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('📤 Sending message to Gemini AI...');
            console.log('💬 User message:', userMessage);
            
            // Rate limiting
            this.checkRateLimit();
            
            // Sanitize input
            const sanitizedMessage = this.sanitizeInput(userMessage);
            
            // Construire le contexte de conversation
            const contents = this.buildConversationContents(sanitizedMessage, conversationContext);
            
            // Payload pour le Worker
            const payload = {
                model: this.model,
                contents: contents,
                generationConfig: {
                    temperature: this.config.gemini.temperature,
                    topK: this.config.gemini.topK,
                    topP: this.config.gemini.topP,
                    maxOutputTokens: this.config.gemini.maxOutputTokens
                },
                safetySettings: this.config.gemini.safetySettings
            };

            console.log('📊 Payload:', {
                model: payload.model,
                messageLength: sanitizedMessage.length,
                contextMessages: conversationContext.length,
                totalContents: contents.length
            });

            // Appel au Worker Cloudflare
            const response = await fetch(this.workerUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('❌ Worker error:', errorData);
                throw new Error(errorData.error || 'API_ERROR');
            }

            const data = await response.json();
            
            // Extraire la réponse
            const aiResponse = this.extractResponse(data);
            
            console.log('✅ Gemini response received');
            console.log('📊 Tokens used:', data.usageMetadata?.totalTokenCount || 'N/A');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            
            return {
                success: true,
                text: aiResponse,
                metadata: {
                    tokensUsed: data.usageMetadata?.totalTokenCount || 0,
                    model: this.model,
                    timestamp: new Date().toISOString()
                }
            };

        } catch (error) {
            console.error('❌ Gemini AI Error:', error);
            
            if (error.message === 'RATE_LIMIT_EXCEEDED') {
                return {
                    success: false,
                    error: 'RATE_LIMIT',
                    message: this.config.messages.rateLimited
                };
            }
            
            return {
                success: false,
                error: 'API_ERROR',
                message: this.config.messages.apiError
            };
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🏗 CONSTRUIRE LE CONTEXTE
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    buildConversationContents(userMessage, conversationContext) {
        const contents = [];
        
        // 1⃣ System Prompt (via premier message "user")
        contents.push({
            role: 'user',
            parts: [{ text: this.config.systemPrompt }]
        });
        
        contents.push({
            role: 'model',
            parts: [{ text: 'Understood. I am Alphy AI, your elite financial analyst. I will provide professional, data-driven insights on stocks, IPOs, forex, portfolios, and market analysis. How can I assist you today?' }]
        });
        
        // 2⃣ Historique de conversation (max 10 derniers messages)
        const recentContext = conversationContext.slice(-10);
        recentContext.forEach(msg => {
            contents.push({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }]
            });
        });
        
        // 3⃣ Message actuel de l'utilisateur
        contents.push({
            role: 'user',
            parts: [{ text: userMessage }]
        });
        
        return contents;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📦 EXTRAIRE LA RÉPONSE
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    extractResponse(data) {
        try {
            if (!data.candidates || data.candidates.length === 0) {
                console.error('❌ No candidates in response');
                return 'I apologize, but I could not generate a response. Please try again.';
            }
            
            const candidate = data.candidates[0];
            
            if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
                console.error('❌ No content in candidate');
                return 'I apologize, but I could not generate a response. Please try again.';
            }
            
            return candidate.content.parts[0].text || 'Empty response';
            
        } catch (error) {
            console.error('❌ Error extracting response:', error);
            return 'Error processing AI response. Please try again.';
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🔄 RESET CONVERSATION
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    resetConversation() {
        this.conversationHistory = [];
        console.log('🔄 Conversation history reset');
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🏥 HEALTH CHECK
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    async checkHealth() {
        try {
            const healthUrl = this.workerUrl.replace('/api/gemini', '/health');
            const response = await fetch(healthUrl);
            const data = await response.json();
            
            console.log('🏥 Worker Health:', data);
            return data.status === 'ok';
        } catch (error) {
            console.error('❌ Health check failed:', error);
            return false;
        }
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ EXPORT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
console.log('✅ GeminiAIClient class loaded');