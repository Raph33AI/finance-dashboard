// ============================================
// CHATBOT FULL PAGE UI - CONTROLLER
// ============================================

class ChatbotFullPageUI {
    constructor(config) {
        this.config = config;
        this.engine = null;
        this.charts = null;
        this.suggestions = null;
        
        this.elements = {};
        this.isTyping = false;
        this.messageCount = 0;
        this.chartCount = 0;
        this.totalResponseTime = 0;
        
        this.init();
    }

    // ============================================
    // INITIALIZATION
    // ============================================
    async init() {
        try {
            console.log('🎨 Initializing Full Page UI...');
            
            // Cache DOM elements
            this.cacheElements();
            
            // Attach event listeners
            this.attachEventListeners();
            
            // Initialize components
            await this.initializeComponents();
            
            // Initialize particles
            if (typeof initializeParticles === 'function') {
                initializeParticles();
            }
            
            console.log('✅ Full Page UI initialized');
            
        } catch (error) {
            console.error('❌ Full Page UI initialization error:', error);
        }
    }

    // ============================================
    // CACHE DOM ELEMENTS
    // ============================================
    cacheElements() {
        this.elements = {
            // Sidebar
            sidebar: document.getElementById('sidebar'),
            sidebarToggle: document.getElementById('sidebar-toggle'),
            mobileSidebarToggle: document.getElementById('mobile-sidebar-toggle'),
            newChatBtn: document.getElementById('new-chat-btn'),
            conversationsList: document.getElementById('conversations-list'),
            
            // Main
            messages: document.getElementById('fullpage-messages'),
            welcomeScreen: document.getElementById('welcome-screen'),
            input: document.getElementById('fullpage-input'),
            sendBtn: document.getElementById('fullpage-send-btn'),
            inputClearBtn: document.getElementById('input-clear-btn'),
            inputSuggestions: document.getElementById('input-suggestions'),
            inputCounter: document.getElementById('input-counter'),
            
            // Header
            shareBtn: document.getElementById('share-btn'),
            settingsBtn: document.getElementById('settings-btn'),
            
            // Stats
            floatingStats: document.getElementById('floating-stats'),
            statsClose: document.getElementById('stats-close'),
            statMessages: document.getElementById('stat-messages'),
            statCharts: document.getElementById('stat-charts'),
            statResponse: document.getElementById('stat-response'),
            statSuccess: document.getElementById('stat-success')
        };
    }

    // ============================================
    // ATTACH EVENT LISTENERS
    // ============================================
    attachEventListeners() {
        // Sidebar toggles
        if (this.elements.mobileSidebarToggle) {
            this.elements.mobileSidebarToggle.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }
        
        if (this.elements.sidebarToggle) {
            this.elements.sidebarToggle.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }
        
        // New chat
        if (this.elements.newChatBtn) {
            this.elements.newChatBtn.addEventListener('click', () => {
                this.startNewChat();
            });
        }
        
        // Welcome suggestions
        const welcomeSuggestions = document.querySelectorAll('.welcome-suggestion-btn');
        welcomeSuggestions.forEach(btn => {
            btn.addEventListener('click', () => {
                const query = btn.dataset.query;
                this.sendMessage(query);
            });
        });
        
        // Input
        if (this.elements.input) {
            this.elements.input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
            
            this.elements.input.addEventListener('input', () => {
                this.autoResizeTextarea();
                this.updateCharCounter();
            });
        }
        
        // Send button
        if (this.elements.sendBtn) {
            this.elements.sendBtn.addEventListener('click', () => {
                this.sendMessage();
            });
        }
        
        // Clear input
        if (this.elements.inputClearBtn) {
            this.elements.inputClearBtn.addEventListener('click', () => {
                this.elements.input.value = '';
                this.autoResizeTextarea();
                this.updateCharCounter();
                this.elements.input.focus();
            });
        }
        
        // Suggestions delegation
        if (this.elements.inputSuggestions) {
            this.elements.inputSuggestions.addEventListener('click', (e) => {
                if (e.target.classList.contains('input-suggestion-chip')) {
                    this.sendMessage(e.target.textContent);
                }
            });
        }
        
        // Stats panel
        if (this.elements.statsClose) {
            this.elements.statsClose.addEventListener('click', () => {
                this.hideStats();
            });
        }
    }

    // ============================================
    // INITIALIZE COMPONENTS
    // ============================================
    async initializeComponents() {
        // Initialize engine
        if (typeof FinancialChatbotEngine !== 'undefined') {
            this.engine = new FinancialChatbotEngine(this.config);
            console.log('✅ Engine initialized');
        }
        
        // Initialize charts
        if (typeof ChatbotCharts !== 'undefined') {
            this.charts = new ChatbotCharts(this.config);
            console.log('✅ Charts initialized');
        }
        
        // Initialize suggestions
        if (typeof ChatbotSuggestions !== 'undefined') {
            this.suggestions = new ChatbotSuggestions(this.config);
            console.log('✅ Suggestions initialized');
        }
    }

    // ============================================
    // SEND MESSAGE
    // ============================================
    async sendMessage(messageText = null) {
        const message = messageText || this.elements.input.value.trim();
        
        if (!message || this.isTyping) return;
        
        // Hide welcome screen
        if (this.elements.welcomeScreen) {
            this.elements.welcomeScreen.style.display = 'none';
        }
        
        // Clear input
        this.elements.input.value = '';
        this.autoResizeTextarea();
        this.updateCharCounter();
        
        // Add user message
        this.addMessage('user', message);
        
        // Clear suggestions
        this.clearSuggestions();
        
        // Show typing
        this.showTypingIndicator();
        
        try {
            const startTime = performance.now();
            
            // Process message
            const response = await this.engine.processMessage(message);
            
            const responseTime = performance.now() - startTime;
            this.totalResponseTime += responseTime;
            
            // Hide typing
            this.hideTypingIndicator();
            
            // Add AI response
            this.addMessage('bot', response.text);
            
            // Generate charts
            if (response.chartRequests && response.chartRequests.length > 0) {
                await this.generateCharts(response.chartRequests);
            }
            
            // Show suggestions
            if (response.suggestions && response.suggestions.length > 0) {
                this.showSuggestions(response.suggestions);
            } else if (this.suggestions) {
                const contextualSuggestions = this.suggestions.getContextualSuggestions(
                    response.intent,
                    response.entities,
                    response
                );
                this.showSuggestions(contextualSuggestions);
            }
            
            // Update stats
            this.updateStats();
            
        } catch (error) {
            console.error('Message processing error:', error);
            this.hideTypingIndicator();
            this.addMessage('bot', '⚠️ Sorry, I encountered an error. Please try again.');
        }
    }

    // ============================================
    // ADD MESSAGE
    // ============================================
    addMessage(type, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        
        const avatar = document.createElement('div');
        avatar.className = `message-avatar ${type}-avatar`;
        avatar.textContent = type === 'user' ? '👤' : '🤖';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        
        const text = document.createElement('div');
        text.className = 'message-text';
        text.innerHTML = this.formatMessage(content);
        
        bubble.appendChild(text);
        
        const time = document.createElement('span');
        time.className = 'message-time';
        time.textContent = new Date().toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        bubble.appendChild(time);
        
        contentDiv.appendChild(bubble);
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(contentDiv);
        
        this.elements.messages.appendChild(messageDiv);
        this.scrollToBottom();
        
        this.messageCount++;
    }

    // ============================================
    // FORMAT MESSAGE
    // ============================================
    formatMessage(text) {
        return text
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/`(.+?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }

    // ============================================
    // TYPING INDICATOR
    // ============================================
    showTypingIndicator() {
        this.isTyping = true;
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message';
        typingDiv.id = 'typing-indicator';
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar bot-avatar';
        avatar.textContent = '🤖';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        
        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator';
        indicator.innerHTML = `
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
        `;
        
        bubble.appendChild(indicator);
        contentDiv.appendChild(bubble);
        typingDiv.appendChild(avatar);
        typingDiv.appendChild(contentDiv);
        
        this.elements.messages.appendChild(typingDiv);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        this.isTyping = false;
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    // ============================================
    // SUGGESTIONS
    // ============================================
    showSuggestions(suggestions) {
        this.clearSuggestions();
        
        suggestions.forEach(suggestion => {
            const chip = document.createElement('button');
            chip.className = 'input-suggestion-chip';
            chip.textContent = suggestion;
            this.elements.inputSuggestions.appendChild(chip);
        });
    }

    clearSuggestions() {
        this.elements.inputSuggestions.innerHTML = '';
    }

    // ============================================
    // CHARTS
    // ============================================
    async generateCharts(chartRequests) {
        for (const request of chartRequests) {
            const chartContainer = document.createElement('div');
            chartContainer.className = 'chart-message';
            
            this.elements.messages.appendChild(chartContainer);
            
            if (this.charts) {
                await this.charts.createChart(request, chartContainer);
                this.chartCount++;
            }
            
            this.scrollToBottom();
        }
    }

    // ============================================
    // UTILITIES
    // ============================================
    toggleSidebar() {
        this.elements.sidebar.classList.toggle('mobile-open');
    }

    startNewChat() {
        if (confirm('Start a new conversation? Current chat will be saved.')) {
            this.elements.messages.innerHTML = '';
            
            // Re-show welcome screen
            if (this.elements.welcomeScreen) {
                this.elements.welcomeScreen.style.display = 'block';
            }
            
            this.messageCount = 0;
            this.chartCount = 0;
            
            if (this.engine) {
                this.engine.clearHistory();
            }
            
            if (this.charts) {
                this.charts.destroyAllCharts();
            }
            
            this.clearSuggestions();
        }
    }

    autoResizeTextarea() {
        const textarea = this.elements.input;
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }

    updateCharCounter() {
        const length = this.elements.input.value.length;
        this.elements.inputCounter.textContent = `${length}/2000`;
    }

    scrollToBottom() {
        const wrapper = document.querySelector('.fullpage-messages-wrapper');
        setTimeout(() => {
            wrapper.scrollTop = wrapper.scrollHeight;
        }, 100);
    }

    updateStats() {
        if (this.elements.statMessages) {
            this.elements.statMessages.textContent = this.messageCount;
        }
        if (this.elements.statCharts) {
            this.elements.statCharts.textContent = this.chartCount;
        }
        if (this.elements.statResponse) {
            const avgResponse = this.messageCount > 0 
                ? Math.round(this.totalResponseTime / this.messageCount)
                : 0;
            this.elements.statResponse.textContent = avgResponse + 'ms';
        }
    }

    showStats() {
        if (this.elements.floatingStats) {
            this.elements.floatingStats.style.display = 'block';
        }
    }

    hideStats() {
        if (this.elements.floatingStats) {
            this.elements.floatingStats.style.display = 'none';
        }
    }
}

// ============================================
// INITIALIZE ON DOM READY
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing Chatbot Full Page...');
    
    if (typeof ChatbotConfig === 'undefined') {
        console.error('❌ ChatbotConfig not defined!');
        return;
    }
    
    try {
        window.financialChatbotFullPage = new ChatbotFullPageUI(ChatbotConfig);
        console.log('✅ Chatbot Full Page ready!');
    } catch (error) {
        console.error('❌ Initialization error:', error);
    }
});