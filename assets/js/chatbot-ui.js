// ============================================
// CHATBOT UI - PREMIUM INTERFACE
// Complete User Interface Management
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
            // Create UI structure
            this.createUI();
            
            // Get element references
            this.cacheElements();
            
            // Attach event listeners
            this.attachEventListeners();
            
            // Initialize components
            await this.initializeComponents();
            
            // Show welcome message
            this.showWelcomeMessage();
            
            // Show initial suggestions
            this.showInitialSuggestions();
            
            console.log('✅ Chatbot UI initialized');
            
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
            <!-- Particles Background -->
            <canvas id="particles-canvas"></canvas>
            
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
                            <h3 class="chatbot-title">Financial AI Assistant</h3>
                            <div class="chatbot-status">
                                <span class="status-indicator"></span>
                                <span>Online</span>
                            </div>
                        </div>
                    </div>
                    <div class="chatbot-header-actions">
                        <button class="chatbot-header-btn" id="clear-chat" aria-label="Clear chat" title="Clear chat">
                            🗑️
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
    }

    // ============================================
    // CACHE DOM ELEMENTS
    // ============================================
    cacheElements() {
        this.elements = {
            container: document.querySelector('.chatbot-container'),
            toggleBtn: document.getElementById('chatbot-toggle'),
            widget: document.getElementById('chatbot-widget'),
            messages: document.getElementById('chatbot-messages'),
            suggestions: document.getElementById('chatbot-suggestions'),
            input: document.getElementById('chatbot-input'),
            sendBtn: document.getElementById('chatbot-send'),
            clearBtn: document.getElementById('clear-chat'),
            minimizeBtn: document.getElementById('minimize-chat'),
            particlesCanvas: document.getElementById('particles-canvas')
        };
    }

    // ============================================
    // ATTACH EVENT LISTENERS
    // ============================================
    attachEventListeners() {
        // Toggle button
        this.elements.toggleBtn.addEventListener('click', () => this.toggleChat());
        
        // Minimize button
        this.elements.minimizeBtn.addEventListener('click', () => this.toggleChat());
        
        // Clear button
        this.elements.clearBtn.addEventListener('click', () => this.clearChat());
        
        // Send button
        this.elements.sendBtn.addEventListener('click', () => this.sendMessage());
        
        // Input field
        this.elements.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Auto-resize textarea
        this.elements.input.addEventListener('input', () => {
            this.autoResizeTextarea();
        });
        
        // Suggestions delegation
        this.elements.suggestions.addEventListener('click', (e) => {
            if (e.target.classList.contains('suggestion-chip')) {
                this.onSuggestionClick(e.target.textContent);
            }
        });
    }

    // ============================================
    // INITIALIZE COMPONENTS
    // ============================================
    async initializeComponents() {
        // Initialize engine
        if (typeof FinancialChatbotEngine !== 'undefined') {
            this.engine = new FinancialChatbotEngine(this.config);
        }
        
        // Initialize charts
        if (typeof ChatbotCharts !== 'undefined') {
            this.charts = new ChatbotCharts(this.config);
        }
        
        // Initialize suggestions
        if (typeof ChatbotSuggestions !== 'undefined') {
            this.suggestions = new ChatbotSuggestions(this.config);
        }
        
        // Initialize particles background
        if (this.config.ui.enableParticles && this.elements.particlesCanvas) {
            this.initializeParticles();
        }
    }

    // ============================================
    // TOGGLE CHAT
    // ============================================
    toggleChat() {
        this.isOpen = !this.isOpen;
        
        if (this.isOpen) {
            this.elements.widget.classList.remove('hidden');
            this.elements.widget.classList.add('bounce-in');
            this.elements.input.focus();
        } else {
            this.elements.widget.classList.add('hidden');
        }
    }

    // ============================================
    // SEND MESSAGE
    // ============================================
    async sendMessage() {
        const message = this.elements.input.value.trim();
        
        if (!message || this.isTyping) return;
        
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
            this.addMessage('bot', response.text);
            
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
            this.addMessage('bot', '⚠️ Sorry, I encountered an error. Please try again.');
        }
    }

    // ============================================
    // ADD MESSAGE
    // ============================================
    addMessage(type, content) {
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
        
        // Format content with markdown-like syntax
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
    }

    // ============================================
    // FORMAT MESSAGE
    // ============================================
    formatMessage(text) {
        // Convert markdown-like formatting to HTML
        let formatted = text
            // Bold: **text**
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            // Italic: *text*
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            // Code: `text`
            .replace(/`(.+?)`/g, '<code>$1</code>')
            // Line breaks
            .replace(/\n/g, '<br>')
            // Emoji enhancement (keep as is)
            .replace(/([\u{1F300}-\u{1F9FF}])/gu, '<span class="emoji">$1</span>');
        
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
    // CHARTS
    // ============================================
    async generateCharts(chartRequests) {
        for (const request of chartRequests) {
            const chartContainer = document.createElement('div');
            chartContainer.className = 'chart-message';
            
            this.elements.messages.appendChild(chartContainer);
            
            if (this.charts) {
                await this.charts.createChart(request, chartContainer);
            }
            
            this.scrollToBottom();
        }
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
    // CLEAR CHAT
    // ============================================
    clearChat() {
        if (confirm('Clear all messages?')) {
            this.elements.messages.innerHTML = '';
            this.messageCount = 0;
            
            if (this.engine) {
                this.engine.clearHistory();
            }
            
            if (this.charts) {
                this.charts.destroyAllCharts();
            }
            
            this.showWelcomeMessage();
            this.showInitialSuggestions();
        }
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
    // PARTICLES ANIMATION
    // ============================================
    initializeParticles() {
        const canvas = this.elements.particlesCanvas;
        const ctx = canvas.getContext('2d');
        
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const particles = [];
        const particleCount = this.config.ui.particleCount || 50;
        
        // Create particles
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 2 + 1
            });
        }
        
        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(p => {
                // Update position
                p.x += p.vx;
                p.y += p.vy;
                
                // Bounce off edges
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
                
                // Draw particle
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(102, 126, 234, 0.5)';
                ctx.fill();
            });
            
            // Draw connections
            particles.forEach((p1, i) => {
                particles.slice(i + 1).forEach(p2 => {
                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < 100) {
                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = `rgba(102, 126, 234, ${0.2 * (1 - distance / 100)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                });
            });
            
            requestAnimationFrame(animate);
        };
        
        animate();
        
        // Resize handler
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
    }

    // ============================================
    // DESTROY
    // ============================================
    destroy() {
        if (this.charts) {
            this.charts.destroyAllCharts();
        }
        
        if (this.elements.container) {
            this.elements.container.remove();
        }
    }
}

// ============================================
// AUTO-INITIALIZE ON DOM READY
// ============================================
if (typeof ChatbotConfig !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        window.chatbotUI = new ChatbotUI(ChatbotConfig);
    });
}

// ============================================
// EXPORT
// ============================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChatbotUI;
}