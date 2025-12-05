// ============================================
// CHATBOT UI v2.0 - PREMIUM INTERFACE
// ✅ AVEC SAUVEGARDE/RESTAURATION DES GRAPHIQUES
// ============================================

class ChatbotUI {
    constructor(config) {
        this.config = config;
        this.engine = null;
        this.charts = null;
        this.suggestions = null;
        
        // UI Elements (will be initialized)
        this.elements = {};
        
        // State
        this.isOpen = false;
        this.isTyping = false;
        this.messageCount = 0;
        
        // ✅ NOUVEAU: Stockage des messages et graphiques
        this.conversationHistory = [];
        this.conversationKey = 'alphyai_conversation';
        this.chartsDataKey = 'alphyai_charts_data';
        
        // Debounce timer
        this.inputDebounceTimer = null;
        
        // Initialize
        this.init();
    }

    // ============================================
    // INITIALIZATION
    // ============================================
    async init() {
        try {
            console.log('🎨 Création de l\'interface UI...');
            
            // Create UI structure
            this.createUI();
            
            // Wait for DOM insertion
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Get element references
            this.cacheElements();
            
            // Attach event listeners
            this.attachEventListeners();
            
            // Initialize components
            await this.initializeComponents();
            
            // ✅ NOUVEAU: Restaurer la conversation sauvegardée
            await this.restoreConversation();
            
            // Show welcome message (seulement si aucune conversation restaurée)
            if (this.conversationHistory.length === 0) {
                this.showWelcomeMessage();
                this.showInitialSuggestions();
            }
            
            console.log('✅ Chatbot UI initialized successfully');
            
        } catch (error) {
            console.error('❌ UI initialization error:', error);
        }
    }

    // ============================================
    // CREATE UI STRUCTURE
    // ============================================
    createUI() {
        const container = document.createElement('div');
        container.className = 'chatbot-container';
        container.innerHTML = `
            <!-- Toggle Button -->
            <button class="chatbot-toggle-btn" id="chatbot-toggle" aria-label="Toggle chatbot">
                🤖
            </button>
            
            <!-- Chatbot Widget -->
            <div class="chatbot-widget hidden" id="chatbot-widget">
                <!-- Header -->
                <div class="chatbot-header">
                    <div class="chatbot-header-content">
                        <div class="chatbot-avatar">
                            ${this.config.ui.botAvatar}
                        </div>
                        <div class="chatbot-title-section">
                            <h3 class="chatbot-title">Alphy - Financial AI Assistant</h3>
                            <div class="chatbot-status">
                                <span class="status-indicator"></span>
                                <span>Online</span>
                            </div>
                        </div>
                    </div>
                    <div class="chatbot-header-actions">
                        <button class="chatbot-header-btn" id="clear-chat" aria-label="Clear chat" title="Clear chat">
                            🗑
                        </button>
                        <button class="chatbot-header-btn" id="minimize-chat" aria-label="Minimize" title="Minimize">
                            ➖
                        </button>
                    </div>
                </div>
                
                <!-- Messages Container -->
                <div class="chatbot-messages" id="chatbot-messages">
                    <!-- Messages will be added here -->
                </div>
                
                <!-- Suggestions -->
                <div class="chatbot-suggestions" id="chatbot-suggestions">
                    <!-- Suggestions will be added here -->
                </div>
                
                <!-- Input Area -->
                <div class="chatbot-input-area">
                    <div class="chatbot-input-container">
                        <div class="chatbot-input-wrapper">
                            <textarea 
                                class="chatbot-input" 
                                id="chatbot-input" 
                                placeholder="${this.config.ui.placeholderText}"
                                rows="1"
                                maxlength="${this.config.behavior.maxMessageLength}"
                            ></textarea>
                        </div>
                        <button class="chatbot-send-btn" id="chatbot-send" aria-label="Send message">
                            ➤
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(container);
        console.log('✅ UI structure created');
    }

    // ============================================
    // CACHE DOM ELEMENTS
    // ============================================
    cacheElements() {
        console.log('📦 Caching DOM elements...');
        
        this.elements = {
            container: document.querySelector('.chatbot-container'),
            toggleBtn: document.getElementById('chatbot-toggle'),
            widget: document.getElementById('chatbot-widget'),
            messages: document.getElementById('chatbot-messages'),
            suggestions: document.getElementById('chatbot-suggestions'),
            input: document.getElementById('chatbot-input'),
            sendBtn: document.getElementById('chatbot-send'),
            clearBtn: document.getElementById('clear-chat'),
            minimizeBtn: document.getElementById('minimize-chat')
        };
        
        // Verify all elements
        let missingElements = [];
        for (const [key, element] of Object.entries(this.elements)) {
            if (!element) {
                missingElements.push(key);
                console.error(`❌ Element missing: ${key}`);
            } else {
                console.log(`✅ Element cached: ${key}`);
            }
        }
        
        if (missingElements.length > 0) {
            console.error('❌ Missing elements:', missingElements);
        } else {
            console.log('✅ All elements cached successfully');
        }
    }

    // ============================================
    // ATTACH EVENT LISTENERS
    // ============================================
    attachEventListeners() {
        console.log('🔗 Attaching event listeners...');
        
        // Toggle button
        if (this.elements.toggleBtn) {
            const newToggleBtn = this.elements.toggleBtn.cloneNode(true);
            this.elements.toggleBtn.parentNode.replaceChild(newToggleBtn, this.elements.toggleBtn);
            this.elements.toggleBtn = newToggleBtn;
            
            this.elements.toggleBtn.addEventListener('click', (e) => {
                console.log('🖱 TOGGLE BUTTON CLICKED!');
                e.preventDefault();
                e.stopPropagation();
                this.toggleChat();
            }, { capture: true, passive: false });
            
            console.log('✅ Toggle button listener attached');
        }
        
        // Minimize button
        if (this.elements.minimizeBtn) {
            const newMinimizeBtn = this.elements.minimizeBtn.cloneNode(true);
            this.elements.minimizeBtn.parentNode.replaceChild(newMinimizeBtn, this.elements.minimizeBtn);
            this.elements.minimizeBtn = newMinimizeBtn;
            
            this.elements.minimizeBtn.addEventListener('click', (e) => {
                console.log('🖱 MINIMIZE CLICKED');
                e.preventDefault();
                e.stopPropagation();
                this.toggleChat();
            }, { capture: true, passive: false });
            
            console.log('✅ Minimize button listener attached');
        }
        
        // Clear button
        if (this.elements.clearBtn) {
            const newClearBtn = this.elements.clearBtn.cloneNode(true);
            this.elements.clearBtn.parentNode.replaceChild(newClearBtn, this.elements.clearBtn);
            this.elements.clearBtn = newClearBtn;
            
            this.elements.clearBtn.addEventListener('click', (e) => {
                console.log('🖱 CLEAR CLICKED');
                e.preventDefault();
                e.stopPropagation();
                this.clearChat();
            }, { capture: true, passive: false });
            
            console.log('✅ Clear button listener attached');
        }
        
        // Send button
        if (this.elements.sendBtn) {
            this.elements.sendBtn.addEventListener('click', (e) => {
                console.log('🖱 SEND CLICKED');
                e.preventDefault();
                e.stopPropagation();
                this.sendMessage();
            });
            console.log('✅ Send button listener attached');
        }
        
        // Input field
        if (this.elements.input) {
            this.elements.input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
            
            this.elements.input.addEventListener('input', () => {
                this.autoResizeTextarea();
            });
            console.log('✅ Input listeners attached');
        }
        
        // Suggestions delegation
        if (this.elements.suggestions) {
            this.elements.suggestions.addEventListener('click', (e) => {
                if (e.target.classList.contains('suggestion-chip')) {
                    console.log('🖱 SUGGESTION CLICKED');
                    this.onSuggestionClick(e.target.textContent);
                }
            });
            console.log('✅ Suggestions listener attached');
        }
        
        console.log('✅ All event listeners attached');
    }

    // ============================================
    // INITIALIZE COMPONENTS
    // ============================================
    async initializeComponents() {
        console.log('🔧 Initializing components...');
        
        // Initialize engine
        if (typeof FinancialChatbotEngine !== 'undefined') {
            this.engine = new FinancialChatbotEngine(this.config);
            console.log('✅ Engine initialized');
        } else {
            console.warn('⚠ FinancialChatbotEngine not available');
        }
        
        // Initialize charts
        if (typeof ChatbotCharts !== 'undefined') {
            this.charts = new ChatbotCharts(this.config);
            console.log('✅ Charts initialized');
        } else {
            console.warn('⚠ ChatbotCharts not available');
        }
        
        // Initialize suggestions
        if (typeof ChatbotSuggestions !== 'undefined') {
            this.suggestions = new ChatbotSuggestions(this.config);
            console.log('✅ Suggestions initialized');
        } else {
            console.warn('⚠ ChatbotSuggestions not available');
        }
    }

    // ============================================
    // TOGGLE CHAT
    // ============================================
    toggleChat() {
        console.log('🔄 toggleChat() called');
        console.log('Current isOpen:', this.isOpen);
        
        if (!this.elements.widget) {
            console.error('❌ Widget element not found!');
            return;
        }
        
        this.isOpen = !this.isOpen;
        console.log('New isOpen:', this.isOpen);
        
        if (this.isOpen) {
            console.log('📂 Opening chatbot...');
            this.elements.widget.style.display = 'flex';
            this.elements.widget.classList.remove('hidden');
            this.elements.widget.classList.add('chatbot-open');
            
            setTimeout(() => {
                this.elements.widget.classList.add('bounce-in');
            }, 10);
            
            setTimeout(() => {
                if (this.elements.input) {
                    this.elements.input.focus();
                }
            }, 300);
            
            console.log('✅ Chatbot opened');
            
        } else {
            console.log('📁 Closing chatbot...');
            this.elements.widget.classList.remove('bounce-in');
            this.elements.widget.classList.remove('chatbot-open');
            
            setTimeout(() => {
                this.elements.widget.classList.add('hidden');
                this.elements.widget.style.display = '';
            }, 300);
            
            console.log('✅ Chatbot closed');
        }
        
        return true;
    }

    // ============================================
    // SEND MESSAGE
    // ============================================
    async sendMessage() {
        const message = this.elements.input.value.trim();
        
        if (!message || this.isTyping) return;
        
        console.log('📤 Sending message:', message);
        
        // Clear input
        this.elements.input.value = '';
        this.autoResizeTextarea();
        
        // Add user message to UI
        this.addMessage('user', message);
        
        // Clear suggestions
        this.clearSuggestions();
        
        // Show typing indicator
        this.showTypingIndicator();
        
        try {
            // Process message through engine
            const response = await this.engine.processMessage(message);
            
            // Hide typing indicator
            this.hideTypingIndicator();
            
            // Add AI response to UI
            this.addMessage('bot', response.text, response.chartRequests);
            
            // Generate charts if requested
            if (response.chartRequests && response.chartRequests.length > 0) {
                await this.generateCharts(response.chartRequests);
            }
            
            // Show contextual suggestions
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
            console.error('Message processing error:', error);
            this.hideTypingIndicator();
            this.addMessage('bot', '⚠ Sorry, I encountered an error. Please try again.');
        }
    }

    // ============================================
    // ✅ ADD MESSAGE (AVEC SAUVEGARDE)
    // ============================================
    addMessage(type, content, chartRequests = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message fade-in`;
        
        const avatar = document.createElement('div');
        avatar.className = `message-avatar ${type}-avatar`;
        avatar.textContent = type === 'user' ? this.config.ui.userAvatar : this.config.ui.botAvatar;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        
        const text = document.createElement('div');
        text.className = 'message-text';
        text.innerHTML = this.formatMessage(content);
        
        bubble.appendChild(text);
        
        if (this.config.ui.showTimestamps) {
            const time = document.createElement('span');
            time.className = 'message-time';
            time.textContent = new Date().toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            bubble.appendChild(time);
        }
        
        contentDiv.appendChild(bubble);
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(contentDiv);
        
        this.elements.messages.appendChild(messageDiv);
        this.scrollToBottom();
        
        this.messageCount++;
        
        // ✅ NOUVEAU: Sauvegarder dans l'historique
        this.conversationHistory.push({
            type: type,
            content: content,
            timestamp: Date.now(),
            chartRequests: chartRequests || null
        });
        
        this.saveConversation();
    }

    // ============================================
    // FORMAT MESSAGE
    // ============================================
    formatMessage(text) {
        let formatted = text
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/`(.+?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
        
        return formatted;
    }

    // ============================================
    // TYPING INDICATOR
    // ============================================
    showTypingIndicator() {
        this.isTyping = true;
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message fade-in';
        typingDiv.id = 'typing-indicator';
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar bot-avatar';
        avatar.textContent = this.config.ui.botAvatar;
        
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
            chip.className = 'suggestion-chip';
            chip.textContent = suggestion;
            this.elements.suggestions.appendChild(chip);
        });
    }

    showInitialSuggestions() {
        if (this.suggestions) {
            const initial = this.suggestions.getInitialSuggestions();
            this.showSuggestions(initial);
        }
    }

    clearSuggestions() {
        this.elements.suggestions.innerHTML = '';
    }

    onSuggestionClick(suggestion) {
        this.elements.input.value = suggestion;
        this.sendMessage();
        
        if (this.suggestions) {
            this.suggestions.onSuggestionClicked(suggestion);
        }
    }

    // ============================================
    // ✅ CHARTS (AVEC SAUVEGARDE DES MÉTADONNÉES)
    // ============================================
    async generateCharts(chartRequests) {
        for (const request of chartRequests) {
            const chartContainer = document.createElement('div');
            chartContainer.className = 'chart-message';
            
            // ✅ IMPORTANT: Ajouter un attribut data pour identifier le conteneur
            const chartId = `chart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            chartContainer.setAttribute('data-chart-container', chartId);
            
            this.elements.messages.appendChild(chartContainer);
            
            if (this.charts) {
                const createdChartId = await this.charts.createChart(request, chartContainer);
                
                // ✅ NOUVEAU: Sauvegarder les données du graphique
                this.charts.chartDataStore.set(createdChartId, {
                    chartRequest: request,
                    containerId: chartId
                });
            }
            
            this.scrollToBottom();
        }
        
        // ✅ Sauvegarder les données des graphiques
        this.saveChartsData();
    }

    // ============================================
    // WELCOME MESSAGE
    // ============================================
    showWelcomeMessage() {
        setTimeout(() => {
            this.addMessage('bot', this.config.ui.welcomeMessage);
        }, 500);
    }

    // ============================================
    // ✅ CLEAR CHAT (AVEC NETTOYAGE COMPLET)
    // ============================================
    clearChat() {
        if (confirm('Clear all messages?')) {
            // Nettoyer le DOM
            this.elements.messages.innerHTML = '';
            this.messageCount = 0;
            
            // Nettoyer l'historique
            this.conversationHistory = [];
            
            // Nettoyer le localStorage
            localStorage.removeItem(this.conversationKey);
            localStorage.removeItem(this.chartsDataKey);
            
            // Nettoyer l'engine
            if (this.engine) {
                this.engine.clearHistory();
            }
            
            // Détruire tous les graphiques
            if (this.charts) {
                this.charts.destroyAllCharts();
                this.charts.chartDataStore.clear();
            }
            
            console.log('✅ Chat cleared completely');
            
            // Afficher le message de bienvenue
            this.showWelcomeMessage();
            this.showInitialSuggestions();
        }
    }

    // ════════════════════════════════════════════════════════════
    // ✅ SAUVEGARDE & RESTAURATION (NOUVEAU)
    // ════════════════════════════════════════════════════════════

    /**
     * Sauvegarde la conversation dans localStorage
     */
    saveConversation() {
        try {
            const data = {
                history: this.conversationHistory,
                timestamp: Date.now(),
                version: '2.0'
            };
            
            localStorage.setItem(this.conversationKey, JSON.stringify(data));
            console.log(`💾 Conversation saved (${this.conversationHistory.length} messages)`);
            
        } catch (error) {
            console.error('❌ Error saving conversation:', error);
        }
    }

    /**
     * Sauvegarde les données des graphiques
     */
    saveChartsData() {
        if (!this.charts) return;
        
        try {
            const chartsData = this.charts.exportChartsData();
            localStorage.setItem(this.chartsDataKey, JSON.stringify(chartsData));
            console.log(`💾 Charts data saved (${Object.keys(chartsData).length} charts)`);
            
        } catch (error) {
            console.error('❌ Error saving charts data:', error);
        }
    }

    /**
     * Restaure la conversation depuis localStorage
     */
    async restoreConversation() {
        try {
            console.log('🔄 Attempting to restore conversation...');
            
            // Charger les données de conversation
            const savedData = localStorage.getItem(this.conversationKey);
            
            if (!savedData) {
                console.log('ℹ No saved conversation found');
                return;
            }
            
            const data = JSON.parse(savedData);
            
            if (!data.history || !Array.isArray(data.history)) {
                console.warn('⚠ Invalid conversation data');
                return;
            }
            
            console.log(`📥 Restoring ${data.history.length} messages...`);
            
            // Restaurer les messages
            for (const msg of data.history) {
                await this.restoreMessage(msg);
            }
            
            // Restaurer les graphiques
            await this.restoreCharts();
            
            console.log('✅ Conversation restored successfully');
            
        } catch (error) {
            console.error('❌ Error restoring conversation:', error);
            // En cas d'erreur, nettoyer les données corrompues
            localStorage.removeItem(this.conversationKey);
            localStorage.removeItem(this.chartsDataKey);
        }
    }

    /**
     * Restaure un message individuel
     */
    async restoreMessage(msg) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${msg.type}-message`;
        
        const avatar = document.createElement('div');
        avatar.className = `message-avatar ${msg.type}-avatar`;
        avatar.textContent = msg.type === 'user' ? this.config.ui.userAvatar : this.config.ui.botAvatar;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        
        const text = document.createElement('div');
        text.className = 'message-text';
        text.innerHTML = this.formatMessage(msg.content);
        
        bubble.appendChild(text);
        
        if (this.config.ui.showTimestamps && msg.timestamp) {
            const time = document.createElement('span');
            time.className = 'message-time';
            const date = new Date(msg.timestamp);
            time.textContent = date.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            bubble.appendChild(time);
        }
        
        contentDiv.appendChild(bubble);
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(contentDiv);
        
        this.elements.messages.appendChild(messageDiv);
        
        // Restaurer l'historique
        this.conversationHistory.push(msg);
        this.messageCount++;
        
        // Si le message contient des graphiques, les restaurer après
        if (msg.chartRequests && msg.chartRequests.length > 0) {
            // Les graphiques seront restaurés par restoreCharts()
        }
    }

    /**
     * Restaure tous les graphiques
     */
    async restoreCharts() {
        if (!this.charts) {
            console.warn('⚠ Charts component not available');
            return;
        }
        
        try {
            console.log('📊 Attempting to restore charts...');
            
            // Charger les données des graphiques
            const savedChartsData = localStorage.getItem(this.chartsDataKey);
            
            if (!savedChartsData) {
                console.log('ℹ No saved charts data found');
                return;
            }
            
            const chartsData = JSON.parse(savedChartsData);
            
            // Importer les données dans le composant Charts
            this.charts.importChartsData(chartsData);
            
            console.log(`📥 Imported data for ${Object.keys(chartsData).length} charts`);
            
            // Parcourir l'historique pour restaurer les graphiques
            for (const msg of this.conversationHistory) {
                if (msg.chartRequests && msg.chartRequests.length > 0) {
                    await this.restoreChartsForMessage(msg.chartRequests);
                }
            }
            
            console.log('✅ Charts restored successfully');
            
        } catch (error) {
            console.error('❌ Error restoring charts:', error);
        }
    }

    /**
     * Restaure les graphiques d'un message spécifique
     */
    async restoreChartsForMessage(chartRequests) {
        for (const request of chartRequests) {
            const chartContainer = document.createElement('div');
            chartContainer.className = 'chart-message';
            
            // Ajouter l'attribut data pour identifier le conteneur
            const chartId = `chart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            chartContainer.setAttribute('data-chart-container', chartId);
            
            this.elements.messages.appendChild(chartContainer);
            
            if (this.charts) {
                try {
                    await this.charts.createChart(request, chartContainer);
                    console.log(`✅ Chart restored: ${request.type}`);
                } catch (error) {
                    console.error(`❌ Failed to restore chart:`, error);
                }
            }
        }
        
        this.scrollToBottom();
    }

    // ============================================
    // AUTO-RESIZE TEXTAREA
    // ============================================
    autoResizeTextarea() {
        const textarea = this.elements.input;
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    // ============================================
    // SCROLL TO BOTTOM
    // ============================================
    scrollToBottom() {
        setTimeout(() => {
            this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
        }, 100);
    }

    // ============================================
    // DESTROY
    // ============================================
    destroy() {
        // Sauvegarder avant destruction
        this.saveConversation();
        this.saveChartsData();
        
        // Nettoyer les graphiques
        if (this.charts) {
            this.charts.destroyAllCharts();
        }
        
        // Supprimer le container
        if (this.elements.container) {
            this.elements.container.remove();
        }
    }
}

// ============================================
// EXPORT
// ============================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChatbotUI;
}

console.log('✅ ChatbotUI v2.0 loaded - With Conversation Persistence!');