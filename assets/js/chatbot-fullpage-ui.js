// ============================================
// CHATBOT FULLPAGE - CONVERSATION HANDLER
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
    
    initializeAI() {
        try {
            if (typeof FinancialChatbotEngine === 'undefined') {
                console.error('❌ FinancialChatbotEngine not found');
                return;
            }
            
            // Utiliser ChatbotConfig si disponible
            const config = typeof ChatbotConfig !== 'undefined' ? ChatbotConfig : {};
            this.aiEngine = new FinancialChatbotEngine(config);
            console.log('✅ AI Engine initialized');
        } catch (error) {
            console.error('❌ Error initializing AI:', error);
        }
    }
    
    attachEventListeners() {
        // History Toggle
        this.elements.historyToggle?.addEventListener('click', () => this.toggleHistory());
        
        // New Chat
        this.elements.newChat?.addEventListener('click', () => this.startNewConversation());
        
        // Clear History
        this.elements.clearHistory?.addEventListener('click', () => this.clearAllHistory());
        
        // Search History
        this.elements.historySearch?.addEventListener('input', (e) => this.searchHistory(e.target.value));
        
        // Send Message
        this.elements.btnSend?.addEventListener('click', () => this.sendMessage());
        
        // Enter to send (Shift+Enter for new line)
        this.elements.chatInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Auto-resize textarea
        this.elements.chatInput?.addEventListener('input', (e) => {
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
        });
        
        // Suggestion buttons
        document.querySelectorAll('.suggestion-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const message = btn.dataset.message;
                this.elements.chatInput.value = message;
                this.sendMessage();
            });
        });
        
        // Attachment (Coming Soon)
        this.elements.btnAttachment?.addEventListener('click', () => {
            alert('📎 File attachment feature coming soon!');
        });
    }
    
    toggleHistory() {
        this.elements.historySidebar?.classList.toggle('hidden');
        const icon = this.elements.historyToggle?.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-history');
            icon.classList.toggle('fa-times');
        }
    }
    
    startNewConversation() {
        if (this.messages.length > 0) {
            // Save current conversation
            this.saveCurrentConversation();
        }
        
        // Reset state
        this.currentConversationId = this.generateId();
        this.messages = [];
        
        // Clear UI
        this.elements.messagesContainer.innerHTML = '';
        this.elements.chatWelcome?.classList.remove('hidden');
        this.elements.chatInput.value = '';
        
        console.log('✅ New conversation started:', this.currentConversationId);
    }
    
    async sendMessage() {
        const message = this.elements.chatInput.value.trim();
        if (!message || this.isProcessing) return;
        
        this.isProcessing = true;
        this.elements.btnSend.disabled = true;
        
        // Hide welcome screen
        this.elements.chatWelcome?.classList.add('hidden');
        
        // Add user message
        this.addMessage('user', message);
        
        // Clear input
        this.elements.chatInput.value = '';
        this.elements.chatInput.style.height = 'auto';
        
        // Show typing indicator
        this.showTypingIndicator();
        
        try {
            // Process with AI
            if (this.aiEngine) {
                const response = await this.aiEngine.processMessage(message);
                
                // Hide typing indicator
                this.hideTypingIndicator();
                
                // Add AI response
                this.addMessage('assistant', response.text);
                
                // Handle charts if present
                if (response.chart) {
                    this.renderChart(response.chart);
                }
            } else {
                throw new Error('AI Engine not initialized');
            }
        } catch (error) {
            console.error('❌ Error processing message:', error);
            this.hideTypingIndicator();
            this.addMessage('assistant', '❌ Sorry, I encountered an error. Please try again.');
        } finally {
            this.isProcessing = false;
            this.elements.btnSend.disabled = false;
            this.elements.chatInput.focus();
            
            // Save conversation
            this.saveCurrentConversation();
        }
    }
    
    addMessage(role, content) {
        const messageData = {
            id: this.generateId(),
            role,
            content,
            timestamp: new Date().toISOString()
        };
        
        this.messages.push(messageData);
        
        // Create message element
        const messageEl = this.createMessageElement(messageData);
        this.elements.messagesContainer.appendChild(messageEl);
        
        // Scroll to bottom
        this.scrollToBottom();
    }
    
    createMessageElement(data) {
        const div = document.createElement('div');
        div.className = `message ${data.role}`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = data.role === 'user' 
            ? '<i class="fas fa-user"></i>' 
            : '<i class="fas fa-robot"></i>';
        
        const content = document.createElement('div');
        content.className = 'message-content';
        
        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        bubble.textContent = data.content;
        
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
        this.elements.typingIndicator.style.display = 'flex';
        this.scrollToBottom();
    }
    
    hideTypingIndicator() {
        this.elements.typingIndicator.style.display = 'none';
    }
    
    scrollToBottom() {
        setTimeout(() => {
            this.elements.messagesContainer.scrollTop = this.elements.messagesContainer.scrollHeight;
        }, 100);
    }
    
    renderChart(chartData) {
        // TODO: Implement chart rendering with Chart.js
        console.log('📊 Chart data received:', chartData);
    }
    
    saveCurrentConversation() {
        if (this.messages.length === 0) return;
        
        const conversation = {
            id: this.currentConversationId,
            title: this.generateConversationTitle(),
            messages: this.messages,
            createdAt: this.messages[0].timestamp,
            updatedAt: new Date().toISOString(),
            messageCount: this.messages.length
        };
        
        // Update or add conversation
        const index = this.conversations.findIndex(c => c.id === this.currentConversationId);
        if (index >= 0) {
            this.conversations[index] = conversation;
        } else {
            this.conversations.unshift(conversation);
        }
        
        // Save to localStorage
        this.saveToLocalStorage();
        
        // Update history UI
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
                <div class="history-item-title">${conversation.title}</div>
                <div class="history-item-preview">${preview}...</div>
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
        
        // Save current if needed
        if (this.messages.length > 0 && this.currentConversationId !== id) {
            this.saveCurrentConversation();
        }
        
        // Load conversation
        this.currentConversationId = id;
        this.messages = conversation.messages;
        
        // Clear and render messages
        this.elements.messagesContainer.innerHTML = '';
        this.elements.chatWelcome?.classList.add('hidden');
        
        this.messages.forEach(msg => {
            const el = this.createMessageElement(msg);
            this.elements.messagesContainer.appendChild(el);
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
    }
    
    clearAllHistory() {
        if (!confirm('Are you sure you want to delete all conversations? This action cannot be undone.')) {
            return;
        }
        
        this.conversations = [];
        this.currentConversationId = null;
        this.messages = [];
        
        localStorage.removeItem('chatbot_conversations');
        
        this.elements.messagesContainer.innerHTML = '';
        this.elements.chatWelcome?.classList.remove('hidden');
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
}

// ============================================
// AUTO-INITIALIZE
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    window.chatbotFullPage = new ChatbotFullPage();
    console.log('✅ ChatbotFullPage ready');
});