// ============================================
// CHATBOT FULLPAGE - TOUTES CORRECTIONS
// ============================================

class ChatbotFullPage {
    constructor() {
        console.log('🤖 Initializing Chatbot FullPage...');
        
        // DOM Elements
        this.elements = {
            historyToggle: document.getElementById('btnHistoryToggle'),
            newChat: document.getElementById('btnNewChat'),
            historySidebar: document.getElementById('historySidebar'),
            historyList: document.getElementById('historyList'),
            historySearch: document.getElementById('historySearch'),
            clearHistory: document.getElementById('btnClearHistory'),
            chatWelcome: document.getElementById('chatWelcome'),
            messagesContainer: document.getElementById('messagesContainer'),
            typingIndicator: document.getElementById('typingIndicator'),
            chatInput: document.getElementById('chatInput'),
            btnSend: document.getElementById('btnSend'),
            btnAttachment: document.getElementById('btnAttachment')
        };
        
        // Vérifier que les éléments essentiels existent
        this.checkRequiredElements();
        
        // State
        this.currentConversationId = null;
        this.conversations = [];
        this.messages = [];
        this.isProcessing = false;
        
        // Initialize AI Engine
        this.initializeAI();
        
        // Event Listeners
        this.attachEventListeners();
        
        // Load conversations from localStorage
        this.loadConversations();
        
        console.log('✅ Chatbot FullPage initialized');
    }
    
    checkRequiredElements() {
        const required = ['chatInput', 'btnSend', 'messagesContainer', 'chatWelcome'];
        const missing = required.filter(id => !this.elements[id]);
        
        if (missing.length > 0) {
            console.error('❌ Missing required elements:', missing);
        }
    }
    
    initializeAI() {
        try {
            if (typeof FinancialChatbotEngine === 'undefined') {
                console.warn('⚠️ FinancialChatbotEngine not found - using fallback');
                this.aiEngine = null;
                return;
            }
            
            const config = typeof ChatbotConfig !== 'undefined' ? ChatbotConfig : {};
            this.aiEngine = new FinancialChatbotEngine(config);
            console.log('✅ AI Engine initialized');
        } catch (error) {
            console.error('❌ Error initializing AI:', error);
            this.aiEngine = null;
        }
    }
    
    attachEventListeners() {
        console.log('📌 Attaching event listeners...');
        
        // History Toggle
        if (this.elements.historyToggle) {
            this.elements.historyToggle.addEventListener('click', () => this.toggleHistory());
            console.log('✅ History toggle attached');
        }
        
        // New Chat
        if (this.elements.newChat) {
            this.elements.newChat.addEventListener('click', () => this.startNewConversation());
            console.log('✅ New chat attached');
        }
        
        // Clear History
        if (this.elements.clearHistory) {
            this.elements.clearHistory.addEventListener('click', () => this.clearAllHistory());
            console.log('✅ Clear history attached');
        }
        
        // Search History
        if (this.elements.historySearch) {
            this.elements.historySearch.addEventListener('input', (e) => this.searchHistory(e.target.value));
            console.log('✅ Search history attached');
        }
        
        // Send Message - CORRECTION: Utiliser mousedown pour éviter les conflits
        if (this.elements.btnSend) {
            this.elements.btnSend.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🖱️ Send button clicked');
                this.sendMessage();
            });
            console.log('✅ Send button attached');
        }
        
        // Enter to send (Shift+Enter for new line)
        if (this.elements.chatInput) {
            this.elements.chatInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    console.log('⌨️ Enter pressed');
                    this.sendMessage();
                }
            });
            
            // Auto-resize textarea
            this.elements.chatInput.addEventListener('input', (e) => {
                e.target.style.height = 'auto';
                const newHeight = Math.min(e.target.scrollHeight, 200);
                e.target.style.height = newHeight + 'px';
            });
            
            console.log('✅ Input listeners attached');
        }
        
        // Suggestion buttons - CORRECTION: Délégation d'événement
        document.addEventListener('click', (e) => {
            const suggestionBtn = e.target.closest('.suggestion-btn');
            if (suggestionBtn) {
                e.preventDefault();
                const message = suggestionBtn.dataset.message || suggestionBtn.textContent.trim();
                console.log('💡 Suggestion clicked:', message);
                if (this.elements.chatInput) {
                    this.elements.chatInput.value = message;
                    this.sendMessage();
                }
            }
        });
        console.log('✅ Suggestion buttons attached (delegation)');
        
        // Attachment
        if (this.elements.btnAttachment) {
            this.elements.btnAttachment.addEventListener('click', () => {
                console.log('📎 Attachment clicked');
                alert('📎 File attachment feature coming soon!');
            });
            console.log('✅ Attachment button attached');
        }
        
        console.log('✅ All event listeners attached');
    }
    
    toggleHistory() {
        if (!this.elements.historySidebar) return;
        
        const isHidden = this.elements.historySidebar.classList.toggle('hidden');
        
        // Update icon
        const icon = this.elements.historyToggle?.querySelector('i');
        if (icon) {
            if (isHidden) {
                icon.className = 'fas fa-history';
            } else {
                icon.className = 'fas fa-times';
            }
        }
        
        console.log('📜 History toggled:', isHidden ? 'hidden' : 'visible');
    }
    
    startNewConversation() {
        if (this.messages.length > 0) {
            this.saveCurrentConversation();
        }
        
        this.currentConversationId = this.generateId();
        this.messages = [];
        
        if (this.elements.messagesContainer) {
            this.elements.messagesContainer.innerHTML = '';
        }
        
        if (this.elements.chatWelcome) {
            this.elements.chatWelcome.classList.remove('hidden');
        }
        
        if (this.elements.chatInput) {
            this.elements.chatInput.value = '';
            this.elements.chatInput.style.height = 'auto';
        }
        
        console.log('✅ New conversation started:', this.currentConversationId);
    }
    
    async sendMessage() {
        if (!this.elements.chatInput || !this.elements.btnSend) {
            console.error('❌ Input elements not found');
            return;
        }
        
        const message = this.elements.chatInput.value.trim();
        
        if (!message) {
            console.log('⚠️ Empty message, ignoring');
            return;
        }
        
        if (this.isProcessing) {
            console.log('⚠️ Already processing, ignoring');
            return;
        }
        
        console.log('📤 Sending message:', message);
        
        this.isProcessing = true;
        this.elements.btnSend.disabled = true;
        
        // Hide welcome screen
        if (this.elements.chatWelcome) {
            this.elements.chatWelcome.classList.add('hidden');
        }
        
        // Add user message
        this.addMessage('user', message);
        
        // Clear input
        this.elements.chatInput.value = '';
        this.elements.chatInput.style.height = 'auto';
        
        // Show typing indicator
        this.showTypingIndicator();
        
        try {
            let response;
            
            // Process with AI if available
            if (this.aiEngine && typeof this.aiEngine.processMessage === 'function') {
                console.log('🤖 Processing with AI Engine...');
                response = await this.aiEngine.processMessage(message);
            } else {
                // Fallback response
                console.log('⚠️ Using fallback response');
                response = await this.getFallbackResponse(message);
            }
            
            // Hide typing indicator
            this.hideTypingIndicator();
            
            // Add AI response
            const responseText = response.text || response.message || response;
            this.addMessage('assistant', responseText);
            
            // Handle charts if present
            if (response.chart) {
                this.renderChart(response.chart);
            }
            
        } catch (error) {
            console.error('❌ Error processing message:', error);
            this.hideTypingIndicator();
            this.addMessage('assistant', '❌ Sorry, I encountered an error. Please try again.');
        } finally {
            this.isProcessing = false;
            this.elements.btnSend.disabled = false;
            
            // Focus back on input
            if (this.elements.chatInput) {
                this.elements.chatInput.focus();
            }
            
            // Save conversation
            this.saveCurrentConversation();
        }
    }
    
    async getFallbackResponse(message) {
        // Simulate AI delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('bonjour')) {
            return { text: '👋 Hello! I\'m Alphy AI, your financial assistant. How can I help you today?' };
        }
        
        if (lowerMessage.includes('stock') || lowerMessage.includes('nvda') || lowerMessage.includes('aapl')) {
            return { text: '📊 I can help you analyze stocks! To access real-time data, please configure the Gemini API key in chatbot-config.js.' };
        }
        
        if (lowerMessage.includes('ipo')) {
            return { text: '🚀 I can analyze IPO opportunities! The full AI engine will provide detailed insights about recent and upcoming IPOs.' };
        }
        
        if (lowerMessage.includes('help') || lowerMessage.includes('aide')) {
            return { text: '💡 I can help you with:\n\n📈 Stock analysis\n🚀 IPO insights\n📊 Market data\n💰 Financial recommendations\n\nJust ask me anything!' };
        }
        
        return { text: `I received your message: "${message}"\n\nFor full AI capabilities, please configure the Gemini API key in chatbot-config.js.` };
    }
    
    addMessage(role, content) {
        if (!this.elements.messagesContainer) return;
        
        const messageData = {
            id: this.generateId(),
            role,
            content,
            timestamp: new Date().toISOString()
        };
        
        this.messages.push(messageData);
        
        const messageEl = this.createMessageElement(messageData);
        this.elements.messagesContainer.appendChild(messageEl);
        
        this.scrollToBottom();
        
        console.log('💬 Message added:', role, '-', content.substring(0, 50) + '...');
    }
    
    createMessageElement(data) {
        const div = document.createElement('div');
        div.className = `message ${data.role}`;
        div.dataset.messageId = data.id;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = data.role === 'user' 
            ? '<i class="fas fa-user"></i>' 
            : '<i class="fas fa-robot"></i>';
        
        const content = document.createElement('div');
        content.className = 'message-content';
        
        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        
        // Format text (preserve line breaks)
        const formattedContent = data.content.replace(/\n/g, '<br>');
        bubble.innerHTML = formattedContent;
        
        const time = document.createElement('div');
        time.className = 'message-time';
        time.textContent = this.formatTime(data.timestamp);
        
        content.appendChild(bubble);
        content.appendChild(time);
        
        div.appendChild(avatar);
        div.appendChild(content);
        
        return div;
    }
    
    showTypingIndicator() {
        if (this.elements.typingIndicator) {
            this.elements.typingIndicator.style.display = 'flex';
            this.scrollToBottom();
        }
    }
    
    hideTypingIndicator() {
        if (this.elements.typingIndicator) {
            this.elements.typingIndicator.style.display = 'none';
        }
    }
    
    scrollToBottom() {
        if (!this.elements.messagesContainer) return;
        
        setTimeout(() => {
            this.elements.messagesContainer.scrollTop = this.elements.messagesContainer.scrollHeight;
        }, 100);
    }
    
    renderChart(chartData) {
        console.log('📊 Chart data received:', chartData);
        // TODO: Implement chart rendering with ChatbotCharts
    }
    
    saveCurrentConversation() {
        if (this.messages.length === 0) return;
        
        const conversation = {
            id: this.currentConversationId || this.generateId(),
            title: this.generateConversationTitle(),
            messages: this.messages,
            createdAt: this.messages[0].timestamp,
            updatedAt: new Date().toISOString(),
            messageCount: this.messages.length
        };
        
        const index = this.conversations.findIndex(c => c.id === this.currentConversationId);
        if (index >= 0) {
            this.conversations[index] = conversation;
        } else {
            this.conversations.unshift(conversation);
        }
        
        this.saveToLocalStorage();
        this.renderHistory();
        
        console.log('💾 Conversation saved:', conversation.id);
    }
    
    loadConversations() {
        try {
            const saved = localStorage.getItem('chatbot_conversations');
            if (saved) {
                this.conversations = JSON.parse(saved);
                this.renderHistory();
                console.log('✅ Loaded', this.conversations.length, 'conversations');
            }
        } catch (error) {
            console.error('❌ Error loading conversations:', error);
        }
    }
    
    saveToLocalStorage() {
        try {
            localStorage.setItem('chatbot_conversations', JSON.stringify(this.conversations));
        } catch (error) {
            console.error('❌ Error saving to localStorage:', error);
        }
    }
    
    renderHistory() {
        if (!this.elements.historyList) return;
        
        if (this.conversations.length === 0) {
            this.elements.historyList.innerHTML = `
                <div class="history-empty">
                    <i class="fas fa-comments"></i>
                    <p>No conversations yet</p>
                    <small>Start chatting to see your history</small>
                </div>
            `;
            return;
        }
        
        this.elements.historyList.innerHTML = this.conversations
            .map(conv => this.createHistoryItem(conv))
            .join('');
        
        // Attach click handlers
        this.elements.historyList.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', () => {
                const convId = item.dataset.id;
                this.loadConversation(convId);
            });
        });
    }
    
    createHistoryItem(conversation) {
        const isActive = conversation.id === this.currentConversationId;
        const preview = conversation.messages[0]?.content.substring(0, 60) || 'No messages';
        
        return `
            <div class="history-item ${isActive ? 'active' : ''}" data-id="${conversation.id}">
                <div class="history-item-title">${this.escapeHtml(conversation.title)}</div>
                <div class="history-item-preview">${this.escapeHtml(preview)}...</div>
                <div class="history-item-meta">
                    <span class="history-item-date">
                        <i class="fas fa-clock"></i>
                        ${this.formatDate(conversation.updatedAt)}
                    </span>
                    <span class="history-item-count">${conversation.messageCount} msgs</span>
                </div>
            </div>
        `;
    }
    
    loadConversation(id) {
        const conversation = this.conversations.find(c => c.id === id);
        if (!conversation) return;
        
        if (this.messages.length > 0 && this.currentConversationId !== id) {
            this.saveCurrentConversation();
        }
        
        this.currentConversationId = id;
        this.messages = conversation.messages;
        
        if (this.elements.messagesContainer) {
            this.elements.messagesContainer.innerHTML = '';
        }
        
        if (this.elements.chatWelcome) {
            this.elements.chatWelcome.classList.add('hidden');
        }
        
        this.messages.forEach(msg => {
            const el = this.createMessageElement(msg);
            if (this.elements.messagesContainer) {
                this.elements.messagesContainer.appendChild(el);
            }
        });
        
        this.scrollToBottom();
        this.renderHistory();
        
        console.log('✅ Loaded conversation:', id);
    }
    
    searchHistory(query) {
        if (!query.trim()) {
            this.renderHistory();
            return;
        }
        
        const filtered = this.conversations.filter(conv => 
            conv.title.toLowerCase().includes(query.toLowerCase()) ||
            conv.messages.some(msg => msg.content.toLowerCase().includes(query.toLowerCase()))
        );
        
        if (filtered.length === 0) {
            this.elements.historyList.innerHTML = `
                <div class="history-empty">
                    <i class="fas fa-search"></i>
                    <p>No results found</p>
                    <small>Try a different search term</small>
                </div>
            `;
            return;
        }
        
        this.elements.historyList.innerHTML = filtered
            .map(conv => this.createHistoryItem(conv))
            .join('');
        
        // Re-attach click handlers
        this.elements.historyList.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', () => {
                const convId = item.dataset.id;
                this.loadConversation(convId);
            });
        });
    }
    
    clearAllHistory() {
        if (!confirm('Are you sure you want to delete all conversations? This action cannot be undone.')) {
            return;
        }
        
        this.conversations = [];
        this.currentConversationId = null;
        this.messages = [];
        
        localStorage.removeItem('chatbot_conversations');
        
        if (this.elements.messagesContainer) {
            this.elements.messagesContainer.innerHTML = '';
        }
        
        if (this.elements.chatWelcome) {
            this.elements.chatWelcome.classList.remove('hidden');
        }
        
        this.renderHistory();
        
        console.log('✅ All history cleared');
    }
    
    generateConversationTitle() {
        const firstMessage = this.messages[0]?.content || 'New Conversation';
        return firstMessage.length > 40 
            ? firstMessage.substring(0, 40) + '...' 
            : firstMessage;
    }
    
    generateId() {
        return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }
    
    formatDate(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
        });
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// ============================================
// AUTO-INITIALIZE
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.chatbotFullPage = new ChatbotFullPage();
        console.log('🎉 ChatbotFullPage ready!');
    } catch (error) {
        console.error('❌ Failed to initialize ChatbotFullPage:', error);
    }
});