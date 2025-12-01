// ============================================
// CHATBOT FULL PAGE UI - VERSION FINALE ✅
// Flèche d'ouverture + Zone pleine largeur
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
        
        this.conversations = [];
        this.currentConversationId = null;
        
        // ✅ État de la sidebar (mémorisé)
        this.sidebarCollapsed = this.loadSidebarState();
        
        this.init();
    }

    async init() {
        try {
            console.log('🎨 Initializing Full Page UI...');
            
            await new Promise(resolve => setTimeout(resolve, 100));
            
            this.cacheElements();
            this.createReopenButton(); // ✅ Créer le bouton de réouverture
            this.attachEventListeners();
            await this.initializeComponents();
            
            this.loadConversations();
            
            // ✅ Appliquer l'état sauvegardé de la sidebar
            this.applySidebarState();
            
            if (typeof initializeParticles === 'function') {
                initializeParticles();
            }
            
            console.log('✅ Full Page UI initialized');
            
        } catch (error) {
            console.error('❌ Full Page UI initialization error:', error);
        }
    }

    cacheElements() {
        this.elements = {
            messages: document.getElementById('chatbot-messages-content'),
            welcomeScreen: document.getElementById('welcome-screen'),
            input: document.getElementById('chatbot-input'),
            sendBtn: document.getElementById('chatbot-send-btn'),
            inputClearBtn: document.getElementById('input-clear-btn'),
            inputSuggestions: document.getElementById('input-suggestions'),
            inputCounter: document.getElementById('input-counter'),
            
            newChatBtn: document.getElementById('new-chat-btn'),
            shareBtn: document.getElementById('share-btn'),
            settingsBtn: document.getElementById('settings-btn'),
            
            conversationsSidebar: document.getElementById('conversations-sidebar'),
            conversationsToggle: document.getElementById('conversations-toggle'),
            conversationsList: document.getElementById('conversations-list'),
            
            chatMessagesArea: document.querySelector('.chat-messages-area')
        };
        
        console.log('📦 Elements cached');
    }

    // ✅ CRÉER LE BOUTON FLÈCHE DE RÉOUVERTURE
    createReopenButton() {
        if (!this.elements.chatMessagesArea) return;
        
        const reopenBtn = document.createElement('button');
        reopenBtn.className = 'sidebar-reopen-btn';
        reopenBtn.id = 'sidebar-reopen-btn';
        reopenBtn.setAttribute('aria-label', 'Open conversations sidebar');
        reopenBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        
        // Ajouter au début de la zone de messages
        this.elements.chatMessagesArea.insertBefore(reopenBtn, this.elements.chatMessagesArea.firstChild);
        
        this.elements.reopenBtn = reopenBtn;
        
        console.log('✅ Reopen button created');
    }

    attachEventListeners() {
        // ✅ BOUTON RÉOUVERTURE (Flèche à gauche)
        if (this.elements.reopenBtn) {
            this.elements.reopenBtn.addEventListener('click', () => {
                this.toggleConversationsSidebar();
            });
        }
        
        // Welcome suggestions
        const welcomeSuggestions = document.querySelectorAll('.welcome-suggestion-btn');
        welcomeSuggestions.forEach(btn => {
            btn.addEventListener('click', () => {
                const query = btn.dataset.query;
                if (query) {
                    this.sendMessage(query);
                }
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
                if (this.elements.input) {
                    this.elements.input.value = '';
                    this.autoResizeTextarea();
                    this.updateCharCounter();
                    this.elements.input.focus();
                }
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
        
        // New chat button
        if (this.elements.newChatBtn) {
            this.elements.newChatBtn.addEventListener('click', () => {
                this.startNewConversation();
            });
        }
        
        // ✅ CONVERSATIONS TOGGLE (Bouton dans la sidebar)
        if (this.elements.conversationsToggle) {
            this.elements.conversationsToggle.addEventListener('click', () => {
                this.toggleConversationsSidebar();
            });
        }
        
        // Conversations list delegation
        if (this.elements.conversationsList) {
            this.elements.conversationsList.addEventListener('click', (e) => {
                const item = e.target.closest('.conversation-item');
                const deleteBtn = e.target.closest('.conversation-delete');
                
                if (deleteBtn && item) {
                    e.stopPropagation();
                    this.deleteConversation(item.dataset.id);
                } else if (item) {
                    this.loadConversation(item.dataset.id);
                }
            });
        }
        
        console.log('✅ Event listeners attached');
    }

    async initializeComponents() {
        if (typeof FinancialChatbotEngine !== 'undefined') {
            this.engine = new FinancialChatbotEngine(this.config);
            console.log('✅ Engine initialized');
        }
        
        if (typeof ChatbotCharts !== 'undefined') {
            this.charts = new ChatbotCharts(this.config);
            console.log('✅ Charts initialized');
        }
        
        if (typeof ChatbotSuggestions !== 'undefined') {
            this.suggestions = new ChatbotSuggestions(this.config);
            console.log('✅ Suggestions initialized');
        }
    }

    // ============================================
    // ✅ GESTION SIDEBAR TOGGLE
    // ============================================
    
    toggleConversationsSidebar() {
        this.sidebarCollapsed = !this.sidebarCollapsed;
        this.applySidebarState();
        this.saveSidebarState();
        
        console.log(`📂 Sidebar ${this.sidebarCollapsed ? 'closed' : 'opened'}`);
    }
    
    applySidebarState() {
        if (!this.elements.conversationsSidebar) return;
        
        if (this.sidebarCollapsed) {
            this.elements.conversationsSidebar.classList.add('collapsed');
        } else {
            this.elements.conversationsSidebar.classList.remove('collapsed');
        }
    }
    
    saveSidebarState() {
        try {
            localStorage.setItem('alphy_sidebar_collapsed', JSON.stringify(this.sidebarCollapsed));
        } catch (e) {
            console.warn('⚠️ Could not save sidebar state:', e);
        }
    }
    
    loadSidebarState() {
        try {
            const saved = localStorage.getItem('alphy_sidebar_collapsed');
            return saved ? JSON.parse(saved) : false; // Par défaut : ouvert
        } catch (e) {
            console.warn('⚠️ Could not load sidebar state:', e);
            return false;
        }
    }

    // ============================================
    // CONVERSATIONS MANAGEMENT
    // ============================================
    loadConversations() {
        const saved = localStorage.getItem('alphy_conversations');
        if (saved) {
            this.conversations = JSON.parse(saved);
            console.log('✅ Conversations loaded:', this.conversations.length);
        } else {
            this.conversations = [];
        }
        
        if (this.conversations.length === 0) {
            this.startNewConversation();
        } else {
            this.currentConversationId = this.conversations[0].id;
        }
        
        this.renderConversations();
    }

    saveConversations() {
        localStorage.setItem('alphy_conversations', JSON.stringify(this.conversations));
    }

    startNewConversation() {
        console.log('🆕 Starting new conversation...');
        
        const newConv = {
            id: 'conv-' + Date.now(),
            title: 'New Conversation',
            messages: [],
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        
        this.conversations.unshift(newConv);
        this.currentConversationId = newConv.id;
        
        // ✅ RÉINITIALISER COMPLÈTEMENT L'INTERFACE
        this.resetInterface();
        
        this.saveConversations();
        this.renderConversations();
        
        console.log('✅ New conversation started:', newConv.id);
    }

    // ✅ RÉINITIALISER COMPLÈTEMENT L'INTERFACE
    resetInterface() {
        console.log('🔄 Resetting interface...');
        
        // Clear messages
        this.clearMessages();
        
        // Show welcome screen
        this.showWelcomeScreen();
        
        // Show initial suggestions
        this.showInitialSuggestions();
        
        // Clear input
        if (this.elements.input) {
            this.elements.input.value = '';
            this.autoResizeTextarea();
            this.updateCharCounter();
        }
        
        // Reset counters
        this.messageCount = 0;
        this.chartCount = 0;
        
        console.log('✅ Interface reset complete');
    }

    loadConversation(id) {
        const conv = this.conversations.find(c => c.id === id);
        if (!conv) return;
        
        this.currentConversationId = id;
        this.clearMessages();
        
        if (conv.messages.length === 0) {
            this.showWelcomeScreen();
            this.showInitialSuggestions();
        } else {
            this.hideWelcomeScreen();
            conv.messages.forEach(msg => {
                this.addMessage(msg.type, msg.content, false);
            });
        }
        
        this.renderConversations();
        console.log('✅ Conversation loaded:', id);
    }

    deleteConversation(id) {
        if (confirm('Delete this conversation?')) {
            this.conversations = this.conversations.filter(c => c.id !== id);
            
            if (this.currentConversationId === id) {
                if (this.conversations.length > 0) {
                    this.loadConversation(this.conversations[0].id);
                } else {
                    this.startNewConversation();
                }
            }
            
            this.saveConversations();
            this.renderConversations();
            console.log('✅ Conversation deleted:', id);
        }
    }

    getCurrentConversation() {
        return this.conversations.find(c => c.id === this.currentConversationId);
    }

    updateConversationTitle(message) {
        const conv = this.getCurrentConversation();
        if (conv && conv.title === 'New Conversation') {
            conv.title = message.substring(0, 50) + (message.length > 50 ? '...' : '');
            this.saveConversations();
            this.renderConversations();
        }
    }

    renderConversations() {
        if (!this.elements.conversationsList) return;
        
        const groups = {
            today: [],
            yesterday: [],
            lastWeek: []
        };
        
        const now = Date.now();
        const oneDayMs = 86400000;
        
        this.conversations.forEach(conv => {
            const age = now - conv.updatedAt;
            
            if (age < oneDayMs) {
                groups.today.push(conv);
            } else if (age < oneDayMs * 2) {
                groups.yesterday.push(conv);
            } else {
                groups.lastWeek.push(conv);
            }
        });
        
        let html = '';
        
        if (groups.today.length > 0) {
            html += `<div class="conversation-group">
                <h4 class="group-title">Today</h4>
                ${groups.today.map(c => this.renderConversationItem(c)).join('')}
            </div>`;
        }
        
        if (groups.yesterday.length > 0) {
            html += `<div class="conversation-group">
                <h4 class="group-title">Yesterday</h4>
                ${groups.yesterday.map(c => this.renderConversationItem(c)).join('')}
            </div>`;
        }
        
        if (groups.lastWeek.length > 0) {
            html += `<div class="conversation-group">
                <h4 class="group-title">Last 7 Days</h4>
                ${groups.lastWeek.map(c => this.renderConversationItem(c)).join('')}
            </div>`;
        }
        
        this.elements.conversationsList.innerHTML = html;
    }

    renderConversationItem(conv) {
        const isActive = conv.id === this.currentConversationId;
        return `
            <div class="conversation-item ${isActive ? 'active' : ''}" data-id="${conv.id}">
                <i class="fas fa-message"></i>
                <span class="conversation-title">${this.escapeHtml(conv.title)}</span>
                <button class="conversation-delete" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ============================================
    // SEND MESSAGE
    // ============================================
    async sendMessage(messageText = null) {
        if (!this.elements.input) {
            console.error('❌ Input element not found!');
            return;
        }
        
        const message = messageText || this.elements.input.value.trim();
        
        if (!message || this.isTyping) {
            return;
        }
        
        console.log('📤 Sending message:', message);
        
        this.hideWelcomeScreen();
        
        this.elements.input.value = '';
        this.autoResizeTextarea();
        this.updateCharCounter();
        
        this.addMessage('user', message);
        this.updateConversationTitle(message);
        
        this.clearSuggestions();
        this.showTypingIndicator();
        
        try {
            const startTime = performance.now();
            
            if (!this.engine) {
                throw new Error('Engine not initialized');
            }
            
            const response = await this.engine.processMessage(message);
            
            const responseTime = performance.now() - startTime;
            this.totalResponseTime += responseTime;
            
            this.hideTypingIndicator();
            
            this.addMessage('bot', response.text);
            
            if (response.chartRequests && response.chartRequests.length > 0) {
                await this.generateCharts(response.chartRequests);
            }
            
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
            
        } catch (error) {
            console.error('❌ Message processing error:', error);
            this.hideTypingIndicator();
            this.addMessage('bot', '⚠️ Sorry, I encountered an error. Please try again.');
        }
    }

    addMessage(type, content, save = true) {
        if (!this.elements.messages) {
            console.error('❌ Messages container not found!');
            return;
        }
        
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
        
        if (save) {
            const conv = this.getCurrentConversation();
            if (conv) {
                conv.messages.push({ type, content, timestamp: Date.now() });
                conv.updatedAt = Date.now();
                this.saveConversations();
            }
        }
    }

    formatMessage(text) {
        return text
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/`(.+?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }

    showTypingIndicator() {
        if (!this.elements.messages) return;
        
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

    // ✅ AFFICHER LES SUGGESTIONS INITIALES
    showInitialSuggestions() {
        if (this.suggestions) {
            const initial = this.suggestions.getInitialSuggestions();
            this.showSuggestions(initial);
        }
    }

    showSuggestions(suggestions) {
        if (!this.elements.inputSuggestions) return;
        
        this.clearSuggestions();
        
        suggestions.forEach(suggestion => {
            const chip = document.createElement('button');
            chip.className = 'input-suggestion-chip';
            chip.textContent = suggestion;
            this.elements.inputSuggestions.appendChild(chip);
        });
    }

    clearSuggestions() {
        if (this.elements.inputSuggestions) {
            this.elements.inputSuggestions.innerHTML = '';
        }
    }

    async generateCharts(chartRequests) {
        if (!this.elements.messages || !this.charts) return;
        
        for (const request of chartRequests) {
            const chartContainer = document.createElement('div');
            chartContainer.className = 'chart-message';
            
            this.elements.messages.appendChild(chartContainer);
            
            await this.charts.createChart(request, chartContainer);
            this.chartCount++;
            
            this.scrollToBottom();
        }
    }

    clearMessages() {
        if (this.elements.messages) {
            // ✅ IMPORTANT : Ne vider que les messages, pas le welcome screen
            const messages = this.elements.messages.querySelectorAll('.message, .chart-message, #typing-indicator');
            messages.forEach(msg => msg.remove());
        }
    }

    showWelcomeScreen() {
        if (this.elements.welcomeScreen) {
            this.elements.welcomeScreen.style.display = 'block';
            console.log('👋 Welcome screen shown');
        }
    }

    hideWelcomeScreen() {
        if (this.elements.welcomeScreen) {
            this.elements.welcomeScreen.style.display = 'none';
        }
    }

    autoResizeTextarea() {
        if (!this.elements.input) return;
        
        const textarea = this.elements.input;
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }

    updateCharCounter() {
        if (!this.elements.input || !this.elements.inputCounter) return;
        
        const length = this.elements.input.value.length;
        this.elements.inputCounter.textContent = `${length}/2000`;
    }

    scrollToBottom() {
        const wrapper = document.querySelector('.chatbot-messages-wrapper');
        if (wrapper) {
            setTimeout(() => {
                wrapper.scrollTop = wrapper.scrollHeight;
            }, 100);
        }
    }
}

// ============================================
// INITIALIZE
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