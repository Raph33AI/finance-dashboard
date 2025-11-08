/* ========================================
   INTERFACE UTILISATEUR DU CHATBOT
   Gestion complète de l'affichage et interactions
   ======================================== */

class ChatbotUI {
    constructor(containerId, geminiApiKey, finnhubApiKey) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Container ${containerId} not found`);
            return;
        }
        
        this.geminiApiKey = geminiApiKey;
        this.finnhubApiKey = finnhubApiKey;
        this.isOpen = false;
        this.messageIdCounter = 0;
        
        // Initialisation des composants
        this.engine = new FinancialChatbotEngine(geminiApiKey, finnhubApiKey);
        this.suggestions = new ChatbotSuggestions();
        this.charts = new ChatbotCharts();
        
        this.init();
    }

    /**
     * Initialisation
     */
    init() {
        this.render();
        this.attachEventListeners();
        this.loadConversationHistory();
        
        // Message de bienvenue après un court délai
        setTimeout(() => {
            this.showWelcomeMessage();
            this.showSuggestions('welcome');
        }, 500);
    }

    /**
     * Rendu du HTML complet
     */
    render() {
        this.container.innerHTML = `
            <div class="chatbot-container">
                <!-- Bouton de lancement flottant -->
                <button class="chatbot-launcher" id="chatbot-launcher" aria-label="Ouvrir le chatbot">
                    <svg class="chatbot-launcher-icon" viewBox="0 0 24 24">
                        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
                        <circle cx="9" cy="10" r="1.5"/>
                        <circle cx="15" cy="10" r="1.5"/>
                    </svg>
                    <span class="chatbot-notification-badge" id="chatbot-badge" style="display: none;">1</span>
                </button>

                <!-- Fenêtre du chatbot -->
                <div class="chatbot-window" id="chatbot-window">
                    <!-- Header -->
                    <div class="chatbot-header">
                        <div class="chatbot-header-info">
                            <div class="chatbot-avatar">
                                💎
                                <span class="chatbot-status-indicator"></span>
                            </div>
                            <div class="chatbot-title-section">
                                <h3>Aurelia</h3>
                                <p>Expert IA • Powered by Gemini</p>
                            </div>
                        </div>
                        <button class="chatbot-close-btn" id="chatbot-close" aria-label="Fermer le chatbot">
                            <svg viewBox="0 0 24 24">
                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                            </svg>
                        </button>
                    </div>

                    <!-- Suggestions intelligentes -->
                    <div class="chatbot-suggestions" id="chatbot-suggestions" style="display: none;">
                        <div class="chatbot-suggestions-title">💡 Suggestions pour vous</div>
                        <div class="chatbot-suggestions-grid" id="chatbot-suggestions-grid"></div>
                    </div>

                    <!-- Quick Actions -->
                    <div class="chatbot-quick-actions">
                        <button class="chatbot-quick-action" data-action="top-ipos">
                            <span class="chatbot-quick-action-icon">🎯</span>
                            Top IPOs
                        </button>
                        <button class="chatbot-quick-action" data-action="analyze">
                            <span class="chatbot-quick-action-icon">📊</span>
                            Analyser
                        </button>
                        <button class="chatbot-quick-action" data-action="compare">
                            <span class="chatbot-quick-action-icon">⚖️</span>
                            Comparer
                        </button>
                        <button class="chatbot-quick-action" data-action="news">
                            <span class="chatbot-quick-action-icon">📰</span>
                            News
                        </button>
                        <button class="chatbot-quick-action" data-action="help">
                            <span class="chatbot-quick-action-icon">❓</span>
                            Aide
                        </button>
                    </div>

                    <!-- Messages -->
                    <div class="chatbot-messages" id="chatbot-messages"></div>

                    <!-- Input -->
                    <div class="chatbot-input-area">
                        <div class="chatbot-input-wrapper">
                            <textarea 
                                class="chatbot-input" 
                                id="chatbot-input" 
                                placeholder="Posez votre question financière..."
                                rows="1"
                                maxlength="2000"
                            ></textarea>
                            <button class="chatbot-send-btn" id="chatbot-send" aria-label="Envoyer le message">
                                <svg viewBox="0 0 24 24">
                                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Attache tous les événements
     */
    attachEventListeners() {
        // Launcher
        document.getElementById('chatbot-launcher').addEventListener('click', () => {
            this.toggle();
        });

        // Close
        document.getElementById('chatbot-close').addEventListener('click', () => {
            this.close();
        });

        // Send button
        document.getElementById('chatbot-send').addEventListener('click', () => {
            this.sendMessage();
        });

        // Input - Enter key
        const input = document.getElementById('chatbot-input');
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Auto-resize textarea
        input.addEventListener('input', () => {
            input.style.height = 'auto';
            input.style.height = Math.min(input.scrollHeight, 120) + 'px';
        });

        // Quick actions
        document.querySelectorAll('.chatbot-quick-action').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.handleQuickAction(action);
            });
        });
    }

    /**
     * Ouvre/ferme le chatbot
     */
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    /**
     * Ouvre le chatbot
     */
    open() {
        const window = document.getElementById('chatbot-window');
        const launcher = document.getElementById('chatbot-launcher');
        const badge = document.getElementById('chatbot-badge');
        
        window.classList.add('active');
        launcher.classList.add('active');
        badge.style.display = 'none';
        this.isOpen = true;
        
        // Focus sur l'input
        setTimeout(() => {
            document.getElementById('chatbot-input').focus();
        }, 300);
        
        // Analytics
        this.trackEvent('chatbot_opened');
    }

    /**
     * Ferme le chatbot
     */
    close() {
        const window = document.getElementById('chatbot-window');
        const launcher = document.getElementById('chatbot-launcher');
        
        window.classList.remove('active');
        launcher.classList.remove('active');
        this.isOpen = false;
        
        // Analytics
        this.trackEvent('chatbot_closed');
    }

    /**
     * Envoie un message
     */
    async sendMessage() {
        const input = document.getElementById('chatbot-input');
        const message = input.value.trim();
        
        if (!message) return;
        
        // Désactive l'input pendant le traitement
        this.setInputState(false);
        
        // Affiche le message utilisateur
        this.addMessage('user', message);
        
        // Clear input
        input.value = '';
        input.style.height = 'auto';
        
        // Ajoute à l'historique des suggestions
        this.suggestions.addToHistory(message);
        
        // Affiche le typing indicator
        this.showTyping();
        
        try {
            // Traitement par l'IA
            const response = await this.engine.processMessage(message);
            
            // Cache le typing indicator
            this.hideTyping();
            
            // Affiche la réponse
            this.addMessage('bot', response);
            
            // Affiche de nouvelles suggestions contextuelles
            this.showSuggestions(null, message);
            
            // Sauvegarde la conversation
            this.saveConversationHistory();
            
            // Analytics
            this.trackEvent('message_sent', { message_length: message.length });
            
        } catch (error) {
            this.hideTyping();
            console.error('Send message error:', error);
            this.addMessage('bot', {
                text: "😔 Désolé, une erreur s'est produite. Veuillez réessayer dans quelques instants.",
                type: 'error'
            });
        } finally {
            // Réactive l'input
            this.setInputState(true);
        }
    }

    /**
     * Ajoute un message à la conversation
     */
    addMessage(role, content) {
        const messagesContainer = document.getElementById('chatbot-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chatbot-message ${role}`;
        messageDiv.id = `message-${++this.messageIdCounter}`;
        
        const time = new Date().toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        const avatar = role === 'bot' ? '💎' : '👤';
        
        let contentHTML = '';
        
        if (typeof content === 'string') {
            contentHTML = `<div class="chatbot-message-bubble">${this.formatText(content)}</div>`;
        } else {
            // Contenu structuré
            contentHTML = this.renderStructuredContent(content);
        }
        
        messageDiv.innerHTML = `
            <div class="chatbot-message-avatar">${avatar}</div>
            <div class="chatbot-message-content">
                ${contentHTML}
                <div class="chatbot-message-time">${time}</div>
            </div>
        `;
        
        messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    /**
     * Rendu du contenu structuré
     */
    renderStructuredContent(content) {
        let html = `<div class="chatbot-message-bubble">${this.formatText(content.text)}</div>`;
        
        // Rendu des graphiques
        if (content.hasChart && content.chartData) {
            const charts = Array.isArray(content.chartData) ? content.chartData : [content.chartData];
            
            charts.forEach((chartData, index) => {
                const chartId = this.charts.generateChartId();
                html += `
                    <div class="chatbot-chart-container">
                        <div class="chatbot-chart-title">${chartData.title || 'Graphique'}</div>
                        <div id="${chartId}" class="chatbot-chart-canvas"></div>
                    </div>
                `;
                
                // Crée le graphique après insertion du HTML
                setTimeout(() => {
                    this.charts.createChartFromData(chartId, chartData);
                }, 100);
            });
        }
        
        // Rendu des données IPO
        if (content.ipoData && Array.isArray(content.ipoData)) {
            content.ipoData.forEach(ipo => {
                html += this.renderIPOCard(ipo);
            });
        }
        
        // Rendu des tableaux
        if (content.tables && content.tables.length > 0) {
            content.tables.forEach(table => {
                html += this.renderMarkdownTable(table);
            });
        }
        
        // Rendu des actions suggérées
        if (content.actions && content.actions.length > 0) {
            html += this.renderActions(content.actions);
        }
        
        // Disclaimer si nécessaire
        if (content.hasDisclaimer) {
            html += `
                <div class="chatbot-disclaimer">
                    <span class="chatbot-disclaimer-icon">⚠️</span>
                    <div>Ceci n'est pas un conseil en investissement. Faites vos propres recherches (DYOR).</div>
                </div>
            `;
        }
        
        return html;
    }

    /**
     * Rendu d'une carte IPO
     */
    renderIPOCard(ipo) {
        const scoreClass = ipo.totalScore >= 80 ? 'high' : ipo.totalScore >= 60 ? 'medium' : 'low';
        
        return `
            <div class="chatbot-ipo-card">
                <div class="chatbot-ipo-card-header">
                    <div>
                        <div class="chatbot-ipo-card-title">${ipo.name}</div>
                        <div class="chatbot-ipo-card-symbol">${ipo.symbol}</div>
                    </div>
                    <div class="chatbot-ipo-score ${scoreClass}">${ipo.totalScore}/100</div>
                </div>
                
                <div class="chatbot-ipo-card-details">
                    <div class="chatbot-ipo-detail">
                        <span class="chatbot-ipo-detail-label">Rating</span>
                        <span class="chatbot-ipo-detail-value">${ipo.rating}</span>
                    </div>
                    <div class="chatbot-ipo-detail">
                        <span class="chatbot-ipo-detail-label">Date</span>
                        <span class="chatbot-ipo-detail-value">${ipo.date || 'TBD'}</span>
                    </div>
                    <div class="chatbot-ipo-detail">
                        <span class="chatbot-ipo-detail-label">Price Range</span>
                        <span class="chatbot-ipo-detail-value">${ipo.priceRange || 'TBD'}</span>
                    </div>
                    <div class="chatbot-ipo-detail">
                        <span class="chatbot-ipo-detail-label">Shares</span>
                        <span class="chatbot-ipo-detail-value">${ipo.shares || 'TBD'}</span>
                    </div>
                </div>
                
                ${ipo.opportunities && ipo.opportunities.length > 0 ? `
                <div class="chatbot-ipo-card-action">
                    <button class="chatbot-ipo-card-btn" onclick="window.open('/future-ipo.html?symbol=${ipo.symbol}', '_blank')">
                        Voir les détails →
                    </button>
                </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Rendu d'un tableau markdown
     */
    renderMarkdownTable(tableMarkdown) {
        const lines = tableMarkdown.split('\n').filter(l => l.trim());
        if (lines.length < 2) return '';
        
        let html = '<table class="chatbot-table">';
        
        // Header
        const headers = lines[0].split('|').filter(h => h.trim()).map(h => h.trim());
        html += '<thead><tr>';
        headers.forEach(header => {
            html += `<th>${header}</th>`;
        });
        html += '</tr></thead>';
        
        // Body (skip separator line)
        html += '<tbody>';
        for (let i = 2; i < lines.length; i++) {
            const cells = lines[i].split('|').filter(c => c.trim()).map(c => c.trim());
            html += '<tr>';
            cells.forEach(cell => {
                html += `<td>${cell}</td>`;
            });
            html += '</tr>';
        }
        html += '</tbody></table>';
        
        return html;
    }

    /**
     * Rendu des actions suggérées
     */
    renderActions(actions) {
        return `
            <div class="chatbot-actions">
                <div class="chatbot-actions-title">🎬 Actions suggérées</div>
                <ul class="chatbot-actions-list">
                    ${actions.map(action => `<li>${action}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    /**
     * Formate le texte (markdown simple)
     */
    formatText(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }

    /**
     * Affiche l'indicateur de typing
     */
    showTyping() {
        const messagesContainer = document.getElementById('chatbot-messages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chatbot-message bot';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="chatbot-message-avatar">💎</div>
            <div class="chatbot-message-content">
                <div class="chatbot-typing">
                    <div class="chatbot-typing-dot"></div>
                    <div class="chatbot-typing-dot"></div>
                    <div class="chatbot-typing-dot"></div>
                </div>
            </div>
        `;
        messagesContainer.appendChild(typingDiv);
        this.scrollToBottom();
    }

    /**
     * Cache l'indicateur de typing
     */
    hideTyping() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    /**
     * Scroll vers le bas
     */
    scrollToBottom() {
        const messagesContainer = document.getElementById('chatbot-messages');
        setTimeout(() => {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 100);
    }

    /**
     * Message de bienvenue
     */
    showWelcomeMessage() {
        this.addMessage('bot', {
            text: `👋 **Bonjour ! Je suis Aurelia**, votre assistant financier IA alimenté par Google Gemini.

Je peux vous aider à :

🎯 **Trouver les meilleures IPOs** avec analyse approfondie
📊 **Analyser des actions** (REX, bilans, cash flow sur plusieurs années)
⚖️ **Comparer des entreprises** avec graphiques et tableaux
📰 **Suivre l'actualité** financière en temps réel
📚 **Répondre à vos questions** sur la finance

**Comment puis-je vous aider aujourd'hui ?**`,
            type: 'welcome',
            hasChart: false
        });
    }

    /**
     * Affiche les suggestions
     */
    showSuggestions(context = null, userMessage = '') {
        const suggestionsContainer = document.getElementById('chatbot-suggestions');
        const suggestionsGrid = document.getElementById('chatbot-suggestions-grid');
        
        const suggestions = this.suggestions.getContextualSuggestions(context, userMessage);
        
        if (suggestions.length === 0) {
            suggestionsContainer.style.display = 'none';
            return;
        }
        
        suggestionsGrid.innerHTML = '';
        
        suggestions.forEach(suggestion => {
            const card = document.createElement('div');
            card.className = 'chatbot-suggestion-card';
            card.innerHTML = `
                <span class="chatbot-suggestion-icon">${suggestion.icon}</span>
                <span class="chatbot-suggestion-text">${suggestion.text}</span>
            `;
            
            card.addEventListener('click', () => {
                document.getElementById('chatbot-input').value = suggestion.query;
                this.sendMessage();
                this.trackEvent('suggestion_clicked', { suggestion: suggestion.text });
            });
            
            suggestionsGrid.appendChild(card);
        });
        
        suggestionsContainer.style.display = 'block';
    }

    /**
     * Gère les actions rapides
     */
    handleQuickAction(action) {
        const actions = {
            'top-ipos': 'Quelles sont les 5 meilleures IPOs du moment avec analyse complète ?',
            'analyze': 'Analyse financière complète d\'Apple (AAPL) avec graphiques',
            'compare': 'Compare Tesla (TSLA) et Rivian (RIVN)',
            'news': 'Quelles sont les actualités financières majeures des dernières 48h ?',
            'help': 'Aide-moi à comprendre ce que tu peux faire'
        };
        
        const message = actions[action];
        if (message) {
            document.getElementById('chatbot-input').value = message;
            this.sendMessage();
            this.trackEvent('quick_action_used', { action });
        }
    }

    /**
     * Active/désactive l'input
     */
    setInputState(enabled) {
        const input = document.getElementById('chatbot-input');
        const sendBtn = document.getElementById('chatbot-send');
        
        input.disabled = !enabled;
        sendBtn.disabled = !enabled;
    }

    /**
     * Sauvegarde l'historique de conversation
     */
    saveConversationHistory() {
        try {
            const messages = Array.from(document.getElementById('chatbot-messages').children)
                .filter(msg => !msg.id.includes('typing'))
                .map(msg => ({
                    role: msg.classList.contains('user') ? 'user' : 'bot',
                    html: msg.innerHTML,
                    timestamp: new Date().toISOString()
                }));
            
            localStorage.setItem('chatbot_conversation', JSON.stringify(messages.slice(-20)));
        } catch (e) {
            console.error('Cannot save conversation:', e);
        }
    }

    /**
     * Charge l'historique de conversation
     */
    loadConversationHistory() {
        try {
            const saved = localStorage.getItem('chatbot_conversation');
            if (saved) {
                const messages = JSON.parse(saved);
                // On ne recharge pas automatiquement pour commencer frais
                // Mais on garde la possibilité
            }
        } catch (e) {
            console.error('Cannot load conversation:', e);
        }
    }

    /**
     * Efface l'historique
     */
    clearHistory() {
        const messagesContainer = document.getElementById('chatbot-messages');
        messagesContainer.innerHTML = '';
        this.engine.resetConversation();
        this.suggestions.clearHistory();
        localStorage.removeItem('chatbot_conversation');
        this.showWelcomeMessage();
        this.showSuggestions('welcome');
    }

    /**
     * Analytics tracking
     */
    trackEvent(eventName, data = {}) {
        try {
            if (typeof gtag !== 'undefined') {
                gtag('event', eventName, data);
            }
            console.log('Event:', eventName, data);
        } catch (e) {
            // Silent fail
        }
    }
}

// Export global
window.ChatbotUI = ChatbotUI;