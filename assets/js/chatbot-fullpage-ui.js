// ============================================
// CHATBOT FULL PAGE UI - VERSION DEBUG
// ============================================

class ChatbotFullPageUI {
    constructor(config) {
        console.log('🚀 [UI] Constructor called');
        
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
            console.log('🎨 [UI] Initializing...');
            
            await new Promise(resolve => setTimeout(resolve, 100));
            
            this.cacheElements();
            this.createSidebarToggle();
            this.attachEventListeners();
            await this.initializeComponents();
            
            this.loadConversations();
            
            // Particles
            if (typeof initializeParticles === 'function') {
                console.log('✨ [UI] Initializing particles...');
                initializeParticles();
            }
            
            // Robot 3D
            console.log('🤖 [UI] Scheduling robot initialization...');
            setTimeout(() => {
                if (typeof initRobot3D === 'function') {
                    console.log('🤖 [UI] Calling initRobot3D()...');
                    initRobot3D();
                } else {
                    console.error('❌ [UI] initRobot3D function NOT FOUND!');
                }
            }, 800);
            
            console.log('✅ [UI] Initialization complete');
            
        } catch (error) {
            console.error('❌ [UI] Initialization error:', error);
        }
    }

    cacheElements() {
        console.log('📦 [UI] Caching elements...');
        
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
            conversationsList: document.getElementById('conversations-list')
        };
        
        console.log('✅ [UI] Elements cached:', Object.keys(this.elements).length);
        
        // Debug missing elements
        Object.entries(this.elements).forEach(([key, value]) => {
            if (!value) {
                console.warn(`⚠️ [UI] Element ${key} NOT FOUND!`);
            }
        });
    }

    createSidebarToggle() {
        console.log('🔘 [UI] Creating sidebar toggle button...');
        
        if (!this.elements.conversationsSidebar) {
            console.error('❌ [UI] Cannot create toggle: sidebar not found');
            return;
        }
        
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'sidebar-toggle-btn';
        toggleBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        toggleBtn.title = 'Toggle conversations';
        
        this.elements.conversationsSidebar.appendChild(toggleBtn);
        this.elements.sidebarToggle = toggleBtn;
        
        console.log('✅ [UI] Toggle button created');
    }

    attachEventListeners() {
        console.log('🔌 [UI] Attaching event listeners...');
        
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
        
        // Input events
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
        
        // Suggestions
        if (this.elements.inputSuggestions) {
            this.elements.inputSuggestions.addEventListener('click', (e) => {
                if (e.target.classList.contains('input-suggestion-chip')) {
                    this.sendMessage(e.target.textContent);
                }
            });
        }
        
        // New chat
        if (this.elements.newChatBtn) {
            this.elements.newChatBtn.addEventListener('click', () => {
                this.startNewConversation();
            });
        }
        
        // ✅ SIDEBAR TOGGLE
        if (this.elements.sidebarToggle) {
            this.elements.sidebarToggle.addEventListener('click', () => {
                console.log('🔘 [UI] Toggle clicked');
                this.toggleSidebar();
            });
        }
        
        // Conversations list
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
        
        console.log('✅ [UI] Event listeners attached');
    }

    async initializeComponents() {
        console.log('🔧 [UI] Initializing components...');
        
        if (typeof FinancialChatbotEngine !== 'undefined') {
            this.engine = new FinancialChatbotEngine(this.config);
            console.log('✅ [UI] Engine initialized');
        } else {
            console.warn('⚠️ [UI] FinancialChatbotEngine not found');
        }
        
        if (typeof ChatbotCharts !== 'undefined') {
            this.charts = new ChatbotCharts(this.config);
            console.log('✅ [UI] Charts initialized');
        } else {
            console.warn('⚠️ [UI] ChatbotCharts not found');
        }
        
        if (typeof ChatbotSuggestions !== 'undefined') {
            this.suggestions = new ChatbotSuggestions(this.config);
            console.log('✅ [UI] Suggestions initialized');
        } else {
            console.warn('⚠️ [UI] ChatbotSuggestions not found');
        }
    }

    // ============================================
    // SIDEBAR TOGGLE
    // ============================================
    toggleSidebar() {
        if (!this.elements.conversationsSidebar) {
            console.error('❌ [UI] Cannot toggle: sidebar not found');
            return;
        }
        
        this.isSidebarOpen = !this.isSidebarOpen;
        
        if (this.isSidebarOpen) {
            this.elements.conversationsSidebar.classList.remove('sidebar-closed');
            console.log('📂 [UI] Sidebar OPENED');
        } else {
            this.elements.conversationsSidebar.classList.add('sidebar-closed');
            console.log('📁 [UI] Sidebar CLOSED');
        }
    }

    // ============================================
    // CONVERSATIONS
    // ============================================
    loadConversations() {
        console.log('💾 [UI] Loading conversations...');
        
        const saved = localStorage.getItem('alphy_conversations');
        if (saved) {
            this.conversations = JSON.parse(saved);
            console.log('✅ [UI] Loaded', this.conversations.length, 'conversations');
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
        console.log('🆕 [UI] Starting new conversation...');
        
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
        
        console.log('✅ [UI] New conversation started:', newConv.id);
    }

    resetInterface() {
        console.log('🔄 [UI] Resetting interface...');
        
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
        
        if (typeof resetRobot3D === 'function') {
            resetRobot3D();
        }
        
        console.log('✅ [UI] Interface reset');
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
        console.log('✅ [UI] Conversation loaded:', id);
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
            console.log('✅ [UI] Conversation deleted:', id);
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

    // ============================================
    // MESSAGES
    // ============================================
    async sendMessage(messageText = null) {
        if (!this.elements.input) {
            console.error('❌ [UI] Input not found');
            return;
        }
        
        const message = messageText || this.elements.input.value.trim();
        
        if (!message || this.isTyping) {
            return;
        }
        
        console.log('📤 [UI] Sending message:', message);
        
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
            console.error('❌ [UI] Message processing error:', error);
            this.hideTypingIndicator();
            
            if (typeof setRobotThinking === 'function') {
                setRobotThinking(false);
            }
            
            this.addMessage('bot', '⚠️ Sorry, I encountered an error. Please try again.');
        }
    }

    addMessage(type, content, save = true) {
        if (!this.elements.messages) {
            console.error('❌ [UI] Messages container not found');
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
            console.log('👋 [UI] Welcome screen shown');
            
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
    console.log('🚀 [MAIN] DOM Content Loaded');
    console.log('📋 [MAIN] Checking dependencies...');
    
    // Check Three.js
    if (typeof THREE !== 'undefined') {
        console.log('✅ [MAIN] THREE.js loaded');
    } else {
        console.error('❌ [MAIN] THREE.js NOT loaded!');
    }
    
    // Check ChatbotConfig
    if (typeof ChatbotConfig === 'undefined') {
        console.error('❌ [MAIN] ChatbotConfig not defined!');
        return;
    }
    
    console.log('✅ [MAIN] ChatbotConfig found');
    
    try {
        window.financialChatbotFullPage = new ChatbotFullPageUI(ChatbotConfig);
        console.log('✅ [MAIN] Chatbot initialized successfully!');
    } catch (error) {
        console.error('❌ [MAIN] Initialization error:', error);
    }
});

console.log('📝 [MAIN] chatbot-fullpage-ui.js loaded');