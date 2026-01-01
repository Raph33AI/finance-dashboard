// ============================================
// CHATBOT ANALYTICS v6.0
// Tracking & Analytics
// ============================================

class ChatbotAnalytics {
    constructor(config) {
        this.config = config;
        this.sessionId = this.generateSessionId();
        this.metrics = {
            messagesCount: 0,
            userMessagesCount: 0,
            aiMessagesCount: 0,
            averageResponseTime: 0,
            responseTimes: [],
            intentsDetected: {},
            symbolsQueried: new Set(),
            errorsCount: 0,
            sessionStart: new Date().toISOString()
        };
        
        console.log('📊 ChatbotAnalytics initialized - Session:', this.sessionId);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📝 TRACK MESSAGE
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    trackMessage(role, intent = null, entities = null) {
        this.metrics.messagesCount++;
        
        if (role === 'user') {
            this.metrics.userMessagesCount++;
        } else {
            this.metrics.aiMessagesCount++;
        }

        if (intent) {
            this.metrics.intentsDetected[intent] = (this.metrics.intentsDetected[intent] || 0) + 1;
        }

        if (entities?.symbols) {
            entities.symbols.forEach(symbol => {
                this.metrics.symbolsQueried.add(symbol);
            });
        }

        console.log('📊 Message tracked:', { role, intent, totalMessages: this.metrics.messagesCount });
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ⏱ TRACK RESPONSE TIME
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    trackResponseTime(startTime, endTime) {
        const responseTime = endTime - startTime;
        this.metrics.responseTimes.push(responseTime);
        
        // Calculate average
        const sum = this.metrics.responseTimes.reduce((a, b) => a + b, 0);
        this.metrics.averageResponseTime = Math.round(sum / this.metrics.responseTimes.length);

        console.log('⏱ Response time:', responseTime + 'ms', '(avg:', this.metrics.averageResponseTime + 'ms)');
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ❌ TRACK ERROR
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    trackError(errorType, errorMessage) {
        this.metrics.errorsCount++;
        
        console.error('📊 Error tracked:', { 
            type: errorType, 
            message: errorMessage, 
            totalErrors: this.metrics.errorsCount 
        });

        // Send to analytics service (if configured)
        this.sendToAnalyticsService('error', {
            sessionId: this.sessionId,
            errorType,
            errorMessage,
            timestamp: new Date().toISOString()
        });
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📊 GET METRICS SUMMARY
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    getMetricsSummary() {
        const sessionDuration = Date.now() - new Date(this.metrics.sessionStart).getTime();
        
        return {
            sessionId: this.sessionId,
            sessionDuration: Math.round(sessionDuration / 1000) + ' seconds',
            messagesCount: this.metrics.messagesCount,
            userMessagesCount: this.metrics.userMessagesCount,
            aiMessagesCount: this.metrics.aiMessagesCount,
            averageResponseTime: this.metrics.averageResponseTime + ' ms',
            intentsDetected: this.metrics.intentsDetected,
            symbolsQueried: Array.from(this.metrics.symbolsQueried),
            errorsCount: this.metrics.errorsCount,
            sessionStart: this.metrics.sessionStart
        };
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📤 SEND TO ANALYTICS SERVICE
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    async sendToAnalyticsService(eventType, data) {
        // Check if analytics tracker exists
        if (typeof window.trackPageView === 'function') {
            try {
                // Send to your analytics-tracker.js
                const eventData = {
                    event: `chatbot_${eventType}`,
                    sessionId: this.sessionId,
                    ...data
                };

                console.log('📤 Analytics event sent:', eventData);
                
                // You can integrate with your existing analytics-tracker.js here
                // Example: await window.trackCustomEvent(eventData);
                
            } catch (error) {
                console.error('❌ Analytics send error:', error);
            }
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🔧 GENERATE SESSION ID
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    generateSessionId() {
        return 'chatbot_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🔄 RESET METRICS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    resetMetrics() {
        const oldSessionId = this.sessionId;
        
        // Send final summary before reset
        this.sendToAnalyticsService('session_end', this.getMetricsSummary());
        
        this.sessionId = this.generateSessionId();
        this.metrics = {
            messagesCount: 0,
            userMessagesCount: 0,
            aiMessagesCount: 0,
            averageResponseTime: 0,
            responseTimes: [],
            intentsDetected: {},
            symbolsQueried: new Set(),
            errorsCount: 0,
            sessionStart: new Date().toISOString()
        };

        console.log('🔄 Metrics reset - Old session:', oldSessionId, 'New session:', this.sessionId);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📊 LOG METRICS TO CONSOLE
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    logMetrics() {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📊 CHATBOT ANALYTICS SUMMARY');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.table(this.getMetricsSummary());
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ EXPORT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
console.log('✅ ChatbotAnalytics class loaded');