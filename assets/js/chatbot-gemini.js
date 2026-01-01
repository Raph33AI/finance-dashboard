// ============================================
// GEMINI AI CLIENT v6.1 ULTRA PRO
// Communication optimisée avec Cloudflare Worker
// ✅ Gestion améliorée des réponses AlphaVault
// ============================================

class GeminiAIClient {
    constructor(config) {
        this.config = config;
        this.workerUrl = config.gemini.workerUrl;
        this.model = config.gemini.model;
        this.conversationHistory = [];
        this.requestCount = 0;
        this.lastRequestTime = 0;
        
        console.log('🤖 GeminiAIClient v6.1 ULTRA PRO initialized:', {
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
    // 🧹 SANITIZE INPUT
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    sanitizeInput(text) {
        if (!this.config.security.sanitizeInput) return text;
        
        return text
            .replace(/[<>]/g, '')
            .trim()
            .slice(0, this.config.security.maxMessageLength);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 💬 SEND MESSAGE TO GEMINI
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    async sendMessage(userMessage, conversationContext = []) {
        try {
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('📤 Sending message to Gemini AI...');
            
            // Rate limiting
            this.checkRateLimit();
            
            // Sanitize input
            const sanitizedMessage = this.sanitizeInput(userMessage);
            
            // Build conversation contents
            const contents = this.buildConversationContents(sanitizedMessage, conversationContext);
            
            // Payload
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

            console.log('📊 Payload summary:', {
                model: payload.model,
                messageLength: sanitizedMessage.length,
                contextMessages: conversationContext.length,
                totalContents: contents.length,
                maxTokens: payload.generationConfig.maxOutputTokens
            });

            // Call Cloudflare Worker
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
            
            // Extract response
            const aiResponse = this.extractResponse(data);
            
            console.log('✅ Gemini response received');
            console.log('📊 Response length:', aiResponse.length, 'characters');
            console.log('📊 Tokens used:', data.usageMetadata?.totalTokenCount || 'N/A');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            
            return {
                success: true,
                text: aiResponse,
                metadata: {
                    tokensUsed: data.usageMetadata?.totalTokenCount || 0,
                    promptTokens: data.usageMetadata?.promptTokenCount || 0,
                    candidatesTokenCount: data.usageMetadata?.candidatesTokenCount || 0,
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
    // 🏗 BUILD CONVERSATION CONTENTS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    buildConversationContents(userMessage, conversationContext) {
        const contents = [];
        
        // 1⃣ System Prompt (via first user message)
        contents.push({
            role: 'user',
            parts: [{ text: this.config.systemPrompt }]
        });
        
        contents.push({
            role: 'model',
            parts: [{ text: 'Understood. I am Alphy AI, your elite financial analyst powered by AlphaVault proprietary intelligence. I will analyze stocks, IPOs, forex, and portfolios using our advanced scoring system while maintaining full legal compliance. I will never redistribute raw API data like specific prices or P/E ratios. Instead, I will focus on AlphaVault Scores, ratings, and actionable insights. How can I assist you today?' }]
        });
        
        // 2⃣ Recent conversation history (last 10 messages)
        const recentContext = conversationContext.slice(-10);
        recentContext.forEach(msg => {
            contents.push({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }]
            });
        });
        
        // 3⃣ Current user message
        contents.push({
            role: 'user',
            parts: [{ text: userMessage }]
        });
        
        return contents;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📦 EXTRACT RESPONSE
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    extractResponse(data) {
        try {
            if (!data.candidates || data.candidates.length === 0) {
                console.error('❌ No candidates in response');
                return 'I apologize, but I could not generate a response. Please try rephrasing your question.';
            }
            
            const candidate = data.candidates[0];
            
            // Check for safety blocks
            if (candidate.finishReason === 'SAFETY') {
                console.warn('⚠ Response blocked by safety filters');
                return 'I apologize, but I cannot provide a response to this query due to safety guidelines. Please rephrase your question.';
            }
            
            if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
                console.error('❌ No content in candidate');
                return 'I apologize, but I could not generate a complete response. Please try again.';
            }
            
            let responseText = candidate.content.parts[0].text || '';
            
            // Clean up response (remove potential Markdown artifacts)
            responseText = responseText.trim();
            
            return responseText || 'Empty response received. Please try again.';
            
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
        console.log('🔄 Gemini conversation history reset');
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
console.log('✅ GeminiAIClient v6.1 ULTRA PRO loaded successfully');