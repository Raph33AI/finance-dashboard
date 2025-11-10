// ============================================
// CHATBOT FULL PAGE UI - VERSION FINALE
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
        
        this.isSidebarOpen = true;
        
        this.init();
    }

    async init() {
        try {
            console.log('🎨 Initializing Full Page UI...');
            
            await new Promise(resolve => setTimeout(resolve, 100));
            
            this.cacheElements();
            this.attachEventListeners();
            await this.initializeComponents();
            
            this.loadConversations();
            
            if (typeof initializeParticles === 'function') {
                initializeParticles();
            }
            
            // ✅ INITIALISER LE ROBOT 3D (APRÈS DOM READY)
            setTimeout(() => {
                if (typeof initRobot3D === 'function') {
                    console.log('🤖 Initializing 3D Robot...');
                    initRobot3D();
                } else {
                    console.warn('⚠️ initRobot3D function not found');
                }
            }, 500);
            
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
            conversationsList: document.getElementById('conversations-list')
        };
        
        console.log('📦 Elements cached:', this.elements);
    }

    attachEventListeners() {
        const welcomeSuggestions = document.querySelectorAll('.welcome-suggestion-btn');
        welcomeSuggestions.forEach(btn => {
            btn.addEventListener('click', () => {
                const query = btn.dataset.query;
                if (query) {
                    this.sendMessage(query);
                }
            });
        });
        
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
        
        if (this.elements.sendBtn) {
            this.elements.sendBtn.addEventListener('click', () => {
                this.sendMessage();
            });
        }
        
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
        
        if (this.elements.inputSuggestions) {
            this.elements.inputSuggestions.addEventListener('click', (e) => {
                if (e.target.classList.contains('input-suggestion-chip')) {
                    this.sendMessage(e.target.textContent);
                }
            });
        }
        
        if (this.elements.newChatBtn) {
            this.elements.newChatBtn.addEventListener('click', () => {
                this.startNewConversation();
            });
        }
        
        // ✅ TOGGLE CONVERSATIONS
        if (this.elements.conversationsToggle) {
            this.elements.conversationsToggle.addEventListener('click', () => {
                this.toggleConversationsSidebar();
            });
        }
        
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
        
        this.resetInterface();
        
        this.saveConversations();
        this.renderConversations();
        
        console.log('✅ New conversation started:', newConv.id);
    }

    resetInterface() {
        console.log('🔄 Resetting interface...');
        
        this.clearMessages();
        this.showWelcomeScreen();
        this.showInitialSuggestions();
        
        if (this.elements.input) {
            this.elements.input.value = '';
            this.autoResizeTextarea();
            this.updateCharCounter();
        }
        
        this.messageCount = 0;
        this.chartCount = 0;
        
        // ✅ RÉINITIALISER LE ROBOT
        if (typeof resetRobot3D === 'function') {
            resetRobot3D();
        }
        
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
                <span class="conversation-title">${conv.title}</span>
                <button class="conversation-delete" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    }

    // ✅ TOGGLE SIDEBAR (AVEC WIDTH AU LIEU DE TRANSFORM)
    toggleConversationsSidebar() {
        if (!this.elements.conversationsSidebar) {
            console.error('❌ Sidebar element not found');
            return;
        }
        
        this.isSidebarOpen = !this.isSidebarOpen;
        
        if (this.isSidebarOpen) {
            this.elements.conversationsSidebar.classList.remove('closed');
            console.log('📂 Sidebar opened');
        } else {
            this.elements.conversationsSidebar.classList.add('closed');
            console.log('📁 Sidebar closed');
        }
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
        
        if (typeof setRobotThinking === 'function') {
            setRobotThinking(true);
        }
        
        try {
            const startTime = performance.now();
            
            if (!this.engine) {
                throw new Error('Engine not initialized');
            }
            
            const response = await this.engine.processMessage(message);
            
            const responseTime = performance.now() - startTime;
            this.totalResponseTime += responseTime;
            
            this.hideTypingIndicator();
            
            if (typeof setRobotTalking === 'function') {
                setRobotTalking(true);
                setTimeout(() => setRobotTalking(false), 2000);
            }
            
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
            
            if (typeof setRobotThinking === 'function') {
                setRobotThinking(false);
            }
            
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
        
        if (typeof setRobotThinking === 'function') {
            setRobotThinking(false);
        }
    }

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
            const messages = this.elements.messages.querySelectorAll('.message, .chart-message, #typing-indicator');
            messages.forEach(msg => msg.remove());
        }
    }

    showWelcomeScreen() {
        if (this.elements.welcomeScreen) {
            this.elements.welcomeScreen.style.display = 'block';
            console.log('👋 Welcome screen shown');
            
            // ✅ RÉINITIALISER LE ROBOT APRÈS AFFICHAGE
            setTimeout(() => {
                if (typeof resetRobot3D === 'function') {
                    resetRobot3D();
                } else if (typeof initRobot3D === 'function') {
                    initRobot3D();
                }
            }, 100);
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